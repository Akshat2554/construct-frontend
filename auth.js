(function() {
    if (window.location.pathname.includes('login')) return;
    if (localStorage.getItem('construct-auth') !== 'true') {
        window.location.replace('login.html');
    }
})();