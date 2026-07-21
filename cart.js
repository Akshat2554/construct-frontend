function getProjectId() {
    return localStorage.getItem('selectedProjectId');
}

function getCart() {
    let projectId = getProjectId();
    if (!projectId) return [];
    return JSON.parse(localStorage.getItem('cart-' + projectId)) || [];
}

function saveCart(cart) {
    let projectId = getProjectId();
    if (!projectId) return;
    localStorage.setItem('cart-' + projectId, JSON.stringify(cart));
}

function addToCart(product) {
    console.log('addToCart called', product.productId); 
    let cart = getCart();
    let existing = cart.find(item => item.productId === product.productId);
    
    if (existing) {
        existing.quantity += 1;
        existing.totalPrice = existing.quantity * existing.unitPrice;
    } else {
        product.quantity = 1;
        product.totalPrice = product.unitPrice;
        product.installRate = 0;
        product.remarks = '';
        product.negotiatedSupplyRate = null;
        product.negotiatedInstallRate = null;
        product.isLongLead = false;
        product.leadWeeks = null;
        cart.push(product);
    }
    
    saveCart(cart);
    updateCartCount();
}

function removeFromCart(productId) {
    let cart = getCart().filter(item => item.productId !== productId);
    saveCart(cart);
    updateCartCount();
}

function updateCartCount() {
    let count = getCart().length;
    let badge = document.getElementById('cart-count');
    if (badge) badge.textContent = count;
}

function updateQuantity(productId, quantity) {
    let cart = getCart();
    let item = cart.find(i => i.productId === productId);
    if (item) {
        item.quantity = parseInt(quantity);
        item.totalPrice = item.quantity * item.unitPrice;
        saveCart(cart);
    }
}

function updatePrice(productId, price) {
    let cart = getCart();
    let item = cart.find(i => i.productId === productId);
    if (item) {
        item.unitPrice = parseFloat(price);
        item.totalPrice = item.quantity * item.unitPrice;
        saveCart(cart);
    }
}

function updateInstallRate(productId, installRate) {
    let cart = getCart();
    let item = cart.find(i => i.productId === productId);
    if (item) {
        item.installRate = parseFloat(installRate);
        saveCart(cart);
    }
}

function updateRemarks(productId, remarks) {
    let cart = getCart();
    let item = cart.find(i => i.productId === productId);
    if (item) {
        item.remarks = remarks;
        saveCart(cart);
    }
}

function updateNegotiatedSupply(productId, amount, quantity) {
    let cart = getCart();
    let item = cart.find(i => i.productId === productId);
    if (item) {
        item.negotiatedSupplyRate = parseFloat(amount) / parseInt(quantity);
        saveCart(cart);
    }
}

function updateNegotiatedInstall(productId, amount, quantity) {
    let cart = getCart();
    let item = cart.find(i => i.productId === productId);
    if (item) {
        item.negotiatedInstallRate = parseFloat(amount) / parseInt(quantity);
        saveCart(cart);
    }
}

function getConfirmed() {
    let projectId = getProjectId();
    if (!projectId) return [];
    return JSON.parse(localStorage.getItem('confirmed-' + projectId)) || [];
}

function toggleConfirmed(category) {
    let confirmed = getConfirmed();
    let projectId = getProjectId();
    if (confirmed.includes(category)) {
        confirmed = confirmed.filter(c => c !== category);
    } else {
        confirmed.push(category);
    }
    localStorage.setItem('confirmed-' + projectId, JSON.stringify(confirmed));
}

function isConfirmed(category) {
    return getConfirmed().includes(category);
}

async function openRoomById(id) {
    let response = await fetch('http://localhost:8081/api/rooms/single/' + id);
    let room = await response.json();
    openRoomDetail(room);
}

function addToRoomShortlist(productId, name, price, unit, roomId) {
    productId = parseInt(productId);
    console.log('addToRoomShortlist START, cart length:', getCart().length);
    let categoryName = localStorage.getItem('selectedCategoryName') || 'Other';
    let cart = getCart();
    let existing = cart.find(item => item.productId === productId && item.roomId === parseInt(roomId));
    console.log('existing found:', existing);
    if (existing) {
        existing.quantity += 1;
        existing.totalPrice = existing.quantity * existing.unitPrice;
        if (!existing.roomId) existing.roomId = parseInt(roomId);
    } else {
        cart.push({
            productId,
            name,
            unit,
            unitPrice: price,
            quantity: 1,
            totalPrice: price,
            installRate: 0,
            remarks: '',
            negotiatedSupplyRate: null,
            negotiatedInstallRate: null,
            roomId: parseInt(roomId),
            category: categoryName
        });
    }
    saveCart(cart);
    console.log('addToRoomShortlist END, cart length:', getCart().length);
    updateCartCount();
    alert(name + ' added to BOQ and room shortlist');
}

function createVersion(label, remarks) {
    let projectId = getProjectId();
    if (!projectId) return;
    
    let versions = JSON.parse(localStorage.getItem('versions-' + projectId)) || [];
    let snapshot = {
        cart: getCart(),
        confirmed: getConfirmed(),
        vendorShortlist: JSON.parse(localStorage.getItem('shortlist-' + projectId)) || []
    };
    
    versions.unshift({
        id: Date.now(),
        timestamp: new Date().toISOString(),
        label: label,
        remarks: remarks || '',
        snapshot: snapshot
    });

    versions = versions.slice(0, 20);
    localStorage.setItem('versions-' + projectId, JSON.stringify(versions));
}

