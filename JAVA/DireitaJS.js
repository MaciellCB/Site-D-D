// DireitaJS.js (Atualizado: Modal Nova Arma com layout e multi-select dropdowns)

const state = {
  activeTab: 'Combate',
  dtMagias: 12,
  inventory: [
    { id: 1, name: 'Bastão', type: 'Arma', damage: '1d6/1d8', crit: '20', multiplicador: '2', equip: true, isEquipable: true, expanded: false, description: 'Bastão robusto', proficiency: 'Armas Simples', tipoArma: 'Corpo a Corpo', empunhadura: 'Uma mao', caracteristicas: ['Leve'] , damageTypes: ['Contundente'], alcance: '1.5m' },
    { id: 2, name: 'Escudo Grande de Aço', type: 'Proteção', defense: '+2', equip: false, isEquipable: true, expanded: true, description: 'Escudo pesado.' },
    { id: 3, name: 'Mochila', type: 'Geral', equip: false, isEquipable: false, expanded: false, description: 'Carrega coisas.' }
  ],
  abilities: [
    { id: 1, title: 'Exemplo', description: 'Descrição de exemplo', expanded: true, class: '', subclass: '' },
    { id: 2, title: 'Teste', description: 'descrição do teste', expanded: false, class: '', subclass: '' }
  ],
  abilityCatalog: [
    { id: 'a1', name: 'Misturar Elixir', category: 'Alquimista', class: 'Artífice', subclass: 'Alquimista', description: 'Cria elixires de suporte e cura.' },
    { id: 'a2', name: 'Armadura Compacta', category: 'Armeiro', class: 'Artífice', subclass: 'Armeiro', description: 'Fortalece armadura e concede habilidades defensivas.' },
    { id: 'a3', name: 'Grito Frenético', category: 'Bárbaro', class: 'Bárbaro', subclass: 'Caminho do Berserker', description: 'Aumenta dano por alguns turnos.' },
    { id: 'a4', name: 'Palavra Encantada', category: 'Bardo', class: 'Bardo', subclass: 'Colégio do Conhecimento', description: 'Concede bônus em testes de conhecimento.' },
    { id: 'a5', name: 'Marca do Caçador', category: 'Patrulheiro', class: 'Patrulheiro', subclass: 'Caçador', description: 'Marca inimigo para dano adicional.' },
    { id: 't1', name: 'Mente Afiada', category: 'Talentos', class: 'Talentos', subclass: '', description: 'Você recebe +1 em inteligência em testes específicos.' },
    { id: 'b1', name: 'Antecedente: Nobre', category: 'Antecedentes', class: 'Antecedentes', subclass: '', description: 'Vínculos e recursos sociais.' }
  ],
  spells: [
    {
      id: 1001,
      name: 'Bola de Fogo',
      levelNumber: 1,
      damage: '1d10+3',
      expanded: true,
      active: false,
      components: { V: true, S: false, M: false },
      material: '-',
      attrs: { execucao: 'padrão', alcance: 'pessoal', area: 'Tantos metros', alvo: 'N alvos', duracao: 'N turnos', resistencia: 'Tal Perícia' },
      school: 'Evocação',
      spellClass: 'Mago',
      description: 'Uma explosão de chamas que causa dano em área.'
    }
  ],
  spellCatalog: [
    { 
      id: 'c1', 
      name: 'Bola de Fogo', 
      school: 'Evocação', 
      damage: '1d10+3', 
      levelNumber: 3, 
      spellClass: 'Mago',
      components: { V: true, S: true, M: true },
      material: 'Uma bolinha de guano de morcego e enxofre',
      attrs: { execucao: '1 ação', alcance: '45m', area: 'Esfera 6m', alvo: '-', duracao: 'Instantânea', resistencia: 'Des (meio)' },
      description: 'Um veio brilhante lampeja na ponta do seu dedo e explode em chamas causando dano em área.' 
    },
    { 
      id: 'c2', 
      name: 'Raio Congelante', 
      school: 'Evocação', 
      damage: '1d8', 
      levelNumber: 0, 
      spellClass: 'Feiticeiro',
      components: { V: true, S: true, M: false },
      material: '-',
      attrs: { execucao: '1 ação', alcance: '18m', area: '-', alvo: '1 criatura', duracao: 'Instantânea', resistencia: '-' },
      description: 'Um jato de frio que reduz a velocidade e causa dano de frio.' 
    },
    { 
      id: 'c3', 
      name: 'Muralha de Fogo', 
      school: 'Evocação', 
      damage: '5d8', 
      levelNumber: 4, 
      spellClass: 'Druida',
      components: { V: true, S: true, M: true },
      material: 'Um pedaço de fósforo',
      attrs: { execucao: '1 ação', alcance: '36m', area: 'Muralha', alvo: '-', duracao: 'Conc. 1 min', resistencia: 'Des (meio)' },
      description: 'Ergue uma parede de chamas que bloqueia passagem e causa dano contínuo.' 
    }
  ],
  description: { anotacoes: '', aparencia: '', personalidade: '', objetivo: '', ideais: '', vinculos: '', fraquezas: '', historia: '' }
};

