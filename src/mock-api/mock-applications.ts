import { MerchantApplication, ApplicationStatus, BusinessType } from '../app/core/models/application.model';

const statuses: ApplicationStatus[] = ['DRAFT', 'SUBMITTED', 'UNDER_REVIEW', 'APPROVED', 'REJECTED', 'ON_HOLD'];
const businessTypes: BusinessType[] = ['SOLE_PROPRIETORSHIP', 'PARTNERSHIP', 'LLC', 'CORPORATION', 'NON_PROFIT'];

const nepalMerchants = [
  { name: 'Himalayan Trade House',        city: 'Kathmandu',   state: 'Bagmati' },
  { name: 'Everest Digital Stores',       city: 'Pokhara',     state: 'Gandaki' },
  { name: 'Lumbini Goods & Services',     city: 'Butwal',      state: 'Lumbini' },
  { name: 'Pashupatinath Merchants',      city: 'Kathmandu',   state: 'Bagmati' },
  { name: 'Annapurna Trading Co.',        city: 'Pokhara',     state: 'Gandaki' },
  { name: 'Boudha Handicrafts Pvt. Ltd.', city: 'Kathmandu',  state: 'Bagmati' },
  { name: 'Mustang Agro Traders',         city: 'Jomsom',      state: 'Gandaki' },
  { name: 'Chitwan Safari Retail',        city: 'Bharatpur',   state: 'Bagmati' },
  { name: 'Janakpur Silk Emporium',       city: 'Janakpur',    state: 'Madhesh' },
  { name: 'Pokhara Lakeside Commerce',    city: 'Pokhara',     state: 'Gandaki' },
  { name: 'Thamel Gift & Craft House',    city: 'Kathmandu',   state: 'Bagmati' },
  { name: 'Indra Chowk Textile Traders', city: 'Kathmandu',   state: 'Bagmati' },
  { name: 'Birgunj Border Trade Pvt.',    city: 'Birgunj',     state: 'Madhesh' },
  { name: 'Biratnagar Export House',      city: 'Biratnagar',  state: 'Koshi' },
  { name: 'Dharan Electronics Hub',       city: 'Dharan',      state: 'Koshi' },
  { name: 'Narayangadh Market Co.',       city: 'Bharatpur',   state: 'Bagmati' },
  { name: 'Hetauda Industrial Goods',     city: 'Hetauda',     state: 'Bagmati' },
  { name: 'Nepalgunj Cross Trade',        city: 'Nepalgunj',   state: 'Lumbini' },
  { name: 'Rupandehi Agri Merchants',     city: 'Bhairahawa',  state: 'Lumbini' },
  { name: 'Palpa Dhaka Weavers Pvt.',     city: 'Tansen',      state: 'Lumbini' },
  { name: 'Koshi Riverine Traders',       city: 'Biratnagar',  state: 'Koshi' },
  { name: 'Ilam Tea & Spice House',       city: 'Ilam',        state: 'Koshi' },
  { name: 'Taplejung Cardamom Traders',   city: 'Taplejung',   state: 'Koshi' },
  { name: 'Solukhumbu Alpine Store',      city: 'Namche',      state: 'Koshi' },
  { name: 'Dolpa Himalayan Products',     city: 'Dunai',       state: 'Karnali' },
  { name: 'Jumla Apple Cooperative',      city: 'Jumla',       state: 'Karnali' },
  { name: 'Surkhet Valley Commerce',      city: 'Surkhet',     state: 'Karnali' },
  { name: 'Dang Grain & Feed Merchants',  city: 'Tulsipur',    state: 'Lumbini' },
  { name: 'Kapilvastu Heritage Crafts',   city: 'Taulihawa',   state: 'Lumbini' },
  { name: 'Gulmi Handloom Traders',       city: 'Tamghas',     state: 'Lumbini' },
  { name: 'Syangja Nursery & Horticulture', city: 'Syangja',   state: 'Gandaki' },
  { name: 'Lamjung Herbal Products',      city: 'Besisahar',   state: 'Gandaki' },
  { name: 'Gorkha Organic Farm Pvt.',     city: 'Gorkha',      state: 'Gandaki' },
  { name: 'Kaski Dairy Cooperative',      city: 'Pokhara',     state: 'Gandaki' },
  { name: 'Parbat Fruit Growers Co.',     city: 'Kushma',      state: 'Gandaki' },
  { name: 'Nawalpur Vegetable Market',    city: 'Kawasoti',    state: 'Gandaki' },
  { name: 'Chitwan Timber & Hardware',    city: 'Bharatpur',   state: 'Bagmati' },
  { name: 'Makwanpur Mining Supplies',    city: 'Hetauda',     state: 'Bagmati' },
  { name: 'Kavrepalanchok Stone Works',   city: 'Dhulikhel',   state: 'Bagmati' },
  { name: 'Sindhupalchok Metal Craft',    city: 'Chautara',    state: 'Bagmati' },
  { name: 'Nuwakot Rice Millers',         city: 'Bidur',       state: 'Bagmati' },
  { name: 'Rasuwa Himalayan Herbs',       city: 'Dhunche',     state: 'Bagmati' },
  { name: 'Dolakha Cheese Factory',       city: 'Charikot',    state: 'Bagmati' },
  { name: 'Ramechhap Honey Traders',      city: 'Manthali',    state: 'Bagmati' },
  { name: 'Okhaldhunga Spice Merchants',  city: 'Okhaldhunga', state: 'Koshi' },
  { name: 'Khotang Bamboo Crafts',        city: 'Diktel',      state: 'Koshi' },
  { name: 'Bhojpur Khukuri House',        city: 'Bhojpur',     state: 'Koshi' },
  { name: 'Terhathum Coffee Growers',     city: 'Myanglung',   state: 'Koshi' },
  { name: 'Sankhuwasabha Mineral Trade',  city: 'Chainpur',    state: 'Koshi' },
  { name: 'Panchthar Silk Road Traders',  city: 'Phidim',      state: 'Koshi' },
];

