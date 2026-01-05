/* =============================================================
   HEADER: ANTECEDENTES E EXIBIÇÃO DE CLASSES
============================================================= */

// Função para ajustar altura do textarea automaticamente
function autoResize(el) {
    if (!el) return;
    el.style.height = 'auto'; // Reseta para calcular
    el.style.height = el.scrollHeight + 'px'; // Ajusta para o conteúdo
}

/* -------------------------------------------------------------
   1. LÓGICA DE EXIBIÇÃO DE CLASSES NO HEADER (COM PRIORIDADE DE DATA)
   ------------------------------------------------------------- */
window.addEventListener('sheet-updated', atualizarTextoClassesHeader);

function atualizarTextoClassesHeader() {
    const el = document.getElementById('input-classesHeader');
    if (!el || !state.niveisClasses) return;

    const mapNomes = {
        'artifice': 'Artífice', 'barbaro': 'Bárbaro', 'bardo': 'Bardo',
        'blood hunter': 'Blood Hunter', 'bruxo': 'Bruxo', 'clerigo': 'Clérigo',
        'druida': 'Druida', 'feiticeiro': 'Feiticeiro', 'guerreiro': 'Guerreiro',
        'ladino': 'Ladino', 'mago': 'Mago', 'monge': 'Monge',
        'paladino': 'Paladino', 'patrulheiro': 'Patrulheiro'
    };

    let partes = [];

    // Itera sobre os níveis salvos
    Object.keys(state.niveisClasses).forEach(key => {
        const nivel = parseInt(state.niveisClasses[key]) || 0;
        
        if (nivel > 0) {
            let nomeDisplay = mapNomes[key] || key.charAt(0).toUpperCase() + key.slice(1);

            // Lógica de Subclasse: Pega a mais antiga
            if (state.abilities && state.abilities.length > 0) {
                
                // 1. Filtra todas as habilidades que pertencem a essa classe E têm subclasse
                const habilidadesDessaClasse = state.abilities.filter(a => 
                    a.class === nomeDisplay && 
                    a.subclass && 
                    a.subclass !== "" &&
                    a.subclass !== "Infusão" // Ignora categorias que não são subclasses reais
                );

                // 2. Ordena por ID Crescente (do menor para o maior = mais antigo para mais novo)
                // Isso garante que a primeira subclasse adicionada seja a "dona" do slot
                habilidadesDessaClasse.sort((a, b) => a.id - b.id);

                // 3. Pega a subclasse da habilidade mais antiga encontrada
                if (habilidadesDessaClasse.length > 0) {
                    const subclasseDominante = habilidadesDessaClasse[0].subclass;
                    nomeDisplay += ` [${subclasseDominante}]`;
                }
            }

            partes.push(nomeDisplay);
        }
    });

    el.value = partes.join(', ');
    
    // Ajusta a altura automaticamente após preencher
    autoResize(el);
}

/* -------------------------------------------------------------
   2. INICIALIZAÇÃO DE EVENTOS DE RESIZE (RAÇA E CLASSES)
   ------------------------------------------------------------- */
document.addEventListener('DOMContentLoaded', () => {
    // Input Raça (Manual)
    const elRaca = document.getElementById('input-raca');
    if (elRaca) {
        // Carrega valor inicial
        if (state && state.raca) {
            elRaca.value = state.raca;
            autoResize(elRaca);
        }
        
        // Evento ao digitar
        elRaca.addEventListener('input', () => {
            autoResize(elRaca);
            if (typeof state !== 'undefined') {
                state.raca = elRaca.value;
                if (typeof saveStateToServer === 'function') saveStateToServer();
            }
        });
    }

    // Input Classes (Readonly - Ajuste inicial)
    const elClasses = document.getElementById('input-classesHeader');
    if(elClasses) autoResize(elClasses);
    
    // Configuração do botão de Antecedentes (Mantido)
    const btnAntecedente = document.getElementById('btn-antecedente');
    if (btnAntecedente && typeof state !== 'undefined' && state.antecedente) {
        btnAntecedente.textContent = state.antecedente;
    }

    if (btnAntecedente) {
        btnAntecedente.addEventListener('click', abrirModalAntecedentes);
        btnAntecedente.addEventListener('keydown', (e) => {
            if(e.key === 'Enter') abrirModalAntecedentes();
        });
    }
});

/* -------------------------------------------------------------
   3. LÓGICA DE ANTECEDENTES (CATÁLOGO)
   ------------------------------------------------------------- */

