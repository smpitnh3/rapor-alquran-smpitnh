/* =========================================================
   OPTIONS / FILTER
========================================================= */

function getBulkAcademicYears() {
  const years = DB.periods.map((period) => period.academicYear).filter(Boolean);

  const uniqueYears = [...new Set(years)];

  if (!uniqueYears.length) {
    return [
      {
        id: bulkInputState.academicYear,
        name: bulkInputState.academicYear,
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

function getBulkPeriods() {
  return getPeriodsByYear(bulkInputState.academicYear);
}

function getBulkClasses() {
  let classes = getClassesByYear(bulkInputState.academicYear);
  const user = getBulkCurrentUser();

  if (user?.role === "guru" && user.classId) {
    classes = classes.filter((classItem) => {
      return classItem.id === user.classId;
    });
  }

  return classes;
}

function getBulkHalaqohOptions() {
  const classes = getBulkClasses();
  const classIds = classes.map((classItem) => classItem.id);

  let halaqohList = DB.halaqoh.filter((halaqoh) => {
    return classIds.includes(halaqoh.classId);
  });

  if (bulkInputState.classId !== "all") {
    halaqohList = halaqohList.filter((halaqoh) => {
      return halaqoh.classId === bulkInputState.classId;
    });
  }

  const user = getBulkCurrentUser();

  if (user?.role === "guru" && user.halaqohId) {
    halaqohList = halaqohList.filter((halaqoh) => {
      return halaqoh.id === user.halaqohId;
    });
  }

  return halaqohList;
}

function applyBulkRoleDefault() {
  const user = getBulkCurrentUser();

  const yearSelect = getEl("#bulkFilterYear");
  const classSelect = getEl("#bulkFilterClass");
  const halaqohSelect = getEl("#bulkFilterHalaqoh");

  if (yearSelect) yearSelect.disabled = false;
  if (classSelect) classSelect.disabled = false;
  if (halaqohSelect) halaqohSelect.disabled = false;

  if (!user || user.role !== "guru") return;

  if (user.classId) {
    bulkInputState.classId = user.classId;
  }

  if (user.halaqohId) {
    bulkInputState.halaqohId = user.halaqohId;
  }

  if (yearSelect) yearSelect.disabled = true;
  if (classSelect) classSelect.disabled = true;
  if (halaqohSelect) halaqohSelect.disabled = true;
}

function populateBulkFilters() {
  applyBulkRoleDefault();

  populateSelect("#bulkFilterYear", getBulkAcademicYears(), {
    selectedValue: bulkInputState.academicYear,
  });

  populateSelect("#bulkFilterPeriod", getBulkPeriods(), {
    selectedValue: bulkInputState.periodId,
  });

  populateSelect("#bulkFilterClass", getBulkClasses(), {
    includeAll: true,
    allLabel: "Semua Kelas",
    selectedValue: bulkInputState.classId,
  });

  populateSelect("#bulkFilterHalaqoh", getBulkHalaqohOptions(), {
    includeAll: true,
    allLabel: "Semua Halaqoh",
    selectedValue: bulkInputState.halaqohId,
  });

  applyBulkRoleDefault();
}
