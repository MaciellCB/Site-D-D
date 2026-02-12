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

// --- MODELO DA FICHA ---
const FichaSchema = new mongoose.Schema({
    nome: { type: String, required: true, unique: true }, 
    senha: { type: String, required: true },
    // Campos flexíveis para o restante da ficha
}, { strict: false }); 

const Ficha = mongoose.model('Ficha', FichaSchema);

// --- MODELO DO LAYOUT (PASTAS) ---
// Isso salva a organização do mestre
const LayoutSchema = new mongoose.Schema({
    id: { type: String, default: "master_layout" },
    folders: [
        {
            id: String,
            name: String,
            items: [String] // Lista de nomes dos personagens nesta pasta
        }
    ],
    uncategorized: [String] // Personagens soltos
});

const Layout = mongoose.model('Layout', LayoutSchema);

// ... (imports e configs iniciais iguais) ...

// --- VARIÁVEL DE MEMÓRIA DO TRACKER ---
let serverTrackerList = []; // <--- ADICIONE ISSO AQUI, ANTES DO IO.ON

// --- SOCKET.IO ---
io.on('connection', (socket) => {
    console.log('Cliente conectado:', socket.id);

    // 1. Assim que conecta, envia a lista atual para quem entrou
    socket.emit('sync_tracker_update', serverTrackerList);

    socket.on('dados_rolados', (data) => {
        io.emit('dados_rolados', data); 
    });

    // 2. Recebe atualização total (alguém deletou ou reordenou)
    socket.on('update_tracker', (lista) => {
        serverTrackerList = lista;
        io.emit('sync_tracker_update', serverTrackerList);
    });

    // 3. Recebe adição individual (alguém rolou iniciativa)
    socket.on('add_to_tracker', (item) => {
        // Remove duplicata do mesmo personagem se houver, para atualizar o valor
        const idx = serverTrackerList.findIndex(x => x.name === item.name);
        if (idx >= 0) {
            serverTrackerList[idx] = item; // Atualiza
        } else {
            serverTrackerList.push(item); // Adiciona novo
        }
        // Envia a lista nova para todos
        io.emit('sync_tracker_update', serverTrackerList);
    });
});


// =================================================================
// ROTAS GERAIS
// =================================================================
app.get('/api/catalog/:tipo', (req, res) => {
    const tipo = req.params.tipo;
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

    if (found) res.json(fileData);
    else res.json([]); 
});

// =================================================================
// ROTAS DE LAYOUT (PASTAS E ORGANIZAÇÃO)
// =================================================================

// 1. OBTER LAYOUT
app.get('/api/layout', async (req, res) => {
    try {
        let layout = await Layout.findOne({ id: "master_layout" });
        if (!layout) {
            // Se não existir, cria padrão
            layout = new Layout({ folders: [], uncategorized: [] });
            await layout.save();
        }
        res.json(layout);
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: "Erro ao carregar layout" });
    }
});

// 2. SALVAR LAYOUT (Ao arrastar ou criar pasta)
app.post('/api/save-layout', async (req, res) => {
    try {
        const { folders, uncategorized } = req.body;
        
        await Layout.findOneAndUpdate(
            { id: "master_layout" },
            { folders, uncategorized },
            { upsert: true, new: true }
        );
        res.json({ ok: true });
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: "Erro ao salvar layout" });
    }
});

// =================================================================
// ROTAS DE PERSONAGEM
// =================================================================

// 1. LISTAR PERSONAGENS (NOMES)
app.get('/api/lista-personagens', async (req, res) => {
    try {
        const fichas = await Ficha.find({}, 'nome');
        const listaNomes = fichas.map(f => f.nome);
        res.json(listaNomes);
    } catch (error) {
        res.status(500).json({ error: 'Erro ao buscar lista' });
    }
});

// 2. CRIAR NOVA FICHA (CORRIGIDO)
app.post('/api/criar-ficha', async (req, res) => {
    try {
        // Pega nome e senha para validação
        const { nome, senha } = req.body;
        
        if (!nome || !senha) {
            return res.status(400).json({ error: "Nome e senha obrigatórios" });
        }

        // Verifica duplicidade
        const existe = await Ficha.findOne({ nome: { $regex: new RegExp(`^${nome}$`, 'i') } });
        if (existe) {
            return res.status(400).json({ error: "Já existe!" });
        }

        // --- A MÁGICA ACONTECE AQUI ---
        // Em vez de definir campo por campo manualmente e deixar vazio,
        // nós pegamos TUDO o que o mestre.html enviou (...req.body)
        // e usamos para criar a ficha.
        const novaFicha = new Ficha(req.body);

        // Se por acaso o frontend mandou sem ID ou algo assim, o Mongo resolve.
        // Mas garantimos que nome e senha estão lá.
        novaFicha.nome = nome;
        novaFicha.senha = senha;

        await novaFicha.save();
        res.json({ ok: true });

    } catch (error) {
        console.error("Erro ao criar ficha:", error);
        res.status(500).json({ error: "Erro ao criar no banco de dados." });
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

// 7. EDITAR CREDENCIAIS
app.post('/api/editar-credenciais', async (req, res) => {
    try {
        const { nomeAntigo, novoNome, novaSenha } = req.body;

        if (!nomeAntigo || !novoNome || !novaSenha) {
            return res.status(400).json({ error: "Dados incompletos." });
        }

        if (nomeAntigo.toLowerCase() !== novoNome.toLowerCase()) {
            const existe = await Ficha.findOne({ nome: { $regex: new RegExp(`^${novoNome}$`, 'i') } });
            if (existe) {
                return res.status(400).json({ error: "Já existe um personagem com esse nome!" });
            }
        }

        await Ficha.findOneAndUpdate(
            { nome: { $regex: new RegExp(`^${nomeAntigo}$`, 'i') } },
            { $set: { nome: novoNome, senha: novaSenha } }
        );

        res.json({ ok: true });
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: "Erro ao editar credenciais." });
    }
});

const PORT = process.env.PORT || 3000;
server.listen(PORT, () => console.log(`Rodando na porta ${PORT}`));