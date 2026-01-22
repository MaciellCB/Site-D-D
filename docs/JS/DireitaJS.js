/* =============================================================
   JS/DireitaJS.js - INTEGRAÇÃO E LÓGICA PRINCIPAL
============================================================= */

const API_URL = 'https://dandd-chan.onrender.com/api';

// --- VARIÁVEIS GLOBAIS DE CATÁLOGO ---
let spellCatalog = [];
let abilityCatalog = [];
let itemCatalog = [];

// --- CARREGAMENTO IMEDIATO DOS DADOS (Correção do Erro) ---
async function carregarCatalogosDireita() {
  try {
    console.log("Buscando catálogos de itens, magias e habilidades...");

    // Faz as 3 requisições ao mesmo tempo
    const [resSpells, resAbilities, resItems] = await Promise.all([
      fetch(`${API_URL}/catalog/spells`),
      fetch(`${API_URL}/catalog/abilities`),
      fetch(`${API_URL}/catalog/items`)
    ]);

    if (resSpells.ok) spellCatalog = await resSpells.json();
    if (resAbilities.ok) abilityCatalog = await resAbilities.json();
    if (resItems.ok) itemCatalog = await resItems.json();

    console.log("Catálogos carregados:", {
      Magias: spellCatalog.length,
      Habilidades: abilityCatalog.length,
      Itens: itemCatalog.length
    });

  } catch (e) {
    console.error("Erro ao carregar catálogos da Direita:", e);
    alert("Erro: Não foi possível carregar Itens/Magias/Habilidades. Verifique se o servidor está rodando e se os arquivos .json existem na pasta data.");
  }
}

// Executa assim que o arquivo é lido
carregarCatalogosDireita();


// --- FUNÇÕES DE LOGIN E SALVAMENTO ---

let saveTimer = null; // Variável global para controlar o cronômetro

async function saveStateToServer() {
  // Se não tiver nome, nem tenta salvar
  if (!state.nome) return;

  // 1. Se já existe um salvamento agendado, CANCELA ele.
  // Isso faz o cronômetro reiniciar toda vez que você clica ou digita.
  if (saveTimer) {
    clearTimeout(saveTimer);
  }

  // 2. Agenda o salvamento para daqui a 1 segundo (1000ms)
  saveTimer = setTimeout(async () => {
    try {
      // Envia os dados para o servidor
      await fetch(`${API_URL}/save-ficha`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(state)
      });

      // SUCESSO SILENCIOSO: Não faz nada visualmente.
      // O dado foi salvo no banco, mas o usuário não é interrompido.

    } catch (e) {
      // Apenas erros graves aparecem no console (para debug), sem travar a tela
      console.error("Erro silencioso de conexão:", e);
    }
  }, 1000); // <-- Tempo de espera: 1 segundo
}



async function carregarDadosIniciais(nome, senha) {
  try {
    const response = await fetch(`${API_URL}/load-ficha`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ nome, senha })
    });

    if (response.ok) {
      const data = await response.json();
      Object.assign(state, data);

      // Se por acaso ainda estiver vazio (internet lenta ou erro anterior), tenta de novo
      if (spellCatalog.length === 0) await carregarCatalogosDireita();

      document.getElementById('login-overlay').style.display = 'none';
      setActiveTab(state.activeTab || 'Combate');

      // Atualiza tudo
      window.dispatchEvent(new CustomEvent('sheet-updated'));
      if (typeof atualizarHeader === 'function') atualizarHeader();
      if (typeof inicializarDadosEsquerda === 'function') inicializarDadosEsquerda();

    } else {
      alert("Nome ou senha incorretos.");
    }
  } catch (e) {
    alert("Erro de conexão com o servidor.");
  }
}

// ... (Mantenha o restante do código original a partir daqui: const CLASS_SPELL_ATTR, DOM_SELECTORS, let state, etc...)


/* =============================================================
   SEU CÓDIGO ORIGINAL (LÓGICA + DADOS + RENDERIZAÇÃO)
============================================================= */

// Mapeamento de Classes para Atributos
const CLASS_SPELL_ATTR = {
  'mago': 'int',
  'artifice': 'int',
  'blood hunter': 'int',
  'guerreiro': 'int', // Assumindo Cavaleiro Arcano
  'ladino': 'int',    // Assumindo Trapaceiro Arcano
  'clerigo': 'sab',
  'druida': 'sab',
  'patrulheiro': 'sab',
  'monge': 'sab',
  'bardo': 'car',
  'feiticeiro': 'car',
  'bruxo': 'car',
  'paladino': 'car'
};

// Mapeamento dos seletores do Hexagrama (ATUALIZADO)
const DOM_SELECTORS = {
  'int': '.hexagrama .n5', // Inteligência
  'sab': '.hexagrama .n3', // Sabedoria
  'car': '.hexagrama .n4', // Carisma
  'con': '.hexagrama .n1', // Constituição
  'dex': '.hexagrama .n2', // Destreza
  'for': '.hexagrama .n6'  // Força
};

function calculateSpellDC() {
  // 1. Verifica qual atributo está selecionado no State
  const attrKey = state.spellDCConfig.selectedAttr;

  // Se não tiver atributo selecionado, retorna o texto "Selecione"
  if (!attrKey || attrKey === 'none') {
    return "Selecione";
  }

  // 2. Base Fixa
  const base = 8;

  // 3. Extra (do state)
  const extra = Number(state.spellDCConfig.extraMod) || 0;

  // 4. Proficiência (Lê direto do HTML #proficienciaValor)
  let prof = 2;
  const profEl = document.getElementById('proficienciaValor');
  if (profEl) {
    const val = parseInt(profEl.textContent, 10);
    if (!isNaN(val)) prof = val;
  }

  // 5. Modificador (Lê direto da bolinha do Hexagrama na Esquerda)
  let mod = 0;
  const selector = DOM_SELECTORS[attrKey];
  const hexEl = document.querySelector(selector);

  if (hexEl) {
    // Tenta pegar o valor salvo no dataset ou o texto visível
    let rawVal = hexEl.dataset.attrValue;
    if (rawVal === undefined || rawVal === null) {
      rawVal = hexEl.textContent;
    }
    const score = parseInt(rawVal, 10); // Valor do atributo (ex: 8, 10, 20)

    // Se o score for válido, calcula o modificador
    if (!isNaN(score)) {
      // Fórmula D&D 5e: (Score - 10) / 2, arredondado para baixo
      mod = Math.floor((score - 10) / 2);
    }
  }

  // 6. Cálculo Final
  return base + prof + mod + extra;
}



// ALTERADO: 'const' para 'let' para permitir sobrescrita no login
let state = {
  nome: '', // Adicionado para controle do backend
  senha: '', // Adicionado para controle do backend
  activeTab: 'Combate',
  // Configuração da DT de Magia
  spellDCConfig: {
    selectedAttr: '',
    extraMod: 0,
    lastKnownLevel: 0
  },

  // Inicializa com o texto placeholder
  dtMagias: 'Selecione',

  inventory: [],
  abilities: [],

  description: { anotacoes: '', aparencia: '', personalidade: '', objetivo: '', ideais: '', vinculos: '', fraquezas: '', historia: '' }
};

const CLASSES_WITH_SUBCLASSES = {
  'Artífice': ['Alquimista', 'Armeiro', 'Artilheiro', 'Ferreiro de Batalha', 'Arquivista', 'Infusão'],
  'Bárbaro': ['Caminho do Berserker', 'Caminho do Guerreiro Totêmico', 'Caminho do Guardião Ancestral', 'Caminho da Alma Selvagem', 'Caminho do Arauto da Tempestade', 'Caminho do Fanático', 'Caminho da Besta', 'Caminho da Magia Selvagem'],
  'Bardo': ['Colégio do Conhecimento', 'Colégio da Criação', 'Colégio da Bravura', 'Colégio do Glamour', 'Colégio das Espadas', 'Colégio dos Sussurros', 'Colégio da Criação', 'Colégio da Eloquência', 'Colégio dos Espíritos'],
  'Bruxo': ['O Arquifada', 'O Corruptor', 'O Grande Antigo', 'O Celestial', 'Hexblade', 'O Insondável', 'O Gênio', 'A Luz Imortal', 'O Morto-Vivo', 'Shinigami', 'Fantasma do Maquinario', 'O Buscador', 'Invocações Místicas'],
  'Blood Hunter': ['Ordem do Caça-Fantasmas', 'Ordem do Licantropo', 'Ordem do Mutante', 'Ordem da Alma Profana', 'Maldições de Sangue'],
  'Clérigo': ['Domínio do Conhecimento', 'Domínio da Vida', 'Domínio da Luz', 'Domínio do Zelo', 'Domínio da Natureza', 'Domínio do Destino', 'Domínio da Solidariedade', 'Domínio da Tempestade', 'Domínio da Cidade ', 'Domínio da Força', 'Domínio da Unidade', 'Domínio da Ambição', 'Domínio da Enganação', 'Domínio de Proteção', 'Domínio da Guerra', 'Domínio do Crepúsculo', 'Domínio da Forja', 'Domínio da Sepultura', 'Domínio da Ordem', 'Domínio da Paz', 'Domínio do Crepúsculo', 'Domínio Arcano', 'Domínio da Morte'],
  'Druida': ['Círculo da Terra', 'Círculo da Lua', 'Círculo dos Sonhos', 'Círculo do Pastor', 'Círculo dos Esporos', 'Círculo das Estrelas', 'Círculo do Fogo Selvagem', 'Círculo do Primordial', 'Círculo do Crepúsculo'],
  'Feiticeiro': ['Linhagem Dracônica', 'Magia Selvagem', 'Alma Divina', 'Magia das Sombras', 'Mente Sombria', 'Feitiçaria da Tempestade', 'Mente Marinha', 'Feitiçaria de Pedra', 'Feitiçaria da Fênix', 'Alma Gigante', 'Alma Piromantica', 'Mente Aberrante', 'Alma Psiônica', 'Alma Lunar', 'Alma Favorecida', 'Alma do Relógio', 'Alma Mecânica',],
  'Guerreiro': ['Campeão', 'Mestre de Batalha', 'Cavaleiro Arcano', 'Porta-Estandarte', 'Arqueiro Arcano', 'Brutamontes', 'Cavaleiro', 'Samurai', 'Guerreiro Psiônico', 'Cavaleiro Rúnico', 'Cavaleiro do Eco', 'Atirador de Elite'],
  'Ladino': ['Ladrão', 'Assassino', 'Trapaceiro Arcano', 'Inquisitivo', 'Mestre do Crime', 'Espadachim', 'Batedor', 'Revivido', 'Fantasma', 'Lâmina da Alma'],
  'Mago': ['Abjuração', 'Conjuração', 'Adivinhação', 'Encantamento', 'Evocação', 'Ilusão', 'Cronurgia', 'Necromancia', 'Criador de Runas', 'Tecnomancia', 'Teurgia', 'Transmutação', 'Graviturgia', 'Mago de Guerra', 'Cantor da Lâmina', 'Ordem dos Escribas'],
  'Monge': ['Caminho da Mão Aberta', 'Caminho das Sombras', , 'Caminho da Tranquilidade', 'Caminho dos Quatro Elementos', 'Longa Morte', 'Kensei', 'Mestre Bêbado', 'Alma Solar', 'Misericórdia', 'Forma Astral', 'Dragão Ascendente'],
  'Paladino': ['Juramento dos Anciões', 'Juramento da Conquista', 'Juramento da Coroa', 'Juramento de Devoção', 'Juramento de Glória', 'Juramento de Redenção', 'Juramento de Vingança', 'Juramento dos Observadores', 'Quebrador de Juramento', 'Juramento da Traição', 'Juramento de Heroísmo',],
  'Patrulheiro': ['Conclave da Fera', 'Conclave do Caçador', 'Espreitador das Profundezas', 'Conclave do Guardião Primordial', 'Conclave do Horizonte', 'Conclave do Matador', 'Conclave Feérico', 'Conclave do Enxame', 'Guardião do Draco'],

  'Talentos': []
};

const CLASSES_AVAILABLE = Object.keys(CLASSES_WITH_SUBCLASSES);
const conteudoEl = document.querySelector('.lado-direito .conteudo');
function uid() { return Date.now() + Math.floor(Math.random() * 1000); }

/* --- FUNÇÃO AUXILIAR PARA TRAVAR/LIBERAR SCROLL --- */
function checkScrollLock() {
  const hasModal = document.querySelector('.spell-modal-overlay') || document.querySelector('.catalog-overlay-large');
  if (hasModal) {
    document.body.classList.add('no-scroll');
  } else {
    document.body.classList.remove('no-scroll');
  }
}


function setActiveTab(tabName) {
  state.activeTab = tabName;

  // Salva apenas no navegador deste usuário
  if (state.nome) {
    localStorage.setItem(`activeTab_${state.nome}`, tabName);
  }

  document.querySelectorAll('.lado-direito .abas button').forEach(b => {
    b.classList.toggle('ativa', b.textContent.trim() === tabName);
  });
  renderActiveTab();

  // REMOVIDO: saveStateToServer(); <--- O ERRO ESTAVA AQUI
}

/* ---------------- INVENTÁRIO (ORGANIZADO EM GRID/GRUPOS) ---------------- */
function formatInventoryItem(item) {
  let subTitle = '';
  let rightSideHtml = '';
  const caretSymbol = item.expanded ? '▾' : '▸';

  // --- CABEÇALHO (Lado Direito) ---
  if (item.type === 'Arma') {
    subTitle = [item.proficiency, item.tipoArma].filter(Boolean).join(' • ');

    // Lógica Versátil
    let baseDamage = item.damage;
    if (item.empunhadura === 'Versátil' && item.useTwoHands && item.damage2Hands) {
      baseDamage = item.damage2Hands;
    }

    let dmgParts = [baseDamage];
    if (item.moreDmgList) {
      item.moreDmgList.forEach(m => { if (m.dano) dmgParts.push(m.dano); });
    }
    const finalDamage = dmgParts.join(' + ') || '-';

    let dmgFontSize = 18;
    if (finalDamage.length > 5) {
      dmgFontSize = Math.max(11, 18 - (finalDamage.length - 5) * 0.6);
    }

    rightSideHtml = `
       <div class="card-meta spell-damage" style="display: flex; align-items: center; gap: 6px; flex-shrink: 0; margin-top: -2px;">
         <span style="font-weight: 800; color: #9c27b0; font-size: ${dmgFontSize}px; white-space: nowrap; transition: font-size 0.2s;">
            ${finalDamage}
         </span>
         <img class="dice-img" src="img/imagem-no-site/dado.png" alt="dado" style="width: 20px; height: 20px;" />
       </div>
    `;

  } else if (item.type === 'Proteção' || item.type === 'protecao') {
    subTitle = [item.tipoItem, item.proficiency].filter(Boolean).join(' • ');
    const def = item.defense || '-';
    rightSideHtml = `
       <div class="card-meta spell-damage" style="font-weight: 800; color: #9c27b0; font-size: 16px; flex-shrink: 0; margin-top: -2px;">
          CA ${def}
       </div>
    `;

  } else {
    subTitle = item.type || 'Item Geral';
    rightSideHtml = '';
  }

  const checked = item.equip ? 'checked' : '';

  // --- FUNÇÕES AUXILIARES DE RENDERIZAÇÃO ---

  // Cria um stat simples (Rótulo: Valor)
  const createSimpleStat = (label, value) => {
    if (!value || value === '0' || value === '-') return '';
    return `<div style="margin-right: 12px;"><span class="purple-label">${label}:</span> <span class="white-val">${value}</span></div>`;
  };

  // Cria badges para listas (Vantagens/Desvantagens)
  const createBadgeRow = (label, list) => {
    if (!list || list.length === 0) return '';
    const badges = list.map(x => `<span style="background:#333; padding:2px 6px; border-radius:4px; font-size:11px; margin-right:4px; border:1px solid #444; color:#ddd;">${x}</span>`).join('');
    return `<div style="margin-top:4px; display:flex; align-items:center; flex-wrap:wrap;"><span class="purple-label" style="margin-right:6px;">${label}:</span> ${badges}</div>`;
  };

  let bodyContent = '';

  // 1. DADOS ESPECÍFICOS DE TIPO (ARMA / ARMADURA)
  if (item.type === 'Arma') {
    let statsLine = '';
    statsLine += createSimpleStat('Critico', item.crit);
    statsLine += createSimpleStat('Mult', item.multiplicador);
    statsLine += createSimpleStat('Alcance', item.alcance);

    const empHTML = `
        <div style="display:flex; align-items:center; gap:5px;">
            <span class="purple-label">Empunhadura:</span> 
            <span class="white-val">${item.empunhadura}</span>
            ${item.empunhadura === 'Versátil' ? `
                <label class="versatile-check-inline" title="Alternar para 2 mãos">
                    <input type="checkbox" class="toggle-versatile" data-id="${item.id}" ${item.useTwoHands ? 'checked' : ''} />
                    <span class="v-box">2 Mãos</span>
                </label>
            ` : ''}
        </div>`;

    bodyContent += `
      <div class="item-stats-row" style="margin-bottom:8px;">${statsLine}</div>
      <div style="margin-bottom:8px;">${empHTML}</div>
      
      <div class="item-data-row">
          <span class="purple-label">Dano Base:</span> 
          <span class="white-val bold">${(item.empunhadura === 'Versátil' && item.useTwoHands) ? (item.damage2Hands || item.damage) : item.damage || '-'}</span>
          ${item.damageTypes ? `<span class="separator"></span><span class="purple-label">Tipo:</span> <span class="white-val">${item.damageTypes.join(', ')}</span>` : ''}
      </div>
      
      ${(item.moreDmgList || []).map(extra => `
        <div class="item-data-row">
          <span class="purple-label">Extra:</span> <span class="white-val bold">${extra.dano}</span>
          <span class="separator"></span>
          <span class="purple-label">Tipo:</span> <span class="white-val">${extra.types.join(', ')}</span>
        </div>
      `).join('')}
      
      ${item.caracteristicas?.length ? `<div class="item-data-row" style="margin-top:4px;"><span class="purple-label">Carac.:</span> <span class="white-val bold">${item.caracteristicas.join(', ')}</span></div>` : ''}
    `;
  } else if (item.type === 'Proteção' || item.type === 'protecao') {
    bodyContent += `
       <div class="item-stats-row">
          ${item.defense ? createSimpleStat('Defesa', item.defense) : ''}
          ${item.minStrength ? createSimpleStat('Mín. FOR', item.minStrength) : ''}
          ${item.minReqAttrs && item.minReqAttrs.length ? createSimpleStat('Requisitos', item.minReqAttrs.join(', ')) : ''}
       </div>
    `;
  }

  // 2. BÔNUS GERAIS E EFEITOS MÁGICOS (GRID ORGANIZADO)
  let bonusHTML = '';

  // Grupo Ofensivo
  let offenseGroup = '';
  offenseGroup += createSimpleStat('Acerto Bônus', item.acertoBonus);
  offenseGroup += createSimpleStat('Dano Bônus', item.damageBonus);
  offenseGroup += createSimpleStat('Tipo Dano', item.damageType);

  // Grupo Defensivo
  let defenseGroup = '';
  defenseGroup += createSimpleStat('Defesa Bônus', item.defenseBonus);
  defenseGroup += createSimpleStat('Tipo Defesa', item.defenseType);

  // =====================================================================
  // 3. GRUPO PERÍCIAS (CORREÇÃO APLICADA AQUI)
  // =====================================================================
  let skillGroup = '';

  // Normaliza para array (se for string vira array, se for undefined vira array vazio)
  const disList = Array.isArray(item.disadvantageSkill)
    ? item.disadvantageSkill
    : (item.disadvantageSkill ? [item.disadvantageSkill] : []);

  const advList = Array.isArray(item.advantageSkill)
    ? item.advantageSkill
    : (item.advantageSkill ? [item.advantageSkill] : []);

  skillGroup += createBadgeRow('Desvantagem', disList);
  skillGroup += createBadgeRow('Vantagem', advList);
  // =====================================================================

  // Montagem Condicional dos Bônus
  if (offenseGroup || defenseGroup || skillGroup) {
    bonusHTML += `<div style="margin-top:10px; padding-top:8px; border-top:1px solid rgba(255,255,255,0.1);">`;

    if (offenseGroup) {
      bonusHTML += `<div style="display:flex; flex-wrap:wrap; margin-bottom:4px;">${offenseGroup}</div>`;
    }
    if (defenseGroup) {
      bonusHTML += `<div style="display:flex; flex-wrap:wrap; margin-bottom:4px;">${defenseGroup}</div>`;
    }
    if (skillGroup) {
      bonusHTML += `<div>${skillGroup}</div>`;
    }

    bonusHTML += `</div>`;
  }

  bodyContent += bonusHTML;

  const descHtml = item.description ? `<div class="item-description-text">${item.description}</div>` : '';

  return `
    <div class="card item-card ${item.expanded ? 'expanded' : ''}" data-id="${item.id}">
      <div class="card-header spell-header" style="padding: 10px 12px; display: flex; justify-content: space-between; align-items: flex-start;">
        
        <span class="caret" style="margin-top: 4px; flex-shrink: 0; color: #9c27b0;">${caretSymbol}</span>
        
        <div style="display: flex; flex-direction: column; flex: 1; min-width: 0; padding-right: 5px;">
          <div style="display: flex; justify-content: space-between; align-items: flex-start; gap: 8px;">
            <div class="card-title spell-title" style="font-size: 16px; font-weight: 800; color: #fff; min-width: 0; line-height: 1.2; word-break: break-word;">
                ${escapeHtml(item.name)}
            </div>
            ${rightSideHtml}
          </div>
          ${subTitle ? `<div class="card-sub" style="font-size: 11px; color: #bdbdbd; margin-top: 3px; line-height: 1.2;">${subTitle}</div>` : ''}
        </div>

        <label class="check-ativar header-equip" style="margin-top: 2px; flex-shrink: 0;">
            <input class="item-equip-checkbox" type="checkbox" data-id="${item.id}" ${checked}/>
            <span class="square-check"></span>
        </label>
      </div>
      
      <div class="card-body" style="${item.expanded ? '' : 'display:none;'}">
        ${bodyContent}
        ${descHtml}
        <div class="item-actions-footer">
          <a href="#" class="remover-item" data-id="${item.id}">Remover</a>
          <a href="#" class="editar-item" data-id="${item.id}">Editar</a>
        </div>
      </div>
    </div>
  `;
}


/* ---------------- INVENTÁRIO (CORRIGIDO: NÃO FOCA SE ESTIVER VAZIO) ---------------- */
function renderInventory() {
  const inputAntigo = document.getElementById('filterItens');
  // Pega o valor antes de destruir o HTML
  const termo = (inputAntigo?.value || '').toLowerCase();

  // 1. Filtra itens
  const itensFiltrados = state.inventory.filter(i => {
    const text = (i.name + (i.description || "") + (i.type || "")).toLowerCase();
    return text.includes(termo);
  });

  // 2. Separa em Grupos
  const armas = itensFiltrados.filter(i => i.type === 'Arma');
  const armaduras = itensFiltrados.filter(i => i.type === 'Proteção' || i.type === 'protecao');
  const gerais = itensFiltrados.filter(i => i.type !== 'Arma' && i.type !== 'Proteção' && i.type !== 'protecao');

  // Se tem texto, expande. Se não, recolhe.
  const forceExpand = termo.length > 0;

  // 3. Monta o HTML
  let listaHTML = '';
  if (armas.length > 0) listaHTML += renderItemGroup('Armas', armas, 'inv-armas', forceExpand);
  if (armaduras.length > 0) listaHTML += renderItemGroup('Armaduras & Proteção', armaduras, 'inv-armaduras', forceExpand);
  if (gerais.length > 0) listaHTML += renderItemGroup('Itens Gerais', gerais, 'inv-gerais', forceExpand);

  if (!listaHTML) listaHTML = `<div class="empty-tip">Nenhum item encontrado.</div>`;

  const html = `
        <div class="inventory-controls controls-row">
            <input id="filterItens" placeholder="Filtrar itens..." value="${escapeHtml(termo)}" />
            <div class="right-controls">
                <button id="botAddItem" class="btn-add">Adicionar</button>
            </div>
        </div>
        <div class="inventory-list-wrapper">
            ${listaHTML}
        </div>
    `;

  conteudoEl.innerHTML = html;

  document.getElementById('botAddItem').addEventListener('click', () => openItemCatalogOverlay());

  bindInventoryCardEvents();
  bindInventorySectionEvents();
  aplicarEnterNosInputs(conteudoEl);

  // --- CORREÇÃO DO FOCO AUTOMÁTICO ---
  const inputFiltro = document.getElementById('filterItens');
  if (inputFiltro) {
    // Só foca se houver texto digitado (usuário pesquisando)
    // Se estiver vazio (mudança de aba), não foca.
    if (inputFiltro.value.length > 0) {
      inputFiltro.focus();
      const len = inputFiltro.value.length;
      inputFiltro.setSelectionRange(len, len);
    }
    inputFiltro.oninput = renderInventory;
  }
}


