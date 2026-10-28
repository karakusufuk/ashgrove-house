// Home: intro, hero film, hero header/scroll stops, "Next" line.
import { $, $$, drawLogo, reducedMotion, swapPh } from './site.js';
import { W, lbl, rng, TC, photoOf, ALL_PHOTOS, pp, rl, eur, DIM } from './data.js';
import { registerHost, absY, pageStep } from './paced.js';

const vid = $('#heroVid');
const frame = $('#heroFrame');
const root = document.documentElement;
const V = '?v=20261028';

/* ---------- the hero film runs once from afternoon to night; the blur grows over its last 2 s while the drone still flies, and the headline fades in with it ---------- */
const phoneStill = () => matchMedia('(max-width:760px)').matches;   // phones: the night frame only, the 5 MB film is never fetched
let ended = false, done = false;
const BLUR = 45, SCALE = .10;                               // 100 % blur: the house is no longer recognisable (the old 9 px was the 20 % level)
const LEAD = 2;                                             // the blur grows over the last 2 s of the film, while the drone is still moving
function showEnd() {                                        // idempotent: the final state is never left again
  if (ended) return;
  ended = true;
  frame.classList.add('is-ending');
}
function tick() {
  if (done) return;
  const d = vid.duration, x = d ? Math.min(1, Math.max(0, (vid.currentTime - (d - LEAD)) / LEAD)) : 0;
  const k = Math.pow(x, 2.32);                              // 0 → 20 % at the middle of the last 2 s (blur 9 px), then 20 → 100 % before the film ends
  if (x > 0) { vid.style.filter = `blur(${(BLUR * k).toFixed(2)}px)`; vid.style.transform = `scale(${(1 + SCALE * k).toFixed(4)})`; }
  if (x >= .5) showEnd();                                   // the headline arrives together with the strongest part of the blur
  if (x >= 1 || vid.ended) { done = true; showEnd(); vid.style.filter = vid.style.transform = ''; return; }
  requestAnimationFrame(tick);
}
vid.addEventListener('playing', () => requestAnimationFrame(tick));
vid.addEventListener('ended', () => { done = true; showEnd(); vid.style.filter = vid.style.transform = ''; });
/* the film starts only when the connection can carry it to the end: enough is buffered and the measured download speed covers the rest
   (with a safety margin), so it never stalls halfway; the other photo preloads wait until the film is fully in. The intro curtain and
   the still first frame cover the wait. */
const buffered = () => (vid.buffered.length ? vid.buffered.end(vid.buffered.length - 1) : 0);
let filmFullRes; const filmFull = new Promise(r => { filmFullRes = r; });
const filmReady = new Promise(res => {
  if (!vid || reducedMotion() || phoneStill()) { filmFullRes(); return res(false); }
  const t0 = performance.now();
  const iv = setInterval(() => {
    const d = vid.duration, b = buffered(), el = (performance.now() - t0) / 1000;
    if (!d || vid.readyState < 3) return;
    if (b >= d - .05) { filmFullRes(); res(true); clearInterval(iv); return; }
    if (b >= 1.5 && (d - b) / (b / el) <= d * .7) res(true);          // the rest arrives faster than it plays (30 % margin)
    if (el > 25) { res(true); filmFullRes(); clearInterval(iv); }      // never wait for ever
  }, 150);
});
async function playHero() {
  if (!vid || ended) return;
  if (reducedMotion() || phoneStill()) return;
  await Promise.race([filmReady, new Promise(r => setTimeout(r, 20000))]);
  if (ended) return;
  try { vid.currentTime = 0; } catch (e) {}
  const p = vid.play();
  if (p && p.catch) p.catch(() => { vid.poster = 'images/hero-end.jpg' + V; showEnd(); });   // autoplay refused: show the night frame, blurred, with the headline
}
if (reducedMotion() || phoneStill()) {                      // no playback: the night frame is shown blurred, with the headline; the film is never fetched
  vid.poster = 'images/hero-end.jpg' + V;
  vid.preload = 'none';
  vid.querySelectorAll('source').forEach(s => s.remove());
  vid.load();
  requestAnimationFrame(() => requestAnimationFrame(showEnd));
}

/* ---------- header: absent on the first screen (desktop), slides in with the first scroll ---------- */
const wide = () => innerWidth > 900;
const headerState = () => root.classList.toggle('hero-top', wide() && scrollY < 24);
addEventListener('scroll', headerState, { passive: true });
addEventListener('resize', headerState);
headerState();

/* ---------- "Next: …" ---------- */
{
  const w = W[0];
  $('#nextLine span').textContent = `Next: ${lbl(w)} · ${rng(w)}`;
}

