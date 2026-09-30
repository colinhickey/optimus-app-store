export const neuralinkSVG = `<svg class="neuralink-icon" viewBox="0 0 56 35" aria-hidden="true"><path fill="currentColor" fill-rule="evenodd" clip-rule="evenodd" d="M30.8777 22.4886H0.705078L22.5011 2.28693C24.3585 0.565492 27.0293 -0.000275522 29.47 0.809903C31.9102 1.62058 33.6439 3.6498 33.994 6.10498L37.476 30.5019C37.5803 31.2306 38.0767 31.8049 38.8036 32.0367C39.5305 32.2696 40.2868 32.0946 40.8255 31.572L50.1712 22.4886H39.4676L39.1096 20.2688H55.7051L42.4717 33.131C41.6499 33.9302 40.5593 34.3566 39.4367 34.3566C38.9823 34.3566 38.5221 34.2862 38.073 34.1429C36.5143 33.6455 35.4074 32.3656 35.1842 30.8031L31.7021 6.40672C31.4673 4.75921 30.3499 3.45166 28.7127 2.90802C27.0759 2.36337 25.3548 2.72899 24.108 3.88365L6.42923 20.2688H30.5522L30.8777 22.4886Z"></path></svg>`;

export const reducedMotion = () => matchMedia("(prefers-reduced-motion: reduce)").matches;

export const escapeHTML = (value = "") =>
  String(value).replace(/[&<>"']/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" })[c]);

export const isFree = (price) => /free/i.test(price);

export const priceLabel = (price) => (isFree(price) ? "Get" : price);

export const stars = (rating) => {
  const full = Math.round(rating);
  return `<span class="stars" aria-label="${rating} out of 5 stars">${"★".repeat(full)}<span>${"★".repeat(5 - full)}</span></span>`;
};

export const compactNumber = (n) => new Intl.NumberFormat(undefined, { notation: "compact" }).format(n);

// "6.4 TB" -> 6.4, "800 GB" -> 0.8
export const sizeInTB = (size = "") => parseFloat(size) * (/GB/i.test(size) ? 0.001 : 1) || 0;

let toastTimer;
export function toast(message) {
  const el = document.getElementById("toast");
  el.textContent = message;
  // Re-show so it stacks above any modal dialog opened since the last toast.
  if (el.matches(":popover-open")) el.hidePopover();
  el.showPopover();
  clearTimeout(toastTimer);
  toastTimer = setTimeout(() => el.hidePopover(), 3200);
}

// Sheets are native modal <dialog>s (focus trap, Escape, inert page for free) with
// an exit animation, backdrop click to close, and swipe-down to close on touch.
export function openSheet(dialog, { animate = true } = {}) {
  if (dialog.open) return;
  dialog.classList.toggle("no-anim", !animate);
  dialog.showModal();
  document.body.classList.add("modal-open");
}

export function closeSheet(dialog) {
  if (!dialog.open || dialog.classList.contains("closing")) return Promise.resolve();
  if (reducedMotion()) {
    dialog.close();
    return Promise.resolve();
  }
  dialog.classList.remove("no-anim");
  dialog.classList.add("closing");
  return new Promise((resolve) => {
    const done = () => {
      dialog.classList.remove("closing");
      dialog.style.transform = "";
      dialog.close();
      resolve();
    };
    dialog.addEventListener("animationend", done, { once: true });
    setTimeout(() => dialog.open && done(), 600); // in case animationend never fires
  });
}

// requestClose handles Escape, the close button and backdrop clicks (the detail sheet morphs back instead).
export function initSheet(dialog, scroller, requestClose = () => closeSheet(dialog)) {
  dialog.addEventListener("cancel", (event) => {
    event.preventDefault();
    requestClose();
  });
  dialog.addEventListener("close", () => {
    if (!document.querySelector("dialog.sheet[open]")) document.body.classList.remove("modal-open");
  });
  dialog.addEventListener("click", (event) => {
    if (event.target === dialog || event.target.closest(".sheet-close")) requestClose();
  });

  // Swipe down from the top of the sheet to dismiss it.
  let startY = null;
  let delta = 0;
  dialog.addEventListener("touchstart", (event) => {
    startY = scroller.scrollTop <= 0 ? event.touches[0].clientY : null;
    delta = 0;
  }, { passive: true });
  dialog.addEventListener("touchmove", (event) => {
    if (startY === null) return;
    delta = Math.max(0, event.touches[0].clientY - startY);
    if (delta > 0) {
      event.preventDefault();
      dialog.style.transition = "none";
      dialog.style.transform = `translateY(${delta}px)`;
    }
  }, { passive: false });
  dialog.addEventListener("touchend", () => {
    if (startY === null) return;
    startY = null;
    dialog.style.transition = "";
    if (delta > 110) closeSheet(dialog);
    else dialog.style.transform = "";
  });
}
