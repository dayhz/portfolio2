#!/bin/bash

# Performance Check Script for Homepage CMS
# This script performs various performance tests and optimizations

set -e

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Configuration
CMS_API_URL="http://localhost:8000"
PORTFOLIO_URL="http://localhost:3001"
FRONTEND_URL="http://localhost:3000"

# Function to log messages with colors
log() {
    echo -e "${BLUE}[$(date '+%Y-%m-%d %H:%M:%S')]${NC} $1"
}

success() {
    echo -e "${GREEN}✅ $1${NC}"
}

warning() {
    echo -e "${YELLOW}⚠️  $1${NC}"
}

error() {
    echo -e "${RED}❌ $1${NC}"
}

# Function to check if a service is running
check_service() {
    local url=$1
    local name=$2
    
    if curl -s -f "$url" > /dev/null 2>&1; then
        success "$name is running"
        return 0
    else
        error "$name is not running at $url"
        return 1
    fi
}

# Function to measure response time
measure_response_time() {
    local url=$1
    local name=$2
    
    log "Measuring response time for $name..."
    
    local response_time=$(curl -o /dev/null -s -w '%{time_total}' "$url")
    local response_code=$(curl -o /dev/null -s -w '%{http_code}' "$url")
    
    if [ "$response_code" = "200" ]; then
        local time_ms=$(echo "$response_time * 1000" | bc -l)
        printf "Response time for %s: %.2f ms (Status: %s)\n" "$name" "$time_ms" "$response_code"
        
        # Check if response time is acceptable
        if (( $(echo "$response_time < 2.0" | bc -l) )); then
            success "$name response time is good"
        elif (( $(echo "$response_time < 5.0" | bc -l) )); then
            warning "$name response time is acceptable but could be improved"
        else
            error "$name response time is too slow"
        fi
    else
        error "$name returned status code: $response_code"
    fi
}

# Function to test API endpoints performance
test_api_performance() {
    log "Testing API endpoint performance..."
    
    local endpoints=(
        "/api/health:Health Check"
        "/api/homepage:Homepage Content"
        "/api/homepage/hero:Hero Section"
        "/api/homepage/services:Services Section"
        "/api/homepage/brands:Brands Section"
        "/api/projects:Projects List"
    )
    
    for endpoint_info in "${endpoints[@]}"; do
        IFS=':' read -r endpoint name <<< "$endpoint_info"
        measure_response_time "$CMS_API_URL$endpoint" "$name"
    done
}

# Function to test concurrent requests
test_concurrent_performance() {
    log "Testing concurrent request performance..."
    
    local url="$CMS_API_URL/api/homepage"
    local concurrent_requests=10
    local temp_file="/tmp/concurrent_test_$$"
    
    # Run concurrent requests
    for i in $(seq 1 $concurrent_requests); do
        (
            response_time=$(curl -o /dev/null -s -w '%{time_total}' "$url")
            echo "$response_time" >> "$temp_file"
        ) &
    done
    
    # Wait for all requests to complete
    wait
    
    # Calculate statistics
    if [ -f "$temp_file" ]; then
        local total_time=0
        local count=0
        local max_time=0
        local min_time=999
        
        while read -r time; do
            total_time=$(echo "$total_time + $time" | bc -l)
            count=$((count + 1))
            
            if (( $(echo "$time > $max_time" | bc -l) )); then
                max_time=$time
            fi
            
            if (( $(echo "$time < $min_time" | bc -l) )); then
                min_time=$time
            fi
        done < "$temp_file"
        
        local avg_time=$(echo "scale=3; $total_time / $count" | bc -l)
        
        printf "Concurrent requests (%d): Avg: %.3fs, Min: %.3fs, Max: %.3fs\n" \
               "$concurrent_requests" "$avg_time" "$min_time" "$max_time"
        
        # Cleanup
        rm -f "$temp_file"
        
        # Check if performance is acceptable
        if (( $(echo "$avg_time < 3.0" | bc -l) )); then
            success "Concurrent performance is good"
        else
            warning "Concurrent performance could be improved"
        fi
    else
        error "Failed to run concurrent tests"
    fi
}

