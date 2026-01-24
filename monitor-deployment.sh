#!/bin/bash
# Monitor Railway deployment and test Playwright endpoint
# Usage: ./monitor-deployment.sh [railway-url]

set -e

RAILWAY_URL="${1:-}"

echo "🔍 Railway Deployment Monitor for commit 255fa11"
echo "=================================================="
echo ""

# Try to get URL from Railway CLI if not provided
if [ -z "$RAILWAY_URL" ]; then
  echo "Attempting to get Railway URL from CLI..."
  if command -v railway &> /dev/null; then
    RAILWAY_URL=$(railway status 2>/dev/null | grep -i "deployed at" | awk '{print $NF}' || railway status 2>/dev/null | grep -E "https?://" | head -1 | awk '{print $NF}')
  fi
  
  if [ -z "$RAILWAY_URL" ]; then
    echo "❌ Could not automatically detect Railway URL"
    echo ""
    echo "Please provide your Railway URL:"
    echo "  ./monitor-deployment.sh https://your-app.up.railway.app"
    echo ""
    echo "Or get it from Railway Dashboard -> Your Project -> Deployments"
    exit 1
  fi
fi

echo "📍 Railway URL: $RAILWAY_URL"
echo ""

# Check if service is responding
echo "⏳ Checking if service is live..."
MAX_RETRIES=30
RETRY_COUNT=0
SERVICE_LIVE=false

while [ $RETRY_COUNT -lt $MAX_RETRIES ]; do
  if curl -sf "$RAILWAY_URL/health" > /dev/null 2>&1; then
    SERVICE_LIVE=true
    break
  fi
  RETRY_COUNT=$((RETRY_COUNT + 1))
  echo "  Attempt $RETRY_COUNT/$MAX_RETRIES: Service not ready yet, waiting 5 seconds..."
  sleep 5
done

if [ "$SERVICE_LIVE" = false ]; then
  echo "❌ Service did not become available after $MAX_RETRIES attempts"
  echo "   Check Railway logs: railway logs"
  exit 1
fi

echo "✅ Service is live!"
echo ""

# Test health endpoint
echo "🏥 Testing /health endpoint..."
HEALTH_RESPONSE=$(curl -sf "$RAILWAY_URL/health" || echo "FAILED")
if [ "$HEALTH_RESPONSE" != "FAILED" ]; then
  echo "✅ Health check passed: $HEALTH_RESPONSE"
else
  echo "❌ Health check failed"
  exit 1
fi
echo ""

# Test Playwright browser endpoint
echo "🌐 Testing /test-browser endpoint (Playwright Chromium)..."
echo "   This verifies:"
echo "   - Multi-stage Docker build succeeded"
echo "   - System dependencies installed correctly"
echo "   - Browser binaries preserved"
echo "   - Chromium can launch in node:20-slim environment"
echo ""

BROWSER_RESPONSE=$(curl -sf "$RAILWAY_URL/test-browser" || echo "FAILED")

if [ "$BROWSER_RESPONSE" = "FAILED" ]; then
  echo "❌ Browser test failed - endpoint not responding"
  exit 1
fi

# Check if response contains success indicators
if echo "$BROWSER_RESPONSE" | grep -q '"success":\s*true'; then
  echo "✅ Browser test SUCCESSFUL!"
  echo ""
  echo "Response:"
  echo "$BROWSER_RESPONSE" | jq '.' 2>/dev/null || echo "$BROWSER_RESPONSE"
  echo ""
  
  # Extract title if available
  TITLE=$(echo "$BROWSER_RESPONSE" | grep -o '"title":\s*"[^"]*"' | cut -d'"' -f4 || echo "")
  if [ -n "$TITLE" ]; then
    if [ "$TITLE" = "Google" ]; then
      echo "🎉 VERIFICATION COMPLETE!"
      echo "   ✓ Chromium browser launched successfully"
      echo "   ✓ Page title matches expected: '$TITLE'"
      echo "   ✓ Multi-stage Docker build verified"
      echo "   ✓ System dependencies installation verified"
      echo "   ✓ Browser binaries preservation verified"
    else
      echo "⚠️  Browser launched but title is '$TITLE' (expected 'Google')"
    fi
  fi
else
  echo "❌ Browser test FAILED"
  echo ""
  echo "Response:"
  echo "$BROWSER_RESPONSE" | jq '.' 2>/dev/null || echo "$BROWSER_RESPONSE"
  echo ""
  echo "Check Railway logs for errors:"
  echo "  railway logs"
  exit 1
fi
