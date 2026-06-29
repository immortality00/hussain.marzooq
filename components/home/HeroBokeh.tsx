"use client";

import { useEffect, useRef } from "react";
import * as THREE from "three";

const COUNT = 180;

function makeBokehTexture(): THREE.Texture {
  const size = 128;
  const canvas = document.createElement("canvas");
  canvas.width = size;
  canvas.height = size;
  const ctx = canvas.getContext("2d")!;
  const r = size / 2;
  const grad = ctx.createRadialGradient(r, r, 0, r, r, r);
  grad.addColorStop(0, "rgba(255,245,210,1)");
  grad.addColorStop(0.35, "rgba(255,240,190,0.7)");
  grad.addColorStop(0.7, "rgba(255,235,170,0.2)");
  grad.addColorStop(1, "rgba(255,235,170,0)");
  ctx.fillStyle = grad;
  ctx.fillRect(0, 0, size, size);
  const tex = new THREE.CanvasTexture(canvas);
  tex.flipY = false;
  return tex;
}

export function HeroBokeh() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const mouseRef = useRef({ x: 0, y: 0 });

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const renderer = new THREE.WebGLRenderer({ canvas, alpha: true, antialias: false });
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 1.5));

    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(55, 1, 0.1, 200);
    camera.position.z = 18;

    // --- geometry ---
    const positions = new Float32Array(COUNT * 3);
    const sizes = new Float32Array(COUNT);
    const speeds = new Float32Array(COUNT);

    for (let i = 0; i < COUNT; i++) {
      positions[i * 3]     = (Math.random() - 0.5) * 36;
      positions[i * 3 + 1] = (Math.random() - 0.5) * 26;
      positions[i * 3 + 2] = -10 + Math.random() * 18; // deep z spread
      // closer (higher z) = larger bokeh circle
      const depth = (positions[i * 3 + 2] + 10) / 18; // 0..1
      sizes[i] = 0.18 + depth * depth * 1.6;           // 0.18 → 1.78
      speeds[i] = 0.004 + Math.random() * 0.006;
    }

    const geo = new THREE.BufferGeometry();
    geo.setAttribute("position", new THREE.BufferAttribute(positions, 3));
    geo.setAttribute("size", new THREE.BufferAttribute(sizes, 1));

    const texture = makeBokehTexture();

    // Custom shader so per-vertex size works
    const mat = new THREE.ShaderMaterial({
      uniforms: { map: { value: texture }, opacity: { value: 0.0 } },
      vertexShader: /* glsl */ `
        attribute float size;
        void main() {
          vec4 mv = modelViewMatrix * vec4(position, 1.0);
          gl_PointSize = size * (340.0 / -mv.z);
          gl_Position = projectionMatrix * mv;
        }
      `,
      fragmentShader: /* glsl */ `
        uniform sampler2D map;
        uniform float opacity;
        void main() {
          vec4 tex = texture2D(map, gl_PointCoord);
          gl_FragColor = vec4(tex.rgb, tex.a * opacity);
        }
      `,
      transparent: true,
      depthWrite: false,
      blending: THREE.AdditiveBlending,
    });

    const points = new THREE.Points(geo, mat);
    scene.add(points);

    // Fade in
    let fadeT = 0;

    // Resize
    function resize() {
      const w = canvas!.clientWidth;
      const h = canvas!.clientHeight;
      if (!w || !h) return;
      renderer.setSize(w, h, false);
      camera.aspect = w / h;
      camera.updateProjectionMatrix();
    }
    resize();
    const ro = new ResizeObserver(resize);
    ro.observe(canvas);

    // Mouse parallax
    function onMouse(e: MouseEvent) {
      mouseRef.current = {
        x: (e.clientX / window.innerWidth  - 0.5) * 2,
        y: (e.clientY / window.innerHeight - 0.5) * 2,
      };
    }
    window.addEventListener("mousemove", onMouse, { passive: true });

    let raf: number;
    const timer = new THREE.Timer();

    function animate() {
      raf = requestAnimationFrame(animate);
      timer.update();
      const delta = timer.getDelta();

      // Fade in over 1.5s
      fadeT = Math.min(fadeT + delta / 1.5, 1);
      mat.uniforms.opacity.value = fadeT * 0.72;

      // Drift particles upward, wrap
      const pos = geo.attributes.position as THREE.BufferAttribute;
      const arr = pos.array as Float32Array;
      for (let i = 0; i < COUNT; i++) {
        arr[i * 3 + 1] += speeds[i];
        if (arr[i * 3 + 1] > 13) {
          arr[i * 3 + 1] = -13;
          arr[i * 3]     = (Math.random() - 0.5) * 36;
        }
      }
      pos.needsUpdate = true;

      // Slow 3D rotation for depth
      points.rotation.y += 0.00018;
      points.rotation.x += 0.00008;

      // Mouse parallax on camera
      camera.position.x += (mouseRef.current.x * 1.4 - camera.position.x) * 0.025;
      camera.position.y += (-mouseRef.current.y * 0.9 - camera.position.y) * 0.025;
      camera.lookAt(scene.position);

      renderer.render(scene, camera);
    }

    animate();

    return () => {
      cancelAnimationFrame(raf);
      ro.disconnect();
      window.removeEventListener("mousemove", onMouse);
      timer.dispose();
      geo.dispose();
      mat.dispose();
      texture.dispose();
      renderer.dispose();
    };
  }, []);

  return (
    <canvas
      ref={canvasRef}
      className="absolute inset-0 h-full w-full pointer-events-none z-20"
    />
  );
}
