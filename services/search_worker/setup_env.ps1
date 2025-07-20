# Environment setup for the RAG microservice
# Run this script before starting the service

# Set API keys as environment variables
$env:GOOGLE_API_KEY="YOUR_GOOGLE_API_KEY_HERE"
$env:APIFY_API_TOKEN="YOUR_APIFY_API_TOKEN_HERE"
$env:SEARXNG_BASE_URL="http://localhost:8080"

Write-Host "Environment variables set successfully!" -ForegroundColor Green
Write-Host "GOOGLE_API_KEY: ********" -ForegroundColor Yellow
Write-Host "APIFY_API_TOKEN: ********" -ForegroundColor Yellow
Write-Host "SEARXNG_BASE_URL: $env:SEARXNG_BASE_URL" -ForegroundColor Yellow

Write-Host "`nTo start the service:" -ForegroundColor Cyan
Write-Host "cd services/search_worker" -ForegroundColor White
Write-Host "pip install -r requirements.txt" -ForegroundColor White
Write-Host "python main.py" -ForegroundColor White
