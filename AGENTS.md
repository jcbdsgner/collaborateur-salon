<!-- BEGIN:nextjs-agent-rules -->
# This is NOT the Next.js you know

This version has breaking changes — APIs, conventions, and file structure may all differ from your training data. Read the relevant guide in `node_modules/next/dist/docs/` before writing any code. Heed deprecation notices.
<!-- END:nextjs-agent-rules -->

# Workspace conventions

- Same brand as [b&co](../b&co) and [point-de-vente](../point-de-vente) (Beauty and Co) — reuse their brand tokens, fonts and logo rather than inventing new ones. See `CONTEXT.md` for this project's own vocabulary as it's defined.
- **Mobile-first** : web app consultée sur téléphone. Concevoir à 375px de large, cibles tactiles ≥ 48px, respecter les safe areas iOS (`pt-safe` / `pb-safe`).
- Composants UI : `components/ui/atoms` (briques simples) et `components/ui/molecules` (compositions), comme point-de-vente. Composants d'écran dans `components/<écran>/`.
- Références visuelles Pinterest : le MCP `pinterest` télécharge dans `pinterest-captures/` (non versionné).
