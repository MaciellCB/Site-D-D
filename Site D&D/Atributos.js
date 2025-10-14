// ======================================
// Configurações de XP por nível
// ======================================
const xpPorNivel = {
  1: { max: 300, marco: 0 },
  2: { max: 900, marco: 0 },
  3: { max: 2700, marco: 1 },
  4: { max: 6500, marco: 1 },
  5: { max: 14000, marco: 1 },
  6: { max: 23000, marco: 2 },
  7: { max: 34000, marco: 2 },
  8: { max: 48000, marco: 2 },
  9: { max: 64000, marco: 2 },
  10: { max: 85000, marco: 2 },
  11: { max: 100000, marco: 3 },
  12: { max: 120000, marco: 3 },
  13: { max: 140000, marco: 3 },
  14: { max: 165000, marco: 3 },
  15: { max: 195000, marco: 3 },
  16: { max: 225000, marco: 4 },
  17: { max: 265000, marco: 4 },
  18: { max: 305000, marco: 4 },
  19: { max: 355000, marco: 5 },
  20: { max: 999999, marco: 99 }
};

// ======================================
// Classes iniciais
// ======================================
const classes = [
  { key: 'artifice', nome: 'Artífice', nivel: 0 },
  { key: 'barbaro', nome: 'Bárbaro', nivel: 0 },
  { key: 'bardo', nome: 'Bardo', nivel: 0 },
  { key: 'bruxo', nome: 'Bruxo', nivel: 0 },
  { key: 'clerigo', nome: 'Clérigo', nivel: 0 },
  { key: 'druida', nome: 'Druida', nivel: 0 },
  { key: 'feiticeiro', nome: 'Feiticeiro', nivel: 0 },
  { key: 'patrulheiro', nome: 'Patrulheiro', nivel: 0 },
  { key: 'guerreiro', nome: 'Guerreiro', nivel: 0 },
  { key: 'ladino', nome: 'Ladino', nivel: 0 },
  { key: 'mago', nome: 'Mago', nivel: 0 },
  { key: 'monge', nome: 'Monge', nivel: 0 },
  { key: 'paladino', nome: 'Paladino', nivel: 0 }
];

// ======================================
// DOM - elementos do HTML
// ======================================
const hexOverlay = document.querySelector('.hex-overlay');
const numeros = Array.from(document.querySelectorAll('.hexagrama .num'));
const editarPencil = document.querySelector('.editar-hex');

let mostrandoAtributos = true; // true -> atributos.png ; false -> modificador.png
let editMode = false;          // true -> edição permitida (somente se mostrandoAtributos)
let prevSum = 0;

// Elementos de foco de classe e XP
const nivelFocoEl = document.getElementById('nivelFoco');
const classeFocusEl = document.getElementById('classeFocus');
const classeFocusNomeEl = document.getElementById('classeFocusNome');
const classeFocusNivelEl = document.getElementById('classeFocusNivel');

const xpAtualEl = document.getElementById('xpAtual');
const xpTotalTextEl = document.getElementById('xpTotalText');
const xpBarEl = document.getElementById('xpBar');

const marcoAtualEl = document.getElementById('marcoAtual');
const marcoMaxEl = document.getElementById('marcoMax');
const marcoBarEl = document.getElementById('marcoBar');

const metrosEl = document.getElementById('metros');
const quadradosEl = document.getElementById('quadrados');

const inspLeftBtn = document.getElementById('inspiraLeft');
const inspRightBtn = document.getElementById('inspiraRight');
const inspValorEl = document.getElementById('inspiraValor');

const profValorEl = document.getElementById('proficienciaValor');

const painelEl = document.getElementById('painelClasses');
const listaClassesEl = document.getElementById('listaClasses');
const fecharPainelBtn = document.getElementById('fecharPainel');

// ======================================
// Utilitários
// ======================================
function somaNiveis() {
  return classes.reduce((s, c) => s + Number(c.nivel || 0), 0);
}

function nivelParaTabela(n) {
  if (n < 1) return null;
  const nivel = Math.max(1, Math.min(20, Math.floor(n)));
  return xpPorNivel[nivel];
}

