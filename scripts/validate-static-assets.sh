#!/bin/bash
# Validate static asset serving after deployment
# Usage: ./validate-static-assets.sh [api-url]

API_URL="${1:-https://skaidrus-seimas-demo-production.up.railway.app}"

echo "🔍 Validating static asset serving for: $API_URL"
echo ""

# Get the actual JS file hash from the HTML
JS_FILE=$(curl -s "$API_URL/" | grep -o 'src="[^"]*\.js"' | head -1 | sed 's/src="//;s/"//')
JS_FILE_PATH=$(echo "$JS_FILE" | sed 's|^/||')

if [ -z "$JS_FILE" ]; then
  echo "❌ Could not find JavaScript file reference in HTML"
  exit 1
fi

echo "Found JS file: $JS_FILE"
echo ""

# Test JS file
echo "1. Testing JavaScript file ($JS_FILE)..."
JS_RESPONSE=$(curl -s -I "$API_URL$JS_FILE" 2>&1)
JS_CONTENT_TYPE=$(echo "$JS_RESPONSE" | grep -i "content-type" | head -1)
JS_STATUS=$(echo "$JS_RESPONSE" | grep -i "HTTP" | head -1)

echo "   Status: $JS_STATUS"
echo "   Content-Type: $JS_CONTENT_TYPE"

if echo "$JS_CONTENT_TYPE" | grep -qi "application/javascript"; then
  echo "   ✅ JavaScript file served correctly"
  JS_OK=true
else
  echo "   ❌ JavaScript file NOT served correctly (should be application/javascript)"
  JS_OK=false
fi

echo ""

# Test CSS file (get from HTML or use known path)
CSS_FILE=$(curl -s "$API_URL/" | grep -o 'href="[^"]*\.css"' | head -1 | sed 's/href="//;s/"//')
if [ -z "$CSS_FILE" ]; then
  CSS_FILE="/assets/index-CdDYNkX7.css"  # Fallback to known path
fi

echo "2. Testing CSS file ($CSS_FILE)..."
CSS_RESPONSE=$(curl -s -I "$API_URL$CSS_FILE" 2>&1)
CSS_CONTENT_TYPE=$(echo "$CSS_RESPONSE" | grep -i "content-type" | head -1)
CSS_STATUS=$(echo "$CSS_RESPONSE" | grep -i "HTTP" | head -1)

echo "   Status: $CSS_STATUS"
echo "   Content-Type: $CSS_CONTENT_TYPE"

if echo "$CSS_CONTENT_TYPE" | grep -qi "text/css"; then
  echo "   ✅ CSS file served correctly"
  CSS_OK=true
else
  echo "   ❌ CSS file NOT served correctly (should be text/css)"
  CSS_OK=false
fi

echo ""

# Test actual JS content
echo "3. Testing JavaScript content..."
JS_CONTENT=$(curl -s "$API_URL$JS_FILE" | head -5)

if echo "$JS_CONTENT" | grep -q "import\|function\|const\|var\|=>\|__vite"; then
  echo "   ✅ JavaScript content is valid (contains JS code)"
  CONTENT_OK=true
else
  echo "   ❌ JavaScript content is NOT valid (might be HTML)"
  echo "   First 5 lines:"
  echo "$JS_CONTENT" | head -5
  CONTENT_OK=false
fi

echo ""

# Summary
if [ "$JS_OK" = true ] && [ "$CSS_OK" = true ] && [ "$CONTENT_OK" = true ]; then
  echo "✅ All validations passed!"
  exit 0
else
  echo "❌ Some validations failed"
  exit 1
fi
