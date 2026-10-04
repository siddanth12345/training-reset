import { useState } from "react";
import { useServerFn } from "@tanstack/react-start";
import { requestPasswordReset, signInAccount, signUpAccount } from "@/lib/account.functions";
import { playAsGuest, setSessionTokens } from "./account";

const input = "w-full rounded border-2 border-hud/40 bg-hud-track px-3 py-2 font-bold text-hud";
const btn = "rounded px-5 py-3 font-black uppercase";

export function checkPassword(p: string) {
  if (p.length < 3 || p.length > 20) return "Password must be 3-20 characters";
  if (!/[A-Z]/.test(p)) return "Password needs an uppercase letter";
  if (!/[a-z]/.test(p)) return "Password needs a lowercase letter";
  if (!/[0-9]/.test(p)) return "Password needs a number";
  return null;
}

/** Log in / create account / guest screen shown on the home menu. */
export function AccountPanel() {
  const [mode, setMode] = useState<"login" | "signup" | "forgot">("login");
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [email, setEmail] = useState("");
  const [err, setErr] = useState("");
  const [msg, setMsg] = useState("");
  const [busy, setBusy] = useState(false);
  const signUp = useServerFn(signUpAccount);
  const signIn = useServerFn(signInAccount);
  const forgot = useServerFn(requestPasswordReset);

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErr(""); setMsg("");
    const u = username.trim();
    if (!/^[A-Za-z0-9_]{3,20}$/.test(u)) return setErr("Username must be 3-20 letters, numbers or _");
    if (mode === "forgot") {
      setBusy(true);
      await forgot({ data: { username: u, origin: window.location.origin } }).catch(() => null);
      setBusy(false);
      return setMsg("If that account has an email, a reset link is on its way.");
    }
    if (mode === "signup") {
      const pe = checkPassword(password);
      if (pe) return setErr(pe);
      if (email && !/^\S+@\S+\.\S+$/.test(email)) return setErr("Invalid email");
    }
    setBusy(true);
    try {
      const res = mode === "signup"
        ? await signUp({ data: { username: u, password, email: email.trim() } })
        : await signIn({ data: { username: u, password } });
      if ("error" in res && res.error) setErr(res.error);
      else if ("tokens" in res && res.tokens) await setSessionTokens(res.tokens);
    } catch {
      setErr("Something went wrong. Try again.");
    }
    setBusy(false);
  };

  return (
    <form onSubmit={submit} className="flex flex-col gap-3">
      <h2 className="text-2xl font-black uppercase">{mode === "login" ? "Log in" : mode === "signup" ? "Create account" : "Reset password"}</h2>
      <input className={input} placeholder="Username" maxLength={20} value={username} onChange={(e) => setUsername(e.target.value)} autoComplete="username" />
      {mode !== "forgot" && (
        <input className={input} type="password" placeholder="Password" maxLength={20} value={password} onChange={(e) => setPassword(e.target.value)} autoComplete={mode === "signup" ? "new-password" : "current-password"} />
      )}
      {mode === "signup" && (
        <>
          <input className={input} type="email" placeholder="Email (optional, for password reset)" maxLength={255} value={email} onChange={(e) => setEmail(e.target.value)} />
          <p className="text-xs opacity-70">3-20 characters · password needs 1 uppercase, 1 lowercase and 1 number.</p>
        </>
      )}
      {err && <p className="text-sm font-bold text-destructive">{err}</p>}
      {msg && <p className="text-sm font-bold text-crosshair">{msg}</p>}
      <button disabled={busy} className={`${btn} bg-crosshair text-hud-ink disabled:opacity-50`}>
        {busy ? "…" : mode === "login" ? "Log in" : mode === "signup" ? "Create account" : "Send reset link"}
      </button>
      <div className="flex flex-wrap justify-between gap-2 text-xs font-bold uppercase underline-offset-4">
        {mode !== "login" && <button type="button" className="hover:underline" onClick={() => { setMode("login"); setErr(""); setMsg(""); }}>Have an account? Log in</button>}
        {mode !== "signup" && <button type="button" className="hover:underline" onClick={() => { setMode("signup"); setErr(""); setMsg(""); }}>Create account</button>}
        {mode === "login" && <button type="button" className="hover:underline" onClick={() => { setMode("forgot"); setErr(""); setMsg(""); }}>Forgot password?</button>}
      </div>
      <button type="button" className={`${btn} mt-2 border-2 border-hud/40`} onClick={playAsGuest}>Play as guest</button>
    </form>
  );
}
