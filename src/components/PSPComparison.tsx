import { useState, useMemo } from 'react';

interface Provider {
  name: string;
  website: string;
  category: 'Direct PSP / Acquirer' | 'Local AT Specialist' | 'Orchestrator (Commercial)' | 'Orchestrator (Open Source)';
  hq: string;
  methodCount: number;
  keyATMethods: string[];
  fees: string;
  feesSource: string;
  feeScore: number; // 0-10 lower=cheaper=better
  coverage: string;
  uptimeSLA: string;
  uptimeSource: string;
  authRateUplift: string;
  techStack: string;
  migrationEase: 'Low' | 'Medium' | 'High';
  migrationNote: string;
  gdpr: 'eu' | 'us' | 'selfhost';
  gdprNote: string;
  supportScore: number; // 1-5
  supportSource: string;
  germanSupport: boolean;
  // OSS-specific
  github?: string;
  license?: string;
  language?: string;
  stars?: string;
  selfHostBurden?: 'Low' | 'Medium' | 'High';
  // Scoring inputs (0-10 each)
  atMethodScore: number;
  techScore: number;
  migrationScore: number;
  gdprScore: number;
  uptimeScore: number;
  scaleScore: number;
  strengths: string[];
  weakness: string;
}

const PROVIDERS: Provider[] = [
  // === Direct PSPs / Acquirers ===
  {
    name: 'Stripe', website: 'https://stripe.com', category: 'Direct PSP / Acquirer',
    hq: 'Ireland (EU)', methodCount: 135, keyATMethods: ['EPS', 'Klarna', 'SEPA DD', 'Visa/MC', 'Apple Pay', 'Google Pay'],
    fees: '1.5% + \u20AC0.25 (EU cards)', feesSource: 'stripe.com/pricing', feeScore: 5,
    coverage: '47 countries', uptimeSLA: '99.99% (historical)', uptimeSource: 'stripestatus.com',
    authRateUplift: 'Adaptive Acceptance', techStack: 'REST + webhooks, modern SDKs',
    migrationEase: 'Medium', migrationNote: 'Vault portability via Stripe migration tools',
    gdpr: 'eu', gdprNote: 'Irish entity, EU data processing', supportScore: 3, supportSource: 'G2 / Capterra',
    germanSupport: false, atMethodScore: 8, techScore: 10, migrationScore: 6, gdprScore: 9, uptimeScore: 9, scaleScore: 9,
    strengths: ['Best-in-class DX', 'Broad method coverage'], weakness: 'Self-serve support only',
  },
  {
    name: 'Adyen', website: 'https://adyen.com', category: 'Direct PSP / Acquirer',
    hq: 'Netherlands (EU)', methodCount: 250, keyATMethods: ['EPS', 'Klarna', 'Sofort', 'SEPA DD', 'Visa/MC', 'Apple Pay', 'Google Pay'],
    fees: 'Interchange++ (enterprise)', feesSource: 'adyen.com/pricing', feeScore: 4,
    coverage: '70+ countries, unified commerce', uptimeSLA: '99.996% (claimed)', uptimeSource: 'adyen.com',
    authRateUplift: 'RevenueAccelerate, +6% claimed', techStack: 'REST, unified platform',
    migrationEase: 'Medium', migrationNote: 'Full-stack, some lock-in risk',
    gdpr: 'eu', gdprNote: 'Dutch HQ, EU data centers', supportScore: 4, supportSource: 'G2',
    germanSupport: true, atMethodScore: 9, techScore: 9, migrationScore: 5, gdprScore: 10, uptimeScore: 10, scaleScore: 10,
    strengths: ['Unified commerce', 'Highest auth rates'], weakness: 'Enterprise-only pricing',
  },
  {
    name: 'Mollie', website: 'https://mollie.com', category: 'Direct PSP / Acquirer',
    hq: 'Netherlands (EU)', methodCount: 35, keyATMethods: ['EPS', 'Klarna', 'SEPA DD', 'Visa/MC', 'Apple Pay', 'Google Pay', 'Paysafecard'],
    fees: '1.8% + \u20AC0.25 (EU cards), EPS \u20AC0.29', feesSource: 'mollie.com/pricing', feeScore: 6,
    coverage: '35+ countries', uptimeSLA: '\u2014', uptimeSource: '',
    authRateUplift: '\u2014', techStack: 'REST, simple SDKs, dashboard-first',
    migrationEase: 'High', migrationNote: 'Easy onboarding, plugin ecosystem',
    gdpr: 'eu', gdprNote: 'Dutch, EU-only processing', supportScore: 4, supportSource: 'Capterra / Trustpilot',
    germanSupport: true, atMethodScore: 8, techScore: 7, migrationScore: 9, gdprScore: 10, uptimeScore: 6, scaleScore: 6,
    strengths: ['SMB-friendly', 'Easy onboarding'], weakness: 'Limited enterprise features',
  },
  {
    name: 'Worldline / Saferpay', website: 'https://worldline.com', category: 'Direct PSP / Acquirer',
    hq: 'France (EU)', methodCount: 200, keyATMethods: ['EPS', 'Klarna', 'Sofort', 'SEPA DD', 'Visa/MC', 'Apple Pay', 'Google Pay'],
    fees: 'Custom (acquirer pricing)', feesSource: 'worldline.com', feeScore: 5,
    coverage: '50+ countries', uptimeSLA: '99.9%+', uptimeSource: 'Saferpay docs',
    authRateUplift: '\u2014', techStack: 'REST (Saferpay), legacy SOAP available',
    migrationEase: 'Low', migrationNote: 'Complex legacy stack, many sub-brands',
    gdpr: 'eu', gdprNote: 'French HQ, EU data centers', supportScore: 3, supportSource: 'Capterra',
    germanSupport: true, atMethodScore: 8, techScore: 5, migrationScore: 3, gdprScore: 9, uptimeScore: 7, scaleScore: 8,
    strengths: ['Strong AT acquiring', 'Broad POS coverage'], weakness: 'Legacy feel, complex structure',
  },
  {
    name: 'Nexi / Concardis', website: 'https://nexi.it', category: 'Direct PSP / Acquirer',
    hq: 'Italy (EU)', methodCount: 100, keyATMethods: ['Visa/MC', 'SEPA DD', 'Apple Pay', 'Google Pay'],
    fees: 'Custom', feesSource: 'nexi.it', feeScore: 5,
    coverage: '25+ countries', uptimeSLA: '\u2014', uptimeSource: '',
    authRateUplift: '\u2014', techStack: 'REST, modernising',
    migrationEase: 'Low', migrationNote: 'Large acquirer, complex onboarding',
    gdpr: 'eu', gdprNote: 'Italian HQ, EU processing', supportScore: 3, supportSource: 'Trustpilot',
    germanSupport: true, atMethodScore: 4, techScore: 5, migrationScore: 3, gdprScore: 9, uptimeScore: 6, scaleScore: 7,
    strengths: ['Strong POS/in-store', 'EU-native'], weakness: 'Limited EPS/AT local methods',
  },
  {
    name: 'Checkout.com', website: 'https://checkout.com', category: 'Direct PSP / Acquirer',
    hq: 'UK', methodCount: 150, keyATMethods: ['EPS', 'Klarna', 'SEPA DD', 'Visa/MC', 'Apple Pay', 'Google Pay'],
    fees: 'Interchange++ (enterprise)', feesSource: 'checkout.com', feeScore: 4,
    coverage: '150+ currencies', uptimeSLA: '99.999% (target)', uptimeSource: 'checkout.com',
    authRateUplift: 'Intelligent Acceptance', techStack: 'REST, modern, Flow orchestration',
    migrationEase: 'Medium', migrationNote: 'Modern API, network tokenization',
    gdpr: 'us', gdprNote: 'UK HQ, EU processing available', supportScore: 4, supportSource: 'G2',
    germanSupport: false, atMethodScore: 7, techScore: 9, migrationScore: 6, gdprScore: 7, uptimeScore: 9, scaleScore: 9,
    strengths: ['Enterprise-grade', 'High auth rates'], weakness: 'UK entity post-Brexit',
  },
  {
    name: 'PayPal / Braintree', website: 'https://paypal.com', category: 'Direct PSP / Acquirer',
    hq: 'US (EU entity: Luxembourg)', methodCount: 25, keyATMethods: ['Visa/MC', 'SEPA DD', 'Apple Pay', 'Google Pay'],
    fees: '2.49% + fixed (wallet), ~1.49% + fixed (Braintree cards)', feesSource: 'paypal.com/at', feeScore: 8,
    coverage: '200+ markets', uptimeSLA: '99.9%+', uptimeSource: 'paypal-status.com',
    authRateUplift: '\u2014', techStack: 'REST (Braintree modern, PayPal legacy)',
    migrationEase: 'Medium', migrationNote: 'Braintree vault portable, PayPal lock-in',
    gdpr: 'us', gdprNote: 'US parent, EU entity in Luxembourg', supportScore: 2, supportSource: 'Trustpilot',
    germanSupport: true, atMethodScore: 4, techScore: 6, migrationScore: 5, gdprScore: 6, uptimeScore: 7, scaleScore: 10,
    strengths: ['Highest consumer trust in AT', 'Ubiquitous'], weakness: 'High wallet fees',
  },
  {
    name: 'Klarna', website: 'https://klarna.com', category: 'Direct PSP / Acquirer',
    hq: 'Sweden (EU)', methodCount: 5, keyATMethods: ['Klarna', 'Sofort'],
    fees: 'Merchant-dependent, ~2-4% for BNPL', feesSource: 'klarna.com', feeScore: 7,
    coverage: '45 markets', uptimeSLA: '\u2014', uptimeSource: '',
    authRateUplift: '\u2014', techStack: 'REST, SDKs, checkout widget',
    migrationEase: 'High', migrationNote: 'Often integrated via PSP, easy to add/remove',
    gdpr: 'eu', gdprNote: 'Swedish HQ, EU processing', supportScore: 3, supportSource: 'Capterra',
    germanSupport: true, atMethodScore: 5, techScore: 7, migrationScore: 8, gdprScore: 10, uptimeScore: 6, scaleScore: 7,
    strengths: ['Strongest BNPL in DACH', 'Consumer brand'], weakness: 'BNPL-only, not a full PSP',
  },
  {
    name: 'Paysafe / Paysafecard', website: 'https://paysafe.com', category: 'Direct PSP / Acquirer',
    hq: 'UK/Austria origin', methodCount: 40, keyATMethods: ['Paysafecard', 'Visa/MC', 'SEPA DD'],
    fees: 'Custom', feesSource: 'paysafe.com', feeScore: 6,
    coverage: '40+ countries', uptimeSLA: '\u2014', uptimeSource: '',
    authRateUplift: '\u2014', techStack: 'REST, mixed modernity',
    migrationEase: 'Medium', migrationNote: 'Modular, vault available',
    gdpr: 'us', gdprNote: 'UK HQ, Austrian origin', supportScore: 3, supportSource: 'Capterra',
    germanSupport: true, atMethodScore: 5, techScore: 5, migrationScore: 5, gdprScore: 6, uptimeScore: 6, scaleScore: 6,
    strengths: ['Austrian origin', 'Paysafecard niche'], weakness: 'Complex post-acquisition structure',
  },
  // === Local AT / DACH Specialists ===
  {
    name: 'Hobex', website: 'https://hobex.at', category: 'Local AT Specialist',
    hq: 'Austria', methodCount: 15, keyATMethods: ['Visa/MC', 'Apple Pay', 'Google Pay'],
    fees: 'Custom (competitive for AT)', feesSource: 'hobex.at', feeScore: 5,
    coverage: 'Austria / DACH', uptimeSLA: '\u2014', uptimeSource: '',
    authRateUplift: '\u2014', techStack: 'Terminals + basic e-com API',
    migrationEase: 'Low', migrationNote: 'Primarily POS, limited e-com migration',
    gdpr: 'eu', gdprNote: 'Austrian company, local data', supportScore: 4, supportSource: 'Local reviews',
    germanSupport: true, atMethodScore: 3, techScore: 3, migrationScore: 2, gdprScore: 10, uptimeScore: 5, scaleScore: 2,
    strengths: ['Local AT support', 'Strong hospitality/retail'], weakness: 'Limited e-commerce features',
  },
  {
    name: 'Unzer Austria (ex-mPAY24)', website: 'https://unzer.com/at', category: 'Local AT Specialist',
    hq: 'Austria / Germany', methodCount: 30, keyATMethods: ['EPS', 'Klarna', 'Sofort', 'Visa/MC', 'Apple Pay', 'Google Pay', 'SEPA DD'],
    fees: 'Custom', feesSource: 'unzer.com', feeScore: 5,
    coverage: 'DACH + EU', uptimeSLA: '\u2014', uptimeSource: '',
    authRateUplift: '\u2014', techStack: 'REST (modernising from SOAP legacy)',
    migrationEase: 'Medium', migrationNote: 'SOAP legacy in some APIs, improving',
    gdpr: 'eu', gdprNote: 'AT/DE entity, EU processing', supportScore: 3, supportSource: 'Capterra',
    germanSupport: true, atMethodScore: 8, techScore: 5, migrationScore: 5, gdprScore: 10, uptimeScore: 6, scaleScore: 4,
    strengths: ['Austrian heritage', 'Full AT method coverage'], weakness: 'SOAP legacy still visible',
  },
  {
    name: 'Qenta (ex-Wirecard CEE)', website: 'https://qenta.com', category: 'Local AT Specialist',
    hq: 'Austria', methodCount: 25, keyATMethods: ['EPS', 'Visa/MC', 'Sofort', 'SEPA DD'],
    fees: 'Custom', feesSource: 'qenta.com', feeScore: 5,
    coverage: 'DACH / CEE', uptimeSLA: '\u2014', uptimeSource: '',
    authRateUplift: '\u2014', techStack: 'QPAY checkout, mid-modernity',
    migrationEase: 'Medium', migrationNote: 'Wirecard successor, moderate tooling',
    gdpr: 'eu', gdprNote: 'Austrian company', supportScore: 3, supportSource: 'Local reviews',
    germanSupport: true, atMethodScore: 6, techScore: 4, migrationScore: 5, gdprScore: 10, uptimeScore: 5, scaleScore: 3,
    strengths: ['DACH/CEE focus', 'Austrian company'], weakness: 'Wirecard legacy perception',
  },
  {
    name: 'PAYONE', website: 'https://payone.com', category: 'Local AT Specialist',
    hq: 'Germany (Worldline JV)', methodCount: 60, keyATMethods: ['EPS', 'Klarna', 'Sofort', 'SEPA DD', 'Visa/MC', 'Apple Pay', 'Google Pay'],
    fees: 'Custom (DACH competitive)', feesSource: 'payone.com', feeScore: 5,
    coverage: 'DACH + EU', uptimeSLA: '\u2014', uptimeSource: '',
    authRateUplift: '\u2014', techStack: 'REST + Server API, Channel API',
    migrationEase: 'Medium', migrationNote: 'Good plugin ecosystem (Shopware, Magento)',
    gdpr: 'eu', gdprNote: 'German entity, Worldline JV', supportScore: 4, supportSource: 'Capterra',
    germanSupport: true, atMethodScore: 8, techScore: 6, migrationScore: 6, gdprScore: 10, uptimeScore: 6, scaleScore: 5,
    strengths: ['Strong DACH coverage', 'Good plugin ecosystem'], weakness: 'Limited outside DACH',
  },
  {
    name: 'Computop', website: 'https://computop.com', category: 'Local AT Specialist',
    hq: 'Germany', methodCount: 80, keyATMethods: ['EPS', 'Klarna', 'SEPA DD', 'Visa/MC', 'Apple Pay', 'Google Pay'],
    fees: 'Custom (enterprise)', feesSource: 'computop.com', feeScore: 5,
    coverage: 'DACH + EU + global', uptimeSLA: '99.98%', uptimeSource: 'computop.com',
    authRateUplift: '\u2014', techStack: 'REST, Paygate platform',
    migrationEase: 'Medium', migrationNote: 'Enterprise, moderate complexity',
    gdpr: 'eu', gdprNote: 'German company, EU data centers', supportScore: 3, supportSource: 'G2',
    germanSupport: true, atMethodScore: 7, techScore: 6, migrationScore: 5, gdprScore: 10, uptimeScore: 7, scaleScore: 6,
    strengths: ['Enterprise DACH focus', 'Omnichannel'], weakness: 'Complex onboarding',
  },
  {
    name: 'PSA (Payment Services Austria)', website: 'https://psa.at', category: 'Local AT Specialist',
    hq: 'Austria', methodCount: 5, keyATMethods: ['EPS'],
    fees: 'Infrastructure (not merchant-facing)', feesSource: 'psa.at', feeScore: 0,
    coverage: 'Austria', uptimeSLA: '\u2014', uptimeSource: '',
    authRateUplift: '\u2014', techStack: 'Banking infrastructure',
    migrationEase: 'Low', migrationNote: 'Not a merchant PSP \u2014 bank infrastructure',
    gdpr: 'eu', gdprNote: 'Austrian banking infrastructure', supportScore: 0, supportSource: '',
    germanSupport: true, atMethodScore: 3, techScore: 3, migrationScore: 1, gdprScore: 10, uptimeScore: 7, scaleScore: 1,
    strengths: ['Runs EPS infrastructure', 'Austrian banks'], weakness: 'Not merchant-facing',
  },
  // === Commercial Orchestrators ===
  {
    name: 'IXOPAY', website: 'https://ixopay.com', category: 'Orchestrator (Commercial)',
    hq: 'Austria (Token.io)', methodCount: 300, keyATMethods: ['EPS', 'Klarna', 'SEPA DD', 'Visa/MC', 'Apple Pay', 'Google Pay'],
    fees: 'Enterprise (SaaS)', feesSource: 'ixopay.com', feeScore: 6,
    coverage: '200+ PSPs, 300+ methods', uptimeSLA: '99.9%+', uptimeSource: 'ixopay.com',
    authRateUplift: 'Smart routing', techStack: 'REST, modular, vaulting, smart routing',
    migrationEase: 'High', migrationNote: 'PSP-agnostic vault, easy connector swap',
    gdpr: 'eu', gdprNote: 'Austrian-founded, EU hosting', supportScore: 4, supportSource: 'G2',
    germanSupport: true, atMethodScore: 8, techScore: 9, migrationScore: 10, gdprScore: 10, uptimeScore: 7, scaleScore: 8,
    strengths: ['Austrian-founded', 'PSP-agnostic routing'], weakness: 'Enterprise pricing only',
  },
  {
    name: 'Primer', website: 'https://primer.io', category: 'Orchestrator (Commercial)',
    hq: 'UK', methodCount: 100, keyATMethods: ['EPS', 'Klarna', 'Visa/MC', 'Apple Pay', 'Google Pay'],
    fees: 'SaaS (usage-based)', feesSource: 'primer.io', feeScore: 6,
    coverage: '100+ connectors', uptimeSLA: '\u2014', uptimeSource: '',
    authRateUplift: 'ML-based fallback routing', techStack: 'No-code workflows, REST, modern',
    migrationEase: 'High', migrationNote: 'No-code workflows, easy connector add/remove',
    gdpr: 'us', gdprNote: 'UK HQ, EU processing available', supportScore: 4, supportSource: 'G2',
    germanSupport: false, atMethodScore: 6, techScore: 10, migrationScore: 9, gdprScore: 7, uptimeScore: 6, scaleScore: 7,
    strengths: ['No-code workflows', 'ML routing'], weakness: 'Newer company, less track record',
  },
  {
    name: 'Gr4vy', website: 'https://gr4vy.com', category: 'Orchestrator (Commercial)',
    hq: 'US/UK', methodCount: 80, keyATMethods: ['Visa/MC', 'Apple Pay', 'Google Pay'],
    fees: 'SaaS', feesSource: 'gr4vy.com', feeScore: 6,
    coverage: '70+ connectors', uptimeSLA: '\u2014', uptimeSource: '',
    authRateUplift: '\u2014', techStack: 'Cloud-native, GraphQL, containerised, multi-cloud',
    migrationEase: 'High', migrationNote: 'Cloud-native, deploy anywhere',
    gdpr: 'selfhost', gdprNote: 'Cloud-native, self-deploy option', supportScore: 3, supportSource: 'G2',
    germanSupport: false, atMethodScore: 3, techScore: 10, migrationScore: 9, gdprScore: 8, uptimeScore: 6, scaleScore: 5,
    strengths: ['Cloud-native', 'Multi-cloud deploy'], weakness: 'Limited AT-specific methods',
  },
  {
    name: 'Spreedly', website: 'https://spreedly.com', category: 'Orchestrator (Commercial)',
    hq: 'US', methodCount: 180, keyATMethods: ['Visa/MC'],
    fees: 'SaaS (per-transaction)', feesSource: 'spreedly.com', feeScore: 6,
    coverage: '180+ gateways', uptimeSLA: '99.99%', uptimeSource: 'spreedly.com',
    authRateUplift: '\u2014', techStack: 'REST, tokenization-first, API-only',
    migrationEase: 'High', migrationNote: 'Best vault portability, gateway-agnostic tokens',
    gdpr: 'us', gdprNote: 'US HQ, EU vault option', supportScore: 4, supportSource: 'G2',
    germanSupport: false, atMethodScore: 2, techScore: 8, migrationScore: 10, gdprScore: 5, uptimeScore: 8, scaleScore: 8,
    strengths: ['Best vault portability', 'Gateway-agnostic'], weakness: 'No AT local methods',
  },
  {
    name: 'Payrails', website: 'https://payrails.com', category: 'Orchestrator (Commercial)',
    hq: 'Germany (EU)', methodCount: 50, keyATMethods: ['Visa/MC', 'SEPA DD'],
    fees: 'Enterprise', feesSource: 'payrails.com', feeScore: 6,
    coverage: 'EU + global', uptimeSLA: '\u2014', uptimeSource: '',
    authRateUplift: '\u2014', techStack: 'Modular, API-first, modern',
    migrationEase: 'High', migrationNote: 'Modular architecture',
    gdpr: 'eu', gdprNote: 'Berlin-based, EU processing', supportScore: 3, supportSource: '',
    germanSupport: true, atMethodScore: 3, techScore: 8, migrationScore: 8, gdprScore: 10, uptimeScore: 5, scaleScore: 5,
    strengths: ['EU-based', 'Modular architecture'], weakness: 'Early-stage, limited AT methods',
  },
  // === Open-Source Orchestrators ===
  {
    name: 'Hyperswitch', website: 'https://hyperswitch.io', category: 'Orchestrator (Open Source)',
    hq: 'India (Juspay)', methodCount: 50, keyATMethods: ['Visa/MC', 'Apple Pay', 'Google Pay', 'Klarna'],
    fees: 'Free (self-host) / managed pricing', feesSource: 'github.com/juspay/hyperswitch', feeScore: 2,
    coverage: '50+ connectors', uptimeSLA: '99.999% (managed)', uptimeSource: 'hyperswitch.io',
    authRateUplift: 'Smart routing, retries', techStack: 'Rust, cloud-native, sub-30ms overhead',
    migrationEase: 'High', migrationNote: 'PSP-agnostic, self-hostable, open vault',
    gdpr: 'selfhost', gdprNote: 'Self-host in any EU region', supportScore: 4, supportSource: 'GitHub',
    germanSupport: false, atMethodScore: 5, techScore: 10, migrationScore: 10, gdprScore: 10, uptimeScore: 8, scaleScore: 6,
    github: 'https://github.com/juspay/hyperswitch', license: 'Apache 2.0', language: 'Rust', stars: '14k+', selfHostBurden: 'Medium',
    strengths: ['Best OSS option', 'Rust/cloud-native'], weakness: 'Limited AT local methods',
  },
  {
    name: 'Kill Bill', website: 'https://killbill.io', category: 'Orchestrator (Open Source)',
    hq: 'US', methodCount: 20, keyATMethods: ['Visa/MC'],
    fees: 'Free (self-host)', feesSource: 'github.com/killbill/killbill', feeScore: 1,
    coverage: '20+ plugins', uptimeSLA: '\u2014', uptimeSource: '',
    authRateUplift: '\u2014', techStack: 'Java, mature, subscription billing focus',
    migrationEase: 'Medium', migrationNote: 'Billing-first, light PSP routing',
    gdpr: 'selfhost', gdprNote: 'Self-host anywhere', supportScore: 3, supportSource: 'GitHub',
    germanSupport: false, atMethodScore: 1, techScore: 5, migrationScore: 6, gdprScore: 9, uptimeScore: 5, scaleScore: 4,
    github: 'https://github.com/killbill/killbill', license: 'Apache 2.0', language: 'Java', stars: '4k+', selfHostBurden: 'High',
    strengths: ['Mature', 'Subscription billing'], weakness: 'Not a full payment orchestrator',
  },
  {
    name: 'ActiveMerchant', website: 'https://github.com/activemerchant/active_merchant', category: 'Orchestrator (Open Source)',
    hq: 'Canada (Shopify)', methodCount: 100, keyATMethods: ['Visa/MC'],
    fees: 'Free (library)', feesSource: 'GitHub', feeScore: 1,
    coverage: '100+ gateway adapters', uptimeSLA: '\u2014', uptimeSource: '',
    authRateUplift: '\u2014', techStack: 'Ruby, gateway adapter library',
    migrationEase: 'High', migrationNote: 'Library, not a platform \u2014 easy to swap gateways',
    gdpr: 'selfhost', gdprNote: 'Library, you control deployment', supportScore: 2, supportSource: 'GitHub',
    germanSupport: false, atMethodScore: 1, techScore: 4, migrationScore: 8, gdprScore: 9, uptimeScore: 5, scaleScore: 5,
    github: 'https://github.com/activemerchant/active_merchant', license: 'MIT', language: 'Ruby', stars: '4.7k+', selfHostBurden: 'Low',
    strengths: ['Shopify-backed', 'Many gateways'], weakness: 'Adapter library, not full orchestrator',
  },
];

