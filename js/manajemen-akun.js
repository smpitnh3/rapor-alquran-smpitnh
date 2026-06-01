/* =========================================================
   MANAJEMEN-AKUN.JS
   Fungsi:
   - Menampilkan daftar akun.
   - Tambah akun baru.
   - Edit akun.
   - Nonaktifkan akun.
   - Khusus admin.
========================================================= */

const accountPageState = {
  role: "all",
  status: "all",
  search: "",
  editingUserId: "",
};

let accountPageInitialized = false;

/* =========================================================
   ACCESS
========================================================= */

function canManageAccounts() {
  const user = typeof getCurrentUser === "function" ? getCurrentUser() : null;

  return user?.role === "admin" || user?.canEditSettings === true;
}

function guardAccountPageAccess() {
  if (canManageAccounts()) return true;

  showWarning("Kamu tidak memiliki akses untuk mengelola akun.");
  setActivePage("dashboard");

  return false;
}

/* =========================================================
   HELPERS
========================================================= */

function isTruthyValue(value) {
  return value === true || String(value).toLowerCase() === "true";
}

function normalizeUserStatus(user) {
  return isTruthyValue(user?.isActive);
}

function getUserClassLabel(user) {
  const classItem = DB.classes.find((item) => {
    return item.id === user?.classId;
  });

  return getClassLabel(classItem);
}

function getUserHalaqohLabel(user) {
  const halaqoh = DB.halaqoh.find((item) => {
    return item.id === user?.halaqohId;
  });

  return getHalaqohLabel(halaqoh);
}

function getAccountById(userId) {
  return DB.users.find((user) => {
    return user.id === userId;
  });
}

function getAccountPermissionBadges(user) {
  const badges = [];

  if (isTruthyValue(user.canEditSettings)) {
    badges.push(`<span class="badge success">Settings</span>`);
  }

  if (isTruthyValue(user.canEditMasterData)) {
    badges.push(`<span class="badge warning">Master Data</span>`);
  }

  if (isTruthyValue(user.canGenerateFile)) {
    badges.push(`<span class="badge success">Generate</span>`);
  }

  if (!badges.length) {
    return `<span class="badge warning">Terbatas</span>`;
  }

  return `<div class="account-permission-list">${badges.join("")}</div>`;
}

function getFilteredAccounts() {
  const keyword = accountPageState.search.toLowerCase().trim();

  return (DB.users || []).filter((user) => {
    const matchRole =
      accountPageState.role === "all" || user.role === accountPageState.role;

    const isActive = normalizeUserStatus(user);

    const matchStatus =
      accountPageState.status === "all" ||
      (accountPageState.status === "active" && isActive) ||
      (accountPageState.status === "inactive" && !isActive);

    const matchKeyword =
      !keyword ||
      String(user.name || "")
        .toLowerCase()
        .includes(keyword) ||
      String(user.email || "")
        .toLowerCase()
        .includes(keyword);

    return matchRole && matchStatus && matchKeyword;
  });
}

/* =========================================================
   OPTIONS
========================================================= */

function populateAccountClassOptions() {
  populateSelect("#accountClassId", DB.classes || [], {
    selectedValue: getEl("#accountClassId")?.value || "",
  });
}

function populateAccountHalaqohOptions(classId = "") {
  let halaqohList = DB.halaqoh || [];

  if (classId) {
    halaqohList = halaqohList.filter((halaqoh) => {
      return halaqoh.classId === classId;
    });
  }

  populateSelect("#accountHalaqohId", halaqohList, {
    selectedValue: getEl("#accountHalaqohId")?.value || "",
  });
}

function toggleAccountTeacherFields() {
  const role = getEl("#accountRole")?.value || "guru";
  const teacherFields = getEl("#accountTeacherFields");

  if (!teacherFields) return;

  teacherFields.style.display = role === "guru" ? "grid" : "none";

  if (role === "admin") {
    setInputValue("#accountClassId", "");
    setInputValue("#accountHalaqohId", "");
  }
}

