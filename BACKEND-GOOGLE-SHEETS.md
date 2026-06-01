# Backend Google Sheets & Google Apps Script

Dokumen ini menjelaskan struktur backend aplikasi Rapor Al-Qur’an SMPIT Nur Hikmah yang menggunakan Google Sheets dan Google Apps Script.

Backend berfungsi sebagai tempat penyimpanan data dan penghubung antara frontend dengan Google Sheets.

---

## 1. Gambaran Umum

Aplikasi frontend mengambil dan menyimpan data melalui Google Apps Script Web App.

Frontend mengirim request ke endpoint Apps Script melalui file:

```text
js/api.js
```

Endpoint utama disimpan pada:

```js
API_CONFIG.BASE_URL;
```

Backend bertugas untuk:

- Mengambil seluruh data aplikasi
- Memproses login user
- Menyimpan progress capaian siswa
- Menyimpan input progress massal
- Menyimpan pengaturan aplikasi
- Menyimpan riwayat generate file

---

## 2. Sheet yang Dibutuhkan

Google Sheets sebaiknya memiliki beberapa tab berikut:

```text
SETTINGS
PERIODS
CLASSES
HALAQOH
STUDENTS
PROGRESS
USERS
GENERATE_LOG
```

Nama tab sebaiknya dibuat konsisten dengan huruf kapital agar mudah dikenali.

---

## 3. SETTINGS

Tab `SETTINGS` menyimpan konfigurasi utama aplikasi.

Kolom yang disarankan:

```text
key
value
```

Contoh isi:

| key                | value                                                   |
| ------------------ | ------------------------------------------------------- |
| schoolName         | SMPIT Nur Hikmah                                        |
| appName            | Rapor Al-Qur’an                                         |
| schoolAddress      | Bekasi                                                  |
| adminEmail         | [admin@nurhikmah.sch.id](mailto:admin@nurhikmah.sch.id) |
| academicYear       | 2025/2026                                               |
| activeAcademicYear | 2025/2026                                               |
| activePeriodId     | period_april_juni                                       |
| semesterLabel      | SEMESTER I                                              |
| defaultMonth       | April-Juni                                              |
| targetZiyadah      | 10 halaman                                              |
| targetMurojaah     | 20 halaman                                              |
| effectiveDays      | 20                                                      |
| reportPlaceDate    | Bekasi, 26 Juni 2025                                    |
| classSheetUrl      | link Google Sheets tab CLASSES                          |
| halaqohSheetUrl    | link Google Sheets tab HALAQOH                          |
| studentSheetUrl    | link Google Sheets tab STUDENTS                         |

---

## 4. PERIODS

Tab `PERIODS` menyimpan daftar periode rapor.

Kolom yang disarankan:

```text
id
name
month
semester
academicYear
status
```

Contoh:

| id                | name       | month      | semester | academicYear | status |
| ----------------- | ---------- | ---------- | -------- | ------------ | ------ |
| period_april_juni | April-Juni | April-Juni | Ganjil   | 2025/2026    | Aktif  |

Catatan:

- `id` harus unik.
- `status` dapat berisi `Aktif` atau `Tidak Aktif`.
- Periode aktif juga dapat ditentukan dari `SETTINGS.activePeriodId`.

---

## 5. CLASSES

Tab `CLASSES` menyimpan data kelas.

Kolom yang disarankan:

```text
id
name
level
homeroomTeacher
academicYear
status
```

Contoh:

| id            | name | level | homeroomTeacher   | academicYear | status |
| ------------- | ---- | ----- | ----------------- | ------------ | ------ |
| class_7a_2025 | 7A   | 7     | Moh Arifin, S.Ag. | 2025/2026    | Aktif  |

Catatan:

- `id` harus unik.
- Jika data kelas dipakai lintas tahun, tetap disarankan memakai ID yang membedakan tahun ajaran.
- `homeroomTeacher` akan digunakan sebagai default wali kelas pada rapor.

---

## 6. HALAQOH

Tab `HALAQOH` menyimpan data kelompok halaqoh.

Kolom yang disarankan:

```text
id
name
classId
teacherName
academicYear
status
```

Contoh:

