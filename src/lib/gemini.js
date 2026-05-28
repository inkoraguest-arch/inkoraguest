import { GoogleGenerativeAI } from '@google/generative-ai';

// Access the API key defined in .env
const API_KEY = import.meta.env.VITE_GEMINI_API_KEY;

// Initialize the Gemini AI SDK
const genAI = new GoogleGenerativeAI(API_KEY);

export async function generateStyleMatch(answers) {
    // Simulação inteligente (Mock AI) baseada nas respostas,
    // já que chaves de API podem expirar ou ter bloqueio de CORS.
    
    // Pequeno delay para simular o "pensamento" da IA
    await new Promise(resolve => setTimeout(resolve, 1500));

    const style = answers.style || 'diversos estilos';
    const size = answers.size || 'tatuagens';
    
    let profile = '';
    
    if (style.includes('Realismo')) {
        profile = `A sua aura clama por impacto e perfeição. Ao escolher ${size} no estilo ${style}, você mostra que valoriza detalhes minuciosos e obras que parecem ganhar vida na pele. Seu perfil é de um colecionador de arte hiper-realista.`;
    } else if (style.includes('Fineline') || style.includes('Blackwork')) {
        profile = `Elegância e atitude definem seu perfil. Com foco em ${style} para ${size}, você busca linhas precisas, contrastes fortes e uma estética moderna. É um olhar minimalista mas extremamente poderoso.`;
    } else if (style.includes('Old School') || style.includes('Tradicional')) {
        profile = `Um clássico nunca morre! Sua preferência por ${style} mostra um respeito profundo pelas raízes da tatuagem. Cores sólidas e traços marcantes em ${size} provam que você tem uma personalidade forte e atemporal.`;
    } else if (style.includes('Aquarela')) {
        profile = `Sua alma é colorida e livre. Ao escolher o estilo ${style}, você foge dos padrões rígidos e busca uma arte fluida, vibrante e expressiva. Suas ideias em ${size} vão se transformar em verdadeiras telas vivas!`;
    } else {
        profile = `Você tem uma mente aberta e criativa! Seu foco em ${size} revela que você está em busca da pessoa certa para traduzir suas ideias em algo único. Sua intuição artística está te guiando para explorar novas possibilidades.`;
    }

    const budgetMatch = answers.budget && answers.budget.includes('O valor não é problema') 
        ? " E como você valoriza a arte acima de tudo, separamos a elite dos estúdios para você."
        : " Filtramos artistas incríveis que se encaixam perfeitamente na sua visão e momento.";

    return profile + budgetMatch;
}
