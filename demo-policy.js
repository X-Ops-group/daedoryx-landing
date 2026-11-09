/* DAEDORYX Scenario Lab — deterministic illustrative policy model.
 * No authentication, AI model, cloud or enterprise tool is invoked.
 * Classic browser script, deliberately compatible with offline file:// usage.
 */
(function (root) {
  "use strict";
  const AGENTS = Object.freeze({
    delivery: { name: "NOVA / Delivery", team: "Engineering", trusted: true, grants: ["read", "deploy", "merge"] },
    security: { name: "AEGIS / Security", team: "Security", trusted: true, grants: ["read", "contain"] },
    analyst: { name: "LYRA / Analytics", team: "Business Intelligence", trusted: true, grants: ["read", "export"] },
    finance: { name: "ATLAS / Finance", team: "Finance", trusted: true, grants: ["read", "purchase"] },
    unknown: { name: "UNKNOWN / Unregistered", team: "External", trusted: false, grants: [] }
  });
  const ACTIONS = Object.freeze({
    read: "Read internal status",
    deploy: "Deploy application",
    merge: "Merge code change",
    export: "Export customer records",
    contain: "Contain suspicious identity",
    purchase: "Approve supplier order"
  });
  const SCENARIOS = Object.freeze([
    {
      id: "safe-release", title: "A normal autonomous release", tag: "ALLOWED",
      copy: "A scoped delivery agent deploys a signed build to staging.",
      agent: "delivery", action: "deploy", environment: "staging", destination: "internal",
      amount: 0, selfReview: false, approved: false, untrustedInput: false
    },
    {
      id: "injection", title: "Prompt injection → data egress", tag: "BLOCKED",
      copy: "Untrusted content attempts to steer an analyst agent into exporting sensitive data.",
      agent: "analyst", action: "export", environment: "production", destination: "external",
      amount: 0, selfReview: false, approved: false, untrustedInput: true
    },
    {
      id: "prod-release", title: "Production release approval", tag: "APPROVAL",
      copy: "An authorized agent requests a production deployment: approval is mandatory.",
      agent: "delivery", action: "deploy", environment: "production", destination: "internal",
      amount: 0, selfReview: false, approved: false, untrustedInput: false
    },
    {
      id: "incident", title: "Security incident containment", tag: "APPROVAL",
      copy: "A security agent proposes production identity containment with human review.",
      agent: "security", action: "contain", environment: "production", destination: "internal",
      amount: 0, selfReview: false, approved: false, untrustedInput: false
    },
    {
      id: "self-merge", title: "Separation of duties violation", tag: "BLOCKED",
      copy: "The same delivery agent attempts to author and approve its own merge.",
      agent: "delivery", action: "merge", environment: "production", destination: "internal",
      amount: 0, selfReview: true, approved: true, untrustedInput: false
    },
    {
      id: "finance", title: "Finance threshold enforcement", tag: "APPROVAL",
      copy: "A finance agent proposes an order above its autonomous spending threshold.",
      agent: "finance", action: "purchase", environment: "staging", destination: "internal",
      amount: 7800, selfReview: false, approved: false, untrustedInput: false
    }
  ]);
  const OPERATIONS = ["deploy", "merge", "export", "contain", "purchase"];
  function evaluation(raw) {
    const req = {
      agent: String(raw && raw.agent || "unknown"),
      action: String(raw && raw.action || "read"),
      environment: raw && raw.environment === "production" ? "production" : "staging",
      destination: raw && raw.destination === "external" ? "external" : "internal",
      amount: Number(raw && raw.amount) || 0,
      selfReview: Boolean(raw && raw.selfReview),
      approved: Boolean(raw && raw.approved),
      untrustedInput: Boolean(raw && raw.untrustedInput)
    };
    const agent = AGENTS[req.agent] || AGENTS.unknown;
    const checks = [];
    function check(id, title, status, detail) { checks.push({ id, title, status, detail }); }
    check("ID-01", "Non-human identity",
      agent.trusted ? "pass" : "deny",
      agent.trusted ? agent.name + " has a registered sandbox identity." : "Unregistered actor; no authorization granted.");
    check("AUTH-02", "Least-privilege tool grant",
      agent.trusted && agent.grants.includes(req.action) ? "pass" : "deny",
      agent.trusted && agent.grants.includes(req.action) ? "Action is within the agent's simulated grant." : "Action is outside the actor's permitted tool scope.");
    const externalExport = req.action === "export" && req.destination === "external";
    check("DLP-03", "Sensitive data egress",
      externalExport ? "deny" : "pass",
      externalExport ? "External customer-data export is forbidden by this policy." : "No restricted external export requested.");
    const selfMerge = req.action === "merge" && req.selfReview;
    check("SOD-04", "Separation of duties",
      selfMerge ? "deny" : "pass",
      selfMerge ? "The same actor cannot author and approve a change." : "No self-approval conflict.");
    const overBudget = req.action === "purchase" && req.amount > 25000;
    const needsFinanceApproval = req.action === "purchase" && req.amount > 5000 && !overBudget;
    const financeStatus = overBudget ? "deny" : needsFinanceApproval && !req.approved ? "review" : "pass";
    check("FIN-05", "Spending authority", financeStatus,
      overBudget ? "Amount exceeds the hard sandbox cap of $25,000." :
      needsFinanceApproval ? req.approved ? "Human approval represented in this sandbox." : "Orders above $5,000 require human approval." :
      "Spending threshold satisfied or not applicable.");
    const productionMutation = req.environment === "production" && OPERATIONS.includes(req.action) && req.action !== "export";
    const prodStatus = productionMutation && !req.approved ? "review" : "pass";
    check("PROD-06", "Production change control", prodStatus,
      productionMutation ? req.approved ? "Human approval represented in this sandbox." : "Production mutation requires human approval." :
      "No production mutation gate required.");
    const blocked = checks.filter(c => c.status === "deny");
    const reviews = checks.filter(c => c.status === "review");
    const decision = blocked.length ? "DENY" : reviews.length ? "REVIEW" : "ALLOW";
    const cause = blocked.length ? blocked[0] : reviews.length ? reviews[0] : null;
    const message = decision === "DENY" ?
      "Request blocked before tool execution. No external system was contacted." :
      decision === "REVIEW" ?
      "Request paused for simulated human authorization. No external system was contacted." :
      "Policy would allow this action. This lab never performs the real action.";
    return { request: req, agent: agent.name, actionName: ACTIONS[req.action] || req.action,
      decision, reason: cause ? cause.title + " — " + cause.detail : "All applicable sandbox policy checks passed.",
      message, checks, untrustedInputNotice: req.untrustedInput ?
      "Untrusted text is a narrative cue only. This lab does not run a model or claim to detect prompt injection; the external export is denied at the tool-policy boundary." : "" };
  }
  root.DaedoryxLabPolicy = Object.freeze({ AGENTS, ACTIONS, SCENARIOS, evaluation });
})(typeof globalThis !== "undefined" ? globalThis : this);
