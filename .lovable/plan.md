## Phase 1: Database Optimization (now)
- **Partition leads table by country** — Postgres partitioning lets each country be its own sub-table, dramatically improving query speed at 100M+ rows
- **Add composite indexes** for common search patterns (role+country, domain+country)
- **Add batch insert optimization** — bulk upserts instead of one-at-a-time

## Phase 2: Supercharge Scraping (now)
- **Increase bulk-scrape throughput** — run 10 parallel search combos per invocation instead of 5
- **Systematic cycling** — instead of random role/country/domain, use a deterministic rotation that covers all 38 roles × 30 countries × 50 domains = 57,000 combinations
- **Increase cron frequency** — run every 30 seconds instead of every minute
- **Better search queries** — target directory sites, professional associations, and company staff pages

## Phase 3: Add People Data Labs API (next step)
- PDL has **3B+ person profiles** with verified emails
- Their enrichment API lets you search by role + country + domain
- ~$0.01-0.10 per record, but you get verified data instantly
- This is how you go from thousands to hundreds of millions fast

## Expected Scale
- Phase 1+2: ~5,000-10,000 leads/hour → ~7M/month from scraping alone
- Phase 3: Bulk import 100M+ leads from PDL in days
- Combined: 100M+ within first month, scaling to 1B+ over time