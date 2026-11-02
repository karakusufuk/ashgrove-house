// The site's own dropdown, used instead of a native <select>: a button showing the value, and a list that opens under it.
// The list is placed in `host` (outside any scrolling strip, so it is never clipped) and follows the button when `scroller` scrolls.
// Mouse, touch and keyboard: a tap or click opens and picks; ↓ / ↑ / Home / End move, Enter or Space picks, Esc and Tab close.
// Nothing looks chosen until the visitor has chosen it (`marked`); the keyboard cursor shows only while the keys are in use.
let cur = null;                                             // the open list
export const closeCombobox = () => { if (cur) cur.close(); };

export function combobox(btn, { host, scroller, options, value, marked, onPick }) {
  function open(kb) {
    closeCombobox();
    const ul = document.createElement('div');
    ul.className = 'cbx-list';
    ul.id = btn.id + '-list';
    ul.setAttribute('role', 'listbox');
    ul.setAttribute('aria-label', btn.getAttribute('aria-label') || '');
    ul.innerHTML = options.map((o, i) => `<div class="cbx-o${marked && o.v === value ? ' on' : ''}" role="option" id="${ul.id}-${i}" data-i="${i}" aria-selected="${o.v === value}">${o.t}</div>`).join('');
    host.appendChild(ul);
    btn.setAttribute('aria-expanded', 'true');
    btn.setAttribute('aria-controls', ul.id);
    let act = -1;
    const setAct = i => {
      act = i;
      [...ul.children].forEach((o, k) => o.classList.toggle('act', k === i));
      if (i >= 0) btn.setAttribute('aria-activedescendant', ul.children[i].id); else btn.removeAttribute('aria-activedescendant');
    };
    const place = () => {                                   // under the button, its left edge on the button's, kept inside the screen
      const h = host.getBoundingClientRect(), b = btn.getBoundingClientRect();
      ul.style.minWidth = b.width + 'px';
      ul.style.left = Math.max(8 - h.left, Math.min(b.left - h.left, innerWidth - 8 - h.left - ul.offsetWidth)) + 'px';
      ul.style.top = (b.bottom - h.top + 6) + 'px';
    };
    const pick = i => { close(); onPick(options[i].v); };
    const outside = e => { if (!ul.contains(e.target) && !btn.contains(e.target)) close(); };
    ul.addEventListener('click', e => { const o = e.target.closest('.cbx-o'); if (o) pick(+o.dataset.i); });
    ul.addEventListener('pointermove', e => { if (e.pointerType === 'mouse') { const o = e.target.closest('.cbx-o'); if (o) setAct(+o.dataset.i); } });
    ul.addEventListener('pointerleave', e => { if (e.pointerType === 'mouse') setAct(-1); });
    document.addEventListener('pointerdown', outside, true);
    if (scroller) scroller.addEventListener('scroll', place, { passive: true });
    addEventListener('resize', place);
    function close() {
      document.removeEventListener('pointerdown', outside, true);
      if (scroller) scroller.removeEventListener('scroll', place);
      removeEventListener('resize', place);
      ul.remove();
      btn.setAttribute('aria-expanded', 'false');
      btn.removeAttribute('aria-activedescendant');
      if (cur && cur.ul === ul) cur = null;
    }
    const move = d => setAct(d === 'first' ? 0 : d === 'last' ? options.length - 1 : act < 0 ? Math.max(0, options.findIndex(o => o.v === value)) : (act + d + options.length) % options.length);
    cur = { ul, btn, close, pick, move, act: () => act };
    place();
    if (kb) move(0);                                        // opened from the keyboard: the cursor starts on the current value
  }
  const mine = () => cur && cur.btn === btn;
  btn.addEventListener('click', e => { if (mine()) cur.close(); else open(e.detail === 0); });   // detail 0: Enter or Space
  btn.addEventListener('keydown', e => {
    const k = e.key;
    if (!mine()) { if (k === 'ArrowDown' || k === 'ArrowUp') { e.preventDefault(); open(true); } return; }
    if (k === 'ArrowDown') { e.preventDefault(); cur.move(1); }
    else if (k === 'ArrowUp') { e.preventDefault(); cur.move(-1); }
    else if (k === 'Home') { e.preventDefault(); cur.move('first'); }
    else if (k === 'End') { e.preventDefault(); cur.move('last'); }
    else if ((k === 'Enter' || k === ' ') && cur.act() >= 0) { e.preventDefault(); cur.pick(cur.act()); }
    else if (k === 'Escape') { e.preventDefault(); e.stopPropagation(); cur.close(); }   // closes the list only, not the room drawer behind it
    else if (k === 'Tab') cur.close();
  });
}
