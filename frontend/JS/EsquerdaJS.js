// ======================================
// Configurações e Tabelas
// ======================================
const xpPorNivel = {
    1: { max: 300, marco: 0 }, 2: { max: 900, marco: 0 }, 3: { max: 2700, marco: 1 },
    4: { max: 6500, marco: 1 }, 5: { max: 14000, marco: 1 }, 6: { max: 23000, marco: 2 },
    7: { max: 34000, marco: 2 }, 8: { max: 48000, marco: 2 }, 9: { max: 64000, marco: 2 },
    10: { max: 85000, marco: 2 }, 11: { max: 100000, marco: 3 }, 12: { max: 120000, marco: 3 },
    13: { max: 140000, marco: 3 }, 14: { max: 165000, marco: 3 }, 15: { max: 195000, marco: 3 },
    16: { max: 225000, marco: 4 }, 17: { max: 265000, marco: 4 }, 18: { max: 305000, marco: 4 },
    19: { max: 355000, marco: 5 }, 20: { max: 999999, marco: 99 }
};

const classesPadrao = [
    { key: 'artifice', nome: 'Artífice', dado: 'd8' },
    { key: 'barbaro', nome: 'Bárbaro', dado: 'd12' },
    { key: 'bardo', nome: 'Bardo', dado: 'd8' },
    { key: 'blood hunter', nome: 'Blood Hunter', dado: 'd10' },
    { key: 'bruxo', nome: 'Bruxo', dado: 'd8' },
    { key: 'clerigo', nome: 'Clérigo', dado: 'd8' },
    { key: 'druida', nome: 'Druida', dado: 'd8' },
    { key: 'feiticeiro', nome: 'Feiticeiro', dado: 'd6' },
    { key: 'guerreiro', nome: 'Guerreiro', dado: 'd10' },
    { key: 'ladino', nome: 'Ladino', dado: 'd8' },
    { key: 'mago', nome: 'Mago', dado: 'd6' },
    { key: 'monge', nome: 'Monge', dado: 'd8' },
    { key: 'paladino', nome: 'Paladino', dado: 'd10' },
    { key: 'patrulheiro', nome: 'Patrulheiro', dado: 'd10' }
];

const DADOS_VALORES = {
    'd12': [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12],
    'd10': [1, 2, 3, 4, 5, 6, 7, 8, 9, 10],
    'd8': [1, 2, 3, 4, 5, 6, 7, 8],
    'd6': [1, 2, 3, 4, 5, 6]
};

// Variáveis Globais de Controle
let mostrandoAtributos = true;
let editMode = false;
let rotateInterval = null;
const numerosHex = Array.from(document.querySelectorAll('.hexagrama .num'));
const hexOverlay = document.querySelector('.hex-overlay');

// ======================================
// Sincronização Inicial
// ======================================

window.addEventListener('sheet-updated', () => {
    inicializarDadosEsquerda();
    atualizarTudoVisual();
    vincularEventosInputs();

    if (state.iniciativaBonus === undefined) state.iniciativaBonus = 0;
    document.getElementById('iniciativaBonus').value = state.iniciativaBonus;

    atualizarIniciativaTotal();
});

function inicializarDadosEsquerda() {
    if (!state.atributos) state.atributos = { n1: 10, n2: 10, n3: 10, n4: 10, n5: 10, n6: 10 };
    if (!state.niveisClasses) state.niveisClasses = {};
    if (!state.vidaDadosSalvos) state.vidaDadosSalvos = {};
    if (state.acOutros === undefined) state.acOutros = 0;

    // Fallbacks para valores numéricos
    state.vidaAtual = parseInt(state.vidaAtual) || 0;
    state.vidaTempAtual = parseInt(state.vidaTempAtual) || 0;
    state.danoNecroAtual = parseInt(state.danoNecroAtual) || 0;
    state.xp = state.xp || "0";
    state.marco = parseInt(state.marco) || 0;
    state.inspiracao = parseInt(state.inspiracao) || 0;
    state.metros = parseFloat(state.metros) || 0;

    // Sincroniza Atributos no Hexágono
    numerosHex.forEach(n => {
        const id = n.classList[1];
        const val = state.atributos[id] || 10;
        n.dataset.attrValue = val;
        n.textContent = mostrandoAtributos ? val : formatMod(calcularModificador(val));
        n.addEventListener('keydown', (e) => {
        if (e.key === 'Enter') {
            e.preventDefault(); // Impede o pulo de linha
            if (editMode) toggleEditMode(); // Se estiver editando, fecha e salva
        }
    });
    });

    document.getElementById('xpAtual').value = state.xp;
    document.getElementById('marcoAtual').value = state.marco;
    document.getElementById('inspiraValor').textContent = state.inspiracao;
    document.getElementById('metros').value = state.metros;
    document.getElementById('quadrados').value = (state.metros / 1.5).toFixed(1);



}

