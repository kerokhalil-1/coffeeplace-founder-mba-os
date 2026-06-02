/**
 * Skill Auto-Tracker
 * Automatically awards SkillEvidence when learning actions are completed.
 * All functions are pure — they return updated arrays without side effects.
 */

import { SkillScore, SkillEvidence, CourseCategory } from './types'
import { generateId } from './utils'

// ─── Point rules ─────────────────────────────────────────────────────────────

export const SKILL_POINTS = {
  COURSE_COMPLETED:          10,
  EXAM_PASSED:               10,
  ASSIGNMENT_GRADE_A:        10,  // >= 90%
  ASSIGNMENT_GRADE_B:         8,  // >= 75%
  ASSIGNMENT_GRADE_C:         5,  // >= 60%
  ASSIGNMENT_GRADE_BELOW:     0,  // < 60%
  BOOK_COMPLETED:             6,
  APP_IMPLEMENTED:            8,
} as const

/** Returns point value for an assignment based on score percentage */
export function assignmentPoints(score: number, maxScore: number): number {
  const pct = maxScore > 0 ? (score / maxScore) * 100 : 0
  if (pct >= 90) return SKILL_POINTS.ASSIGNMENT_GRADE_A
  if (pct >= 75) return SKILL_POINTS.ASSIGNMENT_GRADE_B
  if (pct >= 60) return SKILL_POINTS.ASSIGNMENT_GRADE_C
  return SKILL_POINTS.ASSIGNMENT_GRADE_BELOW
}

// ─── Duplicate prevention ─────────────────────────────────────────────────────

/** Check if evidence for this entity already exists (by refId) */
export function hasEvidenceForRef(skill: SkillScore, refId: string): boolean {
  return skill.evidence.some(e => e.refId === refId)
}

/** Check across all skills if this refId has already been awarded */
export function alreadyAwarded(skills: SkillScore[], refId: string): boolean {
  return skills.some(s => s.evidence.some(e => e.refId === refId))
}

// ─── Core award function ──────────────────────────────────────────────────────

/**
 * Awards skill points for a completed learning action.
 * Returns updated SkillScore[] — call setSkills() with the result.
 * Returns null if points were already awarded for this refId (no duplicate).
 */
export function awardSkillPoints(
  skills: SkillScore[],
  category: CourseCategory,
  points: number,
  refId: string,
  type: SkillEvidence['type'],
  description: string,
): SkillScore[] | null {
  if (points <= 0) return null

  // Guard: if no skill exists for this category, award would silently no-op
  if (!skills.some(s => s.category === category)) return null

  // Duplicate check — same refId already awarded anywhere
  if (alreadyAwarded(skills, refId)) return null

  const evidence: SkillEvidence = {
    id: generateId(),
    type,
    description,
    pointsAdded: points,
    date: new Date().toISOString(),
    refId,
  }

  return skills.map(s => {
    if (s.category !== category) return s
    const newScore = Math.min(100, s.currentScore + points)
    return {
      ...s,
      previousScore: s.currentScore,
      currentScore: newScore,
      evidence: [...s.evidence, evidence],
      lastUpdated: new Date().toISOString(),
    }
  })
}

// ─── Typed helpers ────────────────────────────────────────────────────────────

export function awardCourseCompletion(
  skills: SkillScore[],
  courseId: string,
  courseName: string,
  category: CourseCategory,
): SkillScore[] | null {
  return awardSkillPoints(
    skills, category,
    SKILL_POINTS.COURSE_COMPLETED,
    `course:${courseId}`,
    'course',
    `Completed course: ${courseName}`,
  )
}

export function awardExamPass(
  skills: SkillScore[],
  attemptId: string,
  examTitle: string,
  category: CourseCategory,
): SkillScore[] | null {
  return awardSkillPoints(
    skills, category,
    SKILL_POINTS.EXAM_PASSED,
    `exam:${attemptId}`,
    'exam',
    `Passed exam: ${examTitle}`,
  )
}

export function awardAssignmentGrade(
  skills: SkillScore[],
  assignmentId: string,
  assignmentTitle: string,
  category: CourseCategory,
  score: number,
  maxScore: number,
): SkillScore[] | null {
  const pts = assignmentPoints(score, maxScore)
  if (pts === 0) return null
  return awardSkillPoints(
    skills, category, pts,
    `assignment:${assignmentId}`,
    'assignment',
    `Graded assignment: ${assignmentTitle} (${score}/${maxScore})`,
  )
}

export function awardBookCompletion(
  skills: SkillScore[],
  bookId: string,
  bookName: string,
  category: CourseCategory,
): SkillScore[] | null {
  return awardSkillPoints(
    skills, category,
    SKILL_POINTS.BOOK_COMPLETED,
    `book:${bookId}`,
    'reading',
    `Completed book: ${bookName}`,
  )
}

export function awardAppImplemented(
  skills: SkillScore[],
  appId: string,
  appTitle: string,
  category: CourseCategory,
): SkillScore[] | null {
  return awardSkillPoints(
    skills, category,
    SKILL_POINTS.APP_IMPLEMENTED,
    `app:${appId}`,
    'implementation',
    `Implemented CoffeePlace application: ${appTitle}`,
  )
}
