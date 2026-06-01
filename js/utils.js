/* =========================================================
   UTILS.JS
   Fungsi bantuan umum yang dipakai banyak file.
========================================================= */

const DB = window.RAPOR_DATA || {
  settings: {},
  periods: [],
  classes: [],
  halaqoh: [],
  students: [],
  progress: [],
  generateLog: [],
  users: [],
};

function getEl(selector) {
  return document.querySelector(selector);
}

function setText(selector, value) {
  const element = getEl(selector);

  if (element) {
    element.textContent = value;
  }
}

function createOption(value, label) {
  const option = document.createElement("option");
  option.value = value;
  option.textContent = label;
  return option;
}

function populateSelect(selector, items, config = {}) {
  const select = getEl(selector);

  if (!select) return;

  const { includeAll = false, allLabel = "Semua", selectedValue = "" } = config;

  select.innerHTML = "";

  if (includeAll) {
    select.appendChild(createOption("all", allLabel));
  }

  items.forEach((item) => {
    if (typeof item === "string" || typeof item === "number") {
      select.appendChild(createOption(item, item));
      return;
    }

    const label =
      item.name || item.month || item.label || item.academicYear || item.id;

    select.appendChild(createOption(item.id, label));
  });

  if (selectedValue) {
    select.value = selectedValue;
  }
}

function wait(ms) {
  return new Promise((resolve) => {
    setTimeout(resolve, ms);
  });
}

// Fungsi menampilkan teks hari di poin kedisiplinan
function formatHari(value) {
  if (value === null || value === undefined || value === "") {
    return "-";
  }

  const text = String(value).trim();

  if (!text) return "-";

  if (text.toLowerCase().includes("hari")) {
    return text;
  }

  return `${text} hari`;
}

function showComingSoon(featureName = "Fitur") {
  showInfo(
    `${featureName} akan tersedia setelah backend Google Sheets aktif.`,
    "Fitur Belum Aktif",
  );
}

function initComingSoonButtons() {
  document.addEventListener("click", (event) => {
    const button = event.target.closest("[data-coming-soon]");

    if (!button) return;

    const featureName = button.dataset.comingSoon || "Fitur";
    showComingSoon(featureName);
  });
}

function showAlert(options = {}) {
  if (typeof Swal === "undefined") {
    alert(options.text || options.title || "Informasi");
    return;
  }

  Swal.fire({
    icon: options.icon || "info",
    title: options.title || "Informasi",
    text: options.text || "",
    confirmButtonText: options.confirmButtonText || "OK",
    timer: options.timer || undefined,
    timerProgressBar: Boolean(options.timer),
  });
}

function showSuccess(message, title = "Berhasil") {
  showAlert({
    icon: "success",
    title,
    text: message,
  });
}

function showInfo(message, title = "Informasi") {
  showAlert({
    icon: "info",
    title,
    text: message,
  });
}

function showWarning(message, title = "Perhatian") {
  showAlert({
    icon: "warning",
    title,
    text: message,
  });
}

function showError(message, title = "Terjadi Kesalahan") {
  showAlert({
    icon: "error",
    title,
    text: message,
  });
}

/* =========================================================
   DATA HELPERS
   Helper normalisasi data agar frontend cocok dengan data lama
   dan data backend Google Sheets.
========================================================= */

function getSettingValue(key, fallback = "") {
  if (!DB.settings) return fallback;

  const value = DB.settings[key];

  if (value === undefined || value === null || value === "") {
    return fallback;
  }

  return value;
}

function isActiveStatus(value) {
  const status = String(value || "")
    .trim()
    .toLowerCase();

  return status === "aktif" || status === "active" || status === "true";
}

function isActiveStudent(student) {
  return isActiveStatus(student?.status);
}

function getStudentStatusLabel(student) {
  return isActiveStudent(student) ? "Aktif" : "Tidak Aktif";
}

function isActivePeriod(period) {
  return isActiveStatus(period?.status) || period?.isActive === true;
}

function getPeriodLabel(period) {
  if (!period) return "-";

  return (
    period.name ||
    period.month ||
    [period.semester, period.academicYear].filter(Boolean).join(" ") ||
    period.id ||
    "-"
  );
}

function getClassLabel(classItem) {
  return classItem?.name || classItem?.id || "-";
}

function getHalaqohLabel(halaqoh) {
  return halaqoh?.name || halaqoh?.id || "-";
}

function getActiveAcademicYear() {
  return getSettingValue(
    "activeAcademicYear",
    getSettingValue(
      "academicYear",
      DB.periods?.[0]?.academicYear || "2025/2026",
    ),
  );
}