function calcularModificador(n) {
  n = parseInt(n, 10);
  if (isNaN(n)) return 0;
  if (n <= 1) return -5;
  if (n <= 3) return -4;
  if (n <= 5) return -3;
  if (n <= 7) return -2;
  if (n <= 9) return -1;
  if (n <= 11) return 0;
  if (n <= 13) return 1;
  if (n <= 15) return 2;
  if (n <= 17) return 3;
  if (n <= 19) return 4;
  if (n <= 21) return 5;
  if (n <= 23) return 6;
  if (n <= 25) return 7;
  if (n <= 27) return 8;
  if (n <= 29) return 9;
  if (n <= 30) return 10;
  if (n > 30) return 11;
  return n;
}

function calcularProficiencia(nivelTotal) {
  if (nivelTotal < 1) return 0;
  if (nivelTotal <= 4) return 2;
  if (nivelTotal <= 8) return 3;
  if (nivelTotal <= 12) return 4;
  if (nivelTotal <= 16) return 5;
  return 6;
}

// ======================================
// Atributos e modificadores
// ======================================
// Inicializar dataset.attrValue
numeros.forEach(n => {
  const v = parseInt((n.textContent || '0').trim(), 10);
  n.dataset.attrValue = isNaN(v) ? '0' : String(v);
});

function mostrarAtributosNaTela() {
  numeros.forEach(n => {
    n.textContent = n.dataset.attrValue ?? '0';
    n.removeAttribute('contenteditable');
  });
  mostrandoAtributos = true;
  editMode = false;
  atualizarTudo();
}

function mostrarModificadoresNaTela() {
  if (editMode) salvarEdicaoAtributos();
  numeros.forEach(n => {
    if (n.dataset.attrValue === undefined) n.dataset.attrValue = String(parseInt((n.textContent || '0'), 10) || 0);
    n.textContent = String(calcularModificador(n.dataset.attrValue));
    n.removeAttribute('contenteditable');
  });
  mostrandoAtributos = false;
  editMode = false;
}

function habilitarEdicaoAtributos() {
  if (!mostrandoAtributos) return;
  editMode = true;
  numeros.forEach(n => {
    n.setAttribute('contenteditable', 'true');
    n.addEventListener('keydown', onNumKeyDown);
    n.addEventListener('blur', onNumBlur);
  });
}

function desabilitarEdicaoAtributos() {
  if (!editMode) return;
  salvarEdicaoAtributos();
  numeros.forEach(n => {
    n.removeAttribute('contenteditable');
    n.removeEventListener('keydown', onNumKeyDown);
    n.removeEventListener('blur', onNumBlur);
  });
  editMode = false;
}

function salvarEdicaoAtributos() {
  numeros.forEach(n => {
    let val = parseInt((n.textContent || '').trim(), 10);
    if (isNaN(val) || val < 0) val = 0;
    n.dataset.attrValue = String(val);
    n.textContent = String(val);
  });
}

function onNumKeyDown(e) {
  if (e.key === 'Enter') {
    e.preventDefault();
    e.target.blur();
  }
}

function onNumBlur(e) {
  const n = e.target;
  let val = parseInt((n.textContent || '').trim(), 10);
  if (isNaN(val) || val < 0) val = 0;
  n.dataset.attrValue = String(val);
  n.textContent = String(val);
}

// ======================================
// Eventos do hexágono e lápis
// ======================================
if (hexOverlay) {
  hexOverlay.style.cursor = 'pointer';
  hexOverlay.addEventListener('click', () => {
    if (mostrandoAtributos) {
      if (editMode) desabilitarEdicaoAtributos();
      hexOverlay.src = 'img/modificador.png';
      mostrarModificadoresNaTela();
    } else {
      hexOverlay.src = 'img/atributos.png';
      mostrarAtributosNaTela();
    }
  });
}

if (editarPencil) {
  editarPencil.addEventListener('click', () => {
    if (!mostrandoAtributos) {
      hexOverlay.src = 'img/atributos.png';
      mostrarAtributosNaTela();
      habilitarEdicaoAtributos();
      return;
    }
    if (!editMode) habilitarEdicaoAtributos();
    else desabilitarEdicaoAtributos();
  });
}

