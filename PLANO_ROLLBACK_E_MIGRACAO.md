# Plano de Rollback e Migração Segura - Memória Conversacional

**Data:** 14/12/2024
**Versão:** 1.0
**Relacionado a:** PLANO_MEMORIA_CONVERSACIONAL.md

---

## 🎯 Objetivo

Garantir que a implementação da memória conversacional possa ser **revertida a qualquer momento** sem perda de dados ou quebra do sistema em produção.

---

## 📋 Princípios de Migração Segura

### 1. **Compatibilidade Retroativa (Backward Compatibility)**
✅ Sistema antigo continua funcionando durante e após a migração
✅ Dados existentes não são modificados
✅ Novas funcionalidades são aditivas, não destrutivas

### 2. **Migração Incremental**
✅ Deploy em fases pequenas e testáveis
✅ Possibilidade de pausar entre fases
✅ Feature flags para ativar/desativar funcionalidades

### 3. **Dados Preservados**
✅ Backup automático antes de cada migração
✅ Tabelas antigas mantidas durante período de transição
✅ Logs de auditoria de todas as mudanças

---

## 🗂️ Estrutura de Migrations

### Convenção de Nomenclatura

```
supabase/migrations/
├── 20241214000001_add_conversation_tables.sql          # UP: Criar tabelas
├── 20241214000001_add_conversation_tables_down.sql     # DOWN: Reverter
├── 20241214000002_add_rls_policies.sql                 # UP: Adicionar RLS
├── 20241214000002_add_rls_policies_down.sql            # DOWN: Remover RLS
├── 20241214000003_alter_requests_table.sql             # UP: Modificar requests
├── 20241214000003_alter_requests_table_down.sql        # DOWN: Reverter requests
└── 20241214000004_add_helper_functions.sql             # UP: Funções auxiliares
    └── 20241214000004_add_helper_functions_down.sql    # DOWN: Remover funções
```

---

## 📦 Migration #1: Criar Tabelas Novas

### UP Migration: `20241214000001_add_conversation_tables.sql`

```sql
-- ============================================
-- Migration: Adicionar Tabelas de Conversação
-- Data: 2024-12-14
-- Versão: 1.0
-- Descrição: Criar tabelas conversations e messages
-- ============================================

-- PASSO 1: Criar tabela conversations
CREATE TABLE IF NOT EXISTS conversations (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  session_id VARCHAR(100) UNIQUE NOT NULL,
  user_id UUID,
  title TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  last_message_at TIMESTAMPTZ,
  metadata JSONB DEFAULT '{}'
);

-- Comentários para documentação
COMMENT ON TABLE conversations IS 'Agrupa mensagens relacionadas em uma conversa';
COMMENT ON COLUMN conversations.session_id IS 'UUID v4 gerado no frontend (localStorage)';
COMMENT ON COLUMN conversations.user_id IS 'Futuro: ID do usuário autenticado';

-- PASSO 2: Criar índices
CREATE INDEX IF NOT EXISTS idx_conv_session ON conversations(session_id);
CREATE INDEX IF NOT EXISTS idx_conv_updated ON conversations(updated_at DESC);
CREATE INDEX IF NOT EXISTS idx_conv_user ON conversations(user_id) WHERE user_id IS NOT NULL;

-- PASSO 3: Criar tabela messages
CREATE TABLE IF NOT EXISTS messages (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  conversation_id UUID NOT NULL REFERENCES conversations(id) ON DELETE CASCADE,
  request_id UUID REFERENCES requests(id) ON DELETE SET NULL,
  role VARCHAR(20) NOT NULL CHECK (role IN ('user', 'assistant', 'system')),
  content TEXT NOT NULL,
  entities JSONB DEFAULT '[]',
  created_at TIMESTAMPTZ DEFAULT NOW()
);

COMMENT ON TABLE messages IS 'Histórico completo de mensagens da conversa';
COMMENT ON COLUMN messages.entities IS 'Array JSON de entidades extraídas (deputados, PLs, etc)';

-- PASSO 4: Criar índices para messages
CREATE INDEX IF NOT EXISTS idx_msg_conv ON messages(conversation_id, created_at);
CREATE INDEX IF NOT EXISTS idx_msg_request ON messages(request_id) WHERE request_id IS NOT NULL;
CREATE INDEX IF NOT EXISTS idx_msg_entities ON messages USING GIN (entities);

-- PASSO 5: Verificação pós-criação
DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_tables WHERE tablename = 'conversations') THEN
    RAISE EXCEPTION 'Falha ao criar tabela conversations';
  END IF;

  IF NOT EXISTS (SELECT 1 FROM pg_tables WHERE tablename = 'messages') THEN
    RAISE EXCEPTION 'Falha ao criar tabela messages';
  END IF;

  RAISE NOTICE 'Migration 001 aplicada com sucesso!';
END $$;
```

