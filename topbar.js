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

    let style = document.createElement('style');
    style.textContent = `
        html, body { height: 100%; }
        body.sb-body { margin: 0; display: flex; overflow: hidden; }

        .sb-sidebar {
            width: 210px;
            flex-shrink: 0;
            height: 100vh;
            background: var(--surface);
            border-right: 1px solid var(--border);
            display: flex;
            flex-direction: column;
            transition: width 0.18s ease;
            overflow: hidden;
        }
        .sb-sidebar.collapsed { width: 60px; }

        .sb-sidebar-header {
            display: flex; align-items: center; gap: 10px;
            padding: 18px 16px; border-bottom: 1px solid var(--border); flex-shrink: 0;
        }
        .sb-logo-mark {
            width: 28px; height: 28px; flex-shrink: 0;
            background: var(--accent); border-radius: 7px;
            display: flex; align-items: center; justify-content: center;
            color: white; font-family: 'Syne', sans-serif; font-weight: 800; font-size: 14px;
            cursor: pointer;
        }
        .sb-logo-text {
            font-family: 'Syne', sans-serif; font-weight: 800; font-size: 16px; color: var(--text-primary);
            white-space: nowrap; cursor: pointer;
        }
        .sb-sidebar.collapsed .sb-logo-text { display: none; }

        .sb-project-chip {
            display: flex; align-items: center; margin: 10px 10px 0;
            padding: 8px 10px; border-radius: 7px; border: 1px solid var(--border);
            background: var(--bg); cursor: pointer; font-size: 12px; color: var(--text-secondary);
            white-space: nowrap; overflow: hidden; text-overflow: ellipsis;
        }
        .sb-project-chip:hover { border-color: var(--accent); }
        .sb-sidebar.collapsed .sb-project-chip { display: none; }

        .sb-nav { flex: 1; overflow-y: auto; padding: 10px; display: flex; flex-direction: column; gap: 2px; }
        .sb-nav-link {
            display: flex; align-items: center; gap: 12px;
            padding: 9px 10px; border-radius: 7px;
            color: var(--text-secondary); text-decoration: none;
            font-size: 13.5px; font-weight: 500;
            white-space: nowrap; overflow: hidden;
            transition: background 0.12s, color 0.12s;
            border: none; background: none; cursor: pointer; width: 100%; text-align: left;
            font-family: inherit;
        }
        .sb-nav-link:hover { background: var(--bg); color: var(--text-primary); }
        .sb-nav-link.active { background: var(--accent-glow); color: var(--accent); font-weight: 600; }
        .sb-nav-link svg { flex-shrink: 0; width: 18px; height: 18px; }
        .sb-sidebar.collapsed .sb-nav-link { justify-content: center; }
        .sb-nav-label { flex: 1; }
        .sb-sidebar.collapsed .sb-nav-label { display: none; }
        .sb-cart-badge {
            background: var(--accent); color: white; font-size: 10.5px; font-weight: 700;
            border-radius: 99px; padding: 1px 6px; flex-shrink: 0;
        }
        .sb-sidebar.collapsed .sb-cart-badge { display: none; }

        .sb-sidebar-footer {
            border-top: 1px solid var(--border); padding: 10px; flex-shrink: 0;
            display: flex; flex-direction: column; gap: 2px;
        }
        .sb-collapse-btn {
            display: flex; align-items: center; justify-content: center;
            width: 26px; height: 26px; border-radius: 6px;
            border: 1px solid var(--border); background: var(--surface);
            color: var(--text-muted); cursor: pointer; flex-shrink: 0;
            margin-left: auto;
        }
        .sb-collapse-btn:hover { color: var(--text-primary); border-color: var(--accent); }
        .sb-sidebar.collapsed .sb-collapse-btn { margin: 0 auto; transform: rotate(180deg); }

        .sb-main-wrapper { flex: 1; min-width: 0; height: 100vh; overflow-y: auto; }

        /* The old page-level layout assumed a 60px topbar above it; there isn't one anymore. */
        .sb-main-wrapper > .page-body { min-height: 100vh; }
    `;
    document.head.appendChild(style);

    const icons = {
        dashboard: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="3" y="3" width="7" height="9"/><rect x="14" y="3" width="7" height="5"/><rect x="14" y="12" width="7" height="9"/><rect x="3" y="16" width="7" height="5"/></svg>',
        projects: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M3 7l2-3h5l2 3h9v11a1 1 0 0 1-1 1H4a1 1 0 0 1-1-1V7z"/></svg>',
        catalog: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="3" y="3" width="18" height="18" rx="2"/><path d="M3 9h18M9 21V9"/></svg>',
        boq: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M9 2h6l1 3H8l1-3z"/><path d="M6 5h12v16a1 1 0 0 1-1 1H7a1 1 0 0 1-1-1V5z"/><path d="M9 11h6M9 15h6"/></svg>',
        tasks: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="3" y="3" width="18" height="18" rx="2"/><path d="M8 12l3 3 5-6"/></svg>',
        users: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M23 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/></svg>',
        collapse: '<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M15 18l-6-6 6-6"/></svg>',
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

    let hasProjectSwitcher = !!document.getElementById('project-modal');

    let sidebar = document.createElement('div');
    sidebar.className = 'sb-sidebar';
    sidebar.id = 'app-sidebar';
    sidebar.innerHTML = `
        <div class="sb-sidebar-header">
            <div class="sb-logo-mark" id="sb-logo-mark">C</div>
            <span class="sb-logo-text" id="sb-logo-text">Construct</span>
        </div>
        ${hasProjectSwitcher ? `
            <button class="sb-project-chip" id="project-selector-btn">
                <span id="topbar-project-name">No Project</span>
            </button>
        ` : ''}
        <div class="sb-nav">
            ${navItems.map(item => `
                <a href="${item.href}" class="sb-nav-link${item.href === path ? ' active' : ''}">
                    ${item.icon}
                    <span class="sb-nav-label">${item.label}</span>
                    ${item.badge ? '<span class="sb-cart-badge" id="cart-count">0</span>' : ''}
                </a>
            `).join('')}
        </div>
        <div class="sb-sidebar-footer">
            <button class="sb-collapse-btn" id="sidebar-collapse-btn" title="Collapse sidebar">${icons.collapse}</button>
            <a href="#" class="sb-nav-link" id="sb-sign-out">
                ${icons.signout}
                <span class="sb-nav-label">Sign Out</span>
            </a>
        </div>
    `;

    let mainWrapper = document.createElement('div');
    mainWrapper.className = 'sb-main-wrapper';
    Array.from(document.body.children).forEach(el => mainWrapper.appendChild(el));

    document.body.classList.add('sb-body');
    document.body.appendChild(sidebar);
    document.body.appendChild(mainWrapper);

    if (localStorage.getItem('sidebarCollapsed') === 'true') {
        sidebar.classList.add('collapsed');
    }
    document.getElementById('sidebar-collapse-btn').addEventListener('click', function() {
        sidebar.classList.toggle('collapsed');
        localStorage.setItem('sidebarCollapsed', sidebar.classList.contains('collapsed'));
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

    ['sb-logo-mark', 'sb-logo-text'].forEach(id => {
        document.getElementById(id).addEventListener('click', function() {
            window.location.href = 'dashboard.html';
        });
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

async function loadProjectName() {
    let el = document.getElementById('topbar-project-name');
    if (!el) return;
    let projectName = localStorage.getItem('selectedProjectName');
    el.textContent = projectName || 'No Project';
}

async function openProjectModal() {
    let response = await authFetch('https://construct-backend-production.up.railway.app/api/projects');
    let projects = await response.json();
    let container = document.getElementById('project-list-modal');
    container.innerHTML = '';

    if (projects.length === 0) {
        container.innerHTML = '<p style="color:#6b7280">No projects yet.</p>';
    }

    projects.forEach(function(project) {
        let item = document.createElement('div');
        item.style.cssText = 'padding:12px;border:1px solid #edf0f5;border-radius:8px;margin-bottom:8px;cursor:pointer';
        item.innerHTML = `<div style="font-weight:600">${project.name}</div><div style="font-size:12px;color:#6b7280">${project.location || ''}</div>`;
        item.addEventListener('click', function() {
            localStorage.setItem('selectedProjectId', project.id);
            localStorage.setItem('selectedProjectName', project.name);
            loadProjectName();
            document.getElementById('project-modal').classList.remove('open');
        });
        container.appendChild(item);
    });

    document.getElementById('project-modal').classList.add('open');
}

// Not every page has the project switcher (e.g. tasks.html, project-detail.html, dashboard.html).
let projectSelectorBtn = document.getElementById('project-selector-btn');
if (projectSelectorBtn) {
    projectSelectorBtn.addEventListener('click', openProjectModal);
}
let projectModalClose = document.getElementById('project-modal-close');
if (projectModalClose) {
    projectModalClose.addEventListener('click', function() {
        document.getElementById('project-modal').classList.remove('open');
    });
}

loadProjectName();
