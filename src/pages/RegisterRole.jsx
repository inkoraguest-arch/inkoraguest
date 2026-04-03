import { useState } from 'react';
import { SignUp } from '@clerk/clerk-react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, User, Palette, Warehouse } from 'lucide-react';
import './RegisterRole.css';

export function RegisterRole() {
    const navigate = useNavigate();
    const [selectedRole, setSelectedRole] = useState(null);

    const handleSelectRole = (role) => {
        localStorage.setItem('inkoraRole', role);
        setSelectedRole(role);
    };

    if (selectedRole) {
        return (
            <div className="auth-page role-page">
                <header className="role-header-nav">
                    <button className="back-btn-ghost" onClick={() => setSelectedRole(null)}>
                        <ArrowLeft size={24} />
                    </button>
                    <span style={{ fontSize: '14px', fontWeight: 'bold', color: 'var(--text-secondary)' }}>
                        Cadastro como {selectedRole === 'client' ? 'Cliente' : selectedRole === 'artist' ? 'Artista' : 'Estúdio'}
                    </span>
                </header>

                <div className="clerk-auth-container">
                    <SignUp 
                        routing="path" 
                        path="/register" 
                        signInUrl="/login"
                        forceRedirectUrl="/home"
                        unsafeMetadata={{ role: selectedRole }}
                    />
                </div>
            </div>
        );
    }

    return (
        <div className="auth-page role-page">
            <header className="role-header-nav">
                <button className="back-btn-ghost" onClick={() => navigate('/login')}>
                    <ArrowLeft size={24} />
                </button>
            </header>

            <div className="role-header">
                <h1 className="role-title">Como você quer usar o Inkora?</h1>
                <p className="role-subtitle">Escolha o seu perfil para uma experiência personalizada.</p>
            </div>

            <div className="role-options">
                <button className="role-card" onClick={() => handleSelectRole('client')}>
                    <div className="role-icon-wrapper client-theme">
                        <User size={32} />
                    </div>
                    <div className="role-info">
                        <h3>Sou Cliente</h3>
                        <p>Quero encontrar artistas, salvar flashes e agendar minha próxima tattoo.</p>
                    </div>
                </button>

                <button className="role-card" onClick={() => handleSelectRole('artist')}>
                    <div className="role-icon-wrapper artist-theme">
                        <Palette size={32} />
                    </div>
                    <div className="role-info">
                        <h3>Sou Artista</h3>
                        <p>Quero divulgar meu trampo, vender meus flashes e encontrar Guest Spots.</p>
                    </div>
                </button>

                <button className="role-card" onClick={() => handleSelectRole('studio')}>
                    <div className="role-icon-wrapper studio-theme">
                        <Warehouse size={32} />
                    </div>
                    <div className="role-info">
                        <h3>Sou Estúdio</h3>
                        <p>Quero gerenciar meu espaço, anunciar vagas de Guest e vender produtos.</p>
                    </div>
                </button>
            </div>
        </div>
    );
}
