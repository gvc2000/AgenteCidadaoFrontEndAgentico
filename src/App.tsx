import { useState, useRef } from 'react';
import { BrowserRouter as Router, Routes, Route, Link } from 'react-router-dom';
import { Shield, Bot } from 'lucide-react';
import { ChatInterface } from './components/ChatInterface';
import { AgentStatus, type AgentState } from './components/AgentStatus';
import { SidebarExamples } from './components/SidebarExamples';
import { SidebarDataSources } from './components/SidebarDataSources';
import { LanguageSelector } from './components/LanguageSelector';
import { LanguageProvider, useTranslation } from './i18n';
import { supabase } from './lib/supabase';

import { AdminPage } from './pages/Admin';

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

  // Global timeout for entire workflow (2 minutes)
  const [workflowTimeoutId, setWorkflowTimeoutId] = useState<number | null>(null);

  const handleExampleClick = (question: string) => {
    setInputValue(question);
    inputRef.current?.focus();
  };

  const handleSendMessage = async (content: string) => {
    // Clear any existing timeout
    if (workflowTimeoutId) {
      clearTimeout(workflowTimeoutId);
    }

    // Add user message
    const userMsg = { id: Date.now().toString(), role: 'user', content, timestamp: new Date() };
    setMessages(prev => [...prev, userMsg]);
    setIsLoading(true);

    // Reset agents
    setAgents(prev => prev.map(a => ({ ...a, status: 'idle', message: '', startTime: undefined })));

    try {
      // 1. Create request in Supabase
      const { data, error } = await supabase
        .from('requests')
        .insert([{ user_query: content, status: 'pending' }])
        .select()
        .single();

      if (error) throw error;

      const requestId = data.id;

      // Setup global timeout (240 seconds / 4 minutes)
      const timeoutId = setTimeout(() => {
        console.error('⏱️ Workflow timeout exceeded (240s)');
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

        // Cleanup channels
        supabase.removeChannel(logsChannel);
        supabase.removeChannel(requestChannel);
      }, 240000);

      setWorkflowTimeoutId(timeoutId);

      // 2. Subscribe to agent_logs (Realtime)
      const logsChannel = supabase
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

              if (log.status === 'error' || log.message?.toLowerCase().includes('erro')) {
                console.error('❌ Error detected in agent log:', log);

                if (workflowTimeoutId) {
                  clearTimeout(workflowTimeoutId);
                  setWorkflowTimeoutId(null);
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

                supabase.removeChannel(logsChannel);
                supabase.removeChannel(requestChannel);
              }
            }
          }
        )
        .subscribe((status) => {
          console.log('📡 Realtime Subscription Status:', status);
        });

      // 3. Subscribe to requests updates (Final Answer)
      const requestChannel = supabase
        .channel(`req-${requestId}`)
        .on(
          'postgres_changes',
          { event: 'UPDATE', schema: 'public', table: 'requests', filter: `id=eq.${requestId}` },
          (payload) => {
            const updatedRequest = payload.new;

            if (updatedRequest.status === 'completed' && updatedRequest.final_response) {
              if (workflowTimeoutId) {
                clearTimeout(workflowTimeoutId);
                setWorkflowTimeoutId(null);
              }

              setIsLoading(false);
              setMessages(prev => [...prev, {
                id: Date.now().toString(),
                role: 'assistant',
                content: updatedRequest.final_response,
                timestamp: new Date()
              }]);
              setAgents(prev => prev.map(a => ({ ...a, status: 'completed', message: t.statusCompleted })));

              supabase.removeChannel(logsChannel);
              supabase.removeChannel(requestChannel);
            }

            if (updatedRequest.status === 'failed' || updatedRequest.status === 'error') {
              if (workflowTimeoutId) {
                clearTimeout(workflowTimeoutId);
                setWorkflowTimeoutId(null);
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

              supabase.removeChannel(logsChannel);
              supabase.removeChannel(requestChannel);
            }
          }
        )
        .subscribe();

      // 4. Trigger n8n Webhook
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
                content: content
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
      'Orquestrador': 'orchestrator',
      'Legislativo': 'legislative',
      'Político': 'political',
      'Politico': 'political',
      'Fiscal': 'fiscal',
      'Sintetizador': 'consolidator'
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
