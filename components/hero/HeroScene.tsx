"use client";

import { useEffect, useMemo, useRef } from "react";
import { Canvas, useFrame } from "@react-three/fiber";
import * as THREE from "three";

function Knot({ reduced }: { reduced: boolean }) {
  const group = useRef<THREE.Group>(null);
  const inner = useRef<THREE.Group>(null);

  const geometry = useMemo(
    () => new THREE.TorusKnotGeometry(1.06, 0.33, 256, 28, 2, 3),
    [],
  );

  useEffect(() => () => geometry.dispose(), [geometry]);

  useFrame((state, delta) => {
    if (!group.current) return;
    const step = Math.min(delta, 0.05);

    if (!reduced) {
      group.current.rotation.y += step * 0.16;
      group.current.rotation.x += step * 0.055;
    }

    const targetX = state.pointer.y * 0.36;
    const targetY = state.pointer.x * 0.55;
    group.current.rotation.x += (targetX - group.current.rotation.x) * 0.035;
    group.current.rotation.z += (targetY * 0.35 - group.current.rotation.z) * 0.02;

    if (!reduced) {
      group.current.position.y = Math.sin(state.clock.elapsedTime * 0.55) * 0.055;
    }

    if (inner.current && !reduced) {
      inner.current.rotation.y -= step * 0.22;
      inner.current.rotation.x += step * 0.12;
    }
  });

  return (
    <group ref={group} scale={0.98}>
      <mesh geometry={geometry}>
        <meshBasicMaterial
          color="#00f0ff"
          wireframe
          transparent
          opacity={0.24}
          blending={THREE.AdditiveBlending}
          depthWrite={false}
        />
      </mesh>

      <mesh geometry={geometry} scale={1.012}>
        <meshBasicMaterial
          color="#8b5cf6"
          wireframe
          transparent
          opacity={0.1}
          blending={THREE.AdditiveBlending}
          depthWrite={false}
        />
      </mesh>

      <points geometry={geometry}>
        <pointsMaterial
          color="#10b981"
          size={0.019}
          transparent
          opacity={0.8}
          depthWrite={false}
          blending={THREE.AdditiveBlending}
          sizeAttenuation
        />
      </points>

      <group ref={inner}>
        <mesh>
          <icosahedronGeometry args={[0.52, 1]} />
          <meshBasicMaterial
            color="#8b5cf6"
            wireframe
            transparent
            opacity={0.18}
            blending={THREE.AdditiveBlending}
            depthWrite={false}
          />
        </mesh>
        <mesh>
          <sphereGeometry args={[0.075, 12, 12]} />
          <meshBasicMaterial color="#00f0ff" transparent opacity={0.9} />
        </mesh>
      </group>
    </group>
  );
}

export function HeroScene({ reduced }: { reduced: boolean }) {
  return (
    <div className="h-full w-full" aria-hidden="true">
      <Canvas
        dpr={[1, 1.6]}
        camera={{ position: [0, 0, 3.5], fov: 46 }}
        gl={{ antialias: true, alpha: true, powerPreference: "high-performance" }}
        style={{ background: "transparent" }}
      >
        <Knot reduced={reduced} />
      </Canvas>
    </div>
  );
}
