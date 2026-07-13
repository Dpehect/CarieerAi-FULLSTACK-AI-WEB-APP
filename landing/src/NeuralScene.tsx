/**
 * 3D neural field — hafif, performant R3F sahnesi.
 * Career path + neural connection metaphor.
 */
import { Canvas, useFrame } from "@react-three/fiber";
import { Float, Line, Sphere } from "@react-three/drei";
import { useMemo, useRef } from "react";
import * as THREE from "three";

type Node = { pos: THREE.Vector3; color: string };

function useNodes(count = 28): Node[] {
  return useMemo(() => {
    const arr: Node[] = [];
    const colors = ["#22d3ee", "#3b82f6", "#a78bfa", "#f472b6", "#67e8f9"];
    for (let i = 0; i < count; i++) {
      const t = (i / count) * Math.PI * 2;
      const r = 1.4 + (i % 5) * 0.28;
      const y = Math.sin(i * 0.9) * 0.9 + (i % 3) * 0.15;
      arr.push({
        pos: new THREE.Vector3(Math.cos(t) * r * 0.85, y, Math.sin(t) * r * 0.55),
        color: colors[i % colors.length],
      });
    }
    return arr;
  }, [count]);
}

function NeuralGraph() {
  const group = useRef<THREE.Group>(null);
  const nodes = useNodes(30);

  const lines = useMemo(() => {
    const segs: [THREE.Vector3, THREE.Vector3][] = [];
    for (let i = 0; i < nodes.length; i++) {
      for (let j = i + 1; j < nodes.length; j++) {
        if (nodes[i].pos.distanceTo(nodes[j].pos) < 1.55) {
          segs.push([nodes[i].pos, nodes[j].pos]);
        }
      }
    }
    return segs;
  }, [nodes]);

  useFrame((state) => {
    if (!group.current) return;
    const t = state.clock.getElapsedTime();
    group.current.rotation.y = t * 0.12;
    group.current.rotation.x = Math.sin(t * 0.2) * 0.08;
  });

  return (
    <group ref={group}>
      {lines.map((seg, i) => (
        <Line
          key={`l-${i}`}
          points={seg}
          color="#38bdf8"
          lineWidth={1}
          transparent
          opacity={0.22}
        />
      ))}
      {nodes.map((n, i) => (
        <Float key={`n-${i}`} speed={1.2 + (i % 4) * 0.2} floatIntensity={0.4} rotationIntensity={0.2}>
          <Sphere args={[0.05 + (i % 3) * 0.012, 16, 16]} position={n.pos.toArray()}>
            <meshStandardMaterial
              color={n.color}
              emissive={n.color}
              emissiveIntensity={0.85}
              roughness={0.25}
              metalness={0.4}
            />
          </Sphere>
        </Float>
      ))}
      {/* Merkez orb — kariyer hedefi */}
      <Float speed={1.5} floatIntensity={0.6}>
        <Sphere args={[0.28, 48, 48]}>
          <meshStandardMaterial
            color="#67e8f9"
            emissive="#0ea5e9"
            emissiveIntensity={0.9}
            roughness={0.15}
            metalness={0.55}
            transparent
            opacity={0.92}
          />
        </Sphere>
        <Sphere args={[0.42, 32, 32]}>
          <meshBasicMaterial color="#22d3ee" transparent opacity={0.08} />
        </Sphere>
      </Float>
    </group>
  );
}

export function NeuralScene() {
  return (
    <div className="absolute inset-0 -z-0">
      <Canvas
        dpr={[1, 1.75]}
        camera={{ position: [0, 0.4, 5.2], fov: 42 }}
        gl={{ antialias: true, alpha: true }}
        style={{ background: "transparent" }}
      >
        <ambientLight intensity={0.35} />
        <pointLight position={[4, 3, 4]} intensity={1.2} color="#22d3ee" />
        <pointLight position={[-4, -2, 2]} intensity={0.7} color="#a78bfa" />
        <NeuralGraph />
      </Canvas>
      {/* Gradient veil — metin okunabilirliği */}
      <div className="pointer-events-none absolute inset-0 bg-gradient-to-r from-ink-950 via-ink-950/70 to-transparent" />
      <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-ink-950 via-transparent to-ink-950/40" />
    </div>
  );
}
