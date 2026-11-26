# SwiftDocs — Open-Source Office & PDF Suite

**SwiftDocs** adalah aplikasi web statis (HTML, CSS, JavaScript) untuk kebutuhan pengolahan dokumen PDF & Office ala iLovePDF yang berjalan **100% di sisi klien (client-side)** langsung di browser tanpa server/backend.

Karena tidak membutuhkan PHP, Laravel, atau server backend, SwiftDocs sangat ringan, cepat, aman (file tidak pernah dikirim ke server), dan bisa langsung di-deploy gratis ke **Vercel**, **GitHub Pages**, **Cloudflare Pages**, atau **Netlify**.

## Fitur Utama (8 Tools)

1. **Gabung PDF (Merge)** — Gabungkan beberapa file PDF dan atur urutannya.
2. **Pisah PDF (Split & Extract)** — Pilih halaman secara visual untuk diekstrak ke 1 PDF atau pecah semua halaman menjadi arsip `.ZIP`.
3. **Kompres PDF** — Mode Kompresi Cerdas (rasterize gambar dengan 3 level kualitas) dan Optimasi Struktur (lossless).
4. **PDF ke Gambar** — Konversi halaman PDF ke PNG atau JPG (Standard 1.5x / HD 2.5x) dan unduh satuan atau `.ZIP`.
5. **Gambar ke PDF** — Gabungkan gambar JPG/PNG/WebP menjadi 1 dokumen PDF (ukuran A4 atau Fit).
6. **Putar & Hapus Halaman** — Putar orientasi halaman (90°/180°/270°) atau hapus halaman yang tidak diperlukan.
7. **Watermark & Stempel** — Tambahkan teks watermark diagonal dengan warna, ukuran, dan transparansi kustom.
8. **Office Reader & Cetak ke PDF** — Pratinjau dokumen Word (`.docx`) dan Excel/CSV (`.xlsx`, `.xls`, `.csv`) lalu cetak/simpan sebagai PDF.

## Library Open-Source yang Digunakan

Semua library disimpan secara lokal di `vendor/pdf-tools/` untuk kecepatan maksimal dan bebas CORS:
- `pdf-lib` (`pdf-lib.min.js`)
- `PDF.js` (`pdf.min.js`, `pdf.worker.min.js`)
- `JSZip` (`jszip.min.js`)
- `SheetJS` (`xlsx.full.min.js`)
- `Mammoth.js` (`mammoth.browser.min.js`)
- Tailwind CSS & Lucide Icons

## Cara Menjalankan Secara Lokal

Cukup buka folder ini dengan static web server (agar PDF.js worker berjalan normal di same-origin):

```bash
# Menggunakan Python
python -m http.server 8080

# Atau menggunakan Node.js
npx serve .
```

Lalu buka `http://localhost:8080`.

## Cara Deploy ke Vercel

1. Push folder ini ke repository GitHub, lalu import di [vercel.com](https://vercel.com) (Framework Preset: **Other** / Static, tanpa build command).
2. Atau langsung deploy lewat Vercel CLI:
   ```bash
   npx vercel --prod
   ```
