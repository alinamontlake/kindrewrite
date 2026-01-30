# KindRewrite 💬✨

A web application that helps users rewrite potentially harmful messages into kinder, more constructive versions using AI-powered text moderation.

## Purpose

Built for an AI Solution Architect course assignment, KindRewrite demonstrates how to use AI moderation as a **coaching tool** rather than a blocker. Instead of simply flagging toxic content, it guides users to communicate more effectively.

## Features

- **Toxicity Analysis**: Uses Hugging Face's "Friendly Text Moderator" API to analyze message tone
- **Smart Verdict**: Clear feedback on whether your message needs improvement
- **Rule-Based Rewrites**: Four rewriting styles (Professional, Calm, Friendly, Very Short)
- **No Black Box**: Rewrites use transparent, rule-based templates instead of additional AI calls
- **Copy to Clipboard**: Easy integration with your workflow

## Tech Stack

- **Backend**: Node.js + Express
- **Frontend**: Plain HTML/CSS/JavaScript (no frameworks)
- **API Client**: @gradio/client for Hugging Face integration
- **Architecture**: ES modules

## Setup Instructions

### 1. Prerequisites

- Node.js 18+ installed
- A Hugging Face account with an API token

### 2. Get Your Hugging Face Token

1. Go to [Hugging Face Settings](https://huggingface.co/settings/tokens)
2. Create a new token with "read" permissions
3. Copy the token

### 3. Install Dependencies

```bash
npm install
```

### 4. Configure Environment

Create a `.env` file in the project root:

```bash
cp .env.example .env
```

Edit `.env` and add your Hugging Face token:

```
HF_TOKEN=your_actual_token_here
PORT=3000
```

⚠️ **IMPORTANT**: Never commit your `.env` file to version control. It contains secrets.

### 5. Run the Application

```bash
npm start
```

Or for development with auto-restart:

```bash
npm run dev
```

### 6. Open in Browser

Navigate to: http://localhost:3000

## How It Works

### Moderation Flow

1. User pastes a message they want to send
2. User clicks "Check message"
3. Backend calls Hugging Face API (`duchaba/Friendly_Text_Moderation`)
4. API returns toxicity score (0-1, converted to 0-100%)
5. Frontend displays:
   - Score percentage
   - Verdict: "Looks OK ✅" (<50%) or "Needs rewrite ⚠️" (≥50%)

### Rewriting Flow

1. If toxicity ≥ 50%, four tone buttons appear
2. User selects desired tone
3. Backend applies **rule-based** text transformations:
   - Replaces harsh words (e.g., "stupid" → "unclear")
   - Removes aggressive phrasing
   - Adds constructive framing
4. Frontend displays rewritten version with Copy button

### Why Rule-Based Rewrites?

Using templates instead of another AI call:
- Makes the process **transparent** and predictable
- Avoids "black box" transformations
- Reduces API costs and latency
- Demonstrates architectural decision-making for the assignment

## API Endpoints

### POST `/api/moderate`

Analyzes text toxicity.

**Request:**
```json
{
  "text": "Your message here",
  "safer": 1
}
```

**Response:**
```json
{
  "scorePct": 75,
  "score01": 0.75,
  "raw": [0.75]
}
```

### POST `/api/rewrite`

Rewrites text with specified tone.

**Request:**
```json
{
  "text": "Your message here",
  "tone": "professional"
}
```

**Response:**
```json
{
  "rewritten": "I wanted to share some feedback...",
  "tone": "professional"
}
```

**Valid tones:** `professional`, `calm`, `friendly`, `short`

## Project Structure

```
kindrewrite/
├── server.js          # Express backend with API endpoints
├── index.html         # Frontend UI
├── package.json       # Dependencies and scripts
├── .env              # Environment variables (create this, not in repo)
├── .env.example      # Template for .env file
└── README.md         # This file
```

## Design Decisions

1. **ES Modules**: Modern JavaScript standards
2. **No Frontend Framework**: Keeps it simple and demonstrates vanilla JS skills
3. **Rule-Based Rewrites**: Transparent, predictable, no additional AI costs
4. **Coaching Philosophy**: Moderation guides improvement rather than blocking content
5. **Input Validation**: Comprehensive error handling for production-quality code

## Security Notes

- ✅ API token read from environment variables
- ✅ Input validation on all endpoints
- ✅ Length limits on text inputs
- ✅ Error messages don't expose system details
- ⚠️ Never hardcode secrets in code
- ⚠️ Keep `.env` out of version control

## Deployment to Vercel

### Option 1: Deploy via Vercel CLI

1. Install Vercel CLI:
```bash
npm install -g vercel
```

2. Login to Vercel:
```bash
vercel login
```

3. Deploy:
```bash
vercel
```

4. Set environment variable:
```bash
vercel env add HF_TOKEN
```
(Paste your Hugging Face token when prompted)

5. Redeploy with environment variable:
```bash
vercel --prod
```

### Option 2: Deploy via Vercel Dashboard

1. Push your code to GitHub
2. Go to [vercel.com](https://vercel.com)
3. Click "Import Project"
4. Select your GitHub repository
5. Add environment variable:
   - Key: `HF_TOKEN`
   - Value: Your Hugging Face token
6. Click "Deploy"

**Note:** Make sure `.env` is in `.gitignore` before pushing to GitHub!

## Future Enhancements

- Add support for multiple languages
- Implement user authentication
- Store rewrite history
- Add more tone options
- Export rewrite comparisons

## License

MIT

## Assignment Notes

This project demonstrates:
- ✅ Practical use of Hugging Face API
- ✅ Thoughtful API selection (moderation as coaching)
- ✅ Clean architecture and code organization
- ✅ Production-ready error handling
- ✅ Clear documentation
- ✅ Security best practices

---

Built with 💜 for AI Solution Architect Course
