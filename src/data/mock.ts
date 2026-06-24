import {
  Mountain,
  Users,
  Camera,
  Radar,
  Snowflake,
  Disc3,
  ThermometerSun,
  Armchair,
  Sofa,
  Navigation,
  SquareParking,
  Smartphone,
  type LucideIcon,
} from 'lucide-react'

/* ── Options ──────────────────────────────────────────────────────────── */

export interface VehicleOption {
  id: string
  label: string
  Icon: LucideIcon
  /** € added to the valuation when this option is present */
  value: number
}

export const options: VehicleOption[] = [
  { id: '4x4', label: '4x4', Icon: Mountain, value: 1200 },
  { id: '7seat', label: '7 Seater', Icon: Users, value: 700 },
  { id: 'camera', label: 'Rear view camera', Icon: Camera, value: 350 },
  { id: 'acc', label: 'Adaptive cruise control', Icon: Radar, value: 500 },
  { id: 'aircon', label: 'Air conditioning', Icon: Snowflake, value: 250 },
  { id: 'alloy', label: 'Alloy wheels', Icon: Disc3, value: 400 },
  { id: 'climate', label: 'Climate control', Icon: ThermometerSun, value: 350 },
  { id: 'heated', label: 'Heated seats', Icon: Armchair, value: 300 },
  { id: 'leather', label: 'Partial / full leather', Icon: Sofa, value: 900 },
  { id: 'nav', label: 'Navigation', Icon: Navigation, value: 600 },
  { id: 'pdc', label: 'PDC', Icon: SquareParking, value: 300 },
  { id: 'carplay', label: 'Smartphone integration', Icon: Smartphone, value: 250 },
]

export const optionById: Record<string, VehicleOption> = Object.fromEntries(
  options.map((o) => [o.id, o]),
)

/* ── Vehicles ─────────────────────────────────────────────────────────── */

export interface Vehicle {
  plate: string
  make: string
  model: string
  variant: string
  year: number
  fuel: string
  /** Market reference price before mileage / options adjustments */
  basePrice: number
  /** Options that come pre-selected for this vehicle */
  defaultOptions: string[]
  /** Typical mileage shown as a hint */
  expectedMileage: number
}

const MAZDA_3: Vehicle = {
  plate: '',
  make: 'MAZDA',
  model: '3',
  variant: '2.0 SkyActiv-G Comfort',
  year: 2021,
  fuel: 'Petrol',
  basePrice: 21500,
  defaultOptions: ['aircon', 'alloy', 'climate', 'heated', 'nav', 'pdc'],
  expectedMileage: 52000,
}

/** Known plates resolve to a specific car; anything else falls back to the Mazda. */
export const vehicleByPlate: Record<string, Vehicle> = {
  '35SLJ7': { ...MAZDA_3, plate: '35-SLJ-7' },
  '50TDK3': {
    plate: '50-TDK-3',
    make: 'BMW',
    model: '3 Series',
    variant: '320d Executive',
    year: 2019,
    fuel: 'Diesel',
    basePrice: 17800,
    defaultOptions: ['aircon', 'alloy', 'climate', 'nav', 'acc', 'leather'],
    expectedMileage: 86000,
  },
  Z445BN: {
    plate: 'Z-445-BN',
    make: 'TOYOTA',
    model: 'Aygo',
    variant: '1.0 VVT-i x-play',
    year: 2022,
    fuel: 'Petrol',
    basePrice: 13900,
    defaultOptions: ['aircon', 'carplay', 'camera'],
    expectedMileage: 28000,
  },
  XL590P: {
    plate: 'XL-590-P',
    make: 'NISSAN',
    model: 'Micra',
    variant: 'IG-T 100 N-Connecta',
    year: 2020,
    fuel: 'Petrol',
    basePrice: 12600,
    defaultOptions: ['aircon', 'alloy', 'nav', 'carplay'],
    expectedMileage: 61000,
  },
}

const norm = (plate: string) => plate.toUpperCase().replace(/[^A-Z0-9]/g, '')

