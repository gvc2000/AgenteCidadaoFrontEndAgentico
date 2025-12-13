// Shared types for agent components

export type AgentType = 'orchestrator' | 'legislative' | 'political' | 'fiscal' | 'consolidator';

export type AgentStatus = 'idle' | 'working' | 'info' | 'completed' | 'error' | 'timeout';

export interface AgentState {
    id: AgentType;
    name: string;
    status: AgentStatus;
    message: string;
    startTime?: number;
}
