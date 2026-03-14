# Start ATS Resume Analyzer Backend
# Run from workspace root: .\execution\start_backend.ps1

$backendDir = Join-Path $PSScriptRoot "..\backend"
Set-Location $backendDir

Write-Host "Starting FastAPI backend at http://localhost:8000 ..." -ForegroundColor Cyan
& ".\venv\Scripts\uvicorn" app.main:app --reload --port 8000
