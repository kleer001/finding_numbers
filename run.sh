#!/usr/bin/env bash
# Local no-cache dev server. Usage: ./run.sh [port]   (default 8000)
# python's http.server sends no Cache-Control, so browsers serve STALE JS on
# reload; force no-store so every reload re-fetches during development.
set -euo pipefail
cd "$(dirname "$0")"
PORT="${1:-8000}"
exec python3 -c '
import http.server, socketserver, sys
class H(http.server.SimpleHTTPRequestHandler):
    def end_headers(self):
        self.send_header("Cache-Control", "no-store, must-revalidate")
        self.send_header("Pragma", "no-cache")
        super().end_headers()
socketserver.TCPServer.allow_reuse_address = True
with socketserver.TCPServer(("", int(sys.argv[1])), H) as s:
    print(f"finding_numbers -> http://localhost:{sys.argv[1]}  (Ctrl-C to stop)")
    s.serve_forever()
' "$PORT"
