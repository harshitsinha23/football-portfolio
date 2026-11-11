import * as THREE from "three";
import { numberTexture } from "./textures";

export const PLAYER_SCALE = 4.4;

const KITS = {
  home: { shirt: "#1d3477", trim: "#f2c35c", shorts: "#f1f3f7", socks: "#1d3477" },
  keeper: { shirt: "#2f9e6a", trim: "#0f2a1f", shorts: "#14202c", socks: "#2f9e6a" },
};
const SKINS = ["#e2b08b", "#c58d66", "#9a6845", "#f1c9a4", "#b07a55", "#d9a27b"];
const HAIR = ["#17120f", "#2b1d14", "#3b2a1c", "#0f0f12", "#5a3b22", "#1c1712"];

const std = (color, rough = 0.75) =>
  new THREE.MeshStandardMaterial({ color, roughness: rough });

function limb(radius, length, material) {
  // Capsule hanging downward from its pivot at y=0.
  const m = new THREE.Mesh(new THREE.CapsuleGeometry(radius, length, 4, 10), material);
  m.position.y = -length / 2 - radius * 0.4;
  m.castShadow = true;
  return m;
}

function pivot(x, y, z, ...children) {
  const g = new THREE.Group();
  g.position.set(x, y, z);
  children.forEach((c) => g.add(c));
  return g;
}

