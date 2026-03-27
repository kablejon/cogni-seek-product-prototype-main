"use client"

import { useEffect, useRef, useState } from 'react'
import { useLocale } from 'next-intl'
import { usePathname, useRouter } from '@/lib/navigation'
import { Globe } from 'lucide-react'

const LOCALES = [
  { id: 'en', label: 'EN' },
  { id: 'zh-CN', label: '简中' },
  { id: 'zh-TW', label: '繁中' },
] as const

export function LanguageSwitcher() {
  const locale = useLocale()
  const router = useRouter()
  const pathname = usePathname()
  const [open, setOpen] = useState(false)
  const wrapperRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (wrapperRef.current && !wrapperRef.current.contains(event.target as Node)) {
        setOpen(false)
      }
    }
    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  const active = LOCALES.find((item) => item.id === locale) || LOCALES[0]

  const handleSelect = (nextLocale: string) => {
    setOpen(false)
    if (nextLocale === locale) return
    router.replace(pathname, { locale: nextLocale })
  }

  return (
    <div className="relative" ref={wrapperRef}>
      <button
        onClick={() => setOpen((v) => !v)}
        className="flex items-center gap-1.5 px-3 py-1.5 text-sm text-cyan-300 border border-cyan-500/30 rounded-full bg-cyan-950/20 hover:bg-cyan-900/40 transition-colors"
      >
        <Globe className="w-4 h-4" />
        <span>{active.label}</span>
      </button>

      {open && (
        <div className="absolute right-0 mt-2 w-28 rounded-xl border border-cyan-500/25 bg-[#0d1526]/95 backdrop-blur-xl shadow-xl overflow-hidden z-50">
          {LOCALES.map((item) => {
            const isActive = item.id === locale
            return (
              <button
                key={item.id}
                onClick={() => handleSelect(item.id)}
                className={`w-full text-left px-3 py-2 text-sm transition-colors ${
                  isActive
                    ? 'bg-cyan-500/20 text-cyan-200'
                    : 'text-slate-200 hover:bg-cyan-500/10 hover:text-white'
                }`}
              >
                {item.label}
              </button>
            )
          })}
        </div>
      )}
    </div>
  )
}
