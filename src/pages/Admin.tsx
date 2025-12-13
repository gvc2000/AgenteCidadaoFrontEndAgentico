import React, { useState } from 'react';
import { useTranslation } from '../i18n';
import { Users, Settings, LogIn, Shield, History } from 'lucide-react';
import { AdminUserManagement } from './AdminUserManagement';
import { AdminSettings } from './AdminSettings';
import { AdminQueryHistory } from './AdminQueryHistory';

type AdminTab = 'login' | 'users' | 'settings' | 'history';

export const AdminPage: React.FC = () => {
    const { t } = useTranslation();
    const [isAuthenticated, setIsAuthenticated] = useState(false);
    const [activeTab, setActiveTab] = useState<AdminTab>('history');
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');

    const handleLogin = async (e: React.FormEvent) => {
        e.preventDefault();
        setError('');

        // Simple mock authentication for demo
        // In production, this would use Supabase Auth
        if (email === 'admin@camara.leg.br' && password === 'admin123') {
            setIsAuthenticated(true);
        } else {
            setError('Email ou senha inválidos');
        }
    };

    const handleLogout = () => {
        setIsAuthenticated(false);
        setEmail('');
        setPassword('');
    };

    if (!isAuthenticated) {
        return (
            <div className="admin-login-container">
                <div className="admin-login-card">
                    <div className="admin-login-header">
                        <div className="admin-login-icon">
                            <Shield size={32} />
                        </div>
                        <h1>{t.adminTitle}</h1>
                        <p>{t.adminDescription}</p>
                    </div>

                    <form onSubmit={handleLogin} className="admin-login-form">
                        {error && <div className="form-error">{error}</div>}

                        <div className="form-group">
                            <label>{t.emailLabel}</label>
                            <input
                                type="email"
                                value={email}
                                onChange={e => setEmail(e.target.value)}
                                placeholder="admin@camara.leg.br"
                                required
                            />
                        </div>

                        <div className="form-group">
                            <label>{t.passwordLabel}</label>
                            <input
                                type="password"
                                value={password}
                                onChange={e => setPassword(e.target.value)}
                                placeholder="••••••••"
                                required
                            />
                        </div>

                        <button type="submit" className="btn-primary btn-login">
                            <LogIn size={18} />
                            {t.loginButton}
                        </button>
                    </form>

                    <div className="admin-login-hint">
                        <p>Demo: admin@camara.leg.br / admin123</p>
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className="admin-dashboard">
            {/* Sidebar Navigation */}
            <aside className="admin-sidebar">
                <div className="admin-sidebar-header">
                    <Shield size={24} />
                    <span>{t.adminTitle}</span>
                </div>

                <nav className="admin-nav">
                    <button
                        className={`admin-nav-item ${activeTab === 'history' ? 'active' : ''}`}
                        onClick={() => setActiveTab('history')}
                    >
                        <History size={18} />
                        Histórico
                    </button>
                    <button
                        className={`admin-nav-item ${activeTab === 'users' ? 'active' : ''}`}
                        onClick={() => setActiveTab('users')}
                    >
                        <Users size={18} />
                        {t.navUsers}
                    </button>
                    <button
                        className={`admin-nav-item ${activeTab === 'settings' ? 'active' : ''}`}
                        onClick={() => setActiveTab('settings')}
                    >
                        <Settings size={18} />
                        {t.navSettings}
                    </button>
                </nav>

                <div className="admin-sidebar-footer">
                    <button className="btn-logout" onClick={handleLogout}>
                        {t.navLogout}
                    </button>
                </div>
            </aside>

            {/* Main Content */}
            <main className="admin-main">
                {activeTab === 'history' && <AdminQueryHistory />}
                {activeTab === 'users' && <AdminUserManagement />}
                {activeTab === 'settings' && <AdminSettings />}
            </main>
        </div>
    );
};

export default AdminPage;
