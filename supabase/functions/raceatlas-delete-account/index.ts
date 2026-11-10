// RaceAtlas: verified, self-service account deletion.
// Deletion is destructive and only the authenticated owner may request it.
const allowedOrigin = "https://samknook.github.io";
const base = {
  "Content-Type": "application/json; charset=utf-8",
  "Cache-Control": "no-store",
  "Vary": "Origin",
  "Access-Control-Allow-Origin": allowedOrigin,
  "Access-Control-Allow-Headers": "authorization, apikey, content-type, x-client-info",
  "Access-Control-Allow-Methods": "POST, OPTIONS"
};
const response = (code: number, obj: Record<string, unknown>) =>
  new Response(JSON.stringify(obj), { status: code, headers: base });

Deno.serve(async (req: Request) => {
  const origin = req.headers.get("Origin");
  if (origin && origin !== allowedOrigin) return response(403, { error: "Origin not allowed" });
  if (req.method === "OPTIONS") return new Response(null, { status: 204, headers: base });
  if (req.method !== "POST") return response(405, { error: "Method not allowed" });

  const jwt = req.headers.get("Authorization")?.match(/^Bearer ([^\s]+)$/i)?.[1];
  if (!jwt) return response(401, { error: "Sign in required" });

  let body: { confirm?: unknown };
  try {
    if (Number(req.headers.get("Content-Length") || "0") > 2048)
      return response(413, { error: "Invalid request" });
    body = await req.json();
  } catch {
    return response(400, { error: "Invalid JSON" });
  }
  if (body?.confirm !== "VERWIJDER MIJN ACCOUNT")
    return response(400, { error: "Confirmation required" });

  const url = Deno.env.get("SUPABASE_URL");
  const service = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY");
  if (!url || !service) return response(503, { error: "Service unavailable" });

  // A JWT is not trusted until Supabase Auth validates its signature and expiry.
  const who = await fetch(url + "/auth/v1/user", {
    headers: { apikey: service, Authorization: "Bearer " + jwt },
  });
  if (!who.ok) return response(401, { error: "Session invalid" });
  const user = await who.json();
  if (typeof user?.id !== "string" || !/^[a-f0-9-]{36}$/i.test(user.id))
    return response(401, { error: "Session invalid" });

  // Admin request is server-side; the service-role credential is never sent to the browser.
  // Foreign keys cascade to saved events and notification preferences.
  const remove = await fetch(url + "/auth/v1/admin/users/" + encodeURIComponent(user.id), {
    method: "DELETE",
    headers: { apikey: service, Authorization: "Bearer " + service }
  });
  if (!remove.ok) return response(500, { error: "Account deletion failed" });
  return response(200, { deleted: true });
});
