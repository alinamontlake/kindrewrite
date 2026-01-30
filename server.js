import express from 'express';
import { Client } from '@gradio/client';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';

// Load environment variables from .env file
dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(express.json());
app.use(express.static(__dirname));

/**
 * POST /api/moderate
 * 
 * Uses the Hugging Face "Friendly Text Moderator" API to analyze text toxicity.
 * This endpoint serves as a COACHING tool, not a blocker - it helps users
 * understand how their message might be perceived and offers guidance for improvement.
 */
app.post('/api/moderate', async (req, res) => {
  try {
    const { text, safer = 0.1 } = req.body;

    // Validate input
    if (!text || typeof text !== 'string') {
      return res.status(400).json({ 
        error: 'Invalid input: text field is required and must be a string' 
      });
    }

    if (text.trim().length === 0) {
      return res.status(400).json({ 
        error: 'Invalid input: text cannot be empty' 
      });
    }

    if (text.length > 5000) {
      return res.status(400).json({ 
        error: 'Invalid input: text is too long (max 5000 characters)' 
      });
    }

    // Check if HF_TOKEN is configured
    if (!process.env.HF_TOKEN) {
      return res.status(500).json({ 
        error: 'Server configuration error: HF_TOKEN not set' 
      });
    }

    // Connect to the Hugging Face Space
    // This API analyzes text for potentially harmful content (toxicity, aggression, etc.)
    const client = await Client.connect("duchaba/Friendly_Text_Moderation", {
      hf_token: process.env.HF_TOKEN
    });

    // Call the moderation API
    // The /fetch_toxicity_level endpoint returns a toxicity score between 0 and 1
    const result = await client.predict("/fetch_toxicity_level", {
      msg: text,
      safer: safer
    });

    // Extract toxicity score from API response
    // Result structure: { data: [matplotlib_plot, json_string_with_scores] }
    // The toxicity data is in data[1] as a JSON string
    const toxicityDataStr = result.data?.[1];
    
    if (!toxicityDataStr) {
      throw new Error('Unexpected API response format');
    }

    // Parse the JSON string to get the toxicity scores
    const toxicityData = JSON.parse(toxicityDataStr);
    
    // Use max_value as the toxicity score (highest score across all categories)
    const toxicityScore = toxicityData.max_value;

    // Convert score (0-1) to percentage for better UX
    const scorePct = Math.round(toxicityScore * 100);

    res.json({
      scorePct: scorePct,
      score01: toxicityScore,
      raw: result.data
    });

  } catch (error) {
    console.error('Error in /api/moderate:', error);
    
    // Provide user-friendly error messages
    if (error.message?.includes('connect')) {
      return res.status(503).json({ 
        error: 'Unable to connect to moderation service. Please try again.' 
      });
    }
    
    res.status(500).json({ 
      error: 'Failed to analyze message. Please try again.' 
    });
  }
});

/**
 * POST /api/rewrite
 * 
 * Generates a rewritten version of the text using RULE-BASED templates.
 * This is intentionally NOT another LLM call - we use simple text transformation
 * rules to demonstrate coaching and guidance without additional AI complexity.
 */
app.post('/api/rewrite', async (req, res) => {
  try {
    const { text, tone } = req.body;

    // Validate input
    if (!text || typeof text !== 'string') {
      return res.status(400).json({ 
        error: 'Invalid input: text field is required and must be a string' 
      });
    }

    if (!tone || !['professional', 'calm', 'friendly', 'short'].includes(tone)) {
      return res.status(400).json({ 
        error: 'Invalid input: tone must be one of: professional, calm, friendly, short' 
      });
    }

    // Rule-based rewriting logic
    // These templates soften language, remove aggressive words, and add constructive framing
    const rewritten = applyRewriteRules(text, tone);

    res.json({ 
      rewritten: rewritten,
      tone: tone
    });

  } catch (error) {
    console.error('Error in /api/rewrite:', error);
    res.status(500).json({ 
      error: 'Failed to rewrite message. Please try again.' 
    });
  }
});