const CLASSES_WITH_SUBCLASSES = {
  'Artífice': ['Alquimista','Armeiro','Artilheiro','Ferreiro de Batalha'],
  'Bárbaro': ['Caminho do Berserker','Caminho do Guerreiro Totêmico','Caminho do Guardião Ancestral','Caminho do Arauto da Tempestade','Caminho do Fanático','Caminho da Besta','Caminho da Magia Selvagem'],
  'Bardo': ['Colégio do Conhecimento','Colégio da Bravura','Colégio do Glamour','Colégio das Espadas','Colégio dos Sussurros','Colégio da Criação','Colégio da Eloquência','Colégio dos Espíritos'],
  'Bruxo': ['Arquifada','O Corruptor','O Grande Antigo','O Celestial','Hexblade','O Insondável','O Gênio','O Morto-Vivo'],
  'Caçador de Sangue': ['Ordem do Caça-Fantasmas','Ordem do Licantropo','Ordem do Mutante','Ordem da Alma Profana'],
  'Clérigo': ['Domínio do Conhecimento','Domínio da Vida','Domínio da Luz','Domínio da Natureza','Domínio da Tempestade','Domínio da Enganação','Domínio da Guerra','Domínio da Forja','Domínio da Sepultura','Domínio da Ordem','Domínio da Paz','Domínio do Crepúsculo','Domínio Arcano','Domínio da Morte'],
  'Druida': ['Círculo da Terra','Círculo da Lua','Círculo dos Sonhos','Círculo do Pastor','Círculo dos Esporos','Círculo das Estrelas','Círculo do Fogo Selvagem'],
  'Feiticeiro': ['Linhagem Dracônica','Magia Selvagem','Alma Divina','Magia das Sombras','Feitiçaria da Tempestade','Mente Aberrante','Alma do Relógio'],
  'Guerreiro': ['Campeão','Mestre de Batalha','Cavaleiro Arcano','Arqueiro Arcano','Cavaleiro','Samurai','Guerreiro Psiônico','Cavaleiro Rúnico','Cavaleiro do Eco'],
  'Ladino': ['Ladrão','Assassino','Trapaceiro Arcano','Inquisitivo','Mentor','Espadachim','Batedor','Fantasma','Lâmina da Alma'],
  'Mago': ['Abjuração','Conjuração','Adivinhação','Encantamento','Evocação','Ilusão','Necromancia','Transmutação','Magia de Guerra','Cantor da Lâmina','Escribas'],
  'Monge': ['Caminho da Mão Aberta','Caminho das Sombras','Caminho dos Quatro Elementos','Caminho da Longa Morte','Kensei','Mestre Bêbado','Alma Solar','Misericórdia','Forma Astral','Dragão Ascendente'],
  'Paladino': ['Devotion','Ancients','Vengeance','Crown','Conquest','Redemption','Glory','Watchers','Oathbreaker'],
  'Patrulheiro': ['Caçador','Mestre das Feras','Caçador das Sombras','Andarilho do Horizonte','Matador de Monstros','Peregrino Feérico','Guardião do Enxame','Guardião Dracônico'],
  'Antecedentes': [],
  'Talentos': []
};

const CLASSES_AVAILABLE = Object.keys(CLASSES_WITH_SUBCLASSES);

const conteudoEl = document.querySelector('.lado-direito .conteudo');

function uid() { return Date.now() + Math.floor(Math.random()*1000); }

function setActiveTab(tabName) {
  state.activeTab = tabName;
  document.querySelectorAll('.lado-direito .abas button').forEach(b => {
    b.classList.toggle('ativa', b.textContent.trim() === tabName);
  });
  renderActiveTab();
}

