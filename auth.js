(function() {
    if (window.location.pathname.includes('login')) return;
    if (sessionStorage.getItem('construct-auth') !== 'true') {
        window.location.replace('login.html');
    }
})();