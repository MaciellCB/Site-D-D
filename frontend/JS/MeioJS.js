/* =============================================================
   LÓGICA DO CENTRO (PERÍCIAS E SANIDADE)
============================================================= */

document.addEventListener("DOMContentLoaded", () => {
    const listaPericias = document.querySelector(".pericias");
    const containerCentro = document.querySelector('.lado-centro');

    // Inicializa a Sanidade assim que o DOM carregar
    renderizarEstruturaSanidade();

    // Quando a ficha carrega ou muda, atualizamos tudo
    window.addEventListener('sheet-updated', () => {
        renderizarPericias();
        atualizarSanidadeInterface();
    });

    /* =========================
       1. HELPER: CÁLCULOS SEGUROS (LENDO DO STATE)
    ========================= */
    // Calcula proficiência direto do State para não depender do HTML da esquerda estar pronto
    function getProficienciaDoState() {
        if (!state.niveisClasses) return 2;
        const nivelTotal = Object.values(state.niveisClasses).reduce((a, b) => a + (parseInt(b) || 0), 0) || 1;
        return Math.floor((nivelTotal - 1) / 4) + 2;
    }

    // Pega o modificador direto do State
    function getModificadorDoState(attrKey) {
        // Mapeamento: n1=CON, n2=DEX, n3=SAB, n4=CAR, n5=INT, n6=FOR
        const val = parseInt(state.atributos?.[attrKey] || 10);
        return Math.floor((val - 10) / 2);
    }

    /* =========================
       2. LÓGICA DE PERÍCIAS
    ========================= */
    // Mapeamento visual para renderização (mantido para compatibilidade visual)
    const atributoParaChave = {
        "FOR": "n6", "DEX": "n2", "CON": "n1", "INT": "n5", "SAB": "n3", "CAR": "n4"
    };

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
        const prof = getProficienciaDoState();

        Object.entries(state.pericias).forEach(([nome, dados]) => {
            const chaveAttr = atributoParaChave[dados.atributo] || "n2"; // Default Dex se der erro
            const mod = getModificadorDoState(chaveAttr);
            const bonusTotal = mod + (dados.treinado ? prof : 0) + (parseInt(dados.outros) || 0);

            const li = document.createElement("li");
            li.className = "pericia-item";
            li.innerHTML = `
                <img src="img/dado.png" class="col-icon">
                <div class="col-nome" title="${nome}">${nome}</div>
                <div class="col-dados">
                    <select class="atributo-select">
                        ${atributosOpcoes.map(attr => `<option value="${attr}" ${dados.atributo === attr ? 'selected' : ''}>${attr}</option>`).join('')}
                    </select>
                </div>
                <div class="col-bonus"><span class="bonus-span">(${bonusTotal >= 0 ? '+' : ''}${bonusTotal})</span></div>
                <div class="col-treino">
                    <input type="checkbox" class="treino" ${dados.treinado ? 'checked' : ''}>
                </div>
                <div class="col-outros">
                    <input type="number" class="outros" value="${dados.outros || 0}">
                </div>
            `;

            // Listeners
            li.querySelector('.atributo-select').addEventListener('change', (e) => {
                state.pericias[nome].atributo = e.target.value;
                atualizarBonusVisual(li, nome);
                saveStateToServer();
            });
            li.querySelector('.treino').addEventListener('change', (e) => {
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
            inputOutros.addEventListener('keydown', (e) => { if (e.key === 'Enter') { e.preventDefault(); inputOutros.blur(); } });

            listaPericias.appendChild(li);
        });
    }

    function atualizarBonusVisual(li, nome) {
        const dados = state.pericias[nome];
        const chaveAttr = atributoParaChave[dados.atributo] || "n2";
        const mod = getModificadorDoState(chaveAttr);
        const prof = getProficienciaDoState();
        const bonusTotal = mod + (dados.treinado ? prof : 0) + (parseInt(dados.outros) || 0);
        li.querySelector('.bonus-span').textContent = `(${bonusTotal >= 0 ? '+' : ''}${bonusTotal})`;
    }

    /* =========================
       3. LÓGICA DE SANIDADE (ESTRESSE & VAZIO) - BLINDADA
    ========================= */

    function renderizarEstruturaSanidade() {
    const containerCentro = document.querySelector('.lado-centro');
    if (!containerCentro || document.getElementById('sanidade-wrapper')) return;

    const wrap = document.createElement('div');
    wrap.id = 'sanidade-wrapper';
    wrap.className = 'sanidade-wrapper';
    
    // HTML com o Tooltip dentro do label interativo
    wrap.innerHTML = `
        <img src="img/sanidade.png" id="btn-open-sanidade" class="btn-sanidade-img" alt="Abrir Sanidade" />
        
        <div id="sanidade-panel" class="sanidade-panel" style="display: none;">
            
            <div class="sanidade-row">
                <div class="sanidade-label-interactive" tabindex="0">
                    Estresse
                    <div class="estresse-tooltip">
                        <div><strong>25%</strong> Teste Mental <span class="txt-verde">[Verde]</span></div>
                        <div><strong>50%</strong> Teste Mental <span class="txt-amarelo">[Amarelo]</span></div>
                        <div><strong>75%</strong> Teste Mental <span class="txt-vermelho">[Vermelho]</span></div>
                        <div style="margin-top:4px; border-top:1px solid #333; padding-top:4px;">
                            <strong>100%</strong> Crise Completa <span class="txt-roxo">(Destruição ou Virtude)</span>
                        </div>
                    </div>
                </div>
                <input type="number" id="input-estresse" class="sanidade-input" value="0" />
            </div>
            
            <div class="sanidade-progress-container">
                <div id="estresse-bar" class="sanidade-progress-bar"></div>
            </div>
            <div id="estresse-footer" class="estresse-footer">0 / 0</div>

            <div class="sanidade-row" id="row-vazio" style="margin-top: 15px;">
                <div class="sanidade-label" style="font-size:13px; font-weight:700; color:#ccc; text-transform:uppercase;">Vazio</div>
                <input type="text" id="input-vazio" class="sanidade-input" value="0" />
            </div>

            <img src="img/sanidade.png" id="btn-close-sanidade" class="btn-sanidade1-img" alt="Fechar" style="margin-top: 10px; width: 300px;" />
        </div>
    `;
    containerCentro.appendChild(wrap);

    // Inicializa state se não existir
    if (!state.sanidade) state.sanidade = { estresse: 0, vazio: 0 };

    // Eventos de Abrir/Fechar
    const btnOpen = wrap.querySelector('#btn-open-sanidade');
    const panel = wrap.querySelector('#sanidade-panel');
    const btnClose = wrap.querySelector('#btn-close-sanidade');

    btnOpen.onclick = () => { 
        btnOpen.style.display = 'none'; 
        panel.style.display = 'flex'; 
        atualizarSanidadeInterface(); 
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
    });
    inEstresse.addEventListener('blur', () => saveStateToServer());
    inEstresse.addEventListener('keydown', (e) => { if(e.key === 'Enter') inEstresse.blur(); });

    // Eventos de Input (Vazio)
    const inVazio = document.getElementById('input-vazio');

    // Focus: Se estiver "Sincronizado", mostra o número para editar
    inVazio.addEventListener('focus', () => {
        if (state.sanidade.vazio >= 144) {
            inVazio.value = state.sanidade.vazio;
            inVazio.style.width = "60px";
            inVazio.select();
        }
    });

    // Input: Atualiza valor
    inVazio.addEventListener('input', () => {
        let val = inVazio.value;
        if (val.toLowerCase() === "sincronizado") {
            state.sanidade.vazio = 144;
        } else {
            state.sanidade.vazio = parseInt(val) || 0;
        }
        // Fallback visual se a função auxiliar não estiver disponível no escopo
        if (typeof atualizarVisualVazio === 'function') atualizarVisualVazio(state.sanidade.vazio);
        else atualizarSanidadeInterface();
    });

    inVazio.addEventListener('blur', () => {
        saveStateToServer();
        if (typeof atualizarVisualVazio === 'function') atualizarVisualVazio(state.sanidade.vazio);
        else atualizarSanidadeInterface();
    });
    
    inVazio.addEventListener('keydown', (e) => { if(e.key === 'Enter') inVazio.blur(); });
}

function atualizarVisualVazio(valor) {
    const inVazio = document.getElementById('input-vazio');
    const rowVazio = document.getElementById('row-vazio');
    if (!inVazio || !rowVazio) return;

    // Limites
    const val = Math.max(0, valor);
    
    // Se chegou no máximo (144) ou passou
    if (val >= 144) {
        
        // Só muda o texto para "Sincronizado" se o usuário NÃO estiver digitando agora
        if (document.activeElement !== inVazio) {
            inVazio.value = "Sincronizado";
            inVazio.style.width = "120px"; // Expande para caber texto
        }
        
        inVazio.classList.add('input-sincronizado');
        rowVazio.classList.add('row-infundido');
        
        // Visual Roxo Sólido/Forte
        rowVazio.style.background = `radial-gradient(circle, rgba(148, 0, 211, 0.8) 0%, rgba(74, 20, 140, 0.9) 100%)`;
        rowVazio.style.boxShadow = `0 0 20px rgba(148, 0, 211, 0.8)`;
        rowVazio.style.border = `1px solid #e040fb`;
        
    } else {
        // Abaixo de 144
        if (document.activeElement !== inVazio) {
            inVazio.value = val;
            inVazio.style.width = "60px"; // Volta ao tamanho normal
        }
        
        inVazio.classList.remove('input-sincronizado');
        rowVazio.classList.remove('row-infundido');

        // Gradiente Crescente (Roxo se espalhando do centro)
        const ratio = Math.min(1, val / 144);
        const spread = Math.floor(ratio * 80); // Espalha até 80% do box
        const alpha = ratio * 0.7; 
        
        rowVazio.style.background = `radial-gradient(circle at center, rgba(148,0,211, ${alpha}) ${spread}%, transparent ${spread + 30}%)`;
        rowVazio.style.boxShadow = `0 0 ${spread/3}px rgba(148,0,211, ${alpha * 0.5})`;
        rowVazio.style.border = '1px solid transparent';
    }
}

   function atualizarSanidadeInterface() {
    if (!state.sanidade) state.sanidade = { estresse: 0, vazio: 0 };

    // --- 1. CÁLCULO MÁXIMO ESTRESSE (LENDO DO STATE) ---
    // (Sabedoria x 5) + (Proficiência x 10)
    
    const sabScore = parseInt(state.atributos?.n3 || 10);
    
    // Função auxiliar para proficiência (mesma lógica usada antes)
    const getProficiencia = () => {
        if (!state.niveisClasses) return 2;
        const nivelTotal = Object.values(state.niveisClasses).reduce((a, b) => a + (parseInt(b) || 0), 0) || 1;
        return Math.floor((nivelTotal - 1) / 4) + 2;
    };
    const profVal = getProficiencia();

    const maxEstresse = (sabScore * 5) + (profVal * 10);
    const atualEstresse = state.sanidade.estresse;

    // Atualiza Input e Footer
    const inEstresse = document.getElementById('input-estresse');
    const footerEstresse = document.getElementById('estresse-footer');
    
    if (inEstresse && document.activeElement !== inEstresse) inEstresse.value = atualEstresse;
    if (footerEstresse) footerEstresse.textContent = `${atualEstresse} / ${maxEstresse}`;

    // --- 2. BARRA DE ESTRESSE ---
    const bar = document.getElementById('estresse-bar');
    if (bar) {
        let pct = 0;
        if (maxEstresse > 0) {
            // Arredondamento para baixo conforme solicitado
            pct = Math.floor((atualEstresse / maxEstresse) * 100);
        }
        // Garante limite visual 0-100% (mas a lógica de cor usa o valor calculado real)
        const visualPct = Math.min(100, Math.max(0, pct));
        
        bar.style.width = `${visualPct}%`;
        bar.className = 'sanidade-progress-bar'; // Limpa classes

        // Lógica de Cores exata:
        // 0-24% : Verde
        // 25-49%: Amarelo
        // 50-74%: Laranja
        // 75-99%: Vermelho
        // >=100%: Surto (Pisca)

        if (pct >= 100) {
            bar.classList.add('estresse-surto');
        } else if (pct >= 75) {
            bar.classList.add('estresse-vermelho');
        } else if (pct >= 50) {
            bar.classList.add('estresse-laranja');
        } else if (pct >= 25) {
            bar.classList.add('estresse-amarelo');
        } else {
            bar.classList.add('estresse-verde');
        }
    }

    // --- 3. ATUALIZA VAZIO (Chama função visual se existir) ---
    if (typeof atualizarVisualVazio === 'function') {
        atualizarVisualVazio(state.sanidade.vazio);
    }
}
});