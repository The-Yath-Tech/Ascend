# ASCEND — by Agora Systems

**Global Youth Development Intelligence Platform**
Flagship product module: **Football Quest** — "Turn football training into an
adventure. Every child becomes the hero of their own story."

This repo is Phase 1 (Foundation) of the ASCEND roadmap: a production-shaped
monorepo implementing the core modules from Volume I — auth/roles, club/team
management, player registration, the Football Quest gamification layer
(XP/badges/quests), attendance, and the **Development Intelligence Score
(DIS™)** engine described in Chapter 9.

## Monorepo layout

```
ascend/
├── backend/     Express + TypeScript + Prisma (PostgreSQL) API
└── frontend/    Next.js 14 (App Router) coach/parent web app
```

## Stack

- **Backend:** Node.js, Express, TypeScript, Prisma ORM, PostgreSQL, JWT auth, Zod validation
- **Frontend:** Next.js 14, TypeScript, Tailwind CSS
- **AI layer:** pluggable `AIFeedbackService` (voice-note → structured feedback/XP) and a
  `VisionIngestService` stub for the future "AI observes training" computer-vision mode
- **DIS™ engine:** `DISService` — a transparent, weighted, explainable composite score (see below)

## Quick start

### 1. Backend

```bash
cd backend
cp .env.example .env      # set DATABASE_URL and JWT_SECRET
npm install
npx prisma migrate dev --name init
npm run seed               # demo club/team/players/badges + an initial DIS snapshot
npm run dev                # http://localhost:4000
```

### 2. Frontend

```bash
cd frontend
cp .env.example .env.local   # set NEXT_PUBLIC_API_URL
npm install
npm run dev                  # http://localhost:3000
```

## Core domain model

```
Club ── has ──> Coach, Team, Season
Team ── has ──> Player, Session, Match
Session ── has ──> Quest, Attendance
Player ── earns ──> Badge, XPLog, QuestCompletion
Player ── belongs to ──> Parent
Player ── has ──> PlayerDNA (raw coach-observed traits)
Player ── has ──> DISSnapshot[] (computed, historized Development Intelligence Score)
```

See `backend/prisma/schema.prisma` for the full data model.

## The Development Intelligence Score (DIS™)

Per Volume I Ch. 9's strategic recommendation, DIS™ is the platform's
signature metric — not a black-box rating, but a weighted composite of six
explainable pillars:

| Pillar | Default weight | Derived from |
|---|---|---|
| Technical | 20% | `PlayerDNA.technical` |
| Tactical | 15% | `PlayerDNA.decisionMaking` |
| Physical | 15% | `PlayerDNA.physical` |
| Character | 20% | average of leadership / confidence / creativity / resilience / teamwork / discipline |
| Participation | 15% | attendance rate |
| Learning Progression | 15% | XP momentum (last 30 vs prior 30 days) + quest completion rate |

Every score returned by the API includes the pillar breakdown **and** the
exact weights used (`weightsUsed`), so a coach, parent, club, or federation
dashboard can always explain *why* a score moved — this is the
"Explainability Coverage" principle from the AI Performance Metrics chapter.

Scores are stored as historized snapshots (`DISSnapshot`), not overwritten in
place, so "DIS™ Growth" (a named Player Development KPI in Ch. 9) has real
trend data to chart.

**API:**

| Route | Purpose |
|---|---|
| `GET /api/dis/:playerId` | Latest snapshot (computes+saves one if none exists) |
| `POST /api/dis/:playerId/recompute` | Coach-triggered recomputation |
| `GET /api/dis/:playerId/history` | Full snapshot history, for trend charts |
| `GET /api/dis/:playerId/growth?days=90` | Signature "DIS™ Growth" KPI |
| `GET /api/dis/weights` | Current pillar weights, for explainability |

The frontend Player Passport page (`/dashboard/players/[id]`) renders the
latest DIS breakdown alongside the detailed Player DNA traits and XP/badge
history.

