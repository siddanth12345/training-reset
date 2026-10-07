import { Canvas, useFrame } from "@react-three/fiber";
import { Environment, Lightformer } from "@react-three/drei";
import { useRef, useState } from "react";
import * as THREE from "three";
import { ColorWheel } from "./ColorWheel";
import { SkinTable } from "./SkinTable";
import { DEFAULT_SKIN, setSkin, useSkin, type Skin } from "./skins";
import { saveSkinRemote, useAccount } from "./account";

function Spin({ children }: { children: React.ReactNode }) {
  const g = useRef<THREE.Group>(null);
  useFrame((_, dt) => { if (g.current) g.current.rotation.y += Math.min(dt, 0.05) * 0.6; });
  return <group ref={g}>{children}</group>;
}

function Preview({ skin }: { skin: Skin }) {
  return (
    <Canvas shadows camera={{ position: [0, 6, 12], fov: 45 }} onCreated={({ camera }) => camera.lookAt(0, 2, 0)}>
      <color attach="background" args={["#1a0f0a"]} />
      <ambientLight intensity={0.4} />
      <directionalLight position={[6, 10, 6]} intensity={2} castShadow />
      <Environment>
        <Lightformer intensity={2} position={[0, 5, 0]} scale={[10, 10, 1]} />
        <Lightformer intensity={1} color="#ffb070" position={[-5, 1, -1]} rotation-y={Math.PI / 2} scale={[20, 1, 1]} />
      </Environment>
      <Spin>
        <SkinTable skin={skin} />
        {/* Circular stage (placeholder, will be updated) */}
        <mesh position={[0, -0.25, 0]} receiveShadow>
          <cylinderGeometry args={[5, 5.3, 0.5, 48]} />
          <meshStandardMaterial color="#3a2a20" roughness={0.6} />
        </mesh>
        <mesh position={[0, 0.01, 0]} rotation-x={-Math.PI / 2}>
          <ringGeometry args={[4.6, 4.9, 64]} />
          <meshBasicMaterial color={skin.lightColor} />
        </mesh>
      </Spin>
    </Canvas>
  );
}

function Choice<T extends string>({ value, options, onChange }: { value: T; options: [T, string][]; onChange: (v: T) => void }) {
  return (
    <div className="flex flex-wrap gap-2">
      {options.map(([id, label]) => (
        <button key={id} onClick={() => onChange(id)} className={`rounded border-2 px-3 py-1.5 text-xs font-black uppercase ${value === id ? "border-crosshair bg-crosshair text-hud-ink" : "border-hud/40"}`}>{label}</button>
      ))}
    </div>
  );
}

function Group({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="border-b border-hud/15 py-3">
      <div className="mb-2 text-xs font-bold uppercase tracking-widest opacity-70">{title}</div>
      {children}
    </div>
  );
}

export function SkinsPanel() {
  const applied = useSkin();
  const account = useAccount();
  const [draft, setDraft] = useState<Skin>(() => structuredClone(applied));
  const [saved, setSaved] = useState(false);
  const dirty = JSON.stringify(draft) !== JSON.stringify(applied);
  const set = <K extends keyof Skin>(k: K, v: Skin[K]) => { setSaved(false); setDraft((d) => ({ ...d, [k]: v })); };

  return (
    <div>
      <h3 className="mb-2 border-b border-hud/30 pb-1 text-lg font-black uppercase tracking-widest text-crosshair">Skins</h3>
      <div className="grid gap-6 lg:grid-cols-[1fr_1fr]">
        <div className="h-96 overflow-hidden rounded-xl border-2 border-hud/30 lg:sticky lg:top-0"><Preview skin={draft} /></div>
        <div>
          <Group title="Table primary color"><ColorWheel value={draft.tableColor} onChange={(v) => set("tableColor", v)} /></Group>
          <Group title="Eye color"><ColorWheel value={draft.eyeColor} onChange={(v) => set("eyeColor", v)} /></Group>
          <Group title="Eye design">
            <Choice value={draft.eyes} onChange={(v) => set("eyes", v)} options={[["default", "Default"], ["boss", "Boss eyes"], ["square", "Square"], ["triangle", "Triangle"]]} />
          </Group>
          <Group title="Table decoration">
            <Choice value={draft.decoration} onChange={(v) => set("decoration", v)} options={[["none", "None"], ["plates", "Plates"], ["rug", "Table rug"], ["office", "Office table"], ["birthday", "Birthday table"]]} />
          </Group>
          {draft.decoration !== "none" && (
            <Group title="Decoration color"><ColorWheel value={draft.decorationColor} onChange={(v) => set("decorationColor", v)} /></Group>
          )}
          <Group title="Table light color"><ColorWheel value={draft.lightColor} onChange={(v) => set("lightColor", v)} /></Group>
          <Group title="Leg design">
            <Choice value={draft.legs} onChange={(v) => set("legs", v)} options={[["conic", "Default conic"], ["triangle", "Triangle"], ["minimal", "Minimalistic"], ["one", "One legged"]]} />
          </Group>
          <div className="mt-5 flex flex-wrap items-center gap-3">
            <button disabled={!dirty} onClick={() => { setSkin(draft); saveSkinRemote(); setSaved(true); }} className="rounded bg-crosshair px-8 py-3 text-lg font-black uppercase text-hud-ink disabled:opacity-40">Save skin</button>
            <button disabled={!dirty} onClick={() => setDraft(structuredClone(applied))} className="rounded border-2 border-hud/40 px-6 py-3 font-black uppercase disabled:opacity-40">Discard</button>
            <button onClick={() => { setSaved(false); setDraft(structuredClone(DEFAULT_SKIN)); }} className="rounded border-2 border-destructive px-6 py-3 font-black uppercase text-destructive">Reset skin</button>
          </div>
          <p className="mt-2 text-xs font-bold uppercase tracking-widest">
            {dirty ? <span className="text-destructive">Unsaved changes</span> : saved ? <span className="text-crosshair">{account.kind === "user" ? "Saved to your account" : "Saved for this visit (guests aren't saved)"}</span> : null}
          </p>
        </div>
      </div>
    </div>
  );
}
