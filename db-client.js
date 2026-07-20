(function () {
  "use strict";

  const config = window.SUPABASE_CONFIG || {};
  const sessionKey = "oferta-organica-admin-session";

  function configured() {
    return /^https:\/\/.+\.supabase\.co$/.test(config.url || "") &&
      Boolean(config.anonKey && !config.anonKey.startsWith("COLE_AQUI"));
  }

  function baseHeaders(token, extra) {
    return Object.assign({
      apikey: config.anonKey,
      Authorization: "Bearer " + (token || config.anonKey),
      "Content-Type": "application/json"
    }, extra || {});
  }

  async function request(path, options) {
    if (!configured()) throw new Error("Supabase ainda não foi configurado em supabase-config.js.");
    const settings = options || {};
    const response = await fetch(config.url + path, {
      method: settings.method || "GET",
      headers: baseHeaders(settings.token, settings.headers),
      body: settings.body === undefined ? undefined : JSON.stringify(settings.body)
    });
    const text = await response.text();
    const payload = text ? JSON.parse(text) : null;
    if (!response.ok) {
      const message = payload && (payload.message || payload.msg || payload.error_description || payload.error);
      throw new Error(message || "Falha ao acessar o banco de dados.");
    }
    return payload;
  }

  function saveSession(session) {
    if (session) localStorage.setItem(sessionKey, JSON.stringify(session));
    else localStorage.removeItem(sessionKey);
  }

  function readSession() {
    try { return JSON.parse(localStorage.getItem(sessionKey) || "null"); }
    catch (_) { return null; }
  }

  async function refreshSession(session) {
    if (!session || !session.refresh_token) return null;
    try {
      const refreshed = await request("/auth/v1/token?grant_type=refresh_token", {
        method: "POST",
        body: { refresh_token: session.refresh_token }
      });
      saveSession(refreshed);
      return refreshed;
    } catch (_) {
      saveSession(null);
      return null;
    }
  }

  async function getSession() {
    const session = readSession();
    if (!session) return null;
    const expiresAt = Number(session.expires_at || 0) * 1000;
    if (expiresAt && expiresAt - Date.now() < 60000) return refreshSession(session);
    return session;
  }

  async function adminToken() {
    const session = await getSession();
    if (!session || !session.access_token) throw new Error("Sessão administrativa expirada.");
    return session.access_token;
  }

  async function rest(table, query, options) {
    const settings = options || {};
    const token = settings.admin ? await adminToken() : null;
    const suffix = query ? "?" + query : "";
    return request("/rest/v1/" + table + suffix, Object.assign({}, settings, { token: token }));
  }

  async function storageRequest(path, options) {
    if (!configured()) throw new Error("Supabase ainda não foi configurado.");
    const settings = options || {};
    const token = await adminToken();
    const response = await fetch(config.url + "/storage/v1/" + path, {
      method: settings.method || "GET",
      headers: Object.assign({ apikey: config.anonKey, Authorization: "Bearer " + token }, settings.headers || {}),
      body: settings.body
    });
    const text = await response.text();
    let payload = null;
    try { payload = text ? JSON.parse(text) : null; } catch (_) { payload = text; }
    if (!response.ok) throw new Error(payload && (payload.message || payload.error) || "Falha ao acessar o armazenamento.");
    return payload;
  }

  window.OfferDB = {
    configured: configured,
    auth: {
      async signIn(email, password) {
        const session = await request("/auth/v1/token?grant_type=password", {
          method: "POST", body: { email: email, password: password }
        });
        saveSession(session);
        return session;
      },
      getSession: getSession,
      async signOut() {
        const session = readSession();
        if (session && session.access_token) {
          try { await request("/auth/v1/logout", { method: "POST", token: session.access_token }); }
          catch (_) { /* A sessão local ainda deve ser encerrada. */ }
        }
        saveSession(null);
      }
    },
    select(table, query, admin) {
      return rest(table, query || "select=*", { admin: Boolean(admin) });
    },
    insert(table, rows, admin) {
      return rest(table, "", {
        method: "POST", body: rows, admin: Boolean(admin),
        headers: { Prefer: "return=representation" }
      });
    },
    upsert(table, rows, conflict, admin) {
      return rest(table, conflict ? "on_conflict=" + encodeURIComponent(conflict) : "", {
        method: "POST", body: rows, admin: Boolean(admin),
        headers: { Prefer: "resolution=merge-duplicates,return=representation" }
      });
    },
    update(table, filters, values, admin) {
      return rest(table, filters, {
        method: "PATCH", body: values, admin: Boolean(admin),
        headers: { Prefer: "return=representation" }
      });
    },
    async rpc(name, args, admin) {
      const token = admin ? await adminToken() : null;
      return request("/rest/v1/rpc/" + name, { method: "POST", body: args || {}, token: token });
    },
    storage: {
      upload(bucket, path, file) {
        return storageRequest("object/" + encodeURIComponent(bucket) + "/" + path.split("/").map(encodeURIComponent).join("/"), {
          method: "POST", body: file,
          headers: { "Content-Type": file.type || "application/octet-stream", "x-upsert": "true" }
        });
      },
      async signedUrl(bucket, path, expiresIn) {
        const payload = await storageRequest("object/sign/" + encodeURIComponent(bucket) + "/" + path.split("/").map(encodeURIComponent).join("/"), {
          method: "POST", body: JSON.stringify({ expiresIn: expiresIn || 3600 }), headers: { "Content-Type": "application/json" }
        });
        const signed = payload && (payload.signedURL || payload.signedUrl);
        return signed && (/^https?:/.test(signed) ? signed : config.url + "/storage/v1" + signed);
      }
    }
  };
})();