function applyRolePermissionDefaults() {
  const role = getEl("#accountRole")?.value || "guru";

  const canEditSettings = getEl("#accountCanEditSettings");
  const canEditMasterData = getEl("#accountCanEditMasterData");
  const canGenerateFile = getEl("#accountCanGenerateFile");

  if (role === "admin") {
    if (canEditSettings) canEditSettings.checked = true;
    if (canEditMasterData) canEditMasterData.checked = true;
    if (canGenerateFile) canGenerateFile.checked = true;
    return;
  }

  if (canEditSettings) canEditSettings.checked = false;
  if (canEditMasterData) canEditMasterData.checked = false;
  if (canGenerateFile) canGenerateFile.checked = true;
}

/* =========================================================
   RENDER
========================================================= */

function renderAccountStats() {
  const users = DB.users || [];

  const totalAdmin = users.filter((user) => {
    return user.role === "admin";
  }).length;

  const totalTeacher = users.filter((user) => {
    return user.role === "guru";
  }).length;

  const totalActive = users.filter((user) => {
    return normalizeUserStatus(user);
  }).length;

  setText("#accountTotalUser", users.length);
  setText("#accountTotalAdmin", totalAdmin);
  setText("#accountTotalTeacher", totalTeacher);
  setText("#accountTotalActive", totalActive);
}

function renderAccountTable() {
  const tbody = getEl("#accountTableBody");

  if (!tbody) return;

  const users = getFilteredAccounts();

  if (!users.length) {
    tbody.innerHTML = `
      <tr>
        <td colspan="8">
          <div class="empty-state">
            Tidak ada akun yang cocok.
          </div>
        </td>
      </tr>
    `;
    return;
  }

  tbody.innerHTML = users
    .map((user) => {
      const isActive = normalizeUserStatus(user);
      const statusClass = isActive ? "success" : "danger";
      const statusLabel = isActive ? "Aktif" : "Nonaktif";

      return `
        <tr>
          <td><strong>${escapeHtml(user.name || "-")}</strong></td>
          <td>${escapeHtml(user.email || "-")}</td>
          <td>${escapeHtml(user.role || "-")}</td>
          <td>${escapeHtml(user.role === "guru" ? getUserClassLabel(user) : "-")}</td>
          <td>${escapeHtml(user.role === "guru" ? getUserHalaqohLabel(user) : "-")}</td>
          <td>${getAccountPermissionBadges(user)}</td>
          <td>
            <span class="badge ${statusClass}">
              ${escapeHtml(statusLabel)}
            </span>
          </td>
          <td>
            <div class="account-action-group">
              <button
                class="table-action-btn"
                type="button"
                data-edit-account="${escapeHtml(user.id || "")}"
              >
                Edit
              </button>

              <button
                class="table-action-btn ${isActive ? "account-action-danger" : "account-action-success"}"
                type="button"
                data-toggle-account-status="${escapeHtml(user.id || "")}"
              >
                ${isActive ? "Nonaktifkan" : "Aktifkan"}
              </button>
            </div>
          </td>
        </tr>
      `;
    })
    .join("");
}

function renderAccountPage() {
  renderAccountStats();
  renderAccountTable();
}

/* =========================================================
   MODAL
========================================================= */

function resetAccountForm() {
  accountPageState.editingUserId = "";

  setInputValue("#accountUserId", "");
  setInputValue("#accountName", "");
  setInputValue("#accountEmail", "");
  setInputValue("#accountPassword", "");
  setInputValue("#accountRole", "guru");
  setInputValue("#accountDefaultPage", "dashboard");

  const canEditSettings = getEl("#accountCanEditSettings");
  const canEditMasterData = getEl("#accountCanEditMasterData");
  const canGenerateFile = getEl("#accountCanGenerateFile");
  const isActive = getEl("#accountIsActive");

  if (canEditSettings) canEditSettings.checked = false;
  if (canEditMasterData) canEditMasterData.checked = false;
  if (canGenerateFile) canGenerateFile.checked = true;
  if (isActive) isActive.checked = true;

  populateAccountClassOptions();
  populateAccountHalaqohOptions();
  toggleAccountTeacherFields();
}

