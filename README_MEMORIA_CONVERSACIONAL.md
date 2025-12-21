# Memória Conversacional - Guia Completo de Implementação

**Versão:** 1.0
**Data:** 14/12/2024
**Status:** Documentação Completa

---

## 📚 Visão Geral

Esta pasta contém toda a documentação necessária para implementar, com **segurança** e **possibilidade de rollback**, a funcionalidade de memória conversacional no Agente Cidadão.

---

## 📖 Documentos Disponíveis

### 1️⃣ [PLANO_MEMORIA_CONVERSACIONAL.md](PLANO_MEMORIA_CONVERSACIONAL.md)
**📋 Plano Principal de Implementação**

**O que contém:**
- ✅ Análise detalhada do problema
- ✅ Arquitetura da solução (3 camadas)
- ✅ Estrutura de dados (SQL completo)
- ✅ Código TypeScript completo (SessionManager)
- ✅ Modificações no n8n
- ✅ Exemplos de fluxo completo
- ✅ Métricas de sucesso
- ✅ Plano de rollout em 5 sprints

**Leia este documento primeiro** para entender a solução completa.

---

### 2️⃣ [SEGURANCA_ISOLAMENTO_SESSOES.md](SEGURANCA_ISOLAMENTO_SESSOES.md)
**🔒 Segurança e Isolamento entre Usuários**

**O que contém:**
- ✅ 4 camadas de proteção de dados
- ✅ Row Level Security (RLS) completo
- ✅ Políticas SQL de isolamento
- ✅ Testes de segurança automatizados
- ✅ Análise de vulnerabilidades
- ✅ Cenários de ataque e mitigações
- ✅ Garantia: **Usuário A NUNCA vê dados do Usuário B**

**Leia este documento** para garantir que a privacidade dos usuários está protegida.

---

### 3️⃣ [PLANO_ROLLBACK_E_MIGRACAO.md](PLANO_ROLLBACK_E_MIGRACAO.md)
**⏪ Rollback e Migração Segura**

**O que contém:**
- ✅ 4 migrations completas (UP e DOWN)
- ✅ Scripts de deploy automatizado
- ✅ Procedimentos de rollback total e parcial
- ✅ Estratégia de backup e recuperação
- ✅ Feature flags para rollout gradual
- ✅ Monitoramento durante deploy
- ✅ Checklists de deploy e rollback

**Leia este documento** antes de fazer deploy em produção.

---

## 🎯 Ordem de Leitura Recomendada

```
1. PLANO_MEMORIA_CONVERSACIONAL.md
   ├─ Entender o problema
   ├─ Conhecer a solução
   └─ Ver arquitetura

2. SEGURANCA_ISOLAMENTO_SESSOES.md
   ├─ Validar proteções de dados
   ├─ Revisar políticas RLS
   └─ Aprovar testes de segurança

3. PLANO_ROLLBACK_E_MIGRACAO.md
   ├─ Revisar migrations
   ├─ Testar procedimentos de rollback
   └─ Preparar deploy
```

---

## 🚀 Quick Start

### Pré-requisitos

```bash
# Dependências necessárias
npm install uuid
npm install @supabase/supabase-js

# Supabase CLI (para migrations)
npm install -g supabase
```

### Passo 1: Criar Estrutura de Migrations

```bash
mkdir -p supabase/migrations

# Copiar migrations do PLANO_ROLLBACK_E_MIGRACAO.md
# para supabase/migrations/
```

### Passo 2: Deploy Backend (DEV primeiro!)

```bash
# 1. Backup
supabase db dump -f backup_$(date +%Y%m%d).sql

# 2. Aplicar migrations
supabase migration up 20241214000001_add_conversation_tables.sql
supabase migration up 20241214000002_add_rls_policies.sql
supabase migration up 20241214000003_alter_requests_table.sql
supabase migration up 20241214000004_add_helper_functions.sql

# 3. Verificar
supabase db diff
```

### Passo 3: Implementar Frontend

```bash
# 1. Criar SessionManager
# (código completo em PLANO_MEMORIA_CONVERSACIONAL.md seção 2.1)
touch src/lib/sessionManager.ts

# 2. Modificar supabase client
# (código em SEGURANCA_ISOLAMENTO_SESSOES.md seção 3)

# 3. Modificar App.tsx
# (código em PLANO_MEMORIA_CONVERSACIONAL.md seção 2.2)
```

### Passo 4: Testar

```bash
# Testes de segurança (copiar de SEGURANCA_ISOLAMENTO_SESSOES.md)
npm test -- security/session-isolation.test.ts

# Testes de fluxo
npm test -- e2e/conversation-memory.test.ts
```

### Passo 5: Deploy Gradual

```bash
# Dia 1: 10%
export VITE_ENABLE_CONVERSATION_MEMORY=true
export VITE_MEMORY_ROLLOUT_PERCENT=10
npm run build && npm run deploy

# Dia 3: 50%
export VITE_MEMORY_ROLLOUT_PERCENT=50
npm run build && npm run deploy

# Dia 7: 100%
export VITE_MEMORY_ROLLOUT_PERCENT=100
npm run build && npm run deploy
```

