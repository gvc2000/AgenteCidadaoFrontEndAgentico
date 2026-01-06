// Translations for AgenteCidadão
// Primary: Portuguese (Brazil) - pt-BR
// Secondary: Spanish (Spain) - es-ES

export type Language = 'pt-BR' | 'es-ES';

export interface Translations {
  // Header
  appTitle: string;
  appSubtitle: string;
  officialData: string;
  directConsult: string;

  // Navigation
  navChat: string;
  navAdmin: string;
  navSettings: string;
  navUsers: string;
  navLogout: string;
  newConversation: string;

  // Chat
  chatTitle: string;
  chatSubtitle: string;
  welcomeTitle: string;
  welcomeMessage: string;
  inputPlaceholder: string;
  sendButton: string;
  loadingText: string;

  // Sidebars
  examplesTitle: string;
  sourcesTitle: string;
  camaraDeputados: string;
  senadoFederal: string;
  portalTransparencia: string;
  apiVersion: string;
  soonLabel: string;
  accessDocs: string;
  activeLabel: string;

  // Example questions
  examples: string[];

  // Agents
  agentOrchestrator: string;
  agentLegislative: string;
  agentPolitical: string;
  agentFiscal: string;
  agentConsolidator: string;
  statusIdle: string;
  statusWorking: string;
  statusCompleted: string;
  statusError: string;
  statusTimeout: string;
  waitingTasks: string;
  agentCompleted: string;
  agentAnalyzing: string;
  agentWaiting: string;

  // Footer
  footerText: string;
  footerNote: string;
  openDataPortal: string;
  apiDocsLink: string;

  // Errors
  errorMessage: string;
  timeoutMessage: string;
  networkError: string;

  // Admin
  adminTitle: string;
  adminDescription: string;
  loginTitle: string;
  emailLabel: string;
  passwordLabel: string;
  loginButton: string;

  // User Management
  userManagement: string;
  addUser: string;
  editUser: string;
  deleteUser: string;
  userName: string;
  userEmail: string;
  userRole: string;
  roleAdmin: string;
  roleUser: string;
  confirmDelete: string;
  cancel: string;
  save: string;

  // Settings
  settingsTitle: string;
  accessRestriction: string;
  accessRestrictionDesc: string;
  publicAccess: string;
  restrictedAccess: string;
  settingsSaved: string;
}

