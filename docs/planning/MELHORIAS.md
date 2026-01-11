# 🚀 Melhorias Propostas - Agente Cidadão

Documento de planejamento de melhorias para o sistema Agente Cidadão, organizado por prioridade e impacto.

**Última atualização:** 2025-12-12
**Versão atual do sistema:** v1.1

---

## 📊 Resumo Executivo

Este documento apresenta 18 melhorias propostas para o sistema Agente Cidadão, divididas em três categorias:

- **Alto Impacto (Curto Prazo):** 3 melhorias - ROI imediato
- **Médio Impacto:** 6 melhorias - Consolidação da plataforma
- **Longo Prazo:** 9 melhorias - Evolução estratégica

---

## 🎯 Melhorias de Alto Impacto (Curto Prazo)

### 1. Interface Realtime Completa ⭐⭐⭐⭐⭐

**Status:** 🔴 Não implementado
**Prioridade:** CRÍTICA
**Esforço:** Alto (5 dias)
**Impacto:** Muito Alto

#### Problema Atual

O frontend não consome os logs do Supabase em tempo real. O usuário vê apenas um loading genérico enquanto aguarda a resposta.

#### Solução Proposta

Implementar sistema de cards dinâmicos que se atualizam em tempo real conforme os agentes trabalham.

**Componentes a desenvolver:**

```typescript
// AgentCard.tsx
interface AgentCardProps {
  name: 'Orquestrador' | 'Legislativo' | 'Político' | 'Fiscal' | 'Sintetizador'
  status: 'idle' | 'working' | 'completed' | 'error'
  message: string
  timestamp?: Date
}

// AgentMonitor.tsx
const AgentMonitor: React.FC = () => {
  const [agents, setAgents] = useState<AgentLog[]>([])

  useEffect(() => {
    const subscription = supabase
      .channel('agent-logs')
      .on('postgres_changes', {
        event: 'INSERT',
        schema: 'public',
        table: 'agent_logs',
        filter: `request_id=eq.${requestId}`
      }, (payload) => {
        setAgents(prev => [...prev, payload.new])
      })
      .subscribe()

    return () => subscription.unsubscribe()
  }, [requestId])

  return (
    <div className="agent-monitor">
      {agents.map(agent => (
        <AgentCard key={agent.id} {...agent} />
      ))}
    </div>
  )
}
```

**Design Visual:**

```
┌─────────────────────────────────────┐
│ 🎯 Orquestrador                     │
│ ✅ Análise concluída                │
│ Acionando: Legislativo, Fiscal      │
└─────────────────────────────────────┘

┌─────────────────────────────────────┐
│ 📜 Agente Legislativo               │
│ 🔄 Buscando proposições...          │
│ [████████░░] 80%                    │
└─────────────────────────────────────┘

┌─────────────────────────────────────┐
│ 💰 Agente Fiscal                    │
│ 🔄 Consultando despesas...          │
│ [███░░░░░░░] 30%                    │
└─────────────────────────────────────┘
```

#### Entregáveis

- [ ] Componente `AgentCard.tsx`
- [ ] Componente `AgentMonitor.tsx`
- [ ] Hook `useRealtimeLogs.ts`
- [ ] Animações CSS de transição
- [ ] Indicadores de progresso
- [ ] Testes unitários

#### Benefícios

✅ Reduz percepção de tempo de espera em 60%
✅ Aumenta transparência e confiança
✅ Feedback visual imediato ao usuário
✅ Facilita debugging em produção

---

### 2. Cache de Respostas ⭐⭐⭐⭐⭐

**Status:** 🔴 Não implementado
**Prioridade:** ALTA
**Esforço:** Médio (2 dias)
**Impacto:** Muito Alto (redução de 40% em custos)

#### Problema Atual

Perguntas idênticas ou muito similares custam tokens e tempo toda vez que são feitas.

#### Solução Proposta

Implementar sistema de cache com Redis ou Supabase, usando hash da query como chave.

**Arquitetura:**

