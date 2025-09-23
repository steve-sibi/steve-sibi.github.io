(() => {
    'use strict';

    document.addEventListener('DOMContentLoaded', () => {
        // --- Theme toggle ---
        const themeToggle = document.getElementById('themeToggle');
        function setThemeIcon() {
            const isDark = document.documentElement.classList.contains('dark');
            themeToggle.innerHTML = isDark ? '<i class="fas fa-sun"></i>' : '<i class="fas fa-moon"></i>';
            themeToggle.setAttribute('aria-pressed', String(isDark));
        }
        setThemeIcon();
        themeToggle.addEventListener('click', () => {
            document.documentElement.classList.toggle('dark');
            const isDark = document.documentElement.classList.contains('dark');
            try { localStorage.setItem('theme', isDark ? 'dark' : 'light'); } catch (e) { }
            setThemeIcon();
        });

        // --- Mobile drawer ---
        const sidebar = document.getElementById('sidebar');
        const menuButton = document.getElementById('menuButton');
        const menuIcon = document.getElementById('menuIcon');
        const overlay = document.getElementById('sidebarOverlay');
        let lastFocused;
        const isOpen = () => !sidebar.classList.contains('-translate-x-full');

        function openSidebar() {
            lastFocused = document.activeElement;
            sidebar.classList.remove('-translate-x-full');
            overlay.classList.remove('hidden');
            document.body.style.overflow = 'hidden';
            menuButton.setAttribute('aria-expanded', 'true');
            menuIcon.classList.replace('fa-bars', 'fa-times');
            sidebar.focus({ preventScroll: true });
        }
        function closeSidebar() {
            sidebar.classList.add('-translate-x-full');
            overlay.classList.add('hidden');
            document.body.style.overflow = '';
            menuButton.setAttribute('aria-expanded', 'false');
            menuIcon.classList.replace('fa-times', 'fa-bars');
            if (lastFocused) lastFocused.focus();
        }
        menuButton.addEventListener('click', () => (isOpen() ? closeSidebar() : openSidebar()));
        overlay.addEventListener('click', closeSidebar);

        document.addEventListener('keydown', (e) => {
            if (e.key === 'Escape' && isOpen()) { e.preventDefault(); closeSidebar(); }
            if (e.key === 'Tab' && isOpen()) {
                const focusables = sidebar.querySelectorAll('a, button, [tabindex]:not([tabindex="-1"])');
                if (!focusables.length) return;
                const first = focusables[0];
                const last = focusables[focusables.length - 1];
                if (e.shiftKey && document.activeElement === first) { e.preventDefault(); last.focus(); }
                else if (!e.shiftKey && document.activeElement === last) { e.preventDefault(); first.focus(); }
            }
        });
        sidebar.querySelectorAll('a').forEach(link => {
            link.addEventListener('click', () => {
                if (window.innerWidth < 768 && isOpen()) closeSidebar();
            });
        });

        // --- TypedJS (respect reduced motion) ---
        const prefersReduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
        if (!prefersReduced && typeof Typed !== 'undefined') {
            new Typed("#typed-text", {
                strings: [
                    "Penetration Testing",
                    "Reverse Engineering",
                    "Secure Software Engineering",
                    "SIEM",
                    "Data Privacy &amp; Encryption",
                ],
                typeSpeed: 50,
                backSpeed: 50,
                backDelay: 2000,
                loop: true,
            });
        } else {
            const typedEl = document.getElementById('typed-text');
            if (typedEl) typedEl.textContent = "Cybersecurity";
        }

        // --- GitHub Calendar ---
        if (typeof GitHubCalendar !== 'undefined') {
            GitHubCalendar("#github-calendar", "steve-sibi", { responsive: true, summary: false });
        }

        // --- Skills tabs (ARIA) ---
        const tablist = document.querySelector('[role="tablist"]');
        const tabs = tablist ? tablist.querySelectorAll('[role="tab"]') : [];
        const panels = document.querySelectorAll('[role="tabpanel"]');

        function activateTab(tab) {
            tabs.forEach(t => {
                const selected = t === tab;
                t.setAttribute('aria-selected', selected ? 'true' : 'false');
                t.tabIndex = selected ? 0 : -1;
                t.classList.toggle('bg-cyber-green', selected);
                t.classList.toggle('text-black', selected);
                t.classList.toggle('bg-transparent', !selected);
                t.classList.toggle('text-gray-800', !selected);
            });
            panels.forEach(p => {
                const match = p.id === tab.getAttribute('aria-controls');
                p.hidden = !match;
                p.classList.toggle('hidden', !match);
            });
            tab.focus();
        }
        tabs.forEach(tab => {
            tab.addEventListener('click', () => activateTab(tab));
            tab.addEventListener('keydown', (e) => {
                const i = Array.prototype.indexOf.call(tabs, tab);
                let newIndex = i;
                switch (e.key) {
                    case 'ArrowRight':
                    case 'ArrowDown': newIndex = (i + 1) % tabs.length; break;
                    case 'ArrowLeft':
                    case 'ArrowUp': newIndex = (i - 1 + tabs.length) % tabs.length; break;
                    case 'Home': newIndex = 0; break;
                    case 'End': newIndex = tabs.length - 1; break;
                    default: return;
                }
                e.preventDefault();
                activateTab(tabs[newIndex]);
            });
        });

        // --- Scroll arrow ---
        const scrollArrow = document.getElementById('scroll-arrow');
        window.addEventListener('scroll', () => {
            if (window.scrollY > 300) scrollArrow.classList.remove('opacity-0');
            else scrollArrow.classList.add('opacity-0');
            const atBottom = (window.innerHeight + window.scrollY) >= document.body.offsetHeight - 50;
            const icon = scrollArrow.querySelector('i');
            if (icon) {
                if (atBottom) { icon.classList.replace('fa-chevron-down', 'fa-chevron-up'); scrollArrow.setAttribute('aria-label', 'Scroll to top'); }
                else { icon.classList.replace('fa-chevron-up', 'fa-chevron-down'); scrollArrow.setAttribute('aria-label', 'Scroll down'); }
            }
        });
        scrollArrow.addEventListener('click', () => {
            const atBottom = (window.innerHeight + window.scrollY) >= document.body.offsetHeight - 50;
            if (atBottom) {
                window.scrollTo({ top: 0, behavior: 'smooth' });
            } else {
                const sections = document.querySelectorAll('section');
                const currentScroll = window.scrollY + 50;
                const nextSection = Array.from(sections).find(s => s.offsetTop > currentScroll);
                if (nextSection) nextSection.scrollIntoView({ behavior: 'smooth' });
            }
        });

        // --- Resume download GA event ---
        document.querySelectorAll('[data-resume-download]').forEach(link => {
            link.addEventListener('click', () => {
                if (typeof gtag === 'function') {
                    gtag('event', 'download_resume', {
                        event_category: 'engagement',
                        event_label: 'resume_pdf'
                    });
                }
            });
        });

        // --- Active nav link highlight on scroll ---
        const sections = document.querySelectorAll('main section[id]');
        const navLinks = Array.from(document.querySelectorAll('#sidebar a[href^="#"]'));
        const io = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                const id = entry.target.id;
                const link = navLinks.find(a => a.getAttribute('href') === `#${id}`);
                if (!link) return;
                if (entry.isIntersecting) {
                    navLinks.forEach(a => a.removeAttribute('aria-current'));
                    link.setAttribute('aria-current', 'true');
                }
            });
        }, { rootMargin: '-40% 0px -55% 0px', threshold: 0.01 });
        sections.forEach(s => io.observe(s));

        // =====================================================================
        // === Projects: filters, search, sort, and enhanced quick-view =========
        // =====================================================================
        const grid = document.getElementById('projectGrid');
        const cards = grid ? Array.from(grid.querySelectorAll('.project-card')) : [];
        const searchInput = document.getElementById('projectSearch');
        const sortSelect = document.getElementById('projectSort');
        const countEl = document.getElementById('projectCount');
        const emptyEl = document.getElementById('projectEmpty');
        const filterButtons = Array.from(document.querySelectorAll('.project-filter'));

        const originalOrder = cards.slice();
        let activeFilter = 'all';
        let searchTerm = '';
        let sortMode = 'default';

        function setFilter(btn) {
            activeFilter = btn.dataset.filter || 'all';
            filterButtons.forEach(b => b.setAttribute('aria-pressed', String(b === btn)));
            applyProjectState();
        }
        function matchesFilter(card) {
            if (activeFilter === 'all') return true;
            const tags = (card.dataset.tags || '').toLowerCase().split(',').map(s => s.trim());
            return tags.includes(activeFilter);
        }
        function matchesSearch(card) {
            if (!searchTerm) return true;
            const hay = ((card.dataset.title || '') + ' ' + (card.dataset.tech || '') + ' ' + (card.textContent || '')).toLowerCase();
            return hay.includes(searchTerm);
        }
        function doSort(list) {
            if (sortMode === 'az') list.sort((a, b) => a.dataset.title.localeCompare(b.dataset.title));
            else if (sortMode === 'za') list.sort((a, b) => b.dataset.title.localeCompare(a.dataset.title));
            else list.sort((a, b) => originalOrder.indexOf(a) - originalOrder.indexOf(b));
            list.forEach(node => grid.appendChild(node));
        }
        function applyProjectState() {
            let visible = 0;
            cards.forEach(card => {
                const show = matchesFilter(card) && matchesSearch(card);
                card.classList.toggle('hidden', !show);
                card.setAttribute('aria-hidden', String(!show));
                if (show) visible++;
            });
            if (countEl) countEl.textContent = `Showing ${visible} project${visible === 1 ? '' : 's'}`;
            if (emptyEl) emptyEl.classList.toggle('hidden', visible !== 0);
            // keep order stable but push hidden to the end
            doSort(cards.filter(c => !c.classList.contains('hidden')).concat(cards.filter(c => c.classList.contains('hidden'))));
        }
        filterButtons.forEach(btn => btn.addEventListener('click', () => setFilter(btn)));
        if (searchInput) searchInput.addEventListener('input', () => { searchTerm = searchInput.value.trim().toLowerCase(); applyProjectState(); });
        if (sortSelect) sortSelect.addEventListener('change', () => { sortMode = sortSelect.value; applyProjectState(); });
        applyProjectState();

        // --- Enhanced Quick View modal ---
        const modal = document.getElementById('projectModal');
        const modalTitle = document.getElementById('modalTitle');
        const modalDesc = document.getElementById('modalDesc');
        const modalTech = document.getElementById('modalTech');
        const modalLink = document.getElementById('modalLink');
        const modalReadme = document.getElementById('modalReadme');
        const modalCopy = document.getElementById('modalCopy');
        const modalToast = document.getElementById('modalToast');
        const modalMedia = document.getElementById('modalMedia');
        const modalImg = document.getElementById('modalImg');
        let modalReturnFocus = null;

        function openModalFromCard(card) {
            modalReturnFocus = document.activeElement;

            modalTitle.textContent = card.dataset.title || 'Project';

            const p = card.querySelector('p');
            modalDesc.textContent = p ? p.textContent.trim() : '';

            // Media (optional)
            const img = card.dataset.img || '';
            if (img) {
                modalImg.src = img;
                modalImg.alt = `${card.dataset.title} preview`;
                modalMedia.classList.remove('hidden');
            } else {
                modalImg.removeAttribute('src');
                modalMedia.classList.add('hidden');
            }

            // Highlights
            const ul = document.getElementById('modalHighlights');
            ul.innerHTML = '';
            const points = (card.dataset.highlights || '').split(';').map(s => s.trim()).filter(Boolean);
            points.forEach(pt => {
                const li = document.createElement('li');
                li.textContent = pt;
                ul.appendChild(li);
            });

            // Stack
            modalTech.innerHTML = '';
            (card.dataset.tech || '').split(',').map(s => s.trim()).filter(Boolean).forEach(t => {
                const span = document.createElement('span');
                span.className = 'tech-pill';
                span.textContent = t;
                modalTech.appendChild(span);
            });

            // Links
            const repo = card.dataset.link || '#';
            const readme = card.dataset.readme || repo + '#readme';
            const clone = card.dataset.clone || (repo.endsWith('.git') ? repo : repo + '.git');

            modalLink.href = repo;
            modalReadme.href = readme;
            modalCopy.dataset.clipboard = clone;
            modalToast.classList.add('hidden');

            // show
            modal.classList.remove('hidden');
            const closer = modal.querySelector('[data-close-modal]');
            closer && closer.focus();
            document.body.style.overflow = 'hidden';
        }
        function closeModal() {
            modal.classList.add('hidden');
            document.body.style.overflow = '';
            if (modalReturnFocus) modalReturnFocus.focus();
        }
        document.querySelectorAll('.quick-view').forEach(btn => {
            btn.addEventListener('click', e => {
                const card = e.currentTarget.closest('.project-card');
                if (card) openModalFromCard(card);
            });
        });
        modal.querySelectorAll('[data-close-modal]').forEach(el => el.addEventListener('click', closeModal));
        document.addEventListener('keydown', e => { if (e.key === 'Escape' && !modal.classList.contains('hidden')) closeModal(); });
        const panel = modal.querySelector('div.relative');
        if (panel) panel.addEventListener('click', e => e.stopPropagation());

        // Copy clone
        if (modalCopy) {
            modalCopy.addEventListener('click', async () => {
                const text = modalCopy.dataset.clipboard || '';
                try {
                    await navigator.clipboard.writeText(text);
                    modalToast.textContent = 'Copied to clipboard';
                    modalToast.classList.remove('hidden');
                    setTimeout(() => modalToast.classList.add('hidden'), 1600);
                } catch {
                    modalToast.textContent = 'Press ⌘/Ctrl+C to copy';
                    modalToast.classList.remove('hidden');
                    setTimeout(() => modalToast.classList.add('hidden'), 2000);
                }
            });
        }

    });
}
)();
