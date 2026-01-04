// ============================================
// LOCALBUZZ AI BACKEND SERVER - OpenAI Version
// Place this in: localbuzzz/ai-server/index.js
// Run with: node index.js
// ============================================

const express = require('express');
const cors = require('cors');
require('dotenv').config();

const app = express();
app.use(cors());
app.use(express.json({ limit: '10mb' }));

const PORT = 3001;

// ============================================
// OPENAI API HELPER FUNCTION
// ============================================
async function callOpenAI(prompt, maxTokens = 1024) {
  try {
    const response = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${process.env.OPENAI_API_KEY}`
      },
      body: JSON.stringify({
        model: 'gpt-4-turbo-preview', // or 'gpt-3.5-turbo' for cheaper option
        max_tokens: maxTokens,
        temperature: 0.7,
        messages: [
          {
            role: 'system',
            content: 'You are a helpful assistant for LocalBuzz, a local events platform. Provide concise, accurate responses.'
          },
          {
            role: 'user',
            content: prompt
          }
        ]
      })
    });

    if (!response.ok) {
      const error = await response.text();
      throw new Error(`OpenAI API error: ${response.status} - ${error}`);
    }

    const data = await response.json();
    return data.choices[0].message.content;
  } catch (error) {
    console.error('OpenAI API Error:', error);
    throw error;
  }
}

// ============================================
// 1. AI SEARCH ENDPOINT
// ============================================
app.post('/ai/search', async (req, res) => {
  try {
    const { query, events } = req.body;

    console.log('🔍 AI Search Request:', query);

    // Prepare events data for AI (first 20 events)
    const eventsForAI = events.slice(0, 20).map((e, idx) => ({
      index: idx,
      title: e.title,
      category: e.category,
      date: e.date,
      location: e.location,
      distance: e.distance ? e.distance.toFixed(1) + ' km' : 'N/A'
    }));

    const prompt = `You are an intelligent event search assistant. 

User Query: "${query}"

Available Events:
${JSON.stringify(eventsForAI, null, 2)}

Task: Analyze the user's natural language query and return the indices of events that best match their intent.

Rules:
- Understand semantic meaning (e.g., "morning activities" includes yoga, running, etc.)
- Consider location mentions (e.g., "near Indiranagar")
- Consider time mentions (e.g., "weekend", "morning", "evening")
- Consider categories (fitness, religious, social, etc.)
- Return 5-10 most relevant events
- Sort by relevance

Return ONLY a JSON array of event indices. Example: [0, 3, 7, 12, 15]

NO explanations, NO markdown, ONLY the JSON array.`;

    const result = await callOpenAI(prompt, 512);
    
    // Clean the response
    const cleanResult = result.replace(/```json|```/g, '').trim();
    
    console.log('✅ AI Search Response:', cleanResult);

    res.json({ result: cleanResult });
  } catch (error) {
    console.error('❌ AI Search Error:', error);
    res.status(500).json({ error: error.message });
  }
});

// ============================================
// 2. AI DESCRIPTION GENERATOR ENDPOINT
// ============================================
app.post('/ai/description', async (req, res) => {
  try {
    const { title, category, location, date } = req.body;

    console.log('✨ AI Description Request:', { title, category, location, date });

    const prompt = `Create a warm, inviting, and community-focused event description.

Event Details:
- Title: ${title}
- Category: ${category}
- Location: ${location}
- Date/Time: ${date}

Requirements:
1. Write 2-3 engaging paragraphs (150-200 words total)
2. Use a friendly, welcoming tone
3. Mention what attendees can expect
4. Include practical details (what to bring, who can join, etc.)
5. End with a call-to-action
6. Sound authentic and local, not corporate
7. Use simple, clear language

Write ONLY the description text. NO titles, NO formatting, NO markdown.`;

    const result = await callOpenAI(prompt, 600);
    
    console.log('✅ AI Description Generated:', result.substring(0, 100) + '...');

    res.json({ text: result.trim() });
  } catch (error) {
    console.error('❌ AI Description Error:', error);
    res.status(500).json({ error: error.message });
  }
});

// ============================================
// 3. AI ATTENDANCE PREDICTOR ENDPOINT
// ============================================
app.post('/ai/predict', async (req, res) => {
  try {
    const { event } = req.body;

    console.log('🔮 AI Prediction Request:', event.title);

    const prompt = `You are a data analyst specializing in local event attendance prediction.

Event Details:
- Title: ${event.title}
- Category: ${event.category}
- Date: ${event.date}
- Location: ${event.location}
${event.description ? `- Description: ${event.description.substring(0, 200)}...` : ''}

Task: Predict expected attendance based on:
1. Event category popularity (fitness, religious, social, etc.)
2. Day and time suitability
3. Location accessibility
4. Typical local community engagement patterns

Return ONLY a JSON object with this EXACT structure:
{
  "predicted_attendance": <number between 10 and 150>,
  "confidence": "high" or "medium" or "low",
  "reasons": [
    "Brief reason about timing/day (e.g., 'Sunday morning is optimal for yoga sessions')",
    "Brief reason about category (e.g., 'Fitness events typically attract 30-50 attendees')",
    "Brief reason about location (e.g., 'Location has strong community presence')"
  ]
}

NO markdown, NO explanations, ONLY the JSON object.`;

    const result = await callOpenAI(prompt, 512);
    
    // Clean the response
    const cleanResult = result.replace(/```json|```/g, '').trim();
    
    console.log('✅ AI Prediction:', cleanResult);

    res.json({ result: cleanResult });
  } catch (error) {
    console.error('❌ AI Prediction Error:', error);
    res.status(500).json({ error: error.message });
  }
});

// ============================================
// HEALTH CHECK ENDPOINT
// ============================================
app.get('/health', (req, res) => {
  res.json({ 
    status: 'OK', 
    message: 'LocalBuzz AI Backend is running (OpenAI)',
    endpoints: [
      'POST /ai/search',
      'POST /ai/description', 
      'POST /ai/predict'
    ]
  });
});

// ============================================
// ERROR HANDLER
// ============================================
app.use((err, req, res, next) => {
  console.error('Server Error:', err);
  res.status(500).json({ error: 'Internal server error', message: err.message });
});

// ============================================
// START SERVER
// ============================================
app.listen(PORT, () => {
  console.log(`
╔═══════════════════════════════════════════════════════════╗
║                                                           ║
║   🚀 LocalBuzz AI Backend Server (OpenAI)                ║
║                                                           ║
║   Status: Running                                         ║
║   Port: ${PORT}                                              ║
║   Model: GPT-4 Turbo                                      ║
║                                                           ║
║   Endpoints:                                              ║
║     - POST http://localhost:${PORT}/ai/search            ║
║     - POST http://localhost:${PORT}/ai/description       ║
║     - POST http://localhost:${PORT}/ai/predict           ║
║                                                           ║
║   ✅ Ready to process AI requests!                       ║
║                                                           ║
╚═══════════════════════════════════════════════════════════╝
  `);
  
  // Check if API key is set
  if (!process.env.OPENAI_API_KEY) {
    console.error(`
⚠️  WARNING: OPENAI_API_KEY not found in .env file!
    
Please create a .env file in ai-server folder with:
OPENAI_API_KEY=sk-your-openai-key-here
    `);
  } else {
    console.log('✅ OpenAI API Key detected');
    console.log(`✅ Using model: GPT-4 Turbo\n`);
  }
});