/* =========================================================
   AUTH.JS
   Login, session user, dan akses role.
========================================================= */

const AUTH_STORAGE_KEY = "rapor_current_user";

/**
 * Ambil user yang sedang login dari localStorage.
 */
function getCurrentUser() {
  const rawUser = localStorage.getItem(AUTH_STORAGE_KEY);

  if (!rawUser) return null;

  try {
    return JSON.parse(rawUser);
  } catch (error) {
    localStorage.removeItem(AUTH_STORAGE_KEY);
    return null;
  }
}

/**
 * Simpan user login ke localStorage.
 */
function setCurrentUser(user) {
  localStorage.setItem(AUTH_STORAGE_KEY, JSON.stringify(user));
}

/**
 * Hapus session user.
 */
function clearCurrentUser() {
  localStorage.removeItem(AUTH_STORAGE_KEY);
}

/**
 * Cek apakah user sudah login.
 */
function isLoggedIn() {
  return !!getCurrentUser();
}

/**
 * Ambil role user.
 */
function getCurrentUserRole() {
  const user = getCurrentUser();
  return user?.role || null;
}

/**
 * Cek apakah user admin.
 */
function isAdminUser() {
  return getCurrentUserRole() === "admin";
}

/**
 * Cek apakah user guru.
 */
function isGuruUser() {
  return getCurrentUserRole() === "guru";
}

/**
 * Login user ke backend.
 */
async function handleLoginSubmit(event) {
  event.preventDefault();

  const emailInput = document.querySelector("#loginEmail");
  const passwordInput = document.querySelector("#loginPassword");

  const email = emailInput?.value.trim();
  const password = passwordInput?.value.trim();

  if (!email || !password) {
    Swal.fire({
      icon: "warning",
      title: "Login belum lengkap",
      text: "Email dan password wajib diisi.",
    });
    return;
  }

  try {
    Swal.fire({
      title: "Memproses login...",
      text: "Mohon tunggu sebentar.",
      allowOutsideClick: false,
      didOpen: () => {
        Swal.showLoading();
      },
    });

    const user = await loginUserApi(email, password);

    setCurrentUser(user);

    Swal.close();

    Swal.fire({
      icon: "success",
      title: "Login berhasil",
      text: `Selamat datang, ${user.name}.`,
      timer: 1200,
      showConfirmButton: false,
    });

    setTimeout(() => {
      showAppAfterLogin(user);
    }, 1200);
  } catch (error) {
    Swal.fire({
      icon: "error",
      title: "Login gagal",
      text: error.message || "Email atau password tidak sesuai.",
    });
  }
}

/**
 * Tampilkan aplikasi setelah login.
 */
function showAppAfterLogin(user = getCurrentUser()) {
  const loginPage = document.querySelector("#loginPage");
  const appShell = document.querySelector("#appShell");

  if (loginPage) loginPage.classList.add("hidden");
  if (appShell) appShell.classList.remove("hidden");

  updateCurrentUserInfo(user);

  if (typeof renderCurrentUserInfo === "function") {
    renderCurrentUserInfo();
  }

  applyRoleAccess();

  if (user?.role === "guru") {
    navigateToPageById("input");

    setTimeout(() => {
      applyGuruDefaultFilter(user);
    }, 100);

    return;
  }

  navigateToPageById(user?.defaultPage || "dashboard");
}

/**
 * Tampilkan halaman login.
 */
function showLoginPage() {
  const loginPage = document.querySelector("#loginPage");
  const appShell = document.querySelector("#appShell");

  if (loginPage) loginPage.classList.remove("hidden");
  if (appShell) appShell.classList.add("hidden");
}

function navigateToPageById(pageId) {
  if (typeof setActivePage === "function") {
    setActivePage(pageId);
    return;
  }

  const navButton = document.querySelector(`[data-page="${pageId}"]`);

  if (navButton) {
    navButton.click();
  }
}

/**
 * Menentukan tampilan awal aplikasi.
 */
function initAuth() {
  const loginForm = document.querySelector("#loginForm");

  if (loginForm) {
    loginForm.addEventListener("submit", handleLoginSubmit);
  }

  const user = getCurrentUser();

  if (user) {
    showAppAfterLogin(user);
  } else {
    showLoginPage();
  }
}

/**
 * Logout user.
 */
