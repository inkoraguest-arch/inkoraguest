import { useEffect, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { CheckCircle, ArrowRight, Star } from 'lucide-react';
import { useUser } from '@clerk/clerk-react';
import { supabase } from '../lib/supabase';
import './Pricing.css'; // Reusing some pricing styles

export function PaymentSuccess() {
    const navigate = useNavigate();
    const [searchParams] = useSearchParams();
    const { user, isLoaded } = useUser();
    const [updating, setUpdating] = useState(true);
    const [planName, setPlanName] = useState('Premium');

    const sessionId = searchParams.get('session_id');
    const planFromUrl = searchParams.get('plan'); // e.g. ?plan=pro

    useEffect(() => {
        async function updatePlan() {
            if (isLoaded && user && planFromUrl) {
                // Determine the clean plan name for display
                const names = {
                    'mochileiro': 'Mochileiro',
                    'viajante': 'Viajante',
                    'pro': 'Guest Profissional',
                    'estudio': 'Estúdio Guest'
                };
                setPlanName(names[planFromUrl] || 'Premium');

                try {
                    // Update the user's plan in Supabase
                    const { error } = await supabase
                        .from('profiles')
                        .update({
                            subscription_plan: planFromUrl,
                            subscription_status: 'active'
                        })
                        .eq('id', user.id);

                    if (error) throw error;
                    
                    // Also update Clerk metadata so the frontend reflects it immediately
                    // Note: This requires Clerk Secret Key on backend, but we can attempt to sync 
                    // or just rely on Supabase for the next reload.
                } catch (err) {
                    console.error('Error updating plan:', err);
                } finally {
                    setUpdating(false);
                }
            } else if (isLoaded && !user) {
                setUpdating(false);
            }
        }

        updatePlan();
    }, [isLoaded, user, planFromUrl]);

    return (
        <div className="pricing-page" style={{ justifyContent: 'center', alignItems: 'center', textAlign: 'center', padding: '40px 24px' }}>
            <div className="success-card" style={{ background: 'var(--bg-secondary)', padding: '48px 32px', borderRadius: '24px', maxWidth: '500px', width: '100%', border: '1px solid var(--primary)' }}>
                <div style={{ background: 'rgba(0, 230, 118, 0.1)', width: '80px', height: '80px', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 24px' }}>
                    <CheckCircle size={48} color="#00e676" />
                </div>
                
                <h1 style={{ fontSize: '28px', color: 'white', marginBottom: '16px' }}>Pagamento Confirmado!</h1>
                <p style={{ color: 'var(--text-secondary)', fontSize: '16px', lineHeight: '1.6', marginBottom: '32px' }}>
                    Parabéns! Você agora é um assinante do plano <strong style={{ color: 'var(--primary)' }}>{planName}</strong>. 
                    Seu limite de fotos foi atualizado e seus benefícios já estão ativos.
                </p>

                <div className="benefits-badge" style={{ display: 'flex', alignItems: 'center', gap: '8px', justifyContent: 'center', background: 'rgba(255, 255, 255, 0.05)', padding: '12px', borderRadius: '12px', marginBottom: '32px' }}>
                    <Star size={18} color="gold" fill="gold" />
                    <span style={{ color: 'white', fontWeight: '600' }}>Perfil Verificado Ativado</span>
                </div>

                <button 
                    onClick={() => navigate('/home')}
                    className="subscribe-btn pro" 
                    style={{ width: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '12px' }}
                >
                    Começar a usar <ArrowRight size={20} />
                </button>
            </div>
        </div>
    );
}
