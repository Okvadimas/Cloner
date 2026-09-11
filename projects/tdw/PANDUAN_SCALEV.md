# Panduan Lengkap Penggunaan & Kustomisasi Landing Page Scalev

Landing page ini dibuat dalam **1 file mandiri (`index.html`)** yang memadukan HTML, CSS visual modern, dan JavaScript interaktif. Dirancang agar ringan, mudah dipahami, terstruktur rapi dengan komentar penjelas, serta 100% kompatibel dengan platform **Scalev**.

---

## 1. Cara Melihat & Menguji Secara Lokal (Offline)
Anda tidak perlu menyalakan server khusus untuk melihat tampilannya:
1. Buka File Explorer di komputer Anda.
2. Masuk ke folder: `c:\laragon\www\Landing Page\TDW\`.
3. Klik ganda pada file [index.html](file:///c:/laragon/www/Landing%20Page/TDW/index.html) (akan langsung terbuka di Google Chrome, Edge, atau browser default Anda).
4. Atau jika Laragon aktif, Anda bisa mengaksesnya via URL: `http://localhost/Landing%20Page/TDW/index.html`.

---

## 2. Cara Memasang ke Platform Scalev

Di Scalev, ada 2 cara yang paling umum dan mudah:

### Cara 1: Menggunakan "HTML Mode" di Scalev (Paling Direkomendasikan)
1. Buka dashboard **Scalev** Anda -> masuk ke menu **Pages** (Halaman).
2. Buat halaman baru atau edit halaman yang sudah ada.
3. Pada editor halaman Scalev, aktifkan mode **HTML Mode** / **Custom Code**.
4. Buka file [index.html](file:///c:/laragon/www/Landing%20Page/TDW/index.html) menggunakan text editor (seperti VS Code, Notepad++, atau IDE ini).
5. Salin (**Select All / Ctrl+A**, lalu **Ctrl+C**) seluruh isi kode dari file `index.html`.
6. Tempelkan (**Ctrl+V**) ke editor HTML Scalev.
7. Simpan (*Save*) dan Publikasikan (*Publish*).

### Cara 2: Menggunakan Elemen "Custom HTML" di Builder Scalev
Jika Anda menggunakan visual drag-and-drop builder Scalev:
1. Tambahkan blok/elemen **Custom HTML** selebar penuh (*full width*).
2. Salin seluruh isi file [index.html](file:///c:/laragon/www/Landing%20Page/TDW/index.html) dan tempel ke dalam blok tersebut.

---

## 3. Titik Penting untuk Dimodifikasi

Semua bagian penting telah ditandai dengan komentar yang jelas di dalam [index.html](file:///c:/laragon/www/Landing%20Page/TDW/index.html). Gunakan fitur pencarian teks (**Ctrl + F**) pada editor Anda untuk menemukan kata kunci berikut:

### A. Mengganti Link Checkout (Tombol Pendaftaran)
Cari teks berikut dengan **Ctrl + F**:
```html
https://tokoanda.myscalev.com/checkout-anda
```
Ganti URL tersebut dengan tautan checkout produk Scalev Anda sendiri (ada 6 tombol CTA yang tersebar di halaman).

> [!TIP]
> Di VS Code atau IDE ini, gunakan fitur **Find and Replace** (**Ctrl + H**) untuk mengganti semua 6 tautan sekaligus dalam 1 detik.

---

### B. Mengatur Tanggal Target Countdown Timer
Buka bagian paling bawah dari file [index.html](file:///c:/laragon/www/Landing%20Page/TDW/index.html) di dalam tag `<script>`:
```javascript
// Ganti tanggal target di bawah ini sesuai jadwal webinar / promo Anda!
// Format ISO: 'YYYY-MM-DDTHH:mm:ss+07:00' (WIB)
var TARGET_COUNTDOWN_DATE = new Date('2026-09-25T14:00:00+07:00').getTime();
```
- Contoh jika promo berakhir tanggal **31 Desember 2026 jam 23:59 WIB**, ubah menjadi:
  ```javascript
  var TARGET_COUNTDOWN_DATE = new Date('2026-12-31T23:59:59+07:00').getTime();
  ```
- Timer ini sudah dilengkapi sistem proteksi: jika waktu target telah lewat, angka timer tidak akan minus melainkan otomatis berhenti di `00 Hari 00 Jam 00 Menit 00 Detik`.

---

### C. Mengganti Video YouTube
Halaman ini menggunakan teknik *Click-to-Load YouTube Facade* yang sangat cepat diakses dari HP. Cari elemen dengan atribut `data-yt`:
```html
<div class="video-embed vertical branded spotlight" data-yt="HFOCojUzGgI" ...>
```
Cukup ganti ID video `HFOCojUzGgI` dengan ID video YouTube Anda sendiri (ID adalah karakter setelah `v=` atau setelah `youtu.be/`).

---

### D. Mengganti Gambar & Banner
Seluruh gambar saat ini menggunakan tautan langsung dari CDN Scalev resmi agar langsung muncul tajam tanpa perlu repot upload di awal.
- Jika ingin mengganti gambar dengan produk Anda sendiri, cukup ganti nilai atribut `src="..."` pada tag `<img>` terkait.
- Anda dapat mengunggah gambar baru ke menu **Media Library** di Scalev, lalu salin URL gambar tersebut dan tempel ke atribut `src`.

---

### E. Mengubah Judul & Harga Penawaran
Cari komentar:
```html
<!-- ========================================================= -->
<!-- 14. PENAWARAN HARGA / PRICING TABLE                       -->
<!-- ========================================================= -->
```
Di bagian ini Anda bisa mengubah:
- Harga normal: `<s>Rp 9.347.000</s>`
- Harga spesial: `<s>Rp 5.800.000</s>`
- Harga flash sale: `<div class="pfinal">168.000</div>`
- Harga per hari: `Hanya Rp 56.000,- / Hari`

---

## 4. Struktur Bagian Halaman (Section Map)

| No | Nama Section di Kode | Deskripsi |
|---|---|---|
| 1 | `1. TOP STICKY COUNTDOWN BAR` | Bar hitam & kuning di atas layar yang selalu menempel saat di-scroll |
| 2 | `2. HERO SECTION` | Headline utama, cuplikan benefit, tombol CTA utama, dan video pembuka |
| 3 | `3. REVIEW PRESIDEN RI KE-6 SBY` | Kotak review resmi Presiden Susilo Bambang Yudhoyono |
| 4 | `4. TESTIMONI TOKOH (INI KATA MEREKA)` | Ulasan dari Hermawan Kartajaya, Alex P. Chandra, dan Jay Abraham |
| 5 | `5. PILIH MASA DEPAN` | Tabel perbandingan kontras: Tanpa ilmu vs Dengan ilmu finansial |
| 6 | `6. VIDEO TESTIMONI BONG CHANDRA` | Video kisah sukses murid TDW membangun Triniti Land |
| 7 | `7. JADWAL & AGENDA DETAIL WEBINAR 3 HARI` | Rincian materi lengkap Hari 1, Hari 2, dan Hari 3 |
| 8 | `8. TESTIMONI BATCH 2` | Bukti sukses dokter Ita Lestari (FDC Dental) |
| 9 | `9. TENTANG SPEAKER (TUNG DESEM WARINGIN)` | Profil mentor, rekor MURI, dan kredensial internasional |
| 10 | `10. TESTIMONI BATCH 3` | Kisah sukses Hendy Setiono (Kebab Baba Rafi) |
| 11 | `11. VALUE STACK` | Rincian total nilai materi & toolkit yang didapat peserta |
| 12 | `12. BONUS EKSKLUSIF DAFTAR CEPAT` | 5 bonus spesial (iPhone 17, Lunch TDW, Rolls Royce test drive, dll) |
| 13 | `13. BELAJAR DARI YANG TERBAIK` | Banner visual gelap untuk penguat kredibilitas |
| 14 | `14. PENAWARAN HARGA / PRICING TABLE` | Kartu harga diskon flash sale dan tombol order |
| 15 | `15. SAATNYA GILIRAN ANDA` | Ajakan bertindak penutup |
| 16 | `16. PROGRAM INI COCOK UNTUK SIAPA` | Kriteria target audiens yang wajib ikut |
| 17 | `17. DUA TIPE ORANG` | Penegasan psikologis konversi |
| 18 | `18. STICKY MOBILE BOTTOM CTA` | Tombol CTA melayang di bawah layar khusus perangkat handphone |

---

## 5. Pertanyaan Umum (Troubleshooting)

- **Apakah halaman ini berat saat dibuka di HP?**
  Tidak. Seluruh video YouTube tidak memuat script berat Google di awal, melainkan hanya thumbnail ringan. Video hanya di-load saat tombol play diklik oleh pengunjung.
- **Apakah saya perlu menginstal Bootstrap atau Tailwind?**
  Tidak perlu. Semua CSS sudah *vanilla* murni di dalam tag `<style>`, sehingga tidak ada dependensi eksternal yang bisa rusak atau bentrok dengan sistem Scalev.
- **Bagaimana cara menambahkan Facebook Pixel / TikTok Pixel?**
  Anda cukup memasukkan Pixel ID di menu pengaturan **Pixels / Analytics** bawaan Scalev, tanpa perlu mengotori file HTML ini.
