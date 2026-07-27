#!/usr/bin/env python3
"""Put every spoken-digit asset on one loudness bed.

The recordings arrived at wildly different levels -- over 9 dB between the
quietest language and the loudest, with one pinned to full scale. That matters
more than it looks, because station.js runs every language through a fixed
drive stage into a soft-clip (buildVoiceBus). How much that saturator mangles a
voice depends entirely on how hot it arrives: the quiet languages get pleasant
grit, the loud ones get squashed to a third of their dynamic range and read as
distortion. Evening out the input is what makes the saturator behave.

Levels are measured over speech only. The assets carry different amounts of
leading and trailing silence, so whole-file RMS would rank a heavily padded
take as quieter than it sounds.

Overwrites the assets in place. Re-runnable: a normalised file measures at the
target and gets no further gain. Usage: ./normalize_voices.py [--dry-run]
"""
import array
import math
import os
import sys
import wave

AUDIO_DIR = os.path.join(os.path.dirname(os.path.abspath(__file__)), "assets", "audio")

# Chosen by simulating the station.js voice bus over the whole asset set: it is
# the level where every language lands within about 1 dB of the others at the
# saturator's output, and where the default English keeps its presence in the mix
# while getting back some of the dynamic range the drive stage was taking off it.
TARGET_DBFS = -24.0

# Headroom under full scale. Nothing should need this -- every language is at or
# above the target and so gets attenuated -- but a future recording could arrive
# quiet and peaky, and boosting it into the ceiling would trade one clipped asset
# for another.
PEAK_CEILING_DBFS = -3.0

FRAME_MS = 10
SPEECH_GATE = 0.15  # frames above this share of the file's peak count as speech

FULL_SCALE = 32768.0


def read_wav(path):
    with wave.open(path, "rb") as w:
        if w.getsampwidth() != 2 or w.getnchannels() != 1:
            raise SystemExit(f"{path}: expected 16-bit mono, got "
                             f"{w.getsampwidth() * 8}-bit {w.getnchannels()}ch")
        params = w.getparams()
        samples = array.array("h")
        samples.frombytes(w.readframes(w.getnframes()))
    return samples, params


def speech_rms(samples, rate):
    """RMS over the speaking parts only, as a fraction of full scale."""
    frame = max(1, rate * FRAME_MS // 1000)
    frames = [samples[i:i + frame] for i in range(0, len(samples) - frame + 1, frame)]
    if not frames:
        return 0.0
    energies = [math.sqrt(sum(s * s for s in f) / len(f)) for f in frames]
    gate = max(energies) * SPEECH_GATE
    speaking = [e for e in energies if e > gate]
    if not speaking:
        speaking = energies
    return math.sqrt(sum(e * e for e in speaking) / len(speaking)) / FULL_SCALE


def db(x):
    return 20 * math.log10(x) if x > 0 else float("-inf")


def main():
    dry_run = "--dry-run" in sys.argv
    names = sorted(f for f in os.listdir(AUDIO_DIR) if f.endswith(".wav"))
    if not names:
        raise SystemExit(f"no .wav assets under {AUDIO_DIR}")

    by_lang = {}
    print(f"target {TARGET_DBFS:+.1f} dBFS (speech-gated RMS)"
          f"{'   [dry run]' if dry_run else ''}\n")
    print(f"  {'file':<22}{'was':>9}{'gain':>9}{'now':>9}{'peak':>9}")

    for name in names:
        path = os.path.join(AUDIO_DIR, name)
        samples, params = read_wav(path)
        level = speech_rms(samples, params.framerate)
        if level <= 0:
            raise SystemExit(f"{path}: silent, nothing to normalise")

        gain_db = TARGET_DBFS - db(level)
        peak = max(abs(s) for s in samples) / FULL_SCALE
        headroom_db = PEAK_CEILING_DBFS - db(peak)
        gain_db = min(gain_db, headroom_db)
        gain = 10 ** (gain_db / 20)

        if not dry_run:
            scaled = array.array("h", (
                max(-32768, min(32767, int(round(s * gain)))) for s in samples))
            with wave.open(path, "wb") as w:
                w.setparams(params)
                w.writeframes(scaled.tobytes())
            samples = scaled

        new_level = db(speech_rms(samples, params.framerate)) if not dry_run else \
            db(level) + gain_db
        new_peak = db(max(abs(s) for s in samples) / FULL_SCALE) if not dry_run else \
            db(peak) + gain_db
        print(f"  {name:<22}{db(level):>8.1f}d{gain_db:>+8.1f}d"
              f"{new_level:>8.1f}d{new_peak:>8.1f}d")
        by_lang.setdefault(name.rsplit("_", 1)[0], []).append(new_level)

    print(f"\n  {'language':<22}{'now':>9}")
    for lang, levels in sorted(by_lang.items()):
        print(f"  {lang:<22}{sum(levels) / len(levels):>8.1f}d")


if __name__ == "__main__":
    main()