numeros.forEach(n => {
  n.addEventListener('click', (e) => {
    if (mostrandoAtributos && editMode) {
      const el = e.currentTarget;
      el.focus();
      const range = document.createRange();
      range.selectNodeContents(el);
      range.collapse(false);
      const sel = window.getSelection();
      sel.removeAllRanges();
      sel.addRange(range);
    }
  });
});

// ======================================
// Classes e foco de classe
// ======================================
function renderListaCompleta() {
  if (!listaClassesEl) return;
  listaClassesEl.innerHTML = '';
  classes.forEach((c, idx) => {
    const item = document.createElement('div');
    item.className = 'item-classe';
    item.innerHTML = `
      <div class="nome">${c.nome}</div>
      <div class="controle">
        <input type="number" min="0" value="${c.nivel}" data-idx="${idx}">
      </div>
    `;
    listaClassesEl.appendChild(item);
    const input = item.querySelector('input');
    input.addEventListener('input', (e) => {
      const v = parseInt(e.target.value || 0, 10);
      classes[idx].nivel = Math.max(0, isNaN(v) ? 0 : v);
      atualizarTudo();
    });
  });
}

let rotateInterval = null;
let rotateIndex = 0;
let topCandidates = [];

function atualizarFocoClasse() {
  const acimaZero = classes.filter(c => Number(c.nivel || 0) > 0);
  topCandidates = acimaZero.length ? acimaZero.slice() : classes.filter(c => Number(c.nivel || 0) === 0).slice();

  if (!topCandidates.length) {
    classeFocusNomeEl.textContent = '—';
    classeFocusNivelEl.textContent = '0';
    stopRotation();
    return;
  }

  if (topCandidates.length === 1) {
    stopRotation();
    const c = topCandidates[0];
    classeFocusNomeEl.textContent = c.nome;
    classeFocusNivelEl.textContent = c.nivel;
  } else {
    startRotation();
  }
}

function showRotateCandidate(idx) {
  const c = topCandidates[idx];
  if (!c) return;
  classeFocusNomeEl.textContent = c.nome;
  classeFocusNivelEl.textContent = c.nivel;
}

function startRotation() {
  if (!topCandidates.length) return;
  stopRotation();
  rotateIndex = 0;
  showRotateCandidate(rotateIndex);
  rotateInterval = setInterval(() => {
    rotateIndex = (rotateIndex + 1) % topCandidates.length;
    showRotateCandidate(rotateIndex);
  }, 7000);
}

function stopRotation() {
  if (rotateInterval) {
    clearInterval(rotateInterval);
    rotateInterval = null;
  }
}

// ======================================
// Nível, XP e Marco
// ======================================
function atualizarNivelFoco() {
  const soma = somaNiveis();
  nivelFocoEl.textContent = soma;

  const tabela = nivelParaTabela(soma);
  const xpAtual = Number(xpAtualEl?.value || 0);
  const xpNec = tabela ? tabela.max : 0;
  xpTotalTextEl.textContent = `/ ${xpNec}`;
  const pct = xpNec > 0 ? Math.min(100, Math.round((xpAtual / xpNec) * 100)) : 0;
  xpBarEl.style.width = pct + '%';

  const marcoMax = tabela ? tabela.marco : 0;
  if (marcoMaxEl) marcoMaxEl.value = marcoMax;

  let mAtual = Number(marcoAtualEl?.value || 0);
  if (mAtual < 0) mAtual = 0;
  if (mAtual > marcoMax) mAtual = marcoMax;
  if (marcoAtualEl) marcoAtualEl.value = mAtual;
  const pctMarco = marcoMax > 0 ? Math.round((mAtual / marcoMax) * 100) : 0;
  if (marcoBarEl) marcoBarEl.style.width = pctMarco + '%';
}

// ======================================
// Metros -> Quadrados
// ======================================
function atualizarQuadrados() {
  const metros = parseFloat(metrosEl?.value || 0);
  const q = metros / 1.5;
  if (quadradosEl) quadradosEl.value = isFinite(q) ? Number(q.toFixed(2)) : 0;
}

