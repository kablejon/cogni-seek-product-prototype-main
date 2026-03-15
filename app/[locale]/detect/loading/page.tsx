"use client"

import { useEffect, useState, useMemo } from "react"
import { useLocale, useTranslations } from "next-intl"
import { useRouter } from "@/lib/navigation"
import {
  Scan, Search, Crosshair,
  CarFront, TrainFront, Armchair, Briefcase, Trees, ShoppingBag, MapPin, ShieldCheck, Zap, Activity
} from "lucide-react"
import { useSearchStore } from "@/lib/store"
import { analyzeWithAI } from "@/lib/ai-service"

const SCENE_CONFIG = {
  car: { id: 'VEHICLE_COCKPIT', icon: CarFront, subIcon: Zap, blindSpot: { top: '65%', left: '35%' }, label: "CHASSIS SCAN" },
  metro: { id: 'TRANSIT_UNIT', icon: TrainFront, subIcon: MapPin, blindSpot: { top: '60%', left: '50%' }, label: "CABIN SCAN" },
  home: { id: 'RESIDENTIAL_ZONE', icon: Armchair, subIcon: ShieldCheck, blindSpot: { top: '55%', left: '65%' }, label: "INTERIOR SCAN" },
  work: { id: 'WORKSPACE_SECTOR', icon: Briefcase, subIcon: Activity, blindSpot: { top: '70%', left: '45%' }, label: "ASSET SCAN" },
  public: { id: 'COMMERCIAL_AREA', icon: ShoppingBag, subIcon: MapPin, blindSpot: { top: '60%', left: '55%' }, label: "AREA SCAN" },
  outdoor: { id: 'OPEN_TERRAIN', icon: Trees, subIcon: MapPin, blindSpot: { top: '50%', left: '30%' }, label: "TERRAIN SCAN" }
}

const LOGS = [
  "INITIALIZING_VECTOR_ENGINE...",
  "ACCESSING_BEHAVIORAL_DATABASE...",
  "LOADING_SYMBOLIC_TWIN...",
  "SIMULATING_MEMORY_FRAGMENTS...",
  "CALCULATING_PROBABILITY_HEATMAP...",
  "DETECTING_VISUAL_ANOMALIES...",
  "BYPASSING_COGNITIVE_BIAS...",
  "TARGET_LOCKED."
]

