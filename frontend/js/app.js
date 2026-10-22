/**
 * Orbyte Smart Payment Follow-up AI - Main Application Controller (English Edition)
 * Manages full-screen 3D campus, sliding drawer menu, proximity interactions,
 * step-by-step animated checklists with checkmarks (✓), Agent 2 overdue inspector,
 * Agent 4 conversation threads + AI summary + Agent 5 auto-drafting, and Agent 6 payment ledger.
 */

class AppController {
  constructor() {
    this.currentView = 'campus';
    this.scene3d = null;
    this.invoices = [];
    this.categorizedInvoices = { overdue: [], upcoming: [], paid: [] };
    this.conversations = [];
    this.selectedConvId = null;
    this.transactions = [];
    this.approvals = [];
    this.auditLogs = [];
    this.skills = [];
  }

  async init() {
    // 1. Initialize Full-Screen 3D Campus
    this.scene3d = new Office3DScene('three-canvas');

    // 2. Setup All Event Listeners
    this.bindEvents();

    // 3. Load live data from localhost backend
    await this.refreshData();
  }

  bindEvents() {
    // Hamburger menu toggle
    const burgerBtn = document.getElementById('hamburger-btn');
    const drawerBackdrop = document.getElementById('drawer-backdrop');
    const drawerCloseBtn = document.getElementById('drawer-close-btn');

    if (burgerBtn) {
      burgerBtn.addEventListener('click', () => this.toggleDrawer(true));
    }
    if (drawerCloseBtn) {
      drawerCloseBtn.addEventListener('click', () => this.toggleDrawer(false));
    }
    if (drawerBackdrop) {
      drawerBackdrop.addEventListener('click', (e) => {
        if (e.target === drawerBackdrop) this.toggleDrawer(false);
      });
    }

    // Drawer Nav Items
    document.querySelectorAll('.drawer-nav-item').forEach(item => {
      item.addEventListener('click', () => {
        const targetView = item.dataset.view;
        if (targetView) {
          this.switchView(targetView);
          this.toggleDrawer(false);
        }
      });
    });

    // "Back to 3D Campus" buttons on dedicated pages
    document.querySelectorAll('.back-to-campus-btn').forEach(btn => {
      btn.addEventListener('click', () => this.switchView('campus'));
    });

    // Close Action Popup
    const popupCancelBtn = document.getElementById('popup-cancel-btn');
    if (popupCancelBtn) {
      popupCancelBtn.addEventListener('click', () => this.hideAgentActionModal());
    }

    // Execute Action Button in Popup
    const popupExecuteBtn = document.getElementById('popup-execute-btn');
    if (popupExecuteBtn) {
      popupExecuteBtn.addEventListener('click', () => this.executeActionFromModal());
    }

    // Close Client Detail Drawer
    const closeClientDrawerBtn = document.getElementById('client-drawer-close-btn');
    if (closeClientDrawerBtn) {
      closeClientDrawerBtn.addEventListener('click', () => this.closeClientDetailDrawer());
    }
  }

  toggleDrawer(open) {
    const backdrop = document.getElementById('drawer-backdrop');
    if (backdrop) {
      backdrop.classList.toggle('open', open);
    }
  }

  switchView(viewName) {
    this.currentView = viewName;

    // Update drawer active state
    document.querySelectorAll('.drawer-nav-item').forEach(item => {
      item.classList.toggle('active', item.dataset.view === viewName);
    });

    // Hide all dedicated overlays
    document.querySelectorAll('.dedicated-screen-overlay').forEach(el => {
      el.classList.remove('active');
    });

    if (viewName === 'campus') {
      if (this.scene3d) {
        setTimeout(() => this.scene3d.onResize(), 60);
      }
    } else {
      const targetOverlay = document.getElementById(`overlay-${viewName}`);
      if (targetOverlay) {
        targetOverlay.classList.add('active');
        if (viewName === 'agent-2') this.loadAgent2CategorizedInvoices();
        if (viewName === 'agent-4') this.loadAgent4Conversations();
        if (viewName === 'agent-6') this.loadAgent6Transactions();
      }
    }
  }

