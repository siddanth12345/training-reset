import * as THREE from "three";
import type { Skin } from "./skins";

function shade(hex: string, f: number) {
  return "#" + new THREE.Color(hex).multiplyScalar(f).getHexString();
}

function Eye({ x, skin }: { x: number; skin: Skin }) {
  const mat = <meshStandardMaterial color={skin.eyeColor} emissive={skin.eyeColor} emissiveIntensity={skin.eyes === "boss" ? 1.2 : 0.25} />;
  const z = 2.04;
  if (skin.eyes === "boss")
    return <mesh position={[x, 3.25, z]} rotation-z={x * -0.35}><boxGeometry args={[0.9, 0.22, 0.05]} />{mat}</mesh>;
  if (skin.eyes === "square")
    return (
      <group position={[x, 3.25, z]}>
        <mesh><boxGeometry args={[0.6, 0.6, 0.05]} />{mat}</mesh>
        <mesh position-z={0.04}><boxGeometry args={[0.24, 0.24, 0.03]} /><meshStandardMaterial color="#111" /></mesh>
      </group>
    );
  if (skin.eyes === "triangle")
    return (
      <group position={[x, 3.25, z]}>
        <mesh rotation-x={Math.PI / 2}><cylinderGeometry args={[0.42, 0.42, 0.05, 3]} />{mat}</mesh>
        <mesh position-z={0.04} rotation-x={Math.PI / 2}><cylinderGeometry args={[0.15, 0.15, 0.03, 3]} /><meshStandardMaterial color="#111" /></mesh>
      </group>
    );
  return (
    <group position={[x, 3.25, z]}>
      <mesh><sphereGeometry args={[0.36, 20, 14]} />{mat}</mesh>
      <mesh position-z={0.3}><sphereGeometry args={[0.14, 12, 10]} /><meshStandardMaterial color="#111" /></mesh>
    </group>
  );
}

function Legs({ skin }: { skin: Skin }) {
  const mat = <meshStandardMaterial color={shade(skin.tableColor, 0.65)} roughness={0.35} />;
  if (skin.legs === "one")
    return (
      <>
        <mesh position={[0, 1.6, 0]} castShadow><cylinderGeometry args={[0.35, 0.35, 3, 16]} />{mat}</mesh>
        <mesh position={[0, 0.1, 0]}><cylinderGeometry args={[1.6, 1.8, 0.2, 24]} />{mat}</mesh>
      </>
    );
  const spots = [-2.4, 2.4].flatMap((x) => [-1.5, 1.5].map((z) => [x, z] as const));
  return (
    <>
      {spots.map(([x, z]) => (
        <mesh key={`${x}${z}`} position={[x, 1.5, z]} castShadow>
          {skin.legs === "conic" ? <cylinderGeometry args={[0.3, 0.14, 3, 14]} />
            : skin.legs === "triangle" ? <cylinderGeometry args={[0.35, 0.35, 3, 3]} />
            : <cylinderGeometry args={[0.08, 0.08, 3, 8]} />}
          {mat}
        </mesh>
      ))}
    </>
  );
}

function Decor({ skin }: { skin: Skin }) {
  const c = skin.decorationColor;
  const y = 3.45;
  switch (skin.decoration) {
    case "plates":
      return (
        <>
          {[[-1.5, -0.8], [1.5, -0.8], [0, 0.9]].map(([x, z]) => (
            <mesh key={`${x}${z}`} position={[x, y + 0.03, z]}><cylinderGeometry args={[0.7, 0.55, 0.08, 24]} /><meshStandardMaterial color={c} roughness={0.2} /></mesh>
          ))}
        </>
      );
    case "rug":
      return (
        <mesh position={[0, y + 0.01, 0]}><boxGeometry args={[4.4, 0.03, 2.6]} /><meshStandardMaterial color={c} roughness={0.9} /></mesh>
      );
    case "office":
      return (
        <group position={[0, y, 0]}>
          <mesh position={[0, 0.04, 0.3]}><boxGeometry args={[2, 0.08, 1.3]} /><meshStandardMaterial color={c} metalness={0.5} roughness={0.3} /></mesh>
          <mesh position={[0, 0.7, -0.35]} rotation-x={-0.25}><boxGeometry args={[2, 1.3, 0.06]} /><meshStandardMaterial color={c} metalness={0.5} roughness={0.3} /></mesh>
          <mesh position={[0, 0.7, -0.31]} rotation-x={-0.25}><planeGeometry args={[1.8, 1.1]} /><meshStandardMaterial color="#9fd3ff" emissive="#4aa3ff" emissiveIntensity={0.8} /></mesh>
        </group>
      );
    case "birthday":
      return (
        <group position={[0, y, 0]}>
          <mesh position-y={0.35}><cylinderGeometry args={[1, 1, 0.7, 28]} /><meshStandardMaterial color={c} /></mesh>
          <mesh position-y={0.85}><cylinderGeometry args={[0.7, 0.7, 0.4, 28]} /><meshStandardMaterial color="#fff6ee" /></mesh>
          {[-0.3, 0, 0.3].map((x) => (
            <group key={x} position={[x, 1.25, 0]}>
              <mesh><cylinderGeometry args={[0.04, 0.04, 0.4, 8]} /><meshStandardMaterial color="#ff7ab8" /></mesh>
              <mesh position-y={0.26}><sphereGeometry args={[0.07, 8, 8]} /><meshStandardMaterial color="#ffcc33" emissive="#ff9900" emissiveIntensity={2} /></mesh>
            </group>
          ))}
        </group>
      );
    default:
      return null;
  }
}

/** A player table drawn from a skin. Used in the skins preview and for online players. */
export function SkinTable({ skin }: { skin: Skin }) {
  return (
    <group>
      <mesh position={[0, 3.2, 0]} castShadow receiveShadow>
        <boxGeometry args={[6, 0.5, 4]} />
        <meshStandardMaterial color={skin.tableColor} roughness={0.24} metalness={0.08} />
      </mesh>
      <Legs skin={skin} />
      <Eye x={-1} skin={skin} />
      <Eye x={1} skin={skin} />
      <Decor skin={skin} />
      <pointLight position={[0, 1.2, 0]} color={skin.lightColor} intensity={25} distance={12} />
      <mesh position={[0, 2.93, 0]} rotation-x={Math.PI / 2}>
        <planeGeometry args={[5.6, 3.6]} />
        <meshBasicMaterial color={skin.lightColor} transparent opacity={0.6} side={THREE.DoubleSide} />
      </mesh>
    </group>
  );
}