export function createPlayer(renderer, { number, kit = "home", seed = 0 }) {
  const k = KITS[kit];
  const skin = std(SKINS[seed % SKINS.length], 0.6);
  const shirt = std(k.shirt, 0.7);
  const trim = std(k.trim, 0.6);
  const shorts = std(k.shorts, 0.8);
  const socks = std(k.socks, 0.8);
  const boot = std("#0d0f14", 0.4);

  const root = new THREE.Group();
  const body = new THREE.Group();
  body.scale.setScalar(PLAYER_SCALE);
  root.add(body);

  // Legs: hip -> knee -> ankle.
  const legs = [-1, 1].map((s) => {
    const shin = pivot(0, -0.44, 0, limb(0.062, 0.3, skin));
    const sock = new THREE.Mesh(new THREE.CylinderGeometry(0.066, 0.058, 0.2, 10), socks);
    sock.position.y = -0.32;
    sock.castShadow = true;
    const shoe = new THREE.Mesh(new THREE.BoxGeometry(0.1, 0.07, 0.22), boot);
    shoe.position.set(0, -0.44, 0.05);
    shoe.castShadow = true;
    shin.add(sock, shoe);
    const thigh = limb(0.08, 0.3, skin);
    const short = new THREE.Mesh(new THREE.CylinderGeometry(0.1, 0.095, 0.2, 10), shorts);
    short.position.y = -0.08;
    short.castShadow = true;
    const hip = pivot(s * 0.1, 0, 0, thigh, short, shin);
    return { hip, knee: shin };
  });
  const hips = pivot(0, 0.94, 0, legs[0].hip, legs[1].hip);
  body.add(hips);

  // Torso.
  const torso = new THREE.Group();
  hips.add(torso);
  const chest = new THREE.Mesh(new THREE.CapsuleGeometry(0.17, 0.3, 6, 14), shirt);
  chest.scale.set(1.28, 1, 0.82);
  chest.position.y = 0.3;
  chest.castShadow = true;
  torso.add(chest);
  const waist = new THREE.Mesh(new THREE.CylinderGeometry(0.19, 0.17, 0.12, 14), shorts);
  waist.scale.z = 0.8;
  waist.position.y = 0.04;
  torso.add(waist);
  const collar = new THREE.Mesh(new THREE.TorusGeometry(0.07, 0.02, 6, 16), trim);
  collar.rotation.x = Math.PI / 2;
  collar.position.y = 0.56;
  torso.add(collar);

  const numberMat = new THREE.MeshBasicMaterial({
    map: numberTexture(renderer, number, false),
    transparent: true,
    depthWrite: false,
  });
  for (const side of [1, -1]) {
    const n = new THREE.Mesh(new THREE.PlaneGeometry(0.2, 0.2), numberMat);
    n.position.set(0, 0.34, side * 0.148);
    if (side < 0) n.rotation.y = Math.PI;
    torso.add(n);
  }

  // Head.
  const neck = new THREE.Mesh(new THREE.CylinderGeometry(0.05, 0.055, 0.08, 8), skin);
  neck.position.y = 0.6;
  torso.add(neck);
  const head = new THREE.Group();
  head.position.y = 0.73;
  torso.add(head);
  const skull = new THREE.Mesh(new THREE.SphereGeometry(0.105, 16, 12), skin);
  skull.scale.set(0.92, 1.05, 1);
  skull.castShadow = true;
  head.add(skull);
  const hair = new THREE.Mesh(
    new THREE.SphereGeometry(0.11, 16, 10, 0, Math.PI * 2, 0, Math.PI * 0.55),
    std(HAIR[seed % HAIR.length], 0.9),
  );
  hair.position.set(0, 0.012, -0.008);
  hair.rotation.x = -0.25;
  head.add(hair);

  // Arms: shoulder -> elbow.
  const arms = [-1, 1].map((s) => {
    const sleeve = new THREE.Mesh(new THREE.CapsuleGeometry(0.058, 0.1, 4, 8), shirt);
    sleeve.position.y = -0.07;
    sleeve.castShadow = true;
    const upper = limb(0.045, 0.18, skin);
    const fore = pivot(0, -0.25, 0, limb(0.04, 0.17, skin));
    const shoulder = pivot(s * 0.25, 0.5, 0, sleeve, upper, fore);
    shoulder.rotation.z = s * 0.12;
    torso.add(shoulder);
    return { shoulder, elbow: fore };
  });

  // Soft contact shadow under the feet (cheap and always visible).
  const blob = new THREE.Mesh(
    new THREE.CircleGeometry(0.75, 24),
    new THREE.MeshBasicMaterial({ color: "#04140b", transparent: true, opacity: 0.35, depthWrite: false }),
  );
  blob.rotation.x = -Math.PI / 2;
  blob.position.y = 0.03;
  blob.scale.set(1, 0.7, 1);
  root.add(blob);

  const state = {
    root,
    numberMat,
    renderer,
    number,
    phase: Math.random() * Math.PI * 2,
    breathe: Math.random() * Math.PI * 2,
    speed: 0,
    kick: 0, // 0..1 progress of a kick, -1 when idle
    receive: 0,
    ready: 0,
    active: false,
  };
  root.userData.player = state;

  state.setActive = (active) => {
    if (state.active === active) return;
    state.active = active;
    numberMat.map.dispose();
    numberMat.map = numberTexture(renderer, number, active);
    numberMat.needsUpdate = true;
  };

  // Pose the rig from the current state. `dt` in seconds.
  state.pose = (dt) => {
    const run = Math.min(1, state.speed / 4);
    state.phase += dt * (5 + state.speed * 2.2);
    state.breathe += dt * 1.6;
    const p = state.phase;
    const swing = Math.sin(p) * 0.85 * run;
    const idle = Math.sin(state.breathe) * 0.03;

    let kickHip = 0,
      kickKnee = 0,
      lean = 0;
    if (state.kick > 0) {
      const t = state.kick;
      // Wind-up then strike then follow-through.
      kickHip = t < 0.45 ? -1.1 * (t / 0.45) : -1.1 + 2.6 * Math.min(1, (t - 0.45) / 0.3);
      kickHip *= t > 0.75 ? 1 - (t - 0.75) / 0.25 : 1;
      kickKnee = t < 0.45 ? 1.4 * (t / 0.45) : 1.4 * Math.max(0, 1 - (t - 0.45) / 0.2);
      lean = -0.18 * Math.sin(Math.PI * t);
    }
    const ready = state.ready; // knees bent, arms out — awaiting the ball.
    const recv = state.receive > 0 ? Math.sin(Math.PI * state.receive) : 0;

    legs[0].hip.rotation.x = swing - ready * 0.35 + recv * -0.5;
    legs[0].knee.rotation.x = Math.max(0, -Math.cos(p) * 1.2 * run) + ready * 0.6 + recv * 0.5;
    legs[1].hip.rotation.x = state.kick > 0 ? kickHip : -swing - ready * 0.35;
    legs[1].knee.rotation.x =
      state.kick > 0 ? kickKnee : Math.max(0, Math.cos(p) * 1.2 * run) + ready * 0.6;

    arms[0].shoulder.rotation.x = -swing * 0.9 + (state.kick > 0 ? 0.6 * Math.sin(Math.PI * state.kick) : 0);
    arms[1].shoulder.rotation.x = swing * 0.9 - (state.kick > 0 ? 0.4 * Math.sin(Math.PI * state.kick) : 0);
    arms[0].shoulder.rotation.z = -0.12 - ready * 0.35 - (state.kick > 0 ? 0.7 * Math.sin(Math.PI * state.kick) : 0);
    arms[1].shoulder.rotation.z = 0.12 + ready * 0.35 + (state.kick > 0 ? 0.5 * Math.sin(Math.PI * state.kick) : 0);
    arms[0].elbow.rotation.x = -0.35 - run * 0.9;
    arms[1].elbow.rotation.x = -0.35 - run * 0.9;

    torso.rotation.x = 0.06 + run * 0.18 + lean + ready * 0.12;
    torso.rotation.z = Math.sin(state.breathe * 0.5) * 0.02;
    head.rotation.x = -torso.rotation.x * 0.6;
    hips.position.y = 0.94 + idle * 0.3 + Math.abs(Math.sin(p)) * 0.05 * run - ready * 0.06 - recv * 0.05;
    chest.scale.y = 1 + idle * 0.15;
  };

  return state;
}
