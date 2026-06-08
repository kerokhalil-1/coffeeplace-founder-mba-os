'use client'

import { useEffect } from 'react'
import { runMigrations } from '@/lib/migrations'

/**
 * Invisible client component — runs all pending data migrations once on mount.
 * Safe to render in any layout; produces no DOM output.
 */
export function MigrationRunner() {
  useEffect(() => {
    runMigrations()
  }, [])

  return null
}
