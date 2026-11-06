// --- Role helpers (ADMIN / FINANCE / VISUALIZER) ---
function getRole() {
    return sessionStorage.getItem('construct-role') || 'ADMIN';
}
function isAdmin() {
    return getRole() === 'ADMIN';
}
function isFinance() {
    return getRole() === 'FINANCE';
}
function isVisualizer() {
    return getRole() === 'VISUALIZER';
}
// FINANCE can see all costs but needs ADMIN approval to change BOQ rate/qty.
function canSeeCosts() {
    return isAdmin() || isFinance();
}
// Only ADMIN can edit BOQ figures directly; FINANCE goes through the approval workflow.
function canEditBOQDirectly() {
    return isAdmin();
}

// ===== Shared sidebar nav, used by every authenticated page =====
// Replaces the old top navbar. Builds the sidebar + wraps whatever was already
// in <body> (the page's own content) so it sits next to it instead of under it.

(function buildSidebar() {
    if (document.getElementById('app-sidebar')) return; // already built (e.g. double-included)

    const icons = {
        dashboard: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="3" y="3" width="7" height="9"/><rect x="14" y="3" width="7" height="5"/><rect x="14" y="12" width="7" height="9"/><rect x="3" y="16" width="7" height="5"/></svg>',
        projects: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M3 7l2-3h5l2 3h9v11a1 1 0 0 1-1 1H4a1 1 0 0 1-1-1V7z"/></svg>',
        catalog: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="3" y="3" width="18" height="18" rx="2"/><path d="M3 9h18M9 21V9"/></svg>',
        boq: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M9 2h6l1 3H8l1-3z"/><path d="M6 5h12v16a1 1 0 0 1-1 1H7a1 1 0 0 1-1-1V5z"/><path d="M9 11h6M9 15h6"/></svg>',
        tasks: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="3" y="3" width="18" height="18" rx="2"/><path d="M8 12l3 3 5-6"/></svg>',
        users: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M23 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/></svg>',
        collapse: '<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M15 18l-6-6 6-6"/></svg>',
        menu: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M3 6h18M3 12h18M3 18h18"/></svg>',
        signout: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"/><path d="M16 17l5-5-5-5"/><path d="M21 12H9"/></svg>'
    };

    let path = window.location.pathname.split('/').pop() || 'index.html';
    let navItems = [
        { href: 'dashboard.html', label: 'Dashboard', icon: icons.dashboard },
        { href: 'index.html', label: 'Projects', icon: icons.projects },
        { href: 'catalog.html', label: 'Catalog', icon: icons.catalog },
        { href: 'boq-detail.html', label: 'BOQ', icon: icons.boq, badge: true },
        { href: 'tasks.html', label: 'Tasks', icon: icons.tasks }
    ];
    // Account management is sensitive - only admins get the nav link (the page
    // itself also bounces non-admins who navigate there directly).
    if (isAdmin()) {
        navItems.push({ href: 'users.html', label: 'Users', icon: icons.users });
    }

    let sidebar = document.createElement('nav');
    sidebar.className = 'sb-sidebar';
    sidebar.id = 'app-sidebar';
    sidebar.setAttribute('aria-label', 'Main');
    sidebar.innerHTML = `
        <div class="sb-sidebar-header">
            <a href="dashboard.html" class="sb-brand" aria-label="Construct — go to dashboard">
                <span class="sb-logo-mark" aria-hidden="true">C</span>
                <span class="sb-logo-text">Construct</span>
            </a>
        </div>
        <div class="sb-nav">
            ${navItems.map(item => `
                <a href="${item.href}" class="sb-nav-link${item.href === path ? ' active' : ''}"${item.href === path ? ' aria-current="page"' : ''} title="${item.label}">
                    ${item.icon}
                    <span class="sb-nav-label">${item.label}</span>
                    ${item.badge ? '<span class="sb-cart-badge" id="cart-count" data-count="0" aria-label="items in BOQ">0</span>' : ''}
                </a>
            `).join('')}
        </div>
        <div class="sb-sidebar-footer">
            <button type="button" class="sb-collapse-btn" id="sidebar-collapse-btn" aria-label="Collapse sidebar" aria-expanded="true">${icons.collapse}</button>
            <a href="#" class="sb-nav-link" id="sb-sign-out" title="Sign out">
                ${icons.signout}
                <span class="sb-nav-label">Sign out</span>
            </a>
        </div>
    `;

    // Phone: compact app bar with a menu button that opens the sidebar as a drawer
    let currentItem = navItems.find(i => i.href === path);
    let mobileBar = document.createElement('header');
    mobileBar.className = 'sb-mobile-bar';
    mobileBar.innerHTML = `
        <button type="button" class="icon-btn" id="sb-menu-btn" aria-label="Open menu" aria-controls="app-sidebar" aria-expanded="false">${icons.menu}</button>
        <a href="dashboard.html" class="sb-brand" aria-label="Construct — go to dashboard"><span class="sb-logo-mark" aria-hidden="true">C</span></a>
        <span class="sb-mobile-title">${currentItem ? currentItem.label : (document.title.split(' — ')[0] || 'Construct')}</span>
    `;
    let scrim = document.createElement('div');
    scrim.className = 'sb-scrim';

    let mainWrapper = document.createElement('main');
    mainWrapper.className = 'sb-main-wrapper';
    mainWrapper.id = 'main';
    Array.from(document.body.children).forEach(el => {
        // Leave scripts and fixed overlays where they are
        if (el.tagName === 'SCRIPT') return;
        mainWrapper.appendChild(el);
    });

    document.body.classList.add('sb-body');
    document.body.insertBefore(mainWrapper, document.body.firstChild);
    document.body.insertBefore(mobileBar, mainWrapper);
    document.body.insertBefore(sidebar, mobileBar);
    document.body.appendChild(scrim);

    let collapseBtn = document.getElementById('sidebar-collapse-btn');
    function syncCollapsed() {
        let c = sidebar.classList.contains('collapsed');
        collapseBtn.setAttribute('aria-expanded', String(!c));
        collapseBtn.setAttribute('aria-label', c ? 'Expand sidebar' : 'Collapse sidebar');
    }
    if (localStorage.getItem('sidebarCollapsed') === 'true') {
        sidebar.classList.add('collapsed');
    }
    syncCollapsed();
    collapseBtn.addEventListener('click', function() {
        sidebar.classList.toggle('collapsed');
        localStorage.setItem('sidebarCollapsed', sidebar.classList.contains('collapsed'));
        syncCollapsed();
    });

    let menuBtn = document.getElementById('sb-menu-btn');
    function setDrawer(open) {
        sidebar.classList.toggle('drawer-open', open);
        scrim.classList.toggle('visible', open);
        menuBtn.setAttribute('aria-expanded', String(open));
        if (open) {
            let first = sidebar.querySelector('.sb-nav-link');
            if (first) first.focus();
        } else {
            menuBtn.focus();
        }
    }
    menuBtn.addEventListener('click', () => setDrawer(!sidebar.classList.contains('drawer-open')));
    scrim.addEventListener('click', () => setDrawer(false));
    document.addEventListener('keydown', e => {
        if (e.key === 'Escape' && sidebar.classList.contains('drawer-open')) setDrawer(false);
    });

    document.getElementById('sb-sign-out').addEventListener('click', function(e) {
        e.preventDefault();
        sessionStorage.removeItem('construct-token');
        sessionStorage.removeItem('construct-auth');
        sessionStorage.removeItem('construct-user');
        localStorage.removeItem('selectedProjectId');
        localStorage.removeItem('selectedProjectName');
        window.location.replace('login.html');
    });

    if (typeof updateCartCount === 'function') {
        updateCartCount();
    }
})();

if (!document.getElementById('toast-container')) {
    let tc = document.createElement('div');
    tc.id = 'toast-container';
    document.body.appendChild(tc);
}
if (!document.getElementById('progress-bar')) {
    let pb = document.createElement('div');
    pb.id = 'progress-bar';
    document.body.insertBefore(pb, document.body.firstChild);
}

// The sidebar project-switcher (chip + modal) was removed - it duplicated the
// Projects page, which is the actual way to open a project, and just sat there
// showing stale localStorage state ("No Project" or an old project name) that
// had nothing to do with what you were looking at.
