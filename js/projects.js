/**
 * Projects module
 * Dynamic project grid with filtering, search, and sorting
 */

(() => {
    'use strict';

    document.addEventListener('DOMContentLoaded', async () => {
        const grid = document.getElementById('projectGrid');
        if (!grid) return;

        const projectSearchInput = document.getElementById('projectSearch');
        const sortSelect = document.getElementById('projectSort');
        const countEl = document.getElementById('projectCount');
        const emptyEl = document.getElementById('projectEmpty');
        const projectLoading = document.getElementById('projectLoading');
        const filterButtons = Array.from(document.querySelectorAll('.project-filter'));

        let cards = [];
        let originalOrder = [];
        let activeFilter = 'all';
        let searchTerm = '';
        let sortMode = 'default';

        const setFilter = (btn) => {
            activeFilter = btn.dataset.filter || 'all';
            filterButtons.forEach(b => b.setAttribute('aria-pressed', String(b === btn)));
            applyProjectState();
        };

        const matchesFilter = (card) => {
            if (activeFilter === 'all') return true;
            const tags = (card.dataset.tags || '').toLowerCase().split(',').map(s => s.trim());
            return tags.includes(activeFilter);
        };

        const matchesSearch = (card) => {
            if (!searchTerm) return true;
            const hay = ((card.dataset.title || '') + ' ' + (card.dataset.tech || '') + ' ' + (card.textContent || '')).toLowerCase();
            return hay.includes(searchTerm);
        };

        const doSort = (list) => {
            if (sortMode === 'az') list.sort((a, b) => a.dataset.title.localeCompare(b.dataset.title));
            else if (sortMode === 'za') list.sort((a, b) => b.dataset.title.localeCompare(a.dataset.title));
            else list.sort((a, b) => originalOrder.indexOf(a) - originalOrder.indexOf(b));
            list.forEach(node => grid.appendChild(node));
        };

        const applyProjectState = () => {
            let visible = 0;
            cards.forEach(card => {
                const show = matchesFilter(card) && matchesSearch(card);
                card.classList.toggle('hidden', !show);
                card.setAttribute('aria-hidden', String(!show));
                if (show) visible++;
            });
            if (countEl) countEl.textContent = `Showing ${visible} project${visible === 1 ? '' : 's'}`;
            if (emptyEl) {
                const isHidden = visible !== 0;
                emptyEl.classList.toggle('hidden', isHidden);
                emptyEl.setAttribute('aria-hidden', String(isHidden));
            }
            if (cards.length) {
                const visibleCards = cards.filter(c => !c.classList.contains('hidden'));
                const hiddenCards = cards.filter(c => c.classList.contains('hidden'));
                doSort(visibleCards.concat(hiddenCards));
            }
        };

        const createProjectCard = (project) => {
            const article = document.createElement('article');
            article.className = 'project-card border border-cyber-green p-5 rounded-lg bg-gray-100 dark:bg-cyber-dark dark:bg-opacity-30 transition-all duration-300';
            article.setAttribute('role', 'listitem');
            article.dataset.title = project.title || 'Project';
            article.dataset.tags = (project.tags || []).join(',');
            article.dataset.tech = (project.tech || []).join(', ');
            article.dataset.link = project.link || '#';
            article.dataset.readme = project.readme || (project.link ? `${project.link}#readme` : '#');
            article.dataset.clone = project.clone || (project.link ? `${project.link}.git` : '#');
            article.dataset.highlights = (project.highlights || []).join(';');

            const header = document.createElement('header');
            header.className = 'flex items-start gap-3';

            const iconWrap = document.createElement('div');
            iconWrap.className = 'text-cyber-green mt-1';
            iconWrap.innerHTML = `<i class="${project.icon || 'fas fa-project-diagram'}" aria-hidden="true"></i>`;

            const copyWrap = document.createElement('div');
            const h3 = document.createElement('h3');
            h3.className = 'font-bold text-lg mb-1 text-black dark:text-cyber-green';
            h3.textContent = project.title || 'Project';

            const desc = document.createElement('p');
            desc.className = 'text-sm text-gray-700 dark:text-gray-300';
            desc.textContent = project.description || '';

            copyWrap.appendChild(h3);
            copyWrap.appendChild(desc);
            header.appendChild(iconWrap);
            header.appendChild(copyWrap);

            const pills = document.createElement('div');
            pills.className = 'mt-4 flex flex-wrap gap-2';
            pills.setAttribute('aria-label', 'Technologies used');
            const pillList = project.pillTech && project.pillTech.length ? project.pillTech : (project.tech || []).slice(0, 3);
            pillList.forEach(name => {
                const span = document.createElement('span');
                span.className = 'tech-pill';
                span.textContent = name;
                pills.appendChild(span);
            });

            const actions = document.createElement('div');
            actions.className = 'project-actions mt-4';

            const repoLink = document.createElement('a');
            repoLink.className = 'project-btn project-btn--ghost';
            repoLink.href = project.link || '#';
            repoLink.target = '_blank';
            repoLink.rel = 'noopener noreferrer';
            repoLink.innerHTML = '<i class="fas fa-external-link-alt text-xs" aria-hidden="true"></i><span>Repo</span>';

            const quickViewBtn = document.createElement('button');
            quickViewBtn.className = 'project-btn project-btn--solid quick-view';
            quickViewBtn.type = 'button';
            quickViewBtn.setAttribute('aria-haspopup', 'dialog');
            quickViewBtn.innerHTML = '<i class="fas fa-eye text-xs" aria-hidden="true"></i><span>Quick View</span>';
            quickViewBtn.addEventListener('click', () => {
                if (window.openModalFromCard) {
                    window.openModalFromCard(article);
                }
            });

            actions.appendChild(repoLink);
            actions.appendChild(quickViewBtn);

            article.appendChild(header);
            article.appendChild(pills);
            article.appendChild(actions);
            return article;
        };

        const hydrateProjects = (projects) => {
            if (!Array.isArray(projects) || !projects.length) {
                throw new Error('No projects data to render');
            }
            const fragment = document.createDocumentFragment();
            projects.forEach(project => fragment.appendChild(createProjectCard(project)));
            grid.appendChild(fragment);
            cards = Array.from(grid.querySelectorAll('.project-card'));
            originalOrder = cards.slice();
            grid.setAttribute('aria-busy', 'false');
            projectLoading?.classList.add('hidden');
            applyProjectState();
        };

        const showProjectError = (message) => {
            grid.setAttribute('aria-busy', 'false');
            if (projectLoading) {
                projectLoading.textContent = message;
                projectLoading.classList.remove('hidden');
            }
            if (countEl) countEl.textContent = 'Showing 0 projects';
            if (emptyEl) {
                emptyEl.classList.remove('hidden');
                emptyEl.setAttribute('aria-hidden', 'false');
            }
        };

        const fetchProjects = async () => {
            try {
                const response = await fetch('data/projects.json');
                if (!response.ok) throw new Error(`HTTP ${response.status}`);
                const projects = await response.json();
                hydrateProjects(projects);
            } catch (error) {
                console.error('Failed to load projects:', error);
                showProjectError('Unable to load projects right now. Please check GitHub for the latest work.');
            }
        };

        filterButtons.forEach(btn => btn.addEventListener('click', () => setFilter(btn)));
        projectSearchInput?.addEventListener('input', () => {
            searchTerm = projectSearchInput.value.trim().toLowerCase();
            applyProjectState();
        });
        sortSelect?.addEventListener('change', () => {
            sortMode = sortSelect.value;
            applyProjectState();
        });

        fetchProjects();
        console.log('✅ Projects module loaded');
    });
})();
