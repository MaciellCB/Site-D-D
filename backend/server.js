const express = require('express');
const cors = require('cors');
const http = require('http');
const { Server } = require('socket.io');
const mongoose = require('mongoose');
const fs = require('fs');
const path = require('path');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

const JWT_SECRET = process.env.JWT_SECRET || 'dev_secret_change_me';

// --- CONFIGURAÇÃO DO APP ---
const app = express();
const server = http.createServer(app);

// Configuração do CORS
const io = new Server(server, {
    cors: { origin: "*", methods: ["GET", "POST"] }
});
app.use(cors());

// Limite aumentado para aceitar dados do mapa
app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ limit: '50mb', extended: true }));

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
// Account model: users who own one or more fichas (characters)
const AccountSchema = new mongoose.Schema({
    username: { type: String, required: true, unique: true },
    passwordHash: { type: String, required: true },
    isMaster: { type: Boolean, default: false },
    preferences: { type: mongoose.Schema.Types.Mixed, default: {} },
    characters: [{ type: String }]
}, { timestamps: true });
const Account = mongoose.model('Account', AccountSchema);

// Ficha (character) may be linked to an account via `accountUsername` field
const FichaSchema = new mongoose.Schema({
    nome: { type: String, required: true, unique: true }, 
    senha: { type: String },
    accountUsername: { type: String },
}, { strict: false }); 
const Ficha = mongoose.model('Ficha', FichaSchema);

// Audit log schema to record important actions
const AuditSchema = new mongoose.Schema({
    actorId: String,
    actorUsername: String,
    ip: String,
    action: String,
    targetName: String,
    details: mongoose.Schema.Types.Mixed
}, { timestamps: true });
const Audit = mongoose.model('Audit', AuditSchema);

async function auditLog(reqAccount, reqObj, action, targetName, details) {
    try {
        const entry = new Audit({
            actorId: reqAccount ? reqAccount.id : null,
            actorUsername: reqAccount ? reqAccount.username : (reqObj && reqObj.username) || null,
            ip: (reqObj && reqObj.ip) || null,
            action,
            targetName,
            details: details || {}
        });
        await entry.save();
    } catch (e) { console.warn('Falha ao gravar audit log', e.message); }
}

const LayoutSchema = new mongoose.Schema({
    id: { type: String, default: "master_layout" },
    folders: [{ id: String, name: String, items: [String] }],
    uncategorized: [String]
});
const Layout = mongoose.model('Layout', LayoutSchema);

const PinSchema = new mongoose.Schema({
    id: { type: Number, required: true, unique: true },
    lat: Number,
    lng: Number,
    nome: String,
    desc: String,
    icon: String,
    gallery: [String]
    }, { strict: false });
const Pin = mongoose.model('Pin', PinSchema);

let serverTrackerList = []; 

io.on('connection', (socket) => {
    console.log('Cliente conectado:', socket.id);
    socket.emit('sync_tracker_update', serverTrackerList);
    socket.on('dados_rolados', (data) => { io.emit('dados_rolados', data); });
    socket.on('update_tracker', (lista) => {
        serverTrackerList = lista;
        io.emit('sync_tracker_update', serverTrackerList);
    });
    socket.on('add_to_tracker', (item) => {
        const normalizeName = (value = '') => String(value).normalize('NFD').replace(/[\u0300-\u036f]/g, '').toLowerCase().trim();
        const key = normalizeName(item?.name);
        const idx = serverTrackerList.findIndex(x => normalizeName(x?.name) === key);
        if (idx >= 0) { serverTrackerList[idx] = item; } else { serverTrackerList.push(item); }
        io.emit('sync_tracker_update', serverTrackerList);
    });
});

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

app.get('/api/lista-personagens', async (req, res) => {
    try {
        const fichas = await Ficha.find({}, 'nome');
        res.json(fichas.map(f => f.nome));
    } catch (error) { res.status(500).json({ error: 'Erro ao buscar lista' }); }
});

