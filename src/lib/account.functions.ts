import { createServerFn } from "@tanstack/react-start";
import { createClient } from "@supabase/supabase-js";
import { z } from "zod";

const username = z.string().trim().regex(/^[A-Za-z0-9_]{3,20}$/, "Username must be 3-20 letters, numbers or _");
const password = z
  .string()
  .min(3, "Password must be 3-20 characters")
  .max(20, "Password must be 3-20 characters")
  .regex(/[A-Z]/, "Password needs an uppercase letter")
  .regex(/[a-z]/, "Password needs a lowercase letter")
  .regex(/[0-9]/, "Password needs a number");

/** Auth needs 6+ chars; game rules allow 3, so a fixed suffix is added to every stored password. */
export const PW_SUFFIX = "#TableWars";
const SYNTH = "@players.tablewars.app";
const synthEmail = (u: string) => `${u.toLowerCase()}${SYNTH}`;

function publicClient() {
  const key = process.env["SUPABASE_PUBLISHABLE_KEY"]!;
  return createClient(process.env["SUPABASE_URL"]!, key, {
    auth: { persistSession: false, autoRefreshToken: false },
    global: {
      fetch: (input, init) => {
        const h = new Headers(init?.headers);
        if (key.startsWith("sb_") && h.get("Authorization") === `Bearer ${key}`) h.delete("Authorization");
        h.set("apikey", key);
        return fetch(input, { ...init, headers: h });
      },
    },
  });
}

async function findUser(name: string) {
  const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
  const { data } = await supabaseAdmin.from("profiles").select("id, username").ilike("username", name).maybeSingle();
  if (!data || data.username.toLowerCase() !== name.toLowerCase()) return null;
  const { data: u } = await supabaseAdmin.auth.admin.getUserById(data.id);
  if (!u.user?.email) return null;
  return { id: data.id, username: data.username, email: u.user.email };
}

async function signInTokens(email: string, pw: string) {
  const { data, error } = await publicClient().auth.signInWithPassword({ email, password: pw + PW_SUFFIX });
  if (error || !data.session) return null;
  return { access_token: data.session.access_token, refresh_token: data.session.refresh_token };
}

export const signUpAccount = createServerFn({ method: "POST" })
  .inputValidator((d) =>
    z.object({ username, password, email: z.string().trim().email("Invalid email").max(255).optional().or(z.literal("")) }).parse(d),
  )
  .handler(async ({ data }) => {
    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
    if (await findUser(data.username)) return { error: "That username is taken" };
    const email = data.email ? data.email : synthEmail(data.username);
    const { data: created, error } = await supabaseAdmin.auth.admin.createUser({
      email, password: data.password + PW_SUFFIX, email_confirm: true, user_metadata: { username: data.username },
    });
    if (error || !created.user) {
      return { error: /already/i.test(error?.message ?? "") ? "That email is already used" : "Could not create account" };
    }
    const { error: pErr } = await supabaseAdmin.from("profiles").insert({ id: created.user.id, username: data.username });
    if (pErr) {
      await supabaseAdmin.auth.admin.deleteUser(created.user.id);
      return { error: "That username is taken" };
    }
    const tokens = await signInTokens(email, data.password);
    if (!tokens) return { error: "Account created, but sign in failed. Try logging in." };
    return { tokens };
  });

export const signInAccount = createServerFn({ method: "POST" })
  .inputValidator((d) => z.object({ username: z.string().trim().min(1).max(20), password: z.string().min(1).max(20) }).parse(d))
  .handler(async ({ data }) => {
    const u = await findUser(data.username);
    const tokens = u ? await signInTokens(u.email, data.password) : null;
    if (!tokens) return { error: "Wrong username or password" };
    return { tokens };
  });

export const requestPasswordReset = createServerFn({ method: "POST" })
  .inputValidator((d) => z.object({ username: z.string().trim().min(1).max(20), origin: z.string().url().max(200) }).parse(d))
  .handler(async ({ data }) => {
    const u = await findUser(data.username);
    if (u && !u.email.endsWith(SYNTH)) {
      await publicClient().auth.resetPasswordForEmail(u.email, { redirectTo: `${data.origin}/reset-password` });
    }
    // Same answer either way so usernames/emails aren't revealed.
    return { ok: true };
  });
