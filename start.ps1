# PowerShell script to start the development server
# Run from the root TeamA directory

Write-Host "Installing dependencies for my-app..." -ForegroundColor Cyan
Set-Location my-app
npm install

Write-Host "`nStarting development server..." -ForegroundColor Cyan
npm run dev

Write-Host "`nPress Ctrl+C to stop the server" -ForegroundColor Yellow
