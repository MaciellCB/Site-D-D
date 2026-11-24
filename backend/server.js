require('dotenv').config({ path: require('path').join(__dirname, '.env') });

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
const PLANARALLY_URL = (process.env.PLANARALLY_URL || 'http://localhost:8000').replace(/\/+$/, '');
const PLANARALLY_INTERNAL_URL = (process.env.PLANARALLY_INTERNAL_URL || PLANARALLY_URL).replace(/\/+$/, '');
const SSO_SECRET = process.env.SSO_SECRET;

if (!SSO_SECRET) {
    console.warn('⚠️ Integração PlanarAlly desativada: SSO_SECRET não configurado.');
}

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

const CONDITION_IDS = Object.freeze([
    'blinded', 'charmed', 'deafened', 'frightened', 'grappled', 'incapacitated',
    'invisible', 'paralyzed', 'petrified', 'poisoned', 'prone', 'restrained',
    'stunned', 'unconscious', 'exhaustion', 'concentrating'
]);

// Ficha (character) may be linked to an account via `accountUsername` field
const FichaSchema = new mongoose.Schema({
    nome: { type: String, required: true, unique: true }, 
    senha: { type: String },
    accountUsername: { type: String },
    conditions: {
        type: [{ type: String, enum: CONDITION_IDS }],
        default: []
    },
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

function canEditFicha(account, ficha) {
    return !!account && (
        account.isMaster ||
        !ficha.accountUsername ||
        ficha.accountUsername.toLowerCase() === String(account.username || '').toLowerCase()
    );
}

function characterRoom(characterId) {
    return `character:${characterId}`;
}

async function syncFichaToPlanarAlly(ficha) {
    if (!SSO_SECRET) return false;
    try {
        const response = await fetch(`${PLANARALLY_INTERNAL_URL}/api/sync-ficha`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${SSO_SECRET}`
            },
            body: JSON.stringify({
                characterId: String(ficha._id),
                nome: ficha.nome,
                personagem: ficha.personagem || ficha.nome,
                vidaAtual: ficha.vidaAtual,
                vidaTotalCalculada: ficha.vidaTotalCalculada,
                vidaTempAtual: ficha.vidaTempAtual,
                conditions: Array.isArray(ficha.conditions) ? ficha.conditions : []
            }),
            signal: AbortSignal.timeout(5000)
        });
        if (!response.ok) {
            console.warn(`PlanarAlly rejeitou a sincronização da ficha (HTTP ${response.status}).`);
            return false;
        }
        return true;
    } catch (error) {
        console.warn('Falha ao sincronizar ficha com PlanarAlly:', error.message);
        return false;
    }
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

io.use((socket, next) => {
    const token = socket.handshake.auth && socket.handshake.auth.token;
    if (typeof token === 'string' && token.length > 0) {
        try {
            socket.data.account = jwt.verify(token, JWT_SECRET);
        } catch {
            socket.data.account = null;
        }
    }
    next();
});

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

    socket.on('character:unsubscribe', () => {
        if (socket.data.characterRoom) socket.leave(socket.data.characterRoom);
        socket.data.characterRoom = null;
    });

    socket.on('character:subscribe', async (payload, acknowledge) => {
        const respond = typeof acknowledge === 'function' ? acknowledge : () => {};
        const characterId = payload && String(payload.characterId || '');
        if (!mongoose.Types.ObjectId.isValid(characterId) || !socket.data.account) {
            respond({ ok: false, error: 'unauthorized' });
            return;
        }

        try {
            const ficha = await Ficha.findById(characterId).select('accountUsername');
            if (!ficha || !canEditFicha(socket.data.account, ficha)) {
                respond({ ok: false, error: 'forbidden' });
                return;
            }

            if (socket.data.characterRoom) socket.leave(socket.data.characterRoom);
            socket.data.characterRoom = characterRoom(characterId);
            await socket.join(socket.data.characterRoom);
            respond({ ok: true });
        } catch (error) {
            console.error('Falha ao assinar atualizacoes de condicoes:', error.message);
            respond({ ok: false, error: 'server_error' });
        }
    });

    socket.on('character:condition_toggle', async (payload, acknowledge) => {
        const respond = typeof acknowledge === 'function' ? acknowledge : () => {};
        const characterId = payload && String(payload.characterId || '');
        const condition = payload && payload.condition;
        const active = payload && payload.active;
        if (
            !mongoose.Types.ObjectId.isValid(characterId) ||
            !CONDITION_IDS.includes(condition) ||
            typeof active !== 'boolean' ||
            !socket.data.account
        ) {
            respond({ ok: false, error: 'invalid_request' });
            return;
        }

        try {
            const ficha = await Ficha.findById(characterId);
            if (!ficha || !canEditFicha(socket.data.account, ficha)) {
                respond({ ok: false, error: 'forbidden' });
                return;
            }

            const conditions = new Set(Array.isArray(ficha.conditions) ? ficha.conditions : []);
            if (active) conditions.add(condition);
            else conditions.delete(condition);
            ficha.conditions = [...conditions];
            await ficha.save();

            const update = { characterId, condition, active };
            io.to(characterRoom(characterId)).emit('character:condition_toggle', update);
            const planarAllySynced = await syncFichaToPlanarAlly(ficha);
            respond({ ok: true, planarAllySynced });
        } catch (error) {
            console.error('Falha ao atualizar condicao da ficha:', error.message);
            respond({ ok: false, error: 'server_error' });
        }
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

        const chars = await Ficha.find({ accountUsername: { $regex: new RegExp(`^${acc.username}$`, 'i') } }, 'nome fotoPerfil').lean();
        const linkedCharacters = [...new Set(chars.map(c => c.nome))].sort((a, b) => a.localeCompare(b));

        if (!acc.characters || acc.characters.length !== linkedCharacters.length || !linkedCharacters.every((nome, index) => acc.characters[index] === nome)) {
            await Account.findByIdAndUpdate(acc._id, { $set: { characters: linkedCharacters } });
            acc.characters = linkedCharacters;
        }

        delete acc.passwordHash;
        acc.characterProfiles = chars.map(({ nome, fotoPerfil }) => ({ nome, fotoPerfil: fotoPerfil || '' }));
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
        const fichas = await Ficha.find({ accountUsername: { $exists: true, $ne: '' } }, 'nome accountUsername').lean();
        const linkedByAccount = new Map();
        fichas.forEach(ficha => {
            const key = String(ficha.accountUsername || '').toLowerCase();
            if (!linkedByAccount.has(key)) linkedByAccount.set(key, []);
            linkedByAccount.get(key).push(ficha.nome);
        });
        res.json(accounts.map(account => ({
            ...account,
            characters: linkedByAccount.get(account.username.toLowerCase()) || []
        })));
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

// Edit account credentials (username and/or password) - master only
app.post('/api/accounts/admin/edit', authenticateToken, async (req, res) => {
    try {
        if (!req.account.isMaster) return res.status(403).json({ error: 'Forbidden' });
        const { username, newUsername, newPassword } = req.body;
        if (!username) return res.status(400).json({ error: 'Missing username' });
        const acc = await Account.findOne({ username: { $regex: new RegExp(`^${username}$`, 'i') } });
        if (!acc) return res.status(404).json({ error: 'Account not found' });
        // If changing username, ensure uniqueness
        if (newUsername && newUsername.toLowerCase() !== acc.username.toLowerCase()) {
            const exists = await Account.findOne({ username: { $regex: new RegExp(`^${newUsername}$`, 'i') } });
            if (exists) return res.status(400).json({ error: 'Username already exists' });
        }
        const prevUsername = acc.username;
        if (newPassword) {
            const hash = await bcrypt.hash(newPassword, 10);
            acc.passwordHash = hash;
        }
        if (newUsername) acc.username = newUsername;
        await acc.save();
        // If username changed, update all fichas.accountUsername and account.characters sets
        if (newUsername && newUsername.toLowerCase() !== prevUsername.toLowerCase()) {
            await Ficha.updateMany({ accountUsername: { $regex: new RegExp(`^${prevUsername}$`, 'i') } }, { $set: { accountUsername: newUsername } });
            // Move characters array if needed
            await Account.updateMany({ username: { $regex: new RegExp(`^${prevUsername}$`, 'i') } }, { $unset: { characters: 1 } });
            // Ensure target account has character refs (recompute from fichas)
            const chars = await Ficha.find({ accountUsername: newUsername }, 'nome').lean();
            await Account.findOneAndUpdate({ username: newUsername }, { $set: { characters: chars.map(c => c.nome) } });
        }
        await auditLog(req.account, { ip: req.ip }, 'edit_account', acc.username, { previous: prevUsername });
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
        const fichaData = { ...req.body };
        delete fichaData.collapsedSections;
        ['inventory', 'spells', 'abilities'].forEach(collection => {
            if (Array.isArray(fichaData[collection])) {
                fichaData[collection] = fichaData[collection].map(item => {
                    const cleanItem = { ...item };
                    delete cleanItem.expanded;
                    return cleanItem;
                });
            }
        });
        // Ensure the requester owns this ficha or is master
        const existing = await Ficha.findOne({ nome: { $regex: new RegExp(`^${nome}$`, 'i') } });
        if (existing && existing.accountUsername && existing.accountUsername.toLowerCase() !== req.account.username.toLowerCase() && !req.account.isMaster) {
            return res.status(403).json({ error: 'Forbidden' });
        }
        // If no existing and attempting to upsert without proper ownership, prevent unless master
        if (!existing && fichaData.accountUsername && fichaData.accountUsername.toLowerCase() !== req.account.username.toLowerCase() && !req.account.isMaster) {
            return res.status(403).json({ error: 'Forbidden' });
        }
        const savedFicha = await Ficha.findOneAndUpdate(
            { nome: { $regex: new RegExp(`^${nome}$`, 'i') } },
            fichaData,
            { upsert: true, new: true, lean: true, runValidators: true }
        );
        io.emit('ficha_atualizada', { ...savedFicha, conditions: undefined });
        void syncFichaToPlanarAlly(savedFicha);
        await auditLog(req.account, { ip: req.ip }, 'save_ficha', nome, { size: JSON.stringify(req.body).length });
        res.json({ ok: true });
    } catch (error) { res.status(500).json({ error: "Erro ao salvar" }); }
});

app.post('/api/sync-condition', async (req, res) => {
    if (!SSO_SECRET || req.headers.authorization !== `Bearer ${SSO_SECRET}`) {
        return res.status(401).json({ error: 'Unauthorized' });
    }

    const { characterId, condition, active, tokenId } = req.body || {};
    if (
        !mongoose.Types.ObjectId.isValid(characterId) ||
        typeof condition !== 'string' ||
        !CONDITION_IDS.includes(condition) ||
        typeof active !== 'boolean' ||
        (tokenId !== undefined && (typeof tokenId !== 'string' || tokenId.length > 128))
    ) {
        return res.status(400).json({ error: 'Invalid condition update' });
    }

    try {
        const ficha = await Ficha.findById(characterId);
        if (!ficha) return res.status(404).json({ error: 'Character not found' });

        const conditions = new Set(Array.isArray(ficha.conditions) ? ficha.conditions : []);
        if (active) conditions.add(condition);
        else conditions.delete(condition);
        ficha.conditions = [...conditions];
        await ficha.save();

        const update = {
            characterId: String(ficha._id),
            condition,
            active,
            ...(tokenId !== undefined ? { tokenId } : {})
        };
        io.to(characterRoom(update.characterId)).emit('character:condition_toggle', update);
        res.json({ ok: true, conditions: ficha.conditions });
    } catch (error) {
        console.error('Falha ao sincronizar condição do PlanarAlly:', error.message);
        res.status(500).json({ error: 'Failed to sync condition' });
    }
});

app.get('/api/mapa-sso', authenticateToken, (req, res) => {
    if (!SSO_SECRET) {
        return res.status(503).json({ error: 'Integração PlanarAlly não configurada.' });
    }

    const requestedRedirect = req.query.redirect;
    const redirect = typeof requestedRedirect === 'string'
        && requestedRedirect.startsWith('/')
        && !requestedRedirect.startsWith('//')
        ? requestedRedirect
        : '/';
    const ssoToken = jwt.sign(
        { username: req.account.username, isMaster: req.account.isMaster },
        SSO_SECRET,
        { expiresIn: '2m' }
    );
    const ssoUrl = new URL(`${PLANARALLY_URL}/api/sso`);
    ssoUrl.searchParams.set('token', ssoToken);
    ssoUrl.searchParams.set('redirect', redirect);

    res.json({ url: ssoUrl.toString() });
});

app.get('/api/mapas', authenticateToken, async (req, res) => {
    if (!req.account.isMaster) return res.status(403).json({ error: 'Forbidden' });
    if (!SSO_SECRET) return res.status(503).json({ error: 'Integração PlanarAlly não configurada.' });

    try {
        const response = await fetch(`${PLANARALLY_INTERNAL_URL}/api/mapas`, {
            headers: { 'Authorization': `Bearer ${SSO_SECRET}` },
            signal: AbortSignal.timeout(10000)
        });
        if (!response.ok) {
            console.warn(`PlanarAlly rejeitou a listagem de mapas (HTTP ${response.status}).`);
            return res.status(502).json({ error: 'Não foi possível carregar os mapas do PlanarAlly.' });
        }

        const data = await response.json();
        if (!data || !Array.isArray(data.mapas)) {
            return res.status(502).json({ error: 'Resposta inválida ao carregar mapas do PlanarAlly.' });
        }

        const [accounts, fichas] = await Promise.all([
            Account.find({}, 'username isMaster').lean(),
            Ficha.find({}, 'nome accountUsername planarAllyMap planarAllyMaps').lean()
        ]);
        const linkedByAccount = new Map();
        const associationsByKey = new Map();
        fichas.forEach(ficha => {
            const key = String(ficha.accountUsername || '').toLowerCase();
            if (!linkedByAccount.has(key)) linkedByAccount.set(key, []);
            linkedByAccount.get(key).push(ficha.nome);

            const links = [
                ...(Array.isArray(ficha.planarAllyMaps) ? ficha.planarAllyMaps : []),
                ficha.planarAllyMap
            ].filter(Boolean);
            links.forEach(link => {
                const associationKey = [
                    ficha.nome,
                    link.creator,
                    link.room_name,
                    String(link.location_id)
                ].join('\u0000');
                associationsByKey.set(associationKey, {
                    ficha: ficha.nome,
                    accountUsername: ficha.accountUsername || '',
                    ...link
                });
            });
        });
        res.json({
            mapas: data.mapas,
            contas: accounts.map(account => ({
                username: account.username,
                isMaster: account.isMaster,
                characters: linkedByAccount.get(account.username.toLowerCase()) || []
            })),
            associacoes: Array.from(associationsByKey.values())
        });
    } catch (error) {
        console.error('Erro ao carregar mapas do PlanarAlly:', error.message);
        res.status(502).json({ error: 'Erro de conexão ao carregar mapas do PlanarAlly.' });
    }
});

app.post('/api/mapas/associar', authenticateToken, async (req, res) => {
    if (!req.account.isMaster) return res.status(403).json({ error: 'Forbidden' });
    if (!SSO_SECRET) return res.status(503).json({ error: 'Integração PlanarAlly não configurada.' });

    const { ficha: fichaNome, accountUsername, username, personagem, creator, room_name: roomName, location_id: locationId } = req.body;
    if (![fichaNome, accountUsername, username, personagem, creator, roomName].every(value => typeof value === 'string' && value.trim())
        || (typeof locationId !== 'string' && typeof locationId !== 'number')) {
        return res.status(400).json({ error: 'Informe ficha, conta, usuário PlanarAlly, personagem, campanha e localização.' });
    }

    try {
        const account = await Account.findOne({ username: { $regex: new RegExp(`^${accountUsername.trim()}$`, 'i') } });
        if (!account) return res.status(404).json({ error: 'Conta não encontrada.' });

        const ficha = await Ficha.findOne({
            nome: fichaNome.trim(),
            accountUsername: { $regex: new RegExp(`^${account.username}$`, 'i') }
        });
        if (!ficha) return res.status(404).json({ error: 'Ficha não pertence à conta selecionada.' });

        const response = await fetch(`${PLANARALLY_INTERNAL_URL}/api/associar-mapa`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${SSO_SECRET}`
            },
            body: JSON.stringify({
                username: username.trim(),
                personagem: personagem.trim(),
                creator: creator.trim(),
                room_name: roomName.trim(),
                location_id: locationId
            }),
            signal: AbortSignal.timeout(10000)
        });
        const data = await response.json().catch(() => ({}));
        if (!response.ok || !data.ok || typeof data.redirect_path !== 'string') {
            console.warn(`PlanarAlly rejeitou o vínculo de mapa (HTTP ${response.status}).`);
            return res.status(502).json({ error: data.error || 'PlanarAlly não confirmou o vínculo do mapa.' });
        }

        const planarAllyMap = {
            username: username.trim(),
            personagem: personagem.trim(),
            creator: creator.trim(),
            room_name: roomName.trim(),
            location_id: locationId,
            redirect_path: data.redirect_path,
            location: data.location,
            accountUsername: account.username,
            scope: 'location'
        };
        const existingLinks = [
            ...(Array.isArray(ficha.planarAllyMaps) ? ficha.planarAllyMaps : []),
            ficha.planarAllyMap
        ].filter(Boolean);
        const linksByKey = new Map();
        existingLinks.forEach(link => {
            const key = [link.creator, link.room_name, String(link.location_id)].join('\u0000');
            linksByKey.set(key, link);
        });
        const currentKey = [planarAllyMap.creator, planarAllyMap.room_name, String(planarAllyMap.location_id)].join('\u0000');
        linksByKey.set(currentKey, planarAllyMap);
        ficha.planarAllyMaps = Array.from(linksByKey.values());
        ficha.planarAllyMap = planarAllyMap;
        await ficha.save();

        res.json({
            ok: true,
            ficha: ficha.nome,
            tokens_vinculados: Number(data.tokens_vinculados) || 0,
            ...planarAllyMap
        });
    } catch (error) {
        console.error('Erro ao associar ficha a mapa do PlanarAlly:', error.message);
        res.status(502).json({ error: 'Erro de conexão ao associar ficha ao mapa.' });
    }
});

