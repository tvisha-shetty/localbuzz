console.log("SERVER FILE LOADED");
import express from "express";
import fetch from "node-fetch";
import cors from "cors";
import dotenv from "dotenv";

dotenv.config();

const app = express();
app.use(cors());
app.use(express.json());

app.post("/api/generate-description", async (req, res) => {
  console.log("GROQ KEY EXISTS:", !!process.env.GROQ_API_KEY);

  const { title, category, location, date } = req.body;

  try {
    const response = await fetch(
      "https://api.groq.com/openai/v1/chat/completions",
      {
        method: "POST",
        headers: {
          Authorization: `Bearer ${process.env.GROQ_API_KEY}`,
          "Content-Type": "application/json"
        },
        body: JSON.stringify({
  model: "llama-3.1-8b-instant",
  messages: [
    {
      role: "user",
      content: `Write a 2-3 sentence event description.
Title: ${title}
Category: ${category}
Location: ${location}
Date: ${date || "TBD"}`
    }
  ],
  temperature: 0.7
})

      }
    );

    const data = await response.json();

    if (!response.ok) {
      console.error("Groq API error:", data);
      return res.status(500).json({ error: data });
    }

    if (!data.choices || !data.choices[0]) {
      console.error("Unexpected Groq response:", data);
      return res.status(500).json({ error: "Invalid Groq response" });
    }

    res.json({ text: data.choices[0].message.content });
  } catch (err) {
    console.error("Server error:", err);
    res.status(500).json({ error: "AI generation failed" });
  }
});

app.listen(3001, () => {
  console.log("Backend running on http://localhost:3001");
});
