/* =============================================================
   FUNÇÃO AUXILIAR: GARANTIR ORDEM (VERSÃO SEGURA)
   Cria uma memória de ordem se não existir
============================================================= */
function syncOrdemClasses() {
    // 1. SEGURANÇA: Se o state ainda não carregou, não faz nada
    if (typeof state === 'undefined' || !state) return;
    
    // 2. Se não tem classes, não precisa ordenar
    if (!state.niveisClasses) return;

    // 3. Inicializa a array se não existir
    if (!state.ordemClasses) state.ordemClasses = [];

    // 4. Limpeza: Remove classes que foram apagadas (nível 0 ou null) da lista de ordem
    state.ordemClasses = state.ordemClasses.filter(key => 
        state.niveisClasses[key] && parseInt(state.niveisClasses[key]) > 0
    );

    // 5. Adição: Adiciona ao FINAL classes que existem no nível mas não na ordem
    Object.keys(state.niveisClasses).forEach(key => {
        const nivel = parseInt(state.niveisClasses[key]);
        if (nivel > 0 && !state.ordemClasses.includes(key)) {
            state.ordemClasses.push(key);
        }
    });
}

// Tipos de Criatura e Tamanhos
const CREATURE_TYPES = ['Humanoide', 'Construto', 'Fada', 'Dragão', 'Monstruosidade', 'Morto-vivo', 'Celestial', 'Corruptor', 'Elemental', 'Besta', 'Planta', 'Gigante', 'Limo', 'Aberração', 'Gosma'];
const CREATURE_SIZES = ['Minúsculo', 'Pequeno', 'Médio', 'Grande', 'Enorme', 'Imenso'];
const RACES_REQUIRED_SUBRACE = ['Eladrin', 'Anões', 'Elfos', 'Gnomos', 'Meio-Elfo', 'Pequeninos'];

