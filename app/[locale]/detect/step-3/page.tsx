"use client"

import { useState } from "react"
import { useTranslations } from "next-intl"
import { useRouter } from "@/lib/navigation"
import { Button } from "@/components/ui/button"
import { ChevronRight, ChevronLeft, Check, X } from "lucide-react"
import { Header } from "@/components/shared/header"
import { useSearchStore } from "@/lib/store"
import { InteractiveFog } from "@/components/ui/interactive-fog"

// Holographic scene icons
function HoloHomeIcon({ isSelected }: { isSelected: boolean }) {
  return (
    <svg width="56" height="56" viewBox="0 0 56 56" className={`transition-all duration-500 ${isSelected ? 'drop-shadow-[0_0_15px_rgba(45,225,252,0.8)]' : 'drop-shadow-[0_0_8px_rgba(255,255,255,0.3)]'}`}>
      <defs>
        <linearGradient id="homeGradient" x1="0%" y1="0%" x2="100%" y2="100%"><stop offset="0%" stopColor={isSelected ? 'rgba(45,225,252,0.6)' : 'rgba(255,255,255,0.4)'} /><stop offset="100%" stopColor={isSelected ? 'rgba(45,225,252,0.2)' : 'rgba(255,255,255,0.1)'} /></linearGradient>
        <linearGradient id="homeWarmLight" x1="50%" y1="0%" x2="50%" y2="100%"><stop offset="0%" stopColor={isSelected ? 'rgba(255,200,100,0.8)' : 'rgba(255,200,100,0.4)'} /><stop offset="100%" stopColor="rgba(255,150,50,0.2)" /></linearGradient>
      </defs>
      <path d="M28 8 L48 24 L48 48 L8 48 L8 24 Z" fill="url(#homeGradient)" stroke={isSelected ? 'rgba(45,225,252,0.8)' : 'rgba(255,255,255,0.3)'} strokeWidth="1.5" />
      <path d="M28 8 L48 24 L8 24 Z" fill={isSelected ? 'rgba(45,225,252,0.4)' : 'rgba(255,255,255,0.25)'} stroke={isSelected ? 'rgba(45,225,252,0.9)' : 'rgba(255,255,255,0.4)'} strokeWidth="1" />
      <rect x="18" y="30" width="8" height="10" rx="1" fill="url(#homeWarmLight)" />
      <rect x="30" y="30" width="8" height="10" rx="1" fill="url(#homeWarmLight)" />
      <rect x="23" y="36" width="10" height="12" rx="1" fill={isSelected ? 'rgba(45,225,252,0.5)' : 'rgba(255,255,255,0.2)'} />
      <rect x="38" y="12" width="5" height="10" rx="1" fill={isSelected ? 'rgba(45,225,252,0.3)' : 'rgba(255,255,255,0.15)'} />
    </svg>
  )
}

