import React, { useState, useEffect } from 'react';
import { Clock, MessageSquare, CheckCircle2, AlertCircle, RefreshCw } from 'lucide-react';
import { supabase } from '../lib/supabase';
import { useTranslation } from '../i18n';

interface QueryLog {
    id: string;
    user_query: string;
    final_response: string | null;
    status: string;
    created_at: string;
    updated_at: string;
    response_time?: number;
}

export const AdminQueryHistory: React.FC = () => {
    const { t } = useTranslation();
    const [queries, setQueries] = useState<QueryLog[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [expandedId, setExpandedId] = useState<string | null>(null);

    const fetchQueries = async () => {
        setLoading(true);
        setError(null);
        try {
            const { data, error: fetchError } = await supabase
                .from('requests')
                .select('*')
                .order('created_at', { ascending: false })
                .limit(100);

            if (fetchError) throw fetchError;

            const queriesWithTime = (data || []).map(q => {
                const created = new Date(q.created_at).getTime();
                const updated = new Date(q.updated_at).getTime();
                const responseTime = Math.max(0, Math.round((updated - created) / 1000));
                // Show time for completed queries, even if 0
                const validTime = q.status === 'completed' ? responseTime : null;
                return { ...q, response_time: validTime };
            });

            setQueries(queriesWithTime);
        } catch (err: unknown) {
            setError(err instanceof Error ? err.message : 'Erro ao carregar consultas');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchQueries();
    }, []);

    const getStatusIcon = (status: string) => {
        switch (status) {
            case 'completed':
                return <CheckCircle2 size={16} className="text-green-500" />;
            case 'failed':
            case 'error':
                return <AlertCircle size={16} className="text-red-500" />;
            default:
                return <Clock size={16} className="text-yellow-500" />;
        }
    };

    const getStatusLabel = (status: string) => {
        switch (status) {
            case 'completed': return 'Concluído';
            case 'failed': return 'Falhou';
            case 'error': return 'Erro';
            case 'pending': return 'Pendente';
            case 'processing': return 'Processando';
            default: return status;
        }
    };

    const formatDate = (dateStr: string) => {
        return new Date(dateStr).toLocaleString('pt-BR', {
            day: '2-digit',
            month: '2-digit',
            year: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
        });
    };

    const formatResponseTime = (seconds: number) => {
        if (seconds < 60) return `${seconds}s`;
        const mins = Math.floor(seconds / 60);
        const secs = seconds % 60;
        return `${mins}m ${secs}s`;
    };

    return (
        <div className="admin-query-history">
            <div className="query-history-header">
                <h2>
                    <MessageSquare size={20} />
                    Histórico de Consultas
                </h2>
                <button onClick={fetchQueries} disabled={loading} className="refresh-btn">
                    <RefreshCw size={16} className={loading ? 'animate-spin' : ''} />
                    Atualizar
                </button>
            </div>

            {error && (
                <div className="error-message">
                    {error}
                </div>
            )}

            {loading ? (
                <div className="loading-state">
                    <RefreshCw size={24} className="animate-spin" />
                    <p>Carregando consultas...</p>
                </div>
            ) : queries.length === 0 ? (
                <div className="empty-state">
                    <MessageSquare size={48} />
                    <p>Nenhuma consulta encontrada</p>
                </div>
            ) : (
                <div className="query-list">
                    <div className="query-list-header">
                        <span className="col-date">Data</span>
                        <span className="col-query">Pergunta</span>
                        <span className="col-status">Status</span>
                        <span className="col-time">Tempo</span>
                    </div>
                    {queries.map((query) => (
                        <div key={query.id} className="query-item">
                            <div
                                className="query-row"
                                onClick={() => setExpandedId(expandedId === query.id ? null : query.id)}
                            >
                                <span className="col-date">{formatDate(query.created_at)}</span>
                                <span className="col-query">{query.user_query}</span>
                                <span className="col-status">
                                    {getStatusIcon(query.status)}
                                    {getStatusLabel(query.status)}
                                </span>
                                <span className="col-time">
                                    {query.response_time ? formatResponseTime(query.response_time) : '-'}
                                </span>
                            </div>
                            {expandedId === query.id && query.final_response && (
                                <div className="query-response">
                                    <h4>Resposta:</h4>
                                    <div className="response-content">
                                        {query.final_response}
                                    </div>
                                </div>
                            )}
                        </div>
                    ))}
                </div>
            )}

            {/* Stats Summary */}
            {!loading && queries.length > 0 && (
                <div className="query-stats">
                    <div className="stat-card">
                        <span className="stat-value">{queries.length}</span>
                        <span className="stat-label">Total de Consultas</span>
                    </div>
                    <div className="stat-card">
                        <span className="stat-value">
                            {queries.filter(q => q.status === 'completed').length}
                        </span>
                        <span className="stat-label">Concluídas</span>
                    </div>
                    <div className="stat-card">
                        <span className="stat-value">
                            {queries.filter(q => q.status === 'failed' || q.status === 'error').length}
                        </span>
                        <span className="stat-label">Erros</span>
                    </div>
                    <div className="stat-card">
                        <span className="stat-value">
                            {queries.length > 0
                                ? formatResponseTime(Math.round(
                                    queries.filter(q => q.response_time).reduce((acc, q) => acc + (q.response_time || 0), 0)
                                    / queries.filter(q => q.response_time).length
                                ))
                                : '-'
                            }
                        </span>
                        <span className="stat-label">Tempo Médio</span>
                    </div>
                </div>
            )}
        </div>
    );
};
