// ======================================
// Configurações e Tabelas
// ======================================
const xpPorNivel = {
    1: { max: 300, marco: 0 }, 2: { max: 900, marco: 0 }, 3: { max: 2700, marco: 1 },
    4: { max: 6500, marco: 1 }, 5: { max: 14000, marco: 1 }, 6: { max: 23000, marco: 2 },
    7: { max: 34000, marco: 2 }, 8: { max: 48000, marco: 2 }, 9: { max: 64000, marco: 2 },
    10: { max: 85000, marco: 2 }, 11: { max: 100000, marco: 3 }, 12: { max: 120000, marco: 3 },
    13: { max: 140000, marco: 3 }, 14: { max: 165000, marco: 3 }, 15: { max: 195000, marco: 3 },
    16: { max: 225000, marco: 4 }, 17: { max: 265000, marco: 4 }, 18: { max: 305000, marco: 4 },
    19: { max: 355000, marco: 5 }, 20: { max: 999999, marco: 99 }
};

const classesPadrao = [
    { key: 'artifice', nome: 'Artífice', dado: 'd8' },
    { key: 'barbaro', nome: 'Bárbaro', dado: 'd12' },
    { key: 'bardo', nome: 'Bardo', dado: 'd8' },
    { key: 'blood hunter', nome: 'Blood Hunter', dado: 'd10' },
    { key: 'bruxo', nome: 'Bruxo', dado: 'd8' },
    { key: 'clerigo', nome: 'Clérigo', dado: 'd8' },
    { key: 'druida', nome: 'Druida', dado: 'd8' },
    { key: 'feiticeiro', nome: 'Feiticeiro', dado: 'd6' },
    { key: 'guerreiro', nome: 'Guerreiro', dado: 'd10' },
    { key: 'ladino', nome: 'Ladino', dado: 'd8' },
    { key: 'mago', nome: 'Mago', dado: 'd6' },
    { key: 'monge', nome: 'Monge', dado: 'd8' },
    { key: 'paladino', nome: 'Paladino', dado: 'd10' },
    { key: 'patrulheiro', nome: 'Patrulheiro', dado: 'd10' }
];

const DADOS_VALORES = {
    'd12': [1,2,3,4,5,6,7,8,9,10,11,12],
    'd10': [1,2,3,4,5,6,7,8,9,10],
    'd8':  [1,2,3,4,5,6,7,8],
    'd6':  [1,2,3,4,5,6]
};

let mostrandoAtributos = true;
let editMode = false;
let rotateInterval = null;
const numerosHex = Array.from(document.querySelectorAll('.hexagrama .num'));
const hexOverlay = document.querySelector('.hex-overlay');

// ======================================
// Sincronização Inicial
// ======================================

window.addEventListener('sheet-updated', () => {
    inicializarDadosEsquerda();
    atualizarTudoVisual();
    vincularEntradasManuaisBarras();
});

function inicializarDadosEsquerda() {
    if (!state.atributos) state.atributos = { n1: 10, n2: 10, n3: 10, n4: 10, n5: 10, n6: 10 };
    if (!state.niveisClasses) state.niveisClasses = {};
    if (!state.vidaDadosSalvos) state.vidaDadosSalvos = {};
    if (state.vidaAtual === undefined) state.vidaAtual = 10;
    if (state.vidaTempAtual === undefined) state.vidaTempAtual = 0;
    if (state.danoNecroAtual === undefined) state.danoNecroAtual = 0;
    if (state.marco === undefined) state.marco = 0;
    if (state.xp === undefined) state.xp = 0;
    if (state.inspiracao === undefined) state.inspiracao = 0;

    numerosHex.forEach(n => {
        const id = n.classList[1]; 
        const val = state.atributos[id] || 10;
        n.dataset.attrValue = val;
        n.textContent = mostrandoAtributos ? val : formatMod(calcularModificador(val));
    });

    document.getElementById('xpAtual').value = state.xp;
    document.getElementById('marcoAtual').value = state.marco;
    document.getElementById('inspiraValor').textContent = state.inspiracao;
}

// ======================================
// Lógica de Atributos
// ======================================

