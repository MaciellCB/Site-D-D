// JAVA/MeioJS.js
document.addEventListener("DOMContentLoaded", () => {

  const pericias = [
    { nome: "Atletismo", atributo: "FOR" },

    { nome: "Acrobacia", atributo: "DEX" },
    { nome: "Furtividade", atributo: "DEX" },
    { nome: "Prestidigitação", atributo: "DEX" },

    { nome: "Arcanismo", atributo: "INT" },
    { nome: "História", atributo: "INT" },
    { nome: "Investigação", atributo: "INT" },
    { nome: "Natureza", atributo: "INT" },
    { nome: "Religião", atributo: "INT" },

    { nome: "Intuição", atributo: "SAB" },
    { nome: "Lidar com animais", atributo: "SAB" },
    { nome: "Medicina", atributo: "SAB" },
    { nome: "Percepção", atributo: "SAB" },
    { nome: "Sobrevivência", atributo: "SAB" },

    { nome: "Atuação", atributo: "CAR" },
    { nome: "Enganação", atributo: "CAR" },
    { nome: "Intimidação", atributo: "CAR" },
    { nome: "Persuasão", atributo: "CAR" },

    { nome: "Salvaguarda (Força)", atributo: "FOR" },
    { nome: "Salvaguarda (Destreza)", atributo: "DEX" },
    { nome: "Salvaguarda (Constituição)", atributo: "CON" },
    { nome: "Salvaguarda (Inteligência)", atributo: "INT" },
    { nome: "Salvaguarda (Sabedoria)", atributo: "SAB" },
    { nome: "Salvaguarda (Carisma)", atributo: "CAR" }
  ];

  const lista = document.querySelector(".pericias");
  if (!lista) return;
  lista.innerHTML = "";

  // cria header com os "titulozinhos"
  const headerLi = document.createElement("li");
  headerLi.classList.add("pericia-item", "header-row");
  headerLi.innerHTML = `
    <div class="col-icon"></div>
    <div class="col-nome">PERÍCIA</div>
    <div class="col-dados">ATRIBUTO</div>
    <div class="col-bonus">BÔNUS</div>
    <div class="col-treino">Treino</div>
    <div class="col-outros">Outros</div>
  `;
  lista.appendChild(headerLi);

  /* =========================
     Helpers para atributos
     ========================= */

  const atributoParaSeletor = {
    "FOR": ".hexagrama .n6",
    "DEX": ".hexagrama .n2",
    "INT": ".hexagrama .n5",
    "SAB": ".hexagrama .n3",
    "CAR": ".hexagrama .n4",
    "CON": ".hexagrama .n1"
  };

  function obterScoreDoAtributo(sigla) {
    const sel = atributoParaSeletor[sigla];
    if (!sel) return 10;
    const el = document.querySelector(sel);
    if (!el) return 10;
    const v = parseInt(el.dataset?.attrValue ?? el.textContent ?? "0", 10);
    return Number.isNaN(v) ? 10 : v;
  }

  function obterModificadorDoAtributo(sigla) {
    const score = obterScoreDoAtributo(sigla);
    if (typeof window.calcularModificador === "function") {
      return Number(window.calcularModificador(score));
    }
    return Math.floor((score - 10) / 2);
  }

  function formatBonus(n) {
    const sign = n > 0 ? "+" : "";
    return `(${sign}${n})`;
  }

  /* =========================
     Função que atualiza um item
     ========================= */
  function atualizarBonusDoItem(li) {
    const outrosEl = li.querySelector(".outros");
    const treinoEl = li.querySelector(".treino");
    const bonusEl = li.querySelector(".bonus-span");
    const dadosEl = li.querySelector(".col-dados");

    const profEl = document.getElementById("proficienciaValor");
    let profVal = 0;
    if (profEl) {
      const parsed = parseInt(profEl.textContent, 10);
      profVal = Number.isNaN(parsed) ? 0 : parsed;
    }

    const outrosVal = parseInt(outrosEl.value || "0", 10) || 0;
    const proficienciaParte = treinoEl.checked ? profVal : 0;

    const atualAtributo = li.dataset.atributo || (dadosEl.textContent || "").replace(/[()]/g, "").trim() || "DEX";
    const modAttr = obterModificadorDoAtributo(atualAtributo);

    const total = modAttr + outrosVal + proficienciaParte;
    bonusEl.textContent = formatBonus(total);

    li.title = `(${atualAtributo}) mod ${modAttr} + outros ${outrosVal} + prof ${proficienciaParte} = ${total}`;
  }

  function atualizarTodosBonus() {
    const items = Array.from(document.querySelectorAll(".pericia-item")).filter(i => !i.classList.contains("header-row"));
    items.forEach(i => atualizarBonusDoItem(i));
  }

  /* =========================
     Criação das linhas
     ========================= */
  pericias.forEach(p => {
    const li = document.createElement("li");
    li.classList.add("pericia-item");
    li.dataset.atributo = p.atributo;

    li.innerHTML = `
      <img src="img/dado.png" alt="dado" class="col-icon">
      <div class="col-nome" title="${p.nome}">${p.nome}</div>
      <div class="col-dados" tabindex="0">(${p.atributo})</div>
      <div class="col-bonus"><span class="bonus-span">(0)</span></div>
      <div class="col-treino"><input type="checkbox" class="treino" title="Marcar proficiência"></div>
      <div class="col-outros"><input type="number" class="outros" value="0" step="1" /></div>
    `;

    const outrosInput = li.querySelector(".outros");
    const treinoCheckbox = li.querySelector(".treino");
    const dadosDiv = li.querySelector(".col-dados");

    outrosInput.addEventListener("input", () => atualizarBonusDoItem(li));
    treinoCheckbox.addEventListener("change", () => atualizarBonusDoItem(li));

    // transformar coluna DADOS sempre em select (mais consistente para responsividade)
    dadosDiv.innerHTML = `
      <select class="atributo-select" aria-label="Atributo da perícia">
        <option value="FOR">FOR</option>
        <option value="DEX">DEX</option>
        <option value="CON">CON</option>
        <option value="INT">INT</option>
        <option value="SAB">SAB</option>
        <option value="CAR">CAR</option>
      </select>
    `;

    const select = dadosDiv.querySelector(".atributo-select");
    select.value = p.atributo;

    // estilos defensivos via JS (não altera visual principal)
    select.style.cursor = "pointer";
    select.style.padding = "0 2px";
    select.style.borderRadius = "2px";
    select.style.fontFamily = "'Segoe UI', Roboto, system-ui, -apple-system, sans-serif";
    select.style.fontWeight = "600";
    select.style.fontSize = "13px";

    // prevenir que listeners externos fechem o select antes de abrir
    select.addEventListener("mousedown", (ev) => {
      ev.stopPropagation();
    }, { passive: true });
    select.addEventListener("click", (ev) => ev.stopPropagation());

    // adiciona/remover classe (CSS trata z-index para evitar corte)
    select.addEventListener("focus", () => {
      select.classList.add("atributo-openable");
      // pequeno reflow para melhorar abertura instantânea
      select.style.transform = "translateZ(0)";
      setTimeout(() => select.style.transform = "", 40);
    });
    select.addEventListener("blur", () => {
      select.classList.remove("atributo-openable");
    });

    select.addEventListener("change", () => {
      li.dataset.atributo = select.value;
      atualizarBonusDoItem(li);
    });

    // inicializa
    atualizarBonusDoItem(li);
    lista.appendChild(li);
  });

  /* =========================
     Fechar seletor global (mantido)
     ========================= */
  function fecharSeletorGlobal() {
    const selects = document.querySelectorAll(".col-dados select");
    selects.forEach(s => {
      const parent = s.parentElement;
      if (parent) {
        const val = s.value || parent.dataset.prev?.replace(/[()]/g,"") || parent.textContent;
        parent.innerHTML = `(${val})`;
      }
    });
  }

  /* =========================
     Observers: atualiza quando Proficiência ou Atributos mudam
     ========================= */
  const profGlobalEl = document.getElementById("proficienciaValor");
  if (profGlobalEl) {
    const moProf = new MutationObserver(() => {
      atualizarTodosBonus();
    });
    moProf.observe(profGlobalEl, { characterData: true, childList: true, subtree: true });
  }

  const hexElems = Array.from(document.querySelectorAll(".hexagrama .num"));
  if (hexElems.length) {
    const moHex = new MutationObserver(() => {
      atualizarTodosBonus();
    });
    hexElems.forEach(h => moHex.observe(h, { attributes: true, childList: true, subtree: true, characterData: true }));
  }

  window.addEventListener("focus", atualizarTodosBonus);
  window.atualizarPericias = atualizarTodosBonus;
});
