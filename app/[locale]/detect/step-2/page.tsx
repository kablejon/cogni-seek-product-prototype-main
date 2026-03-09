"use client"

import { useState } from "react"
import { useTranslations } from "next-intl"
import { useRouter } from "@/lib/navigation"
import { Button } from "@/components/ui/button"
import { ChevronRight, ChevronLeft, Check } from "lucide-react"
import { Header } from "@/components/shared/header"
import { useSearchStore } from "@/lib/store"
import { InteractiveFog } from "@/components/ui/interactive-fog"
import { MACRO_TIME_OPTIONS, LIGHT_PERIODS } from "@/lib/config/time"

export default function Step2Page() {
  const router = useRouter()
  const { updateSession } = useSearchStore()
  const t = useTranslations('step2')
  const td = useTranslations('data')
  const tc = useTranslations('common')

  const [selectedMacroTime, setSelectedMacroTime] = useState<string>('')
  const [selectedLightPeriod, setSelectedLightPeriod] = useState<string>('')
  const [fuzzyTimeMode, setFuzzyTimeMode] = useState(false)
  const [customDate, setCustomDate] = useState('')
  const [customTime, setCustomTime] = useState('')

  const selectedMacroConfig = MACRO_TIME_OPTIONS.find(opt => opt.id === selectedMacroTime)
  const needsLightDetail = selectedMacroConfig?.needsDetail || false
  const needsCustomTime = selectedMacroConfig?.needsCustomTime || false

  const canProceed = selectedMacroTime && (
    (!needsLightDetail && !needsCustomTime) ||
    selectedLightPeriod ||
    fuzzyTimeMode ||
    (needsCustomTime && customDate)
  )

  const getMissingRequirement = (): string | null => {
    if (!selectedMacroTime) return t('missing.noTime')
    if (needsLightDetail && !selectedLightPeriod && !fuzzyTimeMode) return t('missing.noLight')
    if (needsCustomTime && !customDate && !fuzzyTimeMode) return t('missing.noDate')
    return null
  }

  const handleMacroTimeSelect = (timeId: string) => {
    setSelectedMacroTime(timeId)
    setSelectedLightPeriod('')
    setCustomDate('')
    setCustomTime('')
  }

  const handleNext = () => {
    if (!canProceed) return

    let timeDescription = ''
    let lightContext = ''

    if (needsCustomTime && customDate) {
      timeDescription = customTime ? `${customDate} ${customTime}` : customDate
      lightContext = customTime ? (fuzzyTimeMode ? t('lightContext.fullDay') : t('lightContext.locked')) : t('lightContext.fullDay')
    } else if (fuzzyTimeMode && needsCustomTime) {
      timeDescription = t('timeDesc.uncertain')
      lightContext = t('lightContext.fullPeriod')
    } else if (fuzzyTimeMode) {
      const macroLabel = selectedMacroConfig?.label || selectedMacroConfig?.id || ''
      timeDescription = t('timeDesc.macroUncertain', { label: macroLabel })
      lightContext = t('lightContext.fullDay')
    } else if (selectedLightPeriod) {
      const lightConfig = LIGHT_PERIODS.find(p => p.id === selectedLightPeriod)
      timeDescription = `${selectedMacroConfig?.label || selectedMacroConfig?.id || ''} ${lightConfig?.label || lightConfig?.id || ''}`
      lightContext = lightConfig?.aiInsight || ''
    } else {
      timeDescription = selectedMacroConfig?.label || selectedMacroConfig?.id || ''
      lightContext = t('lightContext.fresh')
    }

    updateSession({
      lossTime: timeDescription,
      lossTimeRange: selectedMacroTime,
      preciseTime: selectedLightPeriod || customDate || '',
    })
    router.push('/detect/step-3')
  }

  const selectedPeriodConfig = LIGHT_PERIODS.find(p => p.id === selectedLightPeriod)

  return (
    <div className="min-h-screen bg-background flex flex-col relative">
      <div className="fixed inset-0 z-0">
        <InteractiveFog particleCount={100} color="56, 189, 248" />
      </div>

      {selectedLightPeriod && selectedPeriodConfig && (
        <div className="fixed inset-0 z-0 transition-all duration-1000 ease-out pointer-events-none"
          style={{ background: selectedPeriodConfig.atmosphereGradient, opacity: 0.15 }} />
      )}

      <Header currentStep={3} showProgress />

      <main className="container mx-auto px-4 py-8 md:py-12 relative z-10">
        <div className="w-full max-w-5xl mx-auto scifi-container p-6 md:p-10 space-y-8">

          <div className="text-center space-y-2">
            <h1 className="text-2xl md:text-3xl font-bold">{t('title')}</h1>
            <p className="text-base md:text-lg text-white/70">
              {t('subtitle').split('{accent}')[0]}
              <span className="text-[var(--cyber-green)] font-semibold">{t('subtitle').split('{accent}')[1]?.split('{/accent}')[0]}</span>
              {t('subtitle').split('{/accent}')[1]}
            </p>
          </div>

          {/* Time Range Grid */}
          <div className="space-y-4">
            <h2 className="text-base md:text-lg font-bold text-white/90">{t('timeRangeLabel')}</h2>
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
              {MACRO_TIME_OPTIONS.map((option) => {
                const Icon = option.IconComponent
                const isSelected = selectedMacroTime === option.id
                return (
                  <button key={option.id} onClick={() => handleMacroTimeSelect(option.id)}
                    className={`card-option ${isSelected ? 'card-option-selected' : ''} relative group`}>
                    {isSelected && <div className="check-glow"><Check className="w-3 h-3 text-black" /></div>}
                    <div className="flex flex-col items-center gap-1.5 py-5">
                      <div className="text-2xl">{option.icon}</div>
                      <Icon className={`w-5 h-5 transition-all ${isSelected ? option.id === 'earlier' ? 'text-[var(--holo-blue)] fill-current' : 'text-[var(--holo-blue)]' : 'text-white/70 group-hover:text-white'}`} strokeWidth={1.5} />
                      <span className={`text-sm font-medium ${isSelected ? 'text-white' : 'text-white/80'}`}>
                        {td(`time.${option.id}`)}
                      </span>
                      <span className="text-xs text-white/50">{td(`timeDesc.${option.id}`)}</span>
                    </div>
                  </button>
                )
              })}
            </div>
          </div>

          {/* Light Period */}
          {needsLightDetail && (
            <div className="space-y-5 animate-fade-in-up">
              <h2 className="text-base md:text-lg font-bold text-white/90">{t('lightPeriodLabel')}</h2>
              <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
                {LIGHT_PERIODS.map((period) => {
                  const isSelected = selectedLightPeriod === period.id
                  const isDisabled = fuzzyTimeMode
                  return (
                    <button key={period.id}
                      onClick={() => !isDisabled && setSelectedLightPeriod(period.id)}
                      disabled={isDisabled}
                      className={`relative overflow-hidden rounded-2xl px-4 py-5 border-2 transition-all duration-500 ${isDisabled ? 'opacity-40 cursor-not-allowed bg-white/5 border-white/10' : isSelected ? 'shadow-lg scale-[1.02]' : 'bg-white/5 border-white/10 hover:bg-white/8 hover:border-white/20 hover:scale-[1.01]'} flex flex-col items-center gap-2`}
                      style={!isDisabled && isSelected ? { background: period.atmosphereGradient, borderColor: period.selectedBorder, boxShadow: `0 0 25px ${period.glowColor}, inset 0 0 20px ${period.glowColor}` } : !isDisabled ? { background: period.atmosphereGradient } : {}}>
                      {isSelected && !isDisabled && <div className="absolute bottom-0 left-0 right-0 h-1 animate-fade-in-up" style={{ background: `linear-gradient(to right, transparent, ${period.selectedBorder}, transparent)`, boxShadow: `0 0 15px ${period.glowColor}` }} />}
                      {isSelected && !isDisabled && <div className="absolute top-2 right-2 w-5 h-5 rounded-full flex items-center justify-center animate-scale-in" style={{ backgroundColor: period.selectedBorder }}><Check className="w-3 h-3 text-black font-bold" /></div>}
                      <span className={`text-3xl transition-all duration-500 ${isSelected ? 'drop-shadow-[0_0_10px_rgba(255,255,255,0.8)]' : ''}`} style={isSelected ? { filter: 'brightness(1.3)' } : {}}>{period.icon}</span>
                      <div className="flex flex-col items-center gap-0.5">
                        <span className={`text-sm font-medium ${isSelected ? 'text-white drop-shadow-[0_0_8px_rgba(255,255,255,0.5)]' : 'text-white/90'}`}>
                          {td(`lightPeriods.${period.id}`)}
                        </span>
                        <span className={`text-xs font-mono ${isSelected ? 'text-white/80' : 'text-white/60'}`}>
                          {td(`lightPeriodTimes.${period.id}`)}
                        </span>
                      </div>
                    </button>
                  )
                })}
              </div>

              {selectedLightPeriod && !fuzzyTimeMode && (
                <div className="relative flex items-start gap-3 p-4 rounded-xl animate-fade-in-up overflow-hidden">
                  <div className="absolute inset-0 bg-[var(--holo-blue)]/5 backdrop-blur-lg border border-[var(--holo-blue)]/25 rounded-xl" style={{ backdropFilter: 'blur(12px) saturate(180%)' }} />
                  <div className="relative flex-shrink-0 w-8 h-8 rounded-full bg-[var(--holo-blue)]/20 flex items-center justify-center animate-pulse" style={{ boxShadow: '0 0 15px rgba(45, 225, 252, 0.4)' }}>
                    <span className="text-lg">🤖</span>
                  </div>
                  <p className="relative text-sm text-white/90 leading-relaxed flex-1 animate-typewriter">
                    {td(`lightInsights.${selectedLightPeriod}`)}
                  </p>
                </div>
              )}
            </div>
          )}

          {/* Custom Time */}
          {needsCustomTime && (
            <div className="space-y-4 animate-fade-in-up">
              <h2 className="text-base md:text-lg font-bold text-white/90">{t('locatorLabel')}</h2>
              <div className="flex flex-col sm:flex-row gap-3">
                <div className="flex-1 relative">
                  <input type="date" value={customDate} onChange={(e) => setCustomDate(e.target.value)}
                    className={`w-full px-4 py-3 rounded-xl text-sm font-medium font-mono bg-black/30 border border-white/10 transition-all duration-300 cursor-pointer ${customDate ? 'text-white shadow-[0_0_15px_rgba(45,225,252,0.2)]' : 'text-white/60'} focus:outline-none focus:border-[var(--holo-blue)] focus:ring-2 focus:ring-[var(--holo-blue)]/20`}
                    style={{ colorScheme: 'dark' }} />
                </div>
                <div className="flex-1 relative">
                  <input type="time" value={customTime} onChange={(e) => setCustomTime(e.target.value)}
                    className={`w-full px-4 py-3 rounded-xl text-sm font-medium font-mono bg-black/30 border border-white/10 transition-all duration-300 cursor-pointer ${customTime ? 'text-white shadow-[0_0_15px_rgba(45,225,252,0.2)]' : 'text-white/60'} focus:outline-none focus:border-[var(--holo-blue)] focus:ring-2 focus:ring-[var(--holo-blue)]/20`}
                    style={{ colorScheme: 'dark' }} />
                </div>
              </div>

              <div className="flex items-center justify-between p-4 rounded-xl bg-white/5 border border-white/10">
                <div className="flex flex-col gap-1">
                  <span className="text-sm font-medium text-white">{t('fuzzyToggle.label')}</span>
                  <span className="text-xs text-white/60">{fuzzyTimeMode ? t('fuzzyToggle.on') : t('fuzzyToggle.off')}</span>
                </div>
                <button onClick={() => setFuzzyTimeMode(!fuzzyTimeMode)}
                  className={`relative w-14 h-7 rounded-full transition-all duration-300 ${fuzzyTimeMode ? 'bg-[var(--cyber-green)]' : 'bg-white/20'}`}>
                  <div className={`absolute top-1 w-5 h-5 bg-white rounded-full shadow-lg transition-all duration-300 ${fuzzyTimeMode ? 'left-8' : 'left-1'}`} />
                </button>
              </div>

              {customDate && (
                <div className="relative flex items-start gap-3 p-4 rounded-xl animate-fade-in-up delay-200 overflow-hidden">
                  <div className="absolute inset-0 bg-[var(--holo-blue)]/5 backdrop-blur-lg border border-[var(--holo-blue)]/25 rounded-xl" style={{ backdropFilter: 'blur(12px) saturate(180%)' }} />
                  <div className="relative flex-shrink-0 w-8 h-8 rounded-full bg-[var(--holo-blue)]/20 flex items-center justify-center" style={{ boxShadow: '0 0 15px rgba(45, 225, 252, 0.4)' }}>
                    <span className="text-lg">🤖</span>
                  </div>
                  <p className="relative text-sm text-white/90 leading-relaxed flex-1">
                    <span className="font-medium">{t('aiAnalysis')}</span>
                    {' '}{customTime
                      ? `${customDate} ${customTime} — ${fuzzyTimeMode ? 'full-day light & behavior analysis' : '3-hour window after this point'}`
                      : `${customDate} — full-day light & behavior pattern analysis`
                    }
                  </p>
                </div>
              )}
            </div>
          )}

          {/* AI Mode Switcher */}
          {needsLightDetail && (
            <div className="relative overflow-hidden rounded-xl animate-fade-in-up">
              <div className="absolute inset-0 bg-gradient-to-r from-slate-900/60 via-slate-800/50 to-slate-900/60 backdrop-blur-md border border-[var(--holo-blue)]/40 rounded-xl" />
              <div className={`absolute bottom-0 left-0 right-0 h-0.5 transition-all duration-500 ${fuzzyTimeMode ? 'bg-gradient-to-r from-transparent via-[var(--cyber-green)] to-transparent opacity-80' : 'bg-gradient-to-r from-transparent via-[var(--holo-blue)]/30 to-transparent opacity-40'}`} />
              <div className="relative flex items-center justify-between p-5">
                <div className="flex items-start gap-3 flex-1">
                  <div className={`flex-shrink-0 w-10 h-10 rounded-lg flex items-center justify-center transition-all duration-500 ${fuzzyTimeMode ? 'bg-[var(--cyber-green)]/20 text-[var(--cyber-green)]' : 'bg-[var(--holo-blue)]/20 text-[var(--holo-blue)]'}`}
                    style={{ boxShadow: fuzzyTimeMode ? '0 0 20px rgba(0, 255, 157, 0.3)' : '0 0 15px rgba(45, 225, 252, 0.2)' }}>
                    <span className="text-xl">{fuzzyTimeMode ? '📡' : '🔒'}</span>
                  </div>
                  <div className="flex flex-col gap-1">
                    <span className="text-sm font-semibold text-white">{fuzzyTimeMode ? t('mode.broad') : t('mode.precise')}</span>
                    <span className="text-xs text-white/70 leading-relaxed">{fuzzyTimeMode ? t('mode.broadDesc') : t('mode.preciseDesc')}</span>
                  </div>
                </div>
                <button onClick={() => { setFuzzyTimeMode(!fuzzyTimeMode); if (!fuzzyTimeMode) setSelectedLightPeriod('') }}
                  className={`relative w-14 h-7 rounded-full transition-all duration-500 flex-shrink-0 ${fuzzyTimeMode ? 'bg-[var(--cyber-green)] shadow-[0_0_20px_rgba(0,255,157,0.5)]' : 'bg-white/20 hover:bg-white/30'}`}>
                  <div className={`absolute top-1 w-5 h-5 bg-white rounded-full shadow-lg transition-all duration-500 ${fuzzyTimeMode ? 'left-8' : 'left-1'}`} />
                </button>
              </div>
            </div>
          )}

          {/* Buttons */}
          <div className="flex flex-col items-center gap-4 pt-6">
            <div className="relative group/btn">
              <button onClick={handleNext} disabled={!canProceed} className="btn-scifi-primary disabled:opacity-40 disabled:cursor-not-allowed">
                {tc('next')} <ChevronRight className="w-5 h-5" />
              </button>
              {!canProceed && getMissingRequirement() && (
                <div className="absolute -top-12 left-1/2 -translate-x-1/2 opacity-0 group-hover/btn:opacity-100 transition-all duration-300 pointer-events-none z-50">
                  <div className="px-4 py-2 bg-gradient-to-r from-amber-500/95 to-orange-500/95 text-white text-sm font-medium rounded-xl whitespace-nowrap shadow-[0_4px_20px_rgba(245,158,11,0.4)] backdrop-blur-sm border border-amber-400/30">
                    <span className="flex items-center gap-2">
                      <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" /></svg>
                      {getMissingRequirement()}
                    </span>
                    <div className="absolute -bottom-1.5 left-1/2 -translate-x-1/2 w-3 h-3 bg-gradient-to-br from-amber-500/95 to-orange-500/95 rotate-45 border-r border-b border-amber-400/30" />
                  </div>
                </div>
              )}
            </div>
            <Button variant="ghost" size="sm" onClick={() => router.back()} className="text-xs text-muted-foreground hover:text-white">
              <ChevronLeft className="w-4 h-4 mr-1" /> {tc('back')}
            </Button>
          </div>

        </div>
      </main>
    </div>
  )
}
