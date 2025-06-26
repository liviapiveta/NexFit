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
    loginModal.style.display = 'none';
    registerModal.style.display = 'none';
};

// --- EVENT LISTENERS (OUVINTES DE EVENTOS) ---

// Abrir modais
loginBtn.addEventListener('click', () => {
    closeAllModals();
    loginModal.style.display = 'block';
});
registerBtn.addEventListener('click', () => {
    closeAllModals();
    registerModal.style.display = 'block';
});

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
switchToRegisterLink.addEventListener('click', (e) => {
    e.preventDefault();
    closeAllModals();
    registerModal.style.display = 'block';
});
switchToLoginLink.addEventListener('click', (e) => {
    e.preventDefault();
    closeAllModals();
    loginModal.style.display = 'block';
});

// --- LÓGICA DE SUBMISSÃO DOS FORMULÁRIOS ---

// Processar formulário de LOGIN
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

// Processar formulário de REGISTRO
registerForm.addEventListener('submit', async (event) => {
    event.preventDefault();
    const email = document.getElementById('registerEmail').value;
    const password = document.getElementById('registerPassword').value;
    const confirmPassword = document.getElementById('confirmPassword').value;
    const submitButton = registerForm.querySelector('button[type="submit"]');

    // Validação básica: verificar se as senhas coincidem
    if (password !== confirmPassword) {
        alert('As senhas não coincidem!');
        return; // Para a execução
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