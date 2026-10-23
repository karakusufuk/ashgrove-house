// Paced scrolling: one gesture = one step, on the homepage story and on every brochure band (SPEC §5).
// A trackpad keeps sending fading "momentum" wheel events for a second or more after a swipe. A new swipe shows up as the
// deltas rising again; a mouse notch shows up as a fresh event after a pause. Each recognised gesture moves exactly one step,
// and the rest of that gesture is swallowed, so a hard flick never skips ahead or runs on to the bottom of the page.
import { reducedMotion } from './site.js';

export const absY = el => el.getBoundingClientRect().top + scrollY;
const WG = { t: 0, h: [], armed: false, absorb: false, until: 0, pend: 0, host: null, raf: 0 };
const hosts = [];
let guard = () => false;

// host = { el, n, pos(i) → absolute y of step i, enabled() → bool, down() → {y, host}, up() → {y, host} }
export function registerHost(h) { hosts.push(h); }
// a page can keep the wheel for itself (the rooms drawer): guard(e) → true means "not paced now"
export function setGuard(fn) { guard = fn; }

export function newGesture(e) {
  const now = performance.now(), d = Math.abs(e.deltaY) * (e.deltaMode === 1 ? 16 : e.deltaMode === 2 ? innerHeight : 1), gap = now - WG.t;
  WG.t = now;
  if (gap > 220) { WG.h = [d]; WG.armed = false; return true; }
  const h = WG.h; h.push(d); if (h.length > 12) h.shift(); if (h.length < 6) return false;
  const L = h.length, nw = (h[L - 1] + h[L - 2] + h[L - 3]) / 3, od = (h[L - 4] + h[L - 5] + h[L - 6]) / 3;
  if (nw < od * .85) WG.armed = true;
  if (WG.armed && nw > od * 1.4 && nw > 4) { WG.armed = false; return true; }
  return false;
}
function hostAt() {
  const y = scrollY;
  for (const h of hosts) {
    if (h.enabled && !h.enabled()) continue;
    const S = absY(h.el), E = S + h.el.offsetHeight - innerHeight;
    if (y >= S - 2 && y <= E + 2) return h;
  }
  return null;
}
const ease = t => t < .5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2;
export function glide(y, host) {
  cancelAnimationFrame(WG.raf); WG.host = host; WG.absorb = true;
  const y0 = scrollY, dy = Math.round(y) - y0, dur = Math.min(1000, Math.max(520, Math.abs(dy) * .75)), t0 = performance.now();
  WG.until = t0 + dur + 40;
  (function f() { const k = Math.min(1, (performance.now() - t0) / dur); scrollTo(0, y0 + dy * ease(k)); if (k < 1) WG.raf = requestAnimationFrame(f); else afterGlide(); })();
}
// a gesture that arrived during a glide is done right after it (at most one is queued)
function afterGlide() { if (!WG.pend) return; const d = WG.pend; WG.pend = 0; const h = hostAt(); if (h && h.el === WG.host) stepBy(h, d); }
function nearest(h) { let k = 0, b = 1e9; for (let i = 0; i < h.n; i++) { const d = Math.abs(h.pos(i) - scrollY); if (d < b) { b = d; k = i; } } return k; }
function stepBy(h, dir) { const t = nearest(h) + dir; if (t >= 0 && t < h.n) glide(h.pos(t), h.el); else { const x = dir > 0 ? h.down() : h.up(); glide(x.y, x.host); } }
export function paced(e, dir, fresh) {
  const now = performance.now();
  if (WG.absorb) { if (!fresh || now < WG.until) { e.preventDefault(); if (fresh) WG.pend = dir; return; } WG.absorb = false; }
  const h = hostAt();
  if (!h) {
    WG.host = null;
    // right after leaving a host downwards, the first upward gesture goes straight back to its last step
    if (fresh && dir < 0) for (const r of hosts) {
      if (r.enabled && !r.enabled()) continue;
      const x = absY(r.el) + r.el.offsetHeight;
      if (scrollY >= x - 2 && scrollY <= x + 40) { e.preventDefault(); glide(r.pos(r.n - 1), r.el); return; }
    }
    return;
  }
  e.preventDefault();
  if (WG.host !== h.el) { glide(h.pos(nearest(h)), h.el); return; }   // entering a host: snap to the nearest step
  if (fresh) stepBy(h, dir);
}
if (!reducedMotion()) {
  addEventListener('wheel', e => { if (e.ctrlKey || !e.deltaY) return; if (guard(e)) return; paced(e, Math.sign(e.deltaY), newGesture(e)); }, { passive: false });
  addEventListener('keydown', e => {
    const k = { ArrowDown: 1, PageDown: 1, ' ': 1, ArrowUp: -1, PageUp: -1 }[e.key];
    if (k && !e.target.closest('input,textarea,select,button')) { WG.t = 0; paced(e, k, true); }
  });
}
