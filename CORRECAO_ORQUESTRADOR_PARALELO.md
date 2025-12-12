# 🔧 Correção do Orquestrador Paralelo - Passo a Passo

**Objetivo:** Permitir que múltiplos agentes sejam acionados simultaneamente pelo Orquestrador, corrigindo o bug atual que processa apenas o primeiro agente do array.

**Prioridade:** CRÍTICA

**Tempo estimado:** 2 horas

**Impacto:** Reduz tempo de resposta de ~15s para ~8s em consultas multi-agente

---

## 📍 Problema Identificado

O workflow n8n atual possui um **JavaScript Code Node** que extrai apenas o primeiro agente do array retornado pelo Orquestrador, impedindo a execução paralela de múltiplos agentes.

**Exemplo do problema:**

- Orquestrador retorna: `{"agentes": ["legislativo", "fiscal"]}`
- Sistema processa: apenas `"legislativo"`
- Resultado: resposta incompleta, sem análise fiscal

---

## 🔍 Localização do Node no n8n

### Passo 1: Abrir o Workflow

1. Acesse o n8n: `https://n8n-agentecidadaoagentico-production.up.railway.app`
2. Abra o workflow: **"Agente Cidadão - Multi-Agentes"**

### Passo 2: Encontrar o Node Problemático

Procure pelo node JavaScript/Code que está entre:

```
[Orquestrador] → [JavaScript Code Node] → [Switch/Router]
```

**Possíveis nomes do node:**

- "Extract Agent from Array"
- "Parse Orchestrator Response"
- "Process Agents"
- Ou similar

---

## 🐛 Código Atual (PROBLEMA)

O código atual deve ser algo parecido com:

```javascript
const jsonString = $input.item.json.output;
const parsed = JSON.parse(jsonString);

return {
  agentes: parsed.agentes[0],  // ❌ PROBLEMA: Pega só o primeiro!
  user_query: $input.item.json.user_query
};
```

**Análise do problema:**

- `parsed.agentes[0]` → Acessa apenas o primeiro elemento do array
- Retorna um único objeto
- Switch Router processa apenas 1 agente
- Outros agentes são ignorados

---

## ✅ Código Corrigido

### Passo 3: Substituir o Código

**Apague todo o código atual** e substitua por:

```javascript
const jsonString = $input.item.json.output;
const parsed = JSON.parse(jsonString);
const user_query = $input.item.json.user_query;

// Transforma array de agentes em múltiplos items
// Cada agente vira um item separado para processamento paralelo
return parsed.agentes.map(agente => ({
  json: {
    agente: agente,
    user_query: user_query
  }
}));
```

**O que muda:**

- ✅ Usa `.map()` para criar um item para cada agente
- ✅ Retorna array de objetos (não objeto único)
- ✅ n8n processa automaticamente cada item em paralelo
- ✅ Todos os agentes do array são executados

**Exemplo de saída:**

```javascript
// Entrada (do Orquestrador):
{
  "agentes": ["legislativo", "fiscal"],
  "user_query": "Pergunta do usuário"
}

// Saída (após .map):
[
  { json: { agente: "legislativo", user_query: "Pergunta do usuário" } },
  { json: { agente: "fiscal", user_query: "Pergunta do usuário" } }
]
```

---

## 🔀 Ajustar o Switch Node (Router)

### Passo 4: Atualizar as Condições do Switch

O Switch Node precisa ler `$json.agente` (singular) ao invés de `$json.agentes` (plural).

**Configuração de cada rota:**

#### Rota 1 - Legislativo

```
Campo: {{ $json.agente }}
Operação: equals
Valor: legislativo
Output: Conectar ao "Agente Legislativo"
```

#### Rota 2 - Político

```
Campo: {{ $json.agente }}
Operação: equals
Valor: politico
Output: Conectar ao "Agente Político"
```

#### Rota 3 - Fiscal

