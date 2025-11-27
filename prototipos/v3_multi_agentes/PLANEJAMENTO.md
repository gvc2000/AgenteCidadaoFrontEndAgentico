# 🗺️ Planejamento Técnico - Implementação Protótipo v3

## 📋 Resumo Executivo

Este documento detalha o plano de implementação técnica do protótipo v3 da interface do **Agente Cidadão**, incluindo a ordem de desenvolvimento, dependências técnicas e considerações de integração.

---

## 🎯 Objetivos do Protótipo

### Objetivos Principais

1. ✅ Demonstrar visualmente a arquitetura multi-agentes
2. ✅ Criar animações dinâmicas e envolventes dos agentes
3. ✅ Implementar interface bilíngue (PT-BR/ES)
4. ✅ Simular fluxo de comunicação em tempo real
5. ✅ Preparar base para integração futura com Supabase + n8n

### Não-Objetivos (Fora do Escopo do Protótipo)

- ❌ Integração real com APIs (será mockado)
- ❌ Autenticação funcional
- ❌ Banco de dados persistente
- ❌ Deploy em produção

---

## 🏗️ Fases de Desenvolvimento

### Fase 1: Fundação (CSS e i18n)
**Tempo estimado**: Base do projeto

#### Tarefas

1. **CSS Principal** (`css/main.css`)
   - CSS Variables (cores, espaçamentos, fontes)
   - Reset/Normalize
   - Utilitários básicos
   - Layout Grid e Flexbox

2. **CSS de Animações** (`css/animations.css`)
   - Keyframes para estados dos agentes
   - Animações de entrada/saída
   - Micro-interações (hover, focus)
   - Transições suaves

3. **Sistema de Internacionalização** (`js/i18n.js`)
   - Estrutura de dados JSON
   - Função de troca de idioma
   - Persistência em localStorage
   - Traduções PT-BR e ES

---

### Fase 2: Estrutura HTML

#### Tarefas

4. **Página Principal** (`index.html`)
   - Estrutura semântica completa
   - Todas as seções definidas na especificação
   - Metadados e SEO básico
   - Links para CSS/JS

5. **Página de Login** (`login.html`)
   - Formulário com validação básica
   - Link para voltar ao chat
   - Responsivo

6. **Página de Admin** (`admin.html`)
   - Sidebar com navegação
   - Tabs para diferentes áreas
   - Tabelas mockadas

---

### Fase 3: Lógica e Interatividade

#### Tarefas

7. **Script Principal** (`js/app.js`)
   - Inicialização da aplicação
   - Event listeners
   - Gerenciamento de estado
   - Integração com módulos

8. **Controle de Agentes** (`js/agents.js`)
   - Classe AgentController
   - Métodos para mudar estados
   - Coordenação de animações
   - Sistema de mensagens

9. **API Mockada** (`js/api.js`)
   - Funções para simular chamadas ao backend
   - Delays realistas
   - Respostas pré-definidas
   - Simulação de erros ocasionais

---

### Fase 4: Assets Visuais

#### Tarefas

10. **SVGs dos Agentes**
    - Criar 5 SVGs animados inline
    - Traduzir textos para português
    - Elementos animáveis via CSS
    - Fallback para imagens PNG existentes

11. **Ícones e Logo**
    - Logo "Agente Cidadão" em SVG
    - Ícones de fontes de dados
    - Ícones de navegação

---

### Fase 5: Refinamento e Testes

#### Tarefas

12. **Responsividade**
    - Testar em mobile (375px, 414px)
    - Testar em tablet (768px, 1024px)
    - Testar em desktop (1280px, 1920px)
    - Ajustar breakpoints

13. **Acessibilidade**
    - Adicionar ARIA labels
    - Testar navegação por teclado
    - Verificar contraste de cores
    - Alt text em imagens

14. **Performance**
    - Otimizar animações (will-change, transform)
    - Lazy loading de assets
    - Minificação (para versão final)

15. **Documentação**
    - README com instruções
    - Comentários no código
    - Exemplos de uso

---

## 🔧 Tecnologias e Ferramentas

### Core Stack

| Tecnologia | Versão | Uso |
|------------|--------|-----|
| HTML5 | - | Estrutura semântica |
| CSS3 | - | Estilização e animações |
| JavaScript ES6+ | - | Lógica e interatividade |
| Tailwind CSS | 3.x (CDN) | Utilitários rápidos |
| Google Fonts | - | Tipografia (Inter) |

### Bibliotecas Externas (CDN)

```html
<!-- Tailwind CSS -->
<script src="https://cdn.tailwindcss.com"></script>

<!-- Google Fonts (Inter) -->
<link href="https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700&display=swap" rel="stylesheet">

<!-- Lucide Icons (opcional) -->
<script src="https://unpkg.com/lucide@latest"></script>
```

