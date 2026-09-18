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
