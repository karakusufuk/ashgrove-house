// Hidden /data-check/ page: every weekend, every filter button, the price samples.
import * as D from './data.js';

const $ = s => document.querySelector(s);
const tbl = (el, head, rows) => { el.innerHTML = `<thead><tr>${head.map(h => `<th>${h}</th>`).join('')}</tr></thead><tbody>${rows.map(r => `<tr>${r.map(c => `<td>${c}</td>`).join('')}</tr>`).join('')}</tbody>`; };
const mark = ok => ok ? '<span class="ok">PASS</span>' : '<span class="bad">FAIL</span>';
const checks = [];
const check = (name, ok) => { checks.push([name, ok]); return mark(ok); };

/* weekends */
{
  const ids = D.ROOMS.map(r => r.id);
  tbl($('#dc-weekends'), ['#', 'Friday', 'Dates', 'Label', 'Free rooms', 'Rooms left', 'Tickets', 'Future', 'Check'], D.W.map((w, i) => {
    const future = w.d > D.today, consecutive = i === 0 || (w.d - D.W[i - 1].d) === 7 * 864e5 || Math.round((w.d - D.W[i - 1].d) / 864e5) === 7;
    const freeOk = w.free.size === w.rooms && [...w.free].every(id => ids.includes(id));
    const first = i !== 0 || (w.d.getDay() === 5 && Math.round((w.d - D.today) / 864e5) >= 7 && Math.round((w.d - D.today) / 864e5) < 14);
    const bh = (w.n === 7) === !!w.long && (!w.long || Math.round((D.endD(w) - w.d) / 864e5) === 3);
    return [w.n, D.dayLabel(w.d), D.rng(w) + (w.long ? ' (Fri–Mon)' : ''), D.lbl(w), [...w.free].join(' ') || '—', w.rooms, w.out === 'closed' ? 'closed' : w.tix, future ? 'yes' : 'NO',
      check(`weekend ${w.n}`, future && consecutive && freeOk && first && bh)];
  }));
}

/* filter buttons */
{
  const rows = [];
  for (const [k, l] of D.FT) { const r = D.filterWeekends(new Set([k]), new Set()); rows.push(['Theme', l, r.list.map(w => w.n).join(', '), r.list.length, check('filter ' + k, !r.closest && r.list.length > 0)]); }
  for (const [k, , l, full] of [...D.FL, ...D.FR]) { const r = D.filterWeekends(new Set(), new Set([k])); rows.push(['Feature', `${l} (${full})`, r.list.map(w => w.n).join(', '), r.list.length, check('filter ' + k, !r.closest && r.list.length > 0)]); }
  tbl($('#dc-filters'), ['Type', 'Button', 'Weekends', 'Count', 'Check'], rows);
  const combos = [[['latin'], ['kids']], [['greek', 'latin'], ['dj']], [['bingo'], ['yoga', 'out']], [['greek'], ['kids', 'trek', 'sh']], [['90s'], ['kids']]];
  tbl($('#dc-combos'), ['Combination', 'Result', 'Closest?', 'Count', 'Check'], combos.map(([t, f]) => {
    const r = D.filterWeekends(new Set(t), new Set(f));
    return [[...t, ...f].join(' + '), r.list.map(w => w.n).join(', '), r.closest ? 'yes — "No weekend has all of these. These come closest:"' : 'no', r.list.length,
      check('combo ' + t + f, r.closest ? r.list.length === 3 : r.list.length > 0)];
  }));
}

