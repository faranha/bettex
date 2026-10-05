/** @jsxImportSource react */
import { Link, useLocation } from 'wouter';
import { useX } from './ui';
import { demoLabel, demoPath, demoView, type DemoView } from './demo-navigation';

/** Public builds show only presentation placeholders; no account, balance or execution hooks. */
export function PublicDemoPage() {
  const { x, loc } = useX();
  const [path] = useLocation();
  const selected = demoView(path) ?? 'home';
  const areas: DemoView[] = ['home', 'central', 'wallet', 'treasury', 'account'];
  return <main className="demo-root min-h-[calc(100dvh-var(--site-header-h))] px-3 py-10 sm:px-6 sm:py-14" data-testid="public-demo">
    <div className="mx-auto max-w-5xl">
      <header className="mb-8 max-w-3xl">
        <h1 className="display text-3xl font-extrabold leading-tight tracking-tight sm:text-4xl">
          {x('Aplicativo em breve, em desenvolvimento', 'App coming soon, under development', 'Aplicación próximamente, en desarrollo')}
        </h1>
      </header>
      <nav aria-label={x('Áreas do app', 'App areas', 'Áreas de la app')} className="mb-6 flex gap-1 overflow-x-auto border-b border-[#E4DCCB]">
        {areas.map(area => <Link key={area} href={demoPath(area, loc)} aria-current={selected === area ? 'page' : undefined}
          className={`inline-flex min-h-11 shrink-0 items-center border-b-2 px-3 text-sm font-bold sm:px-4 ${selected === area ? 'border-[#0E7C6B] text-[#0A6657]' : 'border-transparent text-[#5B6B85]'}`}>
          {demoLabel(area, loc)}
        </Link>)}
      </nav>
      <section aria-labelledby="public-demo-area">
        <h2 id="public-demo-area" className="mb-4 text-xl font-bold">{demoLabel(selected, loc)}</h2>
        <div className="grid gap-4 sm:grid-cols-2" aria-hidden="true">
          {[0, 1].map(i => <div key={i} className="dcard space-y-5 p-6">
            <div className="h-3 w-28 rounded bg-[#E4DCCB]" />
            <div className="h-8 w-36 rounded bg-[#ECE6DA]" />
            <div className="h-3 w-2/3 rounded bg-[#F0EADF]" />
          </div>)}
          <div className="dcard space-y-5 p-6 sm:col-span-2">
            <div className="h-3 w-40 rounded bg-[#E4DCCB]" />
            {[0, 1, 2].map(i => <div key={i} className="flex items-center gap-4 border-t border-[#EEE8DD] pt-4">
              <div className="h-9 w-9 shrink-0 rounded-full bg-[#ECE6DA]" />
              <div className="h-3 w-1/2 rounded bg-[#F0EADF]" />
              <div className="ml-auto h-3 w-14 rounded bg-[#ECE6DA]" />
            </div>)}
          </div>
        </div>
      </section>
    </div>
  </main>;
}
