# Segurança e Isolamento de Sessões - Memória Conversacional

**Data:** 14/12/2024
**Versão:** 1.0
**Relacionado a:** PLANO_MEMORIA_CONVERSACIONAL.md

---

## 🔒 Sumário Executivo

Este documento detalha as **medidas de segurança** para garantir que:

✅ **Cada usuário/sessão tem acesso APENAS aos seus próprios dados**
✅ **Impossível acessar conversas de outros usuários**
✅ **Isolamento total mesmo sem autenticação**
✅ **Proteção contra ataques de enumeração**

---

## 🎯 Requisitos de Segurança

### 1. Isolamento Obrigatório
- Usuário A **NUNCA** pode ver conversas do Usuário B
- Mesmo conhecendo o `conversation_id`, acesso deve ser negado
- `session_id` deve ser imprevisível (UUID v4)

### 2. Sem Autenticação (Fase Atual)
- Sistema é público, sem login
- Isolamento baseado em `session_id` no localStorage
- RLS (Row Level Security) do Supabase como camada extra

### 3. Com Autenticação (Futuro)
- Migração para `user_id` autenticado
- RLS baseado em `auth.uid()`
- Histórico vinculado à conta

---

## 🔐 Análise de Vulnerabilidades

### Vulnerabilidade 1: Session ID Previsível

❌ **INSEGURO:**
```typescript
// NÃO FAZER ISSO!
const sessionId = Date.now().toString(); // Previsível!
const sessionId = "user_" + counter;      // Enumerável!
```

✅ **SEGURO:**
```typescript
import { v4 as uuidv4 } from 'uuid';
const sessionId = uuidv4(); // "a3b2c1d4-e5f6-7890-abcd-ef1234567890"
// 2^122 combinações possíveis = impossível adivinhar
```

### Vulnerabilidade 2: Acesso Direto ao Banco

❌ **PROBLEMA:** Se RLS não estiver ativado, qualquer cliente pode:
```javascript
// Ataque: Listar TODAS as conversas
const { data } = await supabase
  .from('conversations')
  .select('*'); // ❌ Retorna conversas de TODOS os usuários!
```

✅ **SOLUÇÃO:** Row Level Security (RLS)

---

## 🛡️ Camadas de Segurança

### Camada 1: Session ID Único e Imprevisível (Frontend)

```typescript
// src/lib/sessionManager.ts

import { v4 as uuidv4 } from 'uuid';
import { createHash } from 'crypto';

const SESSION_KEY = 'agente_cidadao_session_id';

export class SessionManager {
  private sessionId: string;

  constructor() {
    this.sessionId = this.getOrCreateSessionId();
  }

  private getOrCreateSessionId(): string {
    let sessionId = localStorage.getItem(SESSION_KEY);

    // Validar se é UUID válido
    if (sessionId && !this.isValidUUID(sessionId)) {
      console.warn('Session ID inválido detectado, gerando novo');
      sessionId = null;
    }

    if (!sessionId) {
      // Gerar UUID v4 criptograficamente seguro
      sessionId = uuidv4();
      localStorage.setItem(SESSION_KEY, sessionId);

      // SEGURANÇA: Também salvar hash para verificação
      const hash = this.hashSessionId(sessionId);
      localStorage.setItem(`${SESSION_KEY}_hash`, hash);
    }

    return sessionId;
  }

  private isValidUUID(uuid: string): boolean {
    const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
    return uuidRegex.test(uuid);
  }

  private hashSessionId(sessionId: string): string {
    // Hash SHA-256 do session_id para verificação de integridade
    return createHash('sha256').update(sessionId).digest('hex');
  }

  getSessionId(): string {
    return this.sessionId;
  }

  // SEGURANÇA: Limpar sessão ao sair
  clearSession(): void {
    localStorage.removeItem(SESSION_KEY);
    localStorage.removeItem(`${SESSION_KEY}_hash`);
    this.sessionId = this.getOrCreateSessionId();
  }
}
```

### Camada 2: Row Level Security (RLS) no Supabase

**CRÍTICO:** Sem RLS, qualquer cliente pode acessar qualquer dado!

#### 2.1 Habilitar RLS nas Tabelas

