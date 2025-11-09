/**
 * Theme toggle (Dark/Light mode)
 * Manages theme persistence and icon updates
 */

(() => {
    'use strict';

    document.addEventListener('DOMContentLoaded', () => {
        const themeToggle = document.getElementById('themeToggle');
        if (!themeToggle) return;

        function setThemeIcon() {
            const isDark = document.documentElement.classList.contains('dark');
            themeToggle.innerHTML = isDark ? '<i class="fas fa-sun"></i>' : '<i class="fas fa-moon"></i>';
            themeToggle.setAttribute('aria-pressed', String(isDark));
        }

        // Set initial icon
        setThemeIcon();

        // Toggle theme on click
        themeToggle.addEventListener('click', () => {
            document.documentElement.classList.toggle('dark');
            const isDark = document.documentElement.classList.contains('dark');

            // Persist to localStorage
            try {
                localStorage.setItem('theme', isDark ? 'dark' : 'light');
            } catch (_) {
                console.warn('Failed to save theme preference');
            }

            setThemeIcon();
        });

        console.log('✅ Theme module loaded');
    });
})();
