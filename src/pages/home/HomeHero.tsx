import { Button, KeepPhrases, Section } from '@/components/ui'
import { useLocale } from '@/hooks/useLocale'
import { ui } from '@/data'
import { yearsOfExperience } from '@/config'

export function HomeHero() {
  const { t } = useLocale()
  const years = yearsOfExperience()

  return (
    <Section tone="dark" spacing="none" className="home-hero blueprint-grid overflow-hidden">
      <div className="home-hero-layout">
        <div>
          <p className="text-eyebrow text-accent-glow flex items-center gap-2.5 uppercase">
            <span aria-hidden="true" className="bg-accent-glow inline-block h-px w-6 shrink-0" />
            ID Industrial Engineering Co.,Ltd.
          </p>
          <h1 className="home-hero-title mt-5 font-bold text-balance">
            <KeepPhrases>{t(ui.home.heroTitle)}</KeepPhrases>
          </h1>
          <p className="home-hero-lead mt-6 max-w-xl text-white/80">
            <KeepPhrases>{t(ui.home.heroLead)}</KeepPhrases>
          </p>

          <div className="mt-8 flex flex-col gap-3 sm:flex-row sm:flex-wrap">
            <Button to="/contact" variant="onDark" size="lg" withArrow>
              {t(ui.actions.consultEngineer)}
            </Button>
            <Button
              to="/services"
              size="lg"
              variant="outline"
              className="border-white/40! text-white! hover:bg-white/10! active:bg-white/15!"
            >
              {t(ui.home.viewServices)}
            </Button>
          </div>

          <div className="mt-9 flex items-center gap-4 border-t border-white/20 pt-5">
            <span className="stat-figure shrink-0 whitespace-nowrap text-4xl font-semibold text-white">{years}+</span>
            <p className="text-sm text-white/75">
              {t(ui.home.heroExperience)}
              <span className="mt-0.5 block text-xs text-white/60">
                {t(ui.home.heroLocation)}
              </span>
            </p>
          </div>
        </div>

        <figure className="home-hero-visual">
          <img
            src="/images/home/intron-x-cover.webp"
            srcSet="/images/home/intron-x-cover-600.webp 1x, /images/home/intron-x-cover.webp 2x"
            alt={t(ui.home.heroImageAlt)}
            width={1200}
            height={1409}
            fetchPriority="high"
            decoding="async"
            className="home-hero-image rounded-card border border-white/20"
          />
          <figcaption className="mt-4 flex w-full max-w-sm items-center justify-between gap-4 text-sm">
            <span className="font-semibold tracking-wide">INTRON-X</span>
            <span className="text-xs text-white/65">INDUSTRONIC</span>
          </figcaption>
        </figure>
      </div>
    </Section>
  )
}
