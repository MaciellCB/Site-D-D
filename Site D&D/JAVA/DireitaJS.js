// DireitaJS.js (arquivo completo)
// Atualizado: overlay catálogo toggle, z-index acima do modal, evita duplicatas.

const state = {
  activeTab: 'Combate',
  dtMagias: 12,
  inventory: [
    { id: 1, name: 'Bastão', type: 'Arma', damage: '1d6/1d8', crit: 'x2', equip: true, isEquipable: true, expanded: false, description: 'Bastão robusto' },
    { id: 2, name: 'Escudo Grande de Aço', type: 'Proteção', defense: '+2', equip: false, isEquipable: true, expanded: true, description: 'Escudo pesado.' },
    { id: 3, name: 'Mochila', type: 'Geral', equip: false, isEquipable: false, expanded: false, description: 'Carrega coisas.' }
  ],
  abilities: [
    { id: 1, title: 'exemplo', description: 'exemplo', expanded: true },
    { id: 2, title: 'teste', description: 'descrição do teste', expanded: false }
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
      description: 'Uma explosão de chamas que causa dano em área.'
    }
  ],
  spellCatalog: [
    { id: 'c1', name: 'Bola de Fogo', school: 'Evocação', damage: '1d10+3', levelNumber: 1, description: 'Um veio brilhante lampeja na ponta do seu dedo...' },
    { id: 'c2', name: 'Raio Congelante', school: 'Evocação', damage: '1d8', levelNumber: 1, description: 'Um jato de frio que reduz a velocidade...' },
    { id: 'c3', name: 'Muralha de Fogo', school: 'Evocação', damage: '-', levelNumber: 3, description: 'Ergue uma parede de chamas' }
  ],
  description: { anotacoes: '', aparencia: '', personalidade: '', objetivo: '', ideais: '', vinculos: '', fraquezas: '', historia: '' }
};

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
  const metaInline = item.type === 'Arma'
    ? `Dano: <strong>${item.damage || '-'}</strong>`
    : item.type === 'Proteção'
      ? `Defesa: <strong>${item.defense || '-'}</strong>`
      : `${item.type}`;

  const checked = item.isEquipable && item.equip ? 'checked' : '';
  return `
    <div class="card item-card ${item.expanded ? 'expanded' : ''}" data-id="${item.id}">
      <div class="card-header compact">
        <div class="left" data-id="${item.id}">
          <span class="caret">${item.expanded ? '▾' : '▸'}</span>
          <div class="title-block">
            <div class="card-title">${item.name}</div>
            <div class="card-sub mini-sub">${metaInline}</div>
          </div>
        </div>
        <div class="right">
          ${item.isEquipable ? `<label class="header-equip"><input class="item-equip-checkbox" type="checkbox" data-id="${item.id}" ${checked}/><span class="square-check"></span></label>` : ''}
        </div>
      </div>
      <div class="card-body" style="${item.expanded ? '' : 'display:none;'}">
        ${item.description ? `<p>${item.description}</p>` : ''}
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
      const novoNome = prompt('Editar nome do item', it.name);
      if (novoNome !== null) it.name = novoNome.trim() || it.name;
      const novaDesc = prompt('Editar descrição', it.description || '');
      if (novaDesc !== null) it.description = novaDesc;
      renderInventory();
    });
  });

  const botAdd = document.getElementById('botAddItem');
  if (botAdd) botAdd.addEventListener('click', () => { const novoId = uid(); state.inventory.unshift({ id: novoId, name: 'Item Novo', type: 'Geral', equip: false, isEquipable: false, expanded: true, description: '' }); renderInventory(); });

  const filtro = document.getElementById('filterItens');
  if (filtro) filtro.addEventListener('input', (e) => {
    const q = e.target.value.toLowerCase();
    document.querySelectorAll('.item-card').forEach(card => {
      const title = card.querySelector('.card-title').textContent.toLowerCase();
      card.style.display = title.includes(q) ? '' : 'none';
    });
  });
}

/* ---------------- COMBATE ---------------- */
function renderCombat() {
  const equipped = state.inventory.filter(i => i.equip);
  if (!equipped.length) { conteudoEl.innerHTML = `<p class="empty-tip">Você ainda não possui ataques ou equipamentos equipados para combate.</p>`; return; }
  const html = `<div class="inventory-list">${equipped.map(formatInventoryItem).join('')}</div>`;
  conteudoEl.innerHTML = html;
  bindInventoryCardEvents();
}

/* ---------------- HABILIDADES ---------------- */
function renderAbilities() {
  const html = `
    <div class="abilities-controls controls-row">
      <input id="filterHabs" placeholder="Filtrar habilidades" />
      <div class="right-controls">
        <button id="botAddHab" class="btn-add">Adicionar</button>
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
            <div class="card-meta"></div>
          </div>
          <div class="card-body" style="${a.expanded ? '' : 'display:none;'}">
            <div>${a.description}</div>
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
    const novoTitulo = prompt('Editar título da habilidade', hab.title);
    if (novoTitulo !== null) hab.title = novoTitulo.trim() || hab.title;
    const novaDesc = prompt('Editar descrição', hab.description || '');
    if (novaDesc !== null) hab.description = novaDesc;
    renderAbilities();
  }));

  const botAdd = document.getElementById('botAddHab');
  if (botAdd) botAdd.addEventListener('click', () => { state.abilities.unshift({ id: uid(), title: 'Nova Habilidade', description: 'descrição', expanded: true }); renderAbilities(); });

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
  const schoolPill = `<div class="pill">${s.school || '—'}</div>`;
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

  return `
    <div class="card spell-card ${s.expanded ? 'expanded' : ''}" data-id="${s.id}">
      <div class="card-header spell-header">
        <div class="spell-left" data-id="${s.id}">
          <span class="caret">${s.expanded ? '▾' : '▸'}</span>
          <div class="spell-title-block">
            <div class="card-title spell-title">${s.name}</div>
          </div>
        </div>

        <div class="spell-right">
          <div class="spell-level-num">${s.levelNumber !== undefined ? s.levelNumber : ''}</div>
          <div class="card-meta spell-damage">${s.damage || '-'} <img class="dice-img" src="img/dado.png" alt="dado" /></div>
          <label class="check-ativar"><input class="spell-activate" type="checkbox" data-id="${s.id}" ${s.active ? 'checked' : ''}/> </label>
          <button class="plus-btn small-add" data-id="${s.id}" title="Adicionar/duplicar">+</button>
        </div>
      </div>

      <div class="card-body" style="${s.expanded ? '' : 'display:none;'}">
        <div style="display:flex; gap:12px; align-items:flex-start;">
          ${schoolPill}
          ${compRow}
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
  const catalogHtml = `
    <div class="spells-wrapper" style="position:relative;">
      <button id="magias-big-btn" class="magias-big-btn">Magias</button>

      <div class="spells-controls controls-row" style="margin-top:10px;">
        <input id="filterRituais" placeholder="Filtrar magias" />
        <div class="right-controls">
          <button id="botAddSpell" class="btn-add">Novo Ritual</button>
          <div class="dt-magias">
            <label>DT DE Magias</label>
            <input id="dtMagiasInput" type="number" value="${state.dtMagias}" />
          </div>
        </div>
      </div>

      <div class="catalog-list card" style="margin-top:6px;">
        ${state.spellCatalog.map(c => `
          <div class="catalog-item" data-id="${c.id}" style="display:flex;align-items:center;justify-content:space-between;padding:12px 8px;border-bottom:1px solid rgba(255,255,255,0.03);">
            <div style="font-weight:800;">${c.name}</div>
            <div style="display:flex;align-items:center;gap:8px;">
              <div style="font-weight:800;color:#cfcfcf;padding:6px 8px;border-radius:6px;background:#111;border:1px solid rgba(255,255,255,0.03);"> ${c.levelNumber || ''} </div>
              <button class="plus-btn" data-id="${c.id}" title="Adicionar esta magia">+</button>
            </div>
          </div>
        `).join('')}
      </div>

      <h4 style="margin:12px 0 6px 4px;color:#ddd;">Minhas Magias</h4>

      <div class="spells-list">
        ${state.spells.map(formatMySpellCard).join('')}
      </div>
    </div>
  `;

  conteudoEl.innerHTML = catalogHtml;

  // botão grande "Magias" abre/fecha a tela grande (toggle)
  const bigBtn = document.getElementById('magias-big-btn');
  if (bigBtn) {
    bigBtn.addEventListener('click', (ev) => {
      ev.stopPropagation();
      openSpellCatalogOverlay();
    });
  }

  // bindings catálogo (na aba)
  document.querySelectorAll('.catalog-list .plus-btn').forEach(btn => {
    btn.addEventListener('click', (ev) => {
      const id = btn.getAttribute('data-id');
      addSpellFromCatalog(id);
    });
  });

  // novo ritual via modal
  const botAdd = document.getElementById('botAddSpell');
  if (botAdd) botAdd.addEventListener('click', () => openSpellModal());

  const filtro = document.getElementById('filterRituais');
  if (filtro) filtro.addEventListener('input', (e) => {
    const q = e.target.value.toLowerCase();
    document.querySelectorAll('.catalog-item').forEach(item => {
      const title = item.querySelector('div').textContent.toLowerCase();
      item.style.display = title.includes(q) ? 'flex' : 'none';
    });
  });

  // bind minhas magias
  document.querySelectorAll('.spell-card').forEach(card => {
    const id = Number(card.getAttribute('data-id'));
    const header = card.querySelector('.card-header');
    header.addEventListener('click', (ev) => {
      if (ev.target.closest('.spell-right') || ev.target.closest('.spell-activate')) return;
      const s = state.spells.find(x => x.id === id);
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

  document.querySelectorAll('.small-add').forEach(b => {
    b.addEventListener('click', (ev) => {
      const id = Number(b.getAttribute('data-id'));
      const s = state.spells.find(x => x.id === id);
      if (!s) return;
      const copy = JSON.parse(JSON.stringify(s));
      copy.id = uid();
      copy.name = s.name + ' (cópia)';
      state.spells.unshift(copy);
      renderSpells();
    });
  });

  const dtInput = document.getElementById('dtMagiasInput');
  if (dtInput) dtInput.addEventListener('change', (ev) => { state.dtMagias = Number(ev.target.value) || 0; });
}

function addSpellFromCatalog(catalogId) {
  const c = state.spellCatalog.find(x => x.id === catalogId);
  if (!c) return;
  const novo = {
    id: uid(),
    name: c.name,
    levelNumber: c.levelNumber,
    damage: c.damage || '-',
    expanded: true,
    active: false,
    components: { V: false, S: false, M: false },
    material: '',
    attrs: { execucao: '-', alcance: '-', area: '-', alvo: '-', duracao: '-', resistencia: '-' },
    school: c.school || '',
    description: c.description || ''
  };
  state.spells.unshift(novo);
  renderSpells();
}

/* ---------------- MODAL: Novo / Editar Ritual ---------------- */
function openSpellModal(existingSpell = null) {
  const modal = document.createElement('div');
  modal.className = 'spell-modal-overlay';
  modal.innerHTML = `
    <div class="spell-modal">
      <div class="modal-header">
        <h3>${existingSpell ? 'Editar Ritual' : 'Novo Ritual'}</h3>
        <div style="display:flex;gap:8px;align-items:center;">
          <button id="modal-magias-btn" class="btn-add" title="Abrir catálogo de magias">Magias</button>
          <button class="modal-close">✖</button>
        </div>
      </div>
      <div class="modal-body">
        <label>Nome*</label>
        <input id="modal-name" type="text" value="${existingSpell ? escapeHtml(existingSpell.name) : 'Novo Ritual'}" />

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
            <input id="modal-level" type="number" min="0" value="${existingSpell && existingSpell.levelNumber !== undefined ? existingSpell.levelNumber : 1}" />
          </div>
          <div>
            <label>Execução</label>
            <input id="modal-exec" type="text" value="${existingSpell ? escapeHtml(existingSpell.attrs.execucao) : 'padrão'}" />
          </div>
          <div>
            <label>Alcance</label>
            <input id="modal-alc" type="text" value="${existingSpell ? escapeHtml(existingSpell.attrs.alcance) : 'pessoal'}" />
          </div>
        </div>

        <div class="modal-row">
          <div>
            <label>Área</label>
            <input id="modal-area" type="text" value="${existingSpell ? escapeHtml(existingSpell.attrs.area) : ''}" />
          </div>
          <div>
            <label>Alvo</label>
            <input id="modal-alvo" type="text" value="${existingSpell ? escapeHtml(existingSpell.attrs.alvo) : ''}" />
          </div>
          <div>
            <label>Duração</label>
            <input id="modal-dur" type="text" value="${existingSpell ? escapeHtml(existingSpell.attrs.duracao) : ''}" />
          </div>
          <div>
            <label>Resistência</label>
            <input id="modal-res" type="text" value="${existingSpell ? escapeHtml(existingSpell.attrs.resistencia) : ''}" />
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
            <input id="modal-material" type="text" value="${existingSpell ? escapeHtml(existingSpell.material) : ''}" />
          </div>
          <div style="flex:1">
            <label>Damage / Observações</label>
            <input id="modal-damage" type="text" value="${existingSpell ? escapeHtml(existingSpell.damage || '') : ''}" />
          </div>
        </div>

        <label>Descrição</label>
        <textarea id="modal-desc">${existingSpell ? escapeHtml(existingSpell.description) : ''}</textarea>
      </div>

      <div class="modal-actions">
        <button class="btn-add btn-save-modal">${existingSpell ? 'Salvar' : 'Adicionar'}</button>
        <button class="btn-add btn-cancel">Cancelar</button>
      </div>
    </div>
  `;

  document.body.appendChild(modal);

  // prefill
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

  modal.querySelector('.modal-close').addEventListener('click', () => modal.remove());
  modal.querySelector('.btn-cancel').addEventListener('click', (ev) => { ev.preventDefault(); modal.remove(); });

  // Botão Magias dentro do modal: toggle da tela grande (se já existir, fecha)
  const magiasBtn = modal.querySelector('#modal-magias-btn');
  if (magiasBtn) {
    magiasBtn.addEventListener('click', (ev) => {
      ev.stopPropagation();
      openSpellCatalogOverlay(modal); // toggle
    });
  }

  modal.querySelector('.btn-save-modal').addEventListener('click', (ev) => {
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
        execucao: modal.querySelector('#modal-exec').value.trim(),
        alcance: modal.querySelector('#modal-alc').value.trim(),
        area: modal.querySelector('#modal-area').value.trim(),
        alvo: modal.querySelector('#modal-alvo').value.trim(),
        duracao: modal.querySelector('#modal-dur').value.trim(),
        resistencia: modal.querySelector('#modal-res').value.trim()
      },
      school: modal.querySelector('#modal-school').value,
      description: modal.querySelector('#modal-desc').value.trim()
    };

    if (existingSpell) {
      state.spells = state.spells.map(s => s.id === novo.id ? novo : s);
    } else {
      state.spells.unshift(novo);
    }
    modal.remove();
    renderSpells();
  });
}

/* ---------------- TELA GRANDE: Catálogo (TOGGLE & z-index acima do modal) ---------------- */
function openSpellCatalogOverlay(parentModal = null) {
  // se já existe, fecha (toggle)
  const existing = document.querySelector('.catalog-overlay-large');
  if (existing) {
    existing.remove();
    return;
  }

  // cria overlay grande
  const overlay = document.createElement('div');
  overlay.className = 'catalog-overlay-large';
  const circlesHtml = ['Todos'].concat(Array.from({length:10}, (_,i) => `${i+1}º Círculo`)).map((t,idx) => {
    return `<button class="circle-filter ${idx===0?'active':''}" data-filter="${idx===0?'all':(idx)}">${t}</button>`;
  }).join('');

  overlay.innerHTML = `
    <div class="catalog-large">
      <div class="catalog-large-header">
        <h3>Adicionar Rituais</h3>
        <div class="catalog-large-close">✖</div>
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

  // anexar após body para garantir ordem no DOM (overlay acima de modais)
  document.body.appendChild(overlay);

  // handlers
  overlay.querySelector('.catalog-large-close').addEventListener('click', () => overlay.remove());

  // circle filters
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

  // search input
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

  // plus buttons: adicionam, mas NÃO fecham (permite adicionar várias)
  overlay.querySelectorAll('.catalog-add-btn').forEach(btn => {
    btn.addEventListener('click', (ev) => {
      const id = btn.getAttribute('data-id');
      addSpellFromCatalog(id);
      // mantém aberto
    });
  });

  // expand/collapse cards inside overlay
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

  // clique fora fecha
  overlay.addEventListener('click', (ev) => {
    if (ev.target === overlay) overlay.remove();
  });

  // ESC fecha
  function onEsc(e) { if (e.key === 'Escape') { overlay.remove(); document.removeEventListener('keydown', onEsc); } }
  document.addEventListener('keydown', onEsc);
}

