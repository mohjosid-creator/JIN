/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useEffect, useRef } from 'react';
import * as THREE from 'three';
import { AvatarState } from '../types/jin';

interface AvatarThreeCanvasProps {
  avatarState: AvatarState;
  audioLevel?: number; // 0.0 to 1.0 reactive audio pulse
  onStateChangeRequested?: (newState: AvatarState) => void;
  interactive?: boolean;
  spatialMode?: boolean;
  onToggleSpatialMode?: () => void;
  viewModeLabel?: string;
}

export const AvatarThreeCanvas: React.FC<AvatarThreeCanvasProps> = ({
  avatarState,
  audioLevel = 0,
  onStateChangeRequested,
  interactive = true,
  spatialMode = false,
  onToggleSpatialMode,
  viewModeLabel,
}) => {
  const mountRef = useRef<HTMLDivElement>(null);
  const stateRef = useRef<AvatarState>(avatarState);
  stateRef.current = avatarState;
  const audioLevelRef = useRef<number>(audioLevel);
  audioLevelRef.current = audioLevel;
  const spatialModeRef = useRef<boolean>(spatialMode);
  spatialModeRef.current = spatialMode;

  useEffect(() => {
    const container = mountRef.current;
    if (!container) return;

    // Scene, Camera, Renderer
    const scene = new THREE.Scene();
    scene.fog = new THREE.FogExp2(0x0a0f1d, 0.04);

    const camera = new THREE.PerspectiveCamera(
      45,
      container.clientWidth / container.clientHeight,
      0.1,
      100
    );
    camera.position.set(0, 0, 7.5);

    const renderer = new THREE.WebGLRenderer({
      antialias: true,
      alpha: true,
      powerPreference: 'high-performance',
    });
    renderer.setSize(container.clientWidth, container.clientHeight);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.toneMapping = THREE.ACESFilmicToneMapping;
    renderer.toneMappingExposure = 1.2;

    container.innerHTML = '';
    container.appendChild(renderer.domElement);

    // Root Group
    const avatarGroup = new THREE.Group();
    scene.add(avatarGroup);

    // 1. Inner Core Nucleus (Glowing sphere with wireframe)
    const nucleusGeo = new THREE.SphereGeometry(0.7, 32, 32);
    const nucleusMat = new THREE.MeshStandardMaterial({
      color: 0x06b6d4,
      emissive: 0x0891b2,
      emissiveIntensity: 0.6,
      roughness: 0.2,
      metalness: 0.8,
      wireframe: false,
    });
    const nucleusMesh = new THREE.Mesh(nucleusGeo, nucleusMat);
    avatarGroup.add(nucleusMesh);

    // 2. Middle Wireframe Polyhedron (Icosahedron)
    const icoGeo = new THREE.IcosahedronGeometry(1.25, 1);
    const icoMat = new THREE.MeshBasicMaterial({
      color: 0x38bdf8,
      wireframe: true,
      transparent: true,
      opacity: 0.7,
    });
    const icoMesh = new THREE.Mesh(icoGeo, icoMat);
    avatarGroup.add(icoMesh);

    // 3. Outer Sacred Geometric Cage (Dodecahedron)
    const dodecaGeo = new THREE.DodecahedronGeometry(1.75, 0);
    const dodecaMat = new THREE.MeshBasicMaterial({
      color: 0x818cf8,
      wireframe: true,
      transparent: true,
      opacity: 0.45,
    });
    const dodecaMesh = new THREE.Mesh(dodecaGeo, dodecaMat);
    avatarGroup.add(dodecaMesh);

    // 4. Orbital Holographic Sound Rings
    const ringGeo = new THREE.TorusGeometry(2.1, 0.02, 16, 100);
    const ringMat1 = new THREE.MeshBasicMaterial({
      color: 0x22d3ee,
      transparent: true,
      opacity: 0.6,
    });
    const ring1 = new THREE.Mesh(ringGeo, ringMat1);
    ring1.rotation.x = Math.PI / 2.5;
    avatarGroup.add(ring1);

    const ringMat2 = new THREE.MeshBasicMaterial({
      color: 0xa855f7,
      transparent: true,
      opacity: 0.4,
    });
    const ring2 = new THREE.Mesh(ringGeo, ringMat2);
    ring2.rotation.y = Math.PI / 3;
    avatarGroup.add(ring2);

    // Spatial Ground Grid & Concentric Rings (For Immersive Spatial Hologram Mode)
    const spatialGroup = new THREE.Group();
    scene.add(spatialGroup);

    const gridHelper = new THREE.GridHelper(16, 24, 0x06b6d4, 0x1e293b);
    gridHelper.position.y = -2.3;
    (gridHelper.material as THREE.Material).transparent = true;
    (gridHelper.material as THREE.Material).opacity = 0.4;
    spatialGroup.add(gridHelper);

    const groundRingGeo = new THREE.RingGeometry(1.6, 1.65, 64);
    const groundRingMat = new THREE.MeshBasicMaterial({
      color: 0x22d3ee,
      transparent: true,
      opacity: 0.5,
      side: THREE.DoubleSide,
    });
    const groundRing = new THREE.Mesh(groundRingGeo, groundRingMat);
    groundRing.rotation.x = Math.PI / 2;
    groundRing.position.y = -2.28;
    spatialGroup.add(groundRing);

    const groundOuterRingGeo = new THREE.RingGeometry(2.8, 2.84, 64);
    const groundOuterRingMat = new THREE.MeshBasicMaterial({
      color: 0x818cf8,
      transparent: true,
      opacity: 0.3,
      side: THREE.DoubleSide,
    });
    const groundOuterRing = new THREE.Mesh(groundOuterRingGeo, groundOuterRingMat);
    groundOuterRing.rotation.x = Math.PI / 2;
    groundOuterRing.position.y = -2.28;
    spatialGroup.add(groundOuterRing);

    // 5. Hologram Quantum Particle Swarm
    const particleCount = 750;
    const particleGeo = new THREE.BufferGeometry();
    const posArray = new Float32Array(particleCount * 3);
    const initialPos = new Float32Array(particleCount * 3);

    for (let i = 0; i < particleCount * 3; i += 3) {
      // Sphere distribution
      const u = Math.random();
      const v = Math.random();
      const theta = u * 2.0 * Math.PI;
      const phi = Math.acos(2.0 * v - 1.0);
      const r = 1.4 + Math.random() * 1.6;

      const x = r * Math.sin(phi) * Math.cos(theta);
      const y = r * Math.sin(phi) * Math.sin(theta);
      const z = r * Math.cos(phi);

      posArray[i] = x;
      posArray[i + 1] = y;
      posArray[i + 2] = z;

      initialPos[i] = x;
      initialPos[i + 1] = y;
      initialPos[i + 2] = z;
    }

    particleGeo.setAttribute('position', new THREE.BufferAttribute(posArray, 3));

    // Particle Canvas Texture
    const createParticleTexture = () => {
      const canvas = document.createElement('canvas');
      canvas.width = 32;
      canvas.height = 32;
      const ctx = canvas.getContext('2d');
      if (ctx) {
        const gradient = ctx.createRadialGradient(16, 16, 0, 16, 16, 16);
        gradient.addColorStop(0, 'rgba(255,255,255,1)');
        gradient.addColorStop(0.3, 'rgba(56,189,248,0.8)');
        gradient.addColorStop(0.8, 'rgba(14,165,233,0.2)');
        gradient.addColorStop(1, 'rgba(0,0,0,0)');
        ctx.fillStyle = gradient;
        ctx.fillRect(0, 0, 32, 32);
      }
      return new THREE.CanvasTexture(canvas);
    };

    const particleMat = new THREE.PointsMaterial({
      size: 0.12,
      map: createParticleTexture(),
      transparent: true,
      opacity: 0.8,
      blending: THREE.AdditiveBlending,
      depthWrite: false,
    });

    const particles = new THREE.Points(particleGeo, particleMat);
    avatarGroup.add(particles);

    // 6. Lighting
    const keyLight = new THREE.PointLight(0x38bdf8, 3, 15);
    keyLight.position.set(3, 4, 4);
    scene.add(keyLight);

    const fillLight = new THREE.PointLight(0xa855f7, 2, 15);
    fillLight.position.set(-4, -2, 3);
    scene.add(fillLight);

    const ambientLight = new THREE.AmbientLight(0x0f172a, 1.5);
    scene.add(ambientLight);

    // Dynamic Animation Variables
    let currentOpacity = 0.0;
    let targetOpacity = 0.0;
    let currentScale = 0.001;
    let targetScale = 1.0;
    let rotationSpeed = 0.008;

    // Mouse Interaction
    let mouseX = 0;
    let mouseY = 0;
    let targetRotX = 0;
    let targetRotY = 0;

    const handleMouseMove = (e: MouseEvent) => {
      if (!interactive) return;
      const rect = container.getBoundingClientRect();
      const x = ((e.clientX - rect.left) / rect.width) * 2 - 1;
      const y = -(((e.clientY - rect.top) / rect.height) * 2 - 1);
      targetRotY = x * 0.45;
      targetRotX = -y * 0.45;
    };

    container.addEventListener('mousemove', handleMouseMove);

    // Handle Resize
    const handleResize = () => {
      if (!container) return;
      const width = container.clientWidth;
      const height = container.clientHeight;
      camera.aspect = width / height;
      camera.updateProjectionMatrix();
      renderer.setSize(width, height);
    };

    window.addEventListener('resize', handleResize);

    // Animation Loop
    let animationFrameId: number;
    let clock = new THREE.Clock();

    const animate = () => {
      animationFrameId = requestAnimationFrame(animate);

      const elapsedTime = clock.getElapsedTime();
      const currentState = stateRef.current;
      const currentAudio = audioLevelRef.current;

      // State Lifecycle Transitions
      switch (currentState) {
        case 'HIDDEN':
          targetOpacity = 0.0;
          targetScale = 0.001;
          rotationSpeed = 0.002;
          break;

        case 'APPEARING':
          targetOpacity = 0.95;
          targetScale = 1.0;
          rotationSpeed = 0.035;
          break;

        case 'IDLE':
          targetOpacity = 0.85;
          targetScale = 1.0;
          rotationSpeed = 0.006;
          break;

        case 'LISTENING':
          targetOpacity = 1.0;
          targetScale = 1.08 + Math.sin(elapsedTime * 6) * 0.04;
          rotationSpeed = 0.012;
          break;

        case 'PROCESSING':
          targetOpacity = 1.0;
          targetScale = 1.15;
          rotationSpeed = 0.06; // fast computational vortex
          break;

        case 'SPEAKING':
          targetOpacity = 1.0;
          // Audio-reactive expansion
          const speechPulse = currentAudio > 0 ? currentAudio * 0.35 : Math.abs(Math.sin(elapsedTime * 8)) * 0.15;
          targetScale = 1.05 + speechPulse;
          rotationSpeed = 0.015;
          break;

        case 'DISAPPEARING':
          targetOpacity = 0.0;
          targetScale = 0.02;
          rotationSpeed = 0.04;
          break;
      }

      // Smooth Lerp transitions for opacity and scale
      currentOpacity += (targetOpacity - currentOpacity) * 0.08;
      currentScale += (targetScale - currentScale) * 0.08;

      avatarGroup.scale.set(currentScale, currentScale, currentScale);

      // Apply opacity to materials
      icoMat.opacity = currentOpacity * 0.75;
      dodecaMat.opacity = currentOpacity * 0.45;
      ringMat1.opacity = currentOpacity * 0.65;
      ringMat2.opacity = currentOpacity * 0.5;
      particleMat.opacity = currentOpacity * 0.85;
      nucleusMat.emissiveIntensity = currentOpacity * (0.5 + Math.sin(elapsedTime * 3) * 0.2);

      // Color Mood Shifts based on State
      if (currentState === 'PROCESSING') {
        nucleusMat.color.setHex(0xf59e0b); // Amber computational
        nucleusMat.emissive.setHex(0xd97706);
        icoMat.color.setHex(0xfbbf24);
      } else if (currentState === 'LISTENING') {
        nucleusMat.color.setHex(0x10b981); // Emerald active receiver
        nucleusMat.emissive.setHex(0x059669);
        icoMat.color.setHex(0x34d399);
      } else if (currentState === 'SPEAKING') {
        nucleusMat.color.setHex(0x38bdf8); // Sky blue vocalization
        nucleusMat.emissive.setHex(0x0284c7);
        icoMat.color.setHex(0x60a5fa);
      } else {
        nucleusMat.color.setHex(0x06b6d4); // Cyan idle default
        nucleusMat.emissive.setHex(0x0891b2);
        icoMat.color.setHex(0x38bdf8);
      }

      // Gentle Floating Levitating Harmonic Motion
      if (currentState !== 'HIDDEN') {
        avatarGroup.position.y = Math.sin(elapsedTime * 1.5) * 0.12;
      }

      // Smooth Camera Rotation Tracking
      mouseX += (targetRotX - mouseX) * 0.05;
      mouseY += (targetRotY - mouseY) * 0.05;
      avatarGroup.rotation.x = mouseX;
      avatarGroup.rotation.y += rotationSpeed;

      // Internal Nested Counter-Rotations
      icoMesh.rotation.x += rotationSpeed * 1.2;
      icoMesh.rotation.z += rotationSpeed * 0.8;
      dodecaMesh.rotation.y -= rotationSpeed * 0.7;
      dodecaMesh.rotation.z += rotationSpeed * 0.5;
      ring1.rotation.z += rotationSpeed * 1.8;
      ring2.rotation.x -= rotationSpeed * 1.4;

      // Spatial Ground Grid & Dynamic Camera Lerp
      const isSpatial = spatialModeRef.current;
      spatialGroup.visible = isSpatial;
      if (isSpatial) {
        gridHelper.rotation.y = elapsedTime * 0.04;
        groundRing.rotation.z = -elapsedTime * 0.08;
        groundOuterRing.rotation.z = elapsedTime * 0.05;
        // Smoothly bring camera closer and higher in spatial mode
        camera.position.z += (5.8 - camera.position.z) * 0.05;
        camera.position.y += (0.25 - camera.position.y) * 0.05;
      } else {
        camera.position.z += (7.5 - camera.position.z) * 0.05;
        camera.position.y += (0.0 - camera.position.y) * 0.05;
      }

      // Dynamic Audio Particle Distortion
      const pos = particleGeo.attributes.position.array as Float32Array;
      const audioFactor = currentAudio > 0 ? currentAudio : (currentState === 'SPEAKING' ? 0.3 : 0.05);

      for (let i = 0; i < particleCount * 3; i += 3) {
        const initX = initialPos[i];
        const initY = initialPos[i + 1];
        const initZ = initialPos[i + 2];

        if (currentState === 'PROCESSING') {
          // Inward swirling vortex
          const angle = elapsedTime * 2.5 + i;
          pos[i] = initX * (0.85 + Math.sin(angle) * 0.15);
          pos[i + 1] = initY * (0.85 + Math.cos(angle) * 0.15);
          pos[i + 2] = initZ * (0.85 + Math.sin(angle * 0.5) * 0.15);
        } else if (currentState === 'SPEAKING' || currentState === 'LISTENING') {
          // Sonic ripple wave displacement
          const wave = Math.sin(elapsedTime * 4.0 + (initX * initX + initY * initY) * 2.0) * audioFactor * 0.4;
          pos[i] = initX * (1.0 + wave);
          pos[i + 1] = initY * (1.0 + wave);
          pos[i + 2] = initZ * (1.0 + wave);
        } else {
          pos[i] = initX;
          pos[i + 1] = initY;
          pos[i + 2] = initZ;
        }
      }
      particleGeo.attributes.position.needsUpdate = true;

      renderer.render(scene, camera);
    };

    animate();

    // Cleanup
    return () => {
      cancelAnimationFrame(animationFrameId);
      window.removeEventListener('resize', handleResize);
      container.removeEventListener('mousemove', handleMouseMove);
      renderer.dispose();
      particleGeo.dispose();
      particleMat.dispose();
      nucleusGeo.dispose();
      nucleusMat.dispose();
      icoGeo.dispose();
      icoMat.dispose();
      dodecaGeo.dispose();
      dodecaMat.dispose();
      ringGeo.dispose();
      ringMat1.dispose();
      ringMat2.dispose();
      if (renderer.domElement.parentNode) {
        renderer.domElement.parentNode.removeChild(renderer.domElement);
      }
    };
  }, []);

  // Status Badge UI configuration
  const getStateColor = (state: AvatarState) => {
    switch (state) {
      case 'HIDDEN': return 'text-slate-500 bg-slate-900/60 border-slate-700/50';
      case 'APPEARING': return 'text-sky-400 bg-sky-950/60 border-sky-500/40';
      case 'IDLE': return 'text-cyan-400 bg-cyan-950/60 border-cyan-500/40';
      case 'LISTENING': return 'text-emerald-400 bg-emerald-950/60 border-emerald-500/40';
      case 'PROCESSING': return 'text-amber-400 bg-amber-950/60 border-amber-500/40 animate-pulse';
      case 'SPEAKING': return 'text-indigo-400 bg-indigo-950/60 border-indigo-500/40';
      case 'DISAPPEARING': return 'text-rose-400 bg-rose-950/60 border-rose-500/40';
    }
  };

  return (
    <div className="relative w-full h-full min-h-[380px] bg-slate-950 rounded-xl overflow-hidden border border-slate-800/80 shadow-2xl flex flex-col justify-between">
      {/* 3D WebGL Canvas Mount */}
      <div ref={mountRef} className="absolute inset-0 w-full h-full cursor-grab active:cursor-grabbing" />

      {/* Subtle Background Radial Glow */}
      <div 
        className={`absolute inset-0 pointer-events-none transition-opacity duration-700 ${
          avatarState === 'HIDDEN' ? 'opacity-0' : 'opacity-30'
        } bg-[radial-gradient(ellipse_at_center,_var(--tw-gradient-stops))] from-cyan-600/30 via-transparent to-transparent`} 
      />

      {/* Top HUD Overlay */}
      <div className="relative z-10 p-4 flex items-center justify-between pointer-events-auto">
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2">
            <span className="relative flex h-2.5 w-2.5">
              {avatarState !== 'HIDDEN' && (
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-cyan-400 opacity-75" />
              )}
              <span className={`relative inline-flex rounded-full h-2.5 w-2.5 ${
                avatarState === 'HIDDEN' ? 'bg-slate-600' :
                avatarState === 'PROCESSING' ? 'bg-amber-400' :
                avatarState === 'LISTENING' ? 'bg-emerald-400' :
                avatarState === 'SPEAKING' ? 'bg-sky-400' : 'bg-cyan-400'
              }`} />
            </span>
            <span className="text-xs font-mono font-medium tracking-wider text-slate-300">
              JIN HOLOGRAPHIC CORE
            </span>
          </div>
          <span className="text-xs text-slate-600">·</span>
          <span className={`px-2 py-0.5 text-xs font-mono rounded border ${getStateColor(avatarState)}`}>
            STATE: {avatarState}
          </span>
        </div>

        <div className="flex items-center gap-2">
          {onToggleSpatialMode && (
            <button
              onClick={onToggleSpatialMode}
              className={`px-2.5 py-1 text-xs font-mono rounded border transition-colors flex items-center gap-1.5 ${
                spatialMode
                  ? 'bg-cyan-500/20 text-cyan-300 border-cyan-500/60 shadow-lg shadow-cyan-950/50'
                  : 'bg-slate-900/80 text-slate-400 hover:text-slate-200 border-slate-800'
              }`}
              title="Transisi antara 2D/3D Standard Web Window dan Mode Holographic Spatial"
            >
              <span className={`w-1.5 h-1.5 rounded-full ${spatialMode ? 'bg-cyan-400 animate-pulse' : 'bg-slate-500'}`} />
              <span>{spatialMode ? 'SPATIAL XR: ON' : 'SPATIAL 3D'}</span>
            </button>
          )}
          <div className="text-xs font-mono text-slate-400 tabular-nums hidden sm:block">
            {viewModeLabel || (spatialMode ? 'HOLOGRAPHIC COCKPIT' : '750 PARTICLES · WEBGL')}
          </div>
        </div>
      </div>

      {/* Bottom HUD Overlay / State Lifecycle Controller */}
      <div className="relative z-10 p-4 bg-gradient-to-t from-slate-950/90 via-slate-950/40 to-transparent flex flex-wrap items-center justify-between gap-3 pointer-events-auto">
        <div className="text-xs text-slate-400 flex items-center gap-2">
          <span>Lifecycle Controller</span>
          <span className="text-slate-600">·</span>
          <span className="text-slate-500 hidden sm:inline">Pemicu transisi status avatar manual atau otomatis</span>
        </div>

        {onStateChangeRequested && (
          <div className="flex items-center flex-wrap gap-1.5">
            {(['APPEARING', 'IDLE', 'LISTENING', 'PROCESSING', 'SPEAKING', 'DISAPPEARING', 'HIDDEN'] as AvatarState[]).map((st) => (
              <button
                key={st}
                onClick={() => onStateChangeRequested(st)}
                className={`px-2.5 py-1 text-xs font-mono rounded transition-all ${
                  avatarState === st
                    ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/50 shadow-sm'
                    : 'bg-slate-900/80 text-slate-400 hover:text-slate-200 hover:bg-slate-800 border border-slate-800'
                }`}
              >
                {st}
              </button>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};
