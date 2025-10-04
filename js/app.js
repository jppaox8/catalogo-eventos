let allEvents = [];
let currentView = 'grid';

document.addEventListener('DOMContentLoaded', () => {
    fetch('./data/events.json')
        .then(response => response.json())
        .then(data => {
            allEvents = data;
            renderEvents(allEvents);
        })
        .catch(error => console.error('Error loading events:', error));

    document.getElementById('search').addEventListener('input', onSearch);
    document.getElementById('toggle-view').addEventListener('click', toggleView);
    document.getElementById('clear-filters').addEventListener('click', clearFilters);
});

function renderEvents(events) {
    const container = document.getElementById('events-container');
    const noResults = document.getElementById('no-results');
    container.innerHTML = '';

    if (!events.length) {
        container.style.display = 'none';
        noResults.style.display = 'block';
        return;
    } else {
        container.style.display = 'grid';
        noResults.style.display = 'none';
    }

    events.forEach(event => {
        const card = document.createElement('div');
        card.className = 'event-card';

        const imgSrc = event.images && event.images.length
            ? `./imagenes/${event.images[0]}`
            : 'https://via.placeholder.com/400x200?text=Evento';
        const soldOut = event.sale_status && event.sale_status.toLowerCase() === 'agotado';

        card.innerHTML = `
            <img src="${imgSrc}" alt="${event.title}">
            ${soldOut ? `<span class="sold-out">Sold Out</span>` : ''}
            <div class="category">${event.category}</div>
            <h3>${event.title}</h3>
            <div class="venue">${event.venue} - <b>${event.city}</b></div>
            <div class="date">${formatDate(event.date_time)}</div>
            <div class="price">S/ ${event.price}</div>
            <button ${soldOut ? 'disabled' : ''} onclick="viewDetail(${event.id})">Ver detalle</button>
        `;
        container.appendChild(card);
    });

    container.className = currentView === 'grid' ? 'event-list' : 'event-list list-view';
}

function formatDate(dateStr) {
    const d = new Date(dateStr);
    return d.toLocaleString('es-PE', { dateStyle: 'medium', timeStyle: 'short' });
}

function onSearch(e) {
    const q = e.target.value.toLowerCase();
    const filtered = allEvents.filter(ev =>
        ev.title.toLowerCase().includes(q) ||
        (ev.artists && ev.artists.join(' ').toLowerCase().includes(q)) ||
        (ev.city && ev.city.toLowerCase().includes(q))
    );
    renderEvents(filtered);
}

function toggleView() {
    currentView = currentView === 'grid' ? 'list' : 'grid';
    document.getElementById('toggle-view').textContent = `Vista: ${currentView === 'grid' ? 'Grid' : 'Lista'}`;
    renderEvents(allEvents);
}

function clearFilters() {
    document.getElementById('search').value = '';
    renderEvents(allEvents);
}

function viewDetail(id) {
    const event = allEvents.find(ev => ev.id === id);
    if (!event) return;

    const modal = document.getElementById('event-modal');
    const modalContent = document.getElementById('modal-content');

    const mainImg = event.images && event.images.length
        ? `<img src="./imagenes/${event.images[0]}" alt="${event.title}" style="width:100%;max-width:350px;border-radius:10px;">`
        : `<img src="https://via.placeholder.com/350x400?text=Evento" alt="${event.title}" style="width:100%;max-width:350px;border-radius:10px;">`;

    let gallery = '';
    if (event.images && event.images.length > 1) {
        gallery = `<div style="display:flex;gap:8px;margin-top:10px;">` +
            event.images.map(img =>
                `<img src="./imagenes/${img}" alt="" style="width:60px;height:60px;object-fit:cover;border-radius:6px;">`
            ).join('') +
            `</div>`;
    }

    // Usa el iframe de Google Maps proporcionado
    const mapIframe = `<iframe src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3215.466805926328!2d-77.08220322586267!3d-12.096409842825182!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x9105c98be9bc4923%3A0x5a356bfdbfe20a58!2sCosta%2021!5e1!3m2!1ses-419!2spe!4v1759607467560!5m2!1ses-419!2spe" width="100%" height="220" style="border:0;border-radius:8px;" allowfullscreen="" loading="lazy" referrerpolicy="no-referrer-when-downgrade"></iframe>`;

    const soldOut = event.sale_status && event.sale_status.toLowerCase() === 'agotado';

    modalContent.innerHTML = `
        <div style="flex:1;min-width:320px;">
            ${mainImg}
            ${gallery}
        </div>
        <div style="flex:2;min-width:250px;">
            <h2>${event.title}</h2>
            <span class="category">${event.category}</span>
            <p>${event.artists ? event.artists.join(', ') : ''}</p>
            <p>${event.venue} - ${event.city}</p>
            <p><b>${formatDate(event.date_time)}</b> ${soldOut ? '<span style="color:#e74c3c;font-weight:bold;">SOLD OUT</span>' : ''}</p>
            <p>${event.policies ? `<b>Políticas:</b> ${event.policies}` : ''}</p>
            <div style="margin:1rem 0;">
                ${mapIframe}
            </div>
            <div style="display:flex;gap:1rem;align-items:center;margin-bottom:1rem;">
                <button class="fav-btn" onclick="toggleFavorite(${event.id})">❤️ Favorito</button>
                <button onclick="copyEventUrl(${event.id})">🔗 Compartir</button>
            </div>
            <div style="display:flex;align-items:center;gap:0.5rem;">
                <input type="number" id="qty-${event.id}" min="1" max="${event.stock}" value="1" style="width:60px;">
                <button onclick="addToCart(${event.id})" ${soldOut ? 'disabled' : ''}>Agregar al carrito</button>
            </div>
        </div>
    `;

    modal.style.display = 'flex';
}

