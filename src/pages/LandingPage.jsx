import { useNavigate } from 'react-router-dom';
import { Button } from '../components/Button';
import { Sparkles, Store, MapPin, ArrowRight, ShieldCheck, Star, CheckCircle } from 'lucide-react';
import logoHorizontal from '../assets/images/logo-horizontal.jpg';
import './LandingPage.css';

export function LandingPage() {
    const navigate = useNavigate();

    return (
        <div className="landing-page">
            {/* Navbar Minimalista */}
            <nav className="landing-nav">
                <img src={logoHorizontal} alt="Inkora Logo" className="landing-logo-img" />
                <div className="landing-nav-links">
                    <a href="#features">Recursos</a>
                    <a href="#planos" onClick={(e) => { e.preventDefault(); navigate('/planos'); }}>Preços</a>
                </div>
                <div className="landing-nav-actions">
                    <button className="nav-login-btn" onClick={() => navigate('/login')}>Entrar</button>
                    <Button variant="primary" onClick={() => navigate('/register')}>Criar Conta</Button>
                </div>
            </nav>

            {/* Hero Section */}
            <section className="hero-section">
                <div className="hero-content">
                    <h2 className="hero-title">A conexão definitiva entre <span>Tatuadores</span>, <span>Estúdios</span> e <span>Clientes</span>.</h2>
                    <p className="hero-subtitle">Leve sua arte pelo mundo. Encontre o estúdio ideal para seu Guest Spot. Descubra tatuadores incríveis na sua cidade.</p>
                    <div className="hero-cta-group">
                        <Button variant="primary" onClick={() => navigate('/register')} style={{ padding: '16px 32px', fontSize: '18px' }}>
                            Começar a usar o Inkora <ArrowRight size={20} style={{ marginLeft: '8px' }} />
                        </Button>
                        <button className="secondary-cta" onClick={() => navigate('/planos')}>
                            Ver Planos Profissionais
                        </button>
                    </div>
                </div>
                <div className="hero-image-overlay"></div>
            </section>

            {/* Como Funciona / Features */}
            <section id="features" className="features-section">
                <h3 className="section-title text-center">Uma plataforma para todos</h3>

                <div className="features-grid">
                    {/* Cliente */}
                    <div className="feature-card client-feature">
                        <div className="feature-icon-wrapper">
                            <Sparkles size={32} />
                        </div>
                        <h4>Para Clientes</h4>
                        <p>Faça nosso Quiz inteligente de estilo, encontre os melhores artistas recomendados perto de você e chame direto no WhatsApp.</p>
                    </div>

                    {/* Artista */}
                    <div className="feature-card artist-feature">
                        <div className="feature-icon-wrapper">
                            <MapPin size={32} />
                        </div>
                        <h4>Para Tatuadores</h4>
                        <p>Organize suas viagens (Guest Spots). Encontre estúdios com bancadas livres e venda seus flashes e prints na Loja Integrada.</p>
                    </div>

                    {/* Estúdio */}
                    <div className="feature-card studio-feature">
                        <div className="feature-icon-wrapper">
                            <Store size={32} />
                        </div>
                        <h4>Para Estúdios</h4>
                        <p>Anuncie vagas nas suas bancadas para artistas viajantes, divulgue eventos e crie uma rede de networking na comunidade.</p>
                    </div>
                </div>
            </section>

            {/* Plans Preview Section */}
            <section id="planos" className="plans-preview-section">
                <div className="plans-preview-content">
                    <h3 className="section-title">Impulsione sua Carreira</h3>
                    <p className="section-subtitle">Escolha o plano que se adapta ao seu momento profissional.</p>
                    
                    <div className="plans-benefits">
                        <div className="benefit-item">
                            <CheckCircle size={20} className="benefit-icon" />
                            <span>Mochileiro: Para quem está começando.</span>
                        </div>
                        <div className="benefit-item">
                            <CheckCircle size={20} className="benefit-icon" />
                            <span>Viajante: O plano favorito dos nômades.</span>
                        </div>
                        <div className="benefit-item">
                            <CheckCircle size={20} className="benefit-icon" />
                            <span>Guest PRO: Máxima visibilidade e taxas zero.</span>
                        </div>
                        <div className="benefit-item">
                            <CheckCircle size={20} className="benefit-icon" />
                            <span>Estúdio Guest: Gestão profissional de vagas.</span>
                        </div>
                    </div>
                    
                    <Button variant="primary" onClick={() => navigate('/planos')} style={{ marginTop: '24px' }}>
                        Conhecer Planos e Preços
                    </Button>
                </div>
            </section>

            {/* Social Proof */}
            <section className="social-proof-section">
                <h3 className="section-title text-center">Comunidade Inkora</h3>
                <div className="testimonials-row">
                    <div className="testimonial-card">
                        <div className="stars"><Star size={16} fill="currentColor" /><Star size={16} fill="currentColor" /><Star size={16} fill="currentColor" /><Star size={16} fill="currentColor" /><Star size={16} fill="currentColor" /></div>
                        <p>"Consegui fechar minha agenda em SP em 3 dias usando os alertas de Guest Spot. Aplicativo impecável para quem vive na estrada."</p>
                        <span className="testimonial-author">- Luna Vance (Tatuadora)</span>
                    </div>
                    <div className="testimonial-card">
                        <div className="stars"><Star size={16} fill="currentColor" /><Star size={16} fill="currentColor" /><Star size={16} fill="currentColor" /><Star size={16} fill="currentColor" /><Star size={16} fill="currentColor" /></div>
                        <p>"O Quiz de estilo achou exatamente quem eu precisava para fechar meu braço. Nunca foi tão fácil achar o artista certo."</p>
                        <span className="testimonial-author">- Thiago M. (Cliente)</span>
                    </div>
                </div>
            </section>

            {/* Footer */}
            <footer className="landing-footer">
                <div className="footer-content">
                    <img src={logoHorizontal} alt="Inkora Logo" className="landing-footer-logo" />
                    <p className="footer-text">Elevando o padrão da cultura da tatuagem em todo o mundo. Construído com <ShieldCheck size={14} style={{ display: 'inline', color: 'var(--primary)' }} /> para segurança de todos.</p>
                    <div className="footer-links">
                        <a href="#">Termos de Uso</a>
                        <a href="#">Privacidade</a>
                        <a href="#">Contato</a>
                    </div>
                </div>
                <div className="footer-bottom">
                    <p>&copy; 2026 Inkora App. Todos os direitos reservados.</p>
                </div>
            </footer>
        </div>
    );
}
