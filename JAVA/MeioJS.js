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

/* =================================================================
     SISTEMA DE SANIDADE E ESTRESSE (Adicionado ao final do MeioJS)
     ================================================================= */
  
  const containerCentro = document.querySelector('.lado-centro');
  
  if (containerCentro) {
    // 1. Criar a estrutura HTML
    const sanidadeWrapper = document.createElement('div');
    sanidadeWrapper.className = 'sanidade-wrapper';

    // Conteúdo HTML
    sanidadeWrapper.innerHTML = `
      <img src="img/sanidade.png" id="btn-open-sanidade" class="btn-sanidade-img" alt="Abrir Sanidade" />

      <div id="sanidade-panel" class="sanidade-panel" style="display: none;">
        
        <div class="sanidade-row">
          <div class="sanidade-label" 
               data-tooltip="25% Teste Mental&#10;50% Teste Mental&#10;75% Teste Mental&#10;100% Crise Completa (ruim ou virtude)">
             Estresse ⓘ
          </div>
          <input type="number" id="input-estresse" class="sanidade-input" value="0" />
          <div id="estresse-max-footer" class="estresse-footer" data-tooltip="Calculando...">
             Estresse Máximo: <span id="val-estresse-max">--</span>
          </div>
        </div>

        <div style="width:100%; height:1px; background:#333;"></div>

        <div class="sanidade-row">
          <div class="sanidade-label">Conexão com o Vazio</div>
          <input type="number" id="input-vazio" class="sanidade-input" value="0" />
        </div>

        <div style="text-align:center; margin-top:8px;">
           <img src="img/sanidade2.png" id="btn-close-sanidade" class="btn-sanidade-img" style="max-width: 100px; margin: 0 auto;" alt="Fechar" />
        </div>
      </div>
    `;

    // Inserir após a lista de perícias
    containerCentro.appendChild(sanidadeWrapper);

    // 2. Referências aos elementos
    const btnOpen = sanidadeWrapper.querySelector('#btn-open-sanidade');
    const btnClose = sanidadeWrapper.querySelector('#btn-close-sanidade');
    const panel = sanidadeWrapper.querySelector('#sanidade-panel');
    
    const footerText = sanidadeWrapper.querySelector('#val-estresse-max');
    const footerContainer = sanidadeWrapper.querySelector('#estresse-max-footer');

    // 3. Lógica de Abrir/Fechar
    btnOpen.addEventListener('click', () => {
      btnOpen.style.display = 'none';
      panel.style.display = 'flex';
      atualizarEstresseMaximo(); // Recalcula ao abrir
    });

    btnClose.addEventListener('click', () => {
      panel.style.display = 'none';
      btnOpen.style.display = 'block';
    });

    // 4. Lógica de Cálculo do Máximo
    // Fórmula: (Sabedoria x 5) + (Proficiência x 10)
    function atualizarEstresseMaximo() {
      // Pega Sabedoria (Score total, ex: 14)
      // .n3 é o seletor padrão para Sabedoria no seu hexagrama
      const sabEl = document.querySelector('.hexagrama .n3'); 
      let sabScore = 10;
      if (sabEl) {
         // Tenta pegar do dataset (valor limpo) ou textContent
         sabScore = parseInt(sabEl.dataset?.attrValue || sabEl.textContent || '10', 10);
      }

      // Pega Proficiência
      const profEl = document.getElementById('proficienciaValor');
      let profVal = 2;
      if (profEl) {
         profVal = parseInt(profEl.textContent || '2', 10);
      }

      const maximo = (sabScore * 5) + (profVal * 10);

      // Atualiza visual
      footerText.textContent = maximo;
      
      // Atualiza tooltip com a fórmula resolvida para o usuário ver
      const formulaStr = `Estresse Maximo = (sabedoria x 5) + (proficiencia x 10) = ${maximo}`;
      footerContainer.setAttribute('data-tooltip', formulaStr);
    }

    // 5. Adicionar ouvintes para recalcular se os atributos mudarem
    // Observa SAB
    const sabEl = document.querySelector('.hexagrama .n3');
    if(sabEl) {
       new MutationObserver(atualizarEstresseMaximo).observe(sabEl, { attributes: true, childList: true, characterData: true });
    }
    // Observa Proficiência
    const profEl = document.getElementById('proficienciaValor');
    if(profEl) {
       new MutationObserver(atualizarEstresseMaximo).observe(profEl, { childList: true, characterData: true });
    }
    
    // Inicializa
    // Pequeno delay para garantir que o EsquerdaJS carregou os números
    setTimeout(atualizarEstresseMaximo, 500);
  }

});


