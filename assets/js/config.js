/*
  hooked · config.js
  Everything you'll want to change without touching the rest of the code.
*/
window.HOOKED = {
  // Where the contact form sends. Empty = it opens an email draft instead.
  formspree: 'https://formspree.io/f/xljgjald',
  email: 'get.hooked.with.jj@gmail.com',

  // How many days until you reply. null = "soon". Only promise what you can keep.
  replyDays: null,

  // YouTube video IDs (the part after watch?v= ). Empty = a "still in the edit" poster.
  videos: {
    knot: '',        // The Knot, the showcase film (the main one, right under the hero)
    konar: '',       // Konar, a perfume ad except it's honey (1:00)
    chart: '',       // On the Chart, finance explainer
    teaser: '',      // teasers & trailers (a playlist or one video)
    short: '',       // the clay date reel (vertical)
    geekbazi: '',    // a Geekbazi board game review you're proud of
    product: '',     // "what we make" tile: product films (falls back to konar)
    explainer: '',   // "what we make" tile: explainers (falls back to chart)
  },

  // Social links (full URLs). Empty = the button says the handle is coming soon.
  social: {
    instagram: '',   // e.g. 'https://www.instagram.com/yourhandle'
    youtube: '',     // e.g. 'https://www.youtube.com/@yourhandle'
    tiktok: '',      // e.g. 'https://www.tiktok.com/@yourhandle'
    handle: '',      // e.g. 'gethooked' (shown on the phone in the social section)
  },

  // The receipt. Same packages and prices as the packages-and-process PDF.
  // price = launch price for our first 5 clients (USD). was = the regular price, shown crossed out.
  // unit shows after it. tag = the one-line "what it is". The three monthly packages are 4 reels;
  // the "8 reels" add-on swaps in the 8-reel price.
  packages: [
    { id: 'cut', label: 'the cut', tag: 'you send footage', note: '4 reels a month. You film it, Moj cuts it, Jaz writes the hooks and captions. Cover frames and light motion.', price: 150, was: 180, unit: '/mo' },
    { id: 'direct', label: 'direct', tag: 'you film it', note: '4 reels a month. We write the scripts and plan every shot, you film on your phone, we edit. Hooks, captions, light motion.', price: 230, was: 280, unit: '/mo' },
    { id: 'hooked', label: 'fully hooked', tag: 'we do all of it', note: '4 reels a month. Ideas, scripts, a shoot in our studio or AI shots, edit, sound and high-end motion.', price: 475, was: 600, unit: '/mo' },
    { id: 'mshort', label: 'motion short', tag: 'motion · up to 30 s', note: 'A tiny animated story: one idea, one character or product, start to finish.', price: 275, was: 350, unit: '' },
    { id: 'mstory', label: 'motion story', tag: 'motion · up to 90 s', note: 'A full animated story or explainer: your product, a problem, a turn and an ending.', price: 625, was: 800, unit: '' },
    { id: 'film', label: 'hero film', tag: 'film · up to 90 s', note: 'Your one big launch film, like The Knot. Scripted, shot in our studio or with AI shots, edited, scored and animated.', price: 900, unit: '' },
  ],
  addons: [
    { id: 'eight', label: '8 reels a month', note: 'twice the reels, less per reel', per: { cut: 100, direct: 150, hooked: 325 }, wasPer: { cut: 120, direct: 170, hooked: 400 }, unit: '/mo', only: 'monthly packages only' },
    { id: 'rush', label: 'rush', note: 'delivered in under 48 hours', pct: 30 },
    { id: 'ads', label: 'paid-ad rights', note: 'per month you run it as an ad', pct: 30, unit: '/mo' },
    { id: 'revision', label: 'extra revision', note: 'one more round of changes', flat: 50 },
  ],
  // always on the receipt, always free
  included: { label: 'early delivery', note: 'one-off projects ready 2 weeks before your date' },
  // the small print under the receipt
  launchNote: 'launch prices for our first 5 clients, locked for 3 months. USD.',

  // "where's your project at?" in prices: each answer picks a package
  routes: {
    idea: { pkg: 'direct', note: 'Start with <b>direct</b>. We write the scripts and plan every shot, you film them on your phone, and we edit them into reels.' },
    footage: { pkg: 'cut', note: 'Start with <b>the cut</b>. You send the footage, Moj cuts it, Jaz writes the hooks and captions.' },
    launch: { pkg: 'hooked', note: 'Start with <b>fully hooked</b>. Both of us, start to finish: ideas, scripts, a shoot in our studio or AI shots, edit and motion.' },
    animate: { pkg: 'mstory', note: 'Start with a <b>motion story</b>. Your product, a problem, a turn and an ending, all animated. Like the three films above.' },
    big: { pkg: 'film', note: 'Start with a <b>hero film</b>. One story, told properly, in every format you need.' },
  },
};
