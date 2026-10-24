// Brochure band template (Rooms, Spa, Restaurant, Corporate): a tall pinned band with one large photo that gives way to
// the second. Each band is a paced-scrolling host with two steps (photo 1, photo 2) above 900 px.
import { $$, reveal } from './site.js';
import { ico } from './icons.js';
import { DIM } from './data.js';
import { registerHost, absY } from './paced.js';

export function band({ eyebrow, title, lead, rows, facts, p1, p2, alt, rev, extra }) {
  const img = (n, cls) => `<img class="${cls}" src="../images/${n}.jpg" alt="${title}" width="${DIM[n][0]}" height="${DIM[n][1]}" loading="lazy" decoding="async">`;
  return `<section class="band${alt ? ' alt' : ''}${rev ? ' rev' : ''}"><div class="band-pin"><div class="wrap band-g">
  <div class="b-txt"><div class="eyebrow">${eyebrow}</div><h2 class="d">${title}</h2><p class="lead">${lead}</p><div class="rule"></div>
   ${rows ? `<div class="rowsx">${rows.map(r => `<div><span>${r[0]}</span><span>${r[1]}</span><span>${r[2]}</span></div>`).join('')}</div>` : ''}
   ${facts ? `<div class="facts">${facts.map(f => `<div class="fact">${ico(f[0])}<span><b>${f[1]}</b>${f[2]}</span></div>`).join('')}</div>` : ''}
   ${extra || ''}</div>
  <div class="b-ph reveal"><div class="b-sl">${img(p1, 'p1')}${img(p2, 'p2')}</div><span class="cnt">1 / 2</span></div>
 </div></div></section>`;
}

// photo 2 wipes in once the band has scrolled past 45 % of its travel; the counter follows
export function mountBands(container, list) {
  container.innerHTML = list.map(band).join('');
  const els = $$('.band', container), p2 = () => Math.round(innerHeight * .98);
  els.forEach(b => registerHost({
    el: b, n: 2, enabled: () => innerWidth > 900,
    pos: i => absY(b) + (i ? p2() : 0),
    down: () => { const nx = b.nextElementSibling; return nx && nx.classList.contains('band') ? { y: absY(nx), host: nx } : { y: absY(b) + b.offsetHeight, host: null }; },
    up: () => { const pv = b.previousElementSibling; return pv && pv.classList.contains('band') ? { y: absY(pv) + p2(), host: pv } : { y: Math.max(0, absY(b) - Math.round(innerHeight * .85)), host: null }; },
  }));
  // ≤ 900 px the band is not pinned: the two photos sit side by side in a swipe row (CSS) and the counter follows the swipe
  const update = () => els.forEach(b => {
    const ph = b.querySelector('.b-ph'), h = b.offsetHeight - innerHeight, r = b.getBoundingClientRect();
    const two = innerWidth > 900 && h > 0 && -r.top / h > .45;
    if (ph.classList.contains('two') !== two) { ph.classList.toggle('two', two); ph.querySelector('.cnt').textContent = two ? '2 / 2' : '1 / 2'; }
  });
  els.forEach(b => {
    const sl = b.querySelector('.b-sl'), cnt = b.querySelector('.cnt');
    sl.addEventListener('scroll', () => { if (innerWidth <= 900) cnt.textContent = (Math.round(sl.scrollLeft / Math.max(1, sl.clientWidth)) + 1) + ' / 2'; }, { passive: true });
  });
  let tk = 0;
  addEventListener('scroll', () => { if (!tk) { tk = 1; requestAnimationFrame(() => { update(); tk = 0; }); } }, { passive: true });
  addEventListener('resize', update);
  update(); reveal();
  return els;
}
