import { getTranslations } from 'next-intl/server'
import { Header } from '@/components/shared/header'
import { Link } from '@/lib/navigation'
import { ChevronLeft, Mail, Building2, BadgeInfo, CreditCard, ShieldCheck } from 'lucide-react'

export default async function ContactPage({
  searchParams,
}: {
  searchParams: Promise<{ from?: string; reportId?: string; paid?: string }>
}) {
  const t = await getTranslations('legal.contact')

  const sections = [
    'support',
    'billing',
    'privacy',
    'responseTime',
  ].map((key) => ({
    heading: t(`sections.${key}.heading`),
    body: t.raw(`sections.${key}.body`) as string[],
  }))

  const resolvedSearchParams = await searchParams
  const from = resolvedSearchParams?.from
  const reportId = resolvedSearchParams?.reportId
  const paid = resolvedSearchParams?.paid

  const reportQuery = new URLSearchParams()
  if (reportId) reportQuery.set('reportId', reportId)
  if (paid === '1') reportQuery.set('paid', '1')
  const reportHref = reportQuery.size > 0
    ? `/detect/report?${reportQuery.toString()}`
    : '/detect/report'

  const backLink = from === 'report'
    ? { href: reportHref, label: t('backToReport') }
    : from === 'result'
      ? { href: '/detect/result', label: t('backToResult') }
      : { href: '/', label: t('backLabel') }

  const merchantRows = [
    {
      icon: Building2,
      label: t('merchantCard.sellerLabel'),
      value: t('merchantCard.sellerValue'),
    },
    {
      icon: BadgeInfo,
      label: t('merchantCard.typeLabel'),
      value: t('merchantCard.typeValue'),
    },
    {
      icon: CreditCard,
      label: t('merchantCard.billingLabel'),
      value: t('merchantCard.billingValue'),
    },
    {
      icon: ShieldCheck,
      label: t('merchantCard.deliveryLabel'),
      value: t('merchantCard.deliveryValue'),
    },
    {
      icon: Mail,
      label: t('merchantCard.scopeLabel'),
      value: t('merchantCard.scopeValue'),
    },
    {
      icon: Building2,
      label: t('merchantCard.regionLabel'),
      value: t('merchantCard.regionValue'),
    },
  ]

  return (
    <div className="min-h-screen bg-background">
      <Header />
      <main className="container mx-auto max-w-4xl px-4 py-10 md:py-14">
        <Link
          href={backLink.href}
          className="mb-6 inline-flex h-11 items-center gap-2 rounded-full border border-cyan-400/25 bg-cyan-950/35 px-4 text-sm font-semibold text-cyan-100 shadow-[0_0_14px_rgba(8,145,178,0.16)] transition-all duration-300 hover:border-cyan-300/45 hover:bg-cyan-900/45 hover:text-white hover:shadow-[0_0_22px_rgba(34,211,238,0.28)] hover:scale-[1.01] active:scale-[0.99]"
        >
          <ChevronLeft className="h-4 w-4" />
          {backLink.label}
        </Link>

        <div className="rounded-3xl border border-border/60 bg-card/70 p-6 shadow-sm md:p-10">
          <div className="mb-8 space-y-4 border-b border-border/60 pb-8">
            <span className="inline-flex rounded-full border border-[#2DE1FC]/30 bg-[#2DE1FC]/10 px-3 py-1 text-xs font-medium uppercase tracking-[0.24em] text-[#2DE1FC]">
              {t('badge')}
            </span>
            <h1 className="text-3xl font-bold tracking-tight md:text-4xl">{t('title')}</h1>
            <p className="max-w-3xl text-sm leading-7 text-muted-foreground md:text-base">{t('intro')}</p>
          </div>

          <div className="mb-10 rounded-3xl border border-cyan-500/20 bg-gradient-to-br from-cyan-500/10 via-background/70 to-background/90 p-5 shadow-[0_0_30px_rgba(34,211,238,0.06)] md:p-6">
            <div className="mb-5 space-y-2">
              <span className="inline-flex rounded-full border border-cyan-400/20 bg-cyan-500/10 px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.22em] text-cyan-200/90">
                {t('merchantCard.badge')}
              </span>
              <h2 className="text-xl font-semibold tracking-tight text-foreground md:text-2xl">{t('merchantCard.title')}</h2>
            </div>

            <div className="grid gap-3 md:grid-cols-2">
              {merchantRows.map(({ icon: Icon, label, value }) => (
                <div
                  key={label}
                  className="rounded-2xl border border-white/8 bg-white/[0.03] p-4 backdrop-blur-sm"
                >
                  <div className="mb-3 flex items-center gap-3">
                    <div className="flex h-9 w-9 items-center justify-center rounded-full border border-cyan-400/15 bg-cyan-500/10 text-cyan-200">
                      <Icon className="h-4 w-4" />
                    </div>
                    <p className="text-xs font-medium uppercase tracking-[0.18em] text-muted-foreground">{label}</p>
                  </div>
                  <p className="text-sm leading-6 text-foreground/90 md:text-base">{value}</p>
                </div>
              ))}
            </div>
          </div>

          <div className="space-y-8">
            {sections.map((section) => (
              <section key={section.heading} className="space-y-3">
                <h2 className="text-xl font-semibold tracking-tight">{section.heading}</h2>
                <div className="space-y-3 text-sm leading-7 text-muted-foreground md:text-base">
                  {section.body.map((paragraph) => (
                    <p key={paragraph}>{paragraph}</p>
                  ))}
                </div>
              </section>
            ))}
          </div>

          <div className="mt-10 rounded-2xl border border-border/60 bg-background/70 p-5">
            <div className="flex items-center gap-3 text-sm text-muted-foreground md:text-base">
              <Mail className="h-4 w-4 flex-shrink-0" />
              <span>{t('contactLabel')}</span>
              <a
                href={`mailto:${t('contactEmail')}`}
                className="font-medium text-foreground underline underline-offset-4"
              >
                {t('contactEmail')}
              </a>
            </div>
          </div>
        </div>
      </main>
    </div>
  )
}