function openAccountModal(userId = "") {
  if (!guardAccountPageAccess()) return;

  const modal = getEl("#accountModalOverlay");
  const title = getEl("#accountModalTitle");
  const subtitle = getEl("#accountModalSubtitle");

  if (!modal) return;

  resetAccountForm();

  if (userId) {
    const user = getAccountById(userId);

    if (!user) {
      showWarning("Data akun tidak ditemukan.");
      return;
    }

    accountPageState.editingUserId = userId;

    if (title) title.textContent = "Edit Akun";
    if (subtitle) {
      subtitle.textContent =
        "Perbarui data akun. Kosongkan password jika tidak ingin mengganti password.";
    }

    setInputValue("#accountUserId", user.id || "");
    setInputValue("#accountName", user.name || "");
    setInputValue("#accountEmail", user.email || "");
    setInputValue("#accountPassword", "");
    setInputValue("#accountRole", user.role || "guru");
    setInputValue("#accountDefaultPage", user.defaultPage || "dashboard");

    populateAccountClassOptions();
    setInputValue("#accountClassId", user.classId || "");

    populateAccountHalaqohOptions(user.classId || "");
    setInputValue("#accountHalaqohId", user.halaqohId || "");

    const canEditSettings = getEl("#accountCanEditSettings");
    const canEditMasterData = getEl("#accountCanEditMasterData");
    const canGenerateFile = getEl("#accountCanGenerateFile");
    const isActive = getEl("#accountIsActive");

    if (canEditSettings) {
      canEditSettings.checked = isTruthyValue(user.canEditSettings);
    }

    if (canEditMasterData) {
      canEditMasterData.checked = isTruthyValue(user.canEditMasterData);
    }

    if (canGenerateFile) {
      canGenerateFile.checked = isTruthyValue(user.canGenerateFile);
    }

    if (isActive) {
      isActive.checked = normalizeUserStatus(user);
    }
  } else {
    if (title) title.textContent = "Tambah Akun";
    if (subtitle) {
      subtitle.textContent = "Buat akun baru untuk admin atau guru.";
    }

    applyRolePermissionDefaults();
  }

  toggleAccountTeacherFields();

  modal.classList.add("is-open");
  modal.setAttribute("aria-hidden", "false");
  document.body.classList.add("modal-open");
}

function closeAccountModal() {
  const modal = getEl("#accountModalOverlay");

  if (!modal) return;

  modal.classList.remove("is-open");
  modal.setAttribute("aria-hidden", "true");
  document.body.classList.remove("modal-open");

  resetAccountForm();
}

/* =========================================================
   PAYLOAD
========================================================= */

function buildAccountPayload() {
  const role = getEl("#accountRole")?.value || "guru";
  const password = getEl("#accountPassword")?.value || "";
  const existingUser = accountPageState.editingUserId
    ? getAccountById(accountPageState.editingUserId)
    : null;

  return {
    id: accountPageState.editingUserId || `user_${role}_${Date.now()}`,

    name: getEl("#accountName")?.value.trim() || "",
    email: getEl("#accountEmail")?.value.trim().toLowerCase() || "",
    role,
    password,

    halaqohId: role === "guru" ? getEl("#accountHalaqohId")?.value || "" : "",
    classId: role === "guru" ? getEl("#accountClassId")?.value || "" : "",

    defaultPage: getEl("#accountDefaultPage")?.value || "dashboard",

    canEditSettings: Boolean(getEl("#accountCanEditSettings")?.checked),
    canEditMasterData: Boolean(getEl("#accountCanEditMasterData")?.checked),
    canGenerateFile: Boolean(getEl("#accountCanGenerateFile")?.checked),
    isActive: Boolean(getEl("#accountIsActive")?.checked),

    createdAt: existingUser?.createdAt || new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  };
}

