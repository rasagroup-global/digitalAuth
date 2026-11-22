# 🛡️ Regression Test Report: `digitalAuth` Official Dark Espresso UI, Phone Auth & Google/Facebook OAuth

**Date**: 2026-11-22  
**Author**: Antigravity AI Assistant & Engineering Team  
**Scope**: `digitalAuth` (Keycloak 26 Custom Theme `rasa-kopi`, `rasa-login.js`, `rasa-sso.css`, `realms/rasa-realm.json`, `.github/workflows/deploy.yml`)  
**Version**: `v1.1.0`  
**Status**: **APPROVED FOR PRODUCTION / GIT PUSH ✅**

---

## 1. Ringkasan Pembaruan & Hardening

1. **Desain UI Resmi Rasa Account (`Welcome to RASA`)**:
   - Mengimplementasikan tema Dark Espresso (`#181311` $\rightarrow$ `#120e0d`) dengan watermark Emblem Roda Rose Gold (`favicon.png`) di pojok kanan atas card dan logo grafik Rasa Kopi (`logo.png`) di header.
   - Menampilkan heading **`Welcome to RASA`** + subtitle **`Login or Register your RASA account.`**.
   - Input minimalis bergaris bawah (*bottom-bordered*) dilengkapi pemilih kode negara (`+49`, `+62`, `+43`, `+41`, `+31`, atau `Email / Tel`) di `themes/rasa-kopi/login/resources/js/rasa-login.js` yang otomatis menormalisasi nomor telepon saat form di-submit.
   - Tombol submit berbentuk kapsul/pill Rose Gold (`→`) dan legal footer (*Terms of Services & Privacy Policy*).
   - 100% Mobile-Friendly (`font-size: 16px` anti iOS auto-zoom, touch target `48px`–`54px`, responsive safe-area padding).
2. **Social Login Bulat (`Or continue with` Google & Facebook OAuth)**:
   - Menambahkan konfigurasi Identity Provider **Google** (`alias: google`) dan **Facebook** (`alias: facebook`) di `realms/rasa-realm.json` serta auto-provisioning via `kcadm.sh` di `.github/workflows/deploy.yml`.
   - Merender tombol bulat `54x54px` (`#322d2b`) dengan SVG resmi Google 4-warna dan Facebook biru (`#1877F2`).
3. **Infrastruktur & CI/CD Hardening**:
   - Dynamic DNS Resolver Nginx (`resolver 127.0.0.11 valid=10s ipv6=off;` + `set \$backend http://$CONTAINER_NAME:8080;`) untuk mencegah `502 Bad Gateway` saat container Keycloak restart.
   - Auto-sync client secrets (`rasa-api`, `rasa-cms`, `rasa-commerce`), display name realm (`Rasa Account`), dan permission `realm-management` untuk `service-account-rasa-api`.

---

## 2. 🛡️ Pre-Push Regression Sign-off Report

- [x] **Realm JSON Validation**: `realms/rasa-realm.json` tervalidasi (`realm: rasa`, `displayName: Rasa Account`, 4 Clients, 2 Identity Providers: `google` & `facebook`).
- [x] **Theme Assets & Localization**: `theme.properties`, `rasa-sso.css`, `rasa-login.js`, `logo.png`, `favicon.png`, `favicon.ico`, serta `messages_en.properties`, `messages_de.properties`, `messages_id.properties` lengkap dan menggunakan line-ending `LF`.
- [x] **Mobile Responsiveness**: Diverifikasi untuk viewport desktop, tablet, `<640px`, dan `<360px`.
- [x] **CI/CD Workflow**: `.github/workflows/deploy.yml` bebas dari syntax/escaping issue.

STATUS: **APPROVED FOR GIT PUSH ✅**
