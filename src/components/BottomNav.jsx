import { NavLink } from 'react-router-dom';
import { Home, Compass, User, Bookmark, ShoppingBag } from 'lucide-react';
import { useAuth } from '../lib/AuthContext';
import './BottomNav.css';

export function BottomNav() {
    const { profile } = useAuth();
    const role = profile?.role || 'client';
    const isClient = role === 'client';

    return (
        <nav className="bottom-nav">
            <NavLink to="/home" className={({ isActive }) => `nav-item ${isActive ? 'active' : ''}`}>
                <Home size={24} />
                <span>Feed</span>
            </NavLink>

            <NavLink to="/search" className={({ isActive }) => `nav-item ${isActive ? 'active' : ''}`}>
                <Compass size={24} />
                <span>Buscar</span>
            </NavLink>

            {isClient ? (
                <NavLink to="/saved" className={({ isActive }) => `nav-item ${isActive ? 'active' : ''}`}>
                    <Bookmark size={24} />
                    <span>Salvos</span>
                </NavLink>
            ) : (
                <NavLink to="/store" className={({ isActive }) => `nav-item ${isActive ? 'active' : ''}`}>
                    <ShoppingBag size={24} />
                    <span>Loja</span>
                </NavLink>
            )}

            <NavLink
                to={isClient ? "/profile" : `/artist/${profile?.id}`}
                className={({ isActive }) => `nav-item ${isActive ? 'active' : ''}`}
            >
                <User size={24} />
                <span>Perfil</span>
            </NavLink>
        </nav>
    );
}
