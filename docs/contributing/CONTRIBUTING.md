# Guia de Contribuição - Agente Cidadão

Obrigado pelo interesse em contribuir com o **Agente Cidadão**! Este documento fornece diretrizes para contribuir com o projeto de forma eficiente e organizada.

## Sumário

- [Código de Conduta](#código-de-conduta)
- [Como Posso Contribuir?](#como-posso-contribuir)
- [Configuração do Ambiente de Desenvolvimento](#configuração-do-ambiente-de-desenvolvimento)
- [Processo de Desenvolvimento](#processo-de-desenvolvimento)
- [Padrões de Código](#padrões-de-código)
- [Convenções de Commit](#convenções-de-commit)
- [Processo de Pull Request](#processo-de-pull-request)
- [Reportando Bugs](#reportando-bugs)
- [Sugerindo Melhorias](#sugerindo-melhorias)

---

## Código de Conduta

Este projeto adota um código de conduta que esperamos que todos os participantes sigam:

- Seja respeitoso e inclusivo com todos
- Aceite críticas construtivas
- Foque no que é melhor para a comunidade
- Mostre empatia com outros membros da comunidade

---

## Como Posso Contribuir?

Existem várias formas de contribuir com o projeto:

### 1. Reportando Bugs

Encontrou um bug? Abra uma [issue](../../issues) incluindo:

- Descrição clara do problema
- Passos para reproduzir
- Comportamento esperado vs. comportamento atual
- Screenshots (se aplicável)
- Ambiente (navegador, SO, versão do Node)

### 2. Sugerindo Melhorias

Tem uma ideia para melhorar o projeto? Abra uma issue com:

- Descrição detalhada da melhoria
- Justificativa (por que isso seria útil?)
- Exemplos de uso ou mockups (se aplicável)

### 3. Contribuindo com Código

Quer implementar uma feature ou correção? Siga o [Processo de Desenvolvimento](#processo-de-desenvolvimento).

### 4. Melhorando a Documentação

Documentação clara é essencial! Você pode:

- Corrigir erros de digitação
- Melhorar explicações
- Adicionar exemplos
- Traduzir documentação

---

## Configuração do Ambiente de Desenvolvimento

### Pré-requisitos

- **Node.js** 18.x ou superior
- **npm** 9.x ou superior
- **Git**
- Conta no [Supabase](https://supabase.com) (para desenvolvimento local)
- Instância do [n8n](https://n8n.io) (local ou em nuvem)

### Passos de Configuração

```bash
# 1. Fork o repositório no GitHub

# 2. Clone seu fork
git clone https://github.com/SEU-USUARIO/AgenteCidadaoFrontEndAgentico.git
cd AgenteCidadaoFrontEndAgentico

# 3. Adicione o repositório original como upstream
git remote add upstream https://github.com/ORIGINAL/AgenteCidadaoFrontEndAgentico.git

# 4. Instale as dependências
npm install

# 5. Configure as variáveis de ambiente
cp .env.example .env
# Edite .env com suas credenciais

# 6. Execute o projeto em modo desenvolvimento
npm run dev
```

### Estrutura do Projeto

```
AgenteCidadaoFrontEndAgentico/
├── src/
│   ├── components/        # Componentes React reutilizáveis
│   ├── pages/            # Páginas da aplicação
│   ├── lib/              # Utilitários e configurações
│   ├── i18n/             # Internacionalização (PT-BR/ES-ES)
│   ├── types/            # Definições TypeScript
│   └── App.tsx           # Componente principal
├── public/               # Arquivos estáticos
├── docs/                 # Documentação adicional
└── tests/                # Testes (a ser implementado)
```

---

## Processo de Desenvolvimento

### 1. Crie uma Branch

```bash
# Sincronize com o upstream
git fetch upstream
git checkout main
git merge upstream/main

# Crie uma branch para sua feature/correção
git checkout -b feature/nome-da-feature
# ou
git checkout -b fix/nome-do-bug
```

### 2. Faça suas Alterações

- Escreva código limpo e legível
- Siga os [Padrões de Código](#padrões-de-código)
- Adicione comentários quando necessário
- Teste suas alterações localmente

### 3. Execute os Testes

```bash
# Lint do código
npm run lint

# Build de produção (verifica erros de compilação)
npm run build
```

### 4. Commit suas Mudanças

Siga as [Convenções de Commit](#convenções-de-commit):

```bash
git add .
git commit -m "feat: adiciona nova funcionalidade X"
```

### 5. Push para seu Fork

```bash
git push origin feature/nome-da-feature
```

### 6. Abra um Pull Request

No GitHub, abra um PR do seu fork para o repositório original.

---

## Padrões de Código

### TypeScript

- Use TypeScript em todos os arquivos
- Evite `any` - prefira tipos específicos ou `unknown`
- Use interfaces para objetos complexos
- Exporte tipos quando forem reutilizáveis

```typescript
// Bom
interface AgentStatus {
  agentName: string;
  status: 'idle' | 'processing' | 'completed';
  timestamp: Date;
}

// Evite
const data: any = {...}
```

### React

- Use **React Hooks** (não class components)
- Componentes funcionais com TypeScript
- Props devem ter interfaces tipadas
- Use `React.FC` com tipos explícitos

```typescript
interface ChatMessageProps {
  message: string;
  sender: 'user' | 'agent';
  timestamp: Date;
}

const ChatMessage: React.FC<ChatMessageProps> = ({ message, sender, timestamp }) => {
  // ...
}
```

### Estilo e Formatação

- Use **TailwindCSS** para estilização
- Evite CSS inline (exceto quando absolutamente necessário)
- Siga a convenção de nomenclatura do Tailwind
- Componentes devem ser responsivos por padrão

```tsx
// Bom
<div className="flex flex-col gap-4 p-6 bg-white rounded-lg shadow-md">
  <h2 className="text-xl font-semibold text-gray-800">Título</h2>
</div>

// Evite
<div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
  ...
</div>
```

### Nomenclatura

- **Componentes**: PascalCase (`ChatInterface.tsx`)
- **Funções/Variáveis**: camelCase (`handleSubmit`, `messageCount`)
- **Constantes**: UPPER_SNAKE_CASE (`API_BASE_URL`)
- **Arquivos de tipos**: PascalCase ou kebab-case (`agent.ts`, `AgentTypes.ts`)

---

## Convenções de Commit

Usamos [Conventional Commits](https://www.conventionalcommits.org/) para mensagens de commit:

### Formato

```
<tipo>(<escopo opcional>): <descrição>

[corpo opcional]

[rodapé opcional]
```

### Tipos

- `feat`: Nova funcionalidade
- `fix`: Correção de bug
- `docs`: Alterações na documentação
- `style`: Formatação, ponto e vírgula, etc (sem mudança de código)
- `refactor`: Refatoração de código
- `perf`: Melhoria de performance
- `test`: Adição ou correção de testes
- `chore`: Manutenção, configuração, dependências

### Exemplos

```bash
feat: adiciona suporte para modo escuro
fix: corrige erro ao enviar mensagem vazia
docs: atualiza README com novos exemplos
refactor: simplifica lógica de roteamento de agentes
chore: atualiza dependências do projeto
```

---

## Processo de Pull Request

### Checklist antes de abrir um PR

- [ ] Código segue os padrões do projeto
- [ ] Lint passa sem erros (`npm run lint`)
- [ ] Build de produção funciona (`npm run build`)
- [ ] Testei as alterações localmente
- [ ] Documentação foi atualizada (se necessário)
- [ ] Commits seguem a convenção

### Template de PR

Ao abrir um PR, inclua:

```markdown
## Descrição
[Descrição clara do que foi alterado e por quê]

## Tipo de Mudança
- [ ] Bug fix
- [ ] Nova funcionalidade
- [ ] Refatoração
- [ ] Documentação
- [ ] Outro (especifique)

## Como Testar
[Instruções para revisar e testar suas alterações]

## Screenshots (se aplicável)
[Adicione screenshots para mudanças visuais]

## Checklist
- [ ] Código segue os padrões do projeto
- [ ] Lint passa sem erros
- [ ] Build de produção funciona
- [ ] Documentação atualizada
```

### Revisão de Código

- Mantenedores revisarão seu PR
- Esteja aberto a feedback e sugestões
- Responda aos comentários prontamente
- Faça as alterações solicitadas

---

## Reportando Bugs

Use o template de issue para bugs:

```markdown
**Descrição do Bug**
[Descrição clara e concisa]

**Passos para Reproduzir**
1. Vá para '...'
2. Clique em '...'
3. Role até '...'
4. Veja o erro

**Comportamento Esperado**
[O que deveria acontecer]

**Screenshots**
[Se aplicável]

**Ambiente**
- OS: [ex: Windows 11]
- Navegador: [ex: Chrome 120]
- Versão: [ex: 1.0.0]
```

---

## Sugerindo Melhorias

Use o template de issue para features:

```markdown
**Descrição da Melhoria**
[Descrição clara da funcionalidade sugerida]

**Problema que Resolve**
[Que problema isso resolve?]

**Solução Proposta**
[Como você implementaria isso?]

**Alternativas Consideradas**
[Outras abordagens que você pensou]

**Contexto Adicional**
[Screenshots, mockups, exemplos]
```

---

## Dúvidas?

Se tiver dúvidas sobre como contribuir:

- Abra uma [Discussion](../../discussions)
- Entre em contato com os mantenedores
- Consulte a [documentação do projeto](./README.md)

---

Obrigado por contribuir para o **Agente Cidadão**! Sua ajuda é fundamental para democratizar o acesso aos dados legislativos brasileiros.