// ======================================
// Atributos e Modificadores
// ======================================
// --- Função para calcular proficiência conforme tabela D&D 5e ---
function calcularProficiencia(nivel) {
    if (nivel <= 0) return 2;
    return Math.floor((nivel - 1) / 4) + 2;
}

// --- Atualiza visualmente o campo de proficiência ---
function atualizarProficiencia() {
    const nivelTotal = Object.values(state.niveisClasses || {}).reduce((a, b) => a + (parseInt(b) || 0), 0) || 1;
    const prof = calcularProficiencia(nivelTotal);

    const profEl = document.getElementById('proficienciaValor');
    if (profEl) {
        profEl.textContent = `+${prof}`;
    }
}

function calcularModificador(n) {
    return Math.floor((parseInt(n, 10) - 10) / 2);
}

function formatMod(m) {
    return m >= 0 ? `+${m}` : m;
}

if (hexOverlay) {
    hexOverlay.onclick = () => {
        if (editMode) toggleEditMode(); 
        mostrandoAtributos = !mostrandoAtributos;
        hexOverlay.src = mostrandoAtributos ? 'img/atributos.png' : 'img/modificador.png';
        numerosHex.forEach(n => {
            const val = n.dataset.attrValue;
            n.textContent = mostrandoAtributos ? val : formatMod(calcularModificador(val));
        });
    };
}

document.querySelector('.editar-hex').onclick = () => {
    if (!mostrandoAtributos) {
        mostrandoAtributos = true;
        hexOverlay.src = 'img/atributos.png';
        numerosHex.forEach(n => n.textContent = n.dataset.attrValue);
    }
    toggleEditMode();
};

function toggleEditMode() {
    editMode = !editMode;
    numerosHex.forEach(n => {
        n.setAttribute('contenteditable', editMode);
        if (!editMode) {
            const id = n.classList[1];
            const val = parseInt(n.textContent) || 0;
            state.atributos[id] = val;
            n.dataset.attrValue = val;
        }
    });
    if (!editMode) {
        saveStateToServer();
        window.dispatchEvent(new CustomEvent('sheet-updated'));
    }
}

// ======================================
// Gestão de Classes e Vida (Seletores)
// ======================================

document.getElementById('classeFocus').onclick = (e) => {
    const painel = document.getElementById('painelClasses');
    const lista = document.getElementById('listaClasses');
    lista.innerHTML = '';

    classesPadrao.forEach(c => {
        const nivel = state.niveisClasses[c.key] || 0;
        const div = document.createElement('div');
        div.className = 'item-classe';
        div.innerHTML = `
            <span>${c.nome}</span>
            <input type="number" min="0" value="${nivel}" oninput="salvarNivelClasse('${c.key}', this.value)">
        `;
        lista.appendChild(div);
    });

    painel.style.display = 'block';
    const rect = e.currentTarget.getBoundingClientRect();
    painel.style.left = `${rect.left}px`;
    painel.style.top = `${rect.bottom + 5}px`;
};

window.salvarNivelClasse = (key, val) => {
    state.niveisClasses[key] = parseInt(val) || 0;

    // Limpeza de bônus órfãos (se você reduziu o nível)
    const totalNiv = Object.values(state.niveisClasses).reduce((a, b) => a + b, 0);
    Object.keys(state.vidaDadosSalvos).forEach(k => {
        const numNivel = parseInt(k.replace('v', ''));
        if (numNivel > totalNiv) delete state.vidaDadosSalvos[k];
    });

    saveStateToServer();
    atualizarTudoVisual(); // Isso chamará atualizarVidaCalculada

    // Se o painel de dados estiver aberto, re-renderiza a lista
    const container = document.querySelector('.classes-lista-container');
    if (container && container.style.display === 'block') {
        renderizarDadosVida();
    }
};

