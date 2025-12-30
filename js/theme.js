/**
 * Theme toggle (Dark/Light mode)
 * Manages theme persistence and icon updates
 */

(() => {
    'use strict';

    document.addEventListener('DOMContentLoaded', () => {
        const themeToggle = document.getElementById('themeToggle');
        if (!themeToggle) return;

        const supportsViewTransitions = typeof document.startViewTransition === 'function';
        const shouldReduceMotion = () => (window.prefersReducedMotion ? window.prefersReducedMotion() : false);

        function setThemeIcon() {
            const isDark = document.documentElement.classList.contains('dark');
            themeToggle.innerHTML = isDark ? '<i class="fas fa-sun"></i>' : '<i class="fas fa-moon"></i>';
            themeToggle.setAttribute('aria-pressed', String(isDark));
        }

        // Set initial icon
        setThemeIcon();

        function toggleThemeState() {
            document.documentElement.classList.toggle('dark');
            const isDark = document.documentElement.classList.contains('dark');

            // Persist to localStorage
            try {
                localStorage.setItem('theme', isDark ? 'dark' : 'light');
            } catch (_) {
                console.warn('Failed to save theme preference');
            }

            setThemeIcon();
        }

        function legacyFade() {
            if (typeof document.documentElement.animate !== 'function') return;
            document.documentElement.animate([
                { opacity: 0.9 },
                { opacity: 1 }
            ], {
                duration: 280,
                easing: 'ease-out'
            });
        }

        function handleThemeToggle() {
            const useViewTransition = supportsViewTransitions && !shouldReduceMotion();

            if (!useViewTransition) {
                toggleThemeState();
                if (!shouldReduceMotion()) {
                    legacyFade();
                }
                return;
            }

            themeToggle.disabled = true;

            try {
                document.startViewTransition(() => {
                    toggleThemeState();
                }).finished.catch(() => {
                    if (!shouldReduceMotion()) {
                        legacyFade();
                    }
                }).finally(() => {
                    themeToggle.disabled = false;
                });
            } catch (err) {
                console.warn('View transition failed, falling back.', err);
                toggleThemeState();
                if (!shouldReduceMotion()) {
                    legacyFade();
                }
                themeToggle.disabled = false;
            }
        }

        // Toggle theme on click
        themeToggle.addEventListener('click', handleThemeToggle);

        console.log('✅ Theme module loaded');
    });
})();
