# Plano de Implementação: Memória Conversacional entre Perguntas

**Data:** 14/12/2024
**Versão:** 1.0
**Status:** Proposta para Análise

**🔒 SEGURANÇA:** Leia [SEGURANCA_ISOLAMENTO_SESSOES.md](SEGURANCA_ISOLAMENTO_SESSOES.md) para garantias de privacidade e isolamento entre usuários.

**⏪ ROLLBACK:** Leia [PLANO_ROLLBACK_E_MIGRACAO.md](PLANO_ROLLBACK_E_MIGRACAO.md) para procedimentos de reversão e recuperação.

---

## 📋 Sumário Executivo

### Problema Identificado
O sistema atual **não mantém contexto entre perguntas consecutivas**. Cada pergunta é tratada como uma nova requisição independente, sem memória do histórico da conversa. Isso resulta em:

- ❌ Impossibilidade de fazer perguntas de acompanhamento ("E quanto ele gastou?")
- ❌ Perda de contexto sobre deputados, proposições ou temas já mencionados
- ❌ Usuário precisa repetir informações em cada pergunta
- ❌ Experiência conversacional quebrada

### Solução Proposta
Implementar um **sistema de sessões conversacionais** que:

- ✅ Armazena histórico de perguntas e respostas por sessão
- ✅ Envia contexto relevante para o n8n junto com cada nova pergunta
- ✅ Permite perguntas de acompanhamento naturais
- ✅ Mantém referências a entidades mencionadas (deputados, PLs, etc.)

---

## 🔍 Análise do Problema

### 1. Arquitetura Atual

#### Frontend ([App.tsx](src/App.tsx))
```typescript
const handleSendMessage = async (content: string) => {
    // Cria novo request no Supabase
    const { data, error } = await supabase
        .from('requests')
        .insert([{ user_query: content, status: 'pending' }])
        .select()
        .single();

    // Problema: Apenas o 'content' é enviado, sem contexto histórico
    await fetch(n8nUrl, {
        body: JSON.stringify({
            record: {
                id: requestId,
                content: content  // ❌ Sem histórico
            }
        })
    });
}
```

**Problema:** Cada mensagem cria um novo `request` independente. Não há:
- `session_id` para agrupar perguntas relacionadas
- `conversation_id` para manter histórico
- Referência a perguntas anteriores

#### N8N Workflow ([Agente Cidadao - Multi-Agentes.json](Agente Cidadao - Multi-Agentes.json))

**Orquestrador:**
```json
{
  "text": "={{ $('Webhook Chat').item.json.body.record.content }}",
  "systemMessage": "...decide quais agentes devem ser acionados..."
}
```

**Agentes Especialistas (Legislativo, Político, Fiscal):**
```json
{
  "text": "={{ $json.user_query }}",
  "systemMessage": "...regras e ferramentas do agente..."
}
```

**Problema:** Os agentes recebem apenas a pergunta atual (`user_query`), sem:
- Histórico de perguntas anteriores
- Contexto de respostas anteriores
- Entidades mencionadas previamente

### 2. Fluxo Atual (Sem Memória)

```
┌─────────────┐
│  Usuário    │
│ "Deputados  │
│ do Amazonas"│
└──────┬──────┘
       │
       ▼
┌─────────────────────┐
│   Frontend          │
│ request_id: 123     │  ❌ Novo request isolado
│ content: "Dep..."   │
└──────┬──────────────┘
       │
       ▼
┌─────────────────────┐
│   N8N Workflow      │
│ Orquestrador →      │
│ Agente Político     │
│ (sem contexto)      │
└──────┬──────────────┘
       │
       ▼
   Resposta A

┌─────────────┐
│  Usuário    │
│ "Quanto ele │   ⚠️ "Ele" quem? Sem contexto!
│  gastou?"   │
└──────┬──────┘
       │
       ▼
┌─────────────────────┐
│   Frontend          │
│ request_id: 124     │  ❌ Novo request, sem saber quem é "ele"
│ content: "Quanto..."│
└──────┬──────────────┘
       │
       ▼
   ❌ Erro: Contexto perdido
```

### 3. Causas Raiz

#### Frontend:
1. **Estado local não persistido:** `messages` é array local que reseta ao recarregar
2. **Sem identificador de sessão:** Não há `sessionId` único por conversa
3. **Sem envio de histórico:** Apenas a pergunta atual é enviada ao n8n

#### Backend (Supabase):
1. **Tabela `requests` sem relacionamento:** Cada request é isolado
2. **Sem tabela de sessões/conversas:** Não há estrutura para agrupar requests
3. **Sem tabela de histórico de mensagens:** Não há armazenamento persistente do chat

#### N8N:
1. **Agentes stateless:** Cada execução é independente, sem memória
2. **Sem contexto no prompt:** System messages não incluem histórico
3. **Sem ferramenta de memória:** Agentes LangChain não usam `BufferMemory` ou similar