/* =============================================================
   CORREÇÃO 2: INVENTÁRIO LOCAL
   (Substitua bindInventoryCardEvents)
============================================================= */
function bindInventoryCardEvents() {
  const findItemById = (rawId) => state.inventory.find(x => String(x.id) === String(rawId));

  // --- 1. EXPANDIR/RECOLHER (SOMENTE LOCAL) ---
  document.querySelectorAll('.item-card').forEach(card => {
    const rawId = card.getAttribute('data-id');
    const header = card.querySelector('.card-header');

    header.onclick = (ev) => {
      // Ignora cliques em botões interativos
      if (ev.target.closest('.header-equip') ||
        ev.target.closest('.item-actions-footer') ||
        ev.target.closest('.dice-img') ||
        ev.target.closest('.spell-damage')) {
        return;
      }

      const it = findItemById(rawId);
      if (!it) return;

      // Altera o estado SOMENTE NA MEMÓRIA LOCAL
      it.expanded = !it.expanded;

      const body = card.querySelector('.card-body');
      const caret = card.querySelector('.caret');

      if (it.expanded) {
        body.style.display = 'block';
        caret.textContent = '▾';
        card.classList.add('expanded');
      } else {
        body.style.display = 'none';
        caret.textContent = '▸';
        card.classList.remove('expanded');
      }
    };
  });

  // --- 2. CHECKBOX EQUIPAR (GLOBAL - ISSO PRECISA SALVAR) ---
  document.querySelectorAll('.item-equip-checkbox').forEach(ch => {
    ch.onchange = (ev) => {
      const rawId = ev.target.getAttribute('data-id');
      const item = findItemById(rawId);
      const isChecked = ev.target.checked;

      if (item && isChecked) {
        // Lógica de Exclusividade (Só 1 Armadura / Só 1 Escudo)
        if (item.type === 'Proteção' || item.type === 'protecao') {
          const isEscudo = item.tipoItem?.toLowerCase() === 'escudo' || item.proficiency?.toLowerCase() === 'escudo';
          state.inventory.forEach(other => {
            if (String(other.id) !== String(rawId) && (other.type === 'Proteção' || other.type === 'protecao')) {
              const otherIsEscudo = other.tipoItem?.toLowerCase() === 'escudo' || other.proficiency?.toLowerCase() === 'escudo';
              if (isEscudo === otherIsEscudo) {
                other.equip = false; // Desmarca no dado
                // Atualiza visualmente se existir na tela
                const otherChk = document.querySelector(`.item-equip-checkbox[data-id="${other.id}"]`);
                if (otherChk) otherChk.checked = false;
              }
            }
          });
        }
      }

      if (item) item.equip = isChecked;

      // AQUI SIM SALVAMOS, POIS EQUIPAR AFETA A CA DE TODOS
      saveStateToServer();

      if (state.activeTab === 'Combate') {
        const scrollY = window.scrollY;
        renderActiveTab();
        window.scrollTo(0, scrollY);
      }
      if (typeof atualizarAC === 'function') atualizarAC();
    };
  });

  // --- 3. ALTERNAR 2 MÃOS (GLOBAL) ---
  document.querySelectorAll('.toggle-versatile').forEach(ch => {
    ch.onchange = (ev) => {
      const rawId = ev.target.getAttribute('data-id');
      const item = findItemById(rawId);
      if (item) {
        item.useTwoHands = ev.target.checked;
        saveStateToServer(); // Salva pois afeta dano
        const scrollY = window.scrollY;
        renderActiveTab();
        window.scrollTo(0, scrollY);
      }
    };
  });

  // --- 4. REMOVER e EDITAR (GLOBAL) ---
  document.querySelectorAll('.remover-item').forEach(el => {
    el.onclick = (ev) => {
      ev.preventDefault();
      const rawId = el.getAttribute('data-id');
      const scrollY = window.scrollY;
      state.inventory = state.inventory.filter(i => String(i.id) !== String(rawId));
      renderActiveTab();
      window.scrollTo(0, scrollY);
      saveStateToServer(); // Remover afeta todos
      window.dispatchEvent(new CustomEvent('sheet-updated'));
    };
  });

  document.querySelectorAll('.editar-item').forEach(el => {
    el.onclick = (ev) => {
      ev.preventDefault();
      const rawId = el.getAttribute('data-id');
      const item = findItemById(rawId);
      if (item) openItemModal(item);
    };
  });
}

function bindInventorySectionEvents() {
  document.querySelectorAll('.toggle-inv-header').forEach(header => {
    header.addEventListener('click', (e) => {
      e.preventDefault();

      const key = header.getAttribute('data-key');
      state.collapsedSections[key] = !state.collapsedSections[key];

      // REMOVIDO: saveStateToServer(); <-- NÃO SALVAR NO SERVER
      // A função mesclarEstadoVisual já cuida de manter isso salvo localmente quando atualiza

      // Atualiza DOM direto para não perder foco/scroll
      const contentDiv = header.nextElementSibling;
      const arrowSpan = header.querySelector('span');

      if (contentDiv) {
        if (contentDiv.style.display === 'none') {
          contentDiv.style.display = 'block';
          if (arrowSpan) arrowSpan.textContent = '▾';
        } else {
          contentDiv.style.display = 'none';
          if (arrowSpan) arrowSpan.textContent = '▸';
        }
      }
    });
  });
}

/* ---------------- COMBATE (CORRIGIDO: NÃO FOCA SE ESTIVER VAZIO) ---------------- */
function renderCombat() {
  const inputAntigo = document.getElementById('filterCombat');
  const termo = (inputAntigo?.value || '').toLowerCase();

  // 1. Filtra apenas equipados e pelo texto
  const equipados = state.inventory.filter(i => i.equip && (i.name + (i.description || "")).toLowerCase().includes(termo));

  // 2. Agrupa
  const armas = equipados.filter(i => i.type === 'Arma');
  const defesas = equipados.filter(i => i.type === 'Proteção' || i.type === 'protecao');
  const outros = equipados.filter(i => i.type !== 'Arma' && i.type !== 'Proteção' && i.type !== 'protecao');

  // 3. Monta HTML
  let listaHTML = '';

  // Expande se estiver buscando
  const forceExpand = termo.length > 0;

  if (armas.length > 0) listaHTML += renderItemGroup('Ataques Disponíveis', armas, 'cmb-ataques', forceExpand);
  if (defesas.length > 0) listaHTML += renderItemGroup('Equipamento Defensivo', defesas, 'cmb-defesa', forceExpand);
  if (outros.length > 0) listaHTML += renderItemGroup('Acessórios & Outros', outros, 'cmb-outros', forceExpand);

  if (!listaHTML) {
    listaHTML = `<p class="empty-tip">Nada equipado para combate.</p>`;
  }

  const html = `
        <div class="controls-row">
            <input id="filterCombat" placeholder="Filtrar combate..." value="${escapeHtml(termo)}" />
        </div>
        <div class="inventory-list-wrapper">
            ${listaHTML}
        </div>
    `;

  conteudoEl.innerHTML = html;

  bindInventoryCardEvents();
  bindInventorySectionEvents();

  // --- CORREÇÃO DO FOCO AUTOMÁTICO ---
  const inputFiltro = document.getElementById('filterCombat');
  if (inputFiltro) {
    // Só foca se o usuário já estiver digitando algo
    if (inputFiltro.value.length > 0) {
      inputFiltro.focus();
      const len = inputFiltro.value.length;
      inputFiltro.setSelectionRange(len, len);
    }
    inputFiltro.oninput = renderCombat;
  }
}

/* ---------------- MODAL UNIFICADO (Item, Arma, Armadura) ---------------- */

const PROFICIENCIAS_ARMA = ['Armas Simples', 'Armas Marciais', 'Arma de Fogo'];
const TIPOS_ARMA = ['Corpo a Corpo', 'A Distancia', 'Misto'];
const EMPUNHADURAS = ['Uma mao', 'Duas Maos', 'Versátil'];
const CARACTERISTICAS_ARMA = ['Agil', 'Alcance', 'Arremesso', 'Distância', 'Especial', 'Leve', 'Munição', 'Pesada', 'Recarga', 'Montaria', 'Rede'];
const TIPOS_DANO = ['Contundente', 'Cortante', 'Perfurante', 'Ácido', 'Elétrico', 'Gélido', 'Ígneo', 'Trovejante', 'Energético', 'Necrótico', 'Psíquico', 'Radiante', 'Venenoso'];

const PROFICIENCIAS_ARMADURA = ['Leve', 'Media', 'Pesada'];
const TIPOS_ARMADURA = ['Armadura', 'Escudo'];
const ATRIBUTOS_DND = ['Força', 'Destreza', 'Constituição', 'Inteligência', 'Sabedoria', 'Carisma'];
const PERICIAS_LISTA = [
  'Furtividade', 'Acrobacia', 'Prestidigitação',
  'Atuação', 'Enganação', 'Intimidação', 'Persuasão',
  'Atletismo',
  'Arcanismo', 'História', 'Investigação', 'Natureza', 'Religião',
  'Adestrar Animais', 'Intuição', 'Medicina', 'Percepção', 'Sobrevivência'
];


/* ---------------- MODAL UNIFICADO (COM CORREÇÕES: ACERTO VAZIO + CORREÇÕES ANTERIORES) ---------------- */
function openItemModal(existingItem = null) {
  const existingOverlay = document.querySelector('.spell-modal-overlay');
  if (existingOverlay) existingOverlay.remove();

  let currentTab = 'Item';
  const isEditMode = !!existingItem;

  if (existingItem) {
    if (existingItem.type === 'Arma') currentTab = 'Arma';
    else if (existingItem.type === 'Proteção') currentTab = 'Armadura';
    else currentTab = 'Item';
  }

  const modal = document.createElement('div');
  modal.className = 'spell-modal-overlay';
  modal.style.zIndex = '11000';

  const pre = existingItem || {};

  // CORREÇÃO 1: Atributo padrão 'Nenhum'
  let defaultAttackAttr = pre.attackAttribute || 'Nenhum';

  // --- CORREÇÃO 2: BÔNUS DE ACERTO VAZIO POR PADRÃO ---
  // Se for edição, mantém o valor. Se for novo, começa vazio string vazia ('') para mostrar o placeholder
  const defaultAttackBonus = pre.attackBonus || ''; 

  const ATTR_OPTIONS = ['Força', 'Destreza', 'Constituição', 'Inteligência', 'Sabedoria', 'Carisma', 'Nenhum'];
  const renderAttrOptions = (selected) => ATTR_OPTIONS.map(a => `<option value="${a}" ${a === selected ? 'selected' : ''}>${a}</option>`).join('');

  let headerContentHTML = '';
  if (isEditMode) {
    headerContentHTML = `<h2 style="margin:0; font-size:24px; color:#fff;">Editar ${currentTab}</h2>`;
  } else {
    headerContentHTML = `
        <div class="modal-tabs-header">
           <button class="modal-tab-btn" data-tab="Item">Item</button>
           <button class="modal-tab-btn" data-tab="Arma">Arma</button>
           <button class="modal-tab-btn" data-tab="Armadura">Armadura</button>
        </div>
      `;
  }

  modal.innerHTML = `
    <div class="spell-modal" style="width:920px; max-width:calc(100% - 40px);">
      <div class="modal-header" style="align-items:center; border-bottom:none; padding-bottom:0;">
        ${headerContentHTML}
        <div style="display:flex;gap:8px;align-items:center;">
          <button id="btnListaPadrao" class="btn-add" style="background:#9c27b0;border:none;padding:8px 14px; font-weight:800;">Lista Padrao<br/>de Itens</button>
          <button class="modal-close">✖</button>
        </div>
      </div>
      <div id="modal-content-body" class="modal-body" style="display:block; padding-top:12px;"></div>
      <div class="modal-actions" style="display:flex;gap:8px;justify-content:flex-end;padding:12px;">
        <button class="btn-add btn-save-item">${existingItem ? 'Salvar' : 'Adicionar'}</button>
        <button class="btn-add btn-cancel">Cancelar</button>
      </div>
    </div>
  `;

  document.body.appendChild(modal);
  const btnLista = modal.querySelector('#btnListaPadrao');
  if (btnLista) {
    btnLista.addEventListener('click', (ev) => {
      ev.preventDefault(); modal.remove(); checkScrollLock(); openItemCatalogOverlay();
    });
  }
  checkScrollLock();

  const contentBody = modal.querySelector('#modal-content-body');
  const btns = modal.querySelectorAll('.modal-tab-btn');

  const renderPericiaMulti = (id, selectedList) => `
      <div id="${id}" class="multi-select-field" style="margin-top:0;">
         <div class="display"><span>${selectedList.length ? selectedList.join(', ') : 'Selecione...'}</span> <span style="color:#9c27b0;">▾</span></div>
         <div class="panel" style="display:none; position:absolute; z-index:12000; width:100%;">
            ${PERICIAS_LISTA.map(p => `
               <label style="display:block;padding:6px;cursor:pointer;">
                  <input type="checkbox" value="${p}" ${selectedList.includes(p) ? 'checked' : ''} /> ${p}
               </label>
            `).join('')}
         </div>
      </div>
   `;

  function renderBody(tab) {
    currentTab = tab;
    if (btns.length > 0) btns.forEach(b => b.classList.toggle('active', b.getAttribute('data-tab') === tab));

    const descContent = pre.description || '';
    const editorHTML = createRichEditorHTML(descContent, 'item-editor-content');
    const nameInput = `<div style="grid-column: 1 / -1;"><label>Nome <span style="color:#ff5555">*</span></label><input id="item-name" type="text" value="${escapeHtml(pre.name || '')}" placeholder="Nome do item (Obrigatório)" /></div>`;
    const descLabel = `<div style="grid-column: 1 / -1;"><label>Descrição</label>${editorHTML}</div>`;
    let html = '';

    if (tab === 'Item') {
      const disadv = Array.isArray(pre.disadvantageSkill) ? pre.disadvantageSkill : (pre.disadvantageSkill ? [pre.disadvantageSkill] : []);
      const adv = Array.isArray(pre.advantageSkill) ? pre.advantageSkill : (pre.advantageSkill ? [pre.advantageSkill] : []);
      
      // CORREÇÃO 3: Tipo de Defesa começa vazio
      html = `
         <div style="display:grid; grid-template-columns: 1fr 1fr 1fr; gap:12px; align-items:end;">
            ${nameInput}
            <div><label>Atributo de Acerto</label><select id="item-attack-attr" class="dark-select">${renderAttrOptions(defaultAttackAttr)}</select></div>
            <div><label>Bônus de Acerto</label><input id="item-attack-bonus" type="number" value="${defaultAttackBonus}" placeholder="+1, +2..." /></div>
            <div><label>Dano Bônus</label><input id="item-danobonus" type="text" value="${escapeHtml(pre.damageBonus || '')}" /></div>
            <div><label>Tipo de Dano</label><input id="item-dmgtype" type="text" value="${escapeHtml(pre.damageType || '')}" /></div>
            <div style="grid-column: 1 / span 1;"><label>Defesa(CA) Bonus</label><input id="item-defense" type="text" value="${escapeHtml(pre.defenseBonus || '')}" /></div>
            <div style="grid-column: 2 / span 2;"><label>Tipo de Defesa</label><input id="item-defensetype" type="text" value="${escapeHtml(pre.defenseType || '')}" placeholder="Ex: Mágico, Escudo..." /></div>
            <div style="grid-column: 1 / span 1.5;"><label>Desvantagem</label>${renderPericiaMulti('disadv-field-item', disadv)}</div>
            <div style="grid-column: 2.5 / span 1.5;"><label>Vantagem</label>${renderPericiaMulti('adv-field-item', adv)}</div>
            ${descLabel}
         </div>`;
    } else if (tab === 'Arma') {
      const profSelected = pre.proficiency || '';
      const tipoSelected = pre.tipoArma || '';
      const empSelected = pre.empunhadura || '';
      const carSelected = pre.caracteristicas || [];
      const dmgTypesSelected = pre.damageTypes || [];
      const nameInputArma = `<div style="grid-column: 1 / span 4;"><label>Nome <span style="color:#ff5555">*</span></label><input id="item-name" type="text" value="${escapeHtml(pre.name || '')}" placeholder="Nome da Arma (Obrigatório)" /></div>`;

      html = `
        <div style="display:grid; grid-template-columns: 1fr 1fr 1fr 1fr; gap:12px; align-items:start;">
          ${nameInputArma}
          <div><label>Proficiência</label><div class="pills-container" id="prof-pills">${PROFICIENCIAS_ARMA.map(p => `<button type="button" class="pill single-select ${p === profSelected ? 'active' : ''}" data-val="${escapeHtml(p)}">${escapeHtml(p)}</button>`).join('')}</div></div>
          <div><label>Tipo</label><div class="pills-container" id="tipo-pills">${TIPOS_ARMA.map(p => `<button type="button" class="pill single-select ${p === tipoSelected ? 'active' : ''}" data-val="${escapeHtml(p)}">${escapeHtml(p)}</button>`).join('')}</div></div>
          <div><label>Empunhadura</label><div class="pills-container" id="emp-pills">${EMPUNHADURAS.map(p => `<button type="button" class="pill single-select ${p === empSelected ? 'active' : ''}" data-val="${escapeHtml(p)}">${escapeHtml(p)}</button>`).join('')}</div></div>
          <div>
              <label>Caracteristica</label>
              <div id="car-field" class="multi-select-field" style="margin-top:6px; position:relative;">
                <div class="display"><span>${carSelected.length ? carSelected.join(', ') : 'Selecione...'}</span> <span style="color:#9c27b0;">▾</span></div>
                <div id="car-panel" class="panel" style="display:none; position:absolute; z-index:12000; width:100%;">
                  ${CARACTERISTICAS_ARMA.map(c => `<label style="display:block;padding:6px;"><input type="checkbox" value="${c}" ${carSelected.includes(c) ? 'checked' : ''} /> ${c}</label>`).join('')}
                </div>
              </div>
          </div>
          <div style="grid-column: 1 / span 2; display:flex; gap:12px;">
             <div style="flex:1;"><label>Atributo de Acerto</label><select id="item-attack-attr" class="dark-select">${renderAttrOptions(defaultAttackAttr)}</select></div>
             <div style="flex:1;"><label>Bônus de Acerto</label><input id="item-attack-bonus" type="number" value="${defaultAttackBonus}" placeholder="+0" /></div>
          </div>
          <div style="grid-column: 3 / span 2;">
              <label>Sintonização</label>
              <select id="item-attune-weapon" class="dark-select">
                 <option value="Não" ${pre.attunement !== 'Sim' ? 'selected' : ''}>Não</option>
                 <option value="Sim" ${pre.attunement === 'Sim' ? 'selected' : ''}>Sim</option>
              </select>
          </div>
          <div style="grid-column: 1 / span 4; display: grid; grid-template-columns: repeat(4, 1fr); gap: 12px; align-items: end;">
            <div id="layout-standard" style="display: ${empSelected === 'Versátil' ? 'none' : 'contents'};">
                <div style="grid-column: span 2;"><label>Dano</label><input id="item-damage" type="text" value="${escapeHtml(pre.damage || '')}" placeholder="Ex: 1d8" /></div>
                <div id="dmg-type-container-std" style="grid-column: span 2;"></div>
            </div>
            <div id="layout-versatile" style="display: ${empSelected === 'Versátil' ? 'contents' : 'none'};">
                <div style="grid-column: span 2;"><label>Dano (1 mão / Base)</label><input id="item-damage-1hand" type="text" value="${escapeHtml(pre.damage || '')}" placeholder="Ex: 1d8" /></div>
                <div style="grid-column: span 2;"><label>Dano (2 mãos)</label><input id="item-damage-2hands" type="text" value="${escapeHtml(pre.damage2Hands || '')}" placeholder="Ex: 1d10" /></div>
                <div id="dmg-type-container-ver" style="grid-column: 1 / span 4;"></div>
            </div>
          </div>
          <div id="dmg-field-wrapper" style="display:none;">
              <label>Tipo de Dano Principal</label>
              <div id="dmg-field" class="multi-select-field" style="margin-top:6px; position:relative;">
                  <div class="display"><span>${dmgTypesSelected.length ? dmgTypesSelected.join(', ') : 'Selecione...'}</span> <span style="color:#9c27b0;">▾</span></div>
                  <div id="dmg-panel" class="panel" style="display:none; position:absolute; z-index:12000; width:100%;">
                    ${TIPOS_DANO.map(c => `<label style="display:block;padding:6px;"><input type="checkbox" value="${c}" ${dmgTypesSelected.includes(c) ? 'checked' : ''} /> ${c}</label>`).join('')}
                  </div>
              </div>
          </div>
          <div style="grid-column: 1 / span 1;"><label>Critico</label><input id="item-crit" type="text" value="${escapeHtml(pre.crit || '20')}" /></div>
          <div style="grid-column: 2 / span 1;"><label>Multiplicador</label><input id="item-mult" type="text" value="${escapeHtml(pre.multiplicador || '2')}" /></div>
          <div style="grid-column: 3 / span 1;"><label>Alcance</label><input id="item-range" type="text" value="${escapeHtml(pre.alcance || '1.5m')}" /></div>
          <div style="grid-column: 1 / span 4;">
              <div id="extra-dmg-list" style="display:flex; flex-direction:column; gap:8px;"></div>
              <button type="button" id="btn-add-dmg" style="margin-top:8px; background:#9c27b0; color:white; border:none; padding:6px 12px; border-radius:4px; font-weight:bold; cursor:pointer;">+ Adicionar Dano Extra</button>
          </div>
          <div style="grid-column:1 / span 4;"><label>Descrição</label>${editorHTML}</div>
        </div>
      `;
    } else if (tab === 'Armadura') {
      const profSelected = pre.proficiency || '';
      const tipoSelected = pre.tipoItem || 'Armadura';
      const minReqAttrs = pre.minReqAttrs || ['Força'];
      const disadv = Array.isArray(pre.disadvantageSkill) ? pre.disadvantageSkill : (pre.disadvantageSkill ? [pre.disadvantageSkill] : []);
      const adv = Array.isArray(pre.advantageSkill) ? pre.advantageSkill : (pre.advantageSkill ? [pre.advantageSkill] : []);
      const nameInputArmadura = `<div style="grid-column: 1 / span 3;"><label>Nome <span style="color:#ff5555">*</span></label><input id="item-name" type="text" value="${escapeHtml(pre.name || '')}" placeholder="Nome da Armadura (Obrigatório)" /></div>`;

      html = `
        <div style="display:grid; grid-template-columns: 1.2fr 0.8fr 1.2fr; gap:12px; align-items:start;">
           ${nameInputArmadura}
           <div><label>Proficiência</label><div class="pills-container" id="arm-prof-pills">${PROFICIENCIAS_ARMADURA.map(p => `<button type="button" class="pill single-select ${p === profSelected ? 'active' : ''}" data-val="${escapeHtml(p)}">${escapeHtml(p)}</button>`).join('')}</div></div>
           <div style="text-align:center;"><label style="text-align:left;">Defesa (CA)</label><input id="item-defense" type="text" value="${escapeHtml(pre.defense || '')}" placeholder="+2 ou 14" /></div>
           <div><label>Tipo</label><div class="pills-container" id="arm-tipo-pills">${TIPOS_ARMADURA.map(p => `<button type="button" class="pill single-select ${p === tipoSelected ? 'active' : ''}" data-val="${escapeHtml(p)}">${escapeHtml(p)}</button>`).join('')}</div></div>
           <div style="grid-column: 1 / span 3; display:grid; grid-template-columns: 1fr 1fr 1fr 1fr; gap:12px;">
               <div style="position:relative;">
                  <div id="min-req-container" class="multi-select-field">
                     <div id="min-req-trigger" class="label-dropdown-trigger" style="margin-top:20px; min-height:38px; display:flex; align-items:center;">
                        <span style="color:#bbb; margin-right:4px; white-space:nowrap;">Mínimo de:</span>
                        <span id="min-req-label-text" style="color:#fff; flex:1; line-height:1.2;">${minReqAttrs.join(', ')}</span> 
                        <span class="purple-caret" style="margin-left:4px;">▾</span>
                     </div>
                     <div id="min-req-panel" class="panel" style="display:none; position:absolute; z-index:12000; width:100%; top:100%; left:0;">
                        ${ATRIBUTOS_DND.map(attr => `<label style="display:block;padding:6px;cursor:pointer;"><input type="checkbox" value="${attr}" ${minReqAttrs.includes(attr) ? 'checked' : ''} /> ${attr}</label>`).join('')}
                     </div>
                  </div>
                  <input id="item-minstr" type="number" value="${pre.minStrength || 0}" style="margin-top:4px; width:100%;" />
               </div>
               <div><label>Sintonização</label><select id="item-attune" class="dark-select"><option value="Não" ${pre.attunement !== 'Sim' ? 'selected' : ''}>Não</option><option value="Sim" ${pre.attunement === 'Sim' ? 'selected' : ''}>Sim</option></select></div>
               <div><label>Desvantagem</label>${renderPericiaMulti('disadv-field', disadv)}</div>
               <div><label>Vantagem</label>${renderPericiaMulti('adv-field', adv)}</div>
           </div>
           <div style="grid-column: 1 / span 3;"><label>Descrição</label>${editorHTML}</div>
        </div>`;
    }
    contentBody.innerHTML = html;
    bindTabEvents(tab);
    initRichEditorEvents('item-editor-content');
    const iName = contentBody.querySelector('#item-name');
    if (iName) iName.focus();
  }

  function createDamageRow(danoVal = '', typesVal = []) {
    const row = document.createElement('div');
    row.className = 'extra-dmg-row';
    row.style.display = 'grid';
    row.style.gridTemplateColumns = '1fr 1fr 1fr 1fr';
    row.style.gap = '12px';
    row.style.alignItems = 'start';
    const html = `<div style="grid-column:1/span 2;"><input type="text" class="extra-dmg-input" value="${escapeHtml(danoVal)}" placeholder="Ex: +1d6"/></div><div style="grid-column:3/span 2;position:relative;" class="extra-dmg-select-container"><div class="multi-select-field"><div class="display"><span>${typesVal.length ? typesVal.join(', ') : 'Tipo'}</span> <span style="color:#9c27b0;">▾</span></div><div class="panel" style="display:none;position:absolute;z-index:12000;width:100%;">${TIPOS_DANO.map(c => `<label style="display:block;padding:6px;"><input type="checkbox" value="${c}" ${typesVal.includes(c) ? 'checked' : ''} /> ${c}</label>`).join('')}</div></div><button type="button" class="remove-dmg-row" style="position:absolute;right:-25px;top:5px;background:none;border:none;color:#d88;font-weight:bold;cursor:pointer;">✖</button></div>`;
    row.innerHTML = html;
    const field = row.querySelector('.multi-select-field'); const display = field.querySelector('.display'); const panel = field.querySelector('.panel');
    display.addEventListener('click', (e) => { e.stopPropagation(); const isOpen = panel.style.display === 'block'; document.querySelectorAll('.panel').forEach(p => p.style.display = 'none'); panel.style.display = isOpen ? 'none' : 'block'; });
    panel.querySelectorAll('input').forEach(chk => { chk.addEventListener('change', () => { const vals = Array.from(panel.querySelectorAll('input:checked')).map(x => x.value); display.querySelector('span').textContent = vals.length ? vals.join(', ') : 'Tipo'; }); });
    row.querySelector('.remove-dmg-row').addEventListener('click', () => row.remove());
    return row;
  }

  function bindTabEvents(tab) {
    modal.querySelectorAll('.pill.single-select').forEach(p => { p.addEventListener('click', () => { p.parentElement.querySelectorAll('.pill').forEach(x => x.classList.remove('active')); p.classList.add('active'); }); });
    modal.querySelectorAll('.multi-select-field').forEach(field => { if (field.id === 'dmg-field' || field.closest('.extra-dmg-row')) return; let trigger = field.querySelector('.label-dropdown-trigger') || field.querySelector('.display'); const panel = field.querySelector('.panel'); trigger.onclick = (e) => { e.stopPropagation(); const isOpen = panel.style.display === 'block'; document.querySelectorAll('.panel').forEach(p => p.style.display = 'none'); panel.style.display = isOpen ? 'none' : 'block'; }; panel.querySelectorAll('input[type="checkbox"]').forEach(chk => { chk.onchange = () => { const vals = Array.from(panel.querySelectorAll('input:checked')).map(x => x.value); const span = trigger.querySelector('span:first-child') || modal.querySelector('#min-req-label-text'); if (span) span.textContent = vals.length ? vals.join(', ') : (field.id === 'min-req-container' ? '' : 'Selecione...'); }; }); });

    if (tab === 'Arma') {
      const empPills = modal.querySelectorAll('#emp-pills .pill');
      const inputDanoPrincipal = modal.querySelector('#item-damage');
      const inputDano1Mao = modal.querySelector('#item-damage-1hand');
      const dmgWrapper = modal.querySelector('#dmg-field-wrapper');
      const layoutStd = modal.querySelector('#layout-standard');
      const layoutVer = modal.querySelector('#layout-versatile');
      const containerStd = modal.querySelector('#dmg-type-container-std');
      const containerVer = modal.querySelector('#dmg-type-container-ver');
      const organizarLayoutDano = (isVersatil) => {
        dmgWrapper.style.display = 'block';
        if (isVersatil) { layoutStd.style.display = 'none'; layoutVer.style.display = 'contents'; if (containerVer) containerVer.appendChild(dmgWrapper); if (inputDanoPrincipal.value) inputDano1Mao.value = inputDanoPrincipal.value; }
        else { layoutStd.style.display = 'contents'; layoutVer.style.display = 'none'; if (containerStd) containerStd.appendChild(dmgWrapper); if (inputDano1Mao.value) inputDanoPrincipal.value = inputDano1Mao.value; }
      };
      inputDano1Mao.oninput = () => { inputDanoPrincipal.value = inputDano1Mao.value; };
      empPills.forEach(p => { p.addEventListener('click', () => { organizarLayoutDano(p.getAttribute('data-val') === 'Versátil'); }); });
      const empInicial = modal.querySelector('#emp-pills .pill.active')?.getAttribute('data-val');
      organizarLayoutDano(empInicial === 'Versátil');
      const dmgField = dmgWrapper.querySelector('.multi-select-field'); const dmgDisplay = dmgField.querySelector('.display'); const dmgPanel = dmgField.querySelector('.panel');
      dmgDisplay.onclick = (e) => { e.stopPropagation(); const isNowOpen = dmgPanel.style.display === 'block'; document.querySelectorAll('.panel').forEach(p => p.style.display = 'none'); dmgPanel.style.display = isNowOpen ? 'none' : 'block'; };
      dmgPanel.querySelectorAll('input').forEach(chk => { chk.onchange = () => { const vals = Array.from(dmgPanel.querySelectorAll('input:checked')).map(x => x.value); dmgDisplay.querySelector('span').textContent = vals.length ? vals.join(', ') : 'Selecione...'; }; });
      const extraDmgContainer = modal.querySelector('#extra-dmg-list'); const btnAddExtra = modal.querySelector('#btn-add-dmg');
      if (pre.moreDmgList?.length && extraDmgContainer.children.length === 0) { pre.moreDmgList.forEach(item => extraDmgContainer.appendChild(createDamageRow(item.dano, item.types))); }
      btnAddExtra.onclick = (ev) => { ev.preventDefault(); extraDmgContainer.appendChild(createDamageRow()); };
    }
  }

  renderBody(currentTab);
  if (btns.length > 0) btns.forEach(b => b.addEventListener('click', () => renderBody(b.getAttribute('data-tab'))));
  document.addEventListener('click', (e) => { if (!e.target.closest('.multi-select-field')) document.querySelectorAll('.panel').forEach(p => p.style.display = 'none'); });

  const closeMe = () => { modal.remove(); checkScrollLock(); };
  modal.querySelector('.modal-close').addEventListener('click', closeMe);
  modal.querySelector('.btn-cancel').addEventListener('click', (ev) => { ev.preventDefault(); closeMe(); });

  modal.querySelector('.btn-save-item').addEventListener('click', (ev) => {
    ev.preventDefault();
    const nameInput = modal.querySelector('#item-name');
    const name = nameInput.value.trim();
    if (!name) { alert("O nome do item é obrigatório!"); nameInput.style.borderColor = "#ff5555"; nameInput.focus(); return; }
    const desc = document.getElementById('item-editor-content').innerHTML;

    let newItem = {
      id: existingItem ? existingItem.id : uid(),
      name: name,
      description: desc,
      expanded: true,
      equip: existingItem ? !!existingItem.equip : false
    };

    if (currentTab === 'Item') {
      newItem.type = 'Geral'; newItem.isEquipable = true;
      // CORREÇÃO 4: ID DO INPUT CORRIGIDO
      newItem.acertoBonus = modal.querySelector('#item-attack-bonus').value;
      newItem.damageBonus = modal.querySelector('#item-danobonus').value;
      newItem.damageType = modal.querySelector('#item-dmgtype').value;
      newItem.defenseBonus = modal.querySelector('#item-defense').value;
      newItem.defenseType = modal.querySelector('#item-defensetype').value;
      const disPanel = modal.querySelector('#disadv-field-item .panel'); newItem.disadvantageSkill = disPanel ? Array.from(disPanel.querySelectorAll('input:checked')).map(x => x.value) : [];
      const advPanel = modal.querySelector('#adv-field-item .panel'); newItem.advantageSkill = advPanel ? Array.from(advPanel.querySelectorAll('input:checked')).map(x => x.value) : [];
      newItem.attackAttribute = modal.querySelector('#item-attack-attr').value;
      newItem.attackBonus = modal.querySelector('#item-attack-bonus').value;
    }
    else if (currentTab === 'Arma') {
      newItem.type = 'Arma'; newItem.isEquipable = true;
      const profEl = modal.querySelector('#prof-pills .active'); newItem.proficiency = profEl ? profEl.getAttribute('data-val') : '';
      const tipoEl = modal.querySelector('#tipo-pills .active'); newItem.tipoArma = tipoEl ? tipoEl.getAttribute('data-val') : '';
      const empEl = modal.querySelector('#emp-pills .active'); newItem.empunhadura = empEl ? empEl.getAttribute('data-val') : '';
      newItem.crit = modal.querySelector('#item-crit').value;
      newItem.multiplicador = modal.querySelector('#item-mult').value;
      newItem.alcance = modal.querySelector('#item-range').value;
      const attuneEl = modal.querySelector('#item-attune-weapon'); newItem.attunement = attuneEl ? attuneEl.value : 'Não';
      newItem.damage = modal.querySelector('#item-damage').value;
      newItem.damage2Hands = modal.querySelector('#item-damage-2hands') ? modal.querySelector('#item-damage-2hands').value : '';
      newItem.useTwoHands = existingItem ? !!existingItem.useTwoHands : false;
      const carPanel = modal.querySelector('#car-panel'); if (carPanel) newItem.caracteristicas = Array.from(carPanel.querySelectorAll('input:checked')).map(x => x.value);
      const dmgPanel = modal.querySelector('#dmg-panel'); if (dmgPanel) newItem.damageTypes = Array.from(dmgPanel.querySelectorAll('input:checked')).map(x => x.value);
      const extraRows = modal.querySelectorAll('.extra-dmg-row'); newItem.moreDmgList = []; extraRows.forEach(row => { const d = row.querySelector('.extra-dmg-input').value; const p = row.querySelector('.panel'); const t = Array.from(p.querySelectorAll('input:checked')).map(x => x.value); if (d || t.length) newItem.moreDmgList.push({ dano: d, types: t }); });

      newItem.attackAttribute = modal.querySelector('#item-attack-attr').value;
      newItem.attackBonus = modal.querySelector('#item-attack-bonus').value;
    }
    else if (currentTab === 'Armadura') {
      newItem.type = 'Proteção'; newItem.isEquipable = true;
      const profEl = modal.querySelector('#arm-prof-pills .active'); newItem.proficiency = profEl ? profEl.getAttribute('data-val') : '';
      const tipoEl = modal.querySelector('#arm-tipo-pills .active'); newItem.tipoItem = tipoEl ? tipoEl.getAttribute('data-val') : 'Armadura';
      newItem.minStrength = modal.querySelector('#item-minstr').value; newItem.attunement = modal.querySelector('#item-attune').value;
      const minReqPanel = modal.querySelector('#min-req-panel'); newItem.minReqAttrs = Array.from(minReqPanel.querySelectorAll('input:checked')).map(x => x.value);
      const disPanel = modal.querySelector('#disadv-field .panel'); newItem.disadvantageSkill = disPanel ? Array.from(disPanel.querySelectorAll('input:checked')).map(x => x.value) : [];
      const advPanel = modal.querySelector('#adv-field .panel'); newItem.advantageSkill = advPanel ? Array.from(advPanel.querySelectorAll('input:checked')).map(x => x.value) : [];
      newItem.defense = modal.querySelector('#item-defense').value;
    }

    if (existingItem) {
      state.inventory = state.inventory.map(i => i.id === newItem.id ? newItem : i);
    } else {
      state.inventory.unshift(newItem);
    }

    closeMe();
    renderInventory();
    saveStateToServer();
    window.dispatchEvent(new CustomEvent('sheet-updated'));
  });
}


