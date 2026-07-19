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

export function appendForm(params, key, value) {
  if (value !== undefined && value !== null && value !== "") params.append(key, String(value));
}
