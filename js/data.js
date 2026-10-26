// Ashgrove House demo data and helpers — the one place for weekends, rooms, prices, availability and slot rules.
// Everything here is fictional.

/* ---------- themes ---------- */
export const TC = { greek: 'var(--greek)', latin: 'var(--latin)', '90s': 'var(--s90)', bingo: 'var(--bingo)', white: 'var(--white)', comedy: 'var(--comedy)', acoustic: 'var(--acoustic)', dj: 'var(--dj)' };
export const TN = { greek: 'Greek', latin: 'Latin', '90s': '90s–00s', bingo: 'Rave bingo', white: 'White party' };
export const PHOTO = { latin: 'theme-latin', greek: 'theme-greek', '90s': 'theme-90s', bingo: 'theme-bingo', white: 'theme-white-party' };
// one picture per weekend (same theme, a different shot when the theme comes round again)
const PHOTO_W = ['theme-latin', 'theme-greek', 'theme-90s', 'theme-bingo', 'theme-white-party', 'theme-greek-2', 'theme-latin', 'theme-90s-2', 'theme-greek', 'theme-bingo-2'];
export const photoOf = w => PHOTO_W[w.n - 1];
export const ALL_PHOTOS = [...new Set([...Object.values(PHOTO), ...PHOTO_W])];

/* ---------- dates ---------- */
export const MON = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
export const DOW = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
export const today = new Date(); today.setHours(0, 0, 0, 0);
export const add = (d, n) => { const x = new Date(d); x.setDate(x.getDate() + n); return x; };
export const iso = d => d.getFullYear() + '-' + String(d.getMonth() + 1).padStart(2, '0') + '-' + String(d.getDate()).padStart(2, '0');
export const fromIso = s => new Date(s + 'T00:00');
// weekend 1 = the first Friday at least 7 days from today; the rest follow weekly
const first = add(today, 7); while (first.getDay() !== 5) first.setDate(first.getDate() + 1);

/* ---------- the ten weekends ---------- */
const N = (t, name, act) => ({ t, name, act });
const RAW = [
  { fri: N('latin', 'Latin night', 'Orquesta Brava, live band'), sat: N('dj', 'DJ night', 'DJ Marisol, Latin house'), day: 'yoga', kids: 0, out: 'open', sh: 1, main: 'latin', desc: 'A ten-piece salsa band on Friday, Latin house on the terrace on Saturday. Bring shoes you can dance in.', rooms: 5, tix: 6 },
  { fri: N('greek', 'Greek night', 'The Kalamata Brothers, bouzouki duo'), sat: N('comedy', 'Comedy + Greek DJ', 'Siobhán Rourke, stand-up'), day: 'trek', kids: 1, out: 'open', sh: 1, main: 'greek', desc: 'Long tables and bouzouki on Friday, a stand-up and a Greek DJ on Saturday. Children welcome until nine.', rooms: 2, tix: 14 },
  { fri: N('comedy', 'Comedy night', 'Darragh Kenny, stand-up'), sat: N('90s', '90s–00s night', 'DJ Dial-Up'), day: 'yoga', kids: 0, out: 'sat', sh: 0, main: '90s', desc: 'Stand-up in The Coach House on Friday. Saturday is a private group night with the 90s on loud.', rooms: 4, tix: 9 },
  { fri: N('acoustic', 'Acoustic night', 'Aoife Lally, singer'), sat: N('bingo', 'Rave bingo', 'Bingo Bríd, host'), day: 'trek', kids: 0, out: 'open', sh: 0, main: 'bingo', desc: 'A quiet Friday with a singer and the lights down low, then the loudest bingo in Kilkenny.', rooms: 0, tix: 11 },
  { fri: N('white', 'Sunset sax + DJ', 'Sol Collective'), sat: N('white', 'White party', 'DJ Sol Collective, Ibiza house'), day: 'yoga', kids: 0, out: 'open', sh: 1, main: 'white', desc: 'Dress in white. Sax at sunset on the terrace, then Ibiza house until late.', rooms: 7, tix: 12 },
  { fri: N('greek', 'Greek night', 'The Kalamata Brothers'), sat: N('dj', 'DJ night', 'DJ Marisol'), day: 'trek', kids: 1, out: 'open', sh: 0, main: 'greek', desc: 'Greek food and bouzouki, then a DJ night that starts early enough for families.', rooms: 1, tix: 16 },
  { fri: N('latin', 'Latin night', 'Orquesta Brava'), sat: N('90s', '90s–00s night', 'DJ Dial-Up'), sun: N('bingo', 'Rave bingo', 'Bingo Bríd'), day: null, kids: 0, out: 'open', sh: 1, long: 1, main: 'latin', desc: 'Bank holiday: three nights, three parties, and Monday to recover.', rooms: 6, tix: 8 },
  { fri: N('90s', '90s–00s night', 'DJ Dial-Up'), sat: N('comedy', 'Comedy night', 'Darragh Kenny'), day: 'yoga', kids: 0, out: 'closed', sh: 0, main: '90s', desc: 'Booked by a company for the whole weekend. A few rooms are still open to the public.', rooms: 3, tix: 0 },
  { fri: N('greek', 'Greek night', 'The Kalamata Brothers'), sat: N('acoustic', 'Acoustic night', 'Aoife Lally'), day: 'trek', kids: 1, out: 'open', sh: 1, main: 'greek', desc: 'A Greek feast on Friday, an unplugged Saturday. The gentlest weekend of the season.', rooms: 9, tix: 17 },
  { fri: N('bingo', 'Rave bingo', 'Bingo Bríd'), sat: N('white', 'White party', 'DJ Sol Collective'), day: 'yoga', kids: 0, out: 'open', sh: 1, main: 'bingo', desc: 'Rave bingo, then dress in white. Two of the loudest nights back to back.', rooms: 5, tix: 7 },
];
// free rooms per weekend, fixed so every browser shows the same plan (s = Suite, h = Hazel, f = Forge)
const FREE = [['f5', 'h1', 's2', 'f4', 'h3'], ['h7', 'f5'], ['h2', 'h8', 'h4', 'f2'], [], ['f6', 'h3', 's2', 'h7', 'f1', 'h8', 's1'], ['f5'], ['h5', 'f2', 's1', 's2', 'h1', 'h2'], ['s1', 'h3', 'h8'], ['f6', 'h1', 'h3', 'h5', 'h2', 'f3', 's2', 'f1', 'f5'], ['f4', 'f3', 'h2', 'h3', 'f1']];
export const W = RAW.map((w, i) => ({ ...w, n: i + 1, d: add(first, 7 * i), free: new Set(FREE[i]) }));
W.forEach(w => { w.nights = [['Fri', w.fri], ['Sat', w.sat]].concat(w.sun ? [['Sun', w.sun]] : []); });

