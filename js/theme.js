/* =========================================================
   THEME.JS
   Fungsi:
   - Mengatur mode light/dark.
   - Menyimpan pilihan mode ke localStorage.
   - Mengganti icon tombol mode.
   - Mengganti logo sidebar sesuai mode.
========================================================= */

const THEME_STORAGE_KEY = "rapor_theme";

function initThemeToggle() {
  const themeToggle = document.getElementById("themeToggle");
  const themeIcon = document.getElementById("themeIcon");
  const mobileThemeToggle = document.getElementById("mobileThemeToggle");
  const mobileThemeIcon = document.getElementById("mobileThemeIcon");
  const brandLogo = document.getElementById("brandLogo");
  const topbarMobileLogo = document.querySelector(".topbar-mobile-logo");

  const lightLogo = "assets/images/logo-nurhikmah.png";
  const darkLogo = "assets/images/logo-nurhikmah-white.png";

  const sunIcon = `
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" aria-hidden="true">
      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.8" d="M12 3v2.25M12 18.75V21M4.22 4.22l1.59 1.59M18.19 18.19l1.59 1.59M3 12h2.25M18.75 12H21M4.22 19.78l1.59-1.59M18.19 5.81l1.59-1.59M15.75 12a3.75 3.75 0 1 1-7.5 0 3.75 3.75 0 0 1 7.5 0Z" />
    </svg>
  `;

  const moonIcon = `
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" aria-hidden="true">
      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M21.752 15.002A9.72 9.72 0 0 1 18 15.75c-5.385 0-9.75-4.365-9.75-9.75 0-1.33.266-2.597.748-3.752A9.753 9.753 0 0 0 3 11.25C3 16.635 7.365 21 12.75 21a9.753 9.753 0 0 0 9.002-5.998Z" />
    </svg>
  `;

  function normalizeTheme(theme) {
    return theme === "dark" ? "dark" : "light";
  }

  function applyTheme(theme) {
    const normalizedTheme = normalizeTheme(theme);
    const isDark = normalizedTheme === "dark";
    const logoSrc = isDark ? darkLogo : lightLogo;
    const icon = isDark ? moonIcon : sunIcon;
    const nextLabel = isDark ? "Aktifkan mode terang" : "Aktifkan mode gelap";

    document.documentElement.setAttribute("data-theme", normalizedTheme);
    localStorage.setItem(THEME_STORAGE_KEY, normalizedTheme);

    if (themeIcon) {
      themeIcon.innerHTML = icon;
    }

    if (mobileThemeIcon) {
      mobileThemeIcon.innerHTML = icon;
    }

    if (themeToggle) {
      themeToggle.setAttribute("aria-label", nextLabel);
    }

    if (mobileThemeToggle) {
      mobileThemeToggle.setAttribute("aria-label", nextLabel);
    }

    if (brandLogo) {
      brandLogo.src = logoSrc;
    }

    if (topbarMobileLogo) {
      topbarMobileLogo.src = logoSrc;
    }
  }

  function toggleTheme() {
    const currentTheme = normalizeTheme(
      document.documentElement.getAttribute("data-theme"),
    );

    const nextTheme = currentTheme === "dark" ? "light" : "dark";

    applyTheme(nextTheme);
  }

  const savedTheme = normalizeTheme(localStorage.getItem(THEME_STORAGE_KEY));

  applyTheme(savedTheme);

  themeToggle?.addEventListener("click", toggleTheme);
  mobileThemeToggle?.addEventListener("click", toggleTheme);
}
