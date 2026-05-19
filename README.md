# AI Research Agent Dashboard

A beautiful Next.js web dashboard for the autonomous research agent. Users can submit research questions, watch the AI agent research in real-time through a multi-phase pipeline, and view the final report with citations.

## Features

- **Real-time Research Pipeline**: Watch as the AI agent decomposes questions, searches the web, extracts claims, cross-references sources, and synthesizes reports
- **Dark Theme**: Beautiful dark UI with gradient backgrounds and subtle animations
- **Phase Indicators**: Visual progress tracking with animated status indicators
- **Report View**: Comprehensive reports with executive summary, key findings, citations, and source reliability scores
- **Research History**: Browse and search past research sessions
- **Mock Mode**: Full demo mode that simulates the research pipeline with realistic delays and sample data
- **Vercel-Ready**: Deploy to Vercel with no native dependencies

## Tech Stack

- **Next.js 14** with App Router
- **Tailwind CSS** for styling
- **shadcn/ui** components
- **TypeScript** throughout
- **In-memory store** for Vercel deployment (no SQLite dependency)

## Getting Started

```bash
# Install dependencies
npm install

# Run development server
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

## Deployment

### Vercel (Recommended)

```bash
# Install Vercel CLI
npm i -g vercel

# Deploy
vercel
```

The dashboard works out of the box with mock mode. No additional configuration needed.

### Environment Variables

| Variable | Description | Default |
|----------|-------------|---------|
| `MOCK_MODE` | Enable mock research pipeline | `true` |
| `PYTHON_BACKEND_URL` | URL of Python research agent API | (not set) |

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
│   ├── mock-research.ts            # Mock research pipeline
│   ├── types.ts                    # TypeScript types
│   └── utils.ts                    # Utility functions
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
  "depth": "standard"  // quick | standard | deep
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

## Mock Mode

When running without a Python backend, the dashboard uses mock mode which simulates the full research pipeline:

- **Phase 1** (5s): Decomposes question into 3 sub-questions
- **Phase 2** (10s): Finds 5 sources with URLs
- **Phase 3** (8s): Extracts claims per source
- **Phase 4** (4s): Calculates consensus scores
- **Phase 5** (3s): Generates final report with citations

Total simulation time: ~30 seconds

## License

MIT