### DOWN Migration: `20241214000001_add_conversation_tables_down.sql`

```sql
-- ============================================
-- ROLLBACK Migration 001
-- ⚠️ ATENÇÃO: Esta operação remove dados!
-- ============================================

-- PASSO 1: Backup de segurança (antes de deletar)
DO $$
BEGIN
  -- Criar tabela de backup se houver dados
  IF EXISTS (SELECT 1 FROM conversations LIMIT 1) THEN
    EXECUTE 'CREATE TABLE IF NOT EXISTS conversations_backup_' ||
            to_char(NOW(), 'YYYYMMDD_HH24MISS') ||
            ' AS SELECT * FROM conversations';

    RAISE NOTICE 'Backup criado: conversations_backup_%',
                 to_char(NOW(), 'YYYYMMDD_HH24MISS');
  END IF;

  IF EXISTS (SELECT 1 FROM messages LIMIT 1) THEN
    EXECUTE 'CREATE TABLE IF NOT EXISTS messages_backup_' ||
            to_char(NOW(), 'YYYYMMDD_HH24MISS') ||
            ' AS SELECT * FROM messages';

    RAISE NOTICE 'Backup criado: messages_backup_%',
                 to_char(NOW(), 'YYYYMMDD_HH24MISS');
  END IF;
END $$;

-- PASSO 2: Remover índices
DROP INDEX IF EXISTS idx_msg_entities;
DROP INDEX IF EXISTS idx_msg_request;
DROP INDEX IF EXISTS idx_msg_conv;
DROP INDEX IF EXISTS idx_conv_user;
DROP INDEX IF EXISTS idx_conv_updated;
DROP INDEX IF EXISTS idx_conv_session;

-- PASSO 3: Remover tabelas (CASCADE remove dependências)
DROP TABLE IF EXISTS messages CASCADE;
DROP TABLE IF EXISTS conversations CASCADE;

-- PASSO 4: Verificação pós-remoção
DO $$
BEGIN
  IF EXISTS (SELECT 1 FROM pg_tables WHERE tablename = 'conversations') THEN
    RAISE EXCEPTION 'Falha ao remover tabela conversations';
  END IF;

  IF EXISTS (SELECT 1 FROM pg_tables WHERE tablename = 'messages') THEN
    RAISE EXCEPTION 'Falha ao remover tabela messages';
  END IF;

  RAISE NOTICE 'Rollback Migration 001 concluído. Tabelas removidas.';
  RAISE NOTICE 'Backups disponíveis: conversations_backup_* e messages_backup_*';
END $$;
```

---

## 📦 Migration #2: Adicionar RLS (Row Level Security)

### UP Migration: `20241214000002_add_rls_policies.sql`

