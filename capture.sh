#!/usr/bin/env bash
# Launch finding_numbers in a borderless Chrome window at its native 800x600
# and record just that window (video + the sound you hear) to an MP4.
#
# Borderless & 1:1: Chrome --app strips all browser chrome, --window-size=800,600
# with --force-device-scale-factor=1 makes the content exactly the game canvas,
# and a unique --class lets the recorder grab it without you clicking anything.
#
# Usage: ./capture.sh [-s] [output_dir]
#   -s           start recording immediately (default: arm and wait for Enter)
#   output_dir   where the MP4 lands (default: current dir)
# Stop recording with 'q'+Enter or Ctrl-C. The game window stays open afterward.
set -uo pipefail

PORT=8000
CLASS=fnum_capture
HERE="$(cd "$(dirname "$0")" && pwd)"
RECORDER="$HERE/../utilities/window_recorder.sh"
[ -x "$RECORDER" ] || { echo "recorder not found: $RECORDER" >&2; exit 1; }

# Serve the game if nothing is already on the port (no-store: always fresh JS).
if ! lsof -ti "tcp:$PORT" -sTCP:LISTEN >/dev/null 2>&1; then
  ( cd "$HERE" && exec python3 -c '
import http.server, socketserver, sys
class H(http.server.SimpleHTTPRequestHandler):
    def end_headers(self):
        self.send_header("Cache-Control", "no-store"); super().end_headers()
socketserver.TCPServer.allow_reuse_address = True
with socketserver.TCPServer(("", int(sys.argv[1])), H) as s: s.serve_forever()
' "$PORT" ) >/dev/null 2>&1 &
  echo "capture -> started dev server on $PORT"
fi

# Borderless game window at the canvas's native resolution, tagged with a unique
# WM_CLASS so the recorder can find it. Throwaway profile keeps your real one clean.
google-chrome --app="http://localhost:$PORT" \
  --class="$CLASS" --force-device-scale-factor=1 \
  --window-size=800,600 --window-position=200,200 \
  --user-data-dir="/tmp/${CLASS}-profile" \
  --no-first-run --no-default-browser-check >/dev/null 2>&1 &

# Wait for the window to map before handing off to the recorder.
for _ in $(seq 40); do
  xdotool search --onlyvisible --class "$CLASS" >/dev/null 2>&1 && break
  sleep 0.25
done

exec "$RECORDER" -c "$CLASS" "$@"
