import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '../components/Button';
import { ArrowLeft, Upload, Store, MapPin, Calendar, Phone, Mail, Hash, Layers, Users, Lock } from 'lucide-react';
import { supabase } from '../lib/supabase';
import './RegisterForms.css';

export function RegisterStudio() {
    const navigate = useNavigate();
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [name, setName] = useState('');
    const [cnpj, setCnpj] = useState('');
    const [address, setAddress] = useState('');
    const [creationDate, setCreationDate] = useState('');
    const [phone, setPhone] = useState('');
    const [benches, setBenches] = useState('');
    const [spots, setSpots] = useState('');
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
                    role: 'studio',
                    cnpj: cnpj,
                    address: address, // maps to city/state or generic address
                    creation_date: creationDate,
                    phone: phone,
                    total_benches: benches,
                    guest_spots_available: spots,
                }
            }
        });

        if (error) {
            setError(error.message);
            setLoading(false);
        } else {
            localStorage.setItem('inkoraRole', 'studio');
            navigate('/home');
        }
    };

    return (
        <div className="auth-page form-page">
            <header className="role-header-nav">
                <button className="back-btn-ghost" onClick={() => navigate('/register')}>
                    <ArrowLeft size={24} />
                </button>
                <h2 className="form-header-title">Cadastro de Estúdio</h2>
            </header>

            <form className="auth-form scrollable-form" onSubmit={handleRegister}>
                {error && <div style={{ color: 'var(--primary)', marginBottom: '16px', fontSize: '14px', textAlign: 'center' }}>{error}</div>}

                <div className="input-group">
                    <label>Fotos do Local (Até 10 fotos)</label>
                    <p className="auth-subtitle" style={{ fontSize: '12px', marginTop: '-4px' }}>Mostre a estrutura para os artistas</p>
                    <div className="photo-grid-upload">
                        {[...Array(10)].map((_, i) => (
                            <div key={i} className="photo-slot">
                                <Upload size={16} />
                                <span style={{ marginTop: '4px' }}>Foto {i + 1}</span>
                            </div>
                        ))}
                    </div>
                </div>

                <div className="input-group" style={{ marginTop: '16px' }}>
                    <label>Nome do Estúdio</label>
                    <div className="input-with-icon">
                        <Store size={18} className="input-icon" />
                        <input type="text" placeholder="Nome oficial" required value={name} onChange={e => setName(e.target.value)} />
                    </div>
                </div>

                <div className="input-group">
                    <label>CNPJ</label>
                    <div className="input-with-icon">
                        <Hash size={18} className="input-icon" />
                        <input type="text" placeholder="00.000.000/0000-00" required value={cnpj} onChange={e => setCnpj(e.target.value)} />
                    </div>
                </div>

                <div className="input-group">
                    <label>Endereço Completo</label>
                    <div className="input-with-icon">
                        <MapPin size={18} className="input-icon" />
                        <input type="text" placeholder="Rua, Número, Bairro, CEP" required value={address} onChange={e => setAddress(e.target.value)} />
                    </div>
                </div>

                <div className="input-group">
                    <label>Data de Criação</label>
                    <div className="input-with-icon">
                        <Calendar size={18} className="input-icon" />
                        <input type="date" required value={creationDate} onChange={e => setCreationDate(e.target.value)} />
                    </div>
                </div>

                <div className="input-group">
                    <label>Telefone / WhatsApp</label>
                    <div className="input-with-icon">
                        <Phone size={18} className="input-icon" />
                        <input type="tel" placeholder="(00) 00000-0000" required value={phone} onChange={e => setPhone(e.target.value)} />
                    </div>
                </div>

                <div className="input-group">
                    <label>Email de Contato</label>
                    <div className="input-with-icon">
                        <Mail size={18} className="input-icon" />
                        <input type="email" placeholder="contato@estudio.com" required value={email} onChange={e => setEmail(e.target.value)} />
                    </div>
                </div>

                <div className="input-group">
                    <label>Quantidade de Bancadas</label>
                    <div className="input-with-icon">
                        <Layers size={18} className="input-icon" />
                        <input type="number" min="1" placeholder="Ex: 4" required value={benches} onChange={e => setBenches(e.target.value)} />
                    </div>
                </div>

                <div className="input-group">
                    <label>Vagas Disponíveis por Estilo</label>
                    <div className="input-with-icon">
                        <Users size={18} className="input-icon" />
                        <input type="text" placeholder="Ex: 2 vagas para Realismo" required value={spots} onChange={e => setSpots(e.target.value)} />
                    </div>
                </div>

                <div className="input-group">
                    <label>Senha</label>
                    <div className="input-with-icon">
                        <Lock size={18} className="input-icon" />
                        <input type="password" placeholder="Crie uma senha forte" required value={password} onChange={e => setPassword(e.target.value)} />
                    </div>
                </div>

                <div className="form-submit-container">
                    <Button fullWidth variant="primary" type="submit" disabled={loading}>
                        {loading ? 'Finalizando...' : 'Finalizar Cadastro de Estúdio'}
                    </Button>
                </div>
            </form>
        </div>
    );
}
