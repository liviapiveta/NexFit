// --- CONFIGURAÇÃO DO SUPABASE ---
const SUPABASE_URL = 'https://gxpgawhxpfglpmlbunkr.supabase.co'; 
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imd4cGdhd2h4cGZnbHBtbGJ1bmtyIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTA3ODY0NjksImV4cCI6MjA2NjM2MjQ2OX0.9bPknN7h4O3tpzRgJQuq7u_pcPJfmOhrlHWqSCskAoE';
const supabase = window.supabase.createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

// --- LÓGICA GERAL DOS MODAIS (Sem alterações) ---
// ... (seu código de modais de login/registro existente permanece aqui) ...
const loginBtn = document.getElementById('loginBtn');
const loginModal = document.getElementById('loginModal');
const loginForm = document.getElementById('loginForm');
const registerBtn = document.getElementById('registerBtn');
const registerModal = document.getElementById('registerModal');
const registerForm = document.getElementById('registerForm');
const closeButtons = document.querySelectorAll('.close-button');
const switchToRegisterLink = document.getElementById('switchToRegister');
const switchToLoginLink = document.getElementById('switchToLogin');

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
if (loginForm) {
    loginForm.addEventListener('submit', async (event) => {
        event.preventDefault();
        const email = document.getElementById('loginEmail').value;
        const password = document.getElementById('loginPassword').value;
        const { error } = await supabase.auth.signInWithPassword({ email, password });
        if (error) alert('Falha no login: ' + error.message);
        else {
            alert('Login realizado com sucesso!');
            closeAllModals();
        }
    });
}
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
        const { error } = await supabase.auth.signUp({ email, password });
        if (error) alert('Falha no registro: ' + error.message);
        else {
            alert('Registro realizado com sucesso!');
            closeAllModals();
        }
    });
}

// --- LÓGICA DO CARRINHO DE COMPRAS ---

/**
 * Adiciona um produto ao carrinho no localStorage.
 * @param {object} product - O objeto do produto vindo do JSON.
 */
function addToCart(product) {
    const sizeEl = document.querySelector('.size-button.active');
    const colorEl = document.querySelector('.color-button.active');

    const itemToAdd = {
        id: product.id,
        nome: product.nome,
        preco: product.preco,
        imagemUrl: document.getElementById('product-image').src,
        // Define 'tamanho' como null se não houver botões de tamanho na página
        tamanho: sizeEl ? sizeEl.textContent : null,
        cor: colorEl ? colorEl.textContent : 'Única',
        // Cria um ID único para cada item no carrinho para facilitar a remoção
        cartItemId: `item-${Date.now()}`
    };

    let cart = JSON.parse(localStorage.getItem('nexfitCart')) || [];
    cart.push(itemToAdd);
    localStorage.setItem('nexfitCart', JSON.stringify(cart));
    
    alert(`${itemToAdd.nome} foi adicionado ao carrinho!`);
    // Opcional: redirecionar para a página do carrinho
    // window.location.href = 'carrinho.html';
}

/**
 * Remove um item do carrinho no localStorage.
 * @param {string} cartItemId - O ID único do item a ser removido.
 */
function removeFromCart(cartItemId) {
    let cart = JSON.parse(localStorage.getItem('nexfitCart')) || [];
    // Filtra o array, mantendo todos os itens exceto aquele que corresponde ao ID
    cart = cart.filter(item => item.cartItemId !== cartItemId);
    localStorage.setItem('nexfitCart', JSON.stringify(cart));
    // Re-renderiza o carrinho para mostrar a remoção
    displayCart();
}

/**
 * Exibe os itens do carrinho e o resumo na página carrinho.html.
 */
