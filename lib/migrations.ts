/**
 * CoffeePlace Founder MBA OS — Data Migrations
 *
 * Each migration is keyed by a unique ID. The runner checks localStorage for
 * completed migrations, runs any that are missing, and records them.
 *
 * Rules:
 * - Never mutate existing records — only insert if ID is absent.
 * - Each migration is idempotent: safe to call multiple times.
 * - Add new migrations at the bottom; never reorder or remove old ones.
 */

import { doc, getDoc, setDoc } from 'firebase/firestore'
import { db } from './firebase'
import { STORAGE_KEYS } from './storage'
import type { Course, CoffeeApplication, Note } from './types'

const COLLECTION = 'data'
const USER_ID = 'kero'
const MIGRATIONS_KEY = 'coffeeplace_migrations_ran'

function getRan(): Set<string> {
  try {
    const raw = localStorage.getItem(MIGRATIONS_KEY)
    return new Set(JSON.parse(raw || '[]'))
  } catch {
    return new Set()
  }
}

function markRan(id: string) {
  const ran = getRan()
  ran.add(id)
  localStorage.setItem(MIGRATIONS_KEY, JSON.stringify([...ran]))
}

async function insertIfMissing<T extends { id: string }>(key: string, items: T[]) {
  const docRef = doc(db, COLLECTION, `${USER_ID}_${key}`)
  const snap = await getDoc(docRef)
  let existing: T[] = []
  if (snap.exists()) {
    const data = snap.data().value
    if (Array.isArray(data)) existing = data as T[]
  }
  const ids = new Set(existing.map(i => i.id))
  const toAdd = items.filter(i => !ids.has(i.id))
  if (toAdd.length > 0) {
    await setDoc(docRef, { value: [...existing, ...toAdd] })
  }
}

// ─── Migration 001 — Business Metrics & Financial Modeling course ─────────────