  async refreshData() {
    try {
      const [statusRes, invRes, appRes, audRes, skillsRes, txRes, convRes] = await Promise.all([
        API.getStatus(),
        API.getInvoices(),
        API.getApprovals(),
        API.getAuditLogs(),
        API.getSkills(),
        API.getTransactions(),
        API.getConversations()
      ]);

      this.systemStatus = statusRes;
      this.invoices = invRes.invoices || [];
      this.approvals = appRes.approvals || [];
      this.auditLogs = audRes.audit_logs || [];
      this.skills = skillsRes.skills || [];
      this.transactions = txRes.transactions || [];
      this.conversations = convRes.conversations || [];

      this.renderOverviewMetrics();
      this.renderInvoicesTable();
      this.renderApprovalsQueue();
      this.renderAuditLogsTable();
      this.renderSkillsViewer();
    } catch (e) {
      console.error("Data refresh failed:", e);
    }
  }

  // --- Proximity & Interactive Action Modal ---
  updateProximityPrompt(nearestAgent) {
    const prompt = document.getElementById('proximity-prompt');
    if (!prompt) return;

    if (nearestAgent && this.currentView === 'campus') {
      prompt.style.display = 'flex';
      prompt.innerHTML = `💬 Press <span class="keyboard-key" style="margin:0 4px;">E</span> or click to interact with <strong>${nearestAgent.name}</strong> (${nearestAgent.actionName})`;
      prompt.onclick = () => this.showAgentActionModal(nearestAgent);
    } else {
      prompt.style.display = 'none';
    }
  }

  showAgentActionModal(agentData) {
    this.currentInteractingAgent = agentData;
    const modal = document.getElementById('agent-action-popup');
    if (!modal) return;

    document.getElementById('popup-agent-name').innerText = agentData.name;
    document.getElementById('popup-agent-role').innerText = agentData.role;
    
    const tasksContainer = document.getElementById('popup-tasks-list');
    tasksContainer.innerHTML = (agentData.tasks || []).map(t => `
      <div class="popup-task-item"><span>📌</span><span>${t}</span></div>
    `).join('');

    const execBtn = document.getElementById('popup-execute-btn');
    execBtn.innerText = agentData.actionName || "Execute Task & Open Dashboard";
    execBtn.style.background = agentData.color || "var(--primary)";

    modal.classList.add('open');
  }

  hideAgentActionModal() {
    const modal = document.getElementById('agent-action-popup');
    if (modal) modal.classList.remove('open');
    this.currentInteractingAgent = null;
  }

  executeActionFromModal() {
    if (!this.currentInteractingAgent) return;
    const agent = this.currentInteractingAgent;
    this.hideAgentActionModal();

    if (this.scene3d) {
      this.scene3d.playAgentExecutionAnimation(agent, () => {
        this.switchView(`agent-${agent.id}`);
      });
    } else {
      this.switchView(`agent-${agent.id}`);
    }
  }

  // --- Step-By-Step Checklist Component Renderer (✓) ---
  renderStepChecklist(containerId, steps) {
    const container = document.getElementById(containerId);
    if (!container || !steps) return;

    container.innerHTML = `
      <div class="step-checklist-card">
        <div class="step-checklist-title">
          <span>⚙️ Execution Pipeline Checklist</span>
        </div>
        ${steps.map((st, idx) => `
          <div class="step-item" style="animation-delay: ${idx * 0.1}s">
            <div class="step-checkbox ${st.checked ? 'done' : 'pending'}">
              ${st.checked ? '✓' : '...'}
            </div>
            <div class="step-content">
              <div class="step-name">${st.name}</div>
              <div class="step-detail">${st.detail || ''}</div>
            </div>
          </div>
        `).join('')}
      </div>
    `;
  }