```
Campo: {{ $json.agente }}
Operação: equals
Valor: fiscal
Output: Conectar ao "Agente Fiscal"
```

**⚠️ IMPORTANTE:**

- Use `agente` (singular), não `agentes` (plural)
- Valores exatos: `"legislativo"`, `"politico"`, `"fiscal"`
- Não use acentos nos valores

---

## 🔄 Verificar o Merge Node

### Passo 5: Confirmar Configuração do Merge

O **Merge Node** consolida as respostas dos agentes antes de enviar ao Sintetizador.

**Configurações necessárias:**

- **Mode:** `Append` ou `Merge By Position` ou `Multiplex`
- **Input 1:** Saída do Agente Legislativo
- **Input 2:** Saída do Agente Político
- **Input 3:** Saída do Agente Fiscal

**Modos disponíveis no n8n:**

1. **Append** (Recomendado) - Adiciona todos os items em sequência
2. **Merge By Position** - Combina items na mesma posição
3. **Multiplex** - Combina múltiplos inputs

**Para este caso, use `Append`:**
- Aguarda todos os inputs receberem dados
- Consolida todas as respostas em um único array
- Passa todos os items juntos para o Sintetizador

**Função:**

- Aguarda TODOS os agentes acionados terminarem
- Consolida as respostas em um único fluxo
- Envia para o Sintetizador

**⚠️ Se o Merge não estiver configurado:**

1. Adicione um Merge Node após os agentes
2. Conecte as 3 saídas dos agentes ao Merge
3. Configure como "Append"
4. Conecte o Merge ao Sintetizador

---

## 🧪 Testar a Correção

### Passo 6: Testes de Validação

#### Teste 1: Agente Único

**Pergunta:**

```
Quais são os PLs sobre inteligência artificial tramitando em 2024?
```

**Resultado esperado:**

- Orquestrador retorna: `["legislativo"]`
- Executa: Agente Legislativo
- Resposta: Lista de proposições sobre IA

#### Teste 2: Dois Agentes

**Pergunta:**

```
Qual o perfil do deputado Nikolas Ferreira e quais proposições ele apresentou?
```

**Resultado esperado:**

- Orquestrador retorna: `["politico", "legislativo"]`
- Executa: Agente Político + Agente Legislativo (em paralelo)
- Merge aguarda ambos terminarem
- Sintetizador consolida perfil + proposições

#### Teste 3: Três Agentes

**Pergunta:**

```
Quais proposições sobre saúde o deputado Nikolas Ferreira apresentou em 2024 e quanto ele gastou nesse período?
```

**Resultado esperado:**

- Orquestrador retorna: `["legislativo", "politico", "fiscal"]`
- Executa: 3 agentes simultaneamente
- Merge aguarda os 3 terminarem
- Resposta completa com legislativo + perfil + gastos

---

## 📊 Comparação: Antes vs Depois

### ANTES da Correção ❌

```
Orquestrador retorna: ["legislativo", "fiscal"]
            ↓
JavaScript pega: agentes[0] = "legislativo"
            ↓
Switch roteia: apenas Legislativo
            ↓
Fiscal NUNCA é executado
            ↓
Merge recebe: só resposta do Legislativo
            ↓
Sintetizador: resposta incompleta
```

**Tempo:** ~10s (só 1 agente)

**Problema:** Informação fiscal perdida!

### DEPOIS da Correção ✅

```
Orquestrador retorna: ["legislativo", "fiscal"]
            ↓
JavaScript .map(): [item1, item2]
            ↓
Switch roteia: Legislativo + Fiscal (paralelo)
            ↓
Ambos executam simultaneamente
            ↓
Merge aguarda: ambos terminarem
            ↓
Sintetizador: resposta completa
```

**Tempo:** ~10s (execução paralela, tempo do mais lento)

**Resultado:** Informação completa! ✅

---

## ⏱️ Ganho de Performance

### Cenário 1: Legislativo + Fiscal

**Antes:**