function displayCart() {
    const cartContainer = document.getElementById('cart-items-container');
    const summaryContainer = document.getElementById('cart-summary');
    const cart = JSON.parse(localStorage.getItem('nexfitCart')) || [];

    // Limpa o conteúdo anterior
    cartContainer.innerHTML = '';
    summaryContainer.innerHTML = '';

    if (cart.length === 0) {
        cartContainer.innerHTML = '<p class="cart-empty-message">Seu carrinho está vazio.</p>';
        return;
    }

    let subtotal = 0;

    cart.forEach(item => {
        // Constrói a string de opções (tamanho e cor)
        let options = `Cor: ${item.cor}`;
        if (item.tamanho) {
            options += ` | Tamanho: ${item.tamanho}`;
        }
        
        // Cria o HTML para cada item do carrinho
        const itemHTML = `
            <div class="cart-item">
                <img src="${item.imagemUrl}" alt="${item.nome}" class="cart-item-image">
                <div class="cart-item-details">
                    <p class="cart-item-name">${item.nome}</p>
                    <p class="cart-item-options">${options}</p>
                    <p class="cart-item-price">R$${item.preco}</p>
                </div>
                <!-- O data-item-id armazena o ID único para o botão de remoção -->
                <button class="remove-from-cart-btn" data-item-id="${item.cartItemId}">Remover</button>
            </div>
        `;
        cartContainer.innerHTML += itemHTML;
        
        // Calcula o subtotal
        const price = parseFloat(item.preco.replace(',', '.'));
        if (!isNaN(price)) {
            subtotal += price;
        }
    });

    // Cria o HTML para o resumo do pedido
    const summaryHTML = `
        <div class="cart-total">
            <p>Subtotal: <strong>R$${subtotal.toFixed(2).replace('.', ',')}</strong></p>
            <button class="checkout-button">Finalizar Compra</button>
        </div>
    `;
    summaryContainer.innerHTML = summaryHTML;

    // Adiciona o evento de clique para todos os botões "Remover"
    document.querySelectorAll('.remove-from-cart-btn').forEach(button => {
        button.addEventListener('click', (event) => {
            const cartItemId = event.target.dataset.itemId;
            removeFromCart(cartItemId);
        });
    });
}


// --- LÓGICA PARA CARREGAR PRODUTOS ---

/**
 * Carrega os cards de produto na página produtos.html.
 */
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
            // Pega a primeira imagem disponível para o card
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

/**
 * Carrega os detalhes de um produto específico na sua respectiva página.
 * @param {number} productId - O ID do produto a ser carregado.
 */
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

        // Limpa os botões de cor existentes
        colorContainer.innerHTML = '';
        
        // Preenche os botões de cor/variação e adiciona eventos
        if (product.cores && product.cores.length > 0) {
            product.cores.forEach((cor, index) => {
                const colorButton = document.createElement('button');
                colorButton.className = 'color-button';
                colorButton.textContent = cor.nome;
                
                // Ativa o primeiro botão por padrão
                if (index === 0) {
                    colorButton.classList.add('active');
                }

                // Adiciona evento para trocar a imagem ao clicar
                colorButton.addEventListener('click', () => {
                    productImage.src = cor.imagemUrl;
                    document.querySelectorAll('.color-button').forEach(btn => btn.classList.remove('active'));
                    colorButton.classList.add('active');
                });

                colorContainer.appendChild(colorButton);
            });
        }
        
        // Adiciona o evento de clique ao botão de adicionar ao carrinho
        addToCartButton.addEventListener('click', () => addToCart(product));

    } catch (error) {
        console.error("Não foi possível carregar os detalhes do produto:", error);
    }
}

/**
 * Configura a seleção de botões de tamanho.
 */
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

    // Lógica para a página de produtos
    if (path === 'produtos.html') {
        loadProducts();
    }
    // Lógica para a página do carrinho
    else if (path === 'carrinho.html') {
        displayCart();
    }
    // Lógica para as páginas de detalhe de produto
    else if (path.startsWith('pagina-produto-')) {
        const productId = parseInt(path.match(/\d+/)[0]);
        if (!isNaN(productId)) {
            loadProductDetails(productId);
            setupSizeSelection();
        }
    }
    
    // Adiciona o link do carrinho à navegação se ele não existir
    const mainNavUl = document.querySelector('.main-navigation nav ul');
    if (mainNavUl && !mainNavUl.querySelector('a[href="carrinho.html"]')) {
        const carrinhoLi = document.createElement('li');
        carrinhoLi.innerHTML = '<a href="carrinho.html">Carrinho</a>';
        mainNavUl.appendChild(carrinhoLi);
    }
});