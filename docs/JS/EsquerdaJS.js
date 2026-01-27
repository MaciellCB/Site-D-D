/* =============================================================
   LÓGICA DA ESQUERDA (ATRIBUTOS, VIDA, XP, CLASSES, CA E STATUS)
   ARQUIVO: EsquerdaJS.js (CORREÇÃO: PRIORIDADE DE VIDA > MORTE)
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

// --- LISTAS DE SELEÇÃO ---
const TIPOS_DANO_LISTA = [
    'Ácido', 'Contundente','Doenças', 'Cortante', 'Perfurante', 'Fogo', 'Frio',
    'Elétrico', 'Trovão', 'Veneno', 'Radiante', 'Necrótico', 'Psíquico', 'Energético'
];

const PROFICIENCIAS_LISTA_ESQUERDA = [
    'Armaduras leves', 'Armaduras médias', 'Armaduras pesadas', 'Escudos',
    'Armas simples', 'Armas marciais', 'Armas de fogo',
    'Ferramentas de Alquimista', 'Ferramentas de Calígrafo', 'Ferramentas de Carpinteiro',
    'Ferramentas de Cartógrafo', 'Ferramentas de Coureiro', 'Ferramentas de Ferreiro',
    'Ferramentas de Joalheiro', 'Ferramentas de Oleiro', 'Ferramentas de Pedreiro',
    'Ferramentas de Sapateiro', 'Ferramentas de Tecelão', 'Ferramentas de Vidreiro',
    'Ferramentas de Pintor', 'Ferramentas de Ladrão', 'Suprimentos de Alquimista','Ferramentas de Funileiro',
    'Kit de Disfarce', 'Kit de Falsificação', 'Kit de Herborismo', 'Kit de Venenos',
    'Instrumento Musical (Genérico)',
    'Alaúde', 'Bateria', 'Charamela', 'Citara', 'Flauta', 'Flauta de Pã', 
    'Gaita de Foles', 'Lira', 'Tambor', 'Trombeta', 'Trompa', 'Viola', 
    'Violino', 'Xilofone',
    'Veículos (terrestres)', 'Veículos (aquáticos)'
];

const IDIOMAS_LISTA = [
    'Comum', 'Anão', 'Élfico', 'Gigante', 'Gnômico', 'Goblin', 'Halfling', 'Orc',
    'Abissal', 'Celestial', 'Dialeto Subterrâneo', 'Dracônico', 'Infernal',
    'Primordial', 'Silvestre', 'Druídico', 'Gíria de Ladrões',
    'Auran', 'Aquan', 'Ignan', 'Terrano',
    'Qualith', 'Loross', 'Roussar', 'Aquan Antigo'
];

// Variáveis Globais de Controle
let mostrandoAtributos = true;
let editMode = false;
let rotateInterval = null;
const numerosHex = Array.from(document.querySelectorAll('.hexagrama .num'));
const hexOverlay = document.querySelector('.hex-overlay');

// --- SISTEMA DE BLOQUEIO E TIMERS ---
// Garante que a interface não pisque ou volte no tempo
var uiLock = false;
var uiUnlockTimer = null;
var dsSaveTimer = null; // Timer específico para as bolinhas

// Função para ativar o bloqueio de Eco do servidor
function ativarBloqueioUI() {
    window.uiLock = true;
    if (window.uiUnlockTimer) clearTimeout(window.uiUnlockTimer);
    // Bloqueia atualizações externas por 1.5s após a última ação do usuário
    window.uiUnlockTimer = setTimeout(() => {
        window.uiLock = false;
    }, 1500);
}

// ======================================
// 2. Inicialização e Listeners
// ======================================

window.addEventListener('sheet-updated', () => {
    // Se o usuário está interagindo, IGNORA o update do servidor para não "voltar no tempo"
    if (window.uiLock) return;

    inicializarDadosEsquerda();
    atualizarTudoVisual();
    vincularEventosInputs();
});

// ======================================
// 3. Sistema de Multi-Select (Dropdowns)
// ======================================

function renderMultiSelect(elementId, optionsList, currentSelection, stateKey) {
    const container = document.getElementById(elementId);
    if (!container) return;

    if (!Array.isArray(currentSelection)) currentSelection = [];

    const updateDisplay = () => {
        const display = container.querySelector('.multi-select-display');
        if (display) {
            display.textContent = state[stateKey].length > 0 ? state[stateKey].join(', ') : 'Selecionar...';
        }
    };

    let display = container.querySelector('.multi-select-display');
    
    if (!display) {
        container.innerHTML = `
            <div class="multi-select-box" tabindex="0">
                <div class="multi-select-display">Selecionar...</div>
                <div class="multi-select-options" style="display:none;">
                    <div class="options-list-container"></div>
                    <div class="extra-option-container" style="padding: 8px; border-top: 1px solid #333; margin-top: 5px; background: #1a1a1a;">
                        <input type="text" placeholder="+ Add Outro (Enter)" class="extra-input" style="width: 100%; background: #000; border: 1px solid #444; color: #fff; padding: 6px; border-radius: 4px; font-size: 12px;">
                    </div>
                </div>
            </div>
        `;
        
        display = container.querySelector('.multi-select-display');
        const box = container.querySelector('.multi-select-box');
        const optsContainer = container.querySelector('.multi-select-options');
        const listContainer = container.querySelector('.options-list-container');
        const extraInput = container.querySelector('.extra-input');

        box.addEventListener('click', (e) => {
            if (optsContainer.contains(e.target)) return;
            const isVisible = optsContainer.style.display === 'block';
            document.querySelectorAll('.multi-select-options').forEach(el => el.style.display = 'none'); 
            
            if (!isVisible) {
                optsContainer.style.display = 'block';
                renderCheckboxes(listContainer, optionsList, state[stateKey], stateKey, display);
            } else {
                optsContainer.style.display = 'none';
            }
        });

        document.addEventListener('click', (e) => {
            if (!container.contains(e.target)) {
                optsContainer.style.display = 'none';
            }
        });

        extraInput.addEventListener('keydown', (e) => {
            if (e.key === 'Enter') {
                e.preventDefault();
                const val = extraInput.value.trim();
                if (val && !state[stateKey].includes(val)) {
                    state[stateKey].push(val);
                    saveStateToServer();
                    updateDisplay();
                    renderCheckboxes(listContainer, optionsList, state[stateKey], stateKey, display);
                    extraInput.value = ''; 
                    extraInput.focus();
                }
            }
        });

        renderCheckboxes(listContainer, optionsList, state[stateKey], stateKey, display);
    } else {
        updateDisplay();
        const optsContainer = container.querySelector('.multi-select-options');
        if (optsContainer.style.display === 'block') {
            const listContainer = container.querySelector('.options-list-container');
            renderCheckboxes(listContainer, optionsList, state[stateKey], stateKey, display);
        }
    }
}

function renderCheckboxes(container, defaultOptions, currentSelection, stateKey, displayElement) {
    if (!Array.isArray(currentSelection)) currentSelection = [];
    const allItems = [...new Set([...defaultOptions, ...currentSelection])].sort();

    container.innerHTML = allItems.map(opt => {
        const isChecked = currentSelection.includes(opt);
        const isCustom = !defaultOptions.includes(opt);
        const styleColor = isCustom ? '#e0aaff' : '#fff';
        
        return `
            <label style="display:flex; align-items:center; padding: 4px 8px; cursor:pointer; user-select: none;">
                <input type="checkbox" value="${opt}" ${isChecked ? 'checked' : ''} style="margin-right: 8px;">
                <span style="color:${styleColor}; font-size:13px;">${opt}</span>
            </label>
        `;
    }).join('');

    const inputs = container.querySelectorAll('input[type="checkbox"]');
    inputs.forEach(input => {
        input.addEventListener('change', () => {
            const val = input.value;
            if (input.checked) {
                if (!state[stateKey].includes(val)) state[stateKey].push(val);
            } else {
                state[stateKey] = state[stateKey].filter(item => item !== val);
            }
            if (displayElement) {
                displayElement.textContent = state[stateKey].length > 0 ? state[stateKey].join(', ') : 'Selecionar...';
            }
            saveStateToServer();
        });
    });
}

// ======================================
// 4. Lógica do Hexagrama e Atributos
// ======================================

if (hexOverlay) {
    hexOverlay.onclick = () => {
        if (editMode) toggleEditMode();
        mostrandoAtributos = !mostrandoAtributos;
        hexOverlay.src = mostrandoAtributos ? 'img/imagem-no-site/atributos.png' : 'img/imagem-no-site/modificador.png';
        numerosHex.forEach(n => {
            const val = n.dataset.attrValue;
            n.textContent = mostrandoAtributos ? val : formatMod(calcularModificador(val));
        });
    };
}

const btnEditarHex = document.querySelector('.editar-hex');
if (btnEditarHex) {
    btnEditarHex.onclick = () => {
        if (!mostrandoAtributos) {
            mostrandoAtributos = true;
            hexOverlay.src = 'img/imagem-no-site/atributos.png';
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

function calcularModificador(n) { return Math.floor((parseInt(n, 10) - 10) / 2); }
function formatMod(m) { return m >= 0 ? `+${m}` : m; }

// ======================================
// 5. Classes e Dados de Vida
// ======================================

window.tornarPainelArrastavel = function(elemento) {
    const header = elemento.querySelector('.painel-header');
    if (!header) return;
    let isDragging = false;
    let startX, startY, startLeft, startTop;

    const onMouseDown = (e) => {
        if (e.target.tagName === 'BUTTON') return; 
        e.preventDefault();
        isDragging = true;
        startX = e.clientX;
        startY = e.clientY;
        const style = window.getComputedStyle(elemento);
        startLeft = parseInt(style.left) || 0;
        startTop = parseInt(style.top) || 0;

        if (style.transform !== 'none') {
            const rect = elemento.getBoundingClientRect();
            elemento.style.transform = 'none';
            elemento.style.left = rect.left + 'px';
            elemento.style.top = rect.top + 'px';
            startLeft = rect.left;
            startTop = rect.top;
        }
        header.style.cursor = 'grabbing';
        document.addEventListener('mousemove', onMouseMove);
        document.addEventListener('mouseup', onMouseUp);
    };

    const onMouseMove = (e) => {
        if (!isDragging) return;
        e.preventDefault();
        const dx = e.clientX - startX;
        const dy = e.clientY - startY;
        elemento.style.left = `${startLeft + dx}px`;
        elemento.style.top = `${startTop + dy}px`;
    };

    const onMouseUp = () => {
        if (isDragging) {
            isDragging = false;
            header.style.cursor = 'move';
            document.removeEventListener('mousemove', onMouseMove);
            document.removeEventListener('mouseup', onMouseUp);
        }
    };
    header.removeEventListener('mousedown', onMouseDown); 
    header.addEventListener('mousedown', onMouseDown);
};

const btnAbrirDV = document.getElementById('btn-abrir-dv');
if (btnAbrirDV) {
    btnAbrirDV.addEventListener('click', (e) => {
        const painel = document.getElementById('painelDadosVida');
        const lista = document.getElementById('listaDadosVida');
        renderizarPainelDadosVida(lista);
        painel.style.display = 'block';
        if (!painel.style.left) {
            const rect = e.currentTarget.getBoundingClientRect();
            let leftPos = rect.left;
            if (leftPos + 300 > window.innerWidth) leftPos = window.innerWidth - 310;
            painel.style.left = `${leftPos}px`;
            painel.style.top = `${rect.bottom + 10}px`;
        }
        tornarPainelArrastavel(painel);
    });
}

function renderizarPainelDadosVida(container) {
    container.innerHTML = '';
    if (typeof syncOrdemClasses === 'function') syncOrdemClasses();
    const ordem = state.ordemClasses || Object.keys(state.niveisClasses);
    let totalClasses = 0;

    ordem.forEach(key => {
        const nivel = parseInt(state.niveisClasses[key]) || 0;
        if (nivel <= 0) return;
        totalClasses++;
        const classeRef = classesPadrao.find(c => c.key === key);
        if (!classeRef) return;
        const gastos = state.dadosVidaGastos[key] || 0;
        const restantes = Math.max(0, nivel - gastos);
        const dadoTipo = classeRef.dado; 
        const div = document.createElement('div');
        div.className = 'item-dv';
        const disabledAttr = restantes <= 0 ? 'disabled' : '';
        const textoBotao = restantes <= 0 ? 'Esgotado' : `Rolar ${dadoTipo}`;
        div.innerHTML = `
            <div class="dv-info">
                <span class="dv-class-name">${classeRef.nome}</span>
                <span class="dv-count">Disponível: <strong style="color:${restantes > 0 ? '#fff' : '#d32f2f'}">${restantes}</strong> / ${nivel}</span>
            </div>
            <button class="btn-rolar-dv" ${disabledAttr} onclick="usarDadoVida('${key}', '${dadoTipo}')">
                <img src="img/imagem-no-site/dado.png" style="width:14px;"> ${textoBotao}
            </button>
        `;
        container.appendChild(div);
    });

    if (totalClasses === 0) {
        container.innerHTML = '<div style="color:#888; text-align:center; padding:10px;">Nenhuma classe definida.</div>';
    }
    
    const divReset = document.createElement('div');
    divReset.style.marginTop = '10px';
    divReset.style.paddingTop = '10px';
    divReset.style.borderTop = '1px solid #333';
    divReset.innerHTML = `
        <button onclick="realizarDescansoLongo()" style="width:100%; background:#111; color:#aaa; border:1px solid #444; padding:8px; border-radius:4px; cursor:pointer; font-size:12px;">
            Realizar Descanso Longo (Recuperar DV/2 e Vida)
        </button>
    `;
    container.appendChild(divReset);
}

window.usarDadoVida = function(classKey, dadoTipo) {
    const nivel = parseInt(state.niveisClasses[classKey]) || 0;
    const gastos = state.dadosVidaGastos[classKey] || 0;
    if (gastos >= nivel) return;

    const faces = parseInt(dadoTipo.replace('d', ''));
    const resultadoDado = Math.floor(Math.random() * faces) + 1;
    const conScore = state.atributos?.n1 || 10;
    const modCon = Math.floor((parseInt(conScore) - 10) / 2);
    const curaTotal = Math.max(0, resultadoDado + modCon);

    const vidaAtual = parseInt(state.vidaAtual) || 0;
    const vidaMax = state.vidaTotalCalculada || 100;
    const novaVida = Math.min(vidaMax, vidaAtual + curaTotal);
    
    // Mata timer de death save para garantir transição
    if (window.dsSaveTimer) { clearTimeout(window.dsSaveTimer); window.dsSaveTimer = null; }
    ativarBloqueioUI();

    state.vidaAtual = novaVida;
    state.dadosVidaGastos[classKey] = gastos + 1;

    saveStateToServer();
    atualizarTudoVisual(); 
    const container = document.getElementById('listaDadosVida');
    if(container) renderizarPainelDadosVida(container);

    if (typeof showCombatResults === 'function') {
        const nomeClasse = classesPadrao.find(c => c.key === classKey)?.nome || classKey;
        const resultadoObj = {
            total: curaTotal,
            text: curaTotal.toString(),
            detail: `${resultadoDado} (d${faces}) + ${modCon} (CON)`,
            isCrit: resultadoDado === faces, 
            isFumble: resultadoDado === 1,
            label: "CURA"
        };
        showCombatResults(`Cura (${nomeClasse})`, null, resultadoObj);
    } else {
        alert(`Rolou ${resultadoDado} + ${modCon} = ${curaTotal} de cura.`);
    }
};

window.realizarDescansoLongo = function() {
    // Mata timer de death save
    if (window.dsSaveTimer) { clearTimeout(window.dsSaveTimer); window.dsSaveTimer = null; }
    ativarBloqueioUI();

    state.vidaAtual = state.vidaTotalCalculada;
    state.deathSaves = { successes: [false, false, false], failures: [false, false, false] };
    const ordem = state.ordemClasses || Object.keys(state.niveisClasses);
    ordem.forEach(key => {
        const nivel = parseInt(state.niveisClasses[key]) || 0;
        const gastos = state.dadosVidaGastos[key] || 0;
        if (nivel > 0 && gastos > 0) {
            const recuperar = Math.max(1, Math.ceil(nivel / 2));
            state.dadosVidaGastos[key] = Math.max(0, gastos - recuperar);
        }
    });
    saveStateToServer();
    atualizarTudoVisual();
    const container = document.getElementById('listaDadosVida');
    if(container) renderizarPainelDadosVida(container);
    if (typeof exibirAvisoTemporario === 'function') {
        exibirAvisoTemporario("Descanso Longo Concluído.");
    }
};

const elClasseFocus = document.getElementById('classeFocus');
const painelClasses = document.getElementById('painelClasses');

window.abrirPainelClasses = function(elementoAlvo) {
    const painelClasses = document.getElementById('painelClasses');
    const lista = document.getElementById('listaClasses');
    if (!painelClasses || !lista) return;

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

    painelClasses.style.display = 'block';
    if (elementoAlvo) {
        const rect = elementoAlvo.getBoundingClientRect();
        let leftPos = rect.left;
        if (leftPos + 300 > window.innerWidth) leftPos = window.innerWidth - 310;
        painelClasses.style.left = `${leftPos}px`;
        painelClasses.style.top = `${rect.bottom + 5}px`;
        painelClasses.style.transform = 'none';
    } else {
        painelClasses.style.left = '50%';
        painelClasses.style.top = '50%';
        painelClasses.style.transform = 'translate(-50%, -50%)';
    }
    tornarPainelArrastavel(painelClasses);
};

if (elClasseFocus && painelClasses) {
    elClasseFocus.onclick = (e) => {
        window.abrirPainelClasses(e.currentTarget);
    };
}

const btnFecharPainel = document.getElementById('fecharPainel');
if (btnFecharPainel) btnFecharPainel.onclick = () => document.getElementById('painelClasses').style.display = 'none';

window.salvarNivelClasse = (key, val) => {
    const nivelNumerico = parseInt(val) || 0;
    if (!state.niveisClasses) state.niveisClasses = {};
    state.niveisClasses[key] = nivelNumerico;

    const totalNiv = Object.values(state.niveisClasses).reduce((a, b) => a + (parseInt(b) || 0), 0);
    if (state.vidaDadosSalvos) {
        Object.keys(state.vidaDadosSalvos).forEach(k => {
            const numNivel = parseInt(k.replace('v', ''));
            if (numNivel > totalNiv) delete state.vidaDadosSalvos[k];
        });
    }

    saveStateToServer();
    atualizarTudoVisual();

    const containerVida = document.querySelector('.classes-lista-container');
    if (containerVida && containerVida.style.display === 'block') {
        renderizarDadosVida();
    }
    setTimeout(() => {
        window.dispatchEvent(new CustomEvent('sheet-updated'));
        if (typeof atualizarTextoClassesHeader === 'function') atualizarTextoClassesHeader();
    }, 10);
};

const btnVida = document.getElementById('btnVida');
if (btnVida) {
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
    
    if (typeof syncOrdemClasses === 'function') syncOrdemClasses();
    else if (state.niveisClasses && !state.ordemClasses) state.ordemClasses = Object.keys(state.niveisClasses);

    let counter = 1;
    state.ordemClasses.forEach(key => {
        const nivel = parseInt(state.niveisClasses[key]) || 0;
        const classeRef = classesPadrao.find(c => c.key === key);
        if (!classeRef || nivel <= 0) return;

        for (let i = 1; i <= nivel; i++) {
            const vidId = `v${counter}`;
            const faces = parseInt(classeRef.dado.replace('d', ''));
            if (counter === 1 && (!state.vidaDadosSalvos[vidId])) state.vidaDadosSalvos[vidId] = faces;

            const valorSalvo = state.vidaDadosSalvos[vidId] || 0;
            const opcoes = DADOS_VALORES[classeRef.dado] || [];

            const li = document.createElement('li');
            li.style.cssText = "display: flex; align-items: center; gap: 10px; padding: 4px 0;";
            li.innerHTML = `
                <span style="min-width:90px; font-size:12px; font-weight:bold;">${classeRef.nome}</span>
                <img src="img/imagem-no-site/dado.png" style="width:18px; cursor:pointer" onclick="rolarDadoVida('${vidId}', '${classeRef.dado}')">
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

function atualizarVidaCalculada() {
    const somaDados = Object.values(state.vidaDadosSalvos || {}).reduce((acc, val) => acc + (parseInt(val) || 0), 0);
    const conScore = state.atributos?.n1 || 10; 
    const modCon = Math.floor((parseInt(conScore) - 10) / 2);
    const nivelTotal = Object.values(state.niveisClasses || {}).reduce((a, b) => a + (parseInt(b) || 0), 0);
    let vidaMax = somaDados + (modCon * nivelTotal);
    if (vidaMax < 1) vidaMax = 1;
    state.vidaTotalCalculada = vidaMax; 
    const elVidaTotal = document.getElementById('vida-total');
    if (elVidaTotal) elVidaTotal.textContent = vidaMax;

    atualizarBarraUI('vida', state.vidaAtual, vidaMax);
    atualizarBarraUI('vida-temp', state.vidaTempAtual, 100);
    atualizarBarraUI('dano-necro', state.danoNecroAtual, 100);
}

// ======================================
// 6. Death Saves e Barras de UI (CORRIGIDO)
// ======================================

// FUNÇÃO ROBUSTA PARA CLIQUE NAS BOLINHAS
window.toggleDeathSave = function(type, idx) {
    // 1. INICIALIZAÇÃO FORÇADA E CORRETA
    if (!state.deathSaves) state.deathSaves = { successes: [false,false,false], failures: [false,false,false] };
    if (!Array.isArray(state.deathSaves[type])) {
        state.deathSaves[type] = [false, false, false];
    }

    // 2. ATIVA BLOQUEIO UI
    ativarBloqueioUI();

    // 3. ALTERNA O VALOR
    state.deathSaves[type][idx] = !state.deathSaves[type][idx];

    // 4. ATUALIZA VISUAL
    atualizarBolinhasVisualmente(true);

    // 5. SALVA COM DEBOUNCE (e verifica vida > 0)
    if (window.dsSaveTimer) clearTimeout(window.dsSaveTimer);
    
    window.dsSaveTimer = setTimeout(() => {
        // SEGURANÇA CRÍTICA: Se a vida for maior que 0, NÃO SALVA as bolinhas.
        // Isso impede que um clique atrasado sobrescreva uma cura recente.
        if ((parseInt(state.vidaAtual) || 0) > 0) {
            return; 
        }
        saveStateToServer();
    }, 500);
};

// FUNÇÃO REVIVER (AGORA RESPEITANDO BLOQUEIO)
window.voltarVidaUm = function() {
    // 1. CANCELA qualquer save de bolinha pendente
    if (window.dsSaveTimer) { clearTimeout(window.dsSaveTimer); window.dsSaveTimer = null; }
    
    // 2. ATIVA O BLOQUEIO GERAL (Para ignorar eco do servidor)
    ativarBloqueioUI();

    // 3. DEFINE VIDA E LIMPA BOLINHAS
    state.vidaAtual = 1;
    state.deathSaves = { successes: [false, false, false], failures: [false, false, false] };
    
    // 4. ATUALIZA E SALVA
    atualizarBarraUI('vida', 1, state.vidaTotalCalculada);
    saveStateToServer();
};

// ATUALIZADOR VISUAL (COM SUPORTE A BLOQUEIO)
function atualizarBolinhasVisualmente(force = false) {
    // Se estiver bloqueado (clicando), ignora updates externos
    if (window.uiLock && !force) return;

    if (!state.deathSaves) return;
    
    const sArr = Array.isArray(state.deathSaves.successes) ? state.deathSaves.successes : [false,false,false];
    const fArr = Array.isArray(state.deathSaves.failures) ? state.deathSaves.failures : [false,false,false];

    for(let i=0; i<3; i++) {
        const elS = document.getElementById(`btn-ds-s-${i}`);
        const elF = document.getElementById(`btn-ds-f-${i}`);

        if (elS) {
            if (sArr[i]) elS.classList.add('active');
            else elS.classList.remove('active');
        }
        if (elF) {
            if (fArr[i]) elF.classList.add('active');
            else elF.classList.remove('active');
        }
    }
}

function atualizarBarraUI(prefixo, atual, total) {
    if (prefixo !== 'vida') {
        const fill = document.getElementById(`${prefixo}-fill`);
        const texto = document.getElementById(`${prefixo}-atual`);
        if (fill && texto) {
            const valAtual = parseInt(atual) || 0;
            const valTotal = parseInt(total) || 1;
            fill.style.width = Math.min(100, (valAtual / valTotal) * 100) + "%";
            texto.textContent = valAtual;
        }
        return;
    }

    const valAtual = parseInt(atual) || 0;
    const valTotal = parseInt(total) || 1;
    
    const containerBarra = document.querySelector('.vida-bar'); 
    let containerDS = document.getElementById('death-saves-ui'); 

    // GERA O HTML 
    if (!containerDS && containerBarra) {
        containerDS = document.createElement('div');
        containerDS.id = 'death-saves-ui';
        containerDS.className = 'death-saves-container';
        containerDS.innerHTML = `
            <div class="ds-content">
                <div class="ds-row success-row">
                    <span class="ds-label">Sucesso</span>
                    <div class="ds-group">
                        <div class="ds-circle success" id="btn-ds-s-0" onclick="toggleDeathSave('successes', 0)"></div>
                        <div class="ds-circle success" id="btn-ds-s-1" onclick="toggleDeathSave('successes', 1)"></div>
                        <div class="ds-circle success" id="btn-ds-s-2" onclick="toggleDeathSave('successes', 2)"></div>
                    </div>
                </div>
                <div class="ds-row failure-row">
                    <span class="ds-label">Falha</span>
                    <div class="ds-group">
                        <div class="ds-circle failure" id="btn-ds-f-0" onclick="toggleDeathSave('failures', 0)"></div>
                        <div class="ds-circle failure" id="btn-ds-f-1" onclick="toggleDeathSave('failures', 1)"></div>
                        <div class="ds-circle failure" id="btn-ds-f-2" onclick="toggleDeathSave('failures', 2)"></div>
                    </div>
                </div>
            </div>
            <button class="btn-reviver" onclick="voltarVidaUm()">
                <img src="img/imagem-no-site/coracao.png"> LEVANTAR (1 PV)
            </button>
        `;
        containerBarra.parentNode.insertBefore(containerDS, containerBarra.nextSibling);
    }

    // LÓGICA DE EXIBIÇÃO: VIDA VS MORTE
    if (valAtual <= 0) {
        if (containerBarra) containerBarra.style.display = 'none';
        if (containerDS) {
            containerDS.style.display = 'flex';
            atualizarBolinhasVisualmente(); 
        }
    } else {
        if (containerBarra) containerBarra.style.display = 'block';
        if (containerDS) containerDS.style.display = 'none';

        const fill = document.getElementById(`vida-fill`);
        const texto = document.getElementById(`vida-atual`);
        if (fill && texto) {
            fill.style.width = Math.min(100, (valAtual / valTotal) * 100) + "%";
            texto.textContent = valAtual;
        }
    }
}

// ======================================
// 7. Funções de Atualização Visual e Cálculos
// ======================================

function atualizarPassiva() {
    if (!state.pericias || !state.pericias["Percepção"]) {
        const el = document.getElementById('passivaValor');
        if (el) el.textContent = 10;
        return;
    }
    const dados = state.pericias["Percepção"];
    const mapAtributos = { "FOR": "n6", "DEX": "n2", "CON": "n1", "INT": "n5", "SAB": "n3", "CAR": "n4" };
    const attrKey = mapAtributos[dados.atributo] || "n3"; 
    const atributoValor = parseInt(state.atributos[attrKey] || 10);
    const modAtributo = Math.floor((atributoValor - 10) / 2);
    let bonusProf = 0;
    if (dados.treinado) {
        const nivelTotal = Object.values(state.niveisClasses || {}).reduce((a, b) => a + (parseInt(b) || 0), 0) || 1;
        bonusProf = Math.floor((nivelTotal - 1) / 4) + 2;
    }
    const outros = parseInt(dados.outros) || 0;
    const valorPassiva = 10 + modAtributo + bonusProf + outros;
    const el = document.getElementById('passivaValor');
    if (el) el.textContent = valorPassiva;
}

window.abrirPortraitOBS = function() {
    if (!state.nome) {
        alert("Defina um nome para o personagem antes de abrir o Portrait.");
        return;
    }
    const windowId = "Portrait_" + state.nome.replace(/\s+/g, '_');
    const url = `portrait.html?nome=${encodeURIComponent(state.nome)}`;
    window.open(url, windowId);
};

function inicializarDadosEsquerda() {
    if (!state.atributos) state.atributos = { n1: 10, n2: 10, n3: 10, n4: 10, n5: 10, n6: 10 };
    if (!state.niveisClasses) state.niveisClasses = {};
    if (!state.vidaDadosSalvos) state.vidaDadosSalvos = {};
    if (!state.dadosVidaGastos) state.dadosVidaGastos = {};

    // INICIALIZAÇÃO SEGURA DAS SALVAGUARDAS DE MORTE
    if (!state.deathSaves) {
        state.deathSaves = { successes: [false, false, false], failures: [false, false, false] };
    } else {
        const oldS = Array.isArray(state.deathSaves.successes) ? state.deathSaves.successes : [false, false, false];
        const oldF = Array.isArray(state.deathSaves.failures) ? state.deathSaves.failures : [false, false, false];
        state.deathSaves = { successes: oldS, failures: oldF };
    }

    if (!state.fraquezasList) state.fraquezasList = [];
    if (!state.resistenciasList) state.resistenciasList = [];
    if (!state.imunidadesList) state.imunidadesList = [];
    if (!state.proficienciasList) state.proficienciasList = [];
    if (!state.idiomasList) state.idiomasList = [];

    state.acOutros = parseInt(state.acOutros) || 0;
    state.iniciativaBonus = parseInt(state.iniciativaBonus) || 0;
    state.vidaAtual = parseInt(state.vidaAtual) || 0;
    state.vidaTempAtual = parseInt(state.vidaTempAtual) || 0;
    state.danoNecroAtual = parseInt(state.danoNecroAtual) || 0;
    state.xp = state.xp || "0";
    state.marco = parseInt(state.marco) || 0;
    state.inspiracao = parseInt(state.inspiracao) || 0;
    state.metros = parseFloat(state.metros) || 0;
    state.deslocamentoVoo = parseFloat(state.deslocamentoVoo) || 0;

    const setVal = (id, val) => { const el = document.getElementById(id); if (el) el.value = val; };
    const setText = (id, val) => { const el = document.getElementById(id); if (el) el.textContent = val; };

    setVal('xpAtual', state.xp);
    setVal('marcoAtual', state.marco);
    setText('inspiraValor', state.inspiracao);
    
    const elMetros = document.getElementById('metros');
    const elQuadrados = document.getElementById('quadrados');
    if (elMetros && elQuadrados) {
        elMetros.value = state.metros; 
        elQuadrados.value = (state.metros / 1.5).toFixed(1);
        
        const oldLabel = document.getElementById('voo-label-display');
        if (oldLabel) oldLabel.remove();
        
        let containerVooM = document.getElementById('container-voo-m');
        let containerVooQ = document.getElementById('container-voo-q');
        
        if (!containerVooM) {
            const linhaPai = elQuadrados.parentNode.parentNode; 
            containerVooM = document.createElement('div');
            containerVooM.id = 'container-voo-m';
            containerVooM.className = 'metros-box'; 
            containerVooM.innerHTML = `<label style="color:#4fc3f7;">Voo (m)</label><input id="voo-metros" type="number" style="border-color:#4fc3f7; color:#4fc3f7;">`;
            containerVooQ = document.createElement('div');
            containerVooQ.id = 'container-voo-q';
            containerVooQ.className = 'quadrados-box'; 
            containerVooQ.innerHTML = `<label style="color:#4fc3f7;">Voo (q)</label><input id="voo-quadrados" type="number" style="border-color:#4fc3f7; color:#4fc3f7;">`;
            linhaPai.appendChild(containerVooM);
            linhaPai.appendChild(containerVooQ);
        }

        const inputVooM = document.getElementById('voo-metros');
        const inputVooQ = document.getElementById('voo-quadrados');
        if (state.deslocamentoVoo > 0) {
            inputVooM.value = state.deslocamentoVoo;
            inputVooQ.value = (state.deslocamentoVoo / 1.5).toFixed(1);
            containerVooM.style.display = 'flex';
            containerVooQ.style.display = 'flex';
        } else {
            containerVooM.style.display = 'none';
            containerVooQ.style.display = 'none';
        }
        inputVooM.oninput = (e) => {
            const val = parseFloat(e.target.value) || 0;
            state.deslocamentoVoo = val;
            inputVooQ.value = (val / 1.5).toFixed(1);
            saveStateToServer();
        };
        inputVooQ.oninput = (e) => {
            const val = parseFloat(e.target.value) || 0;
            const metros = val * 1.5;
            state.deslocamentoVoo = metros;
            inputVooM.value = metros; 
            saveStateToServer();
        };
    }

    setVal('iniciativaBonus', state.iniciativaBonus);
    renderMultiSelect('sel-fraquezas', TIPOS_DANO_LISTA, state.fraquezasList, 'fraquezasList');
    renderMultiSelect('sel-resistencias', TIPOS_DANO_LISTA, state.resistenciasList, 'resistenciasList');
    renderMultiSelect('sel-imunidades', TIPOS_DANO_LISTA, state.imunidadesList, 'imunidadesList');
    renderMultiSelect('sel-proficiencias', PROFICIENCIAS_LISTA_ESQUERDA, state.proficienciasList, 'proficienciasList');
    renderMultiSelect('sel-idiomas', IDIOMAS_LISTA, state.idiomasList, 'idiomasList');

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

function atualizarMarcosEXP() {
    const nivelTotal = Object.values(state.niveisClasses).reduce((a, b) => a + b, 0) || 1;
    const tabela = xpPorNivel[Math.min(20, Math.max(1, nivelTotal))];
    const elXPText = document.getElementById('xpTotalText');
    if (elXPText) elXPText.textContent = `/ ${tabela.max}`;
    const elXPBar = document.getElementById('xpBar');
    if (elXPBar) elXPBar.style.width = Math.min(100, (parseInt(state.xp || 0) / tabela.max) * 100) + "%";
    const marcoMax = tabela.marco;
    const elMarcoMax = document.getElementById('marcoMax');
    if (elMarcoMax) elMarcoMax.value = marcoMax;
    const elMarcoBar = document.getElementById('marcoBar');
    if (elMarcoBar) elMarcoBar.style.width = marcoMax > 0 ? Math.min(100, (parseInt(state.marco || 0) / marcoMax) * 100) + "%" : "0%";
}

function atualizarFocoClasseRotativo() {
    const ativas = classesPadrao.filter(c => state.niveisClasses[c.key] > 0);
    const elNome = document.getElementById('classeFocusNome');
    const elNivel = document.getElementById('classeFocusNivel');

    if (!ativas.length) {
        if (elNome) elNome.textContent = "Sem Classe";
        if (elNivel) elNivel.textContent = "0";
        return;
    }
    let i = 0;
    if (rotateInterval) clearInterval(rotateInterval);
    const mudar = () => {
        const c = ativas[i % ativas.length];
        if (elNome) elNome.textContent = c.nome;
        if (elNivel) elNivel.textContent = state.niveisClasses[c.key];
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
    const elIni = document.getElementById('iniciativaValor');
    if (elIni) elIni.textContent = `${sinal}${total}`;
}

function atualizarAC() {
    if (!state || !state.atributos) return;
    const getMod = (n) => Math.floor((parseInt(state.atributos?.[n] || 10) - 10) / 2);
    const modDex = getMod('n2');
    const modCon = getMod('n1');
    const modSab = getMod('n3');
    const inventario = state.inventory || [];
    const habilidades = state.abilities || [];

    const armadura = inventario.find(i => i.equip && (i.type === 'Proteção' || i.type === 'protecao') && (i.tipoItem || '').toLowerCase() === 'armadura');
    const escudo = inventario.find(i => i.equip && (i.type === 'Proteção' || i.type === 'protecao') && (i.tipoItem || '').toLowerCase() === 'escudo');
    const barbDef = habilidades.some(a => a.active && a.title.toLowerCase().includes("bárbaro") && a.title.toLowerCase().includes("defesa"));
    const monkDef = habilidades.some(a => a.active && a.title.toLowerCase().includes("monge") && a.title.toLowerCase().includes("defesa"));

    let valorBase = 10;
    let valorAttr1 = modDex; 
    let labelAttr1 = "DES";
    let valorAttr2 = 0;      
    let labelAttr2 = "";
    let labelBase = "BASE";
    let tipoArmaduraVisual = "SEM ARMADURA";
    let classeCss = "nenhuma"; 

    if (armadura) {
        let baseArmor = parseInt(armadura.defense) || 10;
        if (baseArmor < 5) baseArmor = 10 + baseArmor; 
        valorBase = baseArmor;
        labelBase = "ARMADURA";
        const prof = (armadura.proficiency || '').toLowerCase();
        if (prof.includes('pesada')) {
            valorAttr1 = null; 
            tipoArmaduraVisual = "PESADA";
            classeCss = "pesado";
        } 
        else if (prof.includes('media') || prof.includes('média')) {
            valorAttr1 = Math.min(modDex, 2);
            tipoArmaduraVisual = "MÉDIA";
            classeCss = "media";
        } 
        else {
            tipoArmaduraVisual = "LEVE";
            classeCss = "leve";
        }
    } 
    else {
        if (barbDef) {
            valorAttr2 = modCon;
            labelAttr2 = "CON";
            tipoArmaduraVisual = "DEF. BÁRBARO";
            classeCss = "barbaro";
        } 
        else if (monkDef) {
            if (escudo) {
                tipoArmaduraVisual = "SEM ARMADURA";
                classeCss = "nenhuma";
            } else {
                valorAttr2 = modSab;
                labelAttr2 = "SAB";
                tipoArmaduraVisual = "DEF. MONGE";
                classeCss = "monge";
            }
        } 
        else {
            tipoArmaduraVisual = "SEM ARMADURA";
            classeCss = "nenhuma";
        }
    }

    let bonusAuto = 0;
    if (escudo) bonusAuto += (parseInt(escudo.defense) || 2);
    inventario.forEach(i => {
        if (i.equip && i.type === 'Geral' && i.defenseBonus) {
            bonusAuto += parseInt(i.defenseBonus) || 0;
        }
    });
    habilidades.forEach(hab => {
        if (hab.active && hab.defenseBonus) {
            bonusAuto += (parseInt(hab.defenseBonus.replace(/[^0-9-]/g, '')) || 0);
        }
    });

    if (state.acOutros === undefined) state.acOutros = 0;
    let bonusManual = parseInt(state.acOutros) || 0;
    const acFinal = valorBase + (valorAttr1 !== null ? valorAttr1 : 0) + valorAttr2 + bonusAuto + bonusManual;

    const elValor = document.getElementById('armaduraValor');
    if (elValor) elValor.textContent = acFinal;

    const elTextoTipo = document.querySelector('.armadura-tag');
    if (elTextoTipo) {
        elTextoTipo.textContent = tipoArmaduraVisual;
        elTextoTipo.className = 'armadura-tag ' + classeCss;
    }

    const formulaContainer = document.querySelector('.inline-formula');
    if (formulaContainer) {
        const createBlock = (val, lbl) => `
            <div class="zero-pair">
                <span class="zero-num">${val}</span>
                <div class="zero-divider"></div>
                <span class="zero-label">${lbl}</span>
            </div>
        `;
        const createInputBlock = (val, lbl) => `
            <div class="zero-pair">
                <input type="number" class="zero-input" value="${val}" onchange="window.updateACManual(this.value)" onclick="this.select()">
                <div class="zero-divider"></div>
                <span class="zero-label">${lbl}</span>
            </div>
        `;

        const plusSign = `<span class="formula-plus">+</span>`; 
        const plusSignExtra = `<span class="formula-plus plus-extra">+</span>`; 

        let htmlFormula = ``;
        htmlFormula += createBlock(valorBase, labelBase);

        if (valorAttr1 !== null) {
            htmlFormula += plusSign;
            htmlFormula += createBlock(valorAttr1 >= 0 ? valorAttr1 : valorAttr1, labelAttr1);
        }
        if (valorAttr2 !== 0) {
            htmlFormula += plusSign;
            htmlFormula += createBlock(valorAttr2, labelAttr2);
        }
        if (bonusAuto !== 0) {
            htmlFormula += plusSign;
            htmlFormula += createBlock(bonusAuto, "ITENS");
        }
        htmlFormula += plusSignExtra;
        htmlFormula += createInputBlock(bonusManual, "EXTRA");

        formulaContainer.innerHTML = htmlFormula;
    }
}

window.updateACManual = function(val) {
    state.acOutros = parseInt(val) || 0;
    saveStateToServer(); 
    atualizarAC();        
}

function atualizarDeslocamento() {
    let baseMetros = parseFloat(state.metros) || 0; 
    let bonusMetros = 0;
    if (state.abilities) {
        state.abilities.forEach(hab => {
            if (hab.active && hab.speedBonus) {
                let clean = hab.speedBonus.replace(',', '.').replace(/[^0-9.-]/g, '');
                let val = parseFloat(clean);
                if (!isNaN(val)) {
                    bonusMetros += val;
                }
            }
        });
    }

    const elMetros = document.getElementById('metros');
    const elQuadrados = document.getElementById('quadrados');
    const totalMetros = baseMetros + bonusMetros;
    const totalQuadrados = totalMetros / 1.5;

    if (elMetros) {
        elMetros.value = totalMetros; 
        if (bonusMetros > 0) elMetros.style.color = "#4fc3f7"; 
        else elMetros.style.color = "#fff";
    }
    if (elQuadrados) {
        elQuadrados.value = totalQuadrados.toFixed(1);
    }
}

function atualizarTudoVisual() {
    atualizarFocoClasseRotativo();
    atualizarMarcosEXP();
    atualizarVidaCalculada();
    atualizarProficiencia();
    atualizarIniciativaTotal();
    atualizarAC(); 
    atualizarPassiva();
    atualizarDeslocamento(); 
    const nivelTotal = Object.values(state.niveisClasses || {}).reduce((a, b) => a + (parseInt(b) || 0), 0);
    const elNivel = document.getElementById('nivelFoco');
    if (elNivel) elNivel.textContent = nivelTotal;
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

function vincularEventosInputs() {
    const addEnterBlur = (el, stateKey) => {
        if (!el) return;
        if (document.activeElement !== el) {
            el.value = state[stateKey] || "";
        }
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

    const iniBonus = document.getElementById('iniciativaBonus');
    if (iniBonus) {
        iniBonus.oninput = (e) => {
            state.iniciativaBonus = parseInt(e.target.value) || 0;
            atualizarIniciativaTotal();
        };
        iniBonus.onblur = () => saveStateToServer();
        iniBonus.addEventListener('keydown', (e) => { if (e.key === 'Enter') iniBonus.blur(); });
    }

    const outrosInput = document.getElementById('ac-outros');
    if (outrosInput) {
        outrosInput.value = state.acOutros || 0; 
        outrosInput.oninput = () => { 
            state.acOutros = parseInt(outrosInput.value) || 0; 
            atualizarAC(); 
        };
        outrosInput.onblur = () => { 
            state.acOutros = parseInt(outrosInput.value) || 0; 
            saveStateToServer(); 
        };
        outrosInput.addEventListener('keydown', (e) => { if (e.key === 'Enter') { e.preventDefault(); outrosInput.blur(); } });
    }

    ['vida-atual', 'vida-temp-atual', 'dano-necro-atual'].forEach(id => {
        const el = document.getElementById(id);
        if (el) {
            el.oninput = () => {
                // CANCELA qualquer save de bolinha pendente se mexer na vida
                if (dsSaveTimer) { clearTimeout(dsSaveTimer); dsSaveTimer = null; }
                ativarBloqueioUI(); // Ativa a proteção de eco

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
        // CANCELA qualquer save de bolinha pendente se mexer na vida
        if (dsSaveTimer) { clearTimeout(dsSaveTimer); dsSaveTimer = null; }
        ativarBloqueioUI(); // Ativa a proteção de eco

        let key = btn.closest('.vida-container') ? "vidaAtual" : (btn.closest('.barra-secundaria:nth-child(1)') ? "vidaTempAtual" : "danoNecroAtual");
        let step = btn.classList.contains('menos5') ? -5 : (btn.classList.contains('menos1') ? -1 : (btn.classList.contains('mais1') ? 1 : 5));
        let max = key === 'vidaAtual' ? parseInt(document.getElementById('vida-total').textContent) : 9999;
        
        state[key] = Math.max(0, Math.min(max, (parseInt(state[key]) || 0) + step));
        atualizarVidaCalculada();
        saveStateToServer();
    };
});

document.getElementById('inspiraLeft').onclick = () => { state.inspiracao = Math.max(0, (parseInt(state.inspiracao) || 0) - 1); document.getElementById('inspiraValor').textContent = state.inspiracao; saveStateToServer(); };
document.getElementById('inspiraRight').onclick = () => { state.inspiracao = (parseInt(state.inspiracao) || 0) + 1; document.getElementById('inspiraValor').textContent = state.inspiracao; saveStateToServer(); };