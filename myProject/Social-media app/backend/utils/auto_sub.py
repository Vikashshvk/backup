import sys
import os
import subprocess
import wave
import numpy as np
from faster_whisper import WhisperModel

def generate_subtitles(video_path, ffmpeg_bin="ffmpeg"):
    output_dir = os.path.dirname(video_path)
    base_name = os.path.splitext(os.path.basename(video_path))[0]
    temp_wav = os.path.join(output_dir, f"{base_name}-temp.wav")
    vtt_path = os.path.join(output_dir, f"{base_name}-auto.vtt")

    # 1. 16kHz mono 16-bit PCM WAV extract karo
    ffmpeg_cmd = [
        ffmpeg_bin,
        "-y",
        "-i", video_path,
        "-vn",
        "-acodec", "pcm_s16le",
        "-ar", "16000",
        "-ac", "1",
        temp_wav
    ]

    try:
        subprocess.run(ffmpeg_cmd, stdout=subprocess.DEVNULL, stderr=subprocess.DEVNULL, check=True)
    except Exception as e:
        print(f"Audio extraction failed via FFmpeg: {e}", file=sys.stderr)
        return

    try:
        # 2. Complete audio ko float32 array me convert karo
        with wave.open(temp_wav, "rb") as wf:
            total_frames = wf.getnframes()
            frames = wf.readframes(total_frames)
            audio_array = np.frombuffer(frames, dtype=np.int16).astype(np.float32) / 32768.0

        # 3. Model load karo
        model = WhisperModel("tiny", device="cpu", compute_type="int8")

        # vad_filter=True aur beam_size=1 se puri video bina ruke transcribe hoti hai
        segments, _ = model.transcribe(
            audio_array,
            beam_size=1,
            best_of=1,
            temperature=0,
            vad_filter=True,
            vad_parameters=dict(min_silence_duration_ms=500),
            word_timestamps=False
        )

        def format_timestamp(seconds):
            hours = int(seconds // 3600)
            minutes = int((seconds % 3600) // 60)
            secs = seconds % 60
            return f"{hours:02d}:{minutes:02d}:{secs:06.3f}"

        # 4. Generator ko force iterate karke puri list banao
        segment_list = list(segments)

        with open(vtt_path, "w", encoding="utf-8") as f:
            f.write("WEBVTT\n\n")
            for seg in segment_list:
                text = seg.text.strip()
                if text:
                    start = format_timestamp(seg.start)
                    end = format_timestamp(seg.end)
                    f.write(f"{start} --> {end}\n{text}\n\n")

        print(vtt_path)

    finally:
        if os.path.exists(temp_wav):
            try:
                os.remove(temp_wav)
            except OSError:
                pass

if __name__ == "__main__":
    if len(sys.argv) > 2:
        generate_subtitles(sys.argv[1], sys.argv[2])
    elif len(sys.argv) > 1:
        generate_subtitles(sys.argv[1])