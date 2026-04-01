import { useState, useEffect } from 'react';
import { TopBar } from '../components/TopBar';
import { FeedPost } from '../components/FeedPost';
import { Store, Palmtree, Loader, Send, User } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '../lib/supabase';
import { useUser } from '@clerk/clerk-react';
import './HomeArtist.css';

export function HomeArtist() {
    const navigate = useNavigate();
    const { user, isLoaded } = useUser();
    const profile = user?.publicMetadata;
    const [posts, setPosts] = useState([]);
    const [loading, setLoading] = useState(true);
    const [newPostContent, setNewPostContent] = useState('');
    const [newPostImage, setNewPostImage] = useState(null);
    const [posting, setPosting] = useState(false);

    useEffect(() => {
        fetchPosts();
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
                .order('created_at', { ascending: false });

            if (error) throw error;

            if (data && data.length > 0) {
                const mappedPosts = data.map(post => {
                    const diffMs = new Date() - new Date(post.created_at);
                    const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
                    const timeAgo = diffHours < 1 ? 'Agora mesmo' : `Há ${diffHours} horas`;

                    const likesCount = post.post_likes?.length || 0;
                    const commentsCount = post.post_comments?.length || 0;

                    return {
                        id: post.id,
                        author_id: post.author_id,
                        author: {
                            name: post.profiles?.full_name || 'Usuário',
                            avatar: post.profiles?.avatar_url || null
                        },
                        timeAgo: timeAgo,
                        content: post.content,
                        likes: likesCount,
                        comments_count: commentsCount,
                        coupon: post.coupon_code,
                        media: post.media_url
                    };
                });
                setPosts(mappedPosts);
            } else {
                setPosts([]);
            }
        } catch (error) {
            console.error('Error fetching posts:', error);
            setPosts([]);
        } finally {
            setLoading(false);
        }
    };

    const handleCreatePost = async () => {
        if (!newPostContent.trim() || !user) return;

        setPosting(true);
        try {
            const { data: newPost, error } = await supabase
                .from('posts')
                .insert([
                    {
                        author_id: user.id,
                        content: newPostContent.trim(),
                        media_url: newPostImage || null
                    }
                ])
                .select()
                .single();

            if (error) throw error;

            // Trigger "Global Notification" (For MVP, we just broadcast as a 'new_post' notification type)
            if (newPost) {
                // Future: notify followers
            }

            setNewPostContent('');
            setNewPostImage(null);
            fetchPosts(); // Refresh the feed
        } catch (error) {
            console.error('Error creating post:', error);
            alert('Erro ao publicar. Tente novamente.');
        } finally {
            setPosting(false);
        }
    };

    const handleImageUpload = async (e) => {
        const file = e.target.files?.[0];
        if (!file || !user) return;

        const fileExt = file.name.split('.').pop();
        const fileName = `${user.id}/feed_${Date.now()}.${fileExt}`;

        try {
            const { error: uploadError } = await supabase.storage
                .from('portfolios')
                .upload(fileName, file);

            if (!uploadError) {
                const { data: { publicUrl } } = supabase.storage.from('portfolios').getPublicUrl(fileName);
                setNewPostImage(publicUrl);
            }
        } catch (error) {
            console.error("Error uploading image", error);
        }
    };

    return (
        <div className="home-artist-page">
            <TopBar />

            <div className="artist-opportunities">
                <h2 className="section-title">Explorar na Comunidade</h2>
                <div className="opp-cards">
                    <div className="opp-card studio-opp" onClick={() => navigate('/search')}>
                        <Store size={24} className="opp-icon" />
                        <div className="opp-text">
                            <h4>Estúdios com Vagas</h4>
                            <p>4 locais aceitando Guest perto de você</p>
                        </div>
                    </div>
                    <div className="opp-card shop-opp" style={{ border: '1px solid var(--primary)', background: 'rgba(229, 32, 32, 0.05)' }} onClick={() => navigate(`/artist/${profile?.id}`)}>
                        <User size={24} className="opp-icon" style={{ color: 'var(--primary)' }} />
                        <div className="opp-text">
                            <h4>Seu Perfil & Agenda</h4>
                            <p>Gerencie sua bio, fotos e datas disponíveis</p>
                        </div>
                    </div>
                </div>
            </div>

            {!isLoaded ? null : (
            <div className="feed-container">
                <h2 className="section-title">Feed da Comunidade</h2>

                {/* Create Post Input */}
                <div className="create-post-container" style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                    <div className="create-post-input-wrapper">
                        {profile?.avatar_url ? (
                            <img
                                src={profile.avatar_url}
                                alt="Your avatar"
                                className="create-post-avatar"
                            />
                        ) : (
                            <div className="create-post-avatar-placeholder" style={{
                                width: '40px', height: '40px', borderRadius: '50%',
                                background: 'var(--surface)', border: '1px solid var(--primary)',
                                display: 'flex', justifyContent: 'center', alignItems: 'center', fontSize: '16px', fontWeight: 'bold'
                            }}>
                                {profile?.full_name?.charAt(0)}
                            </div>
                        )}
                        <textarea
                            placeholder="Anuncie um guest, ou mostre uma nova tattoo..."
                            className="create-post-input"
                            value={newPostContent}
                            onChange={(e) => setNewPostContent(e.target.value)}
                            rows={Math.max(1, newPostContent.split('\n').length)}
                        />
                    </div>

                    {newPostImage && (
                        <div style={{ marginLeft: '50px', position: 'relative', width: 'fit-content' }}>
                            <img src={newPostImage} alt="Post preview" style={{ height: '80px', borderRadius: '8px', objectFit: 'cover' }} />
                            <button onClick={() => setNewPostImage(null)} style={{ position: 'absolute', top: '-8px', right: '-8px', background: 'var(--bg-tertiary)', color: 'white', borderRadius: '50%', width: '20px', height: '20px', border: 'none', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>×</button>
                        </div>
                    )}

                    <div className="create-post-actions" style={{ marginLeft: '50px', justifyContent: 'space-between' }}>
                        <div style={{ position: 'relative', cursor: 'pointer' }}>
                            <button className="create-post-submit" style={{ background: 'transparent', color: 'var(--text-secondary)' }}>
                                <Store size={18} />
                                <span>Adicionar Foto</span>
                            </button>
                            <input type="file" accept="image/*" onChange={handleImageUpload} style={{ position: 'absolute', top: 0, left: 0, width: '100%', height: '100%', opacity: 0, cursor: 'pointer' }} />
                        </div>

                        {newPostContent.trim().length > 0 && (
                            <button
                                className="create-post-submit"
                                onClick={handleCreatePost}
                                disabled={posting}
                            >
                                {posting ? <Loader size={18} className="spin" /> : <Send size={18} />}
                                <span>Publicar</span>
                            </button>
                        )}
                    </div>
                </div>

                {loading ? (
                    <div style={{ display: 'flex', justifyContent: 'center', padding: '2rem' }}>
                        <Loader className="spin" size={32} color="var(--primary)" />
                    </div>
                ) : (
                    posts.map(post => (
                        <FeedPost key={post.id} post={post} />
                    ))
                )}
            </div>
            )}
        </div>
    );
}
