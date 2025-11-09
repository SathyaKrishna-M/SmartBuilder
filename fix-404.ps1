# PowerShell script to fix 404 errors
Write-Host "Clearing Next.js build cache..." -ForegroundColor Yellow
if (Test-Path .next) {
    Remove-Item -Recurse -Force .next
    Write-Host "Cleared .next directory" -ForegroundColor Green
}

Write-Host "Clearing node_modules..." -ForegroundColor Yellow
if (Test-Path node_modules) {
    Remove-Item -Recurse -Force node_modules
    Write-Host "Cleared node_modules directory" -ForegroundColor Green
}

Write-Host "Reinstalling dependencies..." -ForegroundColor Yellow
npm install

Write-Host "Starting dev server..." -ForegroundColor Yellow
npm run dev

