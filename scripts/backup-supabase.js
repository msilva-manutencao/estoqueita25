#!/usr/bin/env node

const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');

// Configurações
const PROJECT_ID = 'gulysdbrpzrfcvsaaare';
const BACKUP_DIR = './backups';

// Criar diretório de backup se não existir
if (!fs.existsSync(BACKUP_DIR)) {
  fs.mkdirSync(BACKUP_DIR, { recursive: true });
}

const timestamp = new Date().toISOString().replace(/[:.]/g, '-').slice(0, -5);

console.log('🚀 Iniciando backup do Supabase...');

try {
  // 1. Backup do schema completo (estrutura + políticas + funções)
  console.log('📋 Fazendo backup do schema...');
  execSync(`supabase db dump --schema public > ${BACKUP_DIR}/schema_${timestamp}.sql`);
  
  // 2. Backup dos dados
  console.log('💾 Fazendo backup dos dados...');
  execSync(`supabase db dump --data-only --schema public > ${BACKUP_DIR}/data_${timestamp}.sql`);
  
  // 3. Backup das migrações
  console.log('🔄 Copiando migrações...');
  execSync(`xcopy supabase\\migrations ${BACKUP_DIR}\\migrations_${timestamp}\\ /E /I`);
  
  // 4. Backup da configuração
  console.log('⚙️ Copiando configuração...');
  fs.copyFileSync('supabase/config.toml', `${BACKUP_DIR}/config_${timestamp}.toml`);
  
  // 5. Criar arquivo de restore
  const restoreScript = `-- Restore script gerado em ${new Date().toISOString()}
-- Para restaurar:
-- 1. psql -d sua_database < schema_${timestamp}.sql
-- 2. psql -d sua_database < data_${timestamp}.sql

-- Ou usando Supabase CLI:
-- supabase db reset
-- supabase db push
-- psql -d sua_database < data_${timestamp}.sql
`;
  
  fs.writeFileSync(`${BACKUP_DIR}/restore_instructions_${timestamp}.txt`, restoreScript);
  
  console.log('✅ Backup concluído com sucesso!');
  console.log(`📁 Arquivos salvos em: ${BACKUP_DIR}`);
  console.log(`📅 Timestamp: ${timestamp}`);
  
} catch (error) {
  console.error('❌ Erro durante o backup:', error.message);
  process.exit(1);
}