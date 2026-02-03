
import { GoogleGenAI } from "@google/genai";
import { FAQItem, ChatMessage } from '../types.ts';
import { WHATSAPP_NUMBER } from '../constants.tsx';

export class AIChatService {
  private ai: GoogleGenAI | null = null;
  private modelName = 'gemini-3-flash-preview';

  constructor() {
    const apiKey = typeof process !== 'undefined' ? process.env?.API_KEY : '';
    if (apiKey) {
      this.ai = new GoogleGenAI({ apiKey });
    }
  }

  async getResponse(history: ChatMessage[], userMessage: string, faqs: FAQItem[]): Promise<string> {
    if (!this.ai) {
      return `I'm currently in offline mode. Please contact us on WhatsApp at ${WHATSAPP_NUMBER} for direct help!`;
    }

    const faqContext = faqs.map(f => `Q: ${f.question}\nA: ${f.answer}`).join('\n\n');
    
    const systemInstruction = `
      You are the Graphico Global Assistant.
      
      BASE KNOWLEDGE:
      ${faqContext}
      
      RULES:
      1. Use the knowledge base provided above to answer questions.
      2. If the user's question is NOT related to Graphico Global or you cannot find the answer in the knowledge base, politely tell them you don't know and suggest contacting us on WhatsApp at ${WHATSAPP_NUMBER}.
      3. Keep responses brief, professional, and friendly.
      4. Use emojis occasionally to be engaging.
    `;

    try {
      const chat = this.ai.chats.create({
        model: this.modelName,
        config: {
          systemInstruction,
          temperature: 0.7,
        }
      });

      const response = await chat.sendMessage({ message: userMessage });
      return response.text || "I'm sorry, I'm having trouble processing that right now.";
    } catch (error) {
      console.error("Gemini Error:", error);
      return `I encountered an error. Please reach out directly via WhatsApp at ${WHATSAPP_NUMBER} for assistance!`;
    }
  }
}

export const aiService = new AIChatService();