```sql
-- ============================================
-- Migration: Adicionar Row Level Security
-- Data: 2024-12-14
-- Versão: 1.0
-- ============================================

-- PASSO 1: Habilitar RLS nas tabelas
ALTER TABLE conversations ENABLE ROW LEVEL SECURITY;
ALTER TABLE messages ENABLE ROW LEVEL SECURITY;

-- PASSO 2: Políticas para conversations
-- SELECT
CREATE POLICY "Users can view own conversations"
ON conversations
FOR SELECT
USING (
  session_id = current_setting('request.headers', true)::json->>'x-session-id'
  OR (auth.uid() IS NOT NULL AND user_id = auth.uid())
);

-- INSERT
CREATE POLICY "Users can insert own conversations"
ON conversations
FOR INSERT
WITH CHECK (
  session_id = current_setting('request.headers', true)::json->>'x-session-id'
  OR (auth.uid() IS NOT NULL AND user_id = auth.uid())
);

-- UPDATE
CREATE POLICY "Users can update own conversations"
ON conversations
FOR UPDATE
USING (
  session_id = current_setting('request.headers', true)::json->>'x-session-id'
  OR (auth.uid() IS NOT NULL AND user_id = auth.uid())
);

-- DELETE
CREATE POLICY "Users can delete own conversations"
ON conversations
FOR DELETE
USING (
  session_id = current_setting('request.headers', true)::json->>'x-session-id'
  OR (auth.uid() IS NOT NULL AND user_id = auth.uid())
);

-- PASSO 3: Políticas para messages
CREATE POLICY "Users can view messages of own conversations"
ON messages
FOR SELECT
USING (
  conversation_id IN (
    SELECT id FROM conversations
    WHERE session_id = current_setting('request.headers', true)::json->>'x-session-id'
    OR (auth.uid() IS NOT NULL AND user_id = auth.uid())
  )
);

CREATE POLICY "Users can insert messages in own conversations"
ON messages
FOR INSERT
WITH CHECK (
  conversation_id IN (
    SELECT id FROM conversations
    WHERE session_id = current_setting('request.headers', true)::json->>'x-session-id'
    OR (auth.uid() IS NOT NULL AND user_id = auth.uid())
  )
);

-- PASSO 4: Verificação
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies
    WHERE tablename = 'conversations'
    AND policyname = 'Users can view own conversations'
  ) THEN
    RAISE EXCEPTION 'Falha ao criar políticas RLS';
  END IF;

  RAISE NOTICE 'RLS habilitado com sucesso!';
END $$;
```

### DOWN Migration: `20241214000002_add_rls_policies_down.sql`

```sql
-- ============================================
-- ROLLBACK Migration 002: Remover RLS
-- ============================================

-- PASSO 1: Remover políticas de conversations
DROP POLICY IF EXISTS "Users can delete own conversations" ON conversations;
DROP POLICY IF EXISTS "Users can update own conversations" ON conversations;
DROP POLICY IF EXISTS "Users can insert own conversations" ON conversations;
DROP POLICY IF EXISTS "Users can view own conversations" ON conversations;

-- PASSO 2: Remover políticas de messages
DROP POLICY IF EXISTS "Users can insert messages in own conversations" ON messages;
DROP POLICY IF EXISTS "Users can view messages of own conversations" ON messages;

-- PASSO 3: Desabilitar RLS
ALTER TABLE messages DISABLE ROW LEVEL SECURITY;
ALTER TABLE conversations DISABLE ROW LEVEL SECURITY;

-- PASSO 4: Verificação
DO $$
BEGIN
  RAISE NOTICE 'RLS removido com sucesso!';
  RAISE WARNING '⚠️ ATENÇÃO: Tabelas agora acessíveis sem restrições!';
END $$;
```

---

## 📦 Migration #3: Modificar Tabela Requests

### UP Migration: `20241214000003_alter_requests_table.sql`

