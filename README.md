# 🔐 Steve Joseph Sibi - Cybersecurity Portfolio

[![Live Site](https://img.shields.io/badge/Live-steve--sibi.github.io-00ff9f?style=for-the-badge)](https://steve-sibi.github.io/)
[![License: ISC](https://img.shields.io/badge/License-ISC-blue.svg?style=for-the-badge)](LICENSE)

> A modern, performant portfolio showcasing cybersecurity projects, skills, and professional experience. Built with vanilla JavaScript, Tailwind CSS 4, and deployed on GitHub Pages.

![Portfolio Preview](images/og-card.png)

---

## 🚀 Features

### ✨ Core Features
- **🎨 Dark/Light Mode** - Persistent theme toggle with system preference detection
- **📱 Fully Responsive** - Mobile-first design with smooth animations
- **♿ Accessible** - ARIA labels, keyboard navigation, and semantic HTML
- **⚡ Performance Optimized** - Lazy loading, intersection observers, and progressive enhancement
- **🔍 Interactive Projects** - Filterable, searchable project showcase with quick-view modals
- **📊 Dynamic Skills Matrix** - Category-based skill filtering with proficiency indicators
- **📬 Contact Form** - Integrated Web3Forms with validation and success/error states
- **📈 GitHub Activity** - Live contribution calendar via GitHub Calendar API
- **🎯 Smooth Scrolling** - Bidirectional scroll arrow with section-by-section navigation

### 🛠️ Technical Highlights
- **Zero Build Dependencies** - Pure HTML/CSS/JS with Tailwind CLI
- **Modern ES6+** - Clean, maintainable JavaScript with IIFE pattern
- **Data-Driven** - External JSON for projects and skills (easy to update)
- **SEO Optimized** - Structured data, Open Graph tags, and semantic markup
- **Analytics Ready** - Google Analytics 4 integration with event tracking

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

---

## ⚡ Quick Start

### Prerequisites
- **Node.js** 18+ (for Tailwind CLI)
- **npm** or **yarn**
- A modern web browser

### Installation

```bash
# Clone the repository
git clone https://github.com/steve-sibi/steve-sibi.github.io.git
cd steve-sibi.github.io

# Install dependencies
npm install

# Build Tailwind CSS
npm run build:css

# Start local development server
npm start
```

Visit `http://localhost:8000` in your browser.

---

## 🔧 Development

### Available Scripts

| Command | Description |
|---------|-------------|
| `npm run build:css` | Build and minify Tailwind CSS (production) |
| `npm run watch:css` | Watch Tailwind source and rebuild on changes |
| `npm start` | Start Python HTTP server on port 8000 |
| `npm run dev` | Run watch + server concurrently |

### Development Workflow

1. **Start the watch server** for live CSS updates:
   ```bash
   npm run dev
   ```

2. **Edit files**:
   - HTML: `index.html`
   - JavaScript: `js/main.js`
   - Tailwind CSS: `src/tailwind.css`
   - Custom styles: `css/styles.css`
   - Data: `data/projects.json`, `data/skills.json`

3. **Tailwind changes** are auto-compiled to `css/tailwind.css`

4. **Refresh browser** to see changes

### Making Content Changes

#### Update Projects
Edit `data/projects.json`:
```json
{
  "title": "My Awesome Project",
  "description": "A brief description",
  "tags": ["security", "cloud"],
  "tech": ["Python", "AWS"],
  "icon": "fas fa-shield-alt",
  "link": "https://github.com/user/repo",
  "highlights": [
    "Key achievement 1",
    "Key achievement 2"
  ]
}
```

#### Update Skills
Edit `data/skills.json`:
```json
{
  "name": "Python",
  "cat": "prog",
  "level": 90,
  "years": 5,
  "proof": "https://github.com/user/repo"
}
```

**Skill categories**: `cyber`, `prog`, `os`, `cloud`, `other`

#### Update Personal Info
Edit `index.html` sections directly:
- Hero section (`#home`)
- About section (`#about`)
- Experience section (`#experience`)
- Contact section (`#contact`)

---

## 📦 Build & Deploy

### Production Build

```bash
# Build optimized Tailwind CSS
npm run build:css
```

This generates a minified `css/tailwind.css` file.

### Deploy to GitHub Pages

**Automatic Deployment** (recommended):
1. Push to `main` branch
2. GitHub Pages auto-deploys from root directory

**Manual Deployment**:
```bash
git add .
git commit -m "Update portfolio"
git push origin main
```

### Deploy to Other Platforms

#### Netlify
```bash
# Build command
npm run build:css

# Publish directory
./
```

#### Vercel
```bash
# Build command
npm run build:css

# Output directory
./
```

---

## 📁 Project Structure

```
steve-sibi.github.io/
├── assets/              # Static assets (resume PDF, etc.)
│   └── Resume_Steve_Sibi_Cyber.pdf
├── css/                 # Stylesheets
│   ├── styles.css       # Custom CSS (animations, components)
│   └── tailwind.css     # Generated Tailwind output (DO NOT EDIT)
├── data/                # External data files
│   ├── projects.json    # Projects data
│   └── skills.json      # Skills matrix data
├── icons/               # Favicons and PWA manifest
│   ├── favicon.ico
│   ├── apple-touch-icon.png
│   └── site.webmanifest
├── images/              # Images and media
│   ├── og-card.png      # Social media preview
│   └── profile_pic_steve.jpg
├── js/                  # JavaScript modules
│   └── main.js          # Main application logic
├── src/                 # Source files
│   └── tailwind.css     # Tailwind input file
├── .github/             # GitHub configuration
│   └── copilot-instructions.md
├── index.html           # Main HTML file
├── package.json         # Dependencies and scripts
└── README.md            # This file
```

### Key Files

| File | Purpose |
|------|---------|
| `index.html` | Single-page portfolio markup |
| `js/main.js` | All interactive behaviors (theme, navigation, projects, skills, forms) |
| `src/tailwind.css` | Tailwind input (edit this for Tailwind changes) |
| `css/tailwind.css` | Generated Tailwind output (auto-generated, don't edit) |
| `css/styles.css` | Custom CSS for animations and components |
| `data/projects.json` | Projects data (external for easy updates) |
| `data/skills.json` | Skills data (external for easy updates) |

---

## 🛠️ Tech Stack

### Core Technologies
- **HTML5** - Semantic markup with ARIA
- **CSS3** - Custom properties, animations, grid/flexbox
- **JavaScript (ES6+)** - Vanilla JS, no frameworks
- **Tailwind CSS 4** - Utility-first CSS framework

### Libraries & APIs
| Library | Purpose | Version |
|---------|---------|---------|
| [Tailwind CSS](https://tailwindcss.com/) | Utility-first CSS framework | 4.1.13 |
| [Font Awesome](https://fontawesome.com/) | Icon library | 7.0.1 |
| [Typed.js](https://github.com/mattboldt/typed.js/) | Typing animation | 2.0.12 |
| [GitHub Calendar](https://github.com/Bloggify/github-calendar) | Contribution heatmap | Latest |
| [Web3Forms](https://web3forms.com/) | Contact form backend | API |

### Development Tools
- **Tailwind CLI** - CSS compilation
- **Python HTTP Server** - Local development
- **GitHub Pages** - Hosting & deployment
- **Google Analytics 4** - Analytics & tracking

---

## ⚙️ Configuration

### Tailwind Configuration

Tailwind is configured inline in `src/tailwind.css`:
```css
@import "tailwindcss";

@theme {
  --color-cyber-green: #00ff9f;
  --color-cyber-dark: #0a0e27;
  /* ... custom theme variables */
}
```

### Analytics

Update Google Analytics ID in `index.html`:
```html
<script async src="https://www.googletagmanager.com/gtag/js?id=YOUR-GA-ID"></script>
```

### Contact Form

Update Web3Forms access key in `index.html`:
```html
<input type="hidden" name="access_key" value="YOUR-ACCESS-KEY">
```

Get a free key at [web3forms.com](https://web3forms.com/)

### GitHub Calendar

Update username in `js/main.js`:
```javascript
GitHubCalendar('#github-calendar', 'YOUR-USERNAME', { responsive: true, summary: false });
```

---

## 🎨 Customization

### Colors

Edit custom colors in `src/tailwind.css`:
```css
@theme {
  --color-cyber-green: #00ff9f;      /* Primary accent */
  --color-cyber-green-dark: #00b377; /* Darker shade */
  --color-cyber-dark: #0a0e27;       /* Dark mode background */
}
```

Then rebuild:
```bash
npm run build:css
```

### Fonts

Current font: **Share Tech Mono** (Google Fonts)

To change, edit `index.html`:
```html
<link href="https://fonts.googleapis.com/css2?family=YOUR-FONT&display=swap" rel="stylesheet">
```

And update `src/tailwind.css`:
```css
@theme {
  --font-family-sans: "YOUR FONT", system-ui, sans-serif;
}
```

### Animations

Custom animations are in `css/styles.css`. Edit timing, easing, or create new animations:
```css
.fade-in-section {
  opacity: 0;
  transform: translateY(20px);
  transition: opacity 0.6s ease-out, transform 0.6s ease-out;
}
```

---

## ⚡ Performance

### Current Metrics
- **Lighthouse Score**: 95+ (Performance, Accessibility, Best Practices, SEO)
- **First Contentful Paint**: < 1.5s
- **Time to Interactive**: < 3.5s
- **Cumulative Layout Shift**: < 0.1

### Optimizations Implemented
✅ Lazy loading for GitHub Calendar and Typed.js  
✅ Intersection Observer for animations  
✅ Minified Tailwind CSS  
✅ Preconnect to external domains  
✅ Prefetch resume PDF  
✅ Inline critical CSS prevention (theme script)  
✅ Reduced motion support  

### Performance Tips
- Keep images optimized and use WebP when possible
- Minimize external scripts
- Use responsive images with `srcset`
- Defer non-critical JavaScript
- Enable browser caching

---

## 🌐 Browser Support

| Browser | Minimum Version |
|---------|----------------|
| Chrome | 90+ |
| Firefox | 88+ |
| Safari | 14+ |
| Edge | 90+ |

**Required Features**:
- CSS Custom Properties
- ES6+ JavaScript
- IntersectionObserver API
- Fetch API
- CSS Grid & Flexbox

---

## 🤝 Contributing

This is a personal portfolio, but suggestions are welcome!

1. **Fork** the repository
2. **Create** a feature branch (`git checkout -b feature/amazing-feature`)
3. **Commit** changes (`git commit -m 'Add amazing feature'`)
4. **Push** to branch (`git push origin feature/amazing-feature`)
5. **Open** a Pull Request

### Development Guidelines
- Follow existing code style
- Test on multiple browsers
- Ensure accessibility standards
- Keep dependencies minimal
- Document major changes

---

## 📝 License

This project is licensed under the **ISC License**.

Copyright © 2025 Steve Joseph Sibi

Permission to use, copy, modify, and/or distribute this software for any purpose with or without fee is hereby granted, provided that the above copyright notice and this permission notice appear in all copies.

---

## 📬 Contact

**Steve Joseph Sibi**  
Cybersecurity Engineer | Penetration Tester | Privacy Advocate

- 🌐 Website: [steve-sibi.github.io](https://steve-sibi.github.io/)
- 💼 LinkedIn: [steve-sibi](https://www.linkedin.com/in/steve-sibi)
- 🐙 GitHub: [@steve-sibi](https://github.com/steve-sibi)
- 📧 Email: steve.sibi@gmail.com
https://www.teleparty.com/movie/1226354/param-sundari?sessionId=1cecc72c6274ab94
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
- [x] Interactive contact form
- [x] Bidirectional scroll arrow
- [x] Page load animations
- [x] External skills/projects data
- [x] Dark/light mode toggle
- [x] GitHub activity calendar

### 🚧 In Progress
- [ ] Performance optimization (Font Awesome subset)
- [ ] JavaScript modularization
- [ ] Enhanced project screenshots

### 📅 Planned
- [ ] Image optimization pipeline
- [ ] GitHub Actions CI/CD
- [ ] Accessibility audit
- [ ] Progressive Web App features
- [ ] Resume viewer modal
- [ ] Print stylesheet

---

<div align="center">

**⭐ Star this repo if you found it helpful!**

Made with ❤️ and ☕ by [Steve Sibi](https://steve-sibi.github.io/)

</div>
