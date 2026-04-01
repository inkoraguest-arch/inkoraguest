import { useState, useEffect } from 'react';
import { Search, SlidersHorizontal, Bell, Check, Shield } from 'lucide-react';
import { Link } from 'react-router-dom';
import { supabase } from '../lib/supabase';
import { useAuth } from '../lib/AuthContext';
import logoHorizontal from '../assets/images/logo-horizontal.jpg';
import './TopBar.css';

export function TopBar() {
    const { profile } = useAuth();
    const [notifications, setNotifications] = useState([]);
    const [showNotifications, setShowNotifications] = useState(false);
    const unreadCount = notifications.filter(n => !n.read).length;

    useEffect(() => {
        if (profile) {
            fetchNotifications();

            // Subscribe to new notifications
            const subscription = supabase
                .channel('notifications_changes')
                .on('postgres_changes', {
                    event: 'INSERT',
                    schema: 'public',
                    table: 'notifications',
                    filter: `user_id=eq.${profile.id}`
                }, (payload) => {
                    setNotifications(prev => [payload.new, ...prev]);
                })
                .subscribe();

            return () => {
                supabase.removeChannel(subscription);
            };
        }
    }, [profile]);

    const fetchNotifications = async () => {
        const { data, error } = await supabase
            .from('notifications')
            .select(`
                *,
                from_user:from_user_id (full_name, avatar_url)
            `)
            .eq('user_id', profile.id)
            .order('created_at', { ascending: false })
            .limit(10);

        if (data) setNotifications(data);
    };

    const markAsRead = async () => {
        if (unreadCount === 0) return;

        const { error } = await supabase
            .from('notifications')
            .update({ read: true })
            .eq('user_id', profile.id)
            .eq('read', false);

        if (!error) {
            setNotifications(prev => prev.map(n => ({ ...n, read: true })));
        }
    };

    const toggleNotifications = () => {
        const newState = !showNotifications;
        setShowNotifications(newState);
        if (newState) {
            markAsRead();
        }
    };

    const handleSearch = (e) => {
        // In a real app, this would probably update a global state or hit an API
        // For now, we can dispatch a custom event that Home or SearchClient can listen to
        const query = e.target.value;
        const event = new CustomEvent('inkora-search', { detail: query });
        window.dispatchEvent(event);
    };

    const handleFilterClick = (style) => {
        const event = new CustomEvent('inkora-filter-style', { detail: style });
        window.dispatchEvent(event);
    };

    return (
        <div className="topbar">
            <div className="brand-container">
                <Link to="/home" className="brand">
                    <img src={logoHorizontal} alt="Inkora" className="topbar-logo-img" />
                </Link>

                {profile && (
                    <div className="notification-bell-container">
                        <button className="notification-bell-btn" onClick={toggleNotifications}>
                            <Bell size={24} />
                            {unreadCount > 0 && <span className="unread-dot">{unreadCount}</span>}
                        </button>

                        {profile.role === 'admin' && (
                            <Link to="/admin" className="admin-link-icon" title="Painel Admin">
                                <Shield size={24} color="var(--primary)" />
                            </Link>
                        )}

                        {showNotifications && (
                            <div className="notifications-dropdown">
                                <div className="notifications-header">
                                    <h3>Notificações</h3>
                                    <button onClick={() => setShowNotifications(false)}>×</button>
                                </div>
                                <div className="notifications-list">
                                    {notifications.length > 0 ? (
                                        notifications.map(notif => (
                                            <div key={notif.id} className={`notification-item ${notif.read ? '' : 'unread'}`}>
                                                {notif.from_user?.avatar_url ? (
                                                    <img src={notif.from_user.avatar_url} alt="" className="notif-avatar" />
                                                ) : (
                                                    <div className="notif-avatar-placeholder" style={{
                                                        width: '32px', height: '32px', borderRadius: '50%',
                                                        background: 'var(--surface)', border: '1px solid var(--border-color)',
                                                        display: 'flex', justifyContent: 'center', alignItems: 'center', fontSize: '12px', fontWeight: 'bold'
                                                    }}>
                                                        {notif.from_user?.full_name?.charAt(0)}
                                                    </div>
                                                )}
                                                <div className="notif-content">
                                                    <p>
                                                        <strong>{notif.from_user?.full_name}</strong>
                                                        {notif.type === 'like' && ' curtiu seu post.'}
                                                        {notif.type === 'comment' && ' comentou no seu post.'}
                                                        {notif.type === 'new_post' && ' fez uma nova publicação.'}
                                                    </p>
                                                    <span className="notif-time">Há pouco</span>
                                                </div>
                                            </div>
                                        ))
                                    ) : (
                                        <p className="no-notifications">Nenhuma notificação por enquanto.</p>
                                    )}
                                </div>
                            </div>
                        )}
                    </div>
                )}
            </div>

            <div className="search-container">
                <div className="search-input-wrapper">
                    <Search size={18} className="search-icon" />
                    <input
                        type="text"
                        placeholder="Cidade, estilo, artista..."
                        className="search-input"
                        onChange={handleSearch}
                    />
                </div>
                <button className="filter-btn" aria-label="Filtros" onClick={() => handleFilterClick('open_filters')}>
                    <SlidersHorizontal size={20} />
                </button>
            </div>

            <div className="quick-filters">
                <button className="pill-btn active" onClick={() => handleFilterClick('All')}>Todos</button>
                <button className="pill-btn" onClick={() => handleFilterClick('Realismo')}>Realismo</button>
                <button className="pill-btn" onClick={() => handleFilterClick('Blackwork')}>Blackwork</button>
                <button className="pill-btn" onClick={() => handleFilterClick('Old School')}>Old School</button>
                <button className="pill-btn" onClick={() => handleFilterClick('Fine Line')}>Fine Line</button>
            </div>
        </div>
    );
}
