# 🤖 Protótipo v3 - Interface Multi-Agentes Agente Cidadão

## 📝 Sobre Este Protótipo

Este protótipo demonstra visualmente a **arquitetura multi-agentes** do projeto Agente Cidadão, conforme especificado no documento `multi_agent_architecture.md`. A interface permite ao usuário acompanhar em tempo real o trabalho de cada agente especializado, criando uma experiência transparente e educativa.

### ✨ Principais Características

- 🎭 **Animações Dinâmicas dos Agentes**: Cada agente tem movimento próprio quando está trabalhando
- 🌍 **Bilíngue**: Suporte completo para Português (PT-BR) e Espanhol (ES)
- 📱 **Responsivo**: Funciona em desktop, tablet e mobile
- ⚡ **Tempo Real (Simulado)**: Mostra o progresso de cada agente conforme trabalham
- 🎨 **Design Moderno**: Baseado nas cores oficiais da Câmara dos Deputados
- ♿ **Acessível**: Navegação por teclado e suporte a leitores de tela

---

## 🏗️ Estrutura do Projeto

```
prototipos/v3_multi_agentes/
├── index.html                 # Página principal
├── login.html                 # Página de login
├── admin.html                 # Página administrativa
│
├── css/
│   ├── main.css              # Estilos principais
│   └── animations.css        # Animações dos agentes
│
├── js/
│   ├── i18n.js              # Sistema de internacionalização
│   ├── api.js               # API mockada (simulação)
│   ├── agents.js            # Controle das animações dos agentes
│   └── app.js               # Script principal da aplicação
│
├── assets/
│   ├── agent_orchestrator.png
│   ├── agent_legislative.png
│   ├── agent_political.png
│   ├── agent_fiscal.png
│   └── agent_synthesizer.png
│
├── ESPECIFICACAO.md          # Especificação completa da interface
├── PLANEJAMENTO.md           # Planejamento técnico de implementação
└── README.md                 # Este arquivo
```

---

## 🤖 Os 5 Agentes