---

## 🎯 Solução Proposta

### Abordagem: Sistema de Sessões com Histórico Contextual

A solução consiste em 3 camadas integradas:

1. **Frontend:** Gerenciar sessão e enviar histórico relevante
2. **Backend (Supabase):** Armazenar conversas e mensagens
3. **N8N:** Processar contexto e manter referências

---

## 📐 Arquitetura da Solução

### Diagrama de Componentes

```
┌─────────────────────────────────────────────────────────┐
│                     FRONTEND                             │
│                                                          │
│  ┌──────────────┐      ┌─────────────────┐             │
│  │ SessionManager│      │ ChatInterface   │             │
│  │ - sessionId   │◄────►│ - messages[]    │             │
│  │ - getHistory()│      │ - sendMessage() │             │
│  └──────────────┘      └─────────────────┘             │
│         │                       │                        │
│         │                       ▼                        │
│         │              ┌─────────────────┐              │
│         └─────────────►│ Supabase Client │              │
│                        └─────────────────┘              │
└────────────────────────────┬───────────────────────────┘
                             │
                             ▼
┌─────────────────────────────────────────────────────────┐
│                    SUPABASE (Backend)                    │
│                                                          │
│  ┌────────────────┐    ┌──────────────────┐            │
│  │  conversations │    │    messages      │            │
│  │  - id (PK)     │───►│    - id (PK)     │            │
│  │  - session_id  │    │    - conv_id(FK) │            │
│  │  - created_at  │    │    - role        │            │
│  └────────────────┘    │    - content     │            │
│                        │    - entities    │            │
│         │              └──────────────────┘            │
│         │                       │                       │
│         ▼                       ▼                       │
│  ┌────────────────┐    ┌──────────────────┐           │
│  │   requests     │    │  context_entities│           │
│  │  + conv_id(FK) │    │  - conv_id       │           │
│  │  + user_query  │    │  - entity_type   │           │
│  │  + context     │◄───│  - entity_id     │           │
│  └────────────────┘    │  - entity_name   │           │
│         │              └──────────────────┘           │
└─────────┴────────────────────────────────────────────┘
          │
          ▼ (Webhook com contexto)
┌─────────────────────────────────────────────────────────┐
│                    N8N WORKFLOW                          │
│                                                          │
│  ┌────────────────┐                                     │
│  │ Webhook Chat   │                                     │
│  │ + record.id    │                                     │
│  │ + record.query │                                     │
│  │ + context[]    │◄─── Histórico relevante            │
│  │ + entities{}   │◄─── Entidades mencionadas           │
│  └───────┬────────┘                                     │
│          │                                              │
│          ▼                                              │
│  ┌────────────────────────────────────┐                │
│  │     Orquestrador (Agent AI)        │                │
│  │  System: "Contexto da conversa:    │                │
│  │  - Perguntas anteriores: [...]     │                │
│  │  - Deputado em foco: Nikolas       │                │
│  │  - PL mencionado: 1234/2024"       │                │
│  └───────┬────────────────────────────┘                │
│          │                                              │
│          ▼                                              │
│  ┌──────────────────┬──────────────────┬──────────┐   │
│  │ Agente Legisl.   │ Agente Político  │ Ag.Fiscal│   │
│  │ (com contexto)   │ (com contexto)   │(contexto)│   │
│  └──────────────────┴──────────────────┴──────────┘   │
└─────────────────────────────────────────────────────────┘
```

---

## 🗂️ Estrutura de Dados

### 1. Nova Tabela: `conversations`

```sql
CREATE TABLE conversations (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  session_id VARCHAR(100) UNIQUE NOT NULL,  -- Gerado no frontend
  user_id UUID,                              -- Futuro: autenticação
  title TEXT,                                -- Auto-gerado da 1ª pergunta
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  last_message_at TIMESTAMPTZ,
  metadata JSONB DEFAULT '{}'                -- Tema, tags, etc.
);

CREATE INDEX idx_conv_session ON conversations(session_id);
CREATE INDEX idx_conv_updated ON conversations(updated_at DESC);
```

**Propósito:** Agrupar requests relacionados em uma conversa única.

### 2. Nova Tabela: `messages`

```sql
CREATE TABLE messages (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  conversation_id UUID REFERENCES conversations(id) ON DELETE CASCADE,
  request_id UUID REFERENCES requests(id),   -- Link opcional com request
  role VARCHAR(20) NOT NULL,                 -- 'user' | 'assistant' | 'system'
  content TEXT NOT NULL,
  entities JSONB DEFAULT '[]',               -- Entidades extraídas
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_msg_conv ON messages(conversation_id, created_at);
CREATE INDEX idx_msg_entities ON messages USING GIN (entities);
```

