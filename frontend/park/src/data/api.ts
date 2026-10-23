// API client for Orbyte Smart Payment AI backend
export const API_BASE = window.location.port === '3000' ? 'http://localhost:8000' : '';

export interface AgentInfo {
  id: number;
  slug: string;
  name: string;
  shortName: string;
  department: string;
  role: string;
  status: 'Ready' | 'Active' | 'Processing';
  color: string;
  accentColor: string;
  position: [number, number, number]; // 3D coordinates in Apple Park
  rotationY: number;
  description: string;
  responsibilities: string[];
}

export const DEPARTMENTS: AgentInfo[] = [
  {
    id: 1,
    slug: 'agent-1',
    name: 'Agent 1: Data Ingestion & Validation',
    shortName: 'Ingestion & Validation',
    department: 'Document Ingestion Department',
    role: 'Docling extraction & Pydantic v2 schema validation',
    status: 'Ready',
    color: '#16a34a',
    accentColor: '#bbf7d0',
    position: [0, 0, 36], // Front entrance plaza
    rotationY: Math.PI,
    description: 'Autonomous document extraction, layout parsing, and mathematical ledger consistency verification.',
    responsibilities: [
      'Extract invoices, POs, and remittance receipts using Docling layout parsing',
      'Strict Pydantic v2 field schema and mathematical balance validation',
      'Generate employee-ready invoice inspection cards with confidence indicators',
      'Direct file upload ingestion for staff'
    ]
  },
  {
    id: 2,
    slug: 'agent-2',
    name: 'Agent 2: Payment Monitoring & Aging',
    shortName: 'Payment Monitoring',
    department: 'Accounts Receivable Surveillance',
    role: 'Deterministic aging scheduler & compliance verification',
    status: 'Active',
    color: '#0d9488',
    accentColor: '#99f6e4',
    position: [34, 0, 16], // East courtyard wing
    rotationY: -Math.PI / 3,
    description: 'PostgreSQL-backed real-time invoice surveillance, quiet-hours compliance, and aging categorization.',
    responsibilities: [
      'Surveil active account due dates against UTC clock',
      'Categorize into Overdue, Upcoming, and Reconciled accounts',
      'Enforce quiet hours (09:00 - 18:00) and regulatory dispute holds',
      'Provide instant customer dossiers for urgent follow-up'
    ]
  },
  {
    id: 3,
    slug: 'agent-3',
    name: 'Agent 3: Laya Decision & Routing',
    shortName: 'Laya Decision',
    department: 'Intelligent Routing Center',
    role: 'Non-autoregressive scoring & calibrated threshold routing',
    status: 'Ready',
    color: '#7c3aed',
    accentColor: '#ddd6fe',
    position: [28, 0, -26], // Northeast park grove
    rotationY: -Math.PI * 0.7,
    description: 'Sub-15ms non-autoregressive event scoring across 6 operational categories with calibrated 0.75 threshold.',
    responsibilities: [
      'Score inbound messages across 6 payment event categories',
      'Enforce calibrated certainty cutoff (0.75 confidence threshold)',
      'Route verified events directly to automated follow-up workflows',
      'Route ambiguous responses safely to human finance officers'
    ]
  },
  {
    id: 4,
    slug: 'agent-4',
    name: 'Agent 4: DeepSeek Reply Understanding',
    shortName: 'Reply Understanding',
    department: 'Customer Communications Lab',
    role: 'DeepSeek NLP fact, dispute, and commitment extraction',
    status: 'Ready',
    color: '#0284c7',
    accentColor: '#bae6fd',
    position: [0, 0, -38], // North inner courtyard
    rotationY: 0,
    description: 'Natural language understanding for complex customer replies, payment promises, and invoice disputes.',
    responsibilities: [
      'Extract structured facts: promised payment dates, payment claim IDs, dispute notes',
      'Scan customer replies for prompt injection and adversarial inputs',
      'Summarize customer stance in human-readable plain language',
      'Handoff structured intents to Strategy Agent 5'
    ]
  },
  {
    id: 5,
    slug: 'agent-5',
    name: 'Agent 5: Collection Strategy & Follow-up',
    shortName: 'Collection Strategy',
    department: 'SME Relations & Recovery',
    role: 'Policy-guided follow-up communication drafting',
    status: 'Active',
    color: '#15803d',
    accentColor: '#86efac',
    position: [-28, 0, -26], // Northwest courtyard wing
    rotationY: Math.PI * 0.7,
    description: 'Deterministic collection policy engine that generates respectful, legally compliant recovery messages.',
    responsibilities: [
      'Synthesize contextual follow-up emails, SMS, and WhatsApp drafts',
      'Tailor tone according to overdue bracket (Friendly -> Formal -> Urgent)',
      'Automatically flag high-balance invoices (> $5,000) for human approval',
      'Track recipient channel preferences and communication history'
    ]
  },
  {
    id: 6,
    slug: 'agent-6',
    name: 'Agent 6: Payment Reconciliation & Ledger',
    shortName: 'Payment Reconciliation',
    department: 'Treasury & Bank Reconciliation',
    role: 'Deterministic bank statement matching & immutable settlement',
    status: 'Ready',
    color: '#b45309',
    accentColor: '#fde68a',
    position: [-34, 0, 16], // West campus pavilion
    rotationY: Math.PI / 3,
    description: 'Automated 3-way matching between bank deposit feeds, customer payment claims, and open receivables.',
    responsibilities: [
      'Process live bank statement feeds and wire transaction IDs',
      'Deterministic matching against open invoice balances',
      'Issue immutable payment confirmation notices to customers',
      'Transition verified accounts to CLOSED state with zero hallucination'
    ]
  },
  {
    id: 7,
    slug: 'agent-7',
    name: 'Agent 7: Orchestrator, Approval & Audit',
    shortName: 'Orchestrator & Audit',
    department: 'Central Executive Pavilion',
    role: 'LangGraph durable state machine & Human-in-the-Loop governance',
    status: 'Active',
    color: '#c2410c',
    accentColor: '#fed7aa',
    position: [0, 0, 0], // Center of Apple Park Ring!
    rotationY: 0,
    description: 'Central governor enforcing state machine invariants, human approval gates, and cryptographically linked audit logs.',
    responsibilities: [
      'Orchestrate 7-agent collaboration via LangGraph state graph',
      'Enforce Human-in-the-Loop (HITL) gatekeepers before message dispatch',
      'Maintain immutable append-only audit trail for legal compliance',
      'Provide executive bird’s-eye monitoring of entire receivables pipeline'
    ]
  }
];
