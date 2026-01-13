/* =============================================================
   HEADER: ANTECEDENTES, CLASSES E RAÇA
   (Suporte Completo a Automação de Perícias, Idiomas e Variantes)
============================================================= */

/* =============================================================
   1. CONSTANTES E LISTAS DE DADOS
============================================================= */

// Tipos de Criatura e Tamanhos
const CREATURE_TYPES = ['Humanoide', 'Construto', 'Fada', 'Dragão', 'Monstruosidade', 'Morto-vivo', 'Celestial', 'Corruptor', 'Elemental', 'Besta', 'Planta', 'Gigante', 'Limo', 'Aberração', 'Gosma'];
const CREATURE_SIZES = ['Minúsculo', 'Pequeno', 'Médio', 'Grande', 'Enorme', 'Imenso'];
const RACES_REQUIRED_SUBRACE = ['Eladrin','Anões','Elfos','Gnomos','Meio-Elfo','Pequeninos']; 

// Perícias
const ALL_SKILLS_LIST = [
    "Acrobacia", "Adestrar Animais", "Arcanismo", "Atletismo", "Atuação", 
    "Enganação", "Furtividade", "História", "Intimidação", "Intuição", 
    "Investigação", "Medicina", "Natureza", "Percepção", "Persuasão", 
    "Prestidigitação", "Religião", "Sobrevivência"
];

// Idiomas
const ALL_LANGUAGES_LIST = [
    'Comum', 'Anão', 'Élfico', 'Gigante', 'Gnômico', 'Goblin', 'Halfling', 'Orc',
    'Abissal', 'Celestial', 'Dialeto Subterrâneo', 'Dracônico', 'Infernal', 'Primordial',
    'Silvestre', 'Druídico'
];

// Listas de Itens Genéricos (Para os Dropdowns de Escolha)
const LISTA_ARMAS_SIMPLES = [
    "Adaga", "Azagaia", "Besta Leve", "Cajado", "Clava", "Dardo", 
    "Funda", "Foice Curta", "Lança", "Maça", "Machadinha", "Martelo Leve"
];

const LISTA_ARMAS_MARCIAIS = [
    "Alabarda", "Arco Longo", "Besta de Mão", "Besta Pesada", "Cimitarra", 
    "Chicote", "Espada Curta", "Espada Longa", "Espada Grande", 
    "Glaive", "Lança de Montaria", "Machado de Batalha", "Machado Grande", 
    "Malho", "Mangual", "Maça Estrela", "Martelo de Guerra", "Picareta de Guerra", 
    "Pique", "Rapieira", "Tridente", "Zarabatana"
];

const LISTA_INSTRUMENTOS = [
    "Alaúde", "Bateria", "Charamela", "Citara", "Flauta", "Flauta de Pã", 
    "Gaita de Foles", "Lira", "Tambor", "Trombeta", "Trompa", "Viola", "Violino", "Xilofone"
];

const LISTA_FERRAMENTAS_ARTESAO = [
    "Ferramentas de Alquimista", "Ferramentas de Carpinteiro", "Ferramentas de Cartógrafo", 
    "Ferramentas de Coureiro", "Ferramentas de Ferreiro", "Ferramentas de Joalheiro", 
    "Ferramentas de Ladrão", "Ferramentas de Navegador", "Ferramentas de Oleiro", 
    "Ferramentas de Pedreiro", "Ferramentas de Sapateiro", "Ferramentas de Tecelão", 
    "Ferramentas de Vidreiro", "Suprimentos de Cervejeiro", "Suprimentos de Calígrafo", 
    "Suprimentos de Pintor", "Utensílios de Cozinheiro"
];

const LISTA_JOGOS = ['Baralho', 'Dados', 'Xadrez do Dragão'];

// Lista completa para fallback
const ALL_TOOLS_LIST = [...LISTA_FERRAMENTAS_ARTESAO, ...LISTA_INSTRUMENTOS, ...LISTA_JOGOS, 'Ferramentas de Ladrão', 'Kit de Herborismo', 'Kit de Disfarce', 'Kit de Falsificação', 'Kit de Venenos', 'Ferramentas de Navegador'];


/* =============================================================
   DADOS DE HERANÇA DRACÔNICA
   ============================================================= */
const DRACONIC_ANCESTRIES = {
    "Draconatos": [ // Draconato Padrão (PHB)
        { label: "Azul", damage: "Elétrico", area: "Linha de 1,5m x 9m (Salvaguarda de Des)", type: "Azul" },
        { label: "Branco", damage: "Gélido", area: "Cone de 4,5m (Salvaguarda de Con)", type: "Branco" },
        { label: "Bronze", damage: "Elétrico", area: "Linha de 1,5m x 9m (Salvaguarda de Des)", type: "Bronze" },
        { label: "Cobre", damage: "Ácido", area: "Linha de 1,5m x 9m (Salvaguarda de Des)", type: "Cobre" },
        { label: "Latão", damage: "Ígneo", area: "Linha de 1,5m x 9m (Salvaguarda de Des)", type: "Latão" },
        { label: "Negro", damage: "Ácido", area: "Linha de 1,5m x 9m (Salvaguarda de Des)", type: "Negro" },
        { label: "Ouro", damage: "Ígneo", area: "Cone de 4,5m (Salvaguarda de Des)", type: "Ouro" },
        { label: "Prata", damage: "Gélido", area: "Cone de 4,5m (Salvaguarda de Con)", type: "Prata" },
        { label: "Verde", damage: "Venenoso", area: "Cone de 4,5m (Salvaguarda de Con)", type: "Verde" },
        { label: "Vermelho", damage: "Ígneo", area: "Cone de 4,5m (Salvaguarda de Des)", type: "Vermelho" }
    ],
    "Draconato Cromático": [ // Fizban's
        { label: "Azul", damage: "Elétrico", area: "Linha de 1,5m x 9m", type: "Cromático Azul" },
        { label: "Branco", damage: "Gélido", area: "Linha de 1,5m x 9m", type: "Cromático Branco" },
        { label: "Negro", damage: "Ácido", area: "Linha de 1,5m x 9m", type: "Cromático Negro" },
        { label: "Verde", damage: "Venenoso", area: "Linha de 1,5m x 9m", type: "Cromático Verde" },
        { label: "Vermelho", damage: "Ígneo", area: "Linha de 1,5m x 9m", type: "Cromático Vermelho" }
    ],
    "Draconato Metálico": [ // Fizban's (Todos são Cone)
        { label: "Bronze", damage: "Elétrico", area: "Cone de 4,5m", type: "Metálico Bronze" },
        { label: "Cobre", damage: "Ácido", area: "Cone de 4,5m", type: "Metálico Cobre" },
        { label: "Latão", damage: "Ígneo", area: "Cone de 4,5m", type: "Metálico Latão" },
        { label: "Ouro", damage: "Ígneo", area: "Cone de 4,5m", type: "Metálico Ouro" },
        { label: "Prata", damage: "Gélido", area: "Cone de 4,5m", type: "Metálico Prata" }
    ],
    "Draconato de Gema": [ // Fizban's (Todos são Cone)
        { label: "Ametista", damage: "Energético", area: "Cone de 4,5m", type: "Gema Ametista" },
        { label: "Cristal", damage: "Radiante", area: "Cone de 4,5m", type: "Gema Cristal" },
        { label: "Esmeralda", damage: "Psíquico", area: "Cone de 4,5m", type: "Gema Esmeralda" },
        { label: "Safira", damage: "Trovejante", area: "Cone de 4,5m", type: "Gema Safira" },
        { label: "Topázio", damage: "Necrótico", area: "Cone de 4,5m", type: "Gema Topázio" }
    ]
};

// Variáveis Globais
let RACES_DB = [];
let BACKGROUNDS_DB = [];
let CLASSES_DB = [];
let items = [];


/* =============================================================
   2. SISTEMA DE MODAIS E SELETORES
============================================================= */

// --- Seletor Genérico (Idiomas, Ferramentas, Itens Genéricos) ---
function openGenericSelector(title, count, options, onConfirmCallback) {
    const overlay = document.createElement('div');
    overlay.className = 'spell-modal-overlay race-modal-overlay';
    overlay.style.zIndex = '14000';

    // Identifica o que já possui para bloquear
    let alreadyKnown = [];
    if (title.includes("Idiomas")) alreadyKnown = state.idiomasList || [];
    else if (title.includes("Ferramentas") || title.includes("Instrumento")) alreadyKnown = state.proficienciasList || [];
    
    // Remove duplicatas e ordena
    const uniqueOptions = [...new Set(options)].sort();

    const checkboxesHtml = uniqueOptions.map(opt => {
        const isKnown = alreadyKnown.includes(opt);
        // Se já tem, desabilita e muda visual
        const styleLabel = isKnown ? "background:#222; border:1px solid #444; opacity:0.6;" : "background:#1a1a1a; border:1px solid #555; cursor:pointer;";
        return `
            <label style="display:flex; align-items:center; gap:10px; padding:8px; border-radius:4px; ${styleLabel}">
                <input type="checkbox" value="${opt}" ${isKnown ? 'checked disabled' : 'class="gen-check"'} style="accent-color:#9c27b0;">
                <span style="color:${isKnown ? '#888' : '#fff'};">${opt} ${isKnown ? '<small>(Já possui)</small>' : ''}</span>
            </label>
        `;
    }).join('');

    overlay.innerHTML = `
        <div class="spell-modal" style="width: 500px; height: 80vh; display:flex; flex-direction:column;">
            <div class="modal-header"><h3>${title}</h3></div>
            <div class="modal-body" style="padding: 15px; overflow-y: auto; flex:1;">
                <div style="font-size:14px; color:#e0aaff; margin-bottom:15px; text-align:center;">
                    Escolha <strong>${count}</strong> opção(ões).
                </div>
                <div style="display:grid; grid-template-columns: 1fr 1fr; gap:8px;">${checkboxesHtml}</div>
            </div>
            <div class="modal-actions">
                <button id="btn-confirm-gen" class="btn-add btn-save-modal" disabled style="background:#444;">Confirmar</button>
            </div>
        </div>
    `;

    document.body.appendChild(overlay);

    const btnConfirm = overlay.querySelector('#btn-confirm-gen');
    const checks = overlay.querySelectorAll('.gen-check');

    // Lógica de limite
    checks.forEach(chk => {
        chk.addEventListener('change', () => {
            const selectedCount = overlay.querySelectorAll('.gen-check:checked').length;
            if (selectedCount >= count) {
                checks.forEach(c => { if (!c.checked) c.disabled = true; }); // Bloqueia outros
                btnConfirm.removeAttribute('disabled');
                btnConfirm.style.background = '#9c27b0';
            } else {
                checks.forEach(c => c.disabled = false); // Libera
                btnConfirm.setAttribute('disabled', true);
                btnConfirm.style.background = '#444';
            }
        });
    });

    btnConfirm.onclick = () => {
        const selectedValues = Array.from(overlay.querySelectorAll('.gen-check:checked')).map(c => c.value);
        onConfirmCallback(selectedValues);
        overlay.remove();
        if(typeof checkScrollLock === 'function') checkScrollLock();
    };
}

// --- Seletor de Perícias (Específico para tratar o objeto state.pericias) ---
function openSkillSelector(count, sourceName, limitToList = null) {
    const overlay = document.createElement('div');
    overlay.className = 'spell-modal-overlay race-modal-overlay';
    overlay.style.zIndex = '14000';

    const options = limitToList || ALL_SKILLS_LIST;
    const uniqueOptions = [...new Set(options)].sort();
    if (!state.pericias) state.pericias = {};

    const checkboxesHtml = uniqueOptions.map(skill => {
        const jaTem = state.pericias[skill] && state.pericias[skill].treinado;
        
        const styleLabel = jaTem ? "background:#222; border:1px solid #444; opacity:0.6;" : "background:#1a1a1a; border:1px solid #555; cursor:pointer;";
        
        return `
            <label style="display:flex; align-items:center; gap:10px; padding:10px; border-radius:4px; ${styleLabel}">
                <input type="checkbox" value="${skill}" ${jaTem ? 'checked disabled' : 'class="skill-check"'} style="accent-color:#9c27b0; transform:scale(1.2);">
                <span style="color:${jaTem ? '#888' : '#fff'}; flex:1;">${skill}</span>
                ${jaTem ? '<span style="color:#e0aaff; font-size:10px;">(Treinado)</span>' : ''}
            </label>
        `;
    }).join('');

    overlay.innerHTML = `
        <div class="spell-modal" style="width: 550px; height: 80vh; display:flex; flex-direction:column;">
            <div class="modal-header"><h3>Bônus: ${sourceName}</h3></div>
            <div class="modal-body" style="padding: 15px; overflow-y: auto; flex:1;">
                <div style="font-size:14px; color:#e0aaff; margin-bottom:15px; text-align:center; background:#222; padding:10px; border-radius:4px;">
                    Selecione <strong>${count}</strong> perícia(s) adicional(is).<br>
                    <span id="skill-count-display" style="font-size:12px; color:#aaa;">0/${count}</span>
                </div>
                <div style="display:grid; grid-template-columns: 1fr 1fr; gap:10px;">${checkboxesHtml}</div>
            </div>
            <div class="modal-actions">
                <button id="btn-confirm-skills" class="btn-add btn-save-modal" disabled style="background:#444;">Confirmar</button>
            </div>
        </div>
    `;

    document.body.appendChild(overlay);

    const btnConfirm = overlay.querySelector('#btn-confirm-skills');
    const displayCount = overlay.querySelector('#skill-count-display');
    const checks = overlay.querySelectorAll('.skill-check');

    checks.forEach(chk => {
        chk.addEventListener('change', () => {
            const selected = overlay.querySelectorAll('.skill-check:checked').length;
            displayCount.textContent = `${selected}/${count}`;

            if (selected >= count) {
                checks.forEach(c => { if (!c.checked) c.disabled = true; });
                btnConfirm.removeAttribute('disabled');
                btnConfirm.style.background = '#9c27b0';
            } else {
                checks.forEach(c => c.disabled = false);
                btnConfirm.setAttribute('disabled', true);
                btnConfirm.style.background = '#444';
            }
        });
    });

    btnConfirm.onclick = () => {
        const selectedSkills = Array.from(overlay.querySelectorAll('.skill-check:checked')).map(c => c.value);
        selectedSkills.forEach(skill => {
            if (!state.pericias[skill]) state.pericias[skill] = { treinado: true, bonus: 0 };
            else state.pericias[skill].treinado = true;
        });
        saveStateToServer();
        window.dispatchEvent(new CustomEvent('sheet-updated'));
        overlay.remove();
        if(typeof checkScrollLock === 'function') checkScrollLock();
    };
}

