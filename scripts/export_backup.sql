-- ============================================
-- SCRIPT DE BACKUP MANUAL VIA SQL EDITOR
-- Execute no Supabase Dashboard → SQL Editor
-- ============================================

-- 1. EXPORTAR ESTRUTURA DAS TABELAS (DDL)
-- ============================================

-- Este comando mostra o DDL das tabelas (copie o resultado)
SELECT 
  'CREATE TABLE ' || tablename || ' AS SELECT * FROM ' || tablename || ';'
FROM pg_tables 
WHERE schemaname = 'public';

-- 2. EXPORTAR DADOS COMO INSERT STATEMENTS
-- ============================================

-- Para requests (copie o resultado)
SELECT 
  'INSERT INTO requests (id, created_at, user_query, status, final_response, metadata, content, updated_at) VALUES (' ||
  quote_literal(id) || ', ' ||
  quote_literal(created_at) || ', ' ||
  quote_literal(COALESCE(user_query, '')) || ', ' ||
  quote_literal(COALESCE(status, '')) || ', ' ||
  quote_literal(COALESCE(final_response, '')) || ', ' ||
  COALESCE(quote_literal(metadata::text), 'NULL') || ', ' ||
  quote_literal(COALESCE(content, '')) || ', ' ||
  quote_literal(updated_at) || ');'
FROM requests;

-- Para agent_logs (copie o resultado)
SELECT 
  'INSERT INTO agent_logs (id, created_at, request_id, agent_name, agent_id, status, message, details) VALUES (' ||
  quote_literal(id) || ', ' ||
  quote_literal(created_at) || ', ' ||
  quote_literal(request_id) || ', ' ||
  quote_literal(COALESCE(agent_name, '')) || ', ' ||
  quote_literal(COALESCE(agent_id, '')) || ', ' ||
  quote_literal(COALESCE(status, '')) || ', ' ||
  quote_literal(COALESCE(message, '')) || ', ' ||
  COALESCE(quote_literal(details::text), 'NULL') || ');'
FROM agent_logs;

-- 3. CONTAGEM PARA VERIFICAÇÃO
-- ============================================
SELECT 'requests' as tabela, COUNT(*) as total FROM requests
UNION ALL
SELECT 'agent_logs' as tabela, COUNT(*) as total FROM agent_logs;