/* ---------------- HABILIDADES (DIREITA) - ATUALIZADO COM EXCLUSIVIDADE ---------------- */
/* =============================================================
   LÓGICA DE HABILIDADES (RENDERIZAÇÃO, EVENTOS E CATÁLOGO)
   Substitua este bloco inteiro no seu arquivo.
============================================================= */

// Lista de classes padrão para garantir o agrupamento mesmo se a categoria estiver vazia
const LISTA_CLASSES_RPG = [
  'Artífice', 'Bárbaro', 'Bardo', 'Blood Hunter', 'Bruxo', 'Clérigo',
  'Druida', 'Feiticeiro', 'Guerreiro', 'Ladino', 'Mago', 'Monge',
  'Paladino', 'Patrulheiro'
];

/* ---------------- HABILIDADES (CORRIGIDO: NÃO FOCA SE ESTIVER VAZIO) ---------------- */
function renderAbilities() {
  const inputAntigo = document.getElementById('filterHabs');
  const termoBusca = (inputAntigo?.value || '').toLowerCase();

  // 1. Filtra
  let habilidadesFiltradas = state.abilities.filter(a => {
    const text = (a.title + (a.description || "")).toLowerCase();
    return text.includes(termoBusca);
  });

  // 2. Agrupamento
  const grupos = { classes: {}, talentos: [], origem: [], outros: [] };

  habilidadesFiltradas.forEach(hab => {
    const cat = (hab.category || "").toLowerCase().trim();
    const classeOriginal = (hab.class || "").trim();
    const classeLower = classeOriginal.toLowerCase();

    if (cat === 'classe' || LISTA_CLASSES_RPG.includes(classeOriginal)) {
      const nomeGrupo = classeOriginal || "Classe Indefinida";
      if (!grupos.classes[nomeGrupo]) grupos.classes[nomeGrupo] = [];
      grupos.classes[nomeGrupo].push(hab);
    } else if (cat.includes('talento') || classeLower === 'talentos') {
      grupos.talentos.push(hab);
    } else if (cat.includes('antecedente') || cat.includes('raça')) {
      grupos.origem.push(hab);
    } else {
      grupos.outros.push(hab);
    }
  });

  const sortActiveFirst = (a, b) => {
    if (a.active && !b.active) return -1;
    if (!a.active && b.active) return 1;
    return a.title.localeCompare(b.title);
  };

  let htmlFinal = `
        <div class="abilities-controls controls-row">
            <input id="filterHabs" placeholder="Filtrar habilidades..." value="${escapeHtml(termoBusca)}" />
            <div class="right-controls">
                <button id="botOpenCatalogHab" class="btn-add">Adicionar</button>
            </div>
        </div>
        <div class="abilities-list">
    `;

  // Se tem busca, força expandir. Se não, força fechar.
  const forceExpand = termoBusca.length > 0;

  let temConteudo = false;
  Object.keys(grupos.classes).sort().forEach(nomeClasse => {
    const lista = grupos.classes[nomeClasse].sort(sortActiveFirst);
    if (lista.length > 0) {
      htmlFinal += renderAbilitySection(`Habilidades de ${nomeClasse}`, lista, `class-${nomeClasse}`, forceExpand);
      temConteudo = true;
    }
  });

  if (grupos.talentos.length > 0) { grupos.talentos.sort(sortActiveFirst); htmlFinal += renderAbilitySection("Talentos", grupos.talentos, "talentos", forceExpand); temConteudo = true; }
  if (grupos.origem.length > 0) { grupos.origem.sort(sortActiveFirst); htmlFinal += renderAbilitySection("Raça & Antecedente", grupos.origem, "origem", forceExpand); temConteudo = true; }
  if (grupos.outros.length > 0) { grupos.outros.sort(sortActiveFirst); htmlFinal += renderAbilitySection("Outras Habilidades", grupos.outros, "outros", forceExpand); temConteudo = true; }

  if (!temConteudo) htmlFinal += `<div class="empty-tip">Nenhuma habilidade encontrada.</div>`;
  htmlFinal += `</div>`;

  conteudoEl.innerHTML = htmlFinal;

  document.getElementById('botOpenCatalogHab').addEventListener('click', () => openAbilityCatalogOverlay());

  bindAbilityEvents();
  bindAbilitySectionEvents();

  // --- CORREÇÃO DO FOCO AUTOMÁTICO ---
  const novoInput = document.getElementById('filterHabs');
  if (novoInput) {
    // Só foca se o usuário já estiver digitando algo
    if (novoInput.value.length > 0) {
      novoInput.focus();
      const len = novoInput.value.length;
      novoInput.setSelectionRange(len, len);
    }
    novoInput.oninput = renderAbilities;
  }
}

function bindAbilitySectionEvents() {
  document.querySelectorAll('.toggle-section-header').forEach(header => {
    header.addEventListener('click', (e) => {
      e.preventDefault();

      const key = header.getAttribute('data-key');
      const current = state.collapsedSections[key] !== undefined ? state.collapsedSections[key] : true;
      state.collapsedSections[key] = !current;

      // REMOVIDO: saveStateToServer(); <-- NÃO SALVAR NO SERVER

      // Atualiza DOM direto
      const contentDiv = header.nextElementSibling;
      const arrowSpan = header.querySelector('span');

      if (contentDiv) {
        if (state.collapsedSections[key]) {
          contentDiv.style.display = 'none';
          if (arrowSpan) arrowSpan.textContent = '▸';
        } else {
          contentDiv.style.display = 'block';
          if (arrowSpan) arrowSpan.textContent = '▾';
        }
      }
    });
  });
}





// --- EVENTOS ---
// --- EVENTOS DE HABILIDADES ---
function bindAbilityEvents() {
  // 1. Checkbox Ativar (DOM DIRETO - SEM PULO)
  document.querySelectorAll('.hab-activate').forEach(ch => {
    ch.onchange = (ev) => {
      const id = Number(ch.getAttribute('data-id'));
      const hab = state.abilities.find(h => h.id === id);
      if (hab) {
        hab.active = ev.target.checked;
        saveStateToServer();

        // Exclusividade Monge/Bárbaro
        if (hab.active) {
          if (hab.title.includes("Bárbaro")) {
            const m = state.abilities.find(a => a.title.includes("Monge"));
            if (m) { m.active = false; const mChk = document.querySelector(`.hab-activate[data-id="${m.id}"]`); if (mChk) mChk.checked = false; }
          }
          if (hab.title.includes("Monge")) {
            const b = state.abilities.find(a => a.title.includes("Bárbaro"));
            if (b) { b.active = false; const bChk = document.querySelector(`.hab-activate[data-id="${b.id}"]`); if (bChk) bChk.checked = false; }
          }
        }

        // Apenas atualiza a esquerda (CA/Status)
        if (typeof atualizarAC === 'function') atualizarAC();
      }
    };
  });

  // 2. Expandir Card
  document.querySelectorAll('.hab-card .left').forEach(leftDiv => {
    leftDiv.onclick = () => {
      const id = Number(leftDiv.getAttribute('data-id'));
      const hab = state.abilities.find(h => h.id === id);
      const card = leftDiv.closest('.hab-card');
      if (hab) {
        hab.expanded = !hab.expanded;
        const body = card.querySelector('.card-body');
        const caret = card.querySelector('.caret');

        body.style.display = hab.expanded ? 'block' : 'none';
        caret.textContent = hab.expanded ? '▾' : '▸';
        card.classList.toggle('expanded', hab.expanded);

        // saveStateToServer(); <--- REMOVA ESTA LINHA
      }
    };
  });

  // 3. REMOVER (CONFIRMAÇÃO REMOVIDA)
  document.querySelectorAll('.remover-hab').forEach(btn => {
    btn.onclick = (e) => {
      e.preventDefault();
      const id = Number(btn.getAttribute('data-id'));

      // REMOVIDO O IF(CONFIRM(...))
      state.abilities = state.abilities.filter(h => h.id !== id);
      renderActiveTab();
      saveStateToServer();
      window.dispatchEvent(new CustomEvent('sheet-updated'));
    }
  });

  // 4. EDITAR
  document.querySelectorAll('.editar-hab').forEach(btn => {
    btn.onclick = (e) => {
      e.preventDefault();
      const id = Number(btn.getAttribute('data-id'));
      const hab = state.abilities.find(h => h.id === id);
      if (hab) openNewAbilityModal(hab);
    }
  });
}

// --- FUNÇÃO DE ABERTURA DO CATÁLOGO DE HABILIDADES (CORRIGIDA PARA SALVAR CATEGORIA) ---
function openAbilityCatalogOverlay() {
  const existing = document.querySelector('.catalog-overlay-large-abilities');
  if (existing) { existing.remove(); return; }

  let activeClass = CLASSES_AVAILABLE.includes('Talentos') ? 'Talentos' : CLASSES_AVAILABLE[0];
  let activeClassHabilitySelected = true;
  let activeSubclass = null;
  let isSubclassesExpanded = false;

  const overlay = document.createElement('div');
  overlay.className = 'catalog-overlay-large catalog-overlay-large-abilities';

  const classesHtml = CLASSES_AVAILABLE.map(c =>
    `<button class="ability-class-btn ${c === activeClass ? 'active' : ''}" data-class="${c}">${c}</button>`
  ).join('');

  overlay.innerHTML = `
      <div class="catalog-large" role="dialog" aria-modal="true">
        <div class="catalog-fixed-header" style="flex-shrink: 0;">
          <div class="catalog-large-header">
            <h3>Adicionar Habilidades</h3>
            <div style="display:flex;gap:8px;align-items:center;">
              <button id="catalog-new-hab" class="btn-add" style="background:#222;border:1px solid rgba(255,255,255,0.04);">Nova Habilidade</button>
              <div class="catalog-large-close" title="Fechar" style="cursor:pointer;">✖</div>
            </div>
          </div>
          <div class="catalog-large-classes">${classesHtml}</div>
          <div id="catalog-class-habilities-row" style="display:flex; align-items:center; margin-top:6px;"></div>
          <div id="catalog-subclasses-row" style="display:flex; margin-top:8px; padding-bottom:6px;"></div>
          <div class="catalog-large-search" style="margin-top:6px;">
            <input id="catalogAbilitySearch" placeholder="Ex: ataque, guerreiro..." />
          </div>
        </div>
        <div class="catalog-large-list abilities-list-large"></div>
      </div>
    `;

  document.body.appendChild(overlay);
  checkScrollLock();

  overlay.querySelector('.catalog-large-close').onclick = () => { overlay.remove(); checkScrollLock(); };

  overlay.querySelector('#catalog-new-hab').onclick = () => {
    overlay.remove();
    openNewAbilityModal(null);
  };

  overlay.querySelectorAll('.ability-class-btn').forEach(btn => {
    btn.onclick = () => {
      overlay.querySelectorAll('.ability-class-btn').forEach(b => b.classList.remove('active'));
      btn.classList.add('active');
      activeClass = btn.dataset.class;
      activeClassHabilitySelected = true;
      activeSubclass = null;
      renderClassHabilitiesRow();
      renderSubclassesRow();
      renderCatalogList();
      btn.scrollIntoView({ inline: 'center', behavior: 'smooth' });
    };
  });

  function renderClassHabilitiesRow() {
    const row = overlay.querySelector('#catalog-class-habilities-row');
    if (!activeClass) { row.style.display = 'none'; return; }
    const subs = CLASSES_WITH_SUBCLASSES[activeClass] || [];
    const hasSubclasses = subs.length > 0;
    row.style.display = 'flex';
    let html = '';
    if (activeClass !== 'Antecedentes') {
      html += `<button class="catalog-class-hability-pill ${activeClassHabilitySelected ? 'active' : ''}">Habilidades de ${activeClass}</button>`;
    }
    if (hasSubclasses) {
      html += `<button id="toggle-sub-expansion" class="toggle-expansion-btn" title="Alternar">${isSubclassesExpanded ? '⇄' : '⊞'}</button>`;
    }
    row.innerHTML = html;

    const pillBtn = row.querySelector('.catalog-class-hability-pill');
    if (pillBtn) {
      pillBtn.onclick = function () {
        activeClassHabilitySelected = true;
        activeSubclass = null;
        renderClassHabilitiesRow();
        overlay.querySelectorAll('.ability-sub-btn').forEach(b => b.classList.remove('active'));
        renderCatalogList();
      };
    }
    if (hasSubclasses) {
      row.querySelector('#toggle-sub-expansion').onclick = () => {
        isSubclassesExpanded = !isSubclassesExpanded;
        renderClassHabilitiesRow();
        renderSubclassesRow();
      };
    }
  }

  function renderSubclassesRow() {
    const row = overlay.querySelector('#catalog-subclasses-row');
    const subs = CLASSES_WITH_SUBCLASSES[activeClass] || [];
    if (!subs.length) { row.style.display = 'none'; return; }
    row.style.display = 'flex';
    if (isSubclassesExpanded) { row.style.flexWrap = 'wrap'; row.style.overflowX = 'visible'; }
    else { row.style.flexWrap = 'nowrap'; row.style.overflowX = 'auto'; }

    row.innerHTML = subs.map(s => `<button class="ability-sub-btn ${s === activeSubclass ? 'active' : ''}" data-sub="${s}">${s}</button>`).join('');
    row.querySelectorAll('.ability-sub-btn').forEach(b => {
      b.onclick = () => {
        overlay.querySelectorAll('.ability-sub-btn').forEach(x => x.classList.remove('active'));
        overlay.querySelector('.catalog-class-hability-pill')?.classList.remove('active');
        b.classList.add('active');
        activeClassHabilitySelected = false;
        activeSubclass = b.dataset.sub;
        renderCatalogList();
      };
    });
  }



  overlay.querySelector('#catalogAbilitySearch').oninput = renderCatalogList;
  renderClassHabilitiesRow();
  renderSubclassesRow();
  renderCatalogList();
}

/* ---------------- FORMATAR CARD DE MAGIA (COM UPCAST) ---------------- */
function formatMySpellCard(s) {
  const schoolPill = `<div class="pill" style="margin:0;">${s.school || '—'}${s.levelNumber !== undefined ? ` <span class="pill-level">${s.levelNumber}</span>` : ''}</div>`;
  const classDisplay = `<div class="class-box-display" style="margin:0; min-height:0; padding:6px 10px;">${s.spellClass || '—'}</div>`;
  const caretSymbol = s.expanded ? '▾' : '▸';

  // --- LÓGICA DE UPCAST (DROPDOWN) ---
  let levelOptions = '';
  const baseLevel = s.levelNumber || 0;

  if (baseLevel > 0) {
    for (let i = baseLevel; i <= 9; i++) {
      const label = i === baseLevel ? `${i}º (Base)` : `${i}º Círculo`;
      levelOptions += `<option value="${i}">${label}</option>`;
    }
  }

  const scalingAttr = s.scaling ? `data-scaling="${s.scaling}"` : '';
  const baseDmgAttr = `data-base-dmg="${s.damage || ''}"`;
  const baseLvlAttr = `data-base-lvl="${baseLevel}"`;

  // REMOVIDO O BOTÃO GASTAR, MANTIDO APENAS O SELECT
  const castControlsHTML = baseLevel > 0 ? `
      <div class="cast-controls">
          <span class="cast-label">Círculo:</span>
          <select class="slot-select spell-slot-selector" 
                  data-id="${s.id}" 
                  ${scalingAttr} ${baseDmgAttr} ${baseLvlAttr}>
              ${levelOptions}
          </select>
          </div>
  ` : `<div class="cast-controls" style="justify-content:center; color:#777; font-size:12px;">Truques (Não gastam slot)</div>`;

  const damageDisplay = `<span class="dynamic-damage-text">${s.damage || '-'}</span>`;

  return `
      <div class="card spell-card ${s.expanded ? 'expanded' : ''}" data-id="${s.id}">
        <div class="card-header spell-header">
          <div class="spell-left" data-id="${s.id}">
            <span class="caret">${caretSymbol}</span>
            <div class="spell-title-block">
              <div class="card-title spell-title">${s.name}</div>
            </div>
          </div>
          <div class="spell-right">
            <div class="card-meta spell-damage">
                ${damageDisplay} 
                <img class="dice-img" src="img/imagem-no-site/dado.png" alt="dado" title="Rolar e Gastar Slot" />
            </div>
            <label class="check-ativar"><input class="spell-activate" type="checkbox" data-id="${s.id}" ${s.active ? 'checked' : ''}/><span class="square-check"></span></label>
          </div>
        </div>
        
        <div class="card-body" style="${s.expanded ? '' : 'display:none;'}">
           <div style="display:flex; flex-direction:column; gap:8px; align-items:flex-start; width:100%;">
                <div style="display:flex; gap:10px; align-items:center; flex-wrap:wrap;">
                    ${schoolPill} ${classDisplay}
                </div>
                 <div style="display:flex; gap:10px; align-items:center;">
                    <span class="comp-title" style="margin:0; font-size:13px; color:#ccc; font-weight:800;">Componentes:</span>
                    <div class="comp-letters">
                      <span class="comp-letter ${s.components && s.components.V ? 'on' : ''}">V</span>
                      <span class="comp-letter ${s.components && s.components.S ? 'on' : ''}">S</span>
                      <span class="comp-letter ${s.components && s.components.M ? 'on' : ''}">M</span>
                    </div>
                </div>
           </div>

           <div style="margin-top:10px; border-bottom:1px solid rgba(255,255,255,0.05); padding-bottom:10px;">
                ${s.description}
           </div>

           ${castControlsHTML}

           <div style="margin-top:8px;">
                <a href="#" class="remover-spell" data-id="${s.id}">Remover</a>
                <a href="#" class="editar-spell" data-id="${s.id}" style="float:right;color:#2e7d32">Editar</a>
           </div>
        </div>
      </div>
  `;
}

/* ---------------- PARTE 1: RENDERIZAR LISTA DE MAGIAS ---------------- */


