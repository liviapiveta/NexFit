// --- LÓGICA GERAL DOS MODAIS ---
const loginBtn = document.getElementById('loginBtn');
const loginModal = document.getElementById('loginModal');
const loginForm = document.getElementById('loginForm');
const registerBtn = document.getElementById('registerBtn');
const registerModal = document.getElementById('registerModal');
const registerForm = document.getElementById('registerForm');
const closeButtons = document.querySelectorAll('.close-button');
const switchToRegisterLink = document.getElementById('switchToRegister');
const switchToLoginLink = document.getElementById('switchToLogin');

// URL do nosso backend
const API_URL = 'https://nex-fit.vercel.app/';

const closeAllModals = () => {
    if (loginModal) loginModal.style.display = 'none';
    if (registerModal) registerModal.style.display = 'none';
};

if (loginBtn) {
    loginBtn.addEventListener('click', () => {
        closeAllModals();
        loginModal.style.display = 'block';
    });
}
if (registerBtn) {
    registerBtn.addEventListener('click', () => {
        closeAllModals();
        registerModal.style.display = 'block';
    });
}
closeButtons.forEach(button => {
    button.addEventListener('click', closeAllModals);
});
window.addEventListener('click', (event) => {
    if (event.target === loginModal || event.target === registerModal) {
        closeAllModals();
    }
});
if (switchToRegisterLink) {
    switchToRegisterLink.addEventListener('click', (e) => {
        e.preventDefault();
        closeAllModals();
        registerModal.style.display = 'block';
    });
}
if (switchToLoginLink) {
    switchToLoginLink.addEventListener('click', (e) => {
        e.preventDefault();
        closeAllModals();
        loginModal.style.display = 'block';
    });
}

// =========================================================================
// --- LÓGICA DE AUTENTICAÇÃO COM O NOSSO BACKEND ---
// =========================================================================

if (registerForm) {
    registerForm.addEventListener('submit', async (event) => {
        event.preventDefault();
        const email = document.getElementById('registerEmail').value;
        const password = document.getElementById('registerPassword').value;
        const confirmPassword = document.getElementById('confirmPassword').value;
        
        if (password !== confirmPassword) {
            alert('As senhas não coincidem!');
            return;
        }

        try {
            const response = await fetch(`${API_URL}/register`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ email, password }),
            });

            const data = await response.json();

            if (response.ok) { 
                alert(data.message || 'Registro realizado com sucesso!');
                closeAllModals();
            } else {
                // Lança um erro para ser pego pelo bloco catch
                throw new Error(data.message || 'Erro desconhecido no servidor.');
            }
        } catch (error) {
            console.error('Erro na requisição de registro:', error);
            alert('Falha no registro: ' + error.message);
        }
    });
}

if (loginForm) {
    loginForm.addEventListener('submit', async (event) => {
        event.preventDefault();
        const email = document.getElementById('loginEmail').value;
        const password = document.getElementById('loginPassword').value;

        try {
            const response = await fetch(`${API_URL}/login`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ email, password }),
            });

            const data = await response.json();

            if (response.ok) {
                alert(data.message || 'Login realizado com sucesso!');
                closeAllModals();
            } else {
                // Lança um erro para ser pego pelo bloco catch
                throw new Error(data.message || 'Falha no login.');
            }
        } catch (error) {
            console.error('Erro na requisição de login:', error);
            alert('Falha no login: ' + error.message);
        }
    });
}


// --- LÓGICA DO CARRINHO DE COMPRAS (sem alterações) ---

