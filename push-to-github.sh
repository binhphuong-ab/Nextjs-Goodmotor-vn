#!/bin/bash

# Good Motor Website - GitHub Push Script
# 
# Instructions:
# 1. Create a new repository on GitHub (don't initialize with README, .gitignore, or license)
# 2. Copy the repository URL (e.g., https://github.com/username/repository-name.git)
# 3. Run this script and paste the URL when prompted
# 
# Or manually run these commands:
# git remote add origin https://github.com/YOUR_USERNAME/YOUR_REPOSITORY.git
# git branch -M main
# git push -u origin main

echo "🚀 Good Motor Website - GitHub Setup"
echo "=================================="
echo ""
echo "First, make sure you've created a new repository on GitHub"
echo "Repository URL should look like: https://github.com/username/repository-name.git"
echo ""
read -p "Enter your GitHub repository URL: " repo_url

if [ -z "$repo_url" ]; then
    echo "❌ No repository URL provided. Exiting..."
    exit 1
fi

echo ""
echo "🔗 Adding remote origin..."
git remote add origin "$repo_url"

echo "📝 Setting main branch..."
git branch -M main

echo "⬆️  Pushing to GitHub..."
git push -u origin main

echo ""
echo "✅ Success! Your Good Motor website is now on GitHub!"
echo "🌐 Repository URL: $repo_url"
echo ""
echo "📋 Next steps:"
echo "   - Visit your repository on GitHub to verify the upload"
echo "   - Consider adding a detailed README with setup instructions"
echo "   - Set up GitHub Actions for CI/CD if needed"
echo "" 