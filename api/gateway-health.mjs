import { env, json, requireAdmin, stripe, supabase } from "./_server.mjs";

function result(key, label, status, detail) {
  return { key, label, status, detail };
}

export default async function handler(request, response) {
  if (request.method !== "GET") return json(response, 405, { error: "Método não permitido." });
  try {
    await requireAdmin(request);
    const checks = [];
    const stripeSecret = env("STRIPE_SECRET_KEY");
    const webhookSecret = env("STRIPE_WEBHOOK_SECRET");

    if (!stripeSecret) {
      checks.push(result("stripe_key", "Chave secreta da Stripe", "error", "STRIPE_SECRET_KEY não está configurada na Vercel."));
    } else {
      try {
        await stripe("balance");
        checks.push(result("stripe_account", "Conexão com a Stripe", "ok", "A chave foi autenticada e a conta respondeu corretamente."));
        const liveMode = stripeSecret.startsWith("sk_live_");
        checks.push(result("stripe_mode", "Ambiente Stripe", liveMode ? "ok" : "warning", liveMode ? "Modo produção ativo." : "Modo de teste ativo; vendas reais não serão cobradas."));
      } catch (error) {
        checks.push(result("stripe_account", "Conta Stripe", "error", "A chave foi encontrada, mas a Stripe recusou a conexão: " + error.message));
      }
    }

    if (!webhookSecret) {
      checks.push(result("webhook_secret", "Segredo do webhook", "error", "STRIPE_WEBHOOK_SECRET não está configurado na Vercel."));
    } else {
      checks.push(result("webhook_secret", "Segredo do webhook", "ok", "Segredo disponível no servidor."));
      if (stripeSecret) {
        try {
          const endpoints = await stripe("webhook_endpoints?limit=100");
          const endpoint = (endpoints.data || []).find(function (item) { return /\/api\/stripe-webhook\/?(?:\?|$)/.test(item.url || ""); });
          const listening = endpoint && endpoint.status === "enabled" && (endpoint.enabled_events || []).some(function (event) {
            return event === "*" || event === "checkout.session.completed" || event === "checkout.session.async_payment_succeeded";
          });
          checks.push(result("webhook_endpoint", "Endpoint do webhook", listening ? "ok" : "error", listening
            ? "Endpoint ativo na Stripe e ouvindo confirmações do Checkout."
            : "Nenhum endpoint ativo para /api/stripe-webhook recebendo confirmações foi encontrado."));
        } catch (error) {
          checks.push(result("webhook_endpoint", "Endpoint do webhook", "warning", "Não foi possível listar os endpoints com esta chave: " + error.message));
        }
      }
    }

    try {
      const [settingRows, offerRows, saleRows] = await Promise.all([
        supabase("app_settings?select=value&key=eq.payment_gateway&limit=1"),
        supabase("offers?select=title,price,active&slug=eq.bundle&limit=1"),
        supabase("orders?select=order_number,amount,currency,created_at&status=eq.success&order=created_at.desc&limit=1")
      ]);
      const settings = settingRows[0]?.value || {};
      const offer = offerRows[0];
      const validGateway = settings.provider === "stripe" && ["payment", "subscription"].includes(settings.checkout_mode) && String(settings.currency || "brl").toLowerCase() === "brl";
      checks.push(result("gateway_settings", "Configuração do painel", validGateway ? "ok" : "error", validGateway
        ? "Stripe em BRL configurada para " + (settings.checkout_mode === "subscription" ? "assinatura" : "pagamento único") + "."
        : "Salve novamente o gateway com Stripe, BRL e um tipo de cobrança válido."));
      const validOffer = Boolean(offer && offer.active && Number(offer.price) >= .5);
      checks.push(result("active_offer", "Oferta cobrável", validOffer ? "ok" : "error", validOffer
        ? offer.title + " por " + new Intl.NumberFormat("pt-BR", { style: "currency", currency: "BRL" }).format(Number(offer.price)) + "."
        : "A oferta principal está inativa ou sem um preço válido."));
      const sale = saleRows[0];
      checks.push(result("confirmed_sales", "Vendas confirmadas", sale ? "ok" : "warning", sale
        ? "Última confirmação: pedido " + sale.order_number + " em " + new Date(sale.created_at).toLocaleString("pt-BR", { timeZone: "America/Sao_Paulo" }) + "."
        : "Configuração verificável, mas ainda não há venda confirmada no banco."));
    } catch (error) {
      checks.push(result("database", "Banco de pedidos", "error", error.message));
    }

    const errors = checks.filter(function (check) { return check.status === "error"; }).length;
    const warnings = checks.filter(function (check) { return check.status === "warning"; }).length;
    return json(response, 200, {
      ready: errors === 0,
      receiving_sales: checks.some(function (check) { return check.key === "confirmed_sales" && check.status === "ok"; }),
      summary: errors ? errors + " problema(s) impedem a operação." : warnings ? "Configuração operacional com " + warnings + " alerta(s)." : "Gateway pronto e recebendo vendas.",
      checked_at: new Date().toISOString(),
      checks
    });
  } catch (error) {
    const unauthorized = /Sessão|permissão/.test(error.message || "");
    return json(response, unauthorized ? 401 : 500, { error: error.message || "Não foi possível verificar o gateway." });
  }
}
