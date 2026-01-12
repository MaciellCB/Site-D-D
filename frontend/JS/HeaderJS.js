/* =============================================================
   HEADER: ANTECEDENTES, CLASSES E RAÇA
   (Suporte a Linhagens e Raças Ancestrais)
============================================================= */

// --- DADOS PARA DROPDOWNS ---
const CREATURE_TYPES = ['Humanoide', 'Construto', 'Fada', 'Dragão', 'Monstruosidade', 'Morto-vivo', 'Celestial', 'Corruptor', 'Elemental', 'Besta', 'Planta', 'Gigante', 'Limo', 'Aberração', 'Gosma'];
const CREATURE_SIZES = ['Minúsculo', 'Pequeno', 'Médio', 'Grande', 'Enorme', 'Imenso'];

// --- VARIÁVEL GLOBAL PARA ARMAZENAR O DB ---
let RACES_DB = [];

// --- CONFIGURAÇÃO DA API ---
var BASE_API_URL = (typeof API_URL !== 'undefined') ? API_URL : 'http://localhost:3000/api';

// --- CARREGAMENTO DO JSON ---
async function carregarRacesDB() {
    try {
        // Tenta carregar do servidor
        const response = await fetch(`${BASE_API_URL}/catalog/races_db`); 
        if (!response.ok) throw new Error("Erro API");
        RACES_DB = await response.json();
        console.log("Raças carregadas:", RACES_DB.length);
    } catch (e) {
        console.warn("Tentando carregar localmente (fallback)...");
        // Fallback para arquivo local (caso servidor não responda, útil para testes simples)
        try {
            const local = await fetch('backend/data/races_db.json');
            if(local.ok) RACES_DB = await local.json();
        } catch(e2) { console.error("Erro fatal ao carregar raças."); }
    }
}
carregarRacesDB();

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

    // Raça (Mostra o nome composto salvo)
    const inputRaca = document.getElementById('input-raca');
    if (inputRaca) {
        // Se tiver sub-raça e não for linhagem composta, mostra (Sub). 
        // Se for linhagem, o nome já vem composto ex: "Elfo (Dampir)"
        let displayRace = state.raca || "";
        
        // Só adiciona sub-raça se ela não fizer parte do nome já (evita duplicidade visual)
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

// ... (Função atualizarTextoClassesHeader mantida igual) ...
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
    const btnAnt = document.getElementById('btn-antecedente');
    if(btnAnt) btnAnt.addEventListener('click', abrirModalAntecedentes);
});

/* -------------------------------------------------------------
   3. SELEÇÃO DE RAÇA (COM DIVISÃO E SUPORTE A LINHAGEM)
   ------------------------------------------------------------- */
