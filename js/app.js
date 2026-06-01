/* =========================================================
   APP.JS
   Rapor Al-Qur’an SMPIT Nur Hikmah
   INIT APP
   Fungsi:
   - Menjalankan semua fungsi setelah DOM siap.
   - Mengambil data backend dari Google Sheets.
   - Menyimpan cache lokal agar load berikutnya lebih cepat.
========================================================= */

const APP_CACHE_KEY = "rapor_app_cache";
const APP_CACHE_TIME_KEY = "rapor_app_cache_time";

/* =========================================================
   DATABASE CACHE
========================================================= */

function applyDatabaseData(data) {
  if (!data) return;

  window.RAPOR_DATA = data;

  if (typeof DB !== "undefined") {
    DB.settings = data.settings || {};
    DB.periods = data.periods || [];
    DB.classes = data.classes || [];
    DB.halaqoh = data.halaqoh || [];
    DB.students = data.students || [];
    DB.progress = data.progress || [];
    DB.generateLog = data.generateLog || [];
    DB.users = data.users || [];
  }
}

function saveDatabaseCache(data) {
  try {
    localStorage.setItem(APP_CACHE_KEY, JSON.stringify(data));
    localStorage.setItem(APP_CACHE_TIME_KEY, new Date().toISOString());
  } catch (error) {
    console.warn("Gagal menyimpan cache database:", error);
  }
}

function getDatabaseCache() {
  const rawCache = localStorage.getItem(APP_CACHE_KEY);

  if (!rawCache) return null;

  try {
    return JSON.parse(rawCache);
  } catch (error) {
    localStorage.removeItem(APP_CACHE_KEY);
    localStorage.removeItem(APP_CACHE_TIME_KEY);
    return null;
  }
}

function updateDatabaseCacheFromCurrentDB() {
  const currentData = {
    settings: DB.settings || {},
    periods: DB.periods || [],
    classes: DB.classes || [],
    halaqoh: DB.halaqoh || [],
    students: DB.students || [],
    progress: DB.progress || [],
    generateLog: DB.generateLog || [],
    users: DB.users || [],
  };

  saveDatabaseCache(currentData);
}

function clearDatabaseCache() {
  localStorage.removeItem(APP_CACHE_KEY);
  localStorage.removeItem(APP_CACHE_TIME_KEY);
}

/* =========================================================
   LOAD DATABASE
   Mengambil data dari cache terlebih dahulu, lalu update dari
   backend Google Apps Script.
========================================================= */

async function loadDatabase() {
  const cachedData = getDatabaseCache();

  if (cachedData) {
    applyDatabaseData(cachedData);
    console.log("Data cache berhasil dimuat:", cachedData);

    showSyncStatus();

    fetchAllData()
      .then((backendData) => {
        applyDatabaseData(backendData);
        saveDatabaseCache(backendData);

        if (typeof refreshAllPageData === "function") {
          refreshAllPageData();
        }

        hideSyncStatus("Data berhasil diperbarui");
        console.log("Data backend berhasil dimuat di background:", backendData);
      })
      .catch((error) => {
        hideSyncStatus("Gagal sinkronisasi");
        console.error("Gagal memuat data backend di background:", error);
      });

    return true;
  }

  try {
    if (typeof Swal !== "undefined") {
      Swal.fire({
        title: "Memuat data...",
        text: "Mengambil data dari Google Sheets.",
        allowOutsideClick: false,
        didOpen: () => {
          Swal.showLoading();
        },
      });
    }

    const backendData = await fetchAllData();

    applyDatabaseData(backendData);
    saveDatabaseCache(backendData);

    if (typeof Swal !== "undefined") {
      Swal.close();
    }

    console.log("Data backend berhasil dimuat:", backendData);

    return true;
  } catch (error) {
    console.error("Gagal memuat data backend:", error);

    if (typeof Swal !== "undefined") {
      Swal.fire({
        icon: "warning",
        title: "Gagal memuat data backend",
        text: "Aplikasi memakai data lokal sementara.",
      });
    }

    return false;
  }
}

function showSyncStatus(message = "Menyinkronkan data...") {
  let syncEl = document.querySelector("#syncStatus");

  if (!syncEl) {
    syncEl = document.createElement("div");
    syncEl.id = "syncStatus";
    syncEl.className = "sync-status";
    document.body.appendChild(syncEl);
  }

  syncEl.textContent = message;
  syncEl.classList.add("is-visible");
}

function hideSyncStatus(message = "Data terbaru berhasil dimuat") {
  const syncEl = document.querySelector("#syncStatus");

  if (!syncEl) return;

  syncEl.textContent = message;

  setTimeout(() => {
    syncEl.classList.remove("is-visible");
  }, 1200);
}

/* =========================================================
   REFRESH PAGE DATA
   Dipakai setelah data backend/cache berubah.
========================================================= */

function refreshAllPageData() {
  if (typeof populateDashboardFilters === "function") {
    populateDashboardFilters();
  }

  if (typeof renderDashboardData === "function") {
    renderDashboardData();
  }

  if (typeof populateStudentFilters === "function") {
    populateStudentFilters();
  }

  if (typeof renderStudentTable === "function") {
    renderStudentTable();
  }

  if (typeof populateInputFilters === "function") {
    populateInputFilters();
  }

  if (typeof renderInputProgressTable === "function") {
    renderInputProgressTable();
  }

  if (typeof populatePreviewFilters === "function") {
    populatePreviewFilters();
  }

  if (typeof renderRaporPreview === "function") {
    renderRaporPreview();
  }

  if (typeof populatePdfFilters === "function") {
    populatePdfFilters();
  }

  if (typeof renderPdfHistory === "function") {
    renderPdfHistory();
  }

  if (typeof renderAccountPage === "function") {
    renderAccountPage();
  }
}

/* =========================================================
   INIT APP
========================================================= */

document.addEventListener("DOMContentLoaded", async () => {
  await loadPartials();
  await loadDatabase();

  initThemeToggle();
  initSidebarToggle();
  initAccountDropdown();
  initMobileSidebar();
  initComingSoonButtons();

  initDashboardData();
  initPageRouting({ restoreSavedPage: false });
  initDashboardShortcuts();
  initSettingsPage();
  initClassHalaqohPage();
  initStudentPage();
  initInputPage();
  initInputMassalPage();
  initProgressModal();
  initPreviewPage();
  initPdfPage();

  if (typeof initAccountManagementPage === "function") {
    initAccountManagementPage();
  }

  initAuth();
  initAuthLogoutButtons();

  if (typeof renderCurrentUserInfo === "function") {
    renderCurrentUserInfo();
  }
});
