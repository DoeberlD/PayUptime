interface ChangelogLink {
  name: string;
  logo: string;
  url: string;
  description: string;
}

const CHANGELOG_LINKS: ChangelogLink[] = [
  { name: 'Stripe', logo: '/logos/stripe.svg', url: 'https://docs.stripe.com/changelog', description: 'API changelog with dated entries and version upgrades' },
  { name: 'Adyen', logo: '/logos/adyen.svg', url: 'https://docs.adyen.com/release-notes/', description: 'Release notes for all Adyen APIs and integrations' },
  { name: 'PayPal', logo: '/logos/paypal.png', url: 'https://developer.paypal.com/api/rest/release-notes-orders/', description: 'Orders API release notes and breaking changes' },
  { name: 'Klarna', logo: '/logos/klarna.png', url: 'https://docs.klarna.com/api/psp/changelog/', description: 'PSP API changelog and version history' },
  { name: 'Google Pay', logo: '/logos/googlepay.svg', url: 'https://developers.google.com/pay/api/web/support/release-notes', description: 'Web and Android API release notes' },
  { name: 'Apple Pay', logo: '/logos/applepay.svg', url: 'https://developer.apple.com/apple-pay/whats-new/', description: 'What\'s new in Apple Pay and recent platform changes' },
  { name: 'Visa / CyberSource', logo: '/logos/visa.png', url: 'https://developer.cybersource.com/release-notes.html', description: 'CyberSource API release notes and updates' },
  { name: 'Mastercard', logo: '/logos/mastercard.svg', url: 'https://developer.mastercard.com/mastercard-send/documentation/send-release-notes/', description: 'Mastercard Send and developer API release notes' },
  { name: 'Unzer', logo: '/logos/unzer.png', url: 'https://docs.unzer.com/reference/changelog/', description: 'API changelog and SDK version history' },
  { name: 'Square', logo: '/logos/square.svg', url: 'https://developer.squareup.com/docs/changelog/connect', description: 'Connect API changelog with dated entries' },
  { name: 'Worldpay', logo: '/logos/worldpay.svg', url: 'https://developer.worldpay.com/docs/access-worldpay/payments/changelog', description: 'Payments API changelog and version updates' },
  { name: 'Worldline', logo: '/logos/worldline.svg', url: 'https://docs.worldline.com/en/collect/online-payments/release-notes', description: 'Online payments release notes' },
  { name: 'PAYONE', logo: '/logos/payone.svg', url: 'https://docs.payone.com/release-notes', description: 'API and platform release notes' },
  { name: 'EPS', logo: '/logos/eps.svg', url: 'https://eservice.psa.at', description: 'PSA eService portal and documentation' },
];

function LinkCard({ link }: { link: ChangelogLink }) {
  return (
    <a
      href={link.url}
      onClick={(e) => { e.preventDefault(); const w=900,h=700; const left=window.screenX+(window.outerWidth-w)/2; const top=window.screenY+(window.outerHeight-h)/2; window.open(link.url, link.name, `width=${w},height=${h},left=${left},top=${top},scrollbars=yes,resizable=yes`); }}
      className="flex items-center gap-3 bg-gray-800 border border-gray-700 rounded-lg p-4 hover:bg-gray-700/80 hover:border-gray-600 transition-colors group cursor-pointer"
    >
      <img
        src={link.logo}
        alt={link.name}
        className="w-10 h-7 object-contain shrink-0"
      />
      <div className="min-w-0 flex-1">
        <p className="text-sm font-medium text-gray-200 group-hover:text-white transition-colors">
          {link.name}
        </p>
        <p className="text-xs text-gray-500">{link.description}</p>
      </div>
      <svg className="w-4 h-4 text-gray-600 group-hover:text-gray-400 shrink-0 transition-colors" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
      </svg>
    </a>
  );
}

export function ApiChanges() {
  return (
    <main className="flex-1 px-4 sm:px-6">
      <div className="max-w-6xl mx-auto py-6 space-y-6">
        <div>
          <h2 className="text-xl font-semibold text-gray-200">API Changes & Release Notes</h2>
          <p className="text-sm text-gray-400 mt-1">
            Check recent API upgrades and changelog entries from each provider. Useful for diagnosing if an issue stems from a recent API change or version mismatch.
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
          {CHANGELOG_LINKS.map((link) => (
            <LinkCard key={link.name} link={link} />
          ))}
        </div>

        <div className="text-xs text-gray-600">
          Links point to each provider's official developer documentation. Check these pages after an incident to see if a recent API change may have contributed.
        </div>
      </div>
    </main>
  );
}
