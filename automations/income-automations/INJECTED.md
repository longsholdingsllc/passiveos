# Injected: income-automations

Injected from the `income-automations` repo (owner: `longsholdingsllc`, repo: `income-automations`) on 2026-10-27.

Copied verbatim into this host repo under `automations/income-automations/`:

- `README.md` — the source repo's readme
- `domain-scanner.js` — the source repo's only script

The `automations/` top-level folder is deliberately outside the host build path, so these files cannot break the host's build. Nothing in the host app imports or runs them automatically.

## What each file is

### `README.md`
The source repo's own documentation. It describes the Daily Domain Scanner (below), gives its run command and a daily 9 AM cron example, and lists a roadmap of other income sources to automate next — surplus-fund leads (noted as already live in surplus-funds-recovery-os), expired / dropping domains, local lead gen (roofing, legal, medical), content + affiliate, micro-SaaS waitlists, and unused SaaS credits / tools resale — plus planned "next code drops" (drop-catch feed parser, lead-gen scraper for public permits, email digest of top daily finds). Those roadmap items are prose only; there is no code for them in the source repo.

### `domain-scanner.js` — Daily Domain Scanner
A standalone Node.js script (shebang `#!/usr/bin/env node`, built-in modules only: `dns.promises`, `fs`, `path` — no npm dependencies, no API keys, no environment variables, no command-line arguments).

What it does:
1. Generates candidate domain names from hardcoded word lists:
   - Roots (22 niche keywords): `surplus`, `claim`, `fund`, `recover`, `ledger`, `vault`, `estate`, `passive`, `yield`, `rent`, `lease`, `tax`, `title`, `deed`, `parcel`, `lead`, `pipeline`, `inbox`, `reach`, `close`, `deal`, `cash`
   - TLDs: `.com`, `.net`, `.io`, `.co`, `.app` (bare `root + tld` for each root)
   - Prefixes: `get`, `try`, `my`, `go`, `use`, `the`, `pro`, `smart`, `auto`, `quick` (as `prefix + root + .com`)
   - Suffixes: `ly`, `ify`, `hq`, `lab`, `hub`, `base`, `os`, `ai`, `now`, `up` (as `root + suffix + .com`)
   - Plus 20 random 3-letter `.com` names
   - Candidates are de-duplicated (a `Set`) and capped at `MAX_CANDIDATES = 80`.
2. Checks availability via DNS: `dns.resolve4(domain)` — if an A record resolves, the domain is treated as taken; if DNS returns `ENOTFOUND` or `ENODATA`, it is treated as available; any other error is treated as taken/unknown. Note: despite the file header mentioning RDAP, the code performs only this DNS A-record check and makes no RDAP/registrar call, so "available" means "no A record found", not a confirmed registrar availability check.
3. Scores each available domain for brandability (`scoreDomain`, 0–100, clamped): base 50; +20 if the name is ≤6 chars ("short") / +10 if ≤10 ("medium length") / −10 if longer ("long"); +15 if letters-only ("alpha only"); +15 if it ends in `.com`; +10 if it contains one of the niche root keywords ("niche keyword"). Each result carries its `reasons` list.

Inputs: none external — all configuration (TLDs, prefixes, roots, suffixes, cap of 80) is hardcoded at the top of the file; edit the file to change it.

Outputs:
- Stdout log lines (timestamped start, one `AVAILABLE <domain> score=<n>` line per find, and a final count).
- `available-domains.json` written next to the script (`path.join(__dirname, "available-domains.json")`), containing `{ "scannedAt": "<ISO timestamp>", "results": [ { "domain", "score", "reasons" }, ... ] }`, sorted by score descending.
- Exit code 1 on an unhandled error (logged to stderr).

## How to run it

```bash
cd automations/income-automations
node domain-scanner.js
# Results -> available-domains.json in the same folder
```

Requires Node.js (any version with `dns.promises`) and network/DNS access. No `npm install`, environment variables, or credentials are needed.

Daily cron example (from the source README, daily 9 AM):

```
0 9 * * * cd /path/to/income-automations && node domain-scanner.js >> scan.log 2>&1
```
