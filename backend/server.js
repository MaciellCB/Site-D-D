const express = require('express');
const cors = require('cors');
const http = require('http');
const { Server } = require('socket.io');
const mongoose = require('mongoose');
const fs = require('fs');
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

// --- CONEXÃO COM O MONGODB ---
const mongoURI = process.env.MONGO_URI; 

if (!mongoURI) {
    console.log("⚠️ AVISO: Rodando sem Banco de Dados (MONGO_URI não encontrado).");
} else {
    mongoose.connect(mongoURI)
        .then(() => console.log("✅ Conectado ao MongoDB com sucesso!"))
        .catch(err => console.error("❌ Erro ao conectar no MongoDB:", err));
}

// --- MODELOS ---
const FichaSchema = new mongoose.Schema({
    nome: { type: String, required: true, unique: true }, 
    senha: { type: String, required: true },
}, { strict: false }); 
const Ficha = mongoose.model('Ficha', FichaSchema);

const LayoutSchema = new mongoose.Schema({
    id: { type: String, default: "master_layout" },
    folders: [{ id: String, name: String, items: [String] }],
    uncategorized: [String]
});
const Layout = mongoose.model('Layout', LayoutSchema);


// --- MODELO DO MAPA (PINS) ---
const PinSchema = new mongoose.Schema({
    id: { type: Number, required: true, unique: true },
    lat: Number,
    lng: Number,
    nome: String,
    desc: String,
    icon: String,
    gallery: [String]
});
const Pin = mongoose.model('Pin', PinSchema);

// --- MEMÓRIA DA INICIATIVA ---
let serverTrackerList = []; 

// --- SOCKET.IO ---
io.on('connection', (socket) => {
    console.log('Cliente conectado:', socket.id);

    // 1. Envia lista atual ao conectar
    socket.emit('sync_tracker_update', serverTrackerList);

    // 2. Rolagem de dados (visual)
    socket.on('dados_rolados', (data) => {
        io.emit('dados_rolados', data); 
    });

    // 3. Atualização Total (Remover/Limpar/Reordenar)
    socket.on('update_tracker', (lista) => {
        serverTrackerList = lista;
        io.emit('sync_tracker_update', serverTrackerList);
    });

    // 4. Adição Individual (Rolar Iniciativa/Adicionar Mob)
    socket.on('add_to_tracker', (item) => {
        // Verifica se já existe para atualizar, senão adiciona
        const idx = serverTrackerList.findIndex(x => x.name === item.name);
        if (idx >= 0) {
            serverTrackerList[idx] = item; 
        } else {
            serverTrackerList.push(item); 
        }
        io.emit('sync_tracker_update', serverTrackerList);
    });
});

// =================================================================
// ROTAS GERAIS E DE ARQUIVOS
// =================================================================
app.get('/api/catalog/:tipo', (req, res) => {
    const tipo = req.params.tipo;
    let possiblePaths = [ path.join(__dirname, 'data', `${tipo}.json`), path.join(__dirname, 'data', `${tipo}_db.json`) ];
    let fileData = [];
    let found = false;
    for (let p of possiblePaths) {
        if (fs.existsSync(p)) {
            try { fileData = JSON.parse(fs.readFileSync(p, 'utf-8')); found = true; break; } 
            catch (e) { console.error(`Erro arquivo ${p}:`, e); }
        }
    }
    res.json(found ? fileData : []); 
});

// --- ROTAS LAYOUT ---
app.get('/api/layout', async (req, res) => {
    try {
        let layout = await Layout.findOne({ id: "master_layout" });
        if (!layout) { layout = new Layout({ folders: [], uncategorized: [] }); await layout.save(); }
        res.json(layout);
    } catch (error) { res.status(500).json({ error: "Erro ao carregar layout" }); }
});

app.post('/api/save-layout', async (req, res) => {
    try {
        await Layout.findOneAndUpdate({ id: "master_layout" }, { folders: req.body.folders, uncategorized: req.body.uncategorized }, { upsert: true, new: true });
        res.json({ ok: true });
    } catch (error) { res.status(500).json({ error: "Erro ao salvar layout" }); }
});

