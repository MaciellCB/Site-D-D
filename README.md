# Herdeiros do Caos

## Executar com Docker Compose

Na raiz do projeto, crie o arquivo local de configuração e defina dois segredos
aleatórios e independentes:

```powershell
Copy-Item .env.example .env
```

Edite `.env` e substitua `JWT_SECRET` e `SSO_SECRET` por valores fortes. O mesmo
`SSO_SECRET` é compartilhado pelo backend e pelo PlanarAlly. Depois, construa e
inicie os três serviços com duplo clique em `iniciar-local.bat`. Ele inicia o
Docker Desktop se necessário, sobe os containers, inicia o frontend e abre o
navegador em **http://localhost:5500**. Alternativamente, rode:

```powershell
docker compose up -d --build
npm run dev:frontend
```

O backend fica em **http://localhost:3000**, o PlanarAlly em
**http://localhost:8000** e o MongoDB em `localhost:27017`. Para acompanhar os
containers, use `docker compose logs -f`; para pará-los, pressione `Ctrl+C` na
janela do frontend e rode `docker compose down`. Os dados do MongoDB e do
PlanarAlly permanecem nos volumes/diretórios locais.

Esta configuração é para desenvolvimento local: antes de publicar, configure
segredos próprios, credenciais fortes para o MongoDB e acesso externo via HTTPS
e proxy reverso. Não publique o arquivo `.env`.

## Executar localmente

Na primeira vez, instale as dependências na raiz e no backend:

```powershell
npm install
npm install --prefix backend
```

Inicie cada serviço em um terminal separado, a partir da pasta raiz do projeto:

```powershell
npm run dev:mongo
```

```powershell
npm run dev:backend
```

```powershell
npm run dev:frontend
```

Abra **http://localhost:5500**. Nesse endereço, a aplicação usa automaticamente a API local em `http://localhost:3000` e o MongoDB local. No site publicado, continua usando a API e o banco de produção.

Para encerrar cada serviço, pressione `Ctrl+C` no terminal correspondente. O banco local é executado em Docker e mantém os dados entre inicializações.

## Conta para testes locais

Use esta conta para entrar no site local:

- **Usuário:** `TesteLocal`
- **Senha:** `Teste123!`
- **Ficha disponível:** `Pessoa1`

Essa conta e a ficha foram criadas no MongoDB local; não são credenciais do site publicado. Para usar a conta, mantenha o MongoDB e o backend locais em execução.

Conta de mestre para testar o painel de gerenciamento:

- **Usuário:** `MestreLocal`
- **Senha:** `Mestre123!`

Ela existe somente no MongoDB local.

## Integração local com PlanarAlly

O arquivo `backend/.env` deve definir `PLANARALLY_URL` e `SSO_SECRET`. A URL padrão local é `http://localhost:8000`; o segredo precisa ser igual ao configurado no PlanarAlly. Reinicie o backend após alterar essas variáveis.

O botão **Abrir Tabuleiro VTT** usa `/api/mapa-sso` para gerar um token temporário. Ao salvar a ficha, o backend envia os dados de vida para `/api/sync-ficha` sem atrasar o salvamento principal.
