/* =========================================================
   NOTE HTML MAP
   Penyimpanan sementara HTML catatan.
   Yang tampil di spreadsheet tetap plain text.
========================================================= */

function getBulkNoteKey(rowIndex, columnIndex) {
  const row = getBulkGridData()[rowIndex];

  if (!row) return "";

  const nis = getBulkCellValue(row, 0);

  return `${bulkInputState.periodId}_${nis}_${columnIndex}`;
}

function setBulkNoteHtml(rowIndex, columnIndex, htmlValue) {
  const key = getBulkNoteKey(rowIndex, columnIndex);

  if (!key) return;

  bulkInputState.noteHtmlMap[key] = sanitizeRichText(htmlValue || "");
}

function getBulkNoteHtml(rowIndex, columnIndex, fallback = "") {
  const key = getBulkNoteKey(rowIndex, columnIndex);

  if (!key) return fallback;

  return bulkInputState.noteHtmlMap[key] || fallback;
}

function getBulkNoteHtmlByStudent(student, columnIndex) {
  const nis = String(student?.nis || "").trim();

  if (!nis) return "";

  const key = `${bulkInputState.periodId}_${nis}_${columnIndex}`;

  return bulkInputState.noteHtmlMap[key] || "";
}

function resetBulkNoteHtmlMap() {
  bulkInputState.noteHtmlMap = {};
}

function cacheBulkProgressNotes(student, progress) {
  const nis = String(student.nis || "").trim();

  if (!nis) return;

  bulkInputState.noteHtmlMap[`${bulkInputState.periodId}_${nis}_15`] =
    sanitizeRichText(progress?.noteHafalan || "");

  bulkInputState.noteHtmlMap[`${bulkInputState.periodId}_${nis}_16`] =
    sanitizeRichText(progress?.noteTahsin || "");

  bulkInputState.noteHtmlMap[`${bulkInputState.periodId}_${nis}_17`] =
    sanitizeRichText(progress?.noteDiscipline || "");
}

/* =========================================================
   NOTE EDITOR
========================================================= */

function getBulkNoteTitle(columnIndex) {
  if (Number(columnIndex) === 15) return "Catatan Hafalan";
  if (Number(columnIndex) === 16) return "Catatan Tahsin";
  if (Number(columnIndex) === 17) return "Catatan Disiplin";

  return "Catatan";
}

function getBulkNoteSubtitle(columnIndex) {
  if (Number(columnIndex) === 15) {
    return "Tulis catatan hafalan siswa dengan format yang rapi.";
  }

  if (Number(columnIndex) === 16) {
    return "Tulis catatan tahsin siswa dengan format yang rapi.";
  }

  if (Number(columnIndex) === 17) {
    return "Tulis catatan kedisiplinan siswa dengan format yang rapi.";
  }

  return "Tulis catatan siswa dengan format yang rapi.";
}

function saveBulkNoteFromEditor(editorId, rowIndex, columnIndex) {
  const editor = document.getElementById(editorId);

  if (!editor) {
    Swal.close();
    return;
  }

  const cleanHtml = sanitizeRichText(editor.innerHTML || "");
  const plainText = richTextToPlainText(cleanHtml);

  bulkInputState.isUpdatingNoteDisplay = true;

  bulkInputState.spreadsheet.setValueFromCoords(
    columnIndex,
    rowIndex,
    plainText,
  );

  bulkInputState.isUpdatingNoteDisplay = false;

  setBulkNoteHtml(rowIndex, columnIndex, cleanHtml);

  Swal.close();
}

