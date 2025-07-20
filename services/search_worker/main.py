import os
import json
import asyncio
import requests
from typing import List, Dict, Any
from urllib.parse import urljoin, urlparse
import re
import time
import random
from bs4 import BeautifulSoup
import markdown

from fastapi import FastAPI, HTTPException
from pydantic import BaseModel
import uvicorn
import google.generativeai as genai
from googleapiclient.discovery import build
from googleapiclient.errors import HttpError
from apify_client import ApifyClient

# FastAPI app initialization
app = FastAPI(title="Research RAG Microservice", version="1.0.0")

# Environment variables
GOOGLE_API_KEY = os.getenv("GOOGLE_API_KEY")
APIFY_API_TOKEN = os.getenv("APIFY_API_TOKEN")
SEARXNG_BASE_URL = os.getenv("SEARXNG_BASE_URL", "http://localhost:8080")
GOOGLE_CSE_ID = os.getenv("GOOGLE_CSE_ID", "c07d6b77b2e584cc9")  # Default public CSE ID

# Validate API keys
if not GOOGLE_API_KEY:
    raise ValueError("GOOGLE_API_KEY environment variable is required")
if not APIFY_API_TOKEN:
    raise ValueError("APIFY_API_TOKEN environment variable is required")

# Initialize Google AI
genai.configure(api_key=GOOGLE_API_KEY)
model = genai.GenerativeModel('gemini-1.5-flash')

# Request/Response models
class SearchRequest(BaseModel):
    query: str
    max_results: int = 10

class SearchResponse(BaseModel):
    query: str
    answer: str
    citations: List[Dict[str, Any]]
    sources: List[str]

