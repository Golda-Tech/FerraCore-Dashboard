"use client";
import { GalleryVerticalEnd } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import React from "react";


import { Canvas } from "@react-three/fiber";
import { useRef, useMemo } from "react";
import { useFrame } from "@react-three/fiber";
import { Text } from "@react-three/drei";
import * as THREE from "three";

function Tornado() {
  const count = 150;
  const particles = useMemo(() => {
    const words = [
      ...["0", "1"],
      ...["Ghana’s foundational fintech platform — powering secure, compliant, and scalable financial services."],
      ...["Powering secure, compliant, and scalable financial services."],
      ...["Ghana’s dedicated recurring payments gateway"],
      ...["Authorization", "Secure", "Ferracore","Encore", "VISA", "txnRef", "momo"],
      ...["fpg_live_4242", "https://ferracore.tech", "/v1_0/subscribe"],
    ];
    return Array.from({ length: count }, () => ({
      text: words[Math.floor(Math.random() * words.length)],
      color: Math.random() > 0.5 ? "#22c55e" : "#f59e0b",
      position: new THREE.Vector3(
        (Math.random() - 0.5) * 12,
        Math.random() * 25 - 12,
        (Math.random() - 0.5) * 12
      ),
      speed: 0.4 + Math.random() * 0.6,
    }));
  }, []);

  const group = useRef<THREE.Group>(null!);
  useFrame((state) => {
    const t = state.clock.getElapsedTime();
    group.current.rotation.y = t * 0.15;
    particles.forEach((p, i) => {
      const obj = group.current.children[i] as THREE.Mesh;
      obj.position.y -= p.speed * 0.04;
      if (obj.position.y < -15) obj.position.y = 15;
    });
  });

  return (
    <group ref={group}>
      {particles.map((p, i) => (
        <Text key={i} position={p.position} fontSize={0.7} color={p.color} anchorX="center">
          {p.text}
        </Text>
      ))}
    </group>
  );
}
import { Edges } from "@react-three/drei";

/* low-poly 3D shield with pulse + rotation */

export function LowPolyShield() {
  const shieldRef = useRef<THREE.Mesh>(null!);

  /* low-poly shield geometry (hexagon-like) */
  const geometry = useMemo(() => {
    const shape = new THREE.Shape();
    const outer = 2.5;
    const inner = 1.2;
    shape.moveTo(0, outer);
    shape.lineTo(inner, inner);
    shape.lineTo(outer, 0);
    shape.lineTo(inner, -inner);
    shape.lineTo(0, -outer);
    shape.lineTo(-inner, -inner);
    shape.lineTo(-outer, 0);
    shape.lineTo(-inner, inner);
    shape.closePath();

    const extrudeSettings = {
      depth: 0.4,
      bevelEnabled: true,
      bevelThickness: 0.05,
      bevelSize: 0.05,
      bevelSegments: 2,
    };
    return new THREE.ExtrudeGeometry(shape, extrudeSettings);
  }, []);

  /* gentle pulse + slow rotate */
  useFrame((state) => {
    const t = state.clock.getElapsedTime();
    const scale = 1 + Math.sin(t * 1.5) * 0.03; // pulse
    shieldRef.current.scale.set(scale, scale, scale);
    shieldRef.current.rotation.y = t * 0.1;
  });

  return (
    <group>
      {/* shield body */}
      <mesh ref={shieldRef} geometry={geometry}>
        <meshStandardMaterial
          color="#001f3f" // navy base
          roughness={0.6}
          metalness={0.4}
        />
      </mesh>

      {/* gold edge highlights */}
      <Edges geometry={geometry} threshold={15}>
        <lineBasicMaterial color="#FFD700" linewidth={2} />
      </Edges>

      {/* backdrop plane for contrast */}
      <mesh position={[0, 0, -1]}>
        <planeGeometry args={[10, 10]} />
        <meshBasicMaterial color="#000" transparent opacity={0.2} />
      </mesh>
    </group>
  );
}


import { Sphere, Line } from "@react-three/drei";

const COLORS = ["#FFD700", "#FFA500"]; // gold / amber

const CHARSET = "ABCServing fintechs, banks, agents, and merchants with trusted infrastructure.789+/".split("");

