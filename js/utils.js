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
     * Debounce function calls
     * @param {Function} func - Function to debounce
     * @param {number} wait - Delay in milliseconds
     * @returns {Function} - Debounced function
     */
    window.debounce = (func, wait) => {
        let timeout;
        return function executedFunction(...args) {
            const later = () => {
                clearTimeout(timeout);
                func(...args);
            };
            clearTimeout(timeout);
            timeout = setTimeout(later, wait);
        };
    };

    /**
     * Check if user prefers reduced motion
     * @returns {boolean}
     */
    window.prefersReducedMotion = () => {
        return window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    };

    console.log('✅ Utils module loaded');
})();
