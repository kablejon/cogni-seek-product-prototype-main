"use client"

import Link from "next/link"
import Image from "next/image"
import { useSearchStore } from "@/lib/store"
import { LanguageSwitcher } from "./language-switcher"
import { useTranslations } from "next-intl"
import { useEffect, useRef, useState } from "react"
import { createClient } from "@/lib/supabase/client"
import type { User } from "@supabase/supabase-js"
import { Github, LogOut, ChevronDown } from "lucide-react"

interface HeaderProps {
  currentStep?: number
  totalSteps?: number
  showProgress?: boolean
}

export function Header({ currentStep, totalSteps = 6, showProgress = false }: HeaderProps) {
  const { resetSession } = useSearchStore()
  const t = useTranslations('auth')
  const [user, setUser] = useState<User | null>(null)
  const [dropdownOpen, setDropdownOpen] = useState(false)
  const [loading, setLoading] = useState(true)
  const dropdownRef = useRef<HTMLDivElement>(null)
  const supabase = createClient()

  useEffect(() => {
    // Get initial session
    supabase.auth.getUser().then(({ data: { user } }) => {
      setUser(user)
      setLoading(false)
    })

    // Listen for auth state changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user ?? null)
    })

    return () => subscription.unsubscribe()
  }, [])

  // Close dropdown when clicking outside
  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        setDropdownOpen(false)
      }
    }
    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  const handleSignIn = async () => {
    const callbackUrl = `${window.location.origin}/auth/callback`
    await supabase.auth.signInWithOAuth({
      provider: 'github',
      options: {
        redirectTo: callbackUrl,
      },
    })
  }

  const handleSignOut = async () => {
    await supabase.auth.signOut()
    setDropdownOpen(false)
  }

  const avatarUrl = user?.user_metadata?.avatar_url as string | undefined
  const displayName = (user?.user_metadata?.full_name || user?.user_metadata?.user_name || user?.email?.split('@')[0]) as string | undefined

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

            {/* Auth Section */}
            {loading ? (
              <div className="w-8 h-8 rounded-full bg-white/10 animate-pulse" />
            ) : user ? (
              /* Logged-in: avatar + dropdown */
              <div className="relative" ref={dropdownRef}>
                <button
                  onClick={() => setDropdownOpen(v => !v)}
                  className="flex items-center gap-2 px-2 py-1.5 rounded-xl hover:bg-white/10 transition-all duration-200 group"
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
                  <span className="hidden sm:block text-sm text-white/80 max-w-[100px] truncate">
                    {displayName}
                  </span>
                  <ChevronDown className={`w-3.5 h-3.5 text-white/40 transition-transform duration-200 ${dropdownOpen ? 'rotate-180' : ''}`} />
                </button>

                {dropdownOpen && (
                  <div className="absolute right-0 mt-2 w-48 rounded-xl border border-white/10 bg-[#0B1121]/95 backdrop-blur-xl shadow-2xl py-1 z-50 animate-in fade-in slide-in-from-top-2 duration-200">
                    <div className="px-4 py-2.5 border-b border-white/10">
                      <p className="text-xs text-white/40 font-mono uppercase tracking-wider">Account</p>
                      <p className="text-sm text-white/80 font-medium mt-0.5 truncate">{displayName}</p>
                    </div>
                    <button
                      onClick={handleSignOut}
                      className="w-full flex items-center gap-2.5 px-4 py-2.5 text-sm text-red-400 hover:bg-red-500/10 transition-colors duration-150"
                    >
                      <LogOut className="w-4 h-4" />
                      {t('signOut')}
                    </button>
                  </div>
                )}
              </div>
            ) : (
              /* Not logged-in: GitHub login button */
              <button
                onClick={handleSignIn}
                className="flex items-center gap-2 px-3.5 py-2 rounded-xl text-sm font-medium
                  bg-white/5 hover:bg-white/10 border border-white/15 hover:border-white/30
                  text-white/80 hover:text-white transition-all duration-200 group"
              >
                <Github className="w-4 h-4 group-hover:text-[var(--holo-blue)] transition-colors" />
                <span className="hidden sm:block">{t('signInWithGithub')}</span>
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
    </>
  )
}
