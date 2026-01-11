# 🚀 Guia de Deploy - Railway.com

Este guia detalha o processo completo para fazer deploy deste projeto no Railway.com.

## 📋 Pré-requisitos

1. Conta no [Railway.com](https://railway.app)
2. Repositório Git (GitHub, GitLab ou Bitbucket)
3. Credenciais do Supabase
4. URL do webhook n8n (se aplicável)

## 🔧 Configuração Inicial

### 1. Preparar Variáveis de Ambiente

O projeto requer as seguintes variáveis de ambiente:

```env
VITE_N8N_WEBHOOK_URL=https://your-n8n-instance.com/webhook/your-webhook-id
VITE_SUPABASE_URL=https://your-project.supabase.co
VITE_SUPABASE_ANON_KEY=your-supabase-anon-key-here
```

### 2. Teste Local

Antes de fazer o deploy, teste localmente:

#### Desenvolvimento Local
```bash
# 1. Copiar o arquivo de exemplo
cp .env.example .env

# 2. Editar o .env com suas credenciais
# Abra o arquivo .env e preencha com suas credenciais reais

# 3. Instalar dependências
npm install

# 4. Rodar em modo desenvolvimento
npm run dev
```

Acesse: http://localhost:5173

#### Testar Build de Produção
```bash
# 1. Fazer o build
npm run build

# 2. Testar o preview
npm run preview
```

Acesse: http://localhost:4173

## 🚢 Deploy no Railway

### Opção 1: Deploy Direto do GitHub (Recomendado)

1. **Acesse o Railway:**
   - Vá para [Railway.com](https://railway.app)
   - Faça login ou crie uma conta

2. **Crie um Novo Projeto:**
   - Clique em "New Project"
   - Selecione "Deploy from GitHub repo"
   - Selecione este repositório

3. **Configure as Variáveis de Ambiente:**
   - Vá para a aba "Variables"
   - Adicione cada variável necessária:
     - `VITE_N8N_WEBHOOK_URL`
     - `VITE_SUPABASE_URL`
     - `VITE_SUPABASE_ANON_KEY`

4. **Configure o Dockerfile:**
   - O Railway detectará automaticamente o Dockerfile
   - Certifique-se de que está usando o Dockerfile na raiz do projeto

5. **Deploy:**
   - O Railway iniciará o build automaticamente
   - Aguarde o processo de build e deploy
   - Após concluído, você receberá uma URL pública

### Opção 2: Deploy via Railway CLI

```bash
# 1. Instalar Railway CLI
npm i -g @railway/cli

# 2. Login
railway login

# 3. Inicializar projeto
railway init

# 4. Adicionar variáveis de ambiente
railway variables set VITE_N8N_WEBHOOK_URL="sua-url-aqui"
railway variables set VITE_SUPABASE_URL="sua-url-aqui"
railway variables set VITE_SUPABASE_ANON_KEY="sua-chave-aqui"

# 5. Deploy
railway up
```

## 🔍 Verificações Pós-Deploy

Após o deploy, verifique:

1. ✅ Aplicação está acessível via URL fornecida pelo Railway
2. ✅ Console do navegador não mostra erros
3. ✅ Conexão com Supabase está funcionando
4. ✅ Webhook n8n está respondendo (se aplicável)
5. ✅ Todas as rotas do React Router funcionam corretamente

## 🐛 Troubleshooting

### Build Falha no Railway

**Problema:** Build falha com erro de memória
```
Solução: Aumente a memória do serviço nas configurações do Railway
```

**Problema:** Variáveis de ambiente não reconhecidas
```
Solução: Certifique-se de que todas as variáveis começam com VITE_
e foram adicionadas no painel do Railway
```

### Aplicação não Carrega

**Problema:** Página em branco após deploy
```
Solução: Verifique o console do navegador. Pode ser problema com
variáveis de ambiente ou CORS.
```

**Problema:** Rotas não funcionam (404 em refresh)
```
Solução: O nginx.conf já está configurado para lidar com isso.
Verifique se o arquivo foi copiado corretamente no Dockerfile.
```

### Conexão com Supabase Falha

**Problema:** Erros de autenticação/conexão
```
Solução: Verifique se:
1. VITE_SUPABASE_URL está correto
2. VITE_SUPABASE_ANON_KEY está correto
3. Configurações de CORS no Supabase permitem o domínio do Railway
```

## 📊 Monitoramento

### Railway Dashboard
- Logs em tempo real: Aba "Deployments" → "View Logs"
- Métricas: CPU, memória, network na aba "Metrics"
- Uso: Verifique o uso de recursos na aba "Usage"

### Logs da Aplicação
```bash
# Via Railway CLI
railway logs
```

## 🔄 Atualizações e Redeploy

### Deploy Automático
O Railway está configurado para fazer deploy automático quando você:
- Faz push para a branch configurada (geralmente `main`)
- O deploy é acionado automaticamente

### Deploy Manual
```bash
# Via CLI
railway up

# Ou force um novo deploy no dashboard
# Railway Dashboard → Deployments → "Redeploy"
```

## 🔐 Segurança

### Checklist de Segurança:
- [ ] Variáveis de ambiente nunca commitadas no Git
- [ ] `.env` está no `.gitignore`
- [ ] CORS configurado corretamente no Supabase
- [ ] Headers de segurança configurados no nginx
- [ ] HTTPS habilitado (Railway fornece automaticamente)
- [ ] Chaves de API com permissões mínimas necessárias

## 💰 Custos

- Railway oferece um plano gratuito com:
  - $5 de crédito mensal
  - 500 horas de execução
  - 512 MB RAM
  - 1 GB disco

- Para produção, considere upgrade conforme necessidade

## 📞 Suporte

- Documentação Railway: https://docs.railway.app
- Discord Railway: https://discord.gg/railway
- Supabase Docs: https://supabase.com/docs
- n8n Docs: https://docs.n8n.io

## 🎯 Próximos Passos

Após o deploy bem-sucedido:

1. Configure um domínio personalizado (opcional)
2. Configure monitoramento de uptime
3. Configure backup dos dados (Supabase)
4. Implemente CI/CD mais robusto se necessário
5. Configure staging environment para testes

---

**Última atualização:** Dezembro 2025
