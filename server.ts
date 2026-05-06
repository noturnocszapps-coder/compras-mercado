import express from "express";
import { createServer as createViteServer } from "vite";
import path from "path";
import { fileURLToPath } from "url";
import { GoogleGenAI } from "@google/genai";
import dotenv from "dotenv";

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

async function startServer() {
  const app = express();
  const PORT = 3000;

  app.use(express.json({ limit: '10mb' }));

  // API Routes
  app.post("/api/ai/scan", async (req, res) => {
    try {
      const { image, prompt } = req.body;
      if (!process.env.GEMINI_API_KEY) {
        return res.status(500).json({ error: "Gemini API Key missing" });
      }

      const genAI = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY! });
      
      const result = await genAI.models.generateContent({
        model: "gemini-2.0-flash",
        contents: [
          {
            text: prompt || "Analise esta imagem de um produto de supermercado ou etiqueta e retorne um JSON com: product_name, brand, quantity, unit, category, normal_price, promo_price, market, club_name, is_promotion (boolean), analysis. Retorne APENAS o JSON."
          },
          {
            inlineData: {
              data: image.split(",")[1],
              mimeType: "image/jpeg",
            },
          },
        ],
      });

      const responseText = result.text;
      // Basic JSON extraction
      const jsonMatch = responseText.match(/\{[\s\S]*\}/);
      if (jsonMatch) {
        res.json(JSON.parse(jsonMatch[0]));
      } else {
        res.status(500).json({ error: "Failed to parse AI response" });
      }
    } catch (error) {
      console.error("AI Scan error:", error);
      res.status(500).json({ error: "AI Scan failed" });
    }
  });

  app.post("/api/ai/process", async (req, res) => {
    try {
      const { text, context } = req.body;
      if (!process.env.GEMINI_API_KEY) {
        return res.status(500).json({ error: "Gemini API Key missing" });
      }

      const genAI = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY! });

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

      const result = await genAI.models.generateContent({
        model: "gemini-2.0-flash",
        contents: [{ text: prompt }]
      });
      const responseText = result.text;
      const jsonMatch = responseText.match(/\{[\s\S]*\}/);
      
      if (jsonMatch) {
        res.json(JSON.parse(jsonMatch[0]));
      } else {
        res.status(500).json({ error: "Failed to parse AI response" });
      }
    } catch (error) {
      console.error("AI Process error:", error);
      res.status(500).json({ error: "AI Process failed" });
    }
  });

  // Vite middleware for development
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), "dist");
    app.use(express.static(distPath));
    app.get("*", (req, res) => {
      res.sendFile(path.join(distPath, "index.html"));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Server running on http://localhost:${PORT}`);
  });
}

startServer();
