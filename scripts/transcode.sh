#!/bin/bash
set -e

INPUT_FILE=$(ls -t "/mnt/c/Users/Ronak Jain/aura-vega-tv/scripts/recordings/"*.webm | head -n 1)
OUTPUT_DIR="/mnt/c/Users/Ronak Jain/aura-vega-tv/docs/demo-video"
OUTPUT_FILE="$OUTPUT_DIR/aura-vega-tv-demo.mp4"

mkdir -p "$OUTPUT_DIR"

echo "Transcoding from: $INPUT_FILE"
echo "Transcoding to:   $OUTPUT_FILE"

ffmpeg -y -i "$INPUT_FILE" \
  -c:v libx264 \
  -preset medium \
  -crf 18 \
  -pix_fmt yuv420p \
  -r 30 \
  -movflags +faststart \
  "$OUTPUT_FILE"

echo "Transcode completed successfully!"
ls -lh "$OUTPUT_FILE"
