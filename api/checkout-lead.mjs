import { json, supabase } from "./_server.mjs";

function clean(value, maximum = 300) {
  return String(value || "").trim().slice(0, maximum);
}

function cleanAttribution(value) {
  const input = value && typeof value === "object" && !Array.isArray(value) ? value : {};
  const result = {};
  ["source_type", "source_platform", "referrer", "landing_path", "utm_source", "utm_medium", "utm_campaign", "utm_content", "utm_term"].forEach(function (key) {
    const maximum = key === "referrer" ? 500 : 180;
    const cleaned = clean(input[key], maximum);
    if (cleaned) result[key] = cleaned;
  });
  return result;
}

export default async function handler(request, response) {
  if (request.method !== "POST") return json(response, 405, { error: "Método não permitido." });
  try {
    const input = typeof request.body === "string" ? JSON.parse(request.body) : (request.body || {});
    const sessionId = clean(input.session_id, 36);
    if (!/^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(sessionId)) {
      return json(response, 400, { error: "Sessão inválida." });
    }
    const email = clean(input.email, 254).toLowerCase();
    const phone = clean(input.phone, 40);
    if (!email.includes("@") && phone.replace(/\D/g, "").length < 8) {
      return json(response, 202, { saved: false });
    }
    const attribution = cleanAttribution(input.attribution);
    const now = new Date().toISOString();
    const existingRows = await supabase("checkout_leads?select=status,order_id,first_seen_at&session_id=eq." + encodeURIComponent(sessionId) + "&limit=1");
    const existing = existingRows?.[0];
    await supabase("checkout_leads?on_conflict=session_id", {
      method: "POST",
      headers: { Prefer: "resolution=merge-duplicates,return=minimal" },
      body: [{
        session_id: sessionId,
        customer_name: clean(input.name, 160),
        email,
        phone,
        address: clean(input.address),
        city: clean(input.city, 120),
        state: clean(input.state, 80),
        country: clean(input.country, 2).toUpperCase(),
        zipcode: clean(input.zipcode, 30),
        status: existing?.status || "lead",
        order_id: existing?.order_id || null,
        source_type: clean(attribution.source_type || "direct", 40),
        source_platform: clean(attribution.source_platform || "direct", 80),
        attribution,
        first_seen_at: existing?.first_seen_at || now,
        last_seen_at: now
      }]
    });
    return json(response, 200, { saved: true });
  } catch (error) {
    return json(response, 500, { error: error.message || "Não foi possível registrar o contato." });
  }
}
