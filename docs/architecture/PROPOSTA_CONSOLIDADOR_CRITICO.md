# Proposta: Consolidador Crítico com Feedback Loop

**Data:** 14/12/2024
**Versão:** 1.0
**Contexto:** Evolução do sistema multi-agentes atual

---

## 🎯 Ideia Proposta

Transformar o **Sintetizador/Consolidador** em um **agente crítico** que:

1. ✅ Recebe respostas dos agentes especialistas
2. ✅ **Analisa criticamente** se as respostas são completas e corretas
3. ✅ **Identifica lacunas** ou inconsistências
4. ✅ **Retorna para os agentes** com solicitações específicas
5. ✅ **Itera até obter** resposta satisfatória
6. ✅ **Sintetiza** resposta final apenas quando validado

---

## 📊 Análise: Prós e Contras

### ✅ **PRÓS (Vantagens)**

#### 1. **Maior Qualidade nas Respostas**
- Reduz respostas incompletas ou imprecisas
- Garante que todos os dados solicitados foram retornados
- Valida consistência entre diferentes agentes

**Exemplo:**
```
Usuário: "Quanto Nikolas Ferreira gastou e quais PLs ele apresentou?"

Agente Político: [Retorna perfil, mas sem PLs]
Agente Fiscal: [Retorna despesas]

Consolidador Crítico:
❌ "Agente Político não retornou PLs do deputado"
→ Retorna para Agente Político: "Busque proposições de autoria do deputado ID 204534"

Agente Político (2ª tentativa): [Retorna PLs]
✅ Consolidador sintetiza resposta completa
```

#### 2. **Auto-Correção de Erros**
- Detecta quando ferramenta retornou erro
- Solicita nova tentativa com parâmetros diferentes
- Reduz necessidade de usuário reformular pergunta

**Exemplo:**
```
Agente Legislativo: "Erro: buscar_proposicoes retornou []"

Consolidador Crítico:
❌ "Nenhuma proposição encontrada. Tente com keywords alternativas"
→ Retorna: "Busque novamente com sinônimos ou sem filtro de ano"

Agente Legislativo (2ª tentativa): [Retorna proposições com busca ampliada]
✅ Sucesso
```

#### 3. **Validação de Consistência**
- Detecta contradições entre respostas de agentes diferentes
- Valida se IDs mencionados são consistentes
- Garante que dados estão atualizados

**Exemplo:**
```
Agente Político: "Nikolas Ferreira é do PL/MG"
Agente Fiscal: "Despesas do deputado do UNIÃO/MG"

Consolidador Crítico:
❌ "Inconsistência de partido detectada"
→ Retorna para ambos: "Validar partido atual do deputado ID 204534"
```

#### 4. **Respostas Mais Completas**
- Identifica informações importantes faltando
- Solicita dados complementares relevantes
- Melhora experiência do usuário

---

### ❌ **CONTRAS (Desvantagens)**

#### 1. **Aumento de Latência**
- Cada iteração adiciona ~5-10 segundos
- Máximo de 2-3 iterações = +15-30 segundos
- Pode ultrapassar timeout de 6 minutos se houver muitos erros

**Impacto:**
```
Fluxo Atual:
Webhook → Orquestrador → Agentes → Sintetizador → Resposta
Tempo médio: 20-40 segundos

Fluxo com Crítica:
Webhook → Orquestrador → Agentes → Crítico → Agentes (2ª) → Crítico → Resposta
Tempo médio: 35-70 segundos (se 1 iteração)
Pior caso: 50-100 segundos (se 2 iterações)
```

#### 2. **Complexidade do Workflow**
- Adiciona loops no n8n (mais difícil debugar)
- Precisa controlar número máximo de iterações
- Risco de loop infinito se mal configurado

#### 3. **Custo Computacional**
- Mais chamadas de LLM (Consolidador analisa múltiplas vezes)
- Agentes podem ser chamados 2-3x
- Aumento de ~50-100% no custo de tokens

#### 4. **Risco de Degradação**
- Se Consolidador for muito crítico, pode nunca aceitar resposta
- Se for pouco crítico, não agrega valor
- Difícil calibrar o "nível de exigência"

---

## 🏗️ Arquitetura Proposta

### Fluxo Atual (Sem Crítica)