app.post('/api/criar-ficha', authenticateToken, async (req, res) => {
    try {
        const { nome, senha, accountUsername } = req.body;
        if (!nome) return res.status(400).json({ error: "Nome é obrigatório" });
        // If creating for an account, ensure requestor owns that account or is master
        if (accountUsername && accountUsername.toLowerCase() !== req.account.username.toLowerCase() && !req.account.isMaster) {
            return res.status(403).json({ error: 'Forbidden' });
        }
        const existe = await Ficha.findOne({ nome: { $regex: new RegExp(`^${nome}$`, 'i') } });
        if (existe) return res.status(400).json({ error: "Já existe!" });
        const novaFicha = new Ficha(req.body);
        novaFicha.nome = nome;
        if (senha) novaFicha.senha = senha; // legacy support
        if (accountUsername) novaFicha.accountUsername = accountUsername;
        await novaFicha.save();
        // if linked to account, add to account.characters
        if (accountUsername) {
            await Account.findOneAndUpdate({ username: accountUsername }, { $addToSet: { characters: nome } });
        }
        // audit
        await auditLog(req.account, { ip: req.ip }, 'create_ficha', nome, { accountUsername });
        res.json({ ok: true });
    } catch (error) { res.status(500).json({ error: "Erro ao criar." }); }
});

// --- AUTH: registration, login, profile ---
function authenticateToken(req, res, next) {
    const auth = req.headers.authorization;
    if (!auth || !auth.startsWith('Bearer ')) return res.status(401).json({ error: 'Unauthorized' });
    const token = auth.substring(7);
    try {
        const payload = jwt.verify(token, JWT_SECRET);
        req.account = payload;
        next();
    } catch (e) { return res.status(401).json({ error: 'Invalid token' }); }
}

app.post('/api/accounts/register', async (req, res) => {
    try {
        const { username, password, isMaster } = req.body;
        if (!username || !password) return res.status(400).json({ error: 'Missing' });
        const exists = await Account.findOne({ username: { $regex: new RegExp(`^${username}$`, 'i') } });
        if (exists) return res.status(400).json({ error: 'Username exists' });
        const hash = await bcrypt.hash(password, 10);
        const acc = new Account({ username, passwordHash: hash, isMaster: !!isMaster });
        await acc.save();
        const token = jwt.sign({ id: acc._id, username: acc.username, isMaster: acc.isMaster }, JWT_SECRET, { expiresIn: '30d' });
        res.json({ token });
    } catch (e) { res.status(500).json({ error: 'Error' }); }
});

app.post('/api/accounts/login', async (req, res) => {
    try {
        const { username, password } = req.body;
        if (!username || !password) return res.status(400).json({ error: 'Missing' });
        const acc = await Account.findOne({ username: { $regex: new RegExp(`^${username}$`, 'i') } });
        if (!acc) return res.status(401).json({ error: 'Invalid' });
        const ok = await bcrypt.compare(password, acc.passwordHash);
        if (!ok) return res.status(401).json({ error: 'Invalid' });
        const token = jwt.sign({ id: acc._id, username: acc.username, isMaster: acc.isMaster }, JWT_SECRET, { expiresIn: '30d' });
        res.json({ token });
    } catch (e) { res.status(500).json({ error: 'Error' }); }
});

app.get('/api/accounts/me', authenticateToken, async (req, res) => {
    try {
        const acc = await Account.findById(req.account.id).lean();
        if (!acc) return res.status(404).json({ error: 'Not found' });
        delete acc.passwordHash;
        res.json(acc);
    } catch (e) { res.status(500).json({ error: 'Error' }); }
});

app.put('/api/accounts/preferences', authenticateToken, async (req, res) => {
    try {
        const prefs = req.body.preferences || {};
        await Account.findByIdAndUpdate(req.account.id, { $set: { preferences: prefs } });
        res.json({ ok: true });
    } catch (e) { res.status(500).json({ error: 'Error' }); }
});

// --- Admin account management (minimal) ---
app.get('/api/accounts/list', authenticateToken, async (req, res) => {
    try {
        if (!req.account.isMaster) return res.status(403).json({ error: 'Forbidden' });
        const accounts = await Account.find({}, '-passwordHash').lean();
        res.json(accounts);
    } catch (e) { res.status(500).json({ error: 'Error' }); }
});

