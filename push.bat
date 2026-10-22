@echo off
set "PATH=%LOCALAPPDATA%\Programs\Git\cmd;%LOCALAPPDATA%\Programs\Git\mingw64\bin;%PATH%"
echo ==============================================
echo Enviando projeto para o GitHub...
echo ==============================================
git push -u origin main
echo.
echo Concluido! Pressione qualquer tecla para fechar.
pause > nul
