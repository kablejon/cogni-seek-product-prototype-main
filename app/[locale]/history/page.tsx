"use client"

import { useEffect, useState } from "react"
import { useTranslations } from "next-intl"
import { useRouter, Link } from "@/lib/navigation"
import { Header } from "@/components/shared/header"
import { Button } from "@/components/ui/button"

type ReportHistoryItem = {
  id: string
  locale: string
  created_at: string
  premium_unlocked: boolean
  item_name: string
  location_category: string
  probability: number
}

export default function HistoryPage() {
  const tCommon = useTranslations('common')
  const router = useRouter()
  const [loading, setLoading] = useState(true)
  const [items, setItems] = useState<ReportHistoryItem[]>([])
  const [error, setError] = useState('')

  useEffect(() => {
    let active = true

    async function loadHistory() {
      try {
        const res = await fetch('/api/report-history')
        const data = await res.json().catch(() => ({}))

        if (!res.ok) {
          if (res.status === 401) {
            router.replace('/?authRequired=1')
            return
          }
          throw new Error(data?.error || 'Failed to load history')
        }

        if (!active) return
        setItems(Array.isArray(data.reports) ? data.reports : [])
      } catch (e) {
        if (!active) return
        setError(e instanceof Error ? e.message : 'Failed to load history')
      } finally {
        if (active) setLoading(false)
      }
    }

    loadHistory()
    return () => { active = false }
  }, [router])

  return (
    <div className="min-h-screen bg-background flex flex-col">
      <Header />

      <main className="container mx-auto px-4 py-8 md:py-10 flex-1">
        <div className="max-w-4xl mx-auto space-y-4">
          <div className="flex items-center justify-between">
            <h1 className="text-2xl md:text-3xl font-bold">检测记录</h1>
            <Link href="/">
              <Button variant="outline">{tCommon('backHome')}</Button>
            </Link>
          </div>

          {loading ? (
            <div className="rounded-xl border border-border/50 p-6 text-sm text-muted-foreground">加载中...</div>
          ) : error ? (
            <div className="rounded-xl border border-red-500/30 bg-red-500/10 p-6 text-sm text-red-300">{error}</div>
          ) : items.length === 0 ? (
            <div className="rounded-xl border border-border/50 p-6 text-sm text-muted-foreground">暂无历史报告</div>
          ) : (
            <div className="space-y-3">
              {items.map((item) => (
                <Link
                  key={item.id}
                  href={`/detect/report?reportId=${encodeURIComponent(item.id)}`}
                  className="block rounded-xl border border-border/50 p-4 hover:border-cyan-500/40 hover:bg-cyan-500/5 transition-colors"
                >
                  <div className="flex items-start justify-between gap-4">
                    <div className="space-y-1.5">
                      <p className="font-semibold text-base">
                        {item.item_name || '未命名物品'}
                      </p>
                      <p className="text-sm text-muted-foreground">
                        场景：{item.location_category || '未填写'}
                      </p>
                      <p className="text-xs text-muted-foreground">
                        {new Date(item.created_at).toLocaleString()}
                      </p>
                    </div>
                    <div className="text-right space-y-1">
                      <div className="text-sm font-medium text-cyan-300">{item.probability ? `${item.probability.toFixed(1)}%` : '--'}</div>
                      <div className={`text-xs ${item.premium_unlocked ? 'text-emerald-300' : 'text-amber-300'}`}>
                        {item.premium_unlocked ? '高级内容已解锁' : '仅基础内容'}
                      </div>
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          )}
        </div>
      </main>
    </div>
  )
}
