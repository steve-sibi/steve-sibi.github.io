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

    if (!modal || !pdfViewer || !modalPanel) return;

    const controller = window.createModalController ? window.createModalController({
        modal,
        panel: modalPanel,
        closeSelectors: ['[data-close-resume-modal]'],
        initialFocusSelector: '[data-resume-modal-initial-focus]',
        closeOnBackdrop: true,
        onOpen: () => {
            pdfViewer.src = resumePath;

            if (typeof gtag === 'function') {
                gtag('event', 'resume_preview', {
                    event_category: 'engagement',
                    event_label: 'resume_modal_opened'
                });
            }
        },
        onClose: () => {
            pdfViewer.src = '';
        },
    }) : null;

    function openResumeModal() {
        if (controller) {
            controller.open();
            return;
        }

        pdfViewer.src = resumePath;
        modal.classList.remove('hidden');
        document.body.style.overflow = 'hidden';

        const closeBtn = modal.querySelector('[data-resume-modal-initial-focus]') ||
            modal.querySelector('[data-close-resume-modal]');
        closeBtn && closeBtn.focus();
    }

    // Attach event listeners to all resume preview triggers
    document.querySelectorAll('[data-resume-preview]').forEach(trigger => {
        trigger.addEventListener('click', (e) => {
            e.preventDefault();
            openResumeModal();
        });
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
