'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { Plane } from 'lucide-react'

const navItems = [
  { href: '/', label: 'Search' },
  { href: '/assistant', label: 'Assistant' },
  { href: '/results', label: 'Results' },
  { href: '/watches', label: 'Watches' },
  { href: '/dashboard', label: 'Dashboard' },
]

export default function SiteHeader() {
  const pathname = usePathname()

  return (
    <header className="sticky top-0 z-50 border-b border-white/10 bg-[rgba(6,12,26,0.72)] backdrop-blur-xl">
      <div className="app-content flex h-16 items-center justify-between gap-4">
        <Link href="/" className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-2xl border border-sky-300/20 bg-sky-300/10">
            <Plane className="h-5 w-5 text-sky-200" />
          </div>
          <div>
            <div className="font-[family:var(--font-display)] text-lg font-semibold text-white">Roamly</div>
            <div className="text-[10px] uppercase tracking-[0.28em] text-slate-400">Flight watches</div>
          </div>
        </Link>

        <nav className="hidden items-center gap-2 md:flex">
          {navItems.map(item => {
            const isActive =
              item.href === '/' ? pathname === item.href : pathname.startsWith(item.href)

            return (
              <Link
                key={item.href}
                href={item.href}
                className={`rounded-full px-4 py-2 text-sm transition ${
                  isActive
                    ? 'bg-white/12 text-white'
                    : 'text-slate-300 hover:bg-white/8 hover:text-white'
                }`}
              >
                {item.label}
              </Link>
            )
          })}
        </nav>
      </div>
    </header>
  )
}
