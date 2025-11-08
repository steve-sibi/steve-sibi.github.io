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
            try { localStorage.setItem('theme', isDark ? 'dark' : 'light'); } catch (_) { }
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
            new Typed('#typed-text', {
                strings: [
                    'Data Privacy &amp; Encryption',
                    'Network Security',
                    'Cloud Security',
                    'Incident Response',
                    'Threat Hunting',
                    'Penetration Testing',
                    'Reverse Engineering',
                    'Secure Software Engineering',
                    'SIEM',
                ],
                typeSpeed: 50,
                backSpeed: 50,
                backDelay: 2000,
                loop: true
            });
        } else {
            const typedEl = document.getElementById('typed-text');
            if (typedEl) typedEl.textContent = 'Cybersecurity';
        }

        // --- GitHub Calendar ---
        const pruneCalendar = () => {
            const calendar = document.querySelector('#github-calendar .calendar');
            if (!calendar) return false;

            const graphSection = calendar.querySelector('.position-relative');
            const svg = graphSection ? graphSection.querySelector('svg') : calendar.querySelector('svg');
            if (!svg) return false;

            let replacement;
            if (graphSection) {
                replacement = graphSection.cloneNode(true);
                replacement.classList.add('calendar-graph-only');
            } else {
                replacement = document.createElement('div');
                replacement.className = 'position-relative calendar-graph-only';
                replacement.appendChild(svg.cloneNode(true));
            }

            calendar.replaceChildren(replacement);
            return true;
        };

        const observeCalendar = () => {
            const target = document.getElementById('github-calendar');
            if (!target) return;

            const observer = new MutationObserver(() => {
                if (pruneCalendar()) {
                    observer.disconnect();
                }
            });

            observer.observe(target, { childList: true, subtree: true });
        };

        observeCalendar();

        if (typeof GitHubCalendar !== 'undefined') {
            try {
                const result = GitHubCalendar('#github-calendar', 'steve-sibi', { responsive: true, summary: false });
                if (result && typeof result.then === 'function') {
                    result.then(() => pruneCalendar()).catch(() => { });
                }
            } catch (err) {
                console.error('GitHubCalendar failed', err);
            }

            // Fallback cleanup in case rendering happens before observer attaches
            setTimeout(() => pruneCalendar(), 2500);
        }

        // =====================================================================
        // === Skills Explorer: Matrix =========================================
        // =====================================================================
        (async function () {
            const table = document.getElementById('skillsTable');
            if (!table) return;

            const tbody = table.querySelector('tbody');
            if (!tbody) return;

            let skills = [];

            // Try to load from external JSON first, fallback to embedded data
            try {
                const response = await fetch('data/skills.json');
                if (response.ok) {
                    skills = await response.json();
                    console.log('✅ Loaded skills from data/skills.json:', skills.length);
                } else {
                    throw new Error(`HTTP ${response.status}`);
                }
            } catch (error) {
                console.warn('⚠️ Failed to load external skills data:', error.message);
                console.log('Trying embedded fallback...');
                // Fallback to embedded data if exists
                const DATA_EL = document.getElementById('skillsData');
                if (DATA_EL) {
                    try {
                        const text = DATA_EL.textContent || DATA_EL.innerText || '[]';
                        skills = JSON.parse(text.trim());
                        console.log('✅ Loaded skills from embedded data:', skills.length);
                    } catch (parseError) {
                        console.error('❌ Failed to parse embedded skills data:', parseError);
                    }
                }
            }

            if (skills.length === 0) {
                console.error('❌ No skills data available from any source');
                tbody.innerHTML = '<tr><td colspan="4" class="text-center text-gray-500 dark:text-gray-400 py-6">Failed to load skills data. Please check console for details.</td></tr>';
                return;
            }

            const categories = [
                { id: 'cyber', label: 'Cybersecurity' },
                { id: 'prog', label: 'Programming' },
                { id: 'os', label: 'Operating Systems' },
                { id: 'cloud', label: 'Cloud & DevOps' }
            ];
            const filterButtons = Array.from(document.querySelectorAll('.skills-filter'));
            const headingEl = document.getElementById('skillsDisciplineHeading');
            const categoryLabels = Object.fromEntries(categories.map(c => [c.id, c.label]));
            categoryLabels.other = 'Other';
            let activeFilter = null;
            let emptyRow = null;
            let animationTimer = null;

            const formatYears = (years) => {
                if (!years) return 'Under 1 yr';
                return `${years} yr${years > 1 ? 's' : ''}`;
            };

            const renderSkill = (skill) => {
                const row = document.createElement('tr');
                row.dataset.cat = skill.cat || 'other';

                const name = document.createElement('th');
                name.scope = 'row';
                name.textContent = skill.name;
                row.appendChild(name);

                const levelValRaw = typeof skill.level === 'number' && !Number.isNaN(skill.level) ? Math.round(skill.level) : null;
                const level = document.createElement('td');
                level.className = 'skills-level';

                if (levelValRaw == null) {
                    level.textContent = '—';
                    level.classList.add('skills-level-text');
                } else {
                    const value = Math.min(100, Math.max(0, levelValRaw));
                    const progress = document.createElement('div');
                    progress.className = 'skills-progress';
                    progress.dataset.level = String(value);
                    progress.setAttribute('role', 'progressbar');
                    progress.setAttribute('aria-valuemin', '0');
                    progress.setAttribute('aria-valuemax', '100');
                    progress.setAttribute('aria-valuenow', String(value));
                    progress.setAttribute('aria-valuetext', `${value}% proficiency`);

                    const fill = document.createElement('div');
                    fill.className = 'skills-progress-fill';
                    fill.style.width = `${value}%`;
                    progress.appendChild(fill);

                    const label = document.createElement('span');
                    label.className = 'skills-progress-label';
                    label.textContent = `${value}%`;
                    if (value < 15) label.classList.add('is-low');
                    progress.appendChild(label);

                    if (value <= 0) progress.classList.add('is-empty');

                    level.appendChild(progress);
                }
                row.appendChild(level);

                const experience = document.createElement('td');
                experience.className = 'skills-experience';
                experience.textContent = formatYears(skill.years);
                row.appendChild(experience);

                const proof = document.createElement('td');
                if (skill.proof) {
                    const link = document.createElement('a');
                    link.className = 'skills-proof-link';
                    link.href = skill.proof;
                    link.target = '_blank';
                    link.rel = 'noopener';
                    link.innerHTML = `View <i class="fas fa-external-link-alt text-xs"></i>`;
                    proof.appendChild(link);
                } else {
                    proof.textContent = '—';
                }
                row.appendChild(proof);

                tbody.appendChild(row);
            };

            tbody.innerHTML = '';

            const categorySet = new Set(categories.map(c => c.id));

            categories.forEach(cat => {
                const group = skills.filter(skill => skill.cat === cat.id)
                    .sort((a, b) => b.level - a.level || a.name.localeCompare(b.name));
                if (!group.length) return;
                group.forEach(renderSkill);
            });

            const remaining = skills.filter(skill => !categorySet.has(skill.cat));
            if (remaining.length) {
                const otherCategory = { id: 'other', label: 'Other' };
                remaining.sort((a, b) => b.level - a.level || a.name.localeCompare(b.name))
                    .forEach(renderSkill);
            }

            const makeEmptyRow = (text) => {
                const row = document.createElement('tr');
                row.dataset.skillsEmpty = 'true';
                const cell = document.createElement('td');
                cell.colSpan = 4;
                cell.className = 'text-center text-sm text-gray-500 dark:text-gray-400 py-6';
                cell.textContent = text;
                row.appendChild(cell);
                return row;
            };

            const hasSkillRows = tbody.querySelectorAll('tr[data-cat]').length > 0;
            if (!hasSkillRows) {
                emptyRow = makeEmptyRow('No skills to show right now.');
                emptyRow.hidden = false;
                tbody.appendChild(emptyRow);
            } else {
                emptyRow = makeEmptyRow('No skills in this discipline yet.');
                emptyRow.hidden = true;
                tbody.appendChild(emptyRow);
            }

            const applyFilter = () => {
                const skillRows = Array.from(tbody.querySelectorAll('tr[data-cat]'))
                    .filter(row => !row.dataset.skillsEmpty);
                const hasSkills = skillRows.length > 0;

                if (!hasSkills) {
                    if (emptyRow) emptyRow.hidden = false;
                    return;
                }

                let visibleCount = 0;

                skillRows.forEach(row => {
                    const match = !activeFilter || row.dataset.cat === activeFilter;
                    row.hidden = !match;
                    if (match) {
                        visibleCount += 1;
                    }
                });

                if (emptyRow) {
                    emptyRow.hidden = visibleCount !== 0;
                }
            };

            const setActiveFilter = (cat, { animate = true, force = false } = {}) => {
                const target = cat || categories[0]?.id || filterButtons[0]?.dataset.cat;
                if (!target) return;
                if (!force && target === activeFilter) return;

                activeFilter = target;
                filterButtons.forEach(btn => {
                    const isActive = btn.dataset.cat === target;
                    btn.classList.toggle('is-active', isActive);
                    btn.setAttribute('aria-pressed', String(isActive));
                });

                if (headingEl) {
                    headingEl.textContent = categoryLabels[target] || categoryLabels.other;
                }

                if (animationTimer) {
                    clearTimeout(animationTimer);
                    animationTimer = null;
                }

                if (animate) {
                    table.classList.add('is-filtering');
                    animationTimer = setTimeout(() => {
                        applyFilter();
                        requestAnimationFrame(() => table.classList.remove('is-filtering'));
                        animationTimer = null;
                    }, 140);
                } else {
                    applyFilter();
                    table.classList.remove('is-filtering');
                    animationTimer = null;
                }
            };

            filterButtons.forEach(btn => {
                btn.addEventListener('click', () => {
                    const cat = btn.dataset.cat || null;
                    setActiveFilter(cat);
                });
            });

            setActiveFilter(filterButtons[0]?.dataset.cat || categories[0]?.id || null, { animate: false, force: true });
        })();

        // --- Scroll arrow (enhanced version at end of file) ---

        // --- Resume download GA event ---
        document.querySelectorAll('[data-resume-download]').forEach(link => {
            link.addEventListener('click', () => {
                if (typeof gtag === 'function') {
                    gtag('event', 'download_resume', { event_category: 'engagement', event_label: 'resume_pdf' });
                }
            });
        });

        // --- Copy email helper for recruiters ---
        const copyEmailBtn = document.getElementById('copyEmail');
        const copyEmailToast = document.getElementById('copyEmailToast');
        if (copyEmailBtn && copyEmailToast) {
            let toastTimer;
            copyEmailBtn.addEventListener('click', async () => {
                const email = copyEmailBtn.dataset.email || 'steve.sibi@gmail.com';
                try {
                    await navigator.clipboard.writeText(email);
                    copyEmailToast.textContent = 'Email copied — talk soon!';
                } catch (err) {
                    copyEmailToast.textContent = 'Copy not supported on this browser. Use the link above.';
                }
                copyEmailToast.classList.remove('hidden');
                if (toastTimer) clearTimeout(toastTimer);
                toastTimer = setTimeout(() => {
                    copyEmailToast.classList.add('hidden');
                }, 2800);
            });
        }

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
        // === Projects (filters/search/sort + quick view) ======================
        // =====================================================================
        const grid = document.getElementById('projectGrid');
        const cards = grid ? Array.from(grid.querySelectorAll('.project-card')) : [];
        const projectSearchInput = document.getElementById('projectSearch');
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
            doSort(cards.filter(c => !c.classList.contains('hidden')).concat(cards.filter(c => c.classList.contains('hidden'))));
        }
        filterButtons.forEach(btn => btn.addEventListener('click', () => setFilter(btn)));
        projectSearchInput?.addEventListener('input', () => { searchTerm = projectSearchInput.value.trim().toLowerCase(); applyProjectState(); });
        sortSelect?.addEventListener('change', () => { sortMode = sortSelect.value; applyProjectState(); });
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

            const img = card.dataset.img || '';
            if (img) {
                modalImg.src = img;
                modalImg.alt = `${card.dataset.title} preview`;
                modalMedia.classList.remove('hidden');
            } else {
                modalImg.removeAttribute('src');
                modalMedia.classList.add('hidden');
            }

            const ul = document.getElementById('modalHighlights');
            ul.innerHTML = '';
            const points = (card.dataset.highlights || '').split(';').map(s => s.trim()).filter(Boolean);
            points.forEach(pt => {
                const li = document.createElement('li');
                li.textContent = pt;
                ul.appendChild(li);
            });

            modalTech.innerHTML = '';
            (card.dataset.tech || '').split(',').map(s => s.trim()).filter(Boolean).forEach(t => {
                const span = document.createElement('span');
                span.className = 'tech-pill';
                span.textContent = t;
                modalTech.appendChild(span);
            });

            const repo = card.dataset.link || '#';
            const readme = card.dataset.readme || repo + '#readme';
            const clone = card.dataset.clone || (repo.endsWith('.git') ? repo : repo + '.git');

            modalLink.href = repo;
            modalReadme.href = readme;
            modalCopy.dataset.clipboard = clone;
            modalToast.classList.add('hidden');

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

        // =====================================================================
        // === Contact Form Handling ==========================================
        // =====================================================================
        const contactForm = document.getElementById('contactForm');
        if (contactForm) {
            const submitBtn = document.getElementById('contactSubmit');
            const submitText = document.getElementById('contactSubmitText');
            const submitIcon = document.getElementById('contactSubmitIcon');
            const successMsg = document.getElementById('contactSuccess');
            const errorMsg = document.getElementById('contactError');

            contactForm.addEventListener('submit', async (e) => {
                e.preventDefault();

                // Hide any previous messages
                successMsg?.classList.add('hidden');
                errorMsg?.classList.add('hidden');

                // Disable submit button
                if (submitBtn) {
                    submitBtn.disabled = true;
                    if (submitText) submitText.textContent = 'Sending...';
                    if (submitIcon) {
                        submitIcon.classList.remove('fa-paper-plane');
                        submitIcon.classList.add('fa-spinner', 'fa-spin');
                    }
                }

                try {
                    const formData = new FormData(contactForm);
                    const response = await fetch(contactForm.action, {
                        method: 'POST',
                        body: formData,
                        headers: {
                            'Accept': 'application/json'
                        }
                    });

                    if (response.ok) {
                        // Success
                        successMsg?.classList.remove('hidden');
                        contactForm.reset();

                        // Track with GA
                        if (typeof gtag === 'function') {
                            gtag('event', 'form_submission', {
                                event_category: 'Contact',
                                event_label: 'Contact Form'
                            });
                        }
                    } else {
                        throw new Error('Form submission failed');
                    }
                } catch (error) {
                    // Error
                    errorMsg?.classList.remove('hidden');
                    console.error('Contact form error:', error);
                } finally {
                    // Re-enable submit button
                    if (submitBtn) {
                        submitBtn.disabled = false;
                        if (submitText) submitText.textContent = 'Send Message';
                        if (submitIcon) {
                            submitIcon.classList.remove('fa-spinner', 'fa-spin');
                            submitIcon.classList.add('fa-paper-plane');
                        }
                    }
                }
            });
        }

        // =====================================================================
        // === Improved Scroll Arrow (Bidirectional) ==========================
        // =====================================================================
        const scrollArrow = document.getElementById('scroll-arrow');
        if (scrollArrow) {
            const icon = scrollArrow.querySelector('i');
            let isAtBottom = false;

            function updateScrollArrow() {
                const scrollTop = window.pageYOffset || document.documentElement.scrollTop;
                const windowHeight = window.innerHeight;
                const documentHeight = document.documentElement.scrollHeight;

                // Show arrow after scrolling down a bit
                if (scrollTop > 300) {
                    scrollArrow.classList.add('visible');
                } else {
                    scrollArrow.classList.remove('visible');
                }

                // Check if near bottom (within 100px)
                const nearBottom = scrollTop + windowHeight >= documentHeight - 100;

                if (nearBottom && !isAtBottom) {
                    isAtBottom = true;
                    scrollArrow.classList.add('at-bottom');
                    if (icon) {
                        icon.classList.remove('fa-chevron-down');
                        icon.classList.add('fa-chevron-up');
                    }
                    scrollArrow.setAttribute('aria-label', 'Scroll to top');
                } else if (!nearBottom && isAtBottom) {
                    isAtBottom = false;
                    scrollArrow.classList.remove('at-bottom');
                    if (icon) {
                        icon.classList.remove('fa-chevron-up');
                        icon.classList.add('fa-chevron-down');
                    }
                    scrollArrow.setAttribute('aria-label', 'Scroll down');
                }
            }

            scrollArrow.addEventListener('click', () => {
                if (isAtBottom) {
                    // Scroll to top
                    window.scrollTo({ top: 0, behavior: 'smooth' });
                } else {
                    // Scroll down one viewport
                    window.scrollBy({ top: window.innerHeight, behavior: 'smooth' });
                }
            });

            window.addEventListener('scroll', updateScrollArrow, { passive: true });
            updateScrollArrow(); // Initial check
        }

        // =====================================================================
        // === Page Load Animations (Intersection Observer) ===================
        // =====================================================================
        const fadeInSections = document.querySelectorAll('section');
        if (fadeInSections.length > 0 && 'IntersectionObserver' in window) {
            // Add fade-in class to all sections except hero
            fadeInSections.forEach(section => {
                if (section.id !== 'home') {
                    section.classList.add('fade-in-section');
                }
            });

            const fadeInObserver = new IntersectionObserver((entries) => {
                entries.forEach(entry => {
                    if (entry.isIntersecting) {
                        entry.target.classList.add('is-visible');
                        fadeInObserver.unobserve(entry.target);
                    }
                });
            }, {
                threshold: 0.1,
                rootMargin: '0px 0px -100px 0px'
            });

            fadeInSections.forEach(section => {
                if (section.classList.contains('fade-in-section')) {
                    fadeInObserver.observe(section);
                }
            });
        }

        // Add hero content animation class
        const heroContent = document.querySelector('#home .container');
        if (heroContent) {
            heroContent.classList.add('hero-content');
        }
    });
})();
