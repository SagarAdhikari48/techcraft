import { MerchantApplication, ApplicationStatus, BusinessType } from '../app/core/models/application.model';

const statuses: ApplicationStatus[] = ['DRAFT', 'SUBMITTED', 'UNDER_REVIEW', 'APPROVED', 'REJECTED', 'ON_HOLD'];
const businessTypes: BusinessType[] = ['SOLE_PROPRIETORSHIP', 'PARTNERSHIP', 'LLC', 'CORPORATION', 'NON_PROFIT'];

const businessNames = [
  'Apex Retail Solutions', 'Blue Ridge Merchants', 'Cedar Point Commerce', 'Delta Trade Co',
  'Ember Digital Goods', 'Falcon Payments Inc', 'Granite City Store', 'Harbor View Shops',
  'Ironwood Markets', 'Jasper Lane Boutique', 'Keystone Vendors', 'Lakeside Traders',
  'Maple Grove Goods', 'Northstar Commerce', 'Oakfield Retail', 'Pacific Rim Merchants',
  'Quartz Peak Stores', 'Redwood Digital', 'Summit Trade Group', 'Tidewater Merchants',
  'Urban Craft Co', 'Valley Goods Inc', 'Westside Commerce', 'Xcel Trade Partners',
  'Yellowstone Retail', 'Zenith Merchant Group', 'Cascade Payments', 'Driftwood Shops',
  'Echo Valley Store', 'Firestorm Commerce', 'Glacier Point Goods', 'Highline Traders',
  'Indigo Market Co', 'Junction Merchants', 'Kinetic Retail', 'Lakeview Commerce',
  'Momentum Trade', 'Nova Commerce Inc', 'Orbit Digital Stores', 'Pinnacle Merchants',
  'Quantum Retail', 'Riverside Goods', 'Skyline Commerce', 'Terranova Trade',
  'Unity Merchant Co', 'Vantage Retail Inc', 'Wavelength Goods', 'Xenon Commerce',
  'Yonder Merchants', 'Zephyr Trade Co',
];

function pad(n: number): string {
  return String(n).padStart(4, '0');
}

function daysAgo(n: number): string {
  const d = new Date();
  d.setDate(d.getDate() - n);
  return d.toISOString();
}

export const MOCK_APPLICATIONS: MerchantApplication[] = businessNames.map((name, i) => {
  const id = `app-${pad(i + 1)}`;
  const status = statuses[i % statuses.length];
  const createdBy = i % 3 === 0 ? 'usr-001' : i % 3 === 1 ? 'usr-001' : 'usr-001';
  const assignedReviewer = ['SUBMITTED', 'UNDER_REVIEW', 'APPROVED', 'REJECTED', 'ON_HOLD'].includes(status)
    ? 'usr-002'
    : undefined;

  return {
    id,
    status,
    createdBy,
    assignedReviewer,
    businessInfo: {
      legalName: name,
      tradeName: `${name.split(' ')[0]} Trading`,
      businessType: businessTypes[i % businessTypes.length],
      taxId: `${String(10 + i).padStart(2, '0')}-${String(1000000 + i * 7).slice(0, 7)}`,
      incorporationDate: daysAgo(365 + i * 3),
      website: `https://www.${name.toLowerCase().replace(/\s+/g, '')}.com`,
      description: `${name} is a registered merchant seeking payment processing services.`,
    },
    contactInfo: {
      ownerName: `Owner ${i + 1}`,
      ownerEmail: `owner${i + 1}@${name.split(' ')[0].toLowerCase()}.com`,
      ownerPhone: `+1-555-${String(1000 + i).padStart(4, '0')}`,
      address: {
        street: `${100 + i} Commerce Street`,
        city: ['New York', 'Los Angeles', 'Chicago', 'Houston', 'Phoenix'][i % 5],
        state: ['NY', 'CA', 'IL', 'TX', 'AZ'][i % 5],
        postalCode: String(10001 + i * 11),
        country: 'US',
      },
    },
    bankingInfo: {
      bankName: ['Chase Bank', 'Bank of America', 'Wells Fargo', 'Citibank', 'US Bank'][i % 5],
      accountNumber: String(1000000000 + i * 123456789).slice(0, 10),
      routingNumber: String(110000000 + i * 7).slice(0, 9),
      monthlyVolume: (i + 1) * 5000,
      averageTicket: 50 + (i % 10) * 25,
    },
    riskHistory: status === 'APPROVED' || status === 'REJECTED' ? [
      {
        id: `risk-${pad(i + 1)}-1`,
        decision: status === 'APPROVED' ? 'APPROVE' : 'REJECT',
        notes: status === 'APPROVED'
          ? 'All documents verified. Low risk profile.'
          : 'Insufficient documentation provided.',
        reviewerId: 'usr-002',
        reviewerName: 'Jordan Lee',
        createdAt: daysAgo(i + 1),
      },
    ] : [],
    createdAt: daysAgo(60 + i * 2),
    updatedAt: daysAgo(i + 1),
  };
});
