# 🔄 Arquitetura de Fallback Inteligente

**Data:** 07/01/2026  
**Status:** Proposta para implementação futura  
**Objetivo:** Reduzir custos em ~90% mantendo qualidade

---

## 📊 Visão Geral

```
┌─────────────────────────────────────────────────────────────────┐
│                    FLUXO PRINCIPAL (90% dos casos)               │
│                                                                  │
│  [Agentes DeepSeek] → [Sintetizador Gemini] → ✅ Resposta       │
│         $0.02                  $0.01              Total: ~$0.03  │
└─────────────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────────────┐
│                    FLUXO FALLBACK (10% dos casos)                │
│                                                                  │
│  [Agentes DeepSeek] → [Sintetizador] → [Fallback Sonnet + MCP]  │
│         $0.02            $0.01              $0.10                │
│                                    ↓                             │
│                          [Sintetizador Final] → ✅ Resposta     │
│                                $0.01              Total: ~$0.14  │
└─────────────────────────────────────────────────────────────────┘
```

---

## 🏗️ Arquitetura Detalhada

### Diagrama de Nós

```
[MERGE]
   │
   ▼
[SINTETIZADOR PRIMÁRIO] ──────── Modelo: Gemini 2.5 Flash
   │                              Sem MCP
   │
   ▼
[IF: Precisa Fallback?] ──────── Condição: output.includes("FALLBACK_REQUIRED")
   │
   ├── FALSE ──► [Supabase Update] → [Respond to Webhook] → ✅ FIM
   │
   └── TRUE ───► [AGENTE FALLBACK] ──── Modelo: Claude Sonnet 3.5
                        │                 Com MCP (todas as tools)
                        ▼
                 [SINTETIZADOR FINAL] ── Modelo: Gemini 2.5 Flash
                        │
                        ▼
                 [Supabase Update] → [Respond to Webhook] → ✅ FIM
```

---

## 📋 Passo a Passo de Implementação

### Passo 1: Criar o IF Node

1. Após o **Sintetizador** atual, adicione um nó **IF**
2. Configure a condição:

```javascript
{{ $json.output.includes("FALLBACK_REQUIRED") }}
```

3. Conecte:
   - **Saída TRUE** → Novo Agente Fallback
   - **Saída FALSE** → Supabase Update (fluxo atual)

---

### Passo 2: Modificar o Sintetizador Primário

**Remova** o MCP Client do Sintetizador (para economizar tokens).

**Adicione** ao final do System Message:

```
## 🔄 AVALIAÇÃO DE QUALIDADE

Após consolidar as respostas, AVALIE se está completa:

### CRITÉRIOS DE RESPOSTA INCOMPLETA:
1. Algum agente retornou erro ou mensagem de falha
2. Dados importantes faltando (lista vazia quando deveria ter itens)
3. Pergunta não foi respondida adequadamente
4. Agente disse "não encontrei" mas pergunta parece válida

### SE RESPOSTA INCOMPLETA - Retorne EXATAMENTE:

---FALLBACK_REQUIRED---
{
  "motivo": "Descrição do que está faltando",
  "pergunta_original": "A pergunta do usuário",
  "dados_faltantes": "O que precisa ser buscado",
  "ferramentas_sugeridas": ["ferramenta1", "ferramenta2"]
}
---END_FALLBACK---

### SE RESPOSTA COMPLETA:
Retorne normalmente em Markdown, SEM o bloco FALLBACK_REQUIRED.
```

---

### Passo 3: Criar o Agente Fallback

1. **Tipo:** AI Agent
2. **Nome:** `Agente Fallback`
3. **Modelo:** `anthropic/claude-3.5-sonnet` (via OpenRouter)
4. **MCP Client:** Conectar com TODAS as ferramentas habilitadas

**System Message:**