class RAGPipeline:
    def __init__(self):
        self.apify_client = ApifyClient(APIFY_API_TOKEN)
        self.chunk_size = 1000
        self.chunk_overlap = 200
        # Domains that commonly block crawlers
        self.blocked_domains = {
            'reddit.com', 'www.reddit.com',
            'twitter.com', 'x.com',
            'linkedin.com', 'www.linkedin.com',
            'facebook.com', 'www.facebook.com',
            'instagram.com', 'www.instagram.com',
            'tiktok.com', 'www.tiktok.com'
        }
        # User agents for rotation
        self.user_agents = [
            'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36',
            'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36',
            'Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36'
        ]
    
    async def stage_1_search_urls_searxng(self, query: str, max_results: int = 10) -> List[str]:
        """Stage 1a: Query SearxNG for top URLs"""
        search_url = f"{SEARXNG_BASE_URL}/search"
        params = {
            "q": query,
            "format": "json",
            "categories": "general"
        }
        
        response = requests.get(search_url, params=params, timeout=30)
        response.raise_for_status()
        
        search_results = response.json()
        urls = []
        
        for result in search_results.get("results", [])[:max_results]:
            if "url" in result:
                urls.append(result["url"])
        
        print(f"Stage 1a (SearxNG) Complete: Found {len(urls)} URLs")
        return urls
    
    async def stage_1_search_urls_google(self, query: str, max_results: int = 10) -> List[str]:
        """Stage 1b: Query Google Custom Search API for top URLs"""
        try:
            # Build Google Custom Search service
            service = build("customsearch", "v1", developerKey=GOOGLE_API_KEY)
            
            # Perform search
            result = service.cse().list(
                q=query,
                cx=GOOGLE_CSE_ID,
                num=min(max_results, 10)  # Google CSE max is 10 per request
            ).execute()
            
            urls = []
            for item in result.get('items', []):
                if 'link' in item:
                    urls.append(item['link'])
            
            print(f"Stage 1b (Google CSE) Complete: Found {len(urls)} URLs")
            return urls
            
        except HttpError as e:
            print(f"Google Custom Search API error: {str(e)}")
            raise
        except Exception as e:
            print(f"Error in Google Custom Search: {str(e)}")
            raise
    
    async def stage_1_search_urls_fallback(self, query: str, max_results: int = 10) -> List[str]:
        """Stage 1c: Basic fallback using common URLs for popular topics"""
        # Create some basic URLs based on the query
        # This is a simple fallback when all APIs fail
        base_urls = [
            f"https://en.wikipedia.org/wiki/{query.replace(' ', '_')}",
            f"https://www.investopedia.com/terms/{query.replace(' ', '-').lower()[0]}/{query.replace(' ', '-').lower()}.asp",
            f"https://www.forbes.com/sites/search/?q={query.replace(' ', '%20')}",
            f"https://www.businessinsider.com/s?q={query.replace(' ', '+')}",
            f"https://medium.com/search?q={query.replace(' ', '%20')}"
        ]
        
        print(f"Stage 1c (Fallback URLs) Complete: Generated {len(base_urls[:max_results])} URLs")
        return base_urls[:max_results]
    
    def filter_urls(self, urls: List[str]) -> List[str]:
        """Filter out problematic URLs that commonly block crawlers"""
        filtered_urls = []
        
        for url in urls:
            try:
                parsed = urlparse(url)
                domain = parsed.netloc.lower()
                
                # Skip blocked domains
                if domain in self.blocked_domains:
                    print(f"Skipping blocked domain: {domain}")
                    continue
                    
                # Skip URLs with suspicious patterns
                if any(pattern in url.lower() for pattern in ['login', 'signin', 'register', 'auth', 'cart', 'checkout']):
                    print(f"Skipping suspicious URL pattern: {url}")
                    continue
                    
                filtered_urls.append(url)
                
            except Exception as e:
                print(f"Error parsing URL {url}: {str(e)}")
                continue
                
        print(f"Filtered URLs: {len(urls)} -> {len(filtered_urls)}")
        return filtered_urls
    
    async def stage_1_search_urls(self, query: str, max_results: int = 10) -> List[str]:
        """Stage 1: Query search engines for top URLs with comprehensive fallback"""
        # Try SearxNG first
        try:
            urls = await self.stage_1_search_urls_searxng(query, max_results)
            return self.filter_urls(urls)
        except Exception as e:
            print(f"SearxNG search failed: {str(e)}")
            print("Falling back to Google Custom Search API...")
            
            # Fallback to Google Custom Search
            try:
                urls = await self.stage_1_search_urls_google(query, max_results)
                return self.filter_urls(urls)
            except Exception as google_e:
                print(f"Google Custom Search also failed: {str(google_e)}")
                print("Using basic URL fallback...")
                
                # Final fallback to basic URLs
                try:
                    urls = await self.stage_1_search_urls_fallback(query, max_results)
                    return self.filter_urls(urls)
                except Exception as fallback_e:
                    print(f"All search methods failed: {str(fallback_e)}")
                    raise HTTPException(
                        status_code=500, 
                        detail=f"All search methods failed. SearxNG: {str(e)}, Google: {str(google_e)}, Fallback: {str(fallback_e)}"
                    )
    
    async def stage_2_fallback_crawl(self, urls: List[str]) -> List[Dict[str, Any]]:
        """Fallback crawling method using direct HTTP requests with BeautifulSoup"""
        documents = []
        session = requests.Session()
        
        # Set session headers to look like a real browser
        session.headers.update({
            'User-Agent': random.choice(self.user_agents),
            'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,*/*;q=0.8',
            'Accept-Language': 'en-US,en;q=0.5',
            'Accept-Encoding': 'gzip, deflate',
            'Connection': 'keep-alive',
            'Upgrade-Insecure-Requests': '1',
        })
        
        for i, url in enumerate(urls):
            try:
                print(f"Fallback crawling {i+1}/{len(urls)}: {url}")
                
                # Add random delay to avoid being blocked
                if i > 0:
                    time.sleep(random.uniform(1, 3))
                    
                response = session.get(url, timeout=30)
                response.raise_for_status()
                
                # Parse HTML content
                soup = BeautifulSoup(response.content, 'html.parser')
                
                # Remove script and style elements
                for element in soup(["script", "style", "nav", "footer", "header"]):
                    element.decompose()
                
                # Extract title
                title_element = soup.find('title')
                title = title_element.get_text().strip() if title_element else url
                
                # Extract readable text
                content = soup.get_text(separator='\n', strip=True)
                
                # Clean up content
                lines = [line.strip() for line in content.split('\n') if line.strip()]
                clean_content = '\n'.join(lines)
                
                if clean_content and len(clean_content) > 100:  # Only include substantial content
                    documents.append({
                        "content": clean_content[:5000],  # Limit content length
                        "url": url,
                        "title": title,
                        "loadedTime": time.strftime('%Y-%m-%dT%H:%M:%S.000Z')
                    })
                    print(f"Successfully crawled: {title}")
                else:
                    print(f"Content too short, skipping: {url}")
                    
            except Exception as e:
                print(f"Error crawling {url}: {str(e)}")
                continue
                
        session.close()
        print(f"Fallback crawl complete: {len(documents)}/{len(urls)} documents")
        return documents
    
    async def stage_2_crawl_content(self, urls: List[str]) -> List[Dict[str, Any]]:
        """Stage 2: Use Apify to crawl and extract content from URLs"""
        try:
            documents = []
            
            # Prepare URLs for Apify Website Content Crawler
            start_urls = [{"url": url} for url in urls]
            
            # Configure Apify crawler with anti-blocking and strict limits
            run_input = {
                "startUrls": start_urls,
                "maxCrawlPages": len(urls),
                "crawlerType": "playwright:firefox",  # Firefox with stealth
                "includeUrlGlobs": [],
                "excludeUrlGlobs": [],
                "ignoreCanonicalUrl": True,  # Skip canonical checks
                "maxCrawlDepth": 0,  # Only crawl start URLs
                "maxResults": len(urls),
                "maxRequestsPerMinute": 60,  # Slower to avoid detection
                "maxSessionPoolSize": 5,  # Fewer sessions
                "maxSessionsPerCrawl": 3,  # Even fewer for stealth
                "proxyConfiguration": {
                    "useApifyProxy": True,
                    "proxyCountryCode": "US"  # Use US proxies
                },
                "textContent": "readableText",  # Extract readable text
                "saveHtml": False,
                "saveMarkdown": False,
                "saveScreenshots": False,
                "maxScrollHeightPixels": 500,  # Minimal scrolling
                "removeElementsCssSelector": "nav, footer, script, style, noscript, svg, .advertisement, .ads, .popup",
                "requestTimeoutSecs": 45,  # Longer timeout for slow sites
                "navigationTimeoutSecs": 45,  # Longer navigation timeout
                "maxConcurrency": 2,  # Lower concurrency for stealth
                "waitForSelector": "body",  # Wait for body to load
                "waitForSelectorTimeoutMillis": 10000,  # 10 second wait
                # Anti-blocking measures
                "stealthMode": True,  # Enable stealth mode
                "randomizeUserAgent": True,  # Randomize user agents
                "blockResources": ["stylesheet", "image", "font", "media"],  # Block resources for speed
                "skipLinkExtraction": True,  # Don't extract new links
                # CRITICAL: Strict limits to prevent infinite loops
                "maxRetryCount": 1,  # Only 1 retry per URL
                "maxRequestRetries": 1,  # Only 1 retry per request
                "maxRunTimeMinutes": 8,  # 8 minute absolute limit
                # Handle failures gracefully
                "ignoreSslErrors": True,
                "ignoreHttpsErrors": True,
                "ignoreCorsAndCsp": True,
                # Additional anti-detection
                "sessionRotationSecs": 300,  # Rotate sessions every 5 minutes
                "maxSessionUsageCount": 3,  # Use each session max 3 times
            }
            
            # Run the Apify actor with timeout handling
            print(f"Starting Apify crawl for {len(urls)} URLs with strict limits...")
            run = self.apify_client.actor("apify/website-content-crawler").call(
                run_input=run_input,
                timeout_secs=600  # 10 minute absolute timeout
            )
            dataset_id = run["defaultDatasetId"]
            
            # Get dataset items
            dataset_items = self.apify_client.dataset(dataset_id).list_items()
            
            # Process documents
            for item in dataset_items.items:
                content = item.get("readableText", item.get("text", item.get("markdown", "")))
                if content and content.strip():
                    documents.append({
                        "content": content,
                        "url": item.get("url", ""),
                        "title": item.get("title", ""),
                        "loadedTime": item.get("loadedTime", "")
                    })
            
            # Accept partial results - don't fail if we got some documents
            total_urls = len(urls)
            success_rate = len(documents) / total_urls if total_urls > 0 else 0
            
            print(f"Stage 2 Complete: Crawled {len(documents)}/{total_urls} documents ({success_rate:.1%} success rate)")
            
            # Only fail if we got NO documents at all
            if len(documents) == 0:
                raise Exception(f"Failed to crawl any content from {total_urls} URLs")
                
            # Success if we got at least some documents (even if not all)
            if len(documents) < total_urls:
                print(f"Warning: Only {len(documents)} out of {total_urls} URLs were successfully crawled")
                
            return documents
            
        except Exception as e:
            print(f"Error in Stage 2 - Apify crawling: {str(e)}")
            # If we have some documents but got an error, try to continue with what we have
            if documents and len(documents) > 0:
                print(f"Continuing with {len(documents)} successfully crawled documents despite error")
                return documents
            else:
                print("Apify crawling failed completely, trying fallback method...")
                try:
                    # Try fallback crawling method
                    fallback_documents = await self.stage_2_fallback_crawl(urls)
                    if fallback_documents:
                        print(f"Fallback crawling succeeded with {len(fallback_documents)} documents")
                        return fallback_documents
                    else:
                        raise HTTPException(status_code=500, detail=f"Both Apify and fallback crawling failed: {str(e)}")
                except Exception as fallback_e:
                    print(f"Fallback crawling also failed: {str(fallback_e)}")
                    raise HTTPException(status_code=500, detail=f"All crawling methods failed. Apify: {str(e)}, Fallback: {str(fallback_e)}")
    
    async def stage_3_rag_synthesis(self, query: str, documents: List[Dict[str, Any]]) -> Dict[str, Any]:
        """Stage 3: AI synthesis with Google Gemini"""
        try:
            if not documents:
                raise ValueError("No documents available for synthesis")
            
            # Combine all document content
            combined_content = ""
            sources = []
            
            for i, doc in enumerate(documents[:5]):  # Limit to top 5 documents
                content = doc.get("content", "")[:2000]  # Limit content length
                url = doc.get("url", "")
                title = doc.get("title", "")
                
                combined_content += f"\n\n--- Source {i+1}: {title} ---\n{content}"
                if url:
                    sources.append(url)
            
            # Create synthesis prompt
            prompt = f"""
            Based on the following sources, provide a comprehensive answer to this question: {query}
            
            Requirements:
            1. Synthesize information from multiple sources
            2. Provide specific details and examples
            3. Structure your response clearly
            4. Mention which sources support key points
            
            Sources:
            {combined_content}
            
            Question: {query}
            
            Please provide a detailed, well-structured answer:
            """
            
            # Generate response with Gemini
            response = model.generate_content(prompt)
            answer = response.text
            
            # Create citations
            citations = []
            for i, doc in enumerate(documents[:5]):
                citations.append({
                    "id": i + 1,
                    "url": doc.get("url", ""),
                    "title": doc.get("title", "Untitled Source"),
                    "snippet": doc.get("content", "")[:200] + "..." if len(doc.get("content", "")) > 200 else doc.get("content", "")
                })
            
            result = {
                "answer": answer,
                "citations": citations,
                "sources": sources,
                "total_documents": len(documents),
                "total_chunks": len(documents)
            }
            
            print(f"Stage 3 Complete: Generated synthesis with {len(citations)} citations")
            return result
            
        except Exception as e:
            print(f"Error in Stage 3 - RAG synthesis: {str(e)}")
            raise HTTPException(status_code=500, detail=f"RAG synthesis failed: {str(e)}")

