# Perplexity Clone — TanStack Start + TypeScript

A minimal Perplexity‑style app: ask a question → perform web search → scrape top pages → synthesize an AI answer with inline numeric citations → render sources list. Built with **TanStack Start + TypeScript + OpenAI SDK** and SerpAPI for web search.

---

## Quick Start

### Prerequisites

- Node.js 18+ and npm
- OpenAI API key ([get one here](https://platform.openai.com/api-keys))
- SerpAPI key ([get one here](https://serpapi.com/))

### Setup

1. **Create `.env` file** in the project root:

```bash
# OpenAI API Key
OPENAI_API_KEY=sk-your-key-here

# SerpAPI Key
SERPAPI_API_KEY=your-serpapi-key-here
```

2. **Install dependencies** (already done):

```bash
npm install
```

The project includes:
- `openai` - OpenAI SDK for GPT completions
- `mozilla-readability` - Reader-mode extraction
- `jsdom` - DOM parsing for scraping
- `zod` - Schema validation
- `react-markdown` - Markdown rendering with citations

3. **Run the development server**:

```bash
npm run dev
```

4. **Open** [http://localhost:3000](http://localhost:3000)

---

## Project Structure

```
src/
  routes/
    index.tsx                # Main UI page
    api.ask.ts              # API endpoint: search → scrape → LLM
  components/
    ChatForm.tsx            # Question input form
    Answer.tsx              # Markdown answer display
    Sources.tsx             # Sources list with links
  lib/
    search.ts               # SerpAPI web search adapter
    scrape.ts               # Readability-based content extraction
    prompt.ts               # System & user prompt builders
  types.ts                  # Shared TypeScript types
```

---

## How It Works

1. **User asks a question** via the chat form
2. **Web search** using SerpAPI to find top 5 relevant pages
3. **Scrape content** from each page using Mozilla Readability
4. **Build prompts** with question + numbered source excerpts
5. **LLM synthesis** using GPT-4o-mini to generate answer with inline `[1]`, `[2]` citations
6. **Display** the markdown answer and clickable sources list

---

## Key Features

✅ **Inline citations** - Answer includes `[1]`, `[2]` references  
✅ **Source attribution** - Numbered list of sources with titles and URLs  
✅ **Reader-mode scraping** - Clean text extraction from web pages  
✅ **Error handling** - Graceful fallbacks for failed scrapes  
✅ **Modern UI** - Tailwind CSS with dark theme

---

## API Route

The API endpoint is at `/api/ask` (TanStack Start API route):

**Request:**
```json
POST /api/ask
{
  "query": "What is quantum computing?"
}
```

**Response:**
```json
{
  "answer_md": "Quantum computing is...[1] It uses quantum bits...[2]",
  "sources": [
    {
      "title": "Quantum Computing Explained",
      "url": "https://example.com/quantum",
      "snippet": "A brief description..."
    }
  ]
}
```

---

## Environment Variables

| Variable | Required | Description |
|----------|----------|-------------|
| `OPENAI_API_KEY` | Yes | Your OpenAI API key (starts with `sk-`) |
| `SERPAPI_API_KEY` | Yes | Your SerpAPI key for web search |
| `DATABASE_PATH` | No | Path for SQLite database storage (defaults to `./data`, set to `/data` for Railway volumes) |
| `PORT` | No | Server port (defaults to 3000, Railway sets this automatically) |

---

## Tech Stack

- **TanStack Start** - Full-stack React framework with file-based routing
- **TypeScript** - Type-safe development
- **OpenAI SDK** - GPT-4o-mini for answer synthesis
- **SerpAPI** - Google search results
- **Mozilla Readability** - Article extraction
- **JSDOM** - HTML parsing
- **React Markdown** - Markdown rendering
- **Tailwind CSS v4** - Styling
- **Zod** - Runtime validation

---

## Nice‑to‑Haves (Future Enhancements)

* **Streaming**: Switch to Server-Sent Events for real-time token streaming
* **Multiple search providers**: Add Tavily, Bing, Brave as alternatives
* **Deduping**: Filter duplicate domains, prefer high-quality sources
* **Citation tooltips**: Hover over `[n]` to preview source URL
* **Caching**: Add LRU cache or Redis for repeated queries
* **Safety checks**: Warn if < 2 docs scraped successfully
* **Tests**: Add Vitest tests for API route and prompt logic

---

## Development Commands

```bash
npm run dev          # Start dev server (port 3000)
npm run build        # Production build
npm run serve        # Preview production build
npm run lint         # Run ESLint
npm run format       # Format with Prettier
npm run check        # Format + lint fix
```

---

## Notes

- The scraper has an 8-second timeout per URL
- Only pages with 200+ characters of content are kept
- Citations are 1-based: `[1]`, `[2]`, `[3]`, etc.
- The LLM is prompted to be conservative and cite evidence

---

## Troubleshooting

**"No search provider configured"**  
→ Make sure `SERPAPI_API_KEY` is set in `.env`

**"Failed to fetch answer"**  
→ Check that `OPENAI_API_KEY` is valid and has credits

**No sources returned**  
→ Query may be too broad or search API rate limited

**Scraping fails**  
→ Some sites block bots; we use a Mozilla user agent but results may vary

---

## Railway Deployment

This project is configured for deployment on Railway using Railpack with serverless capabilities.

### Configuration Files

- **`railpack.json`** - Railpack build configuration for Railway
- **`railway.json`** - Railway service configuration
- **`Procfile`** - Process definition for Railway
- **`server.js`** - Node.js server wrapper for TanStack Start

### Deployment Steps

1. **Connect to Railway**:
   - Push your code to GitHub/GitLab
   - Create a new project in Railway
   - Connect your repository

2. **Configure Environment Variables**:
   Add these in Railway dashboard:
   - `OPENAI_API_KEY` - Your OpenAI API key
   - `SERPAPI_API_KEY` - Your SerpAPI key
   - `DATABASE_PATH=/data` - Path for SQLite database (matches volume mount)

3. **Set Resource Limits**:
   - Go to service settings in Railway dashboard
   - Set CPU limit to **0.5 vCPU**
   - Set Memory limit to **1GB**
   - **Note**: You'll need Hobby plan or higher for 1GB memory (Free/Trial plans max at 0.5GB)

4. **Enable Serverless**:
   - In service settings, enable "Serverless" mode
   - This allows the service to scale down to zero when inactive

5. **Attach Volume for SQLite**:
   - Go to service settings → Volumes
   - Create a new volume
   - Mount path: `/data`
   - Volume size depends on your plan:
     - Free/Trial: 0.5GB
     - Hobby: 5GB
     - Pro/Team: 50GB

6. **Deploy**:
   - Railway will automatically detect `railpack.json` and build using Railpack
   - The build process runs: `npm ci` → `npm run build`
   - The service starts with: `npm start` (compute server.js)

### Database Configuration

The SQLite database is automatically configured to use the `DATABASE_PATH` environment variable:
- **Local development**: Uses `./data/perplexity.db` (default)
- **Railway**: Uses `/data/perplexity.db` (mounted volume)

The database directory is created automatically if it doesn't exist.

### Build Process

Railpack handles the build using these steps:
1. **Install**: `npm ci` - Clean install of dependencies
2. **Build**: `npm run build` - Builds the TanStack Start application
3. **Start**: `npm start` - Runs `node server.js` which wraps the TanStack Start server for Node.js

### Troubleshooting Deployment

**Build fails**:
- Check that all dependencies are in `package.json`
- Ensure Node.js version is 18+ (Railway auto-detects)

**Database errors**:
- Verify volume is mounted at `/data`
- Check `DATABASE_PATH` environment variable is set to `/data`
- Ensure volume has write permissions

**Server not responding**:
- Check logs in Railway dashboard
- Verify `PORT` environment variable is set (Railway sets this automatically)
- Ensure server.js is present in project root

---

## License

MIT

---

## Demo Video

Record a 20-120 second demo showing:
1. Asking a question (e.g., "What is quantum computing?")
2. Inline citations `[1]`, `[2]` appearing in the answer
3. The Sources list at the bottom
4. (Optional) Clicking on a source link
