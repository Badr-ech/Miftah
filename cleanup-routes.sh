#!/bin/bash
# Bash script to remove conflicting routes
# Should be run before build to ensure no route conflicts exist

echo "Cleaning up conflicting route.js files..."

ROUTE_FILES=(
    "src/app/(app)/teacher/analytics/route.js"
    "src/app/(app)/teacher/courses/new/route.js"
    "src/app/(app)/teacher/courses/route.js"
    "src/app/(app)/teacher/communication/route.js"
    "src/app/(app)/progress/route.js"
)

for file in "${ROUTE_FILES[@]}"; do
    if [ -f "$file" ]; then
        rm -f "$file"
        echo "Removed: $file"
    else
        echo "File not found: $file - skipping"
    fi
done

echo "Route cleanup completed"