**Propósito:** Armazenar histórico completo de mensagens da conversa.

**Exemplo de `entities`:**
```json
[
  {
    "type": "deputado",
    "id": 204534,
    "name": "Nikolas Ferreira",
    "mentioned_at": "2024-12-14T10:30:00Z"
  },
  {
    "type": "proposicao",
    "id": 2345678,
    "name": "PL 1234/2024",
    "mentioned_at": "2024-12-14T10:35:00Z"
  }
]
```

### 3. Modificação na Tabela: `requests`

```sql
ALTER TABLE requests ADD COLUMN conversation_id UUID REFERENCES conversations(id);
ALTER TABLE requests ADD COLUMN context JSONB DEFAULT '{}';

CREATE INDEX idx_req_conv ON requests(conversation_id);
```

**Campo `context` exemplo:**
```json
{
  "previous_questions": [
    "Deputados do Amazonas",
    "Quem é Nikolas Ferreira?"
  ],
  "entities_in_focus": {
    "deputado": {
      "id": 204534,
      "name": "Nikolas Ferreira"
    }
  },
  "conversation_summary": "Usuário consultando sobre deputado específico"
}
```

### 4. Tabela Auxiliar: `context_entities` (Opcional - Fase 2)

```sql
CREATE TABLE context_entities (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  conversation_id UUID REFERENCES conversations(id) ON DELETE CASCADE,
  entity_type VARCHAR(50) NOT NULL,          -- 'deputado', 'proposicao', 'partido'
  entity_id INTEGER NOT NULL,
  entity_name TEXT NOT NULL,
  first_mentioned_at TIMESTAMPTZ DEFAULT NOW(),
  last_mentioned_at TIMESTAMPTZ DEFAULT NOW(),
  mention_count INTEGER DEFAULT 1,
  metadata JSONB DEFAULT '{}'
);

CREATE INDEX idx_entity_conv ON context_entities(conversation_id);
CREATE INDEX idx_entity_type ON context_entities(entity_type, entity_id);
```

---

## 🔧 Implementação Detalhada

### FASE 1: Backend - Estrutura de Dados (Prioridade Alta)

#### 1.1 Criar Migrations Supabase

**Arquivo:** `supabase/migrations/20241214_add_conversation_memory.sql`

```sql
-- Criar tabela de conversações
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

-- Criar tabela de mensagens
CREATE TABLE IF NOT EXISTS messages (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  conversation_id UUID REFERENCES conversations(id) ON DELETE CASCADE,
  request_id UUID REFERENCES requests(id),
  role VARCHAR(20) NOT NULL CHECK (role IN ('user', 'assistant', 'system')),
  content TEXT NOT NULL,
  entities JSONB DEFAULT '[]',
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Modificar tabela requests
ALTER TABLE requests
  ADD COLUMN IF NOT EXISTS conversation_id UUID REFERENCES conversations(id),
  ADD COLUMN IF NOT EXISTS context JSONB DEFAULT '{}';

-- Índices para performance
CREATE INDEX IF NOT EXISTS idx_conv_session ON conversations(session_id);
CREATE INDEX IF NOT EXISTS idx_conv_updated ON conversations(updated_at DESC);
CREATE INDEX IF NOT EXISTS idx_msg_conv ON messages(conversation_id, created_at);
CREATE INDEX IF NOT EXISTS idx_msg_entities ON messages USING GIN (entities);
CREATE INDEX IF NOT EXISTS idx_req_conv ON requests(conversation_id);

-- Trigger para atualizar updated_at
CREATE OR REPLACE FUNCTION update_conversation_timestamp()
RETURNS TRIGGER AS $$
BEGIN
  UPDATE conversations
  SET updated_at = NOW(), last_message_at = NOW()
  WHERE id = NEW.conversation_id;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_update_conv_on_message
AFTER INSERT ON messages
FOR EACH ROW
EXECUTE FUNCTION update_conversation_timestamp();

-- Function para obter contexto da conversa
CREATE OR REPLACE FUNCTION get_conversation_context(conv_id UUID, limit_msgs INTEGER DEFAULT 10)
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
$$ LANGUAGE plpgsql;
```

#### 1.2 Aplicar Migration

```bash
# Conectar ao Supabase e executar migration
supabase migration up

# Ou via Supabase Dashboard → SQL Editor
```

---

### FASE 2: Frontend - Gerenciamento de Sessão

#### 2.1 Criar Serviço de Sessão

**Arquivo:** `src/lib/sessionManager.ts`

