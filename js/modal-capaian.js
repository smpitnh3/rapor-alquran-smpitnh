/* =========================================================
   MODAL-CAPAIAN.JS
   Fungsi:
   - Membuka modal input/edit capaian siswa.
   - Mengisi form berdasarkan data siswa dan progress.
   - Mengambil default dari Pengaturan/Periode aktif.
   - Menyimpan progress ke backend dan DB frontend.
   - Refresh halaman terkait setelah data tersimpan.
========================================================= */

const progressModalState = {
  studentId: null,
  periodId: null,
};

let richTextEditorInitialized = false;

/* =========================================================
   HELPER
========================================================= */

function getCurrentInputPeriodId() {
  if (typeof inputPageState !== "undefined" && inputPageState.periodId) {
    return inputPageState.periodId;
  }

  return getActivePeriodId();
}

function findProgressIndex(studentId, periodId) {
  return DB.progress.findIndex((progress) => {
    return progress.studentId === studentId && progress.periodId === periodId;
  });
}

function getStudentMeta(studentId) {
  const student = DB.students.find((item) => {
    return item.id === studentId;
  });

  const classItem = getStudentClass(student);
  const halaqoh = getStudentHalaqoh(student);

  return {
    student,
    classItem,
    halaqoh,
  };
}

function setInputValue(selector, value) {
  const element = getEl(selector);

  if (element) {
    element.value = value ?? "";
  }
}

function getInputValue(selector, fallback = "") {
  const value = getEl(selector)?.value?.trim();

  if (value === undefined || value === null || value === "") {
    return fallback;
  }

  return value;
}

function getProgressFormNumber(selector, fallback = 0) {
  const value = getEl(selector)?.value;

  if (value === undefined || value === null || value === "") {
    return fallback;
  }

  const numberValue = Number(value);

  return Number.isFinite(numberValue) ? numberValue : fallback;
}

function createProgressId(studentId, periodId) {
  return `progress_${studentId}_${periodId}`;
}

function getNumberOnly(value, fallback = "") {
  const number = Number.parseInt(String(value || "").replace(/[^\d]/g, ""), 10);

  return Number.isNaN(number) ? fallback : number;
}

function getSafeTodayIndonesianDate() {
  if (typeof getTodayIndonesianDate === "function") {
    return getTodayIndonesianDate();
  }

  return "-";
}

function canCurrentUserEditStudent(student) {
  const user = typeof getCurrentUser === "function" ? getCurrentUser() : null;

  if (!user) return false;

  if (user.role === "admin") return true;

  if (user.role === "guru") {
    return student?.halaqohId === user.halaqohId;
  }

  return false;
}

function getModalDefaultMonth(progress, period, appSettings) {
  return (
    progress?.month ||
    period?.month ||
    period?.name ||
    appSettings.defaultMonth ||
    "April-Juni"
  );
}

function getModalDefaultZiyadah(progress, appSettings) {
  return (
    progress?.targetZiyadah ||
    progress?.ziyadahTarget ||
    appSettings.targetZiyadah ||
    appSettings.defaultZiyadahTarget ||
    "10 halaman"
  );
}

function getModalDefaultMurojaah(progress, appSettings) {
  return (
    progress?.targetMurojaah ||
    progress?.murojaahTarget ||
    appSettings.targetMurojaah ||
    appSettings.defaultMurojaahTarget ||
    "20 halaman"
  );
}

function getModalDefaultEffectiveDays(progress, appSettings) {
  return getNumberOnly(
    progress?.effectiveDays ||
      appSettings.effectiveDays ||
      appSettings.defaultEffectiveDays,
    20,
  );
}

/* =========================================================
   MODAL OPEN / CLOSE
========================================================= */