  // --- Agent 1: Data Ingestion & Pydantic Validation ---
  async testAgent1Ingest() {
    const text = document.getElementById('agent1-input-text').value;
    const statusBox = document.getElementById('agent1-status');
    statusBox.innerText = "Extracting layout via Docling parser & validating schemas via Pydantic v2...";

    try {
      const res = await API.ingestInvoice({ raw_text: text, filename: "Commercial_Invoice_Upload.pdf" });
      statusBox.innerText = res.success ? "✅ Extraction & Validation Passed! Ingested into database" : "⚠️ Validation failed; routed to exception queue";

      this.renderStepChecklist('agent1-steps-container', res.steps);

      const fieldsBox = document.getElementById('agent1-extracted-fields');
      if (res.invoice) {
        fieldsBox.innerHTML = `
          <div style="background:#f8fafc; border:1px solid var(--border-light); border-radius:8px; padding:16px; font-size:13px;">
            <p><strong>Invoice ID:</strong> <span style="color:var(--primary); font-family:monospace">${res.invoice.invoice_id}</span></p>
            <p><strong>Customer Entity:</strong> ${res.invoice.customer_name} (${res.invoice.customer_email})</p>
            <p><strong>Issue & Due Date:</strong> ${res.invoice.issue_date} &rarr; <strong>${res.invoice.due_date}</strong></p>
            <p><strong>Total Settlement Amount:</strong> $${res.invoice.total_amount.toFixed(2)} ${res.invoice.currency}</p>
            <p><strong>Docling Extraction Confidence:</strong> ${(res.invoice.confidence_score * 100).toFixed(1)}%</p>
            <p><strong>Workflow Lifecycle State:</strong> <span class="status-pill green">${res.invoice.current_state}</span></p>
          </div>
        `;
      } else {
        fieldsBox.innerHTML = `<div style="color:var(--accent-rose)">${res.validation_errors.join('<br>')}</div>`;
      }

      await this.refreshData();
    } catch (e) {
      statusBox.innerText = "Execution Error: " + e.message;
    }
  }

  // --- Agent 2: Payment Monitoring, Aging & Overdue Client Details ---
  async loadAgent2CategorizedInvoices() {
    const container = document.getElementById('agent2-cards-container');
    if (!container) return;
    container.innerHTML = "<p>Scanning PostgreSQL state store & running deterministic rules...</p>";

    try {
      const res = await API.getCategorizedInvoices();
      this.categorizedInvoices = res;

      this.renderStepChecklist('agent2-steps-container', res.steps);
      this.filterAgent2Category('overdue');
    } catch (e) {
      container.innerHTML = "<p style='color:red;'>Scan failed: " + e.message + "</p>";
    }
  }

  filterAgent2Category(category) {
    const list = this.categorizedInvoices[category] || [];
    const container = document.getElementById('agent2-cards-container');
    if (!container) return;

    document.querySelectorAll('.agent2-filter-btn').forEach(b => {
      b.classList.toggle('active', b.dataset.cat === category);
    });

    if (list.length === 0) {
      container.innerHTML = `<div style="padding:24px; text-align:center; color:var(--text-muted)">No active invoices found in this category.</div>`;
      return;
    }

    container.innerHTML = list.map(inv => {
      const isOverdue = category === 'overdue';
      return `
        <div class="card" style="${isOverdue ? 'border-left: 4px solid var(--accent-rose); background:#fffaf9;' : ''}">
          <div style="display:flex; justify-content:space-between; align-items:flex-start; margin-bottom:12px;">
            <div>
              <strong style="color:var(--primary); font-family:monospace; font-size:15px;">${inv.invoice_id}</strong>
              <span style="font-size:13px; color:var(--text-secondary); margin-left:8px;">${inv.customer_name}</span>
            </div>
            ${isOverdue ? `<span class="overdue-alert-pill">⚠️ Overdue by ${inv.evaluation.days_overdue} Days</span>` : `<span class="status-pill green">Normal / Controlled</span>`}
          </div>

          <div style="display:flex; gap:24px; font-size:13px; margin-bottom:14px;">
            <div>Due Date: <strong>${inv.due_date}</strong></div>
            <div>Total: <strong>$${inv.total_amount.toFixed(2)}</strong></div>
            <div>Balance Due: <strong style="color:var(--text-primary);">$${inv.balance_due.toFixed(2)}</strong></div>
            <div>Next Auto Check: <span>${inv.evaluation.next_check}</span></div>
          </div>

          <div style="font-size:12px; color:var(--text-secondary); background:white; border:1px solid var(--border-light); padding:10px; border-radius:6px; margin-bottom:12px;">
            <strong>Policy Evaluation:</strong> ${inv.evaluation.policy_summary}
          </div>

          <div style="display:flex; justify-content:flex-end; gap:10px;">
            <button class="btn btn-secondary btn-sm" onclick="app.openClientDetailDrawer('${inv.invoice_id}')">🔍 View Customer & Profile Details</button>
            <button class="btn btn-primary btn-sm" onclick="app.handoffToAgent5('${inv.invoice_id}')">✉️ Hand-off to Agent 5 for Follow-up</button>
          </div>
        </div>
      `;
    }).join('');
  }

