#!/bin/bash
# Validate static asset serving after deployment
# Usage: ./validate-static-assets.sh [api-url]

API_URL="${1:-https://skaidrus-seimas-demo-production.up.railway.app}"

echo "🔍 Validating static asset serving for: $API_URL"
echo ""

# Test JS file
echo "1. Testing JavaScript file..."
JS_RESPONSE=$(curl -s -I "$API_URL/js/index-CqEdKO03.js" 2>&1)
JS_CONTENT_TYPE=$(echo "$JS_RESPONSE" | grep -i "content-type" | head -1)
JS_STATUS=$(echo "$JS_RESPONSE" | grep -i "HTTP" | head -1)

echo "   Status: $JS_STATUS"
echo "   Content-Type: $JS_CONTENT_TYPE"

if echo "$JS_CONTENT_TYPE" | grep -qi "application/javascript"; then
  echo "   ✅ JavaScript file served correctly"
else
  echo "   ❌ JavaScript file NOT served correctly (should be application/javascript)"
fi

echo ""

# Test CSS file
echo "2. Testing CSS file..."
CSS_RESPONSE=$(curl -s -I "$API_URL/assets/index-CdDYNkX7.css" 2>&1)
CSS_CONTENT_TYPE=$(echo "$CSS_RESPONSE" | grep -i "content-type" | head -1)
CSS_STATUS=$(echo "$CSS_RESPONSE" | grep -i "HTTP" | head -1)

echo "   Status: $CSS_STATUS"
echo "   Content-Type: $CSS_CONTENT_TYPE"

if echo "$CSS_CONTENT_TYPE" | grep -qi "text/css"; then
  echo "   ✅ CSS file served correctly"
else
  echo "   ❌ CSS file NOT served correctly (should be text/css)"
fi

echo ""

# Test actual JS content
echo "3. Testing JavaScript content..."
JS_CONTENT=$(curl -s "$API_URL/js/index-CqEdKO03.js" | head -5)

if echo "$JS_CONTENT" | grep -q "import\|function\|const\|var\|=>"; then
  echo "   ✅ JavaScript content is valid (contains JS code)"
else
  echo "   ❌ JavaScript content is NOT valid (might be HTML)"
  echo "   First 5 lines:"
  echo "$JS_CONTENT" | head -5
fi

echo ""
echo "✅ Validation complete!"
