export interface Product {
  id: string;
  name: string;
  sku: string;
  stock: number;
  price: number;
  status: 'IN STOCK' | 'LOW STOCK' | 'CRITICAL' | 'OUT OF STOCK';
  image?: string;
}

export interface Customer {
  id: string;
  name: string;
  phone: string;
  lat: number;
  lng: number;
  buildingNumber: string;
  type: string;
  group: string;
  subGroup: string;
  idType: string;
  idNumber: string;
  status: 'ACTIVE ACCOUNT' | 'PENDING' | 'INACTIVE';
}

export interface Visit {
  id: string;
  customer: Customer;
  time: string;
  status: 'PENDING' | 'COMPLETED' | 'IN_PROGRESS';
  completedTime?: string;
  distanceKm?: number;
  geofenceM: number;
}

export interface OrderItem {
  product: Product;
  quantity: number;
}

export interface Order {
  id: string;
  customerName: string;
  customerId: string;
  date: string;
  total: number;
  status: 'To Deliver and Bill' | 'Completed' | 'Draft';
  items?: { name: string; qty: number; price: number }[];
}

export interface LoadingRequest {
  id: string;
  warehouse: string;
  date: string;
  items: number;
  status: 'Requested' | 'Approved' | 'Loaded';
}

export interface InventoryClosingItem {
  code: string;
  description: string;
  openingQty: number;
  currentQty: number;
}

export type ViewState = 
  | 'login'
  | 'dashboard'
  | 'settings'
  | 'van_stock'
  | 'loading_requests'
  | 'daily_closing'
  | 'today_route'
  | 'add_customer'
  | 'create_order'
  | 'sales_invoice'
  | 'invoice_viewer'
  | 'reports';