# Function to check database performance
check_database_performance() {
    log "Checking database performance..."
    
    # Test database query performance through API
    local start_time=$(date +%s.%N)
    
    # Make a complex query (get all homepage content)
    local response=$(curl -s "$CMS_API_URL/api/homepage")
    
    local end_time=$(date +%s.%N)
    local query_time=$(echo "$end_time - $start_time" | bc -l)
    
    if echo "$response" | jq -e '.success' > /dev/null 2>&1; then
        printf "Database query time: %.3f seconds\n" "$query_time"
        
        if (( $(echo "$query_time < 1.0" | bc -l) )); then
            success "Database performance is good"
        else
            warning "Database performance could be improved"
        fi
    else
        error "Database query failed"
    fi
}

# Function to check memory usage
check_memory_usage() {
    log "Checking memory usage..."
    
    # Check if PM2 is running
    if command -v pm2 > /dev/null 2>&1; then
        pm2 list | grep -E "(cms-backend|portfolio-server)" || warning "PM2 processes not found"
        
        # Get memory usage from PM2
        local cms_memory=$(pm2 jlist | jq -r '.[] | select(.name=="cms-backend") | .monit.memory' 2>/dev/null || echo "0")
        local portfolio_memory=$(pm2 jlist | jq -r '.[] | select(.name=="portfolio-server") | .monit.memory' 2>/dev/null || echo "0")
        
        if [ "$cms_memory" != "0" ]; then
            local cms_mb=$(echo "scale=2; $cms_memory / 1024 / 1024" | bc -l)
            printf "CMS Backend memory usage: %.2f MB\n" "$cms_mb"
            
            if (( $(echo "$cms_mb < 500" | bc -l) )); then
                success "CMS memory usage is good"
            elif (( $(echo "$cms_mb < 1000" | bc -l) )); then
                warning "CMS memory usage is moderate"
            else
                error "CMS memory usage is high"
            fi
        fi
        
        if [ "$portfolio_memory" != "0" ]; then
            local portfolio_mb=$(echo "scale=2; $portfolio_memory / 1024 / 1024" | bc -l)
            printf "Portfolio server memory usage: %.2f MB\n" "$portfolio_mb"
            
            if (( $(echo "$portfolio_mb < 200" | bc -l) )); then
                success "Portfolio memory usage is good"
            elif (( $(echo "$portfolio_mb < 500" | bc -l) )); then
                warning "Portfolio memory usage is moderate"
            else
                error "Portfolio memory usage is high"
            fi
        fi
    else
        warning "PM2 not available, cannot check memory usage"
    fi
}

# Function to check cache performance
check_cache_performance() {
    log "Checking cache performance..."
    
    # Test cache hit/miss by making the same request twice
    local endpoint="$CMS_API_URL/api/homepage/hero"
    
    # First request (likely cache miss)
    local start1=$(date +%s.%N)
    curl -s "$endpoint" > /dev/null
    local end1=$(date +%s.%N)
    local time1=$(echo "$end1 - $start1" | bc -l)
    
    # Second request (should be cache hit)
    local start2=$(date +%s.%N)
    curl -s "$endpoint" > /dev/null
    local end2=$(date +%s.%N)
    local time2=$(echo "$end2 - $start2" | bc -l)
    
    printf "First request: %.3f seconds\n" "$time1"
    printf "Second request: %.3f seconds\n" "$time2"
    
    # Check if second request is faster (indicating cache hit)
    if (( $(echo "$time2 < $time1" | bc -l) )); then
        local improvement=$(echo "scale=1; ($time1 - $time2) / $time1 * 100" | bc -l)
        success "Cache is working (${improvement}% improvement)"
    else
        warning "Cache may not be working effectively"
    fi
}

# Function to check file sizes and optimization
check_file_optimization() {
    log "Checking file optimization..."
    
    # Check if uploads directory exists
    local uploads_dir="cms/backend/uploads"
    if [ -d "$uploads_dir" ]; then
        local total_size=$(du -sh "$uploads_dir" 2>/dev/null | cut -f1)
        local file_count=$(find "$uploads_dir" -type f | wc -l)
        
        printf "Uploads directory: %s (%d files)\n" "$total_size" "$file_count"
        
        # Check for large files
        local large_files=$(find "$uploads_dir" -type f -size +5M 2>/dev/null | wc -l)
        if [ "$large_files" -gt 0 ]; then
            warning "$large_files files are larger than 5MB"
        else
            success "No oversized files found"
        fi
        
        # Check for unoptimized images
        local unoptimized=$(find "$uploads_dir" -name "*.jpg" -o -name "*.png" | head -5)
        if [ -n "$unoptimized" ]; then
            log "Sample files for optimization check:"
            echo "$unoptimized" | while read -r file; do
                if [ -f "$file" ]; then
                    local size=$(du -h "$file" | cut -f1)
                    printf "  %s (%s)\n" "$(basename "$file")" "$size"
                fi
            done
        fi
    else
        warning "Uploads directory not found"
    fi
}

