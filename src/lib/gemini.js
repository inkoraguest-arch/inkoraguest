import { GoogleGenerativeAI } from '@google/generative-ai';

// Access the API key defined in .env
const API_KEY = import.meta.env.VITE_GEMINI_API_KEY;

// Initialize the Gemini AI SDK
const genAI = new GoogleGenerativeAI(API_KEY);

export async function generateStyleMatch(answers) {
    if (!API_KEY) {
        console.warn('Gemini API Key is missing. Returning fallback.');
        return "Sua aura é criativa e única! Recomendamos explorar estilos diversos através da nossa barra de busca até encontrar o artista que fale com o seu coração.";
    }

    try {
        const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });

        const prompt = `
        Aja como um curador carismático e especialista em tatuagens trabalhando para o aplicativo "Inkora".
        Um novo cliente acabou de preencher nosso quiz de matchmaking. Aqui estão as respostas dele:
        
        - Tamanho da tatuagem desejada: ${answers.size || 'Pequena'}
        - Estilos que atraem o olhar: ${answers.style || 'Indeciso'}
        - Orçamento pretendido: ${answers.budget || 'Flexível'}
        
        Com base nessas respostas, escreva um parágrafo curto e empolgante (no máximo 3 frases longas) 
        definindo o "Perfil de Arte" desse cliente. 
        Use linguagem moderna, acolhedora e evite soar como um robô.
        `;

        const result = await model.generateContent(prompt);
        const response = await result.response;
        return response.text();
    } catch (error) {
        console.error("Error generating style match from Gemini:", error);
        return "Nossa bola de cristal falhou por um instante, mas baseando-se nas suas escolhas, você tem um ótimo gosto! Dê uma olhada nos artistas recomendados abaixo.";
    }
}
