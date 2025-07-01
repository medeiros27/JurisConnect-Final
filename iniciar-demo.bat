@echo off
echo ========================================
echo       JURISCONNECT - MODO DEMO
echo ========================================
echo.
echo Este modo funciona SEM PostgreSQL!
echo Dados de demonstracao inclusos.
echo.

cd backend

echo Compilando backend demo...
call npx tsc src/index-demo.ts --outDir dist --target es2020 --module commonjs --esModuleInterop

echo.
echo Iniciando servidor demo...
echo.
echo ✓ Backend Demo: http://localhost:3000
echo ✓ Dados: Mock/Demonstracao
echo ✓ Usuarios: Criados automaticamente
echo.
echo CONTAS DE DEMONSTRACAO:
echo - Admin: admin@jurisconnect.com / admin123
echo - Cliente: cliente@exemplo.com / cliente123
echo - Correspondente: correspondente@exemplo.com / corresp123
echo.
echo IMPORTANTE: Execute iniciar-frontend.bat em outro terminal!
echo.
echo Pressione Ctrl+C para parar o servidor
echo.

node dist/index-demo.js

