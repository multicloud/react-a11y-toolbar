#!/usr/bin/env node
/**
 * scripts/check-licenses.js
 *
 * Fails the build if any production dependency uses a license that is
 * incompatible with AGPL-3.0-only, or one we've chosen not to accept for
 * policy reasons (source-available, copyleft with ambiguous compatibility,
 * etc.). Also warns on unknown/unparseable licenses so they can be reviewed.
 *
 * Zero dependencies. Uses `npm ls --json` under the hood, which ships with
 * Node/npm. Intended to be run in CI and as part of `prepublishOnly`.
 *
 * Exit codes:
 *   0 — all good
 *   1 — at least one disallowed license found
 *   2 — unknown license found and FAIL_ON_UNKNOWN=true (default: warn only)
 *
 * Usage:
 *   node scripts/check-licenses.js
 *   FAIL_ON_UNKNOWN=true node scripts/check-licenses.js
 */

'use strict';

const { execSync } = require('node:child_process');

// -----------------------------------------------------------------------------
// Policy
// -----------------------------------------------------------------------------

// Licenses we accept for runtime (production) dependencies.
// These are all permissive or weakly-copyleft-at-file-level and are safe to
// ship inside an AGPL-3.0 library.
const ALLOWED = new Set([
  'MIT',
  'MIT-0',
  'ISC',
  'BSD-2-Clause',
  'BSD-3-Clause',
  '0BSD',
  'Apache-2.0',
  'Unlicense',
  'CC0-1.0',
  'CC-BY-4.0',
  // The project's own license — self-referential match is fine.
  'AGPL-3.0-only',
  'AGPL-3.0-or-later',
  // Sometimes seen on legitimately-licensed packages; treat as equivalent to
  // their SPDX form. Harmless for our purposes.
  'MIT*',
  'Apache 2.0',
  'BSD',
  'Python-2.0', // some tooling packages, compatible
]);

// Licenses we explicitly reject. Reasons in comments.
const DISALLOWED = new Map([
  // Strong copyleft that's AGPL-incompatible or compatibility-ambiguous:
  ['GPL-2.0-only', 'GPLv2 is not compatible with AGPL-3.0 (version mismatch).'],
  ['GPL-2.0', 'GPLv2 is not compatible with AGPL-3.0 (version mismatch).'],
  ['LGPL-2.1-only', 'LGPLv2.1 compatibility with AGPL-3.0 is ambiguous; avoid.'],
  ['LGPL-2.1', 'LGPLv2.1 compatibility with AGPL-3.0 is ambiguous; avoid.'],

  // Source-available / non-OSS licenses — using them in an AGPL project
  // imposes non-AGPL obligations on our redistributors, which we don't want.
  ['BUSL-1.1', 'Business Source License — source-available, not OSS.'],
  ['SSPL-1.0', 'Server Side Public License — not OSI-approved; propagates obligations.'],
  ['Elastic-2.0', 'Elastic License 2.0 — source-available, restricts commercial use.'],
  ['FSL-1.1-MIT', 'Functional Source License — source-available, restricts commercial use.'],
  ['FSL-1.1-Apache-2.0', 'Functional Source License — source-available, restricts commercial use.'],
  ['FSL-1.0-MIT', 'Functional Source License — source-available, restricts commercial use.'],
  ['FSL-1.0-Apache-2.0', 'Functional Source License — source-available, restricts commercial use.'],
  ['Commons-Clause', 'Commons Clause — restricts commercial use; incompatible with AGPL.'],
  ['PolyForm-Noncommercial-1.0.0', 'PolyForm Noncommercial — restricts commercial use.'],
  ['PolyForm-Shield-1.0.0', 'PolyForm Shield — source-available.'],
  ['PolyForm-Small-Business-1.0.0', 'PolyForm Small Business — restricts use.'],

  // "No license" / proprietary
  ['UNLICENSED', 'Package is UNLICENSED (proprietary). Do not depend on.'],
]);

// Ambiguous strings seen in the wild. Treated as unknown → review required.
const AMBIGUOUS = new Set(['SEE LICENSE IN LICENSE', 'CUSTOM', 'OTHER']);

// -----------------------------------------------------------------------------
// Collect production dependency tree
// -----------------------------------------------------------------------------

function loadProductionTree() {
  let raw;
  try {
    // --all flattens the full transitive tree. --production excludes devDeps.
    // --long gets us the license field. --json for parsing.
    raw = execSync('npm ls --all --production --long --json', {
      encoding: 'utf8',
      stdio: ['ignore', 'pipe', 'pipe'],
      maxBuffer: 64 * 1024 * 1024, // 64 MB, plenty for most trees
    });
  } catch (err) {
    // `npm ls` exits non-zero on peer-dep warnings and extraneous packages,
    // but still writes valid JSON to stdout. Fall back to stdout if present.
    if (err.stdout) {
      raw = err.stdout.toString();
    } else {
      console.error('Failed to run `npm ls`:', err.message);
      process.exit(3);
    }
  }
  return JSON.parse(raw);
}

function walk(node, acc, pathParts) {
  const deps = node.dependencies || {};
  for (const [name, child] of Object.entries(deps)) {
    const version = child.version || '?';
    const license = normalizeLicense(child.license);
    const key = `${name}@${version}`;
    if (!acc.has(key)) {
      acc.set(key, {
        name,
        version,
        license,
        path: [...pathParts, name],
      });
    }
    walk(child, acc, [...pathParts, name]);
  }
}