/* ---------------- INVENTÁRIO ---------------- */
function formatInventoryItem(item) {
  let metaParts = [];
  if (item.type === 'Arma') {
    if (item.damage) metaParts.push(`Dano: <strong>${item.damage}</strong>`);
    if (item.damageTypes && item.damageTypes.length) metaParts.push(`Tipo: ${item.damageTypes.join(', ')}`);
    if (item.proficiency) metaParts.push(`Prof.: ${item.proficiency}`);
    if (item.tipoArma) metaParts.push(`${item.tipoArma}`);
    if (item.empunhadura) metaParts.push(`${item.empunhadura}`);
    if (item.caracteristicas && item.caracteristicas.length) metaParts.push(`Prop.: ${item.caracteristicas.join(', ')}`);
  } else if (item.type === 'Proteção') {
    metaParts.push(`Defesa: <strong>${item.defense || '-'}</strong>`);
  } else {
    metaParts.push(`${item.type}`);
  }

  const metaInline = metaParts.join(' • ');
  const checked = item.isEquipable && item.equip ? 'checked' : '';
  return `
    <div class="card item-card ${item.expanded ? 'expanded' : ''}" data-id="${item.id}">
      <div class="card-header compact">
        <div class="left" data-id="${item.id}">
          <span class="caret">${item.expanded ? '▾' : '▸'}</span>
          <div class="title-block">
            <div class="card-title">${escapeHtml(item.name)}</div>
            <div class="card-sub mini-sub">${metaInline}</div>
          </div>
        </div>
        <div class="right">
          ${item.isEquipable ? `<label class="header-equip"><input class="item-equip-checkbox" type="checkbox" data-id="${item.id}" ${checked}/><span class="square-check"></span></label>` : ''}
        </div>
      </div>
      <div class="card-body" style="${item.expanded ? '' : 'display:none;'}">
        ${item.description ? `<p>${escapeHtml(item.description)}</p>` : ''}
        <div style="margin-top:10px;">
          <a href="#" class="remover-item" data-id="${item.id}">Remover</a>
          <a href="#" class="editar-item" data-id="${item.id}" style="float:right;color:#2e7d32">Editar</a>
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
}

function bindInventoryCardEvents() {
  document.querySelectorAll('.item-card').forEach(card => {
    const id = Number(card.getAttribute('data-id'));
    const header = card.querySelector('.card-header');
    header.addEventListener('click', (ev) => {
      if (ev.target.closest('.header-equip') || ev.target.closest('.item-equip-checkbox')) return;
      const it = state.inventory.find(x => x.id === id); it.expanded = !it.expanded;
      renderInventory();
    });
  });

  document.querySelectorAll('.item-equip-checkbox').forEach(ch => {
    ch.addEventListener('change', (ev) => {
      ev.stopPropagation();
      const id = Number(ev.target.getAttribute('data-id'));
      const item = state.inventory.find(x => x.id === id);
      if (item) {
        item.equip = ev.target.checked;
        if (state.activeTab === 'Combate') renderCombat();
        if (state.activeTab === 'Inventário') renderInventory();
      }
    });
    ch.addEventListener('click', ev => ev.stopPropagation());
  });

  document.querySelectorAll('.remover-item').forEach(el => {
    el.addEventListener('click', (ev) => { ev.preventDefault(); const id = Number(el.getAttribute('data-id')); state.inventory = state.inventory.filter(i => i.id !== id); renderInventory(); });
  });
  document.querySelectorAll('.editar-item').forEach(el => {
    el.addEventListener('click', (ev) => {
      ev.preventDefault();
      const id = Number(el.getAttribute('data-id'));
      const it = state.inventory.find(i => i.id === id);
      if (!it) return;
      openItemModal(it);
    });
  });

  const botAdd = document.getElementById('botAddItem');
  if (botAdd) botAdd.addEventListener('click', () => { openItemModal(null); });

  const filtro = document.getElementById('filterItens');
  if (filtro) filtro.addEventListener('input', (e) => {
    const q = e.target.value.toLowerCase();
    document.querySelectorAll('.item-card').forEach(card => {
      const title = card.querySelector('.card-title').textContent.toLowerCase();
      card.style.display = title.includes(q) ? '' : 'none';
    });
  });
}

function renderCombat() {
  const equipped = state.inventory.filter(i => i.equip);
  if (!equipped.length) { conteudoEl.innerHTML = `<p class="empty-tip">Você ainda não possui ataques ou equipamentos equipados para combate.</p>`; return; }
  const html = `<div class="inventory-list">${equipped.map(formatInventoryItem).join('')}</div>`;
  conteudoEl.innerHTML = html;
  bindInventoryCardEvents();
}

/* ---------------- Modal Nova Arma (layout conforme imagem) ---------------- */

const PROFICIENCIAS = ['Armas Simples','Armas Marciais','Arma de Fogo'];
const TIPOS = ['Corpo a Corpo','A Distancia','Misto'];
const EMPUNHADURAS = ['Uma mao','Duas Maos','Versátil'];
const CARACTERISTICAS = ['Agil','Alcance','Arremesso','Distância','Especial','Leve','Munição','Pesada','Recarga','Montaria','Rede'];
const TIPOS_DANO = ['Contundente','Cortante','Perfurante','Ácido','Elétrico','Gélido','Ígneo','Trovejante','Energético','Necrótico','Psíquico','Radiante','Venenoso'];

function openItemModal(existingItem = null) {
  // Remove overlay anterior se existir
  const existingOverlay = document.querySelector('.spell-modal-overlay');
  if (existingOverlay) existingOverlay.remove();

  const modal = document.createElement('div');
  modal.className = 'spell-modal-overlay';
  modal.style.zIndex = '11000';

  const pre = existingItem || {};
  const nameVal = escapeHtml(pre.name || 'Nova Arma');
  const damageVal = escapeHtml(pre.damage || '');
  const critVal = escapeHtml(pre.crit || '20');
  const multVal = escapeHtml(pre.multiplicador || '2');
  const alcanceVal = escapeHtml(pre.alcance || (pre.alcance === 0 ? '0' : '1.5m'));
  const descVal = escapeHtml(pre.description || '');
  const profSelected = pre.proficiency || '';
  const tipoSelected = pre.tipoArma || '';
  const empSelected = pre.empunhadura || '';
  const carSelected = pre.caracteristicas || [];
  const dmgTypesSelected = pre.damageTypes || [];
  // pre.moreDmgList pode existir (array), senão criar vazio
  const preMore = Array.isArray(pre.moreDmgList) ? pre.moreDmgList : (pre.moreDmg ? [pre.moreDmg] : []);

  modal.innerHTML = `
    <div class="spell-modal" style="width:920px; max-width:calc(100% - 40px);">
      <div class="modal-header" style="align-items:flex-start;">
        <h3 style="margin:0;">Nova Arma</h3>
        <div style="display:flex;gap:8px;align-items:center;">
          <button id="btnListaPadrao" class="btn-add" style="background:#9c27b0;border:none;padding:8px 14px; font-weight:800;">Lista Padrao<br/>de Itens</button>
          <button class="modal-close">✖</button>
        </div>
      </div>

      <div class="modal-body" style="display:block;">
        <div style="display:grid; grid-template-columns: 1fr 1fr 1fr 1fr; gap:12px; align-items:start;">
          <div style="grid-column: 1 / span 4;">
            <label>Nome*</label>
            <input id="item-name" type="text" value="${nameVal}" />
          </div>

          <div>
            <label>Proficiência</label>
            <div id="prof-pills" style="display:flex;gap:8px;flex-wrap:wrap;margin-top:6px;">
              ${PROFICIENCIAS.map(p => `<button type="button" class="pill single-select prof-pill" data-val="${escapeHtml(p)}">${escapeHtml(p)}</button>`).join('')}
            </div>
          </div>

          <div>
            <label>Tipo</label>
            <div id="tipo-pills" style="display:flex;gap:8px;flex-wrap:wrap;margin-top:6px;">
              ${TIPOS.map(p => `<button type="button" class="pill single-select tipo-pill" data-val="${escapeHtml(p)}">${escapeHtml(p)}</button>`).join('')}
            </div>
          </div>

          <div>
            <label>Empunhadura</label>
            <div id="emp-pills" style="display:flex;gap:8px;flex-wrap:wrap;margin-top:6px;">
              ${EMPUNHADURAS.map(p => `<button type="button" class="pill single-select emp-pill" data-val="${escapeHtml(p)}">${escapeHtml(p)}</button>`).join('')}
            </div>
          </div>

          <div style="grid-column: 4 / span 1;">
            <label>Caracteristica</label>
            <div id="car-field" class="multi-select-field" style="margin-top:6px; position:relative;">
              <div id="car-display" style="min-height:36px;padding:8px;border-radius:6px;background:#111;border:1px solid rgba(255,255,255,0.03);color:#ddd;cursor:pointer;display:flex;align-items:center;justify-content:space-between;">
                <span id="car-placeholder">${carSelected && carSelected.length ? escapeHtml(carSelected.join(', ')) : 'Selecione...'}</span>
                <span style="color:#9c27b0;font-weight:800;">▾</span>
              </div>
              <div id="car-panel" class="panel" style="display:none; position:absolute; right:0; left:0; top:46px; z-index:12000;">
                ${CARACTERISTICAS.map(c => `
                  <label style="display:block; padding:6px 6px; border-radius:6px; cursor:pointer;">
                    <input type="checkbox" class="car-checkbox" value="${escapeHtml(c)}" style="margin-right:8px;" /> ${escapeHtml(c)}
                  </label>
                `).join('')}
              </div>
            </div>
          </div>

          <div style="grid-column: 1 / span 1;">
            <label>Critico</label>
            <input id="item-crit" type="text" value="${critVal}" />
          </div>

          <div style="grid-column: 2 / span 1;">
            <label>Multiplicador</label>
            <input id="item-mult" type="text" value="${multVal}" />
          </div>

          <div style="grid-column: 3 / span 1;">
            <label>Alcance</label>
            <input id="item-range" type="text" value="${alcanceVal}" />
          </div>

          <div style="grid-column: 1 / span 2;">
            <label>Dano</label>
            <input id="item-damage" type="text" value="${damageVal}" />
          </div>

          <div style="grid-column: 3 / span 2;">
            <label>Tipo de dano</label>
            <div id="dmg-field" class="multi-select-field" style="margin-top:6px; position:relative;">
              <div id="dmg-display" style="min-height:36px;padding:8px;border-radius:6px;background:#111;border:1px solid rgba(255,255,255,0.03);color:#ddd;cursor:pointer;display:flex;align-items:center;justify-content:space-between;">
                <span id="dmg-placeholder">${dmgTypesSelected && dmgTypesSelected.length ? escapeHtml(dmgTypesSelected.join(', ')) : 'Selecione...'}</span>
                <span style="color:#9c27b0;font-weight:800;">▾</span>
              </div>
              <div id="dmg-panel" class="panel" style="display:none; position:absolute; right:0; left:0; top:46px; z-index:12000;">
                ${TIPOS_DANO.map(c => `
                  <label style="display:block; padding:6px 6px; border-radius:6px; cursor:pointer;">
                    <input type="checkbox" class="dmg-checkbox" value="${escapeHtml(c)}" style="margin-right:8px;" /> ${escapeHtml(c)}
                  </label>
                `).join('')}
              </div>
            </div>
          </div>

          <div style="grid-column:1 / span 3;">
            <label>Mais Danos</label>
            <div id="more-dmg-root" style="margin-top:6px;">
              <!-- linhas dinâmicas serão inseridas aqui -->
            </div>
          </div>
          <div style="grid-column:4 / span 1; display:flex; align-items:flex-end; justify-content:flex-end;">
            <button id="add-more-dmg" class="add-dmg-btn">+</button>
          </div>

          <div style="grid-column:1 / span 4;">
            <label>Descrição <small style="color:#bbb"> (utilize negrito para aplicar a cor roxo)</small></label>
            <textarea id="item-desc" style="min-height:160px;">${descVal}</textarea>
          </div>
        </div>
      </div>

      <div class="modal-actions" style="display:flex;gap:8px;justify-content:flex-end;padding:12px;">
        <button class="btn-add btn-save-item">${existingItem ? 'Salvar' : 'Adicionar'}</button>
        <button class="btn-add btn-cancel">Cancelar</button>
      </div>
    </div>
  `;

  document.body.appendChild(modal);

  // Pre-seleção das pills
  modal.querySelectorAll('.prof-pill').forEach(p => {
    if (profSelected && p.getAttribute('data-val') === profSelected) p.classList.add('active');
    p.addEventListener('click', () => {
      modal.querySelectorAll('.prof-pill').forEach(x => x.classList.remove('active'));
      p.classList.add('active');
    });
  });
  modal.querySelectorAll('.tipo-pill').forEach(p => {
    if (tipoSelected && p.getAttribute('data-val') === tipoSelected) p.classList.add('active');
    p.addEventListener('click', () => {
      modal.querySelectorAll('.tipo-pill').forEach(x => x.classList.remove('active'));
      p.classList.add('active');
    });
  });
  modal.querySelectorAll('.emp-pill').forEach(p => {
    if (empSelected && p.getAttribute('data-val') === empSelected) p.classList.add('active');
    p.addEventListener('click', () => {
      modal.querySelectorAll('.emp-pill').forEach(x => x.classList.remove('active'));
      p.classList.add('active');
    });
  });

  // multi-selects (características / tipos de dano)
  const carPanel = modal.querySelector('#car-panel');
  const carPlaceholder = modal.querySelector('#car-placeholder');
  const carCheckboxes = carPanel.querySelectorAll('.car-checkbox');
  carCheckboxes.forEach(cb => { if (carSelected && carSelected.indexOf(cb.value) !== -1) cb.checked = true; });
  function updateCarPlaceholder() {
    const vals = Array.from(carPanel.querySelectorAll('.car-checkbox:checked')).map(x => x.value);
    carPlaceholder.textContent = vals.length ? vals.join(', ') : 'Selecione...';
  }
  updateCarPlaceholder();

  const dmgPanel = modal.querySelector('#dmg-panel');
  const dmgPlaceholder = modal.querySelector('#dmg-placeholder');
  const dmgCheckboxes = dmgPanel.querySelectorAll('.dmg-checkbox');
  dmgCheckboxes.forEach(cb => { if (dmgTypesSelected && dmgTypesSelected.indexOf(cb.value) !== -1) cb.checked = true; });
  function updateDmgPlaceholder() {
    const vals = Array.from(dmgPanel.querySelectorAll('.dmg-checkbox:checked')).map(x => x.value);
    dmgPlaceholder.textContent = vals.length ? vals.join(', ') : 'Selecione...';
  }
  updateDmgPlaceholder();

  carCheckboxes.forEach(cb => cb.addEventListener('change', updateCarPlaceholder));
  dmgCheckboxes.forEach(cb => cb.addEventListener('change', updateDmgPlaceholder));

  modal.querySelector('#car-display').addEventListener('click', (e) => {
    e.stopPropagation();
    const open = carPanel.style.display === 'block';
    dmgPanel.style.display = 'none';
    carPanel.style.display = open ? 'none' : 'block';
  });
  modal.querySelector('#dmg-display').addEventListener('click', (e) => {
    e.stopPropagation();
    const open = dmgPanel.style.display === 'block';
    carPanel.style.display = 'none';
    dmgPanel.style.display = open ? 'none' : 'block';
  });

  // ------------------- Mais Dano: funções para adicionar/remover linhas -------------------
  const moreRoot = modal.querySelector('#more-dmg-root');

  function createDamageRow(dmgText = '', dmgType = '') {
    const row = document.createElement('div');
    row.className = 'damage-row';

    // Dano input
    const inputDmg = document.createElement('input');
    inputDmg.type = 'text';
    inputDmg.placeholder = 'Ex: 1d6 fogo';
    inputDmg.value = dmgText;
    inputDmg.style.flex = '1';

    // Tipo select (simples select com TIPOS_DANO)
    const selectType = document.createElement('select');
    selectType.className = 'dmg-type';
    const emptyOpt = document.createElement('option');
    emptyOpt.value = '';
    emptyOpt.textContent = 'Tipo (opcional)';
    selectType.appendChild(emptyOpt);
    TIPOS_DANO.forEach(t => {
      const opt = document.createElement('option');
      opt.value = t;
      opt.textContent = t;
      if (t === dmgType) opt.selected = true;
      selectType.appendChild(opt);
    });

    // Remove button
    const rem = document.createElement('button');
    rem.type = 'button';
    rem.className = 'remove-dmg';
    rem.textContent = '✖';
    rem.title = 'Remover';
    rem.addEventListener('click', (e) => {
      e.preventDefault();
      row.remove();
    });

    row.appendChild(inputDmg);
    row.appendChild(selectType);
    row.appendChild(rem);

    return row;
  }

  // inicializa com preMore (se houver)
  if (preMore && preMore.length) {
    preMore.forEach(m => {
      // se m for string no formato "X / Tipo" tenta separar, senão deixa tudo no input
      let val = String(m);
      let type = '';
      // tentativa simples de extrair tipo entre parênteses ou depois de " - "
      // (não obrigatório)
      const splitByDash = val.split(' - ');
      if (splitByDash.length === 2) { val = splitByDash[0]; type = splitByDash[1]; }
      const row = createDamageRow(val, type);
      moreRoot.appendChild(row);
    });
  }

  // adiciona a linha principal também se houver valor padrão no input de Dano
  const mainDamageInput = modal.querySelector('#item-damage');
  if (mainDamageInput && mainDamageInput.value) {
    // Não transformar em row — este input é o dano principal. As linhas extras ficam em moreRoot.
  }

  // botão de adicionar linha
  const btnAddMore = modal.querySelector('#add-more-dmg');
  btnAddMore.addEventListener('click', (ev) => {
    ev.preventDefault();
    const r = createDamageRow('', '');
    moreRoot.appendChild(r);
    // scroll para o final do container
    moreRoot.scrollTop = moreRoot.scrollHeight;
  });

  // fechar painéis ao clicar fora
  function onDocClick(e) {
    if (!modal.contains(e.target)) {
      carPanel.style.display = 'none';
      dmgPanel.style.display = 'none';
    }
  }
  document.addEventListener('click', onDocClick);

  // Close handlers
  function closeModal() {
    document.removeEventListener('click', onDocClick);
    modal.remove();
  }
  modal.querySelector('.modal-close').addEventListener('click', closeModal);
  modal.querySelector('.btn-cancel').addEventListener('click', (ev) => { ev.preventDefault(); closeModal(); });

  // Botão Lista Padrão (placeholder)
  const btnLista = modal.querySelector('#btnListaPadrao');
  if (btnLista) {
    btnLista.addEventListener('click', (ev) => { ev.preventDefault(); btnLista.style.transform = 'scale(0.98)'; setTimeout(()=>btnLista.style.transform='','120'); });
  }

  // Save handler: coleta campos e linhas de dano extra
  modal.querySelector('.btn-save-item').addEventListener('click', (ev) => {
    ev.preventDefault();

    const name = modal.querySelector('#item-name').value.trim() || 'Sem nome';
    const damage = modal.querySelector('#item-damage').value.trim() || '';
    const crit = modal.querySelector('#item-crit').value.trim() || '20';
    const multiplicador = modal.querySelector('#item-mult').value.trim() || '2';
    const alcance = modal.querySelector('#item-range').value.trim() || '1.5m';
    const description = modal.querySelector('#item-desc').value.trim() || '';

    const profEl = modal.querySelector('#prof-pills .pill.active');
    const proficiency = profEl ? profEl.getAttribute('data-val') : '';

    const tipoEl = modal.querySelector('#tipo-pills .pill.active');
    const tipoArma = tipoEl ? tipoEl.getAttribute('data-val') : '';

    const empEl = modal.querySelector('#emp-pills .pill.active');
    const empunhadura = empEl ? empEl.getAttribute('data-val') : '';

    const caracteristicas = Array.from(modal.querySelectorAll('#car-panel .car-checkbox:checked')).map(x => x.value);
    const damageTypes = Array.from(modal.querySelectorAll('#dmg-panel .dmg-checkbox:checked')).map(x => x.value);

    // coleta linhas extras
    const extraRows = Array.from(moreRoot.querySelectorAll('.damage-row'));
    const moreDmgList = extraRows.map(r => {
      const d = r.querySelector('input[type="text"]').value.trim();
      const t = r.querySelector('select').value;
      if (!d && !t) return null;
      if (d && t) return `${d} - ${t}`;
      return d || t;
    }).filter(Boolean);

    const novo = {
      id: existingItem ? existingItem.id : uid(),
      name: name,
      type: 'Arma',
      damage: damage,
      crit: crit,
      multiplicador: multiplicador,
      alcance: alcance,
      moreDmgList: moreDmgList,
      moreDmg: moreDmgList.join(' | '),
      description: description,
      isEquipable: true,
      equip: existingItem ? !!existingItem.equip : false,
      expanded: true,
      proficiency: proficiency,
      tipoArma: tipoArma,
      empunhadura: empunhadura,
      caracteristicas: caracteristicas,
      damageTypes: damageTypes
    };

    if (existingItem) {
      state.inventory = state.inventory.map(i => i.id === novo.id ? { ...i, ...novo } : i);
    } else {
      state.inventory.unshift(novo);
    }

    closeModal();
    renderInventory();
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
    header.addEventListener('click', () => {
      const hab = state.abilities.find(h => h.id === id); hab.expanded = !hab.expanded; renderAbilities();
    });
  });

  document.querySelectorAll('.remover-hab').forEach(el => el.addEventListener('click', (ev) => { ev.preventDefault(); const id = Number(el.getAttribute('data-id')); state.abilities = state.abilities.filter(h => h.id !== id); renderAbilities(); }));

  document.querySelectorAll('.editar-hab').forEach(el => el.addEventListener('click', (ev) => {
    ev.preventDefault();
    const id = Number(el.getAttribute('data-id'));
    const hab = state.abilities.find(h => h.id === id);
    if (!hab) return;
    openNewAbilityModal(hab);
  }));

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
  const caretSymbol = s.expanded ? 'ᐱ' : 'ᐯ';
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

function renderSpells() {
  const html = `
    <div class="spells-wrapper" style="position:relative;">
      <div class="spells-controls controls-row" style="margin-top:10px;">
        <input id="filterMagias" placeholder="Filtrar minhas magias" />
        <div class="right-controls">
          <button id="botAddSpell" class="btn-add">Nova Magia</button>
          <div class="dt-magias">
            <label>DT DE Magias</label>
            <input id="dtMagiasInput" type="number" value="${state.dtMagias}" />
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
  
  const botAdd = document.getElementById('botAddSpell');
  if (botAdd) botAdd.addEventListener('click', () => openSpellCatalogOverlay());
  
  const filtro = document.getElementById('filterMagias');
  if (filtro) filtro.addEventListener('input', (e) => {
    const q = e.target.value.toLowerCase();
    document.querySelectorAll('.spell-card').forEach(card => {
      const title = card.querySelector('.spell-title').textContent.toLowerCase();
      card.style.display = title.includes(q) ? '' : 'none';
    });
  });
  document.querySelectorAll('.spell-card').forEach(card => {
    const id = Number(card.getAttribute('data-id'));
    const header = card.querySelector('.card-header');
    header.addEventListener('click', (ev) => {
      if (ev.target.closest('.spell-right') || ev.target.closest('.check-ativar') || ev.target.closest('.spell-activate')) return;
      const s = state.spells.find(x => x.id === id);
      if (!s) return;
      s.expanded = !s.expanded;
      renderSpells();
    });
    const ch = card.querySelector('.spell-activate');
    if (ch) {
      ch.addEventListener('click', ev => ev.stopPropagation());
      ch.addEventListener('change', (ev) => {
        ev.stopPropagation();
        const s = state.spells.find(x => x.id === id);
        if (s) s.active = ev.target.checked;
      });
    }
  });
  document.querySelectorAll('.remover-spell').forEach(a => a.addEventListener('click', (ev) => { ev.preventDefault(); const id = Number(a.getAttribute('data-id')); state.spells = state.spells.filter(s => s.id !== id); renderSpells(); }));
  document.querySelectorAll('.editar-spell').forEach(a => a.addEventListener('click', (ev) => { ev.preventDefault(); const id = Number(a.getAttribute('data-id')); const s = state.spells.find(x => x.id === id); if (!s) return; openSpellModal(s); }));
  const dtInput = document.getElementById('dtMagiasInput');
  if (dtInput) dtInput.addEventListener('change', (ev) => { state.dtMagias = Number(ev.target.value) || 0; });
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
  const schoolSel = modal.querySelector('#modal-school');
  if (existingSpell && existingSpell.school) {
    for (let i=0;i<schoolSel.options.length;i++){
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
      renderSpells();
    });
  }
}

