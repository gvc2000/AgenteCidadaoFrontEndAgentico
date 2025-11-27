# 📋 Especificação da Interface - Protótipo v3 Multi-Agentes

## 🎯 Objetivo

Criar uma interface web moderna, dinâmica e transparente que demonstre visualmente o funcionamento da arquitetura multi-agentes do **Agente Cidadão**, seguindo as especificações do documento `multi_agent_architecture.md`.

---

## 🏗️ Arquitetura da Interface

### Conceito: "Sala de Guerra Transparente"

A interface permite ao usuário acompanhar em tempo real o trabalho de cada agente especializado, criando uma experiência visual envolvente e educativa.

### Agentes Incluídos

1. **🤖 Agente Orquestrador** - Coordena e delega tarefas
2. **📜 Agente Legislativo** - Analisa proposições e leis
3. **👔 Agente Político** - Investiga deputados e discursos
4. **💰 Agente Fiscal** - Fiscaliza gastos e despesas
5. **📝 Agente Sintetizador** - Consolida e redige a resposta final

---

## 🎨 Design System

### Paleta de Cores

#### Cores Principais
- **Verde Câmara**: `#00835C` (primário)
- **Verde Escuro**: `#006644` (secundário)
- **Branco**: `#FFFFFF` (fundo)
- **Cinza Claro**: `#F8F9FA` (fundo alternativo)
- **Cinza Médio**: `#6B7280` (texto secundário)
- **Cinza Escuro**: `#1F2937` (texto primário)

#### Cores dos Agentes
- **Orquestrador**: `#3B82F6` (Azul)
- **Legislativo**: `#10B981` (Verde)
- **Político**: `#8B5CF6` (Roxo)
- **Fiscal**: `#F59E0B` (Amarelo/Dourado)
- **Sintetizador**: `#EC4899` (Rosa)

### Tipografia

- **Família**: Inter (importado do Google Fonts)
- **Títulos**: 700 (Bold)
- **Subtítulos**: 600 (Semi-Bold)
- **Corpo**: 400 (Regular)
- **Labels**: 500 (Medium)

---

## 📄 Estrutura das Páginas

### 1. Página Principal (index.html)

#### Seções

1. **Header (Cabeçalho)**
   - Logo "Agente Cidadão" com ícone
   - Seletor de idioma (PT-BR / ES)
   - Links: Chat | Admin | Login
   - Sticky (fixo no topo ao rolar)

2. **Hero Section**
   - Título principal: "Acesso Inteligente aos Dados Públicos"
   - Subtítulo: "Transparência Legislativa com Inteligência Artificial"
   - Descrição breve da proposta

3. **Agent Stage (Palco dos Agentes)** ⭐
   - Área visual destacada onde os agentes "aparecem"
   - Animações dinâmicas mostrando agentes em movimento
   - Cada agente tem:
     - Avatar animado (SVG ou PNG com animações CSS)
     - Nome e badge colorido
     - Indicador de status (idle/trabalhando/concluído)
     - Mensagem de progresso em tempo real
   - Layout horizontal com os 5 agentes
   - Background com grid/pattern sutil

4. **Interface de Chat**
   - Histórico de mensagens (rolável)
   - Input de texto com botão "Consultar"
   - Indicador de digitação quando agentes estão processando
   - Mensagens do usuário (alinhadas à direita, azul)
   - Respostas do sistema (alinhadas à esquerda, verde)

5. **Exemplos de Perguntas** (Similar ao site de referência)
   - Cards clicáveis com perguntas de exemplo:
     - "Quais são os deputados de São Paulo?"
     - "Mostre as despesas do deputado Eduardo Bolsonaro"
     - "Projetos de lei sobre educação em 2024"
     - "Qual o histórico de votação de [nome]?"
     - "Gastos com combustível dos deputados de MG"
   - Ao clicar, preenche automaticamente o input

6. **Fontes de Dados** (Similar ao site de referência)
   - Grid de cards mostrando as APIs utilizadas:
     - **API Câmara dos Deputados**
       - Ícone: 🏛️
       - Descrição: Proposições, deputados, votações
       - Link oficial
     - **Dados Abertos do Senado**
       - Ícone: ⚖️
       - Descrição: Legislação federal
     - **Portal da Transparência**
       - Ícone: 💼
       - Descrição: Gastos públicos
   - Badges de "Dados em Tempo Real" ou "Atualizado"

