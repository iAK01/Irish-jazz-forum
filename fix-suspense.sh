#!/bin/bash

files=(
  "app/join/page.tsx"
  "app/join/onboarding/page.tsx"
  "app/dashboard/forum/new/page.tsx"
  "app/components/NewThreadForm.tsx"
)

for file in "${files[@]}"; do
  if [ -f "$file" ]; then
    echo "Fixing $file..."
    
    # Add Suspense import if not present
    if ! grep -q "import { Suspense }" "$file"; then
      sed -i '' '1i\
import { Suspense } from "react";\
' "$file"
    fi
    
    echo "✓ Added Suspense import to $file"
  fi
done

echo "Done! Now manually wrap the components in Suspense boundaries."
