// Shared behaviour for every page: icons, header logo line, concept modal, toast, reveal-on-enter.
import { paintIcons } from './icons.js';

export const $ = (s, r = document) => r.querySelector(s);
export const $$ = (s, r = document) => [...r.querySelectorAll(s)];
export const reducedMotion = () => matchMedia('(prefers-reduced-motion: reduce)').matches;

/* ---------- header logo line: draws itself on every page load ---------- */
export function drawLogo() {
  const l = $('.hdr .logo');
  if (!l) return;
  l.classList.remove('draw');
  void l.offsetWidth;
  l.classList.add('draw');
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

/* ---------- concept modal ---------- */
const MT = {
  call: 'In a live build, this would call the house.',
  email: 'In a live build, this would open a new email to the house.',
  map: 'In a live build, this would open directions to Ashgrove House.',
  book: 'In a live build, this would send your request to the house and email you a confirmation.',
  reserve: 'In a live build, this would take you to the booking summary to confirm and pay.',
};
let modalEl, returnFocus;
function buildModal() {
  modalEl = document.createElement('div');
  modalEl.className = 'modal';
  modalEl.id = 'modal';
  modalEl.hidden = true;
  modalEl.innerHTML = '<div class="modal-in" role="dialog" aria-modal="true" aria-labelledby="mtitle" aria-describedby="mtxt"><button class="x" id="mx" type="button" aria-label="Close">×</button><h3 id="mtitle">Concept site by Ufuk Karakuş</h3><p id="mtxt"></p><a href="#" id="mlink">See how it works →</a></div>';
  document.body.appendChild(modalEl);
  $('#mx', modalEl).addEventListener('click', closeModal);
  modalEl.addEventListener('click', e => { if (e.target === modalEl) closeModal(); });
  $('#mlink', modalEl).addEventListener('click', e => e.preventDefault());
}
export const modalOpen = () => !!modalEl && !modalEl.hidden;
export function modal(k) {
  if (!modalEl) buildModal();
  returnFocus = document.activeElement;
  $('#mtxt', modalEl).textContent = MT[k] || MT.book;
  modalEl.hidden = false;
  $('#mx', modalEl).focus();
}
export function closeModal() {
  if (!modalOpen()) return;
  modalEl.hidden = true;
  if (returnFocus && returnFocus.focus && document.contains(returnFocus)) returnFocus.focus();
  returnFocus = null;
}
// Esc closes the modal; Tab stays inside it while it is open
addEventListener('keydown', e => {
  if (!modalOpen()) return;
  if (e.key === 'Escape') { e.preventDefault(); e.stopImmediatePropagation(); closeModal(); }
  else if (e.key === 'Tab') {
    const f = $$('button, a[href]', modalEl);
    const first = f[0], last = f[f.length - 1];
    if (e.shiftKey && document.activeElement === first) { e.preventDefault(); last.focus(); }
    else if (!e.shiftKey && document.activeElement === last) { e.preventDefault(); first.focus(); }
    else if (!modalEl.contains(document.activeElement)) { e.preventDefault(); first.focus(); }
  }
}, true);

// phone / email / map / Reserve / Evening tickets / any form submit never do the real thing
document.addEventListener('click', e => {
  const m = e.target.closest('[data-modal]');
  if (m) { e.preventDefault(); modal(m.dataset.modal); return; }
  if (e.target.closest('[data-tix]')) { e.preventDefault(); modal('reserve'); }
});
document.addEventListener('keydown', e => {
  if ((e.key === 'Enter' || e.key === ' ') && e.target.matches('[data-modal][role="button"]')) { e.preventDefault(); modal(e.target.dataset.modal); }
});
document.addEventListener('submit', e => { e.preventDefault(); modal('book'); });

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
