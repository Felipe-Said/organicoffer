const allowedEventTypes = new Set(["page_view", "checkout_click", "heartbeat", "click", "scroll_depth"]);

export default async function handler(request, response) {
  if (request.method !== "POST") {
    response.setHeader("Allow", "POST");
    response.status(405).json({ error: "Método não permitido." });
    return;
  }

  const url = process.env.SUPABASE_URL || process.env.NEXT_PUBLIC_SUPABASE_URL || process.env.VITE_SUPABASE_URL || "";
  const anonKey = process.env.SUPABASE_ANON_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || process.env.VITE_SUPABASE_ANON_KEY || "";
  if (!url || !anonKey) {
    response.status(503).json({ error: "Banco de dados não configurado." });
    return;
  }

  const body = typeof request.body === "string" ? JSON.parse(request.body || "{}") : request.body || {};
  if (!/^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(body.session_id || "") || !allowedEventTypes.has(body.event_type)) {
    response.status(400).json({ error: "Evento inválido." });
    return;
  }

  const event = {
    session_id: body.session_id,
    event_type: body.event_type,
    path: String(body.path || "/").slice(0, 500),
    event_data: body.event_data && typeof body.event_data === "object" ? body.event_data : {}
  };

  try {
    const upstream = await fetch(url + "/rest/v1/site_events", {
      method: "POST",
      headers: {
        apikey: anonKey,
        Authorization: "Bearer " + anonKey,
        "Content-Type": "application/json",
        Prefer: "return=minimal"
      },
      body: JSON.stringify(event)
    });
    if (!upstream.ok) {
      const payload = await upstream.json().catch(function () { return {}; });
      response.status(upstream.status).json({ error: payload.message || "Não foi possível registrar o evento." });
      return;
    }
    response.setHeader("Cache-Control", "no-store, max-age=0");
    response.status(204).end();
  } catch (_) {
    response.status(502).json({ error: "Falha na comunicação com o banco de dados." });
  }
}
