/**
 * Script Principal - Agente Cidadão v3
 * Conecta interface do chat com agentes e API
 */

class ChatApp {
  constructor() {
    // Elementos DOM
    this.chatForm = null;
    this.chatInput = null;
    this.chatMessages = null;
    this.chatSubmit = null;
    this.agentStage = null;
    this.exampleButtons = null;

    // Estado
    this.messages = [];
    this.isProcessing = false;

    // Referências a outros módulos
    this.agentController = window.agentController;
    this.api = window.api;
    this.i18n = window.i18n;
  }

  /**
   * Inicializa a aplicação
   */
  init() {
    console.log('🚀 Inicializando Chat App...');

    // Buscar elementos DOM
    this.chatForm = document.getElementById('chat-form');
    this.chatInput = document.getElementById('chat-input');
    this.chatMessages = document.getElementById('chat-messages');
    this.chatSubmit = document.getElementById('chat-submit');
    this.agentStage = document.getElementById('agent-stage');
    this.exampleButtons = document.querySelectorAll('.example-btn');

    // Verificar elementos obrigatórios
    if (!this.chatForm || !this.chatInput || !this.chatMessages) {
      console.error('❌ Elementos essenciais do chat não encontrados!');
      return;
    }

    // Configurar event listeners
    this.setupEventListeners();

    // Adicionar mensagem de boas-vindas
    this.addWelcomeMessage();

    // Mostrar agent stage com animação
    if (this.agentStage) {
      setTimeout(() => {
        this.agentStage.classList.remove('hidden');
        this.agentStage.style.opacity = '0';
        this.agentStage.style.transform = 'translateY(20px)';
        this.agentStage.style.transition = 'all 0.5s ease';

        requestAnimationFrame(() => {
          this.agentStage.style.opacity = '1';
          this.agentStage.style.transform = 'translateY(0)';
        });
      }, 500);
    }

    console.log('✅ Chat App inicializado');
  }

  /**
   * Configura todos os event listeners
   */
  setupEventListeners() {
    // Submit do formulário
    this.chatForm.addEventListener('submit', (e) => {
      e.preventDefault();
      this.handleSubmit();
    });

    // Enter no input (sem shift)
    this.chatInput.addEventListener('keypress', (e) => {
      if (e.key === 'Enter' && !e.shiftKey) {
        e.preventDefault();
        this.handleSubmit();
      }
    });

    // Botões de exemplo
    this.exampleButtons.forEach(btn => {
      btn.addEventListener('click', () => {
        const question = btn.getAttribute('data-question');
        if (question) {
          this.fillInput(question);
        }
      });
    });

    // Troca de idioma
    window.addEventListener('languageChanged', (e) => {
      console.log('🌍 Idioma alterado para:', e.detail.language);
      // Re-renderizar mensagens se necessário
    });

    console.log('✅ Event listeners configurados');
  }

  /**
   * Adiciona mensagem de boas-vindas
   */
  addWelcomeMessage() {
    const welcomeText = this.i18n?.t('chat.welcome') ||
      'Olá! Sou o Agente Cidadão. Como posso ajudar você a fiscalizar ou entender melhor o cenário político hoje?';

    this.addMessage('assistant', welcomeText);
  }

  /**
   * Preenche o input com uma pergunta
   */
  fillInput(text) {
    this.chatInput.value = text;
    this.chatInput.focus();
  }

  /**
   * Manipula o envio do formulário
   */
  async handleSubmit() {
    const question = this.chatInput.value.trim();

    // Validar input
    if (!question) {
      return;
    }

    if (this.isProcessing) {
      console.warn('⏳ Já está processando uma pergunta...');
      return;
    }

    // Desabilitar input
    this.setProcessing(true);

    // Limpar input
    this.chatInput.value = '';

    // Adicionar mensagem do usuário
    this.addMessage('user', question);

    // Resetar agentes
    this.agentController.resetAll();

    // Processar pergunta
    await this.processQuestion(question);

    // Reabilitar input
    this.setProcessing(false);

    // Focar input novamente
    this.chatInput.focus();
  }

  /**
   * Processa uma pergunta enviando para API
   */
  async processQuestion(question) {
    try {
      console.log('📤 Enviando pergunta:', question);

      // Adicionar indicador de digitação
      const typingId = this.addTypingIndicator();

      // Processar com API mockada
      await this.api.sendMessage(question, (event) => {
        // Callback para cada evento de progresso
        if (event.type === 'final_response') {
          // Remover indicador de digitação
          this.removeMessage(typingId);

          // Adicionar resposta final
          this.addMessage('assistant', event.content);

          // Resetar agentes após pequeno delay
          setTimeout(() => {
            this.agentController.resetAll();
          }, 2000);
        } else {
          // Atualizar status do agente
          this.agentController.handleProgressEvent(event);
        }
      });

      console.log('✅ Pergunta processada com sucesso');
    } catch (error) {
      console.error('❌ Erro ao processar pergunta:', error);

      // Remover indicador de digitação se existir
      const typingIndicator = this.chatMessages.querySelector('.typing-indicator');
      if (typingIndicator) {
        typingIndicator.remove();
      }

      // Adicionar mensagem de erro
      this.addMessage('assistant', `❌ Erro: ${error.message}\n\nPor favor, tente novamente.`);

      // Resetar agentes
      this.agentController.resetAll();
    }
  }

