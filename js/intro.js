// Scroll-scrubbed intro: push in on Optimus, pass through the black visor,
// fly into a neural network, then hand off to the store.
import { appsPromise } from "./data.js";

// Visor geometry is measured as fractions of the image (centre x/y, width/height).
// maxZoom is capped by image resolution so the photo never visibly pixelates;
// the iris vignette closes in to cover whatever the zoom can't.
// Add a portrait entry with `media: "(max-aspect-ratio: 3/4)"` once that image exists.
const HERO_SOURCES = [
  {
    src: "images/homepage.jpg", // placeholder until images/hero-optimus.jpg is generated
    width: 1080,
    height: 721,
    visor: { x: 0.492, y: 0.264, w: 0.139, h: 0.284 },
    maxZoom: 4.5,
  },
];

const BOOT_LINES = [
  "> N1 link established",
  "> Mounting motor cortex ............ OK",
  "> Indexing skill modules ........... {count} found",
  "> Welcome to the Optimus App Store",
];

const STATUSES = [
  [0.04, "Standby"],
  [0.45, "Acquiring target"],
  [0.6, "Breaching visor"],
  [0.84, "Syncing"],
  [1.01, "Linked"],
];

const SEEN_KEY = "optimus-intro-seen";

const clamp = (v, min = 0, max = 1) => Math.min(max, Math.max(min, v));
const lerp = (a, b, t) => a + (b - a) * t;
const seg = (p, start, end) => clamp((p - start) / (end - start));
// Rises over [a, b], holds, falls over [c, d].
const bell = (p, a, b, c, d) => seg(p, a, b) * (1 - seg(p, c, d));

