"use client"

import Link from "next/link"
import Image from "next/image"
import { useSearchStore } from "@/lib/store"
import { LanguageSwitcher } from "./language-switcher"
import { LoginModal } from "./login-modal"
import { useTranslations } from "next-intl"
import { useEffect, useRef, useState, useCallback } from "react"
import { createClient } from "@/lib/supabase/client"
import type { User } from "@supabase/supabase-js"
import { LogOut, ChevronDown, BadgeCheck, ShieldAlert } from "lucide-react"

const supabase = createClient()

interface HeaderProps {
  currentStep?: number
  totalSteps?: number
  showProgress?: boolean
}

export function Header({ currentStep, totalSteps = 6, showProgress = false }: HeaderProps) {
  const { resetSession } = useSearchStore()
  const t = useTranslations('auth')
  const [user, setUser] = useState<User | null>(null)
  const [authLoading, setAuthLoading] = useState(true)
  const [dropdownOpen, setDropdownOpen] = useState(false)
  const [loginModalOpen, setLoginModalOpen] = useState(false)
  const dropdownRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setUser(session?.user ?? null)
      setAuthLoading(false)
    })

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user ?? null)
    })

    return () => subscription.unsubscribe()
  }, [])

  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        setDropdownOpen(false)
      }
    }
    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  const handleSignOut = useCallback(async () => {
    setDropdownOpen(false)
    await supabase.auth.signOut()
  }, [])

  const avatarUrl = user?.user_metadata?.avatar_url as string | undefined
  const displayName = (
    user?.user_metadata?.full_name ||
    user?.user_metadata?.user_name ||
    user?.email?.split('@')[0]
  ) as string | undefined

  // Detect login provider from identities
  const provider = user?.app_metadata?.provider as string | undefined
  const providerLabel = provider === 'google' ? 'Google' : provider === 'github' ? 'GitHub' : provider ?? '—'
  const isEmailVerified = !!user?.email_confirmed_at

  // Short user ID for display
  const shortId = user?.id ? user.id : '—'

  return (
    <>
      <header className="sticky top-0 z-50 glass border-b border-border/50">
        <div className="container mx-auto px-4 py-3 flex justify-between items-center">
          <Link
            href="/"
            className="flex items-center gap-2.5 group"
            onClick={() => resetSession()}
          >
            <div className="w-9 h-9 rounded-xl bg-primary flex items-center justify-center transition-smooth group-hover:scale-105">
              <span className="text-primary-foreground font-bold text-lg">C</span>
            </div>
            <span className="text-xl font-semibold">CogniSeek</span>
          </Link>

          {showProgress && currentStep && (
            <div className="flex items-center gap-3">
              <div className="hidden sm:flex items-center gap-1.5">
                {Array.from({ length: totalSteps }).map((_, i) => (
                  <div
                    key={i}
                    className={`w-2 h-2 rounded-full transition-smooth ${
                      i + 1 <= currentStep ? 'bg-primary' : 'bg-border'
                    }`}
                  />
                ))}
              </div>
              <span className="text-sm text-muted-foreground font-medium">
                {currentStep}/{totalSteps}
              </span>
            </div>
          )}

          <div className="flex items-center gap-3">
            <LanguageSwitcher />

            {authLoading ? (
              <div className="w-24 h-8 rounded-xl bg-white/5 animate-pulse" />
            ) : user ? (
              /* ── Logged-in: avatar + user info dropdown ── */
              <div className="relative" ref={dropdownRef}>
                <button
                  onClick={() => setDropdownOpen(v => !v)}
                  className="flex items-center gap-2 px-2 py-1.5 rounded-xl hover:bg-white/10 transition-all duration-200"
                >
                  {avatarUrl ? (
                    <Image
                      src={avatarUrl}
                      alt={displayName || 'avatar'}
                      width={28}
                      height={28}
                      className="rounded-full ring-2 ring-[var(--holo-blue)]/40"
                    />
                  ) : (
                    <div className="w-7 h-7 rounded-full bg-[var(--holo-blue)]/30 border border-[var(--holo-blue)]/50 flex items-center justify-center text-xs font-bold text-[var(--holo-blue)]">
                      {displayName?.[0]?.toUpperCase() || 'U'}
                    </div>
                  )}
                  <span className="hidden sm:block text-sm text-white/80 max-w-[90px] truncate">
                    {displayName}
                  </span>
                  <ChevronDown className={`w-3.5 h-3.5 text-white/40 transition-transform duration-200 ${dropdownOpen ? 'rotate-180' : ''}`} />
                </button>

                {dropdownOpen && (
                  <div className="absolute right-0 mt-2 w-72 rounded-2xl border border-white/10 bg-[#0d1526]/98 backdrop-blur-xl shadow-2xl z-50 overflow-hidden animate-in fade-in slide-in-from-top-2 duration-150">

                    {/* User profile header */}
                    <div className="p-5 flex items-center gap-4 border-b border-white/8">
                      {avatarUrl ? (
                        <Image
                          src={avatarUrl}
                          alt={displayName || 'avatar'}
                          width={48}
                          height={48}
                          className="rounded-full ring-2 ring-[var(--holo-blue)]/30 flex-shrink-0"
                        />
                      ) : (
                        <div className="w-12 h-12 rounded-full bg-[var(--holo-blue)]/20 border border-[var(--holo-blue)]/40 flex items-center justify-center text-lg font-bold text-[var(--holo-blue)] flex-shrink-0">
                          {displayName?.[0]?.toUpperCase() || 'U'}
                        </div>
                      )}
                      <div className="min-w-0">
                        <p className="font-semibold text-white text-sm truncate">{displayName}</p>
                        <div className="flex items-center gap-1.5 mt-1">
                          {/* Provider badge */}
                          <span className="inline-flex items-center gap-1 text-[10px] font-medium px-2 py-0.5 rounded-full bg-white/8 text-white/50 border border-white/10">
                            {provider === 'google' && (
                              <svg className="w-2.5 h-2.5" viewBox="0 0 24 24">
                                <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/>
                                <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
                                <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l3.66-2.84z" fill="#FBBC05"/>
                                <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/>
                              </svg>
                            )}
                            {provider === 'github' && (
                              <svg className="w-2.5 h-2.5 fill-white/60" viewBox="0 0 24 24">
                                <path d="M12 0C5.37 0 0 5.37 0 12c0 5.31 3.435 9.795 8.205 11.385.6.105.825-.255.825-.57 0-.285-.015-1.23-.015-2.235-3.015.555-3.795-.735-4.035-1.41-.135-.345-.72-1.41-1.23-1.695-.42-.225-1.02-.78-.015-.795.945-.015 1.62.87 1.845 1.23 1.08 1.815 2.805 1.305 3.495.99.105-.78.42-1.305.765-1.605-2.67-.3-5.46-1.335-5.46-5.925 0-1.305.465-2.385 1.23-3.225-.12-.3-.54-1.53.12-3.18 0 0 1.005-.315 3.3 1.23.96-.27 1.98-.405 3-.405s2.04.135 3 .405c2.295-1.56 3.3-1.23 3.3-1.23.66 1.65.24 2.88.12 3.18.765.84 1.23 1.905 1.23 3.225 0 4.605-2.805 5.625-5.475 5.925.435.375.81 1.095.81 2.22 0 1.605-.015 2.895-.015 3.3 0 .315.225.69.825.57A12.02 12.02 0 0 0 24 12c0-6.63-5.37-12-12-12z"/>
                              </svg>
                            )}
                            {providerLabel}
                          </span>
                          <span className="text-[10px] text-white/40 truncate max-w-[120px]">{user.email}</span>
                        </div>
                      </div>
                    </div>

                    {/* Info rows */}
                    <div className="px-5 py-3 space-y-3">
                      {/* User ID */}
                      <div className="flex items-start justify-between gap-3">
                        <span className="text-xs text-white/40 flex-shrink-0 pt-0.5">{t('userId')}</span>
                        <span className="text-xs text-white/70 font-mono text-right break-all leading-relaxed">{shortId}</span>
                      </div>

                      {/* Email */}
                      <div className="flex items-center justify-between gap-3">
                        <span className="text-xs text-white/40 flex-shrink-0">{t('email')}</span>
                        <span className="text-xs text-white/70 truncate max-w-[160px]">{user.email}</span>
                      </div>

                      {/* Login method */}
                      <div className="flex items-center justify-between gap-3">
                        <span className="text-xs text-white/40 flex-shrink-0">{t('loginMethod')}</span>
                        <span className="text-xs text-white/70">{providerLabel}</span>
                      </div>

                      {/* Email verification */}
                      <div className="flex items-center justify-between gap-3">
                        <span className="text-xs text-white/40 flex-shrink-0">{t('emailVerified')}</span>
                        <span className={`flex items-center gap-1 text-xs font-medium ${isEmailVerified ? 'text-emerald-400' : 'text-amber-400'}`}>
                          {isEmailVerified
                            ? <><BadgeCheck className="w-3.5 h-3.5" />{t('verified')}</>
                            : <><ShieldAlert className="w-3.5 h-3.5" />{t('unverified')}</>
                          }
                        </span>
                      </div>
                    </div>

                    <div className="px-4 pb-3">
                      <Link
                        href="/history"
                        onClick={() => setDropdownOpen(false)}
                        className="w-full inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl text-sm font-medium
                          bg-cyan-500/10 hover:bg-cyan-500/20 border border-cyan-500/20 hover:border-cyan-500/40
                          text-cyan-300 hover:text-cyan-200 transition-all duration-150"
                      >
                        寻找记录
                      </Link>
                    </div>

                    {/* Sign out */}
                    <div className="px-4 pb-4">
                      <button
                        onClick={handleSignOut}
                        className="w-full flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl text-sm font-medium
                          bg-red-500/10 hover:bg-red-500/20 border border-red-500/20 hover:border-red-500/40
                          text-red-400 hover:text-red-300 transition-all duration-150"
                      >
                        <LogOut className="w-4 h-4" />
                        {t('signOut')}
                      </button>
                    </div>
                  </div>
                )}
              </div>
            ) : (
              /* ── Not logged-in: single Sign In button ── */
              <button
                onClick={() => setLoginModalOpen(true)}
                className="flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-medium
                  bg-[var(--holo-blue)]/15 hover:bg-[var(--holo-blue)]/25
                  border border-[var(--holo-blue)]/30 hover:border-[var(--holo-blue)]/50
                  text-[var(--holo-blue)] hover:text-white
                  transition-all duration-200 active:scale-95"
              >
                {t('signIn')}
              </button>
            )}
          </div>
        </div>
      </header>

      {showProgress && currentStep && (
        <div className="h-1 bg-border/50">
          <div
            className="h-full bg-primary transition-all duration-500 ease-out"
            style={{ width: `${(currentStep / totalSteps) * 100}%` }}
          />
        </div>
      )}

      {/* Login modal */}
      <LoginModal open={loginModalOpen} onClose={() => setLoginModalOpen(false)} />
    </>
  )
}
