# P2_CHANGELOG — Person 2 Architectural & Business Change Log

## 1. Overview

This document records key architectural decisions, domain schema updates, business rule changes, and integration contract revisions for Person 2.

---

## 2. Change Log Entry Template

```markdown
### [YYYY-MM-DD] - Task ID / Feature Name
- **Module**: (e.g. Assessment Scoring Engine / Skill Model)
- **Change**: Concise summary of what was added or updated.
- **Reason**: Rationale for the architectural or rule modification.
- **Files Modified**: List of affected file paths.
- **Integration Impact**: Impact on Person 1 or external API contracts.
- **Person 1 Coordination Status**: (e.g., AGREED / PENDING / N/A)
```

---

## 3. History

### [2026-09-18] - Task 1: Repository Architecture Audit
- **Module**: Documentation & Repository Audit
- **Change**: Executed comprehensive repository audit and generated initial audit report.
- **Reason**: Establish baseline understanding of project structure before Person 2 implementation.
- **Files Modified**: `docs/person-2/PERSON_2_ARCHITECTURE_AUDIT.md`
- **Integration Impact**: None (Audit task only).
- **Person 1 Coordination Status**: N/A

### [2026-09-18] - Task P2-DB-001: Intelligence Domain Foundation
- **Module**: Database & Domain Foundation (`Skill`, `Career`, `CareerSkill`)
- **Change**: Created Mongoose models, TypeScript interfaces, Zod validation schemas, idempotent foundation seed script, and Vitest domain tests for `Skill`, `Career`, and `CareerSkill`.
- **Reason**: Establish the core domain foundation required by Person 2's intelligence engine pipeline.
- **Files Modified**: `backend/src/types/intelligence.ts`, `backend/src/models/Skill.ts`, `backend/src/models/Career.ts`, `backend/src/models/CareerSkill.ts`, `backend/src/schemas/intelligenceValidation.ts`, `backend/src/seed/foundationSeed.ts`, `backend/tests/intelligenceFoundation.test.ts`
- **Integration Impact**: Exposed queryable domain models for Person 1 onboarding and career mapping selection.
- **Person 1 Coordination Status**: AGREED

### [2026-09-18] - Task P2-DB-002: Assessment & Question Bank Domain Foundation
- **Module**: Assessment & Question Bank Domain (`Assessment`, `Question`, `AssessmentAttempt`)
- **Change**: Created Mongoose models, TypeScript interfaces, Zod validation schemas, `toStudentFacingQuestionDTO` security helper, diagnostic assessment & question bank seed script, and Vitest domain tests.
- **Reason**: Establish the data models, answer security boundary, and seed question bank required for future deterministic assessment scoring.
- **Files Modified**: `backend/src/types/assessment.ts`, `backend/src/schemas/assessmentValidation.ts`, `backend/src/models/Assessment.ts`, `backend/src/models/Question.ts`, `backend/src/models/AssessmentAttempt.ts`, `backend/src/seed/assessmentSeed.ts`, `backend/tests/assessmentDomain.test.ts`
- **Integration Impact**: Person 1 API integration boundary defined for `AssessmentAttempt` creation and student-facing question delivery.
- **Person 1 Coordination Status**: AGREED

### [2026-09-18] - Task P2-INT-001: Deterministic Assessment Scoring & Skill Score Engine
- **Module**: Deterministic Assessment Scoring & Skill Score Engine
- **Change**: Implemented pure deterministic scoring functions (`gradeSingleAnswer`, `calculateTotals`, `calculatePerSkillScores`, `calculateDeterministicScoring`) in `backend/src/services/deterministicScoring.ts`, batched `AssessmentScoringService.evaluateAndSaveAttempt` application service in `backend/src/services/assessmentScoringService.ts`, and 10 unit/integration tests in `backend/tests/assessmentScoringService.test.ts`.
- **Reason**: Enable server-side, 100% deterministic grading and per-skill score generation without AI dependencies or N+1 query bottlenecks.
- **Files Modified**: `backend/src/types/assessment.ts`, `backend/src/services/deterministicScoring.ts`, `backend/src/services/assessmentScoringService.ts`, `backend/tests/assessmentScoringService.test.ts`, `docs/person-2/P2_ASSESSMENT_SCORING_SPEC.md`
- **Integration Impact**: Person 1 API integration contract finalized for `AssessmentScoringService.evaluateAndSaveAttempt(payload)`.
- **Person 1 Coordination Status**: AGREED

### [2026-09-18] - Task P2-INT-002: Skill Gap & Priority Engine
- **Module**: Skill Gap & Priority Engine (`calculateSkillGap`, `buildSkillGapPrioritySnapshot`, `ProposedPriorityStrategy`)
- **Change**: Created pure deterministic functions for Skill Gap calculation with 0-100 clamping, explicit missing-evidence handling (`NO_EVIDENCE`), strategy pattern architecture (`IPriorityStrategy`) for Priority Engine, deterministic explainability strings, and 14 Vitest unit/integration tests.
- **Reason**: Establish deterministic skill gap analysis and pluggable priority ranking foundation without hardcoding an unapproved priority formula as production truth.
- **Files Modified**: `backend/src/types/intelligence.ts`, `backend/src/services/skillGapPriorityEngine.ts`, `backend/tests/skillGapPriorityEngine.test.ts`, `docs/person-2/P2_GAP_PRIORITY_SPEC.md`
- **Integration Impact**: Exposed queryable pure services for Person 1 Dashboard and future Roadmap Engine.
- **Person 1 Coordination Status**: AGREED







