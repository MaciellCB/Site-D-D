/* =============================================================
   HEADER: ANTECEDENTES, CLASSES E RAÇA
   (Suporte Completo a Automação de Perícias, Idiomas e Variantes)
============================================================= */

// --- DADOS PARA DROPDOWNS ---
const CREATURE_TYPES = ['Humanoide', 'Construto', 'Fada', 'Dragão', 'Monstruosidade', 'Morto-vivo', 'Celestial', 'Corruptor', 'Elemental', 'Besta', 'Planta', 'Gigante', 'Limo', 'Aberração', 'Gosma'];
const CREATURE_SIZES = ['Minúsculo', 'Pequeno', 'Médio', 'Grande', 'Enorme', 'Imenso'];

const RACES_REQUIRED_SUBRACE = ['Eladrin','Anões','Elfos','Gnomos','Meio-Elfo','Pequeninos',]; 

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

// --- VARIÁVEIS GLOBAIS ---
let RACES_DB = [];
let BACKGROUNDS_DB = [];
let CLASSES_DB = [];
let items = []; // Nova variável global

/* =============================================================
   MAPA DE LISTAS PARA SELETORES GENÉRICOS
   ============================================================= */
const ALL_SKILLS_LIST = [
    "Acrobacia", "Adestrar Animais", "Arcanismo", "Atletismo", "Atuação", 
    "Enganação", "Furtividade", "História", "Intimidação", "Intuição", 
    "Investigação", "Medicina", "Natureza", "Percepção", "Persuasão", 
    "Prestidigitação", "Religião", "Sobrevivência"
];

const ALL_LANGUAGES_LIST = [
    'Comum', 'Anão', 'Élfico', 'Gigante', 'Gnômico', 'Goblin', 'Halfling', 'Orc',
    'Abissal', 'Celestial', 'Dialeto Subterrâneo', 'Dracônico', 'Infernal', 'Primordial',
    'Silvestre', 'Druídico'
];

// Listas Específicas baseadas no seu Backend
const LISTA_ARTESAO = [
    'Ferramentas de Alquimista', 'Ferramentas de Calígrafo', 'Ferramentas de Carpinteiro',
    'Ferramentas de Cartógrafo', 'Ferramentas de Coureiro', 'Ferramentas de Ferreiro',
    'Ferramentas de Joalheiro', 'Ferramentas de Oleiro', 'Ferramentas de Pedreiro',
    'Ferramentas de Sapateiro', 'Ferramentas de Tecelão', 'Ferramentas de Vidreiro',
    'Suprimentos de Pintor', 'Ferramentas de Serralheiro', 'Ferramentas de Entalhador',
    'Suprimentos de Cervejeiro', 'Utensílios de Cozinheiro'
];

const LISTA_INSTRUMENTOS = [
    'Alaúde', 'Flauta', 'Tambor', 'Lira', 'Trombeta', 'Viola', 
    'Gaita de Fole', 'Charamela', 'Flauta D', 'Xilofone'
];

const LISTA_JOGOS = [
    'Baralho', 'Dados', 'Xadrez do Dragão'
];

// Lista completa para fallback (se for "Escolha 1 ferramenta qualquer")
const ALL_TOOLS_LIST = [
    ...LISTA_ARTESAO,
    ...LISTA_INSTRUMENTOS,
    ...LISTA_JOGOS,
    'Ferramentas de Ladrão', 'Kit de Herborismo', 'Kit de Disfarce', 
    'Kit de Falsificação', 'Kit de Venenos', 'Ferramentas de Navegador'
];

/* -------------------------------------------------------------
   SELETOR GENÉRICO (POPUP) - COM BLOQUEIO DE JÁ ADQUIRIDOS
   ------------------------------------------------------------- */
