// --- ELEMENTOS DO DOM ---
const loginBtn = document.getElementById('loginBtn');
const loginModal = document.getElementById('loginModal');
const loginForm = document.getElementById('loginForm');
const registerBtn = document.getElementById('registerBtn');
const registerModal = document.getElementById('registerModal');
const registerForm = document.getElementById('registerForm');
const closeButtons = document.querySelectorAll('.close-button');
const switchToRegisterLink = document.getElementById('switchToRegister');
const switchToLoginLink = document.getElementById('switchToLogin');

// Usuário
const authButtonsContainer = document.getElementById('auth-buttons-container');
const userLoggedContainer = document.getElementById('user-logged-container');
const userDropdown = document.getElementById('userDropdown');
const btnLogout = document.getElementById('btnLogout');
const btnProfile = document.getElementById('btnProfile');
const profileModal = document.getElementById('profileModal');
const profileEmailSpan = document.getElementById('profileEmail');
const closeProfileModal = document.getElementById('closeProfileModal');

// API URL (Backend)
const API_URL = 'http://localhost:3000/api';

// --- FUNÇÕES DE MODAL ---
const closeAllModals = () => {
    if (loginModal) loginModal.style.display = 'none';
    if (registerModal) registerModal.style.display = 'none';
    if (profileModal) profileModal.style.display = 'none';
};

if (loginBtn) loginBtn.addEventListener('click', () => { closeAllModals(); loginModal.style.display = 'block'; });
if (registerBtn) registerBtn.addEventListener('click', () => { closeAllModals(); registerModal.style.display = 'block'; });

if(closeButtons) closeButtons.forEach(button => button.addEventListener('click', closeAllModals));
window.addEventListener('click', (event) => {
    if (event.target === loginModal || event.target === registerModal || event.target === profileModal) closeAllModals();
});

if (switchToRegisterLink) switchToRegisterLink.addEventListener('click', (e) => { e.preventDefault(); closeAllModals(); registerModal.style.display = 'block'; });
if (switchToLoginLink) switchToLoginLink.addEventListener('click', (e) => { e.preventDefault(); closeAllModals(); loginModal.style.display = 'block'; });

// --- LOGIN STATE ---
function checkLoginState() {
    let user = null;
    try { user = JSON.parse(localStorage.getItem('nexfitUser')); } catch (e) {}

    if (authButtonsContainer && userLoggedContainer) {
        if (user) {
            authButtonsContainer.style.display = 'none';
            userLoggedContainer.style.display = 'flex';
        } else {
            authButtonsContainer.style.display = 'flex';
            userLoggedContainer.style.display = 'none';
        }
    }
}

if (userLoggedContainer) {
    userLoggedContainer.addEventListener('click', (e) => { e.stopPropagation(); userDropdown.classList.toggle('show'); });
    window.addEventListener('click', () => { if (userDropdown.classList.contains('show')) userDropdown.classList.remove('show'); });
}

if (btnLogout) {
    btnLogout.addEventListener('click', (e) => {
        e.preventDefault();
        localStorage.removeItem('nexfitUser');
        checkLoginState();
        window.location.reload();
    });
}

if (btnProfile) {
    btnProfile.addEventListener('click', (e) => {
        e.preventDefault();
        const user = JSON.parse(localStorage.getItem('nexfitUser'));
        if (user && profileEmailSpan) {
            profileEmailSpan.textContent = user.email;
            closeAllModals();
            profileModal.style.display = 'block';
        }
    });
}
if (closeProfileModal) closeProfileModal.addEventListener('click', () => { if(profileModal) profileModal.style.display = 'none'; });

// --- TEMA ESCURO ---
const themeToggleBtn = document.getElementById('themeToggle');
const body = document.body;
const currentTheme = localStorage.getItem('theme');
if (currentTheme === 'dark') { body.classList.add('dark-mode'); if(themeToggleBtn) themeToggleBtn.textContent = '☀️'; }
if (themeToggleBtn) {
    themeToggleBtn.addEventListener('click', () => {
        body.classList.toggle('dark-mode');
        if (body.classList.contains('dark-mode')) { localStorage.setItem('theme', 'dark'); themeToggleBtn.textContent = '☀️'; }
        else { localStorage.setItem('theme', 'light'); themeToggleBtn.textContent = '🌙'; }
    });
}

// --- API LOGIN/REGISTER ---
if (registerForm) {
    registerForm.addEventListener('submit', async (event) => {
        event.preventDefault();
        const email = document.getElementById('registerEmail').value;
        const password = document.getElementById('registerPassword').value;
        const confirmPassword = document.getElementById('confirmPassword').value;
        if (password !== confirmPassword) { alert('As senhas não coincidem!'); return; }
        try {
            const response = await fetch(`${API_URL}/register`, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ email, password }) });
            const data = await response.json();
            if (response.ok) { alert(data.message); closeAllModals(); } else { throw new Error(data.message); }
        } catch (error) { alert('Falha: ' + error.message); }
    });
}

