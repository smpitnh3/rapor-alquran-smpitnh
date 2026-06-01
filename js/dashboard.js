/* =========================================================
   DASHBOARD.JS
   Fungsi:
   - Mengisi filter dashboard.
   - Menghitung statistik dashboard.
   - Render ringkasan halaqoh.
   - Render siswa perlu perhatian.
   - Sudah mendukung data lokal dan data backend.
========================================================= */

const dashboardState = {
  academicYear: getActiveAcademicYear(),
  periodId: getActivePeriodId(),
  classId: "all",
  halaqohId: "all",
  isInitialized: false,
};

/* =========================================================
   DASHBOARD OPTIONS
========================================================= */

function getDashboardAcademicYears() {
  const years = DB.periods.map((period) => period.academicYear).filter(Boolean);

  const uniqueYears = [...new Set(years)];

  if (!uniqueYears.length) {
    return [
      {
        id: dashboardState.academicYear,
        name: dashboardState.academicYear,
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

function getDashboardPeriods() {
  return getPeriodsByYear(dashboardState.academicYear);
}

function getDashboardClasses() {
  return getClassesByYear(dashboardState.academicYear);
}

function getDashboardHalaqohOptions() {
  const classes = getDashboardClasses();
  const classIds = classes.map((classItem) => classItem.id);

  let halaqohList = DB.halaqoh.filter((halaqoh) => {
    return classIds.includes(halaqoh.classId);
  });

  if (dashboardState.classId !== "all") {
    halaqohList = halaqohList.filter((halaqoh) => {
      return halaqoh.classId === dashboardState.classId;
    });
  }

  return halaqohList;
}

/* =========================================================
   DASHBOARD FILTERED DATA
========================================================= */

function getDashboardStudents() {
  const visibleStudents = getVisibleStudents();

  return visibleStudents.filter((student) => {
    const classItem = getStudentClass(student);

    const matchAcademicYear =
      !classItem?.academicYear ||
      classItem.academicYear === dashboardState.academicYear;

    const matchClass =
      dashboardState.classId === "all" ||
      student.classId === dashboardState.classId;

    const matchHalaqoh =
      dashboardState.halaqohId === "all" ||
      student.halaqohId === dashboardState.halaqohId;

    return matchAcademicYear && matchClass && matchHalaqoh;
  });
}

function getDashboardProgressByStudent(studentId) {
  return getProgressByStudentAndPeriod(studentId, dashboardState.periodId);
}

function getDashboardHalaqohSummaryData() {
  let halaqohList = getDashboardHalaqohOptions();

  if (dashboardState.halaqohId !== "all") {
    halaqohList = halaqohList.filter((halaqoh) => {
      return halaqoh.id === dashboardState.halaqohId;
    });
  }

  return halaqohList.map((halaqoh) => {
    const classItem = DB.classes.find((item) => item.id === halaqoh.classId);

    const students = getVisibleStudents().filter((student) => {
      const studentClass = getStudentClass(student);

      const matchAcademicYear =
        !studentClass?.academicYear ||
        studentClass.academicYear === dashboardState.academicYear;

      return student.halaqohId === halaqoh.id && matchAcademicYear;
    });

    const progressList = students
      .map((student) => getDashboardProgressByStudent(student.id))
      .filter(Boolean);

    const needAttention = students.filter((student) => {
      const progress = getDashboardProgressByStudent(student.id);
      return isAttentionProgress(progress);
    }).length;

    return {
      halaqoh,
      classItem,
      totalStudents: students.length,
      totalInput: progressList.length,
      needAttention,
    };
  });
}

/* =========================================================
   DASHBOARD STATS
========================================================= */

function getDashboardStats() {
  const students = getDashboardStudents();

  const progressList = students
    .map((student) => getDashboardProgressByStudent(student.id))
    .filter(Boolean);

  const totalStudents = students.length;
  const totalInput = progressList.length;

  const totalCompleted = progressList.filter((progress) => {
    return isCompletedProgress(progress);
  }).length;

  const totalNeedAttention = students.filter((student) => {
    const progress = getDashboardProgressByStudent(student.id);

    return !progress || isAttentionProgress(progress);
  }).length;

  return {
    totalStudents,
    totalInput,
    totalCompleted,
    totalNeedAttention,
  };
}

function renderDashboardStats() {
  const stats = getDashboardStats();

  setText("#statTotalStudents", stats.totalStudents);
  setText("#statCompleted", stats.totalInput);
  setText("#statCompletedProgress", stats.totalCompleted);
  setText("#statAttention", stats.totalNeedAttention);
}

/* =========================================================
   RENDER HALAQOH SUMMARY
========================================================= */

function renderHalaqohSummary() {
  const tbody = getEl("#halaqohSummaryBody");

  if (!tbody) return;

  const summaryData = getDashboardHalaqohSummaryData();

  if (!summaryData.length) {
    tbody.innerHTML = `
      <tr>
        <td colspan="6">
          <div class="empty-state">Belum ada data halaqoh.</div>
        </td>
      </tr>
    `;
    return;
  }

  tbody.innerHTML = summaryData
    .map((item) => {
      const { halaqoh, classItem, totalStudents, totalInput, needAttention } =
        item;

      const notInput = totalStudents - totalInput;

      let statusBadge = `<span class="badge success">Aman</span>`;

      if (needAttention > 0) {
        statusBadge = `<span class="badge danger">${needAttention} Perlu Perhatian</span>`;
      } else if (notInput > 0) {
        statusBadge = `<span class="badge warning">${notInput} Belum Input</span>`;
      }

      return `
        <tr>
          <td>${escapeHtml(getHalaqohLabel(halaqoh))}</td>
          <td>${escapeHtml(getClassLabel(classItem))}</td>
          <td>${escapeHtml(halaqoh.teacherName || "-")}</td>
          <td>${totalStudents}</td>
          <td>${totalInput}</td>
          <td>${statusBadge}</td>
        </tr>
      `;
    })
    .join("");
}

/* =========================================================
   RENDER ATTENTION LIST
========================================================= */

function getDashboardPlainText(value = "") {
  const wrapper = document.createElement("div");
  wrapper.innerHTML = sanitizeRichText(value || "");

  return wrapper.textContent.trim();
}

function renderNeedAttentionList() {
  const container = getEl("#attentionList");

  if (!container) return;

  const students = getDashboardStudents();

  const needAttentionStudents = students
    .map((student) => {
      const progress = getDashboardProgressByStudent(student.id);
      const classItem = getStudentClass(student);
      const halaqoh = getStudentHalaqoh(student);

      if (!progress) {
        return {
          name: student.name,
          className: getClassLabel(classItem),
          halaqohName: getHalaqohLabel(halaqoh),
          title: "Belum Input",
          note: "Capaian siswa belum diinput pada periode ini.",
          badge: "warning",
        };
      }

      if (isAttentionProgress(progress)) {
        return {
          name: student.name,
          className: getClassLabel(classItem),
          halaqohName: getHalaqohLabel(halaqoh),
          title: "Perlu Perhatian",
          note:
            getDashboardPlainText(progress.noteHafalan || progress.note) ||
            "Perlu pendampingan lanjutan.",
          badge: "danger",
        };
      }

      return null;
    })
    .filter(Boolean);

  if (!needAttentionStudents.length) {
    container.innerHTML = `
      <div class="empty-state">
        Alhamdulillah, semua data siswa pada filter ini sudah aman.
      </div>
    `;
    return;
  }

  container.innerHTML = needAttentionStudents
    .map((item) => {
      return `
    <div class="attention-item">
      <h4>${escapeHtml(item.name)}</h4>
      <p>${escapeHtml(item.className)} • ${escapeHtml(item.halaqohName)}</p>
      <p>${escapeHtml(item.note)}</p>
      <span class="badge ${escapeHtml(item.badge)}">${escapeHtml(item.title)}</span>
    </div>
  `;
    })
    .join("");
}

/* =========================================================
   FILTERS
========================================================= */

function syncDashboardStateFromSettings() {
  if (!dashboardState.isInitialized) {
    dashboardState.academicYear = getActiveAcademicYear();
    dashboardState.periodId = getActivePeriodId();
    dashboardState.isInitialized = true;
  }

  const academicYearExists = getDashboardAcademicYears().some((year) => {
    return year.id === dashboardState.academicYear;
  });

  if (!academicYearExists) {
    dashboardState.academicYear = getActiveAcademicYear();
    dashboardState.classId = "all";
    dashboardState.halaqohId = "all";
  }

  const periodExists = getDashboardPeriods().some((period) => {
    return period.id === dashboardState.periodId;
  });

  if (!periodExists) {
    dashboardState.periodId = getDashboardPeriods()[0]?.id || "";
  }

  const classExists =
    dashboardState.classId === "all" ||
    getDashboardClasses().some((classItem) => {
      return classItem.id === dashboardState.classId;
    });

  if (!classExists) {
    dashboardState.classId = "all";
    dashboardState.halaqohId = "all";
  }

  const halaqohExists =
    dashboardState.halaqohId === "all" ||
    getDashboardHalaqohOptions().some((halaqoh) => {
      return halaqoh.id === dashboardState.halaqohId;
    });

  if (!halaqohExists) {
    dashboardState.halaqohId = "all";
  }
}

function populateDashboardFilters() {
  syncDashboardStateFromSettings();

  populateSelect("#filterYear", getDashboardAcademicYears(), {
    selectedValue: dashboardState.academicYear,
  });

  populateSelect("#filterPeriod", getDashboardPeriods(), {
    selectedValue: dashboardState.periodId,
  });

  populateSelect("#filterClass", getDashboardClasses(), {
    includeAll: true,
    allLabel: "Semua Kelas",
    selectedValue: dashboardState.classId,
  });

  populateSelect("#filterHalaqoh", getDashboardHalaqohOptions(), {
    includeAll: true,
    allLabel: "Semua Halaqoh",
    selectedValue: dashboardState.halaqohId,
  });
}

function initDashboardFilters() {
  const filterAcademicYear = getEl("#filterYear");
  const filterPeriod = getEl("#filterPeriod");
  const filterClass = getEl("#filterClass");
  const filterHalaqoh = getEl("#filterHalaqoh");

  filterAcademicYear?.addEventListener("change", (event) => {
    dashboardState.academicYear = event.target.value;

    const firstPeriod = getDashboardPeriods()[0];
    dashboardState.periodId = firstPeriod?.id || "";

    dashboardState.classId = "all";
    dashboardState.halaqohId = "all";

    populateDashboardFilters();
    renderDashboardData();
  });

  filterPeriod?.addEventListener("change", (event) => {
    dashboardState.periodId = event.target.value;
    renderDashboardData();
  });

  filterClass?.addEventListener("change", (event) => {
    dashboardState.classId = event.target.value;
    dashboardState.halaqohId = "all";

    populateDashboardFilters();
    renderDashboardData();
  });

  filterHalaqoh?.addEventListener("change", (event) => {
    dashboardState.halaqohId = event.target.value;
    renderDashboardData();
  });
}

/* =========================================================
   INIT
========================================================= */

function renderDashboardData() {
  renderDashboardStats();
  renderHalaqohSummary();
  renderNeedAttentionList();
}

function initDashboardData() {
  populateDashboardFilters();
  initDashboardFilters();
  renderDashboardData();
}
