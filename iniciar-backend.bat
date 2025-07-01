@echo off
echo ========================================
echo      INICIANDO BACKEND JURISCONNECT
echo ========================================
echo.

cd backend

echo Verificando arquivo .env...
if not exist .env (
    echo AVISO: Arquivo .env nao encontrado!
    echo Copiando .env.example para .env...
    copy .env.example .env
    echo.
    echo IMPORTANTE: Edite o arquivo .env com suas configuracoes!
    echo Especialmente a senha do PostgreSQL.
    echo.
    pause
)

echo Iniciando servidor backend...
echo.
echo ✓ Backend rodando em: http://localhost:3000
echo ✓ API disponivel em: http://localhost:3000/api
echo.
echo Pressione Ctrl+C para parar o servidor
echo.

npm run dev

