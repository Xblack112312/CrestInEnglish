'use client'

import React, { createContext, useContext, useEffect, useMemo, useState } from 'react'

type Lang = 'en' | 'ar'

const translations = {
  ha1: {
    en: '#1 English Platform for Egyptian Students',
    ar: 'المنصة الأولى للغة الإنجليزية للطلاب المصريين',
  },
  welcome: {
    en: 'Master English. Ace Your Exams.',
    ar: 'أتقن اللغة الإنجليزية. حقق أعلى الدرجات في امتحاناتك.',
  },
  description: {
    en: 'A complete English learning platform designed for school students in Egypt. Whether you study in Al-Azhar or General Education, our courses are aligned with your curriculum—so you learn faster and score higher.',
    ar: 'منصة متكاملة لتعليم اللغة الإنجليزية لطلاب المدارس في مصر. سواء كنت تدرس في الأزهر أو التعليم العام، دوراتنا متوافقة مع المنهج—لتتعلم أسرع وتحقق درجات أعلى.',
  },
  getstarted: { en: 'Get Started', ar: 'ابدأ الآن' },
  aboutus: { en: 'About Us', ar: 'اعرف عنا' },
  englishcourse: { en: 'English Courses', ar: 'دورات الإنجليزية' },
  ncay: { en: 'No courses available yet', ar: 'لا توجد دورات متاحة حتى الآن' },
  woss: { en: 'What Our Students Say', ar: 'آراء طلابنا' },

  // NEW (Hero UI)
  browseCourses: { en: 'Browse Courses', ar: 'تصفح الدورات' },
  trustedBy: { en: 'Trusted by students across Egypt', ar: 'موثوق من طلاب في جميع أنحاء مصر' },
  forAzhar: { en: 'Al-Azhar & General Education', ar: 'الأزهر والتعليم العام' },
  recordedLive: { en: 'Recorded + Live lessons', ar: 'حصص مسجلة + مباشرة' },
  examsAligned: { en: 'Exam-focused practice', ar: 'تدريب مركز على الامتحان' },
  support: { en: 'Fast support', ar: 'دعم سريع' },
  students: { en: 'Students', ar: 'طالب' },
  lessons: { en: 'Lessons', ar: 'درس' },
  rating: { en: 'Rating', ar: 'التقييم' },

  langNameEn: { en: 'English', ar: 'الإنجليزية' },
  langNameAr: { en: 'Arabic', ar: 'العربية' },
}

type TranslationKey = keyof typeof translations

type LangContextType = {
  lang: Lang
  t: (key: TranslationKey) => string
  switchLang: (lang: Lang) => void
  isRTL: boolean
}

const LangContext = createContext<LangContextType | null>(null)

export function LanguageProvider({ children }: { children: React.ReactNode }) {
  const [lang, setLang] = useState<Lang>('en')

  const isRTL = lang === 'ar'

  const t = (key: TranslationKey) => translations[key][lang]

  useEffect(() => {
    document.documentElement.dir = isRTL ? 'rtl' : 'ltr'
    document.documentElement.lang = lang
  }, [lang, isRTL])

  const value = useMemo(
    () => ({ lang, t, switchLang: setLang, isRTL }),
    [lang, isRTL]
  )

  return <LangContext.Provider value={value}>{children}</LangContext.Provider>
}

export const useLang = () => {
  const ctx = useContext(LangContext)
  if (!ctx) throw new Error('useLang must be used inside LanguageProvider')
  return ctx
}
