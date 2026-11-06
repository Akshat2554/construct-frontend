// ===== Shared UI helpers: icons, in-app dialogs, keyboard access =====
// Loaded in <head> on every page after toast.js.

// One stroke icon set (24px grid, 2px stroke) so nothing falls back to emoji.
const ICONS = {
    box: '<path d="M21 8l-9-5-9 5 9 5 9-5z"/><path d="M3 8v8l9 5 9-5V8"/><path d="M12 13v8"/>',
    image: '<rect x="3" y="3" width="18" height="18" rx="2"/><circle cx="8.5" cy="8.5" r="1.5"/><path d="M21 15l-5-5L5 21"/>',
    x: '<path d="M18 6L6 18M6 6l12 12"/>',
    check: '<path d="M20 6L9 17l-5-5"/>',
    info: '<circle cx="12" cy="12" r="9"/><path d="M12 16v-4M12 8h.01"/>',
    alert: '<path d="M10.3 3.9L1.8 18a2 2 0 0 0 1.7 3h17a2 2 0 0 0 1.7-3L13.7 3.9a2 2 0 0 0-3.4 0z"/><path d="M12 9v4M12 17h.01"/>',
    grid: '<rect x="3" y="3" width="7" height="7"/><rect x="14" y="3" width="7" height="7"/><rect x="3" y="14" width="7" height="7"/><rect x="14" y="14" width="7" height="7"/>',
    list: '<path d="M8 6h13M8 12h13M8 18h13M3 6h.01M3 12h.01M3 18h.01"/>',
    plus: '<path d="M12 5v14M5 12h14"/>',
    more: '<circle cx="12" cy="5" r="1"/><circle cx="12" cy="12" r="1"/><circle cx="12" cy="19" r="1"/>',
    arrowLeft: '<path d="M19 12H5M12 19l-7-7 7-7"/>',
    upload: '<path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><path d="M17 8l-5-5-5 5M12 3v12"/>',
    file: '<path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><path d="M14 2v6h6"/>',
    menu: '<path d="M3 6h18M3 12h18M3 18h18"/>',
    search: '<circle cx="11" cy="11" r="7"/><path d="M20 20l-3.5-3.5"/>',
    pin: '<path d="M12 17v5"/><path d="M5 17h14l-1.5-5.5V5a1 1 0 0 0-1-1h-9a1 1 0 0 0-1 1v6.5z"/>',
    trash: '<path d="M3 6h18M8 6V4h8v2M19 6l-1 14a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2L5 6"/>',
    edit: '<path d="M12 20h9"/><path d="M16.5 3.5a2.1 2.1 0 0 1 3 3L7 19l-4 1 1-4z"/>',
    layers: '<path d="M12 2l10 5-10 5L2 7l10-5z"/><path d="M2 17l10 5 10-5M2 12l10 5 10-5"/>',
    drawing: '<path d="M3 3h18v18H3z"/><path d="M3 9h6v12M15 3v6h6"/>'
};

function icon(name, cls) {
    let body = ICONS[name] || ICONS.box;
    return `<svg class="${cls || 'ic'}" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">${body}</svg>`;
}

