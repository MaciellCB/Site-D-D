/* =============================================================
   MAGIC SYSTEM: TABELAS E REGRAS DE PROGRESSÃO (D&D 5e)
   Versão Final: Multiclasse, Subclasses e Recursos Especiais
============================================================= */

const normalizeKey = (str) => {
    if (!str) return "";
    return str.normalize("NFD").replace(/[\u0300-\u036f]/g, "").toLowerCase().trim();
};

// Tabela de Slots Padrão (1º ao 9º)
const TABELA_SLOTS_PADRAO = {
    1:  [2,0,0,0,0,0,0,0,0], 2:  [3,0,0,0,0,0,0,0,0], 3:  [4,2,0,0,0,0,0,0,0],
    4:  [4,3,0,0,0,0,0,0,0], 5:  [4,3,2,0,0,0,0,0,0], 6:  [4,3,3,0,0,0,0,0,0],
    7:  [4,3,3,1,0,0,0,0,0], 8:  [4,3,3,2,0,0,0,0,0], 9:  [4,3,3,3,1,0,0,0,0],
    10: [4,3,3,3,2,0,0,0,0], 11: [4,3,3,3,2,1,0,0,0], 12: [4,3,3,3,2,1,0,0,0],
    13: [4,3,3,3,2,1,1,0,0], 14: [4,3,3,3,2,1,1,0,0], 15: [4,3,3,3,2,1,1,1,0],
    16: [4,3,3,3,2,1,1,1,0], 17: [4,3,3,3,2,1,1,1,1], 18: [4,3,3,3,3,1,1,1,1],
    19: [4,3,3,3,3,2,1,1,1], 20: [4,3,3,3,3,2,2,1,1]
};

const TIPO_CONJURADOR = {
    'bardo': 'full', 'clerigo': 'full', 'druida': 'full', 'feiticeiro': 'full', 'mago': 'full',
    'paladino': 'half', 'patrulheiro': 'half', 'artifice': 'half_up'
};

/* --- TABELAS ESPECÍFICAS --- */

// Blood Hunter: Maldições (Usos / Conhecidas)
const BH_MALDICOES = {
    usos: { 1:1, 2:1, 3:1, 4:1, 5:1, 6:2, 7:2, 8:2, 9:2, 10:2, 11:2, 12:2, 13:3, 14:3, 15:3, 16:3, 17:4, 18:4, 19:4, 20:4 },
    conhecidas: [1,1,1,1,1, 2,2,2,2, 3,3,3,3, 4,4,4,4, 5,5,5]
};

// Blood Hunter: Alma Profana (Pacto)
const BH_ALMA_PROFANA = {
    3: {q:1, n:1}, 4: {q:1, n:1}, 5: {q:1, n:1}, 
    6: {q:2, n:1}, 7: {q:2, n:2}, 8: {q:2, n:2}, 9: {q:2, n:2}, 10: {q:2, n:2}, 11: {q:2, n:2}, 12: {q:2, n:2},
    13: {q:2, n:3}, 14: {q:2, n:3}, 15: {q:2, n:3}, 16: {q:2, n:3}, 17: {q:2, n:3}, 18: {q:2, n:3}, 
    19: {q:2, n:4}, 20: {q:2, n:4}
};
const BH_ALMA_KNOWN = {
    3:2, 4:2, 5:3, 6:3, 7:4, 8:4, 9:5, 10:5, 11:6, 12:6, 13:7, 14:7, 15:8, 16:8, 17:9, 18:9, 19:10, 20:11
};

// Blood Hunter: Mutante
const BH_MUTANTE = {
    criados: { 3:1, 4:1, 5:1, 6:1, 7:2, 8:2, 9:2, 10:2, 11:2, 12:2, 13:2, 14:2, 15:3, 16:3, 17:3, 18:3, 19:3, 20:3 },
    conhecidos: { 3:4, 7:5, 11:6, 15:7, 18:8 }
};