/* --- SUBSTITUA A FUNÇÃO renderSpells INTEIRA POR ESTA --- */
function renderSpells() {
  state.dtMagias = calculateSpellDC();
  const slotsHTML = renderSpellSlotsHTML();

  const html = `
    <div class="spells-wrapper" style="position:relative;">
      ${slotsHTML}
      ${slotsHTML ? '<hr style="border:0; border-top:1px solid rgba(255,255,255,0.1); margin: 15px 0;">' : ''}

      <div class="spells-controls controls-row">
        <input id="filterMagias" placeholder="Filtrar magias" />
        <div class="right-controls">
          <button id="botAddSpell" class="btn-add">Nova Magia</button>
          
          <div class="dt-magias" id="btnOpenDTConfig" style="cursor:pointer;" title="Clique para configurar">
            <label style="cursor:pointer; color:#9c27b0;">DT DE MAGIAS ⚙️</label>
            <input id="dtMagiasInput" type="text" value="${state.dtMagias}" readonly 
                   style="cursor:pointer; font-weight:bold; color:#fff; text-align:center; min-width:80px;" />
          </div>
        </div>
      </div>

      <div style="display:flex; align-items:center; margin:15px 0 10px 4px;">
          <h4 style="margin:0; color:#ddd; font-size:16px;">Minhas Magias</h4>
          
          <div id="btnRollSpellAttack_Header" title="Rolar Ataque Mágico (1d20 + Prof + Mod)" style="cursor:pointer; margin-left:10px; transition: transform 0.2s;">
              <img src="img/imagem-no-site/dado.png" alt="Rolar Ataque" style="width:26px; height:26px; display:block; opacity:0.9; filter: drop-shadow(0 0 2px rgba(156, 39, 176, 0.5));" />
          </div>
      </div>

      <div class="spells-list">
        ${state.spells.map(formatMySpellCard).join('')}
      </div>
    </div>
  `;

  conteudoEl.innerHTML = html;
  bindSpellEvents();
  bindSlotEvents();
  // REMOVIDO: bindSpellAttackEvents(); -> Causava travamento do script
}


// Inicializa estrutura de slots usada para controle de "gastos" (used)
/* =============================================================
   CORREÇÃO: INCLUIR 'Inventário' NA LISTA DE ATUALIZAÇÃO
   Substitua o listener "window.addEventListener('sheet-updated'..." 
   por este bloco completo:
============================================================= */

/* =============================================================
   CORREÇÃO 2: Atualização que respeita o cursor
============================================================= */

window.addEventListener('sheet-updated', () => {
  // 1. Atualiza DT Magias
  state.dtMagias = calculateSpellDC();
  const inputDT = document.getElementById('dtMagiasInput');
  if (inputDT) inputDT.value = state.dtMagias;

  // 2. Atualiza Classe de Armadura
  const armorClass = calculateArmorClass();
  const inputCA = document.getElementById('caTotal') || document.querySelector('.hexagrama-ca .valor');
  if (inputCA) {
    if (inputCA.tagName === 'INPUT') inputCA.value = armorClass;
    else inputCA.textContent = armorClass;
  }

  // 3. ATUALIZAÇÃO AUTOMÁTICA DA DIREITA
  if (['Magias', 'Mag. Preparadas', 'Habilidades', 'Combate', 'Inventário', 'Descrição'].includes(state.activeTab)) {

    // Salva estado de scroll
    const scrollContainer = document.querySelector('.lado-direito .conteudo') || document.querySelector('.lado-direito');
    const savedScroll = scrollContainer ? scrollContainer.scrollTop : 0;

    // --- CORREÇÃO: SALVA O FOCO E A POSIÇÃO DO CURSOR ---
    const activeElement = document.activeElement;
    const activeId = activeElement ? activeElement.id : null;
    const cursorStart = activeElement ? activeElement.selectionStart : null;
    const cursorEnd = activeElement ? activeElement.selectionEnd : null;

    // FORÇA O REDESENHO DA ABA ATIVA
    renderActiveTab();

    // Restaura Scroll
    if (scrollContainer) scrollContainer.scrollTop = savedScroll;

    // --- CORREÇÃO: RESTAURA O FOCO E A POSIÇÃO DO CURSOR ---
    if (activeId) {
      const el = document.getElementById(activeId);
      if (el) {
        el.focus();
        // Se for um campo de texto, restaura a posição exata do cursor
        if (cursorStart !== null && cursorEnd !== null && (el.tagName === 'INPUT' || el.tagName === 'TEXTAREA')) {
             try { el.setSelectionRange(cursorStart, cursorEnd); } catch(e){}
        }
      }
    }
  }
});

/* =============================================================
   RENDERIZAÇÃO DE SLOTS (ATUALIZADA)
============================================================= */

function initSpellSlotsState() {
  if (!state.spellSlots) state.spellSlots = {};
  if (!state.customResources) state.customResources = []; // Array para recursos extras

  // Chaves padrão
  const keys = ['1', '2', '3', '4', '5', '6', '7', '8', '9', 'pact', 'ki', 'furia', 'sorcery', 'mutagen', 'blood_curse', 'infusions'];

  // Adiciona chaves dos recursos customizados (ex: custom_0, custom_1)
  state.customResources.forEach((res, idx) => {
    keys.push(`custom_${idx}`);
  });

  keys.forEach(k => {
    if (!state.spellSlots[k]) state.spellSlots[k] = { status: [] };
    if (!Array.isArray(state.spellSlots[k].status)) state.spellSlots[k].status = [];
  });
}

function renderSpellSlotsHTML() {
  initSpellSlotsState();

  // Calcula Recursos Totais
  const recursosTotais = calcularRecursosTotais(state.niveisClasses, state.abilities, state.atributos);

  // Estado do Accordion
  if (typeof state.isSlotsCollapsed === 'undefined') state.isSlotsCollapsed = false;
  const isCollapsed = state.isSlotsCollapsed;
  const arrowIcon = isCollapsed ? '▸' : '▾';

  // CLASSE DINÂMICA PARA O CONTAINER
  const containerClass = isCollapsed ? 'slots-container collapsed' : 'slots-container';

  let html = `<div class="${containerClass}" style="border: 1px solid rgba(156, 39, 176, 0.3); background: #121212;">`;

  // Cabeçalho
  html += `
        <div class="slots-header-actions" id="headerSlotsToggle" style="cursor:pointer; user-select:none;">
            <div style="display:flex; align-items:center; gap:8px;">
                <span style="color:#9c27b0; font-size:18px; width:15px;">${arrowIcon}</span>
                <span class="slots-title">Recursos de Classe</span>
            </div>
            <div style="display:flex; gap: 5px; align-items:center;">
                <button id="btnConfigRes" class="btn-config-gear" title="Adicionar/Editar Slots Extras">⚙️</button>
                <button id="btnRestSlots" class="mini-btn-res" title="Recuperar Tudo" style="padding:4px 8px; width:auto; font-size:11px;">🌙</button>
            </div>
        </div>
        
        <div class="slots-body-content">
            <div class="slots-grid">
    `;

  let hasAnySlot = false;

  // Função Auxiliar de Renderização
  const renderPips = (key, maxVal, label, colorClass) => {
    if (maxVal > 0) {
      hasAnySlot = true;
      const slotState = state.spellSlots[key];

      // Garante tamanho do array de status
      while (slotState.status.length < maxVal) slotState.status.push(false);

      let contentHtml = '';

      if (maxVal === 99) {
        contentHtml = `<div class="slot-pips"><span style="color:#fff; font-weight:bold; font-size:12px;">ILIMITADO</span></div>`;
      } else {
        let pips = '';
        for (let i = 0; i < maxVal; i++) {
          const isSpent = slotState.status[i];
          pips += `<span class="slot-pip ${colorClass} ${isSpent ? 'used' : 'available'}" data-key="${key}" data-idx="${i}"></span>`;
        }
        contentHtml = `<div class="slot-pips" style="flex-wrap: wrap;">${pips}</div>`;
      }

      html += `
                <div class="slot-group ${key === 'pact' ? 'pact-group' : ''}">
                    <div class="slot-label" style="${key === 'pact' ? 'color:#e0aaff;' : ''}">${label}</div>
                    ${contentHtml}
                </div>
            `;
    }
  };

  // Renderiza Slots e Recursos
  for (let i = 1; i <= 9; i++) renderPips(String(i), recursosTotais.slots[i - 1], `${i}º Círculo`, '');
  if (recursosTotais.pact.qtd > 0) renderPips('pact', recursosTotais.pact.qtd, `Pacto (${recursosTotais.pact.nivel}º)`, 'pact');

  renderPips('ki', recursosTotais.ki, 'Ki', 'ki-pip');
  renderPips('furia', recursosTotais.furia, 'Fúria', 'rage-pip');
  renderPips('sorcery', recursosTotais.sorcery, 'Feitiçaria', 'sorc-pip');
  renderPips('mutagen', recursosTotais.mutagen, 'Mutagênicos', 'mut-pip');
  renderPips('infusions', recursosTotais.infusions, 'Itens Infundidos', 'infusion-pip');
  renderPips('blood_curse', recursosTotais.blood_curse, 'Maldições', 'curse-pip');

  // --- RENDERIZA RECURSOS CUSTOMIZADOS (ADICIONADOS PELO USUÁRIO) ---
  if (state.customResources && state.customResources.length > 0) {
    state.customResources.forEach((res, idx) => {
      renderPips(`custom_${idx}`, parseInt(res.max), res.name, 'custom-pip');
    });
  }

  html += `</div>`; // Fecha grid

  // --- ÁREA DE INFORMAÇÕES ---
  if (recursosTotais.infoConjuracao.length > 0) {
    html += `<div class="spell-info-footer" style="margin-top:15px; border-top:1px solid rgba(255,255,255,0.1); padding-top:10px;">`;

    const infosUnicas = recursosTotais.infoConjuracao.filter((v, i, a) => a.findIndex(t => (t.classe === v.classe)) === i);

    infosUnicas.forEach(info => {
      let texto = `<strong style="color:#9c27b0;">${info.classe}</strong>: `;
      let partes = [];

      if (info.truques !== undefined) partes.push(`${info.truques} Truques`);
      if (info.tipo === 'preparadas') partes.push(`${info.preparadas} Preparadas`);
      else if (info.tipo === 'conhecidas' && info.conhecidas > 0) partes.push(`${info.conhecidas} Conhecidas`);
      if (info.maldicoes !== undefined) partes.push(`${info.maldicoes} Maldições Conhecidas`);
      if (info.extra) partes.push(info.extra);

      texto += partes.join(' • ');
      html += `<div style="font-size:12px; color:#ccc; margin-bottom:4px;">${texto}</div>`;
    });
    html += `</div>`;
  }

  html += `</div></div>`; // Fecha container

  // Se não tiver nada e nem customizados, esconde
  if (!hasAnySlot && (!state.customResources || state.customResources.length === 0) && recursosTotais.infoConjuracao.length === 0) return '';
  return html;
}

/* ---------------- EVENTOS DOS SLOTS (ATUALIZADO PARA FUNCIONAR EM QUALQUER ABA) ---------------- */
function bindSlotEvents() {
  // 1. Toggle Minimizar
  const headerToggle = document.getElementById('headerSlotsToggle');
  if (headerToggle) {
    headerToggle.addEventListener('click', (e) => {
      if (e.target.closest('button')) return;

      state.isSlotsCollapsed = !state.isSlotsCollapsed;
      saveStateToServer();

      // ATUALIZADO: Renderiza a aba ativa atual, não apenas renderSpells()
      renderActiveTab();
    });
  }

  // 2. Botão Configurar (Engrenagem)
  const btnConfig = document.getElementById('btnConfigRes');
  if (btnConfig) {
    btnConfig.addEventListener('click', (e) => {
      e.stopPropagation();
      openResourceConfigModal();
    });
  }

  // 3. Descanso Longo
  const btnRest = document.getElementById('btnRestSlots');
  if (btnRest) {
    btnRest.onclick = (e) => {
      e.stopPropagation();
      // Reseta todos os slots
      for (let key in state.spellSlots) {
        state.spellSlots[key].status = [];
      }
      saveStateToServer();

      // ATUALIZADO: Renderiza a aba ativa atual
      renderActiveTab();
    };
  }

  // 4. Clique nas Bolinhas (Gastar/Recuperar)
  document.querySelectorAll('.slot-pip').forEach(pip => {
    pip.addEventListener('click', (e) => {
      e.stopPropagation();
      const key = pip.dataset.key;
      const idx = parseInt(pip.dataset.idx);

      if (!state.spellSlots[key]) state.spellSlots[key] = { status: [] };
      if (!state.spellSlots[key].status) state.spellSlots[key].status = [];

      state.spellSlots[key].status[idx] = !state.spellSlots[key].status[idx];
      saveStateToServer();

      // Atualização visual instantânea
      const isNowSpent = state.spellSlots[key].status[idx];
      if (isNowSpent) {
        pip.classList.remove('available');
        pip.classList.add('used');
      } else {
        pip.classList.remove('used');
        pip.classList.add('available');
      }
    });
  });
}

/* ---------------- MODAL CONFIGURAR RECURSOS EXTRAS ---------------- */
function openResourceConfigModal() {
  const existing = document.querySelector('.config-res-modal');
  if (existing) existing.remove();

  const overlay = document.createElement('div');
  overlay.className = 'spell-modal-overlay config-res-modal';
  overlay.style.zIndex = '13000';

  // Garante que o array existe
  if (!state.customResources) state.customResources = [];

  const renderList = () => {
    return state.customResources.map((res, idx) => `
            <div class="custom-res-item">
                <div style="flex:1;">
                    <strong style="color:#e0e0e0; font-size:13px;">${escapeHtml(res.name)}</strong>
                    <div style="color:#999; font-size:11px;">Máximo: ${res.max}</div>
                </div>
                <button class="remove-res-btn" data-idx="${idx}" style="background:#b71c1c; border:none; color:white; border-radius:4px; padding:4px 8px; cursor:pointer; font-size:11px;">Remover</button>
            </div>
        `).join('');
  };

  overlay.innerHTML = `
        <div class="spell-modal" style="width:360px;">
            <div class="modal-header">
                <h3>Recursos Extras</h3>
                <button class="modal-close">✖</button>
            </div>
            <div class="modal-body">
                <div style="background:#151515; padding:10px; border-radius:6px; margin-bottom:10px;">
                    <label style="margin-top:0;">Novo Recurso</label>
                    <div style="display:flex; gap:8px; margin-top:5px;">
                        <input id="new-res-name" type="text" placeholder="Nome (ex: Varinha)" style="flex:2;">
                        <input id="new-res-max" type="number" placeholder="Qtd" min="1" style="flex:1;">
                    </div>
                    <button id="btn-add-res" class="btn-add" style="width:100%; margin-top:8px; background:#2e7d32;">+ Adicionar</button>
                </div>
                
                <label>Lista Atual</label>
                <div id="custom-res-list" style="max-height:200px; overflow-y:auto;">
                    ${renderList()}
                </div>
            </div>
        </div>
    `;

  document.body.appendChild(overlay);
  checkScrollLock();

  // Eventos
  overlay.querySelector('.modal-close').onclick = () => { overlay.remove(); checkScrollLock(); };

  // Adicionar
  overlay.querySelector('#btn-add-res').onclick = () => {
    const name = document.getElementById('new-res-name').value.trim();
    const max = parseInt(document.getElementById('new-res-max').value);

    if (name && max > 0) {
      state.customResources.push({ name, max });
      saveStateToServer();
      renderSpells(); // Atualiza a tela de trás

      // Atualiza a lista do modal
      document.getElementById('custom-res-list').innerHTML = renderList();
      document.getElementById('new-res-name').value = '';
      document.getElementById('new-res-max').value = '';

      // Re-bind dos botões de remover
      bindRemoveBtns();
    }
  };

  function bindRemoveBtns() {
    overlay.querySelectorAll('.remove-res-btn').forEach(btn => {
      btn.onclick = (e) => {
        const idx = parseInt(e.target.dataset.idx);

        // Remove do state
        state.customResources.splice(idx, 1);

        // Limpa também o estado de "usados" (slots) para não ficar lixo na memória
        // Nota: Isso é um pouco mais complexo pois os índices mudam. 
        // Para simplificar, vamos limpar a chave específica do custom removido e renomear as outras?
        // Solução simples: Resetar todos os custom slots no spellSlots object.
        // Mas isso perderia o progresso dos outros.
        // Melhor: Recriar o objeto de spellSlots para custom.

        // Limpeza rápida (reseta customs para evitar bugs de índice)
        // Se quiser manter o estado, teria que remapear as chaves custom_1 -> custom_0, etc.
        // Vamos resetar por segurança.
        Object.keys(state.spellSlots).forEach(k => {
          if (k.startsWith('custom_')) delete state.spellSlots[k];
        });

        saveStateToServer();
        renderSpells();
        document.getElementById('custom-res-list').innerHTML = renderList();
        bindRemoveBtns();
      };
    });
  }

  bindRemoveBtns();
}

// Função global para botões numéricos (+/-) de recursos altos
window.changeResource = (key, delta, max) => {
  if (!state.spellSlots[key]) state.spellSlots[key] = { used: 0 };

  let newUsed = (state.spellSlots[key].used || 0) + delta;

  if (max !== 99 && newUsed > max) newUsed = max;
  if (newUsed < 0) newUsed = 0;

  state.spellSlots[key].used = newUsed;
  saveStateToServer();

  // ATUALIZADO: Renderiza a aba atual
  renderActiveTab();
};

// --- MODAL DE CONFIGURAÇÃO DE SLOTS ---
function openSlotConfigModal() {
  const existing = document.querySelector('.slots-modal-overlay');
  if (existing) existing.remove();

  const overlay = document.createElement('div');
  overlay.className = 'spell-modal-overlay slots-modal-overlay';
  overlay.style.zIndex = '13000'; // Acima de tudo

  // Gera inputs de 1 a 9
  let inputsHtml = '';
  for (let i = 1; i <= 9; i++) {
    const val = state.spellSlots[i].max;
    inputsHtml += `
            <div style="display:flex; align-items:center; justify-content:space-between; margin-bottom:8px; background:#111; padding:6px 10px; border-radius:4px;">
                <span style="color:#ddd; font-weight:bold;">${i}º Círculo</span>
                <input type="number" min="0" max="10" class="slot-cfg-input" data-level="${i}" value="${val}" style="width:50px; text-align:center;"/>
            </div>
        `;
  }

  // Pact Magic
  const pactVal = state.spellSlots['pact'].max;
  const pactLvl = state.spellSlots['pact'].level;

  const pactHtml = `
        <div style="margin-top:15px; border-top:1px solid #333; padding-top:10px;">
            <div style="color:#e0aaff; font-weight:800; margin-bottom:8px;">Magia de Pacto (Bruxo)</div>
            <div style="display:flex; gap:10px;">
                <div style="flex:1;">
                    <label style="font-size:11px;">Qtd. Slots</label>
                    <input type="number" min="0" max="10" id="pact-max" value="${pactVal}" style="width:100%;"/>
                </div>
                <div style="flex:1;">
                    <label style="font-size:11px;">Nível do Slot</label>
                    <input type="number" min="1" max="9" id="pact-lvl" value="${pactLvl}" style="width:100%;"/>
                </div>
            </div>
        </div>
    `;

  overlay.innerHTML = `
        <div class="spell-modal" style="width:340px;">
            <div class="modal-header">
                <h3>Configurar Espaços</h3>
                <button class="modal-close">✖</button>
            </div>
            <div class="modal-body">
                <p style="font-size:12px; color:#aaa; margin-top:-10px; margin-bottom:15px;">Defina a quantidade máxima de espaços de magia por círculo.</p>
                <div style="max-height:400px; overflow-y:auto; padding-right:5px;">
                    ${inputsHtml}
                    ${pactHtml}
                </div>
            </div>
            <div class="modal-actions">
                <button class="btn-add btn-save-slots">Salvar Configuração</button>
            </div>
        </div>
    `;

  document.body.appendChild(overlay);
  checkScrollLock();

  overlay.querySelector('.modal-close').onclick = () => { overlay.remove(); checkScrollLock(); };

  overlay.querySelector('.btn-save-slots').onclick = () => {
    // Salva 1-9
    overlay.querySelectorAll('.slot-cfg-input').forEach(inp => {
      const lvl = inp.dataset.level;
      state.spellSlots[lvl].max = parseInt(inp.value) || 0;
      // Se reduziu max abaixo do usado, ajusta usado
      if (state.spellSlots[lvl].used > state.spellSlots[lvl].max) {
        state.spellSlots[lvl].used = state.spellSlots[lvl].max;
      }
    });

    // Salva Pacto
    const pMax = parseInt(document.getElementById('pact-max').value) || 0;
    const pLvl = parseInt(document.getElementById('pact-lvl').value) || 1;
    state.spellSlots['pact'].max = pMax;
    state.spellSlots['pact'].level = pLvl;
    if (state.spellSlots['pact'].used > pMax) state.spellSlots['pact'].used = pMax;

    saveStateToServer();
    renderSpells();
    overlay.remove();
    checkScrollLock();
  };
}
function calculateNewDamage(baseDamage, scalingDamage, baseLevel, targetLevel) {
  if (!scalingDamage || targetLevel <= baseLevel) return baseDamage;

  // Regex para separar "5" de "d8" ou "2" de "d6 + 3"
  // Aceita formatos: "5d8", "1d6+2", "10"
  const regex = /^(\d+)d(\d+)(.*)$/i;

  const baseMatch = baseDamage.match(regex);
  const scaleMatch = scalingDamage.match(regex);

  // Se não conseguir ler os dados (ex: dano é texto puro), retorna o original
  if (!baseMatch || !scaleMatch) return baseDamage;

  const baseQtd = parseInt(baseMatch[1]); // Ex: 5
  const dieType = baseMatch[2];           // Ex: 8 (d8)
  const extraStr = baseMatch[3] || "";    // Ex: +3 (se houver)

  const scaleQtd = parseInt(scaleMatch[1]); // Ex: 2 (de 2d8)
  // Nota: Assumimos que o tipo do dado de scaling é igual ao base geralmente, 
  // ou apenas somamos a quantidade se os dados forem iguais.

  // Diferença de níveis
  const levelsAdded = targetLevel - baseLevel;

  // Novo total de dados
  const newQtd = baseQtd + (scaleQtd * levelsAdded);

  return `${newQtd}d${dieType}${extraStr}`;
}
/* ---------------- EVENTOS DAS MAGIAS (LIMPO) ---------------- */
function bindSpellEvents() {
    // 1. Botões do topo
    const botAdd = document.getElementById('botAddSpell');
    const btnDT = document.getElementById('btnOpenDTConfig');
    if (botAdd) botAdd.addEventListener('click', () => openSpellCatalogOverlay());
    if (btnDT) btnDT.addEventListener('click', openDTConfigModal);

    // 2. Filtro
    const filtro = document.getElementById('filterMagias');
    if (filtro) filtro.addEventListener('input', (e) => {
        const q = e.target.value.toLowerCase();
        document.querySelectorAll('.spell-card').forEach(card => {
            const title = card.querySelector('.spell-title').textContent.toLowerCase();
            card.style.display = title.includes(q) ? '' : 'none';
        });
    });

    // 3. EVENTO DE MUDANÇA NO DROPDOWN (UPCAST VISUAL)
    document.querySelectorAll('.spell-slot-selector').forEach(sel => {
        sel.addEventListener('change', (ev) => {
            ev.stopPropagation(); 
            
            const targetLvl = parseInt(ev.target.value);
            const scaling = ev.target.dataset.scaling;
            const baseDmg = ev.target.dataset.baseDmg;
            const baseLvl = parseInt(ev.target.dataset.baseLvl);
            
            const card = ev.target.closest('.spell-card');
            const damageTextEl = card.querySelector('.dynamic-damage-text');
            
            if (damageTextEl && scaling && baseDmg) {
                // Função calculateNewDamage deve estar definida no seu código (do passo anterior)
                const newDmg = calculateNewDamage(baseDmg, scaling, baseLvl, targetLvl);
                damageTextEl.textContent = newDmg;
                damageTextEl.style.color = '#e040fb';
                setTimeout(() => damageTextEl.style.color = '#9c27b0', 500);
            } else if (damageTextEl) {
                damageTextEl.textContent = baseDmg;
            }
        });
    });

    // 4. Listeners Padrão dos Cards (Expandir, Remover, Editar)
    document.querySelectorAll('.spell-card').forEach(card => {
        const id = Number(card.getAttribute('data-id'));
        const header = card.querySelector('.card-header');

        // A. Expandir Card
        header.addEventListener('click', (ev) => {
            if (ev.target.closest('.spell-right') || 
                ev.target.closest('.check-ativar') || 
                ev.target.closest('.cast-controls')) return;
                
            const s = state.spells.find(x => x.id === id);
            if (s) {
                s.expanded = !s.expanded;
                renderSpells(); 
            }
        });

        // B. Checkbox Preparar
        const ch = card.querySelector('.spell-activate');
        if (ch) {
            ch.addEventListener('change', (ev) => {
                const s = state.spells.find(x => x.id === id);
                if (s) {
                    s.active = ev.target.checked;
                    saveStateToServer();
                }
            });
            ch.addEventListener('click', ev => ev.stopPropagation());
        }
    });

    // C. Remover / Editar
    document.querySelectorAll('.remover-spell').forEach(a => {
        a.addEventListener('click', (ev) => {
            ev.preventDefault();
            const id = Number(a.getAttribute('data-id'));
            state.spells = state.spells.filter(s => s.id !== id);
            renderSpells();
            saveStateToServer();
        });
    });
    document.querySelectorAll('.editar-spell').forEach(a => {
        a.addEventListener('click', (ev) => {
            ev.preventDefault();
            const id = Number(a.getAttribute('data-id'));
            const s = state.spells.find(x => x.id === id);
            if (s) openSpellModal(s);
        });
    });
}


function openDTConfigModal() {
  const existing = document.querySelector('.dt-modal-overlay');
  if (existing) existing.remove();

  const overlay = document.createElement('div');
  overlay.className = 'spell-modal-overlay dt-modal-overlay';
  overlay.style.zIndex = '12000';

  const cfg = state.spellDCConfig;

  overlay.innerHTML = `
    <div class="spell-modal" style="width: 400px; max-width:90%;">
      <div class="modal-header">
        <h3>Configurar DT de Magia</h3>
        <button class="modal-close">✖</button>
      </div>
      <div class="modal-body" style="gap:15px;">
        <div style="background:#151515; padding:10px; border-radius:6px; border:1px solid #333;">
            <p style="font-size:13px; color:#aaa; margin:0; text-align:center;">
              Fórmula: <strong style="color:#fff;">8 + Prof + Mod + Extra</strong>
            </p>
        </div>
        <div>
          <label>Atributo Chave</label>
          <select id="dt-attr-select" class="dark-select">
            <option value="none" ${!cfg.selectedAttr ? 'selected' : ''}>Selecione...</option>
            <option value="int" ${cfg.selectedAttr === 'int' ? 'selected' : ''}>Inteligência</option>
            <option value="sab" ${cfg.selectedAttr === 'sab' ? 'selected' : ''}>Sabedoria</option>
            <option value="car" ${cfg.selectedAttr === 'car' ? 'selected' : ''}>Carisma</option>
            <option value="con" ${cfg.selectedAttr === 'con' ? 'selected' : ''}>Constituição</option>
            <option value="dex" ${cfg.selectedAttr === 'dex' ? 'selected' : ''}>Destreza</option>
            <option value="for" ${cfg.selectedAttr === 'for' ? 'selected' : ''}>Força</option>
          </select>
        </div>
        <div>
          <label>Modificador Extra</label>
          <input id="dt-extra-val" type="number" value="${cfg.extraMod || 0}">
        </div>
        <div class="modal-actions">
          <button class="btn-add btn-save-dt">Salvar</button>
        </div>
      </div>
    </div>
  `;

  document.body.appendChild(overlay);
  checkScrollLock();

  overlay.querySelector('.modal-close').onclick = () => { overlay.remove(); checkScrollLock(); };

  overlay.querySelector('.btn-save-dt').onclick = () => {
    state.spellDCConfig.selectedAttr = document.getElementById('dt-attr-select').value;
    state.spellDCConfig.extraMod = parseInt(document.getElementById('dt-extra-val').value) || 0;

    state.dtMagias = calculateSpellDC();
    renderSpells();
    saveStateToServer(); // SALVA A CONFIGURAÇÃO DA DT NO BACKEND
    overlay.remove();
    checkScrollLock();
  };
}

