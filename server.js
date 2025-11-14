// 1. Importar o Express
const express = require('express');
const path = require('path');

// 2. Criar uma instância do Express
const app = express();

// 3. Definir a porta do servidor
// Render vai fornecer a porta através de process.env.PORT
// Para rodar localmente, usaremos a porta 3000
const PORT = process.env.PORT || 3000;

// 4. Servir os arquivos estáticos (HTML, CSS, JS, Imagens)
// Esta linha diz ao servidor para entregar qualquer arquivo que esteja na mesma pasta que ele.
app.use(express.static(path.join(__dirname)));

// 5. Rota de teste da API (para verificar se o servidor Node está funcionando)
app.get('/api/test', (req, res) => {
    res.json({ message: 'Olá! O servidor NexFit está no ar!' });
});

// 6. Rota principal para servir o home.html
// Se alguém acessar a raiz do site, entregue o home.html
app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'home.html'));
});

// 7. Iniciar o servidor e fazê-lo "ouvir" na porta definida
app.listen(PORT, () => {
    console.log(`Servidor rodando na porta ${PORT}`);
});