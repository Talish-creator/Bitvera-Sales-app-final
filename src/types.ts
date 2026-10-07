export interface Product {
  id: string;
  name: string;
  sku: string;
  stock: number;
  price: number;
  costPrice?: number;
  category?: string;
  warehouse?: string;
  barcode?: string;
  erpCode?: string;
  minStock?: number;
  status: 'IN STOCK' | 'LOW STOCK' | 'CRITICAL' | 'OUT OF STOCK';
  image?: string;
}

export interface Customer {
  id: string;
  name: string;
  phone: string;
  email?: string;
  lat: number;
  lng: number;
  buildingNumber: string;
  type: string;
  group: string;
  subGroup: string;
  idType: string;
  idNumber: string;
  creditLimit?: number;
  territory?: string;
  assignedRep?: string;
  createdAt?: string;
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
  notes?: string;
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
  paymentMethod?: 'Cash' | 'Bank Transfer' | 'Split' | string;
  cashReceived?: number;
  bankReceived?: number;
  subtotal?: number;
  tax?: number;
  discountAmount?: number;
  discountPercent?: number;
  isApproved?: boolean;
  approvalStatus?: 'APPROVED' | 'PENDING_APPROVAL' | 'REJECTED';
  salesperson?: string;
  territory?: string;
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

// ---------------------------------------------------------------------------
// CRM & PIPELINE
// ---------------------------------------------------------------------------
export type PipelineStage = 
  | 'LEAD'
  | 'QUALIFIED'
  | 'VISIT_SCHEDULED'
  | 'PROPOSAL'
  | 'NEGOTIATION'
  | 'ORDER'
  | 'WON'
  | 'LOST';

export interface Lead {
  id: string;
  name: string;
  company: string;
  phone: string;
  email: string;
  source: 'Referral' | 'Cold Call' | 'Inbound' | 'Exhibition' | 'Website' | string;
  territory: string;
  assignedRep: string;
  potentialValue: number;
  probability: number;
  stage: PipelineStage;
  status: 'OPEN' | 'CONVERTED' | 'DISQUALIFIED';
  notes: string;
  nextAction: string;
  createdAt: string;
  convertedCustomerId?: string;
}

// ---------------------------------------------------------------------------
// TASKS & REMINDERS
// ---------------------------------------------------------------------------
export interface Task {
  id: string;
  title: string;
  customerId?: string;
  customerName?: string;
  owner: string;
  dueDate: string;
  priority: 'URGENT' | 'HIGH' | 'MEDIUM' | 'LOW';
  status: 'PENDING' | 'IN_PROGRESS' | 'COMPLETED' | 'CANCELLED';
  reminderTime?: string;
  notes?: string;
  createdAt: string;
}

export interface SmartReminder {
  id: string;
  type: 'INVOICE_DUE' | 'CUSTOMER_INACTIVE' | 'VISIT_UPCOMING' | 'LOW_STOCK' | 'SYNC_PENDING';
  title: string;
  description: string;
  severity: 'CRITICAL' | 'WARNING' | 'INFO';
  timestamp: string;
  targetId?: string;
  actionView?: ViewState;
}

// ---------------------------------------------------------------------------
// CUSTOMER 360 & HEALTH SCORE
// ---------------------------------------------------------------------------
export interface CustomerHealthScore {
  score: number; // 0 - 100
  tier: 'Healthy' | 'At Risk' | 'Needs Attention' | 'Inactive';
  factors: {
    label: string;
    score: number;
    weight: number;
    reason: string;
  }[];
  explanation: string;
}

export interface CustomerTimelineEvent {
  id: string;
  date: string;
  type: 'CUSTOMER_CREATED' | 'VISIT' | 'QUOTATION' | 'ORDER' | 'PAYMENT' | 'TASK' | 'NOTE';
  title: string;
  description: string;
  referenceId?: string;
  amount?: number;
}

// ---------------------------------------------------------------------------
// SALES TARGETS & COMMISSIONS
// ---------------------------------------------------------------------------
export interface SalesTarget {
  id: string;
  salesperson: string;
  period: string; // e.g., '2026-05' or 'Q2-2026'
  targetAmount: number;
  territory: string;
}

export interface CommissionRecord {
  id: string;
  orderId: string;
  salesperson: string;
  orderTotal: number;
  baseCommission: number;
  marginBonus: number;
  totalCommission: number;
  date: string;
}

// ---------------------------------------------------------------------------
// APPROVAL WORKFLOWS
// ---------------------------------------------------------------------------
export type ApprovalType = 
  | 'DISCOUNT_OVERRIDE'
  | 'CREDIT_LIMIT_OVERRIDE'
  | 'PRICE_OVERRIDE'
  | 'CLOSING_VARIANCE';

export interface ApprovalRequest {
  id: string;
  type: ApprovalType;
  title: string;
  description: string;
  requestedBy: string;
  requestedAt: string;
  status: 'PENDING' | 'APPROVED' | 'REJECTED';
  reviewedBy?: string;
  reviewedAt?: string;
  orderId?: string;
  customerId?: string;
  discountPercent?: number;
  varianceAmount?: number;
  notes?: string;
}

// ---------------------------------------------------------------------------
// FIELD EXPENSES
// ---------------------------------------------------------------------------
export interface Expense {
  id: string;
  salesperson: string;
  amount: number;
  currency: string;
  date: string;
  category: 'Fuel' | 'Travel' | 'Meals' | 'Accommodation' | 'Maintenance' | 'Other';
  receiptAttachmentId?: string;
  notes: string;
  status: 'SUBMITTED' | 'APPROVED' | 'REIMBURSED' | 'REJECTED';
}

// ---------------------------------------------------------------------------
// POST-VISIT REPORT
// ---------------------------------------------------------------------------
export interface VisitReport {
  id: string;
  visitId: string;
  customerId: string;
  customerName: string;
  salesperson: string;
  date: string;
  purpose: string;
  discussionNotes: string;
  productsDiscussed: string[];
  customerFeedback: string;
  competitorInfo?: string;
  nextAction: string;
  orderIdCreated?: string;
  paymentCollectedAmount?: number;
  signatureId?: string;
  photoAttachmentId?: string;
}

// ---------------------------------------------------------------------------
// DOCUMENT CENTER & DIGITAL SIGNATURES
// ---------------------------------------------------------------------------
export interface DocumentItem {
  id: string;
  title: string;
  entityType: 'Customer' | 'Visit' | 'Order' | 'Invoice' | 'Payment' | 'Expense' | 'Contract';
  entityId: string;
  fileName: string;
  fileSize: number;
  mimeType: string;
  dataUrl: string;
  uploadedBy: string;
  uploadedAt: string;
}

export interface DigitalSignature {
  id: string;
  signerName: string;
  signerTitle?: string;
  relatedEntity: 'Order' | 'VisitReport' | 'Payment' | 'ClosingReport';
  entityId: string;
  signatureDataUrl: string;
  timestamp: string;
  ipOrDevice: string;
}

// ---------------------------------------------------------------------------
// ROLES & USERS
// ---------------------------------------------------------------------------
export type UserRole = 'salesperson' | 'manager' | 'warehouse' | 'finance' | 'admin';

export interface UserAccount {
  id: string;
  username: string;
  fullName: string;
  role: UserRole;
  territory: string;
  status: 'ACTIVE' | 'INACTIVE';
  lastLogin?: string;
}

// ---------------------------------------------------------------------------
// VIEW STATE
// ---------------------------------------------------------------------------
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
  | 'reports'
  | 'customer_360'
  | 'crm_pipeline'
  | 'leads'
  | 'tasks'
  | 'receivables'
  | 'route_optimization'
  | 'expenses'
  | 'document_center'
  | 'sync_center'
  | 'erp_settings'
  | 'admin_users'
  | 'audit_center';
