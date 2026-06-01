/* =========================================================
   SIMPLE PAGE ROUTING
   Fungsi:
   - Mengganti halaman berdasarkan tombol sidebar.
   - Mengubah menu aktif.
   - Mengubah judul topbar.
   - Mengelola aria-current untuk aksesibilitas.
   - Menutup sidebar mobile setelah pindah halaman.
========================================================= */

const pageMeta = {
  dashboard: {
    title: "Dashboard",
    subtitle: "Ringkasan capaian dan kelengkapan data rapor Al-Qur’an.",
  },
  pengaturan: {
    title: "Pengaturan",
    subtitle:
      "Kelola identitas sekolah, tahun ajaran, periode, dan konfigurasi aplikasi.",
  },
  akun: {
    title: "Manajemen Akun",
    subtitle: "Kelola akun admin dan guru yang dapat mengakses aplikasi.",
  },
  kelas: {
    title: "Kelas & Halaqoh",
    subtitle: "Kelola data kelas, halaqoh, dan guru pengampu.",
  },
  siswa: {
    title: "Data Siswa",
    subtitle: "Kelola data siswa aktif, kelas, dan kelompok halaqoh.",
  },
  input: {
    title: "Input Capaian",
    subtitle: "Input dan kelola capaian pembelajaran Al-Qur’an siswa.",
  },
  preview: {
    title: "Preview Rapor",
    subtitle:
      "Lihat pratinjau laporan capaian pembelajaran Al-Qur’an sebelum dicetak atau dibuat PDF.",
  },
  pdf: {
    title: "Generate File",
    subtitle:
      "Buat PDF rapor atau Excel rekap berdasarkan siswa, halaqoh, atau kelas.",
  },
  tentang: {
    title: "Panduan",
    subtitle:
      "Panduan penggunaan aplikasi Rapor Al-Qur’an untuk guru dan admin.",
  },
  "input-massal": {
    title: "Input Massal",
    subtitle: "Input capaian banyak siswa menggunakan tampilan spreadsheet.",
  },
};

function setActivePage(pageName) {
  if (!pageMeta[pageName]) {
    console.warn(`Halaman tidak dikenal: ${pageName}`);
    pageName = "dashboard";
  }

  const pageViews = document.querySelectorAll(".page-view");
  const menuItems = document.querySelectorAll(".menu-item[data-page]");
  const topbarTitle = document.querySelector(".topbar-title h1");
  const topbarSubtitle = document.querySelector(".topbar-title p");
  const pageData = pageMeta[pageName];
  const activeMenuPage = pageName === "input-massal" ? "input" : pageName;

  pageViews.forEach((view) => {
    const isActive = view.dataset.view === pageName;
    view.classList.toggle("active", isActive);
  });

  menuItems.forEach((item) => {
    const isActive = item.dataset.page === activeMenuPage;

    item.classList.toggle("active", isActive);

    if (isActive) {
      item.setAttribute("aria-current", "page");
    } else {
      item.removeAttribute("aria-current");
    }
  });

  if (topbarTitle && pageData) {
    topbarTitle.textContent = pageData.title;
  }

  if (topbarSubtitle && pageData) {
    topbarSubtitle.textContent = pageData.subtitle;
  }

  localStorage.setItem("activePage", pageName);
  document.body.classList.remove("mobile-menu-open");
}

function initPageRouting(options = {}) {
  const { restoreSavedPage = true } = options;

  const menuItems = document.querySelectorAll(".menu-item[data-page]");
  const savedPage = localStorage.getItem("activePage");
  const initialPage = pageMeta[savedPage] ? savedPage : "dashboard";

  menuItems.forEach((item) => {
    item.addEventListener("click", () => {
      const pageName = item.dataset.page;
      setActivePage(pageName);
    });
  });

  if (restoreSavedPage) {
    setActivePage(initialPage);
  }
}

/* =========================================================
   Shortcut Dashboard: Tombol Input Capaian
   Fungsi:
   - Shortcut tombol untuk menuju halaman input capaian.
========================================================= */

function initDashboardShortcuts() {
  const goInputPage = document.getElementById("goInputPage");

  goInputPage?.addEventListener("click", () => {
    setActivePage("input");
  });
}