function escapeHtml(str) {
    return String(str == null ? '' : str)
        .replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;')
        .replace(/"/g, '&quot;').replace(/'/g, '&#39;');
}

// ----- In-app dialogs (replace window.confirm / window.prompt) -----
// Both return promises so callers use: if (await uiConfirm('...')) { ... }

function _buildDialog({ title, message, input, defaultValue, confirmLabel, cancelLabel, danger }) {
    return new Promise(resolve => {
        let previouslyFocused = document.activeElement;
        let overlay = document.createElement('div');
        overlay.className = 'modal-overlay ui-dialog';
        overlay.style.zIndex = '1100';
        overlay.innerHTML = `
            <div class="modal" role="${input ? 'dialog' : 'alertdialog'}" aria-modal="true" aria-labelledby="ui-dialog-title" aria-describedby="ui-dialog-msg">
                <h2 id="ui-dialog-title">${escapeHtml(title)}</h2>
                ${message ? `<p class="ui-dialog-message" id="ui-dialog-msg">${escapeHtml(message)}</p>` : ''}
                ${input ? `<input type="text" class="ui-dialog-input" aria-labelledby="ui-dialog-title" value="${escapeHtml(defaultValue || '')}">` : ''}
                <div class="modal-buttons">
                    <button type="button" class="ui-cancel">${escapeHtml(cancelLabel || 'Cancel')}</button>
                    <button type="button" class="ui-ok ${danger ? 'ui-danger' : 'btn-primary'}">${escapeHtml(confirmLabel || 'OK')}</button>
                </div>
            </div>`;
        document.body.appendChild(overlay);
        // Force a frame so @starting-style transitions run
        requestAnimationFrame(() => overlay.classList.add('open'));

        let field = overlay.querySelector('.ui-dialog-input');
        let ok = overlay.querySelector('.ui-ok');
        let cancel = overlay.querySelector('.ui-cancel');

        function close(result) {
            overlay.classList.remove('open');
            document.removeEventListener('keydown', onKey, true);
            setTimeout(() => overlay.remove(), 160);
            if (previouslyFocused && previouslyFocused.focus) previouslyFocused.focus();
            resolve(result);
        }
        function onKey(e) {
            if (e.key === 'Escape') { e.preventDefault(); e.stopPropagation(); close(input ? null : false); }
            else if (e.key === 'Enter' && (document.activeElement === field || !input) && document.activeElement !== cancel) {
                e.preventDefault(); close(input ? field.value : true);
            } else if (e.key === 'Tab') {
                // Keep focus inside the dialog
                let items = [field, cancel, ok].filter(Boolean);
                let i = items.indexOf(document.activeElement);
                e.preventDefault();
                items[(i + (e.shiftKey ? -1 : 1) + items.length) % items.length].focus();
            }
        }
        ok.addEventListener('click', () => close(input ? field.value : true));
        cancel.addEventListener('click', () => close(input ? null : false));
        overlay.addEventListener('mousedown', e => { if (e.target === overlay) close(input ? null : false); });
        document.addEventListener('keydown', onKey, true);
        setTimeout(() => (field || (danger ? cancel : ok)).focus(), 0);
    });
}

function uiConfirm(message, opts = {}) {
    let isDelete = /^(delete|remove)\b/i.test(message);
    return _buildDialog({
        title: opts.title || (isDelete ? 'Are you sure?' : 'Confirm'),
        message,
        confirmLabel: opts.confirmLabel || (isDelete ? 'Delete' : 'Confirm'),
        cancelLabel: opts.cancelLabel,
        danger: opts.danger != null ? opts.danger : isDelete
    });
}

function uiPrompt(message, defaultValue = '', opts = {}) {
    return _buildDialog({
        title: message,
        input: true,
        defaultValue,
        confirmLabel: opts.confirmLabel || 'Save',
        cancelLabel: opts.cancelLabel
    });
}

// ----- Keyboard access for clickable non-button elements -----
// Pages render many cards and rows as <div onclick>. Give them a role, a tab
// stop and Enter/Space activation so they work without a mouse.
(function () {
    const SELECTOR = '[onclick]:not(button):not(a):not(input):not(select):not(textarea):not(label):not(option):not(tr):not(td):not(th):not(.modal-overlay)';

    function enhance(root) {
        if (!root.querySelectorAll) return;
        let nodes = root.matches && root.matches(SELECTOR) ? [root] : [];
        nodes = nodes.concat(Array.from(root.querySelectorAll(SELECTOR)));
        let clickable = root.matches && root.matches('[data-clickable]') ? [root] : [];
        clickable = clickable.concat(Array.from(root.querySelectorAll('[data-clickable]')));
        nodes.concat(clickable).forEach(el => {
            if (el.dataset.kb) return;
            el.dataset.kb = '1';
            if (!el.hasAttribute('role') && el.tagName !== 'TR') el.setAttribute('role', 'button');
            if (!el.hasAttribute('tabindex')) el.setAttribute('tabindex', '0');
        });
    }

    document.addEventListener('keydown', function (e) {
        if (e.key !== 'Enter' && e.key !== ' ') return;
        let el = e.target;
        if (!el || !el.dataset || el.dataset.kb !== '1') return;
        e.preventDefault();
        el.click();
    });

    function start() {
        enhance(document.body);
        new MutationObserver(muts => {
            muts.forEach(m => m.addedNodes.forEach(n => { if (n.nodeType === 1) enhance(n); }));
        }).observe(document.body, { childList: true, subtree: true });
    }
    if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', start);
    else start();

    // Escape closes the top-most open modal on any page
    document.addEventListener('keydown', function (e) {
        if (e.key !== 'Escape') return;
        let open = Array.from(document.querySelectorAll('.modal-overlay.open:not(.ui-dialog)'));
        if (!open.length) return;
        open[open.length - 1].classList.remove('open');
    });
})();

// Indian-style grouping for money: ₹1,25,000
function formatINR(value) {
    let n = Number(value);
    if (value === null || value === undefined || value === '' || isNaN(n)) return '—';
    return '₹' + n.toLocaleString('en-IN', { maximumFractionDigits: 2 });
}
