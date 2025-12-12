# 🏛️ Agente Cidadão - Sistema Multi-Agentes para Dados Legislativos

Sistema completo de consulta inteligente aos dados da Câmara dos Deputados, utilizando arquitetura multi-agentes com especialistas em diferentes áreas legislativas.

## 📋 Sobre o Projeto

O **Agente Cidadão** é uma plataforma que democratiza o acesso a dados públicos legislativos através de uma interface de chat conversacional. Os cidadãos podem fazer perguntas em linguagem natural e receber respostas precisas baseadas em dados oficiais da Câmara dos Deputados.

**Frontend:** React + TypeScript + Vite
**Backend:** n8n (workflow automation) + MCP Server (Câmara dos Deputados)
**Banco de Dados:** Supabase (PostgreSQL + Realtime)
**IA:** OpenRouter (Claude 3.5 Sonnet, GPT-4o-mini, Gemini 2.5 Flash)

## 🤖 Arquitetura Multi-Agentes

O sistema utiliza **4 agentes especializados** trabalhando em conjunto:

### 1. 🎯 Orquestrador (GPT-4o-mini)

- Analisa a pergunta do usuário
- Decide quais especialistas devem ser acionados
- Roteia para os agentes apropriados

### 2. 📜 Agente Legislativo (Claude 3.5 Sonnet)

- Especialista em proposições (PLs, PECs, MPVs)
- Tramitações e votações
- Histórico legislativo
- **23 ferramentas MCP disponíveis**

### 3. 👔 Agente Político (Claude 3.5 Sonnet)

- Especialista em perfil de deputados
- Discursos e atuação parlamentar
- Comissões e frentes parlamentares
- **17 ferramentas MCP disponíveis**

### 4. 💰 Agente Fiscal (Claude 3 Haiku)

- Especialista em despesas parlamentares (CEAP)
- Auditoria de gastos
- Análise de cotas parlamentares
- **7 ferramentas MCP disponíveis**

### 5. 📝 Sintetizador (Gemini 2.5 Flash)

- Consolida as respostas dos especialistas
- Formata em Markdown
- Garante coesão e clareza
- Pode complementar informações via MCP

**Para detalhes completos da arquitetura, consulte:** [multi_agent_architecture.md](multi_agent_architecture.md)

---

## 🌐 Endpoints do Sistema

**Frontend:** `https://agentecidadaofrontendagentico-production.up.railway.app`
**Backend n8n:** `https://n8n-agentecidadaoagentico-production.up.railway.app/webhook/chat`
**MCP Server:** `https://agentecidadaomcp-production.up.railway.app/mcp`

---

## 📚 Documentação

- [Arquitetura Multi-Agentes](multi_agent_architecture.md) - Detalhes técnicos completos do sistema n8n
- [Especificação do Frontend](especificacao.md) - Requisitos e design do frontend
- [Workflow n8n](Agente%20Cidadão%20-%20Multi-Agentes.json) - Configuração completa do workflow

---

## 🚀 Deploy

Para instruções detalhadas de deploy no Railway.com, consulte [DEPLOY.md](./DEPLOY.md)

## 🏃‍♂️ Desenvolvimento Local

```bash
# 1. Copiar variáveis de ambiente
cp .env.example .env

# 2. Configurar suas credenciais no arquivo .env

# 3. Instalar dependências
npm install

# 4. Rodar em modo desenvolvimento
npm run dev
```

## 📦 Build de Produção

```bash
npm run build
npm run preview
```

---

## 🎯 Funcionalidades Principais

### Interface de Chat Conversacional

- Perguntas em linguagem natural
- Respostas em Markdown formatado
- Histórico de conversas
- Indicadores de progresso em tempo real

### Consultas Suportadas

**Legislativo:**

- "Quais são os PLs sobre inteligência artificial?"
- "Qual o status da PEC 32/2023?"
- "Como os partidos votaram na reforma tributária?"

**Político:**

- "Quem é o deputado Nikolas Ferreira?"
- "Quais deputados são do Rio Grande do Sul?"
- "De quais comissões a deputada Tabata Amaral participa?"

**Fiscal:**

- "Quanto o deputado X gastou em 2024?"
- "Quais os maiores gastos com passagens aéreas?"
- "Análise de despesas do partido PT"

### Transparência em Tempo Real (Implementado via Supabase)

- Rastreamento de cada etapa do processo
- Logs de atividade dos agentes
- Visualização do progresso da consulta
- Status: "Analisando...", "Consultando dados...", "Elaborando resposta..."

---

## 🛠️ Stack Tecnológica

### Frontend

- **React 18** - Biblioteca UI
- **TypeScript** - Type safety
- **Vite** - Build tool e dev server
- **Supabase JS** - Cliente Realtime para logs
- **Markdown Renderer** - Formatação de respostas

### Backend (n8n Workflow)

- **n8n** - Workflow automation
- **OpenRouter** - Gateway para múltiplos modelos de IA
- **Supabase** - Banco de dados PostgreSQL + Realtime
- **MCP Server** - Servidor de ferramentas para Câmara dos Deputados

### Modelos de IA

- **GPT-4o-mini** - Orquestração rápida
- **Claude 3.5 Sonnet** - Raciocínio complexo (Legislativo e Político)
- **Claude 3 Haiku** - Análise eficiente (Fiscal)
- **Gemini 2.5 Flash** - Síntese rápida

