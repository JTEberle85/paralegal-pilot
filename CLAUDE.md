# Legal Services Portal - Paralegal Agent Pilot

See `~/.claude/josh-profile.md` for Josh's communication preferences.

## Project Overview

White-label paralegal automation tool for humanitarian legal services organizations. Designed for immigration/refugee legal departments transitioning to fee-based models.

**Password:** Or@ngeTr@il2025 (StatiCrypt protected)

## Target Users

- Paralegals (primary) - Low to medium tech comfort
- Attorneys (reviewers) - Need quick summaries and approval workflows
- Administrative staff - Simple status tracking

## Architecture

```
paralegal-pilot/
├── agents/           # Agent prompt files and logic
│   ├── intake/       # Client Intake Agent
│   ├── checklist/    # Document Checklist Agent
│   ├── forms/        # Form Assembly Agent
│   ├── deadlines/    # Deadline Tracker Agent
│   ├── summary/      # Case Summary Agent
│   └── rfe/          # RFE Response Agent
├── ui/               # Static HTML/CSS/JS interface
│   ├── index.html    # Login page (StatiCrypt encrypted)
│   └── *.html        # Feature pages with auth check
└── docs/             # Documentation and specs
```

## Brand Kit (Neutral/Demo)

| Color | Hex | Usage |
|-------|-----|-------|
| Primary Blue | #1E4D78 | Headers, primary buttons |
| Secondary Blue | #D5E8F0 | Backgrounds |
| Accent Orange | #E87722 | CTAs, alerts |
| Text Dark | #333333 | Body text |
| Background | #FFFFFF | Main background |

## Compliance Guardrails (CRITICAL)

**Agents must NEVER:**
- Provide legal advice or case strategy
- Make eligibility determinations
- Recommend relief options

**Agents MUST:**
- Flag all outputs as "DRAFT - PENDING ATTORNEY REVIEW"
- Escalate to human for criminal history, credibility issues, complex cases
- Maintain strict confidentiality (especially VAWA/T/U cases)

## Deployment

Static HTML hosted on GitHub Pages with StatiCrypt password protection.

## Reference

Full specs in `/Users/josh.eberle/claude-workspace/lssnca-paralegal-agent-project.md`
