# AI SkillPath — Person 2 Architecture Audit

## 1. Repository Structure

Inspection of `n:\ByteX` reveals the current workspace structure:

```
n:\ByteX
├── .gitignore
├── README.md
├── eslint.config.js
├── index.html
├── package-lock.json
├── package.json
├── public/
├── src/
│   ├── App.css
│   ├── App.jsx
│   ├── assets/
│   ├── index.css
│   └── main.jsx
└── vite.config.js
```

### Observations
- **Frontend vs Backend Split**: The workspace currently contains only a basic frontend setup initialized with React 19 and Vite 8.
- **Backend Directory**: There is currently **no `backend/` directory or dedicated server root** in the repository.
- **Source Directories**: `src/` contains only default Vite React application files.

---

## 2. Current Backend Architecture

- **Framework**: None currently implemented. (Target: Node.js + Express.js + TypeScript).
- **TypeScript**: Missing. The repository currently uses JavaScript (`.jsx`/`.js`). No `tsconfig.json` exists.
- **Module System**: ES Modules (`"type": "module"` in `package.json`).
- **Dependencies**: No backend dependencies (`express`, `mongoose`, `zod`, `dotenv`, `jsonwebtoken`, `bcrypt`, `pino`, `@google/genai`) are installed yet.

---

## 3. Current Database Architecture

- **ODM/Driver**: None. Mongoose is not yet installed or configured.
- **Connection File**: None. No connection file (e.g., `db.ts` or `connectDB.ts`) exists.
- **Indexes & Transactions**: None.
- **Data Access Layer**: None.

---

## 4. Existing Models

The domain models required for AI SkillPath were audited against the current repository state:

| Model | Status | File | Owner | Notes |
| ----- | ------ | ---- | ----- | ----- |
| User | MISSING | N/A | Person 1 | Backend authentication foundation not yet initialized. |
| StudentProfile | MISSING | N/A | Person 1 | Onboarding and student domain model not yet created. |
| Skill | MISSING | N/A | Person 2 | Domain model for skill catalog needs to be created. |
| Career | MISSING | N/A | Person 2 | Domain model for career paths needs to be created. |
| CareerSkill | MISSING | N/A | Person 2 | Junction/mapping model for career skill requirements missing. |
| Assessment | MISSING | N/A | Person 2 | Skill assessment metadata model missing. |
| Question | MISSING | N/A | Person 2 | Assessment question bank model missing. |
| AssessmentAttempt | MISSING | N/A | Person 2 | Student evaluation attempt record model missing. |
| Roadmap | MISSING | N/A | Person 2 | Adaptive roadmap domain model missing. |
| Resource | MISSING | N/A | Person 2 | Skill learning material/course reference model missing. |
| Project | MISSING | N/A | Person 2 | Practical project recommendation model missing. |
| Progress | MISSING | N/A | Person 2 | Roadmap milestone completion tracking model missing. |

---

## 5. Existing API Architecture

- **Routes & Controllers**: None implemented.
- **Route Naming Convention**: Not yet established (Target recommendation: `/api/v1/...`).
- **Response Format**: Not yet standardized.
- **Error Handling**: Standard Express global error handler not yet present.

---

## 6. Existing Validation

- **Validation Library**: Zod is target standard, but not yet added to `package.json`.
- **Request Schemas**: None exist.

---

## 7. Existing Authentication

- **Auth Mechanism**: Target standard is JWT + bcryptjs.
- **Middleware**: No auth middleware (e.g. `authenticateToken`) exists in the repository.

---

## 8. Existing Seed System

- **Seed Scripts**: None.
- **Execution / Idempotency**: No seed scripts currently exist in the repository.

---

## 9. Existing AI Integration

- **SDK / Abstraction**: Gemini SDK is not installed, and no AI service wrapper/abstraction layer exists.
- **Direct Controller Calls**: None.
- **Secret Exposure**: No Gemini secrets or API keys are exposed in client-side code.

---

## 10. Environment Variables

- **`.env` file**: Not present in repository.
- **Expected Environment Variables** (Names only):
  - `PORT`
  - `MONGODB_URI`
  - `JWT_SECRET`
  - `GEMINI_API_KEY`
  - `NODE_ENV`
  - `FRONTEND_URL`

---

## 11. Testing Infrastructure

- **Framework**: No testing framework (Vitest, Jest, Supertest) is installed in `package.json`.
- **Test Scripts**: No `test` script defined.
- **Recommendation**: Introduce Vitest for unit testing Person 2's deterministic intelligence engines (Assessment Scoring, Skill Gap, Priority, Roadmap ordering).

---

## 12. Person 2 Ownership Map

As **Person 2 — Database + Skill Intelligence Developer**, ownership is defined as:

1. **Database Domain Modeling**:
   - `Skill`
   - `Career`
   - `CareerSkill`
   - `Assessment`
   - `Question`
   - `AssessmentAttempt`
   - `Roadmap`
   - `Resource`
   - `Project`
   - `Progress`
