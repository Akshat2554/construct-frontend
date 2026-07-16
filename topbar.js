async function loadProjectName() {
    let projectName = localStorage.getItem('selectedProjectName');
    document.getElementById('topbar-project-name').textContent = projectName || 'No Project';
}

async function openProjectModal() {
    let response = await fetch('http://localhost:8081/api/projects');
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

loadProjectName();