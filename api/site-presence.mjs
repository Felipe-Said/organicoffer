import { json, supabase } from "./_server.mjs";

export default async function handler(request, response) {
  if (request.method !== "POST") return json(response, 405, { error: "Método não permitido." });
  try {
    const input = typeof request.body === "string" ? JSON.parse(request.body) : (request.body || {});
    const sessionId = String(input.session_id || "").trim();
    if (!/^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(sessionId)) {
      return json(response, 400, { error: "Sessão inválida." });
    }
    await supabase("site_presence?on_conflict=session_id", {
      method: "POST",
      headers: { Prefer: "resolution=merge-duplicates,return=minimal" },
      body: [{
        session_id: sessionId,
        path: String(input.path || "/").slice(0, 500),
        active: input.active !== false,
        last_seen: new Date().toISOString()
      }]
    });
    response.setHeader("Cache-Control", "no-store");
    return response.status(204).end();
  } catch (error) {
    return json(response, 500, { error: error.message || "Não foi possível atualizar a presença." });
  }
}