- Legislativo: 10s
- Fiscal: NÃO EXECUTAVA
- **Total: 10s + resposta incompleta** ❌

**Depois:**

- Legislativo: 10s (paralelo)
- Fiscal: 8s (paralelo)
- **Total: 10s (o maior) + resposta completa** ✅

### Cenário 2: Legislativo + Político + Fiscal

**Antes:**

- Legislativo: 12s
- Político: NÃO EXECUTAVA
- Fiscal: NÃO EXECUTAVA
- **Total: 12s + resposta muito incompleta** ❌

**Depois:**

- Legislativo: 12s (paralelo)
- Político: 10s (paralelo)
- Fiscal: 7s (paralelo)
- **Total: 12s (o maior) + resposta completa** ✅

**Ganho real:** Resposta completa no mesmo tempo!

---

## 🎯 Checklist de Validação

Após implementar a correção, confirme:

- [ ] JavaScript Code Node usa `.map()` para criar múltiplos items
- [ ] Switch Node lê `$json.agente` (singular)
- [ ] Switch tem 3 rotas: legislativo, politico, fiscal
- [ ] Merge Node está configurado como "Wait to Finish"
- [ ] Merge tem 3 inputs conectados (um para cada agente)
- [ ] Teste com pergunta multi-agente funciona
- [ ] Logs no Supabase mostram todos os agentes executando
- [ ] Resposta final contém análise de todos os agentes

---

## 🐛 Troubleshooting

### Problema: "Agentes ainda não executam em paralelo"

**Possível causa:** Switch Node ainda lê `$json.agentes` (plural)

**Solução:** Mudar para `$json.agente` (singular) em todas as rotas

### Problema: "Erro: Cannot read property 'agente'"

**Possível causa:** JavaScript Code Node não retorna formato correto

**Solução:** Verificar que o retorno é array de objetos com estrutura `{ json: { agente, user_query } }`

### Problema: "Merge não aguarda todos os agentes"

**Possível causa:** Merge configurado em modo errado

**Solução:** Alterar para "Wait to Finish" ou "Merge By Position"

### Problema: "Só um agente aparece nos logs"

**Possível causa:** JavaScript ainda usa `agentes[0]`

**Solução:** Confirmar que código usa `.map()`

---

## 📝 Observações Importantes

1. **Backup:** Antes de fazer alterações, exporte o workflow atual como backup
2. **Teste gradual:** Teste primeiro com 1 agente, depois 2, depois 3
3. **Monitore logs:** Use Supabase para verificar se todos os agentes executam
4. **Desempenho:** Tempo total = tempo do agente mais lento, não soma dos tempos
5. **Rollback:** Se algo der errado, importe o backup e reverta as mudanças

---

## 🚀 Próximos Passos

Após implementar esta correção:

1. ✅ **Testar em produção** com perguntas reais
2. ✅ **Monitorar logs** no Supabase por 1 semana
3. ✅ **Documentar ganhos** de performance observados
4. ➡️ **Implementar próxima melhoria:** Interface Realtime (MELHORIAS.md item #1)
5. ➡️ **Implementar Cache** (MELHORIAS.md item #3)

---

## 📚 Referências

- **Documentação n8n - JavaScript Code Node:** [docs.n8n.io/code/builtin/](https://docs.n8n.io/code/builtin/)
- **Documentação n8n - Merge Node:** [docs.n8n.io/integrations/builtin/core-nodes/n8n-nodes-base.merge/](https://docs.n8n.io/integrations/builtin/core-nodes/n8n-nodes-base.merge/)
- **Documento de Melhorias:** [MELHORIAS.md](./MELHORIAS.md)
- **Arquitetura Multi-Agentes:** [multi_agent_architecture.md](./multi_agent_architecture.md)

---

**Versão:** 1.0

**Data:** 2025-12-12

**Status:** Aguardando implementação no n8n

**Impacto esperado:** 🔴 CRÍTICO - Habilita paralelismo real no sistema
