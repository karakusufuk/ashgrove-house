// The room drawer: the booking summary with a live total. Opens from the plan in the right column, sticky from the
// heading's top line to the bottom of the screen; the wheel scrolls it first while it is on screen.
import { $, $$, modal, modalOpen } from './site.js';
import { ico } from './icons.js';
import { roomById, TYP, FEATS, TR, W, rng, DOW, MON, eur, quote, ticketsAvailable, DIM } from './data.js';
import { selection, taken, onDates, setOpenRoom, flashStrip } from './rooms.js';
import { setGuard } from './paced.js';

const STICK = 170;
let open = null, ex = {};
const stage = $('#stage'), drIn = $('#drIn');

export function openDr(id) {
  if (open !== id) ex = { g: 2, sw: 0, hs: 0, fa: 0, cp: 0, tx: 0 };
  open = id;
  $$('.rm').forEach(b => b.classList.toggle('sel', b.dataset.id === id));
  stage.classList.add('open');
  $('#tip').classList.remove('on');
  drawDr();
  drIn.scrollTop = 0;                                      // every opening starts at the photo
  fitDr();
  if (innerWidth > 900) {                                  // opened while its start is above the sticky line: glide so it sits under the strip
    const t = stage.getBoundingClientRect().top + parseFloat(stage.style.getPropertyValue('--drOff') || 0);
    if (t < STICK - 1) scrollBy({ top: t - STICK, behavior: 'smooth' });
  }
}
export function closeDr() {
  if (!open) return;
  open = null;
  stage.classList.remove('open');
  $$('.rm').forEach(b => b.classList.remove('sel'));
  fitDr();
}
/* the drawer starts at the heading's top line and always reaches the bottom of the screen */
function fitDr() {
  if (!open || innerWidth <= 900) { stage.style.minHeight = ''; drIn.style.height = ''; return; }
  const off = Math.round($('#planH').getBoundingClientRect().top - stage.getBoundingClientRect().top), maxH = innerHeight - STICK - 24;
  stage.style.setProperty('--drOff', off + 'px');
  stage.style.minHeight = (off + maxH) + 'px';
  const top = Math.max(stage.getBoundingClientRect().top + off, STICK);
  drIn.style.height = Math.max(280, Math.min(maxH, innerHeight - top - 24)) + 'px';
}
addEventListener('resize', fitDr);
let tk = 0;
addEventListener('scroll', () => { if (!tk) { tk = 1; requestAnimationFrame(() => { if (open) fitDr(); tk = 0; }); } }, { passive: true });
function drOnScreen() {
  if (innerWidth <= 900) return false;
  const r = drIn.getBoundingClientRect();
  return r.height > 0 && Math.min(r.bottom, innerHeight) - Math.max(r.top, STICK) >= r.height * .5;
}
/* while the drawer is open, the wheel moves the drawer first wherever the pointer is; the page moves once the drawer reaches its end (both directions) */
setGuard(() => !!open && drOnScreen());
addEventListener('wheel', e => {
  if (e.defaultPrevented || !open || e.ctrlKey || !e.deltaY || innerWidth <= 900 || !drOnScreen()) return;
  const dy = e.deltaY * (e.deltaMode === 1 ? 16 : e.deltaMode === 2 ? drIn.clientHeight : 1), max = drIn.scrollHeight - drIn.clientHeight;
  e.preventDefault();
  if ((dy > 0 && drIn.scrollTop < max - 1) || (dy < 0 && drIn.scrollTop > 0)) drIn.scrollTop = Math.max(0, Math.min(max, drIn.scrollTop + dy));
  else scrollBy(0, dy);
}, { passive: false });
addEventListener('keydown', e => { if (e.key === 'Escape' && !modalOpen()) closeDr(); });

function drawDr() {
  const r = roomById(open), mg = r.sleeps; ex.g = Math.min(ex.g, mg);
  const s = selection(), w = s && s.w ? W[s.w - 1] : null, tOk = ticketsAvailable(w);
  const q = quote(r, s, { guests: ex.g, extras: ex, tickets: tOk ? ex.tx : 0 }), has = q.has;
  const stp = (k, mn, mx) => `<span class="stepper"><button type="button" data-s="${k}" data-d="-1" ${ex[k] <= mn ? 'disabled' : ''} aria-label="Less">−</button><b>${ex[k]}</b><button type="button" data-s="${k}" data-d="1" ${ex[k] >= mx ? 'disabled' : ''} aria-label="More">+</button></span>`;
  const dateLine = w ? `Weekend ${w.n} · ${rng(w)}` : s && s.start ? `${DOW[s.start.getDay()]} ${s.start.getDate()} ${MON[s.start.getMonth()]} · ${s.n} night${s.n > 1 ? 's' : ''}` : '';
  const ph = `room-${r.type}-1`;
  drIn.innerHTML = `<button class="drx" id="drx" type="button" aria-label="Close">×</button><div class="ph"><img src="../images/${ph}.jpg" alt="${r.name}" width="${DIM[ph][0]}" height="${DIM[ph][1]}"></div><div class="dr-b">
  <div><h3 class="ct">${r.name}</h3><div class="small">${TYP[r.type]} · ${r.noise} · sleeps ${mg}</div></div>
  <div class="feat">${FEATS[r.type].map(f => `<div>${ico(f[0])}${f[1]}</div>`).join('')}</div>
  <div class="sec"><h4>Dates</h4>${has ? `<div class="ln"><span>${dateLine}</span></div>` : `<div class="need">Choose a weekend or weeknight dates in the strip above to see your price.</div>`}</div>
  <div class="sec"><div class="ln"><span>Guests<small>${mg === 3 ? 'Garden rooms sleep up to 3' : 'Sleeps up to 2'}</small></span>${stp('g', 1, mg)}</div></div>
  <div class="sec"><h4>Spa extras</h4>${TR.map(t => `<div class="ln"><span>${t[1]}<small>€${t[2]}</small></span>${stp(t[0], 0, 4)}</div>`).join('')}</div>
  ${tOk ? `<div class="sec"><div class="ln"><span>Evening tickets for friends<small>€75 each · ${w.tix} left</small></span>${stp('tx', 0, Math.min(10, w.tix))}</div></div>` : ''}
  <div class="sec">${has ? `<div class="ln"><span>${q.baseText}</span><span>${eur(q.base)}</span></div>${q.spa ? `<div class="ln"><span>Spa extras</span><span>${eur(q.spa)}</span></div>` : ''}${q.tix ? `<div class="ln"><span>Evening tickets</span><span>${eur(q.tix)}</span></div>` : ''}` : ''}
   <div class="total"><div><div class="small">Total</div><b>${has ? eur(q.total) : '—'}</b></div><button class="btn btn-p" id="resv" type="button">Reserve</button></div></div>
 </div>`;
  $('#drx').addEventListener('click', closeDr);
  $$('#drIn [data-s]').forEach(b => b.addEventListener('click', () => { ex[b.dataset.s] += +b.dataset.d; drawDr(); }));
  $('#resv').addEventListener('click', () => { if (!has) { flashStrip(); return; } modal('reserve'); });
}
onDates(() => { if (open) { if (taken(roomById(open))) closeDr(); else drawDr(); } });
setOpenRoom(openDr);