// ======================================
// Inspiração
// ======================================
let inspiracao = 0;
if (inspLeftBtn && inspRightBtn && inspValorEl) {
  inspValorEl.textContent = String(inspiracao);
  inspLeftBtn.addEventListener('click', () => {
    inspiracao = Math.max(0, inspiracao - 1);
    inspValorEl.textContent = String(inspiracao);
  });
  inspRightBtn.addEventListener('click', () => {
    inspiracao = inspiracao + 1;
    inspValorEl.textContent = String(inspiracao);
  });
}

// ======================================
// Proficiência
// ======================================
function atualizarProficiencia() {
  const nivelTotal = somaNiveis();
  const prof = calcularProficiencia(nivelTotal);
  if (profValorEl) profValorEl.textContent = String(prof);
}

// ======================================
// Painel de classes
// ======================================
function abrirPainelEm(event) {
  renderListaCompleta();
  painelEl.style.display = 'block';
  painelEl.setAttribute('aria-hidden','false');

  const padding = 8;
  const panelW = painelEl.offsetWidth || 300;
  const panelH = painelEl.offsetHeight || 300;

  let x = event.clientX + 10;
  let y = event.clientY - 10;

  if (x + panelW + padding > window.innerWidth) x = Math.max(padding, event.clientX - panelW - 10);
  if (y + panelH + padding > window.innerHeight) y = Math.max(padding, window.innerHeight - panelH - padding);

  painelEl.style.left = `${x}px`;
  painelEl.style.top = `${y}px`;
}

function fecharPainel() {
  painelEl.style.display = 'none';
  painelEl.setAttribute('aria-hidden','true');
}

// ======================================
// Atualizar tudo
// ======================================
function atualizarTudo() {
  const newSum = somaNiveis();
  if (newSum > prevSum) {
    if (xpAtualEl) xpAtualEl.value = 0;
  }
  prevSum = newSum;

  atualizarFocoClasse();
  atualizarNivelFoco();
  atualizarQuadrados();
  atualizarProficiencia();
}

// ======================================
// Inicialização
// ======================================
function init() {
  if (classeFocusEl) classeFocusEl.addEventListener('click', (e) => abrirPainelEm(e));
  if (fecharPainelBtn) fecharPainelBtn.addEventListener('click', fecharPainel);

  if (xpAtualEl) xpAtualEl.addEventListener('input', atualizarNivelFoco);
  if (marcoAtualEl) marcoAtualEl.addEventListener('input', () => {
    const tabela = nivelParaTabela(somaNiveis());
    const marcoMax = tabela ? tabela.marco : 0;
    let v = Number(marcoAtualEl.value || 0);
    if (v < 0) v = 0;
    if (v > marcoMax) v = marcoMax;
    marcoAtualEl.value = v;
    atualizarNivelFoco();
  });
  if (metrosEl) metrosEl.addEventListener('input', atualizarQuadrados);

  renderListaCompleta();
  prevSum = somaNiveis();

  hexOverlay && (hexOverlay.src = 'img/atributos.png');
  mostrarAtributosNaTela();
  atualizarTudo();
}

init();
/// ======================================
// Tipos de dados por dado
// ======================================
const DADOS = {
  d12: [1,2,3,4,5,6,7,8,9,10,11,12],
  d10: [1,2,3,4,5,6,7,8,9,10],
  d8:  [1,2,3,4,5,6,7,8],
  d6:  [1,2,3,4,5,6]
};

// ======================================
// Classes selecionadas pelo usuário
// ======================================
const personagemClasses = [
  { nome: 'Artífice', niveis: 1, dado: 'd8' },
  { nome: 'Druida', niveis: 2, dado: 'd8' }
];

// ======================================
// Função para obter as classes selecionadas
// ======================================
function obterClassesSelecionadas() {
  // Filtra apenas classes com nível > 0
  return classes.filter(c => c.nivel > 0).map(c => {
    let dado;
    switch(c.key) {
      case 'barbaro':
        dado = 'd12'; break;
      case 'guerreiro':
      case 'paladino':
        dado = 'd10'; break;
      case 'bardo':
      case 'clerigo':
      case 'druida':
      case 'feiticeiro':
      case 'ladino':
      case 'monge':
      case 'artifice':
        dado = 'd8'; break;
      case 'bruxo':
      case 'mago':
        dado = 'd6'; break;
      default:
        dado = 'd8';
    }
    return { nome: c.nome, nivel: c.nivel, dado };
  });
}

