import { useState } from 'react';
import { Button } from './Button';
import { X, ChevronRight, Check } from 'lucide-react';
import './QuizModal.css';

const QUIZ_QUESTIONS = [
    {
        id: 'size',
        question: 'Qual o tamanho aproximado da tatuagem que você deseja?',
        options: ['Pequena (até 5cm)', 'Média (5 a 15cm)', 'Grande (mais de 15cm)', 'Fechamento (Braço/Perna/Costas)']
    },
    {
        id: 'style',
        question: 'Quais estilos mais te atraem?',
        options: ['Realismo', 'Blackwork / Fineline', 'Old School / Tradicional', 'Aquarela', 'Oriental', 'Ainda não sei']
    },
    {
        id: 'budget',
        question: 'Qual a sua faixa de orçamento para essa arte?',
        options: ['Até R$ 300', 'R$ 300 a R$ 800', 'R$ 800 a R$ 2000', 'Acima de R$ 2000', 'O valor não é problema para o artista certo']
    }
];

export function QuizModal({ isOpen, onClose, onComplete }) {
    const [currentStep, setCurrentStep] = useState(0);
    const [answers, setAnswers] = useState({});

    if (!isOpen) return null;

    const currentQ = QUIZ_QUESTIONS[currentStep];

    const handleSelectOption = (option) => {
        setAnswers({ ...answers, [currentQ.id]: option });
    };

    const handleNext = () => {
        if (currentStep < QUIZ_QUESTIONS.length - 1) {
            setCurrentStep(currentStep + 1);
        } else {
            onComplete(answers);
            onClose();
            // Reset after complete
            setTimeout(() => {
                setCurrentStep(0);
                setAnswers({});
            }, 300);
        }
    };

    return (
        <div className="modal-overlay">
            <div className="modal-content">
                <button className="modal-close-btn" onClick={onClose}>
                    <X size={24} />
                </button>

                <div className="quiz-progress">
                    <div
                        className="quiz-progress-bar"
                        style={{ width: `${((currentStep + 1) / QUIZ_QUESTIONS.length) * 100}%` }}
                    />
                </div>

                <div className="quiz-body">
                    <span className="quiz-step-label">Pergunta {currentStep + 1} de {QUIZ_QUESTIONS.length}</span>
                    <h2 className="quiz-question">{currentQ.question}</h2>

                    <div className="quiz-options">
                        {currentQ.options.map((opt, idx) => (
                            <button
                                key={idx}
                                className={`quiz-opt-btn ${answers[currentQ.id] === opt ? 'selected' : ''}`}
                                onClick={() => handleSelectOption(opt)}
                            >
                                {opt}
                                {answers[currentQ.id] === opt && <Check size={18} className="quiz-check-icon" />}
                            </button>
                        ))}
                    </div>
                </div>

                <div className="quiz-footer">
                    <Button
                        fullWidth
                        variant="primary"
                        onClick={handleNext}
                        disabled={!answers[currentQ.id]}
                    >
                        {currentStep < QUIZ_QUESTIONS.length - 1 ? (
                            <>Próximo <ChevronRight size={18} style={{ marginLeft: 8 }} /></>
                        ) : (
                            'Ver Artistas Ideais'
                        )}
                    </Button>
                </div>
            </div>
        </div>
    );
}