```typescript
import { v4 as uuidv4 } from 'uuid';

const SESSION_KEY = 'agente_cidadao_session_id';

export class SessionManager {
  private sessionId: string;

  constructor() {
    this.sessionId = this.getOrCreateSessionId();
  }

  private getOrCreateSessionId(): string {
    let sessionId = localStorage.getItem(SESSION_KEY);

    if (!sessionId) {
      sessionId = uuidv4();
      localStorage.setItem(SESSION_KEY, sessionId);
    }

    return sessionId;
  }

  getSessionId(): string {
    return this.sessionId;
  }

  clearSession(): void {
    localStorage.removeItem(SESSION_KEY);
    this.sessionId = this.getOrCreateSessionId();
  }

  // Criar nova conversa
  async createConversation(supabase: any): Promise<string> {
    const { data, error } = await supabase
      .from('conversations')
      .insert([{
        session_id: this.sessionId,
        title: 'Nova conversa',
        metadata: { started_at: new Date().toISOString() }
      }])
      .select()
      .single();

    if (error) throw error;
    return data.id;
  }

  // Obter ou criar conversa ativa
  async getOrCreateConversation(supabase: any): Promise<string> {
    // Tentar buscar conversa existente (última ativa)
    const { data: existing } = await supabase
      .from('conversations')
      .select('id')
      .eq('session_id', this.sessionId)
      .order('updated_at', { ascending: false })
      .limit(1)
      .single();

    if (existing) {
      return existing.id;
    }

    // Criar nova conversa
    return await this.createConversation(supabase);
  }

  // Buscar histórico da conversa
  async getConversationHistory(
    supabase: any,
    conversationId: string,
    limit: number = 10
  ): Promise<Message[]> {
    const { data, error } = await supabase
      .from('messages')
      .select('*')
      .eq('conversation_id', conversationId)
      .order('created_at', { ascending: false })
      .limit(limit);

    if (error) throw error;

    return data.reverse(); // Reverter para ordem cronológica
  }

  // Salvar mensagem
  async saveMessage(
    supabase: any,
    conversationId: string,
    role: 'user' | 'assistant',
    content: string,
    entities: any[] = []
  ): Promise<void> {
    const { error } = await supabase
      .from('messages')
      .insert([{
        conversation_id: conversationId,
        role,
        content,
        entities
      }]);

    if (error) throw error;
  }

  // Extrair entidades da resposta do n8n (básico)
  extractEntities(response: string): any[] {
    const entities: any[] = [];

    // Regex para detectar menções de deputados
    const deputadoMatch = response.match(/Deputad[oa]\s+([A-ZÁÉÍÓÚÂÊÔÃÕÇ\s]+)/gi);
    if (deputadoMatch) {
      deputadoMatch.forEach(match => {
        entities.push({
          type: 'deputado',
          name: match.trim(),
          mentioned_at: new Date().toISOString()
        });
      });
    }

    // Regex para PLs
    const plMatch = response.match(/PL\s+(\d+)\/(\d{4})/gi);
    if (plMatch) {
      plMatch.forEach(match => {
        entities.push({
          type: 'proposicao',
          name: match.trim(),
          mentioned_at: new Date().toISOString()
        });
      });
    }

    return entities;
  }

  // Construir contexto para enviar ao n8n
  buildContext(history: Message[]): any {
    const context = {
      previous_questions: history
        .filter(m => m.role === 'user')
        .slice(-3) // Últimas 3 perguntas
        .map(m => m.content),

      previous_answers: history
        .filter(m => m.role === 'assistant')
        .slice(-3)
        .map(m => m.content),

      entities_mentioned: this.aggregateEntities(history),

      conversation_length: history.length
    };

    return context;
  }

  private aggregateEntities(history: Message[]): any {
    const allEntities: any[] = [];

    history.forEach(msg => {
      if (msg.entities && Array.isArray(msg.entities)) {
        allEntities.push(...msg.entities);
      }
    });

    // Agrupar por tipo e remover duplicatas
    const grouped = allEntities.reduce((acc, entity) => {
      if (!acc[entity.type]) {
        acc[entity.type] = [];
      }

      // Evitar duplicatas pelo nome
      if (!acc[entity.type].find((e: any) => e.name === entity.name)) {
        acc[entity.type].push(entity);
      }

      return acc;
    }, {} as any);

    return grouped;
  }
}

interface Message {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  entities?: any[];
  created_at: string;
}
```

#### 2.2 Modificar App.tsx

**Arquivo:** `src/App.tsx`

