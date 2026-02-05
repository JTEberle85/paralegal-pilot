# Paralegal Pilot - Legal Services Portal

See `~/.claude/josh-profile.md` for Josh's communication preferences.

## Project Overview
- **Live URL**: https://jteberle85.github.io/paralegal-pilot/
- **GitHub**: JTEberle85/paralegal-pilot
- **Owner**: Josh Eberle (josh.eberle@slalom.com)
- **Password**: Same as calibration-tools (Or@ngeTr@il2025)

## Tech Stack
- Vanilla HTML/CSS/JS (no frameworks)
- GitHub Pages hosting
- StatiCrypt for password protection
- Claude API for AI chat (client-side, users provide own keys)

## Key Files
- docs/js/config.js - API configuration
- docs/js/chat-assistant.js - Reusable chat component
- docs/dashboard.html - Landing page with practice selector

## Design System
- Clean white/blue minimal aesthetic
- TurboTax-style two-panel layout (sidebar + main content)
- System fonts (-apple-system, SF Pro)
- Single accent color: #2563EB

## Multi-Practice Workflows
- Immigration: Intake → Documents → Forms → Summary → File
- Contracts: Upload → Compare → Review → Export
- Estate Planning: Placeholder
- General: Placeholder

## AI Chat Integration
- Appears on: intake.html, redline.html, checklist.html
- API keys stored in browser localStorage (not in code)
- Each page has context-specific system prompts
- All prompts include "never give legal advice" guardrail

## Compliance Guardrails (CRITICAL)

**Agents must NEVER:**
- Provide legal advice or case strategy
- Make eligibility determinations
- Recommend relief options

**Agents MUST:**
- Flag all outputs as "DRAFT - PENDING ATTORNEY REVIEW"
- Escalate to human for criminal history, credibility issues, complex cases
- Maintain strict confidentiality (especially VAWA/T/U cases)

## Demo Targets
- LSSNCA: Immigration legal services workflow
- TNC: Contract redlining tool

## Future Ideas
- Eligibility screener
- Document OCR + auto-extract
- RFE response drafter
- Multi-language intake
