import { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';
import { TopBar } from '../components/TopBar';
import { Users, Shield, Database, Activity, Search, AlertCircle, FileText, Download, Settings } from 'lucide-react';
import './AdminDashboard.css';

export function AdminDashboard() {
    const [stats, setStats] = useState({
        totalUsers: 0,
        artists: 0,
        studios: 0,
        logs: 0
    });
    const [users, setUsers] = useState([]);
    const [logs, setLogs] = useState([]);
    const [loading, setLoading] = useState(true);
    const [activeTab, setActiveTab] = useState('overview'); // 'overview', 'users', 'logs'
    const [searchQuery, setSearchQuery] = useState('');

    useEffect(() => {
        fetchAdminData();
    }, []);

    const fetchAdminData = async () => {
        setLoading(true);
        try {
            // 1. Fetch Stats
            const { count: userCount } = await supabase.from('profiles').select('*', { count: 'exact', head: true });
            const { count: artistCount } = await supabase.from('profiles').select('*', { count: 'exact', head: true }).eq('role', 'artist');
            const { count: studioCount } = await supabase.from('profiles').select('*', { count: 'exact', head: true }).eq('role', 'studio');
            const { count: logCount } = await supabase.from('system_logs').select('*', { count: 'exact', head: true });

            setStats({
                totalUsers: userCount || 0,
                artists: artistCount || 0,
                studios: studioCount || 0,
                logs: logCount || 0
            });

            // 2. Fetch Users
            const { data: userData } = await supabase
                .from('profiles')
                .select('*')
                .order('created_at', { ascending: false })
                .limit(50);
            setUsers(userData || []);

            // 3. Fetch Logs
            const { data: logData } = await supabase
                .from('system_logs')
                .select(`
                    *,
                    profiles:user_id (full_name)
                `)
                .order('created_at', { ascending: false })
                .limit(50);
            setLogs(logData || []);

        } catch (error) {
            console.error('Error fetching admin data:', error);
        } finally {
            setLoading(false);
        }
    };

    const filteredUsers = users.filter(u =>
        u.full_name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        u.email?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        u.role?.toLowerCase().includes(searchQuery.toLowerCase())
    );

    const exportUsersCSV = () => {
        if (users.length === 0) return;

        const headers = ["ID", "Nome", "Email", "Role", "Cidade"].join(",");
        const rows = users.map(u =>
            `"${u.id}","${u.full_name || ''}","${u.email || ''}","${u.role}","${u.city || ''}"`
        ).join("\n");

        const csvContent = "data:text/csv;charset=utf-8," + headers + "\n" + rows;
        const encodedUri = encodeURI(csvContent);
        const link = document.createElement("a");
        link.setAttribute("href", encodedUri);
        link.setAttribute("download", "inkora_users.csv");
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
    };

    const handleManageUser = (user) => {
        alert(`Gerenciar usuário: ${user.full_name || user.email}\nFunção: ${user.role}\nID: ${user.id}`);
    };

    return (
        <div className="admin-dashboard">
            <TopBar />

            <header className="admin-header">
                <div className="admin-header-content">
                    <h1>Painel Administrativo</h1>
                    <p>Controle total do ecossistema Inkora</p>
                </div>
                <div className="admin-badge">
                    <Shield size={16} />
                    <span>Acesso Master</span>
                </div>
            </header>

            <nav className="admin-tabs">
                <button
                    className={activeTab === 'overview' ? 'active' : ''}
                    onClick={() => setActiveTab('overview')}
                >
                    <Activity size={18} />
                    Geral
                </button>
                <button
                    className={activeTab === 'users' ? 'active' : ''}
                    onClick={() => setActiveTab('users')}
                >
                    <Users size={18} />
                    Usuários
                </button>
                <button
                    className={activeTab === 'logs' ? 'active' : ''}
                    onClick={() => setActiveTab('logs')}
                >
                    <FileText size={18} />
                    Logs & Erros
                </button>
            </nav>

            <main className="admin-content">
                {activeTab === 'overview' && (
                    <div className="admin-overview">
                        <div className="stats-grid">
                            <div className="stat-card">
                                <Users className="stat-icon" />
                                <div className="stat-info">
                                    <h3>{stats.totalUsers}</h3>
                                    <p>Usuários Totais</p>
                                </div>
                            </div>
                            <div className="stat-card">
                                <Users className="stat-icon colored artist" />
                                <div className="stat-info">
                                    <h3>{stats.artists}</h3>
                                    <p>Tatuadores</p>
                                </div>
                            </div>
                            <div className="stat-card">
                                <Database className="stat-icon colored studio" />
                                <div className="stat-info">
                                    <h3>{stats.studios}</h3>
                                    <p>Estúdios</p>
                                </div>
                            </div>
                            <div className="stat-card">
                                <AlertCircle className="stat-icon colored error" />
                                <div className="stat-info">
                                    <h3>{stats.logs}</h3>
                                    <p>Eventos/Erros</p>
                                </div>
                            </div>
                        </div>

                        <section className="admin-recent-activity">
                            <div className="section-title-row">
                                <h2>Últimos Usuários</h2>
                                <button className="text-btn" onClick={() => setActiveTab('users')}>Ver todos</button>
                            </div>
                            <div className="admin-table-container">
                                <table className="admin-table">
                                    <thead>
                                        <tr>
                                            <th>Nome</th>
                                            <th>Role</th>
                                            <th>Cidade</th>
                                            <th>Data</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {users.slice(0, 5).map(user => (
                                            <tr key={user.id}>
                                                <td>{user.full_name || 'Sem nome'}</td>
                                                <td><span className={`role-tag ${user.role}`}>{user.role}</span></td>
                                                <td>{user.city || '---'}</td>
                                                <td>{new Date(user.created_at).toLocaleDateString()}</td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        </section>
                    </div>
                )}

                {activeTab === 'users' && (
                    <div className="admin-users">
                        <div className="admin-toolbar">
                            <div className="admin-search">
                                <Search size={18} />
                                <input
                                    type="text"
                                    placeholder="Buscar por nome, email ou cargo..."
                                    value={searchQuery}
                                    onChange={(e) => setSearchQuery(e.target.value)}
                                />
                            </div>
                            <button className="export-btn" onClick={exportUsersCSV}>
                                <Download size={16} />
                                Exportar CSV
                            </button>
                        </div>

                        <div className="admin-table-container">
                            <table className="admin-table">
                                <thead>
                                    <tr>
                                        <th>Nome</th>
                                        <th>Cargo</th>
                                        <th>Email (Auth)</th>
                                        <th>Cidade</th>
                                        <th>Ações</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {filteredUsers.map(user => (
                                        <tr key={user.id}>
                                            <td>
                                                <div className="user-cell">
                                                    {user.avatar_url ? (
                                                        <img src={user.avatar_url} alt="" className="admin-user-img" />
                                                    ) : (
                                                        <div className="admin-user-img-placeholder">{user.full_name?.[0] || '?'}</div>
                                                    )}
                                                    {user.full_name || 'Usuário Sem Nome'}
                                                </div>
                                            </td>
                                            <td><span className={`role-tag ${user.role}`}>{user.role}</span></td>
                                            <td className="dim">{user.id.substring(0, 8)}...</td>
                                            <td>{user.city || '---'}</td>
                                            <td>
                                                <button
                                                    className="btn-action"
                                                    title="Gerenciar"
                                                    onClick={() => handleManageUser(user)}
                                                >
                                                    <Settings size={16} />
                                                </button>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    </div>
                )}

                {activeTab === 'logs' && (
                    <div className="admin-logs">
                        <div className="log-list">
                            {logs.length > 0 ? logs.map(log => (
                                <div key={log.id} className={`log-item ${log.level}`}>
                                    <div className="log-icon">
                                        {log.level === 'error' ? <AlertCircle size={16} /> : <FileText size={16} />}
                                    </div>
                                    <div className="log-body">
                                        <div className="log-header">
                                            <span className="log-time">{new Date(log.created_at).toLocaleString()}</span>
                                            <span className="log-user">{log.profiles?.full_name || 'Sistema'}</span>
                                        </div>
                                        <p className="log-msg">{log.message}</p>
                                        {log.metadata && Object.keys(log.metadata).length > 0 && (
                                            <pre className="log-meta">{JSON.stringify(log.metadata, null, 2)}</pre>
                                        )}
                                    </div>
                                </div>
                            )) : (
                                <div className="empty-state">
                                    <p>Nenhum log registrado ainda.</p>
                                </div>
                            )}
                        </div>
                    </div>
                )}
            </main>
        </div>
    );
}
