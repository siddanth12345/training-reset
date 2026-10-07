import { useSyncExternalStore } from "react";
import { supabase } from "@/integrations/supabase/client";
import { applySettings, DEFAULT_SETTINGS, SETTINGS, type Settings } from "./settings";
import { DEFAULT_SKIN, SKIN, loadSkin, setSkin } from "./skins";
import { TRAIN, TRAIN_DEFAULTS, type TrainCfg } from "./state";

export type Account =
  | { kind: "none" }
  | { kind: "guest" }
  | { kind: "user"; id: string; username: string };

let ACCOUNT: Account = { kind: "none" };
const subs = new Set<() => void>();
const emit = () => subs.forEach((f) => f());
let started = false;
let applyingRemote = false;

export function displayName() {
  return ACCOUNT.kind === "user" ? ACCOUNT.username : "Guest";
}
export function getAccount() {
  return ACCOUNT;
}
export function playAsGuest() {
  ACCOUNT = { kind: "guest" };
  emit();
}

async function loadProfile(id: string) {
  const { data } = await supabase.from("profiles").select("username, settings, training, skin").eq("id", id).maybeSingle();
  if (!data) return;
  ACCOUNT = { kind: "user", id, username: data.username };
  if (data.settings) {
    const s = data.settings as Partial<Settings>;
    applyingRemote = true;
    applySettings({ ...DEFAULT_SETTINGS, ...s, keys: { ...DEFAULT_SETTINGS.keys, ...(s.keys ?? {}) } });
    applyingRemote = false;
  }
  if (data.skin) loadSkin(data.skin);
  if (data.training) Object.assign(TRAIN, TRAIN_DEFAULTS, data.training as Partial<TrainCfg>);
  emit();
}

/** Start watching the login session once (client only). */
export function initAccount() {
  if (started) return;
  started = true;
  supabase.auth.getUser().then(({ data }) => {
    if (data.user) void loadProfile(data.user.id);
  });
  supabase.auth.onAuthStateChange((event, session) => {
    if (event === "SIGNED_IN" && session?.user && (ACCOUNT.kind !== "user" || ACCOUNT.id !== session.user.id)) void loadProfile(session.user.id);
    if (event === "SIGNED_OUT") { ACCOUNT = { kind: "none" }; emit(); }
  });
}

export async function setSessionTokens(t: { access_token: string; refresh_token: string }) {
  const { data } = await supabase.auth.setSession(t);
  if (data.user) await loadProfile(data.user.id);
}

export async function signOut() {
  await supabase.auth.signOut();
  ACCOUNT = { kind: "none" };
  Object.assign(TRAIN, TRAIN_DEFAULTS);
  setSkin(DEFAULT_SKIN);
  emit();
}

export function saveSettingsRemote() {
  if (applyingRemote || ACCOUNT.kind !== "user") return;
  void supabase.from("profiles").update({ settings: JSON.parse(JSON.stringify(SETTINGS)) }).eq("id", ACCOUNT.id);
}
export function saveTrainingRemote() {
  if (ACCOUNT.kind !== "user") return;
  void supabase.from("profiles").update({ training: { ...TRAIN } }).eq("id", ACCOUNT.id);
}

export function saveSkinRemote() {
  if (ACCOUNT.kind !== "user") return;
  void supabase.from("profiles").update({ skin: { ...SKIN } }).eq("id", ACCOUNT.id);
}

function subscribe(f: () => void) {
  subs.add(f);
  return () => subs.delete(f);
}
const NONE: Account = { kind: "none" };
export function useAccount() {
  return useSyncExternalStore(subscribe, () => ACCOUNT, () => NONE);
}
