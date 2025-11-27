# 🚀 Como Visualizar o Protótipo v3

## ✅ Protótipo 100% Funcional!

Todos os arquivos necessários foram criados:

### 📄 Páginas HTML (3)
- ✅ `index.html` - Página principal com chat e agentes
- ✅ `login.html` - Página de login
- ✅ `admin.html` - Painel administrativo

### 🎨 CSS (2)
- ✅ `css/main.css` - Estilos principais
- ✅ `css/animations.css` - Animações dos agentes

### 🌍 JavaScript (4)
- ✅ `js/i18n.js` - Internacionalização (PT-BR/ES)
- ✅ `js/api.js` - API mockada
- ✅ `js/agents.js` - Controle dos agentes
- ✅ `js/app.js` - Script principal

---

## 🖥️ Como Abrir no Navegador

### Opção 1: Servidor Local com Python (Recomendado)

```bash
# Navegue até a pasta do protótipo
cd prototipos/v3_multi_agentes/

# Inicie um servidor HTTP
python3 -m http.server 8000

# Abra no navegador:
# http://localhost:8000
```

### Opção 2: Servidor Local com Node.js

```bash
cd prototipos/v3_multi_agentes/

# Com npx (não precisa instalar)
npx http-server -p 8000

# Abra no navegador:
# http://localhost:8000
```

### Opção 3: VS Code Live Server

1. Instale a extensão "Live Server" no VS Code
2. Abra a pasta `prototipos/v3_multi_agentes/` no VS Code
3. Clique com botão direito em `index.html`
4. Selecione "Open with Live Server"

### Opção 4: Duplo Clique (Pode ter limitações)

Simplesmente dê duplo clique em `index.html`.

