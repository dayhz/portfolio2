#!/bin/bash

# Comprehensive test runner for Homepage CMS
echo "🧪 Running comprehensive test suite for Homepage CMS..."

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Function to print colored output
print_status() {
    echo -e "${2}${1}${NC}"
}

# Function to run tests and capture results
run_test_suite() {
    local test_name=$1
    local test_command=$2
    
    print_status "Running $test_name..." $YELLOW
    
    if eval $test_command; then
        print_status "✅ $test_name passed" $GREEN
        return 0
    else
        print_status "❌ $test_name failed" $RED
        return 1
    fi
}

# Initialize counters
total_tests=0
passed_tests=0

# Backend Tests
print_status "🔧 Backend Tests" $YELLOW
echo "================================"

# Unit tests
total_tests=$((total_tests + 1))
if run_test_suite "Backend Unit Tests" "cd ../../../backend && npm test"; then
    passed_tests=$((passed_tests + 1))
fi

# API integration tests
total_tests=$((total_tests + 1))
if run_test_suite "Backend API Tests" "cd ../../../backend && npm test -- src/test/homepage.test.ts"; then
    passed_tests=$((passed_tests + 1))
fi

# Validation tests
total_tests=$((total_tests + 1))
if run_test_suite "Backend Validation Tests" "cd ../../../backend && npm test -- src/test/validation.test.ts"; then
    passed_tests=$((passed_tests + 1))
fi

# Service tests
total_tests=$((total_tests + 1))
if run_test_suite "Backend Service Tests" "cd ../../../backend && npm test -- src/test/homepageService.test.ts"; then
    passed_tests=$((passed_tests + 1))
fi

echo ""

# Frontend Tests
print_status "🎨 Frontend Tests" $YELLOW
echo "================================"

# Unit tests
total_tests=$((total_tests + 1))
if run_test_suite "Frontend Unit Tests" "npm test"; then
    passed_tests=$((passed_tests + 1))
fi

# Component tests
total_tests=$((total_tests + 1))
if run_test_suite "Frontend Component Tests" "npm test -- src/test/components/"; then
    passed_tests=$((passed_tests + 1))
fi

echo ""

# End-to-End Tests
print_status "🌐 End-to-End Tests" $YELLOW
echo "================================"

# Check if servers are running
if ! curl -s http://localhost:8000/api/health > /dev/null; then
    print_status "⚠️  Backend server not running. Starting..." $YELLOW
    cd ../../../backend && npm run dev &
    BACKEND_PID=$!
    sleep 5
fi

if ! curl -s http://localhost:5173 > /dev/null; then
    print_status "⚠️  Frontend server not running. Starting..." $YELLOW
    npm run dev &
    FRONTEND_PID=$!
    sleep 10
fi

# E2E workflow tests
total_tests=$((total_tests + 1))
if run_test_suite "E2E Workflow Tests" "npm run test:e2e -- src/test/e2e/homepage-cms-workflow.spec.ts"; then
    passed_tests=$((passed_tests + 1))
fi

# Performance tests
total_tests=$((total_tests + 1))
if run_test_suite "E2E Performance Tests" "npm run test:e2e -- src/test/e2e/performance.spec.ts"; then
    passed_tests=$((passed_tests + 1))
fi

# Accessibility tests
total_tests=$((total_tests + 1))
if run_test_suite "E2E Accessibility Tests" "npm run test:e2e -- src/test/e2e/accessibility.spec.ts"; then
    passed_tests=$((passed_tests + 1))
fi

# Visual regression tests
total_tests=$((total_tests + 1))
if run_test_suite "E2E Visual Tests" "npm run test:e2e -- src/test/e2e/visual.spec.ts"; then
    passed_tests=$((passed_tests + 1))
fi

# Cleanup background processes
if [ ! -z "$BACKEND_PID" ]; then
    kill $BACKEND_PID 2>/dev/null
fi

if [ ! -z "$FRONTEND_PID" ]; then
    kill $FRONTEND_PID 2>/dev/null
fi

echo ""
print_status "📊 Test Results Summary" $YELLOW
echo "================================"
print_status "Total test suites: $total_tests" $NC
print_status "Passed: $passed_tests" $GREEN
print_status "Failed: $((total_tests - passed_tests))" $RED

if [ $passed_tests -eq $total_tests ]; then
    print_status "🎉 All tests passed!" $GREEN
    exit 0
else
    print_status "💥 Some tests failed!" $RED
    exit 1
fi