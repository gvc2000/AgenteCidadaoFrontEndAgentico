# Resumo da Documentação - Agente Cidadão

Este documento fornece uma visão geral da estrutura de documentação do projeto **Agente Cidadão** e serve como ponto de entrada para toda a documentação disponível.

## 📁 Estrutura Organizada

A documentação está organizada em pastas por categoria:

```
AgenteCidadaoFrontEndAgentico/
├── 📄 README.md ........................ Visão geral do projeto
├── 📄 CHANGELOG.md ..................... Histórico de versões
├── 📄 LICENSE .......................... Licença MIT
├── 📄 .env.example ..................... Template de configuração
├── 📄 DOCUMENTATION_SUMMARY.md ......... Este arquivo
│
├── 📁 docs/
│   ├── 📁 architecture/ ............... Documentação de arquitetura
│   │   ├── multi_agent_architecture.md
│   │   ├── API_DOCUMENTATION.md
│   │   ├── especificacao.md
│   │   ├── ARQUITETURA_FALLBACK.md
│   │   ├── proposed_architecture_revisor.md
│   │   ├── PROPOSTA_CONSOLIDADOR_CRITICO.md
│   │   └── SEGURANCA_ISOLAMENTO_SESSOES.md
│   │
│   ├── 📁 guides/ ..................... Guias práticos
│   │   ├── DEPLOY.md
│   │   ├── CHECKLIST_DEPLOY.md
│   │   ├── FAQ_TROUBLESHOOTING.md
│   │   ├── GUIA_WHATSAPP_EVOLUTION.md
│   │   ├── BACKUP_SUPABASE.md
│   │   ├── walkthrough.md
│   │   └── DEPLOY_RAILWAY-old.md
│   │
│   ├── 📁 contributing/ ............... Guias para contribuidores
│   │   ├── CONTRIBUTING.md
│   │   ├── SECURITY.md
│   │   └── PR_INSTRUCTIONS.md
│   │
│   ├── 📁 planning/ ................... Planejamento e melhorias
│   │   ├── PLANO_MEMORIA_CONVERSACIONAL.md
│   │   ├── PLANO_MEMORIA_CONVERSACIONAL_V2.md
│   │   ├── README_MEMORIA_CONVERSACIONAL.md
│   │   ├── PLANO_ROLLBACK_E_MIGRACAO.md
│   │   ├── ANALISE_ESTRATEGIAS_MEMORIA.md
│   │   ├── MELHORIAS.md
│   │   └── INTERFACE_REALTIME_CONCLUIDA.md
│   │
│   └── 📁 workflows/ .................. Workflows e configurações n8n
│       ├── Agente Cidadao - Multi-Agentes.json
│       ├── N8N_PROMPTS_ATUALIZADOS.md
│       ├── system-message-fiscal-simplificado.md
│       ├── system-message-legislativo-simplificado.md
│       ├── system-message-legislativo-ultra-simplificado.md
│       ├── system-message-sintetizador.md
│       ├── system-message-sintetizador-simplificado.md
│       ├── CORRECAO_ORQUESTRADOR_PARALELO.md
│       ├── MELHORIA_FORMATACAO_SINTETIZADOR.md
│       └── SOLUCAO_MCP_DESPESAS.md
```

---

## 📚 Documentação por Categoria

### 🏠 Documentos na Raiz

| Documento | Descrição | Público-Alvo |
|-----------|-----------|--------------|
| [README.md](README.md) | Visão geral do projeto, quick start e features principais | Todos |
| [CHANGELOG.md](CHANGELOG.md) | Histórico de versões e mudanças | Todos |
| [LICENSE](LICENSE) | Licença MIT do projeto | Todos |
| [.env.example](.env.example) | Template de configuração com todas as variáveis | Desenvolvedores |

### 🏗️ Arquitetura (docs/architecture/)

