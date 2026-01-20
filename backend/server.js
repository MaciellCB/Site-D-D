const express = require('express');
const cors = require('cors');
const fs = require('fs');
const path = require('path');
const http = require('http'); // Necessário para o Socket.io
const { Server } = require('socket.io'); // Importa o Socket.io

const app = express();
const server = http.createServer(app); // Cria o servidor HTTP manualmente

// Configura o Socket.io com permissão de CORS
const io = new Server(server, {
    cors: {
        origin: "*", // Aceita conexões de qualquer lugar (GitHub Pages, Localhost)
        methods: ["GET", "POST"]
    }
});

app.use(cors());
app.use(express.json({ limit: '10mb' })); // Limite aumentado para aceitar imagens em Base64

// Define o diretório onde as fichas ficam salvas
const PERSONAGENS_DIR = path.join(__dirname, 'data', 'personagens');

// Garante que a pasta existe ao iniciar
if (!fs.existsSync(PERSONAGENS_DIR)) {
    fs.mkdirSync(PERSONAGENS_DIR, { recursive: true });
}

// =================================================================
// WEBSOCKET (CONEXÃO EM TEMPO REAL)
// =================================================================
io.on('connection', (socket) => {
    console.log('Uma aba foi aberta (Socket conectado):', socket.id);
    
    socket.on('disconnect', () => {
        console.log('Uma aba foi fechada');
    });
});

// =================================================================
// ROTAS DA API
// =================================================================

// 1. Listar todos os personagens (para o Painel do Mestre)
app.get('/api/lista-personagens', (req, res) => {
    fs.readdir(PERSONAGENS_DIR, (err, files) => {
        if (err) return res.status(500).json({ error: 'Erro ao ler diretório' });
        // Filtra apenas arquivos .json e remove a extensão do nome
        const lista = files.filter(file => file.endsWith('.json')).map(file => file.replace('.json', ''));
        res.json(lista);
    });
});

// 2. Carregar ficha sem senha (Exclusivo do Mestre)
app.post('/api/load-ficha-mestre', (req, res) => {
    try {
        const { nome } = req.body;
        if (!nome) return res.status(400).json({ error: "Nome não fornecido" });
        
        const filePath = path.join(PERSONAGENS_DIR, `${nome.toLowerCase()}.json`);
        
        if (!fs.existsSync(filePath)) return res.status(404).json({ error: "Arquivo inexistente" });
        
        const ficha = JSON.parse(fs.readFileSync(filePath, 'utf-8'));
        res.json(ficha);
    } catch (error) {
        res.status(500).json({ error: "Erro interno" });
    }
});

// 3. Carregar ficha com senha (Para Jogadores)
app.post('/api/load-ficha', (req, res) => {
    const { nome, senha } = req.body;
    const filePath = path.join(PERSONAGENS_DIR, `${nome.toLowerCase()}.json`);
    
    if (!fs.existsSync(filePath)) return res.status(404).send();
    
    const ficha = JSON.parse(fs.readFileSync(filePath));
    
    // Verificação simples de senha
    if (ficha.senha !== senha) return res.status(401).send();
    
    res.json(ficha);
});

// 4. Salvar Ficha (E atualizar todos os navegadores abertos)
app.post('/api/save-ficha', (req, res) => {
    const ficha = req.body;
    
    if (!ficha.nome) return res.status(400).json({ error: "Ficha sem nome" });

    const filePath = path.join(PERSONAGENS_DIR, `${ficha.nome.toLowerCase()}.json`);
    
    fs.writeFileSync(filePath, JSON.stringify(ficha, null, 2));
    
    console.log(`Ficha salva: ${ficha.nome}`);

    // AVISA A TODOS OS NAVEGADORES CONECTADOS QUE ESSA FICHA MUDOU
    io.emit('ficha_atualizada', ficha); 

    res.json({ ok: true });
});

// 5. Carregar Catálogos (Magias, Itens, Classes)
app.get('/api/catalog/:tipo', (req, res) => {
    const filePath = path.join(__dirname, 'data', `${req.params.tipo}.json`);
    if (fs.existsSync(filePath)) {
        res.json(JSON.parse(fs.readFileSync(filePath)));
    } else {
        res.json([]);
    }
});

// =================================================================
// NOVAS ROTAS (CRIAR E APAGAR)
// =================================================================

// 6. Criar Personagem Novo
app.post('/api/criar-ficha', (req, res) => {
    const { nome, senha } = req.body;
    
    // Validação simples
    if (!nome || !senha) return res.status(400).json({ error: "Nome e senha são obrigatórios" });

    const filePath = path.join(PERSONAGENS_DIR, `${nome.toLowerCase()}.json`);

    // Impede de criar um personagem que já existe (sobrescrever)
    if (fs.existsSync(filePath)) {
        return res.status(400).json({ error: "Já existe um personagem com esse nome!" });
    }

    // O MOLDE DE UMA FICHA VAZIA
    const fichaModelo = {
      "nome": nome,
      "senha": senha,
      "activeTab": "Descrição",
      "vidaAtual": 0,
      "vidaTotalCalculada": 0,
      "atributos": { "n1": 10, "n2": 10, "n3": 10, "n4": 10, "n5": 10, "n6": 10 },
      "pericias": {}, 
      "fotoPerfil": "",
      "inventory": [],
      "spells": [],
      "abilities": []
    };

    // Salva o novo arquivo
    try {
        fs.writeFileSync(filePath, JSON.stringify(fichaModelo, null, 2));
        console.log(`Novo personagem criado: ${nome}`);
        res.json({ ok: true });
    } catch (err) {
        console.error("Erro ao criar arquivo:", err);
        res.status(500).json({ error: "Erro ao salvar arquivo no servidor" });
    }
});

// 7. Deletar Personagem
app.post('/api/deletar-ficha', (req, res) => {
    const { nome } = req.body;
    
    if (!nome) return res.status(400).json({ error: "Nome inválido" });

    const filePath = path.join(PERSONAGENS_DIR, `${nome.toLowerCase()}.json`);

    if (fs.existsSync(filePath)) {
        try {
            fs.unlinkSync(filePath); // Deleta o arquivo do sistema
            console.log(`Personagem deletado: ${nome}`);
            res.json({ ok: true });
        } catch (err) {
            console.error("Erro ao deletar:", err);
            res.status(500).json({ error: "Erro ao excluir arquivo" });
        }
    } else {
        res.status(404).json({ error: "Ficha não encontrada para deletar" });
    }
});

// =================================================================
// INICIALIZAÇÃO
// =================================================================
// Importante: Usar server.listen em vez de app.listen para o Socket.io funcionar
const PORT = process.env.PORT || 3000;
server.listen(PORT, () => console.log(`Back-end D&D rodando na porta ${PORT}...`));