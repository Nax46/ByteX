# P2_ASSESSMENT_SCORING_SPEC — Assessment, Question & Scoring Spec

## 1. Overview

This document specifies the assessment domain model (`Assessment`, `Question`, `AssessmentAttempt`) and the deterministic scoring engine that computes skill-specific scores for students.

---

## 2. Assessment Domain Models

### 2.1 `Question` Model
- `skillId`: ObjectId (Ref: `Skill`)
- `text`: Question text (e.g., *"Which HTTP method is commonly used to update an existing resource completely?"*)
- `options`: Array of options `[{ optionId: "a", text: "GET" }, { optionId: "b", text: "PUT" }, ...]`
- `correctOptionId`: String (e.g., `"b"`)
- `difficulty`: Enum (`EASY` = 10 pts, `MEDIUM` = 20 pts, `HARD` = 30 pts)
- `explanation`: Detailed explanation of correct answer for review.

### 2.2 `AssessmentAttempt` Model
- `studentProfileId`: ObjectId (Ref: `StudentProfile`)
- `answers`: Array of `{ questionId, selectedOptionId, isCorrect, pointsEarned }`
- `skillScores`: Array of calculated skill scores `{ skillId, score (0-100), correctCount, totalQuestions }`
- `completedAt`: Date

---

## 3. Deterministic Scoring Protocol

### Core Invariant
> **CRITICAL RULE:** Assessment scoring MUST NOT collapse student results into a single overall percentage. Results MUST generate per-skill scores.

### Per-Skill Score Calculation Formula
For each distinct `skillId` present in the assessment:

$$\text{earnedPoints}_{\text{skill}} = \sum \text{pointsEarned for correct answers in this skill}$$

$$\text{maxPoints}_{\text{skill}} = \sum \text{total possible points for questions in this skill}$$

$$\text{skillScore} = \text{round}\left( \frac{\text{earnedPoints}_{\text{skill}}}{\text{maxPoints}_{\text{skill}}} \times 100 \right)$$

---

## 4. Concrete Example

### Assessment Attempt Submission:
- Question 1 (REST API, EASY, 10 pts): Selected Correct → 10 / 10
- Question 2 (REST API, MEDIUM, 20 pts): Selected Incorrect → 0 / 20
- Question 3 (React, EASY, 10 pts): Selected Correct → 10 / 10
- Question 4 (React, HARD, 30 pts): Selected Correct → 30 / 30
- Question 5 (Node.js, MEDIUM, 20 pts): Selected Correct → 20 / 20

### Deterministic Engine Output:
- **`REST API`**: $\frac{10}{30} \times 100 = \mathbf{33}$
- **`React`**: $\frac{40}{40} \times 100 = \mathbf{100}$
- **`Node.js`**: $\frac{20}{20} \times 100 = \mathbf{100}$

**Generated `skillScores` Array:**
```json
[
  { "skillSlug": "rest-api", "score": 33 },
  { "skillSlug": "react", "score": 100 },
  { "skillSlug": "node-js", "score": 100 }
]
```

---

## 5. Security & Validation Rules

1. **Server Authority**: Client submits ONLY `questionId`, `selectedOptionId`, `timeTakenSeconds`. The server is the sole authority for grading (`isCorrect`), point assignment (`pointsEarned`), skill score aggregation (`skillScores`), and totals. Client-supplied score overrides are strictly ignored.
2. **Answer Key Protection**: `correctOptionId` and `explanation` are stored in database `Question` documents for grading, but MUST be stripped via `toStudentFacingQuestionDTO` before delivering questions to student clients.
3. **N+1 Query Prevention**: `AssessmentScoringService` batch fetches all required `Question` documents in a single MongoDB query (`QuestionModel.find({ _id: { $in: ids } })`) and builds an in-memory lookup map.
4. **Cross-Assessment Security**: Submitted questions are verified against `assessmentId`. Questions belonging to another assessment are rejected to prevent cross-assessment payload injection.
5. **Duplicate & Invalid Answer Protection**: Submissions containing duplicate question IDs, unknown question IDs, inactive questions, or invalid `selectedOptionId` choices are rejected with validation errors.
6. **Historical Immutability**: Persisted `AssessmentAttempt` documents are immutable historical logs. Reassessments create new attempt records without overwriting past student scores.

---

## 6. Coordination with Person 1

- Person 1's Assessment API delivers sanitized questions (`toStudentFacingQuestionDTO`) to the frontend and receives the student's submission payload (`AssessmentSubmissionPayload`).
- Person 1's controller invokes Person 2's `AssessmentScoringService.evaluateAndSaveAttempt(payload)` to grade questions deterministically and persist immutable `AssessmentAttempt` documents.

