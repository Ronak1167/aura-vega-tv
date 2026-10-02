#!/bin/bash
set -e
DIR="/mnt/c/Users/Ronak Jain/aura-vega-tv/scripts/audio_segments"
OUT="/mnt/c/Users/Ronak Jain/aura-vega-tv/scripts/full_narration.wav"

echo "Creating 0.8s silence buffer matching edge-tts format (24000Hz mono)..."
ffmpeg -y -f lavfi -i anullsrc=r=24000:cl=mono -t 0.8 -acodec pcm_s16le "$DIR/silence.wav"

for f in "$DIR"/*.mp3; do
  [ -f "$f" ] && ffmpeg -y -i "$f" -ar 24000 -ac 1 -c:a pcm_s16le "${f%.mp3}.wav"
done

cat << 'EOF' > "$DIR/concat_list.txt"
file '01_intro_ronak.wav'
file 'silence.wav'
file '02_ambient_and_consensus.wav'
file 'silence.wav'
file '03_mood_filters_and_shelf.wav'
file 'silence.wav'
file '04_scoring_math_and_explainability.wav'
file 'silence.wav'
file '05_winner_resolution.wav'
file 'silence.wav'
file '06_player_and_outro.wav'
EOF

echo "Concatenating uncompressed PCM WAV..."
ffmpeg -y -f concat -safe 0 -i "$DIR/concat_list.txt" -c:a pcm_s16le "$OUT"

echo "Full audio narration assembled at: $OUT"
ffprobe -v error -show_entries format=duration -of default=noprint_wrappers=1:nokey=1 "$OUT"
