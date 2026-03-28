"use client"

import { useEffect } from "react"
import { useTranslations } from "next-intl"
import { useRouter } from "@/lib/navigation"
import { useSearchStore } from "@/lib/store"

export default function IntroPage() {
  const router = useRouter()
  const { resetSession } = useSearchStore()
  const t = useTranslations('intro')

  useEffect(() => {
    resetSession()
    
    const timer = setTimeout(() => {
      router.push('/detect/step-0')
    }, 18000)

    return () => clearTimeout(timer)
  }, [router, resetSession])

  return (
    <div className="cinematic-intro-page">
      <div className="stars" />

      <div className="cinematic-container">
        <div className="movie-text scene-1">
          {t('scene1')}
          <span>{t('scene1Sub')}</span>
        </div>

        <div className="movie-text scene-2">
          {t('scene2')}
          <br />
          {t('scene2Sub')}
        </div>

        <div className="movie-text scene-3">
          {t('scene3')}
          <br />
          {t('scene3Sub')}
        </div>

        <div className="movie-text scene-4">
          {t('scene4')}
        </div>
      </div>

      <button
        onClick={() => router.push('/detect/step-0')}
        className="skip-button"
      >
        <span className="skip-button-main">{t('skip')}</span>
        <span className="skip-button-sub">{t('skipSub')}</span>
      </button>
    </div>
  )
}
