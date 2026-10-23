// Weekends: filter band (circles, pills, tooltips, compact on scroll), filter logic and the ten cards.
import { $, $$ } from './site.js';
import { ico } from './icons.js';
import { W, TC, PHOTO, FL, FR, FT, filterWeekends, lbl, pp, rl, eur, weekendDates, DIM } from './data.js';

const act = { t: new Set(), f: new Set() };
const fc = ([k, i, l, full]) => `<button class="fc" type="button" data-f="${k}" data-tip="${full}" aria-label="${full}" aria-pressed="false"><span class="ci">${ico(i)}</span><span class="fl">${l}</span></button>`;
$('#fL').innerHTML = FL.map(fc).join('');
$('#fR').innerHTML = FR.map(fc).join('');
$('#fT').innerHTML = FT.map(([k, l]) => `<button class="ft" type="button" data-t="${k}" style="--c:${TC[k]}" aria-pressed="false"><i></i>${l}</button>`).join('');
const toggle = (set, k, b) => { set.has(k) ? set.delete(k) : set.add(k); b.classList.toggle('on', set.has(k)); b.setAttribute('aria-pressed', String(set.has(k))); renderCards(); };
$$('.fc').forEach(b => b.addEventListener('click', () => toggle(act.f, b.dataset.f, b)));
$$('.ft').forEach(b => b.addEventListener('click', () => toggle(act.t, b.dataset.t, b)));

function card(w, i) {
  const sold = !w.rooms, ph = PHOTO[w.main];
  const out = w.out === 'closed' ? `<span class="closed">${ico('ticket')}Closed to outside guests</span>` : w.out === 'sat' ? `<span class="closed">${ico('ticket')}Saturday closed, group booking</span>` : `<span>${ico('ticket')}Open to outside guests</span>`;
  return `<article class="card" data-w="${w.n}"><div class="cph"><img src="../images/${ph}.jpg" alt="${lbl(w)}" width="${DIM[ph][0]}" height="${DIM[ph][1]}" loading="lazy"></div>
 <div class="cmain"><div class="small">${weekendDates(w)}</div>
  <h3 class="ct">${w.long ? 'Bank holiday long weekend' : lbl(w)}</h3><p class="desc">${w.desc}</p>
  <div class="nb" style="--n:${w.nights.length}">${w.nights.map(([d, x]) => `<div class="nbx" style="--c:${TC[x.t]}"><div class="small">${d} night</div><b>${x.name}</b><span>${x.act}</span></div>`).join('')}</div>
  <div class="day">${ico(w.day === 'yoga' ? 'yoga' : w.day === 'trek' ? 'trek' : 'clock')}Daytime: ${w.day === 'yoga' ? 'yoga' : w.day === 'trek' ? 'guided walk' : 'free day'} · one spa session included</div></div>
 <div class="cside"><span class="kids ${w.kids ? 'yes' : ''}">${ico('kids')}${w.kids ? 'Children welcome' : 'Not suitable for children'}</span>
  <div class="bdg">${out}${w.sh ? `<span>${ico('bus')}Dublin shuttle</span>` : ''}</div>
  <div class="cbox ${sold ? 'sold' : ''}">${['garden', 'standard', 'suite'].map(t => `<div><span>${t[0].toUpperCase() + t.slice(1)}</span><b>${sold ? 'Sold out' : eur(pp(w, t))}</b></div>`).join('')}</div>
  <div class="cleft ${w.rooms <= 2 ? 'hot' : ''}">${sold ? 'All rooms sold out' : rl(w.rooms)} · ${w.out === 'closed' ? 'no evening tickets' : w.tix + ' evening tickets left'}</div>
  ${sold ? `<button class="btn btn-p" type="button" disabled>Rooms sold out</button>` : `<a class="btn btn-p" href="../rooms/?w=${w.n}">Book this weekend</a>`}
  ${w.out !== 'closed' ? `<button class="btn btn-t" type="button" data-tix="${w.n}">Evening tickets · €75</button>` : ''}
 </div></article>`;
}
function renderCards() {
  const { list, closest } = filterWeekends(act.t, act.f);
  $('#cards').innerHTML = (closest ? `<div class="closest">No weekend has all of these. These come closest:</div>` : '') + list.map(card).join('');
  const any = act.t.size + act.f.size;
  $('#fMeta').innerHTML = any ? `${closest ? 0 : list.length} of 10 weekends<button id="clr" type="button">Clear</button>` : 'Ten weekends. Tap a theme or a feature.';
  if (any) $('#clr').onclick = () => { act.t.clear(); act.f.clear(); $$('.fc, .ft').forEach(b => { b.classList.remove('on'); b.setAttribute('aria-pressed', 'false'); }); renderCards(); };
}

/* the filter band thins to half height on the way down and comes back on the way up.
   The height it gives up is added back as margin, so the cards below never jump. */
const filters = $('#filters');
let fLastY = 0, fUp = 0;
function measureF() {
  const c = filters.classList.contains('compact');
  filters.classList.add('nt');
  filters.classList.remove('compact'); const a = filters.offsetHeight;
  filters.classList.add('compact'); const b = filters.offsetHeight;
  filters.classList.toggle('compact', c);
  filters.style.setProperty('--fd', (a - b) + 'px');
  void filters.offsetHeight;
  filters.classList.remove('nt');
}
function filtersScroll() {
  const y = scrollY, dy = y - fLastY; fLastY = y;
  const stuck = filters.getBoundingClientRect().top <= parseFloat(getComputedStyle(filters).top) + 1 && y > 0;
  if (!stuck) { filters.classList.remove('compact'); fUp = 0; return; }
  if (dy > 6) { filters.classList.add('compact'); fUp = 0; }
  else if (dy < 0) { fUp -= dy; if (fUp >= 40) { filters.classList.remove('compact'); fUp = 0; } }   // a deliberate upward scroll restores it; a trackpad's few-pixel jitter does not
}
let tk = 0;
addEventListener('scroll', () => { if (!tk) { tk = 1; requestAnimationFrame(() => { filtersScroll(); tk = 0; }); } }, { passive: true });
addEventListener('resize', measureF);

renderCards();
measureF();
if (document.fonts) document.fonts.ready.then(measureF);
