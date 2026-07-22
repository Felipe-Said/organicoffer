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
    if (String(request.query?.gateway || "") === "1") {
      const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY || "";
      if (!serviceKey) return response.status(503).json({ error: "Configuração do servidor indisponível." });
      const gatewayResponse = await fetch(url + "/rest/v1/app_settings?select=value&key=eq.payment_gateway&limit=1", {
        headers: { apikey: serviceKey, Authorization: "Bearer " + serviceKey }
      });
      const gatewayRows = await gatewayResponse.json();
      if (!gatewayResponse.ok) return response.status(gatewayResponse.status).json({ error: gatewayRows.message || "Não foi possível carregar o gateway." });
      const value = gatewayRows[0]?.value || {};
      response.setHeader("Cache-Control", "no-store, max-age=0");
      return response.status(200).json({
        provider: value.provider === "external" ? "external" : "stripe",
        external_url: /^https:\/\//i.test(String(value.external_url || "")) ? String(value.external_url) : ""
      });
    }
    const upstream = await fetch(url + "/rest/v1/page_content?select=selector,content_type,value", {
      headers: { apikey: anonKey, Authorization: "Bearer " + anonKey }
    });
    const payload = await upstream.json();
    if (!upstream.ok) {
      response.status(upstream.status).json({ error: payload.message || "Não foi possível carregar o conteúdo." });
      return;
    }
    response.setHeader("Cache-Control", "public, max-age=0, s-maxage=15, stale-while-revalidate=60");
    response.status(200).json(payload);
  } catch (error) {
    response.status(502).json({ error: "Falha na comunicação com o banco de dados." });
  }
}