2. **Intelligence Engines**:
   - Deterministic Assessment Scoring
   - Skill Score Generation
   - Skill Gap Engine (`gap = targetLevel - currentLevel`)
   - Priority Engine
   - Roadmap Engine (ordering & dependencies)
   - Progress Engine
   - Adaptive Roadmap (reassessment trigger & recalculation)
3. **AI Services & Content**:
   - AI Service abstraction (Gemini API integration)
   - Resource Recommendations
   - Project Recommendations
4. **Data Infrastructure**:
   - Seed scripts & demo datasets (idempotent upserts)
   - Database indexes for intelligence query optimization

---

## 13. Person 1 Integration Points

Person 2 will integrate with Person 1's upcoming modules:

- **Auth Context**: Person 2 endpoints will rely on Person 1's JWT authentication middleware attaching `req.user` / `req.studentProfile`.
- **User & StudentProfile IDs**: Person 2 models (`AssessmentAttempt`, `Roadmap`, `Progress`) will store `studentProfileId` as an ObjectId reference to Person 1's `StudentProfile`.
- **Assessment API**: Person 1's Assessment API will delegate scoring and question fetching to Person 2's Assessment & Scoring domain services.
- **Dashboard API**: Person 1's Dashboard Aggregation API will consume Person 2's engine outputs (Skill Scores, Skill Gap, Priority, and Roadmap status).

---

## 14. Database Gaps

All 10 required domain models for Person 2 (`Skill`, `Career`, `CareerSkill`, `Assessment`, `Question`, `AssessmentAttempt`, `Roadmap`, `Resource`, `Project`, `Progress`) are currently missing.

---

## 15. Intelligence Gaps

The complete core intelligence pipeline is currently missing:
- Assessment Scoring Engine
- Skill Score Generator
- Skill Gap Engine
- Priority Calculation Engine
- Roadmap Generation & Ordering Engine
- Progress Tracker
- Reassessment & Adaptive Roadmap Engine

---

## 16. AI Gaps

- Missing Gemini AI client setup & service abstraction layer.
- Missing AI prompt generators for skill breakdown, career advice, resource recommendation, and project recommendations.

---

## 17. Seed Data Gaps

- Missing skill catalog seed data (technical skills, soft skills, proficiency scales).
- Missing career catalog seed data (target roles like Frontend Developer, AI Engineer, Data Scientist).
- Missing CareerSkill mapping datasets.
- Missing assessment question bank.
- Missing recommended learning resources and practical projects.

---

## 18. Potential Ownership Conflicts

Currently, there are **no active code conflicts** as Person 1 has not yet initialized the backend server structure.

### Coordination Areas to Monitor:
1. **Assessment Endpoints**: Person 1 owns Assessment API / integration layer, while Person 2 owns Assessment domain model, Question model, and Assessment Scoring.
   - *Action*: Establish clean service interfaces so Person 1's controller invokes Person 2's Assessment Service.
2. **Dashboard Aggregation**: Person 1 owns Dashboard API while Person 2 owns Roadmap & Gap calculations.
   - *Action*: Expose structured read services for Person 1 to aggregate dashboard statistics seamlessly.

---

## 19. Proposed Database Relationship Direction

```
User (1) ── (1) StudentProfile
                  │
                  ├── target ──► Career (1) ── (N) CareerSkill (N) ──► Skill (1)
                  │
                  ├── attempts ─► AssessmentAttempt ─► Assessment ── (N) Question ──► Skill
                  │
                  ├── stores ───► Skill Scores (per skill)
                  │
                  ├── generates ─► Skill Gap (targetLevel - currentLevel)
                  │
                  ├── ranks ────► Priority Engine
                  │
                  └── owns ─────► Roadmap ── (N) Roadmap Module ──► Resource & Project
                                     │
                                     └── tracks ──► Progress
```

---

## 20. Decisions Required From Person 1

1. **Backend Project Structure**: Will the backend live in `backend/` or as a top-level Express app in this repository?
2. **TypeScript Adoption**: Confirmation to configure TypeScript for backend services.
3. **Response Envelope**: Standardizing success response envelopes `{ success: true, data: ... }` and error formats `{ success: false, error: { message, code } }`.
4. **Auth Middleware Contract**: Agreeing on `req.user` payload structure (e.g. `{ userId, studentProfileId, role }`).

---

## 21. Recommended Next Tasks

1. **Task 2 (Coordination with Person 1)**: Initialize backend Express + TypeScript project structure (`tsconfig.json`, `package.json` backend scripts, and Mongoose connection setup).
2. **Task 3 (Person 2 Models)**: Define Mongoose Schemas & TypeScript interfaces for `Skill`, `Career`, `CareerSkill`, `Assessment`, `Question`, and `AssessmentAttempt`.
3. **Task 4 (Seed Data Pipeline)**: Create idempotent seed scripts for initial Skill catalog, Career catalog, and Question bank.
4. **Task 5 (Assessment & Skill Gap Engines)**: Implement deterministic scoring engine and skill gap calculator.
