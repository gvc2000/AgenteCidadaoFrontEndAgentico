import React, { useState, useEffect } from 'react';
import { useTranslation } from '../i18n';
import { Plus, Edit2, Trash2, X, User } from 'lucide-react';

interface UserData {
    id: string;
    email: string;
    name: string;
    role: 'admin' | 'user';
    created_at: string;
}

export const AdminUserManagement: React.FC = () => {
    const { t } = useTranslation();
    const [users, setUsers] = useState<UserData[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [showModal, setShowModal] = useState(false);
    const [editingUser, setEditingUser] = useState<UserData | null>(null);
    const [formData, setFormData] = useState({
        name: '',
        email: '',
        password: '',
        role: 'user' as 'admin' | 'user',
    });
    const [error, setError] = useState('');

    // Fetch users on mount
    useEffect(() => {
        fetchUsers();
    }, []);

    const fetchUsers = async () => {
        setIsLoading(true);
        try {
            // This would need a proper users table in Supabase
            // For now, we'll use mock data
            const mockUsers: UserData[] = [
                { id: '1', email: 'admin@camara.leg.br', name: 'Administrador', role: 'admin', created_at: '2024-01-01' },
                { id: '2', email: 'usuario@example.com', name: 'Usuário Teste', role: 'user', created_at: '2024-01-15' },
            ];
            setUsers(mockUsers);
        } catch (err) {
            console.error('Error fetching users:', err);
        } finally {
            setIsLoading(false);
        }
    };

    const openAddModal = () => {
        setEditingUser(null);
        setFormData({ name: '', email: '', password: '', role: 'user' });
        setError('');
        setShowModal(true);
    };

    const openEditModal = (user: UserData) => {
        setEditingUser(user);
        setFormData({ name: user.name, email: user.email, password: '', role: user.role });
        setError('');
        setShowModal(true);
    };

    const closeModal = () => {
        setShowModal(false);
        setEditingUser(null);
        setError('');
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError('');

        if (!formData.name || !formData.email) {
            setError('Nome e email são obrigatórios');
            return;
        }

        if (!editingUser && !formData.password) {
            setError('Senha é obrigatória para novos usuários');
            return;
        }

        try {
            if (editingUser) {
                // Update existing user
                setUsers(prev => prev.map(u =>
                    u.id === editingUser.id
                        ? { ...u, name: formData.name, email: formData.email, role: formData.role }
                        : u
                ));
            } else {
                // Add new user
                const newUser: UserData = {
                    id: Date.now().toString(),
                    email: formData.email,
                    name: formData.name,
                    role: formData.role,
                    created_at: new Date().toISOString().split('T')[0],
                };
                setUsers(prev => [...prev, newUser]);
            }
            closeModal();
        } catch (err) {
            setError('Erro ao salvar usuário');
        }
    };

    const handleDelete = async (userId: string) => {
        if (window.confirm(t.confirmDelete)) {
            setUsers(prev => prev.filter(u => u.id !== userId));
        }
    };

    return (
        <div className="admin-user-management">
            <div className="admin-header">
                <h2 className="admin-title">{t.userManagement}</h2>
                <button className="btn-primary" onClick={openAddModal}>
                    <Plus size={18} />
                    {t.addUser}
                </button>
            </div>

            {isLoading ? (
                <div className="loading-container">
                    <div className="loading-spinner"></div>
                </div>
            ) : (
                <div className="users-table-container">
                    <table className="users-table">
                        <thead>
                            <tr>
                                <th>{t.userName}</th>
                                <th>{t.userEmail}</th>
                                <th>{t.userRole}</th>
                                <th>Ações</th>
                            </tr>
                        </thead>
                        <tbody>
                            {users.map(user => (
                                <tr key={user.id}>
                                    <td>
                                        <div className="user-cell">
                                            <div className="user-avatar">
                                                <User size={16} />
                                            </div>
                                            {user.name}
                                        </div>
                                    </td>
                                    <td>{user.email}</td>
                                    <td>
                                        <span className={`role-badge role-${user.role}`}>
                                            {user.role === 'admin' ? t.roleAdmin : t.roleUser}
                                        </span>
                                    </td>
                                    <td>
                                        <div className="action-buttons">
                                            <button
                                                className="btn-icon btn-edit"
                                                onClick={() => openEditModal(user)}
                                                aria-label={t.editUser}
                                            >
                                                <Edit2 size={16} />
                                            </button>
                                            <button
                                                className="btn-icon btn-delete"
                                                onClick={() => handleDelete(user.id)}
                                                aria-label={t.deleteUser}
                                            >
                                                <Trash2 size={16} />
                                            </button>
                                        </div>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            )}

            {/* Modal */}
            {showModal && (
                <div className="modal-overlay" onClick={closeModal}>
                    <div className="modal-content" onClick={e => e.stopPropagation()}>
                        <div className="modal-header">
                            <h3>{editingUser ? t.editUser : t.addUser}</h3>
                            <button className="btn-icon" onClick={closeModal}>
                                <X size={20} />
                            </button>
                        </div>

                        <form onSubmit={handleSubmit} className="modal-form">
                            {error && <div className="form-error">{error}</div>}

                            <div className="form-group">
                                <label>{t.userName}</label>
                                <input
                                    type="text"
                                    value={formData.name}
                                    onChange={e => setFormData(prev => ({ ...prev, name: e.target.value }))}
                                    placeholder="Nome completo"
                                />
                            </div>

                            <div className="form-group">
                                <label>{t.userEmail}</label>
                                <input
                                    type="email"
                                    value={formData.email}
                                    onChange={e => setFormData(prev => ({ ...prev, email: e.target.value }))}
                                    placeholder="email@exemplo.com"
                                />
                            </div>

                            <div className="form-group">
                                <label>{t.passwordLabel} {editingUser && '(deixe vazio para manter)'}</label>
                                <input
                                    type="password"
                                    value={formData.password}
                                    onChange={e => setFormData(prev => ({ ...prev, password: e.target.value }))}
                                    placeholder="••••••••"
                                />
                            </div>

                            <div className="form-group">
                                <label>{t.userRole}</label>
                                <select
                                    value={formData.role}
                                    onChange={e => setFormData(prev => ({ ...prev, role: e.target.value as 'admin' | 'user' }))}
                                >
                                    <option value="user">{t.roleUser}</option>
                                    <option value="admin">{t.roleAdmin}</option>
                                </select>
                            </div>

                            <div className="modal-actions">
                                <button type="button" className="btn-secondary" onClick={closeModal}>
                                    {t.cancel}
                                </button>
                                <button type="submit" className="btn-primary">
                                    {t.save}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
};

export default AdminUserManagement;