app.post('/api/accounts/admin/update', authenticateToken, async (req, res) => {
    try {
        if (!req.account.isMaster) return res.status(403).json({ error: 'Forbidden' });
        const { username, isMaster } = req.body;
        if (!username) return res.status(400).json({ error: 'Missing' });
        await Account.findOneAndUpdate({ username: { $regex: new RegExp(`^${username}$`, 'i') } }, { $set: { isMaster: !!isMaster } });
        res.json({ ok: true });
    } catch (e) { res.status(500).json({ error: 'Error' }); }
});

app.post('/api/accounts/admin/delete', authenticateToken, async (req, res) => {
    try {
        if (!req.account.isMaster) return res.status(403).json({ error: 'Forbidden' });
        const { username } = req.body;
        if (!username) return res.status(400).json({ error: 'Missing' });
        await Account.findOneAndDelete({ username: { $regex: new RegExp(`^${username}$`, 'i') } });
        // Optionally, you may also orphan linked fichas or remove accountUsername
        await Ficha.updateMany({ accountUsername: { $regex: new RegExp(`^${username}$`, 'i') } }, { $unset: { accountUsername: 1 } });
        res.json({ ok: true });
    } catch (e) { res.status(500).json({ error: 'Error' }); }
});

app.post('/api/load-ficha-mestre', authenticateToken, async (req, res) => {
    try {
        if (!req.account.isMaster) return res.status(403).json({ error: 'Forbidden' });
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

// Load ficha by account (authenticated)
app.post('/api/load-ficha-account', authenticateToken, async (req, res) => {
    try {
        const nome = req.body.nome;
        if (!nome) return res.status(400).json({ error: 'Missing name' });
        const ficha = await Ficha.findOne({ nome: { $regex: new RegExp(`^${nome}$`, 'i') }, accountUsername: req.account.username });
        if (!ficha) return res.status(404).json({ error: 'Not found' });
        res.json(ficha);
    } catch (e) { res.status(500).json({ error: 'Error' }); }
});

app.post('/api/save-ficha', authenticateToken, async (req, res) => {
    try {
        const nome = req.body.nome;
        if (!nome) return res.status(400).json({ error: 'Missing name' });
        // Ensure the requester owns this ficha or is master
        const existing = await Ficha.findOne({ nome: { $regex: new RegExp(`^${nome}$`, 'i') } });
        if (existing && existing.accountUsername && existing.accountUsername.toLowerCase() !== req.account.username.toLowerCase() && !req.account.isMaster) {
            return res.status(403).json({ error: 'Forbidden' });
        }
        // If no existing and attempting to upsert without proper ownership, prevent unless master
        if (!existing && req.body.accountUsername && req.body.accountUsername.toLowerCase() !== req.account.username.toLowerCase() && !req.account.isMaster) {
            return res.status(403).json({ error: 'Forbidden' });
        }
        await Ficha.findOneAndUpdate({ nome: { $regex: new RegExp(`^${nome}$`, 'i') } }, req.body, { upsert: true });
        io.emit('ficha_atualizada', req.body);
        await auditLog(req.account, { ip: req.ip }, 'save_ficha', nome, { size: JSON.stringify(req.body).length });
        res.json({ ok: true });
    } catch (error) { res.status(500).json({ error: "Erro ao salvar" }); }
});

app.post('/api/deletar-ficha', authenticateToken, async (req, res) => {
    try {
        const nome = req.body.nome;
        if (!nome) return res.status(400).json({ error: 'Missing name' });
        const existing = await Ficha.findOne({ nome: { $regex: new RegExp(`^${nome}$`, 'i') } });
        if (!existing) return res.status(404).json({ error: 'Not found' });
        if (existing.accountUsername && existing.accountUsername.toLowerCase() !== req.account.username.toLowerCase() && !req.account.isMaster) {
            return res.status(403).json({ error: 'Forbidden' });
        }
        await Ficha.findOneAndDelete({ nome: { $regex: new RegExp(`^${nome}$`, 'i') } });
        await auditLog(req.account, { ip: req.ip }, 'delete_ficha', nome, {});
        res.json({ ok: true });
    } catch (error) { res.status(500).json({ error: "Erro ao deletar" }); }
});

app.post('/api/editar-credenciais', authenticateToken, async (req, res) => {
    try {
        const { nomeAntigo, novoNome, novaSenha } = req.body;
        const existing = await Ficha.findOne({ nome: { $regex: new RegExp(`^${nomeAntigo}$`, 'i') } });
        if (!existing) return res.status(404).json({ error: 'Not found' });
        // Only owner or master can change credentials
        if (existing.accountUsername && existing.accountUsername.toLowerCase() !== req.account.username.toLowerCase() && !req.account.isMaster) {
            return res.status(403).json({ error: 'Forbidden' });
        }
        if (nomeAntigo.toLowerCase() !== novoNome.toLowerCase()) {
            const existe = await Ficha.findOne({ nome: { $regex: new RegExp(`^${novoNome}$`, 'i') } });
            if (existe) return res.status(400).json({ error: "Nome já existe!" });
        }
        await Ficha.findOneAndUpdate({ nome: { $regex: new RegExp(`^${nomeAntigo}$`, 'i') } }, { $set: { nome: novoNome, senha: novaSenha } });
        await auditLog(req.account, { ip: req.ip }, 'edit_credentials', novoNome, { previous: nomeAntigo });
        res.json({ ok: true });
    } catch (error) { res.status(500).json({ error: "Erro ao editar." }); }
});

app.get('/api/mapa-pins', async (req, res) => {
    try {
        const pins = await Pin.find({});
        res.json(pins);
    } catch (error) { res.status(500).json({ error: 'Erro ao buscar pins' }); }
});

app.post('/api/mapa-pins', async (req, res) => {
    try {
        // Verifica se o frontend está mandando uma lista completa (Array)
        if (Array.isArray(req.body)) {
            // Limpa o banco e reinsere os dados novos
            // Isso garante que os pins apagados no mapa também sumam do banco
            await Pin.deleteMany({});
            
            if (req.body.length > 0) {
                await Pin.insertMany(req.body);
            }
        } else {
            // Mantém o fallback caso envie apenas 1 objeto
            await Pin.findOneAndUpdate({ id: req.body.id }, req.body, { upsert: true, new: true });
        }
        res.json({ ok: true });
    } catch (error) { 
        console.error("Erro ao salvar no banco:", error.message);
        res.status(500).json({ error: 'Erro ao salvar pin. A imagem pode ser grande demais.' }); 
    }
});

app.delete('/api/mapa-pins/:id', async (req, res) => {
    try {
        await Pin.findOneAndDelete({ id: req.params.id });
        res.json({ ok: true });
    } catch (error) { res.status(500).json({ error: 'Erro ao deletar pin' }); }
});

const PORT = process.env.PORT || 3000;
server.listen(PORT, () => console.log(`Rodando na porta ${PORT}`));

// --- STARTUP: ensure a master account exists (temporary convenience)
// To disable automatic creation in production set SKIP_CREATE_DEFAULT_MASTER=1
;(async function ensureDefaultMaster(){
    try {
        if (!mongoURI) return; // no DB configured
        if (process.env.SKIP_CREATE_DEFAULT_MASTER === '1') return;
        const anyMaster = await Account.findOne({ isMaster: true }).lean();
        if (!anyMaster) {
            const defaultUser = process.env.DEFAULT_MASTER_USERNAME || 'mestre';
            const defaultPass = process.env.DEFAULT_MASTER_PASSWORD || 'mestre';
            const hash = await bcrypt.hash(defaultPass, 10);
            const acc = new Account({ username: defaultUser, passwordHash: hash, isMaster: true });
            await acc.save();
            console.warn(`⚠️ Default master account created: ${defaultUser}/${defaultPass} — remove or change in production.`);
        }
    } catch (e) {
        console.error('Erro ao garantir conta mestre padrão:', e && e.message);
    }
})();