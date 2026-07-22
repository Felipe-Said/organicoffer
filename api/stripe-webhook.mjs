import crypto from "node:crypto";
import { env, json, supabase } from "./_server.mjs";

export const config = { api: { bodyParser: false } };

async function rawBody(request) {
  const chunks = [];
  for await (const chunk of request) chunks.push(Buffer.isBuffer(chunk) ? chunk : Buffer.from(chunk));
  return Buffer.concat(chunks);
}

function validSignature(body, header, secret) {
  const parts = Object.fromEntries(String(header || "").split(",").map(function (part) { return part.split("="); }));
  const timestamp = Number(parts.t || 0);
  if (!timestamp || Math.abs(Date.now() / 1000 - timestamp) > 300) return false;
  const expected = crypto.createHmac("sha256", secret).update(timestamp + ".").update(body).digest("hex");
  const candidates = String(header || "").split(",").filter(function (part) { return part.startsWith("v1="); }).map(function (part) { return part.slice(3); });
  return candidates.some(function (signature) {
    const left = Buffer.from(signature, "hex");
    const right = Buffer.from(expected, "hex");
    return left.length === right.length && crypto.timingSafeEqual(left, right);
  });
}

export default async function handler(request, response) {
  if (request.method !== "POST") return json(response, 405, { error: "Método não permitido." });
  try {
    const secret = env("STRIPE_WEBHOOK_SECRET");
    if (!secret) throw new Error("STRIPE_WEBHOOK_SECRET não configurada.");
    const body = await rawBody(request);
    if (!validSignature(body, request.headers["stripe-signature"], secret)) return json(response, 400, { error: "Assinatura inválida." });
    const event = JSON.parse(body.toString("utf8"));
    if (event.type === "checkout.session.completed" || event.type === "checkout.session.async_payment_succeeded") {
      const session = event.data.object;
      const orderId = session.metadata?.order_id || session.client_reference_id;
      const paid = event.type === "checkout.session.async_payment_succeeded" || session.payment_status === "paid" || session.payment_status === "no_payment_required";
      if (orderId && paid) {
        await supabase("orders?id=eq." + encodeURIComponent(orderId), {
          method: "PATCH",
          body: { status: "success", payment_reference: session.id,
            stripe_customer_id: session.customer || null,
            stripe_subscription_id: session.subscription || null,
            subscription_status: session.subscription ? "active" : null,
            updated_at: new Date().toISOString() }
        });
        await supabase("checkout_leads?order_id=eq." + encodeURIComponent(orderId), {
          method: "PATCH", body: { status: "converted", last_seen_at: new Date().toISOString() }
        });
      }
    }
    if (event.type === "customer.subscription.updated" || event.type === "customer.subscription.deleted") {
      const subscription = event.data.object;
      await supabase("orders?stripe_subscription_id=eq." + encodeURIComponent(subscription.id), {
        method: "PATCH", body: { subscription_status: subscription.status, updated_at: new Date().toISOString() }
      });
    }
    if (event.type === "checkout.session.async_payment_failed") {
      const session = event.data.object;
      const orderId = session.metadata?.order_id || session.client_reference_id;
      if (orderId) await supabase("orders?id=eq." + encodeURIComponent(orderId), {
        method: "PATCH", body: { status: "failed", payment_reference: session.id, updated_at: new Date().toISOString() }
      });
    }
    return json(response, 200, { received: true });
  } catch (error) {
    return json(response, 400, { error: error.message || "Webhook inválido." });
  }
}
