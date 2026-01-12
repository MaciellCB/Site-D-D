/* =============================================================
   HEADER: ANTECEDENTES, CLASSES E RAÇA
   (Suporte a Linhagens, Raças Ancestrais e Antecedentes com Variantes)
============================================================= */

// --- DADOS PARA DROPDOWNS ---
const CREATURE_TYPES = ['Humanoide', 'Construto', 'Fada', 'Dragão', 'Monstruosidade', 'Morto-vivo', 'Celestial', 'Corruptor', 'Elemental', 'Besta', 'Planta', 'Gigante', 'Limo', 'Aberração', 'Gosma'];
const CREATURE_SIZES = ['Minúsculo', 'Pequeno', 'Médio', 'Grande', 'Enorme', 'Imenso'];

// --- VARIÁVEIS GLOBAIS ---
let RACES_DB = [];
let BACKGROUNDS_DB = [];

// --- CONFIGURAÇÃO DA API ---
var BASE_API_URL = (typeof API_URL !== 'undefined') ? API_URL : 'http://localhost:3000/api';

// --- CARREGAMENTO DOS JSONs ---
async function carregarDadosHeader() {
    try {
        // Carrega Raças
        const raceRes = await fetch(`${BASE_API_URL}/catalog/races_db`); 
        if (raceRes.ok) {
             RACES_DB = await raceRes.json();
             console.log("Raças carregadas:", RACES_DB.length);
        }

        // Carrega Antecedentes
        const bgRes = await fetch(`${BASE_API_URL}/catalog/backgrounds_db`);
        if (bgRes.ok) {
            BACKGROUNDS_DB = await bgRes.json();
            console.log("Antecedentes carregados:", BACKGROUNDS_DB.length);
        }
    } catch (e) {
        console.warn("Tentando carregar localmente (fallback)...");
        try {
            const raceLocal = await fetch('backend/data/races_db.json');
            if(raceLocal.ok) RACES_DB = await raceLocal.json();

            const bgLocal = await fetch('backend/data/backgrounds_db.json');
            if(bgLocal.ok) BACKGROUNDS_DB = await bgLocal.json();
        } catch(e2) { console.error("Erro fatal ao carregar dados.", e2); }
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
});


