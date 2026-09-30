// Canvas neural network shaped like a brain. The intro flies the camera into it,
// then it settles behind the store as an ambient background.

const COLORS = ["180, 77, 255", "255, 59, 59", "77, 216, 255"]; // violet, red, cyan
const COLOR_WEIGHTS = [0.6, 0.15, 0.25];
const IMAGE_NODE_COUNT = 7;

const clamp = (v, min, max) => Math.min(max, Math.max(min, v));

function pickColor() {
  let r = Math.random();
  for (let i = 0; i < COLOR_WEIGHTS.length; i++) {
    if ((r -= COLOR_WEIGHTS[i]) <= 0) return i;
  }
  return 0;
}

// Pre-rendered soft glow sprites, one per colour; far cheaper than per-node gradients.
function makeSprite(rgb) {
  const size = 64;
  const sprite = document.createElement("canvas");
  sprite.width = sprite.height = size;
  const g = sprite.getContext("2d");
  const gradient = g.createRadialGradient(size / 2, size / 2, 0, size / 2, size / 2, size / 2);
  gradient.addColorStop(0, "rgba(255, 255, 255, 1)");
  gradient.addColorStop(0.12, `rgba(${rgb}, 0.9)`);
  gradient.addColorStop(0.4, `rgba(${rgb}, 0.25)`);
  gradient.addColorStop(1, `rgba(${rgb}, 0)`);
  g.fillStyle = gradient;
  g.fillRect(0, 0, size, size);
  return sprite;
}

