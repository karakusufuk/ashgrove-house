// Home: intro, hero film, hero header/scroll stops, "Next" line.
import { $, $$, drawLogo, reducedMotion, swapPh } from './site.js';
import { W, lbl, rng, TC, photoOf, ALL_PHOTOS, pp, rl, eur, DIM } from './data.js';
import { registerHost, absY, pageStep } from './paced.js';

const vid = $('#heroVid');
const frame = $('#heroFrame');
const root = document.documentElement;
const V = '?v=20261028';

/* ---------- the hero film runs once from afternoon to night; the blur grows over its last 2 s while the drone still flies, and the headline fades in with it ---------- */
const PHONE = !!vid && vid.dataset.phone === '1';           // set by the script under the video (≤ 760 px at load): phones never fetch the 5 MB film
const VM = '?v=20261102';
let ended = false, done = false, ticking = false;
const BLUR = 45, SCALE = .10;                               // 100 % blur: the house is no longer recognisable (the old 9 px was the 20 % level)
const LEAD = 2;                                             // the blur grows over the last 2 s of the film, while the drone is still moving
let fx = vid, now = () => vid.currentTime, dur = () => vid.duration;   // what the end blur follows: the film, or the frame sequence on a phone that refuses video
function showEnd() {                                        // idempotent: the final state is never left again
  if (ended) return;
  ended = true;
  frame.classList.add('is-ending');
}
function tick() {
  if (done) return;
  const d = dur(), x = d ? Math.min(1, Math.max(0, (now() - (d - LEAD)) / LEAD)) : 0;
  const k = Math.pow(x, 2.32);                              // 0 → 20 % at the middle of the last 2 s (blur 9 px), then 20 → 100 % before the film ends
  if (x > 0) { fx.style.filter = `blur(${(BLUR * k).toFixed(2)}px)`; fx.style.transform = `scale(${(1 + SCALE * k).toFixed(4)})`; }
  if (x >= .5) showEnd();                                   // the headline arrives together with the strongest part of the blur
  if (x >= 1 || (fx === vid && vid.ended)) { done = true; showEnd(); fx.style.filter = fx.style.transform = ''; return; }
  requestAnimationFrame(tick);
}
const startTick = () => { if (!ticking) { ticking = true; requestAnimationFrame(tick); } };
vid.addEventListener('playing', startTick);
vid.addEventListener('ended', () => { if (fx !== vid) return; done = true; showEnd(); vid.style.filter = vid.style.transform = ''; });
/* the film starts only when it is completely in the browser's buffer, so it cannot stall; the intro curtain's loading line follows this
   download (and the curtain stays up until it is done), the other photo preloads wait for it, and a 25 s cap keeps a dead line from blocking the page. */
const buffered = () => (vid.buffered.length ? vid.buffered.end(vid.buffered.length - 1) : 0);
const wantFilm = !!vid && !reducedMotion();
let filmDone = !wantFilm, filmFullRes; const filmFull = new Promise(r => { filmFullRes = () => { filmDone = true; r(true); }; });
let phoneP = 0;                                             // phone: share of the phone film (and, if needed, the frame sequence) that has arrived
const filmProgress = () => (filmDone ? 1 : PHONE ? Math.min(.99, phoneP) : vid.duration ? Math.min(.99, buffered() / vid.duration) : 0);
/* phones (2 Nov): the same film cut to 960×540 (1.3 MB), fetched whole into memory before it plays, so the first frame is the afternoon
   house and nothing can stall. iOS Safari does not buffer a whole film on its own, so it is fetched rather than preloaded. If the phone
   refuses to play video without a tap (iOS Low Power Mode) or the film never moves, the same footage plays as 96 frames on a canvas. */