# Initialize pipeline
rag_pipeline = RAGPipeline()

@app.post("/research", response_model=SearchResponse)
async def research_endpoint(request: SearchRequest):
    """
    Main research endpoint that executes the three-stage RAG pipeline
    """
    try:
        print(f"Starting research pipeline for query: {request.query}")
        
        # Stage 1: Search for URLs
        urls = await rag_pipeline.stage_1_search_urls(request.query, request.max_results)
        
        if not urls:
            raise HTTPException(status_code=404, detail="No relevant URLs found")
        
        # Stage 2: Crawl content (accept partial results)
        documents = await rag_pipeline.stage_2_crawl_content(urls)
        
        if not documents:
            raise HTTPException(status_code=500, detail="No content could be extracted from any URLs")
        
        # Stage 3: RAG synthesis
        synthesis_result = await rag_pipeline.stage_3_rag_synthesis(request.query, documents)
        
        # Prepare response
        response = SearchResponse(
            query=request.query,
            answer=synthesis_result["answer"],
            citations=synthesis_result["citations"],
            sources=synthesis_result["sources"]
        )
        
        print(f"Research pipeline completed successfully")
        return response
        
    except HTTPException:
        raise
    except Exception as e:
        print(f"Unexpected error in research pipeline: {str(e)}")
        raise HTTPException(status_code=500, detail=f"Research pipeline failed: {str(e)}")

@app.get("/health")
async def health_check():
    """Health check endpoint"""
    return {
        "status": "healthy",
        "searxng_url": SEARXNG_BASE_URL,
        "google_api_configured": bool(GOOGLE_API_KEY),
        "apify_api_configured": bool(APIFY_API_TOKEN)
    }

if __name__ == "__main__":
    uvicorn.run(app, host="0.0.0.0", port=8000)