function HoloBuildingIcon({ isSelected }: { isSelected: boolean }) {
  return (
    <svg width="56" height="56" viewBox="0 0 56 56" className={`transition-all duration-500 ${isSelected ? 'drop-shadow-[0_0_15px_rgba(45,225,252,0.8)]' : 'drop-shadow-[0_0_8px_rgba(255,255,255,0.3)]'}`}>
      <defs><linearGradient id="buildingGradient" x1="0%" y1="0%" x2="100%" y2="100%"><stop offset="0%" stopColor={isSelected ? 'rgba(45,225,252,0.5)' : 'rgba(255,255,255,0.35)'} /><stop offset="100%" stopColor={isSelected ? 'rgba(45,225,252,0.15)' : 'rgba(255,255,255,0.08)'} /></linearGradient></defs>
      <rect x="16" y="12" width="18" height="40" rx="2" fill="url(#buildingGradient)" stroke={isSelected ? 'rgba(45,225,252,0.8)' : 'rgba(255,255,255,0.3)'} strokeWidth="1.5" />
      <rect x="36" y="24" width="12" height="28" rx="2" fill={isSelected ? 'rgba(45,225,252,0.35)' : 'rgba(255,255,255,0.2)'} stroke={isSelected ? 'rgba(45,225,252,0.6)' : 'rgba(255,255,255,0.2)'} strokeWidth="1" />
      {[0,1,2,3].map(r => [0,1].map(c => <rect key={`m-${r}-${c}`} x={20+c*6} y={16+r*9} width="4" height="6" rx="0.5" fill={isSelected ? 'rgba(45,225,252,0.6)' : 'rgba(255,255,255,0.3)'} />))}
      {[0,1,2].map(r => <rect key={`s-${r}`} x={40} y={28+r*8} width="4" height="5" rx="0.5" fill={isSelected ? 'rgba(45,225,252,0.5)' : 'rgba(255,255,255,0.25)'} />)}
      <line x1="25" y1="12" x2="25" y2="6" stroke={isSelected ? 'rgba(45,225,252,0.8)' : 'rgba(255,255,255,0.4)'} strokeWidth="1.5" />
      <circle cx="25" cy="5" r="2" fill={isSelected ? 'rgba(45,225,252,0.9)' : 'rgba(255,255,255,0.5)'} />
    </svg>
  )
}

function HoloTransitIcon({ isSelected }: { isSelected: boolean }) {
  return (
    <svg width="56" height="56" viewBox="0 0 56 56" className={`transition-all duration-500 ${isSelected ? 'drop-shadow-[0_0_15px_rgba(45,225,252,0.8)]' : 'drop-shadow-[0_0_8px_rgba(255,255,255,0.3)]'}`}>
      <defs><linearGradient id="transitGradient" x1="0%" y1="50%" x2="100%" y2="50%"><stop offset="0%" stopColor="transparent" /><stop offset="50%" stopColor={isSelected ? 'rgba(45,225,252,0.6)' : 'rgba(255,255,255,0.4)'} /><stop offset="100%" stopColor="transparent" /></linearGradient></defs>
      <path d="M6 36 Q20 28, 28 32 Q36 36, 50 28" fill="none" stroke="url(#transitGradient)" strokeWidth="3" strokeLinecap="round" strokeDasharray={isSelected ? "none" : "6 4"} />
      <ellipse cx="28" cy="32" rx="14" ry="8" fill={isSelected ? 'rgba(45,225,252,0.35)' : 'rgba(255,255,255,0.2)'} stroke={isSelected ? 'rgba(45,225,252,0.8)' : 'rgba(255,255,255,0.4)'} strokeWidth="1.5" />
      <ellipse cx="28" cy="30" rx="8" ry="4" fill={isSelected ? 'rgba(45,225,252,0.5)' : 'rgba(255,255,255,0.3)'} />
      <circle cx="10" cy="35" r="2" fill={isSelected ? 'rgba(45,225,252,0.6)' : 'rgba(255,255,255,0.3)'} />
      <circle cx="14" cy="33" r="1.5" fill={isSelected ? 'rgba(45,225,252,0.5)' : 'rgba(255,255,255,0.25)'} />
      <circle cx="18" cy="31" r="1" fill={isSelected ? 'rgba(45,225,252,0.4)' : 'rgba(255,255,255,0.2)'} />
      <circle cx="44" cy="30" r="2" fill={isSelected ? 'rgba(45,225,252,0.8)' : 'rgba(255,255,255,0.4)'} />
    </svg>
  )
}

