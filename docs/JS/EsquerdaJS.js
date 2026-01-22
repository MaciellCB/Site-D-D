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
    'Ácido', 'Contundente','Doenças', 'Cortante', 'Perfurante', 'Fogo', 'Frio',
    'Elétrico', 'Trovão', 'Veneno', 'Radiante', 'Necrótico', 'Psíquico', 'Energético'
];

// --- LISTAS DE SELEÇÃO (Atualizada com Instrumentos) ---
const PROFICIENCIAS_LISTA_ESQUERDA = [
    // Armaduras e Armas
    'Armaduras leves', 'Armaduras médias', 'Armaduras pesadas', 'Escudos',
    'Armas simples', 'Armas marciais', 'Armas de fogo',
    
    // Ferramentas de Artesão
    'Ferramentas de Alquimista', 'Ferramentas de Calígrafo', 'Ferramentas de Carpinteiro',
    'Ferramentas de Cartógrafo', 'Ferramentas de Coureiro', 'Ferramentas de Ferreiro',
    'Ferramentas de Joalheiro', 'Ferramentas de Oleiro', 'Ferramentas de Pedreiro',
    'Ferramentas de Sapateiro', 'Ferramentas de Tecelão', 'Ferramentas de Vidreiro',
    'Ferramentas de Pintor', 'Ferramentas de Ladrão', 'Suprimentos de Alquimista','Ferramentas de Funileiro',
    
    // Kits
    'Kit de Disfarce', 'Kit de Falsificação', 'Kit de Herborismo', 'Kit de Venenos',
    
    // Instrumentos Musicais
    'Instrumento Musical (Genérico)',
    'Alaúde', 'Bateria', 'Charamela', 'Citara', 'Flauta', 'Flauta de Pã', 
    'Gaita de Foles', 'Lira', 'Tambor', 'Trombeta', 'Trompa', 'Viola', 
    'Violino', 'Xilofone',

    // Veículos
    'Veículos (terrestres)', 'Veículos (aquáticos)'
];

