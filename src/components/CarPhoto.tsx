import { carPhoto } from '../data/mock'
import './CarPhoto.css'

/**
 * Wide hero photo of the vehicle, shown when we have a representative shot for
 * the make/model. Renders nothing otherwise so callers can keep the BrandMark
 * logo as the fallback.
 */
export default function CarPhoto({
  make,
  model,
  className = '',
}: {
  make: string
  model: string
  className?: string
}) {
  const src = carPhoto(make, model)
  if (!src) return null

  return (
    <div className={`carphoto ${className}`}>
      <img src={src} alt={`${make} ${model}`} loading="lazy" />
    </div>
  )
}
