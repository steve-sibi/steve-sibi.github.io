/**
 * Custom GitHub contribution calendar
 * - Fetches JSON data from github-contributions-api.jogruber.de
 * - Renders a GitHub-like grid with accessible labels + legend
 */

(() => {
    'use strict';

    const USERNAME = 'steve-sibi';
    const API_BASE = 'https://github-contributions-api.jogruber.de/v4/';
    const STORAGE_KEY = `github-calendar:${USERNAME}:v1`;
    const STORAGE_TTL_MS = 6 * 60 * 60 * 1000; // 6 hours
    const WEEKDAY_LABELS = ['', 'Mon', '', 'Wed', '', 'Fri', ''];
    const MONTH_FORMAT = new Intl.DateTimeFormat('en-US', { month: 'short', timeZone: 'UTC' });
    const DAY_FORMAT = new Intl.DateTimeFormat('en-US', {
        month: 'long',
        day: 'numeric',
        year: 'numeric',
        timeZone: 'UTC'
    });
    const NUMBER_FORMAT = new Intl.NumberFormat('en-US');
    let activeTooltipTrigger = null;

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

    function readContributionCache({ allowExpired = false } = {}) {
        try {
            const raw = localStorage.getItem(STORAGE_KEY);
            if (!raw) return null;
            const parsed = JSON.parse(raw);
            const timestamp = typeof parsed?.ts === 'number' ? parsed.ts : null;
            const data = Array.isArray(parsed?.data) ? parsed.data : null;

            if (!timestamp || !data) return null;

            const age = Date.now() - timestamp;
            const isExpired = !Number.isFinite(age) || age > STORAGE_TTL_MS;
            if (isExpired && !allowExpired) return null;

            return data;
        } catch {
            return null;
        }
    }

    function writeContributionCache(contributions) {
        if (!Array.isArray(contributions) || contributions.length === 0) return;
        try {
            localStorage.setItem(STORAGE_KEY, JSON.stringify({
                ts: Date.now(),
                data: contributions
            }));
        } catch {
            // Ignore caching failures (private mode, quota exceeded, etc.)
        }
    }

    async function fetchContributionData() {
        const cached = readContributionCache();
        if (cached) return cached;

        const stale = readContributionCache({ allowExpired: true });
        const now = new Date();
        const currentYear = now.getUTCFullYear();
        const years = [currentYear - 1, currentYear];

        try {
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

            writeContributionCache(contributions);
            return contributions;
        } catch (error) {
            if (stale) return stale;
            throw error;
        }
    }

    async function fetchYear(year) {
        const response = await fetch(`${API_BASE}${USERNAME}?y=${year}`, {
            headers: {
                'Accept': 'application/json'
            },
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
            const dateObj = parseISODateUTC(entry.date);
            const iso = toISODate(dateObj);
            const level = clampLevel(entry.level);
            if (contributionMap.has(iso)) {
                const existing = contributionMap.get(iso);
                existing.count += entry.count;
                existing.level = Math.max(existing.level, level);
            } else {
                contributionMap.set(iso, {
                    count: entry.count,
                    level
                });
            }
        });

        const weeks = [];
        const monthLabels = [];

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

            if (weekday === 6) {
                weeks.push(week);
                week = new Array(7).fill(null);
                weekIndex++;
            }

            cursor = addDays(cursor, 1);
        }

        // Handle last partial week if any
        if (week.some(day => day !== null)) {
            weeks.push(week);
        }

        // Now calculate month labels based on completed weeks
        const seenMonths = new Set();
        weeks.forEach((week, index) => {
            week.forEach(day => {
                if (!day || !day.dateObj || !day.inRange) return;

                const monthKey = `${day.dateObj.getUTCFullYear()}-${day.dateObj.getUTCMonth()}`;
                if (seenMonths.has(monthKey)) return;

                const monthDate = new Date(Date.UTC(
                    day.dateObj.getUTCFullYear(),
                    day.dateObj.getUTCMonth(),
                    1
                ));
                monthLabels.push({
                    label: MONTH_FORMAT.format(monthDate),
                    column: index,
                    month: day.dateObj.getUTCMonth(),
                    year: day.dateObj.getUTCFullYear()
                });
                seenMonths.add(monthKey);
            });
        });

        // Sort month labels by year and month to ensure they're in order
        monthLabels.sort((a, b) => {
            if (a.year !== b.year) return a.year - b.year;
            return a.month - b.month;
        });

        const totalContributions = contributions.reduce((sum, entry) => {
            const entryDate = parseISODateUTC(entry.date);
            if (entryDate >= rangeStart && entryDate <= today) {
                return sum + entry.count;
            }
            return sum;
        }, 0);

        const labelsWithSpan = monthLabels.map((month, index) => {
            const nextColumn = monthLabels[index + 1]?.column ?? weeks.length;
            const span = Math.max(1, nextColumn - month.column);
            return {
                ...month,
                span
            };
        });

        return {
            weeks,
            monthLabels: labelsWithSpan,
            totalContributions
        };
    }

    function renderCalendar(root, data) {
        root.innerHTML = '';

        const canvas = document.createElement('div');
        canvas.className = 'github-calendar__canvas';

        const tooltip = createTooltip();
        const calendar = document.createElement('div');
        calendar.className = 'gh-calendar';

        const viewport = document.createElement('div');
        viewport.className = 'gh-calendar__viewport';

        const content = document.createElement('div');
        content.className = 'gh-calendar__content';
        content.style.setProperty('--weeks', data.weeks.length);
        content.appendChild(renderMonthsRow(data.monthLabels, data.weeks.length));
        content.appendChild(renderCalendarGrid(data.weeks, tooltip));

        viewport.appendChild(content);
        calendar.appendChild(viewport);
        calendar.appendChild(renderLegend());

        canvas.appendChild(calendar);
        canvas.appendChild(tooltip);
        root.appendChild(canvas);

        alignMonthLabels(canvas);
        scaleCalendarCells(canvas);
    }

    function renderMonthsRow(labels, weeksCount) {
        const row = document.createElement('div');
        row.className = 'gh-calendar__months';
        row.style.setProperty('--weeks', weeksCount);

        labels.forEach(({ label, column, span }) => {
            if (column < 0 || column >= weeksCount) return;
            const spanEl = document.createElement('span');
            spanEl.textContent = label.toUpperCase();
            spanEl.style.setProperty('--column', String(column + 1));
            if (typeof span === 'number' && span > 0) {
                spanEl.style.setProperty('--span', String(span));
            }
            row.appendChild(spanEl);
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

    function alignMonthLabels(container) {
        const monthsRow = container.querySelector('.gh-calendar__months');
        const content = container.querySelector('.gh-calendar__content');
        const grid = container.querySelector('.gh-calendar__grid');

        if (!monthsRow || !content || !grid) return;

        const updateOffset = () => {
            if (![monthsRow, content, grid].every(el => el.isConnected)) return;
            const contentRect = content.getBoundingClientRect();
            const gridRect = grid.getBoundingClientRect();
            const offset = Math.max(0, gridRect.left - contentRect.left);
            monthsRow.style.setProperty('--weekday-offset', `${offset}px`);
        };

        updateOffset();

        if ('ResizeObserver' in window) {
            const observer = new ResizeObserver(() => {
                if (![monthsRow, content, grid].every(el => el.isConnected)) {
                    observer.disconnect();
                    return;
                }
                updateOffset();
            });
            observer.observe(content);
            observer.observe(grid);
        }
    }

    function scaleCalendarCells(container) {
        const viewport = container.querySelector('.gh-calendar__viewport');
        const content = container.querySelector('.gh-calendar__content');
        const layout = container.querySelector('.gh-calendar__layout');
        const weekdays = container.querySelector('.gh-calendar__weekdays');
        const grid = container.querySelector('.gh-calendar__grid');

        if (!viewport || !content || !layout || !weekdays || !grid) return;

        const clamp = (value, min, max) => Math.min(Math.max(value, min), max);
        const MIN_DAY_SIZE = 10;
        const MAX_DAY_SIZE = 28;

        const updateSize = () => {
            if (![viewport, content, layout, weekdays, grid].every(el => el.isConnected)) return;
            const viewportWidth = viewport.clientWidth;
            const weekdayWidth = weekdays.getBoundingClientRect().width;
            const layoutGap = parseFloat(getComputedStyle(layout).getPropertyValue('column-gap')) || 12;
            const gridStyles = getComputedStyle(grid);
            const gap = parseFloat(gridStyles.getPropertyValue('column-gap')) || 3;
            const weeksValue = content.style.getPropertyValue('--weeks') || getComputedStyle(content).getPropertyValue('--weeks');
            const weeks = Number((weeksValue || '').trim()) || 53;

            const maxGridWidth = viewportWidth - weekdayWidth - layoutGap;
            const spacing = gap * Math.max(0, weeks - 1);
            const rawSize = (maxGridWidth - spacing) / weeks;
            const daySize = clamp(rawSize, MIN_DAY_SIZE, MAX_DAY_SIZE);
            const finalSize = Number.isFinite(daySize) && daySize > 0 ? daySize : MIN_DAY_SIZE;

            content.style.setProperty('--calendar-day-size', `${finalSize}px`);
        };

        updateSize();

        if ('ResizeObserver' in window) {
            const observer = new ResizeObserver(() => {
                if (![viewport, content, layout, weekdays, grid].every(el => el.isConnected)) {
                    observer.disconnect();
                    return;
                }
                updateSize();
            });
            observer.observe(viewport);
        } else {
            window.addEventListener('resize', updateSize);
        }
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

        valueEl.textContent = NUMBER_FORMAT.format(total);
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

    function parseISODateUTC(dateString) {
        const [year, month, day] = dateString.split('-').map(Number);
        return new Date(Date.UTC(year, month - 1, day));
    }

    function formatCellLabel(count, date) {
        const contributionText = count === 0 ? 'No contributions' : `${count} contribution${count === 1 ? '' : 's'}`;
        return `${contributionText} on ${DAY_FORMAT.format(date)}.`;
    }

    function createTooltip() {
        const tooltip = document.createElement('div');
        tooltip.className = 'gh-calendar__tooltip';
        tooltip.setAttribute('aria-hidden', 'true');
        const handleTooltipTap = event => {
            event.preventDefault();
            event.stopPropagation();
            hideTooltip(tooltip, { blurTrigger: true });
        };
        if (window.PointerEvent) {
            tooltip.addEventListener('pointerdown', handleTooltipTap);
        } else {
            tooltip.addEventListener('touchstart', handleTooltipTap, { passive: false });
        }
        tooltip.addEventListener('click', handleTooltipTap);
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
        const handlePointerToggle = event => {
            const pointer = event.pointerType;
            const isTouchLike = pointer === 'touch' || pointer === 'pen' || (!pointer && /^touch/i.test(event.type));
            if (!isTouchLike) return;
            event.preventDefault();
            event.stopPropagation();
            toggleTooltipForCell(cell, data, tooltip, { blurOnHide: true });
        };
        if (window.PointerEvent) {
            cell.addEventListener('pointerup', handlePointerToggle);
        } else {
            cell.addEventListener('touchend', handlePointerToggle, { passive: false });
        }
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
        activeTooltipTrigger = trigger;
    }

    function hideTooltip(tooltip, options = {}) {
        if (!tooltip) return;
        const { blurTrigger = false } = options;
        const trigger = activeTooltipTrigger;
        tooltip.classList.remove('is-visible');
        tooltip.setAttribute('aria-hidden', 'true');
        if (blurTrigger && trigger && typeof trigger.blur === 'function') {
            trigger.blur();
        }
        activeTooltipTrigger = null;
    }

    function toggleTooltipForCell(cell, data, tooltip, options = {}) {
        if (!tooltip || !cell || !data) return false;
        const { blurOnHide = false } = options;
        const isActive = tooltip.classList.contains('is-visible') && activeTooltipTrigger === cell;
        if (isActive) {
            hideTooltip(tooltip, { blurTrigger: blurOnHide });
            return false;
        }
        showTooltip(tooltip, cell, data);
        return true;
    }

    function formatTooltipContent(count, date) {
        const contributionText = count === 0 ? 'No contributions' : `${count} contribution${count === 1 ? '' : 's'}`;
        return `${contributionText} • ${DAY_FORMAT.format(date)}`;
    }
})();
