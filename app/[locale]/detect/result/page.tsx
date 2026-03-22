"use client"

import { useState, useEffect } from "react"
import { useTranslations, useLocale } from "next-intl"
import { Button } from "@/components/ui/button"
import { Lock, Sparkles, TrendingUp } from "lucide-react"
import { Link } from "@/lib/navigation"
import { useRouter } from "@/lib/navigation"
import { useSearchStore } from "@/lib/store"
import { PRICE_CONFIG } from "@/lib/config/pricing"
import { getDefaultAnalysisResult } from "@/lib/ai-service"
import { InteractiveFog } from "@/components/ui/interactive-fog"

export default function ResultPage() {
  const router = useRouter()
  const t = useTranslations('result')
  const locale = useLocale()
  const { session, analysisResult } = useSearchStore()
  const [mounted, setMounted] = useState(false)
  const [meterValue, setMeterValue] = useState(0)

  useEffect(() => {
    setMounted(true)
    setTimeout(() => { setMeterValue(82.4) }, 500)
  }, [])

  if (!mounted) return null

  const result = analysisResult || getDefaultAnalysisResult(session, locale)

  const getPsychologicalDiagnosis = () => {
    const mood = session.userMood || ''
    const itemColor = session.itemColor || ''

    if (mood === 'angry' || mood === 'anxious' || mood === 'rushed' || mood === 'irritated') {
      return { icon: '🧠', title: t('diagnosis.tunnelVision.title'), content: t('diagnosis.tunnelVision.content'), color: '#FF9F0A' }
    }
    if (itemColor === 'black' || itemColor === 'silver' || itemColor === 'brown') {
      return { icon: '🦎', title: t('diagnosis.camouflage.title'), content: t('diagnosis.camouflage.content'), color: '#2DE1FC' }
    }
    return { icon: '🧠', title: t('diagnosis.memoryDeception.title'), content: t('diagnosis.memoryDeception.content'), color: '#10b981' }
  }

  const diagnosis = getPsychologicalDiagnosis()

  const encryptedClues = [
    { icon: '🔴', level: 'high', title: t('encryptedClues.primary.title'), encrypted: '[█ DATA ENCRYPTED █] *************', hint: t('encryptedClues.primary.hint'), status: t('clueStatus'), color: '#FF4444' },
    { icon: '🟡', level: 'medium', title: t('encryptedClues.secondary.title'), encrypted: '[█ DATA ENCRYPTED █] *************', hint: t('encryptedClues.secondary.hint'), status: t('clueStatus'), color: '#FFD700' },
    { icon: '🟢', level: 'low', title: t('encryptedClues.auxiliary.title'), encrypted: '[█ DATA ENCRYPTED █] *************', hint: t('encryptedClues.auxiliary.hint'), status: t('clueStatus'), color: '#10b981' },
  ]

  return (
    <div className="min-h-screen bg-background relative overflow-hidden">
      <div className="absolute inset-0 z-0">
        <InteractiveFog color="45, 225, 252" />
      </div>

      <header className="sticky top-0 z-50 glass border-b border-border/50">
        <div className="container mx-auto px-4 py-3 flex justify-between items-center">
          <Link href="/" className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-primary flex items-center justify-center">
              <span className="text-primary-foreground font-bold text-lg">C</span>
            </div>
            <span className="text-xl font-semibold">CogniSeek</span>
          </Link>
        </div>
      </header>

      <main className="container mx-auto px-4 py-8 md:py-12 relative z-10">
        <div className="max-w-4xl mx-auto space-y-8">

          {/* Confidence Gauge */}
          <div className="bg-card rounded-3xl border border-border/50 p-8 md:p-12 card-shadow text-center space-y-6">
            <div>
              <h1 className="text-3xl md:text-4xl font-bold mb-2">
                {t('title')} <span className="text-[#2DE1FC]">{t('titleHighlight')}</span>
              </h1>
              <p className="text-sm text-muted-foreground">{t('subtitle')}</p>
            </div>

            <div className="flex justify-center py-6">
              <div className="relative w-80 h-40">
                <svg className="w-full h-full" viewBox="0 0 200 100" xmlns="http://www.w3.org/2000/svg">
                  <path d="M 20 90 A 80 80 0 0 1 180 90" fill="none" stroke="rgba(255,255,255,0.1)" strokeWidth="16" strokeLinecap="round" />
                  <defs>
                    <linearGradient id="meterGradient" x1="0%" y1="0%" x2="100%" y2="0%">
                      <stop offset="0%" stopColor="#FF4444" />
                      <stop offset="50%" stopColor="#FFD700" />
                      <stop offset="100%" stopColor="#2DE1FC" />
                    </linearGradient>
                  </defs>
                  <path d="M 20 90 A 80 80 0 0 1 180 90" fill="none" stroke="url(#meterGradient)" strokeWidth="16" strokeLinecap="round"
                    strokeDasharray="251.2" strokeDashoffset={251.2 - (251.2 * meterValue / 100)}
                    style={{ transition: 'stroke-dashoffset 2s ease-out', filter: 'drop-shadow(0 0 10px rgba(45,225,252,0.8))' }} />
                  <g transform={`rotate(${-90 + (180 * meterValue / 100)} 100 90)`} style={{ transition: 'transform 2s ease-out' }}>
                    <line x1="100" y1="90" x2="100" y2="30" stroke="#2DE1FC" strokeWidth="3" strokeLinecap="round" />
                    <circle cx="100" cy="90" r="5" fill="#2DE1FC" />
                  </g>
                </svg>
                <div className="absolute inset-0 flex items-end justify-center pb-4">
                  <div className="text-center">
                    <div className="text-5xl font-bold text-[#2DE1FC] mb-1" style={{ textShadow: '0 0 20px rgba(45,225,252,0.6)' }}>{meterValue.toFixed(1)}%</div>
                    <div className="text-sm text-muted-foreground">{t('gauge.label')}</div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Psychology Diagnosis */}
          <div className="bg-card rounded-2xl border border-border/50 p-6 md:p-8 card-shadow space-y-4">
            <div className="flex items-center gap-3">
              <div className="flex-shrink-0 w-12 h-12 rounded-full flex items-center justify-center text-2xl"
                style={{ background: `radial-gradient(circle, ${diagnosis.color}20 0%, transparent 70%)`, border: `2px solid ${diagnosis.color}40` }}>
                {diagnosis.icon}
              </div>
              <div>
                <h2 className="text-lg md:text-xl font-bold">{diagnosis.title}</h2>
                <p className="text-xs text-muted-foreground">{t('psychProfile.subtitle')}</p>
              </div>
            </div>
            <div className="p-4 rounded-xl bg-secondary/30 border border-border/30">
              <p className="text-muted-foreground leading-relaxed">{diagnosis.content}</p>
            </div>
          </div>

          {/* Encrypted Clues */}
          <div className="space-y-4">
            <div className="flex items-center gap-2 justify-center">
              <Sparkles className="w-5 h-5 text-[#FFD700]" />
              <h2 className="text-xl font-bold">{t('encryptedSection')}</h2>
            </div>
            {encryptedClues.map((clue, index) => (
              <div key={index} className="bg-card rounded-2xl border border-border/50 p-6 card-shadow space-y-4 relative overflow-hidden">
                <div className="absolute top-0 right-0 px-4 py-1 rounded-bl-xl text-xs font-bold"
                  style={{ background: `${clue.color}20`, color: clue.color, border: `1px solid ${clue.color}40` }}>
                  {clue.level === 'high' ? t('clues.high') : clue.level === 'medium' ? t('clues.medium') : t('clues.low')}
                </div>
                <div className="flex items-start gap-4">
                  <div className="flex-shrink-0 w-10 h-10 rounded-full flex items-center justify-center text-2xl"
                    style={{ background: `${clue.color}20`, boxShadow: `0 0 20px ${clue.color}30` }}>{clue.icon}</div>
                  <div className="flex-1 space-y-3">
                    <h3 className="font-bold">{clue.title}</h3>
                    <div className="p-4 rounded-xl relative overflow-hidden"
                      style={{ background: 'repeating-linear-gradient(0deg, rgba(0,0,0,0.2) 0px, rgba(0,0,0,0.2) 2px, rgba(255,255,255,0.05) 2px, rgba(255,255,255,0.05) 4px)', backdropFilter: 'blur(10px)' }}>
                      <div className="font-mono text-sm text-muted-foreground/50 select-none">{clue.encrypted}</div>
                      <div className="absolute inset-0" style={{ background: 'repeating-conic-gradient(rgba(0,0,0,0.1) 0% 25%, transparent 0% 50%) 50% / 8px 8px', mixBlendMode: 'multiply' }} />
                    </div>
                    <div className="flex items-start gap-2 p-3 rounded-lg bg-secondary/30">
                      <span className="text-xs">💡</span>
                      <p className="text-sm text-muted-foreground flex-1">{clue.hint}</p>
                    </div>
                    <div className="flex items-center gap-2 text-sm font-medium" style={{ color: clue.color }}>
                      <Lock className="w-4 h-4" />
                      <span>{clue.status}</span>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* CTA */}
          <div className="bg-gradient-to-br from-[#2DE1FC]/20 to-[#FFD700]/20 rounded-3xl border-2 border-[#2DE1FC]/40 p-8 text-center space-y-6 relative overflow-hidden">
            <div className="absolute inset-0 opacity-20" style={{ background: 'radial-gradient(circle at 50% 50%, #2DE1FC 0%, transparent 50%)', animation: 'pulse 3s ease-in-out infinite' }} />
            <div className="relative z-10 space-y-4">
              <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-[#FFD700]/20 border border-[#FFD700]/40">
                <TrendingUp className="w-4 h-4 text-[#FFD700]" />
                <span className="text-sm font-bold text-[#FFD700]">{t('limitedOffer')}</span>
              </div>
              <h2 className="text-2xl md:text-3xl font-bold">{t('ctaTitle')}</h2>
              <p className="text-muted-foreground max-w-2xl mx-auto">{t('ctaDesc')}</p>
              <div className="flex items-baseline justify-center gap-2">
                <span className="text-5xl font-bold text-[#2DE1FC]">{PRICE_CONFIG.price}</span>
                <span className="text-muted-foreground line-through">{PRICE_CONFIG.originalPrice}</span>
              </div>
              <Button size="lg" className="rounded-full px-12 text-lg font-bold bg-gradient-to-r from-[#2DE1FC] to-[#10b981] hover:shadow-[0_0_30px_rgba(45,225,252,0.5)] transition-all"
                onClick={() => router.push('/detect/report')}>
                {t('ctaButton')}
              </Button>
              <div className="max-w-2xl mx-auto rounded-2xl border border-border/40 bg-background/50 p-4 text-left space-y-3">
                <p className="text-sm font-medium text-foreground">{t('purchaseNote.title')}</p>
                <ul className="space-y-2 text-sm text-muted-foreground">
                  {['oneTime', 'instantDelivery', 'digitalGoods', 'accountBinding', 'billingSupport', 'noGuarantee'].map((key) => (
                    <li key={key} className="flex items-start gap-2">
                      <span className="mt-0.5 text-[#10b981]">•</span>
                      <span>{t(`purchaseNote.${key}`)}</span>
                    </li>
                  ))}
                </ul>
                <div className="grid gap-2 text-sm text-muted-foreground md:grid-cols-2">
                  {['spot1', 'spot2', 'spot3', 'spot4'].map((key) => (
                    <div key={key} className="rounded-xl border border-border/30 bg-background/40 px-3 py-2">
                      {t(`premiumIncludes.${key}`)}
                    </div>
                  ))}
                </div>
                <p className="text-xs text-muted-foreground">
                  {t('purchaseNote.policyPrefix')}{' '}
                  <Link href="/terms?from=result" className="underline underline-offset-4 hover:text-foreground">{t('purchaseNote.terms')}</Link>
                  {' · '}
                  <Link href="/refund?from=result" className="underline underline-offset-4 hover:text-foreground">{t('purchaseNote.refund')}</Link>
                  {' · '}
                  <Link href="/contact?from=result" className="underline underline-offset-4 hover:text-foreground">{t('purchaseNote.contact')}</Link>
                </p>
              </div>
              <p className="text-sm text-muted-foreground flex items-center justify-center gap-2">
                <span className="text-[#FF9F0A]">⚡️</span>
                {t('urgency').replace('{time}', '2h')}
              </p>
            </div>
          </div>

          {/* Trust Badges */}
          <div className="flex flex-wrap items-center justify-center gap-6 text-sm text-muted-foreground">
            {['rate', 'cases', 'guarantee'].map(key => (
              <div key={key} className="flex items-center gap-2">
                <span className="text-[#10b981]">✓</span>
                <span>{t(`trust.${key}`)}</span>
              </div>
            ))}
          </div>

        </div>
      </main>
    </div>
  )
}
