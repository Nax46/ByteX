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

### 3.4 Seed Idempotency Tests
- **Duplicate Run**: Run seed script twice in succession. Verify that database count of skills and careers remains identical (0 duplicates).

---

## 4. Verification Reporting Standard

Never report `PASS` unless verified empirically through command output. If a test runner or TypeScript compiler is not yet installed in the workspace, report:
- `TypeScript → NOT AVAILABLE`
- `Tests → NOT AVAILABLE`
