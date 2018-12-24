set MAIN_JS=%~dp0\game_server\app.js
set CONFIG=%~dp0\configs_local.js
set GAMEID=100
set CONFIGID=1
set PORT=20000
call node.exe %MAIN_JS% %CONFIG% %GAMEID% %CONFIGID% %PORT%
pause