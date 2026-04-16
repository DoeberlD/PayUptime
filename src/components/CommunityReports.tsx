const DOWNDETECTOR_BASE = 'https://xn--allestrungen-9ib.at/en/status';

interface LinkCard {
  name: string;
  logo: string;
  url: string;
  description: string;
}

const DOWNDETECTOR_LINKS: LinkCard[] = [
  { name: 'Visa', logo: '/logos/visa.svg', url: `${DOWNDETECTOR_BASE}/visa/`, description: 'Visa outage reports' },
  { name: 'PayPal', logo: '/logos/paypal.svg', url: `${DOWNDETECTOR_BASE}/paypal/`, description: 'PayPal outage reports' },
  { name: 'Stripe', logo: '/logos/stripe.svg', url: `${DOWNDETECTOR_BASE}/stripe/`, description: 'Stripe outage reports' },
  { name: 'Klarna', logo: '/logos/klarna.svg', url: `${DOWNDETECTOR_BASE}/klarna/`, description: 'Klarna outage reports' },
  { name: 'Mastercard', logo: '/logos/visa.svg', url: `${DOWNDETECTOR_BASE}/mastercard/`, description: 'Mastercard outage reports' },
];

function LinkCardComponent({ card }: { card: LinkCard }) {
  return (
    <a
      href={card.url}
      onClick={(e) => { e.preventDefault(); const w=900,h=700; const left=window.screenX+(window.outerWidth-w)/2; const top=window.screenY+(window.outerHeight-h)/2; window.open(card.url, card.name, `width=${w},height=${h},left=${left},top=${top},scrollbars=yes,resizable=yes`); }}
      className="flex items-center gap-3 bg-gray-800 border border-gray-700 rounded-lg p-4 hover:bg-gray-700/80 hover:border-gray-600 transition-colors group cursor-pointer"
    >
      <img
        src={card.logo}
        alt={card.name}
        className="w-10 h-10 object-contain shrink-0"
      />
      <div className="min-w-0 flex-1">
        <p className="text-sm font-medium text-gray-200 group-hover:text-white transition-colors">
          {card.name}
        </p>
        <p className="text-xs text-gray-500">{card.description}</p>
      </div>
      <svg className="w-4 h-4 text-gray-600 group-hover:text-gray-400 shrink-0 transition-colors" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
      </svg>
    </a>
  );
}

export function CommunityReports() {
  return (
    <main className="flex-1 px-4 sm:px-6">
      <div className="max-w-6xl mx-auto py-6 space-y-8">
      {/* Downdetector section */}
      <section>
        <div className="flex items-center gap-3 mb-4">
          <img src="/logos/downdetector.svg" alt="Downdetector" className="w-8 h-8" />
          <div>
            <h2 className="text-lg font-semibold text-gray-200">Downdetector</h2>
            <p className="text-xs text-gray-500">Real-time user-reported outages (allestörungen.at)</p>
          </div>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
          {DOWNDETECTOR_LINKS.map((card) => (
            <LinkCardComponent key={card.name} card={card} />
          ))}
        </div>
      </section>
      </div>
    </main>
  );
}
