/**
 * Sistema de Internacionalização (i18n)
 * Suporta: PT-BR (Português do Brasil) e ES (Espanhol)
 */

const translations = {
  'pt-br': {
    // Header
    'header.title': 'Agente Cidadão',
    'header.subtitle': 'Transparência Legislativa com IA',
    'nav.chat': 'Chat',
    'nav.admin': 'Administração',
    'nav.login': 'Login',

    // Hero
    'hero.title': 'Acesso Inteligente aos Dados Públicos',
    'hero.subtitle': 'Acompanhe proposições, fiscalize gastos e entenda a política com a ajuda de nossa equipe de agentes especializados',
    'hero.description': 'Nossa plataforma utiliza inteligência artificial para tornar os dados da Câmara dos Deputados acessíveis e compreensíveis para todos os cidadãos.',

    // Agentes
    'agent.orchestrator': 'Orquestrador',
    'agent.legislative': 'Legislativo',
    'agent.political': 'Político',
    'agent.fiscal': 'Fiscal',
    'agent.synthesizer': 'Sintetizador',

    'agent.orchestrator.desc': 'Coordena e delega tarefas para os especialistas',
    'agent.legislative.desc': 'Especialista em proposições e tramitações legislativas',
    'agent.political.desc': 'Analista de perfis de deputados e atividades políticas',
    'agent.fiscal.desc': 'Auditor de gastos públicos e despesas parlamentares',
    'agent.synthesizer.desc': 'Consolida informações e redige respostas claras',

    // Status
    'status.idle': 'Aguardando',
    'status.working': 'Trabalhando...',
    'status.completed': 'Concluído',
    'status.error': 'Erro',
    'status.waiting': 'Aguardando tarefas...',

    // Chat
    'chat.input.placeholder': 'Digite sua pergunta sobre política e legislação...',
    'chat.button.send': 'Consultar',
    'chat.welcome': 'Olá! Sou o Agente Cidadão. Como posso ajudar você a fiscalizar ou entender melhor o cenário político hoje?',
    'chat.thinking': 'Processando sua pergunta...',

    // Exemplos
    'examples.title': 'Exemplos de Perguntas',
    'examples.q1': 'Quais são os deputados de São Paulo?',
    'examples.q2': 'Mostre as despesas do deputado Eduardo Bolsonaro',
    'examples.q3': 'Projetos de lei sobre educação em 2024',
    'examples.q4': 'Qual o histórico de votação de Tabata Amaral?',
    'examples.q5': 'Gastos com combustível dos deputados de MG',
    'examples.q6': 'Quais proposições sobre saúde estão em tramitação?',

    // Fontes de Dados
    'sources.title': 'Fontes de Dados Oficiais',
    'sources.subtitle': 'Todas as informações vêm de fontes públicas e confiáveis',
    'sources.camara.title': 'API Câmara dos Deputados',
    'sources.camara.desc': 'Proposições, deputados, votações e tramitações em tempo real',
    'sources.camara.badge': 'Dados em Tempo Real',
    'sources.senado.title': 'Dados Abertos do Senado',
    'sources.senado.desc': 'Legislação federal e atividades parlamentares',
    'sources.senado.badge': 'Em breve',
    'sources.transparencia.title': 'Portal da Transparência',
    'sources.transparencia.desc': 'Gastos públicos e despesas governamentais',
    'sources.transparencia.badge': 'Em breve',

    // Como Funciona
    'howto.title': 'Como Funciona',
    'howto.step1.title': '1. Você Pergunta',
    'howto.step1.desc': 'Digite sua dúvida sobre política, leis ou gastos públicos',
    'howto.step2.title': '2. Orquestrador Analisa',
    'howto.step2.desc': 'O sistema identifica quais especialistas devem responder',
    'howto.step3.title': '3. Especialistas Trabalham',
    'howto.step3.desc': 'Agentes buscam dados simultaneamente nas APIs oficiais',
    'howto.step4.title': '4. Sintetizador Consolida',
    'howto.step4.desc': 'As informações são organizadas de forma clara e objetiva',
    'howto.step5.title': '5. Resposta Completa',
    'howto.step5.desc': 'Você recebe uma resposta compreensível e embasada',

    // Footer
    'footer.about': 'Sobre',
    'footer.docs': 'Documentação',
    'footer.github': 'GitHub',
    'footer.contact': 'Contato',
    'footer.privacy': 'Privacidade',
    'footer.terms': 'Termos de Uso',
    'footer.rights': 'Todos os direitos reservados',
    'footer.opensource': 'Projeto de Código Aberto',

    // Login
    'login.title': 'Área Administrativa',
    'login.subtitle': 'Faça login para acessar o painel de controle',
    'login.email': 'Email',
    'login.password': 'Senha',
    'login.remember': 'Lembrar-me',
    'login.forgot': 'Esqueci minha senha',
    'login.button': 'Entrar no Sistema',
    'login.backtochat': 'Voltar ao Chat',

    // Admin
    'admin.title': 'Painel Administrativo',
    'admin.dashboard': 'Dashboard',
    'admin.users': 'Usuários',
    'admin.logs': 'Logs do Sistema',
    'admin.settings': 'Configurações',
    'admin.logout': 'Sair',

    'admin.metrics.total': 'Total de Consultas',
    'admin.metrics.today': 'Consultas Hoje',
    'admin.metrics.users': 'Usuários Ativos',
    'admin.metrics.avgtime': 'Tempo Médio de Resposta',

    'admin.recent.title': 'Consultas Recentes',
    'admin.table.id': 'ID',
    'admin.table.user': 'Usuário',
    'admin.table.query': 'Pergunta',
    'admin.table.status': 'Status',
    'admin.table.time': 'Data/Hora',
    'admin.table.actions': 'Ações',

    // Geral
    'general.loading': 'Carregando...',
    'general.error': 'Ocorreu um erro',
    'general.success': 'Sucesso!',
    'general.cancel': 'Cancelar',
    'general.save': 'Salvar',
    'general.delete': 'Excluir',
    'general.edit': 'Editar',
    'general.view': 'Visualizar',
  },

  'es': {
    // Header
    'header.title': 'Agente Ciudadano',
    'header.subtitle': 'Transparencia Legislativa con IA',
    'nav.chat': 'Chat',
    'nav.admin': 'Administración',
    'nav.login': 'Iniciar Sesión',

    // Hero
    'hero.title': 'Acceso Inteligente a los Datos Públicos',
    'hero.subtitle': 'Sigue proposiciones, fiscaliza gastos y comprende la política con la ayuda de nuestro equipo de agentes especializados',
    'hero.description': 'Nuestra plataforma utiliza inteligencia artificial para hacer accesibles y comprensibles los datos de la Cámara de Diputados para todos los ciudadanos.',

    // Agentes
    'agent.orchestrator': 'Orquestador',
    'agent.legislative': 'Legislativo',
    'agent.political': 'Político',
    'agent.fiscal': 'Fiscal',
    'agent.synthesizer': 'Sintetizador',

    'agent.orchestrator.desc': 'Coordina y delega tareas a los especialistas',
    'agent.legislative.desc': 'Especialista en proposiciones y trámites legislativos',
    'agent.political.desc': 'Analista de perfiles de diputados y actividades políticas',
    'agent.fiscal.desc': 'Auditor de gastos públicos y gastos parlamentarios',
    'agent.synthesizer.desc': 'Consolida información y redacta respuestas claras',

    // Status
    'status.idle': 'En Espera',
    'status.working': 'Trabajando...',
    'status.completed': 'Completado',
    'status.error': 'Error',
    'status.waiting': 'Esperando tareas...',

    // Chat
    'chat.input.placeholder': 'Escribe tu pregunta sobre política y legislación...',
    'chat.button.send': 'Consultar',
    'chat.welcome': '¡Hola! Soy el Agente Ciudadano. ¿Cómo puedo ayudarte a fiscalizar o comprender mejor el escenario político hoy?',
    'chat.thinking': 'Procesando tu pregunta...',

    // Exemplos
    'examples.title': 'Ejemplos de Preguntas',
    'examples.q1': '¿Cuáles son los diputados de São Paulo?',
    'examples.q2': 'Muestra los gastos del diputado Eduardo Bolsonaro',
    'examples.q3': 'Proyectos de ley sobre educación en 2024',
    'examples.q4': '¿Cuál es el historial de votación de Tabata Amaral?',
    'examples.q5': 'Gastos en combustible de los diputados de MG',
    'examples.q6': '¿Qué proposiciones sobre salud están en trámite?',

    // Fontes de Dados
    'sources.title': 'Fuentes de Datos Oficiales',
    'sources.subtitle': 'Toda la información proviene de fuentes públicas y confiables',
    'sources.camara.title': 'API Cámara de Diputados',
    'sources.camara.desc': 'Proposiciones, diputados, votaciones y trámites en tiempo real',
    'sources.camara.badge': 'Datos en Tiempo Real',
    'sources.senado.title': 'Datos Abiertos del Senado',
    'sources.senado.desc': 'Legislación federal y actividades parlamentarias',
    'sources.senado.badge': 'Próximamente',
    'sources.transparencia.title': 'Portal de Transparencia',
    'sources.transparencia.desc': 'Gastos públicos y gastos gubernamentales',
    'sources.transparencia.badge': 'Próximamente',

    // Como Funciona
    'howto.title': 'Cómo Funciona',
    'howto.step1.title': '1. Tú Preguntas',
    'howto.step1.desc': 'Escribe tu duda sobre política, leyes o gastos públicos',
    'howto.step2.title': '2. Orquestador Analiza',
    'howto.step2.desc': 'El sistema identifica qué especialistas deben responder',
    'howto.step3.title': '3. Especialistas Trabajan',
    'howto.step3.desc': 'Los agentes buscan datos simultáneamente en las APIs oficiales',
    'howto.step4.title': '4. Sintetizador Consolida',
    'howto.step4.desc': 'La información se organiza de forma clara y objetiva',
    'howto.step5.title': '5. Respuesta Completa',
    'howto.step5.desc': 'Recibes una respuesta comprensible y fundamentada',

    // Footer
    'footer.about': 'Acerca de',
    'footer.docs': 'Documentación',
    'footer.github': 'GitHub',
    'footer.contact': 'Contacto',
    'footer.privacy': 'Privacidad',
    'footer.terms': 'Términos de Uso',
    'footer.rights': 'Todos los derechos reservados',
    'footer.opensource': 'Proyecto de Código Abierto',

    // Login
    'login.title': 'Área Administrativa',
    'login.subtitle': 'Inicia sesión para acceder al panel de control',
    'login.email': 'Correo Electrónico',
    'login.password': 'Contraseña',
    'login.remember': 'Recuérdame',
    'login.forgot': 'Olvidé mi contraseña',
    'login.button': 'Entrar al Sistema',
    'login.backtochat': 'Volver al Chat',

    // Admin
    'admin.title': 'Panel Administrativo',
    'admin.dashboard': 'Panel',
    'admin.users': 'Usuarios',
    'admin.logs': 'Registros del Sistema',
    'admin.settings': 'Configuración',
    'admin.logout': 'Salir',

    'admin.metrics.total': 'Total de Consultas',
    'admin.metrics.today': 'Consultas Hoy',
    'admin.metrics.users': 'Usuarios Activos',
    'admin.metrics.avgtime': 'Tiempo Promedio de Respuesta',

    'admin.recent.title': 'Consultas Recientes',
    'admin.table.id': 'ID',
    'admin.table.user': 'Usuario',
    'admin.table.query': 'Pregunta',
    'admin.table.status': 'Estado',
    'admin.table.time': 'Fecha/Hora',
    'admin.table.actions': 'Acciones',

    // Geral
    'general.loading': 'Cargando...',
    'general.error': 'Ocurrió un error',
    'general.success': '¡Éxito!',
    'general.cancel': 'Cancelar',
    'general.save': 'Guardar',
    'general.delete': 'Eliminar',
    'general.edit': 'Editar',
    'general.view': 'Ver',
  }
};

