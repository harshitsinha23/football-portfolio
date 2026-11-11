import * as THREE from "three";
import {
  PITCH,
  pitchTexture,
  ledTexture,
  crowdTexture,
  bannerTexture,
  glowTexture,
  netTexture,
} from "./textures";

const HL = PITCH.length / 2,
  HW = PITCH.width / 2,
  APRON = 6;

const mat = (color, extra = {}) =>
  new THREE.MeshStandardMaterial({ color, roughness: 0.85, ...extra });

function box(w, h, d, material, x = 0, y = 0, z = 0) {
  const m = new THREE.Mesh(new THREE.BoxGeometry(w, h, d), material);
  m.position.set(x, y, z);
  return m;
}

// A tiered stand in local space: front edge at z=0, rising towards -z.
function stand(renderer, length, depth, height, { roof = true, crowdRows = 12 } = {}) {
  const g = new THREE.Group();
  const concrete = mat("#2b3343");
  const dark = mat("#161d2a");
  const crowd = crowdTexture(renderer, crowdRows);
  crowd.repeat.set(length / 30, 1);
  const slope = Math.hypot(depth, height - 2);
  const seats = new THREE.Mesh(
    new THREE.PlaneGeometry(length, slope),
    new THREE.MeshStandardMaterial({ map: crowd, roughness: 1, emissive: "#ffffff", emissiveMap: crowd, emissiveIntensity: 0.05 }),
  );
  // Tilt the plane back so it rises from the front wall to the rear of the stand.
  seats.rotation.x = -Math.atan2(depth, height - 2);
  seats.position.set(0, 2 + (height - 2) / 2, -depth / 2 - 0.6);
  seats.receiveShadow = true;
  g.add(seats);
  // Tier edges: thin lit steps across the slope give the stand depth.
  const step = new THREE.MeshStandardMaterial({ color: "#4a5672", roughness: 0.7 });
  const tiers = 7;
  for (let i = 1; i < tiers; i++) {
    const k = i / tiers;
    g.add(box(length, 0.25, 0.35, step, 0, 2 + (height - 2) * k + 0.1, -0.6 - depth * k));
  }
  // Mid-tier concourse band.
  g.add(box(length, 1.1, 0.3, dark, 0, 2 + (height - 2) * 0.5 + 0.4, -0.5 - depth * 0.5));
  // Front wall with a warm strip.
  g.add(box(length, 2, 0.8, concrete, 0, 1, -0.4));
  g.add(
    box(length, 0.12, 0.1, new THREE.MeshBasicMaterial({ color: "#f2c35c" }), 0, 1.9, 0.02),
  );
  // Aisles.
  const aisle = mat("#3d4658");
  for (let x = -length / 2 + 12; x < length / 2 - 4; x += 14) {
    const a = new THREE.Mesh(new THREE.PlaneGeometry(1.1, slope), aisle);
    a.position.copy(seats.position).add(new THREE.Vector3(x, 0.03, 0.03));
    a.rotation.copy(seats.rotation);
    g.add(a);
  }
  // Back wall and side caps.
  g.add(box(length + 1, height + 3, 1, concrete, 0, (height + 3) / 2, -depth - 1.4));
  for (const s of [-1, 1])
    g.add(box(1, height + 1.5, depth + 1.5, concrete, (s * (length + 1)) / 2, (height + 1.5) / 2, -depth / 2 - 0.9));
  if (roof) {
    const r = box(length + 3, 0.5, depth * 0.75, mat("#1d2433", { metalness: 0.4, roughness: 0.6 }), 0, height + 5.6, -depth * 0.62 - 1.4);
    r.rotation.x = -0.08;
    g.add(r);
    g.add(
      box(length + 3, 0.6, 0.4, new THREE.MeshBasicMaterial({ color: "#fff1cf" }), 0, height + 5.15, -depth * 0.25 - 1.6),
    );
    for (let x = -length / 2 + 4; x <= length / 2 - 4; x += (length - 8) / 6)
      g.add(box(0.5, 6, 0.5, concrete, x, height + 3, -depth - 0.9));
  }
  return g;
}

