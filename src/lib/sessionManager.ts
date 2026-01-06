import { SupabaseClient } from '@supabase/supabase-js';

const SESSION_KEY = 'agente_cidadao_session_id';

// ========================================
// TIPOS
// ========================================

interface Message {
    id: string;
    role: 'user' | 'assistant';
    content: string;
    entities?: Entity[];
    created_at: string;
}

interface Entity {
    type: 'deputado' | 'proposicao' | 'partido';
    name: string;
    id?: number;
    resolved?: boolean;
}

interface Context {
    previous_questions: string[];
    entities_in_focus: Record<string, Entity[]>;
    conversation_length: number;
}

// ========================================
// SESSION MANAGER
// ========================================

export class SessionManager {
    private sessionId: string;

    constructor() {
        this.sessionId = this.getOrCreateSessionId();
    }

    private getOrCreateSessionId(): string {
        let sessionId = localStorage.getItem(SESSION_KEY);

        if (!sessionId) {
            sessionId = crypto.randomUUID();
            localStorage.setItem(SESSION_KEY, sessionId);
        }

        return sessionId;
    }

    getSessionId(): string {
        return this.sessionId;
    }

    clearSession(): void {
        localStorage.removeItem(SESSION_KEY);
        this.sessionId = this.getOrCreateSessionId();
    }

    // ========================================
    // CONVERSA
    // ========================================

    async getOrCreateConversation(supabase: SupabaseClient): Promise<string> {
        try {
            // Buscar conversa ativa existente
            const { data: existing, error: fetchError } = await supabase
                .from('conversations')
                .select('id, expires_at')
                .eq('session_id', this.sessionId)
                .gt('expires_at', new Date().toISOString())
                .order('updated_at', { ascending: false })
                .limit(1)
                .maybeSingle();

            if (fetchError) {
                console.error('Erro ao buscar conversa:', fetchError);
                throw fetchError;
            }

            if (existing) {
                return existing.id;
            }

            // Criar nova conversa
            const { data, error } = await supabase
                .from('conversations')
                .insert([{
                    session_id: this.sessionId,
                    title: 'Nova conversa',
                    metadata: { started_at: new Date().toISOString() }
                }])
                .select()
                .single();

            if (error) {
                console.error('Erro ao criar conversa:', error);
                throw error;
            }

            return data.id;
        } catch (err) {
            console.error('Erro em getOrCreateConversation:', err);
            throw err;
        }
    }

    // ========================================
    // MENSAGENS
    // ========================================

    async getConversationHistory(
        supabase: SupabaseClient,
        conversationId: string,
        limit: number = 10
    ): Promise<Message[]> {
        try {
            const { data, error } = await supabase
                .from('messages')
                .select('*')
                .eq('conversation_id', conversationId)
                .order('created_at', { ascending: false })
                .limit(limit);

            if (error) {
                console.error('Erro ao buscar histórico:', error);
                throw error;
            }

            return (data || []).reverse();
        } catch (err) {
            console.error('Erro em getConversationHistory:', err);
            return [];
        }
    }

    async saveMessage(
        supabase: SupabaseClient,
        conversationId: string,
        role: 'user' | 'assistant',
        content: string,
        entities: Entity[] = [],
        requestId?: string
    ): Promise<void> {
        try {
            const { error } = await supabase
                .from('messages')
                .insert([{
                    conversation_id: conversationId,
                    request_id: requestId || null,
                    role,
                    content,
                    entities
                }]);

            if (error) {
                console.error('Erro ao salvar mensagem:', error);
                throw error;
            }
        } catch (err) {
            console.error('Erro em saveMessage:', err);
            // Não lançar erro para não quebrar o fluxo principal
        }
    }

    // ========================================
    // CONTEXTO
    // ========================================

    buildContext(history: Message[]): Context {
        // Últimas 3 perguntas completas
        const recentQuestions = history
            .filter(m => m.role === 'user')
            .slice(-3)
            .map(m => m.content);

        // Agregar todas as entidades
        const allEntities = this.aggregateEntities(history);

        return {
            previous_questions: recentQuestions,
            entities_in_focus: allEntities,
            conversation_length: history.length
        };
    }

    private aggregateEntities(history: Message[]): Record<string, Entity[]> {
        const grouped: Record<string, Entity[]> = {};

        for (const msg of history) {
            if (!msg.entities || !Array.isArray(msg.entities)) continue;

            for (const entity of msg.entities) {
                if (!entity.type) continue;

                if (!grouped[entity.type]) {
                    grouped[entity.type] = [];
                }

                // Evitar duplicatas pelo nome
                const existingIndex = grouped[entity.type].findIndex(e => e.name === entity.name);

                if (existingIndex === -1) {
                    grouped[entity.type].push({ ...entity });
                } else if (entity.id && !grouped[entity.type][existingIndex].id) {
                    // Atualizar com ID se disponível
                    grouped[entity.type][existingIndex].id = entity.id;
                    grouped[entity.type][existingIndex].resolved = true;
                }
            }
        }

        return grouped;
    }

    // ========================================
    // EXTRAÇÃO DE ENTIDADES (do response do LLM)
    // ========================================

    extractEntitiesFromResponse(response: string): Entity[] {
        const entities: Entity[] = [];

        // Procurar bloco JSON oculto gerado pelo LLM
        const entityMatch = response.match(/<!-- ENTITIES\n([\s\S]*?)\n-->/);

        if (entityMatch) {
            try {
                const parsed = JSON.parse(entityMatch[1]);

                if (parsed.deputados && Array.isArray(parsed.deputados)) {
                    entities.push(...parsed.deputados.map((d: { nome?: string; name?: string; id?: number }) => ({
                        type: 'deputado' as const,
                        name: d.nome || d.name || '',
                        id: d.id,
                        resolved: !!d.id
                    })));
                }

                if (parsed.proposicoes && Array.isArray(parsed.proposicoes)) {
                    entities.push(...parsed.proposicoes.map((p: { numero?: string; name?: string; id?: number }) => ({
                        type: 'proposicao' as const,
                        name: p.numero || p.name || '',
                        id: p.id,
                        resolved: !!p.id
                    })));
                }

                if (parsed.partidos && Array.isArray(parsed.partidos)) {
                    entities.push(...parsed.partidos.map((p: string) => ({
                        type: 'partido' as const,
                        name: p
                    })));
                }
            } catch (e) {
                console.warn('Falha ao extrair entidades do response:', e);
            }
        }

        return entities;
    }

    // ========================================
    // LIMPAR BLOCO DE ENTIDADES DA RESPOSTA
    // ========================================

    cleanResponseContent(response: string): string {
        // Remove o bloco de entidades antes de exibir ao usuário
        return response.replace(/<!-- ENTITIES\n[\s\S]*?\n-->/g, '').trim();
    }
}

// Singleton export
export const sessionManager = new SessionManager();
