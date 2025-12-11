# 🚀 Quick Deploy Script cho VinFast Wallet

# BƯỚC 1: Kiểm tra build
Write-Host "🔨 Đang kiểm tra build..." -ForegroundColor Yellow
npm run build

if ($LASTEXITCODE -eq 0) {
    Write-Host "✅ Build thành công!" -ForegroundColor Green
} else {
    Write-Host "❌ Build thất bại! Vui lòng fix lỗi trước khi deploy." -ForegroundColor Red
    exit 1
}

# BƯỚC 2: Kiểm tra Git
Write-Host "`n📦 Đang kiểm tra Git..." -ForegroundColor Yellow
git status

# BƯỚC 3: Hỏi commit message
$commitMessage = Read-Host "`n💬 Nhập commit message (hoặc Enter để skip)"

if ($commitMessage) {
    # Commit và push
    Write-Host "`n📤 Đang commit và push..." -ForegroundColor Yellow
    git add .
    git commit -m "$commitMessage"
    git push
    
    if ($LASTEXITCODE -eq 0) {
        Write-Host "✅ Đã push lên GitHub!" -ForegroundColor Green
        Write-Host "`n🚀 Vercel sẽ tự động deploy trong vài phút..." -ForegroundColor Cyan
        Write-Host "📊 Theo dõi tại: https://vercel.com/dashboard" -ForegroundColor Cyan
    } else {
        Write-Host "❌ Push thất bại! Kiểm tra kết nối Git." -ForegroundColor Red
        exit 1
    }
} else {
    Write-Host "`n⏭️  Bỏ qua commit. Chỉ test build." -ForegroundColor Yellow
}

# BƯỚC 4: Thông tin hữu ích
Write-Host "`n" -NoNewline
Write-Host "═══════════════════════════════════════════════════════" -ForegroundColor Cyan
Write-Host "📋 CHECKLIST SAU KHI DEPLOY:" -ForegroundColor White
Write-Host "═══════════════════════════════════════════════════════" -ForegroundColor Cyan
Write-Host "[ ] 1. Kiểm tra website live" -ForegroundColor White
Write-Host "[ ] 2. Test banker dashboard: /banker" -ForegroundColor White
Write-Host "[ ] 3. Test user wallet: /wallet" -ForegroundColor White
Write-Host "[ ] 4. Verify dữ liệu users còn nguyên" -ForegroundColor White
Write-Host "[ ] 5. Verify thẻ ngân hàng hiển thị" -ForegroundColor White
Write-Host "[ ] 6. Test tạo transaction mới" -ForegroundColor White
Write-Host "═══════════════════════════════════════════════════════" -ForegroundColor Cyan

Write-Host "`n✨ Done! Chúc anh deploy thành công! ✨" -ForegroundColor Green
