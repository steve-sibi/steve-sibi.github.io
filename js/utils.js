/**
 * Utility functions and helpers
 * Shared across multiple modules
 */

(() => {
    'use strict';

    // Script loader cache
    const loadedScripts = new Map();

    /**
     * Dynamically load external JavaScript
     * @param {string} src - Script URL
     * @returns {Promise} - Resolves when script loads
     */
    window.loadExternalScript = (src) => {
        if (loadedScripts.has(src)) {
            return loadedScripts.get(src);
        }
        const promise = new Promise((resolve, reject) => {
            const script = document.createElement('script');
            script.src = src;
            script.async = true;
            script.onload = () => resolve();
            script.onerror = () => reject(new Error(`Failed to load script: ${src}`));
            document.head.appendChild(script);
        });
        loadedScripts.set(src, promise);
        return promise;
    };

    /**
     * Check if user prefers reduced motion
     * @returns {boolean}
     */
    window.prefersReducedMotion = () => {
        if (typeof window.matchMedia !== 'function') return false;
        return window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    };

    /**
     * Small modal controller for non-framework pages
     * @param {object} options
     * @returns {{open: Function, close: Function, isOpen: Function}|null}
     */
    window.createModalController = (options) => {
        const {
            modal,
            panel = null,
            closeSelectors = [],
            initialFocusSelector = null,
            closeOnBackdrop = false,
            onOpen = null,
            onClose = null,
        } = options || {};

        if (!modal) return null;

        const HIDDEN_CLASS = 'hidden';
        let returnFocus = null;

        const isOpen = () => !modal.classList.contains(HIDDEN_CLASS);

        const focusInitial = () => {
            if (!initialFocusSelector) return;
            const target = modal.querySelector(initialFocusSelector);
            if (!target || typeof target.focus !== 'function') return;
            requestAnimationFrame(() => {
                if (!isOpen()) return;
                target.focus({ preventScroll: true });
            });
        };

        const open = () => {
            if (isOpen()) return;
            returnFocus = document.activeElement;
            modal.classList.remove(HIDDEN_CLASS);
            document.body.style.overflow = 'hidden';
            if (typeof onOpen === 'function') onOpen();
            focusInitial();
        };

        const close = () => {
            if (!isOpen()) return;
            modal.classList.add(HIDDEN_CLASS);
            document.body.style.overflow = '';
            if (typeof onClose === 'function') onClose();
            if (returnFocus && typeof returnFocus.focus === 'function') {
                returnFocus.focus({ preventScroll: true });
            }
            returnFocus = null;
        };

        closeSelectors.forEach(selector => {
            modal.querySelectorAll(selector).forEach(node => {
                node.addEventListener('click', () => close());
            });
        });

        if (panel) {
            panel.addEventListener('click', (event) => {
                event.stopPropagation();
            });
        }

        if (closeOnBackdrop) {
            modal.addEventListener('click', (event) => {
                if (event.target === modal) {
                    close();
                }
            });
        }

        document.addEventListener('keydown', (event) => {
            if (event.key === 'Escape' && isOpen()) {
                event.preventDefault();
                close();
            }
        });

        return { open, close, isOpen };
    };

    console.log('✅ Utils module loaded');
})();
