/**
 * API Mockada - Simulação de Backend
 * Simula chamadas ao Supabase e n8n com delays realistas
 */

const API_CONFIG = {
  SUPABASE_URL: 'https://seu-projeto.supabase.co',
  SUPABASE_ANON_KEY: 'sua-chave-anon',
  N8N_WEBHOOK: 'https://seu-n8n.app/webhook/chat',
  USE_MOCK: true // Trocar para false quando integrar backend real
};

// Delays simulados (em milissegundos)
const DELAYS = {
  ORCHESTRATOR_START: 500,
  ORCHESTRATOR_ANALYSIS: 1000,
  SPECIALISTS_START: 800,
  SPECIALIST_WORK: 2000,
  SYNTHESIZER_START: 500,
  SYNTHESIZER_WORK: 1500,
  FINAL_RESPONSE: 500
};

// Respostas mockadas por tipo de pergunta
const MOCK_RESPONSES = {
  deputados: {
    keywords: ['deputado', 'deputados', 'parlamentar', 'sp', 'são paulo', 'mg', 'rj'],
    response: `**Deputados Encontrados:**

São Paulo possui 70 deputados federais na atual legislatura. Aqui estão alguns exemplos:

1. **Tabata Amaral** (PSB-SP)
   - Mandatos: 2019-2023, 2023-2027
   - Comissões: Educação, Ciência e Tecnologia

2. **Kim Kataguiri** (UNIÃO-SP)
   - Mandatos: 2019-2023, 2023-2027
   - Comissões: Finanças e Tributação

3. **Guilherme Boulos** (PSOL-SP)
   - Mandato: 2023-2027
   - Comissões: Direitos Humanos

**Fonte**: API Câmara dos Deputados (dados atualizados em ${new Date().toLocaleDateString('pt-BR')})`
  },

  despesas: {
    keywords: ['despesa', 'gasto', 'cota', 'parlamentar', 'combustível', 'passagem'],
    response: `**Relatório de Despesas:**

**Deputado**: Eduardo Bolsonaro (PL-SP)
**Período**: ${new Date().getFullYear()} (até ${new Date().toLocaleDateString('pt-BR', { month: 'long' })})

**Total Gasto**: R$ 127.450,00

**Principais Categorias**:
- ✈️ Passagens aéreas: R$ 45.200,00
- 📱 Telefonia: R$ 12.300,00
- ⛽ Combustível: R$ 8.950,00
- 🏢 Locação de veículos: R$ 15.000,00
- 🍽️ Alimentação: R$ 18.500,00
- 📄 Serviços postais: R$ 3.200,00
- 🖨️ Material de escritório: R$ 5.800,00
- 💼 Consultorias: R$ 18.500,00

**Observações**: Todos os gastos estão dentro da cota parlamentar permitida.

**Fonte**: Portal da Transparência e API Câmara dos Deputados`
  },

  proposicoes: {
    keywords: ['projeto', 'lei', 'pl', 'pec', 'proposição', 'educação', 'saúde', 'tramitação'],
    response: `**Projetos de Lei sobre Educação - 2024:**

Foram encontrados **23 projetos** relacionados à educação em tramitação:

**1. PL 1234/2024** - Educação Digital nas Escolas
   - Autor: Dep. Tabata Amaral (PSB-SP)
   - Status: Em análise na Comissão de Educação
   - Ementa: Institui o ensino de programação no ensino fundamental

**2. PL 2345/2024** - Valorização de Professores
   - Autor: Dep. Maria do Rosário (PT-RS)
   - Status: Aprovado na Comissão de Finanças
   - Ementa: Estabelece piso salarial para professores da educação básica

**3. PEC 45/2024** - Financiamento da Educação
   - Autor: Senado Federal
   - Status: Aguardando votação em Plenário
   - Ementa: Altera destinação de recursos para educação pública

**Próximos Passos**:
- PL 1234/2024 será votado na próxima semana
- PL 2345/2024 aguarda sanção presidencial

**Fonte**: API Câmara dos Deputados - Proposições`
  },

  votacao: {
    keywords: ['votação', 'voto', 'histórico', 'posicionamento'],
    response: `**Histórico de Votação:**

**Deputada**: Tabata Amaral (PSB-SP)
**Período**: 2023-2024

**Resumo**:
- Total de votações: 245
- Presença: 92%
- Favorável ao governo: 45%
- Contra o governo: 35%
- Abstenções: 8%

**Votações Recentes**:

📊 **PEC 45/2023** (Reforma Tributária)
   - Voto: ✅ Favorável
   - Data: 07/11/2023

📊 **PL 2.338/2023** (Marco das Criptomoedas)
   - Voto: ✅ Favorável
   - Data: 29/11/2023

📊 **PL 2.903/2023** (Autonomia do Banco Central)
   - Voto: ❌ Contra
   - Data: 15/12/2023

**Temas Prioritários**:
1. Educação (23 projetos votados)
2. Ciência e Tecnologia (18 projetos)
3. Direitos Sociais (15 projetos)

**Fonte**: API Câmara dos Deputados - Votações`
  },

  default: {
    keywords: [],
    response: `**Resposta do Agente Cidadão:**

Sua pergunta foi processada por nossa equipe de agentes especializados.

**Análise Realizada**:
- 🤖 Orquestrador coordenou a consulta
- 📜 Agente Legislativo consultou base de proposições
- 👔 Agente Político analisou perfis de deputados
- 💰 Agente Fiscal verificou gastos públicos
- 📝 Sintetizador consolidou as informações

**Resultado**: Encontramos informações relevantes nas bases de dados públicas.

Para perguntas mais específicas, tente:
- "Quais são os deputados de [estado]?"
- "Mostre as despesas do deputado [nome]"
- "Projetos de lei sobre [tema]"
- "Histórico de votação de [nome]"

**Fontes**:
- API Câmara dos Deputados
- Portal da Transparência
- Dados Abertos do Senado

Posso ajudar com mais alguma informação?`
  }
};

