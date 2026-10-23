// Spa: three brochure bands and the "Book a treatment" stepper.
import { $ } from './site.js';
import { mountBands } from './bands.js';
import { stepper, dayChips, fields } from './stepper.js';
import { spaSlots, TR } from './data.js';

mountBands($('#spaBands'), [
  { eyebrow: 'Relax and recharge', title: 'Massage', lead: 'Treatments under the orangery glass. Nuala and Tomás have been doing this a long time.', rows: [['Swedish massage', '60 min', '€95'], ['Hot stone massage', '75 min', '€125']], p1: 'spa-1a', p2: 'spa-1b' },
  { eyebrow: 'For your skin', title: 'Signature facial', lead: 'Our own facial with Irish skincare, tailored to your skin on the day.', rows: [['Ashgrove signature facial', '60 min', '€95']], p1: 'spa-2a', p2: 'spa-2b', alt: 1, rev: 1 },
  { eyebrow: 'Shared time', title: 'For two', lead: 'Side by side in the orangery, then the steam room is yours for half an hour.', rows: [['Couples massage', '60 min', '€185']], p1: 'spa-3a', p2: 'spa-3b' },
]);

const TREATMENTS = [['Swedish massage', '60 min', 95], ['Hot stone massage', '75 min', 125], ['Signature facial', '60 min', 95], ['Couples massage', '60 min', 185]];
stepper($('#spaBook'), {
  eyebrow: 'Open to non-residents', title: 'Book a treatment', lead: 'Guests in the house and visitors book the same way. Pay at the spa on the day.', action: 'Request booking',
  steps: [
    { key: 'day', label: 'Day', render: dayChips },
    { key: 'time', label: 'Time', render: (el, pick) => {
      el.innerHTML = `<div class="cols2">${spaSlots().map(t => `<div><div class="cl">${t.therapist}</div><div class="chips">${t.slots.map(s => `<button class="chip" type="button" ${s.taken ? 'disabled' : ''} data-v="${s.time} with ${t.therapist}">${s.time}</button>`).join('')}</div></div>`).join('')}</div>`;
      el.querySelectorAll('.chip:not([disabled])').forEach(b => b.addEventListener('click', () => pick(b.dataset.v)));
    } },
    { key: 'tr', label: 'Treatment', render: (el, pick) => {
      el.innerHTML = TREATMENTS.map(t => `<button class="opt" type="button" data-n="${t[0]}" data-p="${t[2]}"><span>${t[0]}<small>${t[1]}</small></span><span>€${t[2]}</span></button>`).join('');
      el.querySelectorAll('.opt').forEach(b => b.addEventListener('click', () => pick(`${b.dataset.n} · €${b.dataset.p}`)));
    } },
    { key: 'pr', label: 'Price', next: 1, nosum: 1, render: (el, _, st) => { el.innerHTML = `<div class="big">${st.v.tr.split('· ')[1]}</div><p class="small">Paid at the spa on the day.</p>`; } },
    { key: 'det', label: 'Your details', final: 1, render: el => fields(el) },
  ],
});
