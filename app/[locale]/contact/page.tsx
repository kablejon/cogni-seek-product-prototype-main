import { getTranslations } from 'next-intl/server'
import { LegalPage } from '@/components/shared/legal-page'

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

  return (
    <LegalPage
      badge={t('badge')}
      backLink={backLink}
      title={t('title')}
      intro={t('intro')}
      sections={sections}
      contactLabel={t('contactLabel')}
      contactEmail={t('contactEmail')}
    />
  )
}