const nepalBanks = [
  'Nepal Rastra Bank',
  'Nepal Investment Mega Bank',
  'Nabil Bank Limited',
  'Everest Bank Limited',
  'NMB Bank Limited',
  'Prabhu Bank Limited',
  'Kumari Bank Limited',
  'Machhapuchchhre Bank',
];

function pad(n: number): string {
  return String(n).padStart(4, '0');
}

function daysAgo(n: number): string {
  const d = new Date();
  d.setDate(d.getDate() - n);
  return d.toISOString();
}

function nepaliTaxId(i: number): string {
  return `${String(300000000 + i * 7).slice(0, 9)}`;
}

export const MOCK_APPLICATIONS: MerchantApplication[] = nepalMerchants.map((merchant, i) => {
  const id = `app-${pad(i + 1)}`;
  const status = statuses[i % statuses.length];
  const assignedReviewer = ['SUBMITTED', 'UNDER_REVIEW', 'APPROVED', 'REJECTED', 'ON_HOLD'].includes(status)
    ? 'usr-002'
    : undefined;

  return {
    id,
    status,
    createdBy: 'usr-001',
    assignedReviewer,
    businessInfo: {
      legalName:         merchant.name,
      tradeName:         merchant.name.split(' ')[0] + ' Traders',
      businessType:      businessTypes[i % businessTypes.length],
      taxId:             nepaliTaxId(i),
      incorporationDate: daysAgo(365 + i * 5),
      website:           `https://www.${merchant.name.toLowerCase().replace(/[^a-z0-9]/g, '')}.com.np`,
      description:       `${merchant.name} is a registered Nepali merchant based in ${merchant.city} seeking payment processing services for domestic and cross-border transactions.`,
    },
    contactInfo: {
      ownerName:  `व्यवसाय प्रमुख ${i + 1}`,
      ownerEmail: `contact@${merchant.name.split(' ')[0].toLowerCase()}.com.np`,
      ownerPhone: `+977-${String(9800000000 + i * 12345).slice(0, 10)}`,
      address: {
        street:     `${i + 1} ${merchant.city} Sadak`,
        city:       merchant.city,
        state:      merchant.state,
        postalCode: String(44600 + i * 100),
        country:    'NP',
      },
    },
    bankingInfo: {
      bankName:      nepalBanks[i % nepalBanks.length],
      accountNumber: String(1000000000 + i * 98765432).slice(0, 12),
      routingNumber: String(100000000 + i * 111111).slice(0, 9),
      monthlyVolume: (i + 1) * 50000,
      averageTicket: 500 + (i % 10) * 250,
    },
    riskHistory: status === 'APPROVED' || status === 'REJECTED' ? [
      {
        id:           `risk-${pad(i + 1)}-1`,
        decision:     status === 'APPROVED' ? 'APPROVE' : 'REJECT',
        notes:        status === 'APPROVED'
          ? 'All PAN/VAT documents verified. Business registration confirmed with OCR Nepal. Low risk.'
          : 'Insufficient documentation. PAN certificate not provided.',
        reviewerId:   'usr-002',
        reviewerName: 'Rajan Shrestha',
        createdAt:    daysAgo(i + 1),
      },
    ] : [],
    createdAt: daysAgo(60 + i * 2),
    updatedAt: daysAgo(i + 1),
  };
});
