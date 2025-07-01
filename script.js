// --- CONFIGURAÇÃO DO SUPABASE ---
const SUPABASE_URL = 'https://gxpgawhxpfglpmlbunkr.supabase.co'; 
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imd4cGdhd2h4cGZnbHBtbGJ1bmtyIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTA3ODY0NjksImV4cCI6MjA2NjM2MjQ2OX0.9bPknN7h4O3tpzRgJQuq7u_pcPJfmOhrlHWqSCskAoE';
const supabase = window.supabase.createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

// --- LÓGICA GERAL DOS MODAIS ---

// Elementos do DOM para Login
const loginBtn = document.getElementById('loginBtn');
const loginModal = document.getElementById('loginModal');
const loginForm = document.getElementById('loginForm');

// Elementos do DOM para Registro
const registerBtn = document.getElementById('registerBtn');
const registerModal = document.getElementById('registerModal');
const registerForm = document.getElementById('registerForm');

// Elementos para fechar e alternar
const closeButtons = document.querySelectorAll('.close-button');
const switchToRegisterLink = document.getElementById('switchToRegister');
const switchToLoginLink = document.getElementById('switchToLogin');

// Função para fechar todos os modais
const closeAllModals = () => {
    if (loginModal) loginModal.style.display = 'none';
    if (registerModal) registerModal.style.display = 'none';
};

// --- EVENT LISTENERS (OUVINTES DE EVENTOS) ---

// Abrir modais
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

// Fechar modais ao clicar no 'X'
closeButtons.forEach(button => {
    button.addEventListener('click', closeAllModals);
});

// Fechar modais ao clicar fora deles
window.addEventListener('click', (event) => {
    if (event.target === loginModal || event.target === registerModal) {
        closeAllModals();
    }
});

// Alternar entre formulários
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

// Processar formulário de LOGIN
if (loginForm) {
    loginForm.addEventListener('submit', async (event) => {
        event.preventDefault();
        const email = document.getElementById('loginEmail').value;
        const password = document.getElementById('loginPassword').value;
        const submitButton = loginForm.querySelector('button[type="submit"]');
        
        submitButton.disabled = true;
        submitButton.textContent = 'Entrando...';

        const { data, error } = await supabase.auth.signInWithPassword({ email, password });

        if (error) {
            alert('Falha no login: ' + error.message);
        } else {
            alert('Login realizado com sucesso!');
            closeAllModals();
        }
        
        submitButton.disabled = false;
        submitButton.textContent = 'Entrar';
    });
}

// Processar formulário de REGISTRO
if (registerForm) {
    registerForm.addEventListener('submit', async (event) => {
        event.preventDefault();
        const email = document.getElementById('registerEmail').value;
        const password = document.getElementById('registerPassword').value;
        const confirmPassword = document.getElementById('confirmPassword').value;
        const submitButton = registerForm.querySelector('button[type="submit"]');

        if (password !== confirmPassword) {
            alert('As senhas não coincidem!');
            return;
        }

        submitButton.disabled = true;
        submitButton.textContent = 'Registrando...';

        const { data, error } = await supabase.auth.signUp({ email, password });

        if (error) {
            alert('Falha no registro: ' + error.message);
        } else {
            alert('Registro realizado com sucesso! Se a confirmação de e-mail estiver ativa, verifique sua caixa de entrada.');
            closeAllModals();
        }

        submitButton.disabled = false;
        submitButton.textContent = 'Registrar';
    });
}

// --- LÓGICA PARA RENDERIZAR PRODUTOS E ABRIR MODAL ---

document.addEventListener('DOMContentLoaded', () => {
    const produtosDestaque = [
        {
            nome: "Whey Protein Concentrado Dymatize Elite 100% (907g)",
            imagemUrl: "https://i.imgur.com/z6E5L93.png",
            precoAntigo: "299,90",
            precoAtual: "249,90",
            parcelamento: "ou 5x de R$ 49,98 sem juros"
        },
        {
            nome: "Luva de Treino Musculação NexFit Pro Grip",
            imagemUrl: "https://i.imgur.com/XU68EwE.png",
            precoAntigo: "99,90",
            precoAtual: "79,90",
            parcelamento: "ou 2x de R$ 39,95 sem juros"
        }
    ];

    const containerDeProdutos = document.getElementById('lista-produtos-destaque');
    const produtoModal = document.getElementById('produtoModal');
    const modalCloseBtn = document.querySelector('.modal-produto-close');
    const modalImagem = document.getElementById('modal-imagem');
    const modalNome = document.getElementById('modal-nome');
    const modalPrecoAntigo = document.getElementById('modal-preco-antigo');
    const modalPrecoAtual = document.getElementById('modal-preco-atual');
    const modalParcelamento = document.getElementById('modal-parcelamento');

    if (containerDeProdutos) {
        let htmlParaInserir = '';
        produtosDestaque.forEach((produto, index) => {
            const cardHTML = `
                <div class="produto-card-destaque" data-index="${index}">
                    <img src="${produto.imagemUrl}" alt="${produto.nome}" class="produto-imagem-destaque">
                    <h3 class="produto-nome-destaque">${produto.nome}</h3>
                    <div>
                        <div class="produto-precos-destaque">
                            <span class="produto-preco-antigo">R$ ${produto.precoAntigo}</span>
                            <span class="produto-preco-atual">R$ ${produto.precoAtual}</span>
                        </div>
                        <p class="produto-parcelamento-destaque">${produto.parcelamento.split(' ').slice(0, 3).join(' ')}</p>
                    </div>
                </div>`;
            htmlParaInserir += cardHTML;
        });
        containerDeProdutos.innerHTML = htmlParaInserir;

        containerDeProdutos.addEventListener('click', (event) => {
            const cardClicado = event.target.closest('.produto-card-destaque');
            if (!cardClicado) return;

            const produtoIndex = cardClicado.dataset.index;
            const produtoSelecionado = produtosDestaque[produtoIndex];

            modalImagem.src = produtoSelecionado.imagemUrl;
            modalNome.textContent = produtoSelecionado.nome;
            modalPrecoAntigo.textContent = `R$ ${produtoSelecionado.precoAntigo}`;
            modalPrecoAtual.textContent = `R$ ${produtoSelecionado.precoAtual}`;
            modalParcelamento.textContent = produtoSelecionado.parcelamento;
            produtoModal.classList.add('modal-ativo');
        });
    }

    const fecharModal = () => {
        if (produtoModal) produtoModal.classList.remove('modal-ativo');
    };

    if (modalCloseBtn) modalCloseBtn.addEventListener('click', fecharModal);
    if (produtoModal) produtoModal.addEventListener('click', (event) => {
        if (event.target === produtoModal) fecharModal();
    });
});