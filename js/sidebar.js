/* =========================================================
   SIDEBAR.JS
   Fungsi:
   - Sidebar collapse desktop.
   - Account dropdown desktop.
   - Mobile sidebar drawer.
========================================================= */

const SIDEBAR_STORAGE_KEY = "rapor_sidebar_state";

function initSidebarToggle() {
  const appShell = document.getElementById("appShell");
  const sidebarToggle = document.getElementById("sidebarToggle");

  if (!appShell || !sidebarToggle) return;

  const savedState = localStorage.getItem(SIDEBAR_STORAGE_KEY);

  if (savedState === "collapsed") {
    appShell.classList.add("sidebar-collapsed");
  }

  sidebarToggle.addEventListener("click", () => {
    appShell.classList.toggle("sidebar-collapsed");

    const isCollapsed = appShell.classList.contains("sidebar-collapsed");
    localStorage.setItem(
      SIDEBAR_STORAGE_KEY,
      isCollapsed ? "collapsed" : "expanded",
    );
  });
}

function initAccountDropdown() {
  const accountDropdown = document.getElementById("accountDropdown");
  const accountMenuButton = document.getElementById("accountMenuButton");

  if (!accountDropdown || !accountMenuButton) return;

  function setDropdownState(isOpen) {
    accountDropdown.classList.toggle("is-open", isOpen);
    accountMenuButton.setAttribute("aria-expanded", String(isOpen));
  }

  function closeAccountDropdown() {
    setDropdownState(false);
  }

  accountMenuButton.addEventListener("click", (event) => {
    event.stopPropagation();

    const isOpen = accountDropdown.classList.contains("is-open");
    setDropdownState(!isOpen);
  });

  document.addEventListener("click", (event) => {
    if (!accountDropdown.contains(event.target)) {
      closeAccountDropdown();
    }
  });

  document.addEventListener("keydown", (event) => {
    if (event.key === "Escape") {
      closeAccountDropdown();
    }
  });
}

function initMobileSidebar() {
  const mobileSidebarOpen = document.getElementById("mobileSidebarOpen");
  const mobileSidebarClose = document.getElementById("mobileSidebarClose");
  const mobileSidebarOverlay = document.getElementById("mobileSidebarOverlay");
  const sidebarMenuButtons = document.querySelectorAll(".sidebar .menu-item");

  function isMobileScreen() {
    return window.matchMedia("(max-width: 880px)").matches;
  }

  function openMobileSidebar() {
    document.body.classList.add("mobile-menu-open");
  }

  function closeMobileSidebar() {
    document.body.classList.remove("mobile-menu-open");
  }

  mobileSidebarOpen?.addEventListener("click", openMobileSidebar);
  mobileSidebarClose?.addEventListener("click", closeMobileSidebar);
  mobileSidebarOverlay?.addEventListener("click", closeMobileSidebar);

  sidebarMenuButtons.forEach((button) => {
    button.addEventListener("click", () => {
      if (isMobileScreen()) {
        closeMobileSidebar();
      }
    });
  });

  document.addEventListener("keydown", (event) => {
    if (event.key === "Escape") {
      closeMobileSidebar();
    }
  });

  window.addEventListener("resize", () => {
    if (!isMobileScreen()) {
      closeMobileSidebar();
    }
  });
}
