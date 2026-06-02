// ─── Existing types (unchanged) ──────────────────────────────────────────────

export type CourseStatus = 'not_started' | 'in_progress' | 'completed' | 'paused'
export type CourseCategory =
  | 'Finance' | 'Accounting' | 'Marketing' | 'Branding' | 'Operations'
  | 'Leadership' | 'HR' | 'Entrepreneurship' | 'Strategy' | 'Analytics'
  | 'Negotiation' | 'Sales' | 'Customer Experience' | 'Expansion' | 'Other'

export type AppStatus = 'idea' | 'planning' | 'in_progress' | 'implemented' | 'dropped'
export type ImpactLevel = 'low' | 'medium' | 'high'
export type AssignmentStatus = 'pending' | 'in_progress' | 'submitted' | 'graded'
export type DifficultyLevel = 'beginner' | 'intermediate' | 'advanced'

export const ALL_MBA_CATEGORIES: CourseCategory[] = [
  'Finance','Accounting','Marketing','Branding','Operations',
  'Leadership','HR','Entrepreneurship','Strategy','Analytics',
  'Negotiation','Sales','Customer Experience','Expansion','Other'
]

// ─── Course ──────────────────────────────────────────────────────────────────

export interface Course {
  id: string
  name: string
  platform: string
  instructor: string
  link: string
  category: CourseCategory
  duration: string        // e.g. "6 hours", "4 weeks"
  status: CourseStatus
  progress: number
  topicsCovered: string[]
  keyLessons: string[]
  notes: string
  actionItems: string[]
  coffeeApplication: string
  rating: 1 | 2 | 3 | 4 | 5 | 0
  startedAt?: string
  completedAt?: string
  createdAt: string
  updatedAt: string
}

// ─── MBA Month ───────────────────────────────────────────────────────────────

export interface ChecklistItem {
  id: string
  label: string
  completed: boolean
}

export interface MBAMonth {
  id: string
  monthNumber: number
  name: string
  focus: string
  goals: string[]
  topics: string[]
  subtopics: Record<string, string[]>
  recommendedCourses: string[]
  assignments: LegacyAssignment[]
  coffeeImplementation: string
  checklist: ChecklistItem[]
  createdAt: string
  updatedAt: string
}

export interface LegacyAssignment {
  id: string
  title: string
  description: string
  dueDate?: string
  status: 'pending' | 'in_progress' | 'completed'
}

// ─── Note ────────────────────────────────────────────────────────────────────

export interface Note {
  id: string
  title: string
  content: string
  tags: string[]
  courseId?: string
  monthId?: string
  isPinned: boolean
  createdAt: string
  updatedAt: string
}

// ─── CoffeePlace Application ─────────────────────────────────────────────────

export interface CoffeeApplication {
  id: string
  title: string
  description: string
  courseId?: string
  monthId?: string
  category: CourseCategory
  status: AppStatus
  impact: ImpactLevel
  expectedOutcome: string
  actualOutcome?: string
  implementedAt?: string
  createdAt: string
  updatedAt: string
}

// ─── Weekly Review (enhanced with learning metrics) ──────────────────────────

export interface WeeklyReview {
  id: string
  weekNumber: number
  weekStartDate: string
  weekEndDate: string
  // CEO Review fields
  wins: string[]
  challenges: string[]
  lessonsLearned: string[]
  coffeeDecisions: string[]
  nextWeekGoals: string[]
  energyLevel: 1 | 2 | 3 | 4 | 5
  overallRating: 1 | 2 | 3 | 4 | 5
  notes: string
  // Learning metrics (added in v2 — optional for backward compat)
  hoursStudied?: number
  coursesCompleted?: string[]     // Course names completed this week
  assignmentsCompleted?: string[] // Assignment titles completed this week
  examsTaken?: string[]           // Exam titles taken this week
  booksRead?: string[]            // Book names finished this week
  conceptsLearned?: string[]
  conceptsWeak?: string[]
  conceptsStrong?: string[]
  coffeeImplementations?: string[]
  nextWeekFocus?: string[]
  createdAt: string
  updatedAt: string
}

// ─── Settings ────────────────────────────────────────────────────────────────

export interface Settings {
  founderName: string
  brandName: string
  startDate: string
  currentMonth: number
  theme: 'light' | 'dark'
}

// ═══════════════════════════════════════════════════════════════════════════════
// NEW TYPES — MBA Execution Platform v2
// ═══════════════════════════════════════════════════════════════════════════════

// ─── MBA Knowledge Map ───────────────────────────────────────────────────────

export interface KnowledgeTopic {
  id: string
  name: string
  subtopics: string[]
  learningObjectives: string[]
  requiredSkills: string[]
  difficulty: DifficultyLevel
  completed: boolean
  notes: string
  estimatedHours: number
}

export interface KnowledgeCategory {
  id: string
  name: CourseCategory
  icon: string
  description: string
  topics: KnowledgeTopic[]
  completionPercentage: number   // derived
  updatedAt: string
}

// ─── Skill Scorecard ─────────────────────────────────────────────────────────

export interface SkillEvidence {
  id: string
  type: 'course' | 'assignment' | 'exam' | 'implementation' | 'reading' | 'manual'
  description: string
  pointsAdded: number
  date: string
  refId?: string
}

export interface SkillScore {
  id: string
  category: CourseCategory
  currentScore: number       // 0-100
  targetScore: number        // 0-100
  previousScore: number      // for trend
  evidence: SkillEvidence[]
  lastUpdated: string
}

