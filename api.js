function authFetch(url, options = {}) {
    let token = sessionStorage.getItem('construct-token');
    options.headers = options.headers || {};
    if (token) {
        options.headers['Authorization'] = 'Bearer ' + token;
    }
    
    startProgress();
    
    return fetch(url, options).then(response => {
        endProgress();
        if (response.status === 401 || response.status === 403) {
            //sessionStorage.clear();
            //window.location.replace('login.html');
        }
        return response;
    }).catch(err => {
        endProgress();
        showToast('Connection error — please check your internet', 'error');
        throw err;
    });
}