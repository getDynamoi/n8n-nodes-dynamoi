# n8n-nodes-dynamoi

Public n8n community node. Preserve published node/credential compatibility,
package identity and npm Trusted Publishing provenance. Never commit real
credentials; credentials/ contains node credential definitions, not user secrets.

Estate agents use isolated task worktrees, shared estate policy and
`.agents/skills/deliver/SKILL.md`. `npm run deliver` publishes reviewed Git commits
to origin/main. Use Node24, `npm ci`, `npm run lint`, and `npm run build`.

Git delivery is not an npm release. Never invoke `npm run release`, `npm publish`,
bump a package version or push a version tag without explicit release authority.
The existing tag-triggered OIDC workflow remains the sole package release owner.
Do not name a Git-delivery npm script `publish`: npm runs that lifecycle on a
real package publication. Preserve external contributor PR/CI support.
