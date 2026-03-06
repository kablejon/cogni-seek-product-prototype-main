"use client"

import { useState } from "react"
import { useTranslations } from "next-intl"
import { useRouter } from "@/lib/navigation"
import { Button } from "@/components/ui/button"
import { ChevronRight, ChevronLeft, Brain, Check, Radio, Plus, AlertTriangle, X } from "lucide-react"
import { Header } from "@/components/shared/header"
import { useSearchStore } from "@/lib/store"
import { InteractiveFog } from "@/components/ui/interactive-fog"
import { 
  AngryIcon, 
  AnxiousIcon, 
  SleepyIcon, 
  TipsyIcon, 
  ExcitedIcon, 
  CalmIcon, 
  ConfusedIcon,
  CustomMoodIcon 
} from "@/components/ui/neon-mood-icons"
import {
  WalkingIcon,
  SittingIcon,
  CarryingIcon,
  PhoneCallIcon,
  CleaningIcon,
  ChangingIcon,
  DrivingIcon,
  EatingIcon,
  PhotoIcon
} from "@/components/ui/neon-activity-icons"

const MOOD_OPTIONS = [
  { id: 'angry', IconComponent: AngryIcon, color: '#FF3B30', glowColor: 'rgba(255, 59, 48, 0.3)' },
  { id: 'anxious', IconComponent: AnxiousIcon, color: '#FF9500', glowColor: 'rgba(255, 149, 0, 0.3)' },
  { id: 'drowsy', IconComponent: SleepyIcon, color: '#0A84FF', glowColor: 'rgba(10, 132, 255, 0.3)' },
  { id: 'tipsy', IconComponent: TipsyIcon, color: '#BF5AF2', glowColor: 'rgba(191, 90, 242, 0.3)' },
  { id: 'excited', IconComponent: ExcitedIcon, color: '#FF2D55', glowColor: 'rgba(255, 45, 85, 0.3)' },
  { id: 'calm', IconComponent: CalmIcon, color: '#64D2FF', glowColor: 'rgba(100, 210, 255, 0.3)' },
  { id: 'confused', IconComponent: ConfusedIcon, color: '#EBEBF5', glowColor: 'rgba(235, 235, 245, 0.3)' },
]

const ACTIVITY_IDS = ['walking', 'sitting', 'carrying', 'phone_call', 'cleaning', 'changing', 'driving', 'eating', 'photo'] as const
const ACTIVITY_ICONS = {
  walking: WalkingIcon,
  sitting: SittingIcon,
  carrying: CarryingIcon,
  phone_call: PhoneCallIcon,
  cleaning: CleaningIcon,
  changing: ChangingIcon,
  driving: DrivingIcon,
  eating: EatingIcon,
  photo: PhotoIcon,
}

const DISTRACTION_IDS = ['notification', 'talking', 'caring', 'daydream'] as const