// --- Seletor de Equipamento (Lado a Lado) ---
function openEquipmentChoiceModal(title, optionA, optionB, callback) {
    const overlay = document.createElement('div');
    overlay.className = 'spell-modal-overlay race-modal-overlay';
    overlay.style.zIndex = '15000';

    overlay.innerHTML = `
        <div class="spell-modal" style="width: 650px; height: auto;">
            <div class="modal-header"><h3>Equipamento Inicial</h3></div>
            <div class="modal-body" style="padding: 25px;">
                <p style="color:#e0aaff; margin-bottom:20px; text-align:center; font-size:16px;">${title}</p>
                <div style="display:flex; gap:20px; justify-content:center;">
                    <button class="equip-btn btn-add" style="flex:1; background:#1a1a1a; border:1px solid #444; padding:20px; text-align:left; display:flex; flex-direction:column; gap:5px; transition:0.2s;">
                        <strong style="color:#9c27b0; text-transform:uppercase; font-size:12px;">Opção A</strong>
                        <span style="color:#fff; font-size:14px; line-height:1.4;">${optionA}</span>
                    </button>
                    <div style="display:flex; align-items:center; color:#666; font-weight:bold;">OU</div>
                    <button class="equip-btn btn-add" style="flex:1; background:#1a1a1a; border:1px solid #444; padding:20px; text-align:left; display:flex; flex-direction:column; gap:5px; transition:0.2s;">
                        <strong style="color:#9c27b0; text-transform:uppercase; font-size:12px;">Opção B</strong>
                        <span style="color:#fff; font-size:14px; line-height:1.4;">${optionB}</span>
                    </button>
                </div>
            </div>
        </div>
    `;
    document.body.appendChild(overlay);

    const btns = overlay.querySelectorAll('.equip-btn');
    
    btns.forEach(btn => {
        btn.onmouseenter = () => btn.style.borderColor = '#9c27b0';
        btn.onmouseleave = () => btn.style.borderColor = '#444';
    });

    btns[0].onclick = () => { callback(optionA); overlay.remove(); };
    btns[1].onclick = () => { callback(optionB); overlay.remove(); };
}

/* =============================================================
   SELETOR DE PERÍCIAS (COM BLOQUEIO DE DUPLICATAS)
   ============================================================= */
function openSkillSelector(count, sourceName, limitToList = null) {
    // Remove modais anteriores para evitar sobreposição
    const existing = document.querySelectorAll('.race-modal-overlay');
    existing.forEach(e => e.remove());

    const overlay = document.createElement('div');
    overlay.className = 'spell-modal-overlay race-modal-overlay';
    overlay.style.zIndex = '14000';

    // Se nenhuma lista for passada (fallback), usa todas.
    const options = limitToList || ALL_SKILLS_LIST;
    
    // Filtra duplicatas na lista de origem e ordena alfabeticamente
    const uniqueOptions = [...new Set(options)].sort();

    // Garante que o objeto de perícias exista no estado
    if (!state.pericias) state.pericias = {};

    // Mapeia o HTML das opções
    const checkboxesHtml = uniqueOptions.map(skill => {
        // Verifica se a perícia JÁ está treinada (por Raça ou Antecedente)
        const jaTem = state.pericias[skill] && state.pericias[skill].treinado;

        // Se já tem, aparece visualmente diferente e desabilitado (checked)
        const styleLabel = jaTem 
            ? "background:#222; border:1px solid #444; opacity:0.6; cursor:default;" 
            : "background:#1a1a1a; border:1px solid #555; cursor:pointer;";
            
        const styleText = jaTem ? "color:#888;" : "color:#fff;";
        const tagJaTem = jaTem ? '<span style="font-size:10px; color:#e0aaff; float:right;">(Já possui)</span>' : '';

        return `
            <label style="display:block; padding:10px; border-radius:4px; ${styleLabel} user-select:none; transition:0.2s;">
                <div style="display:flex; align-items:center; gap:10px;">
                    <input type="checkbox" value="${skill}" ${jaTem ? 'checked disabled' : 'class="skill-check"'} style="transform:scale(1.2); accent-color:#9c27b0;">
                    <span style="${styleText} font-weight:bold; flex:1;">${skill}</span>
                    ${tagJaTem}
                </div>
            </label>
        `;
    }).join('');

    overlay.innerHTML = `
        <div class="spell-modal" style="width: 600px; height: 85vh; display:flex; flex-direction:column;">
            <div class="modal-header">
                <h3>${sourceName}</h3>
            </div>
            
            <div class="modal-body" style="padding: 0; overflow:hidden; flex:1; display:flex; flex-direction:column;">
                
                <div style="padding:15px; background:#111; border-bottom:1px solid #333; text-align:center;">
                    <p style="color:#ccc; margin:0; font-size:14px;">
                        Você deve escolher <strong style="color:#e0aaff; font-size:16px;">${count}</strong> nova(s) perícia(s).
                    </p>
                    <div id="skill-counter-text" style="font-size:12px; color:#777; margin-top:5px;">
                        0 selecionadas
                    </div>
                </div>

                <div style="flex:1; overflow-y:auto; padding:15px;">
                    <div style="display:grid; grid-template-columns: 1fr 1fr; gap:10px;">
                        ${checkboxesHtml}
                    </div>
                </div>
            </div>

            <div class="modal-actions" style="padding:15px; border-top:1px solid #333; background:#000;">
                <button id="btn-confirm-skills" class="btn-add btn-save-modal" disabled style="background:#444; width:100%; padding:12px; font-size:16px;">Confirmar Escolhas</button>
            </div>
        </div>
    `;

    document.body.appendChild(overlay);

    const btnConfirm = overlay.querySelector('#btn-confirm-skills');
    const counterText = overlay.querySelector('#skill-counter-text');
    
    // Seleciona apenas os checkboxes que NÃO estão desabilitados (os que o usuário pode clicar)
    const activeChecks = overlay.querySelectorAll('.skill-check');

    // Função para atualizar o estado dos checkboxes e botão
    const updateState = () => {
        const selectedCount = overlay.querySelectorAll('.skill-check:checked').length;
        
        counterText.textContent = `${selectedCount} de ${count} selecionadas`;

        if (selectedCount >= count) {
            // Atingiu o limite: Habilita botão, desabilita os não marcados
            btnConfirm.removeAttribute('disabled');
            btnConfirm.style.background = '#9c27b0';
            btnConfirm.style.color = '#fff';
            
            activeChecks.forEach(c => {
                if (!c.checked) {
                    c.disabled = true;
                    c.parentElement.parentElement.style.opacity = '0.5';
                }
            });
        } else {
            // Abaixo do limite: Desabilita botão, habilita todos
            btnConfirm.setAttribute('disabled', true);
            btnConfirm.style.background = '#333';
            btnConfirm.style.color = '#777';

            activeChecks.forEach(c => {
                c.disabled = false;
                c.parentElement.parentElement.style.opacity = '1';
            });
        }
    };

    // Adiciona evento a cada checkbox disponível
    activeChecks.forEach(chk => {
        chk.addEventListener('change', updateState);
    });

    // Ação do Botão Confirmar
    btnConfirm.onclick = () => {
        const selectedSkills = Array.from(overlay.querySelectorAll('.skill-check:checked')).map(c => c.value);
        
        selectedSkills.forEach(skill => {
            if (!state.pericias[skill]) {
                state.pericias[skill] = { treinado: true, bonus: 0 };
            } else {
                state.pericias[skill].treinado = true;
            }
        });

        if (typeof saveStateToServer === 'function') saveStateToServer();
        window.dispatchEvent(new CustomEvent('sheet-updated'));
        
        overlay.remove();
        if(typeof checkScrollLock === 'function') checkScrollLock();
    };
}


// --- CONFIGURAÇÃO DA API ---
var BASE_API_URL = (typeof API_URL !== 'undefined') ? API_URL : 'http://localhost:3000/api';




// --- CARREGAMENTO DOS JSONs ---
async function carregarDadosHeader() {
    try {
        // Carrega Raças
        const raceRes = await fetch(`${BASE_API_URL}/catalog/races_db`); 
        if (raceRes.ok) RACES_DB = await raceRes.json();

        // Carrega Antecedentes
        const bgRes = await fetch(`${BASE_API_URL}/catalog/backgrounds_db`);
        if (bgRes.ok) BACKGROUNDS_DB = await bgRes.json();

        // --- NOVO: Carregar Classes ---
        const classRes = await fetch(`${BASE_API_URL}/catalog/classes_db`); // <--- Certifique-se que essa rota existe ou aponte para o arquivo JSON local
        if (classRes.ok) {
            CLASSES_DB = await classRes.json();
        } else {
             // Fallback local se a API falhar
             try {
                const classLocal = await fetch('backend/data/classes_db.json');
                if(classLocal.ok) CLASSES_DB = await classLocal.json();
             } catch(e) {}
        }

        // Carrega Itens
        const itemRes = await fetch(`${BASE_API_URL}/catalog/items`);
        if (itemRes.ok) items = await itemRes.json();

    } catch (e) {
        console.warn("Erro ao carregar dados:", e);
    }
}
carregarDadosHeader();

function autoResize(el) {
    if (!el) return;
    el.style.height = 'auto';
    el.style.height = el.scrollHeight + 'px';
}

/* -------------------------------------------------------------
   1. ATUALIZAÇÃO DO HEADER
   ------------------------------------------------------------- */
function atualizarHeader() {
    if (typeof state === 'undefined') return;

    // Antecedente
    const btnAntecedente = document.getElementById('btn-antecedente');
    if (btnAntecedente) btnAntecedente.textContent = state.antecedente || "Escolher...";

    // Raça
    const inputRaca = document.getElementById('input-raca');
    if (inputRaca) {
        let displayRace = state.raca || "";
        if (state.subRaca && !displayRace.includes(state.subRaca)) {
            displayRace += ` (${state.subRaca})`;
        }
        if (inputRaca.value !== displayRace) {
            inputRaca.value = displayRace;
        }
        autoResize(inputRaca);
    }

    if (typeof atualizarTextoClassesHeader === 'function') atualizarTextoClassesHeader();
}

function atualizarTextoClassesHeader() {
    const el = document.getElementById('input-classesHeader');
    if (!el) return;
    
    if (!state.niveisClasses || Object.keys(state.niveisClasses).length === 0) {
        el.value = "";
        autoResize(el);
        return;
    }

    const mapNomes = { 
        'artifice': 'Artífice', 'barbaro': 'Bárbaro', 'bardo': 'Bardo', 
        'blood hunter': 'Blood Hunter', 'bruxo': 'Bruxo', 'clerigo': 'Clérigo', 
        'druida': 'Druida', 'feiticeiro': 'Feiticeiro', 'guerreiro': 'Guerreiro', 
        'ladino': 'Ladino', 'mago': 'Mago', 'monge': 'Monge', 
        'paladino': 'Paladino', 'patrulheiro': 'Patrulheiro' 
    };

    let partes = [];
    Object.keys(state.niveisClasses).forEach(key => {
        const nivel = parseInt(state.niveisClasses[key]);
        if (!isNaN(nivel) && nivel > 0) {
            let nomeDisplay = mapNomes[key] || key.charAt(0).toUpperCase() + key.slice(1);
            
            // Verifica se tem subclasse salva no novo formato
            if (state.subclasses && state.subclasses[key]) {
                 nomeDisplay += ` (${state.subclasses[key]})`;
            } 
            // Fallback para o sistema antigo de busca em abilities se não tiver no state.subclasses
            else if (state.abilities && state.abilities.length > 0) {
                const norm = str => str.normalize("NFD").replace(/[\u0300-\u036f]/g, "").toLowerCase().trim();
                const habilidadeSubclasse = state.abilities.find(a => 
                    a.category === 'Subclasse' && norm(a.class) === norm(nomeDisplay)
                );
                if (habilidadeSubclasse) nomeDisplay += ` [${habilidadeSubclasse.subclass}]`;
            }
            
            partes.push(`${nomeDisplay} ${nivel}`);
        }
    });

    const novoTexto = partes.join(' / ');
    if (el.value !== novoTexto) { el.value = novoTexto; autoResize(el); }
}

window.addEventListener('sheet-updated', atualizarHeader);

document.addEventListener('DOMContentLoaded', () => {
    const elRaca = document.getElementById('input-raca');
    if (elRaca) {
        elRaca.setAttribute('readonly', true);
        elRaca.style.cursor = 'pointer';
        elRaca.addEventListener('click', openRaceSelectionModal);
    }
    
    // Novo modal de antecedentes
    const btnAnt = document.getElementById('btn-antecedente');
    if(btnAnt) btnAnt.addEventListener('click', openBackgroundSelectionModal);
const elClasses = document.getElementById('input-classesHeader');
    if (elClasses) {
        // Remove readonly visualmente mudando o cursor
        elClasses.style.cursor = 'pointer'; 
        
        // Remove event listeners antigos clonando o elemento (truque rápido)
        // Ou garanta que o código antigo não rode.
        // Adiciona o novo evento:
        elClasses.addEventListener('click', openClassSelectionModal);
    }
});





/* =============================================================
   SISTEMA DE ESCOLHA DE EQUIPAMENTO (MODAL)
   ============================================================= */
function openEquipmentSelector(title, optionA, optionB, callback) {
    const overlay = document.createElement('div');
    overlay.className = 'spell-modal-overlay race-modal-overlay';
    overlay.style.zIndex = '15000'; // Por cima de tudo

    overlay.innerHTML = `
        <div class="spell-modal" style="width: 400px; height: auto;">
            <div class="modal-header">
                <h3>Escolha de Equipamento</h3>
            </div>
            <div class="modal-body" style="padding: 20px; text-align:center;">
                <p style="color:#ccc; margin-bottom:15px;">${title}</p>
                <div style="display:flex; gap:10px; justify-content:center;">
                    <button class="btn-equip-opt btn-add" style="background:#333; border:1px solid #555; flex:1;">${optionA}</button>
                    <button class="btn-equip-opt btn-add" style="background:#333; border:1px solid #555; flex:1;">${optionB}</button>
                </div>
            </div>
        </div>
    `;

    document.body.appendChild(overlay);

    const buttons = overlay.querySelectorAll('.btn-equip-opt');
    
    buttons[0].onclick = () => {
        callback(optionA);
        overlay.remove();
    };

    buttons[1].onclick = () => {
        callback(optionB);
        overlay.remove();
    };
}

// Função para processar a lista de strings de equipamento
function processarEquipamentoInicial(equipList) {
    if (!equipList || equipList.length === 0) return;

    // Fila de processamento para lidar com múltiplos popups sequenciais
    let queue = [...equipList];

    function processNext() {
        if (queue.length === 0) {
            window.dispatchEvent(new CustomEvent('sheet-updated'));
            return;
        }

        const itemStr = queue.shift();

        // Regex para detectar padrão "(a) Opção A ou (b) Opção B"
        // Adapte conforme o texto exato do seu JSON
        const choiceRegex = /\(a\)\s*(.*?)\s+ou\s+\(b\)\s*(.*)/i;
        const match = itemStr.match(choiceRegex);

        if (match) {
            // É uma escolha
            const optA = match[1].trim();
            const optB = match[2].trim();
            
            openEquipmentSelector("Selecione uma opção:", optA, optB, (choice) => {
                adicionarItemAoInventario(choice);
                processNext();
            });
        } else {
            // É um item direto
            adicionarItemAoInventario(itemStr);
            processNext();
        }
    }

    processNext();
}