| id                 | name             | classId       | teacherName        | academicYear | status |
| ------------------ | ---------------- | ------------- | ------------------ | ------------ | ------ |
| halaqoh_7a_01_2025 | Halaqoh 7A Putra | class_7a_2025 | Ahmad Fulan, S.Pd. | 2025/2026    | Aktif  |

Catatan:

- `classId` harus sesuai dengan `id` pada tab `CLASSES`.
- `teacherName` akan digunakan sebagai default guru Al-Qur’an pada rapor.

---

## 7. STUDENTS

Tab `STUDENTS` menyimpan data siswa.

Kolom yang disarankan:

```text
id
nis
name
classId
halaqohId
status
```

Contoh:

| id          | nis   | name         | classId       | halaqohId          | status |
| ----------- | ----- | ------------ | ------------- | ------------------ | ------ |
| student_001 | 25001 | Ahmad Farhan | class_7a_2025 | halaqoh_7a_01_2025 | Aktif  |

Catatan:

- `id` harus unik.
- `classId` harus sesuai dengan tab `CLASSES`.
- `halaqohId` harus sesuai dengan tab `HALAQOH`.
- Hanya siswa dengan status aktif yang tampil dalam input capaian dan preview.

---

## 8. PROGRESS

Tab `PROGRESS` menyimpan capaian pembelajaran siswa.

Kolom yang disarankan:

```text
id
studentId
periodId
month
targetZiyadah
targetMurojaah
effectiveDays
hafalanStart
hafalanLast
totalHafalan
hafalanStatus
murojaahStart
murojaahLast
totalMurojaah
murojaahStatus
disciplineTarget
disciplineAchieved
disciplineStatus
noteHafalan
noteTahsin
noteDiscipline
homeroomTeacher
quranTeacher
reportPlaceDate
createdAt
updatedAt
```

Catatan:

- Kombinasi `studentId` dan `periodId` sebaiknya unik.
- Jika data untuk siswa dan periode yang sama sudah ada, backend sebaiknya update data lama, bukan membuat duplikat.
- Field catatan dapat berisi HTML sederhana hasil editor rich text.
- Backend sebaiknya tetap melakukan sanitasi atau pembatasan tag jika diperlukan.

---

## 9. USERS

Tab `USERS` menyimpan akun pengguna aplikasi.

Kolom yang disarankan:

```text
id
name
email
password
role
classId
halaqohId
status
```

Contoh:

| id           | name        | email                                                   | password | role  | classId       | halaqohId          | status |
| ------------ | ----------- | ------------------------------------------------------- | -------- | ----- | ------------- | ------------------ | ------ |
| user_admin   | Admin       | [admin@nurhikmah.sch.id](mailto:admin@nurhikmah.sch.id) | password | admin |               |                    | Aktif  |
| user_guru_01 | Ahmad Fulan | [guru@nurhikmah.sch.id](mailto:guru@nurhikmah.sch.id)   | password | guru  | class_7a_2025 | halaqoh_7a_01_2025 | Aktif  |

Catatan penting:

- Untuk production, password sebaiknya tidak disimpan dalam bentuk plain text.
- Minimal backend harus membatasi data berdasarkan role.
- User dengan role `guru` wajib punya `halaqohId`.
- User dengan role `admin` dapat mengakses seluruh data.

---

## 10. GENERATE_LOG

Tab `GENERATE_LOG` menyimpan riwayat generate file.

Kolom yang disarankan:

```text
id
periodId
academicYear
generateType
fileType
outputType
targetType
targetId
targetName
totalStudents
totalFiles
fileName
fileUrl
status
message
createdBy
createdAt
```

Contoh:

| id                | periodId          | academicYear | fileType | targetType | targetName       | totalStudents | totalFiles | status  | createdBy | createdAt                |
| ----------------- | ----------------- | ------------ | -------- | ---------- | ---------------- | ------------- | ---------- | ------- | --------- | ------------------------ |
| gen_1710000000000 | period_april_juni | 2025/2026    | pdf      | halaqoh    | Halaqoh 7A Putra | 20            | 20         | success | Admin     | 2025-06-26T08:00:00.000Z |

---

## 11. Action API yang Dibutuhkan

Frontend menggunakan action berikut:

```text
getAllData
login
saveProgress
saveProgressBatch
updateSettings
saveGenerateLog
```

---

## 12. getAllData