/* ---------------- CATALOGO MAGIAS (ATUALIZADO) ---------------- */
function openSpellCatalogOverlay(parentModal = null) {
  const existing = document.querySelector('.catalog-overlay-large');
  if (existing) {
    existing.remove();
    return;
  }
  const overlay = document.createElement('div');
  overlay.className = 'catalog-overlay-large';

  const filters = [
    { label: 'Todos', val: 'all' },
    { label: 'Truque (0º)', val: '0' }
  ];
  for(let i=1; i<=9; i++) {
    filters.push({ label: `${i}º Círculo`, val: String(i) });
  }

  const circlesHtml = filters.map((f, idx) => {
    return `<button class="circle-filter ${idx===0?'active':''}" data-filter="${f.val}">${f.label}</button>`;
  }).join('');

  overlay.innerHTML = `
    <div class="catalog-large" role="dialog" aria-modal="true">
      <div class="catalog-large-header">
        <h3>Adicionar Magias</h3>
        <div style="display:flex;gap:8px;align-items:center;">
            <button id="catalog-new-spell" class="btn-add" style="background:#222;border:1px solid rgba(255,255,255,0.04);">Criar Magia</button>
            <div class="catalog-large-close" title="Fechar">✖</div>
        </div>
      </div>
      <div class="catalog-large-filters">
        ${circlesHtml}
      </div>
      <div class="catalog-large-search">
        <input id="catalogLargeSearch" placeholder="Buscar" />
      </div>
      <div class="catalog-large-list">
        ${state.spellCatalog.map(c => formatCatalogSpellCard(c)).join('')}
      </div>
    </div>
  `;
  document.body.appendChild(overlay);
  
  overlay.querySelector('.catalog-large-close').addEventListener('click', () => overlay.remove());

  const btnCriar = overlay.querySelector('#catalog-new-spell');
  if(btnCriar) {
      btnCriar.addEventListener('click', (ev) => {
          ev.stopPropagation();
          openSpellModal(null);
      });
  }

  overlay.querySelectorAll('.circle-filter').forEach(btn => {
    btn.addEventListener('click', () => {
      overlay.querySelectorAll('.circle-filter').forEach(b => b.classList.remove('active'));
      btn.classList.add('active');
      const filter = btn.getAttribute('data-filter');
      overlay.querySelectorAll('.catalog-card-item').forEach(card => {
        if (filter === 'all') { card.style.display = ''; return; }
        const lvl = card.getAttribute('data-level') || '';
        card.style.display = (String(lvl) === String(filter)) ? '' : 'none';
      });
    });
  });
  const search = overlay.querySelector('#catalogLargeSearch');
  if (search) {
    search.addEventListener('input', (e) => {
      const q = e.target.value.toLowerCase();
      overlay.querySelectorAll('.catalog-card-item').forEach(it => {
        const title = it.querySelector('.catalog-card-title').textContent.toLowerCase();
        it.style.display = title.includes(q) ? '' : 'none';
      });
    });
  }
  overlay.querySelectorAll('.catalog-add-btn').forEach(btn => {
    btn.addEventListener('click', (ev) => {
      const id = btn.getAttribute('data-id');
      const c = state.spellCatalog.find(x => x.id === id);
      if (!c) return;
      const novo = {
        id: uid(),
        name: c.name,
        levelNumber: c.levelNumber,
        damage: c.damage,
        expanded: true,
        active: false,
        components: { ...c.components },
        material: c.material,
        attrs: { ...c.attrs },
        school: c.school,
        spellClass: c.spellClass,
        description: c.description
      };
      state.spells.unshift(novo);
      renderSpells();
    });
  });
  overlay.querySelectorAll('.catalog-card-toggle').forEach(toggle => {
    toggle.addEventListener('click', (ev) => {
      const card = toggle.closest('.catalog-card-item');
      if (!card) return;
      const body = card.querySelector('.catalog-card-body');
      if (!body) return;
      const opened = body.style.display !== 'none' && body.style.display !== '';
      body.style.display = opened ? 'none' : 'block';
      toggle.textContent = opened ? '▸' : '▾';
    });
  });
  overlay.querySelectorAll('.catalog-card-header .left').forEach(left => {
    left.addEventListener('click', (ev) => {
      const toggle = left.querySelector('.catalog-card-toggle');
      if (toggle) toggle.click();
    });
  });
  overlay.addEventListener('click', (ev) => {
    if (ev.target === overlay) overlay.remove();
  });
  function onEsc(e) { if (e.key === 'Escape') { overlay.remove(); document.removeEventListener('keydown', onEsc); } }
  document.addEventListener('keydown', onEsc);
}