/* =============================================================
   SISTEMA DE ANTECEDENTES (ATUALIZADO COM VARIANTES)
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

    // Gera lista HTML
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

    // Clique na Lista
    const items = overlay.querySelectorAll('.race-list-item');
    items.forEach(item => {
        item.onclick = () => {
            items.forEach(i => i.classList.remove('selected'));
            item.classList.add('selected');

            const bgName = item.getAttribute('data-name');
            selectedBgBase = BACKGROUNDS_DB.find(b => b.name === bgName);
            selectedBgVariant = null; // Reseta variante

            renderBgDetails(selectedBgBase);
        };
    });

    // Botão Selecionar
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

        if (hasVariants) {
            btnSelect.setAttribute('disabled', true);
            btnSelect.textContent = "Selecione uma Variante";
            btnSelect.style.background = '#444';
        } else {
            btnSelect.removeAttribute('disabled');
            btnSelect.textContent = `Selecionar ${bg.name}`;
            btnSelect.style.background = '#9c27b0';
        }

        const imagePath = bg.image || 'img/dado.png';

        // Proficiências
        const skillsHtml = bg.skills ? bg.skills.join(', ') : '-';
        const toolsHtml = bg.tools && bg.tools.length ? bg.tools.join(', ') : '-';
        const equipsHtml = bg.equipment ? bg.equipment.join(', ') : '-';
        const langs = bg.languages ? `${bg.languages} a sua escolha` : '-';

        // Variantes HTML
        let variantsHtml = '';
        if (hasVariants) {
            variantsHtml = `
                <div class="race-traits-title" style="margin-top:20px; color:#ffeb3b;">Variantes</div>
                <div class="variations-list">
                    ${bg.variants.map((v, idx) => `
                        <div class="variation-card-wrapper">
                            <div class="variation-header" data-idx="${idx}">
                                <input type="radio" name="bg_variant" value="${idx}" id="bg_var_${idx}">
                                <span class="variation-name">${v.name}</span>
                                <span class="variation-arrow">▾</span>
                            </div>
                            <div class="variation-body">
                                ${v.description ? `<div class="variation-desc">${v.description}</div>` : ''}
                                ${v.feature ? `<div style="margin-top:4px;"><strong style="color:#e0aaff;">Recurso:</strong> ${v.feature.name}</div>` : ''}
                                ${v.equipment ? `<div style="margin-top:4px;"><strong style="color:#e0aaff;">Equipamento:</strong> ${v.equipment.join(', ')}</div>` : ''}
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
            
            <div class="race-traits-title" style="margin-top:15px;">Proficiências & Equipamento</div>
            <div style="font-size:13px; color:#ccc; line-height:1.6; background:#111; padding:10px; border-radius:6px; border:1px solid #333;">
                <div><strong style="color:#e0aaff;">Perícias:</strong> ${skillsHtml}</div>
                <div><strong style="color:#e0aaff;">Ferramentas:</strong> ${toolsHtml}</div>
                <div><strong style="color:#e0aaff;">Idiomas:</strong> ${langs}</div>
                <div style="margin-top:6px; padding-top:6px; border-top:1px solid #333;">
                    <strong style="color:#e0aaff;">Equipamento:</strong> ${equipsHtml}
                </div>
            </div>

            <div class="race-traits-title" style="margin-top:20px;">Habilidade: ${bg.feature.name}</div>
            <div class="race-trait-item">
                <div class="race-trait-desc" style="font-size:13px; color:#ddd;">${bg.feature.desc}</div>
            </div>

            ${variantsHtml}
        `;

        // Eventos Variantes
        if (hasVariants) {
            detailsContainer.querySelectorAll('.variation-header').forEach(header => {
                header.addEventListener('click', (e) => {
                    if(e.target.type === 'radio') { e.stopPropagation(); return; }
                    header.closest('.variation-card-wrapper').classList.toggle('open');
                });
            });
            detailsContainer.querySelectorAll('input[name="bg_variant"]').forEach(radio => {
                radio.addEventListener('change', () => {
                    const idx = parseInt(radio.value);
                    selectedBgVariant = bg.variants[idx];
                    
                    radio.closest('.variation-card-wrapper').classList.add('open');

                    btnSelect.removeAttribute('disabled');
                    btnSelect.textContent = `Selecionar ${selectedBgVariant.name}`;
                    btnSelect.style.background = '#9c27b0';
                });
            });
        }
    }
}

/* -------------------------------------------------------------
   APLICAR ANTECEDENTE NA FICHA (COM VARIANTE)
   ------------------------------------------------------------- */
