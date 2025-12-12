
import { Injectable } from '@angular/core';
import { GoogleGenAI } from '@google/genai';

@Injectable({
  providedIn: 'root',
})
export class GeminiService {
  private ai: GoogleGenAI;

  constructor() {
    if (!process.env.API_KEY) {
      throw new Error("API_KEY environment variable not set");
    }
    this.ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
  }

  async generateTranscription(fileName: string): Promise<string> {
    try {
      const prompt = `Aja como um especialista em transcrição de áudio. Você recebeu um arquivo de áudio chamado "${fileName}". O conteúdo real do áudio não está disponível. Sua tarefa é gerar uma transcrição curta e fictícia que seja plausível para um arquivo com esse nome. Seja criativo. Se o nome for genérico como "audio.mp3", invente um diálogo curto. Se for "reuniao_projeto_alpha.wav", crie um trecho de uma ata de reunião. Retorne apenas o texto da transcrição.`;

      const response = await this.ai.models.generateContent({
        model: 'gemini-2.5-flash',
        contents: prompt,
        config: {
          temperature: 0.7,
        }
      });

      return response.text;
    } catch (error) {
      console.error('Error generating content from Gemini API:', error);
      throw new Error('Failed to generate transcription from Gemini API.');
    }
  }
}