/* ---------------- MODAL MAGIA (DESCRIÇÃO CORRIGIDA) ---------------- */
function openSpellModal(existingSpell = null) {
  const modal = document.createElement('div');
  modal.className = 'spell-modal-overlay';
  modal.style.zIndex = '11000';

  // Prepara o editor
  const descContent = existingSpell ? existingSpell.description : '';
  const editorHTML = createRichEditorHTML(descContent, 'spell-editor-content');

  // Mantendo o resto do HTML igual, mas garantindo que o editor fique num bloco visível
  modal.innerHTML = `
      <div class="spell-modal">
        <div class="modal-header">
          <h3>${existingSpell ? 'Editar Magia' : 'Nova Magia'}</h3>
          <div style="display:flex;gap:8px;align-items:center;">
            <button class="modal-close">✖</button>
          </div>
        </div>
        
        <div class="modal-body">
          <div style="flex-shrink:0;"> <label>Nome*</label>
              <input id="modal-name" type="text" value="${existingSpell ? escapeHtml(existingSpell.name) : 'Nova Magia'}" />
              
              <div class="modal-row" style="margin-top:10px;">
                <div>
                  <label>Escola</label>
                  <select id="modal-school">
                    <option>Abjuração</option><option>Conjuração</option><option>Adivinhação</option><option>Encantamento</option>
                    <option>Evocação</option><option>Ilusão</option><option>Necromancia</option><option>Transmutação</option>
                  </select>
                </div>
                <div style="width:84px;">
                  <label>Nível</label>
                  <input id="modal-level" type="number" min="0" value="${existingSpell && typeof existingSpell.levelNumber !== 'undefined' ? existingSpell.levelNumber : 1}" />
                </div>
                <div style="flex:0 0 160px;">
                  <label>Classe</label>
                  <div class="class-select-root" id="class-select-root">
                    <div class="class-select-toggle" id="class-select-toggle">
                      <span id="class-select-value">${existingSpell && existingSpell.spellClass ? escapeHtml(existingSpell.spellClass) : 'Selecione'}</span>
                      <span class="caret-small">▾</span>
                    </div>
                    <div class="class-select-options" id="class-select-options" style="display:none;">
                      ${CLASSES_AVAILABLE.map(c => `<button class="class-option" data-val="${c}">${c}</button>`).join('')}
                    </div>
                  </div>
                </div>
                <div><label>Execução</label><input id="modal-exec" type="text" value="${existingSpell && existingSpell.attrs && existingSpell.attrs.execucao ? escapeHtml(existingSpell.attrs.execucao) : 'padrão'}" /></div>
                <div><label>Alcance</label><input id="modal-alc" type="text" value="${existingSpell && existingSpell.attrs && existingSpell.attrs.alcance ? escapeHtml(existingSpell.attrs.alcance) : 'pessoal'}" /></div>
              </div>

              <div class="modal-row">
                <div><label>Área</label><input id="modal-area" type="text" value="${existingSpell && existingSpell.attrs && existingSpell.attrs.area ? escapeHtml(existingSpell.attrs.area) : ''}" /></div>
                <div><label>Alvo</label><input id="modal-alvo" type="text" value="${existingSpell && existingSpell.attrs && existingSpell.attrs.alvo ? escapeHtml(existingSpell.attrs.alvo) : ''}" /></div>
                <div><label>Duração</label><input id="modal-dur" type="text" value="${existingSpell && existingSpell.attrs && existingSpell.attrs.duracao ? escapeHtml(existingSpell.attrs.duracao) : ''}" /></div>
                <div><label>Resistência</label><input id="modal-res" type="text" value="${existingSpell && existingSpell.attrs && existingSpell.attrs.resistencia ? escapeHtml(existingSpell.attrs.resistencia) : ''}" /></div>
              </div>

              <div class="modal-row">
                <div>
                  <label>Componentes</label>
                  <div style="display:flex;gap:8px;margin-top:6px;">
                    <label><input id="comp-v" type="checkbox" /> V</label>
                    <label><input id="comp-s" type="checkbox" /> S</label>
                    <label><input id="comp-m" type="checkbox" /> M</label>
                  </div>
                </div>
                <div><label>Material</label><input id="modal-material" type="text" value="${existingSpell && existingSpell.material ? escapeHtml(existingSpell.material) : ''}" /></div>
                <div style="flex:1"><label>Damage / Observações</label><input id="modal-damage" type="text" value="${existingSpell && existingSpell.damage ? escapeHtml(existingSpell.damage) : ''}" /></div>
              </div>
          </div>

          <div style="flex:1; display:flex; flex-direction:column; min-height:200px; margin-top:10px;">
              <label>Descrição</label>
              ${editorHTML}
          </div>
        </div>

        <div class="modal-actions">
          <button class="btn-add btn-save-modal">${existingSpell ? 'Salvar' : 'Adicionar'}</button>
          <button class="btn-add btn-cancel">Cancelar</button>
        </div>
      </div>
    `;
  document.body.appendChild(modal);
  checkScrollLock();

  // Inicializa eventos do editor (CRUCIAL PARA FUNCIONAR)
  setTimeout(() => initRichEditorEvents('spell-editor-content'), 50);

  // ... (Lógica de dropdowns e selects mantida igual) ...
  const schoolSel = modal.querySelector('#modal-school');
  if (existingSpell && existingSpell.school) {
    for (let i = 0; i < schoolSel.options.length; i++) {
      if (schoolSel.options[i].text === existingSpell.school) { schoolSel.selectedIndex = i; break; }
    }
  }
  if (existingSpell && existingSpell.components) {
    modal.querySelector('#comp-v').checked = !!existingSpell.components.V;
    modal.querySelector('#comp-s').checked = !!existingSpell.components.S;
    modal.querySelector('#comp-m').checked = !!existingSpell.components.M;
  }
  const classToggle = modal.querySelector('#class-select-toggle');
  const classOptions = modal.querySelector('#class-select-options');
  const classValueEl = modal.querySelector('#class-select-value');
  function closeClassOptions() { classOptions.style.display = 'none'; }
  function openClassOptions() { classOptions.style.display = 'block'; }
  classToggle.addEventListener('click', (ev) => {
    ev.stopPropagation();
    if (classOptions.style.display === 'block') closeClassOptions(); else openClassOptions();
  });
  modal.querySelectorAll('.class-option').forEach(btn => {
    btn.addEventListener('click', (ev) => {
      const val = btn.getAttribute('data-val');
      classValueEl.textContent = val;
      closeClassOptions();
    });
  });
  function onDocClick(e) { if (!modal.contains(e.target)) closeClassOptions(); }
  document.addEventListener('click', onDocClick);
  const closeModalClean = () => {
    document.removeEventListener('click', onDocClick);
    modal.remove();
    checkScrollLock();
  };
  modal.querySelector('.modal-close').addEventListener('click', closeModalClean);
  modal.querySelector('.btn-cancel').addEventListener('click', (ev) => { ev.preventDefault(); closeModalClean(); });

  const saveBtn = modal.querySelector('.btn-save-modal');
  // ... dentro de openSpellModal ...
  if (saveBtn) {
    saveBtn.addEventListener('click', (ev) => {
      ev.preventDefault();

      // --- LER DO EDITOR ---
      const descElement = document.getElementById('spell-editor-content');
      const desc = descElement ? descElement.innerHTML : '';

      const novo = {
        id: existingSpell ? existingSpell.id : uid(),
        name: modal.querySelector('#modal-name').value.trim() || 'Sem nome',
        levelNumber: Number(modal.querySelector('#modal-level').value) || 0,
        damage: modal.querySelector('#modal-damage').value.trim() || '-',

        // ALTERADO: Se for nova (existingSpell null), expanded é false. Se for edição, mantém o que estava.
        expanded: existingSpell ? existingSpell.expanded : false,

        active: existingSpell ? existingSpell.active : false,
        components: {
          V: modal.querySelector('#comp-v').checked,
          S: modal.querySelector('#comp-s').checked,
          M: modal.querySelector('#comp-m').checked
        },
        // ... restante do código ...
        material: modal.querySelector('#modal-material').value.trim(),
        attrs: {
          execucao: modal.querySelector('#modal-exec').value.trim() || 'padrão',
          alcance: modal.querySelector('#modal-alc') ? modal.querySelector('#modal-alc').value.trim() : '',
          area: modal.querySelector('#modal-area').value.trim(),
          alvo: modal.querySelector('#modal-alvo').value.trim(),
          duracao: modal.querySelector('#modal-dur').value.trim(),
          resistencia: modal.querySelector('#modal-res').value.trim()
        },
        school: modal.querySelector('#modal-school').value,
        spellClass: modal.querySelector('#class-select-value').textContent === 'Selecione' ? '' : modal.querySelector('#class-select-value').textContent,
        description: desc
      };
      if (existingSpell) {
        state.spells = state.spells.map(s => s.id === novo.id ? novo : s);
      } else {
        state.spells.unshift(novo);
      }
      document.removeEventListener('click', onDocClick);
      modal.remove();
      checkScrollLock();
      renderSpells();
      saveStateToServer();
    });
  }
}


function openSpellCatalogOverlay(parentModal = null) {
  const existing = document.querySelector('.catalog-overlay-large');
  if (existing) { existing.remove(); return; }

  const overlay = document.createElement('div');
  overlay.className = 'catalog-overlay-large';

  const filters = [
    { label: 'Todos', val: 'all' },
    { label: 'Truque (0º)', val: '0' }
  ];
  for (let i = 1; i <= 9; i++) {
    filters.push({ label: `${i}º Círculo`, val: String(i) });
  }

  const circlesHtml = filters.map((f, idx) => {
    return `<button class="circle-filter ${idx === 0 ? 'active' : ''}" data-filter="${f.val}">${f.label}</button>`;
  }).join('');

  overlay.innerHTML = `
      <div class="catalog-large" role="dialog" aria-modal="true">
        <div class="catalog-large-header">
          <h3>Adicionar Magias</h3>
          <div style="display:flex;gap:8px;align-items:center;">
              <button id="catalog-new-spell" class="btn-add" style="background:#222;border:1px solid rgba(255,255,255,0.04);">Criar Magia</button>
              <div class="catalog-large-close" title="Fechar" style="cursor:pointer;">✖</div>
          </div>
        </div>
        <div class="catalog-large-filters">
          ${circlesHtml}
        </div>
        <div class="catalog-large-search">
          <input id="catalogLargeSearch" placeholder="Ex: pode pesquisar coisas separadas, separa por vírgula ma pesquisa(coisa1,coisa2,palavra-chave3)..." />
        </div>
        <div class="catalog-large-list">
          ${spellCatalog.map(c => formatCatalogSpellCard(c)).join('')}
        </div>
      </div>
    `;
  document.body.appendChild(overlay);
  checkScrollLock();

  // FECHAR
  overlay.querySelector('.catalog-large-close').onclick = () => { overlay.remove(); checkScrollLock(); };

  // BOTÃO CRIAR MAGIA MANUAL
  overlay.querySelector('#catalog-new-spell').onclick = () => {
    overlay.remove();
    openSpellModal(null);
  };

  // FILTROS DE CÍRCULO (Visual)
  overlay.querySelectorAll('.circle-filter').forEach(btn => {
    btn.onclick = () => {
      overlay.querySelectorAll('.circle-filter').forEach(b => b.classList.remove('active'));
      btn.classList.add('active');

      // Re-aplica o filtro de texto + círculo
      triggerSearch();
    };
  });

  // BUSCA (Lógica Principal)
  const inputSearch = overlay.querySelector('#catalogLargeSearch');
  inputSearch.oninput = triggerSearch;

  function triggerSearch() {
    const q = inputSearch.value.toLowerCase();
    const searchTerms = q.split(',').map(t => t.trim()).filter(t => t);

    const activeCircleBtn = overlay.querySelector('.circle-filter.active');
    const circleFilter = activeCircleBtn ? activeCircleBtn.dataset.filter : 'all';

    overlay.querySelectorAll('.catalog-card-item').forEach(card => {
      // 1. Filtro de Círculo
      const itemLevel = card.dataset.level;
      const passCircle = (circleFilter === 'all' || itemLevel === circleFilter);

      // 2. Filtro de Texto (Comma Separated)
      let passText = true;
      if (searchTerms.length > 0) {
        // Pega os dados brutos do card (reconstruindo a string de busca)
        // O ideal seria ter o objeto original, mas vamos pegar do DOM para simplificar a referência
        // ou buscar no spellCatalog pelo ID se precisar de mais precisão.
        // Vamos usar o spellCatalog global para busca precisa.

        const id = card.dataset.id;
        const spell = spellCatalog.find(s => s.id === id);

        if (spell) {
          const fullText = [
            spell.name,
            spell.school,
            spell.spellClass,
            spell.levelNumber.toString(),
            spell.damage,
            spell.description,
            spell.material,
            // Componentes
            (spell.components?.V ? 'verbal' : ''),
            (spell.components?.S ? 'somatico' : ''),
            (spell.components?.M ? 'material' : '')
          ].filter(Boolean).join(' ').toLowerCase();

          passText = searchTerms.every(term => fullText.includes(term));
        } else {
          // Fallback se não achar no catalogo (raro)
          passText = card.textContent.toLowerCase().includes(searchTerms[0]);
        }
      }

      card.style.display = (passCircle && passText) ? '' : 'none';
    });
  }

  // BOTÃO ADICIONAR (+)
  overlay.querySelectorAll('.catalog-add-btn').forEach(btn => {
    btn.onclick = (ev) => {
      ev.stopPropagation();
      const id = btn.dataset.id;
      const c = spellCatalog.find(x => x.id === id);
      if (!c) return;

      const classes = c.spellClass ? c.spellClass.split(',').map(s => s.trim()) : [];

      if (classes.length > 1) {
        abrirPopupSelecaoClasse(classes, (classeEscolhida) => {
          adicionarMagiaAoState(c, classeEscolhida);
          btn.textContent = '✓';
          setTimeout(() => btn.textContent = '+', 1000);
        });
      } else {
        adicionarMagiaAoState(c, classes[0] || '');
        btn.textContent = '✓';
        setTimeout(() => btn.textContent = '+', 1000);
      }
    };
  });

  function adicionarMagiaAoState(c, classeFinal) {
    // Agora active: true faz ela aparecer imediatamente na lista de preparadas
    state.spells.unshift({ ...c, id: uid(), expanded: false, active: true, spellClass: classeFinal });

    renderSpells();
    saveStateToServer();

    // Recomendado: Adicionar isso para forçar atualização de contadores/DT se houver listeners
    window.dispatchEvent(new CustomEvent('sheet-updated'));
  }

  // LÓGICA DE EXPANDIR
  overlay.querySelectorAll('.catalog-card-header').forEach(header => {
    header.style.cursor = 'pointer';
    header.addEventListener('click', (ev) => {
      if (ev.target.closest('.catalog-add-btn')) return;
      const card = header.closest('.catalog-card-item');
      const body = card.querySelector('.catalog-card-body');
      const toggle = card.querySelector('.catalog-card-toggle');
      const isHidden = body.style.display === 'none';
      body.style.display = isHidden ? 'block' : 'none';
      toggle.textContent = isHidden ? '▾' : '▸';
    });
  });
}

function formatCatalogSpellCard(c) {
  const v = c.components?.V ? 'V' : '';
  const s = c.components?.S ? 'S' : '';
  const m = c.components?.M ? 'M' : '';
  const comps = [v, s, m].filter(x => x).join(' ') || '-';

  return `
      <div class="catalog-card-item card" data-id="${c.id}" data-level="${(c.levelNumber !== undefined && c.levelNumber !== null) ? c.levelNumber : ''}">
        <div class="catalog-card-header" style="display:flex;justify-content:space-between;align-items:flex-start;gap:12px;">
          <div class="left" style="display:flex;gap:12px;align-items:center;min-width:0;cursor:pointer;">
            <button class="catalog-card-toggle">▸</button>
            <div style="min-width:0;">
              <div class="catalog-card-title" style="font-weight:800;font-size:18px;white-space:normal;overflow:hidden;text-overflow:ellipsis;">${c.name}</div>
              <div style="font-size:13px;color:#bbb;margin-top:6px;">${c.school || '-'} • Nível ${c.levelNumber || 0}</div>
            </div>
          </div>
          <div style="display:flex;align-items:center;gap:12px;">
            <div class="catalog-card-dmg" style="font-weight:800;color:#9c27b0;font-size:18px;">${c.damage || '-'}</div>
            <button class="catalog-add-btn plus-btn" data-id="${c.id}" title="Adicionar">+</button>
          </div>
        </div>
        <div style="height:2px;background:linear-gradient(90deg,#9c27b0,#7b1fa2);margin-top:10px;border-radius:4px;"></div>
        
        <div class="catalog-card-body" style="display:none;margin-top:12px;color:#ddd;">
          <div style="font-size:13px; color:#ccc; margin-bottom:10px;">
              <div style="margin-bottom:8px;">
                <span style="margin-right:12px;"><strong style="color:#9c27b0">Classe:</strong> ${c.spellClass || '-'}</span>
              </div>

              <div class="spell-attrs" style="display:grid; grid-template-columns: 1fr 1fr; gap:6px;">
                <div><span class="purple">Execução:</span> ${c.attrs?.execucao || '-'}</div>
                <div><span class="purple">Alcance:</span> ${c.attrs?.alcance || '-'}</div>
                <div><span class="purple">Área:</span> ${c.attrs?.area || '-'}</div>
                <div><span class="purple">Alvo:</span> ${c.attrs?.alvo || '-'}</div>
                <div><span class="purple">Duração:</span> ${c.attrs?.duracao || '-'}</div>
                <div><span class="purple">Resistência:</span> ${c.attrs?.resistencia || '-'}</div>
              </div>

              <div style="margin-top:10px;">
                <div><span class="purple">Componentes:</span> ${comps}</div>
                <div><span class="purple">Material:</span> ${c.material || '-'}</div>
              </div>

              <div style="margin-top:8px;">
                <span class="purple">Damage / Observações:</span> ${c.damage || '-'}
              </div>
          </div>

          <div style="border-top:1px solid rgba(255,255,255,0.05); padding-top:8px;">
            <p style="line-height:1.4;color:#ddd;">${c.description || '-'}</p>
          </div>
        </div>
      </div>
    `;
}

/* --- FUNÇÃO CORRIGIDA: MAGIAS PREPARADAS --- */
function renderPreparedSpells() {
  state.dtMagias = calculateSpellDC();
  const slotsHTML = renderSpellSlotsHTML();

  const habilidadesPreparadas = state.abilities.filter(h => h.active);
  const magiasPreparadas = state.spells.filter(s => s.active);

  // Estados iniciais (Minimizar seções)
  const isMagiasMin = !!state.minimizedPreparedSpells;
  const isHabsMin = !!state.minimizedPreparedAbilities;

  const arrowMagias = isMagiasMin ? '▸' : '▾';
  const arrowHabs = isHabsMin ? '▸' : '▾';
  const styleMagias = isMagiasMin ? 'display:none;' : '';
  const styleHabs = isHabsMin ? 'display:none;' : '';

  // HTML Magias (Usa o formatador padrão que já tem os botões)
  let magiasHTML = '';
  if (magiasPreparadas.length > 0) {
    magiasHTML = `
            <div id="toggle-magias" class="toggle-section-header" style="margin: 10px 0 6px 4px; border-bottom: 1px solid rgba(255,255,255,0.1); padding-bottom: 6px; cursor:pointer; display:flex; align-items:center;">
                <span style="font-size:16px; color:#9c27b0; width:15px;">${arrowMagias}</span> 
                <span style="color: #ddd; text-transform: uppercase; font-size: 14px; font-weight:700;">Magias Preparadas</span>
                
                <div id="btnRollSpellAttack_PrepHeader" title="Rolar Ataque Mágico (d20 + Prof + Mod)" style="cursor:pointer; margin-left:auto; padding-left:10px; transition: transform 0.2s;">
                    <img src="img/imagem-no-site/dado.png" alt="dado" style="width:26px; height:26px; opacity:0.9; display:block; filter: drop-shadow(0 0 2px rgba(156, 39, 176, 0.5));" />
                </div>
            </div>

            <div id="content-magias" class="section-content" style="${styleMagias}">
                ${magiasPreparadas.map(formatMySpellCard).join('')}
            </div>
        `;
  }

  // HTML Habilidades
  let habilidadesHTML = '';
  if (habilidadesPreparadas.length > 0) {
    habilidadesHTML = `
            <h4 id="toggle-habs" class="toggle-section-header" style="margin: 20px 0 6px 4px; color: #b39cff; text-transform: uppercase; font-size: 12px; border-bottom: 1px solid rgba(255,255,255,0.1); padding-bottom: 4px; cursor:pointer;">
                <span style="font-size:14px; color:#9c27b0; width:12px;">${arrowHabs}</span> Habilidades Ativas
            </h4>
            <div id="content-habs" class="section-content" style="${styleHabs}">
                ${habilidadesPreparadas.map(a => `
                    <div class="card hab-card ${a.expanded ? 'expanded' : ''}" data-id="${a.id}" data-type="hab">
                        <div class="card-header">
                            <div class="left" data-id="${a.id}" style="cursor:pointer; display:flex; align-items:center; gap:8px;">
                                <span class="caret">${a.expanded ? '▾' : '▸'}</span>
                                <div class="card-title" style="color:#b39cff;">${a.title}</div>
                            </div>
                            <div class="right">
                                <label class="check-ativar" title="Remover dos Preparados">
                                    <input class="hab-activate" type="checkbox" data-id="${a.id}" checked />
                                    <span class="square-check"></span>
                                </label>
                            </div>
                        </div>
                        <div class="card-body" style="${a.expanded ? '' : 'display:none;'}">
                            <div>${a.description || 'Sem descrição.'}</div>
                            <div style="margin-top:8px;">
                                <a href="#" class="remover-hab" data-id="${a.id}">Remover</a>
                                <a href="#" class="editar-hab" data-id="${a.id}" style="float:right;color:#2e7d32">Editar</a>
                            </div>
                        </div>
                    </div>
                `).join('')}
            </div>
        `;
  }

  let listaContent = `${magiasHTML}${habilidadesHTML}`;
  if (!habilidadesPreparadas.length && !magiasPreparadas.length) {
    listaContent = `<div class="empty-tip">Nenhuma habilidade ou magia preparada/ativa.</div>`;
  }

  conteudoEl.innerHTML = `
        <div class="spells-wrapper">
            ${slotsHTML}
            ${slotsHTML ? '<hr style="border:0; border-top:1px solid rgba(255,255,255,0.1); margin: 15px 0;">' : ''}

            <div class="controls-row">
                <input id="filterPrepared" placeholder="Filtrar..." />
                <div class="right-controls">
                    <div class="dt-magias" id="btnOpenDTConfig_Prep" style="cursor:pointer;" title="Clique para configurar">
                        <label style="cursor:pointer; color:#9c27b0;">DT DE MAGIAS ⚙️</label>
                        <input id="dtMagiasInput_Prep" type="text" value="${state.dtMagias}" readonly 
                               style="cursor:pointer; font-weight:bold; color:#fff; text-align:center; min-width:80px;" />
                    </div>
                </div>
            </div>

            <div class="spells-list">
                ${listaContent}
            </div>
        </div>
    `;

  // --- EVENTOS DA PÁGINA ---

  // 1. Configurar DT e Slots
  const btnDTPrep = document.getElementById('btnOpenDTConfig_Prep');
  if (btnDTPrep) btnDTPrep.addEventListener('click', openDTConfigModal);
  bindSlotEvents();

  // REMOVIDO: bindSpellAttackEvents(); -> Essa função não existe e estava travando o código.

  // 2. Filtro Rápido
  const filterInput = document.getElementById('filterPrepared');
  if (filterInput) {
    filterInput.addEventListener('input', (e) => {
      const val = e.target.value.toLowerCase();
      conteudoEl.querySelectorAll('.card').forEach(c => {
        const txt = c.textContent.toLowerCase();
        c.style.display = txt.includes(val) ? '' : 'none';
      });
    });
  }

  // 3. Toggles de Seção
  const btnToggleMagias = document.getElementById('toggle-magias');
  if (btnToggleMagias) {
    btnToggleMagias.addEventListener('click', (e) => {
      if (e.target.closest('#btnRollSpellAttack_PrepHeader')) return;
      state.minimizedPreparedSpells = !state.minimizedPreparedSpells;
      // saveStateToServer(); <--- REMOVA ISSO
      renderActiveTab();
    });
  }
  const btnToggleHabs = document.getElementById('toggle-habs');
  if (btnToggleHabs) {
    btnToggleHabs.addEventListener('click', () => {
      state.minimizedPreparedAbilities = !state.minimizedPreparedAbilities;
      // saveStateToServer(); <--- REMOVA ISSO
      renderActiveTab();
    });
  }

  // =================================================================
  // 4. EVENTOS DE CARDS (CORRIGIDOS)
  // =================================================================

  // --- MAGIAS ---

  // A. Expandir (Magias)
  conteudoEl.querySelectorAll('.spell-card .card-header').forEach(h => {
    h.addEventListener('click', (ev) => {
      if (ev.target.closest('.check-ativar') || ev.target.closest('.spell-right')) return;
      const id = Number(h.closest('.card').dataset.id);
      const s = state.spells.find(x => x.id === id);
      if (s) {
        s.expanded = !s.expanded;
        // saveStateToServer();  <--- REMOVA OU COMENTE ISSO
        renderActiveTab();
      }
    });
  });

  // B. Checkbox (Despreparar)
  conteudoEl.querySelectorAll('.spell-activate').forEach(ch => {
    ch.addEventListener('change', (ev) => {
      const id = Number(ev.target.dataset.id);
      const s = state.spells.find(x => x.id === id);
      if (s) {
        s.active = ev.target.checked;
        saveStateToServer();
        renderActiveTab();
      }
    });
    ch.addEventListener('click', e => e.stopPropagation());
  });

  // C. REMOVER Magia
  conteudoEl.querySelectorAll('.remover-spell').forEach(btn => {
    btn.addEventListener('click', (ev) => {
      ev.preventDefault();
      const id = Number(btn.dataset.id);
      state.spells = state.spells.filter(s => s.id !== id);
      saveStateToServer();
      renderActiveTab();
    });
  });

  // D. EDITAR Magia
  conteudoEl.querySelectorAll('.editar-spell').forEach(btn => {
    btn.addEventListener('click', (ev) => {
      ev.preventDefault();
      const id = Number(btn.dataset.id);
      const s = state.spells.find(x => x.id === id);
      if (s) openSpellModal(s);
    });
  });


  // --- HABILIDADES ---

  // A. Expandir (Habilidades)
  conteudoEl.querySelectorAll('.hab-card .card-header').forEach(h => {
    h.addEventListener('click', (ev) => {
      if (ev.target.closest('.check-ativar')) return;
      const id = Number(h.closest('.card').dataset.id);
      const hab = state.abilities.find(a => a.id === id);
      if (hab) {
        hab.expanded = !hab.expanded;
        // saveStateToServer(); <--- REMOVA OU COMENTE ISSO
        renderActiveTab();
      }
    });
  });

  // B. Checkbox (Desativar)
  conteudoEl.querySelectorAll('.hab-activate').forEach(ch => {
    ch.addEventListener('change', (ev) => {
      const id = Number(ev.target.dataset.id);
      const hab = state.abilities.find(a => a.id === id);
      if (hab) {
        hab.active = ev.target.checked;
        saveStateToServer();
        renderActiveTab();
      }
    });
    ch.addEventListener('click', e => e.stopPropagation());
  });

  // C. REMOVER Habilidade
  conteudoEl.querySelectorAll('.remover-hab').forEach(btn => {
    btn.addEventListener('click', (ev) => {
      ev.preventDefault();
      const id = Number(btn.dataset.id);
      state.abilities = state.abilities.filter(a => a.id !== id);
      saveStateToServer();
      renderActiveTab();
    });
  });

  // D. EDITAR Habilidade
  conteudoEl.querySelectorAll('.editar-hab').forEach(btn => {
    btn.addEventListener('click', (ev) => {
      ev.preventDefault();
      const id = Number(btn.dataset.id);
      const hab = state.abilities.find(a => a.id === id);
      if (hab) openNewAbilityModal(hab);
    });
  });
}

