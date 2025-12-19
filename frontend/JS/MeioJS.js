document.addEventListener("DOMContentLoaded", () => {
    const listaPericias = document.querySelector(".pericias");
    const containerCentro = document.querySelector('.lado-centro');

    // Inicializa a Sanidade assim que o DOM carregar
    renderizarEstruturaSanidade();

    // Escuta o evento de que a ficha foi carregada ou atualizada
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
        return profEl ? parseInt(profEl.textContent || "0", 10) : 0;
    }

   function renderizarPericias() {
        if (!listaPericias || !state.pericias) return;
        listaPericias.innerHTML = "";

        // Header da Tabela
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

        // Lista de atributos para o select
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

            // EVENTO: Alterar Atributo (Select)
            const selectAttr = li.querySelector('.atributo-select');
            selectAttr.addEventListener('change', (e) => {
                state.pericias[nome].atributo = e.target.value;
                atualizarBonusVisual(li, nome);
                saveStateToServer();
            });

            // EVENTO: Treino (Checkbox)
            const check = li.querySelector('.treino');
            check.addEventListener('change', (e) => {
                state.pericias[nome].treinado = e.target.checked;
                atualizarBonusVisual(li, nome);
                saveStateToServer();
            });

            // EVENTO: Outros (Input)
            const inputOutros = li.querySelector('.outros');
            inputOutros.addEventListener('input', (e) => {
                state.pericias[nome].outros = parseInt(e.target.value) || 0;
                atualizarBonusVisual(li, nome);
                saveStateToServer();
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
       LOGICA DE SANIDADE
    ========================= */

    function renderizarEstruturaSanidade() {
        if (!containerCentro || document.getElementById('sanidade-wrapper')) return;

        const wrap = document.createElement('div');
        wrap.id = 'sanidade-wrapper';
        wrap.className = 'sanidade-wrapper';
        wrap.innerHTML = `
            <img src="img/sanidade.png" id="btn-open-sanidade" class="btn-sanidade-img" alt="Abrir" />
            <div id="sanidade-panel" class="sanidade-panel" style="display: none;">
                <div class="sanidade-row">
                    <div class="sanidade-label">Estresse</div>
                    <input type="number" id="input-estresse" class="sanidade-input" value="0" />
                </div>
                <div class="sanidade-row">
                    <div class="sanidade-label">Vazio</div>
                    <input type="number" id="input-vazio" class="sanidade-input" value="0" />
                </div>
                <img src="img/sanidade2.png" id="btn-close-sanidade" class="btn-sanidade1-img" alt="Fechar" />
            </div>
        `;
        containerCentro.appendChild(wrap);

        const btnOpen = wrap.querySelector('#btn-open-sanidade');
        const btnClose = wrap.querySelector('#btn-close-sanidade');
        const panel = wrap.querySelector('#sanidade-panel');

        btnOpen.onclick = () => { btnOpen.style.display='none'; panel.style.display='flex'; };
        btnClose.onclick = () => { panel.style.display='none'; btnOpen.style.display='block'; };

        // Listeners para salvamento automático
        wrap.querySelectorAll('input').forEach(input => {
            input.addEventListener('change', () => {
                state.sanidade = {
                    estresse: parseInt(document.getElementById('input-estresse').value) || 0,
                    vazio: parseInt(document.getElementById('input-vazio').value) || 0
                };
                saveStateToServer();
            });
        });
    }

    function atualizarSanidadeInterface() {
        const s = state.sanidade || { estresse: 0, vazio: 0 };
        const inEstresse = document.getElementById('input-estresse');
        const inVazio = document.getElementById('input-vazio');
        if(inEstresse) inEstresse.value = s.estresse;
        if(inVazio) inVazio.value = s.vazio;
    }
});