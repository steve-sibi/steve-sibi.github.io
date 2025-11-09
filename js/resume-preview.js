/**
 * Resume Preview Modal
 * Handles opening a preview modal for the resume PDF with download option
 */

(function () {
    'use strict';

    const modal = document.getElementById('resumeModal');
    const modalPanel = modal ? modal.querySelector('[data-resume-modal-panel]') : null;
    const pdfViewer = document.getElementById('resumePdfViewer');
    const resumePath = 'assets/Resume_Steve_Sibi_Cyber.pdf';
    let modalReturnFocus = null;

    if (!modal || !pdfViewer || !modalPanel) return;

    /**
     * Open the resume preview modal
     */
    function openResumeModal() {
        modalReturnFocus = document.activeElement;

        // Set the PDF source
        pdfViewer.src = resumePath;

        // Show modal
        modal.classList.remove('hidden');
        document.body.style.overflow = 'hidden';

        // Focus the close button
        const closeBtn = modal.querySelector('[data-resume-modal-initial-focus]') ||
            modal.querySelector('[data-close-resume-modal]');
        if (closeBtn) {
            setTimeout(() => closeBtn.focus(), 100);
        }

        // Track with GA if available
        if (typeof gtag === 'function') {
            gtag('event', 'resume_preview', {
                event_category: 'engagement',
                event_label: 'resume_modal_opened'
            });
        }
    }

    /**
     * Close the resume preview modal
     */
    function closeResumeModal() {
        modal.classList.add('hidden');
        document.body.style.overflow = '';

        // Clear the iframe to stop loading
        pdfViewer.src = '';

        // Return focus
        if (modalReturnFocus) {
            modalReturnFocus.focus();
            modalReturnFocus = null;
        }
    }

    // Attach event listeners to all resume preview triggers
    document.querySelectorAll('[data-resume-preview]').forEach(trigger => {
        trigger.addEventListener('click', (e) => {
            e.preventDefault();
            openResumeModal();
        });
    });

    // Attach event listeners to all close buttons
    modal.querySelectorAll('[data-close-resume-modal]').forEach(btn => {
        btn.addEventListener('click', closeResumeModal);
    });

    // Close on Escape key
    document.addEventListener('keydown', (e) => {
        if (e.key === 'Escape' && !modal.classList.contains('hidden')) {
            closeResumeModal();
        }
    });

    // Prevent clicks inside the modal content from closing
    modalPanel.addEventListener('click', (e) => {
        e.stopPropagation();
    });

    // Close when clicking on the dimmed backdrop
    modal.addEventListener('click', (e) => {
        if (e.target === modal) {
            closeResumeModal();
        }
    });

    // Track download button clicks
    const downloadBtn = document.getElementById('resumeDownloadBtn');
    if (downloadBtn) {
        downloadBtn.addEventListener('click', () => {
            if (typeof gtag === 'function') {
                gtag('event', 'download_resume', {
                    event_category: 'engagement',
                    event_label: 'resume_pdf_from_modal'
                });
            }
        });
    }

    console.log('✅ Resume preview modal initialized');

})();