function validateAccountPayload(payload) {
  const errors = [];

  if (!payload.name) {
    errors.push("Nama lengkap wajib diisi.");
  }

  if (!payload.email) {
    errors.push("Email wajib diisi.");
  }

  if (payload.email && !payload.email.includes("@")) {
    errors.push("Format email belum valid.");
  }

  if (!payload.role) {
    errors.push("Role wajib dipilih.");
  }

  if (!accountPageState.editingUserId && !payload.password) {
    errors.push("Password awal wajib diisi untuk akun baru.");
  }

  if (payload.password && payload.password.length < 6) {
    errors.push("Password minimal 6 karakter.");
  }

  if (payload.role === "guru" && !payload.classId) {
    errors.push("Kelas wajib dipilih untuk akun guru.");
  }

  if (payload.role === "guru" && !payload.halaqohId) {
    errors.push("Halaqoh wajib dipilih untuk akun guru.");
  }

  const emailUsed = (DB.users || []).some((user) => {
    return (
      String(user.email || "").toLowerCase() === payload.email &&
      user.id !== payload.id
    );
  });

  if (emailUsed) {
    errors.push("Email sudah digunakan akun lain.");
  }

  return {
    isValid: errors.length === 0,
    errors,
  };
}

/* =========================================================
   SAVE / DELETE
========================================================= */

function upsertUserLocal(user) {
  const index = DB.users.findIndex((item) => {
    return item.id === user.id;
  });

  if (index >= 0) {
    DB.users[index] = {
      ...DB.users[index],
      ...user,
    };
    return;
  }

  DB.users.push(user);
}

async function handleSaveAccount(event) {
  event.preventDefault();

  if (!guardAccountPageAccess()) return;

  const payload = buildAccountPayload();
  const validation = validateAccountPayload(payload);

  if (!validation.isValid) {
    Swal.fire({
      icon: "warning",
      title: "Data akun belum valid",
      html: `
        <div style="text-align:left">
          <ul>
            ${validation.errors
              .map((error) => `<li>${escapeHtml(error)}</li>`)
              .join("")}
          </ul>
        </div>
      `,
      confirmButtonText: "Perbaiki",
    });

    return;
  }

  try {
    Swal.fire({
      title: "Menyimpan akun...",
      text: "Data akun sedang disimpan.",
      allowOutsideClick: false,
      didOpen: () => {
        Swal.showLoading();
      },
    });

    const savedUser = accountPageState.editingUserId
      ? await updateUserApi(payload)
      : await createUserApi(payload);

    upsertUserLocal(savedUser || payload);

    if (typeof updateDatabaseCacheFromCurrentDB === "function") {
      updateDatabaseCacheFromCurrentDB();
    }

    closeAccountModal();
    renderAccountPage();

    Swal.fire({
      icon: "success",
      title: "Akun Disimpan",
      text: "Data akun berhasil disimpan.",
      timer: 1500,
      showConfirmButton: false,
    });
  } catch (error) {
    Swal.fire({
      icon: "error",
      title: "Gagal menyimpan akun",
      text: error.message || "Akun gagal disimpan.",
    });
  }
}