async function m001_businessMetricsCourse() {
  const now = new Date().toISOString()
  const courseId = 'course_biz_metrics_fin_modeling_001'

  const course: Course = {
    id: courseId,
    name: 'Business Metrics & Financial Modeling',
    platform: 'Online Course',
    instructor: '',
    link: '',
    category: 'Finance',
    duration: 'Full course',
    status: 'completed',
    progress: 100,
    topicsCovered: [
      'KPI Thinking & Business Question Framework',
      'Marketing Funnel Metrics (CTR, CPC)',
      'Cost Per Lead (CPL)',
      'Customer Acquisition Cost (CAC)',
      'Cost Per Acquisition (CPA)',
      'Lifetime Value (LTV)',
      'Sales Pipeline & Funnel',
      'Daily Active Users (DAU) & Monthly Active Users (MAU)',
      'Churn Rate',
      'Profit & Loss Statement (P&L)',
      'Fixed Costs vs Variable Costs',
      'Contribution Margin & Break-Even Analysis',
      'Distribution, Mean vs Median, Skewness',
      'Box Plot Analysis for Segment Comparison',
      'Introduction to Financial Modeling',
      'Top-Down Forecasting Approach',
      'Bottom-Up Forecasting Approach',
      'Assumptions in Modeling',
      'Sales Forecasting (Bottom-Up & Top-Down)',
      'Scenario Analysis (Weak / Base / Strong)',
      'Excel: Data Validation & Dropdowns',
      'Excel: INDEX + MATCH (single & dual criteria)',
      'Excel: OFFSET for Dynamic Assumptions',
      'Financial Model Formatting Standards',
      '4-Step Financial Forecasting Process',
    ],
    keyLessons: [
      'Do not memorize formulas — understand what business question each metric answers.',
      'KPI sequence: Business Goal → Question → Data → KPI → Analysis → Visualization → Action.',
      'LTV must always be much greater than CAC. CoffeePlace LTV = 4,368 EGP vs CAC = 80 EGP (54×).',
      'CPA ≠ CAC: CPA measures any defined action/lead; CAC measures a paying customer.',
      'Churn must be defined per segment — daily, weekly, monthly, corporate customers all churn differently.',
      'Mean can mislead — always check median, distribution, and outliers before making decisions.',
      'Bottom-up forecasting is stronger than top-down because it uses real operational data.',
      'Contribution Margin = Selling Price − Variable Cost. Break-Even = Fixed Costs ÷ CM per Unit.',
      'Model assumptions about costs are risky — rent, electricity, supplier prices are hard to control.',
      'Build 3 scenarios (Weak/Base/Strong) before opening any branch. Know your cash reserve needs.',
      'The model is dynamic: never hardcode assumptions. Use dropdown + OFFSET + MATCH in Excel.',
    ],
    notes:
      'Completed full Business Metrics & Financial Modeling course. Core principle: turn CoffeePlace into a measurable, repeatable, financially healthy business system — not just a beautiful café. Built complete 3-scenario financial model framework and defined all key marketing/growth metrics.',
    actionItems: [
      'Build the 3-scenario financial model for CoffeePlace Branch 1 (Korba) in Excel',
      'Calculate break-even orders/day before committing to rent',
      'Set up CPL/CPA/CAC tracking template for every marketing campaign',
      'Calculate LTV per customer segment (daily, weekly, occasional)',
      'Define churn thresholds for each customer segment',
      'Build contribution margin table for every menu item',
      'Create KPI dashboard with question-first framework',
      'Build corporate sales pipeline for office/catering deals',
    ],
    coffeeApplication:
      'Full financial modeling framework for CoffeePlace. Scenario analysis: Weak (120 orders/day, loss), Base (220 orders/day, 259,840 EGP op income), Strong (350 orders/day, 842,750 EGP op income). Break-even: 2,711 units/month at 83 EGP CM. CAC target: 80 EGP. LTV: 4,368 EGP. CPL: 40 EGP. Churn definitions set per segment. KPI framework connects every decision to a business question.',
    rating: 5,
    startedAt: now,
    completedAt: now,
    createdAt: now,
    updatedAt: now,
  }

  const applications: CoffeeApplication[] = [
    {
      id: 'app_bm_kpi_dashboard_framework',
      title: 'KPI Dashboard — Question-First Framework',
      description:
        'Build all KPIs starting from business questions. Never track a metric unless you know which question it answers. Key KPIs: Footfall, Conversion Rate, AOV, Repeat Customer Rate, Gross Margin, Operating Margin, CAC, Churn Rate, Rating.',
      courseId,
      category: 'Analytics',
      status: 'planning',
      impact: 'high',
      expectedOutcome: 'Every business decision at CoffeePlace is backed by a relevant KPI. No vanity metrics, no guessing.',
      createdAt: now,
      updatedAt: now,
    },
    {
      id: 'app_bm_marketing_funnel_tracker',
      title: 'Marketing Funnel Tracker (CPL / CPA / CAC)',
      description:
        'Track every campaign through the full funnel: Impressions → Clicks → Leads → Conversions. Calculate CPL (target: 40 EGP), CPA, and CAC (target: 80 EGP) per campaign. Compare across channels.',
      courseId,
      category: 'Marketing',
      status: 'planning',
      impact: 'high',
      expectedOutcome: 'Know the exact cost of every customer acquired. Eliminate underperforming channels. Optimize spend.',
      createdAt: now,
      updatedAt: now,
    },
    {
      id: 'app_bm_ltv_calculator',
      title: 'Customer LTV Calculator by Segment',
      description:
        'Calculate LTV per segment: AOV × Visits/Week × Retention Weeks × Gross Margin. Baseline: 140 × 2 × 26 × 60% = 4,368 EGP. Track LTV:CAC ratio — target > 3:1. Current: 54:1.',
      courseId,
      category: 'Finance',
      status: 'planning',
      impact: 'high',
      expectedOutcome: 'Know how much each customer segment is worth. Make smarter decisions on acquisition and loyalty spend.',
      createdAt: now,
      updatedAt: now,
    },
    {
      id: 'app_bm_churn_monitoring',
      title: 'Customer Churn Monitoring System',
      description:
        'Churn thresholds by segment: Daily customer = no visit for 7 days. Weekly = 21 days. Monthly = 45 days. Corporate = no order for 30–90 days. Track cohorts and trigger re-engagement.',
      courseId,
      category: 'Customer Experience',
      status: 'planning',
      impact: 'high',
      expectedOutcome: "Detect churning customers before they're gone. Re-engage with targeted offers. Protect LTV.",
      createdAt: now,
      updatedAt: now,
    },
    {
      id: 'app_bm_breakeven_model',
      title: 'Break-Even Calculator (Pre-Opening Tool)',
      description:
        'Formula: Fixed Costs ÷ Contribution Margin per Unit. Baseline: 225,000 EGP ÷ 83 EGP CM = 2,711 units/month ≈ 90 orders/day. Calculate per rent scenario and per product.',
      courseId,
      category: 'Finance',
      status: 'planning',
      impact: 'high',
      expectedOutcome: 'Know exact orders/day needed to survive before signing a lease. Test every rent scenario before committing.',
      createdAt: now,
      updatedAt: now,
    },
    {
      id: 'app_bm_3scenario_financial_model',
      title: 'CoffeePlace 3-Scenario Financial Model',
      description:
        'Dynamic Weak/Base/Strong Excel model. Weak: 120/day, 120 AOV, 40% COGS → -100,800 EGP. Base: 220/day, 140 AOV, 34% COGS → +259,840 EGP. Strong: 350/day, 165 AOV, 30% COGS → +842,750 EGP.',
      courseId,
      category: 'Finance',
      status: 'planning',
      impact: 'high',
      expectedOutcome: 'Never open a branch without stress-testing all 3 scenarios. Know cash reserve required for weak case survival.',
      createdAt: now,
      updatedAt: now,
    },
    {
      id: 'app_bm_contribution_margin_menu',
      title: 'Menu Contribution Margin Table',
      description:
        'Calculate CM for every item: Selling Price − Variable Cost. Spanish Latte: 140 − 57 = 83 EGP CM. Rank all items by CM and gross margin %. Train staff to recommend highest-CM items.',
      courseId,
      category: 'Operations',
      status: 'planning',
      impact: 'medium',
      expectedOutcome: 'Identify highest-margin products. Guide upsell strategy. Improve menu mix contribution to fixed cost coverage.',
      createdAt: now,
      updatedAt: now,
    },
    {
      id: 'app_bm_corporate_sales_pipeline',
      title: 'Corporate B2B Sales Pipeline',
      description:
        'Funnel: Office leads → Qualified → Tasting/proposal → Corporate subscription → Booking. Model: 100 EGP/cup × 1,000 cups/month × 6-month contract = 600,000 EGP per deal.',
      courseId,
      category: 'Sales',
      status: 'idea',
      impact: 'medium',
      expectedOutcome: 'Build predictable B2B revenue stream. Reduce dependence on walk-in traffic. Improve revenue stability.',
      createdAt: now,
      updatedAt: now,
    },
  ]

  const notes: Note[] = [
    {
      id: 'note_bm_kpi_thinking_framework',
      title: 'KPI Thinking Framework',
      content: `## KPI Thinking Framework

**Core Rule:** Do not start with numbers. Start with business questions.

### The Sequence
Business Goal → Business Question → Data Needed → KPI → Analysis → Visualization → Recommendation → Action

### CoffeePlace KPI Map

| Business Question | KPI |
|---|---|
| Are people entering the café? | Footfall, Visitors/Day |
| Are visitors buying? | Conversion Rate |
| Are customers spending enough? | Average Order Value (AOV) |
| Are customers coming back? | Repeat Customer Rate |
| Is the café profitable? | Gross Margin, Operating Margin |
| Is marketing working? | CAC, CPL, CPA |
| Are customers happy? | Rating, Complaints, Reviews |

### Wrong vs Right Approach
❌ Wrong: "I want to track sales, reviews, COGS, and marketing."
✅ Right: Start with the business question. The KPI follows naturally.`,
      tags: ['KPI', 'Finance', 'Framework', 'Analytics', 'CoffeePlace'],
      courseId,
      isPinned: true,
      createdAt: now,
      updatedAt: now,
    },
    {
      id: 'note_bm_marketing_metrics_reference',
      title: 'Marketing Metrics: CPL, CPA, CAC, LTV — Reference Sheet',
      content: `## Marketing Metrics Reference Sheet

### CPL — Cost Per Lead
\`CPL = Marketing Cost ÷ Number of Leads\`
CoffeePlace: 20,000 EGP ÷ 500 leads = **40 EGP per lead**

### CPA — Cost Per Acquisition
\`CPA = Total Sales & Marketing Costs ÷ Acquisitions / Actions\`
CoffeePlace: 20,000 EGP ÷ 300 trials = **66.67 EGP**

### CAC — Customer Acquisition Cost
\`CAC = Total Sales & Marketing Cost ÷ New Paying Customers\`
CoffeePlace: 40,000 EGP ÷ 500 = **80 EGP per paying customer**

### LTV — Lifetime Value
\`LTV = AOV × Visits per Week × Retention Weeks × Profit Margin\`
CoffeePlace: 140 × 2 × 26 × 0.60 = **4,368 EGP**

### The Golden Rule
**LTV >> CAC** always
CoffeePlace: 4,368 ÷ 80 = **54.6×** → excellent

### Funnel Example
20,000 EGP campaign → 500 leads → 300 trials → 120 paying
- CPL = 40 EGP | CPA = 66.67 EGP | CAC = 166.67 EGP`,
      tags: ['Marketing', 'CAC', 'LTV', 'CPL', 'CPA', 'Finance', 'Reference'],
      courseId,
      isPinned: true,
      createdAt: now,
      updatedAt: now,
    },
    {
      id: 'note_bm_scenario_analysis',
      title: 'CoffeePlace 3-Scenario Financial Model',
      content: `## CoffeePlace Scenario Analysis

| Metric | Weak Case | Base Case | Strong Case |
|---|---|---|---|
| Orders/day | 120 | 220 | 350 |
| AOV | 120 EGP | 140 EGP | 165 EGP |
| COGS % | 40% | 34% | 30% |
| Monthly Revenue | 432,000 | 924,000 | 1,732,500 |
| Gross Profit | 259,200 | 609,840 | 1,212,750 |
| Operating Income | **-100,800** | **+259,840** | **+842,750** |

### Break-Even
225,000 EGP fixed costs ÷ 83 EGP CM = **2,711 units/month ≈ 90 orders/day**

### Pre-Opening Stress Test
1. If rent = 100,000 EGP, how many orders/day do we need?
2. If AOV = 120 instead of 150, are we still profitable?
3. If COGS = 40%, what happens to operating income?
4. If first 3 months are weak, how much cash reserve is needed?`,
      tags: ['Finance', 'Scenarios', 'Break-Even', 'CoffeePlace', 'Pre-Opening'],
      courseId,
      isPinned: true,
      createdAt: now,
      updatedAt: now,
    },
    {
      id: 'note_bm_pl_structure',
      title: 'CoffeePlace P&L Structure & Margin Targets',
      content: `## CoffeePlace P&L Structure

### Revenue: Coffee drinks • Matcha • Desserts • Bakery • Sandwiches • Catering • Retail beans
### COGS: Beans • Milk • Syrups • Cups • Lids • Packaging
### OpEx: Rent • Salaries • Utilities • Marketing • POS • Cleaning

\`\`\`
Revenue − COGS = Gross Profit
Gross Profit − OpEx = Operating Income (EBIT)
EBIT − Interest − Taxes = Net Income
\`\`\`

### Margin Targets
| Margin | Formula | Target |
|---|---|---|
| Gross Margin | GP ÷ Revenue | 60–66% |
| Operating Margin | OI ÷ Revenue | 25–35% |
| COGS % | COGS ÷ Revenue | 34–38% |

### Warning Signals
- COGS > 38% → investigate costs
- Operating Margin < 15% → review fixed cost structure
- Net Income negative 2+ months → restructure`,
      tags: ['Finance', 'P&L', 'Margins', 'COGS', 'CoffeePlace'],
      courseId,
      isPinned: false,
      createdAt: now,
      updatedAt: now,
    },
    {
      id: 'note_bm_financial_modeling_process',
      title: 'Financial Modeling — 4-Step Process & Excel Tools',
      content: `## Financial Modeling: 4 Steps

1. **Historical Stats**: Revenue Growth, Gross Margin, Operating Margin
2. **Scenario Table**: Strong / Base / Weak assumptions
3. **Dynamic Assumptions**: Dropdown + OFFSET + MATCH (never hardcode)
4. **Forecast**: Revenue × (1 + Growth), GP = Revenue × GM, OI = Revenue × OM

## Key Excel Formulas
\`\`\`
INDEX + MATCH (single):  =INDEX(arr, MATCH(val, col, 0))
INDEX + MATCH (dual):    =INDEX(arr, MATCH(1,(A=a)*(B=b),0))  [Ctrl+Shift+Enter]
OFFSET (scenario pull):  =OFFSET(ref, MATCH(scenario, list, 0), col)
\`\`\`

## Model Colors
Blue = inputs | Black = formulas | Green = sheet links | Red = file links`,
      tags: ['Finance', 'Excel', 'Financial Model', 'Forecasting', 'INDEX MATCH'],
      courseId,
      isPinned: false,
      createdAt: now,
      updatedAt: now,
    },
  ]

  await insertIfMissing(STORAGE_KEYS.COURSES, [course])
  await insertIfMissing(STORAGE_KEYS.APPLICATIONS, applications)
  await insertIfMissing(STORAGE_KEYS.NOTES, notes)
}

// ─── Migration Runner ─────────────────────────────────────────────────────────

export async function runMigrations() {
  if (typeof window === 'undefined') return

  const ran = getRan()

  if (!ran.has('m001_business_metrics_course')) {
    await m001_businessMetricsCourse()
    markRan('m001_business_metrics_course')
    console.log('[MBA OS] Migration m001 — Business Metrics course imported ✅')
  }
}
