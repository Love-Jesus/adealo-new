#!/bin/bash

# Delete the intercomStyleWidgetAdapter function
echo "Deleting intercomStyleWidgetAdapter function..."
firebase functions:delete intercomStyleWidgetAdapter --force --project adealo-ce238

echo "Function deletion completed."
