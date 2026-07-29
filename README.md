# For Modak — A Birthday Story

A cinematic, fully static birthday website: a ten-chapter journey from *"we met in 5th standard"* to a final letter, with a memory gallery, an interactive letter, a mini-game, a gift reveal, a celebration scene and ten little doors.

**Zero build step. Zero backend. Deploy the `public/` folder to GitHub Pages as-is.**

---

## Folder structure

```
public/                     ← this is the whole website
├── index.html              Welcome + chapter index (with loading screen)
├── story.html              Animated timeline
├── gallery.html            Filterable gallery + native <dialog> lightbox
├── qualities.html          What makes you special
├── letter.html             The letter
├── game.html               "Catch My Heart" mini-game
├── gift.html               Gift box reveal
├── celebration.html        Cake, candles, balloons, confetti
├── doors.html              10 little doors
├── finale.html             Final chapter
├── favicon.svg             Heart favicon
├── robots.txt
├── .nojekyll               Tells GitHub Pages to serve files verbatim
├── assets/
│   ├── css/main.css        The entire design system (tokens → components)
│   └── js/main.js          All behaviour, as small isolated modules
└── images/
    ├── niya-1/2/3.jpeg, memory-evening.jpeg, memory-video.mp4
    └── doors/2…11.jpeg
```

---

## Deploying to GitHub Pages

### Option A — publish the site at the repository root (simplest)

1. Copy **everything inside `public/`** into the root of your repository.
2. Commit and push to `main`.
3. GitHub → **Settings → Pages**.
4. **Source:** *Deploy from a branch* → Branch `main` → Folder `/ (root)`.
5. Save. The site goes live at `https://<username>.github.io/<repo>/`.

### Option B — keep the `public/` folder

GitHub Pages can only serve from `/` or `/docs`. Rename `public/` to `docs/`, push, then choose Branch `main` → Folder `/docs`.

### Why it works on Pages without changes

* Every path in every page is **relative** (`assets/css/main.css`, `images/…`, `story.html`) — the site works identically at a domain root or inside a `/repo/` sub-path.
* `.nojekyll` is included so Jekyll never rewrites or hides files.
* No server, no APIs, no database, no SSR, no bundler.

---

## Major improvements over the original

**Architecture & code quality**
* **Bootstrap 5 removed** (~230 KB of CSS + JS). Replaced by one hand-written, token-driven stylesheet and one vanilla-JS file — far less to download and nothing to fight when styling.
* **Navigation, footer and prev/next links are generated from a single `CHAPTERS` array** in `main.js`. Previously the nav was copy-pasted into all ten pages and had already drifted (labels differed between pages, `index.html` linked to five chapters while others linked elsewhere). Now adding or reordering a chapter is a one-line change.
* `script.js` was one long `DOMContentLoaded` block with null-checks scattered through it; it is now **isolated modules** (`initGallery`, `initGame`, `initDoors`, …) that no-op when their markup is absent.
* Dead code removed: the "save your own message" handler and `.envelope` / `.video-placeholder` styles targeted elements that no longer existed in any page.

**Bugs fixed**
* The gallery used **absolute paths** (`/images/Niya1.jpeg`) which resolve to the domain root — they break on every GitHub Pages project site. All paths are now relative.
* Image and video filenames contained spaces (`WhatsApp Image 2026-07-28 at 10.31.00 PM.jpeg`); renamed to URL-safe names.
* `.door-number`, `.door-preview` and the `--cream` variable were styled but never present in the markup, so the doors rendered as empty boxes. Doors now show a numbered, dimmed preview that brightens on open.
* The doors' reveal `<img>` had no `alt`; the game hearts were unfocusable `<div>`s. Both fixed.
* The game's interval kept spawning hearts forever in background tabs; it now pauses on `visibilitychange` and cleans up on win.

**Design & UX**
* Kept the identity — plum/rose/gold, Cormorant Garamond + Inter, glassmorphism — but rebuilt it on a proper token system: fluid type scale (`clamp()`), consistent spacing rhythm, layered ambient lighting, hairline glass edges and a single easing curve.
* **Mobile-first** everywhere: the timeline is a single column with a left rail on phones and alternates around a centre line from `62rem` up; doors go 2 → 3 → 5 columns; the header collapses into an accessible disclosure menu.
* Added a **chapter index** on the landing page and **prev/next chapter navigation** on every page, so the journey is never a dead end.
* Added a soft **page-transition cross-fade**, staggered scroll reveals, candle flicker, gallery **lightbox**, a game progress meter with restart, and a confetti button on the celebration page.
* Music now **persists across pages** (via `sessionStorage`) instead of restarting from zero on every navigation, and silently handles browsers that block autoplay.

**Accessibility**
* Skip link, one `<h1>` per page, semantic `<header>/<main>/<nav>/<footer>`, `<ol>` for the timeline, real `<button>`s for interactive elements, `aria-pressed` / `aria-expanded` / `aria-current`, `aria-live` for score and reveals, visible focus rings, and full `prefers-reduced-motion` support (all animation disabled, confetti suppressed).

**Performance**
* No framework, no CDN JS, one CSS file and one JS file, both cacheable.
* `loading="lazy"` + `decoding="async"` + explicit dimensions on gallery images; `preload="metadata"` on video; fonts loaded with `preconnect` + `display=swap`.
* Reveal observers `unobserve` after firing; confetti nodes are removed after their animation.

**SEO**
* Unique `<title>` and `<meta name="description">` per page, Open Graph + Twitter card tags, per-page `canonical`, `theme-color`, favicon and `robots.txt`.

---

## Editing the site

| I want to… | Edit |
| --- | --- |
| Change a colour, font or spacing | the `:root` tokens at the top of `assets/css/main.css` |
| Add, rename or reorder a chapter | the `CHAPTERS` array at the top of `assets/js/main.js` (nav, footer and prev/next update everywhere) |
| Change a door's photo or message | the `data-image` / `data-message` attributes in `doors.html` |
| Change the background music | `MUSIC_SRC` in `assets/js/main.js` (drop an MP3 into `assets/media/` and point to it for a fully offline site) |
| Add a gallery memory | copy one `<article class="gallery__item">` block in `gallery.html` |

## Local preview

Any static server works, e.g.:

```bash
cd public && python3 -m http.server 8000
```

Then open <http://localhost:8000>.
