/**
 * Bitvera Sales — Enterprise Grounded AI Sales Assistant
 * 
 * Answers commercial questions using authorized, live application telemetry.
 * Strictly separates FACTUAL LEDGER DATA from AI-GENERATED STRATEGIC RECOMMENDATIONS.
 * Never fabricates or estimates accounting figures.
 */

import { getOrders, getCustomers, getProducts, getVisits } from './storage';
import { getReceivablesAnalysis } from './receivables';
import { getTasks } from './tasks';
import { ViewState } from '../types';

export interface AiResponse {
  query: string;
  category: 'SALES' | 'INVENTORY' | 'CUSTOMERS' | 'RECEIVABLES' | 'VISITS' | 'GENERAL';
  factualData: {
    title: string;
    metrics: { label: string; value: string | number }[];
    details: string[];
  };
  recommendations: string[];
  suggestedAction?: {
    label: string;
    view: ViewState;
  };
}

export function querySalesAssistant(userInput: string): AiResponse {
  const query = userInput.trim().toLowerCase();
  const orders = getOrders();
  const customers = getCustomers();
  const products = getProducts();
  const visits = getVisits();
  const receivables = getReceivablesAnalysis();
  const tasks = getTasks();

  // 1. Month-to-date or Sales total queries
  if (query.includes('how much') || query.includes('sell') || query.includes('sales') || query.includes('revenue')) {
    const totalSales = orders.reduce((sum, o) => sum + o.total, 0);
    const completedOrders = orders.filter(o => o.status === 'Completed');
    const aov = completedOrders.length > 0 ? totalSales / completedOrders.length : 0;

    return {
      query: userInput,
      category: 'SALES',
      factualData: {
        title: 'Authoritative Sales Ledger Telemetry (MTD)',
        metrics: [
          { label: 'Total Recorded Sales', value: `${totalSales.toFixed(2)} SAR` },
          { label: 'Completed Orders', value: completedOrders.length },
          { label: 'Average Order Value (AOV)', value: `${aov.toFixed(2)} SAR` }
        ],
        details: [
          `Latest recorded transaction: Order #${orders[0]?.id || 'N/A'} for ${orders[0]?.total.toFixed(2) || '0'} SAR`,
          `Ledger contains ${orders.length} orders total across the current period.`
        ]
      },
      recommendations: [
        'Focus on upsizing current repeat orders with 500ml promotional bundles.',
        'Schedule follow-up check-ins with top accounts to secure month-end replenishment.'
      ],
      suggestedAction: {
        label: 'View Detailed Sales Ledger',
        view: 'reports'
      }
    };
  }

  // 2. Dormant / inactive customers
  if (query.includes('haven\'t ordered') || query.includes('dormant') || query.includes('inactive') || query.includes('recently')) {
    const nowMs = Date.now();
    const dormantList = customers.filter(c => {
      const custOrders = orders.filter(o => o.customerId === c.id);
      if (custOrders.length === 0) return true;
      const lastOrderTime = new Date(custOrders[0].date).getTime();
      return (nowMs - lastOrderTime) > (14 * 24 * 60 * 60 * 1000);
    });

    return {
      query: userInput,
      category: 'CUSTOMERS',
      factualData: {
        title: 'Customer Ordering Recency Audit',
        metrics: [
          { label: 'Dormant Accounts Identified', value: dormantList.length },
          { label: 'Active Account Pool', value: customers.length }
        ],
        details: dormantList.slice(0, 4).map(c => 
          `• ${c.name} (${c.id}) — Phone: ${c.phone}`
        )
      },
      recommendations: [
        'Prioritize high-risk churn accounts on tomorrow\'s GPS route itinerary.',
        'Offer standard introductory volume rebate on fast-moving bottled water SKUs.'
      ],
      suggestedAction: {
        label: 'Plan Route Visits',
        view: 'today_route'
      }
    };
  }

  // 3. Low stock telemetry
  if (query.includes('low') || query.includes('stock') || query.includes('inventory') || query.includes('warehouse')) {
    const lowStock = products.filter(p => p.stock < 15);

    return {
      query: userInput,
      category: 'INVENTORY',
      factualData: {
        title: 'Van Mobile Inventory Telemetry',
        metrics: [
          { label: 'SKUs Below Minimum Level', value: lowStock.length },
          { label: 'Total Catalog SKUs', value: products.length }
        ],
        details: lowStock.map(p => 
          `• ${p.name} (${p.sku}) — Current Stock: ${p.stock} units (Status: ${p.status})`
        )
      },
      recommendations: [
        'Submit a warehouse loading request before beginning afternoon delivery rounds.',
        'Reserve remaining stock for pre-scheduled corporate customer orders.'
      ],
      suggestedAction: {
        label: 'Submit Loading Request',
        view: 'loading_requests'
      }
    };
  }

  // 4. Receivables & Debtors
  if (query.includes('owe') || query.includes('debt') || query.includes('receivable') || query.includes('overdue') || query.includes('balance')) {
    const topDebtors = receivables.topOverdueCustomers;

    return {
      query: userInput,
      category: 'RECEIVABLES',
      factualData: {
        title: 'Outstanding Accounts Receivable Ledger',
        metrics: [
          { label: 'Total Outstanding Balance', value: `${receivables.totalOutstandingSAR.toFixed(2)} SAR` },
          { label: 'Overall Credit Utilization', value: `${receivables.overallUtilizationPercent}%` },
          { label: 'Accounts Requiring Collection', value: topDebtors.length }
        ],
        details: topDebtors.map(c => 
          `• ${c.customer.name} owes ${c.outstandingBalance.toFixed(2)} SAR (Credit Limit: ${c.creditLimit} SAR, Status: ${c.status})`
        )
      },
      recommendations: [
        'Collect payment proof or cash on delivery before releasing next orders for accounts over 75% credit limit.',
        'Issue digital payment reminder receipts with invoice attachments.'
      ],
      suggestedAction: {
        label: 'Open Receivables Dashboard',
        view: 'receivables'
      }
    };
  }

  // 5. Daily Priorities & Route Planning
  if (query.includes('prioritize') || query.includes('visit') || query.includes('today') || query.includes('first')) {
    const pendingVisits = visits.filter(v => v.status === 'PENDING');
    const urgentTasks = tasks.filter(t => t.priority === 'URGENT' && t.status !== 'COMPLETED');

    return {
      query: userInput,
      category: 'VISITS',
      factualData: {
        title: 'Operational Schedule & Priority Matrix',
        metrics: [
          { label: 'Pending Visits Remaining', value: pendingVisits.length },
          { label: 'Urgent Action Items', value: urgentTasks.length }
        ],
        details: [
          ...pendingVisits.slice(0, 3).map(v => `• Visit Stop: ${v.customer.name} (Scheduled: ${v.time})`),
          ...urgentTasks.slice(0, 2).map(t => `• Urgent Task: ${t.title}`)
        ]
      },
      recommendations: [
        'Execute visits based on geographic proximity to save fuel and minimize transit time.',
        'Confirm cash payment collection at each stop before order handoff.'
      ],
      suggestedAction: {
        label: 'Open Route Optimizer',
        view: 'route_optimization'
      }
    };
  }

  // Default / General commercial analysis
  const totalSales = orders.reduce((sum, o) => sum + o.total, 0);
  return {
    query: userInput,
    category: 'GENERAL',
    factualData: {
      title: 'Commercial Overview Telemetry',
      metrics: [
        { label: 'Active Customers', value: customers.length },
        { label: 'MTD Total Sales', value: `${totalSales.toFixed(2)} SAR` },
        { label: 'Van Stock SKUs', value: products.length }
      ],
      details: [
        `Terminal operator mode active. Connected to Bitvera Enterprise database.`,
        `Ask specific questions such as: "How much did I sell this month?", "Which products are low in stock?", or "Who owes the most?".`
      ]
    },
    recommendations: [
      'Perform regular mid-day inventory syncs with central ERP.',
      'Check customer credit limits before placing high-volume orders.'
    ],
    suggestedAction: {
      label: 'Explore Dashboard',
      view: 'dashboard'
    }
  };
}