function formatCatalogSpellCard(c) {
  const v = c.components?.V ? 'V' : '';
  const s = c.components?.S ? 'S' : '';
  const m = c.components?.M ? 'M' : '';
  const comps = [v,s,m].filter(x=>x).join(' ') || '-';

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
               <span style="margin-right:12px;"><strong style="color:#9c27b0">Classe:</strong> ${c.spellClass||'-'}</span>
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

/* ---------------- HABILIDADES CATALOG / NOVA HABILIDADE (igual antes) ---------------- */
function openAbilityCatalogOverlay() {
  const existing = document.querySelector('.catalog-overlay-large-abilities');
  if (existing) {
    existing.remove();
    return;
  }

  let activeClass = CLASSES_AVAILABLE.includes('Talentos') ? 'Talentos' : CLASSES_AVAILABLE[0];
  let activeClassHabilitySelected = true;
  let activeSubclass = null;

  const overlay = document.createElement('div');
  overlay.className = 'catalog-overlay-large catalog-overlay-large-abilities';

  const classesHtml = CLASSES_AVAILABLE.map(c => `<button class="ability-class-btn" data-class="${c}">${c}</button>`).join('');

  overlay.innerHTML = `
    <div class="catalog-large" role="dialog" aria-modal="true" style="width:980px; max-width:calc(100% - 40px);">
      <div class="catalog-large-header" style="display:flex;justify-content:space-between;align-items:center;gap:12px;">
        <h3>Adicionar Habilidades</h3>
        <div style="display:flex;gap:8px;align-items:center;">
          <button id="catalog-new-hab" class="btn-add" style="background:#222;border:1px solid rgba(255,255,255,0.04);">Nova Habilidade</button>
          <div class="catalog-large-close" title="Fechar">✖</div>
        </div>
      </div>

      <div class="catalog-large-classes">
        ${classesHtml}
      </div>

      <div id="catalog-class-habilities-row" style="display:flex;margin-top:6px;"></div>
      <div id="catalog-subclasses-row" style="display:none;margin-top:8px;padding-bottom:6px;"></div>

      <div class="catalog-large-search" style="margin-top:6px;">
        <input id="catalogAbilitySearch" placeholder="Buscar habilidades" />
      </div>

      <div class="catalog-large-list abilities-list-large" style="margin-top:10px; overflow:auto; max-height:56vh;">
        ${state.abilityCatalog.map(c => formatCatalogAbilityCard(c)).join('')}
      </div>
    </div>
  `;

  document.body.appendChild(overlay);

  overlay.querySelector('.catalog-large-close').addEventListener('click', () => overlay.remove());

  if (activeClass) {
    const btn = overlay.querySelector(`.ability-class-btn[data-class="${activeClass}"]`);
    if (btn) btn.classList.add('active');
  }

  const headerNewBtn = overlay.querySelector('#catalog-new-hab');
  if (headerNewBtn) headerNewBtn.addEventListener('click', (ev) => { ev.stopPropagation(); openNewAbilityModal(null); });

  overlay.querySelectorAll('.ability-class-btn').forEach(btn => {
    btn.addEventListener('click', () => {
      overlay.querySelectorAll('.ability-class-btn').forEach(b => b.classList.remove('active'));
      btn.classList.add('active');
      activeClass = btn.getAttribute('data-class');
      activeClassHabilitySelected = true;
      activeSubclass = null;
      renderClassHabilitiesRow();
      renderSubclassesRow();
      renderCatalogList();
      btn.scrollIntoView({ inline: 'center', behavior: 'smooth' });
    });
  });

  function renderClassHabilitiesRow() {
    const row = overlay.querySelector('#catalog-class-habilities-row');
    if (!activeClass) { row.style.display = 'none'; row.innerHTML = ''; return; }
    const pillHtml = `<button class="catalog-class-hability-pill ${activeClassHabilitySelected?'active':''}" data-class-p="${escapeHtml(activeClass)}">Habilidades de ${escapeHtml(activeClass)}</button>`;
    row.style.display = 'flex';
    row.style.gap = '8px';
    row.style.flexWrap = 'wrap';
    row.innerHTML = pillHtml;

    row.querySelectorAll('.catalog-class-hability-pill').forEach(b => {
      b.addEventListener('click', (ev) => {
        row.querySelectorAll('.catalog-class-hability-pill').forEach(x => x.classList.remove('active'));
        b.classList.add('active');
        activeClassHabilitySelected = true;
        activeSubclass = null;
        const subrow = overlay.querySelector('#catalog-subclasses-row');
        if (subrow) subrow.querySelectorAll('.ability-sub-btn').forEach(x => x.classList.remove('active'));
        renderCatalogList();
      });
    });
  }

  function renderSubclassesRow() {
    const row = overlay.querySelector('#catalog-subclasses-row');
    if (!activeClass) { row.style.display = 'none'; row.innerHTML = ''; return; }
    const subs = CLASSES_WITH_SUBCLASSES[activeClass] || [];
    if (!subs.length) { row.style.display = 'none'; row.innerHTML = ''; return; }
    let html = subs.map(s => `<button class="ability-sub-btn" data-sub="${escapeHtml(s)}">${s}</button>`).join('');
    row.style.display = 'flex';
    row.style.gap = '8px';
    row.style.flexWrap = 'wrap';
    row.innerHTML = html;

    row.querySelectorAll('.ability-sub-btn').forEach(b => {
      b.addEventListener('click', (ev) => {
        row.querySelectorAll('.ability-sub-btn').forEach(x => x.classList.remove('active'));
        b.classList.add('active');
        activeClassHabilitySelected = false;
        activeSubclass = b.getAttribute('data-sub');
        const classRow = overlay.querySelector('#catalog-class-habilities-row');
        if (classRow) classRow.querySelectorAll('.catalog-class-hability-pill').forEach(x => x.classList.remove('active'));
        renderCatalogList();
      });
    });
  }

  function renderCatalogList() {
    const container = overlay.querySelector('.abilities-list-large');
    const q = overlay.querySelector('#catalogAbilitySearch').value.trim().toLowerCase();
    let items = [...state.abilityCatalog];

    if (activeClass) {
      if (activeClassHabilitySelected) {
        items = items.filter(it => it.class === activeClass && (!it.subclass || it.subclass === ''));
      } else if (activeSubclass) {
        items = items.filter(it => it.class === activeClass && it.subclass === activeSubclass);
      }
    }

    if (q) items = items.filter(it => (it.name || '').toLowerCase().includes(q) || (it.description||'').toLowerCase().includes(q));

    if (!items.length) {
      container.innerHTML = `<div style="color:#ddd;padding:18px;">Nenhuma habilidade encontrada para a seleção atual.</div>`;
      return;
    }

    container.innerHTML = items.map(c => formatCatalogAbilityCard(c)).join('');

    container.querySelectorAll('.catalog-add-ability-btn').forEach(btn => {
      btn.addEventListener('click', (ev) => {
        ev.stopPropagation();
        const id = btn.getAttribute('data-id');
        const c = state.abilityCatalog.find(x => x.id === id);
        if (!c) return;
        const novo = { id: uid(), title: c.name, description: c.description || '', expanded: true, class: '', subclass: '' };
        state.abilities.unshift(novo);
        renderAbilities();
      });
    });

    container.querySelectorAll('.catalog-card-ability').forEach(card => {
      card.onclick = null;
      card.addEventListener('click', (ev) => {
        if (ev.target.closest('.catalog-add-ability-btn')) return;
        const body = card.querySelector('.catalog-card-ability-body');
        if (!body) return;
        const opened = body.style.display !== 'none' && body.style.display !== '';
        body.style.display = opened ? 'none' : 'block';
        const toggleBtn = card.querySelector('.catalog-ability-toggle');
        if (toggleBtn) toggleBtn.textContent = opened ? '▸' : '▾';
      });
    });

    container.querySelectorAll('.catalog-ability-toggle').forEach(t => {
      t.addEventListener('click', (ev) => {
        ev.stopPropagation();
        const card = t.closest('.catalog-card-ability');
        const body = card.querySelector('.catalog-card-ability-body');
        const opened = body.style.display !== 'none' && body.style.display !== '';
        body.style.display = opened ? 'none' : 'block';
        t.textContent = opened ? '▸' : '▾';
      });
    });
  }

  const search = overlay.querySelector('#catalogAbilitySearch');
  if (search) search.addEventListener('input', () => renderCatalogList());

  renderClassHabilitiesRow();
  renderSubclassesRow();
  renderCatalogList();

  overlay.addEventListener('click', (ev) => { if (ev.target === overlay) overlay.remove(); });
  function onEsc(e) { if (e.key === 'Escape') { overlay.remove(); document.removeEventListener('keydown', onEsc); } }
  document.addEventListener('keydown', onEsc);
}

function formatCatalogAbilityCard(c) {
  return `
    <div class="catalog-card-ability card" data-id="${c.id}" data-cat="${c.category || 'Gerais'}" style="margin-bottom:8px;">
      <div style="display:flex;justify-content:space-between;align-items:flex-start;gap:12px;">
        <div style="display:flex;gap:12px;align-items:center;min-width:0;cursor:pointer;">
          <button class="catalog-ability-toggle">▸</button>
          <div style="min-width:0;">
            <div class="catalog-card-title" style="font-weight:800;font-size:16px;color:#fff;">${c.name}</div>
          </div>
        </div>
        <div style="display:flex;align-items:center;gap:12px;">
          <button class="catalog-add-ability-btn plus-btn" data-id="${c.id}" title="Adicionar">+</button>
        </div>
      </div>

      <div class="catalog-card-ability-body" style="display:none;margin-top:8px;color:#ddd;">
        <div style="display:flex;gap:12px;">
          <div style="flex:1;">
            <p style="margin:0;color:#ddd;">${c.description || 'Sem descrição.'}</p>
          </div>
        </div>
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

  const closeAll = () => modal.remove();
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
  });
}

/* ---------------- DESCRIÇÃO ---------------- */
function renderDescription() {
  const d = state.description;
  conteudoEl.innerHTML = `
    <div class="desc-grid">
      <label>Anotações</label>
      <textarea id="desc-anotacoes" placeholder="Anotações pessoais do agente...">${d.anotacoes}</textarea>
      <label>Aparência</label>
      <textarea id="desc-aparencia" placeholder="Nome, gênero, idade, descrição física...">${d.aparencia}</textarea>
      <label>Personalidade</label>
      <textarea id="desc-personalidade" placeholder="Traços marcantes, opiniões, ideais...">${d.personalidade}</textarea>
      <label>Objetivo</label>
      <textarea id="desc-objetivo" placeholder="Objetivos...">${d.objetivo}</textarea>
      <label>Ideais</label>
      <textarea id="desc-ideais" placeholder="Ideais...">${d.ideais}</textarea>
      <label>Vínculos</label>
      <textarea id="desc-vinculos" placeholder="Vínculos...">${d.vinculos}</textarea>
      <label>Fraquezas</label>
      <textarea id="desc-fraquezas" placeholder="Fraquezas...">${d.fraquezas}</textarea>
      <label>História</label>
      <textarea id="desc-historia" placeholder="História...">${d.historia}</textarea>
      <div class="desc-actions">
        <button id="salvarDesc" class="btn-save">Salvar</button>
      </div>
    </div>
  `;
  const bot = document.getElementById('salvarDesc');
  if (bot) bot.addEventListener('click', () => {
    state.description.anotacoes = document.getElementById('desc-anotacoes').value;
    state.description.aparencia = document.getElementById('desc-aparencia').value;
    state.description.personalidade = document.getElementById('desc-personalidade').value;
    state.description.objetivo = document.getElementById('desc-objetivo').value;
    state.description.ideais = document.getElementById('desc-ideais').value;
    state.description.vinculos = document.getElementById('desc-vinculos').value;
    state.description.fraquezas = document.getElementById('desc-fraquezas').value;
    state.description.historia = document.getElementById('desc-historia').value;
    alert('Descrição salva (memória temporária).');
  });
}

function renderActiveTab() {
  switch (state.activeTab) {
    case 'Combate': renderCombat(); break;
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
  return String(str).replaceAll('&','&amp;').replaceAll('<','&lt;').replaceAll('>','&gt;').replaceAll('"','&quot;').replaceAll("'",'&#39;');
}
