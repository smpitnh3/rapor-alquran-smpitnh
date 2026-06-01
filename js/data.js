/* =========================================================
   DATA DUMMY
   Rapor Al-Qur’an SMPIT Nur Hikmah
   ---------------------------------------------------------
   File ini berisi data sementara untuk frontend statis.
   Nanti saat backend sudah siap, data ini akan diganti dari
   Google Sheets + Apps Script.
========================================================= */

window.RAPOR_DATA = {
  /* =========================
     SETTINGS APLIKASI
  ========================= */
  settings: {
    schoolName: "SMPIT Nur Hikmah",
    appName: "Rapor Al-Qur’an",
    activeAcademicYear: "2025/2026",
    activePeriodId: "PER-001"
  },

  /* =========================
     DATA KELAS
  ========================= */
    classes: [
    {
        id: "CLS-007A",
        name: "7A",
        level: 7,
        academicYear: "2025/2026",
        homeroomTeacher: "Moh Arifin, S.Ag."
    },
    {
        id: "CLS-007B",
        name: "7B",
        level: 7,
        academicYear: "2025/2026",
        homeroomTeacher: "Siti Aminah, S.Pd."
    },
    {
        id: "CLS-008A",
        name: "8A",
        level: 8,
        academicYear: "2025/2026",
        homeroomTeacher: "Ahmad Fauzi, S.Pd."
    },
    {
        id: "CLS-009A",
        name: "9A",
        level: 9,
        academicYear: "2025/2026",
        homeroomTeacher: "Nurhayati, S.Ag."
    }
    ],

  /* =========================
     DATA HALAQOH
  ========================= */
  halaqoh: [
    {
      id: "HLQ-001",
      name: "Halaqoh Abu Bakar",
      classId: "CLS-007A",
      teacherName: "Ust. Ahmad Fauzi"
    },
    {
      id: "HLQ-002",
      name: "Halaqoh Umar",
      classId: "CLS-007A",
      teacherName: "Ust. Muhammad Rizki"
    },
    {
      id: "HLQ-003",
      name: "Halaqoh Utsman",
      classId: "CLS-007B",
      teacherName: "Ustzh. Laila Hanifah"
    },
    {
      id: "HLQ-004",
      name: "Halaqoh Ali",
      classId: "CLS-008A",
      teacherName: "Ust. Hasan Basri"
    },
    {
      id: "HLQ-005",
      name: "Halaqoh Zaid",
      classId: "CLS-009A",
      teacherName: "Ustzh. Nur Aisyah"
    }
  ],

  /* =========================
     DATA SISWA
  ========================= */
  students: [
    {
      id: "STD-001",
      nis: "2526001",
      name: "Ahmad Naufal",
      gender: "L",
      classId: "CLS-007A",
      halaqohId: "HLQ-001",
      status: "Aktif"
    },
    {
      id: "STD-002",
      nis: "2526002",
      name: "Bilal Ramadhan",
      gender: "L",
      classId: "CLS-007A",
      halaqohId: "HLQ-001",
      status: "Aktif"
    },
    {
      id: "STD-003",
      nis: "2526003",
      name: "Citra Zahra",
      gender: "P",
      classId: "CLS-007A",
      halaqohId: "HLQ-001",
      status: "Aktif"
    },
    {
      id: "STD-004",
      nis: "2526004",
      name: "Daffa Alfarizi",
      gender: "L",
      classId: "CLS-007A",
      halaqohId: "HLQ-002",
      status: "Aktif"
    },
    {
      id: "STD-005",
      nis: "2526005",
      name: "Fathimah Azzahra",
      gender: "P",
      classId: "CLS-007A",
      halaqohId: "HLQ-002",
      status: "Aktif"
    },
    {
      id: "STD-006",
      nis: "2526006",
      name: "Hanif Maulana",
      gender: "L",
      classId: "CLS-007B",
      halaqohId: "HLQ-003",
      status: "Aktif"
    },
    {
      id: "STD-007",
      nis: "2526007",
      name: "Maryam Shalihah",
      gender: "P",
      classId: "CLS-007B",
      halaqohId: "HLQ-003",
      status: "Aktif"
    },
    {
      id: "STD-008",
      nis: "2526008",
      name: "Salman Al-Farisi",
      gender: "L",
      classId: "CLS-008A",
      halaqohId: "HLQ-004",
      status: "Aktif"
    },
    {
      id: "STD-009",
      nis: "2526009",
      name: "Aisyah Humaira",
      gender: "P",
      classId: "CLS-008A",
      halaqohId: "HLQ-004",
      status: "Aktif"
    },
    {
      id: "STD-010",
      nis: "2526010",
      name: "Zubair Hakim",
      gender: "L",
      classId: "CLS-009A",
      halaqohId: "HLQ-005",
      status: "Aktif"
    }
  ],

  /* =========================
     PERIODE RAPOR
  ========================= */
  periods: [
    {
      id: "PER-001",
      name: "Semester Ganjil",
      academicYear: "2025/2026",
      startDate: "2025-07-15",
      endDate: "2025-12-20",
      status: "Aktif"
    },
    {
      id: "PER-002",
      name: "Semester Genap",
      academicYear: "2025/2026",
      startDate: "2026-01-08",
      endDate: "2026-06-20",
      status: "Draft"
    }
  ],

  /* =========================
     DATA CAPAIAN AL-QUR’AN
     ---------------------------------------------------------
     status:
     - Tuntas
     - Proses
     - Perlu Perhatian
  ========================= */
    progress: [
    {
        id: "PRG-001",
        studentId: "STD-001",
        periodId: "PER-001",

        month: "April-Juni",

        targetZiyadah: "10 halaman",
        targetMurojaah: "20 halaman",
        effectiveDays: "20 hari",

        hafalanStart: "An-Naba",
        hafalanLast: "Al-Infithar",
        totalHafalan: "10 halaman",
        hafalanStatus: "Tuntas",

        murojaahStart: "An-Naba",
        murojaahLast: "Al-Muthaffifin",
        totalMurojaah: "20 halaman",
        murojaahStatus: "Tuntas",

        disciplineTarget: 20,
        disciplineAchieved: 20,
        disciplineStatus: "Tuntas",

        noteHafalan: "Hafalan lancar dan sudah mencapai target ziyadah.",
        noteTahsin: "Bacaan cukup baik, tetap perlu menjaga panjang pendek bacaan.",
        noteDiscipline: "Kedisiplinan sangat baik dan konsisten mengikuti halaqoh.",

        homeroomTeacher: "Moh Arifin, S.Ag.",
        quranTeacher: "Siti Us Bandiyah, S.Ag.",
        reportPlaceDate: "Bekasi, 26 Juni 2025"
    },
    {
        id: "PRG-002",
        studentId: "STD-002",
        periodId: "PER-001",

        month: "April-Juni",

        targetZiyadah: "10 halaman",
        targetMurojaah: "20 halaman",
        effectiveDays: "20 hari",

        hafalanStart: "An-Naba",
        hafalanLast: "At-Takwir",
        totalHafalan: "6 halaman",
        hafalanStatus: "Proses",

        murojaahStart: "An-Naba",
        murojaahLast: "Al-Infithar",
        totalMurojaah: "14 halaman",
        murojaahStatus: "Proses",

        disciplineTarget: 20,
        disciplineAchieved: 17,
        disciplineStatus: "Proses",

        noteHafalan: "Perlu menambah murojaah agar hafalan lebih kuat.",
        noteTahsin: "Masih perlu latihan pada kelancaran dan hukum mad.",
        noteDiscipline: "Kehadiran cukup baik, namun perlu lebih konsisten dalam setoran.",

        homeroomTeacher: "Moh Arifin, S.Ag.",
        quranTeacher: "Siti Us Bandiyah, S.Ag.",
        reportPlaceDate: "Bekasi, 26 Juni 2025"
    },
    {
        id: "PRG-003",
        studentId: "STD-003",
        periodId: "PER-001",

        month: "April-Juni",

        targetZiyadah: "10 halaman",
        targetMurojaah: "20 halaman",
        effectiveDays: "20 hari",

        hafalanStart: "An-Naba",
        hafalanLast: "Al-Muthaffifin",
        totalHafalan: "4 halaman",
        hafalanStatus: "Perlu Perhatian",

        murojaahStart: "An-Naba",
        murojaahLast: "At-Takwir",
        totalMurojaah: "8 halaman",
        murojaahStatus: "Perlu Perhatian",

        disciplineTarget: 20,
        disciplineAchieved: 12,
        disciplineStatus: "Perlu Perhatian",

        noteHafalan: "Butuh pendampingan khusus pada kelancaran dan konsistensi setoran.",
        noteTahsin: "Perlu penguatan makharijul huruf dan kelancaran bacaan.",
        noteDiscipline: "Perlu meningkatkan kedisiplinan hadir dan menyetorkan hafalan.",

        homeroomTeacher: "Moh Arifin, S.Ag.",
        quranTeacher: "Siti Us Bandiyah, S.Ag.",
        reportPlaceDate: "Bekasi, 26 Juni 2025"
    },
    {
        id: "PRG-004",
        studentId: "STD-004",
        periodId: "PER-001",

        month: "April-Juni",

        targetZiyadah: "10 halaman",
        targetMurojaah: "20 halaman",
        effectiveDays: "20 hari",

        hafalanStart: "An-Naba",
        hafalanLast: "Al-Insyiqaq",
        totalHafalan: "10 halaman",
        hafalanStatus: "Tuntas",

        murojaahStart: "An-Naba",
        murojaahLast: "Al-Muthaffifin",
        totalMurojaah: "20 halaman",
        murojaahStatus: "Tuntas",

        disciplineTarget: 20,
        disciplineAchieved: 19,
        disciplineStatus: "Tuntas",

        noteHafalan: "Capaian hafalan sangat baik dan sesuai target.",
        noteTahsin: "Bacaan tartil dan cukup stabil.",
        noteDiscipline: "Sangat disiplin dalam mengikuti kegiatan halaqoh.",

        homeroomTeacher: "Moh Arifin, S.Ag.",
        quranTeacher: "Siti Us Bandiyah, S.Ag.",
        reportPlaceDate: "Bekasi, 26 Juni 2025"
    },
    {
        id: "PRG-005",
        studentId: "STD-005",
        periodId: "PER-001",

        month: "April-Juni",

        targetZiyadah: "10 halaman",
        targetMurojaah: "20 halaman",
        effectiveDays: "20 hari",

        hafalanStart: "An-Naba",
        hafalanLast: "Al-Buruj",
        totalHafalan: "7 halaman",
        hafalanStatus: "Proses",

        murojaahStart: "An-Naba",
        murojaahLast: "Al-Infithar",
        totalMurojaah: "15 halaman",
        murojaahStatus: "Proses",

        disciplineTarget: 20,
        disciplineAchieved: 18,
        disciplineStatus: "Proses",

        noteHafalan: "Sudah baik, perlu penguatan hafalan bagian akhir.",
        noteTahsin: "Perlu menjaga konsistensi panjang pendek bacaan.",
        noteDiscipline: "Kedisiplinan cukup baik dan perlu dipertahankan.",

        homeroomTeacher: "Moh Arifin, S.Ag.",
        quranTeacher: "Siti Us Bandiyah, S.Ag.",
        reportPlaceDate: "Bekasi, 26 Juni 2025"
    },
    {
        id: "PRG-006",
        studentId: "STD-006",
        periodId: "PER-001",

        month: "April-Juni",

        targetZiyadah: "10 halaman",
        targetMurojaah: "20 halaman",
        effectiveDays: "20 hari",

        hafalanStart: "An-Naba",
        hafalanLast: "Ath-Thariq",
        totalHafalan: "3 halaman",
        hafalanStatus: "Perlu Perhatian",

        murojaahStart: "An-Naba",
        murojaahLast: "At-Takwir",
        totalMurojaah: "7 halaman",
        murojaahStatus: "Perlu Perhatian",

        disciplineTarget: 20,
        disciplineAchieved: 11,
        disciplineStatus: "Perlu Perhatian",

        noteHafalan: "Perlu jadwal murojaah tambahan dan pendampingan rutin.",
        noteTahsin: "Masih perlu memperbaiki kelancaran dan makharijul huruf.",
        noteDiscipline: "Perlu meningkatkan kedisiplinan dalam hadir dan setoran.",

        homeroomTeacher: "Moh Arifin, S.Ag.",
        quranTeacher: "Siti Us Bandiyah, S.Ag.",
        reportPlaceDate: "Bekasi, 26 Juni 2025"
    },
    {
        id: "PRG-007",
        studentId: "STD-007",
        periodId: "PER-001",

        month: "April-Juni",

        targetZiyadah: "10 halaman",
        targetMurojaah: "20 halaman",
        effectiveDays: "20 hari",

        hafalanStart: "An-Naba",
        hafalanLast: "Al-A’la",
        totalHafalan: "10 halaman",
        hafalanStatus: "Tuntas",

        murojaahStart: "An-Naba",
        murojaahLast: "Al-Muthaffifin",
        totalMurojaah: "20 halaman",
        murojaahStatus: "Tuntas",

        disciplineTarget: 20,
        disciplineAchieved: 20,
        disciplineStatus: "Tuntas",

        noteHafalan: "Stabil dan disiplin dalam setoran hafalan.",
        noteTahsin: "Bacaan baik dan cukup tartil.",
        noteDiscipline: "Kedisiplinan sangat baik.",

        homeroomTeacher: "Moh Arifin, S.Ag.",
        quranTeacher: "Siti Us Bandiyah, S.Ag.",
        reportPlaceDate: "Bekasi, 26 Juni 2025"
    },
    {
        id: "PRG-008",
        studentId: "STD-008",
        periodId: "PER-001",

        month: "April-Juni",

        targetZiyadah: "8 halaman",
        targetMurojaah: "16 halaman",
        effectiveDays: "20 hari",

        hafalanStart: "Al-Mulk",
        hafalanLast: "Al-Qalam",
        totalHafalan: "5 halaman",
        hafalanStatus: "Proses",

        murojaahStart: "Al-Mulk",
        murojaahLast: "Al-Qalam",
        totalMurojaah: "12 halaman",
        murojaahStatus: "Proses",

        disciplineTarget: 20,
        disciplineAchieved: 16,
        disciplineStatus: "Proses",

        noteHafalan: "Masih perlu penguatan hafalan dan pengulangan mandiri.",
        noteTahsin: "Perlu latihan pada panjang pendek bacaan.",
        noteDiscipline: "Kedisiplinan cukup baik, perlu ditingkatkan lagi.",

        homeroomTeacher: "Moh Arifin, S.Ag.",
        quranTeacher: "Siti Us Bandiyah, S.Ag.",
        reportPlaceDate: "Bekasi, 26 Juni 2025"
    },
    {
        id: "PRG-009",
        studentId: "STD-009",
        periodId: "PER-001",

        month: "April-Juni",

        targetZiyadah: "8 halaman",
        targetMurojaah: "16 halaman",
        effectiveDays: "20 hari",

        hafalanStart: "Al-Mulk",
        hafalanLast: "Al-Haqqah",
        totalHafalan: "8 halaman",
        hafalanStatus: "Tuntas",

        murojaahStart: "Al-Mulk",
        murojaahLast: "Al-Haqqah",
        totalMurojaah: "16 halaman",
        murojaahStatus: "Tuntas",

        disciplineTarget: 20,
        disciplineAchieved: 19,
        disciplineStatus: "Tuntas",

        noteHafalan: "Capaian hafalan sangat baik.",
        noteTahsin: "Bacaan baik dan lancar.",
        noteDiscipline: "Kedisiplinan sangat baik dan konsisten.",

        homeroomTeacher: "Moh Arifin, S.Ag.",
        quranTeacher: "Siti Us Bandiyah, S.Ag.",
        reportPlaceDate: "Bekasi, 26 Juni 2025"
    }

    /*
        Catatan:
        STD-010 sengaja belum diberi progress.
        Ini untuk mengetes kondisi "belum input".
    */
    ]
};
