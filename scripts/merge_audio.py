import os
import subprocess
import imageio_ffmpeg

def merge():
    ffmpeg = imageio_ffmpeg.get_ffmpeg_exe()
    audio_dir = os.path.abspath('scripts/audio_segments')
    out_wav = os.path.abspath('scripts/full_narration.wav')
    out_mp3 = os.path.abspath('scripts/full_narration.mp3')

    segments = [
        '01_intro_ronak.mp3',
        '02_shelf_and_navigation.mp3',
        '03_ambient_mode.mp3',
        '04_couch_consensus.mp3',
        '05_explainable_ai_winner.mp3',
        '06_4k_player_xray.mp3',
        '07_microservices_outro.mp3'
    ]

    durations = []
    wav_files = []
    for s in segments:
        mp3_path = os.path.join(audio_dir, s)
        wav_path = os.path.join(audio_dir, s.replace('.mp3', '.wav'))
        
        # Get exact duration in seconds
        cmd_dur = [ffmpeg, '-i', mp3_path]
        res = subprocess.run(cmd_dur, stderr=subprocess.PIPE, stdout=subprocess.PIPE, text=True)
        dur_sec = 0.0
        for line in res.stderr.splitlines():
            if "Duration:" in line:
                # Duration: 00:00:44.21, start: ...
                t_str = line.split("Duration:")[1].split(",")[0].strip()
                h, m, sec = t_str.split(":")
                dur_sec = float(h)*3600 + float(m)*60 + float(sec)
        durations.append(dur_sec)

        cmd = [ffmpeg, '-y', '-i', mp3_path, '-ar', '24000', '-ac', '1', '-c:a', 'pcm_s16le', wav_path]
        subprocess.run(cmd, check=True, stdout=subprocess.PIPE, stderr=subprocess.PIPE)
        wav_files.append(wav_path)

    gap_sec = 0.8
    silence_wav = os.path.join(audio_dir, 'silence.wav')
    cmd_silence = [ffmpeg, '-y', '-f', 'lavfi', '-i', 'anullsrc=r=24000:cl=mono', '-t', str(gap_sec), '-c:a', 'pcm_s16le', silence_wav]
    subprocess.run(cmd_silence, check=True, stdout=subprocess.PIPE, stderr=subprocess.PIPE)

    concat_txt = os.path.join(audio_dir, 'concat.txt')
    with open(concat_txt, 'w', encoding='utf-8') as f:
        for i, w in enumerate(wav_files):
            w_norm = w.replace('\\', '/')
            s_norm = silence_wav.replace('\\', '/')
            f.write(f"file '{w_norm}'\n")
            if i < len(wav_files) - 1:
                f.write(f"file '{s_norm}'\n")

    cmd_concat = [ffmpeg, '-y', '-f', 'concat', '-safe', '0', '-i', concat_txt, '-c:a', 'pcm_s16le', out_wav]
    subprocess.run(cmd_concat, check=True, stdout=subprocess.PIPE, stderr=subprocess.PIPE)

    cmd_mp3 = [ffmpeg, '-y', '-i', out_wav, '-c:a', 'libmp3lame', '-b:a', '192k', out_mp3]
    subprocess.run(cmd_mp3, check=True, stdout=subprocess.PIPE, stderr=subprocess.PIPE)

    # Calculate timeline markers
    print("\n=== TIMELINE MARKERS FOR HARNESS AUTOMATION ===")
    curr_time = 0.0
    for i, s in enumerate(segments):
        start_t = curr_time
        dur = durations[i]
        end_t = start_t + dur
        print(f"Act {i+1} [{s}]: Start={start_t:.2f}s, Dur={dur:.2f}s, End={end_t:.2f}s")
        curr_time = end_t + gap_sec

    total_dur = curr_time - gap_sec
    print(f"\nTotal Narration Duration: {total_dur:.2f}s ({total_dur/60:.2f} minutes)")
    print(f"Merged output saved to: {out_mp3}")

if __name__ == "__main__":
    merge()
