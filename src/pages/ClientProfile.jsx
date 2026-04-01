import { useState } from 'react';
import { MOCK_ARTISTS } from '../data/mockData';
import { ArtistCard } from '../components/ArtistCard';
import { Settings, Bell, LogOut } from 'lucide-react';
import { useUser, useClerk } from '@clerk/clerk-react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '../lib/supabase';
import './ClientProfile.css';

export function ClientProfile() {
    const [activeTab, setActiveTab] = useState('saved');
    const { user, isLoaded } = useUser();
    const { signOut } = useClerk();
    const navigate = useNavigate();
    const profile = user?.publicMetadata;

    // Edit Profile State
    const [isEditing, setIsEditing] = useState(false);
    const [editForm, setEditForm] = useState({
        full_name: profile?.full_name || user?.fullName || '',
        city: profile?.city || ''
    });
    const [saving, setSaving] = useState(false);

    const handleSignOut = async () => {
        await signOut();
        navigate('/');
    };

    // Filter only saved artists for the demonstration
    const savedArtists = MOCK_ARTISTS.filter(a => a.saved || a.id === '2');

    const displayName = isEditing ? editForm.full_name : (profile?.full_name || user?.fullName || user?.primaryEmailAddress?.emailAddress?.split('@')[0] || 'Visitante');
    const displayCity = isEditing ? editForm.city : (profile?.city || 'São Paulo, BR');
    const initial = displayName.charAt(0).toUpperCase();

    const handleSaveProfile = async () => {
        if (!user) return;
        setSaving(true);
        try {
            const { error } = await supabase
                .from('profiles')
                .update({
                    full_name: editForm.full_name,
                    city: editForm.city
                })
                .eq('id', user.id);

            if (error) throw error;

            setIsEditing(false);
            alert('Perfil atualizado com sucesso! (Recarregue para ver em todas as telas)');
        } catch (error) {
            console.error("Error saving profile", error);
            alert("Erro ao salvar perfil");
        } finally {
            setSaving(false);
        }
    };

    const handleAvatarUpload = async (e) => {
        const file = e.target.files?.[0];
        if (!file || !user) return;

        setSaving(true);
        try {
            const fileExt = file.name.split('.').pop();
            const fileName = `${user.id}/avatar_${Date.now()}.${fileExt}`;

            // Upload the new avatar
            const { error: uploadError } = await supabase.storage
                .from('portfolios')
                .upload(fileName, file);

            if (uploadError) throw uploadError;

            // Get Public URL
            const { data: { publicUrl } } = supabase.storage.from('portfolios').getPublicUrl(fileName);

            // Update user profile with avatar URL
            const { error: updateError } = await supabase
                .from('profiles')
                .update({ avatar_url: publicUrl })
                .eq('id', user.id);

            if (updateError) throw updateError;

            alert('Foto de perfil atualizada! (Recarregue para ver em todas as telas)');

        } catch (error) {
            console.error("Error uploading avatar", error);
            alert("Erro ao enviar foto.");
        } finally {
            setSaving(false);
        }
    };

    return (
        <div className="client-profile-page">
            <header className="client-header">
                <h1 className="client-title">Meu Perfil</h1>
                <div className="client-actions">
                    <button className="icon-btn" onClick={handleSignOut} title="Sair"><LogOut size={24} /></button>
                    <button className="icon-btn"><Bell size={24} /></button>
                    <button
                        className="icon-btn"
                        onClick={() => isEditing ? handleSaveProfile() : setIsEditing(true)}
                        style={isEditing ? { color: 'var(--primary)', fontWeight: 'bold' } : {}}
                    >
                        {saving ? '...' : (isEditing ? 'Salvar' : <Settings size={24} />)}
                    </button>
                </div>
            </header>

            <div className="client-info">
                <div className="client-avatar" style={profile?.avatar_url ? { backgroundImage: `url(${profile.avatar_url})`, backgroundSize: 'cover', backgroundPosition: 'center', color: 'transparent' } : { position: 'relative' }}>
                    {!profile?.avatar_url && <span>{initial}</span>}
                    {isEditing && (
                        <>
                            <div style={{ position: 'absolute', inset: 0, backgroundColor: 'rgba(0,0,0,0.5)', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'white', fontSize: '10px', textAlign: 'center', padding: '10px' }}>
                                Trocar Foto
                            </div>
                            <input
                                type="file"
                                accept="image/*"
                                onChange={handleAvatarUpload}
                                style={{ position: 'absolute', inset: 0, opacity: 0, cursor: 'pointer' }}
                            />
                        </>
                    )}
                </div>
                <div style={{ flex: 1 }}>
                    {isEditing ? (
                        <>
                            <input
                                type="text"
                                value={editForm.full_name}
                                onChange={(e) => setEditForm({ ...editForm, full_name: e.target.value })}
                                style={{ background: 'var(--surface)', color: 'white', border: '1px solid var(--border-color)', borderRadius: '4px', padding: '4px 8px', marginBottom: '8px', width: '100%' }}
                            />
                            <input
                                type="text"
                                value={editForm.city}
                                onChange={(e) => setEditForm({ ...editForm, city: e.target.value })}
                                style={{ background: 'var(--surface)', color: 'var(--text-secondary)', border: '1px solid var(--border-color)', borderRadius: '4px', padding: '4px 8px', width: '100%' }}
                            />
                        </>
                    ) : (
                        <>
                            <h2 className="client-name">{displayName}</h2>
                            <p className="client-location">{displayCity}</p>
                        </>
                    )}
                </div>
            </div>

            <div className="tabs">
                <button
                    className={`tab ${activeTab === 'saved' ? 'active' : ''}`}
                    onClick={() => setActiveTab('saved')}
                >
                    Artistas Salvos
                </button>
                <button
                    className={`tab ${activeTab === 'bookings' ? 'active' : ''}`}
                    onClick={() => setActiveTab('bookings')}
                >
                    Meus Orçamentos
                </button>
            </div>

            <div className="tab-content">
                {activeTab === 'saved' ? (
                    <div className="saved-list">
                        {savedArtists.map(artist => (
                            <ArtistCard key={artist.id} artist={artist} />
                        ))}
                    </div>
                ) : (
                    <div className="empty-state">
                        <p>Você ainda não tem orçamentos ou reservas ativas.</p>
                    </div>
                )}
            </div>
        </div>
    );
}
