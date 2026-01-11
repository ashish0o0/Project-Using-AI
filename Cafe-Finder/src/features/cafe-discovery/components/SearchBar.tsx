import { memo, useRef } from 'react'

type SearchBarProps = {
  value: string
  onChange: (value: string) => void
  onSearch?: () => void
  placeholder?: string
}

export const SearchBar = memo(function SearchBar({
  value,
  onChange,
  onSearch,
  placeholder = 'Search cafes...',
}: SearchBarProps) {
  const inputRef = useRef<HTMLInputElement>(null)

  const handleSearchClick = () => {
    if (onSearch) {
      onSearch()
    } else {
      // If no onSearch handler, focus the input
      inputRef.current?.focus()
    }
  }

  const handleKeyPress = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter' && onSearch) {
      onSearch()
    }
  }

  return (
    <div style={{ position: 'relative', width: '100%', maxWidth: '500px', display: 'flex', alignItems: 'center' }}>
      <input
        ref={inputRef}
        type="text"
        value={value}
        onChange={(event) => onChange(event.target.value)}
        onKeyPress={handleKeyPress}
        placeholder={placeholder}
        style={{
          flex: 1,
          padding: '0.625rem 1rem',
          paddingRight: '3rem',
          borderRadius: '0.5rem',
          border: '1px solid rgba(255, 255, 255, 0.3)',
          backgroundColor: 'rgba(255, 255, 255, 0.95)',
          color: '#111827',
          fontSize: '0.875rem',
          outline: 'none',
          transition: 'all 0.2s',
        }}
        onFocus={(e) => {
          e.target.style.borderColor = '#fbbf24'
          e.target.style.backgroundColor = '#ffffff'
        }}
        onBlur={(e) => {
          e.target.style.borderColor = 'rgba(255, 255, 255, 0.3)'
          e.target.style.backgroundColor = 'rgba(255, 255, 255, 0.95)'
        }}
      />
      <button
        onClick={handleSearchClick}
        type="button"
        style={{
          position: 'absolute',
          right: '0.5rem',
          top: '50%',
          transform: 'translateY(-50%)',
          background: 'transparent',
          border: 'none',
          cursor: 'pointer',
          padding: '0.5rem',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          fontSize: '1.125rem',
          transition: 'transform 0.2s',
          color: '#4b5563',
        }}
        onMouseEnter={(e) => {
          e.currentTarget.style.transform = 'translateY(-50%) scale(1.1)'
          e.currentTarget.style.color = '#3b2f2f'
        }}
        onMouseLeave={(e) => {
          e.currentTarget.style.transform = 'translateY(-50%) scale(1)'
          e.currentTarget.style.color = '#4b5563'
        }}
        title="Search"
      >
        🔍
      </button>
    </div>
  )
})