const IDIOMAS_LISTA = [
    // Comuns
    'Comum', 'Anão', 'Élfico', 'Gigante', 'Gnômico', 'Goblin', 'Halfling', 'Orc',

    // Exóticas
    'Abissal', 'Celestial', 'Dialeto Subterrâneo', 'Dracônico', 'Infernal',
    'Primordial', 'Silvestre', 'Druídico', 'Gíria de Ladrões',

    // Subidiomas do Primordial
    'Auran', 'Aquan', 'Ignan', 'Terrano',

    // Idiomas de cenários (oficiais)
    'Qualith', 'Loross', 'Roussar', 'Aquan Antigo'
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

/* =============================================================
   ATUALIZAÇÃO: inicializarDadosEsquerda (VOO TOTALMENTE EDITÁVEL)
============================================================= */

function inicializarDadosEsquerda() {
    // Inicializa objetos
    if (!state.atributos) state.atributos = { n1: 10, n2: 10, n3: 10, n4: 10, n5: 10, n6: 10 };
    if (!state.niveisClasses) state.niveisClasses = {};
    if (!state.vidaDadosSalvos) state.vidaDadosSalvos = {};

    // Arrays e Listas
    if (!state.fraquezasList) state.fraquezasList = [];
    if (!state.resistenciasList) state.resistenciasList = [];
    if (!state.imunidadesList) state.imunidadesList = [];
    if (!state.proficienciasList) state.proficienciasList = [];
    if (!state.idiomasList) state.idiomasList = [];

    if (!state.niveisClasses) state.niveisClasses = {};
    if (!state.vidaDadosSalvos) state.vidaDadosSalvos = {};
    
    // NOVO: Inicializa controle de dados gastos
    if (!state.dadosVidaGastos) state.dadosVidaGastos = {};

    // Números seguros
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

    // Preenche inputs básicos
    const setVal = (id, val) => { const el = document.getElementById(id); if (el) el.value = val; };
    const setText = (id, val) => { const el = document.getElementById(id); if (el) el.textContent = val; };

    setVal('xpAtual', state.xp);
    setVal('marcoAtual', state.marco);
    setText('inspiraValor', state.inspiracao);
    
    // --- LÓGICA DE DESLOCAMENTO (TERRA E VOO) ---
    const elMetros = document.getElementById('metros');
    const elQuadrados = document.getElementById('quadrados');
    
    if (elMetros && elQuadrados) {
        // 1. Preenche valores de terra (padrão)
        elMetros.value = state.metros; 
        elQuadrados.value = (state.metros / 1.5).toFixed(1);

        // Remove label antigo se existir
        const oldLabel = document.getElementById('voo-label-display');
        if (oldLabel) oldLabel.remove();
        
        // 2. Verifica/Cria os Blocos de Voo Dinâmicos
        let containerVooM = document.getElementById('container-voo-m');
        let containerVooQ = document.getElementById('container-voo-q');
        
        if (!containerVooM) {
            const linhaPai = elQuadrados.parentNode.parentNode; 

            // Cria bloco Voo Metros (EDITÁVEL)
            containerVooM = document.createElement('div');
            containerVooM.id = 'container-voo-m';
            containerVooM.className = 'metros-box'; 
            containerVooM.innerHTML = `<label style="color:#4fc3f7;">Voo (m)</label><input id="voo-metros" type="number" style="border-color:#4fc3f7; color:#4fc3f7;">`;
            
            // Cria bloco Voo Quadrados (AGORA EDITÁVEL - removido readonly disabled)
            containerVooQ = document.createElement('div');
            containerVooQ.id = 'container-voo-q';
            containerVooQ.className = 'quadrados-box'; 
            containerVooQ.innerHTML = `<label style="color:#4fc3f7;">Voo (q)</label><input id="voo-quadrados" type="number" style="border-color:#4fc3f7; color:#4fc3f7;">`;

            // Insere na tela
            linhaPai.appendChild(containerVooM);
            linhaPai.appendChild(containerVooQ);
        }

        // 3. Atualiza Valores e Visibilidade
        const inputVooM = document.getElementById('voo-metros');
        const inputVooQ = document.getElementById('voo-quadrados');

        // Define valor inicial vindo do Estado
        if (state.deslocamentoVoo > 0) {
            inputVooM.value = state.deslocamentoVoo;
            inputVooQ.value = (state.deslocamentoVoo / 1.5).toFixed(1);
            
            containerVooM.style.display = 'flex';
            containerVooQ.style.display = 'flex';
        } else {
            containerVooM.style.display = 'none';
            containerVooQ.style.display = 'none';
        }

        // 4. EVENTOS DE EDIÇÃO DO VOO (BIDIRECIONAL)
        
        // Editou Metros -> Calcula Quadrados
        inputVooM.oninput = (e) => {
            const novoVoo = parseFloat(e.target.value) || 0;
            state.deslocamentoVoo = novoVoo;
            
            // Atualiza visualmente os quadrados
            inputVooQ.value = (novoVoo / 1.5).toFixed(1);
            saveStateToServer();
        };

        // Editou Quadrados -> Calcula Metros
        inputVooQ.oninput = (e) => {
            const novosQuadrados = parseFloat(e.target.value) || 0;
            const novoVooMetros = novosQuadrados * 1.5;
            
            state.deslocamentoVoo = novoVooMetros;
            
            // Atualiza visualmente os metros
            inputVooM.value = novoVooMetros; // Pode usar .toFixed(1) se quiser arredondar visualmente
            saveStateToServer();
        };
    }

    setVal('iniciativaBonus', state.iniciativaBonus);

    // Renderiza Multi-Selects
    renderMultiSelect('sel-fraquezas', TIPOS_DANO_LISTA, state.fraquezasList, 'fraquezasList');
    renderMultiSelect('sel-resistencias', TIPOS_DANO_LISTA, state.resistenciasList, 'resistenciasList');
    renderMultiSelect('sel-imunidades', TIPOS_DANO_LISTA, state.imunidadesList, 'imunidadesList');
    renderMultiSelect('sel-proficiencias', PROFICIENCIAS_LISTA_ESQUERDA, state.proficienciasList, 'proficienciasList');
    renderMultiSelect('sel-idiomas', IDIOMAS_LISTA, state.idiomasList, 'idiomasList');

    // Hexagrama
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
// Listener para abrir o painel de Dados de Vida
/* =============================================================
   TORNA O PAINEL ARRASTÁVEL (GLOBAL)
   Coloque isso no início ou meio do arquivo, fora de outros blocos
============================================================= */
window.tornarPainelArrastavel = function(elemento) {
    const header = elemento.querySelector('.painel-header');
    if (!header) return;

    let isDragging = false;
    let startX, startY, initialLeft, initialTop;

    header.onmousedown = (e) => {
        if (e.target.tagName === 'BUTTON') return; // Ignora clique no X
        e.preventDefault();

        isDragging = true;
        startX = e.clientX;
        startY = e.clientY;

        const rect = elemento.getBoundingClientRect();
        
        // Converte para pixels absolutos para evitar bugs de %
        elemento.style.left = rect.left + 'px';
        elemento.style.top = rect.top + 'px';
        elemento.style.transform = 'none'; // Remove transformações para não somar coordenadas
        
        header.style.cursor = 'grabbing';
    };

    document.onmousemove = (e) => {
        if (!isDragging) return;
        e.preventDefault();

        const dx = e.clientX - startX;
        const dy = e.clientY - startY;

        elemento.style.left = `${parseFloat(elemento.style.left) + dx}px`;
        elemento.style.top = `${parseFloat(elemento.style.top) + dy}px`;

        startX = e.clientX;
        startY = e.clientY;
    };

    document.onmouseup = () => {
        if (isDragging) {
            isDragging = false;
            header.style.cursor = 'move';
        }
    };
};

/* =============================================================
   SISTEMA DE DADOS DE VIDA (DESCANSOS) - CORRIGIDO
============================================================= */

// Listener para abrir o painel
const btnAbrirDV = document.getElementById('btn-abrir-dv');
if (btnAbrirDV) {
    btnAbrirDV.addEventListener('click', (e) => {
        const painel = document.getElementById('painelDadosVida');
        const lista = document.getElementById('listaDadosVida');
        
        renderizarPainelDadosVida(lista);
        
        painel.style.display = 'block';
        
        // Posicionamento inicial (se ainda não foi movido)
        if (!painel.style.left) {
            const rect = e.currentTarget.getBoundingClientRect();
            let leftPos = rect.left;
            if (leftPos + 300 > window.innerWidth) leftPos = window.innerWidth - 310;
            
            painel.style.left = `${leftPos}px`;
            painel.style.top = `${rect.bottom + 10}px`;
        }
        
        // Aplica o arrastar
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
    
    // Botão de Descanso Longo (Sem confirmação agora)
    const divReset = document.createElement('div');
    divReset.style.marginTop = '10px';
    divReset.style.paddingTop = '10px';
    divReset.style.borderTop = '1px solid #333';
    divReset.innerHTML = `
        <button onclick="realizarDescansoLongo()" style="width:100%; background:#111; color:#aaa; border:1px solid #444; padding:8px; border-radius:4px; cursor:pointer; font-size:12px;">
            💤 Realizar Descanso Longo (Recuperar DV e Vida)
        </button>
    `;
    container.appendChild(divReset);
}

/* --- FUNÇÃO CORRIGIDA: USAR DADO DE VIDA --- */
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
    
    state.vidaAtual = novaVida;
    state.dadosVidaGastos[classKey] = gastos + 1;

    saveStateToServer();
    atualizarTudoVisual(); 
    
    const container = document.getElementById('listaDadosVida');
    if(container) renderizarPainelDadosVida(container);

    // --- NOVA CHAMADA: Usa o visual da Direita (showCombatResults) ---
    if (typeof showCombatResults === 'function') {
        const nomeClasse = classesPadrao.find(c => c.key === classKey)?.nome || classKey;
        
        // Formata o objeto como a função espera
        const resultadoObj = {
            total: curaTotal,
            text: curaTotal.toString(),
            detail: `${resultadoDado} (d${faces}) + ${modCon} (CON)`,
            isCrit: resultadoDado === faces, // Destaque se tirou máximo no dado
            isFumble: resultadoDado === 1
        };

        showCombatResults(`Cura (${nomeClasse})`, null, resultadoObj);
    } else {
        // Fallback caso a direita não tenha carregado
        alert(`Rolou ${resultadoDado} + ${modCon} = ${curaTotal} de cura.`);
    }
};

/* --- FUNÇÃO CORRIGIDA: DESCANSO LONGO --- */
window.realizarDescansoLongo = function() {
    // 1. Recupera Vida Total
    state.vidaAtual = state.vidaTotalCalculada;

    // 2. Recupera Dados de Vida (Metade do total, ARREDONDADO PARA CIMA)
    const ordem = state.ordemClasses || Object.keys(state.niveisClasses);
    
    ordem.forEach(key => {
        const nivel = parseInt(state.niveisClasses[key]) || 0;
        const gastos = state.dadosVidaGastos[key] || 0;
        
        if (nivel > 0 && gastos > 0) {
            // Math.ceil para arredondar para cima
            const recuperar = Math.max(1, Math.ceil(nivel / 2));
            state.dadosVidaGastos[key] = Math.max(0, gastos - recuperar);
        }
    });

    saveStateToServer();
    atualizarTudoVisual();
    
    const container = document.getElementById('listaDadosVida');
    if(container) renderizarPainelDadosVida(container);
    
    // Aviso discreto que descansou
    if (typeof exibirAvisoTemporario === 'function') {
        exibirAvisoTemporario("Descanso Longo Concluído.");
    }
};
// ======================================
// 3. Sistema de Multi-Select (Dropdowns)
// ======================================

/* =============================================================
   SISTEMA DE MULTI-SELECT (CORRIGIDO: NÃO FECHA AO CLICAR)
   ============================================================= */
function renderMultiSelect(elementId, optionsList, currentSelection, stateKey) {
    const container = document.getElementById(elementId);
    if (!container) return;

    // 1. Garante que currentSelection seja um array
    if (!Array.isArray(currentSelection)) currentSelection = [];

    // 2. Função interna para atualizar o texto do display
    const updateDisplay = () => {
        const display = container.querySelector('.multi-select-display');
        if (display) {
            display.textContent = state[stateKey].length > 0 ? state[stateKey].join(', ') : 'Selecionar...';
        }
    };

    // 3. Verifica se a estrutura HTML já existe
    let display = container.querySelector('.multi-select-display');
    
    if (!display) {
        // Renderiza a estrutura inicial (fechada)
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

        // --- CORREÇÃO AQUI: Toggle Abrir/Fechar ---
        box.addEventListener('click', (e) => {
            // Verifica se o clique foi DENTRO da lista de opções (checkboxes, labels, input extra).
            // Se foi, paramos a função aqui para NÃO fechar o menu.
            if (optsContainer.contains(e.target)) return;
            
            const isVisible = optsContainer.style.display === 'block';
            
            // Fecha outros dropdowns que estejam abertos na página para evitar bagunça
            document.querySelectorAll('.multi-select-options').forEach(el => el.style.display = 'none'); 
            
            if (!isVisible) {
                optsContainer.style.display = 'block';
                // Recalcula a lista ao abrir para garantir que itens novos apareçam
                renderCheckboxes(listContainer, optionsList, state[stateKey], stateKey, display);
            } else {
                optsContainer.style.display = 'none';
            }
        });

        // Fechar ao clicar fora do componente
        document.addEventListener('click', (e) => {
            if (!container.contains(e.target)) {
                optsContainer.style.display = 'none';
            }
        });

        // Evento para adicionar item Customizado via Input (Enter)
        extraInput.addEventListener('keydown', (e) => {
            if (e.key === 'Enter') {
                e.preventDefault();
                const val = extraInput.value.trim();
                
                // Adiciona apenas se não for vazio e não existir ainda
                if (val && !state[stateKey].includes(val)) {
                    state[stateKey].push(val);
                    saveStateToServer();
                    updateDisplay();
                    
                    // Re-renderiza a lista para o novo item aparecer como checkbox marcado imediatamente
                    renderCheckboxes(listContainer, optionsList, state[stateKey], stateKey, display);
                    
                    extraInput.value = ''; // Limpa input
                    // Mantém o foco no input para adicionar mais se quiser
                    extraInput.focus();
                }
            }
        });

        // Renderização inicial dos checkboxes
        renderCheckboxes(listContainer, optionsList, state[stateKey], stateKey, display);
    } else {
        // Se já existe HTML, apenas atualiza o texto do display
        updateDisplay();
        
        // Se estiver aberto, atualiza a lista em tempo real
        const optsContainer = container.querySelector('.multi-select-options');
        if (optsContainer.style.display === 'block') {
            const listContainer = container.querySelector('.options-list-container');
            renderCheckboxes(listContainer, optionsList, state[stateKey], stateKey, display);
        }
    }
}

// Função auxiliar para gerar os checkboxes HTML
function renderCheckboxes(container, defaultOptions, currentSelection, stateKey, displayElement) {
    if (!Array.isArray(currentSelection)) currentSelection = [];

    // Une opções padrão com o que está no state (customizados)
    // Cria um Set para garantir unicidade e converte de volta para array
    const allItems = [...new Set([...defaultOptions, ...currentSelection])].sort();

    container.innerHTML = allItems.map(opt => {
        const isChecked = currentSelection.includes(opt);
        // Destaca visualmente itens que não são padrão (customizados)
        const isCustom = !defaultOptions.includes(opt);
        const styleColor = isCustom ? '#e0aaff' : '#fff';
        
        return `
            <label style="display:flex; align-items:center; padding: 4px 8px; cursor:pointer; user-select: none;">
                <input type="checkbox" value="${opt}" ${isChecked ? 'checked' : ''} style="margin-right: 8px;">
                <span style="color:${styleColor}; font-size:13px;">${opt}</span>
            </label>
        `;
    }).join('');

    // Reatribui eventos aos novos checkboxes
    const inputs = container.querySelectorAll('input[type="checkbox"]');
    inputs.forEach(input => {
        input.addEventListener('change', () => {
            const val = input.value;
            if (input.checked) {
                if (!state[stateKey].includes(val)) state[stateKey].push(val);
            } else {
                state[stateKey] = state[stateKey].filter(item => item !== val);
            }
            
            // Atualiza texto do display
            if (displayElement) {
                displayElement.textContent = state[stateKey].length > 0 ? state[stateKey].join(', ') : 'Selecionar...';
            }
            saveStateToServer();
        });
    });
}

// Função auxiliar para gerar os checkboxes HTML
function renderCheckboxes(container, defaultOptions, currentSelection, stateKey, displayElement) {
    if (!Array.isArray(currentSelection)) currentSelection = [];

    // Une opções padrão com o que está no state (customizados)
    // Cria um Set para garantir unicidade e converte de volta para array
    const allItems = [...new Set([...defaultOptions, ...currentSelection])].sort();

    container.innerHTML = allItems.map(opt => {
        const isChecked = currentSelection.includes(opt);
        // Destaca visualmente itens que não são padrão (customizados)
        const isCustom = !defaultOptions.includes(opt);
        const styleColor = isCustom ? '#e0aaff' : '#fff';
        
        return `
            <label style="display:flex; align-items:center; padding: 4px 8px; cursor:pointer;">
                <input type="checkbox" value="${opt}" ${isChecked ? 'checked' : ''} style="margin-right: 8px;">
                <span style="color:${styleColor}; font-size:13px;">${opt}</span>
            </label>
        `;
    }).join('');

    // Reatribui eventos aos novos checkboxes
    const inputs = container.querySelectorAll('input[type="checkbox"]');
    inputs.forEach(input => {
        input.addEventListener('change', () => {
            const val = input.value;
            if (input.checked) {
                if (!state[stateKey].includes(val)) state[stateKey].push(val);
            } else {
                state[stateKey] = state[stateKey].filter(item => item !== val);
            }
            
            // Atualiza texto do display
            if (displayElement) {
                displayElement.textContent = state[stateKey].length > 0 ? state[stateKey].join(', ') : 'Selecionar...';
            }
            saveStateToServer();
        });
    });
}

// Função auxiliar para gerar os checkboxes HTML
function renderCheckboxes(container, defaultOptions, currentSelection, stateKey, displayElement) {
    // Une opções padrão com o que está no state (customizados)
    const allItems = [...new Set([...defaultOptions, ...currentSelection])].sort();

    container.innerHTML = allItems.map(opt => {
        const isChecked = currentSelection.includes(opt);
        // Destaca visualmente itens que não são padrão (customizados)
        const isCustom = !defaultOptions.includes(opt);
        const styleColor = isCustom ? '#e0aaff' : '#fff';
        
        return `
            <label style="display:flex; align-items:center; padding: 4px 8px; cursor:pointer;">
                <input type="checkbox" value="${opt}" ${isChecked ? 'checked' : ''} style="margin-right: 8px;">
                <span style="color:${styleColor}; font-size:13px;">${opt}</span>
            </label>
        `;
    }).join('');

    // Reatribui eventos aos novos checkboxes
    const inputs = container.querySelectorAll('input[type="checkbox"]');
    inputs.forEach(input => {
        input.addEventListener('change', () => {
            const val = input.value;
            if (input.checked) {
                if (!state[stateKey].includes(val)) state[stateKey].push(val);
            } else {
                state[stateKey] = state[stateKey].filter(item => item !== val);
            }
            
            // Atualiza texto do display
            if (displayElement) {
                displayElement.textContent = state[stateKey].length > 0 ? state[stateKey].join(', ') : 'Selecionar...';
            }
            saveStateToServer();
        });
    });
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

// ======================================
// 6. Classes e Dados de Vida (COM ARRASTAR)
// ======================================

const elClasseFocus = document.getElementById('classeFocus');
const painelClasses = document.getElementById('painelClasses'); // Referência global

/* =============================================================
   NOVA FUNÇÃO GLOBAL: ABRIR PAINEL DE CLASSES
   (Permite que o Header também chame este painel)
============================================================= */
window.abrirPainelClasses = function(elementoAlvo) {
    const painelClasses = document.getElementById('painelClasses');
    const lista = document.getElementById('listaClasses');
    
    if (!painelClasses || !lista) return;

    // 1. Limpa e Popula a lista (Mesma lógica original)
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

    // 2. Exibe o Painel
    painelClasses.style.display = 'block';

    // 3. Posicionamento (Perto do elemento que foi clicado)
    if (elementoAlvo) {
        const rect = elementoAlvo.getBoundingClientRect();
        // Ajusta para não sair da tela na direita
        let leftPos = rect.left;
        if (leftPos + 300 > window.innerWidth) { // 300 é a largura do painel
            leftPos = window.innerWidth - 310;
        }
        
        painelClasses.style.left = `${leftPos}px`;
        painelClasses.style.top = `${rect.bottom + 5}px`;
        
        // Reset do transform caso tenha sido arrastado antes
        painelClasses.style.transform = 'none';
    } else {
        // Fallback centralizado
        painelClasses.style.left = '50%';
        painelClasses.style.top = '50%';
        painelClasses.style.transform = 'translate(-50%, -50%)';
    }
};

// Listener original da Esquerda (Mantém o funcionamento antigo chamando a nova função)
if (elClasseFocus && painelClasses) {
    elClasseFocus.onclick = (e) => {
        window.abrirPainelClasses(e.currentTarget);
    };

    // --- FUNÇÃO PARA ARRASTAR O PAINEL ---
function tornarPainelArrastavel(elemento) {
    const header = elemento.querySelector('.painel-header');
    let isDragging = false;
    let startX, startY, initialLeft, initialTop;

    header.addEventListener('mousedown', (e) => {
        // Impede arrastar se clicar no botão de fechar (X)
        if (e.target.tagName === 'BUTTON') return;

        isDragging = true;
        startX = e.clientX;
        startY = e.clientY;
        
        // Pega a posição atual computada (caso seja 'auto' ou porcentagem)
        const rect = elemento.getBoundingClientRect();
        initialLeft = rect.left;
        initialTop = rect.top;

        header.style.cursor = 'grabbing';
    });

    document.addEventListener('mousemove', (e) => {
        if (!isDragging) return;
        e.preventDefault(); // Evita seleção de texto

        const dx = e.clientX - startX;
        const dy = e.clientY - startY;

        elemento.style.left = `${initialLeft + dx}px`;
        elemento.style.top = `${initialTop + dy}px`;
    });

    document.addEventListener('mouseup', () => {
        if (isDragging) {
            isDragging = false;
            header.style.cursor = 'grab';
        }
    });
}
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
    const totalNiv = Object.values(state.niveisClasses).reduce((a, b) => a + (parseInt(b) || 0), 0);
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
    if (containerVida && containerVida.style.display === 'block') {
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
if (btnFecharPainel) btnFecharPainel.onclick = () => document.getElementById('painelClasses').style.display = 'none';

const btnVida = document.getElementById('btnVida');
if (btnVida) {
    btnVida.onclick = () => {
        const container = document.querySelector('.classes-lista-container');
        container.style.display = container.style.display === 'none' ? 'block' : 'none';
        renderizarDadosVida();
    };
}

/* =============================================================
   SUBSTITUA NO ESQUERDAJS.js (Para sincronizar com o Header)
============================================================= */
function renderizarDadosVida() {
    const lista = document.getElementById('classesLista');
    if (!lista) return;
    lista.innerHTML = '';
    
    // Garante sincronia antes de renderizar
    if (typeof syncOrdemClasses === 'function') syncOrdemClasses();
    // Fallback se a função não estiver no escopo global
    else if (state.niveisClasses && !state.ordemClasses) state.ordemClasses = Object.keys(state.niveisClasses);

    let counter = 1;

    // Usa a ordemClasses para iterar
    state.ordemClasses.forEach(key => {
        const nivel = parseInt(state.niveisClasses[key]) || 0;
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

/* =============================================================
   CORREÇÃO: VIDA TOTAL = DADOS + (MOD. CON * NÍVEL)
============================================================= */
function atualizarVidaCalculada() {
    // 1. Soma os valores dos dados de vida salvos
    const somaDados = Object.values(state.vidaDadosSalvos || {}).reduce((acc, val) => acc + (parseInt(val) || 0), 0);
    
    // 2. Calcula o Modificador de Constituição (n1)
    // Se o atributo não existir, assume 10 (modificador 0)
    const conScore = state.atributos?.n1 || 10; 
    const modCon = Math.floor((parseInt(conScore) - 10) / 2);

    // 3. Calcula o Nível Total do Personagem (soma de todas as classes)
    const nivelTotal = Object.values(state.niveisClasses || {}).reduce((a, b) => a + (parseInt(b) || 0), 0);

    // 4. Cálculo Final: Soma dos Dados + (Modificador * Nível)
    let vidaMax = somaDados + (modCon * nivelTotal);

    // Segurança: Evita que a vida máxima seja 0 ou negativa (opcional, mas recomendado)
    if (vidaMax < 1) vidaMax = 1;
    
    // --- ATUALIZAÇÃO DO ESTADO E VISUAL ---
    
    // Salva o total calculado no estado para o Portrait ler
    state.vidaTotalCalculada = vidaMax; 
    
    const elVidaTotal = document.getElementById('vida-total');
    if (elVidaTotal) elVidaTotal.textContent = vidaMax;

    atualizarBarraUI('vida', state.vidaAtual, vidaMax);
    atualizarBarraUI('vida-temp', state.vidaTempAtual, 100);
    atualizarBarraUI('dano-necro', state.danoNecroAtual, 100);
}
function atualizarPassiva() {
    // 1. Verifica se as perícias existem no estado
    if (!state.pericias || !state.pericias["Percepção"]) {
        const el = document.getElementById('passivaValor');
        if (el) el.textContent = 10; // Valor base padrão sem nada
        return;
    }

    const dados = state.pericias["Percepção"];

    // 2. Descobre qual atributo a Percepção está usando (Geralmente Sabedoria/n3)
    // Mapeamento simples reverso baseada no seu sistema
    const mapAtributos = { "FOR": "n6", "DEX": "n2", "CON": "n1", "INT": "n5", "SAB": "n3", "CAR": "n4" };
    const attrKey = mapAtributos[dados.atributo] || "n3"; // Padrão n3 (Sabedoria)
    
    // 3. Calcula o Modificador do Atributo
    const atributoValor = parseInt(state.atributos[attrKey] || 10);
    const modAtributo = Math.floor((atributoValor - 10) / 2);

    // 4. Calcula Bônus de Proficiência (se treinado)
    let bonusProf = 0;
    if (dados.treinado) {
        const nivelTotal = Object.values(state.niveisClasses || {}).reduce((a, b) => a + (parseInt(b) || 0), 0) || 1;
        bonusProf = Math.floor((nivelTotal - 1) / 4) + 2;
    }

    // 5. Soma 'Outros' bônus manuais da perícia
    const outros = parseInt(dados.outros) || 0;

    // 6. Fórmula Final: 10 + Mod + Prof + Outros
    const valorPassiva = 10 + modAtributo + bonusProf + outros;

    // 7. Atualiza na tela
    const el = document.getElementById('passivaValor');
    if (el) el.textContent = valorPassiva;
}
// --- ADICIONE esta nova função em qualquer lugar do EsquerdaJS.js (pode ser no final) ---

window.abrirPortraitOBS = function() {
    if (!state.nome) {
        alert("Defina um nome para o personagem antes de abrir o Portrait.");
        return;
    }
    // Identificador único por personagem
    const windowId = "Portrait_" + state.nome.replace(/\s+/g, '_');
    const url = `portrait.html?nome=${encodeURIComponent(state.nome)}`;
    
    // Abre em nova guia ou janela independente
    window.open(url, windowId);
};
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

// ATUALIZAÇÃO DA INICIATIVA (AGORA CORRIGIDA)
function atualizarIniciativaTotal() {
    const dexScore = state.atributos?.n2 || 10;
    const dexMod = Math.floor((dexScore - 10) / 2);
    // Lê diretamente do estado, garantindo que seja número
    const bonus = parseInt(state.iniciativaBonus) || 0;

    const total = dexMod + bonus;
    const sinal = total >= 0 ? "+" : "";

    const elIni = document.getElementById('iniciativaValor');
    if (elIni) elIni.textContent = `${sinal}${total}`;
}

/* =============================================================
   CORREÇÃO DA LÓGICA DE CA - EsquerdaJS.js
   ============================================================= */
function atualizarAC() {
    // 1. Pega os modificadores dos atributos
    const getMod = (n) => Math.floor((parseInt(state.atributos?.[n] || 10) - 10) / 2);
    const modDex = getMod('n2');
    const modCon = getMod('n1');
    const modSab = getMod('n3');

    // 2. Localiza itens de proteção equipados
    const armadura = state.inventory.find(i => 
        i.equip && (i.type === 'Proteção' || i.type === 'protecao') && (i.tipoItem || '').toLowerCase() === 'armadura'
    );
    const escudo = state.inventory.find(i => 
        i.equip && (i.type === 'Proteção' || i.type === 'protecao') && (i.tipoItem || '').toLowerCase() === 'escudo'
    );

    // 3. Verifica habilidades de Defesa sem Armadura
    const barbDef = state.abilities.some(a => a.active && a.title.includes("Bárbaro"));
    const monkDef = state.abilities.some(a => a.active && a.title.includes("Monge"));

    let acTotal = 10;
    let visualEquip = 0; // Valor que vai para o slot "Equip"
    let visualDex = modDex;
    let visualDexText = "DEX";
    let tipoTag = "SEM ARMADURA";
    let usaBase10 = true; // Controla se o "10" da fórmula aparece

    let bonusEscudo = escudo ? (parseInt(escudo.defense) || 2) : 0;
    let bonusOutros = parseInt(state.acOutros) || 0;

    // Soma bônus de itens gerais (anéis, etc)
    state.inventory.filter(i => i.equip && i.type === 'Geral' && i.defenseBonus).forEach(item => {
        bonusOutros += (parseInt(item.defenseBonus) || 0);
    });

    if (armadura) {
        // --- CASO COM ARMADURA ---
        usaBase10 = false; // Armadura substitui o 10 base
        let valBase = parseInt(armadura.defense) || 10;
        if (valBase <= 10) valBase += 10; // Caso o usuário digite apenas o bônus (ex: 2 ao invés de 12)

        const prof = (armadura.proficiency || '').toLowerCase();
        
        // O "Equip" agora é o valor da Armadura + Escudo
        visualEquip = valBase + bonusEscudo;
        tipoTag = armadura.proficiency?.toUpperCase() || "ARMADURA";

        if (prof.includes('pesada')) {
            visualDex = 0;
            visualDexText = "-";
            acTotal = visualEquip + bonusOutros;
        } else if (prof.includes('media') || prof.includes('média')) {
            visualDex = Math.min(modDex, 2);
            visualDexText = "DEX (Máx 2)";
            acTotal = visualEquip + visualDex + bonusOutros;
        } else {
            visualDex = modDex;
            acTotal = visualEquip + visualDex + bonusOutros;
        }
    } else {
        // --- CASO SEM ARMADURA ---
        visualEquip = bonusEscudo;

        if (barbDef) {
            tipoTag = "DEF. BÁRBARO";
            visualDex = modDex + modCon;
            visualDexText = "DEX + CON";
            acTotal = 10 + visualDex + bonusEscudo + bonusOutros;
        } else if (monkDef && !escudo) {
            tipoTag = "DEF. MONGE";
            visualDex = modDex + modSab;
            visualDexText = "DEX + SAB";
            acTotal = 10 + visualDex + bonusOutros;
        } else {
            acTotal = 10 + modDex + bonusEscudo + bonusOutros;
        }
    }

    // --- ATUALIZAÇÃO VISUAL ---
    
    // 1. Valor total da CA
    const elValor = document.getElementById('armaduraValor');
    if (elValor) elValor.textContent = acTotal;

    // 2. Slots da fórmula (Equip e Outros)
    const zeroNums = document.querySelectorAll('.zero-pair .zero-num');
    if (zeroNums[0]) zeroNums[0].textContent = visualEquip;
    if (zeroNums[1]) zeroNums[1].textContent = bonusOutros;

    // 3. Texto do Atributo (DEX, DEX+CON, etc)
    const elFormulaAttr = document.querySelector('.formula-attr');
    if (elFormulaAttr) {
        elFormulaAttr.textContent = visualDexText;
        elFormulaAttr.style.visibility = (visualDexText === "-") ? "hidden" : "visible";
    }

    // 4. Lógica para esconder/mostrar o "10" na fórmula visual
    const baseTen = document.querySelector('.formula-text');
    if (baseTen) {
        // Se estiver usando armadura, adicionamos uma classe para "apagar" o 10 visualmente
        if (!usaBase10) baseTen.classList.add('heavy-armor-mode'); 
        else baseTen.classList.remove('heavy-armor-mode');
    }

    const elTag = document.querySelector('.armadura-tag');
    if (elTag) elTag.textContent = tipoTag;
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
    
    atualizarPassiva(); // <--- ADICIONE ESTA LINHA
    
    const nivelTotal = Object.values(state.niveisClasses || {}).reduce((a, b) => a + (parseInt(b) || 0), 0);
    const elNivel = document.getElementById('nivelFoco');
    if (elNivel) elNivel.textContent = nivelTotal;
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



