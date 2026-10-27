# Injected: digital-product-autopilot

Injected on 2026-10-27 from the GitHub repo `longsholdingsllc/digital-product-autopilot`
(source head at time of reading: `1b688cb8c90d36192cf5f2579731ce6ac6bb670d`)
into `automations/digital-product-autopilot/` in this host repo.

This folder is deliberately placed under `automations/` — outside this host's
build path — so it cannot break the host's build.

## What was actually in the source repo

Verified by reading the full source repo on 2026-10-27. It contains only
two files, nothing else:

- `README.md` — empty, 0 bytes (not copied here; there was nothing to copy)
- `lead-qualifier.js` — 1,103 bytes, copied verbatim as
  `lead-qualifier.js` in this folder

Despite the repo name `digital-product-autopilot`, there is no digital-product
automation code in the source repo — no product creation, listing, pricing,
or fulfilment logic. The only code is the lead-qualifier client below.

## What the script actually does

`lead-qualifier.js` is an ESM (ECMAScript module) client for a remote
"Live Lead Qualification Agent":

- Exports: `export async function qualifyLead(lead = {})` and a default
  export of the same function.
- Input: a single `lead` object (any JSON-serialisable object, defaults
  to `{}`). No schema is defined in the script.
- API call: `POST https://live-lead-qualifier-agent.vercel.app/api/qualify`
  with header `Content-Type: application/json` and the lead object as the
  JSON body, using the global `fetch`.
- Output on success: returns the parsed JSON response from that API
  (`await response.json()`).
- Output on failure: if the response is not OK it throws internally with
  the status and response text; all errors are caught, logged with
  `console.error('[LeadQualifier] Failed to qualify lead:', err)`, and a
  fallback object is returned instead:
  `{ success: false, score: 0, recommended_action: 'nurture',
  reason: 'API unavailable – defaulting to nurture',
  summary: 'Lead scoring service temporarily unavailable',
  error: <error message>, timestamp: <ISO timestamp>,
  agent: 'Live Lead Qualification Agent v1.0 (fallback)' }`
- No API key, auth, dependencies, file I/O, or other endpoints are used.

## How to run it

It is a library module, not a standalone script — importing it does not
run anything on its own.

Requirements: a runtime with global `fetch` and ESM support
(e.g. Node.js 18+, with `"type": "module"` in package.json or the file
renamed to `.mjs`). No packages to install.

```js
import { qualifyLead } from './automations/digital-product-autopilot/lead-qualifier.js';

const result = await qualifyLead({
  name: 'Example Lead',
  email: 'lead@example.com',
  // any other lead fields you want scored
});

console.log(result);
```

That call sends the lead object to the endpoint above and resolves with
either the API's qualification result or the fallback object described
above if the API is unavailable.
