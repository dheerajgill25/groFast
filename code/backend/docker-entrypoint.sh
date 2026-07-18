#!/bin/sh
# Selects which process this container runs. One image, three roles (02b §3).
#   GROFAST_PROCESS=core     -> the HTTP API           (default)
#   GROFAST_PROCESS=realtime -> the WebSocket gateway
#   GROFAST_PROCESS=worker   -> the Redpanda consumers
set -eu

role="${GROFAST_PROCESS:-core}"

case "$role" in
  core)     exec node dist/main.js ;;
  realtime) exec node dist/main.realtime.js ;;
  worker)   exec node dist/main.worker.js ;;
  *)
    echo "unknown GROFAST_PROCESS='$role' (want: core|realtime|worker)" >&2
    exit 1
    ;;
esac
