/* =============================================================
   MAGIC SYSTEM: TABELAS E REGRAS DE PROGRESSÃO (D&D 5e)
   Atualizado: Subclasses Específicas (Alma Profana, Mutante, Artífice)
============================================================= */

const normalizeKey = (str) => {
    if (!str) return "";
    return str.normalize("NFD").replace(/[\u0300-\u036f]/g, "").toLowerCase().trim();
};

// Tabela de Slots Padrão (1º ao 9º Círculo)
const TABELA_SLOTS_PADRAO = {
    1:  [2,0,0,0,0,0,0,0,0], 2:  [3,0,0,0,0,0,0,0,0], 3:  [4,2,0,0,0,0,0,0,0],
    4:  [4,3,0,0,0,0,0,0,0], 5:  [4,3,2,0,0,0,0,0,0], 6:  [4,3,3,0,0,0,0,0,0],
    7:  [4,3,3,1,0,0,0,0,0], 8:  [4,3,3,2,0,0,0,0,0], 9:  [4,3,3,3,1,0,0,0,0],
    10: [4,3,3,3,2,0,0,0,0], 11: [4,3,3,3,2,1,0,0,0], 12: [4,3,3,3,2,1,0,0,0],
    13: [4,3,3,3,2,1,1,0,0], 14: [4,3,3,3,2,1,1,0,0], 15: [4,3,3,3,2,1,1,1,0],
    16: [4,3,3,3,2,1,1,1,0], 17: [4,3,3,3,2,1,1,1,1], 18: [4,3,3,3,3,1,1,1,1],
    19: [4,3,3,3,3,2,1,1,1], 20: [4,3,3,3,3,2,2,1,1]
};

// Tipo de Conjurador para Multiclasse
const TIPO_CONJURADOR = {
    'bardo': 'full', 'clerigo': 'full', 'druida': 'full', 'feiticeiro': 'full', 'mago': 'full',
    'paladino': 'half', 'patrulheiro': 'half', 'artifice': 'half_up'
};

/* --- TABELAS ESPECÍFICAS (RECURSOS/INFO) --- */

// Blood Hunter: Maldições (Usos / Conhecidas)
const BH_MALDICOES = {
    usos: { 1:1, 2:1, 3:1, 4:1, 5:1, 6:2, 7:2, 8:2, 9:2, 10:2, 11:2, 12:2, 13:3, 14:3, 15:3, 16:3, 17:4, 18:4, 19:4, 20:4 },
    conhecidas: [1,1,1,1,1, 2,2,2,2, 3,3,3,3, 4,4,4,4, 5,5,5]
};

// Blood Hunter: Alma Profana (Pacto Específico)
const BH_ALMA_PROFANA = {
    3: {q:1, n:1}, 4: {q:1, n:1}, 5: {q:1, n:1}, 
    6: {q:2, n:1}, 7: {q:2, n:2}, 8: {q:2, n:2}, 9: {q:2, n:2}, 10: {q:2, n:2}, 11: {q:2, n:2}, 12: {q:2, n:2},
    13: {q:2, n:3}, 14: {q:2, n:3}, 15: {q:2, n:3}, 16: {q:2, n:3}, 17: {q:2, n:3}, 18: {q:2, n:3}, 
    19: {q:2, n:4}, 20: {q:2, n:4}
};
// Blood Hunter: Alma Profana (Magias Conhecidas)
const BH_ALMA_KNOWN = {
    3:2, 4:2, 5:3, 6:3, 7:4, 8:4, 9:5, 10:5, 11:6, 12:6, 13:7, 14:7, 15:8, 16:8, 17:9, 18:9, 19:10, 20:11
};

// Blood Hunter: Mutante (Mutagênicos)
const BH_MUTANTE = {
    criados: { 3:1, 4:1, 5:1, 6:1, 7:2, 8:2, 9:2, 10:2, 11:2, 12:2, 13:2, 14:2, 15:3, 16:3, 17:3, 18:3, 19:3, 20:3 },
    conhecidos: { 3:4, 7:5, 11:6, 15:7, 18:8 } // Chave é o nível onde muda
};

// Artífice: Infusões
const ARTIFICE_INFUSOES = {
    conhecidas: { 2:4, 6:6, 10:8, 14:10, 18:12 },
    itens_ativos: { 2:2, 6:3, 10:4, 14:5, 18:6 }
};

// Tabelas de Recursos Extras
const RECURSOS_EXTRAS = {
    'barbaro_furia': { 1:2, 2:2, 3:3, 4:3, 5:3, 6:4, 7:4, 8:4, 9:4, 10:4, 11:4, 12:5, 13:5, 14:5, 15:5, 16:5, 17:6, 18:6, 19:6, 20:99 },
    'bruxo_pacto': { 
        1: {q:1,n:1}, 2: {q:2,n:1}, 3: {q:2,n:2}, 4: {q:2,n:2}, 5: {q:2,n:3}, 
        6: {q:2,n:3}, 7: {q:2,n:4}, 8: {q:2,n:4}, 9: {q:2,n:5}, 10: {q:2,n:5},
        11: {q:3,n:5}, 17: {q:4,n:5}
    }
};

