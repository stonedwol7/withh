# WITHH — Project Blueprint

## Quick Start (new terminal)

```powershell
# 1. Frontend (port 3000)
cd C:\Users\USER\OneDrive\Desktop\WITHH\withh
Start-Process -WindowStyle Hidden -FilePath "npx" -ArgumentList "next dev -p 3000"

# 2. Backend (port 4000) — in visible window for logs
cd C:\Users\USER\OneDrive\Desktop\WITHH\withh\backend
npx ts-node src/index.ts
# OR hidden:
Start-Process -WindowStyle Hidden -FilePath "npx" -ArgumentList "ts-node src/index.ts"

# 3. Production build (fast for phone testing)
cd C:\Users\USER\OneDrive\Desktop\WITHH\withh
npx next build
npx next start -p 3000
# Access from phone: http://<your-local-ip>:3000

# 4. TypeScript check
npx tsc --noEmit

# 5. Git push to deploy to Vercel
git add -A
git commit -m "message"
git push
```

## Architecture

| Layer | Tech | Port |
|-------|------|------|
| Frontend | Next.js 16.2.7 (App Router) + Tailwind v4 | 3000 |
| Backend | Express 5 + better-sqlite3 | 4000 |
| AI | OpenRouter (`gryphe/mythomax-l2-13b`) via `/api/ai/proxy` | — |
| Deploy | Vercel (auto-deploy from GitHub `master`) | — |

## Data Flow

`Zustand store` → tries local Express backend → falls through to Supabase → falls through to in-memory mock data.

AKA: app always works even with backend down.

## Brand Identity (latest)

- **Hierarchy**: Emotional promise → WITHH wordmark → actions → logo (supporting)
- **Login page**: tagline is hero ("When you can't go alone..."), logo-stacked.png at 48px/30%opacity
- **Headers**: logo-horizontal.png at 70x20 (reduced from 100x28)
- **No "Welcome" greeting** — not appropriate for brand tone
- **Symbol**: Two abstract vertical forms standing together (companionship). Not literal people/hearts.
- **Colors**: CSS custom properties only (no hardcoded hex). Accent: `#5B8DEF`
- **Pattern**: `brand-pattern.png` as subtle background overlay at 3% opacity

## Pages Built

### Public
- `/login` — Three-portal selection (Customer/Partner/Ops). Tagline-first hierarchy.
- `/register` — Role selection + name/phone/email form
- `/` — Root redirect (via `next.config.ts` HTTP 307), fallback landing

### Customer
- `/customer` — Home: tagline, "Request Support" CTA, category grid, trust signals, how-it-works
- `/customer/journey` — Timeline of all requests (active + completed). Visual connector lines.
- `/customer/requests` — Active + completed request lists. Skeleton loading.
- `/customer/requests/[id]` — Detail: partner card, match reasons, payment, cancel/reschedule, messages
- `/customer/request` + `/step2`–`/step7` — Multi-step support request wizard
- `/customer/messages` / `[id]` — Message threads
- `/customer/profile` — Stats, favorites, accessibility toggles, language selector, menu items
- `/customer/completion/[id]` — Rate experience
- `/customer/recap/[id]` — Journey recap
- `/customer/invoice/[id]` — Invoice
- `/customer/referrals` — Referral program
- `/customer/tickets` — Support tickets

### Partner
- `/partner` — Home: availability toggle, today's assignments, earnings stats
- `/partner/assignments` / `[id]` — Assignment list + detail
- `/partner/messages` / `[id]` — Message threads
- `/partner/earnings` — Earnings history
- `/partner/profile` — Profile + KYC
- `/partner/status` — Availability status
- `/partner/calendar` — Schedule

### Operations
- `/ops` — Request queue
- `/ops/matching` / `[id]` — AI-powered matching
- `/ops/active` — Active supports
- `/ops/partners` — Partner management
- `/ops/issues` — Issue tracking
- `/ops/finance` — Financial overview
- `/ops/audit` — Audit log

### Shared Components
- `customer-nav.tsx` — CustomerHeader, CustomerHeaderWithLogout, CustomerBottomNav (5 tabs: Home/Journey/Requests/Messages/Profile)
- `partner-nav.tsx` — PartnerHeader, PartnerBottomNav
- `ops-nav.tsx` — OpsHeader, OpsSidebar
- `skeleton.tsx` — Skeleton, CardSkeleton, TimelineSkeleton, ProfileSkeleton
- `page-transition.tsx` — Fade + slide entrance wrapper
- `empty-state.tsx` — Icon + title + description + optional action
- `status-badge.tsx` — Color-coded status pills
- `status-timeline.tsx` — Request status progression visual
- `not-found-state.tsx` — 404 fallback
- `initial-avatar.tsx` — Name initials avatar
- `notification-center.tsx` — Bell icon + dropdown
- `sos-button.tsx` — Emergency SOS
- `safety-checkin.tsx` — Periodic check-in during active supports
- `onboarding-tour.tsx` — First-time user tour
- `consent-flow.tsx` — Consent management
- `price-estimator.tsx` — Price calculation
- `share-journey.tsx` — Share journey link
- `voice-recorder.tsx` — Voice message recorder
- `pwa-register.tsx` — PWA install prompt
- `ai-init.tsx` — AI engine configuration on mount
- `auth-guard.tsx` — Role-based route protection
- `loading-overlay.tsx` — Spinner + message

