/* =============================================================
   INTEGRAÇÃO COM O BACKEND (Adicionado ao seu código original)
============================================================= */

const API_URL = 'http://localhost:3000/api';

// --- ADICIONE ESTAS 3 LINHAS AQUI ---
let spellCatalog = [];
let abilityCatalog = [];
let itemCatalog = [];

// ------------------------------------

// Função para sincronizar state com o servidor
async function saveStateToServer() {
  if (!state.nome) return; // Não salva se não tiver feito login
  try {
    await fetch(`${API_URL}/save-ficha`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(state)
    });
  } catch (e) { console.error("Erro ao salvar:", e); }
}

// Função chamada pelo botão de Login no HTML
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

      // Carrega TODOS os catálogos (incluindo itens agora)
      const [sRes, aRes, iRes] = await Promise.all([
        fetch(`${API_URL}/catalog/spells`),
        fetch(`${API_URL}/catalog/abilities`),
        fetch(`${API_URL}/catalog/items`) // <--- NOVA LINHA PARA ITENS
      ]);
      spellCatalog = await sRes.json();
      abilityCatalog = await aRes.json();
      itemCatalog = await iRes.json(); // <--- SALVA NO ARRAY LOCAL

      document.getElementById('login-overlay').style.display = 'none';
      setActiveTab(state.activeTab || 'Combate');
      window.dispatchEvent(new CustomEvent('sheet-updated'));
    } else {
      alert("Nome ou senha incorretos.");
    }
  } catch (e) {
    alert("Erro de conexão com o servidor.");
  }
}


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

// Escuta atualizações do lado Esquerdo para recalcular
window.addEventListener('sheet-updated', () => {
  state.dtMagias = calculateSpellDC();

  const inputDisplay = document.getElementById('dtMagiasInput');
  if (inputDisplay) {
    inputDisplay.value = state.dtMagias;
  }
});

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
  'Artífice': ['Alquimista', 'Armeiro', 'Artilheiro', 'Ferreiro de Batalha'],
  'Bárbaro': ['Caminho do Berserker', 'Caminho do Guerreiro Totêmico', 'Caminho do Guardião Ancestral', 'Caminho do Arauto da Tempestade', 'Caminho do Fanático', 'Caminho da Besta', 'Caminho da Magia Selvagem'],
  'Bardo': ['Colégio do Conhecimento', 'Colégio da Bravura', 'Colégio do Glamour', 'Colégio das Espadas', 'Colégio dos Sussurros', 'Colégio da Criação', 'Colégio da Eloquência', 'Colégio dos Espíritos'],
  'Bruxo': ['Arquifada', 'O Corruptor', 'O Grande Antigo', 'O Celestial', 'Hexblade', 'O Insondável', 'O Gênio', 'O Morto-Vivo'],
  'Blood Hunter': ['Ordem do Caça-Fantasmas', 'Ordem do Licantropo', 'Ordem do Mutante', 'Ordem da Alma Profana'],
  'Clérigo': ['Domínio do Conhecimento', 'Domínio da Vida', 'Domínio da Luz', 'Domínio da Natureza', 'Domínio da Tempestade', 'Domínio da Enganação', 'Domínio da Guerra', 'Domínio da Forja', 'Domínio da Sepultura', 'Domínio da Ordem', 'Domínio da Paz', 'Domínio do Crepúsculo', 'Domínio Arcano', 'Domínio da Morte'],
  'Druida': ['Círculo da Terra', 'Círculo da Lua', 'Círculo dos Sonhos', 'Círculo do Pastor', 'Círculo dos Esporos', 'Círculo das Estrelas', 'Círculo do Fogo Selvagem'],
  'Feiticeiro': ['Linhagem Dracônica', 'Magia Selvagem', 'Alma Divina', 'Magia das Sombras', 'Feitiçaria da Tempestade', 'Mente Aberrante', 'Alma do Relógio'],
  'Guerreiro': ['Campeão', 'Mestre de Batalha', 'Cavaleiro Arcano', 'Arqueiro Arcano', 'Cavaleiro', 'Samurai', 'Guerreiro Psiônico', 'Cavaleiro Rúnico', 'Cavaleiro do Eco'],
  'Ladino': ['Ladrão', 'Assassino', 'Trapaceiro Arcano', 'Inquisitivo', 'Mentor', 'Espadachim', 'Batedor', 'Fantasma', 'Lâmina da Alma'],
  'Mago': ['Abjuração', 'Conjuração', 'Adivinhação', 'Encantamento', 'Evocação', 'Ilusão', 'Necromancia', 'Transmutação', 'Magia de Guerra', 'Cantor da Lâmina', 'Escribas'],
  'Monge': ['Caminho da Mão Aberta', 'Caminho das Sombras', 'Caminho dos Quatro Elementos', 'Caminho da Longa Morte', 'Kensei', 'Mestre Bêbado', 'Alma Solar', 'Misericórdia', 'Forma Astral', 'Dragão Ascendente'],
  'Paladino': ['Devotion', 'Ancients', 'Vengeance', 'Crown', 'Conquest', 'Redemption', 'Glory', 'Watchers', 'Oathbreaker'],
  'Patrulheiro': ['Caçador', 'Mestre das Feras', 'Caçador das Sombras', 'Andarilho do Horizonte', 'Matador de Monstros', 'Peregrino Feérico', 'Guardião do Enxame', 'Guardião Dracônico'],
  'Antecedentes': [],
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

// Escuta atualizações do lado Esquerdo
window.addEventListener('sheet-updated', () => {
  state.dtMagias = calculateSpellDC();
  // Se a aba Magias estiver aberta, atualiza o input visualmente
  const inputDisplay = document.getElementById('dtMagiasInput');
  if (inputDisplay) {
    inputDisplay.value = state.dtMagias;
  }
});

function setActiveTab(tabName) {
  state.activeTab = tabName;
  document.querySelectorAll('.lado-direito .abas button').forEach(b => {
    b.classList.toggle('ativa', b.textContent.trim() === tabName);
  });
  renderActiveTab();
  saveStateToServer(); // <--- SALVAR ABA ATIVA
}