/* price samples */
{
  const hazel = D.roomById('h1'), forge = D.roomById('f1'), suite = D.roomById('s1');
  let mon = new Date(D.today); mon = D.add(mon, 1); while (mon.getDay() !== 1) mon = D.add(mon, 1);
  const s = [
    ['Weekend 1, standard × 2 guests', D.quote(hazel, { w: 1 }, { guests: 2 }).total, 778, '€389 × 2'],
    ['Weekend 1, garden × 3 guests', D.quote(forge, { w: 1 }, { guests: 3 }).total, 987, '€329 × 3'],
    ['Weekend 7 (bank holiday), suite × 2 guests', D.quote(suite, { w: 7 }, { guests: 2 }).total, 1478, '(€549 + €190) × 2'],
    ['3 weeknights, standard (from ' + D.dayLabel(mon) + ')', D.quote(hazel, { start: mon, n: 3 }).total, 540, '€180 × 3'],
    ['4 evening tickets', D.quote(hazel, { w: 1 }, { guests: 1, tickets: 4 }).tix, 300, '4 × €75'],
    ['Extras: weekend 1 standard × 2 + 1 Swedish + 2 Couples massages + 3 tickets', D.quote(hazel, { w: 1 }, { guests: 2, extras: { sw: 1, cp: 2 }, tickets: 3 }).total, 778 + 95 + 370 + 225, '778 + 95 + 370 + 225'],
  ];
  tbl($('#dc-prices'), ['Sample', 'Hand calculation', 'Expected', 'Computed', 'Formatted', 'Check'], s.map(([n, got, exp, calc]) => [n, calc, D.eur(exp), D.eur(got), D.eur(got), check(n, got === exp)]));
  const e = [[1098, '€1,098'], [1478, '€1,478'], [75, '€75'], [999, '€999']];
  checks.push(['en-IE format', e.every(([n, t]) => D.eur(n) === t)]);
}

/* the house */
{
  const types = { suite: 0, standard: 0, garden: 0 }; D.ROOMS.forEach(r => types[r.type]++);
  tbl($('#dc-house'), ['Item', 'Value', 'Check'], [
    ['Rooms', D.ROOMS.length, check('rooms', D.ROOMS.length === 16)],
    ['Types', `${types.suite} suites · ${types.standard} Hazel · ${types.garden} Forge`, check('types', types.suite === 2 && types.standard === 8 && types.garden === 6)],
    ['Capacity (guests)', D.CAPACITY, check('capacity', D.CAPACITY === 38)],
    ['Bank holiday weekend', 'Weekend 7, Fri–Mon, 3 nights', check('bank holiday', D.W[6].long === 1 && D.W[6].nights.length === 3)],
    ['Contact (fictional)', `${D.HOUSE.address} · ${D.HOUSE.phone} · ${D.HOUSE.email}`, check('contact', D.HOUSE.email.endsWith('.example') && D.HOUSE.phone.startsWith('+353 56 000'))],
  ]);
}

/* weeknights */
{
  const rows = [];
  for (let i = 1; i <= 14; i++) {
    const d = D.add(D.today, i), fs = D.isWeekendNight(d);
    const b1 = D.ROOMS.filter(r => D.wnTaken(r, d, 1)).length, b2 = D.ROOMS.filter(r => D.wnTaken(r, d, 2)).length;
    rows.push([D.dayLabel(d), fs ? 'Fri/Sat — weekend nights (shows a toast, no weeknight booking)' : '', fs ? '—' : `${b1} of 16 (${Math.round(b1 / .16)}%)`, fs ? '—' : `${b2} of 16`]);
  }
  tbl($('#dc-weeknights'), ['Check-in', 'Note', '1 night: booked', '2 nights: booked'], rows);
}

/* slots */
{
  tbl($('#dc-slots'), ['Page', 'Taken slots (identical on every load)'], [
    ['Spa', D.spaSlots().map(t => `${t.therapist}: ${t.slots.filter(s => s.taken).map(s => s.time).join(', ')}`).join(' · ')],
    ['Restaurant', D.restSlots().filter(s => s.taken).map(s => `${s.time} (${s.meal})`).join(', ')],
  ]);
}

const bad = checks.filter(c => !c[1]);
$('#dc-sum').innerHTML = `${checks.length - bad.length} of ${checks.length} checks pass${bad.length ? ` — failing: ${bad.map(b => b[0]).join(', ')}` : '.'}`;
document.body.dataset.checks = bad.length ? 'fail' : 'pass';
