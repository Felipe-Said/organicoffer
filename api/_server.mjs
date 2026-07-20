export function env(name, aliases = []) {
  for (const key of [name].concat(aliases)) if (process.env[key]) return process.env[key];
  return "";
}

export function json(response, status, payload) {
  response.setHeader("Content-Type", "application/json; charset=utf-8");
  response.setHeader("Cache-Control", "no-store");
  return response.status(status).json(payload);
}

export async function supabase(path, options = {}) {
  const url = env("SUPABASE_URL", ["NEXT_PUBLIC_SUPABASE_URL", "VITE_SUPABASE_URL"]);
  const serviceKey = env("SUPABASE_SERVICE_ROLE_KEY");
  if (!url || !serviceKey) throw new Error("Supabase do servidor não configurado.");
  const response = await fetch(url + "/rest/v1/" + path, {
    method: options.method || "GET",
    headers: Object.assign({
      apikey: serviceKey,
      Authorization: "Bearer " + serviceKey,
      "Content-Type": "application/json"
    }, options.headers || {}),
    body: options.body === undefined ? undefined : JSON.stringify(options.body)
  });
  const text = await response.text();
  const payload = text ? JSON.parse(text) : null;
  if (!response.ok) throw new Error(payload?.message || "Falha ao acessar o banco.");
  return payload;
}

export async function stripe(path, options = {}) {
  const secret = env("STRIPE_SECRET_KEY");
  if (!secret) throw new Error("STRIPE_SECRET_KEY não configurada na Vercel.");
  const response = await fetch("https://api.stripe.com/v1/" + path, {
    method: options.method || "GET",
    headers: {
      Authorization: "Bearer " + secret,
      "Content-Type": "application/x-www-form-urlencoded"
    },
    body: options.body
  });
  const payload = await response.json();
  if (!response.ok) throw new Error(payload?.error?.message || "Falha ao acessar a Stripe.");
  return payload;
}

export async function storageDownload(bucket, path) {
  const url = env("SUPABASE_URL", ["NEXT_PUBLIC_SUPABASE_URL", "VITE_SUPABASE_URL"]);
  const serviceKey = env("SUPABASE_SERVICE_ROLE_KEY");
  if (!url || !serviceKey) throw new Error("Supabase do servidor não configurado.");
  const objectPath = [bucket].concat(path.split("/")).map(encodeURIComponent).join("/");
  const response = await fetch(url + "/storage/v1/object/" + objectPath, {
    headers: { apikey: serviceKey, Authorization: "Bearer " + serviceKey }
  });
  if (!response.ok) throw new Error("Não foi possível baixar o e-book privado.");
  return Buffer.from(await response.arrayBuffer());
}

export async function storageSignedUrl(bucket, path, expiresIn = 900) {
  const url = env("SUPABASE_URL", ["NEXT_PUBLIC_SUPABASE_URL", "VITE_SUPABASE_URL"]);
  const serviceKey = env("SUPABASE_SERVICE_ROLE_KEY");
  if (!url || !serviceKey) throw new Error("Supabase do servidor não configurado.");
  const objectPath = [bucket].concat(path.split("/")).map(encodeURIComponent).join("/");
  const response = await fetch(url + "/storage/v1/object/sign/" + objectPath, {
    method: "POST",
    headers: { apikey: serviceKey, Authorization: "Bearer " + serviceKey, "Content-Type": "application/json" },
    body: JSON.stringify({ expiresIn })
  });
  const payload = await response.json();
  if (!response.ok) throw new Error(payload?.message || "Não foi possível liberar a visualização do e-book.");
  const signed = payload.signedURL || payload.signedUrl;
  if (!signed) throw new Error("O Supabase não retornou o acesso temporário ao e-book.");
  return /^https?:/.test(signed) ? signed : url + "/storage/v1" + signed;
}

export function appendForm(params, key, value) {
  if (value !== undefined && value !== null && value !== "") params.append(key, String(value));
}