```typescript
// cache.service.ts
interface CacheEntry {
  query: string
  queryHash: string
  response: string
  model: string
  timestamp: Date
  expiresAt: Date
  hitCount: number
}

class CacheService {
  private ttl = 7 * 24 * 60 * 60 * 1000 // 7 dias

  async get(query: string): Promise<CacheEntry | null> {
    const hash = this.hashQuery(query)
    const cached = await supabase
      .from('response_cache')
      .select('*')
      .eq('query_hash', hash)
      .gte('expires_at', new Date())
      .single()

    if (cached.data) {
      // Incrementar hit count
      await this.incrementHits(cached.data.id)
      return cached.data
    }

    return null
  }

  async set(query: string, response: string): Promise<void> {
    const hash = this.hashQuery(query)
    const expiresAt = new Date(Date.now() + this.ttl)

    await supabase.from('response_cache').insert({
      query,
      query_hash: hash,
      response,
      expires_at: expiresAt,
      hit_count: 0
    })
  }

  private hashQuery(query: string): string {
    // Normalizar: lowercase, remover acentos, trim
    const normalized = query
      .toLowerCase()
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '')
      .trim()

    return crypto.createHash('sha256')
      .update(normalized)
      .digest('hex')
  }
}
```

**Schema Supabase:**

```sql
CREATE TABLE response_cache (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  query TEXT NOT NULL,
  query_hash VARCHAR(64) UNIQUE NOT NULL,
  response TEXT NOT NULL,
  model VARCHAR(50),
  created_at TIMESTAMP DEFAULT NOW(),
  expires_at TIMESTAMP NOT NULL,
  hit_count INTEGER DEFAULT 0,
  metadata JSONB
);

CREATE INDEX idx_cache_hash ON response_cache(query_hash);
CREATE INDEX idx_cache_expires ON response_cache(expires_at);
```

#### Estratégias de Invalidação

**Por tempo (TTL):**
- Respostas gerais: 7 dias
- Dados de deputados: 30 dias (mudam pouco)
- Despesas: 1 dia (atualizadas frequentemente)

**Por evento:**
- Limpar cache quando dados upstream mudarem
- Invalidar por padrão (ex: "deputado X" invalida todos os caches desse deputado)

#### Métricas de Sucesso

- **Hit Rate:** > 30%
- **Redução de custos:** ~40%
- **Redução de tempo:** Respostas em < 500ms para cache hit

#### Entregáveis

- [ ] Tabela `response_cache` no Supabase
- [ ] Serviço `CacheService` no backend
- [ ] Integração no n8n (Check cache antes de agentes)
- [ ] Dashboard de métricas de cache
- [ ] Job de limpeza de cache expirado

---

### 3. Orquestrador Paralelo Real ⭐⭐⭐⭐⭐

**Status:** 🟡 Parcialmente implementado
**Prioridade:** ALTA
**Esforço:** Baixo (1 dia)
**Impacto:** Alto (50% mais rápido)

#### Problema Atual

O Code Node no n8n extrai apenas `agentes[0]`, executando somente 1 agente por vez mesmo quando vários são necessários.

```javascript
// Código ATUAL (multi_agent_architecture.md:113)
const parsed = JSON.parse(jsonString);
return {
  agentes: parsed.agentes[0], // ❌ Pega só o primeiro!
  user_query: $input.item.json.user_query
};
```

#### Solução Proposta

Modificar o workflow n8n para processar TODOS os agentes do array em paralelo verdadeiro.

**Novo fluxo:**

```javascript
// Code Node atualizado
const parsed = JSON.parse(jsonString);
const agentes = parsed.agentes; // Array completo

// Criar múltiplas saídas, uma para cada agente
return agentes.map(agente => ({
  agente: agente,
  user_query: $input.item.json.user_query
}));
```

**Configuração do Switch Node:**

```
Input: agentes[]
Modo: Múltiplas saídas

Rota 0: agente === "legislativo" → Agente Legislativo
Rota 1: agente === "politico" → Agente Político
Rota 2: agente === "fiscal" → Agente Fiscal
```

**Merge Node:**
- Modo: Aguardar todas as entradas ativas
- Timeout: 60 segundos
- Em caso de erro: Continuar com respostas parciais

#### Exemplo de Execução

**Query:** "Quanto Nikolas gastou e quais PLs ele propôs?"

**Antes (sequencial):**
```
Orquestrador → ["fiscal", "legislativo"]
Router → pega "fiscal"
Agente Fiscal → 8s
❌ Agente Legislativo não é executado
Total: ~8s (incompleto)
```

**Depois (paralelo):**
```
Orquestrador → ["fiscal", "legislativo"]
Router → divide em 2 branches
├─ Agente Fiscal → 8s (paralelo)
└─ Agente Legislativo → 7s (paralelo)
Merge → aguarda ambos
Total: ~8s (completo)
```

