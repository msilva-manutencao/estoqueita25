# Script de Restore do Backup do Supabase

param(
    [Parameter(Mandatory=$true)]
    [string]$BackupFolder,
    
    [string]$RestoreType = "completo",
    
    [string[]]$TabelasEspecificas = @(),
    
    [switch]$ApenasEstrutura
)

Write-Host "🔄 Iniciando restore do backup Supabase..." -ForegroundColor Green
Write-Host "📁 Pasta do backup: $BackupFolder" -ForegroundColor Cyan

# Verificar se a pasta existe
if (!(Test-Path $BackupFolder)) {
    Write-Error "❌ Pasta de backup não encontrada: $BackupFolder"
    exit 1
}

# Verificar arquivos necessários
$schemaFile = Join-Path $BackupFolder "schema_completo.sql"
$dataFile = Join-Path $BackupFolder "dados_completos.sql"
$dataFolder = Join-Path $BackupFolder "dados_por_tabela"

try {
    switch ($RestoreType.ToLower()) {
        "completo" {
            Write-Host "🏗️ Restore completo (estrutura + dados)..." -ForegroundColor Yellow
            
            # Reset do banco
            Write-Host "🔄 Resetando banco de dados..." -ForegroundColor Gray
            supabase db reset --linked
            
            # Aplicar schema
            if (Test-Path $schemaFile) {
                Write-Host "📋 Aplicando estrutura..." -ForegroundColor Gray
                Get-Content $schemaFile | supabase db query
            }
            
            # Aplicar dados
            if (Test-Path $dataFile) {
                Write-Host "💾 Aplicando dados..." -ForegroundColor Gray
                Get-Content $dataFile | supabase db query
            }
        }
        
        "estrutura" {
            Write-Host "🏗️ Restore apenas da estrutura..." -ForegroundColor Yellow
            
            # Reset do banco
            Write-Host "🔄 Resetando banco de dados..." -ForegroundColor Gray
            supabase db reset --linked
            
            # Aplicar apenas schema
            if (Test-Path $schemaFile) {
                Write-Host "📋 Aplicando estrutura..." -ForegroundColor Gray
                Get-Content $schemaFile | supabase db query
            }
        }
        
        "seletivo" {
            Write-Host "🎯 Restore seletivo..." -ForegroundColor Yellow
            
            if ($TabelasEspecificas.Count -eq 0) {
                Write-Error "❌ Para restore seletivo, especifique as tabelas com -TabelasEspecificas"
                exit 1
            }
            
            # Aplicar schema primeiro
            if (Test-Path $schemaFile) {
                Write-Host "📋 Aplicando estrutura..." -ForegroundColor Gray
                Get-Content $schemaFile | supabase db query
            }
            
            # Aplicar dados das tabelas específicas
            if (Test-Path $dataFolder) {
                foreach ($tabela in $TabelasEspecificas) {
                    $tabelaFile = Join-Path $dataFolder "$tabela.sql"
                    if (Test-Path $tabelaFile) {
                        Write-Host "📊 Restaurando tabela: $tabela" -ForegroundColor Gray
                        Get-Content $tabelaFile | supabase db query
                    } else {
                        Write-Warning "⚠️ Arquivo não encontrado para tabela: $tabela"
                    }
                }
            }
        }
        
        "migracoes" {
            Write-Host "🔄 Restore usando migrações..." -ForegroundColor Yellow
            
            $migrationsFolder = Join-Path $BackupFolder "migrations"
            if (Test-Path $migrationsFolder) {
                # Copiar migrações de volta
                $targetMigrations = "supabase\migrations"
                if (Test-Path $targetMigrations) {
                    Remove-Item -Path $targetMigrations -Recurse -Force
                }
                Copy-Item -Path $migrationsFolder -Destination $targetMigrations -Recurse -Force
                
                # Aplicar migrações
                Write-Host "🔄 Aplicando migrações..." -ForegroundColor Gray
                supabase db reset --linked
                supabase db push
                
                # Aplicar dados se não for apenas estrutura
                if (!$ApenasEstrutura -and (Test-Path $dataFile)) {
                    Write-Host "💾 Aplicando dados..." -ForegroundColor Gray
                    Get-Content $dataFile | supabase db query
                }
            } else {
                Write-Error "❌ Pasta de migrações não encontrada no backup"
                exit 1
            }
        }
        
        default {
            Write-Error "❌ Tipo de restore inválido. Use: completo, estrutura, seletivo, ou migracoes"
            exit 1
        }
    }
    
    Write-Host "✅ Restore concluído com sucesso!" -ForegroundColor Green
    
    # Verificar status
    Write-Host "`n📊 Status do banco após restore:" -ForegroundColor Cyan
    supabase status
    
} catch {
    Write-Error "❌ Erro durante o restore: $_"
    Write-Host "💡 Dicas:" -ForegroundColor Yellow
    Write-Host "  - Verifique se o Supabase CLI está configurado" -ForegroundColor Gray
    Write-Host "  - Execute: supabase login" -ForegroundColor Gray
    Write-Host "  - Verifique se está no diretório correto do projeto" -ForegroundColor Gray
    exit 1
}

# Exemplos de uso no final do arquivo como comentário
<#
EXEMPLOS DE USO:

# Restore completo
.\restore-backup.ps1 -BackupFolder ".\backups\backup_2024-01-15_10-30-00"

# Restore apenas estrutura
.\restore-backup.ps1 -BackupFolder ".\backups\backup_2024-01-15_10-30-00" -RestoreType "estrutura"

# Restore seletivo de tabelas específicas
.\restore-backup.ps1 -BackupFolder ".\backups\backup_2024-01-15_10-30-00" -RestoreType "seletivo" -TabelasEspecificas @("companies", "items")

# Restore usando migrações (apenas estrutura)
.\restore-backup.ps1 -BackupFolder ".\backups\backup_2024-01-15_10-30-00" -RestoreType "migracoes" -ApenasEstrutura

# Restore usando migrações (com dados)
.\restore-backup.ps1 -BackupFolder ".\backups\backup_2024-01-15_10-30-00" -RestoreType "migracoes"
#>