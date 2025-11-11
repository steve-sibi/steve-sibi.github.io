<!-- .github/copilot-instructions.md - guidance for AI coding agents working on this repo -->

# Quick orientation

This repository is a static personal portfolio site delivered as plain HTML/CSS/JS and Tailwind CSS output. The canonical entry point is `index.html`. Tailwind source lives in `src/tailwind.css` and compiles into the generated `css/tailwind.css` bundle.

Keep changes minimal and focused: typical edits are copy/layout tweaks in `index.html`, targeted behavior fixes inside the modular scripts under `js/`, and styling updates via `css/styles.css` or the Tailwind source.

## Important files to reference

- `index.html` — markup, meta, favicons, modal scaffolding, and the three-column layout that every script targets.
- `js/utils.js` — shared helpers (script loader, prefers-reduced-motion check) reused by the lazy-loaded modules.
- `js/theme.js` — dark/light toggle plus localStorage persistence and progressive view-transition support.
- `js/navigation.js` — mobile drawer state, overlay, focus trapping, and active link highlighting.
- `js/typed-text.js` — lazy Typed.js integration for the hero headline controlled by IntersectionObserver.
- `js/hero-terminal.js` — typing animation for the floating hero terminal.
- `js/github-calendar.js` — contribution calendar fetcher, skeleton controller, and tooltip interactions.
- `js/skills.js` — pulls `data/skills.json`, renders the discipline filters, and builds the skills table (`skillsTable`).
- `js/projects.js` — fetches `data/projects.json`, instantiates the project cards, and wires filters/search/sort plus the quick-view trigger data attributes.
- `js/modal.js` — quick-view modal rendering (highlights, tech pills, clipboard helper) plus focus management.
- `js/resume-preview.js` — opens/closes the resume iframe modal and tracks downloads via GA.
- `js/contact.js` — Web3Forms submit handler with button states and inline success/error alerts.
- `js/scroll-arrow.js` — scroll-to-next/back arrow with bottom-detection logic.
- `js/animations.js` — intersection-driven fade-ins, hero content class, resume download tracking, and the courtesy email copy helper.
- `css/styles.css` — handcrafted visual styles, component scaffolding, and responsive tweaks.
- `src/tailwind.css` — Tailwind entry point; run `npm run build:css` whenever you touch utilities.
- `data/projects.json` and `data/skills.json` — canonical JSON sources for the projects and skills sections.
- `assets/` and `images/` — static downloads (resume PDF, OG image, profile photo, badges, etc.).
- `package.json` and `package-lock.json` — npm scripts (`build:css`, `watch:css`) plus Tailwind dependencies.

## Build & dev (explicit commands)

Use the project's npm scripts to build or watch Tailwind:

```bash
# one-shot build (creates minified `css/tailwind.css`)
npm run build:css

# develop - rebuilds on change
npm run watch:css
```

For a local preview of the static site, any simple server works (`python3 -m http.server 8000`, VS Code Live Server, etc.). Run the Tailwind watcher in a separate terminal while styling.

## Project-specific patterns & conventions

- Tailwind is authored in `src/tailwind.css` and compiled output lives in `css/tailwind.css`. Do not edit the generated file directly unless you intend to commit a built artifact.
- Dark mode toggles the `.dark` class on `<html>` inside `js/theme.js`, updates the sun/moon icon, and records the preference in `localStorage` under `theme`.
- Side navigation lives in `index.html` (ids: `sidebar`, `menuButton`, `sidebarOverlay`, `menuIcon`) and is managed by `js/navigation.js` for accessibility and focus trap.
- Typed hero text is lazy-loaded by `js/typed-text.js` (checks `prefers-reduced-motion` and uses `window.loadExternalScript`).
- Hero terminal animation is fully contained in `js/hero-terminal.js`; it only reads the DOM nodes for the terminal body/prompt and handles reduced-motion fallbacks.
- GitHub calendar logic in `js/github-calendar.js` fetches from the jogruber API, renders months/weeks, aligns tooltips, and toggles the skeleton with `github-calendar-skeleton` markup.
- Skills and projects are driven by their JSON files. `js/skills.js` fills the table with data from `data/skills.json` and responds to `.skills-filter` buttons; `js/projects.js` does the same for `data/projects.json` and the filter/search UI (IDs: `projectGrid`, `projectSearch`, `projectSort`, `projectEmpty`).
- The quick-view modal (`js/modal.js`) expects data attributes (`data-highlights`, `data-tech`, etc.) on each card and handles copy/toast UX.
- Resume preview, contact form, scroll arrow, and animations are each isolated in their respective modules so edits stay scoped.

## External integrations to be aware of

- Google Fonts and Font Awesome font files are loaded via CDN links in `index.html`.
- Typed.js is only fetched lazily through `js/typed-text.js` (no eager `<script>` tags).
- The GitHub contributions API powers `js/github-calendar.js`, which throttles requests with cacheless fetches.
- The contact form submits to Web3Forms (`contactForm.action`), so keep CSP and endpoint settings intact.
- GA4 tracking is tightly scoped: `js/animations.js` tracks resume downloads, `js/contact.js` tracks form submits, and `js/resume-preview.js` tracks modal opens.

## Safe edits and common tasks (examples)

- Change content, structure, or new sections via `index.html`.
- Update data-driven sections by editing `data/projects.json` or `data/skills.json`.
- Add or tweak Tailwind utilities in `src/tailwind.css` and rebuild (`npm run build:css`).
- Adjust handcrafted visual styles in `css/styles.css`.
- Fix or enhance behavior inside the scoped modules under `js/` (see the list above).

## Debugging hints

- Check the console for module logs (e.g., `✅ Skills module loaded`, `GitHub calendar failed`).
- Use the native skeleton markup (e.g., `#github-calendar-skeleton`) to verify loading states if network fetches fail.
- Run `npm run watch:css` while editing Tailwind so you can refresh the browser without rebuilding manually.
- For HTML/JS tweaks, serve via `python3 -m http.server 8000` or any static server and test keyboard flows (Escape/Tab particularly for modals).

## Minimal agent contract (what you should do)

1. Read the relevant files listed above before making changes.
2. Prefer small, focused edits (one feature/PR).
3. When editing styles, modify `src/tailwind.css` and rebuild (`npm run build:css`).
4. Preserve accessibility hooks and IDs referenced by the scripts (`themeToggle`, `menuButton`, `projectGrid`, `skillsTable`, etc.).
