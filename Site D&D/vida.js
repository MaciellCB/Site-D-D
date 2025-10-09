// vida.js — versão com edição de atributos via lápis + regras pedidas

// -------------------- config XP por nível (mantive como antes) --------------------
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
  20: { max: 999999, marco: 5 }
};

// -------------------- classes iniciais --------------------
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

// -------------------- DOM --------------------
const hexOverlay = document.querySelector('.hex-overlay');
const numeros = Array.from(document.querySelectorAll('.hexagrama .num'));
const editarPencil = document.querySelector('.editar-hex');

let mostrandoAtributos = true; // true -> atributos.png ; false -> modificador.png
let editMode = false;          // true -> edição permitida (somente se mostrandoAtributos)
let prevSum = 0;

// outros elementos (mantidos)
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

// -------------------- utilitários --------------------
function somaNiveis() {
  return classes.reduce((s,c) => s + Number(c.nivel || 0), 0);
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
  return n;
}

// proficiência
function calcularProficiencia(nivelTotal) {
  if (nivelTotal < 1) return 0;
  if (nivelTotal <= 4) return 2;
  if (nivelTotal <= 8) return 3;
  if (nivelTotal <= 12) return 4;
  if (nivelTotal <= 16) return 5;
  return 6;
}

// -------------------- atributos: inicializar dataset.attrValue --------------------
// ao carregar, gravamos o valor "atributo" em dataset.attrValue para cada .num
numeros.forEach(n => {
  // garantir valor inicial numérico coerente
  const v = parseInt((n.textContent || '0').trim(), 10);
  n.dataset.attrValue = isNaN(v) ? '0' : String(v);
});

// função para mostrar atributos (restaurar valores)
function mostrarAtributosNaTela() {
  numeros.forEach(n => {
    n.textContent = n.dataset.attrValue ?? '0';
    n.removeAttribute('contenteditable'); // garantir não editável
  });
  mostrandoAtributos = true;
  editMode = false;
  atualizarTudo(); // atualiza dependências (se necessário)
}

// função para mostrar modificadores (salva attrValue antes de converter)
function mostrarModificadoresNaTela() {
  // antes de converter, certifique-se de salvar edits se houver
  if (editMode) salvarEdicaoAtributos();
  numeros.forEach(n => {
    // garantir dataset.attrValue existe
    if (n.dataset.attrValue === undefined) n.dataset.attrValue = String(parseInt((n.textContent||'0'),10) || 0);
    const mod = calcularModificador(n.dataset.attrValue);
    n.textContent = String(mod);
    n.removeAttribute('contenteditable'); // não editável em modificador
  });
  mostrandoAtributos = false;
  editMode = false;
}

// habilitar edição (só se mostrandoAtributos)
function habilitarEdicaoAtributos() {
  if (!mostrandoAtributos) return;
  editMode = true;
  numeros.forEach(n => {
    n.setAttribute('contenteditable', 'true');
    // foco e seleção não automática — o usuário clica no que quer editar
    // interceptar eventos de teclado/Enter
    n.addEventListener('keydown', onNumKeyDown);
    n.addEventListener('blur', onNumBlur);
  });
}

// desabilitar edição (salva valores)
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

// salvar: valida e grava em dataset.attrValue e atualiza o textContent
function salvarEdicaoAtributos() {
  numeros.forEach(n => {
    // pegar texto editado (pode conter espaços)
    let txt = (n.textContent || '').trim();
    // aceitar só número inteiro >= 0
    let val = parseInt(txt, 10);
    if (isNaN(val) || val < 0) val = 0;
    n.dataset.attrValue = String(val);
    n.textContent = String(val);
  });
}

// interrupções ao digitar nas divs contentEditable
function onNumKeyDown(e) {
  // Enter finaliza edição do campo atual (impede quebra de linha)
  if (e.key === 'Enter') {
    e.preventDefault();
    e.target.blur();
  }
  // permitir apenas números, Backspace, Arrow keys, Enter, Tab
  // Mas não bloquear IME etc — apenas permitir teclas comuns
}