function HoloOutdoorIcon({ isSelected }: { isSelected: boolean }) {
  return (
    <svg width="56" height="56" viewBox="0 0 56 56" className={`transition-all duration-500 ${isSelected ? 'drop-shadow-[0_0_15px_rgba(45,225,252,0.8)]' : 'drop-shadow-[0_0_8px_rgba(255,255,255,0.3)]'}`}>
      <defs><linearGradient id="pinGradient" x1="50%" y1="0%" x2="50%" y2="100%"><stop offset="0%" stopColor={isSelected ? 'rgba(45,225,252,0.8)' : 'rgba(255,255,255,0.5)'} /><stop offset="100%" stopColor={isSelected ? 'rgba(45,225,252,0.3)' : 'rgba(255,255,255,0.15)'} /></linearGradient></defs>
      <path d="M4 44 L28 52 L52 44" fill="none" stroke={isSelected ? 'rgba(45,225,252,0.4)' : 'rgba(255,255,255,0.2)'} strokeWidth="1" />
      <path d="M10 42 L28 48 L46 42" fill="none" stroke={isSelected ? 'rgba(45,225,252,0.3)' : 'rgba(255,255,255,0.15)'} strokeWidth="1" />
      <path d="M28 6 C20 6 14 12 14 20 C14 30 28 40 28 40 C28 40 42 30 42 20 C42 12 36 6 28 6 Z" fill="url(#pinGradient)" stroke={isSelected ? 'rgba(45,225,252,0.9)' : 'rgba(255,255,255,0.4)'} strokeWidth="1.5" />
      <circle cx="28" cy="20" r="6" fill={isSelected ? 'rgba(45,225,252,0.6)' : 'rgba(255,255,255,0.3)'} />
      <circle cx="28" cy="20" r="3" fill={isSelected ? '#2DE1FC' : 'rgba(255,255,255,0.6)'} />
    </svg>
  )
}

const SCENE_ICONS: Record<string, React.ComponentType<{ isSelected: boolean }>> = {
  home: HoloHomeIcon,
  work: HoloBuildingIcon,
  transit: HoloTransitIcon,
  public: HoloOutdoorIcon,
}

const SCENE_SUB_AREAS: Record<string, string[]> = {
  home: ['living_room', 'bedroom', 'kitchen', 'bathroom', 'entrance', 'balcony', 'study', 'garage', 'dining_room'],
  work: ['office_desk', 'meeting_room', 'break_room', 'classroom', 'library', 'reception'],
  public: ['restaurant', 'mall', 'hospital', 'gym', 'hotel', 'cinema', 'bank', 'park', 'parking'],
}

const TRANSIT_GROUPED: Record<string, string[]> = {
  private: ['private_car', 'taxi'],
  public: ['bus_subway', 'train', 'plane', 'bike'],
}
const TRANSIT_ALL = [...TRANSIT_GROUPED.private, ...TRANSIT_GROUPED.public]

const SCENE_IDS = ['home', 'work', 'transit', 'public'] as const

