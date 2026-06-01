# Changelog

Semua perubahan penting pada proyek **Rapor Al-Qur’an SMPIT Nur Hikmah** dicatat di file ini.

Format changelog mengikuti pola sederhana:

- `Added` untuk fitur baru
- `Changed` untuk perubahan/perapian
- `Fixed` untuk perbaikan bug
- `Security` untuk perbaikan keamanan
- `Docs` untuk dokumentasi

---

## [1.0.0] - 2026-06-01

### Added

- Menambahkan aplikasi Rapor Al-Qur’an berbasis HTML, CSS, dan JavaScript vanilla.
- Menambahkan halaman login untuk admin dan guru.
- Menambahkan dashboard ringkasan capaian siswa.
- Menambahkan halaman pengaturan aplikasi.
- Menambahkan halaman kelas dan halaqoh.
- Menambahkan halaman data siswa.
- Menambahkan fitur input capaian per siswa.
- Menambahkan fitur input capaian massal menggunakan tampilan spreadsheet.
- Menambahkan modal rich text editor untuk catatan hafalan, tahsin, dan kedisiplinan.
- Menambahkan halaman preview rapor formal ukuran A4.
- Menambahkan fitur print preview rapor.
- Menambahkan fitur generate PDF per siswa.
- Menambahkan fitur generate PDF gabungan.
- Menambahkan fitur generate Excel rekap capaian.
- Menambahkan riwayat generate file.
- Menambahkan mode terang dan gelap.
- Menambahkan layout responsif untuk desktop, tablet, dan mobile.
- Menambahkan mobile sidebar drawer.
- Menambahkan dukungan favicon dan manifest.
- Menambahkan integrasi awal dengan Google Apps Script dan Google Sheets.

### Changed

- Memecah HTML utama menjadi beberapa file partial.
- Merapikan struktur `index.html` agar lebih ringkas.
- Memisahkan CSS menjadi beberapa file modular:
  - `tokens.css`
  - `base.css`
  - `layout.css`
  - `components.css`
  - `pages.css`
  - `responsive.css`

- Memecah style halaman ke dalam folder `css/pages/`.
- Memecah fitur input massal ke dalam beberapa file JavaScript kecil.
- Merapikan struktur JavaScript berdasarkan tanggung jawab fitur.
- Menstandarkan helper umum di `utils.js`.
- Menjadikan `pages.css` sebagai file penghubung style halaman.
- Memperbaiki urutan pemanggilan CSS dan JavaScript di `index.html`.
- Menyesuaikan styling dark mode agar lebih konsisten menggunakan design tokens.
- Menyesuaikan styling print agar hasil rapor tetap putih dan formal.
- Menyesuaikan pesan tombol dan alert agar lebih ramah untuk pengguna.

### Fixed

- Memperbaiki issue partial sidebar yang tidak tampil karena nama file/path tidak sinkron.
- Memperbaiki routing halaman agar tetap aktif setelah reload.
- Memperbaiki aksesibilitas menu aktif dengan `aria-current`.
- Memperbaiki potensi error `undefined` pada data siswa.
- Memperbaiki render tabel agar data dari backend memakai `escapeHtml()`.
- Memperbaiki filter tahun ajaran agar lebih toleran terhadap data lama.
- Memperbaiki reset state pada beberapa halaman agar tidak membawa filter lama.
- Memperbaiki role guru agar hanya melihat data sesuai halaqoh.
- Memperbaiki tombol dan select yang bisa tertinggal disabled setelah role berubah.
- Memperbaiki validasi `effectiveDays` agar harus lebih dari 0.
- Memperbaiki error list SweetAlert agar aman dengan `escapeHtml()`.
- Memperbaiki event listener rich text editor agar tidak dobel.
- Memperbaiki input massal agar listener tidak dobel saat halaman diinisialisasi ulang.
- Memperbaiki validasi input massal agar lebih aman.
- Memperbaiki simpan batch agar aman jika backend mengembalikan data kosong.
- Memperbaiki generate PDF individual agar benar-benar membuat PDF untuk semua siswa terpilih.
- Memperbaiki generate Excel agar helper rich text tersedia secara global.
- Memperbaiki error network agar tidak menampilkan pesan mentah `Failed to fetch`.
- Memperbaiki error CSS MIME type akibat file `input-capaian.css` yang belum dibuat.
- Memperbaiki favicon 404 dengan menambahkan link favicon di `index.html`.

### Security

- Menambahkan escaping HTML pada render data tabel.
- Menambahkan sanitasi rich text untuk catatan rapor.
- Menambahkan pembatasan role admin dan guru di frontend.
- Menambahkan catatan bahwa backend tetap wajib memvalidasi role, action, dan payload.
- Menambahkan handling error API agar pesan lebih aman dan jelas untuk user.

### Docs

- Menambahkan draft `README.md`.
- Menambahkan draft `PANDUAN-PENGGUNA.md`.
- Menambahkan draft `BACKEND-GOOGLE-SHEETS.md`.
- Menambahkan draft `CHANGELOG.md`.

---

## Catatan Versi 1.0.0

Versi ini merupakan versi awal yang sudah melalui proses refactoring dan QC besar pada:

- Struktur HTML
- Struktur CSS
- Struktur JavaScript
- Integrasi frontend-backend
- Input capaian
- Input massal
- Preview rapor
- Generate PDF dan Excel
- Dark mode
- Responsive layout
- Print/PDF layout

Versi ini siap untuk tahap final testing dan deploy awal.

---

## Rencana Pengembangan Berikutnya

### Planned

- Menambahkan validasi backend yang lebih kuat.
- Menambahkan hashing password di backend.
- Menambahkan sistem session/token yang lebih aman.
- Menambahkan backup data otomatis.
- Menambahkan fitur import data siswa dari Excel.
- Menambahkan fitur export rekap tambahan.
- Menambahkan halaman audit log aktivitas pengguna.
- Menambahkan dokumentasi deployment khusus GitHub Pages, Netlify, atau Vercel.
- Menambahkan library eksternal lokal agar tidak bergantung penuh pada CDN.
- Menambahkan testing checklist berkala sebelum update versi.
