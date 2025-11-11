# 🔐 Steve Joseph Sibi - Cybersecurity Portfolio

[![Live Site](https://img.shields.io/badge/Live-steve--sibi.github.io-00ff9f?style=for-the-badge)](https://steve-sibi.github.io/)
[![License: ISC](https://img.shields.io/badge/License-ISC-blue.svg?style=for-the-badge)](LICENSE)

> A modern, data-driven cybersecurity portfolio built with vanilla JavaScript modules, Tailwind CSS 4, and deployed on GitHub Pages.

![Portfolio Preview](images/og-card.png)

---

## 🚀 Features

### ✨ Experience-first UI
- **Dark/Light Theme:** toggle updates the sun/moon icon, respects system defaults, and persists in `localStorage`.
- **Hero motion cues:** Typed.js headlines, glitch typography, and IntersectionObserver-driven fade-ins keep the narrative lively without overwhelming users.
- **Responsive layout:** sticky sidebar navigation, experience timeline, cards, and tables adapt cleanly across breakpoints.
- **Resume preview modal:** inline PDF viewer with download CTA plus analytics tracking.
- **Bidirectional scroll arrow:** one floating button scrolls down section-by-section and flips to a "back to top" affordance near the footer.

### 🧠 Data & Integrations
- **Projects grid:** pulls from `data/projects.json`, supports tag filters, instant search, alpha sort, and a quick-view modal with repo/readme links plus copy-to-clipboard clone commands.
- **Skills matrix:** builds an accessible table with discipline filters, progress bars, experience tags, and proof links with inline JSON fallback.
- **GitHub activity:** lazy-loads `github-calendar` with a skeleton message and prunes surplus markup for accessibility.
- **Contact form workflow:** Web3Forms API + honeypot + inline success/error alerts, with GA events emitted from `js/contact.js`.
- **Social proof:** TryHackMe badge, LinkedIn/GitHub buttons, and a resume download CTA are wired into the UI.

### ⚙️ Performance & Accessibility
- **Modular vanilla JS:** discrete feature files share helpers via `utils.js` and gate work behind IntersectionObserver.
- **Lazy vendor loading:** external scripts (Typed.js, GitHub Calendar) load on demand through a cached script loader and respect `prefers-reduced-motion`.
- **Resilient data:** placeholders for GitHub calendar plus inline JSON fallbacks for projects and skills keep sections useful even on flaky networks.
- **Keyboard-friendly UX:** focus trapping in the mobile drawer and modals, ARIA labels, and semantic tables keep everything screen-reader friendly.
- **Tailwind CLI pipeline:** minified `css/tailwind.css`, preloaded fonts/icons, and a sprinkling of custom CSS deliver speed without a heavyweight build system.

---

## 📋 Table of Contents

- [Quick Start](#-quick-start)
- [Development](#-development)
- [Build & Deploy](#-build--deploy)
- [Project Structure](#-project-structure)
- [Tech Stack](#-tech-stack)
- [Configuration](#-configuration)
- [Customization](#-customization)
- [Performance](#-performance)
- [Browser Support](#-browser-support)
- [Contributing](#-contributing)
- [License](#-license)
- [Contact](#-contact)
- [Acknowledgments](#-acknowledgments)
- [Roadmap](#-roadmap)

---

## ⚡ Quick Start

### Prerequisites
- **Node.js** 18+
- **npm** or **yarn**
- **Python 3** (used by the simple HTTP server)
- A modern browser with JavaScript enabled

### Installation

```bash
# Clone the repository
git clone https://github.com/steve-sibi/steve-sibi.github.io.git
cd steve-sibi.github.io

# Install Tailwind CLI + tooling
npm install

# Optional: build Tailwind once before starting dev work
npm run build:css

# Watch Tailwind and serve the site on http://localhost:8000
npm run dev
```

`npm run dev` spawns the Tailwind watcher and `python3 -m http.server 8000` in the project root. Use `Ctrl+C` to stop both processes. On Windows, run the watcher (`npm run watch:css`) and server (`npm start`) in separate terminals or use WSL.

---

## 🔧 Development

### Available Scripts

| Command | Description |
|---------|-------------|
| `npm run build:css` | Compile and minify `src/tailwind.css` → `css/tailwind.css` for production |
| `npm run watch:css` | Watch Tailwind input and rebuild on every change |
| `npm start` | Serve the site from the repo root via `python3 -m http.server 8000` |
| `npm run dev` | Run the Tailwind watcher and Python server together (POSIX shells) |

### Development Workflow

1. **Start live reload:** `npm run dev`.
2. **Edit content:**
   - Structure & copy: `index.html`
   - Tailwind utilities / design tokens: `src/tailwind.css`
   - Component styles & animations: `css/styles.css`
3. **Update data:** `data/projects.json`, `data/skills.json`, and `assets/Resume_Steve_Sibi_Cyber.pdf`.
4. **Adjust behavior:** edit the relevant file in `js/` (see module table below).
5. **Build CSS** before committing: `npm run build:css`.

### Modular JavaScript

| Module | Responsibility |
|--------|----------------|
| `js/utils.js` | Shared helpers such as `loadExternalScript` and `prefersReducedMotion`. |
| `js/theme.js` | Dark/light mode toggle with ARIA updates and `localStorage` persistence. |
| `js/navigation.js` | Mobile drawer toggling, focus trapping, overlay handling, and active link highlighting. |
| `js/typed-text.js` | Lazy Typed.js integration for the hero text with reduced-motion fallbacks. |
| `js/github-calendar.js` | Loads the GitHub contribution calendar on demand, prunes extraneous markup, and coordinates skeleton display. |
| `js/skills.js` | Loads skills from `data/skills.json`, renders the table, and drives discipline filters/progress bars. |
| `js/projects.js` | Loads `data/projects.json`, instantiates project cards, and powers filters/search/sort plus the quick-view modal payload. |
| `js/modal.js` | Handles the project quick-view modal, highlight lists, tech pills, and copy-to-clipboard toast notifications. |
| `js/resume-preview.js` | Opens/closes the resume preview modal, injects the PDF iframe source, and fires GA events. |
| `js/contact.js` | Submits the Web3Forms contact form, toggles button states, and shows inline success/error alerts. |
| `js/scroll-arrow.js` | Controls the bidirectional scroll arrow, including bottom detection and smooth scrolling. |
| `js/animations.js` | Section fade-ins, hero content animation class, resume download tracking, and (optional) email copy helper. |

---

## 📦 Build & Deploy

### Production Build

```bash
npm run build:css
```

This regenerates the minified `css/tailwind.css`. Because the rest of the site is static HTML/JS, no additional bundling is required.

### Deploy to GitHub Pages

1. Commit your changes to `main`.
2. Push to GitHub.
3. Ensure GitHub Pages is configured to serve from the repository root (`Settings › Pages`).

GitHub Pages will redeploy automatically after every push.

### Deploy to Other Platforms

#### Netlify

- **Build command**: `npm run build:css`
- **Publish directory**: `./`
- You can keep Netlify on "static" mode; no serverless functions required.

#### Vercel

- **Build command**: `npm run build:css`
- **Output directory**: `./`
- Disable server-side rendering; Vercel just needs to serve the generated static files.

---

## 📁 Project Structure

```
steve-sibi.github.io/
├── assets/
│   └── Resume_Steve_Sibi_Cyber.pdf
├── css/
│   ├── styles.css
│   └── tailwind.css
├── data/
│   ├── projects.json
│   └── skills.json
├── icons/               # Favicons + PWA manifest
├── images/
│   ├── og-card.png
│   └── profile_pic_steve.jpg
├── js/
│   ├── animations.js
│   ├── contact.js
│   ├── github-calendar.js
│   ├── main.js
│   ├── modal.js
│   ├── navigation.js
│   ├── projects.js
│   ├── resume-preview.js
│   ├── scroll-arrow.js
│   ├── skills.js
│   ├── theme.js
│   ├── typed-text.js
│   └── utils.js
├── src/
│   └── tailwind.css
├── index.html
├── package.json
├── package-lock.json
└── README.md
```

> Additional directories: `.github/` (repository configuration), `.gitignore`, and `node_modules/` (generated after `npm install`).

### Key Files & Directories

| Path | Purpose |
|------|---------|
| `index.html` | Single-page markup, sections, and script loading order. |
| `src/tailwind.css` | Tailwind input plus custom `@theme` tokens. |
| `css/tailwind.css` | Generated (minified) Tailwind output - do not edit directly. |
| `css/styles.css` | Handwritten component styles, timelines, and animations. |
| `data/projects.json` | Source of truth for the projects grid. |
| `data/skills.json` | Source of truth for the skills matrix. |
| `assets/Resume_Steve_Sibi_Cyber.pdf` | Resume served inside the preview modal and download button. |
| `icons/` | All favicons and `site.webmanifest`. |
| `images/og-card.png` | Open Graph / social preview image referenced in `<head>`. |
| `js/*.js` | Feature-specific JavaScript modules (see table above). |
| `.github/` | GitHub workflows and documentation helpers (e.g., Copilot instructions). |

---

## 🛠️ Tech Stack

### Core Technologies
- **HTML5** with semantic sections, ARIA labels, and skip links.
- **Tailwind CSS 4** (via CLI) plus custom CSS for timelines, pills, and modals.
- **Vanilla JavaScript (ES6)** split into focused modules; no bundler required.
- **GitHub Pages** for hosting and HTTPS.

### Libraries & APIs

| Library / API | Purpose | Version |
|---------------|---------|---------|
| [Tailwind CSS](https://tailwindcss.com/) | Utility-first styling & theming | 4.1.13 (CLI) |
| [Font Awesome](https://fontawesome.com/) | Icons (served via CDN) | 6.5.1 |
| [Typed.js](https://github.com/mattboldt/typed.js) | Hero typing animation | 2.0.12 |
| [GitHub Calendar](https://github.com/Bloggify/github-calendar) | Contribution heatmap embed | latest (CDN) |
| [Web3Forms](https://web3forms.com/) | Contact form backend | API |
| [Google Analytics 4](https://marketingplatform.google.com/about/analytics/) | Analytics & event tracking | `gtag.js` |

### Development Utilities
- **@tailwindcss/cli** for compilation.
- **Python 3 `http.server`** as the lightweight dev server.
- **npm scripts** to orchestrate watch/build tasks.
- **Lighthouse / browser devtools** for performance checks.

---

## ⚙️ Configuration

### Tailwind Theme

`src/tailwind.css` contains Tailwind 4's inline configuration. Update tokens and layers there, then rebuild.

```css
@import "tailwindcss";

@theme {
  --color-cyber-green: #10b981;
  --color-cyber-dark: #0a0e27;
  --font-family-sans: "Share Tech Mono", system-ui, sans-serif;
  /* Add tokens here */
}
```

### Analytics (GA4)

Replace `G-F499NLV8V2` with your GA4 Measurement ID near the top of `index.html`.

```html
<script async src="https://www.googletagmanager.com/gtag/js?id=G-F499NLV8V2"></script>
<script>
  window.dataLayer = window.dataLayer || [];
  function gtag(){dataLayer.push(arguments);}
  gtag('js', new Date());
  gtag('config', 'G-F499NLV8V2');
</script>
```

### Contact Form (Web3Forms)

Update your access key and redirect URL inside the contact form in `index.html`.

```html
<form id="contactForm" action="https://api.web3forms.com/submit" method="POST">
  <input type="hidden" name="access_key" value="YOUR-ACCESS-KEY">
  <input type="hidden" name="redirect" value="https://steve-sibi.github.io/#contact">
  <input type="checkbox" name="botcheck" class="hidden">
  <!-- ... -->
</form>
```

### GitHub Calendar Username

Set your GitHub username in `js/github-calendar.js`.

```javascript
GitHubCalendar('#github-calendar', 'steve-sibi', {
  responsive: true,
  summary: false
});
```

### Hero Typed Headlines

Edit the strings array in `js/typed-text.js` to change the rotating hero skills.

```javascript
new Typed('#typed-text', {
  strings: [
    'Data Privacy &amp; Encryption',
    'Network Security',
    'Cloud Security'
    // ...
  ],
  loop: true
});
```

### Resume Preview

`js/resume-preview.js` points to `assets/Resume_Steve_Sibi_Cyber.pdf`. Swap the file or update the path:

```javascript
const resumePath = 'assets/Resume_Steve_Sibi_Cyber.pdf';
```

Remember to update the download link in `index.html` too.

### TryHackMe Badge

Update the handle and badge URL inside the `#tryhackme` section.

```html
<a href="https://tryhackme.com/p/DankKnight" target="_blank" rel="noopener">
  <img src="https://tryhackme-badges.s3.amazonaws.com/DankKnight.png"
       alt="TryHackMe badge for user DankKnight">
</a>
```

---

## 🎨 Customization

### Projects (`data/projects.json`)

Add or edit projects using the extended schema below. Optional fields (`pillTech`, `readme`, `clone`) enrich the quick-view modal.

```json
{
  "id": "mini-saas-ato",
  "title": "Account Takeover (ATO) Detection and Response",
  "description": "Production-style ATO simulation lab with Flask, Datadog, and Azure Functions.",
  "icon": "fas fa-user-secret",
  "tags": ["security", "cloud", "automation"],
  "pillTech": ["Python", "Flask", "Datadog", "Azure"],
  "tech": ["Python", "Flask", "Datadog", "Azure Functions", "Signed Webhooks"],
  "link": "https://github.com/steve-sibi/mini-saas-ato",
  "readme": "https://github.com/steve-sibi/mini-saas-ato#readme",
  "clone": "https://github.com/steve-sibi/mini-saas-ato.git",
  "highlights": [
    "Detects brute-force & credential-stuffing with Datadog pipelines",
    "Signed webhooks + Azure Functions invalidate sessions in seconds"
  ]
}
```

- Buttons in the UI filter by `tags` (lowercase is safest).
- The quick-view modal lists `highlights` and renders tech pills from `tech`.
- If you omit `readme` or `clone`, defaults are derived from `link`.

### Skills (`data/skills.json`)

Each skill entry powers a row in the table.

```json
{
  "name": "Nmap",
  "cat": "cyber",
  "level": 90,
  "years": 5,
  "proof": "https://github.com/steve-sibi/Automated-Vulnerability-Scanner"
}
```

- `cat` drives the discipline filters (`cyber`, `prog`, `os`, `cloud`, `other`).
- `level` should be 0-100. Missing values display `-`.
- `proof` is optional but recommended for credibility.

### Inline Fallback Data (optional)

If you want the page to work completely offline, embed JSON directly inside `index.html`. The scripts fall back to these nodes when fetching fails.

```html
<script id="projectsData" type="application/json">
[
  { "id": "offline-demo", "title": "Offline Project", "description": "...", "tags": ["security"] }
]
</script>

<script id="skillsData" type="application/json">
[
  { "name": "Linux", "cat": "os", "level": 85, "years": 5 }
]
</script>
```

### Assets & Visuals

- Replace `assets/Resume_Steve_Sibi_Cyber.pdf` with your own resume (keep the filename or update references).
- Update `images/og-card.png` to refresh the Open Graph preview.
- Favicons and manifest live under `icons/`; regenerate with a favicon generator if you change branding.

---

## ⚡ Performance

Built-in optimizations:

- **Lazy execution** via IntersectionObserver for Typed.js, GitHub Calendar, scroll arrow state, and fade-in animations.
- **Dynamic script loader** caches vendor scripts to prevent duplicate downloads.
- **Reduced motion support** swaps the hero animation for static text when users prefer less motion.
- **Lightweight tooling** because only Tailwind CLI runs at build time; everything else is static assets.
- **Minimized layout shift** with pre-sized images (TryHackMe badge, OG card) and preloaded Font Awesome fonts.

Before publishing, run your own Lighthouse audits to validate Core Web Vitals for your hardware/network.

---

## 🌐 Browser Support

| Browser | Minimum Version | Notes |
|---------|----------------|-------|
| Chrome | 90+ | IntersectionObserver + CSS custom properties required. |
| Firefox | 88+ | Tested with reduced-motion preference. |
| Safari | 14+ | Works with WebKit's `prefers-color-scheme`. |
| Edge | 90+ | Chromium-based Edge supports all required APIs. |

The experience relies on `fetch`, `IntersectionObserver`, CSS Grid/Flexbox, and `localStorage`.

---

## 🤝 Contributing

This is a personal portfolio, but suggestions and issues are welcome.

1. **Fork** the repo.
2. **Create** a feature branch (`git checkout -b feature/amazing-feature`).
3. **Commit** with clear messages (`git commit -m "Add amazing feature"`).
4. **Push** your branch (`git push origin feature/amazing-feature`).
5. **Open** a Pull Request.

### Development Guidelines
- Follow the modular JavaScript pattern (one concern per file).
- Update or add data (`data/*.json`) instead of hard-coding content in HTML when possible.
- Test across light/dark modes and multiple breakpoints.
- Keep dependencies minimal; prefer native browser APIs.
- Document major UI or data changes inside this README.

---

## 📝 License

This project is licensed under the **ISC License**.

Copyright © 2025 Steve Joseph Sibi

Permission to use, copy, modify, and/or distribute this software for any purpose with or without fee is hereby granted, provided that the above copyright notice and this permission notice appear in all copies.

---

## 📬 Contact

**Steve Joseph Sibi**  
Cybersecurity Engineer · Penetration Tester · Privacy Advocate

- 🌐 Website: [steve-sibi.github.io](https://steve-sibi.github.io/)
- 💼 LinkedIn: [steve-sibi](https://www.linkedin.com/in/steve-sibi)
- 🐙 GitHub: [@steve-sibi](https://github.com/steve-sibi)
- 📧 Email: steve.sibi@gmail.com

---

## 🙏 Acknowledgments

- Icons by [Font Awesome](https://fontawesome.com/)
- Fonts by [Google Fonts](https://fonts.google.com/)
- Typing effect by [Typed.js](https://github.com/mattboldt/typed.js/)
- GitHub heatmap by [GitHub Calendar](https://github.com/Bloggify/github-calendar)
- Form backend by [Web3Forms](https://web3forms.com/)
- Hosting by [GitHub Pages](https://pages.github.com/)

---

## 🗺️ Roadmap

### ✅ Completed
- [x] Modularized JavaScript architecture
- [x] Project quick-view modal with copy-to-clipboard support
- [x] Resume preview modal with analytics events
- [x] Web3Forms-powered contact form with inline alerts
- [x] Bidirectional scroll arrow and section fade-in animations
- [x] Lazy-loaded GitHub activity and Typed.js hero text

### 🚧 In Progress
- [ ] Performance optimization (Font Awesome subset loading)
- [ ] Enhanced project screenshots / media slots

### 📅 Planned
- [ ] Automated image optimization pipeline
- [ ] GitHub Actions CI/CD for linting + CSS builds
- [ ] Accessibility audit (axe-core + manual testing)
- [ ] Progressive Web App enhancements
- [ ] Print-friendly stylesheet for resume downloads