```sql
-- ============================================
-- Migration: Adicionar campos à tabela requests
-- Data: 2024-12-14
-- Versão: 1.0
-- ============================================

-- PASSO 1: Adicionar colunas (se não existirem)
ALTER TABLE requests
  ADD COLUMN IF NOT EXISTS conversation_id UUID REFERENCES conversations(id) ON DELETE SET NULL,
  ADD COLUMN IF NOT EXISTS context JSONB DEFAULT '{}';

-- PASSO 2: Comentários
COMMENT ON COLUMN requests.conversation_id IS 'FK para a conversa à qual este request pertence';
COMMENT ON COLUMN requests.context IS 'Contexto da conversa (histórico, entidades)';

-- PASSO 3: Criar índice
CREATE INDEX IF NOT EXISTS idx_req_conv ON requests(conversation_id)
WHERE conversation_id IS NOT NULL;

-- PASSO 4: Migrar dados existentes (opcional - criar conversas retroativas)
DO $$
DECLARE
  req RECORD;
  new_conv_id UUID;
BEGIN
  -- Criar uma conversa para cada request antigo sem conversation_id
  FOR req IN
    SELECT id, user_query, created_at
    FROM requests
    WHERE conversation_id IS NULL
    LIMIT 1000 -- Processar em lotes
  LOOP
    -- Criar conversa única para request antigo
    INSERT INTO conversations (session_id, title, created_at)
    VALUES (
      'legacy_' || req.id::text,  -- Session ID sintético
      LEFT(req.user_query, 100),  -- Título = primeiras 100 chars
      req.created_at
    )
    RETURNING id INTO new_conv_id;

    -- Vincular request à nova conversa
    UPDATE requests
    SET conversation_id = new_conv_id
    WHERE id = req.id;

    -- Criar mensagem do usuário
    INSERT INTO messages (conversation_id, request_id, role, content, created_at)
    VALUES (new_conv_id, req.id, 'user', req.user_query, req.created_at);
  END LOOP;

  RAISE NOTICE 'Migração de requests antigos concluída';
END $$;

-- PASSO 5: Verificação
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'requests'
    AND column_name = 'conversation_id'
  ) THEN
    RAISE EXCEPTION 'Falha ao adicionar coluna conversation_id';
  END IF;

  RAISE NOTICE 'Migration 003 aplicada com sucesso!';
END $$;
```

### DOWN Migration: `20241214000003_alter_requests_table_down.sql`

```sql
-- ============================================
-- ROLLBACK Migration 003: Reverter requests
-- ⚠️ ATENÇÃO: Remove colunas adicionadas
-- ============================================

-- PASSO 1: Backup de dados (se houver)
DO $$
BEGIN
  IF EXISTS (
    SELECT 1 FROM requests
    WHERE conversation_id IS NOT NULL
    OR context != '{}'
    LIMIT 1
  ) THEN
    EXECUTE 'CREATE TABLE IF NOT EXISTS requests_context_backup_' ||
            to_char(NOW(), 'YYYYMMDD_HH24MISS') ||
            ' AS SELECT id, conversation_id, context FROM requests ' ||
            'WHERE conversation_id IS NOT NULL OR context != ''{}''';

    RAISE NOTICE 'Backup criado: requests_context_backup_%',
                 to_char(NOW(), 'YYYYMMDD_HH24MISS');
  END IF;
END $$;

-- PASSO 2: Remover índice
DROP INDEX IF EXISTS idx_req_conv;

-- PASSO 3: Remover colunas
ALTER TABLE requests
  DROP COLUMN IF EXISTS context,
  DROP COLUMN IF EXISTS conversation_id;

-- PASSO 4: Verificação
DO $$
BEGIN
  IF EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'requests'
    AND column_name = 'conversation_id'
  ) THEN
    RAISE EXCEPTION 'Falha ao remover coluna conversation_id';
  END IF;

  RAISE NOTICE 'Rollback Migration 003 concluído';
  RAISE NOTICE 'Backup disponível: requests_context_backup_*';
END $$;
```

---

## 📦 Migration #4: Funções Auxiliares

### UP Migration: `20241214000004_add_helper_functions.sql`

