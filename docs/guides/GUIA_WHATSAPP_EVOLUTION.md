# 📱 Guia Completo: Integração WhatsApp + Agente Cidadão via Evolution API

**Objetivo:** Permitir que o Agente Cidadão receba e responda mensagens via WhatsApp, mantendo o frontend web funcionando normalmente em paralelo.

**Atualizado:** 10/01/2026
**Evolution API:** v2.3.x (compatível com Baileys 7.x)
**Nível:** Intermediário
**Tempo estimado:** 60-90 minutos

---

## 📋 Índice

- [Visão Geral](#visão-geral)
- [Pré-requisitos](#pré-requisitos)
- [Parte 1: Deploy Evolution API no Railway](#parte-1-deploy-evolution-api-no-railway)
- [Parte 2: Conectar Número WhatsApp](#parte-2-conectar-número-whatsapp)
- [Parte 3: Modificar Workflow n8n](#parte-3-modificar-workflow-n8n)
- [Parte 4: Testar a Integração](#parte-4-testar-a-integração)
- [Boas Práticas e Otimizações](#boas-práticas-e-otimizações)
- [Troubleshooting Avançado](#troubleshooting-avançado)
- [Monitoramento e Manutenção](#monitoramento-e-manutenção)

---

## 📐 Visão Geral

### Arquitetura Completa

```
┌──────────────────────────────────────────────────────────────────────┐
│                    ENTRADA VIA WEB (mantida)                         │
│                                                                       │
│  [Usuário Web] → [Frontend React] → [Webhook /chat]                 │
│                                          ↓                            │
│                                    [n8n Workflow]                     │
│                                          ↓                            │
│                    [Orquestrador] → [Agentes] → [Sintetizador]       │
│                                          ↓                            │
│                              [Response] → [Frontend]                 │
└──────────────────────────────────────────────────────────────────────┘

┌──────────────────────────────────────────────────────────────────────┐
│                  ENTRADA VIA WHATSAPP (nova)                         │
│                                                                       │
│  [Usuário WhatsApp] → [WhatsApp Servers]                            │
│                              ↓                                        │
│                       [Evolution API]                                │
│                     (Railway Container)                              │
│                              ↓                                        │
│                    [Webhook /whatsapp]                               │
│                              ↓                                        │
│                   [n8n: Adaptar Payload]                             │
│                              ↓                                        │
│                    [n8n Workflow compartilhado]                      │
│                              ↓                                        │
│                    [Orquestrador] → [Agentes] → [Sintetizador]       │
│                              ↓                                        │
│                     [IF: Origem = WhatsApp?]                         │
│                        ↙              ↘                              │
│                   [SIM]              [NÃO]                           │
│                      ↓                  ↓                            │
│            [HTTP: Enviar WhatsApp]  [Response Web]                  │
│                      ↓                                               │
│              [Evolution API]                                         │
│                      ↓                                               │
│              [Usuário WhatsApp]                                      │
└──────────────────────────────────────────────────────────────────────┘
```

### Como Funciona

1. **Usuário envia mensagem** no WhatsApp
2. **WhatsApp Servers** entregam mensagem para Evolution API
3. **Evolution API** envia webhook para n8n (`/webhook/whatsapp`)
4. **n8n adapta payload** WhatsApp para formato compatível
5. **Workflow processa** (orquestrador → agentes → sintetizador)
6. **n8n detecta origem** via campo `_whatsapp`
7. **HTTP Request envia** resposta de volta para Evolution API
8. **Evolution API envia** mensagem para usuário no WhatsApp

---

## ✅ Pré-requisitos

### Serviços Necessários

- ✅ **Railway.com account** - [Criar conta gratuita](https://railway.app)
- ✅ **n8n já configurado** - Seu workflow atual do Agente Cidadão
- ✅ **Número WhatsApp secundário** - Chip pré-pago ou número extra

### Conhecimentos Recomendados

- Básico de Docker e variáveis de ambiente
- Básico de webhooks e APIs REST
- Básico de n8n (adicionar nós, conectar fluxos)

### Custos Estimados

| Serviço | Custo Mensal | Notas |
|---------|-------------|-------|
| Evolution API (Railway) | $5-10 | Inclui PostgreSQL e Redis |
| Chip pré-pago BR | ~R$15 (único) | Apenas custo inicial |
| Mensagens WhatsApp | $0 | Gratuito (usa WhatsApp Web, não API Business) |

**Total mensal:** ~$5-10 USD

> 💡 **Railway Free Tier** oferece $5/mês grátis - suficiente para protótipos e uso moderado.

---

## 🚀 Parte 1: Deploy Evolution API no Railway

### Passo 1.1: Criar Novo Projeto no Railway

1. Acesse [railway.app](https://railway.app) e faça login
2. Clique em **"New Project"**
3. Selecione **"Empty Project"**
4. Nomeie o projeto: `agente-cidadao-whatsapp`

### Passo 1.2: Adicionar PostgreSQL

> ⚠️ **IMPORTANTE:** Evolution API v2.x+ requer PostgreSQL para persistir sessões.

1. No projeto, clique em **"+ New"** → **"Database"** → **"Add PostgreSQL"**
2. Aguarde o provisionamento (~30 segundos)
3. Clique no serviço PostgreSQL → aba **"Variables"**
4. Copie o valor de **`DATABASE_URL`** (você usará depois)

**Formato esperado:**
```
postgresql://user:password@host:port/database
```

### Passo 1.3: Adicionar Redis

> 💡 Redis é usado para cache e filas de mensagens.

1. Clique em **"+ New"** → **"Database"** → **"Add Redis"**
2. Aguarde o provisionamento (~30 segundos)
3. Clique no serviço Redis → aba **"Variables"**
4. Copie o valor de **`REDIS_URL`** (você usará depois)

**Formato esperado:**
```
redis://default:password@host:port
```

### Passo 1.4: Deploy da Evolution API via Docker

1. Clique em **"+ New"** → **"Empty Service"**
2. Na tela de configuração:
   - **Source:** Docker Image
   - **Image:** `atendai/evolution-api:v2.3.7`
   - **Service Name:** `evolution-api`

3. Clique em **"Add Service"**
4. Aguarde o primeiro deploy (~2 minutos)

> ⚠️ **Nota:** O serviço irá crashar inicialmente porque faltam variáveis de ambiente. Isso é esperado.

### Passo 1.5: Configurar Variáveis de Ambiente

1. Clique no serviço `evolution-api` → aba **"Variables"**
2. Clique em **"New Variable"** e adicione TODAS as variáveis abaixo:

#### Variáveis de Autenticação

```env
AUTHENTICATION_API_KEY=MinhaChaveSecreta2026!
AUTHENTICATION_EXPOSE_IN_FETCH_INSTANCES=true
```

> 🔒 **Segurança:** Use uma chave forte e única. Esta chave será usada em todas as requisições à Evolution API.

#### Variáveis do Servidor

```env
SERVER_TYPE=http
SERVER_PORT=8080
SERVER_URL=https://SEU-DOMINIO.up.railway.app
```

> ⚠️ **Nota:** Você vai gerar o domínio no próximo passo. Por enquanto, deixe um placeholder.

#### Variáveis de Banco de Dados

```env
DATABASE_ENABLED=true
DATABASE_PROVIDER=postgresql
DATABASE_CONNECTION_URI=${{Postgres.DATABASE_URL}}
DATABASE_CONNECTION_CLIENT_NAME=evolution_api
DATABASE_SAVE_DATA_INSTANCE=true
DATABASE_SAVE_DATA_NEW_MESSAGE=true
DATABASE_SAVE_MESSAGE_UPDATE=false
DATABASE_SAVE_DATA_CONTACTS=true
DATABASE_SAVE_DATA_CHATS=true
```

> 💡 **Railway Magic:** `${{Postgres.DATABASE_URL}}` é automaticamente resolvido pelo Railway para o valor correto.

#### Variáveis de Redis

```env
CACHE_REDIS_ENABLED=true
CACHE_REDIS_URI=${{Redis.REDIS_URL}}
CACHE_REDIS_PREFIX_KEY=evolution_v2
CACHE_REDIS_SAVE_INSTANCES=true
```

#### Variáveis de Webhook Global

```env
WEBHOOK_GLOBAL_ENABLED=true
WEBHOOK_GLOBAL_URL=https://SEU-N8N.up.railway.app/webhook/whatsapp
WEBHOOK_GLOBAL_WEBHOOK_BY_EVENTS=true
WEBHOOK_GLOBAL_IGNORE_JWT_WEBHOOK=false
```

> 📝 **Substitua:** `SEU-N8N.up.railway.app` pela URL real do seu n8n.

#### Variáveis de Eventos (Webhook)

```env
WEBHOOK_EVENTS_APPLICATION_STARTUP=false
WEBHOOK_EVENTS_QRCODE_UPDATED=true
WEBHOOK_EVENTS_MESSAGES_SET=false
WEBHOOK_EVENTS_MESSAGES_UPSERT=true
WEBHOOK_EVENTS_MESSAGES_UPDATE=false
WEBHOOK_EVENTS_MESSAGES_DELETE=false
WEBHOOK_EVENTS_SEND_MESSAGE=false
WEBHOOK_EVENTS_CONTACTS_SET=false
WEBHOOK_EVENTS_CONTACTS_UPSERT=false
WEBHOOK_EVENTS_CONTACTS_UPDATE=false
WEBHOOK_EVENTS_PRESENCE_UPDATE=false
WEBHOOK_EVENTS_CHATS_SET=false
WEBHOOK_EVENTS_CHATS_UPSERT=false
WEBHOOK_EVENTS_CHATS_UPDATE=false
WEBHOOK_EVENTS_CHATS_DELETE=false
WEBHOOK_EVENTS_GROUPS_UPSERT=false
WEBHOOK_EVENTS_GROUPS_UPDATE=false
WEBHOOK_EVENTS_GROUP_PARTICIPANTS_UPDATE=false
WEBHOOK_EVENTS_CONNECTION_UPDATE=true
WEBHOOK_EVENTS_CALL=false
WEBHOOK_EVENTS_NEW_JWT_TOKEN=false
```

> 💡 **Explicação:** Habilitamos apenas `MESSAGES_UPSERT` (mensagens recebidas), `QRCODE_UPDATED` e `CONNECTION_UPDATE`.

#### Variáveis de Armazenamento

```env
STORE_MESSAGES=true
STORE_MESSAGE_UP=true
STORE_CONTACTS=true
STORE_CHATS=true
```

#### Variáveis de Configuração de Sessão

```env
CONFIG_SESSION_PHONE_CLIENT=Agente Cidadao
CONFIG_SESSION_PHONE_NAME=Chrome
```

#### Variáveis de Logs

```env
LOG_LEVEL=ERROR
LOG_COLOR=true
LOG_BAILEYS=error
```

> 💡 **Produção:** Use `LOG_LEVEL=ERROR`. Para debug, use `LOG_LEVEL=DEBUG`.

### Passo 1.6: Gerar Domínio Público

1. Ainda no serviço `evolution-api`, vá em **"Settings"** → **"Networking"**
2. Na seção **"Public Networking"**, clique em **"Generate Domain"**
3. Railway irá gerar algo como: `evolution-api-production-abc123.up.railway.app`
4. **Copie esta URL** - você precisará dela

### Passo 1.7: Atualizar SERVER_URL

1. Volte em **"Variables"**
2. Edite a variável `SERVER_URL`
3. Cole a URL gerada: `https://evolution-api-production-abc123.up.railway.app`
4. Clique em **"Update Variable"**

### Passo 1.8: Redeploy

1. Vá em **"Deployments"**
2. Clique nos três pontos do último deploy → **"Redeploy"**
3. Aguarde o novo deploy (~2 minutos)
4. Verifique se o status é **"Success"** e o serviço está **"Active"**

### Passo 1.9: Verificar Instalação

Teste se a Evolution API está rodando:

```bash
curl https://SUA-URL.up.railway.app/
```

**Resposta esperada:**
```json
{
  "status": 200,
  "message": "Welcome to the Evolution API",
  "version": "2.3.7"
}
```

✅ **Evolution API está rodando!**

---

## 📲 Parte 2: Conectar Número WhatsApp

### Passo 2.1: Obter um Número WhatsApp

Você precisa de um número WhatsApp **diferente** do seu número pessoal.

#### Opção A: Chip Pré-pago Brasileiro 🇧🇷

1. Compre um chip pré-pago de qualquer operadora (~R$10-20)
2. Ative o chip e faça uma recarga mínima
3. Instale WhatsApp neste número
4. Confirme com SMS

**Vantagens:**
- Número brasileiro (adequado para cidadãos brasileiros)
- Baixo custo
- Fácil de conseguir

**Desvantagens:**
- Precisa de chip físico
- Precisa manter créditos

#### Opção B: Número Virtual

Serviços como **Twilio**, **MessageBird** oferecem números virtuais.

**Vantagens:**
- Não precisa de chip físico
- Gerenciamento online

**Desvantagens:**
- Custo mensal (~$5-10/mês)
- Alguns serviços não funcionam com WhatsApp

> 💡 **Recomendação:** Para começar, use um chip pré-pago.

### Passo 2.2: Criar Instância na Evolution API

Uma "instância" representa uma conexão WhatsApp.

Execute este comando (substitua `SUA-URL` e `SuaChaveSecreta`):

```bash
curl -X POST "https://SUA-URL.up.railway.app/instance/create" \
  -H "Content-Type: application/json" \
  -H "apikey: MinhaChaveSecreta2026!" \
  -d '{
    "instanceName": "agente-cidadao",
    "qrcode": true,
    "integration": "WHATSAPP-BAILEYS",
    "webhookUrl": "https://SEU-N8N.up.railway.app/webhook/whatsapp",
    "webhookByEvents": true,
    "webhookBase64": false,
    "rejectCall": false,
    "msgCall": "",
    "groupsIgnore": true,
    "alwaysOnline": true,
    "readMessages": true,
    "readStatus": true,
    "syncFullHistory": false
  }'
```

**Resposta esperada:**
```json
{
  "instance": {
    "instanceName": "agente-cidadao",
    "status": "created"
  },
  "hash": {
    "apikey": "eyJhbGc..."
  },
  "qrcode": {
    "pairingCode": null,
    "code": "2@ABC123...",
    "base64": "data:image/png;base64,iVBORw0KGg..."
  }
}
```

> 📝 **Importante:** Salve a resposta completa! Você precisará do QR code.

### Passo 2.3: Conectar via QR Code

#### Método 1: Via Base64 (Recomendado)

1. Copie o valor do campo `qrcode.base64` da resposta
2. Abra [base64.guru/converter/decode/image](https://base64.guru/converter/decode/image)
3. Cole o código base64
4. Clique em "Decode"
5. Será exibido o QR Code

#### Método 2: Via API (Alternativo)

```bash
curl "https://SUA-URL.up.railway.app/instance/connect/agente-cidadao" \
  -H "apikey: MinhaChaveSecreta2026!"
```

Resposta incluirá o QR code em base64.

### Passo 2.4: Escanear QR Code no WhatsApp

1. Abra WhatsApp no celular **com o número secundário** (chip pré-pago)
2. Vá em **Configurações** (⚙️)
3. Toque em **Dispositivos Conectados**
4. Toque em **Conectar um dispositivo**
5. Escaneie o QR Code exibido

> ⏱️ **Importante:** Você tem ~60 segundos para escanear. Se expirar, gere um novo QR code.

### Passo 2.5: Verificar Conexão

```bash
curl "https://SUA-URL.up.railway.app/instance/connectionState/agente-cidadao" \
  -H "apikey: MinhaChaveSecreta2026!"
```

**Resposta quando conectado:**
```json
{
  "instance": {
    "instanceName": "agente-cidadao",
    "status": "open"
  },
  "state": "open"
}
```

✅ **WhatsApp conectado com sucesso!**

### Passo 2.6: Testar Envio de Mensagem

Teste se consegue enviar mensagens:

```bash
curl -X POST "https://SUA-URL.up.railway.app/message/sendText/agente-cidadao" \
  -H "Content-Type: application/json" \
  -H "apikey: MinhaChaveSecreta2026!" \
  -d '{
    "number": "5511999999999",
    "text": "Teste: Evolution API conectada! 🎉"
  }'
```

> 📝 **Substitua:** `5511999999999` pelo seu número pessoal (com DDI + DDD).

Você deve receber a mensagem no WhatsApp.

---

## 🔧 Parte 3: Modificar Workflow n8n

Agora vamos modificar o workflow do Agente Cidadão para processar mensagens do WhatsApp.

### Passo 3.1: Abrir Workflow no n8n

1. Acesse seu n8n: `https://SEU-N8N.up.railway.app`
2. Abra o workflow **"Agente Cidadao - Multi-Agentes"**
3. Ative o modo de edição

### Passo 3.2: Adicionar Webhook para WhatsApp

1. Adicione um novo nó **Webhook**
2. Configure:

| Campo | Valor |
|-------|-------|
| **Webhook Name** | `Webhook WhatsApp` |
| **HTTP Method** | POST |
| **Path** | `whatsapp` |
| **Authentication** | None |
| **Response Mode** | Respond to Webhook |
| **Response Code** | 200 |
| **Response Data** | First Entry JSON |

3. Clique em **"Execute Node"** para obter a URL
4. **Copie a URL** gerada: `https://SEU-N8N.up.railway.app/webhook/whatsapp`

### Passo 3.3: Adicionar Nó "Adaptar Payload WhatsApp"

1. Adicione um nó **Code** após o Webhook WhatsApp
2. Nomeie: `Adaptar Payload WhatsApp`
3. Cole o código abaixo:

```javascript
// ============================================================
// ADAPTADOR DE PAYLOAD WHATSAPP → FORMATO AGENTE CIDADÃO
// ============================================================

const items = $input.all();
const outputs = [];

for (const item of items) {
  try {
    const body = item.json.body || item.json;

    // ========== VALIDAÇÕES ==========

    // Ignorar se não houver dados
    if (!body.data) {
      console.log('[WhatsApp] Webhook sem dados, ignorando');
      continue;
    }

    // Ignorar se não houver mensagem
    if (!body.data.message) {
      console.log('[WhatsApp] Webhook sem mensagem, ignorando');
      continue;
    }

    // Ignorar mensagens enviadas por nós mesmos
    if (body.data.key && body.data.key.fromMe === true) {
      console.log('[WhatsApp] Mensagem enviada por nós, ignorando');
      continue;
    }

    // Ignorar mensagens de grupos (opcional)
    const remoteJid = body.data.key?.remoteJid || '';
    if (remoteJid.includes('@g.us')) {
      console.log('[WhatsApp] Mensagem de grupo, ignorando');
      continue;
    }

    // ========== EXTRAÇÃO DE DADOS ==========

    const message = body.data.message;

    // Extrair texto da mensagem (suporta vários formatos)
    let messageText =
      message.conversation ||
      message.extendedTextMessage?.text ||
      message.imageMessage?.caption ||
      message.videoMessage?.caption ||
      message.documentMessage?.caption ||
      '';

    // Se não houver texto, ignorar
    if (!messageText || messageText.trim() === '') {
      console.log('[WhatsApp] Mensagem sem texto, ignorando');
      continue;
    }

    // Limpar texto
    messageText = messageText.trim();

    // Extrair número do remetente
    const phoneNumber = remoteJid.replace('@s.whatsapp.net', '');

    // Extrair nome do contato (se disponível)
    const pushName = body.data.pushName || 'Usuário';

    // Gerar ID único para a requisição
    const timestamp = Date.now();
    const randomId = Math.random().toString(36).substring(2, 11);
    const requestId = `wa-${timestamp}-${randomId}`;

    // Gerar session_id (para memória conversacional)
    const sessionId = `whatsapp-${phoneNumber}`;

    // ========== MONTAR PAYLOAD ADAPTADO ==========

    outputs.push({
      json: {
        // Formato compatível com workflow existente
        body: {
          record: {
            id: requestId,
            content: messageText,
            context: {
              source: 'whatsapp',
              phoneNumber: phoneNumber,
              contactName: pushName
            }
          }
        },

        // Dados para roteamento de resposta
        _whatsapp: {
          enabled: true,
          phoneNumber: phoneNumber,
          remoteJid: remoteJid,
          instanceName: body.instance || 'agente-cidadao',
          contactName: pushName,
          messageId: body.data.key?.id || ''
        },

        // Session ID para memória conversacional
        session_id: sessionId,

        // Metadados originais (para debug)
        _metadata: {
          timestamp: new Date(timestamp).toISOString(),
          source: 'whatsapp',
          evolutionApiVersion: body.apiVersion || 'unknown'
        }
      }
    });

    console.log(`[WhatsApp] Mensagem processada: ${phoneNumber} → "${messageText.substring(0, 50)}..."`);

  } catch (error) {
    console.error('[WhatsApp] Erro ao processar mensagem:', error.message);
    // Continuar para próximo item
  }
}

// Se não houver mensagens válidas, retornar payload vazio
if (outputs.length === 0) {
  return [{ json: { _skip: true } }];
}

return outputs;
```

### Passo 3.4: Conectar ao Fluxo Existente

1. Conecte a saída de **"Adaptar Payload WhatsApp"** ao nó **"Orquestrador Log"** (ou o primeiro nó após o webhook /chat)
2. Agora você tem dois pontos de entrada:
   - **Webhook Chat** (web)
   - **Webhook WhatsApp** → **Adaptar Payload** (WhatsApp)

### Passo 3.5: Adicionar Nó "Detectar Origem"

Após o **Sintetizador**, adicione um nó **IF** para detectar se a mensagem veio do WhatsApp:

1. Adicione nó **IF**
2. Nomeie: `Detectar Origem`
3. Configure:

| Campo | Valor |
|-------|-------|
| **Conditions** | |
| **Value 1** | `{{ $('Adaptar Payload WhatsApp').first() }}` |
| **Operation** | is not empty |

**OU use expressão JavaScript:**

```javascript
{{ $('Adaptar Payload WhatsApp').first().json._whatsapp?.enabled === true }}
```

### Passo 3.6: Adicionar Nó "Enviar Resposta WhatsApp"

Na saída **TRUE** do nó "Detectar Origem", adicione um nó **HTTP Request**:

1. Adicione nó **HTTP Request**
2. Nomeie: `Enviar Resposta WhatsApp`
3. Configure:

| Campo | Valor |
|-------|-------|
| **Method** | POST |
| **URL** | `https://SUA-EVOLUTION-API.up.railway.app/message/sendText/{{ $('Adaptar Payload WhatsApp').first().json._whatsapp.instanceName }}` |
| **Authentication** | Generic Credential Type |
| **Generic Auth Type** | Header Auth |
| **Credential for Header Auth** | (criar nova) |

**Criar Credential:**
- Name: `Evolution API Key`
- Name: `apikey`
- Value: `MinhaChaveSecreta2026!`

**Body (JSON):**

```json
{
  "number": "{{ $('Adaptar Payload WhatsApp').first().json._whatsapp.phoneNumber }}",
  "text": "{{ $('Sintetizador').first().json.output.substring(0, 4000) }}"
}
```

> ⚠️ **Limite de caracteres:** WhatsApp limita mensagens a ~4096 caracteres. Usamos `.substring(0, 4000)` para segurança.

### Passo 3.7: Conectar Rota Web (FALSE)

Na saída **FALSE** do nó "Detectar Origem", conecte ao fluxo normal:

1. Conecte a **Supabase Update** (se houver)
2. Depois conecte ao **Respond to Webhook**

### Passo 3.8: Adicionar Nó "Dividir Mensagens Longas" (Opcional)

Se suas respostas são muito longas, adicione lógica para dividir:

```javascript
// Nó Code antes de "Enviar Resposta WhatsApp"
const maxLength = 4000;
const text = $('Sintetizador').first().json.output;
const chunks = [];

if (text.length <= maxLength) {
  chunks.push(text);
} else {
  // Dividir em parágrafos
  const paragraphs = text.split('\n\n');
  let currentChunk = '';

  for (const para of paragraphs) {
    if ((currentChunk + para).length > maxLength) {
      chunks.push(currentChunk.trim());
      currentChunk = para + '\n\n';
    } else {
      currentChunk += para + '\n\n';
    }
  }

  if (currentChunk.trim()) {
    chunks.push(currentChunk.trim());
  }
}

return chunks.map((chunk, index) => ({
  json: {
    text: `📱 Parte ${index + 1}/${chunks.length}\n\n${chunk}`,
    phoneNumber: $('Adaptar Payload WhatsApp').first().json._whatsapp.phoneNumber,
    instanceName: $('Adaptar Payload WhatsApp').first().json._whatsapp.instanceName
  }
}));
```

### Passo 3.9: Salvar e Ativar Workflow

1. Clique em **"Save"** (💾)
2. Ative o workflow (toggle no canto superior direito)
3. Certifique-se de que está **"Active"**

---

## ✅ Parte 4: Testar a Integração

### Teste 1: Verificar Instância Conectada

```bash
curl "https://SUA-EVOLUTION-API.up.railway.app/instance/connectionState/agente-cidadao" \
  -H "apikey: MinhaChaveSecreta2026!"
```

**Esperado:** `"state": "open"`

### Teste 2: Verificar Webhook Configurado

```bash
curl "https://SUA-EVOLUTION-API.up.railway.app/instance/fetchInstances?instanceName=agente-cidadao" \
  -H "apikey: MinhaChaveSecreta2026!"
```

Verifique se `webhook.url` aponta para seu n8n.

### Teste 3: Enviar Mensagem de Teste

Do seu celular pessoal, envie para o número conectado:

```
Olá! Quem é o presidente da Câmara dos Deputados?
```

**O que deve acontecer:**

1. ✅ Evolution API recebe mensagem
2. ✅ Evolution API envia webhook para n8n
3. ✅ n8n processa via workflow
4. ✅ Agentes consultam API Câmara
5. ✅ Sintetizador formata resposta
6. ✅ n8n envia para Evolution API
7. ✅ Você recebe resposta no WhatsApp

**Tempo esperado:** 5-20 segundos (dependendo da consulta)

### Teste 4: Verificar Logs no n8n

1. Vá em **"Executions"** no n8n
2. Veja a execução mais recente
3. Verifique cada nó:
   - ✅ Webhook WhatsApp recebeu payload
   - ✅ Adaptar Payload converteu corretamente
   - ✅ Orquestrador roteou para agentes
   - ✅ Sintetizador gerou resposta
   - ✅ Detectar Origem retornou TRUE
   - ✅ Enviar Resposta WhatsApp executou com sucesso

### Teste 5: Verificar Logs na Evolution API

No Railway, vá no serviço Evolution API → **"Logs"**

Procure por:
```
[WhatsApp] Message received from 5511999999999
[Webhook] Sending to https://seu-n8n.up.railway.app/webhook/whatsapp
[WhatsApp] Message sent successfully
```

### Teste 6: Verificar que Frontend Web Continua Funcionando

1. Acesse o frontend: `https://agentecidadaofrontendagentico-production.up.railway.app`
2. Faça uma pergunta normalmente
3. Verifique que recebe resposta

✅ **Ambos os canais devem funcionar em paralelo!**

### Teste 7: Testar Memória Conversacional (se ativada)

Envie sequência de mensagens:

```
1. "Quem é o deputado Nikolas Ferreira?"
   (aguarde resposta)

2. "Quanto ele gastou em 2024?"
   (deve usar contexto: "ele" = Nikolas Ferreira)

3. "De qual partido?"
   (deve continuar usando contexto)
```

---

## 🎯 Boas Práticas e Otimizações

### 1. Mensagens de Saudação

Adicione uma mensagem de boas-vindas automática:

No n8n, adicione um nó **Code** após "Adaptar Payload":

```javascript
const phoneNumber = $input.first().json._whatsapp.phoneNumber;
const text = $input.first().json.body.record.content.toLowerCase();

// Detectar saudações
const greetings = ['oi', 'olá', 'ola', 'bom dia', 'boa tarde', 'boa noite', 'alo', 'alô'];
const isGreeting = greetings.some(g => text.trim() === g || text.startsWith(g + ' '));

if (isGreeting) {
  // Enviar mensagem de boas-vindas diretamente
  return [{
    json: {
      _skip_workflow: true,
      _whatsapp: $input.first().json._whatsapp,
      response: `👋 Olá! Sou o *Agente Cidadão*, assistente de dados legislativos da Câmara dos Deputados.

📊 Posso te ajudar com informações sobre:

• Proposições (PLs, PECs, MPVs)
• Deputados e partidos
• Votações e tramitações
• Despesas parlamentares (CEAP)

❓ *Como posso te ajudar hoje?*

_Exemplos de perguntas:_
• Quais PLs sobre IA estão em tramitação?
• Quanto o deputado X gastou em 2024?
• Como foi a votação da reforma tributária?`
    }
  }];
}

// Continuar fluxo normal
return [$input.first()];
```

### 2. Indicador de Digitação

Mostre que está "digitando" enquanto processa:

```javascript
// Nó HTTP Request antes de processar
// POST https://SUA-EVOLUTION-API/chat/sendPresence/agente-cidadao
{
  "number": "{{ $('Adaptar Payload WhatsApp').first().json._whatsapp.phoneNumber }}",
  "presence": "composing",
  "delay": 5000
}
```

### 3. Rate Limiting

Evite spam implementando rate limiting:

```javascript
// Nó Code após "Adaptar Payload"
const phoneNumber = $input.first().json._whatsapp.phoneNumber;

// Verificar últimas mensagens no banco (pseudo-código)
// const recentMessages = await checkRecentMessages(phoneNumber, 60); // últimos 60s

// if (recentMessages > 5) {
//   return [{
//     json: {
//       _rate_limited: true,
//       _whatsapp: $input.first().json._whatsapp,
//       response: "⚠️ Por favor, aguarde alguns segundos entre as mensagens."
//     }
//   }];
// }

return [$input.first()];
```

### 4. Mensagens com Formatação

Use formatação WhatsApp nas respostas:

```markdown
*Negrito*
_Itálico_
~Tachado~
```monospace```

Exemplo no Sintetizador:
```
*Deputado:* Nikolas Ferreira
*Partido:* PL/MG
*Gastos 2024:* R$ 123.456,78
```

### 5. Logs Estruturados

Adicione logging detalhado:

```javascript
// Em cada nó crítico
console.log(JSON.stringify({
  timestamp: new Date().toISOString(),
  node: 'Adaptar Payload WhatsApp',
  phoneNumber: phoneNumber,
  messageLength: messageText.length,
  requestId: requestId
}));
```

### 6. Tratamento de Erros

Adicione nó **Error Trigger** ao workflow:

1. Adicione nó **Error Trigger**
2. Conecte a um nó **HTTP Request** que envia mensagem de erro:

```json
{
  "number": "{{ $json._whatsapp.phoneNumber }}",
  "text": "⚠️ Desculpe, ocorreu um erro ao processar sua mensagem. Por favor, tente novamente em alguns instantes.\n\nSe o problema persistir, entre em contato com o suporte."
}
```

### 7. Blacklist de Números

Bloqueie números indesejados:

```javascript
// Nó Code após "Adaptar Payload"
const blacklist = [
  '551199999999',
  '552188888888'
];

const phoneNumber = $input.first().json._whatsapp.phoneNumber;

if (blacklist.includes(phoneNumber)) {
  console.log(`[Blacklist] Número bloqueado: ${phoneNumber}`);
  return [{ json: { _skip: true } }];
}

return [$input.first()];
```

### 8. Horário de Funcionamento

Defina horário de atendimento:

```javascript
// Nó Code após "Adaptar Payload"
const now = new Date();
const hour = now.getHours();
const day = now.getDay(); // 0=domingo, 6=sábado

// Seg-Sex, 8h-18h
if (day === 0 || day === 6 || hour < 8 || hour >= 18) {
  return [{
    json: {
      _out_of_hours: true,
      _whatsapp: $input.first().json._whatsapp,
      response: `🕐 *Fora do horário de atendimento*

Nosso horário de funcionamento:
Segunda a Sexta: 8h às 18h

Você pode enviar sua mensagem agora e responderemos assim que possível.

Para emergências, acesse: https://agentecidadao.com`
    }
  }];
}

return [$input.first()];
```

---

## 🔧 Troubleshooting Avançado

### Problema: QR Code Expira Muito Rápido

**Causa:** QR codes expiram em ~60 segundos.

**Solução:**
```bash
# Gere novo QR code
curl -X POST "https://SUA-EVOLUTION-API.up.railway.app/instance/restart/agente-cidadao" \
  -H "apikey: MinhaChaveSecreta2026!"

# Obtenha novo QR
curl "https://SUA-EVOLUTION-API.up.railway.app/instance/connect/agente-cidadao" \
  -H "apikey: MinhaChaveSecreta2026!"
```

### Problema: Sessão Desconecta Após Reinício

**Causa:** PostgreSQL não está persistindo sessão.

**Diagnóstico:**
```bash
# Verifique se sessão está no banco
curl "https://SUA-EVOLUTION-API.up.railway.app/instance/fetchInstances" \
  -H "apikey: MinhaChaveSecreta2026!"
```

**Solução:**
1. Verifique variável `DATABASE_SAVE_DATA_INSTANCE=true`
2. Verifique `DATABASE_CONNECTION_URI` está correto
3. Redeploy Evolution API

### Problema: Mensagens Não Chegam no n8n

**Diagnóstico:**
```bash
# 1. Verifique webhook configurado
curl "https://SUA-EVOLUTION-API.up.railway.app/webhook/find/agente-cidadao" \
  -H "apikey: MinhaChaveSecreta2026!"

# 2. Verifique eventos habilitados
# Deve ter MESSAGES_UPSERT=true
```

**Solução:**
1. Verifique `WEBHOOK_GLOBAL_URL` está correto
2. Certifique-se que n8n está acessível publicamente
3. Verifique logs da Evolution API para erros de webhook

### Problema: Webhook n8n Retorna 404

**Causa:** Path do webhook está incorreto.

**Solução:**
1. No n8n, vá no nó Webhook WhatsApp
2. Clique em "Execute Node"
3. Copie a URL **exata** gerada
4. Atualize `WEBHOOK_GLOBAL_URL` na Evolution API

### Problema: Resposta Não Chega no WhatsApp

**Diagnóstico:**

Verifique execução no n8n:
1. Vá em "Executions"
2. Veja última execução
3. Verifique nó "Enviar Resposta WhatsApp"
4. Veja se há erro HTTP

**Causas comuns:**
- **401 Unauthorized:** API Key incorreta
- **404 Not Found:** Instância não existe
- **500 Internal Server Error:** Evolution API com problema

**Solução:**
```bash
# Teste manual
curl -X POST "https://SUA-EVOLUTION-API.up.railway.app/message/sendText/agente-cidadao" \
  -H "Content-Type: application/json" \
  -H "apikey: MinhaChaveSecreta2026!" \
  -d '{
    "number": "SEU_NUMERO",
    "text": "Teste manual"
  }'
```

### Problema: Mensagens Duplicadas

**Causa:** Webhook sendo chamado múltiplas vezes.

**Solução:**

Adicione deduplicação no n8n:

```javascript
// Nó Code após "Adaptar Payload"
const messageId = $input.first().json._whatsapp.messageId;

// Verificar cache (pseudo-código)
// if (messageId in cache) {
//   return [{ json: { _skip: true } }];
// }

// Adicionar ao cache
// cache.set(messageId, true, 300); // 5 minutos

return [$input.first()];
```

### Problema: Evolution API Crashando

**Diagnóstico:**

Veja logs no Railway:
```
Error: connect ECONNREFUSED (PostgreSQL)
Error: Redis connection failed
Error: Port 8080 already in use
```

**Soluções:**

1. **PostgreSQL:** Verifique `DATABASE_CONNECTION_URI`
2. **Redis:** Verifique `CACHE_REDIS_URI`
3. **Port:** Use `SERVER_PORT=8080` (padrão Railway)

### Problema: "Baileys Session Expired"

**Causa:** Atualização do Baileys (biblioteca WhatsApp) requer nova conexão.

**Solução:**
```bash
# 1. Deletar instância antiga
curl -X DELETE "https://SUA-EVOLUTION-API.up.railway.app/instance/delete/agente-cidadao" \
  -H "apikey: MinhaChaveSecreta2026!"

# 2. Criar nova instância
curl -X POST "https://SUA-EVOLUTION-API.up.railway.app/instance/create" \
  -H "Content-Type: application/json" \
  -H "apikey: MinhaChaveSecreta2026!" \
  -d '{
    "instanceName": "agente-cidadao",
    "qrcode": true,
    "integration": "WHATSAPP-BAILEYS"
  }'

# 3. Conectar via QR code novamente
```

### Problema: Mensagens com Imagens/Áudio

**Causa:** Código atual só processa texto.

**Solução:**

Modifique "Adaptar Payload" para suportar mídia:

```javascript
// Detectar tipo de mídia
let messageText = '';
let mediaType = 'text';

if (message.conversation) {
  messageText = message.conversation;
  mediaType = 'text';
} else if (message.imageMessage) {
  messageText = message.imageMessage.caption || '';
  mediaType = 'image';
} else if (message.audioMessage) {
  messageText = '[Áudio recebido]';
  mediaType = 'audio';
  // Adicione lógica para transcrição se necessário
} else if (message.videoMessage) {
  messageText = message.videoMessage.caption || '[Vídeo recebido]';
  mediaType = 'video';
}

// Responder apropriadamente
if (mediaType !== 'text') {
  return [{
    json: {
      _unsupported_media: true,
      response: `⚠️ Desculpe, no momento só consigo processar mensagens de texto. Por favor, digite sua pergunta.`
    }
  }];
}
```

---

## 📊 Monitoramento e Manutenção

### Dashboard de Monitoramento

Configure alertas no Railway:

1. **Evolution API Down**
   - Railway envia email automático se serviço crashar

2. **Alto uso de CPU/RAM**
   - Monitore na aba "Metrics" do Railway

### Logs Essenciais

Verifique regularmente:

**Evolution API:**
```bash
# Via Railway Dashboard
# Serviço evolution-api → Logs

# Procure por:
# - Connection errors
# - Webhook failures
# - Message delivery errors
```

**n8n:**
```bash
# Via n8n Dashboard
# Menu → Executions → Filter by "Error"

# Monitore:
# - Execuções com erro
# - Timeout (> 6 min)
# - Erros de API
```

### Backup da Instância

Faça backup da configuração:

```bash
# 1. Exportar configuração
curl "https://SUA-EVOLUTION-API.up.railway.app/instance/fetchInstances?instanceName=agente-cidadao" \
  -H "apikey: MinhaChaveSecreta2026!" > backup-instance.json

# 2. Salvar em local seguro
```

### Rotina de Manutenção

**Semanal:**
- ✅ Verificar status da instância
- ✅ Revisar logs de erros
- ✅ Verificar uso de recursos no Railway

**Mensal:**
- ✅ Atualizar Evolution API (se houver nova versão)
- ✅ Limpar logs antigos
- ✅ Revisar custos no Railway

**Trimestral:**
- ✅ Revisar e otimizar workflow n8n
- ✅ Analisar métricas de uso
- ✅ Atualizar documentação

### Atualizar Evolution API

```bash
# 1. No Railway, vá no serviço evolution-api
# 2. Settings → Image
# 3. Altere para: atendai/evolution-api:v2.x.x (versão mais recente)
# 4. Clique em "Deploy"

# Verifique changelog em:
# https://github.com/EvolutionAPI/evolution-api/releases
```

---

## 💰 Otimização de Custos

### Railway Free Tier

- **$5/mês grátis** (todos os meses)
- ~550 horas de execução/mês
- Suficiente para protótipos e uso moderado

### Reduzir Custos

1. **Use Sleep Schedule (Hobby projects)**
   - Configure Evolution API para dormir em horários sem uso
   - Settings → Sleep Schedule

2. **Otimize Recursos**
   ```env
   # Reduza logs em produção
   LOG_LEVEL=ERROR
   LOG_BAILEYS=error

   # Desabilite recursos não usados
   STORE_MESSAGE_UP=false
   WEBHOOK_EVENTS_CONTACTS_SET=false
   ```

3. **Monitore Uso**
   - Railway Dashboard → Usage
   - Fique de olho em picos de uso

---

## 📚 Recursos Adicionais

### Documentação Oficial

- [Evolution API Docs](https://doc.evolution-api.com/)
- [Evolution API GitHub](https://github.com/EvolutionAPI/evolution-api)
- [Baileys (WhatsApp Library)](https://github.com/WhiskeySockets/Baileys)
- [Railway Docs](https://docs.railway.app/)

### Comunidade

- [Evolution API Discord](https://evolution-api.com/discord)
- [n8n Community](https://community.n8n.io/)

### Próximos Passos

Após configurar a integração básica, considere:

1. **Adicionar comandos especiais**
   - `/status` - Verificar status do sistema
   - `/ajuda` - Mostrar menu de ajuda

2. **Implementar analytics**
   - Quantas mensagens por dia
   - Perguntas mais comuns
   - Taxa de resposta

3. **Multi-atendimento**
   - Conectar múltiplos números
   - Distribuir carga

4. **Integração com CRM**
   - Salvar conversas
   - Criar tickets
   - Follow-up automático

---

## ✅ Checklist Final

- [ ] Railway project criado
- [ ] PostgreSQL provisionado
- [ ] Redis provisionado
- [ ] Evolution API deployed (v2.3.7)
- [ ] Variáveis de ambiente configuradas
- [ ] Domínio público gerado
- [ ] Número WhatsApp obtido
- [ ] Instância "agente-cidadao" criada
- [ ] QR Code escaneado e conectado
- [ ] Webhook `/whatsapp` criado no n8n
- [ ] Nó "Adaptar Payload" adicionado
- [ ] Nó "Detectar Origem" adicionado
- [ ] Nó "Enviar Resposta WhatsApp" adicionado
- [ ] Workflow salvo e ativado
- [ ] Teste de mensagem realizado
- [ ] Resposta recebida no WhatsApp
- [ ] Frontend web ainda funcionando
- [ ] Logs revisados (Evolution API + n8n)
- [ ] Documentação salva
- [ ] Backup da configuração realizado

---

**Parabéns! 🎉 Seu Agente Cidadão agora está integrado com WhatsApp!**

Para suporte, consulte:
- [FAQ & Troubleshooting](FAQ_TROUBLESHOOTING.md)
- [Documentação Completa](../../DOCUMENTATION_SUMMARY.md)

---

**Última atualização:** 10/01/2026
**Autor:** Equipe Agente Cidadão
**Versão:** 2.0