// blur: salvar o campo individualmente
function onNumBlur(e) {
  const n = e.target;
  let txt = (n.textContent || '').trim();
  let val = parseInt(txt, 10);
  if (isNaN(val) || val < 0) val = 0;
  n.dataset.attrValue = String(val);
  n.textContent = String(val);
}

// -------------------- eventos do hex / lápis --------------------

// clique no hexOverlay: troca de estado (atributos <-> modificador)
// regra extra: se estava em edição, salva e pára (já feito nas funções)
if (hexOverlay) {
  hexOverlay.style.cursor = 'pointer';
  hexOverlay.addEventListener('click', () => {
    if (mostrandoAtributos) {
      // salvar edições (se em edição)
      if (editMode) desabilitarEdicaoAtributos();
      // troca pra modificador
      hexOverlay.src = 'img/modificador.png';
      mostrarModificadoresNaTela();
    } else {
      // troca pra atributos (mostramos valores salvos)
      hexOverlay.src = 'img/atributos.png';
      mostrarAtributosNaTela();
    }
  });
}

// clique no lápis
if (editarPencil) {
  editarPencil.addEventListener('click', () => {
    // se estamos em modificador, primeiro voltar para atributos
    if (!mostrandoAtributos) {
      hexOverlay.src = 'img/atributos.png';
      mostrarAtributosNaTela();
      // depois ativar edição
      habilitarEdicaoAtributos();
      return;
    }

    // se já estamos em atributos: alterna editMode
    if (!editMode) {
      habilitarEdicaoAtributos();
    } else {
      desabilitarEdicaoAtributos(); // vai salvar
    }
  });
}

// clique nos números: se em edição, o usuário clica para focar
numeros.forEach(n => {
  n.addEventListener('click', (e) => {
    if (mostrandoAtributos && editMode) {
      // move foco para o elemento para editar
      const el = e.currentTarget;
      el.focus();
      // colocar o caret no final
      const range = document.createRange();
      range.selectNodeContents(el);
      range.collapse(false);
      const sel = window.getSelection();
      sel.removeAllRanges();
      sel.addRange(range);
    }
  });
});

// -------------------- resto do app (XP, classes, insp, prof) --------------------

// render lista de classes (igual ao anterior)
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

// funções de rotação / foco de classe (mantive a lógica anterior)
let rotateInterval = null;
let rotateIndex = 0;
let topCandidates = [];

function atualizarFocoClasse() {
  const acimaZero = classes.filter(c => Number(c.nivel || 0) > 0);
  if (acimaZero.length > 0) topCandidates = acimaZero.slice();
  else topCandidates = classes.filter(c => Number(c.nivel || 0) === 0).slice();

  if (!topCandidates || topCandidates.length === 0) {
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
  if (!topCandidates || topCandidates.length === 0) return;
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

// atualizar nivel foco (XP / marco)
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

// conversão metros->quadrados
function atualizarQuadrados() {
  const metros = parseFloat(metrosEl?.value || 0);
  const q = metros / 1.5;
  if (quadradosEl) quadradosEl.value = isFinite(q) ? Number(q.toFixed(2)) : 0;
}

// insp handlers (mantive)
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

// atualizar proficiencia
function atualizarProficiencia() {
  const nivelTotal = somaNiveis();
  const prof = calcularProficiencia(nivelTotal);
  if (profValorEl) profValorEl.textContent = String(prof);
}

// abrir painel classes próximo ao clique
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

// atualizarTudo (zera XP se sobe nível)
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

// inicial
function init() {
  // clique na caixa de classe abre painel perto do clique
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

  // garantir que estejamos em modo atributos visual ao iniciar
  hexOverlay && (hexOverlay.src = 'img/atributos.png');
  mostrarAtributosNaTela();
  atualizarTudo();
}

init();
