

export const AdminPage = () => {
    return (
        <div className="p-8 max-w-4xl mx-auto">
            <h1 className="text-2xl font-bold mb-4 text-[var(--camara-green)]">Administração</h1>
            <p className="text-slate-600">Área restrita para gerenciamento de usuários.</p>

            <div className="grid gap-6 mt-8">
                <div className="p-6 bg-white rounded-xl border border-slate-200 shadow-sm max-w-md">
                    <h2 className="text-lg font-semibold mb-4 text-slate-800">Login Administrativo</h2>
                    <form className="space-y-4">
                        <div>
                            <label className="block text-sm font-medium text-slate-700 mb-1">Email</label>
                            <input
                                type="email"
                                placeholder="admin@camara.leg.br"
                                className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-lg focus:ring-2 focus:ring-[var(--camara-green)]/20 focus:border-[var(--camara-green)] outline-none transition-all"
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-slate-700 mb-1">Senha</label>
                            <input
                                type="password"
                                placeholder="••••••••"
                                className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-lg focus:ring-2 focus:ring-[var(--camara-green)]/20 focus:border-[var(--camara-green)] outline-none transition-all"
                            />
                        </div>
                        <button type="submit" className="btn-primary w-full mt-2">
                            Entrar no Sistema
                        </button>
                    </form>
                </div>
            </div>
        </div>
    );
};
