---
name: deliver
description: Deliver reviewed n8n node source to Git main without releasing a package.
---
# Deliver

Read `~/.agents/skills/deliver/SKILL.md`. Run `npm ci` with Node24 before delivery;
from the clean committed task branch use `npm run deliver`. The shared owner
serializes integration, lint/build, independent primary/Opus reviews and normal
main publication. Existing CI remains. No agent-managed PR is required.

Commit goal, rationale and source context without sensitive data. Preserve public
node compatibility and run focused behavior tests for changed operations. Report
source SHA, net lines and checks. There is no service deployment for a Git-only
change; do not claim npm contains the new code. Package releases/version tags are
separate and require explicit authority. Do not alter Trusted Publishing settings.
Keep active worktrees; reconcile the narrow Brain owner and clean only finished
owned resources.
