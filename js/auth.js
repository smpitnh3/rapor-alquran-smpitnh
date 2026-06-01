/* =========================================================
   AUTH.JS
   Login, session user, akses role, dan UI login.
========================================================= */

const AUTH_STORAGE_KEY = "rapor_current_user";

/* =========================================================
   CURRENT USER SESSION
========================================================= */

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
  return Boolean(getCurrentUser());
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

/* =========================================================
   LOGIN
========================================================= */

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

  if (loginForm && loginForm.dataset.initialized !== "true") {
    loginForm.dataset.initialized = "true";
    loginForm.addEventListener("submit", handleLoginSubmit);
  }

  initLoginPasswordToggle();

  const user = getCurrentUser();

  if (user) {
    showAppAfterLogin(user);
  } else {
    showLoginPage();
  }
}

/* =========================================================
   LOGOUT
========================================================= */

/**
 * Logout user.
 * Menghapus session backend dan session lokal.
 */
async function logoutUser() {
  try {
    if (typeof logoutUserApi === "function") {
      await logoutUserApi();
    }
  } catch (error) {
    console.warn("Logout backend gagal:", error);
  }

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
    if (button.dataset.initialized === "true") return;

    button.dataset.initialized = "true";

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

/* =========================================================
   CURRENT USER UI
========================================================= */

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

/* =========================================================
   ROLE ACCESS
========================================================= */

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

/* =========================================================
   GURU DEFAULT FILTER
========================================================= */

/**
 * Filter default untuk guru.
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

/* =========================================================
   LOGIN PASSWORD TOGGLE
========================================================= */

function initLoginPasswordToggle() {
  const passwordInput = document.querySelector("#loginPassword");
  const toggleButton = document.querySelector("#toggleLoginPassword");

  if (!passwordInput || !toggleButton) return;
  if (toggleButton.dataset.initialized === "true") return;

  toggleButton.dataset.initialized = "true";

  const eyeIcon = `
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor">
      <path
        stroke-linecap="round"
        stroke-linejoin="round"
        stroke-width="1.8"
        d="M2.25 12s3.75-6.75 9.75-6.75S21.75 12 21.75 12 18 18.75 12 18.75 2.25 12 2.25 12Z"
      />
      <path
        stroke-linecap="round"
        stroke-linejoin="round"
        stroke-width="1.8"
        d="M15 12a3 3 0 1 1-6 0 3 3 0 0 1 6 0Z"
      />
    </svg>
  `;

  const eyeOffIcon = `
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor">
      <path
        stroke-linecap="round"
        stroke-linejoin="round"
        stroke-width="1.8"
        d="M3 3l18 18"
      />
      <path
        stroke-linecap="round"
        stroke-linejoin="round"
        stroke-width="1.8"
        d="M10.58 10.58A2 2 0 0 0 13.42 13.42"
      />
      <path
        stroke-linecap="round"
        stroke-linejoin="round"
        stroke-width="1.8"
        d="M9.88 5.42A9.77 9.77 0 0 1 12 5.25c6 0 9.75 6.75 9.75 6.75a16.32 16.32 0 0 1-3.15 3.84"
      />
      <path
        stroke-linecap="round"
        stroke-linejoin="round"
        stroke-width="1.8"
        d="M6.53 6.53C3.75 8.45 2.25 12 2.25 12S6 18.75 12 18.75c1.42 0 2.74-.37 3.93-.95"
      />
    </svg>
  `;

  function setPasswordVisible(isVisible) {
    passwordInput.type = isVisible ? "text" : "password";

    toggleButton.setAttribute("aria-pressed", String(isVisible));
    toggleButton.setAttribute(
      "aria-label",
      isVisible ? "Sembunyikan password" : "Tampilkan password",
    );

    const iconContainer = toggleButton.querySelector(".login-eye-icon");

    if (iconContainer) {
      iconContainer.innerHTML = isVisible ? eyeOffIcon : eyeIcon;
    }
  }

  toggleButton.addEventListener("click", () => {
    const isVisible = passwordInput.type === "text";

    setPasswordVisible(!isVisible);
    passwordInput.focus();
  });

  setPasswordVisible(false);
}
