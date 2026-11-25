/**
 * Smoke: owner creates candidate → other account lists it (no forUser scope).
 * Run: node --experimental-strip-types scripts/smoke-shared-desk.mjs
 *   or: npx --yes tsx scripts/smoke-shared-desk.mjs
 */
import { pathToFileURL } from 'node:url'
import { dirname, join } from 'node:path'
import { fileURLToPath } from 'node:url'

const store = new Map()
globalThis.localStorage = {
  getItem: (k) => (store.has(k) ? store.get(k) : null),
  setItem: (k, v) => {
    store.set(k, String(v))
  },
  removeItem: (k) => {
    store.delete(k)
  },
  clear: () => store.clear(),
}

const root = join(dirname(fileURLToPath(import.meta.url)), '..')
const dbUrl = pathToFileURL(join(root, 'src/lib/local-db.ts')).href

const db = await import(dbUrl)

const owner = await db.registerAccount('owner-smoke@example.com', 'password12', 'Owner')
db.upsertCandidateRow(owner.userId, { name: 'Shared Candidate Alpha', stage: 'Screening' })

db.signOut()
const other = await db.registerAccount('other-smoke@example.com', 'password12', 'Other')

const listed = db.listCandidates()
const hit = listed.find((c) => c.name === 'Shared Candidate Alpha')

if (!hit) {
  console.error('FAIL: other account did not see owner candidate')
  console.error(
    'candidates:',
    listed.map((c) => ({ name: c.name, userId: c.userId })),
  )
  process.exit(1)
}

if (hit.userId !== owner.userId) {
  console.error('FAIL: creator attribution rewritten', hit.userId, owner.userId)
  process.exit(1)
}

const earnings = db.listEarnings()
const offers = db.listOffers()
const interviews = db.listInterviews()
if (!Array.isArray(earnings) || !Array.isArray(offers) || !Array.isArray(interviews)) {
  console.error('FAIL: list* must return arrays without userId arg')
  process.exit(1)
}

// Deleting the other seat must keep the owner's candidate.
db.signOut()
await db.signIn('owner-smoke@example.com', 'password12')
db.adminDeleteAccountRow(other.userId)
const afterDelete = db.listCandidates()
if (!afterDelete.some((c) => c.name === 'Shared Candidate Alpha')) {
  console.error('FAIL: adminDeleteAccountRow wiped shared candidate')
  process.exit(1)
}

console.log('PASS: shared desk — other account lists owner candidate; seat delete keeps rows')
console.log(
  JSON.stringify(
    {
      ownerId: owner.userId,
      otherId: other.userId,
      candidateCreator: hit.userId,
      candidateCount: afterDelete.length,
    },
    null,
    2,
  ),
)
