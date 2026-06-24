/**
 * Design annotations for the JP.cars prototype.
 *
 * Each note is anchored to an element that already exists in a screen via its
 * CSS class — the AnnotationLayer queries for it, measures it live, and draws a
 * connector to a numbered card. Nothing here changes screen logic; if the
 * target element isn't on screen (wrong tab, wrong flow step, covered by an
 * overlay) its note simply isn't shown.
 *
 * `selector` is queried inside the proposal app (#device-app). `global: true`
 * means the note always applies (general visual style) and is anchored near the
 * top of the frame instead of to one element.
 */
export interface AnnotationDef {
  n: number
  /** CSS selector queried within #device-app. */
  selector: string
  /** Where on the element to anchor the marker. Defaults to 'center'. */
  at?: 'top' | 'center'
  title: string
  body: string
}

export const ANNOTATIONS: AnnotationDef[] = [
  {
    n: 1,
    selector: '.bench-row:not(.is-ours)',
    title: 'Benchmark-rij',
    body:
      'Alleen beslis-informatie per rij. Detail verhuist naar een bottom sheet. Lager signal-to-noise dan het origineel, sneller te scannen.',
  },
  {
    n: 2,
    selector: '.bench-row.is-ours',
    at: 'top',
    title: 'Reference car',
    body:
      'Dit is de auto die je taxeert. De hele lijst is vergeleken vanuit deze auto, niet een platte lijst zonder anker.',
  },
  {
    n: 3,
    selector: '.bench-row.is-ours .margin',
    title: 'Koopbeslissing in één oogopslag',
    body:
      'ETR en APR wegen zwaar mee. De rij is zo opgebouwd dat de koopbeslissing meteen leesbaar is, met purchase price en marge er direct naast.',
  },
  {
    n: 4,
    selector: '.mstats',
    title: 'Context bij ETR en APR',
    body:
      'Naast het cijfer staan label en duiding, zodat je ETR en APR sneller kunt plaatsen zonder de afkortingen te kennen.',
  },
  {
    n: 5,
    selector: '.vcard-photo',
    title: 'Welke auto',
    body:
      'Visuele bevestiging van welke auto je waardeert. Voorkomt dat je de verkeerde auto taxeert.',
  },
  {
    n: 6,
    selector: '.reveal',
    title: 'Uitkomst eerst',
    body:
      'Rustige samenvatting eerst. Basisinformatie zonder ruis, benchmark pas als opt-in laag.',
  },
  {
    n: 7,
    selector: '.bench-cta',
    title: 'Open benchmark',
    body:
      'Marktcontext zit in de flow maar blokkeert hem niet. Je haalt het erbij wanneer je het nodig hebt.',
  },
  {
    n: 8,
    selector: '.svcard',
    title: 'Opgeslagen valuations',
    body:
      'Doorzoekbaar en scanbaar, met benchmark en ETR data. Bruikbaar na het moment zelf, ondersteunt voorraadbeheer.',
  },
  {
    // Only on the valuation overview (home) — one note about the overall look,
    // not a marker that follows you through every screen.
    n: 9,
    selector: '.vhome',
    at: 'top',
    title: 'Visuele stijl',
    body:
      'Sluit aan op de branding van de marketing site. Een consistente uitstraling van site naar product, herkenbaar en betrouwbaar.',
  },
]
