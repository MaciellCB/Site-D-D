/* =============================================================
   LÓGICA DA ESQUERDA (ATRIBUTOS, VIDA, XP, CLASSES, CA E STATUS)
============================================================= */

// ======================================
// 1. Configurações e Tabelas
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

// --- LISTAS DE SELEÇÃO (Solicitadas) ---
const TIPOS_DANO_LISTA = [
    'Ácido', 'Contundente', 'Cortante', 'Perfurante', 'Fogo', 'Frio', 
    'Elétrico', 'Trovão', 'Veneno', 'Radiante', 'Necrótico', 'Psíquico', 'Energético'
];

const PROFICIENCIAS_LISTA_ESQUERDA = [
    'Armaduras leves', 'Armaduras médias', 'Armaduras pesadas', 'Escudos',
    'Armas simples', 'Armas marciais',
    'Ferramentas de Alquimista', 'Ferramentas de Calígrafo', 'Ferramentas de Carpinteiro',
    'Ferramentas de Cartógrafo', 'Ferramentas de Coureiro', 'Ferramentas de Ferreiro',
    'Ferramentas de Joalheiro', 'Ferramentas de Oleiro', 'Ferramentas de Pedreiro',
    'Ferramentas de Sapateiro', 'Ferramentas de Tecelão', 'Ferramentas de Vidreiro',
    'Ferramentas de Pintor', 'Ferramentas de Ladrão',
    'Kit de Disfarce', 'Kit de Falsificação', 'Kit de Herborismo', 'Kit de Venenos',
    'Instrumento Musical', 'Veículos (terrestres)', 'Veículos (aquáticos)'
];

const IDIOMAS_LISTA = [
    'Comum', 'Anão', 'Élfico', 'Gigante', 'Gnômico', 'Goblin', 'Halfling', 'Orc',
    'Abissal', 'Celestial', 'Dialeto Subterrâneo', 'Dracônico', 'Infernal', 'Primordial',
    'Silvestre', 'Druídico', 'Gíria de Ladrões'
];

// Variáveis Globais de Controle
let mostrandoAtributos = true;
let editMode = false;
let rotateInterval = null;
const numerosHex = Array.from(document.querySelectorAll('.hexagrama .num'));
const hexOverlay = document.querySelector('.hex-overlay');

// ======================================
// 2. Inicialização e Listeners
// ======================================

window.addEventListener('sheet-updated', () => {
    inicializarDadosEsquerda();
    atualizarTudoVisual();
    vincularEventosInputs();
});

function inicializarDadosEsquerda() {
    // Inicializa objetos do state se não existirem
    if (!state.atributos) state.atributos = { n1: 10, n2: 10, n3: 10, n4: 10, n5: 10, n6: 10 };
    if (!state.niveisClasses) state.niveisClasses = {};
    if (!state.vidaDadosSalvos) state.vidaDadosSalvos = {};
    
    // Inicializa arrays para os status (listas)
    if (!state.fraquezasList) state.fraquezasList = [];
    if (!state.resistenciasList) state.resistenciasList = [];
    if (!state.imunidadesList) state.imunidadesList = [];
    if (!state.proficienciasList) state.proficienciasList = [];
    if (!state.idiomasList) state.idiomasList = [];

    // Garantir valores seguros para números
    state.acOutros = parseInt(state.acOutros) || 0;
    state.iniciativaBonus = parseInt(state.iniciativaBonus) || 0;
    state.vidaAtual = parseInt(state.vidaAtual) || 0;
    state.vidaTempAtual = parseInt(state.vidaTempAtual) || 0;
    state.danoNecroAtual = parseInt(state.danoNecroAtual) || 0;
    state.xp = state.xp || "0";
    state.marco = parseInt(state.marco) || 0;
    state.inspiracao = parseInt(state.inspiracao) || 0;
    state.metros = parseFloat(state.metros) || 0;

    // Preenche inputs básicos
    const setVal = (id, val) => { const el = document.getElementById(id); if(el) el.value = val; };
    const setText = (id, val) => { const el = document.getElementById(id); if(el) el.textContent = val; };

    setVal('xpAtual', state.xp);
    setVal('marcoAtual', state.marco);
    setText('inspiraValor', state.inspiracao);
    setVal('metros', state.metros);
    setVal('quadrados', (state.metros / 1.5).toFixed(1));
    
    // IMPORTANTE: Preenche o bônus de iniciativa
    setVal('iniciativaBonus', state.iniciativaBonus); 

    // Renderiza os Multi-Selects nas divs criadas no HTML
    renderMultiSelect('sel-fraquezas', TIPOS_DANO_LISTA, state.fraquezasList, 'fraquezasList');
    renderMultiSelect('sel-resistencias', TIPOS_DANO_LISTA, state.resistenciasList, 'resistenciasList');
    renderMultiSelect('sel-imunidades', TIPOS_DANO_LISTA, state.imunidadesList, 'imunidadesList');
    renderMultiSelect('sel-proficiencias', PROFICIENCIAS_LISTA_ESQUERDA, state.proficienciasList, 'proficienciasList');
    renderMultiSelect('sel-idiomas', IDIOMAS_LISTA, state.idiomasList, 'idiomasList');

    // Atualiza Hexagrama
    numerosHex.forEach(n => {
        const id = n.classList[1]; 
        const val = state.atributos[id] || 10;
        n.dataset.attrValue = val;
        n.textContent = mostrandoAtributos ? val : formatMod(calcularModificador(val));
        
        n.addEventListener('keydown', (e) => {
            if (e.key === 'Enter') {
                e.preventDefault();
                if (editMode) toggleEditMode();
            }
        });
    });
}

