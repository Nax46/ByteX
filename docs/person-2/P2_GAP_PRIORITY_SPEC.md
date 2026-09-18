# P2_GAP_PRIORITY_SPEC — Skill Gap & Priority Engine Spec

## 1. Overview

This document defines the mathematical models for calculating the **Skill Gap** and ranking skills via the **Priority Engine**.

---

## 2. Skill Gap Calculation

### Definition
The **Skill Gap** measures the deficit between a student's evaluated current proficiency level and the benchmark level required by their target career.

### Baseline Gap Rule
$$\text{rawGap} = \text{targetLevel} - \text{currentLevel}$$

### Clamping & Normalization Rules
$$\text{gap} = \max(0, \text{targetLevel} - \text{currentLevel})$$

### Missing Assessment Evidence Rule
If a skill is required by the career but the student has no assessment score for that skill:
- `hasEvidence`: `false`
- `currentLevel`: `null`
- `gap`: `targetLevel`
- `status`: `NO_EVIDENCE`

> **Note**: Missing assessment evidence is explicitly distinguished from `currentLevel: 0` (`hasEvidence: true`).

---

## 3. Priority Engine

### Difference Between Gap and Priority
- **Gap**: Objective mathematical difference between `targetLevel` and `currentLevel`.
- **Priority**: A business ranking mechanism evaluating gap magnitude, career importance, prerequisite dependencies, and assessment evidence.

### Strategy Pattern Architecture
To avoid hardcoding an unapproved business formula as production truth, the Priority Engine uses an extensible strategy interface (`IPriorityStrategy`).

### Current Strategy: `PROPOSED_WEIGHTED_HYBRID`
> **STATUS**: `PROPOSED` (Provisional algorithm implemented via `ProposedPriorityStrategy`. Final weighting requires formal team alignment).

$$\text{priorityScore} = (\text{gap} \times 0.5) + (\text{importanceWeight} \times 30) + \text{prerequisiteBonus} + (\text{weight} \times 10)$$

#### Implemented Weights:
- `importanceWeight`: `CRITICAL` = 1.0, `HIGH` = 0.75, `MEDIUM` = 0.5, `LOW` = 0.25.
- `prerequisiteBonus`: 15 points if this skill is a prerequisite for other skills in the career path; 0 otherwise.
- `priorityStatus`: `CRITICAL_GAP` ($\text{gap} \ge 40$), `MODERATE_GAP` ($\text{gap} \ge 20$), `LOW_GAP` ($\text{gap} < 20$), `TARGET_MET` ($\text{gap} = 0$), `NO_EVIDENCE`.

---

## 4. Deterministic Explainability

The system generates human-readable explanations deterministically without relying on AI:
- **Target Met**: *"React target level of 80 is already met (current score: 85). No active learning gap."*
- **No Evidence**: *"MongoDB requires target level of 70 at HIGH importance, but has no assessment evidence yet."*
- **Active Gap**: *"Node.js has a 37-point skill gap against the target level of 75 (current: 38) at HIGH importance."*

---

## 5. Invariants

1. Calculations are pure, deterministic functions (`calculateSkillGap`, `buildSkillGapPrioritySnapshot`).
2. Priority snapshots are sorted in descending order of `priorityScore`.
3. Skills with `gap = 0` receive a priority score of `0` and status `TARGET_MET`.