/**
 * Traduz uma chave para o idioma atual
 * @param {string} key - Chave de tradução (ex: 'header.title')
 * @param {string} lang - Idioma (opcional, padrão: idioma atual)
 * @returns {string} - Texto traduzido
 */
function t(key, lang = null) {
  const currentLang = lang || getCurrentLanguage();
  return translations[currentLang]?.[key] || key;
}

/**
 * Define o idioma da aplicação
 * @param {string} lang - 'pt-br' ou 'es'
 */
function setLanguage(lang) {
  if (!translations[lang]) {
    console.error(`Idioma "${lang}" não suportado`);
    return;
  }

  localStorage.setItem('language', lang);
  updatePageTranslations(lang);
  updateLanguageButtons(lang);

  // Dispatch evento customizado para outros scripts
  window.dispatchEvent(new CustomEvent('languageChanged', { detail: { language: lang } }));
}

/**
 * Retorna o idioma atual (salvo no localStorage ou padrão)
 * @returns {string} - Código do idioma
 */
function getCurrentLanguage() {
  const saved = localStorage.getItem('language');
  // Detectar idioma do navegador se não houver salvo
  if (!saved) {
    const browserLang = navigator.language.toLowerCase();
    if (browserLang.startsWith('es')) return 'es';
    return 'pt-br';
  }
  return saved;
}

