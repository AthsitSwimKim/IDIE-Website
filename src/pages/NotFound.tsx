import { Button, Heading, Section } from '@/components/ui'
import { Seo } from '@/components/layout/Seo'
import { useLocale } from '@/hooks/useLocale'
import { ui } from '@/data'

export default function NotFound() {
  const { t } = useLocale()

  return (
    <>
      <Seo title={ui.states.notFoundTitle} />
      <Section tone="alt" spacing="lg">
        <p className="stat-figure text-primary-600 text-6xl font-bold">404</p>
        <Heading level={1} className="mt-4">
          {t(ui.states.notFoundTitle)}
        </Heading>
        <p className="text-ink-muted mt-4 max-w-prose">{t(ui.states.notFoundBody)}</p>
        <div className="mt-8">
          <Button to="/" withArrow>
            {t(ui.nav.home)}
          </Button>
        </div>
      </Section>
    </>
  )
}