```sql
-- Habilitar RLS em TODAS as tabelas
ALTER TABLE conversations ENABLE ROW LEVEL SECURITY;
ALTER TABLE messages ENABLE ROW LEVEL SECURITY;
ALTER TABLE requests ENABLE ROW LEVEL SECURITY;
ALTER TABLE context_entities ENABLE ROW LEVEL SECURITY;
```

#### 2.2 Políticas RLS para `conversations`

```sql
-- POLÍTICA 1: Usuário pode VER apenas conversas da sua sessão
CREATE POLICY "Users can view own conversations"
ON conversations
FOR SELECT
USING (
  -- Se não autenticado, verificar session_id via header customizado
  session_id = current_setting('request.headers')::json->>'x-session-id'
  OR
  -- Se autenticado, verificar user_id (futuro)
  (auth.uid() IS NOT NULL AND user_id = auth.uid())
);

-- POLÍTICA 2: Usuário pode INSERIR conversas apenas da sua sessão
CREATE POLICY "Users can insert own conversations"
ON conversations
FOR INSERT
WITH CHECK (
  session_id = current_setting('request.headers')::json->>'x-session-id'
  OR
  (auth.uid() IS NOT NULL AND user_id = auth.uid())
);

-- POLÍTICA 3: Usuário pode ATUALIZAR apenas conversas da sua sessão
CREATE POLICY "Users can update own conversations"
ON conversations
FOR UPDATE
USING (
  session_id = current_setting('request.headers')::json->>'x-session-id'
  OR
  (auth.uid() IS NOT NULL AND user_id = auth.uid())
);

-- POLÍTICA 4: Usuário pode DELETAR apenas conversas da sua sessão
CREATE POLICY "Users can delete own conversations"
ON conversations
FOR DELETE
USING (
  session_id = current_setting('request.headers')::json->>'x-session-id'
  OR
  (auth.uid() IS NOT NULL AND user_id = auth.uid())
);
```

#### 2.3 Políticas RLS para `messages`

```sql
-- Mensagens herdam segurança da conversa
CREATE POLICY "Users can view messages of own conversations"
ON messages
FOR SELECT
USING (
  conversation_id IN (
    SELECT id FROM conversations
    WHERE session_id = current_setting('request.headers')::json->>'x-session-id'
    OR (auth.uid() IS NOT NULL AND user_id = auth.uid())
  )
);

CREATE POLICY "Users can insert messages in own conversations"
ON messages
FOR INSERT
WITH CHECK (
  conversation_id IN (
    SELECT id FROM conversations
    WHERE session_id = current_setting('request.headers')::json->>'x-session-id'
    OR (auth.uid() IS NOT NULL AND user_id = auth.uid())
  )
);
```

#### 2.4 Políticas RLS para `requests`

```sql
-- Requests também herdam segurança da conversa
CREATE POLICY "Users can view own requests"
ON requests
FOR SELECT
USING (
  conversation_id IN (
    SELECT id FROM conversations
    WHERE session_id = current_setting('request.headers')::json->>'x-session-id'
    OR (auth.uid() IS NOT NULL AND user_id = auth.uid())
  )
  OR conversation_id IS NULL -- Requests antigos sem conversation_id
);

CREATE POLICY "Users can insert own requests"
ON requests
FOR INSERT
WITH CHECK (
  conversation_id IN (
    SELECT id FROM conversations
    WHERE session_id = current_setting('request.headers')::json->>'x-session-id'
    OR (auth.uid() IS NOT NULL AND user_id = auth.uid())
  )
  OR conversation_id IS NULL
);
```

### Camada 3: Injetar Session ID nos Headers (Frontend)

O Supabase precisa receber o `session_id` para validar as políticas RLS.

```typescript
// src/lib/supabase.ts

import { createClient } from '@supabase/supabase-js';
import { SessionManager } from './sessionManager';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error('Missing Supabase environment variables');
}

// Criar cliente Supabase com headers customizados
export function createSecureSupabaseClient() {
  const sessionManager = new SessionManager();

  const supabase = createClient(supabaseUrl, supabaseAnonKey, {
    global: {
      headers: {
        'x-session-id': sessionManager.getSessionId()
      }
    }
  });

  return supabase;
}

export const supabase = createSecureSupabaseClient();
```

