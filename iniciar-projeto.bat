@echo off
echo ========================================
echo    JURISCONNECT - INICIALIZACAO RAPIDA
echo ========================================
echo.

echo [1/4] Verificando Node.js...
node --version >nul 2>&1
if %errorlevel% neq 0 (
    echo ERRO: Node.js nao encontrado!
    echo Baixe em: https://nodejs.org/
    pause
    exit /b 1
)
echo ✓ Node.js encontrado

echo.
echo [2/4] Instalando dependencias do backend...
cd backend
call npm install
if %errorlevel% neq 0 (
    echo ERRO: Falha ao instalar dependencias do backend
    pause
    exit /b 1
)

echo.
echo [3/4] Instalando dependencias do frontend...
cd ..\frontend
call npm install
if %errorlevel% neq 0 (
    echo ERRO: Falha ao instalar dependencias do frontend
    pause
    exit /b 1
)

echo.
echo [4/4] Configuracao concluida!
echo.
echo ========================================
echo           PROXIMOS PASSOS
echo ========================================
echo.
echo 1. Configure o PostgreSQL (ver GUIA-INSTALACAO-COMPLETO.md)
echo 2. Execute: iniciar-backend.bat
echo 3. Execute: iniciar-frontend.bat
echo 4. Acesse: http://localhost:5173
echo.
echo OU use o modo demo (sem PostgreSQL):
echo Execute: iniciar-demo.bat
echo.
pause

