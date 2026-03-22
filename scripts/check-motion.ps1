$pattern = "framer-motion"
# Lấy đường dẫn thư mục src (lùi lại 1 cấp từ thư mục tool)
$srcPath = Join-Path -Path $PSScriptRoot -ChildPath "..\src"

if (-not (Test-Path $srcPath)) {
    Write-Host "Không tìm thấy thư mục src. Hãy chắc chắn script nằm trong thư mục tool/ nhé!" -ForegroundColor Red
    exit
}

$files = Get-ChildItem -Path $srcPath -Recurse -Include *.tsx, *.ts
$foundCount = 0

Write-Host "Đang quét thư mục src để tìm file thiếu 'use client'..." -ForegroundColor Cyan

foreach ($file in $files) {
    # Kiểm tra xem file có dùng framer-motion không
    $hasMotion = Select-String -Path $file.FullName -Pattern $pattern -Quiet

    if ($hasMotion) {
        # Kiểm tra xem file ĐÃ CÓ 'use client' hoặc "use client" chưa
        $hasUseClient = Select-String -Path $file.FullName -Pattern "`"use client`"|'use client'" -Quiet

        if (-not $hasUseClient) {
            Write-Host "[CẦN FIX] $($file.FullName)" -ForegroundColor Yellow
            $foundCount++
        }
    }
}

Write-Host "----------------------------------------"
if ($foundCount -eq 0) {
    Write-Host "Tuyệt vời! Không có file nào sót." -ForegroundColor Green
}
else {
    Write-Host "Phát hiện $foundCount file cần thêm `"use client`" lên dòng đầu tiên." -ForegroundColor Red
}
