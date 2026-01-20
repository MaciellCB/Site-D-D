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
}, { strict: false }); 

const Ficha = mongoose.model('Ficha', FichaSchema);

// --- SOCKET.IO ---
io.on('connection', (socket) => {
    console.log('Cliente conectado via Socket:', socket.id);
});

// =================================================================
// ROTAS DO SISTEMA (LENDO ARQUIVOS JSON)
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
// ROTAS DE PERSONAGEM
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

// 2. CRIAR NOVA FICHA (AGORA COM O MOLDE COMPLETO!)
app.post('/api/criar-ficha', async (req, res) => {
    try {
        const { nome, senha } = req.body;
        if (!nome || !senha) return res.status(400).json({ error: "Nome e senha obrigatórios" });

        const existe = await Ficha.findOne({ nome: { $regex: new RegExp(`^${nome}$`, 'i') } });
        if (existe) return res.status(400).json({ error: "Já existe!" });

        // --- O MOLDE COMPLETO ZERADO ---
        const novaFicha = new Ficha({
            nome: nome,
            senha: senha,
            fotoPerfil: "",
            activeTab: "Descrição",
            spellDCConfig: { "selectedAttr": "none", "extraMod": 0, "lastKnownLevel": 0 },
            dtMagias: 0,
            inventory: [],
            abilities: [],
            spells: [],
            abilityCatalog: [],
            spellCatalog: [],
            description: {
                anotacoes: "", aparencia: "", personalidade: "", objetivo: "",
                ideais: "", vinculos: "", fraquezas: "", historia: ""
            },
            sanidade: { estresse: 0, vazio: 0 },
            pericias: {
                "Atletismo": { "atributo": "FOR", "treinado": false, "outros": 0 },
                "Acrobacia": { "atributo": "DEX", "treinado": false, "outros": 0 },
                "Furtividade": { "atributo": "DEX", "treinado": false, "outros": 0 },
                "Prestidigitação": { "atributo": "DEX", "treinado": false, "outros": 0 },
                "Arcanismo": { "atributo": "INT", "treinado": false, "outros": 0 },
                "História": { "atributo": "INT", "treinado": false, "outros": 0 },
                "Investigação": { "atributo": "INT", "treinado": false, "outros": 0 },
                "Natureza": { "atributo": "INT", "treinado": false, "outros": 0 },
                "Religião": { "atributo": "INT", "treinado": false, "outros": 0 },
                "Intuição": { "atributo": "SAB", "treinado": false, "outros": 0 },
                "Lidar com animais": { "treinado": false, "bonus": 0, "atributo": "SAB" },
                "Medicina": { "atributo": "SAB", "treinado": false, "outros": 0 },
                "Percepção": { "atributo": "SAB", "treinado": false, "outros": 0 },
                "Sobrevivência": { "atributo": "SAB", "treinado": false, "outros": 0 },
                "Atuação": { "atributo": "CAR", "treinado": false, "outros": 0 },
                "Enganação": { "atributo": "CAR", "treinado": false, "outros": 0 },
                "Intimidação": { "atributo": "CAR", "treinado": false, "outros": 0 },
                "Persuasão": { "atributo": "CAR", "treinado": false, "outros": 0 },
                "Salvaguarda (Força)": { "atributo": "FOR", "treinado": false, "outros": 0 },
                "Salvaguarda (Destreza)": { "atributo": "DEX", "treinado": false, "outros": 0 },
                "Salvaguarda (Constituição)": { "atributo": "CON", "treinado": false, "outros": 0 },
                "Salvaguarda (Inteligência)": { "atributo": "INT", "treinado": false, "outros": 0 },
                "Salvaguarda (Sabedoria)": { "atributo": "SAB", "treinado": false, "outros": 0 },
                "Salvaguarda (Carisma)": { "atributo": "CAR", "treinado": false, "outros": 0 }
            },
            atributos: { n1: 10, n2: 10, n3: 10, n4: 10, n5: 10, n6: 10 },
            niveisClasses: {},
            xp: "0",
            inspiracao: 0,
            vidaDadosSalvos: { v1: 0, v2: 0, v3: 0 },
            marco: 0,
            vidaAtual: 0,
            vidaTempAtual: 0,
            danoNecroAtual: 0,
            metros: 0,
            iniciativaBonus: 0,
            acOutros: 0,
            resistencias: "",
            imunidades: "",
            fraquezas: "",
            proficiencias: "",
            minimizedPreparedSpells: false,
            minimizedPreparedAbilities: false,
            fraquezasList: [],
            resistenciasList: [],
            imunidadesList: [],
            proficienciasList: [],
            idiomasList: [],
            spellSlots: {
                "1": { "used": 0, "status": [] }, "2": { "used": 0, "status": [] },
                "3": { "used": 0, "status": [] }, "4": { "used": 0, "status": [] },
                "5": { "used": 0, "status": [] }, "6": { "used": 0, "status": [] },
                "7": { "used": 0, "status": [] }, "8": { "used": 0, "status": [] },
                "9": { "used": 0, "status": [] },
                "pact": { "used": 0, "status": [] }, "ki": { "used": 0, "status": [] },
                "furia": { "used": 0, "status": [] }, "sorcery": { "used": 0, "status": [] },
                "mutagen": { "used": 0, "status": [] }, "blood_curse": { "status": [] },
                "infusions": { "status": [] }
            },
            isSlotsCollapsed: false,
            collapsedSections: {},
            antecedente: "",
            personagem: "",
            jogador: "",
            raca: "",
            customResources: [],
            deslocamentoVoo: 0,
            subRaca: "",
            racaTipo: "Humanoide",
            racaTamanho: "Médio",
            money: { pc: 0, pp: 0, po: 0, pl: 0, pd: 0 },
            hitDie: "",
            subclasses: {},
            salvaguardas: {
                "Força": { "treinado": false }, "Constituição": { "treinado": false },
                "Destreza": { "treinado": false }, "Inteligência": { "treinado": false },
                "Sabedoria": { "treinado": false }, "Carisma": { "treinado": false }
            },
            ordemClasses: [],
            vidaTotalCalculada: 0
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