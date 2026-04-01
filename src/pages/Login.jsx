import { SignIn } from '@clerk/clerk-react';
import { useNavigate } from 'react-router-dom';
import logoVertical from '../assets/images/logo-vertical.jpg';
import './Login.css';

export function Login() {
    const navigate = useNavigate();

    return (
        <div className="auth-page">
            <div className="auth-header">
                <img src={logoVertical} alt="Inkora Logo" className="auth-logo-img" />
                <p className="auth-subtitle">A plataforma definitiva de Guest Spot</p>
            </div>

            <div className="clerk-auth-container" style={{ position: 'relative', display: 'flex', justifyContent: 'center' }}>
                <SignIn 
                    fallbackRedirectUrl="/home"
                    signUpFallbackRedirectUrl="/register"
                />
            </div>
        </div>
    );
}
