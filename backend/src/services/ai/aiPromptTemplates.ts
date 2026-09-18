import { AIPersonalizationContext } from '../../types/ai.js';

export const AI_SYSTEM_INSTRUCTIONS = `
You are the AI Career Mentor for "AI SkillPath", a personalized software engineering learning platform.

STRICT RULES & CONSTRAINTS:
1. You MUST NOT invent student assessment scores, skill levels, gaps, or career requirements. All numerical data is strictly calculated by the backend deterministic intelligence engine and supplied to you in the context.
2. You MUST NOT override or recalculate skill gaps, priority scores, or roadmap dependency ordering.
3. Base all explanations, guidance, and recommendations strictly on the provided student context and database items.
4. Keep explanations clear, encouraging, professional, and actionable for a software engineering student.
5. When requested to output JSON, you MUST respond ONLY with valid, minified or nicely formatted JSON matching the requested schema without markdown wrapper blocks (no \`\`\`json block unless required).
`.trim();

export const buildSkillExplanationPrompt = (
  context: AIPersonalizationContext,
  skillSlug: string
): string => {
  const targetGap = context.skillGaps.find(
    (s) => s.skillSlug.toLowerCase() === skillSlug.toLowerCase()
  );

  const skillName = targetGap ? targetGap.skillName : skillSlug;
  const currentLevel = targetGap ? targetGap.currentLevel : 0;
  const targetLevel = targetGap ? targetGap.targetLevel : 80;
  const gap = targetGap ? targetGap.gap : 80;
  const importance = targetGap ? targetGap.importance : 'HIGH';

  return `
STUDENT CONTEXT:
- Student Name: ${context.studentName}
- Target Career: ${context.targetCareer}
- Skill Target: ${skillName}
- Current Skill Level: ${currentLevel ?? 'Not Evaluated'}%
- Target Level: ${targetLevel}%
- Skill Gap: ${gap} points
- Career Importance: ${importance}

TASK:
Provide a personalized AI explanation of why this skill gap exists, why mastering ${skillName} is essential for a ${context.targetCareer}, a 3-step action plan, and key technical topics to master.

REQUIRED JSON OUTPUT FORMAT (Strict JSON):
{
  "skillName": "${skillName}",
  "currentLevel": ${currentLevel !== null ? currentLevel : 'null'},
  "targetLevel": ${targetLevel},
  "gap": ${gap},
  "explanation": "<Clear explanation of why this gap matters for ${context.targetCareer}>",
  "recommendedActionPlan": ["<Step 1>", "<Step 2>", "<Step 3>"],
  "keyTopicsToMaster": ["<Topic 1>", "<Topic 2>", "<Topic 3>"]
}
`.trim();
};

export const buildPersonalizedSummaryPrompt = (
  context: AIPersonalizationContext
): string => {
  const topGapsSummary = context.skillGaps
    .slice(0, 3)
    .map((s) => `${s.skillName} (Gap: ${s.gap} pts, Importance: ${s.importance})`)
    .join(', ');

  return `
STUDENT CONTEXT:
- Student Name: ${context.studentName}
- Target Career: ${context.targetCareer}
- Top Skill Gaps: ${topGapsSummary || 'None'}
- Top Priority Skill: ${context.topPrioritySkill || 'Core CS'}
- Overall Roadmap Progress: ${context.overallProgressPercent || 0}%

TASK:
Generate a personalized learning summary for ${context.studentName}, including an inspiring headline, progress overview, top focus skills, an encouraging quote, and the immediate next best learning action.

REQUIRED JSON OUTPUT FORMAT (Strict JSON):
{
  "headline": "<Catchy headline for student's current learning path>",
  "summaryText": "<Concise 2-sentence summary of career progress and current gap priorities>",
  "topFocusSkills": ["${context.topPrioritySkill || 'JavaScript'}"],
  "encouragementQuote": "<Inspiring tech career quote>",
  "nextBestAction": "<Single actionable recommendation for today>"
}
`.trim();
};

export const buildAIMentorQueryPrompt = (
  context: AIPersonalizationContext,
  userQuery: string
): string => {
  const topSkillsStr = context.skillGaps
    .map((s) => `${s.skillName} (Level: ${s.currentLevel ?? 0}%, Gap: ${s.gap})`)
    .join(', ');

  return `
STUDENT CONTEXT:
- Student Name: ${context.studentName}
- Target Career: ${context.targetCareer}
- Current Skill Breakdown: ${topSkillsStr || 'Diagnostic Pending'}
- Active Progress: ${context.overallProgressPercent || 0}%

STUDENT MENTOR QUESTION:
"${userQuery}"

TASK:
Answer the student's question specifically tailored to their target career as a ${context.targetCareer} and their current skill levels. Provide 2 suggested follow-up questions and list referenced skill names.

REQUIRED JSON OUTPUT FORMAT (Strict JSON):
{
  "query": "${userQuery.replace(/"/g, '\\"')}",
  "answer": "<Helpful, precise mentor answer>",
  "suggestedFollowUpQuestions": ["<Follow-up question 1>", "<Follow-up question 2>"],
  "referencedSkillNames": ["<Referenced skill 1>"]
}
`.trim();
};
