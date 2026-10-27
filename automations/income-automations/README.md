# Income Automations

## 1. Daily Domain Scanner
`domain-scanner.js` — generates niche brandables, checks DNS availability, scores them.

```bash
node domain-scanner.js
```
Results → `available-domains.json`

Cron (daily 9 AM):
```
0 9 * * * cd /path/to/income-automations && node domain-scanner.js >> scan.log 2>&1
```

## Other income sources to automate next

| Source | How | Effort |
|--------|-----|--------|
| Surplus-fund leads | Already in surplus-funds-recovery-os | Live |
| Expired / dropping domains | Extend scanner with drop-catch lists | Medium |
| Local lead gen (roofing, legal, medical) | Scrape public permits + score + sell leads | Medium |
| Content + affiliate | Auto-generate SEO pages for high-CPC niches | Medium |
| Micro-SaaS waitlists | Spin simple landing pages, collect emails | Low |
| Unused SaaS credits / tools resale | Monitor deal sites, alert high-margin flips | Low |

## Next code drops
- Drop-catch feed parser
- Simple lead-gen scraper for public permits
- Email digest of top daily finds
