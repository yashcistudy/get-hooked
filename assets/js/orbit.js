/*
  hooked · orbit.js
  "Orbit Catch", our go-to logo motion (the one in The Knot):
  Jaz's head and Moj's head orbit each other and swap places, shrink into
  the two Os of the wordmark, the letters pop in around them, then the two js
  swing in from above and below and hook together. Click.

  It loads the real lockup file and moves its own parts, so the logo is
  never redrawn. Reduced motion: the finished lockup, no movement.
*/
(function () {
  'use strict';
  const reduced = () => window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  const FILES = { paper: 'assets/brand/lockup-on-paper.svg', ink: 'assets/brand/lockup-on-ink.svg' };
  const cache = {};
  const load = (v) => (cache[v] = cache[v] || fetch(FILES[v]).then((r) => { if (!r.ok) throw new Error('logo'); return r.text(); }));

  // the two Os in the lockup's own units (from the file: head transforms)
  const MOJ = [160.6, 144], JAZ = [288.6, 144];
  const MID = [(MOJ[0] + JAZ[0]) / 2, 144];

  function wrap(el) {
    const g = document.createElementNS('http://www.w3.org/2000/svg', 'g');
    el.parentNode.insertBefore(g, el); g.appendChild(el);
    g.style.transformBox = 'fill-box'; g.style.transformOrigin = 'center';
    return g;
  }
  const ease = (t) => (t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2);
  const lerp = (a, b, t) => a + (b - a) * t;

  function headFrames(isMoj) {
    const final = isMoj ? MOJ : JAZ, frames = [], N = 28;
    const C0 = [197, 128], R0 = 128, S0 = 2.1;
    for (let i = 0; i <= N; i++) {
      const k = i / N, e = ease(k);
      const a = Math.PI * e;                       // half an orbit: they swap sides
      const R = lerp(R0, (JAZ[0] - MOJ[0]) / 2, e), c = [lerp(C0[0], MID[0], e), lerp(C0[1], MID[1], e)];
      const sgn = isMoj ? 1 : -1;                  // moj starts on the right, jaz on the left
      const x = c[0] + sgn * R * Math.cos(a), y = c[1] + sgn * R * Math.sin(a) * 0.7;
      const s = lerp(S0, 1, e);
      frames.push({ offset: k, transform: `translate(${(x - final[0]).toFixed(1)}px, ${(y - final[1]).toFixed(1)}px) scale(${s.toFixed(3)}) rotate(${(isMoj ? 1 : -1) * (1 - e) * 140}deg)` });
    }
    return frames;
  }

  function build(slot, text) {
    const doc = new DOMParser().parseFromString(text, 'image/svg+xml');
    const svg = document.importNode(doc.documentElement, true);
    svg.setAttribute('class', 'orbit-svg'); svg.setAttribute('aria-hidden', 'true'); svg.removeAttribute('width'); svg.removeAttribute('height');
    slot.innerHTML = ''; slot.appendChild(svg);
    const top = Array.from(svg.children).filter((n) => n.tagName.toLowerCase() === 'g');
    const mark = top[0], word = top[1];
    const js = Array.from(mark.children).filter((n) => n.tagName.toLowerCase() === 'path').map(wrap); // [moj j, jaz j]
    const kids = Array.from(word.children);
    const heads = kids.filter((n) => n.tagName.toLowerCase() === 'g').map(wrap);               // [moj, jaz]
    const letters = kids.filter((n) => n.tagName.toLowerCase() === 'path').map(wrap);           // h k e d
    letters.forEach((l) => { l.style.transformOrigin = 'center bottom'; });
    return { svg, js, heads, letters };
  }

  function mount(slot, opts = {}) {
    const variant = slot.dataset.orbit === 'paper' ? 'paper' : 'ink';
    let parts = null, anims = [], ready;
    ready = load(variant).then((t) => { parts = build(slot, t); return parts; }).catch(() => {
      slot.innerHTML = `<img class="orbit-svg" src="${FILES[variant]}" alt="">`; return null;
    });

    function stop() { anims.forEach((a) => a.cancel()); anims = []; }
    async function play() {
      const p = await ready; if (!p || reduced()) return;
      stop();
      const D = 3200;
      const A = (el, kf, o) => { const a = el.animate(kf, Object.assign({ duration: D, fill: 'both', easing: 'linear' }, o)); anims.push(a); return a; };
      // heads: pop in big, then orbit + swap + shrink into the Os
      p.heads.forEach((h, i) => {
        const f = headFrames(i === 0);
        A(h, [{ transform: f[0].transform.replace(/scale\([^)]*\)/, 'scale(0)'), opacity: 0 }, Object.assign({}, f[0], { opacity: 1 })], { duration: 380, easing: 'cubic-bezier(.34,1.56,.64,1)' });
        A(h, f.map(({ offset, transform }) => ({ offset, transform })), { duration: 1500, delay: 420 });
      });
      // letters pop in around the heads
      p.letters.forEach((l, i) => A(l, [{ transform: 'scale(0) translateY(20px)', opacity: 0 }, { transform: 'scale(1.18)', opacity: 1, offset: 0.7 }, { transform: 'scale(1)', opacity: 1 }], { duration: 420, delay: 1750 + i * 90, easing: 'ease-out' }));
      // the two js swing in (moj from above, jaz upside down from below) and hook
      const [jm, jj] = p.js;
      A(jm, [{ transform: 'translate(0px,-1500px) rotate(-35deg)', opacity: 0 }, { transform: 'translate(0,60px) rotate(4deg)', opacity: 1, offset: 0.75 }, { transform: 'none', opacity: 1 }], { duration: 620, delay: 2150, easing: 'cubic-bezier(.3,1.3,.6,1)' });
      const last = A(jj, [{ transform: 'translate(0px,1500px) rotate(35deg)', opacity: 0 }, { transform: 'translate(0,-60px) rotate(-4deg)', opacity: 1, offset: 0.75 }, { transform: 'none', opacity: 1 }], { duration: 620, delay: 2250, easing: 'cubic-bezier(.3,1.3,.6,1)' });
      last.finished.then(() => {
        if (opts.onCatch) opts.onCatch();
        anims.push(p.svg.animate([{ transform: 'scale(1)' }, { transform: 'scale(1.05) rotate(-1deg)' }, { transform: 'scale(1)' }], { duration: 320, easing: 'ease-out' }));
      }).catch(() => {});
    }
    function hide() { ready.then((p) => { if (!p || reduced()) return; stop(); [...p.heads, ...p.letters, ...p.js].forEach((el) => anims.push(el.animate([{ opacity: 0 }, { opacity: 0 }], { duration: 1, fill: 'forwards' }))); }); }
    return { play, hide, ready };
  }

  window.Orbit = { mount };
})();