// Artífice: Infusões
const ARTIFICE_INFUSOES = {
    itens_ativos: { 2:2, 3:2, 4:2, 5:2, 6:3, 7:3, 8:3, 9:3, 10:4, 11:4, 12:4, 13:4, 14:5, 15:5, 16:5, 17:5, 18:6, 19:6, 20:6 },
    conhecidas: { 2:4, 3:4, 4:4, 5:4, 6:6, 7:6, 8:6, 9:6, 10:8, 11:8, 12:8, 13:8, 14:10, 15:10, 16:10, 17:10, 18:12, 19:12, 20:12 }
};

const RECURSOS_EXTRAS = {
    'barbaro_furia': { 1:2, 2:2, 3:3, 4:3, 5:3, 6:4, 7:4, 8:4, 9:4, 10:4, 11:4, 12:5, 13:5, 14:5, 15:5, 16:5, 17:6, 18:6, 19:6, 20:99 },
    'bruxo_pacto': { // Padrão Bruxo
        1: {q:1,n:1}, 2: {q:2,n:1}, 3: {q:2,n:2}, 4: {q:2,n:2}, 5: {q:2,n:3}, 
        6: {q:2,n:3}, 7: {q:2,n:4}, 8: {q:2,n:4}, 9: {q:2,n:5}, 10: {q:2,n:5},
        11: {q:3,n:5}, 17: {q:4,n:5}
    }
};

// Tabelas de Texto Informativo
const PROGRESSAO_CLASSES = {
    'bardo': { truques: [2,2,2,3,3,3,3,3,3,4,4,4,4,4,4,4,4,4,4,4], conhecidas: [4,5,6,7,8,9,10,11,12,14,15,15,16,18,19,19,20,22,22,22] },
    'feiticeiro': { truques: [4,4,4,5,5,5,5,5,5,6,6,6,6,6,6,6,6,6,6,6], conhecidas: [2,3,4,5,6,7,8,9,10,11,12,12,13,13,14,14,15,15,15,15] },
    'bruxo': { 
        truques: [2,2,2,3,3,3,3,3,3,4,4,4,4,4,4,4,4,4,4,4], 
        conhecidas: [2,3,4,5,6,7,8,9,10,10,11,11,12,12,13,13,14,14,15,15]
    },
    'patrulheiro': { conhecidas: [0,2,3,3,4,4,5,5,6,6,7,7,8,8,9,9,10,10,11,11] },
    'clerigo': { truques: [3,3,3,4,4,4,4,4,4,5,5,5,5,5,5,5,5,5,5,5] },
    'druida': { truques: [2,2,2,3,3,3,3,3,3,4,4,4,4,4,4,4,4,4,4,4] },
    'mago': { truques: [3,3,3,4,4,4,4,4,4,5,5,5,5,5,5,5,5,5,5,5] },
    'artifice': { truques: [2,2,2,2,2,2,2,2,2,3,3,3,3,3,4,4,4,4,4,4] },
    'trapaceiro_arcano': { truques: [3,3,3,3,3,3,3,3,3,4,4,4,4,4,4,4,4,4,4,4], conhecidas: [0,0,3,4,4,4,5,6,6,7,8,8,9,10,10,11,11,11,12,13] },
    'cavaleiro_arcano': { truques: [2,2,2,2,2,2,2,2,2,3,3,3,3,3,3,3,3,3,3,3], conhecidas: [0,0,3,4,4,4,5,6,6,7,8,8,9,10,10,11,11,11,12,13] }
};