  /**
   * Define estado de processamento
   */
  setProcessing(isProcessing) {
    this.isProcessing = isProcessing;

    if (this.chatInput) {
      this.chatInput.disabled = isProcessing;
    }

    if (this.chatSubmit) {
      this.chatSubmit.disabled = isProcessing;

      if (isProcessing) {
        this.chatSubmit.classList.add('processing');
        const btnText = this.chatSubmit.querySelector('.btn-text');
        if (btnText) {
          btnText.textContent = this.i18n?.t('chat.thinking') || 'Processando...';
        }
      } else {
        this.chatSubmit.classList.remove('processing');
        const btnText = this.chatSubmit.querySelector('.btn-text');
        if (btnText) {
          btnText.textContent = this.i18n?.t('chat.button.send') || 'Consultar';
        }
      }
    }
  }

  /**
   * Adiciona uma mensagem ao chat
   */
  addMessage(role, content) {
    const messageId = `msg-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;

    const messageEl = document.createElement('div');
    messageEl.className = `chat-message ${role}`;
    messageEl.id = messageId;

    // Avatar
    const avatarEl = document.createElement('div');
    avatarEl.className = 'chat-avatar';
    if (role === 'assistant') {
      avatarEl.innerHTML = `
        <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
          <path d="M12 8V4H8"/>
          <rect width="16" height="12" x="4" y="8" rx="2"/>
          <path d="M2 14h2"/>
          <path d="M20 14h2"/>
          <path d="M15 13v2"/>
          <path d="M9 13v2"/>
        </svg>
      `;
    } else {
      avatarEl.innerHTML = `
        <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
          <path d="M19 21v-2a4 4 0 0 0-4-4H9a4 4 0 0 0-4 4v2"/>
          <circle cx="12" cy="7" r="4"/>
        </svg>
      `;
    }

    // Bubble
    const bubbleEl = document.createElement('div');
    bubbleEl.className = 'chat-bubble';

    // Processar Markdown simples (negrito, listas)
    const formattedContent = this.formatMarkdown(content);
    bubbleEl.innerHTML = formattedContent;

    // Montar mensagem
    messageEl.appendChild(avatarEl);
    messageEl.appendChild(bubbleEl);

    // Adicionar ao chat
    this.chatMessages.appendChild(messageEl);

    // Armazenar no histórico
    this.messages.push({
      id: messageId,
      role,
      content,
      timestamp: Date.now()
    });

    // Scroll para o fim
    this.scrollToBottom();

    return messageId;
  }

  /**
   * Remove uma mensagem do chat
   */
  removeMessage(messageId) {
    const messageEl = document.getElementById(messageId);
    if (messageEl) {
      messageEl.remove();
    }

    // Remover do histórico
    this.messages = this.messages.filter(m => m.id !== messageId);
  }

  /**
   * Adiciona indicador de digitação
   */
  addTypingIndicator() {
    const messageId = `typing-${Date.now()}`;

    const messageEl = document.createElement('div');
    messageEl.className = 'chat-message assistant typing-indicator';
    messageEl.id = messageId;

    const avatarEl = document.createElement('div');
    avatarEl.className = 'chat-avatar';
    avatarEl.innerHTML = `
      <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
        <path d="M12 8V4H8"/>
        <rect width="16" height="12" x="4" y="8" rx="2"/>
        <path d="M2 14h2"/>
        <path d="M20 14h2"/>
        <path d="M15 13v2"/>
        <path d="M9 13v2"/>
      </svg>
    `;

    const bubbleEl = document.createElement('div');
    bubbleEl.className = 'chat-bubble';
    bubbleEl.innerHTML = `
      <div class="chat-typing-indicator">
        <span class="chat-typing-dot"></span>
        <span class="chat-typing-dot"></span>
        <span class="chat-typing-dot"></span>
      </div>
    `;

    messageEl.appendChild(avatarEl);
    messageEl.appendChild(bubbleEl);

    this.chatMessages.appendChild(messageEl);
    this.scrollToBottom();

    return messageId;
  }

  /**
   * Formata Markdown simples para HTML
   */
  formatMarkdown(text) {
    let html = text;

    // Negrito **texto**
    html = html.replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>');

    // Itálico *texto*
    html = html.replace(/\*(.*?)\*/g, '<em>$1</em>');

    // Quebras de linha
    html = html.replace(/\n/g, '<br>');

    // Listas não ordenadas (linhas começando com - ou *)
    html = html.replace(/^[-*]\s+(.+)$/gm, '<li>$1</li>');
    html = html.replace(/(<li>.*<\/li>)/s, '<ul>$1</ul>');

    // Listas ordenadas (linhas começando com número.)
    html = html.replace(/^\d+\.\s+(.+)$/gm, '<li>$1</li>');

    return html;
  }

  /**
   * Scroll suave para o fim do chat
   */
  scrollToBottom() {
    if (this.chatMessages) {
      setTimeout(() => {
        this.chatMessages.scrollTo({
          top: this.chatMessages.scrollHeight,
          behavior: 'smooth'
        });
      }, 100);
    }
  }

  /**
   * Limpa o histórico de mensagens
   */
  clearMessages() {
    this.messages = [];
    if (this.chatMessages) {
      this.chatMessages.innerHTML = '';
    }
    this.addWelcomeMessage();
  }
}

/**
 * Inicialização global
 */
let chatApp;

function initApp() {
  chatApp = new ChatApp();
  chatApp.init();

  // Expor globalmente para debugging
  window.chatApp = chatApp;
}

// Auto-inicialização
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', initApp);
} else {
  initApp();
}
