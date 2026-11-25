export const DEMO_UI_KEY = 'talent-desk-demo-ui'

export function isDemoUi(): boolean {
  try {
    return localStorage.getItem(DEMO_UI_KEY) === '1'
  } catch {
    return false
  }
}

export function enableDemoUi() {
  localStorage.setItem(DEMO_UI_KEY, '1')
}

export function clearDemoUi() {
  try {
    localStorage.removeItem(DEMO_UI_KEY)
  } catch {
    /* ignore */
  }
}