```
┌──────────────┐
│   Webhook    │
└──────┬───────┘
       │
       ▼
┌──────────────┐
│ Orquestrador │
└──────┬───────┘
       │
       ▼
┌─────────────────────────────────┐
│  Agentes Paralelos              │
│  ┌──────┬─────────┬──────────┐  │
│  │ Leg. │ Político│  Fiscal  │  │
│  └──────┴─────────┴──────────┘  │
└──────┬──────────────────────────┘
       │
       ▼
┌──────────────┐
│     Merge    │
└──────┬───────┘
       │
       ▼
┌──────────────┐
│Sintetizador  │ (apenas formata)
└──────┬───────┘
       │
       ▼
┌──────────────┐
│   Resposta   │
└──────────────┘
```

### Fluxo Proposto (Com Crítica e Loop)

```
┌──────────────┐
│   Webhook    │
└──────┬───────┘
       │
       ▼
┌──────────────┐
│ Orquestrador │
└──────┬───────┘
       │
       ▼
┌─────────────────────────────────┐
│  Agentes Paralelos (1ª tentativa)│
│  ┌──────┬─────────┬──────────┐  │
│  │ Leg. │ Político│  Fiscal  │  │
│  └──────┴─────────┴──────────┘  │
└──────┬──────────────────────────┘
       │
       ▼
┌──────────────┐
│     Merge    │
└──────┬───────┘
       │
       ▼
┌────────────────────────┐
│  Consolidador Crítico  │
│  - Analisa respostas   │
│  - Identifica lacunas  │
│  - Decide: OK ou Retry?│
└──────┬─────────────────┘
       │
       ├─────► ✅ OK? → Sintetizar → Resposta
       │
       └─────► ❌ Lacunas? → Criar Feedback
                      │
                      ▼
          ┌───────────────────────┐
          │  Router de Feedback   │
          │  (qual agente reexecutar?)│
          └──────┬────────────────┘
                 │
                 ▼
    ┌────────────────────────────────┐
    │ Reexecutar Agente Específico   │
    │ (com instruções do Consolidador)│
    └──────┬─────────────────────────┘
           │
           ▼
    ┌──────────────┐
    │ Merge (novo) │
    └──────┬───────┘
           │
           ▼
    ┌────────────────┐
    │ Consolidador   │ (reavalia)
    │ (iteração N)   │
    └──────┬─────────┘
           │
           ├─► ✅ OK? → Resposta
           └─► ❌ Retry? → Loop (máx 3x)
```

---

## 🔧 Implementação Técnica

### 1. Modificar Node "Sintetizador" → "Consolidador Crítico"

**System Message Atualizado:**

```javascript
{
  "text": "=Pergunta original: {{ $('Webhook Chat').item.json.body.record.content }}\n\nAnálises recebidas: {{ JSON.stringify($('Merge').all(), null, 2) }}\n\nIteração atual: {{ $json.iteration || 1 }}",
  "options": {
    "systemMessage": `
# 🔍 CONSOLIDADOR CRÍTICO - Sistema de Validação e Síntese

## IDENTIDADE
Você é o **Consolidador Crítico** do Agente Cidadão.
Sua missão é DUPLA:
1. **VALIDAR** se as respostas dos agentes estão completas e corretas
2. **SINTETIZAR** apenas quando validado

**DATA ATUAL:** {{ $now.toFormat('dd/MM/yyyy') }}

---

## 🎯 PROTOCOLO DE VALIDAÇÃO

### PASSO 1: ANALISAR PERGUNTA ORIGINAL
- O que o usuário REALMENTE pediu?
- Quais informações são ESSENCIAIS?
- Quantos agentes DEVERIAM ter respondido?

### PASSO 2: VALIDAR RESPOSTAS

#### Checklist de Validação:

**✅ Completude:**
- [ ] Todos os dados solicitados foram retornados?
- [ ] Há informações essenciais faltando?
- [ ] Algum agente retornou erro ou lista vazia?

**✅ Consistência:**
- [ ] Dados entre agentes são consistentes?
- [ ] IDs/nomes de deputados batem?
- [ ] Datas e valores fazem sentido?

**✅ Qualidade:**
- [ ] Dados são específicos ou genéricos demais?
- [ ] Há informações duplicadas?
- [ ] Ferramentas corretas foram usadas?

### PASSO 3: DECIDIR

**Se TODAS as validações passarem:**
→ Retornar JSON:
{
  "status": "approved",
  "synthesis": "[Resposta formatada em Markdown]"
}

**Se ALGUMA validação FALHAR:**
→ Retornar JSON:
{
  "status": "needs_retry",
  "feedback": {
    "legislativo": "[Instrução específica ou null]",
    "politico": "[Instrução específica ou null]",
    "fiscal": "[Instrução específica ou null]"
  },
  "reason": "[Explicação clara do problema]"
}

