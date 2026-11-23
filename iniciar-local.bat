@echo off
setlocal
cd /d "%~dp0"

if not exist ".env" (
    echo Arquivo .env nao encontrado.
    echo Copie .env.example para .env e configure JWT_SECRET e SSO_SECRET.
    pause
    exit /b 1
)

where docker >nul 2>&1
if errorlevel 1 (
    echo Docker nao foi encontrado. Instale o Docker Desktop e tente novamente.
    pause
    exit /b 1
)

docker info >nul 2>&1
if errorlevel 1 (
    if not exist "C:\Program Files\Docker\Docker\Docker Desktop.exe" (
        echo O Docker Desktop nao esta instalado ou nao pode ser iniciado.
        pause
        exit /b 1
    )
    echo Iniciando Docker Desktop...
    start "" "C:\Program Files\Docker\Docker\Docker Desktop.exe"
    call :wait_for_docker
    if errorlevel 1 (
        echo O Docker Engine nao iniciou em ate 2 minutos.
        pause
        exit /b 1
    )
)

if not exist "node_modules\.bin\serve.cmd" (
    echo Instalando as dependencias do frontend...
    call npm install
    if errorlevel 1 goto failed
)

echo Iniciando MongoDB, backend e PlanarAlly...
docker compose up -d --build
if errorlevel 1 goto failed

echo Iniciando frontend local...
start "Site D-D Frontend" /D "%~dp0" cmd /k "npm run dev:frontend"
timeout /t 5 /nobreak >nul
start "" "http://localhost:5500"

echo.
echo Frontend:   http://localhost:5500
echo Backend:    http://localhost:3000
echo PlanarAlly: http://localhost:8000
echo MongoDB:    localhost:27017
echo.
echo Para encerrar, feche a janela do frontend com Ctrl+C e execute:
echo docker compose down
pause
exit /b 0

:wait_for_docker
for /L %%i in (1,1,24) do (
    docker info >nul 2>&1
    if not errorlevel 1 exit /b 0
    timeout /t 5 /nobreak >nul
)
exit /b 1

:failed
echo.
echo Nao foi possivel iniciar o ambiente. Confira as mensagens acima.
pause
exit /b 1
