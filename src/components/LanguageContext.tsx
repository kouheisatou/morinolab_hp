"use client";

import { createContext, useContext, useState, useEffect } from 'react'
import type { ReactNode } from 'react'

export type Lang = 'en' | 'ja'

interface LangCtx {
  lang: Lang
  toggle: () => void
  setLanguage: (lang: Lang) => void
}

const LanguageContext = createContext<LangCtx | undefined>(undefined)

export const LanguageProvider = ({ children }: { children: ReactNode }) => {
  const [lang, setLangState] = useState<Lang>('en')

  // Detect browser language on client after mount to avoid hydration mismatch
  useEffect(() => {
    const preferred = navigator.language.startsWith('ja') ? 'ja' : 'en'
    setLangState(preferred)
  }, [])

  const toggle = () => setLangState((l) => (l === 'en' ? 'ja' : 'en'))
  const setLanguage = (l: Lang) => setLangState(l)

  return (
    <LanguageContext.Provider value={{ lang, toggle, setLanguage }}>
      {children}
    </LanguageContext.Provider>
  )
}

export const useLang = () => {
  const ctx = useContext(LanguageContext)
  if (!ctx) throw new Error('useLang must be within LanguageProvider')
  return ctx
} 