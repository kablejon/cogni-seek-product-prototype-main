"use client"

import { useState, useEffect, useMemo, useRef } from "react"
import { useTranslations, useLocale } from "next-intl"
import { useRouter } from "@/lib/navigation"
import domtoimage from "dom-to-image-more"
import {
  Brain, MapPin, Lock, ArrowRight, ShieldCheck, Zap, ScanLine, Activity,
  CarFront, Armchair, Briefcase, Microscope, Stethoscope, Waves,
  Search, CheckCircle2, Download, Home
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { useSearchStore } from "@/lib/store"
import { PRICE_CONFIG } from "@/lib/config/pricing"
import { getDefaultAnalysisResult } from "@/lib/ai-service"

const SCENE_CONFIG_BASE = {
  vehicle: {
    icon: CarFront,
    macroZonesBase: [{ t: '35%', l: '30%' }, { t: '65%', l: '70%' }, { t: '50%', l: '50%' }]
  },
  home: {
    icon: Armchair,
    macroZonesBase: [{ t: '60%', l: '20%' }, { t: '60%', l: '80%' }, { t: '40%', l: '50%' }]
  },
  default: {
    icon: Briefcase,
    macroZonesBase: [{ t: '30%', l: '30%' }, { t: '70%', l: '70%' }, { t: '50%', l: '50%' }]
  }
}

export default function ReportPage() {
  const router = useRouter()
  const t = useTranslations('report')
  const locale = useLocale()
  const { session, resetSession, analysisResult } = useSearchStore()
  const [isPaid, setIsPaid] = useState(false)
  const [loadingPay, setLoadingPay] = useState(false)
  const [caseId, setCaseId] = useState(0)
  const [isGenerating, setIsGenerating] = useState(false)
  const reportRef = useRef<HTMLDivElement>(null)

  useEffect(() => { setCaseId(Math.floor(Math.random() * 10000)) }, [])

  const aiResult = useMemo(() => analysisResult || getDefaultAnalysisResult(session, locale), [analysisResult, session, locale])

  const levelLabel = useMemo(() => {
    if (aiResult.probabilityLevel === 'High') return t('levelHigh')
    if (aiResult.probabilityLevel === 'Low') return t('levelLow')
    return t('levelMedium')
  }, [aiResult.probabilityLevel, t])

  const content = useMemo(() => ({
    psychology: {
      title: t('psychTitle'),
      content: aiResult.behaviorAnalysis || '',
      tag: levelLabel
    },
    envSummary: {
      complexity: aiResult.probabilityLevel === 'High' ? t('levelHigh') : t('levelMedium'),
      camouflage: aiResult.probabilityLevel === 'High' ? t('levelHigh') : t('levelMedium'),
      desc: aiResult.environmentAnalysis || ''
    },
    macroReview: aiResult.summary || '',
    actions: (aiResult.checklist || []).slice(0, 5).map((item, index) => ({
      title: `${t('actionPrefix')} ${index + 1}`,
      desc: item
    }))
  }), [aiResult, t, levelLabel])

  const currentSceneBase = useMemo(() => {
    const cat = (session.locationCategory || 'default').toLowerCase()
    if (cat === 'vehicle') return SCENE_CONFIG_BASE.vehicle
    if (cat === 'home') return SCENE_CONFIG_BASE.home
    return SCENE_CONFIG_BASE.default
  }, [session])

  const currentSceneLabel = useMemo(() => {
    const cat = (session.locationCategory || 'default').toLowerCase()
    if (cat === 'vehicle') return t('sceneLabelVehicle')
    if (cat === 'home') return t('sceneLabelHome')
    return t('sceneLabelDefault')
  }, [session, t])

  const SceneIcon = currentSceneBase.icon

  const fallbackZoneLabels = useMemo(() => {
    const cat = (session.locationCategory || 'default').toLowerCase()
    if (cat === 'vehicle') return [t('vehicleZoneA'), t('vehicleZoneB'), t('vehicleZoneC')]
    if (cat === 'home') return [t('homeZoneA'), t('homeZoneB'), t('homeZoneC')]
    return [t('defaultZoneA'), t('defaultZoneB'), t('defaultZoneC')]
  }, [session, t])

  const dynamicMacroZones = useMemo(() => {
    const baseZones = currentSceneBase.macroZonesBase
    const basicPoints = aiResult.basicSearchPoints || []
    return baseZones.map((zone, index) => ({ t: zone.t, l: zone.l, label: basicPoints[index] || fallbackZoneLabels[index] }))
  }, [currentSceneBase, aiResult.basicSearchPoints, fallbackZoneLabels])

  const [recoveryIndex, setRecoveryIndex] = useState("85.0")
  useEffect(() => { setRecoveryIndex((aiResult.probability || 85).toFixed(1)) }, [aiResult])

  const handleUnlock = () => {
    setLoadingPay(true)
    setTimeout(() => { setLoadingPay(false); setIsPaid(true) }, 1500)
  }

  const handleReturnHome = () => { resetSession(); router.push('/') }

  const handleGeneratePoster = async () => {
    setIsGenerating(true)
    try {
      const reportElement = reportRef.current
      if (!reportElement) throw new Error('Report element not found')
      const footerElement = document.querySelector('[class*="fixed bottom-0"]') as HTMLElement
      if (footerElement) footerElement.style.display = 'none'
      const dataUrl = await domtoimage.toPng(reportElement, {
        quality: 1, bgcolor: '#020617',
        style: { 'transform': 'none', 'color-scheme': 'dark' },
        filter: (node: Node) => {
          if (node instanceof HTMLElement) {
            const className = node.className || ''
            if (typeof className === 'string' && className.includes('fixed') && className.includes('bottom-0')) return false
          }
          return true
        }
      })
      if (footerElement) footerElement.style.display = ''
      const link = document.createElement('a')
      link.href = dataUrl
      link.download = `CogniSeek-Report-CASE${caseId}.png`
      document.body.appendChild(link); link.click(); document.body.removeChild(link)
    } catch (error) {
      console.error('Failed to generate report:', error)
      const usePrint = confirm(t('imageGenFailed'))
      if (usePrint) window.print()
    } finally { setIsGenerating(false) }
  }

  const cjkFontStack = '"Inter", "Noto Sans SC", "Noto Sans TC", system-ui, sans-serif';

  return (
    <div
      ref={reportRef}
      className="min-h-screen bg-[#020617] text-slate-200 font-mono selection:bg-cyan-500/30 selection:text-cyan-200 relative overflow-hidden flex flex-col"
      style={{ fontFamily: cjkFontStack }}
    >
      <div className="absolute inset-0 pointer-events-none opacity-20"
        style={{ backgroundImage: 'linear-gradient(#1e3a8a 1px, transparent 1px), linear-gradient(90deg, #1e3a8a 1px, transparent 1px)', backgroundSize: '40px 40px' }} />
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[800px] h-[300px] bg-blue-600/10 blur-[100px] pointer-events-none" />

      <header className="sticky top-0 z-50 bg-[#020617]/80 backdrop-blur-md border-b border-blue-900/30 px-6 py-4 flex justify-between items-center">
        <div className="flex items-center gap-2">
          <div className="w-6 h-6 bg-cyan-950/50 border border-cyan-400 text-cyan-400 rounded flex items-center justify-center">
            <Activity className="w-3 h-3" />
          </div>
          <span className="font-bold tracking-tight text-sm text-cyan-100">
            CogniSeek <span className="text-cyan-700">///</span> MED-SCAN
          </span>
        </div>
        <div className="flex items-center gap-3">
          <div className="w-2 h-2 bg-cyan-500 rounded-full animate-pulse" />
          <div className="text-[10px] font-mono text-cyan-700 bg-blue-950/30 border border-blue-900 px-2 py-1 rounded">CASE #{caseId}</div>
          <button onClick={handleGeneratePoster} disabled={isGenerating}
            className="p-2 rounded bg-cyan-950/50 border border-cyan-500/30 text-cyan-400 hover:bg-cyan-950 hover:border-cyan-400 transition-all group disabled:opacity-50 disabled:cursor-not-allowed"
            title={isGenerating ? t('unlocking') : t('downloadReport')}>
            <Download className={`w-4 h-4 group-hover:scale-110 transition-transform ${isGenerating ? 'animate-bounce' : ''}`} />
          </button>
        </div>
      </header>

      <main className="flex-1 max-w-xl mx-auto px-6 py-8 space-y-8 overflow-y-auto w-full pb-32">

        {/* Recovery Index */}
        <section className="text-center space-y-2 relative">
          <h1 className="text-7xl font-bold tracking-tighter text-white drop-shadow-[0_0_25px_rgba(34,211,238,0.3)]">{recoveryIndex}</h1>
          <div className="flex items-center justify-center gap-3 text-[10px] font-bold tracking-[0.2em] text-cyan-500 uppercase mt-2">
            <span className="px-2 py-0.5 border border-cyan-500/30 rounded bg-cyan-950/30">{t('analysisComplete')}</span>
            <span className="text-slate-600">|</span>
            <span>{t('probabilityLabel')}</span>
          </div>
          <div className="max-w-xs mx-auto mt-4 p-2 bg-blue-950/20 rounded border border-blue-900/30">
            <p className="text-[10px] text-slate-500 leading-relaxed scale-90">{t('aiDisclaimer')}</p>
          </div>
        </section>

        {/* Holographic Map */}
        <section className="relative w-full aspect-video bg-[#0B1121] border border-blue-800/30 rounded-xl overflow-hidden group shadow-[0_0_40px_rgba(2,6,23,0.8)_inset]">
          <div className="absolute top-4 left-4 w-12 h-[1px] bg-cyan-500/30" />
          <div className="absolute bottom-4 right-4 w-[1px] h-12 bg-cyan-500/30" />
          <div className="absolute inset-0 bg-gradient-to-b from-transparent via-cyan-500/5 to-transparent h-[20%] animate-scan-slow pointer-events-none" />
          <div className="absolute inset-0 flex items-center justify-center">
            <SceneIcon strokeWidth={0.5} className="w-56 h-56 text-blue-800/40" />
          </div>

          {!isPaid && dynamicMacroZones.map((zone, i) => (
            <div key={i} className="absolute" style={{ top: zone.t, left: zone.l }}>
              <div className="relative flex flex-col items-center justify-center -translate-x-1/2 -translate-y-1/2 group/zone">
                <div className="absolute w-16 h-16 bg-amber-500/10 rounded-full blur-xl animate-pulse" />
                <div className="absolute w-8 h-8 border border-amber-500/30 rounded-full flex items-center justify-center animate-[spin_8s_linear_infinite]">
                  <div className="w-1 h-1 bg-amber-500/50 rounded-full" />
                </div>
                <div className="absolute top-6 px-2 py-0.5 bg-amber-950/80 border border-amber-500/30 backdrop-blur-sm rounded text-[9px] font-bold text-amber-500 tracking-widest whitespace-nowrap z-10">
                  Zone {i + 1}
                </div>
              </div>
            </div>
          ))}

          {isPaid && (
            <div className="absolute" style={{ top: '65%', left: '60%' }}>
              <div className="relative -translate-x-1/2 -translate-y-1/2">
                <span className="absolute inline-flex h-full w-full rounded-full bg-red-500 opacity-20 animate-ping"></span>
                <span className="relative inline-flex rounded-full h-3 w-3 bg-red-500 shadow-[0_0_20px_#ef4444]"></span>
                <div className="absolute left-10 top-[-20px] bg-red-950/90 border border-red-500/50 px-2 py-1 rounded">
                  <div className="text-[10px] text-red-400 font-bold whitespace-nowrap flex items-center gap-1">
                    <MapPin className="w-3 h-3" /> {t('precisionPin')}
                  </div>
                </div>
              </div>
            </div>
          )}

          <div className="absolute bottom-0 left-0 right-0 py-2 bg-[#0B1121]/90 border-t border-blue-900/30 flex justify-center backdrop-blur-sm">
            {!isPaid ? (
              <div className="flex items-center gap-2 text-[10px] text-amber-500 font-bold tracking-wide">
                <ScanLine className="w-3 h-3" /> {t('basicSearchTitle')}
              </div>
            ) : (
              <div className="flex items-center gap-2 text-[10px] text-red-400 font-bold tracking-wide">
                <ShieldCheck className="w-3 h-3" /> {t('deepScanDecrypted')}
              </div>
            )}
          </div>
        </section>

        {/* Diagnostic Report */}
        <section className="space-y-4">
          <h2 className="text-[10px] font-bold text-slate-500 uppercase tracking-widest px-1 flex items-center gap-2">
            <Microscope className="w-3 h-3" /> {t('diagnosisTitle')}
          </h2>
          <div className="bg-[#0f172a]/40 p-4 rounded-lg border border-blue-800/20 backdrop-blur-sm flex gap-4 items-start">
            <div className="p-2 bg-indigo-950/40 text-indigo-400 border border-indigo-500/20 rounded-md shrink-0">
              <Waves className="w-5 h-5" />
            </div>
            <div className="flex-1 space-y-2">
              <div className="flex justify-between items-center border-b border-indigo-500/10 pb-2">
                <h3 className="font-bold text-sm text-indigo-100">{t('envScanTitle')}</h3>
                <span className="text-[9px] px-1.5 py-0.5 rounded bg-indigo-950 text-indigo-300 border border-indigo-500/20">{t('completed')}</span>
              </div>
              <div className="grid grid-cols-2 gap-2 text-[10px] text-slate-400">
                <div>{t('complexity')}: <span className="text-indigo-300">{content.envSummary.complexity}</span></div>
                <div>{t('camouflage')}: <span className="text-red-300">{content.envSummary.camouflage}</span></div>
              </div>
              <p className="text-xs text-slate-400 leading-relaxed">{content.envSummary.desc}</p>
            </div>
          </div>

          <div className="bg-[#0f172a]/40 p-4 rounded-lg border border-blue-800/20 backdrop-blur-sm flex gap-4 items-start hover:border-blue-500/30 transition-colors">
            <div className="p-2 bg-blue-950/40 text-blue-400 border border-blue-500/20 rounded-md shrink-0">
              <Brain className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-bold text-sm text-blue-100">{t('psychTitle')}</h3>
              <p className="text-xs text-slate-400 mt-2 leading-relaxed">{content.psychology.content}</p>
              <div className="mt-3 inline-flex items-center text-[10px] font-medium text-blue-300 bg-blue-900/30 px-2 py-0.5 rounded border border-blue-500/20">
                {t('cognitiveOverride')}: {content.psychology.tag}
              </div>
            </div>
          </div>
        </section>

        {/* Tactical Protocol */}
        <section>
          <div className="flex justify-between items-end mb-4 px-1">
            <h2 className="text-[10px] font-bold text-slate-500 uppercase tracking-widest flex items-center gap-2">
              <Stethoscope className="w-3 h-3" /> {t('tacticsTitle')}
            </h2>
            {!isPaid && <span className="text-[10px] font-bold text-cyan-600 flex items-center gap-1 opacity-80"><Lock className="w-3 h-3" /> {t('deepScanEncrypted')}</span>}
          </div>

          <div className="space-y-3">
            {!isPaid && (
              <div className="p-4 bg-amber-950/10 border border-amber-500/20 rounded-lg">
                <div className="flex items-center gap-2 mb-2 text-amber-500">
                  <CheckCircle2 className="w-4 h-4" />
                  <h4 className="text-xs font-bold">{t('basicLabel')}</h4>
                </div>
                <p className="text-[10px] text-slate-400 mb-3">{t('basicSearchDesc')}</p>
                <ul className="space-y-2 mb-3">
                  {dynamicMacroZones.map((z, i) => (
                    <li key={i} className="flex items-start gap-2 text-[10px] text-slate-400">
                      <div className="w-4 h-4 shrink-0 rounded-full bg-amber-500/10 border border-amber-500/30 flex items-center justify-center mt-0.5">
                        <span className="text-[8px] text-amber-500 font-bold">{i + 1}</span>
                      </div>
                      <span className="flex-1">{z.label}</span>
                    </li>
                  ))}
                </ul>
                <div className="p-2 bg-amber-900/20 rounded text-[10px] text-amber-400/80 leading-relaxed border-l-2 border-amber-500/50">
                  <strong>💡 AI: </strong> {content.macroReview}
                </div>
              </div>
            )}

            {content.actions.map((action, i) => (
              <div key={i} className={`relative flex items-start gap-3 p-4 bg-[#0f172a]/40 rounded border transition-all ${isPaid ? 'border-cyan-500/30 shadow-[0_0_15px_rgba(6,182,212,0.1)]' : 'border-blue-900/10'}`}>
                {!isPaid && (
                  <div className="absolute inset-0 bg-[#020617]/60 backdrop-blur-[4px] z-10 flex items-center justify-center">
                    {i === 1 && (
                      <div className="flex items-center gap-2 px-3 py-1 bg-cyan-950/80 border border-cyan-500/30 rounded text-cyan-400 shadow-lg">
                        <Lock className="w-3 h-3" />
                        <span className="text-[10px] font-bold tracking-widest">{t('microTacticsLocked')}</span>
                      </div>
                    )}
                  </div>
                )}
                <div className="mt-0.5">
                  {isPaid ? (
                    <div className="w-4 h-4 rounded border border-cyan-500/50 bg-cyan-950/30 text-cyan-400 flex items-center justify-center shadow-[0_0_5px_rgba(34,211,238,0.2)]">
                      <ArrowRight className="w-2.5 h-2.5" />
                    </div>
                  ) : (
                    <div className="w-4 h-4 rounded border border-slate-800 bg-slate-900" />
                  )}
                </div>
                <div className="flex-1">
                  <h4 className={`text-xs font-bold ${isPaid ? 'text-cyan-50' : 'text-slate-600'}`}>{action.title}</h4>
                  <p className={`text-[10px] mt-1 ${isPaid ? 'text-slate-300' : 'text-slate-700'}`}>{action.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </section>
      </main>

      {/* Unlock CTA */}
      {!isPaid && (
        <div className="fixed bottom-0 left-0 right-0 p-5 bg-[#020617]/80 backdrop-blur-xl border-t border-blue-900/30 z-20 shadow-[0_-10px_40px_rgba(0,0,0,0.5)]">
          <div className="max-w-xl mx-auto space-y-3">
            <div className="flex justify-between items-center px-1">
              <div className="flex items-center gap-2">
                <Search className="w-4 h-4 text-cyan-400" />
                <span className="text-xs font-bold text-slate-300">{t('unlockTitle')}</span>
              </div>
              <div className="flex items-baseline gap-2">
                <span className="text-lg font-bold text-white">{PRICE_CONFIG.price}</span>
                <span className="text-xs text-slate-500 line-through decoration-slate-500">{PRICE_CONFIG.originalPrice}</span>
              </div>
            </div>
            <Button onClick={handleUnlock} size="lg" disabled={loadingPay}
              className="w-full h-12 bg-gradient-to-r from-cyan-600 to-blue-600 hover:from-cyan-500 hover:to-blue-500 text-white rounded font-bold shadow-[0_0_20px_rgba(8,145,178,0.4)] transition-all hover:scale-[1.01] active:scale-[0.99] relative overflow-hidden group border border-cyan-400/20">
              {loadingPay ? (
                <span className="flex items-center gap-2"><ScanLine className="w-4 h-4 animate-spin" /> {t('unlocking')}</span>
              ) : (
                <span className="flex items-center gap-2">{t('unlockButton')} <Zap className="w-4 h-4 text-white fill-white" /></span>
              )}
            </Button>
          </div>
        </div>
      )}

      {/* Post-purchase footer */}
      {isPaid && (
        <div className="fixed bottom-0 left-0 right-0 p-6 bg-[#020617]/95 backdrop-blur-md border-t border-blue-900/30 z-20">
          <div className="max-w-xl mx-auto flex flex-col gap-4">
            <p className="text-[10px] text-slate-500 text-center">{t('encouragement')}</p>
            <div className="grid grid-cols-2 gap-3">
              <Button onClick={handleGeneratePoster} disabled={isGenerating}
                className="h-11 bg-gradient-to-r from-cyan-600 to-blue-600 hover:from-cyan-500 hover:to-blue-500 text-white font-bold border border-cyan-400/20 flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed">
                <Download className={`w-4 h-4 ${isGenerating ? 'animate-spin' : ''}`} />
                {isGenerating ? t('unlocking') : t('downloadReport')}
              </Button>
              <Button variant="outline" onClick={handleReturnHome}
                className="h-11 border-blue-900/50 text-slate-400 bg-slate-900/50 hover:bg-slate-800 hover:text-slate-200 flex items-center justify-center gap-2">
                <Home className="w-4 h-4" /> {t('backHome')}
              </Button>
            </div>
          </div>
        </div>
      )}

      <style jsx global>{`
        @keyframes scan-slow { 0% { transform: translateY(-100%); opacity: 0; } 20% { opacity: 1; } 80% { opacity: 1; } 100% { transform: translateY(500%); opacity: 0; } }
        .animate-scan-slow { animation: scan-slow 4s linear infinite; }
      `}</style>
    </div>
  )
}
