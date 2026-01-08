/* =============================================================
   HEADER: ANTECEDENTES, CLASSES E RAÇA
   Gerencia a parte superior da ficha e atualizações visuais.
============================================================= */

// Função utilitária para auto-resize do textarea
function autoResize(el) {
    if (!el) return;
    el.style.height = 'auto';
    el.style.height = el.scrollHeight + 'px';
}

/* -------------------------------------------------------------
   1. FUNÇÃO PRINCIPAL DE ATUALIZAÇÃO DO HEADER
   Esta função roda sempre que o evento 'sheet-updated' dispara.
   ------------------------------------------------------------- */
function atualizarHeader() {
    if (typeof state === 'undefined') return;

    // --- 1. ATUALIZA O ANTECEDENTE ---
    const btnAntecedente = document.getElementById('btn-antecedente');
    if (btnAntecedente) {
        // Se existir no state, mostra. Se não, mostra "Escolher..."
        btnAntecedente.textContent = state.antecedente || "Escolher...";
    }

    // --- 2. ATUALIZA A RAÇA ---
    const inputRaca = document.getElementById('input-raca');
    if (inputRaca) {
        if (state.raca !== undefined && inputRaca.value !== state.raca) {
            inputRaca.value = state.raca;
        }
        autoResize(inputRaca);
    }

    // --- 3. ATUALIZA A LISTA DE CLASSES ---
    atualizarTextoClassesHeader();
}

// Lógica específica para montar a string "Mago [Evocação], Clérigo"
/* =============================================================
   ATUALIZAÇÃO: JS/HeaderJS.js
   Substitua a função "atualizarTextoClassesHeader" por esta:
============================================================= */

function atualizarTextoClassesHeader() {
    const el = document.getElementById('input-classesHeader');
    if (!el) return;

    // Se não houver classes salvas, limpa o campo
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

    // Itera sobre as chaves do objeto niveisClasses
    Object.keys(state.niveisClasses).forEach(key => {
        const nivel = parseInt(state.niveisClasses[key]); // Sem || 0 aqui para checar NaN

        // Só adiciona se o nível for realmente maior que 0
        if (!isNaN(nivel) && nivel > 0) {
            let nomeDisplay = mapNomes[key] || key.charAt(0).toUpperCase() + key.slice(1);

            // Lógica de Subclasse (busca nas habilidades)
            if (state.abilities && state.abilities.length > 0) {
                const norm = str => str.normalize("NFD").replace(/[\u0300-\u036f]/g, "").toLowerCase().trim();

                // Procura uma habilidade que tenha essa classe e uma subclasse definida
                const habilidadeSubclasse = state.abilities.find(a =>
                    a.subclass &&
                    a.subclass !== "" &&
                    a.subclass !== "Infusão" &&
                    norm(a.class) === norm(nomeDisplay)
                );

                if (habilidadeSubclasse) {
                    nomeDisplay += ` [${habilidadeSubclasse.subclass}]`;
                }
            }

            partes.push(`${nomeDisplay} ${nivel}`);
        }
    });

    // Atualiza o valor do input
    const novoTexto = partes.join(' / ');

    // Só mexe no DOM se mudou (evita cursor pular, mas garante atualização)
    if (el.value !== novoTexto) {
        el.value = novoTexto;
        autoResize(el);
    }
}

/* -------------------------------------------------------------
   2. LISTENERS E INICIALIZAÇÃO
   ------------------------------------------------------------- */

// Escuta o evento global de atualização (disparado pelo Login, EsquerdaJS e DireitaJS)
window.addEventListener('sheet-updated', atualizarHeader);

document.addEventListener('DOMContentLoaded', () => {
    // Input Raça (Salvar ao digitar)
    const elRaca = document.getElementById('input-raca');
    if (elRaca) {
        elRaca.addEventListener('input', () => {
            autoResize(elRaca);
            if (typeof state !== 'undefined') {
                state.raca = elRaca.value;
                if (typeof saveStateToServer === 'function') saveStateToServer();
            }
        });
    }

    // Botão Antecedente (Abrir Modal)
    const btnAntecedente = document.getElementById('btn-antecedente');
    if (btnAntecedente) {
        btnAntecedente.addEventListener('click', abrirModalAntecedentes);
    }
});

/* -------------------------------------------------------------
   3. CATÁLOGO DE ANTECEDENTES E MODAL
   ------------------------------------------------------------- */

const ANTECEDENTES_CATALOGO = [
    { nome: "Acólito", idHabilidade: "bg_aco_feat", idProficiencia: "bg_aco_prof", resumo: "Servo de um templo." },
    { nome: "Artesão de Guilda", idHabilidade: "bg_guild_feat", idProficiencia: "bg_guild_prof", resumo: "Membro de guilda comercial." },
    { nome: "Artista", idHabilidade: "bg_ent_feat", idProficiencia: "bg_ent_prof", resumo: "Mestre do entretenimento." },
    { nome: "Charlatão", idHabilidade: "bg_charlatan_feat", idProficiencia: "bg_charlatan_prof", resumo: "Mestre da enganação." },
    { nome: "Criminoso", idHabilidade: "bg_criminal_feat", idProficiencia: "bg_criminal_prof", resumo: "Fora da lei com contatos." },
    { nome: "Eremita", idHabilidade: "bg_hermit_feat", idProficiencia: "bg_hermit_prof", resumo: "Viveu em reclusão." },
    { nome: "Forasteiro", idHabilidade: "bg_outlander_feat", idProficiencia: "bg_outlander_prof", resumo: "Sobrevivente dos ermos." },
    { nome: "Herói Popular", idHabilidade: "bg_folk_feat", idProficiencia: "bg_folk_prof", resumo: "Campeão do povo comum." },
    { nome: "Marinheiro", idHabilidade: "bg_sailor_feat", idProficiencia: "bg_sailor_prof", resumo: "Familiarizado com o mar." },
    { nome: "Morador de Rua", idHabilidade: "bg_urchin_feat", idProficiencia: "bg_urchin_prof", resumo: "Cresceu pobre nas ruas." },
    { nome: "Nobre", idHabilidade: "bg_noble_feat", idProficiencia: "bg_noble_prof", resumo: "Nascido com título." },
    { nome: "Sábio", idHabilidade: "bg_sage_feat", idProficiencia: "bg_sage_prof", resumo: "Acadêmico estudioso." },
    { nome: "Soldado", idHabilidade: "bg_soldier_feat", idProficiencia: "bg_soldier_prof", resumo: "Veterano de guerra." }
];