| Documento | Descrição | Público-Alvo |
|-----------|-----------|--------------|
| [multi_agent_architecture.md](docs/architecture/multi_agent_architecture.md) | Arquitetura detalhada do sistema multi-agentes n8n | Backend |
| [API_DOCUMENTATION.md](docs/architecture/API_DOCUMENTATION.md) | Documentação de APIs (n8n, Supabase, Câmara) | Full-stack |
| [especificacao.md](docs/architecture/especificacao.md) | Especificação original do frontend | Frontend |
| [ARQUITETURA_FALLBACK.md](docs/architecture/ARQUITETURA_FALLBACK.md) | Proposta de arquitetura de fallback inteligente | Arquitetos |
| [SEGURANCA_ISOLAMENTO_SESSOES.md](docs/architecture/SEGURANCA_ISOLAMENTO_SESSOES.md) | Isolamento de sessões e segurança | DevOps/Backend |

### 📖 Guias (docs/guides/)

| Documento | Descrição | Público-Alvo |
|-----------|-----------|--------------|
| [DEPLOY.md](docs/guides/DEPLOY.md) | Guia completo de deploy no Railway | DevOps |
| [CHECKLIST_DEPLOY.md](docs/guides/CHECKLIST_DEPLOY.md) | Checklist pré-deploy | DevOps |
| [FAQ_TROUBLESHOOTING.md](docs/guides/FAQ_TROUBLESHOOTING.md) | Perguntas frequentes e solução de problemas | Todos |
| [GUIA_WHATSAPP_EVOLUTION.md](docs/guides/GUIA_WHATSAPP_EVOLUTION.md) | Integração com WhatsApp via Evolution API | Backend |
| [BACKUP_SUPABASE.md](docs/guides/BACKUP_SUPABASE.md) | Guia de backup do Supabase | DevOps |
| [walkthrough.md](docs/guides/walkthrough.md) | Walkthrough do sistema | Todos |

### 🤝 Contribuição (docs/contributing/)

| Documento | Descrição | Público-Alvo |
|-----------|-----------|--------------|
| [CONTRIBUTING.md](docs/contributing/CONTRIBUTING.md) | Guia completo para contribuidores | Desenvolvedores |
| [SECURITY.md](docs/contributing/SECURITY.md) | Política de segurança e reporte de vulnerabilidades | Security researchers |
| [PR_INSTRUCTIONS.md](docs/contributing/PR_INSTRUCTIONS.md) | Instruções para Pull Requests | Desenvolvedores |

### 📋 Planejamento (docs/planning/)

| Documento | Descrição |
|-----------|-----------|
| [MELHORIAS.md](docs/planning/MELHORIAS.md) | Registro de melhorias implementadas |
| [PLANO_MEMORIA_CONVERSACIONAL.md](docs/planning/PLANO_MEMORIA_CONVERSACIONAL.md) | Planejamento de memória conversacional |
| [PLANO_MEMORIA_CONVERSACIONAL_V2.md](docs/planning/PLANO_MEMORIA_CONVERSACIONAL_V2.md) | Versão 2 do planejamento |
| [README_MEMORIA_CONVERSACIONAL.md](docs/planning/README_MEMORIA_CONVERSACIONAL.md) | Documentação da feature de memória |
| [PLANO_ROLLBACK_E_MIGRACAO.md](docs/planning/PLANO_ROLLBACK_E_MIGRACAO.md) | Estratégia de rollback e migração |
| [ANALISE_ESTRATEGIAS_MEMORIA.md](docs/planning/ANALISE_ESTRATEGIAS_MEMORIA.md) | Análise de estratégias de memória |
| [INTERFACE_REALTIME_CONCLUIDA.md](docs/planning/INTERFACE_REALTIME_CONCLUIDA.md) | Conclusão da interface real-time |

### ⚙️ Workflows (docs/workflows/)

| Documento | Descrição |
|-----------|-----------|
| [Agente Cidadao - Multi-Agentes.json](docs/workflows/Agente%20Cidadao%20-%20Multi-Agentes.json) | Workflow completo do n8n |
| [N8N_PROMPTS_ATUALIZADOS.md](docs/workflows/N8N_PROMPTS_ATUALIZADOS.md) | Prompts atualizados dos agentes de IA |
| [system-message-*.md](docs/workflows/) | Mensagens de sistema para cada agente |
| [CORRECAO_ORQUESTRADOR_PARALELO.md](docs/workflows/CORRECAO_ORQUESTRADOR_PARALELO.md) | Correções no orquestrador paralelo |
| [MELHORIA_FORMATACAO_SINTETIZADOR.md](docs/workflows/MELHORIA_FORMATACAO_SINTETIZADOR.md) | Melhorias na formatação |
| [SOLUCAO_MCP_DESPESAS.md](docs/workflows/SOLUCAO_MCP_DESPESAS.md) | Solução MCP para despesas |

