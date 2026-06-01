/* =========================================================
   PENGATURAN.JS
   Fungsi:
   - Mengisi pilihan tahun ajaran dan periode.
   - Mengisi form pengaturan dari DB.settings.
   - Menyimpan pengaturan ke Google Sheets SETTINGS.
   - Menjadi sumber default untuk input capaian dan preview.
========================================================= */

const DEFAULT_SETTINGS = {
  schoolName: "SMPIT Nur Hikmah",
  appName: "Rapor Al-Qur’an",
  schoolAddress: "Bekasi",
  adminEmail: "admin@nurhikmah.sch.id",

  academicYear: "2025/2026",
  activeAcademicYear: "2025/2026",
  activePeriodId: "",

  semesterLabel: "SEMESTER I",
  defaultMonth: "April-Juni",
  targetZiyadah: "10 halaman",
  targetMurojaah: "20 halaman",
  effectiveDays: 20,
  reportPlaceDate: "Bekasi, -",
};

const settingsState = {
  ...DEFAULT_SETTINGS,
};

/* =========================================================
   SETTINGS DATA
========================================================= */

function getSettingsFallbackValue(value, fallback) {
  if (value === undefined || value === null || value === "") {
    return fallback;
  }

  return value;
}

function normalizeSettingsFromDB() {
  const dbSettings = DB.settings || {};

  settingsState.schoolName = getSettingsFallbackValue(
    dbSettings.schoolName,
    DEFAULT_SETTINGS.schoolName,
  );

  settingsState.appName = getSettingsFallbackValue(
    dbSettings.appName,
    DEFAULT_SETTINGS.appName,
  );

  settingsState.schoolAddress = getSettingsFallbackValue(
    dbSettings.schoolAddress,
    DEFAULT_SETTINGS.schoolAddress,
  );

  settingsState.adminEmail = getSettingsFallbackValue(
    dbSettings.adminEmail,
    DEFAULT_SETTINGS.adminEmail,
  );

  settingsState.academicYear = getSettingsFallbackValue(
    dbSettings.academicYear || dbSettings.activeAcademicYear,
    DEFAULT_SETTINGS.academicYear,
  );

  settingsState.activeAcademicYear = settingsState.academicYear;

  settingsState.activePeriodId = getSettingsFallbackValue(
    dbSettings.activePeriodId,
    getActivePeriodId(),
  );

  settingsState.semesterLabel = getSettingsFallbackValue(
    dbSettings.semesterLabel || getSemesterLabelFromActivePeriod(),
    DEFAULT_SETTINGS.semesterLabel,
  );

  settingsState.defaultMonth = getSettingsFallbackValue(
    dbSettings.defaultMonth,
    DEFAULT_SETTINGS.defaultMonth,
  );

  settingsState.targetZiyadah = getSettingsFallbackValue(
    dbSettings.targetZiyadah || dbSettings.defaultZiyadahTarget,
    DEFAULT_SETTINGS.targetZiyadah,
  );

  settingsState.targetMurojaah = getSettingsFallbackValue(
    dbSettings.targetMurojaah || dbSettings.defaultMurojaahTarget,
    DEFAULT_SETTINGS.targetMurojaah,
  );

  settingsState.effectiveDays = Number(
    getSettingsFallbackValue(
      dbSettings.effectiveDays || dbSettings.defaultEffectiveDays,
      DEFAULT_SETTINGS.effectiveDays,
    ),
  );

  settingsState.reportPlaceDate = getSettingsFallbackValue(
    dbSettings.reportPlaceDate,
    DEFAULT_SETTINGS.reportPlaceDate,
  );
}

function getAppSettings() {
  return {
    ...settingsState,
    ...DB.settings,
  };
}

function getSemesterLabelFromActivePeriod() {
  const period = DB.periods.find((item) => {
    return item.id === settingsState.activePeriodId;
  });

  const semester = String(period?.semester || "").toLowerCase();

  if (semester.includes("ganjil")) return "SEMESTER I";
  if (semester.includes("genap")) return "SEMESTER II";

  return "";
}

/* =========================================================
   OPTIONS
========================================================= */

