function authFetch(url, options = {}) {
    let token = sessionStorage.getItem('construct-token');
    options.headers = options.headers || {};
    if (token) {
        options.headers['Authorization'] = 'Bearer ' + token;
    }
    
    startProgress();
    showLoading();
    
    return fetch(url, options).then(response => {
        endProgress();
        hideLoading();
        if (response.status === 401) {
            // Session itself is invalid/expired - back to login.
            sessionStorage.clear();
            window.location.replace('login.html');
        } else if (response.status === 403) {
            // Authenticated, but not allowed to do this (e.g. project not assigned to you).
            // Let the caller's own error handling react to response.ok - don't nuke the session.
            showToast("You don't have access to do that", 'error');
        }
        return response;
    }).catch(err => {
        endProgress();
        hideLoading();
        showToast('Connection error — please check your internet', 'error');
        throw err;
    });
}