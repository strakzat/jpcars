import { Car } from 'lucide-react'
import { brandLogo, carPhoto } from '../data/mock'
import './BrandMark.css'

/**
 * Vehicle badge. Prefers a photo of the car when we have one (needs the model);
 * otherwise the make's logo on a light tile; otherwise a generic car icon.
 */
export default function BrandMark({
  make,
  model,
  size = 42,
}: {
  make: string
  model?: string
  size?: number
}) {
  const photo = model ? carPhoto(make, model) : null
  const logo = brandLogo(make)
  const radius = Math.round(size * 0.26)

  if (photo) {
    return (
      <span
        className="brandmark brandmark--photo"
        style={{ width: size, height: size, borderRadius: radius }}
      >
        <img src={photo} alt={`${make} ${model}`} loading="lazy" />
      </span>
    )
  }

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