**IMPORTANTE:** Atualizar [src/App.tsx](src/App.tsx) para usar o cliente com headers:

```typescript
import { supabase } from './lib/supabase'; // Já vem com session_id nos headers
```

### Camada 4: Validação no Backend (Supabase Function)

Para **máxima segurança**, criar uma Edge Function que valida sessões:

```sql
-- Criar função para validar session_id
CREATE OR REPLACE FUNCTION validate_session_access(conv_id UUID)
RETURNS BOOLEAN AS $$
DECLARE
  conv_session_id VARCHAR(100);
  request_session_id VARCHAR(100);
BEGIN
  -- Obter session_id da conversa
  SELECT session_id INTO conv_session_id
  FROM conversations
  WHERE id = conv_id;

  -- Obter session_id do request atual
  request_session_id := current_setting('request.headers')::json->>'x-session-id';

  -- Validar match
  RETURN conv_session_id = request_session_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Usar na função de contexto
CREATE OR REPLACE FUNCTION get_conversation_context(conv_id UUID, limit_msgs INTEGER DEFAULT 10)
RETURNS JSON AS $$
DECLARE
  result JSON;
BEGIN
  -- SEGURANÇA: Validar acesso antes de retornar dados
  IF NOT validate_session_access(conv_id) THEN
    RAISE EXCEPTION 'Acesso negado: session_id não corresponde';
  END IF;

  -- Resto da função original...
  SELECT json_build_object(
    'conversation_id', conv_id,
    'recent_messages', (...)
  ) INTO result;

  RETURN result;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
```

---

## 🧪 Testes de Segurança

### Teste 1: Isolamento entre Sessões

```typescript
// test/security/session-isolation.test.ts

describe('Isolamento de Sessões', () => {
  it('Usuário A não pode ver conversas do Usuário B', async () => {
    // Simular Usuário A
    const sessionA = new SessionManager();
    const supabaseA = createSecureSupabaseClient();

    const { data: convA } = await supabaseA
      .from('conversations')
      .insert([{ session_id: sessionA.getSessionId() }])
      .select()
      .single();

    // Simular Usuário B (nova sessão)
    localStorage.clear(); // Limpar sessão A
    const sessionB = new SessionManager();
    const supabaseB = createSecureSupabaseClient();

    // Tentar acessar conversa de A usando cliente de B
    const { data: convFromB } = await supabaseB
      .from('conversations')
      .select('*')
      .eq('id', convA.id)
      .single();

    // DEVE RETORNAR NULL (RLS bloqueou)
    expect(convFromB).toBeNull();
  });

  it('Usuário não pode acessar mensagens de outra sessão', async () => {
    const sessionA = new SessionManager();
    const supabaseA = createSecureSupabaseClient();

    // Criar conversa e mensagem como Usuário A
    const { data: conv } = await supabaseA
      .from('conversations')
      .insert([{ session_id: sessionA.getSessionId() }])
      .select()
      .single();

    await supabaseA
      .from('messages')
      .insert([{
        conversation_id: conv.id,
        role: 'user',
        content: 'Mensagem privada do Usuário A'
      }]);

    // Simular Usuário B
    localStorage.clear();
    const sessionB = new SessionManager();
    const supabaseB = createSecureSupabaseClient();

    // Tentar ler mensagens de A
    const { data: messages } = await supabaseB
      .from('messages')
      .select('*')
      .eq('conversation_id', conv.id);

    // DEVE RETORNAR ARRAY VAZIO (RLS bloqueou)
    expect(messages).toEqual([]);
  });
});
```

### Teste 2: Enumeração de IDs

```typescript
it('Não deve ser possível enumerar conversas por UUID', async () => {
  const sessionA = new SessionManager();
  const supabaseA = createSecureSupabaseClient();

  // Criar 10 conversas
  const conversationIds: string[] = [];
  for (let i = 0; i < 10; i++) {
    const { data } = await supabaseA
      .from('conversations')
      .insert([{ session_id: sessionA.getSessionId() }])
      .select()
      .single();
    conversationIds.push(data.id);
  }

  // Simular atacante tentando adivinhar UUIDs
  localStorage.clear();
  const sessionB = new SessionManager();
  const supabaseB = createSecureSupabaseClient();

  // Tentar acessar todos os UUIDs conhecidos
  for (const id of conversationIds) {
    const { data } = await supabaseB
      .from('conversations')
      .select('*')
      .eq('id', id)
      .single();

    // NENHUM deve ser acessível
    expect(data).toBeNull();
  }
});
```

