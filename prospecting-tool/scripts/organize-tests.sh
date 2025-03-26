#!/bin/bash

# Script to organize test files into a more logical structure
# This script should be run from the project root directory

# Create directories for test files
mkdir -p scripts/widget-tests
mkdir -p scripts/stripe-tests
mkdir -p scripts/utilities

# Move widget test files
echo "Moving widget test files..."
mv real-chat-test.html scripts/widget-tests/ 2>/dev/null || true
mv direct-chat-test.html scripts/widget-tests/ 2>/dev/null || true
mv simple-chat-test.html scripts/widget-tests/ 2>/dev/null || true
mv test-chatt-widget.html scripts/widget-tests/ 2>/dev/null || true
mv public/real-chat-test-production.html scripts/widget-tests/ 2>/dev/null || true
mv public/test-production-widget.html scripts/widget-tests/ 2>/dev/null || true
mv public/widget-tester.html scripts/widget-tests/ 2>/dev/null || true
mv public/simple-widget-tester.html scripts/widget-tests/ 2>/dev/null || true
mv public/test-widget-config.html scripts/widget-tests/ 2>/dev/null || true
mv public/test-user-widget-local.html scripts/widget-tests/ 2>/dev/null || true
mv public/test-user-widget.html scripts/widget-tests/ 2>/dev/null || true
mv public/enhanced-design-tester.html scripts/widget-tests/ 2>/dev/null || true
mv public/widget-id-tester.html scripts/widget-tests/ 2>/dev/null || true
mv public/simple-id-tester.html scripts/widget-tests/ 2>/dev/null || true
mv public/local-widget-embed.html scripts/widget-tests/ 2>/dev/null || true

# Move widget test scripts
echo "Moving widget test scripts..."
mv run-real-chat-test.sh scripts/widget-tests/ 2>/dev/null || true
mv run-real-chat-test-production.sh scripts/widget-tests/ 2>/dev/null || true
mv run-direct-chat-test.sh scripts/widget-tests/ 2>/dev/null || true
mv run-simple-chat-test.sh scripts/widget-tests/ 2>/dev/null || true
mv run-test-local-loader.sh scripts/widget-tests/ 2>/dev/null || true
mv run-test-production-widget.sh scripts/widget-tests/ 2>/dev/null || true
mv run-simple-widget-tester.sh scripts/widget-tests/ 2>/dev/null || true
mv run-test-widget-config.sh scripts/widget-tests/ 2>/dev/null || true
mv run-user-widget-test.sh scripts/widget-tests/ 2>/dev/null || true
mv run-user-widget-local-test.sh scripts/widget-tests/ 2>/dev/null || true
mv run-widget-verification-tests.sh scripts/widget-tests/ 2>/dev/null || true
mv run-enhanced-design-tester.sh scripts/widget-tests/ 2>/dev/null || true
mv run-simple-id-tester.sh scripts/widget-tests/ 2>/dev/null || true
mv run-create-widget-config-direct.sh scripts/widget-tests/ 2>/dev/null || true
mv run-create-emulator-widget-config.sh scripts/widget-tests/ 2>/dev/null || true
mv run-create-emulator-widget-config-cjs.sh scripts/widget-tests/ 2>/dev/null || true
mv run-emulator-with-permissive-rules.sh scripts/widget-tests/ 2>/dev/null || true
mv run-widget-config-emulator.sh scripts/widget-tests/ 2>/dev/null || true

# Move Stripe test files
echo "Moving Stripe test files..."
mv test-stripe.js scripts/stripe-tests/ 2>/dev/null || true
mv test-webhook.js scripts/stripe-tests/ 2>/dev/null || true
mv test-stripe-integration.js scripts/stripe-tests/ 2>/dev/null || true
mv simple-stripe-test.js scripts/stripe-tests/ 2>/dev/null || true
mv test-stripe-to-file.js scripts/stripe-tests/ 2>/dev/null || true
mv verify-stripe-key.js scripts/stripe-tests/ 2>/dev/null || true
mv verify-webhook-secret.js scripts/stripe-tests/ 2>/dev/null || true
mv test-stripe-integration-updated.js scripts/stripe-tests/ 2>/dev/null || true
mv simple-stripe-test-updated.js scripts/stripe-tests/ 2>/dev/null || true
mv stripe-test.html scripts/stripe-tests/ 2>/dev/null || true
mv test-stripe-config.js scripts/stripe-tests/ 2>/dev/null || true
mv test-stripe-payment.js scripts/stripe-tests/ 2>/dev/null || true
mv test-stripe-key-updated.js scripts/stripe-tests/ 2>/dev/null || true
mv test-stripe-publishable-key.html scripts/stripe-tests/ 2>/dev/null || true

# Move utility scripts
echo "Moving utility scripts..."
mv restart-dev-server.sh scripts/utilities/ 2>/dev/null || true
mv run-dev-tests.sh scripts/utilities/ 2>/dev/null || true
mv stop-dev-servers.sh scripts/utilities/ 2>/dev/null || true
mv create-widget-config-direct.js scripts/utilities/ 2>/dev/null || true
mv create-emulator-widget-config.js scripts/utilities/ 2>/dev/null || true
mv create-emulator-widget-config.cjs scripts/utilities/ 2>/dev/null || true
mv create-test-widget-config.js scripts/utilities/ 2>/dev/null || true
mv test-local-loader.js scripts/utilities/ 2>/dev/null || true
mv test-local-loader.html scripts/utilities/ 2>/dev/null || true
mv create-enhanced-widget-config.js scripts/utilities/ 2>/dev/null || true
mv run-enhanced-widget-config.sh scripts/utilities/ 2>/dev/null || true

# Create a README file for each directory
echo "Creating README files..."

cat > scripts/widget-tests/README.md << 'EOF'
# Widget Tests

This directory contains test files and scripts for the widget system.

## HTML Test Files

These HTML files are used to test various aspects of the widget system:

- `real-chat-test.html`: Test the real chat functionality
- `direct-chat-test.html`: Test direct chat functionality
- `simple-chat-test.html`: Simple test for chat functionality
- `widget-tester.html`: General widget tester
- etc.

## Test Scripts

These scripts are used to run the tests:

- `run-real-chat-test.sh`: Run the real chat test
- `run-direct-chat-test.sh`: Run the direct chat test
- etc.

## Usage

To run a test, use the corresponding script:

```bash
./run-real-chat-test.sh
```
EOF

cat > scripts/stripe-tests/README.md << 'EOF'
# Stripe Tests

This directory contains test files and scripts for the Stripe integration.

## Test Files

These files are used to test various aspects of the Stripe integration:

- `test-stripe.js`: Test Stripe API
- `test-webhook.js`: Test Stripe webhooks
- etc.

## Usage

To run a test, use Node.js:

```bash
node test-stripe.js
```
EOF

cat > scripts/utilities/README.md << 'EOF'
# Utilities

This directory contains utility scripts for development and deployment.

## Scripts

- `restart-dev-server.sh`: Restart the development server
- `stop-dev-servers.sh`: Stop all development servers
- etc.

## Usage

To run a utility script:

```bash
./restart-dev-server.sh
```
EOF

echo "Done! Files have been organized into the following directories:"
echo "- scripts/widget-tests/"
echo "- scripts/stripe-tests/"
echo "- scripts/utilities/"
