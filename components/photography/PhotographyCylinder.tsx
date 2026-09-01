"use client";

import { useEffect, useRef } from "react";
import * as THREE from "three";
import gsap from "gsap";
import type { MediaItem } from "@/components/media/types";
import { NoResults } from "@/components/shared/NoResults";
import { cloudinaryTextureUrl, cylinderItems } from "./lib";

const PLANE_W = 3.4;
const PLANE_H = 4.5;
const PLANE_ASPECT = PLANE_W / PLANE_H;

// Few photos: a wide, shallow arc facing the camera — all big and visible.
const FEW = 5;
const FEW_RADIUS = 9;
const FEW_SPACING = 0.38; // radians between photos, so their flat edges meet
const FEW_CAMERA = 4.6; // camera distance from the front photo
const SWAY_SPEED = 0.0016; // gentle ping-pong for the few-photo arc

// Many photos: a closed prism/cylinder that spins the whole way around.
const MANY_CAMERA = 5; // camera distance from the front photo (kept large)
const AUTO_SPEED = 0.0032; // continuous rotation, radians/frame

const KEY_SPEED = 0.02; // rotation while an arrow key is held
const RESUME_MS = 1500;

const FOV = 55;
const FIT_MARGIN = 1.28; // breathing room around the front photo

/**
 * Distance needed for the front plane to fit BOTH axes at this aspect ratio.
 * `fov` is vertical, so a narrow phone viewport crops horizontally unless the
 * camera pulls back — this is what makes the cylinder usable on mobile.
 */
function fitDistance(aspect: number): number {
  const halfFov = (FOV * Math.PI) / 180 / 2;
  const forHeight = PLANE_H / 2 / Math.tan(halfFov);
  const forWidth = PLANE_W / 2 / (Math.tan(halfFov) * Math.max(aspect, 0.0001));
  return Math.max(forHeight, forWidth) * FIT_MARGIN;
}

/** Crop a loaded texture "cover"-style onto the fixed plane aspect. */
function coverTexture(tex: THREE.Texture) {
  const img = tex.image as { width: number; height: number };
  if (!img?.width || !img?.height) return;
  const imgAspect = img.width / img.height;
  if (imgAspect > PLANE_ASPECT) {
    tex.repeat.x = PLANE_ASPECT / imgAspect;
    tex.offset.x = (1 - tex.repeat.x) / 2;
  } else {
    tex.repeat.y = imgAspect / PLANE_ASPECT;
    tex.offset.y = (1 - tex.repeat.y) / 2;
  }
}

