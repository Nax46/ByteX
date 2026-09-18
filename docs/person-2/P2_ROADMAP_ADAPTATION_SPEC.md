# P2_ROADMAP_ADAPTATION_SPEC — Roadmap Engine & Adaptive Updates

## 1. Overview

This document specifies the **Roadmap Ordering Engine**, progress tracking integration, reassessment triggers, and **Adaptive Roadmap** behavior.

---

## 2. Roadmap Generation Pipeline

```
Skill Gaps
    │
    ▼
Priority Engine Ranking
    │
    ▼
Topological Prerequisite Sort
    │
    ▼
Sequential Module Assembly
    │
    ▼
Resource & Project Attachment (via AI & Catalog)
    │
    ▼
Roadmap Document Generation (isCurrent = true)
```

---

## 3. Dependency-Aware Module Ordering

### Rule
Roadmap modules MUST NOT be ordered purely by raw priority if a prerequisite skill has not been satisfied.

### Example Sequence
Suppose `Authentication` has a higher priority score than `Node.js Fundamentals`, but `Authentication` lists `Node.js Fundamentals` as a prerequisite:

**Correct Ordered Sequence:**
1. Module 1: `Node.js Fundamentals` (Prerequisite)
2. Module 2: `Express Framework`
3. Module 3: `REST API Design`
4. Module 4: `Authentication & JWT`
5. Module 5: `MongoDB Integration`
6. Module 6: `Full Stack Capstone Project`

---

## 4. Progress Tracking Integration

- The `Progress` collection tracks student interactions with roadmap items.
- As a student marks learning resources or practical projects as completed, the `Progress` document updates module status:
  - `LOCKED`: Dependencies not met.
  - `IN_PROGRESS`: Active learning module.
  - `COMPLETED`: All required items done.

---

## 5. Reassessment & Adaptive Roadmap Rules

### Trigger Events
1. Student completes all milestones in an active module.
2. Student explicitly requests a skill reassessment test.

### Adaptation Algorithm
1. Student submits a new reassessment (`AssessmentAttempt`).
2. Deterministic scoring updates the student's `SkillScores`.
3. Recalculate `SkillGap` and `PriorityScore` across all target skills.
4. If gaps have changed (e.g. Node.js gap reduced from 37 to 5):
   - Set current active roadmap `isCurrent = false`.
   - Create a new `Roadmap` document with `version = previousVersion + 1` and `isCurrent = true`.
   - Re-order remaining modules based on updated gaps.
   - Retain records of completed modules in historical data.

### Historical Preservation Rule
> **NEVER DELETE OLD ROADMAPS:** Previous versions of roadmaps and attempts MUST be preserved to analyze student velocity and skill growth over time.

---

## 6. Implementation Summary (P2-ROAD-002)

### Pure Generation Engine (`generateDeterministicRoadmapModules`)
- **Inputs**: `ISkillGapPrioritySnapshot[]` intelligence snapshots, `Map<string, ICareerSkill>` requirements map with prerequisite references.
- **Filtering**:
  - `TARGET_MET` skills (`gap === 0`) are excluded from roadmap module generation.
  - Active gap skills (`LOW_GAP`, `MODERATE_GAP`, `CRITICAL_GAP`, `NO_EVIDENCE`) are eligible.
  - `TARGET_MET` skill IDs are placed into `targetMetSet` to pre-satisfy prerequisite requirements for active downstream skills.
- **Topological Sorting Algorithm**:
  - Variant of Kahn's Algorithm maintaining in-degrees for prerequisite relationships.
  - Available nodes (in-degree == 0) are selected using a deterministic priority tie-breaker:
    1. `priorityScore` descending (higher priority learned first among unlocked nodes)
    2. `importance` weight ranking (`CRITICAL` > `HIGH` > `MEDIUM` > `LOW`)
    3. `skillId` ascending (stable string slug comparison)
- **Cycle Detection**:
  - If cyclic dependencies exist (e.g. `A -> B -> A`), Kahn's algorithm produces an ordered list shorter than eligible skills count.
  - The service throws `RoadmapGenerationError` with error code `PREREQUISITE_CYCLE_DETECTED` and persists zero invalid/partial documents.
- **Module Titles & Descriptions**:
  - Titles formatted deterministically as `<Skill Name> Fundamentals`.
  - Descriptions consume canonical `Skill.description`.
- **Status Assignment**:
  - Module 1 (order = 1): `IN_PROGRESS`
  - Subsequent modules (order > 1): `LOCKED`

### Application Persistence Service (`generateRoadmapForStudent`)
- Orchestrates batched DB reads (StudentProfile, CareerSkill, latest AssessmentAttempt snapshot via Readout Service, Skill map).
- Executes 0 DB queries inside the generation loop (100% pure core algorithm).
- Increments version $V+1$, sets previous active roadmap `isCurrent: false` & `status: 'ARCHIVED'`, and persists new Roadmap with `isCurrent: true` & `status: 'ACTIVE'`.

---

## 7. Progress Tracking Engine (P2-ROAD-003)

### Overview
The progress tracking engine (`backend/src/services/roadmapProgressService.ts`) enables students to track module status (`LOCKED`, `IN_PROGRESS`, `COMPLETED`), record granular progress percentages (0–100%), and derive overall roadmap completion percentages deterministically.

### Data Model & Isolation
- **Collection**: `roadmap_progress` (`RoadmapProgressModel`)
- **Key Fields**: `roadmapId` (unique index), `studentProfileId`, `userId`, `modules` (embedded `IModuleProgressItem[]`), `overallProgress`, `totalModules`, `completedModules`, `inProgressModules`, `lockedModules`.
- **Historical Isolation**: Progress is strictly bound to `roadmapId`. Version 1 progress is preserved separately from Version 2 progress.

