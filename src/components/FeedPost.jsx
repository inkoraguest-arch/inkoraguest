import { useState, useEffect } from 'react';
import { Heart, MessageCircle, Share2, Tag, Send, Loader } from 'lucide-react';
import { supabase } from '../lib/supabase';
import { useAuth } from '../lib/AuthContext';
import './FeedPost.css';

export function FeedPost({ post }) {
    const { profile } = useAuth();
    const [likes, setLikes] = useState(post.likes_count || 0);
    const [isLiked, setIsLiked] = useState(false);
    const [showComments, setShowComments] = useState(false);
    const [comments, setComments] = useState([]);
    const [newComment, setNewComment] = useState('');
    const [loadingComments, setLoadingComments] = useState(false);
    const [submittingComment, setSubmittingComment] = useState(false);

    useEffect(() => {
        if (profile) {
            checkIfLiked();
        }
    }, [profile, post.id]);

    const checkIfLiked = async () => {
        const { data, error } = await supabase
            .from('post_likes')
            .select('id')
            .eq('post_id', post.id)
            .eq('user_id', profile.id)
            .single();

        if (data) setIsLiked(true);
    };

    const handleLike = async () => {
        if (!profile) return;

        if (isLiked) {
            // Unlike
            setIsLiked(false);
            setLikes(prev => prev - 1);
            await supabase
                .from('post_likes')
                .delete()
                .eq('post_id', post.id)
                .eq('user_id', profile.id);
        } else {
            // Like
            setIsLiked(true);
            setLikes(prev => prev + 1);
            await supabase
                .from('post_likes')
                .insert([{ post_id: post.id, user_id: profile.id }]);

            // Create notification for the post author (if not self)
            if (post.author_id && post.author_id !== profile.id) {
                await supabase.from('notifications').insert([{
                    user_id: post.author_id,
                    type: 'like',
                    from_user_id: profile.id,
                    post_id: post.id
                }]);
            }
        }
    };

    const fetchComments = async () => {
        setLoadingComments(true);
        const { data, error } = await supabase
            .from('post_comments')
            .select(`
                id,
                content,
                created_at,
                profiles:user_id (full_name, avatar_url)
            `)
            .eq('post_id', post.id)
            .order('created_at', { ascending: true });

        if (data) setComments(data);
        setLoadingComments(false);
    };

    const toggleComments = () => {
        const newState = !showComments;
        setShowComments(newState);
        if (newState && comments.length === 0) {
            fetchComments();
        }
    };

    const handleAddComment = async (e) => {
        e.preventDefault();
        if (!newComment.trim() || !profile) return;

        setSubmittingComment(true);
        const { data, error } = await supabase
            .from('post_comments')
            .insert([{
                post_id: post.id,
                user_id: profile.id,
                content: newComment.trim()
            }])
            .select(`
                id,
                content,
                created_at,
                profiles:user_id (full_name, avatar_url)
            `)
            .single();

        if (data) {
            setComments(prev => [...prev, data]);
            setNewComment('');

            // Create notification for the post author (if not self)
            if (post.author_id && post.author_id !== profile.id) {
                await supabase.from('notifications').insert([{
                    user_id: post.author_id,
                    type: 'comment',
                    from_user_id: profile.id,
                    post_id: post.id
                }]);
            }
        }
        setSubmittingComment(false);
    };

    const handleShare = () => {
        const postUrl = `${window.location.origin}/post/${post.id}`;
        navigator.clipboard.writeText(postUrl).then(() => {
            alert('Link do post copiado para a área de transferência!');
        });
    };

    return (
        <div className="feed-post">
            <div className="post-header">
                {post.author.avatar ? (
                    <img src={post.author.avatar} alt={post.author.name} className="post-avatar" />
                ) : (
                    <div className="post-avatar-placeholder" style={{
                        width: '40px', height: '40px', borderRadius: '50%',
                        background: 'var(--surface)', border: '1px solid var(--border-color)',
                        display: 'flex', justifyContent: 'center', alignItems: 'center', fontSize: '14px', fontWeight: 'bold'
                    }}>
                        {post.author.name.charAt(0)}
                    </div>
                )}
                <div className="post-author-info">
                    <h4 className="post-author-name">{post.author.name}</h4>
                    <span className="post-time">{post.timeAgo}</span>
                </div>
            </div>

            <p className="post-text">{post.content}</p>

            {post.coupon && (
                <div className="post-coupon">
                    <Tag size={16} className="coupon-icon" />
                    <span>Cupom: <strong>{post.coupon}</strong></span>
                </div>
            )}

            {post.media && (
                <div className="post-media-container">
                    <img src={post.media} alt="Post content" className="post-media" />
                </div>
            )}

            <div className="post-actions">
                <button
                    className={`action-btn ${isLiked ? 'liked' : ''}`}
                    onClick={handleLike}
                >
                    <Heart size={20} fill={isLiked ? "currentColor" : "none"} />
                    <span>{likes}</span>
                </button>
                <button className="action-btn" onClick={toggleComments}>
                    <MessageCircle size={20} />
                    <span>{post.comments_count || comments.length}</span>
                </button>
                <button className="action-btn" onClick={handleShare}>
                    <Share2 size={20} />
                </button>
            </div>

            {showComments && (
                <div className="post-comments-section">
                    <div className="comments-list">
                        {loadingComments ? (
                            <div className="comments-loading"><Loader className="spin" size={20} /></div>
                        ) : comments.length > 0 ? (
                            comments.map(comment => (
                                <div key={comment.id} className="comment-item">
                                    {comment.profiles?.avatar_url ? (
                                        <img src={comment.profiles?.avatar_url} alt="" className="comment-avatar" />
                                    ) : (
                                        <div className="comment-avatar-placeholder" style={{
                                            width: '28px', height: '28px', borderRadius: '50%',
                                            background: 'var(--bg-tertiary)', border: '1px solid var(--border-color)',
                                            display: 'flex', justifyContent: 'center', alignItems: 'center', fontSize: '10px', fontWeight: 'bold'
                                        }}>
                                            {comment.profiles?.full_name?.charAt(0)}
                                        </div>
                                    )}
                                    <div className="comment-content">
                                        <span className="comment-user">{comment.profiles?.full_name}</span>
                                        <p className="comment-text">{comment.content}</p>
                                    </div>
                                </div>
                            ))
                        ) : (
                            <p className="no-comments">Seja o primeiro a comentar!</p>
                        )}
                    </div>

                    {profile && (
                        <form className="comment-form" onSubmit={handleAddComment}>
                            <input
                                type="text"
                                placeholder="Escreva um comentário..."
                                value={newComment}
                                onChange={(e) => setNewComment(e.target.value)}
                                disabled={submittingComment}
                            />
                            <button type="submit" disabled={!newComment.trim() || submittingComment}>
                                {submittingComment ? <Loader className="spin" size={16} /> : <Send size={16} />}
                            </button>
                        </form>
                    )}
                </div>
            )}
        </div>
    );
}
