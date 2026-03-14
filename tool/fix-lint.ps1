# Xác định đường dẫn src chuẩn
$srcPath = Join-Path -Path $PSScriptRoot -ChildPath "..\src"

Write-Host "--- Đang khôi phục lại thẻ <Button> cho shadcn ---" -ForegroundColor Magenta

Get-ChildItem -LiteralPath $srcPath -Filter "*.tsx" -Recurse | ForEach-Object {
    $content = Get-Content -LiteralPath $_.FullName -Raw
    $originalContent = $content

    # Bước 1: Nếu thẻ đóng là </Button> mà thẻ mở bị đổi thành <button..., trả nó về <Button
    # Tìm cặp <button type="button" ... > ... </Button>
    $content = $content -replace '<button type="button"([^>]*>\s*.*?<\/Button>)', '<Button$1'

    # Bước 2: Sửa lỗi chèn trùng type="button" cho các thẻ thực sự là <button> viết thường
    $content = $content -replace 'type="button"\s+type="button"', 'type="button"'

    if ($content -ne $originalContent) {
        Set-Content -LiteralPath $_.FullName -Value $content -Encoding UTF8
        Write-Host "✓ Restored shadcn Button in: $($_.Name)" -ForegroundColor Green
    }
}

