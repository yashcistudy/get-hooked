/*
  hooked · thread.js
  The red thread from The Knot, rebuilt for the web.

  Rules (from the film's script and the brandbook):
  - one flat line, thread red #E2412B, never real yarn, no texture or glow
  - round ends, round joins, a slight hand-drawn wobble
  - 4px on desktop, 3px on mobile, 2px small
  - it draws itself on (like Trim Paths), it never just appears
  - with reduced motion, every effect jumps to its final frame

  No build step and no libraries: plain SVG + Web Animations.
  Everything hangs off window.Thread.
*/
(function () {
  'use strict';

  const NS = 'http://www.w3.org/2000/svg';
  const RED = '#E2412B';
  const mqReduce = window.matchMedia('(prefers-reduced-motion: reduce)');
  const reduced = () => mqReduce.matches;

  /* ---------- small maths ---------- */

  // seeded random, so a knot looks the same on every visit
  function rng(seed) {
    let a = seed >>> 0;
    return function () {
      a |= 0; a = (a + 0x6D2B79F5) | 0;
      let t = Math.imul(a ^ (a >>> 15), 1 | a);
      t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
      return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
    };
  }
  const clamp = (v, a = 0, b = 1) => Math.min(b, Math.max(a, v));
  const lerp = (a, b, t) => a + (b - a) * t;
  const ease = {
    out: (t) => 1 - Math.pow(1 - t, 3),
    inOut: (t) => (t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2),
    spring: (t) => 1 + 2.7 * Math.pow(t - 1, 3) + 1.7 * Math.pow(t - 1, 2),
  };
  const f = (n) => Math.round(n * 10) / 10;

  // smooth line through points (Catmull-Rom as cubic Béziers)
  function smooth(pts) {
    if (pts.length < 2) return '';
    const p = [pts[0], ...pts, pts[pts.length - 1]];
    let d = `M${f(p[1][0])} ${f(p[1][1])}`;
    for (let i = 1; i < p.length - 2; i++) {
      const [x0, y0] = p[i - 1], [x1, y1] = p[i], [x2, y2] = p[i + 1], [x3, y3] = p[i + 2];
      d += ` C${f(x1 + (x2 - x0) / 6)} ${f(y1 + (y2 - y0) / 6)} ${f(x2 - (x3 - x1) / 6)} ${f(y2 - (y3 - y1) / 6)} ${f(x2)} ${f(y2)}`;
    }
    return d;
  }

  // the hand-drawn wobble
  function wobble(pts, amount, seed = 1) {
    const r = rng(seed);
    return pts.map(([x, y]) => [x + (r() - 0.5) * 2 * amount, y + (r() - 0.5) * 2 * amount]);
  }

  // a tangled knot: loops around a drifting centre, with two loose ends
  function knotPoints(cx, cy, size, seed = 7, opts = {}) {
    const r = rng(seed);
    const turns = opts.turns || 3.9;
    const n = opts.points || Math.round(turns * 16);
    const ph1 = r() * 6.28, ph2 = r() * 6.28;
    const pts = [];
    for (let i = 0; i < n; i++) {
      const t = (i / (n - 1)) * Math.PI * 2 * turns;
      const rad = size * (0.5 + 0.28 * Math.sin(1.7 * t + ph1) + 0.14 * Math.sin(3.3 * t + ph2));
      const ox = size * 0.22 * Math.sin(0.6 * t + ph2), oy = size * 0.16 * Math.cos(0.8 * t + ph1);
      pts.push([cx + ox + rad * Math.cos(t) * 1.15, cy + oy + rad * Math.sin(t) * 0.85]);
    }
    if (opts.tails !== false) {
      const a = pts[0], b = pts[pts.length - 1];
      pts.unshift([a[0] - size * 0.5, a[1] + size * 0.2]);
      pts.unshift([a[0] - size * 0.95, a[1] + size * 0.45]);
      pts.push([b[0] + size * 0.45, b[1] - size * 0.25]);
      pts.push([b[0] + size * 0.95, b[1] - size * 0.1]);
    }
    return pts;
  }

  // n points on a gently wobbling line from a to b
  function linePoints(n, a, b, amp = 6, seed = 3) {
    const r = rng(seed);
    const out = [];
    for (let i = 0; i < n; i++) {
      const t = i / (n - 1);
      const k = Math.sin(t * Math.PI); // ends stay pinned
      out.push([lerp(a[0], b[0], t) + (r() - 0.5) * amp * k, lerp(a[1], b[1], t) + (r() - 0.5) * amp * k]);
    }
    return out;
  }

  /* ---------- svg helpers ---------- */

  function svgEl(tag, attrs = {}, parent) {
    const el = document.createElementNS(NS, tag);
    for (const k in attrs) el.setAttribute(k, attrs[k]);
    if (parent) parent.appendChild(el);
    return el;
  }

  // a thread path, normalised so its length is 1 (draw-on works at any size)
  function threadPath(parent, d = '', opts = {}) {
    const p = svgEl('path', {
      d, fill: 'none', stroke: opts.color || RED,
      'stroke-linecap': 'round', 'stroke-linejoin': 'round',
      pathLength: '1',
      'stroke-dasharray': '1 1', 'stroke-dashoffset': opts.hidden ? '1' : '0',
      class: 'thread' + (opts.className ? ' ' + opts.className : ''),
    }, parent);
    // CSS, not an attribute: attributes can't read var(--thread-w)
    p.style.strokeWidth = opts.width || 'var(--thread-w, 4px)';
    if (opts.fixedWidth) p.setAttribute('vector-effect', 'non-scaling-stroke');
    if (opts.hidden) p.style.opacity = '0';
    return p;
  }

  // 0 = nothing drawn, 1 = fully drawn
  function setDrawn(path, t) {
    path.style.opacity = t <= 0.001 ? '0' : '1';
    path.setAttribute('stroke-dashoffset', String(1 - clamp(t)));
  }

  // draw a path on, like Trim Paths. Resolves when done.
  function drawOn(path, { duration = 900, delay = 0, reverse = false, easing = 'cubic-bezier(.22,1,.36,1)' } = {}) {
    if (reduced()) { setDrawn(path, reverse ? 0 : 1); return Promise.resolve(); }
    path.style.opacity = '1';
    const from = reverse ? 0 : 1, to = reverse ? 1 : 0;
    const anim = path.animate([{ strokeDashoffset: from }, { strokeDashoffset: to }], { duration, delay, easing, fill: 'both' });
    return anim.finished.then(() => {
      anim.cancel();
      setDrawn(path, reverse ? 0 : 1);
    }).catch(() => {});
  }

  // run fn once when el scrolls into view
  function onView(el, fn, { threshold = 0.35, rootMargin = '0px' } = {}) {
    if (!('IntersectionObserver' in window)) { fn(); return; }
    const io = new IntersectionObserver((entries) => {
      entries.forEach((e) => { if (e.isIntersecting) { io.disconnect(); fn(); } });
    }, { threshold, rootMargin });
    io.observe(el);
  }

  // an svg that sits on top of an element, same size, no pointer events
  function overlay(host, cls = '') {
    const svg = svgEl('svg', { class: 'thread-layer ' + cls, 'aria-hidden': 'true', focusable: 'false' });
    host.appendChild(svg);
    const size = () => {
      const w = host.clientWidth, h = host.clientHeight;
      svg.setAttribute('viewBox', `0 0 ${w} ${h}`);
      svg.setAttribute('width', w); svg.setAttribute('height', h);
      return { w, h };
    };
    return { svg, size };
  }

  /* ---------- 1 · the knot (film scene 1 + 6) ----------
     Draws itself, sits still, then twitches like it's alive.
     untangle(t) pulls the loose end: the pull travels from the end
     back through the knot, so the visitor's scroll does the untangling. */

  function Knot(svg, opts) {
    const o = Object.assign({ cx: 200, cy: 200, size: 120, seed: 7, turns: 3.9, end: null, start: null, width: null }, opts);
    let knot = knotPoints(o.cx, o.cy, o.size, o.seed, { turns: o.turns });
    if (o.start) knot.unshift(o.start);
    let line = linePoints(knot.length, o.start || knot[0], o.end || knot[knot.length - 1], 10, o.seed + 1);
    const path = threadPath(svg, smooth(knot), { hidden: true, width: o.width });
    let t = 0, twitch = 0, raf = 0, alive = false, phase = 0;

    function frame(now) {
      const n = knot.length;
      const pts = knot.map((p, i) => {
        // pull travels from the loose end (start) along the thread
        const local = clamp(t * 1.7 - (i / n) * 0.7);
        const k = ease.inOut(local);
        // twitch: a small breathing wave, only while still knotted
        const w = twitch * (1 - k) * Math.sin(now / 260 + i * 0.55) * (o.size * 0.012);
        return [lerp(p[0], line[i][0], k) + w, lerp(p[1], line[i][1], k) - w];
      });
      path.setAttribute('d', smooth(pts));
    }
    // the twitch only runs while the knot is still a knot (saves battery once it's pulled straight)
    function loop(now) {
      frame(now);
      raf = alive && t < 0.999 ? requestAnimationFrame(loop) : 0;
    }

    return {
      path,
      async appear(duration = 1800) {
        setDrawn(path, 0);
        await drawOn(path, { duration, easing: 'cubic-bezier(.45,.05,.2,1)' });
        if (reduced()) return;
        await new Promise((r) => setTimeout(r, 900)); // "two seconds of stillness" (shortened for the web)
        alive = true; twitch = 1; raf = requestAnimationFrame(loop);
      },
      untangle(v) {
        t = clamp(v);
        if (alive && !raf && t < 0.999) raf = requestAnimationFrame(loop);
        if (!raf) frame(performance.now());
      },
      rebuild(next) {
        Object.assign(o, next);
        knot = knotPoints(o.cx, o.cy, o.size, o.seed, { turns: o.turns });
        if (o.start) knot.unshift(o.start);
        line = linePoints(knot.length, o.start || knot[0], o.end || knot[knot.length - 1], 10, o.seed + 1);
        frame(performance.now());
      },
      stop() { alive = false; cancelAnimationFrame(raf); },
    };
  }

  /* ---------- 2 · the spine (the thread that runs down the page) ----------
     One path through every section. It draws as you scroll, so the tip
     always sits a little below the middle of the screen. Each section says
     where the thread goes with data-spine="x y, x y, loop, x y"
     (fractions of the section's width and height). On phones it uses
     data-spine-m, or a straight line 24px in from the left edge. */

  function Spine(root, opts = {}) {
    const svg = svgEl('svg', { class: 'spine', 'aria-hidden': 'true', focusable: 'false' });
    root.prepend(svg);
    const path = threadPath(svg, '', { hidden: true });
    const tip = svgEl('circle', { r: 5, fill: RED, class: 'spine-tip' }, svg);
    let samples = [], total = 0, enabled = true;

    function loopPts(x, y, r, seed) {
      const rr = rng(seed), pts = [];
      for (let i = 0; i <= 10; i++) {
        const a = -Math.PI / 2 + (i / 10) * Math.PI * 2.15;
        pts.push([x + Math.cos(a) * r * (1 + (rr() - 0.5) * 0.15), y + r + Math.sin(a) * r * 0.9]);
      }
      return pts;
    }

    function build() {
      const mobile = window.innerWidth <= 720;
      const docTop = root.getBoundingClientRect().top + window.scrollY;
      const W = root.clientWidth, H = root.scrollHeight;
      svg.setAttribute('viewBox', `0 0 ${W} ${H}`);
      svg.style.height = H + 'px';
      let pts = [], seed = 11;
      const start = opts.startPoint ? opts.startPoint() : null;
      if (start) pts.push(start);
      root.querySelectorAll('[data-spine]').forEach((sec) => {
        // phones: a straight line in the left gutter, clear of the text
        const spec = (mobile && sec.dataset.spineM) || (mobile ? '0.022 0, 0.022 1' : sec.dataset.spine);
        const top = sec.getBoundingClientRect().top + window.scrollY - docTop;
        const h = sec.offsetHeight, w = W;
        spec.split(',').map((s) => s.trim()).forEach((tok) => {
          seed++;
          if (tok === 'loop') {
            const last = pts[pts.length - 1];
            if (last) pts.push(...loopPts(last[0], last[1], mobile ? 18 : 34, seed));
            return;
          }
          const [fx, fy] = tok.split(/\s+/).map(Number);
          pts.push([fx * w, top + fy * h]);
        });
      });
      if (pts.length < 2) return;
      // fill in points so the wobble has something to bend
      const dense = [];
      for (let i = 0; i < pts.length - 1; i++) {
        const a = pts[i], b = pts[i + 1];
        const steps = Math.max(1, Math.round(Math.hypot(b[0] - a[0], b[1] - a[1]) / 140));
        for (let s = 0; s < steps; s++) dense.push([lerp(a[0], b[0], s / steps), lerp(a[1], b[1], s / steps)]);
      }
      dense.push(pts[pts.length - 1]);
      path.setAttribute('d', smooth(wobble(dense, mobile ? 3 : 7, 5)));
      // sample the real length so scroll maps to "how far down" the thread is
      total = path.getTotalLength();
      samples = [];
      let maxY = -Infinity;
      for (let i = 0; i <= 400; i++) {
        const pt = path.getPointAtLength((i / 400) * total);
        maxY = Math.max(maxY, pt.y);
        samples.push({ t: i / 400, y: maxY, x: pt.x, py: pt.y });
      }
      update();
    }

    function update() {
      if (!samples.length || !enabled) return;
      if (reduced()) { setDrawn(path, 1); tip.style.opacity = '0'; return; }
      const docTop = root.getBoundingClientRect().top + window.scrollY;
      const target = window.scrollY + window.innerHeight * 0.62 - docTop;
      let lo = 0, hi = samples.length - 1;
      while (lo < hi) { const mid = (lo + hi) >> 1; if (samples[mid].y < target) lo = mid + 1; else hi = mid; }
      const s = samples[lo];
      setDrawn(path, s.t);
      tip.setAttribute('cx', s.x); tip.setAttribute('cy', s.py);
      tip.style.opacity = s.t > 0.002 && s.t < 0.998 ? '1' : '0';
    }

    let tm = 0;
    const rebuild = () => { clearTimeout(tm); tm = setTimeout(build, 120); };
    window.addEventListener('resize', rebuild);
    // anything that changes the page height (the quiz result, the receipt, a font swap) re-routes the thread
    if ('ResizeObserver' in window) {
      let lastH = 0;
      new ResizeObserver(() => { const h = root.scrollHeight; if (Math.abs(h - lastH) > 2) { lastH = h; rebuild(); } }).observe(root);
    }
    window.addEventListener('load', build);
    if (document.fonts) document.fonts.ready.then(build);
    window.addEventListener('scroll', () => requestAnimationFrame(update), { passive: true });
    build();
    return { path, build, update, set enabled(v) { enabled = v; } };
  }

  /* ---------- 3 · tie (film scene 3) ----------
     The thread draws around two cards and ties them together. */

  function tie(host, a, b, { seed = 21, delay = 0 } = {}) {
    const { svg, size } = overlay(host, 'tie-layer');
    size();
    const hb = host.getBoundingClientRect();
    const ra = a.getBoundingClientRect(), rb = b.getBoundingClientRect();
    const ax = ra.left - hb.left, ay = ra.top - hb.top, bx = rb.left - hb.left, by = rb.top - hb.top;
    const midY = (Math.max(ay + ra.height, by + rb.height) + Math.min(ay, by)) / 2;
    const gap = (bx - (ax + ra.width)) / 2 + ax + ra.width;
    const pts = [
      [ax - 30, midY + 10], [ax + ra.width * 0.3, midY + 4], [gap - 30, midY],
      [gap - 4, midY - 46], [gap + 30, midY - 30], [gap + 6, midY + 4],      // the loop of the bow
      [gap - 26, midY + 34], [gap - 4, midY + 56], [gap + 26, midY + 38], [gap + 4, midY + 2],
      [bx + rb.width * 0.7, midY + 6], [bx + rb.width + 30, midY - 4],
    ];
    const p = threadPath(svg, smooth(wobble(pts, 3, seed)), { hidden: true });
    return drawOn(p, { duration: 1400, delay });
  }

  /* ---------- 4 · zip (film scene 4 transition) ----------
     A thread zips across a box and pulls itself out the other side.
     Same move every time, so visitors learn it (like the film's zip sound). */

  function zip(host, { seed = 31, from = 'left', y = 0.5 } = {}) {
    if (reduced()) return Promise.resolve();
    const { svg, size } = overlay(host, 'zip-layer');
    const { w, h } = size();
    const ltr = from === 'left';
    const pts = linePoints(9, [ltr ? -20 : w + 20, h * y + 18], [ltr ? w + 20 : -20, h * y - 18], 26, seed);
    const p = threadPath(svg, smooth(pts), { hidden: true });
    return drawOn(p, { duration: 420, easing: 'cubic-bezier(.6,0,.2,1)' })
      .then(() => drawOn(p, { duration: 380, reverse: true, easing: 'cubic-bezier(.6,0,.4,1)' }))
      .then(() => svg.remove());
  }

  /* ---------- 5 · squiggle underline ----------
     Hand-drawn underline under a word. Draws on hover / focus / view. */

  function squiggle(el, { seed = 41, onViewDraw = false } = {}) {
    const wrap = document.createElement('span');
    wrap.className = 'squiggle-svg';
    el.appendChild(wrap);
    const svg = svgEl('svg', { viewBox: '0 0 100 12', preserveAspectRatio: 'none', 'aria-hidden': 'true' }, wrap);
    const pts = [];
    for (let i = 0; i <= 8; i++) pts.push([2 + i * 12, 6 + (i % 2 ? 3 : -2.5)]);
    const p = threadPath(svg, smooth(wobble(pts, 0.8, seed)), { hidden: true, width: '3px', fixedWidth: true });
    const go =() => drawOn(p, { duration: 520 });
    const back = () => { if (!onViewDraw) drawOn(p, { duration: 260, reverse: true }); };
    el.addEventListener('mouseenter', go); el.addEventListener('focusin', go);
    el.addEventListener('mouseleave', back); el.addEventListener('focusout', back);
    if (onViewDraw) onView(el, go, { threshold: 0.9 });
    return p;
  }

  /* ---------- 6 · cursor thread ----------
     A short loose end follows the pointer, like Jaz holding the thread.
     Desktop only, never with reduced motion, hides over form fields. */

  function cursorThread() {
    if (reduced() || !window.matchMedia('(pointer: fine)').matches) return;
    const svg = svgEl('svg', { class: 'cursor-thread', 'aria-hidden': 'true' });
    document.body.appendChild(svg);
    const p = threadPath(svg, '', { width: '3px' });
    const N = 14, pts = Array.from({ length: N }, () => [-50, -50]);
    let mx = -50, my = -50, idle = 0, hidden = false;
    window.addEventListener('pointermove', (e) => {
      mx = e.clientX; my = e.clientY; idle = 0;
      hidden = !!e.target.closest('input, textarea, select, iframe, [data-no-cursor]');
    }, { passive: true });
    document.addEventListener('pointerleave', () => { hidden = true; });
    (function tick() {
      pts[0] = [lerp(pts[0][0], mx, 0.45), lerp(pts[0][1], my, 0.45)];
      for (let i = 1; i < N; i++) pts[i] = [lerp(pts[i][0], pts[i - 1][0], 0.42), lerp(pts[i][1], pts[i - 1][1] + 0.6, 0.42)];
      idle++;
      const spread = Math.hypot(pts[0][0] - pts[N - 1][0], pts[0][1] - pts[N - 1][1]);
      p.setAttribute('d', smooth(pts));
      svg.style.opacity = hidden || (idle > 90 && spread < 2) ? '0' : '1';
      requestAnimationFrame(tick);
    })();
  }

  /* ---------- 7 · throw (film scene 6) ----------
     The knot flies at the lens and fills the screen; hard cut on impact. */

  function throwKnot(fromEl, { color = RED } = {}) {
    if (reduced()) return Promise.resolve();
    const r = fromEl.getBoundingClientRect();
    const svg = svgEl('svg', { class: 'throw-layer', viewBox: '0 0 200 200', 'aria-hidden': 'true' });
    document.body.appendChild(svg);
    threadPath(svg, smooth(knotPoints(100, 100, 60, 9, { turns: 3.2 })), { color, width: '4px' });
    const startScale = Math.max(r.width, 40) / 200;
    const cx = r.left + r.width / 2 - window.innerWidth / 2, cy = r.top + r.height / 2 - window.innerHeight / 2;
    const end = Math.max(window.innerWidth, window.innerHeight) / 200 * 3;
    return svg.animate([
      { transform: `translate(${cx}px, ${cy}px) scale(${startScale}) rotate(0deg)` },
      { transform: `translate(${cx * 0.6}px, ${cy * 0.6 - 60}px) scale(${startScale * 1.4}) rotate(-25deg)`, offset: 0.25 },
      { transform: `translate(0px, 0px) scale(${end}) rotate(40deg)` },
    ], { duration: 650, easing: 'cubic-bezier(.55,0,.9,.4)', fill: 'forwards' }).finished.then(() => svg.remove());
  }

  /* ---------- 8 · stitch ----------
     A dashed running stitch that sews itself along an edge (cards, receipts). */

  function stitch(host, { seed = 51, edge = 'top', inset = 10 } = {}) {
    const { svg, size } = overlay(host, 'stitch-layer');
    const { w, h } = size();
    const y = edge === 'top' ? inset : h - inset;
    const p = threadPath(svg, smooth(linePoints(10, [inset, y], [w - inset, y], 2, seed)), { hidden: true, width: '2px' });
    p.style.strokeDasharray = '0.02 0.015';
    onView(host, () => { p.style.opacity = '1'; p.animate([{ clipPath: 'inset(0 100% 0 0)' }, { clipPath: 'inset(0 0 0 0)' }], { duration: reduced() ? 0 : 900, fill: 'both' }); });
    return p;
  }

  window.Thread = {
    RED, rng, clamp, lerp, ease, smooth, wobble, knotPoints, linePoints,
    svgEl, threadPath, setDrawn, drawOn, onView, overlay, reduced,
    Knot, Spine, tie, zip, squiggle, cursorThread, throwKnot, stitch,
  };
})();
