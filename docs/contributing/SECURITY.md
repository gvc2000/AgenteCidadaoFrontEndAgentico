# Política de Segurança - Agente Cidadão

## Sumário

- [Versões Suportadas](#versões-suportadas)
- [Reportando uma Vulnerabilidade](#reportando-uma-vulnerabilidade)
- [Processo de Tratamento](#processo-de-tratamento)
- [Práticas de Segurança](#práticas-de-segurança)
- [Divulgação Responsável](#divulgação-responsável)

---

## Versões Suportadas

Mantemos suporte de segurança para as seguintes versões:

| Versão | Suportada          |
| ------ | ------------------ |
| 1.x.x  | :white_check_mark: |
| < 1.0  | :x:                |

Recomendamos sempre usar a versão mais recente para garantir todas as correções de segurança.

---

## Reportando uma Vulnerabilidade

Se você descobriu uma vulnerabilidade de segurança no **Agente Cidadão**, pedimos que nos ajude divulgando-a de forma responsável.

### Como Reportar

**NÃO abra issues públicas para vulnerabilidades de segurança.**

Envie um email para: **[ENDEREÇO DE EMAIL DE SEGURANÇA]**

### Informações a Incluir

Para nos ajudar a entender e corrigir o problema rapidamente, inclua:

1. **Descrição da Vulnerabilidade**
   - Tipo de vulnerabilidade (ex: XSS, SQL Injection, CSRF, etc.)
   - Componente afetado (frontend, backend, API)

2. **Impacto Potencial**
   - Que dados ou funcionalidades estão em risco?
   - Quem pode ser afetado?

3. **Passos para Reproduzir**
   - Instruções detalhadas passo a passo
   - Código de prova de conceito (PoC), se disponível
   - Screenshots ou vídeos (se aplicável)

4. **Ambiente**
   - Versão do sistema
   - Configuração relevante
   - Navegador/plataforma (se aplicável)

5. **Possível Solução** (opcional)
   - Se tiver sugestões de como corrigir

### Exemplo de Report

```
Assunto: [SEGURANÇA] XSS no campo de busca

Descrição:
Descobri uma vulnerabilidade XSS refletida no campo de busca do chat.

Impacto:
Um atacante pode executar JavaScript arbitrário no contexto do usuário.

Reprodução:
1. Acesse https://agentecidadao.com/chat
2. Digite no campo de busca: <script>alert('XSS')</script>
3. Envie a mensagem
4. O script é executado

Versão: 1.0.0
Navegador: Chrome 120 no Windows 11

Possível solução:
Implementar sanitização de entrada usando DOMPurify antes de renderizar.
```

---

## Processo de Tratamento

### Timeline Esperado

1. **Confirmação de Recebimento**: 24-48 horas
   - Confirmaremos que recebemos seu report

2. **Avaliação Inicial**: 3-5 dias úteis
   - Avaliaremos a severidade e impacto
   - Reproduziremos a vulnerabilidade

3. **Desenvolvimento da Correção**: Variável
   - Depende da complexidade
   - Manteremos você informado do progresso

4. **Release da Correção**: Após testes
   - Publicaremos a correção
   - Atualizaremos o CHANGELOG

5. **Divulgação Pública**: 7-30 dias após o fix
   - Publicaremos um security advisory
   - Daremos crédito (se você desejar)

### Classificação de Severidade

Usamos o [CVSS v3.1](https://www.first.org/cvss/) para classificar vulnerabilidades:

- **Crítica (9.0-10.0)**: Correção imediata (< 7 dias)
- **Alta (7.0-8.9)**: Correção urgente (< 30 dias)
- **Média (4.0-6.9)**: Correção em próximo release (< 90 dias)
- **Baixa (0.1-3.9)**: Correção em releases futuros

---

## Práticas de Segurança

### Para Usuários

#### Configuração Segura

1. **Variáveis de Ambiente**
   - NUNCA commite arquivos `.env` com credenciais reais
   - Use `.env.example` como template
   - Rotacione credenciais regularmente

2. **Supabase Security**
   - Use **APENAS** `SUPABASE_ANON_KEY` no frontend
   - NUNCA exponha `SUPABASE_SERVICE_KEY` publicamente
   - Configure Row Level Security (RLS) adequadamente

3. **n8n Webhooks**
   - Use HTTPS para todos os webhooks
   - Implemente autenticação quando possível
   - Valide tokens de webhook

#### Atualizações

- Mantenha o projeto atualizado com a versão mais recente
- Monitore o [CHANGELOG](./CHANGELOG.md) para atualizações de segurança
- Subscribe para notificações de security advisories

### Para Desenvolvedores

#### Código Seguro

1. **Input Validation**
   ```typescript
   // Sempre valide e sanitize inputs do usuário
   import DOMPurify from 'dompurify';

   const sanitizedInput = DOMPurify.sanitize(userInput);
   ```

2. **XSS Prevention**
   - Use React's JSX (escapa automaticamente)
   - Evite `dangerouslySetInnerHTML`
   - Sanitize HTML quando necessário

3. **Autenticação & Autorização**
   - Implemente autenticação adequada
   - Valide permissões no backend
   - Use tokens JWT com expiração

4. **Secrets Management**
   ```typescript
   // Bom: Use variáveis de ambiente
   const apiKey = import.meta.env.VITE_API_KEY;

   // Ruim: Hardcode de secrets
   const apiKey = "sk-1234567890abcdef"; // NUNCA FAÇA ISSO
   ```

5. **HTTPS Everywhere**
   - Use HTTPS em produção
   - Configure HSTS headers
   - Valide certificados SSL

#### Dependências

```bash
# Audite regularmente as dependências
npm audit

# Corrija vulnerabilidades automaticamente
npm audit fix

# Para vulnerabilidades que requerem breaking changes
npm audit fix --force
```

#### Content Security Policy (CSP)

Configure CSP headers no Nginx/servidor:

```nginx
add_header Content-Security-Policy "default-src 'self'; script-src 'self' 'unsafe-inline'; style-src 'self' 'unsafe-inline'; img-src 'self' data: https:; connect-src 'self' https://supabase.co https://*.supabase.co;";
```

---

## Divulgação Responsável

### Nossa Promessa

- Responderemos a todos os reports de segurança
- Trataremos sua descoberta com confidencialidade
- Manteremos você informado sobre o progresso
- Daremos crédito público (se você desejar)
- Não tomaremos ações legais contra pesquisadores de boa fé

### Diretrizes para Pesquisadores

**Permitido:**
- Testar em instâncias locais próprias
- Reportar vulnerabilidades de forma responsável
- Dar tempo razoável para correção antes de divulgar

**NÃO Permitido:**
- Acessar dados de outros usuários
- Executar ataques de negação de serviço (DoS)
- Destruir ou modificar dados
- Executar phishing ou engenharia social
- Violar privacidade de usuários

### Hall of Fame

Agradecemos aos seguintes pesquisadores de segurança por suas contribuições:

<!--
Lista será atualizada conforme recebemos e corrigimos vulnerabilidades reportadas
-->

_Nenhum report de segurança processado ainda._

---

## Contato de Segurança

- **Email**: [ENDEREÇO DE EMAIL DE SEGURANÇA]
- **PGP Key**: [FINGERPRINT DA CHAVE PGP] (opcional)
- **Response Time**: 24-48 horas

---

## Recursos Adicionais

- [OWASP Top 10](https://owasp.org/www-project-top-ten/)
- [OWASP Cheat Sheet Series](https://cheatsheetseries.owasp.org/)
- [Security Headers](https://securityheaders.com/)
- [Supabase Security Best Practices](https://supabase.com/docs/guides/platform/security)

---

## Atualizações desta Política

Esta política pode ser atualizada periodicamente. Alterações significativas serão comunicadas através de:

- Commit log no repositório
- Atualizações no CHANGELOG
- Anúncios na página do projeto

**Última atualização**: 2026-01-10

---

Obrigado por ajudar a manter o **Agente Cidadão** seguro para todos os usuários!
