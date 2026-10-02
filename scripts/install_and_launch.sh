#!/bin/bash
# Install and launch Aura Vega TV app on the virtual device
VEGA="/home/ronak_jain/vega/bin/vega"
VDA="/home/ronak_jain/vega/sdk/vega-sdk/main/0.24.12112/bin/tools/vda"
VPKG_DEBUG="/mnt/c/Users/Ronak Jain/aura-vega-tv/build/x86_64-debug/com.auravega.tv_x86_64.vpkg"
VPKG_RELEASE="/mnt/c/Users/Ronak Jain/aura-vega-tv/build/x86_64-release/com.auravega.tv_x86_64.vpkg"
APP_ID="com.auravega.tv.main"
DEVICE="VirtualDevice"

echo "=== Installing Aura Vega TV (Release) ==="
"$VEGA" run-app "$VPKG_RELEASE" "$APP_ID" --deviceId "$DEVICE" 2>&1

echo ""
echo "=== Install complete. Checking app status ==="
"$VEGA" device is-app-running --deviceId "$DEVICE" "$APP_ID" 2>&1
