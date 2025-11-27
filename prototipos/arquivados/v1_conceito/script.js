// Translations
const translations = {
    pt: {
        admin: "Administração",
        hero_title: "Seu Assistente Legislativo Inteligente",
        hero_subtitle: "Acompanhe proposições, fiscalize gastos e entenda a política com a ajuda de nossa equipe de agentes especializados.",
        welcome_msg: "Olá! Sou o Agente Cidadão. Como posso ajudar você a fiscalizar ou entender melhor o cenário político hoje?",
        input_placeholder: "Digite sua pergunta...",
        btn_send: "Consultar",
        footer_rights: "Todos os direitos reservados.",
        agent_status_waiting: "Aguardando...",
        agent_status_orchestrating: "Orquestrador analisando sua solicitação...",
        agent_status_legislative: "Agente Legislativo buscando leis e projetos...",
        agent_status_political: "Agente Político analisando contexto...",
        agent_status_fiscal: "Agente Fiscal verificando despesas...",
        agent_status_synthesizing: "Sintetizador compilando a resposta...",
        login_title: "Acesso Administrativo",
        login_btn: "Entrar",
        login_email: "Email",
        login_pass: "Senha"
    },
    es: {
        admin: "Administración",
        hero_title: "Su Asistente Legislativo Inteligente",
        hero_subtitle: "Siga propuestas, fiscalice gastos y entienda la política con la ayuda de nuestro equipo de agentes especializados.",
        welcome_msg: "¡Hola! Soy el Agente Ciudadano. ¿Cómo puedo ayudarle a fiscalizar o entender mejor el escenario político hoy?",
        input_placeholder: "Escriba su pregunta...",
        btn_send: "Consultar",
        footer_rights: "Todos los derechos reservados.",
        agent_status_waiting: "Esperando...",
        agent_status_orchestrating: "Orquestador analizando su solicitud...",
        agent_status_legislative: "Agente Legislativo buscando leyes y proyectos...",
        agent_status_political: "Agente Político analizando contexto...",
        agent_status_fiscal: "Agente Fiscal verificando gastos...",
        agent_status_synthesizing: "Sintetizador compilando la respuesta...",
        login_title: "Acceso Administrativo",
        login_btn: "Entrar",
        login_email: "Correo electrónico",
        login_pass: "Contraseña"
    }
};

let currentLang = 'pt';

function setLanguage(lang) {
    currentLang = lang;
    document.querySelectorAll('[data-i18n]').forEach(el => {
        const key = el.getAttribute('data-i18n');
        if (translations[lang][key]) {
            el.innerText = translations[lang][key];
        }
    });
    document.querySelectorAll('[data-i18n-placeholder]').forEach(el => {
        const key = el.getAttribute('data-i18n-placeholder');
        if (translations[lang][key]) {
            el.placeholder = translations[lang][key];
        }
    });

    // Update buttons
    document.getElementById('btn-pt').className = lang === 'pt' ? "px-3 py-1 rounded-md text-sm font-medium transition-all bg-slate-600 text-white shadow-sm" : "px-3 py-1 rounded-md text-sm font-medium transition-all text-slate-400 hover:text-white";
    document.getElementById('btn-es').className = lang === 'es' ? "px-3 py-1 rounded-md text-sm font-medium transition-all bg-slate-600 text-white shadow-sm" : "px-3 py-1 rounded-md text-sm font-medium transition-all text-slate-400 hover:text-white";
}

function fillInput(text) {
    document.getElementById('user-input').value = text;
}

// Chat & Animation Logic
document.getElementById('chat-form').addEventListener('submit', function(e) {
    e.preventDefault();
    const input = document.getElementById('user-input');
    const text = input.value.trim();
    if (!text) return;

    // Add user message
    addMessage(text, 'user');
    input.value = '';

    // Start Agent Sequence
    runAgentSequence();
});

function addMessage(text, sender) {
    const history = document.getElementById('chat-history');
    const div = document.createElement('div');
    div.className = `flex gap-4 items-start message-enter ${sender === 'user' ? 'flex-row-reverse' : ''}`;
    
    const avatar = sender === 'user' 
        ? `<div class="w-8 h-8 rounded-full bg-slate-600 flex items-center justify-center flex-shrink-0">
            <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5 text-white" viewBox="0 0 20 20" fill="currentColor">
                <path fill-rule="evenodd" d="M10 9a3 3 0 100-6 3 3 0 000 6zm-7 9a7 7 0 1114 0H3z" clip-rule="evenodd" />
            </svg>
           </div>`
        : `<div class="w-8 h-8 rounded-full bg-emerald-500 flex items-center justify-center flex-shrink-0">
            <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5 text-white" viewBox="0 0 20 20" fill="currentColor">
                <path fill-rule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-8.707l-3-3a1 1 0 00-1.414 1.414L10.586 9H7a1 1 0 100 2h3.586l-1.293 1.293a1 1 0 101.414 1.414l3-3a1 1 0 000-1.414z" clip-rule="evenodd" />
            </svg>
           </div>`;

    const bubbleColor = sender === 'user' ? 'bg-blue-600' : 'bg-slate-800 border border-slate-700';
    
    div.innerHTML = `
        ${avatar}
        <div class="${bubbleColor} p-4 rounded-2xl ${sender === 'user' ? 'rounded-tr-none' : 'rounded-tl-none'} max-w-[80%]">
            <p class="text-slate-200">${text}</p>
        </div>
    `;
    
    history.appendChild(div);
    history.scrollTop = history.scrollHeight;
}

async function runAgentSequence() {
    const stage = document.getElementById('agent-stage');
    const statusText = document.getElementById('agent-status-text');
    stage.classList.remove('hidden');
    
    // Helper to reset agents
    const resetAgents = () => {
        document.querySelectorAll('.agent-card').forEach(el => {
            el.classList.remove('active', 'opacity-100', 'scale-100');
            el.classList.add('opacity-30', 'scale-90', 'hidden');
        });
    };

    const activateAgent = (id, textKey) => {
        resetAgents();
        const agent = document.getElementById(id);
        agent.classList.remove('hidden', 'opacity-30', 'scale-90');
        agent.classList.add('active', 'opacity-100', 'scale-100');
        statusText.innerText = translations[currentLang][textKey];
    };

    // 1. Orchestrator
    activateAgent('agent-orchestrator', 'agent_status_orchestrating');
    await wait(2000);

    // 2. Parallel Agents (Simulated sequential for visual clarity)
    // Randomly pick one or two to show "work"
    activateAgent('agent-legislative', 'agent_status_legislative');
    await wait(2000);
    
    activateAgent('agent-fiscal', 'agent_status_fiscal');
    await wait(2000);

    // 3. Synthesizer
    activateAgent('agent-synthesizer', 'agent_status_synthesizing');
    await wait(2000);

    // Finish
    resetAgents();
    stage.classList.add('hidden');
    statusText.innerText = translations[currentLang]['agent_status_waiting'];
    
    addMessage("Esta é uma resposta simulada do protótipo. No sistema real, os agentes teriam processado sua consulta e retornado dados reais.", 'agent');
}

function wait(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
}
