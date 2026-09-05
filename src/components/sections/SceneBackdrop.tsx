import { useEffect, useRef } from 'react';

export type SceneVariant =
  | 'nebula'
  | 'lattice'
  | 'helix'
  | 'pulse'
  | 'storm';

type SceneBackdropProps = {
  variant?: SceneVariant;
  className?: string;
  intensity?: number;
};

function supportsWebGL(): boolean {
  try {
    const c = document.createElement('canvas');
    return !!(c.getContext('webgl2') || c.getContext('webgl') || c.getContext('experimental-webgl'));
  } catch {
    return false;
  }
}

/**
 * Full-viewport Three.js atmosphere with clear depth / parallax.
 * Professional palette — readable content sits above a soft center veil.
 */
export function SceneBackdrop({
  variant = 'nebula',
  className,
  intensity = 1,
}: SceneBackdropProps) {
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const mount = containerRef.current;
    if (!mount || !supportsWebGL()) return;

    const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    const mobileQ = window.matchMedia('(max-width: 767px)');
    const energy = Math.min(1.5, Math.max(0.5, intensity));

    let disposed = false;
    let frame = 0;
    let renderer: import('three').WebGLRenderer | null = null;
    const cleanups: Array<() => void> = [];
    const disposables: Array<{ dispose: () => void }> = [];

    const boot = async () => {
      const THREE = await import('three');
      if (disposed || !containerRef.current) return;

      const el = containerRef.current;
      const isDark = () => document.documentElement.classList.contains('dark');
      const isMobile = () => mobileQ.matches;
      const track = <T extends { dispose: () => void }>(obj: T): T => {
        disposables.push(obj);
        return obj;
      };

      const scene = new THREE.Scene();
      const camera = new THREE.PerspectiveCamera(52, 1, 0.1, 100);
      camera.position.set(0, 0.35, isMobile() ? 7.2 : 6.2);

      try {
        renderer = new THREE.WebGLRenderer({
          antialias: !isMobile(),
          alpha: true,
          powerPreference: isMobile() ? 'low-power' : 'high-performance',
          failIfMajorPerformanceCaveat: false,
        });
      } catch (err) {
        console.warn('[SceneBackdrop] WebGL init failed', err);
        return;
      }

      renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, isMobile() ? 1.25 : 1.65));
      renderer.setClearColor(0x000000, 0);
      renderer.toneMapping = THREE.ACESFilmicToneMapping;
      renderer.toneMappingExposure = 1.15;
      renderer.domElement.style.cssText =
        'position:absolute;inset:0;width:100%;height:100%;display:block;pointer-events:none;';
      el.appendChild(renderer.domElement);

      const ambient = new THREE.AmbientLight(0xffffff, 0.35);
      scene.add(ambient);
      const key = new THREE.DirectionalLight(0xffffff, 1.05);
      key.position.set(5, 6, 4);
      scene.add(key);
      const fill = new THREE.DirectionalLight(0x93c5fd, 0.45);
      fill.position.set(-4, 2, 3);
      scene.add(fill);
      const rim = new THREE.DirectionalLight(0x67e8f9, 0.55);
      rim.position.set(-2, -3, -4);
      scene.add(rim);
      const accent = new THREE.PointLight(0x2563eb, 1.1, 28);
      accent.position.set(1.2, 0.8, 3.5);
      scene.add(accent);
      const accent2 = new THREE.PointLight(0x0e7490, 0.7, 22);
      accent2.position.set(-2.5, -0.6, 2);
      scene.add(accent2);

      // Dark mode palette (glow-friendly)
      const PALETTE_DARK = [
        '#1e3a5f',
        '#2563eb',
        '#0e7490',
        '#334155',
        '#1d4ed8',
        '#0891b2',
        '#475569',
        '#38bdf8',
      ].map((hex) => new THREE.Color(hex));

      // Light mode palette — deeper / more saturated so forms punch on white
      const PALETTE_LIGHT = [
        '#0f172a',
        '#1d4ed8',
        '#0f766e',
        '#1e293b',
        '#1e40af',
        '#0369a1',
        '#334155',
        '#0284c7',
      ].map((hex) => new THREE.Color(hex));

      const palette = () => (isDark() ? PALETTE_DARK : PALETTE_LIGHT);

      // Depth layers — different Z / speeds = real 3D parallax
      const farLayer = new THREE.Group();
      const midLayer = new THREE.Group();
      const nearLayer = new THREE.Group();
      farLayer.position.z = -3.2;
      midLayer.position.z = 0;
      nearLayer.position.z = 2.4;
      scene.add(farLayer, midLayer, nearLayer);

      const particleN = isMobile() ? 420 : 900;
      const pPos = new Float32Array(particleN * 3);
      const pCol = new Float32Array(particleN * 3);
      const scratch = new THREE.Color();
      const paintParticles = () => {
        const pal = palette();
        const dark = isDark();
        for (let i = 0; i < particleN; i++) {
          scratch.copy(pal[i % pal.length]);
          // Light mode: keep colors deep; dark mode: lift for glow
          scratch.offsetHSL(0, dark ? 0.05 : 0.12, dark ? 0.18 : -0.02);
          pCol[i * 3] = scratch.r;
          pCol[i * 3 + 1] = scratch.g;
          pCol[i * 3 + 2] = scratch.b;
        }
        pGeo.attributes.color.needsUpdate = true;
      };
      for (let i = 0; i < particleN; i++) {
        const depth = Math.random();
        const r = 1.5 + depth * 8;
        const theta = Math.random() * Math.PI * 2;
        const phi = Math.acos(2 * Math.random() - 1);
        pPos[i * 3] = r * Math.sin(phi) * Math.cos(theta);
        pPos[i * 3 + 1] = r * Math.sin(phi) * Math.sin(theta) * 0.55;
        pPos[i * 3 + 2] = r * Math.cos(phi) - 1.5;
      }
      const pGeo = track(new THREE.BufferGeometry());
      pGeo.setAttribute('position', new THREE.BufferAttribute(pPos, 3));
      pGeo.setAttribute('color', new THREE.BufferAttribute(pCol, 3));
      paintParticles();
      const particles = new THREE.Points(
        pGeo,
        track(
          new THREE.PointsMaterial({
            size: isMobile() ? 0.038 : 0.03,
            transparent: true,
            opacity: isDark() ? 0.7 : 0.62,
            depthWrite: false,
            blending: isDark() ? THREE.AdditiveBlending : THREE.NormalBlending,
            sizeAttenuation: true,
            vertexColors: true,
          })
        )
      );
      farLayer.add(particles);

      const segs = isMobile() ? 48 : 80;
      const rings: import('three').Mesh[] = [];
      const wires: import('three').Object3D[] = [];
      const solids: import('three').Mesh[] = [];

      const addRing = (
        parent: import('three').Object3D,
        radius: number,
        tube: number,
        opacity: number,
        tilt: number,
        color: import('three').Color
      ) => {
        const mat = track(
          new THREE.MeshStandardMaterial({
            color,
            metalness: 0.75,
            roughness: 0.22,
            transparent: true,
            opacity,
            emissive: color.clone(),
            emissiveIntensity: 0.18,
          })
        );
        mat.userData.baseOpacity = opacity;
        const mesh = new THREE.Mesh(track(new THREE.TorusGeometry(radius, tube, 12, segs)), mat);
        mesh.rotation.x = tilt;
        parent.add(mesh);
        rings.push(mesh);
        return mesh;
      };

      const addWire = (
        parent: import('three').Object3D,
        geo: import('three').BufferGeometry,
        opacity: number,
        color: import('three').Color
      ) => {
        const mat = track(
          new THREE.LineBasicMaterial({
            color,
            transparent: true,
            opacity,
          })
        );
        mat.userData.baseOpacity = opacity;
        const lines = new THREE.LineSegments(track(new THREE.WireframeGeometry(geo)), mat);
        parent.add(lines);
        wires.push(lines);
        return lines;
      };

      const addSolid = (
        parent: import('three').Object3D,
        geo: import('three').BufferGeometry,
        opacity: number,
        color: import('three').Color
      ) => {
        const mat = track(
          new THREE.MeshStandardMaterial({
            color,
            metalness: 0.65,
            roughness: 0.25,
            transparent: true,
            opacity,
            flatShading: true,
            emissive: color.clone(),
            emissiveIntensity: 0.12,
          })
        );
        mat.userData.baseOpacity = opacity;
        const mesh = new THREE.Mesh(geo, mat);
        parent.add(mesh);
        solids.push(mesh);
        return mesh;
      };

      const pal0 = palette();
      // Layered architecture — near / mid / far read as real volume
      if (variant === 'nebula' || variant === 'storm') {
        addRing(midLayer, 1.55, 0.045, 0.72, Math.PI / 2.3, pal0[1]);
        addRing(midLayer, 2.25, 0.028, 0.55, Math.PI / 2.7, pal0[2]);
        addRing(farLayer, 3.1, 0.018, 0.35, Math.PI / 3.1, pal0[7]);
        addWire(midLayer, track(new THREE.IcosahedronGeometry(1.15, 1)), 0.45, pal0[1]);
        addSolid(nearLayer, track(new THREE.OctahedronGeometry(0.42, 0)), 0.85, pal0[1]);
        addSolid(farLayer, track(new THREE.TetrahedronGeometry(0.55, 0)), 0.4, pal0[2]);
        if (variant === 'storm') {
          addWire(nearLayer, track(new THREE.BoxGeometry(1.1, 1.1, 1.1)), 0.35, pal0[7]);
        }
      } else if (variant === 'lattice') {
        addWire(midLayer, track(new THREE.BoxGeometry(2.2, 2.2, 2.2)), 0.4, pal0[3]);
        addWire(nearLayer, track(new THREE.IcosahedronGeometry(0.9, 1)), 0.5, pal0[1]);
        addRing(midLayer, 1.8, 0.035, 0.65, Math.PI / 2.2, pal0[2]);
        addSolid(farLayer, track(new THREE.BoxGeometry(0.5, 0.5, 0.5)), 0.45, pal0[1]);
        const nodes = isMobile() ? 4 : 6;
        for (let i = 0; i < nodes; i++) {
          const m = addSolid(
            midLayer,
            track(new THREE.BoxGeometry(0.14, 0.14, 0.14)),
            0.8,
            pal0[i % pal0.length]
          );
          const a = (i / nodes) * Math.PI * 2;
          m.position.set(Math.cos(a) * 2.0, Math.sin(a * 2) * 0.45, Math.sin(a) * 2.0);
        }
      } else if (variant === 'helix') {
        addRing(midLayer, 1.4, 0.04, 0.7, Math.PI / 2.4, pal0[1]);
        addRing(midLayer, 1.4, 0.04, 0.55, Math.PI / 2.4, pal0[2]);
        rings[1].rotation.y = Math.PI / 2;
        addWire(farLayer, track(new THREE.SphereGeometry(1.4, 16, 12)), 0.28, pal0[3]);
        const count = isMobile() ? 10 : 16;
        for (let i = 0; i < count; i++) {
          const phase = i / count;
          const m = addSolid(
            midLayer,
            track(new THREE.SphereGeometry(0.07, 8, 8)),
            0.85,
            pal0[i % pal0.length]
          );
          m.userData.phase = phase;
          const a = phase * Math.PI * 4;
          m.position.set(Math.cos(a) * 1.45, (phase - 0.5) * 2.8, Math.sin(a) * 1.45);
        }
      } else if (variant === 'pulse') {
        addRing(midLayer, 1.5, 0.05, 0.72, Math.PI / 2.25, pal0[1]);
        addRing(farLayer, 2.4, 0.022, 0.4, Math.PI / 2.6, pal0[2]);
        addSolid(nearLayer, track(new THREE.IcosahedronGeometry(0.48, 0)), 0.8, pal0[1]);
        addWire(
          midLayer,
          track(new THREE.TorusKnotGeometry(1.05, 0.24, isMobile() ? 64 : 100, 12)),
          0.42,
          pal0[7]
        );
      }

      const pointer = { x: 0, y: 0, tx: 0, ty: 0 };
      const onPointer = (e: PointerEvent) => {
        pointer.tx = (e.clientX / window.innerWidth) * 2 - 1;
        pointer.ty = -((e.clientY / window.innerHeight) * 2 - 1);
      };
      window.addEventListener('pointermove', onPointer, { passive: true });
      cleanups.push(() => window.removeEventListener('pointermove', onPointer));

      const syncTheme = () => {
        const dark = isDark();
        const pal = palette();
        const mobile = isMobile();

        // Soft cool fog in light — less washout than pure white
        scene.fog = new THREE.FogExp2(
          dark ? 0x09090b : 0xe8eef5,
          mobile ? (dark ? 0.028 : 0.016) : dark ? 0.018 : 0.01
        );

        ambient.intensity = dark ? 0.35 : 0.55;
        key.intensity = dark ? 1.05 : 1.35;
        key.color.set(dark ? 0xffffff : 0xf8fafc);
        fill.intensity = dark ? 0.45 : 0.7;
        fill.color.set(dark ? 0x93c5fd : 0x60a5fa);
        rim.intensity = dark ? 0.55 : 0.65;
        rim.color.set(dark ? 0x67e8f9 : 0x0ea5e9);
        accent.color.set(dark ? 0x2563eb : 0x1d4ed8);
        accent2.color.set(dark ? 0x0e7490 : 0x0f766e);
        if (renderer) renderer.toneMappingExposure = dark ? 1.15 : 1.28;

        const pMat = particles.material as import('three').PointsMaterial;
        pMat.blending = dark ? THREE.AdditiveBlending : THREE.NormalBlending;
        pMat.opacity = dark ? 0.75 : 0.7;
        pMat.size = mobile ? (dark ? 0.035 : 0.042) : dark ? 0.028 : 0.034;
        paintParticles();

        wires.forEach((w, i) => {
          const line = w as import('three').LineSegments;
          const mat = line.material as import('three').LineBasicMaterial;
          const base = (mat.userData.baseOpacity as number) || 0.4;
          mat.opacity = dark ? base : Math.min(1, base * 1.55);
          mat.color.copy(pal[i % pal.length]);
        });
        rings.forEach((r, i) => {
          const mat = r.material as import('three').MeshStandardMaterial;
          const base = (mat.userData.baseOpacity as number) || 0.55;
          mat.opacity = dark ? Math.max(base, 0.55) : Math.min(0.95, base * 1.25);
          mat.emissiveIntensity = dark ? 0.22 : 0.08;
          mat.metalness = dark ? 0.75 : 0.55;
          mat.roughness = dark ? 0.22 : 0.35;
          mat.color.copy(pal[(i + 1) % pal.length]);
          mat.emissive.copy(pal[(i + 1) % pal.length]);
        });
        solids.forEach((s, i) => {
          const mat = s.material as import('three').MeshStandardMaterial;
          const base = (mat.userData.baseOpacity as number) || 0.7;
          mat.opacity = dark ? base : Math.min(0.95, base * 1.15);
          mat.emissiveIntensity = dark ? 0.12 : 0.05;
          mat.metalness = dark ? 0.65 : 0.45;
          mat.roughness = dark ? 0.25 : 0.4;
          mat.color.copy(pal[i % pal.length]);
          mat.emissive.copy(pal[i % pal.length]);
        });
      };
      syncTheme();
      const themeObs = new MutationObserver(syncTheme);
      themeObs.observe(document.documentElement, { attributes: true, attributeFilter: ['class'] });
      cleanups.push(() => themeObs.disconnect());

      const layout = () => {
        const mobile = isMobile();
        const s = mobile ? 0.85 : 1.05 * energy;
        farLayer.scale.setScalar(s * 1.15);
        midLayer.scale.setScalar(s);
        nearLayer.scale.setScalar(s * 0.9);
        camera.position.z = mobile ? 7.4 : 6.2;
        renderer?.setPixelRatio(Math.min(window.devicePixelRatio || 1, mobile ? 1.25 : 1.65));
      };
      layout();

      const resize = () => {
        if (!renderer) return;
        const w = el.clientWidth;
        const h = el.clientHeight;
        if (w < 2 || h < 2) return;
        camera.aspect = w / h;
        camera.updateProjectionMatrix();
        renderer.setSize(w, h, false);
        layout();
      };
      resize();

      if (typeof ResizeObserver !== 'undefined') {
        const ro = new ResizeObserver(resize);
        ro.observe(el);
        cleanups.push(() => ro.disconnect());
      } else {
        window.addEventListener('resize', resize);
        cleanups.push(() => window.removeEventListener('resize', resize));
      }

      const onMq = () => {
        layout();
        resize();
      };
      if (typeof mobileQ.addEventListener === 'function') {
        mobileQ.addEventListener('change', onMq);
        cleanups.push(() => mobileQ.removeEventListener('change', onMq));
      } else {
        mobileQ.addListener(onMq);
        cleanups.push(() => mobileQ.removeListener(onMq));
      }

      let visible = true;
      if (typeof IntersectionObserver !== 'undefined') {
        const io = new IntersectionObserver(
          ([e]) => {
            visible = e.isIntersecting;
          },
          { threshold: 0.02 }
        );
        io.observe(el);
        cleanups.push(() => io.disconnect());
      }

      const start = performance.now();
      const animate = (now: number) => {
        frame = requestAnimationFrame(animate);
        if (!renderer || !visible) return;
        const t = ((now - start) / 1000) * energy * 0.7;
        const motion = reduceMotion ? 0.12 : 1;

        pointer.x += (pointer.tx - pointer.x) * 0.05;
        pointer.y += (pointer.ty - pointer.y) * 0.05;

        // Multi-speed layer rotation = depth
        farLayer.rotation.y = t * 0.06 * motion + pointer.x * 0.08;
        farLayer.rotation.x = Math.sin(t * 0.12) * 0.06 * motion + pointer.y * 0.05;
        midLayer.rotation.y = t * 0.14 * motion + pointer.x * 0.28;
        midLayer.rotation.x = Math.sin(t * 0.2) * 0.1 * motion + pointer.y * 0.18;
        nearLayer.rotation.y = t * 0.22 * motion + pointer.x * 0.45;
        nearLayer.rotation.x = Math.sin(t * 0.28) * 0.12 * motion + pointer.y * 0.28;
        nearLayer.position.y = Math.sin(t * 0.5) * 0.12 * motion;
        midLayer.position.y = Math.sin(t * 0.35) * 0.06 * motion;

        rings.forEach((r, i) => {
          r.rotation.z = t * (0.25 + i * 0.08) * motion * (i % 2 ? -1 : 1);
          r.rotation.y = t * 0.06 * i * motion;
        });
        wires.forEach((w, i) => {
          w.rotation.y = t * (0.15 + i * 0.05) * motion;
          w.rotation.x = t * 0.08 * motion;
        });
        solids.forEach((m, i) => {
          if (typeof m.userData.phase === 'number') {
            const phase = m.userData.phase as number;
            const a = phase * Math.PI * 4 + t * 0.55 * motion;
            m.position.set(Math.cos(a) * 1.45, (phase - 0.5) * 2.8, Math.sin(a) * 1.45);
          } else {
            m.rotation.x = t * (0.35 + i * 0.05) * motion;
            m.rotation.y = t * (0.45 + i * 0.06) * motion;
          }
        });

        particles.rotation.y = t * 0.04 * motion;

        accent.intensity = 1.0 + Math.sin(t * 1.2) * 0.25 * motion;
        accent.position.x = Math.sin(t * 0.4) * 1.5;
        accent2.intensity = 0.65 + Math.cos(t * 0.9) * 0.2 * motion;

        // Camera orbit parallax — strongest 3D cue
        camera.position.x = pointer.x * 0.85;
        camera.position.y = 0.35 + pointer.y * 0.55;
        camera.position.z = (isMobile() ? 7.4 : 6.2) + pointer.y * 0.25;
        camera.lookAt(pointer.x * 0.3, pointer.y * 0.15, 0);

        renderer.render(scene, camera);
      };

      renderer.render(scene, camera);
      frame = requestAnimationFrame(animate);
    };

    boot().catch((err) => console.warn('[SceneBackdrop] failed', err));

    return () => {
      disposed = true;
      cancelAnimationFrame(frame);
      cleanups.forEach((fn) => {
        try {
          fn();
        } catch {
          /* ignore */
        }
      });
      disposables.forEach((d) => {
        try {
          d.dispose();
        } catch {
          /* ignore */
        }
      });
      if (renderer) {
        renderer.dispose();
        renderer.forceContextLoss?.();
        renderer.domElement.remove();
        renderer = null;
      }
    };
  }, [variant, intensity]);

  return <div ref={containerRef} className={className} aria-hidden="true" />;
}
