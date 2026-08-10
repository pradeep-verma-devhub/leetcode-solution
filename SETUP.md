# 🚀 Setup Guide - LeetCode Auto-Sync

## What Was Fixed?

Your previous implementation had **403 Forbidden errors** because:
- ❌ CSRF tokens expire quickly
- ❌ Missing proper browser headers
- ❌ No error recovery mechanism
- ❌ Mobile submissions not detected

**New solution (v2):**
- ✅ Uses robust API endpoints with proper headers
- ✅ Fallback to GraphQL if REST API fails
- ✅ Auto-detects mobile app submissions
- ✅ Individual commits per problem
- ✅ Stores metadata (language, runtime, memory)

---

## Step-by-Step Setup

### ✅ Step 1: Add Your LeetCode Username to GitHub Secrets

1. Go to: **https://github.com/pradeep-verma-devhub/leetcode-solution/settings/secrets/actions**
2. Click **"New repository secret"**
3. Add:
   - **Name:** `LEETCODE_USERNAME`
   - **Value:** Your actual LeetCode username (e.g., `pradeep_verma`)
4. Click **"Add secret"**

### ✅ Step 2: Enable the GitHub Actions Workflow

1. Go to: **https://github.com/pradeep-verma-devhub/leetcode-solution/actions**
2. Select workflow: **🤖 Auto-Sync LeetCode Submissions**
3. Click **"Enable workflow"** button (if disabled)
4. That's it! ✅

### ✅ Step 3: Test It (Optional)

**Option A: Wait for auto-run**
- Workflow runs automatically every 6 hours
- Or manually trigger next step

**Option B: Manual trigger**
1. Go to Actions tab
2. Select **🤖 Auto-Sync LeetCode Submissions**
3. Click **"Run workflow"** → **"Run workflow"**
4. Wait 1-2 minutes for results

**Option C: Test locally on PC**
```bash
cd /path/to/leetcode-solution
npm install
export LEETCODE_USERNAME="your_username"
npm run sync
```

---

## 📋 What Happens After Setup?

### First Run (Auto or Manual)
1. Script fetches your last 100 LeetCode submissions
2. Filters only **Accepted** solutions
3. For each new solution:
   - Downloads your code
   - Creates problem folder (e.g., `0001-two-sum/`)
   - Saves `solution.py`, `solution.java`, etc.
   - Saves `metadata.json` with problem details
   - **Commits to GitHub** automatically ✅

### Example Commit Messages
```
chore: add LeetCode 0001 - Two Sum (python3)
chore: add LeetCode 0002 - Add Two Numbers (java)
chore: add LeetCode 0003 - Longest Substring (cpp)
```

### Subsequent Runs
- Only syncs **new** accepted solutions
- Skips already synced problems (tracked in `tracked-problems.json`)
- No duplicates! ✅

---

## 🔍 How to Verify It's Working

### Check 1: GitHub Actions Logs
1. Go to **Actions** tab
2. Click latest workflow run
3. Look for green ✅ checkmark
4. Check logs for messages like:
   ```
   Found 5 accepted submission(s)
   Synced: 0001-two-sum/solution.py
   ✅ Sync complete! Committed 5 new solutions.
   ```

### Check 2: Repository Commits
1. Go to **Code** tab
2. Look for recent commits from "LeetCode-Bot"
3. See your solutions organized by problem number

### Check 3: Folder Structure
```
leetcode-solution/
├── 0001-two-sum/
│   ├── solution.py
│   └── metadata.json ← Shows runtime, memory, language
├── 0002-add-two-numbers/
│   ├── solution.java
│   └── metadata.json
└── tracked-problems.json ← Tracks what's synced
```

---

## ⚙️ Customization (Advanced)

### Change Sync Schedule

Edit `.github/workflows/sync-leetcode.yml`:

