-- ============================================================
-- MIGRATION: Memória Conversacional
-- Arquivo: migrations/001_memoria_conversacional.sql
-- Data: 05/01/2026
-- ============================================================
-- INSTRUÇÕES:
-- 1. Copie TODO o conteúdo deste arquivo
-- 2. Cole no SQL Editor do Supabase
-- 3. Clique em "Run"
-- 4. Verifique se executou sem erros
-- ============================================================

-- ========================================
-- 1. CRIAR TABELA: conversations
-- ========================================
CREATE TABLE IF NOT EXISTS conversations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  session_id VARCHAR(100) NOT NULL,
  title TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  expires_at TIMESTAMPTZ DEFAULT (NOW() + INTERVAL '30 days'),
  metadata JSONB DEFAULT '{}'
);

-- Índices para busca
CREATE INDEX IF NOT EXISTS idx_conv_session ON conversations(session_id);
CREATE INDEX IF NOT EXISTS idx_conv_expires ON conversations(expires_at);
CREATE INDEX IF NOT EXISTS idx_conv_updated ON conversations(updated_at DESC);

-- NOTA: Não criamos índice parcial com NOW() pois não é IMMUTABLE
-- A lógica de sessão única será tratada no código da aplicação

-- ========================================
-- 2. CRIAR TABELA: messages
-- ========================================
CREATE TABLE IF NOT EXISTS messages (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  conversation_id UUID REFERENCES conversations(id) ON DELETE CASCADE,
  request_id UUID REFERENCES requests(id),
  role VARCHAR(20) NOT NULL CHECK (role IN ('user', 'assistant', 'system')),
  content TEXT NOT NULL,
  entities JSONB DEFAULT '[]',
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Índices para performance
CREATE INDEX IF NOT EXISTS idx_msg_conv ON messages(conversation_id, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_msg_entities ON messages USING GIN (entities);

-- ========================================
-- 3. MODIFICAR TABELA: requests
-- ========================================
ALTER TABLE requests 
  ADD COLUMN IF NOT EXISTS conversation_id UUID REFERENCES conversations(id),
  ADD COLUMN IF NOT EXISTS context JSONB DEFAULT '{}';

-- Índice para busca por conversa
CREATE INDEX IF NOT EXISTS idx_req_conv ON requests(conversation_id);

-- ========================================
-- 4. CRIAR TRIGGER: Atualizar timestamps
-- ========================================
CREATE OR REPLACE FUNCTION update_conversation_timestamp()
RETURNS TRIGGER AS $$
BEGIN
  UPDATE conversations
  SET 
    updated_at = NOW(),
    expires_at = NOW() + INTERVAL '30 days'
  WHERE id = NEW.conversation_id;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trigger_update_conv_on_message ON messages;
CREATE TRIGGER trigger_update_conv_on_message
AFTER INSERT ON messages
FOR EACH ROW
EXECUTE FUNCTION update_conversation_timestamp();

-- ========================================
-- 5. HABILITAR RLS (Row Level Security)
-- ========================================
ALTER TABLE conversations ENABLE ROW LEVEL SECURITY;
ALTER TABLE messages ENABLE ROW LEVEL SECURITY;

-- Política: acesso por session_id (ou liberar se não houver header)
CREATE POLICY "Users can only access their own conversations"
ON conversations
FOR ALL
USING (
  session_id = COALESCE(
    current_setting('request.headers', true)::json->>'x-session-id',
    session_id
  )
);

CREATE POLICY "Users can only access messages from their conversations"
ON messages
FOR ALL
USING (
  conversation_id IN (
    SELECT id FROM conversations 
    WHERE session_id = COALESCE(
      current_setting('request.headers', true)::json->>'x-session-id',
      session_id
    )
  )
);

-- ========================================
-- 6. VERIFICAÇÃO FINAL
-- ========================================
-- Execute esta query para confirmar que tudo foi criado:

SELECT 'VERIFICAÇÃO' as status;

SELECT table_name 
FROM information_schema.tables 
WHERE table_schema = 'public' 
  AND table_name IN ('conversations', 'messages')
ORDER BY table_name;
-- Deve retornar: conversations, messages

SELECT column_name, data_type 
FROM information_schema.columns 
WHERE table_name = 'requests' 
  AND column_name IN ('conversation_id', 'context')
ORDER BY column_name;
-- Deve retornar: context (jsonb), conversation_id (uuid)
