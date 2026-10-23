// Home: intro, hero film, hero headline fit, "Next" line.
import { $, $$, drawLogo, reducedMotion } from './site.js';
import { W, lbl, rng, TC, PHOTO, pp, rl, eur } from './data.js';

const vid = $('#heroVid');
const root = document.documentElement;

/* ---------- the hero film runs once from afternoon to night and rests on the last frame ---------- */
function playHero() {
  if (!vid) return;
  if (reducedMotion()) return;
  try { vid.currentTime = 0; } catch (e) {}
  const p = vid.play();
  if (p && p.catch) p.catch(() => {});
}
if (vid && reducedMotion()) {          // no playback: the night frame is shown as the poster and the film is never fetched
  vid.poster = 'images/hero-end.jpg';
  vid.preload = 'none';
  vid.querySelectorAll('source').forEach(s => s.remove());
  vid.load();
}

/* ---------- headline: one line, filling the frame ---------- */
function fitHero() {
  const h = $('#heroH');
  if (!h) return;
  if (innerWidth < 900) { h.style.fontSize = ''; return; }
  h.style.fontSize = '100px';
  const k = $('#heroFrame').clientWidth / h.scrollWidth;
  h.style.fontSize = Math.min(150, 100 * k - .2) + 'px';
}
addEventListener('resize', fitHero);
fitHero();
if (document.fonts) document.fonts.ready.then(fitHero);

/* ---------- "Next: …" ---------- */
{
  const w = W[0];
  const n = $('#nextLine');
  n.style.setProperty('--c', TC[w.main]);
  n.querySelector('span').textContent = `Next: ${lbl(w)} · ${rng(w)}`;
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

// coming back to the homepage (back button, cached page): the film starts again from the first frame
addEventListener('pageshow', e => {
  if (e.persisted) { drawLogo(); playHero(); }
});

/* ---------- upcoming weekends: one picture, three slim guide rows ---------- */
let calCur = 1, calFront = 'A';
Object.values(PHOTO).forEach(n => { const im = new Image(); im.src = `images/${n}.jpg`; });   // all theme photos preloaded
function setCalLab(w) {
  const l = $('#calLab');
  l.style.setProperty('--c', TC[w.main]);
  l.innerHTML = `<i></i><b>${w.long ? 'Bank holiday · ' : ''}${lbl(w)}</b><span>${rng(w)}</span>`;
}
// the new photo is decoded before it fades in, so the old one never shows through
export function swapPh(a, b, front, src, alt) {
  const show = front === 'A' ? b : a, hide = front === 'A' ? a : b;
  if (hide.getAttribute('src') === src && +hide.style.opacity !== 0) return front;
  show.style.opacity = 0; show.src = src; show.alt = alt;
  (show.decode ? show.decode() : Promise.resolve()).catch(() => {}).then(() => {
    if (show.getAttribute('src') !== src) return;
    show.style.opacity = 1; hide.style.opacity = 0;
  });
  return front === 'A' ? 'B' : 'A';
}
function setCalPhoto(w) { setCalLab(w); calFront = swapPh($('#calA'), $('#calB'), calFront, `images/${PHOTO[w.main]}.jpg`, lbl(w)); }
function renderGuide() {
  $('#guide').innerHTML = W.slice(0, 3).map(w => `<a class="gr ${w.n === calCur ? 'cur' : ''}" data-w="${w.n}" href="rooms/?w=${w.n}" aria-label="${lbl(w)}, ${rng(w)}">
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
$('#calA').src = `images/${PHOTO[W[0].main]}.jpg`;
$('#calA').alt = lbl(W[0]);
setCalLab(W[0]);
renderGuide();
