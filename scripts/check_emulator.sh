#!/bin/bash
# Full emulator diagnostics and app installation script
VDA="/home/ronak_jain/vega/sdk/vega-sdk/main/0.24.12112/bin/tools/vda"
VPT="/home/ronak_jain/vega/sdk/vega-sdk/main/0.24.12112/bin/tools/vpt"
DEVICE="emulator-5554"
VEGA="/home/ronak_jain/vega/bin/vega"

echo "=== Devices ==="
$VDA -L tcp:5037 devices

echo ""
echo "=== Shell: ls /system/bin/ ==="
$VDA -L tcp:5037 -s $DEVICE shell "ls /system/bin/ 2>&1 | head -30"

echo ""
echo "=== Shell: getprop ==="
$VDA -L tcp:5037 -s $DEVICE shell "/system/bin/getprop sys.boot_completed 2>&1"

echo ""
echo "=== Shell: whoami ==="
$VDA -L tcp:5037 -s $DEVICE shell "whoami 2>&1"

echo ""
echo "=== Shell: ps ==="
$VDA -L tcp:5037 -s $DEVICE shell "ps 2>&1 | head -20"

echo ""
echo "=== Shell: pm list packages | head ==="
$VDA -L tcp:5037 -s $DEVICE shell "/system/bin/pm list packages 2>&1 | head -20"
