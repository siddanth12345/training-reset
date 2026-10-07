import { createFileRoute, Link } from "@tanstack/react-router";
import { useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { checkPassword } from "../game/AccountPanel";

export const Route = createFileRoute("/reset-password")({
  ssr: false,
  head: () => ({
    meta: [
      { title: "Reset Password — TBLE" },
      { name: "description", content: "Choose a new password for your TBLE account." },
      { property: "og:title", content: "Reset Password — TBLE" },
      { property: "og:description", content: "Choose a new password for your TBLE account." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
    ],
  }),
  component: ResetPassword,
});

function ResetPassword() {
  const [pw, setPw] = useState("");
  const [err, setErr] = useState("");
  const [done, setDone] = useState(false);
  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    const pe = checkPassword(pw);
    if (pe) return setErr(pe);
    const { error } = await supabase.auth.updateUser({ password: pw + "#TableWars" });
    if (error) setErr("This reset link is invalid or expired.");
    else setDone(true);
  };
  return (
    <div className="flex min-h-screen items-center justify-center bg-hud-panel p-6 font-mono text-hud">
      <form onSubmit={submit} className="flex w-full max-w-sm flex-col gap-3 rounded-lg border-2 border-hud/30 p-8">
        <h1 className="text-3xl font-black uppercase">New password</h1>
        {done ? (
          <>
            <p>Password updated.</p>
            <Link to="/" className="rounded bg-crosshair px-5 py-3 text-center font-black uppercase text-hud-ink">Back to game</Link>
          </>
        ) : (
          <>
            <input type="password" maxLength={20} value={pw} onChange={(e) => setPw(e.target.value)} placeholder="New password" className="rounded border-2 border-hud/40 bg-hud-track px-3 py-2 font-bold" />
            {err && <p className="text-sm font-bold text-destructive">{err}</p>}
            <button className="rounded bg-crosshair px-5 py-3 font-black uppercase text-hud-ink">Save</button>
          </>
        )}
      </form>
    </div>
  );
}
