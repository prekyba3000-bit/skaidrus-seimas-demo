#!/bin/bash
# Test Playwright browser endpoint on Railway
# Usage: ./test-browser.sh [railway-url]

RAILWAY_URL="${1:-}"

if [ -z "$RAILWAY_URL" ]; then
  echo "Usage: ./test-browser.sh https://your-app.up.railway.app"
  echo ""
  echo "To find your Railway URL:"
  echo "1. Go to Railway Dashboard -> Your Project -> Deployments"
  echo "2. Copy the public URL"
  echo "3. Or run: railway status (after logging in)"
  exit 1
fi

echo "Testing Playwright browser endpoint at: $RAILWAY_URL/test-browser"
echo ""

curl -X GET "$RAILWAY_URL/test-browser" \
  -H "Accept: application/json" \
  -w "\n\nHTTP Status: %{http_code}\n" \
  -s | jq '.' 2>/dev/null || curl -X GET "$RAILWAY_URL/test-browser" -s

echo ""
