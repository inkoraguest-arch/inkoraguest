import { useNavigate } from 'react-router-dom';
import { Sparkles, Store, MapPin, ArrowRight, ShieldCheck, Search, Image as ImageIcon, Briefcase, ShoppingBag, Bell } from 'lucide-react';
import './LandingPage.css';

export function LandingPage() {
    const navigate = useNavigate();

    return (
        <div className="landing-premium">
            {/* Navbar Premium */}
            <nav className="nav-premium">
                <div className="nav-logo">
                    <img src="/logo-inkora.png" alt="Inkora" onError={(e) => { e.target.style.display='none' }} />
                    <span className="logo-text">INKORA<br/>GUEST</span>
                </div>
                <div className="nav-links">
                    <a href="#inicio">INÍCIO</a>
                    <a href="#recursos">RECURSOS</a>
                    <a href="#comunidade">COMUNIDADE</a>
                    <a href="#marketplace">MARKETPLACE</a>
                    <a href="#" onClick={() => navigate('/planos')}>PLANOS</a>
                    <a href="#" onClick={() => navigate('/login')}>LOGIN</a>
                </div>
                <button className="btn-glow-outline" onClick={() => navigate('/register')}>
                    CRIAR CONTA <ArrowRight size={16} />
                </button>
            </nav>

            {/* Hero Section */}
            <section className="hero-premium" id="inicio">
                <div className="hero-content">
                    <span className="hero-kicker">TATUADORES. ESTÚDIOS. CLIENTES.</span>
                    <h1 className="hero-title">
                        A CONEXÃO QUE<br/>
                        <span className="text-glow">TRANSFORMA</span><br/>
                        A SUA ARTE.
                    </h1>
                    <p className="hero-desc">
                        Inkora Guest é a plataforma completa para tatuadores em guest, conectando talentos, oportunidades e clientes em um só lugar.
                    </p>
                    <div className="hero-actions">
                        <button className="btn-glow-solid" onClick={() => navigate('/register')}>
                            COMECE AGORA <ArrowRight size={16} />
                        </button>
                        <button className="btn-glow-ghost" onClick={() => {
                                const el = document.getElementById('recursos');
                                if (el) el.scrollIntoView({ behavior: 'smooth' });
                            }}>EXPLORAR RECURSOS <span>▼</span></button>
                    </div>
                    <div className="hero-stats-row">
                        <span><UsersIcon /> CONEXÕES REAIS</span>
                        <span><LightningIcon /> OPORTUNIDADES</span>
                        <span><ShieldIcon /> LIBERDADE</span>
                    </div>
                </div>

                <div className="hero-visual">
                    {/* The giant metallic needle logo placeholder */}
                    <div className="hero-logo-glowing">
                        <img src="/logo-inkora.png" alt="Inkora Logo" className="glow-needle" onError={(e) => { e.target.style.display='none' }} />
                    </div>
                    {/* Fake Mobile App Mockup */}
                    <div className="app-mockup">
                        <div className="mockup-header">
                            <span>INKORA GUEST</span>
                            <div><Bell size={14} style={{marginRight: '8px'}}/><ShoppingBag size={14}/></div>
                        </div>
                        <div className="mockup-feed">
                            <div className="mockup-post">
                                <div className="post-head">
                                    <div className="post-av" style={{backgroundImage: 'url(https://images.unsplash.com/photo-1598371839696-5c5bb00bdc28?w=100&h=100&fit=crop)', backgroundSize: 'cover'}}></div>
                                    <div className="post-info">
                                        <b>@black.ink</b><br/><span>São Paulo, SP</span>
                                    </div>
                                </div>
                                <div className="post-content-text">
                                    Vaga de Guest disponível para a próxima semana! 🔥 Mande seu portfólio por DM.
                                </div>
                                <div className="post-img" style={{backgroundImage: 'url(https://images.unsplash.com/photo-1598371839696-5c5bb00bdc28?w=500&h=300&fit=crop)', backgroundSize: 'cover', backgroundPosition: 'center'}}>
                                    <div className="post-date-badge">12 A 15 DE JUNHO</div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </section>

            {/* Três Pilares */}
            <section className="pillars-section" id="recursos">
                <h3 className="section-title-sm">TRÊS TIPOS DE CONEXÃO.</h3>
                <div className="pillars-grid">
                    <div className="pillar-card">
                        <div className="pillar-icon"><Briefcase size={24}/> TATUADORES</div>
                        <p>Encontre oportunidades de guest, divulgue seu trabalho, conecte-se com estúdios e clientes.</p>
                        <button className="btn-pillar">SAIBA MAIS <ArrowRight size={14}/></button>
                    </div>
                    <div className="pillar-card">
                        <div className="pillar-icon"><Store size={24}/> ESTÚDIOS</div>
                        <p>Encontre artistas incríveis, preencha suas agendas e destaque seu espaço.</p>
                        <button className="btn-pillar">SAIBA MAIS <ArrowRight size={14}/></button>
                    </div>
                    <div className="pillar-card">
                        <div className="pillar-icon"><UsersIcon /> CLIENTES</div>
                        <p>Descubra artistas, acompanhe seus trabalhos e agende sua próxima tattoo.</p>
                        <button className="btn-pillar">SAIBA MAIS <ArrowRight size={14}/></button>
                    </div>
                    
                    <div className="global-stats">
                        <div className="stat-line"><span>+15K</span> TATUADORES</div>
                        <div className="stat-line"><span>+3K</span> ESTÚDIOS</div>
                        <div className="stat-line"><span>+50K</span> CLIENTES</div>
                        <div className="stat-line"><span>+25K</span> GUEST SPOTS</div>
                    </div>
                </div>
            </section>

            {/* Tudo o que você precisa */}
            <section className="features-showcase">
                <div className="features-list">
                    <h2>TUDO O QUE VOCÊ<br/>PRECISA. EM UM<br/>SÓ LUGAR.</h2>
                    <ul>
                        <li>
                            <ImageIcon size={20} color="var(--primary)" />
                            <div>
                                <b>FEED INTERATIVO</b>
                                <p>Poste vagas, trabalhos e conecte-se com a comunidade.</p>
                            </div>
                        </li>
                        <li>
                            <MapPin size={20} color="var(--primary)" />
                            <div>
                                <b>MAPA EM TEMPO REAL</b>
                                <p>Encontre estúdios e artistas disponíveis perto de você.</p>
                            </div>
                        </li>
                        <li>
                            <ShoppingBag size={20} color="var(--primary)" />
                            <div>
                                <b>MARKETPLACE EXCLUSIVO</b>
                                <p>Venda artes, acessórios e produtos para tatuadores e clientes.</p>
                            </div>
                        </li>
                    </ul>
                    <button className="btn-glow-outline">VER TODOS RECURSOS <ArrowRight size={16}/></button>
                </div>

                <div className="features-panels">
                    <div className="panel map-panel">
                        <div className="panel-head">MAPA AO VIVO</div>
                        <div className="map-fake-bg">
                            {/* Pontos de luz simulando mapa */}
                            <div className="pin p1"></div><div className="pin p2"></div><div className="pin p3"></div>
                        </div>
                    </div>
                    <div className="panel market-panel" id="marketplace">
                        <div className="panel-head">MARKETPLACE</div>
                        <div className="market-items">
                            <div className="m-item"><div className="img-ph"></div><span>Arte Digital</span><b>R$ 150,00</b></div>
                            <div className="m-item"><div className="img-ph"></div><span>Grip de Aço</span><b>R$ 89,90</b></div>
                        </div>
                        <div className="panel-head mt-4">VAGAS EM DESTAQUE</div>
                        <div className="job-items">
                            <div className="j-item"><b>Black Ink Studio</b><span>2 vagas abertas</span></div>
                            <div className="j-item"><b>ArtCore Tattoo</b><span>1 vaga aberta</span></div>
                        </div>
                    </div>
                </div>
            </section>

            {/* CTA Final */}
            <section className="final-cta">
                <h2>SUA PRÓXIMA CONEXÃO PODE <span className="text-glow">MUDAR TUDO.</span></h2>
                <p>JUNTE-SE À MAIOR PLATAFORMA DE GUEST DO BRASIL.</p>
                <button className="btn-glow-solid large" onClick={() => navigate('/register')}>
                    CRIAR CONTA GRATUITA <ArrowRight size={18}/>
                </button>
            </section>

            {/* Footer Premium */}
            <footer className="footer-premium">
                <div className="footer-cols">
                    <div className="f-col main-col">
                        <div className="nav-logo">
                            <img src="/logo-horizontal.jpg" alt="Inkora" onError={(e) => { e.target.style.display='none' }} />
                            <span className="logo-text">INKORA<br/>GUEST</span>
                        </div>
                        <p>Conectando tatuadores, estúdios e clientes. Potencializando a arte. Fortalecendo a comunidade.</p>
                    </div>
                    <div className="f-col">
                        <h4>PLATAFORMA</h4>
                        <a href="#">Recursos</a><a href="#">Como funciona</a><a href="#">Planos</a><a href="#">Privacidade</a>
                    </div>
                    <div className="f-col">
                        <h4>COMUNIDADE</h4>
                        <a href="#">Blog</a><a href="#">Eventos</a><a href="#">Parcerias</a>
                    </div>
                    <div className="f-col">
                        <h4>SUPORTE</h4>
                        <a href="#">Central de ajuda</a><a href="#">Contato</a><a href="#">Segurança</a>
                    </div>
                </div>
                <div className="footer-bottom">
                    &copy; 2026 Inkora Guest. Todos os direitos reservados.
                </div>
            </footer>
        </div>
    );
}

// Helper simple icons to avoid blowing up imports
function UsersIcon() { return <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"></path><circle cx="9" cy="7" r="4"></circle><path d="M23 21v-2a4 4 0 0 0-3-3.87"></path><path d="M16 3.13a4 4 0 0 1 0 7.75"></path></svg>; }
function LightningIcon() { return <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2"></polygon></svg>; }
function ShieldIcon() { return <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"></path></svg>; }
