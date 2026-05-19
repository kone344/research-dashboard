# AI Research Agent Dashboard

A beautiful Next.js web dashboard for the autonomous research agent. Users can submit research questions, watch the AI agent research in real-time through a multi-phase pipeline, and view the final report with citations.

## Features

- **Real-time Research Pipeline**: Watch as the AI agent decomposes questions, searches the web, extracts claims, cross-references sources, and synthesizes reports
- **LLM-Powered Analysis**: Powered by Xiaomi MiMo v2.5-Pro via OpenAI-compatible API for real research (with fallback to mock mode)
- **Dark Theme**: Beautiful dark UI with gradient backgrounds and subtle animations
- **Phase Indicators**: Visual progress tracking with animated status indicators
- **Report View**: Comprehensive reports with executive summary, key findings, citations, and source reliability scores
- **Research History**: Browse and search past research sessions
- **Mock Mode**: Full demo mode that simulates the research pipeline with realistic delays and sample data

## Tech Stack

- **Next.js 14** with App Router
- **Tailwind CSS** for styling
- **shadcn/ui** components
- **TypeScript** throughout
- **In-memory store** for deployment (no SQLite dependency)
- **Xiaomi MiMo v2.5-Pro** LLM via OpenAI-compatible API

## Getting Started

```bash
# Install dependencies
npm install

# Run development server
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

## LLM Configuration

The dashboard uses a real LLM to power the 5-phase research pipeline. The LLM client is in `lib/mimo-client.ts` and the research engine in `lib/research-engine.ts`.

### How It Works

The research pipeline has 5 phases, each making an LLM call:

1. **Decompose** — Break the research question into 3-5 sub-questions
2. **Search Sources** — Generate authoritative sources with URLs, titles, reliability scores, and snippets
3. **Extract Claims** — Extract key claims/findings from each source
4. **Cross-Reference** — Identify supporting/contradicting claims across sources
5. **Synthesize Report** — Generate executive summary, findings with citations, and overall confidence score

### API Format

The LLM client uses the **OpenAI-compatible chat completions format**:

```
POST {BASE_URL}/chat/completions
Content-Type: application/json

{
  "model": "mimo-v2.5-pro",
  "messages": [
    {"role": "system", "content": "You are a research AI..."},
    {"role": "user", "content": "Research question here"}
  ],
  "max_tokens": 2048,
  "temperature": 0.7
}
```

Response format:
```json
{
  "choices": [{
    "message": {
      "content": "The actual response text",
      "reasoning_content": "Internal reasoning (for reasoning models)"
    },
    "finish_reason": "stop"
  }],
  "usage": {
    "prompt_tokens": 257,
    "completion_tokens": 41
  }
}
```

### Supported Endpoints

Any OpenAI-compatible endpoint works. Swap `BASE_URL` to switch providers:

| Provider | Base URL | API Key | Model | Notes |
|----------|----------|---------|-------|-------|
| **Xiaomi MiMo (Official)** | `https://api.xiaomimimo.com/v1` | Required — get from [Console](https://platform.xiaomimimo.com/#/console/api-keys) | `mimo-v2.5-pro` | Official platform, apply for free 100T tokens at [100t.xiaomimimo.com](https://100t.xiaomimimo.com) |
| **Xiaomi MiMo (GitLawb Proxy)** | `https://opengateway.gitlawb.com/v1/xiaomi-mimo` | Not required (use `none`) | `mimo-v2.5-pro` | Community proxy, free, rate limits unknown |
| **OpenRouter** | `https://openrouter.ai/api/v1` | Required | `xiaomi/mimo-v2.5-pro` | Paid ($1/M input, $3/M output), many models available |
| **Local (Ollama/vLLM)** | `http://localhost:11434/v1` | Not required | any local model | Self-hosted, no rate limits |

### Environment Variables

Set these in `.env.local` (local dev) or in your hosting platform's dashboard (Netlify/Vercel):

```bash
# LLM Configuration
LLM_BASE_URL=https://opengateway.gitlawb.com/v1/xiaomi-mimo
LLM_API_KEY=none
LLM_MODEL=mimo-v2.5-pro
```

### Code Architecture

**`lib/mimo-client.ts`** — Thin HTTP client for OpenAI-compatible chat completions:

