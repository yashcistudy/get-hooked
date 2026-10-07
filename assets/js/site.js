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
          for (const ch of n.textContent) {
            if (ch === ' ') { frag.appendChild(document.createTextNode(' ')); continue; }
            const s = document.createElement('span'); s.className = 'ch'; s.textContent = ch;
            s.style.animationDelay = (0.35 + i++ * 0.045) + 's'; frag.appendChild(s);
          }
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

  /* ---------- nav: hides on the way down, changes colour on ink ---------- */
  const nav = $('#nav');
  const themed = $$('[data-theme]').filter((el) => el.matches('section, footer'));
  let lastY = window.scrollY;
  function navUpdate() {
    const y = window.scrollY;
    nav.classList.toggle('is-scrolled', y > 20);
    nav.classList.toggle('is-hidden', y > lastY && y > 400 && !nav.contains(document.activeElement));
    lastY = y;
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
  const page = $('.page'), hero = $('#top'), knotHost = $('#heroKnot');
  const knotSvg = T.svgEl('svg', { 'aria-hidden': 'true' }, knotHost);
  let knot = null;
  function heroGeom() {
    const W = hero.clientWidth, H = hero.clientHeight, mobile = W <= 860;
    knotSvg.setAttribute('viewBox', `0 0 ${W} ${H}`);
    return {
      cx: mobile ? W * 0.58 : W * 0.72, cy: mobile ? Math.min(W * 0.32, 200) + 70 : H * 0.48,
      size: mobile ? Math.min(W * 0.26, 130) : Math.min(W * 0.17, H * 0.26),
      // the loose end never crosses the copy: desktop it drops straight down from the knot to the
      // hero's bottom edge (where the spine picks it up); phones it runs out past the right edge
      start: mobile ? [W + 12, (Math.min(W * 0.32, 200) + 70) + Math.min(W * 0.26, 130) * 0.55] : [W * 0.6, H],
      // phones: pulling drags the knot out past the right edge, away from the text
      end: mobile ? [W + 40, 40] : [W * 0.93, H - 34], mobile,
    };
  }
  function makeKnot() {
    const g = heroGeom();
    if (!knot) knot = T.Knot(knotSvg, Object.assign({ seed: 7, turns: 4.2 }, g));
    else knot.rebuild(g);
  }
  makeKnot();
  knot.appear(2000).then(() => Sound.play('thud'));
  function heroScroll() {
    const p = T.clamp(window.scrollY / (hero.offsetHeight * 0.75));
    knot.untangle(p);
  }
  window.addEventListener('scroll', () => requestAnimationFrame(heroScroll), { passive: true });
  window.addEventListener('resize', () => { makeKnot(); heroScroll(); });

  T.Spine(page, { startPoint: () => { const g = heroGeom(); return g.mobile ? null : [g.start[0], hero.offsetTop + g.start[1]]; } });

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

  /* ---------- voice: are you a jaz or a moj? ---------- */
  const VOICE = {
    jaz: { sticker: 'you\'re a jaz.', note: 'You have a plan, a backup plan, and a colour-coded plan for the backup. The cards below are in your voice now.', share: 'send this to your moj' },
    moj: { sticker: 'you\'re a moj.', note: 'You said "no" before you finished reading this. Respect. The cards below are in your voice now.', share: 'send this to your jaz' },
  };
  function setVoice(v, announce) {
    document.documentElement.dataset.voice = v;
    $$('[data-voice-text]').forEach((el) => {
      const next = el.dataset[v]; if (next == null || el.textContent === next) return;
      if (T.reduced()) { el.textContent = next; return; }
      el.animate([{ opacity: 1, transform: 'none' }, { opacity: 0, transform: 'translateY(-6px)' }], { duration: 140 }).finished.then(() => {
        el.textContent = next;
        el.animate([{ opacity: 0, transform: 'translateY(6px)' }, { opacity: 1, transform: 'none' }], { duration: 220, easing: 'cubic-bezier(.34,1.56,.64,1)' });
      });
    });
    $$('[data-pick]').forEach((b) => b.setAttribute('aria-pressed', String(b.dataset.pick === v)));
    if (announce) {
      const r = $('#quizResult'), st = $('#quizSticker');
      r.hidden = false;
      st.className = 'sticker is-' + v; st.textContent = VOICE[v].sticker;
      if (v === 'jaz') st.innerHTML = 'you\'re a <span class="j">j</span>az.';
      $('#quizNote').textContent = VOICE[v].note;
      $('#quizShare').textContent = VOICE[v].share;
      store.set('voice', v);
      Sound.play(v === 'jaz' ? 'tick' : 'snap');
    }
  }
  $$('[data-pick]').forEach((b) => b.addEventListener('click', () => setVoice(b.dataset.pick, true)));
  $('#quizShare').addEventListener('click', async () => {
    const v = document.documentElement.dataset.voice;
    const text = v === 'jaz' ? 'I\'m a Jaz (I plan everything). Are you a Jaz or a Moj?' : 'I\'m a Moj (I doubt everything). Are you a Jaz or a Moj?';
    const url = location.href.split('#')[0] + '#meet';
    try {
      if (navigator.share) await navigator.share({ title: 'hooked', text, url });
      else { await navigator.clipboard.writeText(text + ' ' + url); toast('copied. go start an argument.'); }
    } catch (e) { /* cancelled */ }
  });
  const savedVoice = store.get('voice');
  if (savedVoice === 'moj' || savedVoice === 'jaz') setVoice(savedVoice, true);

  /* ---------- how we think: flip, stamp, crumple, tie ---------- */
  $$('.card').forEach((card) => {
    card.addEventListener('click', () => {
      if (card.classList.contains('is-crumpled')) return;
      const flipped = card.getAttribute('aria-pressed') === 'true';
      card.setAttribute('aria-pressed', String(!flipped));
      Sound.play('tick');
      if (card.classList.contains('card-doomed') && !flipped) {
        setTimeout(() => { card.classList.add('is-stamped'); Sound.play('thud'); }, 450);
        setTimeout(() => { card.classList.add('is-crumpled'); Sound.play('crumple'); }, 1500);
        setTimeout(() => {
          card.classList.remove('is-crumpled', 'is-stamped'); card.setAttribute('aria-pressed', 'false');
          toast('we fished it out of the bin. it\'s a reel now.');
        }, 3200);
      }
    });
  });
  const cardsEl = $('#cards');
  let tied = false;
  function doTie() {
    $$('.tie-layer', cardsEl).forEach((s) => s.remove());
    const [a, b] = $$('.card', cardsEl);
    if (window.innerWidth <= 860) return; // stacked cards: no bow
    T.tie(cardsEl, a, b, { delay: 300 }).then(() => Sound.play('zip'));
    tied = true;
  }
  T.onView(cardsEl, doTie, { threshold: 0.5 });
  window.addEventListener('resize', () => { if (tied) { clearTimeout(doTie.tm); doTie.tm = setTimeout(doTie, 250); } });

  /* ---------- videos: light YouTube embeds ---------- */
  const POSTER = {
    knot: (el) => {
      const s = T.svgEl('svg', { class: 'poster-thread', viewBox: '0 0 640 360', preserveAspectRatio: 'xMidYMid slice', 'aria-hidden': 'true' });
      T.threadPath(s, T.smooth(T.knotPoints(470, 170, 80, 7, { turns: 4 })), { width: '3px' });
      el.prepend(s);
    },
  };
  function buildPoster(yt) {
    const key = yt.dataset.video, id = (C.videos || {})[key] || (C.videos || {})[yt.dataset.fallback || ''] || '';
    const b = document.createElement('button');
    b.type = 'button'; b.className = 'yt-poster poster-' + (yt.dataset.poster || key);
    b.setAttribute('aria-label', (id ? 'play ' : '') + yt.dataset.title);
    b.innerHTML = `<span class="play" aria-hidden="true"></span><b>${yt.dataset.poster === 'konar' ? 'konar.' : yt.dataset.title.split(',')[0].toLowerCase()}</b><small>${id ? 'play with sound' : 'film goes up here soon'}</small>`;
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

  // modal for the world tiles
  const modal = $('#modal'), mbox = $('.modal-box', modal), mbody = $('.modal-body', modal);
  let lastFocus = null;
  function openVideo(key, title, vertical, fallback) {
    const id = (C.videos || {})[key] || (C.videos || {})[fallback || ''] || '';
    if (!id) { toast('this one\'s still in the edit. moj says soon.'); Sound.play('snap'); return; }
    lastFocus = document.activeElement;
    mbody.innerHTML = '<div class="yt"></div>';
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

  /* ---------- the cut: drag the playhead, hook at the end ---------- */
  const tl = $('#timeline'), ph = $('#playhead'), scenes = $$('#monitor .scene');
  const NAMES = ['product films', 'explainers', 'teasers & trailers', 'shorts & reels', 'hooked'];
  let pos = 0, hooked = false, lastScene = 0;
  function setPos(v, fromUser) {
    pos = T.clamp(v);
    ph.style.left = (pos * 100) + '%';
    const idx = pos >= 0.985 ? 4 : Math.min(3, Math.floor(pos * 4));
    ph.setAttribute('aria-valuenow', String(Math.round(pos * 100)));
    ph.setAttribute('aria-valuetext', NAMES[idx]);
    scenes.forEach((s, i) => s.classList.toggle('is-on', i === idx));
    if (idx !== lastScene && fromUser) Sound.play(idx === 4 ? 'click' : 'zip');
    lastScene = idx;
    const nowHooked = idx === 4;
    if (nowHooked !== hooked) { hooked = nowHooked; tl.classList.toggle('is-hooked', hooked); if (hooked) toast('click. that\'s the link.'); }
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
  setPos(0.06);
  // a little nudge the first time it's seen, so people know it moves
  T.onView(tl, () => {
    if (T.reduced()) return;
    const t0 = performance.now();
    (function nudge(now) {
      const k = (now - t0) / 1400; if (k > 1 || dragging) return;
      setPos(0.06 + Math.sin(k * Math.PI) * 0.12);
      requestAnimationFrame(nudge);
    })(t0);
  }, { threshold: 0.8 });

  /* ---------- the receipt ---------- */
  const picks = $('#picks'), rLines = $('#rLines'), rTotal = $('#rTotal'), rNo = $('#rNo');
  const items = (C.receipt || []).map((x) => Object.assign({}, x));
  const money = (n) => '$' + n.toLocaleString('en-US');
  items.forEach((it) => {
    const li = document.createElement('li'); li.className = 'pick';
    li.innerHTML = `<input type="checkbox" id="pick-${it.id}" ${it.on ? 'checked' : ''}><label for="pick-${it.id}"><b>${it.label}</b><small>${it.note}</small></label>`;
    $('input', li).addEventListener('change', (e) => { it.on = e.target.checked; Sound.play('tick'); printReceipt(); });
    picks.appendChild(li);
  });
  let orderNo = 1;
  function printReceipt() {
    const on = items.filter((i) => i.on);
    rLines.innerHTML = '';
    if (!on.length) { rLines.innerHTML = '<li class="is-empty">nothing yet. pick something.</li>'; }
    on.forEach((it, i) => {
      const li = document.createElement('li'); li.style.animationDelay = (i * 0.06) + 's';
      li.innerHTML = `<span>${it.label}</span><span>${it.price == null ? 'quote' : 'from ' + money(it.price)}</span>`;
      rLines.appendChild(li);
    });
    const allPriced = on.length && on.every((i) => i.price != null);
    rTotal.textContent = !on.length ? '$0' : allPriced ? 'from ' + money(on.reduce((s, i) => s + i.price, 0)) : 'we\'ll quote it';
    rNo.textContent = String(orderNo++).padStart(4, '0');
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
      const body = `Name: ${data.get('name')}\nEmail: ${data.get('email')}\nScary date: ${data.get('deadline') || '-'}\n\n${data.get('knot')}`;
      location.href = `mailto:${C.email}?subject=${encodeURIComponent('a knot for hooked')}&body=${encodeURIComponent(body)}`;
      ok = true;
    }
    form.hidden = true;
    $('#replyLine').textContent = C.replyDays ? `we'll write back within ${C.replyDays} days.` : 'we\'ll write back soon.';
    $('#received').hidden = false;
  });

  /* ---------- small threads everywhere ---------- */
  $$('.squiggle').forEach((el, i) => T.squiggle(el, { seed: 41 + i }));
  T.cursorThread();
})();