document.getElementById('fecharPainel').onclick = () => document.getElementById('painelClasses').style.display = 'none';

document.getElementById('btnVida').onclick = () => {
    const container = document.querySelector('.classes-lista-container');
    container.style.display = container.style.display === 'none' ? 'block' : 'none';
    renderizarDadosVida();
};

function renderizarDadosVida() {
    const lista = document.getElementById('classesLista');
    if (!lista) return;
    lista.innerHTML = '';
    let counter = 1;

    Object.entries(state.niveisClasses).forEach(([key, nivel]) => {
        const classeRef = classesPadrao.find(c => c.key === key);
        if (!classeRef || nivel <= 0) return;

        for (let i = 1; i <= nivel; i++) {
            const vidId = `v${counter}`;
            const faces = parseInt(classeRef.dado.replace('d', ''));

            // SE FOR O PRIMEIRO DADO GERAL, DEFINE COMO MÁXIMO
            if (counter === 1 && (!state.vidaDadosSalvos[vidId] || state.vidaDadosSalvos[vidId] === 0)) {
                state.vidaDadosSalvos[vidId] = faces;
                saveStateToServer();
            }

            const valorSalvo = state.vidaDadosSalvos[vidId] || 0;
            const opcoes = DADOS_VALORES[classeRef.dado] || [];

            const li = document.createElement('li');
            li.style.cssText = "display: flex; align-items: center; gap: 10px; padding: 4px 0;";
            li.innerHTML = `
                <span style="min-width:90px; font-size:12px; font-weight:bold;">${classeRef.nome}</span>
                <img src="img/dado.png" style="width:18px; cursor:pointer" onclick="rolarDadoVida('${vidId}', '${classeRef.dado}')">
                <select onchange="salvarDadoVida('${vidId}', this.value)" style="background:#000; color:#fff; border:1px solid #9c27b0; border-radius:4px; font-size:12px; width:50px;">
                    <option value="0" ${valorSalvo == 0 ? 'selected' : ''}>-</option>
                    ${opcoes.map(n => `<option value="${n}" ${valorSalvo == n ? 'selected' : ''}>${n}</option>`).join('')}
                </select>
                ${counter === 1 ? '<span style="color:#9c27b0; font-size:10px; font-weight:bold;">MÁX</span>' : ''}
            `;
            lista.appendChild(li);
            counter++;
        }
    });
    atualizarVidaCalculada();
}

window.rolarDadoVida = (id, dado) => {
    const faces = parseInt(dado.replace('d', ''));
    state.vidaDadosSalvos[id] = Math.floor(Math.random() * faces) + 1;
    renderizarDadosVida();
    atualizarTudoVisual();
    saveStateToServer();
};

window.salvarDadoVida = (id, val) => {
    state.vidaDadosSalvos[id] = parseInt(val) || 0;
    atualizarVidaCalculada();
    saveStateToServer();
};

// ======================================++-
// Sistema de Barras e Conversões
// ======================================

function atualizarVidaCalculada() {
    // Soma APENAS os valores numéricos salvos no objeto vidaDadosSalvos
    // Se um dado estiver como "-" (0), ele não adiciona nada à soma.
    const vidaMax = Object.values(state.vidaDadosSalvos || {}).reduce((acc, val) => acc + (parseInt(val) || 0), 0);

    const vidaTotalEl = document.getElementById('vida-total');
    if (vidaTotalEl) {
        vidaTotalEl.textContent = vidaMax;
    }

    // Atualiza as barras visuais com base no novo total
    atualizarBarraUI('vida', state.vidaAtual, vidaMax);
    atualizarBarraUI('vida-temp', state.vidaTempAtual, 100);
    atualizarBarraUI('dano-necro', state.danoNecroAtual, 100);
}

function atualizarBarraUI(prefixo, atual, total) {
    const fill = document.getElementById(`${prefixo}-fill`);
    const texto = document.getElementById(`${prefixo}-atual`);
    if (fill && texto) {
        const valAtual = parseInt(atual) || 0;
        const valTotal = parseInt(total) || 1;
        fill.style.width = Math.min(100, (valAtual / valTotal) * 100) + "%";
        texto.textContent = valAtual;
    }
}

