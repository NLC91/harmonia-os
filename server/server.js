/**
 * Example Node/Express server for Harmonia OS AI suggestions.
 *
 * - Uses OpenAI (GPT-3.5 / GPT-4 depending on your quota).
 * - Requires OPENAI_API_KEY as environment variable.
 * - Minimal validation + rate limiting.
 *
 * Security / production notes:
 * - DO NOT commit your OPENAI_API_KEY. Use environment variables in hosting provider.
 * - Consider stronger rate-limiting, auth (API key per user), logging, and request auditing.
 * - Keep payload minimal: do NOT send raw journals, personal messages, or PII.
 */

const express = require('express');
const helmet = require('helmet');
const rateLimit = require('express-rate-limit');
const cors = require('cors');
const bodyParser = require('body-parser');
const { Configuration, OpenAIApi } = require('openai');

const app = express();
app.use(helmet());
app.use(cors()); // restrict origins in production
app.use(bodyParser.json({ limit: '8kb' }));

// Very small rate limiter (for demo)
const limiter = rateLimit({
    windowMs: 60 * 1000, // 1 minute
    max: 30, // limit each IP to 30 requests per windowMs
    message: { error: 'Too many requests, please slow down.' }
});
app.use(limiter);

// OpenAI client
if (!process.env.OPENAI_API_KEY) {
    console.warn('Warning: OPENAI_API_KEY not set. AI endpoint will fail without it.');
}
const configuration = new Configuration({
    apiKey: process.env.OPENAI_API_KEY
});
const openai = new OpenAIApi(configuration);

app.post('/api/ai-suggest', async (req, res) => {
    try {
        // Basic validation: ensure payload has a summary.spheres array
        const payload = req.body || {};
        if (!payload.summary || !Array.isArray(payload.summary.spheres)) {
            return res.status(400).json({ error: 'Invalid payload. Expect summary.spheres array.' });
        }

        // Build a concise prompt for the LLM
        const spheres = payload.summary.spheres.map(s => `${s.name}: ${s.progress}%`).join('; ');
        const harmonyScore = payload.summary.harmonyScore || null;

        const prompt = `
You are a helpful assistant that suggests a single small, actionable micro-habit to improve the user's balance.
Input: ${spheres}
Harmony score: ${harmonyScore}

Constraints:
- Provide exactly one simple micro-action (<= 10 words) and estimated duration in minutes.
- Avoid asking for personal data. Do not suggest something that requires sharing private info.
- Be concrete and feasible (e.g., "Drink a glass of water", "5-minute breathing").
- Return JSON ONLY with keys: recommendedAction { text, durationMin }, reason (1-2 short sentences).

Respond with JSON only.
`;

        // If OpenAI isn't configured, fall back to an error
        if (!process.env.OPENAI_API_KEY) {
            return res.status(500).json({ error: 'AI not configured on server.' });
        }

        // Call OpenAI Chat Completion
        const completion = await openai.createChatCompletion({
            model: 'gpt-3.5-turbo',
            messages: [
                { role: 'system', content: 'You are a helpful assistant that returns concise JSON suggestions.' },
                { role: 'user', content: prompt }
            ],
            temperature: 0.4,
            max_tokens: 150
        });

        const text = completion.data.choices[0].message.content.trim();

        // Try to parse JSON from model output safely
        let parsed;
        try {
            parsed = JSON.parse(text);
        } catch (err) {
            // fallback: attempt to extract a JSON substring
            const start = text.indexOf('{');
            const end = text.lastIndexOf('}');
            if (start >= 0 && end > start) {
                const sub = text.substring(start, end + 1);
                parsed = JSON.parse(sub);
            } else {
                throw new Error('Could not parse model output as JSON');
            }
        }

        // Validate parsed result shape
        if (parsed && parsed.recommendedAction && parsed.recommendedAction.text) {
            return res.json(parsed);
        } else {
            return res.status(500).json({ error: 'AI returned unexpected format.' });
        }
    } catch (err) {
        console.error('AI endpoint error', err);
        return res.status(500).json({ error: 'Server error' });
    }
});

// simple health check
app.get('/health', (req, res) => res.json({ status: 'ok' }));

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
    console.log(`Harmonia AI server listening on port ${PORT}`);
});