function floodlight(glow, x, z, height, target) {
  const g = new THREE.Group();
  const steel = mat("#3b4555", { metalness: 0.6, roughness: 0.4 });
  const pole = new THREE.Mesh(new THREE.CylinderGeometry(0.45, 0.8, height, 10), steel);
  pole.position.y = height / 2;
  g.add(pole);
  const head = new THREE.Group();
  head.position.y = height + 1.8;
  head.add(box(7, 4, 0.6, steel));
  const lamp = new THREE.MeshBasicMaterial({ color: "#fff7e0" });
  for (let i = 0; i < 4; i++)
    for (let j = 0; j < 3; j++) {
      head.add(box(1.3, 0.9, 0.2, lamp, -2.4 + i * 1.6, -1.15 + j * 1.15, 0.4));
      const s = new THREE.Sprite(
        new THREE.SpriteMaterial({ map: glow, color: "#fff2c4", blending: THREE.AdditiveBlending, depthWrite: false, transparent: true, opacity: 0.85 }),
      );
      s.scale.setScalar(4.2);
      s.position.set(-2.4 + i * 1.6, -1.15 + j * 1.15, 1.2);
      head.add(s);
    }
  g.add(head);
  g.position.set(x, 0, z);
  head.lookAt(target);
  const halo = new THREE.Sprite(
    new THREE.SpriteMaterial({ map: glow, color: "#ffe9b0", blending: THREE.AdditiveBlending, depthWrite: false, transparent: true, opacity: 0.55 }),
  );
  halo.scale.setScalar(26);
  halo.position.y = height + 1.8;
  g.add(halo);
  return g;
}

// Goal sized to the stylised players (who are ~4x life size) so it reads at a glance.
// Local frame: goal line at x=0, net extends towards -x; rotated per side.
export const GOAL = { w: 18, h: 11, d: 5 };
function goal(net, side) {
  const g = new THREE.Group();
  const white = new THREE.MeshStandardMaterial({ color: "#f7f9fc", roughness: 0.35, emissive: "#ffffff", emissiveIntensity: 0.12 });
  const steel = new THREE.MeshStandardMaterial({ color: "#c9d1dc", roughness: 0.5, metalness: 0.3 });
  const { w, h, d } = GOAL;
  const r = 0.26;
  const tube = (len, m = white, rad = r) => {
    const t = new THREE.Mesh(new THREE.CylinderGeometry(rad, rad, len, 12), m);
    t.castShadow = true;
    return t;
  };
  // Posts and crossbar.
  for (const s of [-1, 1]) {
    const p = tube(h + r);
    p.position.set(0, (h + r) / 2, (s * w) / 2);
    g.add(p);
  }
  const bar = tube(w + 2 * r);
  bar.rotation.x = Math.PI / 2;
  bar.position.y = h;
  g.add(bar);
  // Rear frame: stanchions slanting back to a ground bar, like a real goal.
  const topD = d * 0.45;
  for (const s of [-1, 1]) {
    const z = (s * w) / 2;
    const top = tube(topD, steel, 0.1);
    top.rotation.z = Math.PI / 2;
    top.position.set(-topD / 2, h, z);
    g.add(top);
    const slant = Math.hypot(d - topD, h);
    const back = tube(slant, steel, 0.1);
    back.position.set(-(topD + d) / 2, h / 2, z);
    back.rotation.z = Math.atan2(d - topD, h);
    g.add(back);
    const ground = tube(d, steel, 0.1);
    ground.rotation.z = Math.PI / 2;
    ground.position.set(-d / 2, 0.1, z);
    g.add(ground);
  }
  const groundBack = tube(w, steel, 0.1);
  groundBack.rotation.x = Math.PI / 2;
  groundBack.position.set(-d, 0.1, 0);
  g.add(groundBack);

  // Net: roof, sloped back and two trapezoid sides.
  const netMat = new THREE.MeshBasicMaterial({ map: net, transparent: true, opacity: 0.85, side: THREE.DoubleSide, depthWrite: false });
  const roof = new THREE.Mesh(new THREE.PlaneGeometry(topD, w), netMat);
  roof.rotation.set(-Math.PI / 2, 0, Math.PI / 2);
  roof.position.set(-topD / 2, h, 0);
  g.add(roof);
  const slope = Math.hypot(d - topD, h);
  const back = new THREE.Mesh(new THREE.PlaneGeometry(w, slope), netMat);
  back.rotation.order = "YXZ";
  back.rotation.y = Math.PI / 2;
  back.rotation.x = -Math.atan2(d - topD, h);
  back.position.set(-(topD + d) / 2, h / 2, 0);
  g.add(back);
  const sideShape = new THREE.Shape([
    new THREE.Vector2(0, 0),
    new THREE.Vector2(0, h),
    new THREE.Vector2(-topD, h),
    new THREE.Vector2(-d, 0),
  ]);
  const sideGeo = new THREE.ShapeGeometry(sideShape);
  // Planar UVs in metres so the mesh density matches the other faces.
  const uv = sideGeo.attributes.uv;
  for (let i = 0; i < uv.count; i++) uv.setXY(i, uv.getX(i) / (w / 3), uv.getY(i) / h);
  for (const s of [-1, 1]) {
    const sideNet = new THREE.Mesh(sideGeo, netMat);
    sideNet.position.z = (s * w) / 2;
    g.add(sideNet);
  }
  g.position.x = side * HL;
  g.rotation.y = side > 0 ? Math.PI : 0;
  return g;
}

