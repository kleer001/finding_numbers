#!/usr/bin/env python3
"""Serve this directory on the first free port from 8300 upward."""

import functools
import http.server
import socket
import socketserver
from pathlib import Path

START_PORT = 8300
HERE = Path(__file__).resolve().parent


def first_free_port(start):
    with socket.socket() as probe:
        for port in range(start, start + 50):
            if probe.connect_ex(("127.0.0.1", port)) != 0:
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
with socketserver.TCPServer(("127.0.0.1", port), handler) as httpd:
    print(f"http://127.0.0.1:{port}/copy-review.html")
    httpd.serve_forever()
