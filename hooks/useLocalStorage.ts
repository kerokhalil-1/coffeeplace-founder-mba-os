'use client'
import { useState, useEffect, useCallback } from 'react'

export function useFirestore<T>(key: string, initialValue: T) {
  const [storedValue, setStoredValue] = useState<T>(initialValue)
  const [initialized, setInitialized] = useState(false)

  useEffect(() => {
    try {
      const item = window.localStorage.getItem(key)
      if (item) {
        setStoredValue(JSON.parse(item))
      }
    } catch (err) {
      console.warn(`useFirestore read error for key "${key}":`, err)
    }
    setInitialized(true)
  }, [key])

  const setValue = useCallback((value: T | ((val: T) => T)) => {
    try {
      const valueToStore = value instanceof Function ? value(storedValue) : value
      setStoredValue(valueToStore)
      window.localStorage.setItem(key, JSON.stringify(valueToStore))
    } catch (err) {
      console.warn(`useFirestore write error for key "${key}":`, err)
    }
  }, [key, storedValue])

  const removeValue = useCallback(() => {
    try {
      window.localStorage.removeItem(key)
      setStoredValue(initialValue)
    } catch (err) {
      console.warn(`useFirestore remove error for key "${key}":`, err)
    }
  }, [key, initialValue])

  return [storedValue, setValue, initialized, removeValue] as const
}