/* ---------- intro: black, then the frame opens to 35 mm, then the page arrives ---------- */
function intro() {
  const ov = $('#intro');
  if (!root.classList.contains('intro-on')) { ov.classList.add('done'); playHero(); return; }
  setTimeout(() => {
    const r = $('#heroFrame').getBoundingClientRect();
    ov.classList.add('go');
    setTimeout(playHero, 1500);
    $('.ip.l', ov).style.width = Math.max(0, r.left) + 'px';
    $('.ip.r', ov).style.width = Math.max(0, innerWidth - r.right) + 'px';
    $('.ip.t', ov).style.height = Math.max(0, r.top) + 'px';
    $('.ip.b', ov).style.height = Math.max(0, innerHeight - r.bottom) + 'px';
    setTimeout(() => {
      ov.classList.add('fade');
      drawLogo();
      setTimeout(() => { ov.classList.add('done'); root.classList.remove('intro-on'); }, 950);
    }, 2400);
  }, 1050);
}
intro();

// coming back to the homepage (back button, cached page): the film carries on, an ended film stays as it is
addEventListener('pageshow', e => {
  if (e.persisted) drawLogo();
});

/* ---------- upcoming weekends: one picture, three slim guide rows ---------- */
let calCur = 1, calFront = 'A';
filmFull.then(() => { ALL_PHOTOS.forEach(n => { const im = new Image(); im.src = `images/${n}.jpg`; }); });   // all theme photos preloaded (after the film is in)
function setCalLab(w) {
  const l = $('#calLab');
  l.style.setProperty('--c', TC[w.main]);
  l.innerHTML = `<i></i><b>${w.long ? 'Bank holiday · ' : ''}${lbl(w)}</b><span>${rng(w)}</span>`;
}
function setCalPhoto(w) { setCalLab(w); calFront = swapPh($('#calA'), $('#calB'), calFront, `images/${photoOf(w)}.jpg`, lbl(w)); }
function renderGuide() {
  $('#guide').innerHTML = W.slice(0, 3).map(w => `<a class="gr ${w.n === calCur ? 'cur' : ''}" data-w="${w.n}" href="rooms/?w=${w.n}" aria-label="${lbl(w)}, ${rng(w)}">
  <div class="gph"><img src="images/${photoOf(w)}.jpg" alt="" width="${DIM[photoOf(w)][0]}" height="${DIM[photoOf(w)][1]}" loading="lazy" decoding="async"></div>
  <div class="gname">${w.long ? 'Bank holiday · ' : ''}${lbl(w)}</div>
  <div class="dt"><b>${rng(w)}</b><span>${w.long ? 'Bank holiday' : 'Weekend ' + w.n}</span></div>
  <div class="ns">${w.nights.map(([d, x]) => `<div class="nt" style="--c:${TC[x.t]}"><i></i><div style="min-width:0"><b>${d} · ${x.name}</b><span>${x.act}</span></div></div>`).join('')}</div>
  <div class="pr">from<b>${eur(pp(w, 'garden'))}</b></div>
  <div class="lf ${w.rooms <= 2 ? 'hot' : ''}">${w.rooms ? rl(w.rooms) : 'Rooms sold out'}<br><span class="small">${w.out === 'closed' ? 'Closed to outside guests' : w.tix + ' evening tickets'}</span></div>
  <div class="go">→</div></a>`).join('');
  $$('.gr').forEach(r => {
    const w = W[+r.dataset.w - 1];
    const on = () => { calCur = w.n; $$('.gr').forEach(x => x.classList.toggle('cur', x === r)); setCalPhoto(w); };
    r.addEventListener('mouseenter', on);
    r.addEventListener('focus', on);
  });
}
$('#calA').src = `images/${photoOf(W[0])}.jpg`;
$('#calA').alt = lbl(W[0]);
setCalLab(W[0]);
renderGuide();

/* ---------- story: the weekend as a timeline ---------- */
const MOM = [
  { day: 'Friday', h: '16:00', title: 'Arrival', txt: 'Bags down, keys on the table, a first drink in the drawing room.', img: 'story-01-arrival' },
  { day: 'Friday', h: '21:00', title: 'Latin night', txt: 'Orquesta Brava in The Coach House. Nobody sits for long.', img: 'story-02-latin-night' },
  { day: 'Saturday', h: '09:00', title: 'Breakfast', txt: 'Brown bread, local honey, eggs any way you like.', img: 'story-03-breakfast' },
  { day: 'Saturday', h: '10:30', title: 'Yoga', txt: 'A slow class on the lawn, the abbey behind the trees.', img: 'story-04-yoga' },
  { day: 'Saturday', h: '14:00', title: 'Spa', txt: 'One session in the orangery is in the package.', img: 'story-05-spa' },
  { day: 'Saturday', h: '19:30', title: 'Dinner', txt: 'One long table. The menu follows the night’s theme.', img: 'story-06-dinner' },
  { day: 'Saturday', h: '22:00', title: 'The party', txt: 'DJ Marisol on the terrace until the last song.', img: 'story-07-party' },
  { day: 'Sunday', h: '11:00', title: 'Goodbye', txt: 'A late breakfast, then home.', img: 'story-08-goodbye' },
];
const story = $('#story'), tl = $('#tl'), tlCol = $('#tlCol'), PER = 46;
tlCol.innerHTML = '<div class="tl-line"></div>' + MOM.map((m, k) => `<div class="tl-it" style="--k:${k}"><span class="tl-node"></span><h3 class="d">${m.title}</h3></div>`).join('');
$('#stPh').innerHTML = MOM.map(m => `<img src="images/${m.img}.jpg" alt="${m.title}" width="${DIM[m.img][0]}" height="${DIM[m.img][1]}" loading="lazy" decoding="async">`).join('');
const its = $$('.tl-it'), phs = $$('#stPh img');
story.style.height = `calc(${MOM.length * PER}vh + 100vh)`;
/* ≤ 900 px: the same eight moments as a plain timeline (the pinned, one-step-per-scroll version needs a desktop-sized
   screen; on a phone it clipped the copy). CSS shows one or the other. */
