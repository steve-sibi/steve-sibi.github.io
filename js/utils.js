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
        return window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    };

    console.log('✅ Utils module loaded');
})();
