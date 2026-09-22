#!/bin/sh
set -e
cd /app
python -m uvicorn server:app --host 127.0.0.1 --port 8000 &
exec nginx -g "daemon off;"
