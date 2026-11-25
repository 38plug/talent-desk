import type { OfferCategory } from './constants'
import { parseNumericInput } from './utils'

export type ParsedOfferPreview = {
  category: OfferCategory
  title: string
  company: string
  salaryMin: string
  salaryMax: string
  salary: string
  commissionValue: string
  commission: string
  commissionType: 'fixed' | 'percent'
  location: string
  roleType: string
  accommodation: boolean
  visa: boolean
  flight: boolean
  videoCall: boolean
  description: string
}

const CHINESE_HINTS =
  /acomoda|accommodat|visto|visa|passagem|flight|a[eé]rea|video\s*chamad|video\s*call|videochamad|operador|caller/i

function pick(re: RegExp, text: string): string {
  const m = text.match(re)
  return m?.[1]?.trim() ?? ''
}

function money(re: RegExp, text: string): string {
  const raw = pick(re, text)
  const n = parseNumericInput(raw)
  return n === null ? '' : String(n)
}

export function parseOfferText(text: string): ParsedOfferPreview {
  const category: OfferCategory = CHINESE_HINTS.test(text) ? 'chinese' : 'forex'

  const title =
    pick(/(?:vaga|title|cargo|posição|position)\s*[:：]\s*(.+)/i, text) ||
    pick(/^(.{8,80})$/m, text) ||
    'Untitled offer'

  const company = pick(/(?:empresa|company|broker)\s*[:：]\s*(.+)/i, text)
  const location = pick(/(?:local|location|cidade|city)\s*[:：]\s*(.+)/i, text)

  const salary =
    money(/(?:sal[aá]rio|salary|remunera)\s*(?:mensal)?\s*[:：]?\s*\$?\s*([\d.,]+)/i, text) ||
    money(/\$\s*([\d.,]+)/, text)

  const provision =
    money(/(?:comiss[aã]o|commission|provision|prov)\s*[:：]?\s*\$?\s*([\d.,]+)\s*%?/i, text) ||
    money(/(?:comiss[aã]o|commission|provision)\s*[:：]?\s*([\d.,]+)\s*%/i, text)

  const isPercent = /%/.test(
    pick(/(?:comiss[aã]o|commission|provision)[^\n]{0,40}/i, text) || '',
  )

  const roleType = /video|caller|opera/i.test(text)
    ? 'Video caller'
    : /sales|vendas/i.test(text)
      ? 'Sales'
      : ''

  return {
    category,
    title: title.slice(0, 120),
    company,
    salaryMin: category === 'forex' ? salary : '',
    salaryMax: '',
    salary: category === 'chinese' ? salary : '',
    commissionValue: category === 'forex' ? provision : '',
    commission: category === 'chinese' ? provision : '',
    commissionType: isPercent ? 'percent' : 'fixed',
    location,
    roleType,
    accommodation: /acomoda|accommodat/i.test(text),
    visa: /visto|visa/i.test(text),
    flight: /passagem|flight|a[eé]rea/i.test(text),
    videoCall: /video\s*chamad|video\s*call|videochamad/i.test(text),
    description: text.slice(0, 2000),
  }
}

/** Language gate: EN/PT stay as-is; others translate to PT via MyMemory. */
export async function translateOfferText(text: string): Promise<{
  text: string
  translated: boolean
}> {
  const sample = text.slice(0, 400)
  if (/[а-яА-ЯЁё]/.test(sample) || /[\u4e00-\u9fff]/.test(sample) || /[ぁ-んァ-ン]/.test(sample) || /[가-힣]/.test(sample)) {
    // likely non EN/PT → translate
  } else if (
    /\b(the|and|with|for|salary|commission|offer|position)\b/i.test(sample) ||
    /\b(o|a|de|da|do|para|salário|comissão|vaga|empresa)\b/i.test(sample)
  ) {
    return { text, translated: false }
  }

  try {
    const chunks: string[] = []
    let buf = ''
    for (const line of text.split('\n')) {
      if ((buf + '\n' + line).length > 450) {
        if (buf) chunks.push(buf)
        buf = line
      } else {
        buf = buf ? `${buf}\n${line}` : line
      }
    }
    if (buf) chunks.push(buf)

    const out: string[] = []
    for (const chunk of chunks) {
      const url = `https://api.mymemory.translated.net/get?q=${encodeURIComponent(chunk)}&langpair=autodetect|pt`
      const res = await fetch(url)
      if (!res.ok) throw new Error(`translate ${res.status}`)
      const json = (await res.json()) as {
        responseData?: { translatedText?: string }
        quotaFinished?: boolean
      }
      if (json.quotaFinished) throw new Error('quota')
      out.push(json.responseData?.translatedText ?? chunk)
    }
    return { text: out.join('\n'), translated: true }
  } catch {
    return { text, translated: false }
  }
}