export function lookupVehicle(plate: string): Vehicle {
  const hit = vehicleByPlate[norm(plate)]
  if (hit) return hit
  return { ...MAZDA_3, plate: plate ? norm(plate).replace(/(.{2})/g, '$1-').replace(/-$/, '') : '' }
}

export const defaultVehicle = MAZDA_3

/* ── Valuation calculation ────────────────────────────────────────────── */

export interface Valuation {
  base: number
  mileageAdj: number
  optionsAdj: number
  /** Estimated market / trade-in value */
  price: number
  /** Recommended purchase price (price − margin) */
  gross: number
  margin: number
}

export const round50 = (n: number) => Math.round(n / 50) * 50

export function calcValuation(
  vehicle: Vehicle,
  mileage: number | null,
  selected: string[],
): Valuation {
  const km = mileage ?? vehicle.expectedMileage
  // Depreciate vs. the car's expected mileage: ~6 ct per excess km, +5 ct credit
  // per km under expectation (capped so it stays believable).
  const delta = km - vehicle.expectedMileage
  const mileageAdj = round50(-Math.max(-0.05, Math.min(0.06, delta === 0 ? 0 : 0.06 * Math.sign(delta))) * Math.abs(delta))
  const optionsAdj = round50(
    selected.reduce((sum, id) => sum + (optionById[id]?.value ?? 0), 0),
  )
  const price = Math.max(1000, round50(vehicle.basePrice + mileageAdj + optionsAdj))
  const margin = Math.min(3500, Math.max(2000, round50(price * 0.16)))
  const gross = price - margin
  return { base: vehicle.basePrice, mileageAdj, optionsAdj, price, gross, margin }
}

/** Brand logos shown when no photo of the actual car is available. */
export const brandLogos: Record<string, string> = {
  MAZDA: '/brands/mazda.png',
  BMW: '/brands/bmw.png',
  TOYOTA: '/brands/toyota.png',
  NISSAN: '/brands/nissan.png',
}
export const brandLogo = (make: string): string | null =>
  brandLogos[make.trim().toUpperCase()] ?? null

/**
 * Representative model photos for the known demo cars, keyed by "MAKE MODEL".
 * Prototype stand-in for a live photo service (e.g. imagin.studio keyed on
 * make/model/year): unknown cars fall back to the brand logo via BrandMark.
 */
export const carPhotos: Record<string, string> = {
  'MAZDA 3': '/cars/mazda-3.jpg',
  'BMW 3 SERIES': '/cars/bmw-3.jpg',
  'TOYOTA AYGO': '/cars/toyota-aygo.jpg',
  'NISSAN MICRA': '/cars/nissan-micra.jpg',
}
export const carPhoto = (make: string, model: string): string | null =>
  carPhotos[`${make} ${model}`.trim().toUpperCase()] ?? null

export const eur = (n: number) =>
  '€ ' + n.toLocaleString('nl-NL', { maximumFractionDigits: 0 })

export const km = (n: number) => n.toLocaleString('nl-NL') + ' km'

/* ── Saved valuations ─────────────────────────────────────────────────── */

export interface SavedValuation {
  id: string
  make: string
  model: string
  variant: string
  year: number
  fuel: string
  plate: string
  mileage: number
  price: number
  gross: number
  date: string
  options: string[]
  note?: string
}

/* ── Benchmark / comparable-cars ──────────────────────────────────────── */

/** Normalized input both entry points (valuation result + saved) build. */
export interface BenchmarkSubject {
  make: string
  model: string
  variant: string
  year: number
  plate: string
  mileage: number
  options: string[]
  /** Our market value (vraagprijs equivalent) */
  price: number
  /** Our recommended purchase (bruto inkoop) */
  gross: number
}

export interface Dealer {
  name: string
  website: string
}

export interface BenchmarkListing {
  id: string
  make: string
  model: string
  variant: string
  year: number
  mileage: number
  options: string[]
  /** Vraagprijs — what it's listed at */
  price: number
  /** Bruto inkoop — what we'd buy at */
  gross: number
  /** Marketability index, 5 = hottest in the market */
  etr: 1 | 2 | 3 | 4 | 5
  /** Confidence in the ETR score, 0–100 */
  apr: number
  trend: 'up' | 'down' | 'flat'
  daysListed: number
  /** The dealer offering this car (null for our own car) */
  dealer: Dealer | null
  isOurs: boolean
}

