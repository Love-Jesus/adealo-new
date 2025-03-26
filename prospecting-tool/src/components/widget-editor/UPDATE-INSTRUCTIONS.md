# Widget Editor Update Instructions

The widget editor components need to be updated to work with the vanilla JavaScript widget approach. This file provides instructions for updating each component.

## General Changes

1. Remove any imports from the React widget components that were moved to the backup directory.
2. Update any references to those components to use the new vanilla JavaScript approach.
3. Update any widget configuration handling to match the new configuration format.

## Specific Components

### design-tab.tsx

- Update to use the new widget configuration format
- Remove any references to React widget components
- Ensure all design changes are properly reflected in the preview

### behavior-tab.tsx

- Update to use the new widget configuration format
- Remove any references to React widget components
- Ensure all behavior changes are properly reflected in the preview

### content-tab.tsx

- Update to use the new widget configuration format
- Remove any references to React widget components
- Ensure all content changes are properly reflected in the preview

### integration-tab.tsx

- Update to use the new widget configuration format
- Remove any references to React widget components
- Ensure all integration changes are properly reflected in the preview

## Testing

After updating each component, test it thoroughly to ensure it works correctly with the vanilla JavaScript widget approach.

1. Make changes in the widget editor
2. Verify that the changes are reflected in the preview
3. Test the generated widget configuration with the vanilla JavaScript widget
