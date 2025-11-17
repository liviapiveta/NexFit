const fs = require('fs');
const mongoose = require('mongoose');
const path = require('path');
require('dotenv').config(); // Carrega as variáveis do .env

// --- Importar o Modelo de Produto ---
// Precisamos recriar o schema aqui para que o script saiba como salvar os dados
const productSchema = new mongoose.Schema({
    id: { type: Number, required: true, unique: true },
    nome: { type: String, required: true },
    preco: { type: String, required: true },
    categoria: { type: String, required: true },
    // Adicione outros campos se você os tiver no seu schema do server.js
});
const Product = mongoose.model('Product', productSchema);


// --- Conectar ao Banco de Dados ---
const connectDB = async () => {
    try {
        await mongoose.connect(process.env.MONGODB_URI);
        console.log('MongoDB Conectado para o Seeder...');
    } catch (error) {
        console.error(`Erro na conexão do Seeder: ${error.message}`);
        process.exit(1);
    }
};


// --- Ler o arquivo JSON ---
const products = JSON.parse(
    fs.readFileSync(path.join(__dirname, 'produtos.json'), 'utf-8')
);


// --- Função para Importar os Dados ---
const importData = async () => {
    try {
        // Limpa a coleção de produtos antes de importar, para evitar duplicatas
        await Product.deleteMany(); 
        
        await Product.insertMany(products);

        console.log('✅ Dados importados com sucesso!');
        process.exit();
    } catch (error) {
        console.error(`❌ Erro ao importar dados: ${error.message}`);
        process.exit(1);
    }
};


// --- Função para Deletar os Dados ---
const destroyData = async () => {
    try {
        await Product.deleteMany();
        console.log('✅ Dados destruídos com sucesso!');
        process.exit();
    } catch (error) {
        console.error(`❌ Erro ao destruir dados: ${error.message}`);
        process.exit(1);
    }
};


// --- Lógica para Executar o Script via Terminal ---
const runScript = async () => {
    await connectDB();

    if (process.argv[2] === '-d') { // Se o comando for "node seeder.js -d"
        await destroyData();
    } else { // Para qualquer outro caso
        await importData();
    }
};

runScript();