/* ---------------- CATALOGO DE ITENS (DESIGN UNIFICADO) ---------------- */

const ITEM_CATEGORIES = ['Armas', 'Armaduras', 'Utensílios', 'Conjuntos', 'Provisão'];

const ITEM_SUBCATEGORIES = {
  'Armas': ['Corpo-a-corpo', 'A distancia', 'Munição', 'Fora de epoca'],
  'Armaduras': ['Armaduras', 'Escudos'],
  'Utensílios': ['Utensílios gerais'],
  'Conjuntos': ['Kits', 'Pacotes', 'Ferramentas'],
  'Provisão': ['Comida', 'Transporte/Animais', 'Hospedagem']
};

/* ---------------- CATALOGO DE ITENS (DESIGN RESTAURADO + BOTÃO MANUAL) ---------------- */
window.openItemCatalogOverlay = () => {
  const existing = document.querySelector('.catalog-overlay-large-items');
  if (existing) existing.remove();

  let activeCat = 'Armas';
  let activeSub = 'Corpo-a-corpo';

  const overlay = document.createElement('div');
  overlay.className = 'catalog-overlay-large catalog-overlay-large-items';

  const catsHtml = ITEM_CATEGORIES.map((c, i) =>
    `<button class="ability-class-btn ${i === 0 ? 'active' : ''}" data-cat="${c}">${c}</button>`
  ).join('');

  overlay.innerHTML = `
      <div class="catalog-large" role="dialog" aria-modal="true" style="width:980px; max-width:calc(100% - 40px);">
        <div class="catalog-large-header">
          <h3>Lista Padrão de Itens</h3>
          
          <div style="display:flex; gap:10px; align-items:center;">
              <button id="btnCriarManual" style="background:#222; border:1px solid #444; color:#ccc; padding:6px 12px; border-radius:4px; cursor:pointer; font-weight:bold; font-size:12px; transition:0.2s;">
                Criar Manualmente
              </button>
              <div class="catalog-large-close" title="Fechar" style="cursor:pointer;">✖</div>
          </div>

        </div>
        <div class="catalog-large-classes" id="item-cats-row">${catsHtml}</div>
        <div id="item-subs-row" style="display:flex; gap:10px; flex-wrap:wrap; margin-top:8px; padding-bottom:6px;"></div>
        <div class="catalog-large-search" style="margin-top:6px;">
          <input id="catalogItemSearch" placeholder="Ex: espada, dano cortante, escudo..." />
        </div>
        <div class="catalog-large-list item-list-large" style="margin-top:10px; overflow:auto; flex:1;"></div>
      </div>
    `;

  document.body.appendChild(overlay);
  checkScrollLock();

  // --- EVENTO DO BOTÃO CRIAR MANUAL ---
  const btnManual = overlay.querySelector('#btnCriarManual');
  btnManual.onmouseover = () => { btnManual.style.borderColor = '#9c27b0'; btnManual.style.color = '#fff'; };
  btnManual.onmouseout = () => { btnManual.style.borderColor = '#444'; btnManual.style.color = '#ccc'; };

  btnManual.onclick = () => {
    overlay.remove(); // Fecha o catálogo
    openItemModal(null); // Abre o modal manual (função existente)
  };
  // ------------------------------------

  overlay.querySelector('.catalog-large-close').onclick = () => { overlay.remove(); checkScrollLock(); };

  function renderSubs() {
    const row = overlay.querySelector('#item-subs-row');
    const subs = ITEM_SUBCATEGORIES[activeCat] || [];
    if (subs.length === 0) { row.style.display = 'none'; }
    else {
      row.style.display = 'flex';
      row.innerHTML = subs.map(s => `<button class="ability-sub-btn ${s === activeSub ? 'active' : ''}" data-sub="${s}">${s}</button>`).join('');
    }
    row.querySelectorAll('.ability-sub-btn').forEach(btn => {
      btn.onclick = () => { activeSub = btn.dataset.sub; renderSubs(); renderList(); };
    });
  }

  function renderList() {
    const container = overlay.querySelector('.item-list-large');
    const searchInput = overlay.querySelector('#catalogItemSearch').value.toLowerCase();
    const searchTerms = searchInput.split(',').map(t => t.trim()).filter(t => t);

    let items = itemCatalog.filter(i => i.category === activeCat);

    if (ITEM_SUBCATEGORIES[activeCat]?.length > 0) {
      items = items.filter(i => i.subcategory === activeSub);
    }

    if (searchTerms.length > 0) {
      items = items.filter(item => {
        const searchableText = [
          item.name, item.description, item.type, item.tipoArma,
          item.proficiency, item.damageType,
          Array.isArray(item.damageTypes) ? item.damageTypes.join(' ') : '',
          item.caracteristicas ? item.caracteristicas.join(' ') : '',
          item.empunhadura, item.defense ? `CA ${item.defense}` : ''
        ].filter(Boolean).join(' ').toLowerCase();
        return searchTerms.every(term => searchableText.includes(term));
      });
    }

    if (items.length === 0) {
      container.innerHTML = `<div style="color:#ddd;padding:18px;">Nenhum item encontrado.</div>`;
      return;
    }

    container.innerHTML = items.map(item => {
      let metaInfo = '';
      let highlightVal = '';

      if (item.category === 'Armas') {
        const dano2M = item.damage2Hands ? ` / ${item.damage2Hands}` : '';
        const tDano = Array.isArray(item.damageTypes) ? item.damageTypes[0] : (item.damageType || '');
        metaInfo = `${item.tipoArma || ''} • ${item.proficiency || ''} ${tDano ? `• ${tDano}` : ''}`;
        highlightVal = `${item.damage}${dano2M}`;
      } else if (item.category === 'Armaduras') {
        metaInfo = `${item.tipoItem || ''} • ${item.proficiency || ''}`;
        highlightVal = item.defense ? `CA ${item.defense}` : '-';
      } else {
        metaInfo = item.subcategory || item.type || 'Item';
      }

      return `
            <div class="catalog-card-item card" data-id="${item.id}" style="background:#1b1b1b; border:1px solid rgba(255,255,255,0.05); padding:0; margin-bottom:8px; overflow:hidden;">
                <div class="catalog-card-header" style="display:flex; justify-content:space-between; align-items:center; padding:12px; cursor:pointer;">
                    <div class="left" style="display:flex; gap:12px; align-items:center; min-width:0; flex:1;">
                        <button class="catalog-card-toggle" style="background:transparent; border:none; color:#9c27b0; font-weight:800; font-size:18px; cursor:pointer;">▸</button>
                        <div style="display:flex; flex-direction:column; min-width:0;">
                            <div class="catalog-card-title" style="font-weight:800; color:#fff; font-size:16px;">${item.name}</div>
                            <div style="font-size:13px; color:#bbb; margin-top:4px;">${metaInfo}</div>
                        </div>
                    </div>
                    <div style="display:flex; align-items:center; gap:12px;">
                        ${highlightVal ? `<div class="catalog-card-dmg" style="font-weight:800; color:#9c27b0; font-size:15px; white-space:nowrap;">${highlightVal}</div>` : ''}
                        <button class="catalog-add-btn plus-btn" data-id="${item.id}" title="Adicionar">+</button>
                    </div>
                </div>

                <div style="height:2px; background:#9c27b0; width: calc(100% - 24px); margin: 0 auto; border-radius:2px;"></div>
                
                <div class="catalog-card-body" style="display:none; padding:12px; color:#ddd; font-size:14px; line-height:1.5;">
                    <div style="margin-bottom:8px; font-size:13px; color:#ccc; display:grid; grid-template-columns: 1fr 1fr; gap:4px;">
                        ${item.damage ? `<div><strong class="purple">Dano:</strong> ${item.damage} ${item.damage2Hands ? `(2M: ${item.damage2Hands})` : ''}</div>` : ''}
                        ${item.category === 'Armas' ? `<div><strong class="purple">Tipo:</strong> ${Array.isArray(item.damageTypes) ? item.damageTypes.join(', ') : (item.damageType || '-')}</div>` : ''}
                        ${item.empunhadura ? `<div><strong class="purple">Mãos:</strong> ${item.empunhadura}</div>` : ''}
                        ${item.alcance ? `<div><strong class="purple">Alcance:</strong> ${item.alcance}</div>` : ''}
                    </div>
                    <div style="padding-top:8px; border-top:1px solid rgba(255,255,255,0.05);">${item.description || 'Sem descrição.'}</div>
                </div>
            </div>`;
    }).join('');

    container.querySelectorAll('.catalog-card-header').forEach(header => {
      header.addEventListener('click', (ev) => {
        if (ev.target.closest('.catalog-add-btn')) return;
        const card = header.closest('.catalog-card-item');
        const body = card.querySelector('.catalog-card-body');
        const toggle = card.querySelector('.catalog-card-toggle');
        const isHidden = body.style.display === 'none';
        body.style.display = isHidden ? 'block' : 'none';
        toggle.textContent = isHidden ? '▾' : '▸';
      });
    });

    container.querySelectorAll('.catalog-add-btn').forEach(btn => {
      btn.onclick = (ev) => {
        ev.stopPropagation();
        adicionarItemDoCatalogo(btn.dataset.id);
        btn.textContent = '✓';
        setTimeout(() => btn.textContent = '+', 1000);
      };
    });
  }

  overlay.querySelectorAll('.ability-class-btn').forEach(btn => {
    btn.onclick = () => {
      overlay.querySelectorAll('.ability-class-btn').forEach(b => b.classList.remove('active'));
      btn.classList.add('active');
      activeCat = btn.dataset.cat;
      activeSub = ITEM_SUBCATEGORIES[activeCat] ? ITEM_SUBCATEGORIES[activeCat][0] : '';
      renderSubs(); renderList();
    };
  });

  overlay.querySelector('#catalogItemSearch').oninput = renderList;
  renderSubs();
  renderList();
};


// Conectar ao botão "Lista Padrão" dentro do Modal de Itens
document.addEventListener('click', (e) => {
  if (e.target && e.target.id === 'btnListaPadrao') {
    e.preventDefault();
    const modal = document.querySelector('.spell-modal-overlay');
    if (modal) modal.remove(); // Fecha o modal de criação manual
    checkScrollLock();
    openItemCatalogOverlay(); // Abre o catálogo
  }
});

window.toggleCatalogItemDetails = (el) => {
  const body = el.parentElement.parentElement.querySelector('.catalog-body-detail');
  const btn = el.querySelector('.catalog-card-toggle');
  const isHidden = body.style.display === 'none';
  body.style.display = isHidden ? 'block' : 'none';
  btn.textContent = isHidden ? '▾' : '▸';
};

// Função chamada pelo botão "+" do catálogo
window.adicionarItemDoCatalogo = (id) => {
  const i = itemCatalog.find(x => x.id === id);
  if (!i) return;

  let novoItem = {
    id: uid(),
    name: i.name,
    description: i.description || '',
    expanded: false,
    equip: false,
    type: i.type || 'Arma',
    isEquipable: true,
    proficiency: i.proficiency || 'Armas Simples',

    // --- CORREÇÃO AQUI ---
    defense: i.defense || '',         // Copia o valor da CA (ex: "11")
    tipoItem: i.tipoItem || '',       // Importante para saber se é "Armadura" ou "Escudo"
    minStrength: i.minStrength || '', // Requisito de Força (para armaduras pesadas)
    // ---------------------

    tipoArma: i.tipoArma || 'Corpo a Corpo',
    empunhadura: i.empunhadura || 'Uma mao',
    crit: i.crit || '20',
    multiplicador: i.multiplicador || '2',
    alcance: i.alcance || '1.5m',
    attunement: i.attunement || 'Não',
    damage: i.damage || '1d4',
    damage2Hands: i.damage2Hands || '',
    useTwoHands: false,
    damageTypes: Array.isArray(i.damageTypes) ? [...i.damageTypes] : (i.damageType ? [i.damageType] : []),
    moreDmgList: i.moreDmgList || [],
    caracteristicas: i.caracteristicas || []
  };

  state.inventory.unshift(novoItem);
  renderInventory();
  saveStateToServer();

  // Força atualização da CA visualmente
  if (typeof atualizarAC === 'function') atualizarAC();
  window.dispatchEvent(new CustomEvent('sheet-updated'));
};

// Conectar ao botão "Lista Padrão" dentro do Modal de Itens
// (Certifique-se de que isso é chamado dentro de openItemModal ou globalmente se o modal for estático)
document.addEventListener('click', (e) => {
  if (e.target && e.target.id === 'btnListaPadrao') {
    e.preventDefault();
    const modal = document.querySelector('.spell-modal-overlay');
    if (modal) modal.remove();
    openItemCatalogOverlay();
  }
});


/* ---------------- HABILIDADES CATALOG / NOVA HABILIDADE ---------------- */
function openAbilityCatalogOverlay() {
  const existing = document.querySelector('.catalog-overlay-large-abilities');
  if (existing) { existing.remove(); return; }

  let activeClass = CLASSES_AVAILABLE.includes('Talentos') ? 'Talentos' : CLASSES_AVAILABLE[0];
  let activeClassHabilitySelected = true;
  let activeSubclass = null;

  // Controle de Expansão (false = Recluso/Scroll, true = Expandido)
  let isSubclassesExpanded = false;

  const overlay = document.createElement('div');
  overlay.className = 'catalog-overlay-large catalog-overlay-large-abilities';

  // Botões das classes (topo)
  const classesHtml = CLASSES_AVAILABLE.map(c =>
    `<button class="ability-class-btn ${c === activeClass ? 'active' : ''}" data-class="${c}">${c}</button>`
  ).join('');

  overlay.innerHTML = `
      <div class="catalog-large" role="dialog" aria-modal="true">
        
        <div class="catalog-fixed-header" style="flex-shrink: 0;">
          <div class="catalog-large-header">
            <h3>Adicionar Habilidades</h3>
            <div style="display:flex;gap:8px;align-items:center;">
              <button id="catalog-new-hab" class="btn-add" style="background:#222;border:1px solid rgba(255,255,255,0.04);">Nova Habilidade</button>
              <div class="catalog-large-close" title="Fechar" style="cursor:pointer;">✖</div>
            </div>
          </div>

          <div class="catalog-large-classes">
            ${classesHtml}
          </div>

          <div id="catalog-class-habilities-row" style="display:flex; align-items:center; margin-top:6px;"></div>
          <div id="catalog-subclasses-row" style="display:flex; margin-top:8px; padding-bottom:6px;"></div>

          <div class="catalog-large-search" style="margin-top:6px;">
            <input id="catalogAbilitySearch" placeholder="Ex: ataque, guerreiro (separa por vírgula)..." />
          </div>
        </div>

        <div class="catalog-large-list abilities-list-large">
        </div>

      </div>
    `;

  document.body.appendChild(overlay);
  checkScrollLock();

  overlay.querySelector('.catalog-large-close').onclick = () => { overlay.remove(); checkScrollLock(); };

  overlay.querySelector('#catalog-new-hab').onclick = () => {
    overlay.remove();
    openNewAbilityModal(null);
  };

  overlay.querySelectorAll('.ability-class-btn').forEach(btn => {
    btn.onclick = () => {
      overlay.querySelectorAll('.ability-class-btn').forEach(b => b.classList.remove('active'));
      btn.classList.add('active');
      activeClass = btn.dataset.class;


      activeClassHabilitySelected = true;
      activeSubclass = null;

      renderClassHabilitiesRow();
      renderSubclassesRow();
      renderCatalogList();
      btn.scrollIntoView({ inline: 'center', behavior: 'smooth' });
    };
  });

  function renderClassHabilitiesRow() {
    const row = overlay.querySelector('#catalog-class-habilities-row');
    if (!activeClass) { row.style.display = 'none'; return; }

    const subs = CLASSES_WITH_SUBCLASSES[activeClass] || [];
    const hasSubclasses = subs.length > 0;

    row.style.display = 'flex';
    row.style.alignItems = 'center';

    let html = '';

    // --- ALTERAÇÃO AQUI: Remove o botão se for Antecedentes ---
    if (activeClass !== 'Antecedentes') {
      html += `<button class="catalog-class-hability-pill ${activeClassHabilitySelected ? 'active' : ''}">Habilidades de ${activeClass}</button>`;
    }

    if (hasSubclasses) {
      // Ícone ⊞ para expandir (grid) e ⇄ para recluso (scroll)
      html += `<button id="toggle-sub-expansion" class="toggle-expansion-btn" title="Alternar visualização">
                ${isSubclassesExpanded ? '⇄' : '⊞'}
               </button>`;
    }

    row.innerHTML = html;

    // Só adiciona o evento de clique se o botão existir (não for Antecedentes)
    const pillBtn = row.querySelector('.catalog-class-hability-pill');
    if (pillBtn) {
      pillBtn.onclick = function () {
        activeClassHabilitySelected = true;
        activeSubclass = null;
        renderClassHabilitiesRow();
        overlay.querySelectorAll('.ability-sub-btn').forEach(b => b.classList.remove('active'));
        renderCatalogList();
      };
    }

    if (hasSubclasses) {
      row.querySelector('#toggle-sub-expansion').onclick = () => {
        isSubclassesExpanded = !isSubclassesExpanded;
        renderClassHabilitiesRow();
        renderSubclassesRow();
      };
    }
  }

  function renderSubclassesRow() {
    const row = overlay.querySelector('#catalog-subclasses-row');
    const subs = CLASSES_WITH_SUBCLASSES[activeClass] || [];

    if (!subs.length) { row.style.display = 'none'; return; }

    row.style.display = 'flex';

    // Ajuste dinâmico do estilo baseado no botão de toggle
    if (isSubclassesExpanded) {
      row.style.flexWrap = 'wrap';
      row.style.overflowX = 'visible';
    } else {
      row.style.flexWrap = 'nowrap';
      row.style.overflowX = 'auto';
    }

    row.innerHTML = subs.map(s => `<button class="ability-sub-btn ${s === activeSubclass ? 'active' : ''}" data-sub="${s}">${s}</button>`).join('');

    row.querySelectorAll('.ability-sub-btn').forEach(b => {
      b.onclick = () => {
        overlay.querySelectorAll('.ability-sub-btn').forEach(x => x.classList.remove('active'));
        overlay.querySelector('.catalog-class-hability-pill')?.classList.remove('active');
        b.classList.add('active');
        activeClassHabilitySelected = false;
        activeSubclass = b.dataset.sub;
        renderCatalogList();
      };
    });
  }

  /* SUBSTITUA A FUNÇÃO renderCatalogList POR ESTA */
  function renderCatalogList() {
    const container = overlay.querySelector('.abilities-list-large');
    const searchInput = overlay.querySelector('#catalogAbilitySearch').value.toLowerCase();
    const searchTerms = searchInput.split(',').map(t => t.trim()).filter(t => t);

    let items = abilityCatalog.filter(it => {
      if (activeClass) {
        if (activeClassHabilitySelected) {
          if (it.class !== activeClass || (it.subclass && it.subclass !== '')) return false;
        } else if (activeSubclass) {
          if (it.class !== activeClass || it.subclass !== activeSubclass) return false;
        }
      }
      if (searchTerms.length > 0) {
        const fullText = [it.name, it.description, it.class, it.subclass, it.category].filter(Boolean).join(' ').toLowerCase();
        return searchTerms.every(term => fullText.includes(term));
      }
      return true;
    });

    if (!items.length) {
      container.innerHTML = `<div style="color:#ddd;padding:18px;">Nenhuma habilidade encontrada.</div>`;
      return;
    }

    container.innerHTML = items.map(c => formatCatalogAbilityCard(c)).join('');

    // Expandir Card do Catálogo
    container.querySelectorAll('.catalog-card-header .left').forEach(divLeft => {
      divLeft.addEventListener('click', (ev) => {
        ev.stopPropagation();
        const card = divLeft.closest('.catalog-card-ability');
        const body = card.querySelector('.catalog-card-ability-body');
        const toggle = card.querySelector('.catalog-ability-toggle');
        const isHidden = body.style.display === 'none';
        body.style.display = isHidden ? 'block' : 'none';
        toggle.textContent = isHidden ? '▾' : '▸';
      });
    });

    // Adicionar Habilidade
    container.querySelectorAll('.catalog-add-ability-btn').forEach(btn => {
      btn.onclick = (e) => {
        e.stopPropagation();
        const id = btn.dataset.id;
        const c = abilityCatalog.find(x => x.id === id);
        if (!c) return;

        const novo = {
          id: uid(),
          title: c.name,
          description: c.description || '',

          expanded: false, // ALTERADO: Começa fechado

          class: c.class || '',
          subclass: c.subclass || '',
          category: c.category || 'Geral',
          active: false
        };

        state.abilities.unshift(novo);
        renderAbilities();
        saveStateToServer();

        // --- ESTA LINHA É OBRIGATÓRIA PARA O HEADER MUDAR O NOME DA CLASSE ---
        window.dispatchEvent(new CustomEvent('sheet-updated'));

        btn.textContent = '✓';
        setTimeout(() => btn.textContent = '+', 1000);
      };
    });
  }

  overlay.querySelector('#catalogAbilitySearch').oninput = renderCatalogList;

  renderClassHabilitiesRow();
  renderSubclassesRow();
  renderCatalogList();
}



/* =============================================================
   CÁLCULO DA CLASSE DE ARMADURA (CA) - LÓGICA CORRIGIDA
============================================================= */

// Função auxiliar para pegar modificadores do DOM (segurança contra valores nulos)
function getAttributeMod(attrKey) {
  const selector = DOM_SELECTORS[attrKey];
  const hexEl = document.querySelector(selector);
  if (hexEl) {
    let rawVal = hexEl.dataset.attrValue || hexEl.textContent;
    const score = parseInt(rawVal, 10);
    if (!isNaN(score)) {
      return Math.floor((score - 10) / 2);
    }
  }
  return 0;
}

function calculateArmorClass() {
  // 1. Pega os Modificadores necessários
  const modDex = getAttributeMod('dex');
  const modCon = getAttributeMod('con');
  const modSab = getAttributeMod('sab');

  // 2. Verifica Inventário (Itens equipados)
  const equippedArmor = state.inventory.find(i =>
    i.equip && (i.type === 'Proteção' || i.type === 'protecao') &&
    (i.tipoItem || '').toLowerCase() === 'armadura'
  );

  const equippedShield = state.inventory.find(i =>
    i.equip && (i.type === 'Proteção' || i.type === 'protecao') &&
    (i.tipoItem || '').toLowerCase() === 'escudo'
  );

  // 3. Verifica Habilidades Ativas (Busca por texto exato ou parcial)
  const barbDefense = state.abilities.find(a => a.active && a.title.includes("[Nível 1] Defesa sem Armadura(Bárbaro)"));
  const monkDefense = state.abilities.find(a => a.active && a.title.includes("[Nível 1] Defesa sem Armadura(Monge)"));

  let ac = 10; // Base padrão (sem nada)

  // --- LÓGICA DE PRIORIDADE ---

  if (equippedArmor) {
    // CASO 1: TEM ARMADURA EQUIPADA
    // Regra: Armadura anula Defesa sem Armadura de Monge e Bárbaro

    let baseArmor = parseInt(equippedArmor.defense) || 10;
    let prof = (equippedArmor.proficiency || '').toLowerCase();

    // Cálculo base da armadura + destreza limitada
    if (prof.includes('pesada')) {
      ac = baseArmor; // Armadura pesada não usa Des
    } else if (prof.includes('media') || prof.includes('média')) {
      ac = baseArmor + Math.min(modDex, 2); // Média limita Des em +2
    } else {
      ac = baseArmor + modDex; // Leve usa Des total
    }

  } else {
    // CASO 2: SEM ARMADURA (Verifica habilidades)

    if (barbDefense) {
      // Bárbaro: 10 + Des + Con (Permite escudo)
      ac = 10 + modDex + modCon;
      // Nota: Bárbaro soma escudo normalmente no final
    }
    else if (monkDefense) {
      // Monge: 10 + Des + Sab
      // Regra: Monge perde o benefício se usar escudo
      if (equippedShield) {
        // Se tiver escudo, a habilidade "quebra" e vira CA base normal (10 + Des)
        ac = 10 + modDex;
      } else {
        ac = 10 + modDex + modSab;
      }
    }
    else {
      // Nenhuma habilidade especial: 10 + Des
      ac = 10 + modDex;
    }
  }

  // 4. Adiciona Bônus do Escudo (Se houver)
  if (equippedShield) {
    let shieldBonus = parseInt(equippedShield.defense) || 2;
    ac += shieldBonus;
  }

  // 5. Verifica itens mágicos ou outros bônus de "Defesa" que não sejam armadura/escudo
  // Ex: Anel de Proteção (+1 na CA) - Itens do tipo "Geral" com defenseBonus
  state.inventory.filter(i => i.equip && i.type === 'Geral' && i.defenseBonus).forEach(item => {
    ac += (parseInt(item.defenseBonus) || 0);
  });

  return ac;
}