Action `getAllData` digunakan untuk mengambil seluruh data awal aplikasi.

Response yang diharapkan:

```json
{
  "success": true,
  "data": {
    "settings": {},
    "periods": [],
    "classes": [],
    "halaqoh": [],
    "students": [],
    "progress": [],
    "users": [],
    "generateLog": []
  }
}
```

---

## 13. login

Action `login` digunakan untuk memproses login pengguna.

Payload dari frontend:

```json
{
  "action": "login",
  "email": "admin@nurhikmah.sch.id",
  "password": "password"
}
```

Response yang diharapkan:

```json
{
  "success": true,
  "user": {
    "id": "user_admin",
    "name": "Admin",
    "email": "admin@nurhikmah.sch.id",
    "role": "admin",
    "classId": "",
    "halaqohId": ""
  }
}
```

Catatan:

- Jangan mengirim password kembali ke frontend.
- User tidak aktif tidak boleh login.
- Role harus valid: `admin` atau `guru`.

---

## 14. saveProgress

Action `saveProgress` digunakan untuk menyimpan satu data progress siswa.

Payload:

```json
{
  "action": "saveProgress",
  "progress": {
    "id": "progress_student_001_period_april_juni",
    "studentId": "student_001",
    "periodId": "period_april_juni"
  }
}
```

Response:

```json
{
  "success": true,
  "progress": {}
}
```

Backend sebaiknya:

- Mengecek `studentId`
- Mengecek `periodId`
- Update jika data sudah ada
- Insert jika data belum ada
- Mengisi atau memperbarui `updatedAt`

---

## 15. saveProgressBatch

Action `saveProgressBatch` digunakan untuk menyimpan banyak progress sekaligus.

Payload:

```json
{
  "action": "saveProgressBatch",
  "progressList": []
}
```

Response:

```json
{
  "success": true,
  "progressList": []
}
```

Backend sebaiknya:

- Memvalidasi bahwa `progressList` adalah array
- Memproses setiap baris
- Menghindari duplikasi `studentId + periodId`
- Mengembalikan data hasil simpan

---

## 16. updateSettings

Action `updateSettings` digunakan untuk menyimpan pengaturan aplikasi.

Payload:

```json
{
  "action": "updateSettings",
  "settings": {}
}
```

Response:

```json
{
  "success": true,
  "settings": {}
}
```

Backend sebaiknya:

- Hanya mengizinkan role admin
- Menyimpan data ke tab `SETTINGS`
- Mengembalikan settings terbaru

---

## 17. saveGenerateLog

Action `saveGenerateLog` digunakan untuk menyimpan riwayat generate file.

Payload:

```json
{
  "action": "saveGenerateLog",
  "log": {}
}
```

Response:

```json
{
  "success": true,
  "log": {}
}
```

---

## 18. Validasi Keamanan Backend

Frontend sudah membatasi tampilan berdasarkan role. Namun backend tetap wajib melakukan validasi.

Minimal backend harus memvalidasi:

- Action yang diminta
- Payload yang diterima
- Status user
- Role user
- Hak akses user terhadap siswa/halaqoh
- Data wajib seperti `studentId`, `periodId`, dan `activePeriodId`

Catatan penting:

Frontend dapat dimodifikasi oleh siapa pun melalui browser. Karena itu, backend tidak boleh sepenuhnya percaya pada data dari frontend.

---

## 19. Catatan Maintenance

Saat tahun ajaran baru:

1. Tambahkan periode baru di `PERIODS`.
2. Tambahkan kelas baru di `CLASSES`.
3. Tambahkan halaqoh baru di `HALAQOH`.
4. Update siswa di `STUDENTS`.
5. Update user guru jika ada perubahan halaqoh.
6. Atur `activeAcademicYear` dan `activePeriodId` di `SETTINGS`.

---

## 20. Checklist Backend

Sebelum aplikasi digunakan, cek:

- Semua tab tersedia
- Semua header kolom benar
- ID data konsisten
- User admin tersedia
- User guru memiliki `halaqohId`
- Periode aktif sudah benar
- Data siswa aktif sudah benar
- Apps Script sudah dideploy sebagai Web App
- URL Web App sudah dimasukkan ke `js/api.js`
- Semua action API berhasil dites
