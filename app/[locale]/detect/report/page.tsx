"use client"

import { useState, useEffect, useMemo, useRef } from "react"
import { useTranslations, useLocale } from "next-intl"
import { useRouter } from "@/lib/navigation"
// dom-to-image-more loaded dynamically to avoid SSR issues (browser-only)
import {
  Brain, MapPin, Lock, ArrowRight, ShieldCheck, Zap, ScanLine, Activity,
  CarFront, Armchair, Briefcase, Microscope, Stethoscope, Waves,
  Search, CheckCircle2, Download, Home, AlertTriangle, Target,
  Clock, Octagon, Crosshair, ShieldAlert
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

// 从 basicSearchPoints 的【】格式中提取短标签，防止地图 UI 溢出
function extractShortLabel(fullText: string, fallback: string): string {
  const match = fullText.match(/【(.*?)】/)
  return match ? match[1] : (fullText.length > 12 ? fallback : fullText)
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

  // 地图标签提取短标签，清单使用完整描述
  const dynamicMacroZones = useMemo(() => {
    const baseZones = currentSceneBase.macroZonesBase
    const basicPoints = aiResult.basicSearchPoints || []
    return baseZones.map((zone, index) => {
      const fullText = basicPoints[index] || ''
      const shortLabel = extractShortLabel(fullText, fallbackZoneLabels[index])
      return { t: zone.t, l: zone.l, label: shortLabel, fullDesc: fullText || fallbackZoneLabels[index] }
    })
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
      const domtoimage = (await import('dom-to-image-more')).default;
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
      {/* 背景网格 */}
      <div className="absolute inset-0 pointer-events-none opacity-20"
        style={{ backgroundImage: 'linear-gradient(#1e3a8a 1px, transparent 1px), linear-gradient(90deg, #1e3a8a 1px, transparent 1px)', backgroundSize: '40px 40px' }} />
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[800px] h-[300px] bg-blue-600/10 blur-[100px] pointer-events-none" />

      {/* Header */}
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

      {/* 安全警告横幅（人命/宠物/医疗类自动触发）*/}
      {aiResult.safetyAlert && (
        <div className="w-full bg-red-950/80 border-b border-red-500/50 p-3 backdrop-blur-md relative z-40 shadow-[0_4px_20px_rgba(239,68,68,0.2)]">
          <div className="max-w-xl mx-auto flex items-start gap-3">
            <AlertTriangle className="w-5 h-5 text-red-400 shrink-0 mt-0.5 animate-pulse" />
            <p className="text-xs text-red-100 font-bold leading-relaxed">{aiResult.safetyAlert}</p>
          </div>
        </div>
      )}

      <main className="flex-1 max-w-xl mx-auto px-6 py-8 space-y-8 overflow-y-auto w-full pb-36">

        {/* 1. 寻回指数 */}
        <section className="text-center space-y-2 relative">
          <h1 className="text-7xl font-bold tracking-tighter text-white drop-shadow-[0_0_25px_rgba(34,211,238,0.3)]">{recoveryIndex}</h1>
          <div className="flex items-center justify-center gap-3 text-[10px] font-bold tracking-[0.2em] text-cyan-500 uppercase mt-2">
            <span className="px-2 py-0.5 border border-cyan-500/30 rounded bg-cyan-950/30">{t('analysisComplete')}</span>
            <span className="text-slate-600">|</span>
            <span>{t('probabilityLabel')}</span>
          </div>
          <div className="max-w-xs mx-auto mt-4 p-2 bg-blue-950/20 rounded border border-blue-900/30">
            <p className="text-[10px] text-slate-500 leading-relaxed">{t('aiDisclaimer')}</p>
          </div>
        </section>

        {/* 2. 首要紧急行动（免费）—— 建立第一眼专业信任 */}
        {aiResult.priorityAction?.action && (
          <section className="animate-in fade-in slide-in-from-bottom-4 duration-500">
            <div className="bg-gradient-to-br from-amber-500/10 to-orange-600/5 border border-amber-500/40 rounded-xl p-5 shadow-[0_0_25px_rgba(245,158,11,0.12)] relative overflow-hidden">
              <div className="absolute top-0 left-0 w-1 h-full bg-gradient-to-b from-amber-400 to-amber-600 shadow-[0_0_8px_#f59e0b]" />
              <div className="flex items-center gap-2 mb-3">
                <Target className="w-4 h-4 text-amber-500" />
                <h2 className="text-[10px] font-bold text-amber-500 tracking-widest uppercase">{t('priorityActionTitle')}</h2>
              </div>
              <p className="text-sm font-bold text-amber-50 leading-relaxed bg-amber-950/30 p-3 rounded border border-amber-500/20 mb-3">
                {aiResult.priorityAction.action}
              </p>
              <div className="grid grid-cols-1 gap-1.5 text-[11px] text-slate-400">
                {aiResult.priorityAction.target && (
                  <p><span className="text-amber-500/80 font-bold">{t('priorityActionTarget')}</span> {aiResult.priorityAction.target}</p>
                )}
                {aiResult.priorityAction.why && (
                  <p><span className="text-amber-500/80 font-bold">{t('priorityActionWhy')}</span> <span className="italic text-slate-500">{aiResult.priorityAction.why}</span></p>
                )}
              </div>
            </div>
          </section>
        )}

        {/* 3. 全息场景地图 */}
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
                <div className="absolute top-6 px-2 py-0.5 bg-amber-950/80 border border-amber-500/30 backdrop-blur-sm rounded text-[9px] font-bold text-amber-500 tracking-widest whitespace-nowrap z-10 max-w-[90px] truncate">
                  {zone.label}
                </div>
              </div>
            </div>
          ))}

          {isPaid && (
            <div className="absolute" style={{ top: '65%', left: '60%' }}>
              <div className="relative -translate-x-1/2 -translate-y-1/2">
                <span className="absolute inline-flex h-full w-full rounded-full bg-cyan-500 opacity-20 animate-ping"></span>
                <span className="relative inline-flex rounded-full h-3 w-3 bg-cyan-500 shadow-[0_0_20px_#06b6d4]"></span>
                <div className="absolute left-10 top-[-20px] bg-cyan-950/90 border border-cyan-500/50 px-2 py-1 rounded">
                  <div className="text-[10px] text-cyan-400 font-bold whitespace-nowrap flex items-center gap-1">
                    <MapPin className="w-3 h-3" /> {t('precisionPin')}
                  </div>
                </div>
              </div>
            </div>
          )}

          <div className="absolute bottom-0 left-0 right-0 py-2 bg-[#0B1121]/90 border-t border-blue-900/30 flex justify-center backdrop-blur-sm">
            {!isPaid ? (
              <div className="flex items-center gap-2 text-[10px] text-amber-500 font-bold tracking-wide">
                <ScanLine className="w-3 h-3" /> {currentSceneLabel}
              </div>
            ) : (
              <div className="flex items-center gap-2 text-[10px] text-cyan-400 font-bold tracking-wide">
                <ShieldCheck className="w-3 h-3" /> {t('deepScanDecrypted')}
              </div>
            )}
          </div>
        </section>

        {/* 4. 诊断报告（环境扫描 + 行为心理学）*/}
        <section className="space-y-4">
          <h2 className="text-[10px] font-bold text-slate-500 uppercase tracking-widest px-1 flex items-center gap-2">
            <Microscope className="w-3 h-3" /> {t('diagnosisTitle')}
          </h2>

          {/* 环境物理扫描 */}
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

          {/* 行为心理学分析 */}
          <div className="bg-[#0f172a]/40 p-4 rounded-lg border border-blue-800/20 backdrop-blur-sm flex gap-4 items-start hover:border-blue-500/30 transition-colors">
            <div className="p-2 bg-blue-950/40 text-blue-400 border border-blue-500/20 rounded-md shrink-0">
              <Brain className="w-5 h-5" />
            </div>
            <div className="flex-1 space-y-2">
              <h3 className="font-bold text-sm text-blue-100">{t('psychTitle')}</h3>
              <p className="text-xs text-slate-400 leading-relaxed">{content.psychology.content}</p>
              {/* 认知覆盖命令 —— 使用 AI 实际输出的文本 */}
              {aiResult.cognitiveOverride && (
                <div className="mt-3 flex items-start gap-2 text-[11px] font-medium text-cyan-300 bg-cyan-950/25 px-3 py-2.5 rounded border border-cyan-500/20">
                  <ShieldAlert className="w-4 h-4 shrink-0 mt-0.5 text-cyan-500" />
                  <div>
                    <span className="block text-[9px] text-cyan-600 font-bold tracking-widest mb-1">{t('cognitiveInsightLabel')}</span>
                    <span className="leading-relaxed">{aiResult.cognitiveOverride}</span>
                  </div>
                </div>
              )}
            </div>
          </div>
        </section>

        {/* 5. 高危微观落点推演（付费诱饵墙）*/}
        <section className="space-y-4">
          <div className="flex items-center gap-2 px-1">
            <Crosshair className="w-3 h-3 text-cyan-500" />
            <h2 className="text-[10px] font-bold text-cyan-500 uppercase tracking-widest">{t('predictionsTitle')}</h2>
            {!isPaid && <Lock className="w-3 h-3 text-cyan-700 ml-auto" />}
          </div>

          {!isPaid ? (
            /* 毛玻璃诱饵墙 */
            <div className="relative rounded-xl border border-cyan-900/30 overflow-hidden bg-[#0f172a]/20">
              {/* 模糊底层 */}
              <div className="opacity-25 blur-[3px] space-y-3 p-5 pointer-events-none select-none">
                {[0, 1, 2].map(i => (
                  <div key={i} className="h-[72px] bg-cyan-950/30 rounded-lg border border-cyan-900/40 w-full" />
                ))}
              </div>
              {/* 解锁遮罩 */}
              <div className="absolute inset-0 backdrop-blur-[2px] z-10 flex flex-col items-center justify-center bg-[#020617]/50 gap-2">
                <div className="w-10 h-10 rounded-full bg-cyan-950/80 border border-cyan-500/40 flex items-center justify-center shadow-[0_0_20px_rgba(6,182,212,0.2)]">
                  <Lock className="w-5 h-5 text-cyan-500" />
                </div>
                <p className="text-xs text-cyan-200 font-bold tracking-widest">{t('predictionsLocked')}</p>
                <p className="text-[10px] text-slate-500">{t('predictionsLockedDesc')}</p>
              </div>
            </div>
          ) : (
            /* 解锁后展示 */
            <div className="space-y-3 animate-in fade-in duration-700">
              {(aiResult.predictions || []).map((pred, i) => (
                <div key={i} className="bg-[#0f172a]/60 p-4 rounded-lg border border-cyan-900/50 shadow-[0_0_15px_rgba(8,145,178,0.05)] relative overflow-hidden">
                  <div className="absolute top-0 right-0 px-2 py-1 bg-cyan-950 border-b border-l border-cyan-800/60 text-[9px] text-cyan-400 rounded-bl font-bold tracking-widest">
                    {t('predictionsConfidence')}: {pred.confidence}%
                  </div>
                  <h3 className="text-sm font-bold text-cyan-100 pr-24 mb-2">{pred.location}</h3>
                  <div className="space-y-1.5 text-[11px]">
                    <p className="text-slate-400">
                      <span className="text-slate-500 font-bold">{t('predictionsReasoning')}</span> {pred.reason}
                    </p>
                    <p className="text-cyan-200/80 bg-cyan-950/30 p-2 rounded border-l-2 border-cyan-700">
                      <span className="text-cyan-600 font-bold">{t('predictionsMethod')}</span> {pred.technique}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </section>

        {/* 6. 战术行动清单 */}
        <section>
          <div className="flex justify-between items-end mb-4 px-1">
            <h2 className="text-[10px] font-bold text-slate-500 uppercase tracking-widest flex items-center gap-2">
              <Stethoscope className="w-3 h-3" /> {t('tacticsTitle')}
            </h2>
            {!isPaid && <span className="text-[10px] font-bold text-cyan-700 flex items-center gap-1"><Lock className="w-3 h-3" /> {t('deepScanEncrypted')}</span>}
          </div>

          <div className="space-y-3">
            {/* 免费：基础排查清单 */}
            {!isPaid && (
              <div className="p-4 bg-amber-950/10 border border-amber-500/20 rounded-lg">
                <div className="flex items-center gap-2 mb-2 text-amber-500">
                  <CheckCircle2 className="w-4 h-4" />
                  <h4 className="text-xs font-bold">{t('basicLabel')}</h4>
                </div>
                <p className="text-[10px] text-slate-500 mb-3">{t('basicSearchDesc')}</p>
                <ul className="space-y-2 mb-3">
                  {dynamicMacroZones.map((z, i) => (
                    <li key={i} className="flex items-start gap-2 text-[10px] text-slate-400">
                      <div className="w-4 h-4 shrink-0 rounded-full bg-amber-500/10 border border-amber-500/30 flex items-center justify-center mt-0.5">
                        <span className="text-[8px] text-amber-500 font-bold">{i + 1}</span>
                      </div>
                      <span className="flex-1 leading-relaxed">{z.fullDesc}</span>
                    </li>
                  ))}
                </ul>
                {content.macroReview && (
                  <div className="p-2 bg-amber-900/20 rounded text-[10px] text-amber-400/80 leading-relaxed border-l-2 border-amber-500/50">
                    <strong>💡 AI: </strong>{content.macroReview}
                  </div>
                )}
              </div>
            )}

            {/* 战术行动（付费锁定/解锁）*/}
            <div className="space-y-3">
              {content.actions.map((action, i) => {
                const isLocked = !isPaid && i > 0
                return (
                  <div key={i} className={`flex items-start gap-3 p-4 bg-[#0f172a]/40 rounded border transition-all ${isPaid ? 'border-cyan-500/30 shadow-[0_0_12px_rgba(6,182,212,0.08)]' : i === 0 ? 'border-blue-900/20' : 'border-blue-900/10'}`}>
                    <div className="mt-0.5 shrink-0">
                      {isPaid ? (
                        <div className="w-5 h-5 rounded border border-cyan-500/50 bg-cyan-950/30 text-cyan-400 flex items-center justify-center shadow-[0_0_5px_rgba(34,211,238,0.15)]">
                          <ArrowRight className="w-3 h-3" />
                        </div>
                      ) : (
                        <div className={`w-4 h-4 rounded border ${isLocked ? 'border-slate-800/40 bg-slate-900/40' : 'border-slate-700 bg-slate-900'}`} />
                      )}
                    </div>
                    <div className="flex-1">
                      {isLocked ? (
                        /* 骨架占位，彻底杜绝文字泄露 */
                        <div className="space-y-2 select-none pointer-events-none">
                          <div className="h-2.5 bg-slate-800/50 rounded w-14" />
                          <div className="h-2.5 bg-slate-800/30 rounded w-full" />
                          <div className="h-2.5 bg-slate-800/30 rounded w-4/5" />
                          {i === 1 && (
                            <div className="flex items-center gap-1.5 mt-3 text-[9px] text-cyan-700 font-bold tracking-widest">
                              <Lock className="w-3 h-3" /> {t('microTacticsLocked')}
                            </div>
                          )}
                        </div>
                      ) : (
                        <>
                          <h4 className={`text-[10px] font-bold mb-1 ${isPaid ? 'text-cyan-500' : 'text-slate-400'}`}>{action.title}</h4>
                          <p className={`text-xs leading-relaxed ${isPaid ? 'text-slate-200' : 'text-slate-300'}`}>{action.desc}</p>
                        </>
                      )}
                    </div>
                  </div>
                )
              })}
            </div>
          </div>
        </section>

        {/* 7. 时间线演变分析 + 强制止损节点（付费解锁后显示）*/}
        {isPaid && (
          <div className="space-y-4 animate-in fade-in duration-700">
            {aiResult.timelineAnalysis && (
              <section className="pt-4 border-t border-blue-900/30">
                <h2 className="text-[10px] font-bold text-slate-500 uppercase tracking-widest px-1 mb-3 flex items-center gap-2">
                  <Clock className="w-3 h-3" /> {t('timelineTitle')}
                </h2>
                <p className="text-xs text-slate-400 leading-relaxed bg-[#0f172a]/40 p-4 rounded-lg border border-blue-900/20">
                  {aiResult.timelineAnalysis}
                </p>
              </section>
            )}

            {aiResult.stopCondition && (
              <section className="bg-red-950/15 border border-red-900/40 rounded-lg p-4 flex items-start gap-3">
                <Octagon className="w-5 h-5 text-red-500 shrink-0 mt-0.5" />
                <div>
                  <h3 className="text-[10px] font-bold text-red-400 uppercase tracking-widest mb-1.5">{t('stopConditionTitle')}</h3>
                  <p className="text-xs text-red-200/70 leading-relaxed">{aiResult.stopCondition}</p>
                </div>
              </section>
            )}
          </div>
        )}
      </main>

      {/* 底部悬浮条：未付费 CTA */}
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
              className="w-full h-12 bg-gradient-to-r from-cyan-600 to-blue-600 hover:from-cyan-500 hover:to-blue-500 text-white rounded font-bold shadow-[0_0_20px_rgba(8,145,178,0.4)] transition-all hover:scale-[1.01] active:scale-[0.99] border border-cyan-400/20">
              {loadingPay ? (
                <span className="flex items-center gap-2"><ScanLine className="w-4 h-4 animate-spin" /> {t('unlocking')}</span>
              ) : (
                <span className="flex items-center gap-2">{t('unlockButton')} <Zap className="w-4 h-4 text-white fill-white" /></span>
              )}
            </Button>
          </div>
        </div>
      )}

      {/* 底部悬浮条：已付费 */}
      {isPaid && (
        <div className="fixed bottom-0 left-0 right-0 p-5 bg-[#020617]/95 backdrop-blur-md border-t border-cyan-900/40 z-20 shadow-[0_-10px_30px_rgba(6,182,212,0.08)]">
          <div className="max-w-xl mx-auto flex flex-col gap-3">
            {/* AI 动态鼓励文案（使用 AI 实际输出，fallback 到静态翻译）*/}
            <p className="text-[11px] text-cyan-200/80 text-center font-medium px-2 leading-relaxed">
              {aiResult.encouragement || t('encouragement')}
            </p>
            <div className="grid grid-cols-2 gap-3">
              <Button onClick={handleGeneratePoster} disabled={isGenerating}
                className="h-11 bg-cyan-950 hover:bg-cyan-900 text-cyan-400 font-bold border border-cyan-500/30 flex items-center justify-center gap-2 disabled:opacity-50">
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

      <style>{`
        @keyframes scan-slow { 0% { transform: translateY(-100%); opacity: 0; } 20% { opacity: 1; } 80% { opacity: 1; } 100% { transform: translateY(500%); opacity: 0; } }
        .animate-scan-slow { animation: scan-slow 4s linear infinite; }
      `}</style>
    </div>
  )
}
