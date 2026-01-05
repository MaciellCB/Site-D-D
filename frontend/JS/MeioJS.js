document.addEventListener("DOMContentLoaded", () => {
    const listaPericias = document.querySelector(".pericias");
    const containerCentro = document.querySelector('.lado-centro');

    // Inicializa a Sanidade assim que o DOM carregar
    renderizarEstruturaSanidade();

    window.addEventListener('sheet-updated', () => {
        renderizarPericias();
        atualizarSanidadeInterface();
    });

    /* =========================
       LOGICA DE PERÍCIAS
    ========================= */

    const atributoParaSeletor = {
        "FOR": ".hexagrama .n6",
        "DEX": ".hexagrama .n2",
        "CON": ".hexagrama .n1",
        "INT": ".hexagrama .n5",
        "SAB": ".hexagrama .n3",
        "CAR": ".hexagrama .n4"
    };

    function obterModificador(sigla) {
        const sel = atributoParaSeletor[sigla];
        const el = document.querySelector(sel);
        if (!el) return 0;
        const score = parseInt(el.dataset.attrValue || el.textContent || "10", 10);
        return Math.floor((score - 10) / 2);
    }

    function obterProficiencia() {
        const profEl = document.getElementById('proficienciaValor');
        return profEl ? parseInt(profEl.textContent.replace('+', '') || "0", 10) : 0;
    }

    function renderizarPericias() {
        if (!listaPericias || !state.pericias) return;
        listaPericias.innerHTML = "";

        const headerLi = document.createElement("li");
        headerLi.className = "pericia-item header-row";
        headerLi.innerHTML = `
            <div class="col-icon"></div>
            <div class="col-nome">PERÍCIA</div>
            <div class="col-dados">ATTR</div>
            <div class="col-bonus">BÔNUS</div>
            <div class="col-treino">Treino</div>
            <div class="col-outros">Outros</div>
        `;
        listaPericias.appendChild(headerLi);

        const atributosOpcoes = ["FOR", "DEX", "CON", "INT", "SAB", "CAR"];

        Object.entries(state.pericias).forEach(([nome, dados]) => {
            const mod = obterModificador(dados.atributo);
            const prof = obterProficiencia();
            const bônusTotal = mod + (dados.treinado ? prof : 0) + (parseInt(dados.outros) || 0);

            const li = document.createElement("li");
            li.className = "pericia-item";
            li.innerHTML = `
                <img src="img/dado.png" class="col-icon">
                <div class="col-nome" title="${nome}">${nome}</div>
                <div class="col-dados">
                    <select class="atributo-select">
                        ${atributosOpcoes.map(attr =>
                `<option value="${attr}" ${dados.atributo === attr ? 'selected' : ''}>${attr}</option>`
            ).join('')}
                    </select>
                </div>
                <div class="col-bonus"><span class="bonus-span">(${bônusTotal >= 0 ? '+' : ''}${bônusTotal})</span></div>
                <div class="col-treino">
                    <input type="checkbox" class="treino" ${dados.treinado ? 'checked' : ''}>
                </div>
                <div class="col-outros">
                    <input type="number" class="outros" value="${dados.outros || 0}">
                </div>
            `;

            const selectAttr = li.querySelector('.atributo-select');
            selectAttr.addEventListener('change', (e) => {
                state.pericias[nome].atributo = e.target.value;
                atualizarBonusVisual(li, nome);
                saveStateToServer();
            });

            const check = li.querySelector('.treino');
            check.addEventListener('change', (e) => {
                state.pericias[nome].treinado = e.target.checked;
                atualizarBonusVisual(li, nome);
                saveStateToServer();
            });

            const inputOutros = li.querySelector('.outros');
            inputOutros.addEventListener('input', (e) => {
                state.pericias[nome].outros = parseInt(e.target.value) || 0;
                atualizarBonusVisual(li, nome);
                saveStateToServer();
            });

            // ADICIONADO: ENTER PARA SAIR DA EDIÇÃO EM PERÍCIAS
            inputOutros.addEventListener('keydown', (e) => {
                if (e.key === 'Enter') {
                    e.preventDefault();
                    inputOutros.blur();
                }
            });

            listaPericias.appendChild(li);
        });
    }

    function atualizarBonusVisual(li, nome) {
        const dados = state.pericias[nome];
        const mod = obterModificador(dados.atributo);
        const prof = obterProficiencia();
        const bônusTotal = mod + (dados.treinado ? prof : 0) + (parseInt(dados.outros) || 0);
        li.querySelector('.bonus-span').textContent = `(${bônusTotal >= 0 ? '+' : ''}${bônusTotal})`;
    }

/* =========================
   LÓGICA DE SANIDADE (ESTRESSE & VAZIO)
========================= */

function renderizarEstruturaSanidade() {
    if (!containerCentro || document.getElementById('sanidade-wrapper')) return;

    const wrap = document.createElement('div');
    wrap.id = 'sanidade-wrapper';
    wrap.className = 'sanidade-wrapper';
    
    // HTML Estrutural
    wrap.innerHTML = `
        <img src="img/sanidade.png" id="btn-open-sanidade" class="btn-sanidade-img" alt="Abrir Sanidade" />
        
        <div id="sanidade-panel" class="sanidade-panel" style="display: none;">
            
            <div class="sanidade-row">
                <div class="sanidade-label" title="Clique para ver os níveis de teste" data-tooltip="Testes de Estresse:\n25% - Teste Menor\n50% - Teste Médio\n75% - Teste Maior\n100% - Colapso">Estresse</div>
                <input type="number" id="input-estresse" class="sanidade-input" value="0" />
            </div>
            
            <div class="sanidade-progress-container">
                <div id="estresse-bar" class="sanidade-progress-bar"></div>
            </div>
            <div id="estresse-footer" class="estresse-footer" data-tooltip="Máximo = (SAB x 5) + (Prof x 10)">0 / 0</div>

            <div class="sanidade-row" id="row-vazio" style="margin-top: 12px;">
                <div class="sanidade-label">Vazio</div>
                <input type="text" id="input-vazio" class="sanidade-input" value="0" />
            </div>

            <img src="img/sanidade2.png" id="btn-close-sanidade" class="btn-sanidade1-img" alt="Fechar" style="margin-top: 10px;" />
        </div>
    `;
    containerCentro.appendChild(wrap);

    const btnOpen = wrap.querySelector('#btn-open-sanidade');
    const btnClose = wrap.querySelector('#btn-close-sanidade');
    const panel = wrap.querySelector('#sanidade-panel');

    // Toggle Abrir/Fechar
    btnOpen.onclick = () => { 
        btnOpen.style.display = 'none'; 
        panel.style.display = 'flex'; 
        atualizarSanidadeInterface(); // Garante atualização ao abrir
    };
    btnClose.onclick = () => { 
        panel.style.display = 'none'; 
        btnOpen.style.display = 'block'; 
    };

    // Eventos de Input (Estresse)
    const inEstresse = document.getElementById('input-estresse');
    inEstresse.addEventListener('input', () => {
        state.sanidade.estresse = parseInt(inEstresse.value) || 0;
        atualizarSanidadeInterface();
        // saveStateToServer() deve ser chamado com debounce ou no blur, 
        // mas aqui chamaremos direto para feedback visual imediato se necessário
    });
    inEstresse.addEventListener('blur', () => saveStateToServer());
    inEstresse.addEventListener('keydown', (e) => { if(e.key === 'Enter') inEstresse.blur(); });

    // Eventos de Input (Vazio)
    const inVazio = document.getElementById('input-vazio');
    
    // Função para tratar entrada do Vazio (Aceita número ou texto "Sincronizado")
    const handleVazioInput = (val) => {
        if (val.toLowerCase() === "sincronizado") return 144;
        return parseInt(val) || 0;
    };

    inVazio.addEventListener('input', () => {
        // Se o usuário estiver digitando, permitimos. A lógica visual atualiza em tempo real.
        // Mas só salvamos o número no state.
        const numVal = handleVazioInput(inVazio.value);
        state.sanidade.vazio = numVal;
        atualizarVisualVazio(numVal);
    });

    inVazio.addEventListener('blur', () => {
        saveStateToServer();
        // Força a formatação correta (ex: volta para "Sincronizado" se for 144)
        atualizarVisualVazio(state.sanidade.vazio);
    });
    
    inVazio.addEventListener('keydown', (e) => { if(e.key === 'Enter') inVazio.blur(); });

    // Inicializa estrutura de dados se não existir
    if (!state.sanidade) state.sanidade = { estresse: 0, vazio: 0 };
}

function atualizarSanidadeInterface() {
    if (!state.sanidade) state.sanidade = { estresse: 0, vazio: 0 };

    // --- CÁLCULO DE ESTRESSE MÁXIMO ---
    // (Sabedoria x 5) + (Proficiência x 10)
    // Sabedoria é o atributo base (score), não o modificador.
    // O seletor .n3 pega o valor da bolinha de Sabedoria.
    const sabEl = document.querySelector('.hexagrama .n3');
    const sabScore = sabEl ? (parseInt(sabEl.dataset.attrValue || sabEl.textContent) || 10) : 10;
    
    const profEl = document.getElementById('proficienciaValor');
    const profVal = profEl ? (parseInt(profEl.textContent.replace('+','')) || 2) : 2;

    const maxEstresse = (sabScore * 5) + (profVal * 10);
    const atualEstresse = state.sanidade.estresse;

    // Atualiza Input e Footer
    const inEstresse = document.getElementById('input-estresse');
    if (inEstresse && document.activeElement !== inEstresse) {
        inEstresse.value = atualEstresse;
    }
    
    const footer = document.getElementById('estresse-footer');
    if (footer) footer.textContent = `${atualEstresse} / ${maxEstresse}`;

    // --- BARRA DE PROGRESSO E CORES ---
    const porcentagem = Math.min(100, Math.max(0, (atualEstresse / maxEstresse) * 100));
    const bar = document.getElementById('estresse-bar');
    
    if (bar) {
        bar.style.width = `${porcentagem}%`;
        
        // Remove classes anteriores
        bar.className = 'sanidade-progress-bar'; // Reset
        
        if (porcentagem >= 100) {
            bar.classList.add('progress-overload'); // Piscar
        } else if (porcentagem >= 75) {
            bar.classList.add('progress-crit'); // Vermelho
        } else if (porcentagem >= 50) {
            bar.classList.add('progress-high'); // Laranja
        } else if (porcentagem >= 25) {
            bar.classList.add('progress-mid'); // Amarelo
        } else {
            bar.classList.add('progress-low'); // Verde
        }
    }

    // --- ATUALIZAÇÃO DO VAZIO ---
    atualizarVisualVazio(state.sanidade.vazio);
}

function atualizarVisualVazio(valor) {
    const inVazio = document.getElementById('input-vazio');
    const rowVazio = document.getElementById('row-vazio');
    if (!inVazio || !rowVazio) return;

    // Limites
    const val = Math.min(144, Math.max(0, valor));
    
    // Cálculo da intensidade do roxo (0 a 144 -> 0% a 100% de opacidade/spread)
    const ratio = val / 144; 
    
    // Se chegou no máximo (144)
    if (val >= 144) {
        if (document.activeElement !== inVazio) {
            inVazio.value = "Sincronizado";
            // Ajusta largura do input para caber o texto
            inVazio.style.width = "110px";
        }
        inVazio.classList.add('input-infundido-text');
        rowVazio.classList.add('row-infundido');
        
        // Fundo totalmente roxo sólido ou gradiente forte
        rowVazio.style.background = `radial-gradient(circle, rgba(156, 39, 176, 0.6) 0%, rgba(74, 20, 140, 0.8) 100%)`;
        
    } else {
        if (document.activeElement !== inVazio) {
            inVazio.value = val;
            inVazio.style.width = "60px"; // Volta ao tamanho normal
        }
        inVazio.classList.remove('input-infundido-text');
        rowVazio.classList.remove('row-infundido');

        // Gradiente Radial que cresce
        // O "stop" do gradiente aumenta conforme o valor (de 0% a 150% para cobrir tudo)
        const spread = Math.floor(ratio * 100); 
        
        // Gradiente: Centro transparente -> Roxo nas bordas (efeito de "fechar o cerco")
        // OU Centro Roxo -> Espalhando para fora. O pedido foi "espalha em círculo".
        // Vamos fazer um Radial Gradient onde a cor roxa começa no centro e ganha opacidade/tamanho.
        
        const alpha = ratio * 0.8; // Opacidade aumenta com o valor
        const size = (ratio * 70) + 30; // Tamanho do círculo (30% a 100%)
        
        rowVazio.style.background = `radial-gradient(circle at center, rgba(156, 39, 176, ${alpha}) ${spread}%, transparent ${spread + 20}%)`;
        rowVazio.style.boxShadow = `0 0 ${spread/5}px rgba(156, 39, 176, ${alpha * 0.5})`;
        rowVazio.style.borderColor = `rgba(156, 39, 176, ${alpha})`;
    }
}

    function atualizarSanidadeInterface() {
        const s = state.sanidade || { estresse: 0, vazio: 0 };
        const inEstresse = document.getElementById('input-estresse');
        const inVazio = document.getElementById('input-vazio');
        if (inEstresse) inEstresse.value = s.estresse;
        if (inVazio) inVazio.value = s.vazio;
    }
});