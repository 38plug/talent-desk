# Talent Desk — local data (localStorage)

Auth and pipeline data live in the browser. Nothing is seeded.

## Keys

| Key | Contents |
|-----|----------|
| `talent-desk.accounts.v1` | Accounts (email, role, PBKDF2 hash + salt) |
| `talent-desk.data.v1` | Candidates, offers, interviews, earnings, activities |
| `talent-desk.session.v1` | Current `{ userId, email }` |

## Export format

```json
{
  "format": "talent-desk-export",
  "version": 1,
  "exportedAt": "2026-11-25T00:00:00.000Z",
  "accounts": [
    {
      "id": "…",
      "email": "you@example.com",
      "fullName": "Name",
      "role": "owner",
      "createdAt": "…",
      "passwordHash": "…",
      "salt": "…"
    }
  ],
  "data": {
    "candidates": [],
    "offers": [],
    "interviews": [],
    "earnings": [],
    "activities": []
  }
}
```

Candidate rows may include `country`, `age`, `languages`, and `currentLocation` (null/empty when unset). Older exports missing those keys are migrated to empty on load/import — existing data is not wiped.

Deleting a candidate removes that row and cascades interviews and earnings that reference the candidate id. Linked offers are not deleted.

Settings → Download JSON export / Upload / paste. Import **replaces** accounts + data on that device.

Accounts may include a plaintext `"password"` instead of hash/salt when preparing a one-time restore for another browser.
