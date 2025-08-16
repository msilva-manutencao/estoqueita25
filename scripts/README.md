# Scripts de Backup e Restore do Supabase

Este conjunto de scripts permite fazer backup completo e restore do seu projeto Supabase, incluindo:

- ✅ **Dados de todas as tabelas**
- ✅ **Políticas RLS (Row Level Security)**
- ✅ **Funções e triggers**
- ✅ **Estrutura do banco (schema)**
- ✅ **Migrações**
- ✅ **Configurações do projeto**

## 📋 Pré-requisitos

1. **Supabase CLI** instalado e configurado
   ```bash
   npm install -g supabase
   supabase login
   ```

2. **PostgreSQL client** (psql) instalado
   - Windows: https://www.postgresql.org/download/windows/
   - Ou use o psql que vem com o Supabase CLI

3. **Node.js** (para scripts .js) ou **PowerShell** (para scripts .ps1)

## 🚀 Como fazer Backup

### Opção 1: Script PowerShell (Recomendado para Windows)

```powershell
# Backup completo
.\scripts\backup-completo.ps1

# Backup em pasta específica
.\scripts\backup-completo.ps1 -BackupDir "C:\MeusBackups"
```

### Opção 2: Script Node.js

```bash
# Executar o script
node scripts/backup-completo.js

# Ou tornar executável e rodar
chmod +x scripts/backup-completo.js
./scripts/backup-completo.js
```

### Opção 3: Script Batch (Windows CMD)

```cmd
scripts\backup-supabase.bat
```

## 📁 Estrutura do Backup

Após executar o backup, você terá uma pasta com esta estrutura:

```
backups/
└── backup_2024-01-15_10-30-00/
    ├── schema_completo.sql          # Estrutura + políticas + funções
    ├── dados_completos.sql          # Todos os dados
    ├── funcoes_triggers.sql         # Funções e triggers separados
    ├── dados_por_tabela/           # Dados separados por tabela
    │   ├── companies.sql
    │   ├── items.sql
    │   ├── categories.sql
    │   └── ...
    ├── migrations/                  # Cópia das migrações
    ├── config.toml                 # Configuração do projeto
    ├── resumo_backup.json          # Resumo do backup
    └── INSTRUCOES_RESTORE.txt      # Instruções detalhadas
```

## 🔄 Como fazer Restore

### Restore Completo

```powershell
# Restore completo (estrutura + dados)
.\scripts\restore-backup.ps1 -BackupFolder ".\backups\backup_2024-01-15_10-30-00"
```

### Restore Apenas Estrutura

```powershell
# Apenas estrutura (sem dados)
.\scripts\restore-backup.ps1 -BackupFolder ".\backups\backup_2024-01-15_10-30-00" -RestoreType "estrutura"
```

### Restore Seletivo

```powershell
# Restore apenas de tabelas específicas
.\scripts\restore-backup.ps1 -BackupFolder ".\backups\backup_2024-01-15_10-30-00" -RestoreType "seletivo" -TabelasEspecificas @("companies", "items", "categories")
```

### Restore via Migrações

```powershell
# Restore usando migrações (recomendado para desenvolvimento)
.\scripts\restore-backup.ps1 -BackupFolder ".\backups\backup_2024-01-15_10-30-00" -RestoreType "migracoes"

# Apenas estrutura via migrações
.\scripts\restore-backup.ps1 -BackupFolder ".\backups\backup_2024-01-15_10-30-00" -RestoreType "migracoes" -ApenasEstrutura
```

## 🛠️ Restore Manual

Se preferir fazer restore manual:

```bash
# 1. Reset do banco
supabase db reset

# 2. Aplicar estrutura
psql -d sua_database < backup_folder/schema_completo.sql

# 3. Aplicar dados
psql -d sua_database < backup_folder/dados_completos.sql
```

## 📊 Tabelas Incluídas no Backup

O script faz backup automático destas tabelas:

- `companies` - Empresas
- `items` - Itens do estoque
- `categories` - Categorias
- `units` - Unidades de medida
- `stock_movements` - Movimentações de estoque
- `standard_lists` - Listas padrão
- `standard_list_items` - Itens das listas padrão
- `company_users` - Usuários das empresas
- `user_roles` - Roles dos usuários
- `profiles` - Perfis dos usuários

## 🔒 Políticas RLS

Todas as políticas RLS são incluídas no backup do schema. Isso inclui:

- Políticas de SELECT, INSERT, UPDATE, DELETE
- Configurações de RLS habilitado/forçado
- Funções de segurança personalizadas

## ⚡ Funções e Triggers

O backup inclui:

- Funções PL/pgSQL personalizadas
- Triggers automáticos
- Funções de validação
- Procedures armazenadas

## 🔧 Personalização

Para adicionar mais tabelas ao backup, edite a variável `TABLES` nos scripts:

```javascript
// No arquivo backup-completo.js
const TABLES = [
  'companies', 'items', 'categories',
  'sua_nova_tabela'  // Adicione aqui
];
```

```powershell
# No arquivo backup-completo.ps1
$TABLES = @(
    "companies", "items", "categories",
    "sua_nova_tabela"  # Adicione aqui
)
```

## 🚨 Troubleshooting

### Erro: "supabase command not found"
```bash
# Instalar Supabase CLI
npm install -g supabase
```

### Erro: "psql command not found"
```bash
# Instalar PostgreSQL client
# Windows: https://www.postgresql.org/download/windows/
# macOS: brew install postgresql
# Linux: sudo apt-get install postgresql-client
```

### Erro: "Permission denied"
```bash
# Tornar script executável (Linux/macOS)
chmod +x scripts/backup-completo.js
```

### Erro: "Project not linked"
```bash
# Fazer login e linkar projeto
supabase login
supabase link --project-ref seu-project-id
```

## 📅 Automação

Para automatizar backups, você pode:

1. **Usar Task Scheduler (Windows)**
2. **Usar Cron (Linux/macOS)**
3. **Usar GitHub Actions**
4. **Usar scripts de CI/CD**

Exemplo de cron job (Linux/macOS):
```bash
# Backup diário às 2:00 AM
0 2 * * * cd /caminho/para/projeto && node scripts/backup-completo.js
```

## 🔐 Segurança

- ⚠️ **Nunca commite backups no Git** (já incluído no .gitignore)
- 🔒 **Armazene backups em local seguro**
- 🔑 **Considere criptografar backups sensíveis**
- 📝 **Documente onde estão os backups**

## 📞 Suporte

Se encontrar problemas:

1. Verifique os logs de erro
2. Confirme que o Supabase CLI está atualizado
3. Teste a conexão com `supabase status`
4. Verifique as permissões do projeto