### State Lifecycle & Unlocking Rules
- **Lifecycle**: `LOCKED` $\to$ `IN_PROGRESS` $\to$ `COMPLETED`
- **Module Unlocking**: Module 1 (`order = 1`) is unlocked initially. Subsequent modules remain `LOCKED` until all prerequisite skills (or prior ordered module) have achieved `COMPLETED` progress status.
- **Timestamps**:
  - `startedAt`: Set when module transitions to `IN_PROGRESS` or `COMPLETED`; preserved across subsequent updates.
  - `completedAt`: Set when progress reaches 100% or status becomes `COMPLETED`.
  - `lastActivityAt`: Updated on every start, progress update, or completion event.

### Overall Progress Formula
$$\text{overallProgress} = \text{round}\left( \frac{\text{completedModules}}{\text{totalModules}} \times 100 \right)$$
- Guaranteed integer between 0 and 100.
- Safely returns `0` if `totalModules === 0` (no `NaN` or `Infinity`).

---

## 8. Reassessment Engine Foundation (P2-ROAD-004)

### Overview
The Reassessment Engine (`backend/src/services/reassessmentService.ts`) enables students to submit new assessment attempts to re-evaluate their skill levels. It computes deterministic per-skill score comparisons and trends against prior completed attempts.

### Historical Immutability
- Reassessments **NEVER** update or overwrite existing `AssessmentAttempt` documents.
- Every reassessment submission persists a **NEW** `AssessmentAttempt` document with a unique `ObjectId` and current `completedAt` timestamp.
- Prior attempt history is strictly preserved for skill growth velocity tracking.

### Latest Evidence & Downstream Intelligence Integration
- Downstream intelligence services (`skillGapPriorityReadoutService`, `roadmapGenerationService`) fetch the latest completed attempt by sorting `.sort({ completedAt: -1, createdAt: -1 })`.
- Submitting a new reassessment attempt naturally updates current skill evidence without modifying existing intelligence engines or past attempts.

### Score Change & Trend Formulas
For each evaluated skill in the reassessment:
$$\text{change} = \text{currentScore} - \text{previousScore}$$

**Trend Classification**:
- `IMPROVED`: $\text{currentScore} > \text{previousScore}$
- `DECLINED`: $\text{currentScore} < \text{previousScore}$
- `UNCHANGED`: $\text{currentScore} = \text{previousScore}$
- `NEW_EVIDENCE`: $\text{previousScore}$ is `null` / unassessed in prior attempt

### Reassessment Readout Contract
- `GET /api/v1/intelligence/reassessment/summary`
- Returns `IReassessmentSummary`: `{ latestAttemptId, previousAttemptId, skillComparisons[], overallPreviousScore, overallCurrentScore, overallChange, attemptCount }`.

---

## 9. Adaptive Roadmap Engine (P2-ROAD-005)

### Overview
The Adaptive Roadmap Engine (`backend/src/services/adaptiveRoadmapService.ts`) orchestrates the generation of updated, versioned roadmaps (Roadmap V2, V3...) after a student completes a reassessment. It guarantees that learning paths adapt dynamically based on the student's **latest intelligence evidence**, while strictly preserving historical roadmaps and progress states.

### Core Rules & Architectural Principles
1. **Reuse Existing Engines**: Does not duplicate gap calculations, priority formulas, or topological sorting logic. Calls `getStudentSkillGapPrioritySnapshot` and `generateRoadmapForStudent`.
2. **Latest Evidence Selection**: Queries the student's latest completed assessment attempt (`completedAt DESC, createdAt DESC`).
3. **Pure Logic & Duplicate Generation Protection**:
   - `shouldGenerateAdaptiveRoadmap(latestAttemptId, currentRoadmap, force)` evaluates whether an adaptation is necessary.
   - If `currentRoadmap.generatedFromAssessmentAttemptId === latestAttemptId` and `force === false`, duplicate generation is blocked (`shouldGenerate: false, reason: 'ALREADY_GENERATED_FOR_ATTEMPT'`).
4. **Target-Met Filtering (`gap === 0`)**: Skills where the latest gap is 0 (previously active gaps now met) are excluded from active modules in the new roadmap, while remaining satisfied prerequisites for downstream active skills.
5. **Score Change Handling**:
   - **Regressed Skills**: Drops in skill scores that re-open a gap (`gap > 0`) make the skill eligible for module generation automatically via the priority engine.
   - **Improved Skills**: Skills with remaining gaps (`gap > 0`) stay active in the new roadmap with updated priority rankings.
   - **New Evidence**: Skills newly assessed are processed through the gap & priority snapshot without special AI logic.
6. **Strict Progress Isolation**:
   - `RoadmapProgress` documents are strictly bound to `roadmapId`.
   - V1 `RoadmapProgress` remains untouched and archived with Roadmap V1.
   - V2 receives a fresh, independent `RoadmapProgress` document initialized by `generateRoadmapForStudent`.
7. **Version Transitions**:
   - Previous active roadmap: `isCurrent = false`, `status = 'ARCHIVED'`.
   - New adaptive roadmap: `version = previousVersion + 1`, `isCurrent = true`, `status = 'ACTIVE'`, `generationReason = 'ADAPTIVE'`, `generatedFromAssessmentAttemptId = latestAttemptId`.

### Adaptive Roadmap Endpoint Contract
- **HTTP Method**: `POST /api/v1/intelligence/roadmap/adaptive` (and dual-mounted `POST /api/intelligence/roadmap/adaptive`)
- **Headers**: `Authorization: Bearer <token>` (Enforces authenticated student ownership)
- **Request Body**: `{ force?: boolean }`
- **Response**: `{ success: true, data: { roadmap: IRoadmap }, message: "Adaptive roadmap generated successfully" }`