#### Ganhos de Performance

| Cenário | Antes | Depois | Ganho |
|---------|-------|--------|-------|
| 1 agente | 8s | 8s | 0% |
| 2 agentes | 16s (sequencial) | 8s (paralelo) | 50% |
| 3 agentes | 24s (sequencial) | 10s (paralelo) | 58% |

#### Entregáveis

- [ ] Atualizar Code Node `Code in JavaScript`
- [ ] Configurar Switch Node para múltiplas saídas
- [ ] Configurar Merge Node corretamente
- [ ] Testar com queries multi-agente
- [ ] Atualizar documentação

---

## 💡 Melhorias de Médio Impacto

### 4. Sistema de Feedback do Usuário ⭐⭐⭐⭐

**Status:** 🔴 Não implementado
**Esforço:** Baixo (1 dia)
**Impacto:** Médio (qualidade das respostas)

#### Implementação

```typescript
// FeedbackButtons.tsx
interface FeedbackProps {
  requestId: string
  response: string
}

const FeedbackButtons: React.FC<FeedbackProps> = ({ requestId, response }) => {
  const [feedback, setFeedback] = useState<'up' | 'down' | null>(null)
  const [comment, setComment] = useState('')

  const handleFeedback = async (rating: 'up' | 'down') => {
    setFeedback(rating)

    await supabase.from('feedbacks').insert({
      request_id: requestId,
      rating,
      comment,
      created_at: new Date()
    })

    toast.success('Obrigado pelo feedback!')
  }

  return (
    <div className="feedback">
      <button onClick={() => handleFeedback('up')}>
        👍 Útil
      </button>
      <button onClick={() => handleFeedback('down')}>
        👎 Não útil
      </button>
      {feedback === 'down' && (
        <textarea
          placeholder="O que podemos melhorar?"
          onChange={(e) => setComment(e.target.value)}
        />
      )}
    </div>
  )
}
```

**Schema:**

```sql
CREATE TABLE feedbacks (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  request_id UUID REFERENCES requests(id),
  rating VARCHAR(10) NOT NULL CHECK (rating IN ('up', 'down')),
  comment TEXT,
  user_agent TEXT,
  created_at TIMESTAMP DEFAULT NOW()
);
```

#### Uso dos Dados

- Dashboard de qualidade
- Identificar respostas problemáticas
- Treinar fine-tuning futuramente
- Priorizar melhorias

---

### 5. Histórico de Conversas Persistente ⭐⭐⭐⭐

**Status:** 🔴 Não implementado
**Esforço:** Médio (2 dias)
**Impacto:** Médio (UX)

#### Problema

Usuário perde histórico ao recarregar a página.

#### Solução

```sql
CREATE TABLE conversations (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID, -- null se não autenticado (usa sessionId)
  session_id VARCHAR(100), -- para usuários anônimos
  title VARCHAR(200), -- gerado pela primeira pergunta
  messages JSONB[] NOT NULL DEFAULT '{}',
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

CREATE INDEX idx_conv_user ON conversations(user_id);
CREATE INDEX idx_conv_session ON conversations(session_id);
```

**Estrutura de mensagem:**

```typescript
interface Message {
  role: 'user' | 'assistant'
  content: string
  timestamp: Date
  agents?: string[] // quais agentes responderam
  feedback?: 'up' | 'down'
}
```

---

### 6. Métricas e Analytics ⭐⭐⭐⭐

**Status:** 🔴 Não implementado
**Esforço:** Médio (3 dias)
**Impacto:** Médio (observabilidade)

#### Métricas a Rastrear

**Performance:**
- Tempo médio de resposta por agente
- Percentil 95, 99
- Taxa de erro por agente
- Timeout rate

**Uso:**
- Queries por dia/hora
- Agentes mais acionados
- Temas mais consultados
- Taxa de cache hit

**Custos:**
- Tokens consumidos por modelo
- Custo estimado por query
- Custo total mensal
- Projeção de custos

**Schema:**

```sql
CREATE TABLE metrics (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  request_id UUID REFERENCES requests(id),
  agent_name VARCHAR(50),
  started_at TIMESTAMP,
  completed_at TIMESTAMP,
  duration_ms INTEGER,
  tokens_used INTEGER,
  cost_usd DECIMAL(10, 6),
  status VARCHAR(20),
  error TEXT,
  metadata JSONB
);
```