function calcularModificador(n) {
    return Math.floor((parseInt(n, 10) - 10) / 2);
}

function formatMod(m) {
    return m >= 0 ? `+${m}` : m;
}

if (hexOverlay) {
    hexOverlay.onclick = () => {
        if (editMode) {
            editMode = false;
            numerosHex.forEach(n => n.setAttribute('contenteditable', 'false'));
            salvarAtributosDaTela();
        }
        mostrandoAtributos = !mostrandoAtributos;
        hexOverlay.src = mostrandoAtributos ? 'img/atributos.png' : 'img/modificador.png';
        numerosHex.forEach(n => {
            const val = n.dataset.attrValue;
            n.textContent = mostrandoAtributos ? val : formatMod(calcularModificador(val));
        });
    };
}

document.querySelector('.editar-hex').onclick = () => {
    if (!mostrandoAtributos) {
        mostrandoAtributos = true;
        hexOverlay.src = 'img/atributos.png';
    }
    editMode = !editMode;
    numerosHex.forEach(n => {
        n.setAttribute('contenteditable', editMode);
        if (editMode) n.textContent = n.dataset.attrValue;
    });
    if (!editMode) salvarAtributosDaTela();
};

function salvarAtributosDaTela() {
    numerosHex.forEach(n => {
        const id = n.classList[1];
        const val = parseInt(n.textContent) || 0;
        state.atributos[id] = val;
        n.dataset.attrValue = val;
    });
    saveStateToServer();
    atualizarVidaCalculada();
    window.dispatchEvent(new CustomEvent('sheet-updated'));
}

// ======================================
// Gestão de Classes
// ======================================

document.getElementById('classeFocus').onclick = (e) => {
    const painel = document.getElementById('painelClasses');
    const lista = document.getElementById('listaClasses');
    lista.innerHTML = '';

    classesPadrao.forEach(c => {
        const nivel = state.niveisClasses[c.key] || 0;
        const div = document.createElement('div');
        div.className = 'item-classe';
        div.innerHTML = `
            <span>${c.nome}</span>
            <input type="number" min="0" value="${nivel}" oninput="salvarNivelClasse('${c.key}', this.value)">
        `;
        lista.appendChild(div);
    });

    painel.style.display = 'block';
    const rect = e.currentTarget.getBoundingClientRect();
    painel.style.left = `${rect.left}px`;
    painel.style.top = `${rect.bottom + 5}px`;
};

window.salvarNivelClasse = (key, val) => {
    state.niveisClasses[key] = parseInt(val) || 0;
    
    // LIMPEZA AUTOMÁTICA DE DADOS DE VIDA AO REMOVER NÍVEL
    const novoNivelTotal = Object.values(state.niveisClasses).reduce((a, b) => a + b, 0);
    const keysVida = Object.keys(state.vidaDadosSalvos);
    
    // Remove v6, v7... se o novo total for 5 por exemplo.
    keysVida.forEach(k => {
        const index = parseInt(k.replace('v', ''));
        if (index > novoNivelTotal) {
            delete state.vidaDadosSalvos[k];
        }
    });

    atualizarTudoVisual();
    
    // ATUALIZA A ABA DE DADOS DE VIDA AUTOMATICAMENTE SE ESTIVER ABERTA
    const containerVida = document.querySelector('.classes-lista-container');
    if (containerVida.style.display === 'block') {
        renderizarDadosVida();
    }

    saveStateToServer();
};

document.getElementById('fecharPainel').onclick = () => document.getElementById('painelClasses').style.display = 'none';

function atualizarFocoClasseRotativo() {
    const ativas = classesPadrao.filter(c => state.niveisClasses[c.key] > 0);
    if (!ativas.length) {
        document.getElementById('classeFocusNome').textContent = "Sem Classe";
        document.getElementById('classeFocusNivel').textContent = "0";
        return;
    }
    let i = 0;
    if (rotateInterval) clearInterval(rotateInterval);
    const mudar = () => {
        const c = ativas[i % ativas.length];
        document.getElementById('classeFocusNome').textContent = c.nome;
        document.getElementById('classeFocusNivel').textContent = state.niveisClasses[c.key];
        i++;
    };
    mudar();
    if (ativas.length > 1) rotateInterval = setInterval(mudar, 5000);
}

