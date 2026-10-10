/* hooked · site.js
   Every interaction is the thread doing a job from The Knot:
   pulling (hero), snapping (Moj), flying cards (Jaz), tying (how we think),
   zipping (the worlds), cutting (the timeline), throwing (contact). */
(function () {
  'use strict';
  const T = window.Thread;
  const C = window.HOOKED || {};
  const $ = (s, el = document) => el.querySelector(s);
  const $$ = (s, el = document) => Array.from(el.querySelectorAll(s));
  const store = {
    get(k) { try { return localStorage.getItem('hooked.' + k); } catch (e) { return null; } },
    set(k, v) { try { localStorage.setItem('hooked.' + k, v); } catch (e) { /* private mode */ } },
  };

  /* ---------- sound: off until someone turns it on ---------- */
  const Sound = (() => {
    let ctx = null, on = false;
    const btn = $('#sound');
    function ac() { if (!ctx) { const A = window.AudioContext || window.webkitAudioContext; if (A) ctx = new A(); } return ctx; }
    function noise(dur, { freq = 1200, q = 1, gain = 0.25, sweepTo = null, type = 'bandpass' } = {}) {
      const a = ac(); if (!a) return;
      const len = Math.floor(a.sampleRate * dur), buf = a.createBuffer(1, len, a.sampleRate), d = buf.getChannelData(0);
      for (let i = 0; i < len; i++) d[i] = (Math.random() * 2 - 1) * (1 - i / len);
      const src = a.createBufferSource(); src.buffer = buf;
      const f = a.createBiquadFilter(); f.type = type; f.frequency.value = freq; f.Q.value = q;
      if (sweepTo) f.frequency.exponentialRampToValueAtTime(sweepTo, a.currentTime + dur);
      const g = a.createGain(); g.gain.value = gain;
      src.connect(f).connect(g).connect(a.destination); src.start();
    }
    function tone(freq, dur, { type = 'sine', gain = 0.2, to = null } = {}) {
      const a = ac(); if (!a) return;
      const o = a.createOscillator(), g = a.createGain();
      o.type = type; o.frequency.value = freq;
      if (to) o.frequency.exponentialRampToValueAtTime(to, a.currentTime + dur);
      g.gain.setValueAtTime(gain, a.currentTime); g.gain.exponentialRampToValueAtTime(0.0001, a.currentTime + dur);
      o.connect(g).connect(a.destination); o.start(); o.stop(a.currentTime + dur);
    }
    const fx = {
      zip: () => noise(0.32, { freq: 600, sweepTo: 5000, q: 4, gain: 0.18 }),       // the thread transition
      tick: () => noise(0.05, { freq: 3200, q: 2, gain: 0.3 }),                       // paper card landing
      snap: () => { noise(0.04, { freq: 2600, q: 8, gain: 0.5 }); setTimeout(() => noise(0.09, { freq: 5000, type: 'highpass', gain: 0.25 }), 40); }, // snap + shutter
      click: () => { tone(1800, 0.06, { type: 'triangle', gain: 0.25 }); tone(900, 0.09, { gain: 0.15 }); }, // the two js hooking
      thud: () => tone(140, 0.25, { to: 60, gain: 0.35 }),
      crack: () => { noise(0.08, { freq: 900, q: 1, gain: 0.45 }); tone(660, 0.18, { type: 'triangle', gain: 0.08 }); setTimeout(() => tone(880, 0.22, { type: 'triangle', gain: 0.08 }), 160); },
      crumple: () => { for (let i = 0; i < 6; i++) setTimeout(() => noise(0.04, { freq: 1500 + Math.random() * 2500, q: 1.5, gain: 0.2 }), i * 45); },
      whoosh: () => noise(0.5, { freq: 300, sweepTo: 2400, q: 0.8, gain: 0.25 }),
    };
    function set(v) {
      on = v; btn.setAttribute('aria-pressed', String(v));
      btn.querySelector('.sound-label').textContent = v ? 'sound on' : 'sound off';
      store.set('sound', v ? '1' : '0');
      if (v) { ac() && ctx.resume(); fx.click(); }
    }
    btn.addEventListener('click', () => set(!on));
    return { play(name) { if (on && fx[name]) try { fx[name](); } catch (e) { /* no audio */ } }, get on() { return on; } };
  })();

  /* ---------- toast ---------- */
  let toastTm = 0;
  function toast(msg) {
    const t = $('#toast'); t.textContent = msg; t.classList.add('is-on');
    clearTimeout(toastTm); toastTm = setTimeout(() => t.classList.remove('is-on'), 2600);
  }

  /* ---------- type-on headlines (film scene 1) ---------- */
  function typeOn(el) {
    let i = 0;
    const walk = (node) => {
      Array.from(node.childNodes).forEach((n) => {
        if (n.nodeType === 3) {
          const frag = document.createDocumentFragment();
          n.textContent.split(/(\s+)/).forEach((word) => {
            if (!word) return;
            if (/^\s+$/.test(word)) { frag.appendChild(document.createTextNode(' ')); return; }
            const w = document.createElement('span'); w.className = 'w';
            for (const ch of word) {
              const s = document.createElement('span'); s.className = 'ch'; s.textContent = ch;
              s.style.animationDelay = (0.35 + i++ * 0.045) + 's'; w.appendChild(s);
            }
            frag.appendChild(w);
          });
          n.replaceWith(frag);
        } else if (n.nodeType === 1 && n.tagName !== 'BR') walk(n);
      });
    };
    el.setAttribute('aria-label', el.textContent.replace(/\s+/g, ' ').trim());
    walk(el);
    $$('.ch', el).forEach((c) => c.setAttribute('aria-hidden', 'true'));
  }
  $$('[data-typeon]').forEach(typeOn);
  // every j in a display headline goes red
  $$('.display, .display-sm, .world-label').forEach((el) => {
    const walker = document.createTreeWalker(el, NodeFilter.SHOW_TEXT);
    const nodes = []; while (walker.nextNode()) nodes.push(walker.currentNode);
    nodes.forEach((n) => {
      if (n.parentElement.classList.contains('j') || !/j/i.test(n.textContent)) return;
      if (n.parentElement.classList.contains('ch')) { if (/j/i.test(n.textContent)) n.parentElement.classList.add('j'); return; }
      const frag = document.createDocumentFragment();
      n.textContent.split(/(j)/i).forEach((part) => {
        if (/^j$/i.test(part)) { const s = document.createElement('span'); s.className = 'j'; s.textContent = part; frag.appendChild(s); }
        else if (part) frag.appendChild(document.createTextNode(part));
      });
      n.replaceWith(frag);
    });
  });

  /* ---------- nav: always on top, changes colour on ink ---------- */
  const nav = $('#nav');
  const themed = $$('[data-theme]').filter((el) => el.matches('section, footer'));
  function navUpdate() {
    const y = window.scrollY;
    nav.classList.toggle('is-scrolled', y > 20);
    const probe = 36;
    let on = 'paper';
    for (const s of themed) { const r = s.getBoundingClientRect(); if (r.top <= probe && r.bottom > probe) { on = s.dataset.theme; break; } }
    // the split section: left half paper, right half ink; the logo sits on the paper side
    nav.dataset.on = on;
    $$('.nav-links a').forEach((a) => {
      const sec = $(a.getAttribute('href')); if (!sec) return;
      const r = sec.getBoundingClientRect(); a.classList.toggle('is-here', r.top <= window.innerHeight * 0.4 && r.bottom > window.innerHeight * 0.4);
    });
  }
  window.addEventListener('scroll', () => requestAnimationFrame(navUpdate), { passive: true });
  navUpdate();

  /* ---------- hero knot + the spine ---------- */
  const page = $('.page'), hero = $('#top'), knotHost = $('#heroKnot'), still = $('.still-frame'), knotNote = $('#knotNote');
  const knotSvg = T.svgEl('svg', { 'aria-hidden': 'true' }, knotHost);
  let knot = null;
  function heroGeom() {
    const W = hero.clientWidth, H = hero.clientHeight, mobile = W <= 860;
    knotSvg.setAttribute('viewBox', `0 0 ${W} ${H}`);
    if (mobile) {
      const cy = Math.min(W * 0.28, 180) + 70, size = Math.min(W * 0.22, 110);
      return { cx: W * 0.62, cy, size, start: [W + 12, cy - size * 0.35], end: [W + 40, 40], mobile };
    }
    // desktop: the knot (your brief) hangs off the top corner of the film still,
    // its loose end drops down the still's left side to the spine
    const hr = hero.getBoundingClientRect(), f = still.getBoundingClientRect();
    const fl = f.left - hr.left, ft = f.top - hr.top;
    const size = Math.min(f.width * 0.17, 104);
    return { cx: fl + size * 0.2, cy: ft + size * 0.15, size, start: [fl - size * 0.9, H], end: [W * 0.95, H - 34], mobile };
  }
  function placeNote(g) {
    if (!knotNote) return;
    knotNote.style.left = (g.mobile ? 18 : g.cx + g.size * 1.1) + 'px';
    knotNote.style.top = (g.cy - g.size * (g.mobile ? 0.5 : 1.25)) + 'px';
  }
  function makeKnot() {
    const g = heroGeom();
    if (!knot) knot = T.Knot(knotSvg, Object.assign({ seed: 7, turns: 4.2 }, g));
    else knot.rebuild(g);
    placeNote(g);
  }
  makeKnot();
  knot.appear(2000).then(() => Sound.play('thud'));
  function heroScroll() {
    const p = T.clamp(window.scrollY / (hero.offsetHeight * 0.75));
    knot.untangle(p);
    if (knotNote) knotNote.style.opacity = String(Math.max(0, 1 - p * 3));
  }
  window.addEventListener('scroll', () => requestAnimationFrame(heroScroll), { passive: true });
  window.addEventListener('resize', () => { makeKnot(); heroScroll(); });
  // the still's photo can load after first layout: re-place the knot once it has
  const stillImg = $('img', still); if (stillImg && !stillImg.complete) stillImg.addEventListener('load', () => { makeKnot(); heroScroll(); });

  T.Spine(page, { startPoint: () => { const g = heroGeom(); return g.mobile ? null : [g.start[0], hero.offsetTop + g.start[1]]; } });

  const isPhone = () => window.matchMedia('(max-width: 760px)').matches;

  /* ---------- orbit catch: the logo moment (meet on phones, end of the cut, footer) ---------- */
  const orbits = new Map();
  $$('.orbit-slot').forEach((slot) => {
    const o = window.Orbit ? window.Orbit.mount(slot, { onCatch: () => Sound.play('click') }) : null;
    if (!o) return;
    orbits.set(slot, o);
    if (slot.classList.contains('orbit-cut')) { o.hide(); return; } // plays when the playhead hooks
    o.hide();
    if (slot.classList.contains('orbit-board')) {
      // the first seconds: the two of us, then the logo lands on the board we're holding
      setTimeout(() => o.play(), 900);
      let last = Date.now();
      still.addEventListener('mouseenter', () => { if (Date.now() - last > 4500) { last = Date.now(); o.play(); } });
      return;
    }
    T.onView(slot, () => o.play(), { threshold: 0.6 });
    slot.addEventListener('click', () => o.play());
  });

  /* ---------- meet the two ---------- */
  const jaz = $('.person-jaz'), moj = $('.person-moj');
  $('#jazPhoto').addEventListener('click', () => {
    jaz.classList.remove('is-pulling'); void jaz.offsetWidth; jaz.classList.add('is-pulling');
    [0, 120, 240].forEach((d) => setTimeout(() => Sound.play('tick'), d + 300));
    setTimeout(() => jaz.classList.remove('is-pulling'), 2600);
  });
  $('#mojPhoto').addEventListener('click', () => {
    moj.classList.remove('is-snapping'); void moj.offsetWidth; moj.classList.add('is-snapping');
    Sound.play('snap');
    setTimeout(() => moj.classList.remove('is-snapping'), 700);
  });

  /* ---------- prices: "where's your project at?" picks a package (both of us, every time) ---------- */
  const RT = C.routes || {};
  $$('[data-route]').forEach((b) => b.addEventListener('click', () => {
    const r = RT[b.dataset.route]; if (!r) return;
    $$('[data-route]').forEach((x) => x.setAttribute('aria-pressed', String(x === b)));
    $('#pickerNote').innerHTML = r.note;
    Sound.play('tick');
    selectPackage(r.pkg, true);
  }));

  /* ---------- how we think: flip, see what it became, the bin ---------- */
  $$('.card').forEach((card) => {
    const slot = card.closest('.card-slot'), became = $('.became', slot);
    card.addEventListener('click', () => {
      if (card.classList.contains('is-crumpled')) return;
      const flipped = card.getAttribute('aria-pressed') === 'true';
      card.setAttribute('aria-pressed', String(!flipped));
      Sound.play('tick');
      if (card.classList.contains('card-doomed')) {
        if (flipped) return;
        setTimeout(() => { card.classList.add('is-stamped'); Sound.play('thud'); }, 450);
        setTimeout(() => { card.classList.add('is-crumpled'); Sound.play('crumple'); }, 1500);
        setTimeout(() => {
          card.classList.remove('is-crumpled', 'is-stamped'); card.setAttribute('aria-pressed', 'false');
          toast('we fished it out of the bin. it\'s a reel now.');
          slot.classList.add('is-made'); Sound.play('click');
        }, 3200);
        return;
      }
      if (!flipped) setTimeout(() => { slot.classList.add('is-made'); Sound.play('zip'); }, 420);
    });
    if (became && became.tagName === 'BUTTON') became.addEventListener('click', () => openVideo(became.dataset.video, became.dataset.title, became.dataset.vertical));
  });
  const cardsEl = $('#cards');
  let tied = false;
  function doTie() {
    $$('.tie-layer', cardsEl).forEach((s) => s.remove());
    const [a, b] = $$('.card', cardsEl);
    if (window.innerWidth <= 860) return; // stacked or swiped cards: no bow
    T.tie(cardsEl, a, b, { delay: 300 }).then(() => Sound.play('zip'));
    tied = true;
  }
  T.onView(cardsEl, doTie, { threshold: 0.5 });
  window.addEventListener('resize', () => { if (tied) { clearTimeout(doTie.tm); doTie.tm = setTimeout(doTie, 250); } });

  /* ---------- videos: light YouTube embeds ---------- */
  const POSTER = {
    knot: (el) => {
      const s = T.svgEl('svg', { class: 'poster-thread', viewBox: '0 0 640 360', preserveAspectRatio: 'xMidYMid slice', 'aria-hidden': 'true' });
      const p = T.threadPath(s, T.smooth(T.knotPoints(470, 175, 82, 7, { turns: 4 })), { width: '3px', hidden: true });
      el.prepend(s);
      T.onView(el, () => T.drawOn(p, { duration: 1600 }));
    },
  };
  const vid = (key, fallback) => (C.videos || {})[key] || (C.videos || {})[fallback || ''] || '';
  function buildPoster(yt) {
    const key = yt.dataset.video, id = vid(key, yt.dataset.fallback);
    const b = document.createElement('button');
    b.type = 'button'; b.className = 'yt-poster poster-' + (yt.dataset.poster || key);
    b.setAttribute('aria-label', (id ? 'play ' : '') + yt.dataset.title);
    b.innerHTML = `<span class="play" aria-hidden="true"></span><b>${yt.dataset.poster === 'konar' ? 'konar.' : yt.dataset.title.split(',')[0].toLowerCase()}</b><small>${id ? 'play with sound' : 'in the edit. goes up here soon.'}</small>`;
    if (id) { const img = new Image(); img.alt = ''; img.loading = 'lazy'; img.src = `https://i.ytimg.com/vi/${id}/hqdefault.jpg`; b.prepend(img); }
    else if (POSTER[yt.dataset.poster]) POSTER[yt.dataset.poster](b);
    b.addEventListener('click', () => play(yt, id));
    yt.innerHTML = ''; yt.appendChild(b);
  }
  function play(yt, id) {
    if (!id) { toast('this one\'s still in the edit. moj says soon.'); Sound.play('snap'); return; }
    const f = document.createElement('iframe');
    f.src = `https://www.youtube-nocookie.com/embed/${id}?autoplay=1&rel=0&modestbranding=1&playsinline=1`;
    f.title = yt.dataset.title; f.allow = 'accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share';
    f.allowFullscreen = true; f.referrerPolicy = 'strict-origin-when-cross-origin';
    yt.innerHTML = ''; yt.appendChild(f);
  }
  $$('.yt').forEach(buildPoster);

  // modal for tiles, cards and the timeline
  const modal = $('#modal'), mbox = $('.modal-box', modal), mbody = $('.modal-body', modal);
  let lastFocus = null;
  function openVideo(key, title, vertical, fallback) {
    const id = vid(key, fallback);
    if (!id) { toast('this one\'s still in the edit. moj says soon.'); Sound.play('snap'); return; }
    lastFocus = document.activeElement;
    mbody.innerHTML = '<div class="yt"></div>';
    $('.yt', mbody).dataset.title = title || '';
    mbox.classList.toggle('is-vertical', !!vertical);
    play($('.yt', mbody), id);
    modal.hidden = false; $('.modal-close', modal).focus();
  }
  function closeModal() { modal.hidden = true; mbody.innerHTML = ''; if (lastFocus) lastFocus.focus(); }
  $('.modal-close', modal).addEventListener('click', closeModal);
  modal.addEventListener('click', (e) => { if (e.target === modal) closeModal(); });
  document.addEventListener('keydown', (e) => { if (e.key === 'Escape' && !modal.hidden) closeModal(); });

  /* ---------- the worlds: the zip between worlds ---------- */
  $$('.world').forEach((w, i) => {
    let busy = false;
    const zipIt = () => { if (busy) return; busy = true; Sound.play('zip'); T.zip(w, { seed: 31 + i, from: i % 2 ? 'right' : 'left', y: 0.55 }).then(() => { busy = false; }); };
    w.addEventListener('mouseenter', zipIt);
    w.addEventListener('focus', zipIt);
    w.addEventListener('click', () => openVideo(w.dataset.video, w.dataset.title, w.dataset.vertical, w.dataset.fallback));
  });

  /* ---------- konar: spritz (it's honey) ---------- */
  const spritz = $('#spritz'), sub = $('#spritzSub');
  spritz.addEventListener('click', () => {
    Sound.play('crack');
    sub.textContent = '(it\'s honey)';
    clearTimeout(spritz.tm); spritz.tm = setTimeout(() => { sub.innerHTML = '&nbsp;'; }, 2200);
    if (T.reduced()) return;
    const r = spritz.getBoundingClientRect();
    const x0 = r.left + r.width * 0.2, y0 = r.top + 10;
    for (let i = 0; i < 46; i++) {
      const d = document.createElement('span'); d.className = 'mist';
      const s = 3 + Math.random() * 9; d.style.setProperty('--s', s + 'px');
      d.style.left = x0 + 'px'; d.style.top = y0 + 'px';
      document.body.appendChild(d);
      const ang = Math.PI + (Math.random() - 0.5) * 0.9, dist = 120 + Math.random() * 320;
      const dx = Math.cos(ang) * dist, dy = Math.sin(ang) * dist * 0.6 - 20;
      d.animate([
        { transform: 'translate(0,0) scale(.4)', opacity: 1 },
        { transform: `translate(${dx * 0.7}px, ${dy * 0.7}px) scale(1)`, opacity: 0.9, offset: 0.6 },
        { transform: `translate(${dx}px, ${dy + 90 + s * 6}px) scale(${1 + s / 10}, ${1.6 + s / 6})`, opacity: 0 },
      ], { duration: 1200 + Math.random() * 900, easing: 'cubic-bezier(.2,.7,.3,1)' }).finished.then(() => d.remove());
    }
  });

  /* ---------- the cut: our work on a timeline, hook at the end ---------- */
  const tl = $('#timeline'), ph = $('#playhead'), scenes = $$('#monitor .scene');
  const CLIPS = scenes.length - 1; // the last scene is the logo
  const NAMES = ['konar', 'on the chart', 'teasers', 'clay date', 'geekbazi', 'hooked'];
  const cutOrbit = orbits.get($('.orbit-cut'));
  let pos = 0, hooked = false, lastScene = 0;
  function setPos(v, fromUser) {
    pos = T.clamp(v);
    ph.style.left = (pos * 100) + '%';
    const idx = pos >= 0.985 ? CLIPS : Math.min(CLIPS - 1, Math.floor(pos * CLIPS));
    ph.setAttribute('aria-valuenow', String(Math.round(pos * 100)));
    ph.setAttribute('aria-valuetext', NAMES[idx]);
    scenes.forEach((s, i) => s.classList.toggle('is-on', i === idx));
    $$('.track .clip').forEach((c, i) => c.classList.toggle('is-on', i === idx));
    if (idx !== lastScene && fromUser) Sound.play(idx === CLIPS ? 'whoosh' : 'zip');
    lastScene = idx;
    const nowHooked = idx === CLIPS;
    if (nowHooked !== hooked) {
      hooked = nowHooked; tl.classList.toggle('is-hooked', hooked);
      if (hooked && cutOrbit) cutOrbit.play();
      if (hooked) toast('click. that\'s the link.');
    }
  }
  function fromEvent(e) { const r = tl.getBoundingClientRect(); return (e.clientX - r.left) / r.width; }
  let dragging = false;
  tl.addEventListener('pointerdown', (e) => { dragging = true; tl.setPointerCapture(e.pointerId); setPos(fromEvent(e), true); });
  tl.addEventListener('pointermove', (e) => { if (dragging) setPos(fromEvent(e), true); });
  tl.addEventListener('pointerup', () => { dragging = false; });
  tl.addEventListener('pointercancel', () => { dragging = false; });
  ph.addEventListener('keydown', (e) => {
    const step = e.shiftKey ? 0.1 : 0.02;
    if (e.key === 'ArrowRight' || e.key === 'ArrowUp') { setPos(pos + step, true); e.preventDefault(); }
    if (e.key === 'ArrowLeft' || e.key === 'ArrowDown') { setPos(pos - step, true); e.preventDefault(); }
    if (e.key === 'Home') { setPos(0, true); e.preventDefault(); }
    if (e.key === 'End') { setPos(1, true); e.preventDefault(); }
  });
  $$('.scene-play').forEach((b) => b.addEventListener('click', () => openVideo(b.dataset.video, b.dataset.title, b.dataset.vertical)));
  setPos(0.04);
  T.onView(tl, () => {
    if (T.reduced()) return;
    const t0 = performance.now();
    (function nudge(now) {
      const k = (now - t0) / 1400; if (k > 1 || dragging) return;
      setPos(0.04 + Math.sin(k * Math.PI) * 0.12);
      requestAnimationFrame(nudge);
    })(t0);
  }, { threshold: 0.8 });

  /* ---------- the receipt: one package + add-ons ---------- */
  const PK = (C.packages || []), AD = (C.addons || []);
  const picks = $('#picks'), addEl = $('#addons'), rLines = $('#rLines'), rTotal = $('#rTotal'), rNo = $('#rNo'), rSmall = $('#rSmall');
  const money = (n) => '$' + Math.round(n).toLocaleString('en-US');
  let chosen = 'direct';
  const addOn = new Set();
  PK.forEach((p) => {
    const li = document.createElement('li'); li.className = 'pick pick-pkg';
    li.innerHTML = `<input type="radio" name="pkg" id="pkg-${p.id}" value="${p.id}"><label for="pkg-${p.id}"><span class="pick-who">${p.tag || ''}</span><b>${p.label}</b><span class="pick-price">${p.was ? '' : 'from '}${money(p.price)}<small>${p.unit || ''}</small>${p.was ? `<s class="pick-was">${money(p.was)}</s>` : ''}</span><small class="pick-note">${p.note}</small></label>`;
    $('input', li).addEventListener('change', () => { chosen = p.id; Sound.play('tick'); printReceipt(); });
    picks.appendChild(li);
  });
  AD.forEach((a) => {
    const li = document.createElement('li'); li.className = 'pick pick-add';
    li.innerHTML = `<input type="checkbox" id="add-${a.id}"><label for="add-${a.id}"><b>${a.label} <span class="pick-plus">${a.pct ? '+' + a.pct + '%' : a.per ? '' : '+' + money(a.flat)}${a.per ? '' : (a.unit || '')}</span></b><small>${a.note}</small></label>`;
    $('input', li).addEventListener('change', (e) => { e.target.checked ? addOn.add(a.id) : addOn.delete(a.id); Sound.play('tick'); printReceipt(); });
    addEl.appendChild(li);
  });
  let orderNo = 1, receiptText = '';
  // an add-on can be priced per package (the 8-reel upgrade); it greys out where it doesn't apply
  const addVal = (a, p) => (a.per ? a.per[p.id] : a.pct ? p.price * a.pct / 100 : a.flat);
  function printReceipt() {
    const p = PK.find((x) => x.id === chosen) || PK[0]; if (!p) return;
    $$('input[name=pkg]').forEach((i) => { i.checked = i.value === p.id; });
    AD.filter((a) => a.per).forEach((a) => {
      const box = $('#add-' + a.id), ok = a.per[p.id] != null;
      box.disabled = !ok; box.closest('li').classList.toggle('is-off', !ok);
      $('.pick-plus', box.closest('li')).textContent = ok ? '+' + money(a.per[p.id]) + (a.unit || '') : a.only || '';
    });
    const lines = [[p.label, (p.was ? '' : 'from ') + money(p.price) + (p.unit || '')]];
    let total = p.price;
    AD.filter((a) => addOn.has(a.id) && addVal(a, p) != null).forEach((a) => {
      const v = addVal(a, p); total += v;
      lines.push([a.label + (a.pct ? ' +' + a.pct + '%' : ''), '+' + money(v) + (a.unit || '')]);
    });
    if (C.included) lines.push([C.included.label, 'free']);
    rLines.innerHTML = '';
    lines.forEach(([l, v], i) => {
      const li = document.createElement('li'); li.style.animationDelay = (i * 0.06) + 's';
      li.innerHTML = `<span>${l}</span><span>${v}</span>`; rLines.appendChild(li);
    });
    rTotal.textContent = 'from ' + money(total) + (p.unit || '');
    rSmall.textContent = (C.included ? `${C.included.label}: ${C.included.note}. ` : '') + (C.launchNote || 'launch prices, USD.');
    rNo.textContent = String(orderNo++).padStart(4, '0');
    const paper = $('#receiptPaper'); paper.style.animation = 'none'; void paper.offsetWidth; paper.style.animation = '';
    receiptText = lines.map(([l, v]) => `${l}: ${v}`).join('\n') + `\ntotal: from ${money(total)}${p.unit || ''}`;
    $('#receiptField').value = receiptText;
    const fr = $('#formReceipt'); fr.hidden = false; fr.innerHTML = `<b>on your receipt:</b> ${p.label}${addOn.size ? ' + ' + addOn.size + ' add-on' + (addOn.size > 1 ? 's' : '') : ''} · from ${money(total)}${p.unit || ''}`;
  }
  function selectPackage(id, go) {
    chosen = id; printReceipt();
    const li = $('#pkg-' + id) && $('#pkg-' + id).closest('li');
    if (li) { li.classList.remove('is-pinged'); void li.offsetWidth; li.classList.add('is-pinged'); }
    if (go && li && li.parentElement.scrollWidth > li.parentElement.clientWidth) {
      li.parentElement.scrollTo({ left: li.offsetLeft - 16, behavior: T.reduced() ? 'auto' : 'smooth' });
    }
  }
  printReceipt();

  /* ---------- contact: the knot grows as you type, then gets thrown ---------- */
  const ck = $('#contactKnot'), text = $('#knotText');
  const ckSvg = T.svgEl('svg', { viewBox: '0 0 400 260', 'aria-hidden': 'true' }, ck);
  const ckG = T.svgEl('g', {}, ckSvg);
  const ckPath = T.threadPath(ckG, '', {});
  function drawContactKnot() {
    const n = text.value.trim().length;
    const turns = 1.4 + Math.min(n / 60, 4.2);
    const size = 46 + Math.min(n / 6, 50);
    ckPath.setAttribute('d', T.smooth(T.knotPoints(200, 130, size, 9, { turns })));
    ckG.style.transform = `rotate(${Math.sin(n / 9) * 6}deg)`;
  }
  drawContactKnot();
  text.addEventListener('input', drawContactKnot);
  T.onView(ck, () => T.drawOn(ckPath, { duration: 1200 }));

  const form = $('#form'), note = $('#formNote'), sendBtn = $('#send');
  form.addEventListener('submit', async (e) => {
    e.preventDefault();
    note.textContent = '';
    let bad = null;
    ['name', 'email', 'knot'].forEach((n) => {
      const f = form.elements[n];
      const ok = n === 'email' ? /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(f.value.trim()) : f.value.trim().length > 1;
      f.setAttribute('aria-invalid', String(!ok)); if (!ok && !bad) bad = f;
    });
    if (bad) { note.textContent = bad.name === 'email' ? 'that email looks tangled. try again?' : 'we need a little more knot than that.'; bad.focus(); return; }
    if (form.elements._gotcha.value) return; // a bot filled the hidden field
    const data = new FormData(form);
    sendBtn.disabled = true; sendBtn.textContent = 'throwing…';
    Sound.play('whoosh');
    await T.throwKnot(ck);
    if (!T.reduced()) { const cf = document.createElement('div'); cf.className = 'cut-flash'; document.body.appendChild(cf); setTimeout(() => cf.remove(), 600); }
    Sound.play('thud');
    let ok = false;
    if (C.formspree) {
      try {
        const res = await fetch(C.formspree, { method: 'POST', body: data, headers: { Accept: 'application/json' } });
        ok = res.ok;
      } catch (err) { ok = false; }
      if (!ok) {
        sendBtn.disabled = false; sendBtn.textContent = 'send the knot';
        note.textContent = 'the knot bounced. email us at ' + C.email + ' and we\'ll catch it.';
        return;
      }
    } else {
      const body = `Name: ${data.get('name')}\nEmail: ${data.get('email')}\nScary date: ${data.get('deadline') || '-'}\n\n${data.get('knot')}\n\n${receiptText}`;
      location.href = `mailto:${C.email}?subject=${encodeURIComponent('a knot for hooked')}&body=${encodeURIComponent(body)}`;
      ok = true;
    }
    form.hidden = true;
    $('#replyLine').textContent = C.replyDays ? `we'll write back within ${C.replyDays} days.` : 'we\'ll write back soon.';
    $('#received').hidden = false;
  });

  /* ---------- phones: swipe decks ---------- */
  // each .deck becomes a thumb-swipe row on phones (CSS does the layout);
  // here we add the little red thread under it that fills as you swipe
  $$('.deck').forEach((deck) => {
    const bar = document.createElement('div'); bar.className = 'deck-thread'; bar.setAttribute('aria-hidden', 'true');
    const n = deck.children.length;
    bar.innerHTML = `<span class="deck-label">${deck.dataset.deck || ''} · swipe</span><span class="deck-track"><i></i>${Array.from({ length: n }, () => '<b></b>').join('')}</span>`;
    deck.after(bar);
    const fill = $('i', bar), beads = $$('b', bar);
    const update = () => {
      const max = deck.scrollWidth - deck.clientWidth;
      const t = max > 0 ? deck.scrollLeft / max : 0;
      fill.style.transform = `scaleX(${Math.max(0.04, t)})`;
      const k = Math.round(t * (n - 1));
      beads.forEach((b, i) => b.classList.toggle('is-on', i <= k));
    };
    deck.addEventListener('scroll', () => requestAnimationFrame(update), { passive: true });
    update();
  });

  /* ---------- phones: the thread nav (one knot per section) ---------- */
  const tnav = $('#threadNav');
  const secs = $$('main > section[data-label]');
  const stops = secs.filter((s) => s.hasAttribute('data-tn'));
  tnav.innerHTML = `<span class="tn-label" id="tnLabel">hello</span><span class="tn-track"><svg class="tn-svg" viewBox="0 0 100 20" preserveAspectRatio="none" aria-hidden="true"><path class="tn-bg" d="M1 10 C 12 6, 22 14, 34 10 S 56 6, 67 10 S 88 14, 99 10"/><clipPath id="tnClip"><rect class="tn-clip" x="0" y="-10" width="0" height="40"/></clipPath><path class="tn-fill" clip-path="url(#tnClip)" d="M1 10 C 12 6, 22 14, 34 10 S 56 6, 67 10 S 88 14, 99 10"/></svg>${stops.map((s, i) => `<a class="tn-knot" href="#${s.id}" style="left:${(1 + i / (stops.length - 1) * 98).toFixed(2)}%" aria-label="${s.dataset.label}"></a>`).join('')}</span>`;
  const tnClip = $('.tn-clip', tnav), tnLabel = $('#tnLabel'), tnKnots = $$('.tn-knot', tnav);
  let tnLast = -1;
  function tnUpdate() {
    // the red fill stops exactly at the knot of the section you're in, and creeps toward the next one
    const probe = window.scrollY + window.innerHeight * 0.45;
    const tops = stops.map((st) => st.getBoundingClientRect().top + window.scrollY);
    let f = 0;
    tops.forEach((top, i) => {
      if (probe < top) return;
      const next = tops[i + 1];
      f = next == null ? i : i + T.clamp((probe - top) / (next - top));
    });
    tnClip.setAttribute('width', (1 + f / Math.max(1, stops.length - 1) * 98).toFixed(2));
    let cur = 0;
    secs.forEach((s, i) => { if (s.getBoundingClientRect().top < window.innerHeight * 0.45) cur = i; });
    if (cur !== tnLast) {
      tnLast = cur; tnLabel.textContent = secs[cur].dataset.label;
      let stop = 0; stops.forEach((st, i) => { if (secs.indexOf(st) <= cur) stop = i; });
      tnKnots.forEach((k, i) => { k.classList.toggle('is-past', i < stop); k.classList.toggle('is-here', i === stop); });
      tnav.dataset.on = secs[cur].dataset.theme;
      if (!T.reduced()) tnLabel.animate([{ transform: 'translateY(6px) rotate(-3deg)', opacity: 0 }, { transform: 'none', opacity: 1 }], { duration: 260, easing: 'cubic-bezier(.34,1.56,.64,1)' });
    }
    tnav.classList.toggle('is-up', window.scrollY > window.innerHeight * 0.5 && !$('#contact').contains(document.activeElement));
  }
  window.addEventListener('scroll', () => requestAnimationFrame(tnUpdate), { passive: true });
  tnKnots.forEach((k) => k.addEventListener('click', () => Sound.play('tick')));
  tnUpdate();

  /* ---------- social: links from config, or "coming soon" ---------- */
  const SO = C.social || {};
  const NAMES_SO = { instagram: 'instagram', youtube: 'youtube', tiktok: 'tiktok' };
  let missing = false;
  $$('[data-social]').forEach((a) => {
    const url = SO[a.dataset.social];
    if (url) { a.href = url; a.target = '_blank'; a.rel = 'noopener'; }
    else {
      missing = true; a.href = '#social'; a.setAttribute('aria-describedby', 'socialNote');
      a.addEventListener('click', (e) => { e.preventDefault(); $('#socialNote').hidden = false; toast('our handle goes live soon. moj is still arguing about it.'); Sound.play('snap'); });
    }
  });
  if (SO.handle) $('#pmHandle').textContent = '@' + SO.handle.replace(/^@/, '');
  const fs = $('#footerSocial');
  if (fs) fs.innerHTML = Object.keys(NAMES_SO).filter((k) => SO[k]).map((k) => `<a href="${SO[k]}" target="_blank" rel="noopener">${NAMES_SO[k]}</a>`).join(' · ');

  /* ---------- hero: "pull the thread" pulls (scrolls on, the knot unties as it goes) ---------- */
  const pull = $('#pullHint');
  if (pull) {
    pull.addEventListener('click', () => Sound.play('zip'));
    const hidePull = () => pull.classList.toggle('is-gone', window.scrollY > 80);
    window.addEventListener('scroll', hidePull, { passive: true }); hidePull();
  }

  /* ---------- motion: three films that play while you look at them ---------- */
  const reels = $$('.reel video');
  const loadReel = (v) => { if (!v.src && v.dataset.src) { v.src = v.dataset.src; v.preload = 'auto'; } };
  const playReel = (v) => { loadReel(v); const pr = v.play(); if (pr && pr.catch) pr.catch(() => {}); };
  if ('IntersectionObserver' in window) {
    const io = new IntersectionObserver((es) => es.forEach((e) => {
      const v = e.target;
      if (e.isIntersecting && e.intersectionRatio >= 0.6) { if (!T.reduced()) playReel(v); else loadReel(v); }
      else if (!v.paused) v.pause();
    }), { threshold: [0, 0.6] });
    reels.forEach((v) => io.observe(v));
  }
  reels.forEach((v) => {
    const btn = $('.reel-sound', v.parentElement);
    v.parentElement.addEventListener('click', (e) => {
      if (e.target === btn) return;
      if (v.paused) playReel(v); else v.pause();
    });
    btn.addEventListener('click', () => {
      const on = v.muted;
      reels.forEach((o) => { o.muted = true; const b = $('.reel-sound', o.parentElement); b.setAttribute('aria-pressed', 'false'); b.textContent = 'sound off'; });
      if (on) { v.muted = false; playReel(v); btn.setAttribute('aria-pressed', 'true'); btn.textContent = 'sound on'; }
      Sound.play('click');
    });
  });
  // "want one for your product?" picks that package on the receipt and takes you there
  $$('[data-pick]').forEach((b) => b.addEventListener('click', () => {
    selectPackage(b.dataset.pick, true); Sound.play('tick');
    $('#receipt').scrollIntoView({ behavior: T.reduced() ? 'auto' : 'smooth' });
  }));

  /* ---------- small threads everywhere ---------- */
  $$('.squiggle').forEach((el, i) => T.squiggle(el, { seed: 41 + i }));
  T.cursorThread();
})();
