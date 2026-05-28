import { useState, useEffect, useRef } from 'react';
import { Globe } from 'lucide-react';
import './LanguageSelector.css';

const LANGUAGES = [
    { code: 'pt', label: 'Português', flag: '🇧🇷' },
    { code: 'en', label: 'English', flag: '🇺🇸' },
    { code: 'fr', label: 'Français', flag: '🇫🇷' },
    { code: 'de', label: 'Deutsch', flag: '🇩🇪' },
    { code: 'it', label: 'Italiano', flag: '🇮🇹' },
    { code: 'zh-CN', label: '中文', flag: '🇨🇳' }
];

export function LanguageSelector({ variant = 'default' }) {
    const [isOpen, setIsOpen] = useState(false);
    const [currentLang, setCurrentLang] = useState(LANGUAGES[0]);
    const dropdownRef = useRef(null);

    // Close dropdown when clicking outside
    useEffect(() => {
        const handleClickOutside = (event) => {
            if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
                setIsOpen(false);
            }
        };
        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    const changeLanguage = (lang) => {
        setCurrentLang(lang);
        setIsOpen(false);

        // Se for português, limpa tudo e recarrega
        if (lang.code === 'pt') {
            document.cookie = 'googtrans=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;';
            document.cookie = `googtrans=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/; domain=${window.location.hostname}`;
            window.location.hash = '';
            window.location.reload();
            return;
        }

        // Tenta disparar o evento direto no select escondido do widget
        const select = document.querySelector('.goog-te-combo');
        if (select) {
            select.value = lang.code;
            select.dispatchEvent(new Event('change', { bubbles: true, cancelable: true }));
        }

        // Força os cookies agressivamente
        document.cookie = `googtrans=/pt/${lang.code}; path=/;`;
        document.cookie = `googtrans=/auto/${lang.code}; path=/;`;
        if (window.location.hostname !== 'localhost') {
            document.cookie = `googtrans=/pt/${lang.code}; path=/; domain=${window.location.hostname}`;
        }
        
        // Aplica o hash na URL
        window.location.hash = `#googtrans(pt|${lang.code})`;

        // Força um recarregamento se o HTML não tiver sido alterado pela IA do Google após 500ms
        setTimeout(() => {
            if (document.documentElement.lang !== lang.code) {
                window.location.reload();
            }
        }, 500);
    };

    return (
        <div className={`lang-selector-container ${variant}`} ref={dropdownRef}>
            <button 
                className="lang-selector-btn" 
                onClick={() => setIsOpen(!isOpen)}
                title="Mudar Idioma"
            >
                <Globe size={20} />
                <span className="current-lang-code">{currentLang.code.toUpperCase()}</span>
            </button>

            {isOpen && (
                <div className="lang-dropdown">
                    {LANGUAGES.map((lang) => (
                        <button
                            key={lang.code}
                            className={`lang-option ${currentLang.code === lang.code ? 'active' : ''}`}
                            onClick={() => changeLanguage(lang)}
                        >
                            <span className="lang-flag">{lang.flag}</span>
                            <span className="lang-label">{lang.label}</span>
                        </button>
                    ))}
                </div>
            )}
        </div>
    );
}
