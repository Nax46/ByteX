import { Types } from 'mongoose';
import {
  IQuestion,
  IAssessmentAttemptAnswer,
  IAssessmentAttemptSkillScore,
  StudentAnswerSubmissionDTO,
} from '../types/assessment.js';

export interface GradedAnswerResult {
  questionId: Types.ObjectId;
  skillId: Types.ObjectId;
  selectedOptionId: string;
  isCorrect: boolean;
  pointsEarned: number;
  maxPoints: number;
  timeTakenSeconds: number;
}

export interface DeterministicScoringResult {
  answers: IAssessmentAttemptAnswer[];
  skillScores: IAssessmentAttemptSkillScore[];
  totalEarnedPoints: number;
  totalMaxPoints: number;
}

/**
 * Pure function: Grades a single student answer against stored Question metadata.
 * Server is the sole authority for correctness and points.
 */
export const gradeSingleAnswer = (
  submittedAnswer: StudentAnswerSubmissionDTO,
  question: IQuestion
): GradedAnswerResult => {
  const isCorrect = submittedAnswer.selectedOptionId === question.correctOptionId;
  const pointsEarned = isCorrect ? question.points : 0;

  return {
    questionId: (question._id || new Types.ObjectId(submittedAnswer.questionId)) as Types.ObjectId,
    skillId: question.skillId,
    selectedOptionId: submittedAnswer.selectedOptionId,
    isCorrect,
    pointsEarned,
    maxPoints: question.points,
    timeTakenSeconds: Math.max(0, submittedAnswer.timeTakenSeconds || 0),
  };
};

/**
 * Pure function: Computes total earned and maximum points for an assessment attempt.
 */
export const calculateTotals = (
  gradedAnswers: GradedAnswerResult[],
  questionMap: Map<string, IQuestion>
): { totalEarnedPoints: number; totalMaxPoints: number } => {
  const totalEarnedPoints = gradedAnswers.reduce((sum, item) => sum + item.pointsEarned, 0);
  const totalMaxPoints = Array.from(questionMap.values()).reduce((sum, q) => sum + q.points, 0);

  return { totalEarnedPoints, totalMaxPoints };
};

/**
 * Pure function: Groups graded answers by skillId and computes per-skill 0-100 scores.
 * Rule: Scores retain per-skill breakdown and are rounded to nearest integer.
 */
export const calculatePerSkillScores = (
  gradedAnswers: GradedAnswerResult[],
  questionMap: Map<string, IQuestion>
): IAssessmentAttemptSkillScore[] => {
  // 1. Map all questions by skillId
  const skillQuestionMap = new Map<string, { skillId: Types.ObjectId; questions: IQuestion[] }>();

  questionMap.forEach((question) => {
    const skillIdStr = question.skillId.toString();
    if (!skillQuestionMap.has(skillIdStr)) {
      skillQuestionMap.set(skillIdStr, { skillId: question.skillId, questions: [] });
    }
    skillQuestionMap.get(skillIdStr)!.questions.push(question);
  });

  // Map graded answers by questionId for fast lookup
  const answerMap = new Map<string, GradedAnswerResult>();
  gradedAnswers.forEach((ans) => answerMap.set(ans.questionId.toString(), ans));

  const skillScores: IAssessmentAttemptSkillScore[] = [];

  skillQuestionMap.forEach(({ skillId, questions }) => {
    let earnedPoints = 0;
    let maxPoints = 0;
    let correctCount = 0;
    const totalQuestions = questions.length;

    questions.forEach((q) => {
      const qIdStr = q._id ? q._id.toString() : '';
      maxPoints += q.points;

      const answer = answerMap.get(qIdStr);
      if (answer) {
        earnedPoints += answer.pointsEarned;
        if (answer.isCorrect) {
          correctCount++;
        }
      }
    });

    const score = maxPoints > 0 ? Math.round((earnedPoints / maxPoints) * 100) : 0;

    skillScores.push({
      skillId,
      score,
      totalQuestions,
      correctCount,
      earnedPoints,
      maxPoints,
    });
  });

  return skillScores;
};

/**
 * Pure Function Orchestrator: Combines grading, total points calculation, and per-skill aggregation.
 */
export const calculateDeterministicScoring = (
  submittedAnswers: StudentAnswerSubmissionDTO[],
  questionMap: Map<string, IQuestion>
): DeterministicScoringResult => {
  const gradedResults: GradedAnswerResult[] = [];

  for (const sub of submittedAnswers) {
    const question = questionMap.get(sub.questionId);
    if (!question) continue;

    const graded = gradeSingleAnswer(sub, question);
    gradedResults.push(graded);
  }

  const { totalEarnedPoints, totalMaxPoints } = calculateTotals(gradedResults, questionMap);
  const skillScores = calculatePerSkillScores(gradedResults, questionMap);

  const answersForAttempt: IAssessmentAttemptAnswer[] = gradedResults.map((g) => ({
    questionId: g.questionId,
    selectedOptionId: g.selectedOptionId,
    isCorrect: g.isCorrect,
    pointsEarned: g.pointsEarned,
    timeTakenSeconds: g.timeTakenSeconds,
  }));

  return {
    answers: answersForAttempt,
    skillScores,
    totalEarnedPoints,
    totalMaxPoints,
  };
};
