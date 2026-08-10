import axios from "axios";
import fs from "fs";
import path from "path";
import { simpleGit } from "simple-git";

const git = simpleGit();

const LEETCODE_USERNAME = process.env.LEETCODE_USERNAME || "";
const LEETCODE_SESSION = process.env.LEETCODE_SESSION || "";
const LEETCODE_CSRF_TOKEN = process.env.LEETCODE_CSRF_TOKEN || "";

const MAX_PAGES = 20;
const PAGE_SIZE = 20;

const client = axios.create({
  baseURL: "https://leetcode.com",
  timeout: 20000,
  headers: {
    "User-Agent":
      "Mozilla/5.0 (Linux; Android 10) AppleWebKit/537.36 Chrome/140 Mobile Safari/537.36",
    "Content-Type": "application/json",
    Accept: "application/json",
    Referer: "https://leetcode.com/",
    Origin: "https://leetcode.com",
  },
});

if (LEETCODE_SESSION) {
  client.defaults.headers.Cookie =
    `LEETCODE_SESSION=${LEETCODE_SESSION}; ` +
    `csrftoken=${LEETCODE_CSRF_TOKEN}`;
}

if (LEETCODE_CSRF_TOKEN) {
  client.defaults.headers["x-csrftoken"] = LEETCODE_CSRF_TOKEN;
}

function getExistingProblems() {
  const problems = new Set();

  for (const item of fs.readdirSync(".")) {
    if (!fs.statSync(item).isDirectory()) continue;

    /*
      Existing folders normally look like:
      0001-two-sum
      0015-3sum
      etc.
    */

    const match = item.match(/^(\d+)-(.+)$/);

    if (match) {
      problems.add(match[2].toLowerCase());
    }
  }

  return problems;
}

async function getSubmissions() {
  let offset = 0;
  let lastKey = null;
  const accepted = [];

  for (let page = 0; page < MAX_PAGES; page++) {
    console.log(`Checking LeetCode submissions page ${page + 1}...`);

    const query = `
      query submissionList(
        $offset: Int!
        $limit: Int!
        $lastKey: String
      ) {
        submissionList(
          offset: $offset
          limit: $limit
          lastKey: $lastKey
        ) {
          lastKey
          submissions {
            id
            title
            titleSlug
            statusDisplay
            lang
            timestamp
            runtime
            memory
          }
        }
      }
    `;

    const response = await client.post("/graphql", {
      operationName: "submissionList",
      variables: {
        offset,
        limit: PAGE_SIZE,
        lastKey,
      },
      query,
    });

    if (response.data.errors) {
      throw new Error(
        JSON.stringify(response.data.errors)
      );
    }

    const data = response.data?.data?.submissionList;

    if (!data || !data.submissions) {
      break;
    }

    for (const submission of data.submissions) {
      if (submission.statusDisplay === "Accepted") {
        accepted.push(submission);
      }
    }

    if (!data.lastKey || data.submissions.length < PAGE_SIZE) {
      break;
    }

    lastKey = data.lastKey;
    offset += PAGE_SIZE;
  }

  return accepted;
}

async function getSubmissionCode(submissionId) {
  const query = `
    query submissionDetails($submissionId: Int!) {
      submissionDetails(submissionId: $submissionId) {
        code
        lang {
          name
          verboseName
        }
        question {
          questionId
          title
          titleSlug
        }
      }
    }
  `;

  try {
    const response = await client.post("/graphql/", {
      operationName: "submissionDetails",
      variables: {
        submissionId: Number(submissionId),
      },
      query,
    });

    if (response.data.errors) {
      throw new Error(
        JSON.stringify(response.data.errors)
      );
    }

    const detail =
      response.data?.data?.submissionDetails;

    if (!detail) {
      throw new Error(
        "LeetCode returned no submission details."
      );
    }

    // Convert LeetCode's language object
    // into the language string our script expects.
    detail.lang = detail.lang?.name || "";

    return detail;
  } catch (error) {
    console.error(
      `Request failed for submission ${submissionId}:`,
      error.response?.status || "unknown"
    );

    if (error.response?.data) {
      console.error(
        JSON.stringify(error.response.data)
      );
    }

    throw error;
  }
}

