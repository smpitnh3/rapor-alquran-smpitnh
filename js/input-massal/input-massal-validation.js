/* =========================================================
   VALIDATION
========================================================= */

function validateBulkRow(row, rowIndex) {
  const errors = [];

  const nis = getBulkCellValue(row, 0);
  const student = findStudentByNis(nis);

  const hafalanStatus = getBulkCellValue(row, 7);
  const murojaahStatus = getBulkCellValue(row, 11);
  const disciplineTarget = Number(getBulkCellValue(row, 12));
  const disciplineAchieved = Number(getBulkCellValue(row, 13));
  const disciplineStatus = getBulkCellValue(row, 14);

  if (!nis) {
    errors.push("NIS kosong.");
  }

  if (!student) {
    errors.push("NIS tidak ditemukan pada filter siswa saat ini.");
  }

  if (!bulkValidStatuses.includes(hafalanStatus)) {
    errors.push("Status hafalan tidak valid.");
  }

  if (!bulkValidStatuses.includes(murojaahStatus)) {
    errors.push("Status murojaah tidak valid.");
  }

  if (!Number.isFinite(disciplineTarget) || disciplineTarget < 0) {
    errors.push("Target hari harus angka 0 atau lebih.");
  }

  if (!Number.isFinite(disciplineAchieved) || disciplineAchieved < 0) {
    errors.push("Capaian hari harus angka 0 atau lebih.");
  }

  if (
    Number.isFinite(disciplineTarget) &&
    Number.isFinite(disciplineAchieved) &&
    disciplineAchieved > disciplineTarget
  ) {
    errors.push("Capaian hari tidak boleh lebih besar dari target.");
  }

  if (!bulkValidStatuses.includes(disciplineStatus)) {
    errors.push("Status disiplin tidak valid.");
  }

  return {
    rowIndex,
    student,
    isValid: errors.length === 0,
    errors,
  };
}

function validateBulkRows() {
  const rows = getBulkGridData();

  const validations = rows.map((row, index) => {
    return validateBulkRow(row, index);
  });

  const validRows = validations.filter((item) => item.isValid);
  const invalidRows = validations.filter((item) => !item.isValid);

  return {
    rows,
    validations,
    validRows,
    invalidRows,
  };
}

function showBulkValidationResult(result) {
  const saveButton = getEl("#bulkSaveAllButton");

  if (saveButton) {
    saveButton.disabled =
      result.invalidRows.length > 0 || result.validRows.length === 0;
  }

  if (!result.rows.length) {
    showWarning("Tidak ada data di spreadsheet.");
    return;
  }

  if (result.invalidRows.length) {
    const errorList = result.invalidRows
      .slice(0, 10)
      .map((item) => {
        return `<li>Baris ${item.rowIndex + 1}: ${escapeHtml(
          item.errors.join(", "),
        )}</li>`;
      })
      .join("");

    Swal.fire({
      icon: "warning",
      title: "Ada data belum valid",
      html: `
        <div style="text-align:left">
          <p>
            ${result.validRows.length} baris valid,
            ${result.invalidRows.length} baris bermasalah.
          </p>
          <ul>${errorList}</ul>
          ${
            result.invalidRows.length > 10
              ? "<p>Dan beberapa error lainnya...</p>"
              : ""
          }
        </div>
      `,
      confirmButtonText: "Perbaiki",
    });

    return;
  }

  Swal.fire({
    icon: "success",
    title: "Data valid",
    text: `${result.validRows.length} baris siap disimpan.`,
    timer: 1500,
    showConfirmButton: false,
  });
}