function adicionarItemAoInventario(nomeItem) {
    if (!state.inventory) state.inventory = [];
    
    // Tenta buscar no banco de dados de itens (função que já criamos antes)
    const itemDb = buscarItemNoBanco(nomeItem); 
    
    if (itemDb) {
        state.inventory.push(itemDb);
    } else {
        // Item genérico se não achar no banco
        state.inventory.push({
            id: Date.now() + Math.floor(Math.random() * 1000),
            name: nomeItem.replace(/^(um|uma|os|as)\s+/i, ''), // Remove artigos
            type: "Geral",
            quantity: 1,
            weight: 0
        });
    }
}
/* =============================================================
   SISTEMA DE ANTECEDENTES (ATUALIZADO COM VARIANTES E AUTOMAÇÃO)
   ============================================================= */
function openBackgroundSelectionModal() {
    if (BACKGROUNDS_DB.length === 0) {
        carregarDadosHeader().then(() => {
             if(BACKGROUNDS_DB.length > 0) openBackgroundSelectionModal();
             else alert("Erro: Banco de antecedentes vazio.");
        });
        return;
    }

    const existing = document.querySelector('.race-modal-overlay');
    if (existing) existing.remove();

    const listHtml = BACKGROUNDS_DB.map(bg => 
        `<div class="race-list-item" data-name="${bg.name}">${bg.name}</div>`
    ).join('');

    const overlay = document.createElement('div');
    overlay.className = 'spell-modal-overlay race-modal-overlay';
    overlay.style.zIndex = '12000';

    overlay.innerHTML = `
        <div class="spell-modal" style="width: 850px; height: 650px; max-height: 95vh;">
            <div class="modal-header">
                <h3>Escolher Antecedente</h3>
                <button class="modal-close">✖</button>
            </div>
            
            <div class="modal-body" style="padding: 0; overflow: hidden; display:flex; flex-direction:column; flex:1;">
                <div class="race-catalog-container" style="flex:1; overflow:hidden;">
                    <div class="race-list-col">
                        ${listHtml}
                    </div>

                    <div class="race-details-col" id="bg-details-content">
                        <div style="color: #666; text-align: center; margin-top: 50px;">
                            Selecione um antecedente para ver os detalhes.
                        </div>
                    </div>
                </div>
            </div>

            <div class="modal-actions">
                <button id="btn-select-bg" class="btn-add btn-save-modal" disabled>Selecionar</button>
            </div>
        </div>
    `;

    document.body.appendChild(overlay);
    if(typeof checkScrollLock === 'function') checkScrollLock();

    let selectedBgBase = null;
    let selectedBgVariant = null;

    const btnSelect = overlay.querySelector('#btn-select-bg');
    const detailsContainer = overlay.querySelector('#bg-details-content');

    overlay.querySelector('.modal-close').onclick = () => { overlay.remove(); checkScrollLock(); };

    const items = overlay.querySelectorAll('.race-list-item');
    items.forEach(item => {
        item.onclick = () => {
            items.forEach(i => i.classList.remove('selected'));
            item.classList.add('selected');

            const bgName = item.getAttribute('data-name');
            selectedBgBase = BACKGROUNDS_DB.find(b => b.name === bgName);
            selectedBgVariant = null; 

            renderBgDetails(selectedBgBase);
        };
    });

    btnSelect.onclick = () => {
        if(selectedBgBase) {
            aplicarAntecedenteNaFicha(selectedBgBase, selectedBgVariant);
            overlay.remove();
            checkScrollLock();
        }
    };

   function renderBgDetails(bg) {
        if (!bg) return;

        const hasVariants = bg.variants && bg.variants.length > 0;
        let currentVariant = null; 

        btnSelect.removeAttribute('disabled');
        btnSelect.textContent = `Selecionar ${bg.name}`; 
        btnSelect.style.background = '#9c27b0';

        const imagePath = bg.image || 'img/dado.png';

        const skillsHtml = bg.skills ? bg.skills.join(', ') : '-';
        const toolsHtml = bg.tools && bg.tools.length ? bg.tools.join(', ') : '-';
        const equipsHtml = bg.equipment ? bg.equipment.join(', ') : '-';
        
        let langs = '-';
        if (bg.languages) {
            if (Number.isInteger(bg.languages)) langs = `${bg.languages} a sua escolha`;
            else if (Array.isArray(bg.languages)) langs = bg.languages.join(', ');
        }

        let variantsHtml = '';
        if (hasVariants) {
            variantsHtml = `
                <div class="race-traits-title" style="margin-top:25px; color:#ffeb3b; border-top:1px solid #333; padding-top:15px;">
                    Variantes (Opcional)
                </div>
                <div style="font-size:12px; color:#888; margin-bottom:10px;">
                    Você pode selecionar uma variante abaixo para modificar seu antecedente, ou manter o padrão.
                </div>
                <div class="variations-list">
                    ${bg.variants.map((v, idx) => `
                        <div class="variation-card-wrapper">
                            <div class="variation-header" data-idx="${idx}">
                                <div style="display:flex; align-items:center; gap:10px; flex:1;">
                                    <input type="radio" name="bg_variant" value="${idx}" id="bg_var_${idx}" data-checked="false">
                                    <span class="variation-name">${v.name}</span>
                                </div>
                                <span class="variation-arrow">▼</span>
                            </div>
                            
                            <div class="variation-body">
                                ${v.description ? `<div class="variation-desc-text">${v.description}</div>` : ''}
                                ${v.feature ? `
                                    <div class="variation-feature-box">
                                        <div class="variation-feature-title">★ ${v.feature.name}</div>
                                        <div class="variation-feature-content">${v.feature.desc}</div>
                                    </div>` : ''}
                                ${v.equipment ? `
                                    <div style="margin-top:10px; font-size:12px; color:#aaa; border-top:1px dashed #333; padding-top:5px;">
                                        <strong style="color:#e0aaff;">Equipamento Alternativo:</strong> ${v.equipment.join(', ')}
                                    </div>` : ''}
                            </div>
                        </div>
                    `).join('')}
                </div>
            `;
        }

        detailsContainer.innerHTML = `
            <div class="race-detail-header">
                <div class="race-img-container" onclick="window.openImageLightbox('${imagePath}')" title="Clique para ampliar">
                    <img src="${imagePath}" class="race-img-display" onerror="this.src='img/dado.png'">
                </div>
                <div class="race-title-box">
                    <h2>${bg.name}</h2>
                    <div class="race-desc" style="margin-top:5px;">${bg.description}</div>
                </div>
            </div>
            
            <div class="race-traits-title" style="margin-top:15px;">Proficiências & Equipamento Base</div>
            <div style="font-size:13px; color:#ccc; line-height:1.6; background:#111; padding:10px; border-radius:6px; border:1px solid #333;">
                <div><strong style="color:#e0aaff;">Perícias:</strong> ${skillsHtml}</div>
                <div><strong style="color:#e0aaff;">Ferramentas:</strong> ${toolsHtml}</div>
                <div><strong style="color:#e0aaff;">Idiomas:</strong> ${langs}</div>
                <div style="margin-top:6px; padding-top:6px; border-top:1px solid #333;">
                    <strong style="color:#e0aaff;">Equipamento:</strong> ${equipsHtml}
                </div>
            </div>

            <div class="race-traits-title" style="margin-top:20px;">Habilidade Principal: ${bg.feature.name}</div>
            <div class="race-trait-item">
                <div class="race-trait-desc" style="font-size:13px; color:#ddd;">${bg.feature.desc}</div>
            </div>

            ${variantsHtml}
        `;

        btnSelect.onclick = () => {
            aplicarAntecedenteNaFicha(bg, currentVariant);
            const overlay = document.querySelector('.race-modal-overlay');
            if(overlay) overlay.remove();
            if(typeof checkScrollLock === 'function') checkScrollLock();
        };

        if (hasVariants) {
            const allRadios = detailsContainer.querySelectorAll('input[name="bg_variant"]');

            detailsContainer.querySelectorAll('.variation-header').forEach(header => {
                header.addEventListener('click', (e) => {
                    if (e.target.type === 'radio') return;
                    header.closest('.variation-card-wrapper').classList.toggle('open');
                });
            });

            allRadios.forEach(radio => {
                radio.addEventListener('click', (e) => {
                    const idx = parseInt(radio.value);
                    const isAlreadyChecked = radio.getAttribute('data-checked') === 'true';

                    allRadios.forEach(r => r.setAttribute('data-checked', 'false'));

                    if (isAlreadyChecked) {
                        radio.checked = false;
                        radio.setAttribute('data-checked', 'false');
                        currentVariant = null; 
                        btnSelect.textContent = `Selecionar ${bg.name}`;
                    } else {
                        radio.checked = true;
                        radio.setAttribute('data-checked', 'true');
                        currentVariant = bg.variants[idx];
                        btnSelect.textContent = `Selecionar ${currentVariant.name}`;
                        detailsContainer.querySelectorAll('.variation-card-wrapper').forEach(c => c.classList.remove('open'));
                        radio.closest('.variation-card-wrapper').classList.add('open');
                    }
                });
            });
        }
    }
}

/* -------------------------------------------------------------
   APLICAR ANTECEDENTE NA FICHA (COM DINHEIRO, MECÂNICAS E ITENS DO BD)
   ------------------------------------------------------------- */
function aplicarAntecedenteNaFicha(bgBase, bgVariant) {
    if (typeof state === 'undefined') return;

    const nomeFinal = bgVariant ? `${bgBase.name} (${bgVariant.name})` : bgBase.name;
    state.antecedente = nomeFinal;

    const featureData = (bgVariant && bgVariant.feature) ? bgVariant.feature : bgBase.feature;
    const equipData = (bgVariant && bgVariant.equipment) ? bgVariant.equipment : bgBase.equipment;

    // 1. Adicionar Habilidade
    if (!state.abilities) state.abilities = [];
    state.abilities = state.abilities.filter(a => a.category !== 'Antecedente');

    state.abilities.unshift({
        id: Date.now(),
        title: featureData.name,
        description: featureData.desc,
        expanded: false,
        active: true,
        category: 'Antecedente',
        class: '',
        subclass: nomeFinal
    });

    // 2. Adicionar Itens e Dinheiro
    if (equipData) {
        if (!state.inventory) state.inventory = [];
        if (!state.money) state.money = { pc:0, pp:0, pd:0, po:0, pl:0 };

        equipData.forEach(itemStr => {
            // A. Tenta detectar dinheiro
            const moneyRegex = /^(\d+)\s*(PO|PP|PC|PL|PD|po|pp|pc|pl|pd)/i;
            const match = itemStr.match(moneyRegex);

            if (match) {
                const qtd = parseInt(match[1]);
                const tipo = match[2].toLowerCase();
                if (state.money[tipo] !== undefined) {
                    state.money[tipo] += qtd;
                }
            } else {
                // B. Tenta buscar o item no banco de dados (ITEMS_DB)
                const itemDoBanco = buscarItemNoBanco(itemStr);

                if (itemDoBanco) {
                    // Achou! Adiciona o objeto completo do banco
                    state.inventory.push(itemDoBanco);
                } else {
                    // Não achou (ex: "Um troféu de caça", "Item de admirador")
                    // Adiciona como item genérico
                    state.inventory.push({
                        id: Date.now() + Math.floor(Math.random() * 100000),
                        name: itemStr,
                        type: "Geral",
                        description: "Item de Antecedente",
                        expanded: false,
                        equip: false,
                        weight: 0,
                        quantity: 1
                    });
                }
            }
        });
    }

    // --- 3. PROCESSAMENTO DE MECÂNICAS (AUTOMÁTICO + POPUPS) ---
    let mecanicas = { name: nomeFinal };

    if (Number.isInteger(bgBase.languages) && bgBase.languages > 0) {
        mecanicas.chooseLanguages = bgBase.languages;
    } else if (Array.isArray(bgBase.languages)) {
        mecanicas.languages = bgBase.languages;
    }

    if (bgBase.skills) {
        mecanicas.skills = bgBase.skills;
    }

    if (bgBase.tools) {
        let toolsFixed = [];
        let toolChoices = []; 

        bgBase.tools.forEach(t => {
            const tLower = t.toLowerCase();

            if (tLower.includes("instrumento musical")) {
                toolChoices.push({ count: 1, list: LISTA_INSTRUMENTOS, title: "Instrumento Musical" });
            } 
            else if (tLower.includes("jogo") || tLower.includes("jogos")) {
                toolChoices.push({ count: 1, list: LISTA_JOGOS, title: "Conjunto de Jogo" });
            } 
            else if (tLower.includes("artesão") || tLower.includes("artesao")) {
                toolChoices.push({ count: 1, list: LISTA_ARTESAO, title: "Ferramentas de Artesão" });
            } 
            else {
                // Tenta achar a ferramenta específica no banco de itens também?
                // Opcional, mas geralmente ferramentas em 'tools' são proficiências, não itens físicos.
                // Aqui tratamos como proficiência.
                toolsFixed.push(t);
            }
        });

        mecanicas.proficiencies = toolsFixed;
        if (toolChoices.length > 0) {
             mecanicas.chooseToolFromList = toolChoices;
        }
    }

    processarMecanicas(mecanicas);

    atualizarHeader();
    if (typeof saveStateToServer === 'function') saveStateToServer();
    window.dispatchEvent(new CustomEvent('sheet-updated'));
}
/* =============================================================
   PROCESSADOR DE MECÂNICAS GENÉRICO (RAÇA E ANTECEDENTE)
   ============================================================= */
