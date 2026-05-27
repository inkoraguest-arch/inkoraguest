import { useState, useEffect } from 'react';
import { Sparkles, ArrowRight, CheckCircle, X } from 'lucide-react';
import './OnboardingGuide.css';

const STEPS = [
    {
        title: 'Bem-vindo ao Inkora Guest! 💉',
        text: 'A maior rede de conexões para a cultura da tatuagem. Vamos dar um tour rápido para você aproveitar ao máximo a plataforma.',
        icon: <Sparkles size={48} color="var(--primary)" />
    },
    {
        title: 'Configure seu Perfil',
        text: 'Seu perfil é seu cartão de visitas. Adicione fotos do seu trabalho, conte sua história e, se for estúdio, mostre seu espaço. Perfis completos atraem 3x mais conexões.',
        icon: <CheckCircle size={48} color="#4CAF50" />
    },
    {
        title: 'Explore o Mapa',
        text: 'Navegue pelo nosso Mapa ao Vivo para descobrir oportunidades de Guest Spot perto de você ou encontre os melhores artistas da sua cidade.',
        icon: <img src="/logo-vertical.jpg" alt="Inkora" style={{width: 60, height: 60, borderRadius: '50%'}} />
    }
];

export function OnboardingGuide() {
    const [isVisible, setIsVisible] = useState(false);
    const [currentStep, setCurrentStep] = useState(0);

    useEffect(() => {
        const hasSeenGuide = localStorage.getItem('inkora_has_seen_guide');
        if (!hasSeenGuide) {
            setIsVisible(true);
        }
    }, []);

    const handleNext = () => {
        if (currentStep < STEPS.length - 1) {
            setCurrentStep(currentStep + 1);
        } else {
            handleClose();
        }
    };

    const handleClose = () => {
        localStorage.setItem('inkora_has_seen_guide', 'true');
        setIsVisible(false);
    };

    if (!isVisible) return null;

    const step = STEPS[currentStep];

    return (
        <div className="onboarding-overlay">
            <div className="onboarding-modal">
                <button className="close-guide-btn" onClick={handleClose}><X size={24} /></button>
                
                <div className="onboarding-content">
                    <div className="step-icon-wrapper">
                        {step.icon}
                    </div>
                    <h2>{step.title}</h2>
                    <p>{step.text}</p>
                </div>

                <div className="onboarding-footer">
                    <div className="step-indicators">
                        {STEPS.map((_, idx) => (
                            <div key={idx} className={`step-dot ${idx === currentStep ? 'active' : ''}`} />
                        ))}
                    </div>
                    <button className="next-step-btn" onClick={handleNext}>
                        {currentStep === STEPS.length - 1 ? 'Começar!' : 'Avançar'} <ArrowRight size={18} />
                    </button>
                </div>
            </div>
        </div>
    );
}
