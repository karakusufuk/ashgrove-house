// Restaurant: three brochure bands, the sample menu link and the "Book a table" stepper.
import { $ } from './site.js';
import { mountBands } from './bands.js';
import { stepper, dayChips, fields } from './stepper.js';
import { TC, restSlots } from './data.js';

const tags = [['greek', 'Greek'], ['latin', 'Latin'], ['90s', '90s–00s'], ['bingo', 'Rave bingo'], ['white', 'White party']];
mountBands($('#restBands'), [
  { eyebrow: 'Themed dinners', title: 'The Seisiún dinner', lead: 'A new menu for each weekend, cooked to the night\u2019s theme. Same long table, same good company.', p1: 'restaurant-1a', p2: 'restaurant-1b',
    extra: `<div class="tags">${tags.map(t => `<span class="tag" style="--c:${TC[t[0]]}"><i></i>${t[1]}</span>`).join('')}</div><button class="btn btn-s" type="button" id="seeMenu">See a sample menu</button>` },
  { eyebrow: 'Local and seasonal', title: 'Irish breakfast', lead: 'Open to everyone, Wednesday to Sunday.', facts: [['cutlery', 'Brown bread', 'baked here'], ['leaf', 'Honey and butter', 'from the neighbours'], ['clock', 'Eggs', 'any way you like']], p1: 'restaurant-2a', p2: 'restaurant-2b', alt: 1, rev: 1 },
  { eyebrow: 'Only on Greek weekends', title: 'Greek breakfast', lead: 'Yoghurt and honey, olives, tomatoes and warm bread to start the day.', p1: 'restaurant-3a', p2: 'restaurant-3b', extra: `<div class="tags"><span class="tag" style="--c:var(--greek)"><i></i>Greek weekends</span></div>` },
]);
$('#seeMenu').addEventListener('click', () => $('#sampleMenu').scrollIntoView({ behavior: 'smooth' }));

stepper($('#restBook'), {
  eyebrow: 'Lunch and dinner', title: 'Book a table', lead: 'Lunch is open to everyone. On event nights, dinner is for house guests and evening ticket holders.', action: 'Book a table',
  steps: [
    { key: 'day', label: 'Date', render: dayChips },
    { key: 'time', label: 'Time', render: (el, pick) => {
      el.innerHTML = `<div class="chips">${restSlots().map(s => `<button class="chip" type="button" ${s.taken ? 'disabled' : ''} data-v="${s.time}">${s.time}<small>${s.meal}</small></button>`).join('')}</div>`;
      el.querySelectorAll('.chip:not([disabled])').forEach(b => b.addEventListener('click', () => pick(b.dataset.v)));
    } },
    { key: 'size', label: 'Party size', next: 1, render: (el, _, st) => {
      let n = 2;
      el.innerHTML = `<div class="stepper"><button id="mi" type="button" aria-label="Fewer">−</button><b id="nv">2</b><button id="pl" type="button" aria-label="More">+</button></div>`;
      const u = () => { el.querySelector('#nv').textContent = n; st.v.size = n + (n === 1 ? ' guest' : ' guests'); };
      u();
      el.querySelector('#mi').addEventListener('click', () => { n = Math.max(1, n - 1); u(); });
      el.querySelector('#pl').addEventListener('click', () => { n = Math.min(12, n + 1); u(); });
    } },
    { key: 'det', label: 'Your details', final: 1, render: el => fields(el) },
  ],
});
