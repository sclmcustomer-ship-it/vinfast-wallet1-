#!/bin/bash

# 🚀 Quick Deploy Script for YD Website

echo "🏍️  YD Website - Quick Deploy to Vercel"
echo "========================================"
echo ""

# Check if we're in the right directory
if [ ! -f "package.json" ]; then
    echo "❌ Error: package.json not found. Are you in the project directory?"
    exit 1
fi

echo "✅ Step 1: Running build test..."
npm run build

if [ $? -ne 0 ]; then
    echo "❌ Build failed! Please fix errors before deploying."
    exit 1
fi

echo ""
echo "✅ Step 2: Staging all changes..."
git add .

echo ""
echo "📝 Enter commit message (or press Enter for default):"
read commit_message

if [ -z "$commit_message" ]; then
    commit_message="✨ Deploy: YD website updates $(date +%Y-%m-%d)"
fi

echo "✅ Step 3: Committing changes..."
git commit -m "$commit_message"

echo ""
echo "✅ Step 4: Pushing to GitHub..."
git push origin yadea-ui-redesign

if [ $? -ne 0 ]; then
    echo "❌ Git push failed! Please check your credentials."
    exit 1
fi

echo ""
echo "🎉 SUCCESS! Code pushed to GitHub."
echo ""
echo "📋 Next steps:"
echo "  1. Go to https://vercel.com"
echo "  2. Login with GitHub account: sclmcustomer-ship-it"
echo "  3. Import repository: vinfast-wallet1-"
echo "  4. Select branch: yadea-ui-redesign"
echo "  5. Add environment variables (see .env.local.example)"
echo "  6. Click Deploy!"
echo ""
echo "📖 Full guide: Read DEPLOY.md for detailed instructions"
echo ""
echo "🏍️  Happy deploying! - Thương Hiệu YD"
