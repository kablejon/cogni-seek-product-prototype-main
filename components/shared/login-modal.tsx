"use client"

import { useState, useCallback } from "react"
import { useTranslations } from "next-intl"
import { Github, Loader2, X } from "lucide-react"
import { Link } from "@/lib/navigation"
import { createClient } from "@/lib/supabase/client"

const supabase = createClient()

interface LoginModalProps {
  open: boolean
  onClose: () => void
}

export function LoginModal({ open, onClose }: LoginModalProps) {
  const t = useTranslations('auth')
  const [signingIn, setSigningIn] = useState<'google' | 'github' | null>(null)

  const handleSignIn = useCallback(async (provider: 'google' | 'github') => {
    setSigningIn(provider)
    const callbackUrl = `${window.location.origin}/auth/callback`
    await supabase.auth.signInWithOAuth({
      provider,
      options: { redirectTo: callbackUrl },
    })
    setTimeout(() => setSigningIn(null), 8000)
  }, [])

  if (!open) return null

  return (
    /* Backdrop */
    <div
      className="fixed inset-0 z-[100] flex items-center justify-center p-4"
      onClick={(e) => e.target === e.currentTarget && onClose()}
    >
      {/* Blurred dark overlay */}
      <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" />

      {/* Modal card */}
      <div className="relative z-10 w-full max-w-sm rounded-2xl border border-white/10 bg-[#0d1526]/95 backdrop-blur-xl shadow-2xl shadow-black/50 overflow-hidden animate-in fade-in zoom-in-95 duration-200">

        {/* Close button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 w-7 h-7 flex items-center justify-center rounded-full text-white/40 hover:text-white hover:bg-white/10 transition-all"
        >
          <X className="w-4 h-4" />
        </button>

        {/* Header */}
        <div className="px-8 pt-8 pb-6 text-center">
          {/* Logo mark */}
          <div className="w-12 h-12 rounded-2xl bg-[var(--holo-blue)]/20 border border-[var(--holo-blue)]/30 flex items-center justify-center mx-auto mb-4">
            <span className="text-[var(--holo-blue)] font-bold text-xl">C</span>
          </div>
          <h2 className="text-xl font-bold text-white">{t('modalTitle')}</h2>
          <p className="text-sm text-white/50 mt-1.5">{t('modalSubtitle')}</p>
        </div>

        {/* Buttons */}
        <div className="px-8 pb-6 space-y-3">
          {/* Google */}
          <button
            onClick={() => handleSignIn('google')}
            disabled={signingIn !== null}
            className="w-full flex items-center justify-center gap-3 px-4 py-3 rounded-xl
              bg-white text-gray-800 font-medium text-sm
              hover:bg-gray-100 active:scale-[0.98]
              transition-all duration-150
              disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {signingIn === 'google' ? (
              <Loader2 className="w-4 h-4 animate-spin text-gray-500" />
            ) : (
              <svg className="w-4 h-4 flex-shrink-0" viewBox="0 0 24 24">
                <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/>
                <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
                <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l3.66-2.84z" fill="#FBBC05"/>
                <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/>
              </svg>
            )}
            <span>{signingIn === 'google' ? t('redirecting') : t('signInWithGoogle')}</span>
          </button>

          {/* Divider */}
          <div className="flex items-center gap-3">
            <div className="flex-1 h-px bg-white/10" />
            <span className="text-xs text-white/30 font-mono">{t('orDivider')}</span>
            <div className="flex-1 h-px bg-white/10" />
          </div>

          {/* GitHub */}
          <button
            onClick={() => handleSignIn('github')}
            disabled={signingIn !== null}
            className="w-full flex items-center justify-center gap-3 px-4 py-3 rounded-xl
              bg-[#24292e] text-white font-medium text-sm
              hover:bg-[#2f363d] active:scale-[0.98]
              transition-all duration-150
              disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {signingIn === 'github' ? (
              <Loader2 className="w-4 h-4 animate-spin" />
            ) : (
              <Github className="w-4 h-4 flex-shrink-0" />
            )}
            <span>{signingIn === 'github' ? t('redirecting') : t('signInWithGithub')}</span>
          </button>
        </div>

        {/* Footer */}
        <div className="px-8 pb-6 text-center">
          <p className="text-[11px] text-white/25 leading-relaxed">
            {t('termsNote')}{' '}
            <Link href="/terms" className="text-white/40 underline underline-offset-2 hover:text-white/60 transition-colors">
              {t('terms')}
            </Link>
            {' '}{t('and')}{' '}
            <Link href="/privacy" className="text-white/40 underline underline-offset-2 hover:text-white/60 transition-colors">
              {t('privacy')}
            </Link>
          </p>
        </div>
      </div>
    </div>
  )
}
