#!/usr/bin/env bash
# ==============================================================================
# Ensure dedicated PostgreSQL database exists in `api-shared-db` for Keycloak
# Usage: bash scripts/init-keycloak-db.sh [keycloak_db_name] [db_user]
# ==============================================================================
set -euo pipefail

DB_CONTAINER="${DB_CONTAINER:-api-shared-db}"
KC_DB_NAME="${1:-keycloak_db}"
KC_DB_USER="${2:-postgres}"

echo "==> Checking database '$KC_DB_NAME' on container '$DB_CONTAINER'..."

if ! docker ps --format '{{.Names}}' | grep -q "^${DB_CONTAINER}$"; then
    echo "WARNING: Container '$DB_CONTAINER' not running on this host. Skipping DB creation."
    exit 0
fi

DB_EXISTS=$(docker exec -i "$DB_CONTAINER" psql -U "$KC_DB_USER" -d postgres -tAc "SELECT 1 FROM pg_database WHERE datname='${KC_DB_NAME}'" || echo "")

if [ "$DB_EXISTS" != "1" ]; then
    echo "==> Creating database '$KC_DB_NAME'..."
    docker exec -i "$DB_CONTAINER" psql -U "$KC_DB_USER" -d postgres -c "CREATE DATABASE \"${KC_DB_NAME}\" OWNER \"${KC_DB_USER}\";"
    echo "==> Database '$KC_DB_NAME' created successfully."
else
    echo "==> Database '$KC_DB_NAME' already exists."
fi
