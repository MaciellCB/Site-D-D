const express = require('express');
const cors = require('cors');
const fs = require('fs');
const path = require('path');
const app = express();

app.use(cors());
app.use(express.json({ limit: '10mb' }));

const PERSONAGENS_DIR = path.join(__dirname, 'data', 'personagens');

// Criar pasta se não existir
if (!fs.existsSync(PERSONAGENS_DIR)) fs.mkdirSync(PERSONAGENS_DIR, { recursive: true });

// Carregar Ficha
app.post('/api/load-ficha', (req, res) => {
    const { nome, senha } = req.body;
    const filePath = path.join(PERSONAGENS_DIR, `${nome.toLowerCase()}.json`);

    if (!fs.existsSync(filePath)) return res.status(404).send();

    const ficha = JSON.parse(fs.readFileSync(filePath));
    if (ficha.senha !== senha) return res.status(401).send();
    
    res.json(ficha);
});

// Salvar Ficha
app.post('/api/save-ficha', (req, res) => {
    const ficha = req.body;
    const filePath = path.join(PERSONAGENS_DIR, `${ficha.nome.toLowerCase()}.json`);
    fs.writeFileSync(filePath, JSON.stringify(ficha, null, 2));
    res.json({ ok: true });
});

// Catálogos
app.get('/api/catalog/:tipo', (req, res) => {
    const filePath = path.join(__dirname, 'data', `${req.params.tipo}.json`);
    res.json(fs.existsSync(filePath) ? JSON.parse(fs.readFileSync(filePath)) : []);
});

app.listen(3000, () => console.log("Back-end D&D rodando na porta 3000"));