**Dashboard:**

```typescript
// AdminDashboard.tsx
interface Metrics {
  avgResponseTime: number
  totalRequests: number
  errorRate: number
  totalCost: number
  topAgents: Array<{ name: string; count: number }>
  topQueries: Array<{ query: string; count: number }>
}
```

---

### 7. Retry e Circuit Breaker ⭐⭐⭐⭐⭐

**Status:** 🔴 Não implementado
**Esforço:** Médio (2 dias)
**Impacto:** Alto (confiabilidade)

#### Problema

Se MCP falhar temporariamente, a requisição toda falha sem retry.

#### Solução

```typescript
// retry.service.ts
class RetryService {
  async callWithRetry<T>(
    fn: () => Promise<T>,
    options: {
      maxRetries: number
      backoff: 'exponential' | 'linear'
      timeout: number
    }
  ): Promise<T> {
    let lastError: Error

    for (let i = 0; i < options.maxRetries; i++) {
      try {
        return await Promise.race([
          fn(),
          this.timeout(options.timeout)
        ])
      } catch (err) {
        lastError = err

        if (i < options.maxRetries - 1) {
          const delay = this.calculateDelay(i, options.backoff)
          await this.sleep(delay)
        }
      }
    }

    throw lastError
  }

  private calculateDelay(attempt: number, type: string): number {
    return type === 'exponential'
      ? Math.pow(2, attempt) * 1000 // 1s, 2s, 4s, 8s
      : (attempt + 1) * 1000         // 1s, 2s, 3s, 4s
  }
}
```

**Circuit Breaker:**

```typescript
class CircuitBreaker {
  private failures = 0
  private state: 'closed' | 'open' | 'half-open' = 'closed'
  private threshold = 5
  private timeout = 60000 // 1min

  async call<T>(fn: () => Promise<T>): Promise<T> {
    if (this.state === 'open') {
      throw new Error('Circuit breaker is OPEN')
    }

    try {
      const result = await fn()
      this.onSuccess()
      return result
    } catch (err) {
      this.onFailure()
      throw err
    }
  }

  private onSuccess() {
    this.failures = 0
    if (this.state === 'half-open') {
      this.state = 'closed'
    }
  }

  private onFailure() {
    this.failures++
    if (this.failures >= this.threshold) {
      this.state = 'open'
      setTimeout(() => {
        this.state = 'half-open'
      }, this.timeout)
    }
  }
}
```

---

### 8. Validação de Input ⭐⭐⭐⭐

**Status:** 🔴 Não implementado
**Esforço:** Baixo (1 dia)
**Impacto:** Médio (segurança)

#### Implementação

```typescript
// validation.ts
const VALIDATION_RULES = {
  MIN_LENGTH: 3,
  MAX_LENGTH: 500,
  RATE_LIMIT: 10, // req/min
  BLOCKED_PATTERNS: [
    /inject/i,
    /<script>/i,
    /SELECT.*FROM/i
  ]
}

function validateQuery(query: string): ValidationResult {
  // Tamanho
  if (query.length < VALIDATION_RULES.MIN_LENGTH) {
    return { valid: false, error: 'Pergunta muito curta' }
  }

  if (query.length > VALIDATION_RULES.MAX_LENGTH) {
    return { valid: false, error: 'Máximo 500 caracteres' }
  }

  // Padrões maliciosos
  for (const pattern of VALIDATION_RULES.BLOCKED_PATTERNS) {
    if (pattern.test(query)) {
      return { valid: false, error: 'Query inválida' }
    }
  }

  return { valid: true }
}
```

---

### 9. Rate Limiting ⭐⭐⭐⭐

**Status:** 🔴 Não implementado
**Esforço:** Baixo (1 dia)
**Impacto:** Médio (proteção)

#### Implementação

```typescript
// rate-limiter.service.ts
class RateLimiter {
  private cache = new Map<string, number[]>()

  isAllowed(userId: string, limit: number, windowMs: number): boolean {
    const now = Date.now()
    const userRequests = this.cache.get(userId) || []

    // Limpar requisições antigas
    const validRequests = userRequests.filter(
      time => now - time < windowMs
    )

    if (validRequests.length >= limit) {
      return false
    }

    validRequests.push(now)
    this.cache.set(userId, validRequests)
    return true
  }
}

// Uso no n8n
const limiter = new RateLimiter()
const userId = request.ip || request.sessionId

if (!limiter.isAllowed(userId, 10, 60000)) {
  return {
    error: 'Muitas requisições. Aguarde 1 minuto.'
  }
}
```