---

## 📊 Arquitetura de Dados (Mock)

### Estado da Aplicação

```javascript
const appState = {
  currentLanguage: 'pt-br', // ou 'es'

  agents: [
    {
      id: 'orchestrator',
      name: 'Orquestrador',
      status: 'idle', // 'idle' | 'working' | 'completed' | 'error'
      message: '',
      color: '#3B82F6'
    },
    // ... outros agentes
  ],

  messages: [
    {
      id: '1',
      role: 'user', // ou 'assistant'
      content: 'Qual o gasto do deputado X?',
      timestamp: Date.now()
    }
  ],

  isProcessing: false
};
```

### Fluxo de Dados Mockado

```javascript
// Exemplo de fluxo quando usuário envia pergunta
async function handleUserQuestion(question) {
  // 1. Adicionar mensagem do usuário
  addMessage('user', question);

  // 2. Ativar orquestrador
  updateAgentStatus('orchestrator', 'working', 'Analisando pergunta...');
  await delay(1000);

  // 3. Ativar especialistas (paralelo simulado)
  updateAgentStatus('legislative', 'working', 'Buscando proposições...');
  updateAgentStatus('fiscal', 'working', 'Consultando gastos...');
  await delay(2000);

  // 4. Completar especialistas
  updateAgentStatus('legislative', 'completed', 'Encontradas 5 proposições');
  updateAgentStatus('fiscal', 'completed', 'R$ 50.000 em despesas');

  // 5. Ativar sintetizador
  updateAgentStatus('synthesizer', 'working', 'Consolidando dados...');
  await delay(1500);

  // 6. Resposta final
  updateAgentStatus('synthesizer', 'completed', 'Resposta pronta!');
  addMessage('assistant', getMockedResponse(question));

  // 7. Reset agentes
  resetAllAgents();
}
```

---

## 🎨 Sistema de Design - Implementação

### CSS Variables (Configuração)

```css
:root {
  /* Cores Principais */
  --color-primary: #00835C;
  --color-primary-dark: #006644;
  --color-bg: #FFFFFF;
  --color-bg-alt: #F8F9FA;
  --color-text: #1F2937;
  --color-text-secondary: #6B7280;

  /* Cores dos Agentes */
  --agent-orchestrator: #3B82F6;
  --agent-legislative: #10B981;
  --agent-political: #8B5CF6;
  --agent-fiscal: #F59E0B;
  --agent-synthesizer: #EC4899;

  /* Espaçamentos */
  --spacing-xs: 0.25rem;
  --spacing-sm: 0.5rem;
  --spacing-md: 1rem;
  --spacing-lg: 1.5rem;
  --spacing-xl: 2rem;
  --spacing-2xl: 3rem;

  /* Tipografia */
  --font-family: 'Inter', system-ui, sans-serif;
  --font-size-xs: 0.75rem;
  --font-size-sm: 0.875rem;
  --font-size-base: 1rem;
  --font-size-lg: 1.125rem;
  --font-size-xl: 1.25rem;
  --font-size-2xl: 1.5rem;
  --font-size-3xl: 2rem;

  /* Sombras */
  --shadow-sm: 0 1px 2px rgba(0,0,0,0.05);
  --shadow-md: 0 4px 6px rgba(0,0,0,0.1);
  --shadow-lg: 0 10px 15px rgba(0,0,0,0.1);

  /* Transições */
  --transition-fast: 150ms ease;
  --transition-base: 300ms ease;
  --transition-slow: 500ms ease;
}
```

### Animações Keyframes

```css
/* Pulse para agente trabalhando */
@keyframes agent-pulse {
  0%, 100% { opacity: 1; transform: scale(1); }
  50% { opacity: 0.8; transform: scale(1.05); }
}

/* Float - movimento vertical sutil */
@keyframes agent-float {
  0%, 100% { transform: translateY(0px); }
  50% { transform: translateY(-10px); }
}

/* Glow - brilho pulsante */
@keyframes agent-glow {
  0%, 100% { box-shadow: 0 0 20px var(--agent-color); }
  50% { box-shadow: 0 0 40px var(--agent-color); }
}

/* Bounce de entrada */
@keyframes bounce-in {
  0% { opacity: 0; transform: scale(0.3); }
  50% { opacity: 1; transform: scale(1.1); }
  100% { transform: scale(1); }
}

/* Shake para erro */
@keyframes shake {
  0%, 100% { transform: translateX(0); }
  25% { transform: translateX(-10px); }
  75% { transform: translateX(10px); }
}
```

---

## 🌐 Internacionalização - Estrutura

### Arquivo i18n.js

