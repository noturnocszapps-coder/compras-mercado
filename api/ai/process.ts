import { GoogleGenAI } from "@google/genai";

export default async function handler(req: any, res: any) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const { text, context } = req.body;
    if (!process.env.GEMINI_API_KEY) {
      return res.status(500).json({ error: "Gemini API Key missing" });
    }

    const genAI = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });
    const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });

    const prompt = `Você é o assistente do CompraFácil IA. 
    O usuário disse: "${text}"
    Contexto atual: ${JSON.stringify(context)}
    
    Retorne um JSON com a ação pretendida:
    - action: "addItem", data: { name, quantity, unit, category, price }
    - action: "checkItem", data: { name, paidPrice }
    - action: "query", data: { question }
    - action: "navigate", data: { destination }
    
    Categorias válidas: Alimentação, Carnes e Mistura, Hortifruti, Bebidas, Padaria, Higiene Pessoal, Limpeza, Pet, Bebê, Farmácia, Cuidados, Outros.
    Retorne APENAS o JSON.`;

    const result = await model.generateContent(prompt);
    const responseText = result.response.text();
    const jsonMatch = responseText.match(/\{[\s\S]*\}/);
    
    if (jsonMatch) {
      res.status(200).json(JSON.parse(jsonMatch[0]));
    } else {
      res.status(500).json({ error: "Failed to parse AI response" });
    }
  } catch (error: any) {
    console.error("AI Process error:", error);
    res.status(500).json({ error: "AI Process failed", details: error.message });
  }
}
