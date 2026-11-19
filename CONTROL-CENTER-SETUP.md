# AURA WEB CONTROL CENTER

Dashboard admin untuk mengelola konten website Aura Optikal melalui browser.

## Struktur
- `admin/index.html`: antarmuka dashboard.
- `worker/src/index.js`: API Worker dengan sesi admin dan publikasi GitHub.
- `worker/wrangler.toml`: konfigurasi Cloudflare Worker.
- `content/site.json`: konten website yang dapat dikelola.

## Setup Cloudflare Worker
1. Buat Worker baru bernama `aura-web-control-api`.
2. Deploy isi `worker/src/index.js` menggunakan Wrangler.
3. Set secrets:
   - `GITHUB_TOKEN`: fine-grained token untuk repo ini, izin Contents: Read and write.
   - `ADMIN_PASSWORD`: password admin yang kuat.
   - `SESSION_SECRET`: random secret minimal 32 karakter.
4. Pasang Worker pada route yang sama-origin dengan dashboard, misalnya `/api/*`, atau ubah konstanta API di dashboard ke URL Worker dan konfigurasi CORS dengan origin dashboard yang spesifik.
5. Sajikan `admin/index.html` sebagai halaman `/admin/` di Cloudflare Pages.

## Penting
- Jangan pernah menaruh GitHub token di HTML atau JavaScript browser.
- Dashboard ini adalah MVP pengelolaan konten; visual drag-and-drop, upload media, katalog produk CRUD, dan draft staging masih perlu tahap lanjutan.
- API menyimpan perubahan melalui commit ke branch `main`; aktifkan backup/branch protection sebelum penggunaan produksi.