function aplicarAntecedenteNaFicha(bgBase, bgVariant) {
    if (typeof state === 'undefined') return;

    // Nome final
    const nomeFinal = bgVariant ? `${bgBase.name} (${bgVariant.name})` : bgBase.name;
    state.antecedente = nomeFinal;

    // Define Dados (Prioriza Variante se existir)
    const featureData = (bgVariant && bgVariant.feature) ? bgVariant.feature : bgBase.feature;
    const equipData = (bgVariant && bgVariant.equipment) ? bgVariant.equipment : bgBase.equipment;
    // Perícias e Ferramentas geralmente não mudam na variante, mas se mudarem no JSON, adicione lógica aqui

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

    // 2. Adicionar Itens
    if (equipData) {
        if (!state.inventory) state.inventory = [];
        equipData.forEach(itemStr => {
            state.inventory.push({
                id: Date.now() + Math.floor(Math.random() * 100000),
                name: itemStr,
                type: "Geral",
                description: "Item de Antecedente",
                expanded: false,
                equip: false
            });
        });
    }

    // 3. Atualizar
    atualizarHeader();
    if (typeof saveStateToServer === 'function') saveStateToServer();
    window.dispatchEvent(new CustomEvent('sheet-updated'));
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
        
        if (hasVariations) {
            btnSelect.setAttribute('disabled', true);
            btnSelect.textContent = "Selecione uma Sub-raça";
            btnSelect.style.background = '#444';
        } else {
            btnSelect.removeAttribute('disabled');
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
   5. APLICAR RAÇA NA FICHA
   ------------------------------------------------------------- */
function aplicarRacaNaFicha(raceData, variationData, lineageData) {
    if (typeof state === 'undefined') return;

    let nomeFinal = raceData.name;
    if (lineageData) nomeFinal = `${raceData.name} (${lineageData.name})`;

    state.raca = nomeFinal;
    state.subRaca = variationData ? variationData.name : (lineageData ? lineageData.name : "");

    const sourceData = lineageData || variationData || raceData;
    state.racaTipo = lineageData ? lineageData.type : (sourceData.type || raceData.type);
    state.racaTamanho = lineageData ? lineageData.size : (sourceData.size || raceData.size);
    state.metros = (lineageData && lineageData.speed) ? lineageData.speed : ((variationData && variationData.speed) ? variationData.speed : raceData.speed);
    state.deslocamentoVoo = (lineageData && lineageData.flySpeed) ? lineageData.flySpeed : ((variationData && variationData.flySpeed) ? variationData.flySpeed : (raceData.flySpeed || 0));

    if (!state.abilities) state.abilities = [];
    state.abilities = state.abilities.filter(a => a.category !== 'Raça');

    let traitsToAdd = [];
    if (raceData.traits) traitsToAdd = traitsToAdd.concat(raceData.traits.map(t => ({...t, origin: raceData.name})));
    if (variationData && variationData.traits) traitsToAdd = traitsToAdd.concat(variationData.traits.map(t => ({...t, origin: variationData.name})));
    if (lineageData && lineageData.traits) traitsToAdd = traitsToAdd.concat(lineageData.traits.map(t => ({...t, origin: lineageData.name})));

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

    atualizarHeader();
    if (typeof saveStateToServer === 'function') saveStateToServer();
    window.dispatchEvent(new CustomEvent('sheet-updated'));
}

/* ---------------- FUNÇÕES DE SUPORTE ---------------- */

function openCustomRaceCreator() {
    const overlay = document.createElement('div');
    overlay.className = 'spell-modal-overlay race-modal-overlay';
    overlay.style.zIndex = '12100';
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
            setTimeout(() => { const chk = overlay.querySelector('#race-fly-check'); const inp = overlay.querySelector('#race-fly-input'); chk.onchange = () => { inp.disabled = !chk.checked; if(chk.checked && !inp.value) inp.value = 9; }; }, 50);
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
    overlay.querySelector('.modal-close').onclick = () => overlay.remove();
    overlay.querySelector('#btn-wizard-next').onclick = () => {
        if(currentStep===1) { customRaceData.name = overlay.querySelector('#custom-race-name').value; currentStep++; }
        else if(currentStep===2) { customRaceData.speed = overlay.querySelector('#race-speed-input').value; currentStep++; }
        else if(currentStep===3) { customRaceData.description = overlay.querySelector('#custom-race-desc').value; currentStep++; }
        else { 
            customRaceData.traits = [];
            overlay.querySelectorAll('.wizard-trait-box').forEach(box => {
                const n = box.querySelector('.trait-name-input').value.trim();
                const d = box.querySelector('.trait-desc-input').value.trim();
                if(n) customRaceData.traits.push({name:n, desc:d});
            });
            aplicarRacaNaFicha(customRaceData, null, null); 
            overlay.remove(); 
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