#!/usr/bin/env node
/**
 * Daily Domain Scanner
 * Generates candidate names, checks availability via DNS/RDAP, scores brandability.
 * Output: ranked list of available domains worth registering or flipping.
 *
 * Run: node domain-scanner.js
 * Cron example: 0 9 * * * node /path/to/domain-scanner.js >> scan.log 2>&1
 */

const dns = require("dns").promises;
const fs = require("fs");
const path = require("path");

// --- Config ---
const TLDS = [".com", ".net", ".io", ".co", ".app"];
const PREFIXES = ["get", "try", "my", "go", "use", "the", "pro", "smart", "auto", "quick"];
const ROOTS = [
  "surplus", "claim", "fund", "recover", "ledger", "vault", "estate",
  "passive", "yield", "rent", "lease", "tax", "title", "deed", "parcel",
  "lead", "pipeline", "inbox", "reach", "close", "deal", "cash",
];
const SUFFIXES = ["ly", "ify", "hq", "lab", "hub", "base", "os", "ai", "now", "up"];
const MAX_CANDIDATES = 80;
const OUTPUT_FILE = path.join(__dirname, "available-domains.json");

// --- Helpers ---
function generateCandidates() {
  const set = new Set();
  for (const root of ROOTS) {
    for (const tld of TLDS) set.add(root + tld);
    for (const p of PREFIXES) set.add(p + root + ".com");
    for (const s of SUFFIXES) set.add(root + s + ".com");
  }
  // short brandables
  const letters = "abcdefghijklmnopqrstuvwxyz";
  for (let i = 0; i < 20; i++) {
    const a = letters[Math.floor(Math.random() * 26)];
    const b = letters[Math.floor(Math.random() * 26)];
    const c = letters[Math.floor(Math.random() * 26)];
    set.add(a + b + c + ".com");
  }
  return Array.from(set).slice(0, MAX_CANDIDATES);
}

async function isAvailable(domain) {
  try {
    await dns.resolve4(domain);
    return false; // has A record → taken
  } catch (e) {
    if (e.code === "ENOTFOUND" || e.code === "ENODATA") return true;
    return false; // other errors treat as taken/unknown
  }
}

function scoreDomain(domain) {
  const name = domain.split(".")[0];
  let score = 50;
  const reasons = [];

  if (name.length <= 6) {
    score += 20;
    reasons.push("short");
  } else if (name.length <= 10) {
    score += 10;
    reasons.push("medium length");
  } else {
    score -= 10;
    reasons.push("long");
  }

  if (/^[a-z]+$/.test(name)) {
    score += 15;
    reasons.push("alpha only");
  }
  if (domain.endsWith(".com")) {
    score += 15;
    reasons.push(".com");
  }
  if (ROOTS.some((r) => name.includes(r))) {
    score += 10;
    reasons.push("niche keyword");
  }

  return { domain, score: Math.max(0, Math.min(100, score)), reasons };
}

async function main() {
  console.log(`[${new Date().toISOString()}] Starting domain scan…`);
  const candidates = generateCandidates();
  const available = [];

  for (const domain of candidates) {
    const free = await isAvailable(domain);
    if (free) {
      const scored = scoreDomain(domain);
      available.push(scored);
      console.log(`  AVAILABLE  ${domain}  score=${scored.score}`);
    }
  }

  available.sort((a, b) => b.score - a.score);
  fs.writeFileSync(OUTPUT_FILE, JSON.stringify({ scannedAt: new Date().toISOString(), results: available }, null, 2));
  console.log(`Done. ${available.length} available written to ${OUTPUT_FILE}`);
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
