import { useSyncExternalStore } from "react";

export type EyeDesign = "default" | "boss" | "square" | "triangle";
export type Decoration = "none" | "plates" | "rug" | "office" | "birthday";
export type LegDesign = "conic" | "triangle" | "minimal" | "one";

export type Skin = {
  tableColor: string;
  eyeColor: string;
  eyes: EyeDesign;
  decoration: Decoration;
  decorationColor: string;
  lightColor: string;
  legs: LegDesign;
};

export const DEFAULT_SKIN: Skin = {
  tableColor: "#4da861",
  eyeColor: "#ffffff",
  eyes: "default",
  decoration: "none",
  decorationColor: "#ffffff",
  lightColor: "#7dff9a",
  legs: "conic",
};

/** Current skin. Guests keep it only for this visit; accounts save it to their profile. */
export let SKIN: Skin = structuredClone(DEFAULT_SKIN);
const subs = new Set<() => void>();

export function setSkin(next: Skin) {
  SKIN = structuredClone(next);
  subs.forEach((f) => f());
}
export function loadSkin(raw: unknown) {
  setSkin({ ...DEFAULT_SKIN, ...((raw as Partial<Skin>) ?? {}) });
}

function subscribe(f: () => void) {
  subs.add(f);
  return () => subs.delete(f);
}
export function useSkin() {
  return useSyncExternalStore(subscribe, () => SKIN, () => DEFAULT_SKIN);
}