app.post('/api/mapas/revogar', authenticateToken, async (req, res) => {
    if (!req.account.isMaster) return res.status(403).json({ error: 'Forbidden' });
    if (!SSO_SECRET) return res.status(503).json({ error: 'Integração PlanarAlly não configurada.' });

    const {
        ficha: fichaNome,
        accountUsername,
        creator,
        room_name: roomName,
        location_id: locationId,
        username,
        personagem
    } = req.body;
    if (![fichaNome, accountUsername, creator, roomName, username, personagem].every(value => typeof value === 'string' && value.trim())
        || (typeof locationId !== 'string' && typeof locationId !== 'number')
        || !Number.isSafeInteger(Number(locationId)) || Number(locationId) < 1) {
        return res.status(400).json({ error: 'Informe ficha, conta, usuário, token, campanha e localização.' });
    }

    let remoteRevoked = false;
    try {
        const account = await Account.findOne({ username: { $regex: new RegExp(`^${accountUsername.trim()}$`, 'i') } });
        if (!account) return res.status(404).json({ error: 'Conta não encontrada.' });

        const ficha = await Ficha.findOne({
            nome: fichaNome.trim(),
            accountUsername: { $regex: new RegExp(`^${account.username}$`, 'i') }
        });
        if (!ficha) return res.status(404).json({ error: 'Ficha não pertence à conta selecionada.' });

        const linksByKey = new Map();
        [
            ...(Array.isArray(ficha.planarAllyMaps) ? ficha.planarAllyMaps : []),
            ficha.planarAllyMap
        ].filter(Boolean).forEach(link => {
            const key = [link.creator, link.room_name, String(link.location_id)].join('\u0000');
            linksByKey.set(key, link);
        });
        const currentKey = [creator.trim(), roomName.trim(), String(locationId)].join('\u0000');
        const link = linksByKey.get(currentKey);
        if (!link
            || String(link.username).toLowerCase() !== username.trim().toLowerCase()
            || String(link.personagem).toLowerCase() !== personagem.trim().toLowerCase()) {
            return res.status(404).json({ error: 'Este vínculo não está salvo para a ficha selecionada.' });
        }

        const otherFichas = await Ficha.find({}, 'nome planarAllyMap planarAllyMaps').lean();
        const preserveLocationIds = new Set();
        otherFichas.forEach(otherFicha => {
            const otherLinks = [
                ...(Array.isArray(otherFicha.planarAllyMaps) ? otherFicha.planarAllyMaps : []),
                otherFicha.planarAllyMap
            ].filter(Boolean);
            otherLinks.forEach(otherLink => {
                const isSamePlanarAllyAccess = String(otherLink.username || '').toLowerCase() === link.username.toLowerCase()
                    && String(otherLink.personagem || '').toLowerCase() === String(link.personagem || '').toLowerCase()
                    && otherLink.creator === link.creator
                    && otherLink.room_name === link.room_name;
                const isCurrentLink = otherFicha.nome === ficha.nome
                    && otherLink.creator === link.creator
                    && otherLink.room_name === link.room_name
                    && String(otherLink.location_id) === String(link.location_id)
                    && String(otherLink.username).toLowerCase() === link.username.toLowerCase()
                    && String(otherLink.personagem).toLowerCase() === link.personagem.toLowerCase();
                if (isSamePlanarAllyAccess && !isCurrentLink) {
                    const preserveLocationId = Number(otherLink.location_id);
                    if (Number.isSafeInteger(preserveLocationId)) preserveLocationIds.add(preserveLocationId);
                }
            });
        });

        const response = await fetch(`${PLANARALLY_INTERNAL_URL}/api/revogar-mapa`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${SSO_SECRET}`
            },
            body: JSON.stringify({
                username: link.username,
                personagem: link.personagem,
                creator: link.creator,
                room_name: link.room_name,
                location_id: Number(link.location_id),
                scope: link.scope === 'location' ? 'location' : 'room',
                preserve_location_ids: Array.from(preserveLocationIds)
            }),
            signal: AbortSignal.timeout(10000)
        });
        const data = await response.json().catch(() => ({}));
        if (!response.ok || !data.ok) {
            console.warn(`PlanarAlly rejeitou a revogação do vínculo (HTTP ${response.status}).`);
            return res.status(502).json({ error: data.error || 'PlanarAlly não confirmou a revogação.' });
        }
        remoteRevoked = true;

        const remainingLinks = Array.from(linksByKey.entries())
            .filter(([key, savedLink]) => key !== currentKey || savedLink !== link)
            .map(([, savedLink]) => savedLink);
        ficha.planarAllyMaps = remainingLinks;
        ficha.planarAllyMap = remainingLinks.length ? remainingLinks[remainingLinks.length - 1] : undefined;
        await ficha.save();

        await auditLog(req.account, { ip: req.ip }, 'revoke_map_access', ficha.nome, {
            username: link.username,
            personagem: link.personagem,
            creator: link.creator,
            room_name: link.room_name,
            location_id: link.location_id,
            tokens_revogados: Number(data.tokens_revogados) || 0
        });
        res.json({
            ok: true,
            ficha: ficha.nome,
            tokens_revogados: Number(data.tokens_revogados) || 0
        });
    } catch (error) {
        console.error('Erro ao revogar acesso ao mapa:', error.message);
        res.status(remoteRevoked ? 500 : 502).json({
            error: remoteRevoked
                ? 'Acesso revogado no PlanarAlly, mas não foi possível atualizar o vínculo salvo. Atualize os mapas e tente novamente.'
                : 'Erro de conexão ao revogar acesso no PlanarAlly.'
        });
    }
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

// Remove character from account linkage (master only)
app.post('/api/ficha/unlink-account', authenticateToken, async (req, res) => {
    try {
        if (!req.account.isMaster) return res.status(403).json({ error: 'Forbidden' });
        const { nome, accountUsername } = req.body;
        if (!nome || !accountUsername) return res.status(400).json({ error: 'Missing name or account' });
        
        await Ficha.findOneAndUpdate(
            { nome: { $regex: new RegExp(`^${nome}$`, 'i') } },
            { $unset: { accountUsername: 1 } }
        );
        
        await Account.findOneAndUpdate(
            { username: { $regex: new RegExp(`^${accountUsername}$`, 'i') } },
            { $pull: { characters: nome } }
        );
        
        await auditLog(req.account, { ip: req.ip }, 'unlink_character', nome, { account: accountUsername });
        res.json({ ok: true });
    } catch (error) { res.status(500).json({ error: "Erro ao desvincular." }); }
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