story.insertAdjacentHTML('beforeend', `<div class="st-list wrap"><div class="eyebrow">A Seisiún weekend, hour by hour</div><ol>${MOM.map(m => `<li><figure class="st-ph"><img src="images/${m.img}.jpg" alt="${m.title}" width="${DIM[m.img][0]}" height="${DIM[m.img][1]}" loading="lazy" decoding="async"></figure><div class="st-when"><b>${m.day}</b><span>${m.h}</span></div><h3 class="d">${m.title}</h3><p>${m.txt}</p></li>`).join('')}</ol></div>`);
let cur = -1, tlY = 190, tlS = 240;
function layoutStory() {
  const h = its[0].querySelector('.d').offsetHeight; if (!h) return;
  tlS = Math.round(h + 140); tlY = Math.round(tlS - h / 2);
  const H = Math.round(tlY + tlS + h * .3), R = document.documentElement.style;
  R.setProperty('--tlTH', h + 'px'); R.setProperty('--tlS', tlS + 'px'); R.setProperty('--tlY', tlY + 'px'); R.setProperty('--tlH', H + 'px');
  R.setProperty('--phW', Math.min((H - 58) * 4 / 3, tl.clientWidth - 24) + 'px');
  tlCol.style.setProperty('--tlShift', (tlY - Math.max(cur, 0) * tlS) + 'px');
}
/* every step: day, time and copy go out completely; the title settles first (.85 s), then day and time return, then the copy */
let txT = [];
function storyText(m, first) {
  const d = $('#tlDay'), t = $('#tlTime'), x = $('#tlTxt');
  txT.forEach(clearTimeout); txT = [];
  if (first || reducedMotion()) { d.textContent = m.day; t.textContent = m.h; x.textContent = m.txt; [d, t, x].forEach(e => e.classList.remove('out')); return; }
  [d, t, x].forEach(e => e.classList.add('out'));
  txT.push(setTimeout(() => { d.textContent = m.day; t.textContent = m.h; d.classList.remove('out'); t.classList.remove('out'); }, 850));
  txT.push(setTimeout(() => { x.textContent = m.txt; x.classList.remove('out'); }, 1150));
}
function storyStep() {
  const r = story.getBoundingClientRect(), total = story.offsetHeight - innerHeight;
  const i = Math.min(MOM.length - 1, Math.floor(Math.min(Math.max(-r.top / total, 0), .9999) * MOM.length));
  if (i === cur) return;
  const first = cur < 0; cur = i;
  tlCol.style.setProperty('--tlShift', (tlY - i * tlS) + 'px');
  its.forEach((it, k) => { it.classList.toggle('on', k === i); it.classList.toggle('past', k < i); });
  phs.forEach((p, k) => p.classList.toggle('on', k === i));
  storyText(MOM[i], first);
}
const stepTop = i => { const len = (story.offsetHeight - innerHeight) / MOM.length; return Math.round(absY(story) + len * (i + .5)); };
/* the first screen has two stops: the framed film (0) and the centred block under it; the next gesture lands on Arrival, and Arrival's way up leads back to the block */
const hero = $('#hero'), heroSub = $('#heroSub');
const heroStop = () => Math.max(0, Math.min(absY(heroSub) + heroSub.offsetHeight - innerHeight, absY(heroSub) - 96));
registerHost({ el: hero, n: 2, enabled: wide, pos: i => (i ? heroStop() : 0), down: () => ({ y: stepTop(0), host: story }), up: () => ({ y: 0, host: null }) });
registerHost({ el: story, n: MOM.length, enabled: () => innerWidth > 900, pos: stepTop, down: () => ({ y: absY(story) + story.offsetHeight, host: null }), up: () => ({ y: heroStop(), host: hero }) });
$('#heroDown').addEventListener('click', e => {
  if (e.detail) e.currentTarget.blur();                      // a mouse click leaves no focus on the button, so the keys keep their paced steps
  if (!reducedMotion() && pageStep(1)) return;
  const y = heroStop();
  scrollTo({ top: scrollY < y - 2 ? y : absY(story), behavior: reducedMotion() ? 'auto' : 'smooth' });
});
addEventListener('resize', layoutStory);
let stk = 0;
addEventListener('scroll', () => { if (!stk) { stk = 1; requestAnimationFrame(() => { storyStep(); stk = 0; }); } }, { passive: true });
layoutStory(); storyStep();
if (document.fonts) document.fonts.ready.then(() => { layoutStory(); storyStep(); });