function openGenericSelector(title, count, options, onConfirmCallback) {
    const overlay = document.createElement('div');
    overlay.className = 'spell-modal-overlay race-modal-overlay';
    overlay.style.zIndex = '14000';

    // 1. Identifica o que já possui baseado no Título do Modal
    let alreadyKnown = [];
    if (title.includes("Idiomas")) {
        alreadyKnown = state.idiomasList || [];
    } else if (title.includes("Ferramentas")) {
        alreadyKnown = state.proficienciasList || [];
    }

    const checkboxesHtml = options.map(opt => {
        const isKnown = alreadyKnown.includes(opt);
        
        return `
            <label style="display:flex; align-items:center; gap:10px; background:#111; padding:8px; border-radius:4px; border:1px solid ${isKnown ? '#222' : '#333'}; cursor:${isKnown ? 'default' : 'pointer'}; opacity:${isKnown ? 0.6 : 1};">
                <input type="checkbox" value="${opt}" ${isKnown ? 'checked disabled' : 'class="gen-check"'} >
                <span style="color:${isKnown ? '#888' : '#fff'};">${opt} ${isKnown ? '<small>(Já possui)</small>' : ''}</span>
            </label>
        `;
    }).join('');

    overlay.innerHTML = `
        <div class="spell-modal" style="width: 450px; height: auto; max-height: 80vh; display:flex; flex-direction:column;">
            <div class="modal-header">
                <h3>${title}</h3>
            </div>
            <div class="modal-body" style="padding: 15px; overflow-y: auto;">
                <div style="font-size:14px; color:#e0aaff; margin-bottom:15px; text-align:center;">
                    Escolha <strong>${count}</strong> opção(ões) adicional(is).
                </div>
                <div style="display:grid; grid-template-columns: 1fr 1fr; gap:8px;">
                    ${checkboxesHtml}
                </div>
            </div>
            <div class="modal-actions">
                <button id="btn-confirm-gen" class="btn-add btn-save-modal" disabled style="background:#444;">Confirmar</button>
            </div>
        </div>
    `;

    document.body.appendChild(overlay);

    const btnConfirm = overlay.querySelector('#btn-confirm-gen');
    const checks = overlay.querySelectorAll('.gen-check'); 

    checks.forEach(chk => {
        chk.addEventListener('change', () => {
            const selectedCount = overlay.querySelectorAll('.gen-check:checked').length;
            
            if (selectedCount >= count) {
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
        const selectedValues = Array.from(overlay.querySelectorAll('.gen-check:checked')).map(c => c.value);
        onConfirmCallback(selectedValues);
        overlay.remove();
        if(typeof checkScrollLock === 'function') checkScrollLock();
    };
}

/* -------------------------------------------------------------
   SELETOR DE PERÍCIAS (POPUP) - COM BLOQUEIO DE JÁ TREINADAS
   ------------------------------------------------------------- */
function openSkillSelector(count, sourceName, limitToList = null) {
    const overlay = document.createElement('div');
    overlay.className = 'spell-modal-overlay race-modal-overlay';
    overlay.style.zIndex = '14000';

    const options = limitToList || ALL_SKILLS_LIST;
    
    const checkboxesHtml = options.map(skill => {
        const jaTem = state.pericias && state.pericias[skill] && state.pericias[skill].treinado;
        
        return `
            <label style="display:flex; align-items:center; gap:10px; background:#111; padding:8px; border-radius:4px; border:1px solid ${jaTem ? '#222' : '#333'}; cursor:${jaTem ? 'default' : 'pointer'}; opacity:${jaTem ? 0.6 : 1};">
                <input type="checkbox" value="${skill}" ${jaTem ? 'checked disabled' : 'class="skill-check"'}>
                <span style="color:${jaTem ? '#888' : '#fff'};">${skill} ${jaTem ? '<small>(Treinado)</small>' : ''}</span>
            </label>
        `;
    }).join('');

    overlay.innerHTML = `
        <div class="spell-modal" style="width: 400px; height: auto; max-height: 80vh; display:flex; flex-direction:column;">
            <div class="modal-header">
                <h3>Bônus de ${sourceName}</h3>
            </div>
            <div class="modal-body" style="padding: 15px; overflow-y: auto;">
                <div style="font-size:14px; color:#e0aaff; margin-bottom:15px; text-align:center;">
                    Escolha <strong>${count}</strong> perícia(s) adicional(is).
                </div>
                <div style="display:grid; grid-template-columns: 1fr 1fr; gap:8px;">
                    ${checkboxesHtml}
                </div>
            </div>
            <div class="modal-actions">
                <button id="btn-confirm-skills" class="btn-add btn-save-modal" disabled style="background:#444;">Confirmar</button>
            </div>
        </div>
    `;

    document.body.appendChild(overlay);

    const btnConfirm = overlay.querySelector('#btn-confirm-skills');
    const checks = overlay.querySelectorAll('.skill-check');

    checks.forEach(chk => {
        chk.addEventListener('change', () => {
            const selected = overlay.querySelectorAll('.skill-check:checked').length;
            
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
        
        if (!state.pericias) state.pericias = {}; 
        
        selectedSkills.forEach(skill => {
            if (state.pericias[skill]) {
                state.pericias[skill].treinado = true;
            }
        });

        saveStateToServer();
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
    const mapNomes = { 'artifice': 'Artífice', 'barbaro': 'Bárbaro', 'bardo': 'Bardo', 'blood hunter': 'Blood Hunter', 'bruxo': 'Bruxo', 'clerigo': 'Clérigo', 'druida': 'Druida', 'feiticeiro': 'Feiticeiro', 'guerreiro': 'Guerreiro', 'ladino': 'Ladino', 'mago': 'Mago', 'monge': 'Monge', 'paladino': 'Paladino', 'patrulheiro': 'Patrulheiro' };
    let partes = [];
    Object.keys(state.niveisClasses).forEach(key => {
        const nivel = parseInt(state.niveisClasses[key]);
        if (!isNaN(nivel) && nivel > 0) {
            let nomeDisplay = mapNomes[key] || key.charAt(0).toUpperCase() + key.slice(1);
            if (state.abilities && state.abilities.length > 0) {
                const norm = str => str.normalize("NFD").replace(/[\u0300-\u036f]/g, "").toLowerCase().trim();
                const habilidadeSubclasse = state.abilities.find(a => a.subclass && a.subclass !== "" && a.subclass !== "Infusão" && norm(a.class) === norm(nomeDisplay));
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
   SISTEMA DE SELEÇÃO DE CLASSES (DESIGN IDÊNTICO A RAÇA)
   ============================================================= */
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
        <div class="spell-modal" style="width: 850px; height: 650px; max-height: 95vh;">
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
            selectedSubclass = null;
            renderClassDetails(selectedClass);
        };
    });

    btnSelect.onclick = () => {
        if(selectedClass) {
            aplicarClasseNaFicha(selectedClass, selectedSubclass);
            overlay.remove();
            checkScrollLock();
        }
    };

    function renderClassDetails(cls) {
        if (!cls) return;

        // Resetar botão
        btnSelect.removeAttribute('disabled');
        btnSelect.textContent = `Selecionar ${cls.name}`;
        btnSelect.style.background = '#9c27b0';

        const imagePath = cls.image || 'img/dado.png';
        
        // HTML de Proficiências
        let profHtml = '';
        if(cls.proficiencies) {
            if(cls.proficiencies.armor) profHtml += `<div><strong style="color:#e0aaff;">Armaduras:</strong> ${cls.proficiencies.armor.join(', ')}</div>`;
            if(cls.proficiencies.weapons) profHtml += `<div><strong style="color:#e0aaff;">Armas:</strong> ${cls.proficiencies.weapons.join(', ')}</div>`;
            if(cls.proficiencies.tools && cls.proficiencies.tools.length) profHtml += `<div><strong style="color:#e0aaff;">Ferramentas:</strong> ${cls.proficiencies.tools.join(', ')}</div>`;
        }

        // HTML das Características Base
        const traitsHtml = cls.features ? cls.features.map(t => `
            <div class="race-trait-item">
                <div class="race-trait-name">${t.name}</div>
                <div class="race-trait-desc">${t.description}</div>
            </div>
        `).join('') : '';

        // HTML das Subclasses (Variations) - Igual ao design de Raça
        let subclassesHtml = '';
        if (cls.subclasses && cls.subclasses.length > 0) {
            subclassesHtml = `
                <div class="race-traits-title" style="margin-top:25px; color:#ffeb3b; border-top:1px solid #333; padding-top:15px;">
                    Subclasses (Arquétipos/Juramentos)
                </div>
                <div style="font-size:12px; color:#888; margin-bottom:10px;">
                    Você pode selecionar uma subclasse agora ou deixar para o nível apropriado.
                </div>
                <div class="variations-list">
                    ${cls.subclasses.map((sub, idx) => `
                        <div class="variation-card-wrapper">
                            <div class="variation-header" data-idx="${idx}">
                                <div style="display:flex; align-items:center; gap:10px; flex:1;">
                                    <input type="radio" name="class_subclass" value="${idx}" id="sub_${idx}" data-checked="false">
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
                    <strong style="color:#e0aaff;">Equipamento:</strong> ${cls.equipment ? cls.equipment.join('<br>') : '-'}
                </div>
            </div>

            <div class="race-traits-title" style="margin-top:20px;">Características de Classe</div>
            <div>${traitsHtml}</div>
            
            ${subclassesHtml}
        `;

        // Lógica dos Radio Buttons (Acordeão)
        if (cls.subclasses && cls.subclasses.length > 0) {
            const allRadios = detailsContainer.querySelectorAll('input[name="class_subclass"]');

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
                        selectedSubclass = null;
                        btnSelect.textContent = `Selecionar ${cls.name}`;
                    } else {
                        radio.checked = true;
                        radio.setAttribute('data-checked', 'true');
                        selectedSubclass = cls.subclasses[idx];
                        btnSelect.textContent = `Selecionar ${cls.name} (${selectedSubclass.name})`;
                        
                        // Fecha outros e abre este
                        detailsContainer.querySelectorAll('.variation-card-wrapper').forEach(c => c.classList.remove('open'));
                        radio.closest('.variation-card-wrapper').classList.add('open');
                    }
                });
            });
        }
    }
}

// Função de Aplicação Atualizada para suportar Subclasse
function aplicarClasseNaFicha(cls, subCls) {
    if (typeof state === 'undefined') return;

    // 1. Atualizar Nível/Classes no Header
    const classKey = cls.name.toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "");
    if (!state.niveisClasses) state.niveisClasses = {};
    
    // Lógica simples: Soma 1 nível ou define como 1
    if (state.niveisClasses[classKey]) {
        state.niveisClasses[classKey] = parseInt(state.niveisClasses[classKey]) + 1;
    } else {
        state.niveisClasses[classKey] = 1;
    }
    
    // Define Dado de Vida Principal (se for a primeira classe ou maior)
    state.hitDie = `d${cls.hit_die}`;

    // 2. Adicionar Habilidades da Classe Base
    if (cls.features) {
        cls.features.forEach(feat => {
            // Verifica se já tem para não duplicar (opcional)
            const exists = state.abilities && state.abilities.find(a => a.title === feat.name && a.class === cls.name);
            if (!exists) {
                if (!state.abilities) state.abilities = [];
                state.abilities.unshift({
                    id: Date.now() + Math.floor(Math.random() * 100000),
                    title: feat.name,
                    description: feat.description,
                    expanded: false,
                    active: true,
                    category: 'Classe',
                    class: cls.name,
                    subclass: ''
                });
            }
        });
    }

    // 3. Adicionar Habilidades da Subclasse (se selecionada)
    if (subCls && subCls.features) {
        subCls.features.forEach(feat => {
            const exists = state.abilities && state.abilities.find(a => a.title === feat.name && a.subclass === subCls.name);
            if (!exists) {
                if (!state.abilities) state.abilities = [];
                state.abilities.unshift({
                    id: Date.now() + Math.floor(Math.random() * 100000),
                    title: feat.name,
                    description: feat.description,
                    expanded: false,
                    active: true,
                    category: 'Subclasse',
                    class: cls.name,
                    subclass: subCls.name
                });
            }
        });
    }

    // 4. Processar Escolhas (Perícias) - Se for nível 1
    let totalLevels = 0;
    Object.values(state.niveisClasses).forEach(l => totalLevels += parseInt(l));
    
    if (totalLevels === 1 && cls.skills_list) { // Apenas no nível 1 global do personagem
        processarMecanicas({
            chooseSkillFrom: cls.skills_list,
            countSkills: cls.skills_count,
            name: cls.name
        });
    }

    // Atualizar visual
    atualizarTextoClassesHeader();
    if (typeof saveStateToServer === 'function') saveStateToServer();
    window.dispatchEvent(new CustomEvent('sheet-updated'));
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

function aplicarClasseNaFicha(cls) {
    if (typeof state === 'undefined') return;

    // Normaliza a chave para o objeto state.niveisClasses (ex: "Mago" -> "mago")
    const classKey = cls.name.toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "");

    // Inicializa se não existir
    if (!state.niveisClasses) state.niveisClasses = {};

    // LÓGICA SIMPLES: Se já tem a classe, soma +1 nível. Se não tem, define como 1.
    // Se você quiser que o modal sempre "Resete" para nivel 1, mude para: state.niveisClasses = { [classKey]: 1 };
    if (state.niveisClasses[classKey]) {
        state.niveisClasses[classKey] = parseInt(state.niveisClasses[classKey]) + 1;
    } else {
        // Se for a primeira classe do personagem, talvez queira limpar as outras?
        // Se quiser MULTICLASSE, mantenha como está.
        // Se quiser SUBSTITUIR tudo pela nova, descomente a linha abaixo:
        // state.niveisClasses = {}; 
        
        state.niveisClasses[classKey] = 1;
    }

    // Aplica Dado de Vida
    if (cls.hit_die) {
        state.hitDie = `d${cls.hit_die}`; // Ou lógica para multiclasse
    }

    // Aplica Proficiências de Salvaguarda (apenas se for nível 1 total, regra de D&D)
    // Aqui estou aplicando sempre para simplificar, ajuste conforme sua regra.
    if (cls.saving_throws) {
        if(!state.proficiencias) state.proficiencias = {};
        // Adicione lógica para marcar checkbox de salvaguarda nos atributos
    }

    // Adiciona Habilidades iniciais (Nível 1) na aba de Habilidades
    // ... (Sua lógica de adicionar abilities baseada no array cls.features ou table) ...

    // Processa escolhas (Perícias, Ferramentas) se houver no JSON da classe
    // Exemplo: if (cls.chooseSkills) processarMecanicas({ chooseSkills: cls.chooseSkills, ... });

    // Atualiza o Header Visualmente
    atualizarTextoClassesHeader(); // Essa função já existe no seu código original
    
    // Salva
    if (typeof saveStateToServer === 'function') saveStateToServer();
    window.dispatchEvent(new CustomEvent('sheet-updated'));
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