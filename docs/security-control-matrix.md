# DAEDORYX — Security Across Two Operating Domains

> **Positioning hypothesis, not a product implementation attestation.** Verify each claimed enforcement point against code and observed behavior before publishing commercial promises.

## Market proposition

**Secure the enterprise. Secure the AI workforce operating it.**

DAEDORYX is intended to bridge two independently meaningful security needs:

1. **Enterprise security:** Coordinate the investigation, governance and authorized remediation of risk in identity, cloud, applications, infrastructure, data and IT/security operations.
2. **Agent security:** Constrain the non-human identities, delegated authority, context, tools, credentials, communications and outputs of autonomous AI agents that interact with those same enterprise systems.

These are complementary but not interchangeable. A secure LLM output does not imply safe tool execution. Likewise, existing enterprise SIEM/EDR tools do not automatically authorize an agent's privileged operations.

## Security domain 1 — Enterprise

| Customer concern | Proposed operating capability | Evidence needed before claiming it exists |
| --- | --- | --- |
| Identity privilege misuse | Contextual investigation, policy checks, human approval and audit trails for sensitive access changes | Demonstrated IAM connector, delegated authorization, deny/approve integration tests and audit records |
| Cloud / Kubernetes misconfiguration | Baseline comparison, drift context, risk assessment and approval-gated remediation | Real ingestion, scoped cloud identity, policy enforcement, workload change trace, rollback tests |
| Alert fragmentation / incident response | Link events from existing security tools to approved runbooks and tracked actions | Live data ingestion, case management, runbook policies, incident exercise with observed response |
| Sensitive data handling | Context-aware access policies and approved export / sharing | Verified classification integration, egress enforcement, negative data-leak tests |
| Security architecture governance | Policy-as-code controls, traceability, roles and exception workflow | Executable policy tests, identity integration, oversight review |

**Important:** Coordinating SecOps is not equivalent to shipping a SIEM, EDR, threat detection product, vulnerability scanner or automated SOC. Do not market these as DAEDORYX capabilities without code-backed evidence.

## Security domain 2 — Autonomous agents

| Threat / risk | Required control intent | Verification |
| --- | --- | --- |
| Agent impersonation / credential sharing | Unique non-human identity per agent, no shared superuser accounts, short-lived workload identity, rotation | Prove a privileged agent cannot reuse another agent's identity or credentials |
| Excessive delegated authority | Least privilege with capability-scoped authorization and just-in-time access for sensitive actions | Attempt an unauthorized tool call and observe rejection at the enforcement boundary |
| MCP / A2A tool misuse | Verify client / server identities, tool provenance, schema, destination, action type and scope | Negative tool-call, identity-spoofing and third-party-server tests |
| Prompt injection / instruction laundering | Separate untrusted retrieved content from privileged instructions; authorization remains independent of prompts | Adversarial tests using hostile documents and tool responses |
| Unauthorized data exfiltration | Data classification, contextual access, output/egress boundaries and allowlisted destinations | Try to transmit restricted data to unapproved services; verify block and audit event |
| Hidden / unreviewable execution | Traces, approval rationale, tamper-resistant audit storage and ability to revoke agent authority | Demonstrate effective access revocation, cancellation, incident reconstruction |

**An LLM prompt is not an authorization boundary.** Control decisions must be enforced by independently trusted infrastructure or a policy gate between an agent and privileged tools.

## Cross-domain operating flow

```text
User or enterprise event
   -> Identity + organizational context
   -> Agent orchestration
   -> Policy decision
   -> Approval (if required)
   -> Tool / MCP / A2A execution boundary
   -> Enterprise systems and data
   -> Telemetry, evidence and incident workflow
```

For the landing page we illustrate **six hypothetical attack scenarios** — three enterprise scenarios and three agent scenarios. The figures **02 security domains**, **06 illustrative threats**, and **05 governance boundaries** are editorial counts, not penetration-test, compliance, attack-prevention or product-performance measurements.

## Executive framing

- **CEO:** organizational risk, accountable automation and business continuity.
- **CFO:** cost of risk and governance; never invent savings or risk-reduction percentages.
- **CIO:** integrated operating model across enterprise tools and AI agents.
- **CTO:** secure interfaces, tooling, cloud/hybrid/private integration and execution reliability.
- **CISO:** human/non-human IAM, policy as code, approval boundaries, audit, containment and investigation.

## Website demonstration limits

The interactive threats on the website are **static authored examples**. They do not query environments, detect active risks, change cloud resources, operate autonomous agents or enforce policies. Do not present them as live telemetry or an active detection console.

The live Executive Impact Studio uses hypothetical productivity assumptions only and **does not** measure security improvement or calculate probable incident loss.

## Priorities for technical validation

1. Inventory implemented agent identity, policy and tool authorization boundaries.
2. Validate enterprise connectors against cloud, IAM and security operation platforms.
3. Test agent permissions with intentionally unauthorized tool calls.
4. Verify data handling and egress restrictions end to end.
5. Trace approvals and action execution with immutable or tamper-evident evidence.
6. Conduct adversarial evaluations and independent security review.
7. Only then upgrade marketing copy from **concept** to **supported feature**.

## Helpful reference frameworks

- NIST AI Risk Management Framework for managing AI lifecycle risks.
- NIST Zero Trust Architecture for access boundaries.
- OWASP guidance for LLM and agentic application security risks.

Referencing a framework **does not** imply certification, conformance, tested effectiveness or audit approval.
