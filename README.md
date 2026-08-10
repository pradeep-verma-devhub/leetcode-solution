# 🎯 LeetCode Auto-Sync to GitHub

Automatically sync your accepted LeetCode solutions to GitHub with **zero 403 errors** and support for both **PC and mobile app submissions**.

---

## ✨ Features

✅ **No CSRF Token Issues** - Uses robust API endpoints with proper headers  
✅ **Auto-Commit** - Every accepted solution automatically commits to GitHub  
✅ **Mobile & PC Support** - Works with LeetCode web, VSCode extension, and mobile app  
✅ **Metadata Tracking** - Stores problem details, language, runtime, memory  
✅ **GitHub Actions** - Runs automatically every 6 hours (customizable)  
✅ **Error Recovery** - Fallback mechanisms and retry logic  
✅ **No Duplicates** - Tracks synced problems to avoid re-committing  

---

## 🚀 Quick Setup (3 Steps)

### Step 1: Add GitHub Secret
Go to your repo → **Settings** → **Secrets and variables** → **Actions** → **New repository secret**

| Name | Value |
|------|-------|
| `LEETCODE_USERNAME` | Your LeetCode username |

### Step 2: Configure Git Bot (Optional)
If you want custom commit author, update `.github/workflows/sync-leetcode.yml`:
```yaml
- name: 🔄 Sync LeetCode submissions
  env:
    LEETCODE_USERNAME: ${{ secrets.LEETCODE_USERNAME }}
    GIT_AUTHOR_NAME: "Your Name"
    GIT_AUTHOR_EMAIL: "your-email@example.com"
  run: node scripts/sync-fixed.js
```

### Step 3: Enable Workflow
Go to **Actions** tab → Select **🤖 Auto-Sync LeetCode Submissions** → Click **Enable workflow**

**Done!** ✅ Your submissions will sync automatically every 6 hours.

---

## 🎮 Manual Usage

Run locally on your PC:

```bash
# Install dependencies
npm install

# Set your LeetCode username
export LEETCODE_USERNAME="your_username"

# Run sync
npm run sync
```

---

## 📁 Repository Structure After Sync

```
leetcode-solution/
├── 0001-two-sum/
│   ├── solution.py
│   └── metadata.json
├── 0002-add-two-numbers/
│   ├── solution.java
│   └── metadata.json
├── scripts/
│   ├── sync.js (old version)
│   └── sync-fixed.js (improved version) ✨
├── .github/workflows/
│   └── sync-leetcode.yml (automation)
├── tracked-problems.json (tracking file)
└── package.json
```

### Metadata Example
Each problem includes a `metadata.json` file:
```json
{
  "questionId": "0001",
  "questionTitle": "Two Sum",
  "questionSlug": "two-sum",
  "submissionId": 123456789,
  "language": "python3",
  "timestamp": 1628765432,
  "runtime": "45ms",
  "memory": "13.9MB"
}
```

---

## 🔧 Troubleshooting

### ❌ Workflow shows "403 Forbidden"
**Solution:** Check if `LEETCODE_USERNAME` secret is properly set:
```bash
# Verify in GitHub Actions logs
```

### ❌ No commits appearing
**Check:**
1. Workflow is enabled in Actions tab
2. `LEETCODE_USERNAME` is correct (case-sensitive)
3. You have accepted LeetCode submissions

### ❌ Duplicate commits
**Fixed in v2:** The script now tracks synced problems in `tracked-problems.json`

### ❌ "simple-git" or "axios" error
```bash
npm install
npm run sync
```

---

## ⚙️ Advanced Configuration

### Change Sync Frequency
Edit `.github/workflows/sync-leetcode.yml`:
```yaml
schedule:
  - cron: "0 */6 * * *"  # Every 6 hours
  # - cron: "0 * * * *"  # Every hour
  # - cron: "0 0 * * *"  # Daily at midnight
```

### Filter by Language
Modify `scripts/sync-fixed.js` line ~140:
```javascript
// Only sync Python solutions
if (lang !== 'python3') continue;
```

### Custom Commit Messages
Edit line ~113 in `sync-fixed.js`:
```javascript
await git.commit(
  `feat: solve LeetCode ${problemId} - ${problemTitle} [${lang}]`
);
```

---

## 📊 Workflow Trigger Options

1. **Automatic** (Every 6 hours) - Configured by default
2. **Manual** - Go to Actions → 🤖 Auto-Sync → Run workflow
3. **On Push** - Add to `.github/workflows/sync-leetcode.yml`:
   ```yaml
   on:
     push:
       branches: [main]
     schedule:
       - cron: "0 */6 * * *"
   ```

---

## 🔐 Security

- ✅ No credentials stored in code
- ✅ Uses GitHub Secrets for sensitive data
- ✅ No CSRF tokens needed (uses public API)
- ✅ Read-only LeetCode API calls
- ✅ Bot commits are clearly labeled

---

## 📱 Mobile App Support

LeetCode mobile app submissions are **automatically detected** when:
1. You submit via mobile app
2. Sync runs (every 6 hours)
3. New accepted solutions are found

**No extra setup needed!** The script polls your submission history.

---

## 🐛 What's Fixed from v1?

| Issue | v1 (sync.js) | v2 (sync-fixed.js) |
|-------|--------------|-------------------|
| 403 Forbidden Error | ❌ CSRF tokens fail | ✅ Proper headers + fallback |
| Mobile submissions | ❌ Not supported | ✅ Auto-detected |
| Duplicate commits | ⚠️ Manual tracking | ✅ Automatic tracking |
| Error handling | ❌ Single point failure | ✅ Fallback to GraphQL |
| Git commits | ❌ Batch commits | ✅ Individual per problem |
| Metadata | ❌ Not stored | ✅ JSON metadata files |

---

## 📝 Example Commit History

```
fc28160 chore: update package.json to use improved sync script
0eaa8da ci: add GitHub Actions workflow for auto-syncing LeetCode submissions
2fe3937 fix: improve LeetCode API sync with better error handling
chore: add LeetCode 0001 - Two Sum (python3)
chore: add LeetCode 0002 - Add Two Numbers (java)
chore: add LeetCode 0003 - Longest Substring (cpp)
```

---

## 🎓 Next Steps

1. ✅ Add `LEETCODE_USERNAME` secret
2. ✅ Enable workflow in Actions
3. ✅ Wait for first auto-run (or manually trigger)
4. ✅ Check your repo for new commits
5. ✅ Celebrate! 🎉

---

## 💡 Tips

- **Keep it updated:** Check this repo for improvements
- **Multi-language:** Script supports Python, Java, C++, Go, Rust, TypeScript, and more
- **Backup:** Your solutions are now version-controlled on GitHub
- **Portfolio:** Showcase your LeetCode journey on your GitHub profile

---

## 📞 Support

If you face issues:
1. Check GitHub Actions logs: **Actions** → **🤖 Auto-Sync** → Failed run
2. Run locally: `npm run sync` (with `LEETCODE_USERNAME` env var)
3. Verify credentials are correct

---

## 📄 License

MIT - Feel free to use and modify!

---

**Made with ❤️ for LeetCode enthusiasts**
