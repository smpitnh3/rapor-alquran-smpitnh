/* =========================================================
   INPUT-MASSAL.JS
   Fungsi:
   - Navigasi halaman input massal.
   - Menghubungkan event utama halaman.
========================================================= */

function openInputMassalPage() {
  setActivePage("input-massal");
  syncBulkStateFromInputPage();
  populateBulkFilters();
  renderBulkSpreadsheet();
}

function closeInputMassalPage() {
  setActivePage("input");
}

/* =========================================================
   EVENT HANDLERS
========================================================= */

function handleBulkFilterChange(event) {
  const target = event.target;

  if (!target) return;

  if (target.id === "bulkFilterYear") {
    bulkInputState.academicYear = target.value;

    const firstPeriod = getBulkPeriods()[0];

    bulkInputState.periodId = firstPeriod?.id || "";
    bulkInputState.classId = "all";
    bulkInputState.halaqohId = "all";

    populateBulkFilters();
    renderBulkSpreadsheet();
    return;
  }

  if (target.id === "bulkFilterPeriod") {
    bulkInputState.periodId = target.value;
    renderBulkSpreadsheet();
    return;
  }

  if (target.id === "bulkFilterClass") {
    bulkInputState.classId = target.value;
    bulkInputState.halaqohId = "all";

    populateBulkFilters();
    renderBulkSpreadsheet();
    return;
  }

  if (target.id === "bulkFilterHalaqoh") {
    bulkInputState.halaqohId = target.value;
    renderBulkSpreadsheet();
  }
}

function handleBulkButtonClick(event) {
  const target = event.target;

  if (!target) return;

  if (target.id === "bulkReloadButton") {
    renderBulkSpreadsheet();
    return;
  }

  if (target.id === "bulkValidateButton") {
    handleValidateBulkInput();
    return;
  }

  if (target.id === "bulkSaveAllButton") {
    handleSaveBulkInput();
  }
}

function handleBulkCellDoubleClick(event) {
  const cell = event.target.closest(".jexcel td, .jspreadsheet td");

  if (!cell) return;

  const selectedCell = bulkInputState.selectedCell;

  if (!selectedCell) return;
  if (!isBulkNoteColumn(selectedCell.columnIndex)) return;

  event.preventDefault();
  event.stopPropagation();
  event.stopImmediatePropagation();

  openBulkNoteEditor(selectedCell.rowIndex, selectedCell.columnIndex);
}

/* =========================================================
   INIT
========================================================= */

function initInputMassalPage() {
  if (bulkInputInitialized) return;

  bulkInputInitialized = true;

  const openButton = getEl("#openBulkInputPage");
  const closeButton = getEl("#closeBulkInputPage");

  initBulkRichTextEditorEvents();

  openButton?.addEventListener("click", openInputMassalPage);
  closeButton?.addEventListener("click", closeInputMassalPage);

  document.addEventListener("change", handleBulkFilterChange);
  document.addEventListener("click", handleBulkButtonClick);
  document.addEventListener("dblclick", handleBulkCellDoubleClick, true);
}
