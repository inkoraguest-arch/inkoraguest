import { MapPin, Calendar, Star, Heart } from 'lucide-react';
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import './ArtistCard.css';

export function ArtistCard({ artist }) {
    const [saved, setSaved] = useState(artist.saved || false);
    const navigate = useNavigate();

    const handleSave = (e) => {
        e.stopPropagation();
        setSaved(!saved);
    };

    const handleCardClick = () => {
        navigate(`/artist/${artist.id}`);
    };

    const handleWhatsAppClick = (e) => {
        e.stopPropagation();
        const phone = artist.phone ? artist.phone.replace(/\D/g, '') : '5511999999999';

        // Include location/status if available
        const statusInfo = artist.spotsStatus && artist.spotsStatus !== 'Consultar' ? ` (${artist.spotsStatus})` : '';
        const message = encodeURIComponent(`Olá ${artist.name}, vi seu perfil no aplicativo Inkora e gostaria de conversar sobre uma tatuagem${statusInfo}!`);
        window.open(`https://wa.me/${phone}?text=${message}`, '_blank');
    };

    return (
        <div className="artist-card" onClick={handleCardClick}>
            <div className="artist-header">
                <div className="artist-info">
                    {artist.profilePic ? (
                        <img src={artist.profilePic} alt={artist.name} className="artist-avatar" />
                    ) : (
                        <div className="artist-avatar-placeholder" style={{
                            width: '45px', height: '45px', borderRadius: '50%',
                            background: 'var(--surface)', border: '1px solid var(--primary)',
                            display: 'flex', justifyContent: 'center', alignItems: 'center', fontSize: '18px', fontWeight: 'bold'
                        }}>
                            {artist.name.charAt(0)}
                        </div>
                    )}
                    <div className="artist-details">
                        <h3 className="artist-name" style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                            {artist.name}
                            {artist.role && (
                                <span style={{
                                    fontSize: '10px',
                                    background: 'var(--bg-tertiary)',
                                    padding: '2px 8px',
                                    borderRadius: '10px',
                                    fontWeight: 'normal',
                                    textTransform: 'capitalize'
                                }}>
                                    {artist.role === 'artist' ? 'Tatuador' : 'Estúdio'}
                                </span>
                            )}
                        </h3>
                        <div className="artist-location">
                            <MapPin size={12} className="icon-red" />
                            <span>{artist.currentCity}</span>
                        </div>
                        <div className="artist-rating">
                            <Star size={12} className="icon-yellow" fill="currentColor" />
                            <span>{artist.rating} ({artist.reviews})</span>
                            <span className="artist-styles">• {artist.styles.join(', ')}</span>
                        </div>
                    </div>
                </div>
                <button className="save-btn" onClick={handleSave}>
                    <Heart size={20} className={saved ? 'icon-red-fill' : 'icon-gray'} fill={saved ? 'var(--primary)' : 'none'} />
                </button>
            </div>

            {artist.nextGuestSpot && (
                <div className="next-guest-spot">
                    <div className="guest-spot-badge">
                        <Calendar size={14} />
                        <span>Próximo Guest:</span>
                    </div>
                    <div className="guest-spot-details">
                        <strong>{artist.nextGuestSpot.city}</strong>
                        <span> • {artist.nextGuestSpot.dates}</span>
                    </div>
                </div>
            )}

            {artist.portfolioPreview && artist.portfolioPreview.length > 0 && (
                <div className="artist-portfolio-preview">
                    {artist.portfolioPreview.map((url, idx) => (
                        <div key={idx} className="portfolio-preview-img-wrapper">
                            <img src={url} alt={`Portfolio ${idx + 1}`} className="portfolio-preview-img" />
                        </div>
                    ))}
                </div>
            )}

            <div className="artist-card-action">
                <button
                    className="whatsapp-contact-btn"
                    onClick={handleWhatsAppClick}
                >
                    Falar no WhatsApp
                </button>
            </div>
        </div>
    );
}
