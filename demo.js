(function () {
  "use strict";

  const policy = window.DaedoryxLabPolicy;
  if (!policy) throw new Error("DAEDORYX demo policy must load before the lab UI.");
  const $ = (id) => document.getElementById(id);
  const state = {
    selected: 0, events: [], evaluations: 0, denied: 0, reviews: 0,
    runToken: 0, busy: false, lastPending: null, selectedLens: "CEO"
  };
  const decisions = { ALLOW: "allow", DENY: "deny", REVIEW: "review" };
  const statuses = { ALLOW: "Sandbox policy: ALLOW", DENY: "Sandbox policy: DENY", REVIEW: "Human review required" };
  const stepNodes = [...document.querySelectorAll(".flow-node")];
  const scenarioCategories = ["AGENT WORKFLOW", "DATA PROTECTION", "CHANGE CONTROL", "SECURITY RESPONSE", "AGENT GOVERNANCE", "FINANCIAL GOVERNANCE"];
  const lenses = {
    CEO: ["CEO / STRATEGIC CONTROL", "Delegate operations without delegating unrestricted authority.", "The demo illustrates how autonomous work can be coordinated while preserving explicit decision boundaries. It does not claim measured productivity improvements."],
    CFO: ["CFO / FINANCIAL GOVERNANCE", "Set thresholds. Preserve approval rights. Record the decision.", "Test an automated purchase above $5,000: the example routes the request for review. Thresholds are illustrative and not verified product controls."],
    CIO: ["CIO / OPERATING MODEL", "Connect intent, policy and auditable execution.", "This synthetic workflow demonstrates one potential governance pattern for integrating separate business systems. There are no production integrations in this lab."],
    CTO: ["CTO / PLATFORM ENGINEERING", "Agents require scoped credentials and controlled tool access.", "Try a staging deployment, then production. The deterministic model changes the decision at the environment boundary; no CI/CD pipeline is called."],
    CISO: ["CISO / SECURITY ASSURANCE", "Treat AI agents as non-human identities with enforceable privileges.", "Explore denial, separation of duties and data-egress constraints. This is a reference policy model, not a live detection, prevention or compliance certification."]
  };

  function make(tag, className, text) {
    const el = document.createElement(tag);
    if (className) el.className = className;
    if (text !== undefined) el.textContent = text;
    return el;
  }
  function setText(id, value) { $(id).textContent = value; }
  function pad(n) { return String(n).padStart(2, "0"); }
  function requestFromForm() {
    const amount = Number($("amount-input").value);
    if (!Number.isFinite(amount) || amount < 0 || amount > 1000000000) {
      throw new Error("Order amount must be between 0 and 1,000,000,000 USD.");
    }
    return {
      agent: $("agent-select").value,
      action: $("action-select").value,
      environment: $("environment-select").value,
      destination: $("destination-select").value,
      amount,
      selfReview: $("self-review").checked,
      untrustedInput: $("untrusted-input").checked,
      approved: false
    };
  }
  function setFields(s) {
    $("agent-select").value = s.agent;
    $("action-select").value = s.action;
    $("environment-select").value = s.environment;
    $("destination-select").value = s.destination;
    $("amount-input").value = s.amount;
    $("self-review").checked = Boolean(s.selfReview);
    $("untrusted-input").checked = Boolean(s.untrustedInput);
  }
  function clearFlow() {
    for (const node of stepNodes) node.classList.remove("working", "passed", "stopped", "waiting");
    setText("flow-caption", "AWAITING EVALUATION");
  }
  function showIdle(message) {
    const result = $("result");
    result.className = "result result-idle";
    $("decision-pill").className = "status-pill status-idle";
    setText("decision-pill", "READY");
    setText("result-heading", "Ready to evaluate");
    setText("result-glyph", "◇");
    setText("result-reason", message || "Nothing has been executed. Change parameters and evaluate.");
    $("result-extra").hidden = true;
    $("approval-panel").hidden = true;
    setText("check-summary", "0 / 6 CHECKS EVALUATED");
    $("policy-checks").replaceChildren(make("p", "empty-state", "Run a request to view all six rule outcomes."));
    state.lastPending = null;
    clearFlow();
  }
  function scenarioButton(s, i) {
    const button = make("button", "scenario-button");
    button.type = "button";
    button.dataset.scenarioIndex = String(i);
    button.setAttribute("aria-pressed", String(i === state.selected));
    const top = make("span", "scenario-top");
    top.append(make("span", "scenario-index", "CASE " + pad(i + 1)));
    top.append(make("span", "scenario-outcome " + (s.tag === "BLOCKED" ? "blocked" : s.tag === "APPROVAL" ? "approval" : ""), s.tag));
    button.append(top, make("strong", "", s.title), make("small", "", scenarioCategories[i]));
    button.addEventListener("click", () => chooseScenario(i));
    return button;
  }
  function chooseScenario(i) {
    if (state.busy) cancelRunning();
    state.selected = i;
    const s = policy.SCENARIOS[i];
    setFields(s);
    setText("workbench-title", s.title);
    setText("scenario-copy", s.copy);
    setText("request-id", "/ REQ-" + String(state.evaluations + 1).padStart(3, "0"));
    for (const btn of document.querySelectorAll(".scenario-button")) {
      btn.setAttribute("aria-pressed", String(Number(btn.dataset.scenarioIndex) === i));
    }
    showIdle();
  }
  function cancelRunning() {
    state.runToken++;
    state.busy = false;
    $("run-button").disabled = false;
  }
  function invalidate() {
    if (state.busy) cancelRunning();
    showIdle("Parameters changed. Re-evaluate before requesting authorization.");
  }
  function trace(checks) {
    const area = $("policy-checks");
    const nodes = checks.map((c) => {
      const row = make("div", "check-row");
      const dot = make("span", "check-dot " + (c.status === "pass" ? "" : c.status), c.status === "pass" ? "✓" : c.status === "deny" ? "×" : "!");
      dot.setAttribute("aria-label", c.status);
      const body = make("div", "check-row-main");
      const header = make("div", "check-row-title");
      header.append(make("strong", "", c.title), make("span", "", c.id + " / " + c.status.toUpperCase()));
      body.append(header, make("p", "", c.detail));
      row.append(dot, body);
      return row;
    });
    area.replaceChildren(...nodes);
    setText("check-summary", String(checks.length) + " / 6 CHECKS EVALUATED");
  }
  function showDecision(outcome) {
    const key = decisions[outcome.decision];
    $("decision-pill").className = "status-pill status-" + key;
    setText("decision-pill", outcome.decision);
    $("result").className = "result result-" + key;
    setText("result-glyph", outcome.decision === "ALLOW" ? "✓" : outcome.decision === "DENY" ? "×" : "◈");
    setText("result-heading", statuses[outcome.decision]);
    setText("result-reason", outcome.reason + " " + outcome.message);
    if (outcome.untrustedInputNotice) {
      $("result-extra").hidden = false;
      setText("result-extra", outcome.untrustedInputNotice);
    } else $("result-extra").hidden = true;
    trace(outcome.checks);
    $("approval-panel").hidden = outcome.decision !== "REVIEW";
    if (outcome.decision === "DENY") {
      setText("flow-caption", "BLOCKED BEFORE TOOL BOUNDARY");
    } else if (outcome.decision === "REVIEW") {
      setText("flow-caption", "HELD FOR HUMAN AUTHORIZATION");
    } else {
      setText("flow-caption", "AUTHORIZED — NO REAL TOOL EXECUTED");
    }
    stepNodes.forEach((node, index) => {
      node.classList.remove("working", "passed", "stopped", "waiting");
      if (index === 0 || index === 4) node.classList.add("passed");
      else if (index === 1) node.classList.add(outcome.checks[0].status === "deny" ? "stopped" : "passed");
      else if (index === 2) node.classList.add(outcome.decision === "DENY" ? "stopped" : outcome.decision === "REVIEW" ? "waiting" : "passed");
      else node.classList.add(outcome.decision === "ALLOW" ? "passed" : outcome.decision === "DENY" ? "stopped" : "waiting");
    });
  }
  function updateMetrics() {
    setText("hero-runs", pad(state.evaluations));
    setText("metric-denied", pad(state.denied));
    setText("metric-reviews", pad(state.reviews));
    setText("audit-count", pad(state.events.length));
    $("download-audit").disabled = state.events.length === 0;
    $("clear-audit").disabled = state.events.length === 0;
  }
  function renderAudit() {
    const list = $("audit-list");
    if (!state.events.length) {
      const placeholder = make("div", "audit-empty");
      placeholder.append(make("span", "empty-orbit", "◎"), make("strong", "", "No decisions yet"), make("small", "", "Evaluations appear here as they happen."));
      list.replaceChildren(placeholder);
      return;
    }
    const items = state.events.slice().reverse().slice(0, 18).map((ev) => {
      const row = make("article", "audit-item");
      const header = make("div", "audit-item-top");
      const time = make("time", "", new Date(ev.timestamp).toLocaleTimeString([], {hour: "2-digit", minute: "2-digit", second: "2-digit"}));
      time.dateTime = ev.timestamp;
      header.append(time, make("span", "audit-outcome " + decisions[ev.decision], ev.decision));
      row.append(header, make("strong", "", ev.actor + " / " + ev.action), make("p", "", ev.reason), make("small", "", ev.id + " · " + ev.eventType));
      return row;
    });
    list.replaceChildren(...items);
  }
  function record(outcome, type) {
    const ev = {
      id: "DEMO-EVT-" + String(state.events.length + 1).padStart(5, "0"),
      timestamp: new Date().toISOString(),
      simulated: true,
      engine: "DAEDORYX rule-based event sandbox alpha-01",
      scenario: policy.SCENARIOS[state.selected].id,
      actor: outcome.agent,
      action: outcome.actionName,
      eventType: type,
      decision: outcome.decision,
      reason: outcome.reason,
      request: { ...outcome.request },
      checks: outcome.checks.map(c => ({ ...c }))
    };
    state.events.push(ev);
    state.evaluations++;
    if (outcome.decision === "DENY") state.denied++;
    if (outcome.decision === "REVIEW") state.reviews++;
    updateMetrics();
    renderAudit();
    setText("request-id", "/ REQ-" + String(state.evaluations + 1).padStart(3, "0"));
  }
  function conclude(outcome, type, request) {
    state.busy = false;
    $("run-button").disabled = false;
    showDecision(outcome);
    record(outcome, type);
    state.lastPending = outcome.decision === "REVIEW" ? { request: { ...request }, scenario: state.selected } : null;
  }
  function run(request, type, overrideDecision) {
    if (state.busy) return;
    let outcome = policy.evaluation(request);
    if (overrideDecision === "DENY") {
      outcome = {
        ...outcome, decision: "DENY",
        reason: "Human reviewer rejected the exact pending request.",
        message: "Simulated reviewer decision recorded; nothing was executed."
      };
    }
    state.busy = true;
    const token = ++state.runToken;
    $("run-button").disabled = true;
    $("approval-panel").hidden = true;
    $("decision-pill").className = "status-pill status-idle";
    setText("decision-pill", "EVALUATING");
    setText("result-heading", "Evaluating policy");
    setText("result-reason", "The decision engine is running locally in this browser.");
    setText("result-glyph", "◇");
    $("result").className = "result result-idle";
    $("result-extra").hidden = true;
    clearFlow();
    setText("flow-caption", "DETERMINISTIC POLICY EVALUATION");
    for (let i = 0; i < stepNodes.length; i++) {
      window.setTimeout(() => {
        if (token !== state.runToken) return;
        for (let j = 0; j < i; j++) {
          stepNodes[j].classList.remove("working");
          stepNodes[j].classList.add("passed");
        }
        stepNodes[i].classList.add("working");
      }, i * 145);
    }
    window.setTimeout(() => {
      if (token !== state.runToken) return;
      conclude(outcome, type, request);
    }, stepNodes.length * 145 + 80);
  }
  function evaluateSelected() {
    try {
      const req = requestFromForm();
      run(req, "rule-evaluation");
    } catch (err) {
      showIdle(err.message);
      $("amount-input").focus();
    }
  }
  function resolveApproval(accepted) {
    if (!state.lastPending || state.busy) return;
    const saved = state.lastPending;
    if (saved.scenario !== state.selected) return;
    let current;
    try { current = requestFromForm(); } catch { invalidate(); return; }
    if (JSON.stringify(current) !== JSON.stringify(saved.request)) { invalidate(); return; }
    state.lastPending = null;
    run({ ...saved.request, approved: accepted }, accepted ? "human-approval-simulated" : "human-rejection-simulated", accepted ? undefined : "DENY");
  }
  function downloadAudit() {
    if (!state.events.length) return;
    const data = {
      disclaimer: "SYNTHETIC, LOCAL BROWSER DEMO. Not production evidence, proof of deployed controls or a real audit log.",
      exportedAt: new Date().toISOString(),
      name: "DAEDORYX Experience Lab",
      source: "Browser-only deterministic scenario simulator",
      dataClassification: "SYNTHETIC",
      totalEvents: state.events.length,
      events: state.events
    };
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = "daedoryx-synthetic-audit-" + new Date().toISOString().slice(0, 10) + ".json";
    document.body.appendChild(link);
    link.click();
    link.remove();
    window.setTimeout(() => URL.revokeObjectURL(url), 250);
  }
  function selectLens(lens) {
    if (!lenses[lens]) return;
    state.selectedLens = lens;
    const [label, headline, copy] = lenses[lens];
    setText("lens-label", label);
    setText("lens-headline", headline);
    setText("lens-description", copy);
    document.querySelectorAll("[data-lens]").forEach((btn) => {
      const active = btn.dataset.lens === lens;
      btn.setAttribute("aria-selected", String(active));
      btn.tabIndex = active ? 0 : -1;
    });
  }
  function toggleStage() {
    const active = document.body.classList.toggle("stage-mode");
    $("stage-toggle").setAttribute("aria-pressed", String(active));
    setText("stage-toggle", active ? "EXIT STAGE MODE ↙" : "STAGE MODE ↗");
  }

  $("scenario-list").replaceChildren(...policy.SCENARIOS.map(scenarioButton));
  $("run-button").addEventListener("click", evaluateSelected);
  $("reset-case").addEventListener("click", () => chooseScenario(state.selected));
  $("request-form").addEventListener("change", invalidate);
  $("request-form").addEventListener("input", invalidate);
  $("request-form").addEventListener("submit", (event) => { event.preventDefault(); evaluateSelected(); });
  $("approve-button").addEventListener("click", () => resolveApproval(true));
  $("reject-button").addEventListener("click", () => resolveApproval(false));
  $("download-audit").addEventListener("click", downloadAudit);
  $("clear-audit").addEventListener("click", () => {
    if (state.busy) cancelRunning();
    state.events = []; state.evaluations = 0; state.denied = 0; state.reviews = 0;
    updateMetrics(); renderAudit(); chooseScenario(state.selected);
  });
  $("stage-toggle").addEventListener("click", toggleStage);
  document.querySelectorAll("[data-lens]").forEach(btn => {
    btn.addEventListener("click", () => selectLens(btn.dataset.lens));
    btn.addEventListener("keydown", (event) => {
      if (!["ArrowLeft", "ArrowRight"].includes(event.key)) return;
      event.preventDefault();
      const options = Object.keys(lenses);
      const next = options[(options.indexOf(state.selectedLens) + (event.key === "ArrowRight" ? 1 : -1) + options.length) % options.length];
      selectLens(next);
      document.querySelector('[data-lens="' + next + '"]').focus();
    });
  });
  document.addEventListener("keydown", (event) => {
    if (event.altKey || event.metaKey || event.ctrlKey) return;
    const target = event.target;
    const typing = target && (["INPUT", "SELECT", "TEXTAREA"].includes(target.tagName) || target.isContentEditable);
    if (typing) return;
    if (/^[1-6]$/.test(event.key) && !event.repeat) chooseScenario(Number(event.key) - 1);
    if (event.key.toLowerCase() === "f" && !event.repeat) {
      if (!document.fullscreenElement) document.documentElement.requestFullscreen?.().catch(() => {});
      else document.exitFullscreen?.().catch(() => {});
    }
  });

  updateMetrics();
  chooseScenario(0);
  selectLens("CEO");
  if (new URLSearchParams(window.location.search).get("mode") === "stage") toggleStage();
})();