const ALIGNMENT_DATA = [
    { id: "LG", title: "Ordeiro e Bom", sigla: "OB" },
    { id: "NG", title: "Neutro e Bom", sigla: "NB" },
    { id: "CG", title: "Caótico e Bom", sigla: "CB" },
    { id: "LN", title: "Ordeiro e Neutro", sigla: "ON" },
    { id: "TN", title: "Neutro", sigla: "N" },
    { id: "CN", title: "Caótico e Neutro", sigla: "CN" },
    { id: "LE", title: "Ordeiro e Mau", sigla: "OM" },
    { id: "NE", title: "Neutro e Mau", sigla: "NM" },
    { id: "CE", title: "Caótico e Mau", sigla: "CM" }
];
// Perícias
const ALL_SKILLS_LIST = [
    "Acrobacia", "Lidar com animais", "Arcanismo", "Atletismo", "Atuação",
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
    "Suprimentos de Pintor", "Utensílios de Cozinheiro", "Ferramentas de Funileiro","Ferramentas de Navegador",
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


/* =============================================================
   CONSTANTE: DADOS DE PACTO (BRUXO)
============================================================= */
const DADIVAS_BRUXO_DB = {
    "Pacto da Corrente": "Você aprende a magia *encontrar familiar* e pode conjurá-la como um ritual. A magia não conta no número de magias conhecidas.",
    "Pacto da Lâmina": "Você pode usar sua ação para criar uma arma de pacto em sua mão vazia. Você é proficiente com ela enquanto a empunhar.",
    "Pacto do Tomo": "Seu patrono lhe dá um grimório chamado Livro das Sombras. Você escolhe 3 truques de qualquer lista de classe.",
    "Pacto do Talismã": "Seu patrono lhe dá um amuleto que pode ajudar o usuário quando ele falha em um teste de habilidade (d4)."
};

/* =============================================================
   CONSTANTE: MALDIÇÕES DE SANGUE (BLOOD HUNTER)
============================================================= */
const BLOOD_CURSES_DB = [
    {
        name: "Maldição de Sangue dos Ansiosos",
        desc: "Ação Bônus (9m). Vantagem em Intimidação contra o alvo. Ampliar: O alvo tem Desvantagem no próximo teste de resistência de Sabedoria."
    },
    {
        name: "Maldição de Sangue da Ligação",
        desc: "Ação Bônus (9m). Alvo Grande ou menor faz Salvaguarda de Força ou tem deslocamento 0. Ampliar: Afeta qualquer tamanho e dura 1 minuto."
    },
    {
        name: "Maldição de Sangue da Agonia Inchada",
        desc: "Ação Bônus (9m). Desvantagem em testes de FOR e DES. Se atacar mais de uma vez, sofre 1d8 necrótico. Ampliar: Dura 1 minuto."
    },
    {
        name: "Maldição de Sangue da Exposição",
        desc: "Reação (9m). Quando alvo sofre dano, ele perde Resistência àquele tipo de dano. Ampliar: Ignora Imunidade (trata como resistência)."
    },
    {
        name: "Maldição de Sangue dos Sem Olhos",
        desc: "Reação (9m). Subtraia seu dado de Hemomancia do ataque da criatura. Ampliar: Aplica-se a todos os ataques da criatura no turno."
    },
    {
        name: "Maldição da Marionete Caída",
        desc: "Reação (9m). Quando criatura cai a 0 PV, ela faz um ataque contra alvo à sua escolha. Ampliar: Move a criatura e adiciona bônus ao ataque."
    },
    {
        name: "Maldição de Sangue dos Marcados",
        desc: "Ação Bônus (9m). Causa 1 dado de Hemomancia extra de dano em alvos com Rito ativo. Ampliar: Vantagem no próximo ataque."
    },
    {
        name: "Maldição da Mente Confusa",
        desc: "Ação Bônus (9m). Desvantagem em CON para manter concentração. Ampliar: Desvantagem em todos os testes de CON até o fim do turno."
    }
];

// Variáveis Globais
let RACES_DB = [];
let BACKGROUNDS_DB = [];
let CLASSES_DB = [];
let items = [];


/* =============================================================
   FUNÇÃO CORRIGIDA: SELETOR GENÉRICO COM DUPLICATAS
   Permite selecionar 2 itens iguais (ex: 2 Adagas)
============================================================= */
function openGenericSelector(title, count, options, onConfirmCallback) {
    const overlay = document.createElement('div');
    overlay.className = 'spell-modal-overlay race-modal-overlay';
    overlay.style.zIndex = '50000';

    // 1. Verifica o que o personagem já tem
    let alreadyKnown = [];
    if (title.includes("Idiomas")) alreadyKnown = state.idiomasList || [];
    else if (title.includes("Ferramentas") || title.includes("Instrumento")) alreadyKnown = state.proficienciasList || [];

    // 2. Define se permite duplicatas (Armas/Itens = Sim, Perícias/Idiomas = Não)
    // Se o título NÃO tiver Perícia nem Idioma, assumimos que é equipamento e permite pegar 2 iguais.
    const allowDuplicates = (!title.includes("Perícia") && !title.includes("Idioma") && count > 1);

    const uniqueOptions = [...new Set(options)].sort();
    
    // Se for item duplicável, não filtramos o que já tem (você pode querer uma 3ª adaga), 
    // mas se for Perícia/Idioma, filtramos.
    const availableOptionsCount = allowDuplicates 
        ? uniqueOptions.length 
        : uniqueOptions.filter(opt => !alreadyKnown.includes(opt)).length;

    const effectiveCount = Math.min(count, availableOptionsCount);

    const checkboxesHtml = uniqueOptions.map(opt => {
        const isKnown = alreadyKnown.includes(opt) && !allowDuplicates; // Só desabilita se já tem e NÃO pode duplicar
        
        // Estilo base
        const styleLabel = isKnown 
            ? "background:#222; border:1px solid #444; opacity:0.6;" 
            : "background:#1a1a1a; border:1px solid #555; cursor:pointer;";

        // HTML do Checkbox Principal
        let html = `
            <label class="option-row" style="display:flex; align-items:center; justify-content:space-between; padding:8px; border-radius:4px; ${styleLabel} transition:0.2s;">
                <div style="display:flex; align-items:center; gap:10px;">
                    <input type="checkbox" value="${opt}" class="gen-check main-check" ${isKnown ? 'checked disabled' : ''} style="accent-color:#9c27b0; transform:scale(1.1);">
                    <span style="color:${isKnown ? '#888' : '#fff'};">${opt} ${isKnown ? '<small>(Já possui)</small>' : ''}</span>
                </div>
        `;

        // HTML do Checkbox de Duplicata (Só aparece se permitir duplicatas e count > 1)
        if (allowDuplicates && !isKnown) {
            html += `
                <div class="dup-box" style="display:flex; align-items:center; gap:5px; opacity:0.3; transition:0.3s; border-left:1px solid #444; padding-left:8px;">
                    <span style="font-size:10px; color:#aaa;">+1</span>
                    <input type="checkbox" value="${opt}" class="gen-check dup-check" disabled style="accent-color:#e0aaff;">
                </div>
            `;
        }

        html += `</label>`;
        return html;
    }).join('');

    overlay.innerHTML = `
        <div class="spell-modal" style="width: 550px; height: 80vh; display:flex; flex-direction:column;">
            <div class="modal-header"><h3>${title}</h3></div>
            <div class="modal-body" style="padding: 15px; overflow-y: auto; flex:1;">
                <div style="font-size:14px; color:#e0aaff; margin-bottom:15px; text-align:center;">
                    Escolha <strong>${effectiveCount}</strong> opção(ões). 
                    ${effectiveCount < count ? '<br><small style="color:#aaa">(Opções limitadas disponíveis)</small>' : ''}
                    <div id="gen-counter" style="color:#fff; font-weight:bold; margin-top:5px;">0/${effectiveCount}</div>
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
    const counterDisplay = overlay.querySelector('#gen-counter');
    const allMainChecks = overlay.querySelectorAll('.main-check');
    const allDupChecks = overlay.querySelectorAll('.dup-check');

    // Lógica para lidar com duplicatas
    // 1. Quando clica no Principal
    allMainChecks.forEach(chk => {
        chk.addEventListener('change', (e) => {
            const row = chk.closest('.option-row');
            const dupBox = row.querySelector('.dup-box');
            const dupCheck = row.querySelector('.dup-check');

            if (dupCheck) {
                if (chk.checked) {
                    // Se marcou o principal, habilita o visual do secundário
                    dupBox.style.opacity = '1';
                    dupCheck.removeAttribute('disabled');
                } else {
                    // Se desmarcou o principal, reseta o secundário
                    dupCheck.checked = false;
                    dupCheck.setAttribute('disabled', true);
                    dupBox.style.opacity = '0.3';
                }
            }
            updateSelection();
        });
    });

    // 2. Quando clica na Duplicata
    allDupChecks.forEach(chk => {
        chk.addEventListener('change', updateSelection);
    });

    function updateSelection() {
        // Conta quantos checks totais (principais + duplicatas) estão marcados
        const totalChecked = overlay.querySelectorAll('.gen-check:checked').length;
        
        counterDisplay.textContent = `${totalChecked}/${effectiveCount}`;

        // Lógica de Limite
        if (totalChecked >= effectiveCount) {
            // Habilita botão
            btnConfirm.removeAttribute('disabled');
            btnConfirm.style.background = '#9c27b0';

            // Desabilita tudo que NÃO está marcado
            allMainChecks.forEach(c => { if (!c.checked) c.disabled = true; });
            allDupChecks.forEach(c => { if (!c.checked) c.disabled = true; });
            
            // Visual: Opacidade nas linhas não selecionadas
            overlay.querySelectorAll('.option-row').forEach(row => {
                if (!row.querySelector('.gen-check:checked')) row.style.opacity = '0.5';
            });

        } else {
            // Desabilita botão
            btnConfirm.setAttribute('disabled', true);
            btnConfirm.style.background = '#444';

            // Reabilita checks principais
            allMainChecks.forEach(c => { 
                // Só reabilita se não for um item "Já possui" fixo
                if (!alreadyKnown.includes(c.value) || allowDuplicates) {
                    c.disabled = false; 
                }
            });

            // Reabilita checks duplicados (apenas se o pai estiver checado)
            allDupChecks.forEach(c => {
                const parentRow = c.closest('.option-row');
                const parentMain = parentRow.querySelector('.main-check');
                if (parentMain.checked) c.disabled = false;
            });

            // Restaura opacidade
            overlay.querySelectorAll('.option-row').forEach(row => row.style.opacity = '1');
        }
    }

    if (effectiveCount === 0) {
        btnConfirm.removeAttribute('disabled');
        btnConfirm.style.background = '#9c27b0';
        btnConfirm.textContent = "Continuar (Nada a escolher)";
    }

    btnConfirm.onclick = () => {
        // Coleta os valores. Se marcou principal e duplicata, o valor aparece 2x no array
        const selectedValues = Array.from(overlay.querySelectorAll('.gen-check:checked')).map(c => c.value);
        onConfirmCallback(selectedValues);
        overlay.remove();
        if (typeof checkScrollLock === 'function') checkScrollLock();
    };
}


function openSkillSelector(count, sourceName, limitToList = null, onComplete = null) {
    const existing = document.querySelectorAll('.race-modal-overlay');
    existing.forEach(e => e.remove());

    const overlay = document.createElement('div');
    overlay.className = 'spell-modal-overlay race-modal-overlay';
    overlay.style.zIndex = '50000';

    const options = limitToList || ALL_SKILLS_LIST;
    const uniqueOptions = [...new Set(options)].sort();

    if (!state.pericias) state.pericias = {};

    const alreadyHaveCount = uniqueOptions.filter(skill => state.pericias[skill] && state.pericias[skill].treinado).length;
    const availableToPick = uniqueOptions.length - alreadyHaveCount;
    const effectiveCount = Math.min(count, availableToPick);

    const checkboxesHtml = uniqueOptions.map(skill => {
        const jaTem = state.pericias[skill] && state.pericias[skill].treinado;
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
            <div class="modal-header"><h3>${sourceName}</h3></div>
            <div class="modal-body" style="padding: 0; overflow:hidden; flex:1; display:flex; flex-direction:column;">
                <div style="padding:15px; background:#111; border-bottom:1px solid #333; text-align:center;">
                    <p style="color:#ccc; margin:0; font-size:14px;">
                        Você deve escolher <strong style="color:#e0aaff; font-size:16px;">${effectiveCount}</strong> nova(s) perícia(s).
                    </p>
                    <div id="skill-counter-text" style="font-size:12px; color:#777; margin-top:5px;">0 selecionadas</div>
                </div>
                <div style="flex:1; overflow-y:auto; padding:15px;">
                    <div style="display:grid; grid-template-columns: 1fr 1fr; gap:10px;">${checkboxesHtml}</div>
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
    const activeChecks = overlay.querySelectorAll('.skill-check');

    if (effectiveCount === 0) {
        btnConfirm.removeAttribute('disabled');
        btnConfirm.style.background = '#9c27b0';
        btnConfirm.style.color = '#fff';
        btnConfirm.textContent = "Continuar (Já possui todas as opções)";
        counterText.textContent = "Todas as perícias disponíveis já foram aprendidas.";
    }

    const updateState = () => {
        const selectedCount = overlay.querySelectorAll('.skill-check:checked').length;
        counterText.textContent = `${selectedCount} de ${effectiveCount} selecionadas`;

        if (selectedCount >= effectiveCount) {
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
            btnConfirm.setAttribute('disabled', true);
            btnConfirm.style.background = '#333';
            btnConfirm.style.color = '#777';
            activeChecks.forEach(c => {
                c.disabled = false;
                c.parentElement.parentElement.style.opacity = '1';
            });
        }
    };

    activeChecks.forEach(chk => { chk.addEventListener('change', updateState); });

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
        overlay.remove();

        if (onComplete && typeof onComplete === 'function') {
            onComplete();
        } else {
            window.dispatchEvent(new CustomEvent('sheet-updated'));
            if (typeof checkScrollLock === 'function') checkScrollLock();
        }
    };
}


// --- CONFIGURAÇÃO DA API E CARREGAMENTO ---
var BASE_API_URL = (typeof API_URL !== 'undefined') ? API_URL : 'https://dandd-chan.onrender.com/api';

async function carregarDadosHeader() {
    try {
        const raceRes = await fetch(`${BASE_API_URL}/catalog/races_db`);
        if (raceRes.ok) RACES_DB = await raceRes.json();

        const bgRes = await fetch(`${BASE_API_URL}/catalog/backgrounds_db`);
        if (bgRes.ok) BACKGROUNDS_DB = await bgRes.json();

        const classRes = await fetch(`${BASE_API_URL}/catalog/classes_db`);
        if (classRes.ok) {
            CLASSES_DB = await classRes.json();
        } else {
            try {
                const classLocal = await fetch('backend/data/classes_db.json');
                if (classLocal.ok) CLASSES_DB = await classLocal.json();
            } catch (e) { }
        }

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

function atualizarHeader() {
    if (typeof state === 'undefined') return;

    const btnAntecedente = document.getElementById('btn-antecedente');
    if (btnAntecedente) btnAntecedente.textContent = state.antecedente || "Escolher...";

const btnAlign = document.getElementById('btn-alinhamento');
    if (btnAlign) btnAlign.textContent = state.alinhamento || "Escolher...";

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

/* =============================================================
   SUBSTITUA NO HEADERJS.js
============================================================= */
function atualizarTextoClassesHeader() {
    const el = document.getElementById('input-classesHeader');
    if (!el) return;

    // Garante que a lista de ordem esteja correta antes de exibir
    syncOrdemClasses();

    if (!state.ordemClasses || state.ordemClasses.length === 0) {
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

    // AQUI ESTÁ O SEGREDO: Usamos .map na lista de ORDEM, não Object.keys
    const partes = state.ordemClasses.map(key => {
        const nivel = parseInt(state.niveisClasses[key]);
        let nomeDisplay = mapNomes[key] || key.charAt(0).toUpperCase() + key.slice(1);

        // Adiciona Subclasse se houver
        if (state.subclasses && state.subclasses[key]) {
            nomeDisplay += ` (${state.subclasses[key]})`;
        }
        else if (state.abilities && state.abilities.length > 0) {
            const norm = str => str.normalize("NFD").replace(/[\u0300-\u036f]/g, "").toLowerCase().trim();
            const habilidadeSubclasse = state.abilities.find(a =>
                a.category === 'Subclasse' && norm(a.class) === norm(nomeDisplay)
            );
            if (habilidadeSubclasse) nomeDisplay += ` [${habilidadeSubclasse.subclass}]`;
        }

        return `${nomeDisplay} ${nivel}`;
    });

    const novoTexto = partes.join(' / ');
    if (el.value !== novoTexto) { el.value = novoTexto; autoResize(el); }
}

window.addEventListener('sheet-updated', () => {
    atualizarHeader();
    checkScrollLock();
});

document.addEventListener('DOMContentLoaded', () => {
    const elRaca = document.getElementById('input-raca');
    if (elRaca) {
        elRaca.setAttribute('readonly', true);
        elRaca.style.cursor = 'pointer';
        elRaca.addEventListener('click', openRaceSelectionModal);
    }

    const btnAnt = document.getElementById('btn-antecedente');
    if (btnAnt) btnAnt.addEventListener('click', openBackgroundSelectionModal);
    
    const elClasses = document.getElementById('input-classesHeader');
    if (elClasses) {
        elClasses.style.cursor = 'pointer';
        elClasses.addEventListener('click', openClassSelectionModal);
    }
    const btnAlign = document.getElementById('btn-alinhamento');
    if (btnAlign) btnAlign.addEventListener('click', openAlignmentModal);
});



/* =============================================================
   SISTEMA DE ANTECEDENTES
   ============================================================= */
function openBackgroundSelectionModal() {
    if (BACKGROUNDS_DB.length === 0) {
        carregarDadosHeader().then(() => {
            if (BACKGROUNDS_DB.length > 0) openBackgroundSelectionModal();
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
                    <div class="race-list-col">${listHtml}</div>
                    <div class="race-details-col" id="bg-details-content">
                        <div style="color: #666; text-align: center; margin-top: 50px;">Selecione um antecedente para ver os detalhes.</div>
                    </div>
                </div>
            </div>
            <div class="modal-actions">
                <button id="btn-select-bg" class="btn-add btn-save-modal" disabled>Selecionar</button>
            </div>
        </div>
    `;

    document.body.appendChild(overlay);
    if (typeof checkScrollLock === 'function') checkScrollLock();

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
        if (selectedBgBase) {
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

        const imagePath = bg.image || 'img/imagem-no-site/dado.png';
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
                <div class="race-traits-title" style="margin-top:25px; color:#ffeb3b; border-top:1px solid #333; padding-top:15px;">Variantes (Opcional)</div>
                <div style="font-size:12px; color:#888; margin-bottom:10px;">Você pode selecionar uma variante abaixo para modificar seu antecedente.</div>
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
                                ${v.feature ? `<div class="variation-feature-box"><div class="variation-feature-title">★ ${v.feature.name}</div><div class="variation-feature-content">${v.feature.desc}</div></div>` : ''}
                                ${v.equipment ? `<div style="margin-top:10px; font-size:12px; color:#aaa; border-top:1px dashed #333; padding-top:5px;"><strong style="color:#e0aaff;">Equipamento Alternativo:</strong> ${v.equipment.join(', ')}</div>` : ''}
                            </div>
                        </div>
                    `).join('')}
                </div>
            `;
        }

        detailsContainer.innerHTML = `
            <div class="race-detail-header">
                <div class="race-img-container" onclick="window.openImageLightbox('${imagePath}')">
                    <img src="${imagePath}" class="race-img-display" onerror="this.src='img/imagem-no-site/dado.png'">
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
                <div style="margin-top:6px; padding-top:6px; border-top:1px solid #333;"><strong style="color:#e0aaff;">Equipamento:</strong> ${equipsHtml}</div>
            </div>
            <div class="race-traits-title" style="margin-top:20px;">Habilidade Principal: ${bg.feature.name}</div>
            <div class="race-trait-item"><div class="race-trait-desc" style="font-size:13px; color:#ddd;">${bg.feature.desc}</div></div>
            ${variantsHtml}
        `;

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

function aplicarAntecedenteNaFicha(bgBase, bgVariant) {
    if (typeof state === 'undefined') return;

    const nomeFinal = bgVariant ? `${bgBase.name} (${bgVariant.name})` : bgBase.name;
    state.antecedente = nomeFinal;

    const featureData = (bgVariant && bgVariant.feature) ? bgVariant.feature : bgBase.feature;
    const equipData = (bgVariant && bgVariant.equipment) ? bgVariant.equipment : bgBase.equipment;

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

    if (equipData) {
        if (!state.inventory) state.inventory = [];
        if (!state.money) state.money = { pc: 0, pp: 0, pd: 0, po: 0, pl: 0 };

        equipData.forEach(itemStr => {
            const moneyRegex = /^(\d+)\s*(PO|PP|PC|PL|PD|po|pp|pc|pl|pd)/i;
            const match = itemStr.match(moneyRegex);

            if (match) {
                const qtd = parseInt(match[1]);
                const tipo = match[2].toLowerCase();
                if (state.money[tipo] !== undefined) state.money[tipo] += qtd;
            } else {
                const itemDoBanco = buscarItemNoBanco(itemStr);
                if (itemDoBanco) {
                    state.inventory.push(itemDoBanco);
                } else {
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

    let mecanicas = { name: nomeFinal };

    if (Number.isInteger(bgBase.languages) && bgBase.languages > 0) mecanicas.chooseLanguages = bgBase.languages;
    else if (Array.isArray(bgBase.languages)) mecanicas.languages = bgBase.languages;

    if (bgBase.skills) mecanicas.skills = bgBase.skills;

    if (bgBase.tools) {
        let toolsFixed = [];
        let toolChoices = [];

        bgBase.tools.forEach(t => {
            const tLower = t.toLowerCase();
            if (tLower.includes("instrumento musical")) toolChoices.push({ count: 1, list: LISTA_INSTRUMENTOS, title: "Instrumento Musical" });
            else if (tLower.includes("jogo") || tLower.includes("jogos")) toolChoices.push({ count: 1, list: LISTA_JOGOS, title: "Conjunto de Jogo" });
            else if (tLower.includes("artesão") || tLower.includes("artesao")) toolChoices.push({ count: 1, list: LISTA_FERRAMENTAS_ARTESAO, title: "Ferramentas de Artesão" });
            else toolsFixed.push(t);
        });

        mecanicas.proficiencies = toolsFixed;
        if (toolChoices.length > 0) mecanicas.chooseToolFromList = toolChoices;
    }

    processarMecanicas(mecanicas);
    atualizarHeader();
    if (typeof saveStateToServer === 'function') saveStateToServer();
    window.dispatchEvent(new CustomEvent('sheet-updated'));
}

/* =============================================================
   PROCESSADOR DE MECÂNICAS (ATUALIZADO)
   - Adiciona "Comum" automaticamente
   - Corrige contagem de duplicatas
   ============================================================= */
function processarMecanicas(...sources) {
    let resToAdd = [], imuToAdd = [], profToAdd = [], langToAdd = [], skillsToTrain = [], pendingChoices = [];

    // --- CORREÇÃO: Forçar "Comum" sempre ---
    // Garante que o idioma Comum seja adicionado à lista temporária para ser processado
    if (!state.idiomasList) state.idiomasList = [];
    if (!state.idiomasList.includes('Comum')) {
        state.idiomasList.push('Comum');
    }

    const lerDados = (obj) => {
        if (!obj) return;
        if (Array.isArray(obj.resistances)) resToAdd.push(...obj.resistances);
        if (Array.isArray(obj.immunities)) imuToAdd.push(...obj.immunities);
        if (Array.isArray(obj.proficiencies)) profToAdd.push(...obj.proficiencies);
        
        if (Array.isArray(obj.languages)) {
            // Filtra duplicatas na fonte
            obj.languages.forEach(l => {
                if(l !== 'Comum') langToAdd.push(l); 
            });
        }
        
        if (Array.isArray(obj.skills)) skillsToTrain.push(...obj.skills);

        const sourceTitle = obj.name || "";

        if (obj.chooseSkills) pendingChoices.push({ type: 'skill', count: obj.chooseSkills, list: ALL_SKILLS_LIST, source: sourceTitle });
        if (obj.chooseSkillFrom && obj.countSkills) pendingChoices.push({ type: 'skill', count: obj.countSkills, list: obj.chooseSkillFrom, source: sourceTitle });
        
        // Seletor de Idiomas
        if (obj.chooseLanguages) {
            pendingChoices.push({ type: 'language', count: obj.chooseLanguages, list: ALL_LANGUAGES_LIST, source: sourceTitle });
        }
        
        if (obj.chooseTools) pendingChoices.push({ type: 'tool', count: 1, list: obj.chooseTools, source: sourceTitle, customTitle: "Escolha uma Ferramenta" });
        if (obj.chooseToolAny) pendingChoices.push({ type: 'tool', count: obj.chooseToolAny, list: ALL_TOOLS_LIST, source: sourceTitle, customTitle: "Escolha Ferramentas" });
        if (obj.chooseToolFrom) pendingChoices.push({ type: 'tool', count: 1, list: obj.chooseToolFrom, source: sourceTitle, customTitle: "Escolha uma Ferramenta" });

        if (obj.chooseToolFromList) {
            const listArr = Array.isArray(obj.chooseToolFromList) ? obj.chooseToolFromList : [obj.chooseToolFromList];
            listArr.forEach(req => {
                pendingChoices.push({ type: 'tool', count: req.count, list: req.list, source: sourceTitle, customTitle: `Escolha: ${req.title}` });
            });
        }
    };

    sources.forEach(source => {
        if (source && source.damage && source.type) { // Lógica para Dracônico/Ancestralidade
            const damageClean = source.damage.split('(')[0].trim();
            resToAdd.push(damageClean);
        } else {
            lerDados(source);
        }
    });

    const addUnique = (targetList, items) => {
        if (!state[targetList]) state[targetList] = [];
        items.forEach(i => { if (!state[targetList].includes(i)) state[targetList].push(i); });
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

    const runNextChoice = () => {
        if (pendingChoices.length === 0) {
            window.dispatchEvent(new CustomEvent('sheet-updated'));
            return;
        }
        const choice = pendingChoices.shift();
        const modalTitle = choice.customTitle ? `${choice.customTitle} (${choice.source})` : `Escolha ${choice.type} (${choice.source})`;

        if (choice.type === 'skill') {
            openGenericSelector(modalTitle, choice.count, choice.list, (selected) => {
                if (!state.pericias) state.pericias = {};
                selected.forEach(s => { if (state.pericias[s]) state.pericias[s].treinado = true; });
                saveStateToServer();
                runNextChoice();
            });
        }
        else if (choice.type === 'language') {
            // Filtra a lista de opções removendo "Comum" e o que já tem, para o visual ficar limpo
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
   SISTEMA DE RAÇAS
   ============================================================= */

function openRaceSelectionModal() {
    if (RACES_DB.length === 0) {
        carregarDadosHeader().then(() => {
            if (RACES_DB.length > 0) openRaceSelectionModal();
            else alert("Erro: Banco de raças vazio.");
        });
        return;
    }

    const existing = document.querySelector('.race-modal-overlay');
    if (existing) existing.remove();

    const racasComuns = RACES_DB.filter(r => !r.isLineage);
    const linhagens = RACES_DB.filter(r => r.isLineage);

    const gerarListaHTML = (lista) => lista.map(r => `<div class="race-list-item" data-name="${r.name}">${r.name}</div>`).join('');

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
    if (typeof checkScrollLock === 'function') checkScrollLock();

    let selectedRaceBase = null;
    let selectedVariation = null;

    const btnSelect = overlay.querySelector('#btn-select-race');
    const detailsContainer = overlay.querySelector('#race-details-content');

    overlay.querySelector('.modal-close').onclick = () => { overlay.remove(); checkScrollLock(); };
    overlay.querySelector('#btn-custom-race').onclick = () => { overlay.remove(); openCustomRaceCreator(); };

    btnSelect.onclick = () => {
        if (selectedRaceBase) {
            if (selectedRaceBase.isLineage) {
                overlay.remove();
                openAncestralRaceSelector(selectedRaceBase);
            } else {
                if (DRACONIC_ANCESTRIES[selectedRaceBase.name]) {
                    openDraconicSelector(selectedRaceBase, selectedVariation, null);
                } else {
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
        const imagePath = race.image || 'img/imagem-no-site/dado.png';

        const traitsHtml = race.traits.map(t => `<div class="race-trait-item"><div class="race-trait-name">${t.name}</div><div class="race-trait-desc">${t.desc}</div></div>`).join('');

        let variationsHtml = '';
        if (hasVariations) {
            const labelOpcional = isSubraceMandatory ? "(Obrigatório)" : "(Opcional)";
            variationsHtml = `
                <div class="race-traits-title" style="margin-top:25px; color:#ffeb3b; border-top:1px solid #333; padding-top:15px;">Sub-raças ${labelOpcional}</div>
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
                                ${v.traits ? v.traits.map(vt => `<div class="variation-feature-box"><div class="variation-feature-title">★ ${vt.name}</div><div class="variation-feature-content">${vt.desc}</div></div>`).join('') : ''}
                            </div>
                        </div>
                    `).join('')}
                </div>
            `;
        }

        detailsContainer.innerHTML = `
            <div class="race-detail-header">
                <div class="race-img-container" onclick="window.openImageLightbox('${imagePath}')"><img src="${imagePath}" class="race-img-display" onerror="this.src='img/imagem-no-site/dado.png'"></div>
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

        btnSelect.onclick = () => {
            if (race.isLineage) {
                const overlay = document.querySelector('.race-modal-overlay');
                if (overlay) overlay.remove();
                openAncestralRaceSelector(race);
            } else {
                if (DRACONIC_ANCESTRIES[race.name]) openDraconicSelector(race, currentSubrace, null);
                else {
                    aplicarRacaNaFicha(race, currentSubrace, null);
                    const overlay = document.querySelector('.race-modal-overlay');
                    if (overlay) overlay.remove();
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
                    } else {
                        radio.checked = true;
                        radio.setAttribute('data-checked', 'true');
                        currentSubrace = race.variations[idx];
                        btnSelect.removeAttribute('disabled');
                        btnSelect.textContent = `Selecionar ${currentSubrace.name}`;
                    }
                });
            });
        }
    }
}

/* =============================================================
   SISTEMA DE CLASSES
   ============================================================= */
let currentClassLevelPreview = 0;

/* =============================================================
   CORREÇÃO: FORÇAR SELEÇÃO EXPLÍCITA NO NÍVEL DA SUBCLASSE
   (Evita auto-seleção de subclasses "fantasmas" antigas)
============================================================= */

function openClassSelectionModal() {
    if (CLASSES_DB.length === 0) {
        carregarDadosHeader().then(() => {
            if (CLASSES_DB.length > 0) openClassSelectionModal();
            else alert("Erro: Banco de classes vazio.");
        });
        return;
    }

    const existing = document.querySelector('.race-modal-overlay');
    if (existing) existing.remove();

    const listHtml = CLASSES_DB.map(c => `<div class="race-list-item" data-name="${c.name}">${c.name}</div>`).join('');
    const overlay = document.createElement('div');
    overlay.className = 'spell-modal-overlay race-modal-overlay';
    overlay.style.zIndex = '12000'; // O modal normal fica em 12000

    // --- ALTERAÇÃO AQUI: Adicionamos o botão "Config Interna" no HTML do Header ---
    overlay.innerHTML = `
        <div class="spell-modal" style="width: 900px; height: 700px; max-height: 95vh;">
            <div class="modal-header" style="display:flex; align-items:center; justify-content:space-between;">
                <div style="display:flex; align-items:center; gap: 15px;">
                    <h3 style="margin:0;">Escolher Classe</h3>
                    <button id="btn-config-interna-modal" style="
                        background: #222; 
                        border: 1px solid #555; 
                        color: #bbb; 
                        border-radius: 4px; 
                        padding: 4px 10px; 
                        cursor: pointer; 
                        font-size: 11px; 
                        display:flex; 
                        align-items:center; 
                        gap:5px;
                        font-weight:bold;
                        text-transform:uppercase;
                        transition:0.2s;">
                        <span>⚙</span> Config Interna
                    </button>
                </div>
                <button class="modal-close">✖</button>
            </div>
            <div class="modal-body" style="padding: 0; overflow: hidden; display:flex; flex-direction:column; flex:1;">
                <div class="race-catalog-container" style="flex:1; overflow:hidden;">
                    <div class="race-list-col">${listHtml}</div>
                    <div class="race-details-col" id="class-details-content">
                        <div style="color: #666; text-align: center; margin-top: 50px;">Selecione uma classe para ver os detalhes.</div>
                    </div>
                </div>
            </div>
            <div class="modal-actions"><button id="btn-select-class" class="btn-add btn-save-modal" disabled>Selecionar</button></div>
        </div>
    `;

    document.body.appendChild(overlay);
    if (typeof checkScrollLock === 'function') checkScrollLock();

    // --- ALTERAÇÃO AQUI: Lógica do botão Config Interna ---
    const btnConfig = overlay.querySelector('#btn-config-interna-modal');
    btnConfig.onmouseenter = () => { btnConfig.style.background = '#333'; btnConfig.style.color = '#fff'; btnConfig.style.borderColor = '#9c27b0'; };
    btnConfig.onmouseleave = () => { btnConfig.style.background = '#222'; btnConfig.style.color = '#bbb'; btnConfig.style.borderColor = '#555'; };
    
    btnConfig.onclick = (e) => {
        // Verifica se a função global da esquerda existe
        if (typeof window.abrirPainelClasses === 'function') {
            window.abrirPainelClasses(btnConfig); // Passa o botão como referência para posição
        } else {
            alert("Painel lateral não carregado.");
        }
    };

    // ... Resto da lógica original do modal (Seleção, Detalhes, etc) ...
    let selectedClass = null;
    let selectedSubclass = null;
    const btnSelect = overlay.querySelector('#btn-select-class');
    const detailsContainer = overlay.querySelector('#class-details-content');

    overlay.querySelector('.modal-close').onclick = () => { overlay.remove(); checkScrollLock(); };

    const items = overlay.querySelectorAll('.race-list-item');
    items.forEach(item => {
        item.onclick = () => {
            selectedSubclass = null; 
            items.forEach(i => i.classList.remove('selected'));
            item.classList.add('selected');
            const className = item.getAttribute('data-name');
            selectedClass = CLASSES_DB.find(c => c.name === className);
            
            const classKey = selectedClass.name.toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "");
            const currentLevel = state.niveisClasses && state.niveisClasses[classKey] ? parseInt(state.niveisClasses[classKey]) : 0;
            currentClassLevelPreview = currentLevel + 1;
            renderClassDetails(selectedClass, currentClassLevelPreview);
        };
    });

    btnSelect.onclick = () => {
        if (selectedClass) {
            const sucesso = aplicarClasseNaFicha(selectedClass, selectedSubclass);
            if (sucesso) {
                overlay.remove();
                checkScrollLock();
            }
        }
    };

    function renderClassDetails(cls, simulatedLevel) {
        // (Copie a função renderClassDetails original que já estava aqui, sem alterações nela)
        // Se precisar eu reenvio, mas ela não muda.
        if (!cls) return;
        btnSelect.removeAttribute('disabled');
        btnSelect.textContent = `Selecionar ${cls.name} (Nível ${simulatedLevel})`;
        btnSelect.style.background = '#9c27b0';
        
        // ... (resto da renderização igual ao anterior) ...
        const imagePath = cls.image || 'img/imagem-no-site/dado.png';
        const subclassReqLevel = cls.subclass_level || 3;
        const canPickSubclass = simulatedLevel >= subclassReqLevel;

        let profHtml = '';
        if (cls.proficiencies) {
            if (cls.proficiencies.armor && cls.proficiencies.armor.length) profHtml += `<div><strong style="color:#e0aaff;">Armaduras:</strong> ${cls.proficiencies.armor.join(', ')}</div>`;
            if (cls.proficiencies.weapons && cls.proficiencies.weapons.length) profHtml += `<div><strong style="color:#e0aaff;">Armas:</strong> ${cls.proficiencies.weapons.join(', ')}</div>`;
            if (cls.proficiencies.tools && cls.proficiencies.tools.length) profHtml += `<div><strong style="color:#e0aaff;">Ferramentas:</strong> ${cls.proficiencies.tools.join(', ')}</div>`;
        }

        const traitsHtml = cls.features ? cls.features.map(t => `<div class="race-trait-item"><div class="race-trait-name">${t.name}</div><div class="race-trait-desc">${t.description}</div></div>`).join('') : '';

        /* =============================================================
   SUBSTITUA ESTE TRECHO DENTRO DE renderClassDetails
   NO ARQUIVO HeaderJS.js
============================================================= */

        let subclassesHtml = '';
        if (cls.subclasses && cls.subclasses.length > 0) {
            let lockMessage = '';
            const classKey = cls.name.toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "");
            const hasSaved = state.subclasses && state.subclasses[classKey];
            const isExactSelectionLevel = simulatedLevel === subclassReqLevel;

            // MENSAGENS DE STATUS (Topo da lista)
            if (!canPickSubclass) {
                lockMessage = `<div style="background:#330000; border:1px solid #d32f2f; color:#ff9999; padding:8px; margin-bottom:10px; border-radius:4px; font-size:12px; text-align:center;">🔒 Subclasses disponíveis para escolha no nível ${subclassReqLevel}.</div>`;
            } else if (isExactSelectionLevel && !hasSaved) {
                lockMessage = `<div style="background:#332a00; border:1px solid #ffeb3b; color:#ffeb3b; padding:8px; margin-bottom:10px; border-radius:4px; font-size:12px; text-align:center;">⚠ Nível ${subclassReqLevel}: Selecione sua Subclasse AGORA.</div>`;
            } else if (hasSaved) {
                lockMessage = `<div style="background:#1a3300; border:1px solid #4caf50; color:#a5d6a7; padding:8px; margin-bottom:10px; border-radius:4px; font-size:12px; text-align:center;">✔ Subclasse Definida: <strong>${hasSaved}</strong></div>`;
            }

            subclassesHtml = `
                    <div class="race-traits-title" style="margin-top:25px; color:#ffeb3b; border-top:1px solid #333; padding-top:15px;">Subclasses (Arquétipos/Juramentos)</div>
                    ${lockMessage}
                    <div class="variations-list" style="${!canPickSubclass ? 'opacity:0.8;' : ''}"> 
                        ${cls.subclasses.map((sub, idx) => {
                            // --- LÓGICA DA TRAVA (LOCK) ---
                            // 1. Verifica se esta é a opção salva atualmente
                            const isSelected = hasSaved === sub.name;
                            
                            // 2. Deve desabilitar se:
                            //    a) O nível for baixo (!canPickSubclass)
                            //    b) JÁ existe algo salvo E esta opção NÃO é a salva (Bloqueia as outras)
                            const shouldDisable = !canPickSubclass || (hasSaved && !isSelected);

                            // 3. Estilo visual para itens bloqueados (mais escuro e sem clique)
                            const styleBlocked = shouldDisable && hasSaved 
                                ? "opacity: 0.3; pointer-events: none; filter: grayscale(1);" 
                                : "cursor:pointer;";

                            return `
                            <div class="variation-card-wrapper ${isSelected ? 'open' : ''}" style="${styleBlocked}">
                                <div class="variation-header" data-idx="${idx}">
                                    <div style="display:flex; align-items:center; gap:10px; flex:1;">
                                        <input type="radio" 
                                            name="class_subclass" 
                                            value="${idx}" 
                                            id="sub_${idx}" 
                                            data-checked="${isSelected}" 
                                            ${isSelected ? 'checked' : ''} 
                                            ${shouldDisable ? 'disabled' : ''}
                                        >
                                        <span class="variation-name" style="${isSelected ? 'color:#a5d6a7;' : ''}">
                                            ${sub.name} ${isSelected ? '(Selecionado)' : ''}
                                        </span>
                                    </div>
                                    <span class="variation-arrow">▼</span>
                                </div>
                                <div class="variation-body">
                                    <div class="variation-desc-text">${sub.description || ''}</div>
                                    ${sub.features ? sub.features.map(feat => `<div class="variation-feature-box"><div class="variation-feature-title">★ ${feat.name}</div><div class="variation-feature-content">${feat.description}</div></div>`).join('') : ''}
                                </div>
                            </div>
                        `}).join('')}
                    </div>
                `;
        }

        detailsContainer.innerHTML = `
                <div class="race-detail-header">
                    <div class="race-img-container" onclick="window.openImageLightbox('${imagePath}')"><img src="${imagePath}" class="race-img-display" onerror="this.src='img/imagem-no-site/dado.png'"></div>
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
                    <div style="margin-top:6px; padding-top:6px; border-top:1px solid #333;"><strong style="color:#e0aaff;">Equipamento Sugerido (Apenas Nível 1):</strong><br> ${cls.equipment ? cls.equipment.join('<br>') : '-'}</div>
                </div>
                <div class="race-traits-title" style="margin-top:20px;">Características de Classe</div>
                <div>${traitsHtml}</div>
                ${subclassesHtml}
            `;

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


/* =============================================================
   SISTEMA DE NOTIFICAÇÃO PERSONALIZADA (TOAST)
   Adicione isso em qualquer lugar do seu arquivo (sugiro na seção UTILS)
============================================================= */

function exibirAvisoTemporario(mensagem) {
    // 1. Remove aviso anterior se houver (para não empilhar)
    const existente = document.querySelector('.custom-toast-warning');
    if (existente) existente.remove();

    // 2. Cria o CSS dinamicamente (se ainda não existir)
    if (!document.getElementById('toast-style')) {
        const style = document.createElement('style');
        style.id = 'toast-style';
        style.innerHTML = `
            .custom-toast-warning {
                position: fixed;
                top: 20px;
                left: 50%;
                transform: translateX(-50%);
                background-color: #1a1a1a;
                color: #fff;
                border: 1px solid #444;
                border-radius: 6px;
                padding: 15px 20px;
                box-shadow: 0 5px 20px rgba(0,0,0,0.8);
                z-index: 20000;
                min-width: 300px;
                max-width: 90%;
                text-align: center;
                font-family: sans-serif;
                font-size: 14px;
                overflow: hidden;
                animation: slideDown 0.3s ease-out;
            }
            .toast-progress {
                position: absolute;
                top: 0;
                left: 0;
                height: 4px;
                background-color: #9c27b0; /* Roxo */
                width: 100%;
                transition: width 5s linear; /* 5 segundos */
            }
            .toast-content {
                margin-top: 5px;
                line-height: 1.4;
            }
            @keyframes slideDown {
                from { top: -100px; opacity: 0; }
                to { top: 20px; opacity: 1; }
            }
            @keyframes fadeOut {
                from { opacity: 1; }
                to { opacity: 0; }
            }
        `;
        document.head.appendChild(style);
    }

    // 3. Cria o Elemento HTML
    const toast = document.createElement('div');
    toast.className = 'custom-toast-warning';
    toast.innerHTML = `
        <div class="toast-progress"></div>
        <div class="toast-content">
            <strong style="color:#e0aaff; display:block; margin-bottom:4px;">ATENÇÃO</strong>
            ${mensagem.replace(/\n/g, '<br>')}
        </div>
    `;

    document.body.appendChild(toast);

    // 4. Inicia a animação da barra
    // Pequeno delay para garantir que o CSS renderizou a largura 100% antes de ir a 0
    setTimeout(() => {
        const barra = toast.querySelector('.toast-progress');
        if(barra) barra.style.width = '0%';
    }, 50);

    // 5. Remove após 5 segundos
    setTimeout(() => {
        if (toast.parentElement) {
            toast.style.animation = 'fadeOut 0.5s ease-out';
            setTimeout(() => {
                if (toast.parentElement) toast.remove();
            }, 450);
        }
    }, 5000);
}


/* =============================================================
   APLICAR CLASSE NA FICHA
   ============================================================= */
function aplicarClasseNaFicha(cls, subCls) {
    if (typeof state === 'undefined') {
        if (typeof window.state !== 'undefined') state = window.state;
        else return false;
    }

    // Inicialização segura
    if (!state.niveisClasses) state.niveisClasses = {};
    if (!state.atributos) state.atributos = { n1: 10, n2: 10, n3: 10, n4: 10, n5: 10, n6: 10 };
    if (!state.pericias) state.pericias = {};
    if (!state.proficienciasList) state.proficienciasList = [];
    if (!state.idiomasList) state.idiomasList = []; 
    if (!state.inventory) state.inventory = [];

    // Forçar Idioma Comum
    if (!state.idiomasList.includes('Comum')) state.idiomasList.push('Comum');

    const classKey = cls.name.toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "");

    // Forçar Druídico/Gíria
    if ((classKey === 'druida' || classKey === 'druid') && !state.idiomasList.includes('Druídico')) state.idiomasList.push('Druídico');
    if ((classKey === 'ladino' || classKey === 'rogue') && !state.idiomasList.includes('Gíria de Ladrão')) state.idiomasList.push('Gíria de Ladrão');

    // Cálculos de Nível
    const currentLevelInClass = state.niveisClasses[classKey] ? parseInt(state.niveisClasses[classKey]) : 0;
    const newLevelInClass = currentLevelInClass + 1;
    
    let totalCharacterLevel = 0;
    if (state.niveisClasses) Object.values(state.niveisClasses).forEach(lvl => totalCharacterLevel += (parseInt(lvl) || 0));
    
    const isFirstLevelCharacter = (totalCharacterLevel === 0);
    const isMulticlassing = (totalCharacterLevel > 0 && currentLevelInClass === 0);
    const requiredLevel = cls.subclass_level || 3;

    // Validações de Subclasse
    if (subCls && newLevelInClass < requiredLevel) {
        if(typeof exibirAvisoTemporario === 'function') 
            exibirAvisoTemporario(`Nível insuficiente (${newLevelInClass}) para subclasse ${subCls.name}.<br>Requer nível ${requiredLevel}.`);
        else alert(`Nível insuficiente. Requer ${requiredLevel}.`);
        return false; 
    }

    if (newLevelInClass === requiredLevel && !subCls) {
        if(typeof exibirAvisoTemporario === 'function')
            exibirAvisoTemporario(`Você atingiu o nível ${requiredLevel} de ${cls.name}!<br>Selecione uma Subclasse.`);
        else alert("Selecione uma Subclasse!");
        return false;
    }
    else if (newLevelInClass > requiredLevel && !subCls) {
        const hasSaved = state.subclasses && state.subclasses[classKey];
        if (!hasSaved) {
             if(typeof exibirAvisoTemporario === 'function')
                exibirAvisoTemporario(`Nível ${newLevelInClass}: Selecione sua Subclasse salva.`);
             else alert("Selecione sua Subclasse.");
             return false;
        }
    }

    // Aplicação
    state.niveisClasses[classKey] = newLevelInClass;
    if (!state.ordemClasses) state.ordemClasses = [];
    if (!state.ordemClasses.includes(classKey)) state.ordemClasses.push(classKey);

    if (isFirstLevelCharacter) {
        state.hitDie = `d${cls.hit_die}`;
        if(!state.vidaDadosSalvos) state.vidaDadosSalvos = {};
        if(!state.vidaDadosSalvos['v1']) state.vidaDadosSalvos['v1'] = cls.hit_die; 
    }

    // --- ADICIONAR FEATURES DA CLASSE ---
    if (cls.features) {
        cls.features.forEach(feat => {
            const fLvl = feat.level || 1;
            const featNameLower = feat.name.toLowerCase();

            // Ignora Pactos Automáticos (Bruxo)
            if (classKey === 'bruxo' && featNameLower.includes('pacto d')) return; 

            // >>> FILTRO BLOOD HUNTER: NÃO ADICIONA AS MALDIÇÕES AUTOMATICAMENTE <<<
            if (classKey === 'blood hunter' || classKey === 'bloodhunter') {
                if (featNameLower.includes('maldição') || featNameLower.includes('maldicao') || featNameLower.includes('blood curse')) {
                    return; // Retorna aqui para não adicionar a feature genérica, vamos usar o modal abaixo
                }
            }

            if (fLvl <= newLevelInClass) addFeatureToState(feat, 'Classe', cls.name, '');
        });
    }

    // Adiciona Features da Subclasse
    const savedSubName = (state.subclasses && state.subclasses[classKey]) ? state.subclasses[classKey] : null;
    const subToApply = subCls || (savedSubName ? cls.subclasses.find(s => s.name === savedSubName) : null);

    if (subToApply) {
        if (!state.subclasses) state.subclasses = {};
        state.subclasses[classKey] = subToApply.name;
        
        if (subToApply.features) {
            subToApply.features.forEach(feat => {
                const fLvl = feat.level || requiredLevel;
                if (fLvl <= newLevelInClass) addFeatureToState(feat, 'Subclasse', cls.name, subToApply.name);
            });
        }
    }

    // --- MONTAGEM DA FILA DE ESCOLHAS (TASKS) ---
    const tasks = [];

    // TASK: BLOOD HUNTER - ESCOLHA DE MALDIÇÃO (Níveis 1, 6, 13, 17)
    if ((classKey === 'blood hunter' || classKey === 'bloodhunter') && [1, 6, 13, 17].includes(newLevelInClass)) {
        tasks.push((next) => {
            // Define quantas maldições ganha. Geralmente é 1 por vez nesses níveis.
            // Se for nível 1, escolhe 1. Se for nível 6, escolhe +1, etc.
            openBloodCurseSelector(1, (selectedCurses) => {
                selectedCurses.forEach(curse => {
                    addFeatureToState({
                        name: curse.name,
                        description: curse.desc,
                        level: newLevelInClass
                    }, 'Classe', 'Blood Hunter', '');
                });
                next();
            });
        });
    }

    // TASK: ESCOLHA DE PACTO (BRUXO NÍVEL 3)
    if (classKey === 'bruxo' && newLevelInClass === 3) {
        tasks.push((next) => {
            openGenericSelector("Escolha a Dádiva do Pacto", 1, Object.keys(DADIVAS_BRUXO_DB), (selected) => {
                const nomePacto = selected[0];
                if (nomePacto && DADIVAS_BRUXO_DB[nomePacto]) {
                    addFeatureToState({
                        name: nomePacto,
                        description: DADIVAS_BRUXO_DB[nomePacto],
                        level: 3
                    }, 'Classe', 'Bruxo', '');
                }
                next();
            });
        });
    }

    // CASO 1: PERSONAGEM NÍVEL 1 (CRIAÇÃO)
    if (isFirstLevelCharacter) {
        // Salvaguardas
        if (cls.saving_throws) {
            cls.saving_throws.forEach(attrName => {
                const key = `Salvaguarda (${attrName})`;
                if (state.pericias[key]) state.pericias[key].treinado = true;
                else state.pericias[key] = { atributo: attrName.substring(0,3).toUpperCase(), treinado: true, outros: 0 };
            });
        }

        // Perícias
        if (cls.skills_list && cls.skills_count > 0) {
            let lista = cls.skills_list;
            let titulo = `Perícias de ${cls.name}`;
            const temQualquer = lista.some(s => s.toLowerCase().includes("qualquer") || s.toLowerCase().includes("escolha"));
            if (cls.name === "Bardo" || temQualquer) {
                lista = ALL_SKILLS_LIST;
                titulo = `Perícias de ${cls.name} (Escolha Livre)`;
            }
            tasks.push((next) => openSkillSelector(cls.skills_count, titulo, lista, next));
        }

        // Equipamento
        if (cls.equipment && cls.equipment.length > 0) {
            tasks.push((next) => processarEquipamentoInicial(cls.equipment, next));
        }

        // Proficiências Fixas
        addProficiencias(cls.proficiencies);

        // Escolhas de Ferramentas
        if (cls.proficiencies && cls.proficiencies.tools) {
            cls.proficiencies.tools.forEach(toolStr => {
                const tLower = toolStr.toLowerCase();
                // Lógicas de ferramentas (mantidas do original)...
                if (tLower.includes("três instrumentos") || tLower.includes("tres instrumentos")) {
                    tasks.push((next) => openGenericSelector("Escolha 3 Instrumentos", 3, LISTA_INSTRUMENTOS, (sel) => {
                        sel.forEach(s => { if (!state.proficienciasList.includes(s)) state.proficienciasList.push(s); });
                        next();
                    }));
                }
                else if ((tLower.includes("artesão") || tLower.includes("artesao")) && tLower.includes("instrumento")) {
                    const listaMista = [...LISTA_FERRAMENTAS_ARTESAO, ...LISTA_INSTRUMENTOS].sort();
                    tasks.push((next) => openGenericSelector("Escolha: Ferramenta ou Instrumento", 1, listaMista, (sel) => {
                        sel.forEach(s => { if (!state.proficienciasList.includes(s)) state.proficienciasList.push(s); });
                        next();
                    }));
                }
                else if (tLower.includes("ferramenta de artesão") && (tLower.includes("uma") || tLower.includes("escolha") || tLower.includes("qualquer"))) {
                    tasks.push((next) => openGenericSelector("Escolha 1 Ferramenta", 1, LISTA_FERRAMENTAS_ARTESAO, (sel) => {
                        sel.forEach(s => { if (!state.proficienciasList.includes(s)) state.proficienciasList.push(s); });
                        next();
                    }));
                }
                else if (tLower.includes("instrumento musical") && (tLower.includes("um") || tLower.includes("escolha"))) {
                    tasks.push((next) => openGenericSelector("Escolha 1 Instrumento", 1, LISTA_INSTRUMENTOS, (sel) => {
                        sel.forEach(s => { if (!state.proficienciasList.includes(s)) state.proficienciasList.push(s); });
                        next();
                    }));
                }
            });
        }
    } 
    // CASO 2: MULTICLASSE
    else if (isMulticlassing) {
        let profsMC = { ...cls.proficiencies };
        if (profsMC.armor) profsMC.armor = profsMC.armor.filter(a => !a.toLowerCase().includes('pesada')); 
        addProficiencias(profsMC);

        if (classKey === 'bardo') {
            tasks.push((next) => openGenericSelector("Multiclasse Bardo: 1 Instrumento", 1, LISTA_INSTRUMENTOS, (sel) => {
                sel.forEach(s => { if (!state.proficienciasList.includes(s)) state.proficienciasList.push(s); });
                next();
            }));
        }

        if (['bardo', 'ladino', 'patrulheiro', 'ranger'].includes(classKey)) {
            let listaMC = cls.skills_list;
            if (classKey === 'bardo') listaMC = ALL_SKILLS_LIST;
            const qtd = (classKey === 'ladino' || classKey === 'ranger' || classKey === 'patrulheiro') ? 1 : 1;
            tasks.push((next) => openSkillSelector(qtd, `Multiclasse ${cls.name}`, listaMC, next));
        }
    }

    if (typeof saveStateToServer === 'function') saveStateToServer();
    atualizarTextoClassesHeader();
    window.dispatchEvent(new CustomEvent('sheet-updated'));

    if (tasks.length > 0) {
        setTimeout(() => {
            executarFila(tasks);
        }, 100); 
    }

    return true; 
}




/* =============================================================
   CORREÇÃO FINAL: SALVAGUARDAS DENTRO DE PERÍCIAS
   Substitua a função aplicarClasseNaFicha
============================================================= */



function executarFila(tasks) {
    if (tasks.length === 0) {
        window.dispatchEvent(new CustomEvent('sheet-updated'));
        return;
    }
    const currentTask = tasks.shift();
    // Se for processarEquipamentoInicial, ele aceita um segundo argumento como next
    // Se for openSkillSelector, ele aceita o next como callback
    if (currentTask.length === 1) { // Funções que recebem apenas 'next' (wrappers)
        currentTask(() => executarFila(tasks));
    } else {
        // Fallback genérico
        currentTask(() => executarFila(tasks));
    }
}

// --- UTILS ---
/* =============================================================
   CORREÇÃO: FILTRO DE PROFICIÊNCIAS GENÉRICAS
   Substitua a função addProficiencias (perto do final do código)
============================================================= */

/* =============================================================
   CORREÇÃO: FILTRO DE PROFICIÊNCIAS (HeaderJS.js)
============================================================= */
function addProficiencias(profObj) {
    if (!profObj) return;
    if (!state.proficienciasList) state.proficienciasList = [];

    const pushUnique = (arr, isToolList = false) => { 
        if (arr) arr.forEach(item => { 
            
            // LÓGICA DE FILTRO:
            if (isToolList) {
                const tLower = item.toLowerCase();
                // Palavras-chave para ignorar textos de instrução
                if (tLower.includes("escolha") || 
                    tLower.includes("qualquer") || 
                    tLower.includes("tipo de") || 
                    tLower.includes("um instrumento") || 
                    // CORREÇÃO MONGE: Filtra "1 Artesão ou Instrumento"
                    (tLower.includes("artesão") && tLower.includes("instrumento")) ||
                    tLower.includes("ou instrumento")) {
                    return; // Pula este item, não adiciona na ficha
                }
            }

            if (!state.proficienciasList.includes(item)) {
                state.proficienciasList.push(item); 
            }
        }); 
    };

    pushUnique(profObj.armor);
    pushUnique(profObj.weapons);
    pushUnique(profObj.tools, true); 
}

/* =============================================================
   CORREÇÃO: IMPORTAR STATUS DA CLASSE (HeaderJS.js)
   Substitua a função addFeatureToState inteira:
============================================================= */
function addFeatureToState(feat, category, clsName, subName) {
    if (!state.abilities) state.abilities = [];
    
    // Evita duplicatas pelo nome
    const exists = state.abilities.find(a => a.title === feat.name);
    
    if (!exists) {
        state.abilities.unshift({
            id: Date.now() + Math.floor(Math.random() * 100000),
            title: feat.name,
            description: feat.description,
            expanded: false,
            active: true, // Já entra ativa para aplicar os bônus
            category: category,
            class: clsName,
            subclass: subName,

            // --- CORREÇÃO: Puxar os dados matemáticos do JSON ---
            damage: feat.damage || "",
            damageType: feat.damageType || "",
            damageAttribute: feat.damageAttribute || "",
            
            attackBonus: feat.attackBonus || "",
            attackAttribute: feat.attackAttribute || "",
            useStandardAttack: !!feat.useStandardAttack,
            
            defenseBonus: feat.defenseBonus || "", // Importante para CA
            speedBonus: feat.speedBonus || "",     // Importante para Deslocamento
            saveDC: feat.saveDC || ""
        });
    }
}


/* =============================================================
   SISTEMA UNIFICADO DE PROCESSAMENTO DE EQUIPAMENTOS
   ============================================================= */

// 1. Entrada de Equipamentos (Wrapper)
function processarEquipamentoInicial(equipList, callbackFinal) {
    if (!equipList || equipList.length === 0) {
        if(callbackFinal) callbackFinal();
        else window.dispatchEvent(new CustomEvent('sheet-updated'));
        return;
    }
    processarListaEquipamentos(equipList, 0, callbackFinal);
}

// 2. Processador Recursivo
function processarListaEquipamentos(lista, index, callbackFinal) {
    if (!lista || index >= lista.length) {
        if (callbackFinal) callbackFinal();
        return;
    }

    const itemStr = lista[index];
    const nextStep = () => processarListaEquipamentos(lista, index + 1, callbackFinal);

    // 3 opções
    const regex3Options = /\(a\)\s*(.+?)[,;]?\s+\(b\)\s*(.+?)[,;]?\s+(?:ou)\s*\(c\)\s*(.+)/i;
    const match3 = itemStr.match(regex3Options);

    if (match3) {
        openEquipmentChoiceModal("Escolha uma das opções:", match3[1].trim(), match3[2].trim(), match3[3].trim(), (choice) => {
            processarEscolhaComplexa(choice, nextStep);
        });
        return;
    }

    // 2 opções
    const regex2Options = /\(a\)\s*(.+?)\s+(?:ou)\s+\(b\)\s*(.+)/i;
    const match2 = itemStr.match(regex2Options);

    if (match2) {
        openEquipmentChoiceModal("Escolha uma das opções:", match2[1].trim(), match2[2].trim(), null, (choice) => {
            processarEscolhaComplexa(choice, nextStep);
        });
        return;
    }

    processarEscolhaComplexa(itemStr, nextStep);
}


// 4. Verificador de Genéricos (ATUALIZADO)
function verificarItemGenerico(nomeItem, callbackNext) {
    const nomeLower = nomeItem.toLowerCase();
    
    let listaOpcoes = null;
    let tituloModal = "";
    let quantidade = 1;

    // --- PRIORIDADE 1: VERIFICA QUANTIDADES ESPECÍFICAS (2 ou mais) ---

    // 1. Detecta "Duas armas marciais" ou "2 armas marciais"
    if (/(?:duas|2)\s+armas?\s+marciais?/i.test(nomeLower)) {
        listaOpcoes = LISTA_ARMAS_MARCIAIS;
        tituloModal = "Escolha 2 Armas Marciais";
        quantidade = 2;
    }
    // 2. Detecta "Duas armas simples" ou "2 armas simples"
    else if (/(?:duas|2)\s+armas?\s+simples?/i.test(nomeLower)) {
        listaOpcoes = LISTA_ARMAS_SIMPLES;
        tituloModal = "Escolha 2 Armas Simples";
        quantidade = 2;
    }

    // --- PRIORIDADE 2: VERIFICA UNIDADES (Genérico ou Singular) ---
    // Agora aceita apenas "Arma marcial" ou "Arma simples" sem exigir "uma" ou "qualquer"

    // 3. Arma Marcial (Qualquer menção que sobrou)
    else if (nomeLower.includes("arma marcial") || nomeLower.includes("armas marciais")) { 
        listaOpcoes = LISTA_ARMAS_MARCIAIS; 
        tituloModal = "Escolha uma Arma Marcial";
        quantidade = 1;
    }
    // 4. Arma Simples (Qualquer menção que sobrou)
    else if (nomeLower.includes("arma simples") || nomeLower.includes("armas simples")) { 
        listaOpcoes = LISTA_ARMAS_SIMPLES; 
        tituloModal = "Escolha uma Arma Simples"; 
        quantidade = 1;
    }
    // 5. Instrumentos
    else if (nomeLower.includes("instrumento musical")) { 
        listaOpcoes = LISTA_INSTRUMENTOS; 
        tituloModal = "Escolha um Instrumento"; 
        quantidade = 1;
    }
    // 6. Ferramentas
    else if (nomeLower.includes("ferramenta de artesão") || nomeLower.includes("ferramenta de artesao")) { 
        listaOpcoes = LISTA_FERRAMENTAS_ARTESAO; 
        tituloModal = "Escolha uma Ferramenta"; 
        quantidade = 1;
    }

    // --- EXECUÇÃO ---
    if (listaOpcoes) {
        openGenericSelector(tituloModal, quantidade, listaOpcoes, (selected) => {
            if (selected && selected.length > 0) {
                selected.forEach(s => adicionarItemAoInventario(s));
            }
            callbackNext();
        });
    } else {
        // Se não for genérico, adiciona direto
        adicionarItemAoInventario(nomeItem);
        callbackNext();
    }
}


/* =============================================================
   CORREÇÃO AVANÇADA: PARSER DE LISTAS E QUANTIDADES POR EXTENSO
   Substitua processarEscolhaComplexa, adicionarItemAoInventario e buscarItemNoBanco
============================================================= */

// 3. Parser de String Complexa (Agora entende "Item A e Item B")
function processarEscolhaComplexa(choice, callbackNext) {
    // Remove marcadores (a), (b), (c)
    let cleanChoice = choice.replace(/\([abc]\)/gi, "").trim();
    
    // TRUQUE: Transforma " e " em vírgula para separar itens compostos
    // Ex: "Um kit de aventureiro e quatro azagaias" vira "Um kit de aventureiro, quatro azagaias"
    cleanChoice = cleanChoice.replace(/\s+e\s+/gi, ","); 
    
    // Quebra nas vírgulas
    const subItems = cleanChoice.split(",").map(s => s.trim()).filter(s => s !== "");
    
    let subQueue = [...subItems];
    function runSubQueue() {
        if (subQueue.length === 0) { callbackNext(); return; }
        const si = subQueue.shift();
        verificarItemGenerico(si, () => runSubQueue());
    }
    runSubQueue();
}
/* =============================================================
   CORREÇÃO: AGRUPAR DARDO E AZAGAIA (MESMO SENDO ARMAS)
   Substitua a função adicionarItemAoInventario (Seção UTILS)
============================================================= */

function adicionarItemAoInventario(nomeItemBruto) {
    if (!state.inventory) state.inventory = [];
    
    let nome = nomeItemBruto.trim().replace(/[.;]$/, ''); 
    let repeticoes = 1;

    // 1. Detecta quantidade por extenso ou dígito
    const numerosTexto = { 
        'um': 1, 'uma': 1, 'dois': 2, 'duas': 2, 'tres': 3, 'três': 3, 
        'quatro': 4, 'cinco': 5, 'seis': 6, 'dez': 10, 'vinte': 20 
    };
    
    const primeiraPalavra = nome.split(' ')[0].toLowerCase();

    if (numerosTexto[primeiraPalavra]) {
        repeticoes = numerosTexto[primeiraPalavra];
        nome = nome.substring(primeiraPalavra.length).trim(); 
    } else {
        const matchNumero = nome.match(/^(\d+)\s*(?:x\s*|\s+)?/);
        if (matchNumero) {
            repeticoes = parseInt(matchNumero[1]);
            nome = nome.replace(matchNumero[0], '').trim(); 
        }
    }

    // 2. Limpeza do nome
    nome = nome.replace(/^(de|do|da|os|as|uns|umas)\s+/i, '');
    let nomeBusca = nome;
    
    // Tenta achar o item no banco
    let itemDb = buscarItemNoBanco(nomeBusca);
    if (!itemDb && nomeBusca.endsWith('s')) {
        itemDb = buscarItemNoBanco(nomeBusca.slice(0, -1));
    }

    // --- LÓGICA DE SEPARAÇÃO ---
    
    // Verifica se é uma exceção que DEVE agrupar (Dardos, Azagaias, etc)
    const nomeLower = itemDb ? itemDb.name.toLowerCase() : nomeBusca.toLowerCase();
    const deveAgrupar = nomeLower.includes('dardo') || nomeLower.includes('azagaia');

    // Verifica se é Equipamento (Arma/Armadura)
    const isEquipmentType = itemDb && (itemDb.type === 'Arma' || itemDb.type === 'Proteção' || itemDb.type === 'protecao');

    // Só faz o loop (separar itens) se for equipamento E NÃO for uma das exceções
    if (isEquipmentType && !deveAgrupar) {
        
        // LÓGICA PARA ARMAS/ARMADURAS PADRÃO: Loop para criar itens individuais
        for (let i = 0; i < repeticoes; i++) {
            const novoItem = JSON.parse(JSON.stringify(itemDb));
            novoItem.id = Date.now() + Math.floor(Math.random() * 100000) + i;
            novoItem.quantity = 1; 
            state.inventory.push(novoItem);
        }

    } else {
        // LÓGICA PARA GERAIS + EXCEÇÕES (Dardos/Azagaias): Agrupa em um só (xQtd)
        if (itemDb) {
            const novoItem = JSON.parse(JSON.stringify(itemDb));
            novoItem.id = Date.now() + Math.floor(Math.random() * 100000);
            
            if (repeticoes > 1) {
                novoItem.name = `${novoItem.name} (x${repeticoes})`;
                novoItem.quantity = repeticoes; 
            } else {
                novoItem.quantity = 1;
            }
            state.inventory.push(novoItem);
        } else {
            // Item genérico não encontrado no banco
            const nomeFinal = repeticoes > 1 ? `${nome.charAt(0).toUpperCase() + nome.slice(1)} (x${repeticoes})` : nome.charAt(0).toUpperCase() + nome.slice(1);
            
            state.inventory.push({
                id: Date.now() + Math.floor(Math.random() * 100000),
                name: nomeFinal,
                type: "Equipamento",
                quantity: repeticoes,
                weight: 0,
                description: "Item adicionado."
            });
        }
    }

    // 4. ATUALIZAÇÃO IMEDIATA
    if (typeof saveStateToServer === 'function') saveStateToServer();
    
    window.dispatchEvent(new CustomEvent('sheet-updated'));
    setTimeout(() => {
        window.dispatchEvent(new CustomEvent('sheet-updated'));
    }, 50);
}

// 6. Busca Item no Banco (Lida com Plurais: Azagaias -> Azagaia)
function buscarItemNoBanco(nomeItem) {
    if (!items || items.length === 0) return null;
    
    const norm = (str) => str.normalize("NFD").replace(/[\u0300-\u036f]/g, "").toLowerCase().trim();
    
    // Limpa multiplicadores que possam ter sobrado na string
    let cleanName = nomeItem.replace(/^\d+\s*[x\s]+\s*/i, '');
    let alvo = norm(cleanName);

    // 1. Busca Exata
    let itemEncontrado = items.find(i => norm(i.name) === alvo);

    // 2. Busca Singular (Remove 's' ou 'es')
    if (!itemEncontrado) {
        if (alvo.endsWith('s')) {
            // Tenta remover apenas 's' (Machadinhas -> Machadinha)
            let alvoSingular = alvo.slice(0, -1);
            itemEncontrado = items.find(i => norm(i.name) === alvoSingular);

            // Tenta remover 'es' (Simples -> Simpl, não funciona, mas Aneis -> Anel sim se fosse Aneis)
            // Lógica simples para palavras como "Virotes" -> "Virote"
            if (!itemEncontrado && alvo.endsWith('es')) {
                 alvoSingular = alvo.slice(0, -2);
                 itemEncontrado = items.find(i => norm(i.name) === alvoSingular);
            }
        }
    }

    // 3. Busca por "Contém" (Fallback)
    if (!itemEncontrado) {
        // Procura se o nome do item no banco está dentro do que foi pedido
        // Ex: Pediu "Pacote de Aventureiro", banco tem "Pacote de Aventureiro (Dungeons)"
        itemEncontrado = items.find(i => norm(i.name).includes(alvo));
        
        // Ou o inverso: Pediu "Espada Longa Versátil", banco tem "Espada Longa"
        if (!itemEncontrado) {
            itemEncontrado = items.find(i => alvo.includes(norm(i.name)) && norm(i.name).length > 3);
        }
    }

    return itemEncontrado;
}


// 7. Modal de Opções de Equipamento
function openEquipmentChoiceModal(title, optionA, optionB, optionC, callback) {
    const overlay = document.createElement('div');
    overlay.className = 'spell-modal-overlay race-modal-overlay';
    overlay.style.zIndex = '51000';

    let htmlButtons = `
        <button class="btn-equip-opt btn-add" data-choice="${optionA}" style="flex:1; background:#1a1a1a; border:1px solid #444; padding:15px; text-align:left; display:flex; flex-direction:column; gap:5px; transition:0.2s;">
            <strong style="color:#9c27b0; font-size:14px; text-transform:uppercase;">Opção A</strong><span style="color:#fff; font-size:13px; line-height:1.4;">${optionA}</span>
        </button>
        <div style="display:flex; align-items:center; font-weight:bold; color:#666;">OU</div>
        <button class="btn-equip-opt btn-add" data-choice="${optionB}" style="flex:1; background:#1a1a1a; border:1px solid #444; padding:15px; text-align:left; display:flex; flex-direction:column; gap:5px; transition:0.2s;">
            <strong style="color:#9c27b0; font-size:14px; text-transform:uppercase;">Opção B</strong><span style="color:#fff; font-size:13px; line-height:1.4;">${optionB}</span>
        </button>
    `;

    if (optionC) {
        htmlButtons += `
            <div style="display:flex; align-items:center; font-weight:bold; color:#666;">OU</div>
            <button class="btn-equip-opt btn-add" data-choice="${optionC}" style="flex:1; background:#1a1a1a; border:1px solid #444; padding:15px; text-align:left; display:flex; flex-direction:column; gap:5px; transition:0.2s;">
                <strong style="color:#9c27b0; font-size:14px; text-transform:uppercase;">Opção C</strong><span style="color:#fff; font-size:13px; line-height:1.4;">${optionC}</span>
            </button>
        `;
    }

    overlay.innerHTML = `
        <div class="spell-modal" style="width: ${optionC ? '800px' : '600px'}; height: auto;">
            <div class="modal-header"><h3>Escolha de Equipamento</h3></div>
            <div class="modal-body" style="padding: 20px;">
                <p style="color:#e0aaff; margin-bottom:20px; text-align:center; font-size:16px;">${title}</p>
                <div style="display:flex; gap:10px; justify-content:center; align-items:stretch;">${htmlButtons}</div>
            </div>
        </div>
    `;

    document.body.appendChild(overlay);
    if (typeof checkScrollLock === 'function') checkScrollLock();

    const buttons = overlay.querySelectorAll('.btn-equip-opt');
    buttons.forEach(btn => {
        btn.onmouseenter = () => btn.style.borderColor = '#9c27b0';
        btn.onmouseleave = () => btn.style.borderColor = '#444';
        btn.onclick = () => {
            const choice = btn.getAttribute('data-choice');
            callback(choice);
            overlay.remove();
            if (typeof checkScrollLock === 'function') checkScrollLock();
        };
    });
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
            <div class="modal-header"><h3>Escolha sua Herança</h3><button class="modal-close">✖</button></div>
            <div class="modal-body" style="padding: 15px; overflow-y: auto;">
                <div style="font-size:13px; color:#ccc; margin-bottom:15px;">Selecione o tipo de dragão.</div>
                <div style="display:flex; flex-direction:column;">${optionsHtml}</div>
            </div>
            <div class="modal-actions"><button id="btn-confirm-draconic" class="btn-add btn-save-modal" disabled style="background:#444;">Confirmar</button></div>
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
            if (typeof checkScrollLock === 'function') checkScrollLock();
        }
    };
}

/* =============================================================
   SELETOR DE MALDIÇÕES DE SANGUE (COM DESCRIÇÃO)
============================================================= */
function openBloodCurseSelector(count, onConfirmCallback) {
    const overlay = document.createElement('div');
    overlay.className = 'spell-modal-overlay race-modal-overlay';
    overlay.style.zIndex = '50000';

    // 1. Filtra o que já tem
    const knownCurses = state.abilities ? state.abilities.map(a => a.title) : [];
    
    // Gera o HTML das opções
    const optionsHtml = BLOOD_CURSES_DB.map((curse, idx) => {
        const isKnown = knownCurses.includes(curse.name);
        
        // Se já tem, fica desabilitado visualmente
        const styleWrapper = isKnown 
            ? "opacity:0.5; border:1px solid #333; pointer-events:none;" 
            : "border:1px solid #444; cursor:pointer;";

        return `
            <label class="variation-card-wrapper curse-option" style="${styleWrapper} display:flex; align-items:flex-start; padding:10px; gap:10px; margin-bottom:8px;">
                <div style="padding-top:2px;">
                    <input type="checkbox" value="${idx}" class="curse-check" ${isKnown ? 'checked disabled' : ''} style="accent-color:#b71c1c; transform:scale(1.2);">
                </div>
                <div style="flex:1;">
                    <div style="color:${isKnown ? '#888' : '#ff5252'}; font-weight:bold; font-size:14px;">
                        ${curse.name} ${isKnown ? '<small>(Já possui)</small>' : ''}
                    </div>
                    <div style="color:#ccc; font-size:12px; margin-top:4px; line-height:1.4;">
                        ${curse.desc}
                    </div>
                </div>
            </label>
        `;
    }).join('');

    overlay.innerHTML = `
        <div class="spell-modal" style="width: 500px; height: 80vh; display:flex; flex-direction:column;">
            <div class="modal-header">
                <h3>Escolha sua(s) Maldição(ões)</h3>
            </div>
            <div class="modal-body" style="padding: 15px; overflow-y: auto; flex:1;">
                <div style="font-size:13px; color:#aaa; margin-bottom:15px; text-align:center;">
                    Selecione <strong>${count}</strong> nova(s) maldição(ões) de sangue.
                    <div id="curse-counter" style="color:#fff; font-weight:bold; margin-top:5px;">0/${count}</div>
                </div>
                <div style="display:flex; flex-direction:column;">${optionsHtml}</div>
            </div>
            <div class="modal-actions">
                <button id="btn-confirm-curse" class="btn-add btn-save-modal" disabled style="background:#444;">Confirmar</button>
            </div>
        </div>
    `;

    document.body.appendChild(overlay);

    const btnConfirm = overlay.querySelector('#btn-confirm-curse');
    const counterDisplay = overlay.querySelector('#curse-counter');
    const checkboxes = overlay.querySelectorAll('.curse-check:not(:disabled)'); // Apenas os selecionáveis

    const updateSelection = () => {
        const selected = overlay.querySelectorAll('.curse-check:not(:disabled):checked');
        const qtd = selected.length;
        counterDisplay.textContent = `${qtd}/${count}`;

        if (qtd >= count) {
            btnConfirm.removeAttribute('disabled');
            btnConfirm.style.background = '#b71c1c'; // Vermelho sangue
            
            // Desabilita os não marcados para não passar do limite
            checkboxes.forEach(chk => {
                if (!chk.checked) {
                    chk.disabled = true;
                    chk.closest('.curse-option').style.opacity = '0.5';
                }
            });
        } else {
            btnConfirm.setAttribute('disabled', true);
            btnConfirm.style.background = '#444';
            
            // Reabilita
            checkboxes.forEach(chk => {
                chk.disabled = false;
                chk.closest('.curse-option').style.opacity = '1';
            });
        }
    };

    checkboxes.forEach(chk => chk.addEventListener('change', updateSelection));

    btnConfirm.onclick = () => {
        const selectedIndices = Array.from(overlay.querySelectorAll('.curse-check:not(:disabled):checked')).map(c => parseInt(c.value));
        const selectedCurses = selectedIndices.map(idx => BLOOD_CURSES_DB[idx]);
        
        onConfirmCallback(selectedCurses);
        overlay.remove();
    };
}


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
                    <div class="race-list-col">${listHtml}</div>
                    <div class="race-details-col" id="ancestral-details-content">
                        <div style="color: #666; text-align: center; margin-top: 50px;">Selecione a raça ancestral.</div>
                    </div>
                </div>
            </div>
            <div class="modal-actions"><button id="btn-confirm-ancestral" class="btn-add btn-save-modal" disabled>Confirmar</button></div>
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

        const imagePath = race.image || 'img/imagem-no-site/dado.png';
        detailsContainer.innerHTML = `
            <div class="race-detail-header">
                <div class="race-img-container" onclick="window.openImageLightbox('${imagePath}')" title="Clique para ampliar">
                    <img src="${imagePath}" class="race-img-display" onerror="this.src='img/imagem-no-site/dado.png'">
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

function aplicarRacaNaFicha(raceData, variationData, lineageData, ancestryData = null) {
    if (typeof state === 'undefined') return;

    let nomeFinal = raceData.name;
    let extras = [];
    if (lineageData) extras.push(lineageData.name);
    if (variationData) extras.push(variationData.name);
    if (ancestryData) extras.push(ancestryData.label);

    if (extras.length > 0) nomeFinal += ` (${extras.join(' - ')})`;

    state.raca = nomeFinal;
    state.subRaca = variationData ? variationData.name : (lineageData ? lineageData.name : "");

    const sourceData = lineageData || variationData || raceData;
    state.racaTipo = lineageData ? lineageData.type : (sourceData.type || raceData.type);
    state.racaTamanho = lineageData ? lineageData.size : (sourceData.size || raceData.size);

    state.metros = (lineageData && lineageData.speed)
        ? lineageData.speed
        : ((variationData && variationData.speed) ? variationData.speed : raceData.speed);

    state.deslocamentoVoo = (lineageData && lineageData.flySpeed)
        ? lineageData.flySpeed
        : ((variationData && variationData.flySpeed) ? variationData.flySpeed : (raceData.flySpeed || 0));

    if (!state.abilities) state.abilities = [];
    state.abilities = state.abilities.filter(a => a.category !== 'Raça');

    let traitsToRemove = [];
    if (variationData && variationData.replaces) traitsToRemove = traitsToRemove.concat(variationData.replaces);
    if (lineageData && lineageData.replaces) traitsToRemove = traitsToRemove.concat(lineageData.replaces);

    let traitsToAdd = [];

    if (raceData.traits) {
        let baseTraits = raceData.traits
            .filter(t => !traitsToRemove.includes(t.name))
            .map(t => ({ ...t, origin: raceData.name }));

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

    if (variationData && variationData.traits) traitsToAdd = traitsToAdd.concat(variationData.traits.map(t => ({ ...t, origin: variationData.name })));
    if (lineageData && lineageData.traits) traitsToAdd = traitsToAdd.concat(lineageData.traits.map(t => ({ ...t, origin: lineageData.name })));

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
    processarMecanicas(raceData, variationData, lineageData, ancestryData);

    atualizarHeader();
    if (typeof saveStateToServer === 'function') saveStateToServer();
    window.dispatchEvent(new CustomEvent('sheet-updated'));
}

function checkScrollLock() {
    const activeModals = document.querySelectorAll('.spell-modal-overlay, .race-modal-overlay, .lightbox-overlay');
    document.body.style.overflow = activeModals.length > 0 ? 'hidden' : '';
}

function openCustomRaceCreator() {
    const overlay = document.createElement('div');
    overlay.className = 'spell-modal-overlay race-modal-overlay';
    overlay.style.zIndex = '12100';
    if (typeof checkScrollLock === 'function') checkScrollLock();

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
                    if (chk.checked && !inp.value) inp.value = 9;
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
                if (div.querySelector('.remove-trait-btn')) div.querySelector('.remove-trait-btn').onclick = () => div.remove();
                container.appendChild(div);
            };
            if (customRaceData.traits.length) customRaceData.traits.forEach(t => addTraitInput(t.name, t.desc)); else { addTraitInput(); addTraitInput(); }
            contentDiv.querySelector('#btn-add-more-trait').onclick = () => addTraitInput();
        }
    }

    overlay.innerHTML = `<div class="spell-modal" style="width:500px;height:600px;max-height:90vh;"><div class="modal-header"><h3>Criar Raça Customizada</h3><button class="modal-close">✖</button></div><div class="wizard-container"><div class="wizard-step-indicator"><div class="step-dot"></div><div class="step-dot"></div><div class="step-dot"></div><div class="step-dot"></div></div><div id="wizard-content-area" class="wizard-content"></div><div class="wizard-btn-row"><button id="btn-wizard-prev" class="btn-add" style="background:transparent;border:1px solid #444;color:#aaa;">Voltar</button><button id="btn-wizard-next" class="btn-add">Próximo</button></div></div></div>`;
    document.body.appendChild(overlay);
    renderWizardContent();

    overlay.querySelector('.modal-close').onclick = () => { overlay.remove(); if (typeof checkScrollLock === 'function') checkScrollLock(); };

    overlay.querySelector('#btn-wizard-next').onclick = () => {
        if (currentStep === 1) { customRaceData.name = overlay.querySelector('#custom-race-name').value; currentStep++; }
        else if (currentStep === 2) {
            customRaceData.speed = overlay.querySelector('#race-speed-input').value;
            const flyInput = overlay.querySelector('#race-fly-input');
            if (flyInput) customRaceData.flySpeed = flyInput.value;
            currentStep++;
        }
        else if (currentStep === 3) { customRaceData.description = overlay.querySelector('#custom-race-desc').value; currentStep++; }
        else {
            customRaceData.traits = [];
            overlay.querySelectorAll('.wizard-trait-box').forEach(box => {
                const n = box.querySelector('.trait-name-input').value.trim();
                const d = box.querySelector('.trait-desc-input').value.trim();
                if (n) customRaceData.traits.push({ name: n, desc: d });
            });
            aplicarRacaNaFicha(customRaceData, null, null);
            overlay.remove();
            if (typeof checkScrollLock === 'function') checkScrollLock();
        }
        renderWizardContent();
    };
    overlay.querySelector('#btn-wizard-prev').onclick = () => { if (currentStep > 1) { currentStep--; renderWizardContent(); } };
}

window.openImageLightbox = function (imgSrc) {
    const existing = document.querySelector('.lightbox-overlay');
    if (existing) existing.remove();
    const overlay = document.createElement('div');
    overlay.className = 'lightbox-overlay';
    overlay.innerHTML = `<div class="lightbox-content"><span class="lightbox-close">✖</span><img src="${imgSrc}" class="lightbox-image-full" alt="Zoom"></div>`;
    overlay.onclick = function (e) { if (e.target.classList.contains('lightbox-overlay') || e.target.classList.contains('lightbox-close')) overlay.remove(); };
    document.body.appendChild(overlay);
};



// ... (todo o código anterior do HeaderJS.js)

/* =============================================================
   SISTEMA DE ALINHAMENTO (GRID 3x3)
   Cole isso no final do arquivo HeaderJS.js
============================================================= */
function openAlignmentModal() {
    const overlay = document.createElement('div');
    overlay.className = 'spell-modal-overlay race-modal-overlay';
    overlay.style.zIndex = '55000';

    // Gera os 9 cards do grid
    const gridHtml = ALIGNMENT_DATA.map(align => {
        // Verifica se é o selecionado atual
        const isActive = state.alinhamento === align.title ? 'active' : '';
        return `
            <div class="alignment-option-card ${isActive}" onclick="selectAlignment('${align.title}')">
                <div class="alignment-sigla">${align.sigla}</div>
                <div class="alignment-title" style="z-index:1;">${align.title.replace(' e ', '<br><span style="font-size:10px; color:#888;">E</span><br>')}</div>
            </div>
        `;
    }).join('');

    overlay.innerHTML = `
        <div class="spell-modal" style="width: 500px; height: 500px;">
            <div class="modal-header">
                <h3>Definir Alinhamento</h3>
                <button class="modal-close">✖</button>
            </div>
            <div class="modal-body" style="padding: 0; overflow: hidden;">
                <div class="alignment-grid-container">
                    ${gridHtml}
                </div>
            </div>
        </div>
    `;

    document.body.appendChild(overlay);
    if (typeof checkScrollLock === 'function') checkScrollLock();

    // Evento de fechar
    overlay.querySelector('.modal-close').onclick = () => { overlay.remove(); checkScrollLock(); };

    // Função de seleção
    window.selectAlignment = (valor) => {
        state.alinhamento = valor;
        
        // Atualiza visual
        const btnAlign = document.getElementById('btn-alinhamento');
        if(btnAlign) btnAlign.textContent = valor;

        // Salva
        if (typeof saveStateToServer === 'function') saveStateToServer();
        window.dispatchEvent(new CustomEvent('sheet-updated'));

        // Fecha modal
        overlay.remove();
        checkScrollLock();
        delete window.selectAlignment; // Limpa função global
    };
}


/* =============================================================
   FUNÇÕES DO POPUP DE CONFIGURAÇÃO DA FOTO
============================================================= */

function toggleConfigPopup(event) {
    event.stopPropagation(); // Impede que o clique feche imediatamente
    const popup = document.getElementById('popup-config-foto');
    
    // Se estiver visível, esconde. Se estiver escondido, mostra (usando flex para respeitar a coluna)
    if (popup.style.display === 'flex') {
        popup.style.display = 'none';
    } else {
        popup.style.display = 'flex';
    }
}

// Fecha o popup se o usuário clicar em qualquer outro lugar da tela
document.addEventListener('click', function(event) {
    const popup = document.getElementById('popup-config-foto');
    const btn = document.querySelector('.btn-config-foto');
    
    if (popup && popup.style.display === 'flex') {
        // Se o clique não foi no popup nem no botão de abrir, fecha o popup
        if (!popup.contains(event.target) && event.target !== btn) {
            popup.style.display = 'none';
        }
    }
});

// Evento para fechar o popup ao clicar em qualquer outro lugar da tela
document.addEventListener('click', function(event) {
    const popup = document.getElementById('popup-config-foto');
    const btn = document.querySelector('.btn-config-foto');
    
    // Se o popup existe, está visível, e o clique NÃO foi nele nem no botão de abrir
    if (popup && popup.style.display === 'flex' && !popup.contains(event.target) && event.target !== btn) {
        popup.style.display = 'none';
    }
});

/* =============================================================
   SISTEMA DE HISTÓRICO DE DADOS E AJUDA (GERADOS DINAMICAMENTE)
============================================================= */

// 1. MODAL DE AJUDA
function abrirAjudaSistema() {
    document.getElementById('popup-config-foto').style.display = 'none';

    // Remove se já existir
    const existing = document.querySelector('.ajuda-modal-overlay');
    if (existing) existing.remove();

    const overlay = document.createElement('div');
    overlay.className = 'spell-modal-overlay ajuda-modal-overlay';
    overlay.style.zIndex = '60000';

    overlay.innerHTML = `
        <div class="spell-modal" style="width: 800px; height: 80vh; display:flex; flex-direction:column;">
            <div class="modal-header" style="display: flex; justify-content: space-between; align-items: center;">
                <h3>❓ Ajuda sobre o Sistema</h3>
                <button class="modal-close">✖</button>
            </div>
            <div class="modal-body" style="padding: 20px; overflow-y: auto; flex:1;">
                <div style="margin-bottom: 20px;">
                    <input type="text" id="pesquisa-ajuda" placeholder="🔍 Pesquisar na ajuda..." 
                           style="width: 100%; padding: 12px; background: #111; color: #fff; border: 1px solid #444; border-radius: 6px; font-size: 16px;">
                </div>
                <div class="grid-ajuda">
                    <div class="card-ajuda">
                        <h4>Como rolar dados?</h4>
                        <p>Clique nos números sublinhados na ficha para realizar rolagens automáticas...</p>
                    </div>
                    <div class="card-ajuda">
                        <h4>Edição de Imagem</h4>
                        <p>Clique na foto do personagem para abrir o menu de recorte e upload...</p>
                    </div>
                </div>
            </div>
        </div>
    `;

    document.body.appendChild(overlay);
    if (typeof checkScrollLock === 'function') checkScrollLock();

    // Evento para fechar e destruir o modal
    overlay.querySelector('.modal-close').onclick = () => {
        overlay.remove();
        if (typeof checkScrollLock === 'function') checkScrollLock();
    };
}

// 2. MODAL DE HISTÓRICO
// 2. MODAL DE HISTÓRICO (ATUALIZADO PARA DANO+ACERTO JUNTOS)
function abrirHistoricoDados() {
    document.getElementById('popup-config-foto').style.display = 'none';

    const existing = document.querySelector('.historico-modal-overlay');
    if (existing) existing.remove();

    const overlay = document.createElement('div');
    overlay.className = 'spell-modal-overlay historico-modal-overlay';
    overlay.style.zIndex = '60000';

    let listaHtml = '<div style="color: #666; text-align: center; margin-top: 20px;">Nenhum dado rolado nesta sessão ainda.</div>';
    
    if (typeof state !== 'undefined' && state.historicoRolls && state.historicoRolls.length > 0) {
        listaHtml = state.historicoRolls.map(roll => {
            let borderCor = "#9c27b0";
            let valorCor = "#e0aaff";
            
            // Usa as tags crit e fumble salvas na rolagem
            if (roll.crit) { borderCor = "#4caf50"; valorCor = "#4caf50"; } 
            else if (roll.fumble) { borderCor = "#f44336"; valorCor = "#f44336"; }

            // Se for duplo (Acerto + Dano), diminui um pouco a fonte para caber
            const fontSize = String(roll.valor).includes('|') ? '15px' : '18px';

            return `
                <div class="historico-item" style="border-left-color: ${borderCor};">
                    <div class="historico-info">
                        <span class="historico-titulo">${roll.titulo}</span>
                        <span class="historico-data">Hoje às ${roll.horario}</span>
                    </div>
                    <div class="historico-valor" style="color: ${valorCor}; font-size: ${fontSize}; white-space: nowrap;">
                        ${roll.valor}
                    </div>
                </div>
            `;
        }).join('');
    }

    overlay.innerHTML = `
        <div class="spell-modal" style="width: 500px; height: 70vh; display:flex; flex-direction:column;">
            <div class="modal-header" style="display: flex; justify-content: space-between; align-items: center;">
                <h3>🎲 Histórico de Rolagens</h3>
                <button class="modal-close">✖</button>
            </div>
            <div class="modal-body" style="padding: 15px; overflow-y: auto; flex:1; background: #0a0a0a;">
                <div style="font-size:12px; color:#888; text-align:center; margin-bottom: 10px;">Mostrando os últimos 20 testes</div>
                <div style="display:flex; flex-direction:column; gap: 8px;">
                    ${listaHtml}
                </div>
            </div>
        </div>
    `;

    document.body.appendChild(overlay);
    if (typeof checkScrollLock === 'function') checkScrollLock();

    overlay.querySelector('.modal-close').onclick = () => {
        overlay.remove();
        if (typeof checkScrollLock === 'function') checkScrollLock();
    };
}

// 3. FUNÇÃO GLOBAL PARA ALIMENTAR O HISTÓRICO (UNIFICADA)
window.adicionarAoHistorico = function(titulo, ataqueResult, danoResult) {
    if (typeof state === 'undefined') return;
    if (!state.historicoRolls) state.historicoRolls = [];

    let valorDisplay = "";
    let ehCritico = false;
    let ehFalha = false;

    // Cenário 1: Tem Acerto E Dano (Armas/Magias) - Junta os dois
    if (ataqueResult && danoResult) {
        valorDisplay = `⚔️ ${ataqueResult.total} | 🩸 ${danoResult.total}`;
        ehCritico = ataqueResult.isCrit;
        ehFalha = ataqueResult.isFumble;
    } 
    // Cenário 2: Só Ataque (Perícias)
    else if (ataqueResult) {
        valorDisplay = ataqueResult.total;
        ehCritico = ataqueResult.isCrit;
        ehFalha = ataqueResult.isFumble;
    } 
    // Cenário 3: Só Dano
    else if (danoResult) {
        valorDisplay = danoResult.total;
        ehCritico = danoResult.isCrit;
    }

    const novoRoll = {
        titulo: titulo,
        valor: valorDisplay,
        crit: ehCritico,
        fumble: ehFalha,
        horario: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    };

    // Adiciona no topo da lista
    state.historicoRolls.unshift(novoRoll);

    // Mantém apenas os últimos 20
    if (state.historicoRolls.length > 20) {
        state.historicoRolls.pop();
    }

    if (typeof saveStateToServer === 'function') saveStateToServer();
};


