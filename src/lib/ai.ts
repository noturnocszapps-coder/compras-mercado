import { GoogleGenAI, Type } from "@google/genai";

const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY! });

export interface ScanResult {
  product_name: string;
  brand: string;
  quantity: number;
  unit: string;
  category: string;
  normal_price: number;
  promo_price: number;
  market: string;
  club_name: string;
  is_promotion: boolean;
  analysis: string;
}

export async function scanProductImage(base64Image: string): Promise<ScanResult> {
  const response = await ai.models.generateContent({
    model: "gemini-3.1-flash-preview",
    contents: [
      {
        text: "Analise esta imagem de um produto de supermercado ou etiqueta e retorne um JSON com os campos: product_name, brand, quantity, unit, category, normal_price, promo_price, market, club_name, is_promotion (boolean), analysis. Se não encontrar algum campo, deixe vazio ou null. Retorne APENAS o JSON.",
      },
      {
        inlineData: {
          data: base64Image.split(",")[1],
          mimeType: "image/jpeg",
        },
      },
    ],
    config: {
      responseMimeType: "application/json",
      responseSchema: {
        type: Type.OBJECT,
        properties: {
          product_name: { type: Type.STRING },
          brand: { type: Type.STRING },
          quantity: { type: Type.NUMBER },
          unit: { type: Type.STRING },
          category: { type: Type.STRING },
          normal_price: { type: Type.NUMBER },
          promo_price: { type: Type.NUMBER },
          market: { type: Type.STRING },
          club_name: { type: Type.STRING },
          is_promotion: { type: Type.BOOLEAN },
          analysis: { type: Type.STRING },
        },
        required: ["product_name", "category"]
      },
    },
  });

  return JSON.parse(response.text);
}

export async function processVoiceCommand(command: string) {
  const response = await ai.models.generateContent({
    model: "gemini-3-flash-preview",
    contents: `Transforme este comando de voz de um app de lista de compras em uma ação JSON: "${command}". 
    Ações possíveis: ADD_ITEM, CHECK_ITEM, SET_PRICE, ASK_TOTAL.
    Exemplo: "Adicionar arroz 5kg" -> { "action": "ADD_ITEM", "data": { "name": "arroz", "quantity": 1, "unit": "5kg" } }
    Retorne apenas o JSON.`,
    config: {
      responseMimeType: "application/json"
    }
  });

  return JSON.parse(response.text);
}
