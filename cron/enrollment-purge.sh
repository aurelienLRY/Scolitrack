#!/usr/bin/env bash
# Alternative shell (curl) si Node n'est pas disponible dans le cron cPanel.
# Usage : bash /chemin/vers/Scolitrack/cron/enrollment-purge.sh
#
# Prérequis : cron/config.env renseigné (APP_URL + CRON_SECRET).

set -euo pipefail
DIR="$(cd "$(dirname "$0")" && pwd)"
CONFIG="$DIR/config.env"

if [[ ! -f "$CONFIG" ]]; then
  echo "[enrollment-purge] Fichier manquant: $CONFIG" >&2
  echo "Copiez config.env.exemple vers config.env et renseignez les valeurs." >&2
  exit 1
fi

# shellcheck disable=SC1090
set -a
# shellcheck source=/dev/null
source "$CONFIG"
set +a

APP_URL="${APP_URL%/}"
if [[ -z "${APP_URL:-}" || -z "${CRON_SECRET:-}" ]]; then
  echo "[enrollment-purge] APP_URL et CRON_SECRET sont obligatoires dans config.env" >&2
  exit 1
fi

curl -fsS \
  -H "Authorization: Bearer ${CRON_SECRET}" \
  -H "Accept: application/json" \
  -H "User-Agent: Scolitrack-cPanel-Cron/1.0" \
  --max-time 60 \
  "${APP_URL}/api/cron/enrollment-purge"

echo
