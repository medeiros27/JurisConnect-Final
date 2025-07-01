@echo off
echo ========================================
echo     INICIANDO FRONTEND JURISCONNECT
echo ========================================
echo.

cd frontend

echo Iniciando interface web...
echo.
echo ✓ Frontend rodando em: http://localhost:5173
echo ✓ Acesse no navegador para usar o sistema
echo.
echo CONTAS DE DEMONSTRACAO:
echo - Admin: admin@jurisconnect.com / admin123
echo - Cliente: cliente@exemplo.com / cliente123
echo - Correspondente: correspondente@exemplo.com / corresp123
echo.
echo Pressione Ctrl+C para parar o servidor
echo.

npm run dev

