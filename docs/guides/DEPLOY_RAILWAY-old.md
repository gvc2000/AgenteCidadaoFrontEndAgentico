# Guia de Deploy no Railway - Agente Cidadão FrontEnd

Este guia descreve como fazer o deploy da aplicação frontend (Vite/React) no Railway.

## Pré-requisitos

1.  Conta no [Railway.app](https://railway.app/).
2.  Conta no GitHub conectada ao Railway.
3.  O projeto deve estar no GitHub (o que já foi feito).

## Passo a Passo

### 1. Criar Novo Projeto no Railway

1.  No painel do Railway, clique em **+ New Project**.
2.  Selecione **Deploy from GitHub repo**.
3.  Escolha o repositório `AgenteCidadaoFrontEndAgentico`.
4.  Clique em **Deploy Now**.

### 2. Configurações de Build e Start

O Railway geralmente detecta que é um projeto Node.js/Vite, mas para garantir que funcione como um site estático de alta performance, recomenda-se configurar explicitamente:

1.  Vá na aba **Settings** do serviço criado.
2.  Role até a seção **Build**.
3.  **Build Command**: `npm run build`
4.  **Start Command**: `npx serve -s dist -l $PORT`
    *   *Nota: O comando `serve` serve os arquivos estáticos gerados na pasta `dist`.*

### 3. Variáveis de Ambiente

Se o seu frontend precisa se comunicar com o backend (MCP/n8n) ou Supabase, você precisa definir as variáveis de ambiente.

1.  Vá na aba **Variables**.
2.  Adicione as variáveis do seu `.env`:
    *   `VITE_SUPABASE_URL`: (Sua URL do Supabase)
    *   `VITE_SUPABASE_ANON_KEY`: (Sua chave anônima)
    *   `VITE_API_URL`: (URL do seu backend/n8n, se aplicável)

### 4. Gerar Domínio Público

1.  Vá na aba **Settings**.
2.  Em **Networking**, clique em **Generate Domain** (ou adicione um domínio customizado).
3.  Acesse a URL gerada para ver seu site no ar!

## Solução de Problemas Comuns

*   **Erro 404 em rotas**: Como é uma SPA (Single Page Application), se você recarregar a página em uma rota interna (ex: `/chat`), pode dar 404. O comando `serve -s` (single) já trata isso redirecionando para `index.html`.
*   **Build falhando**: Verifique os logs na aba **Deployments**. Geralmente é falta de alguma dependência no `package.json`.

---
**Dica**: Para facilitar, você pode adicionar o script de start no seu `package.json` localmente:
```json
"scripts": {
  "start": "npx serve -s dist -l 3000"
}
```
Mas configurar direto no Railway (Passo 2) funciona perfeitamente sem alterar o código.
