import type { PSPProvider, NormalizedStatus, NormalizedComponent, NormalizedIncident } from '../types';
import { buildFetchUrl } from '../utils/fetchUrl';

interface MastercardServiceResult {
  environmentName: string;
  serviceName: string;
  latestResult: string;
  hourlyAggregatedResults: {
    startDate: string;
    endDate: string;
    status: string;
    results: { passCount: number; failCount: number };
  }[];
}

// Key payment-related services to show as components
const PAYMENT_SERVICES = [
  'Mastercard Gateway - Europe',
  'Mastercard Gateway - America',
  'Mastercard Gateway - Asia Pacific',
  'Click To Pay',
  'MDES Digital Enablement',
  'Mastercard Processing Mastercard',
  'Mastercard Processing Authentication',
  'Mastercom',
  'Mastercard Checkout Solutions',
  'Disbursements',
];

export async function fetchMastercardStatus(provider: PSPProvider): Promise<NormalizedStatus> {
  const url = buildFetchUrl(
    `${provider.apiBaseUrl}/apistatus/service-results?environmentName=PRODUCTION`,
    provider,
  );
  const res = await fetch(url);
  if (!res.ok) throw new Error(`HTTP ${res.status}`);

  const data: MastercardServiceResult[] = await res.json();

  const paymentResults = data.filter((s) => PAYMENT_SERVICES.includes(s.serviceName));
  const allResults = data;

  const components: NormalizedComponent[] = paymentResults.map((s) => ({
    id: s.serviceName.toLowerCase().replace(/[^a-z0-9]+/g, '-'),
    name: s.serviceName,
    status: s.latestResult === 'PASS' ? 'operational'
      : s.latestResult === 'FAIL' ? 'major_outage'
      : 'operational',
    updatedAt: s.hourlyAggregatedResults?.[s.hourlyAggregatedResults.length - 1]?.endDate
      ?? new Date().toISOString(),
  }));

  const failingServices = allResults.filter((s) => s.latestResult === 'FAIL');

  const activeIncidents: NormalizedIncident[] = failingServices.map((s) => ({
    id: s.serviceName.toLowerCase().replace(/[^a-z0-9]+/g, '-'),
    name: `${s.serviceName} — Service Failure`,
    status: 'investigating' as const,
    impact: 'major' as const,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    updates: [{
      body: `${s.serviceName} is currently reporting failures in the PRODUCTION environment.`,
      status: 'investigating',
      createdAt: new Date().toISOString(),
    }],
  }));

  const failCount = failingServices.length;
  const hasOutage = failCount > 0;

  return {
    providerId: provider.id,
    providerName: provider.name,
    fetchedAt: new Date().toISOString(),
    overall: {
      indicator: hasOutage ? 'degraded' : 'operational',
      description: hasOutage
        ? `${failCount} service${failCount > 1 ? 's' : ''} reporting failures`
        : 'All Services Operational',
    },
    components,
    activeIncidents,
    upcomingMaintenances: [],
  };
}