export default function Step4Page() {
  const router = useRouter()
  const { updateSession } = useSearchStore()
  const t = useTranslations('step4')
  const tc = useTranslations('common')

  const [selectedMood, setSelectedMood] = useState<string>('')
  const [showMoodCustom, setShowMoodCustom] = useState(false)
  const [moodCustomText, setMoodCustomText] = useState('')
  
  const [selectedActivities, setSelectedActivities] = useState<string[]>([])
  const [showActivityCustom, setShowActivityCustom] = useState(false)
  const [activityCustomText, setActivityCustomText] = useState('')
  const [customActivities, setCustomActivities] = useState<string[]>([])
  
  const [isDistracted, setIsDistracted] = useState(false)
  const [selectedDistractions, setSelectedDistractions] = useState<string[]>([])
  const [showDistractionCustom, setShowDistractionCustom] = useState(false)
  const [distractionCustomText, setDistractionCustomText] = useState('')
  const [customDistractions, setCustomDistractions] = useState<string[]>([])

  const toggleActivity = (id: string) => {
    setSelectedActivities(prev =>
      prev.includes(id) ? prev.filter(a => a !== id) : [...prev, id]
    )
  }

  const toggleDistraction = (id: string) => {
    setSelectedDistractions(prev =>
      prev.includes(id) ? prev.filter(d => d !== id) : [...prev, id]
    )
  }

  const addCustomActivity = () => {
    if (activityCustomText.trim()) {
      const text = activityCustomText.trim()
      setCustomActivities(prev => [...prev, text])
      setSelectedActivities(prev => [...prev, `custom_${text}`])
      setActivityCustomText('')
      setShowActivityCustom(false)
    }
  }

  const addCustomDistraction = () => {
    if (distractionCustomText.trim()) {
      const text = distractionCustomText.trim()
      setCustomDistractions(prev => [...prev, text])
      setSelectedDistractions(prev => [...prev, `custom_${text}`])
      setDistractionCustomText('')
      setShowDistractionCustom(false)
    }
  }

  const canProceed = selectedMood && selectedActivities.length > 0

  const getMissingRequirement = (): string | null => {
    if (!selectedMood) return t('missing.noMood')
    if (selectedActivities.length === 0) return t('missing.noActivity')
    return null
  }

  const handleNext = () => {
    if (!canProceed) return
    updateSession({
      userMood: selectedMood,
      moodCustom: selectedMood === 'custom' ? moodCustomText : '',
      specificActivity: selectedActivities.join(','),
      activityCustom: customActivities.join(','),
      activityCategory: 'general',
      wasDistracted: isDistracted && selectedDistractions.length > 0,
      otherPeoplePresent: false,
    })
    router.push('/detect/step-5')
  }

  return (
    <div className="min-h-screen bg-background flex flex-col relative">
      <div className="fixed inset-0 z-0">
        <InteractiveFog color="8, 145, 178" />
      </div>
      
      <Header currentStep={5} showProgress />

      <main className="container mx-auto px-4 py-8 md:py-12 relative z-10">
        <div className="w-full max-w-5xl mx-auto scifi-container p-6 md:p-10 space-y-8">
          
          <div className="text-center space-y-2">
            <h1 className="text-2xl md:text-3xl font-bold">{t('title')}</h1>
            <p className="text-base md:text-lg text-white/70">
              {t('subtitle')}
            </p>
          </div>

          {/* Section 1: Mood / CPU Load */}
          <div className="space-y-4">
            <div className="flex items-center gap-2">
              <div className="relative">
                <Brain className="w-5 h-5" style={{ color: 'var(--holo-blue)' }} />
                <div className="absolute inset-0 animate-pulse-wave rounded-full" />
              </div>
              <h2 className="font-bold text-base md:text-lg">{t('section1Title')}</h2>
              <span className="text-xs text-white/50">{t('section1Hint')}</span>
              <span className="text-destructive ml-1">*</span>
            </div>

            <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
              {MOOD_OPTIONS.map((mood) => {
                const isSelected = selectedMood === mood.id
                const IconComponent = mood.IconComponent
                
                return (
                  <button
                    key={mood.id}
                    onClick={() => { setSelectedMood(mood.id); setShowMoodCustom(false) }}
                    className={`
                      relative p-3 rounded-xl border-2 transition-all duration-500
                      ${isSelected 
                        ? 'border-white/5 shadow-lg' 
                        : 'border-white/10 bg-white/5 hover:border-white/20 hover:bg-white/8'
                      }
                    `}
                    style={isSelected ? { 
                      backgroundColor: `${mood.color}15`,
                      borderColor: mood.color,
                      boxShadow: `0 0 20px ${mood.glowColor}, 0 0 40px ${mood.glowColor}` 
                    } : {}}
                  >
                    {isSelected && (
                      <div className="absolute -top-2 -right-2 w-6 h-6 rounded-full bg-[var(--cyber-green)] flex items-center justify-center shadow-lg animate-scale-in">
                        <Check className="w-3.5 h-3.5 text-black" />
                      </div>
                    )}
                    <div className="text-center space-y-2">
                      <div className="w-16 h-16 mx-auto">
                        <IconComponent isSelected={isSelected} color={mood.color} className="w-full h-full" />
                      </div>
                      <div className="font-bold text-sm" style={isSelected ? { color: mood.color } : {}}>
                        {t(`moods.${mood.id}`)}
                      </div>
                      <div className="text-xs text-white/50">{t(`moods.${mood.id}Desc`)}</div>
                    </div>
                  </button>
                )
              })}

              {/* Custom mood */}
              {showMoodCustom ? (
                <div className="relative p-3 rounded-xl border-2 border-[var(--holo-blue)] bg-[var(--holo-blue)]/10 shadow-[0_0_20px_rgba(45,225,252,0.3)] animate-fade-in-up flex flex-col items-center justify-center min-h-[120px]">
                  <input
                    type="text"
                    value={moodCustomText}
                    onChange={(e) => setMoodCustomText(e.target.value)}
                    placeholder={t('customStatePlaceholder')}
                    autoFocus
                    className="w-full bg-transparent border-none text-base text-center focus:outline-none placeholder:text-white/40"
                    onKeyDown={(e) => {
                      if (e.key === 'Enter' && moodCustomText.trim()) setShowMoodCustom(false)
                      if (e.key === 'Escape') { setShowMoodCustom(false); setMoodCustomText(''); setSelectedMood('') }
                    }}
                    onBlur={() => {
                      if (moodCustomText.trim()) setShowMoodCustom(false)
                      else { setShowMoodCustom(false); setSelectedMood('') }
                    }}
                  />
                  <div className="text-xs text-white/50 text-center mt-2">{tc('enterHint')}</div>
                </div>
              ) : moodCustomText ? (
                <button
                  onClick={() => setShowMoodCustom(true)}
                  className={`
                    relative p-3 rounded-xl border-2 transition-all duration-500
                    flex flex-col items-center justify-center min-h-[120px]
                    ${selectedMood === 'custom'
                      ? 'border-[var(--holo-blue)] bg-[var(--holo-blue)]/15 shadow-[0_0_20px_rgba(45,225,252,0.3),0_0_40px_rgba(45,225,252,0.3)]' 
                      : 'border-white/20 bg-white/5 hover:border-[var(--holo-blue)]/50 hover:bg-white/8'
                    }
                  `}
                >
                  {selectedMood === 'custom' && (
                    <div className="absolute -top-2 -right-2 w-6 h-6 rounded-full bg-[var(--cyber-green)] flex items-center justify-center shadow-lg animate-scale-in">
                      <Check className="w-3.5 h-3.5 text-black" />
                    </div>
                  )}
                  <div className="px-3 text-center">
                    <div className="font-semibold text-base leading-snug break-words" style={{ color: selectedMood === 'custom' ? 'var(--holo-blue)' : '#fff' }}>
                      {moodCustomText}
                    </div>
                    <div className="text-xs text-white/50 mt-2">{t('otherMoodCustom')}</div>
                  </div>
                </button>
              ) : (
                <button
                  onClick={() => { setShowMoodCustom(true); setSelectedMood('custom') }}
                  className={`
                    relative p-3 rounded-xl border-2 border-dashed transition-all duration-300
                    ${selectedMood === 'custom'
                      ? 'border-[var(--holo-blue)] bg-[var(--holo-blue)]/10 shadow-[0_0_20px_rgba(45,225,252,0.3)]' 
                      : 'border-white/20 bg-white/5 hover:border-white/40'
                    }
                  `}
                >
                  <div className="text-center space-y-2">
                    <div className="w-16 h-16 mx-auto">
                      <CustomMoodIcon isSelected={selectedMood === 'custom'} className="w-full h-full" />
                    </div>
                    <div className="font-bold text-sm">{t('otherMood')}</div>
                    <div className="text-xs text-white/50">{t('otherMoodCustom')}</div>
                  </div>
                </button>
              )}
            </div>
          </div>

          {/* Section 2: Physical Activity */}
          <div className="space-y-4">
            <div className="flex items-center gap-2">
              <div className="relative">
                <Radio className="w-5 h-5" style={{ color: 'var(--holo-blue)' }} />
                <div className="absolute inset-0 animate-pulse-wave rounded-full" />
              </div>
              <h2 className="font-bold text-base md:text-lg">{t('section2Title')}</h2>
              <span className="text-xs text-white/50">{t('section2Hint')}</span>
              <span className="text-destructive ml-1">*</span>
            </div>

            <div className="flex flex-wrap gap-2">
              {ACTIVITY_IDS.map((actId) => {
                const isSelected = selectedActivities.includes(actId)
                const IconComponent = ACTIVITY_ICONS[actId]
                return (
                  <button
                    key={actId}
                    onClick={() => toggleActivity(actId)}
                    className={`
                      px-4 py-2.5 rounded-full text-sm font-medium
                      border transition-all duration-300 flex items-center gap-2
                      ${isSelected 
                        ? 'bg-[var(--holo-blue)]/20 border-[var(--holo-blue)] text-white shadow-[0_0_15px_rgba(45,225,252,0.3)]' 
                        : 'bg-white/5 border-white/20 text-white/80 hover:bg-white/10 hover:border-white/40'
                      }
                    `}
                  >
                    {isSelected && <Check className="w-3.5 h-3.5" />}
                    <IconComponent isSelected={isSelected} className="w-5 h-5" />
                    <span>{t(`activities.${actId}`)}</span>
                  </button>
                )
              })}

              {customActivities.map((custom, idx) => {
                const isSelected = selectedActivities.includes(`custom_${custom}`)
                return (
                  <button
                    key={`custom_${custom}`}
                    onClick={() => toggleActivity(`custom_${custom}`)}
                    className={`
                      px-4 py-2.5 rounded-full text-sm font-medium
                      border transition-all duration-300 flex items-center gap-2 relative group
                      ${isSelected 
                        ? 'bg-[var(--holo-blue)]/20 border-[var(--holo-blue)] text-white shadow-[0_0_15px_rgba(45,225,252,0.3)]' 
                        : 'bg-white/5 border-white/20 text-white/80 hover:bg-white/10 hover:border-white/40'
                      }
                    `}
                  >
                    {isSelected && <Check className="w-3.5 h-3.5" />}
                    <span>{custom}</span>
                    <button
                      onClick={(e) => {
                        e.stopPropagation()
                        setCustomActivities(prev => prev.filter((_, i) => i !== idx))
                        setSelectedActivities(prev => prev.filter(a => a !== `custom_${custom}`))
                      }}
                      className="ml-1 opacity-0 group-hover:opacity-100 transition-opacity text-white/40 hover:text-red-400"
                    >
                      <X className="w-3.5 h-3.5" />
                    </button>
                  </button>
                )
              })}

              {!showActivityCustom ? (
                <button
                  onClick={() => setShowActivityCustom(true)}
                  className="px-4 py-2.5 rounded-full text-sm font-medium border-2 border-dashed border-white/20 text-white/60 hover:border-white/40 hover:text-white/80 transition-all flex items-center gap-2"
                >
                  <Plus className="w-4 h-4" />
                  <span>{t('otherActivity')}</span>
                </button>
              ) : (
                <input
                  type="text"
                  value={activityCustomText}
                  onChange={(e) => setActivityCustomText(e.target.value)}
                  placeholder={t('customActivityPlaceholder')}
                  autoFocus
                  className="px-4 py-2 rounded-full text-sm bg-[var(--holo-blue)]/10 border-2 border-[var(--holo-blue)] focus:outline-none w-32 placeholder:text-white/40"
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') addCustomActivity()
                    if (e.key === 'Escape') { setShowActivityCustom(false); setActivityCustomText('') }
                  }}
                  onBlur={() => {
                    if (activityCustomText.trim()) addCustomActivity()
                    else { setShowActivityCustom(false); setActivityCustomText('') }
                  }}
                />
              )}
            </div>
          </div>

          {/* Section 3: Distraction */}
          <div className="space-y-4">
            <div className="flex items-center gap-2">
              <div className="relative">
                <AlertTriangle className="w-5 h-5" style={{ color: '#FF9F0A' }} />
                <div className="absolute inset-0 animate-pulse-wave rounded-full" />
              </div>
              <h2 className="font-bold text-base md:text-lg">{t('section3Title')}</h2>
              <span className="text-xs text-white/50">{t('section3Hint')}</span>
            </div>

            <div 
              className={`
                p-5 rounded-xl border-2 transition-all duration-500 backdrop-blur-lg
                ${isDistracted 
                  ? 'bg-black/60 border-[#FF9F0A] shadow-[0_0_25px_rgba(255,159,10,0.3)]' 
                  : 'bg-black/40 border-[#FF9F0A]/30 hover:border-[#FF9F0A]/50'
                }
              `}
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <AlertTriangle className={`w-5 h-5 transition-all duration-300 ${isDistracted ? 'text-[#FF9F0A]' : 'text-white/50'}`} />
                  <div>
                    <div className="font-medium">{t('distractedLabel')}</div>
                    <div className="text-xs text-white/50">
                      {isDistracted ? t('distractedOn') : t('distractedOff')}
                    </div>
                  </div>
                </div>
                <button
                  onClick={() => { setIsDistracted(!isDistracted); if (!isDistracted) setSelectedDistractions([]) }}
                  className={`
                    relative w-14 h-7 rounded-full transition-all duration-300
                    ${isDistracted ? 'bg-[#FF9F0A] shadow-[0_0_15px_rgba(255,159,10,0.4)]' : 'bg-white/20'}
                  `}
                >
                  <div className={`absolute top-1 w-5 h-5 bg-white rounded-full shadow-lg transition-all duration-300 ${isDistracted ? 'left-8' : 'left-1'}`} />
                </button>
              </div>

              {isDistracted && (
                <div className="mt-4 pt-4 border-t border-[#FF9F0A]/20 space-y-3 animate-fade-in-up">
                  <p className="text-sm text-white/70">{t('distractedPrompt')}</p>
                  
                  <div className="flex flex-wrap gap-2">
                    {DISTRACTION_IDS.map((dId) => {
                      const isSelected = selectedDistractions.includes(dId)
                      return (
                        <button
                          key={dId}
                          onClick={() => toggleDistraction(dId)}
                          className={`
                            px-4 py-2.5 rounded-full text-sm font-medium
                            border-2 transition-all duration-300 flex items-center gap-2
                            ${isSelected 
                              ? 'bg-[#FF9F0A]/20 border-[#FF9F0A] text-white shadow-[0_0_15px_rgba(255,159,10,0.3)]' 
                              : 'bg-transparent border-[#FF9F0A]/40 text-white/80 hover:bg-[#FF9F0A]/10 hover:border-[#FF9F0A]/60'
                            }
                          `}
                        >
                          {isSelected && <Check className="w-3.5 h-3.5" />}
                          <span>{t(`distractions.${dId}`)}</span>
                        </button>
                      )
                    })}

                    {customDistractions.map((custom, idx) => {
                      const isSelected = selectedDistractions.includes(`custom_${custom}`)
                      return (
                        <button
                          key={`custom_${custom}`}
                          onClick={() => toggleDistraction(`custom_${custom}`)}
                          className={`
                            px-4 py-2.5 rounded-full text-sm font-medium
                            border-2 transition-all duration-300 flex items-center gap-2 relative group
                            ${isSelected 
                              ? 'bg-[#FF9F0A]/20 border-[#FF9F0A] text-white shadow-[0_0_15px_rgba(255,159,10,0.3)]' 
                              : 'bg-transparent border-[#FF9F0A]/40 text-white/80 hover:bg-[#FF9F0A]/10 hover:border-[#FF9F0A]/60'
                            }
                          `}
                        >
                          {isSelected && <Check className="w-3.5 h-3.5" />}
                          <span>{custom}</span>
                          <button
                            onClick={(e) => {
                              e.stopPropagation()
                              setCustomDistractions(prev => prev.filter((_, i) => i !== idx))
                              setSelectedDistractions(prev => prev.filter(d => d !== `custom_${custom}`))
                            }}
                            className="ml-1 opacity-0 group-hover:opacity-100 transition-opacity text-white/40 hover:text-red-400"
                          >
                            <X className="w-3.5 h-3.5" />
                          </button>
                        </button>
                      )
                    })}

                    {!showDistractionCustom ? (
                      <button
                        onClick={() => setShowDistractionCustom(true)}
                        className="px-4 py-2.5 rounded-full text-sm font-medium border-2 border-dashed border-[#FF9F0A]/40 text-white/60 hover:border-[#FF9F0A]/60 hover:text-white/80 transition-all flex items-center gap-2"
                      >
                        <Plus className="w-4 h-4" />
                        <span>{t('otherDistraction')}</span>
                      </button>
                    ) : (
                      <input
                        type="text"
                        value={distractionCustomText}
                        onChange={(e) => setDistractionCustomText(e.target.value)}
                        placeholder={t('customDistractionPlaceholder')}
                        autoFocus
                        className="px-4 py-2 rounded-full text-sm bg-[#FF9F0A]/10 border-2 border-[#FF9F0A] focus:outline-none w-32 placeholder:text-white/40"
                        onKeyDown={(e) => {
                          if (e.key === 'Enter') addCustomDistraction()
                          if (e.key === 'Escape') { setShowDistractionCustom(false); setDistractionCustomText('') }
                        }}
                        onBlur={() => {
                          if (distractionCustomText.trim()) addCustomDistraction()
                          else { setShowDistractionCustom(false); setDistractionCustomText('') }
                        }}
                      />
                    )}
                  </div>

                  {selectedDistractions.length > 0 && (
                    <div className="p-3 rounded-xl bg-[#FF9F0A]/10 border border-[#FF9F0A]/30 animate-fade-in-up backdrop-blur-md">
                      <p className="text-xs text-center">
                        <span className="font-bold text-[#FF9F0A]">{t('distractionRecorded')}</span>
                        <span className="text-white/60 ml-2">{t('distractionAnalysis')}</span>
                      </p>
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>

          {/* Bottom buttons */}
          <div className="flex flex-col items-center gap-4 pt-6">
            <div className="relative group/btn">
              <button
                onClick={handleNext}
                disabled={!canProceed}
                className="btn-scifi-primary disabled:opacity-40 disabled:cursor-not-allowed"
              >
                {tc('next')}
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
              onClick={() => router.back()}
              className="text-xs text-muted-foreground hover:text-white"
            >
              <ChevronLeft className="w-4 h-4 mr-1" />
              {tc('back')}
            </Button>
          </div>

        </div>
      </main>
    </div>
  )
}
