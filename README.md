# The Plan Box

A static site + real-time database, free, with its own URL. Both of you can add plans from your phone or computer, and the "Surprise us" button picks one at random from whatever's active under your current filters.

## What's in this folder

- `index.html` — the page
- `styles.css` — styling
- `app.js` — logic (reads and writes to Firestore in real time)
- `firebase-config.js` — **paste your own keys here** (step 2)
- `firestore.rules` — database security rules (step 3)

## Step 1 — Create the Firebase project (free)

1. Go to https://console.firebase.google.com and create a new project (skip analytics, you don't need it).
2. Inside the project: **Build → Firestore Database → Create database**. Choose production mode and the region closest to you (e.g. europe-west).
3. **Build → Hosting** — you can skip this for now if you're using GitHub Pages (step 4, option A). If you'd rather stay inside the Firebase ecosystem entirely, enable it here.
4. Click the gear icon (top left) → **Project settings → General**, scroll to "Your apps", click the `</>` icon (web app), give it a name, and copy the `firebaseConfig` object it generates.

## Step 2 — Paste your config

Open `firebase-config.js` and replace the placeholder values (`TU_API_KEY`, etc.) with the ones you copied above.

## Step 3 — Upload the security rules

In Firestore Database → **Rules** tab, paste the contents of `firestore.rules` and publish. This lets anyone with the link read and add plans, but no one can edit or delete existing ones without going through the console — so an accidentally shared link can't wipe out your box.

## Step 4 — Publish the site (pick one)

### Option A: GitHub Pages (recommended if you already use GitHub)
1. Create a new repo on GitHub and upload these 5 files to the root.
2. Settings → Pages → Source: `main` branch, `/root` folder. Save.
3. Within a couple minutes your URL will be live at `https://your-username.github.io/repo-name/`.

### Option B: Firebase Hosting (everything in one place)
```
npm install -g firebase-tools
firebase login
firebase init hosting   # choose "use current folder as public"
firebase deploy
```
This gives you a URL like `https://your-project.web.app`.

## Notes

- "Who's adding this?" is free text — no accounts, no passwords, so don't put anything sensitive in there.
- Plans can't be deleted from the site itself on purpose (so neither of you loses one by accident). If you ever want to remove one, do it from the Firebase console → Firestore Database → `dateIdeas` collection.
- All of this stays well within Firebase's free tier for a two-person plan box (the free limit is tens of thousands of reads a day).
