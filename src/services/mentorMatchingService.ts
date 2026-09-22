/**
 * Mentor Matching Service
 * ----------------------
 * Rule-based problem classification and mentor matching engine.
 * Future: Replace with AI/LLM backend call without changing UI contracts.
 *
 * Architecture:
 *   UI → mentorMatchingService → ClassificationResult → MentorMatch[]
 */

import { DEMO_MENTORS } from '@/data/demo.mentors'
import {
  MentorIntake,
  ClassificationResult,
  MentorMatch,
  Mentor,
  ProblemCategory,
  LearningGoal,
  PROBLEM_CATEGORY_LABELS,
} from '@/types/mentor.types'

// ─── Keyword Classification Rules ─────────────────────────────────────────

const CATEGORY_KEYWORDS: Record<ProblemCategory, string[]> = {
  frontend_development: [
    'react', 'javascript', 'js', 'html', 'css', 'frontend', 'front-end',
    'ui', 'vue', 'angular', 'next', 'gatsby', 'redux', 'tailwind', 'dom',
    'component', 'responsive', 'web design', 'browser',
  ],
  backend_development: [
    'backend', 'back-end', 'server', 'node', 'express', 'api', 'rest',
    'graphql', 'django', 'flask', 'spring', 'database connection', 'microservice',
    'authentication', 'authorization', 'middleware',
  ],
  project_development: [
    'project', 'build', 'practice', 'application', 'app', 'implement',
    'create', 'develop', 'real world', 'hands on', 'hands-on', 'working on',
    'stuck', 'cannot build', "can't build", 'deploy', 'deployment',
  ],
  career_planning: [
    'career', 'which field', 'confused', 'direction', 'path', 'roadmap',
    'what to learn', 'where to start', "don't know where", 'guidance',
    'mentor', 'advice', 'lost', 'plan', 'goal', 'future',
  ],
  interview_placement: [
    'interview', 'placement', 'campus', 'job', 'hiring', 'recruit',
    'crack', 'offer', 'package', 'lpa', 'aptitude', 'coding round',
    'hr round', 'technical round', 'onsite', 'coding test',
  ],
  resume_portfolio: [
    'resume', 'cv', 'portfolio', 'linkedin', 'github profile', 'profile',
    'showcase', 'no projects', 'nothing to show', 'personal brand',
  ],
  data_ai: [
    'data', 'machine learning', 'ml', 'ai', 'artificial intelligence',
    'deep learning', 'neural', 'nlp', 'pandas', 'numpy', 'tensorflow',
    'pytorch', 'scikit', 'data science', 'analytics', 'model', 'dataset',
  ],
  programming_fundamentals: [
    'basics', 'fundamental', 'beginner', 'start', 'programming', 'coding',
    'algorithm', 'logic', 'c++', 'java', 'python basics', 'oop',
    'data structure', 'complexity', 'big o',
  ],
  learning_strategy: [
    'how to learn', 'strategy', 'routine', 'schedule', 'overwhelmed',
    'too much to learn', "don't know where to start", 'consistency',
    'distracted', 'motivation', 'procrastination', 'self study',
  ],
  full_stack: [
    'full stack', 'fullstack', 'both frontend and backend', 'mern', 'mean',
    'complete developer', 'full stack developer',
  ],
}

const SKILL_KEYWORDS: Record<string, string[]> = {
  React: ['react', 'jsx', 'hooks', 'redux', 'context api', 'next.js', 'react native'],
  JavaScript: ['javascript', 'js', 'es6', 'typescript', 'node', 'npm', 'async', 'promise'],
  Python: ['python', 'django', 'flask', 'fastapi', 'pandas', 'numpy'],
  'HTML & CSS': ['html', 'css', 'sass', 'tailwind', 'bootstrap', 'flexbox', 'grid'],
  'Data Structures': ['dsa', 'data structure', 'algorithm', 'binary tree', 'graph', 'dynamic programming'],
  'Machine Learning': ['machine learning', 'ml', 'deep learning', 'neural network', 'tensorflow', 'pytorch'],
  'System Design': ['system design', 'scalability', 'architecture', 'microservice', 'distributed'],
  'Interview Skills': ['interview', 'placement', 'coding round', 'hr round', 'behavioral'],
  Portfolio: ['portfolio', 'github', 'projects to show', 'resume'],
  'Career Strategy': ['career', 'job search', 'networking', 'linkedin'],
}

// ─── Classification Engine ────────────────────────────────────────────────

function normalizeText(text: string): string {
  return text.toLowerCase().replace(/[^a-z0-9\s]/g, ' ')
}

function detectCategories(text: string): ProblemCategory[] {
  const norm = normalizeText(text)
  const scores: Partial<Record<ProblemCategory, number>> = {}

  for (const [category, keywords] of Object.entries(CATEGORY_KEYWORDS) as [ProblemCategory, string[]][]) {
    const score = keywords.reduce((acc, kw) => {
      return acc + (norm.includes(kw) ? 1 : 0)
    }, 0)
    if (score > 0) scores[category] = score
  }

  return Object.entries(scores)
    .sort(([, a], [, b]) => b - a)
    .map(([cat]) => cat as ProblemCategory)
}