document.addEventListener('DOMContentLoaded', () => {
    document.getElementById('modal-close').onclick = () => {
        document.getElementById('event-modal').style.display = 'none';
    };
    document.getElementById('event-modal').onclick = (e) => {
        if (e.target.id === 'event-modal') {
            document.getElementById('event-modal').style.display = 'none';
        }
    };
});

function copyEventUrl(id) {
    const url = `${location.origin}${location.pathname}#event-${id}`;
    navigator.clipboard.writeText(url);
    alert('¡Enlace copiado!');
}

function toggleFavorite(id) {
    alert('Favorito simulado para el evento ' + id);
}

function addToCart(id) {
    const qty = parseInt(document.getElementById(`qty-${id}`).value, 10);
    alert(`Agregado ${qty} al carrito (simulado)`);
}
function getCart() {
    return JSON.parse(localStorage.getItem('cart')) || [];
}

function saveCart(cart) {
    localStorage.setItem('cart', JSON.stringify(cart));
}

function addToCart(id) {
    const event = allEvents.find(ev => ev.id === id);
    if (!event) return;
    const qtyInput = document.getElementById(`qty-${event.id}`);
    const qty = qtyInput ? parseInt(qtyInput.value, 10) : 1;
    if (qty < 1) return alert('Cantidad inválida');
    if (qty > event.stock) return alert('No hay suficiente stock');

    let cart = getCart();
    const idx = cart.findIndex(item => item.id === id);
    if (idx > -1) {
        if (cart[idx].qty + qty > event.stock) return alert('No hay suficiente stock');
        cart[idx].qty += qty;
    } else {
        cart.push({ id, qty });
    }
    saveCart(cart);
    alert('Agregado al carrito');
    updateCartBtn();
}

function updateCartBtn() {
    const cart = getCart();
    const btn = document.querySelector('.btn .cart-ico')?.parentElement;
    if (btn) {
        const total = cart.reduce((sum, item) => sum + item.qty, 0);
        btn.innerHTML = `<span class="cart-ico">🛒</span> Carrito${total ? ` (${total})` : ''}`;
    }
}

// Mostrar modal carrito
document.addEventListener('DOMContentLoaded', () => {
    updateCartBtn();
    document.querySelectorAll('.btn').forEach(btn => {
        if (btn.textContent.includes('Carrito')) {
            btn.onclick = showCart;
        }
    });
    document.getElementById('cart-close').onclick = () => {
        document.getElementById('cart-modal').style.display = 'none';
    };
    document.getElementById('cart-modal').onclick = (e) => {
        if (e.target.id === 'cart-modal') {
            document.getElementById('cart-modal').style.display = 'none';
        }
    };
});

function showCart() {
    const cart = getCart();
    const cartContent = document.getElementById('cart-content');
    if (!cart.length) {
        cartContent.innerHTML = `<h2>Carrito</h2><p>Tu carrito está vacío.</p>`;
    } else {
        let total = 0;
        cartContent.innerHTML = `<h2>Carrito</h2>
        <table style="width:100%;margin-bottom:1rem;">
            <thead>
                <tr>
                    <th>Evento</th>
                    <th>Cantidad</th>
                    <th>Precio</th>
                    <th>Subtotal</th>
                    <th></th>
                </tr>
            </thead>
            <tbody>
                ${cart.map(item => {
                    const ev = allEvents.find(e => e.id === item.id);
                    const subtotal = ev.price * item.qty;
                    total += subtotal;
                    return `<tr>
                        <td>${ev.title}</td>
                        <td>
                            <input type="number" min="1" max="${ev.stock}" value="${item.qty}" style="width:50px;" onchange="changeCartQty(${ev.id}, this.value)">
                        </td>
                        <td>S/ ${ev.price}</td>
                        <td>S/ ${subtotal}</td>
                        <td><button onclick="removeFromCart(${ev.id})">❌</button></td>
                    </tr>`;
                }).join('')}
            </tbody>
        </table>
        <div style="text-align:right;font-weight:bold;">Total: S/ ${total}</div>
        <button onclick="checkoutCart()" class="btn primary" style="margin-top:1rem;">Finalizar compra</button>
        `;
    }
    document.getElementById('cart-modal').style.display = 'flex';
}

window.changeCartQty = function(id, value) {
    let cart = getCart();
    const idx = cart.findIndex(item => item.id === id);
    if (idx > -1) {
        const ev = allEvents.find(e => e.id === id);
        let qty = parseInt(value, 10);
        if (qty < 1) qty = 1;
        if (qty > ev.stock) qty = ev.stock;
        cart[idx].qty = qty;
        saveCart(cart);
        showCart();
        updateCartBtn();
    }
};

window.removeFromCart = function(id) {
    let cart = getCart().filter(item => item.id !== id);
    saveCart(cart);
    showCart();
    updateCartBtn();
};

window.checkoutCart = function() {
    alert('Compra simulada. ¡Gracias por tu compra!');
    saveCart([]);
    showCart();
    updateCartBtn();
};