function abrirModalAntecedentes() {
    const existing = document.querySelector('.antecedente-modal-overlay');
    if (existing) existing.remove();

    const overlay = document.createElement('div');
    overlay.className = 'spell-modal-overlay antecedente-modal-overlay';
    overlay.style.zIndex = '12000';

    overlay.innerHTML = `
        <div class="catalog-large" style="height: 80vh; max-width: 600px;">
            <div class="catalog-large-header">
                <h3>Escolher Antecedente</h3>
                <div class="catalog-large-close" style="cursor:pointer;">✖</div>
            </div>
            
            <div class="catalog-large-search">
                <input id="searchAntecedente" placeholder="Buscar antecedente..." />
            </div>

            <div class="catalog-large-list" id="lista-antecedentes">
                ${ANTECEDENTES_CATALOGO.map(ant => criarCardAntecedente(ant)).join('')}
            </div>
        </div>
    `;

    document.body.appendChild(overlay);
    if (typeof checkScrollLock === 'function') checkScrollLock();

    overlay.querySelector('.catalog-large-close').onclick = () => { overlay.remove(); if (typeof checkScrollLock === 'function') checkScrollLock(); };

    const inputSearch = overlay.querySelector('#searchAntecedente');
    inputSearch.focus();
    inputSearch.oninput = (e) => {
        const term = e.target.value.toLowerCase();
        const lista = overlay.querySelector('#lista-antecedentes');
        lista.innerHTML = ANTECEDENTES_CATALOGO
            .filter(ant => ant.nome.toLowerCase().includes(term))
            .map(ant => criarCardAntecedente(ant))
            .join('');
        bindAntecedenteClicks(overlay);
    };

    bindAntecedenteClicks(overlay);
}

function criarCardAntecedente(ant) {
    return `
        <div class="catalog-card-item card antecedente-item" data-nome="${ant.nome}" style="cursor:pointer; transition: 0.2s;">
            <div class="catalog-card-header" style="display:block;">
                <div class="catalog-card-title" style="color:#9c27b0; margin-bottom:6px; font-size:16px;">${ant.nome}</div>
                <div style="font-size:13px; color:#ccc; line-height:1.4;">${ant.resumo}</div>
            </div>
        </div>
    `;
}

function bindAntecedenteClicks(overlay) {
    overlay.querySelectorAll('.antecedente-item').forEach(item => {
        item.onclick = () => {
            const nome = item.getAttribute('data-nome');
            const antData = ANTECEDENTES_CATALOGO.find(a => a.nome === nome);

            selecionarAntecedente(antData);
            overlay.remove();
            if (typeof checkScrollLock === 'function') checkScrollLock();
        };
    });
}

function selecionarAntecedente(antData) {
    // 1. Atualiza visualmente
    const btn = document.getElementById('btn-antecedente');
    if (btn) btn.textContent = antData.nome;

    // 2. Atualiza State
    if (typeof state !== 'undefined') {
        state.antecedente = antData.nome;

        // 3. Adiciona Habilidades do Antecedente (Proficiências e Feature)
        const adicionarHabilidadePeloID = (idAlvo, subclasseNome) => {
            // Verifica se o catálogo global de habilidades já carregou (DireitaJS carrega isso)
            if (!idAlvo || typeof abilityCatalog === 'undefined') return;

            const habilidadeRef = abilityCatalog.find(h => h.id === idAlvo);
            if (habilidadeRef) {
                if (!state.abilities) state.abilities = [];

                // Evita duplicatas
                const jaTem = state.abilities.some(h => h.title === habilidadeRef.name);

                if (!jaTem) {
                    const novaHab = {
                        id: Date.now() + Math.floor(Math.random() * 1000),
                        title: habilidadeRef.name,
                        description: habilidadeRef.description,
                        expanded: false,
                        active: false,
                        class: 'Antecedente',
                        subclass: subclasseNome,
                        category: 'Origem' // Importante para agrupar corretamente
                    };
                    state.abilities.unshift(novaHab);
                }
            }
        };

        if (antData.idHabilidade) adicionarHabilidadePeloID(antData.idHabilidade, antData.nome);
        if (antData.idProficiencia) adicionarHabilidadePeloID(antData.idProficiencia, antData.nome);

        // 4. Salva e Atualiza a Tela
        if (typeof saveStateToServer === 'function') saveStateToServer();

        // Dispara evento para atualizar a lista de habilidades na direita
        window.dispatchEvent(new CustomEvent('sheet-updated'));
    }
}