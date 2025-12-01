// --- LÓGICA GERAL DOS MODAIS E TEMA ---
const loginBtn = document.getElementById('loginBtn');
const loginModal = document.getElementById('loginModal');
const loginForm = document.getElementById('loginForm');
const registerBtn = document.getElementById('registerBtn');
const registerModal = document.getElementById('registerModal');
const registerForm = document.getElementById('registerForm');
const closeButtons = document.querySelectorAll('.close-button');
const switchToRegisterLink = document.getElementById('switchToRegister');
const switchToLoginLink = document.getElementById('switchToLogin');

// Elementos do Usuário Logado
const authButtonsContainer = document.getElementById('auth-buttons-container');
const userLoggedContainer = document.getElementById('user-logged-container');
const userDropdown = document.getElementById('userDropdown');
const btnLogout = document.getElementById('btnLogout');
const btnProfile = document.getElementById('btnProfile');
const profileModal = document.getElementById('profileModal');
const profileEmailSpan = document.getElementById('profileEmail');
const closeProfileModal = document.getElementById('closeProfileModal');

// URL do nosso backend
const API_URL = 'http://localhost:3000/api';

// --- FUNÇÃO PARA VERIFICAR SE O USUÁRIO ESTÁ LOGADO ---
function checkLoginState() {
    const user = JSON.parse(localStorage.getItem('nexfitUser'));

    if (user) {
        // Se tem usuário salvo, esconde botões de login e mostra o avatar
        if(authButtonsContainer) authButtonsContainer.style.display = 'none';
        if(userLoggedContainer) userLoggedContainer.style.display = 'flex';
    } else {
        // Se não tem, mostra botões de login e esconde o avatar
        if(authButtonsContainer) authButtonsContainer.style.display = 'flex';
        if(userLoggedContainer) userLoggedContainer.style.display = 'none';
    }
}

// --- LÓGICA DO MENU DROPDOWN ---
if (userLoggedContainer) {
    userLoggedContainer.addEventListener('click', (e) => {
        // Evita que o clique feche o menu imediatamente
        e.stopPropagation(); 
        userDropdown.classList.toggle('show');
    });
}

// Fechar o dropdown se clicar fora dele
window.addEventListener('click', () => {
    if (userDropdown && userDropdown.classList.contains('show')) {
        userDropdown.classList.remove('show');
    }
});

// --- LÓGICA DE LOGOUT ---
if (btnLogout) {
    btnLogout.addEventListener('click', (e) => {
        e.preventDefault();
        // Remove o usuário do armazenamento
        localStorage.removeItem('nexfitUser');
        alert('Você saiu da sua conta.');
        // Atualiza a tela
        checkLoginState();
        // Recarrega a página para limpar estados
        window.location.reload();
    });
}

// --- LÓGICA DO MODAL DE PERFIL ---
if (btnProfile) {
    btnProfile.addEventListener('click', (e) => {
        e.preventDefault();
        const user = JSON.parse(localStorage.getItem('nexfitUser'));
        if (user) {
            profileEmailSpan.textContent = user.email;
            profileModal.style.display = 'block';
        }
    });
}

if (closeProfileModal) {
    closeProfileModal.addEventListener('click', () => {
        profileModal.style.display = 'none';
    });
}

// Fecha modais ao clicar fora
window.addEventListener('click', (event) => {
    if (event.target === loginModal || event.target === registerModal || event.target === profileModal) {
        closeAllModals();
        if(profileModal) profileModal.style.display = 'none';
    }
});

// --- FUNÇÕES AUXILIARES ---
const closeAllModals = () => {
    if (loginModal) loginModal.style.display = 'none';
    if (registerModal) registerModal.style.display = 'none';
};

// Eventos de abrir modais de login/registro
if (loginBtn) loginBtn.addEventListener('click', () => { closeAllModals(); loginModal.style.display = 'block'; });
if (registerBtn) registerBtn.addEventListener('click', () => { closeAllModals(); registerModal.style.display = 'block'; });

closeButtons.forEach(button => {
    button.addEventListener('click', closeAllModals);
});

if (switchToRegisterLink) switchToRegisterLink.addEventListener('click', (e) => { e.preventDefault(); closeAllModals(); registerModal.style.display = 'block'; });
if (switchToLoginLink) switchToLoginLink.addEventListener('click', (e) => { e.preventDefault(); closeAllModals(); loginModal.style.display = 'block'; });


