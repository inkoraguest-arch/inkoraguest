import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { MOCK_ARTISTS } from '../data/mockData';
import { ArrowLeft, MapPin, Star, Share2, MessageCircle, LogOut, Loader } from 'lucide-react';
import { PhotoGrid } from '../components/PhotoGrid';
import { CalendarManager } from '../components/CalendarManager';
import { Button } from '../components/Button';
import { useUser, useClerk } from '@clerk/clerk-react';
import { supabase } from '../lib/supabase';

import './ArtistProfile.css';

export function ArtistProfile() {
    const { id } = useParams();
    const navigate = useNavigate();
    const { user } = useUser();
    const { signOut } = useClerk();
    
    // Create a mock profile object that mimics the old AuthContext structure for database operations
    const profile = user ? {
        id: user.id,
        role: user.publicMetadata?.role || localStorage.getItem('inkoraRole')
    } : null;


    const [artist, setArtist] = useState(null);
    const [loading, setLoading] = useState(true);

    // Edit Profile State
    const [isEditing, setIsEditing] = useState(false);
    const [editForm, setEditForm] = useState({
        bio: '',
        styles: '',
        price_range: '',
        schedule_text: '',
        spots_status: '',
        address: '',
        pix_key: ''
    });
    const [saving, setSaving] = useState(false);
    const [selectedSlot, setSelectedSlot] = useState(null);
    const [guestSpots, setGuestSpots] = useState([]);
    const [isAddGuestOpen, setIsAddGuestOpen] = useState(false);
    const [newGuest, setNewGuest] = useState({
        location_name: '',
        start_date: '',
        end_date: ''
    });
    const [products, setProducts] = useState([]);

    useEffect(() => {
        fetchArtist();
        fetchGuestSpots();
        fetchProducts();
    }, [id]);

    const fetchGuestSpots = async () => {
        try {
            const { data, error } = await supabase
                .from('guest_spots')
                .select('*')
                .eq('artist_id', id)
                .order('start_date', { ascending: true });

            if (data) setGuestSpots(data);
        } catch (e) {
            console.error("Error fetching guest spots", e);
        }
    };

    const fetchProducts = async () => {
        try {
            const { data, error } = await supabase
                .from('products')
                .select('*')
                .eq('seller_id', id)
                .order('created_at', { ascending: false });

            if (data) setProducts(data);
        } catch (e) {
            console.error("Error fetching products", e);
        }
    };

    const fetchArtist = async () => {
        try {
            // First try to find it in the database (assuming ID is a UUID from Supabase)
            const { data, error } = await supabase
                .from('profiles')
                .select(`
                    *,
                    artists (*),
                    studios (*)
                `)
                .eq('id', id)
                .single();

            if (data) {
                const artistData = Array.isArray(data.artists) ? data.artists[0] : data.artists;
                const studioData = Array.isArray(data.studios) ? data.studios[0] : data.studios;
                const profileData = artistData || studioData;

                const isStudio = data.role === 'studio';
                const defaultName = isStudio ? 'Estúdio Inkora' : 'Artista Inkora';

                let styles = ['Diversos estilos'];
                if (artistData?.primary_styles) {
                    try {
                        styles = Array.isArray(artistData.primary_styles)
                            ? artistData.primary_styles
                            : [artistData.primary_styles];
                    } catch (e) { }
                }

                const finalBio = profileData?.bio || (isStudio ? 'Estúdio focado em excelência e diversos estilos.' : 'Tatuador apaixonado por arte e focado em criar peças únicas originais.');
                const finalPriceRange = profileData?.price_range || 'A combinar';
                const finalSchedule = profileData?.schedule_text || 'Atendimento na base. Próxima viagem: indeterminada.';
                const finalSpots = profileData?.spots_status || 'Agenda Aberta';

                setArtist({
                    id: data.id,
                    role: data.role,
                    name: data.full_name || defaultName,
                    currentCity: data.city || 'Local indefinido',
                    phone: data.phone,
                    rating: '5.0',
                    reviews: 0,
                    priceRange: finalPriceRange,
                    styles: styles,
                    bio: finalBio,
                    scheduleText: finalSchedule,
                    spotsStatus: finalSpots,
                    profilePic: data.avatar_url || null,
                    portfolioFull: artistData?.portfolio_urls || studioData?.studio_photos || [],
                    address: data.address || '',
                    pixKey: data.pix_key || ''
                });

                // Initialize edit form
                setEditForm({
                    bio: finalBio,
                    styles: styles.join(', '),
                    price_range: finalPriceRange,
                    schedule_text: finalSchedule,
                    spots_status: finalSpots,
                    address: data.address || '',
                    pix_key: data.pix_key || ''
                });

            } else {
                setArtist(null);
            }
        } catch (error) {
            console.error('Error fetching artist details:', error);
            setArtist(null);
        } finally {
            setLoading(false);
        }
    };

    const handleShare = () => {
        const url = window.location.href;
        navigator.clipboard.writeText(url).then(() => {
            alert('Link do perfil copiado!');
        });
    };

    const handleSignOut = async () => {
        await signOut();
        navigate('/');
    };

    const handleWhatsAppClick = () => {
        if (!artist) return;
        const phone = artist.phone ? artist.phone.replace(/\D/g, '') : '5511999999999';

        let slotInfo = '';
        if (selectedSlot) {
            const dateStr = new Date(selectedSlot.slot_date + 'T00:00:00').toLocaleDateString('pt-BR');
            slotInfo = ` para o dia ${dateStr} às ${selectedSlot.slot_time}`;
        } else if (artist.spotsStatus && artist.spotsStatus !== 'Consultar') {
            slotInfo = ` referente a: ${artist.spotsStatus}`;
        }

        if (artist.pixKey && artist.pixKey.trim() !== '') {
            navigator.clipboard.writeText(artist.pixKey).catch(() => {});
            alert(`Pagamento / Orçamento\n\nA Chave PIX do artista é: ${artist.pixKey}\n(Já copiamos ela para você!)\n\nVamos te levar para o WhatsApp para você confirmar os detalhes e enviar o comprovante.`);
        }

        const message = encodeURIComponent(`Olá ${artist.name}, gostei muito do seu portfólio no app Inkora e gostaria de solicitar um orçamento para uma tatuagem${slotInfo}!`);
        window.open(`https://wa.me/${phone}?text=${message}`, '_blank');
    };

    const handleProductClick = (product) => {
        if (!artist) return;
        const phone = artist.phone ? artist.phone.replace(/\D/g, '') : '5511999999999';
        
        if (artist.pixKey && artist.pixKey.trim() !== '') {
            navigator.clipboard.writeText(artist.pixKey).catch(() => {});
            alert(`Reserva de Produto: ${product.title}\n\nValor: R$ ${product.price}\nChave PIX: ${artist.pixKey}\n(Copiamos para você!)\n\nVamos ao WhatsApp para concluir a reserva.`);
        }

        const message = encodeURIComponent(`Olá ${artist.name}, tenho interesse no seu produto "${product.title}" (R$ ${product.price}) que vi no seu perfil do Inkora!`);
        window.open(`https://wa.me/${phone}?text=${message}`, '_blank');
    };

    const handleSaveProfile = async () => {
        setSaving(true);
        try {
            // Update the artists table
            const stylesArray = editForm.styles.split(',').map(s => s.trim()).filter(s => s);

            // Determine which table to upsert to
            const table = profile.role === 'artist' ? 'artists' : 'studios';
            const dataToUpsert = profile.role === 'artist' ? {
                profile_id: profile.id,
                bio: editForm.bio,
                primary_styles: stylesArray,
                price_range: editForm.price_range,
                schedule_text: editForm.schedule_text,
                spots_status: editForm.spots_status
            } : {
                profile_id: profile.id,
                bio: editForm.bio, // Studios also have bio/photos
                studio_photos: artist.portfolioFull, // Use current portfolio for studio photos
                price_range: editForm.price_range,
                schedule_text: editForm.schedule_text,
                spots_status: editForm.spots_status
            };

            const { error: upsertError } = await supabase
                .from(table)
                .upsert(dataToUpsert, { onConflict: 'profile_id' });

            if (upsertError) {
                console.error(`DEBUG: ${table} Save Error`, upsertError);
                throw upsertError;
            }

            // Update profiles table for address and pix
            const { error: profileError } = await supabase
                .from('profiles')
                .update({ address: editForm.address, pix_key: editForm.pix_key })
                .eq('id', profile.id);

            if (profileError) throw profileError;

            // Optimistic UI update
            setArtist(prev => ({
                ...prev,
                bio: editForm.bio,
                styles: stylesArray.length > 0 ? stylesArray : ['Diversos estilos'],
                priceRange: editForm.price_range,
                scheduleText: editForm.schedule_text,
                spotsStatus: editForm.spots_status,
                address: editForm.address,
                pixKey: editForm.pix_key
            }));

            setIsEditing(false);
        } catch (error) {
            console.error("Error saving profile", error);
            alert("Erro ao salvar perfil");
        } finally {
            setSaving(false);
        }
    };

    const handleImageUpload = async (e) => {
        const file = e.target.files[0];
        if (!file || !profile) return;
        
        if (file.size > 15 * 1024 * 1024) {
            alert('Arquivo muito grande! O limite é de 15MB para fotos e vídeos.');
            return;
        }

        setSaving(true);
        try {
            // 1. Upload to Storage
            const fileExt = file.name.split('.').pop();
            const fileName = `${profile.id}-${Math.random()}.${fileExt}`;
            const filePath = `${fileName}`;

            const { error: uploadError } = await supabase.storage
                .from('portfolios')
                .upload(filePath, file);

            if (uploadError) throw uploadError;

            // 2. Get Public URL
            const { data: { publicUrl } } = supabase.storage
                .from('portfolios')
                .getPublicUrl(filePath);

            // 3. Update artist table
            const newPortfolioUrls = [publicUrl, ...(artist.portfolioFull || [])];

            const { error: updateError } = await supabase
                .from('artists')
                .update({
                    portfolio_urls: newPortfolioUrls
                })
                .eq('profile_id', profile.id);

            if (updateError) throw updateError;

            // 4. Update UI
            setArtist(prev => ({
                ...prev,
                portfolioFull: newPortfolioUrls
            }));

        } catch (error) {
            console.error("Error uploading image", error);
            alert("Erro ao fazer upload da imagem.");
        } finally {
            setSaving(false);
        }
    };

    const handleAvatarUpload = async (e) => {
        const file = e.target.files?.[0];
        if (!file || !profile) return;

        setSaving(true);
        try {
            const fileExt = file.name.split('.').pop();
            const fileName = `${profile.id}/avatar_${Date.now()}.${fileExt}`;

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
                .eq('id', profile.id);

            if (updateError) throw updateError;

            // Optimistic UI Update
            setArtist(prev => ({
                ...prev,
                profilePic: publicUrl
            }));

        } catch (error) {
            console.error("Error uploading avatar", error);
            alert("Erro ao enviar foto de perfil.");
        } finally {
            setSaving(false);
        }
    };

    const handleDeletePhoto = async (photoUrl) => {
        if (!confirm('Tem certeza que deseja apagar esta foto do portfólio?')) return;
        setSaving(true);
        try {
            // Extract file path from URL (Supabase URL structure: .../portfolios/userId/filename.ext)
            // This is a naive extraction that works for standard Supabase setups
            const urlParts = photoUrl.split('/portfolios/');
            if (urlParts.length > 1) {
                const filePath = urlParts[1].split('?')[0]; // Remove any query params just in case

                // 1. Delete from Storage
                const { error: deleteError } = await supabase.storage
                    .from('portfolios')
                    .remove([filePath]);

                if (deleteError) {
                    console.error("Storage delete error (might be okay if it was a mock image):", deleteError);
                    // We don't throw here strictly because old mock images might not exist in this storage bucket, 
                    // but we still want to remove them from the DB array below.
                }
            }

            // 2. Remove from Artist DB Array
            const newPortfolioUrls = (artist.portfolioFull || []).filter(url => url !== photoUrl);

            const { error: updateError } = await supabase
                .from('artists')
                .update({ portfolio_urls: newPortfolioUrls })
                .eq('profile_id', profile.id);

            if (updateError) throw updateError;

            // 3. Update UI
            setArtist(prev => ({
                ...prev,
                portfolioFull: newPortfolioUrls
            }));

        } catch (error) {
            console.error("Error deleting photo", error);
            alert("Erro ao apagar a foto.");
        } finally {
            setSaving(false);
        }
    };

    const handleAddGuestSpot = async () => {
        if (!newGuest.location_name || !newGuest.start_date || !newGuest.end_date) {
            alert("Por favor, preencha todos os campos da viagem (Local e Datas).");
            return;
        }

        if (!profile) {
            alert("Você precisa estar logado para adicionar viagens.");
            return;
        }

        setSaving(true);
        try {
            const { data, error } = await supabase
                .from('guest_spots')
                .insert([{
                    artist_id: profile.id,
                    ...newGuest
                }])
                .select();

            if (error) throw error;

            if (data && data.length > 0) {
                setGuestSpots(prev => [...prev, data[0]]);
                setNewGuest({ location_name: '', start_date: '', end_date: '' });
                setIsAddGuestOpen(false);
            }
        } catch (error) {
            console.error("DEBUG: Error adding guest spot", {
                user_id: profile?.id,
                payload: newGuest,
                error
            });
            alert(`Erro ao adicionar Guest Spot: ${error.message || 'Erro desconhecido'}`);
        } finally {
            setSaving(false);
        }
    };

    const handleDeleteGuestSpot = async (spotId) => {
        if (!confirm('Excluir este Guest Spot?')) return;
        setSaving(true);
        try {
            const { error } = await supabase
                .from('guest_spots')
                .delete()
                .eq('id', spotId);

            if (error) throw error;
            setGuestSpots(prev => prev.filter(s => s.id !== spotId));
        } catch (error) {
            console.error("Error deleting guest spot", error);
        } finally {
            setSaving(false);
        }
    };

    if (loading) {
        return (
            <div className="artist-profile-page" style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh' }}>
                <Loader className="spin" size={32} color="var(--primary)" />
            </div>
        );
    }

    if (!artist) {
        return <div className="not-found">Artista não encontrado</div>;
    }

    // Determine if the current user is viewing their own profile (robust check)
    const isOwner = profile?.id === id;

    return (
        <div className="artist-profile-page">
            <header className="profile-header">
                <button className="back-btn" onClick={() => navigate(-1)}>
                    <ArrowLeft size={24} />
                </button>
                <div style={{ display: 'flex', gap: '8px' }}>

                    {isOwner && (
                        <button
                            className="share-btn"
                            onClick={() => isEditing ? handleSaveProfile() : setIsEditing(true)}
                            style={{ width: 'auto', padding: '0 16px', borderRadius: '20px', fontSize: '14px', fontWeight: 'bold' }}
                            disabled={saving}
                        >
                            {saving ? '...' : isEditing ? 'Salvar' : 'Editar'}
                        </button>
                    )}

                    <button className="share-btn" onClick={handleShare}>
                        <Share2 size={24} />
                    </button>

                    {isOwner && (
                        <button className="share-btn" onClick={handleSignOut} title="Sair do Perfil">
                            <LogOut size={24} color="#E52020" />
                        </button>
                    )}
                </div>
            </header>

            <div className="profile-info-container">
                <div style={{ position: 'relative', display: 'inline-block' }}>
                    {artist.profilePic ? (
                        <img src={artist.profilePic} alt={artist.name} className="profile-main-img" />
                    ) : (
                        <div className="profile-main-img-placeholder" style={{
                            width: '100px', height: '100px', borderRadius: '50%',
                            background: 'var(--surface)', border: '2px solid var(--primary)',
                            display: 'flex', justifyContent: 'center', alignItems: 'center', fontSize: '32px', fontWeight: 'bold', margin: '0 auto'
                        }}>
                            {artist.name.charAt(0)}
                        </div>
                    )}
                    {isEditing && (
                        <>
                            <div style={{ position: 'absolute', inset: 0, backgroundColor: 'rgba(0,0,0,0.5)', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'white', fontSize: '12px', textAlign: 'center', fontWeight: 'bold', pointerEvents: 'none' }}>
                                Trocar<br />Foto
                            </div>
                            <input
                                type="file"
                                accept="image/*"
                                onChange={handleAvatarUpload}
                                style={{ position: 'absolute', inset: 0, opacity: 0, cursor: 'pointer', zIndex: 10 }}
                            />
                        </>
                    )}
                </div>

                <div className="profile-details-content">
                    <h1 className="profile-name">{artist.name}</h1>

                    {isEditing ? (
                        <div style={{ marginBottom: '16px' }}>
                            <label style={{ fontSize: '12px', color: 'var(--text-secondary)' }}>Estilos (separados por vírgula)</label>
                            <input
                                type="text"
                                value={editForm.styles}
                                onChange={(e) => setEditForm({ ...editForm, styles: e.target.value })}
                                style={{
                                    width: '100%', padding: '8px', borderRadius: '8px',
                                    background: 'var(--surface)', border: '1px solid var(--border-color)',
                                    color: 'white', marginTop: '4px'
                                }}
                            />
                        </div>
                    ) : (
                        <p className="profile-styles">{artist.styles.join(' • ')}</p>
                    )}

                    <div className="profile-meta">
                        <span className="meta-item">
                            <Star size={14} className="icon-yellow" fill="currentColor" />
                            {artist.rating} ({artist.reviews})
                        </span>
                        <span className="meta-dot">•</span>
                        <span className="meta-item">
                            <MapPin size={14} className="icon-red" />
                            {artist.currentCity}
                        </span>
                        <span className="meta-dot">•</span>
                        {isEditing ? (
                            <input
                                type="text"
                                value={editForm.price_range}
                                onChange={(e) => setEditForm({ ...editForm, price_range: e.target.value })}
                                placeholder="Valores (ex: R$ 300+)"
                                style={{
                                    padding: '4px 8px', borderRadius: '4px',
                                    background: 'var(--surface)', border: '1px solid var(--border-color)',
                                    color: 'white', fontSize: '12px', width: '120px'
                                }}
                            />
                        ) : (
                            <span className="meta-item price-range">{artist.priceRange}</span>
                        )}
                    </div>

                    {isEditing ? (
                        <div style={{ marginBottom: '16px', marginTop: '16px' }}>
                            <label style={{ fontSize: '12px', color: 'var(--text-secondary)' }}>Endereço (Onde você está?)</label>
                            <input
                                type="text"
                                value={editForm.address}
                                onChange={(e) => setEditForm({ ...editForm, address: e.target.value })}
                                placeholder="ex: Rua Augusta, 1200, São Paulo - SP"
                                style={{
                                    width: '100%', padding: '8px', borderRadius: '8px',
                                    background: 'var(--surface)', border: '1px solid var(--border-color)',
                                    color: 'white', marginTop: '4px'
                                }}
                            />
                        </div>
                    ) : artist.address && (
                        <div className="profile-address" style={{ marginTop: '8px', display: 'flex', alignItems: 'center', gap: '6px', fontSize: '14px', color: 'var(--text-secondary)' }}>
                            <MapPin size={14} className="icon-red" />
                            <span>{artist.address}</span>
                        </div>
                    )}

                    {isEditing && (
                        <div style={{ marginBottom: '16px', marginTop: '16px' }}>
                            <label style={{ fontSize: '12px', color: 'var(--text-secondary)' }}>Sua Chave PIX (Para Recebimentos)</label>
                            <input
                                type="text"
                                value={editForm.pix_key}
                                onChange={(e) => setEditForm({ ...editForm, pix_key: e.target.value })}
                                placeholder="ex: (11) 99999-9999, email@pix.com..."
                                style={{
                                    width: '100%', padding: '8px', borderRadius: '8px',
                                    background: 'var(--surface)', border: '1px solid var(--border-color)',
                                    color: 'white', marginTop: '4px'
                                }}
                            />
                        </div>
                    )}

                    {isEditing ? (
                        <div style={{ marginBottom: '16px', marginTop: '16px' }}>
                            <label style={{ fontSize: '12px', color: 'var(--text-secondary)' }}>Sua Biografia</label>
                            <textarea
                                value={editForm.bio}
                                rows="4"
                                onChange={(e) => setEditForm({ ...editForm, bio: e.target.value })}
                                style={{
                                    width: '100%', padding: '8px', borderRadius: '8px',
                                    background: 'var(--surface)', border: '1px solid var(--border-color)',
                                    color: 'white', marginTop: '4px', resize: 'vertical'
                                }}
                            />
                        </div>
                    ) : (
                        <p className="profile-bio" style={{ marginTop: '16px' }}>{artist.bio}</p>
                    )}
                </div>
            </div>

            <div className="schedule-section">
                <CalendarManager
                    artistId={artist.id}
                    isOwner={isOwner && isEditing}
                    onSelectSlot={setSelectedSlot}
                />

                {!isEditing && (
                    <>
                        <h2 className="section-title">Informações Adicionais</h2>
                        <div className="schedule-list">
                            <div className="schedule-item">
                                <div className="schedule-info">
                                    <h4 className="schedule-city">{artist.scheduleText || 'Acompanhe no Instagram para novidades sobre a agenda.'}</h4>
                                </div>
                                <div className="schedule-status status-open">
                                    {artist.spotsStatus || 'Consultar'}
                                </div>
                            </div>
                        </div>

                        {guestSpots.length > 0 && (
                            <div style={{ marginTop: '16px' }}>
                                <h3 style={{ fontSize: '14px', fontWeight: 'bold', marginBottom: '12px', color: 'var(--text-secondary)' }}>Próximas Viagens (Guest Spots)</h3>
                                <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                                    {guestSpots.map(spot => (
                                        <div key={spot.id} style={{
                                            background: 'var(--surface)', padding: '12px', borderRadius: '12px',
                                            display: 'flex', justifyContent: 'space-between', alignItems: 'center', border: '1px solid var(--border-color)'
                                        }}>
                                            <div>
                                                <div style={{ fontWeight: 'bold', display: 'flex', alignItems: 'center', gap: '6px' }}>
                                                    <MapPin size={12} className="icon-red" />
                                                    {spot.location_name}
                                                </div>
                                                <div style={{ fontSize: '12px', color: 'var(--text-tertiary)', marginTop: '2px' }}>
                                                    {new Date(spot.start_date + 'T00:00:00').toLocaleDateString('pt-BR')} até {new Date(spot.end_date + 'T00:00:00').toLocaleDateString('pt-BR')}
                                                </div>
                                            </div>
                                            <div style={{ background: 'rgba(229, 32, 32, 0.1)', color: 'var(--primary)', fontSize: '10px', fontWeight: 'bold', padding: '4px 8px', borderRadius: '6px' }}>
                                                GUEST
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        )}
                    </>
                )}

                {isEditing && (
                    <div style={{ padding: '0 20px', display: 'flex', flexDirection: 'column', gap: '12px', marginTop: '12px' }}>
                        <div style={{ borderTop: '1px solid var(--border-color)', paddingTop: '16px', marginTop: '8px' }}>
                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px' }}>
                                <h3 style={{ fontSize: '14px', fontWeight: 'bold' }}>Gerenciar Guest Spots</h3>
                                <button
                                    onClick={() => setIsAddGuestOpen(!isAddGuestOpen)}
                                    style={{ background: 'var(--primary)', color: 'white', border: 'none', padding: '4px 12px', borderRadius: '12px', fontSize: '12px', fontWeight: 'bold' }}
                                >
                                    {isAddGuestOpen ? 'Cancelar' : '+ Novo Guest'}
                                </button>
                            </div>

                            {isAddGuestOpen && (
                                <div style={{ background: 'var(--surface)', padding: '16px', borderRadius: '12px', border: '1px solid var(--primary)', marginBottom: '16px', display: 'flex', flexDirection: 'column', gap: '12px' }}>
                                    <input
                                        type="text"
                                        placeholder="Cidade/Estado/País"
                                        value={newGuest.location_name}
                                        onChange={e => setNewGuest({ ...newGuest, location_name: e.target.value })}
                                        style={{ width: '100%', padding: '8px', borderRadius: '8px', background: 'var(--bg-tertiary)', border: '1px solid var(--border-color)', color: 'white' }}
                                    />
                                    <div style={{ display: 'flex', gap: '8px' }}>
                                        <div style={{ flex: 1 }}>
                                            <label style={{ fontSize: '10px', color: 'var(--text-tertiary)' }}>Início</label>
                                            <input
                                                type="date"
                                                value={newGuest.start_date}
                                                onChange={e => setNewGuest({ ...newGuest, start_date: e.target.value })}
                                                style={{ width: '100%', padding: '8px', borderRadius: '8px', background: 'var(--bg-tertiary)', border: '1px solid var(--border-color)', color: 'white' }}
                                            />
                                        </div>
                                        <div style={{ flex: 1 }}>
                                            <label style={{ fontSize: '10px', color: 'var(--text-tertiary)' }}>Fim</label>
                                            <input
                                                type="date"
                                                value={newGuest.end_date}
                                                onChange={e => setNewGuest({ ...newGuest, end_date: e.target.value })}
                                                style={{ width: '100%', padding: '8px', borderRadius: '8px', background: 'var(--bg-tertiary)', border: '1px solid var(--border-color)', color: 'white' }}
                                            />
                                        </div>
                                    </div>
                                    <button
                                        onClick={handleAddGuestSpot}
                                        disabled={saving}
                                        style={{ width: '100%', padding: '10px', borderRadius: '8px', background: 'var(--primary)', color: 'white', border: 'none', fontWeight: 'bold' }}
                                    >
                                        Adicionar Viagem
                                    </button>
                                </div>
                            )}

                            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                                {guestSpots.map(spot => (
                                    <div key={spot.id} style={{ background: 'var(--surface)', padding: '12px', borderRadius: '12px', display: 'flex', justifyContent: 'space-between', border: '1px solid var(--border-color)' }}>
                                        <div>
                                            <div style={{ fontSize: '14px', fontWeight: 'bold' }}>{spot.location_name}</div>
                                            <div style={{ fontSize: '12px', color: 'var(--text-tertiary)' }}>{spot.start_date} até {spot.end_date}</div>
                                        </div>
                                        <button
                                            onClick={() => handleDeleteGuestSpot(spot.id)}
                                            style={{ background: 'transparent', border: 'none', color: '#E52020', fontSize: '11px', fontWeight: 'bold' }}
                                        >
                                            Remover
                                        </button>
                                    </div>
                                ))}
                            </div>
                        </div>
                        <div>
                            <label style={{ fontSize: '12px', color: 'var(--text-secondary)' }}>Status de Vagas</label>
                            <input
                                type="text"
                                value={editForm.spots_status}
                                onChange={(e) => setEditForm({ ...editForm, spots_status: e.target.value })}
                                placeholder="ex: Agenda Aberta, Guest em SP"
                                style={{
                                    width: '100%', padding: '8px', borderRadius: '8px',
                                    background: 'var(--surface)', border: '1px solid var(--border-color)',
                                    color: 'white', marginTop: '4px'
                                }}
                            />
                        </div>
                        <div>
                            <label style={{ fontSize: '12px', color: 'var(--text-secondary)' }}>Detalhes da Agenda</label>
                            <textarea
                                value={editForm.schedule_text}
                                onChange={(e) => setEditForm({ ...editForm, schedule_text: e.target.value })}
                                rows="3"
                                placeholder="Datas disponíveis, viagens, base..."
                                style={{
                                    width: '100%', padding: '8px', borderRadius: '8px',
                                    background: 'var(--surface)', border: '1px solid var(--border-color)',
                                    color: 'white', marginTop: '4px', resize: 'vertical'
                                }}
                            />
                        </div>
                    </div>
                )}
            </div>

            <div className="portfolio-section">
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '0 20px', marginBottom: '12px' }}>
                    <h2 className="section-title" style={{ padding: 0, margin: 0 }}>Portfólio</h2>
                    {isEditing && (
                        <div>
                            <input
                                type="file"
                                accept="image/*,video/mp4,video/quicktime,video/webm"
                                onChange={handleImageUpload}
                                style={{ display: 'none' }}
                                id="portfolio-upload"
                            />
                            <label htmlFor="portfolio-upload" style={{
                                background: 'rgba(229, 32, 32, 0.1)', color: 'var(--primary)',
                                padding: '6px 12px', borderRadius: '12px', fontSize: '12px', fontWeight: 'bold', cursor: 'pointer'
                            }}>
                                + Adicionar Mídia
                            </label>
                        </div>
                    )}
                </div>
                <PhotoGrid
                    photos={artist.portfolioFull}
                    isEditing={isEditing}
                    onDeletePhoto={handleDeletePhoto}
                />
            </div>

            {products.length > 0 && (
                <div className="portfolio-section" style={{ borderTop: '1px solid var(--border-color)', paddingTop: '24px', marginTop: '24px' }}>
                    <div style={{ padding: '0 20px', marginBottom: '16px' }}>
                        <h2 className="section-title" style={{ padding: 0, margin: 0 }}>Flashes & Vitrine</h2>
                        <p style={{ fontSize: '12px', color: 'var(--text-tertiary)', marginTop: '4px' }}>Produtos e artes exclusivas à venda</p>
                    </div>
                    
                    <div className="products-grid-profile" style={{ 
                        display: 'grid', 
                        gridTemplateColumns: 'repeat(2, 1fr)', 
                        gap: '12px', 
                        padding: '0 20px' 
                    }}>
                        {products.map(product => (
                            <div 
                                key={product.id} 
                                className="product-card-mini" 
                                onClick={() => handleProductClick(product)}
                                style={{
                                    background: 'var(--surface)',
                                    borderRadius: '16px',
                                    border: '1px solid var(--border-color)',
                                    overflow: 'hidden',
                                    cursor: 'pointer'
                                }}
                            >
                                <div style={{ aspectRatio: '1', width: '100%', position: 'relative' }}>
                                    <img 
                                        src={product.image_url || 'https://via.placeholder.com/150'} 
                                        alt={product.title} 
                                        style={{ width: '100%', height: '100%', objectFit: 'cover' }} 
                                    />
                                    <div style={{ 
                                        position: 'absolute', bottom: '8px', right: '8px', 
                                        background: 'rgba(0,0,0,0.7)', padding: '4px 8px', 
                                        borderRadius: '8px', color: 'white', fontSize: '12px', fontWeight: 'bold' 
                                    }}>
                                        R$ {product.price}
                                    </div>
                                </div>
                                <div style={{ padding: '10px' }}>
                                    <h4 style={{ fontSize: '13px', fontWeight: 'bold', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{product.title}</h4>
                                    <p style={{ fontSize: '11px', color: 'var(--text-tertiary)', marginTop: '2px' }}>Reservar Flash</p>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            )}

            <div className="cta-container">
                <Button fullWidth variant="primary" icon={MessageCircle} onClick={handleWhatsAppClick}>
                    Solicitar Orçamento
                </Button>
            </div>
        </div>
    );
}
