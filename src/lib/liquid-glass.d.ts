/** Types for the vendored liquidglass.dev engine (`liquid-glass.js`). */

export type GlassEngine = 'blink' | 'webkit' | 'gecko' | 'unknown'

export type GlassOptics = {
  x?: number
  y?: number
  width?: number
  height?: number
  radius?: number
  refraction?: number
  bezel?: number
  curvature?: number
  ior?: number
  invert?: boolean
  chroma?: number
  blur?: number
  specular?: number
  specularWidth?: number
  lightAngle?: number
  mapScale?: number
}

export type CreateGlassOptions = GlassOptics & {
  fit?: boolean
  clip?: boolean
  sync?: boolean
  hidden?: boolean
  /** Chromium: real backdrop refraction. Other engines: `fallback` frost. */
  mode?: 'content' | 'backdrop'
  fallback?: string
}

export type GlassController = {
  update: (next?: CreateGlassOptions & { hidden?: boolean }) => void
  flush: () => void
  readonly params: Required<GlassOptics>
  readonly filterId: string
  destroy: () => void
}

export type SpringController = {
  set: (target: number) => void
  readonly value: number
}

export declare const DEFAULTS: Readonly<Required<GlassOptics>>
export declare const engine: GlassEngine
export declare const reducedMotion: { matches: boolean }

export declare function createGlass(
  target: HTMLElement,
  options?: CreateGlassOptions,
): GlassController

export declare function createSpring(
  initial: number,
  onUpdate: (value: number, velocity: number) => void,
  options?: { stiffness?: number; damping?: number; mass?: number },
): SpringController

export declare function renderLensMap(
  options?: GlassOptics,
  scale?: number,
): HTMLCanvasElement
