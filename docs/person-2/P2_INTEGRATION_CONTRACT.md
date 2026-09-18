# P2_INTEGRATION_CONTRACT — Person 1 / Person 2 Integration Boundaries

## 1. Overview

This document specifies the exact API integration points, data exchange contracts, and ownership handoffs between **Person 1** (Auth, User, StudentProfile, Common API) and **Person 2** (Database, Intelligence, Skill/Career/Roadmap Engines).

---

## 2. Integration Data Flow

```
[Person 1: Onboarding / Auth] ──► Passes studentProfileId & careerId
                                         │
                                         ▼
                               [Person 2: Assessment Engine]
                                         │
                                         ▼
                               [Person 2: Scoring & Gap Engine]
                                         │
                                         ▼
[Person 1: Dashboard API] ◄──── Returns SkillScores, Gaps, Priorities, & Roadmap
```

---

## 3. Person 1 → Person 2 Inputs (Dependencies)

| Input Entity | Source | Passed As | Purpose |
| ------------ | ------ | --------- | ------- |
| `authenticatedUser` | Person 1 JWT Auth Middleware | `req.user.userId` | Identifies authenticated user session |
| `studentProfileId` | Person 1 StudentProfile Model | `req.user.studentProfileId` | Links assessment attempt, scores, and roadmaps to student |
| `targetCareerId` | Person 1 Onboarding API | `studentProfile.targetCareerId` | Determines target skill requirements from `CareerSkill` |
| `assessmentResponses` | Person 1 Assessment UI | HTTP POST payload | Raw question answers submitted by student for evaluation |

---

## 4. Person 2 → Person 1 Outputs (Services Provided)

| Service Output | Consumer | Interface / Service Method | Purpose |
| -------------- | -------- | -------------------------- | ------- |
| `skillScores` | Person 1 Dashboard & Profile API | `AssessmentScoringService.getLatestScores(studentProfileId)` | Provides breakdown of student's current skill levels |
| `skillGaps` | Person 1 Dashboard & Intelligence API | `getStudentSkillGapPriority(studentProfileId)` | Provides active gaps for target career |
| `priorities` | Person 1 Dashboard & Intelligence API | `getStudentSkillGapPriority(studentProfileId)` | Provides top priority skills to focus on |
| `activeRoadmap` | Person 1 Roadmap UI / Controller | `generateRoadmapForStudent(studentProfileId, careerId)` | Generates & persists deterministic roadmap with ordered modules |
| `adaptiveRoadmap` | Person 1 Roadmap UI / Controller | `generateAdaptiveRoadmapForStudent(studentProfileId, force)` | Generates adaptive V2+ roadmap from latest assessment attempt |

---

## 5. API Response JSON Envelope Standard

All Person 2 APIs must adhere to Person 1's standard response envelope:

### Success Response Envelope:
```json
{
  "success": true,
  "data": { ... },
  "message": "Operation completed successfully"
}
```

### Error Response Envelope:
```json
{
  "success": false,
  "message": "Error message description",
  "errors": []
}
```

---

## 6. Implemented & Target Endpoint Boundaries

All Person 2 endpoints are mounted under `/api/v1/intelligence/...` and dual-mounted under `/api/intelligence/...`:

- `GET /api/v1/intelligence/skill-gap-priority` — Deterministic skill gap & priority readout for authenticated student
- `GET /api/v1/intelligence/roadmap/current` — Retrieves or auto-generates student active roadmap V1/V2+
- `POST /api/v1/intelligence/roadmap/generate` — Generates baseline roadmap for student target career
- `GET /api/v1/intelligence/roadmap/progress` — Retrieves roadmap progress stats and module statuses
- `POST /api/v1/intelligence/roadmap/modules/:moduleId/start` — Starts module (LOCKED → IN_PROGRESS)
- `PATCH /api/v1/intelligence/roadmap/modules/:moduleId/progress` — Updates module progress percentage (0-100%)
- `POST /api/v1/intelligence/roadmap/modules/:moduleId/complete` — Completes module (100% COMPLETED)
- `GET /api/v1/intelligence/reassessment/summary` — Comparative score readout between latest and previous attempts
- `POST /api/v1/intelligence/reassessment/:assessmentId/submit` — Submits new reassessment attempt
- `POST /api/v1/intelligence/roadmap/adaptive` — Triggers adaptive roadmap generation V2+ from latest assessment evidence
- `GET /api/v1/intelligence/resources/recommended` — Personalized learning resources ranked by skill gap priority
- `GET /api/v1/intelligence/resources` — Catalog learning resources with filtering
- `GET /api/v1/intelligence/resources/:id` — Single learning resource by ID
- `GET /api/v1/intelligence/projects/recommended` — Personalized practical projects ranked by skill gap priority
- `GET /api/v1/intelligence/projects` — Catalog practical projects with filtering
- `GET /api/v1/intelligence/projects/:id` — Single practical project by ID
- `GET /api/v1/intelligence/ai/summary` — AI-generated personalized guidance summary based on real MongoDB context
- `GET /api/v1/intelligence/ai/explain/:skillSlug` — AI-generated skill breakdown and explanation
- `POST /api/v1/intelligence/ai/mentor` — AI mentor Q&A assistant

---

## 7. Authentication & Security Handoff

Server-side identity is strictly derived from JWT auth middleware (`req.user.userId`). Client-supplied student IDs are never trusted for direct database queries. Data isolation ensures Student B cannot read or modify Student A's assessment attempts, skill scores, gap priorities, roadmaps, or progress records.

---

## 8. Frontend Integration Handoff

All React frontend pages (`DashboardPage`, `SkillsPage`, `SkillGapPage`, `AssessmentPage`, `AssessmentResultsPage`, `RoadmapPage`, `OnboardingPage`, `CareerReadinessPage`, `ProjectsPage`) are connected to live Express backend endpoints backed by MongoDB Atlas with `AuthContext` running in real API mode (`isMockMode = false`).





