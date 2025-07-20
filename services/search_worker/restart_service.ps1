# PowerShell script to restart the search worker service
Write-Host "Stopping any existing search worker processes..." -ForegroundColor Yellow

# Kill any existing Python processes running main.py
Get-Process python -ErrorAction SilentlyContinue | Where-Object {$_.CommandLine -like "*main.py*"} | Stop-Process -Force

# Wait a moment for processes to fully stop
Start-Sleep -Seconds 2

Write-Host "Starting search worker service..." -ForegroundColor Green

# Set environment variables (update these with your actual values)
$env:GOOGLE_API_KEY = "YOUR_GOOGLE_API_KEY_HERE"
$env:APIFY_API_TOKEN = "YOUR_APIFY_API_TOKEN_HERE"
$env:SEARXNG_BASE_URL = "http://localhost:8080"

# Change to the search worker directory
Set-Location "C:\evolve\services\search_worker"

# Start the service
Write-Host "Service is starting at http://0.0.0.0:8000" -ForegroundColor Cyan
Write-Host "Health check available at http://localhost:8000/health" -ForegroundColor Cyan
Write-Host "Press Ctrl+C to stop the service" -ForegroundColor Yellow

python main.py
