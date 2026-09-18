# P2_AI_SERVICE_CONTRACT — AI Service Abstraction & Gemini Integration

## 1. Overview

This document specifies the provider-agnostic **AI Service Abstraction Layer** and the rules for invoking Google Gemini models in AI SkillPath.

---

## 2. Architecture & Provider Isolation

```
[Application Controller / Service]
                 │
                 ▼
     AIService Interface (IAIService)
                 │
                 ▼
   GeminiAIService (Concrete Class)
                 │
                 ▼
       [Google Gemini SDK]
```

### Abstraction Interface Definition (`IAIService`)
```typescript
export interface IAIService {
  generateSkillExplanation(context: AIPersonalizationContext, skillSlug: string): Promise<AISkillExplanationResponse>;
  generatePersonalizedSummary(context: AIPersonalizationContext): Promise<AIPersonalizedSummaryResponse>;
  askAIMentor(context: AIPersonalizationContext, userQuery: string): Promise<AIMentorResponse>;
  explainResourceRecommendation(skillName: string, resourceTitle: string, userGap: number): Promise<string>;
  explainProjectRecommendation(skillName: string, projectTitle: string, userGap: number): Promise<string>;
}
```

---

## 3. Allowed vs. Forbidden AI Responsibilities

| Category | Task | Allowed for AI? |
| -------- | ---- | --------------- |
| **Deterministic** | Grading MCQ assessment answers | ❌ **FORBIDDEN** |
| **Deterministic** | Computing numerical skill scores | ❌ **FORBIDDEN** |
| **Deterministic** | Calculating skill gaps (`target - current`) | ❌ **FORBIDDEN** |
| **Deterministic** | Priority ranking algorithm | ❌ **FORBIDDEN** |
| **AI Enhanced** | Generating personalized encouragement & advice | ✅ **ALLOWED** |
| **AI Enhanced** | Suggesting external articles, courses, & videos | ✅ **ALLOWED** |
| **AI Enhanced** | Generating contextual project ideas for portfolio | ✅ **ALLOWED** |
| **AI Enhanced** | Answering student mentor questions about a skill | ✅ **ALLOWED** |

---

## 4. Security, Resilience & Fallback Policy

1. **API Key Security**: `GEMINI_API_KEY` must be loaded strictly from backend environment variables (`process.env.GEMINI_API_KEY`). NEVER expose API keys in client JavaScript or committed documentation.
2. **Timeout & Fail-Safe**: Every Gemini request must specify a maximum timeout (e.g. 5000ms).
3. **Fallback Mode**: If the Gemini API call fails (rate limit, network issue, API timeout), the `AIService` implementation MUST return static fallback content from the database catalog (e.g., pre-seeded static resources/projects) without throwing a 500 error to the client.