const DEFAULT_WEIGHTS = {
  atMethods: 25,
  fees: 15,
  tech: 15,
  migration: 10,
  gdpr: 10,
  uptime: 10,
  support: 10,
  scale: 5,
};

function computeScore(p: Provider, weights: typeof DEFAULT_WEIGHTS): number {
  const totalWeight = Object.values(weights).reduce((a, b) => a + b, 0);
  if (totalWeight === 0) return 0;
  const raw =
    p.atMethodScore * weights.atMethods +
    (10 - p.feeScore) * weights.fees +
    p.techScore * weights.tech +
    p.migrationScore * weights.migration +
    p.gdprScore * weights.gdpr +
    p.uptimeScore * weights.uptime +
    p.supportScore * 2 * weights.support +
    p.scaleScore * weights.scale;
  return Math.round((raw / totalWeight / 10) * 100);
}

const CATEGORIES = ['Direct PSP / Acquirer', 'Local AT Specialist', 'Orchestrator (Commercial)', 'Orchestrator (Open Source)'] as const;

function GDPRBadge({ gdpr, note }: { gdpr: Provider['gdpr']; note: string }) {
  const cfg = {
    eu: { icon: '\u2705', label: 'EU-hosted', cls: 'text-green-400' },
    us: { icon: '\u26A0\uFE0F', label: 'US parent', cls: 'text-yellow-400' },
    selfhost: { icon: '\u2139\uFE0F', label: 'Self-host', cls: 'text-blue-400' },
  }[gdpr];
  return <span className={`text-xs ${cfg.cls}`} title={note}>{cfg.icon} {cfg.label}</span>;
}

