/* =========================================================
   PARTIALS.JS
   Rapor Al-Qur’an SMPIT Nur Hikmah

   Fungsi:
   - Memuat potongan HTML dari folder partials.
   - Menjaga index.html tetap ringkas.
   - Menghindari script inject Live Server masuk ke DOM.
========================================================= */

const HTML_PARTIALS = [
  {
    selector: "#loginPartial",
    url: "partials/login.partial",
    mode: "replace",
    target: "#loginPage",
  },
  {
    selector: "#sidebarPartial",
    url: "partials/sidebar.partial",
    mode: "replace",
    target: ".sidebar",
  },
  {
    selector: "#topbarPartial",
    url: "partials/topbar.partial",
    mode: "replace",
    target: ".topbar",
  },

  {
    selector: "#dashboardPagePartial",
    url: "partials/dashboard.partial",
    mode: "replace",
    target: '[data-view="dashboard"]',
  },
  {
    selector: "#pengaturanPagePartial",
    url: "partials/pengaturan.partial",
    mode: "replace",
    target: '[data-view="pengaturan"]',
  },
  {
    selector: "#manajemenAkunPagePartial",
    url: "partials/manajemen-akun.partial",
    mode: "replace",
    target: '[data-view="akun"]',
  },
  {
    selector: "#kelasHalaqohPagePartial",
    url: "partials/kelas-halaqoh.partial",
    mode: "replace",
    target: '[data-view="kelas"]',
  },
  {
    selector: "#siswaPagePartial",
    url: "partials/siswa.partial",
    mode: "replace",
    target: '[data-view="siswa"]',
  },
  {
    selector: "#inputCapaianPagePartial",
    url: "partials/input-capaian.partial",
    mode: "replace",
    target: '[data-view="input"]',
  },
  {
    selector: "#inputMassalPageContainer",
    url: "partials/input-massal.partial",
    mode: "replace",
    target: '[data-view="input-massal"]',
  },
  {
    selector: "#previewRaporPagePartial",
    url: "partials/preview-rapor.partial",
    mode: "replace",
    target: '[data-view="preview"]',
  },
  {
    selector: "#generateFilePagePartial",
    url: "partials/generate-file.partial",
    mode: "replace",
    target: '[data-view="pdf"]',
  },
  {
    selector: "#panduanPagePartial",
    url: "partials/panduan.partial",
    mode: "replace",
    target: '[data-view="tentang"]',
  },
];

async function loadHtmlPartial(selector, url, mode = "inner", target = null) {
  const container = document.querySelector(selector);

  if (!container) {
    console.warn(`Container partial tidak ditemukan: ${selector}`);
    return;
  }

  try {
    const response = await fetch(url);

    if (!response.ok) {
      throw new Error(`Gagal memuat partial: ${url}`);
    }

    const rawHtml = await response.text();

    const parser = new DOMParser();
    const doc = parser.parseFromString(rawHtml, "text/html");

    doc.querySelectorAll("script").forEach((script) => {
      script.remove();
    });

    let html = rawHtml;

    if (target) {
      const targetElement = doc.querySelector(target);

      if (!targetElement) {
        throw new Error(`Target partial tidak ditemukan: ${target}`);
      }

      html = targetElement.outerHTML;
    } else {
      html = doc.body.innerHTML;
    }

    if (mode === "replace") {
      container.outerHTML = html;
      return;
    }

    container.innerHTML = html;
  } catch (error) {
    console.error(error);

    container.innerHTML = `
      <div class="empty-state">
        Gagal memuat komponen.
      </div>
    `;
  }
}

async function loadPartials() {
  const tasks = HTML_PARTIALS.map((partial) => {
    return loadHtmlPartial(
      partial.selector,
      partial.url,
      partial.mode,
      partial.target,
    );
  });

  await Promise.all(tasks);
}