// ======================================
// SISTEMA DE VIDA E BARRAS
// ======================================

function atualizarVidaCalculada() {
    const conMod = calcularModificador(state.atributos.n1);
    const nivelTotal = Object.values(state.niveisClasses || {}).reduce((a, b) => a + (parseInt(b) || 0), 0);
    const somaDados = Object.values(state.vidaDadosSalvos || {}).reduce((a, b) => a + (parseInt(b) || 0), 0);
    
    const vidaMax = somaDados + (conMod * nivelTotal);
    document.getElementById('vida-total').textContent = vidaMax;
    
    atualizarBarraUI('vida', state.vidaAtual, vidaMax);
    atualizarBarraUI('vida-temp', state.vidaTempAtual, 100);
    atualizarBarraUI('dano-necro', state.danoNecroAtual, 100);
}

function atualizarBarraUI(prefixo, atual, total) {
    const fill = document.getElementById(`${prefixo}-fill`);
    const texto = document.getElementById(`${prefixo}-atual`);
    if (fill && texto) {
        const valAtual = parseInt(atual) || 0;
        const valTotal = parseInt(total) || 1;
        const pct = Math.min(100, (valAtual / valTotal) * 100);
        fill.style.width = pct + "%";
        texto.textContent = valAtual;
    }
}

// ATUALIZAÇÃO AUTOMÁTICA AO DIGITAR (oninput)
function vincularEntradasManuaisBarras() {
    const IDs = ['vida-atual', 'vida-temp-atual', 'dano-necro-atual'];
    
    IDs.forEach(id => {
        const el = document.getElementById(id);
        if (!el) return;

        el.addEventListener('keydown', (e) => {
            if (e.key === 'Enter') {
                e.preventDefault();
                el.blur();
            }
        });

        // Atualização visual imediata ao digitar
        el.addEventListener('input', () => {
            const val = parseInt(el.textContent) || 0;
            let key = (id === 'vida-atual') ? "vidaAtual" : (id === 'vida-temp-atual' ? "vidaTempAtual" : "danoNecroAtual");
            let max = (id === 'vida-atual') ? parseInt(document.getElementById('vida-total').textContent) : 100;
            
            // Aplica limite imediato mas não trava a digitação do usuário de forma agressiva
            state[key] = Math.max(0, Math.min(max, val));
            atualizarVidaCalculada();
        });

        // Salva no servidor ao sair do campo
        el.addEventListener('blur', () => {
            saveStateToServer();
        });
    });
}

document.querySelectorAll('.lado-esquerdo button').forEach(btn => {
    if (!btn.closest('.vida-bar') && !btn.closest('.barra-secundaria')) return;

    btn.onclick = () => {
        let key = "";
        let isSecundaria = false;

        if (btn.closest('.vida-container')) {
            key = "vidaAtual";
        } else if (btn.closest('.barra-secundaria:nth-child(1)')) {
            key = "vidaTempAtual";
            isSecundaria = true;
        } else if (btn.closest('.barra-secundaria:nth-child(2)')) {
            key = "danoNecroAtual";
            isSecundaria = true;
        }

        let step = 0;
        if (btn.classList.contains('menos5')) step = -5;
        else if (btn.classList.contains('menos1')) step = -1;
        else if (btn.classList.contains('mais1')) step = 1;
        else if (btn.classList.contains('mais5')) step = 5;

        const vidaMaxCalculada = parseInt(document.getElementById('vida-total').textContent) || 10;
        const limiteMaximo = isSecundaria ? 100 : vidaMaxCalculada;

        const valorAtual = parseInt(state[key]) || 0;
        state[key] = Math.max(0, Math.min(limiteMaximo, valorAtual + step));
        
        atualizarVidaCalculada();
        saveStateToServer();
    };
});

// ======================================
// XP e Marcos
// ======================================

document.getElementById('xpAtual').oninput = (e) => {
    state.xp = e.target.value;
    atualizarMarcosEXP();
    saveStateToServer();
};

document.getElementById('marcoAtual').oninput = (e) => {
    state.marco = parseInt(e.target.value) || 0;
    atualizarMarcosEXP();
    saveStateToServer();
};

