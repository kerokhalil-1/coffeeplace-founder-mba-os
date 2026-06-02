'use client'
import { useState, useEffect, useCallback, useRef } from 'react'
import { doc, getDoc, setDoc, deleteDoc } from 'firebase/firestore'
import { db } from '@/lib/firebase'

const COLLECTION = 'data'
const USER_ID = 'kero'

export function useFirestore<T>(key: string, initialValue: T) {
  const [storedValue, setStoredValue] = useState<T>(initialValue)
  const [initialized, setInitialized] = useState(false)
  const keyRef = useRef(key)

  useEffect(() => {
    const docRef = doc(db, COLLECTION, `${USER_ID}_${key}`)
    getDoc(docRef).then(snap => {
      if (snap.exists()) {
        setStoredValue(snap.data().value as T)
      }
      setInitialized(true)
    }).catch(() => setInitialized(true))
  }, [key])

  const setValue = useCallback((value: T | ((val: T) => T)) => {
    setStoredValue(prev => {
      const valueToStore = value instanceof Function ? value(prev) : value
      const docRef = doc(db, COLLECTION, `${USER_ID}_${keyRef.current}`)
      setDoc(docRef, { value: valueToStore }).catch(console.error)
      return valueToStore
    })
  }, [])

  const removeValue = useCallback(() => {
    const docRef = doc(db, COLLECTION, `${USER_ID}_${keyRef.current}`)
    deleteDoc(docRef).catch(console.error)
    setStoredValue(initialValue)
  }, [initialValue])

  return [storedValue, setValue, initialized, removeValue] as const
}
