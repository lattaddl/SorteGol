import { useStored } from './storage'
import { Segmented } from './ui'
import MatchPage from './MatchPage'
import TournamentPage from './TournamentPage'
import TeamsPage from './TeamsPage'

type Tab = 'partido' | 'torneo' | 'equipos'

function Logo() {
  return (
    <div className="flex items-center gap-2.5">
      <img src="/icon.svg" alt="" width={34} height={34} className="rounded-[10px]" />
      <span className="font-display text-2xl font-black uppercase leading-none tracking-wide">sortegol</span>
    </div>
  )
}

export default function App() {
  const [tab, setTab] = useStored<Tab>('tab', 'partido')

  return (
    <>
      <div className="stage-bg" aria-hidden />
      <header className="sticky top-0 z-30 border-b border-white/10 bg-tinta/70 backdrop-blur-lg">
        <div className="mx-auto flex max-w-6xl flex-wrap items-center justify-between gap-3 px-4 py-3">
          <Logo />
          <Segmented
            className="w-full sm:w-auto sm:min-w-[340px]"
            value={tab}
            onChange={setTab}
            options={[
              { id: 'partido', label: 'Partido' },
              { id: 'torneo', label: 'Torneo' },
              { id: 'equipos', label: 'Equipos' },
            ]}
          />
        </div>
      </header>

      <main className="mx-auto max-w-6xl px-4 pb-24 pt-10 sm:pt-14">
        {tab === 'partido' && <MatchPage />}
        {tab === 'torneo' && <TournamentPage />}
        {tab === 'equipos' && <TeamsPage />}
      </main>

      <footer className="border-t border-white/10 py-6 text-center text-sm text-white/45">
        Pagina no oficial hecho como proyecto escolar. Las valoraciones son aproximadas y no pertenecen a EA SPORTS si no que son estimaciones propias.
      </footer>
    </>
  )
}
