import React, { useEffect, useState } from 'react';
import { Bot, Scale, Landmark, DollarSign, CheckCircle2, Clock, FileText, AlertCircle, Loader2 } from 'lucide-react';

export type AgentType = 'orchestrator' | 'legislative' | 'political' | 'fiscal' | 'consolidator';

export interface AgentState {
    id: AgentType;
    name: string;
    status: 'idle' | 'working' | 'info' | 'completed' | 'error' | 'timeout';
    message: string;
    startTime?: number;
}

interface AgentStatusProps {
    agents: AgentState[];
}

const iconMap = {
    orchestrator: Bot,
    legislative: Scale,
    political: Landmark,
    fiscal: DollarSign,
    consolidator: FileText,
};

const AgentCard: React.FC<{ agent: AgentState }> = ({ agent }) => {
    const Icon = iconMap[agent.id];
    const [elapsed, setElapsed] = useState(0);
    const [isStalled, setIsStalled] = useState(false);

    // Treat 'info' as working for animation purposes
    const isWorking = agent.status === 'working' || agent.status === 'info';
    const isCompleted = agent.status === 'completed';
    const isError = agent.status === 'error' || agent.status === 'timeout';
    const isTimeout = agent.status === 'timeout';

    // Timer for working agents + stall detection
    useEffect(() => {
        if (isWorking && agent.startTime) {
            const interval = setInterval(() => {
                const currentElapsed = Math.floor((Date.now() - agent.startTime!) / 1000);
                setElapsed(currentElapsed);

                // Warn if agent is taking too long (>45 seconds)
                if (currentElapsed > 45 && !isStalled) {
                    setIsStalled(true);
                }
            }, 1000);
            return () => clearInterval(interval);
        } else {
            setElapsed(0);
            setIsStalled(false);
        }
    }, [isWorking, agent.startTime, isStalled]);

    return (
        <div
            className={`
                relative overflow-hidden rounded-xl p-4 border transition-all duration-500 transform
                ${isWorking && !isStalled ? 'border-[var(--camara-green)] bg-gradient-to-br from-green-50 to-emerald-50 shadow-lg scale-105 ring-2 ring-[var(--camara-green)]/20' : ''}
                ${isWorking && isStalled ? 'border-yellow-400 bg-gradient-to-br from-yellow-50 to-orange-50 shadow-lg scale-105 ring-2 ring-yellow-400/30' : ''}
                ${isCompleted ? 'border-green-300 bg-green-50/70 shadow-md' : ''}
                ${isError && !isTimeout ? 'border-red-300 bg-red-50/70 shadow-md' : ''}
                ${isTimeout ? 'border-orange-300 bg-orange-50/70 shadow-md' : ''}
                ${!isWorking && !isCompleted && !isError ? 'border-slate-200 bg-white' : ''}
            `}
        >
            {/* Animated Background Gradient */}
            {isWorking && (
                <>
                    <div className="absolute inset-0 bg-gradient-to-r from-green-100/40 via-emerald-100/40 to-green-100/40 animate-gradient-x" />
                    <div className="absolute inset-0">
                        <div className="h-1 bg-gradient-to-r from-[var(--camara-green)]/0 via-[var(--camara-green)] to-[var(--camara-green)]/0 animate-shimmer"
                             style={{ width: '30%', position: 'absolute', top: 0 }} />
                    </div>
                </>
            )}

            {/* Success Checkmark Animation */}
            {isCompleted && (
                <div className="absolute top-2 right-2 z-20">
                    <div className="animate-bounce-in">
                        <CheckCircle2 size={20} className="text-green-600 drop-shadow-sm" />
                    </div>
                </div>
            )}

            <div className="relative z-10">
                {/* Header */}
                <div className="flex items-start justify-between mb-3">
                    <div className="flex items-center gap-3">
                        <div className={`
                            p-2.5 rounded-lg transition-all duration-300
                            ${isWorking ? 'bg-[var(--camara-green)] text-white shadow-lg animate-pulse-slow' : ''}
                            ${isCompleted ? 'bg-green-500 text-white' : ''}
                            ${isError ? 'bg-red-500 text-white' : ''}
                            ${!isWorking && !isCompleted && !isError ? 'bg-slate-100 text-slate-400' : ''}
                        `}>
                            <Icon size={20} className={isWorking ? 'animate-wiggle' : ''} />
                        </div>
                        <div>
                            <h3 className="font-bold text-sm text-slate-900">{agent.name}</h3>
                            <div className="flex items-center gap-1.5 mt-0.5">
                                {isWorking && (
                                    <>
                                        <Loader2 size={12} className="text-[var(--camara-green)] animate-spin" />
                                        <span className="text-xs text-[var(--camara-green)] font-semibold">
                                            Processando
                                        </span>
                                    </>
                                )}
                                {isCompleted && (
                                    <>
                                        <CheckCircle2 size={12} className="text-green-600" />
                                        <span className="text-xs text-green-600 font-semibold">
                                            Concluído
                                        </span>
                                    </>
                                )}
                                {isError && !isTimeout && (
                                    <>
                                        <AlertCircle size={12} className="text-red-600" />
                                        <span className="text-xs text-red-600 font-semibold">
                                            Erro
                                        </span>
                                    </>
                                )}
                                {isTimeout && (
                                    <>
                                        <Clock size={12} className="text-orange-600" />
                                        <span className="text-xs text-orange-600 font-semibold">
                                            Timeout
                                        </span>
                                    </>
                                )}
                                {!isWorking && !isCompleted && !isError && (
                                    <>
                                        <Clock size={12} className="text-slate-400" />
                                        <span className="text-xs text-slate-400 font-medium">
                                            Aguardando
                                        </span>
                                    </>
                                )}
                            </div>
                        </div>
                    </div>

                    {/* Timer for working agents */}
                    {isWorking && elapsed > 0 && (
                        <div className={`text-xs font-mono px-2 py-1 rounded ${
                            isStalled
                                ? 'text-orange-700 bg-orange-100/80 font-bold'
                                : 'text-slate-500 bg-white/70'
                        }`}>
                            {elapsed}s {isStalled && '⚠️'}
                        </div>
                    )}
                </div>

                {/* Progress Bar */}
                {isWorking && (
                    <div className="mb-3 h-1.5 bg-slate-200 rounded-full overflow-hidden">
                        <div className="h-full bg-gradient-to-r from-[var(--camara-green)] to-emerald-500 animate-progress-bar rounded-full" />
                    </div>
                )}

                {/* Live Log Message */}
                <div className="bg-white/60 rounded-lg p-2.5 border border-slate-100/50">
                    <p className={`
                        text-xs leading-relaxed min-h-[2.5em] transition-all duration-300
                        ${isWorking ? 'text-slate-700 font-medium' : 'text-slate-500'}
                    `}>
                        {agent.message || "Aguardando tarefas..."}
                    </p>
                </div>
            </div>
        </div>
    );
};

export const AgentStatus: React.FC<AgentStatusProps> = ({ agents }) => {
    return (
        <div className="mb-8">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-4">
                {agents.map((agent) => (
                    <AgentCard key={agent.id} agent={agent} />
                ))}
            </div>
        </div>
    );
};