/**
 * Utilitário: delay assíncrono
 */
function delay(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

/**
 * Detecta o tipo de pergunta baseado em palavras-chave
 */
function detectQuestionType(question) {
  const q = question.toLowerCase();

  for (const [type, config] of Object.entries(MOCK_RESPONSES)) {
    if (type === 'default') continue;
    if (config.keywords.some(keyword => q.includes(keyword))) {
      return type;
    }
  }

  return 'default';
}

/**
 * Obtém resposta mockada baseada na pergunta
 */
function getMockResponse(question) {
  const type = detectQuestionType(question);
  return MOCK_RESPONSES[type].response;
}

/**
 * Simula o fluxo completo de processamento pelos agentes
 * Retorna um AsyncIterator que emite eventos de progresso
 */
async function* processQuestion(question) {
  // 1. Orquestrador começa
  await delay(DELAYS.ORCHESTRATOR_START);
  yield {
    agent: 'orchestrator',
    status: 'working',
    message: 'Analisando sua pergunta...'
  };

  await delay(DELAYS.ORCHESTRATOR_ANALYSIS);
  yield {
    agent: 'orchestrator',
    status: 'working',
    message: 'Identificando agentes necessários...'
  };

  // 2. Determinar quais especialistas ativar
  const questionType = detectQuestionType(question);
  const specialists = [];

  if (['deputados', 'votacao'].includes(questionType)) {
    specialists.push('political');
  }
  if (['proposicoes', 'votacao'].includes(questionType)) {
    specialists.push('legislative');
  }
  if (['despesas'].includes(questionType)) {
    specialists.push('fiscal');
  }

  // Se nenhum especialista específico, ativar todos
  if (specialists.length === 0) {
    specialists.push('legislative', 'political', 'fiscal');
  }

  await delay(DELAYS.SPECIALISTS_START);
  yield {
    agent: 'orchestrator',
    status: 'completed',
    message: `Delegando para ${specialists.length} especialista(s)...`
  };

  // 3. Especialistas trabalham em paralelo (simulado sequencialmente)
  for (const specialist of specialists) {
    yield {
      agent: specialist,
      status: 'working',
      message: 'Consultando bases de dados...'
    };

    await delay(DELAYS.SPECIALIST_WORK / 2);

    yield {
      agent: specialist,
      status: 'working',
      message: 'Processando informações...'
    };

    await delay(DELAYS.SPECIALIST_WORK / 2);

    const resultCounts = {
      legislative: Math.floor(Math.random() * 20) + 5,
      political: Math.floor(Math.random() * 50) + 10,
      fiscal: (Math.random() * 50000 + 10000).toFixed(2)
    };

    const resultMessages = {
      legislative: `Encontradas ${resultCounts.legislative} proposições`,
      political: `Analisados ${resultCounts.political} registros`,
      fiscal: `Total: R$ ${resultCounts.fiscal}`
    };

    yield {
      agent: specialist,
      status: 'completed',
      message: resultMessages[specialist] || 'Análise concluída'
    };
  }

  // 4. Sintetizador consolida
  await delay(DELAYS.SYNTHESIZER_START);
  yield {
    agent: 'synthesizer',
    status: 'working',
    message: 'Consolidando informações...'
  };

  await delay(DELAYS.SYNTHESIZER_WORK);
  yield {
    agent: 'synthesizer',
    status: 'working',
    message: 'Redigindo resposta final...'
  };

  await delay(DELAYS.FINAL_RESPONSE);
  yield {
    agent: 'synthesizer',
    status: 'completed',
    message: 'Resposta pronta!'
  };

  // 5. Retornar resposta final
  await delay(300);
  yield {
    type: 'final_response',
    content: getMockResponse(question)
  };
}

/**
 * API pública para enviar mensagem (versão simplificada)
 * Usa callback para cada evento
 */
async function sendMessage(question, onProgress) {
  if (!API_CONFIG.USE_MOCK) {
    // Aqui iria a integração real com Supabase/n8n
    throw new Error('Integração com backend real não implementada. USE_MOCK deve ser true.');
  }

  // Processar com mock
  for await (const event of processQuestion(question)) {
    if (onProgress) {
      onProgress(event);
    }
  }
}

/**
 * Exportar para uso global
 */
if (typeof window !== 'undefined') {
  window.api = {
    sendMessage,
    processQuestion,
    getMockResponse,
    API_CONFIG
  };
}
