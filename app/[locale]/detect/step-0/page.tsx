"use client"

import { useState } from "react"
import { useTranslations } from "next-intl"
import { useRouter } from "@/lib/navigation"
import { Button } from "@/components/ui/button"
import { ChevronRight, ChevronLeft, Check } from "lucide-react"
import { Header } from "@/components/shared/header"
import { useSearchStore } from "@/lib/store"
import { InteractiveFog } from "@/components/ui/interactive-fog"
import { ConfidenceSlider } from "@/components/ui/confidence-slider"

const SECTOR_IDS = ['Home', 'Work', 'Vehicle', 'Public', 'Outdoors', 'Unsure'] as const
const SECTOR_ICONS: Record<string, string> = {
  Home: '🏠',
  Work: '🏢',
  Vehicle: '🚗',
  Public: '🛍️',
  Outdoors: '🌳',
  Unsure: '❓',
}
const SECTOR_TYPES: Record<string, string> = {
  Home: 'safe_zone_static',
  Work: 'semi_public_zone',
  Vehicle: 'transit_zone',
  Public: 'high_traffic_zone',
  Outdoors: 'open_environment',
  Unsure: 'trajectory_analysis',
}

export default function Step0Page() {
  const router = useRouter()
  const { updateSession } = useSearchStore()
  const t = useTranslations('step0')
  const tc = useTranslations('common')

  const [selectedSector, setSelectedSector] = useState<string>('')
  const [confidence, setConfidence] = useState<number>(80)
  const [hasConfirmedConfidence, setHasConfirmedConfidence] = useState<boolean>(false)

  const isUnsureMode = selectedSector === 'Unsure'
  const canProceed = selectedSector !== '' && (isUnsureMode || hasConfirmedConfidence)

  const getMissingRequirement = (): string | null => {
    if (!selectedSector) return t('missing.noSector')
    if (!isUnsureMode && !hasConfirmedConfidence) return t('missing.noConfidence')
    return null
  }

  const handleSectorSelect = (sectorId: string) => {
    setSelectedSector(sectorId)
    setConfidence(80)
    setHasConfirmedConfidence(false)
  }

  const handleConfidenceChange = (value: number) => {
    setConfidence(value)
    setHasConfirmedConfidence(true)
  }

  const handleNext = () => {
    if (!canProceed) return
    updateSession({
      lossLocationCategory: selectedSector,
      lossLocationSubCategory: SECTOR_TYPES[selectedSector] ? [SECTOR_TYPES[selectedSector]] : [],
      lossLocationCustom: '',
    })
    router.push('/detect/step-1')
  }

  return (
    <div className="min-h-screen bg-background flex flex-col relative">
      <div className="fixed inset-0 z-0">
        <InteractiveFog particleCount={100} color="56, 189, 248" />
      </div>

      <Header currentStep={1} showProgress />

      <main className="container mx-auto px-4 py-8 md:py-12 relative z-10">
        <div className="w-full max-w-5xl mx-auto scifi-container p-6 md:p-10 space-y-8">
          
          <div className="text-center space-y-3">
            <h1 className="text-2xl md:text-3xl font-bold text-white drop-shadow-[0_0_10px_rgba(255,255,255,0.3)]">
              {t('title')}
            </h1>
            <p className="text-xs md:text-sm text-[#2DE1FC]/80 font-mono uppercase tracking-wider">
              {t('subtitle')}
            </p>
            <p className="text-sm md:text-base text-white/60">
              {t('description')}
            </p>
          </div>

          <div className="grid grid-cols-2 lg:grid-cols-3 gap-4">
            {SECTOR_IDS.map((sectorId, index) => {
              const isSelected = selectedSector === sectorId
              const isOtherSelected = selectedSector && !isSelected
              const isSpecial = sectorId === 'Unsure'
              
              return (
                <button
                  key={sectorId}
                  onClick={() => handleSectorSelect(sectorId)}
                  className={`
                    relative p-5 rounded-2xl transition-all duration-500 group
                    ${isSpecial ? 'border-2 border-dashed' : 'border'}
                    ${isSelected 
                      ? 'border-[#2DE1FC] bg-[#2DE1FC]/15 shadow-[0_0_30px_rgba(45,225,252,0.5),0_0_60px_rgba(45,225,252,0.2)]' 
                      : isSpecial
                        ? 'border-white/30 bg-white/10'
                        : 'border-white/10 bg-white/10'
                    }
                    ${isOtherSelected ? 'opacity-40' : 'opacity-100'}
                    hover:border-white/40 hover:bg-white/15
                  `}
                  style={{ animationDelay: `${index * 100}ms` }}
                >
                  {isSelected && (
                    <div className="absolute -top-2 -right-2 w-7 h-7 rounded-full bg-[var(--cyber-green)] flex items-center justify-center shadow-[0_0_15px_rgba(0,255,157,0.5)] z-10">
                      <Check className="w-4 h-4 text-black" />
                    </div>
                  )}

                  {isSpecial && !isSelected && (
                    <div className="absolute inset-0 flex items-center justify-center pointer-events-none overflow-hidden rounded-2xl">
                      <div className="w-20 h-20 rounded-full border border-white/20 animate-ping" style={{ animationDuration: '2s' }} />
                    </div>
                  )}

                  <div className={`
                    relative z-10 flex flex-col items-center gap-3 py-2
                    transition-transform duration-300
                    ${isSelected ? 'transform -translate-y-1' : 'group-hover:-translate-y-0.5'}
                  `}>
                    <div className={`
                      text-4xl md:text-5xl transition-all duration-300
                      ${isSelected ? 'transform scale-110 drop-shadow-[0_0_20px_rgba(45,225,252,0.8)]' : ''}
                    `}>
                      {SECTOR_ICONS[sectorId]}
                    </div>
                    
                    <div className="text-center">
                      <div className={`font-bold text-sm md:text-base ${isSelected ? 'text-white' : 'text-white/90'}`}>
                        {t(`sectors.${sectorId}`)}
                      </div>
                      <div className="text-xs text-white/50 mt-0.5">{t(`sectorDesc.${sectorId}`)}</div>
                    </div>
                  </div>
                </button>
              )
            })}
          </div>

          {selectedSector && (
            <div className="space-y-4 animate-slide-up">
              {isUnsureMode ? (
                <div className="p-5 rounded-2xl bg-amber-500/10 border border-amber-500/30">
                  <div className="flex items-start gap-3">
                    <div className="text-2xl">🔍</div>
                    <div>
                      <h3 className="font-bold text-amber-400">{t('unsureMode.title')}</h3>
                      <p className="text-sm text-white/70 mt-1">{t('unsureMode.desc')}</p>
                    </div>
                  </div>
                </div>
              ) : (
                <div className="p-5 rounded-2xl bg-[#2DE1FC]/5 border border-[#2DE1FC]/20">
                  <ConfidenceSlider 
                    value={confidence} 
                    onChange={handleConfidenceChange} 
                  />
                  
                  <div className="p-3 rounded-xl bg-white/5 text-center mt-4">
                    <p className="text-xs text-white/70">
                      {confidence >= 90 
                        ? t('confidence.aiHint90')
                        : confidence >= 70
                          ? t('confidence.aiHint70')
                          : t('confidence.aiHintLow')
                      }
                    </p>
                  </div>
                </div>
              )}

              <div className="flex flex-col items-center gap-4 pt-2">
                <div className="relative group/btn">
                  <button
                    onClick={handleNext}
                    disabled={!canProceed}
                    className="btn-scifi-primary disabled:opacity-40 disabled:cursor-not-allowed"
                  >
                    {isUnsureMode ? t('button.trajectory') : t('button.lock')}
                    <ChevronRight className="w-5 h-5" />
                  </button>
                  
                  {!canProceed && getMissingRequirement() && (
                    <div className="absolute -top-12 left-1/2 -translate-x-1/2 opacity-0 group-hover/btn:opacity-100 transition-all duration-300 pointer-events-none z-50">
                      <div className="px-4 py-2 bg-gradient-to-r from-amber-500/95 to-orange-500/95 text-white text-sm font-medium rounded-xl whitespace-nowrap shadow-[0_4px_20px_rgba(245,158,11,0.4)] backdrop-blur-sm border border-amber-400/30">
                        <span className="flex items-center gap-2">
                          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                          </svg>
                          {getMissingRequirement()}
                        </span>
                        <div className="absolute -bottom-1.5 left-1/2 -translate-x-1/2 w-3 h-3 bg-gradient-to-br from-amber-500/95 to-orange-500/95 rotate-45 border-r border-b border-amber-400/30" />
                      </div>
                    </div>
                  )}
                </div>
                
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => router.push('/')}
                  className="text-xs text-muted-foreground hover:text-white"
                >
                  <ChevronLeft className="w-4 h-4 mr-1" />
                  {tc('backHome')}
                </Button>
              </div>
            </div>
          )}

          {!selectedSector && (
            <div className="text-center py-4">
              <p className="text-sm text-white/40">{t('selectPrompt')}</p>
            </div>
          )}

        </div>
      </main>

      <style jsx>{`
        @keyframes slide-up {
          from { opacity: 0; transform: translateY(20px); }
          to { opacity: 1; transform: translateY(0); }
        }
        .animate-slide-up { animation: slide-up 0.4s ease-out; }
      `}</style>
    </div>
  )
}
