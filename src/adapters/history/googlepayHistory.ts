import type { PSPProvider, HistoricalIncident } from '../../types';

interface GooglePayIncident {
  id: string;
  begin: string;
  end: string | null;
  external_desc: string;
  severity: string;
  service_name: string;
}

const SEVERITY_MAP: Record<string, HistoricalIncident['impact']> = {
  low: 'minor',
  medium: 'minor',
  high: 'major',
};

export async function fetchGooglePayHistory(provider: PSPProvider): Promise<HistoricalIncident[]> {
  const res = await fetch(`${provider.apiBaseUrl}/incidents.json`);
  if (!res.ok) throw new Error(`HTTP ${res.status}`);

  const data: GooglePayIncident[] = await res.json();

  return data.map((i) => ({
    id: i.id,
    providerId: provider.id,
    providerName: provider.name,
    title: `${i.service_name}: ${i.external_desc.slice(0, 100)}`,
    impact: SEVERITY_MAP[i.severity] ?? 'minor',
    status: i.end ? 'resolved' as const : 'investigating' as const,
    startedAt: i.begin,
    resolvedAt: i.end,
    url: `https://pay.google.com/status/incidents/${i.id}`,
  }));
}