function addToCart(product) {
    const sizeEl = document.querySelector('.size-button.active');
    const colorEl = document.querySelector('.color-button.active');

    const itemToAdd = {
        id: product.id,
        nome: product.nome,
        preco: product.preco,
        imagemUrl: document.getElementById('product-image').src,
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
    if (summaryContainer) summaryContainer.innerHTML = '';

    if (cart.length === 0) {
        cartContainer.innerHTML = '<p class="cart-empty-message">Seu carrinho está vazio.</p>';
        return;
    }

    let subtotal = 0;

    cart.forEach(item => {
        let options = `Cor: ${item.cor}`;
        if (item.tamanho) {
            options += ` | Tamanho: ${item.tamanho}`;
        }
        
        const itemHTML = `
            <div class="cart-item">
                <img src="${item.imagemUrl}" alt="${item.nome}" class="cart-item-image">
                <div class="cart-item-details">
                    <p class="cart-item-name">${item.nome}</p>
                    <p class="cart-item-options">${options}</p>
                    <p class="cart-item-price">R$${item.preco}</p>
                </div>
                <button class="remove-from-cart-btn" data-item-id="${item.cartItemId}">Remover</button>
            </div>
        `;
        cartContainer.innerHTML += itemHTML;
        
        const price = parseFloat(item.preco.replace(',', '.'));
        if (!isNaN(price)) {
            subtotal += price;
        }
    });

    if (summaryContainer) {
        const summaryHTML = `
            <div class="cart-total">
                <p>Subtotal: <strong>R$${subtotal.toFixed(2).replace('.', ',')}</strong></p>
                <button class="checkout-button">Finalizar Compra</button>
            </div>
        `;
        summaryContainer.innerHTML = summaryHTML;
    }

    document.querySelectorAll('.remove-from-cart-btn').forEach(button => {
        button.addEventListener('click', (event) => {
            const cartItemId = event.target.dataset.itemId;
            removeFromCart(cartItemId);
        });
    });
}

// --- LÓGICA PARA CARREGAR PRODUTOS (mantida como está, usando produtos.json) ---

async function loadProducts() {
    if (!document.getElementById('grid-academia')) return;

    try {
        const response = await fetch('produtos.json');
        const products = await response.json();
        
        const containers = {
            academia: document.getElementById('grid-academia'),
            termicas: document.getElementById('grid-termicas'),
            acessorios: document.getElementById('grid-acessorios'),
            equipamentos: document.getElementById('grid-equipamentos'),
            suplementos: document.getElementById('grid-suplementos')
        };
        
        products.forEach(product => {
            const imageUrl = product.cores && product.cores.length > 0 ? product.cores[0].imagemUrl : 'imagens/placeholder.png';

            const productCardHTML = `
                <a href="${product.link}" class="product-card">
                    <div>
                        <img src="${imageUrl}" alt="${product.nome}">
                        <p class="product-name">${product.nome}</p>
                    </div>
                    <p class="product-price">R$${product.preco}</p>
                </a>`;

            const targetContainerKey = product.subcategoria ? product.subcategoria.toLowerCase() : product.categoria.toLowerCase();
            const targetContainer = containers[targetContainerKey];
            if (targetContainer) {
                targetContainer.innerHTML += productCardHTML;
            }
        });
    } catch (error) {
        console.error("Não foi possível carregar os produtos:", error);
    }
}

async function loadProductDetails(productId) {
    const productImage = document.getElementById('product-image');
    const colorContainer = document.getElementById('color-options-container');
    const addToCartButton = document.getElementById('add-to-cart-btn');

    if (!productImage || !colorContainer || !addToCartButton) return;

    try {
        const response = await fetch('produtos.json');
        const products = await response.json();
        const product = products.find(p => p.id === productId);

        if (!product) return;

        colorContainer.innerHTML = '';
        
        if (product.cores && product.cores.length > 0) {
            product.cores.forEach((cor, index) => {
                const colorButton = document.createElement('button');
                colorButton.className = 'color-button';
                colorButton.textContent = cor.nome;
                
                if (index === 0) {
                    colorButton.classList.add('active');
                }

                colorButton.addEventListener('click', () => {
                    productImage.src = cor.imagemUrl;
                    document.querySelectorAll('.color-button').forEach(btn => btn.classList.remove('active'));
                    colorButton.classList.add('active');
                });

                colorContainer.appendChild(colorButton);
            });
        }
        
        addToCartButton.addEventListener('click', () => addToCart(product));

    } catch (error) {
        console.error("Não foi possível carregar os detalhes do produto:", error);
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

// --- INICIALIZAÇÃO QUANDO A PÁGINA CARREGA ---
document.addEventListener('DOMContentLoaded', () => {
    const path = window.location.pathname.split('/').pop();

    if (path === 'produtos.html') {
        loadProducts();
    }
    else if (path === 'carrinho.html') {
        displayCart();
    }
    else if (path.startsWith('pagina-produto-')) {
        const productId = parseInt(path.match(/\d+/)[0]);
        if (!isNaN(productId)) {
            loadProductDetails(productId);
            setupSizeSelection();
        }
    }
    
    const mainNavUl = document.querySelector('.main-navigation nav ul');
    if (mainNavUl && !mainNavUl.querySelector('a[href="carrinho.html"]')) {
        const carrinhoLi = document.createElement('li');
        carrinhoLi.innerHTML = '<a href="carrinho.html">Carrinho</a>';
        mainNavUl.appendChild(carrinhoLi);
    }

});
