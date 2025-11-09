/**
 * Project Quick View Modal
 * Handles project detail modal display
 */

(() => {
    'use strict';

    document.addEventListener('DOMContentLoaded', () => {
        const modal = document.getElementById('projectModal');
        const modalTitle = document.getElementById('modalTitle');
        const modalDesc = document.getElementById('modalDesc');
        const modalTech = document.getElementById('modalTech');
        const modalLink = document.getElementById('modalLink');
        const modalReadme = document.getElementById('modalReadme');
        const modalCopy = document.getElementById('modalCopy');
        const modalToast = document.getElementById('modalToast');
        const modalMedia = document.getElementById('modalMedia');
        const modalImg = document.getElementById('modalImg');

        if (!modal) return;

        let modalReturnFocus = null;

        window.openModalFromCard = function (card) {
            modalReturnFocus = document.activeElement;
            modalTitle.textContent = card.dataset.title || 'Project';

            const p = card.querySelector('p');
            modalDesc.textContent = p ? p.textContent.trim() : '';

            const img = card.dataset.img || '';
            if (img) {
                modalImg.src = img;
                modalImg.alt = `${card.dataset.title} preview`;
                modalMedia.classList.remove('hidden');
            } else {
                modalImg.removeAttribute('src');
                modalMedia.classList.add('hidden');
            }

            const ul = document.getElementById('modalHighlights');
            ul.innerHTML = '';
            const points = (card.dataset.highlights || '').split(';').map(s => s.trim()).filter(Boolean);
            points.forEach(pt => {
                const li = document.createElement('li');
                li.textContent = pt;
                ul.appendChild(li);
            });

            modalTech.innerHTML = '';
            (card.dataset.tech || '').split(',').map(s => s.trim()).filter(Boolean).forEach(t => {
                const span = document.createElement('span');
                span.className = 'tech-pill';
                span.textContent = t;
                modalTech.appendChild(span);
            });

            const repo = card.dataset.link || '#';
            const readme = card.dataset.readme || repo + '#readme';
            const clone = card.dataset.clone || (repo.endsWith('.git') ? repo : repo + '.git');

            modalLink.href = repo;
            modalReadme.href = readme;
            modalCopy.dataset.clipboard = clone;
            modalToast.classList.add('hidden');

            modal.classList.remove('hidden');
            const closer = modal.querySelector('[data-close-modal]');
            closer && closer.focus();
            document.body.style.overflow = 'hidden';
        };

        function closeModal() {
            modal.classList.add('hidden');
            document.body.style.overflow = '';
            if (modalReturnFocus) modalReturnFocus.focus();
        }

        modal.querySelectorAll('[data-close-modal]').forEach(el => el.addEventListener('click', closeModal));
        document.addEventListener('keydown', e => {
            if (e.key === 'Escape' && !modal.classList.contains('hidden')) closeModal();
        });

        const panel = modal.querySelector('div.relative');
        if (panel) panel.addEventListener('click', e => e.stopPropagation());

        if (modalCopy) {
            modalCopy.addEventListener('click', async () => {
                const text = modalCopy.dataset.clipboard || '';
                try {
                    await navigator.clipboard.writeText(text);
                    modalToast.textContent = 'Copied to clipboard';
                    modalToast.classList.remove('hidden');
                    setTimeout(() => modalToast.classList.add('hidden'), 1600);
                } catch {
                    modalToast.textContent = 'Press ⌘/Ctrl+C to copy';
                    modalToast.classList.remove('hidden');
                    setTimeout(() => modalToast.classList.add('hidden'), 2000);
                }
            });
        }

        console.log('✅ Modal module loaded');
    });
})();