7. **Como Funciona**
   - Diagrama visual simplificado do fluxo:
     1. Você pergunta
     2. Orquestrador analisa
     3. Especialistas trabalham em paralelo
     4. Sintetizador consolida
     5. Resposta completa
   - Ilustração com ícones e setas

8. **Footer**
   - Links: Sobre | Documentação | GitHub | Contato
   - Copyright
   - Selo "Open Source"

---

### 2. Página de Login (login.html)

#### Layout

- **Centralizado** (card no centro da tela)
- Background com gradiente suave verde
- Card branco com sombra
- Campos:
  - Email (tipo email)
  - Senha (tipo password)
  - Checkbox "Lembrar-me"
  - Botão "Entrar" (verde)
- Link "Esqueci minha senha"
- Link "Voltar ao Chat"

#### Funcionalidades

- Validação de campos
- Mensagens de erro/sucesso
- Integração futura com Supabase Auth

---

### 3. Página de Administração (admin.html)

#### Layout

- **Sidebar** (menu lateral):
  - Dashboard
  - Usuários
  - Logs do Sistema
  - Configurações
  - Sair

- **Área Principal**:
  - **Dashboard Tab**:
    - Métricas: Total de consultas, Consultas hoje, Usuários ativos
    - Gráfico de consultas ao longo do tempo
    - Lista de consultas recentes

  - **Usuários Tab**:
    - Tabela com: ID, Nome, Email, Último acesso, Ações
    - Botões: Adicionar Usuário, Exportar

  - **Logs Tab**:
    - Tabela de logs com filtros:
      - Timestamp
      - Agente
      - Request ID
      - Status
      - Mensagem

  - **Configurações Tab**:
    - URL do Webhook n8n
    - Configurações de rate limiting
    - Configurações de cache

---

## 🎭 Animações dos Agentes

### Conceito: "Bonecos em Movimento"

Cada agente deve ter uma representação visual que transmite a sensação de "estar trabalhando". Inspiração em personagens de jogos idle/clicker.

### Estados Visuais

1. **Idle (Aguardando)**
   - Opacidade: 50%
   - Scale: 0.9
   - Animação sutil: breathing (pulsação leve)

2. **Working (Trabalhando)**
   - Opacidade: 100%
   - Scale: 1.05
   - Animações:
     - **Bounce**: O agente "pula" levemente
     - **Glow**: Brilho pulsante ao redor (box-shadow animado)
     - **Float**: Movimento vertical sutil (translateY)
     - **Particles**: Pequenas partículas/sparkles ao redor (opcional)
   - Badge: Spinner girando + texto "Processando..."

3. **Completed (Concluído)**
   - Opacidade: 100%
   - Scale: 1.0
   - Animação: Check verde aparecendo com bounce
   - Badge: "✅ Concluído"

4. **Error (Erro)**
   - Opacidade: 70%
   - Shake (tremor)
   - Badge vermelho: "❌ Erro"

### Elementos Visuais por Agente

