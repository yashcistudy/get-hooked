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
    product: '',     // world tile: product films (falls back to konar)
    explainer: '',   // world tile: explainers (falls back to chart)
  },

  // The receipt. Launch prices from the feasibility report, low end of each range.
  // price = the "from" number in USD. unit shows after it.
  packages: [
    { id: 'script', label: 'script pack', who: 'jaz', note: '4 short scripts with hooks and shot lists. You film them.', price: 150, unit: '' },
    { id: 'edit', label: 'edit pack', who: 'moj', note: 'You send footage. 4 edited shorts a month, captions and motion titles.', price: 300, unit: '/mo' },
    { id: 'concept', label: 'concept to cut', who: 'both', note: 'Brief, script, shoot in our studio, edit, 2 revisions. Us on camera if you want.', price: 350, unit: '/video' },
    { id: 'film', label: 'brand film', who: 'both', note: 'One story film, 60–120 seconds, like The Knot. Plus 3 vertical cut-downs.', price: 1200, unit: '' },
  ],
  addons: [
    { id: 'motion', label: 'motion + thread', note: 'animated graphics, our way', pct: 20 },
    { id: 'rush', label: 'rush', note: 'under 48 hours', pct: 30 },
    { id: 'ads', label: 'paid-ad rights', note: 'per month of ads', pct: 30, unit: '/mo' },
    { id: 'revision', label: 'extra revision', note: 'one more round', flat: 50 },
  ],
  // always on the receipt, always free
  included: { label: 'blackout-proof delivery', note: 'batched 2 weeks ahead, shared drive' },
};
