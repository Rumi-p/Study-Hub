import express from "express";
import path from "path";
import { fileURLToPath } from "url";
import { createServer as createViteServer } from "vite";
import { GoogleGenAI } from "@google/genai";
import dotenv from "dotenv";

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

async function startServer() {
  const app = express();
  const PORT = 3000;

  app.use(express.json());

  // Health check endpoint
  app.get("/api/health", (_req, res) => {
    res.json({ status: "ok", timestamp: new Date().toISOString() });
  });

  // AI Academic Chatbot Endpoint
  app.post("/api/chat", async (req, res) => {
    try {
      const { messages, context } = req.body;

      if (!messages || !Array.isArray(messages) || messages.length === 0) {
        return res.status(400).json({ error: "Messages array is required." });
      }

      const apiKey = process.env.GEMINI_API_KEY;
      if (!apiKey) {
        return res.status(500).json({
          error: "GEMINI_API_KEY is not configured. Please add it to your secrets.",
        });
      }

      const ai = new GoogleGenAI({
        apiKey,
        httpOptions: {
          headers: {
            "User-Agent": "aistudio-build",
          },
        },
      });

      // Format student context for the model
      let contextString = "";
      if (context) {
        const { courses, tasks, exams, studyStats } = context;
        contextString = `\n--- STUDENT CONTEXT ---\n`;
        if (courses && courses.length > 0) {
          contextString += `Current Enrolled Courses:\n${courses
            .map((c: any) => `- ${c.name} (${c.code || "Course"}): Grade Goal: ${c.targetGrade || "A"}, Instructor: ${c.instructor || "N/A"}`)
            .join("\n")}\n`;
        }
        if (tasks && tasks.length > 0) {
          contextString += `Pending Tasks & Assignments:\n${tasks
            .filter((t: any) => !t.completed)
            .slice(0, 8)
            .map((t: any) => `- [${t.priority}] ${t.title} (${t.courseName || "General"}), Due: ${t.dueDate || "No date"}`)
            .join("\n")}\n`;
        }
        if (exams && exams.length > 0) {
          contextString += `Upcoming Exams & Milestones:\n${exams
            .slice(0, 5)
            .map((e: any) => `- ${e.title} for ${e.courseName || "Course"} on ${e.date || "TBD"} (Confidence: ${e.confidence || "Medium"}%)`)
            .join("\n")}\n`;
        }
        if (studyStats) {
          contextString += `Study Metrics: ${studyStats.hoursStudiedThisWeek || 0} hrs studied this week, ${studyStats.streakDays || 1} day streak.\n`;
        }
        contextString += `--- END STUDENT CONTEXT ---\n`;
      }

      const systemInstruction = `You are "Acuity", an expert AI academic tutor, study coach, and student productivity companion.
Your mission is to help students excel academically, plan their time effectively, understand challenging concepts deeply, and overcome study fatigue or procrastination.

Guidelines:
1. Tone: Encouraging, intellectually sharp, organized, and empathetic.
2. Structure: Use clean markdown with clear headings, bullet points, and numbered steps. Keep explanations lucid and digestible.
3. Teaching method: When explaining concepts, use the Feynman Technique (simple language, relatable real-world analogies, and step-by-step intuition).
4. Academic Planning: When asked for study schedules or exam prep plans, break down preparation into concrete, actionable time blocks with specific active recall techniques (practice testing, flashcards, spaced repetition, blurting technique).
5. Leverage Context: When the student asks questions relevant to their workload, refer specifically to their enrolled courses, tasks, or upcoming exams provided in the student context.
6. Quizzing: If the student asks for practice or a quiz, generate 3-5 high-yield multiple-choice or short-answer questions and offer to grade their answers!

${contextString}`;

      // Build contents array for Gemini
      // Format history properly: { role: 'user' | 'model', parts: [{ text: ... }] }
      const contents = messages.map((m: { role: string; content: string }) => ({
        role: m.role === "assistant" ? "model" : "user",
        parts: [{ text: m.content }],
      }));

      const response = await ai.models.generateContent({
        model: "gemini-3.8-flash",
        contents,
        config: {
          systemInstruction,
          temperature: 0.7,
        },
      });

      const replyText = response.text || "I'm here to help you study and plan your coursework. What would you like to focus on next?";
      return res.json({ reply: replyText });
    } catch (err: any) {
      console.error("Chat API error:", err);
      return res.status(500).json({
        error: err.message || "Failed to generate AI response. Please try again.",
      });
    }
  });

  // Vite middleware for development vs static build in production
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), "dist");
    app.use(express.static(distPath));
    app.get("*", (_req, res) => {
      res.sendFile(path.join(distPath, "index.html"));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Study Planner Server running on http://0.0.0.0:${PORT}`);
  });
}

startServer().catch((err) => {
  console.error("Fatal server startup error:", err);
});
