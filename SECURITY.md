# Security

- Anonymous auth only; partner features are limited to linked pair doc IDs.
- Firestore rules restrict reads/writes to the two UIDs in `links/{pairId}`.
- Per-user lists stored under `lists/{uid}/items/*` and writable only by owner.
- All writes include `schemaVersion` for forward migrations.
- No secrets are committed. Use `.env` for Firebase config.