---

## 📋 EXEMPLOS DE VALIDAÇÃO

### EXEMPLO 1: Pergunta Completa (APROVAR)

**Pergunta:** "Quem é Nikolas Ferreira?"
**Respostas:**
- Político: { nome: "Nikolas Ferreira", partido: "PL", uf: "MG", ... }

**Análise:**
✅ Todos os dados essenciais presentes
✅ Agente correto respondeu
✅ Nenhum erro

**Decisão:**
{
  "status": "approved",
  "synthesis": "## 👤 Nikolas Ferreira\n\n**Partido:** PL | **UF:** MG..."
}

---

### EXEMPLO 2: Resposta Incompleta (REJEITAR)

**Pergunta:** "Quanto Nikolas Ferreira gastou em 2024 e quais PLs ele apresentou?"
**Respostas:**
- Político: { nome: "Nikolas Ferreira", partido: "PL" }
- Fiscal: { total_gasto: "R$ 150.000" }

**Análise:**
❌ PLs NÃO foram retornados
❌ Agente Político não buscou proposições

**Decisão:**
{
  "status": "needs_retry",
  "feedback": {
    "legislativo": null,
    "politico": "Busque proposições de autoria do deputado Nikolas Ferreira (ID: 204534) usando a ferramenta buscar_proposicoes com idDeputadoAutor",
    "fiscal": null
  },
  "reason": "Agente Político não retornou proposições solicitadas pelo usuário"
}

---

### EXEMPLO 3: Erro de Ferramenta (REJEITAR)

**Pergunta:** "PLs sobre inteligência artificial"
**Respostas:**
- Legislativo: { error: "buscar_proposicoes retornou []" }

**Análise:**
❌ Nenhuma proposição encontrada
❌ Pode ser busca muito restrita

**Decisão:**
{
  "status": "needs_retry",
  "feedback": {
    "legislativo": "Tente busca mais ampla: 1) remova filtro de ano, 2) use keywords alternativas como 'IA', 'artificial intelligence', 'automação'",
    "politico": null,
    "fiscal": null
  },
  "reason": "Busca inicial não retornou resultados. Tentar com parâmetros mais amplos."
}

---

### EXEMPLO 4: Inconsistência (REJEITAR)

**Pergunta:** "Gastos de João Silva"
**Respostas:**
- Político: { id: 204534, nome: "João Silva", partido: "PT" }
- Fiscal: { deputado_id: 123456, total: "R$ 50.000" }

**Análise:**
❌ IDs de deputado diferentes!
❌ Agentes podem estar falando de pessoas diferentes

**Decisão:**
{
  "status": "needs_retry",
  "feedback": {
    "legislativo": null,
    "politico": null,
    "fiscal": "Busque despesas do deputado ID 204534 (João Silva/PT), não ID 123456"
  },
  "reason": "Inconsistência: IDs de deputados não batem entre agentes"
}

---

## ⚠️ REGRAS IMPORTANTES

### MÁXIMO DE ITERAÇÕES: 3
- Se após 3 tentativas ainda houver problemas, APROVAR mesmo assim
- Explicar limitações na resposta final

### NÃO SEJA EXCESSIVAMENTE CRÍTICO
- Pequenas omissões que não afetam a resposta → APROVAR
- Focar em lacunas ESSENCIAIS

### SEMPRE RETORNAR JSON VÁLIDO
- NUNCA retorne texto livre
- SEMPRE usar estrutura { "status": "...", ... }

### SE APROVADO, SINTETIZAR COM QUALIDADE
- Usar formatação Markdown profissional
- Incluir TODOS os dados recebidos
- Manter estrutura clara e legível

---

## 🎨 FORMATO DE RESPOSTA

### Se APROVADO:
{
  "status": "approved",
  "synthesis": "[Markdown formatado conforme templates do Sintetizador original]"
}

### Se RETRY:
{
  "status": "needs_retry",
  "feedback": {
    "legislativo": "[Instrução específica]" ou null,
    "politico": "[Instrução específica]" ou null,
    "fiscal": "[Instrução específica]" ou null
  },
  "reason": "[Explicação técnica clara]"
}

---

**Lembre-se:** Seu objetivo é MELHORAR a qualidade das respostas, não bloquear tudo!
    `
  }
}
```

### 2. Adicionar Node "Router de Feedback"

**Depois do Consolidador Crítico:**