function getExtension(lang) {
  const extensions = {
    python: "py",
    python3: "py",
    javascript: "js",
    typescript: "ts",
    java: "java",
    cpp: "cpp",
    "c++": "cpp",
    csharp: "cs",
    "c#": "cs",
    golang: "go",
    rust: "rs",
    swift: "swift",
    kotlin: "kt",
    ruby: "rb",
    php: "php",
    scala: "scala",
    dart: "dart",
  };

  return extensions[(lang || "").toLowerCase()] || "txt";
}

async function sync() {
  if (!LEETCODE_USERNAME) {
    throw new Error("LEETCODE_USERNAME secret is missing.");
  }

  if (!LEETCODE_SESSION) {
    throw new Error("LEETCODE_SESSION secret is missing.");
  }

  console.log(
    `Checking LeetCode account: ${LEETCODE_USERNAME}`
  );

  const existingProblems = getExistingProblems();

  console.log(
    `Existing solution folders: ${existingProblems.size}`
  );

  const submissions = await getSubmissions();

  console.log(
    `Accepted submissions found: ${submissions.length}`
  );

  /*
    Keep only the latest accepted submission for each problem.
    This prevents multiple accepted submissions of the same
    problem from creating duplicate files.
  */

  const latest = new Map();

  for (const submission of submissions) {
    const slug = submission.titleSlug?.toLowerCase();

    if (!slug) continue;

    if (!latest.has(slug)) {
      latest.set(slug, submission);
    }
  }

  let synced = 0;

  for (const submission of latest.values()) {
    const slug = submission.titleSlug.toLowerCase();

    /*
      IMPORTANT:
      If this problem folder already exists,
      it is considered synced.
    */

    if (existingProblems.has(slug)) {
      console.log(
        `✓ Already synced: ${submission.title}`
      );
      continue;
    }

    console.log(
      `\n📥 NEW PROBLEM: ${submission.title}`
    );

    let detail;

    try {
      detail = await getSubmissionCode(submission.id);
    } catch (error) {
      console.error(
        `❌ Could not get code for ${submission.title}`
      );
      console.error(error.message);
      continue;
    }

    if (!detail || !detail.code) {
      console.log(
        `⚠️ No code returned for ${submission.title}`
      );
      continue;
    }

    const questionId =
      String(detail.question?.questionId || "0000")
        .padStart(4, "0");

    const title =
      detail.question?.title ||
      submission.title;

    const titleSlug =
      detail.question?.titleSlug ||
      submission.titleSlug;

    const folder =
      `${questionId}-${titleSlug}`;

    fs.mkdirSync(folder, {
      recursive: true,
    });

    const extension =
      getExtension(
        detail.lang || submission.lang
      );

    const solutionPath =
      path.join(
        folder,
        `solution.${extension}`
      );

    fs.writeFileSync(
      solutionPath,
      detail.code
    );

    const metadata = {
      questionId,
      questionTitle: title,
      questionSlug: titleSlug,
      submissionId: submission.id,
      language: detail.lang || submission.lang,
      timestamp: submission.timestamp,
      runtime: submission.runtime,
      memory: submission.memory,
    };

    fs.writeFileSync(
      path.join(folder, "metadata.json"),
      JSON.stringify(metadata, null, 2)
    );

    await git.add([
      solutionPath,
      path.join(folder, "metadata.json"),
    ]);

    await git.commit(
      `feat: add LeetCode ${questionId} - ${title}`,
      [],
      {
        "--author":
          `"LeetCode-Bot <bot@leetcode-sync.dev>"`,
      }
    );

    console.log(
      `✅ Committed: ${questionId} - ${title}`
    );

    synced++;
  }

  console.log(
    `\n🎉 Sync finished. New problems synced: ${synced}`
  );
}

sync().catch((error) => {
  console.error("\n❌ SYNC FAILED");
  console.error(error.message);
  process.exit(1);
});
