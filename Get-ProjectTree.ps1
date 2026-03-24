function Get-ProjectTree {
    param (
        [string]$Path = ".",
        [string[]]$Exclude = @("node_modules", ".next", ".git", "dist", "build"),
        [int]$MaxDepth = 5
    )

    $rootPath = Resolve-Path $Path
    Write-Host "`nStructure of: $($rootPath.Path)" -ForegroundColor Cyan
    Write-Host "------------------------------------------------"

    function Show-Node {
        param (
            [string]$CurrentPath,
            [int]$Level,
            [string]$Prefix = ""
        )

        if ($Level -gt $MaxDepth) { return }

        $items = Get-ChildItem -Path $CurrentPath | Where-Object { $Exclude -notcontains $_.Name }
        $count = $items.Count
        $i = 0

        foreach ($item in $items) {
            $i++
            $isLast = ($i -eq $count)
            $connector = if ($isLast) { "└── " } else { "├── " }

            # Màu sắc cho thư mục và file
            if ($item.PSIsContainer) {
                Write-Host "$Prefix$connector$($item.Name)/" -ForegroundColor Yellow
                $branch = if ($isLast) { "    " } else { "│   " }
                $newPrefix = $Prefix + $branch
                Show-Node -CurrentPath $item.FullName -Level ($Level + 1) -Prefix $newPrefix
            }
            else {
                Write-Host "$Prefix$connector$($item.Name)" -ForegroundColor Gray
            }
        }
    }

    Show-Node -CurrentPath $rootPath.Path -Level 0
    Write-Host "------------------------------------------------`n"
}

# Chạy với đường dẫn mặc định của bạn
Get-ProjectTree -Path "d:\Minh\FU_Learning\EXE201\PixelMage_Rebase\project_src\WEB\Pixel-Mage-demo-web"
