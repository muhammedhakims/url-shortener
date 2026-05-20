# PulseLink Launcher - Booting Services
Clear-Host
Write-Host "==========================================================" -ForegroundColor Cyan
Write-Host "       PulseLink - Smart URL Shortener Launch Console     " -ForegroundColor Cyan
Write-Host "==========================================================" -ForegroundColor Cyan
Write-Host ""

# Verify both folders are present
if ((Test-Path server) -and (Test-Path client)) {
    # 1. Start Express Backend
    Write-Host "[1/3] Booting Express API Backend on port 5000..." -ForegroundColor Yellow
    Start-Process powershell -ArgumentList "-NoExit", "-Command", "cd server; Title 'PulseLink API Server'; npm run dev"
    
    # Wait for MongoDB to settle
    Start-Sleep -Seconds 3
    
    # 2. Start React Dev Server
    Write-Host "[2/3] Scaffolding React + Vite Frontend on port 5173..." -ForegroundColor Yellow
    Start-Process powershell -ArgumentList "-NoExit", "-Command", "cd client; Title 'PulseLink Frontend'; npm run dev"
    
    Start-Sleep -Seconds 1
    
    # 3. Done
    Write-Host ""
    Write-Host "==========================================================" -ForegroundColor Green
    Write-Host " [SUCCESS] PulseLink is running smoothly!                  " -ForegroundColor Green
    Write-Host "  -> Frontend Workspace: http://localhost:5173" -ForegroundColor Green
    Write-Host "  -> API Backend Core:   http://localhost:5000" -ForegroundColor Green
    Write-Host "==========================================================" -ForegroundColor Green
    Write-Host "Keep these terminal sessions active to monitor logs." -ForegroundColor Gray
} else {
    Write-Host "[ERROR] Missing either client/ or server/ project directories!" -ForegroundColor Red
    Write-Host "Please ensure you run this script from the project root workspace directory." -ForegroundColor Red
}
