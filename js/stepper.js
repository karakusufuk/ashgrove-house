// Booking stepper (Spa, Restaurant, Corporate): two columns, the "Your booking" summary on the left, one step at a time on the right.
// Choosing an option moves on; Continue is the primary button; Back clears the value of the step it leaves and of the one it returns to.
import { modal } from './site.js';
import { days7, DOW, MON } from './data.js';

export function stepper(root, cfg) {
  const st = { i: 0, v: {} };
  let drawn = false;
  function draw() {
    if (drawn && innerWidth <= 900) requestAnimationFrame(() => {   // ≤ 900 px: keep the progress bar and the new step in view
      const t = root.querySelector('.bk-r').getBoundingClientRect().top, hh = document.getElementById('hdr').offsetHeight;
      if (t < hh + 8 || t > innerHeight * .5) scrollBy({ top: t - hh - 20, behavior: 'smooth' });
    });
    drawn = true;
    const s = cfg.steps[st.i];
    root.innerHTML = `<div class="bk-g"><div class="bk-l"><div class="eyebrow">${cfg.eyebrow}</div><h2 class="d">${cfg.title}</h2><p class="lead">${cfg.lead}</p>
   <div class="sumlist"><h4>Your booking</h4>${cfg.steps.filter(x => !x.final && !x.nosum).map(x => `<div class="${st.v[x.key] ? 'on' : ''}"><span>${x.label}</span><b>${st.v[x.key] || '—'}</b></div>`).join('')}</div></div>
   <div class="bk-r"><div class="prog" aria-hidden="true">${cfg.steps.map((x, i) => `<span class="${i <= st.i ? 'on' : ''}"></span>`).join('')}</div>
   <div class="prog-l">${cfg.steps.map((x, i) => `<span class="${i === st.i ? 'on' : ''}">${i + 1}. ${x.label}</span>`).join('')}</div>
   <div class="stepbox"><div class="step"><h3>${s.label}</h3><div id="sb"></div>
   <div class="navs">${s.final ? `<button class="btn btn-p" id="gob" type="button">${cfg.action}</button>` : s.next ? `<button class="btn btn-p" id="gob" type="button">Continue</button>` : ''}${st.i > 0 ? `<button class="back" id="bk" type="button">Back</button>` : ''}</div></div></div></div></div>`;
    s.render(root.querySelector('#sb'), val => { st.v[s.key] = val; st.i++; draw(); }, st);
    const bk = root.querySelector('#bk');
    if (bk) bk.addEventListener('click', () => { delete st.v[cfg.steps[st.i].key]; st.i--; delete st.v[cfg.steps[st.i].key]; draw(); });
    const g = root.querySelector('#gob');
    if (g) g.addEventListener('click', () => { if (s.final) modal('book'); else { st.i++; draw(); } });
  }
  draw();
}
// the next seven days as chips
export const dayChips = (el, pick) => {
  const days = days7();
  el.innerHTML = `<div class="chips">${days.map((d, i) => `<button class="chip" type="button" data-i="${i}">${DOW[d.getDay()]}<small>${d.getDate()} ${MON[d.getMonth()]}</small></button>`).join('')}</div>`;
  el.querySelectorAll('.chip').forEach(b => b.addEventListener('click', () => { const d = days[+b.dataset.i]; pick(`${DOW[d.getDay()]} ${d.getDate()} ${MON[d.getMonth()]}`); }));
};
// name, email, phone (+ an extra field, e.g. company)
export const fields = (el, extra = '') => {
  el.innerHTML = `<div class="fields"><input id="f-n" type="text" autocomplete="name" placeholder="Full name" aria-label="Full name"><input id="f-e" type="email" autocomplete="email" placeholder="Email address" aria-label="Email address">${extra}<input id="f-p" class="full" type="tel" autocomplete="tel" placeholder="Phone number" aria-label="Phone number"></div>`;
};
