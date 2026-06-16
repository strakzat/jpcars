import type { CSSProperties, ReactNode } from 'react'
import './Card.css'

export default function Card({
  children,
  className = '',
  style,
  as = 'div',
  onClick,
}: {
  children: ReactNode
  className?: string
  style?: CSSProperties
  as?: 'div' | 'button'
  onClick?: () => void
}) {
  const Tag = as
  return (
    <Tag
      className={`card ${as === 'button' ? 'card--button' : ''} ${className}`}
      style={style}
      onClick={onClick}
    >
      {children}
    </Tag>
  )
}
