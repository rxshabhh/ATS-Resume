# Start ATS Resume Analyzer Frontend
# Run from workspace root: .\execution\start_frontend.ps1

$frontendDir = Join-Path $PSScriptRoot "..\frontend"
Set-Location $frontendDir

Write-Host "Starting Vite dev server at http://localhost:5173 ..." -ForegroundColor Cyan
npm run dev
