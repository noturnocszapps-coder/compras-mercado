import { GoogleGenerativeAI } from "@google/generative-ai";

export default async function handler(req: any, res: any) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const { image, prompt } = req.body;
    if (!process.env.GEMINI_API_KEY) {
      return res.status(500).json({ error: "Gemini API Key missing" });
    }

    const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
    const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });
    
    const result = await model.generateContent([
      {
        text: prompt || "Analise esta imagem de um produto de supermercado ou etiqueta e retorne um JSON com: product_name, brand, quantity, unit, category, normal_price, promo_price, market, club_name, is_promotion (boolean), analysis. Retorne APENAS o JSON."
      },
      {
        inlineData: {
          data: image.split(",")[1],
          mimeType: "image/jpeg",
        },
      },
    ]);

    const responseText = result.response.text();
    const jsonMatch = responseText.match(/\{[\s\S]*\}/);
    
    if (jsonMatch) {
      res.status(200).json(JSON.parse(jsonMatch[0]));
    } else {
      res.status(500).json({ error: "Failed to parse AI response" });
    }
  } catch (error: any) {
    console.error("AI Scan error:", error);
    res.status(500).json({ error: "AI Scan failed", details: error.message });
  }
}
