import type { PSPProvider, NormalizedStatus, NormalizedComponent, NormalizedIncident } from '../types';

interface GooglePayProduct {
  title: string;
  id: string;
}

interface GooglePayUpdate {
  created: string;
  when: string;
  text: string;
  status: string;
}

interface GooglePayIncident {
  id: string;
  begin: string;
  end: string | null;
  external_desc: string;
  status_impact: string;
  severity: string;
  service_name: string;
  most_recent_update: GooglePayUpdate;
  updates: GooglePayUpdate[];
  affected_products: { title: string; id: string }[];
}

const STATUS_MAP: Record<string, NormalizedComponent['status']> = {
  AVAILABLE: 'operational',
  SERVICE_INFORMATION: 'degraded_performance',
  SERVICE_DISRUPTION: 'partial_outage',
  SERVICE_OUTAGE: 'major_outage',
};

const IMPACT_MAP: Record<string, NormalizedIncident['impact']> = {
  low: 'minor',
  medium: 'minor',
  high: 'major',
};

export async function fetchGooglePayStatus(provider: PSPProvider): Promise<NormalizedStatus> {
  const [productsRes, incidentsRes] = await Promise.all([
    fetch(`${provider.apiBaseUrl}/products.json`),
    fetch(`${provider.apiBaseUrl}/incidents.json`),
  ]);

  if (!productsRes.ok) throw new Error(`Products HTTP ${productsRes.status}`);
  if (!incidentsRes.ok) throw new Error(`Incidents HTTP ${incidentsRes.status}`);

  const productsData: { products: GooglePayProduct[] } = await productsRes.json();
  const incidentsData: GooglePayIncident[] = await incidentsRes.json();

  // Active incidents: no end date or most recent status is not AVAILABLE
  const activeIncidents = incidentsData.filter(
    (i) => !i.end || i.most_recent_update.status !== 'AVAILABLE',
  );

  // Affected product IDs from active incidents
  const affectedIds = new Set(
    activeIncidents.flatMap((i) => i.affected_products.map((p) => p.id)),
  );

  const components: NormalizedComponent[] = productsData.products.map((p) => {
    const affecting = activeIncidents.find((i) =>
      i.affected_products.some((ap) => ap.id === p.id),
    );
    return {
      id: p.id,
      name: p.title,
      status: affecting ? (STATUS_MAP[affecting.status_impact] ?? 'operational') : 'operational',
      updatedAt: new Date().toISOString(),
    };
  });

  const normalizedIncidents: NormalizedIncident[] = activeIncidents.map((i) => ({
    id: i.id,
    name: i.external_desc,
    status: i.most_recent_update.status === 'AVAILABLE' ? 'resolved' as const : 'investigating' as const,
    impact: IMPACT_MAP[i.severity] ?? 'minor',
    createdAt: i.begin,
    updatedAt: i.most_recent_update.when,
    updates: i.updates.map((u) => ({
      body: u.text,
      status: u.status.toLowerCase(),
      createdAt: u.when,
    })),
  }));

  const hasOutage = affectedIds.size > 0 && activeIncidents.some(
    (i) => i.status_impact === 'SERVICE_OUTAGE',
  );
  const hasDisruption = activeIncidents.some(
    (i) => i.status_impact === 'SERVICE_DISRUPTION',
  );

  return {
    providerId: provider.id,
    providerName: provider.name,
    fetchedAt: new Date().toISOString(),
    overall: {
      indicator: hasOutage ? 'major_outage' : hasDisruption ? 'degraded' : 'operational',
      description: hasOutage ? 'Service outage' : hasDisruption ? 'Service disruption' : 'All Services Available',
    },
    components,
    activeIncidents: normalizedIncidents,
    upcomingMaintenances: [],
  };
}
