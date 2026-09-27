export interface GitHubDispatchConfig {
  token: string;
  owner: string;
  repository: string;
  workflowFile: string;
  ref: string;
}

export interface RefreshDependencies {
  allowedOrigins: string[];
  authenticate(jwt: string): Promise<boolean>;
  isAdmin(jwt: string): Promise<boolean>;
  githubConfig(): GitHubDispatchConfig | null;
  dispatch(config: GitHubDispatchConfig): Promise<boolean>;
}

export async function handleSnapshotRefresh(request: Request, deps: RefreshDependencies): Promise<Response> {
  const origin = request.headers.get("origin");
  if (origin && !deps.allowedOrigins.includes(origin)) return Response.json({ code: "origin_denied", message: "Origin not allowed." }, { status: 403 });
  const headers: Record<string, string> = origin ? {
    "Access-Control-Allow-Origin": origin,
    "Access-Control-Allow-Methods": "POST, OPTIONS",
    "Access-Control-Allow-Headers": "authorization, apikey, content-type, x-client-info, x-retry-count, traceparent, tracestate, baggage",
    Vary: "Origin",
  } : {};
  const respond = (status: number, code: string, message: string) => Response.json({ code, message }, { status, headers });
  if (request.method === "OPTIONS") return new Response(null, { status: 204, headers });
  if (request.method !== "POST") return respond(405, "method_not_allowed", "Use POST.");

  const jwt = /^Bearer\s+([^\s]+)$/.exec(request.headers.get("authorization") ?? "")?.[1];
  if (!jwt) return respond(401, "unauthenticated", "Sign in before requesting a refresh.");
  try {
    if (!await deps.authenticate(jwt)) return respond(401, "unauthenticated", "Your session is no longer valid.");
  } catch {
    return respond(401, "unauthenticated", "Your session could not be verified.");
  }
  try {
    if (!await deps.isAdmin(jwt)) return respond(403, "unauthorised", "Administrator access required.");
  } catch {
    return respond(503, "admin_check_failed", "Administrator access could not be checked.");
  }

  const config = deps.githubConfig();
  if (!config) return respond(503, "configuration_missing", "Snapshot refresh is not configured.");
  try {
    if (!await deps.dispatch(config)) return respond(502, "github_rejected", "GitHub did not accept the refresh request.");
    return respond(202, "queued", "Snapshot refresh queued.");
  } catch {
    return respond(502, "github_unavailable", "GitHub could not be reached.");
  }
}
