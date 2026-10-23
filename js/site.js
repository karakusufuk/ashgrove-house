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

/* ---------- boot ---------- */
paintIcons();
reveal();
if (!document.documentElement.classList.contains('intro-on')) drawLogo();