// ======================================
// 3. Sistema de Multi-Select (Dropdowns)
// ======================================

function renderMultiSelect(elementId, optionsList, currentSelection, stateKey) {
    const container = document.getElementById(elementId);
    if (!container) return; // Se a div não existir no HTML, para aqui.

    // Verifica se já foi renderizado para não duplicar eventos ou HTML
    let display = container.querySelector('.multi-select-display');
    
    // Se não existe, cria a estrutura
    if (!display) {
        container.innerHTML = `
            <div class="multi-select-box" tabindex="0">
                <div class="multi-select-display">Selecionar...</div>
                <div class="multi-select-options" style="display:none;">
                    ${optionsList.map(opt => `
                        <label>
                            <input type="checkbox" value="${opt}">
                            ${opt}
                        </label>
                    `).join('')}
                </div>
            </div>
        `;
        display = container.querySelector('.multi-select-display');
        
        // Adiciona eventos APENAS na criação
        const box = container.querySelector('.multi-select-box');
        const optsContainer = container.querySelector('.multi-select-options');
        const inputs = optsContainer.querySelectorAll('input');

        // Toggle Abrir/Fechar
        box.addEventListener('click', (e) => {
            if(e.target.tagName === 'INPUT' || e.target.tagName === 'LABEL') return;
            const isVisible = optsContainer.style.display === 'block';
            document.querySelectorAll('.multi-select-options').forEach(el => el.style.display = 'none'); // Fecha outros
            optsContainer.style.display = isVisible ? 'none' : 'block';
        });

        // Evento de Change nos checkboxes
        inputs.forEach(input => {
            input.addEventListener('change', () => {
                const newVal = input.value;
                if (input.checked) {
                    if (!state[stateKey].includes(newVal)) state[stateKey].push(newVal);
                } else {
                    state[stateKey] = state[stateKey].filter(item => item !== newVal);
                }
                
                // Atualiza visual
                updateDisplayText(display, state[stateKey]);
                saveStateToServer();
            });
        });

        // Fechar ao clicar fora
        document.addEventListener('click', (e) => {
            if (!container.contains(e.target)) {
                optsContainer.style.display = 'none';
            }
        });
    }

    // Atualiza estado visual (checks e texto) sempre que chamado
    const inputs = container.querySelectorAll('input');
    inputs.forEach(chk => {
        chk.checked = currentSelection.includes(chk.value);
    });
    updateDisplayText(display, currentSelection);
}

function updateDisplayText(element, list) {
    element.textContent = list.length > 0 ? list.join(', ') : 'Selecionar...';
}

// ======================================
// 4. Funções de Cálculo
// ======================================

function calcularModificador(n) {
    return Math.floor((parseInt(n, 10) - 10) / 2);
}

function formatMod(m) {
    return m >= 0 ? `+${m}` : m;
}

function calcularProficiencia(nivel) {
    if (nivel <= 0) return 2;
    return Math.floor((nivel - 1) / 4) + 2;
}

function atualizarProficiencia() {
    const nivelTotal = Object.values(state.niveisClasses || {}).reduce((a, b) => a + (parseInt(b) || 0), 0) || 1;
    const prof = calcularProficiencia(nivelTotal);
    const profEl = document.getElementById('proficienciaValor');
    if (profEl) profEl.textContent = `+${prof}`;
}

