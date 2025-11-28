/**
 * Controle das Animações dos Agentes
 * Gerencia estados visuais e mensagens de cada agente
 */

class AgentController {
  constructor() {
    // Referências aos elementos DOM dos agentes
    this.agents = {
      orchestrator: null,
      legislative: null,
      political: null,
      fiscal: null,
      synthesizer: null
    };

    // Estado atual de cada agente
    this.states = {
      orchestrator: 'idle',
      legislative: 'idle',
      political: 'idle',
      fiscal: 'idle',
      synthesizer: 'idle'
    };

    // Mensagens atuais
    this.messages = {
      orchestrator: '',
      legislative: '',
      political: '',
      fiscal: '',
      synthesizer: ''
    };

    this.initialized = false;
  }

  /**
   * Inicializa o controller vinculando aos elementos DOM
   */
  init() {
    // Buscar elementos dos agentes
    this.agents.orchestrator = document.getElementById('agent-orchestrator');
    this.agents.legislative = document.getElementById('agent-legislative');
    this.agents.political = document.getElementById('agent-political');
    this.agents.fiscal = document.getElementById('agent-fiscal');
    this.agents.synthesizer = document.getElementById('agent-synthesizer');

    // Verificar se todos foram encontrados
    const missing = Object.entries(this.agents)
      .filter(([_, element]) => !element)
      .map(([id, _]) => id);

    if (missing.length > 0) {
      console.warn('⚠️ Agentes não encontrados no DOM:', missing);
    }

    this.initialized = true;
    console.log('✅ AgentController inicializado');

    // Resetar todos para idle
    this.resetAll();
  }

  /**
   * Define o status de um agente
   * @param {string} agentId - ID do agente (orchestrator, legislative, etc)
   * @param {string} status - Status ('idle', 'working', 'completed', 'error')
   * @param {string} message - Mensagem a exibir (opcional)
   */
  setStatus(agentId, status, message = '') {
    const agent = this.agents[agentId];
    if (!agent) {
      console.warn(`⚠️ Agente "${agentId}" não encontrado`);
      return;
    }

    // Atualizar estado interno
    this.states[agentId] = status;
    this.messages[agentId] = message;

    // Remover classes de status anteriores
    agent.classList.remove('idle', 'working', 'completed', 'error');

    // Adicionar nova classe de status
    agent.classList.add(status);

    // Adicionar classe específica do agente (para animações únicas)
    agent.classList.add(agentId);

    // Atualizar mensagem
    const messageEl = agent.querySelector('.agent-message');
    if (messageEl) {
      if (message) {
        messageEl.textContent = message;
      } else {
        // Usar tradução padrão
        const defaultMessages = {
          idle: window.i18n?.t('status.waiting') || 'Aguardando tarefas...',
          working: window.i18n?.t('status.working') || 'Trabalhando...',
          completed: window.i18n?.t('status.completed') || 'Concluído',
          error: window.i18n?.t('status.error') || 'Erro'
        };
        messageEl.textContent = defaultMessages[status] || '';
      }
    }

    // Atualizar badge
    const badgeEl = agent.querySelector('.agent-badge');
    if (badgeEl) {
      // Remover classes de status anteriores do badge
      badgeEl.classList.remove('idle', 'working', 'completed', 'error');
      badgeEl.classList.add(status);

      // Atualizar conteúdo do badge
      const badgeTextEl = badgeEl.querySelector('.badge-text');
      const badgeIconEl = badgeEl.querySelector('.badge-icon');

      if (badgeTextEl) {
        const statusTexts = {
          idle: window.i18n?.t('status.idle') || 'Aguardando',
          working: window.i18n?.t('status.working') || 'Trabalhando...',
          completed: window.i18n?.t('status.completed') || 'Concluído',
          error: window.i18n?.t('status.error') || 'Erro'
        };
        badgeTextEl.textContent = statusTexts[status] || status;
      }

      // Atualizar ícone do badge
      if (badgeIconEl) {
        if (status === 'working') {
          badgeIconEl.innerHTML = '<span class="agent-status-spinner"></span>';
        } else if (status === 'completed') {
          badgeIconEl.innerHTML = '✓';
        } else if (status === 'error') {
          badgeIconEl.innerHTML = '✗';
        } else {
          badgeIconEl.innerHTML = '';
        }
      }
    }

    console.log(`🤖 ${agentId}: ${status} - "${message}"`);
  }

