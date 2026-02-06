'use client'

import { createContext, useContext, useState, useEffect } from 'react'

type Lang = 'en' | 'ar'

const translations = {
 ha1: {
    en: "#1 English Platform for Egyptian Students",
    ar: "المنصة الأولى للغة الإنجليزية للطلاب المصريين",
 },
  welcome: {
    en: 'Master English. Ace Your Exams.',
    ar: 'أتقن اللغة الإنجليزية. حقق أعلى الدرجات في امتحاناتك.',
  },
  description: {
    en: 'A complete English learning platform designed for school students in Egypt. Whether you study in the Azhar or General Education system, our courses are fully aligned with your curriculum to help you succeed academically and communicate confidently.',
    ar: 'منصة تعليمية متكاملة للغة الإنجليزية مصممة خصيصًا لطلاب المدارس في مصر. سواء كنت تدرس في نظام الأزهر أو التعليم العام، فإن دوراتنا متوافقة تمامًا مع مناهجك الدراسية لمساعدتك على التفوق أكاديميًا والتواصل بثقة.',
  },
  getstarted: {
    en: "Get Started",
    ar: "ابدأ",
  },
  aboutus: {
    en: "About Us",
    ar: "ابدأ",
  },
  englishcourse: {
    en: "English Courses",
    ar: "دورات اللغة الإنجليزية",
  },
  ncay: {
    en: "No courses available yet",
    ar: "لا توجد دورات متاحة حتى الآن"
  },
  woss: {
    en: "What Our Students Say",
    ar: "ما يقوله طلابنا"
  }
}

type TranslationKey = keyof typeof translations

type LangContextType = {
  lang: Lang
  t: (key: TranslationKey) => string
  switchLang: (lang: Lang) => void
}

const LangContext = createContext<LangContextType | null>(null)

export function LanguageProvider({ children }: { children: React.ReactNode }) {
  const [lang, setLang] = useState<Lang>('en')

  const t = (key: TranslationKey) => translations[key][lang]

  useEffect(() => {
    document.documentElement.dir = lang === 'ar' ? 'rtl' : 'ltr'
    document.documentElement.lang = lang
  }, [lang])

  return (
    <LangContext.Provider value={{ lang, t, switchLang: setLang }}>
      {children}
    </LangContext.Provider>
  )
}

export const useLang = () => {
  const ctx = useContext(LangContext)
  if (!ctx) throw new Error('useLang must be used inside LanguageProvider')
  return ctx
}
