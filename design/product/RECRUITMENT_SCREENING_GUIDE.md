# Recruitment screening UI guide

The talent apply form requires the exact PDF, DOC, or DOCX CV for the vacancy. The browser uploads it through Oreno's private presigned-file flow and waits for the server-side security scan before creating the application. Confirmation copy states that Oreno screens the application before the company sees it.

Talent application detail separates Oreno screening from the employer lifecycle. It shows applicant-safe status history, additional-information requests, internal Oreno interview schedule/link, candidate-visible feedback, final outcome, and the forwarding timestamp. Staff-private notes and rubrics never render in the talent or company workspace.

Platform administrators use **Talent & hiring → Recruitment screening**. A reviewer can inspect the exact submitted CV through an audited short-lived link, record a human CV decision, request information, schedule and decide an Oreno interview, and record the final decision. **Forward candidate to company** is a separate control shown to roles with `screening:release`; the backend rechecks every prerequisite.

Company application screens consume released-only backend endpoints. A released record shows `Oreno screening completed`, release time, and the authored employer-safe summary. Internal screening notes, interview details, and unreleased applicants have no company route or fallback data.
