"use client"

import { useTranslations } from "next-intl"
import { Link } from "@/lib/navigation"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Card } from "@/components/ui/card"
import { InteractiveFog } from "@/components/ui/interactive-fog"
import {
  Brain, MapPin, Clock, Zap, Shield, ChevronRight, Star, Search,
  TrendingUp, Eye, Waves
} from "lucide-react"

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
      <div className="fixed inset-0 z-0">
        <InteractiveFog color="45, 225, 252" />
      </div>

      {/* Header */}
      <header className="sticky top-0 z-50 glass border-b border-border/50">
        <div className="container mx-auto px-4 py-3 flex justify-between items-center">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-primary flex items-center justify-center">
              <span className="text-primary-foreground font-bold text-lg">C</span>
            </div>
            <span className="text-xl font-semibold">CogniSeek</span>
          </div>
          <div className="flex items-center gap-3">
            <Badge variant="secondary" className="text-xs hidden md:flex">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 mr-1.5 animate-pulse" />
              AI Online
            </Badge>
          </div>
        </div>
      </header>

      <main className="flex-1 relative z-10">
        {/* Hero */}
        <section className="container mx-auto px-4 py-16 md:py-24 text-center space-y-8">
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary/10 border border-primary/20 text-sm font-medium text-primary animate-fade-in">
            <Zap className="w-4 h-4" />
            {t('badge')}
          </div>

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
              <Button size="lg" className="rounded-full px-8 text-lg font-semibold bg-gradient-to-r from-[#2DE1FC] to-[#10b981] hover:shadow-[0_0_30px_rgba(45,225,252,0.4)] transition-all group">
                {t('ctaStart')}
                <ChevronRight className="w-5 h-5 ml-1 group-hover:translate-x-1 transition-transform" />
              </Button>
            </Link>
            <Button size="lg" variant="outline" className="rounded-full px-8 text-lg">
              {t('ctaDemo')}
            </Button>
          </div>

          {/* Stats */}
          <div className="grid grid-cols-3 gap-4 md:gap-8 max-w-2xl mx-auto pt-4 animate-fade-in-up delay-300">
            {stats.map(({ key, icon: Icon, color }) => (
              <div key={key} className="text-center space-y-1">
                <div className="flex items-center justify-center gap-1.5 mb-1">
                  <Icon className={`w-4 h-4 ${color}`} />
                </div>
                <div className={`text-2xl md:text-3xl font-bold ${color}`}>{t(`stats.${key}.value`)}</div>
                <div className="text-xs md:text-sm text-muted-foreground">{t(`stats.${key}.label`)}</div>
              </div>
            ))}
          </div>
        </section>

        {/* Features Grid */}
        <section className="container mx-auto px-4 py-12 md:py-16">
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

        {/* Testimonials */}
        <section className="container mx-auto px-4 py-12 md:py-16">
          <div className="text-center space-y-3 mb-10">
            <h2 className="text-2xl md:text-3xl font-bold">{t('testimonialsTitle')}</h2>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 max-w-5xl mx-auto">
            {[1, 2, 3].map((i) => (
              <Card key={i} className="p-6 space-y-4 bg-card/50 border border-border/50">
                <div className="flex gap-0.5">
                  {[...Array(5)].map((_, j) => <Star key={j} className="w-4 h-4 text-amber-400 fill-amber-400" />)}
                </div>
                <p className="text-sm text-muted-foreground leading-relaxed">{t(`testimonials.${i}.text`)}</p>
                <div className="flex items-center gap-3">
                  <div className="w-9 h-9 rounded-full bg-gradient-to-br from-[#2DE1FC]/30 to-[#10b981]/20 border border-[#2DE1FC]/20 flex items-center justify-center text-sm font-bold">
                    {t(`testimonials.${i}.name`).charAt(0)}
                  </div>
                  <div>
                    <div className="text-sm font-medium">{t(`testimonials.${i}.name`)}</div>
                    <div className="text-xs text-muted-foreground">{t(`testimonials.${i}.item`)}</div>
                  </div>
                </div>
              </Card>
            ))}
          </div>
        </section>

        {/* CTA Banner */}
        <section className="container mx-auto px-4 py-12 md:py-16">
          <div className="max-w-3xl mx-auto text-center space-y-6 scifi-container p-10 md:p-16">
            <div className="text-5xl">🔍</div>
            <h2 className="text-2xl md:text-3xl font-bold">{t('ctaBannerTitle')}</h2>
            <p className="text-muted-foreground">{t('ctaBannerSubtitle')}</p>
            <Link href="/detect/intro">
              <Button size="lg" className="rounded-full px-12 text-lg font-semibold bg-gradient-to-r from-[#2DE1FC] to-[#10b981] hover:shadow-[0_0_40px_rgba(45,225,252,0.5)] transition-all">
                {t('ctaStart')} <ChevronRight className="w-5 h-5 ml-1" />
              </Button>
            </Link>
            <div className="flex items-center justify-center gap-4 text-xs text-muted-foreground pt-2">
              <span className="flex items-center gap-1"><Shield className="w-3.5 h-3.5 text-emerald-400" /> {t('trust.privacy')}</span>
              <span className="flex items-center gap-1"><Star className="w-3.5 h-3.5 text-amber-400" /> {t('trust.free')}</span>
            </div>
          </div>
        </section>
      </main>

      <footer className="border-t border-border/50 py-8 text-center text-sm text-muted-foreground relative z-10">
        <div className="container mx-auto px-4">
          <p>© 2025 CogniSeek · {t('footer.tagline')}</p>
          <p className="mt-1 text-xs opacity-60">{t('footer.disclaimer')}</p>
        </div>
      </footer>
    </div>
  )
}