export function initIntro(brain) {
  const intro = document.getElementById("intro");
  const stage = intro.querySelector(".intro-stage");
  const hero = document.getElementById("hero");
  const heroImage = document.getElementById("hero-image");
  const glint = document.getElementById("visor-glint");
  const hud = document.getElementById("hud");
  const hudSlots = document.getElementById("hud-slots");
  const iris = document.getElementById("iris");
  const flash = document.getElementById("flash");
  const scrim = document.getElementById("scrim");
  const title = document.getElementById("intro-title");
  const boot = document.getElementById("boot");
  const meter = document.getElementById("link-meter");
  const meterFill = document.getElementById("meter-fill");
  const meterValue = document.getElementById("meter-value");
  const meterStatus = document.getElementById("meter-status");
  const cue = document.getElementById("scroll-cue");
  const skip = document.getElementById("skip-intro");
  const header = document.getElementById("header");
  const logo = document.getElementById("logo");
  const reducedMotion = matchMedia("(prefers-reduced-motion: reduce)").matches;

  const source = HERO_SOURCES.find((s) => !s.media || matchMedia(s.media).matches);
  heroImage.src = source.src;

  const easeIn = gsap.parseEase("power2.in");
  const easeInOut = gsap.parseEase("power2.inOut");
  const easeOut = gsap.parseEase("power3.out");

  let layout;
  let bootLines = BOOT_LINES.map((line) => line.replace("{count}", "…"));
  let current = 0;

  appsPromise.then((apps) => {
    bootLines = BOOT_LINES.map((line) => line.replace("{count}", apps.length));
    hudSlots.textContent = apps.length;
    brain.setImages(apps.slice(0, 7).map((app) => `images/${app.image}`));
    render(current);
  });

  // Fit the hero like object-fit: cover, positioned so the visor sits in the upper-middle of the screen.
  // The image edges are feathered to black, so it may drop below the top edge to make headroom for the title.
  function measure() {
    const vw = stage.clientWidth;
    const vh = stage.clientHeight;
    const scale = Math.max(vw / source.width, vh / source.height);
    const w = source.width * scale;
    const h = source.height * scale;
    const left = clamp(vw / 2 - source.visor.x * w, vw - w, 0);
    const top = clamp(vh * 0.42 - source.visor.y * h, vh - h, vh * 0.2);
    const coverZoom = (vh * 1.05) / (source.visor.h * h);
    hero.style.width = `${w}px`;
    hero.style.height = `${h}px`;
    layout = { vw, vh, w, h, left, top, zoom: clamp(coverZoom, 1.5, source.maxZoom) };
  }

  function render(p) {
    current = p;
    const { vw, vh, w, h, left, top, zoom } = layout;
    const { visor } = source;

    // Camera push: exponential zoom feels uniform, easing makes it accelerate into the visor.
    const z = Math.pow(zoom, easeIn(seg(p, 0.04, 0.56)));
    const centre = easeInOut(seg(p, 0.04, 0.5));
    const cx = lerp(left + visor.x * w, vw / 2, centre);
    const cy = lerp(top + visor.y * h, vh / 2, centre);
    const x = cx - visor.x * w * z;
    const y = cy - visor.y * h * z;
    hero.style.transform = `translate3d(${x}px, ${y}px, 0) scale(${z})`;
    hero.style.opacity = 1 - seg(p, 0.54, 0.6);

    // On-screen visor half-size, used to pin the glint, HUD and iris to it.
    const rx = (visor.w * w * z) / 2;
    const ry = (visor.h * h * z) / 2;

    glint.style.cssText = `left:${cx - rx}px;top:${cy - ry}px;width:${rx * 2}px;height:${ry * 2}px;` +
      `opacity:${bell(p, 0.12, 0.18, 0.42, 0.5)};--sweep:${lerp(-120, 120, seg(p, 0.14, 0.4))}%`;

    const hudHalfWidth = Math.min(rx * 1.9, vw / 2 - 16);
    hud.style.cssText = `left:${cx - hudHalfWidth}px;top:${cy - ry * 1.35}px;width:${hudHalfWidth * 2}px;height:${ry * 2.7}px;` +
      `opacity:${bell(p, 0.1, 0.18, 0.34, 0.44)}`;
    hud.classList.toggle("locked", p > 0.2);

    const k = lerp(7, 0.95, easeInOut(seg(p, 0.16, 0.55)));
    iris.style.opacity = seg(p, 0.12, 0.24);
    iris.style.background = `radial-gradient(ellipse ${rx * k}px ${ry * k}px at ${cx}px ${cy}px, transparent 0%, transparent 65%, #000 100%)`;

    flash.style.opacity = bell(p, 0.55, 0.585, 0.59, 0.66) * 0.6;

    // Inside the mind: fly in fast, then pull back to a calm background for the store.
    const inside = easeOut(seg(p, 0.56, 0.9));
    const camZ = p < 0.9
      ? Math.exp(lerp(Math.log(6000), Math.log(380), inside))
      : lerp(380, 1150, easeInOut(seg(p, 0.9, 1)));
    brain.setState({
      camZ,
      opacity: seg(p, 0.56, 0.64) * lerp(1, 0.35, seg(p, 0.92, 1)),
      imageT: bell(p, 0.66, 0.74, 0.86, 0.92),
    });

    title.style.opacity = 1 - seg(p, 0, 0.1);
    title.style.setProperty("--shift", `${-seg(p, 0, 0.12) * 60}px`);
    title.style.setProperty("--scale", 1 + seg(p, 0, 0.12) * 0.08);

    // Boot log types out line by line.
    const typed = seg(p, 0.6, 0.84) * bootLines.length;
    boot.textContent = bootLines
      .map((line, i) => line.slice(0, Math.round(clamp(typed - i) * line.length)))
      .filter(Boolean)
      .join("\n");
    boot.style.opacity = 1 - seg(p, 0.87, 0.91);

    // The store starts rising over the stage at ~0.9, so the HUD clears out first.
    const percent = Math.round(seg(p, 0, 0.86) * 100);
    meterFill.style.transform = `scaleX(${percent / 100})`;
    meterValue.textContent = `${percent}%`;
    meterStatus.textContent = STATUSES.find(([limit]) => p < limit)[1];
    meter.style.opacity = 1 - seg(p, 0.87, 0.9);

    scrim.style.opacity = 1 - seg(p, 0.35, 0.5);
    cue.style.opacity = 1 - seg(p, 0, 0.04);
    cue.style.pointerEvents = p > 0.02 ? "none" : "";
    skip.classList.toggle("gone", p > 0.88);
    header.classList.toggle("show", p > 0.88);

    if (p >= 0.999) {
      try { sessionStorage.setItem(SEEN_KEY, "1"); } catch {}
    }
  }

  measure();

  if (reducedMotion) {
    intro.classList.add("reduced");
    render(0);
    brain.setState({ camZ: 1150, opacity: 0.35, imageT: 0 });
    header.classList.add("show");
    cue.addEventListener("click", () => document.getElementById("store").scrollIntoView());
    skip.addEventListener("click", () => document.getElementById("store").scrollIntoView());
    window.addEventListener("resize", () => { measure(); render(0); });
    return;
  }

  gsap.registerPlugin(ScrollTrigger, ScrollToPlugin);
  ScrollTrigger.config({ ignoreMobileResize: true });

  // The stage is CSS-sticky; ScrollTrigger just supplies smoothed progress through the tall section.
  const progress = { value: 0 };
  const tween = gsap.to(progress, {
    value: 1,
    ease: "none",
    onUpdate: () => render(progress.value),
    scrollTrigger: {
      trigger: intro,
      start: "top top",
      end: "bottom bottom",
      scrub: 0.7,
      onRefresh: () => { measure(); render(progress.value); },
    },
  });
  const introEnd = () => tween.scrollTrigger.end;

  function playTo(y, duration) {
    gsap.to(window, { scrollTo: { y, autoKill: true }, duration, ease: "power1.inOut" });
  }

  cue.addEventListener("click", () => playTo(introEnd(), 7));
  skip.addEventListener("click", () => playTo(introEnd(), 1.6));
  logo.addEventListener("click", (event) => {
    event.preventDefault();
    playTo(0, 2.5);
  });

  // Nudge the scroll cue if the visitor hasn't moved after a few seconds.
  const nudge = setTimeout(() => cue.classList.add("nudge"), 3500);
  window.addEventListener("scroll", () => clearTimeout(nudge), { once: true, passive: true });

  // Returning in the same session: jump straight to the store.
  let seen = false;
  try { seen = sessionStorage.getItem(SEEN_KEY) === "1"; } catch {}
  // Wait for ScrollTrigger's initial refresh on load, which would otherwise reset the scroll position.
  const store = document.getElementById("store");
  const storeTop = () => store.getBoundingClientRect().top + window.scrollY - header.offsetHeight;
  if (seen && window.scrollY < storeTop()) {
    ScrollTrigger.clearScrollMemory("manual");
    tween.progress(1);
    ScrollTrigger.addEventListener("refresh", function jumpToStore() {
      ScrollTrigger.removeEventListener("refresh", jumpToStore);
      window.scrollTo(0, storeTop());
    });
  }
  render(progress.value);
}
