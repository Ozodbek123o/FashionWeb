#!/usr/bin/env bash

set -euo pipefail

DEPLOY_ROOT="${1:-$(pwd)}"

cd "$DEPLOY_ROOT"

echo "[deploy] Starting production deployment in $DEPLOY_ROOT"

docker compose -f docker-compose.prod.yml up --build -d --remove-orphans

echo "[deploy] Waiting for services to become ready..."
sleep 10

curl -fsS http://localhost/api/health
curl -fsS http://localhost/ >/dev/null

echo "[deploy] Production deployment completed successfully"