export function createBrain(canvas) {
  const ctx = canvas.getContext("2d");
  const sprites = COLORS.map(makeSprite);
  const reducedMotion = matchMedia("(prefers-reduced-motion: reduce)").matches;
  const state = { camZ: 6000, opacity: 0, imageT: 0, activity: 1 };
  const nodes = [];
  const edges = [];
  const pulses = [];
  let imageNodes = [];
  let width = 0;
  let height = 0;
  let time = 0;
  let lastFrame = 0;
  let rafId = null;

  function build() {
    const count = window.innerWidth < 700 ? 170 : 280;
    for (let i = 0; i < count; i++) {
      const hemisphere = i % 2 ? 1 : -1;
      // Random direction on a sphere, pushed mostly to the surface to read as cortex.
      const u = Math.random() * 2 - 1;
      const theta = Math.random() * Math.PI * 2;
      const s = Math.sqrt(1 - u * u);
      const r = Math.random() < 0.75 ? 0.85 + Math.random() * 0.15 : Math.cbrt(Math.random()) * 0.85;
      let y = u * r * 180;
      if (y > 100) y *= 0.75; // flatter underside
      nodes.push({
        x: hemisphere * (14 + Math.abs(s * Math.cos(theta)) * r * 190),
        y,
        z: s * Math.sin(theta) * r * 250,
        color: pickColor(),
        glow: 0,
        neighbors: [],
      });
    }

    // Connect each node to its three nearest neighbours.
    const seen = new Set();
    nodes.forEach((a, i) => {
      const nearest = nodes
        .map((b, j) => ({ j, d: (a.x - b.x) ** 2 + (a.y - b.y) ** 2 + (a.z - b.z) ** 2 }))
        .filter((n) => n.j !== i)
        .sort((m, n) => m.d - n.d)
        .slice(0, 3);
      nearest.forEach(({ j }) => {
        const key = i < j ? `${i}-${j}` : `${j}-${i}`;
        if (seen.has(key)) return;
        seen.add(key);
        edges.push([i, j]);
        a.neighbors.push(j);
        nodes[j].neighbors.push(i);
      });
    });
  }

  function resize() {
    const dpr = Math.min(window.devicePixelRatio || 1, 2);
    width = canvas.clientWidth;
    height = canvas.clientHeight;
    canvas.width = Math.round(width * dpr);
    canvas.height = Math.round(height * dpr);
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    if (!rafId) draw();
  }

  function spawnPulse(from, to) {
    const a = from ?? Math.floor(Math.random() * nodes.length);
    const neighbors = nodes[a].neighbors;
    if (!neighbors.length) return;
    const b = to ?? neighbors[Math.floor(Math.random() * neighbors.length)];
    pulses.push({ a, b, t: 0, speed: 1.2 + Math.random() * 1.6, color: nodes[a].color });
  }

  function update(dt) {
    time += dt;
    const spawnCount = Math.floor(dt * 40 * state.activity + Math.random());
    for (let i = 0; i < spawnCount && pulses.length < 140 * state.activity; i++) spawnPulse();

    for (let i = pulses.length - 1; i >= 0; i--) {
      const pulse = pulses[i];
      pulse.t += dt * pulse.speed;
      if (pulse.t >= 1) {
        pulses.splice(i, 1);
        const target = nodes[pulse.b];
        target.glow = 1;
        // Signals propagate: most pulses fire onward to a new neighbour.
        if (Math.random() < 0.65 && pulses.length < 140 * state.activity) {
          const next = target.neighbors.filter((n) => n !== pulse.a);
          if (next.length) spawnPulse(pulse.b, next[Math.floor(Math.random() * next.length)]);
        }
      }
    }
    nodes.forEach((n) => (n.glow = Math.max(0, n.glow - dt * 1.5)));
  }

  function project() {
    const focal = Math.min(width, height) * 1.1;
    const yaw = Math.sin(time * 0.15) * 0.6;
    const pitch = 0.18;
    const cy = Math.cos(yaw), sy = Math.sin(yaw);
    const cp = Math.cos(pitch), sp = Math.sin(pitch);

    for (const n of nodes) {
      const x = n.x * cy - n.z * sy;
      const z1 = n.x * sy + n.z * cy;
      const y = n.y * cp - z1 * sp;
      const z = n.y * sp + z1 * cp;
      const zc = z + state.camZ;
      n.visible = zc > 20;
      if (!n.visible) continue;
      n.scale = focal / zc;
      n.sx = width / 2 + x * n.scale;
      n.sy = height / 2 + y * n.scale;
      n.near = clamp(1 - (z + 260) / 520, 0, 1); // 1 = front of brain
    }
  }

  function draw() {
    ctx.clearRect(0, 0, width, height);
    if (state.opacity <= 0.001) return;
    project();
    ctx.globalCompositeOperation = "lighter";

    // Edges, batched into depth buckets so each bucket is a single stroke.
    const buckets = [[], [], []];
    for (const [i, j] of edges) {
      const a = nodes[i], b = nodes[j];
      if (!a.visible || !b.visible) continue;
      buckets[Math.min(2, Math.floor(((a.near + b.near) / 2) * 3))].push(a, b);
    }
    buckets.forEach((points, depth) => {
      if (!points.length) return;
      ctx.beginPath();
      for (let k = 0; k < points.length; k += 2) {
        ctx.moveTo(points[k].sx, points[k].sy);
        ctx.lineTo(points[k + 1].sx, points[k + 1].sy);
      }
      ctx.strokeStyle = `rgba(160, 120, 255, ${0.06 + depth * 0.07})`;
      ctx.lineWidth = clamp(points[0].scale * 0.9, 0.5, 2);
      ctx.stroke();
    });

    for (const n of nodes) {
      if (!n.visible) continue;
      const radius = clamp(n.scale * 9, 2, 40) * (1 + n.glow * 1.4);
      ctx.globalAlpha = clamp(0.25 + n.near * 0.45 + n.glow * 0.6, 0, 1);
      ctx.drawImage(sprites[n.color], n.sx - radius, n.sy - radius, radius * 2, radius * 2);
    }

    for (const p of pulses) {
      const a = nodes[p.a], b = nodes[p.b];
      if (!a.visible || !b.visible) continue;
      const x = a.sx + (b.sx - a.sx) * p.t;
      const y = a.sy + (b.sy - a.sy) * p.t;
      const radius = clamp(a.scale * 14, 3, 50);
      ctx.globalAlpha = 1;
      ctx.drawImage(sprites[p.color], x - radius, y - radius, radius * 2, radius * 2);
    }

    // App thumbnails surfacing as "skill" nodes.
    ctx.globalCompositeOperation = "source-over";
    if (state.imageT > 0.001) {
      for (const { node, img } of imageNodes) {
        if (!node.visible || !img.complete || node.near < 0.35) continue;
        const radius = clamp(node.scale * 26, 0, 90) * state.imageT;
        if (radius < 2) continue;
        ctx.globalAlpha = state.imageT * clamp(node.near * 1.4, 0, 1);
        ctx.save();
        ctx.beginPath();
        ctx.arc(node.sx, node.sy, radius, 0, Math.PI * 2);
        ctx.clip();
        ctx.drawImage(img, node.sx - radius, node.sy - radius, radius * 2, radius * 2);
        ctx.restore();
        ctx.beginPath();
        ctx.arc(node.sx, node.sy, radius, 0, Math.PI * 2);
        ctx.strokeStyle = `rgba(${COLORS[0]}, 0.9)`;
        ctx.lineWidth = 1.5;
        ctx.stroke();
      }
    }
    ctx.globalAlpha = 1;
  }

  function frame(now) {
    const dt = Math.min(0.05, (now - lastFrame) / 1000 || 0);
    lastFrame = now;
    update(dt);
    draw();
    rafId = requestAnimationFrame(frame);
  }

  function start() {
    if (rafId || reducedMotion || document.hidden) return;
    lastFrame = performance.now();
    rafId = requestAnimationFrame(frame);
  }

  function stop() {
    cancelAnimationFrame(rafId);
    rafId = null;
  }

  function setState(next) {
    Object.assign(state, next);
    canvas.style.opacity = state.opacity;
    if (state.opacity > 0.001) start();
    else stop();
    if (!rafId) draw();
  }

  // Attach thumbnails to front-facing nodes spread around the centre of view.
  function setImages(urls) {
    const front = nodes
      .filter((node) => node.z < -60 && Math.abs(node.y) < 120 && Math.abs(node.x) > 30 && Math.abs(node.x) < 170)
      .sort((a, b) => Math.atan2(a.y, a.x) - Math.atan2(b.y, b.x));
    imageNodes = urls.slice(0, Math.min(IMAGE_NODE_COUNT, front.length)).map((url, i, list) => {
      const img = new Image();
      img.src = url;
      return { node: front[Math.floor((i / list.length) * front.length)], img };
    });
  }

  build();
  resize();
  window.addEventListener("resize", resize);
  document.addEventListener("visibilitychange", () => {
    if (document.hidden) stop();
    else if (state.opacity > 0.001) start();
  });

  return { setState, setImages, getState: () => ({ ...state }) };
}