export default function Step3Page() {
  const router = useRouter()
  const { session, updateSession } = useSearchStore()
  const t = useTranslations('step3')
  const td = useTranslations('data')
  const tc = useTranslations('common')

  const [selectedScene, setSelectedScene] = useState<string>(session.locationCategory || '')
  const [selectedSubAreas, setSelectedSubAreas] = useState<string[]>(session.otherVisitedLocations || [])
  const [customLocation, setCustomLocation] = useState(session.locationCustom || '')
  const [customAreasByGroup, setCustomAreasByGroup] = useState<Record<string, string[]>>({})
  const [showCustomAreaInput, setShowCustomAreaInput] = useState<string | false>(false)
  const [customAreaText, setCustomAreaText] = useState('')

  const getCustomAreasForGroup = (groupName: string) => customAreasByGroup[groupName] || []

  const getMissingRequirement = (): string | null => {
    if (!selectedScene) return t('missing.noScene')
    if (selectedSubAreas.length === 0) return t('missing.noArea')
    return null
  }

  const handleSceneSelect = (sceneId: string) => {
    setSelectedScene(sceneId)
    if (sceneId !== selectedScene) {
      setSelectedSubAreas([])
      setShowCustomAreaInput(false)
      setCustomAreaText('')
    }
  }

  const handleSubAreaToggle = (areaId: string) => {
    if (selectedSubAreas.includes(areaId)) {
      setSelectedSubAreas(selectedSubAreas.filter(a => a !== areaId))
    } else {
      setSelectedSubAreas([...selectedSubAreas, areaId])
    }
  }

  const addCustomArea = (groupName: string) => {
    if (customAreaText.trim()) {
      const newArea = `custom_${customAreaText.trim()}`
      const currentGroupAreas = customAreasByGroup[groupName] || []
      setCustomAreasByGroup({ ...customAreasByGroup, [groupName]: [...currentGroupAreas, newArea] })
      setSelectedSubAreas([...selectedSubAreas, newArea])
      setCustomAreaText('')
      setShowCustomAreaInput(false)
    }
  }

  const removeCustomArea = (area: string, groupName: string) => {
    const currentGroupAreas = customAreasByGroup[groupName] || []
    setCustomAreasByGroup({ ...customAreasByGroup, [groupName]: currentGroupAreas.filter(a => a !== area) })
    setSelectedSubAreas(selectedSubAreas.filter(a => a !== area))
  }

  const handleNext = () => {
    if (!selectedScene || selectedSubAreas.length === 0) return
    updateSession({
      locationCategory: selectedScene,
      specificLocation: selectedSubAreas[0],
      locationCustom: customLocation,
      visitedMultipleLocations: selectedSubAreas.length > 1,
      otherVisitedLocations: selectedSubAreas,
    })
    router.push('/detect/step-4')
  }

  const getSubAreaLabel = (areaId: string): string => {
    if (areaId.startsWith('custom_')) return areaId.replace('custom_', '')
    try { return td(`subLocations.${areaId}`) } catch { return areaId }
  }

  const renderAreaChips = (areas: string[], groupName: string) => (
    <div className="flex flex-wrap gap-2">
      {areas.map((areaId) => {
        const isAreaSelected = selectedSubAreas.includes(areaId)
        return (
          <button key={areaId} onClick={() => handleSubAreaToggle(areaId)}
            className={`px-4 py-2 rounded-full text-sm font-medium transition-all duration-300 ${isAreaSelected ? 'bg-transparent border-2 border-[var(--cyber-green)] text-[var(--cyber-green)] shadow-[0_0_15px_rgba(45,225,252,0.3),inset_0_0_10px_rgba(45,225,252,0.1)]' : 'bg-white/[0.03] border border-white/10 text-white/60 hover:bg-white/[0.06] hover:border-white/20 hover:text-white/80'}`}>
            {isAreaSelected && <Check className="w-3.5 h-3.5 inline mr-1.5" />}
            {getSubAreaLabel(areaId)}
          </button>
        )
      })}

      {getCustomAreasForGroup(groupName).map((area, idx) => {
        const isAreaSelected = selectedSubAreas.includes(area)
        return (
          <button key={`custom_${groupName}_${idx}`} onClick={() => handleSubAreaToggle(area)}
            className={`px-4 py-2 rounded-full text-sm font-medium transition-all duration-300 relative group ${isAreaSelected ? 'bg-transparent border-2 border-[var(--cyber-green)] text-[var(--cyber-green)] shadow-[0_0_15px_rgba(45,225,252,0.3),inset_0_0_10px_rgba(45,225,252,0.1)]' : 'bg-white/[0.03] border border-white/10 text-white/60 hover:bg-white/[0.06] hover:border-white/20 hover:text-white/80'}`}>
            {isAreaSelected && <Check className="w-3.5 h-3.5 inline mr-1.5" />}
            <span>{getSubAreaLabel(area)}</span>
            <span onClick={(e) => { e.stopPropagation(); removeCustomArea(area, groupName) }}
              className="ml-2 opacity-0 group-hover:opacity-100 transition-opacity text-white/60 hover:text-red-400 cursor-pointer">
              <X className="w-3.5 h-3.5" />
            </span>
          </button>
        )
      })}

      {showCustomAreaInput !== groupName ? (
        <button onClick={() => setShowCustomAreaInput(groupName)}
          className="px-4 py-2 rounded-full text-sm font-medium border-2 border-dashed border-white/30 text-white/60 hover:border-[var(--cyber-green)]/50 hover:text-white/80 transition-all">
          <span className="text-base mr-1">+</span>{tc('otherAction')}
        </button>
      ) : (
        <input type="text" value={customAreaText} onChange={(e) => setCustomAreaText(e.target.value)}
          placeholder={t('customAreaPlaceholder')} autoFocus
          className="px-4 py-2 rounded-full text-sm bg-[var(--cyber-green)]/10 border-2 border-[var(--cyber-green)] focus:outline-none w-32 placeholder:text-white/40"
          onKeyDown={(e) => { if (e.key === 'Enter') addCustomArea(groupName); if (e.key === 'Escape') { setShowCustomAreaInput(false); setCustomAreaText('') } }}
          onBlur={() => { if (customAreaText.trim()) addCustomArea(groupName); else { setShowCustomAreaInput(false) } }}
        />
      )}
    </div>
  )

  const SceneIcon = selectedScene ? SCENE_ICONS[selectedScene] : null

  return (
    <div className="min-h-screen bg-background flex flex-col relative">
      <div className="fixed inset-0 z-0">
        <InteractiveFog color="14, 165, 233" />
      </div>

      <Header currentStep={4} showProgress />

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

          {/* Scene Cards */}
          <div className="space-y-4">
            <h2 className="text-base md:text-lg font-bold text-white/90">{t('sceneLabel')}</h2>
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
              {SCENE_IDS.map((sceneId, index) => {
                const isSelected = selectedScene === sceneId
                const IconComponent = SCENE_ICONS[sceneId]
                return (
                  <button key={sceneId} onClick={() => handleSceneSelect(sceneId)}
                    className={`group relative rounded-2xl transition-all duration-400 overflow-hidden ${isSelected ? 'bg-gradient-to-br from-[var(--cyber-green)]/20 to-[var(--holo-blue)]/10 border-2 border-[var(--cyber-green)]/60 shadow-[0_0_30px_rgba(45,225,252,0.25),inset_0_1px_1px_rgba(255,255,255,0.1)]' : 'bg-gradient-to-br from-white/[0.05] to-white/[0.02] border border-white/[0.1] hover:from-white/[0.08] hover:to-white/[0.04] hover:border-white/20'}`}
                    style={{ animationDelay: `${index * 0.1}s` }}>
                    {isSelected && <div className="absolute top-3 right-3 w-6 h-6 rounded-full bg-[var(--cyber-green)] flex items-center justify-center shadow-[0_0_12px_rgba(45,225,252,0.8)]"><Check className="w-3.5 h-3.5 text-black" /></div>}
                    <div className="flex flex-col items-center gap-3 py-6 px-4">
                      <div className={`transition-all duration-400 ${isSelected ? 'scale-110' : 'group-hover:scale-105'}`}>
                        <IconComponent isSelected={isSelected} />
                      </div>
                      <div className="text-center">
                        <div className={`font-semibold text-sm transition-colors duration-300 ${isSelected ? 'text-white' : 'text-white/80 group-hover:text-white'}`}>
                          {t(`scenes.${sceneId}`)}
                        </div>
                        <div className={`text-xs mt-1 transition-colors duration-300 ${isSelected ? 'text-white/60' : 'text-white/40 group-hover:text-white/50'}`}>
                          {t(`scenes.${sceneId}Desc`)}
                        </div>
                      </div>
                    </div>
                  </button>
                )
              })}
            </div>
          </div>

          {/* Sub-area Picker */}
          {selectedScene && SceneIcon && (
            <div className="space-y-4 animate-fade-in-up">
              <div className="h-px bg-gradient-to-r from-transparent via-[var(--cyber-green)]/30 to-transparent" />
              <div className="relative rounded-3xl overflow-hidden">
                <div className="absolute inset-0 bg-black/50 backdrop-blur-xl" />
                <div className="absolute inset-0 rounded-3xl border border-[var(--cyber-green)]/30 shadow-[inset_0_1px_1px_rgba(255,255,255,0.05)]" />
                <div className="relative p-6 space-y-5">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-[var(--cyber-green)]/20 to-[var(--holo-blue)]/10 border border-[var(--cyber-green)]/30 flex items-center justify-center">
                      <SceneIcon isSelected={true} />
                    </div>
                    <div className="flex-1">
                      <h3 className="text-lg font-bold">
                        {t('areaLabel', {scene: t(`scenes.${selectedScene}`)})}
                      </h3>
                      <p className="text-xs text-white/40 mt-0.5 flex items-center gap-1.5">
                        <span className="w-1.5 h-1.5 rounded-full bg-[var(--cyber-green)] shadow-[0_0_6px_rgba(45,225,252,0.8)]" />
                        {t('areaHint')}
                      </p>
                    </div>
                  </div>

                  {selectedScene === 'transit' ? (
                    <div className="space-y-4">
                      {Object.entries(TRANSIT_GROUPED).map(([groupKey, areas]) => (
                        <div key={groupKey} className="space-y-2">
                          <div className="text-[10px] text-white/30 font-medium tracking-wider uppercase pl-1">
                            [ {t(`groups.${groupKey}`)} ]
                          </div>
                          {renderAreaChips(areas, groupKey)}
                        </div>
                      ))}
                    </div>
                  ) : (
                    renderAreaChips(SCENE_SUB_AREAS[selectedScene] || [], 'default')
                  )}

                  {selectedSubAreas.length > 0 && (
                    <div className="p-3 rounded-xl bg-[var(--cyber-green)]/5 border border-[var(--cyber-green)]/20">
                      <p className="text-sm text-center">
                        <span className="font-bold text-[var(--cyber-green)]">
                          {t('selectedCount', {count: selectedSubAreas.length})}
                        </span>
                        <span className="text-white/50 ml-2">
                          {selectedSubAreas.slice(0, 3).map(a => getSubAreaLabel(a)).join(' · ')}
                          {selectedSubAreas.length > 3 && '...'}
                        </span>
                      </p>
                    </div>
                  )}
                </div>
              </div>

              {/* Optional additional location */}
              <div className="space-y-2">
                <label className="text-xs font-medium text-white/40 flex items-center gap-2">
                  <span className="w-1 h-1 rounded-full bg-white/40" />
                  {t('otherAreaLabel')}
                </label>
                <div className="relative">
                  <input type="text" value={customLocation} onChange={(e) => setCustomLocation(e.target.value)}
                    placeholder={t(`customAreaPlaceholders.${selectedScene}`)}
                    className="w-full px-5 py-3.5 rounded-xl bg-white/[0.03] backdrop-blur-sm border border-white/10 text-sm text-white placeholder:text-white/25 focus:border-[var(--cyber-green)]/50 focus:bg-white/[0.05] focus:shadow-[0_0_20px_rgba(45,225,252,0.1)] transition-all duration-300" />
                  <div className="absolute bottom-0 left-4 right-4 h-[1px] bg-gradient-to-r from-transparent via-[var(--cyber-green)]/30 to-transparent" />
                </div>
              </div>
            </div>
          )}

          {/* Buttons */}
          <div className="flex flex-col items-center gap-4 pt-6">
            <div className="relative group/btn">
              <button onClick={handleNext} disabled={!selectedScene || selectedSubAreas.length === 0}
                className="btn-scifi-primary disabled:opacity-40 disabled:cursor-not-allowed">
                {tc('next')} <ChevronRight className="w-5 h-5" />
              </button>
              {(!selectedScene || selectedSubAreas.length === 0) && getMissingRequirement() && (
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
