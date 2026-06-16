import { Car } from 'lucide-react'
import { brandLogo } from '../data/mock'
import './BrandMark.css'

/**
 * Brand badge for a vehicle. Shows the make's logo on a light tile when we
 * have one; otherwise falls back to a generic car icon on the accent badge.
 */
export default function BrandMark({ make, size = 42 }: { make: string; size?: number }) {
  const logo = brandLogo(make)
  const radius = Math.round(size * 0.26)

  if (logo) {
    return (
      <span
        className="brandmark brandmark--logo"
        style={{ width: size, height: size, borderRadius: radius }}
      >
        <img src={logo} alt={make} />
      </span>
    )
  }

  return (
    <span
      className="brandmark brandmark--icon"
      style={{ width: size, height: size, borderRadius: radius }}
    >
      <Car width={Math.round(size * 0.46)} height={Math.round(size * 0.46)} />
    </span>
  )
}
