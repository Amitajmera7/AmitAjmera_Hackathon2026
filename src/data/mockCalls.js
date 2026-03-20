/**
 * Demo call catalog (metadata + transcripts only). Insights come from analyzeTranscript().
 * @typedef {"sales" | "support" | "onboarding"} CallType
 * @typedef {{
 *   id: string,
 *   title: string,
 *   duration: string,
 *   type: CallType,
 *   transcript: string
 * }} MockCall
 */

/** @type {MockCall[]} */
export const mockCalls = [
  {
    id: "sales-acme-discovery",
    title: "Sales discovery — Acme Corp",
    duration: "12:04",
    type: "sales",
    transcript: `[00:00] Agent: Hi Jordan — thanks for making time. I know you're juggling the vendor review, so I’ll keep us focused. To start, what prompted you to look at a new platform right now?

[00:18] Caller: We’re consolidating vendors across sales ops and customer success. Leadership wants cleaner reporting before Q3 board prep, and our current stack isn’t giving finance the roll-ups they need.

[00:42] Agent: That makes sense. When you say “roll-ups,” is it more about revenue attribution, pipeline hygiene, or forecasting accuracy?

[01:05] Caller: Mostly forecasting and cohort retention. We can see activity, but connecting it to outcome metrics is still manual every month.

[01:28] Agent: Got it. Who else is actively involved in the evaluation — IT security, RevOps, finance?

[01:44] Caller: IT signed off on the short list last week. Finance wants a six-week pilot with two regions before we commit. Procurement will join once we have pricing scenarios.

[02:12] Agent: Perfect — that timeline helps. I’ll share a sample executive dashboard and a one-pager that maps your reporting gaps to what we’ve seen work for similar rollouts.

[02:36] Caller: Send those over. If the pilot scope looks reasonable, we can aim for a technical checkpoint with our Salesforce admin next Thursday.`,
  },
  {
    id: "support-billing-refund",
    title: "Support — billing & refund",
    duration: "6:47",
    type: "support",
    transcript: `[00:00] Agent: Thanks for calling Northwind Support — this is Alex. I see an account under Brightline Logistics. How can I help today?

[00:12] Caller: Hi — I’m calling about our March invoice. We canceled our subscription mid-cycle, but we were billed for the full quarter.

[00:31] Agent: I’m sorry for the confusion — I can investigate that quickly. I’m showing the cancellation request on March 4th, with the invoice generated March 2nd.

[00:55] Caller: Right, so we expected a partial credit. Our finance team flagged the charge yesterday.

[01:10] Agent: Thank you for the detail. Our policy is prorated credits for mid-cycle cancellations when the request is confirmed in the admin console — which yours was.

[01:34] Caller: Okay — so what happens next?

[01:40] Agent: I’m issuing a prorated credit to the card on file today. You’ll see a confirmation email within an hour and the funds typically settle in three to five business days.

[02:08] Caller: Can you note on the account that this was a billing-cycle edge case? We’re still evaluating renewal later this year.

[02:22] Agent: Absolutely — I’ll add an internal note and send a recap email with the credit reference ID so your team has a paper trail.`,
  },
  {
    id: "onboarding-enterprise-rollout",
    title: "Onboarding — enterprise rollout",
    duration: "18:22",
    type: "onboarding",
    transcript: `[00:00] CSM: Morning — goal for today is a realistic rollout plan: owners, dates, and risks. I'll mirror everything in the shared success plan afterward.

[00:18] Customer: Sounds good. Executive sponsor wants HR live in sixty days, but our HRIS integration is the scariest piece.

[00:41] CSM: Understood. Let’s name the workstreams: HRIS data sync, SSO/SAML, audit logging, and training. Anything missing?

[01:05] Customer: Legal wants DPA language updated for subprocessors — that might slip the timeline if we don’t get a response by week three.

[01:28] CSM: Okay — I’ll add legal as a dependency with a target decision date. On HRIS, do you have a sandbox we can test against this month?

[01:54] Customer: Yes — sandbox credentials are ready. We need your team’s field mapping worksheet to validate employee attributes.

[02:18] CSM: I’ll send the worksheet within twenty-four hours and schedule a working session with our integration engineer. We should also book a security review checklist review with your InfoSec contact.

[02:42] Customer: Works for us. If we keep weekly checkpoints, sixty days feels plausible — but legal has to stay green.

[03:01] CSM: Agreed — I’ll capture those checkpoints in the plan and circulate owners by end of day.`,
  },
];

export const DEFAULT_CALL_ID = mockCalls[0].id;

export function getCallById(callId) {
  return mockCalls.find((call) => call.id === callId) ?? mockCalls[0];
}