function detectSkills(text: string, selectedSkillAreas: string[]): string[] {
  const norm = normalizeText(text)
  const detected = new Set<string>(selectedSkillAreas)

  for (const [skill, keywords] of Object.entries(SKILL_KEYWORDS)) {
    if (keywords.some((kw) => norm.includes(kw))) {
      detected.add(skill)
    }
  }

  return Array.from(detected).slice(0, 6)
}

/**
 * Classify a student's problem into structured categories and skills.
 */
export function classifyProblem(intake: MentorIntake): ClassificationResult {
  const { problemText, goal, level, skillAreas } = intake
  const combinedText = `${problemText} ${skillAreas.join(' ')}`

  const allCategories = detectCategories(combinedText)
  const primaryCategory: ProblemCategory = allCategories[0] ?? 'career_planning'
  const secondaryCategories = allCategories.slice(1, 3)
  const detectedSkills = detectSkills(combinedText, skillAreas)
  const detectedGoals: LearningGoal[] = [goal]

  const categoryLabel = PROBLEM_CATEGORY_LABELS[primaryCategory]
  const skillSummary = detectedSkills.slice(0, 2).join(' & ')
  const summary = skillSummary
    ? `Needs mentorship in ${categoryLabel} focused on ${skillSummary}`
    : `Needs mentorship in ${categoryLabel}`

  return {
    primaryCategory,
    secondaryCategories,
    detectedSkills,
    detectedGoals,
    level,
    summary,
  }
}

// ─── Mentor Scoring ───────────────────────────────────────────────────────

function scoreMentor(mentor: Mentor, classification: ClassificationResult): number {
  let score = 0

  // Category match (40 points)
  if (mentor.categories.includes(classification.primaryCategory)) {
    score += 40
  } else if (classification.secondaryCategories.some((c) => mentor.categories.includes(c))) {
    score += 20
  }

  // Skill match (30 points)
  const skillMatches = classification.detectedSkills.filter((skill) =>
    mentor.skills.some((ms) => ms.toLowerCase().includes(skill.toLowerCase()) ||
      skill.toLowerCase().includes(ms.toLowerCase()))
  ).length
  score += Math.min(skillMatches * 8, 30)

  // Goal match (20 points)
  if (classification.detectedGoals.some((g) => mentor.goals.includes(g))) {
    score += 20
  }

  // Level match (10 points)
  if (mentor.levels.includes(classification.level)) {
    score += 10
  }

  return Math.min(score, 100)
}

function buildMatchReason(mentor: Mentor, classification: ClassificationResult): string {
  const primary = PROBLEM_CATEGORY_LABELS[classification.primaryCategory]

  if (classification.detectedSkills.length > 0) {
    const topSkill = classification.detectedSkills[0]
    if (mentor.skills.some((s) => s.toLowerCase().includes(topSkill.toLowerCase()))) {
      return `Strong match for your ${topSkill} learning goals and ${primary.toLowerCase()} needs.`
    }
  }

  if (mentor.categories.includes(classification.primaryCategory)) {
    return `Recommended based on your ${primary.toLowerCase()} focus and ${classification.level} experience level.`
  }

  return `Experienced mentor aligned with your ${primary.toLowerCase()} journey.`
}

function buildMatchHighlights(mentor: Mentor, classification: ClassificationResult): string[] {
  const highlights: string[] = []
  const matchedSkills = classification.detectedSkills.filter((skill) =>
    mentor.skills.some((ms) => ms.toLowerCase().includes(skill.toLowerCase()))
  ).slice(0, 2)

  if (matchedSkills.length > 0) {
    highlights.push(`Expert in ${matchedSkills.join(' & ')} — exactly what you need`)
  }
  if (mentor.levels.includes(classification.level)) {
    const levelMap = { beginner: 'beginners', intermediate: 'intermediate learners', advanced: 'advanced developers' }
    highlights.push(`Specializes in mentoring ${levelMap[classification.level]}`)
  }
  highlights.push(`${mentor.studentsMentored}+ students mentored • ${mentor.responseTime} response`)

  return highlights.slice(0, 3)
}

// ─── Top 3 Matching ───────────────────────────────────────────────────────

/**
 * Match the top 3 mentors to a classification result.
 * Returns scored, sorted MentorMatch[] — always exactly 3.
 */
export function matchMentors(classification: ClassificationResult): MentorMatch[] {
  const allMentors = DEMO_MENTORS
  const scored = allMentors
    .map((mentor) => ({
      mentor,
      score: scoreMentor(mentor, classification),
      matchReason: buildMatchReason(mentor, classification),
      matchHighlights: buildMatchHighlights(mentor, classification),
    }))
    .sort((a, b) => b.score - a.score)

  // Ensure variety: avoid same-category mentors where possible
  const result: MentorMatch[] = []
  const usedCategories = new Set<string>()

  // First pass: pick best from each unique primary category
  for (const match of scored) {
    if (result.length >= 3) break
    const primaryCat = match.mentor.categories[0]
    if (!usedCategories.has(primaryCat)) {
      result.push(match)
      usedCategories.add(primaryCat)
    }
  }

  // Second pass: fill remaining slots if needed
  if (result.length < 3) {
    for (const match of scored) {
      if (result.length >= 3) break
      if (!result.find((r) => r.mentor.id === match.mentor.id)) {
        result.push(match)
      }
    }
  }

  return result
}