/* ---------------- FORMATAR CARD DE HABILIDADE (DESIGN IGUAL MAGIA) ---------------- */
function formatCatalogAbilityCard(c) {
  return `
    <div class="catalog-card-ability card" data-id="${c.id}" data-cat="${c.category || 'Gerais'}" style="background:#1b1b1b; border:1px solid rgba(255,255,255,0.05); padding: 0; margin-bottom:8px; overflow:hidden;">
      
      <div class="catalog-card-header" style="display:flex; justify-content:space-between; align-items:center; padding:12px;">
        <div class="left" style="display:flex; gap:12px; align-items:center; cursor:pointer; flex:1;">
           <button class="catalog-ability-toggle" style="background:transparent; border:none; color:#9c27b0; font-weight:800; font-size:18px; cursor:pointer;">▸</button>
           
           <div style="display:flex; flex-direction:column;">
              <div class="catalog-card-title" style="font-weight:800; font-size:18px; color:#fff;">${c.name}</div>
              <div style="font-size:13px; color:#bbb; margin-top:4px;">${c.category || 'Geral'}</div>
           </div>
        </div>

        <div style="display:flex; align-items:center;">
           <button class="catalog-add-ability-btn plus-btn" data-id="${c.id}" title="Adicionar" style="background:#9c27b0; border:none; color:#fff; width:38px; height:38px; border-radius:6px; font-size:20px; font-weight:bold; cursor:pointer; display:flex; align-items:center; justify-content:center;">+</button>
        </div>
      </div>
      
      <div style="height:3px; background:#9c27b0; width: calc(100% - 24px); margin: 0 auto 8px auto; border-radius:2px;"></div>

      <div class="catalog-card-ability-body" style="display:none; padding: 0 12px 12px 12px; color:#ddd; font-size:14px; line-height:1.5;">
        <p style="margin:0;">${c.description || 'Sem descrição.'}</p>
      </div>
    </div>
  `;
}

/* ---------------- MODAL NOVA HABILIDADE (COM STATUS E DANO) ---------------- */
function openNewAbilityModal(existingAbility = null) {
  const modal = document.createElement('div');
  modal.className = 'spell-modal-overlay';
  modal.style.zIndex = '11000';

  const descContent = existingAbility ? existingAbility.description : '';
  const editorHTML = createRichEditorHTML(descContent, 'hab-editor-content');

  // Valores iniciais ou vazios
  const vals = {
      title: existingAbility ? existingAbility.title : '',
      damage: existingAbility ? existingAbility.damage : '',
      damageType: existingAbility ? existingAbility.damageType : '',
      attackBonus: existingAbility ? existingAbility.attackBonus : '',
      defenseBonus: existingAbility ? existingAbility.defenseBonus : '',
      speedBonus: existingAbility ? existingAbility.speedBonus : '',
      saveDC: existingAbility ? existingAbility.saveDC : '',
      category: existingAbility ? existingAbility.category : 'Geral',
      class: existingAbility ? existingAbility.class : '',
      subclass: existingAbility ? existingAbility.subclass : ''
  };

  const CATEGORIAS = ['Geral', 'Raça', 'Talento', 'Antecedente', 'Classe'];
  const typeCheckboxesHTML = CATEGORIAS.map(cat => `
      <label class="radio-box">
          <input type="radio" name="hab-type" value="${cat}" ${vals.category === cat ? 'checked' : ''}>
          <span class="radio-label">${cat}</span>
      </label>
  `).join('');

  const classDropdownStyle = vals.category === 'Classe' ? 'display:block;' : 'display:none;';
  const classOptionsHTML = CLASSES_AVAILABLE.map(c => 
    `<option value="${c}" ${vals.class === c ? 'selected' : ''}>${c}</option>`
  ).join('');

  modal.innerHTML = `
      <div class="spell-modal" style="width:760px; max-width:calc(100% - 40px);">
        <div class="modal-header">
          <h3>${existingAbility ? 'Editar Habilidade' : 'Nova Habilidade'}</h3>
          <button class="modal-close">✖</button>
        </div>

        <div class="modal-body">
          <div>
              <label>Nome da Habilidade <span style="color:#ff5555">*</span></label>
              <input id="hab-name" type="text" value="${escapeHtml(vals.title)}" placeholder="Ex: Fúria, Ataque Furtivo..." />
          </div>

          <div style="display:grid; grid-template-columns: 1fr 1fr 1fr; gap:10px; margin-top:5px; background:#151515; padding:10px; border-radius:6px; border:1px solid rgba(255,255,255,0.05);">
              <div>
                  <label>Dano / Cura</label>
                  <input id="hab-damage" type="text" value="${escapeHtml(vals.damage)}" placeholder="Ex: 2d6" />
              </div>
              <div>
                  <label>Tipo de Dano</label>
                  <input id="hab-dmg-type" type="text" value="${escapeHtml(vals.damageType)}" placeholder="Ex: Fogo" />
              </div>
              <div>
                  <label>Bônus de Ataque</label>
                  <input id="hab-attack" type="text" value="${escapeHtml(vals.attackBonus)}" placeholder="Ex: +5" />
              </div>
              <div>
                  <label>Bônus de CA</label>
                  <input id="hab-defense" type="text" value="${escapeHtml(vals.defenseBonus)}" placeholder="Ex: +1" />
              </div>
              <div>
                  <label>Deslocamento</label>
                  <input id="hab-speed" type="text" value="${escapeHtml(vals.speedBonus)}" placeholder="Ex: +3m" />
              </div>
              <div>
                  <label>CD (Salva)</label>
                  <input id="hab-dc" type="text" value="${escapeHtml(vals.saveDC)}" placeholder="Ex: Con 15" />
              </div>
          </div>

          <div style="margin-top:10px;">
              <label style="margin-bottom:8px;">Tipo de Habilidade</label>
              <div class="radio-group-container">
                  ${typeCheckboxesHTML}
              </div>
          </div>

          <div id="hab-class-selector" style="${classDropdownStyle} margin-top:12px; background:#151515; padding:10px; border-radius:6px; border:1px solid rgba(255,255,255,0.05);">
              <div style="display:flex; gap:12px;">
                  <div style="flex:1;">
                      <label>Classe</label>
                      <select id="hab-class-select" class="dark-select">
                          <option value="">Selecione...</option>
                          ${classOptionsHTML}
                      </select>
                  </div>
                  <div style="flex:1;">
                      <label>Subclasse (Opcional)</label>
                      <input id="hab-subclass-input" type="text" value="${escapeHtml(vals.subclass)}" placeholder="Ex: Berserker..." />
                  </div>
              </div>
          </div>

          <div style="margin-top:15px;">
              <label>Descrição</label>
              ${editorHTML}
          </div>
        </div>

        <div class="modal-actions">
          <button class="btn-add btn-save-hab">${existingAbility ? 'Salvar' : 'Adicionar'}</button>
          <button class="btn-add btn-cancel-hab">Cancelar</button>
        </div>
      </div>
    `;

  document.body.appendChild(modal);
  checkScrollLock();
  initRichEditorEvents('hab-editor-content');

  if (!existingAbility) document.getElementById('hab-name').focus();

  // Eventos de Categoria
  const radios = modal.querySelectorAll('input[name="hab-type"]');
  const classSelectorDiv = modal.querySelector('#hab-class-selector');
  radios.forEach(radio => {
    radio.addEventListener('change', (e) => {
      if (e.target.value === 'Classe') {
        classSelectorDiv.style.display = 'block';
      } else {
        classSelectorDiv.style.display = 'none';
        modal.querySelector('#hab-class-select').value = "";
        modal.querySelector('#hab-subclass-input').value = "";
      }
    });
  });

  const closeAll = () => { modal.remove(); checkScrollLock(); };
  modal.querySelector('.modal-close').addEventListener('click', closeAll);
  modal.querySelector('.btn-cancel-hab').addEventListener('click', (ev) => { ev.preventDefault(); closeAll(); });

  // SALVAR
  modal.querySelector('.btn-save-hab').addEventListener('click', (ev) => {
    ev.preventDefault();
    const nome = modal.querySelector('#hab-name').value.trim();
    if (!nome) {
      alert("O nome da habilidade é obrigatório!");
      return;
    }

    const desc = document.getElementById('hab-editor-content').innerHTML;
    const selectedCategory = modal.querySelector('input[name="hab-type"]:checked')?.value || 'Geral';
    
    let finalClass = "";
    let finalSubclass = "";
    if (selectedCategory === 'Classe') {
      finalClass = modal.querySelector('#hab-class-select').value;
      finalSubclass = modal.querySelector('#hab-subclass-input').value.trim();
    } else if (selectedCategory === 'Antecedente') {
      finalClass = 'Antecedente';
    }

    // Objeto base
    const abilityData = {
        title: nome,
        description: desc,
        category: selectedCategory,
        class: finalClass,
        subclass: finalSubclass,
        // Novos Campos
        damage: modal.querySelector('#hab-damage').value.trim(),
        damageType: modal.querySelector('#hab-dmg-type').value.trim(),
        attackBonus: modal.querySelector('#hab-attack').value.trim(),
        defenseBonus: modal.querySelector('#hab-defense').value.trim(),
        speedBonus: modal.querySelector('#hab-speed').value.trim(),
        saveDC: modal.querySelector('#hab-dc').value.trim()
    };

    if (existingAbility) {
      state.abilities = state.abilities.map(h => h.id === existingAbility.id ? { ...h, ...abilityData } : h);
    } else {
      state.abilities.unshift({
        id: uid(),
        ...abilityData,
        expanded: false,
        active: false
      });
    }

    closeAll();
    renderAbilities();
    saveStateToServer();
    window.dispatchEvent(new CustomEvent('sheet-updated'));
  });
}
/* ---------------- DESCRIÇÃO ---------------- */
/* =============================================================
   CORREÇÃO 1: renderDescription com "Debounce"
   (Evita salvar e recarregar a tela a cada letra)
============================================================= */

let descSaveTimer = null; // Variável para controlar o tempo de salvamento

function renderDescription() {
  const d = state.description;

  // HTML (sem botão salvar, fundo escuro controlado pelo CSS acima)
  conteudoEl.innerHTML = `
    <div class="desc-grid">
      <div>
        <label>Anotações</label>
        <textarea id="desc-anotacoes" placeholder="Anotações pessoais do agente...">${d.anotacoes}</textarea>
      </div>
      <div>
        <label>Aparência</label>
        <textarea id="desc-aparencia" placeholder="Nome, gênero, idade, descrição física...">${d.aparencia}</textarea>
      </div>
      <div>
        <label>Personalidade</label>
        <textarea id="desc-personalidade" placeholder="Traços marcantes, opiniões, ideais...">${d.personalidade}</textarea>
      </div>
      <div>
        
      </div>
      <div>
        <label>Ideais</label>
        <textarea id="desc-ideais" placeholder="Ideais...">${d.ideais}</textarea>
      </div>
      <div>
        <label>Vínculos</label>
        <textarea id="desc-vinculos" placeholder="Vínculos...">${d.vinculos}</textarea>
      </div>
      <div>
        <label>Fraquezas</label>
        <textarea id="desc-fraquezas" placeholder="Fraquezas...">${d.fraquezas}</textarea>
      </div>
      <div>
        <label>História</label>
        <textarea id="desc-historia" placeholder="História...">${d.historia}</textarea>
      </div>
    </div>
  `;

  // Lógica de Auto-Resize e Auto-Save INTELIGENTE
  const textareas = conteudoEl.querySelectorAll('textarea');

  textareas.forEach(tx => {
    // Função que ajusta altura baseada no conteúdo
    const autoResize = () => {
      tx.style.height = 'auto';
      tx.style.height = (tx.scrollHeight + 2) + 'px';
    };

    // Ajusta tamanho inicial ao carregar a aba
    autoResize();

    // Evento ao digitar
    tx.addEventListener('input', () => {
      autoResize();

      // 1. Atualiza o estado LOCAL imediatamente (visual)
      const key = tx.id.replace('desc-', '');
      if (state.description.hasOwnProperty(key)) {
        state.description[key] = tx.value;
        
        // 2. CORREÇÃO: Limpa o timer anterior se você ainda estiver digitando
        if (descSaveTimer) clearTimeout(descSaveTimer);

        // 3. Só salva no servidor se você parar de digitar por 1 segundo (1000ms)
        descSaveTimer = setTimeout(() => {
            saveStateToServer();
        }, 1000);
      }
    });
  });
}

/* --- ATUALIZADO: RENDERIZA GRUPO DE ITENS (COM LÓGICA DE FECHADO POR PADRÃO) --- */
function renderItemGroup(titulo, listaItens, chaveUnica, forceExpand = false) {
  if (!listaItens || listaItens.length === 0) return '';

  if (!state.collapsedSections) state.collapsedSections = {};

  // Lógica: 
  // Se forceExpand (busca ativa) -> Não colapsado (false)
  // Se não tem state salvo -> Colapsado (true) por padrão (antes era false)
  // Se tem state salvo -> Usa o state
  let isCollapsed;

  if (forceExpand) {
    isCollapsed = false;
  } else {
    // Se undefined, assume TRUE (fechado por padrão). Se definido, usa o valor.
    isCollapsed = state.collapsedSections[chaveUnica] !== undefined ? state.collapsedSections[chaveUnica] : true;
  }

  const arrow = isCollapsed ? '▸' : '▾';
  const displayStyle = isCollapsed ? 'display:none;' : '';

  const cardsHtml = listaItens.map(item => formatInventoryItem(item)).join('');

  return `
        <div class="inv-section-group" style="margin-bottom:12px;">
            <div class="toggle-inv-header" data-key="${chaveUnica}" style="cursor:pointer; display:flex; align-items:center; background:rgba(255,255,255,0.03); padding:8px; border-radius:4px; margin-bottom:5px; border: 1px solid rgba(255,255,255,0.05);">
                <span style="font-size:14px; color:#9c27b0; width:15px;">${arrow}</span> 
                <span style="font-weight:700; font-size:12px; color:#ccc; text-transform:uppercase;">${titulo}</span>
                <span style="margin-left:auto; font-size:10px; color:#666; background:#111; padding:2px 6px; border-radius:4px;">${listaItens.length}</span>
            </div>
            <div class="inv-section-content" style="${displayStyle}">
                ${cardsHtml}
            </div>
        </div>
    `;
}

/* --- ATUALIZADO: RENDERIZA GRUPO DE HABILIDADES (COM DANO E STATUS) --- */
function renderAbilitySection(titulo, listaCards, chaveUnica, forceExpand = false) {
  if (!state.collapsedSections) state.collapsedSections = {};

  let isCollapsed;
  if (forceExpand) {
    isCollapsed = false;
  } else {
    isCollapsed = state.collapsedSections[chaveUnica] !== undefined ? state.collapsedSections[chaveUnica] : true;
  }

  const arrow = isCollapsed ? '▸' : '▾';
  const displayStyle = isCollapsed ? 'display:none;' : '';

  const cardsHtml = listaCards.map(a => {
    // --- LÓGICA DE DANO NO HEADER ---
    let rightHeaderHtml = '';
    if (a.damage && a.damage !== '-' && a.damage.trim() !== '') {
        rightHeaderHtml = `
            <div class="card-meta spell-damage" style="display: flex; align-items: center; gap: 6px; margin-right: 10px;">
                <span style="font-weight: 800; color: #9c27b0; font-size: 16px;">${a.damage}</span>
                <img class="dice-img" src="img/imagem-no-site/dado.png" alt="dado" style="width: 20px; height: 20px; cursor:pointer;" title="Rolar Dano" />
            </div>
        `;
    }

    // --- LÓGICA DE DETALHES NO CORPO ---
    let statsHtml = '';
    const parts = [];

    if (a.attackBonus) parts.push(`<span class="purple">Ataque:</span> <span class="white-val">${a.attackBonus}</span>`);
    if (a.defenseBonus) parts.push(`<span class="purple">CA/Defesa:</span> <span class="white-val">${a.defenseBonus}</span>`);
    if (a.speedBonus) parts.push(`<span class="purple">Deslocamento:</span> <span class="white-val">${a.speedBonus}</span>`);
    if (a.damageType) parts.push(`<span class="purple">Tipo:</span> <span class="white-val">${a.damageType}</span>`);
    
    // Se tiver CD/DT (Dificuldade)
    if (a.saveDC) parts.push(`<span class="purple">CD:</span> <span class="white-val">${a.saveDC}</span>`);

    if (parts.length > 0) {
        statsHtml = `
            <div style="margin-bottom: 8px; padding-bottom: 8px; border-bottom: 1px solid rgba(255,255,255,0.05); font-size: 13px; display: flex; flex-wrap: wrap; gap: 12px;">
                ${parts.join('<span class="separator"></span>')}
            </div>
        `;
    }

    return `
        <div class="card hab-card ${a.expanded ? 'expanded' : ''}" data-id="${a.id}">
          <div class="card-header" style="padding: 10px;">
            <div class="left" data-id="${a.id}" style="flex: 1; min-width: 0; margin-right: 5px;">
              <span class="caret">${a.expanded ? '▾' : '▸'}</span>
              <div class="card-title">${a.title}</div>
            </div>
            
            <div class="right" style="display: flex; align-items: center;">
               ${rightHeaderHtml}
               <label class="check-ativar" title="Preparar/Ativar Habilidade">
                  <input class="hab-activate" type="checkbox" data-id="${a.id}" ${a.active ? 'checked' : ''}/>
                  <span class="square-check"></span>
               </label>
            </div>
          </div>

          <div class="card-body" style="${a.expanded ? '' : 'display:none;'}">
            ${statsHtml}
            <div class="hab-desc-text">${a.description || 'Sem descrição.'}</div>
            
            <div style="margin-top:12px; padding-top:8px; border-top:1px solid rgba(255,255,255,0.05); display:flex; justify-content:space-between;">
              <a href="#" class="remover-hab" data-id="${a.id}">Remover</a>
              <a href="#" class="editar-hab" data-id="${a.id}" style="color:#2e7d32">Editar</a>
            </div>
          </div>
        </div>
    `;
  }).join('');

  return `
        <div class="hab-section-group" style="margin-bottom:12px;">
            <div class="toggle-section-header" data-key="${chaveUnica}" style="cursor:pointer; display:flex; align-items:center; background:rgba(255,255,255,0.03); padding:8px; border-radius:4px; margin-bottom:5px; border: 1px solid rgba(255,255,255,0.05);">
                <span style="font-size:14px; color:#9c27b0; width:15px;">${arrow}</span> 
                <span style="font-weight:700; font-size:12px; color:#ccc; text-transform:uppercase;">${titulo}</span>
                <span style="margin-left:auto; font-size:10px; color:#666; background:#111; padding:2px 6px; border-radius:4px;">${listaCards.length}</span>
            </div>
            <div class="section-content" style="${displayStyle}">
                ${cardsHtml}
            </div>
        </div>
    `;
}

function renderActiveTab() {
  switch (state.activeTab) {
    case 'Combate': renderCombat(); break;
    case 'Mag. Preparadas': renderPreparedSpells(); break; // <--- NOVA LINHA
    case 'Habilidades': renderAbilities(); break;
    case 'Magias': renderSpells(); break;
    case 'Inventário': renderInventory(); break;
    case 'Descrição': renderDescription(); break;
    default: conteudoEl.innerHTML = '<p>Conteúdo não definido.</p>';
  }
}

function initAbas() {
  document.querySelectorAll('.lado-direito .abas button').forEach(b => {
    b.addEventListener('click', (ev) => setActiveTab(ev.target.textContent.trim()));
  });
  renderActiveTab();
}

/* =============================================================
   INICIALIZAÇÃO (FINAL DO ARQUIVO DIREITA.JS)
============================================================= */

document.addEventListener('DOMContentLoaded', () => {
  // 1. Inicializa os listeners das abas
  initAbas();

  // 2. Força uma renderização inicial se já tivermos dados
  if (state && state.niveisClasses) {
    renderActiveTab();
  }
});
function escapeHtml(str) {
  if (str === 0) return '0';
  if (!str) return '';
  return String(str).replaceAll('&', '&amp;').replaceAll('<', '&lt;').replaceAll('>', '&gt;').replaceAll('"', '&quot;').replaceAll("'", '&#39;');
}


/* ---------------- POPUP DE SELEÇÃO DE CLASSE (CORRIGIDO + BOTÃO X) ---------------- */
function abrirPopupSelecaoClasse(classes, callback) {
  // 1. Cria o Overlay (Fundo Escuro)
  const overlay = document.createElement('div');
  overlay.className = 'class-selection-overlay';
  overlay.style = `
        position: fixed; inset: 0; background: rgba(0,0,0,0.85); 
        display: flex; align-items: center; justify-content: center; 
        z-index: 20000; font-family: sans-serif;
    `;

  // 2. Cria a Caixa de Conteúdo
  const content = document.createElement('div');
  content.style = `
        background: #1a1a1a; padding: 25px; border-radius: 8px; 
        border: 2px solid #9c27b0; text-align: center; width: 300px;
        box-shadow: 0 0 20px rgba(156,39,176,0.4);
        position: relative; /* Necessário para posicionar o X */
    `;

  // 3. HTML Interno (Com o botão de fechar X)
  content.innerHTML = `
        <button id="btn-close-popup" title="Fechar" style="
            position: absolute; top: 8px; right: 10px;
            background: transparent; border: none; color: #888;
            font-size: 18px; font-weight: bold; cursor: pointer;
            transition: color 0.2s;
        ">✖</button>

        <h4 style="color: #fff; margin-bottom: 15px; margin-top: 5px;">Escolha a Classe</h4>
        <p style="color: #bbb; font-size: 13px; margin-bottom: 20px;">Esta magia pertence a múltiplas classes. Qual você deseja usar?</p>
        <div id="class-buttons-container" style="display: flex; flex-direction: column; gap: 10px;"></div>
    `;

  overlay.appendChild(content);
  document.body.appendChild(overlay);

  // 4. Lógica para fechar o Popup (Remove do DOM)
  const fecharPopup = () => {
    if (overlay && overlay.parentElement) {
      overlay.remove();
    }
  };

  // Ação do Botão X
  const btnClose = content.querySelector('#btn-close-popup');
  btnClose.onmouseover = () => btnClose.style.color = '#fff';
  btnClose.onmouseout = () => btnClose.style.color = '#888';
  btnClose.onclick = fecharPopup;

  // Também fecha se clicar fora da caixa (no fundo escuro) - Opcional, melhora usabilidade
  overlay.onclick = (e) => {
    if (e.target === overlay) fecharPopup();
  };

  // 5. Gera os botões das Classes
  const container = content.querySelector('#class-buttons-container');

  classes.forEach(cls => {
    const btn = document.createElement('button');
    btn.textContent = cls;
    btn.style = `
            background: #222; color: #fff; border: 1px solid #444; 
            padding: 10px; border-radius: 4px; cursor: pointer; 
            font-weight: bold; transition: 0.2s;
        `;

    btn.onmouseover = () => btn.style.borderColor = '#9c27b0';
    btn.onmouseout = () => btn.style.borderColor = '#444';

    btn.onclick = () => {
      // Executa a ação de adicionar a magia
      try {
        callback(cls);
      } catch (error) {
        console.error("Erro ao adicionar magia:", error);
      }
      // Fecha o popup DEPOIS de tentar adicionar (mesmo se der erro no callback, ele fecha)
      fecharPopup();
    };
    container.appendChild(btn);
  });
}
/* =============================================================
   OBSERVADORES: Atualiza a DT assim que a Esquerda muda
   (ATUALIZADO COM TODOS OS ATRIBUTOS)
============================================================= */
/* =============================================================
   OBSERVADORES: Atualiza a DT assim que a Esquerda muda
   (ATUALIZADO COM TODOS OS ATRIBUTOS E AMBOS OS INPUTS)
============================================================= */
document.addEventListener("DOMContentLoaded", () => {

  const atualizarDTVisual = () => {
    // 1. Recalcula o valor
    state.dtMagias = calculateSpellDC();

    // 2. Atualiza input da aba "Magias"
    const inputMain = document.getElementById('dtMagiasInput');
    if (inputMain) inputMain.value = state.dtMagias;

    // 3. Atualiza input da aba "Mag. Preparadas"
    const inputPrep = document.getElementById('dtMagiasInput_Prep');
    if (inputPrep) inputPrep.value = state.dtMagias;
  };

  // 1. Observa mudança na Proficiência
  const profEl = document.getElementById("proficienciaValor");
  if (profEl) {
    new MutationObserver(atualizarDTVisual).observe(profEl, {
      characterData: true, childList: true, subtree: true
    });
  }

  // 2. Observa mudança em TODAS as bolinhas dos atributos
  const targets = [
    document.querySelector('.hexagrama .n1'), // CON
    document.querySelector('.hexagrama .n2'), // DEX
    document.querySelector('.hexagrama .n3'), // SAB
    document.querySelector('.hexagrama .n4'), // CAR
    document.querySelector('.hexagrama .n5'), // INT
    document.querySelector('.hexagrama .n6')  // FOR
  ];

  const hexObserver = new MutationObserver(atualizarDTVisual);
  targets.forEach(el => {
    if (el) {
      hexObserver.observe(el, {
        attributes: true, childList: true, characterData: true
      });
    }
  });

  // 3. Inicializa listeners das abas
  initAbas();

  // 4. Inicializa estado se houver login
  if (state && state.niveisClasses) {
    renderActiveTab();
  }

  // 5. Atualiza DT ao carregar e ao ganhar foco
  setTimeout(atualizarDTVisual, 500);
  window.addEventListener("focus", atualizarDTVisual);
  window.addEventListener('sheet-updated', atualizarDTVisual);
});

// Função auxiliar para aplicar o comportamento do Enter
function aplicarEnterNosInputs(container) {
  const inputs = container.querySelectorAll('input, select');
  inputs.forEach(el => {
    el.addEventListener('keydown', (e) => {
      if (e.key === 'Enter') {
        e.preventDefault();
        el.blur(); // Tira o foco, disparando eventos de salvar/fechar teclado
      }
    });
  });
}


/* ---------------- FUNÇÕES DO EDITOR DE TEXTO RICO ---------------- */

