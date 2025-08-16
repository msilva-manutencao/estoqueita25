@echo off
echo 🚀 Iniciando backup do Supabase...

REM Criar diretório de backup
if not exist "backups" mkdir backups

REM Gerar timestamp
for /f "tokens=2 delims==" %%a in ('wmic OS Get localdatetime /value') do set "dt=%%a"
set "timestamp=%dt:~0,4%-%dt:~4,2%-%dt:~6,2%_%dt:~8,2%-%dt:~10,2%-%dt:~12,2%"

echo 📋 Fazendo backup do schema...
supabase db dump --schema public > backups\schema_%timestamp%.sql

echo 💾 Fazendo backup dos dados...
supabase db dump --data-only --schema public > backups\data_%timestamp%.sql

echo 🔄 Copiando migrações...
xcopy supabase\migrations backups\migrations_%timestamp%\ /E /I /Q

echo ⚙️ Copiando configuração...
copy supabase\config.toml backups\config_%timestamp%.toml

echo ✅ Backup concluído com sucesso!
echo 📁 Arquivos salvos em: backups\
echo 📅 Timestamp: %timestamp%

pause