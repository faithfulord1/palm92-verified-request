# Threat Model

Protected action: a consequential request reaching execution.

Threats include impersonation, compromised trusted channels, real users acting outside delegated authority, out-of-scope requests, substituted payment destinations, unsafe reliance on AI interpretation, replayed requests and altered evidence.

Controls in this prototype: deterministic gate checks, mandatory human decision, high-risk blocking, rejection without payment execution, server-side Sandbox credentials and evidence fingerprinting.

Production requirements: strong authentication, governed delegation records, independent destination verification, replay protection, durable tamper-evident audit storage, separation of duties, secret management, monitoring, retention controls and measured false-positive/false-negative performance.

Trust boundary: AI may investigate and recommend. It is not the source of business authority.
