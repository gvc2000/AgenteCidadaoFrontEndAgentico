-- =====================================================
-- MIGRATION: Sistema de Cache de Respostas
-- Criado em: 2025-12-12
-- Descrição: Cache para reduzir custos e tempo de resposta
-- =====================================================

-- Tabela principal de cache
CREATE TABLE IF NOT EXISTS response_cache (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),

  -- Query original e hash para busca rápida
  query TEXT NOT NULL,
  query_hash VARCHAR(64) UNIQUE NOT NULL,

  -- Resposta armazenada
  response TEXT NOT NULL,

  -- Metadados
  model VARCHAR(50),
  agents_used TEXT[], -- Array com nomes dos agentes que responderam

  -- Timestamps
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  expires_at TIMESTAMP WITH TIME ZONE NOT NULL,
  last_accessed_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),

  -- Métricas de uso
  hit_count INTEGER DEFAULT 0,

  -- Dados adicionais (JSON flexível)
  metadata JSONB DEFAULT '{}'::jsonb
);

-- Índices para performance
CREATE INDEX IF NOT EXISTS idx_cache_hash ON response_cache(query_hash);
CREATE INDEX IF NOT EXISTS idx_cache_expires ON response_cache(expires_at);
CREATE INDEX IF NOT EXISTS idx_cache_created ON response_cache(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_cache_hit_count ON response_cache(hit_count DESC);

-- Índice GIN para busca no metadata JSONB
CREATE INDEX IF NOT EXISTS idx_cache_metadata ON response_cache USING GIN (metadata);

-- Comentários para documentação
COMMENT ON TABLE response_cache IS 'Cache de respostas do sistema multi-agente para reduzir custos e melhorar performance';
COMMENT ON COLUMN response_cache.query_hash IS 'Hash SHA-256 da query normalizada (lowercase, sem acentos)';
COMMENT ON COLUMN response_cache.hit_count IS 'Número de vezes que este cache foi utilizado';
COMMENT ON COLUMN response_cache.expires_at IS 'Data de expiração do cache (TTL variável por tipo)';
COMMENT ON COLUMN response_cache.agents_used IS 'Array com nomes dos agentes que foram acionados nesta resposta';

-- =====================================================
-- FUNÇÃO: Incrementar contador de hits
-- =====================================================
CREATE OR REPLACE FUNCTION increment_cache_hit(cache_id UUID)
RETURNS void AS $$
BEGIN
  UPDATE response_cache
  SET
    hit_count = hit_count + 1,
    last_accessed_at = NOW()
  WHERE id = cache_id;
END;
$$ LANGUAGE plpgsql;

-- =====================================================
-- FUNÇÃO: Buscar cache válido por hash
-- =====================================================
CREATE OR REPLACE FUNCTION get_valid_cache(p_query_hash VARCHAR(64))
RETURNS TABLE (
  id UUID,
  query TEXT,
  response TEXT,
  agents_used TEXT[],
  hit_count INTEGER,
  created_at TIMESTAMP WITH TIME ZONE
) AS $$
BEGIN
  RETURN QUERY
  SELECT
    rc.id,
    rc.query,
    rc.response,
    rc.agents_used,
    rc.hit_count,
    rc.created_at
  FROM response_cache rc
  WHERE
    rc.query_hash = p_query_hash
    AND rc.expires_at > NOW()
  LIMIT 1;
END;
$$ LANGUAGE plpgsql;

-- =====================================================
-- FUNÇÃO: Limpar cache expirado
-- =====================================================
CREATE OR REPLACE FUNCTION cleanup_expired_cache()
RETURNS TABLE (
  deleted_count INTEGER
) AS $$
DECLARE
  count INTEGER;
BEGIN
  DELETE FROM response_cache
  WHERE expires_at < NOW();

  GET DIAGNOSTICS count = ROW_COUNT;

  RETURN QUERY SELECT count;
END;
$$ LANGUAGE plpgsql;

-- =====================================================
-- FUNÇÃO: Estatísticas do cache
-- =====================================================
CREATE OR REPLACE FUNCTION cache_stats()
RETURNS TABLE (
  total_entries INTEGER,
  total_hits BIGINT,
  avg_hit_count NUMERIC,
  most_hit_query TEXT,
  max_hits INTEGER,
  expired_entries INTEGER
) AS $$
BEGIN
  RETURN QUERY
  SELECT
    COUNT(*)::INTEGER AS total_entries,
    SUM(hit_count)::BIGINT AS total_hits,
    AVG(hit_count)::NUMERIC AS avg_hit_count,
    (SELECT query FROM response_cache ORDER BY hit_count DESC LIMIT 1) AS most_hit_query,
    MAX(hit_count)::INTEGER AS max_hits,
    (SELECT COUNT(*)::INTEGER FROM response_cache WHERE expires_at < NOW()) AS expired_entries
  FROM response_cache;
END;
$$ LANGUAGE plpgsql;

-- =====================================================
-- RLS (Row Level Security) - Desabilitado para cache
-- =====================================================
-- Cache é público, não precisa de RLS
ALTER TABLE response_cache ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Cache é público para leitura"
ON response_cache FOR SELECT
TO public
USING (true);

CREATE POLICY "Cache é público para inserção"
ON response_cache FOR INSERT
TO public
WITH CHECK (true);

-- =====================================================
-- GRANTS de permissões
-- =====================================================
GRANT SELECT, INSERT ON response_cache TO anon;
GRANT SELECT, INSERT ON response_cache TO authenticated;
GRANT ALL ON response_cache TO service_role;

-- =====================================================
-- Dados iniciais (opcional)
-- =====================================================
-- Nenhum dado inicial necessário

-- =====================================================
-- ROLLBACK (caso necessário)
-- =====================================================
-- DROP FUNCTION IF EXISTS increment_cache_hit(UUID);
-- DROP FUNCTION IF EXISTS get_valid_cache(VARCHAR);
-- DROP FUNCTION IF EXISTS cleanup_expired_cache();
-- DROP FUNCTION IF EXISTS cache_stats();
-- DROP TABLE IF EXISTS response_cache CASCADE;