## Full API surface (v1)

| Area | Base route |
|---|---|
| Auth | `/api/auth` |
| Clubs | `/api/clubs` |
| Teams | `/api/teams` |
| Players | `/api/players` |
| Sessions (training) | `/api/sessions` |
| Quests | `/api/quests` |
| XP | `/api/xp` |
| Badges | `/api/badges` |
| Attendance | `/api/attendance` |
| Matches | `/api/matches` |
| Reports (monthly report, passport, team overview) | `/api/reports` |
| Notifications | `/api/notifications` |
| DIS™ (Development Intelligence Score) | `/api/dis` |
| Assessments (structured, rubric-based) | `/api/assessments` |
| Development Goals | `/api/goals` |
| Coach Observations | `/api/observations` |
| AI (voice-note → session log) | `/api/ai/session-note` |
| Vision (future computer-vision ingestion, stub) | `/api/vision/analyze` |

## Phase 2 — Development Intelligence

Beyond the DIS™ engine itself, three capabilities from Ch. 8's Phase 2 list are now implemented:

- **Structured Assessments** (`Assessment` model) — a rubric-based evaluation a coach submits
  per player, per period (preseason/midseason/postseason/adhoc). This is the *recommended* way
  to move a player's development profile: submitting one updates `PlayerDNA` and immediately
  recomputes a fresh DIS™ snapshot, so the score history reflects real coaching judgment rather
  than ad hoc edits.
- **Development Goals** (`DevelopmentGoal` model) — individual, trackable goals with a status
  lifecycle (`NOT_STARTED → IN_PROGRESS → ACHIEVED/MISSED`). `GET /api/goals/player/:playerId/rate`
  returns the "Development Goal Achievement" KPI named in the Success Metrics chapter.
- **Coach Observations** (`CoachObservation` model) — freeform, tagged notes tied to a player but
  independent of any single session (e.g. a mid-week note, a parent conversation). Kept separate
  from `Attendance.standoutNote`, which is session-scoped.

All three surface on the Player Passport page (`/dashboard/players/[id]`) alongside DIS™ and Player DNA.

## Roles

`ADMIN`, `COACH`, `PARENT`, `PLAYER` — enforced via `middleware/auth.ts`
(`requireAuth`, `requireRole(...)`).

## The "Assistant Coach" flow

1. Coach ends training, hits **End Session**.
2. Coach types or pastes a short free-text note (or a transcribed voice note).
3. `POST /api/ai/session-note` sends that note + roster to `AIFeedbackService`.
4. The service returns structured feedback per player, suggested XP, and a
   parent-report draft. Backend applies XP and queues parent notifications.

Today `AIFeedbackService` is a deterministic keyword-matching stub so the
whole pipeline runs with zero external dependencies — swap it for a real LLM
call later behind the same interface (this is Phase 3 — AI Coach on the
roadmap).

## Roadmap alignment

This scaffold implements **Phase 1 (Foundation)** in full, plus a meaningful
slice of **Phase 2 (Development Intelligence)**: the DIS™ engine, structured
assessments, development goals, and coach observations. Still open from
Phase 2: seasonal performance reviews, development benchmarking (peer/age-group
comparison), and progress trend analysis beyond the basic DIS™ growth number.

## Next steps

- Add refresh-token rotation and rate limiting on `/api/auth`.
- Add file/video upload (S3-compatible) for home-challenge submissions and
  the Vision ingestion module.
- Wire `AIFeedbackService` to a real LLM call; add DIS-aware prompts (e.g.
  "explain this player's DIS change in one sentence for a parent").
- Add a **Seasonal Performance Review** model that rolls up a season's
  assessments, goals, and DIS growth into one coach-signed document.
- Add **development benchmarking** — compare a player's DIS pillars against
  their age group/team average, not just their own history.
- Add integration tests (Jest + supertest) and CI.