/**
 * Rule-based text rewriting function
 * 
 * This function applies simple transformation rules to soften harsh language.
 * It's designed to be transparent and predictable - no "black box" AI here.
 */
function applyRewriteRules(text, tone) {
  let result = text;

  // Step 1: Remove common aggressive/harsh words and phrases
  const aggressivePatterns = [
    { pattern: /\b(stupid|dumb|idiotic|moronic)\b/gi, replacement: 'unclear' },
    { pattern: /\b(hate|despise|loathe)\b/gi, replacement: "don't prefer" },
    { pattern: /\b(terrible|awful|horrible|atrocious)\b/gi, replacement: 'not ideal' },
    { pattern: /\b(never|always)\b/gi, replacement: 'sometimes' },
    { pattern: /\b(useless|worthless)\b/gi, replacement: 'not quite working' },
    { pattern: /\b(waste of time)\b/gi, replacement: 'could be optimized' },
    { pattern: /\b(wrong|incorrect)\b/gi, replacement: 'might need adjustment' },
    { pattern: /\b(obviously|clearly)\b/gi, replacement: 'it seems' },
    { pattern: /\b(fail|failed|failure)\b/gi, replacement: "didn't work out" },
    { pattern: /\b(ridiculous|absurd)\b/gi, replacement: 'surprising' }
  ];

  for (const { pattern, replacement } of aggressivePatterns) {
    result = result.replace(pattern, replacement);
  }

  // Step 2: Apply tone-specific templates
  switch (tone) {
    case 'professional':
      result = wrapProfessional(result);
      break;
    case 'calm':
      result = wrapCalm(result);
      break;
    case 'friendly':
      result = wrapFriendly(result);
      break;
    case 'short':
      result = wrapShort(result);
      break;
  }

  return result;
}

function wrapProfessional(text) {
  // Add professional framing
  const intro = "I wanted to share some feedback regarding this matter. ";
  const outro = " I believe addressing this could lead to better outcomes. Please let me know your thoughts.";
  
  // Clean up multiple spaces and trim
  text = text.replace(/\s+/g, ' ').trim();
  
  return intro + text.charAt(0).toUpperCase() + text.slice(1) + outro;
}

function wrapCalm(text) {
  // Add calming, empathetic framing
  const intro = "I understand there may be different perspectives here. ";
  const outro = " I'd appreciate the opportunity to discuss this further when you have time.";
  
  text = text.replace(/\s+/g, ' ').trim();
  
  return intro + text.charAt(0).toUpperCase() + text.slice(1) + outro;
}

function wrapFriendly(text) {
  // Add warm, collaborative framing
  const intro = "Hey! I wanted to chat about something. ";
  const outro = " Would love to hear your take on this! 😊";
  
  text = text.replace(/\s+/g, ' ').trim();
  
  return intro + text.charAt(0).toUpperCase() + text.slice(1) + outro;
}

function wrapShort(text) {
  // Condense to core message with constructive framing
  text = text.replace(/\s+/g, ' ').trim();
  
  // Try to extract the main point (first sentence or first 100 chars)
  const firstSentence = text.match(/^[^.!?]+[.!?]/)?.[0] || text.substring(0, 100);
  
  return "Quick note: " + firstSentence.trim() + " Let's discuss.";
}

// Start server
app.listen(PORT, () => {
  console.log(`KindRewrite server running on http://localhost:${PORT}`);
  console.log(`HF_TOKEN configured: ${process.env.HF_TOKEN ? 'Yes ✓' : 'No ✗'}`);
  
  if (!process.env.HF_TOKEN) {
    console.warn('⚠️  WARNING: HF_TOKEN not set. Please create a .env file with your Hugging Face token.');
  }
});

// Export for Vercel serverless
export default app;
