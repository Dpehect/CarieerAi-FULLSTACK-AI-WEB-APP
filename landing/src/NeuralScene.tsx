/**
 * Subtle spatial field — soft nodes & restrained links.
 * Apple / Linear energy: quiet depth, not rave lighting.
 */
import { Canvas, useFrame } from "@react-three/fiber";
import { Float, Line, Sphere } from "@react-three/drei";
import { useMemo, useRef } from "react";
import * as THREE from "three";

function Field() {
  const group = useRef<THREE.Group>(null);

  const nodes = useMemo(() => {
    const pts: THREE.Vector3[] = [];
    const n = 18;
    for (let i = 0; i < n; i++) {
      const a = (i / n) * Math.PI * 2;
      const r = 1.1 + (i % 4) * 0.22;
      pts.push(
        new THREE.Vector3(
          Math.cos(a) * r * 0.95,
          Math.sin(i * 0.7) * 0.55,
          Math.sin(a) * r * 0.5
        )
      );
    }
    return pts;
  }, []);

  const links = useMemo(() => {
    const segs: [THREE.Vector3, THREE.Vector3][] = [];
    for (let i = 0; i < nodes.length; i++) {
      for (let j = i + 1; j < nodes.length; j++) {
        if (nodes[i].distanceTo(nodes[j]) < 1.35) {
          segs.push([nodes[i], nodes[j]]);
        }
      }
    }
    return segs;
  }, [nodes]);

  useFrame((state) => {
    if (!group.current) return;
    const t = state.clock.getElapsedTime();
    group.current.rotation.y = t * 0.06;
    group.current.rotation.x = Math.sin(t * 0.12) * 0.05;
  });

  return (
    <group ref={group} position={[0.15, 0.05, 0]}>
      {links.map((seg, i) => (
        <Line
          key={i}
          points={seg}
          color="#6b8cff"
          lineWidth={0.8}
          transparent
          opacity={0.14}
        />
      ))}
      {nodes.map((p, i) => (
        <Float key={i} speed={0.8 + (i % 3) * 0.15} floatIntensity={0.25} rotationIntensity={0.1}>
          <Sphere args={[0.035 + (i % 3) * 0.008, 24, 24]} position={p.toArray()}>
            <meshStandardMaterial
              color={i % 4 === 0 ? "#c5d0ff" : "#8aa4ff"}
              emissive="#4f6fe0"
              emissiveIntensity={0.25}
              roughness={0.35}
              metalness={0.15}
            />
          </Sphere>
        </Float>
      ))}
      <Float speed={1} floatIntensity={0.2}>
        <Sphere args={[0.22, 48, 48]}>
          <meshStandardMaterial
            color="#a8b8ff"
            emissive="#3d5ccc"
            emissiveIntensity={0.35}
            roughness={0.28}
            metalness={0.2}
            transparent
            opacity={0.88}
          />
        </Sphere>
        <Sphere args={[0.38, 32, 32]}>
          <meshBasicMaterial color="#6b8cff" transparent opacity={0.04} />
        </Sphere>
      </Float>
    </group>
  );
}

export function NeuralScene() {
  return (
    <div className="absolute inset-0">
      <Canvas
        dpr={[1, 1.5]}
        camera={{ position: [0, 0.15, 4.6], fov: 38 }}
        gl={{ antialias: true, alpha: true, powerPreference: "high-performance" }}
        style={{ background: "transparent" }}
      >
        <ambientLight intensity={0.45} />
        <directionalLight position={[3, 4, 2]} intensity={0.65} color="#dfe6ff" />
        <pointLight position={[-2, -1, 2]} intensity={0.25} color="#6b8cff" />
        <Field />
      </Canvas>
      {/* Readability veils */}
      <div className="pointer-events-none absolute inset-0 bg-gradient-to-r from-surface-0 via-surface-0/55 to-transparent" />
      <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-surface-0 via-transparent to-surface-0/50" />
    </div>
  );
}