function openRaceSelectionModal() {
    if (RACES_DB.length === 0) {
        carregarRacesDB().then(() => {
             if(RACES_DB.length > 0) openRaceSelectionModal();
             else alert("Erro: Banco de raças vazio.");
        });
        return;
    }

    const existing = document.querySelector('.race-modal-overlay');
    if (existing) existing.remove();

    // 1. DIVISÃO DAS RAÇAS
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
                        
                        ${linhagens.length > 0 ? `
                            <div class="race-list-header" style="padding:10px; color:#e0aaff; font-weight:bold; font-size:12px; border-bottom:1px solid #333; margin-top:10px; border-top:1px solid #333;">LINHAGENS</div>
                            ${gerarListaHTML(linhagens)}
                        ` : ''}
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

    // --- LÓGICA DO CLIQUE SELECIONAR ---
    btnSelect.onclick = () => {
        if(selectedRaceBase) {
            // SE FOR LINHAGEM, ABRE SELETOR DA RAÇA ANCESTRAL
            if (selectedRaceBase.isLineage) {
                // Fecha o modal atual e abre o próximo passo
                overlay.remove();
                openAncestralRaceSelector(selectedRaceBase); 
            } else {
                // SE FOR RAÇA NORMAL, APLICA DIRETO
                aplicarRacaNaFicha(selectedRaceBase, selectedVariation, null);
                overlay.remove();
                checkScrollLock();
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
        
        // Configura Botão
        if (hasVariations) {
            btnSelect.setAttribute('disabled', true);
            btnSelect.textContent = "Selecione uma Sub-raça";
            btnSelect.style.background = '#444';
        } else {
            btnSelect.removeAttribute('disabled');
            // Muda o texto se for Linhagem
            btnSelect.textContent = race.isLineage ? "Continuar para Ancestralidade" : "Selecionar Raça";
            btnSelect.style.background = '#9c27b0';
        }

        const flyInfo = race.flySpeed ? `<span style="color:#4fc3f7; margin-left:8px;">🦅 Voo: ${race.flySpeed}m</span>` : '';
        const traitsHtml = race.traits.map(t => `<div class="race-trait-item"><div class="race-trait-name">${t.name}</div><div class="race-trait-desc">${t.desc}</div></div>`).join('');

        let variationsHtml = '';
        if (hasVariations) {
            variationsHtml = `
                <div class="race-traits-title" style="margin-top:20px; color:#ffeb3b;">Variações</div>
                <div class="variations-list">
                    ${race.variations.map((v, idx) => `
                        <div class="variation-card-wrapper">
                            <div class="variation-header" data-idx="${idx}">
                                <input type="radio" name="race_variation" value="${idx}" id="var_${idx}">
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
            <div class="race-traits-title" style="margin-top:15px;">Características Base</div>
            <div>${traitsHtml}</div>
            ${variationsHtml}
        `;

        // Eventos Variações
        if (hasVariations) {
            detailsContainer.querySelectorAll('.variation-header').forEach(header => {
                header.addEventListener('click', (e) => {
                    if(e.target.type === 'radio') { e.stopPropagation(); return; }
                    header.closest('.variation-card-wrapper').classList.toggle('open');
                });
            });
            detailsContainer.querySelectorAll('input[name="race_variation"]').forEach(radio => {
                radio.addEventListener('change', () => {
                    const idx = parseInt(radio.value);
                    selectedVariation = race.variations[idx];
                    radio.closest('.variation-card-wrapper').classList.add('open');
                    btnSelect.removeAttribute('disabled');
                    btnSelect.textContent = race.isLineage ? `Continuar (${selectedVariation.name})` : `Selecionar ${selectedVariation.name}`;
                    btnSelect.style.background = '#9c27b0';
                });
            });
        }
    }
}

/* -------------------------------------------------------------
   4. SELETOR DE RAÇA ANCESTRAL (ATUALIZADO: COM DETALHES E IMAGEM)
   ------------------------------------------------------------- */
function openAncestralRaceSelector(lineageData) {
    const overlay = document.createElement('div');
    overlay.className = 'spell-modal-overlay race-modal-overlay';
    overlay.style.zIndex = '12000';

    // Filtra apenas raças comuns (exclui linhagens)
    const racasAncestrais = RACES_DB.filter(r => !r.isLineage);

    // Gera lista HTML
    const listHtml = racasAncestrais.map(r => 
        `<div class="race-list-item" data-name="${r.name}">${r.name}</div>`
    ).join('');

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
                        <div style="color: #666; text-align: center; margin-top: 50px;">
                            Selecione a raça que você era antes de se tornar um ${lineageData.name}.
                        </div>
                    </div>
                </div>
            </div>

            <div class="modal-actions">
                <button id="btn-confirm-ancestral" class="btn-add btn-save-modal" disabled>Confirmar Ancestralidade</button>
            </div>
        </div>
    `;

    document.body.appendChild(overlay);
    checkScrollLock();

    // Variáveis de Seleção Local
    let selectedBase = null;
    let selectedVar = null;

    const btnConfirm = overlay.querySelector('#btn-confirm-ancestral');
    const detailsContainer = overlay.querySelector('#ancestral-details-content');

    // Fechar
    overlay.querySelector('.modal-close').onclick = () => { overlay.remove(); checkScrollLock(); };

    // Confirmar
    btnConfirm.onclick = () => {
        if (selectedBase) {
            // Aplica: Raça Base + Variação (se houver) + Linhagem (Prioridade Máxima)
            aplicarRacaNaFicha(selectedBase, selectedVar, lineageData);
            overlay.remove();
            checkScrollLock();
        }
    };

    // Click na Lista
    const items = overlay.querySelectorAll('.race-list-item');
    items.forEach(item => {
        item.onclick = () => {
            items.forEach(i => i.classList.remove('selected'));
            item.classList.add('selected');

            const raceName = item.getAttribute('data-name');
            selectedBase = racasAncestrais.find(r => r.name === raceName);
            selectedVar = null; // Reseta variação ao trocar raça base

            renderAncestralDetails(selectedBase);
        };
    });

    // Função de Renderização (Reutiliza lógica visual da principal, mas isolada)
    function renderAncestralDetails(race) {
        if (!race) return;

        const hasVariations = race.variations && race.variations.length > 0;

        // Configura Botão
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
        
        // Traits
        const traitsHtml = race.traits.map(t => `
            <div class="race-trait-item">
                <div class="race-trait-name">${t.name}</div>
                <div class="race-trait-desc">${t.desc}</div>
            </div>
        `).join('');

        // Variações
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

        // HTML Detalhado (Igual ao modal principal)
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

        // Eventos das Variações (Sub-raças)
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
                    
                    // Expande o card selecionado
                    radio.closest('.variation-card-wrapper').classList.add('open');

                    // Atualiza botão
                    btnConfirm.removeAttribute('disabled');
                    btnConfirm.textContent = `Confirmar: ${selectedVar.name} (${lineageData.name})`;
                    btnConfirm.style.background = '#9c27b0';
                });
            });
        }
    }
}

