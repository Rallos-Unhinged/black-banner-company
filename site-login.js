// Black Banner site-wide login helper.
// Include this script on any page that has:
//   <button id="siteLoginBtn">Login with Discord</button>
// Optional: <span id="siteUserName"></span>
(() => {
  const API_BASE = "https://api.blackbannercompany.com";
  const btn = document.getElementById("siteLoginBtn");
  const nameEl = document.getElementById("siteUserName");
  if (!btn) return;

  let authenticated = false;

  async function request(path, options = {}) {
    const headers = { ...(options.headers || {}) };
    if (options.body != null && !headers["Content-Type"]) headers["Content-Type"] = "application/json";
    const response = await fetch(API_BASE + path, {
      mode: "cors",
      credentials: "include",
      cache: "no-store",
      ...options,
      headers,
    });
    const body = await response.json().catch(() => ({}));
    if (!response.ok) throw Object.assign(new Error(body.error || "request_failed"), { status: response.status });
    return body;
  }

  async function refresh() {
    try {
      const data = await request("/api/session");
      authenticated = true;
      btn.textContent = "Logout";
      if (nameEl) nameEl.textContent = data.user.globalName || data.user.username || "Banner Member";
    } catch (err) {
      authenticated = false;
      btn.textContent = "Login with Discord";
      if (nameEl) nameEl.textContent = "";
    }
  }

  btn.addEventListener("click", async () => {
    if (authenticated) {
      try { await request("/auth/logout", { method: "POST", body: "{}" }); } catch (_) {}
      location.reload();
      return;
    }
    const returnPath = location.pathname + location.search + location.hash;
    location.assign(API_BASE + "/auth/discord?return=" + encodeURIComponent(returnPath));
  });

  refresh();
})();
