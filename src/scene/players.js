import * as THREE from "three";
import { RoundedBoxGeometry } from "three/addons/geometries/RoundedBoxGeometry.js";
import { numberTexture } from "./textures";

export const PLAYER_SCALE = 4.4;

// Home kit from the concept: navy shirt with white trim, white shorts and socks.
const KIT = {
  shirt: "#1f3478",
  trim: "#f4f6fb",
  shorts: "#f1f3f7",
  socks: "#f3f5f8",
  band: "#1f3478",
  boot: "#0f1217",
};
const SKINS = ["#d9a27b", "#c68c63", "#e0b08a", "#b97c56", "#cf9a72", "#a86d48"];
const HAIR = ["#1a120d", "#2b1d14", "#3b2a1c", "#120f0f", "#4a301b", "#21170f"];
const HIP_Y = 0.9;

// Shirt silhouette (radius, height) from hem to collar; revolved and flattened front-to-back.
const SHIRT = [
  [0.001, -0.02],
  [0.212, -0.02],
  [0.21, 0.06],
  [0.196, 0.18],
  [0.204, 0.3],
  [0.226, 0.42],
  [0.238, 0.5],
  [0.214, 0.56],
  [0.13, 0.6],
  [0.07, 0.615],
  [0.001, 0.625],
];
const DEPTH = 0.64;
const shirtRadius = (y) => {
  for (let i = 1; i < SHIRT.length; i++) {
    const [r0, y0] = SHIRT[i - 1],
      [r1, y1] = SHIRT[i];
    if (y >= y0 && y <= y1 && y1 > y0) return r0 + ((r1 - r0) * (y - y0)) / (y1 - y0);
  }
  return 0.2;
};

const rng = (seed) => () => {
  seed = (seed + 0x6d2b79f5) | 0;
  let t = Math.imul(seed ^ (seed >>> 15), 1 | seed);
  t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
  return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
};

// Geometry shared by every player.
let G = null;
function shared() {
  if (G) return G;
  const cyl = (rt, rb, h, seg = 14) => new THREE.CylinderGeometry(rt, rb, h, seg);
  // A decal strip that hugs the shirt between y0..y1 over phiLength radians.
  const decal = (y0, y1, phiCenter, phiLength) => {
    const pts = [];
    for (let i = 0; i <= 8; i++) {
      const y = y0 + ((y1 - y0) * i) / 8;
      pts.push(new THREE.Vector2(shirtRadius(y) + 0.006, y));
    }
    return new THREE.LatheGeometry(pts, 12, phiCenter - phiLength / 2, phiLength);
  };
  G = {
    shirt: new THREE.LatheGeometry(SHIRT.map(([r, y]) => new THREE.Vector2(r, y)), 28),
    backNumber: decal(0.19, 0.45, Math.PI, 1.15),
    frontNumber: decal(0.32, 0.46, 0, 0.62),
    collar: new THREE.TorusGeometry(0.072, 0.017, 6, 20),
    neck: cyl(0.054, 0.06, 0.12, 10),
    pelvis: cyl(0.19, 0.205, 0.16, 20),
    shortLeg: cyl(0.112, 0.124, 0.26),
    thigh: cyl(0.06, 0.08, 0.24),
    knee: new THREE.SphereGeometry(0.06, 10, 8),
    sock: cyl(0.062, 0.05, 0.34),
    band: cyl(0.065, 0.064, 0.04),
    boot: new RoundedBoxGeometry(0.108, 0.078, 0.26, 2, 0.032),
    shoulder: new THREE.SphereGeometry(0.086, 12, 10),
    sleeve: cyl(0.082, 0.072, 0.2, 12),
    cuff: cyl(0.075, 0.075, 0.028, 12),
    upperArm: cyl(0.05, 0.044, 0.17, 10),
    elbow: new THREE.SphereGeometry(0.045, 8, 6),
    foreArm: cyl(0.044, 0.035, 0.2, 10),
    hand: new THREE.SphereGeometry(0.046, 10, 8),
    skull: new THREE.SphereGeometry(0.125, 20, 16),
    jaw: new THREE.SphereGeometry(0.092, 14, 10),
    ear: new THREE.SphereGeometry(0.03, 8, 6),
    nose: new THREE.ConeGeometry(0.022, 0.05, 6),
    eye: new THREE.SphereGeometry(0.013, 6, 4),
    hairCap: new THREE.SphereGeometry(0.133, 18, 10, 0, Math.PI * 2, 0, Math.PI * 0.52),
    tuft: new THREE.IcosahedronGeometry(0.05, 0),
    blob: new THREE.CircleGeometry(0.75, 24),
  };
  return G;
}

