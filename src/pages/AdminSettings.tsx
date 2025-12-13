import React, { useState, useEffect } from 'react';
import { useTranslation } from '../i18n';
import { Shield, Globe, Check } from 'lucide-react';
import { supabase } from '../lib/supabase';

interface SystemSettings {
    accessRestricted: boolean;
}

export const AdminSettings: React.FC = () => {
    const { t } = useTranslation();
    const [settings, setSettings] = useState<SystemSettings>({
        accessRestricted: false,
    });
    const [isSaving, setIsSaving] = useState(false);
    const [showSuccess, setShowSuccess] = useState(false);

    // Load settings on mount
    useEffect(() => {
        loadSettings();
    }, []);

    const loadSettings = async () => {
        try {
            // Try to load from localStorage for now
            // In production, this would come from Supabase
            const saved = localStorage.getItem('agente-cidadao-settings');
            if (saved) {
                setSettings(JSON.parse(saved));
            }
        } catch (err) {
            console.error('Error loading settings:', err);
        }
    };

    const saveSettings = async () => {
        setIsSaving(true);
        try {
            // Save to localStorage for now
            // In production, save to Supabase
            localStorage.setItem('agente-cidadao-settings', JSON.stringify(settings));

            setShowSuccess(true);
            setTimeout(() => setShowSuccess(false), 3000);
        } catch (err) {
            console.error('Error saving settings:', err);
        } finally {
            setIsSaving(false);
        }
    };

    const toggleAccessRestriction = () => {
        setSettings(prev => ({
            ...prev,
            accessRestricted: !prev.accessRestricted,
        }));
    };

    return (
        <div className="admin-settings">
            <h2 className="admin-title">{t.settingsTitle}</h2>

            {showSuccess && (
                <div className="success-message">
                    <Check size={18} />
                    {t.settingsSaved}
                </div>
            )}

            <div className="settings-section">
                <div className="setting-card">
                    <div className="setting-header">
                        <div className="setting-icon">
                            <Shield size={24} />
                        </div>
                        <div className="setting-info">
                            <h3>{t.accessRestriction}</h3>
                            <p>{t.accessRestrictionDesc}</p>
                        </div>
                    </div>

                    <div className="setting-control">
                        <div className="toggle-container">
                            <button
                                className={`toggle-option ${!settings.accessRestricted ? 'active' : ''}`}
                                onClick={() => setSettings(prev => ({ ...prev, accessRestricted: false }))}
                            >
                                <Globe size={16} />
                                {t.publicAccess}
                            </button>
                            <button
                                className={`toggle-option ${settings.accessRestricted ? 'active' : ''}`}
                                onClick={() => setSettings(prev => ({ ...prev, accessRestricted: true }))}
                            >
                                <Shield size={16} />
                                {t.restrictedAccess}
                            </button>
                        </div>
                    </div>

                    <div className="setting-status">
                        {settings.accessRestricted ? (
                            <div className="status-badge status-restricted">
                                <Shield size={14} />
                                Acesso restrito ativado - Login obrigatório
                            </div>
                        ) : (
                            <div className="status-badge status-public">
                                <Globe size={14} />
                                Acesso público - Qualquer pessoa pode usar o chat
                            </div>
                        )}
                    </div>
                </div>
            </div>

            <div className="settings-actions">
                <button
                    className="btn-primary btn-save"
                    onClick={saveSettings}
                    disabled={isSaving}
                >
                    {isSaving ? 'Salvando...' : t.save}
                </button>
            </div>
        </div>
    );
};

export default AdminSettings;
