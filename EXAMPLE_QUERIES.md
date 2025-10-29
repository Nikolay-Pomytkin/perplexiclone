# Example Queries to Test

Here are some suggested queries to test your Perplexity clone with different types of questions:

## Current Events

- "What are the latest developments in AI technology?"
- "What happened at the most recent Apple product launch?"
- "Who won the Nobel Prize in Physics 2024?"
- "What are the top tech news stories this week?"

## Science & Technology

- "How does quantum computing work?"
- "What is CRISPR gene editing?"
- "Explain how solar panels generate electricity"
- "What is machine learning?"

## General Knowledge

- "How does photosynthesis work?"
- "What causes the Northern Lights?"
- "Who invented the telephone?"
- "What is the tallest mountain in the world?"

## Complex Questions

- "What are the main differences between React and Vue.js?"
- "How do electric cars compare to gas cars in terms of efficiency?"
- "What are the pros and cons of remote work?"
- "Compare TypeScript and JavaScript"

## Technical Questions

- "What is a REST API?"
- "How do databases use indexing?"
- "What is Docker and why use it?"
- "Explain OAuth authentication"

## Tips for Good Results

✅ **DO:**
- Ask clear, specific questions
- Use complete sentences
- Ask about factual topics
- Be patient (10-20 seconds per query)

❌ **DON'T:**
- Ask opinion-based questions
- Use very niche topics (fewer sources)
- Expect real-time data (search results have a delay)
- Ask overly broad questions ("Tell me about history")

## Expected Behavior

For each query, you should see:

1. **Loading state** - "Searching, scraping, and synthesizing..."
2. **Answer section** - Markdown-formatted answer with inline citations like [1], [2]
3. **Sources section** - Numbered list of sources with:
   - Clickable titles
   - URLs
   - Brief snippets

## Testing Checklist

- [ ] Question input accepts text
- [ ] Submit button works
- [ ] Loading state displays
- [ ] Answer appears with citations
- [ ] Sources list shows below answer
- [ ] Source links are clickable
- [ ] Citations match source numbers
- [ ] Multiple queries work in sequence
- [ ] Error handling works (try with invalid API keys)

## Demo Video Checklist

When recording your demo (20-120 seconds):

- [ ] Show the clean UI initially
- [ ] Type a question (use one from above)
- [ ] Click "Ask" button
- [ ] Show loading state briefly
- [ ] Highlight the answer with inline [1], [2] citations
- [ ] Scroll to show the Sources list
- [ ] Click on a source link to show it opens
- [ ] (Optional) Ask a second question to show it works multiple times

## Recommended Demo Query

**Best query for demo**: "What is quantum computing?"

**Why**: 
- Plenty of authoritative sources available
- Well-covered topic with good content
- Clear, factual answer
- Good for showing citations in context
- Interesting topic that demonstrates the app's value

**Alternative**: "How does photosynthesis work?"
- Also well-covered, factual, and interesting
- Good variety of scientific sources

