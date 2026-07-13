/**
 * WebGL intelligence field — particles + orb + links (R3F / Three.js).
 */
import { Canvas, useFrame } from "@react-three/fiber";
import { Float, Line, Sphere, Stars } from "@react-three/drei";
import { useMemo, useRef } from "react";
import * as THREE from "three";

function Particles({ count = 140 }: { count?: number }) {
  const ref = useRef<THREE.Points>(null);
  const geometry = useMemo(() => {
    const positions = new Float32Array(count * 3);
    for (let i = 0; i < count; i++) {
      positions[i * 3] = (Math.random() - 0.5) * 8;
      positions[i * 3 + 1] = (Math.random() - 0.5) * 5;
      positions[i * 3 + 2] = (Math.random() - 0.5) * 6;
    }
    const g = new THREE.BufferGeometry();
    g.setAttribute("position", new THREE.BufferAttribute(positions, 3));
    return g;
  }, [count]);

  useFrame(({ clock }) => {
    if (!ref.current) return;
    ref.current.rotation.y = clock.getElapsedTime() * 0.03;
    ref.current.rotation.x = Math.sin(clock.getElapsedTime() * 0.12) * 0.05;
  });

  return (
    <points ref={ref} geometry={geometry}>
      <pointsMaterial
        size={0.028}
        color="#a5f3fc"
        transparent
        opacity={0.6}
        sizeAttenuation
        depthWrite={false}
      />
    </points>
  );
}

function NeuralCore({ scroll }: { scroll: number }) {
  const root = useRef<THREE.Group>(null);
  const core = useRef<THREE.Mesh>(null);
  const ring = useRef<THREE.Mesh>(null);

  const nodes = useMemo(() => {
    const pts: THREE.Vector3[] = [];
    for (let i = 0; i < 28; i++) {
      const a = (i / 28) * Math.PI * 2 + i * 0.12;
      const r = 1.2 + (i % 5) * 0.16;
      pts.push(
        new THREE.Vector3(
          Math.cos(a) * r,
          Math.sin(i * 0.85) * 0.72,
          Math.sin(a) * r * 0.58
        )
      );
    }
    return pts;
  }, []);

  const edges = useMemo(() => {
    const e: [THREE.Vector3, THREE.Vector3][] = [];
    for (let i = 0; i < nodes.length; i++) {
      for (let j = i + 1; j < nodes.length; j++) {
        if (nodes[i].distanceTo(nodes[j]) < 1.38) e.push([nodes[i], nodes[j]]);
      }
    }
    return e;
  }, [nodes]);

  useFrame(({ clock }) => {
    const t = clock.getElapsedTime();
    if (root.current) {
      root.current.rotation.y = t * 0.16 + scroll * 1.1;
      root.current.rotation.x = Math.sin(t * 0.22) * 0.12 + scroll * 0.28;
      root.current.position.y = Math.sin(t * 0.4) * 0.06;
    }
    if (core.current) {
      const s = 1 + Math.sin(t * 1.5) * 0.045;
      core.current.scale.setScalar(s);
    }
    if (ring.current) {
      ring.current.rotation.z = t * 0.35;
      ring.current.rotation.x = Math.PI / 2.4 + Math.sin(t * 0.3) * 0.08;
    }
  });

  return (
    <group ref={root}>
      {edges.map((seg, i) => (
        <Line
          key={i}
          points={seg}
          color={i % 2 ? "#c084fc" : "#22d3ee"}
          transparent
          opacity={0.35}
          lineWidth={1.1}
        />
      ))}
      {nodes.map((p, i) => (
        <Float key={i} speed={1 + (i % 4) * 0.15} floatIntensity={0.4} rotationIntensity={0.2}>
          <Sphere args={[0.042 + (i % 3) * 0.01, 24, 24]} position={p.toArray()}>
            <meshStandardMaterial
              color={i % 2 ? "#e9d5ff" : "#a5f3fc"}
              emissive={i % 2 ? "#a855f7" : "#22d3ee"}
              emissiveIntensity={0.85}
              roughness={0.22}
              metalness={0.35}
            />
          </Sphere>
        </Float>
      ))}

      <Float speed={1.15} floatIntensity={0.3}>
        <Sphere ref={core} args={[0.34, 64, 64]}>
          <meshStandardMaterial
            color="#f8fafc"
            emissive="#22d3ee"
            emissiveIntensity={0.65}
            roughness={0.15}
            metalness={0.45}
            transparent
            opacity={0.94}
          />
        </Sphere>
        <Sphere args={[0.5, 32, 32]}>
          <meshBasicMaterial color="#a855f7" transparent opacity={0.12} />
        </Sphere>
        <Sphere args={[0.68, 32, 32]}>
          <meshBasicMaterial color="#22d3ee" transparent opacity={0.08} />
        </Sphere>
        <mesh ref={ring}>
          <torusGeometry args={[0.72, 0.012, 16, 100]} />
          <meshBasicMaterial color="#67e8f9" transparent opacity={0.5} />
        </mesh>
      </Float>
    </group>
  );
}

export function NeuralScene({ scroll = 0 }: { scroll?: number }) {
  return (
    <div className="absolute inset-0">
      <Canvas
        dpr={[1, 1.75]}
        camera={{ position: [0, 0.2, 4.6], fov: 40 }}
        gl={{ antialias: true, alpha: true, powerPreference: "high-performance" }}
        style={{ background: "transparent" }}
      >
        <ambientLight intensity={0.55} />
        <pointLight position={[3.5, 2.5, 3]} intensity={1.5} color="#22d3ee" />
        <pointLight position={[-3, -1.5, 2]} intensity={1.1} color="#a855f7" />
        <spotLight position={[0, 4, 2]} intensity={0.5} color="#ffffff" angle={0.55} />
        <Stars radius={40} depth={28} count={900} factor={2.4} saturation={0} fade speed={0.45} />
        <Particles count={150} />
        <NeuralCore scroll={scroll} />
      </Canvas>
      <div className="pointer-events-none absolute inset-0 bg-gradient-to-r from-[#0b1220] via-[#0b1220aa] to-transparent" />
      <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-[#0b1220] via-transparent to-[#0b1220]/50" />
    </div>
  );
}
