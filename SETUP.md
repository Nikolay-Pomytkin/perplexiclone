# Setup Instructions

## Initial Setup

### 1. Create Environment File

Create a `.env` file in the project root with your API keys:

```bash
# OpenAI API Key - Get yours at https://platform.openai.com/api-keys
OPENAI_API_KEY=sk-your-key-here

# SerpAPI Key - Get yours at https://serpapi.com/
SERPAPI_API_KEY=your-serpapi-key-here
```

⚠️ **Important**: Never commit the `.env` file (it's already in `.gitignore`)

### 2. Get Your API Keys

#### OpenAI API Key
1. Go to https://platform.openai.com/api-keys
2. Sign up or log in
3. Create a new API key
4. Copy the key (starts with `sk-`)
5. Add credits to your account ($5-10 recommended for testing)

#### SerpAPI Key
1. Go to https://serpapi.com/
2. Sign up for a free account (100 searches/month free)
3. Go to your dashboard
4. Copy your API key
5. Paste it in the `.env` file

### 3. Install Dependencies

Dependencies are already installed, but if needed:

```bash
npm install
```

### 4. Run Development Server

```bash
npm run dev
```

Open http://localhost:3000 in your browser.

### 5. Test the Application

1. Type a question in the search box (e.g., "What is quantum computing?")
2. Click "Ask"
3. Wait 10-20 seconds for:
   - Web search results (SerpAPI)
   - Page scraping (5 URLs)
   - AI synthesis (OpenAI GPT-4o-mini)
4. See the answer with inline citations `[1]`, `[2]`, etc.
5. Scroll down to see the Sources list
6. Click on any source to open it in a new tab

---

## Troubleshooting

### "No search provider configured"
- Make sure you created the `.env` file
- Verify `SERPAPI_API_KEY` is set correctly
- Restart the dev server after adding the key

### "Failed to fetch answer" or OpenAI errors
- Check that `OPENAI_API_KEY` is valid
- Ensure your OpenAI account has credits
- Try a different model in `src/routes/api.ask.ts` (line 36)

### Build fails
```bash
npm run build
```
Should complete successfully. If not, check for TypeScript errors.

### Port 3000 is already in use
```bash
npm run dev -- --port 3001
```

---

## Next Steps

Once everything works:

1. **Record a demo video** (20-120 seconds)
   - Show asking a question
   - Highlight the inline citations `[1]`, `[2]`
   - Show the Sources list
   - Click on a source link

2. **Test with different queries**
   - "What happened in the latest Apple event?"
   - "How does photosynthesis work?"
   - "Who won the Nobel Prize in Physics 2024?"

3. **Optional enhancements** (see README.md)
   - Add streaming responses
   - Add more search providers
   - Improve citation tooltips
   - Add caching

---

## API Costs

**Per query (approximate):**
- SerpAPI: 1 search credit (~$0.005 on paid plans, free tier: 100/month)
- OpenAI GPT-4o-mini: ~$0.01-0.05 depending on context length
- Total: ~$0.01-0.06 per query

**Free tier is sufficient for:**
- ~50-100 queries (SerpAPI limit)
- More if you have OpenAI credits

---

## Project Structure Quick Reference

```
src/
├── routes/
│   ├── index.tsx           # Main page (UI)
│   └── api.ask.ts          # API endpoint
├── components/
│   ├── ChatForm.tsx        # Input form
│   ├── Answer.tsx          # Answer display
│   └── Sources.tsx         # Sources list
├── lib/
│   ├── search.ts           # SerpAPI integration
│   ├── scrape.ts           # Web scraping
│   └── prompt.ts           # LLM prompts
└── types.ts                # TypeScript types
```