---

## 🎨 Melhorias de UX/UI

### 10. Sugestões de Perguntas ⭐⭐⭐⭐

**Status:** 🔴 Não implementado
**Esforço:** Baixo (1 dia)
**Impacto:** Médio (engajamento)

```tsx
const SUGGESTIONS = [
  {
    category: 'Legislativo',
    icon: '📜',
    queries: [
      'PLs sobre inteligência artificial',
      'Status da reforma tributária',
      'Votações desta semana'
    ]
  },
  {
    category: 'Político',
    icon: '👔',
    queries: [
      'Deputados de São Paulo',
      'Quem é Nikolas Ferreira?',
      'Mesa Diretora da Câmara'
    ]
  },
  {
    category: 'Fiscal',
    icon: '💰',
    queries: [
      'Maiores gastos com passagens',
      'Despesas do meu estado',
      'Ranking de gastos por partido'
    ]
  }
]

const Suggestions: React.FC = () => {
  return (
    <div className="suggestions">
      {SUGGESTIONS.map(cat => (
        <div key={cat.category}>
          <h4>{cat.icon} {cat.category}</h4>
          {cat.queries.map(q => (
            <Chip onClick={() => setQuery(q)}>
              {q}
            </Chip>
          ))}
        </div>
      ))}
    </div>
  )
}
```

---

### 11. Markdown Melhorado ⭐⭐⭐

**Status:** 🟡 Parcialmente implementado
**Esforço:** Baixo (0.5 dia)

**Adicionar:**
- Syntax highlighting
- Tabelas responsivas
- Copy-to-clipboard
- Links clicáveis para fontes

```tsx
import ReactMarkdown from 'react-markdown'
import { Prism as SyntaxHighlighter } from 'react-syntax-highlighter'

<ReactMarkdown
  components={{
    code: ({ node, inline, className, children, ...props }) => {
      const match = /language-(\w+)/.exec(className || '')
      return !inline && match ? (
        <SyntaxHighlighter language={match[1]} {...props}>
          {String(children).replace(/\n$/, '')}
        </SyntaxHighlighter>
      ) : (
        <code className={className} {...props}>
          {children}
        </code>
      )
    },
    table: ({ children }) => (
      <div className="table-responsive">
        <table>{children}</table>
      </div>
    ),
    a: ({ href, children }) => (
      <a href={href} target="_blank" rel="noopener">
        {children} 🔗
      </a>
    )
  }}
>
  {response}
</ReactMarkdown>
```

---

### 12. Modo Escuro ⭐⭐⭐

**Status:** 🔴 Não implementado
**Esforço:** Baixo (0.5 dia)

```typescript
// theme.ts
const themes = {
  light: {
    primary: '#009B3A', // Verde da Câmara
    background: '#FFFFFF',
    text: '#1A1A1A',
    card: '#F5F5F5'
  },
  dark: {
    primary: '#00C853', // Verde mais claro para dark
    background: '#121212',
    text: '#E0E0E0',
    card: '#1E1E1E'
  }
}

// Hook
const useTheme = () => {
  const [theme, setTheme] = useState<'light' | 'dark'>('light')

  useEffect(() => {
    document.body.dataset.theme = theme
    localStorage.setItem('theme', theme)
  }, [theme])

  return { theme, setTheme, toggleTheme: () => setTheme(t => t === 'light' ? 'dark' : 'light') }
}
```

---

## 🔐 Melhorias de Segurança e Governança

### 13. Autenticação Opcional ⭐⭐⭐⭐

**Status:** 🔴 Não implementado
**Esforço:** Médio (3 dias)
**Impacto:** Médio (controle de abuso)

**Usando Supabase Auth:**

```typescript
// auth.service.ts
const { data, error } = await supabase.auth.signInWithOAuth({
  provider: 'google',
  options: {
    redirectTo: window.location.origin
  }
})

// Quotas por usuário
CREATE TABLE user_quotas (
  user_id UUID PRIMARY KEY,
  daily_limit INTEGER DEFAULT 50,
  used_today INTEGER DEFAULT 0,
  reset_at TIMESTAMP
);
```

**Benefícios:**
- Histórico por usuário
- Quotas personalizadas
- Prevenir abuso
- Analytics por usuário

---

### 14. Sanitização de Respostas ⭐⭐⭐