// --- ROTAS PERSONAGEM ---
app.get('/api/lista-personagens', async (req, res) => {
    try {
        const fichas = await Ficha.find({}, 'nome');
        res.json(fichas.map(f => f.nome));
    } catch (error) { res.status(500).json({ error: 'Erro ao buscar lista' }); }
});

app.post('/api/criar-ficha', async (req, res) => {
    try {
        const { nome, senha } = req.body;
        if (!nome || !senha) return res.status(400).json({ error: "Obrigatórios" });
        const existe = await Ficha.findOne({ nome: { $regex: new RegExp(`^${nome}$`, 'i') } });
        if (existe) return res.status(400).json({ error: "Já existe!" });
        const novaFicha = new Ficha(req.body);
        novaFicha.nome = nome; novaFicha.senha = senha;
        await novaFicha.save();
        res.json({ ok: true });
    } catch (error) { res.status(500).json({ error: "Erro ao criar." }); }
});

app.post('/api/load-ficha-mestre', async (req, res) => {
    try {
        const ficha = await Ficha.findOne({ nome: { $regex: new RegExp(`^${req.body.nome}$`, 'i') } });
        if (!ficha) return res.status(404).json({ error: "Não encontrado" });
        res.json(ficha);
    } catch (error) { res.status(500).json({ error: "Erro interno" }); }
});

app.post('/api/load-ficha', async (req, res) => {
    try {
        const ficha = await Ficha.findOne({ nome: { $regex: new RegExp(`^${req.body.nome}$`, 'i') } });
        if (!ficha) return res.status(404).send();
        if (ficha.senha !== req.body.senha) return res.status(401).send();
        res.json(ficha);
    } catch (error) { res.status(500).send(); }
});

app.post('/api/save-ficha', async (req, res) => {
    try {
        await Ficha.findOneAndUpdate({ nome: { $regex: new RegExp(`^${req.body.nome}$`, 'i') } }, req.body, { upsert: true });
        io.emit('ficha_atualizada', req.body);
        res.json({ ok: true });
    } catch (error) { res.status(500).json({ error: "Erro ao salvar" }); }
});

app.post('/api/deletar-ficha', async (req, res) => {
    try {
        await Ficha.findOneAndDelete({ nome: { $regex: new RegExp(`^${req.body.nome}$`, 'i') } });
        res.json({ ok: true });
    } catch (error) { res.status(500).json({ error: "Erro ao deletar" }); }
});

app.post('/api/editar-credenciais', async (req, res) => {
    try {
        const { nomeAntigo, novoNome, novaSenha } = req.body;
        if (nomeAntigo.toLowerCase() !== novoNome.toLowerCase()) {
            const existe = await Ficha.findOne({ nome: { $regex: new RegExp(`^${novoNome}$`, 'i') } });
            if (existe) return res.status(400).json({ error: "Nome já existe!" });
        }
        await Ficha.findOneAndUpdate({ nome: { $regex: new RegExp(`^${nomeAntigo}$`, 'i') } }, { $set: { nome: novoNome, senha: novaSenha } });
        res.json({ ok: true });
    } catch (error) { res.status(500).json({ error: "Erro ao editar." }); }
});

// =================================================================
// ROTAS DO MAPA DE RUNETERRA
// =================================================================

// Buscar todos os marcadores
app.get('/api/mapa-pins', async (req, res) => {
    try {
        const pins = await Pin.find({});
        res.json(pins);
    } catch (error) { res.status(500).json({ error: 'Erro ao buscar pins' }); }
});

// Salvar ou Atualizar um marcador
app.post('/api/mapa-pins', async (req, res) => {
    try {
        await Pin.findOneAndUpdate({ id: req.body.id }, req.body, { upsert: true, new: true });
        res.json({ ok: true });
    } catch (error) { res.status(500).json({ error: 'Erro ao salvar pin' }); }
});

// Deletar um marcador
app.delete('/api/mapa-pins/:id', async (req, res) => {
    try {
        await Pin.findOneAndDelete({ id: req.params.id });
        res.json({ ok: true });
    } catch (error) { res.status(500).json({ error: 'Erro ao deletar pin' }); }
});



const PORT = process.env.PORT || 3000;
server.listen(PORT, () => console.log(`Rodando na porta ${PORT}`));