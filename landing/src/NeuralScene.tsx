/**
 * Hero 3D — glowing AI orb + neural lattice.
 * Scroll-driven rotation via parent-set CSS is optional; self-animates gently.
 */
import { Canvas, useFrame } from "@react-three/fiber";
import { Float, Line, Sphere } from "@react-three/drei";
import { useMemo, useRef } from "react";
import * as THREE from "three";

type Props = {
  /** 0–1 scroll influence for extra tilt */
  scroll?: number;
};

function OrbSystem({ scroll = 0 }: Props) {
  const root = useRef<THREE.Group>(null);
  const core = useRef<THREE.Mesh>(null);

  const nodes = useMemo(() => {
    const arr: THREE.Vector3[] = [];
    for (let i = 0; i < 26; i++) {
      const t = (i / 26) * Math.PI * 2;
      const r = 1.25 + (i % 5) * 0.18;
      arr.push(
        new THREE.Vector3(
          Math.cos(t) * r,
          Math.sin(i * 0.85) * 0.75,
          Math.sin(t) * r * 0.65
        )
      );
    }
    return arr;
  }, []);

  const links = useMemo(() => {
    const segs: [THREE.Vector3, THREE.Vector3][] = [];
    for (let i = 0; i < nodes.length; i++) {
      for (let j = i + 1; j < nodes.length; j++) {
        if (nodes[i].distanceTo(nodes[j]) < 1.45) segs.push([nodes[i], nodes[j]]);
      }
    }
    return segs;
  }, [nodes]);

  useFrame((state) => {
    const t = state.clock.getElapsedTime();
    if (root.current) {
      root.current.rotation.y = t * 0.18 + scroll * 0.8;
      root.current.rotation.x = Math.sin(t * 0.25) * 0.12 + scroll * 0.25;
    }
    if (core.current) {
      const s = 1 + Math.sin(t * 1.4) * 0.04;
      core.current.scale.setScalar(s);
    }
  });

  return (
    <group ref={root}>
      {links.map((seg, i) => (
        <Line
          key={i}
          points={seg}
          color={i % 2 ? "#a855f7" : "#22d3ee"}
          lineWidth={1}
          transparent
          opacity={0.28}
        />
      ))}
      {nodes.map((p, i) => (
        <Float key={i} speed={1 + (i % 4) * 0.15} floatIntensity={0.35} rotationIntensity={0.15}>
          <Sphere args={[0.045 + (i % 3) * 0.01, 20, 20]} position={p.toArray()}>
            <meshStandardMaterial
              color={i % 2 ? "#c084fc" : "#67e8f9"}
              emissive={i % 2 ? "#a855f7" : "#22d3ee"}
              emissiveIntensity={0.7}
              roughness={0.25}
              metalness={0.35}
            />
          </Sphere>
        </Float>
      ))}
      <Float speed={1.2} floatIntensity={0.35}>
        <Sphere ref={core} args={[0.32, 64, 64]}>
          <meshStandardMaterial
            color="#e0f2fe"
            emissive="#22d3ee"
            emissiveIntensity={0.55}
            roughness={0.18}
            metalness={0.45}
            transparent
            opacity={0.92}
          />
        </Sphere>
        <Sphere args={[0.48, 32, 32]}>
          <meshBasicMaterial color="#a855f7" transparent opacity={0.08} />
        </Sphere>
        <Sphere args={[0.62, 32, 32]}>
          <meshBasicMaterial color="#22d3ee" transparent opacity={0.05} />
        </Sphere>
      </Float>
    </group>
  );
}

export function NeuralScene({ scroll = 0 }: Props) {
  return (
    <div className="absolute inset-0">
      <Canvas
        dpr={[1, 1.75]}
        camera={{ position: [0, 0.2, 4.8], fov: 40 }}
        gl={{ antialias: true, alpha: true }}
        style={{ background: "transparent" }}
      >
        <ambientLight intensity={0.35} />
        <pointLight position={[3, 2, 4]} intensity={1.1} color="#22d3ee" />
        <pointLight position={[-3, -1, 2]} intensity={0.8} color="#a855f7" />
        <OrbSystem scroll={scroll} />
      </Canvas>
      <div className="pointer-events-none absolute inset-0 bg-gradient-to-r from-void-950 via-void-950/50 to-transparent" />
      <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-void-950 via-transparent to-void-950/40" />
    </div>
  );
}