```sql
-- ============================================
-- Migration: Adicionar Funções Auxiliares
-- Data: 2024-12-14
-- ============================================

-- FUNÇÃO 1: Atualizar timestamp da conversa
CREATE OR REPLACE FUNCTION update_conversation_timestamp()
RETURNS TRIGGER AS $$
BEGIN
  UPDATE conversations
  SET updated_at = NOW(), last_message_at = NOW()
  WHERE id = NEW.conversation_id;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- TRIGGER para atualizar timestamp
DROP TRIGGER IF EXISTS trigger_update_conv_on_message ON messages;
CREATE TRIGGER trigger_update_conv_on_message
AFTER INSERT ON messages
FOR EACH ROW
EXECUTE FUNCTION update_conversation_timestamp();

-- FUNÇÃO 2: Obter contexto da conversa
CREATE OR REPLACE FUNCTION get_conversation_context(
  conv_id UUID,
  limit_msgs INTEGER DEFAULT 10
)
RETURNS JSON AS $$
DECLARE
  result JSON;
BEGIN
  SELECT json_build_object(
    'conversation_id', conv_id,
    'recent_messages', (
      SELECT json_agg(
        json_build_object(
          'role', role,
          'content', content,
          'created_at', created_at
        ) ORDER BY created_at DESC
      )
      FROM (
        SELECT role, content, created_at
        FROM messages
        WHERE conversation_id = conv_id
        ORDER BY created_at DESC
        LIMIT limit_msgs
      ) recent
    ),
    'entities', (
      SELECT json_agg(DISTINCT entity)
      FROM messages m,
      LATERAL json_array_elements(m.entities) AS entity
      WHERE m.conversation_id = conv_id
    )
  ) INTO result;

  RETURN result;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- FUNÇÃO 3: Limpar conversas antigas (manutenção)
CREATE OR REPLACE FUNCTION cleanup_old_conversations(days_old INTEGER DEFAULT 90)
RETURNS TABLE(deleted_count BIGINT) AS $$
DECLARE
  count_deleted BIGINT;
BEGIN
  DELETE FROM conversations
  WHERE last_message_at < NOW() - INTERVAL '1 day' * days_old
  OR (last_message_at IS NULL AND created_at < NOW() - INTERVAL '1 day' * days_old);

  GET DIAGNOSTICS count_deleted = ROW_COUNT;

  RETURN QUERY SELECT count_deleted;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

COMMENT ON FUNCTION cleanup_old_conversations IS
'Remove conversas sem atividade há X dias (padrão: 90)';

-- Verificação
DO $$
BEGIN
  RAISE NOTICE 'Funções auxiliares criadas com sucesso!';
END $$;
```

### DOWN Migration: `20241214000004_add_helper_functions_down.sql`

```sql
-- ============================================
-- ROLLBACK Migration 004: Remover Funções
-- ============================================

-- Remover trigger
DROP TRIGGER IF EXISTS trigger_update_conv_on_message ON messages;

-- Remover funções
DROP FUNCTION IF EXISTS cleanup_old_conversations(INTEGER);
DROP FUNCTION IF EXISTS get_conversation_context(UUID, INTEGER);
DROP FUNCTION IF EXISTS update_conversation_timestamp();

RAISE NOTICE 'Funções auxiliares removidas';
```

---

## 🔄 Estratégia de Deploy

### Fase 1: Deploy Backend (Supabase)

```bash
#!/bin/bash
# deploy_migrations.sh

set -e  # Parar em caso de erro

echo "🚀 Iniciando deploy de migrations..."

# 1. Backup completo do banco
echo "📦 Criando backup..."
supabase db dump -f backup_$(date +%Y%m%d_%H%M%S).sql

# 2. Aplicar migrations em ordem
echo "📝 Aplicando migrations..."

supabase migration up 20241214000001_add_conversation_tables.sql
echo "✅ Migration 001 aplicada"

supabase migration up 20241214000002_add_rls_policies.sql
echo "✅ Migration 002 aplicada (RLS)"

supabase migration up 20241214000003_alter_requests_table.sql
echo "✅ Migration 003 aplicada"

supabase migration up 20241214000004_add_helper_functions.sql
echo "✅ Migration 004 aplicada"

echo "🎉 Deploy concluído!"
```

