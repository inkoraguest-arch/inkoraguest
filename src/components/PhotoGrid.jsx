import { Trash2 } from 'lucide-react';
import './PhotoGrid.css';

export function PhotoGrid({ photos, isEditing, onDeletePhoto }) {
    if (!photos || photos.length === 0) {
        return <div style={{ padding: '0 20px', color: 'var(--text-secondary)', fontSize: '14px' }}>Nenhuma foto no portfólio.</div>;
    }

    const isVideo = (url) => {
        return url.toLowerCase().match(/\.(mp4|webm|mov|ogg)(\?.*)?$/);
    };

    return (
        <div className="photo-grid">
            {photos.map((url, idx) => (
                <div key={idx} className="grid-item" style={{ position: 'relative' }}>
                    {isVideo(url) ? (
                        <video 
                            src={url} 
                            autoPlay 
                            loop 
                            muted 
                            playsInline 
                            style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                        />
                    ) : (
                        <img src={url} alt={`Portfolio item ${idx + 1}`} loading="lazy" />
                    )}
                    {isEditing && (
                        <div
                            style={{ position: 'absolute', top: '8px', right: '8px', background: 'rgba(229, 32, 32, 0.9)', borderRadius: '50%', width: '28px', height: '28px', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', zIndex: 10, boxShadow: '0 2px 4px rgba(0,0,0,0.5)' }}
                            onClick={() => onDeletePhoto(url)}
                        >
                            <Trash2 size={16} color="white" />
                        </div>
                    )}
                </div>
            ))}
        </div>
    );
}
