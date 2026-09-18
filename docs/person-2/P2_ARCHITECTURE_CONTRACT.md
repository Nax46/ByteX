# P2_ARCHITECTURE_CONTRACT — Architecture Layers & Boundaries

## 1. Overview

This document defines the architectural layers, module boundaries, and dependency flow for Person 2's components within the AI SkillPath system.

---

## 2. Backend Layer Architecture

Person 2 modules follow a clean 4-tier backend architecture:

```
[HTTP Request]
       │
       ▼
Controller / Router
  (Request validation via Zod schemas, extracts auth context)
       │
       ▼
Application Service
  (Orchestrates domain workflows, manages transactions)
       │
       ▼
Domain / Intelligence Logic
  (Pure deterministic calculations: Scoring, Gap, Priority, Roadmap ordering)
       │
       ▼
Data Access / Mongoose Repository
  (Queries, persistence, index enforcement)
       │
       ▼
[MongoDB Database]
```

### Layer Responsibilities & Rules
1. **Controllers**: Light wrappers. Responsible for parsing HTTP requests, triggering Zod validation, calling application services, and formatting JSON responses. No business logic in controllers.
2. **Application Services**: Coordinates business operations (e.g. `submitAssessment`, `generateRoadmap`). Calls domain intelligence engines and data repositories.
3. **Domain / Intelligence Logic**: Pure, deterministic, side-effect-free functions wherever possible. Accepts domain inputs and returns calculated domain models (e.g., `calculateSkillScores(attempt)`). Must have zero dependency on HTTP or external APIs.
4. **Data Access**: Mongoose models (`Skill`, `Career`, `AssessmentAttempt`, `Roadmap`). Responsible for persistence and indexing.

---

## 3. AI Layer Architecture

The AI layer is strictly isolated behind an abstraction boundary:

```
[Controller / Application Service]
                 │
                 ▼
     AI Service Abstraction Interface
          (e.g., IAIService)
                 │
                 ▼
   Gemini AI Service Implementation
     (Using @google/genai SDK)
                 │
                 ▼
       [Google Gemini API]
```

### AI Boundary Enforcement
- Application controllers and intelligence engines **MUST NOT** import Google Gemini SDK directly.
- All AI calls must pass through `AIService` abstraction interface.
- If Gemini is offline, unavailable, or times out, the `AIService` implementation must provide graceful fallbacks without crashing deterministic application flows.

---

## 4. Database Layer Architecture

Domain-oriented collections owned by Person 2:

```
MongoDB Database
├── skills                  (Skill catalog)
├── careers                 (Career roles)
├── career_skills           (Junction: Career requirement mapping)
├── assessments             (Assessment metadata)
├── questions               (Question bank mapped to skills)
├── assessment_attempts     (Student attempt history & answers)
├── roadmaps                (Generated student roadmaps & modules)
├── progress                (Milestone completion states)
├── resources               (Curated learning items)
└── projects                (Practical project recommendations)
```

### Collection Naming Conventions
- **Good (Domain-Oriented)**: `skills`, `careers`, `assessment_attempts`, `roadmaps`.
- **Bad (UI-Driven Anti-pattern)**: `DashboardCollection`, `SkillsPageCollection`, `RoadmapPageCollection`.

---

## 5. Dependency Flow Rules

1. **Unidirectional Dependency**: Higher layers depend on lower layers (`Controller -> Service -> Domain -> Model`). Lower layers NEVER import higher layers.
2. **Domain Protection**: The deterministic intelligence domain must not import HTTP utilities, Express `Request`/`Response` objects, or database connection instances.
3. **Person 1 Reference Boundary**: Person 2 models store Person 1 `studentProfileId` as an ObjectId reference string/ObjectID, but do not manipulate Person 1's `User` or `StudentProfile` collections directly.
