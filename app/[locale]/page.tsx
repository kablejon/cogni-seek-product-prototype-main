"use client"

import { useTranslations } from "next-intl"
import { useSearchParams } from "next/navigation"
import { useEffect, Suspense } from "react"
import { Link } from "@/lib/navigation"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { InteractiveFog } from "@/components/ui/interactive-fog"
import { Header } from "@/components/shared/header"
import { toast } from "sonner"
import {
  Brain, MapPin, Clock, Zap, Shield, ChevronRight, Search,
  TrendingUp, Star, Eye, Waves
} from "lucide-react"

// Separate component for search params reading (requires Suspense in App Router)
function AuthToastHandler() {
  const ta = useTranslations('auth')
  const searchParams = useSearchParams()

  useEffect(() => {
    if (searchParams.get('authRequired') === '1') {
      toast.info(ta('loginRequired'), {
        description: ta('loginRequiredDesc'),
        duration: 5000,
      })
    }
    if (searchParams.get('authError') === '1') {
      toast.error(ta('authError'))
    }
  }, [searchParams])

  return null
}

export default function HomePage() {
  const t = useTranslations('home')
  const tc = useTranslations('common')

  const features = [
    { icon: Brain, key: 'psychology', color: 'from-violet-500/20 to-purple-500/10', border: 'border-violet-500/30' },
    { icon: MapPin, key: 'spatial', color: 'from-cyan-500/20 to-blue-500/10', border: 'border-cyan-500/30' },
    { icon: Clock, key: 'temporal', color: 'from-emerald-500/20 to-teal-500/10', border: 'border-emerald-500/30' },
    { icon: Eye, key: 'vision', color: 'from-amber-500/20 to-orange-500/10', border: 'border-amber-500/30' },
    { icon: Waves, key: 'entropy', color: 'from-rose-500/20 to-pink-500/10', border: 'border-rose-500/30' },
    { icon: Zap, key: 'instant', color: 'from-yellow-500/20 to-amber-500/10', border: 'border-yellow-500/30' },
  ]

  const stats = [
    { key: 'rate', icon: TrendingUp, color: 'text-emerald-400' },
    { key: 'cases', icon: Search, color: 'text-cyan-400' },
    { key: 'time', icon: Clock, color: 'text-violet-400' },
  ]

  return (
    <div className="min-h-screen bg-background flex flex-col">
      <Suspense fallback={null}>
        <AuthToastHandler />
      </Suspense>
      <div className="fixed inset-0 z-0">
        <InteractiveFog color="45, 225, 252" />
      </div>

      <Header />

      <main className="flex-1 relative z-10">
        {/* Hero */}
        <section className="container mx-auto px-4 py-16 md:py-24 text-center space-y-8">
          <h1 className="text-4xl md:text-6xl lg:text-7xl font-bold leading-tight animate-fade-in-up">
            {t('heroTitle1')}<br />
            <span className="bg-gradient-to-r from-[#2DE1FC] via-[#10b981] to-[#FFD700] bg-clip-text text-transparent">
              {t('heroTitle2')}
            </span>
          </h1>

          <p className="text-lg md:text-xl text-muted-foreground max-w-3xl mx-auto leading-relaxed animate-fade-in-up delay-100">
            {t('heroSubtitle')}
          </p>

          <div className="flex flex-col sm:flex-row gap-4 justify-center animate-fade-in-up delay-200">
            <Link href="/detect/intro">
              <Button className="h-14 rounded-full px-10 text-lg font-bold bg-gradient-to-r from-[#2DE1FC] to-[#10b981] hover:shadow-[0_0_40px_rgba(45,225,252,0.5)] hover:scale-105 transition-all duration-300 group">
                {t('ctaStart')}
                <ChevronRight className="w-5 h-5 ml-1.5 group-hover:translate-x-1 transition-transform" />
              </Button>
            </Link>
            <Button
              variant="outline"
              className="h-14 rounded-full px-10 text-lg font-semibold border-[#2DE1FC]/40 text-[#2DE1FC] hover:bg-[#2DE1FC]/10 hover:border-[#2DE1FC]/70 hover:shadow-[0_0_20px_rgba(45,225,252,0.15)] transition-all duration-300"
              onClick={() => document.getElementById('how-it-works')?.scrollIntoView({ behavior: 'smooth' })}
            >
              {t('ctaDemo')}
            </Button>
          </div>

          <div className="mt-6 flex justify-center animate-fade-in-up delay-300">
            <div className="inline-flex items-center px-5 py-2.5 rounded-full border border-white/15 bg-white/5 backdrop-blur-md shadow-[0_0_15px_rgba(45,225,252,0.04)] text-sm font-medium text-slate-200/85 tracking-wide">
              {t('pricingHint')}
            </div>
          </div>

          {/* Stats */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 md:gap-5 max-w-4xl mx-auto pt-6 animate-fade-in-up delay-300">
            {stats.map(({ key, icon: Icon, color }) => (
              <div
                key={key}
                className="rounded-2xl border border-white/10 bg-white/[0.03] backdrop-blur-md px-4 py-5 md:px-5 md:py-6 text-center shadow-[0_0_30px_rgba(0,0,0,0.12)] transition-all duration-300 hover:border-white/15 hover:bg-white/[0.045]"
              >
                <div className="flex items-center justify-center mb-2">
                  <div className="flex h-9 w-9 items-center justify-center rounded-full border border-white/10 bg-white/[0.04]">
                    <Icon className={`w-4 h-4 ${color}`} />
                  </div>
                </div>
                <div className={`text-[1.7rem] md:text-[2.15rem] leading-none font-bold tracking-tight ${color}`}>{t(`stats.${key}.value`)}</div>
                <div className="mx-auto mt-2 max-w-[12rem] text-[12px] md:text-[13px] leading-[1.45] font-medium text-slate-300/80 tracking-[0.01em]">
                  {t(`stats.${key}.label`)}
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* Features Grid */}
        <section id="how-it-works" className="container mx-auto px-4 py-12 md:py-16">
          <div className="text-center space-y-3 mb-10">
            <h2 className="text-2xl md:text-3xl font-bold">{t('featuresTitle')}</h2>
            <p className="text-muted-foreground max-w-2xl mx-auto">{t('featuresSubtitle')}</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {features.map(({ icon: Icon, key, color, border }) => (
              <Card key={key} className={`p-6 space-y-4 bg-gradient-to-br ${color} border ${border} hover:scale-[1.02] transition-transform duration-300`}>
                <div className="w-12 h-12 rounded-2xl bg-white/10 flex items-center justify-center">
                  <Icon className="w-6 h-6" />
                </div>
                <div>
                  <h3 className="font-bold text-lg mb-2">{t(`features.${key}.title`)}</h3>
                  <p className="text-sm text-muted-foreground leading-relaxed">{t(`features.${key}.desc`)}</p>
                </div>
              </Card>
            ))}
          </div>
        </section>

        {/* Process Steps */}
        <section className="container mx-auto px-4 py-12 md:py-16">
          <div className="text-center space-y-3 mb-10">
            <h2 className="text-2xl md:text-3xl font-bold">{t('howTitle')}</h2>
            <p className="text-muted-foreground">{t('howSubtitle')}</p>
          </div>

          <div className="max-w-4xl mx-auto grid grid-cols-1 md:grid-cols-4 gap-4">
            {[1, 2, 3, 4].map((step) => (
              <div key={step} className="text-center space-y-3">
                <div className="w-14 h-14 rounded-full bg-gradient-to-br from-[#2DE1FC]/20 to-[#10b981]/10 border border-[#2DE1FC]/30 flex items-center justify-center mx-auto text-xl font-bold text-[#2DE1FC]">
                  {step}
                </div>
                <h3 className="font-semibold">{t(`steps.${step}.title`)}</h3>
                <p className="text-sm text-muted-foreground">{t(`steps.${step}.desc`)}</p>
              </div>
            ))}
          </div>
        </section>

        {/* Example Scenarios */}
        <section className="container mx-auto px-4 py-12 md:py-16">
          <div className="text-center space-y-3 mb-10">
            <h2 className="text-2xl md:text-3xl font-bold">{t('testimonialsTitle')}</h2>
            <p className="text-muted-foreground max-w-2xl mx-auto">{t('testimonialsSubtitle')}</p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 max-w-5xl mx-auto">
            {[
              {
                id: 1,
                border: 'border-cyan-300/24',
                tint: 'bg-[radial-gradient(circle_at_18%_16%,rgba(34,211,238,0.20),transparent_30%),radial-gradient(circle_at_72%_78%,rgba(56,189,248,0.10),transparent_28%),linear-gradient(180deg,rgba(13,36,52,0.78),rgba(8,24,36,0.62))]',
                pill: 'border-cyan-300/24 bg-cyan-300/[0.12] text-cyan-100',
                glow: 'bg-cyan-300/14',
              },
              {
                id: 2,
                border: 'border-violet-300/24',
                tint: 'bg-[radial-gradient(circle_at_70%_18%,rgba(167,139,250,0.22),transparent_30%),radial-gradient(circle_at_22%_76%,rgba(129,140,248,0.10),transparent_28%),linear-gradient(180deg,rgba(28,30,63,0.76),rgba(14,18,40,0.62))]',
                pill: 'border-violet-300/24 bg-violet-300/[0.12] text-violet-100',
                glow: 'bg-violet-300/14',
              },
              {
                id: 3,
                border: 'border-emerald-300/24',
                tint: 'bg-[radial-gradient(circle_at_80%_20%,rgba(52,211,153,0.20),transparent_30%),radial-gradient(circle_at_24%_78%,rgba(45,212,191,0.10),transparent_28%),linear-gradient(180deg,rgba(14,45,44,0.76),rgba(8,24,24,0.60))]',
                pill: 'border-emerald-300/24 bg-emerald-300/[0.12] text-emerald-100',
                glow: 'bg-emerald-300/14',
              },
            ].map(({ id, border, tint, pill, glow }) => (
              <Card
                key={id}
                className={`relative overflow-hidden rounded-[1.7rem] border ${border} ${tint} p-6 shadow-[0_18px_45px_rgba(0,0,0,0.18)] backdrop-blur-2xl transition-all duration-300 hover:-translate-y-1 hover:shadow-[0_24px_65px_rgba(0,0,0,0.22)]`}
              >
                <div className="absolute inset-0 bg-[linear-gradient(rgba(255,255,255,0.03)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.03)_1px,transparent_1px)] bg-[size:34px_34px] opacity-[0.08]" />
                <div className={`absolute -right-8 top-0 h-28 w-28 rounded-full ${glow} blur-3xl`} />
                <div className="absolute inset-x-[10%] top-0 h-px bg-gradient-to-r from-transparent via-white/45 to-transparent" />
                <div className="absolute inset-[1px] rounded-[calc(1.7rem-1px)] border border-white/6" />

                <div className="relative z-10 space-y-5">
                  <div className={`inline-flex rounded-full border px-4 py-2 text-[11px] font-semibold uppercase tracking-[0.22em] shadow-[inset_0_1px_0_rgba(255,255,255,0.06)] ${pill}`}>
                    {t(`testimonials.${id}.label`)}
                  </div>
                  <p className="min-h-[120px] text-[15px] leading-8 text-slate-100/92 md:min-h-[140px]">
                    {t(`testimonials.${id}.text`)}
                  </p>
                  <div className="pt-2 text-xs font-medium text-slate-300/92">{t(`testimonials.${id}.item`)}</div>
                </div>
              </Card>
            ))}
          </div>
        </section>

        {/* CTA Banner */}
        <section className="container mx-auto px-4 py-12 md:py-16">
          <div className="max-w-5xl mx-auto">
            <div className="relative overflow-hidden rounded-[2.25rem] border border-white/10 bg-[#06111d]/80 p-[1px] shadow-[0_0_0_1px_rgba(255,255,255,0.03),0_35px_120px_rgba(0,0,0,0.48)] backdrop-blur-2xl">
              <div className="relative overflow-hidden rounded-[calc(2.25rem-1px)] border border-white/6 bg-[radial-gradient(circle_at_18%_22%,rgba(99,102,241,0.18),transparent_24%),radial-gradient(circle_at_76%_20%,rgba(45,225,252,0.18),transparent_28%),radial-gradient(circle_at_84%_78%,rgba(16,185,129,0.16),transparent_26%),radial-gradient(circle_at_18%_82%,rgba(245,158,11,0.14),transparent_24%),linear-gradient(180deg,rgba(7,20,31,0.96),rgba(3,11,19,0.94))] px-6 py-8 md:px-10 md:py-10">
                <div className="absolute inset-0 bg-[linear-gradient(rgba(255,255,255,0.025)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.025)_1px,transparent_1px)] bg-[size:32px_32px] opacity-[0.08]" />
                <div className="absolute inset-x-[10%] top-0 h-px bg-gradient-to-r from-transparent via-cyan-300/70 to-transparent" />
                <div className="absolute left-8 top-8 h-36 w-36 rounded-full bg-violet-400/14 blur-3xl" />
                <div className="absolute right-10 top-10 h-40 w-40 rounded-full bg-cyan-400/16 blur-3xl" />
                <div className="absolute bottom-0 left-1/2 h-32 w-[58%] -translate-x-1/2 rounded-full bg-cyan-400/8 blur-3xl" />

                <div className="relative z-10 grid gap-5 lg:grid-cols-[1.15fr_0.85fr]">
                  <div className="rounded-[1.8rem] border border-white/8 bg-[linear-gradient(180deg,rgba(255,255,255,0.045),rgba(255,255,255,0.015))] p-7 text-left shadow-[inset_0_1px_0_rgba(255,255,255,0.05)] backdrop-blur-xl md:p-8">
                    <div className="mb-6 flex items-center gap-4">
                      <div className="flex h-16 w-16 items-center justify-center rounded-[1.4rem] border border-cyan-300/18 bg-white/[0.05] shadow-[0_0_30px_rgba(45,225,252,0.08)] backdrop-blur-md">
                        <span className="text-4xl">🔍</span>
                      </div>
                      <div className="min-w-0">
                        <div className="inline-flex rounded-full border border-cyan-300/18 bg-cyan-300/[0.08] px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.18em] text-cyan-200/95">
                          {t('ctaPanel.badge')}
                        </div>
                      </div>
                    </div>

                    <div className="space-y-4">
                      <h2 className="text-3xl font-bold tracking-tight text-white md:text-4xl">{t('ctaBannerTitle')}</h2>
                      <p className="max-w-2xl text-sm leading-7 text-slate-300/78 md:text-base">{t('ctaBannerSubtitle')}</p>
                    </div>

                    <div className="mt-7 flex flex-col items-start gap-5 sm:flex-row sm:items-center sm:justify-between">
                      <Link href="/detect/intro">
                        <Button className="h-14 rounded-full px-10 text-lg font-bold bg-gradient-to-r from-[#2DE1FC] to-[#10b981] hover:shadow-[0_0_50px_rgba(45,225,252,0.42)] hover:scale-[1.03] transition-all duration-300 group md:px-12">
                          {t('ctaStart')} <ChevronRight className="w-5 h-5 ml-2 group-hover:translate-x-1 transition-transform" />
                        </Button>
                      </Link>

                      <div className="flex flex-wrap items-center gap-3 text-sm">
                        <span className="flex items-center gap-2 rounded-full border border-emerald-400/16 bg-emerald-400/[0.08] px-4 py-2 font-medium text-emerald-300">
                          <Shield className="w-4 h-4" /> {t('trust.privacy')}
                        </span>
                        <span className="flex items-center gap-2 rounded-full border border-amber-400/16 bg-amber-400/[0.08] px-4 py-2 font-medium text-amber-300">
                          <Star className="w-4 h-4 fill-amber-300" /> {t('trust.free')}
                        </span>
                      </div>
                    </div>
                  </div>

                  <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-1">
                    <div className="rounded-[1.65rem] border border-cyan-400/14 bg-[linear-gradient(135deg,rgba(34,211,238,0.14),rgba(34,211,238,0.04)_42%,rgba(255,255,255,0.02))] p-5 shadow-[inset_0_1px_0_rgba(255,255,255,0.04)] backdrop-blur-xl">
                      <div className="mb-3 inline-flex rounded-full border border-cyan-300/16 bg-cyan-300/[0.08] px-3 py-1 text-[10px] font-semibold uppercase tracking-[0.18em] text-cyan-200">{t('ctaPanel.insight1Title')}</div>
                      <p className="text-sm leading-7 text-slate-300/78">{t('ctaPanel.insight1Desc')}</p>
                    </div>

                    <div className="rounded-[1.65rem] border border-emerald-400/14 bg-[linear-gradient(135deg,rgba(16,185,129,0.14),rgba(16,185,129,0.04)_42%,rgba(255,255,255,0.02))] p-5 shadow-[inset_0_1px_0_rgba(255,255,255,0.04)] backdrop-blur-xl">
                      <div className="mb-3 inline-flex rounded-full border border-emerald-300/16 bg-emerald-300/[0.08] px-3 py-1 text-[10px] font-semibold uppercase tracking-[0.18em] text-emerald-200">{t('ctaPanel.insight2Title')}</div>
                      <p className="text-sm leading-7 text-slate-300/78">{t('ctaPanel.insight2Desc')}</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>
      </main>

      <footer className="border-t border-border/50 py-8 text-center text-sm text-muted-foreground relative z-10">
        <div className="container mx-auto px-4">
          <div className="flex flex-wrap items-center justify-center gap-4 text-sm mb-4">
            <Link href="/privacy" className="hover:text-foreground transition-colors">{t('footer.privacy')}</Link>
            <Link href="/terms" className="hover:text-foreground transition-colors">{t('footer.terms')}</Link>
            <Link href="/refund" className="hover:text-foreground transition-colors">{t('footer.refund')}</Link>
            <Link href="/contact" className="hover:text-foreground transition-colors">{t('footer.contact')}</Link>
          </div>
          <div className="mb-5 text-sm text-slate-300/85 font-medium">
            {t('footer.support')}
            <a href="mailto:kablejon@gmail.com" className="text-slate-200 hover:text-white transition-colors hover:underline ml-2">
              kablejon@gmail.com
            </a>
          </div>
          <p>© 2025 CogniSeek · {t('footer.tagline')}</p>
          <p className="mt-1.5 text-xs opacity-60">{t('footer.disclaimer')}</p>
        </div>
      </footer>
    </div>
  )
}
