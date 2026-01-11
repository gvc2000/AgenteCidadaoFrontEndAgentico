# Walkthrough - Frontend Agente Cidadão

O frontend do Agente Cidadão foi implementado com sucesso seguindo a arquitetura "Transparente (Realtime)".

## O que foi feito

### 1. Estrutura do Projeto
- Inicializado com **Vite + React + TypeScript**.
- Configurado **TailwindCSS** para estilização.
- Integrado **Supabase Client** para comunicação realtime.

### 2. Componentes Principais
- **`AgentStatus.tsx`**: Visualização dinâmica dos agentes (Orquestrador, Legislativo, Político, Fiscal). Os cards pulsam quando estão "trabalhando" e mostram mensagens de log em tempo real.
- **`ChatInterface.tsx`**: Interface de chat moderna, com histórico de mensagens e input fixo.
- **`App.tsx`**: Gerencia o estado global e a lógica de conexão com o Supabase.
    - **Fluxo Realtime**: O app insere um registro na tabela `requests` e então "escuta" por atualizações na tabela `agent_logs` (para status) e na própria tabela `requests` (para a resposta final).

### 3. Estilização
- Implementado tema **Verde Câmara** (`#006847`) conforme solicitado.
- Design responsivo e limpo.

## Como Rodar

1.  **Instalar dependências** (já feito):
    ```bash
    npm install
    ```

2.  **Rodar servidor de desenvolvimento**:
    ```bash
    npm run dev
    ```
    O app estará disponível em `http://localhost:5173`.

3.  **Build para Produção**:
    ```bash
    npm run build
    ```

## Integração com n8n (Importante)

Para que o sistema funcione conforme a arquitetura "Realtime", você precisa configurar o seguinte:

1.  **Supabase Database Webhook**:
    - No painel do Supabase, vá em **Database** -> **Webhooks**.
    - Crie um novo webhook que dispara no evento **INSERT** da tabela `requests`.
    - URL do Webhook: `https://n8n-agentecidadaoagentico-production.up.railway.app/webhook/chat`

2.  **Ajuste no Workflow n8n**:
    - O workflow atual (`workflow_multi_agentes.json`) possui um nó **"Supabase: Init Request"** que insere um novo registro.
    - **Problema**: Como o frontend já insere o registro para iniciar o processo, o n8n não deve inserir outro.
    - **Solução**:
        - Remova o nó "Supabase: Init Request".
        - Configure o nó "Webhook Chat" para receber os dados do Supabase (que incluirão o `id` do request criado pelo frontend).
        - Atualize as referências nos nós seguintes para usar o `id` vindo do Webhook em vez do nó "Supabase: Init Request".

## Verificação Realizada

- [x] **Build**: O projeto compila sem erros de TypeScript (`npm run build` passou).
- [x] **Lint**: Código limpo e sem erros de lint.
- [x] **Arquitetura**: A lógica de assinatura do Supabase (`channel.on(...)`) está implementada no `App.tsx` e alinhada com os nomes de tabelas do workflow (`requests`, `agent_logs`).
