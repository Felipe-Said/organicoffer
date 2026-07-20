import { stripe, supabase } from "./_server.mjs";

export async function paidDigitalAccess(sessionId) {
  if (!/^cs_[A-Za-z0-9_]+$/.test(String(sessionId || ""))) throw new Error("Sessão de pagamento inválida.");
  const session = await stripe("checkout/sessions/" + encodeURIComponent(sessionId));
  const paid = session.payment_status === "paid" || session.payment_status === "no_payment_required";
  if (!paid) throw new Error("O pagamento ainda não foi confirmado pela Stripe.");
  const orderId = session.metadata?.order_id || session.client_reference_id;
  if (!orderId) throw new Error("Pedido não associado à sessão de pagamento.");
  const settingsRows = await supabase("app_settings?select=value&key=eq.delivery&limit=1");
  const settings = settingsRows?.[0]?.value || {};
  if (!settings.storage_path) throw new Error("O e-book ainda não foi configurado no painel.");
  return { session, orderId, settings };
}

export async function markDigitalDelivered(access) {
  const deliveredAt = new Date().toISOString();
  await supabase("orders?id=eq." + encodeURIComponent(access.orderId), {
    method: "PATCH", body: { status: "success", ebook_sent_at: deliveredAt, updated_at: deliveredAt }
  });
  const metadata = new URLSearchParams();
  metadata.append("metadata[product_type]", "digital");
  metadata.append("metadata[fulfillment_status]", "delivered");
  metadata.append("metadata[delivered_at]", deliveredAt);
  await stripe("checkout/sessions/" + encodeURIComponent(access.session.id), { method: "POST", body: metadata });
  return deliveredAt;
}