function logoutUser() {
  clearCurrentUser();
  localStorage.removeItem("activePage");

  document.body.removeAttribute("data-role");

  Swal.fire({
    icon: "success",
    title: "Logout berhasil",
    timer: 1000,
    showConfirmButton: false,
  });

  setTimeout(() => {
    showLoginPage();
  }, 1000);
}

/**
 * Hubungkan semua tombol logout.
 */
function initAuthLogoutButtons() {
  const logoutButtons = document.querySelectorAll("[data-logout]");

  logoutButtons.forEach((button) => {
    button.addEventListener("click", (event) => {
      event.preventDefault();

      Swal.fire({
        icon: "question",
        title: "Keluar dari aplikasi?",
        text: "Sesi login akan dihapus.",
        showCancelButton: true,
        confirmButtonText: "Ya, logout",
        cancelButtonText: "Batal",
      }).then((result) => {
        if (result.isConfirmed) {
          logoutUser();
        }
      });
    });
  });
}

/**
 * Update tampilan nama user.
 */
function updateCurrentUserInfo(user = getCurrentUser()) {
  if (!user) return;

  const nameEls = document.querySelectorAll("[data-current-user-name]");
  const roleEls = document.querySelectorAll("[data-current-user-role]");

  nameEls.forEach((el) => {
    el.textContent = user.name || "-";
  });

  roleEls.forEach((el) => {
    el.textContent = user.role === "admin" ? "Admin" : "Guru";
  });
}

/**
 * Filter default untuk guru.
 * Nanti disesuaikan dengan ID select di halaman input capaian.
 */
function applyGuruDefaultFilter(user = getCurrentUser()) {
  if (!user || user.role !== "guru") return;

  if (typeof applyInputPageRoleDefault === "function") {
    applyInputPageRoleDefault();
  }

  if (typeof populateInputFilters === "function") {
    populateInputFilters();
  }

  if (typeof renderInputProgressTable === "function") {
    renderInputProgressTable();
  }
}

function canEditSettings() {
  const user = getCurrentUser();
  return user?.canEditSettings === true;
}

function canEditMasterData() {
  const user = getCurrentUser();
  return user?.canEditMasterData === true;
}

function canGenerateFile() {
  const user = getCurrentUser();
  return user?.canGenerateFile === true;
}

function getAllowedHalaqohId() {
  const user = getCurrentUser();

  if (!user || user.role !== "guru") return null;

  return user.halaqohId || null;
}

function applyRoleAccess() {
  const user = getCurrentUser();

  if (!user) return;

  const role = user.role;

  document.body.dataset.role = role;

  if (role === "admin") {
    showRoleElements();
    return;
  }

  hideAdminOnlyMenus();
}

function showRoleElements() {
  const hiddenRoleEls = document.querySelectorAll(
    "[data-admin-only], [data-master-only], [data-settings-only]",
  );

  hiddenRoleEls.forEach((el) => {
    el.classList.remove("hidden");
  });
}

function hideAdminOnlyMenus() {
  const adminOnlyEls = document.querySelectorAll(
    "[data-admin-only], [data-master-only], [data-settings-only]",
  );

  adminOnlyEls.forEach((el) => {
    el.classList.add("hidden");
  });
}

function getUserRoleLabel(user) {
  if (!user) return "-";

  if (user.role === "admin") return "Admin";
  if (user.role === "guru") return "Guru Al-Qur’an";

  return user.role || "-";
}

function getUserInitial(user) {
  const name = user?.name || user?.email || "A";

  return String(name).trim().charAt(0).toUpperCase();
}

function renderCurrentUserInfo() {
  if (typeof getCurrentUser !== "function") return;

  const user = getCurrentUser();

  if (!user) return;

  const name = user.name || user.email || "Pengguna";
  const email = user.email || "-";
  const roleLabel = getUserRoleLabel(user);
  const initial = getUserInitial(user);

  setText("#accountMenuName", name);
  setText("#accountDropdownName", name);
  setText("#accountDropdownEmail", email);
  setText("#accountDropdownRole", roleLabel);

  setText("#mobileAccountName", name);
  setText("#mobileAccountEmail", email);
  setText("#mobileAccountRole", roleLabel);

  setText("#accountMenuAvatar", initial);
  setText("#mobileAccountAvatar", initial);
}