// Função para gerar o HTML do editor
/* ---------------- FUNÇÃO DO EDITOR DE TEXTO RICO (COM PLACEHOLDER) ---------------- */
function createRichEditorHTML(content, idContainer) {
  // Se content for exatamente o texto padrão antigo, limpa para mostrar o placeholder
  if (content === 'Minha nova habilidade' || content === 'Sem descrição.') content = '';

  return `
      <div class="rich-editor-wrapper" id="${idContainer}-wrapper">
        <div class="rich-toolbar">
          <button type="button" class="rich-btn" data-cmd="bold" title="Negrito (Roxo)">B</button>
          <button type="button" class="rich-btn" data-cmd="italic" title="Itálico">I</button>
          <button type="button" class="rich-btn" data-cmd="underline" title="Sublinhado">U</button>
          <div style="width:1px; background:#444; margin:0 4px;"></div>
          <button type="button" class="rich-btn" data-cmd="insertUnorderedList" title="Lista">≣</button>
        </div>
        <div class="rich-content" id="${idContainer}" contenteditable="true" placeholder="Digite a descrição ou detalhes aqui...">${content}</div>
      </div>
    `;
}

// Função para ativar os botões do editor
function initRichEditorEvents(idContainer) {
  const wrapper = document.getElementById(idContainer + '-wrapper');
  if (!wrapper) return;

  const btns = wrapper.querySelectorAll('.rich-btn');
  btns.forEach(btn => {
    btn.addEventListener('click', (e) => {
      e.preventDefault();
      e.stopPropagation();
      const cmd = btn.getAttribute('data-cmd');
      document.execCommand(cmd, false, null);
      // Mantém o foco na área de edição
      document.getElementById(idContainer).focus();
    });
  });
}

/* ==========================================================================
   SISTEMA DE DADOS V5 (FINAL: BRILHO VERMELHO NA FALHA APENAS NO ACERTO)
   ========================================================================== */

/* =============================================================
   CORREÇÃO: CSS E FUNÇÃO DE RESULTADOS DE DADOS
   Substitua os blocos correspondentes no seu arquivo DireitaJS.js
============================================================= */

/* 1. CSS ATUALIZADO DA JANELA DE RESULTADOS (Com Inspiração na Esquerda e sem GIF) */
const diceStyles = document.createElement('style');
diceStyles.textContent = `
    #dice-results-container {
        position: fixed; bottom: 20px; right: -350px; /* Largura um pouco maior */
        min-width: 280px; max-width: 400px;
        
        background: #0f0f0f; border: 1px solid #9c27b0; border-radius: 8px;
        /* padding removido daqui, aplicado nos filhos */
        box-shadow: 0 5px 20px rgba(0, 0, 0, 0.9);
        color: #fff; z-index: 15000; transition: right 0.3s cubic-bezier(0.18, 0.89, 0.32, 1.28); 
        font-family: 'Segoe UI', sans-serif;

        display: flex; /* Para alinhar lado a lado */
        flex-direction: row; /* Inspiração na esquerda, conteúdo na direita */
        overflow: hidden; /* Para as bordas arredondadas da mancha */
    }
    #dice-results-container.active { right: 20px; }

    /* Container para a Inspiração (Esquerda) */
    .inspiration-container {
        width: 70px; /* Largura fixa para o ícone */
        flex-shrink: 0; /* Não encolhe */
        
        /* Fundo "Mancha preta, meio transparente" */
        background-color: rgba(0, 0, 0, 0.5);
        /* Opcional: gradiente sutil para efeito de mancha */
        background-image: radial-gradient(circle at center, rgba(0,0,0,0.7) 0%, rgba(0,0,0,0.4) 70%, transparent 100%);
        
        border-right: 1px solid rgba(156, 39, 176, 0.5); /* Separador à direita */
        
        display: flex;
        align-items: center;
        justify-content: center;
    }

    /* Ícone de Inspiração (Estático, Dourado) */
    .inspiration-icon {
        font-size: 36px; /* Tamanho do ícone */
        color: #FFD700; /* Dourado */
        text-shadow: 0 0 15px rgba(255, 215, 0, 0.8), 0 0 5px #fff;
        cursor: help;
    }

    /* Container para o Conteúdo Principal (Direita) */
    .dice-content-wrapper {
        flex-grow: 1; /* Ocupa o espaço restante */
        padding: 15px; /* Padding interno */
        display: flex;
        flex-direction: column;
        justify-content: center;
    }
    
    .dice-header {
        font-size: 12px; color: #e1bee7; margin-bottom: 10px;
        font-weight: 700; text-transform: uppercase; letter-spacing: 1px;
        border-bottom: 1px solid #333; padding-bottom: 5px;
    }
    
    .dice-row {
        display: flex; justify-content: space-between; align-items: center;
        margin-bottom: 8px; padding: 4px 0;
        position: relative;
    }
    
    .dice-label { font-size: 13px; color: #bbb; font-weight: 600; }
    
    .dice-value-wrapper {
        position: relative;
        text-align: right;
    }
    
    .dice-value { 
        font-size: 24px; font-weight: 800; color: #fff; 
        cursor: help; 
    }
    
    /* TOOLTIP HTML */
    .dice-tooltip {
        visibility: hidden; opacity: 0;
        position: absolute; bottom: 100%; right: 0;
        background: #2a1a35; border: 1px solid #9c27b0; 
        padding: 8px 12px; border-radius: 6px;
        font-size: 14px; font-weight: 500; white-space: nowrap; 
        z-index: 100; box-shadow: 0 4px 10px rgba(0,0,0,0.8); color: #ddd;
        margin-bottom: 5px; transition: opacity 0.2s;
        pointer-events: none;
    }
    
    .dice-value-wrapper:hover .dice-tooltip {
        visibility: visible; opacity: 1;
    }

    /* --- ESTILOS DE DESTAQUE --- */
    .dice-roll-max { color: #e040fb !important; font-weight: bold; text-shadow: 0 0 5px #e040fb; } 
    .dice-roll-min { color: #ff3333 !important; font-weight: bold; text-shadow: 0 0 5px #ff3333; }
    
    .crit-total { 
        color: #e040fb !important; 
        text-shadow: 0 0 10px rgba(224, 64, 251, 0.8), 0 0 20px rgba(224, 64, 251, 0.4);
    }

    .fumble-total {
        color: #ff3333 !important;
        text-shadow: 0 0 10px rgba(255, 51, 51, 0.8), 0 0 20px rgba(255, 51, 51, 0.4);
    }
`;
document.head.appendChild(diceStyles);


/* =============================================================
   ATUALIZAÇÃO: showCombatResults com suporte a Remoto
============================================================= */
/* =============================================================
   ATUALIZAÇÃO: showCombatResults (Com botão X e mais tempo)
============================================================= */
let diceTimer = null;

// CSS para o botão X (Adicione isso se não quiser poluir o arquivo CSS)
const closeBtnStyle = document.createElement('style');
closeBtnStyle.textContent = `
    .dice-close {
        position: absolute;
        top: 5px;
        right: 8px;
        font-size: 16px;
        color: #777;
        cursor: pointer;
        z-index: 10;
        line-height: 1;
        transition: color 0.2s;
    }
    .dice-close:hover {
        color: #fff;
    }
    /* Ajuste para o conteúdo não ficar por cima do X */
    .dice-content-wrapper {
        padding-right: 25px !important; 
    }
`;
document.head.appendChild(closeBtnStyle);


/* =============================================================
   ATUALIZAÇÃO: showCombatResults (ACEITA LABELS PERSONALIZADOS)
============================================================= */
function showCombatResults(title, attackResult, damageResult, isRemote = false) {

  // 1. Criação/Busca do Container Visual
  let container = document.getElementById('dice-results-container');
  if (!container) {
    container = document.createElement('div');
    container.id = 'dice-results-container';
    document.body.appendChild(container);
  }

  // 2. Limpa timer anterior se houver
  if (diceTimer) clearTimeout(diceTimer);

  // --- MONTAGEM DO HTML ---
  let contentHtml = `
      <div class="dice-close" onclick="fecharDiceResult()">✖</div>
      <div class="dice-content-wrapper">
  `;
  
  contentHtml += `<div class="dice-header">${title}</div>`;

  if (attackResult) {
    let totalClass = "";
    if (attackResult.isCrit) totalClass = "crit-total";
    else if (attackResult.isFumble) totalClass = "fumble-total";

    // AQUI ESTÁ A MUDANÇA: Usa attackResult.label ou o padrão "ACERTO"
    const labelTexto = attackResult.label || "ACERTO";

    contentHtml += `
            <div class="dice-row">
                <div class="dice-label">${labelTexto}</div>
                <div class="dice-value-wrapper">
                    <div class="dice-value ${totalClass}">${attackResult.text}</div>
                    <div class="dice-tooltip">${attackResult.detail || ''}</div>
                </div>
            </div>
        `;
  }

  if (damageResult) {
    let totalClass = damageResult.isCrit ? "crit-total" : "";
    
    // AQUI ESTÁ A MUDANÇA: Usa damageResult.label ou o padrão "DANO"
    const labelTexto = damageResult.label || "DANO";

    contentHtml += `
            <div class="dice-row">
                <div class="dice-label">${labelTexto}</div>
                <div class="dice-value-wrapper">
                    <div class="dice-value ${totalClass}">${damageResult.text}</div>
                    <div class="dice-tooltip">${damageResult.detail || ''}</div>
                </div>
            </div>
        `;
  }
  contentHtml += `</div>`; // Fecha wrapper

  // --- HTML INSPIRAÇÃO ---
  let inspirationHtml = '';
  const isInspirado = isRemote ? (attackResult?.inspiracao || damageResult?.inspiracao) : (typeof state !== 'undefined' && state.inspiration);

  if (isInspirado) {
    inspirationHtml = `
            <div class="inspiration-container">
                <div class="inspiration-icon" title="Personagem Inspirado!">⭐</div>
            </div>
        `;
  }

  container.innerHTML = inspirationHtml + contentHtml;

  // Mostra o container
  requestAnimationFrame(() => { container.classList.add('active'); });

  // --- TEMPO DE DURAÇÃO (15 Segundos) ---
  diceTimer = setTimeout(() => { 
      container.classList.remove('active'); 
  }, 15000);

  // --- LÓGICA DE SOCKET ---
  if (!isRemote && typeof socket !== 'undefined') {
    const payload = {
      socketId: socket.id,
      personagem: state.nome || "Desconhecido",
      titulo: title,
      ataque: null,
      dano: null,
      inspiracao: state.inspiration || false
    };

    if (attackResult) {
      payload.ataque = {
        total: attackResult.total,
        text: attackResult.text,
        detail: attackResult.detail,
        isCrit: attackResult.isCrit,
        isFumble: attackResult.isFumble,
        label: attackResult.label, // Envia o label customizado
        inspiracao: state.inspiration
      };
    }

    if (damageResult) {
      payload.dano = {
        total: damageResult.total,
        text: damageResult.text,
        detail: damageResult.detail,
        isCrit: damageResult.isCrit,
        label: damageResult.label, // Envia o label customizado
        inspiracao: state.inspiration
      };
    }

    socket.emit('dados_rolados', payload);
  }
}

// Função global para fechar manualmente
window.fecharDiceResult = function() {
    const container = document.getElementById('dice-results-container');
    if (container) {
        container.classList.remove('active');
        if (diceTimer) clearTimeout(diceTimer); // Cancela o timer para não tentar fechar de novo depois
    }
};

/* 2. FUNÇÕES DE CÁLCULO E EXIBIÇÃO */

// Usada principalmente para rolar DANO
function rollDiceExpression(expression) {
  const cleanExpr = expression.toLowerCase().trim();
  const regex = /^(\d*)d(\d+)\s*([+-]?\s*\d+)?$/i;
  const match = cleanExpr.match(regex);
  let total = 0, parts = [], modifier = 0;
  let isMaxRoll = false;

  if (match) {
    const count = match[1] === "" ? 1 : parseInt(match[1]) || 1;
    const sides = parseInt(match[2]);
    const modStr = match[3];

    for (let i = 0; i < count; i++) {
      const roll = Math.floor(Math.random() * sides) + 1;
      total += roll;

      // Destaque apenas para CRÍTICO no dano (Roxo)
      // Removemos o destaque vermelho para o número 1 no dano conforme solicitado
      if (roll === sides) {
        isMaxRoll = true;
        parts.push(`<span class="dice-roll-max">${roll}</span>`);
      } else {
        parts.push(roll); // 1 agora fica normal no dano
      }
    }

    if (modStr) {
      modifier = parseInt(modStr.replace(/\s/g, ''));
      total += modifier;
      if (modifier !== 0) parts.push(`${modifier >= 0 ? '+' : ''}${modifier}`);
    }
  } else {
    const num = parseInt(cleanExpr);
    if (!isNaN(num)) { total = num; parts.push(num); }
    else return { total: 0, text: "Erro", detail: "Erro" };
  }

  let detailText = parts.join(' + ').replace(/\+ \+/g, '+ ').replace(/\+ -/g, '- ');

  return {
    total: total,
    text: total.toString(),
    detail: detailText,
    isCrit: isMaxRoll,
    isFumble: false // Dano nunca gera falha crítica visual no total
  };
}



/* 3. AUXILIARES */
function getAttributeMod(attrKey) {
  const sel = DOM_SELECTORS[attrKey]; if (!sel) return 0;
  const el = document.querySelector(sel); if (!el) return 0;
  const val = parseInt(el.dataset.attrValue || el.textContent);
  return isNaN(val) ? 0 : Math.floor((val - 10) / 2);
}

function getItemAttackValues(item) {
  let modAttr = 0;
  let attrName = item.attackAttribute;

  if (!attrName || attrName === 'Nenhum' || attrName === '') {
    const tipo = (item.tipoArma || '').toLowerCase();
    attrName = (tipo.includes('distancia') || tipo.includes('distância')) ? 'Destreza' : 'Força';
  }

  const attrMap = { 'Força': 'for', 'Destreza': 'dex', 'Constituição': 'con', 'Inteligência': 'int', 'Sabedoria': 'sab', 'Carisma': 'car' };
  const key = attrMap[attrName];
  if (key) modAttr = getAttributeMod(key);

  let profBonus = 0;
  if (item.proficiency && item.proficiency !== 'Nenhuma') {
    const profEl = document.getElementById('proficienciaValor');
    if (profEl) profBonus = parseInt(profEl.textContent) || 2;
  }
  const itemBonus = parseInt(item.attackBonus) || 0;
  return { modAttr, profBonus, itemBonus };
}

function getSpellAttackValues() {
  let prof = 2; const pe = document.getElementById('proficienciaValor'); if (pe) prof = parseInt(pe.textContent) || 2;
  const key = state.spellDCConfig.selectedAttr; if (!key || key === 'none') return null;
  let mod = getAttributeMod(key);
  const extra = parseInt(state.spellDCConfig.extraMod) || 0;
  return { prof, mod, extra };
}

/* 4. ESCUTADOR GLOBAL DE CLIQUES (ATUALIZADO COM HABILIDADES) */
document.addEventListener('click', function(e) {
    
    // =================================================================
    // CASO 1: CLIQUE NO ÍCONE DE DADO (IMAGEM)
    // =================================================================
    if (e.target.classList.contains('dice-img')) {
        e.preventDefault(); 
        e.stopPropagation();

        // -------------------------------------------------------------
        // A. VERIFICA SE É MAGIA (SPELL CARD)
        // -------------------------------------------------------------
        const spellCard = e.target.closest('.spell-card');
        if (spellCard) {
            const spellTitle = spellCard.querySelector('.spell-title')?.textContent || "Magia";
            
            // 1. CONSUMO DE SLOT (SE HOUVER SELETOR)
            const selectSlot = spellCard.querySelector('.spell-slot-selector');
            if (selectSlot) {
                const levelToCast = selectSlot.value; 
                
                if (!state.spellSlots[levelToCast]) {
                    alert(`Erro: Slot nível ${levelToCast} não configurado.`); return; 
                }

                const slotData = state.spellSlots[levelToCast];
                const max = parseInt(slotData.max) || 0;
                
                if (!Array.isArray(slotData.status)) slotData.status = [];
                while (slotData.status.length < max) slotData.status.push(false);

                const firstAvailableIndex = slotData.status.findIndex(used => used === false);

                if (firstAvailableIndex === -1) {
                    alert(`Sem espaços de ${levelToCast}º Círculo disponíveis!`);
                    return; // BLOQUEIA SE NÃO TIVER SLOT
                }

                // Consome e Salva
                slotData.status[firstAvailableIndex] = true;
                saveStateToServer();
                setTimeout(() => renderActiveTab(), 100); 
            }

            // 2. EXTRAÇÃO DO TEXTO DO DANO
            let damageText = '';
            const dynamicSpan = spellCard.querySelector('.dynamic-damage-text');
            if (dynamicSpan) {
                damageText = dynamicSpan.textContent.trim();
            } else {
                const parent = e.target.closest('.spell-damage');
                if (parent) {
                     damageText = Array.from(parent.childNodes)
                        .filter(n => n.nodeType === Node.TEXT_NODE)
                        .map(n => n.textContent.trim()).join('');
                }
            }

            // 3. CÁLCULO DO DANO
            let damageRes = null;
            if (damageText && damageText !== '-' && damageText !== '0') {
                damageRes = rollDiceExpression(damageText);
            }

            // 4. CÁLCULO DO ACERTO (OPCIONAL: ROLA D20 + BÔNUS MÁGICO)
            let attackRes = null;
            const vals = getSpellAttackValues(); // Pega Inteligência/Carisma + Proficiência
            
            if (vals) {
                const d20 = Math.floor(Math.random() * 20) + 1;
                const totalAttack = d20 + vals.prof + vals.mod + vals.extra;
                const isCrit = (d20 === 20);
                const isFumble = (d20 === 1);

                const d20Html = isCrit ? `<span class="dice-roll-max">20</span>` : (isFumble ? `<span class="dice-roll-min">1</span>` : d20);
                const parts = [d20Html];
                if (vals.mod !== 0) parts.push(vals.mod);
                if (vals.prof !== 0) parts.push(vals.prof);
                if (vals.extra !== 0) parts.push(vals.extra);

                attackRes = {
                    total: totalAttack,
                    text: totalAttack.toString(),
                    detail: parts.join(' + '),
                    isCrit: isCrit,
                    isFumble: isFumble
                };
            }

            // EXIBE RESULTADOS
            if (attackRes || damageRes) {
                showCombatResults(spellTitle, attackRes, damageRes);
            }
            return;
        }

        // -------------------------------------------------------------
        // B. VERIFICA SE É ITEM (ARMA/INVENTÁRIO)
        // -------------------------------------------------------------
        const itemCard = e.target.closest('.item-card');
        if (itemCard) {
            const itemId = itemCard.getAttribute('data-id');
            const item = state.inventory.find(i => String(i.id) === String(itemId));

            if (item) {
                let attackRes = null;
                // ATAQUE
                if (item.type === 'Arma' || (item.attackAttribute && item.attackAttribute !== 'Nenhum')) {
                    const { modAttr, profBonus, itemBonus } = getItemAttackValues(item);
                    const d20 = Math.floor(Math.random() * 20) + 1;
                    const totalAttack = d20 + modAttr + profBonus + itemBonus;
                    const isCrit = (d20 === 20); 
                    const isFumble = (d20 === 1);
                    
                    const d20Html = isCrit ? `<span class="dice-roll-max">20</span>` : (isFumble ? `<span class="dice-roll-min">1</span>` : d20);
                    const detailParts = [d20Html];
                    if (modAttr !== 0) detailParts.push(modAttr); 
                    if (profBonus !== 0) detailParts.push(profBonus); 
                    if (itemBonus !== 0) detailParts.push(itemBonus);
                    
                    attackRes = { 
                        total: totalAttack, 
                        text: totalAttack.toString(), 
                        detail: detailParts.join(' + '),
                        isCrit: isCrit,
                        isFumble: isFumble
                    };
                }

                // DANO
                let damageRes = null;
                let damageText = '';
                const spellDamageDiv = e.target.closest('.spell-damage'); // Reutiliza classe CSS
                if (spellDamageDiv) {
                    damageText = Array.from(spellDamageDiv.childNodes)
                        .filter(n => n.nodeType === Node.TEXT_NODE).map(n => n.textContent.trim()).join('');
                }
                if (!damageText || damageText === '-') damageText = item.damage || '0';

                if (damageText && damageText !== '-' && damageText !== '0') {
                    damageRes = rollDiceExpression(damageText);
                }

                if (attackRes || damageRes) showCombatResults(item.name, attackRes, damageRes);
            }
            return;
        }

        // -------------------------------------------------------------
        // C. VERIFICA SE É HABILIDADE (NOVA LÓGICA)
        // -------------------------------------------------------------
        const habCard = e.target.closest('.hab-card');
        if (habCard) {
            const habId = Number(habCard.getAttribute('data-id'));
            const hab = state.abilities.find(h => h.id === habId);
            
            if (hab) {
                // 1. Rola o Dano (se houver)
                let damageRes = null;
                if (hab.damage && hab.damage !== '-' && hab.damage.trim() !== '') {
                    damageRes = rollDiceExpression(hab.damage);
                }

                // 2. Rola o Ataque (se houver bônus definido, ex: "+5" ou "5")
                let attackRes = null;
                if (hab.attackBonus && hab.attackBonus.trim() !== '') {
                    const bonusStr = hab.attackBonus.replace('+', '').trim();
                    const bonus = parseInt(bonusStr) || 0;
                    
                    const d20 = Math.floor(Math.random() * 20) + 1;
                    const total = d20 + bonus;
                    
                    const isCrit = (d20 === 20);
                    const isFumble = (d20 === 1);
                    const d20Html = isCrit ? `<span class="dice-roll-max">20</span>` : (isFumble ? `<span class="dice-roll-min">1</span>` : d20);

                    attackRes = {
                        total: total,
                        text: total.toString(),
                        detail: `${d20Html} + ${bonus}`,
                        isCrit: isCrit,
                        isFumble: isFumble
                    };
                }

                // Exibe se tiver algum resultado
                if (damageRes || attackRes) {
                    showCombatResults(hab.title, attackRes, damageRes);
                }
            }
            return;
        }
    }

    // =================================================================
    // CASO 2: ATAQUE MÁGICO (BOTÃO CABEÇALHO)
    // =================================================================
    const btnHeader = e.target.closest('#btnRollSpellAttack_Header');
    const btnPrep   = e.target.closest('#btnRollSpellAttack_PrepHeader');

    if (btnHeader || btnPrep) {
        e.preventDefault(); e.stopPropagation();
        
        const vals = getSpellAttackValues(); 
        if (vals === null) { alert("⚠️ Configure a DT de Magia primeiro (ícone ⚙️)!"); return; }
        
        const d20 = Math.floor(Math.random() * 20) + 1;
        const total = d20 + vals.prof + vals.mod + vals.extra;
        const isCrit = (d20 === 20);
        const isFumble = (d20 === 1); 

        const d20Html = isCrit ? `<span class="dice-roll-max">20</span>` : (isFumble ? `<span class="dice-roll-min">1</span>` : d20);
        const parts = [d20Html];
        if (vals.mod !== 0) parts.push(vals.mod);     
        if (vals.prof !== 0) parts.push(vals.prof);  
        if (vals.extra !== 0) parts.push(vals.extra); 

        const res = { 
            total: total, 
            text: total.toString(), 
            detail: parts.join(' + '),
            isCrit: isCrit, 
            isFumble: isFumble 
        };
        
        showCombatResults("Ataque Mágico", res, null);
    }
    
    // =================================================================
    // CASO 3: PERÍCIAS (CLIQUE NO DADO DA ESQUERDA - Se estiver aqui)
    // =================================================================
    if (e.target.classList.contains('col-icon') && e.target.closest('.pericia-item')) {
        e.preventDefault(); e.stopPropagation();
        const itemLi = e.target.closest('.pericia-item');
        const nome = itemLi.querySelector('.col-nome').textContent.trim();
        const bonus = parseInt(itemLi.querySelector('.bonus-span').textContent.replace(/[()]/g, '')) || 0;
        
        const d20 = Math.floor(Math.random() * 20) + 1;
        const total = d20 + bonus;
        const isCrit = (d20 === 20);
        const isFumble = (d20 === 1); 

        const d20Html = isCrit ? `<span class="dice-roll-max">20</span>` : (isFumble ? `<span class="dice-roll-min">1</span>` : d20);
        
        const res = { 
            total: total, 
            text: total.toString(), 
            detail: `${d20Html} + ${bonus}`, 
            isCrit: isCrit, 
            isFumble: isFumble 
        };
        showCombatResults(nome, res, null);
    }
});

/* =============================================================
   NOVA FUNÇÃO: MESCLAR DADOS SEM PERDER O VISUAL
   Coloque no final do DireitaJS.js
============================================================= */
window.mesclarEstadoVisual = function (estadoAntigo, estadoNovo) {
  // 1. Preserva Aba Ativa (Prioridade: LocalStorage > Memória atual)
  if (state.nome) {
    const savedTab = localStorage.getItem(`activeTab_${state.nome}`);
    if (savedTab) estadoNovo.activeTab = savedTab;
    else if (estadoAntigo.activeTab) estadoNovo.activeTab = estadoAntigo.activeTab;
  }

  // 2. Preserva Seções Colapsadas (Habilidades/Inventário)
  if (estadoAntigo.collapsedSections) {
    estadoNovo.collapsedSections = { ...estadoAntigo.collapsedSections };
  }

  // 3. Preserva Itens Expandidos (Inventário)
  if (estadoAntigo.inventory && estadoNovo.inventory) {
    estadoNovo.inventory.forEach(newItem => {
      // Busca o item correspondente no estado antigo pelo ID
      const oldItem = estadoAntigo.inventory.find(old => String(old.id) === String(newItem.id));
      if (oldItem) {
        newItem.expanded = oldItem.expanded; // Mantém o estado visual local
      } else {
        newItem.expanded = false; // Se é novo, começa fechado
      }
    });
  }

  // 4. Preserva Magias Expandidas
  if (estadoAntigo.spells && estadoNovo.spells) {
    estadoNovo.spells.forEach(newSpell => {
      const oldSpell = estadoAntigo.spells.find(old => String(old.id) === String(newSpell.id));
      if (oldSpell) {
        newSpell.expanded = oldSpell.expanded;
      } else {
        newSpell.expanded = false;
      }
    });
  }

  // 5. Preserva Habilidades Expandidas
  if (estadoAntigo.abilities && estadoNovo.abilities) {
    estadoNovo.abilities.forEach(newHab => {
      const oldHab = estadoAntigo.abilities.find(old => String(old.id) === String(newHab.id));
      if (oldHab) {
        newHab.expanded = oldHab.expanded;
      } else {
        newHab.expanded = false;
      }
    });
  }

  return estadoNovo;
}