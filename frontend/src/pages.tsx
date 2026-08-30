import { FormEvent, useEffect, useState } from 'react'
import { PageId, wedding } from './config'
import { Icon } from './icons'

type Navigate = (page: PageId) => void

function PageHeading({ eyebrow, title, children }: { eyebrow: string; title: string; children: React.ReactNode }) {
  return <header className="page-heading"><p className="eyebrow">{eyebrow}</p><h1>{title}</h1><p>{children}</p></header>
}

function getCountdown() {
  const difference = new Date(wedding.date).getTime() - Date.now()
  return Math.max(0, Math.ceil(difference / 86_400_000))
}

export function WelcomePage({ navigate }: { navigate: Navigate }) {
  const [days, setDays] = useState(getCountdown)

  useEffect(() => {
    const timer = window.setInterval(() => setDays(getCountdown()), 60_000)
    return () => window.clearInterval(timer)
  }, [])

  return <div className="welcome-page">
    <section className="hero" aria-labelledby="welcome-title">
      <img src={wedding.venue.imageUrl} alt="Øvre Sem Gård i grønne omgivelser" />
      <div className="hero-shade" />
      <div className="hero-content">
        <p className="eyebrow light">Vi skal gifte oss</p>
        <h1 id="welcome-title">Christopher <span>&</span> Rikke</h1>
        <p className="hero-date">{wedding.dateLabel}</p>
        <p className="hero-place">{wedding.venue.name} · Asker</p>
      </div>
      <button className="scroll-cue" onClick={() => document.getElementById('intro')?.scrollIntoView({ behavior: 'smooth' })} aria-label="Les mer"><span /></button>
    </section>

    <section className="welcome-intro" id="intro">
      <div className="botanical-mark" aria-hidden="true">❦</div>
      <p className="eyebrow">Velkommen</p>
      <h2>Vi gleder oss til å feire med dere</h2>
      <p>Her finner dere all praktisk informasjon om bryllupsdagen vår. Vi oppdaterer siden når nye detaljer er klare.</p>
      <div className="countdown" aria-label={`${days} dager igjen`}><strong>{days}</strong><span>dager igjen</span></div>
      <button className="primary-button" onClick={() => navigate('program')}>Se programmet <Icon name="arrow" /></button>
    </section>
  </div>
}

export function SchedulePage() {
  return <div className="content-page">
    <PageHeading eyebrow="Bryllupsdagen" title="Program">Dette er det foreløpige programmet. Vi oppdaterer siden når flere detaljer er klare.</PageHeading>
    <div className="timeline">
      {wedding.schedule.map((item, index) => <article className="timeline-item" key={item.time}>
        <div className="time-dot"><span>{item.time}</span></div>
        <div><p className="step-number">0{index + 1}</p><h2>{item.title}</h2><p>{item.detail}</p></div>
      </article>)}
    </div>
    <aside className="note-card"><Icon name="heart" /><div><strong>Mer informasjon kommer</strong><p>Tidene kan bli endret. Vi gir beskjed når programmet er endelig.</p></div></aside>
  </div>
}

export function VenuePage() {
  return <div className="content-page wide-page">
    <PageHeading eyebrow="Finn frem" title="Øvre Sem Gård">Vi feirer dagen på en historisk gård ved Semsvannet i Asker.</PageHeading>
    <div className="venue-grid">
      <div className="map-frame"><iframe src={wedding.venue.mapEmbedUrl} title={`Kart til ${wedding.venue.name}`} loading="lazy" referrerPolicy="no-referrer-when-downgrade" /></div>
      <div className="venue-details">
        <span className="icon-badge"><Icon name="pin" /></span>
        <h2>{wedding.venue.name}</h2><p>{wedding.venue.address}</p>
        <a className="primary-button" href={wedding.venue.directionsUrl} target="_blank" rel="noreferrer">Åpne veibeskrivelse <Icon name="external" /></a>
        <p className="small-copy">Mer informasjon om transport og parkering kommer.</p>
      </div>
    </div>
  </div>
}

export function DressCodePage() {
  return <div className="content-page narrow-page">
    <PageHeading eyebrow="Hva skal jeg ha på?" title="Antrekk">Vi ønsker en høytidelig ramme rundt dagen.</PageHeading>
    <section className="dress-card">
      <div className="dress-illustration"><Icon name="hanger" /><span className="line-art line-one" /><span className="line-art line-two" /></div>
      <p className="eyebrow">Kleskode</p><h2>{wedding.dressCode.title}</h2><p>{wedding.dressCode.description}</p>
    </section>
    <aside className="note-card"><Icon name="heart" /><div><strong>Det viktigste</strong><p>Kom i noe som gjør at du kan feire og danse med oss hele kvelden.</p></div></aside>
  </div>
}

type RsvpForm = {
  familyName: string
  email: string
  attending: 'yes' | 'no'
  guestCount: number
  guestNames: string
  dietaryNeeds: string
  message: string
}

const emptyRsvp: RsvpForm = { familyName: '', email: '', attending: 'yes', guestCount: 1, guestNames: '', dietaryNeeds: '', message: '' }