function openProgressModal(studentId) {
  const modalOverlay = getEl("#progressModalOverlay");
  const modalStudentInfo = getEl("#progressModalStudentInfo");

  if (!modalOverlay) return;

  const periodId = getCurrentInputPeriodId();
  const period = DB.periods.find((item) => {
    return item.id === periodId;
  });

  const { student, classItem, halaqoh } = getStudentMeta(studentId);

  if (!student) {
    showWarning("Data siswa tidak ditemukan.");
    return;
  }

  if (!canCurrentUserEditStudent(student)) {
    showWarning("Kamu tidak memiliki akses untuk mengedit capaian siswa ini.");
    return;
  }

  if (!periodId) {
    showWarning("Periode belum dipilih.");
    return;
  }

  const progress = getProgressByStudentAndPeriod(studentId, periodId);
  const appSettings = getAppSettings();

  const defaultEffectiveDays = getModalDefaultEffectiveDays(
    progress,
    appSettings,
  );

  progressModalState.studentId = studentId;
  progressModalState.periodId = periodId;

  if (modalStudentInfo) {
    modalStudentInfo.textContent = `${student.name} • ${getClassLabel(
      classItem,
    )} • ${getHalaqohLabel(halaqoh)}`;
  }

  setInputValue("#progressStudentId", studentId);

  setInputValue(
    "#progressMonth",
    getModalDefaultMonth(progress, period, appSettings),
  );

  setInputValue(
    "#progressTargetZiyadah",
    getModalDefaultZiyadah(progress, appSettings),
  );

  setInputValue(
    "#progressTargetMurojaah",
    getModalDefaultMurojaah(progress, appSettings),
  );

  setInputValue("#progressEffectiveDays", defaultEffectiveDays);

  setInputValue("#progressHafalanStart", progress?.hafalanStart || "");
  setInputValue("#progressHafalanLast", progress?.hafalanLast || "");
  setInputValue("#progressTotalHafalan", progress?.totalHafalan || "");
  setInputValue("#progressHafalanStatus", progress?.hafalanStatus || "Proses");

  setInputValue("#progressMurojaahStart", progress?.murojaahStart || "");
  setInputValue("#progressMurojaahLast", progress?.murojaahLast || "");
  setInputValue("#progressTotalMurojaah", progress?.totalMurojaah || "");
  setInputValue(
    "#progressMurojaahStatus",
    progress?.murojaahStatus || "Proses",
  );

  setInputValue(
    "#progressDisciplineTarget",
    progress?.disciplineTarget ?? defaultEffectiveDays,
  );

  setInputValue(
    "#progressDisciplineAchieved",
    progress?.disciplineAchieved ?? "",
  );

  setInputValue(
    "#progressDisciplineStatus",
    progress?.disciplineStatus || "Proses",
  );

  setRichEditorValue("#progressNoteHafalan", progress?.noteHafalan || "");
  setRichEditorValue("#progressNoteTahsin", progress?.noteTahsin || "");
  setRichEditorValue("#progressNoteDiscipline", progress?.noteDiscipline || "");

  setInputValue(
    "#progressHomeroomTeacher",
    progress?.homeroomTeacher || classItem?.homeroomTeacher || "",
  );

  setInputValue(
    "#progressQuranTeacher",
    progress?.quranTeacher || halaqoh?.teacherName || "",
  );

  setInputValue(
    "#progressReportPlaceDate",
    progress?.reportPlaceDate ||
      appSettings.reportPlaceDate ||
      `Bekasi, ${getSafeTodayIndonesianDate()}`,
  );

  modalOverlay.classList.add("is-open");
  modalOverlay.setAttribute("aria-hidden", "false");
  document.body.classList.add("modal-open");
}

function closeProgressModal() {
  const modalOverlay = getEl("#progressModalOverlay");

  if (!modalOverlay) return;

  modalOverlay.classList.remove("is-open");
  modalOverlay.setAttribute("aria-hidden", "true");
  document.body.classList.remove("modal-open");

  progressModalState.studentId = null;
  progressModalState.periodId = null;
}

/* =========================================================
   PAYLOAD
========================================================= */