### Fase 2: Deploy Frontend (Feature Flag)

```typescript
// src/config/featureFlags.ts

export const FEATURE_FLAGS = {
  CONVERSATION_MEMORY: {
    enabled: process.env.VITE_ENABLE_CONVERSATION_MEMORY === 'true',
    rolloutPercentage: parseInt(process.env.VITE_MEMORY_ROLLOUT_PERCENT || '0'),
  }
};

// src/App.tsx
import { FEATURE_FLAGS } from './config/featureFlags';

function MainApp() {
  const [useConversationMemory] = useState(() => {
    // Rollout gradual: X% dos usuários
    const randomPercent = Math.random() * 100;
    return FEATURE_FLAGS.CONVERSATION_MEMORY.enabled &&
           randomPercent < FEATURE_FLAGS.CONVERSATION_MEMORY.rolloutPercentage;
  });

  if (useConversationMemory) {
    // Usar novo sistema com memória
    return <MainAppWithMemory />;
  } else {
    // Sistema antigo (compatibilidade)
    return <MainAppLegacy />;
  }
}
```

**Rollout Gradual:**
```bash
# Dia 1: 10% dos usuários
VITE_ENABLE_CONVERSATION_MEMORY=true
VITE_MEMORY_ROLLOUT_PERCENT=10

# Dia 3: 50% dos usuários
VITE_MEMORY_ROLLOUT_PERCENT=50

# Dia 7: 100% dos usuários
VITE_MEMORY_ROLLOUT_PERCENT=100
```

---

## ⏪ Procedimentos de Rollback

### Rollback Total (Reverter Tudo)

```bash
#!/bin/bash
# rollback_full.sh

set -e

echo "⚠️  ATENÇÃO: Iniciando rollback completo..."
echo "Isso reverterá TODAS as mudanças de memória conversacional"
read -p "Tem certeza? (digite 'SIM' para continuar): " confirm

if [ "$confirm" != "SIM" ]; then
  echo "Rollback cancelado"
  exit 0
fi

# 1. Backup de segurança antes de reverter
echo "📦 Criando backup de segurança..."
supabase db dump -f backup_before_rollback_$(date +%Y%m%d_%H%M%S).sql

# 2. Reverter migrations em ordem REVERSA
echo "🔄 Revertendo migrations..."

supabase migration down 20241214000004_add_helper_functions_down.sql
echo "✅ Funções removidas"

supabase migration down 20241214000003_alter_requests_table_down.sql
echo "✅ Colunas de requests removidas"

supabase migration down 20241214000002_add_rls_policies_down.sql
echo "✅ RLS removido"

supabase migration down 20241214000001_add_conversation_tables_down.sql
echo "✅ Tabelas removidas"

# 3. Desabilitar feature no frontend
echo "🔧 Desabilitando feature flag..."
export VITE_ENABLE_CONVERSATION_MEMORY=false
export VITE_MEMORY_ROLLOUT_PERCENT=0

echo "🎉 Rollback concluído!"
echo "⚠️  Lembre-se de fazer deploy do frontend com feature flag desabilitada"
```

### Rollback Parcial (Apenas Desabilitar Feature)

```bash
#!/bin/bash
# rollback_soft.sh

# Manter banco de dados, apenas desabilitar no frontend
echo "🔧 Desabilitando memória conversacional..."

export VITE_ENABLE_CONVERSATION_MEMORY=false
export VITE_MEMORY_ROLLOUT_PERCENT=0

# Deploy frontend
npm run build
# ... deploy do build

echo "✅ Feature desabilitada. Sistema voltou ao modo legado."
echo "💡 Banco de dados mantido. Para remover tabelas, execute rollback_full.sh"
```