function getActivePeriodId() {
  const settingPeriodId = getSettingValue("activePeriodId", "");

  if (settingPeriodId) return settingPeriodId;

  const activePeriod = DB.periods.find((period) => isActivePeriod(period));

  return activePeriod?.id || DB.periods?.[0]?.id || "";
}

function getClassesByYear(academicYear = getActiveAcademicYear()) {
  return DB.classes.filter((classItem) => {
    return !classItem.academicYear || classItem.academicYear === academicYear;
  });
}

function getPeriodsByYear(academicYear = getActiveAcademicYear()) {
  return DB.periods.filter((period) => {
    return !period.academicYear || period.academicYear === academicYear;
  });
}

function getHalaqohByClassId(classId = "all") {
  if (classId === "all") {
    return DB.halaqoh;
  }

  return DB.halaqoh.filter((halaqoh) => {
    return halaqoh.classId === classId;
  });
}

function getStudentClass(student) {
  return DB.classes.find((classItem) => {
    return classItem.id === student?.classId;
  });
}

function getStudentHalaqoh(student) {
  return DB.halaqoh.find((halaqoh) => {
    return halaqoh.id === student?.halaqohId;
  });
}

function getProgressByStudentAndPeriod(studentId, periodId) {
  return DB.progress.find((progress) => {
    return progress.studentId === studentId && progress.periodId === periodId;
  });
}

function isAttentionProgress(progress) {
  if (!progress) return true;

  return (
    progress.hafalanStatus === "Perlu Perhatian" ||
    progress.murojaahStatus === "Perlu Perhatian" ||
    progress.disciplineStatus === "Perlu Perhatian" ||
    progress.status === "Perlu Perhatian"
  );
}

function isCompletedProgress(progress) {
  if (!progress) return false;

  if (progress.status === "Tuntas") {
    return true;
  }

  return (
    progress.hafalanStatus === "Tuntas" &&
    progress.murojaahStatus === "Tuntas" &&
    progress.disciplineStatus === "Tuntas"
  );
}

function filterStudentsByCurrentUser(students = DB.students) {
  if (typeof getCurrentUser !== "function") {
    return students;
  }

  const user = getCurrentUser();

  if (!user) return [];

  if (user.role === "admin") {
    return students;
  }

  if (user.role === "guru" && user.halaqohId) {
    return students.filter((student) => {
      return student.halaqohId === user.halaqohId;
    });
  }

  return [];
}

function getVisibleStudents() {
  return filterStudentsByCurrentUser(DB.students).filter((student) => {
    return isActiveStudent(student);
  });
}

/* =========================================================
   RICH TEXT HELPERS
   Dipakai untuk catatan rapor.
========================================================= */

function sanitizeRichText(value = "") {
  const wrapper = document.createElement("div");
  wrapper.innerHTML = value || "";

  const allowedTags = [
    "P",
    "BR",
    "STRONG",
    "B",
    "EM",
    "I",
    "U",
    "UL",
    "OL",
    "LI",
    "DIV",
    "SPAN",
  ];

  const forbiddenTags = wrapper.querySelectorAll(
    "script, iframe, object, embed, img, style, link",
  );

  forbiddenTags.forEach((tag) => {
    tag.remove();
  });

  const allElements = wrapper.querySelectorAll("*");

  allElements.forEach((element) => {
    if (!allowedTags.includes(element.tagName)) {
      element.replaceWith(document.createTextNode(element.textContent));
      return;
    }

    [...element.attributes].forEach((attr) => {
      element.removeAttribute(attr.name);
    });
  });

  return wrapper.innerHTML;
}

function setRichText(selector, value) {
  const element = getEl(selector);

  if (!element) return;

  element.innerHTML = sanitizeRichText(value || "-");
}

function richTextToPlainText(value = "") {
  const wrapper = document.createElement("div");

  wrapper.innerHTML = sanitizeRichText(value || "");

  return wrapper.textContent.trim();
}

function plainTextToRichText(value = "") {
  const text = String(value || "").trim();

  if (!text) return "";

  if (text.includes("<") && text.includes(">")) {
    return sanitizeRichText(text);
  }

  return text
    .split("\n")
    .map((line) => `<p>${escapeHtml(line)}</p>`)
    .join("");
}

function escapeHtml(value = "") {
  return String(value)
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#039;");
}

/* =========================================================
   SHEET URL HELPERS
   Dipakai untuk membuka link Google Sheets dari SETTINGS.
========================================================= */

function openSheetUrl(settingKey, fallbackMessage) {
  const url = getSettingValue(settingKey, "");

  if (!url) {
    showWarning(
      fallbackMessage || "Link Google Sheets belum diatur di SETTINGS.",
      "Link Belum Tersedia",
    );
    return;
  }

  window.open(url, "_blank", "noopener,noreferrer");
}
