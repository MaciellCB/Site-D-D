const express = require('express');
const cors = require('cors');
const http = require('http');
const { Server } = require('socket.io');
const mongoose = require('mongoose');
const fs = require('fs'); // VOLTAMOS COM O FS (Para ler os arquivos do sistema)
const path = require('path');

// --- CONFIGURAÇÃO DO APP ---
const app = express();
const server = http.createServer(app);

// Configuração do CORS
const io = new Server(server, {
    cors: { origin: "*", methods: ["GET", "POST"] }
});
app.use(cors());
app.use(express.json({ limit: '10mb' }));

// --- CONEXÃO COM O MONGODB (Para Fichas) ---
const mongoURI = process.env.MONGO_URI; 

if (!mongoURI) {
    console.log("⚠️ AVISO: Rodando sem Banco de Dados (MONGO_URI não encontrado).");
} else {
    mongoose.connect(mongoURI)
        .then(() => console.log("✅ Conectado ao MongoDB com sucesso!"))
        .catch(err => console.error("❌ Erro ao conectar no MongoDB:", err));
}

// --- MODELO DA FICHA (MongoDB) ---
const FichaSchema = new mongoose.Schema({
    nome: { type: String, required: true, unique: true }, 
    senha: { type: String, required: true },
}, { strict: false }); 

const Ficha = mongoose.model('Ficha', FichaSchema);

// --- SOCKET.IO ---
io.on('connection', (socket) => {
    console.log('Cliente conectado via Socket:', socket.id);
});

// =================================================================
// ROTAS DO SISTEMA (LENDO SEUS ARQUIVOS JSON ANTIGOS)
// =================================================================
// Essa rota permite que o site pegue classes, raças, magias, etc.
app.get('/api/catalog/:tipo', (req, res) => {
    const tipo = req.params.tipo;
    // Procura o arquivo na pasta 'data' (ex: classes_db.json, spells.json)
    // Tenta achar com ou sem o "_db" no nome pra garantir
    let possiblePaths = [
        path.join(__dirname, 'data', `${tipo}.json`),
        path.join(__dirname, 'data', `${tipo}_db.json`)
    ];

    let fileData = [];
    let found = false;

    for (let p of possiblePaths) {
        if (fs.existsSync(p)) {
            try {
                const raw = fs.readFileSync(p, 'utf-8');
                fileData = JSON.parse(raw);
                found = true;
                break;
            } catch (e) {
                console.error(`Erro ao ler arquivo ${p}:`, e);
            }
        }
    }

    if (found) {
        res.json(fileData);
    } else {
        console.log(`Arquivo não encontrado para: ${tipo}`);
        res.json([]); // Retorna lista vazia se não achar
    }
});

// =================================================================
// ROTAS DE PERSONAGEM (USANDO MONGODB)
// =================================================================

// 1. LISTAR PERSONAGENS
app.get('/api/lista-personagens', async (req, res) => {
    try {
        const fichas = await Ficha.find({}, 'nome');
        const listaNomes = fichas.map(f => f.nome);
        res.json(listaNomes);
    } catch (error) {
        res.status(500).json({ error: 'Erro ao buscar lista' });
    }
});

// 2. CRIAR NOVA FICHA
app.post('/api/criar-ficha', async (req, res) => {
    try {
        const { nome, senha } = req.body;
        if (!nome || !senha) return res.status(400).json({ error: "Nome e senha obrigatórios" });

        const existe = await Ficha.findOne({ nome: { $regex: new RegExp(`^${nome}$`, 'i') } });
        if (existe) return res.status(400).json({ error: "Já existe!" });

        const novaFicha = new Ficha({
            nome: nome,
            senha: senha,
            activeTab: "Descrição",
            vidaAtual: 0,
            atributos: { n1: 10, n2: 10, n3: 10, n4: 10, n5: 10, n6: 10 },
            fotoPerfil: ""
        });

        await novaFicha.save();
        res.json({ ok: true });
    } catch (error) {
        res.status(500).json({ error: "Erro ao criar" });
    }
});

// 3. CARREGAR FICHA (MESTRE)
app.post('/api/load-ficha-mestre', async (req, res) => {
    try {
        const { nome } = req.body;
        const ficha = await Ficha.findOne({ nome: { $regex: new RegExp(`^${nome}$`, 'i') } });
        if (!ficha) return res.status(404).json({ error: "Não encontrado" });
        res.json(ficha);
    } catch (error) {
        res.status(500).json({ error: "Erro interno" });
    }
});

// 4. CARREGAR FICHA (JOGADOR)
app.post('/api/load-ficha', async (req, res) => {
    try {
        const { nome, senha } = req.body;
        const ficha = await Ficha.findOne({ nome: { $regex: new RegExp(`^${nome}$`, 'i') } });

        if (!ficha) return res.status(404).send();
        if (ficha.senha !== senha) return res.status(401).send();

        res.json(ficha);
    } catch (error) {
        res.status(500).send();
    }
});

// 5. SALVAR/ATUALIZAR FICHA
app.post('/api/save-ficha', async (req, res) => {
    try {
        const dados = req.body;
        await Ficha.findOneAndUpdate(
            { nome: { $regex: new RegExp(`^${dados.nome}$`, 'i') } },
            dados,
            { upsert: true }
        );
        io.emit('ficha_atualizada', dados);
        res.json({ ok: true });
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: "Erro ao salvar" });
    }
});

// 6. DELETAR FICHA
app.post('/api/deletar-ficha', async (req, res) => {
    try {
        const { nome } = req.body;
        await Ficha.findOneAndDelete({ nome: { $regex: new RegExp(`^${nome}$`, 'i') } });
        res.json({ ok: true });
    } catch (error) {
        res.status(500).json({ error: "Erro ao deletar" });
    }
});

const PORT = process.env.PORT || 3000;
server.listen(PORT, () => console.log(`Rodando na porta ${PORT}`));