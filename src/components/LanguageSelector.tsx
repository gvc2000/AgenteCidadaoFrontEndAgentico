import React from 'react';
import { useTranslation } from '../i18n';
import type { Language } from '../i18n/translations';

export const LanguageSelector: React.FC = () => {
    const { language, setLanguage } = useTranslation();

    const handleLanguageChange = (lang: Language) => {
        setLanguage(lang);
    };

    return (
        <div className="language-selector">
            <button
                className={`lang-btn ${language === 'pt-BR' ? 'active' : ''}`}
                onClick={() => handleLanguageChange('pt-BR')}
                aria-label="Português do Brasil"
            >
                PT
            </button>
            <button
                className={`lang-btn ${language === 'es-ES' ? 'active' : ''}`}
                onClick={() => handleLanguageChange('es-ES')}
                aria-label="Español de España"
            >
                ES
            </button>
        </div>
    );
};

export default LanguageSelector;
