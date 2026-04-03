import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, Plus, Users, Calendar, Percent, Home, Briefcase, Trash2, CheckCircle } from 'lucide-react';
import { supabase } from '../lib/supabase';
import { useAuth } from '../lib/AuthContext';
import { Button } from '../components/Button';
import './ManageJobs.css';

export function ManageJobs() {
    const navigate = useNavigate();
    const { user } = useAuth();
    const [jobs, setJobs] = useState([]);
    const [loading, setLoading] = useState(true);
    const [isAddingMode, setIsAddingMode] = useState(false);
    const [saving, setSaving] = useState(false);

    // New Job Form State
    const [newJob, setNewJob] = useState({
        title: '',
        description: '',
        styles_required: '',
        start_date: '',
        end_date: '',
        commission_rate: 60,
        is_accommodation: false,
        is_material: false
    });

    useEffect(() => {
        if (user) {
            fetchJobs();
        }
    }, [user]);

    const fetchJobs = async () => {
        try {
            const { data, error } = await supabase
                .from('guest_jobs')
                .select(`
                    *,
                    job_applications!left (id)
                `)
                .eq('studio_id', user.id)
                .order('created_at', { ascending: false });

            if (data) setJobs(data);
        } catch (error) {
            console.error('Error fetching jobs:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleCreateJob = async (e) => {
        e.preventDefault();
        setSaving(true);

        try {
            const stylesArray = newJob.styles_required.split(',').map(s => s.trim()).filter(Boolean);
            
            const { data, error } = await supabase
                .from('guest_jobs')
                .insert([{
                    studio_id: user.id,
                    title: newJob.title,
                    description: newJob.description,
                    styles_required: stylesArray,
                    start_date: newJob.start_date,
                    end_date: newJob.end_date,
                    commission_rate: parseInt(newJob.commission_rate),
                    is_accommodation: newJob.is_accommodation,
                    is_material: newJob.is_material,
                    status: 'open'
                }])
                .select()
                .single();

            if (error) throw error;

            // Optional: Create community post about the new job
            await supabase.from('posts').insert([{
                author_id: user.id,
                content: `🚀 O Estúdio acaba de abrir uma nova vaga de Guest: "${newJob.title}" para ${newJob.start_date}! Confira na aba de Vagas.`,
                media_url: null // Or studio's avatar/photo
            }]);

            setJobs([data, ...jobs]);
            setIsAddingMode(false);
            setNewJob({
                title: '',
                description: '',
                styles_required: '',
                start_date: '',
                end_date: '',
                commission_rate: 60,
                is_accommodation: false,
                is_material: false
            });
        } catch (error) {
            console.error('Error creating job:', error);
            alert('Erro ao criar vaga.');
        } finally {
            setSaving(false);
        }
    };

    const handleDeleteJob = async (jobId) => {
        if (!confirm('Tem certeza que deseja excluir esta vaga? Todas as candidaturas serão perdidas.')) return;

        try {
            const { error } = await supabase
                .from('guest_jobs')
                .delete()
                .eq('id', jobId);

            if (error) throw error;
            setJobs(jobs.filter(j => j.id !== jobId));
        } catch (error) {
            console.error('Error deleting job:', error);
        }
    };

    return (
        <div className="manage-jobs-page">
            <header className="manage-header">
                <button className="back-btn-ghost" onClick={() => navigate(-1)}>
                    <ArrowLeft size={24} />
                </button>
                <h1>Minhas Vagas de Guest</h1>
                {!isAddingMode && (
                    <button className="add-job-btn" onClick={() => setIsAddingMode(true)}>
                        <Plus size={20} />
                        Nova Vaga
                    </button>
                )}
            </header>

            <div className="manage-content">
                {isAddingMode ? (
                    <form className="add-job-form" onSubmit={handleCreateJob}>
                        <div className="form-section">
                            <h3>Detalhes da Oportunidade</h3>
                            <div className="input-group">
                                <label>Título da Vaga</label>
                                <input 
                                    type="text" 
                                    placeholder="Ex: Guest de Verão - Realismo" 
                                    required 
                                    value={newJob.title} 
                                    onChange={e => setNewJob({...newJob, title: e.target.value})}
                                />
                            </div>
                            <div className="input-group">
                                <label>Descrição / Regras</label>
                                <textarea 
                                    placeholder="O que o artista precisa saber? Material, ambiente..." 
                                    required 
                                    value={newJob.description} 
                                    onChange={e => setNewJob({...newJob, description: e.target.value})}
                                />
                            </div>
                            <div className="input-group">
                                <label>Estilos Procurados (separados por vírgula)</label>
                                <input 
                                    type="text" 
                                    placeholder="Ex: Realismo, Blackwork, Fineline" 
                                    value={newJob.styles_required} 
                                    onChange={e => setNewJob({...newJob, styles_required: e.target.value})}
                                />
                            </div>
                        </div>

                        <div className="form-row">
                            <div className="input-group">
                                <label>Data Início</label>
                                <input 
                                    type="date" 
                                    required 
                                    value={newJob.start_date} 
                                    onChange={e => setNewJob({...newJob, start_date: e.target.value})}
                                />
                            </div>
                            <div className="input-group">
                                <label>Data Fim</label>
                                <input 
                                    type="date" 
                                    required 
                                    value={newJob.end_date} 
                                    onChange={e => setNewJob({...newJob, end_date: e.target.value})}
                                />
                            </div>
                        </div>

                        <div className="form-section">
                            <h3>Comissão & Benefícios</h3>
                            <div className="percentage-input">
                                <label>Porcentagem do Artista (%)</label>
                                <div className="input-with-icon">
                                    <Percent size={18} />
                                    <input 
                                        type="number" 
                                        min="0" max="100" 
                                        required 
                                        value={newJob.commission_rate} 
                                        onChange={e => setNewJob({...newJob, commission_rate: e.target.value})}
                                    />
                                </div>
                            </div>

                            <div className="checkbox-group">
                                <label className="checkbox-item">
                                    <input 
                                        type="checkbox" 
                                        checked={newJob.is_accommodation} 
                                        onChange={e => setNewJob({...newJob, is_accommodation: e.target.checked})}
                                    />
                                    <span>Oferecemos Acomodação</span>
                                </label>
                                <label className="checkbox-item">
                                    <input 
                                        type="checkbox" 
                                        checked={newJob.is_material} 
                                        onChange={e => setNewJob({...newJob, is_material: e.target.checked})}
                                    />
                                    <span>Material Básico Incluso</span>
                                </label>
                            </div>
                        </div>

                        <div className="form-actions-sticky">
                            <button type="button" className="btn-cancel" onClick={() => setIsAddingMode(false)}>Cancelar</button>
                            <Button type="submit" variant="primary" disabled={saving}>
                                {saving ? 'Publicando...' : 'Publicar Vaga'}
                            </Button>
                        </div>
                    </form>
                ) : (
                    <div className="jobs-list">
                        {loading ? (
                            <p>Carregando vagas...</p>
                        ) : jobs.length > 0 ? (
                            jobs.map(job => (
                                <div key={job.id} className="job-manage-card">
                                    <div className="job-info">
                                        <h3>{job.title}</h3>
                                        <div className="job-meta">
                                            <span><Calendar size={14} /> {new Date(job.start_date).toLocaleDateString()} - {new Date(job.end_date).toLocaleDateString()}</span>
                                            <span><Percent size={14} /> {job.commission_rate}% Artista</span>
                                        </div>
                                        <div className="job-badges">
                                            {job.is_accommodation && <span className="badge"><Home size={12} /> Acomodação</span>}
                                            {job.is_material && <span className="badge"><Briefcase size={12} /> Material</span>}
                                        </div>
                                    </div>
                                    <div className="job-actions-summary">
                                        <div className="app-count" onClick={() => navigate(`/jobs/applications/${job.id}`)}>
                                            <Users size={20} />
                                            <div className="count-text">
                                                <strong>{job.job_applications?.length || 0}</strong>
                                                <span>Candidatos</span>
                                            </div>
                                        </div>
                                        <button className="delete-job-btn" onClick={() => handleDeleteJob(job.id)}>
                                            <Trash2 size={18} />
                                        </button>
                                    </div>
                                </div>
                            ))
                        ) : (
                            <div className="empty-jobs">
                                <CheckCircle size={48} />
                                <p>Nenhuma vaga aberta no momento.</p>
                                <button className="btn-primary" onClick={() => setIsAddingMode(true)}>Criar meu primeiro anúncio</button>
                            </div>
                        )}
                    </div>
                )}
            </div>
        </div>
    );
}
