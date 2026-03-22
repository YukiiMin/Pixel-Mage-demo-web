# Lấy đường dẫn thư mục src (lùi lại 1 cấp từ thư mục tool)
$srcPath = Join-Path -Path $PSScriptRoot -ChildPath "..\src"

if (-not (Test-Path $srcPath)) {
    Write-Host "Không tìm thấy thư mục src. Hãy chắc chắn script nằm trong thư mục tool/ nhé!" -ForegroundColor Red
    exit
}

$files = Get-ChildItem -Path $srcPath -Recurse -Include *.tsx, *.ts
$fixedCount = 0

Write-Host "Đang quét và tự động chèn 'use client' vào các file dùng framer-motion..." -ForegroundColor Cyan

foreach ($file in $files) {
    $filePath = $file.FullName
    # Đọc nội dung file dạng Raw và giữ nguyên UTF-8 để không lỗi font tiếng Việt hay Emoji
    $content = Get-Content -Path $filePath -Raw -Encoding UTF8

    # Nếu file có import framer-motion
    if ($content -match "framer-motion") {
        # Nếu file chưa có "use client" hoặc 'use client'
        if ($content -notmatch "['`"]use client['`"]") {
            Write-Host "[ĐANG FIX] Tự động chèn vào: $($file.Name)" -ForegroundColor Yellow

            # Thêm "use client"; và xuống dòng vào đầu file
            $newContent = "`"use client`";`n" + $content

            # Ghi đè lại file
            Set-Content -Path $filePath -Value $newContent -Encoding UTF8
            $fixedCount++
        }
    }
}

Write-Host "----------------------------------------"
if ($fixedCount -eq 0) {
    Write-Host "Tuyệt vời! Tất cả các file framer-motion đều đã an toàn." -ForegroundColor Green
}
else {
    Write-Host "Đã tự động fix thành công $fixedCount file! Giờ thì build thoải mái nhé 🚀" -ForegroundColor Green
}
