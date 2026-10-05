# Level Up Arcade – QR redirect

This repo only hosts a small redirect page for the Betterment 2026 PDE Summit game.
The game and leaderboard live on Claude: https://claude.ai/artifact/WgTjMKSN9PTmf5TGuiG6Gj

The QR code points to https://francesyang-dsgn.github.io/level-up/ so phones open the game in the browser instead of the Claude app.

- iPhone: forwards automatically; the button uses `x-safari-https://` as a backup.
- Android: forwards with an intent link aimed at Chrome, falling back to the plain link.

Turn on GitHub Pages: Settings → Pages → Deploy from a branch → main, / (root) → Save.

`apps-script/Code.gs` is left over from an earlier Google Sheet version and isn't used.