// ======================================
// 5. Lógica do Hexagrama
// ======================================

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

const btnEditarHex = document.querySelector('.editar-hex');
if(btnEditarHex) {
    btnEditarHex.onclick = () => {
        if (!mostrandoAtributos) {
            mostrandoAtributos = true;
            hexOverlay.src = 'img/atributos.png';
            numerosHex.forEach(n => n.textContent = n.dataset.attrValue);
        }
        toggleEditMode();
    };
}

function toggleEditMode() {
    editMode = !editMode;
    numerosHex.forEach(n => {
        n.setAttribute('contenteditable', editMode);
        if (!editMode) {
            const id = n.classList[1];
            const val = parseInt(n.textContent) || 10;
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
// 6. Classes e Dados de Vida
// ======================================

const elClasseFocus = document.getElementById('classeFocus');
if(elClasseFocus) {
    elClasseFocus.onclick = (e) => {
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
}

/* =============================================================
   ATUALIZAÇÃO: JS/EsquerdaJS.js
   Procure a função "window.salvarNivelClasse" e substitua por esta:
============================================================= */

window.salvarNivelClasse = (key, val) => {
    // 1. Garante que é número (se vazio, vira 0)
    const nivelNumerico = parseInt(val) || 0;
    
    // 2. Atualiza o estado
    if (!state.niveisClasses) state.niveisClasses = {};
    state.niveisClasses[key] = nivelNumerico;

    // 3. Limpa dados de vida excedentes se o nível baixou
    const totalNiv = Object.values(state.niveisClasses).reduce((a, b) => a + (parseInt(b)||0), 0);
    if (state.vidaDadosSalvos) {
        Object.keys(state.vidaDadosSalvos).forEach(k => {
            const numNivel = parseInt(k.replace('v', ''));
            if (numNivel > totalNiv) delete state.vidaDadosSalvos[k];
        });
    }

    // 4. Salva e Atualiza a Visualização da Esquerda
    saveStateToServer();
    atualizarTudoVisual();

    // 5. Atualiza a lista de dados de vida se estiver aberta
    const containerVida = document.querySelector('.classes-lista-container');
    if(containerVida && containerVida.style.display === 'block') {
        renderizarDadosVida();
    }

    // 6. DISPARA A ATUALIZAÇÃO GLOBAL (Para Header e Direita)
    // Pequeno delay de 10ms ajuda o navegador a processar o input antes de redesenhar
    setTimeout(() => {
        window.dispatchEvent(new CustomEvent('sheet-updated'));
        
        // SEGURANÇA EXTRA: Chama o Header diretamente se a função existir
        if (typeof atualizarTextoClassesHeader === 'function') {
            atualizarTextoClassesHeader();
        }
    }, 10);
};
const btnFecharPainel = document.getElementById('fecharPainel');
if(btnFecharPainel) btnFecharPainel.onclick = () => document.getElementById('painelClasses').style.display = 'none';

const btnVida = document.getElementById('btnVida');
if(btnVida) {
    btnVida.onclick = () => {
        const container = document.querySelector('.classes-lista-container');
        container.style.display = container.style.display === 'none' ? 'block' : 'none';
        renderizarDadosVida();
    };
}

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

            if (counter === 1 && (!state.vidaDadosSalvos[vidId])) {
                state.vidaDadosSalvos[vidId] = faces;
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

// ======================================
// 7. Atualizações Visuais (Vida, Iniciativa)
// ======================================

function atualizarVidaCalculada() {
    const vidaMax = Object.values(state.vidaDadosSalvos || {}).reduce((acc, val) => acc + (parseInt(val) || 0), 0);
    const elVidaTotal = document.getElementById('vida-total');
    if(elVidaTotal) elVidaTotal.textContent = vidaMax;

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

function atualizarMarcosEXP() {
    const nivelTotal = Object.values(state.niveisClasses).reduce((a, b) => a + b, 0) || 1;
    const tabela = xpPorNivel[Math.min(20, Math.max(1, nivelTotal))];
    
    const elXPText = document.getElementById('xpTotalText');
    if(elXPText) elXPText.textContent = `/ ${tabela.max}`;
    
    const elXPBar = document.getElementById('xpBar');
    if(elXPBar) elXPBar.style.width = Math.min(100, (parseInt(state.xp || 0) / tabela.max) * 100) + "%";

    const marcoMax = tabela.marco;
    const elMarcoMax = document.getElementById('marcoMax');
    if(elMarcoMax) elMarcoMax.value = marcoMax;
    
    const elMarcoBar = document.getElementById('marcoBar');
    if(elMarcoBar) elMarcoBar.style.width = marcoMax > 0 ? Math.min(100, (parseInt(state.marco || 0) / marcoMax) * 100) + "%" : "0%";
}

function atualizarFocoClasseRotativo() {
    const ativas = classesPadrao.filter(c => state.niveisClasses[c.key] > 0);
    const elNome = document.getElementById('classeFocusNome');
    const elNivel = document.getElementById('classeFocusNivel');

    if (!ativas.length) {
        if(elNome) elNome.textContent = "Sem Classe";
        if(elNivel) elNivel.textContent = "0";
        return;
    }
    let i = 0;
    if (rotateInterval) clearInterval(rotateInterval);
    const mudar = () => {
        const c = ativas[i % ativas.length];
        if(elNome) elNome.textContent = c.nome;
        if(elNivel) elNivel.textContent = state.niveisClasses[c.key];
        i++;
    };
    mudar();
    if (ativas.length > 1) rotateInterval = setInterval(mudar, 5000);
}

// ATUALIZAÇÃO DA INICIATIVA (AGORA CORRIGIDA)
function atualizarIniciativaTotal() {
    const dexScore = state.atributos?.n2 || 10;
    const dexMod = Math.floor((dexScore - 10) / 2);
    // Lê diretamente do estado, garantindo que seja número
    const bonus = parseInt(state.iniciativaBonus) || 0;
    
    const total = dexMod + bonus;
    const sinal = total >= 0 ? "+" : "";
    
    const elIni = document.getElementById('iniciativaValor');
    if(elIni) elIni.textContent = `${sinal}${total}`;
}

/* =============================================================
   CORREÇÃO DEFINITIVA CA: JS/EsquerdaJS.js
   Substitua a função "atualizarAC" por esta:
============================================================= */

function atualizarAC() {
    // 1. Pega modificadores
    const getMod = (n) => Math.floor((parseInt(state.atributos?.[n] || 10) - 10) / 2);
    const modDex = getMod('n2');
    const modCon = getMod('n1');
    const modSab = getMod('n3');

    // 2. Identifica itens equipados
    const armadura = state.inventory.find(i => 
        i.equip && (i.type === 'Proteção' || i.type === 'protecao') && (i.tipoItem || '').toLowerCase() === 'armadura'
    );
    const escudo = state.inventory.find(i => 
        i.equip && (i.type === 'Proteção' || i.type === 'protecao') && (i.tipoItem || '').toLowerCase() === 'escudo'
    );

    // 3. Habilidades Especiais
    const barbDef = state.abilities.some(a => a.active && a.title.includes("Defesa sem Armadura") && a.title.includes("Bárbaro"));
    const monkDef = state.abilities.some(a => a.active && a.title.includes("Defesa sem Armadura") && a.title.includes("Monge"));

    // Variáveis Visuais
    let visualDex = 0;      
    let visualDexText = "DEX"; 
    let visualEquip = 0; // O valor que vai aparecer na bolinha "Equip"
    let tipoTag = "SEM ARMADURA";
    let isHeavy = false;
    let acTotal = 0;

    // Bônus Extras
    let bonusEscudo = escudo ? (parseInt(escudo.defense) || 2) : 0;
    let bonusOutros = parseInt(state.acOutros) || 0;
    
    if (state.inventory) {
        state.inventory.filter(i => i.equip && i.type === 'Geral' && i.defenseBonus).forEach(item => {
            bonusOutros += (parseInt(item.defenseBonus) || 0);
        });
    }

    // --- LÓGICA DE CÁLCULO ---

    if (armadura) {
        let valInput = parseInt(armadura.defense);
        if (isNaN(valInput)) valInput = 11; // Valor padrão se vazio

        // --- CORREÇÃO DO VALOR NEGATIVO E DO LIMITE ---
        // Se o valor for <= 10 (ex: 2, 8, 10), assumimos que é BÔNUS e somamos 10.
        // Se for >= 11 (ex: 12, 18), usamos como valor TOTAL.
        let valArmaduraTotal = valInput <= 10 ? 10 + valInput : valInput;

        const prof = (armadura.proficiency || '').toLowerCase();
        tipoTag = armadura.proficiency?.toUpperCase() || "LEVE";

        // CÁLCULO DIRETO DO "EQUIP" VISUAL
        // É simplesmente: (Quanto a armadura dá além de 10) + (Escudo)
        // Isso impede valores negativos.
        visualEquip = (valArmaduraTotal - 10) + bonusEscudo;

        if (prof.includes('pesada')) {
            // PESADA: Ignora Dex
            visualDex = 0;
            visualDexText = "-";
            isHeavy = true;
            tipoTag = "PESADA";
            
            // AC = Valor Total da Armadura + Escudo + Outros
            acTotal = valArmaduraTotal + bonusEscudo + bonusOutros;

        } else if (prof.includes('media') || prof.includes('média')) {
            // MÉDIA: Dex máx 2
            visualDex = Math.min(modDex, 2);
            visualDexText = "DEX (Máx 2)";
            tipoTag = "MÉDIA";

            // AC = Valor Total da Armadura + Dex Limitada + Escudo + Outros
            acTotal = valArmaduraTotal + visualDex + bonusEscudo + bonusOutros;

        } else {
            // LEVE: Dex Total
            visualDex = modDex;
            visualDexText = "DEX";
            tipoTag = "LEVE";

            // AC = Valor Total da Armadura + Dex + Escudo + Outros
            acTotal = valArmaduraTotal + visualDex + bonusEscudo + bonusOutros;
        }

    } else {
        // SEM ARMADURA
        visualEquip = bonusEscudo; // Se tiver só escudo

        if (barbDef) {
            // Bárbaro: 10 + Dex + Con + Escudo
            acTotal = 10 + modDex + modCon + bonusEscudo + bonusOutros;
            tipoTag = "DEF. BÁRBARO";
            visualDexText = "DEX + CON";
            visualDex = modDex + modCon; // Hack visual para a soma bater
        } else if (monkDef && !escudo) {
            // Monge: 10 + Dex + Sab (Sem escudo)
            acTotal = 10 + modDex + modSab + bonusOutros;
            tipoTag = "DEF. MONGE";
            visualDexText = "DEX + SAB";
            visualDex = modDex + modSab; // Hack visual
        } else {
            // Pelado: 10 + Dex + Escudo
            acTotal = 10 + modDex + bonusEscudo + bonusOutros;
            tipoTag = "SEM ARMADURA";
            visualDexText = "DEX";
            visualDex = modDex;
        }
    }

    // --- ATUALIZAÇÃO DO DOM ---

    // 1. Valor Total Grande
    const elValor = document.getElementById('armaduraValor');
    if (elValor) elValor.textContent = acTotal;

    // 2. Tag da Armadura
    const elTag = document.querySelector('.armadura-tag');
    if (elTag) {
        elTag.textContent = tipoTag;
        elTag.className = 'armadura-tag';
        elTag.classList.add(isHeavy ? 'pesado' : 'leve');
        const bg = isHeavy ? '#131313' : 'transparent';
        elTag.style.cssText = `display: flex; align-items: center; justify-content: center; border: 2px solid #fff; padding: 8px 15px; border-radius: 8px; background: ${bg}; color: #fff; font-weight: 900; font-size: 15px; margin-top: 12px; min-width: 130px; text-transform: uppercase; white-space: nowrap;`;
    }

    // 3. Texto da DEX e Efeito do 10
    const elFormulaDex = document.querySelector('.formula-attr');
    const elFormulaPlus = document.querySelector('.inline-formula .formula-plus'); 
    
    if (elFormulaDex) {
        elFormulaDex.textContent = visualDexText;
        const visibility = (visualDexText === "-") ? "hidden" : "visible";
        elFormulaDex.style.visibility = visibility;
        if (elFormulaPlus) elFormulaPlus.style.visibility = visibility;
        
        if (visualDexText.length > 5) {
             elFormulaDex.style.transform = "translateY(-26px)";
             elFormulaDex.style.fontSize = "10px";
        } else {
             elFormulaDex.style.transform = "translateY(-30px)";
             elFormulaDex.style.fontSize = "12px";
        }
    }

    // Aumenta o "10" se for pesada
    const baseTen = document.querySelector('.formula-text');
    if (baseTen) {
        if (isHeavy) baseTen.classList.add('heavy-armor-mode');
        else baseTen.classList.remove('heavy-armor-mode');
    }

    // 4. Preenche os Zeros (Equip e Outros)
    const zeroNums = document.querySelectorAll('.zero-pair .zero-num');
    if (zeroNums.length >= 1) {
        // Agora visualEquip é calculado diretamente, sem chance de negativo
        zeroNums[0].textContent = visualEquip;
    }
    if (zeroNums.length >= 2) {
        if (document.activeElement !== zeroNums[1]) {
            zeroNums[1].textContent = bonusOutros;
        }
    }
}



// ======================================
// 8. Função Mestre e Listeners
// ======================================

function atualizarTudoVisual() {
    atualizarFocoClasseRotativo();
    atualizarMarcosEXP();
    atualizarVidaCalculada();
    atualizarProficiencia();
    atualizarIniciativaTotal();
    atualizarAC(); 
    
    const nivelTotal = Object.values(state.niveisClasses || {}).reduce((a, b) => a + (parseInt(b) || 0), 0);
    const elNivel = document.getElementById('nivelFoco');
    if(elNivel) elNivel.textContent = nivelTotal;
}

function vincularEventosInputs() {
    const addEnterBlur = (el, stateKey) => {
        if (!el) return;
        el.value = state[stateKey] || "";
        el.addEventListener('keydown', (e) => {
            if (e.key === 'Enter') { e.preventDefault(); state[stateKey] = el.value; saveStateToServer(); el.blur(); }
        });
        el.onchange = () => { state[stateKey] = el.value; saveStateToServer(); };
    };

    addEnterBlur(document.getElementById('input-personagem'), 'personagem');
    addEnterBlur(document.getElementById('input-jogador'), 'jogador');
    addEnterBlur(document.getElementById('input-antecedente'), 'antecedente');
    addEnterBlur(document.getElementById('input-classesHeader'), 'classesHeader');
    addEnterBlur(document.getElementById('input-raca'), 'raca');

    // Removemos os antigos text inputs para Fraquezas/Resistências, pois agora são selects.
    // Mas mantemos os inputs de números que ainda são usados.

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
    const metrosInput = document.getElementById('metros');
    const quadradosInput = document.getElementById('quadrados');
    if (metrosInput && quadradosInput) {
        metrosInput.oninput = (e) => { state.metros = parseFloat(e.target.value) || 0; quadradosInput.value = (state.metros / 1.5).toFixed(1); saveStateToServer(); };
        metrosInput.addEventListener('keydown', (e) => { if (e.key === 'Enter') metrosInput.blur(); });
        quadradosInput.oninput = (e) => { const q = parseFloat(e.target.value) || 0; state.metros = q * 1.5; metrosInput.value = state.metros; saveStateToServer(); };
        quadradosInput.addEventListener('keydown', (e) => { if (e.key === 'Enter') quadradosInput.blur(); });
    }

    // Iniciativa Bônus - Listener corrigido
    const iniBonus = document.getElementById('iniciativaBonus');
    if (iniBonus) {
        iniBonus.oninput = (e) => { 
            state.iniciativaBonus = parseInt(e.target.value) || 0; 
            atualizarIniciativaTotal(); 
            saveStateToServer(); 
        };
        iniBonus.addEventListener('keydown', (e) => { if (e.key === 'Enter') iniBonus.blur(); });
    }

    const outrosInput = document.getElementById('ac-outros');
    if (outrosInput) {
        outrosInput.oninput = () => { state.acOutros = parseInt(outrosInput.textContent) || 0; atualizarAC(); };
        outrosInput.onblur = () => { state.acOutros = parseInt(outrosInput.textContent) || 0; saveStateToServer(); };
        outrosInput.addEventListener('keydown', (e) => { if (e.key === 'Enter') { e.preventDefault(); outrosInput.blur(); } });
    }

    ['vida-atual', 'vida-temp-atual', 'dano-necro-atual'].forEach(id => {
        const el = document.getElementById(id);
        if (el) {
            el.oninput = () => {
                const val = parseInt(el.textContent) || 0;
                const key = id.includes('temp') ? 'vidaTempAtual' : (id.includes('necro') ? 'danoNecroAtual' : 'vidaAtual');
                state[key] = val;
                atualizarVidaCalculada();
            };
            el.onblur = () => saveStateToServer();
            el.addEventListener('keydown', (e) => { if (e.key === 'Enter') { e.preventDefault(); el.blur(); } });
        }
    });
}

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

document.getElementById('inspiraLeft').onclick = () => { state.inspiracao = Math.max(0, (parseInt(state.inspiracao) || 0) - 1); document.getElementById('inspiraValor').textContent = state.inspiracao; saveStateToServer(); };
document.getElementById('inspiraRight').onclick = () => { state.inspiracao = (parseInt(state.inspiracao) || 0) + 1; document.getElementById('inspiraValor').textContent = state.inspiracao; saveStateToServer(); };