```javascript
// Node: "Router de Feedback"
// Type: Switch (IF)

const consolidadorOutput = $json.output;
let parsedOutput;

try {
  parsedOutput = JSON.parse(consolidadorOutput);
} catch (e) {
  // Se não for JSON, assumir aprovado
  parsedOutput = { status: "approved", synthesis: consolidadorOutput };
}

// Verificar status
if (parsedOutput.status === "approved") {
  // Ir para "Respond to Webhook" (saída 0)
  return [0];
} else if (parsedOutput.status === "needs_retry") {
  // Verificar iteração atual
  const currentIteration = $json.iteration || 1;

  if (currentIteration >= 3) {
    // Máximo de iterações atingido - forçar aprovação
    console.log("⚠️ Máximo de iterações atingido. Aprovando mesmo com lacunas.");
    return [0]; // Aprovar e finalizar
  }

  // Ir para "Reexecutar Agentes" (saída 1)
  return [1];
} else {
  // Status desconhecido - aprovar por segurança
  return [0];
}
```

### 3. Adicionar Node "Reexecutar Agentes"

```javascript
// Node: "Reexecutar Agentes"
// Type: Code

const consolidadorOutput = $json.output;
const parsedOutput = JSON.parse(consolidadorOutput);
const feedback = parsedOutput.feedback;
const currentIteration = $json.iteration || 1;

const agentsToRerun = [];

// Determinar quais agentes precisam ser reexecutados
if (feedback.legislativo) {
  agentsToRerun.push({
    json: {
      agente: 'legislativo',
      user_query: feedback.legislativo,
      is_retry: true,
      iteration: currentIteration + 1,
      original_query: $('Webhook Chat').item.json.body.record.content
    }
  });
}

if (feedback.politico) {
  agentsToRerun.push({
    json: {
      agente: 'politico',
      user_query: feedback.politico,
      is_retry: true,
      iteration: currentIteration + 1,
      original_query: $('Webhook Chat').item.json.body.record.content
    }
  });
}

if (feedback.fiscal) {
  agentsToRerun.push({
    json: {
      agente: 'fiscal',
      user_query: feedback.fiscal,
      is_retry: true,
      iteration: currentIteration + 1,
      original_query: $('Webhook Chat').item.json.body.record.content
    }
  });
}

// Se nenhum agente precisa reexecutar (não deveria acontecer)
if (agentsToRerun.length === 0) {
  // Retornar para aprovação forçada
  return [{
    json: {
      force_approve: true,
      synthesis: parsedOutput.reason
    }
  }];
}

return agentsToRerun;
```

### 4. Conectar Loop de Volta

```
Reexecutar Agentes → Router (mesmo do início) → Agentes → Merge → Consolidador Crítico
                                                                          │
                                                                          ▼
                                                    Router de Feedback (verifica iteração)
```

---

## 📊 Configuração de Logs (Monitoramento)

### Adicionar Logs no Consolidador

```javascript
// No início do Consolidador Crítico
console.log('🔍 Consolidador Crítico - Iteração:', $json.iteration || 1);
console.log('📝 Pergunta original:', $('Webhook Chat').item.json.body.record.content);
console.log('📦 Respostas recebidas:', JSON.stringify($('Merge').all()));

// Após decisão
if (parsedOutput.status === 'needs_retry') {
  console.log('❌ Retry solicitado:', parsedOutput.reason);
  console.log('📋 Feedback:', parsedOutput.feedback);
} else {
  console.log('✅ Aprovado. Sintetizando resposta final.');
}
```

### Salvar em Supabase (Opcional)

Criar tabela de logs:

```sql
CREATE TABLE agent_feedback_logs (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  request_id UUID REFERENCES requests(id),
  iteration INTEGER NOT NULL,
  status VARCHAR(20) NOT NULL, -- 'approved' | 'needs_retry'
  feedback JSONB,
  reason TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);
```

---

## ⚠️ Riscos e Mitigações

### Risco 1: Loop Infinito

**Mitigação:**
```javascript
// Limite rígido de 3 iterações
if (currentIteration >= 3) {
  console.log('⚠️ LIMITE ATINGIDO. Aprovando com ressalvas.');
  return {
    status: "approved",
    synthesis: `## ⚠️ Resposta Parcial\n\n${bestEffortSynthesis}\n\n**Observação:** Algumas informações podem estar incompletas.`
  };
}
```

### Risco 2: Timeout do Webhook (6 minutos)

**Mitigação:**
```javascript
// Calcular tempo decorrido
const startTime = $('Webhook Chat').item.json.timestamp;
const elapsedSeconds = (Date.now() - startTime) / 1000;