export interface OptionDiff {
  /** Present in both our car and the listing */
  shared: string[]
  /** The listing has these, our car does not */
  extra: string[]
  /** Our car has these, the listing does not */
  missing: string[]
}

export function optionDiff(ourOptions: string[], listingOptions: string[]): OptionDiff {
  const ours = new Set(ourOptions)
  const theirs = new Set(listingOptions)
  return {
    shared: ourOptions.filter((id) => theirs.has(id)),
    extra: listingOptions.filter((id) => !ours.has(id)),
    missing: ourOptions.filter((id) => !theirs.has(id)),
  }
}

/* Deterministic pseudo-randomness — we avoid Math.random so the same car's
   benchmark shows an identical list every time it's opened. */
function hashStr(s: string): number {
  let h = 0x811c9dc5
  for (let i = 0; i < s.length; i++) {
    h ^= s.charCodeAt(i)
    h = Math.imul(h, 0x01000193)
  }
  return h >>> 0
}
function seeded(seed: number): () => number {
  let a = seed >>> 0
  return () => {
    a |= 0
    a = (a + 0x6d2b79f5) | 0
    let t = Math.imul(a ^ (a >>> 15), 1 | a)
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296
  }
}

const VARIANT_SUFFIX = ['Comfort', 'Executive', 'Style', 'Business', 'Sport', 'Edition', 'Luxury']

const DEALERS: Dealer[] = [
  { name: 'Autobedrijf Van Dijk', website: 'vandijkauto.nl' },
  { name: 'Garage Hoekstra', website: 'garagehoekstra.nl' },
  { name: 'AutoCentrum Noord', website: 'autocentrumnoord.nl' },
  { name: "Janssen Auto's", website: 'janssenautos.nl' },
  { name: 'De Wit Automotive', website: 'dewitautomotive.nl' },
  { name: 'Autopark Zuid', website: 'autoparkzuid.nl' },
  { name: 'Het Autohuis', website: 'hetautohuis.nl' },
  { name: 'Car Company Utrecht', website: 'carcompanyutrecht.nl' },
]

/**
 * Build a believable benchmark: ~12–14 comparable listings plus our car,
 * sorted by buy-priority (ETR desc → APR desc → price asc). Fully deterministic
 * — seeded from the subject's plate so re-opening shows identical data.
 */
