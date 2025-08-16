#!/usr/bin/env node

const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');

// Configurações
const PROJECT_ID = 'gulysdbrpzrfcvsaaare';
const BACKUP_DIR = './backups';

// Tabelas identificadas no projeto
const TABLES = [
  'companies', 'stock_movements', 'units', 'company_users', 
  'user_roles', 'standard_lists', 'categories', 'standard_list_items', 
  'items', 'profiles'
];

// Criar diretório de backup se não existir
if (!fs.existsSync(BACKUP_DIR)) {
  fs.mkdirSync(BACKUP_DIR, { recursive: true });
}

const timestamp = new Date().toISOString().replace(/[:.]/g, '-').slice(0, -5);
const backupFolder = `${BACKUP_DIR}/backup_${timestamp}`;

if (!fs.existsSync(backupFolder)) {
  fs.mkdirSync(backupFolder, { recursive: true });
}

console.log('🚀 Iniciando backup completo do Supabase...');
console.log(`📁 Pasta de backup: ${backupFolder}`);

try {
  // 1. Backup do schema completo (estrutura + políticas + funções + triggers)
  console.log('📋 Fazendo backup do schema completo...');
  execSync(`supabase db dump --schema public --schema auth > ${backupFolder}/schema_completo.sql`);
  
  // 2. Backup apenas das políticas RLS
  console.log('🔒 Fazendo backup das políticas RLS...');
  execSync(`supabase db dump --schema public --data-only --exclude-table-data="*" > ${backupFolder}/apenas_estrutura.sql`);
  
  // 3. Backup dos dados por tabela (para facilitar restore seletivo)
  console.log('💾 Fazendo backup dos dados por tabela...');
  const dataFolder = `${backupFolder}/dados_por_tabela`;
  if (!fs.existsSync(dataFolder)) {
    fs.mkdirSync(dataFolder, { recursive: true });
  }
  
  TABLES.forEach(table => {
    try {
      console.log(`  📊 Backup da tabela: ${table}`);
      execSync(`supabase db dump --data-only --table public.${table} > ${dataFolder}/${table}.sql`);
    } catch (error) {
      console.warn(`  ⚠️ Aviso: Não foi possível fazer backup da tabela ${table}: ${error.message}`);
    }
  });
  
  // 4. Backup completo de dados (todas as tabelas)
  console.log('💾 Fazendo backup completo dos dados...');
  execSync(`supabase db dump --data-only --schema public > ${backupFolder}/dados_completos.sql`);
  
  // 5. Backup das migrações
  console.log('🔄 Copiando migrações...');
  execSync(`xcopy supabase\\migrations ${backupFolder}\\migrations\\ /E /I /Q`);
  
  // 6. Backup da configuração
  console.log('⚙️ Copiando configuração...');
  fs.copyFileSync('supabase/config.toml', `${backupFolder}/config.toml`);
  
  // 7. Backup das funções e triggers (se existirem)
  console.log('⚡ Fazendo backup de funções e triggers...');
  try {
    execSync(`supabase db dump --schema public --schema-only --exclude-table-data="*" > ${backupFolder}/funcoes_triggers.sql`);
  } catch (error) {
    console.warn('⚠️ Aviso: Não foi possível fazer backup de funções/triggers');
  }
  
  // 8. Criar script de restore
  const restoreScript = `-- SCRIPT DE RESTORE COMPLETO
-- Gerado em: ${new Date().toISOString()}
-- Projeto: ${PROJECT_ID}

-- INSTRUÇÕES DE RESTORE:

-- 1. RESTORE COMPLETO (recomendado para novo ambiente):
-- supabase db reset
-- psql -d sua_database < schema_completo.sql
-- psql -d sua_database < dados_completos.sql

-- 2. RESTORE SELETIVO POR TABELA:
-- psql -d sua_database < schema_completo.sql
-- Depois, para cada tabela:
-- psql -d sua_database < dados_por_tabela/nome_da_tabela.sql

-- 3. RESTORE APENAS ESTRUTURA (sem dados):
-- psql -d sua_database < schema_completo.sql

-- 4. RESTORE USANDO SUPABASE CLI:
-- supabase db reset
-- supabase db push (aplica migrações)
-- psql -d sua_database < dados_completos.sql

-- TABELAS INCLUÍDAS NO BACKUP:
${TABLES.map(table => `-- - ${table}`).join('\n')}

-- POLÍTICAS RLS: ✅ Incluídas no schema_completo.sql
-- FUNÇÕES: ✅ Incluídas no funcoes_triggers.sql
-- TRIGGERS: ✅ Incluídas no funcoes_triggers.sql
-- MIGRAÇÕES: ✅ Copiadas para pasta migrations/
`;
  
  fs.writeFileSync(`${backupFolder}/INSTRUCOES_RESTORE.txt`, restoreScript);
  
  // 9. Criar resumo do backup
  const resumo = {
    timestamp: new Date().toISOString(),
    project_id: PROJECT_ID,
    tabelas_backup: TABLES,
    arquivos_gerados: [
      'schema_completo.sql - Estrutura completa + políticas',
      'dados_completos.sql - Todos os dados',
      'dados_por_tabela/ - Dados separados por tabela',
      'funcoes_triggers.sql - Funções e triggers',
      'migrations/ - Todas as migrações',
      'config.toml - Configuração do projeto',
      'INSTRUCOES_RESTORE.txt - Como restaurar'
    ],
    tamanho_estimado: 'Calculando...'
  };
  
  fs.writeFileSync(`${backupFolder}/resumo_backup.json`, JSON.stringify(resumo, null, 2));
  
  console.log('✅ Backup completo concluído com sucesso!');
  console.log(`📁 Arquivos salvos em: ${backupFolder}`);
  console.log(`📋 Resumo: ${backupFolder}/resumo_backup.json`);
  console.log(`📖 Instruções: ${backupFolder}/INSTRUCOES_RESTORE.txt`);
  
  // Mostrar tamanho dos arquivos
  console.log('\n📊 Arquivos gerados:');
  const files = fs.readdirSync(backupFolder);
  files.forEach(file => {
    const filePath = path.join(backupFolder, file);
    const stats = fs.statSync(filePath);
    if (stats.isFile()) {
      const sizeKB = (stats.size / 1024).toFixed(2);
      console.log(`  - ${file}: ${sizeKB} KB`);
    }
  });
  
} catch (error) {
  console.error('❌ Erro durante o backup:', error.message);
  console.error('💡 Dicas:');
  console.error('  - Verifique se o Supabase CLI está instalado e configurado');
  console.error('  - Execute: supabase login');
  console.error('  - Verifique se está no diretório correto do projeto');
  process.exit(1);
}