# Widget Verification Process

This document provides an overview of the widget verification process and instructions on how to use the verification tools.

## Overview

The widget verification process is designed to systematically test and validate the functionality of the widget implementation (Weeks 1 and 2). The process includes:

1. Testing the basic widget functionality (Week 1)
2. Testing the server-side configuration system (Week 2)
3. Documenting the test results
4. Identifying and addressing any issues

## Verification Tools

The following tools are provided to assist with the verification process:

1. **WIDGET-VERIFICATION-PLAN.md**: A comprehensive test plan that outlines all the test cases to be executed.
2. **run-widget-verification-tests.sh**: A script that guides you through the verification process and helps document the results.
3. **WIDGET-TEST-RESULTS.md**: A template for documenting the test results.
4. **test-widget-config.html**: An HTML page for testing the widget configuration system.
5. **run-test-widget-config.sh**: A script to run the test HTML page.
6. **deploy-widget-config-functions.sh**: A script to deploy the widget configuration functions.

## Verification Process

### Step 1: Review the Verification Plan

Before starting the verification process, review the verification plan to understand the scope and objectives of the testing:

```bash
cat prospecting-tool/WIDGET-VERIFICATION-PLAN.md
```

### Step 2: Deploy the Widget Configuration Functions

Deploy the widget configuration functions to Firebase:

```bash
./prospecting-tool/deploy-widget-config-functions.sh
```

### Step 3: Run the Verification Tests

Run the verification tests script, which will guide you through the testing process:

```bash
./prospecting-tool/run-widget-verification-tests.sh
```

The script will:

1. Open the test pages as needed
2. Prompt you to perform specific actions
3. Ask you to evaluate the results
4. Document the test results in a temporary file

### Step 4: Review and Finalize the Test Results

After completing the verification tests, review the generated test results file:

```bash
cat prospecting-tool/WIDGET-TEST-RESULTS-TEMP.md
```

Update the file with any additional information, such as:

1. Overall assessment
2. Recommendations
3. Next steps

Once you're satisfied with the results, rename the file:

```bash
mv prospecting-tool/WIDGET-TEST-RESULTS-TEMP.md prospecting-tool/WIDGET-TEST-RESULTS.md
```

### Step 5: Address Any Issues

If any issues were identified during the verification process, address them before proceeding to Week 3 implementation.

## Manual Testing

If you prefer to perform manual testing without using the verification script, you can:

1. Open the test HTML page:

```bash
./prospecting-tool/run-test-widget-config.sh
```

2. Follow the test cases outlined in the verification plan:

```bash
cat prospecting-tool/WIDGET-VERIFICATION-PLAN.md
```

3. Document the results manually in the test results file:

```bash
nano prospecting-tool/WIDGET-TEST-RESULTS.md
```

## Test Environment

For optimal testing, use the following environment:

- **Browser**: Chrome or Firefox (latest version)
- **Operating System**: macOS, Windows, or Linux
- **Network**: Stable internet connection

## Troubleshooting

If you encounter any issues during the verification process:

1. **Script Execution Issues**: Make sure the scripts are executable:

```bash
chmod +x prospecting-tool/run-widget-verification-tests.sh
chmod +x prospecting-tool/run-test-widget-config.sh
chmod +x prospecting-tool/deploy-widget-config-functions.sh
```

2. **Firebase Deployment Issues**: Make sure you're logged in to Firebase:

```bash
firebase login
```

3. **Browser Issues**: Try using a different browser or clearing the browser cache.

## Next Steps

After completing the verification process and addressing any issues:

1. Document the lessons learned
2. Update the implementation as needed
3. Proceed to Week 3 implementation