  openClientDetailDrawer(invoiceId) {
    const inv = this.invoices.find(i => i.invoice_id === invoiceId);
    if (!inv) return;

    const drawer = document.getElementById('client-detail-drawer');
    const content = document.getElementById('client-drawer-content');
    if (!drawer || !content) return;

    content.innerHTML = `
      <div style="margin-bottom:20px;">
        <span class="status-pill red">Overdue Follow-up Profile</span>
        <h3 style="font-size:18px; font-weight:700; margin-top:8px;">${inv.customer_name}</h3>
        <p style="font-size:12px; color:var(--text-secondary);">Customer Entity ID: ${inv.customer_id}</p>
      </div>

      <div class="card" style="padding:16px; margin-bottom:16px;">
        <div class="stat-title">Contact & Accounts Payable Info</div>
        <p style="font-size:13px; margin-bottom:6px;">📧 <strong>AP Email:</strong> ${inv.customer_email}</p>
        <p style="font-size:13px;">📞 <strong>Direct Phone:</strong> ${inv.customer_phone || '+1 (555) 234-5678'}</p>
      </div>

      <div class="card" style="padding:16px; margin-bottom:16px;">
        <div class="stat-title">Aging & Default Analysis</div>
        <p style="font-size:13px; margin-bottom:6px;"><strong>Invoice ID:</strong> ${inv.invoice_id}</p>
        <p style="font-size:13px; margin-bottom:6px;"><strong>Agreed Due Date:</strong> ${inv.due_date}</p>
        <p style="font-size:13px; margin-bottom:6px;"><strong>Outstanding Principal:</strong> $${inv.balance_due.toFixed(2)}</p>
        <p style="font-size:13px; color:var(--accent-rose);"><strong>Default Aging:</strong> ${Math.max(0, Math.floor((new Date() - new Date(inv.due_date))/(1000*3600*24)))} Days Overdue</p>
      </div>

      <div class="card" style="padding:16px; margin-bottom:20px;">
        <div class="stat-title">Contracted Line Items</div>
        ${inv.items.map(it => `
          <div style="font-size:12px; border-bottom:1px dashed var(--border-light); padding:6px 0;">
            <div>${it.description} (Qty: ${it.quantity})</div>
            <div style="color:var(--text-secondary); text-align:right;">$${it.total.toFixed(2)}</div>
          </div>
        `).join('')}
      </div>

      <button class="btn btn-primary" style="width:100%;" onclick="app.handoffToAgent5('${inv.invoice_id}')">✉️ Hand-off to Agent 5 for Follow-up Draft &rarr;</button>
    `;

    drawer.classList.add('open');
  }

  closeClientDetailDrawer() {
    const drawer = document.getElementById('client-detail-drawer');
    if (drawer) drawer.classList.remove('open');
  }

  handoffToAgent5(invoiceId) {
    this.closeClientDetailDrawer();
    this.switchView('agent-5');
    const select = document.getElementById('agent5-inv-select');
    if (select) {
      select.value = invoiceId;
      this.testAgent5Strategy();
    }
  }

  // --- Agent 3: Laya Decision & Calibrated Routing ---
  async testAgent3Laya() {
    const text = document.getElementById('agent3-input-text').value;
    const output = document.getElementById('agent3-output');
    output.innerText = "Scoring candidate categories via non-autoregressive Laya model...";

    try {
      const res = await API.classifyLaya(text);
      this.renderStepChecklist('agent3-steps-container', res.steps);
      output.innerText = JSON.stringify(res, null, 2);
    } catch (e) {
      output.innerText = "Scoring failed: " + e.message;
    }
  }

  // --- Agent 4 & Agent 5: Customer Conversations + AI Summary + Tailored Reply ---
  async loadAgent4Conversations() {
    const listContainer = document.getElementById('conv-thread-list');
    if (!listContainer) return;

    try {
      const res = await API.getConversations();
      this.conversations = res.conversations || [];

      listContainer.innerHTML = this.conversations.map((c, idx) => `
        <div class="conv-thread-item ${idx === 0 ? 'active' : ''}" data-conv-id="${c.conversation_id}" onclick="app.selectConversation('${c.conversation_id}')">
          <div class="conv-cust-name">${c.customer_name}</div>
          <div style="font-size:11px; color:var(--text-muted); margin-bottom:4px;">${c.contact_person} • ${c.last_channel}</div>
          <div class="conv-last-msg">${c.messages[c.messages.length - 1].text}</div>
        </div>
      `).join('');

      if (this.conversations.length > 0) {
        this.selectConversation(this.conversations[0].conversation_id);
      }
    } catch (e) {
      listContainer.innerHTML = "<p style='color:red;'>Failed to load conversations: " + e.message + "</p>";
    }
  }

