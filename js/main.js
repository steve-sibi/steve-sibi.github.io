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
        if (typeof GitHubCalendar !== 'undefined') {
            GitHubCalendar('#github-calendar', 'steve-sibi', { responsive: true, summary: false });
        }

        // =====================================================================
        // === Skills Explorer: Overview (Radar) + Matrix =======================
        // =====================================================================
        (function () {
            const DATA_EL = document.getElementById('skillsData');
            if (!DATA_EL) return;

            const skills = JSON.parse(DATA_EL.textContent || '[]');

            const catLabels = {
                all: 'All',
                cyber: 'Cybersecurity',
                prog: 'Programming',
                os: 'Operating Systems',
                cloud: 'Cloud & DevOps'
            };

            const viewOverviewBtn = document.getElementById('skillsViewOverview');
            const viewMatrixBtn = document.getElementById('skillsViewMatrix');
            const overviewWrap = document.getElementById('skillsOverview');
            const matrixWrap = document.getElementById('skillsMatrix');
            const searchInput = document.getElementById('skillsSearch');
            const chips = Array.from(document.querySelectorAll('.chip'));
            const topList = document.getElementById('skillsTopList');

            const densityCompactBtn = document.getElementById('skillsDensityCompact');
            const densityCozyBtn = document.getElementById('skillsDensityCozy');
            const moreBtn = document.getElementById('skillsMore');

            // ---------- helpers ----------
            const press = (btn, active) => {
                if (!btn) return;
                btn.setAttribute('aria-pressed', String(active));
                btn.classList.toggle('is-active', active);
            };
            const isDark = () => document.documentElement.classList.contains('dark');
            const niceAgo = (ym) => {
                if (!ym) return 'recently';
                const [y, m] = ym.split('-').map(Number);
                const d = new Date(y, (m || 1) - 1, 1);
                const now = new Date();
                const months = (now.getFullYear() - d.getFullYear()) * 12 + (now.getMonth() - d.getMonth());
                if (months <= 0) return 'recently';
                if (months < 12) return `${months} mo ago`;
                const yrs = Math.floor(months / 12);
                return `${yrs} yr${yrs > 1 ? 's' : ''} ago`;
            };
            const wrapLabel = (s) => {
                if (!s) return s;
                // Try to break on " & " first, otherwise on spaces
                if (s.length > 12 && s.includes(' & ')) return s.replace(' & ', ' &\n');
                if (s.length > 14) return s.replace(/\s+/g, '\n');
                return s;
            };

            // ---------- state ----------
            let activeCat = 'all';
            let query = '';
            let radar = null;
            let density = 'compact';
            let page = 1;
            const pageSize = 9;

            matrixWrap.dataset.density = density;

            function filtered() {
                return skills.filter(s =>
                    (activeCat === 'all' || s.cat === activeCat) &&
                    (!query || s.name.toLowerCase().includes(query))
                );
            }

            // ---------- view toggle ----------
            function setView(which) {
                const overview = which === 'overview';
                overviewWrap.hidden = !overview;
                matrixWrap.hidden = overview;

                press(viewOverviewBtn, overview);
                press(viewMatrixBtn, !overview);

                page = 1; // reset paging on switch
                if (overview) {
                    if (moreBtn) moreBtn.classList.add('hidden');  // hide "Show more" in Overview
                    renderRadar();
                } else {
                    renderMatrix();
                }
            }
            viewOverviewBtn.addEventListener('click', () => setView('overview'));
            viewMatrixBtn.addEventListener('click', () => setView('matrix'));

            // ---------- chips ----------
            chips.forEach(btn => {
                btn.addEventListener('click', () => {
                    activeCat = btn.dataset.cat || 'all';
                    chips.forEach(c => press(c, c === btn));
                    page = 1;
                    if (matrixWrap.hidden) renderRadar(); else renderMatrix();
                });
            });

            // ---------- search ----------
            if (searchInput) {
                searchInput.addEventListener('input', () => {
                    query = (searchInput.value || '').trim().toLowerCase();
                    page = 1;
                    if (matrixWrap.hidden) renderRadar(); else renderMatrix();
                });
            }

            // ---------- density ----------
            function setDensity(mode) {
                density = mode;
                matrixWrap.dataset.density = density;
                press(densityCompactBtn, mode === 'compact');
                press(densityCozyBtn, mode === 'cozy');
                if (!matrixWrap.hidden) renderMatrix();
            }
            densityCompactBtn?.addEventListener('click', () => setDensity('compact'));
            densityCozyBtn?.addEventListener('click', () => setDensity('cozy'));

            // ---------- show more ----------
            moreBtn?.addEventListener('click', () => { page += 1; renderMatrix(); });

            // ---------- matrix ----------
            function renderMatrix() {
                matrixWrap.innerHTML = '';
                const all = filtered().sort((a, b) => b.level - a.level);
                const slice = all.slice(0, page * pageSize);

                if (!slice.length) {
                    matrixWrap.innerHTML = `<p class="col-span-full text-center text-gray-600 dark:text-gray-400">No skills match your filters.</p>`;
                    moreBtn?.classList.add('hidden');
                    return;
                }

                slice.forEach(s => {
                    const card = document.createElement('article');
                    card.className = 'skill-card';
                    card.innerHTML = `
            <div class="flex items-start justify-between gap-3">
              <div>
                <h4 class="skill-name text-black dark:text-cyber-green">${s.name}</h4>
                <p class="text-xs text-gray-600 dark:text-gray-400">${catLabels[s.cat] || ''}</p>
              </div>
              <div class="skill-pill">${s.level}%</div>
            </div>
            <div class="skill-meter mt-3"><span style="width:${s.level}%"></span></div>
            <div class="mt-3 flex flex-wrap items-center gap-2">
              <span class="skill-pill">Last used: ${niceAgo(s.lastUsed)}</span>
              <span class="skill-pill">${s.years} yr${s.years > 1 ? 's' : ''} exp</span>
              ${s.proof ? `<a class="project-btn project-btn--ghost ml-auto" href="${s.proof}" target="_blank" rel="noopener"><i class="fas fa-external-link-alt text-xs"></i><span>Repo</span></a>` : ''}
            </div>`;
                    matrixWrap.appendChild(card);
                });

                // Pager visibility + label
                if (moreBtn) {
                    const remaining = all.length - slice.length;
                    if (remaining > 0) {
                        const next = Math.min(pageSize, remaining);
                        moreBtn.textContent = `Show ${next} more`;
                        moreBtn.classList.remove('hidden');
                    } else {
                        moreBtn.classList.add('hidden');
                    }
                }
            }

            // ---------- radar ----------
            function radarColors() {
                const grid = isDark() ? 'rgba(0,255,159,0.15)' : 'rgba(0,0,0,0.18)';
                const tick = isDark() ? '#a7f3d0' : '#111';
                const label = isDark() ? '#d1fae5' : '#111';
                const fill = 'rgba(0,255,159,0.20)';
                const line = 'rgba(0,255,159,0.9)';
                const point = '#00ff9f';
                return { grid, tick, label, fill, line, point };
            }

            // tint + value labels
            const neonPlugin = {
                id: 'neonPlugin',
                beforeDraw(chart) {
                    const { ctx, chartArea } = chart;
                    if (!chartArea) return;
                    ctx.save();
                    ctx.globalCompositeOperation = 'destination-over';
                    ctx.fillStyle = isDark() ? 'rgba(0,255,159,.05)' : 'rgba(0,0,0,.03)';
                    ctx.fillRect(chartArea.left, chartArea.top, chartArea.right - chartArea.left, chartArea.bottom - chartArea.top);
                    ctx.restore();
                },
                afterDatasetsDraw(chart) {
                    const { ctx, data } = chart;
                    const meta = chart.getDatasetMeta(0);
                    ctx.save();
                    ctx.font = '12px ui-sans-serif, system-ui, -apple-system';
                    ctx.fillStyle = isDark() ? '#9ae6c1' : '#111';
                    meta.data.forEach((pt, i) => {
                        const val = data.datasets[0].data[i];
                        if (typeof val === 'number') ctx.fillText(String(val), pt.x + 6, pt.y - 6);
                    });
                    ctx.restore();
                }
            };

            function renderRadar() {
                if (typeof Chart === 'undefined') return;

                const top = filtered().sort((a, b) => b.level - a.level).slice(0, 6);
                renderTopList(top);

                const ctx = document.getElementById('skillsRadar');
                const { grid, tick, label, fill, line, point } = radarColors();

                if (radar) radar.destroy();
                radar = new Chart(ctx, {
                    type: 'radar',
                    data: {
                        labels: top.map(s => s.name),
                        datasets: [{
                            label: 'Proficiency',
                            data: top.map(s => s.level),
                            backgroundColor: fill,
                            borderColor: line,
                            pointBackgroundColor: point,
                            pointBorderColor: line,
                            borderWidth: 2,
                            pointRadius: 3,
                            pointHoverRadius: 5,
                            tension: .2
                        }]
                    },
                    options: {
                        maintainAspectRatio: false,
                        layout: { padding: 12 },
                        animation: { duration: 400 },
                        scales: {
                            r: {
                                suggestedMin: 0, suggestedMax: 100,
                                grid: { color: grid },
                                angleLines: { color: grid },
                                pointLabels: {
                                    color: label,
                                    font: { weight: '700', size: 12 },
                                    padding: 4,
                                    centerPointLabels: true,
                                    callback: (v) => wrapLabel(v)
                                },
                                ticks: { color: tick, showLabelBackdrop: false, stepSize: 20 }
                            }
                        },
                        plugins: { legend: { display: false }, tooltip: { enabled: true } }
                    },
                    plugins: [neonPlugin]
                });
            }

            function renderTopList(top) {
                topList.innerHTML = '';
                top.forEach(s => {
                    const li = document.createElement('li');
                    li.innerHTML = `<span class="font-semibold text-black dark:text-cyber-green">${s.name}</span> — ${s.level}% • ${s.years}y • ${niceAgo(s.lastUsed)}`;
                    topList.appendChild(li);
                });
            }

            // keep chart theme in sync
            const themeBtn = document.getElementById('themeToggle');
            themeBtn?.addEventListener('click', () => {
                setTimeout(() => { if (!matrixWrap.hidden) return; renderRadar(); }, 0);
            });

            // Initial view
            setView('overview');
            // Make initial pressed styles correct
            press(chips.find(c => c.dataset.cat === 'all'), true);
            press(densityCompactBtn, true);
        })();

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
    });
})();
