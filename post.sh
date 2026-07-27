#!/usr/bin/env bash
# Cut the recorded takes in clips/ into everything the promo needs: captioned
# 4:3 clips, 9:16 versions for short-video feeds, looping GIFs, and the trailer.
# Output lands in clips/out/. Re-runnable — it overwrites its own output.
#
# Companion to video_shot_list.md (what each clip is for) and capture.sh (which
# records them). Usage: ./post.sh
set -uo pipefail
cd "$(dirname "$0")"

IN=clips
OUT=clips/out
WORK=clips/out/.segments
FONT=assets/fonts/VT323-Regular.ttf
AMBER=0xffb000
URL="kleer001.itch.io/finding-numbers"

[ -f "$FONT" ] || { echo "missing font: $FONT" >&2; exit 1; }
mkdir -p "$OUT" "$WORK"

# Trim windows measured off the takes: where each clip's beat actually sits,
# past the title splash and with a little air on both ends. Captions are the
# shot list's, burned in because social video autoplays muted.
#   name = in_seconds duration_seconds caption
clip_cut() {
  case "$1" in
    title)      echo "2.0 6.0|" ;;
    core-loop)  echo "3.3 15.0|no map. the station is your compass." ;;
    wrong-turn) echo "11.9 13.6|a correct turn adds a number. a wrong one adds nothing." ;;
    room-moved) echo "1.7 5.4|don't trust the walls." ;;
    pulse)      echo "9.6 6.0|" ;;
    crt-decay)  echo "4.3 18.2|dial in the decay." ;;
    jukebox)    echo "3.0 30.0|" ;;
    *)          echo "" ;;
  esac
}

# The takes carry a lot of energy the game's own audio spec doesn't claim to make:
# station.js builds a 300-3000 Hz band, but the captures came out with subsonic
# wander (the room take drifts to -0.077 DC) and a boxy ~280 Hz drone holding half
# of all energy. Neither reads as pitch. What they do is eat headroom and flatten
# the bed to an 8.5 dB crest factor, so it arrives as one unrelenting slab -- which
# is what makes the takes tiring rather than atmospheric. This clears both and
# leaves the voice band, where the station actually lives, alone.
AUDIO_FIX="highpass=f=250:p=2,highpass=f=250:p=2,\
equalizer=f=285:w=1.3:width_type=q:g=-4,\
equalizer=f=3200:w=1.0:width_type=q:g=-2,\
lowpass=f=4500:p=2"

# Clearing the low end raises crest factor, which pushes the static bursts back up
# toward full scale -- so cap them. Catches transients only; AAC needs the headroom
# because its intersample peaks land above what the PCM peak meter reports.
CEILING="alimiter=limit=-1.5dB:level=disabled"

# Then put every clip on one loudness bed so no cut slams. Measured on the treated
# audio, since the filter itself changes level. A linear gain, not loudnorm's
# dynamic ride: the takes are short on dynamics already and compression costs more.
TARGET_LUFS=-16
SILENT_FLOOR=-35   # below this a clip has no content to normalise, only a noise
                   # floor to amplify -- the title splash is silent because
                   # WebAudio cannot start before the player's first input.

# in: clip_name start_seconds duration_seconds -> gain in dB to reach TARGET_LUFS
norm_gain() {
  local measured
  measured=$(ffmpeg -nostdin -hide_banner -nostats -ss "$2" -t "$3" -i "$IN/$1.mp4" \
    -af "$AUDIO_FIX,ebur128=framelog=quiet" -f null - 2>&1 \
    | grep -m1 -E "^ +I:" | awk '{print $2}')
  [ -n "$measured" ] || { echo "could not measure loudness of $1" >&2; exit 1; }
  awk -v m="$measured" -v t="$TARGET_LUFS" -v f="$SILENT_FLOOR" \
    'BEGIN { printf "%.2f", (m < f) ? 0 : t - m }'
}

