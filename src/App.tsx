import { useState, useRef, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Link } from 'react-router-dom';
import { Shield, Bot, RefreshCw } from 'lucide-react';
import { ChatInterface } from './components/ChatInterface';
import { AgentStatus, type AgentState } from './components/AgentStatus';
import { SidebarExamples } from './components/SidebarExamples';
import { SidebarDataSources } from './components/SidebarDataSources';
import { LanguageSelector } from './components/LanguageSelector';
import { LanguageProvider, useTranslation } from './i18n';
import { supabase } from './lib/supabase';
import { sessionManager } from './lib/sessionManager';

import { AdminPage } from './pages/Admin';

// Feature flag para memória conversacional
const MEMORY_ENABLED = import.meta.env.VITE_ENABLE_CONVERSATION_MEMORY === 'true';

function MainApp() {
  const { t } = useTranslation();
  const [messages, setMessages] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [inputValue, setInputValue] = useState('');
  const inputRef = useRef<HTMLInputElement>(null);
  const [agents, setAgents] = useState<AgentState[]>([
    { id: 'orchestrator', name: 'Orquestrador', status: 'idle', message: '' },
    { id: 'legislative', name: 'Legislativo', status: 'idle', message: '' },
    { id: 'political', name: 'Político', status: 'idle', message: '' },
    { id: 'fiscal', name: 'Fiscal', status: 'idle', message: '' },
    { id: 'consolidator', name: 'Consolidador', status: 'idle', message: '' },
  ]);

  // Global timeout for entire workflow (6 minutes) - using ref to avoid stale closure
  const workflowTimeoutRef = useRef<number | null>(null);

  // Polling interval ref for cleanup
  const pollingIntervalRef = useRef<number | null>(null);

  // Memória conversacional
  const [conversationId, setConversationId] = useState<string | null>(null);

  // Inicializar conversa quando memória está habilitada
  useEffect(() => {
    if (!MEMORY_ENABLED) return;

    const initConversation = async () => {
      try {
        console.log('🧠 Inicializando memória conversacional...');
        const convId = await sessionManager.getOrCreateConversation(supabase);
        setConversationId(convId);
        console.log('✅ Conversa inicializada:', convId);

        // Carregar histórico existente
        const history = await sessionManager.getConversationHistory(supabase, convId);
        if (history.length > 0) {
          console.log('📜 Carregando histórico:', history.length, 'mensagens');
          setMessages(history.map(msg => ({
            id: msg.id,
            role: msg.role,
            content: sessionManager.cleanResponseContent(msg.content),
            timestamp: new Date(msg.created_at)
          })));
        }
      } catch (error) {
        console.error('❌ Erro ao inicializar conversa:', error);
      }
    };

    initConversation();
  }, []);

  const handleExampleClick = (question: string) => {
    setInputValue(question);
    inputRef.current?.focus();
  };

  // Função para iniciar nova conversa
  const handleNewConversation = async () => {
    // Limpar sessão no localStorage
    sessionManager.clearSession();

    // Limpar estado local
    setMessages([]);
    setConversationId(null);
    setInputValue('');
    setAgents(prev => prev.map(a => ({ ...a, status: 'idle', message: '', startTime: undefined })));

    // Criar nova conversa se memória estiver habilitada
    if (MEMORY_ENABLED) {
      try {
        console.log('🆕 Iniciando nova conversa...');
        const newConvId = await sessionManager.getOrCreateConversation(supabase);
        setConversationId(newConvId);
        console.log('✅ Nova conversa criada:', newConvId);
      } catch (error) {
        console.error('❌ Erro ao criar nova conversa:', error);
      }
    }
  };

  const handleSendMessage = async (content: string) => {
    // Clear any existing timeout
    if (workflowTimeoutRef.current) {
      clearTimeout(workflowTimeoutRef.current);
    }

    // Add user message
    const userMsg = { id: Date.now().toString(), role: 'user', content, timestamp: new Date() };
    setMessages(prev => [...prev, userMsg]);
    setIsLoading(true);

    // Reset agents
    setAgents(prev => prev.map(a => ({ ...a, status: 'idle', message: '', startTime: undefined })));

    try {
      // Construir contexto se memória estiver habilitada
      let context = {};

      if (MEMORY_ENABLED && conversationId) {
        console.log('🧠 Memória ativada - salvando mensagem do usuário...');
        await sessionManager.saveMessage(supabase, conversationId, 'user', content);

        const history = await sessionManager.getConversationHistory(supabase, conversationId, 10);
        context = sessionManager.buildContext(history);
        console.log('📋 Contexto construído:', context);
      }

      // 1. Create request in Supabase
      const { data, error } = await supabase
        .from('requests')
        .insert([{
          user_query: content,
          status: 'pending',
          conversation_id: MEMORY_ENABLED ? conversationId : null,
          context: context
        }])
        .select()
        .single();

      if (error) throw error;

      const requestId = data.id;

      // Setup global timeout (360 seconds / 6 minutes) - safety net for n8n failures
      const timeoutId = setTimeout(() => {
        console.error('⏱️ Workflow timeout exceeded (360s)');
        setIsLoading(false);

        // Mark all non-completed agents as timeout
        setAgents(prev => prev.map(a => {
          if (a.status === 'working' || a.status === 'info') {
            return { ...a, status: 'timeout', message: t.timeoutMessage };
          }
          return a;
        }));

        // Add error message
        setMessages(prev => [...prev, {
          id: Date.now().toString(),
          role: 'assistant',
          content: `⏱️ **${t.timeoutMessage}**`,
          timestamp: new Date()
        }]);

        // Cleanup channels and polling
        if (pollingIntervalRef.current) clearInterval(pollingIntervalRef.current);
        supabase.removeChannel(logsChannel);
        supabase.removeChannel(requestChannel);
      }, 360000);

      workflowTimeoutRef.current = timeoutId;

      // 2. Subscribe to agent_logs (Realtime) - Declare channels first
      let logsChannel: ReturnType<typeof supabase.channel>;
      let requestChannel: ReturnType<typeof supabase.channel>;

      // Create a promise that resolves when both subscriptions are ready
      const subscriptionsReady = new Promise<void>((resolve) => {
        let logsReady = false;
        let requestReady = false;

        const checkBothReady = () => {
          if (logsReady && requestReady) {
            console.log('✅ Both Realtime subscriptions are active');
            resolve();
          }
        };

        logsChannel = supabase
          .channel(`logs-${requestId}`)
          .on(
            'postgres_changes',
            { event: 'INSERT', schema: 'public', table: 'agent_logs', filter: `request_id=eq.${requestId}` },
            (payload) => {
              console.log('🔄 Realtime Payload:', payload);
              const log = payload.new;

              const idToUse = log.agent_id || log.agent_name;
              console.log('🎯 Agent ID to use:', idToUse);

              if (idToUse) {
                updateAgentStatus(idToUse, log.status, log.message);

                if (log.status === 'error' ||
                  log.message?.toLowerCase().includes('erro') ||
                  log.message?.toLowerCase().includes('failed') ||
                  log.message?.toLowerCase().includes('syntaxerror')) {
                  console.error('❌ Error detected in agent log:', log);

                  if (workflowTimeoutRef.current) {
                    clearTimeout(workflowTimeoutRef.current);
                    workflowTimeoutRef.current = null;
                  }

                  setIsLoading(false);

                  setTimeout(() => {
                    setMessages(prev => {
                      const lastMessage = prev[prev.length - 1];
                      if (lastMessage?.role !== 'assistant' || !lastMessage.content.includes('❌')) {
                        return [...prev, {
                          id: Date.now().toString(),
                          role: 'assistant',
                          content: `❌ **${t.errorMessage}**: ${log.message || t.errorMessage}`,
                          timestamp: new Date()
                        }];
                      }
                      return prev;
                    });
                  }, 1000);

                  if (pollingIntervalRef.current) clearInterval(pollingIntervalRef.current);
                  supabase.removeChannel(logsChannel);
                  supabase.removeChannel(requestChannel);
                }
              }
            }
          )
          .subscribe((status) => {
            console.log('📡 Logs Subscription Status:', status);
            if (status === 'SUBSCRIBED') {
              logsReady = true;
              checkBothReady();
            }
          });

        // 3. Subscribe to requests updates (Final Answer)
        requestChannel = supabase
          .channel(`req-${requestId}`)
          .on(
            'postgres_changes',
            { event: 'UPDATE', schema: 'public', table: 'requests', filter: `id=eq.${requestId}` },
            async (payload) => {
              const updatedRequest = payload.new;

              if (updatedRequest.status === 'completed' && updatedRequest.final_response) {
                if (workflowTimeoutRef.current) {
                  clearTimeout(workflowTimeoutRef.current);
                  workflowTimeoutRef.current = null;
                }

                setIsLoading(false);

                // Processar resposta (extrair entidades e limpar)
                const rawResponse = updatedRequest.final_response;
                console.log('📨 Resposta RAW (primeiros 500 chars):', rawResponse?.substring(0, 500));
                console.log('🔍 Contém bloco ENTITIES?:', rawResponse?.includes('<!-- ENTITIES'));
                const cleanResponse = sessionManager.cleanResponseContent(rawResponse);

                // Salvar resposta do assistente com entidades extraídas
                if (MEMORY_ENABLED && conversationId) {
                  const entities = sessionManager.extractEntitiesFromResponse(rawResponse);
                  console.log('🏷️ Entidades extraídas:', entities);
                  await sessionManager.saveMessage(
                    supabase,
                    conversationId,
                    'assistant',
                    rawResponse,
                    entities,
                    requestId
                  );
                }

                setMessages(prev => [...prev, {
                  id: Date.now().toString(),
                  role: 'assistant',
                  content: cleanResponse,
                  timestamp: new Date()
                }]);
                setAgents(prev => prev.map(a => ({ ...a, status: 'completed', message: t.statusCompleted })));

                // Cleanup polling and channels
                if (pollingIntervalRef.current) clearInterval(pollingIntervalRef.current);
                supabase.removeChannel(logsChannel);
                supabase.removeChannel(requestChannel);
              }

              if (updatedRequest.status === 'failed' || updatedRequest.status === 'error') {
                if (workflowTimeoutRef.current) {
                  clearTimeout(workflowTimeoutRef.current);
                  workflowTimeoutRef.current = null;
                }

                setIsLoading(false);

                setAgents(prev => prev.map(a => {
                  if (a.status === 'working' || a.status === 'info') {
                    return { ...a, status: 'error', message: t.statusError };
                  }
                  return a;
                }));

                setMessages(prev => [...prev, {
                  id: Date.now().toString(),
                  role: 'assistant',
                  content: `❌ **${t.errorMessage}**: ${updatedRequest.error_message || t.errorMessage}`,
                  timestamp: new Date()
                }]);

                // Cleanup polling and channels
                if (pollingIntervalRef.current) clearInterval(pollingIntervalRef.current);
                supabase.removeChannel(logsChannel);
                supabase.removeChannel(requestChannel);
              }
            }
          )
          .subscribe((status) => {
            console.log('📡 Request Subscription Status:', status);
            if (status === 'SUBSCRIBED') {
              requestReady = true;
              checkBothReady();
            }
          });
      });

      // 4. Wait for subscriptions to be ready, then trigger n8n Webhook
      await subscriptionsReady;

      // 4.1 Fetch existing logs that may have arrived before subscription was ready
      const { data: existingLogs } = await supabase
        .from('agent_logs')
        .select('*')
        .eq('request_id', requestId)
        .order('created_at', { ascending: true });

      if (existingLogs && existingLogs.length > 0) {
        console.log('📋 Processando logs existentes:', existingLogs.length);
        existingLogs.forEach(log => {
          const idToUse = log.agent_id || log.agent_name;
          if (idToUse) {
            updateAgentStatus(idToUse, log.status, log.message);
          }
        });
      }

      // 4.2 Start polling for logs as backup for Realtime (fixes cold start issue)
      const processedLogIds = new Set<string>(existingLogs?.map(l => l.id) || []);
      pollingIntervalRef.current = window.setInterval(async () => {
        try {
          const { data: newLogs } = await supabase
            .from('agent_logs')
            .select('*')
            .eq('request_id', requestId)
            .order('created_at', { ascending: true });

          if (newLogs) {
            newLogs.forEach(log => {
              if (!processedLogIds.has(log.id)) {
                processedLogIds.add(log.id);
                const idToUse = log.agent_id || log.agent_name;
                if (idToUse) {
                  console.log('🔄 Polling encontrou novo log:', idToUse, log.status);
                  updateAgentStatus(idToUse, log.status, log.message);
                }
              }
            });
          }
        } catch (err) {
          console.warn('Polling error (non-critical):', err);
        }
      }, 2000); // Poll every 2 seconds

      const n8nUrl = import.meta.env.VITE_N8N_WEBHOOK_URL;
      console.log('Attempting to call n8n webhook:', n8nUrl);

      if (n8nUrl) {
        try {
          const response = await fetch(n8nUrl, {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({
              record: {
                id: requestId,
                content: content,
                conversation_id: MEMORY_ENABLED ? conversationId : null,
                context: context
              }
            }),
          });

          console.log('n8n response status:', response.status);

          if (!response.ok) {
            const errorText = await response.text();
            console.error('n8n webhook failed:', response.status, errorText);
            throw new Error(`n8n webhook failed: ${response.status} ${errorText}`);
          } else {
            console.log('n8n webhook success');
          }
        } catch (fetchError) {
          console.error('Network error calling n8n:', fetchError);
          setMessages(prev => [...prev, {
            id: Date.now().toString(),
            role: 'assistant',
            content: `${t.networkError}: ${(fetchError as Error).message}`,
            timestamp: new Date()
          }]);
        }
      } else {
        console.warn('VITE_N8N_WEBHOOK_URL not set');
      }

    } catch (err) {
      console.error('Error sending message:', err);
      setIsLoading(false);
      const errorMessage = err instanceof Error ? err.message : JSON.stringify(err);
      setMessages(prev => [...prev, {
        id: Date.now().toString(),
        role: 'assistant',
        content: `${t.errorMessage}: ${errorMessage}`,
        timestamp: new Date()
      }]);
    }
  };

  const updateAgentStatus = (agentId: string, status: string, message: string) => {
    const agentMap: Record<string, string> = {
      // Orquestrador
      'Orquestrador': 'orchestrator',
      'orquestrador': 'orchestrator',
      'orchestrator': 'orchestrator',
      // Legislativo
      'Legislativo': 'legislative',
      'legislativo': 'legislative',
      'legislative': 'legislative',
      // Político
      'Político': 'political',
      'Politico': 'political',
      'político': 'political',
      'politico': 'political',
      'political': 'political',
      // Fiscal
      'Fiscal': 'fiscal',
      'fiscal': 'fiscal',
      // Consolidador/Sintetizador
      'Sintetizador': 'consolidator',
      'sintetizador': 'consolidator',
      'Consolidador': 'consolidator',
      'consolidador': 'consolidator',
      'consolidator': 'consolidator',
    };

    const normalizedId = agentMap[agentId] || agentId.toLowerCase();

    setAgents(prev => prev.map(a => {
      if (a.id === normalizedId) {
        const isStartingWork = (status === 'working' || status === 'info') && a.status !== 'working' && a.status !== 'info';
        return {
          ...a,
          status: status as any,
          message,
          startTime: isStartingWork ? Date.now() : a.startTime
        };
      }
      return a;
    }));
  };

  return (
    <div className="min-h-screen bg-[var(--bg-primary)] flex flex-col">
      {/* Header - Compact */}
      <header className="header">
        <div className="header-content">
          <div className="logo-section">
            <Link to="/" className="app-logo">
              <div className="app-icon">
                <Bot size={24} />
              </div>
              <div className="app-title">
                <h1>{t.appTitle}</h1>
                <p>{t.appSubtitle}</p>
              </div>
            </Link>
          </div>

          {/* Official Data Badge */}
          <div className="official-badge">
            <Shield size={18} />
            <div>
              <span className="badge-title">{t.officialData}</span>
              <span className="badge-subtitle">{t.directConsult}</span>
            </div>
          </div>

          <div className="header-actions">
            <button
              onClick={handleNewConversation}
              className="new-conversation-btn"
              title={t.newConversation}
            >
              <RefreshCw size={16} />
              <span>{t.newConversation}</span>
            </button>
            <LanguageSelector />
          </div>
        </div>
      </header>

      {/* Main Content */}
      <Routes>
        <Route path="/" element={
          <>
            <main className="main-container flex-1">
              {/* Left Sidebar - Examples */}
              <SidebarExamples onExampleClick={handleExampleClick} />

              {/* Center - Chat */}
              <div className="flex flex-col gap-4">
                <AgentStatus agents={agents} />
                <ChatInterface
                  messages={messages}
                  onSendMessage={handleSendMessage}
                  isLoading={isLoading}
                  inputValue={inputValue}
                  onInputChange={setInputValue}
                  inputRef={inputRef}
                />
              </div>

              {/* Right Sidebar - Data Sources */}
              <SidebarDataSources />
            </main>

            {/* Footer */}
            <footer className="footer">
              <div className="footer-content">
                <p>{t.footerText}</p>
                <div className="footer-links">
                  <a href="https://dadosabertos.camara.leg.br/" target="_blank" rel="noopener noreferrer" className="footer-link">
                    {t.openDataPortal}
                  </a>
                  <a href="https://dadosabertos.camara.leg.br/swagger/api.html" target="_blank" rel="noopener noreferrer" className="footer-link">
                    {t.apiDocsLink}
                  </a>
                  <Link to="/admin" className="footer-link">
                    {t.navAdmin}
                  </Link>
                </div>
                <p style={{ marginTop: '0.5rem', fontSize: '0.75rem', opacity: 0.8 }}>
                  {t.footerNote}
                </p>
              </div>
            </footer>
          </>
        } />
        <Route path="/admin" element={<AdminPage />} />
      </Routes>
    </div>
  );
}

function App() {
  return (
    <LanguageProvider>
      <Router>
        <MainApp />
      </Router>
    </LanguageProvider>
  );
}

export default App;
