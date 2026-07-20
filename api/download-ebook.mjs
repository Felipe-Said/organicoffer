import { storageDownload } from "./_server.mjs";
import { paidDigitalAccess } from "./_payment-access.mjs";

export default async function handler(request, response) {
  if (request.method !== "GET") return response.status(405).send("Método não permitido.");
  try {
    const access = await paidDigitalAccess(request.query?.session_id);
    const ebook = await storageDownload("ebooks", access.settings.storage_path);
    const fileName = String(access.settings.file_name || "ebook.pdf").replace(/["\\\r\n]/g, "_");
    response.setHeader("Content-Type", "application/pdf");
    response.setHeader("Content-Disposition", "attachment; filename=\"" + fileName + "\"");
    response.setHeader("Content-Length", String(ebook.length));
    response.setHeader("Cache-Control", "private, no-store");
    return response.status(200).send(ebook);
  } catch (error) {
    return response.status(403).send(error.message || "Download não autorizado.");
  }
}
