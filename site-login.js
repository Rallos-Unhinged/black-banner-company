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

// Black Banner Company oath — homepage only.
(() => {
  const path = location.pathname.replace(/\/+$/, "");
  if (path && path !== "/black-banner-company") return;

  const main = document.querySelector("main");
  if (!main || document.getElementById("company-oath")) return;

  const oath = document.createElement("section");
  oath.id = "company-oath";
  oath.style.textAlign = "center";
  oath.innerHTML = `
    <h2>The Black Banner Oath</h2>
    <div class="rule"></div>
    <p style="font-family:'Cinzel',serif;color:var(--gold-soft);font-size:clamp(1.15rem,3vw,1.55rem);letter-spacing:.04em;margin-bottom:1.5rem;">
      “A contract taken is a contract kept.”
    </p>
    <div style="max-width:760px;margin:0 auto;color:var(--text);font-size:1.08rem;line-height:1.9;">
      <p>Before the Banner, I give my word.</p>
      <p>A contract taken is a contract kept.</p>
      <p>I stand with those who stand beside me.</p>
      <p>I will not abandon my company for fear, fortune, or favor.</p>
      <p>Let my deeds carry the Banner farther than my name.</p>
      <p>Until the contract is fulfilled, my oath remains.</p>
    </div>
    <div class="callout" style="max-width:820px;margin:1.6rem auto 0;text-align:center;border-left:0;border-top:1px solid rgba(216,166,59,.45);">
      <strong style="font-family:'Cinzel',serif;">Officer’s Response</strong><br>
      “Your word is witnessed. Your oath is bound. Rise, mercenary of the Black Banner Company.”
    </div>`;

  main.insertBefore(oath, main.firstElementChild);
})();
