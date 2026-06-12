import { Product, Customer, Visit, Order, LoadingRequest, InventoryClosingItem } from './types';

export const INITIAL_PRODUCTS: Product[] = [
  {
    id: 'p1',
    name: 'Hydrating Serum 50ml',
    sku: 'HYD-50-SRM',
    price: 120,
    stock: 145,
    status: 'IN STOCK'
  },
  {
    id: 'p2',
    name: 'Vitamin C Booster 30ml',
    sku: 'VTC-30-BST',
    price: 95,
    stock: 12,
    status: 'LOW STOCK'
  },
  {
    id: 'p3',
    name: 'Night Repair Cream 100ml',
    sku: 'NRC-100-JAR',
    price: 180,
    stock: 88,
    status: 'IN STOCK'
  },
  {
    id: 'p4',
    name: 'Daily Cleanser 200ml',
    sku: 'CLN-200-DLY',
    price: 65,
    stock: 4,
    status: 'CRITICAL'
  },
  {
    id: 'p5',
    name: 'Industrial Lubricant 5L',
    sku: 'LUB-5L-892',
    price: 145.00,
    stock: 42,
    status: 'IN STOCK'
  },
  {
    id: 'p6',
    name: 'Heavy Duty Filter',
    sku: 'FLT-HD-001',
    price: 85.50,
    stock: 18,
    status: 'IN STOCK'
  },
  {
    id: 'p7',
    name: 'Standard O-Ring Pack',
    sku: 'ORG-STD-99',
    price: 25.00,
    stock: 0,
    status: 'OUT OF STOCK'
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
    total: 825.13,
    status: 'To Deliver and Bill',
    items: [
      { name: 'Industrial Lubricant 5L', qty: 2, price: 145 },
      { name: 'Heavy Duty Filter', qty: 5, price: 85.50 }
    ]
  },
  {
    id: 'SAL-ORD-2026-04193',
    customerId: 'CUS-2026-00410',
    customerName: 'Rawabi Supermarket',
    date: '09 Jun 2026',
    total: 480.00,
    status: 'To Deliver and Bill',
    items: [
      { name: 'Night Repair Cream 100ml', qty: 2, price: 180 },
      { name: 'Vitamin C Booster 30ml', qty: 1, price: 95 }
    ]
  }
];

export const INITIAL_LOADING_REQUESTS: LoadingRequest[] = [
  {
    id: 'PR-2026-00488',
    warehouse: 'Sadus Stock Riyadh - AMIC',
    date: '06 Jun 2026',
    items: 12,
    status: 'Requested'
  },
  {
    id: 'PR-2026-00487',
    warehouse: 'North Warehouse - DMM',
    date: '05 Jun 2026',
    items: 45,
    status: 'Requested'
  }
];

export const INITIAL_CLOSING_INVENTORY: InventoryClosingItem[] = [
  {
    code: 'SKU-8021',
    description: 'Standard Widget A',
    openingQty: 6400,
    currentQty: 6400
  },
  {
    code: 'SKU-8022',
    description: 'Premium Widget B',
    openingQty: 1200,
    currentQty: 1200
  },
  {
    code: 'SKU-8025',
    description: 'Bulk Pack C',
    openingQty: 450,
    currentQty: 450
  }
];
