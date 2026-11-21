# 🗺️ Architecture & E2E Flow Baseline Documentation: `digitalAuth` (Rasa Centralized Keycloak SSO)

> **Dokumentasi Baseline Arsitektur, Alur Bisnis Kritis, dan Kontrak OIDC SSO**
> Diterbitkan secara otomatis oleh **Workspace QA & Regression Guard**
> Tanggal: 22 November 2026
> Lingkup Workspace: `digitalAuth` (Keycloak 26 SSO), `RasaApi` (`digitalApi`), `digitalCms`, dan `digitalCommerce` (WooCommerce)

---

## 1. Ringkasan Eksekutif & Arsitektur Sistem

**`digitalAuth`** adalah pusat autentikasi (*Centralized Identity Provider & Single Sign-On*) berbasis **Keycloak 26** untuk seluruh ekosistem aplikasi **Rasa Group**. Pilot ini menghubungkan tiga sistem utama dengan prinsip **100% Single Source of Truth (SSOT)**:

| Service | Repository / Direktori | Domain (Dev / Prod) | Peran dalam Arsitektur SSO |
| :--- | :--- | :--- | :--- |
| **`digitalAuth`** | `d:\WORKS\RASAKOPI\DIGITAL\SOURCECODE\digitalAuth` | `sso-dev.rasagroup.global`<br>`sso.rasagroup.global` | OIDC Identity Provider (Realm `rasa`), manajemen sesi SSO/SLO global, penerbit RS256 Access/ID Token, dan penyedia halaman login bertema Rasa Kopi. |
| **`RasaApi`** (`digitalApi`) | `d:\WORKS\RASAKOPI\DIGITAL\SOURCECODE\RasaApi` | `api-dev.rasagroup.global`<br>`api.rasagroup.global` | Core Backend API & **SSOT Synchronizer**. Memverifikasi token RS256 Keycloak maupun HS256 JWT lokal, menyimpan `keycloak_id` (`keyloack_id`) di `tm_user_metas`, dan menyinkronkan setiap mutasi user/role/password ke Keycloak. |
| **`digitalCms`** | `d:\WORKS\RASAKOPI\DIGITAL\SOURCECODE\digitalCms` | `cms-dev.rasagroup.global`<br>`cms.rasagroup.global` | Portal Operasional (Admin, Cashier POS, Kitchen/Barista). Menggunakan OIDC Authorization Code + PKCE (`client_id: rasa-cms`) dan Single Logout (SLO). |
| **`digitalCommerce`** | `d:\WORKS\RASAKOPI\DIGITAL\COMMERCE\WOO\digitalCommerce` | `shop-dev.rasakopi.coffee`<br>`shop.rasakopi.coffee` | Storefront WordPress + WooCommerce (B2C & B2B). Menggunakan OIDC + PKCE (`client_id: rasa-commerce`), sinkronisasi role `b2b_customer` (harga Net `excl. MwSt.`), serta sinkronisasi dua arah dengan `RasaApi`. |

---

## 2. Alur Kritis (Critical Core Flows)

### Alur 1: Login via Rasa SSO (OIDC Authorization Code + PKCE)
```text
User klik "Login with Rasa SSO" (di digitalCms atau digitalCommerce)
  │
  ├──> 1. Client membuat `state` + `code_verifier` & `code_challenge` (S256 PKCE)
  ├──> 2. Redirect ke `https://sso-dev.rasagroup.global/realms/rasa/protocol/openid-connect/auth`
  ├──> 3. User autentikasi di halaman Keycloak (Theme: `rasa-kopi`)
  ├──> 4. Keycloak redirect ke Callback URL membawa `code` & `state`
  ├──> 5. Client menukar `code` melalui `POST /api/v1/auth/keycloak/exchange` di `RasaApi`
  │       ├──> `RasaApi` menukar `code` ke Keycloak Token Endpoint
  │       ├──> `RasaApi` memverifikasi RS256 JWT via cached JWKS
  │       ├──> `RasaApi` melakukan JIT User Resolution / Provisioning & mengikat `keycloak_id` (`keyloack_id`) di `tm_user_metas`
  │       └──> `RasaApi` mengembalikan profil lengkap (`user`, `roles`, `permissions`, `company`, `warehouses`, `saldo_wallet`) + token
  └──> 6. Client membuat sesi lokal & mengarahkan user sesuai role:
          - `digitalCms`: `cashier` -> `/cashier`, `kitchen`/`barista` -> `/kitchen`, Admin -> `/dashboard`
          - `digitalCommerce`: `b2b_customer` -> harga Net `excl. MwSt.` aktif, redirect ke `/my-account/`
```

### Alur 2: Jaminan 100% Single Source of Truth (Form Login / Register / Update Biasa)
```text
Mutasi User dari aplikasi mana pun (Form Login Biasa, Register, OTP Reset Password, CMS User CRUD, WooCommerce Register/Login)
  │
  ├──> `RasaApi` memanggil `KeycloakService::syncUserToKeycloak($user, $plainPassword)`
  ├──> Menggunakan Service Account `rasa-api` (`client_credentials`) ke Keycloak Admin REST API
  ├──> Membuat atau mengupdate user di Keycloak Realm `rasa`:
  │     - Credentials (password)
  │     - Status (`enabled` = `status == 1`)
  │     - Realm Roles (`super-admin`, `admin`, `cashier`, `kitchen`, `barista`, `b2b_customer`, `customer`, `user`)
  │     - Custom Attributes (`rasa_uuid`, `company_id`, `phone`, `wallet_code`, `user_code`, `b2b_vat_id`)
  └──> Menyimpan UUID Keycloak ke `tm_user_metas` (`meta_key = keycloak_id` & `keyloack_id`)
```

### Alur 3: Dual-Token API Authorization di `RasaApi`
```text
Request masuk ke `RasaApi` dengan header `Authorization: Bearer <token>`
  │
  ├──> Middleware `ResolveKeycloakBearerToken` memeriksa header JWT:
  │     ├──> Jika `alg === RS256` & `iss` adalah Realm `rasa`:
  │     │     - Verifikasi signature dengan cached JWKS Keycloak
  │     │     - Resolve user dari `tm_user_metas` (`keycloak_id` / `keyloack_id`) atau email
  │     │     - Set `Auth::guard('api')->setUser($user)`
  │     └──> Jika `alg === HS256`:
  │           - Lanjut ke guard `tymon/jwt-auth` standar
  └──> 100% backward-compatible untuk Mobile App, CMS, maupun WooCommerce.
```
