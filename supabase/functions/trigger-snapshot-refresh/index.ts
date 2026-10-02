import { createClient } from "@supabase/supabase-js";
import { handleSnapshotRefresh, type GitHubDispatchConfig } from "./logic.ts";

declare const Deno: {
  env: { get(name: string): string | undefined };
  serve(handler: (request: Request) => Promise<Response>): void;
};

const env = (name: string) => Deno.env.get(name)?.trim() ?? "";
const allowedOrigins = env("FIS_ALLOWED_ORIGINS").split(",").map((value) => value.trim()).filter(Boolean);

function callerClient(jwt: string) {
  const url = env("SUPABASE_URL");
  const key = env("SUPABASE_PUBLISHABLE_KEY");
  if (!url || !key) throw new Error("Public Supabase configuration is missing.");
  return createClient(url, key, {
    global: { headers: { Authorization: `Bearer ${jwt}` } },
    auth: { persistSession: false, autoRefreshToken: false },
  });
}

function githubConfig(): GitHubDispatchConfig | null {
  const config = {
    token: env("GITHUB_TOKEN"), owner: env("GITHUB_OWNER"), repository: env("GITHUB_REPOSITORY"),
    workflowFile: env("GITHUB_WORKFLOW_FILE"), ref: env("GITHUB_WORKFLOW_REF"),
  };
  if (!config.token || !/^[A-Za-z0-9-]+$/.test(config.owner) || !/^[A-Za-z0-9._-]+$/.test(config.repository) ||
    config.workflowFile !== "refresh-public-snapshot.yml" || config.ref !== "master" ||
    !allowedOrigins.length || !env("SUPABASE_URL") || !env("SUPABASE_PUBLISHABLE_KEY")) return null;
  return config;
}

Deno.serve((request) => handleSnapshotRefresh(request, {
  allowedOrigins,
  async authenticate(jwt) {
    const { data, error } = await callerClient(jwt).auth.getUser(jwt);
    return !error && Boolean(data.user);
  },
  async isAdmin(jwt) {
    const { data, error } = await callerClient(jwt).rpc("is_fis_admin");
    if (error) throw new Error("Administrator check failed.");
    return data === true;
  },
  githubConfig,
  async dispatch(config) {
    const endpoint = `https://api.github.com/repos/${encodeURIComponent(config.owner)}/${encodeURIComponent(config.repository)}/actions/workflows/${encodeURIComponent(config.workflowFile)}/dispatches`;
    const response = await fetch(endpoint, {
      method: "POST",
      headers: { Accept: "application/vnd.github+json", Authorization: `Bearer ${config.token}`, "Content-Type": "application/json", "X-GitHub-Api-Version": "2022-11-28" },
      body: JSON.stringify({ ref: config.ref }),
    });
    return response.status === 204 || response.status === 200;
  },
}));