function vincularEventosInputs() {
    // Helper para adicionar comportamento de Salvar + Blur ao pressionar Enter
    const addEnterBlur = (el, stateKey) => {
        if (!el) return;

        // Carrega o valor inicial do state para o campo
        el.value = state[stateKey] || "";

        el.addEventListener('keydown', (e) => {
            if (e.key === 'Enter') {
                e.preventDefault(); // Evita comportamento padrão
                state[stateKey] = el.value; // Atualiza o estado
                saveStateToServer(); // Salva no servidor
                el.blur(); // Tira o foco do campo
            }
        });

        // Garante o salvamento também se o usuário apenas clicar fora (evento change)
        el.onchange = () => {
            state[stateKey] = el.value;
            saveStateToServer();
        };
    };

    // --- VINCULANDO STATUS (CABEÇALHO) ---
    addEnterBlur(document.getElementById('input-personagem'), 'personagem');
    addEnterBlur(document.getElementById('input-jogador'), 'jogador');
    addEnterBlur(document.getElementById('input-antecedente'), 'antecedente');
    addEnterBlur(document.getElementById('input-classesHeader'), 'classesHeader');
    addEnterBlur(document.getElementById('input-raca'), 'raca');

    // --- VINCULANDO DETALHES DE ARMADURA ---
    addEnterBlur(document.getElementById('input-resistencias'), 'resistencias');
    addEnterBlur(document.getElementById('input-imunidades'), 'imunidades');
    addEnterBlur(document.getElementById('input-fraquezas'), 'fraquezas');
    addEnterBlur(document.getElementById('input-proficiencias'), 'proficiencias');

    // --- COMPORTAMENTOS ESPECÍFICOS DE OUTROS CAMPOS ---

    // XP e MARCO
    const xpInput = document.getElementById('xpAtual');
    if (xpInput) {
        xpInput.oninput = (e) => { state.xp = e.target.value; atualizarMarcosEXP(); saveStateToServer(); };
        xpInput.addEventListener('keydown', (e) => { if (e.key === 'Enter') xpInput.blur(); });
    }

    const marcoInput = document.getElementById('marcoAtual');
    if (marcoInput) {
        marcoInput.oninput = (e) => { state.marco = parseInt(e.target.value) || 0; atualizarMarcosEXP(); saveStateToServer(); };
        marcoInput.addEventListener('keydown', (e) => { if (e.key === 'Enter') marcoInput.blur(); });
    }

    // INICIATIVA BÔNUS
    const iniBonus = document.getElementById('iniciativaBonus');
    if (iniBonus) {
        iniBonus.oninput = (e) => { state.iniciativaBonus = parseInt(e.target.value) || 0; atualizarIniciativaTotal(); saveStateToServer(); };
        iniBonus.addEventListener('keydown', (e) => { if (e.key === 'Enter') iniBonus.blur(); });
    }

    // CA OUTROS (contenteditable)
    const outrosInput = document.getElementById('ac-outros');
    if (outrosInput) {
        outrosInput.oninput = () => { state.acOutros = parseInt(outrosInput.textContent) || 0; atualizarAC(); };
        outrosInput.onblur = () => {
            const val = parseInt(outrosInput.textContent) || 0;
            outrosInput.textContent = val;
            state.acOutros = val;
            saveStateToServer();
        };
        outrosInput.addEventListener('keydown', (e) => { if (e.key === 'Enter') { e.preventDefault(); outrosInput.blur(); } });
    }

    // METROS E QUADRADOS
    const metrosInput = document.getElementById('metros');
    const quadradosInput = document.getElementById('quadrados');
    if (metrosInput && quadradosInput) {
        metrosInput.oninput = (e) => {
            const m = parseFloat(e.target.value) || 0;
            state.metros = m;
            quadradosInput.value = (m / 1.5).toFixed(1);
            saveStateToServer();
        };
        metrosInput.addEventListener('keydown', (e) => { if (e.key === 'Enter') metrosInput.blur(); });

        quadradosInput.oninput = (e) => {
            const q = parseFloat(e.target.value) || 0;
            state.metros = q * 1.5;
            metrosInput.value = state.metros;
            saveStateToServer();
        };
        quadradosInput.addEventListener('keydown', (e) => { if (e.key === 'Enter') quadradosInput.blur(); });
    }

    // VIDA E BARRAS (contenteditable)
    ['vida-atual', 'vida-temp-atual', 'dano-necro-atual'].forEach(id => {
        const el = document.getElementById(id);
        if (!el) return;
        el.oninput = () => {
            const val = parseInt(el.textContent) || 0;
            const key = id.includes('temp') ? 'vidaTempAtual' : (id.includes('necro') ? 'danoNecroAtual' : 'vidaAtual');
            state[key] = val;
            atualizarVidaCalculada();
        };
        el.onblur = () => { saveStateToServer(); };
        el.addEventListener('keydown', (e) => { if (e.key === 'Enter') { e.preventDefault(); el.blur(); } });
    });
}
// Botões das setas das barras
document.querySelectorAll('.lado-esquerdo button').forEach(btn => {
    if (!btn.closest('.vida-bar') && !btn.closest('.barra-secundaria')) return;
    btn.onclick = () => {
        let key = btn.closest('.vida-container') ? "vidaAtual" : (btn.closest('.barra-secundaria:nth-child(1)') ? "vidaTempAtual" : "danoNecroAtual");
        let step = btn.classList.contains('menos5') ? -5 : (btn.classList.contains('menos1') ? -1 : (btn.classList.contains('mais1') ? 1 : 5));
        let max = key === 'vidaAtual' ? parseInt(document.getElementById('vida-total').textContent) : 100;
        state[key] = Math.max(0, Math.min(max, (parseInt(state[key]) || 0) + step));
        atualizarVidaCalculada();
        saveStateToServer();
    };
});

