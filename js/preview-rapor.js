/* =========================================================
   PREVIEW-RAPOR.JS
   Fungsi:
   - Mengisi filter halaman preview.
   - Menampilkan preview rapor A4.
   - Mengikuti data progress sesuai tahun ajaran dan periode.
   - Mendukung role admin/guru.
   - Mendukung data lokal dan backend Google Sheets.
========================================================= */

const previewPageState = {
  academicYear: getActiveAcademicYear(),
  periodId: getActivePeriodId(),
  classId: "all",
  halaqohId: "all",
  studentId: "",
  isInitialized: false,
};

/* =========================================================
   STATE / USER
========================================================= */

function getPreviewCurrentUser() {
  return typeof getCurrentUser === "function" ? getCurrentUser() : null;
}

function resetPreviewPageState() {
  previewPageState.academicYear = getActiveAcademicYear();
  previewPageState.periodId = getActivePeriodId();
  previewPageState.classId = "all";
  previewPageState.halaqohId = "all";
  previewPageState.studentId = "";
  previewPageState.isInitialized = false;
}

/* =========================================================
   OPTIONS
========================================================= */

function getPreviewAcademicYears() {
  const years = DB.periods.map((period) => period.academicYear).filter(Boolean);

  const uniqueYears = [...new Set(years)];

  if (!uniqueYears.length) {
    return [
      {
        id: previewPageState.academicYear,
        name: previewPageState.academicYear,
      },
    ];
  }

  return uniqueYears.map((year) => {
    return {
      id: year,
      name: year,
    };
  });
}

function getPreviewPeriods() {
  return getPeriodsByYear(previewPageState.academicYear);
}

function getPreviewClasses() {
  let classes = getClassesByYear(previewPageState.academicYear);
  const currentUser = getPreviewCurrentUser();

  if (currentUser?.role === "guru" && currentUser.classId) {
    classes = classes.filter((classItem) => {
      return classItem.id === currentUser.classId;
    });
  }

  return classes;
}

function getPreviewHalaqohOptions() {
  const classes = getPreviewClasses();
  const classIds = classes.map((classItem) => classItem.id);

  let halaqohList = DB.halaqoh.filter((halaqoh) => {
    return classIds.includes(halaqoh.classId);
  });

  if (previewPageState.classId !== "all") {
    halaqohList = halaqohList.filter((halaqoh) => {
      return halaqoh.classId === previewPageState.classId;
    });
  }

  const currentUser = getPreviewCurrentUser();

  if (currentUser?.role === "guru" && currentUser.halaqohId) {
    halaqohList = halaqohList.filter((halaqoh) => {
      return halaqoh.id === currentUser.halaqohId;
    });
  }

  return halaqohList;
}

function getPreviewStudentOptions() {
  const allowedStudents = filterStudentsByCurrentUser(DB.students);

  return allowedStudents.filter((student) => {
    const classItem = getStudentClass(student);

    const matchAcademicYear =
      !classItem?.academicYear ||
      classItem.academicYear === previewPageState.academicYear;

    const matchClass =
      previewPageState.classId === "all" ||
      student.classId === previewPageState.classId;

    const matchHalaqoh =
      previewPageState.halaqohId === "all" ||
      student.halaqohId === previewPageState.halaqohId;

    return (
      isActiveStudent(student) &&
      matchAcademicYear &&
      matchClass &&
      matchHalaqoh
    );
  });
}

/* =========================================================
   ROLE DEFAULT
========================================================= */

function applyPreviewPageRoleDefault() {
  const currentUser = getPreviewCurrentUser();

  const yearSelect = getEl("#previewFilterYear");
  const classSelect = getEl("#previewFilterClass");
  const halaqohSelect = getEl("#previewFilterHalaqoh");

  if (yearSelect) {
    yearSelect.disabled = false;
  }

  if (classSelect) {
    classSelect.disabled = false;
  }

  if (halaqohSelect) {
    halaqohSelect.disabled = false;
  }

  if (!currentUser || currentUser.role !== "guru") return;

  if (currentUser.classId) {
    previewPageState.classId = currentUser.classId;
  }

  if (currentUser.halaqohId) {
    previewPageState.halaqohId = currentUser.halaqohId;
  }

  if (yearSelect) {
    yearSelect.disabled = true;
  }

  if (classSelect) {
    classSelect.disabled = true;
  }

  if (halaqohSelect) {
    halaqohSelect.disabled = true;
  }
}

/* =========================================================
   DATA HELPERS
========================================================= */

function getPreviewProgress(studentId) {
  return getProgressByStudentAndPeriod(studentId, previewPageState.periodId);
}