**Status:** 🔴 Não implementado
**Esforço:** Baixo (1 dia)

```typescript
// sanitize.ts
function sanitizeResponse(text: string): string {
  // Remover possíveis dados sensíveis
  const patterns = [
    /\b\d{3}\.\d{3}\.\d{3}-\d{2}\b/g, // CPF
    /\b[\w.-]+@[\w.-]+\.\w{2,}\b/g,   // Email
    /\b\d{11,}\b/g                     // Telefone
  ]

  let sanitized = text
  for (const pattern of patterns) {
    sanitized = sanitized.replace(pattern, '[REMOVIDO]')
  }

  return sanitized
}
```

---

## 🌟 Melhorias Futuras (Longo Prazo)

### 15. Multi-órgãos ⭐⭐⭐⭐⭐

**Status:** 🔴 Não planejado
**Esforço:** Muito Alto (4 semanas)
**Impacto:** Estratégico

**Expandir para:**
- Senado Federal
- TCU (Tribunal de Contas da União)
- STF (Supremo Tribunal Federal)
- Governos Estaduais
- Assembleias Legislativas

**Arquitetura:**

```
Orquestrador Master
├── Câmara dos Deputados (atual)
│   ├── Legislativo
│   ├── Político
│   └── Fiscal
├── Senado Federal (novo)
│   ├── Legislativo Senado
│   ├── Senadores
│   └── Fiscal Senado
└── TCU (novo)
    ├── Auditorias
    └── Processos
```

---

### 16. Análise Preditiva ⭐⭐⭐⭐

**Status:** 🔴 Não planejado
**Esforço:** Alto (3 semanas)

**Funcionalidades:**
- Prever chance de PL ser aprovado
- Tendências de votação por partido
- Projeção de gastos futuros
- Alertas de comportamento anômalo

**Técnicas:**
- Machine Learning (sklearn, TensorFlow)
- Séries temporais
- Análise de padrões históricos

---

### 17. Alertas Personalizados ⭐⭐⭐⭐

**Status:** 🔴 Não planejado
**Esforço:** Médio (2 semanas)

**Usuário pode:**
- Seguir deputados específicos
- Receber notificações quando PL tramitar
- Alertas de gastos anômalos
- Resumo semanal personalizado

**Implementação:**
- Push notifications
- Email digest
- Webhook para apps terceiros

---

### 18. API Pública ⭐⭐⭐⭐

**Status:** 🔴 Não planejado
**Esforço:** Médio (2 semanas)

**Endpoints:**

```http
# Consulta
POST /api/v1/query
Authorization: Bearer {token}
Content-Type: application/json

{
  "query": "PLs sobre IA",
  "format": "json" | "markdown"
}

# Histórico
GET /api/v1/history?limit=50

# Métricas
GET /api/v1/metrics/usage
```

**Casos de uso:**
- Jornalistas
- Pesquisadores
- ONGs
- Apps de terceiros
- Integrações corporativas

---

## 📋 Priorização e Roadmap

### Sprint 1 (1-2 semanas) - Dezembro 2025

**Objetivo:** Quick wins de alto impacto

- [ ] ✅ Orquestrador paralelo real (1 dia)
- [ ] ✅ Cache de respostas (2 dias)
- [ ] ✅ Validação de input (1 dia)
- [ ] ✅ Rate limiting (1 dia)

**Total:** 5 dias
**Impacto estimado:** Redução de 40% em custos, 50% mais rápido

---

### Sprint 2 (2-3 semanas) - Janeiro 2025

**Objetivo:** Interface e feedback

- [ ] ✅ Interface Realtime completa (5 dias)
- [ ] ✅ Sistema de feedback (1 dia)
- [ ] ✅ Sugestões de perguntas (1 dia)
- [ ] ✅ Markdown melhorado (0.5 dia)

**Total:** 7.5 dias
**Impacto estimado:** UX 10x melhor, coleta de dados para melhoria

---

### Sprint 3 (1 mês) - Fevereiro 2025

**Objetivo:** Robustez e observabilidade

- [ ] ✅ Retry e Circuit Breaker (2 dias)
- [ ] ✅ Métricas e Analytics (3 dias)
- [ ] ✅ Histórico persistente (2 dias)
- [ ] ✅ Modo escuro (0.5 dia)

**Total:** 7.5 dias
**Impacto estimado:** Sistema 99% confiável, observabilidade completa

