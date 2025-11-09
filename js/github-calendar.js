/**
 * GitHub Calendar integration
 * Lazy-loaded contribution heatmap with skeleton loading
 */

(() => {
    'use strict';

    document.addEventListener('DOMContentLoaded', () => {
        const GITHUB_CAL_SRC = 'https://unpkg.com/github-calendar@latest/dist/github-calendar.min.js';
        let githubCalendarInitialized = false;
        let calendarObserver = null;

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

        const attachCalendarObserver = () => {
            if (calendarObserver) return;
            const target = document.getElementById('github-calendar');
            if (!target) return;

            calendarObserver = new MutationObserver(() => {
                if (pruneCalendar()) {
                    calendarObserver.disconnect();
                    calendarObserver = null;
                }
            });
            calendarObserver.observe(target, { childList: true, subtree: true });
        };

        const initGitHubCalendar = () => {
            if (githubCalendarInitialized) return;
            githubCalendarInitialized = true;
            attachCalendarObserver();

            const renderCalendar = () => {
                try {
                    const result = GitHubCalendar('#github-calendar', 'steve-sibi', {
                        responsive: true,
                        summary: false
                    });

                    if (result && typeof result.then === 'function') {
                        result.then(() => {
                            pruneCalendar();
                            hideSkeletonShowCalendar();
                        }).catch(() => {
                            hideSkeletonShowCalendar();
                        });
                    }
                } catch (err) {
                    console.error('GitHubCalendar failed', err);
                    hideSkeletonShowCalendar();
                }

                setTimeout(() => {
                    pruneCalendar();
                    hideSkeletonShowCalendar();
                }, 2500);
            };

            const hideSkeletonShowCalendar = () => {
                const skeleton = document.getElementById('github-calendar-skeleton');
                const calendar = document.getElementById('github-calendar');
                if (skeleton) skeleton.classList.add('loaded');
                if (calendar) calendar.style.display = 'block';
            };

            const loader = window.loadExternalScript || ((src) => {
                return new Promise((resolve, reject) => {
                    const script = document.createElement('script');
                    script.src = src;
                    script.async = true;
                    script.onload = resolve;
                    script.onerror = reject;
                    document.head.appendChild(script);
                });
            });

            if (typeof GitHubCalendar !== 'undefined') {
                renderCalendar();
            } else {
                loader(GITHUB_CAL_SRC)
                    .then(() => renderCalendar())
                    .catch(err => {
                        console.error('GitHubCalendar script failed to load', err);
                        hideSkeletonShowCalendar();
                    });
            }
        };

        const githubActivitySection = document.getElementById('github-activity');
        if (githubActivitySection) {
            if ('IntersectionObserver' in window) {
                const sectionObserver = new IntersectionObserver((entries, observer) => {
                    if (entries.some(entry => entry.isIntersecting)) {
                        initGitHubCalendar();
                        observer.disconnect();
                    }
                }, { rootMargin: '0px 0px -20% 0px' });
                sectionObserver.observe(githubActivitySection);
            } else {
                initGitHubCalendar();
            }
        }

        console.log('✅ GitHub Calendar module loaded');
    });
})();