function buildProgressPayload() {
  const studentId = progressModalState.studentId;
  const periodId = progressModalState.periodId || getCurrentInputPeriodId();

  const progressIndex = findProgressIndex(studentId, periodId);
  const oldProgress = progressIndex >= 0 ? DB.progress[progressIndex] : null;
  const appSettings = getAppSettings();

  const period = DB.periods.find((item) => {
    return item.id === periodId;
  });

  const { classItem, halaqoh } = getStudentMeta(studentId);

  const now = new Date().toISOString();

  return {
    id: oldProgress?.id || createProgressId(studentId, periodId),

    studentId,
    periodId,

    month:
      getInputValue("#progressMonth") ||
      period?.month ||
      period?.name ||
      appSettings.defaultMonth ||
      "April-Juni",

    targetZiyadah:
      getInputValue("#progressTargetZiyadah") ||
      appSettings.targetZiyadah ||
      appSettings.defaultZiyadahTarget ||
      "10 halaman",

    targetMurojaah:
      getInputValue("#progressTargetMurojaah") ||
      appSettings.targetMurojaah ||
      appSettings.defaultMurojaahTarget ||
      "20 halaman",

    effectiveDays: getProgressFormNumber(
      "#progressEffectiveDays",
      getNumberOnly(
        appSettings.effectiveDays || appSettings.defaultEffectiveDays,
        20,
      ),
    ),

    hafalanStart: getInputValue("#progressHafalanStart", "-"),
    hafalanLast: getInputValue("#progressHafalanLast", "-"),
    totalHafalan: getInputValue("#progressTotalHafalan", "-"),
    hafalanStatus: getEl("#progressHafalanStatus")?.value || "Proses",

    murojaahStart: getInputValue("#progressMurojaahStart", "-"),
    murojaahLast: getInputValue("#progressMurojaahLast", "-"),
    totalMurojaah: getInputValue("#progressTotalMurojaah", "-"),
    murojaahStatus: getEl("#progressMurojaahStatus")?.value || "Proses",

    disciplineTarget: getProgressFormNumber("#progressDisciplineTarget", 0),
    disciplineAchieved: getProgressFormNumber("#progressDisciplineAchieved", 0),
    disciplineStatus: getEl("#progressDisciplineStatus")?.value || "Proses",

    noteHafalan:
      getRichEditorValue("#progressNoteHafalan") ||
      "Catatan hafalan belum diisi.",

    noteTahsin:
      getRichEditorValue("#progressNoteTahsin") ||
      "Catatan tahsin belum diisi.",

    noteDiscipline:
      getRichEditorValue("#progressNoteDiscipline") ||
      "Catatan kedisiplinan belum diisi.",

    homeroomTeacher:
      getInputValue("#progressHomeroomTeacher") ||
      classItem?.homeroomTeacher ||
      "Wali Kelas",

    quranTeacher:
      getInputValue("#progressQuranTeacher") ||
      halaqoh?.teacherName ||
      "Guru Al-Qur’an",

    reportPlaceDate:
      getInputValue("#progressReportPlaceDate") ||
      appSettings.reportPlaceDate ||
      "Bekasi, -",

    updatedAt: now,
    createdAt: oldProgress?.createdAt || now,
  };
}

function upsertProgressLocal(payload) {
  const progressIndex = findProgressIndex(payload.studentId, payload.periodId);

  if (progressIndex >= 0) {
    DB.progress[progressIndex] = payload;
    return;
  }

  DB.progress.push(payload);
}

function refreshAfterProgressSaved() {
  if (typeof renderInputProgressTable === "function") {
    renderInputProgressTable();
  }

  if (typeof renderDashboardData === "function") {
    renderDashboardData();
  }

  if (typeof renderRaporPreview === "function") {
    renderRaporPreview();
  }

  if (typeof updatePdfEstimate === "function") {
    updatePdfEstimate();
  }

  if (typeof updateDatabaseCacheFromCurrentDB === "function") {
    updateDatabaseCacheFromCurrentDB();
  }
}

/* =========================================================
   VALIDATION
========================================================= */

