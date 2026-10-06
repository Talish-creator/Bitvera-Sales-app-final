/**
 * Bitvera Sales — Enterprise CRM & Pipeline Service
 * 
 * Manages Sales Leads, Opportunities, and Sales Pipeline Kanban stages.
 * Enforces zero duplicate customer creation when converting Leads to Customers.
 */

import { Lead, PipelineStage, Customer } from '../types';
import { getCustomers, addCustomerPersistent } from './storage';
import { logEnterpriseEvent } from './config';

const LEADS_STORAGE_KEY = 'bitvera_crm_leads_v1';

const INITIAL_LEADS: Lead[] = [
  {
    id: 'LEAD-2026-001',
    name: 'Khaled Al-Mansoor',
    company: 'Al-Mansoor Hospitality & Catering',
    phone: '+966 50 112 3456',
    email: 'khaled@almansoor-ksa.com',
    source: 'Referral',
    territory: 'Riyadh North',
    assignedRep: 'representative',
    potentialValue: 48500,
    probability: 70,
    stage: 'NEGOTIATION',
    status: 'OPEN',
    notes: 'Interested in bulk contract for premium bottled water and hospitality packs.',
    nextAction: 'Finalize pricing approval and draft sales contract.',
    createdAt: '2026-04-20T10:30:00Z'
  },
  {
    id: 'LEAD-2026-002',
    name: 'Sarah Al-Ghamdi',
    company: 'Red Sea Supermarkets',
    phone: '+966 54 887 6543',
    email: 'purchasing@redsea-markets.sa',
    source: 'Inbound',
    territory: 'Jeddah Coastal',
    assignedRep: 'representative',
    potentialValue: 125000,
    probability: 50,
    stage: 'PROPOSAL',
    status: 'OPEN',
    notes: 'Opening 2 new hypermarkets in Jeddah. Requested quotation for full SKU range.',
    nextAction: 'Send formal quotation with volume discounts.',
    createdAt: '2026-04-25T14:15:00Z'
  },
  {
    id: 'LEAD-2026-003',
    name: 'Fahad Al-Otaibi',
    company: 'Eastern Logistic Canteen',
    phone: '+966 56 334 9876',
    email: 'canteen@easternlogistics.com',
    source: 'Cold Call',
    territory: 'Dammam Eastern',
    assignedRep: 'representative',
    potentialValue: 18000,
    probability: 85,
    stage: 'ORDER',
    status: 'OPEN',
    notes: 'Agreed on initial pallet delivery. Waiting for first sales order confirmation.',
    nextAction: 'Issue initial sales order and van dispatch.',
    createdAt: '2026-04-28T09:00:00Z'
  },
  {
    id: 'LEAD-2026-004',
    name: 'Tareq Al-Husseini',
    company: 'Al-Husseini Bakeries & Cafe',
    phone: '+966 55 990 1234',
    email: 'tareq@husseini-bakery.com',
    source: 'Exhibition',
    territory: 'Riyadh South',
    assignedRep: 'representative',
    potentialValue: 32000,
    probability: 30,
    stage: 'VISIT_SCHEDULED',
    status: 'OPEN',
    notes: 'Met at Foodex Riyadh. Needs on-site visit to inspect dispenser units.',
    nextAction: 'Visit branch on King Fahd Rd tomorrow 10 AM.',
    createdAt: '2026-05-01T11:45:00Z'
  }
];

export function getLeads(): Lead[] {
  try {
    const raw = localStorage.getItem(LEADS_STORAGE_KEY);
    if (!raw) {
      localStorage.setItem(LEADS_STORAGE_KEY, JSON.stringify(INITIAL_LEADS));
      return INITIAL_LEADS;
    }
    return JSON.parse(raw);
  } catch {
    return INITIAL_LEADS;
  }
}

export function saveLeads(leads: Lead[]): void {
  try {
    localStorage.setItem(LEADS_STORAGE_KEY, JSON.stringify(leads));
  } catch (err) {
    console.error('Failed to save leads:', err);
  }
}

export function addLead(lead: Omit<Lead, 'id' | 'createdAt'>): Lead {
  const leads = getLeads();
  const newLead: Lead = {
    ...lead,
    id: `LEAD-${new Date().getFullYear()}-${String(leads.length + 1).padStart(3, '0')}`,
    createdAt: new Date().toISOString()
  };
  leads.unshift(newLead);
  saveLeads(leads);
  logEnterpriseEvent('INFO', 'SYSTEM', `New Lead created: ${newLead.company} (${newLead.id})`);
  return newLead;
}

