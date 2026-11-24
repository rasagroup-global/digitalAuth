# 🛡️ Regression Test Report: `digitalAuth` Dark Espresso UI, Google OAuth, Layout Fix & Prod/Dev CI/CD Split

**Date**: 2026-11-24  
**Author**: Antigravity AI Assistant & Engineering Team  
**Scope**: `digitalAuth` (`rasa-sso.css`, `rasa-login.js`, `messages_*.properties`, `realms/rasa-realm.json`, `.github/workflows/deploy.yml`, `_deploy-ssh.yml`), `RasaApi` & `digitalCms` CI/CD  
**Version**: `v1.1.1`  
**Status**: **APPROVED FOR GIT PUSH ✅**

---

## 1. Ringkasan Perbaikan & Pembaruan

1. **Perbaikan Layout Halaman Login Keycloak 26 PatternFly v5 (`rasa-sso.css`, `rasa-login.js`, `messages_*.properties`)**:
   - Menghilangkan padding horizontal default PatternFly `.pf-v5-c-login__container` (`6.125rem` kiri-kanan) agar card login kembali ke lebar penuh proporsional (`440px` di desktop) dan tetap fit penuh tanpa horizontal overflow di viewport mobile (`390px`, `box-sizing: border-box`).
   - Memposisikan dropdown bahasa `.pf-v5-c-login__main-header-utilities` ke kiri atas (`justify-content: flex-start`, `z-index: 2`) agar tidak bertumpuk dengan watermark roda Rasa di kanan atas.
   - Memperbaiki proporsi pemilih kode negara (`Email / +`, `+49 DE`, `+62 ID`, `+43 AT`, `+41 CH`, `+31 NL`) agar kolom input `#username` mendapat ruang fleksibel (`flex: 1 1 0%; min-width: 0;`), serta menghapus garis pemisah box `.pf-v5-c-input-group > * + *` pada field Password.
   - Mereset `position: static !important; inset: auto !important;` pada `#kc-login::after` agar panah `→` tampil sejajar di samping teks `Sign In →` (tidak menimpa teks tombol).
   - Memperbaiki Java `MessageFormat` apostrophe escaping (`noAccount=Don''t have a RASA account?`) dan menghilangkan duplikasi label sosial login (`Or continue with` tunggal terlokalisasi via `identity-provider-login-label`).
2. **Penghapusan Facebook OAuth (Fokus Google OAuth)**:
   - Menghapus Identity Provider `facebook` dari `realms/rasa-realm.json`, `.env.example`, `docker-compose.yml`, serta rule CSS `#social-facebook`.
   - Menambahkan perintah `kcadm.sh delete identity-provider/instances/facebook -r rasa || true` pada `_deploy-ssh.yml` agar instance `facebook` yang terlanjur dibuat di DB Keycloak ikut terhapus otomatis saat deploy.
3. **Pemisahan Secrets GitHub Actions `main/master` vs `qa & dev*` (`RasaApi`, `digitalCms`, `digitalAuth`)**:
   - Memecah trigger deploy via reusable workflow `_deploy-ssh.yml`:
     - `main` / `master` menggunakan prefix `PROD_*` (`PROD_DO_HOST`, `PROD_DO_SSH_KEY`, `PROD_DO_USERNAME`, `PROD_DO_PASSWORD`, `PROD_DB_USERNAME`, `PROD_DB_PASSWORD`, dst).
     - `qa`, `dev*`, `staging` tetap digabung menjadi 1 jalur (`deploy-dev`) memakai secret non-prefix yang sudah ada (`DO_HOST`, `DO_SSH_KEY`, `DO_USERNAME`, `DO_PASSWORD`, `DB_USERNAME`, `DB_PASSWORD`, dst).

---

## 2. 🛡️ Verification Checklist

- [x] **Realm JSON Validation**: `realms/rasa-realm.json` valid JSON (`realm: rasa`, `displayName: Rasa Account`, `4` Clients, IDP aktif: `['google']`).
- [x] **GitHub Actions YAML Validation**: Seluruh `deploy.yml` dan `_deploy-ssh.yml` di `digitalAuth`, `RasaApi`, dan `digitalCms` (6 file) lolos `yaml.safe_load`.
- [x] **Headless Browser Visual Verification (`chrome --headless=new`)**: Diverifikasi pada viewport Desktop (`1280×980`, `docSw === 1262`, card `440px`, input `#username` `269px`) dan Mobile (`390×844` iframe preview), tanpa elemen bertumpuk atau teks terpotong.

STATUS: **APPROVED FOR GIT PUSH ✅**