/* ---------------- INVENTÁRIO (DANO DINÂMICO, DADO MAIOR E SUBTÍTULO AMPLO) ---------------- */
function formatInventoryItem(item) {
  let subTitle = '';
  let rightSideHtml = '';
  const caretSymbol = item.expanded ? '▾' : '▸';

  // 1. Configuração do Cabeçalho por Tipo
  if (item.type === 'Arma') {
    subTitle = [item.proficiency, item.tipoArma].filter(Boolean).join(' • ');

    // Cálculo do Dano Total (Base + Extras)
    let dmgParts = [];
    if (item.damage && item.damage !== '0' && item.damage.trim() !== '') {
      dmgParts.push(item.damage);
    }
    if (item.moreDmgList && Array.isArray(item.moreDmgList)) {
      item.moreDmgList.forEach(m => {
        if (m.dano) dmgParts.push(m.dano);
      });
    }
    const finalDamage = dmgParts.join(' + ') || '-';

    // LÓGICA DE FONTE DINÂMICA: Quanto mais caracteres, menor a fonte (mínimo 11px, máximo 18px)
    let dmgFontSize = 18;
    if (finalDamage.length > 5) {
      dmgFontSize = Math.max(11, 18 - (finalDamage.length - 5) * 0.6);
    }

    rightSideHtml = `
       <div class="card-meta spell-damage" style="display: flex; align-items: center; gap: 6px; flex-shrink: 0; margin-top: -2px;">
         <span style="font-weight: 800; color: #9c27b0; font-size: ${dmgFontSize}px; white-space: nowrap; transition: font-size 0.2s;">
            ${finalDamage}
         </span>
         <img class="dice-img" src="img/dado.png" alt="dado" style="width: 20px; height: 20px;" />
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

  // --- MONTAGEM DO CONTEÚDO DO CORPO (DETALHES) ---
  const formatSkillList = (val) => {
    if (!val) return null;
    if (Array.isArray(val)) return val.length > 0 ? val.join(', ') : null;
    return val;
  };

  const createStat = (label, value) => {
    if (!value || value === '0' || value === '-') return '';
    return `<div><span class="purple-label">${label}:</span> <span class="white-val">${value}</span></div>`;
  };

  let bodyContent = '';
  if (item.type === 'Arma') {
    let statsHTML = '';
    statsHTML += createStat('Critico', item.crit);
    statsHTML += createStat('Mult', item.multiplicador);
    statsHTML += createStat('Alcance', item.alcance);
    statsHTML += createStat('Empunhadura', item.empunhadura);
    if (item.attunement === 'Sim') statsHTML += `<div><span class="purple-label">Sint:</span> <span class="white-val">Sim</span></div>`;

    bodyContent = `
      <div class="item-stats-row">${statsHTML}</div>
      <div class="item-data-row">
          <span class="purple-label">Dano Base:</span> <span class="white-val bold">${item.damage || '-'}</span>
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
    bodyContent = `
       <div class="item-stats-row">
          ${item.defense ? `<div><span class="purple-label">Defesa:</span> <span class="white-val bold">${item.defense}</span></div>` : ''}
          ${item.minStrength ? `<div><span class="purple-label">Mín. FOR:</span> <span class="white-val">${item.minStrength}</span></div>` : ''}
       </div>
    `;
  }

  const descHtml = item.description ? `<div class="item-description-text">${escapeHtml(item.description)}</div>` : '';

  // --- RETORNO DO HTML ---
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

function renderInventory() {
  const html = `
    <div class="inventory-controls controls-row">
      <input id="filterItens" placeholder="Filtrar itens" />
      <div class="right-controls">
        <button id="botAddItem" class="btn-add">Adicionar</button>
      </div>
    </div>
    <div class="inventory-list">
      ${state.inventory.map(formatInventoryItem).join('')}
    </div>
  `;
  conteudoEl.innerHTML = html;
  bindInventoryCardEvents();
  aplicarEnterNosInputs(conteudoEl);
}

function bindInventoryCardEvents() {
  document.querySelectorAll('.item-card').forEach(card => {
    const id = Number(card.getAttribute('data-id'));
    const header = card.querySelector('.card-header');

    header.addEventListener('click', (ev) => {
      if (ev.target.closest('.right') || ev.target.closest('.header-equip') || ev.target.closest('.item-equip-checkbox')) return;
      const it = state.inventory.find(x => x.id === id);
      it.expanded = !it.expanded;
      renderActiveTab();
      saveStateToServer();
    });
  });

  document.querySelectorAll('.item-equip-checkbox').forEach(ch => {
    ch.addEventListener('change', (ev) => {
      ev.stopPropagation();
      const id = Number(ev.target.getAttribute('data-id'));
      const item = state.inventory.find(x => x.id === id);

      if (item && ev.target.checked) {
        // LÓGICA DE EXCLUSIVIDADE
        if (item.type === 'Proteção' || item.type === 'protecao') {
          const isEscudo = item.tipoItem?.toLowerCase() === 'escudo' || item.proficiency?.toLowerCase() === 'escudo';

          state.inventory.forEach(i => {
            if (i.id !== id && (i.type === 'Proteção' || i.type === 'protecao')) {
              const otherIsEscudo = i.tipoItem?.toLowerCase() === 'escudo' || i.proficiency?.toLowerCase() === 'escudo';

              // Se eu equipei uma armadura, desequipa a outra armadura.
              // Se eu equipei um escudo, desequipa o outro escudo.
              if (isEscudo === otherIsEscudo) {
                i.equip = false;
              }
            }
          });
        }
      }

      if (item) {
        item.equip = ev.target.checked;
        saveStateToServer();
        renderActiveTab();
        // Notifica a Esquerda para recalcular a CA
        window.dispatchEvent(new CustomEvent('sheet-updated'));
      }
    });
    ch.addEventListener('click', ev => ev.stopPropagation());
  });

  document.querySelectorAll('.remover-item').forEach(el => {
    el.addEventListener('click', (ev) => {
      ev.preventDefault();
      const id = Number(el.getAttribute('data-id'));
      state.inventory = state.inventory.filter(i => i.id !== id);
      renderActiveTab();
      saveStateToServer();
      window.dispatchEvent(new CustomEvent('sheet-updated'));
    });
  });

  document.querySelectorAll('.editar-item').forEach(el => {
    el.addEventListener('click', (ev) => {
      ev.preventDefault();
      const id = Number(el.getAttribute('data-id'));
      const it = state.inventory.find(i => i.id === id);
      if (it) openItemModal(it);
    });
  });

  const botAdd = document.getElementById('botAddItem');
  if (botAdd) botAdd.onclick = () => openItemModal(null);

  const filtro = document.getElementById('filterItens');
  if (filtro) {
    filtro.oninput = (e) => {
      const q = e.target.value.toLowerCase();
      document.querySelectorAll('.item-card').forEach(card => {
        const title = card.querySelector('.card-title').textContent.toLowerCase();
        card.style.display = title.includes(q) ? '' : 'none';
      });
    };
  }
}

function renderCombat() {
  let equipped = state.inventory.filter(i => i.equip);

  equipped.sort((a, b) => {
    const getOrder = (type) => {
      const t = (type || '').toLowerCase();
      if (t === 'arma') return 1;
      if (t === 'geral') return 2;
      if (t === 'proteção' || t === 'protecao') return 3;
      return 4;
    };
    return getOrder(a.type) - getOrder(b.type);
  });

  if (!equipped.length) {
    conteudoEl.innerHTML = `<p class="empty-tip">Você ainda não possui ataques ou equipamentos equipados para combate.</p>`;
    return;
  }

  const html = `
    <div class="controls-row">
      <input id="filterCombat" placeholder="Filtrar combate..." />
    </div>
    <div class="inventory-list">${equipped.map(formatInventoryItem).join('')}</div>
  `;
  conteudoEl.innerHTML = html;
  bindInventoryCardEvents();

  // Lógica de filtro para Combate
  const filtro = document.getElementById('filterCombat');
  if (filtro) {
    filtro.addEventListener('input', (e) => {
      const q = e.target.value.toLowerCase();
      conteudoEl.querySelectorAll('.item-card').forEach(card => {
        const title = card.querySelector('.card-title').textContent.toLowerCase();
        card.style.display = title.includes(q) ? '' : 'none';
      });
    });
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
      ev.preventDefault();
      modal.remove(); // Fecha o modal de "Novo Item"
      checkScrollLock();
      openItemCatalogOverlay(); // Abre o novo catálogo
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
    if (btns.length > 0) {
      btns.forEach(b => {
        b.classList.toggle('active', b.getAttribute('data-tab') === tab);
      });
    }

    let html = '';

    if (tab === 'Item') {
      const disadv = Array.isArray(pre.disadvantageSkill) ? pre.disadvantageSkill : (pre.disadvantageSkill ? [pre.disadvantageSkill] : []);
      const adv = Array.isArray(pre.advantageSkill) ? pre.advantageSkill : (pre.advantageSkill ? [pre.advantageSkill] : []);

      html = `
         <div style="display:grid; grid-template-columns: 1fr 1fr 1fr; gap:12px; align-items:end;">
            <div style="grid-column: 1 / -1;">
              <label>Nome*</label>
              <input id="item-name" type="text" value="${escapeHtml(pre.name || '')}" placeholder="Nome do item" />
            </div>

            <div>
               <label>Acerto Bonus</label>
               <input id="item-acerto" type="text" value="${escapeHtml(pre.acertoBonus || '')}" />
            </div>
            <div>
               <label>Dano Bonus</label>
               <input id="item-danobonus" type="text" value="${escapeHtml(pre.damageBonus || '')}" />
            </div>
            <div>
               <label>Tipo de Dano</label>
               <input id="item-dmgtype" type="text" value="${escapeHtml(pre.damageType || '')}" />
            </div>

            <div style="grid-column: 1 / span 1;">
               <label>Defesa(CA) Bonus</label>
               <input id="item-defense" type="text" value="${escapeHtml(pre.defenseBonus || '')}" />
            </div>
            <div style="grid-column: 2 / span 2;">
               <label>Tipo de Defesa</label>
               <input id="item-defensetype" type="text" value="${escapeHtml(pre.defenseType || 'Geral')}" />
            </div>

            <div style="grid-column: 1 / span 1.5;">
               <label>Desvantagem</label>
               ${renderPericiaMulti('disadv-field-item', disadv)}
            </div>
            <div style="grid-column: 2.5 / span 1.5;">
               <label>Vantagem</label>
               ${renderPericiaMulti('adv-field-item', adv)}
            </div>

            <div style="grid-column: 1 / -1;">
               <label>Descrição</label>
               <textarea id="item-desc" style="min-height:150px;">${escapeHtml(pre.description || '')}</textarea>
            </div>
         </div>
       `;
    } else if (tab === 'Arma') {
      const profSelected = pre.proficiency || '';
      const tipoSelected = pre.tipoArma || '';
      const empSelected = pre.empunhadura || '';
      const carSelected = pre.caracteristicas || [];
      const dmgTypesSelected = pre.damageTypes || [];

      html = `
        <div style="display:grid; grid-template-columns: 1fr 1fr 1fr 1fr; gap:12px; align-items:start;">
          <div style="grid-column: 1 / span 4;">
            <label>Nome*</label>
            <input id="item-name" type="text" value="${escapeHtml(pre.name || 'Nova Arma')}" />
          </div>
          <div>
            <label>Proficiência</label>
            <div class="pills-container" id="prof-pills">
              ${PROFICIENCIAS_ARMA.map(p => `<button type="button" class="pill single-select ${p === profSelected ? 'active' : ''}" data-val="${escapeHtml(p)}">${escapeHtml(p)}</button>`).join('')}
            </div>
          </div>
          <div>
            <label>Tipo</label>
            <div class="pills-container" id="tipo-pills">
              ${TIPOS_ARMA.map(p => `<button type="button" class="pill single-select ${p === tipoSelected ? 'active' : ''}" data-val="${escapeHtml(p)}">${escapeHtml(p)}</button>`).join('')}
            </div>
          </div>
          <div>
            <label>Empunhadura</label>
            <div class="pills-container" id="emp-pills">
              ${EMPUNHADURAS.map(p => `<button type="button" class="pill single-select ${p === empSelected ? 'active' : ''}" data-val="${escapeHtml(p)}">${escapeHtml(p)}</button>`).join('')}
            </div>
          </div>
          <div style="grid-column: 4 / span 1;">
             <label>Caracteristica</label>
             <div id="car-field" class="multi-select-field" style="margin-top:6px; position:relative;">
               <div class="display"><span>${carSelected.length ? carSelected.join(', ') : 'Selecione...'}</span> <span style="color:#9c27b0;">▾</span></div>
               <div id="car-panel" class="panel" style="display:none; position:absolute; z-index:12000; width:100%;">
                 ${CARACTERISTICAS_ARMA.map(c => `<label style="display:block;padding:6px;"><input type="checkbox" value="${c}" ${carSelected.includes(c) ? 'checked' : ''} /> ${c}</label>`).join('')}
               </div>
             </div>
          </div>
          <div style="grid-column: 1 / span 1;">
            <label>Critico</label>
            <input id="item-crit" type="text" value="${escapeHtml(pre.crit || '20')}" />
          </div>
          <div style="grid-column: 2 / span 1;">
            <label>Multiplicador</label>
            <input id="item-mult" type="text" value="${escapeHtml(pre.multiplicador || '2')}" />
          </div>
          <div style="grid-column: 3 / span 1;">
            <label>Alcance</label>
            <input id="item-range" type="text" value="${escapeHtml(pre.alcance || '1.5m')}" />
          </div>
          <div style="grid-column: 4 / span 1;">
             <label>Sintonização</label>
             <select id="item-attune-weapon" class="dark-select">
                <option value="Não" ${pre.attunement !== 'Sim' ? 'selected' : ''}>Não</option>
                <option value="Sim" ${pre.attunement === 'Sim' ? 'selected' : ''}>Sim</option>
             </select>
          </div>
          <div style="grid-column: 1 / span 2;">
            <label>Dano</label>
            <input id="item-damage" type="text" value="${escapeHtml(pre.damage || '')}" placeholder="Ex: 1d8" />
          </div>
          <div style="grid-column: 3 / span 2;">
            <label>Tipo de dano</label>
             <div id="dmg-field" class="multi-select-field" style="margin-top:6px; position:relative;">
               <div class="display"><span>${dmgTypesSelected.length ? dmgTypesSelected.join(', ') : 'Selecione...'}</span> <span style="color:#9c27b0;">▾</span></div>
               <div id="dmg-panel" class="panel" style="display:none; position:absolute; z-index:12000; width:100%;">
                 ${TIPOS_DANO.map(c => `<label style="display:block;padding:6px;"><input type="checkbox" value="${c}" ${dmgTypesSelected.includes(c) ? 'checked' : ''} /> ${c}</label>`).join('')}
               </div>
             </div>
          </div>
          <div style="grid-column: 1 / span 4;">
             <div id="extra-dmg-list" style="display:flex; flex-direction:column; gap:8px;"></div>
             <button type="button" id="btn-add-dmg" style="margin-top:8px; background:#9c27b0; color:white; border:none; padding:6px 12px; border-radius:4px; font-weight:bold; cursor:pointer;">+ Adicionar Dano</button>
          </div>
          <div style="grid-column:1 / span 4;">
             <label>Descrição</label>
             <textarea id="item-desc" style="height:100px;">${escapeHtml(pre.description || '')}</textarea>
          </div>
        </div>
       `;
    } else if (tab === 'Armadura') {
      const profSelected = pre.proficiency || '';
      const tipoSelected = pre.tipoItem || 'Armadura';
      const minReqAttrs = pre.minReqAttrs || ['Força'];
      const disadv = Array.isArray(pre.disadvantageSkill) ? pre.disadvantageSkill : (pre.disadvantageSkill ? [pre.disadvantageSkill] : []);
      const adv = Array.isArray(pre.advantageSkill) ? pre.advantageSkill : (pre.advantageSkill ? [pre.advantageSkill] : []);

      html = `
        <div style="display:grid; grid-template-columns: 1.2fr 0.8fr 1.2fr; gap:12px; align-items:start;">
           <div style="grid-column: 1 / span 3;">
             <label>Nome*</label>
             <input id="item-name" type="text" value="${escapeHtml(pre.name || 'Nova Armadura')}" />
           </div>
           <div>
             <label>Proficiência</label>
             <div class="pills-container" id="arm-prof-pills">
                ${PROFICIENCIAS_ARMADURA.map(p => `<button type="button" class="pill single-select ${p === profSelected ? 'active' : ''}" data-val="${escapeHtml(p)}">${escapeHtml(p)}</button>`).join('')}
             </div>
           </div>
           <div style="text-align:center;">
              <label style="text-align:left;">Defesa (CA)</label>
              <input id="item-defense" type="text" value="${escapeHtml(pre.defense || '')}" placeholder="+2 ou 14" />
           </div>
           <div>
             <label>Tipo</label>
             <div class="pills-container" id="arm-tipo-pills">
                ${TIPOS_ARMADURA.map(p => `<button type="button" class="pill single-select ${p === tipoSelected ? 'active' : ''}" data-val="${escapeHtml(p)}">${escapeHtml(p)}</button>`).join('')}
             </div>
           </div>
           <div style="grid-column: 1 / span 3; display:grid; grid-template-columns: 1fr 1fr 1fr 1fr; gap:12px;">
               <div style="position:relative;">
                  <div id="min-req-container" class="multi-select-field">
                     <div id="min-req-trigger" class="label-dropdown-trigger" style="margin-top:20px; min-height:38px; display:flex; align-items:center;">
                        <span style="color:#bbb; margin-right:4px; white-space:nowrap;">Mínimo de:</span>
                        <span id="min-req-label-text" style="color:#fff; flex:1; line-height:1.2;">${minReqAttrs.join(', ')}</span> 
                        <span class="purple-caret" style="margin-left:4px;">▾</span>
                     </div>
                     <div id="min-req-panel" class="panel" style="display:none; position:absolute; z-index:12000; width:100%; top:100%; left:0;">
                        ${ATRIBUTOS_DND.map(attr => `
                           <label style="display:block;padding:6px;cursor:pointer;">
                              <input type="checkbox" value="${attr}" ${minReqAttrs.includes(attr) ? 'checked' : ''} /> ${attr}
                           </label>
                        `).join('')}
                     </div>
                  </div>
                  <input id="item-minstr" type="number" value="${pre.minStrength || 0}" style="margin-top:4px; width:100%;" />
               </div>
               <div>
                  <label>Sintonização</label>
                  <select id="item-attune" class="dark-select">
                     <option value="Não" ${pre.attunement !== 'Sim' ? 'selected' : ''}>Não</option>
                     <option value="Sim" ${pre.attunement === 'Sim' ? 'selected' : ''}>Sim</option>
                  </select>
               </div>
               <div>
                  <label>Desvantagem</label>
                  ${renderPericiaMulti('disadv-field', disadv)}
               </div>
               <div>
                  <label>Vantagem</label>
                  ${renderPericiaMulti('adv-field', adv)}
               </div>
           </div>
           <div style="grid-column: 1 / span 3;">
             <label>Descrição</label>
             <textarea id="item-desc" style="height:120px;">${escapeHtml(pre.description || '')}</textarea>
           </div>
        </div>
       `;
    }

    contentBody.innerHTML = html;
    bindTabEvents(tab);
  }

  function createDamageRow(danoVal = '', typesVal = []) {
    const row = document.createElement('div');
    row.className = 'extra-dmg-row';
    row.style.display = 'grid';
    row.style.gridTemplateColumns = '1fr 1fr 1fr 1fr';
    row.style.gap = '12px';
    row.style.alignItems = 'start';

    const html = `
       <div style="grid-column: 1 / span 2;">
          <input type="text" class="extra-dmg-input" value="${escapeHtml(danoVal)}" placeholder="Ex: +1d6" />
       </div>
       <div style="grid-column: 3 / span 2; position:relative;" class="extra-dmg-select-container">
          <div class="multi-select-field">
             <div class="display"><span>${typesVal.length ? typesVal.join(', ') : 'Tipo'}</span> <span style="color:#9c27b0;">▾</span></div>
             <div class="panel" style="display:none; position:absolute; z-index:12000; width:100%;">
                ${TIPOS_DANO.map(c => `<label style="display:block;padding:6px;"><input type="checkbox" value="${c}" ${typesVal.includes(c) ? 'checked' : ''} /> ${c}</label>`).join('')}
             </div>
          </div>
          <button type="button" class="remove-dmg-row" style="position:absolute; right:-25px; top:5px; background:none; border:none; color:#d88; font-weight:bold; cursor:pointer;">✖</button>
       </div>
     `;
    row.innerHTML = html;

    const field = row.querySelector('.multi-select-field');
    const display = field.querySelector('.display');
    const panel = field.querySelector('.panel');

    display.addEventListener('click', (e) => {
      e.stopPropagation();
      const isOpen = panel.style.display === 'block';
      document.querySelectorAll('.panel').forEach(p => p.style.display = 'none');
      panel.style.display = isOpen ? 'none' : 'block';
    });

    panel.querySelectorAll('input').forEach(chk => {
      chk.addEventListener('change', () => {
        const vals = Array.from(panel.querySelectorAll('input:checked')).map(x => x.value);
        display.querySelector('span').textContent = vals.length ? vals.join(', ') : 'Tipo';
      });
    });

    row.querySelector('.remove-dmg-row').addEventListener('click', () => row.remove());
    return row;
  }

  function bindTabEvents(tab) {
    modal.querySelectorAll('.pill.single-select').forEach(p => {
      p.addEventListener('click', () => {
        p.parentElement.querySelectorAll('.pill').forEach(x => x.classList.remove('active'));
        p.classList.add('active');
      });
    });

    modal.querySelectorAll('.multi-select-field').forEach(field => {
      if (field.closest('.extra-dmg-row')) return;

      const isMinReq = field.id === 'min-req-container';
      let trigger = field.querySelector('.label-dropdown-trigger') || field.querySelector('.display');
      const panel = field.querySelector('.panel');

      trigger.addEventListener('click', (e) => {
        e.stopPropagation();
        const isOpen = panel.style.display === 'block';
        document.querySelectorAll('.panel').forEach(p => p.style.display = 'none');
        panel.style.display = isOpen ? 'none' : 'block';
      });

      panel.querySelectorAll('input[type="checkbox"]').forEach(chk => {
        chk.addEventListener('change', () => {
          const vals = Array.from(panel.querySelectorAll('input:checked')).map(x => x.value);

          if (isMinReq) {
            const labelText = modal.querySelector('#min-req-label-text');
            labelText.textContent = vals.length ? vals.join(', ') : '';
          } else {
            const span = trigger.querySelector('span:first-child');
            if (span) span.textContent = vals.length ? vals.join(', ') : 'Selecione...';
          }
        });
      });
    });

    if (tab === 'Arma') {
      const container = modal.querySelector('#extra-dmg-list');
      const btnAdd = modal.querySelector('#btn-add-dmg');
      if (pre.moreDmgList && pre.moreDmgList.length) {
        pre.moreDmgList.forEach(item => {
          container.appendChild(createDamageRow(item.dano, item.types));
        });
      }
      btnAdd.addEventListener('click', () => {
        container.appendChild(createDamageRow());
      });
    }
  }

  renderBody(currentTab);

  if (btns.length > 0) {
    btns.forEach(b => {
      b.addEventListener('click', () => {
        renderBody(b.getAttribute('data-tab'));
      });
    });
  }

  document.addEventListener('click', (e) => {
    if (!e.target.closest('.multi-select-field')) {
      document.querySelectorAll('.panel').forEach(p => p.style.display = 'none');
    }
  });

  const closeMe = () => {
    modal.remove();
    checkScrollLock();
  };
  modal.querySelector('.modal-close').addEventListener('click', closeMe);
  modal.querySelector('.btn-cancel').addEventListener('click', (ev) => { ev.preventDefault(); closeMe(); });

  // === SALVAR ===
  modal.querySelector('.btn-save-item').addEventListener('click', (ev) => {
    ev.preventDefault();

    const name = modal.querySelector('#item-name').value.trim() || 'Sem nome';
    const desc = modal.querySelector('#item-desc') ? modal.querySelector('#item-desc').value.trim() : '';

    let newItem = {
      id: existingItem ? existingItem.id : uid(),
      name: name,
      description: desc,
      expanded: true,
      equip: existingItem ? !!existingItem.equip : false
    };

    if (currentTab === 'Item') {
      newItem.type = 'Geral';
      newItem.isEquipable = true;

      newItem.acertoBonus = modal.querySelector('#item-acerto').value;
      newItem.damageBonus = modal.querySelector('#item-danobonus').value;
      newItem.damageType = modal.querySelector('#item-dmgtype').value;
      newItem.defenseBonus = modal.querySelector('#item-defense').value;
      newItem.defenseType = modal.querySelector('#item-defensetype').value;

      const disPanel = modal.querySelector('#disadv-field-item .panel');
      newItem.disadvantageSkill = disPanel ? Array.from(disPanel.querySelectorAll('input:checked')).map(x => x.value) : [];

      const advPanel = modal.querySelector('#adv-field-item .panel');
      newItem.advantageSkill = advPanel ? Array.from(advPanel.querySelectorAll('input:checked')).map(x => x.value) : [];
    }
    else if (currentTab === 'Arma') {
      newItem.type = 'Arma';
      newItem.isEquipable = true;
      const profEl = modal.querySelector('#prof-pills .active');
      newItem.proficiency = profEl ? profEl.getAttribute('data-val') : '';
      const tipoEl = modal.querySelector('#tipo-pills .active');
      newItem.tipoArma = tipoEl ? tipoEl.getAttribute('data-val') : '';
      const empEl = modal.querySelector('#emp-pills .active');
      newItem.empunhadura = empEl ? empEl.getAttribute('data-val') : '';
      newItem.crit = modal.querySelector('#item-crit').value;
      newItem.multiplicador = modal.querySelector('#item-mult').value;
      newItem.alcance = modal.querySelector('#item-range').value;

      const attuneEl = modal.querySelector('#item-attune-weapon');
      newItem.attunement = attuneEl ? attuneEl.value : 'Não';

      newItem.damage = modal.querySelector('#item-damage').value;

      const carPanel = modal.querySelector('#car-panel');
      if (carPanel) newItem.caracteristicas = Array.from(carPanel.querySelectorAll('input:checked')).map(x => x.value);
      const dmgPanel = modal.querySelector('#dmg-panel');
      if (dmgPanel) newItem.damageTypes = Array.from(dmgPanel.querySelectorAll('input:checked')).map(x => x.value);

      const extraRows = modal.querySelectorAll('.extra-dmg-row');
      newItem.moreDmgList = [];
      extraRows.forEach(row => {
        const d = row.querySelector('.extra-dmg-input').value;
        const p = row.querySelector('.panel');
        const t = Array.from(p.querySelectorAll('input:checked')).map(x => x.value);
        if (d || t.length) newItem.moreDmgList.push({ dano: d, types: t });
      });
    }
    else if (currentTab === 'Armadura') {
      newItem.type = 'Proteção';
      newItem.isEquipable = true;

      const profEl = modal.querySelector('#arm-prof-pills .active');
      newItem.proficiency = profEl ? profEl.getAttribute('data-val') : '';

      const tipoEl = modal.querySelector('#arm-tipo-pills .active');
      newItem.tipoItem = tipoEl ? tipoEl.getAttribute('data-val') : 'Armadura';

      newItem.minStrength = modal.querySelector('#item-minstr').value;
      newItem.attunement = modal.querySelector('#item-attune').value;

      const minReqPanel = modal.querySelector('#min-req-panel');
      newItem.minReqAttrs = Array.from(minReqPanel.querySelectorAll('input:checked')).map(x => x.value);

      const disPanel = modal.querySelector('#disadv-field .panel');
      newItem.disadvantageSkill = disPanel ? Array.from(disPanel.querySelectorAll('input:checked')).map(x => x.value) : [];

      const advPanel = modal.querySelector('#adv-field .panel');
      newItem.advantageSkill = advPanel ? Array.from(advPanel.querySelectorAll('input:checked')).map(x => x.value) : [];

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

/* ---------------- HABILIDADES ---------------- */
function renderAbilities() {
  const html = `
    <div class="abilities-controls controls-row">
      <input id="filterHabs" placeholder="Filtrar habilidades" />
      <div class="right-controls">
        <button id="botOpenCatalogHab" class="btn-add">Adicionar</button>
      </div>
    </div>
    <div class="abilities-list">
      ${state.abilities.map(a => `
        <div class="card hab-card ${a.expanded ? 'expanded' : ''}" data-id="${a.id}">
          <div class="card-header">
            <div class="left" data-id="${a.id}">
              <span class="caret">${a.expanded ? '▾' : '▸'}</span>
              <div class="card-title">${a.title}</div>
            </div>
            <div class="right">
               <label class="check-ativar" title="Preparar Habilidade">
                  <input class="hab-activate" type="checkbox" data-id="${a.id}" ${a.active ? 'checked' : ''}/>
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
  conteudoEl.innerHTML = html;

  document.querySelectorAll('.hab-card').forEach(card => {
    const id = Number(card.getAttribute('data-id'));
    const header = card.querySelector('.card-header');

    header.addEventListener('click', (ev) => {

      if (ev.target.closest('.check-ativar') || ev.target.closest('.hab-activate')) return;
      const hab = state.abilities.find(h => h.id === id);
      hab.expanded = !hab.expanded;
      renderAbilities();
      saveStateToServer();
    });

    const ch = card.querySelector('.hab-activate');
    if (ch) {
      ch.addEventListener('change', (ev) => {
        const hab = state.abilities.find(h => h.id === id);
        if (hab) {
          hab.active = ev.target.checked;
          saveStateToServer();

          if (state.activeTab === 'Mag. Preparadas') renderPreparedSpells();
        }
      });

      ch.addEventListener('click', (ev) => ev.stopPropagation());
    }
  });

  document.querySelectorAll('.remover-hab').forEach(el => el.addEventListener('click', (ev) => { ev.preventDefault(); const id = Number(el.getAttribute('data-id')); state.abilities = state.abilities.filter(h => h.id !== id); renderAbilities(); saveStateToServer(); })); // <--- SALVAR REMOVER
  document.querySelectorAll('.editar-hab').forEach(el => el.addEventListener('click', (ev) => { ev.preventDefault(); const id = Number(el.getAttribute('data-id')); const hab = state.abilities.find(h => h.id === id); if (!hab) return; openNewAbilityModal(hab); }));
  const botAddCatalog = document.getElementById('botOpenCatalogHab');
  if (botAddCatalog) botAddCatalog.addEventListener('click', () => openAbilityCatalogOverlay());
  const filtro = document.getElementById('filterHabs');
  if (filtro) filtro.addEventListener('input', (e) => {
    const q = e.target.value.toLowerCase();
    document.querySelectorAll('.hab-card').forEach(card => {
      const title = card.querySelector('.card-title').textContent.toLowerCase();
      card.style.display = title.includes(q) ? '' : 'none';
    });
  });
}

/* ---------------- MAGIAS ---------------- */
function formatMySpellCard(s) {
  const schoolPill = `<div class="pill">${s.school || '—'}${s.levelNumber !== undefined ? ` <span class="pill-level">${s.levelNumber}</span>` : ''}</div>`;
  const compRow = `
      <div class="comp-block">
        <div class="comp-title">Componente</div>
        <div class="comp-letters">
          <span class="comp-letter ${s.components && s.components.V ? 'on' : ''}">V</span>
          <span class="comp-letter ${s.components && s.components.S ? 'on' : ''}">S</span>
          <span class="comp-letter ${s.components && s.components.M ? 'on' : ''}">M</span>
        </div>
        <div class="comp-material">Material: ${s.material || '-'}</div>
      </div>
    `;
  const caretSymbol = s.expanded ? '▾' : '▸';
  const classDisplay = `<div class="class-box-display">${s.spellClass || '—'}</div>`;

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
            <div class="card-meta spell-damage">${s.damage || '-'} <img class="dice-img" src="img/dado.png" alt="dado" /></div>
            <label class="check-ativar"><input class="spell-activate" type="checkbox" data-id="${s.id}" ${s.active ? 'checked' : ''}/><span class="square-check"></span></label>
          </div>
        </div>
        <div class="card-body" style="${s.expanded ? '' : 'display:none;'}">
          <div style="display:flex; gap:12px; align-items:flex-start; width:100%;">
            <div style="flex:0 0 auto;">${schoolPill}</div>
            <div style="flex:1 1 auto;">${compRow}</div>
            <div style="flex:0 0 auto; align-self:flex-start;">${classDisplay}</div>
          </div>
          <div class="spell-attrs" style="margin-top:12px;">
            <div><span class="purple">Execução:</span> ${s.attrs.execucao}</div>
            <div><span class="purple">Alcance:</span> ${s.attrs.alcance}</div>
            <div><span class="purple">Área:</span> ${s.attrs.area}</div>
            <div><span class="purple">Alvo:</span> ${s.attrs.alvo}</div>
            <div><span class="purple">Duração:</span> ${s.attrs.duracao}</div>
            <div><span class="purple">Resistência:</span> ${s.attrs.resistencia}</div>
          </div>
          <p style="margin-top:10px;">${s.description}</p>
          <div style="margin-top:8px;">
            <a href="#" class="remover-spell" data-id="${s.id}">Remover</a>
            <a href="#" class="editar-spell" data-id="${s.id}" style="float:right;color:#2e7d32">Editar</a>
          </div>
        </div>
      </div>
    `;
}

/* ---------------- PARTE 1: RENDERIZAR LISTA DE MAGIAS ---------------- */

function renderSpells() {
  // Força o cálculo da DT antes de renderizar
  state.dtMagias = calculateSpellDC();

  const html = `
    <div class="spells-wrapper" style="position:relative;">
      <div class="spells-controls controls-row" style="margin-top:10px;">
        <input id="filterMagias" placeholder="Filtrar minhas magias" />
        <div class="right-controls">
          <button id="botAddSpell" class="btn-add">Nova Magia</button>
          
          <div class="dt-magias" id="btnOpenDTConfig" style="cursor:pointer;" title="Clique para configurar">
            <label style="cursor:pointer; color:#9c27b0;">DT DE MAGIAS ⚙️</label>
            <input id="dtMagiasInput" type="text" value="${state.dtMagias}" readonly 
                   style="cursor:pointer; font-weight:bold; color:#fff; text-align:center; min-width:80px;" />
          </div>
        </div>
      </div>
      <h4 style="margin:12px 0 6px 4px;color:#ddd;">Minhas Magias</h4>
      <div class="spells-list">
        ${state.spells.map(formatMySpellCard).join('')}
      </div>
    </div>
  `;
  conteudoEl.innerHTML = html;

  // 1. Re-conectar botões do topo
  const botAdd = document.getElementById('botAddSpell');
  const btnDT = document.getElementById('btnOpenDTConfig');

  if (botAdd) botAdd.addEventListener('click', () => openSpellCatalogOverlay());
  if (btnDT) btnDT.addEventListener('click', openDTConfigModal);

  // 2. Filtro de busca
  const filtro = document.getElementById('filterMagias');
  if (filtro) filtro.addEventListener('input', (e) => {
    const q = e.target.value.toLowerCase();
    document.querySelectorAll('.spell-card').forEach(card => {
      const title = card.querySelector('.spell-title').textContent.toLowerCase();
      card.style.display = title.includes(q) ? '' : 'none';
    });
  });

  // 3. Listeners dos Cards (Expandir, Ativar, Remover, EDITAR)
  document.querySelectorAll('.spell-card').forEach(card => {
    const id = Number(card.getAttribute('data-id'));
    const header = card.querySelector('.card-header');

    // Expandir/Recolher
    header.addEventListener('click', (ev) => {
      if (ev.target.closest('.spell-right') || ev.target.closest('.check-ativar') || ev.target.closest('.spell-activate')) return;
      const s = state.spells.find(x => x.id === id);
      if (s) {
        s.expanded = !s.expanded;
        renderSpells();
        saveStateToServer(); // Salva expansão
      }
    });

    // Checkbox de Preparar Magia
    const ch = card.querySelector('.spell-activate');
    if (ch) {
      ch.addEventListener('change', (ev) => {
        const s = state.spells.find(x => x.id === id);
        if (s) {
          s.active = ev.target.checked;
          saveStateToServer(); // Salva estado

          // Se a aba de preparadas estiver ativa, atualiza ela
          /* Opcional: renderPreparedSpells() se necessário */
        }
      });
      ch.addEventListener('click', ev => ev.stopPropagation());
    }
  });

  // Botão REMOVER
  document.querySelectorAll('.remover-spell').forEach(a => {
    a.addEventListener('click', (ev) => {
      ev.preventDefault();
      const id = Number(a.getAttribute('data-id'));
      state.spells = state.spells.filter(s => s.id !== id);
      renderSpells();
      saveStateToServer();
    });
  });

  // Botão EDITAR (Fundamental para abrir o modal)
  document.querySelectorAll('.editar-spell').forEach(a => {
    a.addEventListener('click', (ev) => {
      ev.preventDefault();
      const id = Number(a.getAttribute('data-id'));
      const s = state.spells.find(x => x.id === id);
      if (s) openSpellModal(s); // Abre o modal com os dados da magia
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

/* ---------------- MODAL MAGIA ---------------- */
function openSpellModal(existingSpell = null) {
  const modal = document.createElement('div');
  modal.className = 'spell-modal-overlay';
  modal.style.zIndex = '11000';

  modal.innerHTML = `
      <div class="spell-modal">
        <div class="modal-header">
          <h3>${existingSpell ? 'Editar Magia' : 'Novo Magia'}</h3>
          <div style="display:flex;gap:8px;align-items:center;">
            <button class="modal-close">✖</button>
          </div>
        </div>
        <div class="modal-body">
          <label>Nome*</label>
          <input id="modal-name" type="text" value="${existingSpell ? escapeHtml(existingSpell.name) : 'Nova Magia'}" />
          <div class="modal-row">
            <div>
              <label>Escola</label>
              <select id="modal-school">
                <option>Abjuração</option>
                <option>Conjuração</option>
                <option>Adivinhação</option>
                <option>Encantamento</option>
                <option>Evocação</option>
                <option>Ilusão</option>
                <option>Necromancia</option>
                <option>Transmutação</option>
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
              <div class="class-select-label">Escolha 1 classe</div>
            </div>
            <div>
              <label>Execução</label>
              <input id="modal-exec" type="text" value="${existingSpell && existingSpell.attrs && existingSpell.attrs.execucao ? escapeHtml(existingSpell.attrs.execucao) : 'padrão'}" />
            </div>
            <div>
              <label>Alcance</label>
              <input id="modal-alc" type="text" value="${existingSpell && existingSpell.attrs && existingSpell.attrs.alcance ? escapeHtml(existingSpell.attrs.alcance) : 'pessoal'}" />
            </div>
          </div>
          <div class="modal-row">
            <div>
              <label>Área</label>
              <input id="modal-area" type="text" value="${existingSpell && existingSpell.attrs && existingSpell.attrs.area ? escapeHtml(existingSpell.attrs.area) : ''}" />
            </div>
            <div>
              <label>Alvo</label>
              <input id="modal-alvo" type="text" value="${existingSpell && existingSpell.attrs && existingSpell.attrs.alvo ? escapeHtml(existingSpell.attrs.alvo) : ''}" />
            </div>
            <div>
              <label>Duração</label>
              <input id="modal-dur" type="text" value="${existingSpell && existingSpell.attrs && existingSpell.attrs.duracao ? escapeHtml(existingSpell.attrs.duracao) : ''}" />
            </div>
            <div>
              <label>Resistência</label>
              <input id="modal-res" type="text" value="${existingSpell && existingSpell.attrs && existingSpell.attrs.resistencia ? escapeHtml(existingSpell.attrs.resistencia) : ''}" />
            </div>
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
            <div>
              <label>Material</label>
              <input id="modal-material" type="text" value="${existingSpell && existingSpell.material ? escapeHtml(existingSpell.material) : ''}" />
            </div>
            <div style="flex:1">
              <label>Damage / Observações</label>
              <input id="modal-damage" type="text" value="${existingSpell && existingSpell.damage ? escapeHtml(existingSpell.damage) : ''}" />
            </div>
          </div>
          <label>Descrição</label>
          <textarea id="modal-desc">${existingSpell && existingSpell.description ? escapeHtml(existingSpell.description) : ''}</textarea>
        </div>
        <div class="modal-actions">
          <button class="btn-add btn-save-modal">${existingSpell ? 'Salvar' : 'Adicionar'}</button>
          <button class="btn-add btn-cancel">Cancelar</button>
        </div>
      </div>
    `;
  document.body.appendChild(modal);
  checkScrollLock(); // TRAVA SCROLL

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
    checkScrollLock(); // LIBERA SCROLL
  };
  modal.querySelector('.modal-close').addEventListener('click', closeModalClean);
  modal.querySelector('.btn-cancel').addEventListener('click', (ev) => { ev.preventDefault(); closeModalClean(); });

  const saveBtn = modal.querySelector('.btn-save-modal');
  if (saveBtn) {
    saveBtn.addEventListener('click', (ev) => {
      ev.preventDefault();
      const novo = {
        id: existingSpell ? existingSpell.id : uid(),
        name: modal.querySelector('#modal-name').value.trim() || 'Sem nome',
        levelNumber: Number(modal.querySelector('#modal-level').value) || 0,
        damage: modal.querySelector('#modal-damage').value.trim() || '-',
        expanded: true,
        active: existingSpell ? existingSpell.active : false,
        components: {
          V: modal.querySelector('#comp-v').checked,
          S: modal.querySelector('#comp-s').checked,
          M: modal.querySelector('#comp-m').checked
        },
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
        description: modal.querySelector('#modal-desc').value.trim()
      };
      if (existingSpell) {
        state.spells = state.spells.map(s => s.id === novo.id ? novo : s);
      } else {
        state.spells.unshift(novo);
      }
      document.removeEventListener('click', onDocClick);
      modal.remove();
      checkScrollLock(); // LIBERA SCROLL
      renderSpells();
      saveStateToServer(); // <--- SALVAR MAGIA EDITADA
    });
  }
}


/* ---------------- CATALOGO MAGIAS (CORRIGIDO PARA CLICAR EM TODO O HEADER) ---------------- */
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
          <input id="catalogLargeSearch" placeholder="Buscar no catálogo..." />
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

  // FILTROS DE CÍRCULO
  overlay.querySelectorAll('.circle-filter').forEach(btn => {
    btn.onclick = () => {
      overlay.querySelectorAll('.circle-filter').forEach(b => b.classList.remove('active'));
      btn.classList.add('active');
      const filter = btn.dataset.filter;
      overlay.querySelectorAll('.catalog-card-item').forEach(card => {
        card.style.display = (filter === 'all' || card.dataset.level === filter) ? '' : 'none';
      });
    };
  });

  // BUSCA
  overlay.querySelector('#catalogLargeSearch').oninput = (e) => {
    const q = e.target.value.toLowerCase();
    overlay.querySelectorAll('.catalog-card-item').forEach(it => {
      it.style.display = it.querySelector('.catalog-card-title').textContent.toLowerCase().includes(q) ? '' : 'none';
    });
  };

  // BOTÃO ADICIONAR (+)
  overlay.querySelectorAll('.catalog-add-btn').forEach(btn => {
    btn.onclick = (ev) => {
      ev.stopPropagation(); // Impede que o clique no botão expanda o card
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
    state.spells.unshift({ ...c, id: uid(), expanded: true, active: false, spellClass: classeFinal });
    renderSpells();
    saveStateToServer();
  }

  // --- LÓGICA DE EXPANDIR (CORRIGIDA PARA O HEADER INTEIRO) ---
  overlay.querySelectorAll('.catalog-card-header').forEach(header => {
    // Muda o cursor para indicar que é clicável
    header.style.cursor = 'pointer';

    header.addEventListener('click', (ev) => {
      // Se clicou no botão de adicionar ou dentro dele, não faz nada (o evento do botão já trata)
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
/* ---------------- MAGIAS E HABILIDADES PREPARADAS (COM PESQUISA) ---------------- */
function renderPreparedSpells() {
  const habilidadesPreparadas = state.abilities.filter(h => h.active);
  const magiasPreparadas = state.spells.filter(s => s.active);

  // Se não houver nada preparado, mostra o aviso e para por aqui
  if (!habilidadesPreparadas.length && !magiasPreparadas.length) {
    conteudoEl.innerHTML = `<div class="empty-tip">Nenhuma habilidade ou magia preparada/ativa no momento.</div>`;
    return;
  }

  // Gera HTML das Habilidades
  const habilidadesHTML = habilidadesPreparadas.map(a => `
    <div class="card hab-card ${a.expanded ? 'expanded' : ''}" data-id="${a.id}" data-type="hab">
      <div class="card-header">
        <div class="left" data-id="${a.id}">
          <span class="caret">${a.expanded ? '▾' : '▸'}</span>
          <div class="card-title" style="color:#b39cff;">${a.title} (Habilidade)</div>
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
      </div>
    </div>
  `).join('');

  // Gera HTML das Magias
  const magiasHTML = magiasPreparadas.map(formatMySpellCard).join('');

  // Monta o HTML final com a Barra de Pesquisa no topo
  const html = `
    <div class="controls-row">
      <input id="filterPrepared" placeholder="Filtrar preparados..." />
    </div>
    <h4 style="margin:10px 0 10px 4px;color:#ddd;">Preparadas</h4>
    <div class="spells-list">
      ${habilidadesHTML}
      ${magiasHTML}
    </div>
  `;

  conteudoEl.innerHTML = html;

  // --- Lógica de Filtro em Tempo Real ---
  const filtro = document.getElementById('filterPrepared');
  if (filtro) {
    filtro.addEventListener('input', (e) => {
      const q = e.target.value.toLowerCase();
      // Filtra tanto cards de habilidades quanto de magias
      conteudoEl.querySelectorAll('.hab-card, .spell-card').forEach(card => {
        const title = card.querySelector('.card-title').textContent.toLowerCase();
        card.style.display = title.includes(q) ? '' : 'none';
      });
    });
  }

  // --- Re-conectar Listeners de Eventos (Habilidades) ---
  conteudoEl.querySelectorAll('.hab-card').forEach(card => {
    const id = Number(card.getAttribute('data-id'));
    const header = card.querySelector('.card-header');

    header.addEventListener('click', (ev) => {
      if (ev.target.closest('.check-ativar') || ev.target.closest('.hab-activate')) return;
      const hab = state.abilities.find(h => h.id === id);
      if (hab) {
        hab.expanded = !hab.expanded;
        renderPreparedSpells();
      }
    });

    const ch = card.querySelector('.hab-activate');
    if (ch) {
      ch.addEventListener('change', (ev) => {
        const hab = state.abilities.find(h => h.id === id);
        if (hab) {
          hab.active = ev.target.checked;
          renderPreparedSpells();
          saveStateToServer();
        }
      });
    }
  });

  // --- Re-conectar Listeners de Eventos (Magias) ---
  conteudoEl.querySelectorAll('.spell-card').forEach(card => {
    const id = Number(card.getAttribute('data-id'));
    const header = card.querySelector('.card-header');

    header.addEventListener('click', (ev) => {
      if (ev.target.closest('.spell-right') || ev.target.closest('.check-ativar') || ev.target.closest('.spell-activate')) return;
      const s = state.spells.find(x => x.id === id);
      if (!s) return;
      s.expanded = !s.expanded;
      renderPreparedSpells();
    });

    const ch = card.querySelector('.spell-activate');
    if (ch) {
      ch.addEventListener('change', (ev) => {
        const s = state.spells.find(x => x.id === id);
        if (s) {
          s.active = ev.target.checked;
          renderPreparedSpells();
          saveStateToServer();
        }
      });
    }
  });
}


/* ---------------- CATALOGO DE ITENS (DESIGN UNIFICADO) ---------------- */

const ITEM_CATEGORIES = ['Armas', 'Armaduras', 'Utensílios', 'Conjuntos', 'Provisão'];

const ITEM_SUBCATEGORIES = {
  'Armas': ['Corpo-a-corpo', 'A distancia', 'Munição', 'Fora de epoca'],
  'Armaduras': ['Armaduras', 'Escudos'],
  'Utensílios': ['Utensílios gerais'],
  'Conjuntos': ['Kits', 'Pacotes', 'Ferramentas'],
  'Provisão': ['Comida', 'Transporte', 'Hospedagem']
};

window.openItemCatalogOverlay = () => {
  const existing = document.querySelector('.catalog-overlay-large-items');
  if (existing) existing.remove();

  let activeCat = 'Armas';
  let activeSub = 'Corpo-a-corpo';

  const overlay = document.createElement('div');
  overlay.className = 'catalog-overlay-large catalog-overlay-large-items';

  // Gera botões de categorias principais
  const catsHtml = ITEM_CATEGORIES.map((c, i) =>
    `<button class="ability-class-btn ${i === 0 ? 'active' : ''}" data-cat="${c}">${c}</button>`
  ).join('');

  overlay.innerHTML = `
      <div class="catalog-large" role="dialog" aria-modal="true" style="width:980px; max-width:calc(100% - 40px);">
        <div class="catalog-large-header" style="display:flex;justify-content:space-between;align-items:center;gap:12px;">
          <h3>Lista Padrão de Itens</h3>
          <div class="catalog-large-close" title="Fechar" style="cursor:pointer;">✖</div>
        </div>

        <div class="catalog-large-classes" id="item-cats-row">
          ${catsHtml}
        </div>

        <div id="item-subs-row" style="display:flex; gap:10px; flex-wrap:wrap; margin-top:8px; padding-bottom:6px;">
           </div>

        <div class="catalog-large-search" style="margin-top:6px;">
          <input id="catalogItemSearch" placeholder="Buscar no catálogo..." />
        </div>

        <div class="catalog-large-list item-list-large" style="margin-top:10px; overflow:auto; max-height:56vh;">
           </div>
      </div>
    `;

  document.body.appendChild(overlay);
  checkScrollLock();

  // Evento Fechar
  overlay.querySelector('.catalog-large-close').addEventListener('click', () => {
    overlay.remove();
    checkScrollLock();
  });

  // Renderiza as subcategorias (pills)
  function renderSubs() {
    const row = overlay.querySelector('#item-subs-row');
    const subs = ITEM_SUBCATEGORIES[activeCat] || [];

    if (subs.length === 0) {
      row.style.display = 'none';
    } else {
      row.style.display = 'flex';
      row.innerHTML = subs.map(s =>
        `<button class="ability-sub-btn ${s === activeSub ? 'active' : ''}" data-sub="${s}">${s}</button>`
      ).join('');
    }

    row.querySelectorAll('.ability-sub-btn').forEach(btn => {
      btn.onclick = () => {
        activeSub = btn.dataset.sub;
        renderSubs();
        renderList();
      };
    });
  }

  // Renderiza a lista de itens filtrada
  function renderList() {
    const container = overlay.querySelector('.item-list-large');
    const search = overlay.querySelector('#catalogItemSearch').value.toLowerCase();

    let items = itemCatalog.filter(i => i.category === activeCat);

    // Se houver subcategorias, filtra por elas. Se não (ex: Provisão genérica), mostra tudo da categoria.
    if (ITEM_SUBCATEGORIES[activeCat] && ITEM_SUBCATEGORIES[activeCat].length > 0) {
      items = items.filter(i => i.subcategory === activeSub);
    }

    if (search) {
      items = items.filter(i => i.name.toLowerCase().includes(search));
    }

    if (items.length === 0) {
      container.innerHTML = `<div style="color:#ddd;padding:18px;">Nenhum item encontrado nesta categoria.</div>`;
      return;
    }

    container.innerHTML = items.map(item => {
      // Formata os dados para exibição compacta no header
      let metaInfo = '';
      let highlightVal = ''; // Valor que aparece em roxo na direita

      if (item.category === 'Armas') {
        metaInfo = `${item.tipoArma || ''} • ${item.proficiency || ''}`;
        highlightVal = item.damage || '-';
      } else if (item.category === 'Armaduras') {
        metaInfo = `${item.tipoItem || ''} • ${item.proficiency || ''}`;
        highlightVal = item.defense ? `CA ${item.defense}` : '-';
      } else {
        metaInfo = item.subcategory || item.type || 'Item';
        highlightVal = '';
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
                        ${highlightVal ? `<div class="catalog-card-dmg" style="font-weight:800; color:#9c27b0; font-size:16px;">${highlightVal}</div>` : ''}
                        <button class="catalog-add-btn plus-btn" data-id="${item.id}" title="Adicionar" style="background:#9c27b0; border:none; color:#fff; width:38px; height:38px; border-radius:6px; font-size:20px; font-weight:bold; cursor:pointer; display:flex; align-items:center; justify-content:center;">+</button>
                    </div>
                </div>

                <div style="height:3px; background:#9c27b0; width: calc(100% - 24px); margin: 0 auto 8px auto; border-radius:2px;"></div>
                
                <div class="catalog-card-body" style="display:none; padding:0 12px 12px 12px; color:#ddd; font-size:14px; line-height:1.5;">
                    <div style="margin-bottom:8px; font-size:13px; color:#ccc; display:grid; grid-template-columns: 1fr 1fr; gap:4px;">
                        ${item.damage ? `<div><strong class="purple">Dano:</strong> ${item.damage} ${item.damageType ? `(${item.damageType})` : ''}</div>` : ''}
                        ${item.defense ? `<div><strong class="purple">Defesa:</strong> ${item.defense}</div>` : ''}
                        ${item.empunhadura ? `<div><strong class="purple">Empunhadura:</strong> ${item.empunhadura}</div>` : ''}
                        ${item.alcance ? `<div><strong class="purple">Alcance:</strong> ${item.alcance}</div>` : ''}
                        ${item.caracteristicas ? `<div style="grid-column: 1 / -1;"><strong class="purple">Propriedades:</strong> ${Array.isArray(item.caracteristicas) ? item.caracteristicas.join(', ') : item.caracteristicas}</div>` : ''}
                    </div>
                    <p style="margin:0; padding-top:8px; border-top:1px solid rgba(255,255,255,0.05);">${item.description || 'Sem descrição.'}</p>
                </div>
            </div>`;
    }).join('');

    // 1. Listener de Expandir (No Header inteiro, exceto botão +)
    container.querySelectorAll('.catalog-card-header').forEach(header => {
      header.addEventListener('click', (ev) => {
        if (ev.target.closest('.catalog-add-btn')) return; // Ignora clique no botão +

        const card = header.closest('.catalog-card-item');
        const body = card.querySelector('.catalog-card-body');
        const toggle = card.querySelector('.catalog-card-toggle');

        const isHidden = body.style.display === 'none';
        body.style.display = isHidden ? 'block' : 'none';
        toggle.textContent = isHidden ? '▾' : '▸';
      });
    });

    // 2. Listener de Adicionar (+)
    container.querySelectorAll('.catalog-add-btn').forEach(btn => {
      btn.addEventListener('click', (ev) => {
        ev.stopPropagation();
        adicionarItemDoCatalogo(btn.dataset.id);

        // Feedback visual
        const originalText = btn.textContent;
        btn.textContent = '✓';
        setTimeout(() => btn.textContent = originalText, 1000);
      });
    });
  }

  // Eventos das Categorias Principais
  overlay.querySelectorAll('.ability-class-btn').forEach(btn => {
    btn.onclick = () => {
      overlay.querySelectorAll('.ability-class-btn').forEach(b => b.classList.remove('active'));
      btn.classList.add('active');
      activeCat = btn.dataset.cat;
      // Tenta pegar a primeira subcategoria, ou string vazia se não houver
      activeSub = ITEM_SUBCATEGORIES[activeCat] ? ITEM_SUBCATEGORIES[activeCat][0] : '';
      renderSubs();
      renderList();
    };
  });

  overlay.querySelector('#catalogItemSearch').oninput = renderList;
  renderSubs();
  renderList();
};

// Função chamada pelo botão "+" do catálogo
window.adicionarItemDoCatalogo = (id) => {
  const i = itemCatalog.find(x => x.id === id);
  if (!i) return;

  // Objeto base
  let novoItem = {
    id: uid(),
    name: i.name,
    description: i.description || '',
    expanded: false,
    equip: false,
    type: 'Geral', // Default
    // Valores padrão vazios para evitar undefined
    damage: '', defense: '', proficiency: '', empunhadura: '',
    tipoArma: '', tipoItem: '', crit: '20', multiplicador: '2', alcance: '',
    acertoBonus: '', damageBonus: '', damageType: '', defenseBonus: '', defenseType: '',
    disadvantageSkill: [], advantageSkill: [], attunement: 'Não'
  };

  // Mapeamento OBRIGATÓRIO por categoria
  if (i.category === 'Armas') {
    novoItem.type = 'Arma';
    novoItem.proficiency = i.proficiency || 'Armas Simples';
    novoItem.tipoArma = i.tipoArma || 'Corpo a Corpo';
    novoItem.empunhadura = i.empunhadura || 'Uma mao';

    // Extras
    novoItem.damage = i.damage || '1d4';
    novoItem.damageTypes = i.damageType ? [i.damageType] : [];
    novoItem.alcance = i.alcance || '';
    novoItem.caracteristicas = i.caracteristicas || [];
  }
  else if (i.category === 'Armaduras') {
    novoItem.type = 'Proteção';
    novoItem.proficiency = i.proficiency || 'Leve';
    novoItem.tipoItem = i.tipoItem || (i.subcategory === 'Escudos' ? 'Escudo' : 'Armadura');

    // Extras
    novoItem.defense = i.defense || '+1';
    novoItem.minStrength = i.minStrength || 0;
    novoItem.disadvantageSkill = i.disadvantageSkill ? [i.disadvantageSkill] : [];
  }

  state.inventory.unshift(novoItem);
  renderInventory();
  saveStateToServer();
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
    type: 'Geral'
  };

  if (i.category === 'Armas') {
    novoItem.type = 'Arma';
    novoItem.damage = i.damage || '1d4';
    novoItem.proficiency = i.proficiency || 'Armas Simples'; // Obrigatório
    novoItem.tipoArma = i.tipoArma || 'Corpo a Corpo';      // Obrigatório
    novoItem.empunhadura = i.empunhadura || 'Uma mao';      // Obrigatório
  } else if (i.category === 'Armaduras') {
    novoItem.type = 'Proteção';
    novoItem.defense = i.defense || '10';
    novoItem.tipoItem = i.tipoItem || 'Armadura';           // Obrigatório (Armadura ou Escudo)
    novoItem.proficiency = i.proficiency || 'Leve';         // Obrigatório
  }

  state.inventory.unshift(novoItem);
  renderInventory();
  saveStateToServer();
  alert(i.name + " adicionado!");
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

  const overlay = document.createElement('div');
  overlay.className = 'catalog-overlay-large catalog-overlay-large-abilities';

  // Botões das classes (topo)
  const classesHtml = CLASSES_AVAILABLE.map(c =>
    `<button class="ability-class-btn ${c === activeClass ? 'active' : ''}" data-class="${c}">${c}</button>`
  ).join('');

  // Dentro da função openAbilityCatalogOverlay, mude a parte do innerHTML para:

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

          <div id="catalog-class-habilities-row" style="display:flex; margin-top:6px;"></div>
          <div id="catalog-subclasses-row" style="display:none; margin-top:8px; padding-bottom:6px;"></div>

          <div class="catalog-large-search" style="margin-top:6px;">
            <input id="catalogAbilitySearch" placeholder="Buscar habilidades..." />
          </div>
        </div>

        <div class="catalog-large-list abilities-list-large">
           </div>

      </div>
    `;

  document.body.appendChild(overlay);
  checkScrollLock();

  // Fechar
  overlay.querySelector('.catalog-large-close').onclick = () => { overlay.remove(); checkScrollLock(); };

  // Botão Criar Manual
  overlay.querySelector('#catalog-new-hab').onclick = () => {
    overlay.remove();
    openNewAbilityModal(null);
  };

  // Troca de Classe
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

    row.style.display = 'flex';
    row.innerHTML = `<button class="catalog-class-hability-pill ${activeClassHabilitySelected ? 'active' : ''}">Habilidades de ${activeClass}</button>`;

    row.querySelector('button').onclick = function () {
      activeClassHabilitySelected = true;
      activeSubclass = null;
      this.classList.add('active');
      overlay.querySelectorAll('.ability-sub-btn').forEach(b => b.classList.remove('active'));
      renderCatalogList();
    };
  }

  function renderSubclassesRow() {
    const row = overlay.querySelector('#catalog-subclasses-row');
    const subs = CLASSES_WITH_SUBCLASSES[activeClass] || [];

    if (!subs.length) { row.style.display = 'none'; return; }

    row.style.display = 'flex';
    row.innerHTML = subs.map(s => `<button class="ability-sub-btn" data-sub="${s}">${s}</button>`).join('');

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

  function renderCatalogList() {
    const container = overlay.querySelector('.abilities-list-large');
    const q = overlay.querySelector('#catalogAbilitySearch').value.toLowerCase();

    // Filtros
    let items = abilityCatalog.filter(it => {
      if (activeClass) {
        if (activeClassHabilitySelected) {
          if (it.class !== activeClass || (it.subclass && it.subclass !== '')) return false;
        } else if (activeSubclass) {
          if (it.class !== activeClass || it.subclass !== activeSubclass) return false;
        }
      }
      if (q && !it.name.toLowerCase().includes(q) && !it.description.toLowerCase().includes(q)) return false;
      return true;
    });

    if (!items.length) {
      container.innerHTML = `<div style="color:#ddd;padding:18px;">Nenhuma habilidade encontrada.</div>`;
      return;
    }

    container.innerHTML = items.map(c => formatCatalogAbilityCard(c)).join('');

    // --- CORREÇÃO AQUI: LISTENER NA ÁREA ESQUERDA INTEIRA ---
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

    // Listener Botão Adicionar (+)
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
          expanded: true,
          class: c.class || '',
          subclass: c.subclass || '',
          active: false
        };

        state.abilities.unshift(novo);
        renderAbilities();
        saveStateToServer();

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

function openNewAbilityModal(existingAbility = null) {
  const modal = document.createElement('div');
  modal.className = 'spell-modal-overlay';
  modal.style.zIndex = '11000';
  modal.innerHTML = `
      <div class="spell-modal" style="width:760px; max-width:calc(100% - 40px);">
        <div class="modal-header">
          <h3>${existingAbility ? 'Editar Habilidade' : 'Nova Habilidade'}</h3>
          <button class="modal-close">✖</button>
        </div>

        <div class="modal-body">
          <label>Nome*</label>
          <input id="hab-name" type="text" value="${existingAbility ? escapeHtml(existingAbility.title) : 'Nova Habilidade'}" />

          <label>Descrição*</label>
          <textarea id="hab-desc" style="min-height:140px;">${existingAbility ? escapeHtml(existingAbility.description) : 'Minha nova habilidade'}</textarea>
        </div>

        <div class="modal-actions">
          <button class="btn-add btn-save-hab">${existingAbility ? 'Salvar' : 'Adicionar'}</button>
          <button class="btn-add btn-cancel-hab">Cancelar</button>
        </div>
      </div>
    `;

  document.body.appendChild(modal);
  checkScrollLock(); // TRAVA SCROLL

  const closeAll = () => {
    modal.remove();
    checkScrollLock(); // LIBERA SCROLL
  };
  modal.querySelector('.modal-close').addEventListener('click', closeAll);
  modal.querySelector('.btn-cancel-hab').addEventListener('click', (ev) => { ev.preventDefault(); closeAll(); });

  modal.querySelector('.btn-save-hab').addEventListener('click', (ev) => {
    ev.preventDefault();
    const nome = modal.querySelector('#hab-name').value.trim() || 'Habilidade sem nome';
    const desc = modal.querySelector('#hab-desc').value.trim() || '';
    const cls = '';
    const sub = '';

    if (existingAbility) {
      state.abilities = state.abilities.map(h => h.id === existingAbility.id ? { ...h, title: nome, description: desc, class: cls, subclass: sub } : h);
    } else {
      state.abilities.unshift({ id: uid(), title: nome, description: desc, expanded: true, class: cls, subclass: sub });
    }

    closeAll();
    renderAbilities();
    saveStateToServer(); // <--- SALVAR
  });
}

/* ---------------- DESCRIÇÃO ---------------- */
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
        <label>Objetivo</label>
        <textarea id="desc-objetivo" placeholder="Objetivos...">${d.objetivo}</textarea>
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

  // Lógica de Auto-Resize e Auto-Save
  const textareas = conteudoEl.querySelectorAll('textarea');

  textareas.forEach(tx => {
    // Função que ajusta altura baseada no conteúdo
    const autoResize = () => {
      // Pequeno truque: reseta altura para calcular o scrollHeight corretamente
      // mas verificamos se o usuário está diminuindo manualmente através do evento
      tx.style.height = 'auto';
      tx.style.height = (tx.scrollHeight + 2) + 'px';
    };

    // Ajusta tamanho inicial ao carregar a aba
    autoResize();

    // Evento ao digitar
    tx.addEventListener('input', () => {
      autoResize();

      // Salvar automático no state
      const key = tx.id.replace('desc-', '');
      if (state.description.hasOwnProperty(key)) {
        state.description[key] = tx.value;
        saveStateToServer(); // <--- SALVAR AO DIGITAR
      }
    });

    // O navegador lida com o redimensionamento manual via CSS (resize: vertical).
    // O overflow-y: auto garante o scroll se o usuário forçar um tamanho pequeno.
  });
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

document.addEventListener('DOMContentLoaded', initAbas);

function escapeHtml(str) {
  if (str === 0) return '0';
  if (!str) return '';
  return String(str).replaceAll('&', '&amp;').replaceAll('<', '&lt;').replaceAll('>', '&gt;').replaceAll('"', '&quot;').replaceAll("'", '&#39;');
}


/* ---------------- POPUP DE SELEÇÃO DE CLASSE ---------------- */
function abrirPopupSelecaoClasse(classes, callback) {
  const overlay = document.createElement('div');
  overlay.style = `
        position: fixed; inset: 0; background: rgba(0,0,0,0.85); 
        display: flex; align-items: center; justify-content: center; 
        z-index: 20000; font-family: sans-serif;
    `;

  const content = document.createElement('div');
  content.style = `
        background: #1a1a1a; padding: 25px; border-radius: 8px; 
        border: 2px solid #9c27b0; text-align: center; width: 300px;
        box-shadow: 0 0 20px rgba(156,39,176,0.4);
    `;

  content.innerHTML = `
        <h4 style="color: #fff; margin-bottom: 15px;">Escolha a Classe</h4>
        <p style="color: #bbb; font-size: 13px; margin-bottom: 20px;">Esta magia pertence a múltiplas classes. Qual você deseja usar?</p>
        <div id="class-buttons-container" style="display: flex; flex-direction: column; gap: 10px;"></div>
    `;

  overlay.appendChild(content);
  document.body.appendChild(overlay);

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
      callback(cls);
      overlay.remove();
    };
    container.appendChild(btn);
  });
}
/* =============================================================
   OBSERVADORES: Atualiza a DT assim que a Esquerda muda
   (ATUALIZADO COM TODOS OS ATRIBUTOS)
============================================================= */
document.addEventListener("DOMContentLoaded", () => {

  const atualizarDTVisual = () => {
    state.dtMagias = calculateSpellDC();
    const input = document.getElementById('dtMagiasInput');
    if (input) input.value = state.dtMagias;
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

  // 3. Atualiza ao carregar e ao ganhar foco
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