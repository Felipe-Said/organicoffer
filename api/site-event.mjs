import { supabase } from "./_server.mjs";

const allowedEventTypes = new Set(["page_view", "checkout_click", "heartbeat", "click", "scroll_depth"]);

function clean(value, maximum = 300) {
  return String(value || "").trim().slice(0, maximum);
}

function cleanAttribution(value) {
  const input = value && typeof value === "object" && !Array.isArray(value) ? value : {};
  const result = {};
  ["source_type", "source_platform", "referrer", "landing_path", "utm_source", "utm_medium", "utm_campaign", "utm_content", "utm_term"].forEach(function (key) {
    const cleaned = clean(input[key], key === "referrer" ? 500 : 180);
    if (cleaned) result[key] = cleaned;
  });
  return result;
}

async function saveCheckoutLead(body, response) {
  const input = body.lead && typeof body.lead === "object" ? body.lead : {};
  const email = clean(input.email, 254).toLowerCase();
  const phone = clean(input.phone, 40);
  if (!email.includes("@") && phone.replace(/\D/g, "").length < 8) return response.status(202).json({ saved: false });
  const attribution = cleanAttribution(input.attribution);
  const now = new Date().toISOString();
  const existingRows = await supabase("checkout_leads?select=status,order_id,first_seen_at&session_id=eq." + encodeURIComponent(body.session_id) + "&limit=1");
  const existing = existingRows?.[0];
  await supabase("checkout_leads?on_conflict=session_id", {
    method: "POST",
    headers: { Prefer: "resolution=merge-duplicates,return=minimal" },
    body: [{
      session_id: body.session_id, customer_name: clean(input.name, 160), email, phone,
      address: clean(input.address), city: clean(input.city, 120), state: clean(input.state, 80),
      country: clean(input.country, 2).toUpperCase(), zipcode: clean(input.zipcode, 30),
      status: existing?.status || "lead", order_id: existing?.order_id || null,
      source_type: clean(attribution.source_type || "direct", 40),
      source_platform: clean(attribution.source_platform || "direct", 80), attribution,
      first_seen_at: existing?.first_seen_at || now, last_seen_at: now
    }]
  });
  response.setHeader("Cache-Control", "no-store, max-age=0");
  return response.status(200).json({ saved: true });
}

export default async function handler(request, response) {
  if (request.method !== "POST") {
    response.setHeader("Allow", "POST");
    return response.status(405).json({ error: "Método não permitido." });
  }

  const body = typeof request.body === "string" ? JSON.parse(request.body || "{}") : request.body || {};
  if (!/^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(body.session_id || "")) {
    return response.status(400).json({ error: "Evento inválido." });
  }

  if (body.event_type === "checkout_lead") {
    try { return await saveCheckoutLead(body, response); }
    catch (error) { return response.status(500).json({ error: error.message || "Não foi possível registrar o contato." }); }
  }
  if (!allowedEventTypes.has(body.event_type)) return response.status(400).json({ error: "Evento inválido." });

  const url = process.env.SUPABASE_URL || process.env.NEXT_PUBLIC_SUPABASE_URL || process.env.VITE_SUPABASE_URL || "";
  const anonKey = process.env.SUPABASE_ANON_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || process.env.VITE_SUPABASE_ANON_KEY || "";
  if (!url || !anonKey) return response.status(503).json({ error: "Banco de dados não configurado." });

  const event = {
    session_id: body.session_id, event_type: body.event_type,
    path: String(body.path || "/").slice(0, 500),
    event_data: body.event_data && typeof body.event_data === "object" ? body.event_data : {}
  };
  try {
    const upstream = await fetch(url + "/rest/v1/site_events", {
      method: "POST",
      headers: { apikey: anonKey, Authorization: "Bearer " + anonKey, "Content-Type": "application/json", Prefer: "return=minimal" },
      body: JSON.stringify(event)
    });
    if (!upstream.ok) {
      const payload = await upstream.json().catch(function () { return {}; });
      return response.status(upstream.status).json({ error: payload.message || "Não foi possível registrar o evento." });
    }
    response.setHeader("Cache-Control", "no-store, max-age=0");
    return response.status(204).end();
  } catch (_) {
    return response.status(502).json({ error: "Falha na comunicação com o banco de dados." });
  }
}