CLIPS=(title core-loop wrong-turn room-moved pulse crt-decay jukebox)
VERTICAL=(core-loop room-moved pulse)   # the shot list's short-video cuts
GIFS=(core-loop pulse)

# Captions go through a file, not an inline string: drawtext reads ':' as an
# option separator and a quote as end-of-text, so an apostrophe in the copy comes
# out swallowed. textfile= has no such reading.
cap_file() {
  local f="$WORK/cap-$2.txt"
  printf "%s" "$1" > "$f"
  printf "%s" "$f"
}

# Caption plate: sits above the HUD strip so it never covers the digit readout
# or the waterfall, which are the two things carrying the clip with the sound
# off. Near-opaque, or the maze glyphs read straight through the text.
caption_4x3() {
  printf "drawtext=fontfile=%s:textfile=%s:fontsize=30:fontcolor=%s:x=(w-text_w)/2:y=h-150:box=1:boxcolor=black@0.9:boxborderw=16" \
    "$FONT" "$(cap_file "$1" "$2")" "$AMBER"
}

# In 9:16 the caption goes in the black band under the frame, where it covers
# nothing at all and needs no plate.
caption_9x16() {
  printf "drawtext=fontfile=%s:textfile=%s:fontsize=44:fontcolor=%s:x=(w-text_w)/2:y=h/2+460" \
    "$FONT" "$(cap_file "$1" "$2")" "$AMBER"
}

encode=(-c:v libx264 -preset slow -crf 20 -pix_fmt yuv420p -c:a aac -b:a 160k -movflags +faststart)

echo "== captioned 4:3"
for c in "${CLIPS[@]}"; do
  spec="$(clip_cut "$c")"
  read -r ss dur <<<"${spec%%|*}"
  cap="${spec#*|}"
  vf="null"
  [ -n "$cap" ] && vf="$(caption_4x3 "$cap" "$c")"
  g="$(norm_gain "$c" "$ss" "$dur")"
  ffmpeg -v error -y -ss "$ss" -t "$dur" -i "$IN/$c.mp4" -vf "$vf" \
    -af "$AUDIO_FIX,volume=${g}dB,$CEILING" "${encode[@]}" "$OUT/$c.mp4"
  printf "   %-12s %ss  %+gdB\n" "$c.mp4" "$dur" "$g"
done

echo "== 9:16"
# Pad rather than crop: cropping to vertical throws away the HUD, which is where
# the digit count and the waterfall live — the whole reason a muted clip reads.
for c in "${VERTICAL[@]}"; do
  spec="$(clip_cut "$c")"
  read -r ss dur <<<"${spec%%|*}"
  cap="${spec#*|}"
  vf="scale=1080:-2,pad=1080:1920:0:(1920-ih)/2:black"
  [ -n "$cap" ] && vf="$vf,$(caption_9x16 "$cap" "$c-9x16")"
  ffmpeg -v error -y -ss "$ss" -t "$dur" -i "$IN/$c.mp4" -vf "$vf" \
    -af "$AUDIO_FIX,volume=$(norm_gain "$c" "$ss" "$dur")dB,$CEILING" "${encode[@]}" "$OUT/$c-9x16.mp4"
  printf "   %-12s %ss\n" "$c-9x16.mp4" "$dur"
done

echo "== gif"
for c in "${GIFS[@]}"; do
  spec="$(clip_cut "$c")"
  read -r ss dur <<<"${spec%%|*}"
  [ "$(echo "$dur > 5" | bc)" -eq 1 ] && dur=5   # a longer GIF gets too heavy to autoplay
  filters="fps=10,scale=400:-1:flags=lanczos"
  ffmpeg -v error -y -ss "$ss" -t "$dur" -i "$IN/$c.mp4" \
    -filter_complex "$filters,split[a][b];[a]palettegen=stats_mode=diff[p];[b][p]paletteuse=dither=bayer:bayer_scale=3" \
    -loop 0 "$OUT/$c.gif"
  printf "   %-12s %ss  %s\n" "$c.gif" "$dur" "$(du -h "$OUT/$c.gif" | cut -f1)"
