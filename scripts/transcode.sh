#!/bin/bash
set -e

INPUT_VIDEO=$(ls -t "/mnt/c/Users/Ronak Jain/aura-vega-tv/scripts/recordings/"*.webm | head -n 1)
INPUT_AUDIO="/mnt/c/Users/Ronak Jain/aura-vega-tv/scripts/full_narration.wav"
OUTPUT_DIR="/mnt/c/Users/Ronak Jain/aura-vega-tv/docs/demo-video"
OUTPUT_FILE="$OUTPUT_DIR/aura-vega-tv-demo.mp4"

mkdir -p "$OUTPUT_DIR"

echo "Transcoding Video: $INPUT_VIDEO"
echo "Muxing Audio:      $INPUT_AUDIO"
echo "Output:            $OUTPUT_FILE"

ffmpeg -y \
  -i "$INPUT_VIDEO" \
  -i "$INPUT_AUDIO" \
  -c:v libx264 \
  -preset medium \
  -crf 18 \
  -pix_fmt yuv420p \
  -r 30 \
  -c:a aac \
  -b:a 192k \
  -shortest \
  -movflags +faststart \
  "$OUTPUT_FILE"

echo "Transcode with narration audio completed successfully!"
ls -lh "$OUTPUT_FILE"
ffprobe "$OUTPUT_FILE"