---

## 🧪 Checklist de Rollback

### Antes do Rollback

- [ ] **Exportar dados importantes**
  ```sql
  COPY (SELECT * FROM conversations) TO '/tmp/conversations_export.csv' CSV HEADER;
  COPY (SELECT * FROM messages) TO '/tmp/messages_export.csv' CSV HEADER;
  ```

- [ ] **Verificar dependências**
  ```sql
  SELECT * FROM pg_depend
  WHERE refobjid IN (
    SELECT oid FROM pg_class
    WHERE relname IN ('conversations', 'messages')
  );
  ```

- [ ] **Notificar usuários** (se aplicável)

- [ ] **Criar ponto de restore do banco**
  ```bash
  supabase db dump -f restore_point_$(date +%Y%m%d).sql
  ```

### Durante o Rollback

- [ ] Monitorar logs de erro
- [ ] Verificar integridade de dados
- [ ] Testar fluxo antigo após rollback

### Após o Rollback

- [ ] Confirmar que sistema antigo funciona
- [ ] Arquivar backups (manter por 30 dias)
- [ ] Documentar motivo do rollback
- [ ] Planejar correções (se houver bugs)

---

## 📊 Monitoramento Durante Deploy

### Métricas a Observar

```sql
-- 1. Taxa de adoção (quantos usuários criaram conversas)
SELECT
  COUNT(DISTINCT session_id) as total_sessions,
  COUNT(*) as total_conversations
FROM conversations
WHERE created_at > NOW() - INTERVAL '24 hours';

-- 2. Mensagens por conversa (média)
SELECT
  AVG(msg_count) as avg_messages_per_conversation,
  MAX(msg_count) as max_messages,
  MIN(msg_count) as min_messages
FROM (
  SELECT conversation_id, COUNT(*) as msg_count
  FROM messages
  GROUP BY conversation_id
) stats;

-- 3. Erros de RLS (tentativas de acesso bloqueadas)
-- (Requer configuração de logs)
SELECT COUNT(*) as blocked_attempts
FROM pg_stat_statements
WHERE query LIKE '%violates row-level security%'
AND queryid IN (
  SELECT queryid
  FROM pg_stat_statements
  WHERE calls > 0
  AND query LIKE '%conversations%'
);

-- 4. Performance de queries
SELECT
  query,
  mean_exec_time,
  calls,
  total_exec_time
FROM pg_stat_statements
WHERE query LIKE '%conversations%' OR query LIKE '%messages%'
ORDER BY mean_exec_time DESC
LIMIT 10;
```

### Alertas Críticos

```bash
# Script de monitoramento (executar a cada 5 min)
#!/bin/bash
# monitor_migration.sh

# Alertar se taxa de erro > 5%
error_rate=$(psql -t -c "
  SELECT
    CASE
      WHEN total = 0 THEN 0
      ELSE (errors::float / total) * 100
    END
  FROM (
    SELECT
      COUNT(*) as total,
      COUNT(*) FILTER (WHERE status = 'failed') as errors
    FROM requests
    WHERE created_at > NOW() - INTERVAL '5 minutes'
  ) stats
")

if (( $(echo "$error_rate > 5" | bc -l) )); then
  echo "🚨 ALERTA: Taxa de erro alta: $error_rate%"
  # Enviar notificação (Slack, email, etc)
fi
```

---

## 🔒 Backup e Recuperação

### Estratégia de Backup

