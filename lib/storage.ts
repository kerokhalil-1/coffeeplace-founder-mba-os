export const STORAGE_KEYS = {
  // V1 — existing
  COURSES:          'coffeeplace_courses',
  MBA_MONTHS:       'coffeeplace_mba_months',
  NOTES:            'coffeeplace_notes',
  APPLICATIONS:     'coffeeplace_applications',
  WEEKLY_REVIEWS:   'coffeeplace_weekly_reviews',
  SETTINGS:         'coffeeplace_settings',

  // V2 — MBA Execution Platform
  KNOWLEDGE:        'coffeeplace_knowledge',
  SKILL_SCORES:     'coffeeplace_skill_scores',
  ASSIGNMENTS:      'coffeeplace_assignments',
  CASE_STUDIES:     'coffeeplace_case_studies',
  EXAMS:            'coffeeplace_exams',
  EXAM_ATTEMPTS:    'coffeeplace_exam_attempts',
  BOOKS:            'coffeeplace_books',
  MONTHLY_REVIEWS:  'coffeeplace_monthly_reviews',
  READINESS:        'coffeeplace_readiness',
  WEEKLY_LEARNING:  'coffeeplace_weekly_learning',
} as const

import type { Settings } from './types'

export const DEFAULT_SETTINGS: Settings = {
  founderName: 'Kero Khalil',
  brandName: 'CoffeePlace',
  startDate: '2025-01-01',
  currentMonth: 1,
  theme: 'light',
}
