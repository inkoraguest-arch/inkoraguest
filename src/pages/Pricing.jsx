import React from 'react';
import './Pricing.css';

export function Pricing() {
  const plans = [
    {
      name: 'Mochileiro',
      price: '19,90',
      description: 'Ideal para tatuadores que estão começando a fazer guests eventuais.',
      features: [
        'Perfil Público Padrão (Buscas)',
        'Portfólio Limitado (15 fotos/flashes)',
        'Até 3 candidaturas a vagas/mês',
        'Busca de Estúdios por Cidade/Estado',
        'Recebe Avaliações de Estúdios'
      ],
      buttonText: 'Começar como Mochileiro',
      planId: 'mochileiro',
      popular: false
    },
    {
      name: 'Viajante',
      price: '29,90',
      description: 'Para o tatuador que viaja com frequência e busca mais oportunidades.',
      features: [
        'Tudo do Mochileiro',
        'Perfil de Maior Relevância nas buscas',
        'Portfólio Estendido (50 fotos)',
        'Candidaturas a Vagas Ilimitadas',
        'Chat Direto com Estúdios (DM)',
        'Calendário/Agenda Pública'
      ],
      buttonText: 'Assinar Viajante',
      planId: 'viajante',
      popular: true
    },
    {
      name: 'Guest Profissional',
      price: '49,90',
      description: 'Para artistas internacionais e nômades que vivem na estrada.',
      features: [
        'Tudo do Viajante',
        'Selo Verificado "PRO Guest"',
        'Top 1 no algoritmo de buscas',
        'Portfólio Ilimitado + Vídeos',
        'Loja VIP (Taxa Zero na Plataforma)',
        'Métricas Avançadas de Visitas',
        'Match Ativo (Notificações Antecipadas)'
      ],
      buttonText: 'Virar PRO',
      planId: 'guest-pro',
      popular: false
    },
    {
      name: 'Estúdio Guest',
      price: '99,90',
      description: 'O plano definitivo para estúdios que querem atrair os melhores talentos.',
      features: [
        'Painel do Estúdio Completo',
        'Publicação de Vagas Ilimitadas',
        'Destaque na busca de Estúdios',
        'Filtro Avançado de Artistas',
        'Gestão de Convites e Contratos',
        'Suporte Prioritário Inkora'
      ],
      buttonText: 'Assinar Estúdio',
      planId: 'estudio-guest',
      popular: false
    }
  ];

  const handleSubscribe = (planId) => {
    const stripeLinks = {
      'mochileiro': 'https://buy.stripe.com/test_mochileiro', 
      'viajante': 'https://buy.stripe.com/test_viajante',
      'guest-pro': 'https://buy.stripe.com/test_pro',
      'estudio-guest': 'https://buy.stripe.com/test_estudio_guest'
    };

    const link = stripeLinks[planId];
    
    if (link) {
      window.location.href = link;
    } else {
      console.log(`Iniciando assinatura do plano: ${planId}`);
      alert(`Redirecionando para o checkout do Stripe para o plano: ${planId}...`);
    }
  };

  return (
    <div className="pricing-container">
      <div className="pricing-header">
        <h1>Escolha seu Plano</h1>
        <p>Potencialize sua carreira de Guest de acordo com as suas necessidades.</p>
      </div>

      <div className="pricing-grid">
        {plans.map((plan) => (
          <div key={plan.planId} className={`pricing-card ${plan.popular ? 'popular' : ''}`}>
            {plan.popular && <div className="popular-badge">Mais Escolhido</div>}
            
            <div className="card-header">
              <h2>{plan.name}</h2>
              <p className="description">{plan.description}</p>
              <div className="price">
                <span className="currency">R$</span>
                <span className="amount">{plan.price}</span>
                <span className="period">/mês</span>
              </div>
            </div>

            <ul className="features-list">
              {plan.features.map((feature, idx) => (
                <li key={idx}>
                  <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <polyline points="20 6 9 17 4 12"></polyline>
                  </svg>
                  {feature}
                </li>
              ))}
            </ul>

            <button 
              className={`subscribe-button ${plan.popular ? 'btn-primary' : 'btn-outline'}`}
              onClick={() => handleSubscribe(plan.planId)}
            >
              {plan.buttonText}
            </button>
          </div>
        ))}
      </div>
    </div>
  );
}