function atualizarMarcosEXP() {
    const nivelTotal = Object.values(state.niveisClasses || {}).reduce((a, b) => a + (parseInt(b) || 0), 0) || 1;
    const tabela = xpPorNivel[Math.min(20, Math.max(1, nivelTotal))];
    const valXP = parseInt(state.xp) || 0;
    document.getElementById('xpTotalText').textContent = `/ ${tabela.max}`;
    document.getElementById('xpBar').style.width = Math.min(100, (valXP / tabela.max) * 100) + "%";

    const marcoMax = tabela.marco;
    const valMarco = parseInt(state.marco) || 0;
    document.getElementById('marcoMax').value = marcoMax;
    document.getElementById('marcoBar').style.width = marcoMax > 0 ? Math.min(100, (valMarco / marcoMax) * 100) + "%" : "0%";
}

// ======================================
// Inspiração e Dados de Vida
// ======================================

document.getElementById('inspiraLeft').onclick = () => { 
    state.inspiracao = Math.max(0, (parseInt(state.inspiracao) || 0) - 1); 
    document.getElementById('inspiraValor').textContent = state.inspiracao;
    saveStateToServer(); 
};
document.getElementById('inspiraRight').onclick = () => { 
    state.inspiracao = (parseInt(state.inspiracao) || 0) + 1; 
    document.getElementById('inspiraValor').textContent = state.inspiracao;
    saveStateToServer(); 
};

document.getElementById('btnVida').onclick = () => {
    const container = document.querySelector('.classes-lista-container');
    container.style.display = container.style.display === 'none' ? 'block' : 'none';
    renderizarDadosVida();
};

function renderizarDadosVida() {
    const lista = document.getElementById('classesLista');
    lista.innerHTML = '';
    let counter = 1;

    Object.entries(state.niveisClasses || {}).forEach(([key, nivel]) => {
        const classeRef = classesPadrao.find(c => c.key === key);
        if (!classeRef || nivel <= 0) return;

        for (let i = 1; i <= nivel; i++) {
            const vidId = `v${counter}`;
            const valorSalvo = state.vidaDadosSalvos[vidId] || 0;
            const opcoesDado = DADOS_VALORES[classeRef.dado] || [];

            const li = document.createElement('li');
            li.style.display = 'flex';
            li.style.alignItems = 'center';
            li.style.gap = '10px';
            li.style.padding = '4px 0';
            li.style.borderBottom = '1px solid #222';

            li.innerHTML = `
                <span style="min-width:90px; font-size:12px; font-weight:bold; color:#ccc;">${classeRef.nome}</span>
                <img src="img/dado.png" style="width:18px; cursor:pointer" onclick="rolarDadoVida('${vidId}', '${classeRef.dado}')">
                
                <select onchange="salvarDadoVida('${vidId}', this.value)" 
                        style="background:#000; color:#fff; border:1px solid #9c27b0; border-radius:4px; padding:2px; font-size:12px; width:50px; cursor:pointer;">
                    <option value="0" ${valorSalvo == 0 ? 'selected' : ''}>-</option>
                    ${opcoesDado.map(num => `<option value="${num}" ${valorSalvo == num ? 'selected' : ''}>${num}</option>`).join('')}
                </select>
            `;
            lista.appendChild(li);
            counter++;
        }
    });
}

window.rolarDadoVida = (id, dado) => {
    const faces = parseInt(dado.replace('d', ''));
    const resultado = Math.floor(Math.random() * faces) + 1;
    state.vidaDadosSalvos[id] = resultado;
    renderizarDadosVida();
    atualizarVidaCalculada();
    saveStateToServer();
};

window.salvarDadoVida = (id, val) => {
    state.vidaDadosSalvos[id] = parseInt(val) || 0;
    atualizarVidaCalculada();
    saveStateToServer();
};

function atualizarTudoVisual() {
    atualizarFocoClasseRotativo();
    atualizarMarcosEXP();
    atualizarVidaCalculada();
    document.getElementById('nivelFoco').textContent = Object.values(state.niveisClasses || {}).reduce((a, b) => a + (parseInt(b) || 0), 0);
}