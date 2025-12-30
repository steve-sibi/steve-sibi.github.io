/**
 * Scroll Arrow module
 * Bidirectional scroll navigation with bottom detection
 */

(() => {
    'use strict';

    document.addEventListener('DOMContentLoaded', () => {
        const scrollArrow = document.getElementById('scroll-arrow');
        if (!scrollArrow) return;

        const getScrollBehavior = () => {
            if (!window.matchMedia) return 'smooth';
            return window.matchMedia('(prefers-reduced-motion: reduce)').matches ? 'auto' : 'smooth';
        };

        const icon = scrollArrow.querySelector('i');
        const scrollTargets = Array.from(document.querySelectorAll('section[id]'));
        const footer = document.querySelector('footer');
        if (footer) {
            scrollTargets.push(footer);
        }
        const lastTarget = scrollTargets[scrollTargets.length - 1];
        let isAtBottom = false;

        const setArrowDirection = (atBottom) => {
            if (atBottom === isAtBottom) return;
            isAtBottom = atBottom;

            if (isAtBottom) {
                scrollArrow.classList.add('at-bottom');
                scrollArrow.setAttribute('aria-label', 'Scroll to top');
                if (icon) {
                    icon.classList.remove('fa-chevron-down');
                    icon.classList.add('fa-chevron-up');
                }
            } else {
                scrollArrow.classList.remove('at-bottom');
                scrollArrow.setAttribute('aria-label', 'Scroll to next section');
                if (icon) {
                    icon.classList.remove('fa-chevron-up');
                    icon.classList.add('fa-chevron-down');
                }
            }
        };

        const showOrHideArrow = () => {
            const scrollTop = window.pageYOffset || document.documentElement.scrollTop;
            const windowHeight = window.innerHeight;
            const documentHeight = document.documentElement.scrollHeight;
            const distanceFromBottom = documentHeight - (scrollTop + windowHeight);

            if (scrollTop > 300) {
                scrollArrow.classList.add('visible');
            } else {
                scrollArrow.classList.remove('visible');
            }

            // Force upwards state when extremely close to bottom
            if (distanceFromBottom < 60) {
                setArrowDirection(true);
            } else if (!observerAttached) {
                setArrowDirection(false);
            }
        };

        let observerAttached = false;

        // Use IntersectionObserver for reliable bottom detection
        if (lastTarget && 'IntersectionObserver' in window) {
            const observer = new IntersectionObserver((entries) => {
                entries.forEach(entry => {
                    if (entry.target === lastTarget) {
                        const scrollTop = window.pageYOffset || document.documentElement.scrollTop;
                        const windowHeight = window.innerHeight;
                        const documentHeight = document.documentElement.scrollHeight;
                        const reachedActualBottom = scrollTop + windowHeight >= documentHeight - 2;
                        const mostlyVisible = entry.intersectionRatio >= 0.1;
                        setArrowDirection(mostlyVisible || reachedActualBottom);
                    }
                });
            }, { threshold: [0, 0.1, 0.4, 1] });

            observer.observe(lastTarget);
            observerAttached = true;
        } else {
            // Fallback: check via scroll position
            const updateByScroll = () => {
                const scrollTop = window.pageYOffset || document.documentElement.scrollTop;
                const windowHeight = window.innerHeight;
                const documentHeight = document.documentElement.scrollHeight;
                const distanceFromBottom = documentHeight - (scrollTop + windowHeight);
                setArrowDirection(distanceFromBottom < 120);
            };

            window.addEventListener('scroll', updateByScroll, { passive: true });
            updateByScroll();
        }

        scrollArrow.addEventListener('click', () => {
            const behavior = getScrollBehavior();

            if (isAtBottom) {
                window.scrollTo({ top: 0, behavior });
                return;
            }

            const currentScroll = window.pageYOffset || document.documentElement.scrollTop;
            const offset = 120;

            let nextSection = null;
            for (const section of scrollTargets) {
                if (section.offsetTop > currentScroll + offset) {
                    nextSection = section;
                    break;
                }
            }

            if (nextSection) {
                nextSection.scrollIntoView({ behavior, block: 'start' });
            } else {
                window.scrollTo({ top: document.documentElement.scrollHeight, behavior });
            }
        });

        window.addEventListener('scroll', showOrHideArrow, { passive: true });
        showOrHideArrow();

        console.log('✅ Scroll arrow module loaded');
    });
})();
