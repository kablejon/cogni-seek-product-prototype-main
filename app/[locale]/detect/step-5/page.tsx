"use client"

import { useState, useMemo } from "react"
import { useTranslations } from "next-intl"
import { useRouter } from "@/lib/navigation"
import { Button } from "@/components/ui/button"
import { ChevronRight, ChevronLeft, Check, X } from "lucide-react"
import { Header } from "@/components/shared/header"
import { useSearchStore } from "@/lib/store"
import { locationCategories } from "@/lib/data"
import { InteractiveFog } from "@/components/ui/interactive-fog"
import { JustLostIcon, AlreadySearchedIcon } from "@/components/ui/search-status-icons"

const DURATION_IDS = ['10min', '30min', '1-2h', 'half_day'] as const

const SMART_KEYWORDS = [
  'smart', 'electric', 'charg', 'wifi', 'wlan', 'bluetooth', 'bt', 'gps', 'find',
  'phone', 'watch', 'band', 'earphone', 'airpods', 'buds', 'camera', 'gopro',
  'switch', 'kindle', 'tag', 'airtag', 'ipad', 'tablet'
]

const DEVICE_TEXT_KEY_MAP: Record<string, string> = {
  'phone': 'tried_find_phone',
  'tablet': 'tried_find_tablet',
  'laptop': 'tried_find_laptop',
}

