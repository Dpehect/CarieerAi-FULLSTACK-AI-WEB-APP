/**
 * Abstract intelligence core — soft orb + sparse constellation.
 * scroll (0–1) gently biases orientation for parallax depth.
 */
import { Canvas, useFrame } from "@react-three/fiber";
import { Float, Line, Sphere } from "@react-three/drei";
import { useMemo, useRef } from "react";
import * as THREE from "three";

function Constellation({ scroll }: { scroll: number }) {
  const g = useRef<THREE.Group>(null);
  const core = useRef<THREE.Mesh>(null);

  const nodes = useMemo(() => {
    const out: THREE.Vector3[] = [];
    for (let i = 0; i < 22; i++) {
      const a = (i / 22) * Math.PI * 2 + i * 0.15;
      const r = 1.15 + (i % 4) * 0.2;
      out.push(
        new THREE.Vector3(Math.cos(a) * r, Math.sin(i * 0.9) * 0.7, Math.sin(a) * r * 0.55)
      );
    }
    return out;
  }, []);

  const edges = useMemo(() => {
    const e: [THREE.Vector3, THREE.Vector3][] = [];
    for (let i = 0; i < nodes.length; i++) {
      for (let j = i + 1; j < nodes.length; j++) {
        if (nodes[i].distanceTo(nodes[j]) < 1.4) e.push([nodes[i], nodes[j]]);
      }
    }
    return e;
  }, [nodes]);

  useFrame(({ clock }) => {
    const t = clock.getElapsedTime();
    if (g.current) {
      g.current.rotation.y = t * 0.14 + scroll * 0.9;
      g.current.rotation.x = Math.sin(t * 0.2) * 0.1 + scroll * 0.2;
    }
    if (core.current) {
      const s = 1 + Math.sin(t * 1.2) * 0.035;
      core.current.scale.setScalar(s);
    }
  });

  return (
    <group ref={g}>
      {edges.map((seg, i) => (
        <Line
          key={i}
          points={seg}
          color={i % 2 ? "#a855f7" : "#22d3ee"}
          transparent
          opacity={0.22}
          lineWidth={1}
        />
      ))}
      {nodes.map((p, i) => (
        <Float key={i} speed={0.9 + (i % 3) * 0.2} floatIntensity={0.3}>
          <Sphere args={[0.04 + (i % 3) * 0.008, 20, 20]} position={p.toArray()}>
            <meshStandardMaterial
              color={i % 2 ? "#c084fc" : "#67e8f9"}
              emissive={i % 2 ? "#a855f7" : "#22d3ee"}
              emissiveIntensity={0.55}
              roughness={0.3}
              metalness={0.25}
            />
          </Sphere>
        </Float>
      ))}
      <Float speed={1.1} floatIntensity={0.25}>
        <Sphere ref={core} args={[0.3, 64, 64]}>
          <meshStandardMaterial
            color="#f0f9ff"
            emissive="#22d3ee"
            emissiveIntensity={0.45}
            roughness={0.2}
            metalness={0.4}
            transparent
            opacity={0.9}
          />
        </Sphere>
        <Sphere args={[0.46, 32, 32]}>
          <meshBasicMaterial color="#a855f7" transparent opacity={0.07} />
        </Sphere>
      </Float>
    </group>
  );
}

export function NeuralScene({ scroll = 0 }: { scroll?: number }) {
  return (
    <div className="absolute inset-0">
      <Canvas
        dpr={[1, 1.6]}
        camera={{ position: [0, 0.15, 4.5], fov: 38 }}
        gl={{ antialias: true, alpha: true }}
        style={{ background: "transparent" }}
      >
        <ambientLight intensity={0.4} />
        <pointLight position={[3, 2, 3]} intensity={1} color="#22d3ee" />
        <pointLight position={[-2.5, -1, 2]} intensity={0.7} color="#a855f7" />
        <Constellation scroll={scroll} />
      </Canvas>
      <div className="pointer-events-none absolute inset-0 bg-gradient-to-r from-night-950 via-night-950/40 to-transparent" />
      <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-night-950 via-transparent to-night-950/50" />
    </div>
  );
}
