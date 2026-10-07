/*
  hooked · config.js
  Everything you'll want to change without touching the rest of the code.
*/
window.HOOKED = {
  // Formspree: paste your endpoint, e.g. 'https://formspree.io/f/abcdwxyz'.
  // Left empty, the form opens an email draft to the address below instead.
  formspree: '',
  email: 'get.hooked.with.jj@gmail.com',

  // How many days until you reply. null = "soon". Only promise what you can keep.
  replyDays: null,

  // YouTube video IDs (the part after watch?v= ). Empty = a "coming soon" poster.
  videos: {
    knot: '',        // The Knot, showcase film (2:00)
    konar: '',       // Konar, a perfume ad except it's honey (1:00)
    chart: '',       // On the Chart, finance explainer (0:41)
    product: '',     // world 4a · product films
    explainer: '',   // world 4b · explainers
    teaser: '',      // world 4c · teasers and trailers
    short: '',       // world 4d · shorts and reels (vertical)
  },

  // The receipt. Prices in USD; null shows "quote" until you set a number.
  receipt: [
    { id: 'script', label: 'concept + script', note: 'we untangle your brief', price: null, on: true },
    { id: 'shoot', label: 'shoot day', note: 'camera, lights, us', price: null, on: true },
    { id: 'edit', label: 'edit + sound', note: 'moj cuts it', price: null, on: true },
    { id: 'motion', label: 'motion + thread', note: 'jaz animates it', price: null, on: false },
    { id: 'ai', label: 'ai shots', note: 'for things that don\'t exist yet', price: null, on: false },
    { id: 'cutdowns', label: 'cut-downs 9:16', note: 'reels, shorts, stories', price: null, on: false },
    { id: 'captions', label: 'captions', note: 'burned in, our style', price: null, on: false },
  ],
};
