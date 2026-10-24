// Rooms: the date strip (weekends + weeknights), the house plan with booked rooms hatched, the hover card.
// The drawer (right column) is js/drawer.js; the room brochure bands use js/bands.js.
import { $, $$, toast } from './site.js';
import { W, TC, rng, ROOMS, TYP, roomById, roomTaken, priceLine, iso, add, today, fromIso, isWeekendNight } from './data.js';
import { mountBands } from './bands.js';

export const sel = { w: null, start: null, n: 2 };          // the chosen dates: a weekend number, or a weeknight check-in + nights
export const selection = () => sel.w ? { w: sel.w } : sel.start ? { start: sel.start, n: sel.n } : null;
export const taken = r => roomTaken(r, selection());
const listeners = [];
export const onDates = fn => listeners.push(fn);         // the drawer listens for date changes

/* ---------- the plan: the board's positions and sizes ---------- */
const COL = { suite: '#f3d9d6', standard: '#dbe7f1', garden: '#e3eadc' };
const P = (x, y, w, h) => ({ x: (x - 45) / 9.85, y: (y - 45) / 3.2, w: w / 9.85, h: h / 3.2 });
const BL = [{ l: 'The house · first floor', ...P(425, 45, 605, 320) }, { l: 'The stable yard', ...P(45, 45, 325, 320) }];
const POS = {};
['h1', 'h2', 'h3', 'h4', 'h5', 'h6', 'h7', 'h8'].forEach((id, i) => { const c = i % 4, r = Math.floor(i / 4); POS[id] = P(445 + c * 100, 80 + r * 135, 88, 115); });
POS.s1 = P(860, 80, 150, 115); POS.s2 = P(860, 215, 150, 115);
POS.f1 = P(62, 65, 92, 84); POS.f2 = P(62, 163, 92, 84); POS.f3 = P(108, 261, 95, 84); POS.f4 = P(212, 261, 95, 84); POS.f6 = P(261, 65, 92, 84); POS.f5 = P(261, 163, 92, 84);
let openRoom = () => {};                                 // set by the drawer module
export const setOpenRoom = fn => { openRoom = fn; };
function buildPlan() {
  const pl = $('#plan');
  pl.insertAdjacentHTML('beforeend', BL.map((b, i) => `<div class="blk bk-${i ? 's' : 'h'}" style="left:${b.x}%;top:${b.y}%;width:${b.w}%;height:${b.h}%"><span class="bl">${b.l}</span></div>`).join('') +
    `<div class="blk bk-y" style="left:${120 / 9.85}%;top:${20 / 3.2}%;width:${85 / 9.85}%;height:${182 / 3.2}%;border:1.5px dashed #c4c6c8;background:transparent"><span class="bl" style="top:auto;bottom:8px;left:10px;color:var(--faint);font-weight:600">Yard</span></div>` +
    ROOMS.map(r => { const p = POS[r.id]; return `<button class="rm" type="button" data-id="${r.id}" style="--c:${COL[r.type]};left:${p.x}%;top:${p.y}%;width:${p.w}%;height:${p.h}%" aria-label="${r.name}"><span>${r.name.split(' ')[0]}</span><span class="no">${r.name.split(' ')[1]}</span><small>${r.noise}</small></button>`; }).join(''));
  const tip = $('#tip');
  $$('.rm').forEach(b => {
    const r = roomById(b.dataset.id);
    const show = () => {
      const t = taken(r), has = !!selection();
      tip.innerHTML = `<b>${r.name}</b><span>${TYP[r.type]} · ${r.noise}</span><span class="st">${t ? 'Booked for these dates' : priceLine(r, selection())}</span><span>${has ? (t ? '' : 'Available') : 'Pick dates to see availability'}</span>`;
      tip.style.left = (b.offsetLeft + b.offsetWidth / 2) + 'px'; tip.style.top = b.offsetTop + 'px'; tip.classList.add('on');
    };
    b.addEventListener('mouseenter', show);
    b.addEventListener('mouseleave', () => tip.classList.remove('on'));
    b.addEventListener('click', () => { if (taken(r)) { toast(r.name + ' is booked for these dates'); return; } openRoom(r.id); });
  });
}

