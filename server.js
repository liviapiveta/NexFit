const express = require('express');
const path = require('path');
const mongoose = require('mongoose');
const session = require('express-session');
const connectDB = require('./db');
const cors = require('cors');
const bcrypt = require('bcryptjs'); // NOVO: Para criptografar senhas

// --- CONFIGURAÇÃO INICIAL ---
connectDB();
const app = express();
const PORT = process.env.PORT || 3000;

// --- CONFIGURAÇÃO DO EXPRESS ---
app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'admin'));
app.use(express.static(path.join(__dirname)));
app.use(express.urlencoded({ extended: true }));
app.use(express.json());
app.use(cors());
app.use(session({
    secret: 'seu-segredo-super-secreto-aqui',
    resave: false,
    saveUninitialized: true,
}));

// --- DEFINIÇÃO DOS MODELOS (SCHEMAS) ---

// Modelo de Produto (sem alteração)
const productSchema = new mongoose.Schema({
    id: { type: Number, required: true, unique: true },
    nome: { type: String, required: true },
    preco: { type: String, required: true },
    categoria: { type: String, required: true }
});
const Product = mongoose.model('Product', productSchema);

// NOVO: Modelo de Usuário
const userSchema = new mongoose.Schema({
    email: { type: String, required: true, unique: true },
    password: { type: String, required: true }
});
const User = mongoose.model('User', userSchema);


// --- MIDDLEWARE DE AUTENTICAÇÃO DO ADMIN ---
const requireLogin = (req, res, next) => {
    if (req.session && req.session.isAdmin) { // Verificamos se é admin
        return next();
    } else {
        res.redirect('/admin');
    }
};

// ===================================================
// --- ROTAS PÚBLICAS (PARA CLIENTES DO SITE) ---
// ===================================================

app.get('/', (req, res) => res.sendFile(path.join(__dirname, 'home.html')));

app.get('/api/products', async (req, res) => {
    try {
        const products = await Product.find().sort({ id: 1 });
        res.json(products);
    } catch (error) {
        res.status(500).json({ message: 'Erro ao buscar produtos.' });
    }
});

// ROTA DE REGISTRO DE USUÁRIO (ATUALIZADA)
app.post('/api/register', async (req, res) => {
    try {
        const { email, password } = req.body;

        // 1. Verifica se o usuário já existe
        const existingUser = await User.findOne({ email });
        if (existingUser) {
            return res.status(400).json({ success: false, message: 'Este e-mail já está em uso.' });
        }

        // 2. Criptografa a senha
        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(password, salt);

        // 3. Cria e salva o novo usuário
        const newUser = new User({ email, password: hashedPassword });
        await newUser.save();

        res.status(201).json({ success: true, message: 'Usuário registrado com sucesso!' });
    } catch (error) {
        res.status(500).json({ success: false, message: 'Erro no servidor ao tentar registrar.' });
    }
});

// NOVA ROTA DE LOGIN DE USUÁRIO
app.post('/api/login', async (req, res) => {
    try {
        const { email, password } = req.body;

        // 1. Encontra o usuário pelo e-mail
        const user = await User.findOne({ email });
        if (!user) {
            return res.status(400).json({ success: false, message: 'E-mail ou senha inválidos.' });
        }

        // 2. Compara a senha enviada com a senha criptografada no banco
        const isMatch = await bcrypt.compare(password, user.password);
        if (!isMatch) {
            return res.status(400).json({ success: false, message: 'E-mail ou senha inválidos.' });
        }

        // 3. Cria a sessão para o usuário (se necessário no futuro)
        req.session.user = { id: user._id, email: user.email };

        res.status(200).json({ success: true, message: 'Login realizado com sucesso!' });
    } catch (error) {
        res.status(500).json({ success: false, message: 'Erro no servidor ao tentar fazer login.' });
    }
});


// ===============================================
// --- ROTAS DO ADMIN (PARA GERENCIAMENTO) ---
// ===============================================

app.get('/admin', (req, res) => res.sendFile(path.join(__dirname, 'admin', 'admin-login.html')));

app.post('/admin/login', (req, res) => {
    const { username, password } = req.body;
    if (username === 'admin' && password === 'admin123') {
        req.session.isAdmin = true; // Define que é uma sessão de admin
        res.redirect('/admin/dashboard');
    } else {
        res.send('Usuário ou senha inválidos. <a href="/admin">Tentar novamente</a>');
    }
});

// ... (todas as outras rotas do admin continuam aqui, sem alterações)
app.get('/admin/dashboard', requireLogin, async (req, res) => {
    try {
        const products = await Product.find().sort({ id: 1 });
        res.render('admin-dashboard', { products: products });
    } catch (error) {
        res.status(500).send('Erro ao carregar produtos.');
    }
});
app.get('/admin/add', requireLogin, (req, res) => {
    res.render('admin-form');
});
app.post('/admin/add', requireLogin, async (req, res) => {
    try {
        const newProduct = new Product(req.body);
        await newProduct.save();
        res.redirect('/admin/dashboard');
    } catch (error) {
        res.status(500).send('Erro ao salvar o produto: ' + error.message);
    }
});
app.get('/admin/edit/:id', requireLogin, async (req, res) => {
    try {
        const product = await Product.findOne({ id: req.params.id });
        if (!product) return res.status(404).send('Produto não encontrado.');
        res.render('admin-form', { product: product });
    } catch (error) {
        res.status(500).send('Erro ao buscar produto.');
    }
});
app.post('/admin/edit/:id', requireLogin, async (req, res) => {
    try {
        await Product.findOneAndUpdate({ id: req.params.id }, req.body);
        res.redirect('/admin/dashboard');
    } catch (error) {
        res.status(500).send('Erro ao atualizar o produto.');
    }
});
app.post('/admin/delete/:id', requireLogin, async (req, res) => {
    try {
        await Product.findOneAndDelete({ id: req.params.id });
        res.redirect('/admin/dashboard');
    } catch (error) {
        res.status(500).send('Erro ao deletar o produto.');
    }
});
app.get('/admin/logout', (req, res) => {
    req.session.destroy(err => {
        if (err) return res.redirect('/admin/dashboard');
        res.redirect('/admin');
    });
});


// --- INICIAR O SERVIDOR ---
app.listen(PORT, () => {
    console.log(`Servidor rodando na porta ${PORT}`);
});