export function updateLeadStage(leadId: string, stage: PipelineStage): Lead | null {
  const leads = getLeads();
  const lead = leads.find(l => l.id === leadId);
  if (!lead) return null;

  lead.stage = stage;
  if (stage === 'WON') lead.probability = 100;
  if (stage === 'LOST') lead.probability = 0;

  saveLeads(leads);
  logEnterpriseEvent('INFO', 'SYSTEM', `Lead ${leadId} advanced to stage ${stage}`);
  return lead;
}

/**
 * Converts a qualified Lead into a verified Customer in the master database.
 * Strictly prevents duplicate customer creation.
 */
export function convertLeadToCustomer(leadId: string): { success: boolean; customer?: Customer; error?: string } {
  const leads = getLeads();
  const lead = leads.find(l => l.id === leadId);
  if (!lead) return { success: false, error: 'Lead not found.' };

  const customers = getCustomers();
  const normalizedPhone = lead.phone.replace(/[^0-9]/g, '');
  const existingByPhone = customers.find(c => c.phone.replace(/[^0-9]/g, '') === normalizedPhone);
  if (existingByPhone) {
    return {
      success: false,
      error: `A customer already exists with phone number ${lead.phone} (${existingByPhone.name} - ${existingByPhone.id}).`
    };
  }

  const newCustomer: Customer = {
    id: `CUST-${Date.now().toString().slice(-5)}`,
    name: lead.company || lead.name,
    phone: lead.phone,
    email: lead.email,
    lat: 24.7136, // Central Riyadh default
    lng: 46.6753,
    buildingNumber: '101',
    type: 'Commercial',
    group: 'Commercial',
    subGroup: 'Retailers',
    idType: 'CR',
    idNumber: `1010${Math.floor(100000 + Math.random() * 900000)}`,
    creditLimit: lead.potentialValue > 0 ? lead.potentialValue * 1.5 : 50000,
    territory: lead.territory,
    assignedRep: lead.assignedRep,
    status: 'ACTIVE ACCOUNT',
    createdAt: new Date().toISOString()
  };

  const addResult = addCustomerPersistent(newCustomer);
  if (!addResult.success) {
    return { success: false, error: addResult.error };
  }

  lead.status = 'CONVERTED';
  lead.stage = 'WON';
  lead.convertedCustomerId = newCustomer.id;
  saveLeads(leads);

  logEnterpriseEvent('AUDIT', 'SYSTEM', `Lead ${lead.id} successfully converted to Customer ${newCustomer.id}`);
  return { success: true, customer: newCustomer };
}

export interface PipelineMetrics {
  totalLeads: number;
  totalPipelineValue: number;
  weightedPipelineValue: number;
  winRatePercent: number;
  stageDistribution: Record<PipelineStage, { count: number; value: number }>;
}

export function getPipelineMetrics(): PipelineMetrics {
  const leads = getLeads().filter(l => l.status === 'OPEN' || l.stage === 'WON');
  
  let totalPipelineValue = 0;
  let weightedPipelineValue = 0;
  let wonCount = 0;
  let totalClosed = 0;

  const stageDistribution: Record<PipelineStage, { count: number; value: number }> = {
    LEAD: { count: 0, value: 0 },
    QUALIFIED: { count: 0, value: 0 },
    VISIT_SCHEDULED: { count: 0, value: 0 },
    PROPOSAL: { count: 0, value: 0 },
    NEGOTIATION: { count: 0, value: 0 },
    ORDER: { count: 0, value: 0 },
    WON: { count: 0, value: 0 },
    LOST: { count: 0, value: 0 }
  };

  leads.forEach(l => {
    totalPipelineValue += l.potentialValue;
    weightedPipelineValue += (l.potentialValue * (l.probability / 100));
    
    if (stageDistribution[l.stage]) {
      stageDistribution[l.stage].count += 1;
      stageDistribution[l.stage].value += l.potentialValue;
    }

    if (l.stage === 'WON') {
      wonCount++;
      totalClosed++;
    } else if (l.stage === 'LOST') {
      totalClosed++;
    }
  });

  const winRatePercent = totalClosed > 0 ? Math.round((wonCount / totalClosed) * 100) : 66;

  return {
    totalLeads: leads.length,
    totalPipelineValue,
    weightedPipelineValue: Math.round(weightedPipelineValue),
    winRatePercent,
    stageDistribution
  };
}
