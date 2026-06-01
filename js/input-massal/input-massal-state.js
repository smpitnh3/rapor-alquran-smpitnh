const bulkInputState = {
  academicYear: getActiveAcademicYear(),
  periodId: getActivePeriodId(),
  classId: "all",
  halaqohId: "all",
  spreadsheet: null,
  selectedCell: null,
  isNoteEditorOpen: false,
  isUpdatingNoteDisplay: false,
  noteHtmlMap: {},
};

let bulkInputInitialized = false;
let bulkRichTextEventsInitialized = false;

const bulkNoteColumnIndexes = [15, 16, 17];

const bulkValidStatuses = ["Tuntas", "Proses", "Perlu Perhatian"];

const bulkColumns = [
  { key: "nis", title: "NIS", width: 100, readOnly: true },
  { key: "name", title: "Nama", width: 180, readOnly: true },
  { key: "className", title: "Kelas", width: 80, readOnly: true },
  { key: "halaqohName", title: "Halaqoh", width: 140, readOnly: true },

  { key: "hafalanStart", title: "Hafalan Awal", width: 130 },
  { key: "hafalanLast", title: "Hafalan Akhir", width: 130 },
  { key: "totalHafalan", title: "Total Hafalan", width: 120 },
  {
    key: "hafalanStatus",
    title: "Status Hafalan",
    width: 130,
    type: "dropdown",
    source: bulkValidStatuses,
  },

  { key: "murojaahStart", title: "Murojaah Awal", width: 130 },
  { key: "murojaahLast", title: "Murojaah Akhir", width: 130 },
  { key: "totalMurojaah", title: "Total Murojaah", width: 130 },
  {
    key: "murojaahStatus",
    title: "Status Murojaah",
    width: 140,
    type: "dropdown",
    source: bulkValidStatuses,
  },

  { key: "disciplineTarget", title: "Target Hari", width: 100 },
  { key: "disciplineAchieved", title: "Capaian Hari", width: 110 },
  {
    key: "disciplineStatus",
    title: "Status Disiplin",
    width: 130,
    type: "dropdown",
    source: bulkValidStatuses,
  },

  { key: "noteHafalan", title: "Catatan Hafalan", width: 220 },
  { key: "noteTahsin", title: "Catatan Tahsin", width: 220 },
  { key: "noteDiscipline", title: "Catatan Disiplin", width: 220 },
];

/* =========================================================
   STATE / USER
========================================================= */

function getBulkCurrentUser() {
  return typeof getCurrentUser === "function" ? getCurrentUser() : null;
}

function resetBulkInputState() {
  bulkInputState.academicYear = getActiveAcademicYear();
  bulkInputState.periodId = getActivePeriodId();
  bulkInputState.classId = "all";
  bulkInputState.halaqohId = "all";
  bulkInputState.selectedCell = null;
  bulkInputState.isNoteEditorOpen = false;
  bulkInputState.isUpdatingNoteDisplay = false;
  bulkInputState.noteHtmlMap = {};
}

function syncBulkStateFromInputPage() {
  if (typeof inputPageState === "undefined") return;

  bulkInputState.academicYear =
    inputPageState.academicYear || getActiveAcademicYear();

  bulkInputState.periodId = inputPageState.periodId || getActivePeriodId();

  bulkInputState.classId = inputPageState.classId || "all";
  bulkInputState.halaqohId = inputPageState.halaqohId || "all";
}