done

echo "== trailer"
# Title, core loop, the decay, the room that moved, the pulse — opening on the
# title and closing on it with the URL. Hard cuts throughout; the game already
# cuts to static, so a dissolve would fight it.
#
# The wrong-turn clip is deliberately absent: its beat is a number that fails to
# arrive, which needs more setup than a trailer segment can give it and reads as
# nothing happening without one.
#
# Title and core loop run at their full clip length. The title splash is the
# game's tone in six seconds of amber and hum, and the core loop needs its whole
# run for the digit count to visibly climb — cut short, both read as filler.
#
# The pulse segment stops inside the blank the win wipe leaves behind, 5.2s in.
# Run it the standalone clip's full 6s and the next level pops back up for a
# beat before the end card, which reads as a dropped frame rather than an ending.
#
# The room is one continuous take, not two states cut together: the walk through
# it and the static that swallows it land in the same ten seconds, so the whole
# caption sits over the whole beat.
#   source in duration caption
TRAILER=(
  "title|2.0|6.0|"
  "core-loop|3.3|15.0|no map. the station is your compass."
  "crt-decay|9.5|8.0|dial in the decay."
  "room-moved|1.7|5.4|don't trust the walls."
  "pulse|9.6|5.2|"
)

rm -f "$WORK"/*.mp4
SEGS=()
i=0
for row in "${TRAILER[@]}"; do
  IFS='|' read -r src ss dur cap <<<"$row"
  vf="null"
  [ -n "$cap" ] && vf="$(caption_4x3 "$cap" "t$i")"
  seg="$(printf "%s/%02d-%s.mp4" "$WORK" "$i" "$src")"
  ffmpeg -v error -y -ss "$ss" -t "$dur" -i "$IN/$src.mp4" -vf "$vf" \
    -af "$AUDIO_FIX,volume=$(norm_gain "$src" "$ss" "$dur")dB,$CEILING" "${encode[@]}" "$seg"
  SEGS+=("$seg")
  i=$((i + 1))
done

# End card: the title splash held with the play URL, audio faded out. The URL
# is painted over the CONTINUE/NEW row — left showing, a trailer ends on what
# reads as a screenshot of a menu rather than on where to go.
END_DUR=4
ffmpeg -v error -y -ss 3.0 -t "$END_DUR" -i "$IN/title.mp4" \
  -vf "drawbox=x=60:y=345:w=680:h=100:color=black@1:t=fill,$(printf "drawtext=fontfile=%s:textfile=%s:fontsize=34:fontcolor=%s:x=(w-text_w)/2:y=372" "$FONT" "$(cap_file "$URL" "end")" "$AMBER")" \
  -af "afade=t=out:st=$((END_DUR - 2)):d=2" "${encode[@]}" "$WORK/99-end.mp4"
SEGS+=("$WORK/99-end.mp4")

# Concat filter, not the concat demuxer with -c copy: a segment's video and
# audio never come out exactly the same length, and stream-copy concatenation
# accumulates that drift into gaps and backwards timestamp jumps. Re-encoding
# through the filter lays every segment onto one continuous timeline.
inputs=()
graph=""
n=0
for seg in "${SEGS[@]}"; do
  inputs+=(-i "$seg")
  graph+="[$n:v][$n:a]"
  n=$((n + 1))
done
graph+="concat=n=$n:v=1:a=1[v][a]"
# Pin the rate: left to itself the concat filter emits 25fps against these
# 29.97fps takes, which throws away a frame in six and judders the walk.
ffmpeg -v error -y "${inputs[@]}" -filter_complex "$graph" -map "[v]" -map "[a]" \
  -r 30000/1001 "${encode[@]}" "$OUT/trailer.mp4"
printf "   %-12s %ss\n" "trailer.mp4" "$(ffprobe -v error -show_entries format=duration -of csv=p=0 "$OUT/trailer.mp4")"

echo
echo "out -> $OUT"
