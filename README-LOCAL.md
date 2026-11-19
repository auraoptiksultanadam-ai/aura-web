# AURA WEB CONTROL CENTER — Local First

Dashboard pengelolaan website Aura Optikal. Seluruh proses edit berjalan di komputer sendiri, tanpa database cloud, API key, atau biaya hosting.

## Cara menjalankan (Windows)
1. Pastikan Node.js versi 18 atau lebih baru sudah terpasang.
2. Ekstrak / buka folder proyek ini.
3. Klik dua kali MULAI-CONTROL-CENTER.bat.
4. Dashboard: http://127.0.0.1:3000/admin/
5. Preview website: http://127.0.0.1:3000/

Jika BAT tidak berjalan, buka Command Prompt pada folder proyek lalu jalankan: node server.js

## Cara mengedit
- Edit teks melalui formulir atau aktifkan Mode Visual lalu klik teks pada preview.
- Klik Simpan Draft agar tersimpan di content/local-draft.json.
- Klik Kembalikan Awal untuk membuang draft lokal.

## Keamanan dan batasan
- Server hanya bind ke 127.0.0.1, bukan jaringan publik.
- Tidak ada login karena server hanya lokal. Jangan ubah HOST menjadi 0.0.0.0.
- Draft lokal diabaikan Git dan tidak masuk publikasi.
- Versi awal ini mendukung editor teks visual + formulir. Upload gambar dan katalog produk akan menjadi tahap berikutnya.
- Website online tidak berubah sampai publikasi dilakukan terpisah.
