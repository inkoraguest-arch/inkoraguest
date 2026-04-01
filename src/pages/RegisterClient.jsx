import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '../components/Button';
import { ArrowLeft, Upload, User, MapPin, Phone, Mail, Lock, Instagram } from 'lucide-react';
import { supabase } from '../lib/supabase';
import './RegisterForms.css';

export function RegisterClient() {
    const navigate = useNavigate();
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [name, setName] = useState('');
    const [city, setCity] = useState('');
    const [phone, setPhone] = useState('');
    const [instagram, setInstagram] = useState('');
    const [error, setError] = useState(null);
    const [loading, setLoading] = useState(false);

    const handleRegister = async (e) => {
        e.preventDefault();
        setError(null);
        setLoading(true);

        const { data, error } = await supabase.auth.signUp({
            email,
            password,
            options: {
                data: {
                    full_name: name,
                    role: 'client',
                    city: city,
                    phone: phone,
                    instagram: instagram
                }
            }
        });

        if (error) {
            setError(error.message);
            setLoading(false);
        } else {
            // For testing purposes before we build the profile fetching logic
            localStorage.setItem('inkoraRole', 'client');
            navigate('/home');
        }
    };

    return (
        <div className="auth-page form-page">
            <header className="role-header-nav">
                <button className="back-btn-ghost" onClick={() => navigate('/register')}>
                    <ArrowLeft size={24} />
                </button>
                <h2 className="form-header-title">Cadastro de Cliente</h2>
            </header>

            <form className="auth-form scrollable-form" onSubmit={handleRegister}>
                {error && <div style={{ color: 'var(--primary)', marginBottom: '16px', fontSize: '14px', textAlign: 'center' }}>{error}</div>}

                <div className="photo-upload-section">
                    <div className="photo-placeholder round">
                        <Upload size={24} className="upload-icon" />
                        <span>Sua foto</span>
                    </div>
                </div>

                <div className="input-group">
                    <label>Nome Completo</label>
                    <div className="input-with-icon">
                        <User size={18} className="input-icon" />
                        <input type="text" placeholder="Como quer ser chamado?" required value={name} onChange={e => setName(e.target.value)} />
                    </div>
                </div>

                <div className="input-group">
                    <label>Endereço</label>
                    <div className="input-with-icon">
                        <MapPin size={18} className="input-icon" />
                        <input type="text" placeholder="Sua cidade atual" value={city} onChange={e => setCity(e.target.value)} />
                    </div>
                </div>

                <div className="input-group">
                    <label>Telefone</label>
                    <div className="input-with-icon">
                        <Phone size={18} className="input-icon" />
                        <input type="tel" placeholder="(00) 00000-0000" value={phone} onChange={e => setPhone(e.target.value)} />
                    </div>
                </div>

                <div className="input-group">
                    <label>Email</label>
                    <div className="input-with-icon">
                        <Mail size={18} className="input-icon" />
                        <input type="email" placeholder="seu@email.com" required value={email} onChange={e => setEmail(e.target.value)} />
                    </div>
                </div>

                <div className="input-group">
                    <label>Senha</label>
                    <div className="input-with-icon">
                        <Lock size={18} className="input-icon" />
                        <input type="password" placeholder="Crie uma senha forte" required value={password} onChange={e => setPassword(e.target.value)} />
                    </div>
                </div>

                <div className="input-group">
                    <label>Instagram (Opcional)</label>
                    <div className="input-with-icon">
                        <Instagram size={18} className="input-icon" />
                        <input type="text" placeholder="@seu_usuario" value={instagram} onChange={e => setInstagram(e.target.value)} />
                    </div>
                </div>

                <div className="form-submit-container">
                    <Button fullWidth variant="primary" type="submit" disabled={loading}>
                        {loading ? 'Criando conta...' : 'Finalizar Cadastro'}
                    </Button>
                </div>
            </form>
        </div>
    );
}
