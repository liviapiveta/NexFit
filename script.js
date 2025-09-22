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
    // Verifica se estamos na página de produtos procurando por um dos grids
    if (!document.getElementById('grid-academia')) {
        return; // Se não encontrar, sai da função (não estamos na página de produtos)
    }

    try {
        const response = await fetch('produtos.json');
        if (!response.ok) {
            throw new Error(`Erro ao carregar o arquivo: ${response.statusText}`);
        }
        const products = await response.json();

        // Mapeamento das categorias e subcategorias para os IDs dos containers no HTML
        const containers = {
            academia: document.getElementById('grid-academia'),
            termicas: document.getElementById('grid-termicas'),
            acessorios: document.getElementById('grid-acessorios'),
            equipamentos: document.getElementById('grid-equipamentos'),
            suplementos: document.getElementById('grid-suplementos')
        };
        
        // Limpa todos os containers antes de adicionar novos produtos
        Object.values(containers).forEach(container => {
            if (container) container.innerHTML = '';
        });

        // Itera sobre cada produto do JSON
        products.forEach(product => {
            const productCardHTML = `
                <a href="${product.link}" class="product-card">
                    <div>
                        <img src="${product.imagemUrl.replace(/\\/g, '/')}" alt="${product.nome}">
                        <p class="product-name">${product.nome}</p>
                    </div>
                    <p class="product-price">R$${product.preco}</p>
                </a>`;

            // Adiciona o card do produto no container correto
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

// Adiciona um listener que executa o código quando o HTML da página é totalmente carregado
document.addEventListener('DOMContentLoaded', () => {
    // Chama a função para carregar os produtos da página de produtos
    loadProducts();

    // Adiciona o Carrinho na navegação principal se o elemento existir
    const mainNavUl = document.querySelector('.main-navigation nav ul');
    if (mainNavUl && !document.querySelector('.main-navigation nav ul li a[href="carrinho.html"]')) {
        const carrinhoLi = document.createElement('li');
        carrinhoLi.innerHTML = '<a href="carrinho.html">Carrinho</a>';
        mainNavUl.appendChild(carrinhoLi);
    }
});