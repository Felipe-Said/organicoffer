import { json, requireAdmin, stripe, supabase } from "./_server.mjs";

export default async function handler(request, response) {
  if (request.method !== "POST") return json(response, 405, { error: "Método não permitido." });
  try {
    await requireAdmin(request);
    const input = typeof request.body === "string" ? JSON.parse(request.body) : (request.body || {});
    const orderId = String(input.order_id || "").trim();
    if (!/^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(orderId)) {
      return json(response, 400, { error: "Pedido inválido." });
    }

    const rows = await supabase("orders?select=id,stripe_subscription_id,subscription_status,billing_type&id=eq." + encodeURIComponent(orderId) + "&limit=1");
    const order = rows[0];
    if (!order || order.billing_type !== "subscription" || !order.stripe_subscription_id) {
      return json(response, 404, { error: "Este cliente não possui uma assinatura vinculada." });
    }
    if (["canceled", "incomplete_expired"].includes(order.subscription_status)) {
      return json(response, 200, { subscription_status: order.subscription_status });
    }

    const subscription = await stripe("subscriptions/" + encodeURIComponent(order.stripe_subscription_id), { method: "DELETE" });
    await supabase("orders?stripe_subscription_id=eq." + encodeURIComponent(order.stripe_subscription_id), {
      method: "PATCH",
      body: { subscription_status: subscription.status || "canceled", updated_at: new Date().toISOString() }
    });
    return json(response, 200, { subscription_status: subscription.status || "canceled" });
  } catch (error) {
    return json(response, 400, { error: error.message || "Não foi possível cancelar a assinatura." });
  }
}
