import type { PSPProvider, NormalizedStatus, NormalizedComponent } from '../types';
import { buildFetchUrl } from '../utils/fetchUrl';

export async function fetchEpsStatus(provider: PSPProvider): Promise<NormalizedStatus> {
  const url = buildFetchUrl(
    `${provider.apiBaseUrl}/de/eservice-status.html`,
    provider,
  );
  const res = await fetch(url);
  if (!res.ok) throw new Error(`HTTP ${res.status}`);

  const html = await res.text();
  const parser = new DOMParser();
  const doc = parser.parseFromString(html, 'text/html');

  const rows = doc.querySelectorAll('.row.uk-grid-collapse');
  const components: NormalizedComponent[] = [];

  rows.forEach((row) => {
    const nameEl = row.querySelector('.uk-width-1-3\\@s, .uk-width-medium-1-3');
    const statusEl = row.querySelector('.uk-width-2-3\\@s, .uk-width-medium-2-3');

    if (!nameEl || !statusEl) return;

    const name = nameEl.textContent?.trim() ?? '';
    if (!name) return;

    const isOk = statusEl.classList.contains('uk-alert-success') ||
      statusEl.textContent?.trim() === 'Service OK';

    components.push({
      id: name.toLowerCase().replace(/[^a-z0-9]+/g, '-'),
      name,
      status: isOk ? 'operational' : 'major_outage',
      updatedAt: new Date().toISOString(),
    });
  });

  const hasIssues = components.some((c) => c.status !== 'operational');

  return {
    providerId: provider.id,
    providerName: provider.name,
    fetchedAt: new Date().toISOString(),
    overall: {
      indicator: hasIssues ? 'major_outage' : 'operational',
      description: hasIssues ? 'Service disruption' : 'Alle Services OK',
    },
    components,
    activeIncidents: [],
    upcomingMaintenances: [],
  };
}
