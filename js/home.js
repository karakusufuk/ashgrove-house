// Home: intro, hero film, hero headline fit, "Next" line.
import { $, drawLogo, reducedMotion } from './site.js';
import { W, lbl, rng, TC } from './data.js';

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
