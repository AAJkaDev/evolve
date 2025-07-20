# Quick Setup Guide for Research Service

## 🚀 Get Your Research Service Working Now

### Option 1: Enable Google Custom Search API (Recommended)

1. **Go to Google Cloud Console**: https://console.developers.google.com/apis/api/customsearch.googleapis.com/overview?project=878171091445

2. **Click "Enable" to activate the Custom Search API**

3. **Restart your service**:
   ```powershell
   $env:GOOGLE_API_KEY="YOUR_GOOGLE_API_KEY_HERE"
   $env:APIFY_API_TOKEN="YOUR_APIFY_API_TOKEN_HERE"
   $env:SEARXNG_BASE_URL="http://localhost:8080"
   python main.py
   ```

### Option 2: Use Basic Fallback URLs (Works Immediately)

The service now has a 3-tier fallback system:
1. **SearxNG** (when available)
2. **Google Custom Search API** (when enabled)  
3. **Basic Fallback URLs** (always works)

The basic fallback generates URLs like:
- Wikipedia articles
- Investopedia definitions
- Forbes search results
- Business Insider searches
- Medium articles

### Install Missing Dependencies

If you get import errors, install missing packages:

```powershell
pip install google-api-python-client
```

### Test the Service

1. **Start the service**:
   ```powershell
   python main.py
   ```

2. **Test with curl** (in another terminal):
   ```powershell
   curl -X POST http://localhost:8000/research -H "Content-Type: application/json" -d "{\"query\": \"how to become a billionaire\", \"max_results\": 5}"
   ```

### Current Status

✅ **SearxNG**: Will try first (fails if not running on localhost:8080)  
⚠️ **Google Custom Search**: Needs to be enabled in Google Cloud Console  
✅ **Basic Fallback**: Always works, generates relevant URLs for common topics

The service should now work with the basic fallback even if the first two methods fail!

## 🔧 How the Fallback Works

1. **Try SearxNG** → If fails...
2. **Try Google Custom Search** → If fails...  
3. **Use Basic URL Generation** → Always succeeds

This ensures your research service always has URLs to crawl and process, even without external search APIs.

## 🎯 Next Steps

Once working, you can improve by:
1. Setting up SearxNG locally
2. Enabling Google Custom Search API
3. Adding more sophisticated URL generation logic

Your research service should now work! Try it out! 🚀