function processarMecanicas(...sources) {
    // Arrays acumuladores
    let resToAdd = [];
    let imuToAdd = [];
    let profToAdd = [];
    let langToAdd = [];
    let skillsToTrain = [];

    // Filas de Escolha (Popups)
    let pendingChoices = [];

    // Função interna para ler cada fonte de dados
    const lerDados = (obj) => {
        if (!obj) return;
        
        if (Array.isArray(obj.resistances)) resToAdd.push(...obj.resistances);
        if (Array.isArray(obj.immunities)) imuToAdd.push(...obj.immunities);
        if (Array.isArray(obj.proficiencies)) profToAdd.push(...obj.proficiencies);
        if (Array.isArray(obj.languages)) langToAdd.push(...obj.languages);
        if (Array.isArray(obj.skills)) skillsToTrain.push(...obj.skills);

        const sourceTitle = obj.name || "";

        // Verifica Pedidos de Escolha
        if (obj.chooseSkills) pendingChoices.push({ type: 'skill', count: obj.chooseSkills, list: ALL_SKILLS_LIST, source: sourceTitle });
        if (obj.chooseSkillFrom && obj.countSkills) pendingChoices.push({ type: 'skill', count: obj.countSkills, list: obj.chooseSkillFrom, source: sourceTitle });
        
        if (obj.chooseLanguages) pendingChoices.push({ type: 'language', count: obj.chooseLanguages, list: ALL_LANGUAGES_LIST, source: sourceTitle });
        
        // Ferramentas Específicas (Raças)
        if (obj.chooseTools) pendingChoices.push({ type: 'tool', count: 1, list: obj.chooseTools, source: sourceTitle, customTitle: "Escolha uma Ferramenta" });
        if (obj.chooseToolAny) pendingChoices.push({ type: 'tool', count: obj.chooseToolAny, list: ALL_TOOLS_LIST, source: sourceTitle, customTitle: "Escolha Ferramentas" });
        if (obj.chooseToolFrom) pendingChoices.push({ type: 'tool', count: 1, list: obj.chooseToolFrom, source: sourceTitle, customTitle: "Escolha uma Ferramenta" });

        // Ferramentas por Categoria (Antecedentes) - Novo sistema
        if (obj.chooseToolFromList) {
            // Pode ser um objeto único ou array de objetos (caso precise escolher instrumento E jogo)
            const listArr = Array.isArray(obj.chooseToolFromList) ? obj.chooseToolFromList : [obj.chooseToolFromList];
            
            listArr.forEach(req => {
                pendingChoices.push({ 
                    type: 'tool', 
                    count: req.count, 
                    list: req.list, 
                    source: sourceTitle,
                    customTitle: `Escolha: ${req.title}`
                });
            });
        }
    };

    // Itera sobre todos os argumentos passados
    sources.forEach(source => {
        // Se for um objeto de herança dracônica
        if (source && source.damage && source.type) {
             const damageClean = source.damage.split('(')[0].trim();
             resToAdd.push(damageClean);
        } else {
             lerDados(source);
        }
    });

    // --- APLICAÇÃO NO ESTADO ---
    const addUnique = (targetList, items) => {
        if (!state[targetList]) state[targetList] = [];
        items.forEach(i => {
            if (!state[targetList].includes(i)) state[targetList].push(i);
        });
    };

    addUnique('resistenciasList', resToAdd);
    addUnique('imunidadesList', imuToAdd);
    addUnique('proficienciasList', profToAdd);
    addUnique('idiomasList', langToAdd);

    if (skillsToTrain.length > 0) {
        if (!state.pericias) state.pericias = {}; 
        skillsToTrain.forEach(skill => {
            if (state.pericias[skill]) state.pericias[skill].treinado = true;
        });
    }

    saveStateToServer();

    // --- EXECUÇÃO DE POPUPS ---
    const runNextChoice = () => {
        if (pendingChoices.length === 0) {
            window.dispatchEvent(new CustomEvent('sheet-updated')); 
            return;
        }

        const choice = pendingChoices.shift(); 
        // Se tiver customTitle usa ele, senão monta padrão
        const modalTitle = choice.customTitle 
            ? `${choice.customTitle} (${choice.source})`
            : `Escolha ${choice.type === 'language' ? 'Idiomas' : (choice.type === 'skill' ? 'Perícias' : 'Ferramentas')} (${choice.source})`;
        
        if (choice.type === 'skill') {
            openGenericSelector(modalTitle, choice.count, choice.list, (selected) => {
                if (!state.pericias) state.pericias = {};
                selected.forEach(s => { if(state.pericias[s]) state.pericias[s].treinado = true; });
                saveStateToServer();
                runNextChoice();
            });
        } 
        else if (choice.type === 'language') {
            openGenericSelector(modalTitle, choice.count, choice.list, (selected) => {
                addUnique('idiomasList', selected);
                saveStateToServer();
                runNextChoice();
            });
        }
        else if (choice.type === 'tool') {
             openGenericSelector(modalTitle, choice.count, choice.list, (selected) => {
                addUnique('proficienciasList', selected);
                saveStateToServer();
                runNextChoice();
            });
        }
    };

    setTimeout(runNextChoice, 300);
}

/* =============================================================
   SISTEMA DE RAÇAS (ANTIGO MANTIDO)
   ============================================================= */

function openRaceSelectionModal() {
    if (RACES_DB.length === 0) {
        carregarDadosHeader().then(() => {
             if(RACES_DB.length > 0) openRaceSelectionModal();
             else alert("Erro: Banco de raças vazio.");
        });
        return;
    }

    const existing = document.querySelector('.race-modal-overlay');
    if (existing) existing.remove();

    const racasComuns = RACES_DB.filter(r => !r.isLineage);
    const linhagens = RACES_DB.filter(r => r.isLineage);

    const gerarListaHTML = (lista) => lista.map(r => 
        `<div class="race-list-item" data-name="${r.name}">${r.name}</div>`
    ).join('');

    const overlay = document.createElement('div');
    overlay.className = 'spell-modal-overlay race-modal-overlay';
    overlay.style.zIndex = '12000';

    overlay.innerHTML = `
        <div class="spell-modal" style="width: 850px; height: 650px; max-height: 95vh;">
            <div class="modal-header">
                <h3>Escolher Raça</h3>
                <div style="display:flex; gap:10px;">
                    <button id="btn-custom-race" class="btn-add" style="background: #222; border: 1px solid #444;">Customizada +</button>
                    <button class="modal-close">✖</button>
                </div>
            </div>
            
            <div class="modal-body" style="padding: 0; overflow: hidden; display:flex; flex-direction:column; flex:1;">
                <div class="race-catalog-container" style="flex:1; overflow:hidden;">
                    
                    <div class="race-list-col">
                        <div class="race-list-header" style="padding:10px; color:#9c27b0; font-weight:bold; font-size:12px; border-bottom:1px solid #333;">RAÇAS</div>
                        ${gerarListaHTML(racasComuns)}
                        ${linhagens.length > 0 ? `<div class="race-list-header" style="padding:10px; color:#e0aaff; font-weight:bold; font-size:12px; border-bottom:1px solid #333; margin-top:10px; border-top:1px solid #333;">LINHAGENS</div>${gerarListaHTML(linhagens)}` : ''}
                    </div>

                    <div class="race-details-col" id="race-details-content">
                        <div style="color: #666; text-align: center; margin-top: 50px;">Selecione uma opção ao lado.</div>
                    </div>
                </div>
            </div>

            <div class="modal-actions">
                <button id="btn-select-race" class="btn-add btn-save-modal" disabled>Selecionar</button>
            </div>
        </div>
    `;

    document.body.appendChild(overlay);
    if(typeof checkScrollLock === 'function') checkScrollLock();

    let selectedRaceBase = null;
    let selectedVariation = null; 

    const btnSelect = overlay.querySelector('#btn-select-race');
    const detailsContainer = overlay.querySelector('#race-details-content');

    overlay.querySelector('.modal-close').onclick = () => { overlay.remove(); checkScrollLock(); };
    overlay.querySelector('#btn-custom-race').onclick = () => { overlay.remove(); openCustomRaceCreator(); };

    btnSelect.onclick = () => {
        if(selectedRaceBase) {
            if (selectedRaceBase.isLineage) {
                overlay.remove();
                openAncestralRaceSelector(selectedRaceBase); 
            } else {
                // VERIFICA SE É DRACONATO (Standard, Cromático, Metálico ou Gema)
                if (DRACONIC_ANCESTRIES[selectedRaceBase.name]) {
                    // Abre o seletor de cor, passando a sub-raça escolhida (se houver)
                    openDraconicSelector(selectedRaceBase, selectedVariation, null);
                } else {
                    // Raça normal
                    aplicarRacaNaFicha(selectedRaceBase, selectedVariation, null);
                    overlay.remove();
                    checkScrollLock();
                }
            }
        }
    };

    const items = overlay.querySelectorAll('.race-list-item');
    items.forEach(item => {
        item.onclick = () => {
            items.forEach(i => i.classList.remove('selected'));
            item.classList.add('selected');
            const raceName = item.getAttribute('data-name');
            selectedRaceBase = RACES_DB.find(r => r.name === raceName);
            selectedVariation = null;
            renderRaceDetails(selectedRaceBase);
        };
    });

    function renderRaceDetails(race) {
        if (!race) return;
        
        const hasVariations = race.variations && race.variations.length > 0;
        const isSubraceMandatory = RACES_REQUIRED_SUBRACE.includes(race.name);
        
        let currentSubrace = null; 

        if (isSubraceMandatory && hasVariations) {
            btnSelect.setAttribute('disabled', true);
            btnSelect.textContent = "Selecione uma Sub-raça";
            btnSelect.style.background = '#444';
        } else {
            btnSelect.removeAttribute('disabled');
            btnSelect.textContent = race.isLineage ? "Continuar para Ancestralidade" : `Selecionar ${race.name}`;
            btnSelect.style.background = '#9c27b0';
        }

        const flyInfo = race.flySpeed ? `<span style="color:#4fc3f7; margin-left:8px;">🦅 Voo: ${race.flySpeed}m</span>` : '';
        const imagePath = race.image || 'img/dado.png';
        
        const traitsHtml = race.traits.map(t => `
            <div class="race-trait-item">
                <div class="race-trait-name">${t.name}</div>
                <div class="race-trait-desc">${t.desc}</div>
            </div>
        `).join('');

        let variationsHtml = '';
        if (hasVariations) {
            const labelOpcional = isSubraceMandatory ? "(Obrigatório)" : "(Opcional)";
            const descOpcional = isSubraceMandatory 
                ? "Você DEVE escolher uma linhagem abaixo para prosseguir." 
                : "Você pode escolher uma sub-raça para modificar seus traços base, ou manter o padrão.";

            variationsHtml = `
                <div class="race-traits-title" style="margin-top:25px; color:#ffeb3b; border-top:1px solid #333; padding-top:15px;">
                    Sub-raças ${labelOpcional}
                </div>
                <div style="font-size:12px; color:#888; margin-bottom:10px;">
                    ${descOpcional}
                </div>
                <div class="variations-list">
                    ${race.variations.map((v, idx) => `
                        <div class="variation-card-wrapper">
                            <div class="variation-header" data-idx="${idx}">
                                <div style="display:flex; align-items:center; gap:10px; flex:1;">
                                    <input type="radio" name="race_variation" value="${idx}" id="var_${idx}" data-checked="false">
                                    <span class="variation-name">${v.name}</span>
                                </div>
                                <span class="variation-arrow">▼</span>
                            </div>
                            
                            <div class="variation-body">
                                ${v.description ? `<div class="variation-desc-text">${v.description}</div>` : ''}
                                
                                ${v.speed ? `<div style="font-size:12px; color:#bbb; margin-bottom:10px;">🏃 Novo Deslocamento: ${v.speed}m</div>` : ''}
                                ${v.flySpeed ? `<div style="font-size:12px; color:#4fc3f7; margin-bottom:10px;">🦅 Voo: ${v.flySpeed}m</div>` : ''}
                                
                                ${v.traits ? v.traits.map(vt => `
                                    <div class="variation-feature-box">
                                        <div class="variation-feature-title">★ ${vt.name}</div>
                                        <div class="variation-feature-content">${vt.desc}</div>
                                    </div>
                                `).join('') : ''}
                            </div>
                        </div>
                    `).join('')}
                </div>
            `;
        }

        detailsContainer.innerHTML = `
            <div class="race-detail-header">
                <div class="race-img-container" onclick="window.openImageLightbox('${imagePath}')" title="Clique para ampliar">
                    <img src="${imagePath}" class="race-img-display" onerror="this.src='img/dado.png'">
                </div>
                <div class="race-title-box">
                    <h2>${race.name}</h2>
                    <div class="race-info-line">
                        <strong style="color:#9c27b0;">Tipo:</strong> ${race.type}<br>
                        <strong style="color:#9c27b0;">Tamanho:</strong> ${race.size}<br>
                        <strong style="color:#9c27b0;">Deslocamento:</strong> ${race.speed}m ${flyInfo}
                    </div>
                </div>
            </div>
            <div class="race-desc">${race.description}</div>
            
            <div class="race-traits-title" style="margin-top:15px;">Características Base</div>
            <div>${traitsHtml}</div>
            
            ${variationsHtml}
        `;

        // Evento de Click Atualizado
        btnSelect.onclick = () => {
            if (race.isLineage) {
                const overlay = document.querySelector('.race-modal-overlay');
                if(overlay) overlay.remove();
                openAncestralRaceSelector(race); 
            } else {
                if (DRACONIC_ANCESTRIES[race.name]) {
                    openDraconicSelector(race, currentSubrace, null);
                } else {
                    aplicarRacaNaFicha(race, currentSubrace, null);
                    const overlay = document.querySelector('.race-modal-overlay');
                    if(overlay) overlay.remove();
                    checkScrollLock();
                }
            }
        };

        if (hasVariations) {
            const allRadios = detailsContainer.querySelectorAll('input[name="race_variation"]');

            detailsContainer.querySelectorAll('.variation-header').forEach(header => {
                header.addEventListener('click', (e) => {
                    if (e.target.type === 'radio') return;
                    header.closest('.variation-card-wrapper').classList.toggle('open');
                });
            });

            allRadios.forEach(radio => {
                radio.addEventListener('click', (e) => {
                    const idx = parseInt(radio.value);
                    const isAlreadyChecked = radio.getAttribute('data-checked') === 'true';

                    allRadios.forEach(r => r.setAttribute('data-checked', 'false'));

                    if (isAlreadyChecked && !isSubraceMandatory) {
                        radio.checked = false;
                        radio.setAttribute('data-checked', 'false');
                        currentSubrace = null; 
                        
                        btnSelect.removeAttribute('disabled');
                        btnSelect.textContent = `Selecionar ${race.name}`;
                        btnSelect.style.background = '#9c27b0';
                    } else {
                        radio.checked = true;
                        radio.setAttribute('data-checked', 'true');
                        currentSubrace = race.variations[idx];

                        btnSelect.removeAttribute('disabled');
                        btnSelect.textContent = `Selecionar ${currentSubrace.name}`;
                        btnSelect.style.background = '#9c27b0';
                    }
                });
            });
        }
    }
}

/* =============================================================
   SISTEMA DE SELEÇÃO DE CLASSES (DESIGN IDÊNTICO + TRAVA DE NÍVEL)
   ============================================================= */

// Variável para armazenar o nível atual da classe sendo visualizada no modal
let currentClassLevelPreview = 0;