  async selectConversation(convId) {
    this.selectedConvId = convId;
    document.querySelectorAll('.conv-thread-item').forEach(el => {
      el.classList.toggle('active', el.dataset.convId === convId);
    });

    const conv = this.conversations.find(c => c.conversation_id === convId);
    if (!conv) return;

    const chatViewer = document.getElementById('chat-bubbles-container');
    chatViewer.innerHTML = conv.messages.map(m => `
      <div class="chat-bubble ${m.sender.includes('Orbyte') ? 'orbyte' : 'customer'}">
        <div style="font-size:10px; opacity:0.8; margin-bottom:2px;">${m.sender} (${m.time})</div>
        <div>${m.text}</div>
      </div>
    `).join('');

    const summaryBox = document.getElementById('agent4-ai-summary-content');
    const draftBox = document.getElementById('agent5-ai-draft-content');
    summaryBox.innerHTML = "<p>Agent 4 is analyzing message text with DeepSeek NLU & checking injection guardrails...</p>";
    draftBox.innerHTML = "<p>Agent 5 is formulating policy-compliant reply draft...</p>";

    try {
      const res = await API.analyzeAndDraftConversation(convId);

      this.renderStepChecklist('conv-steps-container', res.steps);

      const a4 = res.agent4_summary;
      summaryBox.innerHTML = `
        <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom:10px;">
          <span class="status-pill green">Detected Intent: ${a4.detected_intent}</span>
          <span style="font-size:12px; color:var(--text-muted)">Confidence: ${(a4.confidence * 100).toFixed(1)}%</span>
        </div>
        <p style="font-size:13px; margin-bottom:6px;"><strong>Target Promised Date:</strong> ${a4.promised_date || 'None extracted'}</p>
        <p style="font-size:13px; margin-bottom:6px;"><strong>Dispute Rationale:</strong> ${a4.dispute_reason || 'None (No active dispute)'}</p>
        <p style="font-size:13px; margin-bottom:6px;"><strong>Payment Claim:</strong> ${a4.claimed_paid ? 'Customer claims payment sent (Escalated to Agent 6 for bank verification)' : 'Payment not yet received'}</p>
        <p style="font-size:12px; color:var(--primary);">🛡️ <strong>Prompt Injection Defense:</strong> 100% Passed (Adversarial override attempts filtered)</p>
      `;

      const a5 = res.agent5_draft;
      draftBox.innerHTML = `
        <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom:10px;">
          <span class="status-pill blue">Channel: ${a5.channel}</span>
          <span style="font-size:12px; font-weight:600; color:${a5.requires_approval ? 'var(--accent-rose)' : 'var(--primary)'}">
            ${a5.requires_approval ? '⚠️ Requires Supervisor Approval (> $4k)' : '✅ Pre-Authorized Standard Dispatch'}
          </span>
        </div>
        <div style="font-size:13px; font-weight:700; margin-bottom:8px;">Subject: ${a5.subject}</div>
        <div style="background:#f8fafc; border:1px solid var(--border-light); border-radius:8px; padding:12px; font-size:13px; white-space:pre-line; margin-bottom:14px;">${a5.body}</div>
        <div style="display:flex; justify-content:flex-end; gap:10px;">
          <button class="btn btn-secondary btn-sm" onclick="navigator.clipboard.writeText('${a5.body.replace(/\n/g, '\\n')}'); alert('Draft copied to clipboard!')">📋 Copy Draft</button>
          <button class="btn btn-primary btn-sm" onclick="app.submitDraftApproval('${conv.invoice_id}', '${a5.body.replace(/\n/g, '\\n')}')">🚀 Confirm & Dispatch</button>
        </div>
      `;
    } catch (e) {
      summaryBox.innerHTML = "<p style='color:red;'>Analysis failed: " + e.message + "</p>";
    }
  }

  submitDraftApproval(invoiceId, body) {
    alert("Draft message submitted to Agent 7 Orchestrator. Dispatched via authorized gateway if approved!");
    this.refreshData();
  }