export function RsvpPage() {
  const [form, setForm] = useState<RsvpForm>(emptyRsvp)
  const [status, setStatus] = useState<'idle' | 'loading' | 'saving' | 'saved' | 'error'>('loading')
  const [error, setError] = useState('')

  useEffect(() => {
    fetch('/api/rsvp', { credentials: 'same-origin' }).then(async response => {
      if (response.status === 404) return null
      if (!response.ok) throw new Error('Kunne ikke hente tidligere svar.')
      return response.json() as Promise<RsvpForm>
    }).then(data => { if (data) setForm(data); setStatus('idle') }).catch(() => setStatus('idle'))
  }, [])

  const set = <K extends keyof RsvpForm>(key: K, value: RsvpForm[K]) => setForm(current => ({ ...current, [key]: value }))

  async function submit(event: FormEvent) {
    event.preventDefault()
    setStatus('saving')
    setError('')
    try {
      const response = await fetch('/api/rsvp', { method: 'POST', credentials: 'same-origin', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(form) })
      if (!response.ok) throw new Error('Vi kunne ikke lagre svaret. Prøv igjen.')
      setStatus('saved')
    } catch (reason) {
      setStatus('error')
      setError(reason instanceof Error ? reason.message : 'Noe gikk galt.')
    }
  }

  if (status === 'saved') return <div className="content-page narrow-page"><section className="success-card"><span><Icon name="check" /></span><p className="eyebrow">Takk for svaret</p><h1>Svaret er lagret</h1><p>Dere kan åpne denne siden på samme enhet for å endre svaret senere.</p><button className="secondary-button" onClick={() => setStatus('idle')}>Endre svaret</button></section></div>

  return <div className="content-page form-page">
    <PageHeading eyebrow={`Svar innen ${wedding.rsvpDeadline}`} title="Kommer dere?">Send ett svar for hele familien. Dere kan endre svaret senere på denne enheten.</PageHeading>
    <form className="rsvp-form" onSubmit={submit}>
      <div className="field full"><label htmlFor="familyName">Familienavn</label><input id="familyName" required autoComplete="family-name" value={form.familyName} onChange={e => set('familyName', e.target.value)} placeholder="For eksempel Hansen" /></div>
      <div className="field full"><label htmlFor="email">E-post</label><input id="email" required type="email" autoComplete="email" value={form.email} onChange={e => set('email', e.target.value)} placeholder="navn@eksempel.no" /></div>
      <fieldset className="field full"><legend>Kommer dere?</legend><div className="choice-row"><label className={form.attending === 'yes' ? 'selected' : ''}><input type="radio" name="attending" checked={form.attending === 'yes'} onChange={() => set('attending', 'yes')} />Ja, vi kommer</label><label className={form.attending === 'no' ? 'selected' : ''}><input type="radio" name="attending" checked={form.attending === 'no'} onChange={() => set('attending', 'no')} />Nei, dessverre</label></div></fieldset>
      {form.attending === 'yes' && <>
        <div className="field"><label htmlFor="guestCount">Antall personer</label><input id="guestCount" required min="1" max="20" type="number" value={form.guestCount} onChange={e => set('guestCount', Number(e.target.value))} /></div>
        <div className="field full"><label htmlFor="guestNames">Navn på alle gjester</label><textarea id="guestNames" required value={form.guestNames} onChange={e => set('guestNames', e.target.value)} placeholder="Skriv ett navn per linje" rows={4} /></div>
        <div className="field full"><label htmlFor="dietaryNeeds">Allergier eller andre matbehov <span>Valgfritt</span></label><textarea id="dietaryNeeds" value={form.dietaryNeeds} onChange={e => set('dietaryNeeds', e.target.value)} rows={3} /></div>
      </>}
      <div className="field full"><label htmlFor="message">Melding til oss <span>Valgfritt</span></label><textarea id="message" value={form.message} onChange={e => set('message', e.target.value)} rows={3} /></div>
      {error && <p className="form-error" role="alert">{error}</p>}
      <button className="primary-button submit-button" disabled={status === 'saving'}>{status === 'saving' ? 'Lagrer …' : 'Send svar'} <Icon name="mail" /></button>
      <p className="privacy-note">Vi bruker opplysningene bare til å planlegge bryllupet.</p>
    </form>
  </div>
}

export function WishlistPage() {
  return <div className="content-page narrow-page">
    <PageHeading eyebrow="En liten hilsen" title="Ønskeliste">Det viktigste for oss er at dere vil feire dagen sammen med oss.</PageHeading>
    <section className="wishlist-card"><div className="gift-circle"><Icon name="gift" /></div><h2>Ønskelisten kommer</h2><p>Vi legger ut ønsker her når listen er klar.</p>{wedding.wishlistUrl && <a className="primary-button" href={wedding.wishlistUrl} target="_blank" rel="noreferrer">Se ønskelisten <Icon name="external" /></a>}<span className="coming-soon">Oppdateres senere</span></section>
  </div>
}
