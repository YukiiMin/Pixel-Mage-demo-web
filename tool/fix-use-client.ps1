# Lấy đường dẫn thư mục src (lùi lại 1 cấp từ thư mục tool)
$srcPath = Join-Path -Path $PSScriptRoot -ChildPath "..\src"

if (-not (Test-Path $srcPath)) {
    Write-Host "Không tìm thấy thư mục src. Hãy chắc chắn script nằm trong thư mục tool/ nhé!" -ForegroundColor Red
    exit
}

# Danh sách các thư viện bắt buộc phải chạy ở Client (cần "use client")
$clientLibs = @(
    "framer-motion",
    "react-hook-form",
    "zustand",
    "@tanstack/react-query",
    "recharts",
    "embla-carousel-react",
    "react-day-picker",
    "react-resizable-panels",
    "cmdk",
    "vaul",
    "input-otp",
    "next-themes",
    "sonner",
    "@radix-ui/react-" # Bắt trọn ổ tất cả các component của Radix UI
)

# Tạo Regex pattern từ danh sách trên (thoát các ký tự đặc biệt để không bị lỗi regex)
$escapedLibs = $clientLibs | ForEach-Object { [regex]::Escape($_) }
$pattern = $escapedLibs -join "|"

$files = Get-ChildItem -Path $srcPath -Recurse -Include *.tsx, *.ts
$fixedCount = 0

Write-Host "Đang quét và tự động chèn 'use client' vào các file..." -ForegroundColor Cyan

foreach ($file in $files) {
    $filePath = $file.FullName
    # DÙNG -LiteralPath thay vì -Path để bỏ qua lỗi ngoặc vuông [id] của Next.js
    $content = Get-Content -LiteralPath $filePath -Raw -Encoding UTF8

    # Nếu file có import một trong các thư viện thuộc danh sách trên
    if ($content -match $pattern) {
        # Nếu file chưa có "use client" hoặc 'use client'
        if ($content -notmatch "['`"]use client['`"]") {
            Write-Host "[ĐANG FIX] Tự động chèn vào: $($file.Name)" -ForegroundColor Yellow

            # Thêm "use client"; và xuống dòng vào đầu file
            $newContent = "`"use client`";`n" + $content

            # DÙNG -LiteralPath để ghi đè lại file
            Set-Content -LiteralPath $filePath -Value $newContent -Encoding UTF8
            $fixedCount++
        }
    }
}

Write-Host "----------------------------------------"
if ($fixedCount -eq 0) {
    Write-Host "Tuyệt vời! Tất cả các file đều đã an toàn, không sót cái nào." -ForegroundColor Green
}
else {
    Write-Host "Đã tự động fix thành công $fixedCount file! Giờ thì build thoải mái nhé 🚀" -ForegroundColor Green
}