function validateProgressPayload(payload) {
  const errors = [];

  if (!payload.studentId) {
    errors.push("Data siswa tidak valid.");
  }

  if (!payload.periodId) {
    errors.push("Periode belum dipilih.");
  }

  if (!payload.month) {
    errors.push("Bulan laporan wajib diisi.");
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

  if (!payload.hafalanStatus) {
    errors.push("Status hafalan wajib dipilih.");
  }

  if (!payload.murojaahStatus) {
    errors.push("Status murojaah wajib dipilih.");
  }

  if (!payload.disciplineStatus) {
    errors.push("Status kedisiplinan wajib dipilih.");
  }

  const disciplineTarget = Number(payload.disciplineTarget);
  const disciplineAchieved = Number(payload.disciplineAchieved);

  if (!Number.isFinite(disciplineTarget) || disciplineTarget < 0) {
    errors.push("Target kedisiplinan harus berupa angka 0 atau lebih.");
  }

  if (!Number.isFinite(disciplineAchieved) || disciplineAchieved < 0) {
    errors.push("Capaian kedisiplinan harus berupa angka 0 atau lebih.");
  }

  if (
    Number.isFinite(disciplineTarget) &&
    Number.isFinite(disciplineAchieved) &&
    disciplineAchieved > disciplineTarget
  ) {
    errors.push("Capaian kedisiplinan tidak boleh lebih besar dari target.");
  }

  return {
    isValid: errors.length === 0,
    errors,
  };
}

/* =========================================================
   SAVE FORM
========================================================= */

async function saveProgressForm(event) {
  event.preventDefault();

  const studentId = progressModalState.studentId;
  const periodId = progressModalState.periodId || getCurrentInputPeriodId();

  if (!studentId || !periodId) {
    showWarning("Siswa atau periode belum valid.");
    return;
  }

  const { student } = getStudentMeta(studentId);

  if (!canCurrentUserEditStudent(student)) {
    showWarning("Kamu tidak memiliki akses untuk menyimpan capaian siswa ini.");
    return;
  }

  const payload = buildProgressPayload();
  const validation = validateProgressPayload(payload);

  if (!validation.isValid) {
    Swal.fire({
      icon: "warning",
      title: "Data belum valid",
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
      title: "Menyimpan capaian...",
      text: "Data sedang disimpan ke Google Sheets.",
      allowOutsideClick: false,
      didOpen: () => {
        Swal.showLoading();
      },
    });

    const savedProgress = await saveProgressApi(payload);

    upsertProgressLocal(savedProgress || payload);

    refreshAfterProgressSaved();
    closeProgressModal();

    Swal.fire({
      icon: "success",
      title: "Capaian Disimpan",
      text: "Capaian siswa berhasil disimpan ke Google Sheets.",
      timer: 1500,
      showConfirmButton: false,
    });
  } catch (error) {
    Swal.fire({
      icon: "error",
      title: "Gagal menyimpan",
      text: error.message || "Data gagal disimpan ke Google Sheets.",
    });
  }
}

/* =========================================================
   RICH TEXT EDITOR
========================================================= */

function setRichEditorValue(selector, value) {
  const editor = getEl(selector);

  if (!editor) return;

  editor.innerHTML = sanitizeRichText(plainTextToRichText(value || ""));
}

function getRichEditorValue(selector, fallback = "") {
  const editor = getEl(selector);

  if (!editor) return fallback;

  const html = sanitizeRichText(editor.innerHTML || "");

  if (!html || html === "<br>") {
    return fallback;
  }

  return html;
}

function initRichTextEditors() {
  if (richTextEditorInitialized) return;

  richTextEditorInitialized = true;

  document.addEventListener("click", (event) => {
    const button = event.target.closest("[data-rich-command]");

    if (!button) return;

    event.preventDefault();

    const command = button.dataset.richCommand;
    const editorWrapper = button.closest(".rich-editor");
    const editor = editorWrapper?.querySelector(".rich-editor-area");

    if (!editor) return;

    editor.focus();
    document.execCommand(command, false, null);
  });

  document.addEventListener("paste", (event) => {
    const editor = event.target.closest(".rich-editor-area");

    if (!editor) return;

    event.preventDefault();

    const text = event.clipboardData?.getData("text/plain") || "";

    document.execCommand("insertText", false, text);
  });
}

/* =========================================================
   INIT
========================================================= */

function initProgressModal() {
  const modalOverlay = getEl("#progressModalOverlay");
  const modalClose = getEl("#progressModalClose");
  const modalCancel = getEl("#progressModalCancel");
  const progressForm = getEl("#progressForm");
  const inputProgressTableBody = getEl("#inputProgressTableBody");

  initRichTextEditors();

  inputProgressTableBody?.addEventListener("click", (event) => {
    const button = event.target.closest("[data-edit-progress]");

    if (!button) return;

    const studentId = button.dataset.editProgress;
    openProgressModal(studentId);
  });

  modalClose?.addEventListener("click", closeProgressModal);
  modalCancel?.addEventListener("click", closeProgressModal);
  progressForm?.addEventListener("submit", saveProgressForm);

  modalOverlay?.addEventListener("click", (event) => {
    if (event.target === modalOverlay) {
      closeProgressModal();
    }
  });

  document.addEventListener("keydown", (event) => {
    if (event.key === "Escape") {
      closeProgressModal();
    }
  });
}