### Shared Context/Stores
- `accessibility-context.tsx` — Large text, high contrast, reduced motion
- `i18n-context.tsx` — 7 languages (English, Hindi, Kannada, Tamil, Telugu, Urdu, Malayalam)
- `notification-store.ts` — Toast/in-app notifications
- `reminders.ts` — Scheduled check-in reminders
- `use-store.ts` (Zustand) — Main app store with all data + actions
- `auth-store.ts` — Auth state: login/logout, role, userName

## Key Design Decisions

- **Tailwind v4** with `@import "tailwindcss"` (not v3 `@tailwind` directives)
- **CSS custom properties** in `:root` for all colors (no hardcoded `bg-[#...]`)
- **`withh-gradient`** utility class for the dark gradient button
- **`card-hover`** class: lifts card 2px + adds subtle shadow
- **`btn-press`** class: scales to 0.97 on active
- **Mobile-first**: max-w-lg mx-auto container, bottom nav with safe-area padding
- **500 Internal errors fixed** by moving root redirect to `next.config.ts`
- **`uniqueById()`** dedup guard in store to prevent duplicate keys

## Navigation Structure

### Customer Bottom Nav
1. Home (`/customer`) — Home icon
2. Journey (`/customer/journey`) — Route icon (replaces Calendar)
3. Requests (`/customer/requests`) — ClipboardList icon
4. Messages (`/customer/messages`) — MessageSquare icon
5. Profile (`/customer/profile`) — User icon

### Partner Bottom Nav
1. Home (`/partner`) — Home icon
2. Assignments (`/partner/assignments`) — Calendar icon
3. Messages (`/partner/messages`) — MessageSquare icon
4. Earnings (`/partner/earnings`) — Wallet icon
5. Profile (`/partner/profile`) — User icon

### Ops Sidebar
1. Requests — ClipboardList
2. Matching — Handshake
3. Active Supports — Activity
4. Partners — Users
5. Issues — AlertTriangle
6. Finance — DollarSign

## Backend API

Express 5 + better-sqlite3. Routes:
- `POST /api/auth/login` / `logout` / `register`
- `GET/POST /api/requests` / `[id]` / `[id]/assign`
- `GET/POST /api/partners` / `[id]`
- `GET/POST /api/messages`
- `GET/POST /api/matching/[id]`
- `GET/POST /api/payments/[id]`
- `GET/POST /api/issues` / `[id]`
- `GET /api/ops` / `partners`
- `GET /api/health`

Seed data in `backend/src/seed.ts` (8 requests, 7 partners, messages, payments, earnings, sessions).

## CSS Animations (globals.css)

| Class | Effect |
|-------|--------|
| `animate-fade-in` | Opacity 0→1 + translateY 8px→0 (0.5s) |
| `animate-fade-in-up` | Opacity 0→1 + translateY 16px→0 (0.6s) |
| `animate-scale-in` | Opacity 0→1 + scale 0.95→1 (0.3s) |
| `animate-status-pulse` | Opacity pulse for active status |
| `stagger-1` through `stagger-5` | Animation delays 100-500ms |
| `reduced-motion` media query | Disables all animations |

## AI Engine

- Provider: OpenRouter
- Model: `gryphe/mythomax-l2-13b`
- `POST /api/ai/proxy` — Calls OpenRouter
- `analyzeRequest()` → returns tags, classification, riskFlags, reasoning
- `generateMatchRecommendation()` → scores partners 0-100, returns best match
- All AI features work with live API key in `.env.local`

## Files Changed (last session)

| File | Change |
|------|--------|
| `login/page.tsx` | Promise-first hierarchy, logo 120→48px (30% opacity), dividers |
| `customer/page.tsx` | Removed "Welcome", promise first, plain WITHH heading |
| `customer-nav.tsx` | Logo 100→70px, Calendar→Journey, active indicator animation |
| `partner-nav.tsx` | Logo 100→70px, active indicator animation |
| `ops-nav.tsx` | Logo in sidebar, active state accent color |
| `register/page.tsx` | Header logo 70px |
| `page.tsx` (root) | Updated with promise + wordmark |
| `customer/journey/` | NEW — timeline with visual connectors |
| `customer/calendar/` | DELETED |
| `skeleton.tsx` | NEW — loading components |
| `page-transition.tsx` | NEW — fade+slide wrapper |
| `brand/` | DELETED — custom SVG removed, original logos restored |

## Remaining / Not Started
- Partner messages list polish
- Form validation / inline errors on request step pages
- Ops pages polish (active, issues, finance)
- Backend not required for mock data fallback — app works fully without it

## Vercel

- Repo: `github.com/stonedwol7/withh.git`
- Deploy: auto from `master` branch
- Cold starts on free tier (5-10s first load)
- For fast phone testing: use local production build (`next build && next start`)
