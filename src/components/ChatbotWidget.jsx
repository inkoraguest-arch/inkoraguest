import { useState, useRef, useEffect } from 'react';
import { MessageSquare, X, ChevronRight, Send } from 'lucide-react';
import './ChatbotWidget.css';

const FAQ_OPTIONS = [
    { id: 'vaga', text: 'Como anunciar um Guest Spot?', reply: 'Para anunciar uma vaga, basta entrar no perfil do seu Estúdio e ir na aba "Minhas Vagas". Lá você poderá cadastrar datas e valores.' },
    { id: 'comprar', text: 'Como funcionam os pagamentos?', reply: 'Você pode utilizar o Checkout seguro da plataforma via Stripe, ou combinar diretamente com o artista via PIX através do WhatsApp na página dele.' },
    { id: 'perfil', text: 'Como mudar minha foto de perfil?', reply: 'Acesse o seu Perfil e clique na sua foto no canto superior direito para abrir o painel de Gerenciamento da sua Conta Clerk.' },
    { id: 'humano', text: 'Falar com Atendente (WhatsApp)', isLink: true, url: 'https://wa.me/5511999999999?text=Preciso%20de%20ajuda%20com%20o%20Inkora' }
];

export function ChatbotWidget() {
    const [isOpen, setIsOpen] = useState(false);
    const [messages, setMessages] = useState([
        { type: 'bot', text: 'Olá! Bem-vindo(a) ao suporte do Inkora. Como posso te ajudar hoje?' }
    ]);
    const messagesEndRef = useRef(null);

    const scrollToBottom = () => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    };

    useEffect(() => {
        if (isOpen) scrollToBottom();
    }, [messages, isOpen]);

    const handleOptionClick = (option) => {
        if (option.isLink) {
            window.open(option.url, '_blank');
            return;
        }

        // Add user message
        setMessages(prev => [...prev, { type: 'user', text: option.text }]);
        
        // Simulate thinking delay
        setTimeout(() => {
            setMessages(prev => [...prev, { type: 'bot', text: option.reply }]);
        }, 600);
    };

    return (
        <div className="chatbot-wrapper">
            {/* Toggle Button */}
            <button 
                className={`chatbot-toggle ${isOpen ? 'open' : ''}`}
                onClick={() => setIsOpen(!isOpen)}
            >
                {isOpen ? <X size={24} /> : <MessageSquare size={24} />}
            </button>

            {/* Chat Window */}
            {isOpen && (
                <div className="chatbot-window">
                    <div className="chatbot-header">
                        <div className="chatbot-avatar">
                            <img src="/logo-vertical.jpg" alt="Inkora Bot" onError={(e) => { e.target.style.display='none' }} />
                        </div>
                        <div>
                            <h4>Inkora Suporte</h4>
                            <span>Online agora</span>
                        </div>
                        <button className="close-btn mobile-only" onClick={() => setIsOpen(false)} style={{marginLeft: 'auto', background: 'transparent', border: 'none', color: 'var(--text-secondary)'}}>
                            <X size={20} />
                        </button>
                    </div>

                    <div className="chatbot-messages">
                        {messages.map((msg, idx) => (
                            <div key={idx} className={`chat-message ${msg.type}`}>
                                <div className="chat-bubble">
                                    {msg.text}
                                </div>
                            </div>
                        ))}
                        <div ref={messagesEndRef} />
                    </div>

                    <div className="chatbot-options">
                        <p className="options-title">Escolha uma opção:</p>
                        <div className="options-list">
                            {FAQ_OPTIONS.map(opt => (
                                <button key={opt.id} className="chat-option-btn" onClick={() => handleOptionClick(opt)}>
                                    {opt.text} <ChevronRight size={14} />
                                </button>
                            ))}
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
