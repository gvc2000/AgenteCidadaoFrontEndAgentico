import React, { useState, useEffect } from 'react';
import { CheckCircle2, Clock, AlertCircle, Loader2 } from 'lucide-react';
import { RobotAnimation } from './RobotAnimation';
import { useTranslation } from '../i18n';
import type { AgentState } from '../types/agent';

// Re-export types for backward compatibility
export type { AgentType, AgentState } from '../types/agent';

interface AgentStatusProps {
    agents: AgentState[];
}

interface AgentCardProps {
    agent: AgentState;
    isActive: boolean;
}

const AgentCard: React.FC<AgentCardProps> = ({ agent, isActive }) => {
    const { t } = useTranslation();
    const [elapsed, setElapsed] = useState(0);
    const startTimeRef = React.useRef<number | null>(null);
    const prevStatusRef = React.useRef<string>(agent.status);

    const isWorking = agent.status === 'working' || agent.status === 'info';
    const isCompleted = agent.status === 'completed';
    const isError = agent.status === 'error' || agent.status === 'timeout';
    const isIdle = agent.status === 'idle';

    // Reset timer when status changes to working from idle
    useEffect(() => {
        const wasIdle = prevStatusRef.current === 'idle';
        const nowWorking = isWorking;

        if (wasIdle && nowWorking) {
            // Starting new work - reset timer
            startTimeRef.current = Date.now();
            setElapsed(0);
        }

        if (isIdle) {
            // Reset everything when going back to idle
            startTimeRef.current = null;
            setElapsed(0);
        }

        prevStatusRef.current = agent.status;
    }, [agent.status, isWorking, isIdle]);

    // Timer effect for working state
    useEffect(() => {
        let interval: number | undefined;
        if (isWorking && startTimeRef.current) {
            interval = window.setInterval(() => {
                if (startTimeRef.current) {
                    setElapsed(Math.floor((Date.now() - startTimeRef.current) / 1000));
                }
            }, 1000);
        }
        return () => {
            if (interval) clearInterval(interval);
        };
    }, [isWorking]);

    const getStatusText = () => {
        if (isCompleted) return t.statusCompleted;
        if (isWorking) return t.statusWorking;
        if (agent.status === 'timeout') return t.statusTimeout;
        if (isError) return t.statusError;
        return t.statusIdle;
    };

    const getStatusIcon = () => {
        if (isCompleted) return <CheckCircle2 size={14} className="text-green-500" />;
        if (isWorking) return <Loader2 size={14} className="text-[var(--verde-primario)] animate-spin" />;
        if (isError) return <AlertCircle size={14} className="text-red-500" />;
        return <Clock size={14} className="text-slate-400" />;
    };

    const getMessage = () => {
        if (agent.message) return agent.message;
        if (isCompleted) return t.agentCompleted || 'Análise concluída.';
        if (isWorking) return t.agentAnalyzing || 'Iniciando análise...';
        return t.agentWaiting || 'Aguardando tarefas...';
    };

    return (
        <div className={`agent-card-enhanced ${isActive ? 'agent-active' : ''} ${isCompleted ? 'agent-completed' : ''} ${isError ? 'agent-error' : ''}`}>
            {/* Header with robot and status */}
            <div className="agent-card-header">
                <RobotAnimation
                    agentType={agent.id}
                    status={agent.status}
                    size={32}
                />
                <div className="agent-card-info">
                    <h3>{agent.name}</h3>
                    <div className="agent-status-row-info">
                        {getStatusIcon()}
                        <span className={`status-label ${isWorking ? 'status-working' : isCompleted ? 'status-completed' : isError ? 'status-error' : ''}`}>
                            {getStatusText()}
                        </span>
                        {isWorking && (
                            <span className="elapsed-time">{elapsed}s</span>
                        )}
                    </div>
                </div>
            </div>

            {/* Progress bar for working state */}
            {isWorking && (
                <div className="agent-progress-bar">
                    <div className="agent-progress-fill"></div>
                </div>
            )}

            {/* Message */}
            <p className="agent-message">{getMessage()}</p>
        </div>
    );
};

export const AgentStatus: React.FC<AgentStatusProps> = ({ agents }) => {
    // Find if any agent is currently working
    const activeAgent = agents.find(a => a.status === 'working' || a.status === 'info');

    return (
        <div className="agent-status-container-enhanced">
            <h2 className="agent-status-title">Agentes de IA trabalhando para o cidadão</h2>
            <div className="agent-status-grid">
                {agents.map((agent) => (
                    <AgentCard
                        key={agent.id}
                        agent={agent}
                        isActive={activeAgent?.id === agent.id}
                    />
                ))}
            </div>
        </div>
    );
};
