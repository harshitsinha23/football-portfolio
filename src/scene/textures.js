import * as THREE from "three";

export const PITCH = { length: 105, width: 68 };

function canvas(w, h) {
  const c = document.createElement("canvas");
  c.width = w;
  c.height = h;
  return [c, c.getContext("2d")];
}

function finish(c, renderer, { repeat, srgb = true } = {}) {
  const t = new THREE.CanvasTexture(c);
  if (srgb) t.colorSpace = THREE.SRGBColorSpace;
  t.anisotropy = renderer.capabilities.getMaxAnisotropy();
  if (repeat) {
    t.wrapS = t.wrapT = THREE.RepeatWrapping;
    t.repeat.set(...repeat);
  }
  return t;
}

// Striped pitch with regulation markings. 1 world metre = `s` pixels.
export function pitchTexture(renderer) {
  const s = 20,
    m = 6, // apron margin in metres drawn inside the texture
    L = PITCH.length,
    W = PITCH.width;
  const [c, g] = canvas((L + m * 2) * s, (W + m * 2) * s);
  const stripes = 22;
  const stripeW = c.width / stripes;
  for (let i = 0; i < stripes; i++) {
    g.fillStyle = i % 2 ? "#226b33" : "#2a7d3c";
    g.fillRect(i * stripeW, 0, stripeW + 1, c.height);
  }
  // Mowing grain and wear.
  const img = g.getImageData(0, 0, c.width, c.height);
  for (let i = 0; i < img.data.length; i += 4) {
    const n = (Math.random() - 0.5) * 14;
    img.data[i] += n;
    img.data[i + 1] += n * 1.2;
    img.data[i + 2] += n * 0.6;
  }
  g.putImageData(img, 0, 0);
  const vignette = g.createRadialGradient(
    c.width / 2,
    c.height / 2,
    c.height * 0.2,
    c.width / 2,
    c.height / 2,
    c.width * 0.62,
  );
  vignette.addColorStop(0, "#ffffff10");
  vignette.addColorStop(1, "#00000045");
  g.fillStyle = vignette;
  g.fillRect(0, 0, c.width, c.height);

  const X = (x) => (x + L / 2 + m) * s;
  const Y = (y) => (y + W / 2 + m) * s;
  g.strokeStyle = "#f4f7ee";
  g.fillStyle = "#f4f7ee";
  g.lineWidth = 0.14 * s;
  g.lineCap = "round";
  const rect = (x0, y0, x1, y1) =>
    g.strokeRect(X(x0), Y(y0), (x1 - x0) * s, (y1 - y0) * s);
  const arc = (x, y, r, a0 = 0, a1 = Math.PI * 2) => {
    g.beginPath();
    g.arc(X(x), Y(y), r * s, a0, a1);
    g.stroke();
  };
  const spot = (x, y) => {
    g.beginPath();
    g.arc(X(x), Y(y), 0.3 * s, 0, Math.PI * 2);
    g.fill();
  };
  rect(-L / 2, -W / 2, L / 2, W / 2);
  g.beginPath();
  g.moveTo(X(0), Y(-W / 2));
  g.lineTo(X(0), Y(W / 2));
  g.stroke();
  arc(0, 0, 9.15);
  spot(0, 0);
  for (const side of [-1, 1]) {
    const gx = (side * L) / 2;
    rect(Math.min(gx, gx - side * 16.5), -20.16, Math.max(gx, gx - side * 16.5), 20.16);
    rect(Math.min(gx, gx - side * 5.5), -9.16, Math.max(gx, gx - side * 5.5), 9.16);
    const px = gx - side * 11;
    spot(px, 0);
    const a = Math.acos(5.5 / 9.15);
    if (side < 0) arc(px, 0, 9.15, -a, a);
    else arc(px, 0, 9.15, Math.PI - a, Math.PI + a);
    for (const cy of [-W / 2, W / 2]) {
      const start = side < 0 ? (cy < 0 ? 0 : -Math.PI / 2) : cy < 0 ? Math.PI / 2 : Math.PI;
      arc(gx, cy, 1, start, start + Math.PI / 2);
    }
  }
  return {
    texture: finish(c, renderer),
    size: [L + m * 2, W + m * 2],
  };
}

export function ledTexture(renderer, text) {
  const [c, g] = canvas(2048, 128);
  const bg = g.createLinearGradient(0, 0, 0, 128);
  bg.addColorStop(0, "#0b1d4a");
  bg.addColorStop(1, "#06102e");
  g.fillStyle = bg;
  g.fillRect(0, 0, c.width, c.height);
  g.font = "italic 800 76px Manrope, 'DM Sans', sans-serif";
  g.textBaseline = "middle";
  g.shadowColor = "#5ea8ff";
  g.shadowBlur = 18;
  const unit = `${text}   `;
  const w = g.measureText(unit).width + 120;
  for (let x = 30; x < c.width; x += w) {
    g.fillStyle = "#e9f2ff";
    g.fillText(unit, x, 66);
    g.fillStyle = "#f2c35c";
    g.save();
    g.translate(x + w - 100, 64);
    g.transform(1, 0, -0.35, 1, 0, 0);
    g.fillRect(0, -26, 14, 52);
    g.fillRect(24, -26, 14, 52);
    g.restore();
  }
  // LED pixel grid.
  g.shadowBlur = 0;
  g.fillStyle = "#00000040";
  for (let x = 0; x < c.width; x += 6) g.fillRect(x, 0, 1.5, c.height);
  for (let y = 0; y < c.height; y += 6) g.fillRect(0, y, c.width, 1.5);
  return finish(c, renderer);
}

