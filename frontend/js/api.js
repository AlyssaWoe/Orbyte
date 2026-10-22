/**
 * Orbyte Smart Payment Follow-up AI - API Client
 * Connects to localhost backend endpoints (Real AI, zero mock)
 */

const API = {
  async getStatus() {
    const res = await fetch('/api/status');
    return await res.json();
  },

  async getInvoices() {
    const res = await fetch('/api/invoices');
    return await res.json();
  },

  async getCategorizedInvoices() {
    const res = await fetch('/api/agent2/invoices-categorized');
    return await res.json();
  },

  async getConversations() {
    const res = await fetch('/api/conversations');
    return await res.json();
  },

  async analyzeAndDraftConversation(convId) {
    const res = await fetch(`/api/conversations/${encodeURIComponent(convId)}/analyze-and-draft`, {
      method: 'POST'
    });
    return await res.json();
  },

  async getInvoice(id) {
    const res = await fetch(`/api/invoices/${encodeURIComponent(id)}`);
    return await res.json();
  },

  async ingestInvoice(data) {
    const res = await fetch('/api/agent1/ingest', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data)
    });
    return await res.json();
  },

  async monitorInvoice(id) {
    const res = await fetch(`/api/agent2/monitor/${encodeURIComponent(id)}`, {
      method: 'POST'
    });
    return await res.json();
  },

  async classifyLaya(text) {
    const res = await fetch('/api/agent3/laya-classify', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ text })
    });
    return await res.json();
  },

  async analyzeReply(message_text, sender_email, invoice_id) {
    const res = await fetch('/api/agent4/deepseek-reply', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ message_text, sender_email, invoice_id })
    });
    return await res.json();
  },

  async draftFollowup(invoice_id, channel = 'Email') {
    const res = await fetch(`/api/agent5/collection-strategy/${encodeURIComponent(invoice_id)}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ channel })
    });
    return await res.json();
  },

  async reconcilePayment(data) {
    const res = await fetch('/api/agent6/reconcile', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data)
    });
    return await res.json();
  },

  async runOrchestratorStep(invoice_id, trigger = 'MANUAL_PIPELINE_RUN') {
    const res = await fetch(`/api/agent7/orchestrate/${encodeURIComponent(invoice_id)}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ trigger })
    });
    return await res.json();
  },

  async getApprovals() {
    const res = await fetch('/api/approvals');
    return await res.json();
  },

  async decideApproval(taskId, approved, notes = '') {
    const res = await fetch(`/api/approvals/${encodeURIComponent(taskId)}/decision`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ approved, notes })
    });
    return await res.json();
  },

  async getAuditLogs() {
    const res = await fetch('/api/audit-logs');
    return await res.json();
  },

  async getTransactions() {
    const res = await fetch('/api/transactions');
    return await res.json();
  },

  async getSkills() {
    const res = await fetch('/api/skills');
    return await res.json();
  },

  async getHarnessEvals() {
    const res = await fetch('/api/harness/evals');
    return await res.json();
  }
};

window.API = API;