export const translations: Record<Language, Translations> = {
  'pt-BR': {
    // Header
    appTitle: 'Agente Cidadão',
    appSubtitle: 'Acesso Inteligente aos Dados Abertos',
    officialData: 'Dados Oficiais',
    directConsult: 'Consulta direta às APIs governamentais',

    // Navigation
    navChat: 'Chat',
    navAdmin: 'Administração',
    navSettings: 'Configurações',
    navUsers: 'Usuários',
    navLogout: 'Sair',
    newConversation: 'Nova Conversa',

    // Chat
    chatTitle: 'Faça sua consulta aos Dados Abertos',
    chatSubtitle: 'Pergunte em linguagem natural e receba informações oficiais em tempo real',
    welcomeTitle: 'Bem-vindo ao Agente Cidadão!',
    welcomeMessage: 'Faça perguntas em linguagem natural sobre dados públicos governamentais e receba respostas baseadas em informações oficiais obtidas diretamente das APIs governamentais.',
    inputPlaceholder: 'Faça uma pergunta sobre o trabalho legislativo, despesas, votações ou proposições…',
    sendButton: 'Consultar',
    loadingText: 'Buscando informações atualizadas nos Dados Abertos...',

    // Sidebars
    examplesTitle: '💡 Exemplos de Perguntas',
    sourcesTitle: '📊 Fontes de Dados',
    camaraDeputados: 'Câmara dos Deputados',
    senadoFederal: 'Senado Federal',
    portalTransparencia: 'Portal da Transparência',
    apiVersion: 'API de Dados Abertos v2',
    soonLabel: 'Em breve',
    accessDocs: '🔗 Acessar documentação',
    activeLabel: 'Ativo',

    // Example questions
    examples: [
      'Quais deputados representam o Amazonas?',
      'Liste as PECs apresentadas em 2024',
      'Existem projetos de lei sobre inteligência artificial?',
      'Quantos deputados tem o Rio de Janeiro?',
      'Mostre as proposições sobre educação de 2025'
    ],

    // Agents
    agentOrchestrator: 'Orquestrador',
    agentLegislative: 'Legislativo',
    agentPolitical: 'Político',
    agentFiscal: 'Fiscal',
    agentConsolidator: 'Consolidador',
    statusIdle: 'Aguardando',
    statusWorking: 'Processando',
    statusCompleted: 'Concluído',
    statusError: 'Erro',
    statusTimeout: 'Timeout',
    waitingTasks: 'Aguardando tarefas...',
    agentCompleted: 'Análise concluída.',
    agentAnalyzing: 'Iniciando análise...',
    agentWaiting: 'Aguardando tarefas...',

    // Footer
    footerText: 'Agente Cidadão - Interface inteligente para acesso aos Dados Abertos Governamentais Brasileiros',
    footerNote: 'Todos os dados são consultados diretamente das APIs oficiais do governo brasileiro',
    openDataPortal: 'Portal de Dados Abertos',
    apiDocsLink: 'Documentação da API',

    // Errors
    errorMessage: 'Erro ao processar sua solicitação. Por favor, tente novamente.',
    timeoutMessage: 'Tempo esgotado: A operação demorou mais de 2 minutos e foi cancelada.',
    networkError: 'Erro de comunicação com o servidor.',

    // Admin
    adminTitle: 'Administração',
    adminDescription: 'Área restrita para gerenciamento do sistema.',
    loginTitle: 'Login Administrativo',
    emailLabel: 'Email',
    passwordLabel: 'Senha',
    loginButton: 'Entrar no Sistema',

    // User Management
    userManagement: 'Gerenciamento de Usuários',
    addUser: 'Adicionar Usuário',
    editUser: 'Editar Usuário',
    deleteUser: 'Excluir Usuário',
    userName: 'Nome',
    userEmail: 'Email',
    userRole: 'Função',
    roleAdmin: 'Administrador',
    roleUser: 'Usuário',
    confirmDelete: 'Tem certeza que deseja excluir este usuário?',
    cancel: 'Cancelar',
    save: 'Salvar',

    // Settings
    settingsTitle: 'Configurações do Sistema',
    accessRestriction: 'Modo de Acesso Restrito',
    accessRestrictionDesc: 'Quando ativado, o site só pode ser acessado com login e senha.',
    publicAccess: 'Acesso Público',
    restrictedAccess: 'Acesso Restrito',
    settingsSaved: 'Configurações salvas com sucesso!',
  },

  'es-ES': {
    // Header
    appTitle: 'Agente Ciudadano',
    appSubtitle: 'Acceso Inteligente a los Datos Abiertos',
    officialData: 'Datos Oficiales',
    directConsult: 'Consulta directa a las APIs gubernamentales',

    // Navigation
    navChat: 'Chat',
    navAdmin: 'Administración',
    navSettings: 'Configuración',
    navUsers: 'Usuarios',
    navLogout: 'Salir',
    newConversation: 'Nueva Conversación',

    // Chat
    chatTitle: 'Haga su consulta a los Datos Abiertos',
    chatSubtitle: 'Pregunte en lenguaje natural y reciba información oficial en tiempo real',
    welcomeTitle: '¡Bienvenido al Agente Ciudadano!',
    welcomeMessage: 'Haga preguntas en lenguaje natural sobre datos públicos gubernamentales y reciba respuestas basadas en información oficial obtenida directamente de las APIs gubernamentales.',
    inputPlaceholder: 'Haga una pregunta sobre el trabajo legislativo, gastos, votaciones o proposiciones…',
    sendButton: 'Consultar',
    loadingText: 'Buscando información actualizada en los Datos Abiertos...',

    // Sidebars
    examplesTitle: '💡 Ejemplos de Preguntas',
    sourcesTitle: '📊 Fuentes de Datos',
    camaraDeputados: 'Cámara de Diputados',
    senadoFederal: 'Senado Federal',
    portalTransparencia: 'Portal de Transparencia',
    apiVersion: 'API de Datos Abiertos v2',
    soonLabel: 'Próximamente',
    accessDocs: '🔗 Acceder a la documentación',
    activeLabel: 'Activo',

    // Example questions
    examples: [
      '¿Qué diputados representan Amazonas?',
      'Liste las PECs presentadas en 2024',
      '¿Existen proyectos de ley sobre inteligencia artificial?',
      '¿Cuántos diputados tiene Río de Janeiro?',
      'Muestre las proposiciones sobre educación de 2025'
    ],

    // Agents
    agentOrchestrator: 'Orquestador',
    agentLegislative: 'Legislativo',
    agentPolitical: 'Político',
    agentFiscal: 'Fiscal',
    agentConsolidator: 'Consolidador',
    statusIdle: 'Esperando',
    statusWorking: 'Procesando',
    statusCompleted: 'Completado',
    statusError: 'Error',
    statusTimeout: 'Tiempo agotado',
    waitingTasks: 'Esperando tareas...',
    agentCompleted: 'Análisis completado.',
    agentAnalyzing: 'Iniciando análisis...',
    agentWaiting: 'Esperando tareas...',

    // Footer
    footerText: 'Agente Ciudadano - Interfaz inteligente para acceso a los Datos Abiertos Gubernamentales Brasileños',
    footerNote: 'Todos los datos se consultan directamente de las APIs oficiales del gobierno brasileño',
    openDataPortal: 'Portal de Datos Abiertos',
    apiDocsLink: 'Documentación de la API',

    // Errors
    errorMessage: 'Error al procesar su solicitud. Por favor, intente nuevamente.',
    timeoutMessage: 'Tiempo agotado: La operación tardó más de 2 minutos y fue cancelada.',
    networkError: 'Error de comunicación con el servidor.',

    // Admin
    adminTitle: 'Administración',
    adminDescription: 'Área restringida para gestión del sistema.',
    loginTitle: 'Inicio de Sesión Administrativo',
    emailLabel: 'Correo electrónico',
    passwordLabel: 'Contraseña',
    loginButton: 'Iniciar Sesión',

    // User Management
    userManagement: 'Gestión de Usuarios',
    addUser: 'Añadir Usuario',
    editUser: 'Editar Usuario',
    deleteUser: 'Eliminar Usuario',
    userName: 'Nombre',
    userEmail: 'Correo electrónico',
    userRole: 'Rol',
    roleAdmin: 'Administrador',
    roleUser: 'Usuario',
    confirmDelete: '¿Está seguro de que desea eliminar este usuario?',
    cancel: 'Cancelar',
    save: 'Guardar',

    // Settings
    settingsTitle: 'Configuración del Sistema',
    accessRestriction: 'Modo de Acceso Restringido',
    accessRestrictionDesc: 'Cuando está activado, el sitio solo puede accederse con usuario y contraseña.',
    publicAccess: 'Acceso Público',
    restrictedAccess: 'Acceso Restringido',
    settingsSaved: '¡Configuración guardada correctamente!',
  }
};

export default translations;