// Seated crowd: rows of small heads and shirts in team colours.
export function crowdTexture(renderer, rows = 12) {
  const [c, g] = canvas(1024, rows * 32);
  g.fillStyle = "#0e1726";
  g.fillRect(0, 0, c.width, c.height);
  const shirts = ["#1c3570", "#b8963f", "#8d99aa", "#22488f", "#6e2624", "#142245", "#3a4a66", "#1c3570"];
  const skins = ["#a07a60", "#8a6248", "#6a4630", "#b48d70"];
  for (let r = 0; r < rows; r++) {
    const y = r * 32;
    g.fillStyle = "#1b2638";
    g.fillRect(0, y + 26, c.width, 6);
    for (let x = 4; x < c.width; x += 12 + Math.random() * 3) {
      if (Math.random() < 0.08) continue;
      g.fillStyle = shirts[(Math.random() * shirts.length) | 0];
      g.fillRect(x, y + 13, 9, 13);
      g.fillStyle = skins[(Math.random() * skins.length) | 0];
      g.beginPath();
      g.arc(x + 4.5, y + 9, 4, 0, Math.PI * 2);
      g.fill();
    }
  }
  return finish(c, renderer, { repeat: [1, 1] });
}

export function numberTexture(renderer, number, active) {
  const [c, g] = canvas(128, 128);
  g.fillStyle = active ? "#f2c35c" : "#f4f6fb";
  g.font = "800 84px Manrope, 'DM Sans', sans-serif";
  g.textAlign = "center";
  g.textBaseline = "middle";
  g.fillText(String(number), 64, 70);
  const t = finish(c, renderer);
  t.premultiplyAlpha = false;
  return t;
}

export function bannerTexture(renderer, mark) {
  const [c, g] = canvas(256, 512);
  g.fillStyle = "#14275a";
  g.fillRect(0, 0, 256, 512);
  g.fillStyle = "#e3b955";
  g.fillRect(0, 0, 256, 18);
  g.fillRect(0, 494, 256, 18);
  g.strokeStyle = "#e3b955";
  g.lineWidth = 8;
  g.beginPath();
  g.moveTo(128, 120);
  g.lineTo(208, 160);
  g.lineTo(196, 300);
  g.lineTo(128, 360);
  g.lineTo(60, 300);
  g.lineTo(48, 160);
  g.closePath();
  g.stroke();
  g.fillStyle = "#e3b955";
  g.font = "italic 800 64px Manrope, 'DM Sans', sans-serif";
  g.textAlign = "center";
  g.textBaseline = "middle";
  g.fillText(mark, 128, 242);
  return finish(c, renderer);
}

export function glowTexture() {
  const [c, g] = canvas(128, 128);
  const r = g.createRadialGradient(64, 64, 0, 64, 64, 64);
  r.addColorStop(0, "#ffffffff");
  r.addColorStop(0.25, "#fff2c8aa");
  r.addColorStop(1, "#fff2c800");
  g.fillStyle = r;
  g.fillRect(0, 0, 128, 128);
  const t = new THREE.CanvasTexture(c);
  t.colorSpace = THREE.SRGBColorSpace;
  return t;
}

export function netTexture(renderer) {
  const [c, g] = canvas(256, 256);
  g.strokeStyle = "#ffffffcc";
  g.lineWidth = 3;
  for (let i = 0; i <= 256; i += 16) {
    g.beginPath();
    g.moveTo(i, 0);
    g.lineTo(i, 256);
    g.moveTo(0, i);
    g.lineTo(256, i);
    g.stroke();
  }
  return finish(c, renderer, { repeat: [3, 1] });
}

export function ballTexture(renderer) {
  const [c, g] = canvas(512, 256);
  g.fillStyle = "#f7f7f2";
  g.fillRect(0, 0, 512, 256);
  g.fillStyle = "#1a2230";
  const pent = (x, y, r) => {
    g.beginPath();
    for (let i = 0; i < 5; i++) {
      const a = -Math.PI / 2 + (i * Math.PI * 2) / 5;
      g.lineTo(x + Math.cos(a) * r, y + Math.sin(a) * r);
    }
    g.fill();
  };
  for (let i = 0; i < 5; i++) {
    pent(51 + i * 102, 64, 26);
    pent(102 + i * 102, 192, 26);
  }
  pent(256, 128, 22);
  return finish(c, renderer);
}
