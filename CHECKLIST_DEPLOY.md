# ✅ Checklist de Deploy Railway.com

Use este checklist para garantir que tudo está pronto antes do deploy.

## 📝 Antes do Deploy

### 1. Credenciais e Configurações
- [ ] Tenho uma conta no Railway.com
- [ ] Tenho uma conta no Supabase
- [ ] Tenho acesso ao webhook do n8n (ou posso desabilitar temporariamente)
- [ ] Anotei todas as credenciais necessárias

### 2. Variáveis de Ambiente
- [ ] Copiei o arquivo `.env.example` para `.env` localmente
- [ ] Preenchi todas as variáveis no arquivo `.env`
- [ ] Testei a aplicação localmente com `npm run dev`
- [ ] A aplicação funciona corretamente em localhost

### 3. Testes Locais
- [ ] Executei `npm install` sem erros
- [ ] Executei `npm run build` com sucesso
- [ ] Executei `npm run preview` e testei a build
- [ ] Verifiquei que não há erros no console do navegador

### 4. Repositório Git
- [ ] Código está commitado no Git
- [ ] Código está no GitHub/GitLab/Bitbucket
- [ ] Branch principal está atualizada
- [ ] Arquivo `.env` NÃO está no repositório (está no .gitignore)

## 🚀 Durante o Deploy no Railway

### 5. Configuração Inicial
- [ ] Criei um novo projeto no Railway
- [ ] Conectei meu repositório GitHub
- [ ] Railway detectou o Dockerfile

### 6. Variáveis de Ambiente no Railway
- [ ] Adicionei `VITE_N8N_WEBHOOK_URL`
- [ ] Adicionei `VITE_SUPABASE_URL`
- [ ] Adicionei `VITE_SUPABASE_ANON_KEY`
- [ ] Verifiquei que não há espaços extras nas variáveis
- [ ] Salvei as configurações

### 7. Build e Deploy
- [ ] Aguardei o build completar (pode levar 2-5 minutos)
- [ ] Build foi concluído sem erros
- [ ] Deploy foi marcado como "Active"
- [ ] Recebi uma URL pública do Railway

## 🔍 Após o Deploy

### 8. Testes Pós-Deploy
- [ ] Acessei a URL fornecida pelo Railway
- [ ] A página carregou corretamente
- [ ] Não há erros no console do navegador (F12)
- [ ] Testei a navegação entre páginas
- [ ] Testei funcionalidades principais

### 9. Integração com Serviços
- [ ] Conexão com Supabase está funcionando
- [ ] Webhook n8n está respondendo (se aplicável)
- [ ] Dados estão sendo carregados/salvos corretamente

### 10. Configurações de Produção
- [ ] Configurei domínio personalizado (opcional)
- [ ] Verifiquei configurações de CORS no Supabase
- [ ] Adicionei domínio do Railway nas configurações do Supabase
- [ ] Configurei monitoramento (opcional)

## 🐛 Troubleshooting

Se algo não funcionou:

### Build Falhou
1. Verifique os logs do Railway
2. Confirme que todas as dependências estão no package.json
3. Verifique se há erros de TypeScript

### Deploy OK mas Aplicação Não Carrega
1. Abra o console do navegador (F12)
2. Verifique erros de variáveis de ambiente
3. Confirme que variáveis começam com `VITE_`
4. Verifique se as URLs estão corretas

### Erro de Conexão com Supabase
1. Verifique se VITE_SUPABASE_URL está correto
2. Verifique se VITE_SUPABASE_ANON_KEY está correto
3. No Supabase, vá em Settings → API → URL do projeto
4. Configure CORS para permitir domínio do Railway

### Rotas React não Funcionam
1. Verifique se nginx.conf foi copiado no build
2. Confirme que o Dockerfile está usando nginx.conf
3. O arquivo já está configurado para SPA

## 📞 Precisa de Ajuda?

- Documentação Railway: https://docs.railway.app
- Documentação Supabase: https://supabase.com/docs
- Logs do Railway: Dashboard → Deployments → View Logs

## ✨ Deploy Bem-Sucedido!

Após marcar todos os itens:
- [ ] Documentei a URL de produção
- [ ] Compartilhei com a equipe (se aplicável)
- [ ] Configurei backups
- [ ] Anotei as credenciais em local seguro

---

**Parabéns! 🎉** Sua aplicação está no ar!