/* ---------- the date strip ---------- */
function strip() {
  const focused = document.activeElement && document.activeElement.id;
  $('#dstrip').innerHTML = `<span class="dl">Weekends</span>` + W.map(w => `<button class="dchip ${sel.w === w.n ? 'on' : ''}" type="button" data-w="${w.n}" style="--c:${TC[w.main]}" aria-pressed="${sel.w === w.n}"><i></i>${rng(w)}${w.rooms ? '' : '<span class="full">Full</span>'}</button>`).join('') +
    `<span class="dsep"></span><span class="wn">Weeknights <input type="date" id="wnd" min="${iso(add(today, 1))}" value="${sel.start ? iso(sel.start) : ''}" aria-label="Check-in"><select id="wnn" aria-label="Nights">${[1, 2, 3, 4].map(n => `<option ${n === sel.n ? 'selected' : ''} value="${n}">${n} night${n > 1 ? 's' : ''}</option>`).join('')}</select></span>${sel.w || sel.start ? '<button class="clr" id="clrd" type="button">Clear dates</button>' : ''}`;
  $$('.dchip').forEach(b => b.addEventListener('click', () => { sel.w = sel.w === +b.dataset.w ? null : +b.dataset.w; sel.start = null; applyDates(); }));
  $('#wnd').addEventListener('change', e => {
    if (!e.target.value) { sel.start = null; applyDates(); return; }
    const d = fromIso(e.target.value);
    if (isWeekendNight(d)) { toast('Friday and Saturday nights are Seisiún weekends'); sel.start = null; applyDates(); return; }
    sel.start = d; sel.w = null; applyDates();
  });
  $('#wnn').addEventListener('change', e => { sel.n = +e.target.value; applyDates(); });
  const c = $('#clrd'); if (c) c.addEventListener('click', () => { sel.w = null; sel.start = null; applyDates(); });
  const on = $('.dchip.on'); if (on) on.scrollIntoView({ inline: 'center', block: 'nearest' });
  if (focused && $('#' + focused)) $('#' + focused).focus({ preventScroll: true });
}
export function applyDates() {
  strip();
  $$('.rm').forEach(b => b.classList.toggle('tk', taken(roomById(b.dataset.id))));
  listeners.forEach(f => f());
}
export const flashStrip = () => $('#dstrip').animate([{ background: '#f7e6e3' }, { background: '#fff' }], { duration: 900 });

/* ---------- boot: ?w=n preselects a weekend ---------- */
const q = +new URLSearchParams(location.search).get('w');
if (q >= 1 && q <= W.length) sel.w = q;
buildPlan();
applyDates();

/* ---------- room brochure bands ---------- */
mountBands($('#roomBands'), [
  { eyebrow: 'The quietest rooms', title: 'The suites', lead: 'More space at the abbey end of the house. Super-king beds, a sitting room each, and the ruin through the window.', facts: [['guests', '1–2', 'guests'], ['ticket', '€549', 'per person, weekend'], ['night', '€320', 'per night, weekdays'], ['meter', 'Quiet', 'far from the party']], p1: 'room-suite-1', p2: 'room-suite-2' },
  { eyebrow: 'In the main house', title: 'Standard doubles', lead: 'Hazel 1–4 look over the walled garden. Hazel 5–8 face the courtyard and hear a little more of the night.', facts: [['guests', '1–2', 'guests'], ['ticket', '€389', 'per person, weekend'], ['night', '€180', 'per night, weekdays'], ['meter', 'Quiet or medium', 'by side of the house']], p1: 'room-standard-1', p2: 'room-standard-2', alt: 1, rev: 1 },
  { eyebrow: 'In the old stable yard', title: 'Garden rooms', lead: 'Six rooms for up to three around the cobbled yard. Stone walls, oak beams, your own door, and The Coach House a few steps away.', facts: [['guests', '1–3', 'guests'], ['ticket', '€329', 'per person, weekend'], ['night', '€210', 'per night, weekdays'], ['meter', 'Lively', 'next to the party']], p1: 'room-garden-1', p2: 'room-garden-2' },
]);
import('./drawer.js');