let phoneMode = '', seq = null, phoneReadyRes;
const phoneReady = new Promise(r => { phoneReadyRes = r; });
const SEQ_N = 96, SEQ_FPS = 12;
function loadSeq(onp) {
  if (seq) return Promise.resolve(true);
  const set = frame.clientWidth <= frame.clientHeight * .75 ? 'p' : 'w';   // p: the centre of the frame in portrait (480×640), w: the whole frame (640×360)
  let got = 0;
  return Promise.all(Array.from({ length: SEQ_N }, (_, i) => new Promise(res => {
    const im = new Image();
    const fin = ok => { onp(++got / SEQ_N); res(ok ? im : null); };
    im.onload = () => (im.decode ? im.decode() : Promise.resolve()).then(() => fin(true), () => fin(true));
    im.onerror = () => fin(false);
    im.src = `images/hero-seq/${set}/${String(i + 1).padStart(3, '0')}.webp${VM}`;
  }))).then(a => {
    let last = a.find(Boolean);
    if (!last) return false;
    for (let i = 0; i < a.length; i++) { if (a[i]) last = a[i]; else a[i] = last; }   // a missing frame repeats its neighbour
    seq = a;
    return true;
  });
}
async function phoneFilm() {
  const cap = setTimeout(filmFullRes, 25000);               // a dead line never holds the curtain; the film still plays when it arrives
  try {
    const r = await fetch('images/hero-m.mp4' + VM);
    if (!r.ok) throw new Error(r.status);
    const n = +r.headers.get('content-length'), parts = [];
    if (r.body && n) {
      const rd = r.body.getReader();
      let got = 0;
      for (;;) { const { done: end, value } = await rd.read(); if (end) break; parts.push(value); got += value.length; phoneP = .85 * got / n; }
    } else parts.push(await r.arrayBuffer());
    vid.src = URL.createObjectURL(new Blob(parts, { type: 'video/mp4' }));
    // may this phone play video without a tap? a muted start that is paused at once tells (the curtain still covers it)
    phoneMode = await vid.play().then(() => { vid.pause(); try { vid.currentTime = 0; } catch (e) {} return 'film'; }, () => '');
  } catch (e) {}
  if (!phoneMode) phoneMode = (await loadSeq(f => { phoneP = .85 + .15 * f; })) ? 'seq' : 'none';
  clearTimeout(cap);
  filmFullRes();
  phoneReadyRes();
}
function playSeq() {
  const cv = document.createElement('canvas'), g = cv.getContext('2d');
  cv.setAttribute('aria-hidden', 'true');
  vid.after(cv);
  const D = SEQ_N / SEQ_FPS, t0 = performance.now();
  fx = cv; now = () => Math.min(D, (performance.now() - t0) / 1000); dur = () => D;
  const draw = (im, a) => {                                 // object-fit: cover and object-position: 50% 18%, as the film
    const W = cv.width, H = cv.height, s = Math.max(W / im.naturalWidth, H / im.naturalHeight), w = im.naturalWidth * s, h = im.naturalHeight * s;
    g.globalAlpha = a;
    g.drawImage(im, (W - w) * .5, (H - h) * .18, w, h);
  };
  (function paint() {
    const r = Math.min(2, devicePixelRatio || 1), W = Math.round(cv.clientWidth * r), H = Math.round(cv.clientHeight * r);
    if (cv.width !== W || cv.height !== H) { cv.width = W; cv.height = H; }
    const p = Math.min(SEQ_N - 1, now() * SEQ_FPS), i = Math.floor(p), k = p - i;
    draw(seq[i], 1);
    if (k > 0) draw(seq[i + 1], k);                         // 12 frames a second, each one dissolving into the next
    if (!done) requestAnimationFrame(paint);
  })();
  startTick();
}
function endStill() {                                       // nothing can play: the night frame, blurred, with the headline
  fx = vid;
  vid.removeAttribute('src'); vid.load();
  vid.poster = 'images/hero-end.jpg' + V;
  showEnd();
}
async function playPhone() {
  await phoneReady;
  if (ended) return;
  if (phoneMode === 'film') {
    try { vid.currentTime = 0; } catch (e) {}
    if (await vid.play().then(() => true, () => false)) {
      await new Promise(r => setTimeout(r, 2500));
      if (vid.currentTime > .2 || ended) return;            // the film is running
    }
    vid.pause();                                            // refused, or stuck on its first frame: the frame sequence takes over
    phoneMode = (await loadSeq(() => {})) ? 'seq' : 'none';
    vid.removeAttribute('src'); vid.load();
  }
  if (phoneMode === 'seq') playSeq(); else endStill();
}
if (!wantFilm) filmFullRes();
else if (PHONE) phoneFilm();
else {
  const t0 = performance.now();
  const iv = setInterval(() => {
    if (vid.duration && buffered() >= vid.duration - .05) { clearInterval(iv); filmFullRes(); }
    else if (performance.now() - t0 > 25000) { clearInterval(iv); filmFullRes(); }
  }, 100);
}
const filmReady = filmFull;
async function playHero() {
  if (!vid || ended) return;
  if (reducedMotion()) return;
  if (PHONE) return playPhone();
  await Promise.race([filmReady, new Promise(r => setTimeout(r, 20000))]);
  if (ended) return;
  try { vid.currentTime = 0; } catch (e) {}
  const p = vid.play();
  if (p && p.catch) p.catch(() => { vid.poster = 'images/hero-end.jpg' + V; showEnd(); });   // autoplay refused: show the night frame, blurred, with the headline
}
if (reducedMotion()) {                                     // no playback: the night frame is shown blurred, with the headline; the film is never fetched
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
  const open = () => {
    const r = frame.getBoundingClientRect();
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
  };
  // the loading line is the film arriving (at least 1 s of line, so a cached film still shows the black → white curtain); white = loaded, then the curtain opens
  const t0 = performance.now();
  let p = 0;
  (function load() {
    const el = (performance.now() - t0) / 1000;
    p = Math.max(p, Math.min(filmProgress(), el));
    if (filmDone && el >= 1) p = 1;
    ov.style.setProperty('--p', p.toFixed(4));
    ov.classList.toggle('half', p >= .5);
    if (p < 1) requestAnimationFrame(load); else setTimeout(open, 50);
  })();
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
story.insertAdjacentHTML('beforeend', `<div class="st-list wrap"><div class="eyebrow">A Seisiún weekend, hour by hour</div><ol>${MOM.map(m => `<li><figure class="st-ph"><img src="images/${m.img}.jpg" alt="${m.title}" width="${DIM[m.img][0]}" height="${DIM[m.img][1]}" loading="lazy" decoding="async"></figure><div class="st-tx"><div class="st-when"><b>${m.day}</b><span>${m.h}</span></div><h3 class="d">${m.title}</h3><p>${m.txt}</p></div></li>`).join('')}</ol></div>`);
/* ≤ 760 px (2 Nov): the moments as a clock timeline. A small clock (hour and minute hands on a glass disc, no numbers) stays at the
   centre of the screen in front of the photos while the section is on screen; as each moment's card reaches the centre the hands arrive
   at its time. Between two cards the hands follow the scroll position on an ease-in-out curve that starts and ends with no speed and no
   jolt (quintic), so they start heavily and settle on the time. They only go forward: from a whole hour to a whole hour the minute hand
   makes exactly one full turn (the hour hand goes the shortest forward way to its hour in the same movement; 21:00 → 09:00 leaves it on
   9); when either time has minutes the minute hand goes straight to the new minute. Hands: white with a hairline dark edge (a darker
   stroke drawn under the white one), so they read on light and dark photos.
   The glass: inside the disc a copy of the moments is shown 10 % larger around the disc's centre, softened, a little brighter and more
   saturated, so the photos read as seen through thick glass. Where the browser can move elements with the scroll itself (a scroll
   timeline, as in iOS Safari 26), the copy is moved that way, in step with Safari's own scrolling and even while this page is busy;
   without one (or with reduced motion) it follows the scroll from here. */
const ckSvg = body => `<svg viewBox="0 0 100 100">${body}</svg>`, ckLine = y => `<path class="e" d="M50 50V${y}"/><path d="M50 50V${y}"/>`;
const stList = $('.st-list'), stLis = $$('li', stList), stImgs = $$('img', stList), ckRun = stList.cloneNode(true);
ckRun.classList.add('st-run');
ckRun.inert = true;
// the copy's photos are set as soon as the page's own (lazy) photos have loaded, then come from the cache
$$('img', ckRun).forEach((im, k) => {
  const real = stImgs[k], set = () => { im.src = real.currentSrc || real.src; };
  im.removeAttribute('src'); im.removeAttribute('loading');
  if (real.complete && real.naturalWidth) set(); else real.addEventListener('load', set, { once: true });
});
stList.insertAdjacentHTML('afterbegin', `<div class="st-clock" id="stClock" aria-hidden="true"><div class="ck-glass"><div class="ck-lens"></div></div>${ckSvg('<defs><linearGradient id="ckRim" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="#fff" stop-opacity=".95"/><stop offset=".5" stop-color="#fff" stop-opacity=".35"/><stop offset="1" stop-color="#fff" stop-opacity=".75"/></linearGradient></defs><circle class="ck-soft" cx="50" cy="50" r="42.55"/><circle class="ck-rim" cx="50" cy="50" r="44.85"/><circle class="ck-edge" cx="50" cy="50" r="45.65"/>')}<i class="ck-h">${ckSvg(ckLine(26))}</i><i class="ck-m">${ckSvg(ckLine(12) + '<circle class="ck-pin" cx="50" cy="50" r="3.4"/>')}</i></div>`);
const ck = $('#stClock'), ckH = $('.ck-h', ck), ckM = $('.ck-m', ck);
$('.ck-lens', ck).appendChild(ckRun);
const stTimeline = CSS.supports('animation-timeline: scroll()'), stCalm = matchMedia('(prefers-reduced-motion: reduce)');
let stAt = '';
const ckOn = () => matchMedia('(max-width:760px)').matches;
const CK_H = [], CK_M = [];                                 // the hands' angles at each moment, counted forward from Arrival
MOM.forEach((m, i) => {
  const [hh, mm] = m.h.split(':').map(Number), h = hh % 12 + mm / 60;
  if (!i) { CK_H.push(h * 30); CK_M.push(mm * 6); return; }
  const [ph, pm] = MOM[i - 1].h.split(':').map(Number), p = ph % 12 + pm / 60;
  CK_H.push(CK_H[i - 1] + ((h - p) % 12 + 12) % 12 * 30);
  CK_M.push(CK_M[i - 1] + (!mm && !pm ? 360 : ((mm - pm) % 60 + 60) % 60 * 6));
});
function clockStep() {
  if (!ckOn()) return;
  const mid = innerHeight / 2, D = ck.offsetHeight, s = story.getBoundingClientRect();
  ck.classList.toggle('on', s.top <= mid - D / 2 && s.bottom >= mid + D / 2);   // shown only while the section fills the clock's place
  const c = stLis.map(li => { const r = li.getBoundingClientRect(); return r.top + r.height / 2; });   // each card's centre on screen
  let i = 0;
  while (i < c.length - 1 && c[i + 1] <= mid) i++;
  const f = i === c.length - 1 ? 0 : Math.min(1, Math.max(0, (mid - c[i]) / (c[i + 1] - c[i]))), e = f * f * f * (f * (f * 6 - 15) + 10);
  const j = Math.min(i + 1, c.length - 1);
  ckH.style.transform = `rotate(${(CK_H[i] + (CK_H[j] - CK_H[i]) * e).toFixed(2)}deg)`;
  ckM.style.transform = `rotate(${(CK_M[i] + (CK_M[j] - CK_M[i]) * e).toFixed(2)}deg)`;
  // the copy takes the list's place on the page (top in the document, left, width); the scroll moves it
  const l = stList.getBoundingClientRect(), at = `${(l.top + scrollY).toFixed(2)},${l.left.toFixed(2)},${l.width.toFixed(2)}`;
  if (at !== stAt) { stAt = at; const [t, x, w] = at.split(','); stList.style.setProperty('--stTop', t + 'px'); stList.style.setProperty('--stX', x + 'px'); stList.style.setProperty('--stW', w + 'px'); }
  if (!stTimeline || stCalm.matches) ckRun.style.transform = `translate3d(0,${-scrollY}px,0)`;
}
let cks = 0;
addEventListener('scroll', () => { if (!cks) { cks = 1; requestAnimationFrame(() => { clockStep(); cks = 0; }); } }, { passive: true });
addEventListener('resize', clockStep);
clockStep();
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
