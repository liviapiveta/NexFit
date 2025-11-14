// Importa a biblioteca mongoose
const mongoose = require('mongoose');

// Carrega as variáveis de ambiente do arquivo .env
require('dotenv').config();

// Pega a string de conexão do arquivo .env
const dbURI = process.env.MONGODB_URI;

// Função para conectar ao banco de dados
const connectDB = async () => {
  try {
    await mongoose.connect(dbURI);
    console.log('Conexão com o MongoDB estabelecida com sucesso!');
  } catch (error) {
    console.error('Erro ao conectar com o MongoDB:', error.message);
    // Encerra o processo com falha se não conseguir conectar
    process.exit(1);
  }
};

// Exporta a função para que outros arquivos possam usá-la
module.exports = connectDB;