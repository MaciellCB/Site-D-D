/* =============================================================
   LÓGICA DO CENTRO (PERÍCIAS, DINHEIRO E SANIDADE)
============================================================= */

document.addEventListener("DOMContentLoaded", () => {
    const listaPericias = document.querySelector(".pericias");
    const containerCentro = document.querySelector('.lado-centro');

    // 1. Inicializa componentes fixos na ordem correta
    renderizarEstruturaDinheiro(); // Dinheiro vem antes da Sanidade
    renderizarEstruturaSanidade();

    // 2. Listener de Atualização
    window.addEventListener('sheet-updated', () => {
        renderizarPericias();
        atualizarDinheiroInterface();
        atualizarSanidadeInterface();
    });

    /* =========================
       1. HELPER: CÁLCULOS SEGUROS
    ========================= */
    function getProficienciaDoState() {
        if (!state.niveisClasses) return 2;
        const nivelTotal = Object.values(state.niveisClasses).reduce((a, b) => a + (parseInt(b) || 0), 0) || 1;
        return Math.floor((nivelTotal - 1) / 4) + 2;
    }

    function getModificadorDoState(attrKey) {
        const val = parseInt(state.atributos?.[attrKey] || 10);
        return Math.floor((val - 10) / 2);
    }

    /* =========================
       2. LÓGICA DE PERÍCIAS (COM ROLAGEM DE DADOS)
    ========================= */
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
            const chaveAttr = atributoParaChave[dados.atributo] || "n2"; 
            const mod = getModificadorDoState(chaveAttr);
            
            // CÁLCULO DO BÔNUS TOTAL
            const bonusTotal = mod + (dados.treinado ? prof : 0) + (parseInt(dados.outros) || 0);

            const li = document.createElement("li");
            li.className = "pericia-item";
            
            // Adicionado style cursor:pointer na imagem
            li.innerHTML = `
                <img src="img/imagem-no-site/dado.png" class="col-icon" style="cursor:pointer; transition: transform 0.2s;" title="Rolar ${nome}">
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

            // --- NOVO: EVENTO DE ROLAGEM DE PERÍCIA ---
            const btnDado = li.querySelector('.col-icon');
            btnDado.addEventListener('click', () => {
                // Efeito visual de clique
                btnDado.style.transform = "scale(0.9)";
                setTimeout(() => btnDado.style.transform = "scale(1)", 100);

                // Monta a expressão: 1d20 + bonusTotal
                const sinal = bonusTotal >= 0 ? '+' : '';
                const expressao = `1d20 ${sinal} ${bonusTotal}`;

                // Chama as funções globais definidas no DireitaJS.js
                // REMOVIDO O AVISO (ALERT) DO ELSE
                if (typeof rollDiceExpression === 'function' && typeof showDiceResults === 'function') {
                    const resultado = rollDiceExpression(expressao);
                    showDiceResults(`Perícia: ${nome}`, resultado);
                } 
            });
            // ------------------------------------------

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
       3. LÓGICA DE DINHEIRO (2 BOTÕES COM CASCATA)
    ========================= */
    function renderizarEstruturaDinheiro() {
        const containerCentro = document.querySelector('.lado-centro');
        if (!containerCentro || document.getElementById('money-wrapper')) return;

        const moneyWrap = document.createElement('div');
        moneyWrap.id = 'money-wrapper';
        moneyWrap.className = 'money-wrapper';
        
        moneyWrap.style.cssText = `
            display: flex; 
            justify-content: space-between; 
            align-items: center;
            margin: 10px 0; 
            padding: 8px 15px; 
            background: rgba(0,0,0,0.4); 
            border-radius: 6px; 
            border: 1px solid #333;
            position: relative;
        `;

        // Definição das Moedas
        const currencies = [
            { id: 'pd', label: 'PD', name: 'Peça Dracônica', color: '#d32f2f' },
            { id: 'pl', label: 'PL', name: 'Peça de Platina', color: '#e5e4e2' }, 
            { id: 'po', label: 'PO', name: 'Peça de Ouro', color: '#ffd700' },
            { id: 'pp', label: 'PP', name: 'Peça de Prata', color: '#c0c0c0' },
            { id: 'pc', label: 'PC', name: 'Peça de Cobre', color: '#b87333' }
        ];

        // Gera o HTML na ordem visual: PC -> PP -> PO -> PL -> PD
        let html = '';
        const visualOrder = ['pc', 'pp', 'po', 'pl', 'pd'];

        visualOrder.forEach(key => {
            const c = currencies.find(x => x.id === key);
            html += `
                <div class="money-slot" style="display:flex; flex-direction:column; align-items:center; gap:3px;">
                    <span title="${c.name}" style="
                        font-weight:900; 
                        font-size:11px; 
                        color:${c.color}; 
                        cursor:help; 
                        text-shadow: 0 1px 2px #000;
                        letter-spacing: 1px;
                    ">${c.label}</span>
                    <input type="number" id="input-money-${c.id}" value="0" style="
                        width: 50px; 
                        text-align: center; 
                        background: #111; 
                        border: 1px solid #444; 
                        color: #fff; 
                        border-radius: 4px; 
                        padding: 4px;
                        font-size: 13px;
                    ">
                </div>
            `;
        });

        // Adiciona os DOIS botões
        html += `
            <div style="display:flex; flex-direction:column; gap:4px; margin-left: 8px;">
                <div title="Converter: Agrupa moedas menores em maiores (Base 100)" id="btn-money-up" style="
                    cursor: pointer; opacity: 0.8; font-size: 14px; line-height: 1; user-select: none;
                ">⬆️</div>
                <div title="Desconverter: Quebra em cascata se > 100" id="btn-money-down" style="
                    cursor: pointer; opacity: 0.8; font-size: 14px; line-height: 1; user-select: none;
                ">⬇️</div>
            </div>
        `;

        moneyWrap.innerHTML = html;

        // Inserção no DOM
        const sanidadeEl = document.getElementById('sanidade-wrapper');
        if (sanidadeEl) {
            containerCentro.insertBefore(moneyWrap, sanidadeEl);
        } else {
            containerCentro.appendChild(moneyWrap);
        }

        // --- FUNÇÕES DE CONVERSÃO ---

        // 1. BOTÃO SUBIR (⬆️): Agrupa tudo para cima (Padrão)
        document.getElementById('btn-money-up').onclick = () => {
            if (!state.money) return;
            let { pc, pp, po, pl, pd } = state.money;
            pc = parseInt(pc)||0; pp = parseInt(pp)||0; po = parseInt(po)||0; pl = parseInt(pl)||0; pd = parseInt(pd)||0;

            if (pc >= 100) { pp += Math.floor(pc / 100); pc = pc % 100; }
            if (pp >= 100) { po += Math.floor(pp / 100); pp = pp % 100; }
            if (po >= 100) { pl += Math.floor(po / 100); po = po % 100; }
            if (pl >= 100) { pd += Math.floor(pl / 100); pl = pl % 100; }

            state.money = { pc, pp, po, pl, pd };
            atualizarDinheiroInterface();
            saveStateToServer();
        };

        // 2. BOTÃO DESCER (⬇️): Quebra em Cascata se >= 100
        document.getElementById('btn-money-down').onclick = () => {
            if (!state.money) return;
            let { pc, pp, po, pl, pd } = state.money;
            pc = parseInt(pc)||0; pp = parseInt(pp)||0; po = parseInt(po)||0; pl = parseInt(pl)||0; pd = parseInt(pd)||0;

            // Passo 1: Quebra a moeda mais alta disponível (Gatilho inicial)
            if (pd > 0) {
                pd--; pl += 100;
            } else if (pl > 0) {
                pl--; po += 100;
            } else if (po > 0) {
                po--; pp += 100;
            } else if (pp > 0) {
                pp--; pc += 100;
            }

            // Passo 2: Cascata (Se alguma moeda ficou >= 100, quebra ela para a próxima)
            // A ordem aqui é importante: do maior para o menor para propagar a onda.
            
            if (pl >= 100) {
                pl--; po += 100;
            }
            if (po >= 100) {
                po--; pp += 100;
            }
            if (pp >= 100) {
                pp--; pc += 100;
            }

            state.money = { pc, pp, po, pl, pd };
            atualizarDinheiroInterface();
            saveStateToServer();
        };

        // Bind Inputs
        visualOrder.forEach(key => {
            const input = moneyWrap.querySelector(`#input-money-${key}`);
            input.addEventListener('input', () => {
                if (!state.money) state.money = { pc:0, pp:0, pd:0, po:0, pl:0 };
                state.money[key] = parseInt(input.value) || 0;
            });
            input.addEventListener('blur', () => saveStateToServer());
            input.addEventListener('keydown', (e) => { if(e.key === 'Enter') input.blur(); });
        });
    }

    function atualizarDinheiroInterface() {
        if (!state.money) state.money = { pc:0, pp:0, pd:0, po:0, pl:0 };

        ['pc', 'pp', 'pd', 'po', 'pl'].forEach(key => {
            const el = document.getElementById(`input-money-${key}`);
            if (el && document.activeElement !== el) {
                el.value = state.money[key] || 0;
            }
        });
    }

    /* =========================
       4. LÓGICA DE SANIDADE (ESTRESSE & VAZIO) - BLINDADA
    ========================= */

    function renderizarEstruturaSanidade() {
        const containerCentro = document.querySelector('.lado-centro');
        if (!containerCentro || document.getElementById('sanidade-wrapper')) return;

        const wrap = document.createElement('div');
        wrap.id = 'sanidade-wrapper';
        wrap.className = 'sanidade-wrapper';

        // HTML com o Tooltip dentro do label interativo
        wrap.innerHTML = `
        <img src="img/imagem-no-site/sanidade.png" id="btn-open-sanidade" class="btn-sanidade-img" alt="Abrir Sanidade" />
        
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

            <img src="img/imagem-no-site/sanidade.png" id="btn-close-sanidade" class="btn-sanidade1-img" alt="Fechar" style="margin-top: 10px; width: 300px;" />
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
        inEstresse.addEventListener('keydown', (e) => { if (e.key === 'Enter') inEstresse.blur(); });

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

        inVazio.addEventListener('keydown', (e) => { if (e.key === 'Enter') inVazio.blur(); });
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
            rowVazio.style.boxShadow = `0 0 ${spread / 3}px rgba(148,0,211, ${alpha * 0.5})`;
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