/* single rain column */
function RainColumn({ position }: { position: [number, number, number] }) {
  const count = 25; // drops per column
  const drops = useMemo(() => {
    return Array.from({ length: count }, (_, i) => ({
      y: i * 0.8, // vertical spacing
      speed: 0.02 + Math.random() * 0.03,
      scrambleFor: Math.random() * 60, // frames to scramble
      finalChar: CHARSET[Math.floor(Math.random() * CHARSET.length)],
    }));
  }, []);

  const groupRef = useRef<THREE.Group>(null!);
  useFrame(({ clock }) => {
    const t = clock.getElapsedTime() * 60; // frame counter
    groupRef.current.children.forEach((child, i) => {
      const drop = drops[i];
      // move down
      drop.y -= drop.speed;
      if (drop.y < -15) drop.y = 15; // loop to top

      // scramble → lock
      const char = t < drop.scrambleFor
        ? CHARSET[Math.floor(Math.random() * CHARSET.length)]
        : drop.finalChar;

      (child as any).text = char;
      child.position.y = drop.y;
    });
  });

  return (
    <group ref={groupRef} position={position}>
      {drops.map((_, i) => (
        <Text
          key={i}
          position={[0, drops[i].y, 0]}
          fontSize={0.6}
          color="#00ff41"
          anchorX="center"
        >
          {drops[i].finalChar}
        </Text>
      ))}
    </group>
  );
}

/* full screen matrix rain */
export function MatrixRain() {
  const cols = 20;
  const positions = useMemo(() => {
    return Array.from({ length: cols }, (_, i) => [
      (i / cols) * 20 - 10, // x spread
      0,
      0,
    ] as [number, number, number]);
  }, []);

  return (
    <group>
      {positions.map((p, i) => (
        <RainColumn key={i} position={p} />
      ))}
      {/* subtle background plane */}
      <mesh>
        <planeGeometry args={[50, 50]} />
        <meshBasicMaterial color="#000" transparent opacity={0.15} />
      </mesh>
    </group>
  );
}

import { Tube } from "@react-three/drei";


export default function AuthLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="grid min-h-svh lg:grid-cols-2">
      {/* LEFT – login/OTP form */}
      <div className="flex flex-col gap-4 p-6 md:p-10">
        <div className="flex justify-center gap-2 md:justify-start">
          <Link href="/" className="flex items-center gap-2 font-medium">
            <div className="bg-primary text-primary-foreground flex size-6 items-center justify-center rounded-md">
              <GalleryVerticalEnd className="size-4" />
            </div>
            Ferracore Payment Gateway
          </Link>
        </div>
        <div className="flex flex-1 items-center justify-center">
          <div className="w-full max-w-xs">{children}</div>
        </div>
      </div>

     {/* RIGHT – 3-D canvas with background image */}
     <div
       className="relative hidden lg:block"
       style={{
         backgroundImage: `url("data:image/svg+xml,%3Csvg width='100' height='100' xmlns='http://www.w3.org/2000/svg'%3E%3Cdefs%3E%3Cpattern id='grid' width='10' height='10' patternUnits='userSpaceOnUse'%3E%3Cpath d='M 10 0 L 0 0 0 10' fill='none' stroke='%2300FF41' stroke-width='0.5' opacity='0.15'/%3E%3C/pattern%3E%3C/defs%3E%3Crect width='100' height='100' fill='%23000'/%3E%3Crect width='100' height='100' fill='url(%23grid)'/%3E%3C/svg%3E")`,
         backgroundSize: "60px 60px",
       }}
     >
       <Canvas camera={{ position: [0, 0, 20], fov: 50 }} className="h-full w-full">
         <ambientLight intensity={0.6} />
         <pointLight position={[10, 10, 10]} intensity={1.5} />
         <Tornado />
         <RainColumn position={[-5, 0, 0]} />
         <RainColumn position={[0, 0, 0]} />
         <RainColumn position={[5, 0, 0]} />
         <MatrixRain />
       </Canvas>

       {/* subtle vignette */}
       <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-black/20 pointer-events-none" />
     </div>
    </div>
  );
}