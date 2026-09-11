# Panduan Kustomisasi & Pemasangan Scalev (RajaSaham-V2)

Landing page ini dirancang **100% standalone (single file HTML + CSS + JS inline)**, sehingga langsung siap digunakan di server lokal maupun disalin langsung ke platform **Scalev**.

---

## Ringkasan Projek
- **Nama Projek**: RajaSaham-V2
- **Direktori**: `projects/RajaSaham-V2/`
- **File Utama**: `index.html`
- **Link Checkout 1 Bulan**: `https://raja-saham.myr.id/m/1-bulan-59481`
- **Link Checkout 3 Bulan (Kuartal - Hero)**: `https://raja-saham.myr.id/m/3-bulan-74724`

---

## Fitur & Pembaharuan Utama pada V2
1. **Desain Editorial Premium**: Arsitektur layout ala **Webinar** dengan tipografi bertenaga (*Archivo 900* untuk display dan *Plus Jakarta Sans* untuk body text).
2. **Identitas Warna Raja Saham**: Deep Obsidian (`#060912`), Electric Cyan/Ocean Blue (`#0ea5e9`), dan Emerald Profit Green (`#10b981`).
3. **Timeline AI Bergaya Stockwise Academy**: Alur kerja AI 4 tahap (Data Ingestion → Quantitative Engine → Strategy & Anti-Gorengan → Delivery & Auto-Audit) disusun dalam format **Zig-Zag Alternating Grid** dengan live mockups/terminal visual.
4. **Pembersihan Konten**:
   - Bagian *Track Record* tabel lama telah **dihapus**.
   - Bagian *Broker Compatibility* telah **dihapus**.
5. **The Ultimate Value Stack**: Rincian apa saja yang didapatkan trader (Akses Dashboard, Sinyal Harian, Rationale Analisis, Auto-Audit Bot, Filter Anti-Gorengan) + 3 Bonus Spesial + Kalkulasi Total Valuasi Nilai Riil (Rp 17.850.000+).
6. **Pricing 2 Kotak Berdampingan (Kanan - Kiri)**:
   - **Kiri**: Paket 1 Bulan (Rp 299.000)
   - **Kanan (Featured Hero)**: Paket Kuartal 3 Bulan (Rp 850.000) dengan badge *"Paling Hemat & Populer"*, perbandingan hemat per hari, dan prioritas akses Discord VIP.
7. **Fitur Interaktif**:
   - Floating live sales notification popup (notifikasi pembeli real-time).
   - Real-time countdown timer diskon kuartal.
   - Smooth FAQ accordion.

---

## Cara Pasang ke Scalev
1. Buka dashboard **Scalev** -> Masuk ke menu **Pages** (Halaman).
2. Buat halaman baru atau pilih halaman yang ingin diperbarui.
3. Alihkan ke mode **HTML Code** / **Custom Code**.
4. Buka file `index.html`, salin seluruh kodenya (**Ctrl + A**, lalu **Ctrl + C**).
5. Tempel (**Ctrl + V**) ke dalam editor Scalev, lalu klik **Save & Publish**.

---

## Titik Kustomisasi Penting
1. **Mengubah Link Checkout**:
   Gunakan fitur pencarian (**Ctrl + F**) di dalam file `index.html`:
   - Cari: `https://raja-saham.myr.id/m/1-bulan-59481` (Ganti dengan link checkout 1 bulan Anda)
   - Cari: `https://raja-saham.myr.id/m/3-bulan-74724` (Ganti dengan link checkout 3 bulan kuartal Anda)
2. **Durasi Countdown Timer**:
   Di bagian bawah script, cari fungsi `startCountdown()` untuk mengubah durasi jam, menit, dan detik.
3. **Data Notifikasi Pembeli**:
   Cari array `salesData` pada tag `<script>` untuk menambah atau mengubah nama kota dan pembeli pada floating popup.