export default function LoadingPage() {
  const router = useRouter()
  const locale = useLocale()
  const t = useTranslations('loading')
  const { session, setAnalysisResult, setAnalysisError } = useSearchStore()

  const [progress, setProgress] = useState(0)
  const [logIndex, setLogIndex] = useState(0)
  const [phase, setPhase] = useState(1)
  const [apiCallCompleted, setApiCallCompleted] = useState(false)

  const itemName = useMemo(() => {
    if (session.itemName) return session.itemName.toUpperCase()
    return 'UNKNOWN_TARGET'
  }, [session.itemName])

  const currentScene = useMemo(() => {
    const cat = (session.locationCategory || '').toLowerCase()
    const subArray = session.otherVisitedLocations || []
    const sub = (Array.isArray(subArray) ? subArray.join(' ') : String(subArray)).toLowerCase()
    if (['bus_subway', 'train', 'plane'].some(k => sub.includes(k))) return SCENE_CONFIG.metro
    if (['private_car', 'taxi', 'bike'].some(k => sub.includes(k))) return SCENE_CONFIG.car
    if (cat === 'transit') return SCENE_CONFIG.car
    if (cat === 'work') return SCENE_CONFIG.work
    if (cat === 'public') return SCENE_CONFIG.public
    if (cat === 'outdoors') return SCENE_CONFIG.outdoor
    return SCENE_CONFIG.home
  }, [session])

  const MainIcon = currentScene.icon
  const SubIcon = currentScene.subIcon

  useEffect(() => {
    let isMounted = true
    async function performAnalysis() {
      try {
        const result = await analyzeWithAI(session, locale)
        if (isMounted) { setAnalysisResult(result); setApiCallCompleted(true) }
      } catch (error) {
        if (isMounted) {
          const errorMessage = error instanceof Error ? error.message : 'Analysis failed, please retry'
          setAnalysisError(errorMessage)
          setApiCallCompleted(true)
        }
      }
    }
    performAnalysis()
    return () => { isMounted = false }
  }, [session, locale, setAnalysisResult, setAnalysisError])

  useEffect(() => {
    const interval = 50
    const timer = setInterval(() => {
      setProgress((prev) => {
        let increment: number
        if (prev < 85) { increment = 0.53 }
        else if (prev < 95) { increment = apiCallCompleted ? 2.0 : 0.1 }
        else { increment = apiCallCompleted ? 1.0 : 0 }

        const newProgress = Math.min(100, prev + increment)
        if (newProgress < 20) setPhase(1)
        else if (newProgress < 80) setPhase(2)
        else setPhase(3)

        const logIdx = Math.floor((newProgress / 100) * LOGS.length)
        setLogIndex(Math.min(logIdx, LOGS.length - 1))

        if (newProgress >= 100 && apiCallCompleted) {
          clearInterval(timer)
          setTimeout(() => router.push('/detect/report'), 600)
        }
        return newProgress
      })
    }, interval)
    return () => clearInterval(timer)
  }, [router, apiCallCompleted])

  return (
    <div className="min-h-screen bg-[#050A14] text-slate-300 font-mono flex flex-col items-center justify-center relative overflow-hidden">
      <div className="absolute inset-0 pointer-events-none opacity-20"
        style={{ backgroundImage: 'radial-gradient(#334155 1px, transparent 1px)', backgroundSize: '30px 30px' }} />

      <div className="w-full max-w-sm px-6 mb-8 flex justify-between items-end animate-in fade-in slide-in-from-top duration-700">
        <div>
          <div className="text-[10px] text-slate-500 tracking-[0.2em] mb-1">SYSTEM</div>
          <div className="flex items-center gap-2 text-cyan-400">
            <Scan className="w-4 h-4 animate-pulse" />
            <span className="text-sm font-bold">DIGITAL TWIN</span>
          </div>
        </div>
        <div className="text-right">
          <div className="text-[10px] text-slate-500 tracking-[0.2em] mb-1">MODE</div>
          <div className="text-sm font-bold text-slate-200">{currentScene.label}</div>
        </div>
      </div>

      {/* Core scan visualization */}
      <div className="relative w-64 h-64 md:w-80 md:h-80 flex items-center justify-center group">
        <div className="absolute inset-0 border border-slate-800 rounded-full opacity-50 scale-110" />
        <div className="absolute inset-0 border border-dashed border-slate-800 rounded-full opacity-30 scale-125 animate-spin-slow" />

        <MainIcon strokeWidth={1} className="w-48 h-48 md:w-56 md:h-56 text-slate-800 absolute transition-all duration-500" />

        <div className="absolute inset-0 flex items-center justify-center transition-all duration-100 ease-linear"
          style={{ clipPath: phase >= 2 ? `inset(0 0 ${100 - ((progress - 20) * 1.5)}% 0)` : 'inset(100% 0 0 0)' }}>
          <MainIcon strokeWidth={1.5} className="w-48 h-48 md:w-56 md:h-56 text-cyan-400 drop-shadow-[0_0_15px_rgba(34,211,238,0.5)]" fill="rgba(34,211,238,0.1)" />
        </div>

        {phase === 2 && (
          <div className="absolute left-0 right-0 h-[2px] bg-cyan-400 shadow-[0_0_20px_#22d3ee] z-10"
            style={{ top: `${(progress - 20) * 1.5}%`, opacity: (progress - 20) * 1.5 > 100 ? 0 : 1 }} />
        )}

        {phase === 3 && (
          <div className="absolute z-20" style={{ top: currentScene.blindSpot.top, left: currentScene.blindSpot.left }}>
            <div className="relative">
              <span className="absolute inline-flex h-full w-full rounded-full bg-red-500 opacity-75 animate-ping"></span>
              <span className="relative inline-flex rounded-full h-3 w-3 bg-red-500 shadow-[0_0_10px_#ef4444]"></span>
            </div>
            <div className="absolute -top-3 -left-3 w-9 h-9 border border-red-500/50 rounded-sm animate-lock-in" />
            <div className="absolute left-6 top-[-4px] bg-red-500/10 border-l-2 border-red-500 px-2 py-0.5 animate-fade-in-right">
              <span className="text-[9px] font-bold text-red-400 whitespace-nowrap">ANOMALY DETECTED</span>
            </div>
          </div>
        )}

        <div className="absolute bottom-4 right-4 p-2 bg-slate-900/80 rounded-full border border-slate-700">
          <SubIcon className="w-4 h-4 text-slate-500" />
        </div>
      </div>

      {/* Console */}
      <div className="w-full max-w-sm px-6 mt-12 space-y-5">
        <div className="space-y-2">
          <div className="flex justify-between items-end text-xs font-mono font-bold">
            <span className="text-cyan-500/70">ANALYSIS_PROGRESS</span>
            <span className="text-cyan-400">{Math.round(progress)}%</span>
          </div>
          <div className="h-1 bg-slate-900 rounded-full overflow-hidden border border-slate-800">
            <div className="h-full bg-cyan-500 shadow-[0_0_15px_rgba(6,182,212,0.6)] transition-all duration-75 ease-linear" style={{ width: `${progress}%` }} />
          </div>
        </div>

        <div className="h-8 flex items-center gap-3 text-[10px] md:text-xs font-mono text-slate-400 border-l-2 border-slate-800 pl-3 bg-slate-900/30 rounded-r-md">
          <span className="text-cyan-500 animate-pulse">{">"}</span>
          <span className="truncate tracking-tight">{LOGS[logIndex]}</span>
        </div>

        <div className="flex items-center justify-between pt-4 border-t border-slate-800/50 opacity-60">
          <div className="flex items-center gap-2 text-xs text-slate-500">
            <Search className="w-3 h-3" />
            <span>{t('matchingTarget')}</span>
          </div>
          <div className="flex items-center gap-2">
            <Crosshair className="w-3 h-3 text-red-400" />
            <span className="text-xs font-bold text-slate-300">{itemName}</span>
          </div>
        </div>
      </div>

      <style>{`
        @keyframes spin-slow { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }
        .animate-spin-slow { animation: spin-slow 10s linear infinite; }
        @keyframes lock-in { 0% { transform: scale(2); opacity: 0; } 100% { transform: scale(1); opacity: 1; } }
        .animate-lock-in { animation: lock-in 0.3s cubic-bezier(0.175, 0.885, 0.32, 1.275) forwards; }
        @keyframes fade-in-right { 0% { transform: translateX(-10px); opacity: 0; } 100% { transform: translateX(0); opacity: 1; } }
        .animate-fade-in-right { animation: fade-in-right 0.3s ease-out forwards; }
      `}</style>
    </div>
  )
}
