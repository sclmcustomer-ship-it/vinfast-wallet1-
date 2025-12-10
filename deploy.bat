@echo off
REM 🚀 Quick Deploy Script for YD Website (Windows)

echo.
echo 🏍️  YD Website - Quick Deploy to Vercel
echo ========================================
echo.

REM Check if package.json exists
if not exist "package.json" (
    echo ❌ Error: package.json not found. Are you in the project directory?
    pause
    exit /b 1
)

echo ✅ Step 1: Running build test...
call npm run build

if %ERRORLEVEL% neq 0 (
    echo ❌ Build failed! Please fix errors before deploying.
    pause
    exit /b 1
)

echo.
echo ✅ Step 2: Staging all changes...
git add .

echo.
echo 📝 Enter commit message (or press Enter for default):
set /p commit_message="> "

if "%commit_message%"=="" (
    for /f "tokens=2-4 delims=/ " %%a in ('date /t') do (set mydate=%%c-%%a-%%b)
    set commit_message=✨ Deploy: YD website updates %mydate%
)

echo.
echo ✅ Step 3: Committing changes...
git commit -m "%commit_message%"

echo.
echo ✅ Step 4: Pushing to GitHub...
git push origin yadea-ui-redesign

if %ERRORLEVEL% neq 0 (
    echo ❌ Git push failed! Please check your credentials.
    pause
    exit /b 1
)

echo.
echo 🎉 SUCCESS! Code pushed to GitHub.
echo.
echo 📋 Next steps:
echo   1. Go to https://vercel.com
echo   2. Login with GitHub account: sclmcustomer-ship-it
echo   3. Import repository: vinfast-wallet1-
echo   4. Select branch: yadea-ui-redesign
echo   5. Add environment variables (see .env.local.example)
echo   6. Click Deploy!
echo.
echo 📖 Full guide: Read DEPLOY.md for detailed instructions
echo.
echo 🏍️  Happy deploying! - Thương Hiệu YD
echo.
pause
