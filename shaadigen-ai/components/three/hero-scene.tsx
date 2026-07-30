"use client";

import { useMemo, useRef } from "react";
import { Canvas, useFrame } from "@react-three/fiber";
import {
  ContactShadows,
  Environment,
  Float,
  Lightformer,
  RoundedBox,
  Sparkles,
} from "@react-three/drei";
import * as THREE from "three";

const GOLD = new THREE.Color("#d4af5e");
const ROSE_GOLD = new THREE.Color("#dba98c");
const IVORY = new THREE.Color("#fdf8ee");

function goldMaterial(color: THREE.Color = GOLD, roughness = 0.18) {
  return (
    <meshPhysicalMaterial
      color={color}
      metalness={1}
      roughness={roughness}
      clearcoat={0.6}
      clearcoatRoughness={0.25}
      envMapIntensity={1.6}
    />
  );
}

function EngagementRing() {
  const ring = useRef<THREE.Group>(null);
  useFrame(({ clock }) => {
    if (!ring.current) return;
    ring.current.rotation.y = clock.elapsedTime * 0.28;
    ring.current.rotation.x =
      Math.sin(clock.elapsedTime * 0.4) * 0.12 + 0.35;
  });

  return (
    <Float speed={1.4} rotationIntensity={0.25} floatIntensity={0.9}>
      <group ref={ring} position={[0, 0.35, 0]} scale={1.25}>
        <mesh castShadow>
          <torusGeometry args={[1, 0.13, 48, 128]} />
          {goldMaterial()}
        </mesh>
        {/* prongs */}
        <mesh position={[0, 1.12, 0]}>
          <coneGeometry args={[0.17, 0.22, 6]} />
          {goldMaterial(ROSE_GOLD, 0.22)}
        </mesh>
        {/* diamond */}
        <mesh position={[0, 1.38, 0]} rotation={[0, 0.4, 0]} castShadow>
          <octahedronGeometry args={[0.3, 0]} />
          <meshPhysicalMaterial
            color="#ffffff"
            metalness={0}
            roughness={0.02}
            transmission={0.95}
            thickness={1.2}
            ior={2.4}
            envMapIntensity={2.4}
            clearcoat={1}
          />
        </mesh>
      </group>
    </Float>
  );
}

function InvitationCard() {
  return (
    <Float speed={1.1} rotationIntensity={0.4} floatIntensity={1.1}>
      <group position={[-2.6, -0.4, -1.2]} rotation={[0.1, 0.55, -0.06]}>
        <RoundedBox args={[1.5, 2.05, 0.05]} radius={0.05} castShadow>
          <meshPhysicalMaterial
            color={IVORY}
            roughness={0.35}
            clearcoat={0.4}
          />
        </RoundedBox>
        <RoundedBox args={[1.24, 1.78, 0.055]} radius={0.04} position={[0, 0, 0.006]}>
          <meshPhysicalMaterial
            color="#f7ecd6"
            metalness={0.35}
            roughness={0.3}
          />
        </RoundedBox>
        <mesh position={[0, 0.45, 0.06]}>
          <torusGeometry args={[0.19, 0.035, 24, 64]} />
          {goldMaterial()}
        </mesh>
        <mesh position={[0, -0.18, 0.06]}>
          <boxGeometry args={[0.85, 0.035, 0.012]} />
          {goldMaterial(ROSE_GOLD)}
        </mesh>
        <mesh position={[0, -0.42, 0.06]}>
          <boxGeometry args={[0.6, 0.035, 0.012]} />
          {goldMaterial(ROSE_GOLD)}
        </mesh>
      </group>
    </Float>
  );
}

function MandapArch() {
  const arch = useRef<THREE.Group>(null);
  useFrame(({ clock }) => {
    if (arch.current)
      arch.current.rotation.y = Math.sin(clock.elapsedTime * 0.18) * 0.22;
  });
  return (
    <group ref={arch} position={[2.85, -0.75, -2.2]} scale={0.92}>
      <mesh position={[0, 1.15, 0]} rotation={[0, 0, Math.PI]}>
        <torusGeometry args={[0.95, 0.075, 24, 64, Math.PI]} />
        {goldMaterial(ROSE_GOLD, 0.3)}
      </mesh>
      {[-0.95, 0.95].map((x) => (
        <mesh key={x} position={[x, 0.2, 0]}>
          <cylinderGeometry args={[0.075, 0.095, 1.95, 20]} />
          {goldMaterial(GOLD, 0.3)}
        </mesh>
      ))}
      {/* marigold garlands */}
      {[-0.95, 0.95].map((x) => (
        <group key={`g${x}`}>
          {[0.75, 0.35, -0.05, -0.45].map((y, i) => (
            <mesh key={y} position={[x + (i % 2 ? 0.06 : -0.06), y, 0.1]}>
              <sphereGeometry args={[0.07, 12, 12]} />
              <meshStandardMaterial
                color={i % 2 ? "#f0a13c" : "#e8845a"}
                roughness={0.6}
              />
            </mesh>
          ))}
        </group>
      ))}
      {/* kalash on top */}
      <mesh position={[0, 2.2, 0]}>
        <sphereGeometry args={[0.16, 20, 20]} />
        {goldMaterial()}
      </mesh>
    </group>
  );
}