### 1. 🤖 Agente Orquestrador
- **Cor**: Azul (#3B82F6)
- **Função**: Coordena e delega tarefas para os especialistas
- **Animação**: Movimento de "condução" (como um maestro)

### 2. 📜 Agente Legislativo
- **Cor**: Verde (#10B981)
- **Função**: Especialista em proposições e tramitações legislativas
- **Animação**: Movimento de "virando páginas" de livro

### 3. 👔 Agente Político
- **Cor**: Roxo (#8B5CF6)
- **Função**: Analista de perfis de deputados e atividades políticas
- **Animação**: Movimento de "discurso" (pulsação)

### 4. 💰 Agente Fiscal
- **Cor**: Dourado (#F59E0B)
- **Função**: Auditor de gastos públicos e despesas parlamentares
- **Animação**: Movimento de "contando/calculando"

### 5. 📝 Agente Sintetizador
- **Cor**: Rosa (#EC4899)
- **Função**: Consolida informações e redige respostas claras
- **Animação**: Movimento de "escrevendo"

---

## 🚀 Como Executar

### Opção 1: Abrir Diretamente no Navegador

1. Navegue até a pasta do protótipo:
   ```bash
   cd prototipos/v3_multi_agentes/
   ```

2. Abra o arquivo `index.html` diretamente no navegador:
   - Duplo clique no arquivo, OU
   - Arraste o arquivo para o navegador

### Opção 2: Servidor Local (Recomendado)

#### Com Python:
```bash
cd prototipos/v3_multi_agentes/
python3 -m http.server 8000
```
Acesse: http://localhost:8000

#### Com Node.js (http-server):
```bash
cd prototipos/v3_multi_agentes/
npx http-server -p 8000
```
Acesse: http://localhost:8000

#### Com VS Code (Live Server Extension):
1. Instale a extensão "Live Server"
2. Clique com botão direito em `index.html`
3. Selecione "Open with Live Server"

---

## 💡 Como Testar

### Teste 1: Animação dos Agentes

1. Abra a página principal (`index.html`)
2. Digite uma pergunta de exemplo no chat
3. Observe os agentes "acenderem" e se moverem em sequência
4. Veja as mensagens de progresso aparecendo em tempo real

### Teste 2: Internacionalização

1. Clique no botão "ES" no cabeçalho
2. Toda a interface deve traduzir para Espanhol
3. Clique em "PT" para voltar ao Português
4. A preferência é salva no localStorage

### Teste 3: Responsividade

1. Abra o DevTools (F12)
2. Ative o modo de dispositivo móvel (Ctrl+Shift+M)
3. Teste em diferentes tamanhos:
   - iPhone (375px)
   - iPad (768px)
   - Desktop (1920px)

### Teste 4: Perguntas de Exemplo

Clique nos botões de exemplo para preencher automaticamente perguntas:
- "Quais são os deputados de São Paulo?"
- "Mostre as despesas do deputado Eduardo Bolsonaro"
- "Projetos de lei sobre educação em 2024"
- Etc.

### Teste 5: Páginas Adicionais

- **Login**: Acesse `/login.html`
- **Admin**: Acesse `/admin.html`

---

## 🎨 Personalização

### Alterar Cores dos Agentes

Edite o arquivo `css/main.css`:

```css
:root {
  --agent-orchestrator: #3B82F6;  /* Altere aqui */
  --agent-legislative: #10B981;
  /* ... */
}
```

### Adicionar Novo Idioma

Edite o arquivo `js/i18n.js`:

```javascript
const translations = {
  'pt-br': { /* ... */ },
  'es': { /* ... */ },
  'en': {  // Adicione aqui
    'header.title': 'Citizen Agent',
    // ...
  }
};
```

### Modificar Tempo das Animações

Edite o arquivo `js/api.js`:

```javascript
const DELAYS = {
  ORCHESTRATOR_START: 500,   // Altere aqui (em milissegundos)
  SPECIALISTS_START: 1000,
  // ...
};
```

---

## 📚 Documentação Adicional

### Para Designers

- Consulte `ESPECIFICACAO.md` para detalhes completos do design system, paleta de cores, tipografia e especificações visuais.

### Para Desenvolvedores

- Consulte `PLANEJAMENTO.md` para arquitetura técnica, estrutura de dados, fluxos de integração e preparação para backend real.

### Especificação Original

- A arquitetura está baseada no documento raiz: `../../multi_agent_architecture.md`

---

## 🔌 Integração Futura com Backend

Este protótipo está **preparado para integração** com:

### Supabase Realtime
- Estrutura de listeners já implementada em `js/api.js`
- Basta trocar `USE_MOCK: true` para `false`
- Configurar variáveis: `SUPABASE_URL` e `SUPABASE_ANON_KEY`

### n8n Webhook
- Endpoint de POST já configurado
- Payload estruturado: `{ user_query: string }`

### Autenticação
- Páginas de login e admin já criadas
- Pronto para integrar Supabase Auth

---

## 🎯 Próximos Passos

### Para Desenvolver Mais

1. **Adicionar mais perguntas de exemplo**
   - Edite `index.html` e `js/i18n.js`

2. **Criar assets SVG animados**
   - Substitua as imagens PNG por SVGs inline editáveis

3. **Implementar gráficos no Admin**
   - Use Chart.js ou similar

4. **Conectar com backend real**
   - Siga instruções em `PLANEJAMENTO.md > Integração Futura`

---

## 🐛 Problemas Conhecidos

- [ ] Imagens dos agentes ainda em PNG (ideal seria SVG animado)
- [ ] Admin mockado (sem dados reais)
- [ ] Login sem validação funcional
- [ ] Respostas mockadas (não vem de IA real)

Estes são **intencionais** em um protótipo. Para versão de produção, conecte aos serviços reais.

---

## 🤝 Contribuindo

Este é um protótipo para demonstração. Para contribuir com o projeto principal:

1. Clone o repositório
2. Crie uma branch: `git checkout -b feature/nova-funcionalidade`
3. Faça suas alterações
4. Commit: `git commit -m "feat: adiciona nova funcionalidade"`
5. Push: `git push origin feature/nova-funcionalidade`
6. Abra um Pull Request

---

## 📄 Licença

Projeto Open Source - Veja LICENSE para detalhes.

---

## 👥 Autores

- **Design & Especificação**: Baseado no multi_agent_architecture.md
- **Interface de Referência**: https://agentecidadaonewfrontend-production.up.railway.app/
- **Implementação v3**: Claude Agent

---

## 📞 Suporte

Para dúvidas ou sugestões:
- Abra uma Issue no GitHub
- Consulte a documentação em `/docs`
- Entre em contato com a equipe

---

**Versão**: 3.0 (Multi-Agentes)
**Data**: Novembro 2024
**Status**: ✅ Protótipo Funcional (Mock)

---

## 🎉 Agradecimentos

Agradecimentos especiais à Câmara dos Deputados por disponibilizar APIs abertas e ao projeto de dados abertos do governo brasileiro.

---

**Desenvolvido com ❤️ para promover transparência e cidadania**
