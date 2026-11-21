# digitalAuth — Rasa Group Centralized Keycloak SSO Service

Centralized Single Sign-On (SSO) & OpenID Connect (OIDC) Identity Provider powered by **Keycloak 26** for all Rasa Group applications.

## Pilot Connected Applications
1. **`RasaApi` (`digitalApi`)** — Central Backend API & Single Source of Truth Synchronizer (`client_id: rasa-api`).
2. **`digitalCms`** — Admin, POS Cashier & Kitchen Web Portal (`client_id: rasa-cms`).
3. **`digitalCommerce`** — WordPress + WooCommerce B2C/B2B Storefront (`client_id: rasa-commerce`).

---

## Domains & Endpoints

| Environment | Base URL | OIDC Discovery Endpoint |
| :--- | :--- | :--- |
| **Local Dev** | `http://localhost:8081` | `http://localhost:8081/realms/rasa/.well-known/openid-configuration` |
| **Development** | `https://sso-dev.rasagroup.global` | `https://sso-dev.rasagroup.global/realms/rasa/.well-known/openid-configuration` |
| **Production** | `https://sso.rasagroup.global` | `https://sso.rasagroup.global/realms/rasa/.well-known/openid-configuration` |

---

## Quick Start (Local Development)

1. Copy `.env.example` to `.env`:
   ```bash
   cp .env.example .env
   ```
2. Start Keycloak and local PostgreSQL:
   ```bash
   docker compose -f docker-compose.yml -f docker-compose.local.yml up -d
   ```
3. Open the Keycloak Admin Console at `http://localhost:8081/admin` and sign in with `KC_BOOTSTRAP_ADMIN_USERNAME` / `KC_BOOTSTRAP_ADMIN_PASSWORD`.
4. The **`rasa`** realm, custom **`rasa-kopi`** login theme, roles (`super-admin`, `admin`, `cashier`, `kitchen`, `barista`, `b2b_customer`, `customer`, `user`), and clients (`rasa-api`, `rasa-cms`, `rasa-commerce`, `rasa-mobile`) are automatically imported from `realms/rasa-realm.json`.

---

## Single Source of Truth Synchronization Architecture

- **Identity Binding (`tm_user_metas`)**: `RasaApi` stores each user's Keycloak Subject UUID in `tm_user_metas` under `meta_key = "keycloak_id"` (also backwards-compatible with `"keyloack_id"`).
- **Bidirectional Sync**:
  - Any registration, password update, email/phone change, role assignment, or direct login in `RasaApi`, `digitalCms`, or `digitalCommerce` automatically syncs to Keycloak via the `rasa-api` service account.
  - Any login or registration initiated via the **Login with Rasa SSO** screen on Keycloak automatically provisions or updates the user in `RasaApi` (including wallet code, loyalty points/levels, and roles) and in WooCommerce (including `b2b_customer` net-price tax exemption role).
- **Bulk Sync Existing Users**:
  Run from `RasaApi`:
  ```bash
  php artisan keycloak:sync-users
  ```
