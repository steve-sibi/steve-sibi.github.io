/**
 * Skills Matrix module
 * Dynamic skills table with filtering and skeleton loading
 */

(() => {
    'use strict';

    document.addEventListener('DOMContentLoaded', async () => {
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
            
            // Still show the table even if empty
            const skeleton = document.getElementById('skills-table-skeleton');
            if (skeleton) skeleton.classList.add('loaded');
            if (table) table.style.display = 'table';
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
                .sort((a, b) => (b.level || 0) - (a.level || 0) || (a.name || '').localeCompare(b.name || ''));
            if (!group.length) return;
            group.forEach(renderSkill);
        });

        const remaining = skills.filter(skill => !categorySet.has(skill.cat));
        if (remaining.length) {
            remaining.sort((a, b) => (b.level || 0) - (a.level || 0) || (a.name || '').localeCompare(b.name || ''))
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
        
        // Hide skeleton and show table
        const skeleton = document.getElementById('skills-table-skeleton');
        if (skeleton) skeleton.classList.add('loaded');
        if (table) table.style.display = 'table';

        console.log('✅ Skills module loaded');
    });
})();
