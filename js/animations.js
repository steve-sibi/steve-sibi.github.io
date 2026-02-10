/**
 * Animations module
 * Page load animations and miscellaneous UI enhancements
 */

(() => {
    'use strict';

    document.addEventListener('DOMContentLoaded', () => {
        // =====================================================================
        // === Page Load Animations ============================================
        // =====================================================================
        const fadeInSections = document.querySelectorAll('section');
        if (fadeInSections.length > 0 && 'IntersectionObserver' in window) {
            // Add fade-in class to all sections except hero
            fadeInSections.forEach(section => {
                if (section.id !== 'home') {
                    section.classList.add('fade-in-section');
                }
            });

            const fadeInObserver = new IntersectionObserver((entries) => {
                entries.forEach(entry => {
                    if (entry.isIntersecting) {
                        entry.target.classList.add('is-visible');
                        fadeInObserver.unobserve(entry.target);
                    }
                });
            }, {
                threshold: 0.1,
                rootMargin: '0px 0px -100px 0px'
            });

            fadeInSections.forEach(section => {
                if (section.classList.contains('fade-in-section')) {
                    fadeInObserver.observe(section);
                }
            });
        }

        // Add hero content animation class
        const heroContent = document.querySelector('#home .container');
        if (heroContent) {
            heroContent.classList.add('hero-content');
        }

        // =====================================================================
        // === Copy Email Helper ===============================================
        // =====================================================================
        const copyEmailBtn = document.getElementById('copyEmail');
        const copyEmailToast = document.getElementById('copyEmailToast');
        if (copyEmailBtn && copyEmailToast) {
            let toastTimer;
            copyEmailBtn.addEventListener('click', async () => {
                const email = copyEmailBtn.dataset.email || 'stevesibi326@gmail.com';
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

        console.log('✅ Animations module loaded');
    });
})();
