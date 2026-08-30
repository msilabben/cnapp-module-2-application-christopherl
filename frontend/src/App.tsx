import { useEffect, useState } from 'react'
import { navigation, PageId, wedding } from './config'
import { Icon, IconName } from './icons'
import { DressCodePage, RsvpPage, SchedulePage, VenuePage, WelcomePage, WishlistPage } from './pages'

const pageIcons: Record<PageId, IconName> = {
  velkommen: 'home', program: 'calendar', sted: 'pin', antrekk: 'hanger', svar: 'mail', onskeliste: 'gift',
}

function routeFromHash(): PageId {
  const route = window.location.hash.replace('#/', '') as PageId
  return navigation.some(item => item.id === route) ? route : 'velkommen'
}

export default function App() {
  const [page, setPage] = useState<PageId>(routeFromHash)
  const [menuOpen, setMenuOpen] = useState(false)

  useEffect(() => {
    const updateRoute = () => {
      setPage(routeFromHash())
      setMenuOpen(false)
      window.scrollTo({ top: 0, behavior: 'auto' })
    }
    window.addEventListener('hashchange', updateRoute)
    return () => window.removeEventListener('hashchange', updateRoute)
  }, [])

  useEffect(() => {
    document.body.classList.toggle('menu-is-open', menuOpen)
    return () => document.body.classList.remove('menu-is-open')
  }, [menuOpen])

  function navigate(nextPage: PageId) {
    if (nextPage === page) {
      setMenuOpen(false)
      window.scrollTo({ top: 0, behavior: 'smooth' })
      return
    }
    window.location.hash = `/${nextPage}`
  }

  const content = {
    velkommen: <WelcomePage navigate={navigate} />,
    program: <SchedulePage />,
    sted: <VenuePage />,
    antrekk: <DressCodePage />,
    svar: <RsvpPage />,
    onskeliste: <WishlistPage />,
  }[page]

  return <div className="site-shell">
    <header className={`site-header ${page === 'velkommen' ? 'over-hero' : ''}`}>
      <button className="menu-button" onClick={() => setMenuOpen(true)} aria-label="Åpne meny" aria-expanded={menuOpen}><Icon name="menu" /></button>
      <button className="wordmark" onClick={() => navigate('velkommen')}>{wedding.couple}</button>
      <button className="rsvp-link" onClick={() => navigate('svar')}>Svar</button>
    </header>

    <div className={`menu-overlay ${menuOpen ? 'open' : ''}`} aria-hidden={!menuOpen}>
      <button className="menu-backdrop" onClick={() => setMenuOpen(false)} tabIndex={menuOpen ? 0 : -1} aria-label="Lukk meny" />
      <nav className="menu-panel" aria-label="Hovedmeny">
        <div className="menu-top"><span>Meny</span><button onClick={() => setMenuOpen(false)} aria-label="Lukk meny"><Icon name="close" /></button></div>
        <p className="menu-couple">{wedding.couple}</p><p className="menu-date">{wedding.dateLabel}</p>
        <div className="menu-items">{navigation.map(item => <button key={item.id} className={page === item.id ? 'active' : ''} onClick={() => navigate(item.id)}><Icon name={pageIcons[item.id]} /><span>{item.label}</span><Icon name="arrow" /></button>)}</div>
      </nav>
    </div>

    <main>{content}</main>
    {page !== 'velkommen' && <footer><span>{wedding.couple}</span><span>·</span><span>{wedding.dateLabel}</span></footer>}
  </div>
}
