## B2B Lead Finder Platform — Implementation Plan

### Overview

A professional B2B lead discovery platform (like Apollo.io) where users can search for contacts by company, industry, or domain, get verified emails and phone numbers, and manage lead lists. European domains are prioritized. Later, you'll charge for lead access.

### Pages & Features

#### 1. Landing Page

- Hero section with search bar (company name or domain)
- Key value props: "Find verified B2B emails & phones", "European market focus"
- Pricing preview, testimonials, CTA to sign up
- Supported domain/country badges showing European coverage

#### 2. Authentication (Sign Up / Login)

- Email + password registration with Supabase Auth
- Email verification flow
- Profile setup (company name, role, industry)

#### 3. Search & Discovery Dashboard

- **Search bar**: search by company name, domain, job title, location, industry
- **Filters**: country (Europe first), company size, industry, seniority level
- **Results list**: contact cards showing name, title, company, verified email/phone, confidence score
- **Bulk actions**: select multiple leads, export to CSV, save to list

#### 4. Lead Detail View

- Full contact profile: name, title, company, LinkedIn, email, phone
- Verification status badge (verified / likely / unverified)
- Company info panel (size, industry, website, location)
- "Save to list" and "Export" actions

#### 5. My Lists (Saved Leads)

- Create/manage custom lists (e.g. "German Tech Companies")
- Add/remove leads from lists
- List-level export (CSV)
- Lead count and last updated info

#### 6. Credits & Usage

- Credit balance display
- Usage history (searches, lookups)
- Credit purchase/subscription page (Stripe integration later)

#### 7. User Settings

- Profile management
- Notification preferences
- API key management (for future API access)

### Backend (Supabase)

- **Auth**: user registration, login, email verification
- **Database tables**: profiles, leads, companies, saved_lists, list_items, credits, search_history
- **Edge Functions**: proxy calls to external enrichment APIs (e.g. Hunter.io, Apollo API, or similar) for email/phone lookup and verification
- **RLS policies**: users can only access their own lists and credits

### European Domain Priority

- Search results will prioritize European domains from your list (abv.bg, gmx.de, web.de, orange.fr, libero.it, wp.pl, mail.ru, etc.)
- Country filter defaults to European countries
- Domain database stored for pattern-based enrichment

### Design

- Clean, professional SaaS look (dark navy + white + accent blue)
- Data-dense but organized table/card views
- Responsive for desktop-first usage