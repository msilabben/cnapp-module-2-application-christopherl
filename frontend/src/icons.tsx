import type { ReactNode, SVGProps } from 'react'

export type IconName = 'arrow' | 'calendar' | 'check' | 'close' | 'external' | 'gift' | 'hanger' | 'heart' | 'home' | 'mail' | 'menu' | 'pin'

const paths: Record<IconName, ReactNode> = {
  arrow: <path d="m9 18 6-6-6-6" />,
  calendar: <><path d="M8 2v4M16 2v4M3 10h18" /><rect x="3" y="4" width="18" height="18" rx="2" /></>,
  check: <path d="m5 12 4 4L19 6" />,
  close: <path d="M18 6 6 18M6 6l12 12" />,
  external: <><path d="M15 3h6v6M10 14 21 3" /><path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6" /></>,
  gift: <><rect x="3" y="8" width="18" height="13" rx="2" /><path d="M12 8v13M3 12h18M7.5 8C5 8 4 6.5 4 5s1.2-2 2.5-2C9 3 12 8 12 8s3-5 5.5-5C18.8 3 20 3.5 20 5s-1 3-3.5 3" /></>,
  hanger: <><path d="M12 9V7a2 2 0 1 0-2-2" /><path d="m4 19 8-7 8 7a1 1 0 0 1-.7 1.8H4.7A1 1 0 0 1 4 19Z" /></>,
  heart: <path d="M20.8 4.6a5.5 5.5 0 0 0-7.8 0L12 5.7l-1.1-1.1a5.5 5.5 0 0 0-7.8 7.8l1.1 1.1L12 21l7.8-7.5 1.1-1.1a5.5 5.5 0 0 0-.1-7.8Z" />,
  home: <><path d="m3 11 9-8 9 8" /><path d="M5 10v11h14V10M9 21v-7h6v7" /></>,
  mail: <><rect x="3" y="5" width="18" height="14" rx="2" /><path d="m3 7 9 6 9-6" /></>,
  menu: <path d="M4 7h16M4 12h16M4 17h16" />,
  pin: <><path d="M20 10c0 5-8 12-8 12S4 15 4 10a8 8 0 1 1 16 0Z" /><circle cx="12" cy="10" r="2.5" /></>,
}

export function Icon({ name, ...props }: { name: IconName } & SVGProps<SVGSVGElement>) {
  return <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true" {...props}>{paths[name]}</svg>
}