export const endD = w => add(w.d, w.long ? 3 : 2);
export const rng = w => { const a = w.d, b = endD(w); return a.getMonth() === b.getMonth() ? `${a.getDate()}–${b.getDate()} ${MON[b.getMonth()]}` : `${a.getDate()} ${MON[a.getMonth()]} – ${b.getDate()} ${MON[b.getMonth()]}`; };
export const lbl = w => [...new Set(w.nights.map(x => x[1].name))].join(' + ');
export const rl = n => n === 1 ? '1 room left' : n + ' rooms left';
export const dayLabel = d => `${DOW[d.getDay()]} ${d.getDate()} ${MON[d.getMonth()]}`;
export const weekendDates = w => { const e = endD(w); return `${dayLabel(w.d)} – ${dayLabel(e)}${w.long ? ' · bank holiday' : ''}`; };

/* ---------- filters ---------- */
export const TAG = { greek: [2, 6, 9], latin: [1, 7], '90s': [3, 7, 8], bingo: [4, 7, 10] };
export const FEAT = { kids: [2, 6, 9], out: [1, 2, 3, 4, 5, 6, 7, 9, 10], sh: [1, 2, 5, 7, 9, 10], yoga: [1, 3, 5, 8, 10], trek: [2, 4, 6, 9], dj: [1, 2, 3, 5, 6, 7, 8, 10] };
// [key, icon, short label, full label (tooltip)]
export const FL = [['kids', 'kids', 'Kids', 'Children welcome'], ['out', 'ticket', 'Open', 'Open to outside guests'], ['sh', 'bus', 'Shuttle', 'Dublin shuttle']];
export const FR = [['yoga', 'yoga', 'Yoga', 'Morning yoga on the lawn'], ['trek', 'trek', 'Trekking', 'Guided country walk'], ['dj', 'dj', 'DJ', 'A DJ on one of the nights']];
export const FT = [['greek', 'Greek'], ['latin', 'Latin'], ['90s', '90s–00s'], ['bingo', 'Bingo']];

// themes combine with OR, features with AND
export const matches = (w, themes, feats) => (!themes.size || [...themes].some(t => TAG[t].includes(w.n))) && [...feats].every(f => FEAT[f].includes(w.n));
export const score = (w, themes, feats) => ([...themes].some(t => TAG[t].includes(w.n)) ? 2 : 0) + [...feats].filter(f => FEAT[f].includes(w.n)).length;
// → { list, closest } — when nothing matches, the three best matches (score, then date order)
export function filterWeekends(themes = new Set(), feats = new Set()) {
  const list = W.filter(w => matches(w, themes, feats));
  if (list.length) return { list, closest: false };
  const best = W.map(w => [w, score(w, themes, feats)]).sort((a, b) => b[1] - a[1] || a[0].n - b[0].n).slice(0, 3).map(x => x[0]);
  return { list: best, closest: true };
}