```
# 🔧 AGENTE FALLBACK - Recuperação de Dados

Você recebeu uma solicitação de fallback porque a resposta anterior estava incompleta.

## SUA MISSÃO:
Usar as ferramentas MCP para buscar os dados faltantes.

## ENTRADA:
JSON com:
- motivo: Por que o fallback foi necessário
- pergunta_original: O que o usuário perguntou
- dados_faltantes: O que precisa ser buscado
- ferramentas_sugeridas: Quais ferramentas usar

## AÇÃO:
1. Analise o que está faltando
2. Use as ferramentas MCP para buscar os dados
3. Retorne os dados encontrados em formato estruturado

## REGRAS:
- Use APENAS as ferramentas MCP, não invente dados
- Retorne os dados em formato JSON ou Markdown estruturado
- Se não encontrar, retorne explicação clara
```

**Text (prompt do usuário):**

```
={{ $('Sintetizador').item.json.output }}
```

---

### Passo 4: Criar o Sintetizador Final

1. **Tipo:** AI Agent
2. **Nome:** `Sintetizador Final`
3. **Modelo:** `google/gemini-2.5-flash`
4. **MCP Client:** Não conectar (não precisa)

**System Message:**

```
# 📝 SINTETIZADOR FINAL

Você receberá dados adicionais buscados pelo Agente Fallback.

## SUA MISSÃO:
Consolidar em resposta final completa e bem formatada.

## ENTRADA:
- Dados do Agente Fallback (que complementam a resposta original)

## REGRAS:
- Use formatação Markdown
- Sempre termine com: **Fonte:** Dados Abertos da Câmara dos Deputados
- Inclua o bloco de ENTITIES se houver deputados/proposições
```

**Text:**

```
Pergunta original: {{ $('Webhook Chat').item.json.body.record.content }}

Dados do Fallback: {{ $('Agente Fallback').item.json.output }}
```

---

### Passo 5: Duplicar Conexões Finais

O **Sintetizador Final** deve conectar aos mesmos nós que o fluxo normal:

```
[Sintetizador Final] → [Supabase: Final Update] → [Respond to Webhook]
```

---

## 🧪 Testes de Validação

### Teste 1: Resposta Normal (sem fallback)
**Query:** "Quem é o presidente da Câmara?"  
**Esperado:** Sintetizador retorna resposta normal, IF vai para FALSE

### Teste 2: Fallback Necessário
**Query:** "Detalhes da votação X" (com ID inválido)  
**Esperado:** Agente falha, Sintetizador detecta, IF vai para TRUE, Fallback busca

### Teste 3: Fallback Resolve
**Query:** Pergunta complexa que DeepSeek não consegue  
**Esperado:** Fallback (Sonnet) busca dados, Sintetizador Final consolida

---

## 💰 Análise de Custos

| Modelo | Uso | Custo/1M tokens |
|--------|-----|-----------------|
| DeepSeek V3 | Agentes (90%) | $0.14 input / $0.28 output |
| Gemini 2.5 Flash | Sintetizador | $0.15 input / $0.60 output |
| Claude Sonnet 3.5 | Fallback (10%) | $3.00 input / $15.00 output |

### Custo Estimado por Query

| Cenário | Probabilidade | Custo |
|---------|---------------|-------|
| Sem fallback | 90% | ~$0.03 |
| Com fallback | 10% | ~$0.15 |
| **Média ponderada** | - | **~$0.04** |

### Comparação

| Configuração | Custo/Query | Economia |
|--------------|-------------|----------|
| Opus em tudo | $0.25 | - |
| DeepSeek + Fallback | $0.04 | **84%** |

---

## ✅ Checklist de Implementação

- [ ] Modificar prompt do Sintetizador (adicionar avaliação de qualidade)
- [ ] Remover MCP do Sintetizador (opcional, para economia)
- [ ] Criar IF Node após Sintetizador
- [ ] Criar Agente Fallback (Sonnet + MCP)
- [ ] Criar Sintetizador Final
- [ ] Conectar Sintetizador Final ao Supabase e Respond
- [ ] Testar fluxo normal (sem fallback)
- [ ] Testar fluxo com fallback
- [ ] Monitorar taxa de fallback (meta: <15%)

---

## 📝 Notas

- Se a taxa de fallback for >20%, considere melhorar os prompts dos agentes principais
- O Fallback deve ser usado apenas para recuperação de erros, não como padrão
- Monitore os logs para identificar padrões de falha