function getTodayIndonesianDate() {
  const formatter = new Intl.DateTimeFormat("id-ID", {
    day: "numeric",
    month: "long",
    year: "numeric",
  });

  return formatter.format(new Date());
}

function setPreviewText(selector, value) {
  setText(selector, value || "-");
}

function getSemesterLabel(periodValue) {
  const value = String(periodValue || "").toLowerCase();

  if (value.includes("ganjil")) return "SEMESTER I";
  if (value.includes("genap")) return "SEMESTER II";
  if (value.includes("semester i")) return "SEMESTER I";
  if (value.includes("semester ii")) return "SEMESTER II";

  return String(periodValue || "-").toUpperCase();
}

function getPreviewPeriod() {
  return DB.periods.find((item) => {
    return item.id === previewPageState.periodId;
  });
}

function getPreviewStudent() {
  return DB.students.find((item) => {
    return item.id === previewPageState.studentId;
  });
}

function getPreviewAcademicYearValue(period, appSettings) {
  return (
    period?.academicYear ||
    appSettings.academicYear ||
    appSettings.activeAcademicYear ||
    previewPageState.academicYear ||
    getActiveAcademicYear()
  );
}

function getPreviewSemesterTitle(period, appSettings) {
  const semesterLabel =
    appSettings.semesterLabel ||
    getSemesterLabel(
      period?.semester || appSettings.defaultSemester || period?.name,
    ) ||
    "-";

  const academicYear = getPreviewAcademicYearValue(period, appSettings);

  return `${semesterLabel} T.A. ${academicYear}`;
}

/* =========================================================
   EMPTY PREVIEW
========================================================= */

function renderEmptyRaporPreview() {
  setPreviewText("#reportSemesterTitle", "-");
  setPreviewText("#reportStudentName", "-");
  setPreviewText("#reportStudentClass", "-");
  setPreviewText("#reportMonth", "-");
  setPreviewText("#reportTargetZiyadah", "-");
  setPreviewText("#reportTargetMurojaah", "-");
  setPreviewText("#reportEffectiveDays", "-");

  setPreviewText("#reportHafalanStart", "-");
  setPreviewText("#reportHafalanLast", "-");
  setPreviewText("#reportTotalHafalan", "-");
  setPreviewText("#reportHafalanStatus", "-");

  setPreviewText("#reportMurojaahStart", "-");
  setPreviewText("#reportMurojaahLast", "-");
  setPreviewText("#reportTotalMurojaah", "-");
  setPreviewText("#reportMurojaahStatus", "-");

  setPreviewText("#reportDisciplineTarget", "-");
  setPreviewText("#reportDisciplineAchieved", "-");
  setPreviewText("#reportDisciplineStatus", "-");

  setRichText("#reportNoteHafalan", "-");
  setRichText("#reportNoteTahsin", "-");
  setRichText("#reportNoteDiscipline", "-");

  setPreviewText("#reportHomeroomTeacher", "-");
  setPreviewText("#reportQuranTeacher", "-");
  setPreviewText("#reportPlaceDate", "-");

  updatePreviewNavigationButtons();
}

/* =========================================================
   FILTERS
========================================================= */

function syncPreviewStateFromSettings() {
  if (!previewPageState.isInitialized) {
    previewPageState.academicYear = getActiveAcademicYear();
    previewPageState.periodId = getActivePeriodId();
    previewPageState.isInitialized = true;
  }

  const academicYearExists = getPreviewAcademicYears().some((year) => {
    return year.id === previewPageState.academicYear;
  });

  if (!academicYearExists) {
    previewPageState.academicYear = getActiveAcademicYear();
    previewPageState.classId = "all";
    previewPageState.halaqohId = "all";
    previewPageState.studentId = "";
  }

  const periodExists = getPreviewPeriods().some((period) => {
    return period.id === previewPageState.periodId;
  });

  if (!periodExists) {
    previewPageState.periodId = getPreviewPeriods()[0]?.id || "";
  }

  const classExists =
    previewPageState.classId === "all" ||
    getPreviewClasses().some((classItem) => {
      return classItem.id === previewPageState.classId;
    });

  if (!classExists) {
    previewPageState.classId = "all";
    previewPageState.halaqohId = "all";
    previewPageState.studentId = "";
  }

  const halaqohExists =
    previewPageState.halaqohId === "all" ||
    getPreviewHalaqohOptions().some((halaqoh) => {
      return halaqoh.id === previewPageState.halaqohId;
    });

  if (!halaqohExists) {
    previewPageState.halaqohId = "all";
    previewPageState.studentId = "";
  }
}