/* ---------- rooms ---------- */
export const ROOMS = [
  ...[1, 2].map(i => ({ id: 's' + i, name: 'Suite ' + i, type: 'suite', noise: 'Quiet', zone: 'Main house, abbey side', sleeps: 2 })),
  ...[1, 2, 3, 4, 5, 6, 7, 8].map(i => ({ id: 'h' + i, name: 'Hazel ' + i, type: 'standard', noise: i <= 4 ? 'Quiet' : 'Medium', zone: i <= 4 ? 'Main house, garden side' : 'Main house, courtyard side', sleeps: 2 })),
  ...[1, 2, 3, 4, 5, 6].map(i => ({ id: 'f' + i, name: 'Forge ' + i, type: 'garden', noise: 'Lively', zone: 'Stable yard, beside The Coach House', sleeps: 3 })),
];
export const TYP = { suite: 'Suite', standard: 'Standard double', garden: 'Garden room' };
export const FEATS = {
  suite: [['bed', 'Super-king bed'], ['col', 'Sitting room'], ['shower', 'Freestanding bath'], ['leaf', 'Abbey view']],
  standard: [['bed', 'King bed'], ['shower', 'Rain shower'], ['door', 'Sash windows'], ['leaf', 'Garden or yard view']],
  garden: [['bed', 'King + single'], ['beams', 'Oak beams'], ['door', 'Own door'], ['shower', 'Walk-in shower']],
};
export const roomById = id => ROOMS.find(r => r.id === id);
export const CAPACITY = ROOMS.reduce((a, r) => a + r.sleeps, 0);

/* ---------- prices ---------- */
export const PR = { garden: 329, standard: 389, suite: 549 };   // weekend package, per person
export const EX = { garden: 120, standard: 140, suite: 190 };   // bank holiday extra night, per person
export const NT = { garden: 210, standard: 180, suite: 320 };   // weeknight room rate, per night
export const TICKET = 75;
export const TR = [['sw', 'Swedish massage', 95], ['hs', 'Hot stone massage', 125], ['fa', 'Signature facial', 95], ['cp', 'Couples massage', 185]];
export const eur = n => '€' + n.toLocaleString('en-IE');
export const pp = (w, t) => PR[t] + (w.long ? EX[t] : 0);

/* ---------- weeknights ---------- */
// ~40% of the rooms are booked on any weeknight. The day number is shifted by one so that it gives the board's result
// on any machine east of Greenwich (Irish summer time, Turkey, …) and, unlike the board, the same everywhere.
const dayNo = d => Math.floor(Date.UTC(d.getFullYear(), d.getMonth(), d.getDate()) / 864e5) - 1;
export const wnTaken = (room, start, nights) => {
  const k = ROOMS.indexOf(room);
  for (let i = 0; i < nights; i++) { const d = dayNo(add(start, i)); if (((d * 7919 + k * 104729) % 100 + 100) % 100 < 40) return true; }
  return false;
};
export const isWeekendNight = d => d.getDay() === 5 || d.getDay() === 6;

/* ---------- availability and price lines for a selection ----------
   sel = { w: <weekend number> }  or  { start: Date, n: nights }  or  null */
export const hasDates = sel => !!(sel && (sel.w || sel.start));
export const roomTaken = (room, sel) => !sel ? false : sel.w ? !W[sel.w - 1].free.has(room.id) : sel.start ? wnTaken(room, sel.start, sel.n) : false;
export const priceLine = (room, sel) => sel && sel.w ? `${eur(pp(W[sel.w - 1], room.type))} per person · weekend package`
  : sel && sel.start ? `${eur(NT[room.type] * sel.n)} for ${sel.n} night${sel.n > 1 ? 's' : ''}` : `From ${eur(NT[room.type])} a night`;

// extras = { sw, hs, fa, cp (0–4 each), tx (evening tickets) }; guests only matters for weekends
export function quote(room, sel, { guests = 2, extras = {}, tickets = 0 } = {}) {
  const w = sel && sel.w ? W[sel.w - 1] : null;
  let base = 0, baseText = '';
  if (w) { base = pp(w, room.type) * guests; baseText = `${eur(pp(w, room.type))} × ${guests} guest${guests > 1 ? 's' : ''}`; }
  else if (sel && sel.start) { base = NT[room.type] * sel.n; baseText = `${eur(NT[room.type])} × ${sel.n} night${sel.n > 1 ? 's' : ''}`; }
  const spa = TR.reduce((a, t) => a + t[2] * (extras[t[0]] || 0), 0);
  const tix = w ? tickets * TICKET : 0;
  return { base, baseText, spa, tix, total: base + spa + tix, has: hasDates(sel) };
}
export const ticketsAvailable = w => !!w && w.out !== 'closed' && w.tix > 0;

