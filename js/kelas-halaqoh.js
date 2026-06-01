/* =========================================================
   KELAS & HALAQOH PAGE
   Fungsi:
   - Menampilkan daftar kelas.
   - Menampilkan daftar halaqoh.
   - Menghitung jumlah siswa per kelas/halaqoh.
   - Filter berdasarkan tahun ajaran dan keyword.
   - Mendukung data lokal dan backend Google Sheets.
========================================================= */

const classPageState = {
  academicYear: getActiveAcademicYear(),
  search: "",
};

/* =========================================================
   STATE
========================================================= */

function resetClassPageState() {
  classPageState.academicYear = getActiveAcademicYear();
  classPageState.search = "";
}

/* =========================================================
   OPTIONS
========================================================= */

function getClassPageAcademicYears() {
  const years = DB.periods.map((period) => period.academicYear).filter(Boolean);

  const uniqueYears = [...new Set(years)];

  if (!uniqueYears.length) {
    return [
      {
        id: classPageState.academicYear,
        name: classPageState.academicYear,
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

function getClassById(classId) {
  return DB.classes.find((classItem) => {
    return classItem.id === classId;
  });
}

function isClassInSelectedAcademicYear(classItem) {
  return (
    !classItem.academicYear ||
    classItem.academicYear === classPageState.academicYear
  );
}

function getActiveClassIdsForClassPage() {
  return DB.classes
    .filter((classItem) => {
      return isClassInSelectedAcademicYear(classItem);
    })
    .map((classItem) => classItem.id);
}

/* =========================================================
   FILTERED DATA
========================================================= */

function getClassPageClasses() {
  const keyword = classPageState.search.toLowerCase().trim();

  return DB.classes.filter((classItem) => {
    const matchYear = isClassInSelectedAcademicYear(classItem);

    const matchKeyword =
      !keyword ||
      String(classItem.name || "")
        .toLowerCase()
        .includes(keyword) ||
      String(classItem.level || "")
        .toLowerCase()
        .includes(keyword) ||
      String(classItem.homeroomTeacher || "")
        .toLowerCase()
        .includes(keyword);

    return matchYear && matchKeyword;
  });
}

function getClassPageHalaqoh() {
  const keyword = classPageState.search.toLowerCase().trim();
  const classIds = getActiveClassIdsForClassPage();

  return DB.halaqoh.filter((halaqoh) => {
    const classItem = getClassById(halaqoh.classId);
    const matchYear = classIds.includes(halaqoh.classId);

    const matchKeyword =
      !keyword ||
      String(halaqoh.name || "")
        .toLowerCase()
        .includes(keyword) ||
      String(halaqoh.teacherName || "")
        .toLowerCase()
        .includes(keyword) ||
      String(classItem?.name || "")
        .toLowerCase()
        .includes(keyword);

    return matchYear && matchKeyword;
  });
}

/* =========================================================
   COUNTERS
========================================================= */

function countStudentsByClass(classId) {
  return DB.students.filter((student) => {
    return isActiveStudent(student) && student.classId === classId;
  }).length;
}

function countHalaqohByClass(classId) {
  return DB.halaqoh.filter((halaqoh) => {
    return halaqoh.classId === classId;
  }).length;
}

function countStudentsByHalaqoh(halaqohId) {
  return DB.students.filter((student) => {
    return isActiveStudent(student) && student.halaqohId === halaqohId;
  }).length;
}

/* =========================================================
   RENDER
========================================================= */

function renderClassPageStats() {
  const classes = getClassPageClasses();
  const halaqohList = getClassPageHalaqoh();
  const classIds = classes.map((classItem) => classItem.id);

  const totalStudents = DB.students.filter((student) => {
    return isActiveStudent(student) && classIds.includes(student.classId);
  }).length;

  const average = halaqohList.length
    ? Math.round(totalStudents / halaqohList.length)
    : 0;

  setText("#classPageTotalClass", classes.length);
  setText("#classPageTotalHalaqoh", halaqohList.length);
  setText("#classPageTotalStudent", totalStudents);
  setText("#classPageAverageStudent", average);
}

function renderClassTable() {
  const tbody = getEl("#classPageClassBody");

  if (!tbody) return;

  const classes = getClassPageClasses();

  if (!classes.length) {
    tbody.innerHTML = `
      <tr>
        <td colspan="5">
          <div class="empty-state">
            Tidak ada data kelas yang cocok.
          </div>
        </td>
      </tr>
    `;
    return;
  }

  tbody.innerHTML = classes
    .map((classItem) => {
      return `
        <tr>
          <td><strong>${escapeHtml(classItem.name || "-")}</strong></td>
          <td>${escapeHtml(classItem.level || "-")}</td>
          <td>${escapeHtml(classItem.homeroomTeacher || "-")}</td>
          <td>${countStudentsByClass(classItem.id)}</td>
          <td>${countHalaqohByClass(classItem.id)}</td>
        </tr>
      `;
    })
    .join("");
}

function renderHalaqohTable() {
  const tbody = getEl("#classPageHalaqohBody");

  if (!tbody) return;

  const halaqohList = getClassPageHalaqoh();

  if (!halaqohList.length) {
    tbody.innerHTML = `
      <tr>
        <td colspan="4">
          <div class="empty-state">
            Tidak ada data halaqoh yang cocok.
          </div>
        </td>
      </tr>
    `;
    return;
  }

  tbody.innerHTML = halaqohList
    .map((halaqoh) => {
      const classItem = getClassById(halaqoh.classId);

      return `
        <tr>
          <td><strong>${escapeHtml(halaqoh.name || "-")}</strong></td>
          <td>${escapeHtml(classItem?.name || "-")}</td>
          <td>${escapeHtml(halaqoh.teacherName || "-")}</td>
          <td>${countStudentsByHalaqoh(halaqoh.id)}</td>
        </tr>
      `;
    })
    .join("");
}

function renderClassPage() {
  renderClassPageStats();
  renderClassTable();
  renderHalaqohTable();
}

/* =========================================================
   FILTERS
========================================================= */

function populateClassPageFilters() {
  populateSelect("#classPageAcademicYear", getClassPageAcademicYears(), {
    selectedValue: classPageState.academicYear,
  });
}

/* =========================================================
   INIT
========================================================= */

function initClassHalaqohPage() {
  resetClassPageState();

  const academicYearSelect = getEl("#classPageAcademicYear");
  const searchInput = getEl("#classPageSearch");
  const openClassSheetButton = getEl("#openClassSheetButton");
  const openHalaqohSheetButton = getEl("#openHalaqohSheetButton");

  populateClassPageFilters();
  renderClassPage();

  academicYearSelect?.addEventListener("change", (event) => {
    classPageState.academicYear = event.target.value;
    renderClassPage();
  });

  searchInput?.addEventListener("input", (event) => {
    classPageState.search = event.target.value;
    renderClassPage();
  });

  openClassSheetButton?.addEventListener("click", () => {
    openSheetUrl("classSheetUrl", "Link tab CLASSES belum diatur di SETTINGS.");
  });

  openHalaqohSheetButton?.addEventListener("click", () => {
    openSheetUrl(
      "halaqohSheetUrl",
      "Link tab HALAQOH belum diatur di SETTINGS.",
    );
  });
}
