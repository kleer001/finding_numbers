#!/usr/bin/env bash
# Launch finding_numbers in a borderless Chrome window at its native 800x600
# and record just that window (video + the sound you hear) to an MP4.
#
# Borderless & 1:1: Chrome --app strips all browser chrome, --window-size=800,600
# with --force-device-scale-factor=1 makes the content exactly the game canvas,
# and a unique --class lets the recorder grab it without you clicking anything.
#
# Naming a clip hands the game to the scripted take of the same name in
# src/demo.js and stops recording on its own; without one you play by hand and
# stop with 'q'+Enter or Ctrl-C. Either way the game window stays open after.
#
# Usage: ./capture.sh [-s] [-t SECONDS] [--seed N] [clip] [output_dir]
#   -s           start recording immediately (manual takes only; a clip always
#                starts immediately and waits for the recorder before playing)
#   -t SECONDS   override the clip's recording length
#   --seed N     pin the maze layout, so the same take can be re-shot verbatim
#   clip         one of: title core-loop wrong-turn room-moved pulse crt-decay
#                jukebox   (see video_shot_list.md)
#   output_dir   where the MP4 lands (default: current dir)
set -uo pipefail

PORT_BASE=8000
PORT_TRIES=20
CLASS=fnum_capture
GO_FILE=.demo-go
HERE="$(cd "$(dirname "$0")" && pwd)"
RECORDER="$HERE/../utilities/window_recorder.sh"
[ -x "$RECORDER" ] || { echo "recorder not found: $RECORDER" >&2; exit 1; }

# Recording length per clip: the shot list's target plus handle, so there is
# something to trim to on both ends.
clip_seconds() {
  case "$1" in
    title)      echo 10 ;;
    core-loop)  echo 20 ;;
    wrong-turn) echo 28 ;;
    room-moved) echo 55 ;;
    pulse)      echo 22 ;;
    crt-decay)  echo 24 ;;
    jukebox)    echo 35 ;;
    *)          echo "" ;;
  esac
}

START_NOW=0
DURATION=""
SEED=""
CLIP=""
OUTDIR="$PWD"
while [ $# -gt 0 ]; do
  case "$1" in
    -s|--start-now) START_NOW=1; shift ;;
    -t|--duration)  DURATION="$2"; shift 2 ;;
    --seed)         SEED="$2"; shift 2 ;;
    -*)             echo "unknown flag: $1" >&2; exit 2 ;;
    *)
      if [ -z "$CLIP" ] && [ -n "$(clip_seconds "$1")" ]; then CLIP="$1"; else OUTDIR="$1"; fi
      shift ;;
  esac
done

QUERY=""
if [ -n "$CLIP" ]; then
  [ -z "$DURATION" ] && DURATION="$(clip_seconds "$CLIP")"
  QUERY="?demo=$CLIP&go=/$GO_FILE"
  [ -n "$SEED" ] && QUERY="$QUERY&seed=$SEED"
  START_NOW=1
elif [ -n "$SEED" ]; then
  QUERY="?seed=$SEED"
fi

# A stale go-file from an earlier run would start the take before the recorder.
rm -f "$HERE/$GO_FILE"

# Clips boot from factory settings: the game persists prefs and the current
# level, so a take would otherwise inherit the last one's tint, noise dial and
# progress. Manual takes keep their profile, so a session can be resumed.
[ -n "$CLIP" ] && rm -rf "/tmp/${CLASS}-profile"

# Always serve this directory ourselves, on the first free port at or above the
# base — adopting whatever already holds 8000 would happily record another
# project's page. (no-store: always fresh JS.)
PORT=""
for p in $(seq "$PORT_BASE" $((PORT_BASE + PORT_TRIES))); do
  lsof -ti "tcp:$p" -sTCP:LISTEN >/dev/null 2>&1 || { PORT="$p"; break; }
done
[ -n "$PORT" ] || { echo "no free port in $PORT_BASE-$((PORT_BASE + PORT_TRIES))" >&2; exit 1; }
( cd "$HERE" && exec python3 -c '
import http.server, socketserver, sys
class H(http.server.SimpleHTTPRequestHandler):
    def end_headers(self):
        self.send_header("Cache-Control", "no-store"); super().end_headers()
socketserver.TCPServer.allow_reuse_address = True
with socketserver.TCPServer(("", int(sys.argv[1])), H) as s: s.serve_forever()
' "$PORT" ) >/dev/null 2>&1 &
SERVER=$!
echo "capture -> serving $HERE on $PORT"

# Borderless game window at the canvas's native resolution, tagged with a unique
# WM_CLASS so the recorder can find it. Throwaway profile keeps your real one
# clean. A scripted take's synthetic keys can't satisfy Chrome's autoplay gate,
# so the station would record silent without the policy override.
google-chrome --app="http://localhost:$PORT/$QUERY" \
  --class="$CLASS" --force-device-scale-factor=1 \
  --autoplay-policy=no-user-gesture-required \
  --window-size=800,600 --window-position=200,200 \
  --user-data-dir="/tmp/${CLASS}-profile" \
  --no-first-run --no-default-browser-check >/dev/null 2>&1 &

# Wait for the window to map before handing off to the recorder.
for _ in $(seq 40); do
  xdotool search --onlyvisible --class "$CLASS" >/dev/null 2>&1 && break
  sleep 0.25
done

# Raise it to the top and keep it there. The recorder grabs a screen *region*,
# not the window's own pixels, so anything that drifts over that rectangle —
# a terminal, an editor — is recorded instead of the game, and the take looks
# fine until you play it back.
GAME_WID="$(xdotool search --onlyvisible --class "$CLASS" | tail -1)"
if [ -n "$GAME_WID" ]; then
  xdotool windowraise "$GAME_WID"
  xdotool windowactivate "$GAME_WID" 2>/dev/null
  sleep 0.5
fi

REC_ARGS=(-c "$CLASS")
[ "$START_NOW" -eq 1 ] && REC_ARGS+=(-s)
[ -n "$DURATION" ] && REC_ARGS+=(-t "$DURATION")

# A manual take is a session: the window and its server stay up afterwards so
# you can keep playing, and a dead server would trip the lost-connection overlay.
if [ -z "$CLIP" ]; then
  exec "$RECORDER" "${REC_ARGS[@]}" "$OUTDIR"
fi

# Scripted take: the page is parked on the go-file poll, so start the recorder
# first and only then release it. Both ends are covered by the clip's handle.
"$RECORDER" "${REC_ARGS[@]}" "$OUTDIR" &
REC=$!
sleep 1.5
: > "$HERE/$GO_FILE"
echo "capture -> released clip '$CLIP' (${DURATION}s)"
wait "$REC"
rm -f "$HERE/$GO_FILE"

# A clip has nobody sitting at it, so it tears down its own window and server.
# Left up, they would be found first by the next clip's window lookup and port
# scan, and a run of several takes would record the wrong window.
pkill -f "user-data-dir=/tmp/${CLASS}-profile"
kill "$SERVER" 2>/dev/null