if (loginForm) {
    loginForm.addEventListener('submit', async (event) => {
        event.preventDefault();
        const email = document.getElementById('loginEmail').value;
        const password = document.getElementById('loginPassword').value;
        try {
            const response = await fetch(`${API_URL}/login`, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ email, password }) });
            const data = await response.json();
            if (response.ok) {
                alert(data.message);
                localStorage.setItem('nexfitUser', JSON.stringify(data.user));
                closeAllModals();
                checkLoginState();
            } else { throw new Error(data.message); }
        } catch (error) { alert('Falha: ' + error.message); }
    });
}

// --- CARRINHO ---
function addToCart(product) {
    const sizeEl = document.querySelector('.size-button.active');
    const colorEl = document.querySelector('.color-button.active');
    const itemToAdd = {
        id: product.id,
        nome: product.nome,
        preco: product.preco,
        imagemUrl: document.getElementById('product-image') ? document.getElementById('product-image').src : '',
        tamanho: sizeEl ? sizeEl.textContent : null,
        cor: colorEl ? colorEl.textContent : 'Única',
        cartItemId: `item-${Date.now()}`
    };
    let cart = JSON.parse(localStorage.getItem('nexfitCart')) || [];
    cart.push(itemToAdd);
    localStorage.setItem('nexfitCart', JSON.stringify(cart));
    alert(`${itemToAdd.nome} foi adicionado ao carrinho!`);
}

function removeFromCart(cartItemId) {
    let cart = JSON.parse(localStorage.getItem('nexfitCart')) || [];
    cart = cart.filter(item => item.cartItemId !== cartItemId);
    localStorage.setItem('nexfitCart', JSON.stringify(cart));
    displayCart();
}

function displayCart() {
    const cartContainer = document.getElementById('cart-items-container');
    const summaryContainer = document.getElementById('cart-summary');
    if (!cartContainer) return;
    
    const cart = JSON.parse(localStorage.getItem('nexfitCart')) || [];
    cartContainer.innerHTML = '';
    if(summaryContainer) summaryContainer.innerHTML = '';

    if (cart.length === 0) {
        cartContainer.innerHTML = '<p class="cart-empty-message">Seu carrinho está vazio.</p>';
        return;
    }

    let subtotal = 0;
    cart.forEach(item => {
        let options = `Cor: ${item.cor}`;
        if (item.tamanho) options += ` | Tamanho: ${item.tamanho}`;
        const itemHTML = `
            <div class="cart-item">
                <img src="${item.imagemUrl}" alt="${item.nome}" class="cart-item-image">
                <div class="cart-item-details">
                    <p class="cart-item-name">${item.nome}</p>
                    <p class="cart-item-options">${options}</p>
                    <p class="cart-item-price">R$${item.preco}</p>
                </div>
                <button class="remove-from-cart-btn" data-item-id="${item.cartItemId}">Remover</button>
            </div>`;
        cartContainer.innerHTML += itemHTML;
        const price = parseFloat(item.preco.replace(',', '.'));
        if (!isNaN(price)) subtotal += price;
    });

    if(summaryContainer) {
        summaryContainer.innerHTML = `
            <div class="cart-total">
                <p>Subtotal: <strong>R$${subtotal.toFixed(2).replace('.', ',')}</strong></p>
                <button class="checkout-button">Finalizar Compra</button>
            </div>`;
    }

    document.querySelectorAll('.remove-from-cart-btn').forEach(button => {
        button.addEventListener('click', (event) => removeFromCart(event.target.dataset.itemId));
    });
}

// --- CARREGAMENTO DE PRODUTOS ---

async function loadProducts() {
    if (!document.getElementById('grid-academia')) return;

    try {
        const response = await fetch(`${API_URL}/products`);
        if (!response.ok) throw new Error('Falha ao buscar produtos');
        const products = await response.json();
        
        const containers = {
            academia: document.getElementById('grid-academia'),
            termicas: document.getElementById('grid-termicas'),
            acessorios: document.getElementById('grid-acessorios'),
            equipamentos: document.getElementById('grid-equipamentos'),
            suplementos: document.getElementById('grid-suplementos')
        };
        
        products.forEach(product => {
            let imageUrl = 'imagens/placeholder.png';
            if (product.imagemUrl && product.imagemUrl.trim() !== '') imageUrl = product.imagemUrl;
            else if (product.cores && product.cores.length > 0) imageUrl = product.cores[0].imagemUrl;

            // *** MUDANÇA IMPORTANTE: Link genérico com ID ***
            const link = `produto.html?id=${product.id}`;

            const productCardHTML = `
                <a href="${link}" class="product-card">
                    <div>
                        <img src="${imageUrl}" alt="${product.nome}" onerror="this.src='imagens/placeholder.png'">
                        <p class="product-name">${product.nome}</p>
                    </div>
                    <p class="product-price">R$${product.preco}</p>
                </a>`;

            let categoriaChave = '';
            if (product.subcategoria) categoriaChave = product.subcategoria.toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "");
            else if (product.categoria) categoriaChave = product.categoria.toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "");

            const targetContainer = containers[categoriaChave];
            if (targetContainer) targetContainer.innerHTML += productCardHTML;
        });
    } catch (error) { console.error("Erro ao carregar produtos:", error); }
}

