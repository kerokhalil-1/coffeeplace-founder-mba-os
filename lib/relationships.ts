/**
 * Knowledge Relationship Engine
 *
 * Pure functions — no React, no side effects.
 * Given a KnowledgeTopic + its parent category + all entity arrays,
 * returns the set of related items from each entity type.
 *
 * Matching rules (applied in priority order):
 *   Tier 1 — Exact ID link:    assignment.topicId === topic.id
 *   Tier 2 — Category match:   entity.category === category  (courses, assignments, exams, books)
 *   Tier 3 — Name/text match:  topic name or subtopic appears in entity fields
 *   Tier 4 — Indirect link:    note linked to a course that is in the related set
 */

import type {
  KnowledgeTopic,
  CourseCategory,
  Course,
  Assignment,
  Exam,
  Note,
  Book,
} from './types'

// ─── Types ────────────────────────────────────────────────────────────────────

export interface RelatedResult {
  courses:     Course[]
  assignments: Assignment[]
  exams:       Exam[]
  notes:       Note[]
  books:       Book[]
}

// ─── Text utilities ───────────────────────────────────────────────────────────

function norm(s: string): string {
  return s.toLowerCase().replace(/[^\w\s]/g, ' ').trim()
}

/**
 * Returns true if `needle` meaningfully appears inside `haystack`.
 * Requires needle to be ≥ 4 chars to avoid false matches on prepositions.
 */
function contains(haystack: string, needle: string): boolean {
  const h = norm(haystack)
  const n = norm(needle)
  return n.length >= 4 && h.includes(n)
}

/**
 * True if the topic name OR any of its subtopics (≥4 chars) appears in `text`.
 */
function topicInText(topic: KnowledgeTopic, text: string): boolean {
  if (contains(text, topic.name)) return true
  return topic.subtopics.some(sub => contains(text, sub))
}

/**
 * True if any string in `terms` contains topicName or is contained by it.
 * Used for topicsCovered arrays and note tags.
 */
function termsOverlap(terms: string[], topic: KnowledgeTopic): boolean {
  const topicN = norm(topic.name)
  return terms.some(term => {
    const t = norm(term)
    if (t.length < 3) return false
    return t.includes(topicN) || topicN.includes(t) ||
      topic.subtopics.some(sub => {
        const s = norm(sub)
        return s.length >= 4 && (t.includes(s) || s.includes(t))
      })
  })
}

// ─── Per-entity finders ───────────────────────────────────────────────────────

/** Category match (primary) + topicsCovered text match (secondary). */
export function findRelatedCourses(
  topic: KnowledgeTopic,
  category: CourseCategory,
  courses: Course[],
): Course[] {
  const seen = new Set<string>()
  const results: Course[] = []
  for (const c of courses) {
    if (seen.has(c.id)) continue
    const matches =
      c.category === category ||
      termsOverlap(c.topicsCovered, topic)
    if (matches) { seen.add(c.id); results.push(c) }
  }
  return results
}

/** topicId exact (Tier 1) + category (Tier 2) + topicName text (Tier 3). */
export function findRelatedAssignments(
  topic: KnowledgeTopic,
  category: CourseCategory,
  assignments: Assignment[],
): Assignment[] {
  const seen = new Set<string>()
  const tier1: Assignment[] = []
  const tier2: Assignment[] = []

  for (const a of assignments) {
    if (seen.has(a.id)) continue
    if (a.topicId === topic.id) {
      seen.add(a.id); tier1.push(a); continue
    }
    const matches =
      a.category === category ||
      (a.topicName != null && topicInText(topic, a.topicName))
    if (matches) { seen.add(a.id); tier2.push(a) }
  }
  return [...tier1, ...tier2]
}

/** Category match only — exams are category-level tests. */
export function findRelatedExams(
  category: CourseCategory,
  exams: Exam[],
): Exam[] {
  const seen = new Set<string>()
  return exams.filter(e => {
    if (seen.has(e.id)) return false
    if (e.category === category) { seen.add(e.id); return true }
    return false
  })
}

/** Category match only — books are category-level resources. */
export function findRelatedBooks(
  category: CourseCategory,
  books: Book[],
): Book[] {
  const seen = new Set<string>()
  return books.filter(b => {
    if (seen.has(b.id)) return false
    if (b.category === category) { seen.add(b.id); return true }
    return false
  })
}

/**
 * Notes don't have a category field, so we match via:
 *   Tier 1 — courseId points to a related course
 *   Tier 2 — tags overlap with topic name / subtopics
 *   Tier 3 — title contains topic name
 * Content matching is intentionally excluded (too noisy and slow).
 */
export function findRelatedNotes(
  topic: KnowledgeTopic,
  relatedCourseIds: Set<string>,
  notes: Note[],
): Note[] {
  const seen = new Set<string>()
  const results: Note[] = []
  for (const n of notes) {
    if (seen.has(n.id)) continue
    const matches =
      (n.courseId != null && relatedCourseIds.has(n.courseId)) ||
      termsOverlap(n.tags, topic) ||
      topicInText(topic, n.title)
    if (matches) { seen.add(n.id); results.push(n) }
  }
  return results
}

// ─── Aggregate finder ─────────────────────────────────────────────────────────

export interface EntityCollections {
  courses:     Course[]
  assignments: Assignment[]
  exams:       Exam[]
  notes:       Note[]
  books:       Book[]
}

/**
 * Main entry point.
 * Pass in the topic, its parent category, and all entity arrays.
 * Returns deduplicated related items for each entity type.
 */
export function findRelated(
  topic: KnowledgeTopic,
  category: CourseCategory,
  all: EntityCollections,
): RelatedResult {
  const courses     = findRelatedCourses(topic, category, all.courses)
  const assignments = findRelatedAssignments(topic, category, all.assignments)
  const exams       = findRelatedExams(category, all.exams)
  const books       = findRelatedBooks(category, all.books)
  // Notes use course IDs from the already-computed related courses
  const courseIdSet = new Set(courses.map(c => c.id))
  const notes       = findRelatedNotes(topic, courseIdSet, all.notes)
  return { courses, assignments, exams, notes, books }
}
