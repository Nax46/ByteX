import { Types } from 'mongoose';
import { AssessmentModel } from '../models/Assessment.js';
import { QuestionModel } from '../models/Question.js';
import { AssessmentAttemptModel, IAssessmentAttemptDocument } from '../models/AssessmentAttempt.js';
import { IQuestion, AssessmentSubmissionPayload } from '../types/assessment.js';
import { calculateDeterministicScoring } from './deterministicScoring.js';

export class AssessmentScoringService {
  /**
   * Evaluates student assessment submission and persists an immutable AssessmentAttempt.
   * Guaranteed NO N+1 queries by using a batched MongoDB query.
   */
  public static async evaluateAndSaveAttempt(
    payload: AssessmentSubmissionPayload
  ): Promise<IAssessmentAttemptDocument> {
    const { studentProfileId, assessmentId, answers } = payload;

    // 1. Basic Payload Validation
    if (!answers || answers.length === 0) {
      throw new Error('Assessment submission must contain at least one answer.');
    }

    if (!Types.ObjectId.isValid(studentProfileId)) {
      throw new Error('Invalid studentProfileId format.');
    }

    if (!Types.ObjectId.isValid(assessmentId)) {
      throw new Error('Invalid assessmentId format.');
    }

    // 2. Check for Duplicate Question Submissions
    const questionIdSet = new Set<string>();
    for (const ans of answers) {
      if (!ans.questionId || !Types.ObjectId.isValid(ans.questionId)) {
        throw new Error(`Invalid questionId format: ${ans.questionId}`);
      }
      if (questionIdSet.has(ans.questionId)) {
        throw new Error(`Duplicate question submission detected for questionId: ${ans.questionId}`);
      }
      questionIdSet.add(ans.questionId);
    }

    // 3. Verify Assessment Existence
    const assessment = await AssessmentModel.findById(assessmentId);
    if (!assessment) {
      throw new Error('Assessment not found.');
    }

    if (!assessment.isActive) {
      throw new Error('Cannot submit answers for an inactive assessment.');
    }

    // 4. Batched Question Retrieval (Prevents N+1 Query Problem)
    const questionObjectIds = Array.from(questionIdSet).map((id) => new Types.ObjectId(id));
    const questionDocs = await QuestionModel.find({
      _id: { $in: questionObjectIds },
    });

    if (questionDocs.length !== questionIdSet.size) {
      throw new Error('One or more submitted questions do not exist.');
    }

    // Build In-Memory Lookup Map
    const questionMap = new Map<string, IQuestion>();
    for (const doc of questionDocs) {
      const plainObj = doc.toObject() as IQuestion;
      const qIdStr = doc._id.toString();

      // Check Active Status
      if (!doc.isActive) {
        throw new Error(`Question ${qIdStr} is inactive and cannot be scored.`);
      }

      // Cross-Assessment Question Security Check
      if (doc.assessmentId && doc.assessmentId.toString() !== assessmentId) {
        throw new Error(`Question ${qIdStr} does not belong to assessment ${assessmentId}.`);
      }

      questionMap.set(qIdStr, plainObj);
    }

    // 5. Validate Selected Option Existence per Question
    for (const ans of answers) {
      const question = questionMap.get(ans.questionId);
      if (!question) continue;

      const optionExists = question.options.some((opt) => opt.optionId === ans.selectedOptionId);
      if (!optionExists) {
        throw new Error(`Invalid selectedOptionId "${ans.selectedOptionId}" for question ${ans.questionId}.`);
      }
    }

    // 6. Execute Pure Deterministic Scoring Engine
    const scoringResult = calculateDeterministicScoring(answers, questionMap);

    // 7. Persist Immutable AssessmentAttempt Record
    const attemptDoc = await AssessmentAttemptModel.create({
      studentProfileId: new Types.ObjectId(studentProfileId),
      assessmentId: new Types.ObjectId(assessmentId),
      status: 'COMPLETED',
      answers: scoringResult.answers,
      skillScores: scoringResult.skillScores,
      totalEarnedPoints: scoringResult.totalEarnedPoints,
      totalMaxPoints: scoringResult.totalMaxPoints,
      completedAt: new Date(),
    });

    return attemptDoc;
  }
}