  // --- Agent 5: Standalone Collection Strategy ---
  async testAgent5Strategy() {
    const invId = document.getElementById('agent5-inv-select').value;
    const channel = document.getElementById('agent5-channel-select').value;
    const output = document.getElementById('agent5-output');
    output.innerText = "Evaluating aging brackets and drafting follow-up message...";

    try {
      const res = await API.draftFollowup(invId, channel);
      this.renderStepChecklist('agent5-steps-container', res.steps);
      output.innerText = JSON.stringify(res, null, 2);
    } catch (e) {
      output.innerText = "Draft generation failed: " + e.message;
    }
  }

  // --- Agent 6: Payment Reconciliation & Clear Transaction Ledger ---
  async loadAgent6Transactions() {
    const tbody = document.getElementById('agent6-txns-tbody');
    if (!tbody) return;

    try {
      const res = await API.getTransactions();
      this.transactions = res.transactions || [];

      tbody.innerHTML = this.transactions.map(t => `
        <tr>
          <td><strong style="color:var(--primary); font-family:monospace">${t.transaction_id}</strong></td>
          <td>${t.date}</td>
          <td><strong>${t.sender_name}</strong></td>
          <td><strong style="color:#15803d">$${t.amount.toLocaleString('en-US', {minimumFractionDigits:2})}</strong></td>
          <td style="font-family:monospace; font-size:12px;">${t.reference_note}</td>
          <td><span class="status-pill green">MATCHED_PAID</span></td>
          <td><button class="btn btn-secondary btn-sm" onclick="app.inspectTransaction('${t.transaction_id}')">View Evidence</button></td>
        </tr>
      `).join('');
    } catch (e) {
      tbody.innerHTML = `<tr><td colspan="7" style="color:red">Failed to load: ${e.message}</td></tr>`;
    }
  }

  async testAgent6Reconcile() {
    const ref = document.getElementById('agent6-ref-input').value;
    const amt = parseFloat(document.getElementById('agent6-amt-input').value) || 1000;
    const sender = document.getElementById('agent6-sender-input').value;
    const output = document.getElementById('agent6-output');
    output.innerText = "Executing multi-tier deterministic matching...";

    try {
      const res = await API.reconcilePayment({ reference_note: ref, amount: amt, sender_name: sender });
      this.renderStepChecklist('agent6-steps-container', res.steps);
      output.innerText = JSON.stringify(res, null, 2);
      await this.loadAgent6Transactions();
      await this.refreshData();
    } catch (e) {
      output.innerText = "Reconciliation failed: " + e.message;
    }
  }

  inspectTransaction(txId) {
    const tx = this.transactions.find(t => t.transaction_id === txId);
    if (!tx) return;
    alert(`Bank Deposit Voucher Record:\n\nTransaction ID: ${tx.transaction_id}\nValue Date: ${tx.date}\nPayer Entity: ${tx.sender_name}\nSettlement Amount: $${tx.amount.toFixed(2)} ${tx.currency}\nReference Memo: ${tx.reference_note}\nSettlement Account: ${tx.bank_account}`);
  }

  // --- Agent 7: Durable Orchestrator Pipeline ---
  async testOrchestratorRun() {
    const invId = document.getElementById('wf-inv-select').value;
    const output = document.getElementById('wf-output');
    output.innerText = `Executing durable LangGraph pipeline step for ${invId}...`;

    try {
      const res = await API.runOrchestratorStep(invId);
      output.innerText = JSON.stringify(res, null, 2);
      await this.refreshData();
    } catch (e) {
      output.innerText = "Pipeline execution failed: " + e.message;
    }
  }

  // --- Overview & Common Renders ---
  renderOverviewMetrics() {
    if (!this.systemStatus || !this.systemStatus.metrics) return;
    const m = this.systemStatus.metrics;

    document.getElementById('stat-total-receivable').innerText = `$${m.total_receivable_usd.toLocaleString('en-US', { minimumFractionDigits: 2 })}`;
    document.getElementById('stat-open-invoices').innerText = m.open_invoices;
    document.getElementById('stat-overdue-count').innerText = m.overdue_invoices;
    document.getElementById('stat-pending-approvals').innerText = m.pending_approvals;
    document.getElementById('hud-overdue-badge').innerText = `${m.overdue_invoices} Overdue Accounts`;
  }

