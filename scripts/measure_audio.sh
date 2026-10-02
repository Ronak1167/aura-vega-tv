#!/bin/bash
DIR="/mnt/c/Users/Ronak Jain/aura-vega-tv/scripts/audio_segments"
total=0
for f in "$DIR"/*.mp3; do
  dur=$(ffprobe -v error -show_entries format=duration -of default=noprint_wrappers=1:nokey=1 "$f")
  printf "%-35s %6.2f s\n" "$(basename "$f")" "$dur"
  total=$(echo "$total + $dur" | bc)
done
printf "Total Duration: %6.2f seconds (%4.2f minutes)\n" "$total" "$(echo "$total / 60" | bc -l)"
