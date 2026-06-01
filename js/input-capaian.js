/* =========================================================
   INPUT-CAPAIAN.JS
   Fungsi:
   - Mengisi filter halaman Input Capaian.
   - Menampilkan siswa sesuai tahun ajaran, periode, kelas, dan halaqoh.
   - Menampilkan data progress jika sudah ada.
   - Mendukung role admin/guru.
   - Mendukung data lokal dan backend Google Sheets.
========================================================= */

const inputPageState = {
  academicYear: getActiveAcademicYear(),
  periodId: getActivePeriodId(),
  classId: "all",
  halaqohId: "all",
  search: "",
  isInitialized: false,
};

/* =========================================================
   STATE / USER
========================================================= */

function resetInputPageState() {
  inputPageState.academicYear = getActiveAcademicYear();
  inputPageState.periodId = getActivePeriodId();
  inputPageState.classId = "all";
  inputPageState.halaqohId = "all";
  inputPageState.search = "";
  inputPageState.isInitialized = false;
}

function getCurrentUserSafe() {
  return typeof getCurrentUser === "function" ? getCurrentUser() : null;
}

/* =========================================================
   OPTIONS
========================================================= */

function getInputAcademicYears() {
  const years = DB.periods.map((period) => period.academicYear).filter(Boolean);

  const uniqueYears = [...new Set(years)];

  if (!uniqueYears.length) {
    return [
      {
        id: inputPageState.academicYear,
        name: inputPageState.academicYear,
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

function getInputPeriods() {
  return getPeriodsByYear(inputPageState.academicYear);
}

function getInputClasses() {
  let classes = getClassesByYear(inputPageState.academicYear);
  const currentUser = getCurrentUserSafe();

  if (currentUser?.role === "guru" && currentUser.classId) {
    classes = classes.filter((classItem) => {
      return classItem.id === currentUser.classId;
    });
  }

  return classes;
}

function getInputHalaqohOptions() {
  const classes = getInputClasses();
  const classIds = classes.map((classItem) => classItem.id);

  let halaqohList = DB.halaqoh.filter((halaqoh) => {
    return classIds.includes(halaqoh.classId);
  });

  if (inputPageState.classId !== "all") {
    halaqohList = halaqohList.filter((halaqoh) => {
      return halaqoh.classId === inputPageState.classId;
    });
  }

  const currentUser = getCurrentUserSafe();

  if (currentUser?.role === "guru" && currentUser.halaqohId) {
    halaqohList = halaqohList.filter((halaqoh) => {
      return halaqoh.id === currentUser.halaqohId;
    });
  }

  return halaqohList;
}

/* =========================================================
   ROLE DEFAULT
========================================================= */

function applyInputPageRoleDefault() {
  const currentUser = getCurrentUserSafe();

  const yearSelect = getEl("#inputFilterYear");
  const classSelect = getEl("#inputFilterClass");
  const halaqohSelect = getEl("#inputFilterHalaqoh");

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
    inputPageState.classId = currentUser.classId;
  }

  if (currentUser.halaqohId) {
    inputPageState.halaqohId = currentUser.halaqohId;
  }

  /**
   * Tahun ajaran untuk guru dikunci agar guru fokus pada tahun ajaran aktif.
   * Jika suatu saat guru boleh memilih tahun ajaran, cukup aktifkan kembali yearSelect.
   */
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
   FILTERED DATA
========================================================= */

function getFilteredInputStudents() {
  const keyword = inputPageState.search.toLowerCase().trim();
  const allowedStudents = filterStudentsByCurrentUser(DB.students);

  return allowedStudents.filter((student) => {
    const classItem = getStudentClass(student);

    const studentName = String(student.name || "").toLowerCase();
    const studentNis = String(student.nis || "").toLowerCase();

    const matchAcademicYear =
      !classItem?.academicYear ||
      classItem.academicYear === inputPageState.academicYear;

    const matchKeyword =
      !keyword || studentName.includes(keyword) || studentNis.includes(keyword);

    const matchClass =
      inputPageState.classId === "all" ||
      student.classId === inputPageState.classId;

    const matchHalaqoh =
      inputPageState.halaqohId === "all" ||
      student.halaqohId === inputPageState.halaqohId;

    return (
      isActiveStudent(student) &&
      matchAcademicYear &&
      matchKeyword &&
      matchClass &&
      matchHalaqoh
    );
  });
}

function getInputProgressByStudent(studentId) {
  return getProgressByStudentAndPeriod(studentId, inputPageState.periodId);
}

/* =========================================================
   STATUS
========================================================= */

function getProgressBadge(status) {
  const statusConfig = {
    Tuntas: {
      className: "success",
      label: "Tuntas",
    },
    Proses: {
      className: "warning",
      label: "Proses",
    },
    "Perlu Perhatian": {
      className: "danger",
      label: "Perlu Perhatian",
    },
    "Belum Input": {
      className: "warning",
      label: "Belum Input",
    },
  };

  const config = statusConfig[status] || statusConfig["Belum Input"];

  return `<span class="badge ${config.className}">${escapeHtml(config.label)}</span>`;
}

function getOverallProgressStatus(progress) {
  if (!progress) {
    return "Belum Input";
  }

  const statuses = [
    progress.hafalanStatus,
    progress.murojaahStatus,
    progress.disciplineStatus,
  ];

  if (statuses.includes("Perlu Perhatian")) {
    return "Perlu Perhatian";
  }

  if (statuses.includes("Proses")) {
    return "Proses";
  }

  if (statuses.every((status) => status === "Tuntas")) {
    return "Tuntas";
  }

  return "Proses";
}

/* =========================================================
   RENDER HELPERS
========================================================= */

function renderProgressCell(value, status) {
  return `
    ${escapeHtml(value || "-")}<br>
    <small>${escapeHtml(status || "Belum Input")}</small>
  `;
}

function renderDisciplineCell(progress) {
  if (!progress) {
    return `
      -<br>
      <small>Belum Input</small>
    `;
  }

  return `
    ${escapeHtml(formatHari(progress.disciplineAchieved))} /
    ${escapeHtml(formatHari(progress.disciplineTarget))}<br>
    <small>${escapeHtml(progress.disciplineStatus || "-")}</small>
  `;
}

/* =========================================================
   RENDER
========================================================= */

function renderInputProgressTable() {
  const tbody = getEl("#inputProgressTableBody");

  if (!tbody) return;

  const students = getFilteredInputStudents();

  if (!students.length) {
    tbody.innerHTML = `
      <tr>
        <td colspan="9">
          <div class="empty-state">
            Tidak ada siswa yang cocok dengan filter.
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
      const progress = getInputProgressByStudent(student.id);

      const hafalanText = progress
        ? renderProgressCell(progress.totalHafalan, progress.hafalanStatus)
        : renderProgressCell("-", "Belum Input");

      const murojaahText = progress
        ? renderProgressCell(progress.totalMurojaah, progress.murojaahStatus)
        : renderProgressCell("-", "Belum Input");

      const disciplineText = renderDisciplineCell(progress);
      const overallStatus = getOverallProgressStatus(progress);
      const actionLabel = progress ? "Edit" : "Input";

      return `
        <tr>
          <td>${escapeHtml(student.nis || "-")}</td>
          <td>
            <strong>${escapeHtml(student.name || "-")}</strong>
          </td>
          <td>${escapeHtml(getClassLabel(classItem))}</td>
          <td>${escapeHtml(getHalaqohLabel(halaqoh))}</td>
          <td>${hafalanText}</td>
          <td>${murojaahText}</td>
          <td>${disciplineText}</td>
          <td>${getProgressBadge(overallStatus)}</td>
          <td>
            <button
              class="table-action-btn"
              type="button"
              data-edit-progress="${escapeHtml(student.id || "")}"
            >
              ${escapeHtml(actionLabel)}
            </button>
          </td>
        </tr>
      `;
    })
    .join("");
}

/* =========================================================
   FILTERS
========================================================= */

function syncInputStateFromSettings() {
  if (!inputPageState.isInitialized) {
    inputPageState.academicYear = getActiveAcademicYear();
    inputPageState.periodId = getActivePeriodId();
    inputPageState.isInitialized = true;
  }

  const academicYearExists = getInputAcademicYears().some((year) => {
    return year.id === inputPageState.academicYear;
  });

  if (!academicYearExists) {
    inputPageState.academicYear = getActiveAcademicYear();
    inputPageState.classId = "all";
    inputPageState.halaqohId = "all";
  }

  const periodExists = getInputPeriods().some((period) => {
    return period.id === inputPageState.periodId;
  });

  if (!periodExists) {
    inputPageState.periodId = getInputPeriods()[0]?.id || "";
  }

  const classExists =
    inputPageState.classId === "all" ||
    getInputClasses().some((classItem) => {
      return classItem.id === inputPageState.classId;
    });

  if (!classExists) {
    inputPageState.classId = "all";
    inputPageState.halaqohId = "all";
  }

  const halaqohExists =
    inputPageState.halaqohId === "all" ||
    getInputHalaqohOptions().some((halaqoh) => {
      return halaqoh.id === inputPageState.halaqohId;
    });

  if (!halaqohExists) {
    inputPageState.halaqohId = "all";
  }
}

function populateInputFilters(syncFromSettings = false) {
  if (syncFromSettings) {
    syncInputStateFromSettings();
  }

  applyInputPageRoleDefault();

  populateSelect("#inputFilterYear", getInputAcademicYears(), {
    selectedValue: inputPageState.academicYear,
  });

  populateSelect("#inputFilterPeriod", getInputPeriods(), {
    selectedValue: inputPageState.periodId,
  });

  populateSelect("#inputFilterClass", getInputClasses(), {
    includeAll: true,
    allLabel: "Semua Kelas",
    selectedValue: inputPageState.classId,
  });

  populateSelect("#inputFilterHalaqoh", getInputHalaqohOptions(), {
    includeAll: true,
    allLabel: "Semua Halaqoh",
    selectedValue: inputPageState.halaqohId,
  });

  applyInputPageRoleDefault();
}

/* =========================================================
   INIT
========================================================= */

function initInputPage() {
  resetInputPageState();

  const inputFilterYear = getEl("#inputFilterYear");
  const inputFilterPeriod = getEl("#inputFilterPeriod");
  const inputFilterClass = getEl("#inputFilterClass");
  const inputFilterHalaqoh = getEl("#inputFilterHalaqoh");
  const inputSearch = getEl("#inputSearch");

  populateInputFilters(true);
  renderInputProgressTable();

  inputFilterYear?.addEventListener("change", (event) => {
    inputPageState.academicYear = event.target.value;

    const firstPeriod = getInputPeriods()[0];
    inputPageState.periodId = firstPeriod?.id || "";

    inputPageState.classId = "all";
    inputPageState.halaqohId = "all";

    populateInputFilters();
    renderInputProgressTable();
  });

  inputFilterPeriod?.addEventListener("change", (event) => {
    inputPageState.periodId = event.target.value;
    renderInputProgressTable();
  });

  inputFilterClass?.addEventListener("change", (event) => {
    inputPageState.classId = event.target.value;
    inputPageState.halaqohId = "all";

    populateInputFilters();
    renderInputProgressTable();
  });

  inputFilterHalaqoh?.addEventListener("change", (event) => {
    inputPageState.halaqohId = event.target.value;
    renderInputProgressTable();
  });

  inputSearch?.addEventListener("input", (event) => {
    inputPageState.search = event.target.value;
    renderInputProgressTable();
  });
}
