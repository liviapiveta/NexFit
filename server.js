const express = require('express');
const path = require('path');
const mongoose = require('mongoose');
const connectDB = require('./db'); // Importa nossa função de conexão

// Conecta ao banco de dados ANTES de iniciar o servidor
connectDB();

const app = express();
const PORT = process.env.PORT || 3000;

// --- DEFINIÇÃO DO MODELO DE PRODUTO (SCHEMA) ---
// Isso define como os dados dos produtos serão estruturados no MongoDB
const productSchema = new mongoose.Schema({
    id: { type: Number, required: true, unique: true },
    nome: { type: String, required: true },
    preco: { type: String, required: true },
    categoria: { type: String, required: true },
    // E outros campos que você tenha...
});
const Product = mongoose.model('Product', productSchema);


// --- ROTAS DA APLICAÇÃO ---

// Servir os arquivos estáticos (HTML, CSS, JS, etc.)
app.use(express.static(path.join(__dirname)));

// Rota principal para servir o home.html
app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'home.html'));
});

// Rota de API para buscar todos os produtos do banco de dados
app.get('/api/products', async (req, res) => {
    try {
        const products = await Product.find();
        res.json(products);
    } catch (error) {
        res.status(500).json({ message: 'Erro ao buscar produtos', error: error.message });
    }
});


// Iniciar o servidor
app.listen(PORT, () => {
    console.log(`Servidor rodando na porta ${PORT}`);
});