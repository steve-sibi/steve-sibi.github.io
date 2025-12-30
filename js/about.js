/**
 * About section enhancements
 * - Keeps the technical snapshot terminal visible on desktop
 * - Collapses it behind a <details> disclosure on smaller screens
 */

(() => {
    'use strict';

    const DESKTOP_QUERY = '(min-width: 1024px)';

    const syncTerminalDetails = (details, isDesktop) => {
        if (!details) return;
        details.open = Boolean(isDesktop);
    };

    document.addEventListener('DOMContentLoaded', () => {
        const details = document.querySelector('.about-terminal-details');
        if (!details) return;

        const media = window.matchMedia(DESKTOP_QUERY);
        syncTerminalDetails(details, media.matches);

        const handleChange = (event) => syncTerminalDetails(details, event.matches);

        if (typeof media.addEventListener === 'function') {
            media.addEventListener('change', handleChange);
        } else if (typeof media.addListener === 'function') {
            media.addListener(handleChange);
        }
    });
})();