function getSettingsAcademicYears() {
  const years = DB.periods.map((period) => period.academicYear).filter(Boolean);

  const uniqueYears = [...new Set(years)];

  if (!uniqueYears.length) {
    return [
      {
        id: settingsState.academicYear,
        name: settingsState.academicYear,
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

function getSettingsPeriodsByYear() {
  return DB.periods.filter((period) => {
    return String(period.academicYear) === String(settingsState.academicYear);
  });
}

function populateSettingsSelects() {
  const academicYears = getSettingsAcademicYears();

  if (!settingsState.academicYear && academicYears.length) {
    settingsState.academicYear = academicYears[0].id;
    settingsState.activeAcademicYear = academicYears[0].id;
  }

  populateSelect("#settingAcademicYear", academicYears, {
    selectedValue: settingsState.academicYear,
  });

  const periods = getSettingsPeriodsByYear();

  const selectedPeriodStillExists = periods.some((period) => {
    return period.id === settingsState.activePeriodId;
  });

  if (!selectedPeriodStillExists && periods.length) {
    settingsState.activePeriodId = periods[0].id;
  }

  populateSelect("#settingActivePeriod", periods, {
    selectedValue: settingsState.activePeriodId,
  });
}

/* =========================================================
   FORM
========================================================= */

function setSettingInputValue(selector, value) {
  const element = getEl(selector);

  if (element) {
    element.value = value ?? "";
  }
}

function getSettingInputValue(selector) {
  return getEl(selector)?.value.trim() || "";
}

function fillSettingsForm() {
  setSettingInputValue("#settingSchoolName", settingsState.schoolName);
  setSettingInputValue("#settingAppName", settingsState.appName);
  setSettingInputValue("#settingSchoolAddress", settingsState.schoolAddress);
  setSettingInputValue("#settingAdminEmail", settingsState.adminEmail);

  setSettingInputValue("#settingAcademicYear", settingsState.academicYear);
  setSettingInputValue("#settingActivePeriod", settingsState.activePeriodId);
  setSettingInputValue("#settingSemesterLabel", settingsState.semesterLabel);
  setSettingInputValue("#settingTargetZiyadah", settingsState.targetZiyadah);
  setSettingInputValue("#settingTargetMurojaah", settingsState.targetMurojaah);
  setSettingInputValue("#settingEffectiveDays", settingsState.effectiveDays);
  setSettingInputValue(
    "#settingReportPlaceDate",
    settingsState.reportPlaceDate,
  );
}

function readSettingsForm() {
  settingsState.schoolName =
    getSettingInputValue("#settingSchoolName") || DEFAULT_SETTINGS.schoolName;

  settingsState.appName =
    getSettingInputValue("#settingAppName") || DEFAULT_SETTINGS.appName;

  settingsState.schoolAddress =
    getSettingInputValue("#settingSchoolAddress") ||
    DEFAULT_SETTINGS.schoolAddress;

  settingsState.adminEmail =
    getSettingInputValue("#settingAdminEmail") || DEFAULT_SETTINGS.adminEmail;

  settingsState.academicYear =
    getSettingInputValue("#settingAcademicYear") ||
    settingsState.academicYear ||
    DEFAULT_SETTINGS.academicYear;

  settingsState.activeAcademicYear = settingsState.academicYear;

  settingsState.activePeriodId =
    getSettingInputValue("#settingActivePeriod") ||
    settingsState.activePeriodId ||
    getActivePeriodId();

  settingsState.semesterLabel =
    getSettingInputValue("#settingSemesterLabel") ||
    getSemesterLabelFromActivePeriod() ||
    DEFAULT_SETTINGS.semesterLabel;

  const activePeriod = DB.periods.find((period) => {
    return period.id === settingsState.activePeriodId;
  });

  settingsState.defaultMonth =
    activePeriod?.month ||
    activePeriod?.name ||
    settingsState.defaultMonth ||
    DEFAULT_SETTINGS.defaultMonth;

  settingsState.targetZiyadah =
    getSettingInputValue("#settingTargetZiyadah") ||
    DEFAULT_SETTINGS.targetZiyadah;

  settingsState.targetMurojaah =
    getSettingInputValue("#settingTargetMurojaah") ||
    DEFAULT_SETTINGS.targetMurojaah;

  settingsState.effectiveDays =
    Number(getSettingInputValue("#settingEffectiveDays")) ||
    DEFAULT_SETTINGS.effectiveDays;

  settingsState.reportPlaceDate =
    getSettingInputValue("#settingReportPlaceDate") ||
    DEFAULT_SETTINGS.reportPlaceDate;
}

function buildSettingsPayload() {
  return {
    schoolName: settingsState.schoolName,
    appName: settingsState.appName,
    schoolAddress: settingsState.schoolAddress,
    adminEmail: settingsState.adminEmail,

    academicYear: settingsState.academicYear,
    activeAcademicYear: settingsState.activeAcademicYear,
    activePeriodId: settingsState.activePeriodId,

    semesterLabel: settingsState.semesterLabel,
    defaultMonth: settingsState.defaultMonth,
    targetZiyadah: settingsState.targetZiyadah,
    targetMurojaah: settingsState.targetMurojaah,
    effectiveDays: Number(settingsState.effectiveDays),
    reportPlaceDate: settingsState.reportPlaceDate,
  };
}

/* =========================================================
   SYNC PAGES
========================================================= */

function syncSettingsToPages() {
  DB.settings = {
    ...DB.settings,
    ...buildSettingsPayload(),
  };

  if (typeof dashboardState !== "undefined") {
    dashboardState.academicYear = settingsState.academicYear;
    dashboardState.periodId = settingsState.activePeriodId;
    dashboardState.classId = "all";
    dashboardState.halaqohId = "all";
  }

  if (typeof inputPageState !== "undefined") {
    inputPageState.academicYear = settingsState.academicYear;
    inputPageState.periodId = settingsState.activePeriodId;
    inputPageState.classId = "all";
    inputPageState.halaqohId = "all";
  }

  if (typeof previewPageState !== "undefined") {
    previewPageState.academicYear = settingsState.academicYear;
    previewPageState.periodId = settingsState.activePeriodId;
    previewPageState.classId = "all";
    previewPageState.halaqohId = "all";
    previewPageState.studentId = "";
  }

  if (typeof pdfPageState !== "undefined") {
    pdfPageState.academicYear = settingsState.academicYear;
    pdfPageState.periodId = settingsState.activePeriodId;
  }

  if (typeof classPageState !== "undefined") {
    classPageState.academicYear = settingsState.academicYear;
  }

  if (typeof refreshAllPageData === "function") {
    refreshAllPageData();
  }

  if (typeof updateDatabaseCacheFromCurrentDB === "function") {
    updateDatabaseCacheFromCurrentDB();
  }
}

/* =========================================================
   SAVE SETTINGS
========================================================= */

function validateSettingsPayload(payload) {
  const errors = [];

  if (!payload.schoolName) {
    errors.push("Nama sekolah wajib diisi.");
  }

  if (!payload.academicYear) {
    errors.push("Tahun ajaran aktif wajib dipilih.");
  }

  if (!payload.activePeriodId) {
    errors.push("Periode aktif wajib dipilih.");
  }

  if (!payload.targetZiyadah) {
    errors.push("Target ziyadah wajib diisi.");
  }

  if (!payload.targetMurojaah) {
    errors.push("Target murojaah wajib diisi.");
  }

  const effectiveDays = Number(payload.effectiveDays);

  if (!Number.isFinite(effectiveDays) || effectiveDays <= 0) {
    errors.push("Hari efektif harus lebih dari 0.");
  }

  if (!payload.reportPlaceDate) {
    errors.push("Tempat dan tanggal titimangsa wajib diisi.");
  }

  return {
    isValid: errors.length === 0,
    errors,
  };
}

async function handleSaveSettings() {
  readSettingsForm();

  const payload = buildSettingsPayload();
  const validation = validateSettingsPayload(payload);

  if (!validation.isValid) {
    Swal.fire({
      icon: "warning",
      title: "Pengaturan belum lengkap",
      html: `
        <div style="text-align:left">
          <ul>
            ${validation.errors
              .map((error) => `<li>${escapeHtml(error)}</li>`)
              .join("")}
          </ul>
        </div>
      `,
      confirmButtonText: "Perbaiki",
    });

    return;
  }

  try {
    Swal.fire({
      title: "Menyimpan pengaturan...",
      text: "Data sedang disimpan ke Google Sheets.",
      allowOutsideClick: false,
      didOpen: () => {
        Swal.showLoading();
      },
    });

    const savedSettings = await updateSettingsApi(payload);

    DB.settings = savedSettings || payload;

    normalizeSettingsFromDB();
    syncSettingsToPages();
    populateSettingsSelects();
    fillSettingsForm();

    Swal.fire({
      icon: "success",
      title: "Pengaturan Disimpan",
      text: "Pengaturan berhasil disimpan ke Google Sheets.",
      timer: 1500,
      showConfirmButton: false,
    });
  } catch (error) {
    Swal.fire({
      icon: "error",
      title: "Gagal menyimpan",
      text: error.message || "Pengaturan gagal disimpan ke Google Sheets.",
    });
  }
}

/* =========================================================
   INIT
========================================================= */

function initSettingsPage() {
  normalizeSettingsFromDB();
  populateSettingsSelects();
  fillSettingsForm();

  const settingAcademicYear = getEl("#settingAcademicYear");
  const settingActivePeriod = getEl("#settingActivePeriod");
  const saveSettingsButton = getEl("#saveSettingsButton");

  settingAcademicYear?.addEventListener("change", (event) => {
    settingsState.academicYear = event.target.value;
    settingsState.activeAcademicYear = event.target.value;

    const firstPeriod = getSettingsPeriodsByYear()[0];
    settingsState.activePeriodId = firstPeriod?.id || "";

    populateSettingsSelects();
    fillSettingsForm();
  });

  settingActivePeriod?.addEventListener("change", (event) => {
    settingsState.activePeriodId = event.target.value;

    const activePeriod = DB.periods.find((period) => {
      return period.id === settingsState.activePeriodId;
    });

    const semesterLabel = getSemesterLabelFromActivePeriod();

    if (semesterLabel) {
      settingsState.semesterLabel = semesterLabel;
    }

    settingsState.defaultMonth =
      activePeriod?.month || activePeriod?.name || settingsState.defaultMonth;

    fillSettingsForm();
  });

  saveSettingsButton?.addEventListener("click", handleSaveSettings);
}
