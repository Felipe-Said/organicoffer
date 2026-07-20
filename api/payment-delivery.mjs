import { json, storageSignedUrl } from "./_server.mjs";
import { markDigitalDelivered, paidDigitalAccess } from "./_payment-access.mjs";

export default async function handler(request, response) {
  if (request.method !== "GET") return json(response, 405, { error: "Método não permitido." });
  try {
    const access = await paidDigitalAccess(request.query?.session_id);
    const previewUrl = await storageSignedUrl("ebooks", access.settings.storage_path, 900);
    await markDigitalDelivered(access);
    return json(response, 200, {
      file_name: access.settings.file_name || "ebook.pdf",
      preview_url: previewUrl,
      download_url: "/api/download-ebook?session_id=" + encodeURIComponent(access.session.id)
    });
  } catch (error) {
    return json(response, 403, { error: error.message || "Acesso ao e-book não autorizado." });
  }
}
