/* =========================================================
   GENERATE-FILE.JS
   Fungsi:
   - Menyiapkan UI generate PDF / Excel.
   - Generate file per siswa, halaqoh, atau kelas.
   - Menampilkan estimasi jumlah file.
   - Menampilkan riwayat generate dari Google Sheets.
   - Mendukung tahun ajaran, periode, dan role admin/guru.
========================================================= */

const pdfPageState = {
  academicYear: getActiveAcademicYear(),
  periodId: getActivePeriodId(),
  mode: "student",
  fileType: "pdf",
  outputType: "individual",
  studentId: "",
  halaqohId: "",
  classId: "",
  isInitialized: false,
};

let isPdfGenerating = false;

/* =========================================================
   STATE / USER
========================================================= */

function getPdfCurrentUser() {
  return typeof getCurrentUser === "function" ? getCurrentUser() : null;
}

function resetPdfPageState() {
  pdfPageState.academicYear = getActiveAcademicYear();
  pdfPageState.periodId = getActivePeriodId();
  pdfPageState.mode = "student";
  pdfPageState.fileType = "pdf";
  pdfPageState.outputType = "individual";
  pdfPageState.studentId = "";
  pdfPageState.halaqohId = "";
  pdfPageState.classId = "";
  pdfPageState.isInitialized = false;
}

/* =========================================================
   OPTIONS
========================================================= */

