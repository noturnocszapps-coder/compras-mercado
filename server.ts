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
            text: prompt || "Analise esta imagem de um produto de supermercado, etiqueta de preço ou nota fiscal. Identifique com precisão: product_name (nome legível), brand (marca), quantity (valor numérico), unit (unidade: kg, g, l, ml, un, pct), category (escolha uma: Hortifruti, Limpeza, Higiene, Açougue, Bebidas, Padaria, Frios, Congelados, Pet, Utilidades, Despensa), normal_price (número), promo_price (número), market (nome do mercado se visível), club_name (nome do clube de fidelidade se houver), is_promotion (boolean), analysis (breve descrição do que viu). Retorne APENAS um JSON puro."
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

      const prompt = `Você é o assistente inteligente do CompraFácil IA. Seu objetivo é ajudar o usuário a gerenciar listas de compras e estoque de forma rápida e premium.
      O usuário disse: "${text}"
      Contexto atual (ID da lista, itens, etc): ${JSON.stringify(context)}
      
      Regras de Negócio:
      1. Se o usuário quiser adicionar item mas não especificar quantidade, use 1.
      2. Tente extrair unidade da fala (ex: "um quilo de arroz" -> unit: "kg").
      3. Classifique em uma destas categorias: Hortifruti, Limpeza, Higiene, Açougue, Bebidas, Padaria, Frios, Congelados, Pet, Utilidades, Despensa.
      
      Ações possíveis:
      - action: "addItem", data: { name, quantity, unit, category, price }
      - action: "checkItem", data: { name, paidPrice }
      - action: "query", data: { question: "sua resposta amigável aqui" }
      - action: "navigate", data: { destination: "/dashboard" | "/listas" | "/estoque" | "/perfil" }
      
      Retorne APENAS o JSON puro. Não explique.`;

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