export default function PhotographyCylinder({
  items,
  onSelect,
}: {
  items: MediaItem[];
  onSelect: (item: MediaItem) => void;
}) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const onSelectRef = useRef(onSelect);
  onSelectRef.current = onSelect;

  const ringItems = cylinderItems(items);
  const signature = ringItems.map((m) => m.id).join(",");

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas || ringItems.length === 0) return;
    let disposed = false;

    const renderer = new THREE.WebGLRenderer({ canvas, alpha: true, antialias: true });
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 1.5));

    const scene = new THREE.Scene();
    const count = ringItems.length;
    const isFew = count <= FEW;

    // Few → wide shallow arc; many → closed prism whose flat edges touch.
    const radius = isFew ? FEW_RADIUS : (PLANE_W * 0.99) / (2 * Math.tan(Math.PI / count));
    const spacing = isFew ? FEW_SPACING : (2 * Math.PI) / count;
    // Few photos sway within the arc so nothing rotates into empty space.
    const maxRot = isFew ? Math.max(0.0001, ((count - 1) / 2) * spacing) : Infinity;

    const camera = new THREE.PerspectiveCamera(FOV, 1, 0.1, 200);
    const baseGap = isFew ? FEW_CAMERA : MANY_CAMERA;
    camera.position.set(0, 0, radius + baseGap);
    camera.lookAt(0, 0, 0);

    const group = new THREE.Group();
    scene.add(group);

    const geometry = new THREE.PlaneGeometry(PLANE_W, PLANE_H);
    const loader = new THREE.TextureLoader();
    loader.setCrossOrigin("anonymous");

    const meshes: THREE.Mesh[] = [];
    const textureCache = new Map<string, THREE.Texture>();

    ringItems.forEach((item, i) => {
      const theta = (i - (count - 1) / 2) * spacing;
      const material = new THREE.MeshBasicMaterial({
        color: 0x2a2a2a,
        side: THREE.FrontSide,
        transparent: true,
        opacity: 0,
      });
      const mesh = new THREE.Mesh(geometry, material);
      mesh.position.set(Math.sin(theta) * radius, 0, Math.cos(theta) * radius);
      mesh.rotation.y = theta;
      mesh.userData.item = item;
      group.add(mesh);
      meshes.push(mesh);

      const scatter = new THREE.Vector3(
        (Math.random() - 0.5) * 14,
        (Math.random() - 0.5) * 10,
        (Math.random() - 0.5) * 14
      );
      const target = mesh.position.clone();
      mesh.position.add(scatter);
      gsap.to(mesh.position, {
        x: target.x,
        y: target.y,
        z: target.z,
        duration: 0.9,
        delay: i * 0.04,
        ease: "power3.out",
      });
      gsap.to(material, { opacity: 1, duration: 0.6, delay: i * 0.04, ease: "power2.out" });

      if (item.secureUrl) {
        const url = cloudinaryTextureUrl(item.secureUrl);
        const cached = textureCache.get(url);
        const apply = (tex: THREE.Texture) => {
          if (disposed) return;
          material.map = tex;
          material.color.set(0xffffff);
          material.needsUpdate = true;
        };
        if (cached) {
          apply(cached);
        } else {
          loader.load(url, (tex) => {
            if (disposed) {
              tex.dispose();
              return;
            }
            tex.colorSpace = THREE.SRGBColorSpace;
            coverTexture(tex);
            textureCache.set(url, tex);
            apply(tex);
          });
        }
      }
    });

    // --- interaction ---
    const pointer = new THREE.Vector2();
    const raycaster = new THREE.Raycaster();
    let dragging = false;
    let lastX = 0;
    let dragDist = 0;
    let velocity = 0;
    let keyDir = 0;
    let swayDir = -1;
    let lastInteract = performance.now();

    const clampFew = (v: number) => (isFew ? Math.max(-maxRot, Math.min(maxRot, v)) : v);

    function setPointer(e: PointerEvent) {
      const rect = canvas!.getBoundingClientRect();
      pointer.x = ((e.clientX - rect.left) / rect.width) * 2 - 1;
      pointer.y = -((e.clientY - rect.top) / rect.height) * 2 + 1;
    }
    function onDown(e: PointerEvent) {
      dragging = true;
      dragDist = 0;
      lastX = e.clientX;
      velocity = 0;
      setPointer(e);
      lastInteract = performance.now();
    }
    function onMove(e: PointerEvent) {
      if (!dragging) return;
      const dx = e.clientX - lastX;
      lastX = e.clientX;
      dragDist += Math.abs(dx);
      velocity = dx * 0.005;
      group.rotation.y = clampFew(group.rotation.y + velocity);
      lastInteract = performance.now();
    }
    function onUp(e: PointerEvent) {
      if (!dragging) return;
      dragging = false;
      lastInteract = performance.now();
      if (dragDist < 6) {
        setPointer(e);
        raycaster.setFromCamera(pointer, camera);
        const hit = raycaster.intersectObjects(meshes, false)[0];
        const item = hit?.object.userData.item as MediaItem | undefined;
        if (item) onSelectRef.current(item);
      }
    }
    function onKeyDown(e: KeyboardEvent) {
      if (e.key === "ArrowLeft") keyDir = 1;
      else if (e.key === "ArrowRight") keyDir = -1;
      else return;
      velocity = 0;
    }
    function onKeyUp(e: KeyboardEvent) {
      if ((e.key === "ArrowLeft" && keyDir === 1) || (e.key === "ArrowRight" && keyDir === -1)) {
        keyDir = 0;
        lastInteract = performance.now();
      }
    }

    canvas.addEventListener("pointerdown", onDown);
    window.addEventListener("pointermove", onMove);
    window.addEventListener("pointerup", onUp);
    window.addEventListener("keydown", onKeyDown);
    window.addEventListener("keyup", onKeyUp);

    function resize() {
      const w = canvas!.clientWidth;
      const h = canvas!.clientHeight;
      if (!w || !h) return;
      renderer.setSize(w, h, false);
      const aspect = w / h;
      camera.aspect = aspect;
      // Pull back far enough that the front photo fits this viewport, never closer
      // than the tuned desktop gap.
      camera.position.z = radius + Math.max(baseGap, fitDistance(aspect));
      camera.updateProjectionMatrix();
    }
    resize();
    const ro = new ResizeObserver(resize);
    ro.observe(canvas);

    let raf: number;
    function animate() {
      raf = requestAnimationFrame(animate);
      if (!dragging) {
        if (keyDir !== 0) {
          group.rotation.y = clampFew(group.rotation.y + keyDir * KEY_SPEED);
          lastInteract = performance.now();
        } else if (Math.abs(velocity) > 0.0002) {
          group.rotation.y = clampFew(group.rotation.y + velocity);
          velocity *= 0.94;
        } else if (performance.now() - lastInteract > RESUME_MS) {
          if (isFew) {
            group.rotation.y += swayDir * SWAY_SPEED;
            if (group.rotation.y >= maxRot) {
              group.rotation.y = maxRot;
              swayDir = -1;
            } else if (group.rotation.y <= -maxRot) {
              group.rotation.y = -maxRot;
              swayDir = 1;
            }
          } else {
            group.rotation.y -= AUTO_SPEED; // continuous right-to-left full spin
          }
        }
      }
      renderer.render(scene, camera);
    }
    animate();

    return () => {
      disposed = true;
      cancelAnimationFrame(raf);
      ro.disconnect();
      canvas.removeEventListener("pointerdown", onDown);
      window.removeEventListener("pointermove", onMove);
      window.removeEventListener("pointerup", onUp);
      window.removeEventListener("keydown", onKeyDown);
      window.removeEventListener("keyup", onKeyUp);
      gsap.killTweensOf(meshes.map((m) => m.position));
      meshes.forEach((m) => {
        gsap.killTweensOf(m.material);
        (m.material as THREE.Material).dispose();
      });
      textureCache.forEach((t) => t.dispose());
      geometry.dispose();
      renderer.dispose();
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [signature]);

  if (ringItems.length === 0) {
    return <NoResults />;
  }

  return (
    <div className="relative box-border h-[calc(100vh-23rem)] min-h-[380px] w-full overflow-hidden">
      <canvas ref={canvasRef} className="h-full w-full cursor-grab touch-none active:cursor-grabbing" />
      <div className="pointer-events-none absolute bottom-4 left-1/2 -translate-x-1/2 rounded-full border border-white/15 bg-black/40 px-4 py-1.5 text-xs text-white/70 backdrop-blur">
        <span className="hidden sm:inline">Drag to rotate · click a photo to open</span>
        <span className="sm:hidden">Swipe to rotate · tap to open</span>
      </div>
    </div>
  );
}
