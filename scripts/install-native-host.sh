#!/bin/bash

set -eou pipefail

SCRIPT_DIR="$(cd "$(dirname "$0")" && pwd)"
PROJECT_DIR="$(dirname "$SCRIPT_DIR")"
HOST_DIR="$PROJECT_DIR/native"
BUILD_DIR="$HOST_DIR/dist"
BINARY_NAME="native"
BINARY_PATH="$BUILD_DIR/$BINARY_NAME"
HOST_NAME="com.notion_cal.apple_reminders"

CHROME_NMH_DIR="$HOME/Library/Application Support/Google/Chrome/NativeMessagingHosts"

echo "Building native host..."
mkdir -p "$BUILD_DIR"
bun build --compile "$HOST_DIR/src/index.ts" --outfile "$BINARY_PATH"
chmod +x "$BINARY_PATH"

echo "Installing native messaging manifest..."
mkdir -p "$CHROME_NMH_DIR"

# Get extension ID from loaded extension — update this after first install
EXTENSION_ID="${1:-PLACEHOLDER}"

cat > "$CHROME_NMH_DIR/$HOST_NAME.json" <<EOF
{
  "name": "$HOST_NAME",
  "description": "Native messaging host for Apple Reminders integration",
  "path": "$BINARY_PATH",
  "type": "stdio",
  "allowed_origins": ["chrome-extension://$EXTENSION_ID/"]
}
EOF

echo "Done."
echo "  Binary: $BINARY_PATH"
echo "  Manifest: $CHROME_NMH_DIR/$HOST_NAME.json"
if [ "$EXTENSION_ID" = "PLACEHOLDER" ]; then
  echo ""
  echo "  ⚠ Extension ID is PLACEHOLDER. Re-run with your extension ID:"
  echo "    ./scripts/install-native.sh <extension-id>"
fi