function openBulkNoteEditor(rowIndex, columnIndex) {
  if (!bulkInputState.spreadsheet) return;
  if (!isBulkNoteColumn(columnIndex)) return;

  const cellPlainText =
    bulkInputState.spreadsheet.getValueFromCoords(columnIndex, rowIndex) || "";

  const currentValue = getBulkNoteHtml(
    rowIndex,
    columnIndex,
    plainTextToRichText(cellPlainText),
  );

  const activeElement = document.activeElement;

  if (activeElement && typeof activeElement.blur === "function") {
    activeElement.blur();
  }

  bulkInputState.isNoteEditorOpen = true;

  const editorId = `bulkRichNoteEditor_${Date.now()}`;
  const modalTitle = getBulkNoteTitle(columnIndex);
  const modalSubtitle = getBulkNoteSubtitle(columnIndex);

  setTimeout(() => {
    Swal.fire({
      html: `
        <div class="bulk-note-shell">
          <button
            type="button"
            class="bulk-note-close"
            id="closeBulkNoteButton"
            aria-label="Tutup catatan"
          >
            ×
          </button>

          <div class="bulk-note-header">
            <div class="bulk-note-title">
              <h3>${escapeHtml(modalTitle)}</h3>
              <p>${escapeHtml(modalSubtitle)}</p>
            </div>
          </div>

          <div class="bulk-note-body">
            <span class="bulk-note-section-title">Catatan</span>

            <div class="rich-editor bulk-rich-editor">
              <div class="rich-editor-toolbar bulk-note-toolbar">
                <button type="button" data-bulk-rich-command="bold">
                  <b>B</b>
                </button>

                <button type="button" data-bulk-rich-command="italic">
                  <i>I</i>
                </button>

                <button type="button" data-bulk-rich-command="underline">
                  <u>U</u>
                </button>

                <button type="button" data-bulk-rich-command="insertUnorderedList">
                  • List
                </button>

                <button type="button" data-bulk-rich-command="insertOrderedList">
                  1. List
                </button>
              </div>

              <div
                class="rich-editor-area bulk-rich-editor-area"
                id="${editorId}"
                contenteditable="true"
                data-placeholder="Tulis catatan di sini..."
              ></div>
            </div>
          </div>

          <div class="bulk-note-actions">
            <button
              type="button"
              class="btn-secondary"
              id="cancelBulkNoteButton"
            >
              Batal
            </button>

            <button
              type="button"
              class="btn-primary"
              id="saveBulkNoteButton"
            >
              Simpan Catatan
            </button>
          </div>
        </div>
      `,

      customClass: {
        popup: "bulk-note-modal",
      },

      showConfirmButton: false,
      showCancelButton: false,
      showCloseButton: false,
      allowOutsideClick: false,

      didOpen: () => {
        const editor = document.getElementById(editorId);
        const closeButton = document.getElementById("closeBulkNoteButton");
        const cancelButton = document.getElementById("cancelBulkNoteButton");
        const saveButton = document.getElementById("saveBulkNoteButton");

        if (editor) {
          editor.innerHTML = sanitizeRichText(currentValue || "");
          editor.focus();

          const range = document.createRange();

          range.selectNodeContents(editor);
          range.collapse(false);

          const selection = window.getSelection();

          selection.removeAllRanges();
          selection.addRange(range);
        }

        closeButton?.addEventListener("click", () => {
          Swal.close();
        });

        cancelButton?.addEventListener("click", () => {
          Swal.close();
        });

        saveButton?.addEventListener("click", () => {
          saveBulkNoteFromEditor(editorId, rowIndex, columnIndex);
        });
      },

      willClose: () => {
        bulkInputState.isNoteEditorOpen = false;
      },
    });
  }, 80);
}

/* =========================================================
   BULK RICH TEXT EDITOR EVENTS
========================================================= */

function initBulkRichTextEditorEvents() {
  if (bulkRichTextEventsInitialized) return;

  bulkRichTextEventsInitialized = true;

  document.addEventListener("click", (event) => {
    const button = event.target.closest("[data-bulk-rich-command]");

    if (!button) return;

    event.preventDefault();

    const command = button.dataset.bulkRichCommand;
    const wrapper = button.closest(".bulk-rich-editor");
    const editor = wrapper?.querySelector(".bulk-rich-editor-area");

    if (!editor) return;

    editor.focus();
    document.execCommand(command, false, null);
  });

  document.addEventListener(
    "paste",
    (event) => {
      if (!bulkInputState.isNoteEditorOpen) return;

      const editor = event.target.closest(".bulk-rich-editor-area");

      if (!editor) return;

      event.preventDefault();
      event.stopPropagation();

      const text = event.clipboardData?.getData("text/plain") || "";

      document.execCommand("insertText", false, text);
    },
    true,
  );
}
