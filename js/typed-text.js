/**
 * TypedJS integration
 * Lazy-loaded typing animation with reduced motion support
 */

(() => {
    'use strict';

    document.addEventListener('DOMContentLoaded', () => {
        const typedTarget = document.getElementById('typed-text');
        const heroSection = document.getElementById('home');
        const TYPED_SRC = 'https://cdn.jsdelivr.net/npm/typed.js@2.0.12';

        if (!typedTarget) return;

        const prefersReduced = window.prefersReducedMotion ? window.prefersReducedMotion() : false;
        let typedInitialized = false;

        const startTyped = () => {
            if (!typedTarget || typeof Typed === 'undefined') return;

            new Typed('#typed-text', {
                strings: [
                    'DevOps Automation',
                    'DevSecOps Security',
                    'Cloud Reliability Engineering',
                    'CI/CD Pipelines',
                    'Infrastructure as Code',
                    'Kubernetes &amp; Containers',
                    'Security Observability',
                    'SIEM &amp; Incident Response',
                    'IAM &amp; RBAC Governance',
                ],
                typeSpeed: 50,
                backSpeed: 50,
                backDelay: 2000,
                loop: true
            });
        };

        const initTyped = () => {
            if (typedInitialized || !typedTarget) return;
            typedInitialized = true;

            if (typeof window.loadExternalScript !== 'function') {
                typedTarget.textContent = 'DevOps & DevSecOps';
                return;
            }

            window.loadExternalScript(TYPED_SRC)
                .then(startTyped)
                .catch(() => {
                    typedTarget.textContent = 'DevOps & DevSecOps';
                });
        };

        // Skip animation if user prefers reduced motion
        if (prefersReduced) {
            typedTarget.textContent = 'DevOps & DevSecOps';
            console.log('✅ TypedJS skipped (reduced motion)');
            return;
        }

        // Lazy load on scroll into view
        if (heroSection && 'IntersectionObserver' in window) {
            const typedObserver = new IntersectionObserver((entries, observer) => {
                if (entries.some(entry => entry.isIntersecting)) {
                    initTyped();
                    observer.disconnect();
                }
            }, { threshold: 0.35 });
            typedObserver.observe(heroSection);
        } else {
            initTyped();
        }

        console.log('✅ TypedJS module loaded');
    });
})();
