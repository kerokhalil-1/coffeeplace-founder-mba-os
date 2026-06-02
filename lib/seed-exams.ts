import { Exam } from './types'

const now = new Date().toISOString()

export const SEED_EXAMS: Exam[] = [
  {
    id: 'exam-finance-1',
    title: 'Finance Fundamentals',
    category: 'Finance',
    description: 'Test your understanding of financial statements, unit economics, and break-even analysis for a specialty coffee business.',
    passingScore: 70,
    timeLimit: 20,
    createdAt: now, updatedAt: now,
    questions: [
      {
        id: 'q1', type: 'mcq', points: 10,
        question: 'CoffeePlace sells 200 cups/day at AED 22 average. COGS per cup is AED 6.50. What is the daily gross margin?',
        options: ['AED 3,100', 'AED 3,000', 'AED 2,900', 'AED 4,400'],
        correctAnswer: 'AED 3,100',
        explanation: 'Gross Margin = (22 - 6.50) × 200 = 15.50 × 200 = AED 3,100',
      },
      {
        id: 'q2', type: 'mcq', points: 10,
        question: 'Fixed monthly costs are AED 35,000. Contribution margin per cup is AED 15.50. What is the monthly break-even in cups?',
        options: ['2,258 cups', '1,935 cups', '2,500 cups', '3,000 cups'],
        correctAnswer: '2,258 cups',
        explanation: 'Break-even = Fixed Costs / Contribution Margin = 35,000 / 15.50 ≈ 2,258 cups',
      },
      {
        id: 'q3', type: 'mcq', points: 10,
        question: 'Which financial statement shows whether a business can pay its bills right now?',
        options: ['Cash Flow Statement', 'Income Statement', 'Balance Sheet', 'Budget Variance Report'],
        correctAnswer: 'Cash Flow Statement',
        explanation: 'The Cash Flow Statement shows actual cash in/out and determines liquidity/ability to pay bills.',
      },
      {
        id: 'q4', type: 'mcq', points: 10,
        question: 'CoffeePlace spends AED 500 on Instagram ads and acquires 20 new customers. Average customer buys 2x/month for 12 months at AED 22. What is the LTV:CAC ratio?',
        options: ['21.1x', '10.5x', '5.3x', '42.2x'],
        correctAnswer: '21.1x',
        explanation: 'CAC = 500/20 = AED 25. LTV = 22 × 2 × 12 = AED 528. LTV:CAC = 528/25 = 21.1x',
      },
      {
        id: 'q5', type: 'mcq', points: 10,
        question: 'What does "EBITDA" stand for, and why do investors use it to value coffee businesses?',
        options: [
          'Earnings Before Interest, Taxes, Depreciation & Amortization — removes non-cash items for comparison',
          'Earnings Before Income, Tax, Dividends & Accruals — measures pure cash profit',
          'Estimated Business Income Tax and Depreciation Allowance — tax calculation metric',
          'Enterprise Business Income, Total Debt & Assets — used for balance sheet analysis',
        ],
        correctAnswer: 'Earnings Before Interest, Taxes, Depreciation & Amortization — removes non-cash items for comparison',
        explanation: 'EBITDA strips out financing and non-cash charges to show operational profitability, making it easier to compare businesses.',
      },
      {
        id: 'q6', type: 'practical', points: 25,
        question: 'Build a simplified monthly P&L for CoffeePlace Branch 1:\n\n• Revenue: 250 cups/day × AED 22 × 26 days\n• COGS: 30% of revenue\n• Labor: AED 18,000\n• Rent: AED 12,000\n• Utilities & Misc: AED 4,500\n\nCalculate: Revenue, Gross Profit, Total OpEx, Net Operating Profit, and Net Margin %.',
        correctAnswer: 'Revenue: AED 143,000 | COGS: AED 42,900 | Gross Profit: AED 100,100 (70%) | Total OpEx: AED 34,500 | Net Operating Profit: AED 65,600 | Net Margin: 45.9%',
        explanation: 'Key check: Revenue = 250 × 22 × 26 = 143,000. GP = 143,000 × 0.70 = 100,100. OpEx = 18,000 + 12,000 + 4,500 = 34,500. Net = 100,100 - 34,500 = 65,600.',
      
        rubricCriteria: [
          { id: 'q6-c1', label: 'Revenue & Gross Profit', description: 'Correctly calculates revenue (250×22×26=AED 143,000) and gross profit (70% = AED 100,100)', maxPoints: 10 },
          { id: 'q6-c2', label: 'OpEx & Net Profit', description: 'Correctly totals operating expenses (AED 34,500) and arrives at net operating profit (AED 65,600)', maxPoints: 10 },
          { id: 'q6-c3', label: 'Margin Interpretation', description: 'States net margin percentage (45.9%) and explains what it means for the business viability', maxPoints: 5 },
        ],
      },
      {
        id: 'q7', type: 'case', points: 25,
        question: 'CoffeePlace is considering opening Branch 2. Investment required: AED 280,000 (fit-out + deposits). Expected monthly net profit: AED 22,000 after full ramp (month 4 onward).\n\nQ1: Calculate the simple payback period in months.\nQ2: What is the 3-year ROI?\nQ3: What are the top 3 risks that could extend the payback period, and how would you mitigate them?',
        correctAnswer: 'Payback = 280,000 / 22,000 = 12.7 months. 3yr ROI = ((22,000 × 32 months profit) - 280,000) / 280,000 = (704,000 - 280,000) / 280,000 = 151%. Risks: slower ramp-up, higher costs, lower volume.',
        explanation: 'Note: 3yr = 36 months - 4 ramp months = 32 profit months. Good answers will include specific mitigation strategies.',
      
        rubricCriteria: [
          { id: 'q7-c1', label: 'Payback Period', description: 'Correctly calculates simple payback: 280,000 ÷ 22,000 = 12.7 months with clear working shown', maxPoints: 10 },
          { id: 'q7-c2', label: '3-Year ROI', description: 'Correctly identifies 32 profit months (36-4 ramp) and calculates 151% ROI with formula shown', maxPoints: 10 },
          { id: 'q7-c3', label: 'Risk & Mitigation', description: 'Names at least 3 specific, realistic risks that could extend payback with a concrete mitigation for each', maxPoints: 5 },
        ],
      },
    ],
  },
  {
    id: 'exam-operations-1',
    title: 'Operations & Systems',
    category: 'Operations',
    description: 'Test your understanding of SOPs, quality systems, inventory management, and building scalable cafe operations.',
    passingScore: 70,
    timeLimit: 20,
    createdAt: now, updatedAt: now,
    questions: [
      {
        id: 'ops-q1', type: 'mcq', points: 10,
        question: 'What is the primary purpose of a Standard Operating Procedure (SOP)?',
        options: [
          'Ensure consistent quality and outcomes regardless of which team member performs the task',
          'Protect the business legally if something goes wrong',
          'Reduce the need to hire skilled staff',
          'Document processes for the purposes of selling the business',
        ],
        correctAnswer: 'Ensure consistent quality and outcomes regardless of which team member performs the task',
        explanation: 'SOPs\'s core function is quality consistency and brand reliability — the customer experience should be identical whether the founder is there or not.',
      },
      {
        id: 'ops-q2', type: 'mcq', points: 10,
        question: 'CoffeePlace uses 2kg of espresso beans/day. Supplier lead time is 3 days. What minimum "par level" (reorder point) should you set?',
        options: ['6kg', '4kg', '8kg', '2kg'],
        correctAnswer: '6kg',
        explanation: 'Reorder point = Daily usage × Lead time = 2kg × 3 days = 6kg. Order when stock hits 6kg to never run out.',
      },
      {
        id: 'ops-q3', type: 'mcq', points: 10,
        question: 'Your espresso tastes sour in the morning but perfect in the afternoon. The most likely cause is:',
        options: [
          'Grinder calibration drift — the grind size changes as grinder heats up and must be adjusted',
          'Water temperature dropping in the boiler throughout the day',
          'Different milk batches being used at different times',
          'Customer preference — some customers prefer morning coffee more sour',
        ],
        correctAnswer: 'Grinder calibration drift — the grind size changes as grinder heats up and must be adjusted',
        explanation: 'Grinder burrs change temperature with use, affecting grind consistency. Morning calibration is essential daily practice.',
      },
      {
        id: 'ops-q4', type: 'mcq', points: 10,
        question: 'Which inventory management principle means you always use the oldest stock first?',
        options: ['FIFO (First In, First Out)', 'LIFO (Last In, First Out)', 'JIT (Just In Time)', 'EOQ (Economic Order Quantity)'],
        correctAnswer: 'FIFO (First In, First Out)',
        explanation: 'FIFO ensures freshness — green coffee, milk, and syrups must always be rotated oldest-to-front to minimize waste and maintain quality.',
      },
      {
        id: 'ops-q5', type: 'practical', points: 30,
        question: 'Write a complete Espresso Dialing SOP for a new barista.\n\nInclude:\n• When to dial in (triggers)\n• Parameters to record (dose, yield, time, taste)\n• Decision tree: if too sour / too bitter / too fast / too slow\n• Sign-off procedure\n\nFormat it as a step-by-step SOP a new hire can follow on Day 1.',
        correctAnswer: 'Strong answer includes: Dial-in trigger (morning, bag change, weather change), parameters (18-20g dose, 36-40g yield, 27-32s, taste check), clear if/then decisions, manager sign-off.',
        explanation: 'Evaluate completeness, clarity, and whether a non-expert could actually follow it.',
      
        rubricCriteria: [
          { id: 'ops-q5-c1', label: 'Triggers & Parameters', description: 'Identifies correct dial-in triggers (morning, bag change, weather) and all 4 required parameters (dose, yield, time, taste)', maxPoints: 10 },
          { id: 'ops-q5-c2', label: 'Decision Tree', description: 'Provides clear if/then logic for all 4 taste outcomes (sour → finer grind, bitter → coarser, fast → finer, slow → coarser)', maxPoints: 10 },
          { id: 'ops-q5-c3', label: 'SOP Format & Sign-off', description: 'Written as numbered steps a new hire can follow on Day 1; includes a manager sign-off procedure', maxPoints: 10 },
        ],
      },
      {
        id: 'ops-q6', type: 'case', points: 30,
        question: 'Your barista calls in sick at 7:45am on a Monday (opening at 8am). You are the only other person trained on the machine. You also have a supplier meeting at 9am and a bank appointment at 11am.\n\nQ1: What do you do in the next 15 minutes?\nQ2: What SOP or system failure does this scenario expose?\nQ3: What 3 operational changes would prevent this situation from being a crisis in future?',
        correctAnswer: 'Immediate: handle opening yourself, reschedule supplier if possible. Exposes: single point of failure, no backup coverage roster. Fixes: cross-train at least 2 team members, build on-call coverage protocol, create minimum staffing policy.',
        explanation: 'Best answers recognize this as a systems problem, not a people problem, and propose structural fixes.',
      
        rubricCriteria: [
          { id: 'ops-q6-c1', label: 'Immediate Response', description: 'First-15-minute actions are specific and prioritised: opening solo, communicating rescheduling, not panicking', maxPoints: 10 },
          { id: 'ops-q6-c2', label: 'System Diagnosis', description: 'Correctly identifies the single point of failure (no backup-trained staff, no coverage SOP) as the root cause', maxPoints: 10 },
          { id: 'ops-q6-c3', label: 'Prevention Plan', description: '3 structural changes proposed that address the system failure — not just "hire more staff" generics', maxPoints: 10 },
        ],
      },
    ],
  },
  {
    id: 'exam-marketing-1',
    title: 'Marketing & Brand Fundamentals',
    category: 'Marketing',
    description: 'Test your marketing knowledge — from customer research to digital channels to brand positioning.',
    passingScore: 70,
    timeLimit: 20,
    createdAt: now, updatedAt: now,
    questions: [
      {
        id: 'mkt-q1', type: 'mcq', points: 10,
        question: 'What is a "brand positioning statement"?',
        options: [
          'A clear articulation of who you serve, what you offer, and why you are different — for internal strategic alignment',
          'The tagline that appears on all marketing materials',
          'A legal document protecting your brand name',
          'The summary at the top of your Instagram bio',
        ],
        correctAnswer: 'A clear articulation of who you serve, what you offer, and why you are different — for internal strategic alignment',
        explanation: 'Positioning statement: For [target customer] who [need], [Brand] is the [category] that [key benefit] because [reason to believe].',
      },
      {
        id: 'mkt-q2', type: 'mcq', points: 10,
        question: 'Your Instagram post gets 500 likes and 2 saved but 0 new customers. What does this signal?',
        options: [
          'High entertainment value but weak conversion — the content isn\'t driving action',
          'Your target audience doesn\'t use Instagram',
          'Your product photos are not professional enough',
          'You need more followers before conversions will happen',
        ],
        correctAnswer: 'High entertainment value but weak conversion — the content isn\'t driving action',
        explanation: 'Vanity metrics (likes) vs business metrics (visits, orders). Content must have a clear purpose: awareness, desire, or action.',
      },
      {
        id: 'mkt-q3', type: 'mcq', points: 10,
        question: 'CoffeePlace has 3,000 loyalty members. 300 of them account for 60% of revenue. What marketing concept does this illustrate?',
        options: ['The 80/20 Rule (Pareto Principle)', 'Market Segmentation', 'The Long Tail Theory', 'Customer Lifetime Value'],
        correctAnswer: 'The 80/20 Rule (Pareto Principle)',
        explanation: '~80% of revenue often comes from ~20% of customers. Identify and super-serve your top 10% — they are your best marketing asset.',
      },
      {
        id: 'mkt-q4', type: 'practical', points: 35,
        question: 'Write a brand positioning statement and 3-pillar messaging framework for CoffeePlace.\n\nFormat:\n• 1 Positioning Statement (For [target]... CoffeePlace is... that... because...)\n• 3 Brand Messages (each 1-2 sentences, different angle: quality / community / experience)\n• 1 Brand Tagline (5 words or less)',
        correctAnswer: 'Evaluate: clarity of target customer, specificity of differentiation, emotional resonance of messages, memorability of tagline.',
        explanation: 'There is no single correct answer — evaluate quality of thinking and strategic clarity.',
      
        rubricCriteria: [
          { id: 'mkt-q4-c1', label: 'Positioning Statement', description: 'Follows For/Is/That/Because format with a specific target customer and a clear, differentiated claim', maxPoints: 10 },
          { id: 'mkt-q4-c2', label: 'Brand Messages', description: '3 distinct messages covering different angles (quality, community, experience) — each 1-2 sentences', maxPoints: 10 },
          { id: 'mkt-q4-c3', label: 'Strategic Alignment', description: 'Messages connect logically to the positioning statement — no contradictions between messages and positioning', maxPoints: 10 },
          { id: 'mkt-q4-c4', label: 'Tagline', description: '5 words or less; memorable; genuinely reflects the brand identity defined in the positioning', maxPoints: 5 },
        ],
      },
      {
        id: 'mkt-q5', type: 'case', points: 35,
        question: 'CoffeePlace has been open 6 months. Average daily customer count is 180 (target: 250). You have AED 5,000/month marketing budget.\n\nQ1: Where would you allocate the AED 5,000 and why?\nQ2: What 3 metrics would you track to measure effectiveness?\nQ3: What is one zero-budget marketing tactic you would launch immediately?',
        correctAnswer: 'Good allocation: Google My Business (0), local influencers (1,500), Meta retargeting ads (2,000), loyalty launch (1,500). Metrics: new customer count, average ticket, loyalty signups. Zero-budget: Google review push, referral program, partner with nearby businesses.',
        explanation: 'Evaluate budget allocation logic, metric selection quality, and creativity of zero-budget tactic.',
      
        rubricCriteria: [
          { id: 'mkt-q5-c1', label: 'Budget Allocation', description: 'Allocates AED 5,000 across specific channels with a clear rationale for each — not arbitrary splits', maxPoints: 10 },
          { id: 'mkt-q5-c2', label: 'Metrics Selection', description: '3 business metrics chosen (not vanity metrics like followers) that directly measure the 70-customer gap', maxPoints: 10 },
          { id: 'mkt-q5-c3', label: 'Zero-Budget Tactic', description: 'One specific, executable zero-cost tactic — not generic advice like "post more on Instagram"', maxPoints: 10 },
          { id: 'mkt-q5-c4', label: 'Strategic Coherence', description: 'Overall plan holds together — channels, metrics, and tactics all serve the same goal consistently', maxPoints: 5 },
        ],
      },
    ],
  },
// ─── 11 New Exams (v1.2 Exam Expansion) ──────────────────────────────────────
// Format: 5 MCQ × 10pts + 2 Practical × 15pts + 1 Case × 20pts = 100pts
// Passing score: 70. All questions grounded in CoffeePlace specialty coffee context.

  {
    id: 'exam-accounting-1',
    title: 'Accounting Fundamentals',
    category: 'Accounting',
    description: 'Test your understanding of bookkeeping, financial statements, COGS, and cash vs accrual accounting for a specialty coffee business.',
    passingScore: 70,
    timeLimit: 25,
    createdAt: now, updatedAt: now,
    questions: [
      {
        id: 'acc-q1', type: 'mcq', points: 10,
        question: 'CoffeePlace buys AED 3,000 of coffee beans in January but uses them in February. Under accrual accounting, when is the expense recorded?',
        options: ['February — when the beans are consumed (matched to revenue)', 'January — when the cash is paid', 'Split equally across both months', 'When the invoice is received, regardless of payment or use'],
        correctAnswer: 'February — when the beans are consumed (matched to revenue)',
        explanation: 'Accrual accounting matches expenses to the period the asset is consumed and revenue is earned — the Matching Principle.',
      },
      {
        id: 'acc-q2', type: 'mcq', points: 10,
        question: 'Which of these is a CURRENT LIABILITY on CoffeePlace\'s balance sheet?',
        options: ['Unpaid supplier invoices due this month', 'The espresso machine purchased on a 3-year loan', 'Retained earnings from prior year', 'Depreciation on store fixtures'],
        correctAnswer: 'Unpaid supplier invoices due this month',
        explanation: 'Current liabilities are obligations due within 12 months. Unpaid supplier invoices (accounts payable) are classic current liabilities.',
      },
      {
        id: 'acc-q3', type: 'mcq', points: 10,
        question: 'CoffeePlace\'s espresso machine cost AED 60,000 and has a 5-year useful life with no salvage value. Using straight-line depreciation, what is the monthly depreciation expense?',
        options: ['AED 1,000/month', 'AED 1,200/month', 'AED 5,000/month', 'AED 833/month'],
        correctAnswer: 'AED 1,000/month',
        explanation: 'Straight-line depreciation = (Cost − Salvage) / Useful life = 60,000 / 5 years = 12,000/year = AED 1,000/month.',
      },
      {
        id: 'acc-q4', type: 'mcq', points: 10,
        question: 'CoffeePlace sold AED 120,000 in coffee last month. Opening inventory was AED 8,000, purchases were AED 25,000, closing inventory is AED 6,000. What is COGS?',
        options: ['AED 27,000', 'AED 25,000', 'AED 33,000', 'AED 19,000'],
        correctAnswer: 'AED 27,000',
        explanation: 'COGS = Opening Inventory + Purchases − Closing Inventory = 8,000 + 25,000 − 6,000 = AED 27,000.',
      },
      {
        id: 'acc-q5', type: 'mcq', points: 10,
        question: 'What is the fundamental accounting equation?',
        options: ['Assets = Liabilities + Owner\'s Equity', 'Revenue − Expenses = Profit', 'Cash In − Cash Out = Net Position', 'Assets − Liabilities = Revenue'],
        correctAnswer: 'Assets = Liabilities + Owner\'s Equity',
        explanation: 'The accounting equation is the foundation of double-entry bookkeeping. Every transaction must keep this equation balanced.',
      },
      {
        id: 'acc-q6', type: 'practical', points: 15,
        question: 'Record the following 4 CoffeePlace transactions as journal entries (Account | Debit | Credit):\n\n1. Paid AED 12,000 rent in cash\n2. Sold AED 8,500 in coffee — customer paid by card\n3. Received AED 5,000 supplier invoice for beans (not yet paid)\n4. Bought AED 2,000 of cups/packaging with cash\n\nFor each: identify which accounts are affected and whether they are debited or credited.',
        correctAnswer: '1. Dr Rent Expense 12,000 / Cr Cash 12,000. 2. Dr Accounts Receivable/Cash 8,500 / Cr Revenue 8,500. 3. Dr Inventory 5,000 / Cr Accounts Payable 5,000. 4. Dr Supplies Expense 2,000 / Cr Cash 2,000.',
        explanation: 'Evaluate: correct account names, correct debit/credit direction, understanding of asset vs expense vs liability classification.',
      
        rubricCriteria: [
          { id: 'acc-q6-c1', label: 'Account Identification', description: 'All 4 transactions name the correct debit and credit accounts (e.g. Rent Expense, Cash, Accounts Payable, Inventory)', maxPoints: 5 },
          { id: 'acc-q6-c2', label: 'Debit/Credit Direction', description: 'All debit/credit directions are correct — assets debit to increase, liabilities credit to increase, expenses debit', maxPoints: 5 },
          { id: 'acc-q6-c3', label: 'Classification', description: 'Correctly classifies each account as asset, liability, expense, or revenue without mixing them up', maxPoints: 5 },
        ],
      },
      {
        id: 'acc-q7', type: 'practical', points: 15,
        question: 'CoffeePlace\'s accountant gives you three numbers at month end:\n• Net Profit (P&L): AED 18,000\n• Cash balance decreased by AED 3,000\n• You bought a new fridge for AED 21,000 cash\n\nExplain why net profit and cash changed differently. Walk through where the AED 21,000 fridge appears on each of the three financial statements (P&L, Balance Sheet, Cash Flow Statement).',
        correctAnswer: 'P&L: AED 350 depreciation expense (if 5yr life = AED 4,200/yr). Balance Sheet: fridge as fixed asset AED 21,000 (less accumulated depreciation). Cash Flow: AED 21,000 outflow in investing activities. Cash ≠ Profit because of the capital expenditure.',
        explanation: 'Core concept: capex hits cash flow immediately but hits P&L gradually through depreciation. This is why profitable businesses can run out of cash.',
      
        rubricCriteria: [
          { id: 'acc-q7-c1', label: 'P&L Explanation', description: 'Correctly explains why only depreciation (not the full AED 21,000) hits the P&L — matching principle applied', maxPoints: 5 },
          { id: 'acc-q7-c2', label: 'Balance Sheet', description: 'Correctly places fridge as a fixed asset (AED 21,000 less accumulated depreciation) — not expensed', maxPoints: 5 },
          { id: 'acc-q7-c3', label: 'Cash Flow Statement', description: 'Correctly classifies the AED 21,000 as an investing activity outflow and reconciles profit-cash difference', maxPoints: 5 },
        ],
      },
      {
        id: 'acc-q8', type: 'case', points: 20,
        question: 'CoffeePlace Branch 1 shows AED 22,000 net profit on the P&L, but the bank account dropped by AED 8,000 this month.\n\nYou discover:\n• Bought new brewing equipment: AED 18,000\n• Collected AED 4,000 from a corporate catering invoice (from last month)\n• Paid 3 months\' insurance upfront: AED 6,000\n• Received AED 2,000 prepayment from a corporate client for next month\n\nQ1: Reconcile the difference between net profit and cash movement.\nQ2: What does this tell you about the relationship between profitability and liquidity?\nQ3: What financial metric would you track weekly to avoid a cash crisis?',
        correctAnswer: 'Net profit 22,000. Adjustments: −18,000 capex, +4,000 AR collected, −6,000 prepaid insurance (balance sheet, not expense yet), +2,000 deferred revenue. Cash change = 22,000 − 18,000 + 4,000 − 6,000 + 2,000 = AED 4,000... but bank dropped 8k — one more item likely. Key insight: profit ≠ cash. Track: weekly cash flow forecast (13-week rolling).',
        explanation: 'This is the most important accounting concept for operators: a business can be profitable and insolvent simultaneously.',
      
        rubricCriteria: [
          { id: 'acc-q8-c1', label: 'Cash Reconciliation', description: 'Traces at least 3 of the 4 transactions to their correct cash impact with correct direction and amount', maxPoints: 5 },
          { id: 'acc-q8-c2', label: 'Profit vs Liquidity', description: 'Articulates clearly why profitable businesses can have negative cash flow — uses specific case data to illustrate', maxPoints: 5 },
          { id: 'acc-q8-c3', label: 'Weekly Metric', description: 'Names a specific, actionable cash metric (e.g. 13-week rolling cash forecast) — not just "check the bank balance"', maxPoints: 5 },
          { id: 'acc-q8-c4', label: 'Completeness', description: 'All three questions answered with no major factual omissions or logical contradictions', maxPoints: 5 },
        ],
      },
    ],
  },

  {
    id: 'exam-branding-1',
    title: 'Brand Building',
    category: 'Branding',
    description: 'Test your understanding of brand strategy, identity, storytelling, and how to build a brand that commands premium pricing in specialty coffee.',
    passingScore: 70,
    timeLimit: 25,
    createdAt: now, updatedAt: now,
    questions: [
      {
        id: 'brd-q1', type: 'mcq', points: 10,
        question: 'What is the difference between a logo and a brand?',
        options: [
          'A logo is a visual symbol; a brand is the total perception customers hold about the business',
          'A logo costs money to design; a brand is built for free through word of mouth',
          'A logo is trademarked; a brand is not legally protected',
          'A logo is for products; a brand is for service businesses',
        ],
        correctAnswer: 'A logo is a visual symbol; a brand is the total perception customers hold about the business',
        explanation: 'Brand = the sum of every interaction, feeling, and expectation a customer has. The logo is just one touchpoint.',
      },
      {
        id: 'brd-q2', type: 'mcq', points: 10,
        question: 'CoffeePlace charges AED 28 for a flat white when competitors charge AED 18. Customers pay without complaint. This pricing power is best explained by:',
        options: ['Brand equity — perceived value exceeds price for the target customer', 'Supply and demand — CoffeePlace has exclusive access to rare beans', 'Cost-plus pricing — their COGS is higher', 'Regulatory pricing — the market sets minimum prices'],
        correctAnswer: 'Brand equity — perceived value exceeds price for the target customer',
        explanation: 'Brand equity is the premium customers willingly pay for your brand over a generic alternative. It is the financial payoff of brand-building.',
      },
      {
        id: 'brd-q3', type: 'mcq', points: 10,
        question: 'Which of the following is a brand "touchpoint"?',
        options: ['All of the above — packaging, staff greeting, Instagram posts, and the receipt are all touchpoints', 'The product packaging only', 'The Instagram page only', 'The logo on the storefront only'],
        correctAnswer: 'All of the above — packaging, staff greeting, Instagram posts, and the receipt are all touchpoints',
        explanation: 'Every moment of contact between customer and brand is a touchpoint. Consistent experience across all touchpoints builds strong brands.',
      },
      {
        id: 'brd-q4', type: 'mcq', points: 10,
        question: 'A specialty coffee brand decides to also sell instant coffee sachets in supermarkets. This is risky because:',
        options: ['It can dilute the premium brand positioning built around craft and quality', 'Supermarket distribution is unprofitable for food businesses', 'Instant coffee has no market — it is a declining category', 'It would require a completely new logo and visual identity'],
        correctAnswer: 'It can dilute the premium brand positioning built around craft and quality',
        explanation: 'Brand extension into lower-quality categories risks damaging the perceived value of the core premium brand — the "contamination effect".',
      },
      {
        id: 'brd-q5', type: 'mcq', points: 10,
        question: 'What does "brand architecture" mean for a multi-concept coffee group?',
        options: [
          'How the parent brand and sub-brands relate to each other — whether products share the master brand or stand alone',
          'The physical design of the brand\'s store interiors and furniture layout',
          'The number of brand guidelines pages in the brand manual',
          'The organizational structure of the marketing team',
        ],
        correctAnswer: 'How the parent brand and sub-brands relate to each other — whether products share the master brand or stand alone',
        explanation: 'Brand architecture: Branded House (all under one name, e.g. Google/Gmail), House of Brands (separate brands, e.g. P&G), or hybrid. Strategic decision that affects marketing spend and brand equity.',
      },
      {
        id: 'brd-q6', type: 'practical', points: 15,
        question: 'Build a CoffeePlace Brand Story using the following structure:\n\n• Origin: Why CoffeePlace exists (the founder\'s real reason)\n• Tension: The problem in the market you are solving\n• Resolution: How CoffeePlace solves it differently\n• Proof: 2-3 concrete things CoffeePlace does that competitors don\'t\n• Promise: The one thing every customer can always expect\n\nWrite it as a 150-200 word narrative that could appear on the About page or be told to a journalist.',
        correctAnswer: 'Evaluate: authenticity of origin story, clarity of market problem, specificity of differentiation proof points, memorability of brand promise. Strong answers are specific to CoffeePlace, not generic coffee brand clichés.',
        explanation: 'Brand stories that include real tension and specific proof are more believable and more shareable than aspirational fluff.',
      
        rubricCriteria: [
          { id: 'brd-q6-c1', label: 'Story Structure', description: 'All 5 required elements covered: origin, tension, resolution, proof points, brand promise', maxPoints: 5 },
          { id: 'brd-q6-c2', label: 'Specificity', description: 'No generic coffee clichés — all proof points are uniquely true of CoffeePlace, verifiable, and concrete', maxPoints: 5 },
          { id: 'brd-q6-c3', label: 'Voice & Length', description: '150-200 words; tone is consistent throughout and would feel authentic in a media context', maxPoints: 5 },
        ],
      },
      {
        id: 'brd-q7', type: 'practical', points: 15,
        question: 'Define CoffeePlace\'s brand voice across 4 dimensions:\n\n1. Tone (e.g. warm and approachable vs authoritative and expert)\n2. Language style (vocabulary level, sentence length, use of jargon)\n3. What CoffeePlace would NEVER say (3 examples)\n4. Write 3 sample captions for Instagram posts: one product post, one behind-the-scenes post, one community/local post\n\nEach caption should be ≤ 100 words and clearly reflect the defined voice.',
        correctAnswer: 'Evaluate: internal consistency of voice across all 4 dimensions, specificity of "never say" examples, and whether captions actually sound like the defined voice. Weak answers define voice vaguely then write captions that contradict it.',
        explanation: 'Brand voice consistency is what makes a brand feel like a person, not a company — it builds trust and recognition.',
      
        rubricCriteria: [
          { id: 'brd-q7-c1', label: 'Voice Definition', description: 'Tone and language style are specific and internally consistent — not contradictory across the 4 dimensions', maxPoints: 5 },
          { id: 'brd-q7-c2', label: 'Never Say Examples', description: '3 examples are genuinely brand-contradicting — not just offensive things any brand would avoid', maxPoints: 5 },
          { id: 'brd-q7-c3', label: 'Caption Consistency', description: 'All 3 captions sound like the same brand — a reader could identify the brand from each caption alone', maxPoints: 5 },
        ],
      },
      {
        id: 'brd-q8', type: 'case', points: 20,
        question: 'A popular food blogger posts a negative review of CoffeePlace: "Overpriced, pretentious, and the barista made me feel dumb for asking for oat milk." The post gets 2,400 likes and 180 comments in 6 hours.\n\nQ1: Write the public response CoffeePlace should post (max 80 words). It must reflect the brand values.\nQ2: What should you do internally in the next 24 hours?\nQ3: How does this incident become a brand asset rather than a liability in the long run?',
        correctAnswer: 'Q1: Acknowledge the experience, apologize without being defensive, invite direct contact, show human voice. Q2: Brief team, identify the barista interaction, update service training, send personal message to blogger. Q3: Demonstrate how the business responded — public accountability builds trust. Document and improve the service SOP.',
        explanation: 'How a brand handles public criticism reveals its actual values more clearly than its marketing does. Great brand recovery turns critics into advocates.',
      
        rubricCriteria: [
          { id: 'brd-q8-c1', label: 'Public Response', description: 'Response is ≤80 words; acknowledges the specific complaint; apologises without being defensive; invites return', maxPoints: 5 },
          { id: 'brd-q8-c2', label: 'Internal Actions', description: '24-hour internal plan is specific — names the barista interaction, training update, and complaint logging steps', maxPoints: 5 },
          { id: 'brd-q8-c3', label: 'Long-term Asset', description: 'Explains concretely how public accountability becomes proof of brand values — not just "we will improve"', maxPoints: 5 },
          { id: 'brd-q8-c4', label: 'Brand Voice', description: 'Response genuinely sounds like CoffeePlace, not a corporate PR template — human, warm, specific', maxPoints: 5 },
        ],
      },
    ],
  },

  {
    id: 'exam-leadership-1',
    title: 'Leadership & Management',
    category: 'Leadership',
    description: 'Test your understanding of leadership styles, motivation, delegation, feedback, and building high-performing teams in a specialty coffee business.',
    passingScore: 70,
    timeLimit: 25,
    createdAt: now, updatedAt: now,
    questions: [
      {
        id: 'ldr-q1', type: 'mcq', points: 10,
        question: 'Your head barista is highly skilled but has been demotivated since you hired a second senior barista. According to Herzberg\'s Two-Factor Theory, which factor is most likely causing the demotivation?',
        options: ['Hygiene factor — recognition and status have changed, creating dissatisfaction', 'Motivator factor — the work itself is no longer challenging', 'Physiological need — their basic salary is insufficient', 'Safety need — they fear being replaced'],
        correctAnswer: 'Hygiene factor — recognition and status have changed, creating dissatisfaction',
        explanation: 'Herzberg: Hygiene factors (status, relationships, security) cause dissatisfaction when absent but don\'t motivate on their own. Motivators (achievement, recognition, growth) drive actual engagement.',
      },
      {
        id: 'ldr-q2', type: 'mcq', points: 10,
        question: 'As CoffeePlace founder, you make every decision — shift schedules, supplier calls, menu changes, and Instagram captions. This leadership failure is called:',
        options: ['Micromanagement — failing to delegate, creating a bottleneck and limiting team growth', 'Transformational leadership — ensuring quality by maintaining control', 'Servant leadership — putting the team first by staying involved', 'Directive leadership — appropriate for early-stage businesses'],
        correctAnswer: 'Micromanagement — failing to delegate, creating a bottleneck and limiting team growth',
        explanation: 'Micromanagement kills team ownership, limits scale, and burns out founders. The transition from operator to leader requires deliberate delegation.',
      },
      {
        id: 'ldr-q3', type: 'mcq', points: 10,
        question: 'Which leadership style is MOST appropriate when onboarding a new barista with no specialty coffee experience?',
        options: ['Directive (telling) — clear instructions, close supervision, step-by-step guidance', 'Delegative (laissez-faire) — give them space to figure it out', 'Participative — involve them in all team decisions from day one', 'Transformational — inspire them with the brand vision and let motivation drive quality'],
        correctAnswer: 'Directive (telling) — clear instructions, close supervision, step-by-step guidance',
        explanation: 'Situational Leadership: low-skill/high-will employees need directive style. As competence grows, move to coaching, then supporting, then delegating.',
      },
      {
        id: 'ldr-q4', type: 'mcq', points: 10,
        question: 'A team member makes the same latte art mistake for the third time. The best feedback approach is:',
        options: ['Specific behavioral feedback privately: describe the exact mistake, the impact, and ask them to commit to a change', 'Praise them publicly for effort and quietly lower their responsibilities', 'Address it in the team meeting to create accountability across the group', 'Write a formal warning letter to document the issue'],
        correctAnswer: 'Specific behavioral feedback privately: describe the exact mistake, the impact, and ask them to commit to a change',
        explanation: 'Effective feedback: specific (not general), behavioral (not personal), timely, private, and ends with a commitment. The SBI model: Situation → Behavior → Impact.',
      },
      {
        id: 'ldr-q5', type: 'mcq', points: 10,
        question: 'Tuckman\'s team development model describes stages as:',
        options: ['Forming → Storming → Norming → Performing', 'Hiring → Training → Managing → Retaining', 'Orienting → Conflicting → Aligning → Executing', 'Onboarding → Developing → Leading → Promoting'],
        correctAnswer: 'Forming → Storming → Norming → Performing',
        explanation: 'Tuckman: Every team goes through these 4 stages. Storming (conflict phase) is normal and necessary — leaders who avoid it prevent teams from reaching Performing.',
      },
      {
        id: 'ldr-q6', type: 'practical', points: 15,
        question: 'Your best barista, Ahmed, has started coming in late (3 times in 2 weeks), his attitude on shift has changed, and a regular customer complained that he seemed distracted. You have no written warnings on file.\n\nUsing the SBI feedback model (Situation → Behavior → Impact), write the script for a private 10-minute conversation with Ahmed.\n\nInclude: the opening, what you observed, the business impact, a question to hear his perspective, and how you close with a clear agreement.',
        correctAnswer: 'Strong answers: start with care not accusation, use specific observations (not "your attitude"), name the business impact (customer complaint, service standard), ask open questions, close with a specific agreement and follow-up date. Avoid: ultimatums, assumptions about causes, disciplinary threats before understanding context.',
        explanation: 'The best leaders address performance issues early, compassionately, and specifically — not after a crisis.',
      
        rubricCriteria: [
          { id: 'ldr-q6-c1', label: 'SBI Structure', description: 'Uses Situation-Behavior-Impact correctly — behavioral observations stated (not assumptions about personality)', maxPoints: 5 },
          { id: 'ldr-q6-c2', label: 'Tone & Empathy', description: 'Conversation opens with care, not accusation; includes an open question to hear Ahmed\'s perspective', maxPoints: 5 },
          { id: 'ldr-q6-c3', label: 'Clear Agreement', description: 'Closes with a specific behavioral commitment and a defined follow-up date — not vague \"let\'s see how it goes\"', maxPoints: 5 },
        ],
      },
      {
        id: 'ldr-q7', type: 'practical', points: 15,
        question: 'You want to delegate responsibility for weekly inventory counting and ordering to your senior barista, Sara. She has never done this before and is nervous about making mistakes.\n\nWrite a Delegation Brief for Sara that includes:\n• The task and its scope (what is and isn\'t included)\n• Why you are delegating it to her specifically\n• The training/support she will receive\n• The decision rights she has vs when to escalate to you\n• The success metric and review date\n\nThen identify 2 risks of this delegation and how you will mitigate them.',
        correctAnswer: 'Strong answers: clearly bound scope, specific rationale (builds confidence), structured handover plan, clear escalation threshold (e.g. orders > AED 2,000 check with me), measurable success metric. Risks: ordering errors (mitigation: approval for first 3 orders), over-ordering (mitigation: set par levels and max order limits).',
        explanation: 'Effective delegation is not dumping tasks — it is a structured transfer of ownership with support and clear boundaries.',
      
        rubricCriteria: [
          { id: 'ldr-q7-c1', label: 'Delegation Clarity', description: 'Scope, rationale, and decision rights are clearly bounded — Sara knows what she can and cannot decide alone', maxPoints: 5 },
          { id: 'ldr-q7-c2', label: 'Support Structure', description: 'Training plan, escalation threshold, and success metric are all specific and measurable', maxPoints: 5 },
          { id: 'ldr-q7-c3', label: 'Risk Management', description: '2 realistic, scenario-specific risks with concrete mitigation strategies (not generic "check her work")', maxPoints: 5 },
        ],
      },
      {
        id: 'ldr-q8', type: 'case', points: 20,
        question: 'Two of your baristas, Layla and Marco, have been in ongoing conflict. Layla believes Marco takes credit for her ideas in team meetings. Marco believes Layla deliberately undermines him with new staff. The conflict is now affecting shift handovers — there have been 3 service errors in one week traced to poor communication between them.\n\nQ1: What do you do in the next 48 hours?\nQ2: How do you facilitate a resolution conversation between them?\nQ3: If the conflict continues after mediation, what are your options and what are the organizational implications of each?',
        correctAnswer: 'Q1: Separate conversations with each individually — listen, do not take sides. Document what you observe behaviorally. Q2: Facilitated conversation: ground rules, each shares their experience (not accusations), identify shared interests (good service, team respect), agree specific behavioral changes. Q3: Options: role redesign (different shifts), formal performance plan, separation. Each carries retention risk and team culture signal.',
        explanation: 'Conflict left unresolved becomes culture. Leaders who avoid it pay in attrition, quality failures, and team morale.',
      
        rubricCriteria: [
          { id: 'ldr-q8-c1', label: 'Immediate Response', description: '48-hour plan is fact-gathering only — individual conversations, no side-taking, behavioral observations documented', maxPoints: 5 },
          { id: 'ldr-q8-c2', label: 'Mediation Design', description: 'Resolution conversation has clear structure: ground rules → perspectives → shared interests → specific agreements', maxPoints: 5 },
          { id: 'ldr-q8-c3', label: 'Escalation Options', description: 'All post-mediation options stated honestly with their organisational implications — no option dismissed', maxPoints: 5 },
          { id: 'ldr-q8-c4', label: 'Systems Thinking', description: 'Frames the conflict as a structural/cultural issue that leadership created or enabled — not just two bad people', maxPoints: 5 },
        ],
      },
    ],
  },

  {
    id: 'exam-hr-1',
    title: 'Human Resources & People Management',
    category: 'HR',
    description: 'Test your understanding of hiring, onboarding, performance management, compensation, and building a team culture at CoffeePlace.',
    passingScore: 70,
    timeLimit: 25,
    createdAt: now, updatedAt: now,
    questions: [
      {
        id: 'hr-q1', type: 'mcq', points: 10,
        question: 'What is the PRIMARY purpose of a structured onboarding program for a new CoffeePlace barista?',
        options: [
          'Reduce time-to-productivity and increase first-year retention by making new hires feel competent and connected from day one',
          'Complete all legal paperwork and government registration before the employee starts work',
          'Test whether the employee can handle pressure during their first week',
          'Ensure the employee learns the menu before customer interaction',
        ],
        correctAnswer: 'Reduce time-to-productivity and increase first-year retention by making new hires feel competent and connected from day one',
        explanation: 'Companies with strong onboarding improve new hire retention by 82% and productivity by 70% (BambooHR, 2022). The first 90 days are the highest attrition risk period.',
      },
      {
        id: 'hr-q2', type: 'mcq', points: 10,
        question: 'You need to hire a senior barista. Which combination of assessment methods will give you the most accurate prediction of on-the-job performance?',
        options: [
          'Structured interview + skills assessment (live bar session) + reference check',
          'CV review + unstructured interview based on gut feeling',
          'Personality test + culture fit interview with the founder only',
          'Trial shift (unpaid) + probation period observation',
        ],
        correctAnswer: 'Structured interview + skills assessment (live bar session) + reference check',
        explanation: 'Research shows structured interviews (consistent questions, scored responses) combined with work samples have the highest predictive validity for job performance. Unstructured interviews have poor validity.',
      },
      {
        id: 'hr-q3', type: 'mcq', points: 10,
        question: 'CoffeePlace pays baristas AED 4,500/month. A competitor opens 200m away and offers AED 5,200/month. Your best barista mentions this casually. The WORST response is:',
        options: [
          'Immediately match the offer without any conversation about performance or role expectations',
          'Have an honest conversation about their value, your constraints, and what else motivates them beyond salary',
          'Review your compensation structure across the team before making any individual offer',
          'Acknowledge the market reality and propose a performance-based increase timeline',
        ],
        correctAnswer: 'Immediately match the offer without any conversation about performance or role expectations',
        explanation: 'Reactive counter-offers without structure create inequity, precedent, and short-term loyalty. The best approach addresses the whole compensation picture and retention drivers.',
      },
      {
        id: 'hr-q4', type: 'mcq', points: 10,
        question: 'A performance review should primarily be:',
        options: [
          'A two-way conversation about progress, growth, and goals — not just a rating exercise',
          'A formal annual document to justify salary decisions',
          'An opportunity for the manager to tell the employee how they have performed',
          'A probation assessment used to decide whether to keep the employee',
        ],
        correctAnswer: 'A two-way conversation about progress, growth, and goals — not just a rating exercise',
        explanation: 'Effective performance reviews are continuous and developmental. Annual reviews with no ongoing feedback are ineffective and legally risky. Best practice: monthly 1:1s + quarterly reviews + annual deep-dive.',
      },
      {
        id: 'hr-q5', type: 'mcq', points: 10,
        question: 'What is "employer branding" and why does it matter for CoffeePlace?',
        options: [
          'The reputation CoffeePlace has as a place to work — it determines the quality of applicants and reduces hiring costs',
          'The way CoffeePlace promotes its HR department on LinkedIn',
          'The employee handbook and code of conduct that represents company values',
          'The uniform and physical brand identity worn by the team',
        ],
        correctAnswer: 'The reputation CoffeePlace has as a place to work — it determines the quality of applicants and reduces hiring costs',
        explanation: 'A strong employer brand means top candidates apply to you — reducing cost-per-hire and time-to-fill. Specialty coffee has a tight talent community where reputation spreads quickly.',
      },
      {
        id: 'hr-q6', type: 'practical', points: 15,
        question: 'Write a complete job description for a CoffeePlace Senior Barista role.\n\nInclude:\n• Job title and reporting line\n• Role purpose (2 sentences max)\n• Key responsibilities (5–7 bullets)\n• Required qualifications and skills (technical + soft)\n• What CoffeePlace offers (beyond just salary)\n• A closing statement that reflects the brand voice\n\nThe job description should attract high-quality specialty coffee professionals, not just anyone looking for cafe work.',
        correctAnswer: 'Strong answers: role purpose is specific and inspiring (not generic), responsibilities include training/mentorship as well as bar work, qualifications are specific (e.g. SCA certified or equivalent experience), offer section includes growth/culture not just pay, closing reflects brand identity. Weak answers: generic bullet lists that could apply to any café.',
        explanation: 'A job description is the first brand touchpoint for candidates. It filters and attracts. Poor JDs attract poor applicants.',
      
        rubricCriteria: [
          { id: 'hr-q6-c1', label: 'Role Content', description: 'Role purpose is specific and inspiring; responsibilities include full senior scope (training, quality, not just bar work)', maxPoints: 5 },
          { id: 'hr-q6-c2', label: 'Qualification Specificity', description: 'Technical and soft requirements are genuinely discriminating — not "good at coffee" or "team player"', maxPoints: 5 },
          { id: 'hr-q6-c3', label: 'Brand Voice & Offer', description: 'Closing reflects CoffeePlace brand identity; offer section goes beyond salary to culture and growth', maxPoints: 5 },
        ],
      },
      {
        id: 'hr-q7', type: 'practical', points: 15,
        question: 'Design a 30-60-90 Day Onboarding Plan for a new CoffeePlace barista.\n\nFor each phase, define:\n• The primary goal of that phase\n• 3–5 specific activities or milestones\n• How success is measured at the end of the phase\n• Who is responsible for delivery\n\nAssume the hire has barista experience but no specialty coffee training.',
        correctAnswer: 'Day 1–30: Goal = orientation and basic competency. Activities: brand immersion, equipment training, SOP review, buddy assignment, first solo shift. Measure: passes bar calibration test, knows full menu. Day 31–60: Goal = independence. Activities: takes opening shifts solo, handles complaints, learns inventory. Measure: zero service errors for 2 weeks, positive peer feedback. Day 61–90: Goal = ownership. Activities: runs training session for new hire, takes on inventory role, 90-day review. Measure: self-assessment score, manager rating, retention commitment.',
        explanation: 'The best onboarding plans have progressive autonomy — increasing responsibility as competence is demonstrated, not just time passing.',
      
        rubricCriteria: [
          { id: 'hr-q7-c1', label: 'Phase Goals', description: 'Each of 3 phases has a distinct primary goal with a measurable milestone (not time-based completion)', maxPoints: 5 },
          { id: 'hr-q7-c2', label: 'Activity Specificity', description: 'Activities are specific enough to put in a calendar — not vague descriptions of "getting to know the role"', maxPoints: 5 },
          { id: 'hr-q7-c3', label: 'Success Measurement', description: 'Each phase ends with observable, pass/fail success criteria defined in advance — not retrospective rating', maxPoints: 5 },
        ],
      },
      {
        id: 'hr-q8', type: 'case', points: 20,
        question: 'CoffeePlace has 6 staff. In the past 3 months, 2 have resigned — one for a higher salary elsewhere, one citing "not feeling valued." Exit interviews revealed: no career development conversations, inconsistent feedback, and founder is "hard to approach."\n\nQ1: Diagnose the root cause of the turnover.\nQ2: Design 3 specific retention interventions you will implement in the next 30 days.\nQ3: What people management system will you build to prevent this pattern repeating as you scale to 3 branches?',
        correctAnswer: 'Root cause: absence of structured development, recognition, and psychological safety — not just compensation. Interventions: monthly 1:1s (structured agenda), skills development plan per employee, informal recognition habit (weekly shoutout). System: onboarding SOP, 90-day reviews, annual compensation review cycle, team pulse survey quarterly, promotion pathway document.',
        explanation: 'Turnover is expensive: replacing a barista costs 50–200% of their annual salary when you include recruitment, training, and productivity loss.',
      
        rubricCriteria: [
          { id: 'hr-q8-c1', label: 'Root Cause Diagnosis', description: 'Identifies structural causes (not individual blame) using evidence from the exit interview data in the case', maxPoints: 5 },
          { id: 'hr-q8-c2', label: '30-Day Interventions', description: '3 interventions are specific, implementable this month, and address different root causes — not three versions of the same fix', maxPoints: 5 },
          { id: 'hr-q8-c3', label: 'Scalable Systems', description: 'Proposed systems address the pattern — creates infrastructure that works at 3 branches, not just a one-off fix', maxPoints: 5 },
          { id: 'hr-q8-c4', label: 'Commercial Awareness', description: 'Acknowledges the financial cost of turnover and frames retention investment as ROI — not just \"it\'s the right thing to do\"', maxPoints: 5 },
        ],
      },
    ],
  },

  {
    id: 'exam-entrepreneurship-1',
    title: 'Entrepreneurship & Founder Mindset',
    category: 'Entrepreneurship',
    description: 'Test your understanding of business models, founder decision-making, bootstrapping, validation, and building a scalable specialty coffee venture.',
    passingScore: 70,
    timeLimit: 25,
    createdAt: now, updatedAt: now,
    questions: [
      {
        id: 'ent-q1', type: 'mcq', points: 10,
        question: 'The Business Model Canvas has 9 building blocks. Which block answers the question "How do we make money?"',
        options: ['Revenue Streams', 'Value Proposition', 'Customer Segments', 'Key Activities'],
        correctAnswer: 'Revenue Streams',
        explanation: 'Revenue Streams: how the business earns money from each customer segment — could be cups sold, subscriptions, catering contracts, merchandise, training.',
      },
      {
        id: 'ent-q2', type: 'mcq', points: 10,
        question: 'CoffeePlace wants to test whether corporate offices will pay for a weekly in-office coffee service before investing in the equipment. The LEAN approach is:',
        options: [
          'Run the service manually (borrow equipment, hire freelance barista) for 3 clients — validate demand before building the system',
          'Build a full corporate service offering with branded equipment and pricing deck first',
          'Survey 100 office managers about whether they would be interested',
          'Hire a consultant to research the B2B coffee service market',
        ],
        correctAnswer: 'Run the service manually (borrow equipment, hire freelance barista) for 3 clients — validate demand before building the system',
        explanation: 'Lean Startup: Build-Measure-Learn. MVP = minimum viable product/process. Manual "concierge MVP" validates real demand before expensive infrastructure investment.',
      },
      {
        id: 'ent-q3', type: 'mcq', points: 10,
        question: 'Which of the following is a "vanity metric" that feels good but doesn\'t help you make better business decisions?',
        options: ['Total Instagram followers', 'Revenue per available seat hour', 'Customer acquisition cost by channel', 'Weekly gross margin by product category'],
        correctAnswer: 'Total Instagram followers',
        explanation: 'Vanity metrics (followers, page views, likes) feel good but don\'t correlate to revenue or profit. Actionable metrics (CAC, LTV, margin by product) drive decisions.',
      },
      {
        id: 'ent-q4', type: 'mcq', points: 10,
        question: 'A startup "pivot" is best defined as:',
        options: [
          'A structured course correction — changing one or more elements of the business model based on validated learning',
          'Completely abandoning the original idea and starting a different business',
          'Firing the founding team and bringing in professional management',
          'Reducing costs aggressively when revenue targets are missed',
        ],
        correctAnswer: 'A structured course correction — changing one or more elements of the business model based on validated learning',
        explanation: 'Eric Ries (Lean Startup): A pivot keeps one foot in what is working while fundamentally changing another element — customer segment, channel, revenue model, value proposition.',
      },
      {
        id: 'ent-q5', type: 'mcq', points: 10,
        question: 'The "founder\'s dilemma" (Noam Wasserman) refers to the tension between:',
        options: [
          'Wanting to stay in control (King) vs wanting to build maximum value/wealth (Rich)',
          'Working in the business vs working on the business',
          'Bootstrapping the venture vs raising external investment',
          'Being a technical expert vs being a business generalist',
        ],
        correctAnswer: 'Wanting to stay in control (King) vs wanting to build maximum value/wealth (Rich)',
        explanation: 'Most founders cannot maximize both control and value. Investors give capital but take equity and board seats. Bootstrapping keeps control but limits speed. Understanding which you want shapes every major decision.',
      },
      {
        id: 'ent-q6', type: 'practical', points: 15,
        question: 'Complete a Business Model Canvas for CoffeePlace as it stands today.\n\nFor each of the 9 blocks, write 2–4 specific items:\n1. Customer Segments\n2. Value Propositions\n3. Channels\n4. Customer Relationships\n5. Revenue Streams\n6. Key Resources\n7. Key Activities\n8. Key Partners\n9. Cost Structure\n\nThen identify: which block is your current biggest weakness? What would you change to strengthen it?',
        correctAnswer: 'Evaluate specificity and honesty. Strong answers: specific customer segments (not "everyone who drinks coffee"), clear value proposition (what CoffeePlace does differently), multiple revenue streams identified, self-aware weakness. Common mistakes: generic answers, confusing Activities with Resources, no clear differentiation in Value Proposition.',
        explanation: 'The BMC is a strategic snapshot. The real value is in seeing how the 9 blocks connect and reinforce each other — or don\'t.',
      
        rubricCriteria: [
          { id: 'ent-q6-c1', label: 'BMC Completeness', description: 'All 9 blocks completed with 2-4 specific CoffeePlace items each — no generic placeholders', maxPoints: 5 },
          { id: 'ent-q6-c2', label: 'BMC Coherence', description: 'Blocks connect logically — Key Activities align with Value Proposition; Revenue Streams serve Customer Segments', maxPoints: 5 },
          { id: 'ent-q6-c3', label: 'Self-Aware Weakness', description: 'Identifies a genuine weak block (not the obvious one) with a specific direction to strengthen it', maxPoints: 5 },
        ],
      },
      {
        id: 'ent-q7', type: 'practical', points: 15,
        question: 'CoffeePlace is 8 months old. You are considering 3 growth options:\n\nOption A: Open Branch 2 in a premium mall\nOption B: Launch a wholesale bean subscription for home coffee lovers\nOption C: Build a barista training academy and certify other cafe staff\n\nUsing the Ansoff Matrix (Market Penetration / Market Development / Product Development / Diversification), classify each option. Then recommend which ONE to pursue first and why, using at least 3 business criteria.',
        correctAnswer: 'A = Market Development (new location/market, same product). B = Product Development (new product — subscription — to potentially new segment). C = Diversification (new product + new market). Recommendation criteria: capital requirements, time-to-revenue, founder skill fit, brand leverage, risk level. Strong answers pick ONE and justify it — not "it depends."',
        explanation: 'The Ansoff Matrix reveals risk levels: Market Penetration (lowest risk) → Market Development → Product Development → Diversification (highest risk).',
      
        rubricCriteria: [
          { id: 'ent-q7-c1', label: 'Ansoff Classification', description: 'All 3 options correctly classified with brief justification using the matrix terminology', maxPoints: 5 },
          { id: 'ent-q7-c2', label: 'Recommendation Quality', description: 'Picks ONE option with at least 3 substantive business criteria — not "it feels right" or vague preference', maxPoints: 5 },
          { id: 'ent-q7-c3', label: 'Risk Awareness', description: 'Recommendation acknowledges the specific risks and trade-offs of the chosen path — not only the upside', maxPoints: 5 },
        ],
      },
      {
        id: 'ent-q8', type: 'case', points: 20,
        question: 'CoffeePlace Month 9. Revenue: AED 140,000/month. Net margin: 28%. You have been approached by:\n\n(A) An angel investor offering AED 500,000 for 25% equity\n(B) A local F&B group offering to franchise 3 locations and pay you AED 80,000/year in royalties\n(C) A bank offering a AED 400,000 business loan at 7% annual interest\n\nQ1: What valuation does the angel deal imply for CoffeePlace?\nQ2: Compare all 3 options across: control, capital, speed, risk, and upside.\nQ3: Which would you choose and why? What information would you need before deciding?',
        correctAnswer: 'Q1: 500,000/0.25 = AED 2,000,000 implied valuation. Q2: Angel: dilution + board seat + high upside if IPO/exit. Franchise: no dilution, passive income, but brand risk from franchisee quality. Loan: full control, fixed cost, repayment pressure, no equity dilution. Q3: No single right answer — evaluate quality of reasoning, risk awareness, and information needs (e.g. angel\'s track record, franchise agreement terms, loan covenants).',
        explanation: 'Fundraising decisions are irreversible. Taking the wrong money is worse than taking no money. The best founders know their own goals first.',
      
        rubricCriteria: [
          { id: 'ent-q8-c1', label: 'Valuation Math', description: 'Correctly calculates AED 2,000,000 implied valuation and benchmarks it against revenue or comparable multiples', maxPoints: 5 },
          { id: 'ent-q8-c2', label: 'Option Comparison', description: 'All 3 options compared across all 5 dimensions with specificity — no dimension skipped for any option', maxPoints: 5 },
          { id: 'ent-q8-c3', label: 'Decision Quality', description: 'Picks an option with reasoning tied to personal goals and business stage — not just "the highest valuation"', maxPoints: 5 },
          { id: 'ent-q8-c4', label: 'Information Needs', description: 'Names specific additional information needed before deciding — not generic "I need to do more research"', maxPoints: 5 },
        ],
      },
    ],
  },

  {
    id: 'exam-strategy-1',
    title: 'Business Strategy',
    category: 'Strategy',
    description: 'Test your understanding of competitive strategy, market positioning, strategic planning frameworks, and long-term thinking for building a specialty coffee brand.',
    passingScore: 70,
    timeLimit: 25,
    createdAt: now, updatedAt: now,
    questions: [
      {
        id: 'str-q1', type: 'mcq', points: 10,
        question: 'Porter\'s Five Forces analyzes industry attractiveness. Which force is MOST relevant when a new premium coffee chain opens 300m from CoffeePlace?',
        options: ['Threat of New Entrants', 'Rivalry Among Existing Competitors', 'Bargaining Power of Buyers', 'Threat of Substitutes'],
        correctAnswer: 'Rivalry Among Existing Competitors',
        explanation: 'An existing competitor opening nearby intensifies rivalry — the most direct competitive threat. Threat of New Entrants was relevant before they opened. Now they are a rival.',
      },
      {
        id: 'str-q2', type: 'mcq', points: 10,
        question: 'Porter\'s three generic competitive strategies are:',
        options: ['Cost Leadership, Differentiation, Focus', 'Growth, Stability, Retrenchment', 'Offensive, Defensive, Alliance', 'Price, Quality, Speed'],
        correctAnswer: 'Cost Leadership, Differentiation, Focus',
        explanation: 'Porter: pick one. Trying to be lowest cost AND most differentiated leads to being "stuck in the middle" — no sustainable advantage. CoffeePlace should clearly be in Differentiation or Differentiation Focus.',
      },
      {
        id: 'str-q3', type: 'mcq', points: 10,
        question: 'A "strategic moat" for CoffeePlace would be:',
        options: [
          'A loyalty program with 5,000+ members who visit 3x/week — high switching costs and habitual behavior',
          'A lower price than all competitors in the area',
          'A new espresso machine that competitors could also buy',
          'A marketing campaign that wins a design award',
        ],
        correctAnswer: 'A loyalty program with 5,000+ members who visit 3x/week — high switching costs and habitual behavior',
        explanation: 'A moat = durable competitive advantage that is hard to copy. Loyalty programs with deep habit formation create switching costs — one of Morningstar\'s 5 moat types.',
      },
      {
        id: 'str-q4', type: 'mcq', points: 10,
        question: 'The "Hedgehog Concept" (Jim Collins) applied to CoffeePlace means:',
        options: [
          'Finding the intersection of: what you are deeply passionate about, what you can be the best at, and what drives your economic engine',
          'Protecting your market position by making your menu and processes difficult to copy',
          'Growing slowly and steadily rather than pursuing aggressive expansion',
          'Focusing exclusively on one product (espresso) rather than building a full menu',
        ],
        correctAnswer: 'Finding the intersection of: what you are deeply passionate about, what you can be the best at, and what drives your economic engine',
        explanation: 'From "Good to Great": the Hedgehog Concept is a disciplined answer to THREE questions simultaneously — passion, best-in-world capability, and economic engine.',
      },
      {
        id: 'str-q5', type: 'mcq', points: 10,
        question: 'Blue Ocean Strategy recommends using the ERRC framework. What does ERRC stand for?',
        options: ['Eliminate, Reduce, Raise, Create', 'Evaluate, Research, Realign, Compete', 'Expand, Retain, Refocus, Consolidate', 'Enter, Regulate, Reach, Convert'],
        correctAnswer: 'Eliminate, Reduce, Raise, Create',
        explanation: 'ERRC Grid: Eliminate factors the industry takes for granted, Reduce below industry standard, Raise above industry standard, Create factors the industry has never offered. Used to find uncontested market space.',
      },
      {
        id: 'str-q6', type: 'practical', points: 15,
        question: 'Conduct a full SWOT analysis for CoffeePlace.\n\nFor each quadrant, write 4 specific, honest points (not generic):\n• Strengths: internal capabilities you genuinely have\n• Weaknesses: real internal gaps or limitations\n• Opportunities: external trends or gaps in the market\n• Threats: external forces that could hurt the business\n\nThen complete a TOWS matrix: identify one SO strategy (use strength to capture opportunity), one WO strategy (fix weakness to capture opportunity), one ST strategy (use strength to counter threat), and one WT strategy (minimize weakness to avoid threat).',
        correctAnswer: 'Evaluate specificity and honesty. Strong SWOT: avoids generic statements ("good product" = weak; "18-month relationship with single-origin Yemen supplier" = strong). TOWS matrix evaluated on logical connection between quadrants — the strategy must actually use the identified S/W/O/T.',
        explanation: 'SWOT without a TOWS is just list-making. The TOWS generates actual strategic options from the analysis.',
      
        rubricCriteria: [
          { id: 'str-q6-c1', label: 'SWOT Honesty', description: 'All 4 quadrants contain honest, specific items — weaknesses especially are self-critical and real', maxPoints: 5 },
          { id: 'str-q6-c2', label: 'SWOT Specificity', description: 'No generic items ("good product", "competition") — each point is uniquely and verifiably true of CoffeePlace', maxPoints: 5 },
          { id: 'str-q6-c3', label: 'TOWS Logic', description: 'All 4 TOWS strategies logically use the correct quadrant combination with a strategy that actually uses those S/W/O/T', maxPoints: 5 },
        ],
      },
      {
        id: 'str-q7', type: 'practical', points: 15,
        question: 'Apply Porter\'s Five Forces to CoffeePlace\'s local specialty coffee market.\n\nFor each force, rate the intensity (Low/Medium/High) and provide 2 specific factors that justify the rating:\n1. Threat of New Entrants\n2. Bargaining Power of Suppliers\n3. Bargaining Power of Buyers\n4. Threat of Substitutes\n5. Rivalry Among Existing Competitors\n\nConclude: Is this an attractive industry to be in? What does your analysis imply for CoffeePlace\'s strategy?',
        correctAnswer: 'No single correct ratings — evaluate quality of reasoning. Good answers: New Entrants (Medium-High — low capital barrier but brand/skill barrier), Suppliers (Medium — specialty importers have some power but alternatives exist), Buyers (Medium — individual consumers have low power, corporate accounts have more), Substitutes (High — tea, energy drinks, home brewing), Rivalry (High — many cafes competing for same premium customers). Conclusion should link force levels to strategic choices.',
        explanation: 'Five Forces reveals industry profitability potential. High forces across the board = commoditized industry. Strong performers build moats against the highest-intensity forces.',
      
        rubricCriteria: [
          { id: 'str-q7-c1', label: 'Force Ratings', description: 'All 5 forces rated (Low/Medium/High) with 2 specific justifying factors each — no force left vague', maxPoints: 5 },
          { id: 'str-q7-c2', label: 'Rating Consistency', description: 'Ratings are logically consistent with the factors — stated factors actually justify the rating given', maxPoints: 5 },
          { id: 'str-q7-c3', label: 'Strategic Implication', description: 'Conclusion connects force analysis to specific strategic choices for CoffeePlace — not generic advice', maxPoints: 5 },
        ],
      },
      {
        id: 'str-q8', type: 'case', points: 20,
        question: 'A well-funded Saudi specialty coffee chain (20 locations) has announced it is opening in your city. They have better funding, larger locations, and a strong brand. CoffeePlace has 1 location.\n\nQ1: Using competitive strategy frameworks, how should CoffeePlace respond?\nQ2: What are 3 advantages CoffeePlace has that the chain cannot easily replicate?\nQ3: Develop a 90-day strategic response plan with specific actions.',
        correctAnswer: 'Q1: Focus differentiation — do not compete on scale, compete on depth. Protect your community. Q2: Local roots, personal founder-customer relationships, faster decision-making, neighborhood authenticity. Q3: 90-day plan: Week 1-2: brief team, audit experience quality. Month 1: deepen loyalty program, launch "founding member" recognition. Month 2: community events, local partnerships, PR about local story. Month 3: review customer metrics, double down on what\'s working.',
        explanation: 'David vs Goliath strategy: smaller players win by being more focused, more personal, and faster — not by trying to match the larger competitor\'s strengths.',
      
        rubricCriteria: [
          { id: 'str-q8-c1', label: 'Strategic Framework', description: 'Applies at least one named framework correctly (differentiation, focus, Blue Ocean, etc.) with specific application', maxPoints: 5 },
          { id: 'str-q8-c2', label: 'Competitive Advantage', description: '3 genuine CoffeePlace advantages the chain cannot easily replicate — not things the chain also has', maxPoints: 5 },
          { id: 'str-q8-c3', label: '90-Day Plan', description: 'Actions are specific and time-bound — "deepen loyalty program by launching X feature" not "improve quality"', maxPoints: 5 },
          { id: 'str-q8-c4', label: 'Counterargument', description: 'Acknowledges where the chain has genuine advantage and does not dismiss it — intellectual honesty shown', maxPoints: 5 },
        ],
      },
    ],
  },

  {
    id: 'exam-analytics-1',
    title: 'Business Analytics & Data-Driven Decisions',
    category: 'Analytics',
    description: 'Test your ability to collect, interpret, and act on business data to improve CoffeePlace performance across operations, marketing, and finance.',
    passingScore: 70,
    timeLimit: 25,
    createdAt: now, updatedAt: now,
    questions: [
      {
        id: 'anl-q1', type: 'mcq', points: 10,
        question: 'CoffeePlace\'s average transaction value dropped from AED 26 to AED 21 over 3 months. Before investigating causes, you should first:',
        options: [
          'Segment the data — by time of day, product category, and customer type — to isolate where the drop is happening',
          'Immediately run a discount promotion to bring transaction value back up',
          'Retrain all staff on upselling techniques',
          'Assume it is seasonal and wait another month for data',
        ],
        correctAnswer: 'Segment the data — by time of day, product category, and customer type — to isolate where the drop is happening',
        explanation: 'Average metrics hide the story. Segmentation reveals whether the problem is product mix, customer type, time of day, or staff performance — each requiring a different fix.',
      },
      {
        id: 'anl-q2', type: 'mcq', points: 10,
        question: 'CoffeePlace\'s NPS (Net Promoter Score) is +42. This means:',
        options: [
          '42% more customers would recommend CoffeePlace than would not — indicating good but improvable loyalty',
          '42% of all customers are Promoters',
          'CoffeePlace has 42 more Promoters than Detractors in total count',
          'The average customer rating is 4.2 out of 5',
        ],
        correctAnswer: '42% more customers would recommend CoffeePlace than would not — indicating good but improvable loyalty',
        explanation: 'NPS = % Promoters − % Detractors. Score of +42 is good (world class is 70+). Benchmark: specialty coffee industry average is around +30–45.',
      },
      {
        id: 'anl-q3', type: 'mcq', points: 10,
        question: 'A "cohort analysis" for CoffeePlace would help you answer:',
        options: [
          'Do customers who joined in January still visit 6 months later — and how does their behavior differ from June joiners?',
          'What is the total number of unique customers per month?',
          'Which products sell the most each week?',
          'What time of day has the highest transaction volume?',
        ],
        correctAnswer: 'Do customers who joined in January still visit 6 months later — and how does their behavior differ from June joiners?',
        explanation: 'Cohort analysis tracks groups of customers over time. It reveals retention patterns, LTV, and whether product/service changes actually improved customer longevity.',
      },
      {
        id: 'anl-q4', type: 'mcq', points: 10,
        question: 'Your POS data shows Monday morning has 40% lower sales than Thursday morning at the same hours. The BEST next step is:',
        options: [
          'Observe Monday morning operations directly — staffing, foot traffic, product availability — before assuming a cause',
          'Reduce Monday morning staff to cut costs since revenue is lower anyway',
          'Run a Monday-only promotion to artificially boost the numbers',
          'Assume the neighborhood has fewer people on Mondays and accept it',
        ],
        correctAnswer: 'Observe Monday morning operations directly — staffing, foot traffic, product availability — before assuming a cause',
        explanation: 'Data shows WHAT is happening, not WHY. Always validate data findings with direct observation before taking action. The cause could be operational, environmental, or a data collection error.',
      },
      {
        id: 'anl-q5', type: 'mcq', points: 10,
        question: 'Which KPI best measures the efficiency of CoffeePlace\'s marketing spend?',
        options: ['Customer Acquisition Cost (CAC) by channel', 'Total monthly marketing spend', 'Number of Instagram posts published per month', 'Total website page views'],
        correctAnswer: 'Customer Acquisition Cost (CAC) by channel',
        explanation: 'CAC by channel = marketing spend on that channel / new customers attributed to it. This tells you which channels are efficient and where to invest more or cut.',
      },
      {
        id: 'anl-q6', type: 'practical', points: 15,
        question: 'Build a CoffeePlace Weekly KPI Dashboard.\n\nDefine 10 KPIs that a founder should review every Monday morning. For each KPI:\n• Name and definition\n• How it is measured (data source)\n• Target or benchmark\n• What action it triggers if off-target\n\nOrganize them across 3 categories: Financial Health, Customer Performance, Operational Efficiency.',
        correctAnswer: 'Strong answers: Financial (daily revenue vs target, gross margin %, weekly labor cost as % of revenue, cash balance). Customer (transaction count by day/hour, average ticket value, NPS or review score, new vs returning customer ratio). Operational (waste/spillage %, product availability score, opening on-time %). Weak answers: list generic metrics without sources, targets, or action triggers.',
        explanation: 'KPIs without action triggers are just reporting. The best dashboards tell you WHAT to do, not just what happened.',
      
        rubricCriteria: [
          { id: 'anl-q6-c1', label: 'KPI Relevance', description: '10 KPIs are genuinely useful for a specialty coffee operator — not generic business metrics copied from a textbook', maxPoints: 5 },
          { id: 'anl-q6-c2', label: 'Measurement & Source', description: 'Each KPI has a specified data source (POS / loyalty app / bank statement) and a defined measurement method', maxPoints: 5 },
          { id: 'anl-q6-c3', label: 'Action Triggers', description: 'Each KPI has a specific action trigger — not "investigate further" but "if < X, do Y this week"', maxPoints: 5 },
        ],
      },
      {
        id: 'anl-q7', type: 'practical', points: 15,
        question: 'Interpret the following CoffeePlace data and write a 200-word analysis memo to yourself:\n\n• Monday–Wednesday: Avg 165 transactions/day, AED 22 avg ticket\n• Thursday–Friday: Avg 285 transactions/day, AED 31 avg ticket\n• Saturday: 320 transactions, AED 24 avg ticket\n• Top product by revenue: Specialty Lattes (34% of revenue)\n• Top product by volume: Espresso shots (28% of volume, 9% of revenue)\n• Loyalty member transactions: 38% of all transactions, but 61% of revenue\n• 3 Google reviews this week: 5★, 5★, 2★ (complaint: long wait on Saturday)\n\nWhat does this data tell you? What are the top 3 decisions you would make based on it?',
        correctAnswer: 'Strong memo: identifies weekend revenue concentration (risk if closed), notes loyalty members disproportionate value (invest in retention), espresso volume vs revenue mismatch (margin question), Saturday wait time as service quality risk. Decisions: (1) weekend staffing review, (2) loyalty program targeted engagement campaign, (3) review espresso pricing or upsell path.',
        explanation: 'Data analysis skill: connect the dots across multiple data points to form a coherent picture, not just describe each number individually.',
      
        rubricCriteria: [
          { id: 'anl-q7-c1', label: 'Pattern Recognition', description: 'Identifies at least 3 cross-data insights — connects patterns across multiple metrics rather than describing each separately', maxPoints: 5 },
          { id: 'anl-q7-c2', label: 'Decision Quality', description: '3 decisions are specific, actionable this week, and directly supported by evidence in the data provided', maxPoints: 5 },
          { id: 'anl-q7-c3', label: 'Memo Quality', description: '≤200 words; executive-level writing; no vague language; reader knows exactly what to do after reading', maxPoints: 5 },
        ],
      },
      {
        id: 'anl-q8', type: 'case', points: 20,
        question: 'CoffeePlace has 8 months of POS data. Your accountant shares:\n\n• Revenue is growing 8% month-over-month\n• But net profit margin has dropped from 31% to 22% over the same period\n• COGS as % of revenue has stayed flat at 29%\n• Labor cost has grown from 24% to 34% of revenue\n\nQ1: Diagnose the problem using the data provided.\nQ2: What additional data would you request to investigate further?\nQ3: What are 3 specific actions to bring labor cost back to 24–26% of revenue without harming service quality?',
        correctAnswer: 'Q1: Revenue growing but margin shrinking = labor cost growing faster than revenue. COGS stable so it is not a product cost issue. Q2: Hours worked by role, revenue per labor hour, roster vs actual hours, overtime frequency, new hire dates. Q3: Actions: reduce overtime through better scheduling, review hours vs peak periods (schedule to demand, not fixed hours), introduce productivity metrics per barista (transactions per hour), review management-to-barista ratio.',
        explanation: 'Profitability analysis: always decompose margin drops into specific line items. "Costs are too high" is not an answer. "Labor as % of revenue increased 10 points — here is why and what to do" is.',
      
        rubricCriteria: [
          { id: 'anl-q8-c1', label: 'Problem Diagnosis', description: 'Correctly identifies labor cost as the specific driver with the numerical evidence (24%→34%) stated explicitly', maxPoints: 5 },
          { id: 'anl-q8-c2', label: 'Additional Data', description: 'Requests specific, relevant data (hours by role, revenue per labor hour, overtime frequency) — not generic "more data"', maxPoints: 5 },
          { id: 'anl-q8-c3', label: 'Action Quality', description: '3 actions are specific enough to implement this week — not "optimise scheduling" but "audit Monday morning roster vs sales data"', maxPoints: 5 },
          { id: 'anl-q8-c4', label: 'Financial Literacy', description: 'Demonstrates understanding that labor % rises when costs grow faster than revenue — states this explicitly', maxPoints: 5 },
        ],
      },
    ],
  },

  {
    id: 'exam-negotiation-1',
    title: 'Negotiation & Deal-Making',
    category: 'Negotiation',
    description: 'Test your understanding of negotiation principles, BATNA, anchoring, and practical negotiation skills for supplier, lease, and partnership deals at CoffeePlace.',
    passingScore: 70,
    timeLimit: 25,
    createdAt: now, updatedAt: now,
    questions: [
      {
        id: 'neg-q1', type: 'mcq', points: 10,
        question: 'Your BATNA in a negotiation is:',
        options: [
          'Your Best Alternative To a Negotiated Agreement — what you will do if this deal falls through',
          'The maximum price you are willing to pay',
          'Your opening offer in the negotiation',
          'The minimum acceptable terms you will accept from the other side',
        ],
        correctAnswer: 'Your Best Alternative To a Negotiated Agreement — what you will do if this deal falls through',
        explanation: 'BATNA determines your true negotiating power. A strong BATNA = walk-away power. A weak BATNA = you need this deal and the other party will sense it. Always improve your BATNA before entering important negotiations.',
      },
      {
        id: 'neg-q2', type: 'mcq', points: 10,
        question: 'A coffee supplier quotes AED 85/kg for specialty beans. You counter with AED 60/kg. The supplier says "absolutely not — maximum I can do is AED 80." You have just demonstrated:',
        options: ['Anchoring — your low offer pulled the supplier\'s counteroffer down from AED 85 to AED 80', 'A poor strategy — never open so far from the target', 'ZOPA violation — you went outside the Zone of Possible Agreement', 'Distributive negotiation — you are competing for a fixed resource'],
        correctAnswer: 'Anchoring — your low offer pulled the supplier\'s counteroffer down from AED 85 to AED 80',
        explanation: 'Anchoring: the first number in a negotiation sets the psychological reference point. Research shows even an aggressive anchor shifts the final outcome toward the anchor, even if rejected.',
      },
      {
        id: 'neg-q3', type: 'mcq', points: 10,
        question: 'In principled negotiation (Fisher & Ury), the key principle is:',
        options: [
          'Separate the people from the problem — focus on interests, not positions',
          'Always be willing to walk away, no matter the cost',
          'Never reveal what you truly want — keep the other party guessing',
          'Win the negotiation by making the other party feel they got a good deal even if they didn\'t',
        ],
        correctAnswer: 'Separate the people from the problem — focus on interests, not positions',
        explanation: 'Getting to Yes (Fisher & Ury): 4 principles — Separate people from problem, Focus on interests not positions, Invent options for mutual gain, Use objective criteria. Positional bargaining leads to worse outcomes for both parties.',
      },
      {
        id: 'neg-q4', type: 'mcq', points: 10,
        question: 'You are negotiating a 3-year lease for CoffeePlace Branch 2. The landlord insists on a rent increase clause of 7% annually. You want 3%. The BEST integrative tactic is:',
        options: [
          'Offer a longer lease term (5 years) in exchange for a lower annual increase — create value by trading something they want for something you want',
          'Refuse and walk away — you need to demonstrate you are serious',
          'Accept the 7% but negotiate a larger fit-out contribution from the landlord',
          'Split the difference at 5% and close the deal',
        ],
        correctAnswer: 'Offer a longer lease term (5 years) in exchange for a lower annual increase — create value by trading something they want for something you want',
        explanation: 'Integrative (win-win) negotiation: expand the pie by trading across issues with different values to each party. The landlord values long-term security; you value lower costs. Trade terms accordingly.',
      },
      {
        id: 'neg-q5', type: 'mcq', points: 10,
        question: 'A supplier says "this price is final — it\'s the same price I give everyone." This is a classic example of:',
        options: ['A negotiation tactic — the "take it or leave it" position can be tested with counter-proposals', 'A legitimate constraint you must accept', 'A signal that you should change suppliers immediately', 'Distributive bargaining that cannot be reframed as integrative'],
        correctAnswer: 'A negotiation tactic — the "take it or leave it" position can be tested with counter-proposals',
        explanation: '"Final offer" claims are usually tactics. Test them by changing the terms (not just price): order volume, payment terms, exclusivity, product mix. Most "final" offers become flexible when the deal structure changes.',
      },
      {
        id: 'neg-q6', type: 'practical', points: 15,
        question: 'Prepare a Negotiation Brief for the following scenario:\n\nYou need to renew your current coffee supplier contract. Current terms: AED 78/kg, 30-day payment, minimum order 20kg/week. You want: AED 68/kg, 45-day payment, minimum order 15kg/week. Competitor supplier offered you AED 72/kg with 45-day payment.\n\nComplete your brief:\n1. Your BATNA (what happens if no deal)\n2. Your opening position and why\n3. Your target outcome (realistic best case)\n4. Your walk-away point (minimum acceptable)\n5. 3 tradeable variables beyond price\n6. Questions you will ask to understand their interests',
        correctAnswer: 'Strong brief: BATNA = move to competitor at AED 72. Opening = AED 65 (anchor below target). Target = AED 68-70, 45-day, 15kg. Walk-away = AED 73 with 45-day payment (otherwise BATNA is better). Tradeable variables: exclusivity, referrals, payment timing, order frequency, joint marketing. Questions: "What does your ideal long-term customer look like?" "What are your constraints on pricing?" "What would make this contract worth more to you?"',
        explanation: 'Walking into a negotiation without a brief is walking in blind. Preparation is 80% of negotiating success.',
      
        rubricCriteria: [
          { id: 'neg-q6-c1', label: 'BATNA & Walk-away', description: 'BATNA is specific and realistic; walk-away point is numerically defined (e.g. AED 73 with 45-day payment)', maxPoints: 5 },
          { id: 'neg-q6-c2', label: 'Opening & Tradeable Variables', description: 'Opening is anchored below target; 3 tradeable variables are genuinely exchangeable beyond just price', maxPoints: 5 },
          { id: 'neg-q6-c3', label: 'Discovery Questions', description: 'Questions are open-ended and designed to reveal interests, not just positions — at least 2 genuine interest-probing questions', maxPoints: 5 },
        ],
      },
      {
        id: 'neg-q7', type: 'practical', points: 15,
        question: 'You are negotiating with a mall management company for CoffeePlace Branch 3. They open with a rent of AED 35,000/month + 8% of revenue. Your target is AED 28,000/month + 4% of revenue.\n\nWrite the dialogue for the first 10 minutes of the negotiation. Include:\n• Your opening statement\n• Their counter (you play both sides)\n• 2 reframes you use to move from positions to interests\n• How you introduce a tradeable variable to create movement\n• How you close the first meeting (with or without a deal)',
        correctAnswer: 'Strong dialogue: Opens by asking about their priorities before making an offer. Reframes: "I understand you need revenue certainty — what if we structure a minimum guarantee with a lower percentage?" Tradeable: "We can offer 3-year commitment with a 6-month break clause if you come to AED 30,000." Closing without deal: "I appreciate this first conversation — I\'d like to come back with a revised proposal by Thursday that addresses what you\'ve shared today." No aggressive ultimatums in the first meeting.',
        explanation: 'First negotiation meetings are intelligence-gathering sessions, not closing sessions. The best negotiators listen more than they talk.',
      
        rubricCriteria: [
          { id: 'neg-q7-c1', label: 'Opening & Rapport', description: 'Opens by understanding their priorities before making any offer — does not anchor immediately in the first exchange', maxPoints: 5 },
          { id: 'neg-q7-c2', label: 'Reframes', description: '2 reframes correctly shift the conversation from positions (price/percentage) to underlying interests (security/cost)', maxPoints: 5 },
          { id: 'neg-q7-c3', label: 'Tradeable & Close', description: 'Tradeable variable creates movement without splitting the difference; meeting closes professionally with a next step', maxPoints: 5 },
        ],
      },
      {
        id: 'neg-q8', type: 'case', points: 20,
        question: 'CoffeePlace has been operating for 12 months. A large F&B group approaches you with an offer to acquire 40% of CoffeePlace for AED 800,000, giving them a board seat and veto rights on major decisions.\n\nQ1: What is the implied valuation and is it fair for a 12-month-old coffee business?\nQ2: What are the top 5 deal terms you would negotiate beyond the headline price?\nQ3: What is your BATNA and how does it affect your negotiating position?\nQ4: What are 3 conditions under which you would walk away from this deal?',
        correctAnswer: 'Q1: Implied valuation = 800,000/0.40 = AED 2,000,000. Fairness depends on revenue/EBITDA multiple — at AED 140,000/month revenue, that is ~14.3x monthly revenue or ~1.2x annual revenue (low-end for growing F&B). Q2: Drag-along rights, board composition, anti-dilution, tag-along, key person clause, non-compete scope. Q3: BATNA = grow independently (slower). Weak BATNA if cash-constrained. Q4: Walk away if: veto rights too broad, valuation below comparable comps, exit timeline misaligned, their expansion vision conflicts with brand DNA.',
        explanation: 'M&A negotiations are about more than price. Control provisions, governance rights, and exit terms often matter more than the headline number.',
      
        rubricCriteria: [
          { id: 'neg-q8-c1', label: 'Valuation Analysis', description: 'Correctly calculates AED 2M implied valuation with a specific assessment of whether it is fair for this stage', maxPoints: 5 },
          { id: 'neg-q8-c2', label: 'Key Deal Terms', description: '5 specific terms identified (drag-along, anti-dilution, etc.) with a brief explanation of why each term matters', maxPoints: 5 },
          { id: 'neg-q8-c3', label: 'BATNA Assessment', description: 'BATNA is honestly assessed — acknowledges if it is weak and explains how that affects negotiating position', maxPoints: 5 },
          { id: 'neg-q8-c4', label: 'Walk-away Conditions', description: '3 conditions are specific deal-breakers tied to actual scenarios — not generic "if the price is too low"', maxPoints: 5 },
        ],
      },
    ],
  },

  {
    id: 'exam-sales-1',
    title: 'Sales & Revenue Growth',
    category: 'Sales',
    description: 'Test your understanding of the sales process, B2B and B2C sales techniques, objection handling, and building revenue for a specialty coffee business.',
    passingScore: 70,
    timeLimit: 25,
    createdAt: now, updatedAt: now,
    questions: [
      {
        id: 'sal-q1', type: 'mcq', points: 10,
        question: 'The sales funnel for CoffeePlace\'s corporate catering service in the correct order is:',
        options: [
          'Awareness → Interest → Consideration → Intent → Purchase → Loyalty',
          'Prospecting → Pitching → Closing → Delivering',
          'Marketing → Sales → Operations → Finance',
          'Lead → Qualified Lead → Proposal → Contract → Delivered → Invoiced',
        ],
        correctAnswer: 'Awareness → Interest → Consideration → Intent → Purchase → Loyalty',
        explanation: 'The customer journey funnel maps the psychological stages from not knowing you exist to being a loyal advocate. Each stage requires different actions and content.',
      },
      {
        id: 'sal-q2', type: 'mcq', points: 10,
        question: 'A corporate prospect says "your price is too high — the cafe downstairs is 30% cheaper." The BEST response is:',
        options: [
          'Acknowledge the price difference, then shift the conversation to value: total cost of quality, consistency, experience, and what a poor coffee experience costs their team',
          'Match the competitor price immediately to avoid losing the deal',
          'Explain your cost structure to justify the price',
          'Offer a discount valid only for this week to create urgency',
        ],
        correctAnswer: 'Acknowledge the price difference, then shift the conversation to value: total cost of quality, consistency, experience, and what a poor coffee experience costs their team',
        explanation: 'Price objections are usually value objections in disguise. The buyer is saying "I don\'t see enough difference to justify the premium." Reframe to value, not cost.',
      },
      {
        id: 'sal-q3', type: 'mcq', points: 10,
        question: 'What is consultative selling?',
        options: [
          'A sales approach focused on understanding the buyer\'s specific needs and problems before proposing any solution',
          'Bringing in a consultant to advise on the sales process',
          'A technique of asking many questions to confuse the buyer into agreeing',
          'Selling professional services (consulting) rather than physical products',
        ],
        correctAnswer: 'A sales approach focused on understanding the buyer\'s specific needs and problems before proposing any solution',
        explanation: 'Consultative selling: diagnose before prescribing. For CoffeePlace corporate sales — ask about team size, current coffee setup, budget, key frustrations — THEN present a tailored solution.',
      },
      {
        id: 'sal-q4', type: 'mcq', points: 10,
        question: 'CoffeePlace wants to increase average transaction value from AED 22 to AED 28. The most sustainable approach is:',
        options: [
          'Train baristas on thoughtful upsell and add-on suggestions tied to genuine customer preferences',
          'Raise all prices by 30% to force higher average ticket',
          'Remove all items below AED 25 from the menu',
          'Run a promotion where customers spend AED 28+ to receive a free pastry',
        ],
        correctAnswer: 'Train baristas on thoughtful upsell and add-on suggestions tied to genuine customer preferences',
        explanation: 'Sustainable revenue growth comes from genuine value creation — suggesting the right add-on at the right moment. Forced upsells damage the customer relationship.',
      },
      {
        id: 'sal-q5', type: 'mcq', points: 10,
        question: 'Your best corporate client accounts for 35% of CoffeePlace\'s B2B revenue. This is a:',
        options: ['Revenue concentration risk — losing one client removes 35% of B2B income overnight', 'Healthy concentration — focus on your best clients', 'Evidence of strong sales performance — prioritize this relationship', 'Normal B2B distribution — Pareto applies'],
        correctAnswer: 'Revenue concentration risk — losing one client removes 35% of B2B income overnight',
        explanation: 'Any single client representing >20% of revenue is a concentration risk. Build policies and diversification strategies to cap dependency. What happens if they move offices or cut catering budgets?',
      },
      {
        id: 'sal-q6', type: 'practical', points: 15,
        question: 'Write a full cold outreach email to a 200-person technology company in your city, pitching CoffeePlace\'s office coffee service.\n\nRequirements:\n• Subject line (under 8 words)\n• Opening that is NOT "I hope this email finds you well"\n• 3 specific value propositions relevant to a tech company\n• One concrete proof point (social proof, result, or testimonial)\n• A clear, low-friction call-to-action\n• Total email: under 180 words\n\nThen explain your reasoning for each element.',
        correctAnswer: 'Strong email: Subject line creates curiosity or names a specific problem ("Your team deserves better than the office kettle"). Opening addresses a pain point. Value props specific to tech (productivity, team culture, quality-conscious team). Proof point: "We currently serve 3 tech offices in [city]." CTA: "15-minute call this week?" or "Can I bring samples Tuesday?" Reasoning shows understanding of cold email psychology.',
        explanation: 'The best B2B outreach is specific, short, and makes the next step as easy as possible. Generic emails get deleted.',
      
        rubricCriteria: [
          { id: 'sal-q6-c1', label: 'Email Mechanics', description: 'Subject line ≤8 words; opening is not generic; CTA is specific and low-friction; total ≤180 words', maxPoints: 5 },
          { id: 'sal-q6-c2', label: 'Value Propositions', description: '3 props are specific to tech companies — connects to tech team culture, productivity, or client impression', maxPoints: 5 },
          { id: 'sal-q6-c3', label: 'Reasoning Quality', description: 'Explanation for each element demonstrates understanding of cold email psychology — not "it sounds good"', maxPoints: 5 },
        ],
      },
      {
        id: 'sal-q7', type: 'practical', points: 15,
        question: 'You have a meeting with the Operations Manager of a 150-person law firm. They asked for a proposal for daily office coffee service.\n\nWrite a 10-question discovery call script that:\n• Builds rapport in the first 2 minutes\n• Uncovers their current situation and frustrations\n• Identifies their decision-making criteria and process\n• Reveals budget range without asking directly\n• Sets up your follow-up proposal\n\nFor 3 of your questions, explain why you ask them in that exact way.',
        correctAnswer: 'Strong script: rapport questions about the office/team (not generic). Discovery: "What does the current coffee setup look like?" "What\'s working and what isn\'t?" "When partners entertain clients internally, how does the coffee situation feel?" Budget reveal: "What have you budgeted for this kind of upgrade?" or "Are you looking for something similar in cost to your current setup, or is this a step-change investment?" Closes with: "If I send a proposal by Thursday, what\'s your decision timeline?"',
        explanation: 'Discovery calls determine whether you will win the deal long before you present. Weak discovery leads to proposals that miss the mark.',
      
        rubricCriteria: [
          { id: 'sal-q7-c1', label: 'Discovery Depth', description: 'Questions uncover situation, frustrations, decision process, and budget without asking directly for the number', maxPoints: 5 },
          { id: 'sal-q7-c2', label: 'Rapport & Flow', description: 'Script builds trust in the first 2 minutes; questions feel conversational, not like an interrogation checklist', maxPoints: 5 },
          { id: 'sal-q7-c3', label: 'Question Rationale', description: 'Explanations for 3 questions demonstrate understanding of WHY those specific questions matter at that moment', maxPoints: 5 },
        ],
      },
      {
        id: 'sal-q8', type: 'case', points: 20,
        question: 'CoffeePlace has been running corporate catering for 6 months with 4 clients (AED 32,000/month total). Growth has stalled — you have pitched 8 new prospects in 2 months and closed 0.\n\nYour pitch deck is polished. Your product is excellent. Your 4 existing clients are happy (2 gave testimonials).\n\nQ1: Diagnose why you might be losing deals despite strong product and testimonials.\nQ2: What changes would you make to your sales process?\nQ3: Build a 60-day sales sprint plan with specific weekly targets and activities.',
        correctAnswer: 'Q1: Possible causes — wrong target prospects (size, industry, budget), proposal sent before proper discovery, missing decision-maker in meetings, no follow-up sequence, price not positioned relative to value, generic pitch not tailored to each company. Q2: Audit lost deals (ask why), tighten ICP (ideal customer profile), add discovery call before proposal, build follow-up sequence (3 touches), get intro to right decision-maker. Q3: Week 1-2: audit + ICP refinement. Week 3-4: 10 new prospects, discovery calls only. Week 5-6: proposals for qualified. Week 7-8: close attempts + referral ask from existing 4.',
        explanation: 'Sales stall = either wrong prospects, wrong message, wrong process, or wrong person in the room. Diagnose before changing the pitch.',
      
        rubricCriteria: [
          { id: 'sal-q8-c1', label: 'Diagnosis Quality', description: 'Identifies specific, plausible causes beyond "the pitch needs work" — uses case evidence to support each', maxPoints: 5 },
          { id: 'sal-q8-c2', label: 'Process Changes', description: '3 changes address different stages of the funnel — not all fixes at the same stage (e.g. not all "prospect more")', maxPoints: 5 },
          { id: 'sal-q8-c3', label: 'Sprint Plan Quality', description: '60-day plan has specific weekly targets (numbers, activities) — not just vague phases', maxPoints: 5 },
          { id: 'sal-q8-c4', label: 'Learning Mindset', description: 'Plan includes a way to learn from the 8 lost deals — structured debrief or exit survey approach', maxPoints: 5 },
        ],
      },
    ],
  },

  {
    id: 'exam-cx-1',
    title: 'Customer Experience',
    category: 'Customer Experience',
    description: 'Test your understanding of customer journey design, service recovery, NPS, moments of truth, and building a CoffeePlace experience that creates loyal advocates.',
    passingScore: 70,
    timeLimit: 25,
    createdAt: now, updatedAt: now,
    questions: [
      {
        id: 'cx-q1', type: 'mcq', points: 10,
        question: 'Jan Carlzon\'s "Moment of Truth" in the context of CoffeePlace refers to:',
        options: [
          'Any point of contact between a customer and CoffeePlace that forms or changes their perception of the brand',
          'The moment a customer decides to buy — when the transaction happens',
          'The quality of the coffee itself — the product truth that customers experience',
          'The peak moment of the visit when the barista delivers the cup',
        ],
        correctAnswer: 'Any point of contact between a customer and CoffeePlace that forms or changes their perception of the brand',
        explanation: 'Carlzon: MOTs are the ~15-second interactions that shape customer perception. In a café: finding on Google, entering, the greeting, ordering, waiting, receiving coffee, first sip, paying, departure. Each is a MOT.',
      },
      {
        id: 'cx-q2', type: 'mcq', points: 10,
        question: 'A customer whose complaint was resolved perfectly spends MORE than a customer who never complained. This is called:',
        options: ['The Service Recovery Paradox', 'Customer Retention Effect', 'Loyalty Paradox', 'Complaint Premium'],
        correctAnswer: 'The Service Recovery Paradox',
        explanation: 'Service Recovery Paradox: a customer who experienced a problem that was resolved excellently often has HIGHER loyalty than one who had no problem. The failure + recovery demonstrates responsiveness and care.',
      },
      {
        id: 'cx-q3', type: 'mcq', points: 10,
        question: 'A customer journey map for CoffeePlace should include:',
        options: [
          'All stages of the customer experience — from first discovery to post-visit — including emotions, touchpoints, and pain points at each stage',
          'The floor plan showing where customers walk when they enter the store',
          'The sequence of products a customer is likely to order in their first 5 visits',
          'A marketing funnel showing how customers move from awareness to purchase',
        ],
        correctAnswer: 'All stages of the customer experience — from first discovery to post-visit — including emotions, touchpoints, and pain points at each stage',
        explanation: 'Journey maps: Awareness → Consideration → Visit → Order → Experience → Post-visit. Each stage has touchpoints (what happens), emotions (how customer feels), and opportunities (how to improve).',
      },
      {
        id: 'cx-q4', type: 'mcq', points: 10,
        question: 'CoffeePlace\'s busiest barista is technically excellent but rarely makes eye contact or greets customers by name. The best frame for understanding the gap is:',
        options: [
          'Functional vs Emotional experience — the product is excellent but the relational/emotional dimension is missing',
          'A training problem — the barista needs more espresso practice',
          'A personality issue — some baristas are naturally introverted and cannot be changed',
          'A management problem — the barista is overworked and under-staffed',
        ],
        correctAnswer: 'Functional vs Emotional experience — the product is excellent but the relational/emotional dimension is missing',
        explanation: 'Great CX has two dimensions: Functional (quality, speed, accuracy) and Emotional (feeling seen, valued, welcomed). Specialty coffee customers pay a premium for both. The emotional layer is what builds advocates.',
      },
      {
        id: 'cx-q5', type: 'mcq', points: 10,
        question: 'A customer leaves a 2-star Google review: "Waited 18 minutes for a cappuccino on a quiet Tuesday morning." The best public response is:',
        options: [
          'Acknowledge the specific wait time, apologize sincerely, explain briefly what happened, and invite them back with a specific recovery offer',
          'Respond publicly with a detailed explanation of why the wait occurred and that it won\'t happen again',
          'Do not respond — responding to negative reviews draws more attention to them',
          'Ask Google to remove the review since 18 minutes is within acceptable service times',
        ],
        correctAnswer: 'Acknowledge the specific wait time, apologize sincerely, explain briefly what happened, and invite them back with a specific recovery offer',
        explanation: 'Public review responses are read by future customers, not just the reviewer. A graceful, specific, human response demonstrates service culture and often converts the reviewer into a return customer.',
      },
      {
        id: 'cx-q6', type: 'practical', points: 15,
        question: 'Map the complete CoffeePlace customer journey for a first-time visitor who discovers CoffeePlace on Instagram and visits on a Saturday morning.\n\nFor each stage, define:\n• Stage name and description\n• Key touchpoints (what the customer sees/hears/experiences)\n• Likely customer emotion (before and after the touchpoint)\n• One specific improvement CoffeePlace can make\n\nCover at least 6 stages from discovery to post-visit.',
        correctAnswer: 'Strong map: Stage 1 Discovery (Instagram → curiosity, anticipation → clear bio, address, hours). Stage 2 Approach (exterior signage → excitement or uncertainty → clear branding). Stage 3 Entry (greeting → valued or invisible → name-based welcome policy). Stage 4 Ordering (menu clarity → confidence or overwhelm → recommended item suggestion). Stage 5 Wait (queue clarity → patience or frustration → time expectation set). Stage 6 Receiving (coffee delivery → anticipation → barista personal touch). Stage 7 Experience (taste + environment → satisfaction → clean, comfortable, music calibrated). Stage 8 Departure (goodbye + loyalty sign-up prompt). Stage 9 Post-visit (follow-up review request + social share moment).',
        explanation: 'Journey mapping reveals invisible pain points. Most CX improvements come from mapping the journey honestly, not from guessing what customers want.',
      
        rubricCriteria: [
          { id: 'cx-q6-c1', label: 'Stage Completeness', description: 'All 6+ stages covered from discovery to post-visit with no major gap in the customer journey', maxPoints: 5 },
          { id: 'cx-q6-c2', label: 'Emotion Mapping', description: 'Customer emotions are specific and empathetic at each stage — not just "happy" or "satisfied"', maxPoints: 5 },
          { id: 'cx-q6-c3', label: 'Improvement Quality', description: 'Each improvement is specific and implementable — not "be more friendly" but "introduce barista by name at handoff"', maxPoints: 5 },
        ],
      },
      {
        id: 'cx-q7', type: 'practical', points: 15,
        question: 'Design a Service Recovery SOP for CoffeePlace.\n\nThe SOP must cover 3 complaint scenarios:\n1. Wrong drink made (minor error)\n2. Long wait time (15+ minutes, customer complained)\n3. Sick customer — food/drink suspected cause\n\nFor each scenario, define:\n• The exact steps the barista should take\n• What authority the barista has without manager approval\n• When to escalate to a manager\n• The follow-up action within 24 hours',
        correctAnswer: 'Strong SOP: Scenario 1 — immediate remake + sincere apology, no discount needed, barista empowered to add a free pastry. Scenario 2 — acknowledge wait with specific time cited, offer complimentary upgrade, note the customer in POS, follow up with loyalty reward. Scenario 3 — take very seriously, involve manager immediately, document, do not admit liability, contact customer within 2 hours privately, review product batch. All three: no arguing, thank the customer for raising it, record in service log.',
        explanation: 'Service recovery SOPs empower frontline staff to resolve problems at the moment they happen — without needing a manager for every issue. Speed of recovery matters more than what the recovery costs.',
      
        rubricCriteria: [
          { id: 'cx-q7-c1', label: 'SOP Completeness', description: 'All 3 scenarios have specific steps, defined authority level, and clear escalation trigger', maxPoints: 5 },
          { id: 'cx-q7-c2', label: 'Barista Empowerment', description: 'SOP grants specific frontline authority (e.g. free drink up to AED 25) — does not require manager for every incident', maxPoints: 5 },
          { id: 'cx-q7-c3', label: 'Follow-up Protocol', description: 'Each scenario has a defined 24-hour follow-up action — not just "the problem is solved and we move on"', maxPoints: 5 },
        ],
      },
      {
        id: 'cx-q8', type: 'case', points: 20,
        question: 'CoffeePlace launched a loyalty program 3 months ago. 1,200 customers signed up. Analytics show:\n• 400 members visited once and never returned\n• 600 visit 1x/month\n• 200 visit 3x+/week (these 200 generate 55% of loyalty revenue)\n\nYour NPS is +38 overall, but loyalty members score +61 vs non-members at +22.\n\nQ1: What do the numbers tell you about the loyalty program\'s performance?\nQ2: Design a specific campaign to re-activate the 400 one-visit members.\nQ3: How do you deepen the engagement of the 200 super-loyalists without simply giving away margin?',
        correctAnswer: 'Q1: Strong segmentation emerges — 200 super-users generate disproportionate value. One-visit churn of 33% suggests onboarding or first-visit experience gap. Loyalty members are 2.8x more satisfied. Q2: Re-activation: personalized "we miss you" message with a specific, time-limited offer (not generic discount — tie to their last purchase). Test: personalized vs generic message. Q3: Super-loyalist program: exclusive benefits (early menu access, barista naming a drink after them, founders circle events, first-to-know on new beans). Non-monetary perks build emotional loyalty without destroying margin.',
        explanation: 'Loyalty programs fail when they treat all members the same. The best programs create tiers of emotional belonging, not just points.',
      
        rubricCriteria: [
          { id: 'cx-q8-c1', label: 'Data Interpretation', description: 'Correctly reads the 3-tier loyalty segmentation and NPS gap (+61 vs +22) with specific implications for each group', maxPoints: 5 },
          { id: 'cx-q8-c2', label: 'Re-activation Design', description: 'Campaign is personalised (not mass discount), references the customer\'s actual history, and has a clear expiry', maxPoints: 5 },
          { id: 'cx-q8-c3', label: 'Super-loyalist Strategy', description: '3 non-monetary benefits create emotional belonging — not just faster service or bigger discounts', maxPoints: 5 },
          { id: 'cx-q8-c4', label: 'Strategic Coherence', description: 'All recommendations connect directly to the data — no generic loyalty best-practices pasted in without case grounding', maxPoints: 5 },
        ],
      },
    ],
  },

  {
    id: 'exam-expansion-1',
    title: 'Scale & Expansion Strategy',
    category: 'Expansion',
    description: 'Test your understanding of multi-location strategy, site selection, franchise vs company-owned models, capital planning, and building a scalable specialty coffee brand.',
    passingScore: 70,
    timeLimit: 25,
    createdAt: now, updatedAt: now,
    questions: [
      {
        id: 'exp-q1', type: 'mcq', points: 10,
        question: 'Before opening Branch 2, the most important question to answer is:',
        options: [
          'Can Branch 1 operate profitably without the founder present for 2+ weeks?',
          'Is there a suitable location available at the right rent?',
          'Do you have enough cash for the fit-out?',
          'Have you registered a trademark for the brand?',
        ],
        correctAnswer: 'Can Branch 1 operate profitably without the founder present for 2+ weeks?',
        explanation: 'The E-Myth principle: if Branch 1 requires your daily presence to function, Branch 2 will fracture both. Systemization and leadership delegation must precede geographic expansion.',
      },
      {
        id: 'exp-q2', type: 'mcq', points: 10,
        question: 'A franchise model gives CoffeePlace:',
        options: [
          'Faster expansion with lower capital outlay, but reduced control over brand experience and quality',
          'Full ownership of all locations with shared operational risk',
          'Higher per-location profit than company-owned operations',
          'Complete protection from brand damage caused by individual operators',
        ],
        correctAnswer: 'Faster expansion with lower capital outlay, but reduced control over brand experience and quality',
        explanation: 'Franchise trade-off: franchisees fund expansion (capital advantage) but operate independently (quality risk). Specialty coffee brands often delay franchising because experience consistency is the core value proposition.',
      },
      {
        id: 'exp-q3', type: 'mcq', points: 10,
        question: 'In site selection for a specialty coffee location, which factor is MOST predictive of success?',
        options: [
          'Pedestrian traffic volume during peak hours AND proximity to your target customer profile',
          'Lowest available rent in the target area',
          'Proximity to competitors (shared footfall)',
          'Largest floor area available within budget',
        ],
        correctAnswer: 'Pedestrian traffic volume during peak hours AND proximity to your target customer profile',
        explanation: 'Site selection: foot traffic + right customer demographic = sales potential. A high-traffic location with the wrong demographic (e.g. tourist-heavy when targeting professionals) will underperform.',
      },
      {
        id: 'exp-q4', type: 'mcq', points: 10,
        question: 'The "4-wall EBITDA" metric used in F&B expansion means:',
        options: [
          'The profitability of a single location after all direct costs, before allocating any corporate overhead',
          'The total company EBITDA across all 4 planned locations',
          'The profit per square meter of the physical store space',
          'Earnings calculated using the 4 key financial ratios: EBITDA, EBIT, EBT, and Net Income',
        ],
        correctAnswer: 'The profitability of a single location after all direct costs, before allocating any corporate overhead',
        explanation: '4-wall EBITDA = location-level profitability. Corporate overhead (CEO salary, shared marketing, accounting) is excluded to assess whether each location is viable on its own. Negative 4-wall EBITDA = no amount of overhead cutting will fix it.',
      },
      {
        id: 'exp-q5', type: 'mcq', points: 10,
        question: 'Which factor creates the GREATEST strain on cash flow when opening a second location?',
        options: [
          'The time gap between incurring fit-out costs (pre-opening) and reaching cash flow breakeven (typically 3–6 months post-opening)',
          'The cost of duplicating the menu across both locations',
          'Hiring a second team before training is complete',
          'Marketing spend to announce the new opening',
        ],
        correctAnswer: 'The time gap between incurring fit-out costs (pre-opening) and reaching cash flow breakeven (typically 3–6 months post-opening)',
        explanation: 'The J-curve of cash flow: spend peaks before opening (fit-out, deposits, staff training). Revenue ramps slowly. The cash gap between peak spend and breakeven is the most dangerous period in expansion.',
      },
      {
        id: 'exp-q6', type: 'practical', points: 15,
        question: 'Build a Site Selection Scorecard for evaluating potential CoffeePlace Branch 2 locations.\n\nDefine 10 criteria that matter for a specialty coffee location. For each:\n• Criterion name\n• Why it matters for CoffeePlace specifically\n• How you measure it (observable or quantifiable)\n• Weight (out of 100 total across all criteria)\n\nThen apply your scorecard to compare two hypothetical sites:\n• Site A: Premium mall, AED 28,000/month rent, 1,200 daily foot traffic, strong specialty coffee demographic\n• Site B: Street-level high street, AED 16,000/month rent, 600 daily foot traffic, mixed demographic',
        correctAnswer: 'Strong scorecard: includes foot traffic (high weight), demographic match, visibility, rent-to-revenue ratio, competition proximity, lease terms flexibility, fit-out cost, parking/access, brand image fit, landlord relationship. Site A likely scores higher on traffic/demographic but Site B scores on cost efficiency. Strong analysis notes: at AED 28,000 vs 16,000, Site A needs AED 12,000 more revenue to break even — can the traffic convert at that rate?',
        explanation: 'Site selection decisions made without a structured scorecard rely on gut feel — the most expensive mistake in F&B expansion.',
      
        rubricCriteria: [
          { id: 'exp-q6-c1', label: 'Criteria Relevance', description: '10 criteria are genuinely relevant to specialty coffee site selection — not generic retail metrics', maxPoints: 5 },
          { id: 'exp-q6-c2', label: 'Weighting Rationale', description: 'Weights reflect relative importance with a brief explanation — highest-weight criteria have the strongest justification', maxPoints: 5 },
          { id: 'exp-q6-c3', label: 'Site Comparison', description: 'Correctly applies scorecard to both sites and draws a defensible conclusion with numerical scores shown', maxPoints: 5 },
        ],
      },
      {
        id: 'exp-q7', type: 'practical', points: 15,
        question: 'You are preparing to open Branch 2 in 6 months. Build a Pre-Opening Checklist organized into 4 phases:\n\n• Phase 1: Months 1-2 (Planning & Legal)\n• Phase 2: Month 3 (Construction & Fit-out)\n• Phase 3: Month 4-5 (Hiring & Training)\n• Phase 4: Month 6 (Soft Opening & Launch)\n\nFor each phase, list 5-8 specific tasks and identify who is responsible (Founder / Operations Manager / Contractor / HR).\n\nHighlight 3 tasks where delay would cascade and delay the opening date.',
        correctAnswer: 'Phase 1: lease signed, municipality permit applications, equipment specified and ordered (long lead items!), brand standards documented. Phase 2: contractor management, equipment delivery, IT/POS installation. Phase 3: JDs posted, interviews, 4-week training program, calibration sessions with Branch 1. Phase 4: soft opening with invited guests (week 1), public launch (week 2-3), review period (week 4). Cascade risks: equipment order delay (8-12 week lead time), permit delay, staff hire delay.',
        explanation: 'The critical path in restaurant opening is usually: permits → equipment → staff → opening. Delays in permits cascade into everything else.',
      
        rubricCriteria: [
          { id: 'exp-q7-c1', label: 'Phase Structure', description: '4 phases have distinct, logically sequenced goals — no overlap between phases, no critical step missing', maxPoints: 5 },
          { id: 'exp-q7-c2', label: 'Task Specificity', description: 'Tasks are specific enough for a project plan ("sign lease" not "handle legal"; "order equipment" not "sort procurement")', maxPoints: 5 },
          { id: 'exp-q7-c3', label: 'Cascade Identification', description: 'Correctly identifies 3 tasks that cascade (equipment lead time, permits, staffing) with honest impact explanation', maxPoints: 5 },
        ],
      },
      {
        id: 'exp-q8', type: 'case', points: 20,
        question: 'CoffeePlace Branch 1 is 18 months old. Monthly financials:\n• Revenue: AED 165,000\n• Gross Margin: 68%\n• Net Margin: 26% (AED 42,900/month)\n• Cash in bank: AED 280,000\n\nYou are evaluating Branch 2:\n• Fit-out cost: AED 320,000\n• Expected monthly revenue (Month 4 onward): AED 130,000\n• Expected net margin: 20%\n• Ramp period: 3 months at 40% capacity\n\nQ1: Can you self-fund Branch 2? Model the cash position at opening and at month 6.\nQ2: What is the payback period for the Branch 2 investment?\nQ3: At what point does the 2-branch business generate more total profit than Branch 1 alone? What risks could delay that crossover?',
        correctAnswer: 'Q1: 280,000 cash − 320,000 fit-out = −40,000 at opening. Need bridge financing of ~AED 50-80k (fit-out + 3-month ramp losses). At month 6: Branch 1 has added ~254,400 (6×42,900), Branch 2 starts generating 130,000×20%=26,000/month. Cash turns positive around month 4-5. Q2: Payback = 320,000 / 26,000/month = 12.3 months from full operation. Q3: Crossover: Branch 2 must exceed the additional overhead and ramp losses. Risks: slower ramp (tourist vs residential area), key staff departure, operational quality split across locations delaying Branch 1 performance.',
        explanation: 'Multi-location economics: the second branch usually underperforms the first due to divided attention. Model conservatively and ensure the first location does not suffer in the process.',
      
        rubricCriteria: [
          { id: 'exp-q8-c1', label: 'Cash Modelling', description: 'Correctly identifies the AED 40,000 gap at opening and models month 6 cash position with Branch 1 contributions', maxPoints: 5 },
          { id: 'exp-q8-c2', label: 'Payback Calculation', description: 'Correctly calculates 12.3 months payback from full operation (month 4 onward) with formula shown', maxPoints: 5 },
          { id: 'exp-q8-c3', label: 'Crossover Analysis', description: 'Identifies when 2-branch total exceeds 1-branch profit with specific assumptions stated — not just a narrative', maxPoints: 5 },
          { id: 'exp-q8-c4', label: 'Risk Identification', description: '3 risks are specific to this scenario (slower ramp, divided founder attention, Branch 1 quality drop) — not generic', maxPoints: 5 },
        ],
      },
    ],
  },

]

// ─── Seeded Books ─────────────────────────────────────────────────────────────
