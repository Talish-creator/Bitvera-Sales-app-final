import { Product, Customer, Visit, Order, LoadingRequest, InventoryClosingItem } from './types';

export const INITIAL_PRODUCTS: Product[] = [
  {
    id: 'p1',
    name: 'ALMAS 1.5 L*6',
    sku: 'ALM-1.5L-6',
    price: 6.50,
    stock: 3028,
    status: 'IN STOCK'
  },
  {
    id: 'p2',
    name: 'ALMAS 500 ML*12',
    sku: 'ALM-500ML-12',
    price: 7.00,
    stock: 3041,
    status: 'IN STOCK'
  },
  {
    id: 'p3',
    name: 'ROMANA 1.5ML*6',
    sku: 'ROM-1.5L-6',
    price: 6.50,
    stock: 122,
    status: 'IN STOCK'
  },
  {
    id: 'p4',
    name: 'DEAL 1.5 ML*6',
    sku: 'DEL-1.5L-6',
    price: 5.50,
    stock: 68,
    status: 'IN STOCK'
  },
  {
    id: 'p5',
    name: 'DOHAR 1.5 ML*6',
    sku: 'DOH-1.5L-6',
    price: 6.00,
    stock: 446,
    status: 'IN STOCK'
  },
  {
    id: 'p6',
    name: 'HABARI 1.5ML*6: HABARI BOPP W...',
    sku: 'HAB-1.5L-6',
    price: 6.50,
    stock: 6,
    status: 'CRITICAL'
  },
  {
    id: 'p7',
    name: 'SIBLA 1.5ML*6',
    sku: 'SIB-1.5L-6',
    price: 5.50,
    stock: 41,
    status: 'IN STOCK'
  },
  {
    id: 'p8',
    name: 'ONMART 1.5L*6',
    sku: 'ONM-1.5L-6',
    price: 6.00,
    stock: 32,
    status: 'LOW STOCK'
  },
  {
    id: 'p9',
    name: 'DAILY 1.5ML*6',
    sku: 'DLY-1.5L-6',
    price: 5.50,
    stock: 210,
    status: 'IN STOCK'
  },
  {
    id: 'p10',
    name: 'ALIF 1.5 ML*6',
    sku: 'ALF-1.5L-6',
    price: 6.00,
    stock: 11,
    status: 'LOW STOCK'
  },
  {
    id: 'p11',
    name: 'AHLIYA 1.5L*6',
    sku: 'AHL-1.5L-6',
    price: 6.00,
    stock: 21,
    status: 'LOW STOCK'
  }
];

export const INITIAL_CUSTOMERS: Customer[] = [
  {
    id: 'CUS-8921',
    name: 'Al Safa Supermarket',
    phone: '0501234567',
    lat: 24.814981,
    lng: 46.79375,
    buildingNumber: '1098',
    type: 'Individual',
    group: '03-Home Delivery',
    subGroup: '30-House',
    idType: 'Iqama',
    idNumber: '2432920234',
    status: 'ACTIVE ACCOUNT'
  },
  {
    id: 'CUS-9045',
    name: 'tamoinat alotaiba',
    phone: '0539876543',
    lat: 24.8150028,
    lng: 46.7938998,
    buildingNumber: '2563',
    type: 'Individual',
    group: '03-Home Delivery',
    subGroup: '30-House',
    idType: 'Iqama',
    idNumber: '2828605058',
    status: 'ACTIVE ACCOUNT'
  },
  {
    id: 'CUS-4421',
    name: 'Panda Hypermarket',
    phone: '0547778899',
    lat: 24.82114,
    lng: 46.78502,
    buildingNumber: '7645',
    type: 'Corporate',
    group: '01-Key Accounts',
    subGroup: '10-Hypermarket',
    idType: 'CR Number',
    idNumber: '1010488920',
    status: 'ACTIVE ACCOUNT'
  },
  {
    id: 'TC-1100',
    name: 'test Customers',
    phone: '0500000000',
    lat: 24.8150028,
    lng: 46.7938998,
    buildingNumber: '2563',
    type: 'Individual',
    group: '03-Home Delivery',
    subGroup: '30-House',
    idType: 'Iqama',
    idNumber: '2828605058',
    status: 'ACTIVE ACCOUNT'
  }
];

export const INITIAL_VISITS: Visit[] = [
  {
    id: 'v1',
    customer: INITIAL_CUSTOMERS[0], // Al Safa
    time: '08:30 AM',
    status: 'COMPLETED',
    completedTime: '08:31 AM',
    distanceKm: 0.12,
    geofenceM: 200
  },
  {
    id: 'v2',
    customer: INITIAL_CUSTOMERS[1], // tamoinat alotaiba
    time: '10:00 AM',
    status: 'PENDING',
    distanceKm: 29.61,
    geofenceM: 200
  },
  {
    id: 'v3',
    customer: INITIAL_CUSTOMERS[2], // Panda
    time: '11:30 AM',
    status: 'PENDING',
    distanceKm: 4.8,
    geofenceM: 200
  }
];

export const INITIAL_ORDERS: Order[] = [
  {
    id: 'SAL-ORD-2026-04219',
    customerId: 'CUS-2026-00352',
    customerName: 'Alandalus Cent',
    date: '10 Jun 2026',
    total: 454.25,
    status: 'To Deliver and Bill',
    items: [
      { name: 'ALMAS 1.5 L*6', qty: 50, price: 6.50 },
      { name: 'ALMAS 500 ML*12', qty: 10, price: 7.00 }
    ]
  },
  {
    id: 'SAL-ORD-2026-04193',
    customerId: 'CUS-2026-00410',
    customerName: 'Rawabi Supermarket',
    date: '09 Jun 2026',
    total: 281.75,
    status: 'To Deliver and Bill',
    items: [
      { name: 'DOHAR 1.5 ML*6', qty: 30, price: 6.00 },
      { name: 'ROMANA 1.5ML*6', qty: 10, price: 6.50 }
    ]
  }
];

export const INITIAL_LOADING_REQUESTS: LoadingRequest[] = [
  {
    id: 'PR-2026-00488',
    warehouse: 'Finished Goods Central Warehouse',
    date: '06 Jun 2026',
    items: 500,
    status: 'Requested'
  },
  {
    id: 'PR-2026-00487',
    warehouse: 'Sadus Stock Riyadh - AMIC',
    date: '05 Jun 2026',
    items: 250,
    status: 'Requested'
  }
];

export const INITIAL_CLOSING_INVENTORY: InventoryClosingItem[] = [
  {
    code: 'ALMAS 1.5 L*6',
    description: 'ALMAS Water 1.5L x 6 Pack',
    openingQty: 3028,
    currentQty: 3028
  },
  {
    code: 'ALMAS 500 ML*12',
    description: 'ALMAS Water 500ml x 12 Pack',
    openingQty: 3041,
    currentQty: 3041
  },
  {
    code: 'DOHAR 1.5 ML*6',
    description: 'DOHAR Water 1.5L x 6 Pack',
    openingQty: 446,
    currentQty: 446
  },
  {
    code: 'DAILY 1.5ML*6',
    description: 'DAILY Water 1.5L x 6 Pack',
    openingQty: 210,
    currentQty: 210
  },
  {
    code: 'ROMANA 1.5ML*6',
    description: 'ROMANA Water 1.5L x 6 Pack',
    openingQty: 122,
    currentQty: 122
  }
];
