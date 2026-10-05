# Level Up Arcade

Retro maze game for the Betterment 2026 PDE Summit, with a shared office leaderboard stored in a Google Sheet.

Play: https://francesyang-dsgn.github.io/level-up/
Big-screen leaderboard: https://francesyang-dsgn.github.io/level-up/#leaderboard

## Files

- `index.html` – the whole game (landing page, game, game over, leaderboard)
- `apps-script/Code.gs` – the leaderboard backend that runs in Google Apps Script

## Set up the leaderboard sheet

1. Create a new Google Sheet. Name it something like "Level Up Leaderboard". Keep it private; nobody else needs access.
2. In the Sheet, open **Extensions → Apps Script**.
3. Delete the sample code, paste in everything from `apps-script/Code.gs`, and click **Save**.
4. Click **Deploy → New deployment**. Click the gear next to "Select type" and choose **Web app**.
   - Execute as: **Me**
   - Who has access: **Anyone**
5. Click **Deploy**, then **Authorize access**, pick your Google account, and allow the permissions. If you see "Google hasn't verified this app", click **Advanced → Go to (project name)**. It's your own script.
6. Copy the **Web app URL** (it ends in `/exec`).
7. In this repo, open `index.html`, click the pencil to edit, find `const SCRIPT_URL="";` and paste the URL between the quotes. Commit the change.

The `Scores` tab and its header row are created automatically on the first score.

## Turn on GitHub Pages

Settings → Pages → Build and deployment → Source: **Deploy from a branch** → Branch: **main**, folder **/ (root)** → Save. The site is live within a minute or two.

## Managing scores

- Delete a row in the `Scores` tab to remove someone from the leaderboard.
- Each name keeps only its best score.
- The script rejects scores that are impossible for the level reached, games that were too short for the level, and repeat posts from the same name within 8 seconds.
- If you edit `Code.gs` later, use **Deploy → Manage deployments → Edit → Version: New version** so the URL stays the same.
