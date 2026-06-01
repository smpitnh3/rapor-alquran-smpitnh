# Rapor Al-Qur’an SMPIT Nur Hikmah

Web app untuk membantu guru dan admin dalam mengelola capaian pembelajaran Al-Qur’an siswa, mulai dari input capaian, preview rapor, generate PDF, hingga rekap Excel.

Aplikasi ini dibuat dengan HTML, CSS, dan JavaScript vanilla. Data aplikasi terhubung ke Google Sheets melalui Google Apps Script sebagai backend.

---

## Fitur Utama

- Login admin dan guru
- Dashboard ringkasan capaian siswa
- Pengaturan identitas sekolah, tahun ajaran, periode, dan default rapor
- Manajemen data kelas dan halaqoh
- Daftar siswa berdasarkan kelas dan halaqoh
- Input capaian per siswa
- Input capaian massal dengan tampilan spreadsheet
- Preview rapor formal ukuran A4
- Generate PDF rapor per siswa
- Generate PDF gabungan berdasarkan siswa, halaqoh, atau kelas
- Generate Excel rekap capaian
- Riwayat generate file
- Mode terang dan gelap
- Tampilan responsif untuk desktop, tablet, dan mobile
- Role access admin dan guru

---

## Teknologi yang Digunakan

### Frontend

- HTML
- CSS
- JavaScript Vanilla

### Backend

- Google Sheets
- Google Apps Script Web App

### Library Eksternal

- SweetAlert2
- Jspreadsheet CE
- jsuites
- html2canvas
- jsPDF
- SheetJS / XLSX
- Google Fonts Poppins

---

## Struktur Folder

```text
project-root/
├── index.html
├── assets/
│   ├── favicon/
│   └── images/
├── css/
│   ├── tokens.css
│   ├── base.css
│   ├── layout.css
│   ├── components.css
│   ├── pages.css
│   ├── responsive.css
│   └── pages/
│       ├── common-pages.css
│       ├── preview-rapor.css
│       ├── generate-file.css
│       ├── pengaturan.css
│       ├── kelas-halaqoh.css
│       ├── panduan.css
│       ├── login.css
│       ├── input-capaian.css
│       └── input-massal.css
├── js/
│   ├── data.js
│   ├── utils.js
│   ├── api.js
│   ├── partials.js
│   ├── auth.js
│   ├── theme.js
│   ├── sidebar.js
│   ├── routing.js
│   ├── pengaturan.js
│   ├── kelas-halaqoh.js
│   ├── dashboard.js
│   ├── siswa.js
│   ├── input-capaian.js
│   ├── modal-capaian.js
│   ├── preview-rapor.js
│   ├── generate-file.js
│   ├── app.js
│   └── input-massal/
│       ├── input-massal-state.js
│       ├── input-massal-options.js
│       ├── input-massal-note-editor.js
│       ├── input-massal-spreadsheet.js
│       ├── input-massal-validation.js
│       ├── input-massal-save.js
│       └── input-massal.js
└── partials/
    ├── login.partial
    ├── sidebar.partial
    ├── topbar.partial
    ├── dashboard.partial
    ├── pengaturan.partial
    ├── kelas-halaqoh.partial
    ├── siswa.partial
    ├── input-capaian.partial
    ├── input-massal.partial
    ├── preview-rapor.partial
    ├── generate-file.partial
    └── panduan.partial
```

---

## Konsep Arsitektur

Aplikasi ini menggunakan pendekatan modular sederhana tanpa framework.

### HTML Partial

File `index.html` hanya berisi struktur utama dan placeholder. Bagian halaman dipisahkan ke folder `partials/`, lalu dimuat menggunakan `partials.js`.

### CSS Modular

CSS dipisah menjadi beberapa lapisan:

- `tokens.css` untuk design tokens dan tema
- `base.css` untuk reset dan style dasar
- `layout.css` untuk app shell, sidebar, dan topbar
- `components.css` untuk komponen umum
- `pages.css` sebagai penghubung style halaman
- `responsive.css` untuk responsive global dan print