function mesh(geo, material, x = 0, y = 0, z = 0) {
  const m = new THREE.Mesh(geo, material);
  m.position.set(x, y, z);
  m.castShadow = true;
  return m;
}
function pivot(x, y, z, ...children) {
  const g = new THREE.Group();
  g.position.set(x, y, z);
  children.forEach((c) => g.add(c));
  return g;
}
const std = (color, roughness = 0.75, extra = {}) =>
  new THREE.MeshStandardMaterial({ color, roughness, ...extra });

export function createPlayer(renderer, { number, seed = 0 }) {
  const g = shared();
  const rand = rng(seed * 9973 + 17);
  const skin = std(SKINS[seed % SKINS.length], 0.62);
  const shirt = std(KIT.shirt, 0.62);
  const trim = std(KIT.trim, 0.6);
  const shorts = std(KIT.shorts, 0.78);
  const socks = std(KIT.socks, 0.85);
  const band = std(KIT.band, 0.7);
  const boot = std(KIT.boot, 0.35, { metalness: 0.2 });
  const hairMat = std(HAIR[seed % HAIR.length], 0.95, { flatShading: true });
  const dark = std("#141010", 0.4);

  const root = new THREE.Group();
  const body = new THREE.Group();
  body.scale.setScalar(PLAYER_SCALE * (0.97 + rand() * 0.06));
  root.add(body);

  // Legs: hip -> knee -> ankle.
  const legs = [-1, 1].map((s) => {
    const sock = mesh(g.sock, socks, 0, -0.2, 0);
    const sockBand = mesh(g.band, band, 0, -0.055, 0);
    const bootMesh = mesh(g.boot, boot, 0, -0.4, 0.05);
    const shin = pivot(0, -0.44, 0, mesh(g.knee, skin), sock, sockBand, bootMesh);
    const short = mesh(g.shortLeg, shorts, 0, -0.1, 0);
    const thigh = mesh(g.thigh, skin, 0, -0.32, 0);
    const hip = pivot(s * 0.098, 0, 0, short, thigh, shin);
    return { hip, knee: shin };
  });
  // Kept inside the shirt's flattened hem so the two never z-fight.
  const pelvis = mesh(g.pelvis, shorts, 0, -0.055, 0);
  pelvis.scale.z = 0.6;
  const hips = pivot(0, HIP_Y, 0, pelvis, legs[0].hip, legs[1].hip);
  body.add(hips);

  // Torso: tapered shirt with collar and curved number decals.
  const torso = new THREE.Group();
  hips.add(torso);
  const shirtMesh = mesh(g.shirt, shirt);
  shirtMesh.scale.z = DEPTH;
  torso.add(shirtMesh);
  const numberMat = new THREE.MeshBasicMaterial({
    map: numberTexture(renderer, number, false),
    transparent: true,
    depthWrite: false,
  });
  for (const geo of [g.backNumber, g.frontNumber]) {
    const n = new THREE.Mesh(geo, numberMat);
    n.scale.z = DEPTH;
    torso.add(n);
  }
  const collar = mesh(g.collar, trim, 0, 0.6, 0);
  collar.rotation.x = Math.PI / 2;
  collar.scale.set(1, 0.82, 1);
  torso.add(collar);

  // Head.
  torso.add(mesh(g.neck, skin, 0, 0.64, 0));
  const head = new THREE.Group();
  head.position.y = 0.785;
  head.scale.setScalar(1.12);
  torso.add(head);
  const skull = mesh(g.skull, skin);
  skull.scale.set(0.9, 1.02, 0.98);
  head.add(skull);
  const jaw = mesh(g.jaw, skin, 0, -0.05, 0.02);
  jaw.scale.set(0.95, 0.9, 1);
  head.add(jaw);
  for (const s of [-1, 1]) {
    const ear = mesh(g.ear, skin, s * 0.112, -0.012, 0.004);
    ear.scale.set(0.45, 1, 0.75);
    head.add(ear);
    head.add(mesh(g.eye, dark, s * 0.042, 0.004, 0.112));
  }
  const nose = mesh(g.nose, skin, 0, -0.02, 0.122);
  nose.rotation.x = Math.PI / 2;
  head.add(nose);
  const cap = mesh(g.hairCap, hairMat, 0, 0.012, -0.012);
  cap.rotation.x = -0.32;
  head.add(cap);
  // Tousled tufts across the crown and fringe.
  for (let i = 0; i < 9; i++) {
    const a = rand() * Math.PI * 2;
    // Front-facing tufts sit high so they never cover the face.
    const up = Math.sin(a) > 0.2 ? 0.95 + rand() * 0.35 : 0.35 + rand() * 0.6;
    const r = 0.122;
    const t = mesh(
      g.tuft,
      hairMat,
      Math.cos(a) * Math.cos(up) * r * 0.9,
      Math.sin(up) * r + 0.012,
      Math.sin(a) * Math.cos(up) * r * 0.9 - 0.01,
    );
    t.scale.setScalar(0.75 + rand() * 0.5);
    t.rotation.set(rand() * 3, rand() * 3, rand() * 3);
    head.add(t);
  }
  const fringe = mesh(g.tuft, hairMat, 0.02, 0.085, 0.085);
  fringe.scale.set(1.5, 0.7, 0.9);
  head.add(fringe);
  // Hair shouldn't shade the face.
  head.traverse((o) => {
    if (o.material === hairMat) o.castShadow = false;
  });

  // Arms: shoulder -> elbow.
  const arms = [-1, 1].map((s) => {
    const fore = pivot(
      0,
      -0.31,
      0,
      mesh(g.elbow, skin),
      mesh(g.foreArm, skin, 0, -0.1, 0),
      mesh(g.hand, skin, 0, -0.225, 0.006),
    );
    const shoulder = pivot(
      s * 0.232,
      0.5,
      0,
      mesh(g.shoulder, shirt),
      mesh(g.sleeve, shirt, 0, -0.09, 0),
      mesh(g.cuff, trim, 0, -0.19, 0),
      mesh(g.upperArm, skin, 0, -0.24, 0),
      fore,
    );
    shoulder.rotation.z = s * 0.16;
    torso.add(shoulder);
    return { shoulder, elbow: fore };
  });

  // Soft contact shadow under the feet (cheap and always visible).
  const blob = new THREE.Mesh(
    g.blob,
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
    phase: rand() * Math.PI * 2,
    breathe: rand() * Math.PI * 2,
    speed: 0,
    kick: 0, // 0..1 progress of a kick, 0 when idle
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
    const k = state.kick > 0 ? Math.sin(Math.PI * state.kick) : 0;

    legs[0].hip.rotation.x = swing - ready * 0.35 + recv * -0.5;
    legs[0].knee.rotation.x = Math.max(0, -Math.cos(p) * 1.2 * run) + ready * 0.6 + recv * 0.5;
    legs[1].hip.rotation.x = state.kick > 0 ? kickHip : -swing - ready * 0.35;
    legs[1].knee.rotation.x =
      state.kick > 0 ? kickKnee : Math.max(0, Math.cos(p) * 1.2 * run) + ready * 0.6;

    arms[0].shoulder.rotation.x = -swing * 0.9 + 0.6 * k;
    arms[1].shoulder.rotation.x = swing * 0.9 - 0.4 * k;
    arms[0].shoulder.rotation.z = -0.16 - ready * 0.35 - 0.7 * k;
    arms[1].shoulder.rotation.z = 0.16 + ready * 0.35 + 0.5 * k;
    arms[0].elbow.rotation.x = -0.3 - run * 0.95;
    arms[1].elbow.rotation.x = -0.3 - run * 0.95;

    torso.rotation.x = 0.05 + run * 0.18 + lean + ready * 0.12;
    torso.rotation.y = Math.sin(p) * 0.08 * run - 0.25 * k;
    torso.rotation.z = Math.sin(state.breathe * 0.5) * 0.02;
    head.rotation.x = -torso.rotation.x * 0.6;
    head.rotation.y = -torso.rotation.y * 0.7;
    hips.position.y = HIP_Y + idle * 0.3 + Math.abs(Math.sin(p)) * 0.05 * run - ready * 0.06 - recv * 0.05;
    shirtMesh.scale.y = 1 + idle * 0.08;
  };

  return state;
}
