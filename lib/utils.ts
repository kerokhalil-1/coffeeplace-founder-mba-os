import { clsx, type ClassValue } from 'clsx'
import { twMerge } from 'tailwind-merge'

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function generateId(): string {
  return `${Date.now()}-${Math.random().toString(36).slice(2, 9)}`
}

export function formatDate(iso: string): string {
  return new Date(iso).toLocaleDateString('en-US', {
    month: 'short', day: 'numeric', year: 'numeric'
  })
}

export function formatShortDate(iso: string): string {
  return new Date(iso).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })
}

/**
 * Format a Date as YYYY-MM-DD using LOCAL calendar date.
 * Avoids the off-by-one that toISOString().split('T')[0] produces in
 * positive UTC-offset timezones (e.g. Africa/Cairo, Asia/Dubai).
 */
export function toLocalDateStr(date: Date = new Date()): string {
  const y = date.getFullYear()
  const m = String(date.getMonth() + 1).padStart(2, '0')
  const d = String(date.getDate()).padStart(2, '0')
  return `${y}-${m}-${d}`
}

export function getWeekNumber(date: Date = new Date()): number {
  const start = new Date(date.getFullYear(), 0, 1)
  const diff = date.getTime() - start.getTime()
  return Math.ceil((diff / 86400000 + start.getDay() + 1) / 7)
}

export function getWeekRange(weekStart: Date): { start: string; end: string } {
  const end = new Date(weekStart)
  end.setDate(end.getDate() + 6)
  return {
    start: toLocalDateStr(weekStart),
    end: toLocalDateStr(end)
  }
}

export function percentOf(value: number, total: number): number {
  if (total === 0) return 0
  return Math.round((value / total) * 100)
}

export function statusLabel(status: string): string {
  return status.replace(/_/g, ' ').replace(/\b\w/g, c => c.toUpperCase())
}

export function truncate(str: string, len: number): string {
  return str.length > len ? str.slice(0, len) + '…' : str
}

// ─── Founder Score — shared weighted formula ──────────────────────────────────
// Single source of truth used by Dashboard, Skills, Readiness, and any future
// recommendation logic. Changing weights here updates all displays simultaneously.

import type { SkillScore } from './types'

/**
 * Weights for the Founder Readiness Score.
 * Reflect how much each discipline contributes to running a multi-branch
 * specialty coffee business. Total = 120 (intentionally > 100 so that only
 * the relative ratios matter — weightedScore normalises by totalWeight).
 */
export const FOUNDER_WEIGHTS: Record<string, number> = {
  Finance: 15, Accounting: 8, Operations: 14, Marketing: 10, Branding: 8,
  Leadership: 12, Entrepreneurship: 10, Strategy: 10, HR: 5,
  Analytics: 5, Negotiation: 4, Sales: 5, 'Customer Experience': 5, Expansion: 4,
}

/**
 * Weights for the CoffeePlace Launch Readiness Score.
 * Heavier on operational and financial disciplines needed at launch.
 * Total = 100.
 */
export const LAUNCH_WEIGHTS: Record<string, number> = {
  Finance: 20, Operations: 25, Marketing: 15, 'Customer Experience': 12,
  HR: 8, Strategy: 8, Sales: 7, Branding: 5,
}

/**
 * Compute a weighted composite score from 0–100.
 * Skills with a category not in `weights` contribute 0.
 * Returns 0 if no weighted categories are present.
 */
export function weightedScore(skills: SkillScore[], weights: Record<string, number>): number {
  let totalWeight = 0
  let weightedSum = 0
  skills.forEach(s => {
    const w = weights[s.category] ?? 0
    totalWeight += w
    weightedSum += s.currentScore * w
  })
  return totalWeight ? Math.round(weightedSum / totalWeight) : 0
}

/**
 * Compute the Founder Readiness Score for a set of skill scores.
 * Convenience wrapper around weightedScore + FOUNDER_WEIGHTS so call sites
 * don't need to import or pass the weights explicitly.
 *
 * Returns 0–100 (rounded). Identical formula to what Readiness uses.
 */
export function calculateFounderScore(skills: SkillScore[]): number {
  return weightedScore(skills, FOUNDER_WEIGHTS)
}
