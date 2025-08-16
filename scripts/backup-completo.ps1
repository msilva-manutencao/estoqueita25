# Script de Backup Completo do Supabase
# Inclui dados, políticas RLS, funções, triggers e migrações

param(
    [string]$BackupDir = ".\backups"
)

# Configurações
$PROJECT_ID = "gulysdbrpzrfcvsaaare"
$TABLES = @(
    "companies", "stock_movements", "units", "company_users", 
    "user_roles", "standard_lists", "categories", "standard_list_items", 
    "items", "profiles"
)

# Criar timestamp
$timestamp = Get-Date -Format "yyyy-MM-dd_HH-mm-ss"
$backupFolder = Join-Path $BackupDir "backup_$timestamp"

Write-Host "🚀 Iniciando backup completo do Supabase..." -ForegroundColor Green
Write-Host "📁 Pasta de backup: $backupFolder" -ForegroundColor Cyan

# Criar diretórios
if (!(Test-Path $BackupDir)) {
    New-Item -ItemType Directory -Path $BackupDir -Force | Out-Null
}
if (!(Test-Path $backupFolder)) {
    New-Item -ItemType Directory -Path $backupFolder -Force | Out-Null
}

try {
    # 1. Backup do schema completo
    Write-Host "📋 Fazendo backup do schema completo..." -ForegroundColor Yellow
    $schemaFile = Join-Path $backupFolder "schema_completo.sql"
    supabase db dump --schema public --schema auth | Out-File -FilePath $schemaFile -Encoding UTF8
    
    # 2. Backup dos dados completos
    Write-Host "💾 Fazendo backup dos dados completos..." -ForegroundColor Yellow
    $dataFile = Join-Path $backupFolder "dados_completos.sql"
    supabase db dump --data-only --schema public | Out-File -FilePath $dataFile -Encoding UTF8
    
    # 3. Backup por tabela
    Write-Host "📊 Fazendo backup dos dados por tabela..." -ForegroundColor Yellow
    $dataFolder = Join-Path $backupFolder "dados_por_tabela"
    if (!(Test-Path $dataFolder)) {
        New-Item -ItemType Directory -Path $dataFolder -Force | Out-Null
    }
    
    foreach ($table in $TABLES) {
        try {
            Write-Host "  📊 Backup da tabela: $table" -ForegroundColor Gray
            $tableFile = Join-Path $dataFolder "$table.sql"
            supabase db dump --data-only --table "public.$table" | Out-File -FilePath $tableFile -Encoding UTF8
        }
        catch {
            Write-Warning "⚠️ Não foi possível fazer backup da tabela $table`: $_"
        }
    }
    
    # 4. Backup das funções e triggers
    Write-Host "⚡ Fazendo backup de funções e triggers..." -ForegroundColor Yellow
    try {
        $functionsFile = Join-Path $backupFolder "funcoes_triggers.sql"
        supabase db dump --schema public --schema-only | Out-File -FilePath $functionsFile -Encoding UTF8
    }
    catch {
        Write-Warning "⚠️ Não foi possível fazer backup de funções/triggers"
    }
    
    # 5. Copiar migrações
    Write-Host "🔄 Copiando migrações..." -ForegroundColor Yellow
    $migrationsSource = "supabase\migrations"
    $migrationsTarget = Join-Path $backupFolder "migrations"
    if (Test-Path $migrationsSource) {
        Copy-Item -Path $migrationsSource -Destination $migrationsTarget -Recurse -Force
    }
    
    # 6. Copiar configuração
    Write-Host "⚙️ Copiando configuração..." -ForegroundColor Yellow
    $configSource = "supabase\config.toml"
    $configTarget = Join-Path $backupFolder "config.toml"
    if (Test-Path $configSource) {
        Copy-Item -Path $configSource -Destination $configTarget -Force
    }
    
    # 7. Criar instruções de restore
    $restoreInstructions = @"
SCRIPT DE RESTORE COMPLETO
Gerado em: $(Get-Date -Format "yyyy-MM-dd HH:mm:ss")
Projeto: $PROJECT_ID

INSTRUÇÕES DE RESTORE:

1. RESTORE COMPLETO (recomendado para novo ambiente):
   supabase db reset
   psql -d sua_database < schema_completo.sql
   psql -d sua_database < dados_completos.sql

2. RESTORE SELETIVO POR TABELA:
   psql -d sua_database < schema_completo.sql
   Depois, para cada tabela:
   psql -d sua_database < dados_por_tabela/nome_da_tabela.sql

3. RESTORE APENAS ESTRUTURA (sem dados):
   psql -d sua_database < schema_completo.sql

4. RESTORE USANDO SUPABASE CLI:
   supabase db reset
   supabase db push
   psql -d sua_database < dados_completos.sql

TABELAS INCLUÍDAS NO BACKUP:
$($TABLES | ForEach-Object { "- $_" } | Out-String)

POLÍTICAS RLS: ✅ Incluídas no schema_completo.sql
FUNÇÕES: ✅ Incluídas no funcoes_triggers.sql
TRIGGERS: ✅ Incluídas no funcoes_triggers.sql
MIGRAÇÕES: ✅ Copiadas para pasta migrations/
"@
    
    $instructionsFile = Join-Path $backupFolder "INSTRUCOES_RESTORE.txt"
    $restoreInstructions | Out-File -FilePath $instructionsFile -Encoding UTF8
    
    # 8. Criar resumo
    $resumo = @{
        timestamp = Get-Date -Format "yyyy-MM-dd HH:mm:ss"
        project_id = $PROJECT_ID
        tabelas_backup = $TABLES
        arquivos_gerados = @(
            "schema_completo.sql - Estrutura completa + políticas",
            "dados_completos.sql - Todos os dados",
            "dados_por_tabela/ - Dados separados por tabela",
            "funcoes_triggers.sql - Funções e triggers",
            "migrations/ - Todas as migrações",
            "config.toml - Configuração do projeto",
            "INSTRUCOES_RESTORE.txt - Como restaurar"
        )
    } | ConvertTo-Json -Depth 3
    
    $resumoFile = Join-Path $backupFolder "resumo_backup.json"
    $resumo | Out-File -FilePath $resumoFile -Encoding UTF8
    
    Write-Host "✅ Backup completo concluído com sucesso!" -ForegroundColor Green
    Write-Host "📁 Arquivos salvos em: $backupFolder" -ForegroundColor Cyan
    Write-Host "📋 Resumo: $resumoFile" -ForegroundColor Cyan
    Write-Host "📖 Instruções: $instructionsFile" -ForegroundColor Cyan
    
    # Mostrar tamanho dos arquivos
    Write-Host "`n📊 Arquivos gerados:" -ForegroundColor Cyan
    Get-ChildItem -Path $backupFolder -File | ForEach-Object {
        $sizeKB = [math]::Round($_.Length / 1KB, 2)
        Write-Host "  - $($_.Name): $sizeKB KB" -ForegroundColor Gray
    }
    
}
catch {
    Write-Error "❌ Erro durante o backup: $_"
    Write-Host "💡 Dicas:" -ForegroundColor Yellow
    Write-Host "  - Verifique se o Supabase CLI está instalado e configurado" -ForegroundColor Gray
    Write-Host "  - Execute: supabase login" -ForegroundColor Gray
    Write-Host "  - Verifique se está no diretório correto do projeto" -ForegroundColor Gray
    exit 1
}