function openClassSelectionModal() {
    if (CLASSES_DB.length === 0) {
        carregarDadosHeader().then(() => {
             if(CLASSES_DB.length > 0) openClassSelectionModal();
             else alert("Erro: Banco de classes vazio.");
        });
        return;
    }

    const existing = document.querySelector('.race-modal-overlay');
    if (existing) existing.remove();

    const listHtml = CLASSES_DB.map(c => 
        `<div class="race-list-item" data-name="${c.name}">${c.name}</div>`
    ).join('');

    const overlay = document.createElement('div');
    overlay.className = 'spell-modal-overlay race-modal-overlay';
    overlay.style.zIndex = '12000';

    overlay.innerHTML = `
        <div class="spell-modal" style="width: 900px; height: 700px; max-height: 95vh;">
            <div class="modal-header">
                <h3>Escolher Classe</h3>
                <button class="modal-close">✖</button>
            </div>
            
            <div class="modal-body" style="padding: 0; overflow: hidden; display:flex; flex-direction:column; flex:1;">
                <div class="race-catalog-container" style="flex:1; overflow:hidden;">
                    <div class="race-list-col">
                        ${listHtml}
                    </div>

                    <div class="race-details-col" id="class-details-content">
                        <div style="color: #666; text-align: center; margin-top: 50px;">
                            Selecione uma classe para ver os detalhes.
                        </div>
                    </div>
                </div>
            </div>

            <div class="modal-actions">
                <button id="btn-select-class" class="btn-add btn-save-modal" disabled>Selecionar</button>
            </div>
        </div>
    `;

    document.body.appendChild(overlay);
    if(typeof checkScrollLock === 'function') checkScrollLock();

    let selectedClass = null;
    let selectedSubclass = null;

    const btnSelect = overlay.querySelector('#btn-select-class');
    const detailsContainer = overlay.querySelector('#class-details-content');

    overlay.querySelector('.modal-close').onclick = () => { overlay.remove(); checkScrollLock(); };

    const items = overlay.querySelectorAll('.race-list-item');
    items.forEach(item => {
        item.onclick = () => {
            items.forEach(i => i.classList.remove('selected'));
            item.classList.add('selected');
            
            const className = item.getAttribute('data-name');
            selectedClass = CLASSES_DB.find(c => c.name === className);
            selectedSubclass = null; // Reseta subclasse ao trocar de classe
            
            // Determina o nível que o personagem TERÁ após selecionar esta classe
            const classKey = selectedClass.name.toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "");
            const currentLevel = state.niveisClasses && state.niveisClasses[classKey] ? parseInt(state.niveisClasses[classKey]) : 0;
            currentClassLevelPreview = currentLevel + 1;

            renderClassDetails(selectedClass, currentClassLevelPreview);
        };
    });

    btnSelect.onclick = () => {
        if(selectedClass) {
            aplicarClasseNaFicha(selectedClass, selectedSubclass);
            overlay.remove();
            checkScrollLock();
        }
    };

    function renderClassDetails(cls, simulatedLevel) {
        if (!cls) return;

        // Resetar botão
        btnSelect.removeAttribute('disabled');
        btnSelect.textContent = `Selecionar ${cls.name} (Nível ${simulatedLevel})`;
        btnSelect.style.background = '#9c27b0';

        const imagePath = cls.image || 'img/dado.png';
        const subclassReqLevel = cls.subclass_level || 3; 
        const canPickSubclass = simulatedLevel >= subclassReqLevel;

        // HTML de Proficiências
        let profHtml = '';
        if(cls.proficiencies) {
            if(cls.proficiencies.armor && cls.proficiencies.armor.length) profHtml += `<div><strong style="color:#e0aaff;">Armaduras:</strong> ${cls.proficiencies.armor.join(', ')}</div>`;
            if(cls.proficiencies.weapons && cls.proficiencies.weapons.length) profHtml += `<div><strong style="color:#e0aaff;">Armas:</strong> ${cls.proficiencies.weapons.join(', ')}</div>`;
            if(cls.proficiencies.tools && cls.proficiencies.tools.length) profHtml += `<div><strong style="color:#e0aaff;">Ferramentas:</strong> ${cls.proficiencies.tools.join(', ')}</div>`;
        }

        // HTML das Características Base (Filtrar por nível se desejar, aqui mostramos todas para info)
        const traitsHtml = cls.features ? cls.features.map(t => `
            <div class="race-trait-item">
                <div class="race-trait-name">${t.name}</div>
                <div class="race-trait-desc">${t.description}</div>
            </div>
        `).join('') : '';

        // HTML das Subclasses
        let subclassesHtml = '';
        if (cls.subclasses && cls.subclasses.length > 0) {
            
            let lockMessage = '';
            if (!canPickSubclass) {
                lockMessage = `<div style="background:#330000; border:1px solid #d32f2f; color:#ff9999; padding:8px; margin-bottom:10px; border-radius:4px; font-size:12px; text-align:center;">🔒 Subclasses disponíveis apenas no nível ${subclassReqLevel}. (Você estará no nível ${simulatedLevel})</div>`;
            } else if (!selectedSubclass && canPickSubclass) {
                 lockMessage = `<div style="background:#332a00; border:1px solid #ffeb3b; color:#ffeb3b; padding:8px; margin-bottom:10px; border-radius:4px; font-size:12px; text-align:center;">⚠ Você atingiu o nível ${subclassReqLevel}! Selecione uma subclasse abaixo.</div>`;
            }

            subclassesHtml = `
                <div class="race-traits-title" style="margin-top:25px; color:#ffeb3b; border-top:1px solid #333; padding-top:15px;">
                    Subclasses (Arquétipos/Juramentos)
                </div>
                ${lockMessage}
                <div class="variations-list" style="${!canPickSubclass ? 'opacity:0.5; pointer-events:none;' : ''}">
                    ${cls.subclasses.map((sub, idx) => `
                        <div class="variation-card-wrapper">
                            <div class="variation-header" data-idx="${idx}">
                                <div style="display:flex; align-items:center; gap:10px; flex:1;">
                                    <input type="radio" name="class_subclass" value="${idx}" id="sub_${idx}" data-checked="false" ${!canPickSubclass ? 'disabled' : ''}>
                                    <span class="variation-name">${sub.name}</span>
                                </div>
                                <span class="variation-arrow">▼</span>
                            </div>
                            
                            <div class="variation-body">
                                <div class="variation-desc-text">${sub.description || ''}</div>
                                ${sub.features ? sub.features.map(feat => `
                                    <div class="variation-feature-box">
                                        <div class="variation-feature-title">★ ${feat.name}</div>
                                        <div class="variation-feature-content">${feat.description}</div>
                                    </div>
                                `).join('') : ''}
                            </div>
                        </div>
                    `).join('')}
                </div>
            `;
        }

        detailsContainer.innerHTML = `
            <div class="race-detail-header">
                <div class="race-img-container" onclick="window.openImageLightbox('${imagePath}')">
                    <img src="${imagePath}" class="race-img-display" onerror="this.src='img/dado.png'">
                </div>
                <div class="race-title-box">
                    <h2>${cls.name}</h2>
                    <div class="race-info-line">
                        <strong style="color:#9c27b0;">Dado de Vida:</strong> d${cls.hit_die}<br>
                        <strong style="color:#9c27b0;">Salvaguardas:</strong> ${cls.saving_throws.join(', ')}
                    </div>
                </div>
            </div>
            
            <div class="race-traits-title" style="margin-top:15px;">Proficiências Iniciais & Equipamento</div>
            <div style="font-size:13px; color:#ccc; line-height:1.6; background:#111; padding:10px; border-radius:6px; border:1px solid #333;">
                ${profHtml}
                <div style="margin-top:6px; padding-top:6px; border-top:1px solid #333;">
                    <strong style="color:#e0aaff;">Equipamento Sugerido (Apenas Nível 1):</strong><br> ${cls.equipment ? cls.equipment.join('<br>') : '-'}
                </div>
            </div>

            <div class="race-traits-title" style="margin-top:20px;">Características de Classe</div>
            <div>${traitsHtml}</div>
            
            ${subclassesHtml}
        `;

        // Lógica dos Radio Buttons (Acordeão) para Subclasses
        if (cls.subclasses && cls.subclasses.length > 0 && canPickSubclass) {
            const allRadios = detailsContainer.querySelectorAll('input[name="class_subclass"]');

            detailsContainer.querySelectorAll('.variation-header').forEach(header => {
                header.addEventListener('click', (e) => {
                    if (e.target.type === 'radio') return;
                    if (!canPickSubclass) return;
                    header.closest('.variation-card-wrapper').classList.toggle('open');
                });
            });

            allRadios.forEach(radio => {
                radio.addEventListener('click', (e) => {
                    const idx = parseInt(radio.value);
                    const isAlreadyChecked = radio.getAttribute('data-checked') === 'true';

                    allRadios.forEach(r => r.setAttribute('data-checked', 'false'));

                    if (isAlreadyChecked) {
                        radio.checked = false;
                        radio.setAttribute('data-checked', 'false');
                        selectedSubclass = null;
                        btnSelect.textContent = `Selecionar ${cls.name} (Nível ${simulatedLevel})`;
                    } else {
                        radio.checked = true;
                        radio.setAttribute('data-checked', 'true');
                        selectedSubclass = cls.subclasses[idx];
                        btnSelect.textContent = `Selecionar ${cls.name} (${selectedSubclass.name})`;
                        
                        detailsContainer.querySelectorAll('.variation-card-wrapper').forEach(c => c.classList.remove('open'));
                        radio.closest('.variation-card-wrapper').classList.add('open');
                    }
                });
            });
        }
    }
}

// Função Principal de Aplicação com todas as regras solicitadas


// Helper para adicionar habilidade sem duplicar
function addAbilityIfNew(title, desc, cat, clsName, subName) {
    const exists = state.abilities && state.abilities.find(a => a.title === title);
    if (!exists) {
        if (!state.abilities) state.abilities = [];
        state.abilities.unshift({
            id: Date.now() + Math.floor(Math.random() * 100000),
            title: title,
            description: desc,
            expanded: false,
            active: true,
            category: cat,
            class: clsName,
            subclass: subName
        });
    }
}

// Helper para adicionar proficiências ao estado
function addProficienciasDoBanco(profObj) {
    if (!profObj) return;
    if (!state.proficienciasList) state.proficienciasList = [];

    const add = (arr) => {
        if (!arr) return;
        arr.forEach(p => {
            if (!state.proficienciasList.includes(p)) state.proficienciasList.push(p);
        });
    };

    add(profObj.armor);
    add(profObj.weapons);
    add(profObj.tools);
}

// --- SISTEMA DE ESCOLHA DE EQUIPAMENTO ---
function openEquipmentSelector(title, optionA, optionB, callback) {
    const overlay = document.createElement('div');
    overlay.className = 'spell-modal-overlay race-modal-overlay';
    overlay.style.zIndex = '15000';

    overlay.innerHTML = `
        <div class="spell-modal" style="width: 500px; height: auto;">
            <div class="modal-header">
                <h3>Escolha de Equipamento</h3>
            </div>
            <div class="modal-body" style="padding: 20px; text-align:center;">
                <p style="color:#ccc; margin-bottom:20px; font-size:16px;">${title}</p>
                <div style="display:flex; gap:15px; justify-content:center;">
                    <button class="btn-equip-opt btn-add" style="background:#222; border:1px solid #444; flex:1; padding:15px;">${optionA}</button>
                    <button class="btn-equip-opt btn-add" style="background:#222; border:1px solid #444; flex:1; padding:15px;">${optionB}</button>
                </div>
            </div>
        </div>
    `;

    document.body.appendChild(overlay);

    const buttons = overlay.querySelectorAll('.btn-equip-opt');
    
    buttons[0].onclick = () => {
        callback(optionA);
        overlay.remove();
    };

    buttons[1].onclick = () => {
        callback(optionB);
        overlay.remove();
    };
}

function processarEquipamentoInicial(equipList) {
    if (!equipList || equipList.length === 0) return;
    let queue = [...equipList];

    function processNext() {
        if (queue.length === 0) {
            window.dispatchEvent(new CustomEvent('sheet-updated'));
            return;
        }

        const itemStr = queue.shift();
        // Regex aprimorada para capturar "(a) ... ou (b) ..."
        const choiceRegex = /\(a\)\s*(.*?)\s+ou\s+\(b\)\s*(.*)/i;
        const match = itemStr.match(choiceRegex);

        if (match) {
            const optA = match[1].trim();
            const optB = match[2].trim();
            openEquipmentSelector("Selecione uma opção de equipamento:", optA, optB, (choice) => {
                // Se a escolha tiver sub-opções (c) etc, ou vírgulas, simplificamos adicionando tudo
                const subItems = choice.split(/,\s*(?![^(]*\))/); // Separa por vírgula se não estiver entre parenteses
                subItems.forEach(si => adicionarItemAoInventario(si.trim()));
                processNext();
            });
        } else {
            adicionarItemAoInventario(itemStr);
            processNext();
        }
    }
    processNext();
}

function adicionarItemAoInventario(nomeItem) {
    if (!state.inventory) state.inventory = [];
    
    // Limpeza básica do nome (remove "um", "uma", "kit de")
    const cleanName = nomeItem.replace(/^(um|uma|uns|umas)\s+/i, '').trim();

    const itemDb = buscarItemNoBanco(cleanName); 
    
    if (itemDb) {
        state.inventory.push(itemDb);
    } else {
        state.inventory.push({
            id: Date.now() + Math.floor(Math.random() * 1000),
            name: cleanName,
            type: "Geral",
            quantity: 1,
            weight: 0,
            description: "Item Inicial de Classe"
        });
    }
}



/* =============================================================
   SISTEMA DE EQUIPAMENTOS INTELIGENTE
   ============================================================= */

// 1. Modal A ou B (Lado a Lado)
function openEquipmentChoiceModal(title, optionA, optionB, callback) {
    const overlay = document.createElement('div');
    overlay.className = 'spell-modal-overlay race-modal-overlay';
    overlay.style.zIndex = '15000';

    overlay.innerHTML = `
        <div class="spell-modal" style="width: 600px; height: auto;">
            <div class="modal-header">
                <h3>Escolha de Equipamento</h3>
            </div>
            <div class="modal-body" style="padding: 20px;">
                <p style="color:#e0aaff; margin-bottom:20px; text-align:center; font-size:16px;">${title}</p>
                
                <div style="display:flex; gap:15px; justify-content:center; align-items:stretch;">
                    
                    <button class="btn-equip-opt btn-add" style="flex:1; background:#1a1a1a; border:1px solid #444; padding:15px; text-align:left; display:flex; flex-direction:column; gap:5px; transition:0.2s;">
                        <strong style="color:#9c27b0; font-size:14px; text-transform:uppercase;">Opção A</strong>
                        <span style="color:#fff; font-size:13px; line-height:1.4;">${optionA}</span>
                    </button>

                    <div style="display:flex; align-items:center; font-weight:bold; color:#666;">OU</div>

                    <button class="btn-equip-opt btn-add" style="flex:1; background:#1a1a1a; border:1px solid #444; padding:15px; text-align:left; display:flex; flex-direction:column; gap:5px; transition:0.2s;">
                        <strong style="color:#9c27b0; font-size:14px; text-transform:uppercase;">Opção B</strong>
                        <span style="color:#fff; font-size:13px; line-height:1.4;">${optionB}</span>
                    </button>

                </div>
            </div>
        </div>
    `;

    document.body.appendChild(overlay);

    const buttons = overlay.querySelectorAll('.btn-equip-opt');
    
    // Hover effect manual
    buttons.forEach(btn => {
        btn.onmouseenter = () => btn.style.borderColor = '#9c27b0';
        btn.onmouseleave = () => btn.style.borderColor = '#444';
    });

    buttons[0].onclick = () => { callback(optionA); overlay.remove(); };
    buttons[1].onclick = () => { callback(optionB); overlay.remove(); };
}

