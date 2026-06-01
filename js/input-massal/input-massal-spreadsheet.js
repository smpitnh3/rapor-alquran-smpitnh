/* =========================================================
   HELPERS
========================================================= */

function getBulkNumberOnly(value, fallback = 0) {
  if (value === null || value === undefined || value === "") {
    return fallback;
  }

  const numberValue = Number(String(value).replace(/[^\d.-]/g, ""));

  if (!Number.isFinite(numberValue)) {
    return fallback;
  }

  return numberValue;
}

function getBulkCellValue(row, index) {
  return String(row[index] || "").trim();
}

function getBulkGridData() {
  if (!bulkInputState.spreadsheet) return [];

  return bulkInputState.spreadsheet.getData();
}

function findStudentByNis(nis) {
  const normalizedNis = String(nis || "").trim();

  return getBulkStudents().find((student) => {
    return String(student.nis || "").trim() === normalizedNis;
  });
}

function isBulkNoteColumn(columnIndex) {
  return bulkNoteColumnIndexes.includes(Number(columnIndex));
}

/* =========================================================
   DATA SISWA & PROGRESS
========================================================= */

function getBulkStudents() {
  const allowedStudents = filterStudentsByCurrentUser(DB.students);

  return allowedStudents.filter((student) => {
    const classItem = getStudentClass(student);

    const matchAcademicYear =
      !classItem?.academicYear ||
      classItem.academicYear === bulkInputState.academicYear;

    const matchClass =
      bulkInputState.classId === "all" ||
      student.classId === bulkInputState.classId;

    const matchHalaqoh =
      bulkInputState.halaqohId === "all" ||
      student.halaqohId === bulkInputState.halaqohId;

    return (
      isActiveStudent(student) &&
      matchAcademicYear &&
      matchClass &&
      matchHalaqoh
    );
  });
}

function getBulkProgress(studentId) {
  return getProgressByStudentAndPeriod(studentId, bulkInputState.periodId);
}

function buildBulkRow(student) {
  const classItem = getStudentClass(student);
  const halaqoh = getStudentHalaqoh(student);
  const progress = getBulkProgress(student.id);
  const appSettings = getAppSettings();

  const noteHafalanHtml = sanitizeRichText(progress?.noteHafalan || "");
  const noteTahsinHtml = sanitizeRichText(progress?.noteTahsin || "");
  const noteDisciplineHtml = sanitizeRichText(progress?.noteDiscipline || "");

  return [
    student.nis || "",
    student.name || "",
    getClassLabel(classItem),
    getHalaqohLabel(halaqoh),

    progress?.hafalanStart || "",
    progress?.hafalanLast || "",
    progress?.totalHafalan || "",
    progress?.hafalanStatus || "Proses",

    progress?.murojaahStart || "",
    progress?.murojaahLast || "",
    progress?.totalMurojaah || "",
    progress?.murojaahStatus || "Proses",

    progress?.disciplineTarget ||
      getBulkNumberOnly(
        appSettings.effectiveDays || appSettings.defaultEffectiveDays,
        "",
      ),

    progress?.disciplineAchieved || "",
    progress?.disciplineStatus || "Proses",

    richTextToPlainText(noteHafalanHtml),
    richTextToPlainText(noteTahsinHtml),
    richTextToPlainText(noteDisciplineHtml),
  ];
}

function getBulkSpreadsheetData() {
  return getBulkStudents().map((student) => {
    return buildBulkRow(student);
  });
}

/* =========================================================
   SPREADSHEET
========================================================= */

function getBulkSpreadsheetColumns() {
  return bulkColumns.map((column) => {
    return {
      title: column.title,
      width: column.width,
      type: column.type || "text",
      source: column.source || undefined,
      readOnly: Boolean(column.readOnly),
    };
  });
}

function renderBulkSpreadsheet() {
  const container = getEl("#bulkSpreadsheet");

  if (!container) return;

  if (typeof jspreadsheet === "undefined") {
    container.innerHTML = `
      <div class="empty-state">
        Library Jspreadsheet belum termuat. Cek CDN di index.html.
      </div>
    `;
    return;
  }

  container.innerHTML = "";
  resetBulkNoteHtmlMap();

  const students = getBulkStudents();

  const data = students.map((student) => {
    const progress = getBulkProgress(student.id);

    cacheBulkProgressNotes(student, progress);

    return buildBulkRow(student);
  });

  bulkInputState.spreadsheet = jspreadsheet(container, {
    data,
    columns: getBulkSpreadsheetColumns(),

    tableOverflow: true,
    tableWidth: "100%",
    tableHeight: "520px",

    allowInsertColumn: false,
    allowDeleteColumn: false,
    allowRenameColumn: false,

    rowResize: true,
    columnDrag: false,
    copyCompatibility: true,

    onselection(instance, x1, y1) {
      bulkInputState.selectedCell = {
        columnIndex: Number(x1),
        rowIndex: Number(y1),
      };
    },

    onbeforechange(instance, cell, x, y, value) {
      const columnIndex = Number(x);
      const rowIndex = Number(y);

      if (!isBulkNoteColumn(columnIndex)) {
        return value;
      }

      if (bulkInputState.isUpdatingNoteDisplay) {
        return value;
      }

      const htmlValue = plainTextToRichText(value || "");

      setTimeout(() => {
        setBulkNoteHtml(rowIndex, columnIndex, htmlValue);
      }, 0);

      return richTextToPlainText(htmlValue);
    },
  });

  const saveButton = getEl("#bulkSaveAllButton");

  if (saveButton) {
    saveButton.disabled = true;
  }
}
