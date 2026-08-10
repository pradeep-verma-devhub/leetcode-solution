import axios from "axios";
import fs from "fs";
import { simpleGit } from "simple-git";
import path from "path";

const git = simpleGit();

// Configuration
const LEETCODE_USERNAME = process.env.LEETCODE_USERNAME || "";
const GIT_AUTHOR_NAME = process.env.GIT_AUTHOR_NAME || "LeetCode Bot";
const GIT_AUTHOR_EMAIL = process.env.GIT_AUTHOR_EMAIL || "bot@leetcode-sync.dev";

// Create axios instance with proper headers
const leetcodeClient = axios.create({
  baseURL: "https://leetcode.com/api",
  timeout: 10000,
  headers: {
    "User-Agent":
      "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36",
    "Content-Type": "application/json",
    Accept: "application/json",
    Referer: "https://leetcode.com",
  },
});

async function fetchLeetCodeSubmissions() {
  try {
    if (!LEETCODE_USERNAME) {
      throw new Error(
        "LEETCODE_USERNAME not set. Set it as environment variable."
      );
    }

    console.log(`Fetching submissions for user: ${LEETCODE_USERNAME}`);

    // Use public API endpoint (more reliable than GraphQL)
    const response = await leetcodeClient.get(
      `/submissions/?offset=0&limit=100&lastkey=`
    );

    if (!response.data.submissions) {
      console.warn("No submissions found or API response unexpected");
      return [];
    }

    // Filter only accepted solutions
    return response.data.submissions.filter(
      (sub) => sub.status_code === 10 // 10 = Accepted
    );
  } catch (error) {
    console.error(
      "Error fetching submissions:",
      error.response?.status,
      error.message
    );

    // Fallback: Try GraphQL with proper headers
    return await fetchWithGraphQL();
  }
}

async function fetchWithGraphQL() {
  try {
    const response = await axios.post("https://leetcode.com/graphql", {
      operationName: "getSubmissions",
      variables: {
        offset: 0,
        limit: 100,
        lastKey: null,
      },
      query: `
        query getSubmissions($offset: Int!, $limit: Int!, $lastKey: String) {
          submissionList(offset: $offset, limit: $limit, lastKey: $lastKey) {
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
            lastKey
          }
        }
      `,
    });

    if (response.data.errors) {
      throw new Error(`GraphQL Error: ${JSON.stringify(response.data.errors)}`);
    }

    return response.data.data.submissionList.submissions.filter(
      (sub) => sub.statusDisplay === "Accepted"
    );
  } catch (error) {
    console.error("GraphQL fallback also failed:", error.message);
    return [];
  }
}

async function getSubmissionCode(submissionId) {
  try {
    // Try the direct detail endpoint first
    const response = await axios.post("https://leetcode.com/graphql", {
      operationName: "getSubmissionDetail",
      variables: {
        submissionId: submissionId,
      },
      query: `
        query getSubmissionDetail($submissionId: Int!) {
          submissionDetail(submissionId: $submissionId) {
            code
            lang
            question {
              questionId
              title
              titleSlug
            }
          }
        }
      `,
    });

    if (response.data.errors) {
      console.warn(
        `Couldn't fetch code for submission ${submissionId}:`,
        response.data.errors[0]?.message
      );
      return null;
    }

    return response.data.data.submissionDetail;
  } catch (error) {
    console.error(
      `Error fetching submission ${submissionId}:`,
      error.message
    );
    return null;
  }
}

async function syncSolutions(submissions) {
  const trackedFile = "tracked-problems.json";
  let tracked = {};

  if (fs.existsSync(trackedFile)) {
    tracked = JSON.parse(fs.readFileSync(trackedFile, "utf-8"));
  }

  let commitCount = 0;

  for (const sub of submissions) {
    try {
      const problemId = String(sub.question_id).padStart(4, "0");
      const problemSlug = sub.question.title_slug || sub.question__title_slug;
      const problemTitle = sub.question.title || sub.question__title;
      const problemDir = `${problemId}-${problemSlug}`;

      // Skip if already synced
      if (tracked[problemId] && tracked[problemId].submissionId === sub.id) {
        console.log(`✓ Problem ${problemId} (${problemTitle}) already synced`);
        continue;
      }

      console.log(`\n📥 Processing: ${problemId} - ${problemTitle}`);

      // Fetch code
      const detail = await getSubmissionCode(sub.id);
      if (!detail) {
        console.warn(`Skipping ${problemId}: Could not fetch code`);
        continue;
      }

      const code = detail.code;
      const lang = detail.lang || sub.language;

      // Create directory
      if (!fs.existsSync(problemDir)) {
        fs.mkdirSync(problemDir, { recursive: true });
      }

      const extension = getExtension(lang);
      const fileName = `solution.${extension}`;
      const filePath = path.join(problemDir, fileName);

      fs.writeFileSync(filePath, code);
      console.log(`✍️  Saved: ${filePath}`);

      // Create metadata file
      const metadataFile = path.join(problemDir, "metadata.json");
      fs.writeFileSync(
        metadataFile,
        JSON.stringify(
          {
            questionId: problemId,
            questionTitle: problemTitle,
            questionSlug: problemSlug,
            submissionId: sub.id,
            language: lang,
            timestamp: sub.timestamp,
            runtime: sub.runtime,
            memory: sub.memory,
          },
          null,
          2
        )
      );

      // Git commit
      await git.add([filePath, metadataFile]);
      await git.commit(
        `chore: add LeetCode ${problemId} - ${problemTitle} (${lang})`,
        [],
        { "--author": `"${GIT_AUTHOR_NAME} <${GIT_AUTHOR_EMAIL}>"` }
      );

      console.log(`✅ Committed: ${problemId}`);
      commitCount++;

      // Update tracking
      tracked[problemId] = {
        submissionId: sub.id,
        lastSynced: new Date().toISOString(),
      };
    } catch (error) {
      console.error(`Failed to process submission:`, error.message);
      continue;
    }
  }

  // Save tracking file
  fs.writeFileSync(trackedFile, JSON.stringify(tracked, null, 2));
  await git.add(["tracked-problems.json"]);
  if (commitCount > 0) {
    await git.commit(`chore: update tracking (synced ${commitCount} problems)`);
  }

  console.log(`\n✅ Sync complete! Committed ${commitCount} new solutions.`);
  return commitCount;
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
  };
  return extensions[lang.toLowerCase()] || "txt";
}

// Main execution
(async () => {
  try {
    const submissions = await fetchLeetCodeSubmissions();
    if (submissions.length === 0) {
      console.log("No new accepted submissions found.");
      process.exit(0);
    }
    console.log(`Found ${submissions.length} accepted submission(s)`);
    await syncSolutions(submissions);
  } catch (error) {
    console.error("Fatal error:", error.message);
    process.exit(1);
  }
})();
