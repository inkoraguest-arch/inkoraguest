import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, Search, Filter, Calendar, Percent, Home, Briefcase, MapPin, CheckCircle, Send, X, Star } from 'lucide-react';
import { supabase } from '../lib/supabase';
import { useAuth } from '../lib/AuthContext';
import { Button } from '../components/Button';
import './ExploreJobs.css';

export function ExploreJobs() {
    const navigate = useNavigate();
    const { user, profile } = useAuth();
    const [jobs, setJobs] = useState([]);
    const [loading, setLoading] = useState(true);
    const [selectedJob, setSelectedJob] = useState(null);
    const [applicationMessage, setApplicationMessage] = useState('');
    const [submitting, setSubmitting] = useState(false);
    const [appliedJobs, setAppliedJobs] = useState(new Set());

    useEffect(() => {
        fetchJobs();
        if (user) {
            fetchUserApplications();
        }
    }, [user]);

    const fetchJobs = async () => {
        try {
            const { data, error } = await supabase
                .from('guest_jobs')
                .select(`
                    *,
                    studio:studio_id (
                        full_name,
                        avatar_url,
                        city
                    )
                `)
                .eq('status', 'open')
                .order('created_at', { ascending: false });

            if (data) setJobs(data);
        } catch (error) {
            console.error('Error fetching jobs:', error);
        } finally {
            setLoading(false);
        }
    };

    const fetchUserApplications = async () => {
        try {
            const { data, error } = await supabase
                .from('job_applications')
                .select('job_id')
                .eq('artist_id', user.id);

            if (data) {
                setAppliedJobs(new Set(data.map(app => app.job_id)));
            }
        } catch (error) {
            console.error('Error fetching applications:', error);
        }
    };

    const handleApply = async () => {
        if (!user || !selectedJob) return;
        setSubmitting(true);

        try {
            const { error } = await supabase
                .from('job_applications')
                .insert([{
                    job_id: selectedJob.id,
                    artist_id: user.id,
                    message: applicationMessage.trim()
                }]);

            if (error) throw error;

            setAppliedJobs(new Set([...appliedJobs, selectedJob.id]));
            setSelectedJob(null);
            setApplicationMessage('');
            alert('Candidatura enviada com sucesso! O estúdio entrará em contato se houver match.');
        } catch (error) {
            console.error('Error applying to job:', error);
            alert('Erro ao enviar candidatura. Você já pode ter se candidatado a esta vaga.');
        } finally {
            setSubmitting(false);
        }
    };

    return (
        <div className="explore-jobs-page">
            <header className="explore-header">
                <div className="header-top">
                    <button className="back-btn-ghost" onClick={() => navigate(-1)}>
                        <ArrowLeft size={24} />
                    </button>
                    <h1>Vagas de Guest</h1>
                </div>
                <div className="search-bar-container">
                    <div className="search-input-wrapper">
                        <Search size={18} className="search-icon" />
                        <input type="text" placeholder="Buscar por estilo ou cidade..." />
                    </div>
                </div>
            </header>

            <div className="explore-content">
                <div className="filters-row">
                    <button className="filter-badge active">Todos</button>
                    <button className="filter-badge">Realismo</button>
                    <button className="filter-badge">Fineline</button>
                    <button className="filter-badge">Blackwork</button>
                    <Filter size={18} className="filter-icon" />
                </div>

                <div className="jobs-feed">
                    {loading ? (
                        <p>Carregando oportunidades...</p>
                    ) : jobs.length > 0 ? (
                        jobs.map(job => (
                            <div key={job.id} className="job-card" onClick={() => setSelectedJob(job)}>
                                <div className="job-card-header">
                                    <div className="studio-info">
                                        {job.studio?.avatar_url ? (
                                            <img src={job.studio.avatar_url} alt="" className="studio-avatar" />
                                        ) : (
                                            <div className="avatar-placeholder">{job.studio?.full_name?.charAt(0)}</div>
                                        )}
                                        <div className="studio-meta">
                                            <h4>{job.title}</h4>
                                            <span>{job.studio?.full_name} • {job.studio?.city || 'Local indefinido'}</span>
                                        </div>
                                    </div>
                                    {appliedJobs.has(job.id) && (
                                        <span className="applied-tag">Inscrito <CheckCircle size={12} /></span>
                                    )}
                                </div>

                                <div className="job-details-summary">
                                    <div className="detail-item">
                                        <Calendar size={14} />
                                        <span>{new Date(job.start_date).toLocaleDateString('pt-BR', { month: 'short' })} - {new Date(job.end_date).toLocaleDateString('pt-BR', { month: 'short' })}</span>
                                    </div>
                                    <div className="detail-item">
                                        <Percent size={14} />
                                        <span>{job.commission_rate}% Comis.</span>
                                    </div>
                                    {job.is_accommodation && (
                                        <div className="detail-item feature">
                                            <Home size={14} />
                                            <span>Acomodação</span>
                                        </div>
                                    )}
                                </div>

                                <div className="styles-tags">
                                    {job.styles_required?.map(style => (
                                        <span key={style} className="style-tag">{style}</span>
                                    ))}
                                </div>
                            </div>
                        ))
                    ) : (
                        <div className="empty-state">
                            <Briefcase size={40} />
                            <p>Nenhuma vaga aberta no momento.</p>
                        </div>
                    )}
                </div>
            </div>

            {/* Application Modal */}
            {selectedJob && (
                <div className="modal-overlay" onClick={() => setSelectedJob(null)}>
                    <div className="job-details-modal" onClick={e => e.stopPropagation()}>
                        <button className="close-modal" onClick={() => setSelectedJob(null)}>
                            <X size={20} />
                        </button>
                        
                        <div className="modal-header">
                            <h2>{selectedJob.title}</h2>
                            <p className="studio-name">{selectedJob.studio?.full_name}</p>
                        </div>

                        <div className="modal-body scrollable">
                            <div className="full-description">
                                <h4>Descrição da Vaga</h4>
                                <p>{selectedJob.description}</p>
                            </div>

                            <div className="perks-grid">
                                <div className="perk-item">
                                    <Percent size={18} />
                                    <div>
                                        <strong>{selectedJob.commission_rate}%</strong>
                                        <span>Comissão</span>
                                    </div>
                                </div>
                                <div className="perk-item">
                                    <Calendar size={18} />
                                    <div>
                                        <strong>{new Date(selectedJob.start_date).toLocaleDateString()}</strong>
                                        <span>Início</span>
                                    </div>
                                </div>
                                {selectedJob.is_accommodation && (
                                    <div className="perk-item active">
                                        <Home size={18} />
                                        <div>
                                            <strong>Sim</strong>
                                            <span>Acomodação</span>
                                        </div>
                                    </div>
                                )}
                                {selectedJob.is_material && (
                                    <div className="perk-item active">
                                        <Briefcase size={18} />
                                        <div>
                                            <strong>Sim</strong>
                                            <span>Material</span>
                                        </div>
                                    </div>
                                )}
                            </div>

                            <div className="application-form">
                                <h4>Candidatar-se</h4>
                                <p className="hint">Conte um pouco por que você tem interesse nesta vaga.</p>
                                <textarea 
                                    placeholder="Olá! Sou especializado em blackwork e gostaria muito de passar esses dias com vocês..."
                                    value={applicationMessage}
                                    onChange={e => setApplicationMessage(e.target.value)}
                                    disabled={appliedJobs.has(selectedJob.id)}
                                />
                                <Button 
                                    fullWidth 
                                    variant="primary" 
                                    icon={Send}
                                    onClick={handleApply}
                                    disabled={submitting || appliedJobs.has(selectedJob.id) || !applicationMessage.trim()}
                                >
                                    {appliedJobs.has(selectedJob.id) ? 'Candidatura Enviada' : (submitting ? 'Enviando...' : 'Enviar Candidatura')}
                                </Button>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
