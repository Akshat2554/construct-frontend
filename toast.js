// ===== Toasts, progress bar and slow-request spinner =====

const TOAST_ICONS = {
    success: '<path d="M20 6L9 17l-5-5"/>',
    error: '<circle cx="12" cy="12" r="9"/><path d="M15 9l-6 6M9 9l6 6"/>',
    info: '<circle cx="12" cy="12" r="9"/><path d="M12 16v-4M12 8h.01"/>',
    warning: '<path d="M10.3 3.9L1.8 18a2 2 0 0 0 1.7 3h17a2 2 0 0 0 1.7-3L13.7 3.9a2 2 0 0 0-3.4 0z"/><path d="M12 9v4M12 17h.01"/>'
};

function showToast(message, type = 'info', duration) {
    let container = document.getElementById('toast-container');
    if (!container) {
        container = document.createElement('div');
        container.id = 'toast-container';
        (document.body || document.documentElement).appendChild(container);
    }
    container.setAttribute('role', 'status');
    container.setAttribute('aria-live', 'polite');

    // Errors stay up longer so they can be read
    if (duration == null) duration = type === 'error' ? 5000 : 3000;

    let toast = document.createElement('div');
    toast.className = `toast ${type}`;
    let iconSvg = `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">${TOAST_ICONS[type] || TOAST_ICONS.info}</svg>`;
    let text = document.createElement('span');
    text.textContent = message;
    toast.innerHTML = iconSvg;
    toast.appendChild(text);
    toast.addEventListener('click', () => dismissToast(toast));
    container.appendChild(toast);

    // Pause the timer while the pointer is over the toast or the tab is hidden
    let remaining = duration, startedAt = Date.now(), timer = null;
    function arm() { startedAt = Date.now(); timer = setTimeout(() => dismissToast(toast), remaining); }
    function pause() { clearTimeout(timer); remaining -= Date.now() - startedAt; }
    toast.addEventListener('mouseenter', pause);
    toast.addEventListener('mouseleave', arm);
    arm();
}

function dismissToast(toast) {
    if (!toast || toast.classList.contains('leaving')) return;
    toast.classList.add('leaving');
    setTimeout(() => toast.remove(), 160);
}

let _progressCount = 0;

function startProgress() {
    _progressCount++;
    let bar = document.getElementById('progress-bar');
    if (bar) {
        bar.style.transition = 'width 2s cubic-bezier(0.23, 1, 0.32, 1)';
        bar.style.width = '70%';
    }
}

function endProgress() {
    _progressCount = Math.max(0, _progressCount - 1);
    if (_progressCount === 0) {
        let bar = document.getElementById('progress-bar');
        if (bar) {
            bar.style.transition = 'width 0.2s ease';
            bar.style.width = '100%';
            setTimeout(() => {
                if (_progressCount === 0) {
                    bar.style.transition = 'none';
                    bar.style.width = '0%';
                }
            }, 250);
        }
    }
}

let _loadingCount = 0;

// The spinner fades in only after 300ms (see #loading-overlay in styles.css),
// so fast requests show just the thin progress bar.
function showLoading() {
    _loadingCount++;
    if (document.getElementById('loading-overlay')) return;
    let overlay = document.createElement('div');
    overlay.id = 'loading-overlay';
    overlay.setAttribute('aria-hidden', 'true');
    overlay.innerHTML = '<div class="spinner"></div>';
    (document.body || document.documentElement).appendChild(overlay);
}

function hideLoading() {
    _loadingCount = Math.max(0, _loadingCount - 1);
    if (_loadingCount === 0) {
        let overlay = document.getElementById('loading-overlay');
        if (overlay) overlay.remove();
    }
}