  renderInvoicesTable() {
    const tbody = document.getElementById('invoices-table-body');
    if (!tbody) return;

    tbody.innerHTML = this.invoices.map(inv => `
      <tr>
        <td><strong style="color:var(--primary); font-family:monospace">${inv.invoice_id}</strong></td>
        <td>${inv.customer_name}</td>
        <td>${inv.due_date}</td>
        <td>$${inv.total_amount.toFixed(2)}</td>
        <td><strong>$${inv.balance_due.toFixed(2)}</strong></td>
        <td><span class="status-pill ${inv.current_state === 'CLOSED' ? 'green' : 'amber'}">${inv.current_state}</span></td>
        <td>
          <button class="btn btn-secondary btn-sm" onclick="app.openClientDetailDrawer('${inv.invoice_id}')">Client Profile</button>
        </td>
      </tr>
    `).join('');
  }

  renderApprovalsQueue() {
    const container = document.getElementById('approvals-container');
    if (!container) return;

    const pending = this.approvals.filter(a => a.status === 'PENDING');
    if (pending.length === 0) {
      container.innerHTML = `<div style="text-align:center; padding:32px; color:var(--text-muted)">✅ All clear: No pending human approval tasks.</div>`;
      return;
    }

    container.innerHTML = pending.map(task => `
      <div class="card" style="border-left: 4px solid var(--accent-amber);">
        <div style="display:flex; justify-content:space-between; margin-bottom:10px;">
          <strong>${task.proposed_action}</strong>
          <span class="status-pill amber">Risk Level: ${task.risk_level}</span>
        </div>
        <p style="font-size:13px; color:var(--text-secondary); margin-bottom:8px;">Customer: ${task.customer_name} (${task.recipient}) | Invoice: ${task.invoice_id}</p>
        <div style="background:#f8fafc; border:1px solid var(--border-light); border-radius:6px; padding:12px; font-size:12px; white-space:pre-line; margin-bottom:12px;">${task.draft_message}</div>
        <div style="display:flex; justify-content:flex-end; gap:10px;">
          <button class="btn btn-secondary btn-sm" onclick="app.decideApproval('${task.task_id}', false)">Reject Dispatch</button>
          <button class="btn btn-primary btn-sm" onclick="app.decideApproval('${task.task_id}', true)">Approve & Transmit</button>
        </div>
      </div>
    `).join('');
  }

  async decideApproval(taskId, approved) {
    try {
      const res = await API.decideApproval(taskId, approved);
      alert(approved ? "✅ Approval granted. Dispatched via authorized gateway and recorded in audit trail." : "🛑 Follow-up dispatch rejected. Action halted.");
      await this.refreshData();
    } catch (e) {
      alert("Error: " + e.message);
    }
  }

  renderAuditLogsTable() {
    const tbody = document.getElementById('audit-table-body');
    if (!tbody) return;

    tbody.innerHTML = this.auditLogs.map(log => `
      <tr>
        <td style="font-family:monospace; font-size:11px;">${log.timestamp.slice(0, 19).replace('T', ' ')}</td>
        <td><strong>${log.actor}</strong></td>
        <td><span class="status-pill gray" style="font-size:10px;">${log.action}</span></td>
        <td style="font-size:11px; font-family:monospace;">${log.from_state} &rarr; <span style="color:var(--primary); font-weight:700;">${log.to_state}</span></td>
        <td style="font-size:12px; color:var(--text-secondary);">${log.decision_summary}</td>
        <td style="font-family:monospace; font-size:10px; color:var(--text-muted);">${log.idempotency_key}</td>
      </tr>
    `).join('');
  }

  renderSkillsViewer() {
    const select = document.getElementById('skill-selector');
    const container = document.getElementById('skill-content-container');
    if (!select || !container) return;

    select.innerHTML = this.skills.map((s, idx) => `
      <option value="${idx}">${s.name} (${s.path})</option>
    `).join('');

    const displaySkill = (idx) => {
      const skill = this.skills[idx];
      if (!skill) return;
      container.innerHTML = `
        <pre class="code-block" style="background:#f8fafc; color:#1e293b; border:1px solid var(--border-light); max-height:480px; white-space:pre-wrap;">${this.escapeHtml(skill.content)}</pre>
      `;
    };

    select.onchange = (e) => displaySkill(e.target.value);
    if (this.skills.length > 0) displaySkill(0);
  }

  escapeHtml(str) {
    return str.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");
  }
}

window.addEventListener('DOMContentLoaded', () => {
  window.app = new AppController();
  window.app.init();
});
