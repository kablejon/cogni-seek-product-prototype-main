"use client"

import { useState, useEffect } from "react"
import { useTranslations } from "next-intl"
import { useRouter } from "@/lib/navigation"
import { Button } from "@/components/ui/button"
import { ChevronRight, ChevronLeft, Check, X } from "lucide-react"
import { Header } from "@/components/shared/header"
import { useSearchStore } from "@/lib/store"
import { itemCategories } from "@/lib/data"
import { InteractiveFog } from "@/components/ui/interactive-fog"
import {
  DailyItemsIcon,
  DigitalIcon,
  DocumentsIcon,
  ValuablesIcon,
  PetIcon,
  OtherItemsIcon
} from "@/components/ui/holographic-icons"
import { ITEM_MAPPING_CONFIG } from "@/lib/config/items"
import { COLOR_ORBS } from "@/lib/config/colors"

const HOLOGRAPHIC_ICONS: Record<string, React.ComponentType<{ isSelected: boolean; className?: string }>> = {
  'daily': DailyItemsIcon,
  'digital': DigitalIcon,
  'documents': DocumentsIcon,
  'valuables': ValuablesIcon,
  'pets': PetIcon,
  'other': OtherItemsIcon,
}

export default function Step1Page() {
  const router = useRouter()
  const { session, updateSession } = useSearchStore()
  const t = useTranslations('step1')
  const td = useTranslations('data')
  const tc = useTranslations('common')

  const [selectedCategory, setSelectedCategory] = useState<string>(session.itemCategory || '')
  const [selectedItem, setSelectedItem] = useState<string>(session.itemName || '')
  const [itemCustomName, setItemCustomName] = useState<string>('')
  const [itemColor, setItemColor] = useState<string>(session.itemColor || '')
  const [customColorText, setCustomColorText] = useState<string>('')
  const [itemFeatures, setItemFeatures] = useState<string>(session.itemFeatures || '')
  const [selectedFeatureTags, setSelectedFeatureTags] = useState<string[]>([])
  const [itemSize, setItemSize] = useState<string>('')
  const [customSizeText, setCustomSizeText] = useState<string>('')
  const [customItemsByCategory, setCustomItemsByCategory] = useState<Record<string, string[]>>({})
  const [showCustomItemInput, setShowCustomItemInput] = useState(false)
  const [customItemText, setCustomItemText] = useState('')

  const currentCategoryCustomItems = customItemsByCategory[selectedCategory] || []
  const currentConfig = ITEM_MAPPING_CONFIG[selectedItem] || ITEM_MAPPING_CONFIG['completely_other']

  useEffect(() => {
    if (selectedItem && currentConfig) {
      if (currentConfig.hideSize && currentConfig.defaultSize) {
        setItemSize(currentConfig.defaultSize)
      } else if (!currentConfig.hideSize) {
        setItemSize('')
      }
      setSelectedFeatureTags([])
      setItemFeatures('')
    }
  }, [selectedItem, currentConfig])

  const getFeatureTags = () => currentConfig?.tags || []

  const handleTagClick = (tag: string) => {
    if (!itemFeatures.includes(tag)) {
      setItemFeatures(itemFeatures ? `${itemFeatures} ${tag}` : tag)
    }
    if (!selectedFeatureTags.includes(tag)) {
      setSelectedFeatureTags([...selectedFeatureTags, tag])
    }
  }

  const addCustomItem = () => {
    if (customItemText.trim() && selectedCategory) {
      const newItem = customItemText.trim()
      const currentItems = customItemsByCategory[selectedCategory] || []
      setCustomItemsByCategory({ ...customItemsByCategory, [selectedCategory]: [...currentItems, newItem] })
      setItemCustomName(newItem)
      setSelectedItem('custom_item')
      setCustomItemText('')
      setShowCustomItemInput(false)
    }
  }

  const removeCustomItem = (item: string) => {
    if (selectedCategory) {
      const currentItems = customItemsByCategory[selectedCategory] || []
      setCustomItemsByCategory({ ...customItemsByCategory, [selectedCategory]: currentItems.filter(i => i !== item) })
      if (itemCustomName === item) { setItemCustomName(''); setSelectedItem('') }
    }
  }

  const showSizeSelector = !currentConfig?.hideSize
  const showColorSelector = !currentConfig?.hideColor

  const canProceed = selectedCategory && selectedItem &&
    ((!selectedItem.endsWith('_other') && selectedItem !== 'completely_other' && selectedItem !== 'custom_item') || (itemCustomName && itemCustomName.trim())) &&
    (!showColorSelector || (itemColor && (itemColor !== 'other' || (customColorText && customColorText.trim())))) &&
    (!showSizeSelector || (itemSize && (itemSize !== 'custom' || (customSizeText && customSizeText.trim()))))

  const getMissingRequirement = (): string | null => {
    if (!selectedCategory) return t('missing.noCategory')
    if (!selectedItem) return t('missing.noItem')
    if ((selectedItem.endsWith('_other') || selectedItem === 'completely_other' || selectedItem === 'custom_item') && (!itemCustomName || !itemCustomName.trim())) return t('missing.noCustomName')
    if (showColorSelector && !itemColor) return t('missing.noColor')
    if (showColorSelector && itemColor === 'other' && (!customColorText || !customColorText.trim())) return t('missing.noCustomColor')
    if (showSizeSelector && !itemSize) return t('missing.noSize')
    if (showSizeSelector && itemSize === 'custom' && (!customSizeText || !customSizeText.trim())) return t('missing.noCustomSize')
    return null
  }

  const handleCategorySelect = (categoryId: string) => {
    setSelectedCategory(categoryId)
    setSelectedItem('')
  }

  const handleItemSelect = (itemId: string) => {
    setSelectedItem(itemId)
    setItemColor('')
    setCustomColorText('')
  }

  const handleNext = () => {
    if (!canProceed) return
    const finalItemName = (selectedItem.endsWith('_other') || selectedItem === 'completely_other' || selectedItem === 'custom_item')
      ? itemCustomName
      : selectedItem
    updateSession({
      itemCategory: selectedCategory,
      itemName: finalItemName,
      itemColor: showColorSelector ? (itemColor === 'other' ? customColorText : itemColor) : 'N/A',
      itemFeatures: itemFeatures,
      itemSize: (showSizeSelector && itemSize === 'custom' ? customSizeText : itemSize) as 'small' | 'medium' | 'large',
    })
    router.push('/detect/step-2')
  }

  const SIZE_OPTIONS = [
    { id: 'small', label: t('sizeTiny') },
    { id: 'medium', label: t('sizeSmall') },
    { id: 'large', label: t('sizeMedium') },
    { id: 'custom', label: t('sizeLarge') },
  ]

  return (
    <div className="min-h-screen bg-background flex flex-col relative">
      <div className="fixed inset-0 z-0">
        <InteractiveFog particleCount={80} color="30, 64, 175" />
      </div>

      <Header currentStep={2} showProgress />

      <main className="container mx-auto px-4 py-8 md:py-12 relative z-10">
        <div className="w-full max-w-5xl mx-auto scifi-container p-6 md:p-10 space-y-8">

          <div className="text-center space-y-2">
            <h1 className="text-2xl md:text-3xl font-bold">{t('title')}</h1>
            <p className="text-base md:text-lg text-white/70">{t('subtitle')}</p>
          </div>

          {/* Category Grid */}
          <div className="space-y-4">
            <h2 className="text-base md:text-lg font-bold text-white/90">{t('categoryLabel')}</h2>
            <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
              {itemCategories.map((category) => {
                const HolographicIcon = HOLOGRAPHIC_ICONS[category.id] || OtherItemsIcon
                const isSelected = selectedCategory === category.id
                return (
                  <button
                    key={category.id}
                    onClick={() => handleCategorySelect(category.id)}
                    className={`relative overflow-hidden rounded-2xl transition-all duration-500 ease-out ${isSelected ? 'bg-gradient-to-br from-[#2DE1FC]/20 to-[#0EA5E9]/10 border-2 border-[var(--holo-blue)] shadow-[0_0_30px_rgba(45,225,252,0.4)] -translate-y-1.5' : 'bg-white/5 border border-white/10 hover:bg-white/8 hover:border-white/20'} group backdrop-blur-md`}
                    style={{ boxShadow: isSelected ? '0 0 30px rgba(45,225,252,0.4), inset 0 0 20px rgba(45,225,252,0.1)' : 'none' }}
                  >
                    {isSelected && <div className="absolute inset-0 bg-gradient-radial from-[#2DE1FC]/10 via-transparent to-transparent opacity-60 animate-pulse" style={{ background: 'radial-gradient(circle at 50% 50%, rgba(45,225,252,0.15), transparent 70%)' }} />}
                    {isSelected && <div className="check-glow"><Check className="w-3 h-3 text-black" /></div>}
                    <div className="relative flex flex-col items-center gap-3 py-6 px-4">
                      <div className={`w-20 h-20 transition-all duration-500 ${isSelected ? 'scale-110 drop-shadow-[0_0_15px_rgba(45,225,252,0.6)]' : 'group-hover:scale-105'}`}>
                        <HolographicIcon isSelected={isSelected} className="w-full h-full" />
                      </div>
                      <span className={`text-sm font-medium transition-all duration-300 ${isSelected ? 'text-white drop-shadow-[0_0_8px_rgba(45,225,252,0.8)]' : 'text-white/80 group-hover:text-white'}`}>
                        {td(`categories.${category.id}`)}
                      </span>
                    </div>
                    {isSelected && <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-[#2DE1FC] to-transparent opacity-60" />}
                  </button>
                )
              })}
            </div>
          </div>

          {/* Item Selector */}
          {selectedCategory && (
            <div className="space-y-4 animate-fade-in-up">
              <h2 className="text-base md:text-lg font-bold text-white/90">{t('itemLabel')}</h2>
              <div className="flex flex-wrap gap-2">
                {itemCategories.find(c => c.id === selectedCategory)?.items.filter(item =>
                  !item.id.endsWith('_other') && item.id !== 'completely_other'
                ).map((item) => (
                  <button key={item.id} onClick={() => handleItemSelect(item.id)}
                    className={`chip ${selectedItem === item.id ? 'chip-selected' : ''}`}>
                    {selectedItem === item.id && <Check className="w-3 h-3" />}
                    {td(`items.${item.id}`)}
                  </button>
                ))}

                {currentCategoryCustomItems.map((item, idx) => (
                  <button key={`custom_${idx}`}
                    onClick={() => { setSelectedItem('custom_item'); setItemCustomName(item) }}
                    className={`chip ${itemCustomName === item ? 'chip-selected' : ''} relative group`}>
                    {itemCustomName === item && <Check className="w-3 h-3" />}
                    <span>{item}</span>
                    <span onClick={(e) => { e.stopPropagation(); removeCustomItem(item) }}
                      className="ml-2 opacity-0 group-hover:opacity-100 transition-opacity text-white/60 hover:text-red-400 cursor-pointer">
                      <X className="w-3.5 h-3.5" />
                    </span>
                  </button>
                ))}

                {itemCategories.find(c => c.id === selectedCategory)?.items.filter(item =>
                  item.id.endsWith('_other') || item.id === 'completely_other'
                ).map((item) => {
                  if (showCustomItemInput) {
                    return (
                      <input key={item.id} type="text" value={customItemText}
                        onChange={(e) => setCustomItemText(e.target.value)}
                        placeholder={t('customItemPlaceholder')} autoFocus
                        className="px-4 py-2 rounded-full text-sm bg-[var(--holo-blue)]/10 border-2 border-[var(--holo-blue)] focus:outline-none w-40 placeholder:text-white/40"
                        onKeyDown={(e) => { if (e.key === 'Enter') addCustomItem(); if (e.key === 'Escape') { setShowCustomItemInput(false); setCustomItemText('') } }}
                        onBlur={() => { if (customItemText.trim()) addCustomItem(); else setShowCustomItemInput(false) }}
                      />
                    )
                  }
                  return (
                    <button key={item.id} onClick={() => setShowCustomItemInput(true)} className="chip border-dashed">
                      {td(`items.${item.id}`)}
                    </button>
                  )
                })}
              </div>
            </div>
          )}

          {/* Color Selector */}
          {selectedItem && showColorSelector && (
            <div className="space-y-4 animate-fade-in-up delay-100">
              <h2 className="text-base md:text-lg font-bold text-white/90">{t('colorLabel')}</h2>
              <div className="overflow-x-auto overflow-y-visible py-3 pb-2 hide-scrollbar" style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}>
                <div className="flex gap-4 min-w-max px-1">
                  {COLOR_ORBS.map((orb) => {
                    const isSelected = itemColor === orb.id
                    return (
                      <div key={orb.id} className="flex flex-col items-center gap-1 flex-shrink-0" style={{ minHeight: '80px' }}>
                        <button onClick={() => setItemColor(orb.id)}
                          className={`relative w-12 h-12 rounded-full transition-all duration-500 ease-out ${isSelected ? 'scale-105 -translate-y-0.5' : 'hover:scale-105'} ${orb.type === 'custom' ? 'flex items-center justify-center' : ''}`}
                          style={orb.type === 'solid' ? { background: orb.gradient, boxShadow: isSelected ? '0 0 0 2px #2DE1FC, 0 0 20px rgba(45, 225, 252, 0.5), inset 0 2px 8px rgba(255,255,255,0.3)' : 'inset 0 2px 8px rgba(255,255,255,0.2)' }
                            : orb.type === 'nebula' ? { background: 'radial-gradient(circle at 30% 30%, rgba(255,100,100,0.8), transparent 50%), radial-gradient(circle at 70% 70%, rgba(100,100,255,0.8), transparent 50%), radial-gradient(circle at 30% 70%, rgba(255,255,100,0.8), transparent 50%), radial-gradient(circle at 70% 30%, rgba(255,0,255,0.8), transparent 50%), #222', filter: 'blur(0.5px)', border: isSelected ? '2px solid #2DE1FC' : '1px solid rgba(255,255,255,0.1)', boxShadow: isSelected ? '0 0 20px rgba(45,225,252,0.5)' : 'none' }
                            : orb.type === 'glass' ? { background: 'rgba(255,255,255,0.05)', border: isSelected ? '2px solid #2DE1FC' : '1.5px solid rgba(255,255,255,0.6)', boxShadow: isSelected ? 'inset 2px 2px 6px rgba(255,255,255,0.3), 0 0 20px rgba(45,225,252,0.5)' : 'inset 2px 2px 6px rgba(255,255,255,0.3)', position: 'relative' as const }
                            : { background: 'transparent', border: isSelected ? '2px solid #2DE1FC' : '2px dashed rgba(255,255,255,0.4)', boxShadow: isSelected ? '0 0 20px rgba(45,225,252,0.5)' : 'none' }
                          }>
                          {orb.type === 'glass' && <div className="absolute rounded-full bg-white" style={{ top: '15%', left: '15%', width: '25%', height: '15%', opacity: 0.8, filter: 'blur(1px)', transform: 'rotate(-45deg)' }} />}
                          {orb.type === 'custom' && <div className="text-white/70 text-xl font-light">+</div>}
                        </button>
                        {isSelected && <span className="text-[11px] text-white/90 mt-1 animate-fade-in-up whitespace-nowrap" style={{ textShadow: '0 0 8px rgba(45,225,252,0.8)' }}>{td(`colors.${orb.id}`)}</span>}
                      </div>
                    )
                  })}
                </div>
              </div>
              {itemColor === 'other' && (
                <input type="text" value={customColorText} onChange={(e) => setCustomColorText(e.target.value)}
                  placeholder={t('customColorPlaceholder')}
                  className="w-full px-4 py-2.5 rounded-xl bg-white/5 border border-white/10 text-sm focus:border-[var(--holo-blue)] focus:ring-2 focus:ring-[var(--holo-blue)]/20 transition-all" />
              )}
            </div>
          )}

          {/* Feature Tags */}
          {selectedItem && (
            <div className="space-y-3 animate-fade-in-up delay-200">
              <h2 className="text-base md:text-lg font-bold text-white/90">{t('featureLabel')}</h2>
              <div className="flex flex-wrap gap-2 pb-2">
                {getFeatureTags().map((tag, index) => {
                  const isSelected = selectedFeatureTags.includes(tag)
                  return (
                    <button key={index} onClick={() => handleTagClick(tag)}
                      className={`px-4 py-2 rounded-full text-xs font-medium border transition-all duration-300 ${isSelected ? 'bg-[var(--holo-blue)]/30 border-[var(--holo-blue)] text-white shadow-[0_0_15px_rgba(45,225,252,0.3)] scale-105' : 'bg-white/10 border-white/20 text-white/80 hover:bg-white/15 hover:border-white/30'}`}
                      style={{ height: '32px' }}>
                      {tag}
                    </button>
                  )
                })}
              </div>
              <textarea value={itemFeatures} onChange={(e) => setItemFeatures(e.target.value)}
                placeholder={t('featurePlaceholder')}
                className="w-full px-4 py-3 rounded-xl bg-white/5 border border-white/10 text-sm min-h-[80px] focus:border-[var(--holo-blue)] focus:ring-2 focus:ring-[var(--holo-blue)]/20 transition-all resize-none" />
            </div>
          )}

          {/* Size Selector */}
          {selectedItem && showSizeSelector && (
            <div className="space-y-4 animate-slide-up">
              <h2 className="text-base md:text-lg font-bold text-white/90">{t('sizeLabel')}</h2>
              <div className="grid grid-cols-4 gap-3">
                {SIZE_OPTIONS.map((sizeOpt) => (
                  <button key={sizeOpt.id} onClick={() => setItemSize(sizeOpt.id)}
                    className={`group relative h-[90px] rounded-2xl transition-all duration-400 overflow-hidden ${itemSize === sizeOpt.id ? 'bg-gradient-to-br from-[var(--cyber-green)]/25 to-[var(--holo-blue)]/15 border-2 border-[var(--cyber-green)]/70 shadow-[0_0_25px_rgba(45,225,252,0.35),inset_0_1px_1px_rgba(255,255,255,0.1)]' : 'bg-gradient-to-br from-white/[0.05] to-white/[0.02] border border-white/[0.12] hover:from-white/[0.08] hover:to-white/[0.04] hover:border-white/20'}`}>
                    <div className="flex flex-col items-center justify-center h-full gap-3">
                      <div className={`w-8 h-8 rounded-full border-2 transition-all ${itemSize === sizeOpt.id ? 'border-[var(--cyber-green)] bg-[var(--cyber-green)]/20' : 'border-white/30 bg-white/5'}`} style={{ transform: sizeOpt.id === 'small' ? 'scale(0.6)' : sizeOpt.id === 'medium' ? 'scale(0.8)' : sizeOpt.id === 'large' ? 'scale(1.0)' : 'scale(1.2)' }} />
                      <span className={`text-xs font-medium tracking-wide transition-all duration-300 ${itemSize === sizeOpt.id ? 'text-white' : 'text-white/50 group-hover:text-white/70'}`}>{sizeOpt.label}</span>
                    </div>
                  </button>
                ))}
              </div>
              {itemSize === 'custom' && (
                <div className="space-y-3 animate-fade-in-up">
                  <div className="relative">
                    <input type="text" value={customSizeText} onChange={(e) => setCustomSizeText(e.target.value)}
                      placeholder={t('customSizePlaceholder')}
                      className="w-full px-5 py-4 rounded-xl bg-gradient-to-r from-white/[0.04] to-white/[0.02] backdrop-blur-sm border border-white/10 text-sm text-white placeholder:text-white/30 focus:border-[var(--cyber-green)]/50 focus:bg-white/[0.06] transition-all duration-300" />
                    <div className="absolute bottom-0 left-4 right-4 h-[1px] bg-gradient-to-r from-transparent via-[var(--cyber-green)]/40 to-transparent" />
                  </div>
                  <div className="flex items-center gap-2 px-1">
                    <div className="w-1 h-1 rounded-full bg-[var(--cyber-green)] shadow-[0_0_6px_rgba(45,225,252,0.8)]" />
                    <p className="text-[11px] text-white/40">{t('customSizeHint')}</p>
                  </div>
                </div>
              )}
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
            <Button variant="ghost" size="sm" onClick={() => router.push('/detect/step-0')} className="text-xs text-muted-foreground hover:text-white">
              <ChevronLeft className="w-4 h-4 mr-1" /> {tc('back')}
            </Button>
          </div>

        </div>
      </main>

      <style jsx>{`
        @keyframes slide-up { from { opacity: 0; transform: translateY(20px); } to { opacity: 1; transform: translateY(0); } }
        .animate-slide-up { animation: slide-up 0.4s ease-out; }
      `}</style>
    </div>
  )
}