```typescript
// Two main functions:
import { chat, chatJSON } from './mimo-client';

// Get plain text response
const text = await chat([
  { role: 'system', content: 'You are a helpful assistant' },
  { role: 'user', content: 'Hello' }
]);

// Get parsed JSON response (auto-extracts from markdown code blocks)
const data = await chatJSON<{ items: string[] }>([
  { role: 'system', content: 'Return JSON only' },
  { role: 'user', content: 'List 3 fruits' }
]);
```

**`lib/research-engine.ts`** — 5-phase research pipeline:

```
decomposeQuestion()  → LLM → sub-questions[]
searchSources()      → LLM → sources[]
extractClaims()      → LLM → claims[]
crossReference()     → LLM → cross-references[]
synthesizeReport()   → LLM → report (summary + findings + confidence)
```

Each phase updates the session state in the in-memory store, which the frontend polls every 2 seconds to show real-time progress.

### Switching Providers

To switch from MiMo to another provider, change the constants in `lib/mimo-client.ts`:

```typescript
// Default: MiMo via GitLawb proxy (free, no key)
const BASE_URL = 'https://opengateway.gitlawb.com/v1/xiaomi-mimo';
const MODEL = 'mimo-v2.5-pro';

// Or use OpenAI:
// const BASE_URL = 'https://api.openai.com/v1';
// const MODEL = 'gpt-4o';

// Or use Anthropic (via proxy):
// const BASE_URL = 'https://api.anthropic.com/v1';
// const MODEL = 'claude-sonnet-4-20250514';
```

For production, use environment variables instead of hardcoding:

```typescript
const BASE_URL = process.env.LLM_BASE_URL || 'https://opengateway.gitlawb.com/v1/xiaomi-mimo';
const API_KEY = process.env.LLM_API_KEY || 'none';
const MODEL = process.env.LLM_MODEL || 'mimo-v2.5-pro';
```

## Deployment

### Vercel (Recommended for Next.js)

```bash
npm i -g vercel
vercel
```

### Netlify

```bash
npm i -g netlify-cli
netlify init
netlify deploy --prod
```

Requires `@netlify/plugin-nextjs` (already configured in `netlify.toml`).

### Environment Variables on Hosting Platform

Set in Vercel/Netlify dashboard:

| Variable | Description | Default |
|----------|-------------|---------|
| `LLM_BASE_URL` | OpenAI-compatible API base URL | `https://opengateway.gitlawb.com/v1/xiaomi-mimo` |
| `LLM_API_KEY` | API key (use `none` if not required) | `none` |
| `LLM_MODEL` | Model name | `mimo-v2.5-pro` |

## Project Structure

```
├── app/
│   ├── api/
│   │   ├── history/route.ts       # GET /api/history
│   │   └── research/
│   │       ├── route.ts            # POST /api/research
│   │       └── [id]/
│   │           ├── route.ts        # GET /api/research/[id]
│   │           └── report/
│   │               └── route.ts    # GET /api/research/[id]/report
│   ├── history/page.tsx            # History page
│   ├── report/[id]/page.tsx        # Report view page
│   ├── research/[id]/page.tsx      # Research progress page
│   ├── globals.css                 # Global styles
│   ├── layout.tsx                  # Root layout
│   └── page.tsx                    # Home page
├── components/
│   ├── ui/                         # shadcn/ui components
│   ├── FindingCard.tsx
│   ├── HistoryTable.tsx
│   ├── PhaseCard.tsx
│   ├── ProgressBar.tsx
│   ├── SearchInput.tsx
│   ├── SourceCard.tsx
│   └── StatsGrid.tsx
├── lib/
│   ├── database.ts                 # In-memory data store
│   ├── mimo-client.ts              # LLM API client (OpenAI-compatible)
│   ├── research-engine.ts          # 5-phase LLM research pipeline
│   ├── mock-research.ts            # Mock research pipeline (fallback)
│   ├── types.ts                    # TypeScript types
│   └── utils.ts                    # Utility functions
├── netlify.toml                    # Netlify deployment config
├── package.json
├── tailwind.config.ts
├── tsconfig.json
└── README.md
```

## API Routes

### Start Research
```http
POST /api/research
Content-Type: application/json

{
  "question": "What is the impact of AI on software development?",
  "depth": "standard"
}
```

### Get Research Status
```http
GET /api/research/:id
```

### Get Report
```http
GET /api/research/:id/report
```

### List History
```http
GET /api/history?limit=50&offset=0
```

## License

MIT
