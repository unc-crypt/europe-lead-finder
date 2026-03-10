

## The Problem

You're right — relying solely on Apollo.io's paid API ($49+/mo) to find leads is unnecessary when search engines already index millions of professionals publicly. Let's build a **search engine scraping tool** using Firecrawl (which you already have connected in your workspace) to discover real leads from Google and other sources.

## How It Works

The tool will search Google for professionals matching your query (e.g., "lawyers libero.it", "CTO gmx.de") and extract structured contact information from the results — names, emails, titles, companies, LinkedIn profiles — then store them in your database.

## Plan

### 1. Connect Firecrawl to this project
You already have a Firecrawl connection in your workspace. We'll link it to this project so edge functions can use it.

### 2. Create a `scrape-leads` edge function
A new backend function that:
- Takes a search query like "lawyers @ libero.it" or "CTO Germany gmx.de"
- Constructs targeted Google search queries (e.g., `"lawyers" "@libero.it" email site:linkedin.com`)
- Uses Firecrawl's **search** API to find results across the web
- Uses Firecrawl's **scrape** API on promising result pages to extract contact details
- Uses AI (Lovable AI / Gemini) to parse unstructured page content into structured lead data (name, email, title, company, country)
- Stores results in the existing `leads` table

### 3. Update the search hook to use the new scrape function
- Modify `useLeadSearch.ts` to call `scrape-leads` instead of (or alongside) `search-leads`
- Keep the same Lead interface — no frontend changes needed beyond the hook

### 4. Keep Apollo as an optional secondary source
- The existing Apollo integration stays. If you upgrade later, it works immediately.
- The scrape tool becomes the **primary free source**.

## Technical Details

**Search strategy per query pattern:**
- `lawyers @ libero.it` → Google: `"lawyers" "@libero.it" email`
- `CTO @ gmx.de` → Google: `"CTO" "@gmx.de" email linkedin`
- `engineers Bulgaria` → Google: `"engineer" email site:bg OR "@abv.bg"`

**AI extraction** uses Gemini Flash to parse scraped page content into structured leads, extracting names, emails, titles, and companies from directory pages, LinkedIn results, and company websites.

**Rate limiting**: Firecrawl handles anti-bot measures. We'll batch requests and cache results in the existing `leads` table to avoid re-scraping.

