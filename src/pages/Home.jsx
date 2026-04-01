import { useState, useEffect } from 'react';
import { TopBar } from '../components/TopBar';
import { ArtistCard } from '../components/ArtistCard';
import { FeedPost } from '../components/FeedPost';
import { QuizModal } from '../components/QuizModal';
import { Sparkles, Loader, Sparkles as MagicWand } from 'lucide-react';
import { supabase } from '../lib/supabase';
import { generateStyleMatch } from '../lib/gemini';
import { MOCK_ARTISTS } from '../data/mockData';
import './Home.css';

export function Home() {
    const [isQuizOpen, setIsQuizOpen] = useState(false);
    const [artists, setArtists] = useState([]);
    const [posts, setPosts] = useState([]);
    const [loading, setLoading] = useState(true);
    const [postsLoading, setPostsLoading] = useState(true);
    const [aiLoading, setAiLoading] = useState(false);
    const [aiResult, setAiResult] = useState(null);

    const [searchQuery, setSearchQuery] = useState('');

    useEffect(() => {
        fetchArtists();
        fetchPosts();

        // Listen for search events from TopBar
        const handleGlobalSearch = (e) => setSearchQuery(e.detail);
        const handleGlobalFilter = (e) => {
            if (e.detail === 'All') setSearchQuery('');
            else setSearchQuery(e.detail);
        };

        window.addEventListener('inkora-search', handleGlobalSearch);
        window.addEventListener('inkora-filter-style', handleGlobalFilter);
        return () => {
            window.removeEventListener('inkora-search', handleGlobalSearch);
            window.removeEventListener('inkora-filter-style', handleGlobalFilter);
        };
    }, []);

    const fetchPosts = async () => {
        try {
            const { data, error } = await supabase
                .from('posts')
                .select(`
                    id,
                    content,
                    media_url,
                    author_id,
                    coupon_code,
                    created_at,
                    profiles:author_id (full_name, avatar_url),
                    post_likes!left (id),
                    post_comments!left (id)
                `)
                .order('created_at', { ascending: false })
                .limit(5);

            if (data) {
                const mappedPosts = data.map(post => {
                    const diffMs = new Date() - new Date(post.created_at);
                    const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
                    const timeAgo = diffHours < 1 ? 'Agora mesmo' : `Há ${diffHours} horas`;

                    return {
                        id: post.id,
                        author_id: post.author_id,
                        author: {
                            name: post.profiles?.full_name || 'Usuário',
                            avatar: post.profiles?.avatar_url || null
                        },
                        timeAgo: timeAgo,
                        content: post.content,
                        likes: post.post_likes?.length || 0,
                        comments_count: post.post_comments?.length || 0,
                        coupon: post.coupon_code,
                        media: post.media_url
                    };
                });
                setPosts(mappedPosts);
            }
        } catch (e) { console.error(e); }
        setPostsLoading(false);
    };

    const fetchArtists = async () => {
        try {
            // Fetch profiles where role is artist/studio and include nested data
            let { data, error } = await supabase
                .from('profiles')
                .select(`
                    *,
                    artists (*),
                    studios (*),
                    guest_spots (*)
                `)
                .in('role', ['artist', 'studio']);

            // Fallback if guest_spots table doesn't exist yet
            if (error && error.message.includes('guest_spots')) {
                console.warn("Table guest_spots not found, retrying without it...");
                const fallback = await supabase
                    .from('profiles')
                    .select(`
                        *,
                        artists (*),
                        studios (*)
                    `)
                    .in('role', ['artist', 'studio']);
                data = fallback.data;
                error = fallback.error;
            }

            if (error) {
                console.error("Profiles Fetch Error", error);
                throw error;
            }

            // Diagnostic Log
            if (data?.length > 0) {
                console.log(`[INKORA DEBUG] Encontrados ${data.length} perfis (Artistas/Estúdios):`, data.map(p => p.full_name || 'Sem nome'));
            }

            if (data && data.length > 0) {
                // Map the DB data to the format expected by our ArtistCard component
                const mappedArtists = data.map(profile => {
                    const artistData = Array.isArray(profile.artists) ? profile.artists[0] : profile.artists;
                    const studioData = Array.isArray(profile.studios) ? profile.studios[0] : profile.studios;

                    const profileData = artistData || studioData;

                    // Parse styles safely (in case it was stringified or not array)
                    let styles = ['Diversos estilos'];
                    if (profileData?.primary_styles) {
                        try {
                            styles = Array.isArray(profileData.primary_styles)
                                ? profileData.primary_styles
                                : [profileData.primary_styles];
                        } catch (e) { }
                    }

                    // Get real next guest spot from guest_spots table
                    const spots = profile.guest_spots || [];
                    const futureSpots = spots
                        .filter(s => new Date(s.start_date) >= new Date().setHours(0, 0, 0, 0))
                        .sort((a, b) => new Date(a.start_date) - new Date(b.start_date));

                    const nextGuest = futureSpots.length > 0 ? {
                        city: futureSpots[0].location_name,
                        dates: `${new Date(futureSpots[0].start_date + 'T00:00:00').toLocaleDateString('pt-BR', { day: 'numeric' })} a ${new Date(futureSpots[0].end_date + 'T00:00:00').toLocaleDateString('pt-BR', { day: 'numeric', month: 'short' })}`
                    } : (profileData?.schedule_text ? { city: 'Base', dates: profileData.schedule_text } : null);

                    return {
                        id: profile.id,
                        name: profile.full_name || (profile.role === 'artist' ? 'Artista Inkora' : 'Estúdio Inkora'),
                        currentCity: profile.city || 'Local indefinido',
                        role: profile.role,
                        phone: profile.phone,
                        rating: '5.0',
                        reviews: 0,
                        styles: styles,
                        profilePic: profile.avatar_url || null,
                        nextGuestSpot: nextGuest,
                        portfolioPreview: (artistData?.portfolio_urls || studioData?.studio_photos)?.slice(0, 3) || [],
                        saved: false
                    };
                });
                setArtists(mappedArtists);
            } else {
                setArtists([]);
            }
        } catch (error) {
            console.error('Error fetching artists:', error);
            setArtists([]);
        } finally {
            setLoading(false);
        }
    };

    const handleQuizComplete = async (answers) => {
        // Triggers the AI processing and potentially filters the feed
        setAiLoading(true);
        window.scrollTo({ top: 0, behavior: 'smooth' });

        // Simulating applying filter based on quiz
        if (answers.style && answers.style !== 'Ainda não sei') {
            // Just an MVP soft-filter to make the app feel alive
            const styleStr = answers.style.split('/')[0].trim().toLowerCase();
            const filtered = artists.filter(a => a.styles.some(s => s.toLowerCase().includes(styleStr)));
            if (filtered.length > 0) {
                setArtists(filtered);
            }
        }

        const matchText = await generateStyleMatch(answers);
        setAiResult(matchText);
        setAiLoading(false);
    };

    return (
        <div className="home-page">
            <TopBar />

            {!aiResult && !aiLoading && (
                <div className="quiz-banner-container">
                    <div className="quiz-banner" onClick={() => setIsQuizOpen(true)}>
                        <div className="quiz-banner-content">
                            <h3>Descubra seu Artista Ideal</h3>
                            <p>Responda 3 perguntas e encontre o match perfeito para sua próxima tattoo.</p>
                        </div>
                        <div className="quiz-banner-icon">
                            <Sparkles size={32} />
                        </div>
                    </div>
                </div>
            )}

            {aiLoading && (
                <div className="ai-result-card" style={{ textAlign: 'center', padding: '2rem' }}>
                    <Loader className="spin" size={32} color="var(--primary)" style={{ margin: '0 auto', marginBottom: '1rem' }} />
                    <h3 style={{ fontSize: '16px', color: 'var(--text-primary)' }}>A Inteligência Artificial do Inkora está lendo sua aura e definindo seu perfil...</h3>
                </div>
            )}

            {aiResult && !aiLoading && (
                <div className="ai-result-card">
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '12px' }}>
                        <MagicWand size={20} color="var(--primary)" />
                        <h3 style={{ fontSize: '18px', fontWeight: 'bold' }}>Seu match perfeito:</h3>
                    </div>
                    <p style={{ fontSize: '15px', color: 'var(--text-secondary)', lineHeight: '1.5' }}>
                        {aiResult}
                    </p>
                </div>
            )}

            <div className="discovery-section">
                <div className="section-header">
                    <h2 className="section-title">Encontre Artistas</h2>
                    <p className="section-subtitle">Tatuadores recomendados para você</p>
                </div>
                {loading ? (
                    <div style={{ display: 'flex', justifyContent: 'center', padding: '2rem' }}>
                        <Loader className="spin" size={32} color="var(--primary)" />
                    </div>
                ) : (
                    artists
                        .filter(a =>
                            !searchQuery ||
                            a.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                            a.styles.some(s => s.toLowerCase().includes(searchQuery.toLowerCase())) ||
                            a.currentCity.toLowerCase().includes(searchQuery.toLowerCase())
                        )
                        .map(artist => (
                            <ArtistCard key={artist.id} artist={artist} />
                        ))
                )}
            </div>

            <div className="discovery-section" style={{ paddingTop: 0 }}>
                <div className="section-header">
                    <h2 className="section-title">Feed da Comunidade</h2>
                    <p className="section-subtitle">O que está rolando nos estúdios</p>
                </div>
                {postsLoading ? (
                    <div style={{ display: 'flex', justifyContent: 'center', padding: '2rem' }}>
                        <Loader className="spin" size={32} color="var(--primary)" />
                    </div>
                ) : posts.length > 0 ? (
                    posts.map(post => (
                        <FeedPost key={post.id} post={post} />
                    ))
                ) : (
                    <p style={{ textAlign: 'center', color: 'var(--text-tertiary)', padding: '2rem' }}>Nenhuma postagem recente.</p>
                )}
            </div>

            <QuizModal
                isOpen={isQuizOpen}
                onClose={() => setIsQuizOpen(false)}
                onComplete={handleQuizComplete}
            />
        </div>
    );
}
