# Authority Gate Test Scenarios

## Scenario 1: Legitimate request
Identity, authority, permission and scope all pass. Risk is LOW or REVIEW. Result: READY_FOR_HUMAN_REVIEW. Only an explicit human APPROVE may proceed to PayPal Sandbox.

## Scenario 2: Suspicious supplier change
A supplier payment destination changes but independent authority or permission has not been verified. Result: BLOCKED. Human APPROVE cannot override the gate.

## Scenario 3: Technically valid but unauthorised
The requester is a real authenticated person but does not have delegated authority for the requested action. Result: BLOCKED.

## Scenario 4: High risk
All basic checks are selected but risk is HIGH. Result: BLOCKED and escalation required.

## Scenario 5: Human rejection
Regardless of gate state, REJECT produces an audit record and does not invoke PayPal.

These scenarios are demonstrations of governance logic, not claims that checkbox input proves identity or authority in production.
