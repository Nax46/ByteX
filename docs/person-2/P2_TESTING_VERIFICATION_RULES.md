# P2_TESTING_VERIFICATION_RULES — Verification & Completion Standards

## 1. Quality Standards

> **CRITICAL RULE:** Writing code or fixing compilation errors DOES NOT equal completing a task. A task can ONLY be reported as complete after empirical verification passes.

---

## 2. Required Verification Suite

Where applicable and configured in the project, the following checks must be run before marking any task as finished:

1. **TypeScript Static Analysis**: `npx tsc --noEmit` (Must return 0 type errors).
2. **ESLint Code Quality**: `npm run lint` (Must return 0 errors).
3. **Production Build**: `npm run build` (Must complete clean bundle compilation).
4. **Automated Unit & Integration Tests**: `npm run test` (All tests must pass).

---

## 3. Mandatory Engine Test Cases

Person 2's deterministic intelligence engines must be validated against the following test scenarios:

### 3.1 Assessment Scoring Engine Tests
- **Correct Scoring**: Verify that 100% correct answers produce maximum points per skill.
- **Incorrect Scoring**: Verify that 0% correct answers produce 0 points.
- **Skill-Specific Breakdown**: Verify that an assessment covering 3 skills outputs 3 distinct skill scores without cross-contamination.

### 3.2 Skill Gap & Priority Engine Tests
- **Gap Calculation**: Test `current = 38, target = 75` → `gap = 37`.
- **Gap Clamping**: Test `current = 80, target = 75` → `gap = 0` (no negative gaps).
- **Prerequisite Ordering**: Verify that prerequisite skills are assigned higher module sequence order than dependent skills.

### 3.3 Reassessment & Adaptation Tests
- **Roadmap Versioning**: Verify that reassessment triggers creation of a new roadmap document (`version: 2`) while setting `version: 1` `isCurrent: false`.
- **Historical Integrity**: Verify that past `AssessmentAttempt` records are unchanged after a new attempt.

### 3.5 Roadmap Progress Engine Tests
- **State Transitions**: Test `LOCKED` $\to$ `IN_PROGRESS` $\to$ `COMPLETED` transitions with timestamp initialization.
- **Prerequisite Enforcement**: Verify starting a module with uncompleted prerequisites throws `RoadmapProgressError` (400).
- **Completion Unlocking**: Verify completing module 1 unlocks module 2 for learning.
- **Overall Progress Formula**: Verify overall progress returns rounded integer percentage ($1/3 \to 33\%$).
- **Zero-Module Safety**: Verify `calculateOverallProgress([])` returns `0` cleanly.
- **Historical Isolation**: Verify V1 roadmap progress does not mutate or affect V2 roadmap progress.
- **Student Ownership**: Verify student identity checks reject cross-student modification attempts (403 Forbidden).

### 3.6 Reassessment Engine Tests
- **Historical Immutability**: Verify new reassessment attempt creates a distinct document without mutating previous attempt documents.
- **Score Trends**: Test score improvement ($55 \to 72 = +17$, `IMPROVED`), decline ($72 \to 65 = -7$, `DECLINED`), unchanged ($70 \to 70 = 0$, `UNCHANGED`), and unassessed (`NEW_EVIDENCE`).
- **Latest Attempt Selection**: Verify `getReassessmentSummary` automatically selects the latest completed attempt by timestamp (`completedAt: -1`).
- **Authorization**: Verify student identity verification rejects unauthorized cross-student attempt queries (404/403).

### 3.7 Adaptive Roadmap Engine Tests (P2-ROAD-005)
- **Historical Preservation**: Initial Roadmap V1 remains unchanged (version, status ARCHIVED, modules) after adaptation.
- **New Versioning**: New roadmap V2 is created with `version: 2`, `isCurrent: true`, `status: ACTIVE`, `generationReason: ADAPTIVE`.
- **Target-Met Skill Removal**: Target-met skills (`gap === 0`) are removed from active modules in V2 while maintaining prerequisite satisfaction for dependent active skills.
- **Improved/Regressed/New Evidence Handling**: Improved skills with remaining gaps stay active; regressed skills re-open active modules; new evidence skills are cleanly incorporated.
- **Prerequisite Ordering Safety**: Kahn's topological sort ensures prerequisite skills precede dependent skills even if dependent skills have higher priority.
- **Progress Isolation**: V1 `RoadmapProgress` is untouched; V2 receives an independent `RoadmapProgress` document.
- **Duplicate Generation Protection**: Repeated adaptation requests for the same assessment attempt ID without `force: true` return the existing active roadmap without creating duplicate versions.
- **Authorization & Pure Isolation**: Pure adaptive functions do not mutate inputs; student ownership enforcement rejects unauthorized access.

### 3.8 Full 23-Step End-to-End Verification (P20)
- **Primary E2E Pipeline**: Verified in `backend/tests/fullE2EFlow.test.ts`.
- **Flow**: Catalog setup $\to$ Student registration $\to$ Career resolution $\to$ Diagnostic assessment $\to$ Question loading $\to$ Answer submission $\to$ Server-side deterministic scoring $\to$ Score persistence $\to$ Skill gap calculation $\to$ Priority score assignment $\to$ Roadmap V1 topological generation $\to$ Progress initialization $\to$ Resource recommendations $\to$ Project recommendations $\to$ Module progress state transition $\to$ Reassessment attempt submission $\to$ Attempt immutability check $\to$ Score trend delta calculation $\to$ Adaptive roadmap V2 generation $\to$ V1 archive / V2 active flag update $\to$ V2 active verification $\to$ V2 progress isolation $\to$ AI personalization context consumption $\to$ Security boundary check.

---

## 4. Empirical Test Suite Status

Current verified status across the entire repository:
- **Test Suite**: 17 / 17 Test Files PASS
- **Test Count**: 147 / 147 Tests PASS
- **Typecheck**: PASS (0 errors)
- **Vite & TSC Build**: PASS
- **ESLint**: PASS (0 errors)



