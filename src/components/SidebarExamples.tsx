import React from 'react';
import { useTranslation } from '../i18n';

interface SidebarExamplesProps {
    onExampleClick: (question: string) => void;
}

export const SidebarExamples: React.FC<SidebarExamplesProps> = ({ onExampleClick }) => {
    const { t } = useTranslation();

    return (
        <aside className="sidebar">
            <div className="sidebar-card">
                <h3 className="sidebar-title">{t.examplesTitle}</h3>
                <div className="sidebar-content">
                    {t.examples.map((question, index) => (
                        <div
                            key={index}
                            className="example-question"
                            onClick={() => onExampleClick(question)}
                            role="button"
                            tabIndex={0}
                            onKeyDown={(e) => {
                                if (e.key === 'Enter' || e.key === ' ') {
                                    onExampleClick(question);
                                }
                            }}
                        >
                            {question}
                        </div>
                    ))}
                </div>
            </div>
        </aside>
    );
};

export default SidebarExamples;
