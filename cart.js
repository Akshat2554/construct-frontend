const API = 'https://construct-backend-production.up.railway.app';

function getProjectId() {
    return localStorage.getItem('selectedProjectId');
}

function getToken() {
    return sessionStorage.getItem('construct-token');
}

function authHeaders() {
    return {
        'Content-Type': 'application/json',
        'Authorization': 'Bearer ' + getToken()
    };
}

let _cartCache = null;
let _cartCacheTime = 0;

async function getCart() {
    let now = Date.now();
    if (_cartCache && (now - _cartCacheTime) < 5000) {
        return _cartCache; // use cache if less than 5 seconds old
    }
    let projectId = getProjectId();
    if (!projectId) return [];
    let response = await fetch(`${API}/api/boq/${projectId}`, {
        headers: authHeaders()
    });
    if (!response.ok) return [];
    _cartCache = await response.json();
    _cartCacheTime = now;
    return _cartCache;
}

function invalidateCartCache() {
    _cartCache = null;
}


async function addToCart(product) {
    let projectId = getProjectId();
    if (!projectId) { alert('Please select a project first'); return; }
    
    console.log('addToCart called, projectId:', projectId);
    console.log('token:', getToken());
    
    let response = await fetch(`${API}/api/boq`, {
        method: 'POST',
        headers: authHeaders(),
        body: JSON.stringify({
            projectId: parseInt(projectId),
            productId: product.productId,
            name: product.name,
            productNumber: product.productNumber || '',
            supplierName: product.supplierName || '',
            category: product.category || '',
            unit: product.unit || '',
            unitPrice: product.unitPrice || 0,
            quantity: 1,
            installRate: 0,
            remarks: '',
            roomId: product.roomId || null
        })
    });
    
    console.log('response status:', response.status);
    let data = await response.text();
    console.log('response body:', data);
    
    updateCartCount();
}

async function removeFromCart(productId) {
    invalidateCartCache();
    let cart = await getCart();
    let item = cart.find(i => i.productId === productId);
    if (item) {
        await fetch(`${API}/api/boq/${item.id}`, {
            method: 'DELETE',
            headers: authHeaders()
        });
    }
    updateCartCount();
}

async function updateCartCount() {
    let cart = await getCart();
    let count = cart.length;
    let badge = document.getElementById('cart-count');
    if (badge) badge.textContent = count;
}

function updateCartCountFromCache() {
    let count = _cartCache ? _cartCache.length : 0;
    let badge = document.getElementById('cart-count');
    if (badge) badge.textContent = count;
}

async function updateQuantity(productId, quantity) {
    invalidateCartCache();
    let cart = await getCart();
    let item = cart.find(i => i.productId === productId);
    if (item) {
        item.quantity = parseInt(quantity);
        item.totalPrice = item.quantity * item.unitPrice;
        await fetch(`${API}/api/boq/${item.id}`, {
            method: 'PUT',
            headers: authHeaders(),
            body: JSON.stringify(item)
        });
    }
}

async function updatePrice(productId, price) {
    let cart = await getCart();
    let item = cart.find(i => i.productId === productId);
    if (item) {
        item.unitPrice = parseFloat(price);
        await fetch(`${API}/api/boq/${item.id}`, {
            method: 'PUT',
            headers: authHeaders(),
            body: JSON.stringify(item)
        });
    }
}

async function updateInstallRate(productId, installRate) {
    invalidateCartCache();
    let cart = await getCart();
    let item = cart.find(i => i.productId === productId);
    if (item) {
        item.installRate = parseFloat(installRate);
        await fetch(`${API}/api/boq/${item.id}`, {
            method: 'PUT',
            headers: authHeaders(),
            body: JSON.stringify(item)
        });
    }
}

async function updateRemarks(productId, remarks) {
    invalidateCartCache();
    let cart = await getCart();
    let item = cart.find(i => i.productId === productId);
    if (item) {
        item.remarks = remarks;
        await fetch(`${API}/api/boq/${item.id}`, {
            method: 'PUT',
            headers: authHeaders(),
            body: JSON.stringify(item)
        });
    }
}

async function updateNegotiatedSupply(productId, amount, quantity) {
    let cart = await getCart();
    let item = cart.find(i => i.productId === productId);
    if (item) {
        item.unitPrice = parseFloat(amount) / parseInt(quantity);
        await fetch(`${API}/api/boq/${item.id}`, {
            method: 'PUT',
            headers: authHeaders(),
            body: JSON.stringify(item)
        });
    }
}

async function updateNegotiatedInstall(productId, amount, quantity) {
    let cart = await getCart();
    let item = cart.find(i => i.productId === productId);
    if (item) {
        item.installRate = parseFloat(amount) / parseInt(quantity);
        await fetch(`${API}/api/boq/${item.id}`, {
            method: 'PUT',
            headers: authHeaders(),
            body: JSON.stringify(item)
        });
    }
}

async function getConfirmed() {
    let projectId = getProjectId();
    if (!projectId) return [];
    let response = await fetch(`${API}/api/confirmed-categories/${projectId}`, {
        headers: authHeaders()
    });
    if (!response.ok) return [];
    let items = await response.json();
    return items.map(i => i.categoryName);
}

async function toggleConfirmed(category) {
    let projectId = getProjectId();
    let confirmed = await getConfirmed();
    
    if (confirmed.includes(category)) {
        // Find and delete
        let response = await fetch(`${API}/api/confirmed-categories/${projectId}`, {
            headers: authHeaders()
        });
        let items = await response.json();
        let item = items.find(i => i.categoryName === category);
        if (item) {
            await fetch(`${API}/api/confirmed-categories/${item.id}`, {
                method: 'DELETE',
                headers: authHeaders()
            });
        }
    } else {
        await fetch(`${API}/api/confirmed-categories`, {
            method: 'POST',
            headers: authHeaders(),
            body: JSON.stringify({
                projectId: parseInt(projectId),
                categoryName: category
            })
        });
    }
}

async function isConfirmed(category) {
    let confirmed = await getConfirmed();
    return confirmed.includes(category);
}

async function addToRoomShortlist(productId, name, price, unit, roomId) {
    let projectId = getProjectId();
    if (!projectId) return;
    let categoryName = localStorage.getItem('selectedCategoryName') || 'Other';
    
    await fetch(`${API}/api/boq`, {
        method: 'POST',
        headers: authHeaders(),
        body: JSON.stringify({
            projectId: parseInt(projectId),
            productId: parseInt(productId),
            name,
            unit,
            unitPrice: price,
            quantity: 1,
            installRate: 0,
            remarks: '',
            category: categoryName,
            roomId: parseInt(roomId)
        })
    });
    updateCartCount();
    alert(name + ' added to BOQ and room shortlist');
}

async function createVersion(label, remarks) {
    // Version history stays in localStorage for now
    let projectId = getProjectId();
    if (!projectId) return;
    
    let versions = JSON.parse(localStorage.getItem('versions-' + projectId)) || [];
    let cart = await getCart();
    let confirmed = await getConfirmed();
    
    let snapshot = {
        cart,
        confirmed,
        vendorShortlist: []
    };
    
    versions.unshift({
        id: Date.now(),
        timestamp: new Date().toISOString(),
        label,
        remarks: remarks || '',
        snapshot
    });
    
    versions = versions.slice(0, 20);
    localStorage.setItem('versions-' + projectId, JSON.stringify(versions));
}