#!/bin/bash

echo "🧪 Testing shell escaping with password: JL#E7%hD47okz{!7"
echo

# Test 1: No quotes (WRONG - will truncate at #)
echo "❌ Test 1: No quotes"
echo "Command: echo Password is: JL#E7%hD47okz{!7"
echo "Result: $(echo Password is: JL#E7%hD47okz{!7)"
echo "^ Notice it stops at #"
echo

# Test 2: Double quotes (CORRECT)
echo "✅ Test 2: Double quotes"
echo 'Command: echo "Password is: JL#E7%hD47okz{!7}"'
echo "Result: $(echo "Password is: JL#E7%hD47okz{!7}")"
echo

# Test 3: Single quotes (CORRECT)
echo "✅ Test 3: Single quotes"
echo "Command: echo 'Password is: JL#E7%hD47okz{!7}'"
echo "Result: $(echo 'Password is: JL#E7%hD47okz{!7}')"
echo

# Test 4: Environment variable with quotes
echo "✅ Test 4: Environment variable"
export TEST_PASSWORD="JL#E7%hD47okz{!7"
echo "Command: export TEST_PASSWORD=\"JL#E7%hD47okz{!7\""
echo "Result: Password length is ${#TEST_PASSWORD} chars"
echo "Preview: ${TEST_PASSWORD:0:2}***"