// 2. Processador da Lista de Equipamentos (Recursivo)
function processarEquipamentoInicial(equipList) {
    if (!equipList || equipList.length === 0) {
        window.dispatchEvent(new CustomEvent('sheet-updated'));
        return;
    }

    // Clona a lista para não alterar a original
    let queue = [...equipList];

    function processNext() {
        if (queue.length === 0) {
            window.dispatchEvent(new CustomEvent('sheet-updated'));
            return;
        }

        const itemStr = queue.shift();

        // Verifica escolha "(a) ... ou (b) ..."
        // Regex ajustado para pegar textos complexos
        const choiceRegex = /\(a\)\s*(.*?)\s+(?:ou)\s+\(b\)\s*(.*)/i;
        const match = itemStr.match(choiceRegex);

        if (match) {
            const optA = match[1].trim();
            const optB = match[2].trim();
            
            openEquipmentChoiceModal("Escolha seu equipamento inicial:", optA, optB, (choice) => {
                // Se a escolha conter vírgulas ou ' e ', separe os itens (ex: "Armadura de couro, arco longo e 20 flechas")
                // Truque: Substitui " e " por "," para facilitar o split
                const cleanChoice = choice.replace(" e ", ", "); 
                const subItems = cleanChoice.split(",").map(s => s.trim());
                
                // Adiciona sub-itens ao início da fila para serem processados (caso sejam genéricos também)
                queue.unshift(...subItems);
                processNext();
            });
        } else {
            // Se for item direto, verifica se é genérico
            verificarItemGenerico(itemStr, processNext);
        }
    }

    processNext();
}

// 3. Verifica se é "Qualquer arma..." e abre seletor, senão adiciona direto
function verificarItemGenerico(nomeItem, callbackNext) {
    const nomeLower = nomeItem.toLowerCase();
    
    let listaOpcoes = null;
    let tituloModal = "";

    // Lógica de Detecção de Palavras-Chave
    if (nomeLower.includes("qualquer arma simples")) {
        listaOpcoes = LISTA_ARMAS_SIMPLES;
        tituloModal = "Escolha uma Arma Simples";
    } 
    else if (nomeLower.includes("qualquer arma marcial")) {
        listaOpcoes = LISTA_ARMAS_MARCIAIS;
        tituloModal = "Escolha uma Arma Marcial";
    }
    else if (nomeLower.includes("instrumento musical")) {
        listaOpcoes = LISTA_INSTRUMENTOS_MUSICAIS;
        tituloModal = "Escolha um Instrumento Musical";
    }
    else if (nomeLower.includes("ferramenta de artesão") || nomeLower.includes("ferramenta de artesao")) {
        listaOpcoes = LISTA_FERRAMENTAS_ARTESAO;
        tituloModal = "Escolha uma Ferramenta de Artesão";
    }

    if (listaOpcoes) {
        // Abre o seletor genérico (reutilizando a função existente ou criando uma simples)
        openGenericSelector(tituloModal, 1, listaOpcoes, (selected) => {
            if (selected && selected.length > 0) {
                adicionarItemAoInventario(selected[0]);
            }
            callbackNext();
        });
    } else {
        // Não é genérico, adiciona direto
        adicionarItemAoInventario(nomeItem);
        callbackNext();
    }
}

// 4. Adiciona ao Inventário
function adicionarItemAoInventario(nomeItem) {
    if (!state.inventory) state.inventory = [];
    
    // Limpeza de nome (remove artigos iniciais e quantidades numéricas no inicio da string para busca)
    // Ex: "uma adaga" -> "adaga", "20 virotes" -> "virotes"
    let cleanName = nomeItem.replace(/^(um|uma|uns|umas)\s+/i, '');
    
    // Tenta extrair quantidade (ex: "20 flechas")
    let qtd = 1;
    const qtdMatch = cleanName.match(/^(\d+)\s+(.*)/);
    if(qtdMatch) {
        qtd = parseInt(qtdMatch[1]);
        cleanName = qtdMatch[2]; // Nome sem o número
    }

    cleanName = cleanName.trim();

    const itemDb = buscarItemNoBanco(cleanName); 
    
    if (itemDb) {
        // Clone para evitar referência
        const newItem = JSON.parse(JSON.stringify(itemDb));
        newItem.id = Date.now() + Math.floor(Math.random() * 1000);
        newItem.quantity = qtd; 
        state.inventory.push(newItem);
    } else {
        // Item Genérico
        state.inventory.push({
            id: Date.now() + Math.floor(Math.random() * 1000),
            name: cleanName.charAt(0).toUpperCase() + cleanName.slice(1), // Capitalize
            type: "Equipamento",
            quantity: qtd,
            weight: 0,
            description: "Item de Classe"
        });
    }
}

/* =============================================================
   4. PROCESSAMENTO DE ITENS E GENÉRICOS
============================================================= */

function processarListaEquipamentos(lista, index, callbackFinal) {
    if (!lista || index >= lista.length) {
        callbackFinal();
        return;
    }

    const itemStr = lista[index];
    const choiceRegex = /^\(a\)\s*(.+?)\s+(?:ou)\s+\(b\)\s*(.+)$/i; 
    const match = itemStr.match(choiceRegex);

    const nextStep = () => processarListaEquipamentos(lista, index + 1, callbackFinal);

    if (match) {
        const optA = match[1].trim();
        const optB = match[2].trim();
        openEquipmentChoiceModal("Escolha uma das opções:", optA, optB, (choice) => {
            // Separa itens compostos ("arco e flechas")
            const cleanChoice = choice.replace(" e ", ", ");
            const subItems = cleanChoice.split(",").map(s => s.trim());
            
            // Processa subitens (pode ter genérico dentro)
            let subQueue = [...subItems];
            function runSubQueue() {
                if(subQueue.length === 0) { nextStep(); return; }
                const si = subQueue.shift();
                verificarItemGenerico(si, () => runSubQueue());
            }
            runSubQueue();
        });
    } else {
        verificarItemGenerico(itemStr, nextStep);
    }
}

// Verifica palavras-chave para abrir seletor específico
function verificarItemGenerico(nomeItem, callbackNext) {
    const nomeLower = nomeItem.toLowerCase();
    let listaOpcoes = null;
    let tituloModal = "";

    // Detecção
    if (nomeLower.includes("qualquer arma simples")) { listaOpcoes = LISTA_ARMAS_SIMPLES; tituloModal = "Escolha uma Arma Simples"; } 
    else if (nomeLower.includes("qualquer arma marcial")) { listaOpcoes = LISTA_ARMAS_MARCIAIS; tituloModal = "Escolha uma Arma Marcial"; }
    else if (nomeLower.includes("instrumento musical")) { listaOpcoes = LISTA_INSTRUMENTOS; tituloModal = "Escolha um Instrumento"; }
    else if (nomeLower.includes("ferramenta de artesão") || nomeLower.includes("ferramenta de artesao")) { listaOpcoes = LISTA_FERRAMENTAS_ARTESAO; tituloModal = "Escolha uma Ferramenta"; }

    if (listaOpcoes) {
        openGenericSelector(tituloModal, 1, listaOpcoes, (selected) => {
            if (selected && selected.length > 0) adicionarItemAoInventario(selected[0]);
            callbackNext();
        });
    } else {
        adicionarItemAoInventario(nomeItem);
        callbackNext();
    }
}

function adicionarItemAoInventario(nomeItem) {
    if (!state.inventory) state.inventory = [];
    
    // Remove "um", "uma"
    let cleanName = nomeItem.replace(/^(um|uma|uns|umas|a|o)\s+/i, '').replace(/[.;]$/, '').trim();
    
    // Extrai quantidade (ex: "20 flechas")
    let qtd = 1;
    const qtdMatch = cleanName.match(/^(\d+)\s+(.*)/);
    if(qtdMatch) { qtd = parseInt(qtdMatch[1]); cleanName = qtdMatch[2]; }

    // Busca no DB
    const itemDb = buscarItemNoBanco(cleanName);
    
    if (itemDb) {
        const newItem = JSON.parse(JSON.stringify(itemDb));
        newItem.id = Date.now() + Math.floor(Math.random() * 1000);
        newItem.quantity = qtd;
        state.inventory.push(newItem);
    } else {
        state.inventory.push({
            id: Date.now() + Math.floor(Math.random() * 1000),
            name: cleanName.charAt(0).toUpperCase() + cleanName.slice(1),
            type: "Equipamento",
            quantity: qtd,
            weight: 0,
            description: "Item de Classe"
        });
    }
}

// --- Helpers de Estado ---
function addProficiencias(profObj) {
    if (!profObj) return;
    if (!state.proficienciasList) state.proficienciasList = [];
    const add = (arr) => { if (arr) arr.forEach(p => { if (!state.proficienciasList.includes(p)) state.proficienciasList.push(p); }); };
    add(profObj.armor);
    add(profObj.weapons);
    // Tools são tratadas via seletor se forem "escolha", mas se forem fixas:
    if (profObj.tools) profObj.tools.forEach(t => {
        if(!t.toLowerCase().includes("escolha") && !t.toLowerCase().includes("qualquer")) {
             if (!state.proficienciasList.includes(t)) state.proficienciasList.push(t);
        }
    });
}

function addFeatureToState(feat, category, clsName, subName) {
    if (!state.abilities) state.abilities = [];
    const exists = state.abilities.find(a => a.title === feat.name);
    if (!exists) {
        state.abilities.unshift({
            id: Date.now() + Math.floor(Math.random() * 100000),
            title: feat.name,
            description: feat.description,
            expanded: false,
            active: true,
            category: category,
            class: clsName,
            subclass: subName
        });
    }
}

// Adiciona o item ao state.inventory (buscando no DB de itens se existir)
function adicionarItemAoInventario(nomeItemBruto) {
    if (!state.inventory) state.inventory = [];
    
    // Limpa string (remove "um", "uma", pontuação final)
    let nomeLimpo = nomeItemBruto.replace(/^(um|uma|uns|umas)\s+/i, '').replace(/[.;]$/, '').trim();
    
    // Tenta achar no banco de dados global 'items'
    const itemDb = buscarItemNoBanco(nomeLimpo); // Usa a função que já criamos antes

    if (itemDb) {
        state.inventory.push(itemDb);
    } else {
        // Se não achar, cria item genérico
        state.inventory.push({
            id: Date.now() + Math.floor(Math.random() * 100000),
            name: nomeLimpo,
            type: "Equipamento",
            quantity: 1,
            weight: 0,
            description: "Item de Classe"
        });
    }
}

// Função auxiliar para renderizar os detalhes (Direita do Modal)
function renderClassDetails(cls, container, btnSelect) {
    if (!cls) return;

    btnSelect.removeAttribute('disabled');
    btnSelect.textContent = `Selecionar ${cls.name}`;
    btnSelect.style.background = '#9c27b0';

    const imagePath = cls.image || 'img/dado.png'; // Garanta que tenha uma imagem ou fallback

    // Formata Salvaguardas (Ex: "Força, Constituição")
    const saves = cls.saving_throws ? cls.saving_throws.join(', ') : '-';
    
    // Formata Dado de Vida
    const hitDie = cls.hit_die ? `d${cls.hit_die}` : '?';

    // Monta HTML de Proficiências (Armaduras e Armas)
    let profHtml = '';
    if(cls.proficiencies) {
        if(cls.proficiencies.armor) profHtml += `<div><strong style="color:#e0aaff;">Armaduras:</strong> ${cls.proficiencies.armor.join(', ')}</div>`;
        if(cls.proficiencies.weapons) profHtml += `<div><strong style="color:#e0aaff;">Armas:</strong> ${cls.proficiencies.weapons.join(', ')}</div>`;
    }

    container.innerHTML = `
        <div class="race-detail-header">
            <div class="race-img-container" onclick="window.openImageLightbox('${imagePath}')">
                <img src="${imagePath}" class="race-img-display" onerror="this.src='img/dado.png'">
            </div>
            <div class="race-title-box">
                <h2>${cls.name}</h2>
                <div class="race-info-line">
                    <strong style="color:#9c27b0;">Dado de Vida:</strong> ${hitDie}<br>
                    <strong style="color:#9c27b0;">Salvaguardas:</strong> ${saves}
                </div>
            </div>
        </div>
        
        <div class="race-traits-title" style="margin-top:15px;">Proficiências Iniciais</div>
        <div style="font-size:13px; color:#ccc; line-height:1.6; background:#111; padding:10px; border-radius:6px; border:1px solid #333;">
            ${profHtml || "Nenhuma especificada."}
        </div>

        <div class="race-traits-title" style="margin-top:20px;">Características de Classe</div>
        <div class="class-features-preview">
            ${(cls.table || []).slice(0, 3).map(level => `
                <div style="margin-bottom:5px; border-bottom:1px solid #333; padding-bottom:5px;">
                    <strong style="color:#fff;">Nível ${level.level}:</strong> <span style="color:#aaa;">${level.features ? level.features.join(', ') : '-'}</span>
                </div>
            `).join('')}
            <div style="font-size:11px; color:#666; margin-top:5px;">...veja mais na ficha após selecionar.</div>
        </div>
    `;
}

