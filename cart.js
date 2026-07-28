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

async function getCart() {
    if (_cartCache !== null) return _cartCache;
    let projectId = getProjectId();
    if (!projectId) return [];
    let response = await fetch(`${API}/api/boq/${projectId}`, {
        headers: authHeaders()
    });
    if (!response.ok) return [];
    _cartCache = await response.json();
    return _cartCache;
}

function updateCartCountFromCache() {
    let count = _cartCache ? _cartCache.length : 0;
    let badge = document.getElementById('cart-count');
    if (badge) badge.textContent = count;
}

let _cartCache = null;
let _cartCacheTime = 0;

async function addToCart(product) {
    let projectId = getProjectId();
    if (!projectId) { alert('Please select a project first'); return; }
    
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
    let saved = await response.json();
    
    // Update cache directly instead of invalidating
    if (_cartCache !== null) {
        let existing = _cartCache.find(i => i.productId === saved.productId);
        if (existing) {
            existing.quantity = saved.quantity;
        } else {
            _cartCache.push(saved);
        }
    }
    updateCartCountFromCache();
}

function invalidateCartCache() {
    _cartCache = null;
}

async function removeFromCart(productId) {
    let cart = await getCart();
    let item = cart.find(i => i.productId === productId);
    if (item) {
        await fetch(`${API}/api/boq/${item.id}`, {
            method: 'DELETE',
            headers: authHeaders()
        });
        // Update cache directly
        if (_cartCache !== null) {
            _cartCache = _cartCache.filter(i => i.productId !== productId);
        }
    }
    updateCartCountFromCache();
}

async function updateCartCount() {
    let cart = await getCart();
    let count = cart.length;
    let badge = document.getElementById('cart-count');
    if (badge) badge.textContent = count;
}

async function updateQuantity(productId, quantity) {
    let cart = await getCart();
    let item = cart.find(i => i.productId === productId);
    if (item) {
        item.quantity = parseInt(quantity);
        // Update API in background
        fetch(`${API}/api/boq/${item.id}`, {
            method: 'PUT',
            headers: authHeaders(),
            body: JSON.stringify(item)
        });
        // Cache already updated since item is a reference
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
    updateCartCountFromCache();
    alert(name + ' added to BOQ and room shortlist');
}

async function getSubItems(productId, category) {
    let projectId = getProjectId();
    if (!projectId) return [];
    let response = await fetch(`https://construct-backend-production.up.railway.app/api/boq-subitems/${projectId}/${productId}?category=${encodeURIComponent(category)}`, {
        headers: authHeaders()
    });
    if (!response.ok) return [];
    return await response.json();
}

async function addSubItem(productId, encodedCategory) {
    let category = decodeURIComponent(encodedCategory);
    let projectId = getProjectId();
    let items = await getSubItems(productId, category);
    await fetch('https://construct-backend-production.up.railway.app/api/boq-subitems', {
        method: 'POST',
        headers: authHeaders(),
        body: JSON.stringify({
            projectId: parseInt(projectId),
            productId: parseInt(productId),
            category,
            sortOrder: items.length,
            text: ''
        })
    });
}

async function updateSubItem(productId, encodedCategory, index, value) {
    let category = decodeURIComponent(encodedCategory);
    let items = await getSubItems(productId, category);
    if (items[index]) {
        await fetch(`${API}/api/boq-subitems/${items[index].id}`, {
            method: 'PUT',
            headers: authHeaders(),
            body: JSON.stringify({ ...items[index], text: value })
        });
    }
}

async function removeSubItem(productId, encodedCategory, index) {
    let category = decodeURIComponent(encodedCategory);
    let items = await getSubItems(productId, category);
    if (items[index]) {
        await fetch(`https://construct-backend-production.up.railway.app/api/boq-subitems/${items[index].id}`, {
            method: 'DELETE',
            headers: authHeaders()
        });
    }
}

async function createVersion(label, remarks) {
    let projectId = getProjectId();
    if (!projectId) return;
    
    let cart = await getCart();
    let confirmed = await getConfirmed();
    
    let snapshot = {
        cart,
        confirmed,
        vendorShortlist: []
    };
    
    await fetch('https://construct-backend-production.up.railway.app/api/versions', {
        method: 'POST',
        headers: authHeaders(),
        body: JSON.stringify({
            projectId: parseInt(projectId),
            timestamp: new Date().toISOString(),
            label: label,
            remarks: remarks || '',
            snapshotJson: JSON.stringify(snapshot)
        })
    });
}