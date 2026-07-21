export default async function handler(request, response) {
  if (request.method !== "GET") {
    response.setHeader("Allow", "GET");
    response.status(405).json({ error: "Método não permitido." });
    return;
  }

  const url = process.env.SUPABASE_URL || process.env.NEXT_PUBLIC_SUPABASE_URL || process.env.VITE_SUPABASE_URL || "";
  const anonKey = process.env.SUPABASE_ANON_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || process.env.VITE_SUPABASE_ANON_KEY || "";
  if (!url || !anonKey) {
    response.status(503).json({ error: "Banco de dados não configurado." });
    return;
  }

  try {
    const upstream = await fetch(url + "/rest/v1/page_content?select=selector,content_type,value", {
      headers: { apikey: anonKey, Authorization: "Bearer " + anonKey }
    });
    const payload = await upstream.json();
    if (!upstream.ok) {
      response.status(upstream.status).json({ error: payload.message || "Não foi possível carregar o conteúdo." });
      return;
    }
    response.setHeader("Cache-Control", "no-store, max-age=0");
    response.status(200).json(payload);
  } catch (error) {
    response.status(502).json({ error: "Falha na comunicação com o banco de dados." });
  }
}
