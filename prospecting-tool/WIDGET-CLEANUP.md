# Widget System Cleanup

This document lists files that can be safely removed as part of the migration to the vanilla JavaScript widget approach.

## React Components to Remove

These React components are no longer needed since the widget is now generated using vanilla JavaScript:

```
src/components/widget/components/HomeScreen.tsx
src/components/widget/components/LauncherButton.tsx
src/components/widget/components/ChatScreen.tsx
src/components/widget/components/BookDemoScreen.tsx
src/components/widget/components/CallMeScreen/index.tsx
src/components/widget/components/CallMeScreen/QualificationStep.tsx
src/components/widget/components/CallMeScreen/TeamSelection.tsx
src/components/widget/components/CallMeScreen/PhoneInput.tsx
src/components/widget/components/CallMeScreen.tsx
src/components/widget/styles/styled-components.ts
src/components/widget/Widget.tsx
src/components/widget/hooks/useWidgetConfig.tsx
```

## Utility Files to Remove

These utility files are specific to the React-based widget implementation:

```
public/widget.bundle.js (if it exists)
public/widget-loader.js (replaced by the new implementation)
```

## Documentation Files to Consolidate

These documentation files can be consolidated into the new WIDGET-SYSTEM.md:

```
CHAT-WIDGET-SOLUTION.md
CHAT-WIDGET-IMPLEMENTATION-STATUS.md
CHAT-WIDGET-UPDATES.md
CHAT-WIDGET-FILE-UPLOAD.md
PRODUCTION-CHAT-WIDGET-TESTING.md
WIDGET-VERIFICATION-PLAN.md
WIDGET-VERIFICATION-README.md
WIDGET-CONFIG-EMULATOR.md
WIDGET-CONFIG-SYSTEM.md
WIDGET-CUSTOM-DOMAIN.md
WIDGET-LOCAL-DEVELOPMENT.md
WIDGET-SYSTEM-README.md
REAL-CHAT-WIDGET-TESTING.md
SIMPLE-CHAT-TEST.md
```

## Test Files to Organize

These test files should be organized into a more logical structure:

```
real-chat-test.html
direct-chat-test.html
simple-chat-test.html
test-chatt-widget.html
public/real-chat-test-production.html
public/test-production-widget.html
public/widget-tester.html
public/simple-widget-tester.html
public/test-widget-config.html
public/test-user-widget-local.html
public/test-user-widget.html
public/enhanced-design-tester.html
public/widget-id-tester.html
public/simple-id-tester.html
public/local-widget-embed.html
```

## Script Files to Organize

These script files should be organized into a more logical structure:

```
run-real-chat-test.sh
run-real-chat-test-production.sh
run-direct-chat-test.sh
run-simple-chat-test.sh
run-test-local-loader.sh
run-test-production-widget.sh
run-simple-widget-tester.sh
run-test-widget-config.sh
run-user-widget-test.sh
run-user-widget-local-test.sh
run-widget-verification-tests.sh
run-enhanced-design-tester.sh
run-simple-id-tester.sh
run-create-widget-config-direct.sh
run-create-emulator-widget-config.sh
run-create-emulator-widget-config-cjs.sh
run-emulator-with-permissive-rules.sh
run-widget-config-emulator.sh
```

## Implementation Plan

1. **Create a backup** of all files before removing anything
2. **Remove React components** that are no longer needed
3. **Consolidate documentation** into the new WIDGET-SYSTEM.md
4. **Organize test files** into a more logical structure
5. **Update any references** to the removed files

## Note on Widget Editor

The widget editor components (`src/components/widget-editor/*`) should be kept as they are used for configuring the widget in the dashboard. However, they may need to be updated to work with the new vanilla JS approach.
