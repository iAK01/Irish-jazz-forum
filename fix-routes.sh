#!/bin/bash

files=(
  "app/api/members/[slug]/approve/route.ts:slug"
  "app/api/members/[slug]/reject/route.ts:slug"
  "app/api/members/public/[slug]/route.ts:slug"
  "app/api/invitations/[invitationId]/route.ts:invitationId"
  "app/api/posts/[postId]/route.ts:postId"
  "app/api/threads/[threadId]/route.ts:threadId"
  "app/api/threads/[threadId]/posts/route.ts:threadId"
  "app/api/users/[id]/route.ts:id"
  "app/api/working-groups/[id]/route.ts:id"
  "app/dashboard/admin/members/[slug]/review/page.tsx:slug"
  "app/dashboard/admin/users/[userId]/working-groups/page.tsx:userId"
  "app/dashboard/forum/[groupSlug]/page.tsx:groupSlug"
  "app/dashboard/forum/general/[threadSlug]/page.tsx:threadSlug"
  "app/members/[slug]/page.tsx:slug"
)

for entry in "${files[@]}"; do
  IFS=':' read -r file param <<< "$entry"
  if [ -f "$file" ]; then
    echo "Fixing $file..."
    sed -i '' "s/{ params }: { params: { $param: string } }/{ params }: { params: Promise<{ $param: string }> }/g" "$file"
    sed -i '' "s/const $param = params\?\\.$param/const { $param } = await params/g" "$file"
    sed -i '' "s/params\\.$param/$param/g" "$file"
  fi
done

echo "Done!"