// --- FUNÇÃO PRINCIPAL ---
function calcularRecursosTotais(niveisClasses, habilidades, atributos) {
    const recursos = {
        slots: [0, 0, 0, 0, 0, 0, 0, 0, 0],
        pact: { qtd: 0, nivel: 0 },
        ki: 0, 
        furia: 0, 
        sorcery: 0, 
        mutagen: 0,       
        infusions: 0,     
        blood_curse: 0, 
        infoConjuracao: [] 
    };

    let nivelConjurador = 0;
    const getMod = (n) => Math.floor(((parseInt(atributos?.[n] || 10)) - 10) / 2);

    for (const [classeOriginal, nivel] of Object.entries(niveisClasses)) {
        if (nivel <= 0) continue;
        const cls = normalizeKey(classeOriginal);
        
        // 1. SLOTS PADRÃO
        if (TIPO_CONJURADOR[cls]) {
            const tipo = TIPO_CONJURADOR[cls];
            if (tipo === 'full') nivelConjurador += nivel;
            else if (tipo === 'half') nivelConjurador += Math.floor(nivel / 2);
            else if (tipo === 'half_up') nivelConjurador += Math.ceil(nivel / 2);
        }

        // 2. SUBCLASSES 1/3 (Guerreiro/Ladino)
        if (cls === 'guerreiro' || cls === 'ladino') {
            // Verifica se tem habilidade de subclasse mágica
            const temMagia = habilidades.some(h => 
                h.active && 
                (normalizeKey(h.title).includes("lancamento de feiticos") || normalizeKey(h.title).includes("magia")) && 
                normalizeKey(h.class).includes(cls)
            );
            
            if (temMagia) {
                nivelConjurador += Math.floor(nivel / 3);
                // Info
                const subKey = cls === 'guerreiro' ? 'cavaleiro_arcano' : 'trapaceiro_arcano';
                const dados = PROGRESSAO_CLASSES[subKey];
                recursos.infoConjuracao.push({
                    classe: cls === 'guerreiro' ? 'Cavaleiro Arcano' : 'Trapaceiro Arcano',
                    truques: dados.truques[nivel-1] || 0,
                    conhecidas: dados.conhecidas[nivel-1] || 0,
                    tipo: 'conhecidas'
                });
            }
        }

        // 3. RECURSOS ESPECÍFICOS

        // ARTÍFICE
        if (cls === 'artifice') {
            const itens = ARTIFICE_INFUSOES.itens_ativos[nivel] || 0;
            const known = ARTIFICE_INFUSOES.conhecidas[nivel] || 0;
            recursos.infusions += itens;

            const prep = Math.floor(nivel/2) + getMod('n5'); 
            recursos.infoConjuracao.push({ 
                classe: 'Artífice', 
                preparadas: Math.max(1, prep), 
                tipo: 'preparadas',
                extra: `${known} Infusões Conhecidas`
            });
        }

        // BLOOD HUNTER
        if (cls === 'blood hunter' || cls === 'cacador de sangue') {
            recursos.blood_curse += (BH_MALDICOES.usos[nivel] || 0);

            // Mutante
            if (habilidades.some(h => normalizeKey(h.title).includes("mutagen"))) {
                recursos.mutagen += (BH_MUTANTE.criados[nivel] || 0);
                
                let formulas = 4;
                if(nivel >= 7) formulas = 5; if(nivel >= 11) formulas = 6; if(nivel >= 15) formulas = 7; if(nivel >= 18) formulas = 8;
                
                recursos.infoConjuracao.push({ classe: 'BH (Mutante)', extra: `${formulas} Fórmulas Conhecidas`, tipo: 'especial' });
            }

            // Alma Profana
            if (habilidades.some(h => normalizeKey(h.title).includes("alma profana") || normalizeKey(h.title).includes("pacto"))) {
                const p = BH_ALMA_PROFANA[nivel];
                const known = BH_ALMA_KNOWN[nivel] || 0;
                
                if (p) {
                    recursos.pact.qtd += p.q;
                    if (p.n > recursos.pact.nivel) recursos.pact.nivel = p.n;
                }

                recursos.infoConjuracao.push({ classe: 'BH (Alma Profana)', conhecidas: known, tipo: 'conhecidas' });
            }
            
            recursos.infoConjuracao.push({ classe: 'Blood Hunter', maldicoes: BH_MALDICOES.conhecidas[nivel-1], tipo: 'especial' });
        }

        // BRUXO
        if (cls === 'bruxo') {
            // Lógica Pacto Padrão (simplificada)
            let q=1, n=1;
            if (nivel >= 17) { q=4; n=5; }
            else if (nivel >= 11) { q=3; n=5; }
            else if (nivel >= 9) { q=2; n=5; }
            else if (nivel >= 7) { q=2; n=4; }
            else if (nivel >= 5) { q=2; n=3; }
            else if (nivel >= 3) { q=2; n=2; }
            else if (nivel >= 2) { q=2; n=1; }
            
            recursos.pact.qtd += q;
            if (n > recursos.pact.nivel) recursos.pact.nivel = n;

            const knownArr = [2,3,4,5,6,7,8,9,10,10,11,11,12,12,13,13,14,14,15,15];
            recursos.infoConjuracao.push({ classe: 'Bruxo', conhecidas: knownArr[nivel-1], tipo: 'conhecidas' });
        }

        // OUTROS
        if (cls === 'monge' && nivel >= 2) recursos.ki += nivel;
        if (cls === 'feiticeiro' && nivel >= 2) recursos.sorcery += nivel;
        if (cls === 'barbaro') recursos.furia += (RECURSOS_EXTRAS.barbaro_furia[nivel] || 0);
        
        // Infos Padrão
        if (cls === 'bardo') {
            const d = PROGRESSAO_CLASSES.bardo;
            recursos.infoConjuracao.push({ classe: 'Bardo', truques: d.truques[nivel-1], conhecidas: d.conhecidas[nivel-1], tipo: 'conhecidas' });
        }
        if (cls === 'feiticeiro') {
            const d = PROGRESSAO_CLASSES.feiticeiro;
            recursos.infoConjuracao.push({ classe: 'Feiticeiro', truques: d.truques[nivel-1], conhecidas: d.conhecidas[nivel-1], tipo: 'conhecidas' });
        }
        if (cls === 'patrulheiro') {
            const d = PROGRESSAO_CLASSES.patrulheiro;
            recursos.infoConjuracao.push({ classe: 'Patrulheiro', conhecidas: d.conhecidas[nivel-1], tipo: 'conhecidas' });
        }
        if (cls === 'clerigo') {
            const prep = nivel + getMod('n3');
            const d = PROGRESSAO_CLASSES.clerigo;
            recursos.infoConjuracao.push({ classe: 'Clérigo', truques: d.truques[nivel-1], preparadas: Math.max(1, prep), tipo: 'preparadas' });
        }
        if (cls === 'druida') {
            const prep = nivel + getMod('n3');
            const d = PROGRESSAO_CLASSES.druida;
            recursos.infoConjuracao.push({ classe: 'Druida', truques: d.truques[nivel-1], preparadas: Math.max(1, prep), tipo: 'preparadas' });
        }
        if (cls === 'mago') {
            const prep = nivel + getMod('n5');
            const d = PROGRESSAO_CLASSES.mago;
            recursos.infoConjuracao.push({ classe: 'Mago', truques: d.truques[nivel-1], preparadas: Math.max(1, prep), tipo: 'preparadas' });
        }
        if (cls === 'paladino') {
            const prep = Math.floor(nivel/2) + getMod('n4');
            recursos.infoConjuracao.push({ classe: 'Paladino', preparadas: Math.max(1, prep), tipo: 'preparadas' });
        }
    }

    // --- Aplica Slots da Tabela Combinada ---
    if (nivelConjurador > 0) {
        const slots = TABELA_SLOTS_PADRAO[Math.min(nivelConjurador, 20)];
        if (slots) {
            for(let i=0; i<9; i++) recursos.slots[i] = slots[i];
        }
    }

    return recursos;
}