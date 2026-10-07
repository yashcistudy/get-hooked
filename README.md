# hooked · get-hooked

The website for **hooked**, the content studio of Moj and Jaz. One red thread runs through the whole page, just like in our film, The Knot.

Plain HTML, CSS and JavaScript. No build step, no frameworks. GitHub Pages serves it as it is.

## The four things to fill in

All of them live in `assets/js/config.js`.

| What | Where | Until you fill it |
| --- | --- | --- |
| Formspree endpoint | `formspree: 'https://formspree.io/f/xxxx'` | the form opens an email draft instead |
| YouTube video IDs | `videos: { knot: 'abc123', ... }` | a "film goes up here soon" poster |
| Receipt prices (USD) | `receipt: [{ price: 900 }, ...]` | each line says "quote" |
| Reply time | `replyDays: 2` | "we'll write back soon" |

A YouTube ID is the part after `watch?v=`. For `https://www.youtube.com/watch?v=dQw4w9WgXcQ` it's `dQw4w9WgXcQ`. The explainers tile uses `chart` (On the Chart) if `explainer` is empty.

## Photos

The site expects these in `assets/img/`. The files in there now are placeholders with the same names, so just overwrite them:

| File | Size | Used in |
| --- | --- | --- |
| `jaz-default.webp`, `jaz-hover.webp` | 1600×2400, transparent | meet the two (red plate) |
| `moj-default.webp`, `moj-hover.webp` | 1600×2400, transparent | meet the two (green plate) |
| `contact.webp` | 1600×2400, transparent | spare, for later |
| `pair.webp` | 2400×1600, transparent | spare, for later |
| `work-clans.webp`, `work-ticket.webp` | 1200×1200 | spare, for later |
| `og-image.jpg` | 1200×630 | the link preview in chats |

## How the thread works (`assets/js/thread.js`)

Every effect follows the film's rule: one flat red line, round ends, a slight wobble, and it draws itself on, never just appears.

| Effect | Where on the page | Film moment |
| --- | --- | --- |
| `Knot` | hero: draws itself, twitches, untangles as you scroll | scene 1, the cold open |
| `Spine` | the thread down the whole page, drawn as you scroll | the thread through every scene |
| `tie` | ties the two surviving idea cards | scene 3, two out of three |
| `zip` | zips across a world tile on hover | scene 4, the world transitions |
| `squiggle` | hand-drawn underline on hover | |
| `cursorThread` | a loose end follows the mouse (desktop only) | Jaz pulling the thread |
| `throwKnot` | the knot flies at the screen when you send the form | scene 6, send us your knot |

Each section says where the spine goes with `data-spine` (desktop) and `data-spine-m` (phones), as fractions of the section's width and height, for example `data-spine="0.07 0, 0.3 0.3, loop, 0.93 1"`. `loop` adds a little loop of thread at that spot.

With "reduce motion" switched on in the visitor's settings, every effect shows its final frame and nothing moves. Sound is off until the visitor turns it on in the nav.

## Brand files

`assets/brand/` holds the real files from the brand board: the wordmark with both heads (on paper, on ink, on green), the link mark (on paper, on ink), the heads, and the favicon. Don't redraw or recolour the heads, and never put the wordmark on thread red.

## Fonts

`assets/fonts/` has Grinched 2.0 and RockoFLF as web fonts. **Grinched 2.0 is licensed for personal use only.** A public website needs the commercial/webfont licence from Sharkshock before launch. Check Rocko's licence too.

## Publishing

Repo settings → Pages → Source: **Deploy from a branch**, branch **main**, folder **/ (root)**. The site appears at `https://yashcistudy.github.io/get-hooked/`. The 404 page assumes that address; if you move to `gethooked.org`, change the four `/get-hooked/` paths in `404.html` to `/`.