function syncPreviewSelectedStudent() {
  const students = getPreviewStudentOptions();

  if (!previewPageState.studentId && students.length) {
    previewPageState.studentId = students[0].id;
  }

  const isSelectedStudentStillAvailable = students.some((student) => {
    return student.id === previewPageState.studentId;
  });

  if (!isSelectedStudentStillAvailable) {
    previewPageState.studentId = students[0]?.id || "";
  }
}

function populatePreviewFilters(syncFromSettings = false) {
  if (syncFromSettings) {
    syncPreviewStateFromSettings();
  }

  applyPreviewPageRoleDefault();

  populateSelect("#previewFilterYear", getPreviewAcademicYears(), {
    selectedValue: previewPageState.academicYear,
  });

  populateSelect("#previewFilterPeriod", getPreviewPeriods(), {
    selectedValue: previewPageState.periodId,
  });

  populateSelect("#previewFilterClass", getPreviewClasses(), {
    includeAll: true,
    allLabel: "Semua Kelas",
    selectedValue: previewPageState.classId,
  });

  populateSelect("#previewFilterHalaqoh", getPreviewHalaqohOptions(), {
    includeAll: true,
    allLabel: "Semua Halaqoh",
    selectedValue: previewPageState.halaqohId,
  });

  syncPreviewSelectedStudent();

  populateSelect("#previewFilterStudent", getPreviewStudentOptions(), {
    selectedValue: previewPageState.studentId,
  });

  applyPreviewPageRoleDefault();
  updatePreviewNavigationButtons();
}

/* =========================================================
   RENDER PREVIEW
========================================================= */

function renderRaporPreview() {
  const student = getPreviewStudent();
  const period = getPreviewPeriod();

  if (!student) {
    renderEmptyRaporPreview();
    return;
  }

  const classItem = getStudentClass(student);
  const halaqoh = getStudentHalaqoh(student);
  const progress = getPreviewProgress(student.id);
  const appSettings = getAppSettings();

  const semesterTitle = getPreviewSemesterTitle(period, appSettings);

  setPreviewText("#reportSemesterTitle", semesterTitle);
  setPreviewText(
    "#reportStudentName",
    String(student.name || "-").toUpperCase(),
  );
  setPreviewText("#reportStudentClass", getClassLabel(classItem));

  setPreviewText(
    "#reportMonth",
    progress?.month ||
      period?.month ||
      period?.name ||
      appSettings.defaultMonth ||
      "-",
  );

  setPreviewText(
    "#reportTargetZiyadah",
    progress?.targetZiyadah ||
      progress?.ziyadahTarget ||
      appSettings.targetZiyadah ||
      appSettings.defaultZiyadahTarget ||
      "-",
  );

  setPreviewText(
    "#reportTargetMurojaah",
    progress?.targetMurojaah ||
      progress?.murojaahTarget ||
      appSettings.targetMurojaah ||
      appSettings.defaultMurojaahTarget ||
      "-",
  );

  const effectiveDays =
    progress?.effectiveDays ||
    progress?.disciplineTarget ||
    appSettings.effectiveDays ||
    appSettings.defaultEffectiveDays ||
    "-";

  setPreviewText("#reportEffectiveDays", formatHari(effectiveDays));

  setPreviewText("#reportHafalanStart", progress?.hafalanStart || "-");
  setPreviewText("#reportHafalanLast", progress?.hafalanLast || "-");
  setPreviewText("#reportTotalHafalan", progress?.totalHafalan || "-");
  setPreviewText(
    "#reportHafalanStatus",
    progress?.hafalanStatus || "Belum Input",
  );

  setPreviewText("#reportMurojaahStart", progress?.murojaahStart || "-");
  setPreviewText("#reportMurojaahLast", progress?.murojaahLast || "-");
  setPreviewText("#reportTotalMurojaah", progress?.totalMurojaah || "-");
  setPreviewText(
    "#reportMurojaahStatus",
    progress?.murojaahStatus || "Belum Input",
  );

  setPreviewText(
    "#reportDisciplineTarget",
    formatHari(progress?.disciplineTarget || effectiveDays),
  );

  setPreviewText(
    "#reportDisciplineAchieved",
    formatHari(progress?.disciplineAchieved),
  );

  setPreviewText(
    "#reportDisciplineStatus",
    progress?.disciplineStatus || "Belum Input",
  );

  setRichText(
    "#reportNoteHafalan",
    progress?.noteHafalan || "Capaian hafalan belum diinput.",
  );

  setRichText(
    "#reportNoteTahsin",
    progress?.noteTahsin || "Catatan tahsin belum diinput.",
  );

  setRichText(
    "#reportNoteDiscipline",
    progress?.noteDiscipline || "Catatan kedisiplinan belum diinput.",
  );

  setPreviewText(
    "#reportHomeroomTeacher",
    progress?.homeroomTeacher || classItem?.homeroomTeacher || "Wali Kelas",
  );

  setPreviewText(
    "#reportQuranTeacher",
    progress?.quranTeacher || halaqoh?.teacherName || "Guru Al-Qur’an",
  );

  setPreviewText(
    "#reportPlaceDate",
    progress?.reportPlaceDate ||
      appSettings.reportPlaceDate ||
      `Bekasi, ${getTodayIndonesianDate()}`,
  );

  updatePreviewNavigationButtons();
}