/* -------------------------------------------------------------
   5. APLICAR RAÇA NA FICHA (LOGICA FINAL DE MESCLAGEM)
   ------------------------------------------------------------- */
function aplicarRacaNaFicha(raceData, variationData, lineageData) {
    if (typeof state === 'undefined') return;

    // 1. Determina o Nome Final
    let nomeFinal = raceData.name;
    if (lineageData) {
        nomeFinal = `${raceData.name} (${lineageData.name})`;
    }

    state.raca = nomeFinal;
    state.subRaca = variationData ? variationData.name : (lineageData ? lineageData.name : "");

    // 2. Prioridade de Estatísticas: Linhagem > Variação > Raça Base
    const sourceData = lineageData || variationData || raceData;
    
    state.racaTipo = lineageData ? lineageData.type : (sourceData.type || raceData.type);
    state.racaTamanho = lineageData ? lineageData.size : (sourceData.size || raceData.size);
    
    // Deslocamento: Linhagem geralmente sobrescreve ou mantém. Aqui assumimos sobrescrita se existir.
    state.metros = (lineageData && lineageData.speed) ? lineageData.speed : 
                   ((variationData && variationData.speed) ? variationData.speed : raceData.speed);
    
    state.deslocamentoVoo = (lineageData && lineageData.flySpeed) ? lineageData.flySpeed :
                            ((variationData && variationData.flySpeed) ? variationData.flySpeed : (raceData.flySpeed || 0));


    // 3. Compilar Habilidades
    if (!state.abilities) state.abilities = [];
    state.abilities = state.abilities.filter(a => a.category !== 'Raça');

    let traitsToAdd = [];

    // Se tiver Linhagem, adiciona traits da Linhagem E da Raça (conforme regra de legado)
    // Se não, adiciona Raça + Variação
    
    // Adiciona Traits da Raça Base
    if (raceData.traits) {
        traitsToAdd = traitsToAdd.concat(raceData.traits.map(t => ({...t, origin: raceData.name})));
    }
    
    // Adiciona Traits da Variação (se houver)
    if (variationData && variationData.traits) {
        traitsToAdd = traitsToAdd.concat(variationData.traits.map(t => ({...t, origin: variationData.name})));
    }

    // Adiciona Traits da Linhagem (se houver) - Estes ficam no topo
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

    // Inverte para que as últimas adicionadas (Linhagem) fiquem no topo da lista visual
    state.abilities.unshift(...novasHabilidades.reverse());

    // 4. Salvar e Atualizar
    atualizarHeader();
    if (typeof saveStateToServer === 'function') saveStateToServer();
    window.dispatchEvent(new CustomEvent('sheet-updated'));
}

/* -------------------------------------------------------------
   4. WIZARD DE RAÇA CUSTOMIZADA (LAYOUT CORRIGIDO + HABILIDADES DINÂMICAS)
   ------------------------------------------------------------- */