---

## 🔄 Procedimentos de Emergência

### Rollback Total (Reverter Tudo)

```bash
# Executar script de rollback
chmod +x scripts/rollback_full.sh
./scripts/rollback_full.sh

# Desabilitar feature no frontend
export VITE_ENABLE_CONVERSATION_MEMORY=false
npm run build && npm run deploy
```

### Rollback Parcial (Apenas Desabilitar)

```bash
# Manter banco, desabilitar feature
export VITE_ENABLE_CONVERSATION_MEMORY=false
npm run build && npm run deploy
```

### Restaurar de Backup

```bash
# Restaurar backup específico
psql -f backup_20241214.sql
```

---

## 📊 Métricas de Sucesso

### KPIs a Monitorar (Primeira Semana)

```sql
-- 1. Adoção da feature
SELECT COUNT(DISTINCT session_id) as users_using_memory
FROM conversations
WHERE created_at > NOW() - INTERVAL '7 days';

-- 2. Engagement (perguntas por conversa)
SELECT AVG(msg_count) as avg_questions_per_conversation
FROM (
  SELECT conversation_id, COUNT(*) as msg_count
  FROM messages
  WHERE role = 'user'
  AND created_at > NOW() - INTERVAL '7 days'
  GROUP BY conversation_id
) stats;

-- 3. Taxa de erro
SELECT
  COUNT(*) FILTER (WHERE status = 'failed') * 100.0 / COUNT(*) as error_rate
FROM requests
WHERE created_at > NOW() - INTERVAL '1 day';
```

### Metas Esperadas

- ✅ **Adoção:** 60%+ dos usuários ativos
- ✅ **Engagement:** +40% perguntas por sessão
- ✅ **Taxa de erro:** < 2%
- ✅ **Performance:** Latência < 500ms

---

## ⚠️ Troubleshooting

### Problema: Usuário não consegue acessar histórico

**Causa:** Session ID alterado ou perdido

**Solução:**
```typescript
// Verificar no console do navegador
console.log(localStorage.getItem('agente_cidadao_session_id'));

// Se vazio, novo session_id será criado automaticamente
```

### Problema: RLS bloqueando acessos legítimos

**Causa:** Header `x-session-id` não está sendo enviado

**Solução:**
```typescript
// Verificar se supabase client tem headers
const supabase = createClient(url, key, {
  global: {
    headers: {
      'x-session-id': sessionManager.getSessionId()
    }
  }
});
```

### Problema: Migration falhou

**Causa:** Constraint ou dependência conflitante

**Solução:**
```bash
# 1. Verificar log de erro
supabase db logs

# 2. Rollback da migration específica
supabase migration down 20241214000XXX_migration_name_down.sql

# 3. Corrigir e reaplicar
supabase migration up 20241214000XXX_migration_name_fixed.sql
```

---

## 📞 Suporte e Contato

### Equipe Responsável

- **Backend/DB:** [Nome/Email]
- **Frontend:** [Nome/Email]
- **N8N:** [Nome/Email]
- **Segurança:** [Nome/Email]

### Canais de Comunicação

- **Slack:** #agente-cidadao-dev
- **Email:** dev@agentecidadao.com
- **Issues:** GitHub Issues

---

## 📅 Histórico de Versões

| Versão | Data | Mudanças | Autor |
|--------|------|----------|-------|
| 1.0 | 2024-12-14 | Documentação inicial completa | Claude Code |

---

## ✅ Checklist de Aprovação

Antes de iniciar implementação, confirmar:

- [ ] Equipe revisou e aprovou os 3 documentos
- [ ] Arquitetura validada pelo tech lead
- [ ] Políticas de segurança aprovadas
- [ ] Procedimentos de rollback testados em DEV
- [ ] Janela de manutenção agendada (se necessário)
- [ ] Backup automático configurado
- [ ] Monitoramento preparado
- [ ] Stakeholders informados

---

## 🎓 Recursos Adicionais

### Documentação Técnica

- [Supabase RLS](https://supabase.com/docs/guides/auth/row-level-security)
- [LangChain Memory](https://js.langchain.com/docs/modules/memory/)
- [N8N AI Agents](https://docs.n8n.io/integrations/builtin/cluster-nodes/root-nodes/n8n-nodes-langchain.agent/)

### Exemplos de Código

- [SessionManager.ts](PLANO_MEMORIA_CONVERSACIONAL.md#21-criar-serviço-de-sessão)
- [Migrations SQL](PLANO_ROLLBACK_E_MIGRACAO.md#-migration-1-criar-tabelas-novas)
- [Testes de Segurança](SEGURANCA_ISOLAMENTO_SESSOES.md#-testes-de-segurança)

---

**Última atualização:** 14/12/2024
**Mantido por:** Equipe Agente Cidadão
**Licença:** Uso interno