function getPdfAcademicYears() {
  const years = DB.periods.map((period) => period.academicYear).filter(Boolean);

  const uniqueYears = [...new Set(years)];

  if (!uniqueYears.length) {
    return [
      {
        id: pdfPageState.academicYear,
        name: pdfPageState.academicYear,
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

function getPdfPeriods() {
  return getPeriodsByYear(pdfPageState.academicYear);
}

function getPdfClasses() {
  let classes = getClassesByYear(pdfPageState.academicYear);
  const currentUser = getPdfCurrentUser();

  if (currentUser?.role === "guru" && currentUser.classId) {
    classes = classes.filter((classItem) => {
      return classItem.id === currentUser.classId;
    });
  }

  return classes;
}

function getPdfHalaqohOptions() {
  const classes = getPdfClasses();
  const classIds = classes.map((classItem) => classItem.id);

  let halaqohList = DB.halaqoh.filter((halaqoh) => {
    return classIds.includes(halaqoh.classId);
  });

  if (pdfPageState.classId) {
    halaqohList = halaqohList.filter((halaqoh) => {
      return halaqoh.classId === pdfPageState.classId;
    });
  }

  const currentUser = getPdfCurrentUser();

  if (currentUser?.role === "guru" && currentUser.halaqohId) {
    halaqohList = halaqohList.filter((halaqoh) => {
      return halaqoh.id === currentUser.halaqohId;
    });
  }

  return halaqohList;
}

function getPdfStudents() {
  const allowedStudents = filterStudentsByCurrentUser(DB.students);

  return allowedStudents.filter((student) => {
    const classItem = getStudentClass(student);

    const matchAcademicYear =
      !classItem?.academicYear ||
      classItem.academicYear === pdfPageState.academicYear;

    return isActiveStudent(student) && matchAcademicYear;
  });
}

/* =========================================================
   ROLE DEFAULT
========================================================= */

function applyPdfPageRoleDefault() {
  const currentUser = getPdfCurrentUser();

  const yearSelect = getEl("#pdfFilterYear");
  const classSelect = getEl("#pdfFilterClass");
  const halaqohSelect = getEl("#pdfFilterHalaqoh");

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
    pdfPageState.classId = currentUser.classId;
  }

  if (currentUser.halaqohId) {
    pdfPageState.halaqohId = currentUser.halaqohId;
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
   SELECTED TARGET
========================================================= */

function getPdfSelectedStudents() {
  const students = getPdfStudents();

  if (pdfPageState.mode === "student") {
    return students.filter((student) => {
      return student.id === pdfPageState.studentId;
    });
  }

  if (pdfPageState.mode === "halaqoh") {
    return students.filter((student) => {
      return student.halaqohId === pdfPageState.halaqohId;
    });
  }

  if (pdfPageState.mode === "class") {
    return students.filter((student) => {
      return student.classId === pdfPageState.classId;
    });
  }

  return [];
}

function getPdfTargetLabel() {
  if (pdfPageState.mode === "student") {
    const student = DB.students.find((item) => {
      return item.id === pdfPageState.studentId;
    });

    return student?.name || "-";
  }

  if (pdfPageState.mode === "halaqoh") {
    const halaqoh = DB.halaqoh.find((item) => {
      return item.id === pdfPageState.halaqohId;
    });

    return getHalaqohLabel(halaqoh);
  }

  if (pdfPageState.mode === "class") {
    const classItem = DB.classes.find((item) => {
      return item.id === pdfPageState.classId;
    });

    return getClassLabel(classItem);
  }

  return "-";
}

function getPdfTargetId() {
  if (pdfPageState.mode === "student") return pdfPageState.studentId;
  if (pdfPageState.mode === "halaqoh") return pdfPageState.halaqohId;
  if (pdfPageState.mode === "class") return pdfPageState.classId;

  return "";
}

/* =========================================================
   LABELS
========================================================= */

function getPdfModeLabel() {
  if (pdfPageState.mode === "student") return "Satu Siswa";
  if (pdfPageState.mode === "halaqoh") return "Satu Halaqoh";
  if (pdfPageState.mode === "class") return "Satu Kelas";

  return "-";
}

function getPdfFileTypeLabel() {
  if (pdfPageState.fileType === "pdf") return "PDF";
  if (pdfPageState.fileType === "excel") return "Excel Rekap";

  return "-";
}

function getPdfOutputTypeLabel() {
  if (pdfPageState.fileType === "excel") {
    return "Rekap Data";
  }

  if (pdfPageState.outputType === "individual") {
    return "PDF Per Siswa";
  }

  if (pdfPageState.outputType === "combined") {
    return "PDF Gabungan";
  }

  return "-";
}

function getGenerateButtonLabel() {
  return pdfPageState.fileType === "excel" ? "Generate Excel" : "Generate PDF";
}

function getGenerateActionLabel() {
  return pdfPageState.fileType === "excel" ? "Excel" : "PDF";
}

function getGeneratedFileCount() {
  const selectedStudents = getPdfSelectedStudents();

  if (pdfPageState.fileType === "excel") {
    return selectedStudents.length ? 1 : 0;
  }

  if (pdfPageState.outputType === "combined") {
    return selectedStudents.length ? 1 : 0;
  }

  return selectedStudents.length;
}

/* =========================================================
   GENERATE LOG HELPERS
========================================================= */

function getCurrentGenerateUserName() {
  const user = getPdfCurrentUser();

  return user?.name || user?.email || "system";
}

function getCurrentGeneratePeriod() {
  return DB.periods.find((period) => {
    return period.id === pdfPageState.periodId;
  });
}

function sanitizeFileName(value = "") {
  return String(value || "file")
    .trim()
    .replace(/[\\/:*?"<>|]/g, "")
    .replace(/\s+/g, "_");
}

function buildGenerateFileName() {
  const period = getCurrentGeneratePeriod();
  const periodLabel = sanitizeFileName(getPeriodLabel(period));
  const targetLabel = sanitizeFileName(getPdfTargetLabel());
  const fileExtension = pdfPageState.fileType === "excel" ? "xlsx" : "pdf";

  return `Rapor_${targetLabel}_${periodLabel}.${fileExtension}`;
}

function buildGenerateLogPayload(fileCount, selectedStudents, fileName = "") {
  const period = getCurrentGeneratePeriod();
  const now = new Date().toISOString();

  return {
    id: `gen_${Date.now()}`,
    periodId: pdfPageState.periodId,
    academicYear: pdfPageState.academicYear || period?.academicYear || "",
    generateType: pdfPageState.mode,
    fileType: pdfPageState.fileType,
    outputType: getPdfOutputTypeLabel(),
    targetType: pdfPageState.mode,
    targetId: getPdfTargetId(),
    targetName: getPdfTargetLabel(),
    totalStudents: selectedStudents.length,
    totalFiles: fileCount,
    fileName: fileName || buildGenerateFileName(),
    fileUrl: "",
    status: "success",
    message: "File berhasil dibuat dan diunduh.",
    createdBy: getCurrentGenerateUserName(),
    createdAt: now,
  };
}

function formatGenerateLogTime(value) {
  if (!value) return "-";

  const date = new Date(value);

  if (Number.isNaN(date.getTime())) {
    return value;
  }

  return new Intl.DateTimeFormat("id-ID", {
    dateStyle: "medium",
    timeStyle: "short",
  }).format(date);
}

function getGenerateLogStatusLabel(status) {
  if (status === "success") return "Berhasil";
  if (status === "simulation_success") return "Simulasi Berhasil";
  if (status === "failed") return "Gagal";
  if (status === "process") return "Proses";

  return status || "-";
}

function getGenerateLogStatusClass(status) {
  if (status === "success" || status === "simulation_success") return "success";
  if (status === "failed") return "danger";
  if (status === "process") return "warning";

  return "warning";
}

function getFileTypeFromGenerateType(generateType) {
  const type = String(generateType || "").toLowerCase();

  if (type.includes("excel")) return "excel";
  if (type.includes("pdf")) return "pdf";

  return "-";
}

/* =========================================================
   UI
========================================================= */

function updatePdfVisibleFields() {
  const studentField = getEl("#pdfStudentField");
  const halaqohField = getEl("#pdfHalaqohField");
  const classField = getEl("#pdfClassField");
  const outputTypeField = getEl("#pdfOutputTypeField");

  if (studentField) {
    studentField.style.display =
      pdfPageState.mode === "student" ? "block" : "none";
  }

  if (halaqohField) {
    halaqohField.style.display =
      pdfPageState.mode === "halaqoh" ? "block" : "none";
  }

  if (classField) {
    classField.style.display = pdfPageState.mode === "class" ? "block" : "none";
  }

  if (outputTypeField) {
    outputTypeField.style.display =
      pdfPageState.fileType === "pdf" ? "block" : "none";
  }
}

function syncPdfStateFromSettings() {
  if (!pdfPageState.isInitialized) {
    pdfPageState.academicYear = getActiveAcademicYear();
    pdfPageState.periodId = getActivePeriodId();
    pdfPageState.isInitialized = true;
  }

  const academicYearExists = getPdfAcademicYears().some((year) => {
    return year.id === pdfPageState.academicYear;
  });

  if (!academicYearExists) {
    pdfPageState.academicYear = getActiveAcademicYear();
    pdfPageState.studentId = "";
    pdfPageState.halaqohId = "";
    pdfPageState.classId = "";
  }

  const periodExists = getPdfPeriods().some((period) => {
    return period.id === pdfPageState.periodId;
  });

  if (!periodExists) {
    pdfPageState.periodId = getPdfPeriods()[0]?.id || "";
  }
}

function ensurePdfSelectedValues() {
  const students = getPdfStudents();
  const classes = getPdfClasses();
  const halaqohList = getPdfHalaqohOptions();

  const selectedStudentStillAvailable = students.some((student) => {
    return student.id === pdfPageState.studentId;
  });

  if (!selectedStudentStillAvailable) {
    pdfPageState.studentId = students[0]?.id || "";
  }

  const selectedClassStillAvailable = classes.some((classItem) => {
    return classItem.id === pdfPageState.classId;
  });

  if (!selectedClassStillAvailable) {
    pdfPageState.classId = classes[0]?.id || "";
  }

  const selectedHalaqohStillAvailable = halaqohList.some((halaqoh) => {
    return halaqoh.id === pdfPageState.halaqohId;
  });

  if (!selectedHalaqohStillAvailable) {
    pdfPageState.halaqohId = halaqohList[0]?.id || "";
  }
}

function populatePdfFilters(syncFromSettings = false) {
  if (syncFromSettings) {
    syncPdfStateFromSettings();
  }

  applyPdfPageRoleDefault();
  ensurePdfSelectedValues();

  populateSelect("#pdfFilterYear", getPdfAcademicYears(), {
    selectedValue: pdfPageState.academicYear,
  });

  populateSelect("#pdfFilterPeriod", getPdfPeriods(), {
    selectedValue: pdfPageState.periodId,
  });

  populateSelect("#pdfFilterStudent", getPdfStudents(), {
    selectedValue: pdfPageState.studentId,
  });

  populateSelect("#pdfFilterHalaqoh", getPdfHalaqohOptions(), {
    selectedValue: pdfPageState.halaqohId,
  });

  populateSelect("#pdfFilterClass", getPdfClasses(), {
    selectedValue: pdfPageState.classId,
  });

  const modeSelect = getEl("#pdfGenerateMode");
  const fileTypeSelect = getEl("#pdfFileType");
  const outputTypeSelect = getEl("#pdfOutputType");

  if (modeSelect) {
    modeSelect.value = pdfPageState.mode;
  }

  if (fileTypeSelect) {
    fileTypeSelect.value = pdfPageState.fileType;
  }

  if (outputTypeSelect) {
    outputTypeSelect.value = pdfPageState.outputType;
  }

  applyPdfPageRoleDefault();
  updatePdfVisibleFields();
  updatePdfEstimate();
}

function setPdfProgress(percent, title, message) {
  const progressBar = getEl("#pdfProgressBar");

  if (progressBar) {
    progressBar.style.width = `${percent}%`;
  }

  setText("#pdfProgressPercent", `${percent}%`);
  setText("#pdfProgressTitle", title);
  setText("#pdfProgressMessage", message);
}

function setPdfGenerateButtonLoading(isLoading) {
  const button = getEl("#pdfGenerateButton");
  const previewButton = getEl("#pdfPreviewTargetButton");

  isPdfGenerating = isLoading;

  if (button) {
    button.disabled = isLoading;
    button.textContent = isLoading ? "Memproses..." : getGenerateButtonLabel();
  }

  if (previewButton) {
    previewButton.disabled = isLoading;
  }
}

function updatePdfEstimate() {
  const selectedStudents = getPdfSelectedStudents();
  const studentCount = selectedStudents.length;
  const fileCount = getGeneratedFileCount();
  const targetLabel = getPdfTargetLabel();
  const fileTypeLabel = getPdfFileTypeLabel();
  const outputTypeLabel = getPdfOutputTypeLabel();
  const unitLabel =
    pdfPageState.fileType === "excel" ? "File Excel" : "File PDF";

  setText("#pdfEstimateCount", `${fileCount} ${unitLabel}`);

  if (studentCount === 0) {
    setText(
      "#pdfEstimateDescription",
      "Tidak ada siswa yang cocok dengan pilihan ini.",
    );

    setPdfProgress(
      0,
      "Menunggu proses generate",
      "Tidak ada data siswa untuk target yang dipilih.",
    );

    setPdfGenerateButtonLoading(false);
    return;
  }

  setText(
    "#pdfEstimateDescription",
    `${fileTypeLabel} • ${outputTypeLabel} • ${getPdfModeLabel()} untuk ${targetLabel}. Data mencakup ${studentCount} siswa dan akan menghasilkan ${fileCount} ${unitLabel}.`,
  );

  setPdfProgress(
    0,
    "Menunggu proses generate",
    `Pilihan target berubah. Klik ${getGenerateButtonLabel()} untuk membuat file.`,
  );

  setPdfGenerateButtonLoading(false);
}

/* =========================================================
   HISTORY
========================================================= */

function renderPdfHistory() {
  const tbody = getEl("#pdfHistoryBody");

  if (!tbody) return;

  const history = DB.generateLog || [];

  if (!history.length) {
    tbody.innerHTML = `
      <tr>
        <td colspan="7">
          <div class="empty-state">
            Belum ada riwayat generate file.
          </div>
        </td>
      </tr>
    `;
    return;
  }

  const sortedHistory = [...history].sort((a, b) => {
    return new Date(b.createdAt || 0) - new Date(a.createdAt || 0);
  });

  tbody.innerHTML = sortedHistory
    .map((item) => {
      const fileType =
        item.fileType || getFileTypeFromGenerateType(item.generateType);
      const outputType = item.outputType || item.generateType || "-";
      const mode = item.targetType || item.generateType || "-";
      const target = item.targetName || item.targetId || "-";
      const totalFiles = item.totalFiles || item.count || 0;
      const statusLabel = getGenerateLogStatusLabel(item.status);
      const statusClass = getGenerateLogStatusClass(item.status);

      return `
        <tr>
          <td>${escapeHtml(formatGenerateLogTime(item.createdAt))}</td>
          <td>${escapeHtml(fileType)}</td>
          <td>${escapeHtml(outputType)}</td>
          <td>${escapeHtml(mode)}</td>
          <td>${escapeHtml(target)}</td>
          <td>${escapeHtml(totalFiles)} file</td>
          <td>
            <span class="badge ${escapeHtml(statusClass)}">
              ${escapeHtml(statusLabel)}
            </span>
          </td>
        </tr>
      `;
    })
    .join("");
}

/* =========================================================
   PREVIEW TARGET
========================================================= */

function syncPreviewPageFromPdfTarget() {
  const selectedStudents = getPdfSelectedStudents();

  if (!selectedStudents.length) {
    showWarning("Tidak ada siswa yang bisa dipreview.");
    return;
  }

  const firstStudent = selectedStudents[0];

  previewPageState.academicYear = pdfPageState.academicYear;
  previewPageState.periodId = pdfPageState.periodId;
  previewPageState.classId = firstStudent.classId;
  previewPageState.halaqohId = firstStudent.halaqohId;
  previewPageState.studentId = firstStudent.id;

  populatePreviewFilters();
  renderRaporPreview();
  setActivePage("preview");
}

/* =========================================================
   PDF GENERATOR HELPERS
========================================================= */

function getJsPdfInstance() {
  if (!window.jspdf || !window.jspdf.jsPDF) {
    return null;
  }

  return window.jspdf.jsPDF;
}

function buildStudentPdfFileName(student) {
  const period = getCurrentGeneratePeriod();
  const studentName = sanitizeFileName(student?.name || "Siswa");
  const periodLabel = sanitizeFileName(getPeriodLabel(period));

  return `Rapor_${studentName}_${periodLabel}.pdf`;
}

function buildCombinedPdfFileName() {
  const period = getCurrentGeneratePeriod();
  const targetLabel = sanitizeFileName(getPdfTargetLabel());
  const periodLabel = sanitizeFileName(getPeriodLabel(period));

  return `Rapor_${targetLabel}_${periodLabel}.pdf`;
}

function setPreviewStateForStudent(student) {
  previewPageState.academicYear = pdfPageState.academicYear;
  previewPageState.periodId = pdfPageState.periodId;
  previewPageState.classId = student.classId;
  previewPageState.halaqohId = student.halaqohId;
  previewPageState.studentId = student.id;

  renderRaporPreview();
}

async function renderPreviewPaperForPdf(student) {
  const previewPage = document.querySelector('[data-view="preview"]');
  const paper = getEl("#raporPreviewPaper");

  if (!previewPage || !paper) {
    throw new Error("Template preview rapor tidak ditemukan.");
  }

  const originalStyle = previewPage.getAttribute("style") || "";

  document.body.classList.add("pdf-exporting");

  previewPage.style.display = "block";
  previewPage.style.position = "fixed";
  previewPage.style.left = "-10000px";
  previewPage.style.top = "0";
  previewPage.style.width = "1200px";
  previewPage.style.opacity = "1";
  previewPage.style.pointerEvents = "none";
  previewPage.style.zIndex = "-1";

  try {
    setPreviewStateForStudent(student);

    await wait(200);

    return await html2canvas(paper, {
      scale: 3,
      useCORS: true,
      backgroundColor: "#ffffff",
      logging: false,
      scrollX: 0,
      scrollY: 0,
    });
  } finally {
    previewPage.setAttribute("style", originalStyle);
    document.body.classList.remove("pdf-exporting");
  }
}

function addCanvasToPdfPage(pdf, canvas) {
  const imageData = canvas.toDataURL("image/png");
  const pageWidth = 210;
  const pageHeight = 297;

  pdf.addImage(
    imageData,
    "PNG",
    0,
    0,
    pageWidth,
    pageHeight,
    undefined,
    "FAST",
  );
}

function assertPdfLibrariesReady() {
  const jsPDF = getJsPdfInstance();

  if (!jsPDF) {
    throw new Error("Library jsPDF belum termuat.");
  }

  if (typeof html2canvas === "undefined") {
    throw new Error("Library html2canvas belum termuat.");
  }

  return jsPDF;
}

async function downloadSingleStudentPdf(student) {
  const jsPDF = assertPdfLibrariesReady();
  const pdf = new jsPDF("p", "mm", "a4");
  const canvas = await renderPreviewPaperForPdf(student);

  addCanvasToPdfPage(pdf, canvas);

  const fileName = buildStudentPdfFileName(student);

  pdf.save(fileName);

  return fileName;
}

async function downloadIndividualStudentPdfs(students) {
  const fileNames = [];

  for (let index = 0; index < students.length; index += 1) {
    const student = students[index];

    setPdfProgress(
      Math.min(90, Math.round(((index + 1) / students.length) * 80) + 10),
      "Membuat PDF per siswa",
      `Memproses ${index + 1} dari ${students.length} siswa.`,
    );

    const fileName = await downloadSingleStudentPdf(student);

    fileNames.push(fileName);

    await wait(120);
  }

  return fileNames;
}

async function downloadCombinedPdf(students) {
  const jsPDF = assertPdfLibrariesReady();
  const pdf = new jsPDF("p", "mm", "a4");

  for (let index = 0; index < students.length; index += 1) {
    const student = students[index];
    const canvas = await renderPreviewPaperForPdf(student);

    if (index > 0) {
      pdf.addPage();
    }

    addCanvasToPdfPage(pdf, canvas);

    const progressPercent =
      Math.round(((index + 1) / students.length) * 80) + 10;

    setPdfProgress(
      Math.min(progressPercent, 90),
      "Membuat PDF gabungan",
      `Memproses ${index + 1} dari ${students.length} siswa.`,
    );

    await wait(80);
  }

  const fileName = buildCombinedPdfFileName();

  pdf.save(fileName);

  return fileName;
}

async function saveGenerateHistory(fileCount, selectedStudents, fileName) {
  const logPayload = buildGenerateLogPayload(
    fileCount,
    selectedStudents,
    fileName,
  );

  if (typeof saveGenerateLogApi !== "function") {
    DB.generateLog = [logPayload, ...(DB.generateLog || [])];
    renderPdfHistory();

    if (typeof updateDatabaseCacheFromCurrentDB === "function") {
      updateDatabaseCacheFromCurrentDB();
    }

    return;
  }

  try {
    const savedLog = await saveGenerateLogApi(logPayload);

    DB.generateLog = [savedLog || logPayload, ...(DB.generateLog || [])];

    if (typeof updateDatabaseCacheFromCurrentDB === "function") {
      updateDatabaseCacheFromCurrentDB();
    }

    renderPdfHistory();
  } catch (error) {
    console.error("Gagal menyimpan riwayat generate:", error);

    showWarning(
      error.message || "File berhasil dibuat, tetapi riwayat gagal disimpan.",
      "Riwayat Generate Gagal",
    );
  }
}

/* =========================================================
   EXCEL GENERATOR HELPERS
========================================================= */

function getExcelLibrary() {
  if (typeof XLSX === "undefined") {
    return null;
  }

  return XLSX;
}

function buildExcelFileName() {
  const period = getCurrentGeneratePeriod();
  const targetLabel = sanitizeFileName(getPdfTargetLabel());
  const periodLabel = sanitizeFileName(getPeriodLabel(period));

  return `Rekap_Rapor_${targetLabel}_${periodLabel}.xlsx`;
}

function getStudentProgressForExcel(student) {
  return getProgressByStudentAndPeriod(student.id, pdfPageState.periodId);
}

function buildExcelRows(students) {
  return students.map((student, index) => {
    const classItem = getStudentClass(student);
    const halaqoh = getStudentHalaqoh(student);
    const progress = getStudentProgressForExcel(student);

    return {
      No: index + 1,
      NIS: student.nis || "",
      "Nama Siswa": student.name || "",
      Kelas: getClassLabel(classItem),
      Halaqoh: getHalaqohLabel(halaqoh),

      "Target Ziyadah": progress?.targetZiyadah || "",
      "Target Murojaah": progress?.targetMurojaah || "",
      "Hari Efektif":
        progress?.effectiveDays || progress?.disciplineTarget || "",

      "Hafalan Mulai": progress?.hafalanStart || "",
      "Hafalan Terakhir": progress?.hafalanLast || "",
      "Total Hafalan": progress?.totalHafalan || "",
      "Status Hafalan": progress?.hafalanStatus || "Belum Input",

      "Murojaah Mulai": progress?.murojaahStart || "",
      "Murojaah Terakhir": progress?.murojaahLast || "",
      "Total Murojaah": progress?.totalMurojaah || "",
      "Status Murojaah": progress?.murojaahStatus || "Belum Input",

      "Target Kedisiplinan": progress?.disciplineTarget || "",
      "Capaian Kedisiplinan": progress?.disciplineAchieved || "",
      "Status Kedisiplinan": progress?.disciplineStatus || "Belum Input",

      "Catatan Hafalan": richTextToPlainText(progress?.noteHafalan || ""),
      "Catatan Tahsin": richTextToPlainText(progress?.noteTahsin || ""),
      "Catatan Kedisiplinan": richTextToPlainText(
        progress?.noteDiscipline || "",
      ),

      "Wali Kelas":
        classItem?.homeroomTeacher || progress?.homeroomTeacher || "",
      "Guru Al-Qur’an": halaqoh?.teacherName || progress?.quranTeacher || "",
      "Tempat, Tanggal": progress?.reportPlaceDate || "",
    };
  });
}

function setExcelColumnWidths(worksheet) {
  worksheet["!cols"] = [
    { wch: 5 },
    { wch: 14 },
    { wch: 24 },
    { wch: 12 },
    { wch: 18 },
    { wch: 18 },
    { wch: 18 },
    { wch: 14 },
    { wch: 18 },
    { wch: 18 },
    { wch: 16 },
    { wch: 18 },
    { wch: 18 },
    { wch: 18 },
    { wch: 16 },
    { wch: 18 },
    { wch: 18 },
    { wch: 20 },
    { wch: 22 },
    { wch: 36 },
    { wch: 36 },
    { wch: 36 },
    { wch: 22 },
    { wch: 22 },
    { wch: 24 },
  ];
}

function downloadExcelRekap(students) {
  const XLSXLib = getExcelLibrary();

  if (!XLSXLib) {
    throw new Error("Library Excel belum termuat.");
  }

  const rows = buildExcelRows(students);

  if (!rows.length) {
    throw new Error("Tidak ada data siswa untuk dibuat Excel.");
  }

  const worksheet = XLSXLib.utils.json_to_sheet(rows);

  setExcelColumnWidths(worksheet);

  const workbook = XLSXLib.utils.book_new();

  XLSXLib.utils.book_append_sheet(workbook, worksheet, "Rekap Rapor");

  const fileName = buildExcelFileName();

  XLSXLib.writeFile(workbook, fileName);

  return fileName;
}

/* =========================================================
   GENERATE FILE
========================================================= */

async function generateExcelFile(selectedStudents) {
  setPdfGenerateButtonLoading(true);

  try {
    setPdfProgress(
      20,
      "Menyiapkan data",
      "Mengambil data siswa dan capaian untuk rekap Excel.",
    );

    await wait(300);

    setPdfProgress(
      60,
      "Membuat Excel",
      `Menyusun rekap ${selectedStudents.length} siswa.`,
    );

    await wait(300);

    const fileName = downloadExcelRekap(selectedStudents);

    setPdfProgress(
      90,
      "Menyimpan riwayat",
      "Menyimpan catatan generate ke riwayat.",
    );

    await saveGenerateHistory(1, selectedStudents, fileName);

    setPdfProgress(
      100,
      "Generate selesai",
      "1 file Excel berhasil dibuat dan diunduh.",
    );

    showSuccess("1 file Excel berhasil dibuat.", "Generate Berhasil");
  } catch (error) {
    console.error("Gagal generate Excel:", error);

    setPdfProgress(
      0,
      "Generate gagal",
      error.message || "Terjadi kesalahan saat membuat Excel.",
    );

    showError(error.message || "File Excel gagal dibuat.", "Generate Gagal");
  }

  setPdfGenerateButtonLoading(false);
}

async function generatePdfFiles(selectedStudents) {
  setPdfGenerateButtonLoading(true);

  try {
    setPdfProgress(
      10,
      "Menyiapkan data",
      "Mengambil data siswa dan menyiapkan template rapor.",
    );

    await wait(300);

    let fileName = "";
    const fileCount = getGeneratedFileCount();

    if (pdfPageState.outputType === "combined") {
      setPdfProgress(
        20,
        "Membuat PDF gabungan",
        `Menyiapkan ${selectedStudents.length} rapor siswa dalam satu file.`,
      );

      fileName = await downloadCombinedPdf(selectedStudents);
    } else {
      setPdfProgress(
        20,
        "Membuat PDF per siswa",
        `Menyiapkan ${selectedStudents.length} file rapor.`,
      );

      const fileNames = await downloadIndividualStudentPdfs(selectedStudents);

      fileName =
        fileNames.length === 1
          ? fileNames[0]
          : `${fileNames.length} file PDF per siswa`;
    }

    setPdfProgress(
      92,
      "Menyimpan riwayat",
      "Menyimpan catatan generate ke riwayat.",
    );

    await saveGenerateHistory(fileCount, selectedStudents, fileName);

    setPdfProgress(
      100,
      "Generate selesai",
      `${fileCount} file PDF berhasil dibuat dan diunduh.`,
    );

    showSuccess(`${fileCount} file PDF berhasil dibuat.`, "Generate Berhasil");
  } catch (error) {
    console.error("Gagal generate file:", error);

    setPdfProgress(
      0,
      "Generate gagal",
      error.message || "Terjadi kesalahan saat membuat file.",
    );

    showError(
      error.message ||
        "File gagal dibuat. Cek console browser untuk detail error.",
      "Generate Gagal",
    );
  }

  setPdfGenerateButtonLoading(false);
}

async function handleGeneratePdf() {
  if (isPdfGenerating) return;

  const selectedStudents = getPdfSelectedStudents();
  const generateActionLabel = getGenerateActionLabel();

  if (!selectedStudents.length) {
    showWarning(`Tidak ada siswa yang bisa dibuat ${generateActionLabel}.`);
    return;
  }

  if (pdfPageState.fileType === "excel") {
    await generateExcelFile(selectedStudents);
    return;
  }

  await generatePdfFiles(selectedStudents);
}

/* =========================================================
   INIT
========================================================= */

function initPdfPage() {
  resetPdfPageState();

  const pdfFilterYear = getEl("#pdfFilterYear");
  const pdfFilterPeriod = getEl("#pdfFilterPeriod");
  const pdfGenerateMode = getEl("#pdfGenerateMode");
  const pdfFileType = getEl("#pdfFileType");
  const pdfOutputType = getEl("#pdfOutputType");
  const pdfFilterStudent = getEl("#pdfFilterStudent");
  const pdfFilterHalaqoh = getEl("#pdfFilterHalaqoh");
  const pdfFilterClass = getEl("#pdfFilterClass");
  const pdfGenerateButton = getEl("#pdfGenerateButton");
  const pdfPreviewTargetButton = getEl("#pdfPreviewTargetButton");

  populatePdfFilters(true);
  renderPdfHistory();

  pdfFilterYear?.addEventListener("change", (event) => {
    pdfPageState.academicYear = event.target.value;

    const firstPeriod = getPdfPeriods()[0];

    pdfPageState.periodId = firstPeriod?.id || "";
    pdfPageState.studentId = "";
    pdfPageState.halaqohId = "";
    pdfPageState.classId = "";

    populatePdfFilters();
  });

  pdfFilterPeriod?.addEventListener("change", (event) => {
    pdfPageState.periodId = event.target.value;
    updatePdfEstimate();
  });

  pdfGenerateMode?.addEventListener("change", (event) => {
    pdfPageState.mode = event.target.value;

    updatePdfVisibleFields();
    updatePdfEstimate();
  });

  pdfFileType?.addEventListener("change", (event) => {
    pdfPageState.fileType = event.target.value;

    updatePdfVisibleFields();
    updatePdfEstimate();
  });

  pdfOutputType?.addEventListener("change", (event) => {
    pdfPageState.outputType = event.target.value;
    updatePdfEstimate();
  });

  pdfFilterStudent?.addEventListener("change", (event) => {
    pdfPageState.studentId = event.target.value;
    updatePdfEstimate();
  });

  pdfFilterHalaqoh?.addEventListener("change", (event) => {
    pdfPageState.halaqohId = event.target.value;
    updatePdfEstimate();
  });

  pdfFilterClass?.addEventListener("change", (event) => {
    pdfPageState.classId = event.target.value;

    if (pdfPageState.mode === "halaqoh") {
      pdfPageState.halaqohId = "";
      populatePdfFilters();
      return;
    }

    updatePdfEstimate();
  });

  pdfGenerateButton?.addEventListener("click", handleGeneratePdf);
  pdfPreviewTargetButton?.addEventListener(
    "click",
    syncPreviewPageFromPdfTarget,
  );
}