// Função Principal
function calcularRecursosTotais(niveisClasses, habilidades, atributos) {
    const recursos = {
        slots: [0, 0, 0, 0, 0, 0, 0, 0, 0],
        pact: { qtd: 0, nivel: 0 },
        ki: 0, 
        furia: 0, 
        sorcery: 0, 
        mutagen: 0,       // BH Mutante (Ativos)
        infusions: 0,     // Artífice (Itens Ativos)
        blood_curse: 0, 
        infoConjuracao: [] 
    };

    let nivelConjurador = 0;
    const getMod = (n) => Math.floor(((parseInt(atributos?.[n] || 10)) - 10) / 2);

    for (const [classeOriginal, nivel] of Object.entries(niveisClasses)) {
        if (nivel <= 0) continue;
        const cls = normalizeKey(classeOriginal);
        
        // --- 1. SOMA DE NÍVEIS PARA SLOTS PADRÃO ---
        if (TIPO_CONJURADOR[cls]) {
            const tipo = TIPO_CONJURADOR[cls];
            if (tipo === 'full') nivelConjurador += nivel;
            else if (tipo === 'half') nivelConjurador += Math.floor(nivel / 2);
            else if (tipo === 'half_up') nivelConjurador += Math.ceil(nivel / 2);
        }

        // --- 2. SUBCLASSES DE 1/3 CONJURADOR (Guerreiro/Ladino) ---
        if (cls === 'guerreiro' || cls === 'ladino') {
            // Verifica se tem a habilidade "Lançamento de Feitiços" da classe
            const temMagia = habilidades.some(h => h.active && normalizeKey(h.title).includes("lancamento de feiticos") && normalizeKey(h.class).includes(cls));
            
            // Verifica Subclasse Específica pelo nome na habilidade
            const isCavaleiro = cls === 'guerreiro' && temMagia;
            const isTrapaceiro = cls === 'ladino' && temMagia;

            if (isCavaleiro || isTrapaceiro) {
                nivelConjurador += Math.floor(nivel / 3);
                
                // Info Conjuracao (Tabelas simplificadas para exemplo)
                const truques = (nivel >= 10) ? 3 : (nivel >= 3 ? 2 : 0);
                // Tabela de conhecidas genérica 1/3 (Cavaleiro/Trapaceiro)
                const knownArr = [0,0,3,4,4,4,5,6,6,7,8,8,9,10,10,11,11,11,12,13];
                const known = knownArr[nivel-1] || 0;

                recursos.infoConjuracao.push({
                    classe: cls === 'guerreiro' ? 'Cavaleiro Arcano' : 'Trapaceiro Arcano',
                    truques: truques,
                    conhecidas: known,
                    tipo: 'conhecidas'
                });
            }
        }

        // --- 3. RECURSOS ESPECÍFICOS ---

        // ARTÍFICE (Infusões e Itens)
        if (cls === 'artifice') {
            // Itens Infundidos (Slots) - Pega o valor mais alto da tabela até o nível atual
            let itensAtivos = 0;
            let infusoesConhecidas = 0;
            
            for(let l=2; l<=20; l++) {
                if (nivel >= l) {
                    if (ARTIFICE_INFUSOES.itens_ativos[l]) itensAtivos = ARTIFICE_INFUSOES.itens_ativos[l];
                    if (ARTIFICE_INFUSOES.conhecidas[l]) infusoesConhecidas = ARTIFICE_INFUSOES.conhecidas[l];
                }
            }
            recursos.infusions = itensAtivos;

            const prep = Math.floor(nivel/2) + getMod('n5'); // INT
            recursos.infoConjuracao.push({ 
                classe: 'Artífice', 
                preparadas: Math.max(1, prep), 
                tipo: 'preparadas',
                extra: `${infusoesConhecidas} Infusões Conhecidas`
            });
        }

        // BLOOD HUNTER
        if (cls === 'blood hunter' || cls === 'cacador de sangue') {
            recursos.blood_curse = BH_MALDICOES.usos[nivel] || 0;
            
            // Subclasse: Ordem do Mutante
            const isMutante = habilidades.some(h => normalizeKey(h.title).includes("mutagen"));
            if (isMutante) {
                recursos.mutagen = BH_MUTANTE.criados[nivel] || 0;
                
                // Calcula Fórmulas Conhecidas
                let formulas = 4; // Base nível 3
                if (nivel >= 7) formulas = 5;
                if (nivel >= 11) formulas = 6;
                if (nivel >= 15) formulas = 7;
                if (nivel >= 18) formulas = 8;
                
                recursos.infoConjuracao.push({
                    classe: 'BH (Mutante)',
                    extra: `${formulas} Fórmulas Conhecidas`,
                    tipo: 'especial'
                });
            }

            // Subclasse: Alma Profana (Pacto Diferenciado)
            // Se tiver a habilidade "Magia do Pacto" ou "Pacto" relacionada a BH
            const isProfane = habilidades.some(h => normalizeKey(h.title).includes("alma profana") || (normalizeKey(h.title).includes("pacto") && h.class.includes("Blood")));
            if (isProfane && level >= 3) {
                const p = BH_ALMA_PROFANA[nivel];
                const known = BH_ALMA_KNOWN[nivel];
                
                // Adiciona slots de pacto (Se já tiver de Bruxo, usa o maior ou soma? Regra D&D 5e: Soma se for Spellcasting, Pacto é separado mas aqui vamos usar o melhor dos dois para simplificar a UI)
                if (p) {
                    if (p.q > recursos.pact.qtd) {
                        recursos.pact.qtd = p.q;
                        recursos.pact.nivel = p.n;
                    }
                }
                
                recursos.infoConjuracao.push({
                    classe: 'BH (Alma Profana)',
                    conhecidas: known,
                    tipo: 'conhecidas'
                });
            }
            
            // Info base de Maldições
            recursos.infoConjuracao.push({ 
                classe: 'Blood Hunter', 
                maldicoes: BH_MALDICOES.conhecidas[nivel-1], 
                tipo: 'especial' 
            });
        }

        // BRUXO (Pacto Padrão)
        if (cls === 'bruxo') {
            // Lógica simplificada de pegar da tabela
            let qtd = 1, lvl = 1;
            // (Itera tabela RECURSOS_EXTRAS.bruxo_pacto para achar o correto)
            // ... simplificando:
            if (nivel >= 17) { qtd=4; lvl=5; }
            else if (nivel >= 11) { qtd=3; lvl=5; }
            else if (nivel >= 9) { qtd=2; lvl=5; }
            else if (nivel >= 7) { qtd=2; lvl=4; }
            else if (nivel >= 5) { qtd=2; lvl=3; }
            else if (nivel >= 3) { qtd=2; lvl=2; }
            else if (nivel >= 2) { qtd=2; lvl=1; }
            
            // Atualiza se for maior que o atual (do BH por exemplo)
            if (qtd > recursos.pact.qtd) {
                recursos.pact.qtd = qtd;
                recursos.pact.nivel = lvl;
            } else if (qtd === recursos.pact.qtd && lvl > recursos.pact.nivel) {
                recursos.pact.nivel = lvl;
            }

            // Info Conhecidas
            const knownArr = [2,3,4,5,6,7,8,9,10,10,11,11,12,12,13,13,14,14,15,15];
            recursos.infoConjuracao.push({ classe: 'Bruxo', conhecidas: knownArr[nivel-1], tipo: 'conhecidas' });
        }

        // OUTROS
        if (cls === 'monge' && nivel >= 2) recursos.ki = nivel;
        if (cls === 'feiticeiro' && nivel >= 2) recursos.sorcery = nivel;
        if (cls === 'barbaro') recursos.furia = RECURSOS_EXTRAS.barbaro_furia[nivel] || 0;

        // Infos Padrão
        if (cls === 'bardo') recursos.infoConjuracao.push({ classe: 'Bardo', conhecidas: [4,5,6,7,8,9,10,11,12,14,15,15,16,18,19,19,20,22,22,22][nivel-1], tipo: 'conhecidas' });
        if (cls === 'feiticeiro') recursos.infoConjuracao.push({ classe: 'Feiticeiro', conhecidas: [2,3,4,5,6,7,8,9,10,11,12,12,13,13,14,14,15,15,15,15][nivel-1], tipo: 'conhecidas' });
        if (cls === 'patrulheiro') recursos.infoConjuracao.push({ classe: 'Patrulheiro', conhecidas: [0,2,3,3,4,4,5,5,6,6,7,7,8,8,9,9,10,10,11,11][nivel-1], tipo: 'conhecidas' });
        if (cls === 'clerigo') recursos.infoConjuracao.push({ classe: 'Clérigo', preparadas: Math.max(1, nivel + getMod('n3')), tipo: 'preparadas' });
        if (cls === 'druida') recursos.infoConjuracao.push({ classe: 'Druida', preparadas: Math.max(1, nivel + getMod('n3')), tipo: 'preparadas' });
        if (cls === 'mago') recursos.infoConjuracao.push({ classe: 'Mago', preparadas: Math.max(1, nivel + getMod('n5')), tipo: 'preparadas' });
        if (cls === 'paladino') recursos.infoConjuracao.push({ classe: 'Paladino', preparadas: Math.max(1, Math.floor(nivel/2) + getMod('n4')), tipo: 'preparadas' });
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