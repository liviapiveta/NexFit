const fs = require('fs');
const mongoose = require('mongoose');
const path = require('path');
require('dotenv').config();

// --- SCHEMA COMPLETO (IDÊNTICO AO SERVER.JS) ---
const productSchema = new mongoose.Schema({
    id: { type: Number, required: true, unique: true },
    nome: { type: String, required: true },
    preco: { type: String, required: true },
    categoria: { type: String, required: true },
    subcategoria: { type: String, required: false },
    imagemUrl: { type: String, required: false },
    cores: { type: Array, required: false }
});
const Product = mongoose.model('Product', productSchema);

// --- CONEXÃO ---
const connectDB = async () => {
    try {
        await mongoose.connect(process.env.MONGODB_URI);
        console.log('MongoDB Conectado...');
    } catch (error) {
        console.error(`Erro: ${error.message}`);
        process.exit(1);
    }
};

// --- LER ARQUIVO JSON ---
const products = JSON.parse(
    fs.readFileSync(path.join(__dirname, 'produtos.json'), 'utf-8')
);

// --- IMPORTAR DADOS ---
const importData = async () => {
    try {
        await Product.deleteMany(); // Apaga o antigo (que estava incompleto)
        await Product.insertMany(products); // Salva o novo (completo)
        console.log('✅ Produtos atualizados com sucesso (Subcategorias e Cores incluídas)!');
        process.exit();
    } catch (error) {
        console.error(`❌ Erro: ${error.message}`);
        process.exit(1);
    }
};

const run = async () => {
    await connectDB();
    await importData();
};

run();