import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '../components/Button';
import { ArrowLeft, Upload, User, MapPin, Mail, Phone, Hash, Clock, BookOpen, Lock } from 'lucide-react';
import { supabase } from '../lib/supabase';
import { useUser } from '@clerk/clerk-react';
import './RegisterForms.css';

export function RegisterArtist() {
    const navigate = useNavigate();
    const { user, isLoaded } = useUser();
    
    // Limits based on plan
    const profile = user?.publicMetadata;
    const planLimits = {
        'free': 10,
        'mochileiro': 15,
        'viajante': 50,
        'pro': 100,
        'estudio': 200
    };
    const maxPhotos = planLimits[profile?.subscription_plan] || 10;
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [name, setName] = useState('');
    const [city, setCity] = useState('');
    const [phone, setPhone] = useState('');
    const [experience, setExperience] = useState('');
    const [styles, setStyles] = useState('');
    const [error, setError] = useState(null);
    const [loading, setLoading] = useState(false);

    const [avatarFile, setAvatarFile] = useState(null);
    const [avatarPreview, setAvatarPreview] = useState(null);
    const [portfolioFiles, setPortfolioFiles] = useState([]); // Array of { file, preview }

    const handleRegister = async (e) => {
        e.preventDefault();
        setError(null);
        setLoading(true);

        try {
            // 1. Create the user
            const { data: authData, error: authError } = await supabase.auth.signUp({
                email,
                password,
                options: {
                    data: {
                        full_name: name,
                        role: 'artist',
                        city: city,
                        phone: phone,
                        experience: experience,
                        styles: styles,
                    }
                }
            });

            if (authError) throw authError;

            const userId = authData.user.id;

            // 2. Upload Avatar if selected
            if (avatarFile) {
                const fileExt = avatarFile.name.split('.').pop();
                const fileName = `${userId}/avatar.${fileExt}`;

                const { error: uploadError } = await supabase.storage
                    .from('portfolios')
                    .upload(fileName, avatarFile);

                if (!uploadError) {
                    const { data: { publicUrl } } = supabase.storage.from('portfolios').getPublicUrl(fileName);

                    // Update user profile with avatar URL
                    await supabase
                        .from('profiles')
                        .update({ avatar_url: publicUrl })
                        .eq('id', userId);
                }
            }

            // 3. Upload Portfolio Images if any
            if (portfolioFiles.length > 0) {
                const uploadPromises = portfolioFiles.map(async (pf, index) => {
                    const fileExt = pf.file.name.split('.').pop();
                    const fileName = `${userId}/portfolio_${index}_${Date.now()}.${fileExt}`;

                    const { error: uploadError } = await supabase.storage
                        .from('portfolios')
                        .upload(fileName, pf.file);

                    if (!uploadError) {
                        const { data: { publicUrl } } = supabase.storage.from('portfolios').getPublicUrl(fileName);
                        return { user_id: userId, image_url: publicUrl };
                    }
                    return null;
                });

                const uploadedPortfolioItems = (await Promise.all(uploadPromises)).filter(Boolean);

                if (uploadedPortfolioItems.length > 0) {
                    await supabase.from('posts').insert(uploadedPortfolioItems);
                }
            }

            // CRITICAL FIX: The Supabase trigger takes a few milliseconds to create the profile row.
            // If we navigate too fast, AuthContext sees "no profile" and falls back to Client.
            // We force the role in localStorage immediately:
            localStorage.setItem('inkoraRole', 'artist');

            // And wait 1 second for the backend trigger to finish before navigating:
            setTimeout(() => {
                navigate('/home');
                window.location.reload(); // Force a fresh state load so App.jsx catches the new role
            }, 1000);

        } catch (err) {
            setError(err.message);
        } finally {
            setLoading(false);
        }
    };

    const handleAvatarChange = (e) => {
        if (e.target.files && e.target.files[0]) {
            const file = e.target.files[0];
            setAvatarFile(file);
            setAvatarPreview(URL.createObjectURL(file));
        }
    };

    const handlePortfolioChange = (e) => {
        if (e.target.files) {
            const newFiles = Array.from(e.target.files).map(file => ({
                file,
                preview: URL.createObjectURL(file)
            }));
            
            if (portfolioFiles.length + newFiles.length > maxPhotos) {
                alert(`Ops! Seu plano atual permite no máximo ${maxPhotos} fotos. Faça um upgrade nos "Planos" para postar mais!`);
                return;
            }

            setPortfolioFiles(prev => [...prev, ...newFiles].slice(0, maxPhotos));
        }
    };

    const removePortfolioImage = (indexToRemove) => {
        setPortfolioFiles(prev => prev.filter((_, index) => index !== indexToRemove));
    };

    return (
        <div className="auth-page form-page">
            <header className="role-header-nav">
                <button className="back-btn-ghost" onClick={() => navigate('/register')}>
                    <ArrowLeft size={24} />
                </button>
                <h2 className="form-header-title">Cadastro: Tatuador</h2>
            </header>

            <form className="auth-form scrollable-form" onSubmit={handleRegister}>
                {error && <div style={{ color: 'var(--primary)', marginBottom: '16px', fontSize: '14px', textAlign: 'center' }}>{error}</div>}

                <div className="photo-upload-section" style={{ position: 'relative' }}>
                    <div className="photo-placeholder round" style={avatarPreview ? { backgroundImage: `url(${avatarPreview})`, backgroundSize: 'cover', backgroundPosition: 'center', border: 'none' } : {}}>
                        {!avatarPreview && (
                            <>
                                <Upload size={24} className="upload-icon" />
                                <span>Foto Perfil</span>
                            </>
                        )}
                    </div>
                    <input
                        type="file"
                        accept="image/*"
                        onChange={handleAvatarChange}
                        style={{ position: 'absolute', top: 0, left: 0, width: '100%', height: '100%', opacity: 0, cursor: 'pointer' }}
                    />
                </div>

                <div className="input-group">
                    <label>Portfólio (Até {maxPhotos} fotos)</label>
                    <p className="auth-subtitle" style={{ fontSize: '12px', marginTop: '-4px' }}>
                        {profile?.subscription_plan && profile.subscription_plan !== 'free' 
                          ? `Benefício do plano ${profile.subscription_plan} ativo.` 
                          : 'Plano gratuito limitado a 10 fotos.'}
                    </p>

                    <div className="photo-grid-upload">
                        {/* Display existing previews */}
                        {portfolioFiles.map((pf, i) => (
                            <div key={i} className="photo-slot" style={{ backgroundImage: `url(${pf.preview})`, backgroundSize: 'cover', backgroundPosition: 'center', border: 'none', position: 'relative' }}>
                                <div
                                    style={{ position: 'absolute', top: '2px', right: '2px', background: 'rgba(0,0,0,0.5)', borderRadius: '50%', width: '20px', height: '20px', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'white', cursor: 'pointer', zIndex: 10 }}
                                    onClick={(e) => { e.stopPropagation(); removePortfolioImage(i); }}
                                >
                                    ×
                                </div>
                            </div>
                        ))}

                        {/* Empty slots */}
                        {portfolioFiles.length < maxPhotos && (
                            <div className="photo-slot" style={{ position: 'relative' }}>
                                <Upload size={16} />
                                <span style={{ marginTop: '4px' }}>Foto</span>
                                <input
                                    type="file"
                                    accept="image/*"
                                    multiple
                                    onChange={handlePortfolioChange}
                                    style={{ position: 'absolute', top: 0, left: 0, width: '100%', height: '100%', opacity: 0, cursor: 'pointer' }}
                                />
                            </div>
                        )}
                    </div>
                    {portfolioFiles.length >= maxPhotos && (
                        <p style={{ color: 'var(--primary)', fontSize: '12px', marginTop: '8px', cursor: 'pointer', fontWeight: 'bold' }} onClick={() => navigate('/planos')}>
                            Limite atingido! Clique aqui para fazer Upgrade.
                        </p>
                    )}
                </div>

                <div className="input-group" style={{ marginTop: '16px' }}>
                    <label>Nome Artístico / Completo</label>
                    <div className="input-with-icon">
                        <User size={18} className="input-icon" />
                        <input type="text" placeholder="Seu nome" required value={name} onChange={e => setName(e.target.value)} />
                    </div>
                </div>

                <div className="input-group">
                    <label>Endereço / Cidade Base</label>
                    <div className="input-with-icon">
                        <MapPin size={18} className="input-icon" />
                        <input type="text" placeholder="Ex: São Paulo, SP" required value={city} onChange={e => setCity(e.target.value)} />
                    </div>
                </div>

                <div className="input-group">
                    <label>Email Profissional</label>
                    <div className="input-with-icon">
                        <Mail size={18} className="input-icon" />
                        <input type="email" placeholder="contato@tattoo.com" required value={email} onChange={e => setEmail(e.target.value)} />
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
                    <label>Anos de Profissão</label>
                    <div className="input-with-icon">
                        <Clock size={18} className="input-icon" />
                        <input type="number" min="0" placeholder="Ex: 5" required value={experience} onChange={e => setExperience(e.target.value)} />
                    </div>
                </div>

                <div className="input-group">
                    <label>Estilos Principais</label>
                    <div className="input-with-icon">
                        <BookOpen size={18} className="input-icon" />
                        <input type="text" placeholder="Ex: Realismo, Blackwork..." required value={styles} onChange={e => setStyles(e.target.value)} />
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
                        {loading ? 'Finalizando...' : 'Concluir Perfil de Artista'}
                    </Button>
                </div>
            </form>
        </div>
    );
}
