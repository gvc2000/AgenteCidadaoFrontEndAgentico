import { useState } from 'react';
import { BrowserRouter as Router, Routes, Route, Link } from 'react-router-dom';
import { Shield, LayoutDashboard } from 'lucide-react';
import { ChatInterface } from './components/ChatInterface';
import { AgentStatus, type AgentState } from './components/AgentStatus';
import { supabase } from './lib/supabase';

import { AdminPage } from './pages/Admin';

function App() {
  const [messages, setMessages] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [agents, setAgents] = useState<AgentState[]>([
    { id: 'orchestrator', name: 'Orquestrador', status: 'idle', message: '' },
    { id: 'legislative', name: 'Legislativo', status: 'idle', message: '' },
    { id: 'political', name: 'Político', status: 'idle', message: '' },
    { id: 'fiscal', name: 'Fiscal', status: 'idle', message: '' },
    { id: 'consolidator', name: 'Consolidador', status: 'idle', message: '' },
  ]);

  // Global timeout for entire workflow (2 minutes)
  const [workflowTimeoutId, setWorkflowTimeoutId] = useState<number | null>(null);

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
      // Note: Database expects 'user_query', not 'content'
      const { data, error } = await supabase
        .from('requests')
        .insert([{ user_query: content, status: 'pending' }])
        .select()
        .single();

      if (error) throw error;

      const requestId = data.id;

      // Setup global timeout (2 minutes)
      const timeoutId = setTimeout(() => {
        console.error('⏱️ Workflow timeout exceeded (120s)');
        setIsLoading(false);

        // Mark all non-completed agents as timeout
        setAgents(prev => prev.map(a => {
          if (a.status === 'working' || a.status === 'info') {
            return { ...a, status: 'error', message: 'Timeout: operação demorou muito' };
          }
          return a;
        }));

        // Add error message
        setMessages(prev => [...prev, {
          id: Date.now().toString(),
          role: 'assistant',
          content: '⏱️ **Tempo esgotado**: A operação demorou mais de 2 minutos e foi cancelada. Por favor, tente novamente ou reformule sua pergunta.',
          timestamp: new Date()
        }]);

        // Cleanup channels
        supabase.removeChannel(logsChannel);
        supabase.removeChannel(requestChannel);
      }, 120000); // 2 minutes

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

            // Support both agent_id (schema) and agent_name (n8n default)
            const idToUse = log.agent_id || log.agent_name;
            console.log('🎯 Agent ID to use:', idToUse);

            if (idToUse) {
              updateAgentStatus(idToUse, log.status, log.message);
            } else {
              console.warn('⚠️ No agent identifier found in log:', log);
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

            // Handle completion
            if (updatedRequest.status === 'completed' && updatedRequest.final_response) {
              // Clear timeout
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
              // Mark all agents as completed
              setAgents(prev => prev.map(a => ({ ...a, status: 'completed', message: 'Concluído' })));

              // Cleanup channels
              supabase.removeChannel(logsChannel);
              supabase.removeChannel(requestChannel);
            }

            // Handle errors
            if (updatedRequest.status === 'failed' || updatedRequest.status === 'error') {
              // Clear timeout
              if (workflowTimeoutId) {
                clearTimeout(workflowTimeoutId);
                setWorkflowTimeoutId(null);
              }

              setIsLoading(false);

              // Mark all working agents as error
              setAgents(prev => prev.map(a => {
                if (a.status === 'working' || a.status === 'info') {
                  return { ...a, status: 'error', message: 'Falha na execução' };
                }
                return a;
              }));

              setMessages(prev => [...prev, {
                id: Date.now().toString(),
                role: 'assistant',
                content: `❌ **Erro no processamento**: ${updatedRequest.error_message || 'Ocorreu um erro inesperado. Por favor, tente novamente.'}`,
                timestamp: new Date()
              }]);

              // Cleanup channels
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
          // Don't throw here to avoid breaking the UI flow, but log it clearly
          setMessages(prev => [...prev, {
            id: Date.now().toString(),
            role: 'assistant',
            content: `Erro de comunicação com o Agente: ${(fetchError as Error).message}. Verifique o console para mais detalhes.`,
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
        content: `Erro ao enviar solicitação: ${errorMessage}. (Verifique o console para detalhes técnicos)`,
        timestamp: new Date()
      }]);
    }
  };

  const updateAgentStatus = (agentId: string, status: string, message: string) => {
    // Map n8n agent names to frontend IDs
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
        // Se está começando a trabalhar, adiciona startTime
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
    <Router>
      <div className="min-h-screen bg-[var(--bg-primary)] flex flex-col">
        {/* Header */}
        <header className="bg-white border-b border-slate-200 sticky top-0 z-50">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="bg-[var(--camara-green)] p-2 rounded-lg">
                <Shield className="text-white" size={24} />
              </div>
              <div>
                <h1 className="text-xl font-bold text-[var(--camara-green-dark)] tracking-tight">Agente Cidadão</h1>
                <p className="text-xs text-slate-500 font-medium">Transparência Legislativa com IA</p>
              </div>
            </div>

            <nav className="flex items-center gap-4">
              <Link to="/" className="text-sm font-medium text-slate-600 hover:text-[var(--camara-green)] transition-colors">Chat</Link>
              <Link to="/admin" className="flex items-center gap-2 text-sm font-medium text-slate-600 hover:text-[var(--camara-green)] transition-colors">
                <LayoutDashboard size={16} />
                Admin
              </Link>
            </nav>
          </div>
        </header>

        {/* Main Content */}
        <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <Routes>
            <Route path="/" element={
              <div className="flex flex-col h-[calc(100vh-8rem)]">
                <AgentStatus agents={agents} />
                <div className="flex-1 min-h-0">
                  <ChatInterface
                    messages={messages}
                    onSendMessage={handleSendMessage}
                    isLoading={isLoading}
                  />
                </div>
              </div>
            } />
            <Route path="/admin" element={<AdminPage />} />
          </Routes>
        </main>
      </div>
    </Router>
  );
}

export default App;