// Catálogo com ID da Habilidade Principal e ID das Proficiências
const ANTECEDENTES_CATALOGO = [
    {
        nome: "Acólito",
        resumo: "Você passou sua vida a serviço de um templo, agindo como intermediário entre o reino sagrado e o mundo mortal.",
        idHabilidade: "bg_aco_feat",
        idProficiencia: "bg_aco_prof"
    },
    {
        nome: "Artesão de Guilda",
        resumo: "Você é membro de uma guilda de artesãos, habilidoso em criar itens de valor. (Variante: Mercador da Guilda).",
        idHabilidade: "bg_guild_feat",
        idProficiencia: "bg_guild_prof"
    },
    {
        nome: "Artista",
        resumo: "Sua vida é o palco. Você sabe como cativar, entreter e inspirar multidões. (Variante: Gladiador).",
        idHabilidade: "bg_ent_feat",
        idProficiencia: "bg_ent_prof"
    },
    {
        nome: "Charlatão",
        resumo: "Você é um mestre da manipulação. Sabe ler os desejos e medos das pessoas, usando disfarces e jogos.",
        idHabilidade: "bg_charlatan_feat",
        idProficiencia: "bg_charlatan_prof"
    },
    {
        nome: "Criminoso",
        resumo: "Você tem um histórico de infringir a lei e possui contatos no submundo. (Variante: Espião).",
        idHabilidade: "bg_criminal_feat",
        idProficiencia: "bg_criminal_prof"
    },
    {
        nome: "Eremita",
        resumo: "Você viveu em reclusão total, obtendo uma compreensão única sobre o multiverso ou um segredo.",
        idHabilidade: "bg_hermit_feat",
        idProficiencia: "bg_hermit_prof"
    },
    {
        nome: "Forasteiro",
        resumo: "Você cresceu longe da civilização. Testemunhou a natureza em sua forma mais pura e sabe sobreviver.",
        idHabilidade: "bg_outlander_feat",
        idProficiencia: "bg_outlander_prof"
    },
    {
        nome: "Herói Popular",
        resumo: "Vindo de origem humilde, o destino o escolheu. O povo comum o vê como seu campeão contra tiranos.",
        idHabilidade: "bg_folk_feat",
        idProficiencia: "bg_folk_prof"
    },
    {
        nome: "Marinheiro",
        resumo: "O mar é seu lar. Você navegou por anos, enfrentando tempestades. (Variante: Pirata).",
        idHabilidade: "bg_sailor_feat",
        idProficiencia: "bg_sailor_prof"
    },
    {
        nome: "Morador de Rua",
        resumo: "Você cresceu nas ruas, sozinho e pobre. Aprendeu a sobreviver nas áreas urbanas mais perigosas.",
        idHabilidade: "bg_urchin_feat",
        idProficiencia: "bg_urchin_prof"
    },
    {
        nome: "Nobre",
        resumo: "Você nasceu com título e riqueza. Entende a diplomacia e carrega o peso do nome de sua família. (Variante: Cavaleiro).",
        idHabilidade: "bg_noble_feat",
        idProficiencia: "bg_noble_prof"
    },
    {
        nome: "Sábio",
        resumo: "Você passou anos estudando manuscritos. Busca conhecimento e segredos do multiverso.",
        idHabilidade: "bg_sage_feat",
        idProficiencia: "bg_sage_prof"
    },
    {
        nome: "Soldado",
        resumo: "A guerra foi sua vida. Você treinou, lutou e possui uma patente militar.",
        idHabilidade: "bg_soldier_feat",
        idProficiencia: "bg_soldier_prof"
    }
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
    const btn = document.getElementById('btn-antecedente');
    if (btn) btn.textContent = antData.nome;

    if (typeof state !== 'undefined') {
        state.antecedente = antData.nome;
    
        const adicionarHabilidadePeloID = (idAlvo, subclasseNome) => {
            if (!idAlvo || typeof abilityCatalog === 'undefined') return;

            const habilidadeRef = abilityCatalog.find(h => h.id === idAlvo);
            if (habilidadeRef) {
                if (!state.abilities) state.abilities = [];

                const jaTem = state.abilities.some(h => h.title === habilidadeRef.name || (h.idRef && h.idRef === habilidadeRef.id));

                if (!jaTem) {
                    const novaHab = {
                        id: Date.now() + Math.floor(Math.random() * 1000), // ID único
                        idRef: habilidadeRef.id,
                        title: habilidadeRef.name,
                        description: habilidadeRef.description,
                        expanded: false,
                        active: false,
                        class: 'Antecedente',
                        subclass: subclasseNome
                    };
                    state.abilities.unshift(novaHab);
                }
            }
        };

        if (antData.idHabilidade) adicionarHabilidadePeloID(antData.idHabilidade, antData.nome);
        if (antData.idProficiencia) adicionarHabilidadePeloID(antData.idProficiencia, antData.nome);
                
        if (typeof renderAbilities === 'function') {
            renderAbilities();
        }
        
        if (typeof saveStateToServer === 'function') saveStateToServer();
    }
}