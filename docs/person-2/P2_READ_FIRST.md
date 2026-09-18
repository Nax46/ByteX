# P2_READ_FIRST — Person 2 Entry Point & Critical Rules

> **IMPORTANT FOR ALL AI AGENTS & DEVELOPERS:**  
> **READ THIS FILE BEFORE MODIFYING ANY PERSON 2 CODE OR SCHEMAS.**

---

## 1. Project Identity & Tagline

* **Project**: AI SkillPath (TECHNEXA 2026 Hackathon)
* **Tagline**: *"Know your skills. Find your gaps. Build your future."*
* **Core Goal**: AI-powered student career guidance and skill-development platform with a deterministic evaluation pipeline and AI-enhanced recommendations.

---

## 2. Person 2 Role & Ownership

Person 2 is the **Database + Skill Intelligence Developer**.

### Person 2 Ownership Map
- **MongoDB Domain Models**: `Skill`, `Career`, `CareerSkill`, `Assessment`, `Question`, `AssessmentAttempt`, `Roadmap`, `Resource`, `Project`, `Progress`
- **Intelligence Engines**:
  - Deterministic Assessment Scoring
  - Skill Score Generation
  - Skill Gap Engine (`gap = targetLevel - currentLevel`)
  - Priority Engine
  - Dependency-Aware Roadmap Engine
  - Progress Tracking Engine
  - Reassessment & Adaptive Roadmap Engine
- **AI Service Abstraction**:
  - Gemini SDK integration wrapper
  - Resource Recommendation logic
  - Project Recommendation logic
  - AI Mentor / Explanation providers
- **Data & Indexes**:
  - Idempotent Seed Data (skills, careers, question banks, resources, projects)
  - Intelligence query performance indexes

---

## 3. Person 1 Ownership & Boundaries

Person 1 owns the backend infrastructure and student onboarding foundation:
- Backend server setup (`app.ts`, `server.ts`, DB connection)
- Authentication (JWT, bcrypt, login/register routes)
- `User` domain model
- `StudentProfile` domain model
- Onboarding API flow
- Common middleware (Auth validation, error handling)
- Assessment API delivery layer (invoking Person 2 scoring services)
- Dashboard Aggregation API (invoking Person 2 readout services)

> **RULE:** Do NOT re-implement or override Person 1's authentication, user management, or dashboard infrastructure.

---

## 4. Shared / Coordination Areas

The following files and contracts require explicit coordination with Person 1:
- `package.json` (adding new backend packages)
- `tsconfig.json` (TypeScript rules)
- `app.ts` & `server.ts` (registering routes)
- `database.ts` (connection setup)
- `.env.example` (environment variable names)
- Shared TypeScript DTOs & Interfaces
- API Response & Error JSON envelope standards
- Auth middleware (`req.user` / `req.studentProfile`) contract

---

## 5. Core Intelligence Pipeline

All Person 2 intelligence modules must strictly align with this single pipeline:

```
Career Goal
  │
  ▼
Required Skills (via CareerSkill)
  │
  ▼
Assessment (via Question Bank)
  │
  ▼
Skill Scores (Deterministic breakdown per skill)
  │
  ▼
Skill Gap (targetLevel - currentLevel)
  │
  ▼
Priority Engine (Ranking gaps by urgency & dependencies)
  │
  ▼
Roadmap Engine (Ordered modules with Resources & Projects)
  │
  ▼
Progress Engine (Milestone completion tracking)
  │
  ▼
Reassessment (Retaking assessment)
  │
  ▼
Adaptive Roadmap (Updated scores → recalculate gap/priority → dynamic roadmap adjustment)
```

---

## 6. Critical Architecture & Business Logic Rules

1. **Deterministic Separation**: All numerical calculations (scores, gap, priority, dependency ordering) **MUST BE DETERMINISTIC**. AI models MUST NOT be used to generate raw scores or compute gaps.
2. **AI Boundary**: AI is strictly for explanations, personalized tips, resource curation, and project ideas based on deterministic engine outputs.
3. **Skill-Level Granularity**: Assessments and scores must NEVER be collapsed into a single scalar number (e.g. "Overall Score: 70%"). Scores MUST retain skill-level breakdown (e.g., `React: 80, Node.js: 40`).
4. **Historical Preservation**: Reassessments and roadmap updates MUST preserve historical attempt data and progress records. Never delete or overwrite previous `AssessmentAttempt` records.
5. **No Secrets in Frontend/Docs**: Gemini API keys and database credentials belong exclusively in backend `.env`.