/* =========================================================
   NAVIGATION
========================================================= */

function getCurrentPreviewStudentIndex() {
  const students = getPreviewStudentOptions();

  return students.findIndex((student) => {
    return student.id === previewPageState.studentId;
  });
}

function updatePreviewNavigationButtons() {
  const prevButton = getEl("#previewPrevButton");
  const nextButton = getEl("#previewNextButton");

  const students = getPreviewStudentOptions();
  const currentIndex = getCurrentPreviewStudentIndex();

  if (prevButton) {
    prevButton.disabled = students.length <= 1 || currentIndex <= 0;
  }

  if (nextButton) {
    nextButton.disabled =
      students.length <= 1 ||
      currentIndex === -1 ||
      currentIndex >= students.length - 1;
  }
}

function movePreviewStudent(direction) {
  const students = getPreviewStudentOptions();

  if (!students.length) return;

  const currentIndex = getCurrentPreviewStudentIndex();

  let nextIndex = currentIndex + direction;

  if (currentIndex === -1) {
    nextIndex = 0;
  }

  if (nextIndex < 0) {
    nextIndex = 0;
  }

  if (nextIndex > students.length - 1) {
    nextIndex = students.length - 1;
  }

  const nextStudent = students[nextIndex];

  if (!nextStudent) return;

  previewPageState.studentId = nextStudent.id;

  const previewFilterStudent = getEl("#previewFilterStudent");

  if (previewFilterStudent) {
    previewFilterStudent.value = nextStudent.id;
  }

  renderRaporPreview();
  updatePreviewNavigationButtons();
}

/* =========================================================
   INIT
========================================================= */

function initPreviewPage() {
  resetPreviewPageState();

  const previewFilterYear = getEl("#previewFilterYear");
  const previewFilterPeriod = getEl("#previewFilterPeriod");
  const previewFilterClass = getEl("#previewFilterClass");
  const previewFilterHalaqoh = getEl("#previewFilterHalaqoh");
  const previewFilterStudent = getEl("#previewFilterStudent");
  const previewPrintButton = getEl("#previewPrintButton");
  const previewPrevButton = getEl("#previewPrevButton");
  const previewNextButton = getEl("#previewNextButton");

  populatePreviewFilters(true);
  renderRaporPreview();

  previewFilterYear?.addEventListener("change", (event) => {
    previewPageState.academicYear = event.target.value;

    const firstPeriod = getPreviewPeriods()[0];

    previewPageState.periodId = firstPeriod?.id || "";
    previewPageState.classId = "all";
    previewPageState.halaqohId = "all";
    previewPageState.studentId = "";

    populatePreviewFilters();
    renderRaporPreview();
  });

  previewFilterPeriod?.addEventListener("change", (event) => {
    previewPageState.periodId = event.target.value;

    populatePreviewFilters();
    renderRaporPreview();
  });

  previewFilterClass?.addEventListener("change", (event) => {
    previewPageState.classId = event.target.value;
    previewPageState.halaqohId = "all";
    previewPageState.studentId = "";

    populatePreviewFilters();
    renderRaporPreview();
  });

  previewFilterHalaqoh?.addEventListener("change", (event) => {
    previewPageState.halaqohId = event.target.value;
    previewPageState.studentId = "";

    populatePreviewFilters();
    renderRaporPreview();
  });

  previewFilterStudent?.addEventListener("change", (event) => {
    previewPageState.studentId = event.target.value;
    renderRaporPreview();
  });

  previewPrevButton?.addEventListener("click", () => {
    movePreviewStudent(-1);
  });

  previewNextButton?.addEventListener("click", () => {
    movePreviewStudent(1);
  });

  previewPrintButton?.addEventListener("click", () => {
    window.print();
  });
}
