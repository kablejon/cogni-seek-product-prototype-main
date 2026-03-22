import { Header } from '@/components/shared/header'
import { Link } from '@/lib/navigation'
import { ChevronLeft, Mail } from 'lucide-react'

interface BackLink {
  href: string
  label: string
}

interface LegalSection {
  heading: string
  body: string[]
}

interface LegalPageProps {
  badge: string
  backLink: BackLink
  title: string
  intro: string
  sections: LegalSection[]
  contactLabel: string
  contactEmail: string
}

export function LegalPage({
  badge,
  backLink,
  title,
  intro,
  sections,
  contactLabel,
  contactEmail,
}: LegalPageProps) {
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
              {badge}
            </span>
            <h1 className="text-3xl font-bold tracking-tight md:text-4xl">{title}</h1>
            <p className="max-w-3xl text-sm leading-7 text-muted-foreground md:text-base">{intro}</p>
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
              <span>{contactLabel}</span>
              <a
                href={`mailto:${contactEmail}`}
                className="font-medium text-foreground underline underline-offset-4"
              >
                {contactEmail}
              </a>
            </div>
          </div>
        </div>
      </main>
    </div>
  )
}
