import React from 'react';
import { Bot, Scale, Landmark, DollarSign, Activity, CheckCircle2, Clock, FileText } from 'lucide-react';

export type AgentType = 'orchestrator' | 'legislative' | 'political' | 'fiscal' | 'consolidator';

export interface AgentState {
    id: AgentType;
    name: string;
    status: 'idle' | 'working' | 'info' | 'completed' | 'error';
    message: string;
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

export const AgentStatus: React.FC<AgentStatusProps> = ({ agents }) => {
    return (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-4 mb-8">
            {agents.map((agent) => {
                const Icon = iconMap[agent.id];
                // Treat 'info' as working for animation purposes
                const isWorking = agent.status === 'working' || agent.status === 'info';
                const isCompleted = agent.status === 'completed';

                return (
                    <div
                        key={agent.id}
                        className={`
              relative overflow-hidden rounded-xl p-4 border transition-all duration-300
              ${isWorking ? 'border-[var(--camara-green)] bg-green-50 shadow-md scale-105' : 'border-slate-200 bg-white'}
              ${isCompleted ? 'border-green-200 bg-green-50/50' : ''}
            `}
                    >
                        {/* Background Pulse Animation */}
                        {isWorking && (
                            <div className="absolute inset-0 bg-green-100/30 animate-pulse" />
                        )}

                        <div className="relative z-10 flex items-start justify-between">
                            <div className="flex items-center gap-3">
                                <div className={`
                  p-2 rounded-lg 
                  ${isWorking ? 'bg-[var(--camara-green)] text-white' : 'bg-slate-100 text-slate-500'}
                `}>
                                    <Icon size={24} />
                                </div>
                                <div>
                                    <h3 className="font-semibold text-sm text-slate-900">{agent.name}</h3>
                                    <div className="flex items-center gap-1.5 mt-1">
                                        {isWorking && <Activity size={12} className="text-[var(--camara-green)] animate-spin" />}
                                        {isCompleted && <CheckCircle2 size={12} className="text-green-600" />}
                                        {agent.status === 'idle' && <Clock size={12} className="text-slate-400" />}

                                        <span className="text-xs text-slate-500 font-medium">
                                            {agent.status === 'working' ? 'Processando...' :
                                                agent.status === 'completed' ? 'Concluído' :
                                                    agent.status === 'error' ? 'Erro' : 'Aguardando'}
                                        </span>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Live Log Message */}
                        <div className="relative z-10 mt-3 pl-11">
                            <p className="text-xs text-slate-600 leading-relaxed min-h-[2.5em]">
                                {agent.message || "Aguardando tarefas..."}
                            </p>
                        </div>
                    </div>
                );
            })}
        </div>
    );
};
