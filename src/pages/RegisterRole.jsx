import { SignUp } from '@clerk/clerk-react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft } from 'lucide-react';
import './RegisterRole.css';

export function RegisterRole() {
    const navigate = useNavigate();

    return (
        <div className="auth-page role-page">
            <header className="role-header-nav">
                <button className="back-btn-ghost" onClick={() => navigate('/login')}>
                    <ArrowLeft size={24} />
                </button>
            </header>

            <div className="role-header">
                <h1 className="role-title">Crie sua conta no Inkora</h1>
                <p className="role-subtitle">Comece sua jornada no maior ecossistema de Guest Spots.</p>
            </div>

            <div className="clerk-auth-container">
                <SignUp 
                    routing="path" 
                    path="/register" 
                    signInUrl="/login"
                    forceRedirectUrl="/home"
                />
            </div>
        </div>
    );
}