/**
 * Atualiza todos os textos da página com as traduções
 * @param {string} lang - Idioma alvo
 */
function updatePageTranslations(lang) {
  // Atualizar elementos com data-i18n (textContent)
  document.querySelectorAll('[data-i18n]').forEach(el => {
    const key = el.getAttribute('data-i18n');
    el.textContent = t(key, lang);
  });

  // Atualizar elementos com data-i18n-placeholder (placeholder)
  document.querySelectorAll('[data-i18n-placeholder]').forEach(el => {
    const key = el.getAttribute('data-i18n-placeholder');
    el.placeholder = t(key, lang);
  });

  // Atualizar elementos com data-i18n-title (title/tooltip)
  document.querySelectorAll('[data-i18n-title]').forEach(el => {
    const key = el.getAttribute('data-i18n-title');
    el.title = t(key, lang);
  });

  // Atualizar atributo lang do HTML
  document.documentElement.lang = lang === 'pt-br' ? 'pt-BR' : 'es';
}

/**
 * Atualiza os botões de seleção de idioma
 * @param {string} lang - Idioma ativo
 */
function updateLanguageButtons(lang) {
  const buttons = {
    'pt-br': document.getElementById('btn-pt'),
    'es': document.getElementById('btn-es')
  };

  Object.entries(buttons).forEach(([btnLang, btn]) => {
    if (!btn) return;

    if (btnLang === lang) {
      btn.classList.add('active', 'bg-[var(--color-primary)]', 'text-white', 'shadow-sm');
      btn.classList.remove('text-slate-400', 'hover:text-white');
    } else {
      btn.classList.remove('active', 'bg-[var(--color-primary)]', 'text-white', 'shadow-sm');
      btn.classList.add('text-slate-400', 'hover:text-white');
    }
  });
}

/**
 * Inicializa o sistema de i18n quando o DOM estiver pronto
 */
function initI18n() {
  const currentLang = getCurrentLanguage();
  updatePageTranslations(currentLang);
  updateLanguageButtons(currentLang);

  console.log(`✅ i18n inicializado - Idioma: ${currentLang}`);
}

// Auto-inicialização
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', initI18n);
} else {
  initI18n();
}

// Exportar para uso global (window)
if (typeof window !== 'undefined') {
  window.i18n = {
    t,
    setLanguage,
    getCurrentLanguage,
    updatePageTranslations,
    translations
  };
}
