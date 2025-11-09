/**
 * Navigation module
 * Handles mobile drawer and active link highlighting
 */

(() => {
    'use strict';

    document.addEventListener('DOMContentLoaded', () => {
        // =====================================================================
        // === Mobile Drawer ===================================================
        // =====================================================================
        const sidebar = document.getElementById('sidebar');
        const menuButton = document.getElementById('menuButton');
        const menuIcon = document.getElementById('menuIcon');
        const overlay = document.getElementById('sidebarOverlay');

        if (!sidebar || !menuButton || !menuIcon || !overlay) return;

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

        // Keyboard navigation
        document.addEventListener('keydown', (e) => {
            if (e.key === 'Escape' && isOpen()) {
                e.preventDefault();
                closeSidebar();
            }
            if (e.key === 'Tab' && isOpen()) {
                const focusables = sidebar.querySelectorAll('a, button, [tabindex]:not([tabindex="-1"])');
                if (!focusables.length) return;
                const first = focusables[0];
                const last = focusables[focusables.length - 1];
                if (e.shiftKey && document.activeElement === first) {
                    e.preventDefault();
                    last.focus();
                } else if (!e.shiftKey && document.activeElement === last) {
                    e.preventDefault();
                    first.focus();
                }
            }
        });

        // Close on mobile when link is clicked
        sidebar.querySelectorAll('a').forEach(link => {
            link.addEventListener('click', () => {
                if (window.innerWidth < 768 && isOpen()) closeSidebar();
            });
        });

        // =====================================================================
        // === Active Link Highlighting ========================================
        // =====================================================================
        const sections = document.querySelectorAll('main section[id]');
        const navLinks = Array.from(document.querySelectorAll('#sidebar a[href^="#"]'));

        if (sections.length && navLinks.length) {
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
        }

        console.log('✅ Navigation module loaded');
    });
})();