---

## 🔗 Integrações

### API Câmara dos Deputados

Todas as respostas são baseadas em dados oficiais da API de Dados Abertos da Câmara:

- Proposições legislativas
- Dados de deputados
- Votações nominais
- Despesas parlamentares (CEAP)
- Discursos em plenário
- Estrutura organizacional

**Documentação oficial:** <https://dadosabertos.camara.leg.br>

### Supabase Realtime

Permite rastreamento em tempo real:

- Tabela `requests` - Armazena perguntas e respostas
- Tabela `agent_logs` - Registra ações dos agentes
- Websockets para atualizações instantâneas

---

## 📊 Fluxo de Funcionamento

1. **Usuário** faz uma pergunta no chat
2. **Frontend** envia para o webhook n8n
3. **Orquestrador** analisa e decide quais agentes acionar
4. **Agentes Especialistas** executam em paralelo, consultando o MCP
5. **Logs** são registrados no Supabase em tempo real
6. **Sintetizador** consolida as respostas
7. **Frontend** exibe a resposta final formatada

**Tempo médio de resposta:** 5-15 segundos (dependendo da complexidade)

---

## 🔐 Variáveis de Ambiente

```env
VITE_SUPABASE_URL=sua_url_supabase
VITE_SUPABASE_ANON_KEY=sua_chave_supabase
VITE_N8N_WEBHOOK_URL=https://n8n-agentecidadaoagentico-production.up.railway.app/webhook/chat
```

---

## 🧪 Testes

```bash
# Rodar linter
npm run lint

# Build de produção (testa compilação)
npm run build
```

---

## 🤝 Contribuindo

1. Fork o projeto
2. Crie uma branch para sua feature (`git checkout -b feature/MinhaFeature`)
3. Commit suas mudanças (`git commit -m 'Adiciona MinhaFeature'`)
4. Push para a branch (`git push origin feature/MinhaFeature`)
5. Abra um Pull Request

---

## 📄 Licença

Este projeto está sob licença a ser definida.

---

## 👥 Autores

Desenvolvido para democratizar o acesso a dados legislativos brasileiros.

---

## 🔮 Roadmap

- [ ] Interface realtime com cards dos agentes
- [ ] Suporte multilíngue (Português/Espanhol)
- [ ] Sistema de autenticação e usuários
- [ ] Dashboard administrativo
- [ ] Cache de respostas frequentes
- [ ] Métricas de uso e performance
- [ ] Expansão para Senado Federal
- [ ] Análises preditivas com histórico

---

## ⚙️ Informações Técnicas do Template

### React + TypeScript + Vite

Este projeto usa Vite como build tool com HMR (Hot Module Replacement).

Currently, two official plugins are available:

- [@vitejs/plugin-react](https://github.com/vitejs/vite-plugin-react/blob/main/packages/plugin-react) uses [Babel](https://babeljs.io/) (or [oxc](https://oxc.rs) when used in [rolldown-vite](https://vite.dev/guide/rolldown)) for Fast Refresh
- [@vitejs/plugin-react-swc](https://github.com/vitejs/vite-plugin-react/blob/main/packages/plugin-react-swc) uses [SWC](https://swc.rs/) for Fast Refresh

### React Compiler

The React Compiler is not enabled on this template because of its impact on dev & build performances. To add it, see [this documentation](https://react.dev/learn/react-compiler/installation).

### Expanding the ESLint configuration

If you are developing a production application, we recommend updating the configuration to enable type-aware lint rules:

```js
export default defineConfig([
  globalIgnores(['dist']),
  {
    files: ['**/*.{ts,tsx}'],
    extends: [
      // Other configs...

      // Remove tseslint.configs.recommended and replace with this
      tseslint.configs.recommendedTypeChecked,
      // Alternatively, use this for stricter rules
      tseslint.configs.strictTypeChecked,
      // Optionally, add this for stylistic rules
      tseslint.configs.stylisticTypeChecked,

      // Other configs...
    ],
    languageOptions: {
      parserOptions: {
        project: ['./tsconfig.node.json', './tsconfig.app.json'],
        tsconfigRootDir: import.meta.dirname,
      },
      // other options...
    },
  },
])
```

You can also install [eslint-plugin-react-x](https://github.com/Rel1cx/eslint-react/tree/main/packages/plugins/eslint-plugin-react-x) and [eslint-plugin-react-dom](https://github.com/Rel1cx/eslint-react/tree/main/packages/plugins/eslint-plugin-react-dom) for React-specific lint rules:

```js
// eslint.config.js
import reactX from 'eslint-plugin-react-x'
import reactDom from 'eslint-plugin-react-dom'

export default defineConfig([
  globalIgnores(['dist']),
  {
    files: ['**/*.{ts,tsx}'],
    extends: [
      // Other configs...
      // Enable lint rules for React
      reactX.configs['recommended-typescript'],
      // Enable lint rules for React DOM
      reactDom.configs.recommended,
    ],
    languageOptions: {
      parserOptions: {
        project: ['./tsconfig.node.json', './tsconfig.app.json'],
        tsconfigRootDir: import.meta.dirname,
      },
      // other options...
    },
  },
])
```
