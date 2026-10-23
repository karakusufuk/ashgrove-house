// Corporate: two brochure bands, "Your own theme" (photo panel + six rows) and the "Request a quote" stepper.
import { $, $$, swapPh } from './site.js';
import { mountBands } from './bands.js';
import { stepper, fields } from './stepper.js';
import { TC, THM, W, rng } from './data.js';

mountBands($('#corpBands'), [
  { eyebrow: 'Exclusive use', title: 'The whole weekend', lead: 'All sixteen rooms, both nights, the spa and the walks for your team.', facts: [['bed', '16', 'rooms'], ['guests', '38', 'guests'], ['glass', 'Two nights', 'dinner and party'], ['leaf', 'Spa', 'and guided walks']], p1: 'corporate-1a', p2: 'corporate-1b' },
  { eyebrow: 'Your company night', title: 'A single night', lead: 'Dinner and a private party in The Coach House.', facts: [['cutlery', 'Tailored', 'dinner menu'], ['dj', 'Band or DJ', 'your choice'], ['ticket', 'Your theme', 'or ours'], ['door', 'Private', 'closed to outside guests']], p1: 'corporate-2a', p2: 'corporate-2b', alt: 1, rev: 1 },
]);

/* your own theme: hover a night to see it; the last row is the bespoke one */
const colour = t => t[0] === 'custom' ? 'var(--rose)' : TC[t[0]];
$('#thmList').innerHTML = THM.map((t, k) => `<button class="thr" type="button" data-k="${k}" style="--c:${colour(t)}"><i></i><b>${t[1]}</b><span>${t[2]}</span><em>${t[0] === 'custom' ? 'Bespoke' : 'From our library'}</em><s aria-hidden="true">→</s></button>`).join('');
let thF = 'A';
function setTheme(k) {
  const t = THM[k];
  $$('.thr').forEach((r, i) => r.classList.toggle('cur', i === k));
  const l = $('#thLab');
  l.style.setProperty('--c', colour(t));
  l.innerHTML = `<i></i><b>${t[1]}</b><span>${t[0] === 'custom' ? 'Bespoke' : 'From our library'}</span>`;
  thF = swapPh($('#thA'), $('#thB'), thF, `../images/${t[3]}.jpg`, t[1]);
}
THM.forEach(t => { const im = new Image(); im.src = `../images/${t[3]}.jpg`; });
$('#thA').src = `../images/${THM[1][3]}.jpg`;
setTheme(1);
$$('.thr').forEach(r => {
  const k = +r.dataset.k;
  r.addEventListener('mouseenter', () => setTheme(k));
  r.addEventListener('focus', () => setTheme(k));
  r.addEventListener('click', () => $('#corpBook').scrollIntoView({ behavior: 'smooth' }));
});

/* request a quote */
stepper($('#corpBook'), {
  eyebrow: 'For companies', title: 'Request a quote', lead: 'Tell us your dates and numbers. We reply with a proposal within two working days.', action: 'Request a quote',
  steps: [
    { key: 'dates', label: 'Dates', render: (el, pick) => {
      el.innerHTML = `<div class="chips">${W.slice(0, 8).map(w => `<button class="chip" type="button" data-v="${rng(w)}">${rng(w)}</button>`).join('')}<button class="chip" type="button" data-v="Other dates">Other dates</button></div>`;
      el.querySelectorAll('.chip').forEach(b => b.addEventListener('click', () => pick(b.dataset.v)));
    } },
    { key: 'hc', label: 'Headcount', next: 1, render: (el, _, st) => {
      let g = 38, r = 16;
      el.innerHTML = `<div style="max-width:480px"><div class="ln"><span>Guests<small>Up to 38 staying</small></span><span class="stepper"><button id="hcGm" type="button" aria-label="Fewer guests">−</button><b id="gv"></b><button id="hcGp" type="button" aria-label="More guests">+</button></span></div><div class="ln"><span>Rooms<small>Up to 16</small></span><span class="stepper"><button id="hcRm" type="button" aria-label="Fewer rooms">−</button><b id="rv"></b><button id="hcRp" type="button" aria-label="More rooms">+</button></span></div></div>`;
      const u = () => { el.querySelector('#gv').textContent = g; el.querySelector('#rv').textContent = r; st.v.hc = `${g} guests · ${r} rooms`; };
      u();
      el.querySelector('#hcGm').addEventListener('click', () => { g = Math.max(2, g - 1); u(); });
      el.querySelector('#hcGp').addEventListener('click', () => { g = Math.min(38, g + 1); u(); });
      el.querySelector('#hcRm').addEventListener('click', () => { r = Math.max(1, r - 1); u(); });
      el.querySelector('#hcRp').addEventListener('click', () => { r = Math.min(16, r + 1); u(); });
    } },
    { key: 'th', label: 'Theme', render: (el, pick) => {
      el.innerHTML = `<div class="chips">${[['greek', 'Greek night'], ['latin', 'Latin night'], ['90s', '90s–00s night'], ['bingo', 'Rave bingo'], ['white', 'White party'], ['custom', 'Custom theme']].map(([t, n]) => `<button class="ft" type="button" style="--c:${t === 'custom' ? 'var(--ink)' : TC[t]}" data-v="${n}"><i></i>${n}</button>`).join('')}</div>`;
      el.querySelectorAll('button').forEach(b => b.addEventListener('click', () => pick(b.dataset.v)));
    } },
    { key: 'close', label: 'Evening', next: 1, render: (el, _, st) => {
      let on = true;
      el.innerHTML = `<button class="ln" id="tg" type="button" role="switch" aria-checked="true" style="width:100%;max-width:520px;text-align:left"><span>Close the evening to outside guests<small>Only your team at dinner and the party</small></span><span class="sw on" id="swi"></span></button>`;
      st.v.close = 'Private evening';
      el.querySelector('#tg').addEventListener('click', () => { on = !on; el.querySelector('#swi').classList.toggle('on', on); el.querySelector('#tg').setAttribute('aria-checked', String(on)); st.v.close = on ? 'Private evening' : 'Open evening'; });
    } },
    { key: 'det', label: 'Your details', final: 1, render: el => fields(el, '<input id="f-c" class="full" type="text" autocomplete="organization" placeholder="Company" aria-label="Company">') },
  ],
});