```bash
#!/bin/bash
# backup_strategy.sh

# 1. Backup diário automático
0 2 * * * /scripts/daily_backup.sh

# daily_backup.sh
#!/bin/bash
DATE=$(date +%Y%m%d)
supabase db dump -f /backups/daily/backup_$DATE.sql

# Manter últimos 7 dias
find /backups/daily -name "backup_*.sql" -mtime +7 -delete

# 2. Backup antes de migrations (manual)
backup_before_migration() {
  local migration_name=$1
  supabase db dump -f /backups/migrations/before_${migration_name}_$(date +%Y%m%d_%H%M%S).sql
}

# 3. Backup incremental (apenas tabelas novas)
backup_conversation_tables() {
  pg_dump \
    --table=conversations \
    --table=messages \
    --data-only \
    -f /backups/incremental/conversations_$(date +%Y%m%d_%H%M%S).sql
}
```

### Procedimento de Recuperação

```bash
#!/bin/bash
# restore_from_backup.sh

BACKUP_FILE=$1

if [ -z "$BACKUP_FILE" ]; then
  echo "Uso: ./restore_from_backup.sh <arquivo_backup.sql>"
  exit 1
fi

echo "⚠️  ATENÇÃO: Isto substituirá os dados atuais!"
read -p "Arquivo: $BACKUP_FILE. Continuar? (SIM/não): " confirm

if [ "$confirm" != "SIM" ]; then
  echo "Restauração cancelada"
  exit 0
fi

# Restore
psql -f $BACKUP_FILE

echo "✅ Restauração concluída"
```

---

## 📋 Template de Comunicação

### Email para Stakeholders (Deploy)

```
Assunto: [Deploy] Memória Conversacional - Agente Cidadão

Prezados,

Informamos que será realizado deploy da funcionalidade de Memória Conversacional:

📅 Data: [DATA]
⏰ Horário: [HORÁRIO] (horário de menor tráfego)
⏱️ Duração estimada: 30 minutos
🔧 Impacto: Nenhum (backward compatible)

Mudanças:
✅ Usuários poderão fazer perguntas de acompanhamento
✅ Sistema manterá contexto da conversa
✅ Histórico salvo por sessão

Rollout gradual:
- Dia 1: 10% dos usuários
- Dia 3: 50% dos usuários
- Dia 7: 100% dos usuários

Rollback disponível a qualquer momento.

Atenciosamente,
Equipe Técnica
```

### Email para Stakeholders (Rollback)

```
Assunto: [ROLLBACK] Memória Conversacional - Agente Cidadão

Prezados,

Por precaução, foi realizado rollback da funcionalidade de Memória Conversacional.

📅 Data do rollback: [DATA]
⏰ Horário: [HORÁRIO]
✅ Status: Sistema restaurado com sucesso

Motivo: [Descrever motivo técnico]

Sistema voltou ao estado anterior. Nenhum dado de usuário foi perdido.

Nova data de deploy será comunicada após correções.

Atenciosamente,
Equipe Técnica
```

---

## ✅ Checklist Final de Deploy

### Pré-Deploy

- [ ] Todas as migrations testadas em DEV
- [ ] Backups configurados e testados
- [ ] Scripts de rollback testados
- [ ] Feature flags implementadas
- [ ] Monitoramento configurado
- [ ] Equipe notificada
- [ ] Janela de manutenção agendada (se necessário)

### Durante Deploy

- [ ] Backup criado antes de migrations
- [ ] Migrations aplicadas em ordem
- [ ] Testes de sanidade executados
- [ ] Logs monitorados
- [ ] Métricas normais

### Pós-Deploy

- [ ] Sistema funcionando normalmente
- [ ] Nenhum erro crítico nos logs
- [ ] Feature flag habilitada (10% inicialmente)
- [ ] Usuários conseguem usar nova funcionalidade
- [ ] Documentação atualizada
- [ ] Equipe informada do sucesso

### Critérios para Rollback Automático

- ❌ Taxa de erro > 10% nos primeiros 30 minutos
- ❌ Latência de queries > 2x o normal
- ❌ Violações de RLS detectadas
- ❌ Perda de dados detectada
- ❌ Sistema antigo quebrado

---

**Documento preparado por:** Claude Code
**Data:** 14/12/2024
**Versão:** 1.0
**Status:** Pronto para uso
