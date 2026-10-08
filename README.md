# hooked · get-hooked

The website for **hooked**, the content studio of Moj and Jaz. One red thread runs through the whole page, just like in our film, The Knot.

Plain HTML, CSS and JavaScript. No build step, no frameworks. GitHub Pages serves it as it is.

## What to fill in

All of it lives in `assets/js/config.js`.

| What | Where | Until you fill it |
| --- | --- | --- |
| YouTube video IDs | `videos: { knot: 'abc123', ... }` | a "goes up here soon" poster, and a toast on tap |
| Reply time | `replyDays: 2` | "we'll write back soon" |
| Prices | `packages` and `addons` | already set from the feasibility report (low end, "from") |

The Formspree endpoint is already set. A YouTube ID is the part after `watch?v=`. For `https://www.youtube.com/watch?v=dQw4w9WgXcQ` it's `dQw4w9WgXcQ`. The explainers tile uses `chart` if `explainer` is empty, and the product tile uses `konar` if `product` is empty.

### The receipt

`packages` is the "pick one" row: `price` is the "from" number in USD, `unit` is what shows after it (`/mo`, `/video`), `who` picks the label (jaz, moj or both). `addons` are the extras: `pct` adds a percentage of the package, `flat` adds a fixed amount. `included` is the free line that's always on the receipt. Whatever the visitor builds gets sent with the form as a `receipt` field, so you see it in Formspree.

The quiz in "meet the two" routes to a package: an idea with no footage picks `script`, footage with no time picks `edit`, a deadline picks `concept`. Change the routes in `assets/js/site.js` under `ROUTE`.

## Photos

All in `assets/img/`, transparent WebP.

| File | Used in |
| --- | --- |
| `pair.webp` | top of "meet the two"; the logo lands on the board they hold |
| `jaz-default.webp`, `jaz-hover.webp` | Jaz's card (the board text is live type, not part of the photo) |
| `moj-default.webp`, `moj-hover.webp` | Moj's card (same) |
| `contact.webp` | Jaz with the cards, in the footer |
| `work-clans.webp`, `work-ticket.webp` | the Geekbazi scene in "the cut" |
| `og-image.jpg` | the link preview in chats |

The board text sits on each photo through four numbers in `index.html` (`--x --y --w --h`, fractions of the photo). If you swap a photo for one with a different crop, re-measure those.

## Orbit Catch (`assets/js/orbit.js`)

Our logo motion: the two heads orbit and swap, shrink into the Os, the letters pop in and the two js hook. It moves the real lockup file, it doesn't redraw it. It plays on the pair's board, at the end of the cut (when the playhead reaches the end) and in the footer. Tap any of them to play it again.

## Phones

`assets/css/mobile.css` loads only up to 760px. The spine becomes the bar at the bottom (one knot per section, tap to jump). Anything with the `deck` class becomes a swipe row with its own little thread underneath; `data-deck` is its label.

## How the thread works (`assets/js/thread.js`)

Every effect follows the film's rule: one flat red line, round ends, a slight wobble, and it draws itself on, never just appears.

| Effect | Where on the page | Film moment |
| --- | --- | --- |
| `Knot` | hero: draws itself, twitches, untangles as you scroll | scene 1, the cold open |
| `Spine` | the thread down the whole page, drawn as you scroll | the thread through every scene |
| `tie` | ties the two surviving idea cards (desktop) | scene 3, two out of three |
| `zip` | zips across a world tile on hover | scene 4, the world transitions |
| `squiggle` | hand-drawn underline on hover | |
| `cursorThread` | a loose end follows the mouse (desktop only) | Jaz pulling the thread |
| `throwKnot` | the knot flies at the screen when you send the form | scene 6, send us your knot |

Each section says where the spine goes with `data-spine`, as fractions of the section's width and height, for example `data-spine="0.07 0, 0.3 0.3, loop, 0.93 1"`. `loop` adds a little loop of thread at that spot.

With "reduce motion" switched on in the visitor's settings, every effect shows its final frame and nothing moves. Sound is off until the visitor turns it on in the nav.

## Brand files

`assets/brand/` holds the real files from the brand board: brand pack v3: the mark, the wordmark and the lockups (on paper, on ink, on green), the heads, and the favicons. Don't redraw or recolour the heads, and never put the wordmark on thread red.

## Fonts

`assets/fonts/` has Grinched 2.0 and RockoFLF as web fonts. **Grinched 2.0 is licensed for personal use only.** A public website needs the commercial/webfont licence from Sharkshock before launch. Check Rocko's licence too.

## Publishing

Repo settings → Pages → Source: **Deploy from a branch**, branch **main**, folder **/ (root)**. The site appears at `https://yashcistudy.github.io/get-hooked/`. The 404 page assumes that address; if you move to `gethooked.org`, change the four `/get-hooked/` paths in `404.html` to `/`.
