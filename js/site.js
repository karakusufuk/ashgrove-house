// Shared behaviour for every page: icons, header logo line, inert demo actions, toast, reveal-on-enter.
import { paintIcons } from './icons.js';

export const $ = (s, r = document) => r.querySelector(s);
export const $$ = (s, r = document) => [...r.querySelectorAll(s)];
export const reducedMotion = () => matchMedia('(prefers-reduced-motion: reduce)').matches;

/* ---------- header logo line: draws itself on every page load ---------- */
export function drawLogo() {
  $$('.hdr .logo, .hero-logo').forEach(l => {
    l.classList.remove('draw');
    void l.offsetWidth;
    l.classList.add('draw');
  });
}

/* ---------- toast ---------- */
let toastEl;
export function toast(t) {
  toastEl ||= document.body.appendChild(Object.assign(document.createElement('div'), { className: 'toast', id: 'toast', role: 'status' }));
  toastEl.textContent = t;
  toastEl.classList.add('on');
  clearTimeout(toast.t);
  toast.t = setTimeout(() => toastEl.classList.remove('on'), 2300);
}

/* ---------- demo actions (2 Nov): phone, email, map, Evening tickets and any form submit do nothing at all ----------
   No pop-up, no message, no call or mail app. The final button of each booking flow is shown faded and inactive instead
   (stepper.js, drawer.js). */
document.addEventListener('click', e => {
  if (e.target.closest('[data-modal], [data-tix]')) e.preventDefault();
});
document.addEventListener('keydown', e => {
  if ((e.key === 'Enter' || e.key === ' ') && e.target.matches('[data-modal][role="button"]')) e.preventDefault();
});
document.addEventListener('submit', e => e.preventDefault());

/* ---------- reveal: images scale .92 → 1 when they enter the viewport; nothing waits invisible ---------- */
export function reveal() {
  $$('.reveal:not(.in)').forEach(e => { if (e.getBoundingClientRect().top < innerHeight * .92) e.classList.add('in'); });
}
let rk = 0;
const rq = () => { if (!rk) { rk = 1; requestAnimationFrame(() => { reveal(); rk = 0; }); } };
addEventListener('scroll', rq, { passive: true });
addEventListener('resize', rq);
addEventListener('load', rq);

/* ---------- photo panel swap: the new photo is decoded before it fades in, so the old one never shows through ---------- */
export function swapPh(a, b, front, src, alt) {
  const show = front === 'A' ? b : a, hide = front === 'A' ? a : b;
  if (hide.getAttribute('src') === src && +hide.style.opacity !== 0) return front;
  show.style.opacity = 0; show.src = src; show.alt = alt;
  (show.decode ? show.decode() : Promise.resolve()).catch(() => {}).then(() => {
    if (show.getAttribute('src') !== src) return;
    show.style.opacity = 1; hide.style.opacity = 0;
  });
  return front === 'A' ? 'B' : 'A';
}

/* ---------- fonts before the first paint ----------
   The page scripts are render-blocking, so waiting here (at most 1 s) means the first paint normally already uses Anton,
   Manrope and Outfit instead of painting in the fallback fonts and shifting when they arrive; on a slow connection the page
   paints with the fallbacks after a second and swaps, as the board does. */
if (document.fonts && document.fonts.load) {
  const sheet = document.querySelector('link[rel="stylesheet"][href*="fonts.googleapis"]');
  if (sheet && !sheet.sheet) await new Promise(r => { sheet.addEventListener('load', r, { once: true }); sheet.addEventListener('error', r, { once: true }); setTimeout(r, 800); });
  await Promise.race([
    Promise.all(['400 40px Anton', '400 16px Manrope', '600 16px Manrope', '700 16px Manrope', '800 16px Manrope', '600 16px Outfit'].map(f => document.fonts.load(f))).catch(() => {}),
    new Promise(r => setTimeout(r, 1000)),
  ]);
}

/* ---------- phone menu (≤ 640 px): the header pill hides, a menu button opens every page link ----------
   Built here so every page gets it without touching the page markup; on wider screens the button and panel never show. */
const PHONE = () => innerWidth <= 640;
function mobileNav() {
  const hdr = $('#hdr'), navg = hdr && $('.navg', hdr);
  if (!navg) return;
  const lh = $('.logo', hdr).getAttribute('href'), base = lh === './' ? '' : lh, pg = document.body.dataset.page;
  const L = [['weekends', 'Weekends'], ['rooms', 'Rooms'], ['spa', 'Spa'], ['restaurant', 'Restaurant'], ['corporate', 'Corporate'], ['contact', 'Contact']];
  const btn = Object.assign(document.createElement('button'), { className: 'mnav-btn', type: 'button', innerHTML: '<span></span><span></span>' });
  btn.setAttribute('aria-expanded', 'false'); btn.setAttribute('aria-controls', 'mnav'); btn.setAttribute('aria-label', 'Menu');
  navg.appendChild(btn);
  const p = Object.assign(document.createElement('div'), { className: 'mnav', id: 'mnav', hidden: true });
  p.innerHTML = `<nav aria-label="Menu"><ul>${L.map(([k, t]) => `<li><a href="${base}${k}/"${pg === k ? ' aria-current="page"' : ''}>${t}</a></li>`).join('')}</ul>
   <a class="btn btn-p" href="${base}rooms/">Book a room</a><p class="small">Seisiún weekends in a Georgian country house, Co. Kilkenny.</p></nav>`;
  hdr.after(p);
  const set = on => {
    if (on === !p.hidden) return;
    btn.setAttribute('aria-expanded', String(on)); btn.setAttribute('aria-label', on ? 'Close menu' : 'Menu');
    document.documentElement.classList.toggle('mnav-open', on);
    if (on) { p.hidden = false; void p.offsetWidth; p.classList.add('on'); $('a', p).focus({ preventScroll: true }); }
    else { p.classList.remove('on'); p.hidden = true; btn.focus({ preventScroll: true }); }
  };
  btn.addEventListener('click', () => set(p.hidden));
  p.addEventListener('click', e => { if (e.target === p || e.target.closest('a')) set(false); });
  addEventListener('keydown', e => {
    if (p.hidden) return;
    if (e.key === 'Escape') { e.preventDefault(); set(false); }
    else if (e.key === 'Tab') {             // focus stays in the menu (its links and the close button)
      const f = [btn, ...$$('a', p)], i = f.indexOf(document.activeElement);
      if (e.shiftKey && i <= 0) { e.preventDefault(); f[f.length - 1].focus(); }
      else if (!e.shiftKey && (i === f.length - 1 || i < 0)) { e.preventDefault(); f[0].focus(); }
    }
  });
  addEventListener('resize', () => { if (!PHONE()) set(false); });
}

/* ---------- boot ---------- */
mobileNav();
paintIcons();
reveal();
if (!document.documentElement.classList.contains('intro-on')) drawLogo();
