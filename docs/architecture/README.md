# Arquitetura - Agente Cidadão

Documentação técnica sobre a arquitetura, design e especificações do sistema.

## 📚 Documentos Disponíveis

### Documentação Principal

- **[multi_agent_architecture.md](multi_agent_architecture.md)** - Arquitetura detalhada do sistema multi-agentes n8n, incluindo fluxo de dados, agentes especializados e integração com MCP
- **[API_DOCUMENTATION.md](API_DOCUMENTATION.md)** - Documentação completa das APIs (n8n Webhook, Supabase, API Câmara dos Deputados), exemplos e fluxo de dados
- **[especificacao.md](especificacao.md)** - Especificação original do frontend, requisitos e design

### Propostas e Melhorias Arquiteturais

- **[ARQUITETURA_FALLBACK.md](ARQUITETURA_FALLBACK.md)** - Proposta de arquitetura de fallback inteligente para garantir resiliência
- **[proposed_architecture_revisor.md](proposed_architecture_revisor.md)** - Proposta de arquitetura para agente revisor
- **[PROPOSTA_CONSOLIDADOR_CRITICO.md](PROPOSTA_CONSOLIDADOR_CRITICO.md)** - Proposta de consolidador crítico de respostas

### Segurança

- **[SEGURANCA_ISOLAMENTO_SESSOES.md](SEGURANCA_ISOLAMENTO_SESSOES.md)** - Documentação sobre isolamento de sessões e segurança de dados

---

## 🎯 Fluxos de Leitura Recomendados

### Para Entender a Arquitetura Geral

1. [multi_agent_architecture.md](multi_agent_architecture.md) - Comece aqui para entender o sistema completo
2. [API_DOCUMENTATION.md](API_DOCUMENTATION.md) - Entenda como as APIs se integram
3. [especificacao.md](especificacao.md) - Veja como o frontend foi especificado

### Para Desenvolvedores Backend

1. [multi_agent_architecture.md](multi_agent_architecture.md) - Arquitetura completa
2. [API_DOCUMENTATION.md](API_DOCUMENTATION.md) - Integrações de API
3. [../workflows/N8N_PROMPTS_ATUALIZADOS.md](../workflows/N8N_PROMPTS_ATUALIZADOS.md) - Configuração dos agentes

### Para Desenvolvedores Frontend

1. [especificacao.md](especificacao.md) - Especificação do frontend
2. [API_DOCUMENTATION.md](API_DOCUMENTATION.md) - APIs que o frontend consome
3. [../../.env.example](../../.env.example) - Configuração

---

## 🔗 Links Relacionados

- [Workflows e Configurações](../workflows/) - Workflow n8n e system messages
- [Guias Práticos](../guides/) - Deploy e troubleshooting
- [Planejamento](../planning/) - Histórico de decisões arquiteturais

---

[← Voltar para docs/](../README.md) | [Índice Completo](../../DOCUMENTATION_SUMMARY.md)
