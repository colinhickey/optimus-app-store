import { reducedMotion } from "./ui.js";

const clamp = (v, min = 0, max = 1) => Math.min(max, Math.max(min, v));
const lerp = (a, b, t) => a + (b - a) * t;

// App Store-style download: the button fills a progress ring, then settles as installed.
export function runOptimusInstall(button) {
  const label = button.querySelector(".install-label");
  const duration = reducedMotion() ? 600 : 2400;
  button.dataset.state = "installing";
  button.setAttribute("aria-busy", "true");

  return new Promise((resolve) => {
    const start = performance.now();
    const tick = (now) => {
      // Races to 85%, then crawls to the finish, like every real download.
      const t = clamp((now - start) / duration);
      const progress = t < 0.75
        ? (1 - Math.pow(1 - t / 0.75, 2)) * 0.85
        : 0.85 + ((t - 0.75) / 0.25) * 0.15;
      button.style.setProperty("--progress", progress);
      label.textContent = `Installing ${Math.round(progress * 100)}%`;
      if (t < 1) requestAnimationFrame(tick);
      else {
        button.removeAttribute("aria-busy");
        resolve();
      }
    };
    requestAnimationFrame(tick);
  });
}

const STEPS = [
  [0, "Pairing with N1 implant…"],
  [0.16, "Handshake OK · 1,024 channels"],
  [0.34, "Uploading {name} motor patterns…"],
  [0.6, "Rewiring cortex · please do not blink"],
  [0.84, "Verifying synapses…"],
];

// Full-screen upload: the intro's brain canvas is moved into a top-layer dialog and flown into.
export function runNeuralUpload({ app, brain, restoreImages }) {
  const overlay = document.getElementById("neural-overlay");
  const canvas = document.getElementById("brain");
  const title = document.getElementById("neural-title");
  const step = document.getElementById("neural-step");
  const fill = document.getElementById("neural-fill");
  const percent = document.getElementById("neural-percent");
  const previous = brain.getState();
  const quick = reducedMotion();

  title.textContent = app.name;
  overlay.classList.remove("complete", "closing");
  overlay.showModal();
  overlay.prepend(canvas);
  brain.setImages(Array(7).fill(`images/${app.image}`));

  return new Promise((resolve) => {
    const progress = { p: 0 };
    gsap.to(progress, {
      p: 1,
      duration: quick ? 1.5 : 6.5,
      ease: "power1.inOut",
      onUpdate() {
        const { p } = progress;
        fill.style.transform = `scaleX(${p})`;
        percent.textContent = `${Math.round(p * 100)}%`;
        step.textContent = STEPS.filter(([at]) => p >= at).at(-1)[1].replace("{name}", app.name);
        brain.setState({
          opacity: 1,
          camZ: Math.exp(lerp(Math.log(1500), Math.log(380), gsap.parseEase("power1.inOut")(p))),
          imageT: clamp((p - 0.3) / 0.3),
          activity: 1 + p * 4,
        });
      },
      onComplete() {
        navigator.vibrate?.([40, 60, 40, 60, 160]);
        step.textContent = `Installed. You can now ${app.neuralSkill ?? "do something new"}.`;
        overlay.classList.add("complete");
        setTimeout(() => {
          overlay.classList.add("closing");
          setTimeout(() => {
            document.body.prepend(canvas);
            brain.setState(previous);
            restoreImages();
            overlay.close();
            resolve();
          }, quick ? 0 : 500);
        }, 2600);
      },
    });
  });
}

// The upload can't be cancelled with Escape once it's started.
export function initNeuralOverlay() {
  document.getElementById("neural-overlay").addEventListener("cancel", (event) => event.preventDefault());
}