### JavaScript Modular

JavaScript dipisahkan berdasarkan tanggung jawab:

- `utils.js` untuk helper umum
- `api.js` untuk komunikasi dengan Google Apps Script
- `auth.js` untuk login dan role access
- `routing.js` untuk navigasi halaman
- file halaman untuk logic masing-masing fitur
- folder `input-massal/` untuk fitur input massal yang lebih kompleks

---

## Role Pengguna

### Admin

Admin dapat:

- Melihat semua data
- Mengubah pengaturan aplikasi
- Melihat semua kelas, halaqoh, dan siswa
- Input capaian semua siswa
- Menggunakan input massal
- Preview semua rapor
- Generate PDF dan Excel

### Guru

Guru dapat:

- Melihat siswa sesuai halaqoh yang diampu
- Input capaian siswa dalam halaqohnya
- Menggunakan input massal untuk siswa dalam halaqohnya
- Preview rapor siswa dalam halaqohnya
- Generate PDF dan Excel sesuai akses halaqohnya

---

## Integrasi Backend

Frontend terhubung ke backend Google Apps Script melalui file:

```text
js/api.js
```

Endpoint utama disimpan di:

```js
API_CONFIG.BASE_URL;
```

Action yang digunakan:

```text
getAllData
login
saveProgress
saveProgressBatch
updateSettings
saveGenerateLog
```

Backend wajib melakukan validasi action, payload, dan hak akses user. Frontend tidak boleh menjadi satu-satunya lapisan keamanan.

---

## Cara Menjalankan di Lokal

1. Clone atau salin folder project.
2. Buka project menggunakan VS Code.
3. Jalankan dengan Live Server.
4. Buka browser pada alamat lokal yang diberikan Live Server.
5. Pastikan koneksi internet aktif karena aplikasi menggunakan beberapa library CDN.

---

## Checklist Sebelum Deploy

Pastikan semua hal berikut sudah aman:

- Tidak ada error merah di Console browser
- Tidak ada file CSS, JS, partial, asset, atau favicon yang 404
- Login admin berhasil
- Login guru berhasil
- Role guru hanya melihat data halaqohnya
- Pengaturan bisa disimpan
- Input capaian per siswa berhasil
- Input massal berhasil divalidasi dan disimpan
- Preview rapor tampil normal
- Generate PDF per siswa berhasil
- Generate PDF gabungan berhasil
- Generate Excel berhasil
- Dark mode berjalan normal
- Mobile sidebar berjalan normal
- Print preview A4 tidak terpotong
- Pesan error offline sudah ramah untuk user

---

## Catatan Deploy

Aplikasi dapat dideploy ke static hosting seperti:

- Netlify
- Vercel
- GitHub Pages
- Firebase Hosting
- Hosting sekolah

Pastikan seluruh folder berikut ikut terupload:

```text
assets/
css/
js/
partials/
index.html
```

Jangan menghapus folder `partials/`, karena halaman aplikasi dimuat dari folder tersebut.

---

## Catatan Penting

- File partial menggunakan ekstensi `.partial`.
- Jangan mengganti nama file atau folder tanpa memperbarui path di `partials.js`, `pages.css`, dan `index.html`.
- Jika menggunakan hosting yang case-sensitive, pastikan nama file huruf besar/kecil sama persis.
- Jika library CDN tidak termuat, fitur spreadsheet, PDF, atau Excel bisa gagal.
- Untuk production penuh, validasi keamanan tetap harus dilakukan di backend Google Apps Script.

---

## Status Project

Project sudah melalui proses refactoring dan QC pada:

- Struktur HTML partial
- Struktur CSS modular
- Struktur JavaScript modular
- Routing halaman
- Role access admin/guru
- Input capaian
- Input massal
- Preview rapor
- Generate PDF dan Excel
- Integrasi API Google Apps Script
- Responsive layout
- Dark mode
- Print/PDF layout

Project siap masuk tahap final testing dan deploy.