⚠️ **Nota**: Alguns navegadores podem bloquear módulos JavaScript quando aberto diretamente (file://). Use um servidor local para melhor experiência.

---

## 🎯 O Que Testar

### 1. Página Principal (`index.html`)

✅ **Troca de Idioma**
- Clique no botão "ES" no cabeçalho
- Toda interface deve mudar para Espanhol
- Clique em "PT" para voltar

✅ **Chat com Agentes**
- Digite uma pergunta no input
- Clique em "Consultar" ou pressione Enter
- Observe os agentes "acenderem" e se moverem
- Veja as mensagens de progresso aparecendo
- Aguarde a resposta final

✅ **Perguntas de Exemplo**
- Clique nos botões de exemplo abaixo do chat
- Eles preenchem automaticamente o input

✅ **Animações dos Agentes**
- Orquestrador: movimento de "condução"
- Legislativo: "virando páginas"
- Político: "discurso"
- Fiscal: "calculando"
- Sintetizador: "escrevendo"

### 2. Página de Login (`login.html`)

✅ **Acesso**: Clique em "Admin" no cabeçalho ou abra diretamente `/login.html`

✅ **Teste o Formulário**
- Preencha email e senha (qualquer valor)
- Clique em "Entrar no Sistema"
- Será redirecionado para admin.html

✅ **Esqueci Minha Senha**
- Clique no link
- Verá um alerta explicando que seria enviado email (mockado)

### 3. Página Admin (`admin.html`)

✅ **Acesso**: Após fazer login ou abra diretamente `/admin.html`

✅ **Verifique**:
- 4 cards de métricas no topo
- Tabela de consultas recentes (6 entradas)
- Tabela de logs do sistema (5 entradas)
- Botão "Visualizar" em cada linha

---

## 🎨 Funcionalidades Implementadas

### Interface Bilíngue
- ✅ Português do Brasil (padrão)
- ✅ Espanhol
- ✅ 60+ strings traduzidas em cada idioma
- ✅ Persistência da escolha no localStorage

### Animações Dinâmicas
- ✅ 5 agentes com animações únicas
- ✅ Estados: idle, working, completed, error
- ✅ Mensagens de progresso em tempo real
- ✅ Glow pulsante ao redor dos agentes ativos
- ✅ Badges coloridos por agente

### Chat Funcional
- ✅ Envio de mensagens
- ✅ Histórico de conversação
- ✅ Indicador de digitação
- ✅ Formatação de Markdown (negrito, listas)
- ✅ Scroll automático

### API Mockada
- ✅ Respostas diferentes por tipo de pergunta
- ✅ Delays realistas
- ✅ Progressão sequencial dos agentes
- ✅ Detecção inteligente por palavras-chave

### Design Responsivo
- ✅ Mobile (< 640px)
- ✅ Tablet (640px - 1024px)
- ✅ Desktop (> 1024px)

---

## 🧪 Perguntas de Teste Recomendadas

Digite estas perguntas para ver diferentes respostas:

1. **Deputados**:
   - "Quais são os deputados de São Paulo?"
   - "Mostre os deputados de MG"

2. **Despesas**:
   - "Mostre as despesas do deputado Eduardo Bolsonaro"
   - "Gastos com combustível dos deputados"

3. **Proposições**:
   - "Projetos de lei sobre educação em 2024"
   - "Proposições sobre saúde"

4. **Votação**:
   - "Qual o histórico de votação de Tabata Amaral?"
   - "Como Guilherme Boulos votou?"

5. **Genérica**:
   - "Me explique como funciona o processo legislativo"

---

## 🎯 Comportamento Esperado

### Fluxo de uma Pergunta:

1. Usuário digita e envia pergunta
2. Input é desabilitado
3. Mensagem do usuário aparece no chat
4. Agentes resetam para "idle"
5. **Orquestrador** acende primeiro:
   - "Analisando sua pergunta..."
   - "Identificando agentes necessários..."
   - Status: completed
6. **Especialistas** (1 a 3) ativam em paralelo:
   - "Consultando bases de dados..."
   - "Processando informações..."
   - Mostra resultados (ex: "Encontradas 15 proposições")
   - Status: completed
7. **Sintetizador** acende por último:
   - "Consolidando informações..."
   - "Redigindo resposta final..."
   - Status: completed
8. Resposta final aparece no chat
9. Após 2 segundos, agentes voltam a "idle"
10. Input é reabilitado

---

## 📊 Estrutura de Arquivos

```
prototipos/v3_multi_agentes/
├── index.html              ← Página principal
├── login.html              ← Login
├── admin.html              ← Administração
│
├── css/
│   ├── main.css            ← Estilos (600+ linhas)
│   └── animations.css      ← Animações (500+ linhas)
│
├── js/
│   ├── i18n.js            ← Internacionalização (400+ linhas)
│   ├── api.js             ← API mockada (350+ linhas)
│   ├── agents.js          ← Controle de agentes (300+ linhas)
│   └── app.js             ← Script principal (400+ linhas)
│
├── assets/
│   └── *.png              ← Imagens dos agentes
│
└── *.md                   ← Documentação
```

---

## 🐛 Resolução de Problemas

### Problema: "Agentes não aparecem"

**Solução**:
- Certifique-se de estar usando um servidor HTTP (não file://)
- Abra o DevTools (F12) e veja se há erros no console
- Verifique se as imagens em `assets/` existem

### Problema: "Chat não envia mensagem"

**Solução**:
- Abra o console (F12) e veja erros
- Certifique-se de que todos os arquivos JS foram carregados
- Verifique a ordem dos scripts no HTML

### Problema: "Animações não funcionam"

**Solução**:
- Verifique se `css/animations.css` foi carregado
- Tente em outro navegador (Chrome/Firefox recomendados)
- Desabilite extensões do navegador temporariamente

### Problema: "Idioma não muda"

**Solução**:
- Verifique se `js/i18n.js` foi carregado
- Limpe o localStorage: F12 → Application → Local Storage → Clear
- Recarregue a página

---

## 🎓 Próximos Passos

### Para Desenvolvimento Futuro:

1. **Substituir PNG por SVG**
   - Criar SVGs inline dos agentes
   - Traduzir textos para português

2. **Integrar com Backend Real**
   - Conectar Supabase Realtime
   - Configurar n8n Webhook
   - Trocar `USE_MOCK: true` para `false` em `js/api.js`

3. **Implementar Autenticação**
   - Supabase Auth no login.html
   - Proteção de rotas

4. **Adicionar Gráficos**
   - Chart.js no admin.html
   - Métricas visuais

---

## 📞 Suporte

Se encontrar algum problema:

1. Verifique o console do navegador (F12)
2. Leia os comentários no código
3. Consulte `README.md` e `ESPECIFICACAO.md`

---

**Desenvolvido com ❤️ para promover transparência e cidadania**

**Versão**: 3.0 - Completa e Funcional
**Data**: Novembro 2024
**Status**: ✅ 100% Implementado