async function handleToggleAccountStatus(userId) {
  if (!guardAccountPageAccess()) return;

  const user = getAccountById(userId);

  if (!user) {
    showWarning("Data akun tidak ditemukan.");
    return;
  }

  const currentUser =
    typeof getCurrentUser === "function" ? getCurrentUser() : null;

  const isActive = normalizeUserStatus(user);
  const nextStatus = !isActive;

  if (currentUser?.id === userId && !nextStatus) {
    showWarning("Akun yang sedang digunakan tidak boleh dinonaktifkan.");
    return;
  }

  const result = await Swal.fire({
    icon: "warning",
    title: nextStatus ? "Aktifkan akun?" : "Nonaktifkan akun?",
    text: nextStatus
      ? `Akun ${user.name || user.email} akan bisa login kembali.`
      : `Akun ${user.name || user.email} tidak akan bisa login.`,
    showCancelButton: true,
    confirmButtonText: nextStatus ? "Ya, aktifkan" : "Ya, nonaktifkan",
    cancelButtonText: "Batal",
  });

  if (!result.isConfirmed) return;

  try {
    Swal.fire({
      title: nextStatus ? "Mengaktifkan akun..." : "Menonaktifkan akun...",
      allowOutsideClick: false,
      didOpen: () => {
        Swal.showLoading();
      },
    });

    const payload = {
      ...user,
      isActive: nextStatus,
      password: "",
      updatedAt: new Date().toISOString(),
    };

    const savedUser = await updateUserApi(payload);

    upsertUserLocal({
      ...user,
      ...savedUser,
      isActive: nextStatus,
      updatedAt: new Date().toISOString(),
    });

    if (typeof updateDatabaseCacheFromCurrentDB === "function") {
      updateDatabaseCacheFromCurrentDB();
    }

    renderAccountPage();

    Swal.fire({
      icon: "success",
      title: nextStatus ? "Akun Diaktifkan" : "Akun Dinonaktifkan",
      text: nextStatus
        ? "Akun berhasil diaktifkan kembali."
        : "Akun berhasil dinonaktifkan.",
      timer: 1500,
      showConfirmButton: false,
    });
  } catch (error) {
    Swal.fire({
      icon: "error",
      title: nextStatus
        ? "Gagal mengaktifkan akun"
        : "Gagal menonaktifkan akun",
      text: error.message || "Status akun gagal diperbarui.",
    });
  }
}

/* =========================================================
   INIT
========================================================= */

function initAccountManagementPage() {
  if (accountPageInitialized) return;

  accountPageInitialized = true;

  const openButton = getEl("#openAccountModalButton");
  const closeButton = getEl("#accountModalClose");
  const cancelButton = getEl("#accountModalCancel");
  const form = getEl("#accountForm");
  const modal = getEl("#accountModalOverlay");
  const roleFilter = getEl("#accountRoleFilter");
  const statusFilter = getEl("#accountStatusFilter");
  const searchInput = getEl("#accountSearchInput");
  const roleSelect = getEl("#accountRole");
  const classSelect = getEl("#accountClassId");
  const tableBody = getEl("#accountTableBody");

  if (!getEl('[data-view="akun"]')) return;

  populateAccountClassOptions();
  populateAccountHalaqohOptions();
  renderAccountPage();

  openButton?.addEventListener("click", () => {
    openAccountModal();
  });

  closeButton?.addEventListener("click", closeAccountModal);
  cancelButton?.addEventListener("click", closeAccountModal);
  form?.addEventListener("submit", handleSaveAccount);

  modal?.addEventListener("click", (event) => {
    if (event.target === modal) {
      closeAccountModal();
    }
  });

  roleFilter?.addEventListener("change", (event) => {
    accountPageState.role = event.target.value;
    renderAccountPage();
  });

  statusFilter?.addEventListener("change", (event) => {
    accountPageState.status = event.target.value;
    renderAccountPage();
  });

  searchInput?.addEventListener("input", (event) => {
    accountPageState.search = event.target.value;
    renderAccountPage();
  });

  roleSelect?.addEventListener("change", () => {
    applyRolePermissionDefaults();
    toggleAccountTeacherFields();
  });

  classSelect?.addEventListener("change", (event) => {
    populateAccountHalaqohOptions(event.target.value);
  });

  tableBody?.addEventListener("click", (event) => {
    const editButton = event.target.closest("[data-edit-account]");
    const statusButton = event.target.closest("[data-toggle-account-status]");

    if (editButton) {
      openAccountModal(editButton.dataset.editAccount);
      return;
    }

    if (statusButton) {
      handleToggleAccountStatus(statusButton.dataset.toggleAccountStatus);
    }
  });
}