function tree(x, z, s = 1) {
  const g = new THREE.Group();
  const trunk = new THREE.Mesh(new THREE.CylinderGeometry(0.25 * s, 0.35 * s, 2.4 * s, 6), mat("#4a3426"));
  trunk.position.y = 1.2 * s;
  g.add(trunk);
  const leaf = mat(["#1f5a3a", "#24683f", "#1a4d33"][Math.floor(Math.random() * 3)], { flatShading: true });
  for (let i = 0; i < 3; i++) {
    const b = new THREE.Mesh(new THREE.IcosahedronGeometry((2.2 - i * 0.45) * s, 0), leaf);
    b.position.set((Math.random() - 0.5) * s, (3 + i * 1.3) * s, (Math.random() - 0.5) * s);
    b.castShadow = true;
    g.add(b);
  }
  g.position.set(x, 0, z);
  return g;
}

function lamp(glow, x, z) {
  const g = new THREE.Group();
  const pole = new THREE.Mesh(new THREE.CylinderGeometry(0.08, 0.12, 4, 6), mat("#20242c"));
  pole.position.y = 2;
  g.add(pole);
  g.add(box(0.5, 0.6, 0.5, new THREE.MeshBasicMaterial({ color: "#ffd88a" }), 0, 4.2, 0));
  const s = new THREE.Sprite(
    new THREE.SpriteMaterial({ map: glow, color: "#ffc66b", blending: THREE.AdditiveBlending, depthWrite: false, transparent: true, opacity: 0.8 }),
  );
  s.scale.setScalar(5);
  s.position.y = 4.2;
  g.add(s);
  g.position.set(x, 0, z);
  return g;
}