/* ---------- Spa and restaurant slots ---------- */
export const SPA_TIMES = ['10:00', '11:30', '13:00', '14:30', '16:00', '17:30'];
export const THERAPISTS = ['Nuala', 'Tomás'];
export const spaSlots = () => THERAPISTS.map((t, ti) => ({ therapist: t, slots: SPA_TIMES.map((s, i) => ({ time: s, taken: (i * 3 + ti * 5) % 7 < 2 })) }));
export const REST_TIMES = ['12:30', '13:00', '13:30', '19:00', '19:30', '20:00', '20:30', '21:00'];
export const restSlots = () => REST_TIMES.map((s, i) => ({ time: s, meal: i < 3 ? 'Lunch' : 'Dinner', taken: i % 5 === 2 }));
export const days7 = () => [...Array(7)].map((_, i) => add(today, i + 1));

/* ---------- corporate themes (Your own theme) ---------- */
export const THM = [['greek', 'Greek night', 'Bouzouki duo, long tables, meze', 'theme-greek'], ['latin', 'Latin night', 'Live salsa band, Latin house after', 'theme-latin'], ['90s', '90s–00s night', 'The hits you know, glow sticks', 'theme-90s'], ['bingo', 'Rave bingo', 'A host, prizes, lasers and a DJ', 'theme-bingo'], ['white', 'White party', 'All in white, sax at sunset', 'theme-white-party'], ['custom', 'Your own idea', 'Your brief, built with you', 'corporate-2a']];

/* ---------- the house ---------- */
export const HOUSE = { rooms: 16, guests: 38, ticketsPerNight: 22, name: 'Ashgrove House', address: 'Ashgrove Road, Co. Kilkenny', phone: '+353 56 000 0142', email: 'hello@ashgrovehouse.example' };

/* ---------- image sizes (width, height) for every still, so each <img> can carry width/height ---------- */
export const DIM = {
  'contact-people-a': [1536, 1024],
  'contact-people-b': [1536, 1024],
  'contact-people-c': [1536, 1024],
  'contact-place-a': [1448, 1086],
  'contact-place-b': [1536, 1024],
  'contact-place-c': [1536, 1024],
  'contact-producers-a': [1536, 1024],
  'contact-producers-b': [1536, 1024],
  'contact-producers-c': [1536, 1024],
  'corporate-1a': [1536, 1024],
  'corporate-1b': [1536, 1024],
  'corporate-2a': [1536, 1024],
  'corporate-2b': [1536, 1024],
  'corporate-intro': [1536, 1024],
  'hero-end': [1600, 900],
  'hero-start': [1600, 900],
  'restaurant-1a': [1374, 1145],
  'restaurant-1b': [1536, 1024],
  'restaurant-2a': [1374, 1145],
  'restaurant-2b': [1536, 1024],
  'restaurant-3a': [1374, 1145],
  'restaurant-3b': [1536, 1024],
  'restaurant-intro': [1374, 1145],
  'restaurant-menu': [1402, 1122],
  'restaurant-side': [1536, 1024],
  'room-garden-1': [1536, 1024],
  'room-garden-2': [1536, 1024],
  'room-standard-1': [1536, 1024],
  'room-standard-2': [1536, 1024],
  'room-suite-1': [1312, 1199],
  'room-suite-2': [1536, 1024],
  'spa-1a': [1536, 1024],
  'spa-1b': [1536, 1024],
  'spa-2a': [1536, 1024],
  'spa-2b': [1536, 1024],
  'spa-3a': [1536, 1024],
  'spa-3b': [1536, 1024],
  'spa-intro': [1448, 1086],
  'story-01-arrival': [1536, 1024],
  'story-02-latin-night': [1536, 1024],
  'story-03-breakfast': [1374, 1145],
  'story-04-yoga': [1536, 1024],
  'story-05-spa': [1536, 1024],
  'story-06-dinner': [1536, 1024],
  'story-07-party': [1536, 1024],
  'story-08-goodbye': [1536, 1024],
  'theme-90s': [1456, 1024],
  'theme-90s-2': [1536, 1024],
  'theme-bingo': [1536, 1024],
  'theme-bingo-2': [1536, 1024],
  'theme-greek': [1536, 1024],
  'theme-greek-2': [1536, 1024],
  'theme-latin': [1536, 1024],
  'theme-white-party': [1536, 1024],
  'weekends-intro': [1374, 1145],
};