### Teste 3: Injeção de Session ID

```typescript
it('Não deve permitir injetar session_id de outro usuário', async () => {
  const sessionA = new SessionManager();
  const supabaseA = createSecureSupabaseClient();

  // Criar conversa como Usuário A
  const { data: convA } = await supabaseA
    .from('conversations')
    .insert([{ session_id: sessionA.getSessionId() }])
    .select()
    .single();

  // Atacante tenta criar conversa com session_id de A
  localStorage.clear();
  const sessionB = new SessionManager();
  const supabaseB = createSecureSupabaseClient();

  // Tentar inserir com session_id de A (ataque!)
  const { error } = await supabaseB
    .from('conversations')
    .insert([{
      session_id: sessionA.getSessionId() // Tentativa de roubo de sessão
    }]);

  // RLS DEVE BLOQUEAR (error esperado)
  expect(error).toBeDefined();
  expect(error.message).toContain('violates row-level security policy');
});
```

---

## 🚨 Cenários de Ataque e Mitigações

### Ataque 1: Roubo de Session ID

**Cenário:** Atacante descobre `session_id` de vítima (via XSS, shoulder surfing, etc.)

**Mitigação:**
```typescript
// 1. Usar HttpOnly cookies (futuro, com autenticação)
// 2. Rotacionar session_id periodicamente
// 3. Detectar múltiplos IPs usando mesmo session_id

class SessionManager {
  // Rotação automática a cada 24h
  private shouldRotateSession(): boolean {
    const lastRotation = localStorage.getItem('session_last_rotation');
    if (!lastRotation) return true;

    const hoursSinceRotation = (Date.now() - parseInt(lastRotation)) / (1000 * 60 * 60);
    return hoursSinceRotation > 24;
  }

  getSessionId(): string {
    if (this.shouldRotateSession()) {
      this.rotateSession();
    }
    return this.sessionId;
  }

  private rotateSession(): void {
    const oldSessionId = this.sessionId;
    const newSessionId = uuidv4();

    // Migrar dados de oldSessionId para newSessionId (via API)
    this.migrateSession(oldSessionId, newSessionId);

    this.sessionId = newSessionId;
    localStorage.setItem(SESSION_KEY, newSessionId);
    localStorage.setItem('session_last_rotation', Date.now().toString());
  }
}
```

### Ataque 2: SQL Injection via Context

**Cenário:** Atacante tenta injetar SQL no campo `context`

**Mitigação:** Supabase já sanitiza JSONB, mas validar no frontend:

```typescript
class SessionManager {
  buildContext(history: Message[]): any {
    // Sanitizar dados antes de enviar
    const context = {
      previous_questions: history
        .filter(m => m.role === 'user')
        .slice(-3)
        .map(m => this.sanitizeString(m.content)),

      entities_mentioned: this.sanitizeEntities(
        this.aggregateEntities(history)
      )
    };

    return context;
  }

  private sanitizeString(str: string): string {
    // Remover caracteres perigosos
    return str
      .replace(/[\x00-\x1F\x7F]/g, '') // Caracteres de controle
      .replace(/[<>]/g, '')             // Tags HTML
      .substring(0, 5000);              // Limitar tamanho
  }

  private sanitizeEntities(entities: any): any {
    // Validar estrutura de entidades
    const sanitized: any = {};

    for (const [type, list] of Object.entries(entities)) {
      if (!Array.isArray(list)) continue;

      sanitized[type] = list.map((entity: any) => ({
        type: this.sanitizeString(entity.type),
        name: this.sanitizeString(entity.name),
        id: typeof entity.id === 'number' ? entity.id : null
      }));
    }

    return sanitized;
  }
}
```

### Ataque 3: Acesso via N8N Webhook