function openCustomRaceCreator() {
    const overlay = document.createElement('div');
    overlay.className = 'spell-modal-overlay race-modal-overlay';
    overlay.style.zIndex = '12100';

    let currentStep = 1;
    
    // Estado inicial
    let customRaceData = {
        name: "", 
        type: "Humanoide", 
        size: "Médio", 
        speed: 9, 
        flySpeed: 0, 
        hasFly: false, 
        description: "",
        traits: [] // Começa vazio, preenchido dinamicamente
    };

    function renderWizardContent() {
        const contentDiv = overlay.querySelector('#wizard-content-area');
        const dots = overlay.querySelectorAll('.step-dot');
        const btnNext = overlay.querySelector('#btn-wizard-next');
        const btnPrev = overlay.querySelector('#btn-wizard-prev');

        // Atualiza UI dos passos
        dots.forEach((dot, idx) => {
            if (idx + 1 === currentStep) dot.classList.add('active'); else dot.classList.remove('active');
        });
        if (currentStep === 1) btnPrev.disabled = true; else btnPrev.disabled = false;
        if (currentStep === 4) btnNext.textContent = "Concluir"; else btnNext.textContent = "Próximo";

        // --- PASSO 1: NOME ---
        if (currentStep === 1) {
            contentDiv.innerHTML = `
                <div style="text-align:center; padding: 20px;">
                    <h3 style="color:#fff;">Passo 1: Nome da Raça</h3>
                    <p style="color:#aaa; font-size:13px; margin-bottom:20px;">Como sua nova espécie se chama?</p>
                    <input id="custom-race-name" type="text" value="${customRaceData.name}" placeholder="Ex: Et Bilu..." class="wizard-input-main">
                </div>
            `;
            setTimeout(() => overlay.querySelector('#custom-race-name').focus(), 50);
        } 
        
        // --- PASSO 2: ESTATÍSTICAS (LAYOUT CORRIGIDO) ---
        else if (currentStep === 2) {
             const typesOptions = CREATURE_TYPES.map(t => `<option value="${t}" ${customRaceData.type === t ? 'selected' : ''}>${t}</option>`).join('');
             const sizesOptions = CREATURE_SIZES.map(s => `<option value="${s}" ${customRaceData.size === s ? 'selected' : ''}>${s}</option>`).join('');

            contentDiv.innerHTML = `
                <div style="padding: 10px;">
                    <h3 style="color:#fff; text-align:center;">Passo 2: Estatísticas</h3>
                    
                    <div style="display:grid; grid-template-columns: 1fr 1fr; gap:15px; margin-top:20px;">
                        <div>
                            <label class="wizard-label">Tipo de Criatura</label>
                            <select id="race-type-select" class="wizard-select">${typesOptions}</select>
                        </div>
                        <div>
                            <label class="wizard-label">Tamanho</label>
                            <select id="race-size-select" class="wizard-select">${sizesOptions}</select>
                        </div>
                    </div>

                    <div style="margin-top:20px; border-top:1px solid #333; padding-top:15px;">
                        <label class="wizard-label" style="margin-bottom:10px; display:block;">Deslocamento</label>
                        
                        <div style="display: flex; gap: 20px; align-items: flex-end;">
                            <div style="flex:1;">
                                <label style="font-size:11px; color:#888; display:block; margin-bottom:4px;">Caminhada (m)</label>
                                <input type="number" id="race-speed-input" value="${customRaceData.speed}" class="wizard-input-small" style="width:100%;">
                            </div>
                            
                            <div style="flex:1;">
                                <label class="wizard-check-label" style="margin-bottom:4px;">
                                    <input type="checkbox" id="race-fly-check" ${customRaceData.hasFly ? 'checked' : ''}>
                                    Voo?
                                </label>
                                <input type="number" id="race-fly-input" value="${customRaceData.flySpeed}" class="wizard-input-small" style="width:100%;" ${customRaceData.hasFly ? '' : 'disabled'} placeholder="0">
                            </div>
                        </div>
                    </div>
                </div>
            `;
            
            setTimeout(() => {
                const chk = overlay.querySelector('#race-fly-check');
                const inp = overlay.querySelector('#race-fly-input');
                chk.onchange = () => {
                    inp.disabled = !chk.checked;
                    if(chk.checked && !inp.value) inp.value = 9;
                };
            }, 50);
        }

        // --- PASSO 3: DESCRIÇÃO ---
        else if (currentStep === 3) {
            contentDiv.innerHTML = `
                <div style="padding: 10px;">
                    <h3 style="color:#fff; text-align:center;">Passo 3: Descrição</h3>
                    <p style="color:#aaa; font-size:13px; text-align:center; margin-bottom:10px;">Aparência, cultura e história.</p>
                    <textarea id="custom-race-desc" class="wizard-textarea">${customRaceData.description}</textarea>
                </div>
            `;
        }

        // --- PASSO 4: HABILIDADES (DINÂMICO) ---
        else if (currentStep === 4) {
            contentDiv.innerHTML = `
                <div style="padding: 5px;">
                    <h3 style="color:#fff; text-align:center;">Passo 4: Habilidades</h3>
                    <div id="traits-list-container" style="padding-bottom:10px;"> 
                        </div>
                    <button id="btn-add-more-trait" class="btn-add-trait">+ Adicionar Habilidade</button>
                </div>
            `;

            const container = contentDiv.querySelector('#traits-list-container');
            
            // Função para criar um bloco de habilidade
            const addTraitInput = (name = "", desc = "") => {
                const idx = container.children.length; // Índice baseado na quantidade atual
                const div = document.createElement('div');
                div.className = 'wizard-trait-box';
                div.innerHTML = `
                    <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom:5px;">
                        <label style="color:#9c27b0; font-size:12px; font-weight:bold;">Habilidade ${idx + 1}</label>
                        ${idx > 0 ? `<button class="remove-trait-btn" style="background:none; border:none; color:#d32f2f; cursor:pointer; font-size:16px; padding:0;">×</button>` : ''}
                    </div>
                    <input type="text" class="trait-name-input" value="${name}" placeholder="Nome (Ex: Visão Noturna)" style="width:100%; margin-bottom:5px; background:#000; border:1px solid #444; color:#fff; padding:6px; border-radius:4px; box-sizing:border-box;">
                    <textarea class="trait-desc-input" placeholder="Descrição..." style="width:100%; height:60px; background:#000; border:1px solid #444; color:#ccc; padding:6px; resize:none; border-radius:4px; box-sizing:border-box;">${desc}</textarea>
                `;
                
                // Botão remover (só aparece do 2º item em diante para não ficar vazio)
                const btnRemove = div.querySelector('.remove-trait-btn');
                if(btnRemove) {
                    btnRemove.onclick = () => div.remove();
                }

                container.appendChild(div);
            };

            // Se já tiver dados salvos (se o usuário voltou), renderiza eles. Se não, cria 2 vazios.
            if (customRaceData.traits && customRaceData.traits.length > 0) {
                customRaceData.traits.forEach(t => addTraitInput(t.name, t.desc));
            } else {
                addTraitInput();
                addTraitInput();
            }

            // Botão Adicionar
            contentDiv.querySelector('#btn-add-more-trait').onclick = () => addTraitInput();
        }
    }

    overlay.innerHTML = `
        <div class="spell-modal" style="width: 500px; height: 600px; max-height: 90vh;">
            <div class="modal-header">
                <h3>Criar Raça Customizada</h3>
                <button class="modal-close">✖</button>
            </div>
            
            <div class="wizard-container">
                <div class="wizard-step-indicator">
                    <div class="step-dot"></div>
                    <div class="step-dot"></div>
                    <div class="step-dot"></div>
                    <div class="step-dot"></div>
                </div>

                <div id="wizard-content-area" class="wizard-content"></div>

                <div class="wizard-btn-row">
                    <button id="btn-wizard-prev" class="btn-add" style="background:transparent; border:1px solid #444; color:#aaa;">Voltar</button>
                    <button id="btn-wizard-next" class="btn-add">Próximo</button>
                </div>
            </div>
        </div>
    `;

    document.body.appendChild(overlay);
    if(typeof checkScrollLock === 'function') checkScrollLock();
    renderWizardContent();

    overlay.querySelector('.modal-close').onclick = () => { overlay.remove(); checkScrollLock(); };

    overlay.querySelector('#btn-wizard-next').onclick = () => {
        // Lógica de Navegação
        if (currentStep === 1) {
            const val = overlay.querySelector('#custom-race-name').value.trim();
            if (!val) return alert("Dê um nome!");
            customRaceData.name = val;
            currentStep++;
        } 
        else if (currentStep === 2) {
            customRaceData.type = overlay.querySelector('#race-type-select').value;
            customRaceData.size = overlay.querySelector('#race-size-select').value;
            customRaceData.speed = parseFloat(overlay.querySelector('#race-speed-input').value) || 0;
            customRaceData.hasFly = overlay.querySelector('#race-fly-check').checked;
            customRaceData.flySpeed = customRaceData.hasFly ? (parseFloat(overlay.querySelector('#race-fly-input').value) || 0) : 0;
            currentStep++;
        }
        else if (currentStep === 3) {
            customRaceData.description = overlay.querySelector('#custom-race-desc').value;
            currentStep++;
        }
        else if (currentStep === 4) {
            // Salvar Habilidades Dinâmicas
            customRaceData.traits = []; // Limpa para regravar
            const traitBoxes = overlay.querySelectorAll('.wizard-trait-box');
            
            traitBoxes.forEach(box => {
                const name = box.querySelector('.trait-name-input').value.trim();
                const desc = box.querySelector('.trait-desc-input').value.trim();
                if (name) { // Só salva se tiver nome
                    customRaceData.traits.push({ name, desc });
                }
            });

            aplicarRacaNaFicha(customRaceData, null);
            overlay.remove();
            checkScrollLock();
            return;
        }
        renderWizardContent();
    };

    overlay.querySelector('#btn-wizard-prev').onclick = () => {
        if (currentStep > 1) { 
            // Se estiver saindo do passo 4 (voltando), salva temporariamente o estado dos inputs
            if (currentStep === 4) {
                customRaceData.traits = [];
                overlay.querySelectorAll('.wizard-trait-box').forEach(box => {
                    customRaceData.traits.push({
                        name: box.querySelector('.trait-name-input').value,
                        desc: box.querySelector('.trait-desc-input').value
                    });
                });
            }
            currentStep--; 
            renderWizardContent(); 
        }
    };
}

