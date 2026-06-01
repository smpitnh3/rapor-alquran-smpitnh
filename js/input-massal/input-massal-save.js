/* =========================================================
   PAYLOAD
========================================================= */

function buildBulkProgressPayload(row, student) {
  const classItem = getStudentClass(student);
  const halaqoh = getStudentHalaqoh(student);

  const oldProgress = getProgressByStudentAndPeriod(
    student.id,
    bulkInputState.periodId,
  );

  const appSettings = getAppSettings();

  const period = DB.periods.find((item) => {
    return item.id === bulkInputState.periodId;
  });

  const now = new Date().toISOString();

  return {
    id: oldProgress?.id || `progress_${student.id}_${bulkInputState.periodId}`,
    studentId: student.id,
    periodId: bulkInputState.periodId,

    month:
      oldProgress?.month ||
      period?.month ||
      period?.name ||
      appSettings.defaultMonth ||
      "April-Juni",

    targetZiyadah:
      oldProgress?.targetZiyadah ||
      appSettings.targetZiyadah ||
      appSettings.defaultZiyadahTarget ||
      "10 halaman",

    targetMurojaah:
      oldProgress?.targetMurojaah ||
      appSettings.targetMurojaah ||
      appSettings.defaultMurojaahTarget ||
      "20 halaman",

    effectiveDays: getBulkNumberOnly(
      oldProgress?.effectiveDays ||
        appSettings.effectiveDays ||
        appSettings.defaultEffectiveDays,
      20,
    ),

    hafalanStart: getBulkCellValue(row, 4),
    hafalanLast: getBulkCellValue(row, 5),
    totalHafalan: getBulkCellValue(row, 6),
    hafalanStatus: getBulkCellValue(row, 7),

    murojaahStart: getBulkCellValue(row, 8),
    murojaahLast: getBulkCellValue(row, 9),
    totalMurojaah: getBulkCellValue(row, 10),
    murojaahStatus: getBulkCellValue(row, 11),

    disciplineTarget: Number(getBulkCellValue(row, 12)),
    disciplineAchieved: Number(getBulkCellValue(row, 13)),
    disciplineStatus: getBulkCellValue(row, 14),

    noteHafalan:
      getBulkNoteHtmlByStudent(student, 15) ||
      plainTextToRichText(getBulkCellValue(row, 15)) ||
      "Catatan hafalan belum diisi.",

    noteTahsin:
      getBulkNoteHtmlByStudent(student, 16) ||
      plainTextToRichText(getBulkCellValue(row, 16)) ||
      "Catatan tahsin belum diisi.",

    noteDiscipline:
      getBulkNoteHtmlByStudent(student, 17) ||
      plainTextToRichText(getBulkCellValue(row, 17)) ||
      "Catatan kedisiplinan belum diisi.",

    homeroomTeacher:
      classItem?.homeroomTeacher ||
      oldProgress?.homeroomTeacher ||
      "Wali Kelas",

    quranTeacher:
      halaqoh?.teacherName || oldProgress?.quranTeacher || "Guru Al-Qur’an",

    reportPlaceDate:
      oldProgress?.reportPlaceDate ||
      appSettings.reportPlaceDate ||
      "Bekasi, -",

    createdAt: oldProgress?.createdAt || now,
    updatedAt: now,
  };
}

function upsertProgressListLocal(progressList) {
  progressList.forEach((progress) => {
    const index = DB.progress.findIndex((item) => {
      return (
        item.studentId === progress.studentId &&
        item.periodId === progress.periodId
      );
    });

    if (index >= 0) {
      DB.progress[index] = progress;
      return;
    }

    DB.progress.push(progress);
  });
}

/* =========================================================
   SAVE BATCH
========================================================= */

async function handleValidateBulkInput() {
  const result = validateBulkRows();

  showBulkValidationResult(result);
}

async function handleSaveBulkInput() {
  const result = validateBulkRows();

  if (result.invalidRows.length || !result.validRows.length) {
    showBulkValidationResult(result);
    return;
  }

  if (typeof saveProgressBatchApi !== "function") {
    showError("Fungsi simpan input massal belum tersedia.");
    return;
  }

  const progressList = result.validRows.map((item) => {
    return buildBulkProgressPayload(result.rows[item.rowIndex], item.student);
  });

  try {
    Swal.fire({
      title: "Menyimpan input massal...",
      text: `${progressList.length} data siswa sedang disimpan ke Google Sheets.`,
      allowOutsideClick: false,
      didOpen: () => {
        Swal.showLoading();
      },
    });

    const savedProgressList = await saveProgressBatchApi(progressList);

    const normalizedSavedList =
      Array.isArray(savedProgressList) && savedProgressList.length
        ? savedProgressList
        : progressList;

    upsertProgressListLocal(normalizedSavedList);

    if (typeof refreshAllPageData === "function") {
      refreshAllPageData();
    }

    if (typeof updateDatabaseCacheFromCurrentDB === "function") {
      updateDatabaseCacheFromCurrentDB();
    }

    renderBulkSpreadsheet();

    Swal.fire({
      icon: "success",
      title: "Input Massal Disimpan",
      text: `${progressList.length} data capaian berhasil disimpan ke Google Sheets.`,
      timer: 1800,
      showConfirmButton: false,
    });
  } catch (error) {
    Swal.fire({
      icon: "error",
      title: "Gagal menyimpan",
      text: error.message || "Input massal gagal disimpan ke Google Sheets.",
    });
  }
}