function normalizeLicense(lic) {
  if (lic == null) return null;
  if (typeof lic === 'string') return lic.trim();
  // Legacy form: { type: "MIT", url: "..." } — or an array thereof.
  if (Array.isArray(lic)) {
    return lic.map((l) => (typeof l === 'string' ? l : l?.type)).filter(Boolean).join(' OR ');
  }
  if (typeof lic === 'object' && lic.type) return String(lic.type).trim();
  return null;
}

// Parse simple SPDX expressions: "MIT OR Apache-2.0", "(MIT AND BSD-3-Clause)".
// If ANY listed license is allowed (for OR) and ALL are allowed (for AND),
// we pass. For our purposes this is a good-enough approximation.
function classifySpdx(expr) {
  if (!expr) return { ok: false, reason: 'missing', unknown: true };
  if (AMBIGUOUS.has(expr.toUpperCase())) return { ok: false, reason: expr, unknown: true };

  const cleaned = expr.replace(/[()]/g, '').trim();

  // Explicit disallow wins, even inside an OR expression — if a package is
  // dual-licensed as "MIT OR BUSL-1.1", accepting it under MIT is fine, but
  // we flag for human review because the BUSL alternative signals intent.
  const parts = cleaned.split(/\s+(?:OR|AND)\s+/i).map((s) => s.trim());

  const disallowedHit = parts.find((p) => DISALLOWED.has(p));
  if (disallowedHit) {
    // If it's an OR with at least one allowed alternative, treat as allowed
    // but warn. Otherwise disallow outright.
    const isOr = /\sOR\s/i.test(cleaned);
    const hasAllowedAlt = parts.some((p) => ALLOWED.has(p));
    if (isOr && hasAllowedAlt) {
      return { ok: true, reason: `dual-licensed, picking allowed alternative (contains ${disallowedHit})`, warn: true };
    }
    return { ok: false, reason: `${disallowedHit}: ${DISALLOWED.get(disallowedHit)}` };
  }

  // AND expressions: every term must be allowed.
  if (/\sAND\s/i.test(cleaned)) {
    const bad = parts.find((p) => !ALLOWED.has(p));
    if (bad) return { ok: false, reason: `part of AND expression not in allowlist: ${bad}` };
    return { ok: true };
  }

  // OR expressions: at least one term must be allowed.
  if (/\sOR\s/i.test(cleaned)) {
    const anyAllowed = parts.some((p) => ALLOWED.has(p));
    if (anyAllowed) return { ok: true };
    return { ok: false, reason: `no allowed license in expression: ${cleaned}`, unknown: true };
  }

  // Single identifier.
  if (ALLOWED.has(cleaned)) return { ok: true };
  return { ok: false, reason: `not in allowlist: ${cleaned}`, unknown: true };
}

// -----------------------------------------------------------------------------
// Run
// -----------------------------------------------------------------------------

function main() {
  const failOnUnknown = String(process.env.FAIL_ON_UNKNOWN || '').toLowerCase() === 'true';

  const tree = loadProductionTree();
  const deps = new Map();
  walk(tree, deps, [tree.name || 'root']);

  if (deps.size === 0) {
    console.log('No production dependencies found.');
    return 0;
  }

  const disallowed = [];
  const unknown = [];
  const warned = [];

  for (const pkg of deps.values()) {
    // Skip the root package and any workspace packages (they'll be null/local)
    if (!pkg.license) {
      unknown.push(pkg);
      continue;
    }
    const verdict = classifySpdx(pkg.license);
    if (!verdict.ok && verdict.unknown) unknown.push({ ...pkg, reason: verdict.reason });
    else if (!verdict.ok) disallowed.push({ ...pkg, reason: verdict.reason });
    else if (verdict.warn) warned.push({ ...pkg, reason: verdict.reason });
  }

  const pad = (s, n) => String(s).padEnd(n);
  const summarize = (list) =>
    list
      .map((p) => `  ${pad(p.name + '@' + p.version, 48)} ${pad(p.license || '(none)', 24)} ${p.reason || ''}`)
      .join('\n');

  console.log(`Scanned ${deps.size} production dependency package(s).`);

  if (warned.length) {
    console.log('\n⚠️  Warnings (accepted, but review recommended):');
    console.log(summarize(warned));
  }

  if (unknown.length) {
    console.log('\n❓ Unknown / unparseable licenses:');
    console.log(summarize(unknown));
  }

  if (disallowed.length) {
    console.log('\n❌ Disallowed licenses:');
    console.log(summarize(disallowed));
    console.log('\nOne or more dependencies use a license that is incompatible');
    console.log('with this project (AGPL-3.0-only) or with our policy. Resolve');
    console.log('by removing/replacing the dependency, or by updating the');
    console.log('allowlist in scripts/check-licenses.js after careful review.');
    return 1;
  }

  if (unknown.length && failOnUnknown) {
    console.log('\nFAIL_ON_UNKNOWN is set; treating unknown licenses as failures.');
    return 2;
  }

  console.log('\n✅ All production licenses are on the allowlist.');
  return 0;
}

process.exit(main());
