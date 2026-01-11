import { memo } from 'react'

type LoadingSpinnerProps = {
  size?: 'small' | 'medium' | 'large'
}

const sizeMap = {
  small: '1rem',
  medium: '2rem',
  large: '3rem',
}

export const LoadingSpinner = memo(function LoadingSpinner({ size = 'medium' }: LoadingSpinnerProps) {
  const spinnerSize = sizeMap[size]

  return (
    <div
      style={{
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        padding: '2rem',
      }}
    >
      <div
        style={{
          width: spinnerSize,
          height: spinnerSize,
          border: '3px solid #374151',
          borderTop: '3px solid #fbbf24',
          borderRadius: '50%',
          animation: 'spin 1s linear infinite',
        }}
      />
      <style>
        {`
          @keyframes spin {
            0% { transform: rotate(0deg); }
            100% { transform: rotate(360deg); }
          }
        `}
      </style>
    </div>
  )
})
