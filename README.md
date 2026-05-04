# 🏎️ AutoNest

> AI-powered automobile enthusiast hub. Agent-driven news, live debates, trending topics, and community discussions.

---

## 📁 Project Structure

```
AutoNest/
├── api/
│   └── chat.js              ← Vercel serverless function (Groq API proxy)
├── public/
│   └── index.html
├── src/
│   ├── agents/
│   │   ├── ollamaAgent.js   ← Core AI caller (Ollama local / Groq production)
│   │   ├── autoAgent.js     ← News, trending, discussions
│   │   ├── showAgents.js    ← Host personalities
│   │   └── googleAgent.js   ← YouTube feed
│   ├── components/
│   │   ├── layout/          ← Sidebar, Header
│   │   ├── shared/          ← TickerBar
│   │   ├── news/            ← Dispatch page
│   │   ├── show/            ← The Garage (host debates)
│   │   ├── trending/        ← Heat Map
│   │   ├── discussions/     ← The Paddock
│   │   └── videos/          ← Garage TV
│   ├── hooks/
│   │   └── useAutoRefresh.js
│   ├── pages/
│   │   └── HomePage.jsx
│   └── styles/
│       └── globals.css
├── .env.example
├── .gitignore
├── vercel.json
└── package.json
```

---

## 🚀 PART 1 — Push to GitHub (GitHub Desktop)

### Step 1 — Create a GitHub Repository

1. Go to [github.com](https://github.com) and sign in
2. Click the **+** button (top right) → **New repository**
3. Fill in:
   - **Repository name:** `autonest`
   - **Description:** `AI-powered automobile enthusiast hub`
   - **Visibility:** Public (required for free Vercel)
   - ❌ Do NOT check "Add a README" — you already have one
   - ❌ Do NOT add .gitignore — you already have one
4. Click **Create repository**
5. Copy the repository URL — looks like: `https://github.com/yourusername/autonest.git`

---

### Step 2 — Open GitHub Desktop

1. Open **GitHub Desktop**
2. Click **File** → **Add Local Repository**
3. Click **Choose...** and navigate to your `AutoNest` folder
4. Click **Add Repository**

> If it says "This directory does not appear to be a Git repository" — click **create a repository** instead, point it to the AutoNest folder

---

### Step 3 — Check What's Being Committed

In GitHub Desktop you'll see a list of changed files on the left. Make sure:

- ✅ `src/` files are listed
- ✅ `api/chat.js` is listed
- ✅ `vercel.json` is listed
- ✅ `package.json` is listed
- ❌ `node_modules/` is NOT listed (it's in .gitignore)
- ❌ `.env` is NOT listed (it's in .gitignore)

If `node_modules` appears — stop. Your `.gitignore` isn't being picked up. See troubleshooting below.

---

### Step 4 — Make Your First Commit

1. At the bottom left of GitHub Desktop:
   - **Summary:** `Initial commit — AutoNest v0.2`
   - **Description:** `AI automobile hub with Ollama local + Groq production support`
2. Click **Commit to main**

---

### Step 5 — Push to GitHub

1. Click **Publish repository** (top bar)
2. Make sure **Keep this code private** is unchecked (public = free Vercel)
3. Click **Publish Repository**

Your code is now on GitHub. Visit `https://github.com/yourusername/autonest` to confirm.

---

## 🌐 PART 2 — Deploy on Vercel

### Step 1 — Get Your Groq API Key

1. Go to [console.groq.com](https://console.groq.com)
2. Sign up (free, no credit card)
3. Go to **API Keys** → **Create API Key**
4. Copy the key — save it somewhere safe, you'll need it in Step 3

---

### Step 2 — Connect Vercel to GitHub

1. Go to [vercel.com](https://vercel.com) and sign in with GitHub
2. Click **Add New** → **Project**
3. Find your `autonest` repo and click **Import**
4. Vercel auto-detects Create React App — settings should be:
   - **Framework:** Create React App
   - **Build Command:** `npm run build`
   - **Output Directory:** `build`
   - Leave everything else default

---

### Step 3 — Add Environment Variables

Before clicking Deploy, scroll down to **Environment Variables** and add:

| Name | Value |
|------|-------|
| `GROQ_API_KEY` | your key from console.groq.com |
| `REACT_APP_GOOGLE_API_KEY` | your Google API key (for YouTube) |

> ⚠️ These are added in the Vercel dashboard — never put them in your code or `.env` file that gets committed

---

### Step 4 — Deploy

Click **Deploy**. Vercel will:
1. Pull your code from GitHub
2. Run `npm run build`
3. Deploy the React app + the `api/chat.js` serverless function
4. Give you a URL like `https://autonest.vercel.app`

First deploy takes ~2 minutes.

---

### Step 5 — Verify It Works

1. Open your Vercel URL
2. Go to **Dispatch** and hit **Refresh**
3. You should see AI-generated news loading (now via Groq, not Ollama)
4. Go to **The Garage** and start a debate — agents should respond

If something breaks, check **Vercel dashboard → Functions tab** for error logs.

---

## 🔄 PART 3 — Future Updates

Every time you make changes:

1. Save your files in VS Code
2. Open **GitHub Desktop**
3. You'll see changed files listed
4. Write a commit summary (e.g. "Add car diagnostics feature")
5. Click **Commit to main**
6. Click **Push origin**
7. Vercel **automatically redeploys** within 30 seconds

---

## 🛠️ Local Development

```powershell
# Make sure Ollama is running
ollama serve

# In a new terminal
cd AutoNest
npm start
```

Locally the app uses Ollama. On Vercel it uses Groq. No config changes needed.

---

## 🔒 Security

- `GROQ_API_KEY` lives only in Vercel's environment — never in the browser
- The `api/chat.js` function acts as a proxy — the key is never exposed
- `.env` is in `.gitignore` — it will never be pushed to GitHub
- Never paste API keys in chat, code comments, or commit messages

---

## ⚠️ Troubleshooting

**node_modules showing in GitHub Desktop:**
```powershell
# In your AutoNest folder, open PowerShell
git rm -r --cached node_modules
git rm -r --cached build
```
Then commit again.

**Vercel build fails:**
- Check the build log in Vercel dashboard
- Most common cause: missing environment variable
- Make sure `GROQ_API_KEY` is set in Vercel → Settings → Environment Variables

**AI not responding on Vercel:**
- Go to Vercel dashboard → your project → **Functions** tab
- Click on `api/chat` — check the logs for the actual error
- Most likely: `GROQ_API_KEY` not set or wrong value

**YouTube not working:**
- Enable YouTube Data API v3 in Google Cloud Console
- Make sure `REACT_APP_GOOGLE_API_KEY` is set in Vercel env vars
