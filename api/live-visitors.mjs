import { json, requireAdmin, supabase } from "./_server.mjs";

export default async function handler(request, response) {
  if (request.method !== "GET") return json(response, 405, { error: "Método não permitido." });
  try {
    await requireAdmin(request);
    const cutoff = new Date(Date.now() - 12000).toISOString();
    const rows = await supabase("site_presence?select=session_id&active=eq.true&last_seen=gte." + encodeURIComponent(cutoff));
    return json(response, 200, { visitors: new Set(rows.map(function (row) { return row.session_id; })).size });
  } catch (error) {
    return json(response, 401, { error: error.message || "Não foi possível consultar visitantes ativos." });
  }
}
