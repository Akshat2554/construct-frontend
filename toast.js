function showToast(message, type = 'info', duration = 3000) {
    let container = document.getElementById('toast-container');
    if (!container) return;
    
    let icons = { success: '✓', error: '✕', info: 'ℹ', warning: '⚠' };
    
    let toast = document.createElement('div');
    toast.className = `toast ${type}`;
    toast.innerHTML = `
        <span style="font-size:15px;flex-shrink:0">${icons[type]}</span>
        <span>${message}</span>
    `;
    toast.addEventListener('click', () => dismissToast(toast));
    container.appendChild(toast);
    
    setTimeout(() => dismissToast(toast), duration);
}

function dismissToast(toast) {
    toast.style.animation = 'toast-out 0.2s ease forwards';
    setTimeout(() => toast.remove(), 200);
}

let _progressCount = 0;

function startProgress() {
    _progressCount++;
    let bar = document.getElementById('progress-bar');
    if (bar) {
        bar.style.width = '70%';
        bar.style.transition = 'width 2s ease';
    }
}

function endProgress() {
    _progressCount = Math.max(0, _progressCount - 1);
    if (_progressCount === 0) {
        let bar = document.getElementById('progress-bar');
        if (bar) {
            bar.style.width = '100%';
            bar.style.transition = 'width 0.2s ease';
            setTimeout(() => {
                bar.style.width = '0%';
                bar.style.transition = 'none';
            }, 300);
        }
    }
}

let _loadingCount = 0;

function showLoading() {
    _loadingCount++;
    let existing = document.getElementById('loading-overlay');
    if (existing) return;
    
    let overlay = document.createElement('div');
    overlay.id = 'loading-overlay';
    overlay.style.cssText = `
        position:fixed;
        top:0;left:0;right:0;bottom:0;
        display:flex;
        align-items:center;
        justify-content:center;
        z-index:9998;
        pointer-events:none;
    `;
    overlay.innerHTML = `
        <div style="
            width:40px;height:40px;
            border:3px solid var(--border);
            border-top:3px solid var(--accent);
            border-radius:50%;
            animation:spin 0.7s linear infinite;
        "></div>
    `;
    document.body.appendChild(overlay);
}

function hideLoading() {
    _loadingCount = Math.max(0, _loadingCount - 1);
    if (_loadingCount === 0) {
        let overlay = document.getElementById('loading-overlay');
        if (overlay) overlay.remove();
    }
}