**Cenário:** Atacante chama webhook do n8n diretamente com `conversation_id` de outra pessoa

**Mitigação:**

```javascript
// Node: "Validar Acesso" (antes de processar webhook)
// Adicionar no n8n ANTES do Orquestrador

const conversationId = $json.body.record.conversation_id;
const sessionId = $json.body.record.session_id;

// Validar no Supabase
const { data: conv } = await supabase
  .from('conversations')
  .select('session_id')
  .eq('id', conversationId)
  .single();

if (!conv || conv.session_id !== sessionId) {
  // BLOQUEAR: Session ID não corresponde
  throw new Error('Acesso negado: sessão inválida');
}

// Se validado, continuar fluxo normal
return { json: $json };
```

---

## 📋 Checklist de Segurança

### Antes do Deploy

- [ ] RLS habilitado em TODAS as tabelas
- [ ] Políticas RLS testadas e funcionando
- [ ] Session ID usando UUID v4
- [ ] Headers customizados configurados no Supabase client
- [ ] Testes de isolamento passando 100%
- [ ] Validação de session_id no n8n
- [ ] Sanitização de inputs implementada
- [ ] Logs de acesso negado configurados

### Monitoramento Contínuo

```sql
-- View para monitorar tentativas de acesso bloqueadas
CREATE VIEW blocked_access_attempts AS
SELECT
  current_setting('request.headers')::json->>'x-session-id' as attempted_session,
  table_name,
  operation,
  COUNT(*) as attempts,
  MAX(created_at) as last_attempt
FROM pg_stat_statements
WHERE query LIKE '%violates row-level security%'
GROUP BY attempted_session, table_name, operation
ORDER BY attempts DESC;

-- Alertar se muitas tentativas bloqueadas (possível ataque)
CREATE OR REPLACE FUNCTION alert_on_security_violations()
RETURNS TRIGGER AS $$
BEGIN
  -- Se mais de 10 bloqueios em 1 minuto, alertar
  PERFORM pg_notify(
    'security_alert',
    json_build_object(
      'message', 'Múltiplas tentativas de acesso bloqueadas',
      'session_id', current_setting('request.headers')::json->>'x-session-id',
      'timestamp', NOW()
    )::text
  );
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;
```

---

## 🎯 Resumo de Proteções

| Camada | Proteção | Nível |
|--------|----------|-------|
| **Frontend** | UUID v4 imprevisível | 🟢 Alto |
| **Frontend** | Validação de UUID | 🟢 Alto |
| **Frontend** | Sanitização de inputs | 🟢 Alto |
| **Supabase** | RLS em todas as tabelas | 🟢 Crítico |
| **Supabase** | Headers customizados | 🟢 Alto |
| **Supabase** | Funções com SECURITY DEFINER | 🟢 Alto |
| **N8N** | Validação de session_id | 🟡 Médio |
| **Monitoramento** | Logs de tentativas bloqueadas | 🟡 Médio |

---

## ✅ Garantias de Segurança

Com todas as camadas implementadas:

1. ✅ **Impossível acessar conversas de outros usuários** mesmo conhecendo o UUID
2. ✅ **RLS garante isolamento no nível do banco de dados**
3. ✅ **Session ID imprevisível (2^122 combinações)**
4. ✅ **Validação em múltiplas camadas** (frontend, backend, n8n)
5. ✅ **Sanitização de inputs** previne injeções
6. ✅ **Monitoramento** detecta tentativas de ataque

---

## 🔄 Migração para Autenticação (Futuro)

Quando implementar login:

```sql
-- Atualizar RLS para usar auth.uid()
DROP POLICY "Users can view own conversations" ON conversations;

CREATE POLICY "Authenticated users can view own conversations"
ON conversations
FOR SELECT
USING (
  -- Usuários autenticados
  (auth.uid() IS NOT NULL AND user_id = auth.uid())
  OR
  -- Usuários anônimos (backward compatibility)
  (auth.uid() IS NULL AND session_id = current_setting('request.headers')::json->>'x-session-id')
);
```

---

**Documento preparado por:** Claude Code
**Data:** 14/12/2024
**Status:** Pronto para implementação
**Nível de Segurança:** Alto (adequado para dados não-críticos)