  /**
   * Reseta todos os agentes para idle
   */
  resetAll() {
    Object.keys(this.agents).forEach(agentId => {
      this.setStatus(agentId, 'idle', '');
    });
    console.log('🔄 Todos os agentes resetados');
  }

  /**
   * Ativa (mostra) um agente específico
   * @param {string} agentId - ID do agente
   */
  show(agentId) {
    const agent = this.agents[agentId];
    if (!agent) return;

    agent.classList.remove('hidden');
    agent.classList.add('active');
  }

  /**
   * Desativa (oculta) um agente específico
   * @param {string} agentId - ID do agente
   */
  hide(agentId) {
    const agent = this.agents[agentId];
    if (!agent) return;

    agent.classList.add('hidden');
    agent.classList.remove('active');
  }

  /**
   * Mostra todos os agentes
   */
  showAll() {
    Object.keys(this.agents).forEach(agentId => {
      this.show(agentId);
    });
  }

  /**
   * Oculta todos os agentes
   */
  hideAll() {
    Object.keys(this.agents).forEach(agentId => {
      this.hide(agentId);
    });
  }

  /**
   * Obtém o estado atual de um agente
   * @param {string} agentId
   * @returns {string} - Status atual
   */
  getStatus(agentId) {
    return this.states[agentId] || 'idle';
  }

  /**
   * Obtém a mensagem atual de um agente
   * @param {string} agentId
   * @returns {string} - Mensagem atual
   */
  getMessage(agentId) {
    return this.messages[agentId] || '';
  }

  /**
   * Processa um evento de progresso da API
   * @param {Object} event - Evento { agent, status, message }
   */
  handleProgressEvent(event) {
    if (event.type === 'final_response') {
      // Não processar aqui, deixar para app.js
      return;
    }

    const { agent, status, message } = event;

    if (!agent) {
      console.warn('⚠️ Evento sem agente:', event);
      return;
    }

    this.setStatus(agent, status, message);
  }

  /**
   * Aguarda todos os agentes completarem
   * @returns {Promise<void>}
   */
  async waitForCompletion() {
    return new Promise((resolve) => {
      const checkInterval = setInterval(() => {
        const allCompleted = Object.values(this.states).every(
          state => state === 'completed' || state === 'idle'
        );

        if (allCompleted) {
          clearInterval(checkInterval);
          resolve();
        }
      }, 100);

      // Timeout de segurança (30 segundos)
      setTimeout(() => {
        clearInterval(checkInterval);
        console.warn('⚠️ Timeout esperando agentes completarem');
        resolve();
      }, 30000);
    });
  }

  /**
   * Animação de entrada sequencial dos agentes (efeito cascata)
   * @param {number} delay - Delay entre cada agente (ms)
   */
  async cascadeIn(delay = 200) {
    const agentIds = ['orchestrator', 'legislative', 'political', 'fiscal', 'synthesizer'];

    for (const agentId of agentIds) {
      this.show(agentId);
      await new Promise(resolve => setTimeout(resolve, delay));
    }
  }

  /**
   * Pulsa todos os agentes idle (efeito de "respiração")
   */
  pulseIdle() {
    Object.entries(this.states).forEach(([agentId, status]) => {
      if (status === 'idle') {
        const agent = this.agents[agentId];
        if (agent) {
          agent.style.animation = 'breathing 4s ease-in-out infinite';
        }
      }
    });
  }
}

/**
 * Exportar para uso global
 */
if (typeof window !== 'undefined') {
  window.AgentController = AgentController;

  // Criar instância global
  window.agentController = new AgentController();

  // Inicializar quando DOM estiver pronto
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => {
      window.agentController.init();
    });
  } else {
    // DOM já carregado
    window.agentController.init();
  }
}