// ======================================
// Funções Gerais de Atualização
// ======================================

function atualizarMarcosEXP() {
    const nivelTotal = Object.values(state.niveisClasses).reduce((a, b) => a + b, 0) || 1;
    const tabela = xpPorNivel[Math.min(20, Math.max(1, nivelTotal))];

    document.getElementById('xpTotalText').textContent = `/ ${tabela.max}`;
    document.getElementById('xpBar').style.width = Math.min(100, (parseInt(state.xp || 0) / tabela.max) * 100) + "%";

    const marcoMax = tabela.marco;
    document.getElementById('marcoMax').value = marcoMax;
    document.getElementById('marcoBar').style.width = marcoMax > 0 ? Math.min(100, (parseInt(state.marco || 0) / marcoMax) * 100) + "%" : "0%";
}

function atualizarFocoClasseRotativo() {
    const ativas = classesPadrao.filter(c => state.niveisClasses[c.key] > 0);
    if (!ativas.length) {
        document.getElementById('classeFocusNome').textContent = "Sem Classe";
        document.getElementById('classeFocusNivel').textContent = "0";
        return;
    }
    let i = 0;
    if (rotateInterval) clearInterval(rotateInterval);
    const mudar = () => {
        const c = ativas[i % ativas.length];
        document.getElementById('classeFocusNome').textContent = c.nome;
        document.getElementById('classeFocusNivel').textContent = state.niveisClasses[c.key];
        i++;
    };
    mudar();
    if (ativas.length > 1) rotateInterval = setInterval(mudar, 5000);
}

function atualizarIniciativaTotal() {
    const dexScore = state.atributos?.n2 || 10;
    const dexMod = Math.floor((dexScore - 10) / 2);
    const bonus = parseInt(state.iniciativaBonus) || 0;

    const total = dexMod + bonus;
    const sinal = total >= 0 ? "+" : "";

    // Atualiza o número grande da Iniciativa
    document.getElementById('iniciativaValor').textContent = `${sinal}${total}`;
}

// Vincular o evento de input para salvar e recalcular
const inputBonus = document.getElementById('iniciativaBonus');
if (inputBonus) {
    inputBonus.oninput = (e) => {
        state.iniciativaBonus = parseInt(e.target.value) || 0;
        atualizarIniciativaTotal();
        saveStateToServer();
    };
}