if (elapsedSeconds > 300) { // 5 minutos
  console.log('⏱️ TIMEOUT iminente. Aprovando imediatamente.');
  return { status: "approved", ... };
}
```

### Risco 3: Consolidador Muito Crítico

**Mitigação:**
- Calibrar prompts com exemplos reais
- Definir critérios claros de "lacuna essencial" vs "nice-to-have"
- Monitorar taxa de retry (se > 50%, afrouxar critérios)

### Risco 4: Custo de Tokens

**Mitigação:**
- Usar modelo mais barato para Consolidador (Haiku em vez de Sonnet)
- Limitar tamanho de feedback (máx 500 caracteres)
- Cache de respostas frequentes

---

## 📈 Métricas de Sucesso

### KPIs a Monitorar

```sql
-- 1. Taxa de retry (ideal: 10-30%)
SELECT
  COUNT(*) FILTER (WHERE status = 'needs_retry') * 100.0 / COUNT(*) as retry_rate
FROM agent_feedback_logs
WHERE created_at > NOW() - INTERVAL '7 days';

-- 2. Iterações médias por request (ideal: 1.2-1.5)
SELECT
  AVG(max_iteration) as avg_iterations
FROM (
  SELECT request_id, MAX(iteration) as max_iteration
  FROM agent_feedback_logs
  GROUP BY request_id
) stats;

-- 3. Motivos de retry mais comuns
SELECT
  reason,
  COUNT(*) as count
FROM agent_feedback_logs
WHERE status = 'needs_retry'
GROUP BY reason
ORDER BY count DESC
LIMIT 10;
```

### Metas Esperadas

- ✅ **Taxa de retry:** 15-25% (não muito baixa = não está criticando; não muito alta = muito exigente)
- ✅ **Iterações médias:** 1.2-1.3 (maioria resolve na 1ª tentativa)
- ✅ **Timeout:** < 1% (quase nunca atingir 6 minutos)
- ✅ **Satisfação do usuário:** +20% (respostas mais completas)

---

## 🎯 Recomendação Final

### ✅ **RECOMENDO IMPLEMENTAR** se:

1. ✅ Taxa de respostas incompletas atual > 20%
2. ✅ Usuários frequentemente fazem perguntas de esclarecimento
3. ✅ Sistema pode tolerar +15-30s de latência
4. ✅ Orçamento suporta +50% custo de tokens

### ❌ **NÃO RECOMENDO** se:

1. ❌ Latência já está no limite (> 45s)
2. ❌ Orçamento de tokens apertado
3. ❌ Taxa de respostas incompletas < 10%
4. ❌ Sistema já funciona bem na maioria dos casos

---

## 🚀 Plano de Implementação Sugerido

### Fase 1: Prova de Conceito (1 semana)

1. Implementar Consolidador Crítico em DEV
2. Testar com 50 perguntas reais (histórico)
3. Medir:
   - Taxa de retry
   - Latência adicional
   - Melhoria na qualidade

### Fase 2: Calibração (1 semana)

4. Ajustar prompts do Consolidador
5. Definir thresholds de validação
6. Otimizar performance (usar Haiku?)

### Fase 3: Rollout Gradual (2 semanas)

7. Deploy em PROD com feature flag (10% → 50% → 100%)
8. Monitorar métricas
9. Iterar baseado em feedback

---

## 📚 Alternativas a Considerar

### Alternativa 1: "Validador Leve" (Meio-termo)

Em vez de loop completo, apenas **detectar e avisar**:

```markdown
## 👤 Nikolas Ferreira
[Dados retornados]

---

⚠️ **Observação:** Não foram encontradas proposições deste deputado.
Deseja que eu busque novamente com critérios mais amplos?
```

**Prós:**
- Latência baixa (sem retry automático)
- Dá controle ao usuário
- Custo menor

**Contras:**
- Usuário precisa fazer nova pergunta
- Experiência menos fluida

### Alternativa 2: "Retry Específico" (Mínimo)

Apenas retry para **casos muito específicos**:
- Erro de ferramenta (500, timeout)
- Lista vazia quando deveria ter resultados
- ID não encontrado

**Prós:**
- Latência adicional mínima (~5s)
- Foca em erros técnicos (não qualidade)

**Contras:**
- Não valida completude
- Não detecta inconsistências

---

**Documento preparado por:** Claude Code
**Data:** 14/12/2024
**Versão:** 1.0
**Status:** Proposta para discussão
