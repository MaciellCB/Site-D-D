const express = require('express');
const cors = require('cors');
const fs = require('fs');
const path = require('path');
const http = require('http'); // Necessário para o Socket.io
const { Server } = require('socket.io'); // Importa o Socket.io

const app = express();
const server = http.createServer(app); // Cria o servidor HTTP manuamente

// Configura o Socket.io com permissão de CORS (para aceitar conexões do navegador)
const io = new Server(server, {
    cors: {
        origin: "*",
        methods: ["GET", "POST"]
    }
});

app.use(cors());
app.use(express.json({ limit: '10mb' }));

const PERSONAGENS_DIR = path.join(__dirname, 'data', 'personagens');

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
// ROTAS
// =================================================================

app.get('/api/lista-personagens', (req, res) => {
    fs.readdir(PERSONAGENS_DIR, (err, files) => {
        if (err) return res.status(500).json({ error: 'Erro ao ler diretório' });
        const lista = files.filter(file => file.endsWith('.json')).map(file => file.replace('.json', ''));
        res.json(lista);
    });
});

app.post('/api/load-ficha-mestre', (req, res) => {
    try {
        const { nome } = req.body;
        const filePath = path.join(PERSONAGENS_DIR, `${nome.toLowerCase()}.json`);
        if (!fs.existsSync(filePath)) return res.status(404).json({ error: "Arquivo inexistente" });
        const ficha = JSON.parse(fs.readFileSync(filePath, 'utf-8'));
        res.json(ficha);
    } catch (error) {
        res.status(500).json({ error: "Erro interno" });
    }
});

app.post('/api/load-ficha', (req, res) => {
    const { nome, senha } = req.body;
    const filePath = path.join(PERSONAGENS_DIR, `${nome.toLowerCase()}.json`);
    if (!fs.existsSync(filePath)) return res.status(404).send();
    const ficha = JSON.parse(fs.readFileSync(filePath));
    if (ficha.senha !== senha) return res.status(401).send();
    res.json(ficha);
});

// --- ROTA DE SALVAR (AQUI ESTÁ A MÁGICA) ---
app.post('/api/save-ficha', (req, res) => {
    const ficha = req.body;
    const filePath = path.join(PERSONAGENS_DIR, `${ficha.nome.toLowerCase()}.json`);
    
    fs.writeFileSync(filePath, JSON.stringify(ficha, null, 2));
    
    console.log(`Ficha salva: ${ficha.nome}`);

    // AVISA A TODOS OS NAVEGADORES CONECTADOS QUE ESSA FICHA MUDOU
    io.emit('ficha_atualizada', ficha); 

    res.json({ ok: true });
});

app.get('/api/catalog/:tipo', (req, res) => {
    const filePath = path.join(__dirname, 'data', `${req.params.tipo}.json`);
    if (fs.existsSync(filePath)) {
        res.json(JSON.parse(fs.readFileSync(filePath)));
    } else {
        res.json([]);
    }
});

// Importante: Usar server.listen em vez de app.listen
server.listen(3000, () => console.log("Back-end D&D (com Socket.io) rodando na porta 3000..."));