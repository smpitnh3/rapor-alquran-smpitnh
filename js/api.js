/* =========================================================
   API.JS
   Penghubung frontend dengan backend Google Apps Script.

   Fungsi:
   - Membuat request GET/POST ke Apps Script.
   - Menangani error HTTP, error backend, dan timeout.
   - Menyediakan helper API untuk data, login, progress,
     settings, dan generate log.
========================================================= */

const API_CONFIG = {
  BASE_URL:
    "https://script.google.com/macros/s/AKfycbw1fUuugXwRQ0_qIe4R_WSLrilmJpJTs22PstzaNcXTXtP2sJaI6r5r0dgpoC_gV1ySGA/exec",

  TIMEOUT_MS: 30000,
};

/* =========================================================
   REQUEST HELPERS
========================================================= */

function buildApiUrl(action, params = {}) {
  const url = new URL(API_CONFIG.BASE_URL);

  url.searchParams.set("action", action);

  Object.keys(params).forEach((key) => {
    const value = params[key];

    if (value !== undefined && value !== null && value !== "") {
      url.searchParams.set(key, value);
    }
  });

  return url.toString();
}

function createApiTimeoutController(timeoutMs = API_CONFIG.TIMEOUT_MS) {
  const controller = new AbortController();

  const timeoutId = setTimeout(() => {
    controller.abort();
  }, timeoutMs);

  return {
    controller,
    timeoutId,
  };
}

function getApiErrorMessage(error, fallbackMessage = "Request gagal.") {
  const message = String(error?.message || "").toLowerCase();

  if (error?.name === "AbortError") {
    return "Request terlalu lama. Periksa koneksi internet atau coba lagi.";
  }

  if (!navigator.onLine) {
    return "Tidak dapat terhubung ke server. Periksa koneksi internet, lalu coba lagi.";
  }

  if (
    message.includes("failed to fetch") ||
    message.includes("networkerror") ||
    message.includes("load failed")
  ) {
    return "Tidak dapat terhubung ke server. Periksa koneksi internet atau akses backend Google Apps Script.";
  }

  return error?.message || fallbackMessage;
}

async function parseApiJsonResponse(response) {
  try {
    return await response.json();
  } catch (error) {
    throw new Error("Response backend bukan JSON yang valid.");
  }
}

function validateApiResult(result) {
  if (!result || typeof result !== "object") {
    throw new Error("Response backend kosong atau tidak valid.");
  }

  if (!result.success) {
    throw new Error(result.message || "Request gagal.");
  }

  return result;
}

/* =========================================================
   CORE REQUEST
========================================================= */

async function apiGet(action, params = {}) {
  const { controller, timeoutId } = createApiTimeoutController();

  try {
    const response = await fetch(buildApiUrl(action, params), {
      method: "GET",
      signal: controller.signal,
    });

    if (!response.ok) {
      throw new Error(`HTTP Error: ${response.status}`);
    }

    const result = await parseApiJsonResponse(response);

    return validateApiResult(result);
  } catch (error) {
    const message = getApiErrorMessage(error);

    console.error(`apiGet error [${action}]:`, error);

    throw new Error(message);
  } finally {
    clearTimeout(timeoutId);
  }
}

async function apiPost(action, payload = {}) {
  const { controller, timeoutId } = createApiTimeoutController();

  try {
    const response = await fetch(API_CONFIG.BASE_URL, {
      method: "POST",
      headers: {
        "Content-Type": "text/plain;charset=utf-8",
      },
      body: JSON.stringify({
        action,
        ...payload,
      }),
      signal: controller.signal,
    });

    if (!response.ok) {
      throw new Error(`HTTP Error: ${response.status}`);
    }

    const result = await parseApiJsonResponse(response);

    return validateApiResult(result);
  } catch (error) {
    const message = getApiErrorMessage(error);

    console.error(`apiPost error [${action}]:`, error);

    throw new Error(message);
  } finally {
    clearTimeout(timeoutId);
  }
}

/* =========================================================
   DATA API
========================================================= */

async function fetchAllData() {
  const result = await apiGet("getAllData");

  return result.data || {};
}

/* =========================================================
   AUTH API
========================================================= */

async function loginUserApi(email, password) {
  const result = await apiPost("login", {
    email,
    password,
  });

  if (!result.user) {
    throw new Error("Data user tidak ditemukan dari backend.");
  }

  return result.user;
}

/* =========================================================
   PROGRESS API
========================================================= */

async function saveProgressApi(progress) {
  if (!progress || typeof progress !== "object") {
    throw new Error("Payload progress tidak valid.");
  }

  const result = await apiPost("saveProgress", {
    progress,
  });

  return result.progress || progress;
}

async function saveProgressBatchApi(progressList) {
  if (!Array.isArray(progressList)) {
    throw new Error("Payload progressList harus berupa array.");
  }

  const result = await apiPost("saveProgressBatch", {
    progressList,
  });

  return Array.isArray(result.progressList)
    ? result.progressList
    : progressList;
}

/* =========================================================
   SETTINGS API
========================================================= */

async function updateSettingsApi(settings) {
  if (!settings || typeof settings !== "object") {
    throw new Error("Payload settings tidak valid.");
  }

  const result = await apiPost("updateSettings", {
    settings,
  });

  return result.settings || settings;
}

/* =========================================================
   GENERATE LOG API
========================================================= */

async function saveGenerateLogApi(log) {
  if (!log || typeof log !== "object") {
    throw new Error("Payload generate log tidak valid.");
  }

  const result = await apiPost("saveGenerateLog", {
    log,
  });

  return result.log || log;
}