/* =============================================================
   3. APLICAÇÃO DE CLASSE NA FICHA
============================================================= */
function aplicarClasseNaFicha(cls, subCls) {
    if (typeof state === 'undefined') return;

    const classKey = cls.name.toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "");
    if (!state.niveisClasses) state.niveisClasses = {};

    const currentLevelInClass = state.niveisClasses[classKey] ? parseInt(state.niveisClasses[classKey]) : 0;
    const newLevelInClass = currentLevelInClass + 1;

    let totalCharacterLevel = 0;
    Object.values(state.niveisClasses).forEach(lvl => totalCharacterLevel += parseInt(lvl));
    const isFirstLevelCharacter = (totalCharacterLevel === 0);
    const isMulticlassing = (totalCharacterLevel > 0 && currentLevelInClass === 0);

    const requiredLevel = cls.subclass_level || 3;

    // --- REGRAS DE TRAVAMENTO DE SUBCLASSE ---
    if (subCls && newLevelInClass < requiredLevel) {
        alert(`Nível insuficiente (${newLevelInClass}) para subclasse ${subCls.name}. Requer nível ${requiredLevel}.`);
        return;
    }
    const hasSavedSubclass = state.subclasses && state.subclasses[classKey];
    if (newLevelInClass >= requiredLevel && !subCls && !hasSavedSubclass) {
        alert(`ATENÇÃO: Você atingiu o nível ${requiredLevel}! Você DEVE selecionar uma Subclasse para prosseguir.`);
        return; 
    }

    // --- APLICAÇÃO ---
    state.niveisClasses[classKey] = newLevelInClass;
    if (isFirstLevelCharacter) state.hitDie = `d${cls.hit_die}`;

    // Habilidades
    if (cls.features) {
        cls.features.forEach(feat => {
            const fLvl = feat.level || 1;
            if (fLvl <= newLevelInClass) addFeatureToState(feat, 'Classe', cls.name, '');
        });
    }
    if (subCls) {
        if (!state.subclasses) state.subclasses = {};
        state.subclasses[classKey] = subCls.name;
        if (subCls.features) {
            subCls.features.forEach(feat => {
                const fLvl = feat.level || requiredLevel;
                if (fLvl <= newLevelInClass) addFeatureToState(feat, 'Subclasse', cls.name, subCls.name);
            });
        }
    } else if (hasSavedSubclass && cls.subclasses) {
        const savedData = cls.subclasses.find(s => s.name === hasSavedSubclass);
        if (savedData && savedData.features) {
            savedData.features.forEach(feat => {
                const fLvl = feat.level || requiredLevel;
                if (fLvl <= newLevelInClass) addFeatureToState(feat, 'Subclasse', cls.name, hasSavedSubclass);
            });
        }
    }

    // --- FILA DE ESCOLHAS ---
    // Usamos Tasks para abrir um modal de cada vez
    const tasks = [];

    if (isFirstLevelCharacter) {
        // NÍVEL 1: Tudo
        if (cls.saving_throws && !state.proficiencias) state.proficiencias = {}; 
        // Adicione aqui lógica para marcar saves: state.proficiencias.saves = cls.saving_throws;

        // Perícias (LÓGICA CORRIGIDA BARDO/QUALQUER)
        if (cls.skills_list && cls.skills_count > 0) {
            let lista = cls.skills_list;
            let titulo = `Perícias de ${cls.name}`;
            
            const temQualquer = lista.some(s => s.toLowerCase().includes("qualquer") || s.toLowerCase().includes("escolha"));
            
            if (cls.name === "Bardo" || temQualquer) {
                lista = ALL_SKILLS_LIST; // Usa TODAS as perícias
                titulo = `Perícias de ${cls.name} (Escolha Livre)`;
            }

            tasks.push((next) => openSkillSelector(cls.skills_count, titulo, lista, next));
        }

        // Equipamentos
        if (cls.equipment && cls.equipment.length > 0) {
            tasks.push((next) => processarListaEquipamentos(cls.equipment, 0, next));
        }

        // Proficiências Fixas
        addProficiencias(cls.proficiencies);

    } else if (isMulticlassing) {
        // MULTICLASSE: Limitado
        let profsMC = { ...cls.proficiencies };
        if (profsMC.armor) profsMC.armor = profsMC.armor.filter(a => !a.toLowerCase().includes('pesada')); // Sem pesada (regra geral)
        addProficiencias(profsMC);

        // Perícias Multiclasse (Apenas estes ganham 1)
        if (['bardo', 'ladino', 'patrulheiro', 'ranger'].includes(classKey)) {
            // Bardo ganha 1 de QUALQUER, outros da lista
            let listaMC = cls.skills_list;
            if(classKey === 'bardo') listaMC = ALL_SKILLS_LIST;
            
            tasks.push((next) => openSkillSelector(1, `Multiclasse ${cls.name}`, listaMC, next));
        }
    }

    // Executa a fila de modais
    executarFila(tasks);

    atualizarTextoClassesHeader();
    if (typeof saveStateToServer === 'function') saveStateToServer();
    window.dispatchEvent(new CustomEvent('sheet-updated'));
}

// Executor de Fila Simples
function executarFila(tasks) {
    if (tasks.length === 0) {
        window.dispatchEvent(new CustomEvent('sheet-updated'));
        return;
    }
    const currentTask = tasks.shift();
    // A tarefa atual recebe uma função para chamar a próxima
    // Os modais (openSkillSelector) precisam chamar esse 'next' no botão confirmar
    // Adaptei o openSkillSelector acima para aceitar um callback onComplete, que será esse next.
    // O openGenericSelector também precisa de adaptação se for usado na fila.
    // O processarListaEquipamentos já tem callbackFinal.
    currentTask(() => executarFila(tasks)); 
}

// --- FUNÇÕES AUXILIARES ---

function addProficiencias(profObj) {
    if (!profObj) return;
    if (!state.proficienciasList) state.proficienciasList = [];

    const pushUnique = (arr) => {
        if (!arr) return;
        arr.forEach(item => {
            if (!state.proficienciasList.includes(item)) {
                state.proficienciasList.push(item);
            }
        });
    };

    pushUnique(profObj.armor);
    pushUnique(profObj.weapons);
    pushUnique(profObj.tools);
}

function addFeatureToState(feat, category, clsName, subName) {
    if (!state.abilities) state.abilities = [];
    
    // Verifica duplicata pelo nome
    const exists = state.abilities.find(a => a.title === feat.name);
    if (!exists) {
        state.abilities.unshift({
            id: Date.now() + Math.floor(Math.random() * 100000),
            title: feat.name,
            description: feat.description,
            expanded: false,
            active: true,
            category: category,
            class: clsName,
            subclass: subName
        });
    }
}

// Função auxiliar para adicionar proficiências ao estado sem duplicar
function addProficienciasDoBanco(profObj) {
    if (!profObj) return;
    if (!state.proficienciasList) state.proficienciasList = [];

    const add = (arr) => {
        if (!arr) return;
        arr.forEach(p => {
            if (!state.proficienciasList.includes(p)) state.proficienciasList.push(p);
        });
    };

    add(profObj.armor);
    add(profObj.weapons);
    add(profObj.tools);
}
/* =============================================================
   BUSCA INTELIGENTE DE ITENS
   ============================================================= */
function buscarItemNoBanco(nomeItem) {
    if (!items || items.length === 0) return null;

    // Normaliza para busca (remove acentos, minúsculas)
    const norm = (str) => str.normalize("NFD").replace(/[\u0300-\u036f]/g, "").toLowerCase().trim();
    
    // Detecta quantidade (ex: "5 Tochas" -> qtd: 5, nome: "Tochas")
    let qtd = 1;
    let nomeLimpo = nomeItem;
    
    // Regex para "10x Item" ou "10 Item"
    const qtdMatch = nomeItem.match(/^(\d+)[x\s]+(.+)/i);
    if (qtdMatch) {
        qtd = parseInt(qtdMatch[1]);
        nomeLimpo = qtdMatch[2];
    }

    const alvo = norm(nomeLimpo);

    // 1. Tenta Match Exato
    let itemEncontrado = items.find(i => norm(i.name) === alvo);

    // 2. Tenta Match Parcial (ex: "Corda de seda (15m)" no DB vs "Corda de seda" no input)
    if (!itemEncontrado) {
        itemEncontrado = items  .find(i => norm(i.name).includes(alvo) || alvo.includes(norm(i.name)));
    }

    if (itemEncontrado) {
        // Retorna uma CÓPIA do item com a quantidade ajustada (se for empilhável) e ID único
        return {
            ...itemEncontrado,
            id: Date.now() + Math.floor(Math.random() * 100000), // Novo ID único para a ficha
            originalId: itemEncontrado.id, // Mantém referência
            quantidade: qtd, // Adicione lógica de quantidade se sua ficha suportar
            equip: false,
            expanded: false
        };
    }

    return null;
}

function openDraconicSelector(raceData, variationData, lineageData) {
    const ancestries = DRACONIC_ANCESTRIES[raceData.name];
    if (!ancestries) {
        aplicarRacaNaFicha(raceData, variationData, lineageData);
        return;
    }

    const overlay = document.createElement('div');
    overlay.className = 'spell-modal-overlay race-modal-overlay';
    overlay.style.zIndex = '13000'; 

    const optionsHtml = ancestries.map((opt, idx) => `
        <label class="variation-header" style="margin-bottom: 8px; border-radius: 4px; border: 1px solid #333;">
            <div style="display:flex; align-items:center; gap:10px; width:100%;">
                <input type="radio" name="draconic_choice" value="${idx}">
                <div style="display:flex; flex-direction:column;">
                    <span style="color:#fff; font-weight:bold;">${opt.label}</span>
                    <span style="color:#aaa; font-size:12px;">Dano: <span style="color:#e0aaff">${opt.damage}</span> | Área: ${opt.area}</span>
                </div>
            </div>
        </label>
    `).join('');

    overlay.innerHTML = `
        <div class="spell-modal" style="width: 400px; height: auto; max-height: 80vh; display:flex; flex-direction:column;">
            <div class="modal-header">
                <h3>Escolha sua Herança</h3>
                <button class="modal-close">✖</button>
            </div>
            <div class="modal-body" style="padding: 15px; overflow-y: auto;">
                <div style="font-size:13px; color:#ccc; margin-bottom:15px;">
                    Selecione o tipo de dragão para definir seu sopro e resistência.
                </div>
                <div style="display:flex; flex-direction:column;">
                    ${optionsHtml}
                </div>
            </div>
            <div class="modal-actions">
                <button id="btn-confirm-draconic" class="btn-add btn-save-modal" disabled style="background:#444;">Confirmar</button>
            </div>
        </div>
    `;

    document.body.appendChild(overlay);

    const btnConfirm = overlay.querySelector('#btn-confirm-draconic');
    const radios = overlay.querySelectorAll('input[name="draconic_choice"]');
    let selectedAncestry = null;

    radios.forEach(r => {
        r.addEventListener('change', () => {
            selectedAncestry = ancestries[parseInt(r.value)];
            btnConfirm.removeAttribute('disabled');
            btnConfirm.style.background = '#9c27b0';
            btnConfirm.textContent = `Confirmar: ${selectedAncestry.label}`;
        });
    });

    overlay.querySelector('.modal-close').onclick = () => overlay.remove();

    btnConfirm.onclick = () => {
        if (selectedAncestry) {
            aplicarRacaNaFicha(raceData, variationData, lineageData, selectedAncestry);
            overlay.remove();
            const raceModal = document.querySelector('.race-modal-overlay'); 
            if (raceModal) raceModal.remove();
            if(typeof checkScrollLock === 'function') checkScrollLock();
        }
    };
}

/* -------------------------------------------------------------
   4. SELETOR DE RAÇA ANCESTRAL
   ------------------------------------------------------------- */
function openAncestralRaceSelector(lineageData) {
    const overlay = document.createElement('div');
    overlay.className = 'spell-modal-overlay race-modal-overlay';
    overlay.style.zIndex = '12000';
    const racasAncestrais = RACES_DB.filter(r => !r.isLineage);
    const listHtml = racasAncestrais.map(r => `<div class="race-list-item" data-name="${r.name}">${r.name}</div>`).join('');

    overlay.innerHTML = `
        <div class="spell-modal" style="width: 850px; height: 650px; max-height: 95vh;">
            <div class="modal-header">
                <div style="display:flex; flex-direction:column; align-items:flex-start;">
                    <h3 style="margin:0;">Raça Ancestral</h3>
                    <div style="font-size:12px; color:#bbb; margin-top:2px;">Base para a linhagem <strong style="color:#e0aaff;">${lineageData.name}</strong></div>
                </div>
                <button class="modal-close">✖</button>
            </div>
            <div class="modal-body" style="padding: 0; overflow: hidden; display:flex; flex-direction:column; flex:1;">
                <div class="race-catalog-container" style="flex:1; overflow:hidden;">
                    <div class="race-list-col">
                        ${listHtml}
                    </div>
                    <div class="race-details-col" id="ancestral-details-content">
                        <div style="color: #666; text-align: center; margin-top: 50px;">Selecione a raça ancestral.</div>
                    </div>
                </div>
            </div>
            <div class="modal-actions">
                <button id="btn-confirm-ancestral" class="btn-add btn-save-modal" disabled>Confirmar</button>
            </div>
        </div>
    `;

    document.body.appendChild(overlay);
    checkScrollLock();

    let selectedBase = null;
    let selectedVar = null;
    const btnConfirm = overlay.querySelector('#btn-confirm-ancestral');
    const detailsContainer = overlay.querySelector('#ancestral-details-content');

    overlay.querySelector('.modal-close').onclick = () => { overlay.remove(); checkScrollLock(); };

    btnConfirm.onclick = () => {
        if (selectedBase) {
            aplicarRacaNaFicha(selectedBase, selectedVar, lineageData);
            overlay.remove();
            checkScrollLock();
        }
    };

    const items = overlay.querySelectorAll('.race-list-item');
    items.forEach(item => {
        item.onclick = () => {
            items.forEach(i => i.classList.remove('selected'));
            item.classList.add('selected');
            const raceName = item.getAttribute('data-name');
            selectedBase = racasAncestrais.find(r => r.name === raceName);
            selectedVar = null;
            renderAncestralDetails(selectedBase);
        };
    });

    function renderAncestralDetails(race) {
        if (!race) return;
        const hasVariations = race.variations && race.variations.length > 0;

        if (hasVariations) {
            btnConfirm.setAttribute('disabled', true);
            btnConfirm.textContent = "Selecione a Sub-raça";
            btnConfirm.style.background = '#444';
        } else {
            btnConfirm.removeAttribute('disabled');
            btnConfirm.textContent = `Confirmar: ${race.name} (${lineageData.name})`;
            btnConfirm.style.background = '#9c27b0';
        }

        const flyInfo = race.flySpeed ? `<span style="color:#4fc3f7; margin-left:8px;">🦅 Voo: ${race.flySpeed}m</span>` : '';
        const traitsHtml = race.traits.map(t => `<div class="race-trait-item"><div class="race-trait-name">${t.name}</div><div class="race-trait-desc">${t.desc}</div></div>`).join('');

        let variationsHtml = '';
        if (hasVariations) {
            variationsHtml = `
                <div class="race-traits-title" style="margin-top:20px; color:#ffeb3b;">Variações (Sub-raças)</div>
                <div class="variations-list">
                    ${race.variations.map((v, idx) => `
                        <div class="variation-card-wrapper">
                            <div class="variation-header" data-idx="${idx}">
                                <input type="radio" name="ancestral_variation" value="${idx}" id="anc_var_${idx}">
                                <span class="variation-name">${v.name}</span>
                                <span class="variation-arrow">▾</span>
                            </div>
                            <div class="variation-body">
                                ${v.description ? `<div class="variation-desc">${v.description}</div>` : ''}
                                ${v.speed ? `<div style="font-size:12px; color:#bbb;">Novo Deslocamento: ${v.speed}m</div>` : ''}
                                ${v.traits.map(vt => `<div style="margin-top:4px;"><strong style="color:#e0aaff;">${vt.name}:</strong> <span style="color:#ccc; font-size:13px;">${vt.desc}</span></div>`).join('')}
                            </div>
                        </div>
                    `).join('')}
                </div>
            `;
        }

        const imagePath = race.image || 'img/dado.png';
        detailsContainer.innerHTML = `
            <div class="race-detail-header">
                <div class="race-img-container" onclick="window.openImageLightbox('${imagePath}')" title="Clique para ampliar">
                    <img src="${imagePath}" class="race-img-display" onerror="this.src='img/dado.png'">
                </div>
                <div class="race-title-box">
                    <h2>${race.name}</h2>
                    <div class="race-info-line">
                        <strong style="color:#9c27b0;">Tipo:</strong> ${race.type}<br>
                        <strong style="color:#9c27b0;">Tamanho:</strong> ${race.size}<br>
                        <strong style="color:#9c27b0;">Deslocamento:</strong> ${race.speed}m ${flyInfo}
                    </div>
                </div>
            </div>
            <div class="race-desc">${race.description}</div>
            <div class="race-traits-title" style="margin-top:15px;">Características da Raça Base</div>
            <div>${traitsHtml}</div>
            ${variationsHtml}
        `;

        if (hasVariations) {
            detailsContainer.querySelectorAll('.variation-header').forEach(header => {
                header.addEventListener('click', (e) => {
                    if (e.target.type === 'radio') { e.stopPropagation(); return; }
                    header.closest('.variation-card-wrapper').classList.toggle('open');
                });
            });
            detailsContainer.querySelectorAll('input[name="ancestral_variation"]').forEach(radio => {
                radio.addEventListener('change', () => {
                    const idx = parseInt(radio.value);
                    selectedVar = race.variations[idx];
                    radio.closest('.variation-card-wrapper').classList.add('open');
                    btnConfirm.removeAttribute('disabled');
                    btnConfirm.textContent = `Confirmar: ${selectedVar.name} (${lineageData.name})`;
                    btnConfirm.style.background = '#9c27b0';
                });
            });
        }
    }
}

