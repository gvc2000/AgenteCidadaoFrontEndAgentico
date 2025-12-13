import React from 'react';
import { useTranslation } from '../i18n';
import { Check, Clock } from 'lucide-react';

export const SidebarDataSources: React.FC = () => {
    const { t } = useTranslation();

    const dataSources = [
        {
            name: t.camaraDeputados,
            description: t.apiVersion,
            active: true,
            url: 'https://dadosabertos.camara.leg.br/',
        },
        {
            name: t.senadoFederal,
            description: t.soonLabel,
            active: false,
            url: null,
        },
        {
            name: t.portalTransparencia,
            description: t.soonLabel,
            active: false,
            url: null,
        },
    ];

    return (
        <aside className="sidebar">
            <div className="sidebar-card">
                <h3 className="sidebar-title">
                    {t.sourcesTitle}
                </h3>
                <div className="sidebar-content">
                    {dataSources.map((source, index) => (
                        <div
                            key={index}
                            className={`data-source-item ${source.active ? 'active' : ''}`}
                        >
                            <div className="data-source-icon">
                                {source.active ? (
                                    <Check size={16} className="text-green-600" />
                                ) : (
                                    <Clock size={16} className="text-slate-400" />
                                )}
                            </div>
                            <div className="data-source-info">
                                <strong>{source.name}</strong>
                                <span>{source.description}</span>
                                {source.active && source.url && (
                                    <a
                                        href={source.url}
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        className="api-link"
                                    >
                                        {t.accessDocs}
                                    </a>
                                )}
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        </aside>
    );
};

export default SidebarDataSources;
