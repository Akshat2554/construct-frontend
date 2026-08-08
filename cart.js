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

function invalidateCartCache() {
    _cartCache = null;
}

function updateCartCountFromCache() {
    let count = _cartCache ? _cartCache.length : 0;
    let badge = document.getElementById('cart-count');
    if (badge) badge.textContent = count;
}

async function updateCartCount() {
    let cart = await getCart();
    let count = cart.length;
    let badge = document.getElementById('cart-count');
    if (badge) badge.textContent = count;
}

// ===== Activity Logging =====
function logActivity(action, details) {
    let projectId = getProjectId();
    if (!projectId) return;
    let username = sessionStorage.getItem('construct-user') || 'unknown';
    
    fetch(`${API}/api/activity`, {
        method: 'POST',
        headers: authHeaders(),
        body: JSON.stringify({
            projectId: parseInt(projectId),
            username,
            action,
            details: details || '',
            timestamp: new Date().toISOString()
        })
    }); // fire and forget
}

// ===== Cart Operations =====
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
    
    if (_cartCache !== null) {
        let existing = _cartCache.find(i => i.productId === saved.productId);
        if (existing) {
            existing.quantity = saved.quantity;
        } else {
            _cartCache.push(saved);
        }
    }
    updateCartCountFromCache();
    logActivity('BOQ Item Added', `Added ${product.name} (${product.category || 'Unknown category'})`);
    showToast(`${product.name} added to BOQ`, 'success');
}

async function removeFromCart(productId, itemId) {
    let cart = await getCart();
    let item;
    
    if (itemId) {
        item = cart.find(i => i.id === itemId);
    } else {
        item = cart.find(i => i.productId === productId);
    }
    
    if (item) {
        await fetch(`${API}/api/boq/${item.id}`, {
            method: 'DELETE',
            headers: authHeaders()
        });
        if (_cartCache) {
            _cartCache = _cartCache.filter(i => i.id !== item.id);
        }
        logActivity('BOQ Item Removed', `Removed ${item.name} from ${item.category || 'BOQ'}`);
    }
    updateCartCountFromCache();
}

async function updateQuantity(productId, quantity) {
    let cart = await getCart();
    let item = cart.find(i => i.productId === productId);
    if (item) {
        let oldQty = item.quantity;
        item.quantity = parseInt(quantity);
        fetch(`${API}/api/boq/${item.id}`, {
            method: 'PUT',
            headers: authHeaders(),
            body: JSON.stringify(item)
        });
        logActivity('Quantity Changed', `${item.name}: ${oldQty} → ${quantity}`);
    }
}

async function updatePrice(productId, price) {
    let cart = await getCart();
    let item = cart.find(i => i.productId === productId);
    if (item) {
        let oldPrice = item.unitPrice;
        item.unitPrice = parseFloat(price);
        await fetch(`${API}/api/boq/${item.id}`, {
            method: 'PUT',
            headers: authHeaders(),
            body: JSON.stringify(item)
        });
        logActivity('Rate Changed', `${item.name}: ₹${oldPrice} → ₹${price}`);
    }
}

async function updateInstallRate(productId, installRate) {
    let cart = await getCart();
    let item = cart.find(i => i.productId === productId);
    if (item) {
        let oldRate = item.installRate;
        item.installRate = parseFloat(installRate);
        await fetch(`${API}/api/boq/${item.id}`, {
            method: 'PUT',
            headers: authHeaders(),
            body: JSON.stringify(item)
        });
        logActivity('Install Rate Changed', `${item.name}: ₹${oldRate} → ₹${installRate}`);
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
        let newRate = parseFloat(amount) / parseInt(quantity);
        item.unitPrice = newRate;
        await fetch(`${API}/api/boq/${item.id}`, {
            method: 'PUT',
            headers: authHeaders(),
            body: JSON.stringify(item)
        });
        logActivity('Negotiated Rate Set', `${item.name}: supply rate negotiated to ₹${newRate.toFixed(0)}`);
    }
}

async function updateNegotiatedInstall(productId, amount, quantity) {
    let cart = await getCart();
    let item = cart.find(i => i.productId === productId);
    if (item) {
        let newRate = parseFloat(amount) / parseInt(quantity);
        item.installRate = newRate;
        await fetch(`${API}/api/boq/${item.id}`, {
            method: 'PUT',
            headers: authHeaders(),
            body: JSON.stringify(item)
        });
        logActivity('Negotiated Install Rate Set', `${item.name}: install rate negotiated to ₹${newRate.toFixed(0)}`);
    }
}

// ===== Confirmed Categories =====
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
        logActivity('Category Unconfirmed', `${category} marked as unconfirmed`);
    } else {
        await fetch(`${API}/api/confirmed-categories`, {
            method: 'POST',
            headers: authHeaders(),
            body: JSON.stringify({
                projectId: parseInt(projectId),
                categoryName: category
            })
        });
        logActivity('Category Confirmed', `${category} confirmed`);
    }
}

async function isConfirmed(category) {
    let confirmed = await getConfirmed();
    return confirmed.includes(category);
}

// ===== Room Shortlist =====
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
    logActivity('Room Item Added', `${name} added to room shortlist`);
    showToast(`${name} added to room shortlist`, 'success');
}

// ===== Sub Items =====
async function getSubItems(productId, category) {
    let projectId = getProjectId();
    if (!projectId) return [];
    let response = await fetch(`${API}/api/boq-subitems/${projectId}/${productId}?category=${encodeURIComponent(category)}`, {
        headers: authHeaders()
    });
    if (!response.ok) return [];
    return await response.json();
}

async function addSubItem(productId, encodedCategory) {
    let category = decodeURIComponent(encodedCategory);
    let projectId = getProjectId();
    let items = await getSubItems(productId, category);
    await fetch(`${API}/api/boq-subitems`, {
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
        await fetch(`${API}/api/boq-subitems/${items[index].id}`, {
            method: 'DELETE',
            headers: authHeaders()
        });
    }
}

// ===== Version History (kept for compatibility) =====
async function createVersion(label, remarks) {
    let projectId = getProjectId();
    if (!projectId) return;
    
    // Log as activity instead of snapshot
    logActivity(label, remarks || '');
    
    // Also save to versions endpoint for backward compatibility
    let cart = await getCart();
    let confirmed = await getConfirmed();
    
    await fetch(`${API}/api/versions`, {
        method: 'POST',
        headers: authHeaders(),
        body: JSON.stringify({
            projectId: parseInt(projectId),
            timestamp: new Date().toISOString(),
            label: label,
            remarks: remarks || '',
            snapshotJson: JSON.stringify({ cart, confirmed })
        })
    });
}