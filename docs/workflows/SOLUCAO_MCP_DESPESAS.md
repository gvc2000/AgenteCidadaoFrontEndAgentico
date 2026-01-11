# Solução: Overflow de Dados do MCP de Despesas

## Problema Identificado
A ferramenta `despesas_deputado` retorna centenas/milhares de registros, causando:
- Overflow de memória no agente
- Erro "Cannot read properties of undefined"
- Workflow travando progressivamente

## Solução 1: Limitar no Servidor MCP (RECOMENDADO)

No servidor MCP (AgenteCidadaoMCP), modifique a função `despesas_deputado`:

```python
async def despesas_deputado(id: int, ano: int, mes: int = None, itens: int = 20):  # ← REDUZIR PADRÃO
    """
    Lista despesas da Cota Parlamentar (CEAP)

    Args:
        id: ID do deputado
        ano: Ano das despesas
        mes: Mês específico (opcional)
        itens: Número máximo de itens (padrão: 20, máximo: 50)  # ← LIMITAR MÁXIMO
    """
    # Garantir que não ultrapasse 50 itens
    itens = min(itens, 50)  # ← ADICIONAR ESTA LINHA

    # ... resto do código

    # Ao retornar, resumir os dados
    despesas = response.json()['dados']

    # Se houver muitos itens, retornar resumo agregado
    if len(despesas) > 30:
        return {
            "total_itens": len(despesas),
            "total_gasto": sum(d.get('valorDocumento', 0) for d in despesas),
            "principais_categorias": _agregar_por_categoria(despesas[:30]),
            "maiores_despesas": despesas[:10],  # Top 10
            "mensagem": f"Retornando resumo de {len(despesas)} despesas. Total: R$ {sum(d.get('valorDocumento', 0) for d in despesas):,.2f}"
        }

    return despesas
```

## Solução 2: Configurar no n8n (TEMPORÁRIA)

### No nó "Agente Fiscal", adicione ao System Message:

```
IMPORTANTE:
- Ao usar despesas_deputado, SEMPRE use itens=10 (não mais que 20)
- Peça apenas dados essenciais
- Faça análises incrementais, não tudo de uma vez
```

### No nó "MCP Client2", nas Options:

```json
{
  "timeout": 30000,
  "maxResponseSize": 50000
}
```

## Solução 3: Adicionar Pré-Processamento (INTERMEDIÁRIA)

Adicione um nó "Code" entre "Agente Fiscal" e "Merge" para limpar dados:

```javascript
// Limitar tamanho da resposta do agente
const output = $json.output;

// Se resposta muito grande, resumir
if (output.length > 10000) {
  return {
    json: {
      output: output.substring(0, 10000) + "\n\n[Resposta truncada por tamanho]"
    }
  };
}

return { json: $json };
```

## Solução 4: Usar Streaming (AVANÇADA)

Configure o agente para processar dados em chunks:

1. No OpenRouter Chat Model3, ative **streaming** se disponível
2. Configure **max_tokens** para 4000
3. Use **temperature** 0.3 (mais determinístico, menos tokens)

## Implementação Imediata

**AGORA, faça isso no n8n:**

1. **Edite o System Message do Agente Fiscal:**
```
# AGENTE FISCAL

Você analisa despesas parlamentares da Câmara dos Deputados.

## REGRA CRÍTICA
- SEMPRE use despesas_deputado com itens=10 (máximo 20)
- Analise em etapas: primeiro visão geral, depois detalhes se necessário
- Priorize totais e resumos ao invés de listar tudo

## Ferramentas
- buscar_deputados(nome): obter ID
- despesas_deputado(id, ano, itens=10): listar despesas (USE itens=10!)

## Protocolo
1. Buscar ID: buscar_deputados(nome="Nome")
2. Obter resumo: despesas_deputado(id=ID, ano=2024, itens=10)
3. Analisar e apresentar totais

Seja conciso. Dados da Câmara dos Deputados.
Data: {{ $now.toFormat('dd/MM/yyyy') }}
```

2. **Salve e teste**

## Próximos Passos

Se continuar dando erro, precisamos:
1. Modificar o servidor MCP para limitar respostas
2. Ou criar um proxy que resuma dados antes de enviar ao agente