/* -------------------------------------------------------------
   5. APLICAR RAÇA NA FICHA (ATUALIZADO)
   ------------------------------------------------------------- */
function aplicarRacaNaFicha(raceData, variationData, lineageData, ancestryData = null) {
    if (typeof state === 'undefined') return;

    let nomeFinal = raceData.name;
    
    // Constrói o nome
    let extras = [];
    if (lineageData) extras.push(lineageData.name);
    if (variationData) extras.push(variationData.name);
    if (ancestryData) extras.push(ancestryData.label);

    if (extras.length > 0) {
        nomeFinal += ` (${extras.join(' - ')})`;
    }

    state.raca = nomeFinal;
    state.subRaca = variationData ? variationData.name : (lineageData ? lineageData.name : "");

    // Dados base
    const sourceData = lineageData || variationData || raceData;
    state.racaTipo = lineageData ? lineageData.type : (sourceData.type || raceData.type);
    state.racaTamanho = lineageData ? lineageData.size : (sourceData.size || raceData.size);
    
    state.metros = (lineageData && lineageData.speed) 
        ? lineageData.speed 
        : ((variationData && variationData.speed) ? variationData.speed : raceData.speed);
        
    state.deslocamentoVoo = (lineageData && lineageData.flySpeed) 
        ? lineageData.flySpeed 
        : ((variationData && variationData.flySpeed) ? variationData.flySpeed : (raceData.flySpeed || 0));

    // Limpar habilidades antigas
    if (!state.abilities) state.abilities = [];
    state.abilities = state.abilities.filter(a => a.category !== 'Raça');

    // Substituições
    let traitsToRemove = [];
    if (variationData && variationData.replaces) traitsToRemove = traitsToRemove.concat(variationData.replaces);
    if (lineageData && lineageData.replaces) traitsToRemove = traitsToRemove.concat(lineageData.replaces);

    let traitsToAdd = [];

    // 1. Traits da Base
    if (raceData.traits) {
        let baseTraits = raceData.traits
            .filter(t => !traitsToRemove.includes(t.name))
            .map(t => ({...t, origin: raceData.name}));
        
        // Injeção Herança Dracônica
        if (ancestryData) {
            baseTraits = baseTraits.map(t => {
                let newDesc = t.desc;
                if (t.name.includes("Sopro") || t.name.includes("Ataque de Sopro")) {
                    newDesc += `\n\n> <b>HERANÇA ${ancestryData.type.toUpperCase()}:</b>\n> <b>Dano:</b> ${ancestryData.damage}\n> <b>Área:</b> ${ancestryData.area}`;
                }
                if (t.name.includes("Resistência") && (t.name.includes("Dano") || t.name.includes("Infernal") || t.name.includes("Dracônica"))) {
                    newDesc += `\n\n> <b>HERANÇA:</b> Você tem resistência a dano <b>${ancestryData.damage}</b>.`;
                }
                if (t.name === "Herança Dracônica" || t.name.includes("Ascendência")) {
                    newDesc = `Você escolheu a linhagem do Dragão <b>${ancestryData.label}</b>.\nElemento: ${ancestryData.damage}.\nForma do Sopro: ${ancestryData.area}.`;
                }
                return { ...t, desc: newDesc };
            });
        }
        traitsToAdd = traitsToAdd.concat(baseTraits);
    }
    
    // 2. Traits da Variação
    if (variationData && variationData.traits) {
        traitsToAdd = traitsToAdd.concat(variationData.traits.map(t => ({...t, origin: variationData.name})));
    }
    
    // 3. Traits da Linhagem
    if (lineageData && lineageData.traits) {
        traitsToAdd = traitsToAdd.concat(lineageData.traits.map(t => ({...t, origin: lineageData.name})));
    }

    const novasHabilidades = traitsToAdd
        .filter(t => t.name && t.name.trim() !== "")
        .map(t => ({
            id: Date.now() + Math.floor(Math.random() * 100000),
            title: t.name,
            description: t.desc || raceData.description,
            expanded: false,
            active: false,
            category: 'Raça',
            class: 'Raça',
            subclass: t.origin
        }));

    state.abilities.unshift(...novasHabilidades.reverse());

    // --- PROCESSAMENTO AUTOMÁTICO (RAÇAS) ---
    processarMecanicasRaciais(raceData, variationData, lineageData, ancestryData);

    atualizarHeader();
    if (typeof saveStateToServer === 'function') saveStateToServer();
    window.dispatchEvent(new CustomEvent('sheet-updated'));
}

/* ---------------- FUNÇÕES DE SUPORTE ---------------- */

function openCustomRaceCreator() {
    const overlay = document.createElement('div');
    overlay.className = 'spell-modal-overlay race-modal-overlay';
    overlay.style.zIndex = '12100';
    if(typeof checkScrollLock === 'function') checkScrollLock();

    let currentStep = 1;
    let customRaceData = { name: "", type: "Humanoide", size: "Médio", speed: 9, flySpeed: 0, hasFly: false, description: "", traits: [] };

    function renderWizardContent() {
        const contentDiv = overlay.querySelector('#wizard-content-area');
        const dots = overlay.querySelectorAll('.step-dot');
        const btnNext = overlay.querySelector('#btn-wizard-next');
        const btnPrev = overlay.querySelector('#btn-wizard-prev');
        
        dots.forEach((dot, idx) => { if (idx + 1 === currentStep) dot.classList.add('active'); else dot.classList.remove('active'); });
        
        if (currentStep === 1) btnPrev.disabled = true; else btnPrev.disabled = false;
        if (currentStep === 4) btnNext.textContent = "Concluir"; else btnNext.textContent = "Próximo";

        if (currentStep === 1) {
            contentDiv.innerHTML = `<div style="text-align:center; padding: 20px;"><h3 style="color:#fff;">Passo 1: Nome</h3><input id="custom-race-name" type="text" value="${customRaceData.name}" class="wizard-input-main"></div>`;
        } else if (currentStep === 2) {
             const typesOptions = CREATURE_TYPES.map(t => `<option value="${t}" ${customRaceData.type === t ? 'selected' : ''}>${t}</option>`).join('');
             const sizesOptions = CREATURE_SIZES.map(s => `<option value="${s}" ${customRaceData.size === s ? 'selected' : ''}>${s}</option>`).join('');
            contentDiv.innerHTML = `<div><h3 style="color:#fff;text-align:center;">Passo 2: Estatísticas</h3><div style="display:grid;grid-template-columns:1fr 1fr;gap:15px;margin-top:20px;"><div><label class="wizard-label">Tipo</label><select id="race-type-select" class="wizard-select">${typesOptions}</select></div><div><label class="wizard-label">Tamanho</label><select id="race-size-select" class="wizard-select">${sizesOptions}</select></div></div><div style="margin-top:20px; border-top:1px solid #333; padding-top:15px;"><label class="wizard-label" style="display:block;margin-bottom:10px;">Deslocamento</label><div style="display:flex;gap:20px;align-items:flex-end;"><div style="flex:1;"><label style="font-size:11px;color:#888;display:block;margin-bottom:4px;">Caminhada (m)</label><input type="number" id="race-speed-input" value="${customRaceData.speed}" class="wizard-input-small" style="width:100%;"></div><div style="flex:1;"><label class="wizard-check-label" style="margin-bottom:4px;"><input type="checkbox" id="race-fly-check" ${customRaceData.hasFly ? 'checked' : ''}>Voo?</label><input type="number" id="race-fly-input" value="${customRaceData.flySpeed}" class="wizard-input-small" style="width:100%;" ${customRaceData.hasFly ? '' : 'disabled'}></div></div></div></div>`;
            setTimeout(() => { 
                const chk = overlay.querySelector('#race-fly-check'); 
                const inp = overlay.querySelector('#race-fly-input'); 
                
                overlay.querySelector('#race-type-select').onchange = (e) => customRaceData.type = e.target.value;
                overlay.querySelector('#race-size-select').onchange = (e) => customRaceData.size = e.target.value;
                
                chk.onchange = () => { 
                    inp.disabled = !chk.checked; 
                    customRaceData.hasFly = chk.checked;
                    if(chk.checked && !inp.value) inp.value = 9; 
                }; 
            }, 50);
        } else if (currentStep === 3) {
            contentDiv.innerHTML = `<div><h3 style="color:#fff;text-align:center;">Passo 3: Descrição</h3><textarea id="custom-race-desc" class="wizard-textarea">${customRaceData.description}</textarea></div>`;
        } else if (currentStep === 4) {
            contentDiv.innerHTML = `<div style="padding:5px;"><h3 style="color:#fff;text-align:center;">Passo 4: Habilidades</h3><div id="traits-list-container" style="padding-bottom:10px;"></div><button id="btn-add-more-trait" class="btn-add-trait">+ Adicionar Habilidade</button></div>`;
            const container = contentDiv.querySelector('#traits-list-container');
            const addTraitInput = (name = "", desc = "") => {
                const idx = container.children.length;
                const div = document.createElement('div');
                div.className = 'wizard-trait-box';
                div.innerHTML = `<div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:5px;"><label style="color:#9c27b0;font-size:12px;font-weight:bold;">Habilidade ${idx + 1}</label>${idx > 0 ? `<button class="remove-trait-btn" style="background:none;border:none;color:#d32f2f;cursor:pointer;font-size:16px;padding:0;">×</button>` : ''}</div><input type="text" class="trait-name-input" value="${name}" style="width:100%;margin-bottom:5px;background:#000;border:1px solid #444;color:#fff;padding:6px;"><textarea class="trait-desc-input" style="width:100%;height:60px;background:#000;border:1px solid #444;color:#ccc;padding:6px;resize:none;">${desc}</textarea>`;
                if(div.querySelector('.remove-trait-btn')) div.querySelector('.remove-trait-btn').onclick = () => div.remove();
                container.appendChild(div);
            };
            if(customRaceData.traits.length) customRaceData.traits.forEach(t=>addTraitInput(t.name,t.desc)); else { addTraitInput(); addTraitInput(); }
            contentDiv.querySelector('#btn-add-more-trait').onclick = () => addTraitInput();
        }
    }

    overlay.innerHTML = `<div class="spell-modal" style="width:500px;height:600px;max-height:90vh;"><div class="modal-header"><h3>Criar Raça Customizada</h3><button class="modal-close">✖</button></div><div class="wizard-container"><div class="wizard-step-indicator"><div class="step-dot"></div><div class="step-dot"></div><div class="step-dot"></div><div class="step-dot"></div></div><div id="wizard-content-area" class="wizard-content"></div><div class="wizard-btn-row"><button id="btn-wizard-prev" class="btn-add" style="background:transparent;border:1px solid #444;color:#aaa;">Voltar</button><button id="btn-wizard-next" class="btn-add">Próximo</button></div></div></div>`;
    document.body.appendChild(overlay);
    
    renderWizardContent();

    overlay.querySelector('.modal-close').onclick = () => { 
        overlay.remove(); 
        if(typeof checkScrollLock === 'function') checkScrollLock(); 
    };

    overlay.querySelector('#btn-wizard-next').onclick = () => {
        if(currentStep===1) { 
            customRaceData.name = overlay.querySelector('#custom-race-name').value; 
            currentStep++; 
        }
        else if(currentStep===2) { 
            customRaceData.speed = overlay.querySelector('#race-speed-input').value; 
            const flyInput = overlay.querySelector('#race-fly-input');
            if(flyInput) customRaceData.flySpeed = flyInput.value;
            currentStep++; 
        }
        else if(currentStep===3) { 
            customRaceData.description = overlay.querySelector('#custom-race-desc').value; 
            currentStep++; 
        }
        else { 
            customRaceData.traits = [];
            overlay.querySelectorAll('.wizard-trait-box').forEach(box => {
                const n = box.querySelector('.trait-name-input').value.trim();
                const d = box.querySelector('.trait-desc-input').value.trim();
                if(n) customRaceData.traits.push({name:n, desc:d});
            });
            aplicarRacaNaFicha(customRaceData, null, null); 
            
            overlay.remove(); 
            if(typeof checkScrollLock === 'function') checkScrollLock();
        }
        renderWizardContent();
    };
    overlay.querySelector('#btn-wizard-prev').onclick = () => { if(currentStep>1){currentStep--; renderWizardContent();} };
}

/* --- FUNÇÃO LIGHTBOX GLOBAL --- */
window.openImageLightbox = function(imgSrc) {
    const existing = document.querySelector('.lightbox-overlay');
    if (existing) existing.remove();
    const overlay = document.createElement('div');
    overlay.className = 'lightbox-overlay';
    overlay.innerHTML = `<div class="lightbox-content"><span class="lightbox-close">✖</span><img src="${imgSrc}" class="lightbox-image-full" alt="Zoom"></div>`;
    overlay.onclick = function(e) { if (e.target.classList.contains('lightbox-overlay') || e.target.classList.contains('lightbox-close')) overlay.remove(); };
    document.body.appendChild(overlay);
};