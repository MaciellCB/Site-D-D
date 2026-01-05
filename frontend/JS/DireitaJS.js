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
  'Artífice': ['Alquimista', 'Armeiro', 'Artilheiro', 'Ferreiro de Batalha','Arquivista', 'Infusão'],
  'Bárbaro': ['Caminho do Berserker', 'Caminho do Guerreiro Totêmico', 'Caminho do Guardião Ancestral','Caminho da Alma Selvagem', 'Caminho do Arauto da Tempestade', 'Caminho do Fanático', 'Caminho da Besta', 'Caminho da Magia Selvagem'],
  'Bardo': ['Colégio do Conhecimento','Colégio da Criação', 'Colégio da Bravura', 'Colégio do Glamour', 'Colégio das Espadas', 'Colégio dos Sussurros', 'Colégio da Criação', 'Colégio da Eloquência', 'Colégio dos Espíritos'],
  'Bruxo': ['O Arquifada', 'O Corruptor', 'O Grande Antigo', 'O Celestial', 'Hexblade', 'O Insondável', 'O Gênio','A Luz Imortal', 'O Morto-Vivo', 'Shinigami', 'Fantasma do Maquinario','O Buscador' ],
  'Blood Hunter': ['Ordem do Caça-Fantasmas', 'Ordem do Licantropo', 'Ordem do Mutante', 'Ordem da Alma Profana','Maldições de Sangue'],
  'Clérigo': ['Domínio do Conhecimento', 'Domínio da Vida', 'Domínio da Luz','Domínio do Zelo', 'Domínio da Natureza','Domínio do Destino','Domínio da Solidariedade', 'Domínio da Tempestade','Domínio da Cidade ','Domínio da Força','Domínio da Unidade','Domínio da Ambição', 'Domínio da Enganação','Domínio de Proteção', 'Domínio da Guerra','Domínio do Crepúsculo', 'Domínio da Forja', 'Domínio da Sepultura', 'Domínio da Ordem', 'Domínio da Paz', 'Domínio do Crepúsculo', 'Domínio Arcano', 'Domínio da Morte'],
  'Druida': ['Círculo da Terra', 'Círculo da Lua', 'Círculo dos Sonhos', 'Círculo do Pastor', 'Círculo dos Esporos', 'Círculo das Estrelas', 'Círculo do Fogo Selvagem','Círculo do Primordial', 'Círculo do Crepúsculo'],
  'Feiticeiro': ['Linhagem Dracônica', 'Magia Selvagem', 'Alma Divina', 'Magia das Sombras', 'Mente Sombria', 'Feitiçaria da Tempestade','Mente Marinha','Feitiçaria de Pedra', 'Feitiçaria da Fênix', 'Alma Gigante', 'Alma Piromantica', 'Mente Aberrante','Alma Psiônica', 'Alma Lunar','Alma Favorecida', 'Alma do Relógio', 'Alma Mecânica', ],
  'Guerreiro': ['Campeão', 'Mestre de Batalha', 'Cavaleiro Arcano','Porta-Estandarte', 'Arqueiro Arcano','Brutamontes', 'Cavaleiro', 'Samurai', 'Guerreiro Psiônico', 'Cavaleiro Rúnico', 'Cavaleiro do Eco', 'Atirador de Elite'],
  'Ladino': ['Ladrão', 'Assassino', 'Trapaceiro Arcano', 'Inquisitivo', 'Mestre do Crime','Espadachim', 'Batedor','Revivido', 'Fantasma', 'Lâmina da Alma'],
  'Mago': ['Abjuração', 'Conjuração', 'Adivinhação', 'Encantamento', 'Evocação', 'Ilusão','Cronurgia', 'Necromancia', 'Criador de Runas','Tecnomancia', 'Teurgia', 'Transmutação','Graviturgia', 'Mago de Guerra', 'Cantor da Lâmina', 'Ordem dos Escribas'],
  'Monge': ['Caminho da Mão Aberta', 'Caminho das Sombras', ,'Caminho da Tranquilidade','Caminho dos Quatro Elementos', 'Longa Morte', 'Kensei', 'Mestre Bêbado', 'Alma Solar', 'Misericórdia', 'Forma Astral', 'Dragão Ascendente'],
  'Paladino': ['Juramento dos Anciões','Juramento da Conquista','Juramento da Coroa','Juramento de Devoção','Juramento de Glória', 'Juramento de Redenção','Juramento de Vingança', 'Juramento dos Observadores','Quebrador de Juramento','Juramento da Traição','Juramento de Heroísmo', ''],
  'Patrulheiro': ['Caçador', 'Mestre das Feras','Guardião Primordial','Guardião Dracônico', 'Perseguidor Sombrio', 'Andarilho do Horizonte', 'Matador de Monstros', 'Peregrino Feérico', 'Guardião do Enxame', 'Guardião Dracônico'],
  'Antecedentes': ['Acólito', "Artesão de Guilda",'Artista',"Charlatão","Criminoso","Eremita","Forasteiro","Herói Popular","Marinheiro","Morador de Rua","Nobre", "Sábio", "Soldado",   ],
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

