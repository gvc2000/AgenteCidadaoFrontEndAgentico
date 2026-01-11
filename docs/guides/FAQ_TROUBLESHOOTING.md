# FAQ e Troubleshooting - Agente Cidadão

Perguntas frequentes e soluções para problemas comuns.

## Sumário

- [Perguntas Frequentes (FAQ)](#perguntas-frequentes-faq)
  - [Geral](#geral)
  - [Técnicas](#técnicas)
  - [Uso](#uso)
- [Troubleshooting](#troubleshooting)
  - [Problemas de Instalação](#problemas-de-instalação)
  - [Problemas de Execução](#problemas-de-execução)
  - [Problemas de Deploy](#problemas-de-deploy)
  - [Problemas de Integração](#problemas-de-integração)

---

## Perguntas Frequentes (FAQ)

### Geral

#### O que é o Agente Cidadão?

O Agente Cidadão é um sistema de inteligência artificial que democratiza o acesso aos dados legislativos da Câmara dos Deputados. Permite que cidadãos façam perguntas em linguagem natural e recebam respostas precisas baseadas em dados oficiais.

#### É gratuito?

Sim, o sistema é de código aberto e gratuito para uso. No entanto, para rodar sua própria instância, você precisará de contas (gratuitas ou pagas) em:
- Supabase (banco de dados)
- Railway ou similar (hospedagem)
- OpenRouter (acesso aos modelos de IA)

#### Quais dados são acessados?

O sistema acessa apenas dados públicos disponíveis na [API de Dados Abertos da Câmara dos Deputados](https://dadosabertos.camara.leg.br), incluindo:
- Proposições legislativas (PLs, PECs, MPVs)
- Perfis de deputados
- Votações nominais
- Despesas parlamentares (CEAP)
- Discursos em plenário

#### Os dados são confiáveis?

Sim. Todas as respostas são baseadas exclusivamente em dados oficiais da API da Câmara dos Deputados. O sistema não inventa informações - apenas consulta e formata dados reais.

#### Em quais idiomas funciona?

Atualmente suporta:
- Português Brasileiro (pt-BR)
- Espanhol (es-ES)

#### Posso usar para fins comerciais?

Sim, o projeto está sob licença MIT, que permite uso comercial. Consulte o arquivo [LICENSE](LICENSE) para detalhes.

---

### Técnicas

#### Quais tecnologias são usadas?

**Frontend:**
- React 19.2
- TypeScript 5.9
- Vite 7.2
- TailwindCSS 4.1
- Supabase JS 2.84

**Backend:**
- n8n (workflow automation)
- OpenRouter (gateway de modelos IA)
- Supabase (PostgreSQL + Real-time)
- MCP Server (ferramentas para API Câmara)

**Modelos de IA:**
- GPT-4o-mini (orquestração)
- Claude 3.5 Sonnet (análise legislativa e política)
- Claude 3 Haiku (análise fiscal)
- Gemini 2.5 Flash (síntese de respostas)

#### Como funciona a arquitetura multi-agentes?

O sistema usa **5 agentes especializados** trabalhando em paralelo:

1. **Orquestrador** - Analisa a pergunta e decide quais agentes acionar
2. **Agente Legislativo** - Especialista em proposições e tramitações
3. **Agente Político** - Especialista em deputados e partidos
4. **Agente Fiscal** - Especialista em despesas parlamentares
5. **Sintetizador** - Consolida e formata as respostas

Veja mais em [multi_agent_architecture.md](multi_agent_architecture.md).

#### Como funciona a memória conversacional?

Quando ativada (`VITE_ENABLE_CONVERSATION_MEMORY=true`), o sistema:
- Mantém contexto da conversa em uma sessão
- Extrai entidades importantes (nomes de deputados, números de proposições, etc.)
- Usa essas informações em perguntas subsequentes
- Armazena no Supabase para persistência

#### Quanto tempo leva uma consulta?

**Tempo médio:** 5-15 segundos

**Fatores que afetam:**
- Complexidade da pergunta
- Número de agentes acionados
- Volume de dados a processar
- Latência da API da Câmara

**Timeout máximo:** 6 minutos (360 segundos)

#### Posso rodar localmente?

Sim! Siga o guia em [README.md](README.md#desenvolvimento-local):

```bash
cp .env.example .env
# Configure suas credenciais no .env
npm install
npm run dev
```

Você precisará de:
- Projeto Supabase (pode usar tier gratuito)
- Instância n8n (local ou em nuvem)

---

### Uso

#### Como faço uma boa pergunta?

**Boas perguntas:**
- "Quais são os PLs sobre inteligência artificial em tramitação?"
- "Quanto o deputado Nikolas Ferreira gastou em 2024?"
- "Como os partidos votaram na reforma tributária?"

**Evite:**
- Perguntas muito vagas: "Me fale sobre política"
- Múltiplas perguntas em uma: "Quem é o deputado X e quanto ele gastou e como ele votou?"
- Opiniões: "O deputado X é corrupto?" (o sistema só fornece dados)

#### O sistema dá opiniões?

Não. O Agente Cidadão é estritamente factual e baseado em dados. Não emite opiniões, julgamentos ou análises subjetivas.

#### Posso confiar nas respostas?

As respostas são tão confiáveis quanto os dados oficiais da Câmara. O sistema:
- Não inventa informações
- Cita fontes quando possível
- Indica quando não encontra dados
- Formata dados oficiais de forma clara

**Sempre verifique informações críticas diretamente na fonte oficial.**

#### Por que algumas perguntas não são respondidas?

Possíveis razões:
- Dados não disponíveis na API da Câmara
- Pergunta fora do escopo (ex: Senado Federal)
- Timeout (consulta muito complexa)
- Erro temporário na API

Tente reformular ou simplificar a pergunta.

#### Posso exportar as respostas?

Atualmente não há função de exportação, mas você pode:
- Copiar o texto (em Markdown)
- Fazer screenshot
- Salvar o HTML da página

Exportação de histórico está no roadmap.

---

## Troubleshooting

### Problemas de Instalação

#### Erro: "npm install" falha

**Problema:** Dependências não instalam

**Soluções:**

1. Verifique versão do Node.js:
   ```bash
   node --version  # Deve ser 18.x ou superior
   ```

2. Limpe cache do npm:
   ```bash
   npm cache clean --force
   rm -rf node_modules package-lock.json
   npm install
   ```

3. Use npm ao invés de yarn/pnpm:
   ```bash
   npm install
   ```

#### Erro: "Module not found"

**Problema:** Módulo TypeScript não encontrado

**Solução:**
```bash
# Reinstale dependências
rm -rf node_modules
npm install

# Verifique tsconfig.json
npm run build
```

---

### Problemas de Execução

#### Erro: "Failed to fetch"

**Problema:** Não consegue conectar ao webhook n8n

**Causas comuns:**
- `VITE_N8N_WEBHOOK_URL` incorreto ou não configurado
- n8n está offline
- Problema de CORS

**Soluções:**

1. Verifique o `.env`:
   ```bash
   cat .env | grep N8N
   ```

2. Teste o webhook manualmente:
   ```bash
   curl -X POST https://seu-webhook.com/webhook/chat \
     -H "Content-Type: application/json" \
     -d '{"user_query": "teste"}'
   ```

3. Verifique se o n8n está rodando:
   - Acesse o painel do Railway
   - Ou rode n8n localmente: `npx n8n`

#### Erro: "Supabase connection failed"

**Problema:** Não conecta ao Supabase

**Soluções:**

1. Verifique credenciais:
   ```env
   VITE_SUPABASE_URL=https://xxxxx.supabase.co
   VITE_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
   ```

2. Verifique se o projeto Supabase está ativo

3. Teste a conexão:
   ```typescript
   import { supabase } from './lib/supabase';

   const { data, error } = await supabase
     .from('requests')
     .select('count');

   console.log({ data, error });
   ```

#### Página em branco após build

**Problema:** `npm run build` gera dist/ mas página não carrega

**Causas:**
- Caminho base incorreto no Vite
- Problemas com variáveis de ambiente

**Soluções:**

1. Verifique `vite.config.ts`:
   ```typescript
   export default defineConfig({
     base: './', // Para paths relativos
     // ...
   });
   ```

2. Rode preview para testar:
   ```bash
   npm run build
   npm run preview
   ```

3. Verifique console do navegador (F12) para erros

#### Timeout em todas as requisições

**Problema:** Todas as consultas excedem 6 minutos

**Causas:**
- n8n lento ou travando
- MCP Server não respondendo
- API Câmara instável

**Soluções:**

1. Verifique logs do n8n no Railway

2. Teste o MCP Server:
   ```bash
   curl https://agentecidadaomcp-production.up.railway.app/health
   ```

3. Verifique status da API Câmara:
   ```bash
   curl https://dadosabertos.camara.leg.br/api/v2/proposicoes
   ```

---

### Problemas de Deploy

#### Deploy no Railway falha

**Problema:** Build falha no Railway

**Soluções:**

1. Verifique variáveis de ambiente no Railway:
   - `VITE_SUPABASE_URL`
   - `VITE_SUPABASE_ANON_KEY`
   - `VITE_N8N_WEBHOOK_URL`

2. Verifique logs de build:
   ```bash
   # No Railway Dashboard > Deployments > View Logs
   ```

3. Teste build local:
   ```bash
   npm run build
   ```

4. Verifique `railway.json`:
   ```json
   {
     "$schema": "https://railway.app/railway.schema.json",
     "build": {
       "builder": "NIXPACKS"
     },
     "deploy": {
       "startCommand": "npm run preview",
       "restartPolicyType": "ON_FAILURE"
     }
   }
   ```

#### Erro 404 após deploy

**Problema:** Deploy bem-sucedido mas rota retorna 404

**Solução:**

Configure `nginx.conf.template` para SPA:
```nginx
location / {
    try_files $uri $uri/ /index.html;
}
```

#### Variáveis de ambiente não funcionam

**Problema:** `import.meta.env.VITE_*` retorna undefined

**Causa:** Variáveis não foram definidas no build time

**Solução:**

1. No Railway, vá em Variables
2. Adicione todas as variáveis com prefixo `VITE_`
3. Redeploye a aplicação

**Importante:** Variáveis de ambiente são injetadas em **build time**, não runtime.

---

### Problemas de Integração

#### Real-time não funciona

**Problema:** Logs de agentes não aparecem em tempo real

**Soluções:**

1. Verifique se memória conversacional está ativada:
   ```env
   VITE_ENABLE_CONVERSATION_MEMORY=true
   ```

2. Verifique conexão WebSocket do Supabase:
   ```typescript
   const channel = supabase.channel('test');
   channel.subscribe((status) => {
     console.log('Status:', status); // Deve ser 'SUBSCRIBED'
   });
   ```

3. Verifique Row Level Security (RLS) no Supabase:
   - Tabelas `agent_logs` e `requests` devem permitir leitura pública

#### Respostas sempre em inglês

**Problema:** Sistema responde em inglês mesmo com idioma configurado

**Causa:** Parâmetro `language` não está sendo enviado

**Solução:**

Verifique em `ChatInterface.tsx`:
```typescript
const response = await fetch(webhookUrl, {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    user_query: message,
    language: currentLanguage // Certifique-se de enviar isso
  })
});
```

#### Markdown não renderiza

**Problema:** Resposta aparece como texto puro, não formatado

**Solução:**

Verifique se está usando `ReactMarkdown`:
```typescript
import ReactMarkdown from 'react-markdown';

<ReactMarkdown>{response.answer}</ReactMarkdown>
```

---

## Ainda com Problemas?

Se nenhuma das soluções acima funcionou:

1. **Verifique Issues no GitHub**
   - Alguém pode ter reportado o mesmo problema

2. **Abra uma Issue**
   - Descreva o problema em detalhes
   - Inclua logs de erro
   - Informe seu ambiente (SO, Node version, etc.)

3. **Consulte a Documentação**
   - [README.md](README.md)
   - [API_DOCUMENTATION.md](API_DOCUMENTATION.md)
   - [DEPLOY.md](DEPLOY.md)

4. **Entre em Contato**
   - Abra uma [Discussion](../../discussions) no GitHub

---

**Última atualização:** 2026-01-10