---

### Sprint 4 (1-2 meses) - Março-Abril 2025

**Objetivo:** Segurança e controle

- [ ] ✅ Autenticação (3 dias)
- [ ] ✅ Sanitização (1 dia)
- [ ] ✅ Dashboard admin (3 dias)

**Total:** 7 dias

---

### Roadmap 2025-2026

**Q2 2025:**
- Expansão Senado Federal
- Análise preditiva v1

**Q3 2025:**
- Alertas personalizados
- API pública beta

**Q4 2025:**
- TCU integração
- Multi-idiomas (EN, ES)

**2026:**
- Governos estaduais
- Mobile app
- Fine-tuning customizado

---

## 📊 Estimativa de Custos vs. Benefícios

| # | Melhoria | Esforço | Impacto | ROI | Prioridade |
|---|----------|---------|---------|-----|------------|
| 3 | Orquestrador Paralelo | ⭐ | ⭐⭐⭐⭐⭐ | 🏆🏆🏆🏆🏆 | P0 |
| 2 | Cache | ⭐⭐ | ⭐⭐⭐⭐⭐ | 🏆🏆🏆🏆🏆 | P0 |
| 1 | Interface Realtime | ⭐⭐⭐⭐⭐ | ⭐⭐⭐⭐⭐ | 🏆🏆🏆🏆🏆 | P0 |
| 4 | Feedback | ⭐ | ⭐⭐⭐⭐ | 🏆🏆🏆🏆 | P1 |
| 7 | Retry/Circuit | ⭐⭐ | ⭐⭐⭐⭐⭐ | 🏆🏆🏆🏆 | P1 |
| 6 | Analytics | ⭐⭐⭐ | ⭐⭐⭐⭐ | 🏆🏆🏆 | P1 |
| 8 | Validação | ⭐ | ⭐⭐⭐⭐ | 🏆🏆🏆🏆 | P1 |
| 9 | Rate Limit | ⭐ | ⭐⭐⭐⭐ | 🏆🏆🏆🏆 | P1 |
| 5 | Histórico | ⭐⭐ | ⭐⭐⭐ | 🏆🏆🏆 | P2 |
| 10 | Sugestões | ⭐ | ⭐⭐⭐ | 🏆🏆🏆 | P2 |
| 11 | Markdown++ | ⭐ | ⭐⭐⭐ | 🏆🏆🏆 | P2 |
| 12 | Modo Escuro | ⭐ | ⭐⭐ | 🏆🏆 | P2 |
| 13 | Autenticação | ⭐⭐⭐ | ⭐⭐⭐⭐ | 🏆🏆🏆 | P2 |
| 14 | Sanitização | ⭐ | ⭐⭐⭐ | 🏆🏆🏆 | P2 |
| 15 | Multi-órgãos | ⭐⭐⭐⭐⭐ | ⭐⭐⭐⭐⭐ | 🏆🏆 | P3 |
| 16 | Preditiva | ⭐⭐⭐⭐ | ⭐⭐⭐⭐ | 🏆🏆 | P3 |
| 17 | Alertas | ⭐⭐⭐ | ⭐⭐⭐⭐ | 🏆🏆🏆 | P3 |
| 18 | API Pública | ⭐⭐⭐ | ⭐⭐⭐⭐ | 🏆🏆🏆 | P3 |

**Legenda:**
- ⭐ = Esforço/Impacto (1-5)
- 🏆 = ROI (1-5)
- P0 = Crítico, P1 = Alto, P2 = Médio, P3 = Baixo

---

## 🎯 Recomendações Finais

**Para começar AGORA (Sprint 1):**

1. **Orquestrador Paralelo** - 1 dia, impacto massivo
2. **Cache** - 2 dias, reduz custos em 40%
3. **Validação + Rate Limit** - 2 dias, protege o sistema

**Total:** 5 dias para transformar o sistema

**Próximos passos críticos:**

4. **Interface Realtime** - UX 10x melhor
5. **Retry/Circuit Breaker** - Confiabilidade 99%
6. **Feedback + Analytics** - Dados para melhoria contínua

---

## 📞 Contato e Discussões

Para discutir qualquer uma dessas melhorias ou sugerir novas:

- Abrir issue no GitHub
- Discussão no repositório
- Pull Request com implementação

---

**Última revisão:** 2025-12-12
**Próxima revisão:** Após Sprint 1 (Janeiro 2025)