// ======================================
// Referências DOM
// ======================================
const btnVida = document.getElementById('btnVida'); // botão VIDA
const classesListaContainer = document.querySelector('.classes-lista-container');
const classesLista = document.getElementById('classesLista');

// Inicialmente oculta
classesListaContainer.style.display = 'none';

// ======================================
// Ao clicar em VIDA
// ======================================
btnVida.addEventListener('click', () => {
  if (classesListaContainer.style.display === 'none') {
    classesListaContainer.style.display = 'block';
    renderizarClasses();
  } else {
    classesListaContainer.style.display = 'none';
  }
});

// ======================================
// Armazenamento de valores por classe/dado
// ======================================
const valoresSalvos = new Map(); 
// chave: `${nomeClasse}-${indice}` (para múltiplos níveis), valor: número selecionado

// ======================================
// Renderizar classes selecionadas
// ======================================
function renderizarClasses() {
  classesLista.innerHTML = '';
  const selecionadas = obterClassesSelecionadas();

  selecionadas.forEach(classe => {
    for (let i = 1; i <= classe.nivel; i++) {
      const li = document.createElement('li');
      li.style.display = 'flex';
      li.style.alignItems = 'center';
      li.style.gap = '8px';

      const chave = `${classe.nome}-${i}`; // identifica nível da classe

      // NOME da classe à esquerda
      const spanNome = document.createElement('span');
      spanNome.textContent = classe.nome;
      spanNome.style.minWidth = '70px';
      spanNome.style.fontWeight = 'bold';

      // Ícone do dado à esquerda
      const imgDado = document.createElement('img');
      imgDado.src = 'img/dado.png';
      imgDado.alt = 'dado';
      imgDado.style.width = '20px';
      imgDado.style.height = '20px';
      imgDado.style.cursor = 'pointer';

      // Dropdown de valores
      const select = document.createElement('select');
      select.style.background = '#121212';
      select.style.color = 'white';
      select.style.border = '1px solid #444';
      select.style.borderRadius = '4px';
      select.style.padding = '2px 4px';
      select.style.cursor = 'pointer';

      const placeholder = document.createElement('option');
      placeholder.value = '';
      placeholder.textContent = classe.dado;
      select.appendChild(placeholder);

      DADOS[classe.dado].forEach(num => {
        const option = document.createElement('option');
        option.value = num;
        option.textContent = num;
        select.appendChild(option);
      });

      // Valor numérico à direita
      const spanValor = document.createElement('span');
      spanValor.classList.add('valor-dado');
      spanValor.style.minWidth = '20px';
      spanValor.style.fontWeight = 'bold';

      // Se já houver valor salvo, usa ele
      if (valoresSalvos.has(chave)) {
        spanValor.textContent = valoresSalvos.get(chave);
      } else {
        spanValor.textContent = '-';
      }

      // Clicar no dado rola valor aleatório
      imgDado.addEventListener('click', () => {
        const valores = DADOS[classe.dado];
        const aleatorio = valores[Math.floor(Math.random() * valores.length)];
        spanValor.textContent = aleatorio;
        valoresSalvos.set(chave, aleatorio);
        select.value = '';
      });

      // Selecionar valor no dropdown
      select.addEventListener('change', () => {
        if (select.value !== '') {
          spanValor.textContent = select.value;
          valoresSalvos.set(chave, select.value);
          select.value = '';
        }
      });

      // Append: Nome à esquerda, dado, dropdown, valor à direita
      li.appendChild(spanNome);
      li.appendChild(imgDado);
      li.appendChild(select);
      li.appendChild(spanValor);

      classesLista.appendChild(li);
    }
  });
}