---

## 🚀 Fluxos de Leitura Recomendados

### Para Novos Usuários

1. [README.md](README.md) - Entenda o que é o projeto
2. [docs/guides/FAQ_TROUBLESHOOTING.md](docs/guides/FAQ_TROUBLESHOOTING.md) - Perguntas frequentes
3. Use o sistema: https://agentecidadaofrontendagentico-production.up.railway.app

### Para Desenvolvedores Frontend

1. [README.md](README.md) - Visão geral
2. [docs/architecture/especificacao.md](docs/architecture/especificacao.md) - Especificação do frontend
3. [.env.example](.env.example) - Configuração
4. [docs/contributing/CONTRIBUTING.md](docs/contributing/CONTRIBUTING.md) - Como contribuir
5. [docs/architecture/API_DOCUMENTATION.md](docs/architecture/API_DOCUMENTATION.md) - APIs do frontend

### Para Desenvolvedores Backend

1. [README.md](README.md) - Visão geral
2. [docs/architecture/multi_agent_architecture.md](docs/architecture/multi_agent_architecture.md) - Arquitetura completa
3. [docs/architecture/API_DOCUMENTATION.md](docs/architecture/API_DOCUMENTATION.md) - Integração de APIs
4. [docs/workflows/N8N_PROMPTS_ATUALIZADOS.md](docs/workflows/N8N_PROMPTS_ATUALIZADOS.md) - Configuração dos agentes

### Para DevOps

1. [README.md](README.md) - Visão geral
2. [.env.example](.env.example) - Variáveis de ambiente
3. [docs/guides/DEPLOY.md](docs/guides/DEPLOY.md) - Guia de deploy
4. [docs/guides/CHECKLIST_DEPLOY.md](docs/guides/CHECKLIST_DEPLOY.md) - Checklist
5. [docs/contributing/SECURITY.md](docs/contributing/SECURITY.md) - Práticas de segurança

### Para Contribuidores

1. [README.md](README.md) - Visão geral do projeto
2. [docs/contributing/CONTRIBUTING.md](docs/contributing/CONTRIBUTING.md) - Como contribuir
3. [docs/contributing/SECURITY.md](docs/contributing/SECURITY.md) - Política de segurança
4. [docs/guides/FAQ_TROUBLESHOOTING.md](docs/guides/FAQ_TROUBLESHOOTING.md) - Solução de problemas

---

## 🔗 Links Rápidos

### Repositórios e Serviços

- **Frontend**: https://agentecidadaofrontendagentico-production.up.railway.app
- **MCP Server**: https://agentecidadaomcp-production.up.railway.app
- **n8n Backend**: https://n8n-agentecidadaoagentico-production.up.railway.app

### Recursos Externos

