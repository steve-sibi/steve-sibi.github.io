/**
 * Contact Form module
 * Handles form submission via Web3Forms
 */

(() => {
    'use strict';

    document.addEventListener('DOMContentLoaded', () => {
        const contactForm = document.getElementById('contactForm');
        if (!contactForm) return;

        const submitBtn = document.getElementById('contactSubmit');
        const submitText = document.getElementById('contactSubmitText');
        const submitIcon = document.getElementById('contactSubmitIcon');
        const successMsg = document.getElementById('contactSuccess');
        const errorMsg = document.getElementById('contactError');

        const hideMessage = (node) => {
            if (!node) return;
            node.classList.add('hidden');
            node.setAttribute('aria-hidden', 'true');
        };

        const showMessage = (node, { focus = false } = {}) => {
            if (!node) return;
            node.classList.remove('hidden');
            node.setAttribute('aria-hidden', 'false');
            if (focus) {
                requestAnimationFrame(() => {
                    node.focus({ preventScroll: true });
                });
            }
        };

        contactForm.addEventListener('submit', async (e) => {
            e.preventDefault();

            // Hide any previous messages
            hideMessage(successMsg);
            hideMessage(errorMsg);

            // Disable submit button
            if (submitBtn) {
                submitBtn.disabled = true;
                if (submitText) submitText.textContent = 'Sending...';
                if (submitIcon) {
                    submitIcon.classList.remove('fa-paper-plane');
                    submitIcon.classList.add('fa-spinner', 'fa-spin');
                }
            }

            try {
                const formData = new FormData(contactForm);
                const response = await fetch(contactForm.action, {
                    method: 'POST',
                    body: formData,
                    headers: {
                        'Accept': 'application/json'
                    }
                });

                if (response.ok) {
                    // Success
                    showMessage(successMsg, { focus: true });
                    contactForm.reset();

                    // Track with GA
                    if (typeof gtag === 'function') {
                        gtag('event', 'form_submission', {
                            event_category: 'Contact',
                            event_label: 'Contact Form'
                        });
                    }
                } else {
                    throw new Error('Form submission failed');
                }
            } catch (error) {
                // Error
                showMessage(errorMsg, { focus: true });
                console.error('Contact form error:', error);
            } finally {
                // Re-enable submit button
                if (submitBtn) {
                    submitBtn.disabled = false;
                    if (submitText) submitText.textContent = 'Send Message';
                    if (submitIcon) {
                        submitIcon.classList.remove('fa-spinner', 'fa-spin');
                        submitIcon.classList.add('fa-paper-plane');
                    }
                }
            }
        });

        console.log('✅ Contact form module loaded');
    });
})();
