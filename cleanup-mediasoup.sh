#!/bin/bash

echo "🧹 Cleaning up Mediasoup code after successful LiveKit migration"
echo "================================================================"

# Confirm before proceeding
read -p "Are you sure you want to remove all Mediasoup code? This action cannot be undone. (y/N): " -n 1 -r
echo
if [[ ! $REPLY =~ ^[Yy]$ ]]; then
    echo "❌ Cleanup cancelled"
    exit 1
fi

echo "🗑️  Removing Mediasoup files..."

# Remove Mediasoup server file
if [ -f "apps/server/src/mediasoup-server.ts" ]; then
    rm "apps/server/src/mediasoup-server.ts"
    echo "✅ Removed apps/server/src/mediasoup-server.ts"
fi

# Remove Mediasoup client hook
if [ -f "apps/web/hooks/useMediasoupClient.ts" ]; then
    rm "apps/web/hooks/useMediasoupClient.ts"
    echo "✅ Removed apps/web/hooks/useMediasoupClient.ts"
fi

echo "📦 Updating package.json files..."

# Update backend package.json
if [ -f "apps/server/package.json" ]; then
    # Remove mediasoup dependencies
    sed -i.bak '/"mediasoup":/d' apps/server/package.json
    sed -i.bak '/"ws":/d' apps/server/package.json
    sed -i.bak '/"@types\/ws":/d' apps/server/package.json
    
    # Remove mediasoup scripts
    sed -i.bak '/"dev:ws":/d' apps/server/package.json
    sed -i.bak '/"start:ws":/d' apps/server/package.json
    sed -i.bak '/"start:all":/d' apps/server/package.json
    
    # Clean up backup file
    rm apps/server/package.json.bak 2>/dev/null || true
    
    echo "✅ Updated apps/server/package.json"
fi

# Update frontend package.json
if [ -f "apps/web/package.json" ]; then
    # Remove mediasoup-client dependency
    sed -i.bak '/"mediasoup-client":/d' apps/web/package.json
    
    # Clean up backup file
    rm apps/web/package.json.bak 2>/dev/null || true
    
    echo "✅ Updated apps/web/package.json"
fi

echo "🔧 Updating environment configuration..."

# Update backend env.ts to remove MEDIASOUP_ANNOUNCED_IP
if [ -f "apps/server/src/config/env.ts" ]; then
    sed -i.bak '/MEDIASOUP_ANNOUNCED_IP/,/},/d' apps/server/src/config/env.ts
    rm apps/server/src/config/env.ts.bak 2>/dev/null || true
    echo "✅ Removed MEDIASOUP_ANNOUNCED_IP from env.ts"
fi

echo "🎯 Setting LiveKit as default..."

# Update .env to set LiveKit as default
if [ -f ".env" ]; then
    sed -i.bak 's/NEXT_PUBLIC_USE_LIVEKIT=false/NEXT_PUBLIC_USE_LIVEKIT=true/' .env
    rm .env.bak 2>/dev/null || true
    echo "✅ Set NEXT_PUBLIC_USE_LIVEKIT=true in .env"
fi

echo "🧹 Cleaning up feature flag code..."

# Remove feature flag logic from call-context.tsx
if [ -f "apps/web/contexts/call-context.tsx" ]; then
    # This would require more complex sed operations
    echo "⚠️  Manual cleanup needed for call-context.tsx"
    echo "   Remove useLiveKitFlag logic and always use LiveKit"
fi

# Remove feature flag logic from components
echo "⚠️  Manual cleanup needed for components:"
echo "   - apps/web/components/call/call-room.tsx"
echo "   - apps/web/components/call/call-video-grid.tsx"
echo "   - apps/web/components/call/call-preview.tsx"
echo "   - apps/web/hooks/use-call-join.ts"
echo "   - apps/web/hooks/use-call-media-controls.ts"
echo "   - apps/web/hooks/use-call-producers.ts"

echo "📚 Updating documentation..."

# Update README.md if it exists
if [ -f "README.md" ]; then
    echo "⚠️  Manual cleanup needed for README.md"
    echo "   Remove Mediasoup references and update with LiveKit information"
fi

echo ""
echo "🎉 Mediasoup cleanup completed!"
echo ""
echo "⚠️  IMPORTANT: Manual cleanup still needed for:"
echo "   1. Remove feature flag logic from React components"
echo "   2. Update documentation files"
echo "   3. Test the application thoroughly"
echo ""
echo "Next steps:"
echo "1. Review and manually clean up the components listed above"
echo "2. Update documentation"
echo "3. Run tests to ensure everything works"
echo "4. Commit the changes"
echo ""
echo "To revert this cleanup, restore from git:"
echo "   git checkout HEAD -- apps/server/src/mediasoup-server.ts"
echo "   git checkout HEAD -- apps/web/hooks/useMediasoupClient.ts"
