# Workflows - Agente Cidadão

Configurações do n8n, workflows, prompts dos agentes e system messages.

## 📚 Documentos Disponíveis

### Workflow Principal

- **[Agente Cidadao - Multi-Agentes.json](Agente%20Cidadao%20-%20Multi-Agentes.json)** - Workflow completo do n8n com todos os agentes, roteamento e integrações

### Prompts e System Messages

- **[N8N_PROMPTS_ATUALIZADOS.md](N8N_PROMPTS_ATUALIZADOS.md)** - Prompts atualizados de todos os agentes de IA
- **[system-message-legislativo-simplificado.md](system-message-legislativo-simplificado.md)** - System message do Agente Legislativo
- **[system-message-legislativo-ultra-simplificado.md](system-message-legislativo-ultra-simplificado.md)** - Versão ultra simplificada
- **[system-message-fiscal-simplificado.md](system-message-fiscal-simplificado.md)** - System message do Agente Fiscal
- **[system-message-sintetizador.md](system-message-sintetizador.md)** - System message do Sintetizador
- **[system-message-sintetizador-simplificado.md](system-message-sintetizador-simplificado.md)** - Versão simplificada

### Melhorias e Correções

- **[CORRECAO_ORQUESTRADOR_PARALELO.md](CORRECAO_ORQUESTRADOR_PARALELO.md)** - Correções implementadas no orquestrador para execução paralela
- **[MELHORIA_FORMATACAO_SINTETIZADOR.md](MELHORIA_FORMATACAO_SINTETIZADOR.md)** - Melhorias na formatação das respostas do sintetizador
- **[SOLUCAO_MCP_DESPESAS.md](SOLUCAO_MCP_DESPESAS.md)** - Solução implementada para MCP de despesas

---

## 🎯 Como Usar Esta Documentação

### Para Configurar o Workflow n8n

1. Importe [Agente Cidadao - Multi-Agentes.json](Agente%20Cidadao%20-%20Multi-Agentes.json) no n8n
2. Configure credenciais (OpenRouter, Supabase)
3. Consulte [N8N_PROMPTS_ATUALIZADOS.md](N8N_PROMPTS_ATUALIZADOS.md) para entender os prompts
4. Ajuste system messages se necessário

### Para Entender os Agentes

1. [N8N_PROMPTS_ATUALIZADOS.md](N8N_PROMPTS_ATUALIZADOS.md) - Veja todos os prompts
2. [system-message-*.md](.) - Leia os system messages específicos
3. [../architecture/multi_agent_architecture.md](../architecture/multi_agent_architecture.md) - Entenda a arquitetura

### Para Modificar Prompts

1. Leia o prompt atual em [N8N_PROMPTS_ATUALIZADOS.md](N8N_PROMPTS_ATUALIZADOS.md)
2. Entenda o contexto e propósito
3. Teste mudanças localmente
4. Documente alterações importantes
5. Atualize o arquivo correspondente

---

## ⚙️ Estrutura do Workflow

O workflow n8n possui:

### 1. Webhook de Entrada
Recebe requisições do frontend via POST

### 2. Orquestrador (GPT-4o-mini)
- Analisa a pergunta do usuário
- Decide quais agentes acionar
- Roteia para os especialistas apropriados

### 3. Agentes Especialistas
- **Legislativo** (Claude 3.5 Sonnet) - Proposições, tramitações, votações
- **Político** (Claude 3.5 Sonnet) - Deputados, partidos, comissões
- **Fiscal** (Claude 3 Haiku) - Despesas parlamentares (CEAP)

### 4. MCP Server
- Fornece ferramentas para consultar API Câmara
- 23 ferramentas para Legislativo
- 17 ferramentas para Político
- 7 ferramentas para Fiscal

### 5. Sintetizador (Gemini 2.5 Flash)
- Consolida respostas dos agentes
- Formata em Markdown
- Garante coesão e clareza

### 6. Supabase
- Armazena requisições e respostas
- Registra logs de agentes em tempo real

---

## 📝 System Messages

Cada agente possui system messages que definem:

- **Identidade** - Quem é o agente
- **Expertise** - Áreas de conhecimento
- **Ferramentas** - Quais ferramentas MCP pode usar
- **Formato** - Como estruturar as respostas
- **Limitações** - O que não fazer

### Versões Disponíveis

- **Completas** - System messages detalhados com todas as instruções
- **Simplificadas** - Versões enxutas focando no essencial
- **Ultra-simplificadas** - Versões mínimas para testes

---

## 🔗 Links Relacionados

### Arquitetura

- [../architecture/multi_agent_architecture.md](../architecture/multi_agent_architecture.md) - Arquitetura detalhada
- [../architecture/API_DOCUMENTATION.md](../architecture/API_DOCUMENTATION.md) - APIs e integrações

### Deploy

- [../guides/DEPLOY.md](../guides/DEPLOY.md) - Deploy do n8n no Railway

### Planejamento

- [../planning/](../planning/) - Histórico de decisões sobre workflows

---

## 🛠️ Troubleshooting

### Workflow não executa
- Verifique credenciais do OpenRouter
- Confira conexão com Supabase
- Veja logs no n8n

### Agentes não respondem
- Verifique se MCP Server está online
- Teste ferramentas MCP individualmente
- Revise system messages

### Timeout
- Workflow está configurado para 360s (6 minutos)
- Verifique se consultas não estão muito complexas
- Considere otimizar prompts

Para mais detalhes: [../guides/FAQ_TROUBLESHOOTING.md](../guides/FAQ_TROUBLESHOOTING.md)

---

[← Voltar para docs/](../README.md) | [Índice Completo](../../DOCUMENTATION_SUMMARY.md)