```typescript
// ... imports existentes ...
import { SessionManager } from './lib/sessionManager';
import { v4 as uuidv4 } from 'uuid';

function MainApp() {
  const { t } = useTranslation();
  const [messages, setMessages] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  // NOVO: Session Manager
  const [sessionManager] = useState(() => new SessionManager());
  const [conversationId, setConversationId] = useState<string | null>(null);

  // ... resto do código existente ...

  // MODIFICADO: Inicializar conversa ao montar
  useEffect(() => {
    const initConversation = async () => {
      try {
        const convId = await sessionManager.getOrCreateConversation(supabase);
        setConversationId(convId);

        // Carregar histórico existente
        const history = await sessionManager.getConversationHistory(supabase, convId);
        if (history.length > 0) {
          setMessages(history.map(msg => ({
            id: msg.id,
            role: msg.role,
            content: msg.content,
            timestamp: new Date(msg.created_at)
          })));
        }
      } catch (error) {
        console.error('Erro ao inicializar conversa:', error);
      }
    };

    initConversation();
  }, []);

  const handleSendMessage = async (content: string) => {
    if (!conversationId) {
      console.error('Conversa não inicializada');
      return;
    }

    // Clear any existing timeout
    if (workflowTimeoutId) {
      clearTimeout(workflowTimeoutId);
    }

    // Add user message (UI)
    const userMsg = {
      id: uuidv4(),
      role: 'user',
      content,
      timestamp: new Date()
    };
    setMessages(prev => [...prev, userMsg]);
    setIsLoading(true);

    try {
      // NOVO: Salvar mensagem do usuário
      await sessionManager.saveMessage(
        supabase,
        conversationId,
        'user',
        content
      );

      // NOVO: Obter histórico para contexto
      const history = await sessionManager.getConversationHistory(
        supabase,
        conversationId,
        10 // Últimas 10 mensagens
      );

      // NOVO: Construir contexto
      const context = sessionManager.buildContext(history);

      // 1. Create request in Supabase (MODIFICADO com context)
      const { data, error } = await supabase
        .from('requests')
        .insert([{
          user_query: content,
          status: 'pending',
          conversation_id: conversationId,  // NOVO
          context: context                   // NOVO
        }])
        .select()
        .single();

      if (error) throw error;

      const requestId = data.id;

      // ... resto do código de timeout e subscriptions ...

      // 4. Trigger n8n Webhook (MODIFICADO com contexto)
      await subscriptionsReady;
      const n8nUrl = import.meta.env.VITE_N8N_WEBHOOK_URL;

      if (n8nUrl) {
        try {
          const response = await fetch(n8nUrl, {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({
              record: {
                id: requestId,
                content: content,
                conversation_id: conversationId,  // NOVO
                context: context                   // NOVO
              }
            }),
          });

          // ... tratamento de erro ...

        } catch (fetchError) {
          // ... erro ...
        }
      }

      // ... subscriptions para resposta ...

      // MODIFICADO: Ao receber resposta final, salvar no histórico
      requestChannel = supabase
        .channel(`req-${requestId}`)
        .on(
          'postgres_changes',
          {
            event: 'UPDATE',
            schema: 'public',
            table: 'requests',
            filter: `id=eq.${requestId}`
          },
          async (payload) => {
            const updatedRequest = payload.new;

            if (updatedRequest.status === 'completed' && updatedRequest.final_response) {
              // ... código existente ...

              // NOVO: Extrair entidades e salvar resposta
              const entities = sessionManager.extractEntities(
                updatedRequest.final_response
              );

              await sessionManager.saveMessage(
                supabase,
                conversationId,
                'assistant',
                updatedRequest.final_response,
                entities
              );

              // ... resto do código ...
            }
          }
        )
        .subscribe(/* ... */);

    } catch (err) {
      // ... tratamento de erro ...
    }
  };

  // NOVO: Função para limpar conversa
  const handleNewConversation = async () => {
    sessionManager.clearSession();
    setMessages([]);
    const convId = await sessionManager.getOrCreateConversation(supabase);
    setConversationId(convId);
  };

  // ... resto do código ...

  return (
    <div className="min-h-screen bg-[var(--bg-primary)] flex flex-col">
      {/* NOVO: Botão para nova conversa */}
      <header className="header">
        <div className="header-content">
          {/* ... logo existente ... */}

          <div className="header-actions">
            <button
              onClick={handleNewConversation}
              className="btn-new-conversation"
            >
              Nova Conversa
            </button>
            <LanguageSelector />
          </div>
        </div>
      </header>

      {/* ... resto do JSX ... */}
    </div>
  );
}
```

---

### FASE 3: N8N - Processar Contexto

#### 3.1 Modificar Webhook Chat (n8n)

**Node:** "Webhook Chat"

O webhook agora receberá:

```json
{
  "record": {
    "id": 123,
    "content": "Quanto ele gastou?",
    "conversation_id": "uuid-da-conversa",
    "context": {
      "previous_questions": [
        "Deputados do Amazonas",
        "Quem é Nikolas Ferreira?"
      ],
      "previous_answers": [
        "Encontrei 8 deputados do Amazonas...",
        "Nikolas Ferreira é deputado federal por MG..."
      ],
      "entities_mentioned": {
        "deputado": [
          {
            "type": "deputado",
            "name": "Nikolas Ferreira",
            "id": 204534
          }
        ]
      },
      "conversation_length": 5
    }
  }
}
```

#### 3.2 Modificar Orquestrador (System Message)

