/**
 * Custom GitHub contribution calendar
 * - Fetches JSON data from github-contributions-api.jogruber.de
 * - Renders a GitHub-like grid with accessible labels + legend
 */

(() => {
    'use strict';

    const USERNAME = 'steve-sibi';
    const API_BASE = 'https://github-contributions-api.jogruber.de/v4/';
    const WEEKDAY_LABELS = ['', 'Mon', '', 'Wed', '', 'Fri', ''];
    const MONTH_FORMAT = new Intl.DateTimeFormat('en-US', { month: 'short' });
    const DAY_FORMAT = new Intl.DateTimeFormat('en-US', { month: 'long', day: 'numeric', year: 'numeric' });

    document.addEventListener('DOMContentLoaded', () => {
        const section = document.getElementById('github-activity');
        if (!section) return;

        const startLoading = () => {
            if (section.dataset.calendarLoaded) return;
            section.dataset.calendarLoaded = 'true';
            loadCalendar();
        };

        if ('IntersectionObserver' in window) {
            const observer = new IntersectionObserver((entries, obs) => {
                if (entries.some(entry => entry.isIntersecting)) {
                    startLoading();
                    obs.disconnect();
                }
            }, { rootMargin: '0px 0px -20% 0px' });
            observer.observe(section);
        } else {
            startLoading();
        }
    });

    async function loadCalendar() {
        const container = document.getElementById('github-calendar');
        if (!container) return;

        toggleSkeleton(true);

        try {
            const contributions = await fetchContributionData();
            const calendarData = buildCalendar(contributions);
            renderCalendar(container, calendarData);
            updateContributionSummary(calendarData.totalContributions);
        } catch (error) {
            console.error('GitHub calendar failed', error);
            showCalendarError(container);
        } finally {
            toggleSkeleton(false);
        }
    }

    function toggleSkeleton(isLoading) {
        const skeleton = document.getElementById('github-calendar-skeleton');
        if (!skeleton) return;
        skeleton.classList.toggle('loaded', !isLoading);
    }

    async function fetchContributionData() {
        const now = new Date();
        const currentYear = now.getUTCFullYear();
        const years = [currentYear - 1, currentYear];

        const results = await Promise.allSettled(years.map(fetchYear));
        const contributions = [];
        const errors = [];

        results.forEach((result) => {
            if (result.status === 'fulfilled') {
                contributions.push(...(result.value?.contributions ?? []));
            } else if (result.reason) {
                errors.push(result.reason.message || 'Unknown error');
            }
        });

        if (!contributions.length) {
            throw new Error(errors[0] || 'No contribution data available');
        }

        return contributions;
    }

    async function fetchYear(year) {
        const response = await fetch(`${API_BASE}${USERNAME}?y=${year}`, {
            headers: {
                'Accept': 'application/json'
            },
            cache: 'no-store',
            mode: 'cors'
        });

        if (!response.ok) {
            throw new Error(`GitHub contributions API returned ${response.status}`);
        }

        return response.json();
    }

    function buildCalendar(contributions) {
        const today = startOfDay(new Date());
        const rangeStart = startOfDay(addDays(today, -364));
        const calendarStart = alignToSunday(rangeStart);
        const calendarEnd = alignToSaturday(today);

        const contributionMap = new Map();
        contributions.forEach(entry => {
            contributionMap.set(entry.date, {
                count: entry.count,
                level: clampLevel(entry.level)
            });
        });

        const weeks = [];
        const monthLabels = [];
        const seenMonths = new Set();

        let cursor = new Date(calendarStart);
        let week = new Array(7).fill(null);
        let weekIndex = 0;

        while (cursor <= calendarEnd) {
            const isoDate = toISODate(cursor);
            const weekday = cursor.getUTCDay();
            const record = contributionMap.get(isoDate);
            const inRange = cursor >= rangeStart && cursor <= today;

            week[weekday] = {
                date: isoDate,
                dateObj: new Date(cursor),
                level: record ? record.level : 0,
                count: record ? record.count : 0,
                inRange,
                isFuture: cursor > today
            };

            if (cursor.getUTCDate() === 1) {
                const monthKey = `${cursor.getUTCFullYear()}-${cursor.getUTCMonth()}`;
                if (!seenMonths.has(monthKey)) {
                    monthLabels.push({
                        label: MONTH_FORMAT.format(cursor),
                        column: weekIndex
                    });
                    seenMonths.add(monthKey);
                }
            }

            if (weekday === 6) {
                weeks.push(week);
                week = new Array(7).fill(null);
                weekIndex++;
            }

            cursor = addDays(cursor, 1);
        }

        const totalContributions = contributions.reduce((sum, entry) => {
            const entryDate = new Date(`${entry.date}T00:00:00Z`);
            if (entryDate >= rangeStart && entryDate <= today) {
                return sum + entry.count;
            }
            return sum;
        }, 0);

        return {
            weeks,
            monthLabels,
            totalContributions
        };
    }

    function renderCalendar(root, data) {
        root.innerHTML = '';

        const canvas = document.createElement('div');
        canvas.className = 'github-calendar__canvas';

        const calendar = document.createElement('div');
        calendar.className = 'gh-calendar';
        const tooltip = createTooltip();

        calendar.appendChild(renderMonthsRow(data.monthLabels, data.weeks.length));
        calendar.appendChild(renderCalendarGrid(data.weeks, tooltip));
        calendar.appendChild(renderLegend());

        canvas.appendChild(calendar);
        canvas.appendChild(tooltip);
        root.appendChild(canvas);
    }

    function renderMonthsRow(labels, weeksCount) {
        const row = document.createElement('div');
        row.className = 'gh-calendar__months';
        row.style.setProperty('--weeks', weeksCount);

        labels.forEach(({ label, column }) => {
            const span = document.createElement('span');
            span.textContent = label;
            span.style.setProperty('--column', column + 1);
            row.appendChild(span);
        });

        return row;
    }

    function renderCalendarGrid(weeks, tooltip) {
        const layout = document.createElement('div');
        layout.className = 'gh-calendar__layout';

        const weekdays = document.createElement('div');
        weekdays.className = 'gh-calendar__weekdays';
        WEEKDAY_LABELS.forEach(label => {
            const span = document.createElement('span');
            span.textContent = label;
            weekdays.appendChild(span);
        });

        const grid = document.createElement('div');
        grid.className = 'gh-calendar__grid';
        grid.setAttribute('role', 'grid');
        grid.setAttribute('aria-readonly', 'true');
        grid.setAttribute('aria-label', `GitHub contributions for ${USERNAME}`);

        weeks.forEach(week => {
            week.forEach(cellData => {
                const cell = document.createElement('button');
                cell.type = 'button';
                cell.className = 'gh-calendar__day';

                if (!cellData || !cellData.inRange || cellData.isFuture) {
                    cell.classList.add('is-empty', 'level-0');
                    cell.tabIndex = -1;
                } else {
                    cell.classList.add(`level-${cellData.level}`);
                    const label = formatCellLabel(cellData.count, cellData.dateObj);
                    cell.setAttribute('aria-label', label);
                    cell.title = label;
                    cell.dataset.date = cellData.date;
                    cell.dataset.count = String(cellData.count);
                    attachTooltipHandlers(cell, cellData, tooltip);
                }

                grid.appendChild(cell);
            });
        });

        layout.appendChild(weekdays);
        layout.appendChild(grid);
        return layout;
    }

    function renderLegend() {
        const legend = document.createElement('div');
        legend.className = 'gh-calendar__legend';

        const less = document.createElement('span');
        less.textContent = 'Less';
        legend.appendChild(less);

        for (let level = 0; level <= 4; level++) {
            const swatch = document.createElement('span');
            swatch.className = `gh-calendar__legend-swatch level-${level}`;
            legend.appendChild(swatch);
        }

        const more = document.createElement('span');
        more.textContent = 'More';
        legend.appendChild(more);

        return legend;
    }

    function updateContributionSummary(total) {
        if (typeof total !== 'number' || Number.isNaN(total)) return;
        const card = document.getElementById('github-contribution-card');
        const valueEl = document.getElementById('github-contribution-count');
        if (!card || !valueEl) return;

        valueEl.textContent = new Intl.NumberFormat('en-US').format(total);
        card.classList.remove('is-placeholder');
        card.setAttribute('data-contributions', String(total));
    }

    function showCalendarError(root) {
        root.innerHTML = '';
        const error = document.createElement('div');
        error.className = 'github-calendar__error';
        error.innerHTML = `
            <p class="font-semibold mb-2">Unable to load GitHub contributions.</p>
            <p class="text-sm opacity-80">Please refresh the page or try again later.</p>
        `;
        root.appendChild(error);
    }

    function clampLevel(value) {
        if (Number.isNaN(value) || value < 0) return 0;
        if (value > 4) return 4;
        return value;
    }

    function startOfDay(date) {
        const copy = new Date(date);
        copy.setUTCHours(0, 0, 0, 0);
        return copy;
    }

    function addDays(date, amount) {
        const copy = new Date(date);
        copy.setUTCDate(copy.getUTCDate() + amount);
        return copy;
    }

    function alignToSunday(date) {
        const copy = new Date(date);
        copy.setUTCDate(copy.getUTCDate() - copy.getUTCDay());
        return startOfDay(copy);
    }

    function alignToSaturday(date) {
        const copy = new Date(date);
        copy.setUTCDate(copy.getUTCDate() + (6 - copy.getUTCDay()));
        return startOfDay(copy);
    }

    function toISODate(date) {
        return date.toISOString().slice(0, 10);
    }

    function formatCellLabel(count, date) {
        const contributionText = count === 0 ? 'No contributions' : `${count} contribution${count === 1 ? '' : 's'}`;
        return `${contributionText} on ${DAY_FORMAT.format(date)}.`;
    }

    function createTooltip() {
        const tooltip = document.createElement('div');
        tooltip.className = 'gh-calendar__tooltip';
        tooltip.setAttribute('aria-hidden', 'true');
        return tooltip;
    }

    function attachTooltipHandlers(cell, data, tooltip) {
        if (!tooltip || !data) return;
        const show = () => showTooltip(tooltip, cell, data);
        const hide = () => hideTooltip(tooltip);
        cell.addEventListener('mouseenter', show);
        cell.addEventListener('focus', show);
        cell.addEventListener('mouseleave', hide);
        cell.addEventListener('blur', hide);
    }

    function showTooltip(tooltip, trigger, data) {
        if (!tooltip || !trigger || !data) return;
        tooltip.textContent = formatTooltipContent(data.count, data.dateObj);
        const hostRect = tooltip.parentElement.getBoundingClientRect();
        const triggerRect = trigger.getBoundingClientRect();
        const left = triggerRect.left - hostRect.left + (triggerRect.width / 2);
        const top = triggerRect.top - hostRect.top;
        tooltip.style.left = `${left}px`;
        tooltip.style.top = `${top}px`;
        tooltip.classList.add('is-visible');
        tooltip.setAttribute('aria-hidden', 'false');
    }

    function hideTooltip(tooltip) {
        if (!tooltip) return;
        tooltip.classList.remove('is-visible');
        tooltip.setAttribute('aria-hidden', 'true');
    }

    function formatTooltipContent(count, date) {
        const contributionText = count === 0 ? 'No contributions' : `${count} contribution${count === 1 ? '' : 's'}`;
        return `${contributionText} • ${DAY_FORMAT.format(date)}`;
    }
})();