// ======================================
// Barras de Vida e Dano
// ======================================
const vidaAtualEl = document.getElementById('vida-atual');
const vidaTotalEl = document.getElementById('vida-total');
const vidaFillEl = document.getElementById('vida-fill');

let vidaAtual = parseInt(vidaAtualEl.textContent, 10);
let vidaTotal = parseInt(vidaTotalEl.textContent, 10);

function atualizarBarra() {
  if (vidaAtual < 0) vidaAtual = 0;
  if (vidaAtual > vidaTotal) vidaAtual = vidaTotal;

  const porcentagem = (vidaAtual / vidaTotal) * 100;
  vidaFillEl.style.width = `${porcentagem}%`;
  vidaAtualEl.textContent = vidaAtual;
}

document.querySelector('.menos1').onclick = () => { vidaAtual -= 1; atualizarBarra(); }
document.querySelector('.menos5').onclick = () => { vidaAtual -= 5; atualizarBarra(); }
document.querySelector('.mais1').onclick = () => { vidaAtual += 1; atualizarBarra(); }
document.querySelector('.mais5').onclick = () => { vidaAtual += 5; atualizarBarra(); }

atualizarBarra();

// ======================================
// Funções de controle de barras
// ======================================
function criarControleBarra(atualElId, totalElId, fillElId) {
  const atualEl = document.getElementById(atualElId);
  const totalEl = document.getElementById(totalElId);
  const fillEl = document.getElementById(fillElId);

  let atual = parseInt(atualEl.textContent, 10);
  let total = parseInt(totalEl.textContent, 10);

  function atualizar() {
    if (atual < 0) atual = 0;
    if (atual > total) atual = total;

    const pct = (atual / total) * 100;
    fillEl.style.width = pct + '%';
    atualEl.textContent = atual;
  }

  const container = fillEl.parentElement;
  container.querySelectorAll('.menos1')[0].onclick = () => { atual -= 1; atualizar(); };
  container.querySelectorAll('.menos5')[0].onclick = () => { atual -= 5; atualizar(); };
  container.querySelectorAll('.mais1')[0].onclick = () => { atual += 1; atualizar(); };
  container.querySelectorAll('.mais5')[0].onclick = () => { atual += 5; atualizar(); };

  atualizar();
}

criarControleBarra('vida-temp-atual', 'vida-temp-total', 'vida-temp-fill');
criarControleBarra('dano-necro-atual', 'dano-necro-total', 'dano-necro-fill');

function criarControleBarraEditavel(atualElId, totalElId, fillElId, temMax = true) {
  const atualEl = document.getElementById(atualElId);
  const totalEl = totalElId ? document.getElementById(totalElId) : null;
  const fillEl = document.getElementById(fillElId);

  let atual = parseInt(atualEl.textContent, 10);
  let total = temMax ? parseInt(totalEl.textContent, 10) : atual;

  function atualizar() {
    if (atual < 0) atual = 0;
    if (temMax && atual > total) atual = total;

    if (temMax) {
      if (total < 0) total = 0;
      if (atual > total) atual = total;
      totalEl.textContent = total;
    }

    fillEl.style.width = temMax ? (atual / total) * 100 + '%' : '100%';
    atualEl.textContent = atual;
  }

  const container = fillEl.parentElement;
  container.querySelectorAll('.menos1')[0].onclick = () => { atual -= 1; atualizar(); };
  container.querySelectorAll('.menos5')[0].onclick = () => { atual -= 5; atualizar(); };
  container.querySelectorAll('.mais1')[0].onclick = () => { atual += 1; atualizar(); };
  container.querySelectorAll('.mais5')[0].onclick = () => { atual += 5; atualizar(); };

  atualEl.addEventListener('input', () => {
    const val = parseInt(atualEl.textContent, 10);
    if (!isNaN(val)) {
      atual = val;
      atualizar();
    }
  });

  if (temMax && totalEl) {
    totalEl.addEventListener('input', () => {
      const val = parseInt(totalEl.textContent, 10);
      if (!isNaN(val)) {
        total = val;
        atualizar();
      }
    });
  }

  atualizar();
}