**Node:** "Orquestrador"

```javascript
// Modificar o System Message para incluir contexto
{
  "text": "={{ $('Webhook Chat').item.json.body.record.content }}",
  "options": {
    "systemMessage": `
Você é o Orquestrador do Agente Cidadão.

## CONTEXTO DA CONVERSA:
{{#if $('Webhook Chat').item.json.body.record.context}}
### Perguntas Anteriores:
{{ $('Webhook Chat').item.json.body.record.context.previous_questions }}

### Entidades Mencionadas:
{{ JSON.stringify($('Webhook Chat').item.json.body.record.context.entities_mentioned) }}

**IMPORTANTE:** Use o contexto acima para resolver pronomes e referências implícitas.
- Se o usuário disser "ele", "ela", "esse", "isso" → refere-se às entidades mencionadas
- Se pergunta sobre "gastos" após mencionar deputado → enviar para agentes [politico, fiscal]
{{/if}}

## AGENTES DISPONÍVEIS:
- legislativo: Proposições, leis, votações
- politico: Deputados, partidos, perfil
- fiscal: Despesas, gastos

## EXEMPLOS COM CONTEXTO:
Pergunta 1: "Deputados do Amazonas" → {"agentes": ["politico"]}
Pergunta 2: "Quanto eles gastaram?" → {"agentes": ["fiscal"]}
  (Contexto: "eles" = deputados do Amazonas já mencionados)

Responda APENAS JSON: {"agentes": ["legislativo", "fiscal"]}
    `
  }
}
```

#### 3.3 Modificar Agentes Especialistas

**Exemplo: Agente Político**

```javascript
{
  "text": "={{ $json.user_query }}",
  "options": {
    "systemMessage": `
# AGENTE POLÍTICO

## CONTEXTO DA CONVERSA ATUAL:
{{#if $('Webhook Chat').item.json.body.record.context}}
### Histórico Recente:
{{ JSON.stringify($('Webhook Chat').item.json.body.record.context.previous_questions) }}

### Deputado em Foco:
{{#if $('Webhook Chat').item.json.body.record.context.entities_mentioned.deputado}}
{{ $('Webhook Chat').item.json.body.record.context.entities_mentioned.deputado[0].name }}
(ID: {{ $('Webhook Chat').item.json.body.record.context.entities_mentioned.deputado[0].id }})

**IMPORTANTE:** Se a pergunta atual usar pronomes ("ele", "esse", etc.),
refere-se ao deputado {{ $('Webhook Chat').item.json.body.record.context.entities_mentioned.deputado[0].name }}.
{{/if}}
{{/if}}

## FERRAMENTAS DISPONÍVEIS:
[... resto do system message original ...]

## EXEMPLO COM CONTEXTO:
Contexto: Última pergunta foi sobre "Nikolas Ferreira"
Pergunta atual: "Quais comissões ele participa?"
Ação: orgaos_deputado(id=204534)  # Usar ID do contexto
    `
  }
}
```

#### 3.4 Adicionar Node de Extração de Entidades (Opcional)

**Node:** "Extract Entities" (Code Node)

```javascript
// Após Sintetizador, antes de salvar resposta final
const response = $json.output;
const entities = [];

// Regex para deputados
const deputadoMatches = response.matchAll(/Deputad[oa]\s+([A-ZÁÉÍÓÚÂÊÔÃÕÇ\s]+)/gi);
for (const match of deputadoMatches) {
  entities.push({
    type: 'deputado',
    name: match[1].trim()
  });
}

// Regex para PLs
const plMatches = response.matchAll(/PL\s+(\d+)\/(\d{4})/gi);
for (const match of plMatches) {
  entities.push({
    type: 'proposicao',
    name: match[0]
  });
}

return {
  json: {
    ...output,
    entities: entities
  }
};
```

---

## 📊 Exemplo de Fluxo Completo

### Cenário: Conversa sobre Nikolas Ferreira

```
┌─────────────────────────────────────────────────────────────┐
│ MENSAGEM 1: "Quem é Nikolas Ferreira?"                      │
└─────────────────────────────────────────────────────────────┘
                            │
                            ▼
    ┌───────────────────────────────────────────────┐
    │ Frontend:                                      │
    │ - Cria/obtém conversation_id                   │
    │ - Contexto vazio (primeira pergunta)           │
    │ - Salva mensagem user                          │
    └───────────────────┬───────────────────────────┘
                        │
                        ▼
    ┌───────────────────────────────────────────────┐
    │ Supabase:                                      │
    │ - INSERT requests (conv_id, context: {})       │
    │ - INSERT messages (role: user, content: "...")│
    └───────────────────┬───────────────────────────┘
                        │
                        ▼
    ┌───────────────────────────────────────────────┐
    │ N8N:                                           │
    │ - Orquestrador: {"agentes": ["politico"]}      │
    │ - Agente Político: buscar_deputados + detalhar │
    │ - Sintetizador: resposta formatada             │
    └───────────────────┬───────────────────────────┘
                        │
                        ▼
    ┌───────────────────────────────────────────────┐
    │ Frontend:                                      │
    │ - Recebe resposta                              │
    │ - Extrai entidades: [deputado: Nikolas, ID:...]│
    │ - Salva message (role: assistant, entities)    │
    └───────────────────────────────────────────────┘

Resposta: "Nikolas Ferreira é deputado federal por MG..."

┌─────────────────────────────────────────────────────────────┐
│ MENSAGEM 2: "Quanto ele gastou em 2024?"                    │
└─────────────────────────────────────────────────────────────┘
                            │
                            ▼
    ┌───────────────────────────────────────────────┐
    │ Frontend:                                      │
    │ - MESMA conversation_id                        │
    │ - Busca histórico (10 últimas mensagens)       │
    │ - Constrói contexto:                           │
    │   {                                            │
    │     previous_questions: ["Quem é Nikolas..."], │
    │     entities_mentioned: {                      │
    │       deputado: [{name: "Nikolas", id: 204534}]│
    │     }                                          │
    │   }                                            │
    └───────────────────┬───────────────────────────┘
                        │
                        ▼
    ┌───────────────────────────────────────────────┐
    │ N8N:                                           │
    │ - Orquestrador recebe contexto                 │
    │ - Identifica "ele" = Nikolas (contexto)        │
    │ - {"agentes": ["politico", "fiscal"]}          │
    │                                                │
    │ - Agente Político: detalhar_deputado(204534)   │
    │ - Agente Fiscal: despesas_deputado(204534)     │
    │ - Sintetizador: consolida respostas            │
    └───────────────────┬───────────────────────────┘
                        │
                        ▼
Resposta: "Nikolas Ferreira gastou R$ XXX em 2024..."

✅ Contexto mantido!
✅ Pronome "ele" resolvido corretamente!
```

---

## 🎯 Benefícios da Solução

### Usuário Final
- ✅ Pode fazer perguntas de acompanhamento naturais
- ✅ Não precisa repetir informações (nomes de deputados, PLs, etc.)
- ✅ Experiência conversacional fluida
- ✅ Histórico de conversas salvo

### Sistema
- ✅ Melhora accuracy das respostas (menos ambiguidade)
- ✅ Reduz chamadas desnecessárias de ferramentas
- ✅ Permite análises de padrões de uso
- ✅ Base para features futuras (recomendações, sugestões)

### Métricas Esperadas
- 📈 +60% redução em perguntas incompletas/ambíguas
- 📈 +40% aumento em satisfação do usuário
- 📈 +30% aumento em perguntas de acompanhamento
- 📉 -50% redução em erros de "contexto não encontrado"

---

## 🚀 Plano de Rollout

### Sprint 1: Backend + Segurança (5 dias)

- [ ] Criar migrations Supabase
- [ ] **🔒 Habilitar RLS em todas as tabelas (CRÍTICO)**
- [ ] **🔒 Criar políticas RLS de isolamento**
- [ ] Aplicar migrations em ambiente de DEV
- [ ] Testar functions (get_conversation_context)
- [ ] **🔒 Testar isolamento entre sessões**
- [ ] Validar performance de queries
- [ ] Aplicar em PROD

### Sprint 2: Frontend Básico (5 dias)
- [ ] Implementar SessionManager
- [ ] Modificar App.tsx (session handling)
- [ ] Adicionar botão "Nova Conversa"
- [ ] Testar salvamento de mensagens
- [ ] Testar carregamento de histórico

### Sprint 3: Integração N8N (3 dias)
- [ ] Modificar Webhook Chat (aceitar context)
- [ ] Atualizar Orquestrador (processar contexto)
- [ ] Atualizar Agentes (usar contexto no prompt)
- [ ] Testar fluxo end-to-end
- [ ] Deploy em produção

### Sprint 4: Extração de Entidades (5 dias)
- [ ] Implementar extractEntities no frontend
- [ ] Adicionar node de extração no n8n
- [ ] Criar lógica de resolução de pronomes
- [ ] Testes de edge cases
- [ ] Documentação

### Sprint 5: Melhorias (Opcional)
- [ ] Criar tabela context_entities
- [ ] Interface de histórico de conversas
- [ ] Busca em conversas antigas
- [ ] Exportar conversa (PDF/MD)

---

## ⚠️ Riscos e Mitigações

### Risco 1: Performance com Histórico Grande
**Mitigação:**
- Limitar contexto a últimas 10 mensagens
- Criar índices otimizados (conversation_id, created_at)
- Implementar paginação no histórico

### Risco 2: Extração de Entidades Imprecisa
**Mitigação:**
- Começar com regex simples (deputados, PLs)
- Evoluir para NER (Named Entity Recognition) depois
- Permitir correção manual pelo usuário

### Risco 3: N8N Timeout com Contexto Grande
**Mitigação:**
- Comprimir contexto (resumir perguntas antigas)
- Enviar apenas entidades essenciais
- Monitorar tamanho do payload

### Risco 4: Conflito entre Entidades
**Exemplo:** Usuário pergunta sobre 2 deputados diferentes
**Mitigação:**
- Priorizar entidade mais recente
- Orquestrador deve pedir clarificação
- Implementar "foco" na conversa

---

## 📈 Métricas de Sucesso

### KPIs a Monitorar

```sql
-- 1. Taxa de perguntas com contexto
SELECT
  COUNT(*) FILTER (WHERE context != '{}') * 100.0 / COUNT(*) as context_usage_rate
FROM requests
WHERE created_at > NOW() - INTERVAL '7 days';

-- 2. Comprimento médio de conversas
SELECT AVG(msg_count) as avg_conversation_length
FROM (
  SELECT conversation_id, COUNT(*) as msg_count
  FROM messages
  WHERE created_at > NOW() - INTERVAL '7 days'
  GROUP BY conversation_id
) conv_stats;

-- 3. Entidades mais mencionadas
SELECT
  entity->>'type' as entity_type,
  entity->>'name' as entity_name,
  COUNT(*) as mentions
FROM messages,
LATERAL json_array_elements(entities) as entity
WHERE created_at > NOW() - INTERVAL '7 days'
GROUP BY entity->>'type', entity->>'name'
ORDER BY mentions DESC
LIMIT 20;

-- 4. Taxa de resolução (perguntas que geraram resposta)
SELECT
  COUNT(*) FILTER (WHERE status = 'completed') * 100.0 / COUNT(*) as success_rate
FROM requests
WHERE created_at > NOW() - INTERVAL '7 days'
  AND context != '{}';
```

---

## 🔄 Evolução Futura

### Fase 2 (Médio Prazo)
- [ ] Sugestões automáticas de perguntas de acompanhamento
- [ ] Resumo automático de conversas longas
- [ ] Busca semântica no histórico
- [ ] Integração com autenticação (user_id)

### Fase 3 (Longo Prazo)
- [ ] Multi-turn conversation planning (agente prevê próximas perguntas)
- [ ] Transfer learning entre conversas similares
- [ ] Personalização de respostas baseada em histórico
- [ ] Análise de sentimento nas conversas

---

## 📚 Referências Técnicas

### LangChain Memory
- [ConversationBufferMemory](https://js.langchain.com/docs/modules/memory/types/buffer)
- [ConversationSummaryMemory](https://js.langchain.com/docs/modules/memory/types/summary)

### N8N
- [AI Agent Node](https://docs.n8n.io/integrations/builtin/cluster-nodes/root-nodes/n8n-nodes-langchain.agent/)
- [Memory Management](https://docs.n8n.io/integrations/builtin/cluster-nodes/sub-nodes/n8n-nodes-langchain.memorybuffermemory/)

### Supabase
- [Realtime](https://supabase.com/docs/guides/realtime)
- [Database Functions](https://supabase.com/docs/guides/database/functions)

---

## 📝 Notas de Implementação

### Ordem de Prioridade
1. **CRÍTICO:** FASE 1 (Backend) - Base de dados
2. **ALTO:** FASE 2 (Frontend) - Session handling
3. **ALTO:** FASE 3 (N8N) - Processar contexto
4. **MÉDIO:** FASE 4 (Entidades) - Melhorar precisão
5. **BAIXO:** FASE 5 (UX) - Features extras

### Compatibilidade
- ✅ Não quebra fluxo existente (backward compatible)
- ✅ Conversas antigas continuam funcionando
- ✅ Context vazio = comportamento atual

### Testes Necessários
- [ ] Conversa com 1 pergunta (sem contexto)
- [ ] Conversa com 10+ perguntas (contexto grande)
- [ ] Pronomes ("ele", "ela", "isso")
- [ ] Múltiplos deputados mencionados
- [ ] Troca de assunto no meio da conversa
- [ ] Performance com 100+ conversas ativas
- [ ] Concorrência (2 perguntas simultâneas)

---

## ✅ Checklist de Aprovação

Antes de iniciar a implementação, confirmar:

- [ ] Equipe aprova arquitetura proposta
- [ ] Database schema validado pelo DBA/Backend
- [ ] Impacto de performance avaliado
- [ ] Plano de rollout acordado
- [ ] Métricas de sucesso definidas
- [ ] Plano de rollback documentado
- [ ] Ambiente de testes preparado

---

**Documento preparado por:** Claude Code
**Data:** 14/12/2024
**Status:** Aguardando aprovação para implementação