```javascript
const translations = {
  'pt-br': {
    // Header
    'header.title': 'Agente Cidadão',
    'header.subtitle': 'Transparência Legislativa com IA',
    'nav.chat': 'Chat',
    'nav.admin': 'Administração',
    'nav.login': 'Login',

    // Hero
    'hero.title': 'Acesso Inteligente aos Dados Públicos',
    'hero.subtitle': 'Acompanhe proposições, fiscalize gastos e entenda a política',

    // Agentes
    'agent.orchestrator': 'Orquestrador',
    'agent.legislative': 'Legislativo',
    'agent.political': 'Político',
    'agent.fiscal': 'Fiscal',
    'agent.synthesizer': 'Sintetizador',

    // Status
    'status.idle': 'Aguardando',
    'status.working': 'Trabalhando...',
    'status.completed': 'Concluído',
    'status.error': 'Erro',

    // Chat
    'chat.input.placeholder': 'Digite sua pergunta sobre política e legislação...',
    'chat.button.send': 'Consultar',
    'chat.welcome': 'Olá! Como posso ajudar você hoje?',

    // Exemplos
    'examples.title': 'Exemplos de Perguntas',
    'examples.q1': 'Quais são os deputados de São Paulo?',
    'examples.q2': 'Mostre as despesas do deputado Eduardo Bolsonaro',
    'examples.q3': 'Projetos de lei sobre educação em 2024',
    'examples.q4': 'Qual o histórico de votação de Tabata Amaral?',
    'examples.q5': 'Gastos com combustível dos deputados de MG',

    // Fontes
    'sources.title': 'Fontes de Dados',
    'sources.camara.title': 'API Câmara dos Deputados',
    'sources.camara.desc': 'Proposições, deputados, votações e tramitações',
    'sources.senado.title': 'Dados Abertos do Senado',
    'sources.senado.desc': 'Legislação federal e atividades parlamentares',
    'sources.transparencia.title': 'Portal da Transparência',
    'sources.transparencia.desc': 'Gastos públicos e despesas governamentais',

    // Footer
    'footer.about': 'Sobre',
    'footer.docs': 'Documentação',
    'footer.github': 'GitHub',
    'footer.contact': 'Contato',
    'footer.rights': 'Todos os direitos reservados'
  },

  'es': {
    // Header
    'header.title': 'Agente Ciudadano',
    'header.subtitle': 'Transparencia Legislativa con IA',
    'nav.chat': 'Chat',
    'nav.admin': 'Administración',
    'nav.login': 'Iniciar Sesión',

    // Hero
    'hero.title': 'Acceso Inteligente a los Datos Públicos',
    'hero.subtitle': 'Sigue proposiciones, fiscaliza gastos y comprende la política',

    // Agentes
    'agent.orchestrator': 'Orquestador',
    'agent.legislative': 'Legislativo',
    'agent.political': 'Político',
    'agent.fiscal': 'Fiscal',
    'agent.synthesizer': 'Sintetizador',

    // Status
    'status.idle': 'En Espera',
    'status.working': 'Trabajando...',
    'status.completed': 'Completado',
    'status.error': 'Error',

    // Chat
    'chat.input.placeholder': 'Escribe tu pregunta sobre política y legislación...',
    'chat.button.send': 'Consultar',
    'chat.welcome': '¡Hola! ¿Cómo puedo ayudarte hoy?',

    // Exemplos
    'examples.title': 'Ejemplos de Preguntas',
    'examples.q1': '¿Cuáles son los diputados de São Paulo?',
    'examples.q2': 'Muestra los gastos del diputado Eduardo Bolsonaro',
    'examples.q3': 'Proyectos de ley sobre educación en 2024',
    'examples.q4': '¿Cuál es el historial de votación de Tabata Amaral?',
    'examples.q5': 'Gastos en combustible de los diputados de MG',

    // Fontes
    'sources.title': 'Fuentes de Datos',
    'sources.camara.title': 'API Cámara de Diputados',
    'sources.camara.desc': 'Proposiciones, diputados, votaciones y trámites',
    'sources.senado.title': 'Datos Abiertos del Senado',
    'sources.senado.desc': 'Legislación federal y actividades parlamentarias',
    'sources.transparencia.title': 'Portal de Transparencia',
    'sources.transparencia.desc': 'Gastos públicos y gastos gubernamentales',

    // Footer
    'footer.about': 'Acerca de',
    'footer.docs': 'Documentación',
    'footer.github': 'GitHub',
    'footer.contact': 'Contacto',
    'footer.rights': 'Todos los derechos reservados'
  }
};

// Função principal
function t(key, lang = getCurrentLanguage()) {
  return translations[lang]?.[key] || key;
}

function setLanguage(lang) {
  localStorage.setItem('language', lang);
  updatePageTranslations(lang);
}

function getCurrentLanguage() {
  return localStorage.getItem('language') || 'pt-br';
}

function updatePageTranslations(lang) {
  document.querySelectorAll('[data-i18n]').forEach(el => {
    const key = el.getAttribute('data-i18n');
    el.textContent = t(key, lang);
  });

  document.querySelectorAll('[data-i18n-placeholder]').forEach(el => {
    const key = el.getAttribute('data-i18n-placeholder');
    el.placeholder = t(key, lang);
  });
}
```

