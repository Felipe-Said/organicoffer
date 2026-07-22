import { appendForm, json, stripe, supabase } from "./_server.mjs";

function clean(value, maximum = 300) {
  return String(value || "").trim().slice(0, maximum);
}

export default async function handler(request, response) {
  if (request.method !== "POST") return json(response, 405, { error: "Método não permitido." });
  try {
    const input = typeof request.body === "string" ? JSON.parse(request.body) : (request.body || {});
    const customer = {
      name: clean(input.name, 160), email: clean(input.email, 254).toLowerCase(), phone: clean(input.phone, 40),
      address: clean(input.address), city: clean(input.city, 120), state: clean(input.state, 80), country: clean(input.country, 2).toUpperCase(),
      zipcode: clean(input.zipcode, 30), session_id: clean(input.session_id, 36)
    };
    if (!/^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(customer.session_id)) customer.session_id = "";
    if (!customer.name || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(customer.email) ||
        customer.phone.replace(/\D/g, "").length < 8) {
      return json(response, 400, { error: "Preencha corretamente nome, e-mail e telefone." });
    }

    const [settingsRows, offerRows, leadRows] = await Promise.all([
      supabase("app_settings?select=value&key=eq.payment_gateway&limit=1"),
      supabase("offers?select=title,price,active&slug=eq.bundle&limit=1"),
      customer.session_id ? supabase("checkout_leads?select=source_type,source_platform,attribution&session_id=eq." + encodeURIComponent(customer.session_id) + "&limit=1") : Promise.resolve([])
    ]);
    const settings = settingsRows?.[0]?.value || {};
    const offer = offerRows?.[0];
    const lead = leadRows?.[0] || {};
    if (settings.provider !== "stripe") throw new Error("Gateway Stripe não está ativo.");
    if (!offer || !offer.active) throw new Error("A oferta principal está indisponível.");
    const supporterChoice = clean(input.billing_type, 20) === "subscription";
    const optionalSupporter = settings.supporter_enabled !== false;
    const mode = optionalSupporter ? (supporterChoice ? "subscription" : "payment") :
      (settings.checkout_mode === "subscription" ? "subscription" : "payment");
    const amount = Number(offer.price);
    const unitAmount = Math.round(amount * 100);
    if (!Number.isFinite(amount) || unitAmount < 50) throw new Error("Configure um preço válido em Produtos & Ofertas.");

    const orderRows = await supabase("orders", {
      method: "POST",
      headers: { Prefer: "return=representation" },
      body: [{ customer_name: customer.name, email: customer.email, phone: customer.phone || null,
        address: customer.address || null, city: customer.city || null, state: customer.state || null, country: customer.country || null,
        zipcode: customer.zipcode || null, session_id: customer.session_id || null,
        amount: amount, currency: "BRL",
        status: "pending", billing_type: mode,
        source_type: lead.source_type || "direct", source_platform: lead.source_platform || "direct", attribution: lead.attribution || {} }]
    });
    const order = orderRows[0];
    const customerParams = new URLSearchParams();
    appendForm(customerParams, "name", customer.name);
    appendForm(customerParams, "email", customer.email);
    appendForm(customerParams, "phone", customer.phone);
    appendForm(customerParams, "metadata[order_id]", order.id);
    appendForm(customerParams, "metadata[order_number]", order.order_number);
    const stripeCustomer = await stripe("customers", { method: "POST", body: customerParams });
    const origin = "https://receitasdavovotereza.site";
    const params = new URLSearchParams();
    appendForm(params, "mode", mode);
    appendForm(params, "line_items[0][price_data][currency]", "brl");
    appendForm(params, "line_items[0][price_data][unit_amount]", unitAmount);
    appendForm(params, "line_items[0][price_data][product_data][name]", offer.title || "Livro de Remédios Antigos");
    appendForm(params, "line_items[0][price_data][product_data][metadata][product_type]", "digital");
    if (mode === "subscription") appendForm(params, "line_items[0][price_data][recurring][interval]", optionalSupporter ? "month" : (settings.subscription_interval === "year" ? "year" : "month"));
    appendForm(params, "line_items[0][quantity]", 1);
    appendForm(params, "customer", stripeCustomer.id);
    appendForm(params, "client_reference_id", order.id);
    appendForm(params, "ui_mode", "embedded_page");
    appendForm(params, "return_url", origin + "/receitas?payment=success&session_id={CHECKOUT_SESSION_ID}");
    appendForm(params, "redirect_on_completion", "if_required");
    appendForm(params, "metadata[order_id]", order.id);
    appendForm(params, "metadata[order_number]", order.order_number);
    appendForm(params, "metadata[product_type]", "digital");
    appendForm(params, "metadata[fulfillment_status]", "pending");
    if (mode === "subscription") appendForm(params, "subscription_data[metadata][order_id]", order.id);
    const checkout = await stripe("checkout/sessions", { method: "POST", body: params });
    await supabase("orders?id=eq." + encodeURIComponent(order.id), {
      method: "PATCH", body: { payment_reference: checkout.id, stripe_customer_id: stripeCustomer.id, updated_at: new Date().toISOString() }
    });
    if (customer.session_id) await supabase("checkout_leads?session_id=eq." + encodeURIComponent(customer.session_id), {
      method: "PATCH", body: { status: "checkout", order_id: order.id, last_seen_at: new Date().toISOString() }
    });
    if (!checkout.client_secret) throw new Error("A Stripe não retornou o acesso ao checkout incorporado.");
    return json(response, 200, { client_secret: checkout.client_secret, session_id: checkout.id });
  } catch (error) {
    return json(response, 500, { error: error.message || "Não foi possível iniciar o checkout." });
  }
}
