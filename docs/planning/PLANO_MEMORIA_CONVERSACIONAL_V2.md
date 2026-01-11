# Plano de Implementação: Memória Conversacional V2.1

**Data:** 05/01/2026  
**Versão:** 2.1 (ajustada para conta gratuita Supabase)  
**Status:** Pronto para Implementação

---

## 📋 Índice

1. [Visão Geral](#-visão-geral)
2. [Divisão de Tarefas](#-divisão-de-tarefas)
3. [Fase 1: Preparação e Backup](#-fase-1-preparação-e-backup)
4. [Fase 2: Backend (Supabase)](#-fase-2-backend-supabase)
5. [Fase 3: Frontend](#-fase-3-frontend)
6. [Fase 4: N8N Workflow (MANUAL)](#-fase-4-n8n-workflow-manual)
7. [Fase 5: Testes e Validação](#-fase-5-testes-e-validação)
8. [Fase 6: Deploy](#-fase-6-deploy)
9. [Rollback (Reversão)](#-rollback-reversão)
10. [Troubleshooting](#-troubleshooting)

---

## 🎯 Visão Geral

### Problema
O sistema atual não mantém contexto entre perguntas. Cada pergunta é tratada independentemente.

### Solução
Implementar memória conversacional com:
- ✅ Agentes **stateless** (sem memória interna)
- ✅ Contexto gerenciado no **frontend** e enviado ao n8n
- ✅ Entidades extraídas pelo **LLM** (não por regex)
- ✅ Cache de IDs já resolvidos
- ✅ Feature flag para rollback instantâneo

---

## 👥 Divisão de Tarefas

> [!IMPORTANT]
> Esta seção deixa claro **quem faz o quê**.

### 🤖 O que o GEMINI pode fazer automaticamente:

| Fase | Tarefa | Ferramenta |
|------|--------|------------|
| 2 | Criar arquivo SQL de migrations | Gerar arquivo |
| 3 | Criar `sessionManager.ts` | Gerar arquivo |
| 3 | Modificar `App.tsx` | Editar código |
| 3 | Adicionar feature flag no `.env.local` | Editar arquivo |

### 👤 O que VOCÊ deve fazer manualmente:

| Fase | Tarefa | Onde |
|------|--------|------|
| 1 | Fazer backup do Supabase via SQL | SQL Editor do Supabase |
| 1 | Exportar workflow n8n atual | Interface do n8n |
| 2 | Executar SQL de migrations | SQL Editor do Supabase |
| 4 | **Modificar workflow n8n** | Interface do n8n |
| 5 | Testar o sistema | Navegador |
| 6 | Deploy | Railway/Vercel |

---

## 📦 Fase 1: Preparação e Backup

> [!CAUTION]
> **NÃO pule esta fase!** O backup é seu ponto de retorno seguro.

### 👤 Passo 1.1: Backup do Supabase (VOCÊ FAZ)

**Como sua conta é gratuita, use o SQL Editor:**

1. Acesse: https://supabase.com/dashboard/project/jcrfrclxegganatpntgi/sql
2. Execute e **salve o resultado** em um arquivo texto:

```sql
-- ========================================
-- BACKUP MANUAL - ESTRUTURA DAS TABELAS
-- Execute e copie o resultado para um arquivo
-- ========================================

-- 1. Ver estrutura atual
SELECT 
  table_name,
  column_name,
  data_type,
  is_nullable,
  column_default
FROM information_schema.columns
WHERE table_schema = 'public'
  AND table_name IN ('requests', 'agent_logs')
ORDER BY table_name, ordinal_position;

-- 2. Contar registros (anote esses números!)
SELECT 'requests' as tabela, COUNT(*) as total FROM requests
UNION ALL
SELECT 'agent_logs' as tabela, COUNT(*) as total FROM agent_logs;
```

3. **Anote em um arquivo** (ex: `backup_20260105.txt`):
   - requests: _____ registros
   - agent_logs: _____ registros
   - Data/hora do backup: _____

### 👤 Passo 1.2: Backup do Workflow N8N (VOCÊ FAZ)

1. Acesse seu N8N
2. Abra o workflow **"Agente Cidadao - Multi-Agentes"**
3. Clique no menu **⋮** (três pontos) no canto superior direito
4. Selecione **"Download"**
5. Salve como `workflow_backup_20260105.json` em local seguro

### 👤 Passo 1.3: Backup do Código Git (VOCÊ FAZ)

Execute no terminal:

```powershell
cd c:\Users\g_cav\projects\AgenteCidadao\AgenteCidadaoFrontEndAgentico
git add .
git stash
git checkout -b backup/pre-memoria-conversacional
git push origin backup/pre-memoria-conversacional
git checkout main
git stash pop
```

### ✅ Checklist Fase 1

- [ ] Resultado do SQL do Supabase salvo em arquivo texto
- [ ] Contagem de registros anotada
- [ ] Workflow n8n baixado como JSON
- [ ] Branch de backup criado no Git

---

## 🗄️ Fase 2: Backend (Supabase)

### 🤖 Passo 2.1: Gerar Script SQL (GEMINI FAZ)

O Gemini vai criar o arquivo `migrations/001_memoria_conversacional.sql` com todo o SQL necessário.

### 👤 Passo 2.2: Executar no Supabase (VOCÊ FAZ)

1. Acesse: https://supabase.com/dashboard/project/jcrfrclxegganatpntgi/sql
2. Copie o conteúdo do arquivo `migrations/001_memoria_conversacional.sql`
3. Cole no SQL Editor
4. Clique em **"Run"**
5. Verifique se executou sem erros

### 👤 Passo 2.3: Verificar (VOCÊ FAZ)

Execute esta query para confirmar:

```sql
-- Verificar se as tabelas foram criadas
SELECT table_name 
FROM information_schema.tables 
WHERE table_schema = 'public' 
  AND table_name IN ('conversations', 'messages');

-- Deve retornar 2 linhas: conversations e messages
```

---

## 💻 Fase 3: Frontend

### 🤖 Passo 3.1: Criar SessionManager (GEMINI FAZ)

O Gemini vai criar o arquivo `src/lib/sessionManager.ts`.

### 🤖 Passo 3.2: Modificar App.tsx (GEMINI FAZ)

O Gemini vai modificar `src/App.tsx` para integrar o SessionManager.

### 🤖 Passo 3.3: Adicionar Feature Flag (GEMINI FAZ)

O Gemini vai adicionar no `.env.local`:

```env
VITE_ENABLE_CONVERSATION_MEMORY=false
```

### 👤 Passo 3.4: Instalar Dependência (VOCÊ FAZ)

Execute no terminal:

```powershell
npm install uuid
npm install @types/uuid --save-dev
```

---

## ⚙️ Fase 4: N8N Workflow (MANUAL)

> [!IMPORTANT]
> Esta fase é **100% manual**. O System Message do N8N é **texto puro** (não suporta expressões dinâmicas no campo de prompt). O contexto é passado automaticamente pelo campo `text` do agente.

### 👤 Passo 4.1: Abrir o Workflow

1. Acesse seu N8N
2. Abra o workflow **"Agente Cidadao - Multi-Agentes"**

### 👤 Passo 4.2: Modificar o ORQUESTRADOR

1. Clique no node **"Orquestrador"**
2. No campo **"Text"** (prompt do usuário), verifique se está assim:
   ```
   ={{ $('Webhook Chat').item.json.body.record.content }}
   ```
3. **Modifique** para incluir o contexto:
   ```
   ={{ $('Webhook Chat').item.json.body.record.content }}

   CONTEXTO (se disponível): {{ JSON.stringify($('Webhook Chat').item.json.body.record.context || {}) }}
   ```

4. No campo **"System Message"**, **ADICIONE NO INÍCIO** (texto puro):

```
## INSTRUÇÕES DE CONTEXTO

Você pode receber um objeto CONTEXTO junto com a pergunta do usuário. Este contexto contém:
- previous_questions: lista das últimas perguntas feitas pelo usuário
- entities_in_focus: entidades mencionadas anteriormente (deputados, proposições, partidos)

**REGRAS OBRIGATÓRIAS:**
1. Se o usuário usar pronomes (ele, ela, isso, esse, este), consulte entities_in_focus para identificar a quem se refere
2. Se entities_in_focus.deputado existir e a pergunta for sobre "ele" ou sobre gastos/despesas, use o ID do deputado do contexto
3. Se a pergunta for ambígua, assuma que se refere à última entidade mencionada
4. Passe o contexto relevante para os agentes especialistas

---

```

5. Clique em **"Save"**

### 👤 Passo 4.3: Modificar o AGENTE POLÍTICO

1. Clique no node **"Agente Político"**
2. **ADICIONE NO INÍCIO** do System Message (texto puro):

```
## INSTRUÇÕES DE CONTEXTO

Se você receber um CONTEXTO com entities_in_focus.deputado, isso significa que o usuário já perguntou sobre esse deputado antes.

REGRAS:
- Se entities_in_focus.deputado tiver um "id", USE ESSE ID diretamente nas ferramentas
- NÃO chame buscar_deputados se você já tem o ID no contexto
- Exemplo: se contexto tem deputado.id = 204534, use diretamente em detalhar_deputado, orgaos_deputado, etc.

---

```

3. Salve

### 👤 Passo 4.4: Modificar o AGENTE FISCAL

1. Clique no node **"Agente Fiscal"**
2. **ADICIONE NO INÍCIO** do System Message (texto puro):

```
## INSTRUÇÕES DE CONTEXTO

Se você receber um CONTEXTO com entities_in_focus.deputado, use o ID desse deputado para buscar despesas.

REGRAS:
- Se o contexto tiver deputado.id, use-o diretamente na ferramenta despesas_deputado
- NÃO peça ao usuário para especificar o deputado se ele já está no contexto
- Exemplo: contexto tem deputado.id = 204534 → chame despesas_deputado(idDeputado=204534)

---

```

3. Salve

### 👤 Passo 4.5: Modificar o AGENTE LEGISLATIVO

1. Clique no node **"Agente Legislativo"**
2. **ADICIONE NO INÍCIO** do System Message (texto puro):

```
## INSTRUÇÕES DE CONTEXTO

Se você receber um CONTEXTO, use as informações de entities_in_focus para contextualizar a busca.

REGRAS:
- Se entities_in_focus.proposicao existir, use o ID para buscar detalhes
- Se entities_in_focus.deputado existir, pode ser relevante para buscar proposições do autor
- Use o contexto para entender referências como "essa proposição" ou "esse PL"

---

```

3. Salve

### 👤 Passo 4.6: Modificar o SINTETIZADOR

1. Clique no node **"Sintetizador"** (ou "Consolidador")
2. **ADICIONE NO FINAL** do System Message (texto puro):

```

---

## EXTRAÇÃO DE ENTIDADES (OBRIGATÓRIO)

Ao final de TODA resposta, você DEVE incluir um bloco JSON oculto com as entidades identificadas.
Este bloco será usado para manter o contexto nas próximas perguntas.

Formato EXATO (copie e preencha):

<!-- ENTITIES
{
  "deputados": [{"nome": "Nome Completo do Deputado", "id": 123456}],
  "proposicoes": [{"numero": "PL 1234/2024", "id": 789012}],
  "partidos": ["SIGLA1", "SIGLA2"]
}
-->

REGRAS:
- Só inclua entidades que foram CITADAS na resposta
- Use o ID REAL se disponível (das ferramentas consultadas)
- Se não houver entidades, use arrays vazios: {"deputados": [], "proposicoes": [], "partidos": []}
- Este bloco é INVISÍVEL para o usuário mas ESSENCIAL para o sistema

```

3. Salve

### 👤 Passo 4.7: Salvar e Ativar o Workflow

1. Clique em **"Save"** no canto superior direito
2. Verifique se o workflow está **ativo** (toggle verde)

### ✅ Checklist Fase 4

- [ ] Orquestrador: campo Text inclui contexto + System Message com instruções
- [ ] Agente Político: System Message com instruções de contexto
- [ ] Agente Fiscal: System Message com instruções de contexto
- [ ] Agente Legislativo: System Message com instruções de contexto
- [ ] Sintetizador: extração de entidades adicionada no final
- [ ] Workflow salvo e ativo

---

## 🧪 Fase 5: Testes e Validação

### 👤 Passo 5.1: Testar SEM memória (VOCÊ FAZ)

1. Confirme que `VITE_ENABLE_CONVERSATION_MEMORY=false` no `.env.local`
2. Execute: `npm run dev`
3. Acesse http://localhost:5173
4. Faça uma pergunta qualquer
5. ✅ Deve funcionar normalmente

### 👤 Passo 5.2: Testar COM memória (VOCÊ FAZ)

1. Mude no `.env.local`: `VITE_ENABLE_CONVERSATION_MEMORY=true`
2. Reinicie o servidor: `Ctrl+C` e `npm run dev`
3. Teste esta sequência:

| # | Pergunta | Resposta Esperada |
|---|----------|-------------------|
| 1 | "Quem é Nikolas Ferreira?" | Perfil do deputado |
| 2 | "Quanto ele gastou em 2024?" | Despesas (deve entender que "ele" = Nikolas) |
| 3 | "Em quais comissões ele participa?" | Comissões do Nikolas |

### 👤 Passo 5.3: Verificar no Supabase (VOCÊ FAZ)

Execute no SQL Editor:

```sql
-- Verificar conversas criadas
SELECT id, session_id, created_at FROM conversations ORDER BY created_at DESC LIMIT 5;

-- Verificar mensagens salvas
SELECT m.role, LEFT(m.content, 50) as inicio, m.entities
FROM messages m
JOIN conversations c ON m.conversation_id = c.id
ORDER BY m.created_at DESC LIMIT 10;

-- Verificar contexto nos requests
SELECT id, LEFT(user_query, 30) as pergunta, context->'entities_in_focus' as entidades
FROM requests
WHERE context != '{}'
ORDER BY created_at DESC LIMIT 5;
```

### ✅ Checklist Fase 5

- [ ] App funciona com feature flag desligada
- [ ] App funciona com feature flag ligada
- [ ] Pronomes sendo resolvidos corretamente ("ele", "ela")
- [ ] Conversas aparecendo no Supabase
- [ ] Mensagens com entidades salvas
- [ ] Contexto sendo enviado nos requests

---

## 🚀 Fase 6: Deploy

### 👤 Passo 6.1: Commit e Push (VOCÊ FAZ)

```powershell
git add .
git commit -m "feat: adicionar memória conversacional"
git push origin main
```

### 👤 Passo 6.2: Deploy com Feature Flag DESLIGADA

Nas variáveis de ambiente do Railway/Vercel:

```
VITE_ENABLE_CONVERSATION_MEMORY=false
```

### 👤 Passo 6.3: Monitorar e Ativar

Após verificar que o deploy está estável:

```
VITE_ENABLE_CONVERSATION_MEMORY=true
```

---

## 🔄 Rollback (Reversão)

> [!WARNING]
> Siga o nível apropriado para seu problema.

### Nível 1: Desativar Feature (1 minuto) ✅

**Use quando:** Qualquer problema, primeira tentativa.

1. Nas variáveis de ambiente (Railway/Vercel):
```
VITE_ENABLE_CONVERSATION_MEMORY=false
```
2. Redeploy
3. ✅ Memória desativada, app volta ao comportamento anterior

### Nível 2: Reverter Código Frontend (5 minutos)

**Use quando:** Problema específico no código.

```powershell
git revert HEAD
git push origin main
```

### Nível 3: Reverter Workflow N8N (5 minutos)

**Use quando:** Problema no workflow.

1. Acesse o N8N
2. Clique em ⋮ → **"Import from File"**
3. Selecione `workflow_backup_20260105.json` (que você salvou na Fase 1)
4. Confirme a importação
5. Ative o workflow importado

### Nível 4: Limpar Tabelas do Banco (10 minutos)

**Use quando:** Problema nas tabelas novas.

Execute no SQL Editor do Supabase:

```sql
-- ========================================
-- ROLLBACK: Remover memória conversacional
-- ========================================

-- 1. Remover triggers
DROP TRIGGER IF EXISTS trigger_update_conv_on_message ON messages;
DROP FUNCTION IF EXISTS update_conversation_timestamp() CASCADE;

-- 2. Remover políticas RLS
DROP POLICY IF EXISTS "Users can only access their own conversations" ON conversations;
DROP POLICY IF EXISTS "Users can only access messages from their conversations" ON messages;

-- 3. Remover colunas adicionadas em requests
ALTER TABLE requests DROP COLUMN IF EXISTS conversation_id;
ALTER TABLE requests DROP COLUMN IF EXISTS context;

-- 4. Remover tabelas novas
DROP TABLE IF EXISTS messages CASCADE;
DROP TABLE IF EXISTS conversations CASCADE;

-- 5. Verificar
SELECT table_name FROM information_schema.tables 
WHERE table_schema = 'public' AND table_name IN ('conversations', 'messages');
-- Deve retornar 0 linhas
```

### Nível 5: Restaurar Estado Anterior (30 minutos)

**Use quando:** Situação crítica.

1. Reverter código: `git checkout backup/pre-memoria-conversacional`
2. Executar rollback SQL (Nível 4)
3. Restaurar workflow n8n do backup
4. Fazer deploy

---

## 🔧 Troubleshooting

### Erro: "Conversa não inicializada"

**Causa:** SessionManager não conseguiu criar conversa.

**Solução (no console do navegador):**
```javascript
localStorage.removeItem('agente_cidadao_session_id');
location.reload();
```

### Erro: N8N não recebe contexto

**Causa:** Feature flag desligada ou frontend não enviando.

**Verificar:**
1. `VITE_ENABLE_CONVERSATION_MEMORY=true` no `.env.local`?
2. Reiniciou o servidor após mudar?
3. No console do navegador, ver se `context` está no request

### Erro: Entidades não extraídas

**Causa:** Sintetizador não está gerando bloco JSON.

**Verificar:**
1. O bloco `<!-- ENTITIES ... -->` foi adicionado ao Sintetizador?
2. Inspecionar a resposta raw para ver se o bloco está lá

### Erro: RLS bloqueando

**Causa:** Políticas muito restritivas.

**Solução temporária:**
```sql
-- Desabilitar RLS temporariamente para debug
ALTER TABLE conversations DISABLE ROW LEVEL SECURITY;
ALTER TABLE messages DISABLE ROW LEVEL SECURITY;
```

---

## 📊 Métricas de Sucesso

Após 1 semana com a feature ativa:

```sql
-- Taxa de uso da memória
SELECT 
  COUNT(*) FILTER (WHERE context != '{}' AND context IS NOT NULL) * 100.0 / COUNT(*) as pct_com_contexto
FROM requests
WHERE created_at > NOW() - INTERVAL '7 days';

-- Média de mensagens por conversa
SELECT AVG(msg_count)::numeric(10,1) as media_mensagens
FROM (
  SELECT conversation_id, COUNT(*) as msg_count
  FROM messages
  GROUP BY conversation_id
) stats;
```

**Metas:**
- 50%+ dos requests usando contexto
- 3+ mensagens por conversa em média

---

**Versão:** 2.1  
**Última atualização:** 05/01/2026