```yaml
schedule:
  # Current: Every 6 hours
  - cron: "0 */6 * * *"
  
  # Other options:
  # - cron: "0 * * * *"      # Every hour
  # - cron: "0 0 * * *"      # Daily at midnight UTC
  # - cron: "0 12 * * *"     # Daily at noon UTC
  # - cron: "0 0 * * 1"      # Weekly Monday at midnight
```

### Change Commit Author

Edit `.github/workflows/sync-leetcode.yml`:

```yaml
- name: 🔄 Sync LeetCode submissions
  env:
    LEETCODE_USERNAME: ${{ secrets.LEETCODE_USERNAME }}
    GIT_AUTHOR_NAME: "Your Name"              # ← Change this
    GIT_AUTHOR_EMAIL: "your-email@example.com" # ← Change this
  run: node scripts/sync-fixed.js
```

### Only Sync Specific Languages

Edit `scripts/sync-fixed.js` around line 140:

```javascript
// Add this to filter languages
const ALLOWED_LANGUAGES = ['python3', 'javascript']; // Only Python & JS

if (!ALLOWED_LANGUAGES.includes(lang)) {
  console.log(`Skipping ${lang}: Not in allowed languages`);
  continue;
}
```

---

## 🆘 Troubleshooting

### ❌ "Workflow is disabled"
**Fix:** Enable it in Actions tab

### ❌ "Secret not found" or "Secret LEETCODE_USERNAME not set"
**Fix:** Add the secret to repo settings:
- Go to: Settings → Secrets and variables → Actions → New repository secret
- Name: `LEETCODE_USERNAME`
- Value: Your LeetCode username

### ❌ Workflow runs but no new commits
**Check:**
1. Do you have accepted LeetCode submissions?
2. Is your username correct? (case-sensitive)
3. Check Actions logs for error messages
4. Try running locally: `LEETCODE_USERNAME=your_user npm run sync`

### ❌ "403 Forbidden" or "Unauthorized"
**This should NOT happen with v2!** But if it does:
- Your username might be wrong
- LeetCode API might be temporarily down
- Check GitHub Actions logs for details

### ❌ "Cannot find module 'axios'" or "simple-git"
**Fix:**
```bash
npm install
npm run sync
```

---

## 📱 Mobile App Support

Your mobile app submissions are **automatically synced**:
1. Submit solution on LeetCode mobile app
2. Solution must be **Accepted**
3. Wait for next workflow run (max 6 hours)
4. Solution auto-commits to GitHub ✅

**No extra setup needed!**

---

## 🎯 Quick Checklist

- [ ] Add `LEETCODE_USERNAME` secret to repo
- [ ] Enable workflow in Actions tab
- [ ] Verify workflow ran (check Actions tab)
- [ ] Check for new commits from "LeetCode-Bot"
- [ ] See problem folders with `solution.py`, `solution.java`, etc.
- [ ] Celebrate! 🎉

---

## 📊 Files Changed in This Update

| File | Change | Purpose |
|------|--------|---------|
| `scripts/sync-fixed.js` | ✨ NEW | Improved sync with better error handling |
| `.github/workflows/sync-leetcode.yml` | ✨ NEW | Automated GitHub Actions workflow |
| `package.json` | Updated | Points to new sync script |
| `README.md` | Updated | Full documentation |
| `SETUP.md` | ✨ NEW | This file - quick setup guide |

---

## 🔐 Security Notes

- ✅ Your username is stored as a GitHub Secret (encrypted)
- ✅ No CSRF tokens or session cookies needed
- ✅ Only reads your public LeetCode submission history
- ✅ No personal data is exposed
- ✅ Bot commits are clearly labeled

---

## 🚀 Next Steps

1. **Complete the 3-step setup above** ⬆️
2. **Wait for first sync** (or manually trigger)
3. **Check your repo** for new problem folders
4. **Start submitting on LeetCode** - they auto-sync!
5. **Customize** the schedule/author if needed

---

**Questions?** Check the main README.md for more details!
