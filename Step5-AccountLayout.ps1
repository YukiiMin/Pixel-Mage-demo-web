# Step5-AccountLayout.ps1
# PowerShell script to reorganize customer account pages into (account) route group

Write-Host "🚀 Starting Account Layout Migration..." -ForegroundColor Cyan

# Define base paths
$basePath = "src/app/(customer)"
$accountPath = "$basePath/(account)"

# Create (account) route group directory
Write-Host "📁 Creating (account) route group..." -ForegroundColor Yellow
New-Item -ItemType Directory -Path $accountPath -Force

# Move account pages to (account) route group
$accountPages = @(
    "dashboard",
    "profile", 
    "wallet",
    "orders",
    "my-cards",
    "achievements"
)

foreach ($page in $accountPages) {
    $sourcePath = "$basePath/$page"
    $targetPath = "$accountPath/$page"
    
    if (Test-Path $sourcePath) {
        Write-Host "📦 Moving $page to (account) route group..." -ForegroundColor Green
        Move-Item -Path $sourcePath -Destination $targetPath -Force
    } else {
        Write-Host "⚠️  $page not found at $sourcePath" -ForegroundColor Red
    }
}

Write-Host "✅ Account Layout Migration Completed!" -ForegroundColor Green
Write-Host "📁 New structure: src/app/(customer)/(account)/" -ForegroundColor Cyan
Write-Host "🎯 Ready to implement CustomerSidebar layout!" -ForegroundColor Magenta
