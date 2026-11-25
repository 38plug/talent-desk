import gsap from 'gsap'

type Edges = { l: number; r: number; t: number; b: number }

function clip(st: Edges) {
  return `inset(${st.t}px ${st.r}px ${st.b}px ${st.l}px round 14px)`
}

/**
 * Stretchy sliding pill — lead edge 0.36s power3.out, trail 0.55s power3.inOut
 * (matches @_code_and_chill_ reel motion.ts).
 */
export function slidePill(
  pill: HTMLElement,
  el: HTMLElement,
  box: HTMLElement,
  opts?: { reduced?: boolean },
) {
  const boxRect = box.getBoundingClientRect()
  const elRect = el.getBoundingClientRect()
  const to: Edges = {
    l: elRect.left - boxRect.left,
    t: elRect.top - boxRect.top,
    r: boxRect.right - elRect.right,
    b: boxRect.bottom - elRect.bottom,
  }

  if (opts?.reduced) {
    gsap.set(pill, { clipPath: clip(to) })
    return
  }

  const prev = (pill as HTMLElement & { __pillEdges?: Edges }).__pillEdges
  const from: Edges = prev ?? { ...to }
  const st: Edges = { ...from }
  ;(pill as HTMLElement & { __pillEdges?: Edges }).__pillEdges = to

  const fwd = to.t >= from.t
  const lead = fwd ? 'b' : 't'
  const trail = fwd ? 't' : 'b'
  // horizontal-aware: if mostly horizontal move, use left/right
  const dy = Math.abs(to.t - from.t)
  const dx = Math.abs(to.l - from.l)
  let leadKey: keyof Edges = lead as keyof Edges
  let trailKey: keyof Edges = trail as keyof Edges
  if (dx > dy) {
    const hFwd = to.l >= from.l
    leadKey = hFwd ? 'r' : 'l'
    trailKey = hFwd ? 'l' : 'r'
  }

  const paint = () => {
    gsap.set(pill, { clipPath: clip(st) })
  }

  // Full-bleed pill over the nav box; clip reveals active item
  gsap.set(pill, {
    width: '100%',
    height: '100%',
    left: 0,
    top: 0,
  })

  paint()
  gsap.to(st, {
    [leadKey]: to[leadKey],
    duration: 0.36,
    ease: 'power3.out',
    onUpdate: paint,
  })
  gsap.to(st, {
    [trailKey]: to[trailKey],
    duration: 0.55,
    ease: 'power3.inOut',
    onUpdate: paint,
  })
  // Also sync the other axis edges quickly
  const others = (['l', 'r', 't', 'b'] as const).filter((k) => k !== leadKey && k !== trailKey)
  for (const k of others) {
    gsap.to(st, {
      [k]: to[k],
      duration: 0.4,
      ease: 'power3.out',
      onUpdate: paint,
    })
  }
}

export function setPillImmediate(pill: HTMLElement, el: HTMLElement, box: HTMLElement) {
  const boxRect = box.getBoundingClientRect()
  const elRect = el.getBoundingClientRect()
  const to: Edges = {
    l: elRect.left - boxRect.left,
    t: elRect.top - boxRect.top,
    r: boxRect.right - elRect.right,
    b: boxRect.bottom - elRect.bottom,
  }
  ;(pill as HTMLElement & { __pillEdges?: Edges }).__pillEdges = to
  gsap.set(pill, {
    width: '100%',
    height: '100%',
    left: 0,
    top: 0,
    clipPath: clip(to),
  })
}