// --- LÓGICA DO TEMA ESCURO ---
const themeToggleBtn = document.getElementById('themeToggle');
const body = document.body;
const currentTheme = localStorage.getItem('theme');

if (currentTheme === 'dark') {
    body.classList.add('dark-mode');
    if(themeToggleBtn) themeToggleBtn.textContent = '☀️';
}

if (themeToggleBtn) {
    themeToggleBtn.addEventListener('click', () => {
        body.classList.toggle('dark-mode');
        if (body.classList.contains('dark-mode')) {
            localStorage.setItem('theme', 'dark');
            themeToggleBtn.textContent = '☀️';
        } else {
            localStorage.setItem('theme', 'light');
            themeToggleBtn.textContent = '🌙';
        }
    });
}

// =========================================================================
// --- LÓGICA DE LOGIN E REGISTRO ATUALIZADA ---
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
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ email, password }),
            });

            const data = await response.json();

            if (response.ok) { 
                alert(data.message || 'Registro realizado com sucesso!');
                closeAllModals();
            } else {
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
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ email, password }),
            });

            const data = await response.json();

            if (response.ok) {
                alert(data.message || 'Login realizado com sucesso!');
                
                // SALVA O USUÁRIO NO NAVEGADOR
                localStorage.setItem('nexfitUser', JSON.stringify(data.user));
                
                closeAllModals();
                // ATUALIZA O CABEÇALHO IMEDIATAMENTE
                checkLoginState();
            } else {
                throw new Error(data.message || 'Falha no login.');
            }
        } catch (error) {
            console.error('Erro na requisição de login:', error);
            alert('Falha no login: ' + error.message);
        }
    });
}

// --- LÓGICA DO CARRINHO E PRODUTOS (IGUAL AO SEU) ---
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

// --- LÓGICA PARA CARREGAR PRODUTOS (DO BANCO DE DADOS) ---
async function loadProducts() {
    // Verifica se existe pelo menos um grid na tela antes de tentar carregar
    if (!document.getElementById('grid-academia') && !document.getElementById('grid-acessorios')) return;

    try {
        // Busca os produtos da sua API (Banco de Dados)
        const response = await fetch(`${API_URL}/products`);
        if (!response.ok) throw new Error('Falha ao buscar produtos');
        const products = await response.json();
        
        // Mapeamento dos locais onde os produtos devem entrar no HTML
        const containers = {
            academia: document.getElementById('grid-academia'),
            termicas: document.getElementById('grid-termicas'),
            acessorios: document.getElementById('grid-acessorios'),
            equipamentos: document.getElementById('grid-equipamentos'),
            suplementos: document.getElementById('grid-suplementos')
        };
        
        products.forEach(product => {
            // Lógica Inteligente de Imagem:
            // 1. Se tiver URL direta (adicionada no admin), usa ela.
            // 2. Se não, tenta pegar do sistema antigo de cores.
            // 3. Se não tiver nada, coloca uma imagem padrão.
            let imageUrl = 'placeholder.png';
            
            if (product.imagemUrl && product.imagemUrl.trim() !== '') {
                imageUrl = product.imagemUrl;
            } else if (product.cores && product.cores.length > 0) {
                imageUrl = product.cores[0].imagemUrl;
            }

            const link = `pagina-produto-${product.id}.html`;

            const productCardHTML = `
                <a href="${link}" class="product-card">
                    <div>
                        <img src="${imageUrl}" alt="${product.nome}" onerror="this.src='imagens/placeholder.png'">
                        <p class="product-name">${product.nome}</p>
                    </div>
                    <p class="product-price">R$${product.preco}</p>
                </a>`;

            // Lógica para descobrir em qual DIV o produto deve entrar
            // Se tiver subcategoria (ex: Academia), usa ela. Se não, usa a categoria (ex: Acessorios).
            // Remove acentos e coloca em minúsculo para bater com os IDs do HTML.
            let categoriaChave = '';
            
            if (product.subcategoria) {
                categoriaChave = product.subcategoria.toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "");
            } else if (product.categoria) {
                categoriaChave = product.categoria.toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "");
            }

            const targetContainer = containers[categoriaChave];
            
            if (targetContainer) {
                targetContainer.innerHTML += productCardHTML;
            }
        });
    } catch (error) {
        console.error("Erro ao carregar produtos:", error);
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
    // 1. VERIFICA O LOGIN ASSIM QUE A PÁGINA ABRE
    checkLoginState();

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