---

## 7. Documentation Index

Before working on a specific Person 2 component, read its corresponding spec:

| Area | Document |
| ---- | -------- |
| Architecture & Layers | [`P2_ARCHITECTURE_CONTRACT.md`](file:///n:/ByteX/docs/person-2/P2_ARCHITECTURE_CONTRACT.md) |
| Database Schemas & Models | [`P2_DATABASE_BLUEPRINT.md`](file:///n:/ByteX/docs/person-2/P2_DATABASE_BLUEPRINT.md) |
| Intelligence Pipeline Rules | [`P2_INTELLIGENCE_RULEBOOK.md`](file:///n:/ByteX/docs/person-2/P2_INTELLIGENCE_RULEBOOK.md) |
| Skill Catalog Spec | [`P2_SKILL_CATALOG_SPEC.md`](file:///n:/ByteX/docs/person-2/P2_SKILL_CATALOG_SPEC.md) |
| Career & CareerSkill Spec | [`P2_CAREER_INTELLIGENCE_SPEC.md`](file:///n:/ByteX/docs/person-2/P2_CAREER_INTELLIGENCE_SPEC.md) |
| Assessment & Scoring Spec | [`P2_ASSESSMENT_SCORING_SPEC.md`](file:///n:/ByteX/docs/person-2/P2_ASSESSMENT_SCORING_SPEC.md) |
| Gap & Priority Spec | [`P2_GAP_PRIORITY_SPEC.md`](file:///n:/ByteX/docs/person-2/P2_GAP_PRIORITY_SPEC.md) |
| Roadmap & Adaptation Spec | [`P2_ROADMAP_ADAPTATION_SPEC.md`](file:///n:/ByteX/docs/person-2/P2_ROADMAP_ADAPTATION_SPEC.md) |
| AI Service Abstraction | [`P2_AI_SERVICE_CONTRACT.md`](file:///n:/ByteX/docs/person-2/P2_AI_SERVICE_CONTRACT.md) |
| Seed System & Demo Scenarios | [`P2_SEED_DATA_CONTRACT.md`](file:///n:/ByteX/docs/person-2/P2_SEED_DATA_CONTRACT.md) |
| Person 1 Integration Contracts | [`P2_INTEGRATION_CONTRACT.md`](file:///n:/ByteX/docs/person-2/P2_INTEGRATION_CONTRACT.md) |
| DB Indexing Policy | [`P2_DATABASE_INDEX_POLICY.md`](file:///n:/ByteX/docs/person-2/P2_DATABASE_INDEX_POLICY.md) |
| Testing & Verification Rules | [`P2_TESTING_VERIFICATION_RULES.md`](file:///n:/ByteX/docs/person-2/P2_TESTING_VERIFICATION_RULES.md) |
| Git & Merge Safety | [`P2_GIT_MERGE_SAFETY.md`](file:///n:/ByteX/docs/person-2/P2_GIT_MERGE_SAFETY.md) |
| Change History Log | [`P2_CHANGELOG.md`](file:///n:/ByteX/docs/person-2/P2_CHANGELOG.md) |

---

## 8. Git & Merge Safety Summary

- Work in feature branches: `p2/<module>-<task>`
- Keep commits focused on Person 2 owned files.
- Coordinate any edit to shared files (`package.json`, `app.ts`, `database.ts`).
- Never perform mass renames or formatting changes on Person 1 code.

---

## 9. Checklists

### Before Modifying Code:
- [ ] Read `P2_READ_FIRST.md` and the module's target spec document.
- [ ] Verify file ownership (Ensure it is a Person 2 file or coordinated shared file).
- [ ] Confirm the deterministic vs. AI boundary is maintained.

### Before Claiming Task Completion:
- [ ] Run typecheck / build commands.
- [ ] Run unit & integration tests for deterministic logic.
- [ ] Verify database operation idempotency (if seed/schema change).
- [ ] Update `P2_CHANGELOG.md` if business rules or contracts changed.
- [ ] Report empirical PASS/FAIL status accurately.