export function buildStadium(renderer, scene) {
  const glow = glowTexture();
  const root = new THREE.Group();
  scene.add(root);

  // Ground outside the stadium and the dark track around the apron.
  const ground = new THREE.Mesh(new THREE.PlaneGeometry(600, 600), mat("#0d2419"));
  ground.rotation.x = -Math.PI / 2;
  ground.position.y = -0.05;
  ground.receiveShadow = true;
  root.add(ground);
  const surround = new THREE.Mesh(new THREE.PlaneGeometry(PITCH.length + 2 * APRON + 8, PITCH.width + 2 * APRON + 6), mat("#1f5e2f"));
  surround.rotation.x = -Math.PI / 2;
  surround.position.y = -0.02;
  surround.receiveShadow = true;
  root.add(surround);

  const { texture, size } = pitchTexture(renderer);
  const pitch = new THREE.Mesh(
    new THREE.PlaneGeometry(size[0], size[1]),
    new THREE.MeshStandardMaterial({ map: texture, roughness: 0.92 }),
  );
  pitch.rotation.x = -Math.PI / 2;
  pitch.receiveShadow = true;
  root.add(pitch);

  // LED advertising board along the far touchline.
  const led = ledTexture(renderer, "BUILD  ·  SHIP  ·  IMPROVE");
  led.wrapS = THREE.RepeatWrapping;
  led.repeat.set(2, 1);
  const ledMat = new THREE.MeshBasicMaterial({ map: led });
  const board = new THREE.Mesh(new THREE.BoxGeometry(PITCH.length + 6, 1.4, 0.3), [mat("#0b1430"), mat("#0b1430"), mat("#0b1430"), mat("#0b1430"), ledMat, mat("#0b1430")]);
  board.position.set(0, 0.7, -HW - APRON + 1.4);
  root.add(board);
  for (const s of [-1, 1]) {
    const end = new THREE.Mesh(new THREE.BoxGeometry(PITCH.width + 4, 1.2, 0.3), [mat("#0b1430"), mat("#0b1430"), mat("#0b1430"), mat("#0b1430"), ledMat, mat("#0b1430")]);
    end.rotation.y = s * Math.PI / 2;
    end.position.set(-s * (HL + APRON - 0.4), 0.6, 0);
    root.add(end);
  }

  const far = stand(renderer, PITCH.length + 12, 24, 17, { crowdRows: 14 });
  far.position.set(0, 0, -HW - APRON - 0.5);
  root.add(far);
  for (const s of [-1, 1]) {
    const end = stand(renderer, PITCH.width + 12, 14, 9, { crowdRows: 8, roof: false });
    // Face the pitch: the stand's body (local -z) must extend outward, away from the goal.
    end.rotation.y = (-s * Math.PI) / 2;
    end.position.set(s * (HL + APRON + 0.5), 0, 0);
    root.add(end);
  }
  // Corner fill blocks between stands.
  for (const sx of [-1, 1])
    root.add(box(14, 12, 24, mat("#1b2231"), sx * (HL + APRON + 8), 6, -HW - APRON - 12));

  // Near side: low stone wall with lit banners, a plaza, trees and lamps.
  const stone = mat("#3a4254");
  const wallZ = HW + APRON + 1;
  root.add(box(PITCH.length + 2 * APRON + 30, 3.2, 1.6, stone, 0, 1.6, wallZ));
  root.add(box(PITCH.length + 2 * APRON + 30, 0.3, 2, mat("#596276"), 0, 3.3, wallZ));
  ["HK", "★", "HK", "★", "HK"].forEach((m, i) => {
    const map = bannerTexture(renderer, m);
    const b = new THREE.Mesh(
      new THREE.PlaneGeometry(1.6, 3.0),
      new THREE.MeshStandardMaterial({ map, roughness: 0.7, emissive: "#ffffff", emissiveMap: map, emissiveIntensity: 0.3 }),
    );
    b.position.set(-44 + i * 22, 1.6, wallZ + 0.82);
    root.add(b);
  });
  for (const s of [-1, 1]) {
    root.add(box(1.4, 6, 1.4, stone, s * 62, 3, wallZ));
  }
  const plaza = new THREE.Mesh(new THREE.PlaneGeometry(160, 26), mat("#262b35"));
  plaza.rotation.x = -Math.PI / 2;
  plaza.position.set(0, 0.01, wallZ + 14);
  plaza.receiveShadow = true;
  root.add(plaza);
  for (let x = -66; x <= 66; x += 22) root.add(lamp(glow, x + 11, wallZ + 4));
  for (let x = -80; x <= 80; x += 11) {
    root.add(tree(x + Math.random() * 3, wallZ + 18 + Math.random() * 6, 1 + Math.random() * 0.4));
  }
  for (let i = 0; i < 26; i++) {
    const side = i % 2 ? 1 : -1;
    root.add(tree(side * (90 + Math.random() * 25), -60 + i * 4.5, 1.2 + Math.random() * 0.5));
  }

  root.add(goal(netTexture(renderer), -1));
  root.add(goal(netTexture(renderer), 1));

  const center = new THREE.Vector3();
  for (const [x, z] of [
    [-HL - 18, -HW - 22],
    [HL + 18, -HW - 22],
    [-HL - 18, HW + 14],
    [HL + 18, HW + 14],
  ])
    root.add(floodlight(glow, x, z, 34, center));

  // Camera-flash sparkles scattered over the far stand.
  const flashes = [];
  for (let i = 0; i < 14; i++) {
    const s = new THREE.Sprite(
      new THREE.SpriteMaterial({ map: glow, color: "#ffffff", blending: THREE.AdditiveBlending, depthWrite: false, transparent: true, opacity: 0 }),
    );
    s.scale.setScalar(1.6);
    root.add(s);
    flashes.push({ sprite: s, t: Math.random() * 6 });
  }
  const placeFlash = (f) => {
    const k = Math.random();
    f.sprite.position.set((Math.random() - 0.5) * (PITCH.length + 8), 3 + k * 13, -HW - APRON - 2 - k * 21);
  };
  flashes.forEach(placeFlash);

  return {
    update(dt, animate) {
      if (!animate) return;
      led.offset.x = (led.offset.x + dt * 0.02) % 1;
      for (const f of flashes) {
        f.t -= dt;
        if (f.t < 0) {
          placeFlash(f);
          f.t = 1.5 + Math.random() * 5;
        }
        f.sprite.material.opacity = f.t < 0.12 ? f.t / 0.12 : 0;
      }
    },
  };
}
