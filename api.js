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
        if (response.status === 401 || response.status === 403) {
            sessionStorage.clear();
            window.location.replace('login.html');
        }
        return response;
    }).catch(err => {
        endProgress();
        hideLoading();
        showToast('Connection error — please check your internet', 'error');
        throw err;
    });
}