export default function Step5Page() {
  const router = useRouter()
  const { session, updateSession } = useSearchStore()
  const t = useTranslations('step5')
  const td = useTranslations('data')
  const tc = useTranslations('common')

  const [hasSearched, setHasSearched] = useState(session.hasSearched || false)
  const [searchDuration, setSearchDuration] = useState(session.searchDuration || '')
  const [searchedLocations, setSearchedLocations] = useState<string[]>(session.searchedLocations || [])
  const [customSearchZones, setCustomSearchZones] = useState<string[]>([])
  const [showCustomZoneInput, setShowCustomZoneInput] = useState(false)
  const [customZoneText, setCustomZoneText] = useState('')
  const [askedOthers, setAskedOthers] = useState(session.askedOthers || false)
  const [triedSmartFeature, setTriedSmartFeature] = useState(session.triedFindMy || false)

  const locationConfig = useMemo(() => {
    const category = session.locationCategory
    const categoryData = locationCategories.find(c => c.id === category)
    const zones = (categoryData?.subLocations || [])
      .map(l => typeof l === 'string' ? { id: l } : l)
      .filter(l => !l.id.includes('other'))
    return { title: t('locationsLabel', { title: td(`locations.${category || 'home'}`) }), zones }
  }, [session.locationCategory, t, td])

  const smartFeatureConfig = useMemo(() => {
    const itemType = session.itemType || session.itemCategory || ''
    const itemName = (session.itemName || '').toLowerCase()
    const itemCategory = session.itemCategory || ''

    if (DEVICE_TEXT_KEY_MAP[itemType]) {
      return { show: true, textKey: DEVICE_TEXT_KEY_MAP[itemType], icon: '📡' }
    }
    if (itemCategory === 'pets') {
      return { show: true, textKey: 'tried_call_pet', icon: '🗣️' }
    }
    const hasSmartKeyword = SMART_KEYWORDS.some(kw => itemName.includes(kw))
    if (hasSmartKeyword) {
      return { show: true, textKey: 'tried_find_smart', icon: '📡' }
    }
    return { show: false, textKey: '', icon: '' }
  }, [session.itemType, session.itemName, session.itemCategory])

  const handleToggleLocation = (locationId: string) => {
    if (searchedLocations.includes(locationId)) {
      setSearchedLocations(searchedLocations.filter(l => l !== locationId))
    } else {
      setSearchedLocations([...searchedLocations, locationId])
    }
  }

  const handleAddCustomZone = () => {
    if (customZoneText.trim() && !customSearchZones.includes(customZoneText.trim())) {
      const newZone = customZoneText.trim()
      setCustomSearchZones([...customSearchZones, newZone])
      setSearchedLocations([...searchedLocations, `custom_${newZone}`])
      setCustomZoneText('')
      setShowCustomZoneInput(false)
    }
  }

  const handleRemoveCustomZone = (zone: string) => {
    setCustomSearchZones(customSearchZones.filter(z => z !== zone))
    setSearchedLocations(searchedLocations.filter(l => l !== `custom_${zone}`))
  }

  const handleNext = () => {
    updateSession({
      hasSearched,
      searchDuration: hasSearched ? searchDuration : '',
      searchedLocations: hasSearched ? searchedLocations : [],
      searchedCustomLocations: hasSearched ? customSearchZones : [],
      askedOthers,
      triedFindMy: smartFeatureConfig.show ? triedSmartFeature : false,
    })
    router.push('/detect/loading')
  }

  const getSmartFeatureText = (textKey: string): string => {
    try {
      return t(`smartFeature.${textKey}`) || textKey
    } catch {
      return textKey
    }
  }

  return (
    <div className="min-h-screen bg-background flex flex-col relative">
      <div className="fixed inset-0 z-0">
        <InteractiveFog color="34, 211, 238" />
      </div>

      <Header currentStep={6} showProgress />

      <main className="container mx-auto px-4 py-6 md:py-10 relative z-10">
        <div className="w-full max-w-4xl mx-auto scifi-container p-6 md:p-8 space-y-6">

          <div className="text-center space-y-2">
            <h1 className="text-2xl md:text-3xl font-bold">{t('title')}</h1>
            <p className="text-base text-white/70">{t('subtitle')}</p>
          </div>

          {/* Search Status Cards */}
          <div className="grid grid-cols-2 gap-4">
            <button onClick={() => setHasSearched(false)}
              className={`relative p-4 rounded-xl border-2 transition-all duration-500 flex flex-col items-center justify-center min-h-[140px] ${!hasSearched ? 'border-[#FF9F0A] bg-[#FF9F0A]/15 shadow-[0_0_20px_rgba(255,159,10,0.3),0_0_40px_rgba(255,159,10,0.2)]' : 'border-white/10 bg-white/5 hover:border-white/20 hover:bg-white/8'}`}>
              {!hasSearched && <div className="absolute -top-2 -right-2 w-6 h-6 rounded-full bg-[#FF9F0A] flex items-center justify-center shadow-lg animate-scale-in"><Check className="w-3.5 h-3.5 text-black" /></div>}
              <div className="w-16 h-16 mb-2"><JustLostIcon isSelected={!hasSearched} className="w-full h-full" /></div>
              <div className="font-bold text-sm" style={!hasSearched ? { color: '#FF9F0A' } : {}}>{t('justLost')}</div>
            </button>

            <button onClick={() => setHasSearched(true)}
              className={`relative p-4 rounded-xl border-2 transition-all duration-500 flex flex-col items-center justify-center min-h-[140px] ${hasSearched ? 'border-[#2DE1FC] bg-[#2DE1FC]/15 shadow-[0_0_20px_rgba(45,225,252,0.3),0_0_40px_rgba(45,225,252,0.2)]' : 'border-white/10 bg-white/5 hover:border-white/20 hover:bg-white/8'}`}>
              {hasSearched && <div className="absolute -top-2 -right-2 w-6 h-6 rounded-full bg-[var(--cyber-green)] flex items-center justify-center shadow-lg animate-scale-in"><Check className="w-3.5 h-3.5 text-black" /></div>}
              <div className="w-16 h-16 mb-2"><AlreadySearchedIcon isSelected={hasSearched} className="w-full h-full" /></div>
              <div className="font-bold text-sm" style={hasSearched ? { color: '#2DE1FC' } : {}}>{t('alreadySearched')}</div>
            </button>
          </div>

          {/* Searched Details */}
          {hasSearched && (
            <div className="space-y-5 animate-fade-in-up">
              {/* Duration */}
              <div className="space-y-3">
                <h2 className="font-bold text-sm text-white/70">{t('durationLabel')}</h2>
                <div className="flex flex-wrap gap-2">
                  {DURATION_IDS.map((dId) => {
                    const isSelected = searchDuration === dId
                    return (
                      <button key={dId} onClick={() => setSearchDuration(dId)}
                        className={`px-3 py-1.5 rounded-full text-xs font-medium border transition-all duration-300 flex items-center gap-1.5 ${isSelected ? 'bg-[#2DE1FC]/20 border-[#2DE1FC] text-[#2DE1FC] shadow-[0_0_10px_rgba(45,225,252,0.3)]' : 'bg-white/5 border-white/20 text-white/80 hover:bg-white/10 hover:border-white/40'}`}>
                        {isSelected && <Check className="w-3 h-3" />}
                        {t(`duration.${dId}`)}
                      </button>
                    )
                  })}
                </div>
              </div>

              {/* Searched Locations */}
              <div className="space-y-3">
                <h2 className="font-bold text-sm text-white/70">
                  {locationConfig.title}
                  <span className="text-xs text-white/50 ml-2">{t('locationsHint')}</span>
                </h2>
                <div className="flex flex-wrap gap-2">
                  {locationConfig.zones.map((location) => {
                    const isSelected = searchedLocations.includes(location.id)
                    return (
                      <button key={location.id} onClick={() => handleToggleLocation(location.id)}
                        className={`px-3 py-1.5 rounded-full text-xs font-medium border transition-all duration-300 flex items-center gap-1.5 ${isSelected ? 'bg-[#2DE1FC]/20 border-[#2DE1FC]/50 text-white shadow-[0_0_10px_rgba(45,225,252,0.2)]' : 'bg-white/5 border-white/20 text-white/80 hover:bg-white/10 hover:border-white/40'}`}>
                        {isSelected && <Check className="w-3 h-3" />}
                        {td(`subLocations.${location.id}`)}
                      </button>
                    )
                  })}

                  {customSearchZones.map((zone, index) => (
                    <div key={`custom_${index}`}
                      className="px-3 py-1.5 rounded-full text-xs font-medium bg-[#2DE1FC]/20 border border-[#2DE1FC]/50 text-white shadow-[0_0_10px_rgba(45,225,252,0.2)] flex items-center gap-1.5 relative group">
                      <Check className="w-3 h-3" />
                      <span>{zone}</span>
                      <button onClick={() => handleRemoveCustomZone(zone)}
                        className="ml-1 opacity-0 group-hover:opacity-100 transition-opacity text-white/40 hover:text-red-400">
                        <X className="w-3 h-3" />
                      </button>
                    </div>
                  ))}

                  {!showCustomZoneInput ? (
                    <button onClick={() => setShowCustomZoneInput(true)}
                      className="px-3 py-1.5 rounded-full text-xs font-medium border-2 border-dashed border-white/30 text-white/60 hover:border-[#2DE1FC]/50 hover:text-white/80 transition-all flex items-center gap-1">
                      <span className="text-sm">+</span> {tc('otherAction')}
                    </button>
                  ) : (
                    <div className="flex items-center gap-2">
                      <input type="text" value={customZoneText} onChange={(e) => setCustomZoneText(e.target.value)}
                        placeholder={tc('inputPlaceholder')} autoFocus
                        className="px-3 py-1.5 rounded-full text-xs bg-[#2DE1FC]/10 border-2 border-[#2DE1FC] focus:outline-none w-28 placeholder:text-white/40"
                        onKeyDown={(e) => { if (e.key === 'Enter') handleAddCustomZone(); if (e.key === 'Escape') { setShowCustomZoneInput(false); setCustomZoneText('') } }}
                        onBlur={() => { if (customZoneText.trim()) handleAddCustomZone(); else setShowCustomZoneInput(false) }} />
                    </div>
                  )}
                </div>
              </div>
            </div>
          )}

          {/* Other Attempts */}
          <div className="space-y-3 pt-4">
            <h2 className="font-bold text-sm text-white/70">{t('othersLabel')}</h2>
            <div className="rounded-xl bg-black/40 backdrop-blur-md border border-white/10 divide-y divide-white/5 overflow-hidden">
              <div className="flex items-center justify-between p-4 hover:bg-white/5 transition-colors">
                <div className="flex items-center gap-3">
                  <span className="text-xl">👥</span>
                  <span className="text-sm">{t('askedOthers')}</span>
                </div>
                <button onClick={() => setAskedOthers(!askedOthers)}
                  className={`relative w-12 h-7 rounded-full transition-all duration-300 ${askedOthers ? 'bg-[var(--cyber-green)] shadow-[0_0_15px_rgba(0,255,157,0.4)]' : 'bg-white/20'}`}>
                  <div className={`absolute top-1 w-5 h-5 bg-white rounded-full shadow-lg transition-all duration-300 ${askedOthers ? 'left-6' : 'left-1'}`} />
                </button>
              </div>
              {smartFeatureConfig.show && (
                <div className="flex items-center justify-between p-4 hover:bg-white/5 transition-colors animate-fade-in-up">
                  <div className="flex items-center gap-3">
                    <span className="text-xl">{smartFeatureConfig.icon}</span>
                    <span className="text-sm">{getSmartFeatureText(smartFeatureConfig.textKey)}</span>
                  </div>
                  <button onClick={() => setTriedSmartFeature(!triedSmartFeature)}
                    className={`relative w-12 h-7 rounded-full transition-all duration-300 ${triedSmartFeature ? 'bg-[var(--cyber-green)] shadow-[0_0_15px_rgba(0,255,157,0.4)]' : 'bg-white/20'}`}>
                    <div className={`absolute top-1 w-5 h-5 bg-white rounded-full shadow-lg transition-all duration-300 ${triedSmartFeature ? 'left-6' : 'left-1'}`} />
                  </button>
                </div>
              )}
            </div>
            <p className="text-xs text-white/40 px-2">{t('toggleHint')}</p>
          </div>

          {/* AI Tip */}
          <div className="p-4 rounded-xl bg-[#2DE1FC]/5 backdrop-blur-lg border border-[#2DE1FC]/25">
            <p className="text-xs text-white/70">
              <span className="font-bold text-[#2DE1FC]">{t('aiTip')}</span>
              <span className="ml-2">{t('aiTipContent')}</span>
            </p>
          </div>

          {/* Buttons */}
          <div className="flex flex-col items-center gap-4 pt-4">
            <button onClick={handleNext} className="btn-scifi-primary">
              {t('startAnalysis')} <ChevronRight className="w-5 h-5" />
            </button>
            <Button variant="ghost" size="sm" onClick={() => router.back()} className="text-xs text-muted-foreground hover:text-white">
              <ChevronLeft className="w-4 h-4 mr-1" /> {tc('back')}
            </Button>
          </div>

        </div>
      </main>
    </div>
  )
}
