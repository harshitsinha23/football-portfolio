import * as THREE from "three";
import { buildStadium } from "./stadium";
import { createPlayer, PLAYER_SCALE } from "./players";
import { ballTexture, glowTexture, PITCH } from "./textures";

const BALL_R = 0.62;
const HEAD_Y = PLAYER_SCALE * 1.92;
const up = new THREE.Vector3(0, 1, 0);
const ease = (t) => t * t * (3 - 2 * t);
const lerpAngle = (a, b, k) => {
  const d = Math.atan2(Math.sin(b - a), Math.cos(b - a));
  return a + d * k;
};

/**
 * Builds the stadium, players and ball, and runs the render loop.
 * formation: [{ x, z }] world positions (metres) for each section.
 * hooks: onDisplay(index) at 70% of flight, onPossession(index).
 */
export function createPitchScene({ canvas, formation, initial, reduced, intro, hooks }) {
  const renderer = new THREE.WebGLRenderer({ canvas, antialias: true, powerPreference: "high-performance" });
  renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 1.75));
  renderer.outputColorSpace = THREE.SRGBColorSpace;
  renderer.toneMapping = THREE.ACESFilmicToneMapping;
  renderer.toneMappingExposure = 1.0;
  renderer.shadowMap.enabled = true;
  renderer.shadowMap.type = THREE.PCFSoftShadowMap;

  const scene = new THREE.Scene();
  scene.background = new THREE.Color("#060c18");
  scene.fog = new THREE.Fog("#060c18", 170, 420);

  const camera = new THREE.PerspectiveCamera(30, 1, 1, 900);

  // Night-match lighting: cool sky fill, warm floodlight key with shadows.
  scene.add(new THREE.HemisphereLight("#9fb8ff", "#16301f", 0.75));
  const key = new THREE.DirectionalLight("#fff3dc", 2.6);
  key.position.set(-40, 90, 55);
  key.castShadow = true;
  key.shadow.mapSize.set(2048, 2048);
  Object.assign(key.shadow.camera, { left: -70, right: 70, top: 50, bottom: -50, near: 10, far: 260 });
  key.shadow.camera.updateProjectionMatrix();
  key.shadow.bias = -0.0004;
  key.shadow.normalBias = 0.03;
  scene.add(key);
  const rim = new THREE.DirectionalLight("#c8d8ff", 1.0);
  rim.position.set(60, 70, -70);
  scene.add(rim);
  const fill = new THREE.DirectionalLight("#ffe2b0", 0.55);
  fill.position.set(50, 40, 80);
  scene.add(fill);

  const stadium = buildStadium(renderer, scene);

  // Players: one per section plus a decorative striker who plays the kickoff pass.
  const homes = formation.map((p) => new THREE.Vector3(p.x, 0, p.z));
  const players = homes.map((home, i) => {
    const p = createPlayer(renderer, { number: i + 1, seed: i * 7 + 3 });
    p.home = home.clone();
    p.root.position.copy(home);
    p.wander = home.clone();
    p.nextWander = Math.random() * 4;
    scene.add(p.root);
    return p;
  });
  const striker = createPlayer(renderer, { number: 9, seed: 11 });
  striker.home = new THREE.Vector3(-41, 0, 22);
  striker.root.position.copy(striker.home);
  striker.wander = striker.home.clone();
  striker.nextWander = 2;
  scene.add(striker.root);
  const everyone = [...players, striker];

  // Ball.
  const ball = new THREE.Mesh(
    new THREE.SphereGeometry(BALL_R, 28, 20),
    new THREE.MeshStandardMaterial({ map: ballTexture(renderer), roughness: 0.45 }),
  );
  ball.castShadow = true;
  scene.add(ball);
  const ballShadow = new THREE.Mesh(
    new THREE.CircleGeometry(BALL_R * 1.4, 20),
    new THREE.MeshBasicMaterial({ color: "#03110a", transparent: true, opacity: 0.5, depthWrite: false }),
  );
  ballShadow.rotation.x = -Math.PI / 2;
  ballShadow.position.y = 0.04;
  scene.add(ballShadow);

  // Gold trail: additive glow sprites sampled along the flight path.
  const glow = glowTexture();
  const TRAIL = 46;
  const trail = Array.from({ length: TRAIL }, () => {
    const s = new THREE.Sprite(
      new THREE.SpriteMaterial({ map: glow, color: "#ffc455", blending: THREE.AdditiveBlending, depthWrite: false, transparent: true, opacity: 0 }),
    );
    scene.add(s);
    return s;
  });

  // Possession ring.
  const ringGroup = new THREE.Group();
  const ringMat = new THREE.MeshBasicMaterial({ color: "#ffc455", transparent: true, opacity: 0.95, blending: THREE.AdditiveBlending, depthWrite: false });
  const ring = new THREE.Mesh(new THREE.RingGeometry(2.0, 2.35, 48), ringMat);
  const ringOuter = new THREE.Mesh(
    new THREE.RingGeometry(2.6, 2.75, 48),
    new THREE.MeshBasicMaterial({ color: "#ffd884", transparent: true, opacity: 0.45, blending: THREE.AdditiveBlending, depthWrite: false }),
  );
  const ringGlow = new THREE.Mesh(
    new THREE.CircleGeometry(3.4, 40),
    new THREE.MeshBasicMaterial({ map: glow, color: "#ffb43c", transparent: true, opacity: 0.55, blending: THREE.AdditiveBlending, depthWrite: false }),
  );
  [ringGlow, ring, ringOuter].forEach((m) => {
    m.rotation.x = -Math.PI / 2;
    ringGroup.add(m);
  });
  ringGroup.position.y = 0.06;
  scene.add(ringGroup);

  // ---------- State ----------
  let owner = initial;
  let carrier = intro && !reduced ? striker : players[initial];
  let pass = null; // active pass
  let pending = null;
  let ringPulse = 0;
  let isReduced = reduced;
  let labels = [];
  let stage = { x: 0, y: 0, w: 1, h: 1, W: 1, H: 1, portrait: false };
  let playerScale = 1;
  const base = { target: new THREE.Vector3(), pos: new THREE.Vector3(), dist: 120 };
  let introT = intro && !reduced ? 0 : 1;
  let introKicked = !(intro && !reduced);
  const pointer = { x: 0, y: 0, sx: 0, sy: 0 };
  players[owner].setActive(true);

  const facingPoint = (p) => {
    const dir = new THREE.Vector3(Math.sin(p.root.rotation.y), 0, Math.cos(p.root.rotation.y));
    return p.root.position.clone().addScaledVector(dir, 1.1 * playerScale).setY(BALL_R * playerScale);
  };
  const faceTowards = (p, point, k = 1) => {
    const yaw = Math.atan2(point.x - p.root.position.x, point.z - p.root.position.z);
    p.root.rotation.y = lerpAngle(p.root.rotation.y, yaw, k);
  };
  // Initial orientation: everyone faces the ball carrier; carrier faces the pitch centre.
  everyone.forEach((p) => faceTowards(p, carrier.root.position));
  faceTowards(carrier, new THREE.Vector3(0, 0, 0));
  ball.position.copy(facingPoint(carrier));

  // ---------- Camera fit ----------
  // Radians above horizontal, and a slight diagonal yaw like the concept art.
  const elevation = () => (stage.portrait ? 0.86 : 0.54);
  const baseYaw = () => (stage.portrait ? -0.1 : -0.26);
  function cameraAt(target, dist, yawOffset = 0, elevOffset = 0) {
    const e = elevation() + elevOffset,
      y = baseYaw() + yawOffset;
    return new THREE.Vector3(
      target.x + Math.sin(y) * Math.cos(e) * dist,
      target.y + Math.sin(e) * dist,
      target.z + Math.cos(y) * Math.cos(e) * dist,
    );
  }
  // Frame the formation (plus label headroom) inside the free stage area.
  // The canvas is full-bleed, so the rest of the stadium fills in behind the UI.
  function fitBox() {
    const xs = homes.map((h) => h.x),
      zs = homes.map((h) => h.z);
    const mx = stage.portrait ? 6 : 9,
      mz = stage.portrait ? 4 : 6;
    // Always keep both goal mouths in shot (posts sit on the goal lines).
    const goalX = PITCH.length / 2 + (stage.portrait ? 0.5 : 2);
    return [
      Math.min(Math.min(...xs) - mx, -goalX),
      Math.max(Math.max(...xs) + mx, goalX),
      Math.min(...zs) - mz,
      Math.max(...zs) + mz * 0.6,
      HEAD_Y * playerScale + 3,
    ];
  }
  const tmp = new THREE.Vector3();
  function projectedBounds(target, dist, box) {
    camera.position.copy(cameraAt(target, dist));
    camera.lookAt(target);
    camera.updateMatrixWorld();
    let minX = Infinity,
      maxX = -Infinity,
      minY = Infinity,
      maxY = -Infinity;
    const [x0, x1, z0, z1, h] = box;
    for (const x of [x0, x1])
      for (const z of [z0, z1])
        for (const y of [0, h]) {
          tmp.set(x, y, z).project(camera);
          const px = ((tmp.x + 1) / 2) * stage.W,
            py = ((1 - tmp.y) / 2) * stage.H;
          minX = Math.min(minX, px);
          maxX = Math.max(maxX, px);
          minY = Math.min(minY, py);
          maxY = Math.max(maxY, py);
        }
    return { minX, maxX, minY, maxY };
  }
  function fit() {
    const { W, H } = stage;
    // Small stages get chunkier players so they stay readable and tappable.
    playerScale = THREE.MathUtils.clamp(900 / Math.max(stage.w, 1), 1, 1.45);
    everyone.forEach((p) => p.root.scale.setScalar(playerScale));
    ball.scale.setScalar(playerScale);
    ballShadow.scale.setScalar(playerScale);
    ringGroup.scale.setScalar(playerScale);
    renderer.setSize(W, H, false);
    camera.aspect = W / H;
    camera.fov = stage.portrait ? 38 : 30;
    // Shift the principal point to the centre of the free stage area.
    const cx = stage.x + stage.w / 2,
      cy = stage.y + stage.h / 2;
    camera.setViewOffset(W, H, W / 2 - cx, H / 2 - cy, W, H);
    camera.updateProjectionMatrix();
    const box = fitBox();
    const pad = stage.portrait ? 0.94 : 0.97;
    const target = new THREE.Vector3((box[0] + box[1]) / 2, 0, (box[2] + box[3]) / 2);
    let dist = 120;
    for (let pass = 0; pass < 4; pass++) {
      let lo = 20,
        hi = 700;
      for (let i = 0; i < 26; i++) {
        const mid = (lo + hi) / 2;
        const b = projectedBounds(target, mid, box);
        const fits =
          b.maxX - b.minX <= stage.w * pad && b.maxY - b.minY <= stage.h * pad;
        if (fits) hi = mid;
        else lo = mid;
      }
      dist = hi;
      // Re-centre: perspective makes the far half smaller, so nudge the target.
      const b = projectedBounds(target, dist, box);
      const offY = (b.minY + b.maxY) / 2 - cy;
      const offX = (b.minX + b.maxX) / 2 - cx;
      const mpp = (dist * Math.tan(THREE.MathUtils.degToRad(camera.fov / 2)) * 2) / H;
      const yaw = baseYaw();
      // Screen-right and screen-down expressed as ground directions.
      const dx = offX * mpp,
        dz = (offY * mpp) / Math.sin(elevation());
      target.x += Math.cos(yaw) * dx + Math.sin(yaw) * dz;
      target.z += -Math.sin(yaw) * dx + Math.cos(yaw) * dz;
    }
    base.target.copy(target);
    base.dist = dist;
    base.pos.copy(cameraAt(target, dist));
    // Keep fog relative to the framing so distant cameras (narrow screens) stay clear.
    scene.fog.near = dist * 1.25;
    scene.fog.far = dist * 3.2;
    camera.far = dist * 4;
    camera.updateProjectionMatrix();
  }

  // ---------- Passing ----------
  function startPass(to, from = carrier) {
    const receiver = players[to];
    pass = {
      from,
      to,
      receiver,
      phase: "turn",
      t: 0,
      start: null,
      end: null,
      control: null,
      dur: 0.8,
      height: 4,
      displayed: false,
    };
  }

  function beginFlight() {
    const p = pass;
    p.start = ball.position.clone();
    const r = p.receiver.root.position;
    const toKicker = new THREE.Vector3().subVectors(p.from.root.position, r).setY(0).normalize();
    p.end = r.clone().addScaledVector(toKicker, 1.1 * playerScale).setY(BALL_R * playerScale);
    const d = p.start.distanceTo(p.end);
    p.dur = THREE.MathUtils.clamp(0.55 + d / 70, 0.7, 1.15);
    p.height = THREE.MathUtils.clamp(d * 0.2, 2.2, 10);
    const mid = p.start.clone().lerp(p.end, 0.5);
    const side = new THREE.Vector3().subVectors(p.end, p.start).cross(up).normalize();
    p.control = mid.addScaledVector(side, d * 0.12);
    p.phase = "flight";
    p.t = 0;
  }

  function flightPoint(p, u, out) {
    const a = 1 - u;
    out.set(
      a * a * p.start.x + 2 * a * u * p.control.x + u * u * p.end.x,
      BALL_R * playerScale + 4 * p.height * u * (1 - u),
      a * a * p.start.z + 2 * a * u * p.control.z + u * u * p.end.z,
    );
    return out;
  }

  function settle(index) {
    players[owner]?.setActive(false);
    owner = index;
    carrier = players[index];
    carrier.setActive(true);
    ringPulse = 1;
    hooks.onPossession?.(index);
  }

  function request(index) {
    if (!introKicked) {
      // Any navigation before kickoff skips the intro pass.
      introKicked = true;
      introT = Math.max(introT, 0.7);
      if (index === owner) {
        startPass(owner, striker);
        return;
      }
    }
    if (index === owner && !pass) return;
    if (isReduced) {
      pass = null;
      pending = null;
      settle(index);
      hooks.onDisplay?.(index);
      ball.position.copy(facingPoint(carrier));
      return;
    }
    if (pass) {
      pending = index;
      return;
    }
    startPass(index);
  }

  // ---------- Frame loop ----------
  const clock = new THREE.Clock();
  let raf = 0;
  const tv = new THREE.Vector3();

  function updatePlayers(dt) {
    const ballPos = ball.position;
    for (const p of everyone) {
      const busy = pass && (p === pass.from || p === pass.receiver);
      const hasBall = !pass && p === carrier;
      if (!isReduced && !busy && !hasBall) {
        p.nextWander -= dt;
        if (p.nextWander <= 0) {
          const a = Math.random() * Math.PI * 2,
            r = 0.6 + Math.random() * 2.2;
          p.wander.set(p.home.x + Math.cos(a) * r, 0, p.home.z + Math.sin(a) * r);
          p.nextWander = 2.5 + Math.random() * 4;
        }
        tv.subVectors(p.wander, p.root.position).setY(0);
        const dist = tv.length();
        const want = dist > 0.25 ? Math.min(2.4, dist * 1.6) : 0;
        p.speed += (want - p.speed) * Math.min(1, dt * 4);
        if (p.speed > 0.05 && dist > 0.01) {
          p.root.position.addScaledVector(tv.normalize(), p.speed * dt);
        }
        if (p.speed > 0.9) faceTowards(p, p.wander, Math.min(1, dt * 5));
        else faceTowards(p, ballPos, Math.min(1, dt * 3));
      } else {
        p.speed += (0 - p.speed) * Math.min(1, dt * 6);
      }
      p.ready += ((pass && p === pass.receiver ? 1 : 0) - p.ready) * Math.min(1, dt * 6);
      if (p.receive > 0) p.receive = p.receive + dt / 0.45 >= 1 ? 0 : p.receive + dt / 0.45;
      p.pose(isReduced ? 0 : dt);
    }
  }

  function updatePass(dt) {
    const p = pass;
    if (!p) {
      // Keep the ball at the carrier's feet with a small touch rhythm.
      const foot = facingPoint(carrier);
      const tap = isReduced ? 0 : Math.max(0, Math.sin(clock.elapsedTime * 3.2)) * 0.18;
      ball.position.lerp(foot.setY(BALL_R * playerScale + tap), Math.min(1, dt * 8));
      ball.rotation.x += dt * (isReduced ? 0 : 0.6);
      return;
    }
    p.t += dt;
    if (p.phase === "turn") {
      const aim = p.receiver.root.position;
      faceTowards(p.from, aim, Math.min(1, dt * 12));
      faceTowards(p.receiver, p.from.root.position, Math.min(1, dt * 8));
      ball.position.lerp(facingPoint(p.from), Math.min(1, dt * 10));
      if (p.t > 0.18) {
        p.phase = "kick";
        p.t = 0;
      }
    } else if (p.phase === "kick") {
      p.from.kick = Math.min(1, p.t / 0.42);
      faceTowards(p.receiver, ball.position, Math.min(1, dt * 8));
      if (p.from.kick >= 0.55 && !p.start) beginFlight();
    }
    if (p.phase === "flight") {
      if (p.from.kick > 0) p.from.kick = p.from.kick + dt / 0.42 >= 1 ? 0 : p.from.kick + dt / 0.42;
      const t = Math.min(1, p.t / p.dur);
      const u = ease(t) * 0.35 + t * 0.65;
      flightPoint(p, u, ball.position);
      ball.rotation.x += dt * 22;
      ball.rotation.z += dt * 6;
      faceTowards(p.receiver, ball.position, Math.min(1, dt * 8));
      for (let i = 0; i < TRAIL; i++) {
        const k = i / (TRAIL - 1);
        const back = Math.max(0, u - 0.42 * (1 - k));
        flightPoint(p, back, trail[i].position);
        trail[i].material.opacity = 0.75 * k * k;
        trail[i].scale.setScalar((0.5 + k * 1.2) * playerScale);
      }
      if (t >= 0.7 && !p.displayed) {
        p.displayed = true;
        hooks.onDisplay?.(p.to);
      }
      if (t >= 1) {
        p.receiver.receive = 0.001;
        p.from.kick = 0;
        if (p.from !== striker) p.from.wander.copy(p.from.home);
        if (!p.displayed) hooks.onDisplay?.(p.to);
        settle(p.to);
        pass = null;
        if (pending !== null && pending !== owner) {
          const next = pending;
          pending = null;
          startPass(next);
        } else pending = null;
      }
    }
  }

  function fadeTrail(dt) {
    if (pass && pass.phase === "flight") return;
    for (const s of trail) s.material.opacity = Math.max(0, s.material.opacity - dt * 0.9);
  }

  function updateCamera(dt, now) {
    let yaw = 0,
      elev = 0,
      dist = base.dist;
    const target = base.target.clone();
    if (introT < 1) {
      introT = Math.min(1, introT + dt / 2.6);
      const k = 1 - ease(introT);
      yaw = -0.5 * k;
      elev = -0.32 * k;
      dist = base.dist * (1 + 0.55 * k);
      if (introT > 0.55 && !introKicked) {
        introKicked = true;
        startPass(owner, striker);
      }
    }
    if (!isReduced) {
      pointer.sx += (pointer.x - pointer.sx) * Math.min(1, dt * 2.5);
      pointer.sy += (pointer.y - pointer.sy) * Math.min(1, dt * 2.5);
      yaw += Math.sin(now * 0.09) * 0.035 + pointer.sx * 0.05;
      elev += Math.sin(now * 0.13) * 0.012 - pointer.sy * 0.03;
      if (pass && pass.phase === "flight") {
        // Lean gently toward the ball during a pass.
        target.lerp(ball.position.clone().setY(0), 0.04);
      }
    }
    camera.position.copy(cameraAt(target, dist, yaw, elev));
    camera.lookAt(target);
  }

  function updateRing(dt) {
    const at = (pass && pass.from !== striker ? pass.from : players[owner]).root.position;
    ringGroup.position.x += (at.x - ringGroup.position.x) * Math.min(1, dt * 10);
    ringGroup.position.z += (at.z - ringGroup.position.z) * Math.min(1, dt * 10);
    ringPulse = Math.max(0, ringPulse - dt * 1.6);
    const breathe = isReduced ? 0 : Math.sin(clock.elapsedTime * 2.4) * 0.04;
    ringGroup.scale.setScalar((1 + breathe + ringPulse * 0.35) * playerScale);
    ringMat.opacity = 0.8 + ringPulse * 0.2;
    ringOuter.material.opacity = 0.35 + ringPulse * 0.5;
  }

  function updateLabels() {
    for (let i = 0; i < labels.length; i++) {
      const el = labels[i];
      if (!el) continue;
      const pos = players[i].root.position;
      tv.set(pos.x, (HEAD_Y + 0.5) * playerScale, pos.z).project(camera);
      const hx = ((tv.x + 1) / 2) * stage.W,
        hy = ((1 - tv.y) / 2) * stage.H;
      tv.set(pos.x, 0, pos.z).project(camera);
      const fy = ((1 - tv.y) / 2) * stage.H;
      const h = Math.max(24, fy - hy);
      el.style.transform = `translate3d(${hx.toFixed(1)}px, ${hy.toFixed(1)}px, 0) translateX(-50%)`;
      el.style.height = `${h.toFixed(1)}px`;
      el.style.width = `${(h * 0.62).toFixed(1)}px`;
    }
  }

  function frame() {
    raf = requestAnimationFrame(frame);
    const dt = Math.min(0.05, clock.getDelta());
    const now = clock.elapsedTime;
    updatePlayers(dt);
    updatePass(dt);
    fadeTrail(dt);
    updateRing(dt);
    stadium.update(dt, !isReduced);
    updateCamera(dt, now);
    ballShadow.position.x = ball.position.x;
    ballShadow.position.z = ball.position.z;
    const lift = ball.position.y - BALL_R * playerScale;
    ballShadow.material.opacity = Math.max(0.12, 0.5 - lift / 20);
    ballShadow.scale.setScalar((1 + lift / 8) * playerScale);
    renderer.render(scene, camera);
    updateLabels();
  }

  function onPointer(e) {
    pointer.x = (e.clientX / window.innerWidth) * 2 - 1;
    pointer.y = (e.clientY / window.innerHeight) * 2 - 1;
  }
  window.addEventListener("pointermove", onPointer, { passive: true });

  return {
    start() {
      clock.start();
      frame();
    },
    resize(next) {
      stage = next;
      fit();
    },
    setLabels(els) {
      labels = els;
    },
    request,
    setReduced(r) {
      isReduced = r;
      if (r) {
        introT = 1;
        if (!introKicked) {
          introKicked = true;
          carrier = players[owner];
        }
      }
    },
    // Called when the tab becomes hidden: settle on the requested section.
    settle() {
      const target = pending ?? pass?.to ?? owner;
      pass = null;
      pending = null;
      everyone.forEach((p) => (p.kick = 0));
      introT = 1;
      introKicked = true;
      if (target !== owner || carrier !== players[owner]) settle(target);
      hooks.onDisplay?.(target);
      ball.position.copy(facingPoint(carrier));
    },
    dispose() {
      cancelAnimationFrame(raf);
      window.removeEventListener("pointermove", onPointer);
      scene.traverse((o) => {
        o.geometry?.dispose();
        const m = o.material;
        (Array.isArray(m) ? m : m ? [m] : []).forEach((mm) => {
          mm.map?.dispose();
          mm.emissiveMap?.dispose();
          mm.dispose();
        });
      });
      renderer.dispose();
    },
  };
}