// ... (Função abrirModalAntecedentes igual à anterior) ...
function abrirModalAntecedentes() {
    const existing = document.querySelector('.antecedente-modal-overlay');
    if (existing) existing.remove();
    const overlay = document.createElement('div');
    overlay.className = 'spell-modal-overlay antecedente-modal-overlay';
    overlay.style.zIndex = '12000';
    overlay.innerHTML = `<div class="catalog-large" style="height:80vh;max-width:600px;"><div class="catalog-large-header"><h3>Escolher Antecedente</h3><div class="catalog-large-close" style="cursor:pointer;">✖</div></div><div class="catalog-large-search"><input id="searchAntecedente" placeholder="Buscar..." /></div><div class="catalog-large-list" id="lista-antecedentes">${ANTECEDENTES_CATALOGO.map(a=>`<div class="catalog-card-item card antecedente-item" data-name="${a.nome}" style="cursor:pointer;"><div class="catalog-card-header"><div class="catalog-card-title" style="color:#9c27b0;">${a.nome}</div><div style="font-size:13px;color:#ccc;">${a.resumo}</div></div></div>`).join('')}</div></div>`;
    document.body.appendChild(overlay);
    overlay.querySelector('.catalog-large-close').onclick = () => overlay.remove();
    
    const bindClicks = () => {
        overlay.querySelectorAll('.antecedente-item').forEach(item => {
            item.onclick = () => {
                const nome = item.getAttribute('data-name');
                if (typeof state !== 'undefined') { state.antecedente = nome; saveStateToServer(); }
                document.getElementById('btn-antecedente').textContent = nome;
                overlay.remove();
            };
        });
    };
    bindClicks();
    overlay.querySelector('#searchAntecedente').oninput = (e) => {
        const term = e.target.value.toLowerCase();
        overlay.querySelector('#lista-antecedentes').innerHTML = ANTECEDENTES_CATALOGO.filter(a=>a.nome.toLowerCase().includes(term)).map(a=>`<div class="catalog-card-item card antecedente-item" data-name="${a.nome}" style="cursor:pointer;"><div class="catalog-card-header"><div class="catalog-card-title" style="color:#9c27b0;">${a.nome}</div><div style="font-size:13px;color:#ccc;">${a.resumo}</div></div></div>`).join('');
        bindClicks();
    };
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