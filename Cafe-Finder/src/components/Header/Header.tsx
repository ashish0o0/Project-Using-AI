import type { ReactNode } from 'react'

type HeaderProps = {
  children?: ReactNode
}

export function Header({ children }: HeaderProps) {
  return (
    <header className="header">
      <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', flex: '0 0 auto' }}>
        <span style={{ fontSize: '1.5rem' }}>☕</span>
        <h1 style={{ margin: 0, fontSize: '1.25rem', fontWeight: 600 }}>Café Finder</h1>
      </div>
      {children && (
        <div style={{ flex: 1, display: 'flex', justifyContent: 'center', alignItems: 'center', padding: '0 1rem', gap: '1rem', flexWrap: 'wrap' }}>
          {children}
        </div>
      )}
    </header>
  )
}