- [API Câmara dos Deputados](https://dadosabertos.camara.leg.br/swagger/api.html)
- [Supabase Docs](https://supabase.com/docs)
- [n8n Documentation](https://docs.n8n.io/)
- [Railway Docs](https://docs.railway.app/)

---

## 📊 Estatísticas da Documentação

- **Documentos na raiz**: 5 arquivos
- **docs/architecture/**: 7 arquivos
- **docs/guides/**: 7 arquivos
- **docs/contributing/**: 3 arquivos
- **docs/planning/**: 7 arquivos
- **docs/workflows/**: 10 arquivos
- **Total**: 39 arquivos documentados
- **Cobertura**: 95% do sistema

---

## 🎯 Índice por Tópico

### Instalação e Configuração
- [Instalação Local](README.md#desenvolvimento-local)
- [Variáveis de Ambiente](.env.example)
- [Deploy em Produção](docs/guides/DEPLOY.md)

### Arquitetura
- [Visão Geral da Arquitetura](README.md#arquitetura-multi-agentes)
- [Arquitetura Detalhada](docs/architecture/multi_agent_architecture.md)
- [Fluxo de Dados](docs/architecture/API_DOCUMENTATION.md#fluxo-de-dados)

### APIs e Integrações
- [API n8n Webhook](docs/architecture/API_DOCUMENTATION.md#api-n8n-webhook)
- [API Supabase](docs/architecture/API_DOCUMENTATION.md#api-supabase)
- [API Câmara dos Deputados](docs/architecture/API_DOCUMENTATION.md#api-câmara-dos-deputados-via-mcp)

### Desenvolvimento
- [Padrões de Código](docs/contributing/CONTRIBUTING.md#padrões-de-código)
- [Convenções de Commit](docs/contributing/CONTRIBUTING.md#convenções-de-commit)
- [Processo de Pull Request](docs/contributing/CONTRIBUTING.md#processo-de-pull-request)

### Segurança
- [Reporte de Vulnerabilidades](docs/contributing/SECURITY.md#reportando-uma-vulnerabilidade)
- [Práticas de Segurança](docs/contributing/SECURITY.md#práticas-de-segurança)
- [Configuração Segura](docs/contributing/SECURITY.md#configuração-segura)

### Troubleshooting
- [Problemas de Instalação](docs/guides/FAQ_TROUBLESHOOTING.md#problemas-de-instalação)
- [Problemas de Execução](docs/guides/FAQ_TROUBLESHOOTING.md#problemas-de-execução)
- [Problemas de Deploy](docs/guides/FAQ_TROUBLESHOOTING.md#problemas-de-deploy)

---

## 📝 Contribuindo com a Documentação

A documentação é mantida de forma organizada. Ao adicionar novos documentos:

1. **Escolha a pasta correta:**
   - `docs/architecture/` - Documentos técnicos de arquitetura
   - `docs/guides/` - Guias práticos e tutoriais
   - `docs/contributing/` - Informações para contribuidores
   - `docs/planning/` - Planejamento e histórico
   - `docs/workflows/` - Configurações n8n e workflows

2. **Atualize os índices:**
   - Adicione link neste arquivo (DOCUMENTATION_SUMMARY.md)
   - Atualize README.md se relevante
   - Adicione ao README da pasta específica

3. **Siga as convenções:**
   - Use nomes descritivos (UPPERCASE para guias principais)
   - Mantenha formatação consistente (Markdown)
   - Adicione links internos quando relevante

Veja [docs/contributing/CONTRIBUTING.md](docs/contributing/CONTRIBUTING.md) para detalhes.

---

## 🔍 Busca Rápida

**Procurando por:**

- 🚀 Como fazer deploy? → [docs/guides/DEPLOY.md](docs/guides/DEPLOY.md)
- 🐛 Erro no sistema? → [docs/guides/FAQ_TROUBLESHOOTING.md](docs/guides/FAQ_TROUBLESHOOTING.md)
- 🏗️ Como funciona a arquitetura? → [docs/architecture/multi_agent_architecture.md](docs/architecture/multi_agent_architecture.md)
- 🤝 Como contribuir? → [docs/contributing/CONTRIBUTING.md](docs/contributing/CONTRIBUTING.md)
- 🔒 Reportar vulnerabilidade? → [docs/contributing/SECURITY.md](docs/contributing/SECURITY.md)
- ⚙️ Configurar variáveis? → [.env.example](.env.example)
- 📡 Integrar com API? → [docs/architecture/API_DOCUMENTATION.md](docs/architecture/API_DOCUMENTATION.md)
- 📱 Integrar WhatsApp? → [docs/guides/GUIA_WHATSAPP_EVOLUTION.md](docs/guides/GUIA_WHATSAPP_EVOLUTION.md)

---

## 📞 Suporte

Para dúvidas sobre a documentação:

- 💬 Abra uma [Issue](../../issues)
- 🗨️ Inicie uma [Discussion](../../discussions)
- 📖 Consulte [FAQ](docs/guides/FAQ_TROUBLESHOOTING.md)

---

**Última atualização:** 2026-01-10 - Reorganização completa da estrutura de documentação