export function benchmarkFor(
  subject: BenchmarkSubject,
): { listings: BenchmarkListing[]; ourRank: number; total: number } {
  const seed0 = hashStr(subject.plate || `${subject.make} ${subject.model}`)
  const rand = seeded(seed0)
  const count = 11 + Math.floor(rand() * 4) // 11–14 comparables

  // Score a listing into an ETR 1–5: cheaper + better-specced + lower mileage
  // relative to our car reads as hotter in the market.
  const etrFor = (price: number, mileage: number, optCount: number): 1 | 2 | 3 | 4 | 5 => {
    const priceScore = (subject.price - price) / Math.max(1, subject.price) // cheaper → +
    const mileScore = (subject.mileage - mileage) / Math.max(1, subject.mileage) // fewer km → +
    const optScore = (optCount - subject.options.length) / 6
    const raw = 3 + priceScore * 4 + mileScore * 2 + optScore
    return Math.max(1, Math.min(5, Math.round(raw))) as 1 | 2 | 3 | 4 | 5
  }

  const comparables: BenchmarkListing[] = Array.from({ length: count }, (_, i) => {
    const r = seeded(seed0 ^ Math.imul(i + 1, 0x9e3779b1))
    const priceFactor = 0.82 + r() * 0.36 // 0.82 … 1.18
    const price = Math.max(1000, round50(subject.price * priceFactor))
    const gross = round50(price * (0.8 + r() * 0.08)) // 0.80 … 0.88
    const mileage = Math.max(1000, round50(subject.mileage * (0.7 + r() * 0.8)))
    const year = subject.year + (Math.floor(r() * 5) - 2) // ±2

    // Start from our options, then deterministically drop/add a few so each row
    // produces a real diff against our spec.
    const opts = new Set(subject.options)
    const churn = Math.floor(r() * 4) // 0–3 changes
    for (let k = 0; k < churn; k++) {
      const pick = options[Math.floor(r() * options.length)]
      if (opts.has(pick.id)) opts.delete(pick.id)
      else opts.add(pick.id)
    }
    const optionIds = options.map((o) => o.id).filter((id) => opts.has(id))

    const etr = etrFor(price, mileage, optionIds.length)
    const apr = 60 + Math.floor(r() * 37) // 60–96
    const trend: BenchmarkListing['trend'] = r() < 0.34 ? 'down' : r() < 0.67 ? 'flat' : 'up'

    return {
      id: `b${i}`,
      make: subject.make,
      model: subject.model,
      variant: `${subject.variant.split(' ').slice(0, 2).join(' ')} ${
        VARIANT_SUFFIX[Math.floor(r() * VARIANT_SUFFIX.length)]
      }`,
      year,
      mileage,
      options: optionIds,
      price,
      gross,
      etr,
      apr,
      trend,
      daysListed: 3 + Math.floor(r() * 68),
      dealer: DEALERS[Math.floor(r() * DEALERS.length)],
      isOurs: false,
    }
  })

  const ours: BenchmarkListing = {
    id: 'ours',
    make: subject.make,
    model: subject.model,
    variant: subject.variant,
    year: subject.year,
    mileage: subject.mileage,
    options: subject.options,
    price: subject.price,
    gross: subject.gross,
    // Our own valuation: mid-pack marketability, high confidence.
    etr: etrFor(subject.price, subject.mileage, subject.options.length),
    apr: 90,
    trend: 'flat',
    daysListed: 0,
    dealer: null,
    isOurs: true,
  }

  const listings = [...comparables, ours].sort(
    (a, b) => b.etr - a.etr || b.apr - a.apr || a.price - b.price,
  )
  const ourRank = listings.findIndex((l) => l.isOurs) + 1
  return { listings, ourRank, total: listings.length }
}

export const initialSaved: SavedValuation[] = [
  {
    id: 's1',
    make: 'MAZDA',
    model: '3',
    variant: '2.0 SkyActiv-G Comfort',
    year: 2021,
    fuel: 'Petrol',
    plate: '35-SLJ-7',
    mileage: 48200,
    price: 18073,
    gross: 15073,
    date: '8 Jan 2026',
    options: ['aircon', 'alloy', 'climate', 'heated', 'nav', 'pdc'],
    note: 'Contains a bit of rear damage, which reduces value. Otherwise in great shape — owner is open to € 14.800.',
  },
  {
    id: 's2',
    make: 'BMW',
    model: '3 Series',
    variant: '320d Executive',
    year: 2019,
    fuel: 'Diesel',
    plate: '50-TDK-3',
    mileage: 91400,
    price: 7583,
    gross: 5333,
    date: '6 Jan 2026',
    options: ['aircon', 'alloy', 'climate', 'nav'],
    note: 'High mileage for the year and a worn clutch — priced conservatively. Full dealer service history.',
  },
  {
    id: 's3',
    make: 'TOYOTA',
    model: 'Aygo',
    variant: '1.0 VVT-i x-play',
    year: 2022,
    fuel: 'Petrol',
    plate: 'Z-445-BN',
    mileage: 24800,
    price: 15398,
    gross: 12398,
    date: '6 Jan 2026',
    options: ['aircon', 'carplay', 'camera'],
    note: 'Clean first-owner car, non-smoker. Set of winter tyres included in the deal.',
  },
  {
    id: 's4',
    make: 'NISSAN',
    model: 'Micra',
    variant: 'IG-T 100 N-Connecta',
    year: 2020,
    fuel: 'Petrol',
    plate: 'XL-590-P',
    mileage: 61000,
    price: 9766,
    gross: 7516,
    date: '6 Jan 2026',
    options: ['aircon', 'alloy', 'nav', 'carplay'],
  },
]
