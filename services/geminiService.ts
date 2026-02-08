
import { GoogleGenAI, Type } from "@google/genai";
import { WealthIdea } from "../types";

// Always use named parameter and process.env.API_KEY directly for initialization
const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

export const getWealthIdeas = async (skills: string): Promise<WealthIdea[]> => {
  const prompt = `根据用户的技能和背景: "${skills}"，提供3个创新的副业或搞钱点子。请以JSON格式返回。`;
  
  const response = await ai.models.generateContent({
    model: 'gemini-3-flash-preview',
    contents: prompt,
    config: {
      responseMimeType: "application/json",
      responseSchema: {
        type: Type.ARRAY,
        items: {
          type: Type.OBJECT,
          properties: {
            title: { type: Type.STRING },
            description: { type: Type.STRING },
            difficulty: { type: Type.STRING, enum: ['简单', '中等', '困难'] },
            potentialMonthlyIncome: { type: Type.STRING },
            steps: { 
              type: Type.ARRAY,
              items: { type: Type.STRING }
            }
          },
          required: ['title', 'description', 'difficulty', 'potentialMonthlyIncome', 'steps']
        }
      }
    }
  });

  try {
    // response.text is a property, not a method
    return JSON.parse(response.text || '[]');
  } catch (e) {
    console.error("Failed to parse wealth ideas", e);
    return [];
  }
};

export const wealthGuruChat = async (history: {role: string, parts: {text: string}[]}[], message: string) => {
  // Use ai.chats.create to start a conversation with history and system instruction
  const chat = ai.chats.create({
    model: 'gemini-3-pro-preview',
    // Passing history ensures the model has context of previous messages
    history: history as any,
    config: {
      systemInstruction: "你是一个顶级的财富顾问和商业教练，名叫'钱多多'。你的目标是帮助用户发现赚钱机会、优化财务计划。你的语气应该是专业、睿智、充满动力且务实的。不要说废话，直接给出有价值的见解。",
    }
  });

  const response = await chat.sendMessage({ message: message });
  // response.text is a property, not a method
  return response.text;
};