// Escuta atualizações do lado Esquerdo e Inventário
window.addEventListener('sheet-updated', () => {
  // 1. Atualiza DT Magias
  state.dtMagias = calculateSpellDC();
  const inputDT = document.getElementById('dtMagiasInput');
  if (inputDT) inputDT.value = state.dtMagias;

  // 2. Atualiza Classe de Armadura (CA)
  const armorClass = calculateArmorClass();
  
  // Tenta encontrar o elemento onde a CA é exibida
  // Prioridade: ID direto > Classe do Hexagrama > Input genérico
  const inputCA = document.getElementById('caTotal') || document.querySelector('.hexagrama-ca .valor');
  
  if (inputCA) {
      if (inputCA.tagName === 'INPUT') {
          inputCA.value = armorClass;
      } else {
          inputCA.textContent = armorClass;
      }
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

/* ---------------- INVENTÁRIO (CORRIGIDO PARA EXIBIR HTML) ---------------- */
function formatInventoryItem(item) {
  let subTitle = '';
  let rightSideHtml = '';
  const caretSymbol = item.expanded ? '▾' : '▸';

  if (item.type === 'Arma') {
    subTitle = [item.proficiency, item.tipoArma].filter(Boolean).join(' • ');

    // LÓGICA VERSÁTIL
    let baseDamage = item.damage;
    if (item.empunhadura === 'Versátil' && item.useTwoHands && item.damage2Hands) {
        baseDamage = item.damage2Hands;
    }

    let dmgParts = [baseDamage];
    if (item.moreDmgList) {
      item.moreDmgList.forEach(m => { if (m.dano) dmgParts.push(m.dano); });
    }
    const finalDamage = dmgParts.join(' + ') || '-';

    // LÓGICA DE FONTE DINÂMICA
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

    bodyContent = `
      <div class="item-stats-row">${statsHTML}${empHTML}</div>
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
    bodyContent = `
       <div class="item-stats-row">
          ${item.defense ? `<div><span class="purple-label">Defesa:</span> <span class="white-val bold">${item.defense}</span></div>` : ''}
          ${item.minStrength ? `<div><span class="purple-label">Mín. FOR:</span> <span class="white-val">${item.minStrength}</span></div>` : ''}
       </div>
    `;
  }

  // --- CORREÇÃO AQUI: Removemos o escapeHtml() ---
  // Agora o HTML salvo (negrito, cores, listas) será interpretado pelo navegador
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

/* ---------------- EVENTOS DO INVENTÁRIO (ATUALIZADO) ---------------- */
function bindInventoryCardEvents() {
  // Expandir Card
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

  // Checkbox "Versátil" (2 Mãos)
  document.querySelectorAll('.toggle-versatile').forEach(chk => {
    chk.addEventListener('change', (ev) => {
      const id = Number(ev.target.getAttribute('data-id'));
      const item = state.inventory.find(x => x.id === id);
      if (item) {
        item.useTwoHands = ev.target.checked;
        saveStateToServer();
        renderActiveTab(); 
      }
    });
    chk.addEventListener('click', ev => ev.stopPropagation());
  });

  // Checkbox "Equipar" (CRÍTICO PARA A CA)
  document.querySelectorAll('.item-equip-checkbox').forEach(ch => {
    ch.addEventListener('change', (ev) => {
      ev.stopPropagation();
      const id = Number(ev.target.getAttribute('data-id'));
      const item = state.inventory.find(x => x.id === id);

      if (item && ev.target.checked) {
        // Lógica de exclusividade (se equipar uma armadura, tira a outra)
        if (item.type === 'Proteção' || item.type === 'protecao') {
          const isEscudo = item.tipoItem?.toLowerCase() === 'escudo' || item.proficiency?.toLowerCase() === 'escudo';

          state.inventory.forEach(i => {
            if (i.id !== id && (i.type === 'Proteção' || i.type === 'protecao')) {
              const otherIsEscudo = i.tipoItem?.toLowerCase() === 'escudo' || i.proficiency?.toLowerCase() === 'escudo';
              
              // Se é o mesmo tipo (armadura com armadura, escudo com escudo), desequipa o antigo
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
        
        // --- O SEGREDO ESTÁ AQUI ---
        // Renderiza a aba atual (para atualizar visual dos checks)
        renderActiveTab();
        // E FORÇA a esquerda a recalcular a CA imediatamente
        window.dispatchEvent(new CustomEvent('sheet-updated'));
        // ---------------------------
      }
    });
    ch.addEventListener('click', ev => ev.stopPropagation());
  });

  // Remover Item
  document.querySelectorAll('.remover-item').forEach(el => {
    el.addEventListener('click', (ev) => {
      ev.preventDefault();
      const id = Number(el.getAttribute('data-id'));
      state.inventory = state.inventory.filter(i => i.id !== id);
      renderActiveTab();
      saveStateToServer();
      window.dispatchEvent(new CustomEvent('sheet-updated')); // Atualiza CA se remover armadura equipada
    });
  });

  // Editar Item
  document.querySelectorAll('.editar-item').forEach(el => {
    el.addEventListener('click', (ev) => {
      ev.preventDefault();
      const id = Number(el.getAttribute('data-id'));
      const it = state.inventory.find(i => i.id === id);
      if (it) openItemModal(it);
    });
  });

  // Botões gerais
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
      modal.remove(); 
      checkScrollLock();
      openItemCatalogOverlay(); 
    });
  }
  checkScrollLock();

  const contentBody = modal.querySelector('#modal-content-body');
  const btns = modal.querySelectorAll('.modal-tab-btn');

  // ... (código do renderPericiaMulti se mantém igual, ou pode ser movido para fora) ...
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

    // Prepara o editor de texto
    const descContent = pre.description || '';
    const editorHTML = createRichEditorHTML(descContent, 'item-editor-content');

    let html = '';

    // Lógica dos inputs (simplificada para focar na mudança da descrição)
    // Mantendo estrutura original mas substituindo o textarea pelo editorHTML
    
    // CAMPOS COMUNS
    const nameInput = `<div style="grid-column: 1 / -1;"><label>Nome*</label><input id="item-name" type="text" value="${escapeHtml(pre.name || '')}" placeholder="Nome do item" /></div>`;
    const descLabel = `<div style="grid-column: 1 / -1;"><label>Descrição</label>${editorHTML}</div>`;

    if (tab === 'Item') {
      const disadv = Array.isArray(pre.disadvantageSkill) ? pre.disadvantageSkill : (pre.disadvantageSkill ? [pre.disadvantageSkill] : []);
      const adv = Array.isArray(pre.advantageSkill) ? pre.advantageSkill : (pre.advantageSkill ? [pre.advantageSkill] : []);

      html = `
         <div style="display:grid; grid-template-columns: 1fr 1fr 1fr; gap:12px; align-items:end;">
            ${nameInput}
            <div><label>Acerto Bonus</label><input id="item-acerto" type="text" value="${escapeHtml(pre.acertoBonus || '')}" /></div>
            <div><label>Dano Bonus</label><input id="item-danobonus" type="text" value="${escapeHtml(pre.damageBonus || '')}" /></div>
            <div><label>Tipo de Dano</label><input id="item-dmgtype" type="text" value="${escapeHtml(pre.damageType || '')}" /></div>
            <div style="grid-column: 1 / span 1;"><label>Defesa(CA) Bonus</label><input id="item-defense" type="text" value="${escapeHtml(pre.defenseBonus || '')}" /></div>
            <div style="grid-column: 2 / span 2;"><label>Tipo de Defesa</label><input id="item-defensetype" type="text" value="${escapeHtml(pre.defenseType || 'Geral')}" /></div>
            <div style="grid-column: 1 / span 1.5;"><label>Desvantagem</label>${renderPericiaMulti('disadv-field-item', disadv)}</div>
            <div style="grid-column: 2.5 / span 1.5;"><label>Vantagem</label>${renderPericiaMulti('adv-field-item', adv)}</div>
            ${descLabel}
         </div>`;
    } 
    else if (tab === 'Arma') {
      // (Lógica da Arma mantida, só a descrição muda)
      const profSelected = pre.proficiency || '';
      const tipoSelected = pre.tipoArma || '';
      const empSelected = pre.empunhadura || '';
      const carSelected = pre.caracteristicas || [];
      const dmgTypesSelected = pre.damageTypes || [];

      html = `
        <div style="display:grid; grid-template-columns: 1fr 1fr 1fr 1fr; gap:12px; align-items:start;">
          <div style="grid-column: 1 / span 4;"><label>Nome*</label><input id="item-name" type="text" value="${escapeHtml(pre.name || 'Nova Arma')}" /></div>
          
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
          <div style="grid-column: 4 / span 1;">
             <label>Sintonização</label>
             <select id="item-attune-weapon" class="dark-select">
                <option value="Não" ${pre.attunement !== 'Sim' ? 'selected' : ''}>Não</option>
                <option value="Sim" ${pre.attunement === 'Sim' ? 'selected' : ''}>Sim</option>
             </select>
          </div>

          <div style="grid-column: 1 / span 4;">
             <div id="extra-dmg-list" style="display:flex; flex-direction:column; gap:8px;"></div>
             <button type="button" id="btn-add-dmg" style="margin-top:8px; background:#9c27b0; color:white; border:none; padding:6px 12px; border-radius:4px; font-weight:bold; cursor:pointer;">+ Adicionar Dano Extra</button>
          </div>

          <div style="grid-column:1 / span 4;"><label>Descrição</label>${editorHTML}</div>
        </div>
      `;
    } 
    else if (tab === 'Armadura') {
      const profSelected = pre.proficiency || '';
      const tipoSelected = pre.tipoItem || 'Armadura';
      const minReqAttrs = pre.minReqAttrs || ['Força'];
      const disadv = Array.isArray(pre.disadvantageSkill) ? pre.disadvantageSkill : (pre.disadvantageSkill ? [pre.disadvantageSkill] : []);
      const adv = Array.isArray(pre.advantageSkill) ? pre.advantageSkill : (pre.advantageSkill ? [pre.advantageSkill] : []);

      html = `
        <div style="display:grid; grid-template-columns: 1.2fr 0.8fr 1.2fr; gap:12px; align-items:start;">
           <div style="grid-column: 1 / span 3;"><label>Nome*</label><input id="item-name" type="text" value="${escapeHtml(pre.name || 'Nova Armadura')}" /></div>
           
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
                        ${ATRIBUTOS_DND.map(attr => `
                           <label style="display:block;padding:6px;cursor:pointer;"><input type="checkbox" value="${attr}" ${minReqAttrs.includes(attr) ? 'checked' : ''} /> ${attr}</label>
                        `).join('')}
                     </div>
                  </div>
                  <input id="item-minstr" type="number" value="${pre.minStrength || 0}" style="margin-top:4px; width:100%;" />
               </div>
               <div><label>Sintonização</label><select id="item-attune" class="dark-select"><option value="Não" ${pre.attunement !== 'Sim' ? 'selected' : ''}>Não</option><option value="Sim" ${pre.attunement === 'Sim' ? 'selected' : ''}>Sim</option></select></div>
               <div><label>Desvantagem</label>${renderPericiaMulti('disadv-field', disadv)}</div>
               <div><label>Vantagem</label>${renderPericiaMulti('adv-field', adv)}</div>
           </div>
           <div style="grid-column: 1 / span 3;">
             <label>Descrição</label>
             ${editorHTML}
           </div>
        </div>
       `;
    }

    contentBody.innerHTML = html;
    bindTabEvents(tab);
    
    // --- INICIALIZA OS EVENTOS DO EDITOR RICO ---
    initRichEditorEvents('item-editor-content');
  }

  // (Mantenha a função createDamageRow igual...)
  function createDamageRow(danoVal = '', typesVal = []) {
      // ... seu código existente para createDamageRow ...
      const row = document.createElement('div');
      row.className = 'extra-dmg-row';
      row.style.display = 'grid';
      row.style.gridTemplateColumns = '1fr 1fr 1fr 1fr';
      row.style.gap = '12px';
      row.style.alignItems = 'start';
      const html = `<div style="grid-column:1/span 2;"><input type="text" class="extra-dmg-input" value="${escapeHtml(danoVal)}" placeholder="Ex: +1d6"/></div>
      <div style="grid-column:3/span 2;position:relative;" class="extra-dmg-select-container"><div class="multi-select-field"><div class="display"><span>${typesVal.length ? typesVal.join(', ') : 'Tipo'}</span> <span style="color:#9c27b0;">▾</span></div><div class="panel" style="display:none;position:absolute;z-index:12000;width:100%;">${TIPOS_DANO.map(c => `<label style="display:block;padding:6px;"><input type="checkbox" value="${c}" ${typesVal.includes(c) ? 'checked' : ''} /> ${c}</label>`).join('')}</div></div><button type="button" class="remove-dmg-row" style="position:absolute;right:-25px;top:5px;background:none;border:none;color:#d88;font-weight:bold;cursor:pointer;">✖</button></div>`;
      row.innerHTML = html;
      const field = row.querySelector('.multi-select-field'); const display = field.querySelector('.display'); const panel = field.querySelector('.panel');
      display.addEventListener('click', (e) => { e.stopPropagation(); const isOpen = panel.style.display === 'block'; document.querySelectorAll('.panel').forEach(p => p.style.display = 'none'); panel.style.display = isOpen ? 'none' : 'block'; });
      panel.querySelectorAll('input').forEach(chk => { chk.addEventListener('change', () => { const vals = Array.from(panel.querySelectorAll('input:checked')).map(x => x.value); display.querySelector('span').textContent = vals.length ? vals.join(', ') : 'Tipo'; }); });
      row.querySelector('.remove-dmg-row').addEventListener('click', () => row.remove());
      return row;
  }
  
  // (Mantenha bindTabEvents igual...)
  function bindTabEvents(tab) { /* ... Código existente do bindTabEvents ... */ 
      // ... Copie o conteúdo da sua função bindTabEvents anterior aqui, é grande, mas essencial ...
      // Certifique-se de que a lógica de "Versátil" etc continua funcionando.
      // Vou resumir para não estourar, mas você deve manter a lógica que já tem.
      modal.querySelectorAll('.pill.single-select').forEach(p => { p.addEventListener('click', () => { p.parentElement.querySelectorAll('.pill').forEach(x => x.classList.remove('active')); p.classList.add('active'); }); });
      modal.querySelectorAll('.multi-select-field').forEach(field => { if (field.id === 'dmg-field' || field.closest('.extra-dmg-row')) return; let trigger = field.querySelector('.label-dropdown-trigger') || field.querySelector('.display'); const panel = field.querySelector('.panel'); trigger.onclick = (e) => { e.stopPropagation(); const isOpen = panel.style.display === 'block'; document.querySelectorAll('.panel').forEach(p => p.style.display = 'none'); panel.style.display = isOpen ? 'none' : 'block'; }; panel.querySelectorAll('input[type="checkbox"]').forEach(chk => { chk.onchange = () => { const vals = Array.from(panel.querySelectorAll('input:checked')).map(x => x.value); const span = trigger.querySelector('span:first-child') || modal.querySelector('#min-req-label-text'); if(span) span.textContent = vals.length ? vals.join(', ') : (field.id === 'min-req-container' ? '' : 'Selecione...'); }; }); });
      if (tab === 'Arma') {
        // ... (Lógica da Arma: Versátil, Dano principal, Botão Adicionar Dano) ...
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
            if (isVersatil) {
                layoutStd.style.display = 'none'; layoutVer.style.display = 'contents';
                if (containerVer) containerVer.appendChild(dmgWrapper);
                if (inputDanoPrincipal.value) inputDano1Mao.value = inputDanoPrincipal.value;
            } else {
                layoutStd.style.display = 'contents'; layoutVer.style.display = 'none';
                if (containerStd) containerStd.appendChild(dmgWrapper);
                if (inputDano1Mao.value) inputDanoPrincipal.value = inputDano1Mao.value;
            }
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
    
    // --- MUDANÇA: LER DO EDITOR RICO ---
    const desc = document.getElementById('item-editor-content').innerHTML;

    let newItem = {
      id: existingItem ? existingItem.id : uid(),
      name: name,
      description: desc,
      expanded: true,
      equip: existingItem ? !!existingItem.equip : false
    };
    
    // ... (Restante da lógica de salvamento igual) ...
    // Vou incluir para garantir a integridade
    if (currentTab === 'Item') {
      newItem.type = 'Geral'; newItem.isEquipable = true;
      newItem.acertoBonus = modal.querySelector('#item-acerto').value;
      newItem.damageBonus = modal.querySelector('#item-danobonus').value;
      newItem.damageType = modal.querySelector('#item-dmgtype').value;
      newItem.defenseBonus = modal.querySelector('#item-defense').value;
      newItem.defenseType = modal.querySelector('#item-defensetype').value;
      const disPanel = modal.querySelector('#disadv-field-item .panel'); newItem.disadvantageSkill = disPanel ? Array.from(disPanel.querySelectorAll('input:checked')).map(x => x.value) : [];
      const advPanel = modal.querySelector('#adv-field-item .panel'); newItem.advantageSkill = advPanel ? Array.from(advPanel.querySelectorAll('input:checked')).map(x => x.value) : [];
    }
    else if (currentTab === 'Arma') {
      newItem.type = 'Arma'; newItem.isEquipable = true;
      const profEl = modal.querySelector('#prof-pills .active'); newItem.proficiency = profEl ? profEl.getAttribute('data-val') : '';
      const tipoEl = modal.querySelector('#tipo-pills .active'); newItem.tipoArma = tipoEl ? tipoEl.getAttribute('data-val') : '';
      const empEl = modal.querySelector('#emp-pills .active'); newItem.empunhadura = empEl ? empEl.getAttribute('data-val') : '';
      newItem.crit = modal.querySelector('#item-crit').value; newItem.multiplicador = modal.querySelector('#item-mult').value; newItem.alcance = modal.querySelector('#item-range').value;
      const attuneEl = modal.querySelector('#item-attune-weapon'); newItem.attunement = attuneEl ? attuneEl.value : 'Não';
      newItem.damage = modal.querySelector('#item-damage').value;
      newItem.damage2Hands = modal.querySelector('#item-damage-2hands') ? modal.querySelector('#item-damage-2hands').value : '';
      newItem.useTwoHands = existingItem ? !!existingItem.useTwoHands : false;
      const carPanel = modal.querySelector('#car-panel'); if (carPanel) newItem.caracteristicas = Array.from(carPanel.querySelectorAll('input:checked')).map(x => x.value);
      const dmgPanel = modal.querySelector('#dmg-panel'); if (dmgPanel) newItem.damageTypes = Array.from(dmgPanel.querySelectorAll('input:checked')).map(x => x.value);
      const extraRows = modal.querySelectorAll('.extra-dmg-row'); newItem.moreDmgList = []; extraRows.forEach(row => { const d = row.querySelector('.extra-dmg-input').value; const p = row.querySelector('.panel'); const t = Array.from(p.querySelectorAll('input:checked')).map(x => x.value); if (d || t.length) newItem.moreDmgList.push({ dano: d, types: t }); });
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

function renderAbilities() {
    const termoBusca = (document.getElementById('filterHabs')?.value || '').toLowerCase();

    // 1. Filtra a lista
    let habilidadesFiltradas = state.abilities.filter(a => {
        const text = (a.title + (a.description || "")).toLowerCase();
        return text.includes(termoBusca);
    });

    // 2. Estrutura de Agrupamento
    const grupos = {
        classes: {},     // { "Guerreiro": [...], "Mago": [...] }
        talentos: [],
        origem: [],      // Raça e Antecedentes
        outros: []
    };

    // 3. Distribuição (Lógica Reforçada)
    habilidadesFiltradas.forEach(hab => {
        const cat = (hab.category || "").toLowerCase().trim();
        const classeOriginal = (hab.class || "").trim(); // Mantém maiúsculas para o título
        const classeLower = classeOriginal.toLowerCase();

        // --- CHECAGEM DE CLASSE ---
        // Verifica se a categoria é 'classe' OU se o nome da classe está na lista padrão
        if (cat === 'classe' || LISTA_CLASSES_RPG.includes(classeOriginal)) {
            // Se o nome da classe estiver vazio, joga para "Geral" dentro de classes
            const nomeGrupo = classeOriginal || "Classe Indefinida";
            
            if (!grupos.classes[nomeGrupo]) grupos.classes[nomeGrupo] = [];
            grupos.classes[nomeGrupo].push(hab);
        }
        // --- CHECAGEM DE TALENTOS ---
        else if (cat.includes('talento') || classeLower === 'talentos' || classeLower === 'talento') {
            grupos.talentos.push(hab);
        }
        // --- CHECAGEM DE ORIGEM (Antecedente/Raça) ---
        else if (
            cat.includes('antecedente') || cat.includes('raça') || cat.includes('raca') ||
            classeLower === 'antecedente' || classeLower === 'raça'
        ) {
            grupos.origem.push(hab);
        }
        // --- OUTROS ---
        else {
            grupos.outros.push(hab);
        }
    });

    // 4. Função de Ordenação (Ativos no topo)
    const sortActiveFirst = (a, b) => {
        if (a.active && !b.active) return -1;
        if (!a.active && b.active) return 1;
        return a.title.localeCompare(b.title);
    };

    // 5. Construção do HTML
    let htmlFinal = `
        <div class="abilities-controls controls-row">
            <input id="filterHabs" placeholder="Filtrar habilidades..." value="${document.getElementById('filterHabs')?.value || ''}" />
            <div class="right-controls">
                <button id="botOpenCatalogHab" class="btn-add">Adicionar</button>
            </div>
        </div>
        <div class="abilities-list">
    `;

    let temConteudo = false;

    // A) Classes (Ordem Alfabética dos Grupos)
    Object.keys(grupos.classes).sort().forEach(nomeClasse => {
        const lista = grupos.classes[nomeClasse].sort(sortActiveFirst);
        if (lista.length > 0) {
            htmlFinal += renderAbilitySection(`Habilidades de ${nomeClasse}`, lista, `class-${nomeClasse}`);
            temConteudo = true;
        }
    });

    // B) Talentos
    if (grupos.talentos.length > 0) {
        grupos.talentos.sort(sortActiveFirst);
        htmlFinal += renderAbilitySection("Talentos", grupos.talentos, "talentos");
        temConteudo = true;
    }

    // C) Origem
    if (grupos.origem.length > 0) {
        grupos.origem.sort(sortActiveFirst);
        htmlFinal += renderAbilitySection("Raça & Antecedente", grupos.origem, "origem");
        temConteudo = true;
    }

    // D) Outros
    if (grupos.outros.length > 0) {
        grupos.outros.sort(sortActiveFirst);
        htmlFinal += renderAbilitySection("Outras Habilidades", grupos.outros, "outros");
        temConteudo = true;
    }

    if (!temConteudo) {
        htmlFinal += `<div class="empty-tip">Nenhuma habilidade encontrada.</div>`;
    }

    htmlFinal += `</div>`;
    conteudoEl.innerHTML = htmlFinal;

    bindAbilityEvents();

    // Mantém o foco no input
    const novoInput = document.getElementById('filterHabs');
    if (novoInput) {
        // Coloca o cursor no final
        const len = novoInput.value.length;
        novoInput.focus();
        novoInput.setSelectionRange(len, len);
    }
}

// --- HTML DA SEÇÃO (Design Preservado) ---
function renderAbilitySection(titulo, listaCards, chaveUnica) {
    if (!state.collapsedSections) state.collapsedSections = {};
    const isCollapsed = !!state.collapsedSections[chaveUnica];
    const arrow = isCollapsed ? '▸' : '▾';
    const displayStyle = isCollapsed ? 'display:none;' : '';

    // HTML DOS CARDS (Seu design original)
    const cardsHtml = listaCards.map(a => `
        <div class="card hab-card ${a.expanded ? 'expanded' : ''}" data-id="${a.id}">
          <div class="card-header">
            <div class="left" data-id="${a.id}">
              <span class="caret">${a.expanded ? '▾' : '▸'}</span>
              <div class="card-title">${a.title}</div>
            </div>
            <div class="right">
               <label class="check-ativar" title="Preparar/Ativar Habilidade">
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
    `).join('');

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

// --- EVENTOS ---
// --- FUNÇÃO AUXILIAR: BIND DE EVENTOS (CORRIGIDA: SEM SCROLL JUMP) ---
function bindAbilityEvents() {
    // 1. Alternar Seções (Minimizar/Maximizar) - Lógica Direta no DOM
    document.querySelectorAll('.toggle-section-header').forEach(header => {
        header.addEventListener('click', (e) => {
            e.preventDefault(); // Previne comportamentos padrão
            
            const key = header.getAttribute('data-key');
            
            // Atualiza estado (silencioso)
            state.collapsedSections[key] = !state.collapsedSections[key];
            saveStateToServer();

            // Manipula o DOM direto sem re-renderizar tudo
            const contentDiv = header.nextElementSibling; // A div .section-content logo abaixo
            const arrowSpan = header.querySelector('span'); // A seta

            if (contentDiv) {
                if (contentDiv.style.display === 'none') {
                    contentDiv.style.display = 'block';
                    if(arrowSpan) arrowSpan.textContent = '▾';
                } else {
                    contentDiv.style.display = 'none';
                    if(arrowSpan) arrowSpan.textContent = '▸';
                }
            }
        });
    });

    // 2. Filtro de Busca (Input)
    const filtro = document.getElementById('filterHabs');
    if (filtro) {
        filtro.addEventListener('input', () => {
            renderAbilities(); // Aqui precisa re-renderizar pois muda o conteúdo
        });
    }

    // 3. Botão Adicionar
    const botAdd = document.getElementById('botOpenCatalogHab');
    if (botAdd) botAdd.addEventListener('click', () => openAbilityCatalogOverlay());

    // 4. Cards (Expandir, Ativar, Remover, Editar)
    document.querySelectorAll('.hab-card').forEach(card => {
        const id = Number(card.getAttribute('data-id'));
        
        // Expandir ao clicar no header (DOM direto para evitar scroll)
        const header = card.querySelector('.card-header');
        const leftDiv = card.querySelector('.left');
        
        if(leftDiv) {
            leftDiv.addEventListener('click', (ev) => {
                const hab = state.abilities.find(h => h.id === id);
                if (hab) {
                    hab.expanded = !hab.expanded;
                    saveStateToServer();

                    // DOM Direto
                    const body = card.querySelector('.card-body');
                    const caret = header.querySelector('.caret');
                    
                    if (body.style.display === 'none') {
                        body.style.display = 'block';
                        caret.textContent = '▾';
                        card.classList.add('expanded');
                    } else {
                        body.style.display = 'none';
                        caret.textContent = '▸';
                        card.classList.remove('expanded');
                    }
                }
            });
        }

        // Checkbox Ativar
        const ch = card.querySelector('.hab-activate');
        if(ch) {
            ch.addEventListener('change', (ev) => {
                const hab = state.abilities.find(h => h.id === id);
                if (hab) {
                    hab.active = ev.target.checked;
                    
                    // Exclusividade Monge/Bárbaro
                    if (hab.active) {
                        if (hab.title.includes("Defesa sem Armadura(Bárbaro)")) {
                            const m = state.abilities.find(a => a.title.includes("Defesa sem Armadura(Monge)"));
                            if (m) m.active = false;
                        }
                        if (hab.title.includes("Defesa sem Armadura(Monge)")) {
                            const b = state.abilities.find(a => a.title.includes("Defesa sem Armadura(Bárbaro)"));
                            if (b) b.active = false;
                        }
                    }

                    saveStateToServer();
                    window.dispatchEvent(new CustomEvent('sheet-updated'));
                    // Aqui precisamos re-renderizar para reordenar (ativos no topo)
                    // Para evitar o pulo, salvamos o scroll antes
                    const scrollPos = document.documentElement.scrollTop || document.body.scrollTop;
                    renderAbilities();
                    window.scrollTo(0, scrollPos);
                }
            });
        }
    });

    // Remover
    document.querySelectorAll('.remover-hab').forEach(btn => {
        btn.addEventListener('click', (ev) => {
            ev.preventDefault();
            const id = Number(btn.getAttribute('data-id'));
            if(confirm("Tem certeza que deseja remover esta habilidade?")) {
                state.abilities = state.abilities.filter(h => h.id !== id);
                const scrollPos = window.scrollY;
                renderAbilities();
                window.scrollTo(0, scrollPos);
                saveStateToServer();
                window.dispatchEvent(new CustomEvent('sheet-updated'));
            }
        });
    });

    // Editar
    document.querySelectorAll('.editar-hab').forEach(btn => {
        btn.addEventListener('click', (ev) => {
            ev.preventDefault();
            const id = Number(btn.getAttribute('data-id'));
            const hab = state.abilities.find(h => h.id === id);
            if (hab) openNewAbilityModal(hab);
        });
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

    function renderCatalogList() {
        const container = overlay.querySelector('.abilities-list-large');
        const searchInput = overlay.querySelector('#catalogAbilitySearch').value.toLowerCase();
        let items = abilityCatalog.filter(it => {
            if (activeClass) {
                if (activeClassHabilitySelected) {
                    if (it.class !== activeClass || (it.subclass && it.subclass !== '')) return false;
                } else if (activeSubclass) {
                    if (it.class !== activeClass || it.subclass !== activeSubclass) return false;
                }
            }
            if (searchInput && !it.name.toLowerCase().includes(searchInput)) return false;
            return true;
        });

        container.innerHTML = items.length ? items.map(c => formatCatalogAbilityCard(c)).join('') : `<div style="color:#ddd;padding:18px;">Nenhuma habilidade encontrada.</div>`;

        // Expandir/Recolher no Catálogo
        container.querySelectorAll('.catalog-card-header .left').forEach(divLeft => {
            divLeft.addEventListener('click', (ev) => {
                const card = divLeft.closest('.catalog-card-ability');
                const body = card.querySelector('.catalog-card-ability-body');
                const toggle = card.querySelector('.catalog-ability-toggle');
                const isHidden = body.style.display === 'none';
                body.style.display = isHidden ? 'block' : 'none';
                toggle.textContent = isHidden ? '▾' : '▸';
            });
        });

        // --- CORREÇÃO IMPORTANTE: ADICIONAR COM A CATEGORIA CORRETA ---
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
                    category: c.category || 'Geral', // <--- AQUI ESTAVA FALTANDO!
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
          
          <div style="display:flex; gap:10px; align-items:flex-start; width:100%;">
            
            <div style="flex: 0 0 auto;">
                ${schoolPill}
            </div>

            <div style="flex: 1 1 auto; min-width: 0;"> 
                ${compRow}
            </div>

            <div style="flex: 0 0 auto; display:flex; justify-content:flex-end;">
                ${classDisplay}
            </div>

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

/* =============================================================
   MAGIAS: RENDERIZAÇÃO E SLOTS
============================================================= */

// Inicializa estrutura de slots se não existir
function initSpellSlotsState() {
    if (!state.spellSlots) {
        state.spellSlots = {};
        // Cria slots do 1 ao 9
        for (let i = 1; i <= 9; i++) {
            state.spellSlots[i] = { max: 0, used: 0 };
        }
        // Slot de Pacto (Bruxo)
        state.spellSlots['pact'] = { max: 0, used: 0, level: 1 }; 
    }
}

// Renderiza o HTML dos Slots
function renderSpellSlotsHTML() {
    initSpellSlotsState();
    
    // Filtra apenas níveis que têm slots máximos > 0
    const activeLevels = [];
    for (let i = 1; i <= 9; i++) {
        if (state.spellSlots[i].max > 0) activeLevels.push(i);
    }

    const hasPact = state.spellSlots['pact'].max > 0;
    
    if (activeLevels.length === 0 && !hasPact) {
        return `
            <div class="slots-container empty">
                <p>Nenhum espaço de magia configurado.</p>
                <button id="btnConfigSlotsIni" class="btn-config-slots">⚙️ Configurar Espaços</button>
            </div>
        `;
    }

    let html = `<div class="slots-container">`;

    // Cabeçalho com Botão de Descanso e Config
    html += `
        <div class="slots-header-actions">
            <span class="slots-title">Espaços de Magia</span>
            <div style="display:flex; gap:8px;">
                <button id="btnRestSlots" title="Recuperar todos os espaços (Descanso Longo)">🌙 Descansar</button>
                <button id="btnConfigSlots" title="Configurar Quantidade">⚙️</button>
            </div>
        </div>
        <div class="slots-grid">
    `;

    // Renderiza Slots Normais (1-9)
    activeLevels.forEach(level => {
        const slot = state.spellSlots[level];
        const available = slot.max - slot.used;
        
        let pips = '';
        for (let i = 0; i < slot.max; i++) {
            // Se i < used, então está gasto (vazio/checkado). Se não, está disponível (cheio).
            // Vamos inverter visualmente: Cheio = Disponível.
            const isUsed = i < slot.used;
            pips += `<span class="slot-pip ${isUsed ? 'used' : 'available'}" data-level="${level}" data-idx="${i}"></span>`;
        }

        html += `
            <div class="slot-group">
                <div class="slot-label">${level}º Círculo</div>
                <div class="slot-pips">${pips}</div>
            </div>
        `;
    });

    // Renderiza Magia de Pacto (Se houver)
    if (hasPact) {
        const pact = state.spellSlots['pact'];
        let pips = '';
        for (let i = 0; i < pact.max; i++) {
            const isUsed = i < pact.used;
            pips += `<span class="slot-pip pact ${isUsed ? 'used' : 'available'}" data-level="pact" data-idx="${i}"></span>`;
        }
        html += `
            <div class="slot-group pact-group">
                <div class="slot-label" style="color:#e0aaff;">Pacto (${pact.level}º)</div>
                <div class="slot-pips">${pips}</div>
            </div>
        `;
    }

    html += `</div></div>`; // Fecha grid e container
    return html;
}

// --- FUNÇÃO PRINCIPAL DE MAGIAS (ATUALIZADA) ---
function renderSpells() {
    // Garante DT calculada
    state.dtMagias = calculateSpellDC();

    // 1. Gera HTML dos Slots
    const slotsHTML = renderSpellSlotsHTML();

    const html = `
    <div class="spells-wrapper" style="position:relative;">
      
      ${slotsHTML}
      <hr style="border:0; border-top:1px solid rgba(255,255,255,0.1); margin: 15px 0;">

      <div class="spells-controls controls-row">
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

  bindSpellEvents(); // Função auxiliar para religar tudo
  bindSlotEvents();  // NOVA: Liga os eventos dos slots
}

// --- LÓGICA DE EVENTOS DOS SLOTS ---
function bindSlotEvents() {
    // Botão Configurar (Engrenagem ou Inicial)
    const btnCfg = document.getElementById('btnConfigSlots');
    const btnCfgIni = document.getElementById('btnConfigSlotsIni');
    
    if(btnCfg) btnCfg.onclick = openSlotConfigModal;
    if(btnCfgIni) btnCfgIni.onclick = openSlotConfigModal;

    // Botão Descansar (Resetar)
    const btnRest = document.getElementById('btnRestSlots');
    if (btnRest) {
        btnRest.onclick = () => {
            if(confirm("Realizar Descanso Longo? Todos os espaços de magia serão recuperados.")) {
                for (let key in state.spellSlots) {
                    state.spellSlots[key].used = 0;
                }
                saveStateToServer();
                renderSpells();
            }
        };
    }

    // Clique nas Bolinhas (Pips)
    document.querySelectorAll('.slot-pip').forEach(pip => {
        pip.addEventListener('click', (e) => {
            const level = pip.dataset.level;
            const idx = parseInt(pip.dataset.idx);
            const slotData = state.spellSlots[level];

            // Lógica inteligente: 
            // Se clicar numa bolinha "disponível" (roxa), gasta um slot.
            // Se clicar numa "usada" (cinza), recupera um slot.
            // Geralmente, D&D é da esquerda pra direita.
            
            // Simplificação: Se clicar, alterna o estado geral baseada na posição?
            // Melhor: Clique na bolinha X define que temos X gastos ou X+1 gastos?
            
            // Lógica Simples Toggle:
            // Se clicar, aumenta o número de usados para cobrir até ali, ou diminui.
            
            if (pip.classList.contains('available')) {
                // Está gastando
                slotData.used = idx + 1;
            } else {
                // Está recuperando (clicou num usado)
                // Se clicou no último usado, remove 1 usado.
                // Se clicou no meio, define usados para esse index
                slotData.used = idx; 
            }

            // Garante limites
            if (slotData.used > slotData.max) slotData.used = slotData.max;
            if (slotData.used < 0) slotData.used = 0;

            saveStateToServer();
            renderSpells();
        });
    });
}

// --- MODAL DE CONFIGURAÇÃO DE SLOTS ---
function openSlotConfigModal() {
    const existing = document.querySelector('.slots-modal-overlay');
    if (existing) existing.remove();

    const overlay = document.createElement('div');
    overlay.className = 'spell-modal-overlay slots-modal-overlay';
    overlay.style.zIndex = '13000'; // Acima de tudo

    // Gera inputs de 1 a 9
    let inputsHtml = '';
    for(let i=1; i<=9; i++) {
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
            if(state.spellSlots[lvl].used > state.spellSlots[lvl].max) {
                state.spellSlots[lvl].used = state.spellSlots[lvl].max;
            }
        });

        // Salva Pacto
        const pMax = parseInt(document.getElementById('pact-max').value) || 0;
        const pLvl = parseInt(document.getElementById('pact-lvl').value) || 1;
        state.spellSlots['pact'].max = pMax;
        state.spellSlots['pact'].level = pLvl;
        if(state.spellSlots['pact'].used > pMax) state.spellSlots['pact'].used = pMax;

        saveStateToServer();
        renderSpells();
        overlay.remove();
        checkScrollLock();
    };
}

// --- FUNÇÃO AUXILIAR PARA RELIGAR OS EVENTOS DE MAGIAS (SEPARADA PARA ORGANIZAÇÃO) ---
function bindSpellEvents() {
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

    // 3. Listeners dos Cards
    document.querySelectorAll('.spell-card').forEach(card => {
        const id = Number(card.getAttribute('data-id'));
        const header = card.querySelector('.card-header');

        // Expandir
        header.addEventListener('click', (ev) => {
            if (ev.target.closest('.spell-right') || ev.target.closest('.check-ativar')) return;
            const s = state.spells.find(x => x.id === id);
            if (s) {
                s.expanded = !s.expanded;
                renderSpells();
                saveStateToServer();
            }
        });

        // Preparar
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

    // Remover
    document.querySelectorAll('.remover-spell').forEach(a => {
        a.addEventListener('click', (ev) => {
            ev.preventDefault();
            const id = Number(a.getAttribute('data-id'));
            state.spells = state.spells.filter(s => s.id !== id);
            renderSpells();
            saveStateToServer();
        });
    });

    // Editar
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

/* ---------------- MODAL MAGIA ---------------- */
function openSpellModal(existingSpell = null) {
  const modal = document.createElement('div');
  modal.className = 'spell-modal-overlay';
  modal.style.zIndex = '11000';

  // Prepara o editor
  const descContent = existingSpell ? existingSpell.description : '';
  const editorHTML = createRichEditorHTML(descContent, 'spell-editor-content');

  // Mantendo o resto do HTML igual, apenas trocando o textarea
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
              <div class="class-select-label">Escolha 1 classe</div>
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
          <label>Descrição</label>
          ${editorHTML}
        </div>
        <div class="modal-actions">
          <button class="btn-add btn-save-modal">${existingSpell ? 'Salvar' : 'Adicionar'}</button>
          <button class="btn-add btn-cancel">Cancelar</button>
        </div>
      </div>
    `;
  document.body.appendChild(modal);
  checkScrollLock();

  // Inicializa eventos do editor
  initRichEditorEvents('spell-editor-content');

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
  if (saveBtn) {
    saveBtn.addEventListener('click', (ev) => {
      ev.preventDefault();
      
      // --- LER DO EDITOR ---
      const desc = document.getElementById('spell-editor-content').innerHTML;

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
    state.spells.unshift({ ...c, id: uid(), expanded: true, active: false, spellClass: classeFinal });
    renderSpells();
    saveStateToServer();
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

/* ---------------- PREPARADAS (DIREITA) - CORRIGIDA (SEM SCROLL JUMP) ---------------- */
function renderPreparedSpells() {
    const habilidadesPreparadas = state.abilities.filter(h => h.active);
    const magiasPreparadas = state.spells.filter(s => s.active);

    if (!habilidadesPreparadas.length && !magiasPreparadas.length) {
        conteudoEl.innerHTML = `<div class="empty-tip">Nenhuma habilidade ou magia preparada/ativa no momento.</div>`;
        return;
    }

    // Estados iniciais
    const isMagiasMin = !!state.minimizedPreparedSpells;
    const isHabsMin = !!state.minimizedPreparedAbilities;

    const arrowMagias = isMagiasMin ? '▸' : '▾';
    const arrowHabs = isHabsMin ? '▸' : '▾';
    const styleMagias = isMagiasMin ? 'display:none;' : '';
    const styleHabs = isHabsMin ? 'display:none;' : '';

    // HTML Magias
    let magiasHTML = '';
    if (magiasPreparadas.length > 0) {
        magiasHTML = `
            <h4 id="toggle-magias" class="toggle-section-header" style="margin: 10px 0 6px 4px; color: #ddd; text-transform: uppercase; font-size: 12px; border-bottom: 1px solid rgba(255,255,255,0.1); padding-bottom: 4px; cursor:pointer;">
                <span style="font-size:14px; color:#9c27b0; width:12px;">${arrowMagias}</span> Magias Preparadas
            </h4>
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
                            <div class="left" data-id="${a.id}" style="cursor:pointer;">
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
                        </div>
                    </div>
                `).join('')}
            </div>
        `;
    }

    conteudoEl.innerHTML = `
        <div class="controls-row">
            <input id="filterPrepared" placeholder="Filtrar preparados..." />
        </div>
        <div class="spells-list">
            ${magiasHTML}
            ${habilidadesHTML}
        </div>
    `;

    // --- EVENT LISTENERS DE MINIMIZAR (DOM DIRETO) ---
    const btnToggleMagias = document.getElementById('toggle-magias');
    if (btnToggleMagias) {
        btnToggleMagias.addEventListener('click', () => {
            state.minimizedPreparedSpells = !state.minimizedPreparedSpells;
            saveStateToServer();
            
            // DOM direto
            const content = document.getElementById('content-magias');
            const arrow = btnToggleMagias.querySelector('span');
            if(content) {
                content.style.display = state.minimizedPreparedSpells ? 'none' : 'block';
                arrow.textContent = state.minimizedPreparedSpells ? '▸' : '▾';
            }
        });
    }

    const btnToggleHabs = document.getElementById('toggle-habs');
    if (btnToggleHabs) {
        btnToggleHabs.addEventListener('click', () => {
            state.minimizedPreparedAbilities = !state.minimizedPreparedAbilities;
            saveStateToServer();

            // DOM direto
            const content = document.getElementById('content-habs');
            const arrow = btnToggleHabs.querySelector('span');
            if(content) {
                content.style.display = state.minimizedPreparedAbilities ? 'none' : 'block';
                arrow.textContent = state.minimizedPreparedAbilities ? '▸' : '▾';
            }
        });
    }

    // Filtro
    const filtro = document.getElementById('filterPrepared');
    if (filtro) {
        filtro.addEventListener('input', (e) => {
            const q = e.target.value.toLowerCase();
            conteudoEl.querySelectorAll('.hab-card, .spell-card').forEach(card => {
                const title = card.querySelector('.card-title').textContent.toLowerCase();
                card.style.display = title.includes(q) ? '' : 'none';
            });
        });
    }

    // --- LISTENERS DE CARDS (Expansão e Checkbox) ---
    // (Lógica DOM direto para expansão)
    
    const toggleCardExpansion = (card, itemId, isSpell) => {
        const item = isSpell ? state.spells.find(x => x.id === itemId) : state.abilities.find(x => x.id === itemId);
        if (item) {
            item.expanded = !item.expanded;
            saveStateToServer();

            const body = card.querySelector('.card-body');
            const caret = card.querySelector('.caret');
            if (body.style.display === 'none') {
                body.style.display = 'block';
                caret.textContent = '▾';
                card.classList.add('expanded');
            } else {
                body.style.display = 'none';
                caret.textContent = '▸';
                card.classList.remove('expanded');
            }
        }
    };

    conteudoEl.querySelectorAll('.hab-card').forEach(card => {
        const id = Number(card.getAttribute('data-id'));
        card.querySelector('.card-header .left').addEventListener('click', () => toggleCardExpansion(card, id, false));

        card.querySelector('.hab-activate').addEventListener('change', (ev) => {
            const hab = state.abilities.find(h => h.id === id);
            if (hab) {
                hab.active = ev.target.checked;
                saveStateToServer();
                window.dispatchEvent(new CustomEvent('sheet-updated'));
                // Aqui re-renderizamos pois removemos o item da lista
                const scrollPos = window.scrollY;
                renderPreparedSpells();
                window.scrollTo(0, scrollPos);
            }
        });
    });

    conteudoEl.querySelectorAll('.spell-card').forEach(card => {
        const id = Number(card.getAttribute('data-id'));
        card.querySelector('.card-header').addEventListener('click', (ev) => {
             if (ev.target.closest('.spell-right') || ev.target.closest('.check-ativar')) return;
             toggleCardExpansion(card, id, true);
        });

        const ch = card.querySelector('.spell-activate');
        if(ch) {
            ch.addEventListener('change', (ev) => {
                const s = state.spells.find(x => x.id === id);
                if (s) {
                    s.active = ev.target.checked;
                    saveStateToServer();
                    window.dispatchEvent(new CustomEvent('sheet-updated'));
                    // Re-renderiza para remover
                    const scrollPos = window.scrollY;
                    renderPreparedSpells();
                    window.scrollTo(0, scrollPos);
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
  'Provisão': ['Comida', 'Transporte/Animais', 'Hospedagem']
};

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
          <div class="catalog-large-close" title="Fechar" style="cursor:pointer;">✖</div>
        </div>
        <div class="catalog-large-classes" id="item-cats-row">${catsHtml}</div>
        <div id="item-subs-row" style="display:flex; gap:10px; flex-wrap:wrap; margin-top:8px; padding-bottom:6px;"></div>
        <div class="catalog-large-search" style="margin-top:6px;">
          <input id="catalogItemSearch" placeholder="Ex: pode pesquisar coisas separadas, separa por vírgula ma pesquisa(coisa1,coisa2,palavra-chave3)..." />
        </div>
        <div class="catalog-large-list item-list-large" style="margin-top:10px; overflow:auto; flex:1;"></div>
      </div>
    `;

  document.body.appendChild(overlay);
  checkScrollLock();

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
    
    // Divide os termos por vírgula e remove espaços extras
    const searchTerms = searchInput.split(',').map(t => t.trim()).filter(t => t);

    let items = itemCatalog.filter(i => i.category === activeCat);

    if (ITEM_SUBCATEGORIES[activeCat]?.length > 0) {
      items = items.filter(i => i.subcategory === activeSub);
    }

    // LÓGICA DE FILTRO AVANÇADA
    if (searchTerms.length > 0) {
      items = items.filter(item => {
        // Monta uma string gigante com todas as infos do item para buscar
        const searchableText = [
          item.name,
          item.description,
          item.type,
          item.tipoArma,
          item.proficiency,
          item.damageType,
          Array.isArray(item.damageTypes) ? item.damageTypes.join(' ') : '',
          item.caracteristicas ? item.caracteristicas.join(' ') : '',
          item.empunhadura,
          item.defense ? `CA ${item.defense}` : ''
        ].filter(Boolean).join(' ').toLowerCase();

        // Verifica se TODOS os termos digitados existem no item (Lógica AND)
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

    // Listener de Expandir
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

    // Listener de Adicionar
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
    tipoArma: i.tipoArma || 'Corpo a Corpo',
    empunhadura: i.empunhadura || 'Uma mao',
    crit: i.crit || '20',
    multiplicador: i.multiplicador || '2',
    alcance: i.alcance || '1.5m',
    attunement: i.attunement || 'Não',
    damage: i.damage || '1d4',
    damage2Hands: i.damage2Hands || '', // IMPORTANTE: Puxa o dano de 2 mãos do back
    useTwoHands: false,
    damageTypes: Array.isArray(i.damageTypes) ? [...i.damageTypes] : (i.damageType ? [i.damageType] : []),
    moreDmgList: i.moreDmgList || [],
    caracteristicas: i.caracteristicas || []
  };

  state.inventory.unshift(novoItem);
  renderInventory();
  saveStateToServer();
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
      
      // Se for Antecedentes, não selecionamos a "Habilidade Geral" por padrão visualmente,
      // mas mantemos a lógica interna funcionando.
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

  function renderCatalogList() {
    const container = overlay.querySelector('.abilities-list-large');
    const searchInput = overlay.querySelector('#catalogAbilitySearch').value.toLowerCase();
    const searchTerms = searchInput.split(',').map(t => t.trim()).filter(t => t);

    let items = abilityCatalog.filter(it => {
      // 1. Lógica das Abas (Classe/Subclasse)
      if (activeClass) {
        if (activeClassHabilitySelected) {
          // Se estiver na aba principal da classe
          if (it.class !== activeClass || (it.subclass && it.subclass !== '')) return false;
        } else if (activeSubclass) {
          // Se estiver numa subclasse específica
          if (it.class !== activeClass || it.subclass !== activeSubclass) return false;
        }
      }
      
      // 2. Filtro de Texto (separado por vírgula)
      if (searchTerms.length > 0) {
        const fullText = [
            it.name,
            it.description,
            it.class,
            it.subclass,
            it.category // Geral, Ação, etc.
        ].filter(Boolean).join(' ').toLowerCase();

        return searchTerms.every(term => fullText.includes(term));
      }
      return true;
    });

    if (!items.length) {
      container.innerHTML = `<div style="color:#ddd;padding:18px;">Nenhuma habilidade encontrada.</div>`;
      return;
    }

    container.innerHTML = items.map(c => formatCatalogAbilityCard(c)).join('');

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
  const barbDefense = state.abilities.find(a => a.active && a.title.includes("Defesa sem Armadura(Bárbaro)"));
  const monkDefense = state.abilities.find(a => a.active && a.title.includes("Defesa sem Armadura(Monge)"));

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

function openNewAbilityModal(existingAbility = null) {
  const modal = document.createElement('div');
  modal.className = 'spell-modal-overlay';
  modal.style.zIndex = '11000';

  const descContent = existingAbility ? existingAbility.description : 'Minha nova habilidade';
  const editorHTML = createRichEditorHTML(descContent, 'hab-editor-content');

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
          ${editorHTML}
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

  const closeAll = () => {
    modal.remove();
    checkScrollLock(); 
  };
  modal.querySelector('.modal-close').addEventListener('click', closeAll);
  modal.querySelector('.btn-cancel-hab').addEventListener('click', (ev) => { ev.preventDefault(); closeAll(); });

  modal.querySelector('.btn-save-hab').addEventListener('click', (ev) => {
    ev.preventDefault();
    const nome = modal.querySelector('#hab-name').value.trim() || 'Habilidade sem nome';
    
    // --- LER DO EDITOR ---
    const desc = document.getElementById('hab-editor-content').innerHTML;

    const cls = '';
    const sub = '';

    if (existingAbility) {
      state.abilities = state.abilities.map(h => h.id === existingAbility.id ? { ...h, title: nome, description: desc, class: cls, subclass: sub } : h);
    } else {
      state.abilities.unshift({ id: uid(), title: nome, description: desc, expanded: true, class: cls, subclass: sub });
    }

    closeAll();
    renderAbilities();
    saveStateToServer(); 
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


/* ---------------- FUNÇÕES DO EDITOR DE TEXTO RICO ---------------- */

// Função para gerar o HTML do editor
function createRichEditorHTML(content, idContainer) {
    return `
      <div class="rich-editor-wrapper" id="${idContainer}-wrapper">
        <div class="rich-toolbar">
          <button type="button" class="rich-btn" data-cmd="bold" title="Negrito (Roxo)">B</button>
          <button type="button" class="rich-btn" data-cmd="italic" title="Itálico">I</button>
          <button type="button" class="rich-btn" data-cmd="underline" title="Sublinhado">U</button>
          <div style="width:1px; background:#444; margin:0 4px;"></div>
          <button type="button" class="rich-btn" data-cmd="insertUnorderedList" title="Lista">≣</button>
        </div>
        <div class="rich-content" id="${idContainer}" contenteditable="true">${content}</div>
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