// ─── Assignment System ───────────────────────────────────────────────────────

export interface Assignment {
  id: string
  title: string
  topicId?: string
  topicName?: string
  categoryId: string
  category: CourseCategory
  description: string
  dueDate?: string
  status: AssignmentStatus
  score?: number             // 0-100
  maxScore: number
  notes: string
  coffeeImplementation: string
  submittedAt?: string
  gradedAt?: string
  createdAt: string
  updatedAt: string
}

// ─── Case Study Library ───────────────────────────────────────────────────────

export interface CaseStudy {
  id: string
  company: string
  industry: string
  category: CourseCategory
  founded?: string
  headquarters?: string
  summary: string
  keyLessons: string[]
  strengths: string[]
  weaknesses: string[]
  coffeeApplications: string[]
  isSeeded: boolean
  createdAt: string
  updatedAt: string
}

// ─── Exam System ─────────────────────────────────────────────────────────────


// ─── Rubric Grading ───────────────────────────────────────────────────────────

export interface RubricCriterion {
  id: string
  label: string
  description: string
  maxPoints: number
}

export type QuestionType = 'mcq' | 'practical' | 'case'

export interface ExamQuestion {
  id: string
  type: QuestionType
  question: string
  options?: string[]          // MCQ only
  correctAnswer?: string      // MCQ: option text
  explanation?: string        // Shown on MCQ review
  points: number
  rubricCriteria?: RubricCriterion[]   // Practical/case: grading criteria
  modelAnswer?: string                  // Guidance shown after submission
}

export interface Exam {
  id: string
  title: string
  category: CourseCategory
  description: string
  questions: ExamQuestion[]
  passingScore: number       // 0-100
  timeLimit?: number         // minutes
  createdAt: string
  updatedAt: string
}

export interface ExamAttempt {
  id: string
  examId: string
  examTitle: string
  category: CourseCategory
  answers: Record<string, string>              // questionId → answer text
  score: number                                // 0-100 — MCQ only until rubricCompleted
  passed: boolean
  weakAreas: string[]
  strongAreas: string[]
  timeTaken?: number                           // minutes
  completedAt: string
  // Rubric self-assessment (practical / case questions)
  rubricScores?: Record<string, Record<string, number>>  // questionId → criterionId → 0–5
  reflectionNotes?: Record<string, string>               // questionId → personal reflection
  rubricCompleted?: boolean                              // true once user saves rubric assessment
}

// ─── Books ────────────────────────────────────────────────────────────────────

export interface Book {
  id: string
  name: string
  author: string
  category: CourseCategory
  totalPages?: number
  currentPage?: number
  progress: number           // 0-100
  status: 'want_to_read' | 'reading' | 'completed' | 'dropped'
  summary: string
  notes: string
  actionItems: string[]
  coffeeApplications: string[]
  rating: 0 | 1 | 2 | 3 | 4 | 5
  startedAt?: string
  completedAt?: string
  createdAt: string
  updatedAt: string
}

// ─── Monthly Review ───────────────────────────────────────────────────────────

export interface SkillScoreSnapshot {
  category: CourseCategory
  scoreAtStart: number
  scoreAtEnd: number
  delta: number
}

export interface MonthlyReview {
  id: string
  monthNumber: number
  year: number
  mbaMonthName?: string
  topicsCompleted: string[]
  coursesCompleted: string[]
  booksRead: string[]
  assignmentsFinished: string[]
  examsTaken: string[]
  hoursStudied: number
  skillScoreChanges: SkillScoreSnapshot[]
  keyLessons: string[]
  coffeeImprovements: string[]
  overallRating: 1 | 2 | 3 | 4 | 5
  notes: string
  createdAt: string
  updatedAt: string
  // Performance Summary — auto-populated, editable before save (v1.5)
  biggestWin?: string
  biggestWeakness?: string
  mostImprovedSkill?: string        // derived from skill evidence in month
  leastImprovedSkill?: string       // derived from skill evidence in month
  recommendedFocus?: string
  // Calculated stats — stored for history display
  avgExamScore?: number             // average score of exams taken this month
  totalSkillPointsGained?: number   // sum of all skill evidence points this month
}

// ─── Founder Readiness ────────────────────────────────────────────────────────

export interface ReadinessDimension {
  category: CourseCategory
  score: number              // 0-100
  weight: number             // % of total
  evidence: string
}

export interface ReadinessAssessment {
  id: string
  founderReadinessScore: number    // 0-100 weighted composite
  launchReadinessScore: number     // 0-100 operational focus
  dimensions: ReadinessDimension[]
  strengths: string[]
  weaknesses: string[]
  recommendations: string[]
  nextMilestone: string
  createdAt: string
}

// ─── WeeklyLearningReview — DEPRECATED: merged into WeeklyReview ─────────────
// @deprecated Use WeeklyReview instead

export interface WeeklyLearningReview {
  id: string
  weekNumber: number
  weekStartDate: string
  weekEndDate: string
  // Learning
  conceptsLearned: string[]
  conceptsWeak: string[]
  conceptsStrong: string[]
  coffeeImplementations: string[]
  nextWeekFocus: string[]
  hoursStudied: number
  coursesCompleted: string[]
  assignmentsCompleted: string[]
  // Legacy fields
  wins: string[]
  challenges: string[]
  energyLevel: 1 | 2 | 3 | 4 | 5
  overallRating: 1 | 2 | 3 | 4 | 5
  notes: string
  createdAt: string
  updatedAt: string
}
