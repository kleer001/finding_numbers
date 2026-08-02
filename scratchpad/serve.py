#!/usr/bin/env python3
"""Serve this directory on the first free port from 8300 upward."""

import functools
import http.server
import socket
from pathlib import Path

START_PORT = 8300
HERE = Path(__file__).resolve().parent


def first_free_port(start):
    """Bind-test each port. A fresh socket per attempt: connect_ex on a reused
    socket returns stale results after the first call."""
    for port in range(start, start + 50):
        with socket.socket() as probe:
            probe.setsockopt(socket.SOL_SOCKET, socket.SO_REUSEADDR, 1)
            try:
                probe.bind(("127.0.0.1", port))
            except OSError:
                continue
            return port
    raise SystemExit(f"no free port in {start}-{start + 49}")


class NoCacheHandler(http.server.SimpleHTTPRequestHandler):
    def end_headers(self):
        self.send_header("Cache-Control", "no-store")
        super().end_headers()


port = first_free_port(START_PORT)
if port != START_PORT:
    print(f"port {START_PORT} taken, using {port}")

handler = functools.partial(NoCacheHandler, directory=str(HERE))
# Threading: a browser holding a keep-alive connection blocks a single-threaded server.
with http.server.ThreadingHTTPServer(("127.0.0.1", port), handler) as httpd:
    print(f"http://127.0.0.1:{port}/copy-review.html")
    httpd.serve_forever()
