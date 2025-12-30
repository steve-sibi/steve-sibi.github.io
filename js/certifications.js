/**
 * Certifications Interactive Effects
 * Adds dynamic particle effects and enhanced interactions
 */

(() => {
    'use strict';

    document.addEventListener('DOMContentLoaded', () => {
        initCertificationEffects();
    });

    function initCertificationEffects() {
        const certCards = document.querySelectorAll('.cert-card-container');
        const prefersReducedMotion = window.prefersReducedMotion ? window.prefersReducedMotion() : false;
        let activeCard = null;

        if (certCards.length === 0) return;

        certCards.forEach((container, index) => {
            // Add staggered entrance animation only once (skipped for reduced motion)
            if (!prefersReducedMotion) {
                container.style.opacity = '0';
                container.style.transform = 'translateY(30px)';

                setTimeout(() => {
                    container.style.transition = 'opacity 0.6s ease, transform 0.6s ease';
                    container.style.opacity = '1';
                    container.style.transform = 'translateY(0)';

                    // Remove inline styles after animation completes to prevent interference
                    setTimeout(() => {
                        container.style.transition = '';
                        container.style.transform = '';
                    }, 600);
                }, 100 * index);
            }

            // Enhanced particle system
            const particleContainer = container.querySelector('.cert-particles');
            if (particleContainer) {
                createParticles(particleContainer, prefersReducedMotion);
            }

            // Add click handler for mobile/touch devices
            const card = container.querySelector('.cert-card');
            if (card) {
                card.setAttribute('tabindex', '0');
                card.setAttribute('role', 'button');
                card.setAttribute('aria-pressed', 'false');

                const setFlippedState = (nextState) => {
                    // Close any other active card
                    if (nextState && activeCard && activeCard !== card) {
                        const otherContainer = activeCard.closest('.cert-card-container');
                        if (otherContainer) {
                            otherContainer.classList.remove('is-active');
                            activeCard.classList.remove('is-flipped');
                            activeCard.setAttribute('aria-pressed', 'false');
                        }
                    }

                    card.classList.toggle('is-flipped', nextState);
                    container.classList.toggle('is-active', nextState);
                    card.setAttribute('aria-pressed', nextState ? 'true' : 'false');
                    activeCard = nextState ? card : null;
                };

                container.addEventListener('click', (e) => {
                    // Don't flip if clicking on verify button
                    if (e.target.closest('.cert-verify-btn')) {
                        return;
                    }

                    setFlippedState(!card.classList.contains('is-flipped'));
                });

                card.addEventListener('keydown', (e) => {
                    if (e.key === 'Enter' || e.key === ' ') {
                        e.preventDefault();
                        setFlippedState(!card.classList.contains('is-flipped'));
                    }
                });
            }

            // Add subtle parallax effect on mouse move (disabled to prevent interference)
            // Keeping hover flip as the primary interaction
        });

        // Add intersection observer for scroll animations
        if ('IntersectionObserver' in window) {
            const observer = new IntersectionObserver((entries) => {
                entries.forEach(entry => {
                    if (entry.isIntersecting) {
                        entry.target.classList.add('cert-visible');
                        // Trigger particle burst
                        triggerParticleBurst(entry.target, prefersReducedMotion);
                        observer.unobserve(entry.target);
                    }
                });
            }, {
                threshold: 0.2,
                rootMargin: '0px 0px -50px 0px'
            });

            certCards.forEach(card => observer.observe(card));
        }

        setupParticlePauseControls(prefersReducedMotion);
    }

    function createParticles(container, prefersReducedMotion) {
        if (prefersReducedMotion) {
            container.querySelectorAll('.floating-particle').forEach(node => node.remove());
            return;
        }

        container.querySelectorAll('.floating-particle').forEach(node => node.remove());
        const fragment = document.createDocumentFragment();
        // Create multiple floating particles
        const particleCount = 8;

        for (let i = 0; i < particleCount; i++) {
            const particle = document.createElement('div');
            particle.className = 'floating-particle';

            // Random position
            const x = Math.random() * 100;
            const y = Math.random() * 100;
            const delay = Math.random() * 4;
            const duration = 3 + Math.random() * 2;

            particle.style.cssText = `
                position: absolute;
                width: 3px;
                height: 3px;
                background: rgba(0, 255, 159, 0.6);
                border-radius: 50%;
                left: ${x}%;
                top: ${y}%;
                animation: particleFloat ${duration}s ease-in-out infinite;
                animation-delay: ${delay}s;
                pointer-events: none;
            `;

            fragment.appendChild(particle);
        }

        container.appendChild(fragment);
    }

    function triggerParticleBurst(container, prefersReducedMotion) {
        if (prefersReducedMotion) return;

        const particleContainer = container.querySelector('.cert-particles');
        if (!particleContainer) return;

        // Create temporary burst particles
        const burstCount = 12;

        for (let i = 0; i < burstCount; i++) {
            const particle = document.createElement('div');
            particle.className = 'burst-particle';

            const angle = (360 / burstCount) * i;
            const distance = 50 + Math.random() * 30;

            particle.style.cssText = `
                position: absolute;
                width: 4px;
                height: 4px;
                background: rgba(0, 255, 159, 0.8);
                border-radius: 50%;
                left: 50%;
                top: 50%;
                transform: translate(-50%, -50%);
                pointer-events: none;
                animation: burstParticle 1s ease-out forwards;
                --angle: ${angle}deg;
                --distance: ${distance}px;
            `;

            particleContainer.appendChild(particle);

            // Remove after animation
            setTimeout(() => particle.remove(), 1000);
        }
    }

    function setupParticlePauseControls(prefersReducedMotion) {
        if (prefersReducedMotion) return;

        const particleContainers = document.querySelectorAll('.cert-particles');
        if (particleContainers.length === 0) return;

        let sectionInView = true;

        const setParticlesPaused = (paused) => {
            particleContainers.forEach(container => container.classList.toggle('is-paused', paused));
        };

        const certSection = document.getElementById('certifications');
        if (certSection && 'IntersectionObserver' in window) {
            const sectionObserver = new IntersectionObserver((entries) => {
                sectionInView = entries.some(entry => entry.isIntersecting);
                setParticlesPaused(!sectionInView || document.hidden);
            }, { threshold: 0.15 });

            sectionObserver.observe(certSection);
        }

        document.addEventListener('visibilitychange', () => {
            setParticlesPaused(document.hidden || !sectionInView);
        });

        // Initialize state
        setParticlesPaused(document.hidden || !sectionInView);
    }

    // Add dynamic CSS for burst animation
    const style = document.createElement('style');
    style.textContent = `
        @keyframes burstParticle {
            0% {
                transform: translate(-50%, -50%) rotate(var(--angle)) translateY(0) scale(1);
                opacity: 1;
            }
            100% {
                transform: translate(-50%, -50%) rotate(var(--angle)) translateY(calc(-1 * var(--distance))) scale(0);
                opacity: 0;
            }
        }
        
        .cert-visible {
            animation: certEntrance 0.6s ease-out forwards;
        }
        
        @keyframes certEntrance {
            from {
                opacity: 0;
                transform: translateY(30px) scale(0.95);
            }
            to {
                opacity: 1;
                transform: translateY(0) scale(1);
            }
        }
    `;
    document.head.appendChild(style);
})();
