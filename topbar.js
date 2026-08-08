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
    let projectName = localStorage.getItem('selectedProjectName');
    document.getElementById('topbar-project-name').textContent = projectName || 'No Project';
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

document.getElementById('project-selector-btn').addEventListener('click', openProjectModal);
document.getElementById('project-modal-close').addEventListener('click', function() {
    document.getElementById('project-modal').classList.remove('open');
});

let logoutBtn = document.createElement('button');
logoutBtn.className = 'nav-btn';
logoutBtn.textContent = 'Sign Out';
logoutBtn.style.marginLeft = '8px';
logoutBtn.addEventListener('click', function() {
    localStorage.removeItem('construct-auth');
    localStorage.removeItem('construct-user');
    window.location.replace('login.html');
});
document.querySelector('.global-topbar').appendChild(logoutBtn);

loadProjectName();