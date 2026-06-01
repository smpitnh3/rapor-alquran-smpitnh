/* =========================================================
   SISWA.JS
   Fungsi:
   - Mengisi filter halaman Data Siswa.
   - Menampilkan tabel siswa.
   - Filter berdasarkan pencarian, kelas, halaqoh, dan status.
   - Mendukung role admin/guru.
   - Mendukung data lokal dan data backend Google Sheets.
========================================================= */

const studentPageState = {
  search: "",
  classId: "all",
  halaqohId: "all",
  status: "all",
};

/* =========================================================
   OPTIONS
========================================================= */

function getStudentPageAcademicYear() {
  return getActiveAcademicYear();
}

function getStudentClassOptions() {
  return getClassesByYear(getStudentPageAcademicYear());
}

function getStudentHalaqohOptions() {
  const classes = getStudentClassOptions();
  const classIds = classes.map((classItem) => classItem.id);

  let halaqohList = DB.halaqoh.filter((halaqoh) => {
    return classIds.includes(halaqoh.classId);
  });

  if (studentPageState.classId !== "all") {
    halaqohList = halaqohList.filter((halaqoh) => {
      return halaqoh.classId === studentPageState.classId;
    });
  }

  const currentUser =
    typeof getCurrentUser === "function" ? getCurrentUser() : null;

  if (currentUser?.role === "guru" && currentUser.halaqohId) {
    halaqohList = halaqohList.filter((halaqoh) => {
      return halaqoh.id === currentUser.halaqohId;
    });
  }

  return halaqohList;
}

/* =========================================================
   FILTERED DATA
========================================================= */

function getFilteredStudentPageData() {
  const keyword = studentPageState.search.toLowerCase().trim();
  const activeAcademicYear = getStudentPageAcademicYear();

  const allowedStudents = filterStudentsByCurrentUser(DB.students);

  return allowedStudents.filter((student) => {
    const classItem = getStudentClass(student);

    const studentName = String(student.name || "").toLowerCase();
    const studentNis = String(student.nis || "").toLowerCase();

    const matchAcademicYear =
      !classItem?.academicYear || classItem.academicYear === activeAcademicYear;

    const matchKeyword =
      !keyword || studentName.includes(keyword) || studentNis.includes(keyword);

    const matchClass =
      studentPageState.classId === "all" ||
      student.classId === studentPageState.classId;

    const matchHalaqoh =
      studentPageState.halaqohId === "all" ||
      student.halaqohId === studentPageState.halaqohId;

    const studentStatusLabel = getStudentStatusLabel(student);

    const matchStatus =
      studentPageState.status === "all" ||
      studentStatusLabel === studentPageState.status;

    return (
      matchAcademicYear &&
      matchKeyword &&
      matchClass &&
      matchHalaqoh &&
      matchStatus
    );
  });
}

/* =========================================================
   RENDER
========================================================= */

function renderStudentTable() {
  const tbody = getEl("#studentTableBody");

  if (!tbody) return;

  const students = getFilteredStudentPageData();

  if (!students.length) {
    tbody.innerHTML = `
      <tr>
        <td colspan="5">
          <div class="empty-state">
            Tidak ada data siswa yang cocok dengan filter.
          </div>
        </td>
      </tr>
    `;
    return;
  }

  tbody.innerHTML = students
    .map((student) => {
      const classItem = getStudentClass(student);
      const halaqoh = getStudentHalaqoh(student);

      const statusLabel = getStudentStatusLabel(student);
      const statusClass = statusLabel === "Aktif" ? "success" : "warning";

      return `
        <tr>
          <td>${escapeHtml(student.nis || "-")}</td>
          <td>
            <strong>${escapeHtml(student.name || "-")}</strong>
          </td>
          <td>${escapeHtml(getClassLabel(classItem))}</td>
          <td>${escapeHtml(getHalaqohLabel(halaqoh))}</td>
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

function populateStudentFilters() {
  populateSelect("#studentFilterClass", getStudentClassOptions(), {
    includeAll: true,
    allLabel: "Semua Kelas",
    selectedValue: studentPageState.classId,
  });

  populateSelect("#studentFilterHalaqoh", getStudentHalaqohOptions(), {
    includeAll: true,
    allLabel: "Semua Halaqoh",
    selectedValue: studentPageState.halaqohId,
  });
}

/* =========================================================
   ROLE DEFAULT
========================================================= */

function applyStudentPageRoleDefault() {
  const currentUser =
    typeof getCurrentUser === "function" ? getCurrentUser() : null;

  const classSelect = getEl("#studentFilterClass");
  const halaqohSelect = getEl("#studentFilterHalaqoh");

  if (classSelect) {
    classSelect.disabled = false;
  }

  if (halaqohSelect) {
    halaqohSelect.disabled = false;
  }

  if (!currentUser || currentUser.role !== "guru") return;

  if (currentUser.classId) {
    studentPageState.classId = currentUser.classId;
  }

  if (currentUser.halaqohId) {
    studentPageState.halaqohId = currentUser.halaqohId;
  }

  if (classSelect) {
    classSelect.disabled = true;
  }

  if (halaqohSelect) {
    halaqohSelect.disabled = true;
  }
}

/* =========================================================
   INIT
========================================================= */

function initStudentPage() {
  resetStudentPageState();

  const studentSearch = getEl("#studentSearch");
  const studentFilterClass = getEl("#studentFilterClass");
  const studentFilterHalaqoh = getEl("#studentFilterHalaqoh");
  const studentFilterStatus = getEl("#studentFilterStatus");
  const openStudentSheetButton = getEl("#openStudentSheetButton");

  applyStudentPageRoleDefault();
  populateStudentFilters();
  renderStudentTable();

  studentSearch?.addEventListener("input", (event) => {
    studentPageState.search = event.target.value;
    renderStudentTable();
  });

  studentFilterClass?.addEventListener("change", (event) => {
    studentPageState.classId = event.target.value;
    studentPageState.halaqohId = "all";

    populateStudentFilters();
    renderStudentTable();
  });

  studentFilterHalaqoh?.addEventListener("change", (event) => {
    studentPageState.halaqohId = event.target.value;
    renderStudentTable();
  });

  studentFilterStatus?.addEventListener("change", (event) => {
    studentPageState.status = event.target.value;
    renderStudentTable();
  });

  openStudentSheetButton?.addEventListener("click", () => {
    openSheetUrl(
      "studentSheetUrl",
      "Link tab STUDENTS belum diatur di SETTINGS.",
    );
  });
}

function resetStudentPageState() {
  studentPageState.search = "";
  studentPageState.classId = "all";
  studentPageState.halaqohId = "all";
  studentPageState.status = "all";
}