# Function to run load test
run_load_test() {
    log "Running basic load test..."
    
    if command -v ab > /dev/null 2>&1; then
        local url="$PORTFOLIO_URL/"
        local requests=100
        local concurrency=10
        
        log "Running Apache Bench test ($requests requests, $concurrency concurrent)..."
        
        local ab_output=$(ab -n $requests -c $concurrency -q "$url" 2>/dev/null)
        
        if [ $? -eq 0 ]; then
            local rps=$(echo "$ab_output" | grep "Requests per second" | awk '{print $4}')
            local avg_time=$(echo "$ab_output" | grep "Time per request" | head -1 | awk '{print $4}')
            local failed=$(echo "$ab_output" | grep "Failed requests" | awk '{print $3}')
            
            printf "Load test results:\n"
            printf "  Requests per second: %s\n" "$rps"
            printf "  Average time per request: %s ms\n" "$avg_time"
            printf "  Failed requests: %s\n" "$failed"
            
            if [ "$failed" = "0" ]; then
                success "Load test completed without failures"
            else
                warning "Load test had $failed failed requests"
            fi
        else
            error "Load test failed to run"
        fi
    else
        warning "Apache Bench (ab) not available, skipping load test"
        log "Install with: brew install httpd (macOS) or apt-get install apache2-utils (Ubuntu)"
    fi
}

# Function to generate performance report
generate_report() {
    log "Generating performance report..."
    
    local report_file="performance-report-$(date +%Y%m%d_%H%M%S).txt"
    
    {
        echo "Homepage CMS Performance Report"
        echo "Generated: $(date)"
        echo "================================"
        echo ""
        
        echo "System Information:"
        echo "- OS: $(uname -s)"
        echo "- Node.js: $(node --version 2>/dev/null || echo 'Not available')"
        echo "- Memory: $(free -h 2>/dev/null | grep Mem | awk '{print $2}' || echo 'Not available')"
        echo ""
        
        echo "Service Status:"
        if check_service "$CMS_API_URL/api/health" "CMS API" >/dev/null 2>&1; then
            echo "- CMS API: ✅ Running"
        else
            echo "- CMS API: ❌ Not running"
        fi
        
        if check_service "$PORTFOLIO_URL" "Portfolio Server" >/dev/null 2>&1; then
            echo "- Portfolio Server: ✅ Running"
        else
            echo "- Portfolio Server: ❌ Not running"
        fi
        echo ""
        
        echo "Performance Metrics:"
        echo "- See detailed output above for response times"
        echo "- See memory usage information above"
        echo "- See cache performance results above"
        echo ""
        
        echo "Recommendations:"
        echo "1. Monitor memory usage regularly"
        echo "2. Optimize large image files"
        echo "3. Enable Redis caching for better performance"
        echo "4. Consider CDN for static assets"
        echo "5. Regular database maintenance"
        
    } > "$report_file"
    
    success "Performance report saved to: $report_file"
}

# Main execution
main() {
    log "Starting Homepage CMS Performance Check..."
    echo ""
    
    # Check prerequisites
    if ! command -v curl > /dev/null 2>&1; then
        error "curl is required but not installed"
        exit 1
    fi
    
    if ! command -v bc > /dev/null 2>&1; then
        error "bc is required but not installed"
        exit 1
    fi
    
    # Check if services are running
    log "Checking service availability..."
    check_service "$CMS_API_URL/api/health" "CMS API"
    check_service "$PORTFOLIO_URL" "Portfolio Server"
    echo ""
    
    # Run performance tests
    test_api_performance
    echo ""
    
    test_concurrent_performance
    echo ""
    
    check_database_performance
    echo ""
    
    check_memory_usage
    echo ""
    
    check_cache_performance
    echo ""
    
    check_file_optimization
    echo ""
    
    run_load_test
    echo ""
    
    # Generate report
    generate_report
    
    success "Performance check completed!"
}

# Run main function
main "$@"