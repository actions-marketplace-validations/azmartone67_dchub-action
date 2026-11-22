/**
 * DC Hub Data Center Power Index (DCPI) GitHub Action.
 *
 * Looks up a market verdict or a facility from the public DC Hub REST API
 * at https://dchub.cloud. Logs the verdict and evidence date only — never
 * the composite score.
 */
const fs = require('fs');

const UNPUBLISHED_ISOS = new Set(['ERCOT', 'MISO']);
const UNPUBLISHED_STATES = new Set(['AZ', 'ARIZONA']);
const UNPUBLISHED_SLUG_FRAGMENTS = [
  'phoenix',
  'tucson',
  '-az',
  'arizona',
  'ercot',
  'miso'
];

function writeOutput(name, value) {
  const out = process.env.GITHUB_OUTPUT;
  const line = `${name}=${value == null ? '' : String(value)}\n`;
  if (out) fs.appendFileSync(out, line);
}

function isUnpublished({ slug, iso, state, name }) {
  const isoU = String(iso || '').toUpperCase();
  if (UNPUBLISHED_ISOS.has(isoU)) return true;
  const stateU = String(state || '').toUpperCase();
  if (UNPUBLISHED_STATES.has(stateU)) return true;
  const blob = `${slug || ''} ${name || ''}`.toLowerCase();
  return UNPUBLISHED_SLUG_FRAGMENTS.some((f) => blob.includes(f));
}

function evidenceDate(data) {
  if (!data || typeof data !== 'object') return '';
  return (
    data.as_of ||
    data.asOf ||
    (data.dcpi_provenance && data.dcpi_provenance.as_of) ||
    (data.provenance && data.provenance.as_of) ||
    data.computed_at ||
    ''
  );
}

async function main() {
  const base = (process.env.INPUT_BASE_URL || 'https://dchub.cloud').replace(/\/$/, '');
  const market = (process.env.INPUT_MARKET || '').trim().toLowerCase();
  const facility = (process.env.INPUT_FACILITY || '').trim();

  if (!market && !facility) {
    throw new Error('Set input "market" or "facility".');
  }

  if (market && isUnpublished({ slug: market })) {
    writeOutput('unpublished_market', 'true');
    writeOutput('verdict', '');
    writeOutput('as_of', '');
    console.log('No published verdict for this market right now.');
    return;
  }

  if (market) {
    const url = `${base}/api/v1/dcpi/scores/${encodeURIComponent(market)}`;
    const res = await fetch(url, { headers: { 'User-Agent': 'dchub-action/1.0.0' } });
    if (!res.ok) throw new Error(`DCPI lookup failed (${res.status}).`);
    const data = await res.json();
    if (isUnpublished({
      slug: data.market_slug || data.slug || market,
      iso: data.iso || data.rto || data.grid,
      state: data.state || data.state_code,
      name: data.market_name || data.name
    })) {
      writeOutput('unpublished_market', 'true');
      writeOutput('verdict', '');
      writeOutput('as_of', '');
      console.log('No published verdict for this market right now.');
      return;
    }
    const asOf = evidenceDate(data);
    writeOutput('unpublished_market', 'false');
    writeOutput('verdict', data.verdict || '');
    writeOutput('as_of', asOf);
    console.log(`Data Center Power Index (DCPI) verdict for ${market}: ${data.verdict || 'n/a'} as of ${asOf || 'n/a'}`);
    return;
  }

  const url = `${base}/api/v1/facilities?q=${encodeURIComponent(facility)}`;
  const res = await fetch(url, { headers: { 'User-Agent': 'dchub-action/1.0.0' } });
  if (!res.ok) throw new Error(`Facility search failed (${res.status}).`);
  const data = await res.json();
  writeOutput('unpublished_market', 'false');
  writeOutput('verdict', '');
  writeOutput('as_of', evidenceDate(data));
  console.log(`Facility search completed (HTTP ${res.status}).`);
}

main().catch((err) => {
  console.error(err && err.message ? err.message : err);
  process.exit(1);
});
