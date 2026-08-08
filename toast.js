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