function Lanterns() {
  const positions: [number, number, number][] = [
    [-3.4, 1.7, -2.6],
    [3.5, 2.1, -3.1],
    [-1.6, 2.4, -3.4],
    [1.7, 2.7, -2.8],
  ];
  return (
    <>
      {positions.map((p, i) => (
        <Float key={i} speed={1 + i * 0.2} floatIntensity={1.6} rotationIntensity={0.2}>
          <group position={p} scale={0.42}>
            <mesh>
              <cylinderGeometry args={[0.28, 0.34, 0.62, 10]} />
              <meshPhysicalMaterial
                color="#f7d9a0"
                emissive="#e8a53c"
                emissiveIntensity={0.9}
                transparent
                opacity={0.92}
                roughness={0.4}
              />
            </mesh>
            <mesh position={[0, 0.42, 0]}>
              <coneGeometry args={[0.3, 0.24, 10]} />
              {goldMaterial(ROSE_GOLD, 0.35)}
            </mesh>
            <pointLight color="#ffca7a" intensity={1.4} distance={3.4} />
          </group>
        </Float>
      ))}
    </>
  );
}

function GiftBox() {
  return (
    <Float speed={1.25} rotationIntensity={0.5} floatIntensity={1}>
      <group position={[2.35, 1.35, -1.4]} rotation={[0.2, -0.5, 0.08]} scale={0.5}>
        <RoundedBox args={[1, 0.8, 1]} radius={0.06} castShadow>
          <meshPhysicalMaterial color="#f3e6ee" roughness={0.35} clearcoat={0.5} />
        </RoundedBox>
        <mesh>
          <boxGeometry args={[1.02, 0.82, 0.18]} />
          {goldMaterial(ROSE_GOLD, 0.25)}
        </mesh>
        <mesh>
          <boxGeometry args={[0.18, 0.82, 1.02]} />
          {goldMaterial(ROSE_GOLD, 0.25)}
        </mesh>
        <mesh position={[0, 0.5, 0]}>
          <torusKnotGeometry args={[0.16, 0.045, 64, 8, 2, 3]} />
          {goldMaterial()}
        </mesh>
      </group>
    </Float>
  );
}

function CameraRig() {
  useFrame(({ camera, pointer }) => {
    camera.position.x = THREE.MathUtils.lerp(
      camera.position.x,
      pointer.x * 0.55,
      0.045,
    );
    camera.position.y = THREE.MathUtils.lerp(
      camera.position.y,
      0.45 + pointer.y * 0.3,
      0.045,
    );
    camera.lookAt(0, 0.35, 0);
  });
  return null;
}

function MouseLight() {
  const light = useRef<THREE.PointLight>(null);
  useFrame(({ pointer }) => {
    if (!light.current) return;
    light.current.position.x = THREE.MathUtils.lerp(
      light.current.position.x,
      pointer.x * 4,
      0.08,
    );
    light.current.position.y = THREE.MathUtils.lerp(
      light.current.position.y,
      1.2 + pointer.y * 2.2,
      0.08,
    );
  });
  return (
    <pointLight
      ref={light}
      position={[0, 1.2, 2.6]}
      intensity={22}
      color="#ffe6bd"
      distance={9}
      decay={2}
    />
  );
}

export default function HeroScene() {
  const dpr = useMemo<[number, number]>(() => [1, 1.75], []);
  return (
    <Canvas
      dpr={dpr}
      camera={{ position: [0, 0.45, 5.6], fov: 42 }}
      gl={{ antialias: true, alpha: true, powerPreference: "high-performance" }}
      style={{ pointerEvents: "none" }}
      eventSource={
        typeof document !== "undefined" ? document.body : undefined
      }
      className="!pointer-events-none"
    >
      <fog attach="fog" args={["#fdf8ee", 8.5, 15]} />
      <ambientLight intensity={0.55} color="#fff6e6" />
      <directionalLight position={[4, 6, 4]} intensity={1.1} color="#ffedcf" />
      <MouseLight />

      <EngagementRing />
      <InvitationCard />
      <MandapArch />
      <Lanterns />
      <GiftBox />

      <Sparkles
        count={110}
        scale={[11, 6, 6]}
        size={2.6}
        speed={0.32}
        color="#e3bd6f"
        opacity={0.85}
      />
      <Sparkles
        count={45}
        scale={[8, 5, 4]}
        size={5}
        speed={0.18}
        color="#f3d9ae"
        opacity={0.5}
      />

      <ContactShadows
        position={[0, -1.7, 0]}
        opacity={0.32}
        scale={12}
        blur={2.8}
        far={4}
        color="#8a6a2f"
      />

      <Environment resolution={256}>
        <Lightformer
          intensity={2.4}
          position={[0, 4, -6]}
          scale={[10, 4, 1]}
          color="#fff2da"
        />
        <Lightformer
          intensity={1.4}
          position={[-6, 2, 2]}
          rotation={[0, Math.PI / 3, 0]}
          scale={[6, 3, 1]}
          color="#ffd9b8"
        />
        <Lightformer
          intensity={1.2}
          position={[6, 0, 3]}
          rotation={[0, -Math.PI / 3, 0]}
          scale={[6, 3, 1]}
          color="#f6e2b8"
        />
        <Lightformer
          intensity={0.8}
          position={[0, -3, 4]}
          scale={[8, 2, 1]}
          color="#fceedd"
        />
      </Environment>

      <CameraRig />
    </Canvas>
  );
}
