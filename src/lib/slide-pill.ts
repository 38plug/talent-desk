import gsap from 'gsap'

type Edges = { l: number; r: number; t: number; b: number }

type PillEl = HTMLElement & {
  __pillEdges?: Edges
  __pillAnim?: Edges
}

function clip(st: Edges) {
  return `inset(${st.t}px ${st.r}px ${st.b}px ${st.l}px round 14px)`
}

function measure(el: HTMLElement, box: HTMLElement): Edges {
  const boxRect = box.getBoundingClientRect()
  const elRect = el.getBoundingClientRect()
  return {
    l: elRect.left - boxRect.left,
    t: elRect.top - boxRect.top,
    r: boxRect.right - elRect.right,
    b: boxRect.bottom - elRect.bottom,
  }
}

/**
 * Stretchy sliding pill — lead edge snaps ahead, trail catches up
 * (reel-matched lime indicator). Kills in-flight tweens so rapid hover
 * never snaps or stacks.
 */
export function slidePill(
  pill: HTMLElement,
  el: HTMLElement,
  box: HTMLElement,
  opts?: { reduced?: boolean },
) {
  const node = pill as PillEl
  const to = measure(el, box)

  if (opts?.reduced) {
    if (node.__pillAnim) gsap.killTweensOf(node.__pillAnim)
    gsap.killTweensOf(pill)
    node.__pillEdges = to
    gsap.set(pill, {
      width: '100%',
      height: '100%',
      left: 0,
      top: 0,
      clipPath: clip(to),
    })
    return
  }

  if (node.__pillAnim) gsap.killTweensOf(node.__pillAnim)
  gsap.killTweensOf(pill)

  const from: Edges = node.__pillEdges ?? { ...to }
  const st: Edges = { ...from }
  node.__pillEdges = to
  node.__pillAnim = st

  const dy = Math.abs(to.t - from.t)
  const dx = Math.abs(to.l - from.l)
  let leadKey: keyof Edges
  let trailKey: keyof Edges
  if (dx > dy) {
    const hFwd = to.l >= from.l
    leadKey = hFwd ? 'r' : 'l'
    trailKey = hFwd ? 'l' : 'r'
  } else {
    const fwd = to.t >= from.t
    leadKey = fwd ? 'b' : 't'
    trailKey = fwd ? 't' : 'b'
  }

  const paint = () => {
    gsap.set(pill, { clipPath: clip(st) })
  }

  gsap.set(pill, {
    width: '100%',
    height: '100%',
    left: 0,
    top: 0,
  })

  paint()

  // Lead edge races ahead; trail follows with a softer catch-up (stretch).
  gsap.to(st, {
    [leadKey]: to[leadKey],
    duration: 0.32,
    ease: 'power3.out',
    onUpdate: paint,
  })
  gsap.to(st, {
    [trailKey]: to[trailKey],
    duration: 0.52,
    ease: 'power3.inOut',
    onUpdate: paint,
  })

  const others = (['l', 'r', 't', 'b'] as const).filter((k) => k !== leadKey && k !== trailKey)
  for (const k of others) {
    gsap.to(st, {
      [k]: to[k],
      duration: 0.38,
      ease: 'power3.out',
      onUpdate: paint,
    })
  }
}

export function setPillImmediate(pill: HTMLElement, el: HTMLElement, box: HTMLElement) {
  const node = pill as PillEl
  if (node.__pillAnim) gsap.killTweensOf(node.__pillAnim)
  gsap.killTweensOf(pill)
  const to = measure(el, box)
  node.__pillEdges = to
  gsap.set(pill, {
    width: '100%',
    height: '100%',
    left: 0,
    top: 0,
    clipPath: clip(to),
  })
}
