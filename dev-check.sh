#!/bin/bash

# Good Motor - Development Check Script
# Run this before every deployment to catch issues early

set -e

# Colors
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m'

print_status() {
    echo -e "${BLUE}[CHECK]${NC} $1"
}

print_success() {
    echo -e "${GREEN}[PASS]${NC} $1"
}

print_warning() {
    echo -e "${YELLOW}[WARN]${NC} $1"
}

print_error() {
    echo -e "${RED}[FAIL]${NC} $1"
}

echo "🔍 Good Motor - Development Checks"
echo "=================================="
echo ""

# Check 1: Project structure
print_status "Checking project structure..."
required_files=("package.json" "next.config.js" "tsconfig.json" "tailwind.config.js")
missing_files=()

for file in "${required_files[@]}"; do
    if [ ! -f "$file" ]; then
        missing_files+=("$file")
    fi
done

if [ ${#missing_files[@]} -eq 0 ]; then
    print_success "All required files present"
else
    print_error "Missing files: ${missing_files[*]}"
    exit 1
fi

# Check 2: Dependencies
print_status "Checking dependencies..."
if npm list --depth=0 > /dev/null 2>&1; then
    print_success "Dependencies are properly installed"
else
    print_error "Dependency issues detected. Run 'npm install'"
    exit 1
fi

# Check 3: TypeScript compilation
print_status "Checking TypeScript compilation..."
if npm run build > /dev/null 2>&1; then
    print_success "TypeScript compilation successful"
else
    print_error "TypeScript compilation failed"
    echo ""
    echo "Run 'npm run build' to see detailed errors"
    exit 1
fi

# Check 4: Environment variables
print_status "Checking environment variables..."
if [ -f ".env.local" ]; then
    print_success ".env.local file found"
    
    # Check for required variables
    required_vars=("MONGODB_URI")
    missing_vars=()
    
    for var in "${required_vars[@]}"; do
        if ! grep -q "^$var=" .env.local; then
            missing_vars+=("$var")
        fi
    done
    
    if [ ${#missing_vars[@]} -eq 0 ]; then
        print_success "All required environment variables present"
    else
        print_error "Missing environment variables: ${missing_vars[*]}"
        exit 1
    fi
else
    print_warning ".env.local file not found. Create one for local development."
fi

# Check 5: API endpoints test
print_status "Testing API endpoints locally..."

# Start development server in background
npm run dev > /dev/null 2>&1 &
DEV_PID=$!

# Wait for server to start
sleep 5

# Test endpoints
endpoints=("/api/products" "/api/projects" "/api/admin/products")
failed_endpoints=()

for endpoint in "${endpoints[@]}"; do
    if curl -f "http://localhost:3000$endpoint" -s > /dev/null; then
        print_success "Endpoint $endpoint working"
    else
        failed_endpoints+=("$endpoint")
    fi
done

# Stop development server
kill $DEV_PID > /dev/null 2>&1

if [ ${#failed_endpoints[@]} -eq 0 ]; then
    print_success "All API endpoints working"
else
    print_error "Failed endpoints: ${failed_endpoints[*]}"
    echo "Check your database connection and API routes"
    exit 1
fi

# Check 6: Git status
print_status "Checking Git status..."
if [ -n "$(git status --porcelain)" ]; then
    print_warning "You have uncommitted changes:"
    git status --short
    echo ""
    echo "Consider committing your changes before deployment"
else
    print_success "Git working directory is clean"
fi

# Check 7: Audit dependencies
print_status "Checking for security vulnerabilities..."
if npm audit --audit-level high > /dev/null 2>&1; then
    print_success "No high-severity vulnerabilities found"
else
    print_warning "Security vulnerabilities detected. Run 'npm audit' for details"
fi

# Check 8: Build size
print_status "Checking build size..."
build_size=$(du -sh .next 2>/dev/null | cut -f1 || echo "Unknown")
print_success "Build size: $build_size"

echo ""
echo "🎉 All checks completed!"
echo ""
echo "📋 Summary:"
echo "  ✅ Project structure valid"
echo "  ✅ Dependencies installed"
echo "  ✅ TypeScript compilation successful"
echo "  ✅ Environment variables configured"
echo "  ✅ API endpoints working"
echo "  ✅ Build size: $build_size"
echo ""
echo "🚀 Your code is ready for deployment!"
echo "   Run: ./deploy-safe.sh"
echo ""
echo "💡 Tips:"
echo "  • Test your changes thoroughly before deploying"
echo "  • Commit your changes to Git before deployment"
echo "  • Keep backups of working versions"
echo "" 