#!/usr/bin/env bash
# ==============================================================================
# Export the live 'rasa' realm from Keycloak container (without users)
# Usage: bash scripts/export-realm.sh [container_name]
# ==============================================================================
set -euo pipefail

CONTAINER="${1:-sso-dev-app}"

echo "==> Exporting realm 'rasa' from container '$CONTAINER'..."
docker exec "$CONTAINER" /opt/keycloak/bin/kc.sh export \
  --file /tmp/rasa-realm-export.json \
  --realm rasa \
  --users skip

docker cp "${CONTAINER}:/tmp/rasa-realm-export.json" ./realms/rasa-realm.json
echo "==> Exported to ./realms/rasa-realm.json"
