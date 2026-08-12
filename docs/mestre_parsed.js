



        const API_URL = 'https://dandd-chan.onrender.com/api';
        window.socket = io('https://dandd-chan.onrender.com');
        let nomeDelecaoPendente = '';
        let nomeEdicaoPendente = '';
        let pastaIdDelecaoPendente = '';

        // --- FUNÇÕES DO MODAL DE INICIATIVA MANUAL E CROP ---
        let currentInitImage = 'img/imagem-no-site/dado.png';

        function fecharModalInit() {
            document.getElementById('modal-add-init').style.display = 'none';
            document.getElementById('manual-init-name').value = '';
            document.getElementById('manual-init-val').value = '';
            document.getElementById('manual-init-preview').src = 'img/imagem-no-site/dado.png';
            currentInitImage = 'img/imagem-no-site/dado.png';
        }

        // =================================================================
        // LÓGICA DE CORTE E SELEÇÃO DE IMAGEM DA INICIATIVA
        // =================================================================
        let cropper = null;
        let callbackCorteFinal = null;

        function iniciarCorteImagem(src, callback) {
            const imgParaCrop = document.getElementById('imagem-para-crop');
            const modalCrop = document.getElementById('modal-crop-overlay');
            
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

        document.getElementById('btn-cancelar-crop').onclick = function () {
            document.getElementById('modal-crop-overlay').style.display = 'none';
            if (cropper) { cropper.destroy(); cropper = null; }
            callbackCorteFinal = null;
        };

        document.getElementById('btn-confirmar-crop').onclick = function () {
            if (!cropper) return;
            const canvas = cropper.getCroppedCanvas({ width: 300, height: 300 });
            const imagemBase64 = canvas.toDataURL('image/jpeg', 0.85);

            document.getElementById('modal-crop-overlay').style.display = 'none';
            cropper.destroy();
            cropper = null;

            if (callbackCorteFinal) {
                callbackCorteFinal(imagemBase64);
                callbackCorteFinal = null;
            }
        };

        function abrirSelecaoImagemInit() {
            if(typeof abrirPopupImagem === 'function') {
                abrirPopupImagem((img) => {
                    iniciarCorteImagem(img, (imgRecortada) => {
                        currentInitImage = imgRecortada;
                        document.getElementById('manual-init-preview').src = imgRecortada;
                    });
                });
            } else {
                mostrarAviso("Erro: Função de imagem não carregada.");
            }
        }

        // Suporte a Paste no Modal de Iniciativa
        document.addEventListener('paste', function(e) {
            if (document.getElementById('modal-add-init').style.display === 'flex') {
                const items = (e.clipboardData || e.originalEvent.clipboardData).items;
                for (let index in items) {
                    const item = items[index];
                    if (item.kind === 'file' && item.type.includes('image/')) {
                        const blob = item.getAsFile();
                        const reader = new FileReader();
                        reader.onload = function(event) {
                            if (typeof iniciarCorteImagem === 'function') {
                                iniciarCorteImagem(event.target.result, (imgRecortada) => {
                                    currentInitImage = imgRecortada;
                                    document.getElementById('manual-init-preview').src = imgRecortada;
                                });
                            }
                        };
                        reader.readAsDataURL(blob);
                        e.preventDefault(); 
                    }
                }
            }
        });

        // Função para abrir o popup de imagem no Painel do Mestre
        function abrirPopupImagem(callbackImagemDefinida) {
            const overlay = document.createElement('div');
            overlay.className = 'modal-overlay';
            overlay.style.zIndex = '100000';
            overlay.style.display = 'flex';

            overlay.innerHTML = `
                <div class="modal-box" style="width: 400px; height: auto; text-align: center;">
                    <h3 class="modal-titulo">Alterar Imagem</h3>
                    <div class="modal-body">
                        <p style="color:#bbb; font-size:13px; margin-bottom:15px;">
                            Você pode <strong>Colar (Ctrl+V)</strong> uma imagem agora ou clicar abaixo para buscar.
                        </p>
                        <div id="paste-area" style="width: 100%; height: 150px; border: 2px dashed #444; border-radius: 8px; display: flex; align-items: center; justify-content: center; background: #0a0a0a; color: #666; font-weight: bold; position: relative; overflow: hidden; margin-bottom: 15px; transition: 0.2s;">
                            <span id="paste-text">Cole (Ctrl+V) aqui...</span>
                            <img id="paste-preview" style="position:absolute; width:100%; height:100%; object-fit:contain; display:none;">
                        </div>
                        <div class="modal-buttons" style="display:flex; gap: 10px;">
                            <button id="btn-upload-file" class="btn-modal btn-cancelar" style="flex:1;">Buscar Arquivo</button>
                            <button id="btn-confirm-img" class="btn-modal btn-confirmar" style="flex:1; background:#444;" disabled>Confirmar</button>
                        </div>
                        <button class="btn-modal btn-cancelar" id="btn-close-img-popup" style="width: 100%; margin-top: 10px;">Cancelar</button>
                        <input type="file" id="hidden-file-input" accept="image/*" style="display:none;">
                    </div>
                </div>
            `;

            document.body.appendChild(overlay);

            let imgDataFinal = null;
            const pasteArea = overlay.querySelector('#paste-area');
            const preview = overlay.querySelector('#paste-preview');
            const pasteText = overlay.querySelector('#paste-text');
            const btnConfirm = overlay.querySelector('#btn-confirm-img');
            const btnUpload = overlay.querySelector('#btn-upload-file');
            const fileInput = overlay.querySelector('#hidden-file-input');

            const fechar = () => {
                document.removeEventListener('paste', pasteHandler);
                overlay.remove();
            };
            overlay.querySelector('#btn-close-img-popup').onclick = fechar;

            const setImagem = (src) => {
                imgDataFinal = src;
                preview.src = src;
                preview.style.display = 'block';
                pasteText.style.display = 'none';
                pasteArea.style.borderColor = '#9c27b0';
                btnConfirm.removeAttribute('disabled');
                btnConfirm.style.background = '#9c27b0';
            };

            btnUpload.onclick = () => fileInput.click();
            fileInput.onchange = (e) => {
                const file = e.target.files[0];
                if (file) {
                    const reader = new FileReader();
                    reader.onload = (ev) => setImagem(ev.target.result);
                    reader.readAsDataURL(file);
                }
            };

            const pasteHandler = (e) => {
                const items = (e.clipboardData || e.originalEvent.clipboardData).items;
                for (let index in items) {
                    const item = items[index];
                    if (item.kind === 'file' && item.type.includes('image/')) {
                        const blob = item.getAsFile();
                        const reader = new FileReader();
                        reader.onload = (ev) => setImagem(ev.target.result);
                        reader.readAsDataURL(blob);
                        e.preventDefault();
                    }
                }
            };
            document.addEventListener('paste', pasteHandler);

            btnConfirm.onclick = () => {
                if (imgDataFinal) {
                    callbackImagemDefinida(imgDataFinal);
                    fechar();
                }
            };
        }

        async function confirmarAddInit() {
            const nome = document.getElementById('manual-init-name').value.trim();
            const val = parseInt(document.getElementById('manual-init-val').value) || 0;
            
            if (nome) {
                if (!window.socket) window.socket = io('https://dandd-chan.onrender.com');

                window.socket.emit('add_to_tracker', {
                    id: Date.now(),
                    name: nome,
                    val: val,
                    img: currentInitImage
                });
                fecharModalInit();
            } else {
                mostrarAviso("Nome é obrigatório.");
            }
        }

        // DADOS GLOBAIS E INICIALIZAÇÃO
        let layoutAtual = { folders: [], uncategorized: [] };
        let todosPersonagens = [];

        const PERICIAS_PADRAO = {
            "Atletismo": { "atributo": "FOR", "treinado": false, "outros": 0 },
            "Acrobacia": { "atributo": "DEX", "treinado": false, "outros": 0 },
            "Furtividade": { "atributo": "DEX", "treinado": false, "outros": 0 },
            "Prestidigitação": { "atributo": "DEX", "treinado": false, "outros": 0 },
            "Arcanismo": { "atributo": "INT", "treinado": false, "outros": 0 },
            "História": { "atributo": "INT", "treinado": false, "outros": 0 },
            "Investigação": { "atributo": "INT", "treinado": false, "outros": 0 },
            "Natureza": { "atributo": "INT", "treinado": false, "outros": 0 },
            "Religião": { "atributo": "INT", "treinado": false, "outros": 0 },
            "Intuição": { "atributo": "SAB", "treinado": false, "outros": 0 },
            "Lidar com animais": { "atributo": "SAB", "treinado": false, "outros": 0 },
            "Medicina": { "atributo": "SAB", "treinado": false, "outros": 0 },
            "Percepção": { "atributo": "SAB", "treinado": false, "outros": 0 },
            "Sobrevivência": { "atributo": "SAB", "treinado": false, "outros": 0 },
            "Atuação": { "atributo": "CAR", "treinado": false, "outros": 0 },
            "Enganação": { "atributo": "CAR", "treinado": false, "outros": 0 },
            "Intimidação": { "atributo": "CAR", "treinado": false, "outros": 0 },
            "Persuasão": { "atributo": "CAR", "treinado": false, "outros": 0 },
            "Salvaguarda (Força)": { "atributo": "FOR", "treinado": false, "outros": 0 },
            "Salvaguarda (Destreza)": { "atributo": "DEX", "treinado": false, "outros": 0 },
            "Salvaguarda (Constituição)": { "atributo": "CON", "treinado": false, "outros": 0 },
            "Salvaguarda (Inteligência)": { "atributo": "INT", "treinado": false, "outros": 0 },
            "Salvaguarda (Sabedoria)": { "atributo": "SAB", "treinado": false, "outros": 0 },
            "Salvaguarda (Carisma)": { "atributo": "CAR", "treinado": false, "outros": 0 }
        };

        let sessionExpiredBanner = null;

        function triggerSessionExpired(motivo = 'Sua sessão expirou ou foi encerrada.') {
            if (sessionExpiredBanner) return;
            const currentToken = localStorage.getItem('authToken');
            if (!currentToken) {
                fecharModalEditar();
                fecharModalCriar();
                return;
            }
            localStorage.removeItem('authToken');
            fecharModalEditar();
            fecharModalCriar();
            const div = document.createElement('div');
            div.className = 'custom-toast';
            div.style.background = '#8e1d1d';
            div.style.border = '1px solid #ff8d8d';
            div.textContent = `${motivo} Faça login novamente.`;
            document.body.appendChild(div);
            sessionExpiredBanner = div;
            setTimeout(() => {
                if (div.parentNode) div.remove();
                sessionExpiredBanner = null;
            }, 5000);
            setTimeout(() => returnToLogin(), 1200);
        }

        async function fetchComAuth(url, options = {}) {
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
            if (event.key === 'authToken') {
                const tokenAtual = localStorage.getItem('authToken');
                if (!tokenAtual) {
                    fecharModalEditar();
                    fecharModalCriar();
                    mostrarAviso('Sessão alterada em outra aba. Faça login novamente.');
                    setTimeout(() => returnToLogin(), 1200);
                }
            }
        });

        window.onload = carregarLista;

        async function carregarLista() {
            const container = document.getElementById('area-trabalho');
            try {
                const resChars = await fetch(`${API_URL}/lista-personagens`);
                todosPersonagens = await resChars.json();

                const resLayout = await fetch(`${API_URL}/layout`);
                layoutAtual = await resLayout.json();

                renderizarAreaTrabalho();
            } catch (error) {
                console.error(error);
                container.innerHTML = '<p style="color:red; margin:auto;">Erro ao conectar com servidor.</p>';
            }
        };

        function renderizarAreaTrabalho() {
            const container = document.getElementById('area-trabalho');
            container.innerHTML = '';

            let charsNoLayout = new Set([...layoutAtual.uncategorized]);
            layoutAtual.folders.forEach(f => f.items.forEach(i => charsNoLayout.add(i)));

            todosPersonagens.forEach(nome => {
                if (!charsNoLayout.has(nome)) {
                    layoutAtual.uncategorized.push(nome);
                }
            });

            const divSemGrupo = criarElementoPasta('Sem Grupo', layoutAtual.uncategorized, 'uncategorized', false);
            container.appendChild(divSemGrupo);

            layoutAtual.folders.forEach(pasta => {
                const divPasta = criarElementoPasta(pasta.name, pasta.items, pasta.id, true);
                container.appendChild(divPasta);
            });

            const pastaSemGrupoContent = divSemGrupo.querySelector('.folder-content');
            const btnNovoChar = document.createElement('div');
            btnNovoChar.className = 'card-personagem card-novo';
            btnNovoChar.innerHTML = '<div>+ Nova Ficha</div>';
            btnNovoChar.onclick = abrirModalCriar;
            pastaSemGrupoContent.insertBefore(btnNovoChar, pastaSemGrupoContent.firstChild);
        }

        function criarElementoPasta(titulo, itens, id, permiteDeletar) {
            const col = document.createElement('div');
            col.className = 'folder-container';
            col.dataset.id = id;

            const header = document.createElement('div');
            header.className = 'folder-header';
            header.innerHTML = `<span>${titulo}</span>`;
            
            if (permiteDeletar) {
                const btnDel = document.createElement('button');
                btnDel.className = 'btn-del-folder';
                btnDel.innerHTML = '✕'; 
                btnDel.title = 'Excluir Pasta';
                btnDel.onclick = () => abrirModalDeletarPasta(id);
                header.appendChild(btnDel);
            }
            col.appendChild(header);

            const content = document.createElement('div');
            content.className = 'folder-content';
            
            itens.forEach(nome => {
                if (todosPersonagens.includes(nome)) {
                    const card = criarCardHTML(nome);
                    content.appendChild(card);
                }
            });
            col.appendChild(content);

            new Sortable(content, {
                group: 'shared', animation: 150, ghostClass: 'img-loading', delay: 100, delayOnTouchOnly: true,
                onEnd: function (evt) { salvarNovoLayout(); }
            });

            const footer = document.createElement('div');
            footer.style.cssText = `
                padding: 8px;
                background: #1a1a1a;
                border-top: 1px solid #333;
                border-radius: 0 0 8px 8px;
                display: flex;
                flex-direction: column;
                gap: 6px;
            `;

            const btnObs = document.createElement('button');
            btnObs.innerHTML = "🎥 Iniciativa (Web)";
            btnObs.style.cssText = `
                width: 100%; padding: 6px; background: linear-gradient(45deg, #1f1f1f, #2a2a2a);
                border: 1px solid #9c27b0; color: #e0aaff; border-radius: 4px;
                font-weight: bold; cursor: pointer; font-size: 11px; text-transform: uppercase;
            `;
            btnObs.onclick = () => {
                const cards = content.querySelectorAll('.card-personagem');
                const nomesMembros = Array.from(cards).map(c => c.dataset.nome).join(',');
                window.open(`iniciativa.html?grupo=${encodeURIComponent(titulo)}&membros=${encodeURIComponent(nomesMembros)}&master=true`, '_blank');
            };

            const rowSmallBtns = document.createElement('div');
            rowSmallBtns.style.cssText = "display: flex; gap: 4px;";

            const btnAdd = document.createElement('button');
            btnAdd.innerHTML = "➕";
            btnAdd.title = "Adicionar criatura manualmente";
            btnAdd.style.cssText = "flex: 1; background: #222; border: 1px solid #444; color: #ccc; padding: 4px; font-size: 10px; cursor: pointer; border-radius: 4px;";
            btnAdd.onclick = () => {
                document.getElementById('modal-add-init').style.display = 'flex';
                document.getElementById('manual-init-name').focus();
            };

            const btnClear = document.createElement('button');
            btnClear.innerHTML = "🗑️";
            btnClear.title = "Limpar Iniciativa de Todos";
            btnClear.style.cssText = "width: 30px; background: #3a1a1a; border: 1px solid #b71c1c; color: #ff9999; padding: 4px; font-size: 10px; cursor: pointer; border-radius: 4px;";
            btnClear.onclick = () => {
                if (!window.socket) window.socket = io('https://dandd-chan.onrender.com');
                window.socket.emit('update_tracker', []);
            };

            rowSmallBtns.appendChild(btnAdd);
            rowSmallBtns.appendChild(btnClear);
            footer.appendChild(btnObs);
            footer.appendChild(rowSmallBtns);
            col.appendChild(footer);

            return col;
        }

        function criarCardHTML(nome) {
            const card = document.createElement('div');
            card.className = 'card-personagem';
            card.dataset.nome = nome;
            const imgId = `img-${nome.replace(/\s+/g, '-')}`;

            card.innerHTML = `
                <img id="${imgId}" src="img/imagem-no-site/personagem.png" class="card-img img-loading">
                <div class="card-name">${nome}</div>
                <button class="btn-action btn-edit" title="Editar" onclick="abrirModalEditar(event, '${nome}')">✎</button>
                <button class="btn-action btn-delete" title="Apagar" onclick="abrirModalDeletar(event, '${nome}')">✕</button>
            `;

            card.onclick = (e) => {
                if (e.target.classList.contains('btn-action')) return;
                abrirFichaDoJogador(nome);
            };

            carregarFotoIndividual(nome, imgId);
            return card;
        }

        async function salvarNovoLayout() {
            const container = document.getElementById('area-trabalho');
            const pastasElements = container.querySelectorAll('.folder-container');
            const novoLayout = { folders: [], uncategorized: [] };

            pastasElements.forEach(pastaDiv => {
                const id = pastaDiv.dataset.id;
                const nomePasta = pastaDiv.querySelector('.folder-header span').innerText;
                const cards = pastaDiv.querySelectorAll('.card-personagem[data-nome]');
                const nomes = Array.from(cards).map(c => c.dataset.nome);

                if (id === 'uncategorized') {
                    novoLayout.uncategorized = nomes;
                } else {
                    novoLayout.folders.push({ id: id, name: nomePasta, items: nomes });
                }
            });

            layoutAtual = novoLayout;

            await fetch(`${API_URL}/save-layout`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(novoLayout)
            });
        }

        function abrirModalNovaPasta() {
            document.getElementById('nome-nova-pasta').value = '';
            document.getElementById('modal-nova-pasta').style.display = 'flex';
            document.getElementById('nome-nova-pasta').focus();
        }

        async function confirmarNovaPasta() {
            const nome = document.getElementById('nome-nova-pasta').value.trim();
            if (!nome) {
                mostrarAviso("Digite um nome para a pasta.");
                return;
            }

            const novaPasta = { id: 'folder-' + Date.now(), name: nome, items: [] };
            layoutAtual.folders.push(novaPasta);
            document.getElementById('modal-nova-pasta').style.display = 'none'; 
            renderizarAreaTrabalho();
            salvarNovoLayout();
        }

        function abrirModalDeletarPasta(id) {
            pastaIdDelecaoPendente = id;
            document.getElementById('modal-deletar-pasta').style.display = 'flex';
        }

        async function confirmarDelecaoPasta() {
            if (!pastaIdDelecaoPendente) return;
            const pastaIndex = layoutAtual.folders.findIndex(f => f.id === pastaIdDelecaoPendente);
            if (pastaIndex > -1) {
                const pasta = layoutAtual.folders[pastaIndex];
                layoutAtual.uncategorized.push(...pasta.items); 
                layoutAtual.folders.splice(pastaIndex, 1); 
                renderizarAreaTrabalho();
                salvarNovoLayout();
            }
            document.getElementById('modal-deletar-pasta').style.display = 'none'; 
            pastaIdDelecaoPendente = '';
        }

        function abrirModalCriar() {
            document.getElementById('novo-nome').value = '';
            document.getElementById('modal-criar').style.display = 'flex';
            document.getElementById('novo-nome').focus();
        }
        function fecharModalCriar() { document.getElementById('modal-criar').style.display = 'none'; }

        async function confirmarCriacao() {
            const nome = document.getElementById('novo-nome').value.trim();

            if (!nome) return mostrarAviso("Digite o nome da ficha!");

            const novaFichaCompleta = {
                nome: nome,
                fotoPerfil: "",
                activeTab: "Inventário",
                atributos: { n1: 10, n2: 10, n3: 10, n4: 10, n5: 10, n6: 10 },
                pericias: PERICIAS_PADRAO, 
                niveisClasses: {},
                xp: "0",
                marco: 0,
                vidaAtual: 1,
                vidaTotalCalculada: 1,
                inventory: [],
                abilities: [],
                spells: [],
                description: { anotacoes: "", aparencia: "", personalidade: "", objetivo: "", ideais: "", vinculos: "", fraquezas: "", historia: "" },
                spellSlots: {
                    "1": { used: 0, status: [] }, "2": { used: 0, status: [] },
                    "3": { used: 0, status: [] }, "4": { used: 0, status: [] },
                    "5": { used: 0, status: [] }, "6": { used: 0, status: [] },
                    "7": { used: 0, status: [] }, "8": { used: 0, status: [] },
                    "9": { used: 0, status: [] }, "pact": { used: 0, status: [] },
                    "ki": { used: 0, status: [] }, "furia": { used: 0, status: [] },
                    "sorcery": { used: 0, status: [] }, "mutagen": { used: 0, status: [] }
                }
            };

            try {
                const res = await fetchComAuth(`${API_URL}/criar-ficha`, {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify(novaFichaCompleta)
                });

                if (res.ok) {
                    mostrarAviso("Criado com sucesso!");
                    fecharModalCriar();
                    carregarLista();
                } else {
                    const d = await res.json();
                    mostrarAviso("Erro: " + d.error);
                }
            } catch (e) {
                if (e && e.message === 'AUTH_EXPIRED') return;
                console.error(e);
                mostrarAviso("Erro de conexão.");
            }
        }

        function abrirModalDeletar(e, nome) {
            e.stopPropagation();
            nomeDelecaoPendente = nome;
            document.getElementById('nome-para-deletar').innerText = nome;
            document.getElementById('modal-deletar').style.display = 'flex';
        }
        function fecharModalDeletar() { document.getElementById('modal-deletar').style.display = 'none'; }

        async function confirmarDelecao() {
            if (!nomeDelecaoPendente) return;
            try {
                const res = await fetchComAuth(`${API_URL}/deletar-ficha`, {
                    method: 'POST', headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ nome: nomeDelecaoPendente })
                });
                if (res.ok) {
                    mostrarAviso("Deletado.");
                    fecharModalDeletar();
                    carregarLista();
                } else mostrarAviso("Erro ao deletar.");
            } catch (e) {
                if (e && e.message === 'AUTH_EXPIRED') return;
                mostrarAviso("Erro conexao");
            }
        }

        async function abrirModalEditar(e, nome) {
            e.stopPropagation();
            nomeEdicaoPendente = nome;
            try {
                const res = await fetchComAuth(`${API_URL}/load-ficha-mestre`, {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ nome: nome })
                });

                if (!res.ok) {
                    const d = await res.json().catch(() => ({}));
                    mostrarAviso('Erro ao obter ficha: ' + (d.error || res.statusText || 'Resposta inválida do servidor.'));
                    return;
                }

                const d = await res.json();
                document.getElementById('nome-antigo-display').innerText = nome;
                document.getElementById('edit-ficha-nome').value = d.nome || nome;
                document.getElementById('edit-linked-account').innerText = d.accountUsername || '-';
                document.getElementById('modal-editar').style.display = 'flex';
            } catch (e) {
                if (e && e.message === 'AUTH_EXPIRED') return;
                console.error('Erro ao abrir modal de edição:', e);
                mostrarAviso('Erro de conexão ao obter ficha.');
            }
        }

        function fecharModalEditar() {
            document.getElementById('modal-editar').style.display = 'none';
            document.getElementById('edit-ficha-nome').value = '';
            document.getElementById('edit-linked-account').innerText = '-';
            nomeEdicaoPendente = null;
        }

        async function desvincularConta() {
            if (!nomeEdicaoPendente) return;
            if (!confirm('Deseja desvincular a conta desta ficha?')) return;
            try {
                const token = localStorage.getItem('authToken');
                if (!token) { mostrarAviso('Autenticação necessária.'); return; }
                const resSave = await fetchComAuth(`${API_URL}/save-ficha`, { method: 'POST', headers: { 'Content-Type':'application/json' }, body: JSON.stringify({ nome: nomeEdicaoPendente, accountUsername: '' }) });
                if (resSave.ok) { mostrarAviso('Desvinculado.'); document.getElementById('modal-editar').style.display='none'; }
                else { mostrarAviso('Erro ao desvincular.'); }
            } catch (e) {
                if (e && e.message === 'AUTH_EXPIRED') return;
                mostrarAviso('Erro conexao');
            }
        }

        function vincularContaModal() {
            openAccountSelector((username) => {
                vincularConta(nomeEdicaoPendente, username);
            });
        }

        async function salvarEdicaoFicha() {
            const novoNome = document.getElementById('edit-ficha-nome').value.trim();
            if (!nomeEdicaoPendente || !novoNome) return mostrarAviso('Digite o novo nome da ficha.');
            try {
                const token = localStorage.getItem('authToken');
                if (!token) { mostrarAviso('Autenticação necessária.'); return; }
                const res = await fetchComAuth(`${API_URL}/editar-credenciais`, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ nomeAntigo: nomeEdicaoPendente, novoNome, novaSenha: '' }) });
                if (res.ok) {
                    mostrarAviso('Nome da ficha atualizado.');
                    document.getElementById('modal-editar').style.display='none';
                    carregarLista();
                } else {
                    const d = await res.json().catch(() => ({}));
                    mostrarAviso('Erro: ' + (d.error || 'Não foi possível salvar.'));
                }
            } catch (e) {
                if (e && e.message === 'AUTH_EXPIRED') return;
                mostrarAviso('Erro conexão');
            }
        }

        async function vincularConta(nome, user) {
            try {
                const token = localStorage.getItem('authToken');
                if (!token) { mostrarAviso('Autenticação necessária.'); return; }
                const res = await fetchComAuth(`${API_URL}/save-ficha`, { method: 'POST', headers: { 'Content-Type':'application/json' }, body: JSON.stringify({ nome, accountUsername: user }) });
                if (res.ok) { mostrarAviso('Vinculado a ' + user); document.getElementById('modal-editar').style.display='none'; }
                else { const d = await res.json().catch(()=>({})); mostrarAviso('Erro: '+(d.error||'Não foi possível vincular.')); }
            } catch (e) {
                if (e && e.message === 'AUTH_EXPIRED') return;
                mostrarAviso('Erro conexão');
            }
        }

        function abrirCriarContaFromFicha() {
            document.getElementById('modal-editar').style.display = 'none';
            accountSelectionCallback = null;
            document.getElementById('admin-accounts-modal').style.display = 'flex';
            setTimeout(()=>{ document.getElementById('admin-create-username').focus(); },120);
        }

        async function carregarFotoIndividual(nome, imgId) {
            try {
                const res = await fetchComAuth(`${API_URL}/load-ficha-mestre`, {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ nome: nome })
                });
                if (res.ok) {
                    const data = await res.json();
                    const imgElement = document.getElementById(imgId);
                    if (imgElement && data.fotoPerfil && data.fotoPerfil.length > 50) {
                        imgElement.src = data.fotoPerfil;
                        imgElement.classList.remove('img-loading');
                        imgElement.classList.add('img-loaded');
                    }
                }
            } catch (e) {
                if (e && e.message === 'AUTH_EXPIRED') return;
            }
        }

        function abrirFichaDoJogador(nome) {
            window.open(`index.html?masterView=${nome}`, '_blank');
        }

        function returnToLogin() {
            localStorage.removeItem('authToken');
            window.location.href = 'index.html';
        }

        function mostrarAviso(msg) {
            const div = document.createElement('div');
            div.className = 'custom-toast';
            div.innerText = msg;
            document.body.appendChild(div);
            setTimeout(() => div.remove(), 3000);
        }

        // when set, accountSelectionCallback puts the accounts list into "selection mode"
        let accountSelectionCallback = null;

        async function openAccountSelector(callback) {
            accountSelectionCallback = typeof callback === 'function' ? callback : null;
            document.getElementById('modal-editar').style.display = 'none';
            await openAdminAccounts();
        }

        function closeAdminAccounts() {
            document.getElementById('admin-accounts-modal').style.display = 'none';
            accountSelectionCallback = null;
        }

        async function openAdminAccounts() {
            const token = localStorage.getItem('authToken');
            document.getElementById('admin-accounts-modal').style.display = 'flex';
            const header = document.getElementById('admin-accounts-header');
            if (accountSelectionCallback) {
                header.innerText = 'Vincular existente: selecione a conta desejada';
            } else {
                header.innerText = 'Contas existentes';
            }
            const list = document.getElementById('admin-accounts-list');
            list.innerHTML = '';
            if (!token) { list.innerHTML = '<div style="color:#999; padding:10px;">Faça login como master para ver contas ou crie uma conta abaixo.</div>'; accountSelectionCallback = null; return; }
            try {
                const meRes = await fetchComAuth(`${API_URL}/accounts/me`, { headers: { 'Content-Type': 'application/json' } });
                if (!meRes.ok) {
                    const d = await meRes.json().catch(()=>({}));
                    const msg = d.error || (meRes.statusText || 'Erro ao verificar conta.');
                    mostrarAviso('Erro: ' + msg);
                    return;
                }
                const me = await meRes.json();
                if (!me.isMaster) {
                    list.innerHTML = '<div style="color:#ffb3b3; padding:10px;">Esta conta não tem permissão de mestre para gerenciar contas.</div>';
                    accountSelectionCallback = null;
                    return;
                }

                const res = await fetchComAuth(`${API_URL}/accounts/list`, { headers: { 'Content-Type': 'application/json' } });
                if (!res.ok) {
                    accountSelectionCallback = null;
                    const d = await res.json().catch(()=>({}));
                    const msg = d.error || (res.statusText || 'Erro ao buscar contas.');
                    mostrarAviso('Erro: ' + msg);
                    return;
                }
                    const accounts = await res.json();
                list.innerHTML = '';
                accounts.forEach(acc => {
                    if ((acc.username||'').toLowerCase() === 'mestre') return; // hide default master
                    const row = document.createElement('div');
                    row.className = 'account-row';
                    const left = document.createElement('div'); left.className = 'account-left';
                    left.innerHTML = `<div class="username">${acc.username}</div><div style="font-size:12px; color:#999;">${(acc.characters||[]).slice(0,8).join(', ')}</div>`;
                    const right = document.createElement('div'); right.className = 'account-right';

                    if (accountSelectionCallback) {
                        const selectBtn = document.createElement('button'); selectBtn.className = 'account-btn'; selectBtn.textContent = 'Selecionar';
                        selectBtn.onclick = () => { accountSelectionCallback(acc.username); accountSelectionCallback = null; document.getElementById('admin-accounts-modal').style.display='none'; };
                        right.appendChild(selectBtn);
                    } else {
                        const editBtn = document.createElement('button'); editBtn.className = 'account-btn'; editBtn.textContent = 'Editar'; editBtn.onclick = () => abrirModalEditarConta(acc.username);
                        const toggle = document.createElement('button'); toggle.className = 'account-btn'; if (acc.isMaster) toggle.classList.add('master'); toggle.textContent = acc.isMaster ? 'Master ✅' : 'Tornar Master';
                        toggle.onclick = async () => {
                            const t = !acc.isMaster;
                            const r = await fetch(`${API_URL}/accounts/admin/update`, { method:'POST', headers: { 'Content-Type':'application/json', 'Authorization':'Bearer '+token }, body: JSON.stringify({ username: acc.username, isMaster: t }) });
                            if (r.ok) { acc.isMaster = t; toggle.textContent = t ? 'Master ✅' : 'Tornar Master'; toggle.classList.toggle('master', t); mostrarAviso('Atualizado'); }
                            else { const dd = await r.json().catch(()=>({})); mostrarAviso('Erro: ' + (dd.error||'Erro ao atualizar.')); }
                        };
                        const del = document.createElement('button'); del.className = 'account-btn delete'; del.textContent = 'Deletar';
                        del.onclick = async () => {
                            if (!confirm('Deletar conta ' + acc.username + '?')) return;
                            const r = await fetch(`${API_URL}/accounts/admin/delete`, { method:'POST', headers:{ 'Content-Type':'application/json', 'Authorization':'Bearer '+token }, body: JSON.stringify({ username: acc.username }) });
                            if (r.ok) { row.remove(); mostrarAviso('Deletado'); }
                            else { const dd = await r.json().catch(()=>({})); mostrarAviso('Erro: ' + (dd.error||'Erro ao deletar.')); }
                        };
                        right.appendChild(editBtn); right.appendChild(toggle); right.appendChild(del);
                    }

                    row.appendChild(left); row.appendChild(right);
                    list.appendChild(row);
                });
                document.getElementById('admin-accounts-modal').style.display = 'flex';
            } catch (e) { mostrarAviso('Erro de conexão.'); }
        }
        
            async function createAdminLocal() {
                const username = document.getElementById('admin-create-username').value.trim();
                const password = document.getElementById('admin-create-password').value.trim();
                const isMaster = document.getElementById('admin-create-ismaster').checked;
                if (!username || !password) return mostrarAviso('Preencha usuário e senha.');
                try {
                    const res = await fetch(`${API_URL}/accounts/register`, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ username, password, isMaster }) });
                    if (res.ok) {
                        document.getElementById('admin-create-username').value=''; document.getElementById('admin-create-password').value='';

                        const currentToken = localStorage.getItem('authToken');
                        if (currentToken) {
                            try {
                                const meRes = await fetchComAuth(`${API_URL}/accounts/me`, { headers: { 'Content-Type': 'application/json' } });
                                if (meRes.ok) {
                                    const me = await meRes.json();
                                    if (me.isMaster) {
                                        mostrarAviso('Conta criada com sucesso.');
                                        await loadAccountsRefresh();
                                        return;
                                    }
                                }
                            } catch (e) {}
                        }

                        // If the current session is not master, do not trigger the admin list refresh
                        mostrarAviso('Conta criada com sucesso. Faça login com ela para entrar.');
                        return;
                    }
                    const d = await res.json().catch(()=>({}));
                    mostrarAviso('Erro: '+(d.error||'Não foi possível criar.'));
                } catch (e) {
                    mostrarAviso('Erro de conexão.');
                }
            }

            async function abrirModalEditarConta(username) {
            document.getElementById('admin-accounts-modal').style.display = 'none';
            accountSelectionCallback = null;
            try {
                const token = localStorage.getItem('authToken');
                if (!token) { mostrarAviso('Autenticação necessária.'); return; }
                const res = await fetch(`${API_URL}/accounts/list`, { headers: { 'Authorization': 'Bearer ' + token } });
                if (!res.ok) { mostrarAviso('Erro ao buscar contas.'); return; }
                const accounts = await res.json();
                const acc = accounts.find(a => (a.username||'').toLowerCase() === (username||'').toLowerCase());
                if (!acc) { mostrarAviso('Conta não encontrada.'); return; }
                    document.getElementById('modal-edit-account-name').innerText = acc.username;
                    document.getElementById('edit-account-username').value = acc.username;
                    document.getElementById('edit-account-password').value = '';
                    const list = document.getElementById('edit-account-linked'); list.innerHTML = '';
                    (acc.characters || []).forEach(n => { const li = document.createElement('div'); li.style = 'color:#ddd; padding:6px 0;'; li.textContent = n; list.appendChild(li); });
                    document.getElementById('modal-edit-account').style.display = 'flex';
                } catch (e) { mostrarAviso('Erro de conexão.'); }
            }

            async function confirmarEdicaoConta() {
                const original = document.getElementById('modal-edit-account-name').innerText;
                const novo = document.getElementById('edit-account-username').value.trim();
                const senha = document.getElementById('edit-account-password').value.trim();
                if (!original) return;
                try {
                    const token = localStorage.getItem('authToken');
                    const res = await fetch(`${API_URL}/accounts/admin/edit`, { method: 'POST', headers: { 'Content-Type': 'application/json', 'Authorization': 'Bearer ' + token }, body: JSON.stringify({ username: original, newUsername: novo || undefined, newPassword: senha || undefined }) });
                    if (res.ok) { mostrarAviso('Conta atualizada.'); document.getElementById('modal-edit-account').style.display = 'none'; loadAccountsRefresh(); }
                    else { const d = await res.json().catch(()=>({})); mostrarAviso('Erro: ' + (d.error||'Não foi possível atualizar.')); }
                } catch (e) { mostrarAviso('Erro de conexão.'); }
            }

            async function loadAccountsRefresh() { try { await openAdminAccounts(); } catch(e){} }
    