function atualizarAC() {
    const dexScore = state.atributos?.n2 || 10;
    const dexMod = Math.floor((dexScore - 10) / 2);

    const armadura = state.inventory.find(i => i.equip && (i.type === 'Proteção' || i.type === 'protecao') && i.tipoItem?.toLowerCase() !== 'escudo');
    const escudo = state.inventory.find(i => i.equip && (i.type === 'Proteção' || i.type === 'protecao') && i.tipoItem?.toLowerCase() === 'escudo');

    let equipBonus = 0;
    let tipoTag = "SEM ARMADURA";
    let dexFinal = dexMod;
    let dexFormulaText = "DEX";

    const formulaDexEl = document.querySelector('.formula-attr');
    const formulaPluses = document.querySelectorAll('.inline-formula .formula-plus');
    const plusAntesDex = formulaPluses[0];

    // Reset padrão
    if (formulaDexEl) {
        formulaDexEl.style.display = "inline-block";
        formulaDexEl.style.visibility = "visible";
        formulaDexEl.style.width = "auto";
        formulaDexEl.style.transform = "translateY(-30px)";
    }
    if (plusAntesDex) {
        plusAntesDex.style.visibility = "visible";
        plusAntesDex.style.width = "auto";
    }

    if (armadura) {
        equipBonus += parseInt(armadura.defense?.replace('+', '')) || 0;
        tipoTag = armadura.proficiency?.toUpperCase() || "LEVE";
        const tNorm = tipoTag.toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "");

        if (tNorm === "media") {
            dexFinal = Math.min(dexMod, 2);
            dexFormulaText = "DEX (<=2)";
            if (formulaDexEl) formulaDexEl.style.transform = "translateY(-26px)";
        } else if (tNorm === "pesada") {
            dexFinal = 0;
            // Esconde DEX e "+" mantendo o espaço ou colapsando conforme desejado
            if (formulaDexEl) {
                formulaDexEl.style.visibility = "hidden";
                formulaDexEl.style.width = "0px";
                formulaDexEl.style.margin = "0";
            }
            if (plusAntesDex) {
                plusAntesDex.style.visibility = "hidden";
                plusAntesDex.style.width = "0px";
                plusAntesDex.style.margin = "0";
            }
        }
    }

    if (formulaDexEl) formulaDexEl.textContent = dexFormulaText;
    if (escudo) equipBonus += parseInt(escudo.defense?.replace('+', '')) || 0;

    // --- MUDANÇA AQUI: Ler o valor de "Outros" do state ---
    const outrosBonus = parseInt(state.acOutros) || 0;

    // Atualiza apenas o texto do Equipamento (o primeiro .zero-num)
    const zeros = document.querySelectorAll('.zero-num');
    if (zeros[0]) zeros[0].textContent = equipBonus;

    // O segundo .zero-num é o "Outros", que já é atualizado pelo input do usuário, 
    // mas garantimos que ele mostre o valor correto ao carregar a página:
    if (zeros[1] && document.activeElement !== zeros[1]) {
        zeros[1].textContent = outrosBonus;
    }

    // SOMA TOTAL: 10 + DEX + Equip + Outros
    document.getElementById('armaduraValor').textContent = 10 + dexFinal + equipBonus + outrosBonus;

    const tagEl = document.querySelector('.armadura-tag');
    if (tagEl) {
        tagEl.textContent = tipoTag;
        tagEl.style.cssText = `
            display: flex; align-items: center; justify-content: center; 
            border: 2px solid #fff; padding: 8px 15px; border-radius: 8px; 
            background: transparent; color: #fff; font-weight: 900; 
            font-size: 15px; margin-top: 12px; min-width: 130px; 
            text-transform: uppercase; white-space: nowrap;
        `;
    }
}

// ATUALIZE esta função para incluir a chamada da armadura
function atualizarTudoVisual() {
    atualizarFocoClasseRotativo();
    atualizarMarcosEXP();
    atualizarVidaCalculada();
    atualizarAC();
    atualizarProficiencia(); // <--- ADICIONE ESTA LINHA
    document.getElementById('nivelFoco').textContent = Object.values(state.niveisClasses || {}).reduce((a, b) => a + (parseInt(b) || 0), 0);
}

document.getElementById('inspiraLeft').onclick = () => { state.inspiracao = Math.max(0, (parseInt(state.inspiracao) || 0) - 1); document.getElementById('inspiraValor').textContent = state.inspiracao; saveStateToServer(); };
document.getElementById('inspiraRight').onclick = () => { state.inspiracao = (parseInt(state.inspiracao) || 0) + 1; document.getElementById('inspiraValor').textContent = state.inspiracao; saveStateToServer(); };
