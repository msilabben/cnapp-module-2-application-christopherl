export type PageId = 'velkommen' | 'program' | 'sted' | 'antrekk' | 'svar' | 'onskeliste'

export const wedding = {
  couple: 'Christopher & Rikke',
  date: '2027-07-24T12:00:00+02:00',
  dateLabel: '24. juli 2027',
  rsvpDeadline: '1. mars 2027',
  venue: {
    name: 'Øvre Sem Gård',
    address: 'Semsveien 166, 1388 Asker',
    mapEmbedUrl: 'https://www.openstreetmap.org/export/embed.html?bbox=10.4233%2C59.8508%2C10.4433%2C59.8608&layer=mapnik&marker=59.855792%2C10.433324',
    directionsUrl: 'https://www.google.com/maps/dir/?api=1&destination=%C3%98vre%20Sem%20G%C3%A5rd%2C%20Semsveien%20166%2C%20Asker',
    imageUrl: '/images/ovre-sem-gard.avif',
  },
  schedule: [
    { time: '12:00', title: 'Vielse', detail: 'Vi sier ja til hverandre.' },
    { time: '17:00', title: 'Middag', detail: 'Vi samles rundt bordet.' },
    { time: '19:00', title: 'Fest', detail: 'Vi feirer videre utover kvelden.' },
  ],
  dressCode: {
    title: 'Formelt',
    description: 'Vi ønsker et formelt antrekk. Velg gjerne dress, lang kjole eller et annet pent antrekk som du føler deg vel i.',
  },
  wishlistUrl: '',
} as const

export const navigation: ReadonlyArray<{ id: PageId; label: string }> = [
  { id: 'velkommen', label: 'Velkommen' },
  { id: 'program', label: 'Program' },
  { id: 'sted', label: 'Sted' },
  { id: 'antrekk', label: 'Antrekk' },
  { id: 'svar', label: 'Svar' },
  { id: 'onskeliste', label: 'Ønskeliste' },
]
