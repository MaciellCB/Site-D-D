







    /* =================================================================
       LÓGICA DO MODO MOBILE
       ================================================================= */
    function setMobileView(view) {
      document.body.setAttribute('data-mobile-view', view);
      document.querySelectorAll('.mobile-nav-btn').forEach(btn => {
        btn.classList.remove('active');
        const onclick = btn.getAttribute('onclick') || '';
        if (onclick.includes(view)) {
          btn.classList.add('active');
        }
      });
      window.scrollTo(0, 0);
    }

    function restaurarLayoutDesktop() {
      document.body.removeAttribute('data-mobile-view');
      document.querySelectorAll('.mobile-nav-btn').forEach(btn => btn.classList.remove('active'));
      const btnPerfil = document.querySelector('.mobile-nav-btn[onclick*="setMobileView(\'header\')"]');
      if (btnPerfil) btnPerfil.classList.add('active');
    }

    const mobileQuery = window.matchMedia('(max-width: 768px) and (pointer: coarse)');

    function sincronizarLayoutMobile() {
      if (!mobileQuery.matches) {
        restaurarLayoutDesktop();
        return;
      }

      const viewAtual = document.body.getAttribute('data-mobile-view') || 'status';
      setMobileView(viewAtual);
    }

    if (mobileQuery.matches) {
      setMobileView('status');
    } else {
      restaurarLayoutDesktop();
    }

    if (typeof mobileQuery.addEventListener === 'function') {
      mobileQuery.addEventListener('change', sincronizarLayoutMobile);
    } else if (typeof mobileQuery.addListener === 'function') {
      mobileQuery.addListener(sincronizarLayoutMobile);
    }

    /* =================================================================
       LÓGICA DO SOCKET.IO (SINCRONIZAÇÃO EM TEMPO REAL)
       ================================================================= */
    const socket = io('https://dandd-chan.onrender.com');

    socket.on('connect', () => {
      console.log("Conectado ao servidor de atualizações! ID:", socket.id);
    });

    socket.on('ficha_atualizada', (novaFicha) => {
      // Verifica se a ficha é a mesma que está aberta
      if (state && state.nome && novaFicha.nome && novaFicha.nome.toLowerCase() === state.nome.toLowerCase()) {
        console.log("Recebi atualização externa para: " + novaFicha.nome);

        // 1. Chama a função de mesclagem que criamos no DireitaJS
        // Se a função existir (carregada), usa ela. Se não, usa o dado bruto.
        let estadoFinal = novaFicha;

        if (typeof window.mesclarEstadoVisual === 'function') {
          estadoFinal = window.mesclarEstadoVisual(state, novaFicha);
        }

        // 2. Atualiza o estado com os dados mesclados (Preservando abertas/fechadas)
        Object.assign(state, estadoFinal);

        // 3. Atualiza a tela
        if (typeof preencherFichaNaTela === 'function') preencherFichaNaTela(state);
        if (typeof atualizarHeader === 'function') atualizarHeader();
        if (typeof atualizarTextoClassesHeader === 'function') atualizarTextoClassesHeader();
        if (typeof inicializarDadosEsquerda === 'function') inicializarDadosEsquerda();
        if (typeof atualizarTudoVisual === 'function') atualizarTudoVisual();

        // Dispara evento para redesenhar a Direita
        window.dispatchEvent(new CustomEvent('sheet-updated'));
      }
    });

    /* =================================================================
       LÓGICA DO MESTRE & PREENCHIMENTO DE DADOS
       ================================================================= */
    function resetSheetState() {
      if (typeof window.state !== 'undefined') {
        try {
          window.state = {
            nome: '',
            senha: '',
            activeTab: 'Combate',
            spellDCConfig: { selectedAttr: '', extraMod: 0, lastKnownLevel: 0 },
            dtMagias: 'Selecione',
            inventory: [],
            abilities: [],
            description: { anotacoes: '', aparencia: '', personalidade: '', objetivo: '', ideais: '', vinculos: '', fraquezas: '', historia: '' }
          };
        } catch (e) {}
      }
      if (typeof state !== 'undefined') {
        state = {
          nome: '',
          senha: '',
          activeTab: 'Combate',
          spellDCConfig: { selectedAttr: '', extraMod: 0, lastKnownLevel: 0 },
          dtMagias: 'Selecione',
          inventory: [],
          abilities: [],
          description: { anotacoes: '', aparencia: '', personalidade: '', objetivo: '', ideais: '', vinculos: '', fraquezas: '', historia: '' }
        };
      }

      const camposVisuais = [
        'input-personagem', 'input-jogador', 'input-raca', 'btn-antecedente',
        'nome-personagem-overlay', 'img-personagem-visual', 'input-foto-upload'
      ];
      camposVisuais.forEach(id => {
        const el = document.getElementById(id);
        if (!el) return;
        if (el.tagName === 'INPUT') el.value = '';
        else if (el.tagName === 'IMG') el.src = 'img/imagem-no-site/personagem.png';
        else el.textContent = '';
      });

      const personagemImg = document.getElementById('img-personagem-visual');
      if (personagemImg) personagemImg.src = 'img/imagem-no-site/personagem.png';

      const conteudo = document.querySelector('.lado-direito .conteudo');
      if (conteudo) conteudo.innerHTML = '<p>Carregando...</p>';

      if (typeof atualizarHeader === 'function') atualizarHeader();
      if (typeof inicializarDadosEsquerda === 'function') inicializarDadosEsquerda();
      if (typeof preencherFichaNaTela === 'function') preencherFichaNaTela(state || {});
      window.dispatchEvent(new CustomEvent('sheet-updated'));
    }

    window.addEventListener('DOMContentLoaded', async () => {
      const overlay = document.getElementById('login-overlay');
      if (overlay) overlay.style.display = 'none';

      const API_BASE = 'https://dandd-chan.onrender.com/api';
      const token = localStorage.getItem('authToken');
      const url = new URL(window.location.href);
      const masterView = url.searchParams.get('masterView');

      if (token && masterView) {
        try {
          const res = await fetchWithAuth(`${API_BASE}/load-ficha-mestre`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ nome: masterView })
          });
          if (res.ok) {
            const data = await res.json();
            if (typeof state !== 'undefined') {
              Object.assign(state, data);
              document.getElementById('login-overlay').style.display = 'none';
              const mainSheet = document.querySelector('main');
              if (mainSheet) mainSheet.style.display = 'flex';
              if (typeof setActiveTab === 'function') setActiveTab(state.activeTab || 'Combate');
              if (typeof preencherFichaNaTela === 'function') preencherFichaNaTela(data);
              if (typeof atualizarHeader === 'function') atualizarHeader();
              if (typeof inicializarDadosEsquerda === 'function') inicializarDadosEsquerda();
              window.dispatchEvent(new CustomEvent('sheet-updated'));
              return;
            }
          }
        } catch (e) {
          if (e && e.message === 'AUTH_EXPIRED') return;
          console.warn('Master view failed', e);
        }
      }

      if (!token) {
        resetSheetState();
        showLoginOverlay();
        return;
      }

      try {
        const meRes = await fetchWithAuth(`${API_BASE}/accounts/me`);
        if (meRes.ok) {
          const acc = await meRes.json();
          window.currentAccount = acc;
          resetSheetState();
          if (acc.isMaster) {
            window.location.href = 'mestre.html';
            return;
          }
          showAccountCharacters(acc);
          return;
        }
      } catch (e) {
        if (e && e.message === 'AUTH_EXPIRED') return;
        console.warn('Auto-login failed', e);
      }

      resetSheetState();
      showLoginOverlay();
    });

    async function carregarFichaMestre(nome) {
      try {
        const res = await fetch('https://dandd-chan.onrender.com/api/load-ficha-mestre', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ nome: nome })
        });

        if (res.ok) {
          const ficha = await res.json();
          if (typeof state !== 'undefined') {
            Object.assign(state, ficha);
            preencherFichaNaTela(ficha);
            if (typeof inicializarDadosEsquerda === 'function') inicializarDadosEsquerda();
            if (typeof atualizarTudoVisual === 'function') atualizarTudoVisual();
            if (typeof atualizarHeader === 'function') atualizarHeader();
            window.dispatchEvent(new CustomEvent('sheet-updated'));
            if (typeof setActiveTab === 'function') setActiveTab(state.activeTab || 'Combate');
            exibirAvisoTemporario("Mestre: Visualizando " + ficha.nome);
          }
        } else {
          exibirAvisoTemporario("Erro: Personagem não encontrado.");
        }
      } catch (e) {
        console.error(e);
        exibirAvisoTemporario("Erro de conexão com o servidor.");
      }
    }

    function preencherFichaNaTela(data) {
      // ALTERADO: Agora preenche o input com 'personagem' e só usa 'nome' se o outro estiver vazio
      setVal('input-personagem', data.personagem || data.nome);
      setVal('input-jogador', data.jogador);
      setVal('input-raca', data.raca);
      setTxt('btn-antecedente', data.antecedente);

      // Atualiza o HUD do OBS se estiver aberto (Nome Visual)
      const overlayNome = document.getElementById('nome-personagem-overlay');
      if (overlayNome) overlayNome.textContent = data.personagem || data.nome;

      const imgElement = document.getElementById('img-personagem-visual');
      if (imgElement) {
        imgElement.src = (data.fotoPerfil && data.fotoPerfil.length > 10) ? data.fotoPerfil : "img/imagem-no-site/personagem.png";
      }

      if (data.atributos) {
        setTxtQ('.num.n1', data.atributos.n1);
        setTxtQ('.num.n2', data.atributos.n2);
        setTxtQ('.num.n3', data.atributos.n3);
        setTxtQ('.num.n4', data.atributos.n4);
        setTxtQ('.num.n5', data.atributos.n5);
        setTxtQ('.num.n6', data.atributos.n6);
      }
    }

    function setVal(id, valor) { const el = document.getElementById(id); if (el) el.value = valor !== undefined ? valor : ''; }
    function setTxt(id, valor) { const el = document.getElementById(id); if (el) el.innerText = valor !== undefined ? valor : ''; }
    function setTxtQ(selector, valor) { const el = document.querySelector(selector); if (el) el.innerText = valor !== undefined ? valor : ''; }

    /* =================================================================
       SISTEMA DE LOGIN / TOASTS / ALERTAS
       ================================================================= */
    function exibirAvisoTemporario(mensagem) {
      const existente = document.querySelector('.custom-toast-warning');
      if (existente) existente.remove();

      const toast = document.createElement('div');
      toast.className = 'custom-toast-warning';

      const progress = document.createElement('div');
      progress.className = 'toast-progress';

      const content = document.createElement('div');
      content.className = 'toast-content';

      const textoFormatado = mensagem.split('\n').join('<br>');
      content.innerHTML = '<strong style="color:#e0aaff; display:block; margin-bottom:4px; font-size:11px; letter-spacing:1px;">SISTEMA</strong>' + textoFormatado;

      toast.appendChild(progress);
      toast.appendChild(content);
      document.body.appendChild(toast);

      setTimeout(() => { progress.style.width = '0%'; }, 50);
      setTimeout(() => {
        if (toast.parentElement) {
          toast.style.animation = 'toastFadeOut 0.5s ease-out forwards';
          setTimeout(() => toast.remove(), 450);
        }
      }, 5000);
    }

    window.alert = function (msg) { exibirAvisoTemporario(msg); };

    function showLoginOverlay() {
      const overlay = document.getElementById('login-overlay');
      if (overlay) overlay.style.display = 'flex';
      const mainSheet = document.querySelector('main');
      if (mainSheet) mainSheet.style.display = 'none';
    }

    function hideLoginOverlay() {
      const overlay = document.getElementById('login-overlay');
      if (overlay) overlay.style.display = 'none';
      const mainSheet = document.querySelector('main');
      if (mainSheet) mainSheet.style.display = 'flex';
    }

    let sessionExpiredBanner = null;

    function triggerSessionExpired(motivo = 'Sua sessão expirou ou foi encerrada.') {
      if (sessionExpiredBanner) return;
      const currentToken = localStorage.getItem('authToken');
      if (!currentToken) {
        document.getElementById('login-overlay')?.style && (document.getElementById('login-overlay').style.display = 'flex');
        return;
      }
      localStorage.removeItem('authToken');
      window.currentAccount = null;
      const div = document.createElement('div');
      div.className = 'custom-toast-warning';
      div.style.background = '#8e1d1d';
      div.style.border = '1px solid #ff8d8d';
      div.innerHTML = '<strong style="color:#e0aaff; display:block; margin-bottom:4px; font-size:11px; letter-spacing:1px;">SISTEMA</strong>' + (motivo + ' Faça login novamente.');
      document.body.appendChild(div);
      sessionExpiredBanner = div;
      setTimeout(() => {
        if (div.parentNode) div.remove();
        sessionExpiredBanner = null;
      }, 5000);
      setTimeout(() => {
        const loginOverlay = document.getElementById('login-overlay');
        if (loginOverlay) loginOverlay.style.display = 'flex';
        if (window.location.href.indexOf('?masterView=') !== -1) window.location.href = 'index.html';
      }, 500);
    }

    async function fetchWithAuth(url, options = {}) {
      const token = localStorage.getItem('authToken');
      const headers = { ...(options.headers || {}) };
      if (token) headers.Authorization = 'Bearer ' + token;
      const response = await fetch(url, { ...options, headers });
      if (response.status === 401 || response.status === 403) {
        triggerSessionExpired('Sua sessão expirou ou foi encerrada em outra aba.');
        throw new Error('AUTH_EXPIRED');
      }
      return response;
    }

    window.addEventListener('storage', (event) => {
      if (event.key === 'authToken' && !localStorage.getItem('authToken')) {
        window.currentAccount = null;
        const loginOverlay = document.getElementById('login-overlay');
        if (loginOverlay) loginOverlay.style.display = 'flex';
        exibirAvisoTemporario('Sessão alterada em outra aba. Faça login novamente.');
      }
    });

    async function tentarLogin() {
      const nome = document.getElementById('login-nome').value;
      const senha = document.getElementById('login-senha').value;
      const API_BASE = 'https://dandd-chan.onrender.com/api';

      if (!nome || !senha) { exibirAvisoTemporario('Preencha todos os campos!'); return; }
      const masterWindow = window.open('', '_blank');
      try {
        const res = await fetch(`${API_BASE}/accounts/login`, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ username: nome, password: senha }) });
        if (!res.ok) {
          if (masterWindow) masterWindow.close();
          const err = await res.json().catch(() => ({}));
          exibirAvisoTemporario(err.error === 'Invalid' ? 'Credenciais inválidas.' : 'Erro ao autenticar.');
          return;
        }
        const data = await res.json();
        localStorage.setItem('authToken', data.token);
        const me = await fetchWithAuth(`${API_BASE}/accounts/me`);
        if (!me.ok) {
          if (masterWindow) masterWindow.close();
          exibirAvisoTemporario('Erro ao carregar a conta.');
          return;
        }
        const acc = await me.json();
        window.currentAccount = acc;
        resetSheetState();
        if (acc.isMaster) {
          if (masterWindow) {
            masterWindow.location = 'mestre.html';
          } else {
            window.location.href = 'mestre.html';
          }
          document.getElementById('login-nome').value = '';
          document.getElementById('login-senha').value = '';
          exibirAvisoTemporario('Painel do Mestre aberto.');
          return;
        }
        if (masterWindow) masterWindow.close();
        showAccountCharacters(acc);
        return;
      } catch (e) {
        if (masterWindow) masterWindow.close();
        exibirAvisoTemporario('Erro de conexão ao autenticar.');
        return;
      }

      // Fallback: legacy character login by name/password
      if (typeof carregarDadosIniciais === 'function') {
        carregarDadosIniciais(nome, senha);
      } else {
        exibirAvisoTemporario('Erro: Não foi possível autenticar.');
      }
    }

    function abrirRegistro() {
      exibirAvisoTemporario('Registro desativado aqui. Use Gerenciar Contas (botão Contas) para criar novas contas.');
    }

    function fecharRegistro() {
      document.getElementById('account-forms').style.display = 'block';
    }

    async function registrarConta() {
      const usrEl = document.getElementById('reg-username');
      const pwdEl = document.getElementById('reg-password');
      if (!usrEl || !pwdEl) { exibirAvisoTemporario('Registro desativado aqui. Use Gerenciar Contas.'); return; }
      const username = usrEl.value;
      const password = pwdEl.value;
      const API_BASE = 'https://dandd-chan.onrender.com/api';
      if (!username || !password) { exibirAvisoTemporario('Preencha usuário e senha.'); return; }
      try {
        const res = await fetch(`${API_BASE}/accounts/register`, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ username, password }) });
        if (res.ok) {
          if (usrEl) usrEl.value = '';
          if (pwdEl) pwdEl.value = '';

          const currentToken = localStorage.getItem('authToken');
          if (currentToken && window.currentAccount) {
            exibirAvisoTemporario('Conta criada com sucesso. Você continua na conta atual. Faça login manualmente para entrar nela.');
            return;
          }

          exibirAvisoTemporario('Conta criada com sucesso. Faça login para entrar nela.');
          showLoginOverlay();
          return;
        }

        const err = await res.json().catch(() => ({}));
        exibirAvisoTemporario(err.error || 'Erro ao criar conta.');
      } catch (e) { exibirAvisoTemporario('Erro de conexão ao criar conta.'); }
    }

    function showAccountCharacters(acc) {
      if (acc && acc.isMaster) {
        window.location.href = 'mestre.html';
        return;
      }

      const loginBox = document.getElementById('login-box');
      if (loginBox) {
        loginBox.style.width = '760px';
        loginBox.style.maxWidth = '92vw';
      }

      document.getElementById('account-forms').style.display = 'none';
      document.getElementById('account-characters').style.display = 'block';
      showLoginOverlay();
      const list = document.getElementById('chars-list');
      list.innerHTML = '';
      const chars = acc.characters || [];
      list.innerHTML = '';
      const grid = document.createElement('div');
      grid.className = 'account-grid';
      grid.style.display = 'grid';
      grid.style.gridTemplateColumns = 'repeat(auto-fit, minmax(180px, 1fr))';
      grid.style.gap = '10px';
      grid.style.width = '100%';
      if (chars.length === 0) {
        const el = document.createElement('div'); el.style.color = '#aaa'; el.textContent = 'Nenhuma ficha. Crie uma nova abaixo.'; list.appendChild(el);
      }
      chars.forEach(async (n) => {
        const card = document.createElement('div'); card.className = 'account-card';
        const img = document.createElement('img');
        img.src = 'img/imagem-no-site/personagem.png';
        img.alt = n;
        img.style.objectFit = 'cover';
        img.style.width = '100%';
        img.style.height = '90px';
        const h = document.createElement('h4'); h.textContent = n;
        const desc = document.createElement('div'); desc.style = 'font-size:12px; color:#bbb; min-height:32px;'; desc.textContent = 'Abra para editar ou jogar.';
        const actions = document.createElement('div'); actions.className = 'card-actions';
        const openBtn = document.createElement('button'); openBtn.className = 'btn-open'; openBtn.textContent = 'Abrir ficha'; openBtn.onclick = () => selectCharacter(n);
        actions.appendChild(openBtn);
        card.appendChild(img); card.appendChild(h); card.appendChild(desc); card.appendChild(actions);
        grid.appendChild(card);

        try {
          const fichaRes = await fetchWithAuth(`${API_BASE}/load-ficha-account`, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ nome: n }) });
          if (fichaRes.ok) {
            const ficha = await fichaRes.json();
            if (ficha && ficha.fotoPerfil && ficha.fotoPerfil.length > 20) {
              img.src = ficha.fotoPerfil;
            }
          }
        } catch (e) {
          // ignorar avatar faltante; mantém o padrão
        }
      });
      list.appendChild(grid);
      // Apply preferences if any
      const prefs = (acc && acc.preferences) ? acc.preferences : {};
      if (prefs.lastActiveTab && typeof setActiveTab === 'function') setActiveTab(prefs.lastActiveTab);
      // Setup preferences sync (wraps setActiveTab to persist changes)
      setupPreferencesSync();
    }

    function setupPreferencesSync() {
      if (!window.currentAccount) return;
      const token = localStorage.getItem('authToken');
      if (!token) return;
      // Wrap setActiveTab to save preference
      if (typeof window.setActiveTab === 'function' && !window.setActiveTab._wrappedForPrefs) {
        const orig = window.setActiveTab;
        window.setActiveTab = function (tabName) {
          orig(tabName);
          savePreferences({ lastActiveTab: tabName });
        };
        window.setActiveTab._wrappedForPrefs = true;
      }
    }

    async function savePreferences(obj) {
      const token = localStorage.getItem('authToken');
      if (!token || !window.currentAccount) return;
      const API_BASE = 'https://dandd-chan.onrender.com/api';
      const merged = Object.assign({}, window.currentAccount.preferences || {}, obj || {});
      try {
        const res = await fetchWithAuth(`${API_BASE}/accounts/preferences`, { method: 'PUT', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ preferences: merged }) });
        if (res.ok) {
          window.currentAccount.preferences = merged;
        }
      } catch (e) {
        if (e && e.message === 'AUTH_EXPIRED') return;
        console.warn('Erro ao salvar preferências', e);
      }
    }

    function abrirCriarFichaModal() {
      document.getElementById('novo-nome-ficha').value = '';
      document.getElementById('criar-ficha-modal').style.display = 'flex';
      document.getElementById('novo-nome-ficha').focus();
    }

    function fecharCriarFichaModal() {
      document.getElementById('criar-ficha-modal').style.display = 'none';
    }

    async function criarPersonagemPrompt() {
      abrirCriarFichaModal();
    }

    async function criarPersonagemConfirm() {
      const nome = document.getElementById('novo-nome-ficha').value.trim();
      if (!nome) return exibirAvisoTemporario('Digite o nome da ficha.');
      await criarPersonagem(nome);
      fecharCriarFichaModal();
    }

    const FICHA_BASE_PADRAO = {
      fotoPerfil: '',
      activeTab: 'Combate',
      atributos: { n1: 10, n2: 10, n3: 10, n4: 10, n5: 10, n6: 10 },
      pericias: {
        Acrobacia: 0, Arcanismo: 0, Atletismo: 0, Atuação: 0, Furtividade: 0, História: 0,
        Intimidação: 0, Intuição: 0, Investigação: 0, Medicina: 0, Natureza: 0,
        Percepção: 0, Performance: 0, Persuasão: 0, Religião: 0, Sobrevivência: 0,
        LidarComAnimais: 0, Ladinagem: 0
      },
      niveisClasses: {},
      xp: '0',
      marco: 0,
      vidaAtual: 1,
      vidaTotalCalculada: 1,
      inventory: [],
      abilities: [],
      spells: [],
      description: { anotacoes: '', aparencia: '', personalidade: '', objetivo: '', ideais: '', vinculos: '', fraquezas: '', historia: '' },
      spellSlots: {
        '1': { used: 0, status: [] }, '2': { used: 0, status: [] },
        '3': { used: 0, status: [] }, '4': { used: 0, status: [] },
        '5': { used: 0, status: [] }, '6': { used: 0, status: [] },
        '7': { used: 0, status: [] }, '8': { used: 0, status: [] },
        '9': { used: 0, status: [] }, pact: { used: 0, status: [] },
        ki: { used: 0, status: [] }, furia: { used: 0, status: [] },
        sorcery: { used: 0, status: [] }, mutagen: { used: 0, status: [] }
      }
    };

    async function criarPersonagem(nome) {
      const API_BASE = 'https://dandd-chan.onrender.com/api';
      const token = localStorage.getItem('authToken');
      if (!token || !window.currentAccount) { exibirAvisoTemporario('Conta não autenticada.'); return; }
      const payload = {
        nome,
        senha: '',
        accountUsername: window.currentAccount.username,
        ...FICHA_BASE_PADRAO
      };
      try {
        const res = await fetchWithAuth(`${API_BASE}/criar-ficha`, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(payload) });
        if (res.ok) {
          const me = await fetchWithAuth(`${API_BASE}/accounts/me`);
          if (me.ok) {
            const acc = await me.json(); window.currentAccount = acc; showAccountCharacters(acc);
            exibirAvisoTemporario('Ficha criada. Selecione-a para abrir.');
          }
        } else {
          const err = await res.json().catch(() => ({}));
          exibirAvisoTemporario(err.error || 'Erro ao criar personagem.');
        }
      } catch (e) {
        if (e && e.message === 'AUTH_EXPIRED') return;
        exibirAvisoTemporario('Erro de conexão ao criar personagem.');
      }
    }

    async function selectCharacter(nome) {
      const API_BASE = 'https://dandd-chan.onrender.com/api';
      const token = localStorage.getItem('authToken');
      if (!token) { exibirAvisoTemporario('Conta não autenticada.'); return; }
      try {
        const res = await fetchWithAuth(`${API_BASE}/load-ficha-account`, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ nome }) });
        if (res.ok) {
          const data = await res.json();
          if (typeof state !== 'undefined') {
            Object.assign(state, data);
            const mainSheet = document.querySelector('main');
            if (mainSheet) mainSheet.style.display = 'flex';
            document.getElementById('login-overlay').style.display = 'none';
            if (typeof setActiveTab === 'function') setActiveTab(state.activeTab || 'Combate');
            if (typeof preencherFichaNaTela === 'function') preencherFichaNaTela(data);
            if (typeof atualizarHeader === 'function') atualizarHeader();
            if (typeof inicializarDadosEsquerda === 'function') inicializarDadosEsquerda();
            window.dispatchEvent(new CustomEvent('sheet-updated'));
            exibirAvisoTemporario('Personagem carregado: ' + nome);
          }
        } else {
          exibirAvisoTemporario('Erro ao carregar personagem.');
        }
      } catch (e) {
        if (e && e.message === 'AUTH_EXPIRED') return;
        exibirAvisoTemporario('Erro de conexão ao carregar personagem.');
      }
    }

    // Support masterView URL param when authToken is present
    (function checkMasterView() {
      const url = new URL(window.location.href);
      const mv = url.searchParams.get('masterView');
      const token = localStorage.getItem('authToken');
      if (mv && token) {
        // masterView must open a ficha directly using master token, not account ficha flow
        (async () => {
          try {
            const res = await fetchWithAuth('https://dandd-chan.onrender.com/api/load-ficha-mestre', {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({ nome: mv })
            });
            if (res.ok) {
              const data = await res.json();
              if (typeof state !== 'undefined') {
                Object.assign(state, data);
                document.getElementById('login-overlay').style.display = 'none';
                if (typeof setActiveTab === 'function') setActiveTab(state.activeTab || 'Combate');
                window.dispatchEvent(new CustomEvent('sheet-updated'));
                if (typeof atualizarHeader === 'function') atualizarHeader();
                if (typeof inicializarDadosEsquerda === 'function') inicializarDadosEsquerda();
                exibirAvisoTemporario('Mestre: ficha carregada: ' + mv);
                return;
              }
            } else {
              const err = await res.json().catch(() => ({}));
              exibirAvisoTemporario('Erro ao carregar ficha do mestre: ' + (err.error || res.statusText));
            }
          } catch (e) {
            if (e && e.message === 'AUTH_EXPIRED') return;
            exibirAvisoTemporario('Erro de conexão ao carregar ficha do mestre.');
          }
        })();
      }
    })();

    function logoutAccount() {
      localStorage.removeItem('authToken');
      window.currentAccount = null;
      resetSheetState();
      const chars = document.getElementById('chars-list');
      if (chars) chars.innerHTML = '';
      const lista = document.getElementById('account-characters');
      if (lista) lista.style.display = 'none';
      const forms = document.getElementById('account-forms');
      if (forms) forms.style.display = 'block';
      const loginInput = document.getElementById('login-nome');
      const senhaInput = document.getElementById('login-senha');
      if (loginInput) loginInput.value = '';
      if (senhaInput) senhaInput.value = '';
      const loginOverlay = document.getElementById('login-overlay');
      if (loginOverlay) loginOverlay.style.display = 'flex';
      const mainSheet = document.querySelector('main');
      if (mainSheet) mainSheet.style.display = 'none';
      if (window.location.href.indexOf('?masterView=') !== -1) {
        window.location.href = 'index.html';
      }
      if (window.location.href.indexOf('mestre.html') !== -1) {
        window.location.href = 'index.html';
      }
      const url = new URL(window.location.href);
      url.searchParams.delete('masterView');
      window.history.replaceState({}, '', url);
    }

  /* =================================================================
    LÓGICA DE RECORTE (CROP) E PROMPT DE IMAGEM
    ================================================================= */
    const modalCrop = document.getElementById('modal-crop-overlay');
    const imgParaCrop = document.getElementById('imagem-para-crop');
    const btnConfirmarCrop = document.getElementById('btn-confirmar-crop');
    const btnCancelarCrop = document.getElementById('btn-cancelar-crop');
    const imgVisual = document.getElementById('img-personagem-visual');

    let cropper = null;
    let callbackCorteFinal = null; // Guarda para onde a imagem deve ir

    function iniciarCorteImagem(src, callback) {
        imgParaCrop.src = src;
        modalCrop.style.display = 'flex';
        callbackCorteFinal = callback;

        if (cropper) cropper.destroy();

        cropper = new Cropper(imgParaCrop, {
            aspectRatio: 1,
            viewMode: 1,
            dragMode: 'move',
            autoCropArea: 1,
            restore: false,
            guides: true,
            center: true,
            highlight: false,
            cropBoxMovable: true,
            cropBoxResizable: true,
            toggleDragModeOnDblclick: false,
        });
    }

    // 1. AO CLICAR NA FOTO DE PERFIL
    if (imgVisual) {
        imgVisual.onclick = () => {
            if (typeof abrirPopupImagem === 'function') {
                abrirPopupImagem((imgSelecionada) => {
                    iniciarCorteImagem(imgSelecionada, (imgRecortada) => {
                        imgVisual.src = imgRecortada;
                        if (typeof state !== 'undefined') {
                            state.fotoPerfil = imgRecortada;
                            const estadoParaSalvar = (typeof reordenarObjeto === 'function') ? reordenarObjeto(state) : state;
                            if (typeof saveStateToServer === 'function') saveStateToServer();
                            else if (typeof socket !== 'undefined') socket.emit('ficha_atualizada', estadoParaSalvar);
                            exibirAvisoTemporario("Foto do personagem atualizada!");
                        }
                    });
                });
            } else {
                document.getElementById('input-foto-upload').click();
            }
        };
    }

    // 2. CANCELAR CORTE
    btnCancelarCrop.onclick = function () {
        modalCrop.style.display = 'none';
        if (cropper) {
            cropper.destroy();
            cropper = null;
        }
        callbackCorteFinal = null;
    };

    // 3. CONFIRMAR CORTE
    btnConfirmarCrop.onclick = function () {
        if (!cropper) return;
        const canvas = cropper.getCroppedCanvas({ width: 300, height: 300 });
        const imagemBase64 = canvas.toDataURL('image/jpeg', 0.85);

        modalCrop.style.display = 'none';
        cropper.destroy();
        cropper = null;

        // Envia a imagem para quem chamou a função
        if (callbackCorteFinal) {
            callbackCorteFinal(imagemBase64);
            callbackCorteFinal = null;
        }
    };
    /* =================================================================
            RECEBIMENTO DE DADOS ROLADOS (SINCRONIZAÇÃO VISUAL)
            ================================================================= */
    socket.on('dados_rolados', (data) => {
      // 1. Ignora se fui eu mesmo que enviei (pois já vi a animação localmente)
      if (data.socketId === socket.id) return;

      // 2. Verifica se é para a ficha que estou aberto
      // (Compara o nome da ficha aberta com o nome da ficha que rolou o dado)
      if (state && state.nome && data.personagem &&
        data.personagem.toLowerCase() === state.nome.toLowerCase()) {

        console.log("Recebendo rolagem remota de outra tela...");

        // Chama a função visual marcando como TRUE (é remoto)
        // Isso exibe o popup mas impede que ele seja reenviado para o servidor
        if (typeof showCombatResults === 'function') {
          showCombatResults(data.titulo, data.ataque, data.dano, true);
        }
      }
    });


  