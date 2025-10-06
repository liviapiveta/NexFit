// --- CONFIGURAÇÃO DO SUPABASE ---
const SUPABASE_URL = 'https://gxpgawhxpfglpmlbunkr.supabase.co'; 
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imd4cGdhd2h4cGZnbHBtbGJ1bmtyIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTA3ODY0NjksImV4cCI6MjA2NjM2MjQ2OX0.9bPknN7h4O3tpzRgJQuq7u_pcPJfmOhrlHWqSCskAoE';
const supabase = window.supabase.createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

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

// --- LÓGICA DE SUBMISSÃO DOS FORMULÁRIOS ---
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


// --- LÓGICA PARA CARREGAR E EXIBIR PRODUTOS ---

// Função que carrega os produtos do JSON e os exibe na página
async function loadProducts() {
    if (!document.getElementById('grid-academia')) {
        return;
    }

    try {
        const response = await fetch('produtos.json');
        if (!response.ok) {
            throw new Error(`Erro ao carregar o arquivo: ${response.statusText}`);
        }
        const products = await response.json();

        const containers = {
            academia: document.getElementById('grid-academia'),
            termicas: document.getElementById('grid-termicas'),
            acessorios: document.getElementById('grid-acessorios'),
            equipamentos: document.getElementById('grid-equipamentos'),
            suplementos: document.getElementById('grid-suplementos')
        };
        
        Object.values(containers).forEach(container => {
            if (container) container.innerHTML = '';
        });

        products.forEach(product => {
            const imageUrl = product.cores ? product.cores[0].imagemUrl.replace(/\\/g, '/') : (product.imagemUrl ? product.imagemUrl.replace(/\\/g, '/') : '');

            const productCardHTML = `
                <a href="${product.link}" class="product-card">
                    <div>
                        <img src="${imageUrl}" alt="${product.nome}">
                        <p class="product-name">${product.nome}</p>
                    </div>
                    <p class="product-price">R$${product.preco}</p>
                </a>`;

            if (product.subcategoria === 'Academia' && containers.academia) {
                containers.academia.innerHTML += productCardHTML;
            } else if (product.subcategoria === 'Térmicas' && containers.termicas) {
                containers.termicas.innerHTML += productCardHTML;
            } else if (product.categoria === 'Acessórios' && containers.acessorios) {
                containers.acessorios.innerHTML += productCardHTML;
            } else if (product.categoria === 'Equipamentos' && containers.equipamentos) {
                containers.equipamentos.innerHTML += productCardHTML;
            } else if (product.categoria === 'Suplementos' && containers.suplementos) {
                containers.suplementos.innerHTML += productCardHTML;
            }
        });

    } catch (error) {
        console.error("Não foi possível carregar os produtos:", error);
    }
}

// --- Lógica para seleção de tamanhos na página de detalhes do produto ---
function setupSizeSelection() {
    const sizeButtons = document.querySelectorAll('.size-button');
    if (sizeButtons.length > 0) {
        sizeButtons.forEach(button => {
            button.addEventListener('click', () => {
                sizeButtons.forEach(btn => btn.classList.remove('active'));
                button.classList.add('active');
            });
        });
    }
}


// --- LÓGICA PARA CARREGAR DETALHES DO PRODUTO (NOVA FUNÇÃO) ---
async function loadProductDetails(productId) {
    const productImage = document.getElementById('product-image');
    const productName = document.querySelector('.product-detail-name');
    const productPrice = document.querySelector('.product-detail-price');
    const colorContainer = document.getElementById('color-options-container');

    if (!productImage || !productName || !productPrice || !colorContainer) {
        return; 
    }

    try {
        const response = await fetch('produtos.json');
        const products = await response.json();
        const product = products.find(p => p.id === productId);

        if (!product) {
            console.error('Produto não encontrado!');
            return;
        }

        productName.textContent = product.nome;
        productPrice.textContent = `R$${product.preco}`;
        colorContainer.innerHTML = '';

        if (product.cores && product.cores.length > 0) {
            const firstColor = product.cores[0];
            productImage.src = firstColor.imagemUrl;
            productImage.alt = `${product.nome} - ${firstColor.nome}`;
            document.title = `${product.nome} - NexFit`; // Atualiza o título da página
        }
        
        product.cores.forEach((cor, index) => {
            const colorButton = document.createElement('button');
            colorButton.className = 'color-button';
            colorButton.textContent = cor.nome;
            
            if (index === 0) {
                colorButton.classList.add('active');
            }

            colorButton.addEventListener('click', () => {
                productImage.src = cor.imagemUrl;
                productImage.alt = `${product.nome} - ${cor.nome}`;

                document.querySelectorAll('.color-button').forEach(btn => btn.classList.remove('active'));
                colorButton.classList.add('active');
            });

            colorContainer.appendChild(colorButton);
        });

    } catch (error) {
        console.error("Não foi possível carregar os detalhes do produto:", error);
    }
}


// Adiciona um listener que executa o código quando o HTML da página é totalmente carregado
document.addEventListener('DOMContentLoaded', () => {
    loadProducts();
    setupSizeSelection();

    const mainNavUl = document.querySelector('.main-navigation nav ul');
    if (mainNavUl && !document.querySelector('.main-navigation nav ul li a[href="carrinho.html"]')) {
        const carrinhoLi = document.createElement('li');
        carrinhoLi.innerHTML = '<a href="carrinho.html">Carrinho</a>';
        mainNavUl.appendChild(carrinhoLi);
    }

    // --- LÓGICA ATUALIZADA PARA CARREGAR DETALHES EM TODAS AS PÁGINAS DE PRODUTO ---
    const path = window.location.pathname;
    if (path.includes('pagina-produto-1.html')) { loadProductDetails(1); }
    else if (path.includes('pagina-produto-2.html')) { loadProductDetails(2); }
    else if (path.includes('pagina-produto-3.html')) { loadProductDetails(3); }
    else if (path.includes('pagina-produto-4.html')) { loadProductDetails(4); }
    else if (path.includes('pagina-produto-5.html')) { loadProductDetails(5); }
    else if (path.includes('pagina-produto-6.html')) { loadProductDetails(6); }
    else if (path.includes('pagina-produto-7.html')) { loadProductDetails(7); }
    else if (path.includes('pagina-produto-8.html')) { loadProductDetails(8); }
    else if (path.includes('pagina-produto-9.html')) { loadProductDetails(9); }
    else if (path.includes('pagina-produto-10.html')) { loadProductDetails(10); }
    else if (path.includes('pagina-produto-11.html')) { loadProductDetails(11); }
    else if (path.includes('pagina-produto-12.html')) { loadProductDetails(12); }
});