---

## 🔌 Integração Futura com Backend

### Pontos de Integração Planejados

1. **Supabase Realtime**
   - Substituir mocks em `api.js`
   - Subscribir à tabela `agent_logs`
   - Atualizar status dos agentes baseado em eventos reais

2. **n8n Webhook**
   - Endpoint POST `/webhook/chat`
   - Payload: `{ user_query: string, session_id: string }`
   - Response: `{ request_id: string }`

3. **Autenticação**
   - Supabase Auth (login.html)
   - Session management
   - Protected routes

### Preparação no Código

```javascript
// api.js - Estrutura preparada para integração real
const API_CONFIG = {
  SUPABASE_URL: 'https://seu-projeto.supabase.co',
  SUPABASE_ANON_KEY: 'sua-chave-anon',
  N8N_WEBHOOK: 'https://seu-n8n.app/webhook/chat',
  USE_MOCK: true // Trocar para false em produção
};

async function sendMessage(content) {
  if (API_CONFIG.USE_MOCK) {
    return mockSendMessage(content);
  }

  // Implementação real aqui
  const response = await fetch(API_CONFIG.N8N_WEBHOOK, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ user_query: content })
  });

  return response.json();
}
```

---

## 📝 Checklist de Implementação

### CSS

- [ ] `css/main.css` - Estilos base
- [ ] `css/animations.css` - Keyframes e transições
- [ ] `css/responsive.css` - Media queries

### JavaScript

- [ ] `js/i18n.js` - Internacionalização
- [ ] `js/app.js` - Script principal
- [ ] `js/agents.js` - Controle de agentes
- [ ] `js/api.js` - API mockada

### HTML

- [ ] `index.html` - Página principal
- [ ] `login.html` - Login
- [ ] `admin.html` - Administração

### Assets

- [ ] 5 SVGs dos agentes (com textos em PT)
- [ ] Logo SVG
- [ ] Ícones de fontes de dados

### Documentação

- [ ] `README.md` - Instruções de uso
- [ ] `ESPECIFICACAO.md` - Este documento ✅
- [ ] `PLANEJAMENTO.md` - Planejamento ✅

---

## 🚀 Como Executar o Protótipo

### Desenvolvimento Local

1. **Abrir no navegador**
   ```bash
   # Opção 1: Live Server (VS Code extension)
   # Clique com botão direito em index.html > Open with Live Server

   # Opção 2: Python SimpleHTTPServer
   cd prototipos/v3_multi_agentes
   python3 -m http.server 8000
   # Acesse http://localhost:8000

   # Opção 3: Node.js http-server
   npx http-server -p 8000
   ```

2. **Testar funcionalidades**
   - Digite perguntas de exemplo
   - Observe animações dos agentes
   - Troque idioma (PT ↔ ES)
   - Teste responsividade (DevTools)
   - Acesse /login.html e /admin.html

---

## 🎓 Convenções de Código

### HTML
- Usar HTML5 semântico (`<header>`, `<main>`, `<section>`, `<article>`)
- IDs em kebab-case: `agent-stage`, `chat-history`
- Classes utilitárias Tailwind + classes customizadas
- Atributos `data-i18n` para traduções

### CSS
- BEM para classes customizadas: `.agent-card__icon--active`
- CSS Variables para valores reutilizáveis
- Mobile-first (base = mobile, `@media (min-width: ...)` para desktop)
- Comentários para seções: `/* === HEADER === */`

### JavaScript
- ES6+ syntax (const/let, arrow functions, async/await)
- Nomes em camelCase: `updateAgentStatus`
- Constantes em UPPER_SNAKE_CASE: `API_CONFIG`
- JSDoc para funções públicas
- Modularização (cada arquivo = responsabilidade única)

---

## 🔮 Roadmap Futuro (Pós-Protótipo)

### v4: Integração Real
- Conectar com Supabase
- Webhook n8n funcional
- Realtime updates

### v5: Funcionalidades Avançadas
- Histórico de conversas salvo
- Favoritar perguntas
- Compartilhar respostas
- Exportar relatórios (PDF)

### v6: Melhorias UX
- Dark mode
- Mais idiomas (EN, FR)
- Tutorial interativo (onboarding)
- Chatbot voice input

---

**Versão**: 3.0
**Status**: 🟡 Em Desenvolvimento
**Última Atualização**: Novembro 2024