function formatCatalogSpellCard(c) {
  return `
    <div class="catalog-card-item card" data-id="${c.id}" data-level="${c.levelNumber || ''}">
      <div class="catalog-card-header" style="display:flex;justify-content:space-between;align-items:center;">
        <div style="display:flex;align-items:center;gap:12px;">
          <button class="catalog-card-toggle">▸</button>
          <div>
            <div class="catalog-card-title" style="font-weight:800;font-size:18px;">${c.name}</div>
            <div style="font-size:13px;color:#bbb;">Escola: ${c.school || '-'}</div>
          </div>
        </div>
        <div style="display:flex;align-items:center;gap:12px;">
          <div style="font-weight:800;color:#cfcfcf;padding:6px 8px;border-radius:6px;background:#111;border:1px solid rgba(255,255,255,0.03);">${c.levelNumber || ''}</div>
          <div class="catalog-card-dmg" style="font-weight:800;color:#9c27b0;">${c.damage || '-'}</div>
          <button class="catalog-add-btn plus-btn" data-id="${c.id}" title="Adicionar">+</button>
        </div>
      </div>
      <div class="catalog-card-body" style="display:none;margin-top:10px;color:#ddd;">
        <div style="display:flex;gap:12px;">
          <div class="pill">${c.school || '—'}</div>
          <div class="comp-block" style="flex:1;">
            <div class="comp-material">Descrição: ${c.description || '-'}</div>
          </div>
        </div>
      </div>
    </div>
  `;
}

function escapeHtml(str) {
  if (!str) return '';
  return String(str).replaceAll('&','&amp;').replaceAll('<','&lt;').replaceAll('>','&gt;').replaceAll('"','&quot;').replaceAll("'",'&#39;');
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

/* ---------------- DISPATCHER & INIT ---------------- */
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