// --- DETALHES DO PRODUTO (PÁGINA GENÉRICA) ---
async function loadProductDetails() {
    // 1. Pega o ID da URL (ex: produto.html?id=123)
    const urlParams = new URLSearchParams(window.location.search);
    const productId = parseInt(urlParams.get('id'));

    if (isNaN(productId)) return; // Se não tem ID, não faz nada

    const productImage = document.getElementById('product-image');
    const nameEl = document.getElementById('product-name');
    const priceEl = document.getElementById('product-price');
    const colorContainer = document.getElementById('color-options-container');
    const addToCartButton = document.getElementById('add-to-cart-btn');
    const breadcrumbCategory = document.getElementById('breadcrumb-category');

    try {
        // Busca TODOS os produtos para encontrar o certo (poderia ser uma rota /products/:id no futuro)
        const response = await fetch(`${API_URL}/products`);
        const products = await response.json();
        const product = products.find(p => p.id === productId);

        if (!product) {
            alert('Produto não encontrado!');
            return;
        }

        // PREENCHE A TELA
        if (nameEl) nameEl.textContent = product.nome;
        if (priceEl) priceEl.textContent = `R$${product.preco}`;
        if (breadcrumbCategory) breadcrumbCategory.textContent = product.categoria;

        // Imagem Principal
        let mainImg = 'imagens/placeholder.png';
        if (product.imagemUrl) mainImg = product.imagemUrl;
        else if (product.cores && product.cores.length > 0) mainImg = product.cores[0].imagemUrl;
        
        if (productImage) {
            productImage.src = mainImg;
            productImage.onerror = () => { productImage.src = 'imagens/placeholder.png'; };
        }

        // Cores (Se houver)
        if (colorContainer) {
            colorContainer.innerHTML = '';
            if (product.cores && product.cores.length > 0) {
                product.cores.forEach((cor, index) => {
                    const colorButton = document.createElement('button');
                    colorButton.className = 'color-button';
                    colorButton.textContent = cor.nome;
                    if (index === 0) colorButton.classList.add('active');

                    colorButton.addEventListener('click', () => {
                        productImage.src = cor.imagemUrl;
                        document.querySelectorAll('.color-button').forEach(btn => btn.classList.remove('active'));
                        colorButton.classList.add('active');
                    });
                    colorContainer.appendChild(colorButton);
                });
            } else {
                // Se não tiver cores, cria um botão "Única" ou esconde
                colorContainer.innerHTML = '<span style="font-size:0.9em; color:#666;">Padrão</span>';
            }
        }

        if (addToCartButton) {
            // Remove listeners antigos cloning o botão
            const newBtn = addToCartButton.cloneNode(true);
            addToCartButton.parentNode.replaceChild(newBtn, addToCartButton);
            newBtn.addEventListener('click', () => addToCart(product));
        }

    } catch (error) {
        console.error("Erro detalhes produto:", error);
    }
}

function setupSizeSelection() {
    const sizeButtons = document.querySelectorAll('.size-button');
    sizeButtons.forEach(button => {
        button.addEventListener('click', () => {
            sizeButtons.forEach(btn => btn.classList.remove('active'));
            button.classList.add('active');
        });
    });
}

// --- INICIALIZAÇÃO ---
document.addEventListener('DOMContentLoaded', () => {
    checkLoginState();

    const path = window.location.pathname.split('/').pop();

    if (path.includes('produtos.html') || path === '') {
        loadProducts();
    }
    else if (path.includes('carrinho.html')) {
        displayCart();
    }
    // Verifica se estamos na página genérica
    else if (path.includes('produto.html')) {
        loadProductDetails();
        setupSizeSelection();
    }
    
    // Adiciona link carrinho
    const mainNavUl = document.querySelector('.main-navigation nav ul');
    if (mainNavUl && !mainNavUl.querySelector('a[href="carrinho.html"]')) {
        const carrinhoLi = document.createElement('li');
        carrinhoLi.innerHTML = '<a href="carrinho.html">Carrinho</a>';
        mainNavUl.appendChild(carrinhoLi);
    }
});