function MethodBadge({ method }: { method: string }) {
  const isEPS = method === 'EPS';
  return (
    <span className={`inline-block px-1.5 py-0.5 rounded text-[10px] ${isEPS ? 'bg-red-900/40 text-red-300 font-medium' : 'bg-gray-700 text-gray-400'}`}>
      {method}
    </span>
  );
}

export function PSPComparison() {
  const [search, setSearch] = useState('');
  const [categoryFilter, setCategoryFilter] = useState<string>('All');
  const [epsOnly, setEpsOnly] = useState(false);
  const [ossOnly, setOssOnly] = useState(false);
  const [sortCol, setSortCol] = useState<string>('score');
  const [sortAsc, setSortAsc] = useState(false);
  const [weights, setWeights] = useState(DEFAULT_WEIGHTS);

  const scored = useMemo(() =>
    PROVIDERS.map((p) => ({ ...p, score: computeScore(p, weights) })),
    [weights],
  );

  const filtered = useMemo(() => {
    let list = scored;
    if (search) {
      const q = search.toLowerCase();
      list = list.filter((p) => p.name.toLowerCase().includes(q) || p.hq.toLowerCase().includes(q));
    }
    if (categoryFilter !== 'All') list = list.filter((p) => p.category === categoryFilter);
    if (epsOnly) list = list.filter((p) => p.keyATMethods.includes('EPS'));
    if (ossOnly) list = list.filter((p) => p.category === 'Orchestrator (Open Source)');
    return list;
  }, [scored, search, categoryFilter, epsOnly, ossOnly]);

  const sorted = useMemo(() => {
    const list = [...filtered];
    list.sort((a, b) => {
      let va: number | string = 0, vb: number | string = 0;
      switch (sortCol) {
        case 'name': va = a.name; vb = b.name; break;
        case 'methods': va = a.methodCount; vb = b.methodCount; break;
        case 'score': va = a.score; vb = b.score; break;
        case 'support': va = a.supportScore; vb = b.supportScore; break;
        case 'fees': va = a.feeScore; vb = b.feeScore; break;
        default: va = a.score; vb = b.score;
      }
      if (typeof va === 'string') return sortAsc ? va.localeCompare(vb as string) : (vb as string).localeCompare(va);
      return sortAsc ? va - (vb as number) : (vb as number) - va;
    });
    return list;
  }, [filtered, sortCol, sortAsc]);

  const ranked = useMemo(() =>
    [...scored].sort((a, b) => b.score - a.score),
    [scored],
  );

  function toggleSort(col: string) {
    if (sortCol === col) setSortAsc(!sortAsc);
    else { setSortCol(col); setSortAsc(false); }
  }

  function SortHeader({ col, children }: { col: string; children: React.ReactNode }) {
    return (
      <th
        className="px-3 py-2 text-left text-xs font-medium text-gray-400 cursor-pointer hover:text-gray-200 whitespace-nowrap"
        onClick={() => toggleSort(col)}
      >
        {children} {sortCol === col ? (sortAsc ? '\u25B2' : '\u25BC') : ''}
      </th>
    );
  }

  function updateWeight(key: keyof typeof DEFAULT_WEIGHTS, val: number) {
    setWeights((prev) => ({ ...prev, [key]: val }));
  }

  return (
    <main className="flex-1 px-4 sm:px-6">
      <div className="max-w-7xl mx-auto py-6 space-y-6">
        {/* Header */}
        <div>
          <h2 className="text-xl font-semibold text-gray-200">Austria PSP Comparison</h2>
          <p className="text-sm text-gray-400 mt-1">
            Compare payment providers relevant to the Austrian market. Fees, uptime, and auth rates are indicative — verify with each provider.
          </p>
          <p className="text-xs text-gray-600 mt-1">Last updated: April 2026</p>
        </div>

        {/* Filters */}
        <div className="flex flex-wrap gap-3 items-center">
          <input
            type="text"
            placeholder="Search providers..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="bg-gray-800 border border-gray-700 rounded-md px-3 py-1.5 text-sm text-gray-200 placeholder-gray-500 w-48"
          />
          <select
            value={categoryFilter}
            onChange={(e) => setCategoryFilter(e.target.value)}
            className="bg-gray-800 border border-gray-700 rounded-md px-3 py-1.5 text-sm text-gray-200"
          >
            <option value="All">All Categories</option>
            {CATEGORIES.map((c) => <option key={c} value={c}>{c}</option>)}
          </select>
          <label className="flex items-center gap-1.5 text-xs text-gray-400 cursor-pointer">
            <input type="checkbox" checked={epsOnly} onChange={(e) => setEpsOnly(e.target.checked)} className="rounded" />
            EPS support
          </label>
          <label className="flex items-center gap-1.5 text-xs text-gray-400 cursor-pointer">
            <input type="checkbox" checked={ossOnly} onChange={(e) => setOssOnly(e.target.checked)} className="rounded" />
            Open source only
          </label>
        </div>

        {/* Table */}
        <div className="overflow-x-auto rounded-lg border border-gray-700">
          <table className="w-full text-sm">
            <thead className="bg-gray-800 sticky top-0 z-10">
              <tr>
                <SortHeader col="name">Provider</SortHeader>
                <th className="px-3 py-2 text-left text-xs font-medium text-gray-400">Category</th>
                <th className="px-3 py-2 text-left text-xs font-medium text-gray-400">HQ</th>
                <SortHeader col="methods">Methods</SortHeader>
                <th className="px-3 py-2 text-left text-xs font-medium text-gray-400">Key AT Methods</th>
                <SortHeader col="fees">Fees</SortHeader>
                <th className="px-3 py-2 text-left text-xs font-medium text-gray-400">Tech Stack</th>
                <th className="px-3 py-2 text-left text-xs font-medium text-gray-400">Migration</th>
                <th className="px-3 py-2 text-left text-xs font-medium text-gray-400">GDPR</th>
                <SortHeader col="support">Support</SortHeader>
                <SortHeader col="score">Score</SortHeader>
              </tr>
            </thead>
            <tbody>
              {sorted.map((p, i) => (
                <tr key={p.name} className={`border-t border-gray-800 ${i % 2 === 0 ? 'bg-gray-900' : 'bg-gray-900/50'} hover:bg-gray-800/50`}>
                  <td className="px-3 py-2.5 font-medium text-gray-200 whitespace-nowrap">
                    <a href={p.website} target="_blank" rel="noopener noreferrer" className="hover:text-blue-400">
                      {p.name}
                    </a>
                    {p.github && (
                      <a href={p.github} target="_blank" rel="noopener noreferrer" className="ml-1 text-xs text-gray-600 hover:text-gray-400" title={`${p.language} \u2022 ${p.stars} \u2022 ${p.license}`}>
                        GH
                      </a>
                    )}
                  </td>
                  <td className="px-3 py-2.5 text-xs text-gray-400">{p.category}</td>
                  <td className="px-3 py-2.5 text-xs text-gray-400 whitespace-nowrap">{p.hq}</td>
                  <td className="px-3 py-2.5 text-xs text-gray-300">{p.methodCount}</td>
                  <td className="px-3 py-2.5">
                    <div className="flex flex-wrap gap-1">
                      {p.keyATMethods.map((m) => <MethodBadge key={m} method={m} />)}
                    </div>
                  </td>
                  <td className="px-3 py-2.5 text-xs text-gray-400 whitespace-nowrap" title={p.feesSource}>{p.fees}</td>
                  <td className="px-3 py-2.5 text-xs text-gray-400">{p.techStack}</td>
                  <td className="px-3 py-2.5 text-xs text-gray-400" title={p.migrationNote}>
                    <span className={p.migrationEase === 'High' ? 'text-green-400' : p.migrationEase === 'Low' ? 'text-red-400' : 'text-yellow-400'}>
                      {p.migrationEase}
                    </span>
                  </td>
                  <td className="px-3 py-2.5"><GDPRBadge gdpr={p.gdpr} note={p.gdprNote} /></td>
                  <td className="px-3 py-2.5 text-xs text-gray-300" title={p.supportSource}>
                    {p.supportScore > 0 ? '\u2605'.repeat(p.supportScore) + '\u2606'.repeat(5 - p.supportScore) : '\u2014'}
                  </td>
                  <td className="px-3 py-2.5">
                    <span className={`text-sm font-semibold ${p.score >= 70 ? 'text-green-400' : p.score >= 50 ? 'text-yellow-400' : 'text-gray-400'}`}>
                      {p.score}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Ranking Panel */}
        <div className="bg-gray-800 border border-gray-700 rounded-lg p-5">
          <h3 className="text-lg font-semibold text-gray-200 mb-4">Ranking</h3>

          {/* Weight sliders */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-5">
            {([
              ['atMethods', 'AT Methods'],
              ['fees', 'Fees'],
              ['tech', 'Tech/DX'],
              ['migration', 'Migration'],
              ['gdpr', 'GDPR'],
              ['uptime', 'Uptime'],
              ['support', 'Support'],
              ['scale', 'Scale'],
            ] as [keyof typeof DEFAULT_WEIGHTS, string][]).map(([key, label]) => (
              <div key={key}>
                <label className="text-xs text-gray-400 flex justify-between">
                  <span>{label}</span>
                  <span>{weights[key]}</span>
                </label>
                <input
                  type="range"
                  min={0}
                  max={50}
                  value={weights[key]}
                  onChange={(e) => updateWeight(key, Number(e.target.value))}
                  className="w-full h-1 mt-1 accent-blue-500"
                />
              </div>
            ))}
          </div>

          {/* Top ranked */}
          <div className="space-y-2">
            {ranked.slice(0, 10).map((p, i) => (
              <div key={p.name} className="flex items-center gap-3 py-2 border-b border-gray-700/50">
                <span className={`text-sm font-bold w-6 text-center ${i < 3 ? 'text-yellow-400' : 'text-gray-500'}`}>
                  {i + 1}
                </span>
                <div className="flex-1 min-w-0">
                  <span className="text-sm text-gray-200">{p.name}</span>
                  <span className="text-xs text-gray-500 ml-2">{p.category}</span>
                  <div className="flex gap-1 mt-0.5">
                    {p.strengths.map((s) => (
                      <span key={s} className="text-[10px] bg-green-900/30 text-green-400 px-1.5 py-0.5 rounded">{s}</span>
                    ))}
                    <span className="text-[10px] bg-red-900/30 text-red-400 px-1.5 py-0.5 rounded">{p.weakness}</span>
                  </div>
                </div>
                <span className={`text-lg font-bold ${p.score >= 70 ? 'text-green-400' : p.score >= 50 ? 'text-yellow-400' : 'text-gray-400'}`}>
                  {p.score}
                </span>
              </div>
            ))}
          </div>
        </div>

        {/* Methodology */}
        <div className="text-xs text-gray-600 space-y-1">
          <p><strong className="text-gray-500">Methodology:</strong> Score is a weighted sum of: AT local method coverage (EPS, Klarna, SEPA, invoice), fees (lower = better), tech modernity/DX, migration ease, GDPR compliance, uptime/reliability, support quality, and scale/coverage. Adjust weights with the sliders above.</p>
          <p><strong className="text-gray-500">Sources:</strong> Provider websites, Capterra, G2, Trustpilot, GitHub, and public documentation. Fees and features are indicative and vary by merchant profile.</p>
          <p><strong className="text-gray-500">Disclaimer:</strong> This page is informational, not financial or legal advice. Verify all claims with providers before making decisions.</p>
        </div>
      </div>
    </main>
  );
}
