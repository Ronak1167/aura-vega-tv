#!/bin/bash
VDA="/home/ronak_jain/vega/sdk/vega-sdk/main/0.24.12112/bin/tools/vda"
D="emulator-5554"

echo "=== /proc/uptime ==="
$VDA -L tcp:5037 -s $D shell "cat /proc/uptime"

echo "=== init status ==="
$VDA -L tcp:5037 -s $D shell "cat /proc/1/status 2>&1 | head -5"

echo "=== Running processes (ps) ==="
$VDA -L tcp:5037 -s $D shell "ps 2>&1 | head -50"

echo "=== dmesg last 20 lines ==="
$VDA -L tcp:5037 -s $D shell "dmesg 2>&1 | tail -20"
