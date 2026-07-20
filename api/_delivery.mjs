import { resendEmail, storageDownload, supabase } from "./_server.mjs";

function escapeHtml(value) {
  return String(value || "").replace(/[&<>"']/g, function (character) {
    return { "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#039;" }[character];
  });
}

export async function deliverEbook(orderId) {
  const orders = await supabase("orders?select=*&id=eq." + encodeURIComponent(orderId) + "&limit=1");
  const order = orders?.[0];
  if (!order) throw new Error("Pedido da entrega não encontrado.");
  const existing = await supabase("email_delivery_jobs?select=*&order_id=eq." + encodeURIComponent(orderId) + "&limit=1");
  if (order.ebook_sent_at || existing?.[0]?.status === "sent") return { alreadySent: true };

  const settingsRows = await supabase("app_settings?select=value&key=eq.delivery&limit=1");
  const settings = settingsRows?.[0]?.value || {};
  if (settings.provider !== "resend" || !settings.storage_path || !settings.sender_email) {
    throw new Error("Entrega Resend ou e-book não configurado no painel.");
  }
  const jobRows = await supabase("email_delivery_jobs?on_conflict=order_id", {
    method: "POST",
    headers: { Prefer: "resolution=merge-duplicates,return=representation" },
    body: [{ order_id: orderId, status: "processing", error_message: null, processed_at: null }]
  });
  const job = jobRows[0];
  try {
    const ebook = await storageDownload("ebooks", settings.storage_path);
    if (ebook.length > 28 * 1024 * 1024) throw new Error("O e-book excede o limite seguro de 28 MB.");
    const senderName = settings.sender_name || "Vovó Tereza";
    const result = await resendEmail({
      from: senderName + " <" + settings.sender_email + ">",
      to: [order.email],
      subject: settings.subject || "Seu e-book chegou",
      html: "<div style=\"font-family:Arial,sans-serif;line-height:1.6;color:#2a2119\"><h2>Olá, " + escapeHtml(order.customer_name) + "!</h2><p>Seu pagamento foi confirmado e o seu e-book está anexado a este e-mail.</p><p>Obrigado pela sua compra.</p><p><strong>" + escapeHtml(senderName) + "</strong></p></div>",
      attachments: [{ filename: settings.file_name || "ebook.pdf", content: ebook.toString("base64") }],
      tags: [{ name: "order_id", value: String(orderId).replace(/[^A-Za-z0-9_-]/g, "-") }]
    }, "ebook-order-" + orderId);
    const deliveredAt = new Date().toISOString();
    await supabase("email_delivery_jobs?id=eq." + encodeURIComponent(job.id), {
      method: "PATCH", body: { status: "sent", provider_reference: result.id || null, processed_at: deliveredAt }
    });
    await supabase("orders?id=eq." + encodeURIComponent(orderId), {
      method: "PATCH", body: { ebook_sent_at: deliveredAt, updated_at: deliveredAt }
    });
    return { deliveredAt, emailId: result.id || null };
  } catch (error) {
    await supabase("email_delivery_jobs?id=eq." + encodeURIComponent(job.id), {
      method: "PATCH", body: { status: "failed", error_message: String(error.message || error).slice(0, 1000), processed_at: new Date().toISOString() }
    }).catch(function () {});
    throw error;
  }
}
