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

  // The receipt. Launch prices from the feasibility report, low end of each range.
  // price = the "from" number in USD. unit shows after it. tag = the one-line "what it is".
  packages: [
    { id: 'script', label: 'script pack', tag: 'you film it', note: '4 short scripts with hooks and a shot list for each. Jaz writes them, Moj plans the shots.', price: 150, unit: '' },
    { id: 'edit', label: 'edit pack', tag: 'you send footage', note: '4 edited shorts a month with captions and motion titles. Moj cuts, Jaz writes the hooks.', price: 300, unit: '/mo' },
    { id: 'concept', label: 'concept to cut', tag: 'we do all of it', note: 'Idea, script, a shoot in our studio, edit and motion. 2 rounds of revisions. Us on camera if you want.', price: 350, unit: '/video' },
    { id: 'film', label: 'brand film', tag: 'one hero film', note: 'One story film, 60 to 120 seconds, like The Knot. Plus 3 vertical cut-downs.', price: 1200, unit: '' },
  ],
  addons: [
    { id: 'motion', label: 'motion graphics', note: 'animated titles, charts and logo moments', pct: 20 },
    { id: 'rush', label: 'rush', note: 'delivered in under 48 hours', pct: 30 },
    { id: 'ads', label: 'paid-ad rights', note: 'per month you run it as an ad', pct: 30, unit: '/mo' },
    { id: 'revision', label: 'extra revision', note: 'one more round of changes', flat: 50 },
  ],
  // always on the receipt, always free
  included: { label: 'early delivery', note: 'ready 2 weeks before your date, in a shared drive' },

  // "where's your project at?" in prices: each answer picks a package
  routes: {
    idea: { pkg: 'script', note: 'Start with the <b>script pack</b>. Jaz turns the idea into scripts with hooks, Moj plans every shot so you can film them yourself.' },
    footage: { pkg: 'edit', note: 'Start with the <b>edit pack</b>. Moj cuts your footage, Jaz writes the hooks, captions and motion titles.' },
    launch: { pkg: 'concept', note: 'Start with <b>concept to cut</b>. Both of us, start to finish: idea, script, a shoot in our studio, edit and motion.' },
    big: { pkg: 'film', note: 'Start with a <b>brand film</b>. One story, told properly, plus vertical cut-downs for every feed.' },
  },
};