#### 🤖 Orquestrador
- Avatar: Robô com capacete/óculos de maestro
- Cor: Azul (#3B82F6)
- Animação especial: "Conduzindo" (movimento de braços como regente)

#### 📜 Legislativo
- Avatar: Figura com toga/livro de leis
- Cor: Verde (#10B981)
- Animação especial: Virando páginas de livro

#### 👔 Político
- Avatar: Figura com terno e gravata
- Cor: Roxo (#8B5CF6)
- Animação especial: Microfone/discurso

#### 💰 Fiscal
- Avatar: Figura com lupa e calculadora
- Cor: Dourado (#F59E0B)
- Animação especial: Contando moedas/analisando documentos

#### 📝 Sintetizador
- Avatar: Figura com caneta/documento
- Cor: Rosa (#EC4899)
- Animação especial: Escrevendo/editando

---

## 🌍 Internacionalização (i18n)

### Idiomas Suportados

1. **Português do Brasil (PT-BR)** - Padrão
2. **Espanhol (ES)**

### Implementação

- Arquivo JSON com traduções: `i18n.js`
- Troca dinâmica sem reload de página
- Persistência em localStorage
- Todas as strings da interface traduzidas
- Placeholders, títulos, mensagens de erro

### Elementos Traduzidos

- Títulos e subtítulos
- Botões e labels
- Mensagens de status dos agentes
- Perguntas de exemplo
- Seção "Fontes de Dados"
- Footer
- Mensagens de erro/sucesso

---

## 📱 Responsividade

### Breakpoints

- **Mobile**: < 640px
  - Agentes em lista vertical (stack)
  - Menu hambúrguer
  - 1 coluna para tudo

- **Tablet**: 640px - 1024px
  - Agentes em grid 2x3
  - 2 colunas para fontes de dados

- **Desktop**: > 1024px
  - Agentes em linha horizontal
  - Layout completo em 3 colunas onde aplicável

---

## ⚡ Interatividade

### Fluxo de Interação Principal

1. **Usuário digita pergunta** → Input fica disabled
2. **Agent Stage aparece** (se estava oculto) com animação
3. **Orquestrador acende** → Badge "Analisando pergunta..."
4. **Especialistas acionados** aparecem em sequência com stagger (delay entre cada)
5. **Cada agente mostra progresso** em tempo real:
   - "Buscando na API..."
   - "Analisando dados..."
   - "Encontrado: 15 resultados"
6. **Sintetizador acende** por último
7. **Resposta final aparece** no chat com animação de fade-in
8. **Todos os agentes** retornam ao estado idle

### Feedback Visual

- Loading spinners
- Progress bars (opcional)
- Toasts/notificações para erros
- Skeleton screens enquanto carrega
- Animações de transição suaves (300-500ms)

---

## 🔧 Tecnologias Utilizadas

### Frontend

- **HTML5** semântico
- **CSS3** puro (sem frameworks na v3 para máxima customização)
  - CSS Grid e Flexbox
  - CSS Animations e Keyframes
  - CSS Variables (Custom Properties)
- **JavaScript ES6+** (Vanilla)
  - Async/Await
  - Fetch API
  - LocalStorage
  - Event Listeners

### Bibliotecas Opcionais (CDN)

- **Tailwind CSS** (via CDN) - Para prototipagem rápida
- **Lucide Icons** - Ícones modernos
- **Animate.css** (opcional) - Animações prontas

---

## 📂 Estrutura de Arquivos

```
prototipos/v3_multi_agentes/
├── index.html              # Página principal
├── login.html              # Página de login
├── admin.html              # Página de administração
├── css/
│   ├── main.css           # Estilos principais
│   ├── animations.css     # Animações dos agentes
│   └── responsive.css     # Media queries
├── js/
│   ├── app.js             # Lógica principal
│   ├── agents.js          # Controle das animações dos agentes
│   ├── i18n.js            # Internacionalização
│   └── api.js             # Comunicação com Supabase/n8n
├── assets/
│   ├── agent_orchestrator.svg
│   ├── agent_legislative.svg
│   ├── agent_political.svg
│   ├── agent_fiscal.svg
│   ├── agent_synthesizer.svg
│   └── logo.svg
├── ESPECIFICACAO.md       # Este documento
├── PLANEJAMENTO.md        # Planejamento de implementação
└── README.md              # Instruções de uso
```

---

## 🎯 Diferenciais desta Proposta

1. **Visualização em Tempo Real**
   - Usuário vê o "pensamento" do sistema

2. **Animações Dinâmicas**
   - Agentes se movem como personagens vivos

3. **Educação Cívica**
   - Interface ensina sobre dados públicos

4. **Transparência Total**
   - Todas as etapas visíveis ao usuário

5. **Bilíngue desde o Início**
   - Inclusão de falantes de espanhol

6. **Design Moderno**
   - Gradientes, sombras suaves, micro-interações

7. **Acessibilidade**
   - Alto contraste
   - Navegação por teclado
   - ARIA labels

---

## 🚀 Próximos Passos

Consulte o arquivo `PLANEJAMENTO.md` para o roadmap de implementação técnica.

---

**Versão**: 3.0
**Data**: Novembro 2024
**Baseado em**: multi_agent_architecture.md
**Inspiração**: https://agentecidadaonewfrontend-production.up.railway.app/