// Aplicação para barras
criarControleBarraEditavel('vida-atual', 'vida-total', 'vida-fill', true);
criarControleBarraEditavel('vida-temp-atual', 'vida-temp-total', 'vida-temp-fill', true);
criarControleBarraEditavel('dano-necro-atual', null, 'dano-necro-fill', false);

function criarControleLivre(atualElId, fillElId, corFill) {
  const atualEl = document.getElementById(atualElId);
  const fillEl = document.getElementById(fillElId);

  if (corFill) fillEl.style.backgroundColor = corFill;

  function atualizar() {
    const valor = parseInt(atualEl.textContent, 10) || 0;
    fillEl.style.width = valor + '%';
    atualEl.textContent = valor;
  }

  const container = fillEl.parentElement;
  container.querySelector('.menos1').onclick = () => { atualEl.textContent = (parseInt(atualEl.textContent,10)||0) - 1; atualizar(); };
  container.querySelector('.menos5').onclick = () => { atualEl.textContent = (parseInt(atualEl.textContent,10)||0) - 5; atualizar(); };
  container.querySelector('.mais1').onclick = () => { atualEl.textContent = (parseInt(atualEl.textContent,10)||0) + 1; atualizar(); };
  container.querySelector('.mais5').onclick = () => { atualEl.textContent = (parseInt(atualEl.textContent,10)||0) + 5; atualizar(); };

  atualEl.addEventListener('input', () => atualizar());
  atualizar();
}

// Barra principal de vida
criarControleBarraEditavel('vida-atual', 'vida-total', 'vida-fill', true);

// Vida temporária
criarControleBarraEditavel('vida-temp-atual', 'vida-temp-total', 'vida-temp-fill', true);

// Dano necrótico
criarControleBarraEditavel('dano-necro-atual', 'dano-necro-total', 'dano-necro-fill', true);
// ======================================
// Cálculo da vida total do personagem
// ======================================

// Obter modificador de Constituição
function obterModConstituicao() {
  // Ajuste o seletor conforme onde está o valor de Constituição
  const conEl = document.querySelector('.num.n4'); 
  if (!conEl) return 0;
  const valor = parseInt(conEl.dataset.attrValue || conEl.textContent || '0', 10);
  return calcularModificador(valor);
}

// Recalcular vida total com base nos valores sorteados ou escolhidos
function calcularVidaTotal() {
  const selecionadas = obterClassesSelecionadas();
  let total = 0;
  const modCon = obterModConstituicao();

  // Soma todos os valores salvos manualmente (dados rolados ou escolhidos)
  selecionadas.forEach(classe => {
    for (let i = 1; i <= classe.nivel; i++) {
      const chave = `${classe.nome}-${i}`;
      if (valoresSalvos.has(chave)) {
        const valorDado = parseInt(valoresSalvos.get(chave), 10);
        total += valorDado + modCon;
      }
    }
  });

  // Atualiza o total de vida na tela
  const vidaTotalEl = document.getElementById('vidaTotal');
  if (vidaTotalEl) vidaTotalEl.textContent = total;

  // Garante que a barra e vida atual se ajustem
  if (typeof vidaAtual !== 'undefined' && vidaAtual > total) vidaAtual = total;
  if (typeof atualizarBarra === 'function') atualizarBarra();
}

// ======================================
// Atualizar total ao alterar dados ou atributos
// ======================================
document.addEventListener('input', calcularVidaTotal);
document.addEventListener('blur', calcularVidaTotal, true);

// ======================================
// Eventos de rolagem e seleção dos dados
// (mantenha dentro da função renderizarClasses)
// ======================================

// Dentro de renderizarClasses(), ajuste os dois eventos:
imgDado.addEventListener('click', () => {
  const valores = DADOS[classe.dado];
  const aleatorio = valores[Math.floor(Math.random() * valores.length)];
  spanValor.textContent = aleatorio;
  valoresSalvos.set(chave, aleatorio);
  select.value = '';
  calcularVidaTotal(); // <<< recalcula total
});

select.addEventListener('change', () => {
  if (select.value !== '') {
    spanValor.textContent = select.value;
    valoresSalvos.set(chave, select.value);
    select.value = '';
    calcularVidaTotal(); // <<< recalcula total
  }
});
