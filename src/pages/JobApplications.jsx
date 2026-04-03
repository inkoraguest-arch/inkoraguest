import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ArrowLeft, MessageCircle, Check, X, User, Calendar, ExternalLink, Loader } from 'lucide-react';
import { supabase } from '../lib/supabase';
import { useAuth } from '../lib/AuthContext';
import { Button } from '../components/Button';
import './JobApplications.css';

export function JobApplications() {
    const { id } = useParams(); // Job ID
    const navigate = useNavigate();
    const { user } = useAuth();
    const [job, setJob] = useState(null);
    const [applications, setApplications] = useState([]);
    const [loading, setLoading] = useState(true);
    const [updatingId, setUpdatingId] = useState(null);

    useEffect(() => {
        if (user && id) {
            fetchJobDetails();
            fetchApplications();
        }
    }, [user, id]);

    const fetchJobDetails = async () => {
        const { data, error } = await supabase
            .from('guest_jobs')
            .select('*')
            .eq('id', id)
            .single();

        if (data) setJob(data);
    };

    const fetchApplications = async () => {
        try {
            const { data, error } = await supabase
                .from('job_applications')
                .select(`
                    *,
                    artist:artist_id (
                        id,
                        full_name,
                        avatar_url,
                        city,
                        role
                    )
                `)
                .eq('job_id', id)
                .order('created_at', { ascending: false });

            if (data) setApplications(data);
        } catch (error) {
            console.error('Error fetching applications:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleUpdateStatus = async (appId, newStatus) => {
        setUpdatingId(appId);
        try {
            const { error } = await supabase
                .from('job_applications')
                .update({ status: newStatus })
                .eq('id', appId);

            if (error) throw error;

            setApplications(applications.map(app => 
                app.id === appId ? { ...app, status: newStatus } : app
            ));

            // Optional: Create notification for artist
            const app = applications.find(a => a.id === appId);
            if (newStatus === 'accepted' && app) {
                // In a real app, send a real-time notification
            }
        } catch (error) {
            console.error('Error updating status:', error);
        } finally {
            setUpdatingId(null);
        }
    };

    return (
        <div className="job-applications-page">
            <header className="manage-header">
                <button className="back-btn-ghost" onClick={() => navigate(-1)}>
                    <ArrowLeft size={24} />
                </button>
                <div className="header-info">
                    <h1>Candidatos</h1>
                    {job && <span className="job-title-badge">{job.title}</span>}
                </div>
            </header>

            <div className="applications-content">
                {loading ? (
                    <div className="loading-state"><Loader className="spin" /> Carregando candidatos...</div>
                ) : applications.length > 0 ? (
                    <div className="applications-list">
                        {applications.map(app => (
                            <div key={app.id} className={`application-card ${app.status}`}>
                                <div className="card-top">
                                    <div className="artist-profile-summary">
                                        {app.artist?.avatar_url ? (
                                            <img src={app.artist.avatar_url} alt="" className="artist-avatar" />
                                        ) : (
                                            <div className="avatar-placeholder">{app.artist?.full_name?.charAt(0)}</div>
                                        )}
                                        <div className="artist-meta">
                                            <h3>{app.artist?.full_name}</h3>
                                            <span>{app.artist?.city || 'Local indefinido'}</span>
                                        </div>
                                    </div>
                                    <div className={`status-pill ${app.status}`}>
                                        {app.status === 'pending' ? 'Pendente' : app.status === 'accepted' ? 'Aceito ✓' : 'Recusado ×'}
                                    </div>
                                </div>

                                <div className="application-msg">
                                    <p>"{app.message}"</p>
                                    <span className="app-date">{new Date(app.created_at).toLocaleDateString()}</span>
                                </div>

                                <div className="card-actions">
                                    <button 
                                        className="btn-view-profile" 
                                        onClick={() => navigate(`/artist/${app.artist.id}`)}
                                    >
                                        <User size={16} /> Ver Portfólio
                                    </button>
                                    
                                    {app.status === 'pending' && (
                                        <div className="decision-btns">
                                            <button 
                                                className="btn-reject" 
                                                disabled={updatingId === app.id}
                                                onClick={() => handleUpdateStatus(app.id, 'rejected')}
                                            >
                                                <X size={18} />
                                            </button>
                                            <button 
                                                className="btn-accept" 
                                                disabled={updatingId === app.id}
                                                onClick={() => handleUpdateStatus(app.id, 'accepted')}
                                            >
                                                <Check size={18} /> Aceitar
                                            </button>
                                        </div>
                                    )}

                                    {app.status === 'accepted' && (
                                        <Button 
                                            variant="secondary" 
                                            icon={MessageCircle}
                                            onClick={() => alert('Em breve integração com chat direto!')}
                                        >
                                            Abrir Chat
                                        </Button>
                                    )}
                                </div>
                            </div>
                        ))}
                    </div>
                ) : (
                    <div className="empty-applications">
                        <Users size={48} />
                        <p>Nenhuma candidatura recebida para esta vaga ainda.</p>
                        <button className="btn-outline" onClick={() => navigate(-1)}>Voltar</button>
                    </div>
                )}
            </div>
        </div>
    );
}
